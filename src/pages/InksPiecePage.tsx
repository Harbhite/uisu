import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Tag, Share2 } from 'lucide-react';
import { inksPieces } from '@/lib/data';
import { Button } from '@/components/ui/button';

const InksPiecePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const piece = inksPieces.find(p => p.id === id);

    if (!piece) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h2 className="text-3xl font-serif text-ui-blue mb-4">Piece Not Found</h2>
                    <Button onClick={() => navigate('/inks-vault')} variant="outline">
                        Return to Vault
                    </Button>
                </div>
            </div>
        );
    }

    // Dynamic styling based on type
    const isPoetry = piece.type === 'Poetry';
    const isReport = piece.type === 'Report';
    const isFiction = piece.type === 'Fiction';

    return (
        <article className="min-h-screen bg-slate-50 pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-4xl">
                 <button
                    onClick={() => navigate('/inks-vault')}
                    className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors mb-12"
                >
                    <div className="p-2 rounded-full border border-slate-300 group-hover:border-nobel-gold transition-colors">
                        <ArrowLeft size={14} />
                    </div>
                    <span>Back to Vault</span>
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${isPoetry ? 'text-center p-12 md:p-20' : 'p-8 md:p-16'}`}
                >
                    <div className="mb-8">
                         <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6 ${
                            isReport ? 'bg-slate-100 text-slate-600' : 'bg-ui-blue/5 text-ui-blue'
                         }`}>
                            {piece.type}
                         </span>

                         <h1 className={`font-serif text-ui-blue mb-6 leading-tight ${isPoetry ? 'text-4xl md:text-6xl italic' : 'text-3xl md:text-5xl'}`}>
                            {piece.title}
                         </h1>

                         <div className={`flex flex-wrap gap-6 text-sm text-slate-500 ${isPoetry ? 'justify-center' : ''}`}>
                            <div className="flex items-center gap-2">
                                <User size={16} className="text-nobel-gold" />
                                <span className="font-medium text-slate-900">{piece.author}</span>
                                <span className="text-slate-300">•</span>
                                <span>{piece.role}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-nobel-gold" />
                                <span>{new Date(piece.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                         </div>
                    </div>

                    {/* Content */}
                    <div className={`prose prose-lg prose-slate max-w-none ${isPoetry ? 'prose-p:font-serif prose-p:text-xl prose-p:leading-relaxed' : ''} ${isFiction ? 'font-serif' : ''}`}>
                        <div dangerouslySetInnerHTML={{ __html: piece.content }} />
                    </div>

                    {/* Tags & Footer */}
                    <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Tag size={16} className="text-slate-400" />
                            {piece.tags?.map(tag => (
                                <span key={tag} className="text-xs bg-slate-50 text-slate-600 px-3 py-1 rounded-md border border-slate-200">
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        <Button variant="ghost" className="gap-2 text-slate-500 hover:text-ui-blue">
                            <Share2 size={16} /> Share Piece
                        </Button>
                    </div>
                </motion.div>
            </div>
        </article>
    );
};

export default InksPiecePage;
