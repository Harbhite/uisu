import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { OutputData } from '@editorjs/editorjs';
import { Json } from '@/integrations/supabase/types';

const EditorJSComponent = lazy(() => import('@/components/EditorJS'));

type PieceType = 'Article' | 'Blog' | 'Report' | 'Essay' | 'Poetry' | 'Opinion' | 'Interview' | 'Fiction';

interface FormData {
  type: PieceType;
  title: string;
  author_name: string;
  author_role: string;
  summary: string;
  content: OutputData;
  tags: string;
  is_published: boolean;
}

// Helper to safely convert Json to OutputData
const jsonToOutputData = (json: Json | null): OutputData => {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    return { time: Date.now(), blocks: [], version: '2.28.0' };
  }
  const obj = json as Record<string, unknown>;
  if (Array.isArray(obj.blocks)) {
    return obj as unknown as OutputData;
  }
  return { time: Date.now(), blocks: [], version: '2.28.0' };
};

const emptyContent: OutputData = {
  time: Date.now(),
  blocks: [],
  version: '2.28.0'
};

const InkEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isStaff, loading: authLoading } = useAdminCheck();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    type: 'Blog',
    title: '',
    author_name: '',
    author_role: '',
    summary: '',
    content: emptyContent,
    tags: '',
    is_published: false
  });

  // Non-mod piece types
  const userPieceTypes: PieceType[] = ['Blog', 'Fiction', 'Poetry', 'Essay', 'Opinion', 'Article', 'Interview'];
  // Mod-only types
  const allPieceTypes: PieceType[] = ['Report', ...userPieceTypes];

  const availableTypes = isStaff ? allPieceTypes : userPieceTypes;

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to write');
        navigate('/auth');
        return;
      }
      setUser(user);

      // Pre-fill author name from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (profile?.full_name) {
        setFormData(prev => ({ ...prev, author_name: profile.full_name || '' }));
      }

      // If editing, fetch the piece
      if (id) {
        const { data: piece, error } = await supabase
          .from('ink_pieces')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !piece) {
          toast.error('Piece not found');
          navigate('/inks-vault');
          return;
        }

        // Check permission
        if (piece.user_id !== user.id && !isStaff) {
          toast.error('You cannot edit this piece');
          navigate('/inks-vault');
          return;
        }

        setFormData({
          type: piece.type as PieceType,
          title: piece.title,
          author_name: piece.author_name,
          author_role: piece.author_role || '',
          summary: piece.summary || '',
          content: jsonToOutputData(piece.content),
          tags: (piece.tags || []).join(', '),
          is_published: piece.is_published || false
        });
      }

      setLoading(false);
    };

    if (!authLoading) {
      checkAuth();
    }
  }, [id, navigate, authLoading, isStaff]);

  const handleSave = async (publish = false) => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.author_name.trim()) {
      toast.error('Author name is required');
      return;
    }

    setSaving(true);
    try {
      const tagsArray = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const payload = {
        type: formData.type,
        title: formData.title,
        author_name: formData.author_name,
        author_role: formData.author_role || null,
        summary: formData.summary || null,
        content: formData.content as unknown as Json,
        tags: tagsArray,
        is_published: publish ? true : formData.is_published,
        user_id: user.id
      };

      if (id) {
        const { error } = await supabase
          .from('ink_pieces')
          .update(payload)
          .eq('id', id);

        if (error) throw error;
        toast.success(publish ? 'Published!' : 'Saved!');
      } else {
        const { error } = await supabase
          .from('ink_pieces')
          .insert(payload);

        if (error) throw error;
        toast.success(publish ? 'Published!' : 'Draft saved!');
        navigate('/inks-vault');
      }
    } catch (error: any) {
      console.error('Error saving:', error);
      toast.error(error.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this piece?')) return;

    try {
      const { error } = await supabase
        .from('ink_pieces')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Piece deleted');
      navigate('/inks-vault');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-nobel-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-16">
      <div className="container mx-auto px-6 max-w-4xl">
        <button
          onClick={() => navigate('/inks-vault')}
          className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors mb-8"
        >
          <div className="p-2 rounded-full border border-slate-300 group-hover:border-nobel-gold transition-colors">
            <ArrowLeft size={14} />
          </div>
          <span>Back to Inks Vault</span>
        </button>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <h1 className="text-3xl font-serif text-ui-blue mb-8">
            {id ? 'Edit Piece' : 'Create New Piece'}
          </h1>

          <div className="space-y-6">
            {/* Type Selection */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(v) => setFormData({ ...formData, type: v as PieceType })}
              >
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type} {type === 'Report' && '(Staff Only)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter a compelling title"
                className="text-lg"
              />
            </div>

            {/* Author Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Author Name *</Label>
                <Input
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Role/Title</Label>
                <Input
                  value={formData.author_role}
                  onChange={(e) => setFormData({ ...formData, author_role: e.target.value })}
                  placeholder="e.g., Student, Journalist, Official"
                />
              </div>
            </div>

            {/* Summary */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Summary</Label>
              <Textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Brief description of your piece (shown in cards)"
                rows={2}
              />
            </div>

            {/* Tags */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Tags (comma separated)</Label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., Politics, Culture, Sports"
              />
            </div>

            {/* Editor */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Content</Label>
              <Suspense fallback={<div className="min-h-[300px] bg-slate-100 rounded-lg animate-pulse" />}>
                <EditorJSComponent
                  data={formData.content}
                  onChange={(data) => setFormData({ ...formData, content: data })}
                  placeholder="Start writing your masterpiece..."
                />
              </Suspense>
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                {formData.is_published ? (
                  <Eye className="text-green-600" size={20} />
                ) : (
                  <EyeOff className="text-slate-400" size={20} />
                )}
                <div>
                  <p className="font-medium text-sm">
                    {formData.is_published ? 'Published' : 'Draft'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formData.is_published 
                      ? 'Visible to everyone' 
                      : 'Only you can see this'}
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <Button onClick={() => handleSave(false)} disabled={saving} variant="outline">
                {saving ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Save size={14} className="mr-2" />}
                Save Draft
              </Button>
              <Button onClick={() => handleSave(true)} disabled={saving}>
                {saving ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Eye size={14} className="mr-2" />}
                Publish
              </Button>
              {id && (
                <Button onClick={handleDelete} variant="destructive" className="ml-auto">
                  <Trash2 size={14} className="mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InkEditorPage;
