/**
 * Report runtime errors to Supabase `error_logs` table for staff triage.
 * Safely no-ops on failure so errors never bubble up.
 */
import { supabase } from '@/integrations/supabase/client';

export interface ReportErrorArgs {
  message: string;
  stack?: string;
  route?: string;
  metadata?: Record<string, any>;
}

export async function reportError(args: ReportErrorArgs): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('error_logs').insert({
      user_id: user?.id || null,
      route: args.route || (typeof window !== 'undefined' ? window.location.pathname : null),
      message: args.message.substring(0, 2000),
      stack: args.stack?.substring(0, 5000) || null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      metadata: args.metadata || {},
    });
  } catch {
    // Never let logging failures break the app
  }
}
