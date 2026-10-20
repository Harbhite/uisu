import React, { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  Archive, ArrowLeft, ArrowRight, ArrowUpRight, AudioLines,
  BookOpen, Camera, Clock3, FileText, Hash, Landmark, Map,
  Mic2, Pin, Search, Sparkles, Users, Volume2, Home,
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

const channelName = (k: string) => k.toLowerCase().replace(/\s+/g, '-');
const recordId = (i: number) => `UISU-ARC-${String(i + 1).padStart(3, '0')}`;
const presentKinds = kinds.filter((k) => archiveRecords.some((r) => r.kind === k));

/* ---------- Shared pieces ---------- */

const ServerRail = ({ active }: { active?: 'archives' }) => (
  <aside className="hidden w-[72px] shrink-0 flex-col items-center gap-2 bg-primary py-3 md:flex" aria-label="Sections">
    <Link to="/" aria-label="Home" className="group relative flex h-12 w-12 items-center justify-center rounded-3xl bg-primary-foreground/10 text-primary-foreground transition-all duration-200 hover:rounded-2xl hover:bg-accent hover:text-primary">
      <Home size={20} />
    </Link>
    <div className="my-1 h-0.5 w-8 rounded-full bg-primary-foreground/15" />
    {[
      { to: '/archives', icon: Archive, label: 'Archives', on: active === 'archives' },
      { to: '/history', icon: Clock3, label: 'History' },
      { to: '/documents', icon: FileText, label: 'Documents' },
      { to: '/inks-vault', icon: BookOpen, label: 'Inks Vault' },
      { to: '/constitution', icon: Landmark, label: 'Constitution' },
    ].map(({ to, icon: Icon, label, on }) => (
      <Link key={to} to={to} aria-label={label} title={label} className="group relative flex items-center">
        <span className={`absolute -left-3 w-1 rounded-r-full bg-primary-foreground transition-all ${on ? 'h-10' : 'h-0 group-hover:h-5'}`} />
        <span className={`flex h-12 w-12 items-center justify-center transition-all duration-200 ${on ? 'rounded-2xl bg-accent text-primary' : 'rounded-3xl bg-primary-foreground/10 text-primary-foreground group-hover:rounded-2xl group-hover:bg-accent group-hover:text-primary'}`}>
          <Icon size={20} />
        </span>
      </Link>
    ))}
  </aside>
);

const ImageCredit = ({ image }: { image: NonNullable<ArchiveRecord['image']> }) => (
  <p className="mt-1.5 flex flex-wrap gap-x-3 text-[10px] text-muted-foreground">
    <a href={image.sourceUrl} target="_blank" rel="noreferrer" className="hover:text-primary hover:underline">Photo: {image.credit}</a>
    <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer" className="hover:text-primary hover:underline">CC BY-SA 4.0</a>
  </p>
);

const KindAvatar = ({ kind, size = 40 }: { kind: ArchiveKind; size?: number }) => {
  const Icon = kindIcons[kind];
  return (
    <span className="flex shrink-0 items-center justify-center rounded-full bg-primary text-accent" style={{ width: size, height: size }}>
      <Icon size={size * 0.45} />
    </span>
  );
};

/* Discord-style "message" for a record */
const RecordMessage = ({ record, index }: { record: ArchiveRecord; index: number }) => (
  <article className="group flex gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted/60 md:gap-4 md:px-4">
    <KindAvatar kind={record.kind} />
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className="text-sm font-semibold text-primary">Archive Desk</span>
        <span className="rounded bg-accent/20 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-primary">{record.kind}</span>
        <span className="text-[11px] text-muted-foreground">{record.period} · {recordId(index)}</span>
      </div>
      <Link to={`/archives/${record.slug}`} className="mt-2 block max-w-xl overflow-hidden rounded-lg border-l-4 border-accent bg-card shadow-sm ring-1 ring-border transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className="p-4">
          <h3 className="flex items-start justify-between gap-3 font-serif text-xl leading-snug text-primary">
            {record.title}
            <ArrowUpRight size={16} className="mt-1 shrink-0 text-accent opacity-0 transition-opacity group-hover:opacity-100" />
          </h3>
          <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{record.summary}</p>
        </div>
        {record.image && <img src={record.image.src} alt={record.image.alt} loading="lazy" className="aspect-[16/9] w-full object-cover" />}
      </Link>
      {record.image && <ImageCredit image={record.image} />}
    </div>
  </article>
);

/* ---------- Index page ---------- */

export const ArchivesPage = () => {
  const [activeKind, setActiveKind] = useState<ArchiveKind | 'All records'>('All records');
  const [query, setQuery] = useState('');
  const visibleRecords = useMemo(() => archiveRecords.filter((record) => {
    const matchesKind = activeKind === 'All records' || record.kind === activeKind;
    const searchText = `${record.title} ${record.summary} ${record.kind} ${record.period}`.toLowerCase();
    return matchesKind && searchText.includes(query.trim().toLowerCase());
  }), [activeKind, query]);
  const pinned = [archiveRecords[1], archiveRecords[2]].filter(Boolean);
  const channels = ['All records', ...presentKinds] as const;
  const countFor = (k: string) => (k === 'All records' ? archiveRecords.length : archiveRecords.filter((r) => r.kind === k).length);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <SEO
        title="Archives | UISU Digital Memory"
        description="Explore articles, image galleries, timelines, document guides and digital exhibits from the University of Ibadan Students’ Union."
        image="/archive/tekena-tamuno-building.jpg"
        url="/archives"
        breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Archives', url: '/archives' }]}
      />
      <ServerRail active="archives" />

      {/* Channel sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-muted/40 lg:flex">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4 shadow-sm">
          <Archive size={16} className="text-accent" />
          <span className="font-serif text-base text-primary">UISU Archives</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <p className="px-2 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Collections</p>
          {channels.map((k) => {
            const on = activeKind === k;
            return (
              <button key={k} type="button" onClick={() => setActiveKind(k)} aria-pressed={on}
                className={`group flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${on ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                <Hash size={16} className="shrink-0 opacity-60" />
                <span className="flex-1 truncate">{channelName(k)}</span>
                <span className={`rounded-full px-1.5 text-[10px] font-bold ${on ? 'bg-accent text-primary' : 'bg-muted text-muted-foreground'}`}>{countFor(k)}</span>
              </button>
            );
          })}
          <p className="px-2 pb-1 pt-5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reading rooms</p>
          {[{ to: '/documents', l: 'documents' }, { to: '/history', l: 'union-history' }, { to: '/feedback', l: 'contribute' }].map((c) => (
            <Link key={c.to} to={c.to} className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
              <Volume2 size={15} className="opacity-60" /> {c.l}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2 border-t border-border bg-muted/70 p-3">
          <span className="relative">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">UI</span>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-accent" />
          </span>
          <div className="leading-tight">
            <p className="text-xs font-semibold">Visitor</p>
            <p className="text-[10px] text-muted-foreground">Browsing the record</p>
          </div>
        </div>
      </aside>

      {/* Main chat-like column */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-3 backdrop-blur md:px-5">
          <Link to="/" className="md:hidden" aria-label="Home"><ArrowLeft size={18} className="text-muted-foreground" /></Link>
          <Hash size={20} className="shrink-0 text-muted-foreground" />
          <h1 className="truncate text-base font-semibold text-primary">{channelName(activeKind)}</h1>
          <span className="hidden h-5 w-px bg-border sm:block" />
          <p className="hidden truncate text-xs text-muted-foreground sm:block">A living record of student life at the University of Ibadan</p>
          <label className="ml-auto flex w-36 items-center gap-2 rounded-md bg-muted px-2 py-1.5 focus-within:ring-2 focus-within:ring-accent sm:w-56">
            <span className="sr-only">Search archive</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground" />
            <Search size={14} className="text-muted-foreground" />
          </label>
        </header>

        {/* Mobile channel chips */}
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-b border-border px-3 py-2 lg:hidden">
          {channels.map((k) => (
            <button key={k} type="button" onClick={() => setActiveKind(k)} aria-pressed={activeKind === k}
              className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs transition-colors ${activeKind === k ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              <Hash size={12} /> {channelName(k)}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Welcome banner */}
          <section className="px-4 pb-4 pt-8 md:px-8">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-accent"><Archive size={30} /></span>
            <h2 className="mt-4 font-serif text-3xl text-primary md:text-5xl">Welcome to #{channelName(activeKind)}</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Articles, image collections, document guides and digital exhibits from the UISU — {archiveRecords.length} exhibits across {presentKinds.length} formats.
            </p>
          </section>

          {activeKind === 'All records' && !query && (
            <section className="mx-4 mb-4 rounded-xl border border-accent/40 bg-accent/10 p-3 md:mx-8">
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary"><Pin size={12} className="text-accent" /> Pinned exhibits</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {pinned.map((r) => (
                  <Link key={r.slug} to={`/archives/${r.slug}`} className="group flex items-center gap-3 rounded-lg bg-card p-2 ring-1 ring-border transition hover:ring-accent">
                    {r.image ? <img src={r.image.src} alt={r.image.alt} className="h-14 w-20 rounded-md object-cover" /> : <KindAvatar kind={r.kind} size={56} />}
                    <div className="min-w-0">
                      <p className="truncate font-serif text-base text-primary group-hover:underline">{r.title}</p>
                      <p className="text-[11px] text-muted-foreground">{r.kind} · {r.period}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="relative mx-4 my-3 flex items-center md:mx-8">
            <span className="h-px flex-1 bg-border" />
            <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{visibleRecords.length} of {archiveRecords.length} records</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="px-1 pb-10 md:px-4">
            {visibleRecords.length ? visibleRecords.map((r) => (
              <RecordMessage key={r.slug} record={r} index={archiveRecords.indexOf(r)} />
            )) : (
              <div className="mx-3 rounded-xl border border-dashed border-border py-14 text-center">
                <Search size={22} className="mx-auto text-muted-foreground" />
                <p className="mt-3 font-serif text-xl">No records found</p>
                <button type="button" onClick={() => { setQuery(''); setActiveKind('All records'); }} className="mt-3 text-xs font-semibold text-primary underline">Reset filters</button>
              </div>
            )}
          </div>

          {/* Composer-style CTA */}
          <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent px-4 pb-4 pt-6 md:px-8">
            <Link to="/feedback" className="flex items-center gap-3 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground ring-1 ring-border transition hover:ring-accent">
              <Sparkles size={16} className="text-accent" />
              <span className="flex-1 truncate">Have a story or source to share? Suggest a contribution…</span>
              <ArrowUpRight size={16} className="text-primary" />
            </Link>
          </div>
        </div>
      </main>

      {/* Member-list style sidebar */}
      <aside className="hidden w-60 shrink-0 border-l border-border bg-muted/40 p-4 xl:block">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Formats — {presentKinds.length}</p>
        <ul className="mt-2 space-y-1">
          {presentKinds.map((k) => (
            <li key={k}>
              <button type="button" onClick={() => setActiveKind(k)} className="flex w-full items-center gap-2.5 rounded-md p-1.5 text-left hover:bg-muted">
                <span className="relative"><KindAvatar kind={k} size={32} /><span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-accent" /></span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{k}</span>
                  <span className="block text-[10px] text-muted-foreground">{countFor(k)} records</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
};

/* ---------- Exhibit page ---------- */

export const ArchiveExhibitPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const record = archiveRecords.find((item) => item.slug === slug);
  if (!record) return <Navigate to="/archives" replace />;

  const recordIndex = archiveRecords.findIndex((item) => item.slug === record.slug);
  const previous = archiveRecords[(recordIndex - 1 + archiveRecords.length) % archiveRecords.length];
  const next = archiveRecords[(recordIndex + 1) % archiveRecords.length];
  const siblings = archiveRecords.filter((r) => r.kind === record.kind);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <SEO
        title={`${record.title} | UISU Archives`}
        description={record.summary}
        image={record.image?.src || '/og/pages-screenshot/history.png'}
        url={`/archives/${record.slug}`}
        type="article"
        author="UISU Archives Editorial Desk"
        breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Archives', url: '/archives' }, { name: record.title, url: `/archives/${record.slug}` }]}
      />
      <ServerRail active="archives" />

      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-muted/40 lg:flex">
        <Link to="/archives" className="flex h-14 items-center gap-2 border-b border-border px-4 shadow-sm hover:bg-muted">
          <ArrowLeft size={15} className="text-muted-foreground" />
          <span className="font-serif text-base text-primary">UISU Archives</span>
        </Link>
        <div className="flex-1 overflow-y-auto p-2">
          <p className="px-2 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">#{channelName(record.kind)}</p>
          {siblings.map((r) => {
            const on = r.slug === record.slug;
            return (
              <Link key={r.slug} to={`/archives/${r.slug}`} className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm ${on ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                <Hash size={15} className="shrink-0 opacity-60" /><span className="truncate">{channelName(r.title).slice(0, 28)}</span>
              </Link>
            );
          })}
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-3 backdrop-blur md:px-5">
          <Link to="/archives" aria-label="All exhibits"><ArrowLeft size={18} className="text-muted-foreground hover:text-primary" /></Link>
          <Hash size={20} className="shrink-0 text-muted-foreground" />
          <span className="truncate text-base font-semibold text-primary">{channelName(record.kind)}</span>
          <span className="ml-auto rounded bg-muted px-2 py-1 font-mono text-[10px] text-muted-foreground">{recordId(recordIndex)}</span>
        </header>

        <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 md:px-8">
          <div className="flex gap-3 md:gap-4">
            <KindAvatar kind={record.kind} size={48} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-sm font-semibold text-primary">Archive Desk</span>
                <span className="rounded bg-accent/20 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-primary">Editorial</span>
                <span className="text-[11px] text-muted-foreground">{record.period}</span>
              </div>
              <h1 className="mt-2 font-serif text-4xl leading-tight text-primary md:text-6xl">{record.title}</h1>
              <p className="mt-3 font-serif text-lg leading-relaxed text-muted-foreground md:text-xl">{record.summary}</p>

              <div className="mt-6">
                {record.gallery?.length ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {record.gallery.map((image) => (
                      <figure key={image.sourceUrl} className="overflow-hidden rounded-xl ring-1 ring-border">
                        <img src={image.src} alt={image.alt} loading="lazy" className="aspect-[1.4/1] w-full object-cover" />
                        <figcaption className="bg-card px-3 py-1.5"><ImageCredit image={image} /></figcaption>
                      </figure>
                    ))}
                  </div>
                ) : record.image ? (
                  <figure>
                    <img src={record.image.src} alt={record.image.alt} className="max-h-[520px] w-full rounded-xl object-cover ring-1 ring-border" />
                    <ImageCredit image={record.image} />
                  </figure>
                ) : null}
              </div>

              <div className="mt-8 space-y-3">
                {record.paragraphs.map((p) => (
                  <section key={p.heading} className="rounded-xl border-l-4 border-accent bg-card p-4 ring-1 ring-border md:p-5">
                    <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary"><Hash size={13} className="text-accent" />{p.heading}</h2>
                    <p className="mt-2 text-sm leading-[1.85] text-foreground/80">{p.text}</p>
                  </section>
                ))}
              </div>

              {record.sourceNote && <p className="mt-6 rounded-lg bg-muted p-3 text-xs text-muted-foreground"><Sparkles size={12} className="mr-1 inline text-accent" />{record.sourceNote}</p>}
              {record.relatedPath && (record.relatedPath.startsWith('http') ? (
                <a href={record.relatedPath} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-accent hover:text-primary">{record.relatedLabel || 'Open source'} <ArrowUpRight size={14} /></a>
              ) : (
                <Link to={record.relatedPath} className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-accent hover:text-primary">{record.relatedLabel || 'Open related collection'} <ArrowUpRight size={14} /></Link>
              ))}
            </div>
          </div>

          <nav className="mt-12 grid gap-3 sm:grid-cols-2" aria-label="Browse neighboring exhibits">
            <Link to={`/archives/${previous.slug}`} className="group rounded-xl bg-muted/60 p-4 ring-1 ring-border transition hover:ring-accent">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"><ArrowLeft size={12} /> Previous</span>
              <span className="mt-1 block font-serif text-lg text-primary group-hover:underline">{previous.title}</span>
            </Link>
            <Link to={`/archives/${next.slug}`} className="group rounded-xl bg-muted/60 p-4 text-right ring-1 ring-border transition hover:ring-accent">
              <span className="flex items-center justify-end gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Next <ArrowRight size={12} /></span>
              <span className="mt-1 block font-serif text-lg text-primary group-hover:underline">{next.title}</span>
            </Link>
          </nav>
        </div>
      </main>

      <aside className="hidden w-64 shrink-0 border-l border-border bg-muted/40 p-4 xl:block">
        <div className="overflow-hidden rounded-xl bg-card ring-1 ring-border">
          <div className="h-16 bg-primary" />
          <div className="-mt-7 px-4 pb-4">
            <span className="inline-block rounded-full ring-4 ring-card"><KindAvatar kind={record.kind} size={56} /></span>
            <p className="mt-2 font-serif text-lg text-primary">Record card</p>
            <dl className="mt-3 space-y-2 border-t border-border pt-3 text-xs">
              <div><dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Format</dt><dd>{record.kind}</dd></div>
              <div><dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Period</dt><dd>{record.period}</dd></div>
              <div><dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Record ID</dt><dd className="font-mono">{recordId(recordIndex)}</dd></div>
            </dl>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default ArchivesPage;
