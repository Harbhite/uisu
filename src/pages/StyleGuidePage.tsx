/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, Star, Palette, Type, LayoutGrid, Zap,
  ShieldCheck, Box, Layers, MousePointer2, Copy, Check, Code,
  Terminal, ChevronRight, User, Search, Fingerprint,
  Book, Award, Shield, Landmark, Bell, Info,
  Download, Play, Trash2, Plus, X, Menu,
  Settings, Activity, Globe, Scale, Mic, Gavel, Coins, Trophy,
  AlertTriangle, CheckCircle2, XCircle, MoreHorizontal, Home,
  MessageSquare, Archive, ShieldAlert, ChevronDown, ChevronUp,
  RefreshCcw, BarChart3, ListFilter, Sliders, Eye, Lock,
  FileText, Database, UserCircle,
  Hash, Monitor, Command, Edit3,
  GraduationCap, Sparkles,
  Filter, SortDesc, Grid, Printer, Ghost,
  Flag, Share2, ChevronLeft, Ruler, Clock, Mail, Phone,
  Heart, Target, Users, Cpu, Loader2, Image as ImageIcon, RotateCcw, Map
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';

// --- UTILITY COMPONENTS ---

const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative mt-2 no-print">
      <div className="bg-slate-900 p-4 font-mono text-[10px] text-slate-400 overflow-x-auto border border-white/5 max-h-40 overflow-y-auto">
        <pre className="whitespace-pre-wrap">{code}</pre>
      </div>
      <button 
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 bg-white/5 hover:bg-accent hover:text-primary text-[8px] font-bold uppercase tracking-widest transition-all"
      >
        {copied ? 'Copied' : 'Copy JSX'}
      </button>
    </div>
  );
};

const SectionHeader = ({ id, icon: Icon, title, subtitle }: { id: string; icon: any; title: string; subtitle: string }) => (
  <div id={id} className="pt-32 mb-12 border-b border-slate-200 pb-6 scroll-mt-32 break-inside-avoid-page">
    <div className="flex items-center gap-4 text-primary mb-2">
      <Icon size={24} />
      <h2 className="text-3xl font-serif italic">{title}</h2>
    </div>
    <p className="text-slate-500 font-light tracking-wide">{subtitle}</p>
  </div>
);

const RegistryItem = ({ title, code, children, description }: { title: string; code: string; children?: React.ReactNode; description?: string }) => (
  <div className="mb-8 group break-inside-avoid">
    <div className="flex justify-between items-end mb-4">
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">{title}</h4>
        {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
      </div>
    </div>
    <div className="p-8 bg-white border border-slate-200 flex items-center justify-center min-h-[160px] relative overflow-hidden shadow-sm print:border-slate-300">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:20px_20px] print:hidden"></div>
      {children}
    </div>
    <CodeBlock code={code} />
  </div>
);

