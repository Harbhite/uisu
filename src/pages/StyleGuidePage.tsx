
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
  Terminal, Component, ChevronRight, User, Search, Fingerprint,
  Book, Award, Shield, Landmark, Bell, Calendar, Mail, Info,
  Download, ExternalLink, Play, Trash2, Plus, Minus, Menu, X,
  Settings, Activity, Globe, Scale, Mic, Gavel, Coins, Trophy,
  AlertTriangle, CheckCircle2, XCircle, MoreHorizontal, Home,
  MessageSquare, Archive, ShieldAlert, ChevronDown, ChevronUp,
  RefreshCcw, BarChart3, ListFilter, Sliders, Eye, EyeOff, Lock,
  Unlock, FileText, Database, Cloud, FileCheck, UserCircle,
  Hash, QrCode, HardDrive, History, Monitor, Command, Edit3,
  Signature, MoreVertical, LogOut, ChevronLeft, Files, Ghost,
  CreditCard, ClipboardCheck, GraduationCap, Bus, Wallet, Sparkles,
  Filter, SortDesc, Square, Smartphone, Map, Image as ImageIcon,
  Printer, Grid, Layout
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';

// --- UTILITY COMPONENTS ---

const CopySnippet = ({ text, label, fullWidth = false }: { text: string; label?: string; fullWidth?: boolean }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`group relative flex items-center justify-between bg-slate-900 text-slate-300 p-3 rounded-none border border-white/10 font-mono text-[10px] overflow-hidden ${fullWidth ? 'w-full' : ''} no-print`}>
      <div className="flex flex-col flex-1 min-w-0">
        {label && <span className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">{label}</span>}
        <span className="truncate pr-2">{text}</span>
      </div>
      <button
        onClick={handleCopy}
        className="shrink-0 p-2 bg-white/5 hover:bg-nobel-gold hover:text-ui-blue transition-all"
        title="Copy to clipboard"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="absolute right-12 bg-nobel-gold text-ui-blue px-2 py-1 text-[8px] font-bold uppercase tracking-widest shadow-lg"
          >
            Copied
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title, subtitle, id }: { icon: any, title: string, subtitle?: string, id: string }) => (
  <div id={id} className="scroll-mt-32 mb-12 pb-4 border-b border-slate-200 mt-24 first:mt-0 break-inside-avoid-page">
    <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">
      <Icon size={16} /> {title}
    </div>
    {subtitle && <p className="text-sm text-slate-500 font-light">{subtitle}</p>}
  </div>
);

