/**
 * Progress indicator for AI generation showing word count, elapsed time, 
 * and a pulsing "AI is writing..." indicator.
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, Type } from 'lucide-react';

interface GenerationProgressProps {
  isGenerating: boolean;
  partialContent: string;
  label?: string;
}

const GenerationProgress: React.FC<GenerationProgressProps> = ({
  isGenerating,
  partialContent,
  label = 'AI is writing',
}) => {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isGenerating) { setElapsed(0); return; }
    startRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  if (!isGenerating) return null;

  const wordCount = partialContent ? partialContent.split(/\s+/).filter(Boolean).length : 0;
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-wrap items-center gap-3 px-4 py-2.5 bg-accent/10 border border-accent/20 rounded-lg"
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="flex items-center gap-1.5"
      >
        <Sparkles size={12} className="text-accent" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
          {label}...
        </span>
      </motion.div>

      <div className="flex items-center gap-3 text-[9px] font-mono text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock size={10} />
          {minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`}
        </span>
        {wordCount > 0 && (
          <span className="flex items-center gap-1">
            <Type size={10} />
            {wordCount} words
          </span>
        )}
      </div>

      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            className="w-1 h-1 bg-accent rounded-full"
          />
        ))}
      </div>
    </motion.div>
  );
};

export default GenerationProgress;
