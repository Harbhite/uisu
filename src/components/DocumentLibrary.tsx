/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, FileText, Download, Search, Filter, Check, Upload, X, Star, Volume2, StopCircle, Loader2, File, FileType, FileType2, ScrollText, FileCheck, FileWarning, Eye, ExternalLink, LogIn, Tag, FileImage, FileCode, FileSpreadsheet, Share2, Link, Copy, CheckCircle, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
    /** Tags for categorization */
    tags?: string[];
    /** Share token for public sharing */
    share_token?: string;
    /** Whether the document is publicly accessible */
    is_public?: boolean;
    /** ID of the user who uploaded the document */
    uploaded_by?: string;
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
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);
    const [shareModalDoc, setShareModalDoc] = useState<Doc | null>(null);
    const [copiedLink, setCopiedLink] = useState(false);
    
    // Auth State
    const [user, setUser] = useState<User | null>(null);
    const [isStaff, setIsStaff] = useState(false);
    const navigate = useNavigate();
    
    // Drag and drop state
    const [isDragging, setIsDragging] = useState(false);
    
    // Audio State
    const [playingDocId, setPlayingDocId] = useState<string | null>(null);
    const synthesisRef = useRef<SpeechSynthesis | null>(null);
    
    // Form State
    const [newTitle, setNewTitle] = useState("");
    const [newYear, setNewYear] = useState("");
    const [newType, setNewType] = useState("Report");
    const [newDesc, setNewDesc] = useState("");
    const [newTags, setNewTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const decades = ["All", "2020s", "2010s", "2000s", "1990s", "1980s", "1970s", "1960s", "1950s"];
    const docTypes = ['Constitution', 'Bill', 'Manifesto', 'Speech', 'Report', 'Memo'];
    const availableTags = ['governance', 'official', 'legislation', 'political', 'historical', 'archive', 'general'];

    // Helper to get file extension icon
    const getFileExtensionIcon = (fileUrl?: string) => {
        if (!fileUrl) return null;
        const ext = fileUrl.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf':
                return <FileText className="w-4 h-4 text-red-500" />;
            case 'doc':
            case 'docx':
                return <FileType className="w-4 h-4 text-blue-500" />;
            case 'txt':
                return <FileCode className="w-4 h-4 text-gray-500" />;
            case 'xls':
            case 'xlsx':
                return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
            default:
                return <File className="w-4 h-4 text-muted-foreground" />;
        }
    };

    const getFileExtension = (fileUrl?: string) => {
        if (!fileUrl) return null;
        return fileUrl.split('.').pop()?.toUpperCase() || 'FILE';
    };

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
                    tags: doc.tags || [],
                    share_token: (doc as any).share_token || undefined,
                    is_public: (doc as any).is_public || false,
                    uploaded_by: doc.uploaded_by || undefined,
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

    // Check auth state and staff status
    useEffect(() => {
        const checkStaffStatus = async (userId: string) => {
            try {
                const { data, error } = await supabase.rpc('is_moderator_or_admin', { _user_id: userId });
                if (error) throw error;
                setIsStaff(data === true);
            } catch (error) {
                console.error('Error checking staff status:', error);
                setIsStaff(false);
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user ?? null);
                if (session?.user) {
                    setTimeout(() => {
                        checkStaffStatus(session.user.id);
                    }, 0);
                } else {
                    setIsStaff(false);
                }
            }
        );

        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                checkStaffStatus(session.user.id);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Drag and drop handlers
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (user) {
            setIsDragging(true);
        }
    }, [user]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (!user) {
            toast.error('Please log in to upload documents');
            return;
        }

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
            if (validTypes.includes(file.type) || file.name.match(/\.(pdf|doc|docx|txt)$/i)) {
                setSelectedFile(file);
                setIsUploadModalOpen(true);
                toast.info(`File "${file.name}" ready to upload. Please fill in the details.`);
            } else {
                toast.error('Please upload a PDF, DOC, DOCX, or TXT file');
            }
        }
    }, [user]);

    const handleUploadClick = () => {
        if (!user) {
            toast.error('Please log in to upload documents');
            navigate('/auth');
            return;
        }
        setIsUploadModalOpen(true);
    };

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

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => 
            prev.includes(tag) 
                ? prev.filter(t => t !== tag) 
                : [...prev, tag]
        );
    };

    const addNewTag = () => {
        const trimmedTag = tagInput.trim().toLowerCase();
        if (trimmedTag && !newTags.includes(trimmedTag)) {
            setNewTags([...newTags, trimmedTag]);
            setTagInput("");
        }
    };

    const removeNewTag = (tag: string) => {
        setNewTags(newTags.filter(t => t !== tag));
    };

    const generateShareToken = () => {
        return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;
    };

    const handleShare = async (doc: Doc) => {
        if (!user) {
            toast.error('Please log in to share documents');
            return;
        }

        setShareModalDoc(doc);
        setCopiedLink(false);

        // If no share token exists, generate one
        if (!doc.share_token) {
            const shareToken = generateShareToken();
            try {
                const { error } = await supabase
                    .from('documents')
                    .update({ share_token: shareToken, is_public: true })
                    .eq('id', doc.id);

                if (error) throw error;

                // Update local state
                setDocuments(prev => prev.map(d => 
                    d.id === doc.id ? { ...d, share_token: shareToken, is_public: true } : d
                ));
                setShareModalDoc({ ...doc, share_token: shareToken, is_public: true });
            } catch (error) {
                console.error('Error generating share link:', error);
                toast.error('Failed to generate share link');
            }
        }
    };

    const getShareUrl = (doc: Doc) => {
        if (!doc.share_token) return '';
        return `${window.location.origin}/documents?share=${doc.share_token}`;
    };

    const copyShareLink = async (doc: Doc) => {
        const url = getShareUrl(doc);
        try {
            await navigator.clipboard.writeText(url);
            setCopiedLink(true);
            toast.success('Link copied to clipboard!');
            setTimeout(() => setCopiedLink(false), 3000);
        } catch (error) {
            toast.error('Failed to copy link');
        }
    };

    const revokeShareLink = async (doc: Doc) => {
        try {
            const { error } = await supabase
                .from('documents')
                .update({ share_token: null, is_public: false })
                .eq('id', doc.id);

            if (error) throw error;

            setDocuments(prev => prev.map(d => 
                d.id === doc.id ? { ...d, share_token: undefined, is_public: false } : d
            ));
            setShareModalDoc(null);
            toast.success('Share link revoked');
        } catch (error) {
            console.error('Error revoking share link:', error);
            toast.error('Failed to revoke share link');
        }
    };

    const handleDelete = async (doc: Doc) => {
        if (!user) {
            toast.error('Please log in to delete documents');
            return;
        }

        if (!confirm(`Are you sure you want to delete "${doc.title}"? This action cannot be undone.`)) {
            return;
        }

        try {
            // Delete from storage if file exists
            if (doc.file_url) {
                const fileName = doc.file_url.split('/').pop();
                if (fileName) {
                    await supabase.storage.from('documents').remove([fileName]);
                }
            }

            // Delete from database
            const { error } = await supabase
                .from('documents')
                .delete()
                .eq('id', doc.id);

            if (error) throw error;

            // Update local state
            setDocuments(prev => prev.filter(d => d.id !== doc.id));
            toast.success('Document deleted successfully');
        } catch (error) {
            console.error('Error deleting document:', error);
            toast.error('Failed to delete document. You can only delete documents you uploaded.');
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user) {
            toast.error('Please log in to upload documents');
            return;
        }

        if (!selectedFile) {
            toast.error('Please select a file to upload');
            return;
        }
        
        setIsUploading(true);
        
        try {
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
            
            const fileUrl = urlData.publicUrl;
            const fileSize = `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`;
            
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
                    tags: newTags.length > 0 ? newTags : null,
                    uploaded_by: user?.id,
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
                tags: newDocData.tags || [],
                share_token: (newDocData as any).share_token || undefined,
                is_public: (newDocData as any).is_public || false,
            };
            
            setDocuments([newDoc, ...documents]);
            setIsUploadModalOpen(false);
            setNewTitle(""); 
            setNewYear(""); 
            setNewType("Report"); 
            setNewDesc("");
            setNewTags([]);
            setSelectedFile(null);
            toast.success('Document uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload document. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
        const matchesDecade = selectedDecade === "All" || (() => {
             const startYear = parseInt(selectedDecade.replace("s", ""));
             const endYear = startYear + 9;
             return doc.year >= startYear && doc.year <= endYear;
        })();
        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(doc.type);
        const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => doc.tags?.includes(tag));
        return matchesSearch && matchesDecade && matchesType && matchesTags;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-nobel-gold" />
            </div>
        );
    }

    return (
        <div 
            className="min-h-screen bg-background pt-32 pb-16 relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Drag overlay */}
            <AnimatePresence>
                {isDragging && user && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-ui-blue/20 backdrop-blur-sm flex items-center justify-center pointer-events-none"
                    >
                        <div className="bg-background border-4 border-dashed border-ui-blue rounded-2xl p-16 text-center">
                            <Upload className="w-16 h-16 text-ui-blue mx-auto mb-4" />
                            <h3 className="text-2xl font-serif text-ui-blue mb-2">Drop your document here</h3>
                            <p className="text-muted-foreground">PDF, DOC, DOCX, or TXT files accepted</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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

                    {user ? (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleUploadClick}
                            className="flex items-center gap-2 px-6 py-3 bg-ui-blue text-white rounded-full shadow-lg hover:bg-nobel-gold hover:text-foreground transition-all text-xs font-bold uppercase tracking-widest"
                        >
                            <Upload size={14} /> Upload
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/auth')}
                            className="flex items-center gap-2 px-6 py-3 bg-muted text-muted-foreground rounded-full shadow-lg hover:bg-ui-blue hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
                        >
                            <LogIn size={14} /> Login to Upload
                        </motion.button>
                    )}
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

                        {/* Tags Filter */}
                        <div>
                            <div className="flex items-center justify-between mb-4 text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em]">
                                <div className="flex items-center gap-2"><Tag size={12} /> Tags</div>
                                {selectedTags.length > 0 && (
                                    <button onClick={() => setSelectedTags([])} className="text-destructive hover:text-destructive/80">Reset</button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {availableTags.map(tag => {
                                    const isSelected = selectedTags.includes(tag);
                                    return (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                                                isSelected 
                                                    ? 'bg-nobel-gold text-white' 
                                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                            }`}
                                        >
                                            {tag}
                                        </button>
                                    );
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
                                                            <div className="flex items-center gap-1">
                                                                {getFileExtensionIcon(doc.file_url)}
                                                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                                                    {getFileExtension(doc.file_url)}
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                <h3 className={`font-serif text-2xl mb-2 transition-colors ${playingDocId === doc.id ? 'text-nobel-gold' : 'text-ui-blue group-hover:text-nobel-gold'}`}>
                                                    {doc.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground font-light max-w-lg mb-2">{doc.description}</p>
                                                {doc.tags && doc.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {doc.tags.map(tag => (
                                                            <span 
                                                                key={tag} 
                                                                className="px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground rounded-full"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
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
                                                <div 
                                                    className="flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-widest"
                                                    title="This historical document is awaiting digitization"
                                                >
                                                    <AlertCircle size={14} /> 
                                                    <span className="hidden md:inline">Awaiting Digitization</span>
                                                    <span className="md:hidden">Pending</span>
                                                </div>
                                            )}

                                            {/* Share Button */}
                                            <button 
                                                onClick={() => handleShare(doc)}
                                                className={`flex items-center gap-2 w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-3 rounded-full md:rounded-none transition-all justify-center ${
                                                    doc.share_token 
                                                        ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                }`}
                                                title={doc.share_token ? "Manage Share Link" : "Share Document"}
                                            >
                                                <Share2 size={14} />
                                                <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">
                                                    {doc.share_token ? 'Shared' : 'Share'}
                                                </span>
                                            </button>

                                            {/* Delete Button - for owner or staff */}
                                            {user && (isStaff || doc.uploaded_by === user.id) && (
                                                <button 
                                                    onClick={() => handleDelete(doc)}
                                                    className="flex items-center gap-2 w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-3 rounded-full md:rounded-none bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-all justify-center"
                                                    title={isStaff && doc.uploaded_by !== user.id ? "Delete Document (Staff)" : "Delete Document"}
                                                >
                                                    <Trash2 size={14} />
                                                    <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">Delete</span>
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

                                {/* Tags Input */}
                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Tags</label>
                                    <div className="flex gap-2 mb-2">
                                        <input 
                                            type="text" 
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addNewTag();
                                                }
                                            }}
                                            placeholder="Add a tag..."
                                            className="flex-1 px-4 py-2 bg-card border border-border focus:border-nobel-gold focus:outline-none transition-colors text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={addNewTag}
                                            className="px-4 py-2 bg-muted hover:bg-ui-blue hover:text-white text-muted-foreground text-xs font-bold uppercase transition-all"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {newTags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {newTags.map(tag => (
                                                <span 
                                                    key={tag} 
                                                    className="px-3 py-1 text-xs font-medium bg-nobel-gold/20 text-nobel-gold rounded-full flex items-center gap-2"
                                                >
                                                    {tag}
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeNewTag(tag)}
                                                        className="hover:text-destructive"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        <span className="text-[10px] text-muted-foreground">Suggestions:</span>
                                        {availableTags.filter(t => !newTags.includes(t)).slice(0, 4).map(tag => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => setNewTags([...newTags, tag])}
                                                className="px-2 py-0.5 text-[10px] bg-muted text-muted-foreground rounded-full hover:bg-muted/80"
                                            >
                                                +{tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                                        Document File <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx,.txt"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                    />
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const file = e.dataTransfer.files?.[0];
                                            if (file) setSelectedFile(file);
                                        }}
                                        className="w-full px-4 py-8 bg-card border-2 border-dashed border-border hover:border-nobel-gold focus:border-nobel-gold transition-colors cursor-pointer text-center"
                                    >
                                        {selectedFile ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <FileText className="w-6 h-6 text-ui-blue" />
                                                <span className="text-foreground font-medium">{selectedFile.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                                                    className="p-1 hover:bg-destructive/10 rounded"
                                                >
                                                    <X size={16} className="text-destructive" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                                <p className="text-muted-foreground">Click or drag & drop a file here</p>
                                                <p className="text-xs text-muted-foreground/60 mt-1">PDF, DOC, DOCX, or TXT</p>
                                            </div>
                                        )}
                                    </div>
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

            {/* Share Modal */}
            <AnimatePresence>
                {shareModalDoc && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/90 backdrop-blur-sm"
                        onClick={() => setShareModalDoc(null)}
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-background w-full max-w-md shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center p-6 border-b border-border">
                                <div className="flex items-center gap-3">
                                    <Share2 className="w-5 h-5 text-ui-blue" />
                                    <h3 className="font-serif text-xl text-ui-blue">Share Document</h3>
                                </div>
                                <button 
                                    onClick={() => setShareModalDoc(null)} 
                                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Document</p>
                                    <p className="font-serif text-lg text-foreground">{shareModalDoc.title}</p>
                                </div>

                                {shareModalDoc.share_token ? (
                                    <>
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-2">Shareable Link</p>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="text" 
                                                    readOnly 
                                                    value={getShareUrl(shareModalDoc)}
                                                    className="flex-1 px-3 py-2 bg-muted border border-border text-sm text-foreground truncate"
                                                />
                                                <button 
                                                    onClick={() => copyShareLink(shareModalDoc)}
                                                    className={`px-4 py-2 flex items-center gap-2 text-xs font-bold uppercase transition-all ${
                                                        copiedLink 
                                                            ? 'bg-green-100 text-green-600' 
                                                            : 'bg-ui-blue text-white hover:bg-nobel-gold hover:text-foreground'
                                                    }`}
                                                >
                                                    {copiedLink ? <CheckCircle size={14} /> : <Copy size={14} />}
                                                    {copiedLink ? 'Copied' : 'Copy'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-border">
                                            <button 
                                                onClick={() => revokeShareLink(shareModalDoc)}
                                                className="w-full py-3 bg-destructive/10 text-destructive text-xs font-bold uppercase tracking-widest hover:bg-destructive hover:text-white transition-all"
                                            >
                                                Revoke Share Link
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <Loader2 className="w-8 h-8 animate-spin text-ui-blue mx-auto mb-4" />
                                        <p className="text-muted-foreground">Generating share link...</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}