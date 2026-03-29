import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, TrendingUp, Award, BookOpen, ChevronDown,
  ChevronUp, Calculator, Target, Lightbulb, X, Download, BarChart3
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Course { id: string; name: string; units: number; grade: string; }
interface Semester { id: string; name: string; year: string; courses: Course[]; }

type Scale = '5.0' | '4.0';

const GP: Record<Scale, Record<string, number>> = {
  '5.0': { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 },
  '4.0': { A: 4, B: 3, C: 2, D: 1, F: 0 },
};

const classifications: Record<Scale, { min: number; label: string; color: string }[]> = {
  '5.0': [
    { min: 4.5, label: 'First Class', color: 'text-emerald-600' },
    { min: 3.5, label: '2nd Class Upper', color: 'text-blue-600' },
    { min: 2.5, label: '2nd Class Lower', color: 'text-amber-600' },
    { min: 1.5, label: 'Third Class', color: 'text-orange-600' },
    { min: 1.0, label: 'Pass', color: 'text-red-500' },
    { min: 0, label: 'Fail', color: 'text-red-700' },
  ],
  '4.0': [
    { min: 3.6, label: 'Summa Cum Laude', color: 'text-emerald-600' },
    { min: 3.3, label: 'Magna Cum Laude', color: 'text-blue-600' },
    { min: 3.0, label: 'Cum Laude', color: 'text-amber-600' },
    { min: 2.0, label: 'Good Standing', color: 'text-orange-600' },
    { min: 0, label: 'Below Average', color: 'text-red-600' },
  ],
};

const STORAGE_KEY = 'uisu-gpa-tracker';

