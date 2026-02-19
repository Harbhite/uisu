import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MapPin, Clock, Tag, X, Upload, Phone, Loader2, Trash2, CheckCircle2 } from 'lucide-react';
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
    <div className="min-h-screen bg-background">
      <SEO title="Lost & Found - UISU SPACE" description="Report lost items or post found items on campus" />

      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 pt-28 pb-14 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/60 mb-3">Community Board</p>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 leading-tight">Lost & Found</h1>
            <p className="text-primary-foreground/70 font-light max-w-xl text-lg">
              Report lost items or help reunite found items with their owners across campus.
            </p>
          </motion.div>

          {/* Stats strip */}
          <div className="flex items-center gap-6 mt-8 pt-6 border-t border-primary-foreground/10">
            <div>
              <span className="text-2xl font-serif font-bold">{lostCount}</span>
              <span className="text-xs text-primary-foreground/60 ml-2 uppercase tracking-wider">Lost</span>
            </div>
            <div className="h-6 w-px bg-primary-foreground/20" />
            <div>
              <span className="text-2xl font-serif font-bold">{foundCount}</span>
              <span className="text-xs text-primary-foreground/60 ml-2 uppercase tracking-wider">Found</span>
            </div>
            <div className="ml-auto">
              <Button
                onClick={() => currentUser ? setShowCreateModal(true) : toast.error('Please sign in')}
                variant="secondary"
                className="gap-2 rounded-sm"
              >
                <Plus size={16} /> Post Item
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full sm:w-auto">
            <TabsList className="rounded-sm">
              <TabsTrigger value="all" className="rounded-sm">All</TabsTrigger>
              <TabsTrigger value="lost" className="rounded-sm">Lost</TabsTrigger>
              <TabsTrigger value="found" className="rounded-sm">Found</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search items..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 rounded-sm" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-44 rounded-sm"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Search size={28} className="text-muted-foreground" />
            </div>
            <h3 className="font-serif text-xl text-foreground mb-2">No items found</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">Try adjusting your filters or post a new item to get started.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setShowDetailModal(item)}
                  className="bg-card border border-border rounded-sm overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group"
                >
                  {item.photos?.length > 0 ? (
                    <div className="aspect-[16/10] overflow-hidden bg-muted">
                      <img src={item.photos[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="aspect-[16/10] bg-muted/50 flex items-center justify-center">
                      <Tag size={32} className="text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm ${
                        item.item_type === 'lost' 
                          ? 'bg-destructive/10 text-destructive' 
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {item.item_type}
                      </span>
                      <Badge variant="outline" className="text-[10px] rounded-sm">{item.category}</Badge>
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-1 line-clamp-1">{item.title}</h3>
                    {item.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3 font-light">{item.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border">
                      {item.location && (
                        <span className="flex items-center gap-1"><MapPin size={11} />{item.location}</span>
                      )}
                      <span className="flex items-center gap-1 ml-auto"><Clock size={11} />{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto sm:rounded-sm">
          <DialogHeader><DialogTitle className="font-serif text-2xl">Post Lost or Found Item</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Tabs value={form.item_type} onValueChange={v => setForm(f => ({ ...f, item_type: v }))}>
              <TabsList className="w-full rounded-sm">
                <TabsTrigger value="lost" className="flex-1 rounded-sm">I Lost Something</TabsTrigger>
                <TabsTrigger value="found" className="flex-1 rounded-sm">I Found Something</TabsTrigger>
              </TabsList>
            </Tabs>
            <Input placeholder="Item name *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="rounded-sm" />
            <Textarea placeholder="Description (color, brand, identifying features...)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="rounded-sm" />
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Location (e.g., Library 2nd floor)" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="rounded-sm" />
            <Input placeholder="Contact info (phone/WhatsApp)" value={form.contact_info} onChange={e => setForm(f => ({ ...f, contact_info: e.target.value }))} className="rounded-sm" />
            
            {/* Photos */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Photos</p>
              <div className="flex gap-2 flex-wrap">
                {form.photos.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 bg-muted rounded-sm overflow-hidden">
                    <img src={url} className="w-full h-full object-cover" />
                    <button onClick={() => setForm(f => ({ ...f, photos: f.photos.filter((_, idx) => idx !== i) }))}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-border rounded-sm flex items-center justify-center text-muted-foreground hover:border-accent hover:text-accent transition-colors">
                  {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUploadPhoto} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)} className="rounded-sm">Cancel</Button>
            <Button onClick={handleCreate} disabled={creating} className="rounded-sm">
              {creating ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              Post Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={!!showDetailModal} onOpenChange={() => setShowDetailModal(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto sm:rounded-sm">
          {showDetailModal && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm ${
                    showDetailModal.item_type === 'lost' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                  }`}>
                    {showDetailModal.item_type}
                  </span>
                  <Badge variant="outline" className="text-[10px] rounded-sm">{showDetailModal.category}</Badge>
                </div>
                <DialogTitle className="font-serif text-2xl">{showDetailModal.title}</DialogTitle>
              </DialogHeader>
              {showDetailModal.photos?.length > 0 && (
                <div className="flex gap-2 overflow-x-auto py-2">
                  {showDetailModal.photos.map((url, i) => (
                    <img key={i} src={url} className="h-48 object-cover rounded-sm" alt="" />
                  ))}
                </div>
              )}
              {showDetailModal.description && <p className="text-sm text-muted-foreground font-light leading-relaxed">{showDetailModal.description}</p>}
              <div className="space-y-2 text-sm border-t border-border pt-4">
                {showDetailModal.location && <p className="flex items-center gap-2"><MapPin size={14} className="text-accent" /> {showDetailModal.location}</p>}
                {showDetailModal.contact_info && <p className="flex items-center gap-2"><Phone size={14} className="text-accent" /> {showDetailModal.contact_info}</p>}
                <p className="flex items-center gap-2"><Clock size={14} className="text-muted-foreground" /> {formatDistanceToNow(new Date(showDetailModal.created_at), { addSuffix: true })}</p>
              </div>
              {currentUser === showDetailModal.user_id && (
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button variant="outline" size="sm" onClick={() => handleResolve(showDetailModal.id)} className="gap-1.5 rounded-sm">
                    <CheckCircle2 size={14} /> Mark Resolved
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(showDetailModal.id)} className="rounded-sm">
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