interface ColorSwatchProps {
    name: string;
    hex: string;
    usage: string;
    variants?: { name: string; hex: string }[];
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ name, hex, usage, variants }) => (
    <div className="bg-white border border-slate-200 p-6 flex flex-col gap-4 shadow-sm group hover:border-nobel-gold transition-colors break-inside-avoid">
        <div
            className="w-full h-32 border border-slate-100 group-hover:scale-[1.02] transition-transform shadow-inner relative overflow-hidden print:border-slate-300"
            style={{ backgroundColor: hex }}
        >
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay print:hidden"></div>
        </div>
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="font-serif text-xl text-ui-blue">{name}</span>
            </div>
            <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mb-4 h-12 overflow-hidden">{usage}</p>

            <div className="space-y-4">
                <CopySnippet label="Primary HEX" text={hex} fullWidth />

                {variants && (
                    <div className="space-y-2 pt-2 border-t border-slate-50">
                        <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-slate-300">Tonal Registry</span>
                        <div className="flex gap-2">
                           {variants.map(v => (
                               <div
                                 key={v.hex}
                                 className="w-full h-6 border border-slate-100 cursor-pointer hover:scale-105 transition-transform print:border-slate-300"
                                 style={{ backgroundColor: v.hex }}
                                 title={`${v.name}: ${v.hex}`}
                                 onClick={() => navigator.clipboard.writeText(v.hex)}
                               ></div>
                           ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
);

// --- MAIN PAGE COMPONENT ---

const StyleGuidePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('colour');

  const categories = [
    { id: 'colour', label: 'Colour', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'iconography', label: 'Iconography', icon: Terminal },
    { id: 'navigations', label: 'Navigations', icon: Map },
    { id: 'loadings', label: 'Loadings', icon: RefreshCcw },
    { id: 'forms', label: 'Forms & Interactive', icon: Box },
    { id: 'tables', label: 'Tables & Listings', icon: ListFilter },
    { id: 'diagrams', label: 'Diagrams & Flows', icon: Activity },
    { id: '3d', label: '3D & Immersive', icon: Globe },
    { id: 'cards', label: 'Cards & Containers', icon: LayoutGrid },
    { id: 'decor', label: 'Decor & Animation', icon: Sparkles },
    { id: 'assets', label: 'Assets & Media', icon: Monitor },
    { id: 'security', label: 'Security & Identity', icon: ShieldCheck },
    { id: 'layout', label: 'Layout & Grid', icon: Grid },
    { id: 'brand', label: 'Brand Identity', icon: Star },
    { id: 'utilities', label: 'Utilities & Helpers', icon: Code },
  ];

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const handleScroll = () => {
      // Simple scroll spy logic
      const sections = categories.map(c => document.getElementById(c.id));
      const scrollPosition = window.scrollY + 150;

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
    <div className="min-h-screen bg-slate-50 selection:bg-nobel-gold selection:text-white print:bg-white">
      <SEO
        title="Style Guide & Aluta Protocol"
        description="The comprehensive visual ledger and design doctrine for the UISU Archive platform."
      />

      {/* Navigation Sidebar (Hidden on Print) */}
      <nav className="fixed top-0 left-0 w-64 h-screen bg-white border-r border-slate-200 z-50 overflow-y-auto hidden lg:block no-print">
         <div className="p-8 border-b border-slate-100">
            <Link to="/" className="flex items-center gap-2 group mb-6">
               <ArrowLeft size={14} className="text-slate-400 group-hover:text-nobel-gold transition-colors"/>
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-ui-blue">Back to App</span>
            </Link>
            <h1 className="font-serif text-2xl text-ui-blue mb-2">Design <br/><span className="italic text-slate-400">Doctrine</span></h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Version 2.4.0</p>
         </div>
         <div className="p-4 space-y-1">
            {categories.map((cat) => (
                <a
                   key={cat.id}
                   href={`#${cat.id}`}
                   className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-sm ${activeSection === cat.id ? 'bg-ui-blue text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-ui-blue'}`}
                >
                   <cat.icon size={14} />
                   <span>{cat.label}</span>
                </a>
            ))}
         </div>
         <div className="p-8 border-t border-slate-100 mt-4">
            <Button onClick={handlePrint} variant="outline" className="w-full gap-2 text-xs font-bold uppercase tracking-widest border-slate-300">
               <Printer size={14}/> Print PDF
            </Button>
         </div>
      </nav>

      {/* Mobile Header (Hidden on Print) */}
      <div className="lg:hidden sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-slate-200 p-4 flex justify-between items-center no-print">
         <div className="font-serif text-xl text-ui-blue">Design Doctrine</div>
         <Button onClick={handlePrint} size="sm" variant="ghost"><Printer size={16}/></Button>
      </div>

      {/* Main Content Area */}
      <main className="lg:pl-64 w-full">
         <div className="container mx-auto px-6 py-20 max-w-5xl">

            {/* Intro Header */}
            <div className="mb-24 break-after-avoid">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-1 bg-nobel-gold"></div>
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-500">The Visual Ledger</span>
                </div>
                <h1 className="text-5xl md:text-8xl font-serif text-ui-blue leading-[0.9] mb-8">
                    The Aluta <br/> <span className="italic text-slate-300">Protocol</span>
                </h1>
                <p className="text-xl text-slate-600 font-light max-w-2xl leading-relaxed">
                    A comprehensive design system mandating visual severity, intellectual integrity, and archival density. Every pixel is a historical record.
                </p>
            </div>

            {/* 1. Colour */}
            <section>
                <SectionHeader id="colour" icon={Palette} title="01. Colour" subtitle="The chromatic standard for the intellectual vanguard." />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-8">
                    <ColorSwatch
                        name="UI Blue"
                        hex="#003366"
                        usage="Primary Brand Identity, High-Hierarchy Text, Navigation Frames."
                        variants={[
                            { name: "Blue Dark", hex: "#002244" },
                            { name: "Blue Soft", hex: "#003366CC" }
                        ]}
                    />
                    <ColorSwatch
                        name="Nobel Gold"
                        hex="#C5A059"
                        usage="Interactive Highlights, Achievements, Metadata Accents, Active States."
                        variants={[
                            { name: "Gold Pale", hex: "#E9D8B6" },
                            { name: "Gold Muted", hex: "#A6864B" }
                        ]}
                    />
                    <ColorSwatch
                        name="Heritage Slate"
                        hex="#1E293B"
                        usage="Neutral Components, Secondary Metadata, Archival Textures."
                        variants={[
                            { name: "Slate Light", hex: "#F1F5F9" },
                            { name: "Slate Heavy", hex: "#0F172A" }
                        ]}
                    />
                    <ColorSwatch
                        name="Archive Cream"
                        hex="#F9F8F4"
                        usage="Base Page Background, Tactile Paper Emulation, Content Slates."
                        variants={[
                            { name: "Cream Deep", hex: "#F2EFE9" },
                            { name: "Cream pure", hex: "#FFFFFF" }
                        ]}
                    />
                </div>
            </section>

            {/* 2. Typography */}
            <section>
                <SectionHeader id="typography" icon={Type} title="02. Typography" subtitle="The balance between academic tradition and modern clarity." />
                <div className="space-y-16">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-b border-slate-100 pb-12">
                        <div className="lg:col-span-4">
                            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-4">Serif Typeface</h4>
                            <div className="font-serif text-5xl text-ui-blue mb-4">Playfair Display</div>
                            <CopySnippet label="CSS Definition" text="font-family: 'Playfair Display', serif;" />
                        </div>
                        <div className="lg:col-span-8 space-y-6">
                            <div className="text-6xl font-serif text-ui-blue italic">Aa Bb Cc</div>
                            <div className="text-4xl font-serif text-slate-800">"Knowledge is the fount of life."</div>
                            <p className="text-sm text-slate-500 max-w-md">Used for all primary headings, titles, and high-impact statements to evoke institutional authority.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-4">
                            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-4">Sans Typeface</h4>
                            <div className="font-sans text-3xl font-bold text-ui-blue mb-4">Inter</div>
                            <CopySnippet label="CSS Definition" text="font-family: 'Inter', sans-serif;" />
                        </div>
                        <div className="lg:col-span-8 space-y-6">
                            <div className="text-6xl font-sans text-ui-blue font-bold">Aa Bb Cc</div>
                            <div className="text-xl font-sans text-slate-600 leading-relaxed font-light">
                                Reliable, high-legibility rendering for body content, navigational elements, and technical data points.
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <div className="text-xs font-bold uppercase tracking-[0.4em] text-slate-400 border border-slate-200 px-3 py-1">METADATA CAPS</div>
                                <div className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-1">Technical_Mono_Code</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Iconography */}
            <section>
                <SectionHeader id="iconography" icon={Terminal} title="03. Iconography" subtitle="Curated symbols from the Lucide system." />
                <div className="bg-white border border-slate-200 p-8">
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-8">
                        {[
                            { icon: Shield, name: 'Shield' }, { icon: Gavel, name: 'Gavel' },
                            { icon: Landmark, name: 'Landmark' }, { icon: Star, name: 'Star' },
                            { icon: Award, name: 'Award' }, { icon: Fingerprint, name: 'Fingerprint' },
                            { icon: Terminal, name: 'Terminal' }, { icon: User, name: 'User' },
                            { icon: Book, name: 'Book' }, { icon: Scale, name: 'Scale' },
                            { icon: Coins, name: 'Coins' }, { icon: Trophy, name: 'Trophy' },
                            { icon: Mic, name: 'Mic' }, { icon: Bell, name: 'Bell' },
                            { icon: Search, name: 'Search' }, { icon: LayoutGrid, name: 'Grid' },
                            { icon: AlertTriangle, name: 'Alert' }, { icon: CheckCircle2, name: 'Success' },
                            { icon: XCircle, name: 'Error' }, { icon: MoreHorizontal, name: 'More' },
                            { icon: Home, name: 'Home' }, { icon: MessageSquare, name: 'Chat' },
                            { icon: Archive, name: 'Archive' }, { icon: ShieldAlert, name: 'Restricted' },
                        ].map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-3 group cursor-pointer" onClick={() => navigator.clipboard.writeText(`<${item.name} size={24} />`)}>
                                <div className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-ui-blue group-hover:text-white transition-all rounded-sm">
                                    <item.icon size={20} />
                                </div>
                                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-300 group-hover:text-slate-900 transition-colors">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Navigations */}
            <section>
                <SectionHeader id="navigations" icon={Map} title="04. Navigations" subtitle="Wayfinding systems and hierarchical indicators." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Breadcrumbs */}
                    <div className="space-y-4">
                        <h5 className="text-[9px] font-bold uppercase text-slate-400">Breadcrumb Trail</h5>
                        <div className="p-4 bg-white border border-slate-200">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                <span className="hover:text-ui-blue cursor-pointer transition-colors">Home</span>
                                <ChevronRight size={12} />
                                <span className="hover:text-ui-blue cursor-pointer transition-colors">Governance</span>
                                <ChevronRight size={12} />
                                <span className="text-ui-blue">Executive_Council</span>
                            </div>
                        </div>
                        <CopySnippet label="Breadcrumb" text="flex items-center gap-2 text-[10px] font-bold uppercase" />
                    </div>

                    {/* Pagination */}
                    <div className="space-y-4">
                        <h5 className="text-[9px] font-bold uppercase text-slate-400">Pagination Sequence</h5>
                        <div className="p-4 bg-white border border-slate-200 flex justify-center">
                            <div className="flex items-center gap-1">
                                <div className="w-8 h-8 flex items-center justify-center border border-slate-200 text-slate-400 hover:border-ui-blue hover:text-ui-blue cursor-pointer transition-all"><ChevronLeft size={14}/></div>
                                <div className="w-8 h-8 flex items-center justify-center border border-ui-blue bg-ui-blue text-white font-mono text-[10px]">01</div>
                                <div className="w-8 h-8 flex items-center justify-center border border-slate-200 text-slate-500 font-mono text-[10px] hover:border-nobel-gold cursor-pointer transition-all">02</div>
                                <div className="w-8 h-8 flex items-center justify-center border border-slate-200 text-slate-500 font-mono text-[10px] hover:border-nobel-gold cursor-pointer transition-all">...</div>
                                <div className="w-8 h-8 flex items-center justify-center border border-slate-200 text-slate-400 hover:border-ui-blue hover:text-ui-blue cursor-pointer transition-all"><ChevronRight size={14}/></div>
                            </div>
                        </div>
                        <CopySnippet label="Pagination" text="w-8 h-8 border border-slate-200 font-mono" />
                    </div>

                    {/* Tabs */}
                    <div className="space-y-4 md:col-span-2">
                        <h5 className="text-[9px] font-bold uppercase text-slate-400">Tab Interface</h5>
                        <div className="bg-slate-50 border-b border-slate-200">
                            <div className="flex">
                                <div className="px-6 py-3 border-b-2 border-ui-blue text-ui-blue text-xs font-bold uppercase tracking-widest cursor-pointer">Active Tab</div>
                                <div className="px-6 py-3 border-b-2 border-transparent text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-slate-600 cursor-pointer">Inactive Tab</div>
                                <div className="px-6 py-3 border-b-2 border-transparent text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-slate-600 cursor-pointer">Disabled</div>
                            </div>
                        </div>
                        <CopySnippet label="Tab Active" text="border-b-2 border-ui-blue text-ui-blue" />
                    </div>
                </div>
            </section>

            {/* 5. Loadings */}
            <section>
                <SectionHeader id="loadings" icon={RefreshCcw} title="05. Loadings" subtitle="States of data retrieval and processing." />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="space-y-4">
                         <h5 className="text-[9px] font-bold uppercase text-slate-400">Circular Loader</h5>
                         <div className="p-8 bg-white border border-slate-200 flex justify-center">
                             <div className="w-8 h-8 border-4 border-slate-100 border-t-nobel-gold rounded-full animate-spin"></div>
                         </div>
                         <CopySnippet label="Spinner" text="border-4 border-t-nobel-gold rounded-full animate-spin" />
                     </div>
                     <div className="space-y-4">
                         <h5 className="text-[9px] font-bold uppercase text-slate-400">Skeleton Row</h5>
                         <div className="p-8 bg-white border border-slate-200 space-y-3">
                             <div className="h-4 bg-slate-100 animate-pulse w-3/4"></div>
                             <div className="h-4 bg-slate-100 animate-pulse w-1/2"></div>
                         </div>
                         <CopySnippet label="Skeleton" text="bg-slate-100 animate-pulse" />
                     </div>
                     <div className="space-y-4">
                         <h5 className="text-[9px] font-bold uppercase text-slate-400">Progress Bar</h5>
                         <div className="p-8 bg-white border border-slate-200 flex items-center">
                             <div className="w-full h-2 bg-slate-100 relative overflow-hidden">
                                 <div className="absolute top-0 left-0 h-full w-2/3 bg-ui-blue"></div>
                             </div>
                         </div>
                         <CopySnippet label="Progress" text="h-2 bg-slate-100 relative overflow-hidden" />
                     </div>
                </div>
            </section>

            {/* 6. Forms & Interactive */}
            <section>
                <SectionHeader id="forms" icon={Box} title="06. Forms & Interactive" subtitle="Input mechanisms and action triggers." />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Buttons */}
                    <div className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div className="space-y-2">
                             <button className="w-full px-6 py-3 bg-ui-blue text-white text-xs font-bold uppercase tracking-widest border border-ui-blue hover:bg-ui-dark transition-all">Primary Action</button>
                             <CopySnippet label="Primary Btn" text="bg-ui-blue text-white hover:bg-ui-dark" />
                        </div>
                        <div className="space-y-2">
                             <button className="w-full px-6 py-3 bg-nobel-gold text-ui-blue text-xs font-bold uppercase tracking-widest border border-nobel-gold hover:bg-white transition-all">Secondary/Accent</button>
                             <CopySnippet label="Accent Btn" text="bg-nobel-gold text-ui-blue hover:bg-white" />
                        </div>
                        <div className="space-y-2">
                             <button className="w-full px-6 py-3 bg-transparent text-ui-blue text-xs font-bold uppercase tracking-widest border border-slate-300 hover:border-ui-blue transition-all">Ghost/Outline</button>
                             <CopySnippet label="Ghost Btn" text="bg-transparent border border-slate-300" />
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        <h5 className="text-[9px] font-bold uppercase text-slate-400">Standard Input</h5>
                        <input type="text" placeholder="ENTER_DATA..." className="w-full bg-slate-50 border border-slate-200 p-3 text-[10px] font-mono outline-none focus:border-ui-blue transition-all" />
                        <CopySnippet label="Input" text="bg-slate-50 border border-slate-200 font-mono" />
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[9px] font-bold uppercase text-slate-400">Error State</h5>
                        <div className="relative">
                            <input type="text" value="INVALID_KEY" readOnly className="w-full bg-red-50 border border-red-200 p-3 text-[10px] font-mono text-red-700 outline-none" />
                            <AlertTriangle size={14} className="absolute right-3 top-3 text-red-500"/>
                        </div>
                        <CopySnippet label="Error Input" text="bg-red-50 border-red-200 text-red-700" />
                    </div>

                    {/* Toggles */}
                    <div className="space-y-4">
                        <h5 className="text-[9px] font-bold uppercase text-slate-400">Toggles & Checks</h5>
                        <div className="flex gap-4 p-4 bg-white border border-slate-200">
                             <div className="w-5 h-5 border-2 border-ui-blue bg-ui-blue flex items-center justify-center text-white"><Check size={12}/></div>
                             <div className="w-5 h-5 border-2 border-slate-300"></div>
                             <div className="w-10 h-5 bg-slate-200 rounded-full relative"><div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
                             <div className="w-10 h-5 bg-ui-blue rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
                        </div>
                        <CopySnippet label="Checkbox" text="w-5 h-5 border-2 border-ui-blue" />
                    </div>
                </div>
            </section>

            {/* 7. Tables & Listings */}
            <section>
                <SectionHeader id="tables" icon={ListFilter} title="07. Tables & Listings" subtitle="Complex data rendering for records." />
                <div className="space-y-8">
                     <div className="border border-slate-200 bg-white">
                         <div className="grid grid-cols-12 bg-ui-blue text-white p-4 text-[9px] font-bold uppercase tracking-widest">
                             <div className="col-span-2">Ref_ID</div>
                             <div className="col-span-6">Subject</div>
                             <div className="col-span-2">Date</div>
                             <div className="col-span-2 text-right">Status</div>
                         </div>
                         {[1,2,3].map(i => (
                             <div key={i} className="grid grid-cols-12 p-4 border-b border-slate-100 text-xs hover:bg-slate-50 transition-colors">
                                 <div className="col-span-2 font-mono text-ui-blue">REC_{i}00X</div>
                                 <div className="col-span-6 font-medium text-slate-700">Annual Legislative Report V.{i}</div>
                                 <div className="col-span-2 text-slate-500">Oct {i}, 2024</div>
                                 <div className="col-span-2 text-right"><span className="px-2 py-1 bg-green-50 text-green-700 text-[8px] font-bold uppercase rounded-sm">Verified</span></div>
                             </div>
                         ))}
                     </div>
                     <CopySnippet label="Table Structure" text="grid grid-cols-12 border-b border-slate-100" fullWidth />
                </div>
            </section>

            {/* 8. Diagrams & Flows */}
            <section>
                <SectionHeader id="diagrams" icon={Activity} title="08. Diagrams & Flows" subtitle="Visualizing processes and structural hierarchies." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="p-8 bg-slate-50 border border-slate-200 flex flex-col items-center gap-4">
                          <div className="px-6 py-3 bg-white border border-ui-blue text-ui-blue font-bold text-xs uppercase shadow-sm">Initiation</div>
                          <div className="h-8 w-px bg-slate-300"></div>
                          <div className="px-6 py-3 bg-white border border-slate-300 text-slate-500 font-bold text-xs uppercase shadow-sm">Review</div>
                          <div className="h-8 w-px bg-slate-300"></div>
                          <div className="flex gap-8">
                              <div className="px-4 py-2 bg-green-50 border border-green-200 text-green-700 text-[9px] uppercase font-bold">Approve</div>
                              <div className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 text-[9px] uppercase font-bold">Reject</div>
                          </div>
                     </div>
                     <div className="p-8 bg-slate-900 border border-slate-800 relative overflow-hidden">
                          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
                          <div className="relative z-10 flex items-end gap-2 h-40">
                              {[30, 50, 45, 70, 60, 85, 90].map((h, i) => (
                                  <div key={i} className="flex-1 bg-nobel-gold hover:bg-white transition-colors cursor-pointer relative group" style={{ height: `${h}%` }}>
                                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] text-white opacity-0 group-hover:opacity-100 transition-opacity">{h}%</div>
                                  </div>
                              ))}
                          </div>
                     </div>
                </div>
            </section>

            {/* 9. 3D & Immersive */}
            <section>
                <SectionHeader id="3d" icon={Globe} title="09. 3D & Immersive" subtitle="Interactive spatial elements and canvases." />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="aspect-video bg-black relative overflow-hidden flex items-center justify-center group">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-ui-blue/30 via-black to-black"></div>
                          <div className="w-24 h-24 border border-nobel-gold/50 rotate-45 animate-pulse relative z-10 group-hover:rotate-90 transition-transform duration-700">
                              <div className="absolute inset-2 border border-ui-blue/50"></div>
                          </div>
                          <div className="absolute bottom-4 left-4 text-xs font-mono text-nobel-gold">CANVAS_RENDER_01</div>
                     </div>
                     <div className="p-6 bg-slate-50 border border-slate-200">
                          <h5 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">Implementation Note</h5>
                          <p className="text-sm text-slate-600 leading-relaxed mb-4">
                              3D elements leverage <code>@react-three/fiber</code>. Ensure all scenes are wrapped in a <code>Suspense</code> boundary with a fallback loader to maintain performance on lower-end devices.
                          </p>
                          <CopySnippet label="Canvas Import" text="import { Canvas } from '@react-three/fiber';" fullWidth />
                     </div>
                </div>
            </section>

            {/* 10. Cards & Containers */}
            <section>
                <SectionHeader id="cards" icon={LayoutGrid} title="10. Cards & Containers" subtitle="Archetypes for content organization." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Executive Card */}
                     <div className="bg-white p-8 border border-slate-200 group relative shadow-sm hover:shadow-md transition-all">
                        <div className="absolute top-0 left-0 w-full h-1 bg-ui-blue transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                        <div className="w-10 h-10 bg-slate-50 flex items-center justify-center text-ui-blue mb-4"><Shield size={20}/></div>
                        <h3 className="font-serif text-2xl text-ui-blue mb-2">Executive Module</h3>
                        <p className="text-sm text-slate-500 font-light leading-relaxed mb-6">Official container for high-hierarchy governance data.</p>
                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-slate-400">
                            <span>Status: Active</span>
                            <ChevronRight size={14}/>
                        </div>
                     </div>

                     {/* Legacy Card */}
                     <div className="bg-slate-50 p-8 border-l-4 border-nobel-gold relative overflow-hidden">
                        <Award className="text-nobel-gold mb-4" size={28} />
                        <h3 className="font-serif text-2xl text-ui-blue mb-2 italic">Legacy Block</h3>
                        <p className="text-sm text-slate-600 font-light leading-relaxed italic">"Used for quotes, alumni records, and historical highlights."</p>
                     </div>
                </div>
            </section>

            {/* 11. Decor & Animation */}
            <section>
                <SectionHeader id="decor" icon={Sparkles} title="11. Decor & Animation" subtitle="Visual flourishes and motion patterns." />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="space-y-4">
                          <h5 className="text-[9px] font-bold uppercase text-slate-400">Ornate Divider</h5>
                          <div className="flex items-center gap-4 py-4">
                              <div className="h-px flex-1 bg-slate-200"></div>
                              <div className="w-2 h-2 rotate-45 bg-nobel-gold"></div>
                              <div className="h-px flex-1 bg-slate-200"></div>
                          </div>
                     </div>
                     <div className="space-y-4">
                          <h5 className="text-[9px] font-bold uppercase text-slate-400">Grain Texture</h5>
                          <div className="h-20 bg-slate-200 relative overflow-hidden">
                               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-multiply"></div>
                          </div>
                          <CopySnippet label="CSS Class" text="noise-overlay" />
                     </div>
                     <div className="space-y-4">
                          <h5 className="text-[9px] font-bold uppercase text-slate-400">Hover Lift</h5>
                          <div className="h-20 bg-white border border-slate-200 flex items-center justify-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer">
                               <span className="text-xs font-bold text-ui-blue">HOVER ME</span>
                          </div>
                     </div>
                </div>
            </section>

            {/* 12. Assets & Media */}
            <section>
                <SectionHeader id="assets" icon={Monitor} title="12. Assets & Media" subtitle="Standardized rendering for visual artifacts." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="aspect-video bg-slate-100 relative group overflow-hidden border border-slate-200">
                          <div className="absolute inset-0 flex items-center justify-center z-10">
                              <div className="w-16 h-16 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-ui-blue shadow-lg group-hover:scale-110 transition-transform cursor-pointer">
                                  <Play size={24} className="ml-1"/>
                              </div>
                          </div>
                          <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/60 to-transparent">
                              <div className="text-white text-sm font-bold">Video Thumbnail Overlay</div>
                          </div>
                     </div>
                     <div className="p-4 border border-slate-200 bg-white flex items-start gap-4">
                          <div className="w-20 h-20 bg-slate-50 flex items-center justify-center text-slate-300"><ImageIcon size={32}/></div>
                          <div>
                              <div className="text-xs font-bold uppercase text-ui-blue mb-1">Figure 1.2</div>
                              <div className="text-sm text-slate-600 mb-2">Architectural Blueprint</div>
                              <div className="flex gap-2">
                                  <span className="px-2 py-1 bg-slate-100 text-[8px] font-bold uppercase text-slate-500">JPG</span>
                                  <span className="px-2 py-1 bg-slate-100 text-[8px] font-bold uppercase text-slate-500">2.4 MB</span>
                              </div>
                          </div>
                     </div>
                </div>
            </section>

            {/* 13. Security & Identity */}
            <section>
                <SectionHeader id="security" icon={ShieldCheck} title="13. Security & Identity" subtitle="Visual signals for authentication and access." />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="space-y-4">
                          <h5 className="text-[9px] font-bold uppercase text-slate-400">Verified Badge</h5>
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-ui-blue border border-blue-100 rounded-sm">
                              <ShieldCheck size={12}/>
                              <span className="text-[9px] font-bold uppercase tracking-widest">Official</span>
                          </div>
                     </div>
                     <div className="space-y-4">
                          <h5 className="text-[9px] font-bold uppercase text-slate-400">Locked Content</h5>
                          <div className="p-4 bg-slate-50 border border-slate-200 border-dashed flex items-center gap-3 text-slate-400">
                              <Lock size={16}/>
                              <span className="text-xs font-mono">ENCRYPTED_DATA_BLOCK</span>
                          </div>
                     </div>
                     <div className="space-y-4">
                          <h5 className="text-[9px] font-bold uppercase text-slate-400">Security Alert</h5>
                          <div className="p-4 bg-red-50 border border-red-100 text-red-800 flex items-center gap-3">
                              <ShieldAlert size={16}/>
                              <span className="text-[10px] font-bold uppercase tracking-widest">Unauthorized</span>
                          </div>
                     </div>
                </div>
            </section>

            {/* 14. Layout & Grid */}
            <section>
                <SectionHeader id="layout" icon={Grid} title="14. Layout & Grid" subtitle="Structural foundations and spacing tokens." />
                <div className="space-y-8">
                     <div className="grid grid-cols-12 gap-2 h-24">
                          {[...Array(12)].map((_, i) => (
                              <div key={i} className="bg-ui-blue/10 border border-ui-blue/20 flex items-center justify-center text-[9px] text-ui-blue font-mono">
                                  Col
                              </div>
                          ))}
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                          <div>
                              <h5 className="text-[9px] font-bold uppercase text-slate-400 mb-2">Container Max-Widths</h5>
                              <ul className="text-xs space-y-2 font-mono text-slate-600">
                                  <li>sm: 640px</li>
                                  <li>md: 768px</li>
                                  <li>lg: 1024px</li>
                                  <li>xl: 1280px</li>
                                  <li>2xl: 1536px</li>
                              </ul>
                          </div>
                          <div>
                              <h5 className="text-[9px] font-bold uppercase text-slate-400 mb-2">Spacing Scale</h5>
                              <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-nobel-gold"></div><span className="text-[10px] font-mono">p-4 (1rem)</span></div>
                                  <div className="flex items-center gap-2"><div className="w-8 h-8 bg-nobel-gold"></div><span className="text-[10px] font-mono">p-8 (2rem)</span></div>
                              </div>
                          </div>
                     </div>
                </div>
            </section>

            {/* 15. Brand Identity */}
            <section>
                <SectionHeader id="brand" icon={Star} title="15. Brand Identity" subtitle="Tone, voice, and logo usage guidelines." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="p-8 border border-slate-200 bg-white">
                          <h4 className="font-serif text-2xl text-ui-blue mb-4">Tone of Voice</h4>
                          <p className="text-sm text-slate-600 leading-relaxed mb-4">
                              The UISU Archive speaks with <span className="font-bold text-ui-blue">institutional authority</span> and <span className="font-bold text-ui-blue">historical reverence</span>. Language should be precise, slightly formal, and intellectually rigorous. Avoid slang or overly casual phrasing.
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
                     <div className="p-8 border border-slate-200 bg-ui-blue text-white">
                          <h4 className="font-serif text-2xl mb-4">Logo Usage</h4>
                          <div className="flex items-center gap-4 mb-6">
                               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-ui-blue font-serif font-bold text-xl">U</div>
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
            </section>

            {/* 16. Utilities & Helpers */}
            <section className="mb-32">
                <SectionHeader id="utilities" icon={Code} title="16. Utilities & Helpers" subtitle="Functional classes and mixins for rapid development." />
                <div className="grid grid-cols-1 gap-6">
                     <div className="bg-slate-900 text-slate-300 p-6 font-mono text-xs overflow-x-auto border border-white/10">
                          <div className="mb-4">
                              <span className="text-nobel-gold">// Hide scrollbar but allow scroll</span><br/>
                              .no-scrollbar::-webkit-scrollbar &#123; display: none; &#125;
                          </div>
                          <div className="mb-4">
                              <span className="text-nobel-gold">// Marquee Animation</span><br/>
                              .animate-marquee &#123; animation: marquee 20s linear infinite; &#125;
                          </div>
                          <div>
                              <span className="text-nobel-gold">// Print Hide</span><br/>
                              @media print &#123; .no-print &#123; display: none !important; &#125; &#125;
                          </div>
                     </div>
                </div>
            </section>

            {/* Footer */}
            <div className="mt-32 pt-16 border-t border-slate-200 text-center relative overflow-hidden break-inside-avoid">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-nobel-gold/5 blur-3xl rounded-full"></div>
                <Star size={40} className="mx-auto text-nobel-gold/20 mb-6" />
                <p className="text-[10px] font-bold uppercase tracking-[1em] text-slate-300 relative z-10">Intellectualism & Welfare Protocol</p>
            </div>
         </div>
      </main>
    </div>
  );
};

export default StyleGuidePage;
