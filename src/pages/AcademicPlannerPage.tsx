import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Trash2, Edit2, Download, Clock, MapPin, User, BookOpen, Loader2, X, Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/hooks/useAuth';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7am - 8pm
const COLORS = ['#003366', '#C5A059', '#1a5276', '#d4ac0d', '#2c3e50', '#e67e22', '#27ae60', '#8e44ad', '#c0392b', '#16a085'];

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
  return `${display}${ampm}`;
};

const generateICS = (entries: TimetableEntry[]) => {
  const dayMap: Record<number, string> = { 0: 'MO', 1: 'TU', 2: 'WE', 3: 'TH', 4: 'FR', 5: 'SA', 6: 'SU' };
  const now = new Date();
  // Find next occurrence of each day
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

const AcademicPlannerPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [location, setLocation] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('0');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [color, setColor] = useState(COLORS[0]);

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
    setDayOfWeek('0'); setStartTime('08:00'); setEndTime('09:00'); setColor(COLORS[0]);
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

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <SEO title="Academic Planner | UISU" description="Build your weekly timetable" />
        <div className="text-center space-y-4 px-4">
          <BookOpen size={48} className="mx-auto text-muted-foreground" />
          <h2 className="text-xl font-serif font-bold text-foreground">Sign in to use the Academic Planner</h2>
          <Button onClick={() => navigate('/auth')} className="bg-primary text-primary-foreground">Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Academic Planner | UISU" description="Build and manage your weekly timetable with iCal export" />
      
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 pt-24 pb-6 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 border border-primary-foreground/20 hover:border-accent transition-colors rounded-xl">
                <ArrowLeft size={14} />
              </button>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-primary-foreground/50">Planner</p>
                <h1 className="text-xl md:text-2xl font-serif font-bold">Academic Timetable</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10" onClick={exportICS}>
                <Download size={14} className="mr-1" /> iCal
              </Button>
              <Button size="sm" onClick={() => { resetForm(); setShowDialog(true); }} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus size={14} className="mr-1" /> Add
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <BookOpen size={40} className="mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">No courses yet. Tap <strong>Add</strong> to start building your timetable.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="min-w-[700px]">
              {/* Day headers */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-px bg-border rounded-t-2xl overflow-hidden">
                <div className="bg-muted p-2 text-[10px] font-bold text-muted-foreground uppercase" />
                {DAYS.map(d => (
                  <div key={d} className="bg-muted p-2 text-[10px] font-bold text-muted-foreground uppercase text-center">{d.slice(0, 3)}</div>
                ))}
              </div>
              {/* Time rows */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-px bg-border relative" style={{ gridTemplateRows: `repeat(${HOURS.length}, 60px)` }}>
                {HOURS.map(h => (
                  <React.Fragment key={h}>
                    <div className="bg-card p-1 text-[10px] text-muted-foreground flex items-start justify-end pr-2">{formatTime(h)}</div>
                    {DAYS.map((_, di) => <div key={di} className="bg-card border-t border-border/50" />)}
                  </React.Fragment>
                ))}
                {/* Entries overlaid */}
                {entries.map(e => {
                  const startH = timeToHour(e.start_time);
                  const endH = timeToHour(e.end_time);
                  const top = (startH - 7) * 60;
                  const height = (endH - startH) * 60;
                  const col = e.day_of_week + 2; // +2 for grid offset (1-indexed + time column)
                  return (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute rounded-xl shadow-sm p-1.5 overflow-hidden cursor-pointer group"
                      style={{
                        gridColumn: col,
                        top: `${top}px`,
                        height: `${height}px`,
                        left: `calc(${((col - 2) / 7) * 100}% + 60px + ${col - 2}px)`,
                        width: `calc(${100 / 7}% - 2px)`,
                        backgroundColor: e.color + 'DD',
                        color: '#fff',
                      }}
                      onClick={() => openEdit(e)}
                    >
                      <p className="text-[10px] font-bold truncate leading-tight">{e.course_name}</p>
                      {height > 35 && <p className="text-[8px] opacity-80 truncate">{e.course_code}</p>}
                      {height > 50 && <p className="text-[8px] opacity-70 truncate flex items-center gap-0.5"><MapPin size={7} />{e.location}</p>}
                      <button
                        onClick={(ev) => { ev.stopPropagation(); handleDelete(e.id); }}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 bg-black/30 rounded"
                      >
                        <Trash2 size={10} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(o) => { if (!o) resetForm(); setShowDialog(o); }}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif">{editingEntry ? 'Edit Course' : 'Add Course'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Course Name *</Label>
              <Input value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="e.g. Introduction to Law" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Course Code</Label>
                <Input value={courseCode} onChange={e => setCourseCode(e.target.value)} placeholder="LAW101" />
              </div>
              <div>
                <Label className="text-xs">Day</Label>
                <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Start Time</Label><Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} /></div>
              <div><Label className="text-xs">End Time</Label><Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} /></div>
            </div>
            <div>
              <Label className="text-xs">Lecturer</Label>
              <Input value={lecturer} onChange={e => setLecturer(e.target.value)} placeholder="Dr. Smith" />
            </div>
            <div>
              <Label className="text-xs">Location</Label>
              <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Room 201, Block A" />
            </div>
            <div>
              <Label className="text-xs">Color</Label>
              <div className="flex gap-2 mt-1">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)} className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? 'border-foreground scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary text-primary-foreground">
              {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
              {editingEntry ? 'Update' : 'Add Course'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AcademicPlannerPage;
