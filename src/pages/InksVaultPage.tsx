import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, PenTool, FileText, User, Mic, Book, Coffee, Feather, Filter, Newspaper, MessageCircle, Quote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { inksPieces, InksPiece } from '@/lib/data';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const InksVaultPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('All');

  const categories = ['All', 'Article', 'Blog', 'Report', 'Essay', 'Poetry', 'Opinion', 'Interview', 'Fiction'];

  const filteredPieces = filter === 'All'
    ? inksPieces
    : inksPieces.filter(p => p.type === filter);

  // Helper to render different card styles based on type
  const renderCard = (piece: InksPiece) => {

      switch (piece.type) {
          case 'Poetry':
              return (
                 <div onClick={() => navigate(`/inks-vault/piece/${piece.id}`)} className="bg-[#FAF9F6] p-8 rounded-xl border border-stone-200 hover:border-nobel-gold hover:shadow-lg transition-all cursor-pointer flex flex-col items-center justify-center text-center h-full group relative overflow-hidden">
                    <div className="absolute inset-0 border-2 border-stone-100 m-2 rounded-lg pointer-events-none"></div>
                    <Feather className="text-stone-400 mb-4 group-hover:text-nobel-gold transition-colors" size={24} />
                    <h3 className="text-2xl font-serif italic text-ui-blue mb-2 group-hover:text-nobel-gold transition-colors">{piece.title}</h3>
                    <div className="w-12 h-px bg-nobel-gold my-3"></div>
                    <p className="text-stone-500 text-sm font-serif">by {piece.author}</p>
                 </div>
              );

          case 'Report':
               return (
                 <div onClick={() => navigate(`/inks-vault/piece/${piece.id}`)} className="bg-slate-50 rounded-lg border border-slate-200 hover:border-ui-blue/50 hover:shadow-md transition-all cursor-pointer h-full group overflow-hidden flex flex-col">
                    <div className="h-2 bg-ui-blue w-full"></div>
                    <div className="p-6 flex-grow flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                             <div className="bg-blue-100 text-ui-blue text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm">Official</div>
                             <FileText size={18} className="text-slate-400 group-hover:text-ui-blue transition-colors"/>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-ui-blue transition-colors font-sans">{piece.title}</h3>
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-4">{piece.role}</p>
                        <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">{piece.summary}</p>
                    </div>
                    <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
                        <span>{new Date(piece.date).toLocaleDateString()}</span>
                        <span className="font-mono">REF-{piece.id.split('-')[1]}</span>
                    </div>
                 </div>
               );

          case 'Interview':
              return (
                 <div onClick={() => navigate(`/inks-vault/piece/${piece.id}`)} className="bg-white p-8 rounded-xl border border-slate-200 hover:border-nobel-gold hover:shadow-lg transition-all cursor-pointer h-full relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12">
                        <Mic size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 mb-4">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            <span className="text-xs font-bold uppercase text-red-500 tracking-widest">Q&A Session</span>
                        </div>
                        <h3 className="text-2xl font-serif text-ui-blue mb-2 leading-tight group-hover:text-nobel-gold transition-colors">"{piece.title}"</h3>
                        <p className="text-xs font-bold uppercase text-slate-400 mb-6">Featuring {piece.author}</p>
                        <p className="text-slate-600 text-sm">{piece.summary}</p>
                    </div>
                 </div>
              );

          case 'Article':
              return (
                 <div onClick={() => navigate(`/inks-vault/piece/${piece.id}`)} className="bg-white rounded-none border-b-4 border-slate-200 hover:border-nobel-gold hover:bg-slate-50 transition-all cursor-pointer h-full group p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-3 text-slate-400">
                        <Newspaper size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">News & Analysis</span>
                    </div>
                    <h3 className="text-xl font-serif font-bold text-ui-blue mb-3 group-hover:underline decoration-nobel-gold decoration-2 underline-offset-4">{piece.title}</h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3 font-serif">{piece.summary}</p>
                    <div className="mt-auto pt-4 border-t border-slate-100 text-xs font-bold text-slate-400 uppercase">
                        By {piece.author}
                    </div>
                 </div>
              );

          case 'Blog':
              return (
                 <div onClick={() => navigate(`/inks-vault/piece/${piece.id}`)} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all cursor-pointer h-full group overflow-hidden border border-slate-100">
                    <div className="h-32 bg-slate-100 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                         <User size={48} className="text-slate-300 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                             <span className="w-8 h-8 rounded-full bg-nobel-gold/20 flex items-center justify-center text-nobel-gold font-bold text-xs">{piece.author.charAt(0)}</span>
                             <div className="flex flex-col">
                                 <span className="text-xs font-bold text-slate-900">{piece.author}</span>
                                 <span className="text-[10px] text-slate-400 uppercase">{piece.role}</span>
                             </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{piece.title}</h3>
                        <p className="text-slate-500 text-sm line-clamp-2">{piece.summary}</p>
                        <div className="mt-4 flex items-center gap-1 text-nobel-gold text-xs font-bold group-hover:gap-2 transition-all">
                            Read Post <ArrowLeft size={12} className="rotate-180" />
                        </div>
                    </div>
                 </div>
              );

          case 'Essay':
               return (
                 <div onClick={() => navigate(`/inks-vault/piece/${piece.id}`)} className="bg-[#FDFBF7] p-8 rounded-sm border border-stone-200 hover:border-stone-400 transition-all cursor-pointer h-full group flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                    <div className="mb-4">
                        <PenTool size={20} className="text-stone-400" />
                    </div>
                    <h3 className="text-2xl font-serif text-stone-900 mb-4 leading-tight group-hover:text-ui-blue transition-colors">{piece.title}</h3>
                    <div className="w-full h-px bg-stone-200 mb-4"></div>
                    <p className="text-stone-600 font-serif text-sm leading-relaxed mb-6 flex-grow">{piece.summary}</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Essential Reading</p>
                 </div>
               );

          case 'Opinion':
              return (
                 <div onClick={() => navigate(`/inks-vault/piece/${piece.id}`)} className="bg-ui-blue text-white p-8 rounded-xl hover:bg-ui-dark transition-all cursor-pointer h-full group relative overflow-hidden">
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
                                 <span className="text-xs font-bold">{piece.author}</span>
                                 <span className="text-[10px] text-white/50 uppercase">{piece.role}</span>
                             </div>
                         </div>
                     </div>
                 </div>
              );

          case 'Fiction':
              return (
                 <div onClick={() => navigate(`/inks-vault/piece/${piece.id}`)} className="bg-[#2C1810] text-[#EADDCD] p-8 rounded-r-2xl rounded-l-md border-l-4 border-l-[#8B4513] hover:translate-x-1 transition-all cursor-pointer h-full group relative shadow-2xl">
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
                 </div>
              );

          default:
              return (
                <div onClick={() => navigate(`/inks-vault/piece/${piece.id}`)} className="bg-white p-8 rounded-xl border border-slate-200 hover:shadow-lg transition-all cursor-pointer h-full group flex flex-col">
                    <h3 className="text-2xl font-serif text-ui-blue mb-3 group-hover:text-nobel-gold transition-colors">{piece.title}</h3>
                    <p className="text-slate-600 mb-6 leading-relaxed text-sm flex-grow">{piece.summary}</p>
                </div>
              );
      }
  };

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
                className="flex items-center gap-4 mb-4"
             >
                <BookOpen className="text-nobel-gold w-6 h-6" />
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-500">Publications</span>
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

        <AnimatePresence mode="wait">
            <motion.div
                key={filter}
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
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InksVaultPage;
