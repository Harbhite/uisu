import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft, Users, FileText, Calendar, BookOpen, Building2, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'leader' | 'document' | 'event' | 'ink' | 'community';
  url: string;
}

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Popular search suggestions based on common queries
  const popularSearches = [
    'SUG President',
    'Constitution',
    'Elections',
    'NUESA',
    'Senate',
    'Budget Report',
    'MCAN',
    'Hall of Residence'
  ];
  
  const [results, setResults] = useState<{
    leaders: SearchResult[];
    documents: SearchResult[];
    events: SearchResult[];
    inks: SearchResult[];
    communities: SearchResult[];
  }>({
    leaders: [],
    documents: [],
    events: [],
    inks: [],
    communities: []
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query) {
        setSearchParams({ q: query });
      } else {
        setSearchParams({});
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, setSearchParams]);

  // Perform search
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults({ leaders: [], documents: [], events: [], inks: [], communities: [] });
        return;
      }

      setLoading(true);
      const searchTerm = `%${debouncedQuery}%`;

      try {
        const [leadersRes, documentsRes, eventsRes, inksRes, communitiesRes] = await Promise.all([
          supabase
            .from('leaders')
            .select('id, name, role, category')
            .or(`name.ilike.${searchTerm},role.ilike.${searchTerm}`)
            .eq('is_active', true)
            .limit(10),
          supabase
            .from('documents')
            .select('id, title, doc_type, year')
            .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
            .limit(10),
          supabase
            .from('events')
            .select('id, title, event_date, event_type')
            .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
            .limit(10),
          supabase
            .from('ink_pieces')
            .select('id, title, author_name, type')
            .eq('is_published', true)
            .or(`title.ilike.${searchTerm},author_name.ilike.${searchTerm}`)
            .limit(10),
          supabase
            .from('clubs')
            .select('id, name, acronym, category')
            .or(`name.ilike.${searchTerm},acronym.ilike.${searchTerm}`)
            .limit(10)
        ]);

        setResults({
          leaders: (leadersRes.data || []).map(l => ({
            id: l.id,
            title: l.name,
            subtitle: `${l.role} • ${l.category}`,
            type: 'leader',
            url: `/current-leaders/${l.id}`
          })),
          documents: (documentsRes.data || []).map(d => ({
            id: d.id,
            title: d.title,
            subtitle: `${d.doc_type} • ${d.year}`,
            type: 'document',
            url: `/documents`
          })),
          events: (eventsRes.data || []).map(e => ({
            id: e.id,
            title: e.title,
            subtitle: `${e.event_type} • ${new Date(e.event_date).toLocaleDateString()}`,
            type: 'event',
            url: `/events`
          })),
          inks: (inksRes.data || []).map(i => ({
            id: i.id,
            title: i.title,
            subtitle: `${i.type} by ${i.author_name}`,
            type: 'ink',
            url: `/inks-vault/piece/${i.id}`
          })),
          communities: (communitiesRes.data || []).map(c => ({
            id: c.id,
            title: c.name,
            subtitle: `${c.acronym || ''} • ${c.category}`,
            type: 'community',
            url: `/communities`
          }))
        });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const allResults = useMemo(() => [
    ...results.leaders,
    ...results.documents,
    ...results.events,
    ...results.inks,
    ...results.communities
  ], [results]);

  const getFilteredResults = () => {
    switch (activeTab) {
      case 'leaders': return results.leaders;
      case 'documents': return results.documents;
      case 'events': return results.events;
      case 'inks': return results.inks;
      case 'communities': return results.communities;
      default: return allResults;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'leader': return Users;
      case 'document': return FileText;
      case 'event': return Calendar;
      case 'ink': return BookOpen;
      case 'community': return Building2;
      default: return FileText;
    }
  };

  const filteredResults = getFilteredResults();

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <SEO title="Search" description="Search across leaders, documents, events, and more." image="/og/pages-screenshot/search.png" />
      
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-accent transition-colors mb-8"
        >
          <div className="p-2 border border-border group-hover:border-accent transition-colors">
            <ArrowLeft size={14} />
          </div>
          <span>Back</span>
        </button>

        {/* Search Header */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-6">Search</h1>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder="Search leaders, documents, events, inks, communities..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(!e.target.value);
              }}
              onFocus={() => !query && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-12 pr-12 py-6 text-lg rounded-none border-border focus:border-accent"
              autoFocus
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setShowSuggestions(true);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            )}
            
            {/* Search Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && !query && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 bg-card border border-border border-t-0 shadow-lg z-50"
                >
                  <div className="p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Popular Searches</p>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            setQuery(suggestion);
                            setShowSuggestions(false);
                          }}
                          className="px-3 py-1.5 bg-muted text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Results Tabs */}
        {debouncedQuery && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-muted/50 p-1 mb-8 rounded-none h-auto flex-wrap">
              <TabsTrigger value="all" className="rounded-none py-2 px-4 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background">
                All ({allResults.length})
              </TabsTrigger>
              <TabsTrigger value="leaders" className="rounded-none py-2 px-4 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background">
                Leaders ({results.leaders.length})
              </TabsTrigger>
              <TabsTrigger value="documents" className="rounded-none py-2 px-4 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background">
                Documents ({results.documents.length})
              </TabsTrigger>
              <TabsTrigger value="events" className="rounded-none py-2 px-4 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background">
                Events ({results.events.length})
              </TabsTrigger>
              <TabsTrigger value="inks" className="rounded-none py-2 px-4 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background">
                Inks ({results.inks.length})
              </TabsTrigger>
              <TabsTrigger value="communities" className="rounded-none py-2 px-4 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background">
                Communities ({results.communities.length})
              </TabsTrigger>
            </TabsList>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : filteredResults.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                <AnimatePresence mode="popLayout">
                  {filteredResults.map((result, index) => {
                    const Icon = getIcon(result.type);
                    return (
                      <motion.button
                        key={`${result.type}-${result.id}`}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => navigate(result.url)}
                        className="w-full text-left p-4 bg-card border border-border hover:border-accent transition-all flex items-center gap-4 group"
                      >
                        <div className="w-10 h-10 bg-muted flex items-center justify-center shrink-0">
                          <Icon size={18} className="text-muted-foreground group-hover:text-accent transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-foreground group-hover:text-accent transition-colors truncate">
                            {result.title}
                          </h3>
                          {result.subtitle && (
                            <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                          )}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-1 bg-muted">
                          {result.type}
                        </span>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            ) : (
              <EmptyState
                icon={Search}
                title="No results found"
                description={`We couldn't find anything matching "${debouncedQuery}". Try a different search term.`}
              />
            )}
          </Tabs>
        )}

        {!debouncedQuery && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 mx-auto text-muted-foreground/30 mb-6" />
            <p className="text-muted-foreground">Start typing to search across the archive</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
