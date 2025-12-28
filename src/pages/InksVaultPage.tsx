import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, PenTool, FileText, User, Mic, Book, Coffee, Feather, Filter } from 'lucide-react';
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
      const isPoetry = piece.type === 'Poetry';
      const isReport = piece.type === 'Report';
      const isInterview = piece.type === 'Interview';

      if (isPoetry) {
          return (
             <div onClick={() => navigate(`/inks-vault/piece/${piece.id}`)} className="bg-[#FAF9F6] p-8 rounded-xl border border-stone-200 hover:border-nobel-gold hover:shadow-lg transition-all cursor-pointer flex flex-col items-center justify-center text-center h-full group">
                <Feather className="text-stone-400 mb-4 group-hover:text-nobel-gold transition-colors" size={24} />
                <h3 className="text-2xl font-serif italic text-ui-blue mb-2 group-hover:text-nobel-gold transition-colors">{piece.title}</h3>
                <p className="text-stone-500 text-sm font-serif mb-4">by {piece.author}</p>
                <div className="w-8 h-px bg-stone-300"></div>
             </div>
          );
      }

      if (isReport) {
           return (
             <div onClick={() => navigate(`/inks-vault/piece/${piece.id}`)} className="bg-slate-50 p-6 rounded-lg border-l-4 border-ui-blue hover:bg-white hover:shadow-md transition-all cursor-pointer h-full group">
                <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-ui-blue bg-blue-100 px-2 py-1 rounded">{piece.role}</span>
                    <FileText size={18} className="text-slate-400 group-hover:text-ui-blue transition-colors"/>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-ui-blue transition-colors">{piece.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2">{piece.summary}</p>
             </div>
           );
      }

      if (isInterview) {
          return (
             <div onClick={() => navigate(`/inks-vault/piece/${piece.id}`)} className="bg-white p-8 rounded-xl border border-slate-200 hover:border-nobel-gold hover:shadow-lg transition-all cursor-pointer h-full relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Mic size={64} />
                </div>
                <h3 className="text-xl font-serif text-ui-blue mb-1 relative z-10">{piece.title}</h3>
                <p className="text-xs font-bold uppercase text-nobel-gold mb-4 relative z-10">with {piece.author}</p>
                <p className="text-slate-600 text-sm relative z-10">{piece.summary}</p>
             </div>
          );
      }

      // Default Card (Article, Blog, Essay, Fiction, Opinion)
      return (
        <div onClick={() => navigate(`/inks-vault/piece/${piece.id}`)} className="bg-white p-8 rounded-xl border border-slate-200 hover:shadow-lg transition-all cursor-pointer h-full group flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{piece.type}</span>
                {piece.type === 'Fiction' && <Book size={16} className="text-slate-300"/>}
                {piece.type === 'Blog' && <User size={16} className="text-slate-300"/>}
                {piece.type === 'Essay' && <PenTool size={16} className="text-slate-300"/>}
                {piece.type === 'Opinion' && <Coffee size={16} className="text-slate-300"/>}
            </div>
            <h3 className="text-2xl font-serif text-ui-blue mb-3 group-hover:text-nobel-gold transition-colors">{piece.title}</h3>
            <p className="text-slate-600 mb-6 leading-relaxed text-sm flex-grow">{piece.summary}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pt-4 border-t border-slate-100">
                <span>By {piece.author}</span>
                <span className="text-slate-300">•</span>
                <span>{new Date(piece.date).toLocaleDateString()}</span>
            </div>
        </div>
      );
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
                        <motion.div key={piece.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
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
