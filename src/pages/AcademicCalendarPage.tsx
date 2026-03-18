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
import { format, differenceInDays, differenceInHours, isPast, isToday, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';

const EVENT_TYPES = [
  { value: 'exam', label: 'Exams', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  { value: 'registration', label: 'Registration', color: 'bg-primary/10 text-primary border-primary/20' },
  { value: 'holiday', label: 'Holiday', color: 'bg-accent/20 text-accent-foreground border-accent/30' },
  { value: 'deadline', label: 'Deadline', color: 'bg-destructive/5 text-destructive border-destructive/10' },
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

  const upcomingEvents = useMemo(() => events.filter(e => !isPast(new Date(e.event_date)) || isToday(new Date(e.event_date))).slice(0, 5), [events]);

  const getCountdown = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isPast(date) && !isToday(date)) return 'Passed';
    if (isToday(date)) return 'Today!';
    const days = differenceInDays(date, new Date());
    if (days === 0) return `${differenceInHours(date, new Date())}h left`;
    return `${days}d left`;
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
      setShowModal(false); setEditingEvent(null);
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

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay();
  const paddingDays = Array.from({ length: startDayOfWeek }, (_, i) => i);
  const getEventsForDay = (date: Date) => events.filter(e => isSameDay(new Date(e.event_date), date));

  const totalEvents = events.length;
  const upcomingCount = upcomingEvents.length;
  const importantCount = events.filter(e => e.is_important).length;

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Academic Calendar - UISU SPACE" description="Important academic dates, exams, deadlines, and countdowns" />

      {/* Hero Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 pt-24 pb-8 max-w-6xl">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => window.history.back()} className="p-2.5 rounded-full border border-primary-foreground/20 hover:bg-primary-foreground/10 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <div className="flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-primary-foreground/50">Academic Affairs</p>
              <h1 className="text-2xl md:text-3xl font-serif font-bold">Academic Calendar</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center"><Calendar size={14} /></div>
                <div>
                  <p className="text-lg font-bold leading-none">{totalEvents}</p>
                  <p className="text-[9px] uppercase tracking-widest text-primary-foreground/50">Events</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center"><Clock size={14} /></div>
                <div>
                  <p className="text-lg font-bold leading-none">{upcomingCount}</p>
                  <p className="text-[9px] uppercase tracking-widest text-primary-foreground/50">Upcoming</p>
                </div>
              </div>
              {importantCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center"><Star size={14} className="text-accent" /></div>
                  <div>
                    <p className="text-lg font-bold leading-none">{importantCount}</p>
                    <p className="text-[9px] uppercase tracking-widest text-primary-foreground/50">Important</p>
                  </div>
                </div>
              )}
            </div>
            {isStaff && (
              <Button size="sm" onClick={() => { setEditingEvent(null); setForm({ title: '', description: '', event_date: '', end_date: '', event_type: 'general', is_important: false }); setShowModal(true); }}
                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full">
                <Plus size={14} className="mr-1.5" /> Add Event
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Countdown Cards */}
        {upcomingEvents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-4">Upcoming Deadlines</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {upcomingEvents.map((event, i) => {
                const countdown = getCountdown(event.event_date);
                const isUrgent = differenceInDays(new Date(event.event_date), new Date()) <= 3;
                return (
                  <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className={`bg-card border border-border rounded-2xl p-5 relative overflow-hidden ${isUrgent ? 'border-destructive/40 shadow-sm' : ''}`}
                  >
                    {event.is_important && <Star size={14} className="absolute top-4 right-4 text-accent fill-accent" />}
                    <Badge variant="outline" className={`text-[10px] mb-3 rounded-full ${getTypeStyle(event.event_type)}`}>
                      {EVENT_TYPES.find(t => t.value === event.event_type)?.label}
                    </Badge>
                    <h3 className="font-serif font-semibold text-sm text-foreground line-clamp-2 mb-1">{event.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{format(new Date(event.event_date), 'MMM d, yyyy')}</p>
                    <p className={`text-xl font-serif font-bold ${isUrgent ? 'text-destructive' : 'text-primary'}`}>{countdown}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Calendar Grid */}
        <div className="bg-card border border-border rounded-2xl p-5 md:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="rounded-full"><ChevronLeft size={18} /></Button>
            <h2 className="text-2xl font-serif font-bold text-foreground">{format(currentMonth, 'MMMM yyyy')}</h2>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="rounded-full"><ChevronRight size={18} /></Button>
          </div>
          <div className="grid grid-cols-7 gap-px bg-border rounded-2xl overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider py-3 bg-muted">{day}</div>
            ))}
            {paddingDays.map(i => <div key={`pad-${i}`} className="bg-card" />)}
            {calendarDays.map(day => {
              const dayEvents = getEventsForDay(day);
              const today = isToday(day);
              return (
                <div key={day.toISOString()} className={`min-h-[80px] p-1.5 bg-card ${today ? 'ring-2 ring-inset ring-primary/30' : ''}`}>
                  <span className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 ${today ? 'bg-primary text-primary-foreground rounded-full font-bold' : 'text-foreground'}`}>
                    {format(day, 'd')}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map(e => (
                      <div key={e.id} className={`text-[10px] px-1.5 py-0.5 truncate rounded-full ${getTypeStyle(e.event_type)}`} title={e.title}>{e.title}</div>
                    ))}
                    {dayEvents.length > 2 && <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 2}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full Event List */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-4">All Events</h2>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 bg-card border border-border rounded-2xl">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4"><Calendar size={32} className="text-muted-foreground" /></div>
              <p className="font-serif text-lg text-foreground">No events scheduled yet</p>
              <p className="text-sm text-muted-foreground mt-1">Check back soon for updates.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.map(event => (
                <motion.div key={event.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="text-center min-w-[48px] border-r border-border pr-4">
                    <span className="text-2xl font-serif font-bold text-primary">{format(new Date(event.event_date), 'd')}</span>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{format(new Date(event.event_date), 'MMM')}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-serif font-semibold text-foreground truncate">{event.title}</h3>
                      {event.is_important && <Star size={12} className="text-accent fill-accent shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] rounded-full ${getTypeStyle(event.event_type)}`}>{EVENT_TYPES.find(t => t.value === event.event_type)?.label}</Badge>
                      {event.end_date && <span className="text-xs text-muted-foreground">→ {format(new Date(event.end_date), 'MMM d')}</span>}
                    </div>
                  </div>
                  <span className={`text-sm font-serif font-bold shrink-0 ${isPast(new Date(event.event_date)) && !isToday(new Date(event.event_date)) ? 'text-muted-foreground' : 'text-primary'}`}>
                    {getCountdown(event.event_date)}
                  </span>
                  {isStaff && (
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleEdit(event)}><Edit2 size={14} /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive rounded-full" onClick={() => handleDelete(event.id)}><Trash2 size={14} /></Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle className="font-serif text-2xl">{editingEvent ? 'Edit Event' : 'Add Calendar Event'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Event title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="rounded-xl" />
            <Textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Start Date *</Label><Input type="date" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} className="rounded-xl" /></div>
              <div><Label className="text-xs">End Date</Label><Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className="rounded-xl" /></div>
            </div>
            <Select value={form.event_type} onValueChange={v => setForm(f => ({ ...f, event_type: v }))}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-xl">{EVENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_important} onCheckedChange={v => setForm(f => ({ ...f, is_important: v }))} />
              <Label>Mark as important</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)} className="rounded-full">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="rounded-full">
              {saving && <Loader2 size={16} className="animate-spin mr-2" />}{editingEvent ? 'Update' : 'Add Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AcademicCalendarPage;
