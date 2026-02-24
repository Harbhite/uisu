import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, PenTool, FileText, User, Mic, Book, Coffee, Feather, Newspaper, Quote, Plus, Loader2, Pencil, FileStack, Eye, Search, Clock, X, Heart, ArrowRight, Sparkles } from 'lucide-react';
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
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  // Card hover handler with haptic feedback
  const handleCardHover = useCallback(() => {
    triggerHoverFeedback();
  }, [triggerHoverFeedback]);

  // Card click handler with haptic feedback
  const handleCardClick = useCallback((callback: () => void) => {
    triggerClickFeedback();
    callback();
  }, [triggerClickFeedback]);

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

  // Blog Card - Image first, then content
  const renderBlogCard = (piece: InksPiece, isDraft = false) => {
    const cardClick = () => handleCardClick(() => isDraft ? navigate(`/admin/inks-vault/edit/${piece.id}`) : navigate(`/inks-vault/piece/${piece.id}`));
    const readingTime = calculateReadingTime(piece.content);
    
    return (
      <motion.div
        onClick={cardClick}
        onHoverStart={handleCardHover}
        className="bg-card overflow-hidden border border-border hover:border-accent/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all cursor-pointer h-full group relative flex flex-col"
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        {isDraft && (
          <div className="absolute top-3 left-3 z-10 bg-accent text-accent-foreground text-[10px] font-bold uppercase px-2 py-1 rounded-lg">
            Draft
          </div>
        )}
        
        {/* Cover Image First */}
        <div className="h-52 bg-gradient-to-br from-amber-500/20 via-orange-400/10 to-rose-400/20 flex items-center justify-center overflow-hidden relative">
          {piece.cover_image ? (
            <img 
              src={piece.cover_image} 
              alt="" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Coffee size={56} className="text-amber-600/30" />
            </div>
          )}
          <div className="absolute bottom-3 left-3 bg-amber-500 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg flex items-center gap-1">
            <Coffee size={10} />
            Blog
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-serif font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {piece.title}
          </h3>
          
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-grow">
            {piece.summary || 'A personal perspective on student life and experiences.'}
          </p>
          
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 font-bold text-xs">
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

  // Poetry Card - Elegant, typographic focused with solid ui-blue
  const renderPoetryCard = (piece: InksPiece, isDraft = false) => {
    const cardClick = () => handleCardClick(() => isDraft ? navigate(`/admin/inks-vault/edit/${piece.id}`) : navigate(`/inks-vault/piece/${piece.id}`));
    
    return (
      <motion.div
        onClick={cardClick}
        onHoverStart={handleCardHover}
        className="bg-ui-blue overflow-hidden border border-ui-dark hover:shadow-xl hover:shadow-ui-blue/30 transition-all cursor-pointer h-full group relative flex flex-col text-white"
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        {isDraft && (
          <div className="absolute top-3 left-3 z-10 bg-white text-ui-blue text-[10px] font-bold uppercase px-2 py-1">
            Draft
          </div>
        )}
        
        {/* Decorative Header */}
        <div className="p-6 pb-4 relative">
          <Feather className="absolute top-4 right-4 text-white/30" size={32} />
          <div className="text-white/80 text-[10px] font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
            <Sparkles size={12} />
            Poetry
          </div>
          <h3 className="text-xl font-serif italic font-bold text-white mb-3 line-clamp-2 group-hover:text-nobel-cream transition-colors">
            "{piece.title}"
          </h3>
          <p className="text-white/70 text-sm line-clamp-3 italic">
            {piece.summary || 'Verses that speak to the soul...'}
          </p>
        </div>
        
        {/* Footer */}
        <div className="mt-auto p-5 pt-4 border-t border-white/20 bg-ui-dark/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs">
                {piece.author_name.charAt(0)}
              </div>
              <span className="text-xs font-medium text-white">{piece.author_name}</span>
            </div>
            <LikeButton pieceId={piece.id} initialLikeCount={likeCounts[piece.id] || 0} size="sm" />
          </div>
        </div>
        
        {canEdit(piece) && renderEditButton(piece)}
      </motion.div>
    );
  };

  // Article Card - Bold, news-style
  const renderArticleCard = (piece: InksPiece, isDraft = false) => {
    const cardClick = () => handleCardClick(() => isDraft ? navigate(`/admin/inks-vault/edit/${piece.id}`) : navigate(`/inks-vault/piece/${piece.id}`));
    const readingTime = calculateReadingTime(piece.content);
    
    return (
      <motion.div
        onClick={cardClick}
        onHoverStart={handleCardHover}
        className="bg-card overflow-hidden border-2 border-foreground/10 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all cursor-pointer h-full group relative flex flex-col"
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        {isDraft && (
          <div className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground text-[10px] font-bold uppercase px-2 py-1 rounded-lg">
            Draft
          </div>
        )}
        
        {/* Header Bar */}
        <div className="bg-foreground text-background px-4 py-2 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Newspaper size={12} />
            Article
          </span>
          <span className="text-[10px] opacity-70">
            {new Date(piece.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
        
        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-xl font-serif font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
            {piece.title}
          </h3>
          
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-grow">
            {piece.summary || 'An in-depth look at issues that matter to students.'}
          </p>
          
          {piece.cover_image && (
            <div className="h-32 rounded-lg overflow-hidden mb-4">
              <img 
                src={piece.cover_image} 
                alt="" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>
          )}
          
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <AuthorLink piece={piece} className="text-xs font-semibold text-foreground" />
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {readingTime} min read
              </span>
              <LikeButton pieceId={piece.id} initialLikeCount={likeCounts[piece.id] || 0} size="sm" />
            </div>
          </div>
        </div>
        
        {canEdit(piece) && renderEditButton(piece)}
      </motion.div>
    );
  };

  // Report Card - Professional, structured
  const renderReportCard = (piece: InksPiece, isDraft = false) => {
    const cardClick = () => handleCardClick(() => isDraft ? navigate(`/admin/inks-vault/edit/${piece.id}`) : navigate(`/inks-vault/piece/${piece.id}`));
    const readingTime = calculateReadingTime(piece.content);
    
    return (
      <motion.div
        onClick={cardClick}
        onHoverStart={handleCardHover}
        className="bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/30 overflow-hidden border border-slate-300 dark:border-slate-700 hover:shadow-xl hover:shadow-slate-500/10 transition-all cursor-pointer h-full group relative flex flex-col"
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        {isDraft && (
          <div className="absolute top-3 left-3 z-10 bg-slate-700 text-white text-[10px] font-bold uppercase px-2 py-1 rounded-lg">
            Draft
          </div>
        )}
        
        {/* Document Header */}
        <div className="p-5 border-b border-slate-300 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-slate-700 dark:bg-slate-600 flex items-center justify-center">
              <FileText size={16} className="text-white" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Official Report</span>
          </div>
          <h3 className="text-lg font-sans font-bold text-foreground line-clamp-2 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
            {piece.title}
          </h3>
        </div>
        
        {/* Content */}
        <div className="p-5 flex-grow">
          <p className="text-muted-foreground text-sm line-clamp-3">
            {piece.summary || 'A comprehensive analysis and findings.'}
          </p>
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-slate-200/50 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{piece.author_name}</span>
            <span className="mx-2">•</span>
            {new Date(piece.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <LikeButton pieceId={piece.id} initialLikeCount={likeCounts[piece.id] || 0} size="sm" />
        </div>
        
        {canEdit(piece) && renderEditButton(piece)}
      </motion.div>
    );
  };

  // Essay Card - Academic, sophisticated
  const renderEssayCard = (piece: InksPiece, isDraft = false) => {
    const cardClick = () => handleCardClick(() => isDraft ? navigate(`/admin/inks-vault/edit/${piece.id}`) : navigate(`/inks-vault/piece/${piece.id}`));
    const readingTime = calculateReadingTime(piece.content);
    
    return (
      <motion.div
        onClick={cardClick}
        onHoverStart={handleCardHover}
        className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/20 overflow-hidden border border-emerald-200 dark:border-emerald-800/50 hover:shadow-xl hover:shadow-emerald-500/20 transition-all cursor-pointer h-full group relative flex flex-col"
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        {isDraft && (
          <div className="absolute top-3 left-3 z-10 bg-emerald-600 text-white text-[10px] font-bold uppercase px-2 py-1 rounded-lg">
            Draft
          </div>
        )}
        
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center gap-2 mb-4">
            <PenTool size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">Essay</span>
          </div>
          
          <h3 className="text-xl font-serif font-bold text-foreground mb-3 line-clamp-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
            {piece.title}
          </h3>
          
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-grow">
            {piece.summary || 'A thoughtful exploration of ideas and arguments.'}
          </p>
          
          <div className="flex items-center justify-between pt-4 border-t border-emerald-200 dark:border-emerald-800/50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-600/20 flex items-center justify-center text-emerald-600 font-bold text-[10px]">
                {piece.author_name.charAt(0)}
              </div>
              <AuthorLink piece={piece} className="text-xs font-medium text-foreground" />
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

  // Opinion Card - Bold statement style
  const renderOpinionCard = (piece: InksPiece, isDraft = false) => {
    const cardClick = () => handleCardClick(() => isDraft ? navigate(`/admin/inks-vault/edit/${piece.id}`) : navigate(`/inks-vault/piece/${piece.id}`));
    const readingTime = calculateReadingTime(piece.content);
    
    return (
      <motion.div
        onClick={cardClick}
        onHoverStart={handleCardHover}
        className="bg-gradient-to-br from-rose-500 to-pink-600 overflow-hidden hover:shadow-xl hover:shadow-rose-500/30 transition-all cursor-pointer h-full group relative flex flex-col text-white"
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        {isDraft && (
          <div className="absolute top-3 left-3 z-10 bg-white text-rose-600 text-[10px] font-bold uppercase px-2 py-1 rounded-lg">
            Draft
          </div>
        )}
        
        <div className="p-6 flex flex-col flex-grow">
          <Quote size={32} className="text-white/30 mb-4" />
          
          <h3 className="text-xl font-serif font-bold mb-3 line-clamp-3 group-hover:underline transition-all leading-tight">
            {piece.title}
          </h3>
          
          <p className="text-white/80 text-sm line-clamp-2 mb-4 flex-grow">
            {piece.summary || 'A strong perspective on matters that count.'}
          </p>
          
          <div className="flex items-center justify-between pt-4 border-t border-white/20 mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                {piece.author_name.charAt(0)}
              </div>
              <span className="text-xs font-medium">{piece.author_name}</span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-1 rounded-lg">Opinion</span>
          </div>
        </div>
        
        {canEdit(piece) && renderEditButton(piece)}
      </motion.div>
    );
  };

  // Interview Card - Conversation style
  const renderInterviewCard = (piece: InksPiece, isDraft = false) => {
    const cardClick = () => handleCardClick(() => isDraft ? navigate(`/admin/inks-vault/edit/${piece.id}`) : navigate(`/inks-vault/piece/${piece.id}`));
    const readingTime = calculateReadingTime(piece.content);
    
    return (
      <motion.div
        onClick={cardClick}
        onHoverStart={handleCardHover}
        className="bg-card overflow-hidden border border-border hover:border-sky-400/50 hover:shadow-xl hover:shadow-sky-500/20 transition-all cursor-pointer h-full group relative flex flex-col"
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        {isDraft && (
          <div className="absolute top-3 left-3 z-10 bg-sky-600 text-white text-[10px] font-bold uppercase px-2 py-1 rounded-lg">
            Draft
          </div>
        )}
        
        {/* Header with mic icon */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Mic size={20} className="text-white" />
          </div>
          <div>
            <span className="text-white/80 text-[10px] font-semibold uppercase tracking-wider">Interview</span>
            <p className="text-white text-sm font-medium">In Conversation</p>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-serif font-bold text-foreground mb-2 line-clamp-2 group-hover:text-sky-600 transition-colors">
            {piece.title}
          </h3>
          
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-grow">
            {piece.summary || 'An exclusive conversation with voices that matter.'}
          </p>
          
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <AuthorLink piece={piece} className="text-xs font-medium text-foreground" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
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

  // Fiction Card - Creative, imaginative
  const renderFictionCard = (piece: InksPiece, isDraft = false) => {
    const cardClick = () => handleCardClick(() => isDraft ? navigate(`/admin/inks-vault/edit/${piece.id}`) : navigate(`/inks-vault/piece/${piece.id}`));
    const readingTime = calculateReadingTime(piece.content);
    
    return (
      <motion.div
        onClick={cardClick}
        onHoverStart={handleCardHover}
        className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 overflow-hidden hover:shadow-xl hover:shadow-purple-500/30 transition-all cursor-pointer h-full group relative flex flex-col text-white"
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        {isDraft && (
          <div className="absolute top-3 left-3 z-10 bg-white text-purple-600 text-[10px] font-bold uppercase px-2 py-1 rounded-lg">
            Draft
          </div>
        )}
        
        {/* Starry effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-4 left-6 w-1 h-1 bg-white rounded-full animate-pulse" />
          <div className="absolute top-12 right-10 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-300" />
          <div className="absolute bottom-20 left-12 w-1 h-1 bg-white rounded-full animate-pulse delay-500" />
          <div className="absolute top-8 right-24 w-0.5 h-0.5 bg-white rounded-full" />
        </div>
        
        <div className="p-6 flex flex-col flex-grow relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Book size={16} className="text-purple-300" />
            <span className="text-purple-300 text-[10px] font-semibold uppercase tracking-wider">Fiction</span>
          </div>
          
          <h3 className="text-xl font-serif font-bold mb-3 line-clamp-2 group-hover:text-purple-200 transition-colors">
            {piece.title}
          </h3>
          
          <p className="text-white/70 text-sm line-clamp-3 mb-4 flex-grow italic">
            {piece.summary || 'Step into a world of imagination and storytelling.'}
          </p>
          
          <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
            <span className="text-xs font-medium text-white/80">{piece.author_name}</span>
            <span className="text-[10px] text-white/60 flex items-center gap-1">
              <Clock size={10} />
              {readingTime} min read
            </span>
          </div>
        </div>
        
        {canEdit(piece) && renderEditButton(piece)}
      </motion.div>
    );
  };

  // Universal card renderer based on type
  const renderCard = (piece: InksPiece, isDraft = false) => {
    switch (piece.type) {
      case 'Blog': return renderBlogCard(piece, isDraft);
      case 'Poetry': return renderPoetryCard(piece, isDraft);
      case 'Article': return renderArticleCard(piece, isDraft);
      case 'Report': return renderReportCard(piece, isDraft);
      case 'Essay': return renderEssayCard(piece, isDraft);
      case 'Opinion': return renderOpinionCard(piece, isDraft);
      case 'Interview': return renderInterviewCard(piece, isDraft);
      case 'Fiction': return renderFictionCard(piece, isDraft);
      default: return renderBlogCard(piece, isDraft);
    }
  };

  if (loading) {
    return <InksVaultSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <SEO
        title="Inks Vault"
        description="Explore articles, essays, poetry, and reports from the University of Ibadan Students' Union. A collection of student voices and intellectual discourse."
        image="/og/pages-screenshot/inks-vault.png"
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

        {/* Hero Header - Left Aligned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-4">
            Inks Vault
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Voices and narratives from the University of Ibadan Students' Union community.
          </p>
          
          {user && (
            <Button onClick={() => navigate('/admin/inks-vault/new')} className="mt-6 rounded-full gap-2">
              <Plus size={16} />
              Write Something
            </Button>
          )}
        </motion.div>

        {/* Tabs for Published/Drafts */}
        {user && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
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

        {/* Content Type Filter Pills - BEFORE content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-6"
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

        {/* Search & Sort Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col lg:flex-row lg:items-center gap-4 mb-10"
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

        {/* Content Grid */}
        {activeTab === 'published' ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
          >
            <AnimatePresence mode="popLayout">
              {filteredPieces.length > 0 ? (
                filteredPieces.map(piece => (
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
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

        {/* Newsletter Subscription Section - At Bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-muted/50 rounded-2xl p-8"
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
      </div>
    </div>
  );
};

export default InksVaultPage;
