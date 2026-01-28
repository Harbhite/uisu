import React, { useState, useEffect, lazy, Suspense, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Eye, Trash2, ImagePlus, X, BookOpen, ChevronDown, Clock, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { OutputData } from '@editorjs/editorjs';
import { Json } from '@/integrations/supabase/types';
import { SEO } from '@/components/SEO';
import { useAutosave, calculateWordCount, calculateReadingTime } from '@/hooks/useAutosave';
import { InkPreviewModal } from '@/components/InkPreviewModal';
import { PoetryLayoutSelector, PoetryLayout } from '@/components/PoetryLayoutSelector';
import { PoetryEditor, PoetryStanza } from '@/components/PoetryEditor';
import { PoetryCoverGenerator } from '@/components/PoetryCoverGenerator';

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
  cover_image: string | null;
  poetry_layout: PoetryLayout;
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

const defaultFormData: FormData = {
  type: 'Blog',
  title: '',
  author_name: '',
  author_role: '',
  summary: '',
  tags: '',
  is_published: false,
  cover_image: null,
  poetry_layout: 'classic'
};

const InkEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isStaff, loading: authLoading } = useAdminCheck();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [editorContent, setEditorContent] = useState<OutputData>(emptyContent);
  const [editorKey, setEditorKey] = useState(0);
  const [pieceId, setPieceId] = useState<string | null>(id || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);

  // Word count and reading time
  const wordCount = useMemo(() => calculateWordCount(editorContent), [editorContent]);
  const readingTime = useMemo(() => calculateReadingTime(wordCount), [wordCount]);

  // Autosave functionality
  const autosaveData = useMemo(() => ({
    formData,
    editorContent,
    pieceId,
    userId: user?.id
  }), [formData, editorContent, pieceId, user?.id]);

  const handleAutosave = useCallback(async (data: typeof autosaveData) => {
    if (!data.userId || !data.formData.title.trim()) return;
    
    try {
      const tagsArray = data.formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const payload = {
        type: data.formData.type,
        title: data.formData.title,
        author_name: data.formData.author_name,
        author_role: data.formData.author_role || null,
        summary: data.formData.summary || null,
        content: data.editorContent as unknown as Json,
        tags: tagsArray,
        is_published: data.formData.is_published,
        user_id: data.userId,
        cover_image: data.formData.cover_image,
        poetry_layout: data.formData.type === 'Poetry' ? data.formData.poetry_layout : null
      };

      if (data.pieceId) {
        await supabase
          .from('ink_pieces')
          .update(payload)
          .eq('id', data.pieceId);
      } else {
        const { data: newPiece } = await supabase
          .from('ink_pieces')
          .insert(payload)
          .select('id')
          .single();
        
        if (newPiece) {
          setPieceId(newPiece.id);
          window.history.replaceState(null, '', `/inks-vault/edit/${newPiece.id}`);
        }
      }
    } catch (error) {
      console.error('Autosave failed:', error);
    }
  }, []);

  const { lastSaved, isSaving: isAutosaving } = useAutosave({
    data: autosaveData,
    onSave: handleAutosave,
    interval: 30000,
    enabled: !!user && formData.title.trim().length > 0
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
        setEditorKey(prev => prev + 1);

        setFormData({
          type: piece.type as PieceType,
          title: piece.title,
          author_name: piece.author_name,
          author_role: piece.author_role || '',
          summary: piece.summary || '',
          tags: (piece.tags || []).join(', '),
          is_published: piece.is_published || false,
          cover_image: piece.cover_image || null,
          poetry_layout: (piece.poetry_layout as PoetryLayout) || 'classic'
        });
      }

      setLoading(false);
    };

    if (!authLoading) {
      checkAuth();
    }
  }, [id, navigate, authLoading, isStaff]);

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`ink-covers/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(`ink-covers/${fileName}`);

      setFormData({ ...formData, cover_image: publicUrl });
      toast.success('Cover image uploaded');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeCoverImage = () => {
    setFormData({ ...formData, cover_image: null });
  };

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
        user_id: user.id,
        cover_image: formData.cover_image,
        poetry_layout: formData.type === 'Poetry' ? formData.poetry_layout : null
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
        if (newPiece) {
          navigate(`/inks-vault/edit/${newPiece.id}`, { replace: true });
        }
      }
    } catch (error) {
      console.error('Error saving:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save';
      toast.error(errorMessage);
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete';
      toast.error(errorMessage);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <SEO
        title={id ? 'Edit Piece' : 'New Piece'}
        description="Write and publish your content to the Inks Vault."
        image={id ? '/screenshots/ink-editor-edit.png' : '/screenshots/ink-editor-new.png'}
      />

      {/* Preview Modal */}
      <InkPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        formData={formData}
        content={editorContent}
      />
      
      {/* Sticky Header Bar */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/inks-vault')}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: formData.is_published ? '#22c55e' : '#f59e0b' }}
                />
                <span className="text-xs font-medium text-muted-foreground">
                  {formData.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              {/* Autosave status */}
              <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                {isAutosaving ? (
                  <><Loader2 size={12} className="animate-spin" /> Saving...</>
                ) : lastSaved ? (
                  <><Clock size={12} /> Saved {lastSaved.toLocaleTimeString()}</>
                ) : null}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Word count & reading time */}
              <div className="hidden md:flex items-center gap-3 mr-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText size={12} /> {wordCount} words
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {readingTime} min read
                </span>
              </div>
              
              {/* Preview button */}
              <Button 
                onClick={() => setShowPreview(true)} 
                variant="outline" 
                size="sm"
                className="text-muted-foreground"
              >
                <Eye size={14} className="mr-2" />
                Preview
              </Button>
              
              <Button 
                onClick={() => handleSave(false)} 
                disabled={saving} 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                {saving ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Save size={14} className="mr-2" />}
                Save
              </Button>
              <Button 
                onClick={() => handleSave(true)} 
                disabled={saving} 
                size="sm" 
                className="bg-accent hover:bg-accent/90 text-primary"
              >
                {formData.is_published ? 'Update' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          
          {/* Meta Panel - Collapsible */}
          <div className="mb-8 bg-card border border-border rounded-xl overflow-hidden">
            <details className="group" open>
              <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    <BookOpen size={16} />
                  </div>
                  <span className="text-sm font-medium">Piece Settings</span>
                </div>
                <ChevronDown size={16} className="text-muted-foreground group-open:rotate-180 transition-transform" />
              </summary>
              
              <div className="px-6 pb-6 space-y-6 border-t border-border pt-6">
                {/* Type & Author Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-2 block">Type</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(v) => setFormData({ ...formData, type: v as PieceType })}
                    >
                      <SelectTrigger className="bg-muted/50 border-border h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {availableTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type} {type === 'Report' && '(Staff)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-2 block">Author</Label>
                    <Input
                      value={formData.author_name}
                      onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                      placeholder="Your name"
                      className="bg-muted/50 border-border h-10"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-2 block">Role/Title</Label>
                    <Input
                      value={formData.author_role}
                      onChange={(e) => setFormData({ ...formData, author_role: e.target.value })}
                      placeholder="e.g., Writer, Student"
                      className="bg-muted/50 border-border h-10"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-2 block">Tags</Label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Culture, Sports, Opinion... (comma separated)"
                    className="bg-muted/50 border-border h-10"
                  />
                </div>

                {/* Cover Image */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-2 block">Cover Image</Label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleCoverImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  {formData.cover_image ? (
                    <div className="relative group overflow-hidden rounded-xl h-40 w-full max-w-lg border border-border">
                      <img 
                        src={formData.cover_image} 
                        alt="Cover" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                        >
                          {uploadingImage ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                          <span className="ml-2">Change</span>
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={removeCoverImage}
                        >
                          <X size={14} />
                          <span className="ml-2">Remove</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="w-full max-w-lg h-28 border-2 border-dashed border-border hover:border-accent rounded-xl hover:bg-accent/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-accent"
                    >
                      {uploadingImage ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <>
                          <ImagePlus size={20} />
                          <span className="text-xs font-medium">Add Cover Image (1200×630 recommended)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Poetry Layout Selector - Only show for Poetry type */}
                {formData.type === 'Poetry' && (
                  <div className="pt-4 border-t border-border space-y-6">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-3 block">Poetry Layout</Label>
                      <PoetryLayoutSelector
                        value={formData.poetry_layout}
                        onChange={(layout) => setFormData({ ...formData, poetry_layout: layout })}
                      />
                    </div>
                    
                    {/* Cover Image Generator */}
                    <div className="pt-4 border-t border-border">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full">
                            <ImageIcon size={14} className="mr-2" />
                            Generate Cover Image
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Create Poetry Cover</DialogTitle>
                          </DialogHeader>
                          <PoetryCoverGenerator
                            title={formData.title || 'Untitled'}
                            authorName={formData.author_name || 'Anonymous'}
                            coverImage={formData.cover_image}
                            onGenerated={(url) => {
                              // Could save to storage and set as cover_image if needed
                              toast.success('Cover generated!');
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )}
              </div>
            </details>
          </div>

          {/* Main Writing Area */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            {/* Title */}
            <div className="px-8 pt-10">
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Untitled"
                className="text-4xl md:text-5xl font-serif border-0 bg-transparent px-0 py-2 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/30 leading-tight"
              />
            </div>

            {/* Summary */}
            <div className="px-8 py-4">
              <Textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Write a brief summary that will appear in previews..."
                rows={2}
                className="bg-transparent border-0 resize-none text-muted-foreground focus-visible:ring-0 text-lg font-light leading-relaxed px-0"
              />
            </div>

            <div className="h-px bg-border mx-8" />

            {/* Editor */}
            <div className="px-4 py-8">
              <Suspense fallback={
                <div className="min-h-[500px] flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              }>
                <EditorJSComponent
                  key={editorKey}
                  data={editorContent}
                  onChange={handleEditorChange}
                  placeholder="Start writing your masterpiece..."
                  pieceType={formData.type}
                />
              </Suspense>
            </div>
          </div>

          {/* Bottom Stats Bar */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex md:hidden items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileText size={12} /> {wordCount} words
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} /> {readingTime} min
              </span>
              {isAutosaving ? (
                <span className="flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Saving...</span>
              ) : lastSaved ? (
                <span className="flex items-center gap-1"><Clock size={12} /> Saved</span>
              ) : null}
            </div>
            {id && (
              <Button
                onClick={handleDelete}
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
              >
                <Trash2 size={14} className="mr-2" />
                Delete Piece
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InkEditorPage;
