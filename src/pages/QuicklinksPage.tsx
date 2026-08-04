import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Link2, Plus, Search, Star, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Quicklink {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  sort_order: number;
  is_featured: boolean;
  is_published: boolean;
}

const emptyForm = {
  title: '',
  url: '',
  description: '',
  category: 'General',
  is_featured: false,
};

const QuicklinksPage: React.FC = () => {
  const { isStaff } = useAdminCheck();
  const [links, setLinks] = useState<Quicklink[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from('quicklinks')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) {
      toast.error('Could not load quicklinks');
    } else {
      setLinks((data as Quicklink[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchLinks();
  }, []);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(links.map((l) => l.category)))],
    [links]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return links.filter((l) => {
      const matchesCat = activeCategory === 'All' || l.category === activeCategory;
      const matchesQuery =
        !q ||
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.url.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [links, query, activeCategory]);

  const grouped = useMemo(() => {
    const map = new Map<string, Quicklink[]>();
    filtered.forEach((l) => {
      map.set(l.category, [...(map.get(l.category) || []), l]);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const handleSave = async () => {
    if (!form.title.trim() || !form.url.trim()) {
      toast.error('Title and URL are required');
      return;
    }
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from('quicklinks').insert({
      title: form.title.trim(),
      url: form.url.trim(),
      description: form.description.trim(),
      category: form.category.trim() || 'General',
      is_featured: form.is_featured,
      sort_order: links.length + 1,
      created_by: userData?.user?.id ?? null,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Link added');
    setForm(emptyForm);
    setOpen(false);
    void fetchLinks();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('quicklinks').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setLinks((prev) => prev.filter((l) => l.id !== id));
    toast.success('Link removed');
  };

  const isInternal = (url: string) => url.startsWith('/');

  return (
    <div className="min-h-screen bg-background mt-[72px] md:mt-[88px]">
      <SEO
        title="Quicklinks — Essential University of Ibadan Links for Students"
        description="A curated directory of 40+ useful University of Ibadan links: student portal, LMS, Kenneth Dike Library, faculties, bursary, NYSC, JAMB, scholarships and more."
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Quicklinks', url: '/quicklinks' },
        ]}
      />

      {/* Hero */}
      <section className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-6 py-14 md:py-20">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                <Link2 size={14} /> Directory
              </span>
              <h1 className="mt-4 font-serif text-4xl leading-tight text-primary md:text-6xl">
                Quicklinks
              </h1>
              <p className="mt-4 text-base text-muted-foreground md:text-lg">
                Every link a University of Ibadan student actually needs — portals, faculties,
                libraries, scholarships and national services, in one place.
              </p>
            </div>

            {isStaff && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus size={16} /> Add link
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">Add a quicklink</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="ql-title">Title</Label>
                      <Input
                        id="ql-title"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="UI Student Portal"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ql-url">URL</Label>
                      <Input
                        id="ql-url"
                        value={form.url}
                        onChange={(e) => setForm({ ...form, url: e.target.value })}
                        placeholder="https://… or /resources/…"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ql-desc">Description</Label>
                      <Textarea
                        id="ql-desc"
                        rows={3}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="What is this link for?"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ql-cat">Category</Label>
                      <Input
                        id="ql-cat"
                        list="ql-categories"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                      />
                      <datalist id="ql-categories">
                        {categories
                          .filter((c) => c !== 'All')
                          .map((c) => (
                            <option key={c} value={c} />
                          ))}
                      </datalist>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={form.is_featured}
                        onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                        className="h-4 w-4 rounded border-border"
                      />
                      Mark as featured
                    </label>
                    <Button onClick={handleSave} disabled={saving} className="w-full">
                      {saving ? <Loader2 className="animate-spin" size={16} /> : 'Save link'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Search + categories */}
          <div className="mt-10 space-y-5">
            <div className="relative max-w-md">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search links…"
                className="h-12 rounded-2xl pl-11"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    activeCategory === c
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Links */}
      <section className="container mx-auto px-6 py-14">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">No links match your search.</p>
        ) : (
          <div className="space-y-14">
            {grouped.map(([category, items]) => (
              <div key={category}>
                <div className="mb-6 flex items-center gap-4">
                  <h2 className="font-serif text-2xl text-primary">{category}</h2>
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {items.length}
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((link, i) => {
                    const inner = (
                      <>
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-serif text-lg leading-snug text-foreground group-hover:text-primary">
                            {link.title}
                          </h3>
                          <ArrowUpRight
                            size={18}
                            className="shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                          />
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {link.description}
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                          {link.is_featured && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
                              <Star size={10} /> Popular
                            </span>
                          )}
                          <span className="truncate text-[11px] text-muted-foreground/70">
                            {link.url.replace(/^https?:\/\//, '')}
                          </span>
                        </div>
                      </>
                    );

                    return (
                      <motion.div
                        key={link.id}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                        className="relative"
                      >
                        {isInternal(link.url) ? (
                          <Link
                            to={link.url}
                            className="group block h-full rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-sm"
                          >
                            {inner}
                          </Link>
                        ) : (
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block h-full rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-sm"
                          >
                            {inner}
                          </a>
                        )}
                        {isStaff && (
                          <button
                            onClick={() => handleDelete(link.id)}
                            aria-label={`Delete ${link.title}`}
                            className="absolute -right-2 -top-2 rounded-full border border-border bg-background p-1.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive focus:opacity-100 group-hover:opacity-100 md:opacity-0"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default QuicklinksPage;
