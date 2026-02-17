import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, QrCode, CheckCircle2, XCircle, Users, Loader2, Search, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SEO } from '@/components/SEO';
import { Badge } from '@/components/ui/badge';

interface CheckinRecord {
  id: string;
  user_id: string;
  checked_in_at: string;
  method: string;
}

const EventCheckinPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scanInput, setScanInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);
  const [checkins, setCheckins] = useState<CheckinRecord[]>([]);
  const [rsvpCount, setRsvpCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      const { data } = await supabase.from('events').select('*').eq('id', eventId).single();
      if (data) setEvent(data);

      const { count: rCount } = await supabase
        .from('event_rsvps').select('*', { count: 'exact', head: true })
        .eq('event_id', eventId).eq('status', 'going');
      setRsvpCount(rCount || 0);

      const { data: cData } = await supabase
        .from('event_checkins').select('*')
        .eq('event_id', eventId).order('checked_in_at', { ascending: false });
      if (cData) setCheckins(cData as CheckinRecord[]);

      setLoading(false);
    };
    fetchEvent();

    // Auto-process QR token from URL
    const token = searchParams.get('token');
    if (token) {
      setScanInput(token);
      setTimeout(() => processCheckin(token), 500);
    }
  }, [eventId]);

  const processCheckin = async (token?: string) => {
    const qrToken = token || scanInput.trim();
    if (!qrToken || !eventId) return;
    setProcessing(true);
    setLastResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('Please sign in'); setProcessing(false); return; }

      // Find RSVP by QR token
      const { data: rsvp, error: rsvpErr } = await supabase
        .from('event_rsvps')
        .select('id, user_id, status')
        .eq('event_id', eventId)
        .eq('qr_token', qrToken)
        .maybeSingle();

      if (rsvpErr || !rsvp) {
        setLastResult({ success: false, message: 'Invalid QR code — no matching RSVP found.' });
        setProcessing(false);
        return;
      }

      // Check if already checked in
      const { data: existing } = await supabase
        .from('event_checkins')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', rsvp.user_id)
        .maybeSingle();

      if (existing) {
        setLastResult({ success: false, message: 'This attendee has already been checked in.' });
        setProcessing(false);
        return;
      }

      // Create check-in
      const { error: insertErr } = await supabase.from('event_checkins').insert({
        event_id: eventId,
        rsvp_id: rsvp.id,
        user_id: rsvp.user_id,
        checked_in_by: user.id,
        method: 'qr_scan',
      });

      if (insertErr) throw insertErr;

      setLastResult({ success: true, message: 'Check-in successful!' });
      setCheckins(prev => [{ id: crypto.randomUUID(), user_id: rsvp.user_id, checked_in_at: new Date().toISOString(), method: 'qr_scan' }, ...prev]);
      toast.success('Attendee checked in!');
    } catch (err: any) {
      setLastResult({ success: false, message: err.message || 'Check-in failed' });
    } finally {
      setScanInput('');
      setProcessing(false);
      inputRef.current?.focus();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <SEO title={`Check-In: ${event?.title || 'Event'}`} description="Staff QR code check-in scanner" />
      <div className="container mx-auto px-4 max-w-2xl">
        <button onClick={() => navigate(-1)} className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-primary transition-colors mb-8">
          <div className="p-2 border border-border rounded-full group-hover:border-primary transition-colors"><ArrowLeft size={14} /></div>
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-serif text-foreground mb-2">{event?.title}</h1>
          <p className="text-muted-foreground text-sm">Scan attendee QR codes to check them in.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <Users size={20} className="mx-auto text-primary mb-1" />
            <div className="text-2xl font-bold">{rsvpCount}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">RSVPs</div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <UserCheck size={20} className="mx-auto text-green-600 mb-1" />
            <div className="text-2xl font-bold">{checkins.length}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Checked In</div>
          </div>
        </div>

        {/* Scanner Input */}
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 block">
            <QrCode size={14} className="inline mr-2" /> Scan or Enter QR Token
          </label>
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={scanInput}
              onChange={e => setScanInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && processCheckin()}
              placeholder="Paste or scan QR token..."
              autoFocus
            />
            <Button onClick={() => processCheckin()} disabled={processing || !scanInput.trim()}>
              {processing ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            </Button>
          </div>

          {/* Result Feedback */}
          {lastResult && (
            <div className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${lastResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {lastResult.success ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
              <span className="font-medium">{lastResult.message}</span>
            </div>
          )}
        </div>

        {/* Recent Check-ins */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Recent Check-ins</h3>
          </div>
          {checkins.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground text-sm">No check-ins yet.</p>
          ) : (
            <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {checkins.map(c => (
                <div key={c.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-green-600" />
                    <span className="text-sm font-mono text-muted-foreground">{c.user_id.slice(0, 8)}...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{c.method}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(c.checked_in_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCheckinPage;
