import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MapPin, Clock, Tag, Filter, X, Upload, Phone, MessageSquare, Loader2, Trash2, Eye } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Lost & Found - UISU SPACE" description="Report lost items or post found items on campus" />
      

      <div className="container mx-auto px-4 pt-28 pb-16 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-2">Lost & Found</h1>
            <p className="text-muted-foreground">Report lost items or help reunite found items with their owners.</p>
          </div>
          <Button onClick={() => currentUser ? setShowCreateModal(true) : toast.error('Please sign in')} className="gap-2 shrink-0">
            <Plus size={18} /> Post Item
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="lost">Lost</TabsTrigger>
              <TabsTrigger value="found">Found</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search items..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Search size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No items found</p>
            <p className="text-sm">Try adjusting your filters or post a new item.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setShowDetailModal(item)}
                  className="bg-card border border-border p-5 cursor-pointer hover:shadow-lg transition-shadow group"
                >
                  {item.photos?.length > 0 && (
                    <div className="aspect-video mb-4 overflow-hidden bg-muted">
                      <img src={item.photos[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={item.item_type === 'lost' ? 'destructive' : 'default'} className="text-xs uppercase tracking-wider">
                      {item.item_type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{item.category}</Badge>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{item.title}</h3>
                  {item.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {item.location && (
                      <span className="flex items-center gap-1"><MapPin size={12} />{item.location}</span>
                    )}
                    <span className="flex items-center gap-1"><Clock size={12} />{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Post Lost or Found Item</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Tabs value={form.item_type} onValueChange={v => setForm(f => ({ ...f, item_type: v }))}>
              <TabsList className="w-full">
                <TabsTrigger value="lost" className="flex-1">I Lost Something</TabsTrigger>
                <TabsTrigger value="found" className="flex-1">I Found Something</TabsTrigger>
              </TabsList>
            </Tabs>
            <Input placeholder="Item name *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Textarea placeholder="Description (color, brand, identifying features...)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Location (e.g., Library 2nd floor)" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            <Input placeholder="Contact info (phone/WhatsApp)" value={form.contact_info} onChange={e => setForm(f => ({ ...f, contact_info: e.target.value }))} />
            
            {/* Photos */}
            <div>
              <p className="text-sm font-medium mb-2">Photos</p>
              <div className="flex gap-2 flex-wrap">
                {form.photos.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 bg-muted overflow-hidden">
                    <img src={url} className="w-full h-full object-cover" />
                    <button onClick={() => setForm(f => ({ ...f, photos: f.photos.filter((_, idx) => idx !== i) }))}
                      className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary transition-colors">
                  {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUploadPhoto} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              Post Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={!!showDetailModal} onOpenChange={() => setShowDetailModal(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {showDetailModal && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={showDetailModal.item_type === 'lost' ? 'destructive' : 'default'} className="uppercase text-xs">
                    {showDetailModal.item_type}
                  </Badge>
                  <Badge variant="outline">{showDetailModal.category}</Badge>
                </div>
                <DialogTitle>{showDetailModal.title}</DialogTitle>
              </DialogHeader>
              {showDetailModal.photos?.length > 0 && (
                <div className="flex gap-2 overflow-x-auto py-2">
                  {showDetailModal.photos.map((url, i) => (
                    <img key={i} src={url} className="h-48 object-cover rounded" alt="" />
                  ))}
                </div>
              )}
              {showDetailModal.description && <p className="text-sm text-muted-foreground">{showDetailModal.description}</p>}
              <div className="space-y-2 text-sm">
                {showDetailModal.location && <p className="flex items-center gap-2"><MapPin size={14} className="text-primary" /> {showDetailModal.location}</p>}
                {showDetailModal.contact_info && <p className="flex items-center gap-2"><Phone size={14} className="text-primary" /> {showDetailModal.contact_info}</p>}
                <p className="flex items-center gap-2"><Clock size={14} className="text-muted-foreground" /> {formatDistanceToNow(new Date(showDetailModal.created_at), { addSuffix: true })}</p>
              </div>
              {currentUser === showDetailModal.user_id && (
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button variant="outline" size="sm" onClick={() => handleResolve(showDetailModal.id)}>Mark Resolved</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(showDetailModal.id)}><Trash2 size={14} /></Button>
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
