import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Coins, Scale, FileText, Heart, Trophy, Globe, Briefcase, 
  Building2, Users, Calendar, CheckCircle2, User, UserCheck, Edit2, Save, 
  X, Loader2, Activity, Plus, Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';

interface Committee {
  id: string;
  title: string;
  slug: string;
  type: string;
  icon_name: string | null;
  description: string | null;
  chairperson: string | null;
  secretary: string | null;
  mandate: string[];
  members: string[];
  meeting_schedule: string | null;
  is_active: boolean;
}

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  Coins: <Coins size={48} />,
  Scale: <Scale size={48} />,
  FileText: <FileText size={48} />,
  Heart: <Heart size={48} />,
  Trophy: <Trophy size={48} />,
  Globe: <Globe size={48} />,
  Briefcase: <Briefcase size={48} />,
  Building2: <Building2 size={48} />,
  Activity: <Activity size={48} />,
};

const CommitteeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isStaff } = useAdminCheck();

  const [committee, setCommittee] = useState<Committee | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Committee>>({});
  const [newMandate, setNewMandate] = useState('');
  const [newMember, setNewMember] = useState('');

  useEffect(() => {
    const fetchCommittee = async () => {
      if (!id) {
        navigate('/governance');
        return;
      }

      const { data, error } = await supabase
        .from('committees')
        .select('*')
        .eq('slug', id)
        .single();

      if (error || !data) {
        console.error('Committee not found:', error);
        setCommittee(null);
      } else {
        setCommittee(data as Committee);
        setEditForm(data as Committee);
      }
      setLoading(false);
    };

    fetchCommittee();
  }, [id, navigate]);

  const handleSave = async () => {
    if (!committee) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('committees')
        .update({
          title: editForm.title,
          type: editForm.type,
          description: editForm.description,
          chairperson: editForm.chairperson,
          secretary: editForm.secretary,
          mandate: editForm.mandate,
          members: editForm.members,
          meeting_schedule: editForm.meeting_schedule,
        })
        .eq('id', committee.id);

      if (error) throw error;

      setCommittee({ ...committee, ...editForm } as Committee);
      setIsEditing(false);
      toast.success('Committee updated successfully');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm(committee || {});
    setIsEditing(false);
  };

  const handleAddMandate = () => {
    if (!newMandate.trim()) return;
    const currentMandate = editForm.mandate || [];
    setEditForm({ ...editForm, mandate: [...currentMandate, newMandate.trim()] });
    setNewMandate('');
  };

  const handleRemoveMandate = (index: number) => {
    const currentMandate = editForm.mandate || [];
    setEditForm({ ...editForm, mandate: currentMandate.filter((_, i) => i !== index) });
  };

  const handleAddMember = () => {
    if (!newMember.trim()) return;
    const currentMembers = editForm.members || [];
    setEditForm({ ...editForm, members: [...currentMembers, newMember.trim()] });
    setNewMember('');
  };

  const handleRemoveMember = (index: number) => {
    const currentMembers = editForm.members || [];
    setEditForm({ ...editForm, members: currentMembers.filter((_, i) => i !== index) });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!committee) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-serif text-ui-blue mb-4">Committee Not Found</h2>
        <button onClick={() => navigate('/governance')} className="text-nobel-gold hover:underline">
          Return to Governance
        </button>
      </div>
    );
  }

  const icon = committee.icon_name ? iconMap[committee.icon_name] : <Users size={48} />;
  const mandate = isEditing ? (editForm.mandate || []) : committee.mandate;
  const members = isEditing ? (editForm.members || []) : committee.members;

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-16">
      <SEO
        title={`${committee.title} - Governance`}
        description={committee.description || ''}
      />
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="flex items-center justify-between mb-12">
          <Link
            to="/governance"
            className="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors"
          >
            <div className="p-2 rounded-full border border-slate-300 group-hover:border-nobel-gold transition-colors">
              <ArrowLeft size={14} />
            </div>
            <span>Back to Structure</span>
          </Link>

          {isStaff && !isEditing && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="gap-2"
            >
              <Edit2 size={14} />
              Edit Committee
            </Button>
          )}

          {isEditing && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCancel} disabled={saving}>
                <X size={14} className="mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
                Save
              </Button>
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 p-8 md:p-12 shadow-sm rounded-sm"
        >
          <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
            <div className="p-6 bg-slate-50 text-ui-blue rounded-sm border border-slate-100">
              {icon}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <select
                  value={editForm.type || ''}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  className="mb-4 py-1 px-3 border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-400 rounded-sm"
                >
                  <option value="Legislative">Legislative</option>
                  <option value="Executive">Executive</option>
                  <option value="Judicial/Legislative">Judicial/Legislative</option>
                  <option value="Executive/Ad-hoc">Executive/Ad-hoc</option>
                </select>
              ) : (
                <span className="inline-block py-1 px-3 border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 rounded-sm">
                  {committee.type}
                </span>
              )}

              {isEditing ? (
                <Input
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="text-4xl md:text-5xl font-serif text-ui-blue mb-6"
                />
              ) : (
                <h1 className="text-4xl md:text-5xl font-serif text-ui-blue mb-6 leading-tight">
                  {committee.title}
                </h1>
              )}

              {isEditing ? (
                <Textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="text-lg text-slate-600 leading-relaxed font-light"
                  placeholder="Committee description..."
                />
              ) : (
                <p className="text-lg text-slate-600 leading-relaxed font-light">
                  {committee.description}
                </p>
              )}
            </div>
          </div>

          {/* Leadership Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 p-6 bg-slate-50 border border-slate-100 rounded-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 text-nobel-gold">
                <User size={24} />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Chairperson</span>
                {isEditing ? (
                  <Input
                    value={editForm.chairperson || ''}
                    onChange={(e) => setEditForm({ ...editForm, chairperson: e.target.value })}
                    className="font-serif text-xl text-ui-blue"
                    placeholder="Chairperson name"
                  />
                ) : (
                  <h4 className="font-serif text-xl text-ui-blue">{committee.chairperson}</h4>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 text-nobel-gold">
                <UserCheck size={24} />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Secretary</span>
                {isEditing ? (
                  <Input
                    value={editForm.secretary || ''}
                    onChange={(e) => setEditForm({ ...editForm, secretary: e.target.value })}
                    className="font-serif text-xl text-ui-blue"
                    placeholder="Secretary name"
                  />
                ) : (
                  <h4 className="font-serif text-xl text-ui-blue">{committee.secretary}</h4>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Mandate Section */}
            <div>
              <h3 className="flex items-center gap-3 text-xl font-serif text-ui-blue mb-6 pb-4 border-b border-slate-100">
                <CheckCircle2 size={20} className="text-nobel-gold" />
                Mandate & Duties
              </h3>
              <ul className="space-y-4">
                {mandate.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-600 group">
                    <span className="mt-2 w-1.5 h-1.5 bg-slate-300 rounded-full flex-shrink-0"></span>
                    <span className="leading-relaxed flex-1">{item}</span>
                    {isEditing && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={() => handleRemoveMandate(index)}
                      >
                        <Trash2 size={12} className="text-red-500" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
              {isEditing && (
                <div className="mt-4 flex gap-2">
                  <Input
                    value={newMandate}
                    onChange={(e) => setNewMandate(e.target.value)}
                    placeholder="Add new mandate..."
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMandate()}
                  />
                  <Button size="sm" onClick={handleAddMandate}>
                    <Plus size={14} />
                  </Button>
                </div>
              )}
            </div>

            {/* Members Section */}
            <div>
              <h3 className="flex items-center gap-3 text-xl font-serif text-ui-blue mb-6 pb-4 border-b border-slate-100">
                <Users size={20} className="text-nobel-gold" />
                Other Members
              </h3>
              <div className="bg-slate-50 p-6 rounded-sm border border-slate-100">
                <ul className="space-y-3">
                  {members.map((member, index) => (
                    <li key={index} className="flex items-center gap-3 text-slate-700 font-medium group">
                      <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs text-slate-400">
                        {index + 1}
                      </div>
                      <span className="flex-1">{member}</span>
                      {isEditing && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => handleRemoveMember(index)}
                        >
                          <Trash2 size={12} className="text-red-500" />
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
                {isEditing && (
                  <div className="mt-4 flex gap-2">
                    <Input
                      value={newMember}
                      onChange={(e) => setNewMember(e.target.value)}
                      placeholder="Add new member..."
                      className="flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                    />
                    <Button size="sm" onClick={handleAddMember}>
                      <Plus size={14} />
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <h3 className="flex items-center gap-3 text-xl font-serif text-ui-blue mb-6 pb-4 border-b border-slate-100">
                  <Calendar size={20} className="text-nobel-gold" />
                  Meeting Schedule
                </h3>
                {isEditing ? (
                  <Input
                    value={editForm.meeting_schedule || ''}
                    onChange={(e) => setEditForm({ ...editForm, meeting_schedule: e.target.value })}
                    placeholder="Meeting schedule..."
                    className="italic"
                  />
                ) : (
                  <p className="text-slate-600 italic">
                    {committee.meeting_schedule}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CommitteeDetailPage;