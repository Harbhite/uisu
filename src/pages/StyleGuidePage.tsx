/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Star, Palette, Type, LayoutGrid, Zap,
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
import { BarChart, Bar, XAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Tooltip } from 'recharts';

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
    { id: 'cat-5', label: '05. Buttons', icon: MousePointer2 },
    { id: 'cat-6', label: '06. Identity', icon: Fingerprint },
    { id: 'cat-7', label: '07. Legislative', icon: Gavel },
    { id: 'cat-8', label: '08. Forms', icon: Edit3 },
    { id: 'cat-9', label: '09. Diagrams', icon: BarChart3 },
    { id: 'cat-10', label: '10. Cards', icon: LayoutGrid },
    { id: 'cat-11', label: '11. Tables', icon: ListFilter },
    { id: 'cat-12', label: '12. Feedback', icon: MessageSquare },
    { id: 'cat-13', label: '13. Loaders', icon: RefreshCcw },
    { id: 'cat-14', label: '14. Audio', icon: Mic },
    { id: 'cat-15', label: '15. Textures', icon: Sparkles },
    { id: 'cat-16', label: '16. Surfaces', icon: Layers },
    { id: 'cat-17', label: '17. Overlays', icon: Monitor },
    { id: 'cat-18', label: '18. Tabs', icon: Command },
    { id: 'cat-19', label: '19. Badges', icon: Award },
    { id: 'cat-20', label: '20. Tooltips', icon: Info },
    { id: 'cat-21', label: '21. Branding', icon: Star },
    { id: 'cat-22', label: '22. Dividers', icon: Ruler },
    { id: 'cat-23', label: '23. Social', icon: Share2 },
    { id: 'cat-24', label: '24. Tributes', icon: Flag },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExportHTML = () => {
    const styleContent = [
      '/* UISU Archive Design System - Exported Stylesheet */',
      ':root {',
      '  --ui-blue: #003366;',
      '  --nobel-gold: #C5A059;',
      '  --ui-dark: #001F3D;',
      '  --nobel-cream: #FAF9F7;',
      '  --slate-50: #f8fafc;',
      '  --slate-200: #e2e8f0;',
      '  --slate-300: #cbd5e1;',
      '  --slate-500: #64748b;',
      '  --slate-800: #1e293b;',
      '  --font-serif: "Playfair Display", Georgia, serif;',
      '  --font-sans: system-ui, -apple-system, sans-serif;',
      '}',
      '* { box-sizing: border-box; margin: 0; padding: 0; }',
      'body { font-family: var(--font-sans); background: var(--slate-50); color: var(--slate-800); }',
      '.btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.75rem; cursor: pointer; border: none; }',
      '.btn-primary { background: var(--ui-blue); color: white; }',
      '.btn-gold { background: var(--nobel-gold); color: var(--ui-blue); }',
      '.btn-outline { background: transparent; border: 2px solid var(--slate-300); color: var(--slate-500); }',
      '.card { background: white; border: 1px solid var(--slate-200); padding: 1.5rem; }',
      '.font-serif { font-family: var(--font-serif); }',
      '.text-primary { color: var(--ui-blue); }',
      '.badge { display: inline-flex; padding: 0.25rem 0.75rem; font-size: 0.625rem; font-weight: 700; text-transform: uppercase; }',
      '.badge-gold { background: var(--nobel-gold); color: var(--ui-blue); }',
      '.input { width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--slate-300); background: white; }',
      '.divider-gold { width: 6rem; height: 0.25rem; background: var(--nobel-gold); }',
    ].join('\\n');

    const htmlContent = [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '  <meta charset="UTF-8">',
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
      '  <title>UISU Archive - Design System Export</title>',
      '  <style>' + styleContent + '</style>',
      '  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">',
      '</head>',
      '<body>',
      '  <div style="max-width: 1200px; margin: 0 auto; padding: 2rem;">',
      '    <header style="text-align: center; margin-bottom: 4rem; padding: 3rem; background: var(--ui-blue); color: white;">',
      '      <h1 class="font-serif" style="font-size: 2.5rem; margin-bottom: 0.5rem;">UISU Archive</h1>',
      '      <p style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.2em; opacity: 0.7;">Design System v2.4.0</p>',
      '    </header>',
      '    <section style="margin-bottom: 3rem;">',
      '      <h2 class="font-serif text-primary" style="font-size: 1.5rem; margin-bottom: 1rem;">Colors</h2>',
      '      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">',
      '        <div class="card"><div style="height: 80px; background: var(--ui-blue);"></div><p class="font-serif">UI Blue #003366</p></div>',
      '        <div class="card"><div style="height: 80px; background: var(--nobel-gold);"></div><p class="font-serif">Nobel Gold #C5A059</p></div>',
      '        <div class="card"><div style="height: 80px; background: var(--ui-dark);"></div><p class="font-serif">UI Dark #001F3D</p></div>',
      '        <div class="card"><div style="height: 80px; background: var(--nobel-cream); border: 1px solid var(--slate-200);"></div><p class="font-serif">Nobel Cream #FAF9F7</p></div>',
      '      </div>',
      '    </section>',
      '    <section style="margin-bottom: 3rem;">',
      '      <h2 class="font-serif text-primary" style="font-size: 1.5rem; margin-bottom: 1rem;">Buttons</h2>',
      '      <div style="display: flex; gap: 1rem;"><button class="btn btn-primary">Primary</button><button class="btn btn-gold">Gold</button><button class="btn btn-outline">Outline</button></div>',
      '    </section>',
      '    <section style="margin-bottom: 3rem;">',
      '      <h2 class="font-serif text-primary" style="font-size: 1.5rem; margin-bottom: 1rem;">Badges</h2>',
      '      <span class="badge badge-gold">Executive</span>',
      '    </section>',
      '    <section style="margin-bottom: 3rem;">',
      '      <h2 class="font-serif text-primary" style="font-size: 1.5rem; margin-bottom: 1rem;">Form Elements</h2>',
      '      <input class="input" type="text" placeholder="Enter text..." style="max-width: 400px;">',
      '    </section>',
      '    <section style="margin-bottom: 3rem;">',
      '      <h2 class="font-serif text-primary" style="font-size: 1.5rem; margin-bottom: 1rem;">Dividers</h2>',
      '      <div class="divider-gold"></div>',
      '    </section>',
      '    <footer style="text-align: center; padding: 2rem; border-top: 1px solid var(--slate-200);">',
      '      <p style="font-size: 0.625rem; text-transform: uppercase; letter-spacing: 0.3em; color: var(--slate-500);">UISU Archive Design System v2.4.0</p>',
      '    </footer>',
      '  </div>',
      '</body>',
      '</html>'
    ].join('\\n');

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'uisu-design-system.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  // Interactive chart data with state
  const [barData, setBarData] = useState([
    { n: '1948', v: 40 },
    { n: '1960', v: 70 },
    { n: '1990', v: 35 },
    { n: '2024', v: 55 }
  ]);
  
  const [lineData, setLineData] = useState([
    { n: 'Q1', v: 20 },
    { n: 'Q2', v: 60 },
    { n: 'Q3', v: 40 },
    { n: 'Q4', v: 80 }
  ]);

  const [pieData, setPieData] = useState([
    { name: 'Executive', value: 35 },
    { name: 'Legislative', value: 25 },
    { name: 'Judicial', value: 20 },
    { name: 'Electoral', value: 20 }
  ]);

  const pieColors = ['#003366', '#C5A059', '#1E293B', '#64748b'];

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
        
        <div className="p-8 border-t border-slate-100 mt-4 space-y-3">
          <Button onClick={handlePrint} variant="outline" className="w-full gap-2 text-xs font-bold uppercase tracking-widest border-slate-300">
            <Printer size={14}/> Print PDF
          </Button>
          <Button onClick={handleExportHTML} variant="outline" className="w-full gap-2 text-xs font-bold uppercase tracking-widest border-accent text-accent hover:bg-accent hover:text-primary">
            <Download size={14}/> Export HTML/CSS
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="xl:hidden sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-slate-200 p-4 flex justify-between items-center no-print">
        <div className="font-serif text-xl text-primary">Visual Registry</div>
        <div className="flex gap-2">
          <Button onClick={handleExportHTML} size="sm" variant="ghost"><Download size={16}/></Button>
          <Button onClick={handlePrint} size="sm" variant="ghost"><Printer size={16}/></Button>
        </div>
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
            <RegistryItem title="Primary Serif (Display)" code={`<h1 className="font-serif text-6xl text-primary italic">
  Intellectualism & Welfare
</h1>`}>
              <p className="font-serif text-5xl text-primary italic">Intellectualism & Welfare</p>
            </RegistryItem>
            <RegistryItem title="Technical Mono (Labels)" code={`<code className="font-mono text-sm bg-slate-900 text-accent p-2">
  RECORD_REF_#2024_048
</code>`}>
              <code className="font-mono text-sm bg-slate-900 text-accent p-2">RECORD_REF_#2024_048</code>
            </RegistryItem>
          </div>

          {/* 03. ICONOGRAPHY */}
          <SectionHeader id="cat-3" icon={Terminal} title="03. Iconography Registry" subtitle="Standard 24px symbols for functional clarity. Click to copy import." />
          <div className="bg-white border border-slate-200 p-12 mb-24">
            <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-10 gap-10">
              {[
                {i:Shield, n:'Shield'}, {i:Gavel, n:'Gavel'}, {i:Star, n:'Star'}, {i:Award, n:'Award'}, 
                {i:Book, n:'Book'}, {i:Landmark, n:'Landmark'}, {i:Scale, n:'Scale'}, {i:Fingerprint, n:'Fingerprint'},
                {i:Bell, n:'Bell'}, {i:Search, n:'Search'}, {i:Terminal, n:'Terminal'}, {i:Users, n:'Users'},
                {i:Mail, n:'Mail'}, {i:Phone, n:'Phone'}, {i:Flag, n:'Flag'}, {i:Target, n:'Target'},
                {i:Heart, n:'Heart'}, {i:Database, n:'Database'}, {i:Zap, n:'Zap'}, {i:Layers, n:'Layers'}
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex flex-col items-center gap-2 group cursor-pointer" 
                  onClick={() => navigator.clipboard.writeText(`import { ${item.n} } from 'lucide-react';`)}
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-300 group-hover:bg-primary group-hover:text-accent transition-all"><item.i size={20}/></div>
                  <span className="text-[8px] font-bold uppercase text-slate-400">{item.n}</span>
                </div>
              ))}
            </div>
            <CodeBlock code={`import { Shield, Gavel, Star, Award, Book, Landmark, Scale, Fingerprint, Bell, Search } from 'lucide-react';

<Shield size={24} className="text-primary" />
<Gavel size={24} className="text-accent" />`} />
          </div>

          {/* 04. NAVIGATION */}
          <SectionHeader id="cat-4" icon={Map} title="04. Spatial Navigation" subtitle="Spatial controllers for the archive matrix." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            <RegistryItem title="Archive Breadcrumb" code={`<div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
  <span>ROOT</span>
  <ChevronRight size={10} />
  <span>LEGISLATIVE</span>
  <ChevronRight size={10} />
  <span className="text-primary">SECTION_1</span>
</div>`}>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>ROOT</span> <ChevronRight size={10}/> <span>LEGISLATIVE</span> <ChevronRight size={10}/> <span className="text-primary">SECTION_1</span>
              </div>
            </RegistryItem>
            <RegistryItem title="Vertical Sidebar Link" code={`<div className="flex items-center gap-3 text-primary border-l-4 border-accent p-4 bg-slate-50 font-bold text-xs uppercase tracking-widest">
  <Home size={14} />
  Dashboard Root
</div>`}>
              <div className="w-full flex items-center gap-3 text-primary border-l-4 border-accent p-4 bg-slate-50 font-bold text-xs uppercase tracking-widest"><Home size={14}/> Dashboard Root</div>
            </RegistryItem>
          </div>

          {/* 05. BUTTONS */}
          <SectionHeader id="cat-5" icon={MousePointer2} title="05. Command Buttons" subtitle="Standardized action triggers." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <RegistryItem title="Primary Command" code={`<button className="px-8 py-3 bg-primary text-white rounded-none text-xs font-bold uppercase tracking-widest border border-primary hover:bg-accent hover:text-primary transition-all shadow-lg">
  Execute
</button>`}>
              <button className="px-8 py-3 bg-primary text-white rounded-none text-xs font-bold uppercase tracking-widest border border-primary hover:bg-accent hover:text-primary transition-all shadow-lg">Execute</button>
            </RegistryItem>
            <RegistryItem title="Merit Highlight" code={`<button className="px-8 py-3 bg-accent text-primary rounded-none text-xs font-bold uppercase tracking-widest border border-accent hover:bg-white transition-all shadow-lg">
  Award
</button>`}>
              <button className="px-8 py-3 bg-accent text-primary rounded-none text-xs font-bold uppercase tracking-widest border border-accent hover:bg-white transition-all shadow-lg">Award</button>
            </RegistryItem>
            <RegistryItem title="Archive FAB" code={`<div className="w-14 h-14 bg-accent text-primary flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-transform">
  <Plus />
</div>`}>
              <div className="w-14 h-14 bg-accent text-primary flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-transform"><Plus /></div>
            </RegistryItem>
          </div>

          {/* 06. IDENTITY */}
          <SectionHeader id="cat-6" icon={Fingerprint} title="06. Identity Registry" subtitle="Systems for verified presence." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            <RegistryItem title="Verification Seal" code={`<div className="p-2 border-2 border-green-500 text-green-500 shadow-xl shadow-green-500/10">
  <CheckCircle2 size={32} />
</div>`}>
              <div className="p-2 border-2 border-green-500 text-green-500 shadow-xl shadow-green-500/10"><CheckCircle2 size={32} /></div>
            </RegistryItem>
            <RegistryItem title="Digital ID Plaque" code={`<div className="bg-white p-4 border border-slate-200 flex items-center gap-4 w-full">
  <div className="w-12 h-12 bg-slate-100 flex items-center justify-center text-slate-300">
    <UserCircle size={24} />
  </div>
  <div>
    <div className="text-[10px] font-bold text-primary uppercase tracking-widest">Global Scribe</div>
    <div className="text-[8px] text-slate-400 font-mono">ID: UISU/2024/003</div>
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

          {/* 07. LEGISLATIVE */}
          <SectionHeader id="cat-7" icon={Gavel} title="07. Legislative Artifacts" subtitle="Specialized rendering for legal authority." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
            <RegistryItem title="Constitutional Clause" code={`<div className="p-8 bg-slate-50 border-l-4 border-accent w-full italic font-serif text-lg text-slate-700 leading-relaxed">
  "The intellectual power resides in the collective conscience of the studentry."
</div>`}>
              <div className="p-8 bg-slate-50 border-l-4 border-accent w-full italic font-serif text-lg text-slate-700 leading-relaxed">
                "The intellectual power resides in the collective conscience of the studentry."
              </div>
            </RegistryItem>
            <RegistryItem title="Law Article Header" code={`<div className="w-full text-center border-b-4 border-primary pb-6">
  <div className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-400 mb-2">Legislative Protocol</div>
  <h2 className="font-serif text-5xl text-primary">Article IV</h2>
</div>`}>
              <div className="w-full text-center border-b-4 border-primary pb-6">
                <div className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-400 mb-2">Legislative Protocol</div>
                <h2 className="font-serif text-5xl text-primary">Article IV</h2>
              </div>
            </RegistryItem>
          </div>

          {/* 08. FORMS */}
          <SectionHeader id="cat-8" icon={Edit3} title="08. Form Protocol" subtitle="Precise inputs for archival ingestion." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <RegistryItem title="Standard Query Input" code={`<input 
  type="text" 
  placeholder="Enter Reference ID..." 
  className="w-full bg-white border border-slate-200 px-4 py-3 outline-none focus:border-accent transition-colors text-sm font-light" 
/>`}>
              <input type="text" placeholder="Enter Reference ID..." className="w-full bg-white border border-slate-200 px-4 py-3 outline-none focus:border-accent transition-colors text-sm font-light" />
            </RegistryItem>
            <RegistryItem title="Legislative Select" code={`<select className="w-full bg-white border border-slate-200 px-4 py-3 outline-none focus:border-accent transition-colors text-sm font-bold uppercase tracking-widest">
  <option>Executive Council</option>
  <option>Legislative House</option>
</select>`}>
              <select className="w-full bg-white border border-slate-200 px-4 py-3 outline-none focus:border-accent transition-colors text-sm font-bold uppercase tracking-widest">
                <option>Executive Council</option>
                <option>Legislative House</option>
              </select>
            </RegistryItem>
            <RegistryItem title="Switch Protocol" code={`<div className="w-14 h-7 bg-primary p-1 flex items-center justify-end shadow-inner cursor-pointer">
  <div className="w-5 h-5 bg-white shadow-lg"></div>
</div>`}>
              <div className="w-14 h-7 bg-primary p-1 flex items-center justify-end shadow-inner cursor-pointer"><div className="w-5 h-5 bg-white shadow-lg"></div></div>
            </RegistryItem>
          </div>

          {/* 09. DIAGRAMS - Interactive */}
          <SectionHeader id="cat-9" icon={BarChart3} title="09. Diagrams & Data Flow" subtitle="Interactive quantitative rendering. Click bars/points to see data." />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <RegistryItem title="Interactive Bar Chart" description="Click bars to view values" code={`import { BarChart, Bar, XAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { n: '1948', v: 40 },
  { n: '1960', v: 70 },
  { n: '1990', v: 35 },
  { n: '2024', v: 55 }
];

<ResponsiveContainer width="100%" height={256}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
    <XAxis dataKey="n" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
    <Tooltip 
      contentStyle={{ background: '#003366', border: 'none', color: '#C5A059' }}
      labelStyle={{ color: '#fff' }}
    />
    <Bar dataKey="v" fill="#003366" cursor="pointer" />
  </BarChart>
</ResponsiveContainer>`}>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="n" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#003366', border: 'none', color: '#C5A059', fontSize: 12 }}
                      labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="v" fill="#003366" cursor="pointer" onClick={(data: any) => alert(`Year: ${data.n}, Value: ${data.v}`)} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </RegistryItem>
            <RegistryItem title="Interactive Line Chart" description="Hover to see trend values" code={`import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { n: 'Q1', v: 20 },
  { n: 'Q2', v: 60 },
  { n: 'Q3', v: 40 },
  { n: 'Q4', v: 80 }
];

