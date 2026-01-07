import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, History, Shield, Edit2, Save, X, Loader2 } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
        setHall(data);
        setEditForm(data);
      }
      setLoading(false);
    };

    fetchHall();
  }, [id, navigate]);

  const handleSave = async () => {
    if (!hall) return;
    
    setSaving(true);
    try {
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
        })
        .eq('id', hall.id);

      if (error) throw error;

      setHall({ ...hall, ...editForm });
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
            backgroundImage: hall.image_url ? `url(${hall.image_url})` : undefined, 
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

            {/* Gallery placeholder */}
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="aspect-video bg-slate-200 rounded-lg overflow-hidden relative group">
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-bold uppercase tracking-widest text-xs">View</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-8 shadow-lg border border-slate-100"
            >
              <h3 className="font-serif text-2xl text-slate-800 mb-6 border-b border-slate-100 pb-4">
                Hall Leadership
              </h3>
              <p className="text-sm text-slate-500 italic">Leadership information coming soon.</p>
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
    </div>
  );
};

export default HallDetailPage;
