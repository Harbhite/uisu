import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit,
  FileIcon,
  Upload,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCcw,
  ChevronRight,
  ChevronLeft,
  Trophy,
  Sliders,
  Trash2,
  ImageIcon,
  Download,
  FileDown,
  FileText,
  CreditCard,
  BookOpen,
} from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { DepthLevel } from '@/lib/file-utils';
import { readMultipleFiles, mergeFileContents, type FileProgress } from '@/lib/multi-file-utils';
import { cacheOutput } from '@/lib/ai-cache';
import GenerationProgress from '@/components/resources/GenerationProgress';
import { FileProgressList } from '@/components/resources/FileProgressList';
import { compressImage } from '@/lib/image-compression';
import { SEO } from '@/components/SEO';
import AIToolsHeader from '@/components/resources/AIToolsHeader';

type Rigidity = 'Standard' | 'Strict' | 'Rigid';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// readFileAsText replaced by readFileContent from file-utils

interface UploadViewProps {
  inputText: string;
  setInputText: (text: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedFiles: File[];
  removeFile: (idx: number) => void;
  rigidity: Rigidity;
  setRigidity: (r: Rigidity) => void;
  questionCount: number;
  setQuestionCount: (n: number) => void;
  generateQuiz: () => void;
  depth: DepthLevel;
  setDepth: (d: DepthLevel) => void;
  fileProgress: FileProgress[];
}

const UploadView: React.FC<UploadViewProps> = ({
  inputText,
  setInputText,
  fileInputRef,
  handleFileChange,
  selectedFiles,
  removeFile,
  rigidity,
  setRigidity,
  questionCount,
  setQuestionCount,
  generateQuiz,
  depth,
  setDepth,
  fileProgress,
}) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*,.pdf,.docx,.doc,.txt,.xlsx,.xls,.pptx,.ppt" multiple />

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 space-y-4">
        <div className="bg-card border border-border p-5 md:p-7 rounded-lg">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Material Input</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste lecture transcript, study notes, textbook excerpts..."
            className="w-full h-48 md:h-56 bg-muted/30 p-4 border border-border outline-none font-serif text-sm md:text-base focus:border-accent transition-all resize-none rounded-lg"
          />

