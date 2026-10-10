import React, { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  Archive, ArrowLeft, ArrowRight, ArrowUpRight, AudioLines,
  BookOpen, Camera, Clock3, FileText, Landmark, Map,
  Mic2, Search, Sparkles, Users,
  type LucideIcon,
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { archiveRecords } from '@/data/archiveRecords';
import type { ArchiveKind, ArchiveRecord } from '@/data/archiveRecords';

const kinds: ArchiveKind[] = [
  'Article', 'Document guide', 'Digital museum', 'Image gallery', 'Timeline',
  'Portrait gallery', 'Oral history', 'Sound archive', 'Map collection',
];

const kindIcons: Record<ArchiveKind, LucideIcon> = {
  Article: BookOpen,
  'Document guide': FileText,
  'Digital museum': Landmark,
  'Image gallery': Camera,
  Timeline: Clock3,
  'Portrait gallery': Users,
  'Oral history': Mic2,
  'Sound archive': AudioLines,
  'Map collection': Map,
};

const paletteByKind: Record<ArchiveKind, string> = {
  Article: 'from-[#e9e1d2] to-[#f5f1e8] text-[#17324e]',
  'Document guide': 'from-[#e3e8eb] to-[#f4f5f4] text-[#17324e]',
  'Digital museum': 'from-[#d8e1e1] to-[#f1f3ef] text-[#17324e]',
  'Image gallery': 'from-[#e9dfd0] to-[#f7f2e9] text-[#17324e]',
  Timeline: 'from-[#e7dec7] to-[#f4f0e4] text-[#17324e]',
  'Portrait gallery': 'from-[#e8e3d8] to-[#f5f2ec] text-[#17324e]',
  'Oral history': 'from-[#d9e0dc] to-[#f1f2ec] text-[#17324e]',
  'Sound archive': 'from-[#d8dfe8] to-[#f1f3f6] text-[#17324e]',
  'Map collection': 'from-[#e2e7d9] to-[#f2f3e9] text-[#17324e]',
};

const ArchiveNav = () => (
  <nav className="border-b border-slate-200/80 bg-[#f9f8f4]/95" aria-label="Archives navigation">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-10">
      <Link to="/archives" className="group flex shrink-0 items-center gap-3" aria-label="UISU Archives home">
        <span className="flex h-9 w-9 items-center justify-center bg-primary text-primary-foreground transition-colors group-hover:bg-accent group-hover:text-primary">
          <Archive size={17} />
        </span>
        <span className="leading-tight">
          <span className="block font-serif text-sm font-semibold text-slate-950">UISU Archives</span>
          <span className="mt-0.5 block font-mono text-[8px] uppercase tracking-[0.2em] text-slate-500">A living record</span>
        </span>
      </Link>
      <div className="hidden items-center gap-7 text-[11px] font-semibold text-slate-600 md:flex">
        <Link to="/history" className="hover:text-primary">History</Link>
        <Link to="/documents" className="hover:text-primary">Documents</Link>
        <Link to="/inks-vault" className="hover:text-primary">Inks Vault</Link>
        <Link to="/constitution" className="hover:text-primary">Constitution</Link>
      </div>
      <Link to="/documents" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-[10px] font-bold text-white transition-colors hover:bg-primary">
        Reading room <ArrowUpRight size={13} />
      </Link>
    </div>
  </nav>
);

const ArchiveFooter = () => (
  <footer className="border-t border-slate-200 bg-[#f9f8f4]">
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-xs text-slate-500 md:flex-row md:items-center md:justify-between md:px-10">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em]">University of Ibadan Students’ Union · Digital Archive</p>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        <Link to="/history" className="hover:text-primary">History</Link>
        <Link to="/documents" className="hover:text-primary">Documents</Link>
        <Link to="/feedback" className="hover:text-primary">Suggest a correction</Link>
      </div>
    </div>
  </footer>
);

const RecordArtwork = ({ record, compact = false }: { record: ArchiveRecord; compact?: boolean }) => {
  const Icon = kindIcons[record.kind];
  return (
    <div className={`relative isolate flex aspect-[1.45/1] flex-col justify-between overflow-hidden bg-gradient-to-br ${paletteByKind[record.kind]} ${compact ? 'p-4 md:p-5' : 'min-h-[290px] p-7 md:min-h-[390px] md:p-10'}`}>
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.16]" style={{ backgroundImage: 'linear-gradient(rgba(23,50,78,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(23,50,78,.2) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <div className="pointer-events-none absolute -right-10 -top-12 -z-10 h-48 w-48 rounded-full border border-current/20" />
      <div className="pointer-events-none absolute -right-2 -top-4 -z-10 h-32 w-32 rounded-full border border-current/20" />
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex items-center gap-2 border border-current/20 bg-white/30 px-2.5 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.16em]">
          <Icon size={12} /> {record.kind}
        </span>
        <span className="font-mono text-[9px] tracking-widest opacity-55">UISU / ARC</span>
      </div>
      <div className="max-w-xl">
        <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] opacity-65">{record.period}</p>
        <p className={`font-serif leading-[0.95] tracking-tight ${compact ? 'text-2xl md:text-3xl' : 'text-4xl md:text-6xl'}`}>{record.title}</p>
      </div>
    </div>
  );
};

