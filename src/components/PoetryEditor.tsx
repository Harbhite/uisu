import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  AlignLeft, AlignCenter, AlignRight, Plus, Trash2, GripVertical, 
  Type, Maximize2, Minimize2, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export type TextAlignment = 'left' | 'center' | 'right';

export interface PoetryStanza {
  id: string;
  text: string;
  alignment: TextAlignment;
  emphasis?: 'normal' | 'bold' | 'italic';
  spacing?: 'normal' | 'tight' | 'loose';
}

interface PoetryEditorProps {
  stanzas: PoetryStanza[];
  onChange: (stanzas: PoetryStanza[]) => void;
  className?: string;
}

const generateId = () => `stanza-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const defaultStanza: () => PoetryStanza = () => ({
  id: generateId(),
  text: '',
  alignment: 'center',
  emphasis: 'normal',
  spacing: 'normal'
});

export const PoetryEditor: React.FC<PoetryEditorProps> = ({
  stanzas,
  onChange,
  className
}) => {
  const [focusedStanza, setFocusedStanza] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const addStanza = useCallback(() => {
    onChange([...stanzas, defaultStanza()]);
  }, [stanzas, onChange]);

  const updateStanza = useCallback((id: string, updates: Partial<PoetryStanza>) => {
    onChange(stanzas.map(s => s.id === id ? { ...s, ...updates } : s));
  }, [stanzas, onChange]);

  const removeStanza = useCallback((id: string) => {
    if (stanzas.length > 1) {
      onChange(stanzas.filter(s => s.id !== id));
    }
  }, [stanzas, onChange]);

  const setAlignment = useCallback((id: string, alignment: TextAlignment) => {
    updateStanza(id, { alignment });
  }, [updateStanza]);

  const setEmphasis = useCallback((id: string, emphasis: PoetryStanza['emphasis']) => {
    updateStanza(id, { emphasis });
  }, [updateStanza]);

  const setSpacing = useCallback((id: string, spacing: PoetryStanza['spacing']) => {
    updateStanza(id, { spacing });
  }, [updateStanza]);

  const resetStanza = useCallback((id: string) => {
    updateStanza(id, { alignment: 'center', emphasis: 'normal', spacing: 'normal' });
  }, [updateStanza]);

  // Initialize with one stanza if empty
  React.useEffect(() => {
    if (stanzas.length === 0) {
      onChange([defaultStanza()]);
    }
  }, [stanzas, onChange]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Editor Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Type size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Poetry Editor</span>
          <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
            {stanzas.length} stanza{stanzas.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted-foreground"
        >
          {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </Button>
      </div>

      {/* Stanzas */}
      <Reorder.Group 
        axis="y" 
        values={stanzas} 
        onReorder={onChange}
        className="space-y-4"
      >
        <AnimatePresence mode="popLayout">
          {stanzas.map((stanza, index) => (
            <Reorder.Item
              key={stanza.id}
              value={stanza}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="group"
            >
              <div 
                className={cn(
                  "border border-border rounded-lg overflow-hidden bg-card transition-all",
                  focusedStanza === stanza.id && "ring-2 ring-accent/20 border-accent"
                )}
              >
                {/* Stanza Toolbar */}
                <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
                  <div className="flex items-center gap-2">
                    <GripVertical size={14} className="text-muted-foreground cursor-grab" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Stanza {index + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Alignment Controls */}
                    <div className="flex items-center border border-border rounded-md overflow-hidden bg-background">
                      {(['left', 'center', 'right'] as TextAlignment[]).map((align) => (
                        <button
                          key={align}
                          type="button"
                          onClick={() => setAlignment(stanza.id, align)}
                          className={cn(
                            "p-1.5 transition-colors",
                            stanza.alignment === align 
                              ? "bg-accent text-primary" 
                              : "text-muted-foreground hover:bg-muted"
                          )}
                          title={`Align ${align}`}
                        >
                          {align === 'left' && <AlignLeft size={12} />}
                          {align === 'center' && <AlignCenter size={12} />}
                          {align === 'right' && <AlignRight size={12} />}
                        </button>
                      ))}
                    </div>

                    {/* Emphasis Controls */}
                    <div className="flex items-center border border-border rounded-md overflow-hidden bg-background ml-1">
                      <button
                        type="button"
                        onClick={() => setEmphasis(stanza.id, 'normal')}
                        className={cn(
                          "px-2 py-1.5 text-xs transition-colors",
                          stanza.emphasis === 'normal' 
                            ? "bg-accent text-primary" 
                            : "text-muted-foreground hover:bg-muted"
                        )}
                        title="Normal text"
                      >
                        Aa
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmphasis(stanza.id, 'bold')}
                        className={cn(
                          "px-2 py-1.5 text-xs font-bold transition-colors",
                          stanza.emphasis === 'bold' 
                            ? "bg-accent text-primary" 
                            : "text-muted-foreground hover:bg-muted"
                        )}
                        title="Bold text"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmphasis(stanza.id, 'italic')}
                        className={cn(
                          "px-2 py-1.5 text-xs italic transition-colors",
                          stanza.emphasis === 'italic' 
                            ? "bg-accent text-primary" 
                            : "text-muted-foreground hover:bg-muted"
                        )}
                        title="Italic text"
                      >
                        I
                      </button>
                    </div>

                    {/* Spacing Controls */}
                    {isExpanded && (
                      <div className="flex items-center border border-border rounded-md overflow-hidden bg-background ml-1">
                        <button
                          type="button"
                          onClick={() => setSpacing(stanza.id, 'tight')}
                          className={cn(
                            "px-1.5 py-1.5 transition-colors",
                            stanza.spacing === 'tight' 
                              ? "bg-accent text-primary" 
                              : "text-muted-foreground hover:bg-muted"
                          )}
                          title="Tight spacing"
                        >
                          <div className="w-3 h-3 flex flex-col justify-center gap-0.5">
                            <div className="h-px bg-current w-full" />
                            <div className="h-px bg-current w-full" />
                            <div className="h-px bg-current w-full" />
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSpacing(stanza.id, 'normal')}
                          className={cn(
                            "px-1.5 py-1.5 transition-colors",
                            stanza.spacing === 'normal' 
                              ? "bg-accent text-primary" 
                              : "text-muted-foreground hover:bg-muted"
                          )}
                          title="Normal spacing"
                        >
                          <div className="w-3 h-3 flex flex-col justify-between">
                            <div className="h-px bg-current w-full" />
                            <div className="h-px bg-current w-full" />
                            <div className="h-px bg-current w-full" />
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSpacing(stanza.id, 'loose')}
                          className={cn(
                            "px-1.5 py-1.5 transition-colors",
                            stanza.spacing === 'loose' 
                              ? "bg-accent text-primary" 
                              : "text-muted-foreground hover:bg-muted"
                          )}
                          title="Loose spacing"
                        >
                          <div className="w-3 h-4 flex flex-col justify-between">
                            <div className="h-px bg-current w-full" />
                            <div className="h-px bg-current w-full" />
                          </div>
                        </button>
                      </div>
                    )}

                    {/* Reset button */}
                    <button
                      type="button"
                      onClick={() => resetStanza(stanza.id)}
                      className="p-1.5 text-muted-foreground hover:text-foreground transition-colors ml-1"
                      title="Reset formatting"
                    >
                      <RotateCcw size={12} />
                    </button>

                    {/* Delete button */}
                    {stanzas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStanza(stanza.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove stanza"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Stanza Text Area */}
                <Textarea
                  value={stanza.text}
                  onChange={(e) => updateStanza(stanza.id, { text: e.target.value })}
                  onFocus={() => setFocusedStanza(stanza.id)}
                  onBlur={() => setFocusedStanza(null)}
                  placeholder="Write your stanza here..."
                  className={cn(
                    "min-h-[120px] border-0 rounded-none resize-none focus-visible:ring-0 font-serif",
                    stanza.alignment === 'left' && "text-left",
                    stanza.alignment === 'center' && "text-center",
                    stanza.alignment === 'right' && "text-right",
                    stanza.emphasis === 'bold' && "font-bold",
                    stanza.emphasis === 'italic' && "italic",
                    stanza.spacing === 'tight' && "leading-tight",
                    stanza.spacing === 'normal' && "leading-relaxed",
                    stanza.spacing === 'loose' && "leading-loose",
                    isExpanded && "min-h-[200px]"
                  )}
                />
              </div>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {/* Add Stanza Button */}
      <motion.button
        type="button"
        onClick={addStanza}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full py-4 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        <span className="text-sm">Add Stanza</span>
      </motion.button>

      {/* Preview hint */}
      <p className="text-xs text-muted-foreground text-center">
        Drag stanzas to reorder • Each stanza can have its own alignment and style
      </p>
    </div>
  );
};

export default PoetryEditor;
