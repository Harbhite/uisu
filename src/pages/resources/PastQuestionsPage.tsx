import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Upload, Search, FileText, Sparkles, Loader2, ChevronDown,
  ChevronUp, BookOpen, Filter, Clock, GraduationCap, X, Send
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface PastQuestion {
  id: string;
  course_code: string;
  course_title: string;
  faculty: string;
  year: string;
  semester: string;
  question_text: string;
  ai_solution: string | null;
  submitted_by: string | null;
  created_at: string;
  is_approved: boolean;
}

const FACULTIES = [
  'All Faculties', 'General Studies', 'Agriculture', 'Arts', 'Clinical Sciences',
  'Dentistry', 'Education', 'Law', 'Pharmacy', 'Public Health',
  'Renewable Natural Resources', 'Science', 'Social Sciences', 'Technology', 'Veterinary Medicine'
];

const YEARS = ['All Years', '2025', '2024', '2023', '2022', '2021', '2020'];

const PastQuestionsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<PastQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('All Faculties');
  const [yearFilter, setYearFilter] = useState('All Years');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [solvingId, setSolvingId] = useState<string | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  // Submit form state
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newFaculty, setNewFaculty] = useState('Science');
  const [newYear, setNewYear] = useState('2024');
  const [newSemester, setNewSemester] = useState('First');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchQuestions(); }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('past_questions')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
    } else {
      setQuestions((data as PastQuestion[]) || []);
    }
    setLoading(false);
  };

  const handleSubmitQuestion = async () => {
    if (!user) { toast.error('Please sign in to submit questions'); return; }
    if (!newCourseCode.trim() || !newQuestionText.trim()) {
      toast.error('Course code and question text are required'); return;
    }

    setSubmitting(true);
    const { error } = await (supabase as any).from('past_questions').insert({
      course_code: newCourseCode.trim().toUpperCase(),
      course_title: newCourseTitle.trim(),
      faculty: newFaculty,
      year: newYear,
      semester: newSemester,
      question_text: newQuestionText.trim(),
      submitted_by: user.id,
      is_approved: false,
    });

    setSubmitting(false);
    if (error) {
      toast.error('Failed to submit question');
      console.error(error);
    } else {
      toast.success('Question submitted for review!');
      setShowSubmitForm(false);
      setNewCourseCode(''); setNewCourseTitle(''); setNewQuestionText('');
    }
  };

  const generateSolution = async (question: PastQuestion) => {
    setSolvingId(question.id);
    try {
      const { data, error } = await supabase.functions.invoke('past-questions-solve', {
        body: {
          courseCode: question.course_code,
          courseTitle: question.course_title,
          questionText: question.question_text,
        }
      });

      if (error) throw error;

      const solution = data?.solution || 'Unable to generate solution.';

      // Update local state
      setQuestions(prev => prev.map(q => q.id === question.id ? { ...q, ai_solution: solution } : q));
      setExpandedId(question.id);
      toast.success('AI solution generated!');
    } catch (err) {
      console.error('Solution generation error:', err);
      toast.error('Failed to generate solution. Please try again.');
    } finally {
      setSolvingId(null);
    }
  };

  const filtered = questions.filter(q => {
    const matchSearch = searchQuery === '' ||
      q.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.course_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.question_text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFac = facultyFilter === 'All Faculties' || q.faculty === facultyFilter;
    const matchYear = yearFilter === 'All Years' || q.year === yearFilter;
    return matchSearch && matchFac && matchYear;
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16">
      <SEO title="Past Questions Bank - Resources" description="Browse past exam questions with AI-generated solutions." />
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
            <FileText size={16} className="text-nobel-gold" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Academic Resource</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-ui-blue leading-tight mb-3">
            Past Questions <span className="italic text-slate-400">Bank</span>
          </h1>
          <p className="text-slate-500 max-w-xl text-base leading-relaxed">
            Browse crowdsourced exam questions and get AI-powered solutions instantly.
          </p>

          <div className="flex flex-wrap gap-2 mt-5">
            <span className="px-4 py-1.5 rounded-full bg-ui-blue/10 text-ui-blue text-xs font-semibold">
              {questions.length} Questions
            </span>
            <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
              {new Set(questions.map(q => q.course_code)).size} Courses
            </span>
            <span className="px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold flex items-center gap-1">
              <Sparkles size={12} /> AI Solutions
            </span>
          </div>
        </motion.div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by course code, title, or keyword..."
              className="rounded-xl pl-10" />
          </div>
          <Select value={facultyFilter} onValueChange={setFacultyFilter}>
            <SelectTrigger className="rounded-xl w-full sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-xl max-h-60">
              {FACULTIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="rounded-xl w-full sm:w-32"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-xl">
              {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <Button onClick={() => setShowSubmitForm(true)} className="rounded-full gap-2 bg-ui-blue hover:bg-ui-blue/90">
            <Upload size={16} /> Submit Question
          </Button>
        </div>

        {/* Submit Form Modal */}
        <AnimatePresence>
          {showSubmitForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onClick={() => setShowSubmitForm(false)}
            >
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif text-ui-blue">Submit Past Question</h2>
                  <button onClick={() => setShowSubmitForm(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={18} /></button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Course Code *</label>
                      <Input value={newCourseCode} onChange={e => setNewCourseCode(e.target.value)}
                        placeholder="e.g. CSC 301" className="rounded-xl" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Course Title</label>
                      <Input value={newCourseTitle} onChange={e => setNewCourseTitle(e.target.value)}
                        placeholder="e.g. Data Structures" className="rounded-xl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Faculty</label>
                      <Select value={newFaculty} onValueChange={setNewFaculty}>
                        <SelectTrigger className="rounded-xl text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl max-h-60">
                          {FACULTIES.slice(1).map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Year</label>
                      <Select value={newYear} onValueChange={setNewYear}>
                        <SelectTrigger className="rounded-xl text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {YEARS.slice(1).map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Semester</label>
                      <Select value={newSemester} onValueChange={setNewSemester}>
                        <SelectTrigger className="rounded-xl text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="First">First</SelectItem>
                          <SelectItem value="Second">Second</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Question(s) *</label>
                    <Textarea value={newQuestionText} onChange={e => setNewQuestionText(e.target.value)}
                      placeholder="Type or paste the exam question(s) here..."
                      className="rounded-xl min-h-[160px]" />
                  </div>
                  <Button onClick={handleSubmitQuestion} disabled={submitting} className="w-full rounded-full bg-ui-blue hover:bg-ui-blue/90 gap-2">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {submitting ? 'Submitting...' : 'Submit for Review'}
                  </Button>
                  <p className="text-xs text-slate-400 text-center">Submissions are reviewed before being published.</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Questions List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded-full w-1/3" />
                    <div className="h-3 bg-slate-100 rounded-full w-2/3" />
                    <div className="h-3 bg-slate-100 rounded-full w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <BookOpen size={56} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-400 text-lg font-serif">
              {questions.length === 0 ? 'No past questions yet' : 'No questions match your search'}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {questions.length === 0 ? 'Be the first to submit a past question!' : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(q => {
              const isExpanded = expandedId === q.id;
              return (
                <motion.div key={q.id} layout className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-ui-blue/10 flex items-center justify-center flex-shrink-0">
                        <FileText size={20} className="text-ui-blue" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-sm text-slate-800">{q.course_code}</h3>
                            {q.course_title && <p className="text-xs text-slate-500">{q.course_title}</p>}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium">{q.year}</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium">{q.semester}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 mt-2 line-clamp-2">{q.question_text}</p>

                        <div className="flex items-center gap-2 mt-3">
                          <button onClick={() => setExpandedId(isExpanded ? null : q.id)}
                            className="text-xs text-ui-blue font-medium flex items-center gap-1 hover:underline"
                          >
                            {isExpanded ? <><ChevronUp size={12} /> Less</> : <><ChevronDown size={12} /> View Full</>}
                          </button>

                          {!q.ai_solution && (
                            <Button size="sm" variant="outline" onClick={() => generateSolution(q)}
                              disabled={solvingId === q.id}
                              className="rounded-full text-xs h-7 gap-1 border-violet-200 text-violet-600 hover:bg-violet-50"
                            >
                              {solvingId === q.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                              {solvingId === q.id ? 'Generating...' : 'AI Solution'}
                            </Button>
                          )}
                          {q.ai_solution && !isExpanded && (
                            <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                              <Sparkles size={10} /> Solution available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded view */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Full Question</h4>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{q.question_text}</p>

                            {q.ai_solution && (
                              <div className="mt-4 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-4 border border-violet-100">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles size={14} className="text-violet-600" />
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-violet-600">AI-Generated Solution</h4>
                                </div>
                                <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{q.ai_solution}</div>
                                <p className="text-[10px] text-slate-400 mt-3 italic">
                                  Note: AI-generated solutions are for study reference only and may not be perfect.
                                </p>
                              </div>
                            )}

                            {!q.ai_solution && (
                              <Button onClick={() => generateSolution(q)} disabled={solvingId === q.id}
                                className="mt-4 rounded-full gap-2 bg-violet-600 hover:bg-violet-700"
                              >
                                {solvingId === q.id ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                Generate AI Solution
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PastQuestionsPage;
