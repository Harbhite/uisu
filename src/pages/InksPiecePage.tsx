import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Tag, Share2, Printer, Bookmark, Clock, Feather, Mic, FileText, Quote } from 'lucide-react';
import { inksPieces, InksPiece } from '@/lib/data';
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

    const renderView = () => {
        switch (piece.type) {
            case 'Poetry':
                return <PoetryView piece={piece} />;
            case 'Report':
                return <ReportView piece={piece} />;
            case 'Fiction':
                return <FictionView piece={piece} />;
            case 'Opinion':
                return <OpinionView piece={piece} />;
            case 'Interview':
                return <InterviewView piece={piece} />;
            case 'Essay':
                return <EssayView piece={piece} />;
            case 'Blog':
                return <BlogView piece={piece} />;
            default:
                return <ArticleView piece={piece} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20">
             <div className="container mx-auto px-6">
                 <button
                    onClick={() => navigate('/inks-vault')}
                    className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors mb-12"
                >
                    <div className="p-2 rounded-full border border-slate-300 group-hover:border-nobel-gold transition-colors">
                        <ArrowLeft size={14} />
                    </div>
                    <span>Back to Vault</span>
                </button>
            </div>
            {renderView()}
        </div>
    );
};

// --- Sub-components for distinct views ---

const ArticleView = ({ piece }: { piece: InksPiece }) => (
    <article className="container mx-auto px-6 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 md:p-12 rounded-lg shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-6 text-ui-blue">
                <span className="px-3 py-1 bg-ui-blue/10 rounded-full text-xs font-bold uppercase tracking-widest">{piece.type}</span>
                <span className="text-slate-300">|</span>
                <span className="text-xs font-medium text-slate-500">{piece.role}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 mb-6 leading-tight">{piece.title}</h1>
            <div className="flex items-center justify-between border-y border-slate-100 py-4 mb-8">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">{piece.author.charAt(0)}</div>
                     <div>
                         <div className="text-sm font-bold text-slate-900">{piece.author}</div>
                         <div className="text-xs text-slate-500">{new Date(piece.date).toLocaleDateString()}</div>
                     </div>
                 </div>
                 <div className="flex gap-2 text-slate-400">
                     <Bookmark size={20} className="hover:text-ui-blue cursor-pointer" />
                     <Share2 size={20} className="hover:text-ui-blue cursor-pointer" />
                 </div>
            </div>
            <div className="prose prose-lg prose-slate max-w-none font-serif leading-relaxed" dangerouslySetInnerHTML={{ __html: piece.content }} />
        </motion.div>
    </article>
);

const PoetryView = ({ piece }: { piece: InksPiece }) => (
    <article className="container mx-auto px-6 max-w-2xl">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#FAF9F6] p-12 md:p-20 rounded-sm shadow-lg border border-stone-200 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-nobel-gold"></div>
            <Feather className="mx-auto text-nobel-gold mb-8" size={32} />
            <h1 className="text-4xl md:text-6xl font-serif italic text-ui-blue mb-4">{piece.title}</h1>
            <div className="w-16 h-px bg-stone-300 mx-auto mb-6"></div>
            <p className="text-sm font-serif text-stone-500 mb-12">By {piece.author}</p>
            <div className="prose prose-xl prose-p:font-serif prose-p:italic text-stone-800 leading-loose" dangerouslySetInnerHTML={{ __html: piece.content }} />
            <div className="mt-16 pt-8 border-t border-stone-200 flex justify-center gap-4 text-xs font-bold uppercase tracking-widest text-stone-400">
                {piece.tags?.map(t => <span key={t}>#{t}</span>)}
            </div>
        </motion.div>
    </article>
);

const ReportView = ({ piece }: { piece: InksPiece }) => (
    <article className="container mx-auto px-6 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-8 md:p-12">
                <div className="flex items-center gap-2 mb-4 text-nobel-gold">
                    <FileText size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">Official Report</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4 font-sans">{piece.title}</h1>
                <div className="flex gap-6 text-sm text-slate-400 font-mono">
                    <span>DATE: {new Date(piece.date).toLocaleDateString().toUpperCase()}</span>
                    <span>AUTHOR: {piece.author.toUpperCase()}</span>
                    <span>ID: {piece.id.toUpperCase()}</span>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="md:col-span-2 p-8 md:p-12 border-r border-slate-100">
                    <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: piece.content }} />
                </div>
                <div className="bg-slate-50 p-8 border-t md:border-t-0">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-4">Summary</h3>
                    <p className="text-sm text-slate-600 mb-8 leading-relaxed">{piece.summary}</p>

                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-4">Metadata</h3>
                    <ul className="space-y-2 text-sm text-slate-600 mb-8">
                        <li className="flex justify-between border-b border-slate-200 pb-1"><span>Role</span> <span className="font-medium">{piece.role}</span></li>
                        <li className="flex justify-between border-b border-slate-200 pb-1"><span>Type</span> <span className="font-medium">{piece.type}</span></li>
                    </ul>
                    <Button className="w-full gap-2" variant="outline"><Printer size={16}/> Print Report</Button>
                </div>
            </div>
        </motion.div>
    </article>
);

