
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
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
  Filter, SortDesc, Square, Smartphone, Map, Image as ImageIcon
} from 'lucide-react';
import { SEO } from '@/components/SEO';

const CopySnippet = ({ text, label, fullWidth = false }: { text: string; label?: string; fullWidth?: boolean }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`group relative flex items-center justify-between bg-slate-900 text-slate-300 p-3 rounded-none border border-white/10 font-mono text-[10px] overflow-hidden ${fullWidth ? 'w-full' : ''}`}>
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

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) => (
  <div className="mb-12 pb-4 border-b border-slate-200 mt-32">
    <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">
      <Icon size={16} /> {title}
    </div>
    {subtitle && <p className="text-sm text-slate-500 font-light">{subtitle}</p>}
  </div>
);

const StyleGuidePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24 selection:bg-nobel-gold selection:text-white">
      <SEO
        title="Style Guide"
        description="The definitive visual ledger and design doctrine for the UISU Archive platform."
      />
      <div className="container mx-auto px-6">
        {/* Navigation */}
        <Link
            to="/"
            className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors mb-12 w-fit"
        >
            <div className="p-2 rounded-none border border-slate-300 group-hover:border-nobel-gold transition-colors">
                <ArrowLeft size={14} />
            </div>
            <span>Back to Archive</span>
        </Link>

        {/* Header */}
        <div className="mb-20">
            <div className="flex items-center gap-4 mb-4">
                <Palette className="text-nobel-gold w-6 h-6" />
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-500">The Definitive Visual Ledger</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-serif text-ui-blue leading-[0.85] mb-6">
                Design <br/> <span className="italic text-slate-300">Doctrine</span>
            </h1>
            <p className="text-xl text-slate-600 font-light max-w-2xl leading-relaxed">
                The "Aluta Protocol" mandates visual severity, intellectual integrity, and archival density. Every pixel is a historical record.
            </p>
        </div>

        {/* --- NEW SECTION 16: DATA GRID & TABULAR MATRIX --- */}
        <section>
          <SectionHeader icon={LayoutGrid} title="16. Tabular Matrix" subtitle="Complex data rendering for legislative and administrative records." />
          <div className="grid grid-cols-1 gap-12">
            {/* Table Header Archetype */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Legislative Header Archetype</h5>
              <div className="grid grid-cols-12 gap-4 bg-ui-blue text-white px-8 py-5 text-[10px] font-bold uppercase tracking-[0.3em] border border-ui-blue shadow-lg">
                <div className="col-span-1">REF</div>
                <div className="col-span-5">SUBJECT_NOMENCLATURE</div>
                <div className="col-span-3">JURISDICTION</div>
                <div className="col-span-3 text-right">METRIC_STATUS</div>
              </div>
              <CopySnippet label="Header CSS" text="bg-ui-blue text-white px-8 py-5 text-[10px] font-bold uppercase tracking-[0.3em]" fullWidth />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Row: Standard Data */}
              <div className="space-y-4">
                <h5 className="text-[9px] font-bold uppercase text-slate-400">Data Row: Primary</h5>
                <div className="p-4 bg-white border border-slate-200 flex justify-between items-center group">
                  <div className="text-[10px] font-bold text-ui-blue">SYSTEM_LOG_001</div>
                  <CheckCircle2 size={14} className="text-green-500" />
                </div>
                <CopySnippet label="Row Primary" text="p-4 bg-white border border-slate-200" />
              </div>
              {/* Row: Warning Data */}
              <div className="space-y-4">
                <h5 className="text-[9px] font-bold uppercase text-slate-400">Data Row: Conflict</h5>
                <div className="p-4 bg-red-50 border border-red-100 flex justify-between items-center group">
                  <div className="text-[10px] font-bold text-red-700">UNAUTHORIZED_ACCESS</div>
                  <AlertTriangle size={14} className="text-red-500" />
                </div>
                <CopySnippet label="Row Conflict" text="p-4 bg-red-50 border border-red-100" />
              </div>
              {/* Row: Ghost Data */}
              <div className="space-y-4">
                <h5 className="text-[9px] font-bold uppercase text-slate-400">Data Row: Null/Inactive</h5>
                <div className="p-4 bg-slate-50 border border-slate-100 flex justify-between items-center opacity-50">
                  <div className="text-[10px] font-bold text-slate-400 italic">EMPTY_SET_RECORD</div>
                  <XCircle size={14} className="text-slate-300" />
                </div>
                <CopySnippet label="Row Inactive" text="bg-slate-50 border border-slate-100 opacity-50" />
              </div>
              {/* Summary Cell */}
              <div className="space-y-4">
                <h5 className="text-[9px] font-bold uppercase text-slate-400">Ledger Totals Cell</h5>
                <div className="p-6 bg-slate-100 border border-slate-200 text-right">
                  <div className="text-[8px] font-bold uppercase text-slate-400 mb-1">Cumulative Force</div>
                  <div className="text-2xl font-mono text-ui-blue font-bold tracking-tighter">35,482</div>
                </div>
                <CopySnippet label="Totals Cell" text="bg-slate-100 text-right font-mono" />
              </div>
              {/* Tag Cloud: Archival */}
              <div className="space-y-4">
                <h5 className="text-[9px] font-bold uppercase text-slate-400">Metadata Tag Cloud</h5>
                <div className="flex flex-wrap gap-2">
                  {['Constitution', 'By-Law', 'Amendment', 'Registry'].map(t => (
                    <span key={t} className="px-2 py-1 bg-ui-blue/5 border border-ui-blue/10 text-ui-blue text-[8px] font-bold uppercase tracking-widest">{t}</span>
                  ))}
                </div>
                <CopySnippet label="Tags Cloud" text="flex flex-wrap gap-2 px-2 py-1" />
              </div>
              {/* Detailed Tooltip Item */}
              <div className="space-y-4">
                <h5 className="text-[9px] font-bold uppercase text-slate-400">Grid Detail Hover</h5>
                <div className="p-4 bg-slate-900 text-white border border-nobel-gold/30 relative">
                  <div className="text-[8px] font-mono text-nobel-gold uppercase mb-1">ID: #0048A</div>
                  <div className="text-[10px] uppercase font-bold">Verified Executive Session</div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-nobel-gold"></div>
                </div>
                <CopySnippet label="Grid Detail Hover" text="bg-slate-900 border border-nobel-gold/30" />
              </div>
            </div>
          </div>
        </section>

        {/* --- NEW SECTION 21: FORM & INPUT ARCHITECTURE --- */}
        <section>
          <SectionHeader icon={Box} title="21. Form & Input Architecture" subtitle="Standardized input mechanisms for data collection and user interaction." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Standard Input */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Standard Input Module</h5>
              <div className="group">
                <label className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Matriculation Number</label>
                <div className="relative">
                  <input type="text" placeholder="ENTER_ID..." className="w-full bg-slate-50 border border-slate-200 p-3 text-[10px] font-mono outline-none focus:border-ui-blue focus:bg-white transition-all placeholder:text-slate-300" />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-200 group-focus-within:bg-ui-blue transition-colors"></div>
                </div>
              </div>
              <CopySnippet label="Input Module" text="bg-slate-50 border border-slate-200 p-3 font-mono" />
            </div>

            {/* Error State */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Validation State: Error</h5>
              <div className="group">
                <label className="text-[8px] font-bold uppercase tracking-widest text-red-500 mb-2 block flex justify-between">
                  <span>Access Key</span>
                  <span>INVALID_ENTRY</span>
                </label>
                <div className="relative">
                  <input type="text" value="X99-INVALID" readOnly className="w-full bg-red-50 border border-red-200 p-3 text-[10px] font-mono text-red-700 outline-none" />
                  <AlertTriangle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                </div>
              </div>
              <CopySnippet label="Error Input" text="bg-red-50 border-red-200 text-red-700" />
            </div>

            {/* Text Area */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Text Area Block</h5>
              <div className="relative">
                <textarea className="w-full h-24 bg-white border border-slate-200 p-3 text-[10px] font-mono resize-none outline-none focus:border-nobel-gold transition-all" placeholder="ENTER_MANIFESTO_SUMMARY..."></textarea>
                <div className="absolute bottom-2 right-2 text-[8px] font-bold text-slate-300">0/500</div>
              </div>
              <CopySnippet label="Text Area" text="h-24 bg-white border border-slate-200 resize-none" />
            </div>
          </div>
        </section>

        {/* --- NEW SECTION 22: FEEDBACK & WAYFINDING --- */}
        <section>
          <SectionHeader icon={Map} title="22. Feedback & Wayfinding" subtitle="Navigational aids and system status indicators." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {/* Toast Notification */}
             <div className="space-y-4">
                <h5 className="text-[9px] font-bold uppercase text-slate-400">System Toast Notification</h5>
                <div className="bg-slate-900 text-white p-4 border-l-2 border-nobel-gold shadow-xl flex items-start gap-3 max-w-sm">
                   <div className="mt-0.5 text-nobel-gold"><CheckCircle2 size={16} /></div>
                   <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest mb-1">Record Archived</div>
                      <div className="text-[9px] text-slate-400 leading-relaxed">The legislative entry has been successfully committed to the permanent ledger.</div>
                   </div>
                </div>
                <CopySnippet label="Toast Notification" text="bg-slate-900 border-l-2 border-nobel-gold p-4" />
             </div>

             {/* Breadcrumbs */}
             <div className="space-y-4">
                <h5 className="text-[9px] font-bold uppercase text-slate-400">Breadcrumb Trail</h5>
                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                   <span className="hover:text-ui-blue cursor-pointer transition-colors">Home</span>
                   <ChevronRight size={10} />
                   <span className="hover:text-ui-blue cursor-pointer transition-colors">Registry</span>
                   <ChevronRight size={10} />
                   <span className="text-ui-blue">Executive_01</span>
                </div>
                <CopySnippet label="Breadcrumbs" text="flex items-center gap-2 text-[9px] font-bold uppercase" />
             </div>

             {/* Pagination */}
             <div className="space-y-4">
                <h5 className="text-[9px] font-bold uppercase text-slate-400">Pagination Sequence</h5>
                <div className="flex items-center gap-1">
                   <div className="w-8 h-8 flex items-center justify-center border border-slate-200 text-slate-400 hover:border-ui-blue hover:text-ui-blue cursor-pointer transition-all"><ChevronLeft size={14}/></div>
                   <div className="w-8 h-8 flex items-center justify-center border border-ui-blue bg-ui-blue text-white font-mono text-[10px]">01</div>
                   <div className="w-8 h-8 flex items-center justify-center border border-slate-200 text-slate-500 font-mono text-[10px] hover:border-nobel-gold cursor-pointer transition-all">02</div>
                   <div className="w-8 h-8 flex items-center justify-center border border-slate-200 text-slate-500 font-mono text-[10px] hover:border-nobel-gold cursor-pointer transition-all">03</div>
                   <div className="w-8 h-8 flex items-center justify-center border border-slate-200 text-slate-400 hover:border-ui-blue hover:text-ui-blue cursor-pointer transition-all"><ChevronRight size={14}/></div>
                </div>
                <CopySnippet label="Pagination" text="w-8 h-8 flex items-center justify-center border" />
             </div>
          </div>
        </section>

        {/* --- NEW SECTION 17: ADMINISTRATIVE CONTROLS --- */}
        <section>
          <SectionHeader icon={Sliders} title="17. Administrative Controls" subtitle="Interactive elements for system governance and user parameters." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Filter Pill: Large */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Filter Logic Pill</h5>
              <div className="px-5 py-2 bg-ui-blue text-white rounded-full flex items-center gap-3 w-fit shadow-lg">
                <span className="text-[10px] font-bold uppercase tracking-widest">Category: CEC</span>
                <X size={12} className="cursor-pointer hover:text-nobel-gold transition-colors" />
              </div>
              <CopySnippet label="Filter Pill" text="px-5 py-2 bg-ui-blue text-white rounded-full flex" />
            </div>
            {/* Checkbox Group */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Legislative Checklist</h5>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-ui-blue bg-white flex items-center justify-center">
                    <Check size={14} className="text-ui-blue" />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-600">Article 4 Section A</span>
                </div>
                <div className="flex items-center gap-3 opacity-40">
                  <div className="w-5 h-5 border-2 border-slate-300 bg-white"></div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Article 4 Section B</span>
                </div>
              </div>
              <CopySnippet label="Checkbox Group" text="w-5 h-5 border-2 border-ui-blue" />
            </div>
            {/* Radio Matrix */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">System Priority Toggle</h5>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-nobel-gold flex items-center justify-center p-0.5">
                    <div className="w-full h-full rounded-full bg-nobel-gold"></div>
                  </div>
                  <span className="text-[9px] font-bold uppercase text-ui-blue">Critical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>
                  <span className="text-[9px] font-bold uppercase text-slate-400">Draft</span>
                </div>
              </div>
              <CopySnippet label="Radio Matrix" text="w-4 h-4 rounded-full border-2" />
            </div>
            {/* Vertical Range Slider */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Quota Range Indicator</h5>
              <div className="w-full h-1 bg-slate-200 relative mt-4">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-ui-blue border-2 border-white shadow-md cursor-pointer"></div>
                <div className="absolute top-0 left-0 w-1/2 h-full bg-nobel-gold"></div>
              </div>
              <CopySnippet label="Range Slider" text="h-1 bg-slate-200 relative rounded-none" />
            </div>
            {/* Sort Toggle Button */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Ordering Controller</h5>
              <button className="flex items-center gap-3 px-4 py-2 border border-slate-200 hover:border-ui-blue transition-colors group">
                <SortDesc size={14} className="text-slate-300 group-hover:text-ui-blue" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-ui-blue">Sequence Index</span>
              </button>
              <CopySnippet label="Ordering Btn" text="flex items-center gap-3 px-4 py-2 border" />
            </div>
            {/* Search Input Variant */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Search Module: Ghost</h5>
              <div className="relative group">
                <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-nobel-gold" />
                <input type="text" placeholder="FILTER_SYSTEM_INDEX..." className="w-full bg-transparent border-b border-slate-200 pl-6 py-2 text-[10px] font-mono outline-none focus:border-nobel-gold transition-all" />
              </div>
              <CopySnippet label="Ghost Search" text="border-b bg-transparent pl-6 py-2" />
            </div>
            {/* Multi-Select Tag Trigger */}
            <div className="space-y-4 col-span-1 md:col-span-2">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Entity Association Matrix</h5>
              <div className="p-4 bg-white border border-slate-200 flex flex-wrap gap-2">
                {['Mellamby', 'Indy', 'Bello'].map(h => (
                  <div key={h} className="px-3 py-1 bg-slate-100 flex items-center gap-2 group cursor-pointer hover:bg-ui-blue hover:text-white transition-all">
                    <span className="text-[9px] font-bold uppercase">{h}</span>
                    <Plus size={10} className="text-slate-300 group-hover:text-white" />
                  </div>
                ))}
                <div className="px-3 py-1 border border-dashed border-slate-300 text-[9px] font-bold uppercase text-slate-400 flex items-center gap-1 cursor-pointer">
                   Associate New <Plus size={10}/>
                </div>
              </div>
              <CopySnippet label="Entity Association Matrix" text="p-4 bg-white border flex flex-wrap gap-2" fullWidth />
            </div>
          </div>
        </section>

        {/* --- NEW SECTION 18: ARCHIVAL ASSETS & MEDIA --- */}
        <section>
          <SectionHeader icon={Monitor} title="18. Archival Assets & Media" subtitle="Standardized rendering for visual and auditory historical artifacts." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {/* Video Post Archetype */}
            <div className="col-span-1 lg:col-span-2 space-y-6">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Cinematic Archive Artifact</h5>
              <div className="relative aspect-video bg-ui-blue/10 border border-slate-200 overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform cursor-pointer">
                    <Play size={32} className="text-white fill-white ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-ui-blue/80 to-transparent z-20">
                  <div className="text-[8px] font-bold uppercase text-nobel-gold mb-1">Restored Footage: 1971_PROTEST</div>
                  <div className="text-lg font-serif text-white">The March to the Senate Chambers</div>
                </div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
              </div>
              <CopySnippet label="Video Artifact" text="relative aspect-video bg-ui-blue/10 border group" fullWidth />
            </div>
            {/* Audio Strip Archetype */}
            <div className="space-y-6">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Oral History Transcript Block</h5>
              <div className="bg-slate-900 p-6 border-l-4 border-nobel-gold shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-2 bg-nobel-gold/10 text-nobel-gold"><Mic size={20}/></div>
                  <div className="flex-1 h-1 bg-white/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1/3 h-full bg-nobel-gold"></div>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-400 italic">"The struggle for welfare is a constant variable in the equation of student existence..."</div>
                <div className="mt-4 text-[8px] font-bold text-nobel-gold uppercase tracking-[0.3em]">Recording ID: OH_048B</div>
              </div>
              <CopySnippet label="Audio Block" text="bg-slate-900 border-l-4 border-nobel-gold p-6" />
            </div>
            {/* Gallery Item: Figured */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Figured Image Archive</h5>
              <div className="bg-white p-2 border border-slate-200 group">
                <div className="aspect-square bg-slate-50 relative overflow-hidden mb-3">
                   <div className="absolute inset-0 bg-ui-blue/10 group-hover:bg-ui-blue/0 transition-colors duration-500"></div>
                   <ImageIcon size={48} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-200" />
                </div>
                <div className="px-2 pb-2">
                  <div className="text-[9px] font-bold uppercase text-ui-blue">Plate 01: The Clocktower</div>
                  <div className="text-[7px] font-mono text-slate-400 mt-1">LAT: 7.4442° N | LON: 3.9003° E</div>
                </div>
              </div>
              <CopySnippet label="Gallery Fig" text="p-2 border border-slate-200 group" />
            </div>
            {/* Image Overlay: Meta */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Archival Overlay Logic</h5>
              <div className="aspect-[4/3] bg-ui-blue relative overflow-hidden group">
                <div className="absolute inset-4 border border-white/20 z-10 pointer-events-none"></div>
                <div className="absolute top-6 left-6 text-white text-[10px] font-bold uppercase tracking-widest z-20">HISTORICAL_RECORD_V02</div>
                <div className="absolute bottom-6 right-6 z-20">
                  <div className="w-10 h-10 bg-white flex items-center justify-center text-ui-blue cursor-pointer hover:bg-nobel-gold hover:text-white transition-all">
                    <ExternalLink size={16}/>
                  </div>
                </div>
              </div>
              <CopySnippet label="Archive Overlay" text="relative aspect-[4/3] bg-ui-blue" />
            </div>
            {/* QR Code Identification Card */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Digital ID Identifier</h5>
              <div className="bg-white p-4 border border-slate-200 flex gap-4 items-center shadow-sm">
                <div className="w-12 h-12 bg-slate-50 flex items-center justify-center text-slate-200 border border-slate-100">
                  <QrCode size={32}/>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-ui-blue">ID_AUTHENTICATOR</div>
                  <div className="text-[8px] font-mono text-slate-400 uppercase">Status: VALIDATED_2024</div>
                </div>
              </div>
              <CopySnippet label="ID Identifier" text="bg-white p-4 border flex gap-4" />
            </div>
          </div>
        </section>

        {/* --- NEW SECTION 19: SECURITY & IDENTITY --- */}
        <section>
          <SectionHeader icon={ShieldAlert} title="19. Security & Identity" subtitle="Visual signals for authenticated systems and restrictive access protocols." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Auth Badge: Verified */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Verification Seal: Platinum</h5>
              <div className="px-4 py-2 border-2 border-ui-blue bg-ui-blue/5 flex items-center gap-3 w-fit">
                <ShieldCheck size={16} className="text-ui-blue" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ui-blue">OFFICIALLY_VERIFIED_UITE</span>
              </div>
              <CopySnippet label="Auth Seal" text="px-4 py-2 border-2 border-ui-blue bg-ui-blue/5" />
            </div>
            {/* Locked Field Archetype */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Restrictive Data Field</h5>
              <div className="p-4 bg-slate-100 border border-slate-200 flex justify-between items-center cursor-not-allowed">
                <div className="flex gap-2 items-center opacity-40">
                  <Lock size={12} className="text-slate-400" />
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Confidential_Executive_Notes</span>
                </div>
                <div className="text-[8px] font-bold uppercase text-red-400">Level_4_Access_Required</div>
              </div>
              <CopySnippet label="Locked Field" text="bg-slate-100 border cursor-not-allowed" />
            </div>
            {/* Encrypted ID Code */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Encrypted Registry String</h5>
              <div className="p-3 bg-slate-900 border-l-2 border-nobel-gold font-mono flex items-center gap-3">
                <Fingerprint size={14} className="text-nobel-gold/50" />
                <span className="text-[10px] text-white tracking-widest">A4X-99P-K0L-Z01_SECRET</span>
              </div>
              <CopySnippet label="Encrypted String" text="bg-slate-900 border-l-2 font-mono p-3" />
            </div>
            {/* Biometric Trigger Card */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Biometric Verification Tile</h5>
              <div className="p-8 bg-white border border-slate-200 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-nobel-gold transition-all shadow-sm">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-nobel-gold group-hover:bg-nobel-gold/10 transition-all">
                  <Fingerprint size={40} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 group-hover:text-ui-blue">Initialize_Scan</span>
              </div>
              <CopySnippet label="Biometric Tile" text="p-8 bg-white border flex flex-col items-center" />
            </div>
            {/* System Clearance Meter */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Clearance Authority Indicator</h5>
              <div className="bg-slate-50 border border-slate-200 p-6 shadow-inner">
                <div className="flex justify-between text-[8px] font-bold uppercase mb-3">
                   <span className="text-slate-400">Registry_Clearance</span>
                   <span className="text-ui-blue font-mono">LEVEL_07</span>
                </div>
                <div className="grid grid-cols-10 gap-1 h-3">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className={`h-full ${i < 7 ? 'bg-ui-blue' : 'bg-slate-200'}`}></div>
                  ))}
                </div>
              </div>
              <CopySnippet label="Clearance Meter" text="grid grid-cols-10 gap-1 h-3" />
            </div>
            {/* Identity Badge: Vertical */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Vertical ID Archetype</h5>
              <div className="w-48 bg-white border-2 border-slate-200 p-6 flex flex-col items-center text-center shadow-lg relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-full h-1 bg-nobel-gold"></div>
                 <div className="w-24 h-24 bg-slate-100 mb-6 flex items-center justify-center text-slate-200 border border-slate-100 group-hover:scale-105 transition-transform duration-500">
                    <UserCircle size={64}/>
                 </div>
                 <div className="text-sm font-serif text-ui-blue mb-1">Aweda Bolaji</div>
                 <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-4">President CEC</div>
                 <div className="w-full h-px bg-slate-100 mb-4"></div>
                 <div className="text-[8px] font-mono text-slate-300">UID://2024_048A</div>
              </div>
              <CopySnippet label="Vertical ID" text="w-48 bg-white border-2 p-6 flex flex-col items-center" />
            </div>
            {/* Security Alert: Floating */}
            <div className="space-y-4 col-span-1 md:col-span-3">
               <h5 className="text-[9px] font-bold uppercase text-slate-400">Global Security Alert Strip</h5>
               <div className="bg-red-950 text-white p-4 flex items-center justify-between border-y border-red-500/30 overflow-hidden relative group">
                  <div className="absolute inset-0 bg-red-600/10 animate-pulse pointer-events-none"></div>
                  <div className="flex items-center gap-4 relative z-10">
                    <ShieldAlert size={18} className="text-red-500 animate-bounce" />
                    <div className="text-[10px] font-bold uppercase tracking-[0.4em]">Archival System Integrity Compromised in Sector_D</div>
                  </div>
                  <button className="px-4 py-1 border border-white/20 text-[9px] font-bold uppercase hover:bg-white hover:text-red-950 transition-all relative z-10">Deploy_Response</button>
               </div>
               <CopySnippet label="Security Alert Strip" text="bg-red-950 border-y border-red-500/30 p-4" fullWidth />
            </div>
          </div>
        </section>

        {/* --- NEW SECTION 20: DECORATIVE ACCENTS & TEXTURES --- */}
        <section>
          <SectionHeader icon={Sparkles} title="20. Decorative Accents & Textures" subtitle="Visual flourishes and standardized atmospheric treatments." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Ornate Dropcap */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Ornate Dropcap Archetype</h5>
              <div className="flex items-start gap-4 p-6 bg-white border border-slate-200">
                <div className="text-6xl font-serif font-bold text-nobel-gold leading-[0.7] mt-2">T</div>
                <div className="text-xs text-slate-600 leading-relaxed font-light">The foundations of the Union were laid not in brick, but in the collective consciousness of a new academic era...</div>
              </div>
              <CopySnippet label="Ornate Dropcap" text="text-6xl font-serif font-bold text-nobel-gold" />
            </div>
            {/* Star Icon Cluster */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Official Symbol Cluster</h5>
              <div className="p-8 bg-ui-blue flex items-center justify-center gap-6 border border-white/10">
                <Star size={16} className="text-nobel-gold/30" />
                <Star size={32} className="text-nobel-gold fill-nobel-gold shadow-[0_0_20px_rgba(197,160,89,0.3)]" />
                <Star size={16} className="text-nobel-gold/30" />
              </div>
              <CopySnippet label="Star Cluster" text="Star size={32} fill='currentColor' className='text-nobel-gold'" />
            </div>
            {/* Matrix Corner Accent */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Matrix Geometric Corner</h5>
              <div className="w-full h-32 bg-slate-900 relative overflow-hidden border border-white/5">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-nobel-gold"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-nobel-gold"></div>
                <div className="absolute inset-0 flex items-center justify-center text-white/5 font-serif text-4xl opacity-50 select-none">ALUTA</div>
              </div>
              <CopySnippet label="Corner Accent" text="border-t-2 border-l-2 border-nobel-gold" />
            </div>
            {/* Grain Texture Surface */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Archival Grain Texture</h5>
              <div className="h-32 bg-slate-100 border border-slate-200 relative">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-multiply pointer-events-none"></div>
                <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-[10px] font-bold uppercase tracking-[1em]">Tactile Surface</div>
              </div>
              <CopySnippet label="Grain Surface" text="bg-[noise.svg] opacity-[0.15] mix-blend-multiply" />
            </div>
            {/* Radial Gradient Glow */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Radial Information Glow</h5>
              <div className="h-32 bg-ui-blue border border-white/5 relative overflow-hidden flex items-center justify-center">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-nobel-gold/20 blur-3xl rounded-full"></div>
                 <Info size={24} className="text-white relative z-10" />
              </div>
              <CopySnippet label="Radial Glow" text="bg-nobel-gold/20 blur-3xl rounded-full" />
            </div>
            {/* Glass Morphic Card */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Glass Registry Surface</h5>
              <div className="h-32 bg-gradient-to-br from-ui-blue to-ui-dark p-6 flex items-center justify-center border border-white/10 relative overflow-hidden">
                <div className="w-full h-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl flex items-center justify-center">
                   <span className="text-white text-[10px] font-bold uppercase tracking-widest">Glass_Morphic_V1</span>
                </div>
              </div>
              <CopySnippet label="Glass Surface" text="bg-white/10 backdrop-blur-md border border-white/20" />
            </div>
            {/* Ornate Divider: Gold */}
            <div className="space-y-4 col-span-1 md:col-span-3">
              <h5 className="text-[9px] font-bold uppercase text-slate-400">Legislative Ornate Separator</h5>
              <div className="py-8 flex flex-col items-center gap-4">
                <div className="flex items-center gap-6 w-full">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  <div className="w-3 h-3 rotate-45 bg-nobel-gold border-2 border-white shadow-sm"></div>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </div>
                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-[1.5em]">The Vanguard Line</div>
              </div>
              <CopySnippet label="Ornate Separator" text="rotate-45 bg-nobel-gold border-2 border-white" fullWidth />
            </div>
          </div>
        </section>

        {/* --- COMPREHENSIVE COLOR PALETTE SECTION --- */}
        <section id="colors" className="mb-32">
            <SectionHeader icon={Palette} title="Official Color Palette" subtitle="The chromatic standard for the intellectual vanguard." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

        {/* RE-RENDERED CORE SECTIONS FOR CONTINUITY */}
        {/* The Rulesets Section */}
        <section className="mb-32">
            <SectionHeader icon={ShieldCheck} title="The Aluta Protocol" subtitle="Core architectural constraints for all UI components." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="p-8 bg-white border border-slate-200">
                    <h4 className="font-serif text-2xl text-ui-blue mb-4 italic">Geometric Severity</h4>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">Zero border-radius. Every component must be sharp. Curves are reserved exclusively for brand-related iconography.</p>
                    <CopySnippet label="Tailwind Configuration" text="theme: { borderRadius: { none: '0px' } }" />
                </div>
                <div className="p-8 bg-white border border-slate-200">
                    <h4 className="font-serif text-2xl text-ui-blue mb-4 italic">High Contrast</h4>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">Information must be stark. We favor #003366 against #FFFFFF, accented only by Nobel Gold for interactivity.</p>
                    <CopySnippet label="Primary Text Color" text="text-[#003366]" />
                </div>
                <div className="p-8 bg-white border border-slate-200">
                    <h4 className="font-serif text-2xl text-ui-blue mb-4 italic">Informational Density</h4>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">Metadata is not secondary; it is foundational. Use small caps, wide tracking, and mono fonts for all technical labels.</p>
                    <CopySnippet label="Metadata Utility" text="text-[10px] font-bold uppercase tracking-[0.4em]" />
                </div>
            </div>
        </section>

        {/* Typography Section */}
        <section className="mb-32">
            <SectionHeader icon={Type} title="Typography" subtitle="The balance between academic tradition and modern clarity." />
            <div className="space-y-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-4">
                        <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-4">Serif Typeface</h4>
                        <div className="font-serif text-4xl text-ui-blue mb-4">Playfair Display</div>
                        <CopySnippet label="CSS Definition" text="font-family: 'Playfair Display', serif;" />
                    </div>
                    <div className="lg:col-span-8 space-y-4">
                        <div className="text-5xl font-serif text-ui-blue italic">"Knowledge is the fount of life."</div>
                        <div className="flex gap-4">
                            <span className="font-serif font-bold text-lg">Bold Heading</span>
                            <span className="font-serif italic text-lg">Italic Emphasis</span>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-4">
                        <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-4">Sans Typeface</h4>
                        <div className="font-sans text-2xl font-bold text-ui-blue mb-4">Inter</div>
                        <CopySnippet label="CSS Definition" text="font-family: 'Inter', sans-serif;" />
                    </div>
                    <div className="lg:col-span-8 space-y-4">
                        <div className="text-xl font-sans text-slate-600 leading-relaxed font-light">
                            Reliable, high-legibility rendering for body content, navigational elements, and technical data points.
                        </div>
                        <div className="text-xs font-bold uppercase tracking-[0.4em] text-slate-400">
                            CAPS WITH 0.4EM LETTER SPACING
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Buttons Section */}
        <section className="mb-32">
            <SectionHeader icon={Zap} title="Button Architecture" subtitle="Call to action patterns with visual priority levels." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                    <div className="p-12 bg-white border border-slate-100 flex items-center justify-center">
                        <button className="px-8 py-3 bg-ui-blue text-white rounded-none text-xs font-bold uppercase tracking-widest border border-ui-blue shadow-lg hover:bg-nobel-gold hover:border-nobel-gold transition-all">Primary Action</button>
                    </div>
                    <CopySnippet label="HTML / Tailwind" text="<button className='px-8 py-3 bg-ui-blue text-white rounded-none text-xs font-bold uppercase tracking-widest border border-ui-blue shadow-lg hover:bg-nobel-gold hover:border-nobel-gold transition-all'>Primary</button>" fullWidth />
                </div>

                <div className="space-y-6">
                    <div className="p-12 bg-slate-900 flex items-center justify-center">
                        <button className="px-8 py-3 bg-nobel-gold text-ui-blue rounded-none text-xs font-bold uppercase tracking-widest border border-nobel-gold hover:bg-white transition-all">Highlight Action</button>
                    </div>
                    <CopySnippet label="HTML / Tailwind" text="<button className='px-8 py-3 bg-nobel-gold text-ui-blue rounded-none text-xs font-bold uppercase tracking-widest border border-nobel-gold hover:bg-white transition-all'>Highlight</button>" fullWidth />
                </div>

                <div className="space-y-6">
                    <div className="p-12 bg-white border border-slate-100 flex items-center justify-center">
                        <button className="px-8 py-3 bg-white text-ui-blue rounded-none text-xs font-bold uppercase tracking-widest border border-slate-300 hover:border-nobel-gold transition-all">Ghost Action</button>
                    </div>
                    <CopySnippet label="HTML / Tailwind" text="<button className='px-8 py-3 bg-white text-ui-blue rounded-none text-xs font-bold uppercase tracking-widest border border-slate-300 hover:border-nobel-gold transition-all'>Ghost</button>" fullWidth />
                </div>
            </div>
        </section>

        {/* Card Archetypes Section */}
        <section className="mb-32">
            <SectionHeader icon={LayoutGrid} title="Card Archetypes" subtitle="Standardized layout patterns for varied content types." />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* The Executive Card */}
                <div className="space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">01. The Executive Module</h4>
                    <div className="bg-white p-8 border border-slate-200 group relative cursor-pointer shadow-sm">
                        <div className="absolute top-0 left-0 w-full h-1 bg-ui-blue transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-slate-50 flex items-center justify-center text-ui-blue group-hover:bg-ui-blue group-hover:text-white transition-colors">
                                <Shield size={24} />
                            </div>
                            <span className="text-[8px] font-mono font-bold text-slate-300 tracking-[0.2em]">VERIFIED RECORD</span>
                        </div>
                        <h3 className="font-serif text-3xl text-ui-blue mb-2 group-hover:text-nobel-gold transition-colors">Central Council</h3>
                        <p className="text-sm text-slate-500 font-light leading-relaxed mb-8">Official container for high-hierarchy governance data and verified personnel records.</p>
                        <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Constitutional Ref</span>
                            <ChevronRight size={16} className="text-slate-200 group-hover:text-nobel-gold group-hover:translate-x-1 transition-all" />
                        </div>
                    </div>
                    <CopySnippet label="Executive Card HTML" text="<div className='bg-white p-8 border border-slate-200 group relative shadow-sm'><div className='absolute top-0 left-0 w-full h-1 bg-ui-blue transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left'></div>...</div>" fullWidth />
                </div>

                {/* The Legacy Block */}
                <div className="space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">02. The Legacy Block</h4>
                    <div className="bg-slate-50 p-8 border-l-4 border-nobel-gold relative overflow-hidden group cursor-pointer h-full">
                        <div className="relative z-10">
                            <Award className="text-nobel-gold mb-6" size={32} />
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Hall of Fame / Alumni</h4>
                            <h3 className="font-serif text-4xl text-ui-blue mb-4 italic">Wole Soyinka</h3>
                            <p className="text-sm text-slate-600 font-light leading-relaxed italic">"The man dies in all who keep silent in the face of tyranny."</p>
                        </div>
                        <Fingerprint className="absolute -bottom-12 -right-12 text-slate-200 opacity-20 scale-150 group-hover:rotate-12 transition-transform duration-700" size={140} />
                    </div>
                    <CopySnippet label="Legacy Block HTML" text="<div className='bg-slate-50 p-8 border-l-4 border-nobel-gold relative overflow-hidden group'><div className='relative z-10'>...</div><Fingerprint className='absolute -bottom-12 -right-12 text-slate-200 opacity-20 scale-150'/></div>" fullWidth />
                </div>

                {/* The Data Matrix */}
                <div className="space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">03. Data Matrix Unit</h4>
                    <div className="bg-slate-900 p-8 text-white relative group cursor-pointer overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
                        <div className="flex justify-between items-start mb-10">
                            <Terminal size={20} className="text-nobel-gold" />
                            <div className="text-right">
                                <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Sys_Entry_V01</div>
                                <div className="text-[10px] font-mono text-nobel-gold font-bold">LIVE_STREAM</div>
                            </div>
                        </div>
                        <div className="mb-8">
                            <div className="text-[8px] font-bold uppercase tracking-[0.4em] text-slate-500 mb-2">Cumulative Student Force</div>
                            <div className="font-mono text-5xl font-bold text-white tabular-nums tracking-tighter">35,482.00</div>
                        </div>
                        <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                            <span className="text-[8px] font-mono text-slate-400">ENCRYPTED_DATABASE_ACCESS</span>
                            <div className="flex gap-1">
                                {[1,2,3,4].map(i => <div key={i} className="w-1 h-1 bg-nobel-gold animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>)}
                            </div>
                        </div>
                    </div>
                    <CopySnippet label="Data Matrix HTML" text="<div className='bg-slate-900 p-8 text-white relative group overflow-hidden'><div className='absolute inset-0 bg-[noise.svg] opacity-10'></div>...</div>" fullWidth />
                </div>

                {/* Information Slate */}
                <div className="space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">04. The Information Slate</h4>
                    <div className="bg-white p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-ui-blue/5 text-ui-blue">
                                <Info size={20} />
                            </div>
                            <h5 className="font-bold text-xs uppercase tracking-[0.3em] text-ui-blue">Legislative Notice</h5>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed font-light mb-6">This container is optimized for announcements, constitutional updates, and general notices that require high readability.</p>
                        <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-nobel-gold hover:text-ui-blue transition-colors">
                            READ FULL DISPATCH <ArrowRight size={12} />
                        </button>
                    </div>
                    <CopySnippet label="Info Slate HTML" text="<div className='bg-white p-8 border border-slate-200 shadow-sm'><div className='flex items-center gap-4 mb-6'>...</div></div>" fullWidth />
                </div>
            </div>
        </section>

        {/* Iconography System */}
        <section className="mb-32">
            <SectionHeader icon={Terminal} title="Iconography System" subtitle="Our visual symbols are derived from the Lucide system, curated for authority and clarity." />
            <div className="bg-white border border-slate-200 p-8 md:p-12">
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-8">
                    {[
                        { icon: Shield, name: 'Shield' },
                        { icon: Gavel, name: 'Gavel' },
                        { icon: Landmark, name: 'Landmark' },
                        { icon: Star, name: 'Star' },
                        { icon: Award, name: 'Award' },
                        { icon: Fingerprint, name: 'Fingerprint' },
                        { icon: Terminal, name: 'Terminal' },
                        { icon: User, name: 'User' },
                        { icon: Book, name: 'Book' },
                        { icon: Scale, name: 'Scale' },
                        { icon: Coins, name: 'Coins' },
                        { icon: Trophy, name: 'Trophy' },
                        { icon: Mic, name: 'Mic' },
                        { icon: Bell, name: 'Bell' },
                        { icon: Search, name: 'Search' },
                        { icon: LayoutGrid, name: 'Grid' },
                        { icon: AlertTriangle, name: 'Alert' },
                        { icon: CheckCircle2, name: 'Success' },
                        { icon: XCircle, name: 'Error' },
                        { icon: MoreHorizontal, name: 'More' },
                        { icon: Home, name: 'Home' },
                        { icon: MessageSquare, name: 'Chat' },
                        { icon: Archive, name: 'Archive' },
                        { icon: ShieldAlert, name: 'Restricted' },
                    ].map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-3 group cursor-pointer" onClick={() => navigator.clipboard.writeText(`<${item.name} size={24} />`)}>
                            <div className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-ui-blue group-hover:text-white transition-all">
                                <item.icon size={20} />
                            </div>
                            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-300 group-hover:text-slate-900 transition-colors">{item.name}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Icon Usage: Size 20px - 24px | Stroke 2 | Color: UI Blue / Nobel Gold</p>
                    <CopySnippet label="Icon Component" text="<Icon size={20} className='text-ui-blue' />" />
                </div>
            </div>
        </section>

        {/* Footer Accent */}
        <div className="mt-32 pt-16 border-t border-slate-200 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-nobel-gold/5 blur-3xl rounded-full"></div>
            <Star size={40} className="mx-auto text-nobel-gold/20 mb-6" />
            <p className="text-[10px] font-bold uppercase tracking-[1em] text-slate-300 relative z-10">Intellectualism & Welfare Protocol</p>
        </div>
      </div>
    </div>
  );
};

interface ColorSwatchProps {
    name: string;
    hex: string;
    usage: string;
    variants?: { name: string; hex: string }[];
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ name, hex, usage, variants }) => (
    <div className="bg-white border border-slate-200 p-6 flex flex-col gap-4 shadow-sm group hover:border-nobel-gold transition-colors">
        <div
            className="w-full h-32 border border-slate-100 group-hover:scale-[1.02] transition-transform shadow-inner relative overflow-hidden"
            style={{ backgroundColor: hex }}
        >
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
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
                                 className="w-full h-6 border border-slate-100 cursor-pointer hover:scale-105 transition-transform"
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

export default StyleGuidePage;
