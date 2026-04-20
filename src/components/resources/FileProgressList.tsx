import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileIcon, CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';
import type { FileProgress } from '@/lib/multi-file-utils';

interface Props {
  progress: FileProgress[];
}

export const FileProgressList: React.FC<Props> = ({ progress }) => {
  if (progress.length === 0) return null;

  return (
    <div className="space-y-1.5 mt-3">
      <AnimatePresence initial={false}>
        {progress.map((p, i) => (
          <motion.div
            key={`${p.name}-${i}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-3 py-2 bg-muted/40 border border-border rounded-lg text-[11px]"
          >
            <FileIcon size={12} className="text-muted-foreground shrink-0" />
            <span className="flex-1 truncate font-mono text-foreground">{p.name}</span>
            {p.status === 'pending' && (
              <span className="flex items-center gap-1 text-muted-foreground/60 uppercase tracking-widest text-[9px] font-bold">
                <Clock size={10} /> Queued
              </span>
            )}
            {p.status === 'processing' && (
              <span className="flex items-center gap-1 text-accent uppercase tracking-widest text-[9px] font-bold">
                <Loader2 size={10} className="animate-spin" /> Reading
              </span>
            )}
            {p.status === 'done' && (
              <span className="flex items-center gap-1 text-emerald-600 uppercase tracking-widest text-[9px] font-bold">
                <CheckCircle2 size={10} /> Done
              </span>
            )}
            {p.status === 'error' && (
              <span
                className="flex items-center gap-1 text-red-500 uppercase tracking-widest text-[9px] font-bold"
                title={p.error}
              >
                <XCircle size={10} /> Error
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
