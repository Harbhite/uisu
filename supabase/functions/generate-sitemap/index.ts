import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.89.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const baseUrl = 'https://uisu-archive.lovable.app';
    
    // Static pages
    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/governance', priority: '0.8', changefreq: 'weekly' },
      { loc: '/current-leaders', priority: '0.8', changefreq: 'weekly' },
      { loc: '/past-leaders', priority: '0.7', changefreq: 'monthly' },
      { loc: '/documents', priority: '0.7', changefreq: 'weekly' },
      { loc: '/campus-map', priority: '0.6', changefreq: 'monthly' },
      { loc: '/communities', priority: '0.7', changefreq: 'weekly' },
      { loc: '/events', priority: '0.8', changefreq: 'daily' },
      { loc: '/announcements', priority: '0.9', changefreq: 'daily' },
      { loc: '/inks-vault', priority: '0.8', changefreq: 'daily' },
      { loc: '/tools', priority: '0.6', changefreq: 'monthly' },
      { loc: '/auth', priority: '0.3', changefreq: 'yearly' },
    ];

    // Fetch published ink pieces
    const { data: inkPieces, error: inkError } = await supabase
      .from('ink_pieces')
      .select('id, updated_at')
      .eq('is_published', true)
      .order('updated_at', { ascending: false });

    if (inkError) {
      console.error('Error fetching ink pieces:', inkError);
    }

    // Fetch events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, updated_at')
      .order('event_date', { ascending: false })
      .limit(100);

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
    }

    // Fetch active leaders
    const { data: leaders, error: leadersError } = await supabase
      .from('leaders')
      .select('id, updated_at')
      .eq('is_active', true);

    if (leadersError) {
      console.error('Error fetching leaders:', leadersError);
    }

    // Generate XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add static pages
    for (const page of staticPages) {
      xml += `  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Add ink pieces
    if (inkPieces && inkPieces.length > 0) {
      for (const piece of inkPieces) {
        const lastmod = piece.updated_at ? new Date(piece.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        xml += `  <url>
    <loc>${baseUrl}/inks-vault/piece/${piece.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }
    }

    // Add leader detail pages
    if (leaders && leaders.length > 0) {
      for (const leader of leaders) {
        const lastmod = leader.updated_at ? new Date(leader.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        xml += `  <url>
    <loc>${baseUrl}/current-leaders/${leader.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;
      }
    }

    xml += `</urlset>`;

    console.log(`Generated sitemap with ${staticPages.length} static pages, ${inkPieces?.length || 0} ink pieces, and ${leaders?.length || 0} leaders`);

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate sitemap' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
