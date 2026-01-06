import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator, Clock, FileText, BookOpen, Calendar, Target, 
  Timer, Lightbulb, CheckSquare, LayoutGrid, Percent, Scale,
  BarChart3, Dices, PenTool, GraduationCap, Brain, 
  RefreshCw, Quote as QuoteIcon, Loader2, Plus, Trash2, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';

// Grade point mapping
const gradePoints: { [key: string]: number } = {
  'A': 5.0, 'B': 4.0, 'C': 3.0, 'D': 2.0, 'E': 1.0, 'F': 0.0
};

interface Course {
  id: string;
  code: string;
  title: string;
  units: number;
  grade: string;
}

interface GPARecord {
  id: string;
  semester: string;
  academic_year: string;
  courses: Course[];
  gpa: number;
  total_units: number;
}

// GPA Tracker Component
const GPATracker = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [records, setRecords] = useState<GPARecord[]>([]);
  const [currentSemester, setCurrentSemester] = useState('First');
  const [currentYear, setCurrentYear] = useState('2024/2025');
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', code: '', title: '', units: 3, grade: 'A' }
  ]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchRecords(user.id);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const fetchRecords = async (userId: string) => {
    const { data, error } = await supabase
      .from('gpa_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRecords(data.map(r => ({
        ...r,
        courses: (r.courses as unknown as Course[]) || []
      })));
    }
  };

  const addCourse = () => {
    setCourses([...courses, { 
      id: Date.now().toString(), 
      code: '', 
      title: '', 
      units: 3, 
      grade: 'A' 
    }]);
  };

  const removeCourse = (id: string) => {
    if (courses.length > 1) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const updateCourse = (id: string, field: keyof Course, value: string | number) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const calculateGPA = () => {
    let totalPoints = 0;
    let totalUnits = 0;
    courses.forEach(course => {
      if (course.units > 0 && gradePoints[course.grade] !== undefined) {
        totalPoints += gradePoints[course.grade] * course.units;
        totalUnits += course.units;
      }
    });
    return totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : '0.00';
  };

  const getTotalUnits = () => {
    return courses.reduce((sum, c) => sum + (c.units || 0), 0);
  };

  const saveRecord = async () => {
    if (!user) {
      toast({ title: 'Please sign in', description: 'You need to be logged in to save GPA records.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const gpa = parseFloat(calculateGPA());
    const totalUnits = getTotalUnits();

    const { error } = await supabase.from('gpa_records').insert({
      user_id: user.id,
      semester: currentSemester,
      academic_year: currentYear,
      courses: courses as unknown as any,
      gpa,
      total_units: totalUnits
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to save record.', variant: 'destructive' });
    } else {
      toast({ title: 'Saved!', description: 'Your GPA record has been saved.' });
      fetchRecords(user.id);
      setCourses([{ id: '1', code: '', title: '', units: 3, grade: 'A' }]);
    }
    setSaving(false);
  };

  const deleteRecord = async (id: string) => {
    const { error } = await supabase.from('gpa_records').delete().eq('id', id);
    if (!error) {
      setRecords(records.filter(r => r.id !== id));
      toast({ title: 'Deleted', description: 'Record removed.' });
    }
  };

  const calculateCGPA = () => {
    if (records.length === 0) return '0.00';
    let totalWeightedGPA = 0;
    let totalUnits = 0;
    records.forEach(r => {
      totalWeightedGPA += (r.gpa || 0) * (r.total_units || 0);
      totalUnits += r.total_units || 0;
    });
    return totalUnits > 0 ? (totalWeightedGPA / totalUnits).toFixed(2) : '0.00';
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Current Semester Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap size={20} />
            Calculate Semester GPA
          </CardTitle>
          <CardDescription>Enter your courses and grades</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Semester</Label>
              <Select value={currentSemester} onValueChange={setCurrentSemester}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="First">First Semester</SelectItem>
                  <SelectItem value="Second">Second Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Academic Year</Label>
              <Input value={currentYear} onChange={(e) => setCurrentYear(e.target.value)} placeholder="2024/2025" />
            </div>
          </div>

          <div className="space-y-3">
            {courses.map((course, idx) => (
              <div key={course.id} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-2">
                  <Label className="text-xs">Code</Label>
                  <Input 
                    value={course.code} 
                    onChange={(e) => updateCourse(course.id, 'code', e.target.value)}
                    placeholder="CHM101"
                  />
                </div>
                <div className="col-span-4">
                  <Label className="text-xs">Title</Label>
                  <Input 
                    value={course.title} 
                    onChange={(e) => updateCourse(course.id, 'title', e.target.value)}
                    placeholder="General Chemistry"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Units</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    max="6"
                    value={course.units} 
                    onChange={(e) => updateCourse(course.id, 'units', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Grade</Label>
                  <Select value={course.grade} onValueChange={(v) => updateCourse(course.id, 'grade', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(gradePoints).map(g => (
                        <SelectItem key={g} value={g}>{g} ({gradePoints[g]})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeCourse(course.id)}
                    disabled={courses.length === 1}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" onClick={addCourse} className="w-full gap-2">
            <Plus size={16} /> Add Course
          </Button>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-lg">
              <span className="text-muted-foreground">GPA: </span>
              <span className="font-bold text-2xl text-primary">{calculateGPA()}</span>
              <span className="text-sm text-muted-foreground ml-2">({getTotalUnits()} units)</span>
            </div>
            {user && (
              <Button onClick={saveRecord} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save Record
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Saved Records & CGPA */}
      {user && records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Academic Record</span>
              <span className="text-2xl text-primary">CGPA: {calculateCGPA()}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {records.map(record => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <span className="font-medium">{record.semester} Semester</span>
                    <span className="text-muted-foreground ml-2">({record.academic_year})</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold">GPA: {record.gpa?.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">{record.total_units} units</span>
                    <Button variant="ghost" size="icon" onClick={() => deleteRecord(record.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!user && (
        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground">Sign in to save your GPA records and track your CGPA over time.</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/auth'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Other simple tools
const tools = [
  { 
    id: 'pomodoro', 
    name: 'Pomodoro Timer', 
    icon: Timer, 
    desc: 'Focus timer with breaks',
    component: PomodoroTimer
  },
  { 
    id: 'todo', 
    name: 'Quick Todo', 
    icon: CheckSquare, 
    desc: 'Simple task list',
    component: QuickTodo
  },
  { 
    id: 'notes', 
    name: 'Quick Notes', 
    icon: PenTool, 
    desc: 'Scratch pad for ideas',
    component: QuickNotes
  },
  { 
    id: 'percentage', 
    name: 'Percentage Calculator', 
    icon: Percent, 
    desc: 'Quick percentage math',
    component: PercentageCalc
  },
  { 
    id: 'random', 
    name: 'Random Picker', 
    icon: Dices, 
    desc: 'Random choice maker',
    component: RandomPicker
  },
  { 
    id: 'quote', 
    name: 'Daily Quote', 
    icon: QuoteIcon, 
    desc: 'Inspirational quotes',
    component: DailyQuote
  },
];

function PomodoroTimer() {
  const [time, setTime] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (running && time > 0) {
      interval = setInterval(() => setTime(t => t - 1), 1000);
    } else if (time === 0) {
      setIsBreak(!isBreak);
      setTime(isBreak ? 25 * 60 : 5 * 60);
      setRunning(false);
    }
    return () => clearInterval(interval);
  }, [running, time, isBreak]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="text-center space-y-4">
      <div className={`text-6xl font-mono font-bold ${isBreak ? 'text-green-500' : 'text-primary'}`}>
        {formatTime(time)}
      </div>
      <p className="text-muted-foreground">{isBreak ? 'Break Time!' : 'Focus Time'}</p>
      <div className="flex justify-center gap-2">
        <Button onClick={() => setRunning(!running)}>{running ? 'Pause' : 'Start'}</Button>
        <Button variant="outline" onClick={() => { setTime(25 * 60); setRunning(false); setIsBreak(false); }}>
          <RefreshCw size={16} />
        </Button>
      </div>
    </div>
  );
}

function QuickTodo() {
  const [todos, setTodos] = useState<{ id: string; text: string; done: boolean }[]>([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now().toString(), text: input, done: false }]);
      setInput('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Add a task..." onKeyDown={(e) => e.key === 'Enter' && addTodo()} />
        <Button onClick={addTodo}><Plus size={16} /></Button>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {todos.map(todo => (
          <div key={todo.id} className={`flex items-center gap-2 p-2 rounded ${todo.done ? 'bg-muted line-through text-muted-foreground' : 'bg-card'}`}>
            <input type="checkbox" checked={todo.done} onChange={() => setTodos(todos.map(t => t.id === todo.id ? { ...t, done: !t.done } : t))} />
            <span className="flex-1">{todo.text}</span>
            <Button variant="ghost" size="icon" onClick={() => setTodos(todos.filter(t => t.id !== todo.id))}><Trash2 size={14} /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickNotes() {
  const [note, setNote] = useState(() => localStorage.getItem('quickNote') || '');

  useEffect(() => {
    localStorage.setItem('quickNote', note);
  }, [note]);

  return (
    <Textarea 
      value={note} 
      onChange={(e) => setNote(e.target.value)} 
      placeholder="Jot down your thoughts..." 
      className="min-h-[200px]"
    />
  );
}

function PercentageCalc() {
  const [value, setValue] = useState('');
  const [percent, setPercent] = useState('');
  const result = value && percent ? ((parseFloat(value) * parseFloat(percent)) / 100).toFixed(2) : '0';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Value</Label>
          <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="100" />
        </div>
        <div>
          <Label>Percentage (%)</Label>
          <Input type="number" value={percent} onChange={(e) => setPercent(e.target.value)} placeholder="15" />
        </div>
      </div>
      <div className="text-center p-4 bg-muted rounded-lg">
        <span className="text-muted-foreground">{percent}% of {value} = </span>
        <span className="text-2xl font-bold text-primary">{result}</span>
      </div>
    </div>
  );
}

function RandomPicker() {
  const [items, setItems] = useState('');
  const [result, setResult] = useState('');

  const pick = () => {
    const list = items.split('\n').filter(i => i.trim());
    if (list.length) {
      setResult(list[Math.floor(Math.random() * list.length)]);
    }
  };

  return (
    <div className="space-y-4">
      <Textarea value={items} onChange={(e) => setItems(e.target.value)} placeholder="Enter options (one per line)..." rows={4} />
      <Button onClick={pick} className="w-full gap-2"><Dices size={16} /> Pick Random</Button>
      {result && (
        <div className="text-center p-4 bg-accent/10 rounded-lg border border-accent/20">
          <span className="text-xl font-bold text-accent">{result}</span>
        </div>
      )}
    </div>
  );
}

function DailyQuote() {
  const quotes = [
    { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
    { text: "The beautiful thing about learning is that nobody can take it away from you.", author: "B.B. King" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  ];
  const [quote, setQuote] = useState(quotes[0]);

  const newQuote = () => setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

  return (
    <div className="text-center space-y-4">
      <QuoteIcon className="mx-auto text-accent" size={32} />
      <blockquote className="text-lg italic text-foreground">"{quote.text}"</blockquote>
      <p className="text-muted-foreground">— {quote.author}</p>
      <Button variant="outline" onClick={newQuote} className="gap-2"><RefreshCw size={14} /> New Quote</Button>
    </div>
  );
}

const ToolsPage = () => {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const activeTool = tools.find(t => t.id === activeToolId);

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <SEO
        title="Student Tools - UISU Archive"
        description="Productivity tools for UI students: GPA tracker, Pomodoro timer, todo lists, and more."
        image="/screenshots/index.png"
      />

      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">Student Tools</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Productivity tools to help you excel in your academic journey.
          </p>
        </motion.div>

        <Tabs defaultValue="gpa" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="gpa" className="gap-2"><GraduationCap size={16} /> GPA Tracker</TabsTrigger>
            <TabsTrigger value="tools" className="gap-2"><LayoutGrid size={16} /> Quick Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="gpa">
            <GPATracker />
          </TabsContent>

          <TabsContent value="tools">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {tools.map(tool => (
                <Dialog key={tool.id}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:border-accent transition-colors">
                      <CardContent className="p-6 text-center">
                        <tool.icon className="mx-auto mb-3 text-accent" size={28} />
                        <h3 className="font-medium">{tool.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{tool.desc}</p>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <tool.icon size={20} /> {tool.name}
                      </DialogTitle>
                    </DialogHeader>
                    <tool.component />
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ToolsPage;
