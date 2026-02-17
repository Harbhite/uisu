import React, { useState, useEffect, useCallback } from 'react';
import ResourcePageLayout from './ResourcePageLayout';
import { ShoppingBag, Plus, Search, Filter, Camera, X, Loader2, MessageCircle, Phone, ExternalLink, Tag, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  price_type: string;
  category: string;
  condition: string;
  photos: string[];
  contact_method: string;
  contact_info: string | null;
  status: string;
  views_count: number;
  created_at: string;
}

const CATEGORIES = ['Books', 'Electronics', 'Appliances', 'Clothing', 'Stationery', 'Food', 'Services', 'Other'];
const CONDITIONS = [
  { value: 'new', label: 'Brand New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'used', label: 'Used' },
  { value: 'fair', label: 'Fair' },
];
const PRICE_TYPES = [
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'negotiable', label: 'Negotiable' },
  { value: 'free', label: 'Free' },
  { value: 'swap', label: 'Swap/Trade' },
];

const StudentMartPage = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // New listing form
  const [form, setForm] = useState({
    title: '', description: '', price: '', price_type: 'fixed',
    category: 'Other', condition: 'used', contact_method: 'whatsapp', contact_info: '',
  });
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);

    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (!error && data) setListings(data as Listing[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photoFiles.length + files.length > 4) {
      toast.error('Maximum 4 photos allowed');
      return;
    }
    setPhotoFiles(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreviews(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removePhoto = (idx: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== idx));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreate = async () => {
    if (!userId) { toast.error('Please sign in to post a listing'); return; }
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setCreating(true);

    try {
      // Upload photos
      const photoUrls: string[] = [];
      for (const file of photoFiles) {
        const ext = file.name.split('.').pop();
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from('marketplace').upload(path, file);
        if (uploadErr) throw uploadErr;
        const { data: { publicUrl } } = supabase.storage.from('marketplace').getPublicUrl(path);
        photoUrls.push(publicUrl);
      }

      const { error } = await supabase.from('marketplace_listings').insert({
        user_id: userId,
        title: form.title.trim(),
        description: form.description.trim() || null,
        price: form.price_type === 'free' ? 0 : parseFloat(form.price) || 0,
        price_type: form.price_type,
        category: form.category,
        condition: form.condition,
        photos: photoUrls,
        contact_method: form.contact_method,
        contact_info: form.contact_info.trim() || null,
      });

      if (error) throw error;
      toast.success('Listing posted!');
      setShowCreateDialog(false);
      setForm({ title: '', description: '', price: '', price_type: 'fixed', category: 'Other', condition: 'used', contact_method: 'whatsapp', contact_info: '' });
      setPhotoFiles([]);
      setPhotoPreviews([]);
      fetchListings();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create listing');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('marketplace_listings').delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); return; }
    toast.success('Listing removed');
    setSelectedListing(null);
    fetchListings();
  };

  const filtered = listings.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || l.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (listing: Listing) => {
    if (listing.price_type === 'free') return 'Free';
    if (listing.price_type === 'swap') return 'Swap/Trade';
    return `₦${listing.price.toLocaleString()}${listing.price_type === 'negotiable' ? ' (Negotiable)' : ''}`;
  };

  return (
    <ResourcePageLayout title="Student Mart" description="Buy, sell, and swap textbooks, gadgets, and essentials within campus.">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search listings..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-[180px]"><Filter size={14} className="mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700"><Plus size={16} className="mr-2" /> Post Item</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Post a Listing</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <Input placeholder="Item title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              <Textarea placeholder="Describe your item..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} />
              <div className="grid grid-cols-2 gap-3">
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.condition} onValueChange={v => setForm(p => ({ ...p, condition: v }))}>
                  <SelectTrigger><SelectValue placeholder="Condition" /></SelectTrigger>
                  <SelectContent>{CONDITIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select value={form.price_type} onValueChange={v => setForm(p => ({ ...p, price_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PRICE_TYPES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
                {form.price_type !== 'free' && form.price_type !== 'swap' && (
                  <Input placeholder="Price (₦)" type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
                )}
              </div>
              {/* Photos */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Photos (max 4)</label>
                <div className="grid grid-cols-4 gap-2">
                  {photoPreviews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5"><X size={12} className="text-white" /></button>
                    </div>
                  ))}
                  {photoPreviews.length < 4 && (
                    <label className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-teal-500 transition-colors">
                      <Camera size={20} className="text-muted-foreground" />
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
                    </label>
                  )}
                </div>
              </div>
              {/* Contact */}
              <div className="grid grid-cols-2 gap-3">
                <Select value={form.contact_method} onValueChange={v => setForm(p => ({ ...p, contact_method: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="in_app">In-App</SelectItem>
                  </SelectContent>
                </Select>
                {form.contact_method !== 'in_app' && (
                  <Input placeholder="Phone number" value={form.contact_info} onChange={e => setForm(p => ({ ...p, contact_info: e.target.value }))} />
                )}
              </div>
              <Button onClick={handleCreate} disabled={creating} className="w-full bg-teal-600 hover:bg-teal-700">
                {creating ? <><Loader2 size={16} className="animate-spin mr-2" /> Posting...</> : 'Post Listing'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-teal-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-border">
          <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="font-bold text-lg mb-2">No listings yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Be the first to post an item for sale or swap!</p>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-teal-600 hover:bg-teal-700"><Plus size={16} className="mr-2" /> Post Item</Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(listing => (
            <button
              key={listing.id}
              onClick={() => setSelectedListing(listing)}
              className="bg-white rounded-xl border border-border hover:shadow-lg transition-all text-left group overflow-hidden"
            >
              <AspectRatio ratio={4 / 3}>
                {listing.photos.length > 0 ? (
                  <img src={listing.photos[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <ShoppingBag size={40} className="text-muted-foreground" />
                  </div>
                )}
              </AspectRatio>
              <div className="p-4">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-bold text-foreground line-clamp-1">{listing.title}</h3>
                  <span className="font-bold text-teal-600 whitespace-nowrap text-sm">{formatPrice(listing)}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-[10px]">{listing.category}</Badge>
                  <Badge variant="outline" className="text-[10px]">{CONDITIONS.find(c => c.value === listing.condition)?.label}</Badge>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Listing Detail Dialog */}
      <Dialog open={!!selectedListing} onOpenChange={(open) => !open && setSelectedListing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedListing && (
            <>
              <DialogHeader><DialogTitle>{selectedListing.title}</DialogTitle></DialogHeader>
              {/* Photo Gallery */}
              {selectedListing.photos.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {selectedListing.photos.map((url, i) => (
                    <img key={i} src={url} alt="" className="w-full aspect-square object-cover rounded-lg" />
                  ))}
                </div>
              )}
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-teal-600">{formatPrice(selectedListing)}</span>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{selectedListing.category}</Badge>
                    <Badge variant="outline">{CONDITIONS.find(c => c.value === selectedListing.condition)?.label}</Badge>
                  </div>
                </div>
                {selectedListing.description && (
                  <p className="text-muted-foreground text-sm leading-relaxed">{selectedListing.description}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Eye size={14} /> {selectedListing.views_count} views
                  <span className="mx-1">·</span>
                  {new Date(selectedListing.created_at).toLocaleDateString()}
                </div>
                {/* Contact */}
                {selectedListing.contact_method === 'whatsapp' && selectedListing.contact_info && (
                  <a
                    href={`https://wa.me/${selectedListing.contact_info.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Hi, I would like to buy ${selectedListing.title} listed on UI'SU Space student mart`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <MessageCircle size={16} className="mr-2" /> WhatsApp Seller
                    </Button>
                  </a>
                )}
                {selectedListing.contact_method === 'phone' && selectedListing.contact_info && (
                  <a href={`tel:${selectedListing.contact_info}`}>
                    <Button className="w-full"><Phone size={16} className="mr-2" /> Call Seller</Button>
                  </a>
                )}
                {userId === selectedListing.user_id && (
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedListing.id)} className="w-full">
                    <Trash2 size={14} className="mr-2" /> Delete Listing
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </ResourcePageLayout>
  );
};

export default StudentMartPage;
