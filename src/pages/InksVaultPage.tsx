import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, PenTool, FileText, User, Mic, Book, Coffee, Feather, Newspaper, Quote, Plus, Loader2, Pencil, FileStack, Eye, Search, Clock, X, Heart, ArrowRight, Sparkles, Zap, Lightbulb } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SEO } from '@/components/SEO';
import { InksVaultSkeleton } from '@/components/skeletons/InksVaultSkeleton';
import { Json } from '@/integrations/supabase/types';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { LikeButton } from '@/components/LikeButton';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

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
  const { triggerHoverFeedback, triggerClickFeedback } = useHapticFeedback();
  const [filter, setFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [pieces, setPieces] = useState<InksPiece[]>([]);
  const [drafts, setDrafts] = useState<InksPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('published');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  const handleCardHover = useCallback(() => {
    triggerHoverFeedback();
  }, [triggerHoverFeedback]);

  const handleCardClick = useCallback((callback: () => void) => {
    triggerClickFeedback();
    callback();
  }, [triggerClickFeedback]);

  const categories = ['All', 'Article', 'Blog', 'Report', 'Essay', 'Poetry', 'Opinion', 'Interview', 'Fiction'];

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data: publishedData, error: publishedError } = await supabase
        .from('ink_pieces')
        .select('id, type, title, author_name, author_role, created_at, summary, user_id, cover_image, is_published, content, tags, view_count')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (!publishedError && publishedData) {
        setPieces(publishedData as InksPiece[]);
        
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

  const sortPieces = (list: InksPiece[]) => {
    if (sortBy === 'popular') {
      return [...list].sort((a, b) => (likeCounts[b.id] || 0) - (likeCounts[a.id] || 0));
    }
    return list;
  };

  const filteredPieces = sortPieces(filterPieces(pieces));
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
      className="absolute top-3 right-3 p-2 bg-background/90 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background border border-border z-10"
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

  // Unified card design with better visual hierarchy
  const renderCard = (piece: InksPiece, isDraft = false) => {
    const cardClick = () => handleCardClick(() => isDraft ? navigate(`/admin/inks-vault/edit/${piece.id}`) : navigate(`/inks-vault/piece/${piece.id}`));
    const readingTime = calculateReadingTime(piece.content);
    const TypeIcon = getTypeIcon(piece.type);
    
    return (
      <motion.div
        onClick={cardClick}
        onHoverStart={handleCardHover}
        className="bg-card overflow-hidden border border-border hover:border-accent/50 hover:shadow-lg transition-all cursor-pointer h-full group relative flex flex-col"
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        {isDraft && (
          <div className="absolute top-3 left-3 z-10 bg-accent text-accent-foreground text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg">
            Draft
          </div>
        )}
        
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-br from-nobel-gold/20 via-nobel-light/10 to-ui-light/10 flex items-center justify-center overflow-hidden relative">
          {piece.cover_image ? (
            <img 
              src={piece.cover_image} 
              alt="" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-nobel-gold/10 to-ui-light/10">
              <TypeIcon size={48} className="text-foreground/20" />
            </div>
          )}
          <div className="absolute top-3 right-3 bg-foreground/90 text-background text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg flex items-center gap-1.5">
            <TypeIcon size={12} />
            {piece.type}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-base font-serif font-bold text-foreground mb-2 line-clamp-2 group-hover:text-accent transition-colors">
            {piece.title}
          </h3>
          
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-grow">
            {piece.summary || 'A compelling piece from our community.'}
          </p>
          
          {/* Meta Information */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs">
                {piece.author_name.charAt(0).toUpperCase()}
              </div>
              <AuthorLink piece={piece} className="text-xs font-medium text-foreground truncate" />
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <Clock size={10} />
              {readingTime} min
            </div>
          </div>
        </div>
        
        {canEdit(piece) && renderEditButton(piece)}
      </motion.div>
    );
  };

  if (loading) {
    return <InksVaultSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Inks Vault"
        description="Explore articles, essays, poetry, and reports from the University of Ibadan Students' Union. A collection of student voices and intellectual discourse."
        image="/og/og-inks-vault.png"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Inks Vault', url: '/inks-vault' },
        ]}
      />
      
      {/* Hero Section with Decorative Background */}
      <div className="relative pt-24 pb-20 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-nobel-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-ui-light/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </motion.button>

          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-3xl mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-accent/10 rounded-lg">
                <BookOpen size={20} className="text-accent" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-accent">Editorial Platform</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-serif font-bold text-foreground mb-6 leading-tight">
              Inks Vault
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl leading-relaxed">
              A curated collection of voices, narratives, and intellectual discourse from the University of Ibadan Students' Union community. Explore articles, essays, poetry, and more from our talented contributors.
            </p>

            {user && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button 
                  onClick={() => navigate('/admin/inks-vault/new')} 
                  size="lg"
                  className="gap-2 rounded-lg"
                >
                  <Plus size={18} />
                  Write Something
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="container mx-auto px-6 pb-20">
        {/* Tabs for Published/Drafts */}
        {user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-10"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-muted border border-border rounded-lg p-1 w-fit">
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
          </motion.div>
        )}

        {/* Filter & Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-12"
        >
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map(cat => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all border ${
                  filter === cat
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-card text-muted-foreground border-border hover:border-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>

          {/* Search & Sort Row */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, or tags..."
                className="pl-11 pr-10 bg-card border-border rounded-lg"
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

            {/* Sort Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortBy('latest')}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                  sortBy === 'latest' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <Clock size={12} className="inline mr-1.5" /> Latest
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                  sortBy === 'popular' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <Heart size={12} className="inline mr-1.5" /> Most Liked
              </button>
            </div>
          </div>
        </motion.div>

        {/* Content Grid */}
        {activeTab === 'published' ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredPieces.length > 0 ? (
              filteredPieces.map(piece => (
                <motion.div
                  key={piece.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
                  }}
                >
                  {renderCard(piece)}
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-16 text-center"
              >
                <BookOpen size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No pieces found matching your filters.</p>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredDrafts.length > 0 ? (
              filteredDrafts.map(piece => (
                <motion.div
                  key={piece.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
                  }}
                >
                  {renderCard(piece, true)}
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-16 text-center"
              >
                <FileStack size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No drafts yet. Start writing!</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InksVaultPage;
