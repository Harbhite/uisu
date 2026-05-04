import React, { useState, useEffect, useRef } from 'react';
import { GridCardSkeleton } from '@/components/skeletons/GenericSkeletons';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MapPin, Clock, Tag, X, Upload, Phone, Loader2, Trash2, CheckCircle2, ArrowLeft, Sparkles, ChevronDown, ChevronUp, Wand2, ShieldCheck, AlertTriangle, Mic, MicOff, Newspaper, Image as ImageIcon, Type as TypeIcon, Route } from 'lucide-react';
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
  ai_tags?: string[] | null;
  ai_summary?: string | null;
  ai_attributes?: any;
  ai_rewritten_description?: string | null;
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
  const fileRef = useRef<HTMLInputElement>(null);

  // AI Smart Search state
  const [showAISearch, setShowAISearch] = useState(false);
  const [searchMode, setSearchMode] = useState<'text' | 'photo'>('text');
  const [aiDescription, setAiDescription] = useState('');
  const [aiMatches, setAiMatches] = useState<AIMatch[]>([]);
  const [aiSearching, setAiSearching] = useState(false);
  const [aiSearched, setAiSearched] = useState(false);
  const [photoSearchUrl, setPhotoSearchUrl] = useState<string | null>(null);
  const [photoSearchUploading, setPhotoSearchUploading] = useState(false);
  const photoSearchRef = useRef<HTMLInputElement>(null);

  // Daily digest
  const [digest, setDigest] = useState<string | null>(null);
  const [digestLoading, setDigestLoading] = useState(false);

  // Voice intake
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Route reasoning
  const [routeReasoning, setRouteReasoning] = useState<string | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', category: 'Other', item_type: 'lost',
    location: '', contact_info: '', photos: [] as string[]
  });
  const [autofilling, setAutofilling] = useState(false);
  const [autofillFromNext, setAutofillFromNext] = useState(true);
  const [postMatches, setPostMatches] = useState<{ lostItem: any; confidence: string; reason: string }[] | null>(null);

  // Claim modal state
  const [claimItem, setClaimItem] = useState<LostFoundItem | null>(null);
  const [claimText, setClaimText] = useState('');
  const [claimQuestions, setClaimQuestions] = useState<string[]>([]);
  const [claimAnswers, setClaimAnswers] = useState<string[]>(['', '']);
  const [claimLoadingQ, setClaimLoadingQ] = useState(false);
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimResult, setClaimResult] = useState<{ fraud_score: number; fraud_reasons: string } | null>(null);

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
    let publicUrl: string | null = null;
    try {
      const file = await compressImage(rawFile);
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('lost-found').upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('lost-found').getPublicUrl(fileName);
      publicUrl = urlData.publicUrl;
      setForm(f => ({ ...f, photos: [...f.photos, urlData.publicUrl] }));
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }

    // Auto-fill empty fields from photo using vision AI (only on first photo + opt-in)
    if (publicUrl && autofillFromNext && form.photos.length === 0 && !form.title.trim() && !form.description.trim()) {
      setAutofilling(true);
      try {
        const { data, error } = await supabase.functions.invoke('lf-vision-extract', { body: { imageUrl: publicUrl } });
        if (!error && data && !data.error) {
          setForm(f => ({
            ...f,
            title: f.title || data.title || '',
            description: f.description || data.description || '',
            category: data.category && CATEGORIES.includes(data.category) ? data.category : f.category,
          }));
          toast.success('AI auto-filled from photo — review before posting');
        }
      } catch (err) {
        console.warn('vision autofill failed', err);
      } finally {
        setAutofilling(false);
      }
    }
    if (e.target) e.target.value = '';
  };

  const handleCreate = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!currentUser) { toast.error('Please sign in first'); return; }
    setCreating(true);
    setPostMatches(null);
    try {
      const { data: inserted, error } = await supabase.from('lost_found_items').insert({
        user_id: currentUser, title: form.title, description: form.description || null,
        category: form.category, item_type: form.item_type, location: form.location || null,
        contact_info: form.contact_info || null, photos: form.photos,
      }).select().single();
      if (error) throw error;
      toast.success('Item posted!');

      // Fire-and-forget: analyze post (tags, summary, dedup) + rewrite
      if (inserted?.id) {
        supabase.functions.invoke('lf-analyze-post', { body: { itemId: inserted.id } }).catch(() => {});
        supabase.functions.invoke('lf-rewrite-post', { body: { itemId: inserted.id } }).catch(() => {});
      }

      // If found item, scan recent lost reports for matches
      if (inserted?.id && form.item_type === 'found') {
        try {
          const { data: matchData } = await supabase.functions.invoke('lf-process-found', { body: { foundItemId: inserted.id } });
          if (matchData?.matches?.length) {
            setPostMatches(matchData.matches);
            toast.success(`AI found ${matchData.matches.length} possible owner${matchData.matches.length > 1 ? 's' : ''}!`);
          } else {
            setShowCreateModal(false);
          }
        } catch { setShowCreateModal(false); }
      } else {
        setShowCreateModal(false);
      }

      setForm({ title: '', description: '', category: 'Other', item_type: 'lost', location: '', contact_info: '', photos: [] });
      fetchItems();
    } catch { toast.error('Failed to create post'); }
    finally { setCreating(false); }
  };

  const openClaimModal = async (item: LostFoundItem) => {
    if (!currentUser) { toast.error('Please sign in to claim'); return; }
    setClaimItem(item);
    setClaimText('');
    setClaimAnswers(['', '']);
    setClaimResult(null);
    setClaimQuestions([]);
    setClaimLoadingQ(true);
    try {
      const { data, error } = await supabase.functions.invoke('lf-verify-claim', {
        body: { foundItemId: item.id, generateQuestionsOnly: true },
      });
      if (!error && data?.questions) setClaimQuestions(data.questions);
    } catch { /* ignore */ }
    finally { setClaimLoadingQ(false); }
  };

  const submitClaim = async () => {
    if (!claimItem || !currentUser) return;
    if (!claimText.trim()) { toast.error('Describe your claim'); return; }
    if (claimQuestions.length && claimAnswers.some(a => !a.trim())) { toast.error('Answer all verification questions'); return; }
    setClaimSubmitting(true);
    try {
      // Score fraud risk against full claim (text + answers)
      const fullClaim = `${claimText}\n\nVerification:\n${claimQuestions.map((q, i) => `Q: ${q}\nA: ${claimAnswers[i]}`).join('\n')}`;
      const { data: scoreData } = await supabase.functions.invoke('lf-verify-claim', {
        body: { foundItemId: claimItem.id, claimText: fullClaim },
      });
      const fraud_score = scoreData?.fraud_score ?? 0;
      const fraud_reasons = scoreData?.fraud_reasons ?? '';

      const { error } = await supabase.from('lost_found_claims').insert({
        found_item_id: claimItem.id,
        claimant_id: currentUser,
        claim_text: fullClaim,
        verification_questions: claimQuestions.map((q, i) => ({ question: q, answer: claimAnswers[i] })),
        fraud_score,
        fraud_reasons,
      });
      if (error) throw error;
      setClaimResult({ fraud_score, fraud_reasons });
      toast.success('Claim submitted — finder will be notified');
    } catch (e) {
      console.error(e);
      toast.error('Failed to submit claim');
    } finally {
      setClaimSubmitting(false);
    }
  };

  const handleResolve = async (id: string) => {
    const { error } = await supabase.from('lost_found_items').update({ status: 'resolved' }).eq('id', id);
    if (!error) { toast.success('Marked as resolved'); fetchItems(); setShowDetailModal(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    const { error } = await supabase.from('lost_found_items').delete().eq('id', id);
    if (!error) { toast.success('Deleted'); fetchItems(); setShowDetailModal(null); }
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

  // Photo similarity search — upload a photo and find visually similar opposite-type items
  const handlePhotoSearchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0];
    if (!raw) return;
    setPhotoSearchUploading(true);
    setAiSearched(false);
    setAiMatches([]);
    try {
      const file = await compressImage(raw);
      const fileName = `search-${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('lost-found').upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('lost-found').getPublicUrl(fileName);
      setPhotoSearchUrl(urlData.publicUrl);

      setAiSearching(true);
      const { data, error: fnError } = await supabase.functions.invoke('lf-photo-similarity', {
        body: { imageUrl: urlData.publicUrl, itemType: 'lost' },
      });
      if (fnError) throw fnError;
      const matches = (data?.matches || []).map((m: any) => ({ item: m.item, confidence: m.confidence, reason: m.reason }));
      setAiMatches(matches);
      setAiSearched(true);
      if (matches.length === 0) toast.info('No visually similar items found');
      else toast.success(`Found ${matches.length} look-alike${matches.length > 1 ? 's' : ''}`);
    } catch (err) {
      console.error('photo search error', err);
      toast.error('Photo search failed');
    } finally {
      setPhotoSearchUploading(false);
      setAiSearching(false);
      if (e.target) e.target.value = '';
    }
  };

  // Daily digest
  const loadDigest = async () => {
    setDigestLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('lf-daily-digest', { body: {} });
      if (error) throw error;
      setDigest(data?.digest || 'No items in the last 24 hours.');
    } catch {
      toast.error('Failed to load digest');
    } finally { setDigestLoading(false); }
  };

  // Voice intake
  const startVoiceIntake = () => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error('Voice input not supported in this browser'); return; }
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = async (ev: any) => {
      const transcript = ev.results?.[0]?.[0]?.transcript || '';
      setVoiceListening(false);
      if (!transcript) return;
      setVoiceProcessing(true);
      try {
        const { data, error } = await supabase.functions.invoke('lf-voice-structure', { body: { transcript } });
        if (error) throw error;
        const f = data?.fields;
        if (f) {
          setForm(prev => ({
            ...prev,
            item_type: f.item_type || prev.item_type,
            title: f.title || prev.title,
            description: f.description || prev.description,
            category: CATEGORIES.includes(f.category) ? f.category : prev.category,
            location: f.location || prev.location,
          }));
          toast.success('Voice transcribed and structured — review before posting');
        }
      } catch { toast.error('Voice processing failed'); }
      finally { setVoiceProcessing(false); }
    };
    rec.onerror = () => { setVoiceListening(false); toast.error('Voice capture failed'); };
    rec.onend = () => setVoiceListening(false);
    recognitionRef.current = rec;
    setVoiceListening(true);
    rec.start();
  };
  const stopVoiceIntake = () => { recognitionRef.current?.stop(); setVoiceListening(false); };

  // Route reasoning for found items vs nearby lost reports
  const loadRouteReasoning = async (item: LostFoundItem) => {
    setRouteLoading(true);
    setRouteReasoning(null);
    try {
      const oppositeType = item.item_type === 'found' ? 'lost' : 'found';
      const { data: candidates } = await supabase
        .from('lost_found_items')
        .select('location, created_at, title')
        .eq('status', 'active')
        .eq('item_type', oppositeType)
        .eq('category', item.category)
        .not('location', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);
      const counterpart = candidates?.[0];
      if (!counterpart) { setRouteReasoning('No opposite-type post yet to reason against.'); return; }
      const lostLoc = item.item_type === 'lost' ? item.location : counterpart.location;
      const foundLoc = item.item_type === 'found' ? item.location : counterpart.location;
      const lostTime = item.item_type === 'lost' ? item.created_at : counterpart.created_at;
      const foundTime = item.item_type === 'found' ? item.created_at : counterpart.created_at;
      const { data, error } = await supabase.functions.invoke('lf-route-reasoning', {
        body: { lostLocation: lostLoc, foundLocation: foundLoc, lostTime, foundTime, itemTitle: item.title },
      });
      if (error) throw error;
      setRouteReasoning(data?.reasoning || '');
    } catch { toast.error('Route reasoning failed'); }
    finally { setRouteLoading(false); }
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
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors mb-12"
        >
          <div className="p-2 border border-border group-hover:border-nobel-gold transition-colors">
            <ArrowLeft size={14} />
          </div>
          <span>Back</span>
        </button>

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
                    {aiSearched && (
                      <span className="text-xs text-slate-400">
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
                      <p className="text-sm text-slate-500 line-clamp-2 mb-3 font-light leading-relaxed flex-1">
                        {item.description}
                      </p>
                    )}
                    {item.ai_tags && item.ai_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.ai_tags.slice(0, 4).map(t => (
                          <span key={t} className="text-[9px] uppercase tracking-widest text-nobel-gold bg-nobel-gold/5 border border-nobel-gold/15 rounded-2xl px-2 py-0.5">#{t}</span>
                        ))}
                      </div>
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
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Description</label>
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
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Photos</p>
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 cursor-pointer">
                  <input type="checkbox" checked={autofillFromNext} onChange={e => setAutofillFromNext(e.target.checked)} className="accent-nobel-gold" />
                  <Wand2 size={11} className="text-nobel-gold" /> AI auto-fill
                </label>
              </div>
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
                  {uploading || autofilling ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUploadPhoto} />
              </div>
              {autofilling && <p className="text-[10px] text-nobel-gold mt-2 flex items-center gap-1"><Sparkles size={10} /> AI is reading the photo…</p>}
            </div>

            {postMatches && postMatches.length > 0 && (
              <div className="rounded-2xl border border-nobel-gold/30 bg-nobel-gold/5 p-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-nobel-gold flex items-center gap-2">
                  <Sparkles size={11} /> Possible owners detected
                </p>
                {postMatches.map((m, i) => (
                  <div key={i} className="text-xs border-t border-nobel-gold/15 pt-2 first:border-t-0 first:pt-0">
                    <div className="flex items-center gap-2">
                      <ConfidenceBadge confidence={m.confidence} />
                      <span className="font-bold text-ui-blue truncate">{m.lostItem.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 italic mt-0.5">{m.reason}</p>
                  </div>
                ))}
                <p className="text-[10px] text-slate-500 pt-1">These owners will be notified to reach out to you.</p>
              </div>
            )}
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
      <Dialog open={!!showDetailModal} onOpenChange={() => setShowDetailModal(null)}>
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
                  <p className="flex items-center gap-3 text-slate-600">
                    <MapPin size={16} className="text-nobel-gold" />
                    <span>{showDetailModal.location}</span>
                  </p>
                )}
                {showDetailModal.contact_info && (
                  showDetailModal.item_type === 'found' && currentUser !== showDetailModal.user_id ? (
                    <p className="flex items-center gap-3 text-slate-400 italic text-xs">
                      <Phone size={16} className="text-slate-300" />
                      <span>Contact hidden — submit a verified claim to reveal</span>
                    </p>
                  ) : (
                    <p className="flex items-center gap-3 text-slate-600">
                      <Phone size={16} className="text-nobel-gold" />
                      <span className="font-medium text-ui-blue">{showDetailModal.contact_info}</span>
                    </p>
                  )
                )}
                <p className="flex items-center gap-3 text-slate-400">
                  <Clock size={16} />
                  <span>Posted {formatDistanceToNow(new Date(showDetailModal.created_at), { addSuffix: true })}</span>
                </p>
              </div>

              {currentUser === showDetailModal.user_id ? (
                <div className="flex gap-2 pt-6 border-t border-slate-100">
                  <Button variant="outline" size="sm" onClick={() => handleResolve(showDetailModal.id)} className="gap-2 rounded-2xl border-border text-xs uppercase tracking-widest font-bold flex-1">
                    <CheckCircle2 size={14} /> Mark Resolved
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(showDetailModal.id)} className="rounded-2xl text-xs uppercase tracking-widest font-bold">
                    <Trash2 size={14} />
                  </Button>
                </div>
              ) : showDetailModal.item_type === 'found' && (
                <div className="pt-6 border-t border-slate-100">
                  <Button onClick={() => openClaimModal(showDetailModal)} className="w-full gap-2 rounded-2xl bg-nobel-gold hover:bg-nobel-gold/90 text-ui-blue text-xs uppercase tracking-widest font-bold">
                    <ShieldCheck size={14} /> This is mine — Claim with verification
                  </Button>
                  <p className="text-[10px] text-slate-400 mt-2 text-center">AI will ask 2 verification questions to confirm ownership.</p>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Claim Modal */}
      <Dialog open={!!claimItem} onOpenChange={() => { setClaimItem(null); setClaimResult(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border-border">
          {claimItem && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl text-ui-blue flex items-center gap-2">
                  <ShieldCheck size={20} className="text-nobel-gold" /> Verify Ownership
                </DialogTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Claiming: <span className="font-bold text-ui-blue">{claimItem.title}</span>
                </p>
              </DialogHeader>

              {claimResult ? (
                <div className="space-y-4 py-4">
                  <div className={`rounded-2xl border p-4 ${claimResult.fraud_score >= 60 ? 'bg-red-50 border-red-200' : claimResult.fraud_score >= 30 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {claimResult.fraud_score >= 30 ? <AlertTriangle size={16} className="text-amber-600" /> : <CheckCircle2 size={16} className="text-green-600" />}
                      <p className="text-xs font-bold uppercase tracking-widest">
                        AI Confidence: {claimResult.fraud_score >= 60 ? 'Low' : claimResult.fraud_score >= 30 ? 'Medium' : 'High'}
                      </p>
                    </div>
                    {claimResult.fraud_reasons && (
                      <p className="text-xs text-slate-600 italic">{claimResult.fraud_reasons}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-2">The finder will review your claim and reach out if confirmed.</p>
                  </div>
                  <Button onClick={() => { setClaimItem(null); setClaimResult(null); }} className="w-full rounded-2xl bg-ui-blue text-xs uppercase tracking-widest font-bold">Done</Button>
                </div>
              ) : (
                <div className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Why is this yours?</label>
                    <Textarea
                      placeholder="Describe the item in detail and where you lost it..."
                      value={claimText}
                      onChange={e => setClaimText(e.target.value)}
                      className="rounded-2xl border-border min-h-[80px]"
                    />
                  </div>

                  {claimLoadingQ ? (
                    <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-400">
                      <Loader2 size={14} className="animate-spin" /> AI generating verification questions…
                    </div>
                  ) : claimQuestions.length > 0 ? (
                    <div className="space-y-3 rounded-2xl border border-nobel-gold/30 bg-nobel-gold/5 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-nobel-gold flex items-center gap-2">
                        <Sparkles size={11} /> Verification Questions
                      </p>
                      {claimQuestions.map((q, i) => (
                        <div key={i} className="space-y-1.5">
                          <p className="text-xs font-medium text-ui-blue">{i + 1}. {q}</p>
                          <Input
                            value={claimAnswers[i] || ''}
                            onChange={e => setClaimAnswers(a => { const n = [...a]; n[i] = e.target.value; return n; })}
                            className="rounded-2xl border-border text-sm"
                            placeholder="Your answer"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setClaimItem(null)} className="rounded-2xl border-border text-xs uppercase tracking-widest font-bold">Cancel</Button>
                    <Button onClick={submitClaim} disabled={claimSubmitting || claimLoadingQ} className="rounded-2xl bg-nobel-gold text-ui-blue text-xs uppercase tracking-widest font-bold">
                      {claimSubmitting && <Loader2 size={14} className="animate-spin mr-2" />}
                      Submit Claim
                    </Button>
                  </DialogFooter>
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
