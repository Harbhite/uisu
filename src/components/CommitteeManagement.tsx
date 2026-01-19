import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit2, Trash2, Save, Loader2, Users, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Committee {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  type: string;
  icon_name: string | null;
  chairperson: string | null;
  secretary: string | null;
  members: string[] | null;
  mandate: string[] | null;
  meeting_schedule: string | null;
  is_active: boolean | null;
}

interface CommitteeFormData {
  title: string;
  slug: string;
  description: string;
  type: string;
  icon_name: string;
  chairperson: string;
  secretary: string;
  members: string;
  mandate: string;
  meeting_schedule: string;
}

const iconOptions = [
  { value: 'Coins', label: 'Finance' },
  { value: 'Scale', label: 'Justice' },
  { value: 'FileText', label: 'Documents' },
  { value: 'Heart', label: 'Welfare' },
  { value: 'Trophy', label: 'Sports' },
  { value: 'Globe', label: 'Press' },
  { value: 'Briefcase', label: 'Academic' },
  { value: 'Building2', label: 'Projects' },
  { value: 'Activity', label: 'Health' },
  { value: 'Users', label: 'General' },
];

const typeOptions = [
  { value: 'Standing', label: 'Standing' },
  { value: 'Statutory', label: 'Statutory' },
  { value: 'Judicial', label: 'Judicial' },
  { value: 'Executive', label: 'Executive' },
  { value: 'Ad-hoc', label: 'Ad-hoc' },
  { value: 'Social', label: 'Social' },
  { value: 'Welfare', label: 'Welfare' },
];

export const CommitteeManagement: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}> = ({ isOpen, onClose, onUpdate }) => {
  const { isStaff, loading: authLoading } = useAdminCheck();
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingCommittee, setEditingCommittee] = useState<Committee | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CommitteeFormData>({
    title: '',
    slug: '',
    description: '',
    type: 'Standing',
    icon_name: 'Users',
    chairperson: '',
    secretary: '',
    members: '',
    mandate: '',
    meeting_schedule: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchCommittees();
    }
  }, [isOpen]);

  const fetchCommittees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('committees')
      .select('*')
      .order('title');

    if (error) {
      toast.error('Failed to load committees');
    } else {
      setCommittees(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      type: 'Standing',
      icon_name: 'Users',
      chairperson: '',
      secretary: '',
      members: '',
      mandate: '',
      meeting_schedule: '',
    });
    setEditingCommittee(null);
    setIsCreating(false);
  };

  const handleEdit = (committee: Committee) => {
    setEditingCommittee(committee);
    setFormData({
      title: committee.title,
      slug: committee.slug,
      description: committee.description || '',
      type: committee.type,
      icon_name: committee.icon_name || 'Users',
      chairperson: committee.chairperson || '',
      secretary: committee.secretary || '',
      members: committee.members?.join(', ') || '',
      mandate: committee.mandate?.join('\n') || '',
      meeting_schedule: committee.meeting_schedule || '',
    });
    setIsCreating(true);
  };

  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-').replace(/[^\w-]+/g, '');
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setSaving(true);
    
    const committeeData = {
      title: formData.title,
      slug: formData.slug || generateSlug(formData.title),
      description: formData.description || null,
      type: formData.type,
      icon_name: formData.icon_name || null,
      chairperson: formData.chairperson || null,
      secretary: formData.secretary || null,
      members: formData.members ? formData.members.split(',').map(m => m.trim()).filter(Boolean) : null,
      mandate: formData.mandate ? formData.mandate.split('\n').map(m => m.trim()).filter(Boolean) : null,
      meeting_schedule: formData.meeting_schedule || null,
    };

    let error;
    if (editingCommittee) {
      const { error: updateError } = await supabase
        .from('committees')
        .update(committeeData)
        .eq('id', editingCommittee.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('committees')
        .insert(committeeData);
      error = insertError;
    }

    if (error) {
      toast.error(editingCommittee ? 'Failed to update committee' : 'Failed to create committee');
    } else {
      toast.success(editingCommittee ? 'Committee updated!' : 'Committee created!');
      resetForm();
      fetchCommittees();
      onUpdate?.();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this committee?')) return;
    
    const { error } = await supabase
      .from('committees')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete committee');
    } else {
      toast.success('Committee deleted');
      fetchCommittees();
      onUpdate?.();
    }
  };

  if (!isStaff && !authLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Manage Committees</DialogTitle>
        </DialogHeader>

        {isCreating ? (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) })}
                  placeholder="Committee name"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="url-slug"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Type</label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Icon</label>
                <Select value={formData.icon_name} onValueChange={(value) => setFormData({ ...formData, icon_name: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Committee description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Chairperson</label>
                <Input
                  value={formData.chairperson}
                  onChange={(e) => setFormData({ ...formData, chairperson: e.target.value })}
                  placeholder="Chairperson name"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Secretary</label>
                <Input
                  value={formData.secretary}
                  onChange={(e) => setFormData({ ...formData, secretary: e.target.value })}
                  placeholder="Secretary name"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Members (comma-separated)</label>
              <Input
                value={formData.members}
                onChange={(e) => setFormData({ ...formData, members: e.target.value })}
                placeholder="Member 1, Member 2, Member 3"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Mandate (one per line)</label>
              <Textarea
                value={formData.mandate}
                onChange={(e) => setFormData({ ...formData, mandate: e.target.value })}
                placeholder="First mandate point&#10;Second mandate point"
                rows={4}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Meeting Schedule</label>
              <Input
                value={formData.meeting_schedule}
                onChange={(e) => setFormData({ ...formData, meeting_schedule: e.target.value })}
                placeholder="e.g., Every Monday at 4pm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                {editingCommittee ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <Button onClick={handleCreate} className="w-full">
              <Plus className="mr-2" size={16} /> Add New Committee
            </Button>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-slate-400" size={32} />
              </div>
            ) : (
              <div className="space-y-2">
                {committees.map((committee) => (
                  <div
                    key={committee.id}
                    className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div>
                      <h4 className="font-serif text-lg text-ui-blue">{committee.title}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {committee.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(committee)}>
                        <Edit2 size={14} />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(committee.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CommitteeManagement;
