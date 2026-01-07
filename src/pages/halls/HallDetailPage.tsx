import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, History, Shield, Edit2, Save, X, Loader2, Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HallLeader {
  id: string;
  name: string;
  position: string;
  image_url?: string;
}

interface Hall {
  id: string;
  name: string;
  alias: string | null;
  motto: string | null;
  description: string | null;
  history: string | null;
  lore: string | null;
  hall_type: string | null;
  capacity: number | null;
  established_year: number | null;
  color: string | null;
  image_url: string | null;
  gallery_images: string[] | null;
  leaders: HallLeader[] | null;
  slug: string;
}

const HallDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isStaff } = useAdminCheck();
  
  const [hall, setHall] = useState<Hall | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Hall>>({});
  
  // Leadership modal state
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [editingLeader, setEditingLeader] = useState<HallLeader | null>(null);
  const [leaderForm, setLeaderForm] = useState({ name: '', position: '', image_url: '' });
  const [uploadingLeaderImage, setUploadingLeaderImage] = useState(false);
  
  // Gallery modal state
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  
  const leaderImageRef = useRef<HTMLInputElement>(null);
  const galleryImageRef = useRef<HTMLInputElement>(null);
  const heroImageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchHall = async () => {
      if (!id) {
        navigate('/governance');
        return;
      }

      const { data, error } = await supabase
        .from('halls')
        .select('*')
        .eq('slug', id)
        .single();

      if (error || !data) {
        console.error('Hall not found:', error);
        setHall(null);
      } else {
        const hallData = {
          ...data,
          leaders: Array.isArray(data.leaders) ? data.leaders as unknown as HallLeader[] : []
        };
        setHall(hallData);
        setEditForm(hallData);
      }
      setLoading(false);
    };

    fetchHall();
  }, [id, navigate]);

  const handleSave = async () => {
    if (!hall) return;
    
    setSaving(true);
    try {
      // Convert leaders to JSON-safe format
      const leadersJson = (editForm.leaders || []).map(l => ({
        id: l.id,
        name: l.name,
        position: l.position,
        image_url: l.image_url || null
      }));

      const { error } = await supabase
        .from('halls')
        .update({
          name: editForm.name,
          alias: editForm.alias,
          motto: editForm.motto,
          description: editForm.description,
          history: editForm.history,
          lore: editForm.lore,
          hall_type: editForm.hall_type,
          capacity: editForm.capacity,
          established_year: editForm.established_year,
          color: editForm.color,
          image_url: editForm.image_url,
          gallery_images: editForm.gallery_images,
          leaders: leadersJson,
        })
        .eq('id', hall.id);

      if (error) throw error;

      setHall({ ...hall, ...editForm } as Hall);
      setIsEditing(false);
      toast.success('Hall details updated successfully');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm(hall || {});
    setIsEditing(false);
  };

  // Leadership management
  const handleAddLeader = () => {
    setEditingLeader(null);
    setLeaderForm({ name: '', position: '', image_url: '' });
    setShowLeaderModal(true);
  };

  const handleEditLeader = (leader: HallLeader) => {
    setEditingLeader(leader);
    setLeaderForm({ name: leader.name, position: leader.position, image_url: leader.image_url || '' });
    setShowLeaderModal(true);
  };

  const handleSaveLeader = async () => {
    if (!leaderForm.name || !leaderForm.position) {
      toast.error('Please fill in name and position');
      return;
    }

    const currentLeaders = editForm.leaders || [];
    
    if (editingLeader) {
      // Update existing
      const updatedLeaders = currentLeaders.map(l => 
        l.id === editingLeader.id ? { ...l, ...leaderForm } : l
      );
      setEditForm({ ...editForm, leaders: updatedLeaders });
    } else {
      // Add new
      const newLeader: HallLeader = {
        id: `leader-${Date.now()}`,
        ...leaderForm
      };
      setEditForm({ ...editForm, leaders: [...currentLeaders, newLeader] });
    }

    setShowLeaderModal(false);
    toast.success(editingLeader ? 'Leader updated' : 'Leader added');
  };

  const handleDeleteLeader = (leaderId: string) => {
    if (!confirm('Remove this leader?')) return;
    const updatedLeaders = (editForm.leaders || []).filter(l => l.id !== leaderId);
    setEditForm({ ...editForm, leaders: updatedLeaders });
    toast.success('Leader removed');
  };

  const handleUploadLeaderImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLeaderImage(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('leader-images')
        .upload(`halls/${fileName}`, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('leader-images')
        .getPublicUrl(`halls/${fileName}`);

      setLeaderForm({ ...leaderForm, image_url: urlData.publicUrl });
      toast.success('Image uploaded');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingLeaderImage(false);
    }
  };

  // Gallery management
  const handleUploadGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingGallery(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('club-images')
        .upload(`halls/gallery/${fileName}`, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('club-images')
        .getPublicUrl(`halls/gallery/${fileName}`);

      const currentGallery = editForm.gallery_images || [];
      setEditForm({ ...editForm, gallery_images: [...currentGallery, urlData.publicUrl] });
      toast.success('Gallery image added');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    const currentGallery = editForm.gallery_images || [];
    setEditForm({ ...editForm, gallery_images: currentGallery.filter((_, i) => i !== index) });
  };

  const handleUploadHeroImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHeroImage(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('club-images')
        .upload(`halls/hero/${fileName}`, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('club-images')
        .getPublicUrl(`halls/hero/${fileName}`);

      setEditForm({ ...editForm, image_url: urlData.publicUrl });
      toast.success('Hero image updated');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingHeroImage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!hall) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Hall Not Found</h2>
          <Button onClick={() => navigate('/governance')}>Return to Governance</Button>
        </div>
      </div>
    );
  }

  const hallColor = hall.color || '#1e40af';
  const leaders = isEditing ? (editForm.leaders || []) : (hall.leaders || []);
  const galleryImages = isEditing ? (editForm.gallery_images || []) : (hall.gallery_images || []);

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO
        title={`${hall.name} - UISU Archive`}
        description={hall.description || ''}
      />

      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: (isEditing ? editForm.image_url : hall.image_url) ? `url(${isEditing ? editForm.image_url : hall.image_url})` : undefined, 
            backgroundColor: hallColor 
          }}
        />

        <div className="absolute inset-0 z-20 flex flex-col justify-end pb-20 px-6 container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest border border-white/30">
                {isEditing ? (
                  <Input
                    value={editForm.alias || ''}
                    onChange={(e) => setEditForm({ ...editForm, alias: e.target.value })}
                    className="bg-transparent border-none text-white text-xs font-bold uppercase h-auto p-0"
                    placeholder="Alias"
                  />
                ) : (
                  hall.alias
                )}
              </span>
              <div className="h-px w-10 bg-white/50" />
              {hall.hall_type && (
                <span className="text-white/60 text-xs uppercase tracking-widest">
                  {hall.hall_type} Hall
                </span>
              )}
            </div>
            
            {isEditing ? (
              <Input
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="text-5xl md:text-7xl font-serif text-white mb-6 bg-transparent border-none h-auto"
              />
            ) : (
              <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight">
                {hall.name}
              </h1>
            )}
            
            {isEditing ? (
              <Input
                value={editForm.motto || ''}
                onChange={(e) => setEditForm({ ...editForm, motto: e.target.value })}
                className="text-xl md:text-2xl text-white/80 font-serif italic max-w-2xl bg-transparent border-none"
                placeholder="Hall motto"
              />
            ) : (
              <p className="text-xl md:text-2xl text-white/80 font-serif italic max-w-2xl">
                "{hall.motto}"
              </p>
            )}
          </motion.div>
        </div>

        {/* Admin Edit Button */}
        {isStaff && (
          <div className="absolute top-24 right-6 z-30 flex gap-2">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  onClick={() => heroImageRef.current?.click()}
                  disabled={uploadingHeroImage}
                >
                  {uploadingHeroImage ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                  <span className="ml-2 hidden sm:inline">Change Hero</span>
                </Button>
                <input ref={heroImageRef} type="file" accept="image/*" className="hidden" onChange={handleUploadHeroImage} />
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X size={16} className="mr-2" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 gap-2"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={16} />
                Edit Hall
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="container mx-auto px-6 py-16 -mt-20 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-10 shadow-xl border-t-4"
              style={{ borderTopColor: hallColor }}
            >
              <div className="flex items-center gap-3 mb-6 text-slate-400 font-bold uppercase text-xs tracking-widest">
                <History size={16} /> History & Origins
              </div>
              {isEditing ? (
                <Textarea
                  value={editForm.history || ''}
                  onChange={(e) => setEditForm({ ...editForm, history: e.target.value })}
                  className="min-h-[200px] text-lg text-slate-700 leading-relaxed font-light"
                  placeholder="Hall history..."
                />
              ) : (
                <p className="text-lg text-slate-700 leading-relaxed font-light">
                  {hall.history}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900 text-slate-300 p-10 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-5">
                <Shield size={200} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6 text-slate-400 font-bold uppercase text-xs tracking-widest">
                  <Shield size={16} /> Hall Lore & Traditions
                </div>
                {isEditing ? (
                  <Textarea
                    value={editForm.lore || ''}
                    onChange={(e) => setEditForm({ ...editForm, lore: e.target.value })}
                    className="min-h-[150px] text-lg leading-relaxed font-light bg-slate-800 border-slate-700 text-slate-300"
                    placeholder="Hall lore and traditions..."
                  />
                ) : (
                  <p className="text-lg leading-relaxed font-light">
                    {hall.lore}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Description */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-10 shadow-xl border border-slate-200"
              >
                <div className="flex items-center gap-3 mb-6 text-slate-400 font-bold uppercase text-xs tracking-widest">
                  Description
                </div>
                <Textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="min-h-[100px]"
                  placeholder="Brief description of the hall..."
                />
              </motion.div>
            )}

            {/* Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 shadow-xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 text-slate-400 font-bold uppercase text-xs tracking-widest">
                  <ImageIcon size={16} /> Gallery
                </div>
                {isEditing && (
                  <Button size="sm" variant="outline" onClick={() => galleryImageRef.current?.click()} disabled={uploadingGallery}>
                    {uploadingGallery ? <Loader2 size={14} className="animate-spin mr-2" /> : <Plus size={14} className="mr-2" />}
                    Add Image
                  </Button>
                )}
                <input ref={galleryImageRef} type="file" accept="image/*" className="hidden" onChange={handleUploadGalleryImage} />
              </div>
              
              {galleryImages.length === 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="aspect-video bg-slate-200 rounded-lg overflow-hidden relative group">
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                        No images yet
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryImages.map((img, idx) => (
                    <div key={idx} className="aspect-video bg-slate-200 rounded-lg overflow-hidden relative group">
                      <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      {isEditing && (
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveGalleryImage(idx)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-8 shadow-lg border border-slate-100"
            >
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h3 className="font-serif text-2xl text-slate-800">
                  Hall Leadership
                </h3>
                {isEditing && (
                  <Button size="sm" variant="outline" onClick={handleAddLeader}>
                    <Plus size={14} className="mr-1" /> Add
                  </Button>
                )}
              </div>
              
              {leaders.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No leadership information added yet.</p>
              ) : (
                <div className="space-y-4">
                  {leaders.map((leader) => (
                    <div key={leader.id} className="flex items-center gap-3 group">
                      <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                        {leader.image_url ? (
                          <img src={leader.image_url} alt={leader.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Users size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">{leader.name}</p>
                        <p className="text-xs text-slate-500">{leader.position}</p>
                      </div>
                      {isEditing && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEditLeader(leader)}>
                            <Edit2 size={12} />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => handleDeleteLeader(leader.id)}>
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-50 border border-slate-200 p-8"
            >
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-6">
                Quick Facts
              </h3>
              <ul className="space-y-4 text-sm text-slate-600">
                <li className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span>Established</span>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editForm.established_year || ''}
                      onChange={(e) => setEditForm({ ...editForm, established_year: parseInt(e.target.value) || null })}
                      className="w-24 h-8 text-right"
                      placeholder="Year"
                    />
                  ) : (
                    <span className="font-bold">{hall.established_year || 'N/A'}</span>
                  )}
                </li>
                <li className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span>Capacity</span>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editForm.capacity || ''}
                      onChange={(e) => setEditForm({ ...editForm, capacity: parseInt(e.target.value) || null })}
                      className="w-24 h-8 text-right"
                      placeholder="Capacity"
                    />
                  ) : (
                    <span className="font-bold">{hall.capacity ? `~${hall.capacity} Students` : 'N/A'}</span>
                  )}
                </li>
                <li className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span>Type</span>
                  {isEditing ? (
                    <select
                      value={editForm.hall_type || ''}
                      onChange={(e) => setEditForm({ ...editForm, hall_type: e.target.value })}
                      className="border border-slate-200 rounded px-2 py-1 text-sm"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  ) : (
                    <span className="font-bold capitalize">{hall.hall_type || 'N/A'}</span>
                  )}
                </li>
                {isEditing && (
                  <li className="flex justify-between items-center pt-2">
                    <span>Color</span>
                    <Input
                      type="color"
                      value={editForm.color || '#1e40af'}
                      onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                      className="w-16 h-8 p-0 border-none"
                    />
                  </li>
                )}
              </ul>
            </motion.div>

            <Button onClick={() => navigate('/governance')} variant="outline" className="w-full gap-2">
              <ArrowLeft size={14} /> Back to Governance
            </Button>
          </div>
        </div>
      </div>

      {/* Leader Modal */}
      <Dialog open={showLeaderModal} onOpenChange={setShowLeaderModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLeader ? 'Edit Leader' : 'Add Leader'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                {leaderForm.image_url ? (
                  <img src={leaderForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Users size={32} />
                  </div>
                )}
              </div>
              <Button variant="outline" onClick={() => leaderImageRef.current?.click()} disabled={uploadingLeaderImage}>
                {uploadingLeaderImage ? <Loader2 size={14} className="animate-spin mr-2" /> : <Upload size={14} className="mr-2" />}
                Upload Photo
              </Button>
              <input ref={leaderImageRef} type="file" accept="image/*" className="hidden" onChange={handleUploadLeaderImage} />
            </div>
            <Input
              placeholder="Name"
              value={leaderForm.name}
              onChange={(e) => setLeaderForm({ ...leaderForm, name: e.target.value })}
            />
            <Input
              placeholder="Position (e.g., Hall Warden, Porter)"
              value={leaderForm.position}
              onChange={(e) => setLeaderForm({ ...leaderForm, position: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeaderModal(false)}>Cancel</Button>
            <Button onClick={handleSaveLeader}>{editingLeader ? 'Update' : 'Add'} Leader</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HallDetailPage;