const ColorBox = ({ name, hex, usage, variants }: { name: string; hex: string; usage: string; variants?: { name: string; hex: string }[] }) => (
  <div className="bg-white border border-slate-200 p-6 flex flex-col gap-6 shadow-sm group hover:border-accent transition-colors break-inside-avoid">
    <div 
      className="w-full h-40 border border-slate-100 group-hover:scale-[1.02] transition-transform duration-500 shadow-inner relative overflow-hidden print:border-slate-300" 
      style={{ backgroundColor: hex }} 
    >
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay print:hidden"></div>
    </div>
    <div>
      <span className="font-serif text-2xl text-primary block mb-2">{name}</span>
      <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 mb-6 h-12 overflow-hidden">{usage}</p>
      <div className="bg-slate-900 p-3 flex justify-between items-center text-[10px] font-mono text-accent shadow-lg no-print">
        <span>{hex}</span>
        <Copy size={12} className="cursor-pointer hover:text-white transition-colors" onClick={() => navigator.clipboard.writeText(hex)} />
      </div>
      {variants && (
        <div className="space-y-2 pt-4 mt-4 border-t border-slate-100">
          <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-slate-300">Tonal Registry</span>
          <div className="flex gap-2">
            {variants.map(v => (
              <div
                key={v.hex}
                className="w-full h-6 border border-slate-100 cursor-pointer hover:scale-105 transition-transform print:border-slate-300"
                style={{ backgroundColor: v.hex }}
                title={`${v.name}: ${v.hex}`}
                onClick={() => navigator.clipboard.writeText(v.hex)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

// --- AI COMPONENT ARCHITECT ---

const AIComponentArchitect = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'existing' | 'generated' | 'error', content: any } | null>(null);

  const registryMapping = [
    { id: 'cat-1', keywords: ['color', 'blue', 'gold', 'palette', 'chromatic', 'hex'] },
    { id: 'cat-2', keywords: ['font', 'text', 'heading', 'typography', 'serif', 'mono', 'type'] },
    { id: 'cat-3', keywords: ['icon', 'shield', 'gavel', 'star', 'symbol', 'lucide'] },
    { id: 'cat-4', keywords: ['menu', 'nav', 'breadcrumb', 'spatial', 'link', 'sidebar', 'navigation'] },
    { id: 'cat-5', keywords: ['loader', 'loading', 'spinner', 'progress', 'skeleton'] },
    { id: 'cat-6', keywords: ['button', 'cta', 'click', 'command', 'action', 'execute', 'form', 'input'] },
    { id: 'cat-7', keywords: ['table', 'list', 'ledger', 'row', 'grid', 'matrix', 'listing'] },
    { id: 'cat-8', keywords: ['chart', 'graph', 'bar', 'line', 'data', 'visualization', 'diagram', 'flow'] },
    { id: 'cat-9', keywords: ['3d', 'immersive', 'canvas', 'webgl', 'three'] },
    { id: 'cat-10', keywords: ['card', 'box', 'announcement', 'container', 'artifact'] },
    { id: 'cat-11', keywords: ['decor', 'animation', 'texture', 'grain', 'pattern'] },
    { id: 'cat-12', keywords: ['asset', 'media', 'image', 'audio', 'player'] },
    { id: 'cat-13', keywords: ['security', 'auth', 'identity', 'verification', 'badge'] },
    { id: 'cat-14', keywords: ['layout', 'grid', 'spacing', 'container', 'structure'] },
    { id: 'cat-15', keywords: ['brand', 'logo', 'tone', 'voice', 'identity'] },
    { id: 'cat-16', keywords: ['utility', 'helper', 'mixin', 'class'] },
    { id: 'cat-17', keywords: ['tabular', 'header', 'cell', 'ledger'] },
    { id: 'cat-18', keywords: ['admin', 'control', 'filter', 'sort', 'checkbox'] },
    { id: 'cat-19', keywords: ['toast', 'alert', 'message', 'feedback', 'notification', 'empty'] },
    { id: 'cat-20', keywords: ['rich', 'editorial', 'dropcap', 'blockquote', 'citation'] },
    { id: 'cat-21', keywords: ['overlay', 'modal', 'popup', 'dialog'] },
    { id: 'cat-22', keywords: ['tab', 'control', 'segmented', 'pill'] },
    { id: 'cat-23', keywords: ['merit', 'award', 'badge', 'medal'] },
    { id: 'cat-24', keywords: ['tooltip', 'hint', 'info', 'slate'] },
  ];

  const handleArchitect = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);

    // Check for existing components
    const searchLower = prompt.toLowerCase();
    const existing = registryMapping.find(cat => 
      cat.keywords.some(k => searchLower.includes(k))
    );

    if (existing) {
      setResult({
        type: 'existing',
        content: existing.id
      });
      setLoading(false);
      const element = document.getElementById(existing.id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Simulate AI response for components not in registry
    setTimeout(() => {
      setResult({
        type: 'generated',
        content: {
          name: `Custom ${prompt} Component`,
          description: `A custom component for "${prompt}" following the Aluta Protocol design system.`,
          code: `<div className="p-6 bg-white border border-slate-200">
  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
    ${prompt.toUpperCase()}
  </div>
  <div className="font-serif text-xl text-primary">
    Custom Component
  </div>
</div>`
        }
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <section className="mt-20 bg-slate-900 border border-accent/30 p-8 shadow-2xl relative overflow-hidden group no-print">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
        <Cpu size={120} className="text-accent" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-accent text-primary">
            <Terminal size={18} />
          </div>
          <h3 className="text-xl font-serif italic text-white">Component Navigator</h3>
        </div>
        
        <p className="text-slate-400 text-xs mb-8 uppercase tracking-widest max-w-xl">
          Protocol: Input your UI requirement. The system will locate existing assets or provide component templates following the Aluta aesthetic.
        </p>

        <div className="flex gap-4">
          <input 
            type="text" 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleArchitect()}
            placeholder="e.g., Find a navigation breadcrumb..."
            className="flex-1 bg-slate-800 border border-slate-700 px-6 py-4 text-white font-mono text-sm focus:border-accent outline-none transition-colors"
          />
          <button 
            onClick={handleArchitect}
            disabled={loading}
            className="bg-accent text-primary px-8 py-4 font-bold uppercase tracking-widest text-xs hover:bg-white transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />} 
            {loading ? 'Searching...' : 'Navigate'}
          </button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 border-t border-slate-800 pt-8"
            >
              {result.type === 'existing' && (
                <div className="bg-primary/50 border border-accent/50 p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="text-green-400" />
                    <div>
                      <h4 className="text-white font-serif text-lg">Asset Found in Registry</h4>
                      <p className="text-slate-400 text-xs uppercase tracking-widest">Localized as: {result.content}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => document.getElementById(result.content)?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-accent text-xs font-bold uppercase tracking-widest hover:text-white flex items-center gap-2"
                  >
                    Navigate to Section <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {result.type === 'generated' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-accent">
                    <Sparkles size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Component Template</span>
                  </div>
                  <div className="bg-white border border-slate-200 p-8 shadow-inner overflow-hidden flex flex-col items-center">
                    <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-8">Preview</div>
                    <div className="max-w-md text-center p-8 border border-slate-100 italic font-serif text-slate-400">
                      "{result.content.description}"
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-white text-xs font-bold uppercase tracking-widest">{result.content.name}</h4>
                    </div>
                    <CodeBlock code={result.content.code} />
                  </div>
                </div>
              )}

              {result.type === 'error' && (
                <div className="bg-red-950 border border-red-500 p-6 flex items-center gap-4">
                  <AlertTriangle className="text-red-500" />
                  <span className="text-red-200 text-xs font-bold uppercase tracking-widest">{result.content}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

// Social icon components
const Twitter = ({ size, className }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);
const Linkedin = ({ size, className }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

// --- MAIN PAGE COMPONENT ---

const StyleGuidePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('cat-1');

  const categories = [
    { id: 'cat-1', label: '01. Colours', icon: Palette },
    { id: 'cat-2', label: '02. Typography', icon: Type },
    { id: 'cat-3', label: '03. Iconography', icon: Terminal },
    { id: 'cat-4', label: '04. Navigation', icon: Map },
    { id: 'cat-5', label: '05. Loaders', icon: RefreshCcw },
    { id: 'cat-6', label: '06. Forms', icon: Edit3 },
    { id: 'cat-7', label: '07. Tables', icon: ListFilter },
    { id: 'cat-8', label: '08. Diagrams', icon: BarChart3 },
    { id: 'cat-9', label: '09. Immersive', icon: Globe },
    { id: 'cat-10', label: '10. Cards', icon: LayoutGrid },
    { id: 'cat-11', label: '11. Decor', icon: Sparkles },
    { id: 'cat-12', label: '12. Media', icon: Monitor },
    { id: 'cat-13', label: '13. Security', icon: ShieldCheck },
    { id: 'cat-14', label: '14. Layout', icon: Grid },
    { id: 'cat-15', label: '15. Brand', icon: Star },
    { id: 'cat-16', label: '16. Utilities', icon: Code },
    { id: 'cat-17', label: '17. Tabular', icon: LayoutGrid },
    { id: 'cat-18', label: '18. Admin', icon: Sliders },
    { id: 'cat-19', label: '19. Feedback', icon: MessageSquare },
    { id: 'cat-20', label: '20. Editorial', icon: FileText },
    { id: 'cat-21', label: '21. Overlays', icon: Layers },
    { id: 'cat-22', label: '22. Tabs', icon: Command },
    { id: 'cat-23', label: '23. Badges', icon: Award },
    { id: 'cat-24', label: '24. Tooltips', icon: Info },
  ];

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = categories.map(c => document.getElementById(c.id));
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        if (section && section.offsetTop <= scrollPosition && (section.offsetTop + section.offsetHeight) > scrollPosition) {
          setActiveSection(section.id);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-accent selection:text-white print:bg-white">
      <SEO
        title="Visual Registry & Aluta Protocol"
        description="The comprehensive design manual and component registry for the UISU Archive platform."
      />

      {/* Table of Contents Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-40 overflow-y-auto hidden xl:block no-print">
        <div className="p-8 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2 group mb-6">
            <ArrowLeft size={14} className="text-slate-400 group-hover:text-accent transition-colors"/>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-primary">Back to App</span>
          </Link>
          <h1 className="font-serif text-2xl text-primary mb-2">Visual <br/><span className="italic text-slate-300">Registry</span></h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Version 2.4.0</p>
        </div>
        
        <div className="p-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-4">Archive Index</div>
          <nav className="space-y-1">
            {categories.map((cat) => (
              <a 
                key={cat.id} 
                href={`#${cat.id}`} 
                className={`flex items-center gap-3 px-4 py-2 text-[11px] font-medium transition-all rounded-sm ${activeSection === cat.id ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-primary'}`}
              >
                <cat.icon size={12} />
                {cat.label}
              </a>
            ))}
          </nav>
        </div>
        
        <div className="p-8 border-t border-slate-100 mt-4">
          <Button onClick={handlePrint} variant="outline" className="w-full gap-2 text-xs font-bold uppercase tracking-widest border-slate-300">
            <Printer size={14}/> Print PDF
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="xl:hidden sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-slate-200 p-4 flex justify-between items-center no-print">
        <div className="font-serif text-xl text-primary">Visual Registry</div>
        <Button onClick={handlePrint} size="sm" variant="ghost"><Printer size={16}/></Button>
      </div>

      {/* Main Content Area */}
      <main className="xl:pl-64">
        <div className="container mx-auto px-6 md:px-12 py-32 max-w-6xl">
          
          {/* Header */}
          <header className="mb-20 break-after-avoid">
            <div className="flex items-center gap-4 mb-6">
              <Palette className="text-accent" size={32} />
              <span className="text-sm font-bold tracking-[0.5em] uppercase text-slate-400">The Aluta Protocol</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-serif text-primary leading-none mb-8">Visual <br/> <span className="italic text-slate-300">Registry</span></h1>
            <p className="text-2xl text-slate-600 font-light max-w-3xl leading-relaxed">
              A definitive design manual for the intellectual vanguard. 24 categories of archival components engineered for legislative clarity and performance.
            </p>

            {/* AI Component Navigator */}
            <AIComponentArchitect />
          </header>

          {/* 01. COLOURS */}
          <SectionHeader id="cat-1" icon={Palette} title="01. Colour Palette" subtitle="The chromatic DNA of official student representation." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
            <ColorBox 
              name="UI Blue" 
              hex="#003366" 
              usage="Primary Framework, Navigation, High-Hierarchy Text"
              variants={[
                { name: "Blue Dark", hex: "#002244" },
                { name: "Blue Soft", hex: "#003366CC" }
              ]}
            />
            <ColorBox 
              name="Nobel Gold" 
              hex="#C5A059" 
              usage="Interactivity, Merit, Achievements, Active States"
              variants={[
                { name: "Gold Pale", hex: "#E9D8B6" },
                { name: "Gold Muted", hex: "#A6864B" }
              ]}
            />
            <ColorBox 
              name="Heritage Slate" 
              hex="#1E293B" 
              usage="System Metadata, Archival Textures, Code Blocks"
              variants={[
                { name: "Slate Light", hex: "#F1F5F9" },
                { name: "Slate Heavy", hex: "#0F172A" }
              ]}
            />
            <ColorBox 
              name="Archive Cream" 
              hex="#F9F8F4" 
              usage="Tactile Base Canvas, Background, Content Slates"
              variants={[
                { name: "Cream Deep", hex: "#F2EFE9" },
                { name: "Cream Pure", hex: "#FFFFFF" }
              ]}
            />
          </div>

          {/* 02. TYPOGRAPHY */}
          <SectionHeader id="cat-2" icon={Type} title="02. Typography" subtitle="Standardized font hierarchies for intellectual weight." />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
            <RegistryItem title="Primary Serif (Display)" code={`<h1 className="font-serif text-6xl text-primary italic">...</h1>`}>
              <p className="font-serif text-5xl text-primary italic">Intellectualism & Welfare</p>
            </RegistryItem>
            <RegistryItem title="Technical Mono (Labels)" code={`<code className="font-mono text-sm bg-slate-900 text-accent p-2">...</code>`}>
              <code className="font-mono text-sm bg-slate-900 text-accent p-2">RECORD_REF_#2024_048</code>
            </RegistryItem>
          </div>

          {/* 03. ICONOGRAPHY */}
          <SectionHeader id="cat-3" icon={Terminal} title="03. Iconography Registry" subtitle="Standard 24px symbols for functional clarity." />
          <div className="bg-white border border-slate-200 p-12 mb-24">
            <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-10 gap-10">
              {[
                {i:Shield, n:'Shield'}, {i:Gavel, n:'Gavel'}, {i:Star, n:'Star'}, {i:Award, n:'Award'}, 
                {i:Book, n:'Archive'}, {i:Landmark, n:'Union'}, {i:Scale, n:'Justice'}, {i:Fingerprint, n:'Auth'},
                {i:Bell, n:'Notice'}, {i:Search, n:'Query'}, {i:Terminal, n:'Sys'}, {i:Users, n:'Group'},
                {i:Mail, n:'Post'}, {i:Phone, n:'Comms'}, {i:Flag, n:'Legacy'}, {i:Target, n:'Focus'},
                {i:Heart, n:'Welfare'}, {i:Database, n:'Data'}, {i:Zap, n:'Action'}, {i:Layers, n:'State'}
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => navigator.clipboard.writeText(`<${item.n} size={24} />`)}>
                  <div className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-300 group-hover:bg-primary group-hover:text-accent transition-all"><item.i size={20}/></div>
                  <span className="text-[8px] font-bold uppercase text-slate-400">{item.n}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 04. NAVIGATION */}
          <SectionHeader id="cat-4" icon={Map} title="04. Spatial Navigation" subtitle="Spatial controllers for the archive matrix." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            <RegistryItem title="Archive Breadcrumb" code={`<div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
  <span>ROOT</span> <ChevronRight size={10}/> <span>LEGISLATIVE</span> <ChevronRight size={10}/> <span className="text-primary">SECTION_1</span>
</div>`}>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>ROOT</span> <ChevronRight size={10}/> <span>LEGISLATIVE</span> <ChevronRight size={10}/> <span className="text-primary">SECTION_1</span>
              </div>
            </RegistryItem>
            <RegistryItem title="Vertical Sidebar Link" code={`<div className="flex items-center gap-3 border-l-4 border-accent p-3 bg-slate-50 text-xs font-bold uppercase">
  <Home size={14}/> Dashboard Root
</div>`}>
              <div className="w-full flex items-center gap-3 text-primary border-l-4 border-accent p-4 bg-slate-50 font-bold text-xs uppercase tracking-widest"><Home size={14}/> Dashboard Root</div>
            </RegistryItem>
          </div>

          {/* 05. LOADERS */}
          <SectionHeader id="cat-5" icon={RefreshCcw} title="05. Activity Loaders" subtitle="Indication of temporal system processing." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <RegistryItem title="Branded Spinner" code={`<motion.div animate={{rotate:360}} transition={{duration:4,repeat:Infinity,ease:"linear"}}><Star /></motion.div>`}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="text-accent">
                <Star size={48} />
              </motion.div>
            </RegistryItem>
            <RegistryItem title="Processing Strip" code={`<div className="h-1 bg-slate-100 relative overflow-hidden"><motion.div className="absolute inset-y-0 w-1/3 bg-primary" /></div>`}>
              <div className="w-full h-1 bg-slate-100 overflow-hidden relative">
                <motion.div 
                  initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-y-0 w-1/3 bg-primary"
                />
              </div>
            </RegistryItem>
            <RegistryItem title="Skeleton Media" code={`<div className="aspect-video bg-slate-100 animate-pulse"></div>`}>
              <div className="w-full aspect-video bg-slate-100 animate-pulse flex items-center justify-center">
                <ImageIcon className="text-slate-200" size={40} />
              </div>
            </RegistryItem>
          </div>

          {/* 06. FORMS */}
          <SectionHeader id="cat-6" icon={Edit3} title="06. Form Protocol" subtitle="Precise inputs for archival ingestion." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <RegistryItem title="Primary Command" code={`<button className="px-8 py-3 bg-primary text-white text-xs font-bold uppercase tracking-widest">Execute</button>`}>
              <button className="px-8 py-3 bg-primary text-white rounded-none text-xs font-bold uppercase tracking-widest border border-primary hover:bg-accent hover:text-primary transition-all shadow-lg">Execute</button>
            </RegistryItem>
            <RegistryItem title="Standard Query Input" code={`<input className="w-full bg-white border border-slate-200 px-4 py-3" />`}>
              <input type="text" placeholder="Enter Reference ID..." className="w-full bg-white border border-slate-200 px-4 py-3 outline-none focus:border-accent transition-colors text-sm font-light" />
            </RegistryItem>
            <RegistryItem title="Switch Protocol" code={`<div className="w-14 h-7 bg-primary p-1 flex items-center justify-end"><div className="w-5 h-5 bg-white"></div></div>`}>
              <div className="w-14 h-7 bg-primary p-1 flex items-center justify-end shadow-inner cursor-pointer"><div className="w-5 h-5 bg-white shadow-lg"></div></div>
            </RegistryItem>
          </div>

          {/* 07. TABLES */}
          <SectionHeader id="cat-7" icon={ListFilter} title="07. Tables & Ledger Matrix" subtitle="Administrative density structures." />
          <RegistryItem title="Ledger Row Archetype" code={`<div className="grid grid-cols-12 gap-4 px-8 py-4 bg-white border border-slate-200 items-center">
  <div className="col-span-1 font-mono text-slate-300">#048</div>
  <div className="col-span-8 font-serif text-lg text-primary">Document_Title.pdf</div>
  <div className="col-span-3 text-right"><span className="px-2 py-1 bg-green-50 text-green-600 text-[8px] font-bold uppercase">Verified</span></div>
</div>`}>
            <div className="w-full grid grid-cols-12 gap-4 px-8 py-4 bg-white border border-slate-200 items-center hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="col-span-1 text-[10px] font-mono text-slate-300">#048</div>
              <div className="col-span-8 font-serif text-lg text-primary group-hover:text-accent transition-colors">Constitutional_Amendment_V1_Final.pdf</div>
              <div className="col-span-3 text-right"><span className="px-2 py-1 bg-green-50 text-green-600 border border-green-200 text-[8px] font-bold uppercase tracking-widest">Verified</span></div>
            </div>
          </RegistryItem>

          {/* 08. DIAGRAMS */}
          <SectionHeader id="cat-8" icon={BarChart3} title="08. Diagrams & Data Flow" subtitle="Standardized quantitative rendering." />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
            <RegistryItem title="Growth Matrix (Bar)" code={`<BarChart data={[{n:'1948',v:40},{n:'1960',v:70},{n:'1990',v:35},{n:'2024',v:55}]}>
  <Bar dataKey="v" fill="#003366" />
</BarChart>`}>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{n:'1948',v:40},{n:'1960',v:70},{n:'1990',v:35},{n:'2024',v:55}]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="n" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <Bar dataKey="v" fill="#003366" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </RegistryItem>
            <RegistryItem title="Activity Trend (Line)" code={`<LineChart data={[{n:'1',v:20},{n:'2',v:60},{n:'3',v:40},{n:'4',v:80}]}>
  <Line type="monotone" stroke="#C5A059" strokeWidth={3} />
</LineChart>`}>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[{n:'1',v:20},{n:'2',v:60},{n:'3',v:40},{n:'4',v:80}]}>
                    <Line type="monotone" dataKey="v" stroke="#C5A059" strokeWidth={3} dot={{fill:'#003366', strokeWidth:2, r:5}} />
                    <XAxis hide />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </RegistryItem>
          </div>

          {/* 09. IMMERSIVE */}
          <SectionHeader id="cat-9" icon={Globe} title="09. 3D & Immersive" subtitle="Interactive spatial elements and canvases." />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
            <RegistryItem title="Canvas Placeholder" code={`<div className="aspect-video bg-black relative overflow-hidden">
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/30 via-black to-black"></div>
  <div className="w-24 h-24 border border-accent/50 rotate-45 animate-pulse"></div>
</div>`}>
              <div className="aspect-video bg-black relative overflow-hidden flex items-center justify-center group w-full">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/30 via-black to-black"></div>
                <div className="w-24 h-24 border border-accent/50 rotate-45 animate-pulse relative z-10 group-hover:rotate-90 transition-transform duration-700">
                  <div className="absolute inset-2 border border-primary/50"></div>
                </div>
                <div className="absolute bottom-4 left-4 text-xs font-mono text-accent">CANVAS_RENDER_01</div>
              </div>
            </RegistryItem>
            <div className="p-6 bg-slate-50 border border-slate-200">
              <h5 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">Implementation Note</h5>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                3D elements use React Three Fiber with Drei helpers. The system supports WebGL canvas, particle effects, and interactive spatial navigation.
              </p>
              <CodeBlock code={`import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

<Canvas>
  <OrbitControls />
  <mesh>
    <boxGeometry />
    <meshStandardMaterial color="#C5A059" />
  </mesh>
</Canvas>`} />
            </div>
          </div>

          {/* 10. CARDS */}
          <SectionHeader id="cat-10" icon={LayoutGrid} title="10. Archival Cards" subtitle="System containers for data modules." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            <RegistryItem title="Announcement Block" code={`<div className="p-8 bg-white border border-slate-200 border-l-4 border-primary">
  <div className="text-[8px] font-bold text-accent uppercase tracking-[0.4em] mb-4">Urgent Dispatch</div>
  <h4 className="font-serif text-2xl text-primary mb-4">Title</h4>
  <p className="text-sm text-slate-500">Content</p>
</div>`}>
              <div className="bg-white p-8 border border-slate-200 border-l-4 border-primary w-full group">
                <div className="text-[8px] font-bold text-accent uppercase tracking-[0.4em] mb-4">Urgent Dispatch</div>
                <h4 className="font-serif text-2xl text-primary mb-4 group-hover:text-accent transition-colors">Senate Reform Session</h4>
                <p className="text-sm text-slate-500 font-light line-clamp-2">Administrative review of the 2024 budgetary framework following the resumption cycle.</p>
              </div>
            </RegistryItem>
            <RegistryItem title="Personnel Artifact" code={`<div className="bg-slate-900 text-white p-6 border-l-4 border-accent flex items-center gap-6">
  <div className="w-16 h-16 bg-slate-800"></div>
  <div>
    <div className="text-[8px] font-bold text-accent uppercase">ROLE</div>
    <h4 className="font-serif text-xl">Name</h4>
  </div>
</div>`}>
              <div className="bg-slate-900 text-white p-6 border border-white/10 border-l-4 border-accent w-full flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-800 border border-white/5 flex-shrink-0"></div>
                <div>
                  <div className="text-[8px] font-bold text-accent uppercase tracking-widest mb-1">PRESIDENT</div>
                  <h4 className="font-serif text-xl">Aweda Bolaji</h4>
                  <div className="text-[10px] text-slate-500 font-mono mt-2">ID: UISU_2024_001</div>
                </div>
              </div>
            </RegistryItem>
          </div>

          {/* 11. DECOR */}
          <SectionHeader id="cat-11" icon={Sparkles} title="11. Decorative Textures" subtitle="Atmospheric treatments for layering." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            <RegistryItem title="Archival Grain" code={`<div className="bg-slate-900 relative"><div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div></div>`}>
              <div className="w-full h-40 bg-slate-900 relative overflow-hidden flex items-center justify-center border border-white/5 shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                <span className="text-white/20 text-[10px] font-bold uppercase tracking-[1em]">Grain Pattern</span>
              </div>
            </RegistryItem>
            <RegistryItem title="Branded Mesh" code={`<div className="bg-primary relative"><div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent"></div></div>`}>
              <div className="w-full h-40 bg-primary relative overflow-hidden flex items-center justify-center border border-white/5 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent"></div>
                <span className="text-white/20 text-[10px] font-bold uppercase tracking-[1em]">Mesh Canvas</span>
              </div>
            </RegistryItem>
          </div>

          {/* 12. MEDIA */}
          <SectionHeader id="cat-12" icon={Monitor} title="12. Assets & Media" subtitle="Visual and audio content rendering." />
          <RegistryItem title="Audio Archive Player" code={`<div className="flex items-center gap-8 bg-slate-900 text-white p-6 border-l-4 border-accent">
  <div className="w-12 h-12 bg-white/10 flex items-center justify-center"><Play size={24}/></div>
  <div>
    <div className="text-[8px] font-bold text-accent uppercase tracking-[0.4em]">RECORD_ID</div>
    <div className="font-serif text-xl">Title</div>
    <div className="w-full h-1 bg-white/10 mt-4"><div className="w-1/3 h-full bg-accent"></div></div>
  </div>
</div>`}>
            <div className="w-full flex items-center gap-8 bg-slate-900 text-white p-6 border-l-4 border-accent shadow-2xl">
              <div className="w-12 h-12 bg-white/10 flex items-center justify-center cursor-pointer hover:bg-accent hover:text-primary transition-colors">
                <Play size={24} fill="currentColor"/>
              </div>
              <div className="flex-1">
                <div className="text-[8px] font-bold text-accent uppercase tracking-[0.4em] mb-1">RECORD_#1971_ADEPEJU</div>
                <div className="font-serif text-xl">Oral Testimony: Feb Protest</div>
                <div className="w-full h-1 bg-white/10 mt-4 overflow-hidden"><div className="w-1/3 h-full bg-accent"></div></div>
              </div>
            </div>
          </RegistryItem>

          {/* 13. SECURITY */}
          <SectionHeader id="cat-13" icon={ShieldCheck} title="13. Security & Identity" subtitle="Systems for verified presence." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            <RegistryItem title="Verification Seal" code={`<div className="p-2 border-2 border-green-500 text-green-500"><CheckCircle2 size={32}/></div>`}>
              <div className="p-2 border-2 border-green-500 text-green-500 shadow-xl shadow-green-500/10"><CheckCircle2 size={32} /></div>
            </RegistryItem>
            <RegistryItem title="Digital ID Plaque" code={`<div className="bg-white p-4 border border-slate-200 flex items-center gap-4">
  <div className="w-12 h-12 bg-slate-100 flex items-center justify-center"><UserCircle size={24}/></div>
  <div>
    <div className="text-[10px] font-bold text-primary uppercase">Role</div>
    <div className="text-[8px] text-slate-400 font-mono">ID: XXX</div>
  </div>
</div>`}>
              <div className="bg-white p-4 border border-slate-200 flex items-center gap-4 w-full">
                <div className="w-12 h-12 bg-slate-100 flex items-center justify-center text-slate-300"><UserCircle size={24}/></div>
                <div>
                  <div className="text-[10px] font-bold text-primary uppercase tracking-widest">Global Scribe</div>
                  <div className="text-[8px] text-slate-400 font-mono">ID: UISU/2024/003</div>
                </div>
              </div>
            </RegistryItem>
          </div>

          {/* 14. LAYOUT */}
          <SectionHeader id="cat-14" icon={Grid} title="14. Layout & Grid" subtitle="Structural foundations and spacing tokens." />
          <div className="space-y-8 mb-24">
            <div className="grid grid-cols-12 gap-2 h-24">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-primary/10 border border-primary/20 flex items-center justify-center text-[9px] text-primary font-mono">Col</div>
              ))}
            </div>
            <CodeBlock code={`<div className="grid grid-cols-12 gap-2">
  <div className="col-span-1">Col 1</div>
  <div className="col-span-11">Col 11</div>
</div>`} />
          </div>

          {/* 15. BRAND */}
          <SectionHeader id="cat-15" icon={Star} title="15. Brand Identity" subtitle="Tone, voice, and logo usage guidelines." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
            <div className="p-8 border border-slate-200 bg-white">
              <h4 className="font-serif text-2xl text-primary mb-4">Tone of Voice</h4>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                The UISU Archive speaks with <span className="font-bold text-primary">institutional authority</span> and <span className="font-bold text-primary">historical reverence</span>. Language should be precise, slightly formal, and intellectually rigorous.
              </p>
              <div className="flex gap-4 text-xs">
                <div className="flex-1 p-3 bg-green-50 text-green-800 border border-green-100">
                  <span className="font-bold block mb-1">DO:</span>
                  "The protocol mandates verification."
                </div>
                <div className="flex-1 p-3 bg-red-50 text-red-800 border border-red-100">
                  <span className="font-bold block mb-1">DON'T:</span>
                  "You gotta check this out."
                </div>
              </div>
            </div>
            <div className="p-8 border border-slate-200 bg-primary text-white">
              <h4 className="font-serif text-2xl mb-4">Logo Usage</h4>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary font-serif font-bold text-xl">U</div>
                <div>
                  <div className="text-lg font-bold uppercase tracking-widest">UISU Archive</div>
                  <div className="text-[9px] text-slate-300 uppercase tracking-[0.4em]">Est. 1948</div>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed opacity-80">
                Always maintain clear space around the logomark. Do not alter colors or aspect ratio.
              </p>
            </div>
          </div>

          {/* 16. UTILITIES */}
          <SectionHeader id="cat-16" icon={Code} title="16. Utilities & Helpers" subtitle="Functional classes and mixins for rapid development." />
          <div className="bg-slate-900 text-slate-300 p-6 font-mono text-xs overflow-x-auto border border-white/10 mb-24">
            <div className="mb-4">
              <span className="text-accent">// Hide scrollbar but allow scroll</span><br/>
              .no-scrollbar::-webkit-scrollbar &#123; display: none; &#125;
            </div>
            <div className="mb-4">
              <span className="text-accent">// Marquee Animation</span><br/>
              .animate-marquee &#123; animation: marquee 20s linear infinite; &#125;
            </div>
            <div>
              <span className="text-accent">// Print Hide</span><br/>
              @media print &#123; .no-print &#123; display: none !important; &#125; &#125;
            </div>
          </div>

          {/* 17. TABULAR */}
          <SectionHeader id="cat-17" icon={LayoutGrid} title="17. Tabular Matrix" subtitle="Complex data rendering for legislative and administrative records." />
          <div className="space-y-8 mb-24">
            <div className="grid grid-cols-12 gap-4 bg-primary text-white px-8 py-5 text-[10px] font-bold uppercase tracking-[0.3em] border border-primary shadow-lg">
              <div className="col-span-1">REF</div>
              <div className="col-span-5">SUBJECT_NOMENCLATURE</div>
              <div className="col-span-3">JURISDICTION</div>
              <div className="col-span-3 text-right">METRIC_STATUS</div>
            </div>
            <CodeBlock code={`<div className="grid grid-cols-12 gap-4 bg-primary text-white px-8 py-5 text-[10px] font-bold uppercase tracking-[0.3em]">
  <div className="col-span-1">REF</div>
  <div className="col-span-5">SUBJECT</div>
  <div className="col-span-3">JURISDICTION</div>
  <div className="col-span-3 text-right">STATUS</div>
</div>`} />
          </div>

          {/* 18. ADMIN */}
          <SectionHeader id="cat-18" icon={Sliders} title="18. Administrative Controls" subtitle="Interactive elements for system governance." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <RegistryItem title="Filter Logic Pill" code={`<div className="px-5 py-2 bg-primary text-white rounded-full flex items-center gap-3">
  <span className="text-[10px] font-bold uppercase">Category: CEC</span>
  <X size={12} />
</div>`}>
              <div className="px-5 py-2 bg-primary text-white rounded-full flex items-center gap-3 w-fit shadow-lg">
                <span className="text-[10px] font-bold uppercase tracking-widest">Category: CEC</span>
                <X size={12} className="cursor-pointer hover:text-accent transition-colors" />
              </div>
            </RegistryItem>
            <RegistryItem title="Legislative Checklist" code={`<div className="flex items-center gap-3">
  <div className="w-5 h-5 border-2 border-primary bg-white flex items-center justify-center"><Check size={14}/></div>
  <span className="text-[10px] font-bold uppercase">Label</span>
</div>`}>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-primary bg-white flex items-center justify-center"><Check size={14} className="text-primary" /></div>
                  <span className="text-[10px] font-bold uppercase text-slate-600">Article 4 Section A</span>
                </div>
                <div className="flex items-center gap-3 opacity-40">
                  <div className="w-5 h-5 border-2 border-slate-300 bg-white"></div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Article 4 Section B</span>
                </div>
              </div>
            </RegistryItem>
            <RegistryItem title="Ordering Controller" code={`<button className="flex items-center gap-3 px-4 py-2 border border-slate-200 hover:border-primary">
  <SortDesc size={14} />
  <span className="text-[9px] font-bold uppercase">Sequence Index</span>
</button>`}>
              <button className="flex items-center gap-3 px-4 py-2 border border-slate-200 hover:border-primary transition-colors group">
                <SortDesc size={14} className="text-slate-300 group-hover:text-primary" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-primary">Sequence Index</span>
              </button>
            </RegistryItem>
          </div>

          {/* 19. FEEDBACK */}
          <SectionHeader id="cat-19" icon={MessageSquare} title="19. System Feedback" subtitle="Visual signals for system states." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            <RegistryItem title="System Toast" code={`<div className="bg-slate-900 text-white p-4 shadow-2xl border-l-4 border-accent flex items-center gap-4">
  <CheckCircle2 className="text-green-500" size={16} />
  <span className="text-[10px] font-bold uppercase tracking-widest">Protocol_Synchronized</span>
</div>`}>
              <div className="bg-slate-900 text-white p-4 shadow-2xl border-l-4 border-accent flex items-center gap-4 w-full">
                <CheckCircle2 className="text-green-500" size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Protocol_Synchronized</span>
              </div>
            </RegistryItem>
            <RegistryItem title="Empty State: Null" code={`<div className="p-8 bg-slate-50 border border-slate-200 border-dashed flex flex-col items-center justify-center gap-4">
  <Ghost size={24} />
  <div className="text-[10px] font-bold uppercase">No Records Found</div>
</div>`}>
              <div className="p-8 bg-slate-50 border border-slate-200 border-dashed flex flex-col items-center justify-center gap-4 text-center w-full">
                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400"><Ghost size={24} /></div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">No Records Found</div>
                  <div className="text-[9px] text-slate-400">Try adjusting your filter parameters.</div>
                </div>
              </div>
            </RegistryItem>
          </div>

          {/* 20. EDITORIAL */}
          <SectionHeader id="cat-20" icon={FileText} title="20. Rich Text & Editorial" subtitle="Typography for long-form content." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            <RegistryItem title="Ornate Dropcap" code={`<span className="text-5xl font-serif font-bold text-accent leading-[0.8] float-left mr-2 mt-1">T</span>`}>
              <div className="p-6 bg-white border border-slate-200 w-full">
                <div className="flex items-start gap-3">
                  <span className="text-5xl font-serif font-bold text-accent leading-[0.8] float-left mr-2 mt-1">T</span>
                  <p className="text-sm text-slate-600 leading-relaxed font-light">
                    The foundations of the Union were laid not in brick, but in the collective consciousness of a new academic era.
                  </p>
                </div>
              </div>
            </RegistryItem>
            <RegistryItem title="Editorial Blockquote" code={`<div className="p-6 bg-slate-50 border-l-4 border-primary">
  <p className="font-serif text-lg text-primary italic mb-4">"Quote text."</p>
  <span className="text-[9px] font-bold uppercase text-slate-500">Author</span>
</div>`}>
              <div className="p-6 bg-slate-50 border-l-4 border-primary w-full">
                <p className="font-serif text-lg text-primary italic mb-4">"We must be the architects of our own intellectual destiny."</p>
                <div className="flex items-center gap-2">
                  <div className="h-px w-8 bg-slate-300"></div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">First President, 1948</span>
                </div>
              </div>
            </RegistryItem>
          </div>

          {/* 21. OVERLAYS */}
          <SectionHeader id="cat-21" icon={Layers} title="21. Overlay Protocols" subtitle="Standard focus and context layers." />
          <RegistryItem title="System Dispatch Modal" code={`<div className="bg-white shadow-2xl p-12 max-w-md border border-slate-200 flex flex-col items-center text-center">
  <ShieldAlert className="text-red-500 mb-6" size={48} />
  <h4 className="font-serif text-2xl text-primary mb-4">Title</h4>
  <p className="text-xs text-slate-500 mb-8">Message</p>
  <button className="w-full py-4 bg-primary text-white text-[10px] font-bold uppercase">Action</button>
</div>`}>
            <div className="bg-white border border-slate-200 shadow-2xl p-12 flex flex-col items-center text-center max-w-sm">
              <ShieldAlert className="text-red-500 mb-6" size={48} />
              <h4 className="font-serif text-2xl text-primary mb-4 leading-tight">Identity Verification Required</h4>
              <p className="text-xs text-slate-500 mb-8 font-light">Confirm biometric authorization before accessing restricted archives.</p>
              <button className="w-full py-4 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-primary transition-all">Verify_Identity</button>
            </div>
          </RegistryItem>

          {/* 22. TABS */}
          <SectionHeader id="cat-22" icon={Command} title="22. Tab & Control Stacks" subtitle="Standardized state toggles." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            <RegistryItem title="Segmented Tab Row" code={`<div className="flex border border-slate-200 w-full">
  <div className="flex-1 text-center py-3 bg-primary text-white text-[10px] font-bold uppercase">ACTIVE</div>
  <div className="flex-1 text-center py-3 text-slate-400 text-[10px] font-bold uppercase border-l border-slate-200">INACTIVE</div>
</div>`}>
              <div className="flex border border-slate-200 w-full">
                <div className="flex-1 text-center py-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest">EXECUTIVE</div>
                <div className="flex-1 text-center py-3 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-l border-slate-200">LEGISLATIVE</div>
              </div>
            </RegistryItem>
            <RegistryItem title="Active Pill Control" code={`<div className="flex gap-3">
  <span className="px-4 py-2 bg-primary text-white text-[9px] font-bold uppercase">Active</span>
  <span className="px-4 py-2 bg-slate-100 text-slate-400 text-[9px] font-bold uppercase">Pending</span>
</div>`}>
              <div className="flex gap-3">
                <span className="px-4 py-2 bg-primary text-white text-[9px] font-bold uppercase tracking-widest">Active</span>
                <span className="px-4 py-2 bg-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-widest">Pending</span>
              </div>
            </RegistryItem>
          </div>

          {/* 23. BADGES */}
          <SectionHeader id="cat-23" icon={Award} title="23. Badge & Medal Systems" subtitle="Merit indicators for personnel records." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <RegistryItem title="Gold Merit Star" code={`<div className="p-3 bg-primary text-accent shadow-xl"><Star size={24} fill="currentColor"/></div>`}>
              <div className="p-3 bg-primary text-accent shadow-xl shadow-primary/20"><Star size={24} fill="currentColor"/></div>
            </RegistryItem>
            <RegistryItem title="Merit Level Plate" code={`<div className="px-4 py-1 bg-red-950 text-red-500 border border-red-500/30 text-[8px] font-bold uppercase">LEVEL 5 ACCESS</div>`}>
              <div className="px-4 py-1 bg-red-950 text-red-500 border border-red-500/30 text-[8px] font-bold uppercase tracking-[0.4em] text-center shadow-lg">LEVEL 5 ACCESS</div>
            </RegistryItem>
            <RegistryItem title="Signature Hologram" code={`<div className="font-serif italic text-2xl text-primary border-b-2 border-slate-200 pb-2">Signature</div>`}>
              <div className="font-serif italic text-2xl text-primary border-b-2 border-slate-200 pb-2">Wole Soyinka</div>
            </RegistryItem>
          </div>

          {/* 24. TOOLTIPS */}
          <SectionHeader id="cat-24" icon={Info} title="24. Tooltip & Info Slates" subtitle="Contextual data layers." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            <RegistryItem title="Context Tooltip" code={`<div className="bg-slate-900 text-white px-4 py-2 text-[8px] font-mono border border-white/10 shadow-2xl relative">
  RECORD_ID: ARCH_048_VERIFIED
  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-slate-900"></div>
</div>`}>
              <div className="bg-slate-900 text-white px-4 py-2 text-[8px] font-mono whitespace-nowrap border border-white/10 shadow-2xl relative">
                RECORD_ID: ARCH_048_VERIFIED
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-slate-900"></div>
              </div>
            </RegistryItem>
            <RegistryItem title="Status Information Slate" code={`<div className="p-6 bg-blue-50 text-blue-800 border border-blue-100 flex items-center gap-4">
  <Info size={18} />
  <span className="text-[10px] font-bold uppercase tracking-widest">Protocol currently in read-only mode</span>
</div>`}>
              <div className="p-6 bg-blue-50 text-blue-800 border border-blue-100 flex items-center gap-4 w-full">
                <Info size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Protocol currently in read-only mode</span>
              </div>
            </RegistryItem>
          </div>

          {/* Global Registry Footer */}
          <div className="mt-60 text-center pb-40 relative break-inside-avoid">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-slate-200"></div>
            <Star size={40} className="mx-auto text-accent/10 mb-8 mt-20" />
            <p className="text-[10px] font-bold uppercase tracking-[1.5em] text-slate-300">Intellectualism & Welfare Protocol • v2.4.0</p>
            <div className="mt-8 flex justify-center gap-8 text-[8px] font-mono text-slate-400 uppercase tracking-widest">
              <span>EST: 1948</span>
              <span>LOC: IBADAN, NG</span>
              <span>SYS: ARCHIVE_LIVE</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StyleGuidePage;