const OpinionView = ({ piece }: { piece: InksPiece }) => (
    <article className="container mx-auto px-6 max-w-3xl">
        <div className="relative mb-12 py-12 bg-ui-blue text-white rounded-xl p-8 md:p-16 overflow-hidden">
            <Quote size={120} className="absolute -right-6 -bottom-6 text-white/5 rotate-180" />
            <span className="relative z-10 px-3 py-1 bg-nobel-gold text-ui-blue text-xs font-bold uppercase tracking-widest rounded mb-6 inline-block">Opinion</span>
            <h1 className="relative z-10 text-3xl md:text-5xl font-bold leading-tight mb-6">"{piece.title}"</h1>
            <div className="relative z-10 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl">💬</div>
                 <div>
                     <div className="font-bold">{piece.author}</div>
                     <div className="text-white/60 text-sm">{piece.role}</div>
                 </div>
            </div>
        </div>
        <div className="prose prose-lg prose-slate mx-auto first-letter:text-5xl first-letter:font-bold first-letter:text-nobel-gold first-letter:mr-3 first-letter:float-left" dangerouslySetInnerHTML={{ __html: piece.content }} />
    </article>
);

const InterviewView = ({ piece }: { piece: InksPiece }) => (
    <article className="container mx-auto px-6 max-w-4xl">
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
            <div className="bg-ui-blue text-white p-6 rounded-lg md:w-1/3 shrink-0">
                <Mic size={32} className="mb-4 text-nobel-gold" />
                <h3 className="text-lg font-bold mb-2">The Conversation</h3>
                <p className="text-white/70 text-sm mb-4">An exclusive sit-down exploring key issues.</p>
                <div className="border-t border-white/10 pt-4 mt-4">
                    <p className="text-xs uppercase tracking-widest text-white/50 mb-1">Guest</p>
                    <p className="font-bold">{piece.author}</p>
                </div>
            </div>
            <div>
                 <h1 className="text-4xl md:text-5xl font-serif text-ui-blue mb-4 leading-none">{piece.title}</h1>
                 <p className="text-xl text-slate-500 font-light leading-relaxed">{piece.summary}</p>
            </div>
        </div>
        <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-100 shadow-sm">
             <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: piece.content }} />
        </div>
    </article>
);

const FictionView = ({ piece }: { piece: InksPiece }) => (
    <article className="container mx-auto px-6 max-w-2xl">
         <div className="bg-[#FFFBF0] p-12 md:p-16 shadow-2xl border-l-8 border-[#8B4513] relative min-h-screen">
             <div className="absolute top-8 right-8 text-[#8B4513]/20 font-serif text-6xl font-bold opacity-50 select-none">1</div>
             <h1 className="text-4xl md:text-5xl font-serif text-[#5D4037] mb-8 mt-4">{piece.title}</h1>
             <div className="flex items-center gap-2 text-[#8B4513] text-sm font-bold uppercase tracking-widest mb-12">
                 <span>By {piece.author}</span>
                 <span className="w-4 h-px bg-[#8B4513]"></span>
                 <span>Short Story</span>
             </div>
             <div className="prose prose-lg prose-p:font-serif prose-headings:font-serif text-[#4E342E] leading-loose indent-8" dangerouslySetInnerHTML={{ __html: piece.content }} />
             <div className="mt-16 flex justify-center">
                 <span className="text-[#8B4513] text-2xl">***</span>
             </div>
         </div>
    </article>
);

const EssayView = ({ piece }: { piece: InksPiece }) => (
    <article className="container mx-auto px-6 max-w-3xl">
        <div className="mb-16 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 mb-4 inline-block">Academic Essay</span>
            <h1 className="text-4xl md:text-5xl font-serif text-slate-900 mb-6">{piece.title}</h1>
            <div className="w-24 h-1 bg-ui-blue mx-auto mb-6"></div>
            <p className="text-slate-500 italic">By {piece.author}</p>
        </div>
        <div className="prose prose-xl prose-slate mx-auto font-serif" dangerouslySetInnerHTML={{ __html: piece.content }} />
        <div className="mt-16 bg-slate-50 p-8 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2">Abstract</h4>
            <p className="text-slate-600 text-sm leading-relaxed">{piece.summary}</p>
        </div>
    </article>
);

const BlogView = ({ piece }: { piece: InksPiece }) => (
    <article className="container mx-auto px-6 max-w-4xl">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
             <div className="md:col-span-1">
                 <div className="sticky top-32">
                     <div className="w-20 h-20 rounded-full bg-slate-200 mb-4 overflow-hidden">
                          {/* Placeholder avatar */}
                          <div className="w-full h-full bg-gradient-to-br from-nobel-gold to-yellow-500"></div>
                     </div>
                     <p className="font-bold text-slate-900">{piece.author}</p>
                     <p className="text-xs text-slate-500 uppercase tracking-wide mb-6">{piece.role}</p>
                     <div className="text-sm text-slate-600 mb-6">
                         <p>Student at University of Ibadan. Exploring campus life one day at a time.</p>
                     </div>
                     <Button size="sm" variant="outline" className="w-full">Follow</Button>
                 </div>
             </div>
             <div className="md:col-span-3">
                 <div className="mb-8">
                     <span className="text-nobel-gold text-xs font-bold uppercase tracking-widest mb-2 block">{new Date(piece.date).toLocaleDateString()}</span>
                     <h1 className="text-4xl font-bold text-slate-900 mb-6">{piece.title}</h1>
                     <div className="flex gap-2">
                         {piece.tags?.map(t => (
                             <span key={t} className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">#{t}</span>
                         ))}
                     </div>
                 </div>
                 <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: piece.content }} />

                 {/* Comments Section Placeholder */}
                 <div className="mt-16 pt-8 border-t border-slate-100">
                     <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><MessageCircle size={18}/> Comments</h3>
                     <div className="bg-slate-50 p-4 rounded text-sm text-slate-500 text-center">
                         Login to post a comment.
                     </div>
                 </div>
             </div>
         </div>
    </article>
);

export default InksPiecePage;
