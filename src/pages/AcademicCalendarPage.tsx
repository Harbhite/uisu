import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Plus, Trash2, Edit2, Star, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, differenceInDays, differenceInHours, isPast, isToday, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';


const EVENT_TYPES = [
  { value: 'exam', label: 'Exams', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  { value: 'registration', label: 'Registration', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'holiday', label: 'Holiday', color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'deadline', label: 'Deadline', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'general', label: 'General', color: 'bg-secondary text-secondary-foreground border-border' },
];

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  event_type: string;
  is_important: boolean;
  created_by: string | null;
}

const AcademicCalendarPage = () => {
  const { isStaff } = useAdminCheck();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', event_date: '', end_date: '', event_type: 'general', is_important: false });

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase.from('academic_calendar').select('*').order('event_date', { ascending: true });
    if (!error && data) setEvents(data);
    setLoading(false);
  };

  const upcomingEvents = useMemo(() => {
    return events.filter(e => !isPast(new Date(e.event_date)) || isToday(new Date(e.event_date))).slice(0, 5);
  }, [events]);

  const getCountdown = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isPast(date) && !isToday(date)) return 'Passed';
    if (isToday(date)) return 'Today!';
    const days = differenceInDays(date, new Date());
    if (days === 0) { return `${differenceInHours(date, new Date())}h left`; }
    return `${days} day${days !== 1 ? 's' : ''} left`;
  };

  const getTypeStyle = (type: string) => EVENT_TYPES.find(t => t.value === type)?.color || EVENT_TYPES[4].color;

  const handleSave = async () => {
    if (!form.title || !form.event_date) { toast.error('Title and date required'); return; }
    setSaving(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      const payload = { ...form, end_date: form.end_date || null, description: form.description || null, created_by: user?.id || null };
      if (editingEvent) {
        const { error } = await supabase.from('academic_calendar').update(payload).eq('id', editingEvent.id);
        if (error) throw error;
        toast.success('Event updated');
      } else {
        const { error } = await supabase.from('academic_calendar').insert(payload);
        if (error) throw error;
        toast.success('Event added');
      }
      setShowModal(false);
      setEditingEvent(null);
      setForm({ title: '', description: '', event_date: '', end_date: '', event_type: 'general', is_important: false });
      fetchEvents();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    const { error } = await supabase.from('academic_calendar').delete().eq('id', id);
    if (!error) { toast.success('Deleted'); fetchEvents(); }
  };

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setForm({ title: event.title, description: event.description || '', event_date: event.event_date, end_date: event.end_date || '', event_type: event.event_type, is_important: event.is_important });
    setShowModal(true);
  };

  // Calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay();
  const paddingDays = Array.from({ length: startDayOfWeek }, (_, i) => i);

  const getEventsForDay = (date: Date) => events.filter(e => isSameDay(new Date(e.event_date), date));

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Academic Calendar - UISU SPACE" description="Important academic dates, exams, deadlines, and countdowns" />
      

      <div className="container mx-auto px-4 pt-28 pb-16 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-2">Academic Calendar</h1>
            <p className="text-muted-foreground">Track exams, deadlines, registration periods, and holidays.</p>
          </div>
          {isStaff && (
            <Button onClick={() => { setEditingEvent(null); setForm({ title: '', description: '', event_date: '', end_date: '', event_type: 'general', is_important: false }); setShowModal(true); }} className="gap-2 shrink-0">
              <Plus size={18} /> Add Event
            </Button>
          )}
        </div>

        {/* Countdown Cards */}
        {upcomingEvents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-12">
            {upcomingEvents.map((event, i) => {
              const countdown = getCountdown(event.event_date);
              const isUrgent = differenceInDays(new Date(event.event_date), new Date()) <= 3;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-card border border-border p-4 relative overflow-hidden ${isUrgent ? 'ring-2 ring-destructive/30' : ''}`}
                >
                  {event.is_important && <Star size={14} className="absolute top-3 right-3 text-accent fill-accent" />}
                  <Badge variant="outline" className={`text-[10px] mb-2 ${getTypeStyle(event.event_type)}`}>
                    {EVENT_TYPES.find(t => t.value === event.event_type)?.label}
                  </Badge>
                  <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-1">{event.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{format(new Date(event.event_date), 'MMM d, yyyy')}</p>
                  <p className={`text-lg font-bold ${isUrgent ? 'text-destructive' : 'text-primary'}`}>
                    {countdown}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Calendar Grid */}
        <div className="bg-card border border-border p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft size={18} /></Button>
            <h2 className="text-xl font-serif font-bold text-foreground">{format(currentMonth, 'MMMM yyyy')}</h2>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight size={18} /></Button>
          </div>
          <div className="grid grid-cols-7 gap-px">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-muted-foreground uppercase tracking-wider py-2">{day}</div>
            ))}
            {paddingDays.map(i => <div key={`pad-${i}`} />)}
            {calendarDays.map(day => {
              const dayEvents = getEventsForDay(day);
              const today = isToday(day);
              return (
                <div key={day.toISOString()} className={`min-h-[80px] p-1.5 border border-border/50 ${today ? 'bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-muted/50'}`}>
                  <span className={`text-xs font-medium ${today ? 'text-primary font-bold' : 'text-foreground'}`}>{format(day, 'd')}</span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map(e => (
                      <div key={e.id} className={`text-[10px] px-1 py-0.5 truncate rounded ${getTypeStyle(e.event_type)}`} title={e.title}>
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 2} more</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full Event List */}
        <div className="space-y-3">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-4">All Events</h2>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : events.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">No events scheduled yet.</p>
          ) : (
            events.map(event => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-4 bg-card border border-border p-4 hover:shadow-sm transition-shadow"
              >
                <div className="text-center min-w-[50px]">
                  <span className="text-2xl font-bold text-primary">{format(new Date(event.event_date), 'd')}</span>
                  <p className="text-xs text-muted-foreground uppercase">{format(new Date(event.event_date), 'MMM')}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-foreground truncate">{event.title}</h3>
                    {event.is_important && <Star size={12} className="text-accent fill-accent shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] ${getTypeStyle(event.event_type)}`}>
                      {EVENT_TYPES.find(t => t.value === event.event_type)?.label}
                    </Badge>
                    {event.end_date && <span className="text-xs text-muted-foreground">→ {format(new Date(event.end_date), 'MMM d')}</span>}
                  </div>
                </div>
                <span className={`text-sm font-medium shrink-0 ${isPast(new Date(event.event_date)) && !isToday(new Date(event.event_date)) ? 'text-muted-foreground' : 'text-primary'}`}>
                  {getCountdown(event.event_date)}
                </span>
                {isStaff && (
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(event)}><Edit2 size={14} /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(event.id)}><Trash2 size={14} /></Button>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingEvent ? 'Edit Event' : 'Add Calendar Event'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Event title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Start Date *</Label>
                <Input type="date" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">End Date</Label>
                <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
              </div>
            </div>
            <Select value={form.event_type} onValueChange={v => setForm(f => ({ ...f, event_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_important} onCheckedChange={v => setForm(f => ({ ...f, is_important: v }))} />
              <Label>Mark as important</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 size={16} className="animate-spin mr-2" />}
              {editingEvent ? 'Update' : 'Add Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AcademicCalendarPage;