          <AnimatePresence>
            {selectedFiles.length > 0 && selectedFiles.map((file, idx) => (
              <motion.div
                key={file.name + idx}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 p-3 bg-primary text-primary-foreground flex items-center justify-between border-l-4 border-accent rounded-lg"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {file.type.startsWith('image/') ? <ImageIcon size={16} className="text-accent" /> : <FileIcon size={16} className="text-accent" />}
                  <div className="overflow-hidden">
                    <div className="text-[9px] font-bold uppercase tracking-widest">File {idx + 1}</div>
                    <div className="text-[10px] font-mono truncate max-w-[200px] md:max-w-none">{file.name}</div>
                  </div>
                </div>
                <button onClick={() => removeFile(idx)} className="p-2 hover:bg-destructive transition-colors text-primary-foreground/50 hover:text-primary-foreground rounded-full">
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="mt-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-3 border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent hover:border-accent transition-all rounded-lg"
            >
              <Upload size={14} /> Attach File{selectedFiles.length > 0 ? 's' : ''} {selectedFiles.length > 0 && `(${selectedFiles.length})`}
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-4">
        <div className="bg-primary text-primary-foreground p-5 md:p-6 border-l-4 border-accent rounded-lg">
          <div className="flex items-center gap-3 mb-5">
            <Sliders size={16} className="text-accent" />
            <h3 className="font-serif text-lg italic">Rigidity Level</h3>
          </div>
          <div className="space-y-2">
            {(['Standard', 'Strict', 'Rigid'] as Rigidity[]).map((level) => (
              <button
                key={level}
                onClick={() => setRigidity(level)}
                className={`w-full text-left p-3.5 border transition-all flex justify-between items-center rounded-lg ${
                  rigidity === level ? 'bg-accent text-accent-foreground border-accent' : 'border-primary-foreground/10 hover:bg-primary-foreground/5'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest">{level}</span>
                {rigidity === level && <CheckCircle2 size={14} />}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-primary-foreground/40 mt-4 leading-relaxed">
            {rigidity === 'Standard' && 'Foundational concepts and direct recall.'}
            {rigidity === 'Strict' && 'Application, critical thinking, nuanced relationships.'}
            {rigidity === 'Rigid' && 'Advanced synthesis, edge cases, complex deductions.'}
          </p>

          <label className="block text-[9px] font-bold uppercase tracking-widest text-primary-foreground/40 mb-2 mt-5">Number of Questions</label>
          <div className="flex flex-wrap items-center gap-1.5">
            {[10, 25, 50, 75, 100, 120].map(n => (
              <button
                key={n}
                onClick={() => setQuestionCount(n)}
                className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${
                  questionCount === n
                    ? 'bg-accent text-accent-foreground'
                    : 'border border-primary-foreground/10 text-primary-foreground/50 hover:bg-primary-foreground/5'
                }`}
              >
                {n}
              </button>
            ))}
            <input
              type="number"
              min={1}
              max={200}
              value={![10, 25, 50, 75, 100, 120].includes(questionCount) ? questionCount : ''}
              placeholder="Custom"
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (!isNaN(v) && v > 0 && v <= 200) setQuestionCount(v);
              }}
              className={`w-20 px-2 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all text-center outline-none ${
                ![10, 25, 50, 75, 100, 120].includes(questionCount)
                  ? 'bg-accent text-accent-foreground'
                  : 'border border-primary-foreground/10 text-primary-foreground/50 bg-transparent placeholder:text-primary-foreground/30'
              }`}
            />
          </div>
        </div>

        <div className="bg-primary text-primary-foreground p-5 md:p-6 border-l-4 border-accent rounded-lg">
          <label className="block text-[9px] font-bold uppercase tracking-widest text-primary-foreground/40 mb-2">Depth Level</label>
          <div className="flex flex-wrap gap-1.5">
            {(['beginner', 'intermediate', 'advanced'] as DepthLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setDepth(level)}
                className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${
                  depth === level
                    ? 'bg-accent text-accent-foreground'
                    : 'border border-primary-foreground/10 text-primary-foreground/50 hover:bg-primary-foreground/5'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-primary-foreground/30 mt-2">
            {depth === 'beginner' && 'Simple language, straightforward questions.'}
            {depth === 'intermediate' && 'Standard academic depth.'}
            {depth === 'advanced' && 'Expert-level with edge cases.'}
          </p>
        </div>

        <button
          onClick={generateQuiz}
          disabled={!inputText.trim() && selectedFiles.length === 0}
          className="w-full py-5 md:py-6 bg-accent text-accent-foreground font-bold uppercase tracking-[0.2em] text-xs border border-accent hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg rounded-lg"
        >
          Initialize Protocol <ChevronRight size={16} />
        </button>
      </div>
    </div>
  </motion.div>
);

const GeneratingView: React.FC<{ partialContent?: string }> = ({ partialContent = '' }) => (
  <div className="h-[60vh] flex flex-col items-center justify-center text-center px-6">
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} className="mb-8 text-accent">
      <RefreshCcw size={64} strokeWidth={1} />
    </motion.div>
    <h2 className="font-serif text-3xl md:text-4xl text-primary mb-4">Generating Your Quiz</h2>
    <GenerationProgress isGenerating={true} partialContent={partialContent} label="AI is crafting questions" />
    <div className="w-48 h-1 bg-muted mt-6 overflow-hidden relative rounded-full">
      <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="absolute inset-0 w-1/2 bg-primary" />
    </div>
  </div>
);

interface QuizViewProps {
  questions: Question[];
  currentIdx: number;
  userAnswers: number[];
  handleAnswer: (idx: number) => void;
  goToPrevious: () => void;
  goToNext: () => void;
  goToQuestion: (idx: number) => void;
  finishQuiz: () => void;
  timeElapsed: number;
  rigidity: Rigidity;
  resetQuiz: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({
  questions,
  currentIdx,
  userAnswers,
  handleAnswer,
  goToPrevious,
  goToNext,
  goToQuestion,
  finishQuiz,
  timeElapsed,
  rigidity,
  resetQuiz,
}) => {
  const q = questions[currentIdx];
  if (!q) return null;
  const progress = ((currentIdx + 1) / questions.length) * 100;
  const answeredCount = userAnswers.filter(a => a !== undefined).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <button
            onClick={resetQuiz}
            className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors mb-3"
          >
            <ChevronLeft size={12} />
            <span>Exit Quiz</span>
          </button>
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Examination</div>
          <h2 className="font-serif text-2xl md:text-3xl text-primary">Quiz — {rigidity} Mode</h2>
        </div>
        <div className="flex items-center gap-3">
          <Clock size={14} className="text-muted-foreground" />
          <span className="text-xl font-mono text-primary">{formatTime(timeElapsed)}</span>
        </div>
      </div>

      <div className="w-full h-1.5 bg-muted mb-10 overflow-hidden rounded-full">
        <motion.div animate={{ width: `${progress}%` }} className="h-full bg-accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div key={currentIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div>
                <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Question {currentIdx + 1} / {questions.length}</span>
                <h3 className="font-serif text-2xl md:text-3xl text-primary leading-tight mt-3 italic">"{q.question}"</h3>
              </div>

              <div className="space-y-3">
                {q.options.map((opt, i) => {
                  const isSelected = userAnswers[currentIdx] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      className={`w-full text-left p-4 md:p-5 bg-card border group transition-all flex items-center gap-4 shadow-sm hover:shadow-md rounded-lg ${
                        isSelected ? 'border-accent bg-accent/5' : 'border-border hover:border-primary'
                      }`}
                    >
                      <div className={`w-9 h-9 border flex items-center justify-center font-bold text-xs shrink-0 rounded-md transition-colors ${
                        isSelected
                          ? 'bg-accent text-accent-foreground border-accent'
                          : 'border-border bg-muted/50 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary'
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="text-sm md:text-base text-foreground font-light">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <button
                  onClick={goToPrevious}
                  disabled={currentIdx === 0}
                  className="flex items-center gap-2 px-4 py-3 border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent hover:border-accent transition-all disabled:opacity-30 disabled:cursor-not-allowed rounded-lg"
                >
                  <ChevronLeft size={14} /> Previous
                </button>

                {currentIdx < questions.length - 1 ? (
                  <button
                    onClick={goToNext}
                    className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-accent-foreground transition-all rounded-lg"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={finishQuiz}
                    disabled={answeredCount === 0}
                    className="flex items-center gap-2 px-5 py-3 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  >
                    Finish Quiz <Trophy size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="lg:col-span-4 mt-4 lg:mt-0 space-y-4">
          <div className="bg-primary text-primary-foreground p-5 md:p-6 border-l-4 border-accent relative overflow-hidden rounded-lg">
            <div className="absolute top-0 right-0 p-4 opacity-5"><BrainCircuit size={80} /></div>
            <div className="relative z-10">
              <h4 className="text-[9px] font-bold text-accent uppercase tracking-[0.4em] mb-5">Status</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-primary-foreground/10 pb-3">
                  <span className="text-[9px] font-bold uppercase text-primary-foreground/40">Rigidity</span>
                  <span className="text-xs font-bold uppercase text-accent">{rigidity}</span>
                </div>
                <div className="flex justify-between items-center border-b border-primary-foreground/10 pb-3">
                  <span className="text-[9px] font-bold uppercase text-primary-foreground/40">Progress</span>
                  <span className="text-xs font-bold uppercase text-primary-foreground">{Math.round(progress)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold uppercase text-primary-foreground/40">Answered</span>
                  <span className="text-xs font-bold text-primary-foreground">{answeredCount}/{questions.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Navigator */}
          <div className="bg-card border border-border p-4 rounded-lg">
            <h4 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Question Map</h4>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((_, i) => {
                const isAnswered = userAnswers[i] !== undefined;
                const isCurrent = i === currentIdx;
                return (
                  <button
                    key={i}
                    onClick={() => goToQuestion(i)}
                    className={`w-full aspect-square flex items-center justify-center text-[10px] font-bold rounded-md transition-all ${
                      isCurrent
                        ? 'bg-accent text-accent-foreground ring-2 ring-accent ring-offset-1'
                        : isAnswered
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Build questions text content */
const buildQuestionsText = (questions: Question[]) => {
  let text = 'AI QUIZ — QUESTIONS\n';
  text += '='.repeat(50) + '\n\n';
  questions.forEach((q, i) => {
    text += `Q${i + 1}. ${q.question}\n`;
    q.options.forEach((opt, j) => {
      text += `   ${String.fromCharCode(65 + j)}. ${opt}\n`;
    });
    text += '\n';
  });
  return text;
};

/** Build results text content */
const buildResultsText = (questions: Question[], userAnswers: number[], score: number, timeElapsed: number) => {
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  let text = 'AI QUIZ — RESULTS & EXPLANATIONS\n';
  text += '='.repeat(50) + '\n';
  text += `Score: ${score}/${questions.length} (${percentage}%)\n`;
  text += `Time: ${Math.floor(timeElapsed / 60)}m ${timeElapsed % 60}s\n`;
  text += '='.repeat(50) + '\n\n';
  questions.forEach((q, i) => {
    const isCorrect = userAnswers[i] === q.correctIndex;
    text += `Q${i + 1}. ${q.question}\n`;
    q.options.forEach((opt, j) => {
      const marker = j === q.correctIndex ? ' [CORRECT]' : j === userAnswers[i] ? ' [YOUR ANSWER]' : '';
      text += `   ${String.fromCharCode(65 + j)}. ${opt}${marker}\n`;
    });
    text += `\n   Your answer: ${userAnswers[i] !== undefined ? String.fromCharCode(65 + userAnswers[i]) : 'Unanswered'} — ${isCorrect ? 'CORRECT' : 'INCORRECT'}\n`;
    text += `   Correct answer: ${String.fromCharCode(65 + q.correctIndex)}\n`;
    text += `   Explanation: ${q.explanation}\n\n`;
  });
  return text;
};

const downloadTextFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const exportDocx = async (title: string, buildParagraphs: () => Paragraph[], filename: string) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ text: title, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
        new Paragraph({ text: '' }),
        ...buildParagraphs(),
      ],
    }],
  });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
};

const exportPdf = (content: string, filename: string) => {
  const pdf = new jsPDF();
  const margin = 15;
  const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
  const lines = pdf.splitTextToSize(content, pageWidth);
  let y = margin;
  const lineHeight = 6;
  lines.forEach((line: string) => {
    if (y + lineHeight > pdf.internal.pageSize.getHeight() - margin) {
      pdf.addPage();
      y = margin;
    }
    pdf.text(line, margin, y);
    y += lineHeight;
  });
  pdf.save(filename);
};

const buildQuestionsParagraphs = (questions: Question[]): Paragraph[] => {
  const paragraphs: Paragraph[] = [];
  questions.forEach((q, i) => {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: `Q${i + 1}. ${q.question}`, bold: true, size: 24 })],
      spacing: { before: 200 },
    }));
    q.options.forEach((opt, j) => {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: `   ${String.fromCharCode(65 + j)}. ${opt}`, size: 22 })],
      }));
    });
    paragraphs.push(new Paragraph({ text: '' }));
  });
  return paragraphs;
};

