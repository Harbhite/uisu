import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle, AlertCircle, File, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export interface UploadItem {
  id: string;
  file: File;
  parentId: string | null;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  relativePath?: string | null;
  displayName: string;
}

interface UploadQueueProps {
  items: UploadItem[];
  onRetry: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export const UploadQueue: React.FC<UploadQueueProps> = ({ items, onRetry, onClear, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (items.length === 0) return null;

  const uploadingCount = items.filter(i => i.status === 'uploading' || i.status === 'pending').length;
  const errorCount = items.filter(i => i.status === 'error').length;
  const successCount = items.filter(i => i.status === 'success').length;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-6 right-6 z-50 w-full max-w-sm bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden flex flex-col"
      style={{ maxHeight: isExpanded ? '60vh' : 'auto' }}
    >
      {/* Header */}
      <div
        className="bg-slate-900 text-white p-3 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {uploadingCount > 0 ? `Uploading ${uploadingCount} item${uploadingCount !== 1 ? 's' : ''}...` :
             errorCount > 0 ? 'Uploads completed with errors' : 'Uploads completed'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="p-1 hover:bg-slate-800 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-y-auto flex-1 bg-slate-50"
          >
            <div className="p-2 space-y-2">
              {items.map((item) => (
                <div key={item.id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex items-start gap-3">
                  <div className="mt-1">
                    {item.status === 'success' && <CheckCircle className="text-green-500 w-5 h-5" />}
                    {item.status === 'error' && <AlertCircle className="text-red-500 w-5 h-5" />}
                    {(item.status === 'uploading' || item.status === 'pending') && <Loader2 className="text-blue-500 w-5 h-5 animate-spin" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-medium text-slate-700 truncate pr-2">{item.displayName}</p>
                      {item.status === 'error' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 -mt-1 -mr-1"
                          onClick={() => onRetry(item.id)}
                          title="Retry"
                        >
                          <RefreshCw size={14} />
                        </Button>
                      )}
                    </div>
                    {item.status === 'error' ? (
                      <p className="text-xs text-red-500">{item.error || 'Upload failed'}</p>
                    ) : (
                      <div className="space-y-1">
                        <Progress value={item.progress} className="h-1" />
                        <p className="text-xs text-slate-400 text-right">{Math.round(item.progress)}%</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {(successCount > 0 || errorCount > 0) && (
              <div className="p-2 border-t border-slate-100 bg-white">
                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={onClear}>
                  Clear completed
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
