import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MapPin, Clock, Tag, X, Upload, Phone, Loader2, Trash2, CheckCircle2, ArrowLeft } from 'lucide-react';
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
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('lost-found').upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('lost-found').getPublicUrl(fileName);
      setForm(f => ({ ...f, photos: [...f.photos, urlData.publicUrl] }));
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleCreate = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!currentUser) { toast.error('Please sign in first'); return; }
    setCreating(true);
    try {
      const { error } = await supabase.from('lost_found_items').insert({
        user_id: currentUser, title: form.title, description: form.description || null,
        category: form.category, item_type: form.item_type, location: form.location || null,
        contact_info: form.contact_info || null, photos: form.photos,
      });
      if (error) throw error;
      toast.success('Item posted!');
      setShowCreateModal(false);
      setForm({ title: '', description: '', category: 'Other', item_type: 'lost', location: '', contact_info: '', photos: [] });
      fetchItems();
    } catch { toast.error('Failed to create post'); }
    finally { setCreating(false); }
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
          <div className="p-2 border border-slate-200 group-hover:border-nobel-gold transition-colors">
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
                className="gap-2 rounded-none text-xs uppercase tracking-widest bg-ui-blue hover:bg-ui-blue/90"
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-12">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'lost' | 'found')} className="w-full sm:w-auto">
            <TabsList className="rounded-none bg-white border border-slate-200 p-1 h-auto grid grid-cols-3 w-full sm:w-[300px]">
              <TabsTrigger value="all" className="rounded-none py-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-ui-blue data-[state=active]:text-white">All</TabsTrigger>
              <TabsTrigger value="lost" className="rounded-none py-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-ui-blue data-[state=active]:text-white">Lost</TabsTrigger>
              <TabsTrigger value="found" className="rounded-none py-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-ui-blue data-[state=active]:text-white">Found</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-12 rounded-none border-slate-200 h-full min-h-[42px]"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48 rounded-none border-slate-200 h-full min-h-[42px] text-xs font-bold uppercase tracking-widest text-slate-500">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-slate-200">
              <SelectItem value="all" className="text-xs uppercase tracking-widest">All Categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c} className="text-xs uppercase tracking-widest">{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-nobel-gold" /></div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-white border border-slate-200 rounded-none">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-6 rounded-none">
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
                  className="bg-white border border-slate-200 rounded-none overflow-hidden cursor-pointer hover:border-nobel-gold hover:shadow-sm transition-all duration-300 group flex flex-col h-full"
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
                      <span className={`inline-block px-3 py-1 text-[9px] font-bold uppercase tracking-widest border rounded-none ${
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
                      <Badge variant="outline" className="text-[9px] rounded-none border-slate-200 text-slate-400 uppercase tracking-widest font-bold bg-slate-50">
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-none border-slate-200">
          <DialogHeader><DialogTitle className="font-serif text-2xl text-ui-blue">Post Lost or Found Item</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <Tabs value={form.item_type} onValueChange={v => setForm(f => ({ ...f, item_type: v }))}>
              <TabsList className="w-full rounded-none bg-slate-50 border border-slate-200 h-auto p-1">
                <TabsTrigger value="lost" className="flex-1 rounded-none py-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-ui-blue data-[state=active]:text-white">I Lost Something</TabsTrigger>
                <TabsTrigger value="found" className="flex-1 rounded-none py-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-ui-blue data-[state=active]:text-white">I Found Something</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Title</label>
              <Input placeholder="Item name" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="rounded-none border-slate-200" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Description</label>
              <Textarea placeholder="Color, brand, identifying features..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="rounded-none border-slate-200" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Category</label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className="rounded-none border-slate-200"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-none border-slate-200">
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Location</label>
                <Input placeholder="e.g. Library" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="rounded-none border-slate-200" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Contact Info</label>
              <Input placeholder="Phone/WhatsApp" value={form.contact_info} onChange={e => setForm(f => ({ ...f, contact_info: e.target.value }))} className="rounded-none border-slate-200" />
            </div>
            
            {/* Photos */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Photos</p>
              <div className="flex gap-2 flex-wrap">
                {form.photos.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 bg-slate-50 border border-slate-200 rounded-none overflow-hidden">
                    <img src={url} className="w-full h-full object-cover" />
                    <button onClick={() => setForm(f => ({ ...f, photos: f.photos.filter((_, idx) => idx !== i) }))}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-none p-0.5">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-none flex items-center justify-center text-slate-300 hover:border-nobel-gold hover:text-nobel-gold transition-colors">
                  {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUploadPhoto} />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreateModal(false)} className="rounded-none border-slate-200 text-xs uppercase tracking-widest font-bold">Cancel</Button>
            <Button onClick={handleCreate} disabled={creating} className="rounded-none bg-ui-blue text-xs uppercase tracking-widest font-bold">
              {creating ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
              Post Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={!!showDetailModal} onOpenChange={() => setShowDetailModal(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-none border-slate-200">
          {showDetailModal && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest border rounded-none ${
                    showDetailModal.item_type === 'lost' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
                  }`}>
                    {showDetailModal.item_type}
                  </span>
                  <Badge variant="outline" className="text-[9px] rounded-none border-slate-200 text-slate-500 uppercase tracking-widest font-bold bg-slate-50">
                    {showDetailModal.category}
                  </Badge>
                </div>
                <DialogTitle className="font-serif text-3xl text-ui-blue">{showDetailModal.title}</DialogTitle>
              </DialogHeader>

              {showDetailModal.photos?.length > 0 && (
                <div className="flex gap-2 overflow-x-auto py-4">
                  {showDetailModal.photos.map((url, i) => (
                    <img key={i} src={url} className="h-64 object-cover rounded-none border border-slate-200" alt="" />
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

              {currentUser === showDetailModal.user_id && (
                <div className="flex gap-2 pt-6 border-t border-slate-100">
                  <Button variant="outline" size="sm" onClick={() => handleResolve(showDetailModal.id)} className="gap-2 rounded-none border-slate-200 text-xs uppercase tracking-widest font-bold flex-1">
                    <CheckCircle2 size={14} /> Mark Resolved
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(showDetailModal.id)} className="rounded-none text-xs uppercase tracking-widest font-bold">
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
