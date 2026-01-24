import React, { useState, useRef } from 'react';
import { X, Loader2, ImagePlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Club } from '@/components/Communities';

interface ClubEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  club: Club | null;
  onSave: () => void;
}

const CATEGORIES = ['Sociocultural', 'Academic', 'Religious', 'Press', 'Tech', 'Sports', 'Politics'];
const ICONS = ['Award', 'Globe', 'Heart', 'Cpu', 'Users', 'Gavel', 'Palette', 'Star'];

export const ClubEditModal: React.FC<ClubEditModalProps> = ({
  isOpen,
  onClose,
  club,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHeader, setUploadingHeader] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: club?.name || '',
    acronym: club?.acronym || '',
    category: club?.category || 'Academic',
    founded: club?.founded || '',
    motto: club?.motto || '',
    description: club?.description || '',
    activities: club?.activities?.join(', ') || '',
    president: club?.president || '',
    color: club?.color || '#6d28d9',
    iconName: club?.iconName || 'Star',
    imageUrl: club?.imageUrl || '',
    headerImageUrl: club?.headerImageUrl || ''
  });

  if (!isOpen) return null;

  const handleImageUpload = async (file: File, type: 'logo' | 'header') => {
    if (type === 'logo') setUploadingLogo(true);
    else setUploadingHeader(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('club-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('club-images')
        .getPublicUrl(fileName);

      if (type === 'logo') {
        setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
      } else {
        setFormData(prev => ({ ...prev, headerImageUrl: publicUrl }));
      }
      toast.success(`${type === 'logo' ? 'Logo' : 'Header'} uploaded`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      else setUploadingHeader(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Club name is required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        acronym: formData.acronym || null,
        category: formData.category,
        founded: formData.founded || null,
        motto: formData.motto || null,
        description: formData.description || null,
        activities: formData.activities.split(',').map(a => a.trim()).filter(Boolean),
        president: formData.president || null,
        color: formData.color,
        icon_name: formData.iconName,
        image_url: formData.imageUrl || null,
        header_image_url: formData.headerImageUrl || null
      };

      if (club?.id) {
        const { error } = await supabase
          .from('clubs')
          .update(payload)
          .eq('id', club.id);
        if (error) throw error;
        toast.success('Club updated');
      } else {
        const { error } = await supabase
          .from('clubs')
          .insert(payload);
        if (error) throw error;
        toast.success('Club created');
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save club');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold">
            {club?.id ? 'Edit Club' : 'Add New Club'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">Club Name *</Label>
              <Input
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., National Association of..."
                className="bg-muted/50"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">Acronym</Label>
              <Input
                value={formData.acronym}
                onChange={e => setFormData(prev => ({ ...prev, acronym: e.target.value }))}
                placeholder="e.g., NACOSS"
                className="bg-muted/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">Category</Label>
              <Select value={formData.category} onValueChange={v => setFormData(prev => ({ ...prev, category: v }))}>
                <SelectTrigger className="bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">Founded</Label>
              <Input
                value={formData.founded}
                onChange={e => setFormData(prev => ({ ...prev, founded: e.target.value }))}
                placeholder="e.g., 1965"
                className="bg-muted/50"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">Icon</Label>
              <Select value={formData.iconName} onValueChange={v => setFormData(prev => ({ ...prev, iconName: v }))}>
                <SelectTrigger className="bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICONS.map(icon => (
                    <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">President</Label>
              <Input
                value={formData.president}
                onChange={e => setFormData(prev => ({ ...prev, president: e.target.value }))}
                placeholder="Current president name"
                className="bg-muted/50"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">Brand Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-12 h-10 rounded border border-border cursor-pointer"
                />
                <Input
                  value={formData.color}
                  onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="bg-muted/50 flex-1"
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-2 block">Motto</Label>
            <Input
              value={formData.motto}
              onChange={e => setFormData(prev => ({ ...prev, motto: e.target.value }))}
              placeholder="Club motto or slogan"
              className="bg-muted/50"
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-2 block">Description</Label>
            <Textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="A brief description of the club's mission and activities..."
              rows={4}
              className="bg-muted/50"
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-2 block">Activities (comma separated)</Label>
            <Input
              value={formData.activities}
              onChange={e => setFormData(prev => ({ ...prev, activities: e.target.value }))}
              placeholder="Annual Week, Symposiums, Debates..."
              className="bg-muted/50"
            />
          </div>

          {/* Image Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">Club Logo</Label>
              <input
                type="file"
                ref={logoInputRef}
                onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')}
                accept="image/*"
                className="hidden"
              />
              {formData.imageUrl ? (
                <div className="relative group aspect-square w-32 rounded-xl overflow-hidden border border-border">
                  <img src={formData.imageUrl} alt="Logo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="icon" variant="secondary" onClick={() => logoInputRef.current?.click()}>
                      <ImagePlus size={16} />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="w-32 aspect-square border-2 border-dashed border-border hover:border-accent rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-accent transition-colors"
                >
                  {uploadingLogo ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
                  <span className="text-xs">Upload</span>
                </button>
              )}
            </div>

            {/* Header */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">Header Banner</Label>
              <input
                type="file"
                ref={headerInputRef}
                onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'header')}
                accept="image/*"
                className="hidden"
              />
              {formData.headerImageUrl ? (
                <div className="relative group aspect-[3/1] rounded-xl overflow-hidden border border-border">
                  <img src={formData.headerImageUrl} alt="Header" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="icon" variant="secondary" onClick={() => headerInputRef.current?.click()}>
                      <ImagePlus size={16} />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => setFormData(prev => ({ ...prev, headerImageUrl: '' }))}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => headerInputRef.current?.click()}
                  disabled={uploadingHeader}
                  className="w-full aspect-[3/1] border-2 border-dashed border-border hover:border-accent rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-accent transition-colors"
                >
                  {uploadingHeader ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
                  <span className="text-xs">Upload Banner (1200×400)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-accent hover:bg-accent/90 text-primary">
            {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
            {club?.id ? 'Update Club' : 'Create Club'}
          </Button>
        </div>
      </div>
    </div>
  );
};
