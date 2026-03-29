import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Clock, MapPin, Download, RotateCcw,
  AlertTriangle, Calendar, GripVertical, X, Copy, ChevronLeft, ChevronRight
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface TimetableEntry {
  id: string;
  courseCode: string;
  courseTitle: string;
  day: string;
  startTime: string;
  endTime: string;
  venue: string;
  color: string;
  lecturer?: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const HOURS = Array.from({ length: 12 }, (_, i) => {
  const h = i + 7;
  return `${h.toString().padStart(2, '0')}:00`;
});

const COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
  'bg-violet-500', 'bg-teal-500', 'bg-orange-500', 'bg-indigo-500',
  'bg-cyan-500', 'bg-pink-500', 'bg-lime-500', 'bg-fuchsia-500'
];

const STORAGE_KEY = 'uisu-timetable';

const timeToMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const TimetableBuilderPage = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<TimetableEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [mobileDay, setMobileDay] = useState(0);

  // Form state
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [venue, setVenue] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  // Detect conflicts
  useEffect(() => {
    const found: string[] = [];
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const a = entries[i], b = entries[j];
        if (a.day !== b.day) continue;
        const aStart = timeToMinutes(a.startTime), aEnd = timeToMinutes(a.endTime);
        const bStart = timeToMinutes(b.startTime), bEnd = timeToMinutes(b.endTime);
        if (aStart < bEnd && bStart < aEnd) {
          found.push(`${a.courseCode} & ${b.courseCode} on ${a.day}`);
        }
      }
    }
    setConflicts(found);
  }, [entries]);

  const resetForm = () => {
    setCourseCode(''); setCourseTitle(''); setDay('Monday');
    setStartTime('08:00'); setEndTime('09:00'); setVenue('');
    setLecturer(''); setColor(COLORS[entries.length % COLORS.length]);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!courseCode.trim()) { toast.error('Course code is required'); return; }
    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      toast.error('End time must be after start time'); return;
    }

    if (editingId) {
      setEntries(prev => prev.map(e => e.id === editingId ? {
        ...e, courseCode, courseTitle, day, startTime, endTime, venue, lecturer, color
      } : e));
      toast.success('Class updated');
    } else {
      setEntries(prev => [...prev, {
        id: crypto.randomUUID(), courseCode, courseTitle, day, startTime, endTime, venue, lecturer, color
      }]);
      toast.success('Class added');
    }
    resetForm();
    setShowForm(false);
  };

  const editEntry = (entry: TimetableEntry) => {
    setCourseCode(entry.courseCode); setCourseTitle(entry.courseTitle);
    setDay(entry.day); setStartTime(entry.startTime); setEndTime(entry.endTime);
    setVenue(entry.venue); setLecturer(entry.lecturer || '');
    setColor(entry.color); setEditingId(entry.id); setShowForm(true);
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    toast.success('Class removed');
  };

  const clearAll = () => {
    if (entries.length === 0) return;
    setEntries([]);
    toast.success('Timetable cleared');
  };

  const exportAsImage = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colW = 160, rowH = 50, headerH = 50, timeW = 70;
    canvas.width = timeW + colW * DAYS.length + 20;
    canvas.height = headerH + rowH * HOURS.length + 20;

    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Gold header bar
    ctx.fillStyle = '#C5A059';
    ctx.fillRect(0, 0, canvas.width, 6);

    // Day headers
    DAYS.forEach((d, i) => {
      ctx.fillStyle = '#1e3a5f';
      ctx.fillRect(timeW + i * colW, 10, colW - 2, headerH - 4);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d, timeW + i * colW + colW / 2, 38);
    });

    // Time labels
    HOURS.forEach((h, i) => {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(h, timeW - 8, headerH + 10 + i * rowH + 18);
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(timeW, headerH + 10 + i * rowH);
      ctx.lineTo(canvas.width - 10, headerH + 10 + i * rowH);
      ctx.stroke();
    });

    // Entries
    const colorHex: Record<string, string> = {
      'bg-blue-500': '#3b82f6', 'bg-emerald-500': '#10b981', 'bg-amber-500': '#f59e0b',
      'bg-rose-500': '#f43f5e', 'bg-violet-500': '#8b5cf6', 'bg-teal-500': '#14b8a6',
      'bg-orange-500': '#f97316', 'bg-indigo-500': '#6366f1', 'bg-cyan-500': '#06b6d4',
      'bg-pink-500': '#ec4899', 'bg-lime-500': '#84cc16', 'bg-fuchsia-500': '#d946ef',
    };

    entries.forEach(entry => {
      const dayIdx = DAYS.indexOf(entry.day);
      if (dayIdx < 0) return;
      const startMin = timeToMinutes(entry.startTime) - 7 * 60;
      const endMin = timeToMinutes(entry.endTime) - 7 * 60;
      const y = headerH + 10 + (startMin / 60) * rowH;
      const h = ((endMin - startMin) / 60) * rowH;
      const x = timeW + dayIdx * colW + 2;

      ctx.fillStyle = colorHex[entry.color] || '#3b82f6';
      ctx.fillRect(x, y, colW - 6, h - 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(entry.courseCode, x + 6, y + 16);
      if (h > 30) {
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(entry.venue || '', x + 6, y + 30);
      }
    });

    // Footer
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`UISU SPACE Timetable • ${new Date().toLocaleDateString()}`, 10, canvas.height - 6);

    const link = document.createElement('a');
    link.download = 'UISU_Timetable.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('Timetable exported');
  };

  const getEntriesForDay = (d: string) =>
    entries.filter(e => e.day === d).sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16">
      <SEO title="Timetable Builder - Resources" description="Build your weekly class timetable with conflict detection and export." />
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-6xl">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/resources')}
          className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-nobel-gold transition-colors mb-10"
        >
          <div className="p-2 rounded-full border border-slate-300 group-hover:border-nobel-gold transition-colors">
            <ArrowLeft size={14} />
          </div>
          <span>Back to Resources</span>
        </motion.button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Calendar size={16} className="text-nobel-gold" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Academic Tool</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-ui-blue leading-tight mb-3">
            Timetable <span className="italic text-slate-400">Builder</span>
          </h1>
          <p className="text-slate-500 max-w-xl text-base leading-relaxed">
            Create your weekly class schedule. Conflicts are detected automatically.
          </p>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-2 mt-5">
            <span className="px-4 py-1.5 rounded-full bg-ui-blue/10 text-ui-blue text-xs font-semibold">{entries.length} Classes</span>
            <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
              {new Set(entries.map(e => e.day)).size} Days
            </span>
            {conflicts.length > 0 && (
              <span className="px-4 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1">
                <AlertTriangle size={12} /> {conflicts.length} Conflict{conflicts.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </motion.div>

        {/* Conflict Warnings */}
        <AnimatePresence>
          {conflicts.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 text-red-700 font-semibold text-sm mb-2">
                <AlertTriangle size={16} /> Schedule Conflicts Detected
              </div>
              {conflicts.map((c, i) => (
                <p key={i} className="text-red-600 text-xs ml-6">• {c}</p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="rounded-full gap-2 bg-ui-blue hover:bg-ui-blue/90">
            <Plus size={16} /> Add Class
          </Button>
          <Button variant="outline" onClick={exportAsImage} className="rounded-full gap-2" disabled={entries.length === 0}>
            <Download size={16} /> Export
          </Button>
          <Button variant="outline" onClick={clearAll} className="rounded-full gap-2 text-red-600 hover:text-red-700">
            <RotateCcw size={16} /> Clear All
          </Button>
        </div>

        {/* Add/Edit Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onClick={() => { setShowForm(false); resetForm(); }}
            >
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif text-ui-blue">{editingId ? 'Edit Class' : 'Add New Class'}</h2>
                  <button onClick={() => { setShowForm(false); resetForm(); }} className="p-2 hover:bg-slate-100 rounded-full">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Course Code *</label>
                      <Input value={courseCode} onChange={e => setCourseCode(e.target.value)} placeholder="e.g. CSC 301" className="rounded-xl" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Course Title</label>
                      <Input value={courseTitle} onChange={e => setCourseTitle(e.target.value)} placeholder="e.g. Data Structures" className="rounded-xl" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Day</label>
                    <Select value={day} onValueChange={setDay}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Start Time</label>
                      <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="rounded-xl" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">End Time</label>
                      <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="rounded-xl" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Venue</label>
                      <Input value={venue} onChange={e => setVenue(e.target.value)} placeholder="e.g. LT1" className="rounded-xl" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Lecturer</label>
                      <Input value={lecturer} onChange={e => setLecturer(e.target.value)} placeholder="e.g. Prof. Ade" className="rounded-xl" />
                    </div>
                  </div>

                  {/* Color Picker */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-2 block">Color</label>
                    <div className="flex flex-wrap gap-2">
                      {COLORS.map(c => (
                        <button key={c} onClick={() => setColor(c)}
                          className={`w-8 h-8 rounded-full ${c} transition-all ${color === c ? 'ring-2 ring-offset-2 ring-ui-blue scale-110' : 'hover:scale-105'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleSubmit} className="w-full rounded-full bg-ui-blue hover:bg-ui-blue/90 mt-2">
                    {editingId ? 'Update Class' : 'Add Class'}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Grid */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-[70px_repeat(5,1fr)]">
            {/* Header */}
            <div className="bg-ui-blue/5 p-3 border-b border-r border-slate-200" />
            {DAYS.map(d => (
              <div key={d} className="bg-ui-blue/5 p-3 border-b border-r border-slate-200 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-ui-blue">{d}</span>
              </div>
            ))}

            {/* Time slots */}
            {HOURS.map(hour => (
              <React.Fragment key={hour}>
                <div className="p-2 border-b border-r border-slate-100 text-right">
                  <span className="text-[10px] font-medium text-slate-400">{hour}</span>
                </div>
                {DAYS.map(d => {
                  const dayEntries = entries.filter(e => {
                    if (e.day !== d) return false;
                    const slotH = parseInt(hour);
                    const startH = parseInt(e.startTime);
                    const endH = timeToMinutes(e.endTime) / 60;
                    return slotH >= startH && slotH < endH;
                  });
                  const isStart = dayEntries.filter(e => e.startTime === hour);
                  return (
                    <div key={`${d}-${hour}`} className="border-b border-r border-slate-100 relative min-h-[48px]">
                      {isStart.map(entry => {
                        const duration = (timeToMinutes(entry.endTime) - timeToMinutes(entry.startTime)) / 60;
                        return (
                          <div key={entry.id}
                            onClick={() => editEntry(entry)}
                            className={`absolute inset-x-0.5 ${entry.color} text-white p-1.5 rounded-lg cursor-pointer hover:brightness-110 transition-all z-10 overflow-hidden`}
                            style={{ height: `${duration * 48 - 4}px`, top: 0 }}
                          >
                            <p className="text-[10px] font-bold truncate">{entry.courseCode}</p>
                            {duration >= 1 && <p className="text-[9px] opacity-80 truncate">{entry.venue}</p>}
                            {duration >= 1.5 && <p className="text-[9px] opacity-70 truncate">{entry.startTime}-{entry.endTime}</p>}
                            <button onClick={e => { e.stopPropagation(); deleteEntry(entry.id); }}
                              className="absolute top-1 right-1 p-0.5 bg-black/20 rounded-full hover:bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Mobile Day View */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setMobileDay(Math.max(0, mobileDay - 1))}
              className="p-2 rounded-full border border-slate-200 disabled:opacity-30" disabled={mobileDay === 0}
            >
              <ChevronLeft size={18} />
            </button>
            <h3 className="font-serif text-xl text-ui-blue">{DAYS[mobileDay]}</h3>
            <button onClick={() => setMobileDay(Math.min(4, mobileDay + 1))}
              className="p-2 rounded-full border border-slate-200 disabled:opacity-30" disabled={mobileDay === 4}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day pills */}
          <div className="flex gap-1 mb-4 overflow-x-auto no-scrollbar">
            {DAYS.map((d, i) => (
              <button key={d} onClick={() => setMobileDay(i)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  i === mobileDay ? 'bg-ui-blue text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {d.slice(0, 3)}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {getEntriesForDay(DAYS[mobileDay]).length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <Calendar size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-400 text-sm">No classes on {DAYS[mobileDay]}</p>
              </div>
            ) : (
              getEntriesForDay(DAYS[mobileDay]).map(entry => (
                <motion.div key={entry.id} layout
                  className={`${entry.color} text-white rounded-2xl p-4 relative`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm">{entry.courseCode}</h4>
                      {entry.courseTitle && <p className="text-xs opacity-80">{entry.courseTitle}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => editEntry(entry)} className="p-1.5 bg-white/20 rounded-full hover:bg-white/30">
                        <GripVertical size={12} />
                      </button>
                      <button onClick={() => deleteEntry(entry.id)} className="p-1.5 bg-white/20 rounded-full hover:bg-white/30">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs opacity-90">
                    <span className="flex items-center gap-1"><Clock size={12} /> {entry.startTime} - {entry.endTime}</span>
                    {entry.venue && <span className="flex items-center gap-1"><MapPin size={12} /> {entry.venue}</span>}
                  </div>
                  {entry.lecturer && <p className="text-xs opacity-70 mt-1">📎 {entry.lecturer}</p>}
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Empty state for desktop */}
        {entries.length === 0 && (
          <div className="hidden md:block text-center py-16">
            <Calendar size={56} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-400 text-lg font-serif">Your timetable is empty</p>
            <p className="text-slate-400 text-sm mt-1">Click "Add Class" to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimetableBuilderPage;