const RecordVisual = ({ record, compact = false }: { record: ArchiveRecord; compact?: boolean }) => {
  if (!record.image) return <RecordArtwork record={record} compact={compact} />;
  return (
    <figure className="overflow-hidden bg-slate-100">
      <img
        src={record.image.src}
        alt={record.image.alt}
        className={`w-full object-cover ${compact ? 'aspect-[1.45/1]' : 'aspect-[1.45/1] min-h-[290px] md:min-h-[390px]'}`}
      />
      <figcaption className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 bg-white px-3 py-2 text-[9px] leading-relaxed text-slate-500 md:px-4">
        <a href={record.image.sourceUrl} target="_blank" rel="noreferrer" className="underline decoration-slate-300 underline-offset-2 hover:text-primary">
          Photo: {record.image.credit}
        </a>
        <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono uppercase tracking-wider hover:text-primary">
          CC BY-SA 4.0 <ArrowUpRight size={10} />
        </a>
      </figcaption>
    </figure>
  );
};

const ArchiveCard = ({ record, index }: { record: ArchiveRecord; index: number }) => {
  const Icon = kindIcons[record.kind];
  return (
    <article className={`group min-w-0 ${index === 0 ? 'md:col-span-2' : ''}`}>
      <Link to={`/archives/${record.slug}`} className="block overflow-hidden border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_18px_50px_rgba(15,23,42,0.09)]">
        <RecordVisual record={record} compact />
        <div className="px-4 pb-5 pt-4 md:px-5 md:pb-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.15em] text-primary"><Icon size={12} /> {record.kind}</span>
            <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-slate-400">{record.period}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-serif text-xl leading-snug text-slate-950 transition-colors group-hover:text-primary md:text-2xl">{record.title}</h3>
            <ArrowUpRight size={17} className="mt-1 shrink-0 text-slate-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
          </div>
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600">{record.summary}</p>
          {record.image && <p className="mt-3 border-t border-slate-100 pt-2 text-[8px] text-slate-400">Photo credit: {record.image.credit}</p>}
        </div>
      </Link>
    </article>
  );
};

