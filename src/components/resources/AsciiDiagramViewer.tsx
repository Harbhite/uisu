import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useGesture } from '@use-gesture/react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AsciiDiagramViewerProps {
  content: string;
  label?: string;
}

const AsciiDiagramViewer: React.FC<AsciiDiagramViewerProps> = ({ content, label }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const bind = useGesture(
    {
      onDrag: ({ offset: [x, y] }) => {
        setPosition({ x, y });
        setIsDragging(true);
      },
      onDragEnd: () => {
        setTimeout(() => setIsDragging(false), 50);
      },
      onPinch: ({ offset: [s] }) => {
        setScale(Math.min(Math.max(s, 0.5), 4));
      },
      onWheel: ({ delta: [, dy], event }) => {
        event.preventDefault();
        setScale((prev) => Math.min(Math.max(prev - dy * 0.002, 0.5), 4));
      },
    },
    {
      drag: { from: () => [position.x, position.y] },
      pinch: { scaleBounds: { min: 0.5, max: 4 }, from: () => [scale, 0] },
      wheel: { eventOptions: { passive: false } },
    }
  );

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 4));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));

  const lines = content.split('\n');
  const maxWidth = Math.max(...lines.map((l) => l.length));

  return (
    <div className="my-6 border border-border rounded-sm overflow-hidden group">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <Maximize2 size={12} className="text-accent" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            {label || 'Diagram'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-mono text-muted-foreground/50 mr-2">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomOut}
            className="p-1.5 border border-border hover:border-accent text-muted-foreground hover:text-accent transition-all rounded-sm"
            title="Zoom out"
          >
            <ZoomOut size={12} />
          </button>
          <button
            onClick={zoomIn}
            className="p-1.5 border border-border hover:border-accent text-muted-foreground hover:text-accent transition-all rounded-sm"
            title="Zoom in"
          >
            <ZoomIn size={12} />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 border border-border hover:border-accent text-muted-foreground hover:text-accent transition-all rounded-sm"
            title="Reset view"
          >
            <Maximize2 size={12} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        {...bind()}
        className={cn(
          'relative overflow-hidden bg-primary/95 min-h-[200px] max-h-[500px] select-none',
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        )}
        style={{ touchAction: 'none' }}
      >
        {/* Drag hint */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-primary-foreground/10 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <Move size={10} className="text-primary-foreground/40" />
          <span className="text-[8px] font-bold uppercase tracking-widest text-primary-foreground/40">
            Drag to pan · Scroll to zoom
          </span>
        </div>

        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
          }}
          className="p-6 transition-transform duration-75"
        >
          <pre
            className="font-mono text-xs md:text-sm text-primary-foreground/90 leading-[1.5] whitespace-pre"
            style={{ minWidth: `${maxWidth}ch` }}
          >
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default AsciiDiagramViewer;