const GPATrackerPage = () => {
  const navigate = useNavigate();
  const [scale, setScale] = useState<Scale>('5.0');
  const [semesters, setSemesters] = useState<Semester[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showProjection, setShowProjection] = useState(false);
  const [projUnits, setProjUnits] = useState(15);
  const [projGPA, setProjGPA] = useState(4.0);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(semesters)); }, [semesters]);

  const calcSemGPA = (courses: Course[]) => {
    const valid = courses.filter(c => c.grade && GP[scale][c.grade] !== undefined && c.units > 0);
    if (!valid.length) return 0;
    const pts = valid.reduce((s, c) => s + GP[scale][c.grade] * c.units, 0);
    const units = valid.reduce((s, c) => s + c.units, 0);
    return units > 0 ? pts / units : 0;
  };

  const calcCGPA = () => {
    let totalPts = 0, totalUnits = 0;
    semesters.forEach(sem => {
      sem.courses.filter(c => c.grade && GP[scale][c.grade] !== undefined && c.units > 0).forEach(c => {
        totalPts += GP[scale][c.grade] * c.units;
        totalUnits += c.units;
      });
    });
    return totalUnits > 0 ? totalPts / totalUnits : 0;
  };

  const getTotalUnits = () => semesters.reduce((s, sem) =>
    s + sem.courses.filter(c => c.grade && GP[scale][c.grade] !== undefined).reduce((a, c) => a + c.units, 0), 0);

  const getClassification = (gpa: number) =>
    classifications[scale].find(c => gpa >= c.min) || classifications[scale][classifications[scale].length - 1];

  const projectedCGPA = () => {
    const curUnits = getTotalUnits();
    const curPts = calcCGPA() * curUnits;
    const newPts = curPts + projGPA * projUnits;
    const newUnits = curUnits + projUnits;
    return newUnits > 0 ? newPts / newUnits : 0;
  };

  // What GPA needed to reach target
  const gpaNeeded = (targetCGPA: number) => {
    const curUnits = getTotalUnits();
    const curPts = calcCGPA() * curUnits;
    const needed = (targetCGPA * (curUnits + projUnits) - curPts) / projUnits;
    return needed;
  };

  const addSemester = () => {
    const count = semesters.length;
    const semNames = ['First Semester', 'Second Semester'];
    const yearNum = Math.floor(count / 2) + 1;
    const newSem: Semester = {
      id: crypto.randomUUID(),
      name: semNames[count % 2],
      year: `Year ${yearNum}`,
      courses: [{ id: crypto.randomUUID(), name: '', units: 3, grade: '' }]
    };
    setSemesters(prev => [...prev, newSem]);
    setExpanded(newSem.id);
  };

  const removeSemester = (id: string) => {
    setSemesters(prev => prev.filter(s => s.id !== id));
    toast.success('Semester removed');
  };

  const addCourse = (semId: string) => {
    setSemesters(prev => prev.map(s => s.id === semId ? {
      ...s, courses: [...s.courses, { id: crypto.randomUUID(), name: '', units: 3, grade: '' }]
    } : s));
  };

  const updateCourse = (semId: string, courseId: string, field: keyof Course, value: string | number) => {
    setSemesters(prev => prev.map(s => s.id === semId ? {
      ...s, courses: s.courses.map(c => c.id === courseId ? { ...c, [field]: value } : c)
    } : s));
  };

  const removeCourse = (semId: string, courseId: string) => {
    setSemesters(prev => prev.map(s => s.id === semId ? {
      ...s, courses: s.courses.filter(c => c.id !== courseId)
    } : s));
  };

  const cgpa = calcCGPA();
  const cls = getClassification(cgpa);

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16">
      <SEO title="GPA Tracker - Resources" description="Track your GPA across semesters with projections and what-if scenarios." />
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-5xl">
        {/* Back */}
        <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
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
            <TrendingUp size={16} className="text-nobel-gold" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Academic Tool</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-ui-blue leading-tight mb-3">
            GPA <span className="italic text-slate-400">Tracker</span>
          </h1>
          <p className="text-slate-500 max-w-xl text-base leading-relaxed">
            Track your grades across semesters, see your cumulative GPA, and project future scenarios.
          </p>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-2 mt-5">
            <span className="px-4 py-1.5 rounded-full bg-ui-blue/10 text-ui-blue text-xs font-semibold">
              {semesters.length} Semester{semesters.length !== 1 ? 's' : ''}
            </span>
            <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
              {getTotalUnits()} Total Units
            </span>
            {semesters.length > 0 && (
              <span className={`px-4 py-1.5 rounded-full bg-amber-100 text-xs font-semibold ${cls.color}`}>
                CGPA: {cgpa.toFixed(2)}
              </span>
            )}
          </div>
        </motion.div>

        {/* Scale Toggle */}
        <div className="flex gap-2 mb-6">
          {(['5.0', '4.0'] as Scale[]).map(s => (
            <button key={s} onClick={() => setScale(s)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                scale === s ? 'bg-ui-blue text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {s} Scale
            </button>
          ))}
        </div>

        {/* CGPA Overview Card */}
        {semesters.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-ui-blue to-ui-blue/80 rounded-2xl p-6 mb-8 text-white"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Cumulative GPA</p>
                <p className="text-5xl font-serif font-bold">{cgpa.toFixed(2)}</p>
                <p className="text-sm opacity-80 mt-1">{cls.label}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={14} className="opacity-70" />
                  <span className="text-sm opacity-80">{getTotalUnits()} units across {semesters.length} semesters</span>
                </div>
                {/* Mini bar chart */}
                <div className="flex items-end gap-1 h-12 mt-3">
                  {semesters.map(sem => {
                    const gpa = calcSemGPA(sem.courses);
                    const maxGPA = parseFloat(scale);
                    return (
                      <div key={sem.id} className="flex flex-col items-center gap-0.5" title={`${sem.name}: ${gpa.toFixed(2)}`}>
                        <div className="w-5 bg-white/30 rounded-t-sm" style={{ height: `${(gpa / maxGPA) * 40}px` }} />
                        <span className="text-[8px] opacity-60">{sem.name.slice(0, 1)}{sem.year.slice(-1)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Semesters */}
        <div className="space-y-4 mb-8">
          <AnimatePresence>
            {semesters.map((sem, idx) => {
              const semGPA = calcSemGPA(sem.courses);
              const isOpen = expanded === sem.id;
              return (
                <motion.div key={sem.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                >
                  {/* Semester Header */}
                  <button onClick={() => setExpanded(isOpen ? null : sem.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-ui-blue/10 flex items-center justify-center text-ui-blue text-xs font-bold">
                        {idx + 1}
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-sm text-slate-800">{sem.name} — {sem.year}</h3>
                        <p className="text-xs text-slate-400">{sem.courses.length} course{sem.courses.length !== 1 ? 's' : ''} • GPA: {semGPA.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getClassification(semGPA).color} bg-slate-50`}>
                        {semGPA.toFixed(2)}
                      </span>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {/* Courses */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-4 space-y-2">
                          {sem.courses.map((course, ci) => (
                            <div key={course.id} className="grid grid-cols-12 gap-2 items-center">
                              <div className="col-span-5 sm:col-span-5">
                                <Input value={course.name} onChange={e => updateCourse(sem.id, course.id, 'name', e.target.value)}
                                  placeholder={`Course ${ci + 1}`} className="rounded-xl text-xs h-9" />
                              </div>
                              <div className="col-span-2">
                                <Input type="number" value={course.units} min={1} max={12}
                                  onChange={e => updateCourse(sem.id, course.id, 'units', parseInt(e.target.value) || 1)}
                                  className="rounded-xl text-xs h-9 text-center" />
                              </div>
                              <div className="col-span-3">
                                <Select value={course.grade} onValueChange={v => updateCourse(sem.id, course.id, 'grade', v)}>
                                  <SelectTrigger className="rounded-xl h-9 text-xs"><SelectValue placeholder="Grade" /></SelectTrigger>
                                  <SelectContent className="rounded-xl">
                                    {Object.keys(GP[scale]).map(g => (
                                      <SelectItem key={g} value={g}>{g} ({GP[scale][g]})</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="col-span-2 flex justify-center">
                                <button onClick={() => removeCourse(sem.id, course.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm" onClick={() => addCourse(sem.id)} className="rounded-full text-xs gap-1">
                              <Plus size={12} /> Add Course
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => removeSemester(sem.id)} className="rounded-full text-xs gap-1 text-red-500 hover:text-red-600">
                              <Trash2 size={12} /> Remove Semester
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Add Semester Button */}
        <Button onClick={addSemester} className="rounded-full gap-2 bg-ui-blue hover:bg-ui-blue/90 mb-8">
          <Plus size={16} /> Add Semester
        </Button>

        {/* GPA Projection Tool */}
        {semesters.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 mb-8"
          >
            <button onClick={() => setShowProjection(!showProjection)}
              className="flex items-center gap-2 w-full justify-between"
            >
              <div className="flex items-center gap-2">
                <Target size={18} className="text-nobel-gold" />
                <h3 className="font-serif text-lg text-ui-blue">GPA Projection Tool</h3>
              </div>
              {showProjection ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {showProjection && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} className="overflow-hidden"
                >
                  <div className="mt-6 space-y-4">
                    <p className="text-sm text-slate-500">
                      See how your next semester could affect your cumulative GPA.
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Next Semester Units</label>
                        <Input type="number" value={projUnits} min={1} max={30}
                          onChange={e => setProjUnits(parseInt(e.target.value) || 1)} className="rounded-xl" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Expected GPA (0 - {scale})</label>
                        <Input type="number" value={projGPA} min={0} max={parseFloat(scale)} step={0.1}
                          onChange={e => setProjGPA(parseFloat(e.target.value) || 0)} className="rounded-xl" />
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb size={14} className="text-amber-500" />
                        <h4 className="text-sm font-semibold text-slate-700">Projected Results</h4>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-slate-100">
                          <p className="text-xs text-slate-400 mb-1">Projected CGPA</p>
                          <p className="text-3xl font-serif font-bold text-ui-blue">{projectedCGPA().toFixed(2)}</p>
                          <p className={`text-xs mt-1 ${getClassification(projectedCGPA()).color}`}>
                            {getClassification(projectedCGPA()).label}
                          </p>
                        </div>
                        <div className="space-y-2">
                          {classifications[scale].slice(0, 4).map(cls => {
                            const needed = gpaNeeded(cls.min);
                            const possible = needed >= 0 && needed <= parseFloat(scale);
                            return (
                              <div key={cls.label} className="flex items-center justify-between text-xs">
                                <span className={cls.color}>{cls.label}</span>
                                <span className={`font-mono ${possible ? 'text-slate-700' : 'text-slate-300 line-through'}`}>
                                  {possible ? `Need ${needed.toFixed(2)}` : 'Not possible'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Export Buttons */}
        {semesters.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-8">
            <Button variant="outline" className="rounded-full gap-2" onClick={async () => {
              toast.loading('Generating image…');
              const el = document.getElementById('gpa-export-card');
              if (!el) return;
              el.style.display = 'block';
              const html2canvas = (await import('html2canvas')).default;
              const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
              el.style.display = 'none';
              const link = document.createElement('a');
              link.download = `GPA_Report_${new Date().toISOString().slice(0, 10)}.png`;
              link.href = canvas.toDataURL('image/png');
              link.click();
              toast.dismiss();
              toast.success('Image exported!');
            }}>
              <Download size={16} /> Export as Image
            </Button>
            <Button variant="outline" className="rounded-full gap-2" onClick={async () => {
              toast.loading('Generating PDF…');
              const el = document.getElementById('gpa-export-card');
              if (!el) return;
              el.style.display = 'block';
              const html2canvas = (await import('html2canvas')).default;
              const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
              el.style.display = 'none';
              const { default: jsPDF } = await import('jspdf');
              const imgW = 190;
              const imgH = (canvas.height * imgW) / canvas.width;
              const doc = new jsPDF('p', 'mm', 'a4');
              let y = 10;
              const pageH = 277;
              // If the image is taller than a page, split across pages
              if (imgH <= pageH) {
                doc.addImage(canvas.toDataURL('image/png'), 'PNG', 10, y, imgW, imgH);
              } else {
                let remaining = canvas.height;
                let srcY = 0;
                while (remaining > 0) {
                  const sliceH = Math.min(remaining, (pageH / imgH) * canvas.height);
                  const sliceCanvas = document.createElement('canvas');
                  sliceCanvas.width = canvas.width;
                  sliceCanvas.height = sliceH;
                  sliceCanvas.getContext('2d')!.drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
                  const sliceImgH = (sliceH * imgW) / canvas.width;
                  if (srcY > 0) doc.addPage();
                  doc.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', 10, 10, imgW, sliceImgH);
                  srcY += sliceH;
                  remaining -= sliceH;
                }
              }
              doc.save(`GPA_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
              toast.dismiss();
              toast.success('PDF exported!');
            }}>
              <Download size={16} /> Export as PDF
            </Button>
          </div>
        )}

        {/* Hidden export card rendered off-screen */}
        <div id="gpa-export-card" style={{ display: 'none', position: 'absolute', left: '-9999px', top: 0, width: '720px', fontFamily: 'Georgia, serif' }}>
          <div style={{ padding: '40px', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', borderBottom: '3px solid #1e3a5f', paddingBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '28px', color: '#1e3a5f', margin: 0, letterSpacing: '1px' }}>ACADEMIC TRANSCRIPT</h1>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '6px 0 0', letterSpacing: '3px', textTransform: 'uppercase' }}>GPA Report • {scale} Scale</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Generated</p>
                <p style={{ fontSize: '14px', color: '#475569', margin: '2px 0 0', fontWeight: 600 }}>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            {/* CGPA Hero */}
            <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #2d5a8e)', borderRadius: '16px', padding: '28px 32px', color: 'white', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '3px', opacity: 0.7, margin: 0 }}>Cumulative GPA</p>
                <p style={{ fontSize: '52px', fontWeight: 700, margin: '4px 0 0', lineHeight: 1 }}>{cgpa.toFixed(2)}</p>
                <p style={{ fontSize: '14px', opacity: 0.85, margin: '8px 0 0' }}>{cls.label}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '12px 20px' }}>
                  <p style={{ fontSize: '11px', opacity: 0.7, margin: 0 }}>Total Units</p>
                  <p style={{ fontSize: '28px', fontWeight: 700, margin: '2px 0 0' }}>{getTotalUnits()}</p>
                </div>
                <p style={{ fontSize: '11px', opacity: 0.6, marginTop: '8px' }}>{semesters.length} Semester{semesters.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Semester Breakdown */}
            {semesters.map((sem, idx) => {
              const semGPA = calcSemGPA(sem.courses);
              const semCls = getClassification(semGPA);
              return (
                <div key={sem.id} style={{ background: 'white', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <div style={{ background: '#f8fafc', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1e3a5f', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>{idx + 1}</div>
                      <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e3a5f' }}>{sem.name} — {sem.year}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>{semCls.label}</span>
                      <span style={{ background: '#1e3a5f', color: 'white', padding: '4px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700 }}>{semGPA.toFixed(2)}</span>
                    </div>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9' }}>
                        <th style={{ padding: '10px 20px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Course</th>
                        <th style={{ padding: '10px 20px', textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Units</th>
                        <th style={{ padding: '10px 20px', textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Grade</th>
                        <th style={{ padding: '10px 20px', textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sem.courses.filter(c => c.name || c.grade).map((c, ci) => (
                        <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 20px', color: '#334155' }}>{c.name || 'Untitled'}</td>
                          <td style={{ padding: '10px 20px', textAlign: 'center', color: '#475569' }}>{c.units}</td>
                          <td style={{ padding: '10px 20px', textAlign: 'center', fontWeight: 700, color: c.grade === 'A' ? '#059669' : c.grade === 'F' ? '#dc2626' : '#1e3a5f' }}>{c.grade || '—'}</td>
                          <td style={{ padding: '10px 20px', textAlign: 'center', color: '#475569' }}>{c.grade && GP[scale][c.grade] !== undefined ? (GP[scale][c.grade] * c.units).toFixed(1) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}

            {/* Footer */}
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '2px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>University of Ibadan Students' Union • UISU Portal</p>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>This is an unofficial student-generated report</p>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {semesters.length === 0 && (
          <div className="text-center py-16">
            <BarChart3 size={56} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-400 text-lg font-serif">No semesters added yet</p>
            <p className="text-slate-400 text-sm mt-1">Click "Add Semester" to start tracking your GPA</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GPATrackerPage;
