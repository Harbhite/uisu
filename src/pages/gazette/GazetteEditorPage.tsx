import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Send, ArrowLeft } from 'lucide-react';
import EditorJS from '@/components/EditorJS';

const CATEGORIES = ['News', 'Opinion', 'Sports', 'Campus Life', 'Official Notice', 'Resolution', 'Minutes'];
const ARTICLE_TYPES = ['editorial', 'notice'];

const GazetteEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('News');
  const [articleType, setArticleType] = useState('editorial');
  const [coverImage, setCoverImage] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [tags, setTags] = useState('');
  const [issueId, setIssueId] = useState<string | null>(null);
  const [content, setContent] = useState<any>({ blocks: [] });
  const [issues, setIssues] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const [issuesRes, profileRes] = await Promise.all([
        supabase.from('gazette_issues').select('*').order('volume_number', { ascending: false }),
        supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
      ]);
      setIssues(issuesRes.data || []);
      setProfile(profileRes.data);

      if (isEditing) {
        const { data } = await supabase.from('gazette_articles').select('*').eq('id', id).maybeSingle();
        if (data) {
          setTitle(data.title);
          setSummary(data.summary || '');
          setCategory(data.category);
          setArticleType(data.article_type);
          setCoverImage(data.cover_image || '');
          setIsFeatured(data.is_featured || false);
          setTags((data.tags || []).join(', '));
          setIssueId(data.issue_id);
          setContent(data.content || { blocks: [] });
        }
      }
    };
    loadData();
  }, [user, id, isEditing]);

  const generateSlug = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

  const estimateReadingTime = (blocks: any[]) => {
    const wordCount = blocks.reduce((acc: number, block: any) => {
      const text = block.data?.text || block.data?.items?.join(' ') || '';
      return acc + text.split(/\s+/).filter(Boolean).length;
    }, 0);
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  const handleSave = useCallback(async (publish: boolean) => {
    if (!user) return toast.error('Sign in required');
    if (!title.trim()) return toast.error('Title is required');

    setSaving(true);
    const slug = isEditing ? undefined : generateSlug(title);
    const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    const readingTime = estimateReadingTime(content?.blocks || []);

    const articleData: any = {
      title: title.trim(),
      summary: summary.trim() || null,
      category,
      article_type: articleType,
      cover_image: coverImage.trim() || null,
      is_featured: isFeatured,
      tags: tagsArray,
      issue_id: issueId || null,
      content,
      reading_time: readingTime,
      author_id: user.id,
      author_name: profile?.full_name || user.email || 'Unknown',
      is_published: publish,
      ...(publish && { published_at: new Date().toISOString() }),
      ...(slug && { slug }),
    };

    let result;
    if (isEditing) {
      result = await supabase.from('gazette_articles').update(articleData).eq('id', id);
    } else {
      result = await supabase.from('gazette_articles').insert(articleData).select().single();
    }

    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success(publish ? 'Article published!' : 'Draft saved!');
      navigate('/gazette');
    }
    setSaving(false);
  }, [user, title, summary, category, articleType, coverImage, isFeatured, tags, issueId, content, profile, isEditing, id, navigate]);

  if (!user) {
    return <div className="text-center py-20 text-muted-foreground">Please sign in to write articles.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button onClick={() => navigate('/gazette')} className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground uppercase tracking-widest font-bold">
        <ArrowLeft size={14} /> Back
      </button>

      <h1 className="text-2xl font-serif font-bold text-foreground">
        {isEditing ? 'Edit Article' : 'Write New Article'}
      </h1>

      <div className="grid gap-6">
        <div>
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article headline..." className="text-lg font-serif" />
        </div>

        <div>
          <Label>Summary</Label>
          <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Brief summary for preview cards..." rows={2} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Type</Label>
            <Select value={articleType} onValueChange={setArticleType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ARTICLE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Issue (optional)</Label>
            <Select value={issueId || 'none'} onValueChange={(v) => setIssueId(v === 'none' ? null : v)}>
              <SelectTrigger><SelectValue placeholder="Standalone" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Standalone</SelectItem>
                {issues.map(issue => (
                  <SelectItem key={issue.id} value={issue.id}>Vol.{issue.volume_number} No.{issue.issue_number}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2 pb-1">
            <Switch id="featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
            <Label htmlFor="featured">Featured</Label>
          </div>
        </div>

        <div>
          <Label>Cover Image URL</Label>
          <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." />
        </div>

        <div>
          <Label>Tags (comma-separated)</Label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="elections, campus, policy" />
        </div>

        <div>
          <Label>Content</Label>
          <div className="border border-border min-h-[400px] bg-card p-4">
            <EditorJS
              data={content}
              onChange={setContent}
              holder="gazette-editor"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 justify-end pt-4 border-t border-border">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
            <Save size={14} className="mr-2" /> Save Draft
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}>
            <Send size={14} className="mr-2" /> Publish
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GazetteEditorPage;
