import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, Download, CheckCircle2 } from 'lucide-react';

interface EventQRCodeProps {
  eventId: string;
  eventTitle: string;
  rsvpStatus: string | null;
}

export const EventQRCode: React.FC<EventQRCodeProps> = ({ eventId, eventTitle, rsvpStatus }) => {
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fetchToken = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('event_rsvps')
        .select('qr_token')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.qr_token) setQrToken(data.qr_token);

      // Check if already checked in
      const { data: checkin } = await supabase
        .from('event_checkins')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkin) setCheckedIn(true);
    };
    fetchToken();
  }, [open, eventId]);

  const downloadQR = () => {
    const svg = document.getElementById('event-qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 512, 512);
      const a = document.createElement('a');
      a.download = `${eventTitle.replace(/[^a-z0-9]/gi, '_')}-ticket.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  if (rsvpStatus !== 'going') return null;

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="text-xs h-8">
        <QrCode size={14} className="mr-1" /> My Ticket
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader><DialogTitle className="text-center">{eventTitle}</DialogTitle></DialogHeader>
          {qrToken ? (
            <div className="space-y-4 py-4">
              {checkedIn && (
                <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 rounded-lg p-3 text-sm font-medium">
                  <CheckCircle2 size={18} /> Already checked in
                </div>
              )}
              <div className="bg-white p-6 rounded-xl border border-border inline-block mx-auto">
                <QRCodeSVG
                  id="event-qr-svg"
                  value={qrToken}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
              <p className="text-xs text-muted-foreground">Show this QR code at the event entrance for check-in.</p>
              <Button variant="outline" size="sm" onClick={downloadQR}>
                <Download size={14} className="mr-2" /> Download Ticket
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm py-8">Loading your ticket...</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
