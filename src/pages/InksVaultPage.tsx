import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, PenTool, FileText, User, Mic, Book, Coffee, Feather, Newspaper, Quote, Plus, Loader2, Pencil, FileStack, Eye, Search, Clock, X, Heart, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SEO } from '@/components/SEO';
import { Json } from '@/integrations/supabase/types';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { LikeButton } from '@/components/LikeButton';

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
  content: Json;
  tags: string[] | null;
  view_count: number;
}

interface EditorBlock {
  data?: {
    text?: string;
    items?: (string | { content: string })[];
  };
}

// Calculate reading time from EditorJS content
const calculateReadingTime = (content: Json): number => {
  if (!content || typeof content !== 'object' || Array.isArray(content)) return 1;
  const blocks = (content as { blocks?: EditorBlock[] }).blocks;
  if (!blocks) return 1;
  
  let wordCount = 0;
  blocks.forEach((block) => {
    if (block.data?.text) {
      wordCount += block.data.text.split(/\s+/).filter((w: string) => w.length > 0).length;
    }
    if (block.data?.items) {
      block.data.items.forEach((item) => {
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
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('published');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

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
        
        // Fetch like counts for all pieces
        const pieceIds = publishedData.map(p => p.id);
        const counts: Record<string, number> = {};
        
        for (const pieceId of pieceIds) {
          const { count } = await supabase
            .from('ink_likes')
            .select('*', { count: 'exact', head: true })
            .eq('piece_id', pieceId);
          counts[pieceId] = count || 0;
        }
        setLikeCounts(counts);
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

  // Sort pieces
  const sortPieces = (list: InksPiece[]) => {
    if (sortBy === 'popular') {
      return [...list].sort((a, b) => (likeCounts[b.id] || 0) - (likeCounts[a.id] || 0));
    }
    return list;
  };

  const filteredPieces = sortPieces(filterPieces(pieces));
  const filteredDrafts = filterPieces(drafts);
  const featuredPiece = filteredPieces[0];
  const gridPieces = filteredPieces.slice(1);

  const canEdit = (piece: InksPiece) => {
    return isStaff || (user && piece.user_id === user.id);
  };

  const handleNewsletterSubscribe = async () => {
    if (!newsletterEmail.trim()) return;
    setSubscribing(true);
    try {
      const { error } = await supabase.functions.invoke('subscribe-newsletter', {
        body: { email: newsletterEmail, source: 'inks-vault' }
      });
      if (!error) {
        setNewsletterEmail('');
      }
    } catch (err) {
      console.error('Subscribe error:', err);
    }
    setSubscribing(false);
  };

  const renderEditButton = (piece: InksPiece) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/admin/inks-vault/edit/${piece.id}`);
      }}
      className="absolute top-3 right-3 p-2 bg-background/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background border border-border"
    >
      <Pencil size={14} className="text-foreground" />
    </button>
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Poetry': return Feather;
      case 'Report': return FileText;
      case 'Interview': return Mic;
      case 'Article': return Newspaper;
      case 'Blog': return Coffee;
      case 'Essay': return PenTool;
      case 'Opinion': return Quote;
      case 'Fiction': return Book;
      default: return BookOpen;
    }
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

  // New unified card design with rounded corners
  const renderCard = (piece: InksPiece, isDraft = false) => {
    const cardClick = () => isDraft ? navigate(`/admin/inks-vault/edit/${piece.id}`) : navigate(`/inks-vault/piece/${piece.id}`);
    const readingTime = calculateReadingTime(piece.content);
    const TypeIcon = getTypeIcon(piece.type);
    
    return (
      <motion.div
        onClick={cardClick}
        className="bg-card rounded-xl overflow-hidden border border-border hover:border-accent/50 hover:shadow-lg transition-all cursor-pointer h-full group relative flex flex-col"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        {isDraft && (
          <div className="absolute top-3 left-3 z-10 bg-accent text-accent-foreground text-[10px] font-bold uppercase px-2 py-1 rounded-md">
            Draft
          </div>
        )}
        
        {/* Cover Image */}
        <div className="h-48 bg-muted flex items-center justify-center overflow-hidden relative">
          {piece.cover_image ? (
            <img 
              src={piece.cover_image} 
              alt="" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 flex items-center justify-center">
              <TypeIcon size={48} className="text-muted-foreground/30" />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Type Badge & Date */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-accent text-xs font-semibold">{piece.type}</span>
            <span className="text-muted-foreground text-xs">•</span>
            <span className="text-muted-foreground text-xs">
              {new Date(piece.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-serif font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {piece.title}
          </h3>
          
          {/* Summary */}
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-grow">
            {piece.summary || 'No summary available.'}
          </p>
          
          {/* Meta Row */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs">
                {piece.author_name.charAt(0)}
              </div>
              <AuthorLink piece={piece} className="text-xs font-medium text-foreground" />
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {readingTime} min
              </span>
              <LikeButton pieceId={piece.id} initialLikeCount={likeCounts[piece.id] || 0} size="sm" />
            </div>
          </div>
        </div>
        
        {canEdit(piece) && renderEditButton(piece)}
      </motion.div>
    );
  };

  // Featured article hero card
  const renderFeaturedCard = (piece: InksPiece) => {
    const readingTime = calculateReadingTime(piece.content);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-2 gap-0 bg-muted rounded-2xl overflow-hidden mb-12 group cursor-pointer"
        onClick={() => navigate(`/inks-vault/piece/${piece.id}`)}
      >
        {/* Left: Text Content */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <span className="text-accent text-xs font-semibold uppercase tracking-wider mb-4">{piece.type}</span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4 group-hover:text-primary transition-colors leading-tight">
            {piece.title}
          </h2>
          <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
            {piece.summary || 'Explore this featured piece from the Inks Vault collection.'}
          </p>
          <div className="text-xs text-muted-foreground">
            {new Date(piece.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
        
        {/* Right: Image */}
        <div className="h-64 md:h-auto bg-accent/10 relative overflow-hidden">
          {piece.cover_image ? (
            <img 
              src={piece.cover_image} 
              alt="" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 flex items-center justify-center">
              <BookOpen size={80} className="text-muted-foreground/20" />
            </div>
          )}
        </div>
        
        {canEdit(piece) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/inks-vault/edit/${piece.id}`);
            }}
            className="absolute top-4 right-4 p-2 bg-background/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background border border-border"
          >
            <Pencil size={14} className="text-foreground" />
          </button>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <SEO
        title="Inks Vault"
        description="Explore articles, essays, poetry, and reports from the University of Ibadan Students' Union. A collection of student voices and intellectual discourse."
        image="/screenshots/inks-vault.png"
      />
      
      <div className="container mx-auto px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-4">
            Inks Vault
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Voices and narratives from the University of Ibadan Students' Union community.
          </p>
          
          {user && (
            <Button onClick={() => navigate('/admin/inks-vault/new')} className="mt-6 rounded-full gap-2">
              <Plus size={16} />
              Write Something
            </Button>
          )}
        </motion.div>

        {/* Featured Article */}
        {featuredPiece && activeTab === 'published' && !searchQuery && filter === 'All' && (
          renderFeaturedCard(featuredPiece)
        )}

        {/* Newsletter Subscription Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-muted/50 rounded-2xl p-8 mb-12"
        >
          <div className="max-w-2xl">
            <h3 className="text-lg font-serif font-semibold text-foreground mb-2">
              Subscribe to our newsletter for daily insights
            </h3>
            <div className="flex gap-3 mt-4">
              <Input
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter Your Email"
                className="flex-1 rounded-full bg-card border-border"
                onKeyDown={(e) => e.key === 'Enter' && handleNewsletterSubscribe()}
              />
              <Button 
                onClick={handleNewsletterSubscribe} 
                disabled={subscribing}
                className="rounded-full px-6"
                variant="outline"
              >
                {subscribing ? <Loader2 className="animate-spin" size={16} /> : 'Subscribe'}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Tabs for Published/Drafts */}
        {user && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="bg-muted border border-border rounded-full p-1">
              <TabsTrigger value="published" className="gap-2 rounded-full data-[state=active]:bg-background">
                <Eye size={14} />
                Published ({pieces.length})
              </TabsTrigger>
              <TabsTrigger value="drafts" className="gap-2 rounded-full data-[state=active]:bg-background">
                <FileStack size={14} />
                My Drafts ({drafts.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Search & Filters Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col lg:flex-row lg:items-center gap-4 mb-8"
        >
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, or tags..."
              className="pl-11 pr-10 bg-card border-border rounded-full"
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

          {/* Sort Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortBy('latest')}
              className={`px-4 py-2 text-xs font-medium rounded-full transition-all ${
                sortBy === 'latest' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock size={12} className="inline mr-1.5" /> Latest
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-4 py-2 text-xs font-medium rounded-full transition-all ${
                sortBy === 'popular' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Heart size={12} className="inline mr-1.5" /> Most Liked
            </button>
          </div>
        </motion.div>

        {/* Content Type Filter Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 text-xs font-medium rounded-full transition-all border ${
                filter === cat
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card text-muted-foreground border-border hover:border-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Content Grid */}
        {activeTab === 'published' ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {(searchQuery || filter !== 'All' ? filteredPieces : gridPieces).length > 0 ? (
                (searchQuery || filter !== 'All' ? filteredPieces : gridPieces).map(piece => (
                  <motion.div
                    key={piece.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
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
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
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
                  <Button onClick={() => navigate('/admin/inks-vault/new')} className="rounded-full">
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
