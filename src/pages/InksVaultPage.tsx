import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, PenTool, FileText, User, Mic, Book, Coffee, Feather, Filter, Newspaper, Quote, Plus, Loader2, Pencil, FileStack, Eye, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
}

const InksVaultPage = () => {
  const navigate = useNavigate();
  const { isStaff } = useAdminCheck();
  const [filter, setFilter] = useState<string>('All');
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

      // Fetch published pieces
      const { data: publishedData, error: publishedError } = await supabase
        .from('ink_pieces')
        .select('id, type, title, author_name, author_role, created_at, summary, user_id, cover_image, is_published')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (!publishedError && publishedData) {
        setPieces(publishedData as InksPiece[]);
      }

      // Fetch user's drafts if logged in
      if (user) {
        const { data: draftData, error: draftError } = await supabase
          .from('ink_pieces')
          .select('id, type, title, author_name, author_role, created_at, summary, user_id, cover_image, is_published')
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

  const filteredPieces = filter === 'All'
    ? pieces
    : pieces.filter(p => p.type === filter);

  const filteredDrafts = filter === 'All'
    ? drafts
    : drafts.filter(p => p.type === filter);

  const canEdit = (piece: InksPiece) => {
    return isStaff || (user && piece.user_id === user.id);
  };

  const renderEditButton = (piece: InksPiece) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/admin/inks-vault/edit/${piece.id}`);
      }}
      className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
    >
      <Pencil size={14} className="text-slate-600" />
    </button>
  );

  const renderCard = (piece: InksPiece, isDraft = false) => {
    const cardClick = () => isDraft ? navigate(`/admin/inks-vault/edit/${piece.id}`) : navigate(`/inks-vault/piece/${piece.id}`);
    
    switch (piece.type) {
      case 'Poetry':
        return (
          <div onClick={cardClick} className="bg-[#FAF9F6] p-8 rounded-xl border border-stone-200 hover:border-nobel-gold hover:shadow-lg transition-all cursor-pointer flex flex-col items-center justify-center text-center h-full group relative overflow-hidden">
            {isDraft && <div className="absolute top-2 left-2 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase px-2 py-1 rounded">Draft</div>}
            <div className="absolute inset-0 border-2 border-stone-100 m-2 rounded-lg pointer-events-none"></div>
            <Feather className="text-stone-400 mb-4 group-hover:text-nobel-gold transition-colors" size={24} />
            <h3 className="text-2xl font-serif italic text-ui-blue mb-2 group-hover:text-nobel-gold transition-colors">{piece.title}</h3>
            <div className="w-12 h-px bg-nobel-gold my-3"></div>
            <p className="text-stone-500 text-sm font-serif">by {piece.author_name}</p>
            {canEdit(piece) && renderEditButton(piece)}
          </div>
        );

      case 'Report':
        return (
          <div onClick={cardClick} className="bg-slate-50 rounded-lg border border-slate-200 hover:border-ui-blue/50 hover:shadow-md transition-all cursor-pointer h-full group overflow-hidden flex flex-col relative">
            {isDraft && <div className="absolute top-2 left-2 z-10 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase px-2 py-1 rounded">Draft</div>}
            <div className="h-2 bg-ui-blue w-full"></div>
            <div className="p-6 flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-100 text-ui-blue text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm">Official</div>
                <FileText size={18} className="text-slate-400 group-hover:text-ui-blue transition-colors"/>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-ui-blue transition-colors font-sans">{piece.title}</h3>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-4">{piece.author_role}</p>
              <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">{piece.summary}</p>
            </div>
            <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
              <span>{new Date(piece.created_at).toLocaleDateString()}</span>
              <span className="font-mono">REF-{piece.id.split('-')[1]}</span>
            </div>
            {canEdit(piece) && renderEditButton(piece)}
          </div>
        );

      case 'Interview':
        return (
          <div onClick={cardClick} className="bg-white p-8 rounded-xl border border-slate-200 hover:border-nobel-gold hover:shadow-lg transition-all cursor-pointer h-full relative overflow-hidden group">
            {isDraft && <div className="absolute top-2 left-2 z-10 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase px-2 py-1 rounded">Draft</div>}
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12">
              <Mic size={120} />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-xs font-bold uppercase text-red-500 tracking-widest">Q&A Session</span>
              </div>
              <h3 className="text-2xl font-serif text-ui-blue mb-2 leading-tight group-hover:text-nobel-gold transition-colors">"{piece.title}"</h3>
              <p className="text-xs font-bold uppercase text-slate-400 mb-6">Featuring {piece.author_name}</p>
              <p className="text-slate-600 text-sm">{piece.summary}</p>
            </div>
            {canEdit(piece) && renderEditButton(piece)}
          </div>
        );

      case 'Article':
        return (
          <div onClick={cardClick} className="bg-white rounded-none border-b-4 border-slate-200 hover:border-nobel-gold hover:bg-slate-50 transition-all cursor-pointer h-full group p-6 flex flex-col relative">
            {isDraft && <div className="absolute top-2 left-2 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase px-2 py-1 rounded">Draft</div>}
            <div className="flex items-center gap-2 mb-3 text-slate-400">
              <Newspaper size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">News & Analysis</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-ui-blue mb-3 group-hover:underline decoration-nobel-gold decoration-2 underline-offset-4">{piece.title}</h3>
            <p className="text-slate-600 text-sm mb-4 line-clamp-3 font-serif">{piece.summary}</p>
            <div className="mt-auto pt-4 border-t border-slate-100 text-xs font-bold text-slate-400 uppercase">
              By {piece.author_name}
            </div>
            {canEdit(piece) && renderEditButton(piece)}
          </div>
        );

      case 'Blog':
        return (
          <div onClick={cardClick} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all cursor-pointer h-full group overflow-hidden border border-slate-100 relative">
            {isDraft && <div className="absolute top-2 left-2 z-10 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase px-2 py-1 rounded">Draft</div>}
            <div className="h-32 bg-slate-100 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
              {piece.cover_image ? (
                <img src={piece.cover_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <User size={48} className="text-slate-300 group-hover:scale-110 transition-transform duration-500" />
              )}
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-full bg-nobel-gold/20 flex items-center justify-center text-nobel-gold font-bold text-xs">{piece.author_name.charAt(0)}</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900">{piece.author_name}</span>
                  <span className="text-[10px] text-slate-400 uppercase">{piece.author_role}</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{piece.title}</h3>
              <p className="text-slate-500 text-sm line-clamp-2">{piece.summary}</p>
              <div className="mt-4 flex items-center gap-1 text-nobel-gold text-xs font-bold group-hover:gap-2 transition-all">
                Read Post <ArrowLeft size={12} className="rotate-180" />
              </div>
            </div>
            {canEdit(piece) && renderEditButton(piece)}
          </div>
        );

      case 'Essay':
        return (
          <div onClick={cardClick} className="bg-[#FDFBF7] p-8 rounded-sm border border-stone-200 hover:border-stone-400 transition-all cursor-pointer h-full group flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] relative">
            {isDraft && <div className="absolute top-2 left-2 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase px-2 py-1 rounded">Draft</div>}
            <div className="mb-4">
              <PenTool size={20} className="text-stone-400" />
            </div>
            <h3 className="text-2xl font-serif text-stone-900 mb-4 leading-tight group-hover:text-ui-blue transition-colors">{piece.title}</h3>
            <div className="w-full h-px bg-stone-200 mb-4"></div>
            <p className="text-stone-600 font-serif text-sm leading-relaxed mb-6 flex-grow">{piece.summary}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Essential Reading</p>
            {canEdit(piece) && renderEditButton(piece)}
          </div>
        );

      case 'Opinion':
        return (
          <div onClick={cardClick} className="bg-ui-blue text-white p-8 rounded-xl hover:bg-ui-dark transition-all cursor-pointer h-full group relative overflow-hidden">
            {isDraft && <div className="absolute top-2 left-2 z-10 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase px-2 py-1 rounded">Draft</div>}
            <Quote size={80} className="absolute -bottom-4 -right-4 text-white/5 group-hover:text-white/10 transition-colors" />
            <div className="relative z-10">
              <div className="bg-nobel-gold text-ui-blue text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded inline-block mb-4">Op-Ed</div>
              <h3 className="text-xl font-bold mb-4 leading-snug">"{piece.title}"</h3>
              <p className="text-white/70 text-sm mb-6 font-light">{piece.summary}</p>
              <div className="flex items-center gap-3 border-t border-white/10 pt-4">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Coffee size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold">{piece.author_name}</span>
                  <span className="text-[10px] text-white/50 uppercase">{piece.author_role}</span>
                </div>
              </div>
            </div>
            {canEdit(piece) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/inks-vault/edit/${piece.id}`);
                }}
                className="absolute top-2 right-2 p-2 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/30"
              >
                <Pencil size={14} className="text-white" />
              </button>
            )}
          </div>
        );

      case 'Fiction':
        return (
          <div onClick={cardClick} className="bg-[#2C1810] text-[#EADDCD] p-8 rounded-r-2xl rounded-l-md border-l-4 border-l-[#8B4513] hover:translate-x-1 transition-all cursor-pointer h-full group relative shadow-2xl">
            {isDraft && <div className="absolute top-2 left-2 z-10 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase px-2 py-1 rounded">Draft</div>}
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
              <div className="mt-4 text-xs font-bold uppercase tracking-widest text-[#8B4513]">
                Read Chapter
              </div>
            </div>
            {canEdit(piece) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/inks-vault/edit/${piece.id}`);
                }}
                className="absolute top-2 right-2 p-2 bg-[#8B4513]/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#8B4513]"
              >
                <Pencil size={14} className="text-[#EADDCD]" />
              </button>
            )}
          </div>
        );

      default:
        return (
          <div onClick={cardClick} className="bg-white p-8 rounded-xl border border-slate-200 hover:shadow-lg transition-all cursor-pointer h-full group flex flex-col relative">
            {isDraft && <div className="absolute top-2 left-2 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase px-2 py-1 rounded">Draft</div>}
            <h3 className="text-2xl font-serif text-ui-blue mb-3 group-hover:text-nobel-gold transition-colors">{piece.title}</h3>
            <p className="text-slate-600 mb-6 leading-relaxed text-sm flex-grow">{piece.summary}</p>
            {canEdit(piece) && renderEditButton(piece)}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-nobel-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-16">
      <div className="container mx-auto px-6">
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors mb-12"
        >
          <div className="p-2 rounded-full border border-slate-300 group-hover:border-nobel-gold transition-colors">
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
              <BookOpen className="text-nobel-gold w-6 h-6" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-500">Publications</span>
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
            className="text-6xl md:text-8xl font-serif text-ui-blue leading-[0.9] mb-8"
          >
            Inks <br/> <span className="italic text-slate-300">Vault</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-slate-600 max-w-2xl leading-relaxed font-light mb-12"
          >
            A curated collection of thoughts, reports, creative writing, and stories from the university community.
          </motion.p>

          {/* Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center gap-2 mb-12"
          >
            <div className="flex items-center gap-2 mr-4 text-slate-400">
              <Filter size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Filter:</span>
            </div>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  filter === cat
                    ? 'bg-ui-blue text-white shadow-md'
                    : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Tabs for Published/Drafts */}
        {user && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="bg-white border border-slate-200">
              <TabsTrigger value="published" className="gap-2 data-[state=active]:bg-ui-blue data-[state=active]:text-white">
                <Eye size={14} />
                Published
              </TabsTrigger>
              <TabsTrigger value="drafts" className="gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                <FileStack size={14} />
                My Drafts ({drafts.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'published' ? (
            <motion.div
              key={`published-${filter}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredPieces.length > 0 ? (
                filteredPieces.map((piece) => (
                  <motion.div key={piece.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="h-full">
                    {renderCard(piece)}
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center text-slate-400">
                  <p>No pieces found in this category.</p>
                  {user && (
                    <Button variant="outline" onClick={() => navigate('/admin/inks-vault/new')} className="mt-4">
                      Be the first to write one
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={`drafts-${filter}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredDrafts.length > 0 ? (
                filteredDrafts.map((piece) => (
                  <motion.div key={piece.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="h-full">
                    {renderCard(piece, true)}
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center text-slate-400">
                  <FileStack size={48} className="mx-auto mb-4 text-slate-300" />
                  <p className="mb-2">No drafts yet.</p>
                  <Button variant="outline" onClick={() => navigate('/admin/inks-vault/new')} className="mt-2">
                    Start Writing
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InksVaultPage;
