/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, FileText, Download, Search, Filter, Check, Upload, X, Star, Volume2, StopCircle, Loader2, File, FileType, FileType2, ScrollText, FileCheck, FileWarning, Eye, ExternalLink } from 'lucide-react';
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
    const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);
    
    // Audio State
    const [playingDocId, setPlayingDocId] = useState<string | null>(null);
    const synthesisRef = useRef<SpeechSynthesis | null>(null);
    
    // Form State
    const [newTitle, setNewTitle] = useState("");
    const [newYear, setNewYear] = useState("");
    const [newType, setNewType] = useState("Report");
    const [newDesc, setNewDesc] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        
        try {
            let fileUrl: string | null = null;
            let fileSize: string = 'N/A';
            
            // Upload file to storage if selected
            if (selectedFile) {
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('documents')
                    .upload(fileName, selectedFile);
                
                if (uploadError) throw uploadError;
                
                // Get public URL
                const { data: urlData } = supabase.storage
                    .from('documents')
                    .getPublicUrl(fileName);
                
                fileUrl = urlData.publicUrl;
                fileSize = `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`;
            }
            
            // Insert document record into database
            const { data: newDocData, error: insertError } = await supabase
                .from('documents')
                .insert({
                    title: newTitle,
                    year: parseInt(newYear) || new Date().getFullYear(),
                    doc_type: newType,
                    description: newDesc,
                    file_url: fileUrl,
                    file_size: fileSize,
                })
                .select()
                .single();
            
            if (insertError) throw insertError;
            
            // Add to local state
            const newDoc: Doc = {
                id: newDocData.id,
                title: newDocData.title,
                year: newDocData.year,
                type: newDocData.doc_type as Doc['type'],
                size: newDocData.file_size || 'N/A',
                description: newDocData.description || '',
                file_url: newDocData.file_url || undefined,
            };
            
            setDocuments([newDoc, ...documents]);
            setIsUploadModalOpen(false);
            setNewTitle(""); 
            setNewYear(""); 
            setNewType("Report"); 
            setNewDesc("");
            setSelectedFile(null);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload document. Please try again.');
        } finally {
            setIsUploading(false);
        }
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

                                        <div className="flex items-start gap-4 flex-1">
                                            {/* File Type Icon */}
                                            <div className={`shrink-0 w-14 h-14 rounded-lg flex items-center justify-center ${
                                                doc.type === 'Constitution' ? 'bg-ui-blue/10 text-ui-blue' :
                                                doc.type === 'Bill' ? 'bg-purple-100 text-purple-600' :
                                                doc.type === 'Manifesto' ? 'bg-nobel-gold/20 text-nobel-gold' :
                                                doc.type === 'Speech' ? 'bg-green-100 text-green-600' :
                                                doc.type === 'Report' ? 'bg-orange-100 text-orange-600' :
                                                'bg-muted text-muted-foreground'
                                            }`}>
                                                {doc.type === 'Constitution' && <ScrollText size={24} />}
                                                {doc.type === 'Bill' && <FileCheck size={24} />}
                                                {doc.type === 'Manifesto' && <FileType size={24} />}
                                                {doc.type === 'Speech' && <FileType2 size={24} />}
                                                {doc.type === 'Report' && <FileText size={24} />}
                                                {doc.type === 'Memo' && <File size={24} />}
                                            </div>
                                            
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{doc.type}</span>
                                                    <div className="w-1 h-1 rounded-full bg-border"></div>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-nobel-gold">{doc.year}</span>
                                                    {doc.file_url && (
                                                        <>
                                                            <div className="w-1 h-1 rounded-full bg-border"></div>
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-green-600">
                                                                {doc.file_url.split('.').pop()?.toUpperCase() || 'FILE'}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                <h3 className={`font-serif text-2xl mb-2 transition-colors ${playingDocId === doc.id ? 'text-nobel-gold' : 'text-ui-blue group-hover:text-nobel-gold'}`}>
                                                    {doc.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground font-light max-w-lg">{doc.description}</p>
                                            </div>
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

                                            {doc.file_url ? (
                                                <>
                                                    {doc.file_url.toLowerCase().endsWith('.pdf') && (
                                                        <button 
                                                            onClick={() => setPreviewDoc(doc)}
                                                            className="flex items-center gap-2 px-4 py-3 bg-muted hover:bg-nobel-gold hover:text-foreground text-foreground text-xs font-bold uppercase tracking-widest transition-all"
                                                        >
                                                            <Eye size={14} /> <span className="hidden md:inline">Preview</span>
                                                        </button>
                                                    )}
                                                    <a 
                                                        href={doc.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        download
                                                        className="flex items-center gap-2 px-6 py-3 bg-muted hover:bg-ui-blue hover:text-white text-foreground text-xs font-bold uppercase tracking-widest transition-all"
                                                    >
                                                        <Download size={14} /> <span className="hidden md:inline">Download</span>
                                                    </a>
                                                </>
                                            ) : (
                                                <button 
                                                    disabled
                                                    className="flex items-center gap-2 px-6 py-3 bg-muted text-muted-foreground text-xs font-bold uppercase tracking-widest cursor-not-allowed opacity-50"
                                                >
                                                    <Download size={14} /> <span className="hidden md:inline">No File</span>
                                                </button>
                                            )}
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

                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Document File</label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx,.txt"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full px-4 py-3 bg-card border border-dashed border-border hover:border-nobel-gold focus:border-nobel-gold focus:outline-none transition-colors text-left"
                                    >
                                        {selectedFile ? (
                                            <span className="text-foreground">{selectedFile.name}</span>
                                        ) : (
                                            <span className="text-muted-foreground">Click to select a file...</span>
                                        )}
                                    </button>
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

            {/* PDF Preview Modal */}
            <AnimatePresence>
                {previewDoc && previewDoc.file_url && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/90 backdrop-blur-sm"
                        onClick={() => setPreviewDoc(null)}
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-background w-full max-w-5xl h-[85vh] shadow-2xl overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center p-4 border-b border-border">
                                <div className="flex-1">
                                    <h3 className="font-serif text-xl text-ui-blue truncate">{previewDoc.title}</h3>
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest">
                                        {previewDoc.type} • {previewDoc.year}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <a 
                                        href={previewDoc.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-ui-blue hover:text-white text-foreground text-xs font-bold uppercase tracking-widest transition-all rounded"
                                    >
                                        <ExternalLink size={14} /> Open
                                    </a>
                                    <a 
                                        href={previewDoc.file_url}
                                        download
                                        className="flex items-center gap-2 px-4 py-2 bg-ui-blue text-white text-xs font-bold uppercase tracking-widest hover:bg-nobel-gold hover:text-foreground transition-all rounded"
                                    >
                                        <Download size={14} /> Download
                                    </a>
                                    <button 
                                        onClick={() => setPreviewDoc(null)} 
                                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex-1 bg-muted">
                                <iframe 
                                    src={`${previewDoc.file_url}#toolbar=1&navpanes=0`}
                                    className="w-full h-full border-0"
                                    title={`Preview of ${previewDoc.title}`}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}