<ResponsiveContainer width="100%" height={256}>
  <LineChart data={data}>
    <Tooltip 
      contentStyle={{ background: '#1E293B', border: 'none' }}
      labelStyle={{ color: '#C5A059' }}
    />
    <Line 
      type="monotone" 
      dataKey="v" 
      stroke="#C5A059" 
      strokeWidth={3} 
      dot={{ fill: '#003366', strokeWidth: 2, r: 6, cursor: 'pointer' }}
      activeDot={{ r: 8, fill: '#C5A059' }}
    />
  </LineChart>
</ResponsiveContainer>`}>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <Tooltip 
                      contentStyle={{ background: '#1E293B', border: 'none', color: '#C5A059', fontSize: 12 }}
                      labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="v" 
                      stroke="#C5A059" 
                      strokeWidth={3} 
                      dot={{fill:'#003366', strokeWidth:2, r:6, cursor: 'pointer'}} 
                      activeDot={{ r: 8, fill: '#C5A059' }}
                    />
                    <XAxis dataKey="n" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </RegistryItem>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
            <RegistryItem title="Interactive Pie Chart" description="Hover sectors to see distribution" code={`import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Executive', value: 35 },
  { name: 'Legislative', value: 25 },
  { name: 'Judicial', value: 20 },
  { name: 'Electoral', value: 20 }
];
const COLORS = ['#003366', '#C5A059', '#1E293B', '#64748b'];

