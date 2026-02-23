import React, { useEffect, useRef, useState, useId } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, Maximize2, Move, GitBranch, Copy, Download } from 'lucide-react';
import { useGesture } from '@use-gesture/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Initialize mermaid once
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#003366',
    primaryTextColor: '#f8fafc',
    primaryBorderColor: '#C5A059',
    lineColor: '#C5A059',
    secondaryColor: '#1e3a5f',
    tertiaryColor: '#f1f5f9',
    fontFamily: '"Playfair Display", serif',
    fontSize: '14px',
    noteBkgColor: '#fef9c3',
    noteTextColor: '#0f172a',
    noteBorderColor: '#C5A059',
    edgeLabelBackground: '#f8fafc',
    clusterBkg: '#e2e8f0',
    clusterBorder: '#94a3b8',
  },
  flowchart: { curve: 'basis', padding: 20 },
  sequence: { mirrorActors: false },
});

interface MermaidDiagramProps {
  content: string;
  label?: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ content, label }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);
  const uniqueId = useId().replace(/:/g, '-');
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      try {
        const id = `mermaid-${uniqueId}-${Date.now()}`;
        const { svg } = await mermaid.render(id, content.trim());
        if (!cancelled) {
          setSvgContent(svg);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Failed to render diagram');
          setSvgContent(null);
        }
        // Clean up any leftover temp elements mermaid may have created
        const tempEl = document.getElementById(`d${uniqueId}`);
        if (tempEl) tempEl.remove();
      }
    };

    render();
    return () => { cancelled = true; };
  }, [content, uniqueId]);

  const bind = useGesture(
    {
      onDrag: ({ offset: [x, y] }) => {
        setPosition({ x, y });
        setIsDragging(true);
      },
      onDragEnd: () => {
        setTimeout(() => setIsDragging(false), 50);
      },
      onWheel: ({ delta: [, dy], event }) => {
        event.preventDefault();
        setScale((prev) => Math.min(Math.max(prev - dy * 0.002, 0.5), 4));
      },
    },
    {
      drag: { from: () => [position.x, position.y] },
      wheel: { eventOptions: { passive: false } },
    }
  );

  const resetView = () => { setScale(1); setPosition({ x: 0, y: 0 }); };
  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 4));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));

  const handleCopySource = () => {
    navigator.clipboard.writeText(content);
    toast.success('Diagram source copied');
  };

  const handleDownloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagram-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('SVG downloaded');
  };

  if (error) {
    return (
      <div className="my-6 border border-destructive/30 rounded-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-destructive/5 border-b border-destructive/20">
          <GitBranch size={12} className="text-destructive" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-destructive">Diagram Error</span>
        </div>
        <pre className="p-4 bg-muted/30 text-xs font-mono text-destructive/80 overflow-x-auto whitespace-pre-wrap">
          {error}
        </pre>
        <details className="px-4 pb-4">
          <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-accent">Show source</summary>
          <pre className="mt-2 text-xs font-mono text-muted-foreground whitespace-pre-wrap">{content}</pre>
        </details>
      </div>
    );
  }

  if (!svgContent) {
    return (
      <div className="my-6 border border-border rounded-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border-b border-border">
          <GitBranch size={12} className="text-accent animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Rendering diagram…</span>
        </div>
        <div className="h-48 bg-muted/10 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 border border-border rounded-sm overflow-hidden group">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <GitBranch size={12} className="text-accent" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            {label || 'Flowchart'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-mono text-muted-foreground/50 mr-2">
            {Math.round(scale * 100)}%
          </span>
          <button onClick={zoomOut} className="p-1.5 border border-border hover:border-accent text-muted-foreground hover:text-accent transition-all rounded-sm" title="Zoom out">
            <ZoomOut size={12} />
          </button>
          <button onClick={zoomIn} className="p-1.5 border border-border hover:border-accent text-muted-foreground hover:text-accent transition-all rounded-sm" title="Zoom in">
            <ZoomIn size={12} />
          </button>
          <button onClick={resetView} className="p-1.5 border border-border hover:border-accent text-muted-foreground hover:text-accent transition-all rounded-sm" title="Reset view">
            <Maximize2 size={12} />
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button onClick={handleCopySource} className="p-1.5 border border-border hover:border-accent text-muted-foreground hover:text-accent transition-all rounded-sm" title="Copy source">
            <Copy size={12} />
          </button>
          <button onClick={handleDownloadSVG} className="p-1.5 border border-border hover:border-accent text-muted-foreground hover:text-accent transition-all rounded-sm" title="Download SVG">
            <Download size={12} />
          </button>
        </div>
      </div>

      {/* Diagram Canvas */}
      <div
        ref={containerRef}
        {...bind()}
        className={cn(
          'relative overflow-hidden bg-card min-h-[200px] max-h-[600px] select-none',
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        )}
        style={{ touchAction: 'none' }}
      >
        {/* Hint */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-muted/80 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <Move size={10} className="text-muted-foreground" />
          <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
            Drag · Scroll to zoom
          </span>
        </div>

        <div
          ref={svgWrapperRef}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
          }}
          className="p-6 flex items-center justify-center transition-transform duration-75 [&_svg]:max-w-full [&_svg]:h-auto"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </div>
    </div>
  );
};

export default MermaidDiagram;
