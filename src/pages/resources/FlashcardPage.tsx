import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, Send, Loader2, Sparkles, RefreshCcw,
  Upload, FileIcon, Trash2, ImageIcon, ChevronLeft, ChevronRight,
  RotateCcw, Shuffle, Filter
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import AIToolsHeader from '@/components/resources/AIToolsHeader';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Flashcard {
  front: string;
  back: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    if (file.type.startsWith('image/')) reader.readAsDataURL(file);
    else reader.readAsText(file);
  });
};

const difficultyColors: Record<string, string> = {
  Easy: 'bg-emerald-100 text-emerald-800',
  Medium: 'bg-amber-100 text-amber-800',
  Hard: 'bg-red-100 text-red-800',
};

const FlashcardPage = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState(() => {
    try { return JSON.parse(localStorage.getItem('flashcard_state') || '{}').topic || ''; } catch { return ''; }
  });
  const [material, setMaterial] = useState(() => {
    try { return JSON.parse(localStorage.getItem('flashcard_state') || '{}').material || ''; } catch { return ''; }
  });
  const [cards, setCards] = useState<Flashcard[]>(() => {
    try { return JSON.parse(localStorage.getItem('flashcard_state') || '{}').cards || []; } catch { return []; }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Flashcard viewer state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null);
  const [mastered, setMastered] = useState<Set<number>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('flashcard_state') || '{}').mastered || []); } catch { return new Set(); }
  });

  const filteredCards = filterDifficulty
    ? cards.filter(c => c.difficulty === filterDifficulty)
    : cards;

  useEffect(() => {
    const state = { topic, material, cards, mastered: Array.from(mastered) };
    localStorage.setItem('flashcard_state', JSON.stringify(state));
  }, [topic, material, cards, mastered]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) { toast.error('File too large. Max 10MB.'); return; }
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = useCallback(async () => {
    if (!topic.trim() && !material.trim() && !selectedFile) {
      toast.error('Enter a topic, paste material, or upload a file');
      return;
    }
    setIsLoading(true);
    try {
      let fileContent = '';
      if (selectedFile) fileContent = await readFileAsText(selectedFile);

      const { data, error } = await supabase.functions.invoke('flashcard-gen', {
        body: {
          topic: topic.trim(),
          material: material.trim() + (fileContent ? `\n\n--- UPLOADED FILE (${selectedFile?.name}) ---\n${fileContent}` : ''),
          count: 20,
        },
      });

      if (error) throw error;
      if (data?.error) {
        if (data.error.includes('Rate limit')) toast.error('Rate limit reached.');
        else if (data.error.includes('credits')) toast.error('AI credits exhausted.');
        else toast.error(data.error);
        return;
      }

      if (!data?.flashcards || data.flashcards.length === 0) throw new Error('No flashcards generated');

      setCards(data.flashcards);
      setCurrentIdx(0);
      setFlipped(false);
      setMastered(new Set());
      setFilterDifficulty(null);
      toast.success(`${data.flashcards.length} flashcards generated!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate flashcards.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, material, selectedFile]);

  const handleReset = () => {
    setCards([]);
    setTopic('');
    setMaterial('');
    setSelectedFile(null);
    setCurrentIdx(0);
    setFlipped(false);
    setMastered(new Set());
    setFilterDifficulty(null);
    localStorage.removeItem('flashcard_state');
  };

  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIdx(0);
    setFlipped(false);
  };

  const toggleMastered = () => {
    const realIdx = cards.indexOf(filteredCards[currentIdx]);
    setMastered(prev => {
      const next = new Set(prev);
      if (next.has(realIdx)) next.delete(realIdx);
      else next.add(realIdx);
      return next;
    });
  };

  const card = filteredCards[currentIdx];

  return (
    <div className="min-h-screen bg-background">
      <SEO title="AI Flashcards - Study Smart" description="Generate flashcards from any topic or material using AI." />

      <AIToolsHeader
        title="Flashcards"
        icon={CreditCard}
        rightContent={cards.length > 0 ? (
          <div className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/40">
            {mastered.size}/{cards.length} Mastered
          </div>
        ) : undefined}
      />

      <div className="container mx-auto px-4 max-w-6xl py-8">
        {cards.length === 0 ? (
          /* Input View */
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <div className="bg-card border border-border p-5 md:p-6 rounded-lg">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Topic or Question</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder='e.g. "Contract Law fundamentals" or "Organic Chemistry reactions"'
                    className="w-full bg-muted/50 border border-border p-3 md:p-4 text-sm outline-none focus:border-accent transition-colors rounded-lg"
                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleGenerate()}
                  />

                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 mt-5">
                    Additional Material <span className="text-muted-foreground/50">(optional)</span>
                  </label>
                  <textarea
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="Paste lecture notes, textbook excerpts, or any study material..."
                    className="w-full bg-muted/50 border border-border p-3 md:p-4 text-sm outline-none focus:border-accent transition-colors resize-none h-32 md:h-40 rounded-lg"
                  />

                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*,.pdf,.docx,.doc,.txt,.xlsx,.xls,.pptx,.ppt,.md" />

                  <AnimatePresence>
                    {selectedFile && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-4 bg-primary text-primary-foreground flex items-center justify-between border-l-4 border-accent rounded-lg"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          {selectedFile.type.startsWith('image/') ? <ImageIcon size={16} className="text-accent" /> : <FileIcon size={16} className="text-accent" />}
                          <div className="overflow-hidden">
                            <div className="text-[9px] font-bold uppercase tracking-widest">Attached Material</div>
                            <div className="text-[10px] font-mono truncate max-w-[200px] md:max-w-none">{selectedFile.name}</div>
                          </div>
                        </div>
                        <button onClick={removeFile} className="p-2 hover:bg-destructive transition-colors text-primary-foreground/50 hover:text-primary-foreground rounded-full">
                          <Trash2 size={14} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-3 border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent hover:border-accent transition-all rounded-lg"
                    >
                      <Upload size={14} /> Attach File
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-4">
                <div className="bg-primary text-primary-foreground p-5 md:p-6 border-l-4 border-accent rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard size={18} className="text-accent" />
                    <h3 className="font-serif text-lg italic">Flashcard Generator</h3>
                  </div>
                  <p className="text-xs text-primary-foreground/60 leading-relaxed mb-4">
                    Generate 20 AI-powered flashcards with mixed difficulty levels. Tap to flip, swipe through, and mark cards as mastered.
                  </p>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-primary-foreground/30">Ready for input</div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isLoading || (!topic.trim() && !material.trim() && !selectedFile)}
                  className="w-full py-5 bg-accent text-accent-foreground font-bold uppercase tracking-[0.2em] text-xs border border-accent hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 rounded-lg"
                >
                  {isLoading ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Sparkles size={16} /> Generate Flashcards</>}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Flashcard Viewer */
          <div className="max-w-3xl mx-auto">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2">
                <button onClick={shuffleCards} className="p-2.5 border border-border hover:border-accent text-muted-foreground hover:text-accent transition-colors rounded-lg" title="Shuffle">
                  <Shuffle size={14} />
                </button>
                <button onClick={handleReset} className="p-2.5 border border-border hover:border-accent text-muted-foreground hover:text-accent transition-colors rounded-lg" title="New set">
                  <RefreshCcw size={14} />
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <Filter size={12} className="text-muted-foreground mr-1" />
                {['Easy', 'Medium', 'Hard'].map(d => (
                  <button
                    key={d}
                    onClick={() => { setFilterDifficulty(filterDifficulty === d ? null : d); setCurrentIdx(0); setFlipped(false); }}
                    className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-md transition-all ${
                      filterDifficulty === d ? difficultyColors[d] : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {currentIdx + 1} / {filteredCards.length}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-muted mb-8 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${((currentIdx + 1) / filteredCards.length) * 100}%` }}
                className="h-full bg-accent"
              />
            </div>

            {/* Card */}
            {card && (
              <div className="perspective-1000 mb-8">
                <motion.div
                  className="relative w-full cursor-pointer"
                  style={{ minHeight: '320px' }}
                  onClick={() => setFlipped(!flipped)}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={flipped ? 'back' : 'front'}
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: -90, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`w-full p-8 md:p-12 border-2 rounded-xl shadow-lg flex flex-col justify-center items-center text-center ${
                        flipped
                          ? 'bg-primary text-primary-foreground border-accent'
                          : 'bg-card text-foreground border-border'
                      }`}
                      style={{ minHeight: '320px' }}
                    >
                      <div className="absolute top-4 left-4">
                        <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded ${difficultyColors[card.difficulty]}`}>
                          {card.difficulty}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className={`text-[8px] font-bold uppercase tracking-widest ${flipped ? 'text-accent' : 'text-muted-foreground'}`}>
                          {flipped ? 'Answer' : 'Question'}
                        </span>
                      </div>

                      {mastered.has(cards.indexOf(card)) && (
                        <div className="absolute bottom-4 right-4 text-[8px] font-bold uppercase tracking-widest text-emerald-500">
                          ✓ Mastered
                        </div>
                      )}

                      <p className={`font-serif text-xl md:text-2xl leading-relaxed italic ${flipped ? '' : ''}`}>
                        {flipped ? card.back : card.front}
                      </p>

                      <div className={`mt-6 text-[9px] font-bold uppercase tracking-widest ${flipped ? 'text-primary-foreground/30' : 'text-muted-foreground/40'}`}>
                        Tap to {flipped ? 'see question' : 'reveal answer'}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => { setCurrentIdx(Math.max(0, currentIdx - 1)); setFlipped(false); }}
                disabled={currentIdx === 0}
                className="flex items-center gap-2 px-4 py-3 border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent hover:border-accent transition-all disabled:opacity-30 rounded-lg"
              >
                <ChevronLeft size={14} /> Prev
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFlipped(!flipped)}
                  className="p-3 border border-border hover:border-accent text-muted-foreground hover:text-accent transition-colors rounded-lg"
                  title="Flip"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={toggleMastered}
                  className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                    card && mastered.has(cards.indexOf(card))
                      ? 'bg-emerald-600 text-white border border-emerald-600'
                      : 'border border-border text-muted-foreground hover:border-emerald-500 hover:text-emerald-600'
                  }`}
                >
                  {card && mastered.has(cards.indexOf(card)) ? '✓ Mastered' : 'Mark Mastered'}
                </button>
              </div>

              <button
                onClick={() => { setCurrentIdx(Math.min(filteredCards.length - 1, currentIdx + 1)); setFlipped(false); }}
                disabled={currentIdx === filteredCards.length - 1}
                className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-accent-foreground transition-all disabled:opacity-30 rounded-lg"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardPage;
