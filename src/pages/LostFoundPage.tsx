import React, { useState, useEffect, useRef } from 'react';
import { GridCardSkeleton } from '@/components/skeletons/GenericSkeletons';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MapPin, Clock, Tag, X, Upload, Phone, Loader2, Trash2, CheckCircle2, ArrowLeft, Sparkles, ChevronDown, ChevronUp, Mic, Wand2, ImagePlus, FileImage, ShieldQuestion, ShieldAlert, CheckCircle, MessageSquareWarning, Newspaper, Route } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { compressImage } from '@/lib/image-compression';

const CATEGORIES = ['Electronics', 'Books', 'Clothing', 'ID/Cards', 'Keys', 'Bags', 'Accessories', 'Other'];

interface LostFoundItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  item_type: string;
  location: string | null;
  photos: string[];
  contact_info: string | null;
  status: string;
  created_at: string;
}

interface AIMatch {
  item: Omit<LostFoundItem, 'user_id' | 'item_type' | 'status'>;
  confidence: string;
  reason: string;
}

const ConfidenceBadge = ({ confidence }: { confidence: string }) => {
  const styles = {
    high: 'bg-green-50 text-green-700 border-green-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-slate-50 text-slate-500 border-border',
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border rounded-2xl ${styles[confidence as keyof typeof styles] || styles.low}`}>
      {confidence} match
    </span>
  );
};

const LostFoundPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<LostFoundItem | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [listening, setListening] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  // AI Smart Search state
  const [showAISearch, setShowAISearch] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [aiMatches, setAiMatches] = useState<AIMatch[]>([]);
  const [aiSearching, setAiSearching] = useState(false);
  const [aiSearched, setAiSearched] = useState(false);


  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [verificationQuestions, setVerificationQuestions] = useState<string[]>([]);
  const [claimDescription, setClaimDescription] = useState('');
  const [verifyingClaim, setVerifyingClaim] = useState(false);
  const [claimResult, setClaimResult] = useState<{ isSuspicious: boolean, reasoning: string, confidenceScore: number } | null>(null);


  const [generatingDigest, setGeneratingDigest] = useState(false);
  const [analyzingLocation, setAnalyzingLocation] = useState(false);
  const [routeSuggestion, setRouteSuggestion] = useState<string | null>(null);

  const [analyzingImage, setAnalyzingImage] = useState(false);
  const aiFileRef = useRef<HTMLInputElement>(null);


  const [form, setForm] = useState({
    title: '', description: '', category: 'Other', item_type: 'lost',
    location: '', contact_info: '', photos: [] as string[]
  });

  useEffect(() => {
    fetchItems();
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user?.id || null));
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('lost_found_items')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (!error && data) setItems(data);
    setLoading(false);
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;
    setUploading(true);
    try {
      const file = await compressImage(rawFile);
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('lost-found').upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('lost-found').getPublicUrl(fileName);
      setForm(f => ({ ...f, photos: [...f.photos, urlData.publicUrl] }));
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };


  const handleVoiceIntake = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Voice input is not supported in this browser.');
      return;
    }
    const SpeechRecognition = (window as unknown as Record<string, unknown>).webkitSpeechRecognition as new () => unknown;
    const recognition = new SpeechRecognition() as any;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setListening(true);
      toast.info('Listening... Speak your description.');
    };

    recognition.onresult = (event: unknown) => {
      const transcript = event.results[0][0].transcript;
      setForm(f => ({ ...f, description: (f.description ? f.description + ' ' : '') + transcript }));
    };

    recognition.onerror = (event: unknown) => {
      console.error(event.error);
      toast.error('Voice recognition error.');
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const handleEnhanceText = async () => {
    if (!form.description?.trim()) {
      toast.error("Please enter a description to enhance");
      return;
    }
    setEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('lost-found-match', {
        body: { action: 'enhance-text', payload: { text: form.description } },
      });
      if (error) throw error;
      if (data?.title) setForm(f => ({ ...f, title: data.title }));
      if (data?.description) setForm(f => ({ ...f, description: data.description }));
      if (data?.category) setForm(f => ({ ...f, category: data.category }));
      toast.success("Text enhanced & categorized!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to enhance text");
    } finally {
      setEnhancing(false);
    }
  };



  const handleAnalyzePhoto = async (e: React.ChangeEvent<HTMLInputElement>, isSearch: boolean = false) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    // File to base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result;
      if (!base64 || typeof base64 !== 'string') return;

      setAnalyzingImage(true);
      toast.info('Analyzing image...');

      try {
        const { data, error } = await supabase.functions.invoke('lost-found-match', {
          body: { action: 'analyze-image', payload: { imageData: base64 } }
        });
        if (error) throw error;

        if (isSearch) {
          setAiDescription(data.description || '');
          toast.success('Extracted description from image! Click "Find Matches" to search.');
        } else {
          if (data.title) setForm(f => ({ ...f, title: data.title }));
          if (data.description) setForm(f => ({ ...f, description: data.description }));
          if (data.category) setForm(f => ({ ...f, category: data.category }));
          toast.success('Form auto-filled from image!');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to analyze image');
      } finally {
        setAnalyzingImage(false);
        if (e.target) e.target.value = ''; // Reset file input
      }
    };
    reader.readAsDataURL(rawFile);
  };


  const handleGenerateQuestions = async () => {
    if (!showDetailModal?.description) return;
    setGeneratingQuestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('lost-found-match', {
        body: { action: 'generate-questions', payload: { description: showDetailModal.description } }
      });
      if (error) throw error;
      setVerificationQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate verification questions');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleVerifyClaim = async () => {
    if (!claimDescription.trim() || !showDetailModal?.description) return;
    setVerifyingClaim(true);
    try {
      const { data, error } = await supabase.functions.invoke('lost-found-match', {
        body: { action: 'verify-claim', payload: { originalDescription: showDetailModal.description, claimDescription } }
      });
      if (error) throw error;
      setClaimResult(data);
      if (data.isSuspicious) {
        toast.error('Claim appears suspicious. Review carefully.');
      } else {
        toast.success('Claim appears legitimate.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to verify claim');
    } finally {
      setVerifyingClaim(false);
    }
  };


  const handleDailyDigest = async () => {
    setGeneratingDigest(true);
    try {
      const { data, error } = await supabase.functions.invoke('lost-found-match', {
        body: { action: 'daily-digest' }
      });
      if (error) throw error;
      toast(
        <div className="space-y-2">
          <h4 className="font-bold flex items-center gap-2"><Newspaper size={16}/> Daily Bulletin</h4>
          <p className="text-sm">{data.summary}</p>
        </div>,
        { duration: 8000 }
      );
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate daily digest');
    } finally {
      setGeneratingDigest(false);
    }
  };

  const handleAnalyzeLocation = async () => {
    if (!showDetailModal?.location || !showDetailModal?.description) return;
    setAnalyzingLocation(true);
    try {
      const { data, error } = await supabase.functions.invoke('lost-found-match', {
        body: { action: 'suggest-route', payload: { location: showDetailModal.location, description: showDetailModal.description } }
      });
      if (error) throw error;
      setRouteSuggestion(data.suggestion);
    } catch (err) {
      console.error(err);
      toast.error('Failed to analyze location');
    } finally {
      setAnalyzingLocation(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!currentUser) { toast.error('Please sign in first'); return; }
    setCreating(true);
    try {
      const { error, data: newItem } = await supabase.from('lost_found_items').insert({
        user_id: currentUser, title: form.title, description: form.description || null,
        category: form.category, item_type: form.item_type, location: form.location || null,
        contact_info: form.contact_info || null, photos: form.photos,
      }).select().single();
      if (error) throw error;
      toast.success('Item posted!');
      setShowCreateModal(false);

      // Feature 1: Semantic match immediately after post
      if (form.item_type === 'found' && form.description) {
        toast.info("Scanning for likely owners...");
        supabase.functions.invoke('lost-found-match', {
          body: { action: 'match-found-to-lost', payload: { description: form.description, category: form.category } }
        }).then(({ data }) => {
          if (data?.matches?.length > 0) {
             toast.success(`Found ${data.matches.length} possible owners! Check the board.`, { duration: 5000 });
          }
        }).catch(err => console.error("Auto-match failed:", err));
      }

      setForm({ title: '', description: '', category: 'Other', item_type: 'lost', location: '', contact_info: '', photos: [] });
      fetchItems();
    } catch { toast.error('Failed to create post'); }
    finally { setCreating(false); }
  };

const handleResolve = async (id: string) => {
    const { error } = await supabase.from('lost_found_items').update({ status: 'resolved' }).eq('id', id);
    if (!error) { toast.success('Marked as resolved'); fetchItems(); setShowDetailModal(null); setVerificationQuestions([]); setClaimDescription(''); setClaimResult(null); setRouteSuggestion(null);; }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    const { error } = await supabase.from('lost_found_items').delete().eq('id', id);
    if (!error) { toast.success('Deleted'); fetchItems(); setShowDetailModal(null); setVerificationQuestions([]); setClaimDescription(''); setClaimResult(null); setRouteSuggestion(null);; }
  };

  const handleAISearch = async () => {
    if (!aiDescription.trim()) { toast.error('Please describe what you lost'); return; }
    setAiSearching(true);
    setAiSearched(false);
    setAiMatches([]);
    try {
      const { data, error } = await supabase.functions.invoke('lost-found-match', {
        body: { description: aiDescription },
      });
      if (error) throw error;
      if (data?.error) {
        if (data.error.includes('Rate limit') || data.error.includes('429')) {
          toast.error('AI is busy, please try again in a moment');
        } else if (data.error.includes('402')) {
          toast.error('AI service temporarily unavailable');
        } else {
          toast.error(data.error);
        }
        return;
      }
      setAiMatches(data.matches || []);
      setAiSearched(true);
      if (data.matches?.length === 0) {
        toast.info('No matching found items detected');
      } else {
        toast.success(`Found ${data.matches.length} potential match${data.matches.length > 1 ? 'es' : ''}!`);
      }
    } catch (e) {
      console.error('AI search error:', e);
      toast.error('AI search failed, please try again');
    } finally {
      setAiSearching(false);
    }
  };

  const handleViewMatchedItem = (matchItem: AIMatch['item']) => {
    // Find the full item from the items list
    const fullItem = items.find(i => i.id === matchItem.id);
    if (fullItem) {
      setShowDetailModal(fullItem);
    }
  };

  const filtered = items.filter(item => {
    if (filter !== 'all' && item.item_type !== filter) return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) && !item.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const lostCount = items.filter(i => i.item_type === 'lost').length;
  const foundCount = items.filter(i => i.item_type === 'found').length;

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <SEO title="Lost & Found - UISU SPACE" description="Report lost items or post found items on campus" />

      <div className="container mx-auto px-6">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-16">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors"
          >
            <div className="p-2 border border-border group-hover:border-nobel-gold transition-colors">
              <ArrowLeft size={14} />
            </div>
            <span>Back</span>
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDailyDigest}
            disabled={generatingDigest}
            className="rounded-full text-xs font-bold uppercase tracking-widest bg-ui-blue text-white border-ui-blue hover:bg-ui-dark"
          >
            {generatingDigest ? <Loader2 size={14} className="animate-spin mr-2" /> : <Newspaper size={14} className="mr-2" />}
            Morning Bulletin
          </Button>
        </div>


        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4"
          >
            <div className="flex items-center gap-4">
              <Tag className="text-nobel-gold w-6 h-6" />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Community Board</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-6 text-xs text-slate-400 font-bold uppercase tracking-widest">
                <span>Lost: <span className="text-ui-blue">{lostCount}</span></span>
                <span>Found: <span className="text-ui-blue">{foundCount}</span></span>
              </div>
              <Button
                onClick={() => currentUser ? setShowCreateModal(true) : toast.error('Please sign in')}
                className="gap-2 rounded-2xl text-xs uppercase tracking-widest bg-ui-blue hover:bg-ui-blue/90"
              >
                <Plus size={16} /> Post Item
              </Button>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl text-ui-blue mb-6"
          >
            Lost & <span className="italic text-slate-300">Found</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 font-light max-w-2xl leading-relaxed"
          >
            Report lost items or help reunite found items with their owners across campus.
          </motion.p>
        </div>

        {/* AI Smart Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <button
            onClick={() => setShowAISearch(!showAISearch)}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-ui-blue/5 to-nobel-gold/5 border border-ui-blue/10 hover:border-nobel-gold/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-nobel-gold/10 border border-nobel-gold/20">
                <Sparkles size={16} className="text-nobel-gold" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-widest text-ui-blue">AI Smart Search</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Describe your lost item and AI will find matching found items</p>
              </div>
            </div>
            {showAISearch ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>

          <AnimatePresence>
            {showAISearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="border border-t-0 border-ui-blue/10 bg-card p-6 space-y-4">
                  <Textarea
                    placeholder="Describe what you lost in detail — color, brand, size, where you last had it, any unique features..."
                    value={aiDescription}
                    onChange={e => setAiDescription(e.target.value)}
                    className="rounded-2xl border-border min-h-[100px] text-sm"
                    rows={3}
                  />

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleAISearch}
                      disabled={aiSearching || !aiDescription.trim()}
                      className="gap-2 rounded-2xl bg-nobel-gold hover:bg-nobel-gold/90 text-ui-blue text-xs uppercase tracking-widest font-bold"
                    >
                      {aiSearching ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      {aiSearching ? 'Searching...' : 'Find Matches'}
                    </Button>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('search-image-upload')?.click()}
                      disabled={analyzingImage}
                      className="gap-2 rounded-2xl border-border text-xs uppercase tracking-widest font-bold"
                    >
                      {analyzingImage ? <Loader2 size={14} className="animate-spin" /> : <FileImage size={14} />}
                      Search by Photo
                    </Button>
                    <input id="search-image-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleAnalyzePhoto(e, true)} />
                    {aiSearched && (
                      <span className="text-xs text-slate-400 ml-auto">
                        {aiMatches.length} match{aiMatches.length !== 1 ? 'es' : ''} found
                      </span>
                    )}
                  </div>


                  {/* AI Results */}
                  <AnimatePresence>
                    {aiSearched && aiMatches.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3 pt-4 border-t border-slate-100"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Potential Matches</p>
                        {aiMatches.map((match, i) => (
                          <motion.div
                            key={match.item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            onClick={() => handleViewMatchedItem(match.item)}
                            className="flex gap-4 p-4 bg-slate-50/50 border border-slate-100 hover:border-nobel-gold/40 cursor-pointer transition-all group"
                          >
                            {/* Thumbnail */}
                            <div className="w-16 h-16 flex-shrink-0 bg-slate-100 border border-border overflow-hidden">
                              {(match.item.photos as string[])?.length > 0 ? (
                                <img src={(match.item.photos as string[])[0]} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <Tag size={16} className="text-slate-300" />
                                </div>
                              )}
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <ConfidenceBadge confidence={match.confidence} />
                                <Badge variant="outline" className="text-[8px] rounded-2xl border-border text-slate-400 uppercase tracking-widest font-bold bg-card">
                                  {match.item.category}
                                </Badge>
                              </div>
                              <h4 className="font-serif text-sm font-bold text-ui-blue group-hover:text-nobel-gold transition-colors truncate">
                                {match.item.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 mt-1 italic line-clamp-1">{match.reason}</p>
                              {match.item.location && (
                                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                  <MapPin size={10} className="text-nobel-gold" />{match.item.location}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {aiSearched && aiMatches.length === 0 && (
                    <div className="text-center py-8 border-t border-slate-100">
                      <Search size={24} className="mx-auto text-slate-200 mb-3" />
                      <p className="text-sm text-slate-400">No matching found items right now.</p>
                      <p className="text-xs text-slate-300 mt-1">Try a different description or check back later.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-12">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'lost' | 'found')} className="w-full sm:w-auto">
            <TabsList className="rounded-2xl bg-card border border-border p-1 h-auto grid grid-cols-3 w-full sm:w-[300px]">
              <TabsTrigger value="all" className="rounded-2xl py-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-ui-blue data-[state=active]:text-white">All</TabsTrigger>
              <TabsTrigger value="lost" className="rounded-2xl py-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-ui-blue data-[state=active]:text-white">Lost</TabsTrigger>
              <TabsTrigger value="found" className="rounded-2xl py-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-ui-blue data-[state=active]:text-white">Found</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-12 rounded-2xl border-border h-full min-h-[42px]"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48 rounded-2xl border-border h-full min-h-[42px] text-xs font-bold uppercase tracking-widest text-slate-500">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border">
              <SelectItem value="all" className="text-xs uppercase tracking-widest">All Categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c} className="text-xs uppercase tracking-widest">{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {loading ? (
          <GridCardSkeleton count={6} cols={2} />
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-card border border-border rounded-2xl">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-6 rounded-2xl">
              <Search size={28} className="text-slate-300" />
            </div>
            <h3 className="font-serif text-xl text-ui-blue mb-2">No items found</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">Try adjusting your filters or post a new item to get started.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setShowDetailModal(item)}
                  className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer hover:border-nobel-gold shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col h-full"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-slate-50 relative border-b border-slate-100">
                    {item.photos?.length > 0 ? (
                      <img src={item.photos[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Tag size={32} className="text-slate-200" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-block px-3 py-1 text-[9px] font-bold uppercase tracking-widest border rounded-2xl ${
                        item.item_type === 'lost' 
                          ? 'bg-red-50 text-red-600 border-red-100'
                          : 'bg-green-50 text-green-600 border-green-100'
                      }`}>
                        {item.item_type}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-[9px] rounded-2xl border-border text-slate-400 uppercase tracking-widest font-bold bg-slate-50">
                        {item.category}
                      </Badge>
                      <span className="text-[10px] text-slate-300 ml-auto flex items-center gap-1">
                        <Clock size={10} />
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-ui-blue mb-2 line-clamp-1 group-hover:text-nobel-gold transition-colors">{item.title}</h3>

                    {item.description && (
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4 font-light leading-relaxed flex-1">
                        {item.description}
                      </p>
                    )}

                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center text-xs text-slate-400">
                      {item.location ? (
                        <span className="flex items-center gap-1.5"><MapPin size={12} className="text-nobel-gold" />{item.location}</span>
                      ) : (
                        <span className="italic text-slate-300">No location specified</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border-border">
          <DialogHeader><DialogTitle className="font-serif text-2xl text-ui-blue">Post Lost or Found Item</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">

            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
               <div>
                  <h4 className="text-sm font-bold text-ui-blue">Auto-fill from Photo</h4>
                  <p className="text-[10px] text-slate-500">Upload a picture and let AI fill out the details</p>
               </div>
               <Button type="button" variant="outline" size="sm" onClick={() => aiFileRef.current?.click()} disabled={analyzingImage} className="gap-2 rounded-2xl h-8">
                  {analyzingImage ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                  Upload
               </Button>
               <input ref={aiFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleAnalyzePhoto(e, false)} />
            </div>

            <Tabs value={form.item_type} onValueChange={v => setForm(f => ({ ...f, item_type: v }))}>
              <TabsList className="w-full rounded-2xl bg-slate-50 border border-border h-auto p-1">
                <TabsTrigger value="lost" className="flex-1 rounded-2xl py-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-ui-blue data-[state=active]:text-white">I Lost Something</TabsTrigger>
                <TabsTrigger value="found" className="flex-1 rounded-2xl py-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-ui-blue data-[state=active]:text-white">I Found Something</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Title</label>
              <Input placeholder="Item name" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="rounded-2xl border-border" />
            </div>


            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Description</label>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={handleVoiceIntake} disabled={listening} className={`h-6 px-2 text-[10px] rounded-2xl ${listening ? 'bg-red-50 text-red-500 border-red-200' : 'text-slate-500'}`}>
                    {listening ? <Loader2 size={12} className="animate-spin mr-1" /> : <Mic size={12} className="mr-1" />}
                    {listening ? 'Listening...' : 'Dictate'}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={handleEnhanceText} disabled={enhancing || !form.description} className="h-6 px-2 text-[10px] rounded-2xl text-nobel-gold border-nobel-gold/30 hover:bg-nobel-gold/10">
                    {enhancing ? <Loader2 size={12} className="animate-spin mr-1" /> : <Wand2 size={12} className="mr-1" />}
                    AI Enhance
                  </Button>
                </div>
              </div>
              <Textarea placeholder="Color, brand, identifying features..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="rounded-2xl border-border" />
            </div>


            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Category</label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className="rounded-2xl border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-2xl border-border">
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Location</label>
                <Input placeholder="e.g. Library" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="rounded-2xl border-border" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Contact Info</label>
              <Input placeholder="Phone/WhatsApp" value={form.contact_info} onChange={e => setForm(f => ({ ...f, contact_info: e.target.value }))} className="rounded-2xl border-border" />
            </div>
            
            {/* Photos */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Photos</p>
              <div className="flex gap-2 flex-wrap">
                {form.photos.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 bg-slate-50 border border-border rounded-2xl overflow-hidden">
                    <img src={url} className="w-full h-full object-cover" />
                    <button onClick={() => setForm(f => ({ ...f, photos: f.photos.filter((_, idx) => idx !== i) }))}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-2xl p-0.5">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-border rounded-2xl flex items-center justify-center text-slate-300 hover:border-nobel-gold hover:text-nobel-gold transition-colors">
                  {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUploadPhoto} />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreateModal(false)} className="rounded-2xl border-border text-xs uppercase tracking-widest font-bold">Cancel</Button>
            <Button onClick={handleCreate} disabled={creating} className="rounded-2xl bg-ui-blue text-xs uppercase tracking-widest font-bold">
              {creating ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
              Post Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={!!showDetailModal} onOpenChange={() => setShowDetailModal(null); setVerificationQuestions([]); setClaimDescription(''); setClaimResult(null); setRouteSuggestion(null);}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border-border">
          {showDetailModal && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest border rounded-2xl ${
                    showDetailModal.item_type === 'lost' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
                  }`}>
                    {showDetailModal.item_type}
                  </span>
                  <Badge variant="outline" className="text-[9px] rounded-2xl border-border text-slate-500 uppercase tracking-widest font-bold bg-slate-50">
                    {showDetailModal.category}
                  </Badge>
                </div>
                <DialogTitle className="font-serif text-3xl text-ui-blue">{showDetailModal.title}</DialogTitle>
              </DialogHeader>

              {showDetailModal.photos?.length > 0 && (
                <div className="flex gap-2 overflow-x-auto py-4">
                  {showDetailModal.photos.map((url, i) => (
                    <img key={i} src={url} className="h-64 object-cover rounded-2xl border border-border" alt="" />
                  ))}
                </div>
              )}

              {showDetailModal.description && (
                <p className="text-sm text-slate-600 font-light leading-relaxed whitespace-pre-wrap">
                  {showDetailModal.description}
                </p>
              )}

              <div className="space-y-3 text-sm border-t border-slate-100 pt-6 mt-2">

                {showDetailModal.location && (
                  <div className="space-y-2">
                    <p className="flex items-center gap-3 text-slate-600">
                      <MapPin size={16} className="text-nobel-gold" />
                      <span>{showDetailModal.location}</span>
                    </p>

                    {routeSuggestion ? (
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs text-slate-600 ml-7">
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-ui-blue"><Route size={12}/> Route Analysis</div>
                        {routeSuggestion}
                      </div>
                    ) : (
                      <button onClick={handleAnalyzeLocation} disabled={analyzingLocation} className="text-[10px] text-nobel-gold ml-7 font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
                        {analyzingLocation ? <Loader2 size={10} className="animate-spin" /> : <Route size={10} />} Analyze Location
                      </button>
                    )}
                  </div>
                )}

                {showDetailModal.contact_info && (currentUser === showDetailModal.user_id || showDetailModal.item_type === 'lost') && (
                  <p className="flex items-center gap-3 text-slate-600">
                    <Phone size={16} className="text-nobel-gold" />
                    <span className="font-medium text-ui-blue">{showDetailModal.contact_info}</span>
                  </p>
                )}
                <p className="flex items-center gap-3 text-slate-400">
                  <Clock size={16} />
                  <span>Posted {formatDistanceToNow(new Date(showDetailModal.created_at), { addSuffix: true })}</span>
                </p>
              </div>


              {currentUser === showDetailModal.user_id && showDetailModal.item_type === 'found' && showDetailModal.description && (
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl mt-4">
                  <h4 className="text-sm font-bold text-ui-blue flex items-center gap-2 mb-2">
                    <ShieldQuestion size={14} className="text-nobel-gold" /> Verification Questions
                  </h4>
                  <p className="text-xs text-slate-500 mb-3">Generate questions to ask claimants to verify true ownership.</p>

                  {verificationQuestions.length > 0 ? (
                    <ul className="space-y-2 text-sm text-slate-700 list-disc pl-4">
                      {verificationQuestions.map((q, i) => <li key={i}>{q}</li>)}
                    </ul>
                  ) : (
                    <Button variant="outline" size="sm" onClick={handleGenerateQuestions} disabled={generatingQuestions} className="text-xs rounded-2xl bg-white">
                      {generatingQuestions ? <Loader2 size={12} className="animate-spin mr-2" /> : null}
                      Generate Questions
                    </Button>
                  )}
                </div>
              )}


              {currentUser !== showDetailModal.user_id && showDetailModal.item_type === 'found' && (
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl mt-4 space-y-3">
                  <h4 className="text-sm font-bold text-ui-blue flex items-center gap-2">
                    <MessageSquareWarning size={14} className="text-nobel-gold" /> Claim this Item
                  </h4>
                  <p className="text-xs text-slate-500">Provide a detailed description of your item to view contact information. AI will review your claim to prevent fraud.</p>

                  {!claimResult || claimResult.isSuspicious ? (
                    <>
                      <Textarea
                        placeholder="Describe your item in detail..."
                        value={claimDescription}
                        onChange={e => setClaimDescription(e.target.value)}
                        className="text-sm rounded-2xl border-border bg-white"
                        rows={2}
                      />
                      <Button size="sm" onClick={handleVerifyClaim} disabled={verifyingClaim || !claimDescription} className="w-full text-xs rounded-2xl bg-ui-blue text-white">
                        {verifyingClaim ? <Loader2 size={12} className="animate-spin mr-2" /> : null}
                        Verify Claim
                      </Button>

                      {claimResult && claimResult.isSuspicious && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-xs flex items-start gap-2">
                          <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                          <div>
                            <strong>Suspicious Claim (Score: {claimResult.confidenceScore})</strong>
                            <p className="mt-1">{claimResult.reasoning}</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-2xl text-center space-y-2">
                      <CheckCircle className="text-green-500 mx-auto" size={24} />
                      <p className="text-sm font-bold text-green-700">Claim Verified</p>
                      <p className="text-xs text-green-600 mb-2">You can now contact the finder.</p>
                      <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full text-sm font-bold border border-green-200">
                        <Phone size={14} className="text-green-600" />
                        {showDetailModal.contact_info || "No contact info provided."}
                      </div>
                    </div>
                  )}
                </div>
              )}


              {currentUser === showDetailModal.user_id && (
                <div className="flex gap-2 pt-6 border-t border-slate-100">
                  <Button variant="outline" size="sm" onClick={() => handleResolve(showDetailModal.id)} className="gap-2 rounded-2xl border-border text-xs uppercase tracking-widest font-bold flex-1">
                    <CheckCircle2 size={14} /> Mark Resolved
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(showDetailModal.id)} className="rounded-2xl text-xs uppercase tracking-widest font-bold">
                    <Trash2 size={14} />
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LostFoundPage;