export const ArchivesPage = () => {
  const [activeKind, setActiveKind] = useState<ArchiveKind | 'All records'>('All records');
  const [query, setQuery] = useState('');
  const visibleRecords = useMemo(() => archiveRecords.filter((record) => {
    const matchesKind = activeKind === 'All records' || record.kind === activeKind;
    const searchText = `${record.title} ${record.summary} ${record.kind} ${record.period}`.toLowerCase();
    return matchesKind && searchText.includes(query.trim().toLowerCase());
  }), [activeKind, query]);
  const featuredRecord = archiveRecords[1];
  const formatCount = new Set(archiveRecords.map((record) => record.kind)).size;

  return (
    <div className="min-h-screen bg-[#f9f8f4] text-slate-950">
      <SEO
        title="Archives | UISU Digital Memory"
        description="Explore articles, image galleries, timelines, document guides and digital exhibits from the University of Ibadan Students’ Union."
        image="/archive/tekena-tamuno-building.jpg"
        url="/archives"
        breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Archives', url: '/archives' }]}
      />
      <ArchiveNav />
      <main>
        <section className="mx-auto max-w-7xl px-5 pb-12 pt-16 md:px-10 md:pb-16 md:pt-24">
          <div className="grid gap-8 md:grid-cols-12 md:gap-6">
            <div className="md:col-span-3">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500">01 / The living archive</p>
              <p className="mt-3 max-w-[220px] text-xs leading-relaxed text-slate-500">Records, places and voices from the student experience.</p>
            </div>
            <div className="md:col-span-9">
              <h1 className="max-w-5xl font-serif text-[clamp(3.5rem,9vw,7.5rem)] leading-[0.89] tracking-[-0.055em] text-slate-950">Memory, <span className="italic text-primary">kept</span><br className="hidden md:block" /> in motion.</h1>
              <div className="mt-8 grid gap-6 border-t border-slate-300 pt-5 sm:grid-cols-2 sm:items-end">
                <p className="max-w-lg text-sm leading-relaxed text-slate-600">A growing digital reading room for the University of Ibadan Students’ Union: articles, image galleries, timelines, document guides and museum-style exhibits.</p>
                <div className="flex flex-wrap gap-x-6 gap-y-3 sm:justify-end">
                  <div><span className="block font-serif text-2xl text-slate-950">{archiveRecords.length}</span><span className="font-mono text-[8px] uppercase tracking-[0.16em] text-slate-500">Exhibits</span></div>
                  <div><span className="block font-serif text-2xl text-slate-950">{formatCount}</span><span className="font-mono text-[8px] uppercase tracking-[0.16em] text-slate-500">Formats</span></div>
                  <div><span className="block font-serif text-2xl text-slate-950">4</span><span className="font-mono text-[8px] uppercase tracking-[0.16em] text-slate-500">Era guides</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-16 md:px-10 md:pb-24">
          <div className="grid overflow-hidden border border-slate-200 bg-white md:grid-cols-12">
            <div className="flex flex-col justify-between bg-primary p-6 text-white md:col-span-4 md:p-9">
              <div>
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-accent">Featured exhibit / 01</span>
                <h2 className="mt-8 font-serif text-3xl leading-tight md:text-4xl">{featuredRecord.title}</h2>
                <p className="mt-4 text-xs leading-relaxed text-white/75">{featuredRecord.summary}</p>
              </div>
              <Link to={`/archives/${featuredRecord.slug}`} className="mt-8 inline-flex w-fit items-center gap-2 border-b border-accent pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-accent hover:text-white">
                Enter the exhibit <ArrowRight size={14} />
              </Link>
            </div>
            <div className="md:col-span-8">
              <RecordVisual record={featuredRecord} />
            </div>
          </div>
          <p className="mt-2 text-right font-mono text-[8px] uppercase tracking-[0.12em] text-slate-400">{featuredRecord.image?.credit} · <a href={featuredRecord.image?.sourceUrl} target="_blank" rel="noreferrer" className="underline">source & license</a></p>
        </section>

        <section id="collection" className="border-y border-slate-200 bg-white py-14 md:py-20">
          <div className="mx-auto max-w-7xl px-5 md:px-10">
            <div className="grid gap-6 md:grid-cols-12 md:items-end">
              <div className="md:col-span-5">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500">02 / Browse the collection</p>
                <h2 className="mt-3 font-serif text-4xl tracking-tight md:text-5xl">Find your way in.</h2>
              </div>
              <div className="md:col-span-7 md:flex md:justify-end">
                <label className="flex w-full max-w-md items-center gap-3 border-b border-slate-300 py-3 focus-within:border-primary">
                  <Search size={16} className="text-slate-400" />
                  <span className="sr-only">Search archive exhibits</span>
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles, eras, formats…" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
                  {query && <button type="button" onClick={() => setQuery('')} className="font-mono text-[9px] uppercase tracking-wider text-slate-500 hover:text-primary">Clear</button>}
                </label>
              </div>
            </div>

            <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Filter archive records by format">
              {(['All records', ...kinds] as const).map((kind) => {
                const isActive = activeKind === kind;
                const count = kind === 'All records' ? archiveRecords.length : archiveRecords.filter((record) => record.kind === kind).length;
                if (!count) return null;
                return (
                  <button key={kind} type="button" aria-pressed={isActive} onClick={() => setActiveKind(kind)} className={`shrink-0 rounded-full border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] transition-colors ${isActive ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary'}`}>
                    {kind} <span className={isActive ? 'ml-1 text-accent' : 'ml-1 text-slate-400'}>{String(count).padStart(2, '0')}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-9 flex items-center justify-between border-t border-slate-200 pt-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-slate-500">Showing {visibleRecords.length} of {archiveRecords.length} exhibits</p>
              <p className="hidden font-mono text-[8px] uppercase tracking-[0.15em] text-slate-400 sm:block">Select a record to open its exhibit page</p>
            </div>

            {visibleRecords.length > 0 ? (
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visibleRecords.map((record, index) => <ArchiveCard key={record.slug} record={record} index={index} />)}
              </div>
            ) : (
              <div className="mt-5 border border-dashed border-slate-300 bg-[#f9f8f4] px-5 py-16 text-center">
                <Search size={24} className="mx-auto text-slate-400" />
                <p className="mt-4 font-serif text-2xl">No records found</p>
                <p className="mt-2 text-sm text-slate-500">Try another word or choose a different format.</p>
                <button type="button" onClick={() => { setQuery(''); setActiveKind('All records'); }} className="mt-5 border-b border-primary pb-1 text-xs font-bold uppercase tracking-widest text-primary">Reset filters</button>
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-5 px-5 py-14 md:grid-cols-12 md:px-10 md:py-20">
          <div className="md:col-span-4">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500">03 / Add to the record</p>
            <h2 className="mt-3 font-serif text-3xl leading-tight">Have a story or source to share?</h2>
          </div>
          <div className="flex flex-col justify-between gap-5 border-t border-slate-300 pt-5 md:col-span-8 md:flex-row md:items-end">
            <p className="max-w-xl text-sm leading-relaxed text-slate-600">Help us make the archive more complete. Share context, dates and source details; personal accounts and recordings are published only with consent and review.</p>
            <Link to="/feedback" className="inline-flex shrink-0 items-center gap-2 border-b border-primary pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-primary hover:text-accent">Suggest a contribution <ArrowUpRight size={14} /></Link>
          </div>
        </section>
      </main>
      <ArchiveFooter />
    </div>
  );
};

export const ArchiveExhibitPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const record = archiveRecords.find((item) => item.slug === slug);
  if (!record) return <Navigate to="/archives" replace />;

  const Icon = kindIcons[record.kind];
  const recordIndex = archiveRecords.findIndex((item) => item.slug === record.slug);
  const previous = archiveRecords[(recordIndex - 1 + archiveRecords.length) % archiveRecords.length];
  const next = archiveRecords[(recordIndex + 1) % archiveRecords.length];

  return (
    <div className="min-h-screen bg-[#f9f8f4] text-slate-950">
      <SEO
        title={`${record.title} | UISU Archives`}
        description={record.summary}
        image={record.image?.src || '/og/pages-screenshot/history.png'}
        url={`/archives/${record.slug}`}
        type="article"
        author="UISU Archives Editorial Desk"
        breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Archives', url: '/archives' }, { name: record.title, url: `/archives/${record.slug}` }]}
      />
      <ArchiveNav />
      <main className="mx-auto max-w-7xl px-5 pb-16 pt-9 md:px-10 md:pb-24 md:pt-14">
        <Link to="/archives" className="inline-flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500 hover:text-primary"><ArrowLeft size={13} /> All exhibits</Link>
        <div className="mt-9 grid gap-8 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-3">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">UISU / ARC / {String(recordIndex + 1).padStart(2, '0')}</p>
            <div className="mt-5 inline-flex items-center gap-2 border border-slate-300 bg-white px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-primary"><Icon size={13} /> {record.kind}</div>
            <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.15em] text-slate-400">{record.period}</p>
          </div>
          <div className="md:col-span-9">
            <h1 className="max-w-5xl font-serif text-[clamp(2.8rem,7vw,6.5rem)] leading-[0.92] tracking-[-0.05em] text-slate-950">{record.title}</h1>
            <p className="mt-6 max-w-3xl font-serif text-xl leading-relaxed text-slate-600 md:text-2xl">{record.summary}</p>
          </div>
        </div>

        <div className="mt-10 grid gap-8 border-t border-slate-300 pt-7 md:mt-14 md:grid-cols-12 md:gap-6 md:pt-10">
          <div className="md:col-span-8">
            {record.gallery?.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {record.gallery.map((image) => (
                  <figure key={image.sourceUrl} className="overflow-hidden border border-slate-200 bg-white">
                    <img src={image.src} alt={image.alt} className="aspect-[1.4/1] w-full object-cover" />
                    <figcaption className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-2 text-[9px] leading-relaxed text-slate-500">
                      <a href={image.sourceUrl} target="_blank" rel="noreferrer" className="underline decoration-slate-300 underline-offset-2 hover:text-primary">Photo: {image.credit}</a>
                      <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer" className="font-mono uppercase tracking-wider hover:text-primary">CC BY-SA 4.0 ↗</a>
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <RecordVisual record={record} />
            )}
            {record.image && !record.gallery?.length && <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.12em] text-slate-400">{record.image.credit} · <a href={record.image.sourceUrl} target="_blank" rel="noreferrer" className="underline">Source file</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer" className="underline">License</a></p>}
            <div className="mt-10 space-y-9 md:mt-14">
              {record.paragraphs.map((paragraph, index) => (
                <section key={paragraph.heading} className="grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-[140px_1fr] sm:gap-8">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">{String(index + 1).padStart(2, '0')} / {paragraph.heading}</p>
                  <p className="max-w-2xl text-sm leading-[1.9] text-slate-700">{paragraph.text}</p>
                </section>
              ))}
            </div>
          </div>
          <aside className="md:col-span-4">
            <div className="border border-slate-200 bg-white p-5 md:sticky md:top-8 md:p-6">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Record card</p>
              <dl className="mt-5 divide-y divide-slate-100 border-y border-slate-100">
                <div className="flex justify-between gap-4 py-3"><dt className="text-xs text-slate-500">Format</dt><dd className="text-right text-xs font-semibold text-slate-800">{record.kind}</dd></div>
                <div className="flex justify-between gap-4 py-3"><dt className="text-xs text-slate-500">Period</dt><dd className="text-right text-xs font-semibold text-slate-800">{record.period}</dd></div>
                <div className="flex justify-between gap-4 py-3"><dt className="text-xs text-slate-500">Record ID</dt><dd className="font-mono text-xs text-slate-800">UISU-ARC-{String(recordIndex + 1).padStart(3, '0')}</dd></div>
              </dl>
              {record.sourceNote && <p className="mt-4 text-[11px] leading-relaxed text-slate-500">{record.sourceNote}</p>}
              {record.relatedPath && (
                record.relatedPath.startsWith('http') ? (
                  <a href={record.relatedPath} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-between gap-3 border border-slate-200 px-3 py-3 text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white">{record.relatedLabel || 'Open source'} <ArrowUpRight size={14} /></a>
                ) : (
                  <Link to={record.relatedPath} className="mt-5 inline-flex w-full items-center justify-between gap-3 border border-slate-200 px-3 py-3 text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white">{record.relatedLabel || 'Open related collection'} <ArrowUpRight size={14} /></Link>
                )
              )}
              <p className="mt-5 flex items-start gap-2 border-t border-slate-100 pt-4 text-[10px] leading-relaxed text-slate-400"><Sparkles size={13} className="mt-0.5 shrink-0 text-accent" /> Collection notes are guides. Dates and provenance are included where verified.</p>
            </div>
          </aside>
        </div>

        <nav className="mt-14 grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-2" aria-label="Browse neighboring exhibits">
          <Link to={`/archives/${previous.slug}`} className="group bg-white p-5 transition-colors hover:bg-[#f4f1e9] md:p-7">
            <span className="inline-flex items-center gap-2 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-slate-400"><ArrowLeft size={12} /> Previous exhibit</span>
            <span className="mt-3 block font-serif text-xl text-slate-900 group-hover:text-primary">{previous.title}</span>
          </Link>
          <Link to={`/archives/${next.slug}`} className="group bg-white p-5 text-left transition-colors hover:bg-[#f4f1e9] sm:text-right md:p-7">
            <span className="inline-flex items-center gap-2 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-slate-400">Next exhibit <ArrowRight size={12} /></span>
            <span className="mt-3 block font-serif text-xl text-slate-900 group-hover:text-primary">{next.title}</span>
          </Link>
        </nav>
      </main>
      <ArchiveFooter />
    </div>
  );
};

export default ArchivesPage;
