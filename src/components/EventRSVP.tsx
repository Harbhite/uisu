import React, { useState, useEffect } from 'react';
import { Check, HelpCircle, X, CalendarPlus, Users, Loader2, Bell, BellOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { EventQRCode } from '@/components/EventQRCode';

type RSVPStatus = 'going' | 'maybe' | 'not_going' | null;

interface EventRSVPProps {
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  eventTime?: string;
  eventLocation?: string;
  className?: string;
}

export const EventRSVP: React.FC<EventRSVPProps> = ({
  eventId,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  className = ''
}) => {
  const [status, setStatus] = useState<RSVPStatus>(null);
  const [goingCount, setGoingCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reminders, setReminders] = useState({ remind_24h: false, remind_1h: false });

  useEffect(() => {
    const fetchRSVPData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Get user's RSVP status
        const { data: rsvpData } = await supabase
          .from('event_rsvps')
          .select('status, remind_24h, remind_1h')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (rsvpData) {
          setStatus(rsvpData.status as RSVPStatus);
          setReminders({ remind_24h: rsvpData.remind_24h || false, remind_1h: rsvpData.remind_1h || false });
        }
      }

      // Get count of "going" RSVPs
      const { count } = await supabase
        .from('event_rsvps')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'going');
      
      if (count !== null) {
        setGoingCount(count);
      }
    };

    fetchRSVPData();
  }, [eventId]);

  const handleRSVP = async (newStatus: RSVPStatus) => {
    if (!userId) {
      toast.error('Please sign in to RSVP');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (newStatus === status) {
        // Remove RSVP
        const { error } = await supabase
          .from('event_rsvps')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', userId);

        if (error) throw error;
        
        if (status === 'going') setGoingCount(prev => Math.max(0, prev - 1));
        setStatus(null);
        toast.success('RSVP removed');
      } else {
        // Upsert RSVP
        const { error } = await supabase
          .from('event_rsvps')
          .upsert(
            { event_id: eventId, user_id: userId, status: newStatus },
            { onConflict: 'event_id,user_id' }
          );

        if (error) throw error;

        // Update going count
        if (newStatus === 'going' && status !== 'going') {
          setGoingCount(prev => prev + 1);
        } else if (status === 'going' && newStatus !== 'going') {
          setGoingCount(prev => Math.max(0, prev - 1));
        }
        
        setStatus(newStatus);
        toast.success(`RSVP'd as ${newStatus === 'going' ? 'Going' : newStatus === 'maybe' ? 'Maybe' : 'Not Going'}`);
      }
    } catch (error) {
      console.error('Error updating RSVP:', error);
      toast.error('Failed to update RSVP');
    } finally {
      setLoading(false);
    }
  };

  const generateICS = () => {
    const startDate = eventDate;
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hour event

    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//UISU Archive//Events//EN
BEGIN:VEVENT
UID:${eventId}@uisu.lovable.app
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${eventTitle}
${eventLocation ? `LOCATION:${eventLocation}` : ''}
DESCRIPTION:Event from UISU Archive
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${eventTitle.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    toast.success('Calendar file downloaded');
  };

  const buttonClass = (buttonStatus: RSVPStatus) => `
    flex-1 py-2 px-3 text-[10px] font-bold uppercase tracking-widest transition-all border
    ${status === buttonStatus 
      ? buttonStatus === 'going' 
        ? 'bg-green-600 text-white border-green-600' 
        : buttonStatus === 'maybe'
          ? 'bg-yellow-500 text-white border-yellow-500'
          : 'bg-red-500 text-white border-red-500'
      : 'bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground'
    }
  `;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* RSVP Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => handleRSVP('going')}
          disabled={loading}
          className={buttonClass('going')}
        >
          {loading ? <Loader2 size={12} className="animate-spin mx-auto" /> : <><Check size={12} className="inline mr-1" /> Going</>}
        </button>
        <button
          onClick={() => handleRSVP('maybe')}
          disabled={loading}
          className={buttonClass('maybe')}
        >
          <HelpCircle size={12} className="inline mr-1" /> Maybe
        </button>
        <button
          onClick={() => handleRSVP('not_going')}
          disabled={loading}
          className={buttonClass('not_going')}
        >
          <X size={12} className="inline mr-1" /> No
        </button>
      </div>

      {/* Stats, QR & Calendar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users size={14} className="text-green-600" />
          <span>{goingCount} going</span>
        </div>
        <div className="flex items-center gap-2">
          <EventQRCode eventId={eventId} eventTitle={eventTitle} rsvpStatus={status} />
          <Button
            variant="ghost"
            size="sm"
            onClick={generateICS}
            className="text-xs h-8 px-3"
          >
            <CalendarPlus size={14} className="mr-1" />
            Add to Calendar
          </Button>
        </div>
      </div>

      {/* Reminder toggles (shown when RSVP'd as going/maybe) */}
      {status && status !== 'not_going' && (
        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <Bell size={12} className="text-muted-foreground shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reminders</span>
          {[
            { key: 'remind_24h' as const, label: '24h before' },
            { key: 'remind_1h' as const, label: '1h before' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={async () => {
                const newVal = !reminders[key];
                setReminders(prev => ({ ...prev, [key]: newVal }));
                await supabase
                  .from('event_rsvps')
                  .update({ [key]: newVal } as any)
                  .eq('event_id', eventId)
                  .eq('user_id', userId!);
                toast.success(newVal ? `Reminder set: ${label}` : 'Reminder removed');
              }}
              className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded transition-all ${
                reminders[key]
                  ? 'bg-accent/15 text-accent border border-accent/30'
                  : 'bg-muted text-muted-foreground border border-border hover:border-accent/50'
              }`}
            >
              {reminders[key] ? '✓' : ''} {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
