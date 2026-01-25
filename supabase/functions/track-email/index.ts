import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

// 1x1 transparent GIF pixel
const TRACKING_PIXEL = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 
  0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 
  0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 
  0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44, 
  0x01, 0x00, 0x3b
]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const campaignId = url.searchParams.get("c");
  const email = url.searchParams.get("e");
  const eventType = url.searchParams.get("t"); // 'open' or 'click'
  const linkUrl = url.searchParams.get("l"); // For click tracking

  // Validate required params
  if (!campaignId || !email || !eventType) {
    // Return pixel anyway to not break email display
    if (eventType === "open") {
      return new Response(TRACKING_PIXEL, {
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          ...corsHeaders,
        },
      });
    }
    return new Response("Missing parameters", { status: 400, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user agent and IP for analytics
    const userAgent = req.headers.get("user-agent") || null;
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || 
                      req.headers.get("cf-connecting-ip") || null;

    // Decode the email
    const decodedEmail = decodeURIComponent(email);
    const decodedLinkUrl = linkUrl ? decodeURIComponent(linkUrl) : null;

    // Check if this is a unique event (first open/click for this campaign + email combo)
    const { data: existingEvents } = await supabase
      .from("email_tracking")
      .select("id")
      .eq("campaign_id", campaignId)
      .eq("subscriber_email", decodedEmail)
      .eq("event_type", eventType)
      .limit(1);

    const isUnique = !existingEvents || existingEvents.length === 0;

    // Record the tracking event
    await supabase.from("email_tracking").insert({
      campaign_id: campaignId,
      subscriber_email: decodedEmail,
      event_type: eventType,
      link_url: decodedLinkUrl,
      user_agent: userAgent,
      ip_address: ipAddress,
    });

    // Update campaign stats using RPC functions
    try {
      if (eventType === "open") {
        await supabase.rpc("increment_campaign_opens", { 
          campaign_uuid: campaignId, 
          is_unique: isUnique 
        });
      } else if (eventType === "click") {
        await supabase.rpc("increment_campaign_clicks", { 
          campaign_uuid: campaignId, 
          is_unique: isUnique 
        });
      }
    } catch (rpcError) {
      console.log("RPC call failed, stats may not be updated:", rpcError);
    }

    // Return appropriate response
    if (eventType === "open") {
      // Return tracking pixel for open events
      return new Response(TRACKING_PIXEL, {
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
          ...corsHeaders,
        },
      });
    } else if (eventType === "click" && decodedLinkUrl) {
      // Redirect to actual URL for click events
      return new Response(null, {
        status: 302,
        headers: {
          "Location": decodedLinkUrl,
          ...corsHeaders,
        },
      });
    }

    return new Response("OK", { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error("Tracking error:", error);
    
    // Always return pixel for opens to not break email
    if (eventType === "open") {
      return new Response(TRACKING_PIXEL, {
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          ...corsHeaders,
        },
      });
    }
    
    // For clicks, redirect to the original URL if available
    if (eventType === "click" && linkUrl) {
      return new Response(null, {
        status: 302,
        headers: {
          "Location": decodeURIComponent(linkUrl),
          ...corsHeaders,
        },
      });
    }

    return new Response("Error", { status: 500, headers: corsHeaders });
  }
};

serve(handler);
