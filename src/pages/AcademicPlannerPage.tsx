import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Trash2, Download, Clock, MapPin, User, BookOpen, Loader2, GraduationCap, CalendarDays, ChevronLeft, ChevronRight, Palette, Edit2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/hooks/useAuth';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);
const COLORS = [
  { value: '#003366', label: 'Navy' },
  { value: '#C5A059', label: 'Gold' },
  { value: '#1a5276', label: 'Teal' },
  { value: '#27ae60', label: 'Green' },
  { value: '#8e44ad', label: 'Purple' },
  { value: '#c0392b', label: 'Red' },
  { value: '#e67e22', label: 'Orange' },
  { value: '#16a085', label: 'Mint' },
  { value: '#2c3e50', label: 'Slate' },
  { value: '#d4ac0d', label: 'Amber' },
];

interface TimetableEntry {
  id: string;
  user_id: string;
  course_name: string;
  course_code: string | null;
  lecturer: string | null;
  location: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  color: string;
}

const timeToHour = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h + m / 60;
};

const formatTime = (h: number) => {
  const hour = Math.floor(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${display} ${ampm}`;
};

const formatTimeStr = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:${String(m).padStart(2, '0')} ${ampm}`;
};

const generateICS = (entries: TimetableEntry[]) => {
  const dayMap: Record<number, string> = { 0: 'MO', 1: 'TU', 2: 'WE', 3: 'TH', 4: 'FR', 5: 'SA', 6: 'SU' };
  const now = new Date();
  const getNextDay = (dow: number) => {
    const d = new Date(now);
    const diff = ((dow + 1) - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + (diff === 0 ? 7 : diff));
    return d;
  };
  let ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//UISU//Timetable//EN\n`;
  entries.forEach(e => {
    const date = getNextDay(e.day_of_week);
    const [sh, sm] = e.start_time.split(':').map(Number);
    const [eh, em] = e.end_time.split(':').map(Number);
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
    ics += `BEGIN:VEVENT\nDTSTART:${dateStr}T${pad(sh)}${pad(sm)}00\nDTEND:${dateStr}T${pad(eh)}${pad(em)}00\nRRULE:FREQ=WEEKLY;BYDAY=${dayMap[e.day_of_week]};COUNT=16\nSUMMARY:${e.course_name}${e.course_code ? ` (${e.course_code})` : ''}\nLOCATION:${e.location || ''}\nDESCRIPTION:Lecturer: ${e.lecturer || 'N/A'}\nEND:VEVENT\n`;
  });
  ics += 'END:VCALENDAR';
  return ics;
};

// ─── Mobile Day View Card ────────────────────────────
const DayCard: React.FC<{ day: string; dayIndex: number; entries: TimetableEntry[]; onEdit: (e: TimetableEntry) => void; onDelete: (id: string) => void }> = ({ day, dayIndex, entries, onEdit, onDelete }) => {
  const dayEntries = entries.filter(e => e.day_of_week === dayIndex).sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{day}</h3>
      {dayEntries.length === 0 ? (
        <div className="py-6 text-center text-xs text-muted-foreground/50 italic">No classes</div>
      ) : (
        <div className="space-y-2">
          {dayEntries.map(e => (
            <motion.div
              key={e.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative overflow-hidden rounded-2xl p-4 cursor-pointer transition-shadow hover:shadow-md"
              style={{ backgroundColor: e.color + '18', borderLeft: `4px solid ${e.color}` }}
              onClick={() => onEdit(e)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{e.course_name}</p>
                  {e.course_code && <p className="text-xs text-muted-foreground font-mono mt-0.5">{e.course_code}</p>}
                </div>
                <button
                  onClick={(ev) => { ev.stopPropagation(); onDelete(e.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="flex items-center gap-4 mt-2.5">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock size={11} /> {formatTimeStr(e.start_time)} – {formatTimeStr(e.end_time)}
                </span>
                {e.location && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin size={11} /> {e.location}
                  </span>
                )}
              </div>
              {e.lecturer && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                  <User size={11} /> {e.lecturer}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Desktop Grid View ───────────────────────────────
const GridView: React.FC<{ entries: TimetableEntry[]; onEdit: (e: TimetableEntry) => void; onDelete: (id: string) => void }> = ({ entries, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="min-w-[750px]">
        {/* Header */}
        <div className="grid grid-cols-[56px_repeat(7,1fr)] gap-0.5 mb-0.5">
          <div className="rounded-tl-2xl bg-muted/50 p-2" />
          {SHORT_DAYS.map((d, i) => (
            <div key={d} className={`bg-muted/50 p-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground ${i === 6 ? 'rounded-tr-2xl' : ''}`}>
              {d}
            </div>
          ))}
        </div>
        {/* Body */}
        <div className="relative grid grid-cols-[56px_repeat(7,1fr)] gap-0.5" style={{ gridTemplateRows: `repeat(${HOURS.length}, 52px)` }}>
          {HOURS.map((h, hi) => (
            <React.Fragment key={h}>
              <div className={`bg-muted/30 p-1 text-[10px] text-muted-foreground/60 flex items-start justify-end pr-2 pt-1 font-mono ${hi === HOURS.length - 1 ? 'rounded-bl-2xl' : ''}`}>
                {formatTime(h)}
              </div>
              {DAYS.map((_, di) => (
                <div key={di} className={`bg-card border-t border-border/30 ${hi === HOURS.length - 1 && di === 6 ? 'rounded-br-2xl' : ''}`} />
              ))}
            </React.Fragment>
          ))}
          {/* Entries */}
          {entries.map(e => {
            const startH = timeToHour(e.start_time);
            const endH = timeToHour(e.end_time);
            const topPx = (startH - 7) * 52 + (startH - 7) * 0.5;
            const heightPx = (endH - startH) * 52;
            const col = e.day_of_week;
            const leftPercent = (col / 7) * 100;
            const widthPercent = 100 / 7;

            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute rounded-xl shadow-sm p-2 overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow"
                style={{
                  top: `${topPx}px`,
                  height: `${Math.max(heightPx, 26)}px`,
                  left: `calc(${leftPercent}% + 56px + ${col * 0.5 + 0.5}px)`,
                  width: `calc(${widthPercent}% - 2px)`,
                  backgroundColor: e.color,
                  color: '#fff',
                }}
                onClick={() => onEdit(e)}
              >
                <p className="text-[10px] font-bold truncate leading-tight">{e.course_name}</p>
                {heightPx > 32 && e.course_code && <p className="text-[8px] opacity-80 truncate mt-0.5">{e.course_code}</p>}
                {heightPx > 48 && e.location && (
                  <p className="text-[8px] opacity-70 truncate flex items-center gap-0.5 mt-0.5"><MapPin size={7} />{e.location}</p>
                )}
                <button
                  onClick={(ev) => { ev.stopPropagation(); onDelete(e.id); }}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-black/20 rounded-full hover:bg-black/40"
                >
                  <Trash2 size={10} />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────
const AcademicPlannerPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [mobileDay, setMobileDay] = useState(0);

  // Form state
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [location, setLocation] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('0');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [color, setColor] = useState(COLORS[0].value);

  const fetchEntries = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    const { data, error } = await supabase
      .from('timetable_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('day_of_week')
      .order('start_time');
    if (!error && data) setEntries(data as TimetableEntry[]);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const resetForm = () => {
    setCourseName(''); setCourseCode(''); setLecturer(''); setLocation('');
    setDayOfWeek('0'); setStartTime('08:00'); setEndTime('09:00'); setColor(COLORS[0].value);
    setEditingEntry(null);
  };

  const openEdit = (e: TimetableEntry) => {
    setEditingEntry(e);
    setCourseName(e.course_name); setCourseCode(e.course_code || '');
    setLecturer(e.lecturer || ''); setLocation(e.location || '');
    setDayOfWeek(String(e.day_of_week)); setStartTime(e.start_time.slice(0, 5));
    setEndTime(e.end_time.slice(0, 5)); setColor(e.color);
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!user?.id) { toast.error('Please sign in'); return; }
    if (!courseName.trim()) { toast.error('Course name is required'); return; }
    if (startTime >= endTime) { toast.error('End time must be after start time'); return; }
    setSaving(true);
    const payload = {
      user_id: user.id,
      course_name: courseName.trim(),
      course_code: courseCode.trim() || null,
      lecturer: lecturer.trim() || null,
      location: location.trim() || null,
      day_of_week: Number(dayOfWeek),
      start_time: startTime,
      end_time: endTime,
      color,
    };
    let error;
    if (editingEntry) {
      ({ error } = await supabase.from('timetable_entries').update(payload).eq('id', editingEntry.id));
    } else {
      ({ error } = await supabase.from('timetable_entries').insert(payload));
    }
    if (error) toast.error('Failed to save'); else { toast.success(editingEntry ? 'Updated' : 'Added'); fetchEntries(); }
    setSaving(false); setShowDialog(false); resetForm();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('timetable_entries').delete().eq('id', id);
    if (!error) { toast.success('Deleted'); fetchEntries(); }
  };

  const exportICS = () => {
    if (!entries.length) { toast.error('No entries to export'); return; }
    const blob = new Blob([generateICS(entries)], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'timetable.ics'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Timetable exported');
  };

  const totalCourses = new Set(entries.map(e => e.course_name)).size;
  const totalHours = entries.reduce((sum, e) => sum + (timeToHour(e.end_time) - timeToHour(e.start_time)), 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <SEO title="Academic Planner | UISU" description="Build your weekly timetable" />
        <div className="text-center space-y-4 px-4">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
            <GraduationCap size={32} className="text-muted-foreground" />
          </div>
          <h2 className="text-xl font-serif font-bold text-foreground">Sign in to use the Academic Planner</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">Create and manage your weekly timetable with calendar export.</p>
          <Button onClick={() => navigate('/auth')} className="bg-primary text-primary-foreground rounded-full px-8">Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Academic Planner | UISU" description="Build and manage your weekly timetable with iCal export" />

      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 pt-24 pb-8 max-w-6xl">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate(-1)} className="p-2.5 rounded-full border border-primary-foreground/20 hover:bg-primary-foreground/10 transition-colors">
              <ArrowLeft size={16} />
            </button>
            <div className="flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-primary-foreground/50">Planner</p>
              <h1 className="text-2xl md:text-3xl font-serif font-bold">Academic Timetable</h1>
            </div>
          </div>

          {/* Stats + Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                  <BookOpen size={14} />
                </div>
                <div>
                  <p className="text-lg font-bold leading-none">{totalCourses}</p>
                  <p className="text-[9px] uppercase tracking-widest text-primary-foreground/50">Courses</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                  <Clock size={14} />
                </div>
                <div>
                  <p className="text-lg font-bold leading-none">{totalHours.toFixed(1)}</p>
                  <p className="text-[9px] uppercase tracking-widest text-primary-foreground/50">Hrs/Week</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 rounded-full"
                onClick={exportICS}
              >
                <Download size={14} className="mr-1.5" /> Export iCal
              </Button>
              <Button
                size="sm"
                onClick={() => { resetForm(); setShowDialog(true); }}
                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full"
              >
                <Plus size={14} className="mr-1.5" /> Add Course
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
        ) : entries.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 space-y-4">
            <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
              <CalendarDays size={36} className="text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-base font-serif font-semibold text-foreground">No courses yet</p>
              <p className="text-sm text-muted-foreground mt-1">Tap <strong>Add Course</strong> to start building your timetable.</p>
            </div>
            <Button onClick={() => { resetForm(); setShowDialog(true); }} className="bg-primary text-primary-foreground rounded-full mt-2">
              <Plus size={14} className="mr-1.5" /> Add Your First Course
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Mobile: Day-by-day swiper */}
            <div className="md:hidden">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setMobileDay(Math.max(0, mobileDay - 1))}
                  disabled={mobileDay === 0}
                  className="p-2 rounded-full hover:bg-muted disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-1.5">
                  {SHORT_DAYS.map((d, i) => (
                    <button
                      key={d}
                      onClick={() => setMobileDay(i)}
                      className={`w-8 h-8 rounded-full text-[10px] font-bold transition-all ${
                        mobileDay === i
                          ? 'bg-primary text-primary-foreground'
                          : entries.some(e => e.day_of_week === i)
                            ? 'bg-accent/20 text-accent-foreground'
                            : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {d.charAt(0)}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setMobileDay(Math.min(6, mobileDay + 1))}
                  disabled={mobileDay === 6}
                  className="p-2 rounded-full hover:bg-muted disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={mobileDay} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                  <DayCard day={DAYS[mobileDay]} dayIndex={mobileDay} entries={entries} onEdit={openEdit} onDelete={handleDelete} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Desktop: Grid */}
            <div className="hidden md:block">
              <GridView entries={entries} onEdit={openEdit} onDelete={handleDelete} />
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(o) => { if (!o) resetForm(); setShowDialog(o); }}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">{editingEntry ? 'Edit Course' : 'Add Course'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <div>
              <Label className="text-xs text-muted-foreground">Course Name *</Label>
              <Input value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="e.g. Introduction to Law" className="rounded-xl mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Course Code</Label>
                <Input value={courseCode} onChange={e => setCourseCode(e.target.value)} placeholder="LAW101" className="rounded-xl mt-1.5" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Day</Label>
                <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                  <SelectTrigger className="rounded-xl mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">{DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Start Time</Label>
                <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="rounded-xl mt-1.5" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">End Time</Label>
                <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="rounded-xl mt-1.5" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Lecturer</Label>
              <Input value={lecturer} onChange={e => setLecturer(e.target.value)} placeholder="Dr. Smith" className="rounded-xl mt-1.5" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Location</Label>
              <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Room 201, Block A" className="rounded-xl mt-1.5" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setColor(c.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${color === c.value ? 'border-foreground scale-110 ring-2 ring-foreground/20' : 'border-transparent'}`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary text-primary-foreground rounded-full h-12 text-sm font-semibold">
              {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              {editingEntry ? 'Update Course' : 'Add Course'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AcademicPlannerPage;