const buildResultsParagraphs = (questions: Question[], userAnswers: number[], score: number, timeElapsed: number): Paragraph[] => {
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const paragraphs: Paragraph[] = [
    new Paragraph({ children: [new TextRun({ text: `Score: ${score}/${questions.length} (${percentage}%)`, bold: true, size: 24 })] }),
    new Paragraph({ children: [new TextRun({ text: `Time: ${Math.floor(timeElapsed / 60)}m ${timeElapsed % 60}s`, size: 22 })] }),
    new Paragraph({ text: '' }),
  ];
  questions.forEach((q, i) => {
    const isCorrect = userAnswers[i] === q.correctIndex;
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: `Q${i + 1}. ${q.question}`, bold: true, size: 24 })],
      spacing: { before: 200 },
    }));
    q.options.forEach((opt, j) => {
      const isAnswer = j === q.correctIndex;
      const isWrong = j === userAnswers[i] && !isAnswer;
      paragraphs.push(new Paragraph({
        children: [new TextRun({
          text: `   ${String.fromCharCode(65 + j)}. ${opt}${isAnswer ? ' [CORRECT]' : isWrong ? ' [WRONG]' : ''}`,
          size: 22,
          bold: isAnswer,
          color: isAnswer ? '16A34A' : isWrong ? 'DC2626' : '000000',
        })],
      }));
    });
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: `   ${isCorrect ? 'CORRECT' : 'INCORRECT'} — Explanation: ${q.explanation}`, italics: true, size: 20 })],
      spacing: { after: 100 },
    }));
  });
  return paragraphs;
};

