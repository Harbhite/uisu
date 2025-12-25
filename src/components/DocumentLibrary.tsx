/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, FileText, Download, Search, Filter, Check, Upload, X, Star, Volume2, StopCircle, Loader2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

/**
 * Props for the DocumentLibrary component.
 */
interface DocumentLibraryProps {
  /** Callback for navigating back to the previous screen. */
  onBack: () => void;
}

/**
 * Represents a document in the library.
 */
interface Doc {
    /** Unique identifier for the document. */
    id: string;
    /** Title of the document. */
    title: string;
    /** The year the document was created or published. */
    year: number;
    /** The classification of the document. */
    type: 'Constitution' | 'Bill' | 'Manifesto' | 'Speech' | 'Report' | 'Memo';
    /** File size string (e.g., "2.4 MB"). */
    size: string;
    /** Brief description of the document's content. */
    description: string;
    /** URL to the document file */
    file_url?: string;
}

/**
 * A component displaying a library of historical documents.
 * Features include searching, filtering by decade and type, text-to-speech narration, and file uploading.
 *
 * @param {DocumentLibraryProps} props - The component props.
 * @returns {JSX.Element} The rendered DocumentLibrary component.
 */
export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({ onBack }) => {
    const [documents, setDocuments] = useState<Doc[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDecade, setSelectedDecade] = useState<string>("All");
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    
    // Audio State
    const [playingDocId, setPlayingDocId] = useState<string | null>(null);
    const synthesisRef = useRef<SpeechSynthesis | null>(null);
    
    // Form State
    const [newTitle, setNewTitle] = useState("");
    const [newYear, setNewYear] = useState("");
    const [newType, setNewType] = useState("Report");
    const [newDesc, setNewDesc] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const decades = ["All", "2020s", "2010s", "2000s", "1990s", "1980s", "1970s", "1960s", "1950s"];
    const docTypes = ['Constitution', 'Bill', 'Manifesto', 'Speech', 'Report', 'Memo'];

    // Fetch documents from database
    useEffect(() => {
        const fetchDocuments = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('documents')
                    .select('*')
                    .order('year', { ascending: false });
                
                if (error) throw error;
                
                const formattedDocs: Doc[] = (data || []).map(doc => ({
                    id: doc.id,
                    title: doc.title,
                    year: doc.year,
                    type: doc.doc_type as Doc['type'],
                    size: doc.file_size || 'N/A',
                    description: doc.description || '',
                    file_url: doc.file_url || undefined,
                }));
                
                setDocuments(formattedDocs);
            } catch (error) {
                console.error('Error fetching documents:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, []);

    // Initialize Speech Synthesis
    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            synthesisRef.current = window.speechSynthesis;
        }
        // Cleanup on unmount
        return () => {
            if (synthesisRef.current) {
                synthesisRef.current.cancel();
            }
        };
    }, []);

    const toggleSpeech = (doc: Doc) => {
        if (!synthesisRef.current) return;

        // If currently playing this document, stop it
        if (playingDocId === doc.id) {
            synthesisRef.current.cancel();
            setPlayingDocId(null);
            return;
        }

        // Stop any other playing
        synthesisRef.current.cancel();

        const text = `Title: ${doc.title}. Description: ${doc.description}`;
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Optional: Try to find a good English voice
        const voices = synthesisRef.current.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google US English')) || voices.find(v => v.lang.startsWith('en'));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.onend = () => setPlayingDocId(null);
        utterance.onerror = () => setPlayingDocId(null);

        synthesisRef.current.speak(utterance);
        setPlayingDocId(doc.id);
    };

    const toggleType = (type: string) => {
        setSelectedTypes(prev => 
            prev.includes(type) 
                ? prev.filter(t => t !== type) 
                : [...prev, type]
        );
    };

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        setTimeout(() => {
            const newDoc: Doc = {
                id: (documents.length + 1).toString() + Date.now(),
                title: newTitle,
                year: parseInt(newYear) || new Date().getFullYear(),
                type: newType as any,
                size: "1.5 MB",
                description: newDesc
            };
            setDocuments([newDoc, ...documents]);
            setIsUploading(false);
            setIsUploadModalOpen(false);
            setNewTitle(""); setNewYear(""); setNewType("Report"); setNewDesc("");
        }, 2000);
    };

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              doc.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDecade = selectedDecade === "All" || (() => {
             const startYear = parseInt(selectedDecade.replace("s", ""));
             const endYear = startYear + 9;
             return doc.year >= startYear && doc.year <= endYear;
        })();
        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(doc.type);
        return matchesSearch && matchesDecade && matchesType;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-nobel-gold" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-32 pb-16">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-start">
                     <button 
                        onClick={onBack}
                        className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors mb-12"
                    >
                        <div className="p-2 rounded-full border border-border group-hover:border-nobel-gold transition-colors">
                            <ArrowLeft size={14} />
                        </div>
                        <span>Back to Home</span>
                    </button>

                     <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsUploadModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-ui-blue text-white rounded-full shadow-lg hover:bg-nobel-gold hover:text-foreground transition-all text-xs font-bold uppercase tracking-widest"
                    >
                        <Upload size={14} /> Upload
                    </motion.button>
                </div>

                <div className="mb-20">
                     <div className="flex items-center gap-4 mb-4">
                        <Star className="text-nobel-gold w-6 h-6" fill="currentColor" />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">Repository</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-serif text-ui-blue leading-[0.9] mb-6">
                        Document <br/> <span className="italic text-muted-foreground">Library</span>
                    </h1>
                    <p className="text-xl text-muted-foreground font-light max-w-2xl">
                        The primary sources of our history. Digitized for posterity.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 items-start">
                    {/* Sidebar Filters */}
                    <div className="w-full lg:w-72 flex-shrink-0 space-y-8 sticky top-32">
                        
                        {/* Search */}
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-4 pr-10 py-3 bg-transparent border-b-2 border-border focus:border-nobel-gold focus:outline-none font-serif text-lg text-foreground placeholder-muted-foreground transition-colors"
                            />
                            <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-4 text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em]">
                                <Filter size={12} /> Timeline
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {decades.map(decade => (
                                    <button
                                        key={decade}
                                        onClick={() => setSelectedDecade(decade)}
                                        className={`px-3 py-1 text-xs font-bold rounded-full transition-all relative z-10 ${selectedDecade === decade ? 'text-white' : 'text-muted-foreground hover:bg-muted'}`}
                                    >
                                        {/* MICRO-ANIMATION 8: Sliding Filter Background */}
                                        {selectedDecade === decade && (
                                            <motion.span 
                                                layoutId="activeDecade"
                                                className="absolute inset-0 bg-ui-blue rounded-full -z-10"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        {decade}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4 text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em]">
                                <div className="flex items-center gap-2"><FileText size={12} /> Doc Type</div>
                                {selectedTypes.length > 0 && (
                                    <button onClick={() => setSelectedTypes([])} className="text-destructive hover:text-destructive/80">Reset</button>
                                )}
                            </div>
                            <div className="space-y-3">
                                {docTypes.map(type => {
                                    const isSelected = selectedTypes.includes(type);
                                    return (
                                        <button
                                            key={type}
                                            onClick={() => toggleType(type)}
                                            className={`flex items-center gap-3 group w-full text-left`}
                                        >
                                            <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all ${isSelected ? 'bg-nobel-gold border-nobel-gold' : 'border-border group-hover:border-muted-foreground'}`}>
                                                {isSelected && <Check size={10} className="text-white" />}
                                            </div>
                                            <span className={`text-sm transition-colors ${isSelected ? 'text-ui-blue font-bold' : 'text-muted-foreground group-hover:text-foreground'}`}>{type}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 w-full">
                        <div className="grid grid-cols-1 gap-6">
                            {filteredDocs.length > 0 ? (
                                filteredDocs.map((doc) => (
                                    <motion.div 
                                        key={doc.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="group bg-card p-8 border border-border hover:border-muted-foreground hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative overflow-hidden"
                                    >
                                        {/* Active playing indicator strip */}
                                        {playingDocId === doc.id && (
                                            <motion.div 
                                                layoutId="playingStrip"
                                                className="absolute left-0 top-0 bottom-0 w-1 bg-nobel-gold"
                                            />
                                        )}

                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{doc.type}</span>
                                                <div className="w-1 h-1 rounded-full bg-border"></div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-nobel-gold">{doc.year}</span>
                                            </div>
                                            <h3 className={`font-serif text-2xl mb-2 transition-colors ${playingDocId === doc.id ? 'text-nobel-gold' : 'text-ui-blue group-hover:text-nobel-gold'}`}>
                                                {doc.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground font-light max-w-lg">{doc.description}</p>
                                        </div>
                                        
                                        <div className="shrink-0 flex items-center gap-3">
                                            <button 
                                                onClick={() => toggleSpeech(doc)}
                                                className={`flex items-center gap-2 w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-3 rounded-full md:rounded-none transition-all ${playingDocId === doc.id ? 'bg-nobel-gold text-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'} justify-center`}
                                                title={playingDocId === doc.id ? "Stop Narration" : "Read Aloud"}
                                            >
                                                {playingDocId === doc.id ? (
                                                    <>
                                                        <StopCircle size={16} /> 
                                                        <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">Stop</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Volume2 size={16} />
                                                        <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">Listen</span>
                                                    </>
                                                )}
                                            </button>

                                            <button className="flex items-center gap-2 px-6 py-3 bg-muted hover:bg-ui-blue hover:text-white text-foreground text-xs font-bold uppercase tracking-widest transition-all">
                                                <Download size={14} /> <span className="hidden md:inline">Download</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="py-24 text-center border border-dashed border-border">
                                    <p className="text-muted-foreground font-serif italic text-lg">No documents found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {isUploadModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/90 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-background w-full max-w-lg shadow-2xl overflow-hidden"
                        >
                            <div className="flex justify-between items-center p-8 border-b border-border">
                                <h3 className="font-serif text-3xl text-ui-blue">Upload</h3>
                                <button onClick={() => setIsUploadModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleUpload} className="p-8 space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Title</label>
                                    <input 
                                        type="text" 
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-card border border-border focus:border-nobel-gold focus:outline-none transition-colors"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Year</label>
                                        <input 
                                            type="number" 
                                            value={newYear}
                                            onChange={(e) => setNewYear(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 bg-card border border-border focus:border-nobel-gold focus:outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Type</label>
                                        <select 
                                            value={newType}
                                            onChange={(e) => setNewType(e.target.value)}
                                            className="w-full px-4 py-3 bg-card border border-border focus:border-nobel-gold focus:outline-none transition-colors"
                                        >
                                            {docTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Description</label>
                                    <textarea 
                                        value={newDesc}
                                        onChange={(e) => setNewDesc(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-card border border-border focus:border-nobel-gold focus:outline-none transition-colors resize-none"
                                    />
                                </div>

                                <div className="pt-4">
                                    <button 
                                        type="submit"
                                        disabled={isUploading}
                                        className="w-full py-4 bg-ui-blue text-white font-bold uppercase tracking-[0.2em] hover:bg-nobel-gold hover:text-foreground transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isUploading ? 'Uploading...' : 'Submit to Archive'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}