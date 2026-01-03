import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, PenTool, FileText, User, Mic, Book, Coffee, Feather, Newspaper, Quote, Plus, Loader2, Pencil, FileStack, Eye, Search, Clock, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SEO } from '@/components/SEO';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

interface InksPiece {
  id: string;
  type: 'Article' | 'Blog' | 'Report' | 'Essay' | 'Poetry' | 'Opinion' | 'Interview' | 'Fiction';
  title: string;
  author_name: string;
  author_role: string | null;
  created_at: string;
  summary: string | null;
  user_id: string | null;
  cover_image: string | null;
  is_published: boolean;
  content: any;
  tags: string[] | null;
  view_count: number;
}

// Calculate reading time from EditorJS content
const calculateReadingTime = (content: any): number => {
  if (!content || !content.blocks) return 1;
  
  let wordCount = 0;
  content.blocks.forEach((block: any) => {
    if (block.data?.text) {
      wordCount += block.data.text.split(/\s+/).filter((w: string) => w.length > 0).length;
    }
    if (block.data?.items) {
      block.data.items.forEach((item: any) => {
        const text = typeof item === 'string' ? item : item.content || '';
        wordCount += text.split(/\s+/).filter((w: string) => w.length > 0).length;
      });
    }
  });
  
  const wordsPerMinute = 200;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

const InksVaultPage = () => {
  const navigate = useNavigate();
  const { isStaff } = useAdminCheck();
  const [filter, setFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [pieces, setPieces] = useState<InksPiece[]>([]);
  const [drafts, setDrafts] = useState<InksPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('published');

  const categories = ['All', 'Article', 'Blog', 'Report', 'Essay', 'Poetry', 'Opinion', 'Interview', 'Fiction'];

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Fetch published pieces with content for reading time
      const { data: publishedData, error: publishedError } = await supabase
        .from('ink_pieces')
        .select('id, type, title, author_name, author_role, created_at, summary, user_id, cover_image, is_published, content, tags, view_count')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (!publishedError && publishedData) {
        setPieces(publishedData as InksPiece[]);
      }

      // Fetch user's drafts if logged in
      if (user) {
        const { data: draftData, error: draftError } = await supabase
          .from('ink_pieces')
          .select('id, type, title, author_name, author_role, created_at, summary, user_id, cover_image, is_published, content, tags, view_count')
          .eq('is_published', false)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!draftError && draftData) {
          setDrafts(draftData as InksPiece[]);
        }
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  // Filter by type and search query
  const filterPieces = (list: InksPiece[]) => {
    let filtered = filter === 'All' ? list : list.filter(p => p.type === filter);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.author_name.toLowerCase().includes(query) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    return filtered;
  };

  const filteredPieces = filterPieces(pieces);
  const filteredDrafts = filterPieces(drafts);

  const canEdit = (piece: InksPiece) => {
    return isStaff || (user && piece.user_id === user.id);
  };

  const renderEditButton = (piece: InksPiece) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/admin/inks-vault/edit/${piece.id}`);
      }}
      className="absolute top-2 right-2 p-2 bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background border border-border"
    >
      <Pencil size={14} className="text-foreground" />
    </button>
  );

  const renderMeta = (piece: InksPiece) => {
    const readingTime = calculateReadingTime(piece.content);
    return (
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase tracking-wider">
        <span className="flex items-center gap-1">
          <Clock size={10} />
          {readingTime} min read
        </span>
        {piece.view_count > 0 && (
          <span className="flex items-center gap-1">
            <Eye size={10} />
            {piece.view_count} views
          </span>
        )}
      </div>
    );
  };

  const AuthorLink = ({ piece, className = '' }: { piece: InksPiece; className?: string }) => {
    if (!piece.user_id) return <span className={className}>{piece.author_name}</span>;
    return (
      <Link 
        to={`/profile/${piece.user_id}`} 
        className={`hover:text-accent transition-colors ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {piece.author_name}
      </Link>
    );
  };

  const renderCard = (piece: InksPiece, isDraft = false) => {
    const cardClick = () => isDraft ? navigate(`/admin/inks-vault/edit/${piece.id}`) : navigate(`/inks-vault/piece/${piece.id}`);
    
    switch (piece.type) {
      case 'Poetry':
        return (
          <div onClick={cardClick} className="bg-card p-8 border border-border hover:border-accent transition-all cursor-pointer flex flex-col items-center justify-center text-center h-full group relative overflow-hidden">
            {isDraft && <div className="absolute top-2 left-2 bg-accent/20 text-accent text-[10px] font-bold uppercase px-2 py-1">Draft</div>}
            <div className="absolute inset-0 border border-border/50 m-3 pointer-events-none"></div>
            <Feather className="text-muted-foreground mb-4 group-hover:text-accent transition-colors" size={24} />
            <h3 className="text-2xl font-serif italic text-foreground mb-2 group-hover:text-accent transition-colors">{piece.title}</h3>
            <div className="w-12 h-px bg-accent my-3"></div>
            <p className="text-muted-foreground text-sm font-serif mb-3">by <AuthorLink piece={piece} /></p>
            {renderMeta(piece)}
            {canEdit(piece) && renderEditButton(piece)}
          </div>
        );

      case 'Report':
        return (
          <div onClick={cardClick} className="bg-card border border-border hover:border-primary/50 transition-all cursor-pointer h-full group overflow-hidden flex flex-col relative">
            {isDraft && <div className="absolute top-2 left-2 z-10 bg-accent/20 text-accent text-[10px] font-bold uppercase px-2 py-1">Draft</div>}
            <div className="h-1 bg-primary w-full"></div>
            <div className="p-6 flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-1">Official</div>
                <FileText size={18} className="text-muted-foreground group-hover:text-primary transition-colors"/>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{piece.title}</h3>
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">{piece.author_role}</p>
              {renderMeta(piece)}
              <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed mt-3">{piece.summary}</p>
            </div>
            <div className="px-6 py-3 bg-muted border-t border-border text-xs text-muted-foreground flex justify-between items-center">
              <span>{new Date(piece.created_at).toLocaleDateString()}</span>
              <span className="font-mono">REF-{piece.id.split('-')[1]}</span>
            </div>
            {canEdit(piece) && renderEditButton(piece)}
          </div>
        );

      case 'Interview':
        return (
          <div onClick={cardClick} className="bg-card p-8 border border-border hover:border-accent transition-all cursor-pointer h-full relative overflow-hidden group">
            {isDraft && <div className="absolute top-2 left-2 z-10 bg-accent/20 text-accent text-[10px] font-bold uppercase px-2 py-1">Draft</div>}
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12">
              <Mic size={120} />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-destructive animate-pulse"></span>
                <span className="text-xs font-bold uppercase text-destructive tracking-[0.15em]">Q&A Session</span>
              </div>
              <h3 className="text-2xl font-serif text-foreground mb-2 leading-tight group-hover:text-accent transition-colors">"{piece.title}"</h3>
              <p className="text-xs font-bold uppercase text-muted-foreground mb-3">Featuring <AuthorLink piece={piece} /></p>
              {renderMeta(piece)}
              <p className="text-muted-foreground text-sm mt-4">{piece.summary}</p>
            </div>
            {canEdit(piece) && renderEditButton(piece)}
          </div>
        );

      case 'Article':
        return (
          <div onClick={cardClick} className="bg-card border-b-4 border-border hover:border-accent hover:bg-muted/50 transition-all cursor-pointer h-full group p-6 flex flex-col relative">
            {isDraft && <div className="absolute top-2 left-2 bg-accent/20 text-accent text-[10px] font-bold uppercase px-2 py-1">Draft</div>}
            <div className="flex items-center gap-2 mb-3 text-muted-foreground">
              <Newspaper size={16} />
              <span className="text-xs font-bold uppercase tracking-[0.15em]">News & Analysis</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-foreground mb-3 group-hover:underline decoration-accent decoration-2 underline-offset-4">{piece.title}</h3>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-3 font-serif">{piece.summary}</p>
            {renderMeta(piece)}
            <div className="mt-auto pt-4 border-t border-border text-xs font-bold text-muted-foreground uppercase">
              By <AuthorLink piece={piece} />
            </div>
            {canEdit(piece) && renderEditButton(piece)}
          </div>
        );

      case 'Blog':
        return (
          <div onClick={cardClick} className="bg-card hover:shadow-lg transition-all cursor-pointer h-full group overflow-hidden border border-border relative">
            {isDraft && <div className="absolute top-2 left-2 z-10 bg-accent/20 text-accent text-[10px] font-bold uppercase px-2 py-1">Draft</div>}
            <div className="h-32 bg-muted flex items-center justify-center overflow-hidden">
              {piece.cover_image ? (
                <img src={piece.cover_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <User size={48} className="text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" />
              )}
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Link 
                  to={piece.user_id ? `/profile/${piece.user_id}` : '#'} 
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 bg-accent/20 flex items-center justify-center text-accent font-bold text-xs hover:bg-accent/30 transition-colors"
                >
                  {piece.author_name.charAt(0)}
                </Link>
                <div className="flex flex-col">
                  <AuthorLink piece={piece} className="text-xs font-bold text-foreground" />
                  <span className="text-[10px] text-muted-foreground uppercase">{piece.author_role}</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2 leading-tight">{piece.title}</h3>
              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{piece.summary}</p>
              {renderMeta(piece)}
              <div className="mt-4 flex items-center gap-1 text-accent text-xs font-bold group-hover:gap-2 transition-all">
                Read Post <ArrowLeft size={12} className="rotate-180" />
              </div>
            </div>
            {canEdit(piece) && renderEditButton(piece)}
          </div>
        );

      case 'Essay':
        return (
          <div onClick={cardClick} className="bg-card p-8 border border-border hover:border-muted-foreground transition-all cursor-pointer h-full group flex flex-col shadow-[4px_4px_0px_0px_hsl(var(--border))] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] relative">
            {isDraft && <div className="absolute top-2 left-2 bg-accent/20 text-accent text-[10px] font-bold uppercase px-2 py-1">Draft</div>}
            <div className="mb-4">
              <PenTool size={20} className="text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-serif text-foreground mb-4 leading-tight group-hover:text-primary transition-colors">{piece.title}</h3>
            <div className="w-full h-px bg-border mb-4"></div>
            <p className="text-muted-foreground font-serif text-sm leading-relaxed mb-4 flex-grow">{piece.summary}</p>
            {renderMeta(piece)}
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mt-4">Essential Reading</p>
            {canEdit(piece) && renderEditButton(piece)}
          </div>
        );

      case 'Opinion':
        return (
          <div onClick={cardClick} className="bg-primary text-primary-foreground p-8 hover:bg-primary/90 transition-all cursor-pointer h-full group relative overflow-hidden">
            {isDraft && <div className="absolute top-2 left-2 z-10 bg-accent text-primary text-[10px] font-bold uppercase px-2 py-1">Draft</div>}
            <Quote size={80} className="absolute -bottom-4 -right-4 text-primary-foreground/5 group-hover:text-primary-foreground/10 transition-colors" />
            <div className="relative z-10">
              <div className="bg-accent text-primary text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-1 inline-block mb-4">Op-Ed</div>
              <h3 className="text-xl font-bold mb-4 leading-snug">"{piece.title}"</h3>
              <p className="text-primary-foreground/70 text-sm mb-4 font-light">{piece.summary}</p>
              <div className="text-primary-foreground/50 mb-4">{renderMeta(piece)}</div>
              <div className="flex items-center gap-3 border-t border-primary-foreground/10 pt-4">
                <Link 
                  to={piece.user_id ? `/profile/${piece.user_id}` : '#'}
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                >
                  <Coffee size={14} />
                </Link>
                <div className="flex flex-col">
                  <AuthorLink piece={piece} className="text-xs font-bold" />
                  <span className="text-[10px] text-primary-foreground/50 uppercase">{piece.author_role}</span>
                </div>
              </div>
            </div>
            {canEdit(piece) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/inks-vault/edit/${piece.id}`);
                }}
                className="absolute top-2 right-2 p-2 bg-primary-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary-foreground/30"
              >
                <Pencil size={14} className="text-primary-foreground" />
              </button>
            )}
          </div>
        );

      case 'Fiction':
        return (
          <div onClick={cardClick} className="bg-[#2C1810] text-[#EADDCD] p-8 border-l-4 border-l-[#8B4513] hover:translate-x-1 transition-all cursor-pointer h-full group relative shadow-xl">
            {isDraft && <div className="absolute top-2 left-2 z-10 bg-accent text-primary text-[10px] font-bold uppercase px-2 py-1">Draft</div>}
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/paper.png')] opacity-10"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <Book size={20} className="text-[#8B4513]" />
                <span className="text-[10px] uppercase tracking-[0.2em] opacity-50">Short Story</span>
              </div>
              <h3 className="text-xl font-serif mb-2 text-[#F4E4BC]">{piece.title}</h3>
              <div className="flex-grow">
                <p className="text-sm opacity-70 italic font-serif leading-relaxed line-clamp-4">"{piece.summary}..."</p>
              </div>
              <div className="text-[#8B4513]/70 my-3">{renderMeta(piece)}</div>
              <div className="mt-4 text-xs font-bold uppercase tracking-[0.15em] text-[#8B4513]">
                Read Chapter
              </div>
            </div>
            {canEdit(piece) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/inks-vault/edit/${piece.id}`);
                }}
                className="absolute top-2 right-2 p-2 bg-[#8B4513]/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#8B4513]"
              >
                <Pencil size={14} className="text-[#EADDCD]" />
              </button>
            )}
          </div>
        );

      default:
        return (
          <div onClick={cardClick} className="bg-card p-8 border border-border hover:shadow-lg transition-all cursor-pointer h-full group flex flex-col relative">
            {isDraft && <div className="absolute top-2 left-2 bg-accent/20 text-accent text-[10px] font-bold uppercase px-2 py-1">Draft</div>}
            <h3 className="text-2xl font-serif text-foreground mb-3 group-hover:text-accent transition-colors">{piece.title}</h3>
            <p className="text-muted-foreground mb-4 leading-relaxed text-sm flex-grow">{piece.summary}</p>
            {renderMeta(piece)}
            {canEdit(piece) && renderEditButton(piece)}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-16">
      <SEO
        title="Inks Vault"
        description="Explore articles, essays, poetry, and reports from the University of Ibadan Students' Union. A collection of student voices and intellectual discourse."
        image="/og/og-inks-vault.png"
      />
      <div className="container mx-auto px-6">
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-accent transition-colors mb-12"
        >
          <div className="p-2 border border-border group-hover:border-accent transition-colors">
            <ArrowLeft size={14} />
          </div>
          <span>Back to Home</span>
        </button>

        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-4">
              <BookOpen className="text-accent w-6 h-6" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">Publications</span>
            </div>
            {user && (
              <Button onClick={() => navigate('/admin/inks-vault/new')} className="gap-2">
                <Plus size={16} />
                Write Something
              </Button>
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-serif text-primary leading-[0.9] mb-8"
          >
            Inks <br/> <span className="italic text-muted-foreground/30">Vault</span>
          </motion.h1>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <div className="relative max-w-md">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, or tags..."
                className="pl-11 pr-10 bg-card border-border"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </motion.div>

          {/* Tabs for Published/Drafts */}
          {user && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="bg-muted border border-border">
                <TabsTrigger value="published" className="gap-2 data-[state=active]:bg-background">
                  <Eye size={14} />
                  Published ({pieces.length})
                </TabsTrigger>
                <TabsTrigger value="drafts" className="gap-2 data-[state=active]:bg-background">
                  <FileStack size={14} />
                  My Drafts ({drafts.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2"
          >
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-all border ${
                  filter === cat
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-accent hover:text-accent'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Content */}
        {activeTab === 'published' ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredPieces.length > 0 ? (
                filteredPieces.map(piece => (
                  <motion.div
                    key={piece.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderCard(piece)}
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-20 text-center"
                >
                  <BookOpen size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-serif text-muted-foreground mb-2">No pieces found</h3>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredDrafts.length > 0 ? (
                filteredDrafts.map(piece => (
                  <motion.div
                    key={piece.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderCard(piece, true)}
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-20 text-center"
                >
                  <FileStack size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-serif text-muted-foreground mb-2">No drafts yet</h3>
                  <p className="text-sm text-muted-foreground mb-6">Start writing something new!</p>
                  <Button onClick={() => navigate('/admin/inks-vault/new')}>
                    <Plus size={16} className="mr-2" />
                    Create New Piece
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InksVaultPage;