type ExportFormat = 'txt' | 'pdf' | 'docx';

const ExportDropdown: React.FC<{ label: string; icon: React.ReactNode; onExport: (format: ExportFormat) => void }> = ({ label, icon, onExport }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <button
        onClick={() => setOpen(!open)}
        className="w-full py-3 border border-border text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:border-accent hover:text-accent transition-all rounded-lg"
      >
        {icon} {label}
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {(['txt', 'pdf', 'docx'] as ExportFormat[]).map(fmt => (
            <button
              key={fmt}
              onClick={() => { onExport(fmt); setOpen(false); }}
              className="w-full px-4 py-2.5 text-left text-xs font-medium text-foreground hover:bg-accent/10 flex items-center gap-2 transition-colors"
            >
              <FileText size={12} /> {fmt.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface ResultViewProps {
  questions: Question[];
  score: number;
  resetQuiz: () => void;
  timeElapsed: number;
  userAnswers: number[];
  navigate: (path: string) => void;
  topicName: string;
  onReviewMistakes: () => void;
  onSaveToQuizlets: () => void;
  onSendToFlashcards: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({
  questions,
  score,
  resetQuiz,
  timeElapsed,
  userAnswers,
  navigate,
  topicName,
  onReviewMistakes,
  onSaveToQuizlets,
  onSendToFlashcards,
}) => {
  const safeName = (topicName.split('\n')[0] || 'quiz').replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 60) || 'quiz';
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const rank = percentage >= 80 ? 'Distinction' : percentage >= 60 ? 'Merit' : percentage >= 40 ? 'Pass' : 'Needs Review';
  const incorrectCount = questions.filter((q, i) => userAnswers[i] !== q.correctIndex).length;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Score Card */}
        <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-4">
          <div className="bg-primary text-primary-foreground p-7 md:p-8 border-l-8 border-accent shadow-xl relative overflow-hidden rounded-lg">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Trophy size={120} /></div>
            <div className="relative z-10">
              <div className="text-[9px] font-bold text-accent uppercase tracking-[0.4em] mb-6">Performance</div>
              <div className="text-6xl md:text-7xl font-serif mb-2 leading-none">{percentage}<span className="text-xl text-accent/50">%</span></div>
              <div className="text-[10px] font-bold text-primary-foreground/40 uppercase tracking-widest border-t border-primary-foreground/10 pt-5 mb-8">Score: {score}/{questions.length}</div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-[8px] font-bold text-primary-foreground/30 uppercase tracking-widest mb-1">Rank</div>
                  <div className="text-lg font-serif text-accent">{rank}</div>
                </div>
                <div>
                  <div className="text-[8px] font-bold text-primary-foreground/30 uppercase tracking-widest mb-1">Time</div>
                  <div className="text-lg font-serif text-accent">{formatTime(timeElapsed)}</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={resetQuiz}
            className="w-full py-4 bg-accent text-accent-foreground font-bold uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground border border-accent transition-all rounded-lg"
          >
            <RefreshCcw size={14} /> New Quiz
          </button>

          {incorrectCount > 0 && (
            <button
              onClick={onReviewMistakes}
              className="w-full py-4 border-2 border-accent text-accent font-bold uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-accent hover:text-accent-foreground transition-all rounded-lg"
            >
              <RefreshCcw size={14} /> Review {incorrectCount} Mistake{incorrectCount > 1 ? 's' : ''}
            </button>
          )}

          {/* Export Buttons */}
          <div className="space-y-2">
            <ExportDropdown
              label="Export Questions"
              icon={<Download size={14} />}
              onExport={(fmt) => {
                const text = buildQuestionsText(questions);
                if (fmt === 'txt') downloadTextFile(text, `${safeName}-questions.txt`);
                else if (fmt === 'pdf') exportPdf(text, `${safeName}-questions.pdf`);
                else exportDocx('AI Quiz — Questions', () => buildQuestionsParagraphs(questions), `${safeName}-questions.docx`);
              }}
            />
            <ExportDropdown
              label="Export Results"
              icon={<FileDown size={14} />}
              onExport={(fmt) => {
                const text = buildResultsText(questions, userAnswers, score, timeElapsed);
                if (fmt === 'txt') downloadTextFile(text, `${safeName}-results.txt`);
                else if (fmt === 'pdf') exportPdf(text, `${safeName}-results.pdf`);
                else exportDocx('AI Quiz — Results & Explanations', () => buildResultsParagraphs(questions, userAnswers, score, timeElapsed), `${safeName}-results.docx`);
              }}
            />
          </div>

          {/* Cross-tool & Save */}
          <button onClick={onSendToFlashcards}
            className="w-full py-3 border border-border text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:border-accent hover:text-accent transition-all rounded-lg">
            <CreditCard size={14} /> Send to Flashcards
          </button>
          <button onClick={onSaveToQuizlets}
            className="w-full py-3 border border-accent text-accent font-bold uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-accent hover:text-accent-foreground transition-all rounded-lg">
            <BookOpen size={14} /> Save to Quizlets
          </button>

          <button
            onClick={() => navigate('/resources')}
            className="w-full py-3 border border-border text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:border-accent hover:text-accent transition-all rounded-lg"
          >
            <ChevronLeft size={14} /> Back to Resources
          </button>
        </div>

        {/* Detailed Review */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
            <h3 className="font-serif text-2xl text-primary italic">Detailed Review</h3>
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{questions.length} Questions</span>
          </div>

          <div className="space-y-6">
            {questions.map((q, i) => {
              const isCorrect = userAnswers[i] === q.correctIndex;
              return (
                <div key={i} className="bg-card border border-border p-5 md:p-6 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                      {isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Q{i + 1}</span>
                      <h4 className="font-serif text-lg text-primary mb-4 leading-snug">{q.question}</h4>

                      <div className="space-y-1.5 mb-5">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userAnswers[i] === optIdx;
                          const isTrueCorrect = q.correctIndex === optIdx;
                          return (
                            <div
                              key={optIdx}
                              className={`p-3 text-sm flex justify-between items-center gap-2 rounded-md ${
                                isTrueCorrect ? 'bg-emerald-50 text-emerald-800' : isSelected ? 'bg-red-50 text-red-800' : 'text-muted-foreground'
                              }`}
                            >
                              <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                              {isTrueCorrect && <span className="text-[8px] font-bold uppercase tracking-widest bg-emerald-200 px-2 py-0.5 text-emerald-800 shrink-0 rounded">Correct</span>}
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-muted/50 p-4 border-l-4 border-accent rounded-r-lg">
                        <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                          <Sparkles size={10} /> Explanation
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed italic">{q.explanation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const AIQuizPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<'upload' | 'generating' | 'quiz' | 'result'>('upload');
  const [inputText, setInputText] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aiquiz_state') || '{}').inputText || ''; } catch { return ''; }
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [rigidity, setRigidity] = useState<Rigidity>(() => {
    try { return JSON.parse(localStorage.getItem('aiquiz_state') || '{}').rigidity || 'Standard'; } catch { return 'Standard'; }
  });
  const [questionCount, setQuestionCount] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aiquiz_state') || '{}').questionCount || 25; } catch { return 25; }
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  const [depth, setDepth] = useState<DepthLevel>(() => {
    try { return (localStorage.getItem('aiquiz_depth') as DepthLevel) || 'intermediate'; } catch { return 'intermediate'; }
  });

  // Persist state to localStorage
  useEffect(() => {
    const state = { inputText, rigidity, questionCount, step: step === 'generating' ? 'upload' : step };
    localStorage.setItem('aiquiz_state', JSON.stringify(state));
  }, [inputText, rigidity, questionCount, step]);
  useEffect(() => { localStorage.setItem('aiquiz_depth', depth); }, [depth]);

  useEffect(() => {
    return () => stopTimer();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(f => {
        if (f.size > 10 * 1024 * 1024) { toast.error(`${f.name} too large. Max 10MB.`); return false; }
        return true;
      });
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (idx: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const generateQuiz = async () => {
    setStep('generating');
    try {
      let fileContent = '';
      let fileName = '';
      let imageDataUrl = '';

      if (selectedFiles.length > 0) {
        const results = await readMultipleFiles(selectedFiles);
        const { mergedText, imageDataUrls } = mergeFileContents(results);
        fileContent = mergedText;
        fileName = selectedFiles.map(f => f.name).join(', ');
        if (imageDataUrls.length > 0) imageDataUrl = imageDataUrls[0]; // first image for vision
      }

      const { data, error } = await supabase.functions.invoke('ai-quiz', {
        body: {
          material: inputText || undefined,
          rigidity: rigidity || 'Standard',
          fileName: fileName || undefined,
          fileContent: fileContent || undefined,
          count: questionCount,
          depth,
          ...(imageDataUrl ? { imageData: imageDataUrl } : {}),
        },
      });

      if (error) throw error;
      if (data?.error) {
        if (data.error.includes('Rate limit')) toast.error('Rate limit reached. Please wait.');
        else if (data.error.includes('credits')) toast.error('AI credits exhausted.');
        else toast.error(data.error);
        setStep('upload');
        return;
      }

      if (!data?.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error('No questions generated. Try providing more detailed material.');
      }

      const quizQuestions = data.questions.slice(0, questionCount);
      setQuestions(quizQuestions);
      setUserAnswers([]);
      setCurrentIdx(0);
      setStep('quiz');
      startTimer();

      // Cache for offline access
      cacheOutput({
        tool: 'quiz',
        topic: inputText.trim().substring(0, 200) || fileName || 'Untitled Quiz',
        result: quizQuestions,
        depth,
      });
    } catch (error: any) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Quiz generation failed. Please try again.';
      toast.error(message);
      setStep('upload');
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeElapsed(0);
    timerRef.current = window.setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const autoAdvanceRef = useRef<number | null>(null);

  const handleAnswer = (idx: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentIdx] = idx;
    setUserAnswers(newAnswers);
    // Auto-advance with debounce to prevent race conditions
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    if (currentIdx < questions.length - 1) {
      autoAdvanceRef.current = window.setTimeout(() => {
        setCurrentIdx(prev => Math.min(prev + 1, questions.length - 1));
        autoAdvanceRef.current = null;
      }, 350);
    }
  };

  const goToQuestion = (idx: number) => {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    setCurrentIdx(idx);
  };

  const goToPrevious = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  const goToNext = () => {
    if (currentIdx < questions.length - 1) setCurrentIdx(currentIdx + 1);
  };

  const finishQuiz = () => {
    stopTimer();
    setStep('result');
  };

  const score = userAnswers.reduce((acc, val, i) => (val === questions[i]?.correctIndex ? acc + 1 : acc), 0);

  const resetQuiz = () => {
    setStep('upload');
    setQuestions([]);
    setUserAnswers([]);
    setInputText('');
    setSelectedFiles([]);
    setCurrentIdx(0);
    stopTimer();
    setTimeElapsed(0);
    localStorage.removeItem('aiquiz_state');
  };

  const saveToQuizlets = async () => {
    if (!user) { toast.error('Please sign in to save quizlets'); navigate('/auth'); return; }
    if (!questions || questions.length === 0) {
      toast.error('No questions to save');
      return;
    }
    try {
      const title = inputText.trim().substring(0, 200) || 'AI Generated Quiz';
      const { data, error } = await supabase.from('quizlets').insert({
        title,
        description: `${questions.length} questions • ${rigidity} rigidity • ${depth} depth`,
        questions: questions as any,
        question_count: questions.length,
        difficulty: depth,
        rigidity,
        created_by: user.id,
      }).select('id').single();
      if (error) throw error;
      toast.success('Quiz saved to Quizlets!');
      navigate(data?.id ? `/resources/quizlets/${data.id}` : '/resources/quizlets');
    } catch (err: any) {
      console.error('saveToQuizlets failed:', err);
      toast.error(err?.message ? `Save failed: ${err.message}` : 'Failed to save quiz');
    }
  };

  const sendToFlashcards = () => {
    const flashcardData = questions.map(q => ({
      front: q.question,
      back: `${q.options[q.correctIndex]}\n\n${q.explanation}`,
      difficulty: 'Medium' as const,
    }));
    localStorage.setItem('flashcard_state', JSON.stringify({
      topic: inputText.trim().substring(0, 100) || 'Quiz Flashcards',
      material: '',
      cards: flashcardData,
      mastered: [],
      srMap: {},
    }));
    toast.success('Sent to Flashcards!');
    navigate('/resources/flashcards');
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="AI Quiz - Test Your Knowledge" description="Upload study materials and get 25 tailor-made quiz questions powered by AI." />

      <AIToolsHeader title="AI Quiz" subtitle="AI-Powered Assessment" icon={BrainCircuit} />

      <div className="container mx-auto px-4 max-w-6xl py-10">
        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <UploadView
              key="upload"
              inputText={inputText}
              setInputText={setInputText}
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              selectedFiles={selectedFiles}
              removeFile={removeFile}
              rigidity={rigidity}
              setRigidity={setRigidity}
              questionCount={questionCount}
              setQuestionCount={setQuestionCount}
              generateQuiz={generateQuiz}
              depth={depth}
              setDepth={setDepth}
            />
          )}
          {step === 'generating' && <GeneratingView key="generating" />}
          {step === 'quiz' && (
            <QuizView
              key="quiz"
              questions={questions}
              currentIdx={currentIdx}
              userAnswers={userAnswers}
              handleAnswer={handleAnswer}
              goToPrevious={goToPrevious}
              goToNext={goToNext}
              goToQuestion={goToQuestion}
              finishQuiz={finishQuiz}
              timeElapsed={timeElapsed}
              rigidity={rigidity}
              resetQuiz={resetQuiz}
            />
          )}
          {step === 'result' && (
            <ResultView
              key="result"
              questions={questions}
              score={score}
              resetQuiz={resetQuiz}
              timeElapsed={timeElapsed}
              userAnswers={userAnswers}
              navigate={navigate}
              topicName={inputText}
              onSaveToQuizlets={saveToQuizlets}
              onSendToFlashcards={sendToFlashcards}
              onReviewMistakes={() => {
                // Filter to only incorrectly answered questions
                const incorrectIndices = questions.map((q, i) => userAnswers[i] !== q.correctIndex ? i : -1).filter(i => i !== -1);
                const mistakeQuestions = incorrectIndices.map(i => questions[i]);
                setQuestions(mistakeQuestions);
                setUserAnswers([]);
                setCurrentIdx(0);
                setStep('quiz');
                startTimer();
                toast.success(`Reviewing ${mistakeQuestions.length} missed question${mistakeQuestions.length > 1 ? 's' : ''}`);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIQuizPage;
