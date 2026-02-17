import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, XCircle, Users, Loader2, Search, UserCheck, Camera, Upload, Keyboard, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SEO } from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QRScanner from '@/components/QRScanner';
import { Html5Qrcode } from 'html5-qrcode';

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
  const [showScanner, setShowScanner] = useState(false);
  const [isScanningFile, setIsScanningFile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setShowScanner(false);

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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Check-in failed';
      setLastResult({ success: false, message: errorMessage });
    } finally {
      setScanInput('');
      setProcessing(false);
      // Only focus manual input if on that tab? For now, we'll let user re-engage.
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningFile(true);
    setLastResult(null);

    const readerId = "reader-hidden";
    // Ensure the element exists before initializing
    if (!document.getElementById(readerId)) {
        console.error("Reader element not found");
        setIsScanningFile(false);
        return;
    }

    try {
      const html5QrCode = new Html5Qrcode(readerId, { verbose: false });

      const decodedText = await html5QrCode.scanFile(file, false);
      html5QrCode.clear();

      processCheckin(decodedText);
    } catch (err) {
      console.error("Error scanning file", err);
      setLastResult({ success: false, message: 'Could not read QR code from image.' });
    } finally {
      setIsScanningFile(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
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

      {showScanner && (
        <QRScanner
          onScan={(decodedText) => processCheckin(decodedText)}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Hidden container for file scanning */}
      <div id="reader-hidden" className="hidden"></div>

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

        {/* Check-in Station Card */}
        <div className="bg-white rounded-xl border border-border overflow-hidden mb-6">
            <div className="p-4 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                    <Scan size={16} /> Check-in Station
                </h3>
            </div>

            <Tabs defaultValue="scan" className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-auto">
                    <TabsTrigger value="scan" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4">
                        <Camera size={16} className="mr-2" /> Camera
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4">
                        <Upload size={16} className="mr-2" /> Upload
                    </TabsTrigger>
                    <TabsTrigger value="manual" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4">
                        <Keyboard size={16} className="mr-2" /> Manual
                    </TabsTrigger>
                </TabsList>

                <div className="p-6">
                    <TabsContent value="scan" className="mt-0 space-y-4">
                        <div className="text-center py-8 border-2 border-dashed border-border rounded-xl bg-slate-50">
                             <div className="mb-4 flex justify-center">
                                 <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                     <Camera size={32} />
                                 </div>
                             </div>
                             <h4 className="font-medium mb-1">Camera Check-in</h4>
                             <p className="text-sm text-muted-foreground mb-6">Use your device camera to scan tickets</p>
                             <Button onClick={() => setShowScanner(true)} size="lg" className="w-full max-w-xs">
                                Open Camera
                             </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="upload" className="mt-0 space-y-4">
                        <div className="text-center py-8 border-2 border-dashed border-border rounded-xl bg-slate-50 relative">
                             <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={handleFileUpload}
                                ref={fileInputRef}
                                disabled={isScanningFile}
                             />
                             <div className="mb-4 flex justify-center">
                                 <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                     {isScanningFile ? <Loader2 size={32} className="animate-spin" /> : <Upload size={32} />}
                                 </div>
                             </div>
                             <h4 className="font-medium mb-1">{isScanningFile ? "Scanning..." : "Upload QR Image"}</h4>
                             <p className="text-sm text-muted-foreground mb-6">Click or drag a QR code image here</p>
                             <Button variant="outline" className="w-full max-w-xs pointer-events-none">
                                {isScanningFile ? "Processing..." : "Select File"}
                             </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="manual" className="mt-0 space-y-4">
                        <div className="space-y-4">
                            <div className="text-center mb-6">
                                <p className="text-sm text-muted-foreground">Enter the alphanumeric code from the ticket</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Input
                                    ref={inputRef}
                                    value={scanInput}
                                    onChange={e => setScanInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && processCheckin()}
                                    placeholder="e.g. EVT-123456"
                                    className="text-center text-lg h-14 tracking-widest font-mono uppercase"
                                />
                                <Button size="lg" onClick={() => processCheckin()} disabled={processing || !scanInput.trim()} className="h-12">
                                    {processing ? <Loader2 size={16} className="animate-spin mr-2" /> : <Search size={16} className="mr-2" />}
                                    Check In
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>

            {/* Result Feedback */}
            {lastResult && (
                <div className={`border-t p-4 flex items-center justify-center gap-3 animate-in slide-in-from-top-2 ${lastResult.success ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
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