<ResponsiveContainer width="100%" height={256}>
  <PieChart>
    <Tooltip />
    <Pie
      data={data}
      cx="50%"
      cy="50%"
      innerRadius={50}
      outerRadius={80}
      dataKey="value"
      label={({ name, percent }) => \`\${name} \${(percent * 100).toFixed(0)}%\`}
    >
      {data.map((entry, index) => (
        <Cell key={index} fill={COLORS[index % COLORS.length]} cursor="pointer" />
      ))}
    </Pie>
  </PieChart>
</ResponsiveContainer>`}>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip 
                      contentStyle={{ background: '#003366', border: 'none', color: '#fff', fontSize: 12 }}
                    />
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={pieColors[index % pieColors.length]} cursor="pointer" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </RegistryItem>
            <RegistryItem title="Interactive Area Chart" description="Hover to explore data points" code={`import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { n: 'Jan', v: 30 },
  { n: 'Feb', v: 45 },
  { n: 'Mar', v: 35 },
  { n: 'Apr', v: 65 },
  { n: 'May', v: 50 }
];

<ResponsiveContainer width="100%" height={256}>
  <AreaChart data={data}>
    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
    <XAxis dataKey="n" tick={{ fontSize: 10 }} />
    <Tooltip />
    <Area 
      type="monotone" 
      dataKey="v" 
      stroke="#003366" 
      fill="#003366" 
      fillOpacity={0.2}
    />
  </AreaChart>
</ResponsiveContainer>`}>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[{n:'Jan',v:30},{n:'Feb',v:45},{n:'Mar',v:35},{n:'Apr',v:65},{n:'May',v:50}]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="n" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#003366', border: 'none', color: '#C5A059', fontSize: 12 }}
                      labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="v" stroke="#003366" fill="#003366" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </RegistryItem>
          </div>

          {/* 10. CARDS */}
          <SectionHeader id="cat-10" icon={LayoutGrid} title="10. Archival Cards" subtitle="System containers for data modules." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            <RegistryItem title="Announcement Block" code={`<div className="bg-white p-8 border border-slate-200 border-l-4 border-primary w-full group">
  <div className="text-[8px] font-bold text-accent uppercase tracking-[0.4em] mb-4">Urgent Dispatch</div>
  <h4 className="font-serif text-2xl text-primary mb-4 group-hover:text-accent transition-colors">Senate Reform Session</h4>
  <p className="text-sm text-slate-500 font-light line-clamp-2">Administrative review of the 2024 budgetary framework following the resumption cycle.</p>
</div>`}>
              <div className="bg-white p-8 border border-slate-200 border-l-4 border-primary w-full group">
                <div className="text-[8px] font-bold text-accent uppercase tracking-[0.4em] mb-4">Urgent Dispatch</div>
                <h4 className="font-serif text-2xl text-primary mb-4 group-hover:text-accent transition-colors">Senate Reform Session</h4>
                <p className="text-sm text-slate-500 font-light line-clamp-2">Administrative review of the 2024 budgetary framework following the resumption cycle.</p>
              </div>
            </RegistryItem>
            <RegistryItem title="Personnel Artifact" code={`<div className="bg-slate-900 text-white p-6 border border-white/10 border-l-4 border-accent w-full flex items-center gap-6">
  <div className="w-16 h-16 bg-slate-800 border border-white/5 flex-shrink-0"></div>
  <div>
    <div className="text-[8px] font-bold text-accent uppercase tracking-widest mb-1">PRESIDENT</div>
    <h4 className="font-serif text-xl">Aweda Bolaji</h4>
    <div className="text-[10px] text-slate-500 font-mono mt-2">ID: UISU_2024_001</div>
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

          {/* 11. TABLES */}
          <SectionHeader id="cat-11" icon={ListFilter} title="11. Tables & Ledger Matrix" subtitle="Administrative density structures." />
          <RegistryItem title="Ledger Row Archetype" code={`<div className="w-full grid grid-cols-12 gap-4 px-8 py-4 bg-white border border-slate-200 items-center hover:bg-slate-50 transition-colors cursor-pointer group">
  <div className="col-span-1 text-[10px] font-mono text-slate-300">#048</div>
  <div className="col-span-8 font-serif text-lg text-primary group-hover:text-accent transition-colors">Constitutional_Amendment_V1_Final.pdf</div>
  <div className="col-span-3 text-right">
    <span className="px-2 py-1 bg-green-50 text-green-600 border border-green-200 text-[8px] font-bold uppercase tracking-widest">Verified</span>
  </div>
</div>`}>
            <div className="w-full grid grid-cols-12 gap-4 px-8 py-4 bg-white border border-slate-200 items-center hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="col-span-1 text-[10px] font-mono text-slate-300">#048</div>
              <div className="col-span-8 font-serif text-lg text-primary group-hover:text-accent transition-colors">Constitutional_Amendment_V1_Final.pdf</div>
              <div className="col-span-3 text-right"><span className="px-2 py-1 bg-green-50 text-green-600 border border-green-200 text-[8px] font-bold uppercase tracking-widest">Verified</span></div>
            </div>
          </RegistryItem>

          {/* 12. FEEDBACK */}
          <SectionHeader id="cat-12" icon={MessageSquare} title="12. System Feedback" subtitle="Visual signals for system states." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            <RegistryItem title="System Toast" code={`<div className="bg-slate-900 text-white p-4 shadow-2xl border-l-4 border-accent flex items-center gap-4 w-full">
  <CheckCircle2 className="text-green-500" size={16} />
  <span className="text-[10px] font-bold uppercase tracking-widest">Protocol_Synchronized</span>
</div>`}>
              <div className="bg-slate-900 text-white p-4 shadow-2xl border-l-4 border-accent flex items-center gap-4 w-full">
                <CheckCircle2 className="text-green-500" size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Protocol_Synchronized</span>
              </div>
            </RegistryItem>
            <RegistryItem title="Empty State: Null" code={`<div className="p-8 bg-slate-50 border border-slate-200 border-dashed flex flex-col items-center justify-center gap-4 text-center w-full">
  <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
    <Ghost size={24} />
  </div>
  <div>
    <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">No Records Found</div>
    <div className="text-[9px] text-slate-400">Try adjusting your filter parameters.</div>
  </div>
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

          {/* 13. LOADERS */}
          <SectionHeader id="cat-13" icon={RefreshCcw} title="13. Activity Loaders" subtitle="Indication of temporal system processing." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <RegistryItem title="Branded Spinner" code={`<motion.div 
  animate={{ rotate: 360 }} 
  transition={{ duration: 4, repeat: Infinity, ease: "linear" }} 
  className="text-accent"
>
  <Star size={48} />
</motion.div>`}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="text-accent">
                <Star size={48} />
              </motion.div>
            </RegistryItem>
            <RegistryItem title="Processing Strip" code={`<div className="w-full h-1 bg-slate-100 overflow-hidden relative">
  <motion.div 
    initial={{ x: '-100%' }} 
    animate={{ x: '100%' }} 
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    className="absolute inset-y-0 w-1/3 bg-primary"
  />
</div>`}>
              <div className="w-full h-1 bg-slate-100 overflow-hidden relative">
                <motion.div 
                  initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-y-0 w-1/3 bg-primary"
                />
              </div>
            </RegistryItem>
            <RegistryItem title="Skeleton Media" code={`<div className="w-full aspect-video bg-slate-100 animate-pulse flex items-center justify-center">
  <ImageIcon className="text-slate-200" size={40} />
</div>`}>
              <div className="w-full aspect-video bg-slate-100 animate-pulse flex items-center justify-center">
                <ImageIcon className="text-slate-200" size={40} />
              </div>
            </RegistryItem>
          </div>

          {/* 14. AUDIO */}
          <SectionHeader id="cat-14" icon={Mic} title="14. Oral History Artifacts" subtitle="Players for recorded testimony." />
          <RegistryItem title="Audio Archive Player" code={`<div className="w-full flex items-center gap-8 bg-slate-900 text-white p-6 border-l-4 border-accent shadow-2xl">
  <div className="w-12 h-12 bg-white/10 flex items-center justify-center cursor-pointer hover:bg-accent hover:text-primary transition-colors">
    <Play size={24} fill="currentColor" />
  </div>
  <div className="flex-1">
    <div className="text-[8px] font-bold text-accent uppercase tracking-[0.4em] mb-1">RECORD_#1971_ADEPEJU</div>
    <div className="font-serif text-xl">Oral Testimony: Feb Protest</div>
    <div className="w-full h-1 bg-white/10 mt-4 overflow-hidden">
      <div className="w-1/3 h-full bg-accent"></div>
    </div>
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

          {/* 15. TEXTURES */}
          <SectionHeader id="cat-15" icon={Sparkles} title="15. Decorative Textures" subtitle="Atmospheric treatments for layering." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            <RegistryItem title="Archival Grain" code={`<div className="w-full h-40 bg-slate-900 relative overflow-hidden flex items-center justify-center border border-white/5 shadow-2xl">
  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
  <span className="text-white/20 text-[10px] font-bold uppercase tracking-[1em]">Grain Pattern</span>
</div>`}>
              <div className="w-full h-40 bg-slate-900 relative overflow-hidden flex items-center justify-center border border-white/5 shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                <span className="text-white/20 text-[10px] font-bold uppercase tracking-[1em]">Grain Pattern</span>
              </div>
            </RegistryItem>
            <RegistryItem title="Branded Mesh" code={`<div className="w-full h-40 bg-primary relative overflow-hidden flex items-center justify-center border border-white/5 shadow-2xl">
  <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent"></div>
  <span className="text-white/20 text-[10px] font-bold uppercase tracking-[1em]">Mesh Canvas</span>
</div>`}>
              <div className="w-full h-40 bg-primary relative overflow-hidden flex items-center justify-center border border-white/5 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent"></div>
                <span className="text-white/20 text-[10px] font-bold uppercase tracking-[1em]">Mesh Canvas</span>
              </div>
            </RegistryItem>
          </div>

          {/* 16. SURFACES */}
          <SectionHeader id="cat-16" icon={Layers} title="16. Atmospheric Surfaces" subtitle="Standard treatments for background depth." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            <RegistryItem title="Glass Registry Overlay" code={`<div className="w-full h-40 bg-slate-100 relative p-6 flex items-center justify-center overflow-hidden shadow-inner">
  <div className="absolute top-0 left-0 w-full h-1 bg-accent"></div>
  <div className="w-full h-full bg-white/40 backdrop-blur-xl border border-white shadow-xl flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-primary">
    Glass Surface
  </div>
</div>`}>
              <div className="w-full h-40 bg-slate-100 relative p-6 flex items-center justify-center overflow-hidden shadow-inner">
                <div className="absolute top-0 left-0 w-full h-1 bg-accent"></div>
                <div className="w-full h-full bg-white/40 backdrop-blur-xl border border-white shadow-xl flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-primary">Glass Surface</div>
              </div>
            </RegistryItem>
            <RegistryItem title="System Scanline" code={`<div className="w-full h-40 bg-primary relative overflow-hidden flex items-center justify-center border border-white/5 shadow-2xl">
  <div className="absolute inset-0 opacity-10" style={{ 
    backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)', 
    backgroundSize: '100% 2px' 
  }}></div>
  <span className="text-white/20 text-[10px] font-bold uppercase tracking-[1em]">Scanline FX</span>
</div>`}>
              <div className="w-full h-40 bg-primary relative overflow-hidden flex items-center justify-center border border-white/5 shadow-2xl">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)', backgroundSize: '100% 2px' }}></div>
                <span className="text-white/20 text-[10px] font-bold uppercase tracking-[1em]">Scanline FX</span>
              </div>
            </RegistryItem>
          </div>

          {/* 17. OVERLAYS */}
          <SectionHeader id="cat-17" icon={Monitor} title="17. Overlay Protocols" subtitle="Standard focus and context layers." />
          <RegistryItem title="System Dispatch Modal" code={`<div className="bg-white border border-slate-200 shadow-2xl p-12 flex flex-col items-center text-center max-w-sm">
  <ShieldAlert className="text-red-500 mb-6" size={48} />
  <h4 className="font-serif text-2xl text-primary mb-4 leading-tight">Identity Verification Required</h4>
  <p className="text-xs text-slate-500 mb-8 font-light">Confirm biometric authorization before accessing restricted archives.</p>
  <button className="w-full py-4 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-primary transition-all">
    Verify_Identity
  </button>
</div>`}>
            <div className="bg-white border border-slate-200 shadow-2xl p-12 flex flex-col items-center text-center max-w-sm">
              <ShieldAlert className="text-red-500 mb-6" size={48} />
              <h4 className="font-serif text-2xl text-primary mb-4 leading-tight">Identity Verification Required</h4>
              <p className="text-xs text-slate-500 mb-8 font-light">Confirm biometric authorization before accessing restricted archives.</p>
              <button className="w-full py-4 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-primary transition-all">Verify_Identity</button>
            </div>
          </RegistryItem>

          {/* 18. TABS */}
          <SectionHeader id="cat-18" icon={Command} title="18. Tab & Control Stacks" subtitle="Standardized state toggles." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            <RegistryItem title="Segmented Tab Row" code={`<div className="flex border border-slate-200 w-full">
  <div className="flex-1 text-center py-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest">EXECUTIVE</div>
  <div className="flex-1 text-center py-3 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-l border-slate-200">LEGISLATIVE</div>
</div>`}>
              <div className="flex border border-slate-200 w-full">
                <div className="flex-1 text-center py-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest">EXECUTIVE</div>
                <div className="flex-1 text-center py-3 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-l border-slate-200">LEGISLATIVE</div>
              </div>
            </RegistryItem>
            <RegistryItem title="Active Pill Control" code={`<div className="flex gap-3">
  <span className="px-4 py-2 bg-primary text-white text-[9px] font-bold uppercase tracking-widest">Active</span>
  <span className="px-4 py-2 bg-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-widest">Pending</span>
</div>`}>
              <div className="flex gap-3">
                <span className="px-4 py-2 bg-primary text-white text-[9px] font-bold uppercase tracking-widest">Active</span>
                <span className="px-4 py-2 bg-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-widest">Pending</span>
              </div>
            </RegistryItem>
          </div>

          {/* 19. BADGES */}
          <SectionHeader id="cat-19" icon={Award} title="19. Badge & Medal Systems" subtitle="Merit indicators for personnel records." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <RegistryItem title="Gold Merit Star" code={`<div className="p-3 bg-primary text-accent shadow-xl shadow-primary/20">
  <Star size={24} fill="currentColor" />
</div>`}>
              <div className="p-3 bg-primary text-accent shadow-xl shadow-primary/20"><Star size={24} fill="currentColor"/></div>
            </RegistryItem>
            <RegistryItem title="Merit Level Plate" code={`<div className="px-4 py-1 bg-red-950 text-red-500 border border-red-500/30 text-[8px] font-bold uppercase tracking-[0.4em] text-center shadow-lg">
  LEVEL 5 ACCESS
</div>`}>
              <div className="px-4 py-1 bg-red-950 text-red-500 border border-red-500/30 text-[8px] font-bold uppercase tracking-[0.4em] text-center shadow-lg">LEVEL 5 ACCESS</div>
            </RegistryItem>
            <RegistryItem title="Signature Hologram" code={`<div className="font-serif italic text-2xl text-primary border-b-2 border-slate-200 pb-2">
  Wole Soyinka
</div>`}>
              <div className="font-serif italic text-2xl text-primary border-b-2 border-slate-200 pb-2">Wole Soyinka</div>
            </RegistryItem>
          </div>

          {/* 20. TOOLTIPS */}
          <SectionHeader id="cat-20" icon={Info} title="20. Tooltip & Info Slates" subtitle="Contextual data layers." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            <RegistryItem title="Context Tooltip" code={`<div className="bg-slate-900 text-white px-4 py-2 text-[8px] font-mono whitespace-nowrap border border-white/10 shadow-2xl relative">
  RECORD_ID: ARCH_048_VERIFIED
  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-slate-900"></div>
</div>`}>
              <div className="bg-slate-900 text-white px-4 py-2 text-[8px] font-mono whitespace-nowrap border border-white/10 shadow-2xl relative">
                RECORD_ID: ARCH_048_VERIFIED
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-slate-900"></div>
              </div>
            </RegistryItem>
            <RegistryItem title="Status Information Slate" code={`<div className="p-6 bg-blue-50 text-blue-800 border border-blue-100 flex items-center gap-4 w-full">
  <Info size={18} />
  <span className="text-[10px] font-bold uppercase tracking-widest">Protocol currently in read-only mode</span>
</div>`}>
              <div className="p-6 bg-blue-50 text-blue-800 border border-blue-100 flex items-center gap-4 w-full">
                <Info size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Protocol currently in read-only mode</span>
              </div>
            </RegistryItem>
          </div>

          {/* 21. BRANDING */}
          <SectionHeader id="cat-21" icon={Star} title="21. Header Branding Patterns" subtitle="Top-tier UI framing." />
          <RegistryItem title="Global Navigation Strip" code={`<div className="w-full bg-primary text-white p-4 flex justify-between items-center shadow-2xl border border-white/10">
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 bg-accent text-primary flex items-center justify-center font-serif font-bold italic">U</div>
    <span className="font-serif font-bold tracking-tighter">UISU Archive</span>
  </div>
  <div className="flex gap-4 items-center">
    <div className="w-8 h-8 border border-white/20 flex items-center justify-center text-accent"><Bell size={14} /></div>
    <div className="w-8 h-8 bg-white/10 flex items-center justify-center"><Menu size={14} /></div>
  </div>
</div>`}>
            <div className="w-full bg-primary text-white p-4 flex justify-between items-center shadow-2xl border border-white/10">
              <div className="flex items-center gap-3"><div className="w-8 h-8 bg-accent text-primary flex items-center justify-center font-serif font-bold italic">U</div><span className="font-serif font-bold tracking-tighter">UISU Archive</span></div>
              <div className="flex gap-4 items-center"><div className="w-8 h-8 border border-white/20 flex items-center justify-center text-accent"><Bell size={14}/></div><div className="w-8 h-8 bg-white/10 flex items-center justify-center"><Menu size={14}/></div></div>
            </div>
          </RegistryItem>

          {/* 22. DIVIDERS */}
          <SectionHeader id="cat-22" icon={Ruler} title="22. Global Layout Dividers" subtitle="Spatial separation rules." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            <RegistryItem title="Gold Accent Separator" code={`<div className="w-24 h-1 bg-accent shadow-lg shadow-accent/20"></div>`}>
              <div className="w-24 h-1 bg-accent shadow-lg shadow-accent/20"></div>
            </RegistryItem>
            <RegistryItem title="Technical Record Splitter" code={`<div className="w-full h-px bg-slate-200 relative flex items-center justify-center">
  <span className="bg-slate-50 px-4 text-[8px] font-mono text-slate-300">END_OF_RECORD</span>
</div>`}>
              <div className="w-full h-px bg-slate-200 relative flex items-center justify-center"><span className="bg-slate-50 px-4 text-[8px] font-mono text-slate-300">END_OF_RECORD</span></div>
            </RegistryItem>
          </div>

          {/* 23. SOCIAL */}
          <SectionHeader id="cat-23" icon={Share2} title="23. Social Comms Matrix" subtitle="Outbound connectivity patterns." />
          <RegistryItem title="Channel Action Strip" code={`<div className="flex gap-6 p-4 bg-white border border-slate-200 shadow-sm">
  <Mail size={20} className="text-slate-300 hover:text-primary cursor-pointer transition-colors" />
  <Twitter size={20} className="text-slate-300 hover:text-primary cursor-pointer transition-colors" />
  <Linkedin size={20} className="text-slate-300 hover:text-primary cursor-pointer transition-colors" />
  <div className="h-6 w-px bg-slate-100"></div>
  <Share2 size={20} className="text-accent cursor-pointer" />
</div>`}>
            <div className="flex gap-6 p-4 bg-white border border-slate-200 shadow-sm">
              <Mail size={20} className="text-slate-300 hover:text-primary cursor-pointer transition-colors" />
              <Twitter size={20} className="text-slate-300 hover:text-primary cursor-pointer transition-colors" />
              <Linkedin size={20} className="text-slate-300 hover:text-primary cursor-pointer transition-colors" />
              <div className="h-6 w-px bg-slate-100"></div>
              <Share2 size={20} className="text-accent cursor-pointer" />
            </div>
          </RegistryItem>

          {/* 24. TRIBUTES */}
          <SectionHeader id="cat-24" icon={Flag} title="24. Aluta Tributes" subtitle="Historical martyr artifacts." />
          <RegistryItem title="Martyr Tribute Block" code={`<div className="bg-slate-900 text-white border border-white/10 border-l-8 border-red-600 p-12 w-full shadow-2xl relative overflow-hidden group">
  <div className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-5 transition-opacity"></div>
  <div className="text-[10px] font-bold text-red-600 uppercase tracking-[0.4em] mb-6">Never Forgotten</div>
  <h4 className="font-serif text-5xl mb-4 leading-none">Kunle Adepeju</h4>
  <p className="text-slate-400 font-serif italic text-xl">"His sacrifice fueled the fire of student consciousness forever."</p>
  <Flag className="absolute -bottom-10 -right-10 text-white/5 w-64 h-64 rotate-12" />
</div>`}>
            <div className="bg-slate-900 text-white border border-white/10 border-l-8 border-red-600 p-12 w-full shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-5 transition-opacity"></div>
              <div className="text-[10px] font-bold text-red-600 uppercase tracking-[0.4em] mb-6">Never Forgotten</div>
              <h4 className="font-serif text-5xl mb-4 leading-none">Kunle Adepeju</h4>
              <p className="text-slate-400 font-serif italic text-xl">"His sacrifice fueled the fire of student consciousness forever."</p>
              <Flag className="absolute -bottom-10 -right-10 text-white/5 w-64 h-64 rotate-12" />
            </div>
          </RegistryItem>

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
