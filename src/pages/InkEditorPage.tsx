import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Eye, EyeOff, Trash2, Sparkles } from 'lucide-react';
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
  const [editorContent, setEditorContent] = useState<OutputData>(emptyContent);
  const [editorKey, setEditorKey] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    type: 'Blog',
    title: '',
    author_name: '',
    author_role: '',
    summary: '',
    tags: '',
    is_published: false
  });

  // Non-mod piece types
  const userPieceTypes: PieceType[] = ['Blog', 'Fiction', 'Poetry', 'Essay', 'Opinion', 'Article', 'Interview'];
  // Mod-only types
  const allPieceTypes: PieceType[] = ['Report', ...userPieceTypes];

  const availableTypes = isStaff ? allPieceTypes : userPieceTypes;

  const handleEditorChange = useCallback((data: OutputData) => {
    setEditorContent(data);
  }, []);

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

        const loadedContent = jsonToOutputData(piece.content);
        setEditorContent(loadedContent);
        setEditorKey(prev => prev + 1); // Force editor re-init with new data

        setFormData({
          type: piece.type as PieceType,
          title: piece.title,
          author_name: piece.author_name,
          author_role: piece.author_role || '',
          summary: piece.summary || '',
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
        content: editorContent as unknown as Json,
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
        const { data: newPiece, error } = await supabase
          .from('ink_pieces')
          .insert(payload)
          .select('id')
          .single();

        if (error) throw error;
        toast.success(publish ? 'Published!' : 'Draft saved!');
        // Navigate to edit the new piece
        if (newPiece) {
          navigate(`/inks-vault/edit/${newPiece.id}`, { replace: true });
        }
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/inks-vault')}
            className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors"
          >
            <div className="p-2 rounded-full border border-slate-300 group-hover:border-nobel-gold transition-colors">
              <ArrowLeft size={14} />
            </div>
            <span>Back to Vault</span>
          </button>

          <div className="flex items-center gap-3">
            <Button onClick={() => handleSave(false)} disabled={saving} variant="outline" size="sm">
              {saving ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Save size={14} className="mr-2" />}
              Save Draft
            </Button>
            <Button onClick={() => handleSave(true)} disabled={saving} size="sm" className="bg-nobel-gold hover:bg-nobel-gold/90 text-ui-blue">
              {saving ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Eye size={14} className="mr-2" />}
              Publish
            </Button>
          </div>
        </div>

        {/* Main Editor Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Title Bar */}
          <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-4">
            <div className="flex items-center gap-4">
              <Sparkles className="text-nobel-gold" size={20} />
              <h1 className="text-lg font-semibold text-slate-800">
                {id ? 'Edit Your Piece' : 'Create Something New'}
              </h1>
            </div>
          </div>

          <div className="p-8">
            {/* Meta Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div>
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(v) => setFormData({ ...formData, type: v as PieceType })}
                >
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type} {type === 'Report' && '(Staff)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Author</Label>
                <Input
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  placeholder="Your name"
                  className="bg-slate-50 border-slate-200"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Role/Title</Label>
                <Input
                  value={formData.author_role}
                  onChange={(e) => setFormData({ ...formData, author_role: e.target.value })}
                  placeholder="e.g., Student, Writer"
                  className="bg-slate-50 border-slate-200"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Tags</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Culture, Sports..."
                  className="bg-slate-50 border-slate-200"
                />
              </div>
            </div>

            {/* Title Input */}
            <div className="mb-6">
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Untitled"
                className="text-3xl md:text-4xl font-serif border-0 border-b border-slate-200 rounded-none px-0 py-4 focus-visible:ring-0 focus-visible:border-nobel-gold placeholder:text-slate-300"
              />
            </div>

            {/* Summary */}
            <div className="mb-8">
              <Textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Write a brief summary that will appear in cards..."
                rows={2}
                className="bg-slate-50 border-slate-200 resize-none text-slate-600"
              />
            </div>

            {/* Editor */}
            <div className="mb-8">
              <Suspense fallback={
                <div className="min-h-[400px] bg-slate-50 rounded-xl flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              }>
                <EditorJSComponent
                  key={editorKey}
                  data={editorContent}
                  onChange={handleEditorChange}
                  placeholder="Start writing your masterpiece..."
                />
              </Suspense>
            </div>

            {/* Footer Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg">
                  {formData.is_published ? (
                    <Eye className="text-green-600" size={18} />
                  ) : (
                    <EyeOff className="text-slate-400" size={18} />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {formData.is_published ? 'Published' : 'Draft'}
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                </div>
              </div>

              {id && (
                <Button onClick={handleDelete} variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
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
