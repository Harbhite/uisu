import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCreateTutorial, useTutors } from '@/hooks/useTutorials';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';

interface ModuleData {
  title: string;
  type: 'Video' | 'Audio' | 'Text' | 'Essay';
  content: string;
  duration: string;
  sort_order: number;
}

const UploadTutorialPage = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [tutorId, setTutorId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState<'Video' | 'Audio' | 'Text' | 'Essay'>('Video');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState('');

  // Modules State
  const [modules, setModules] = useState<ModuleData[]>([
    { title: '', type: 'Video', content: '', duration: '', sort_order: 1 }
  ]);

  const { data: tutors } = useTutors();
  const createMutation = useCreateTutorial();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (userId && tutors) {
      const myTutorProfile = tutors.find(t => t.user_id === userId);
      if (myTutorProfile) {
        setTutorId(myTutorProfile.id);
      }
    }
  }, [userId, tutors]);

  const handleAddModule = () => {
    setModules([
      ...modules,
      { title: '', type: format, content: '', duration: '', sort_order: modules.length + 1 }
    ]);
  };

  const handleRemoveModule = (index: number) => {
    const newModules = modules.filter((_, i) => i !== index);
    // Re-index sort order
    setModules(newModules.map((m, i) => ({ ...m, sort_order: i + 1 })));
  };

  const handleModuleChange = (index: number, field: keyof ModuleData, value: string) => {
    const newModules = [...modules];
    newModules[index] = { ...newModules[index], [field]: value };
    setModules(newModules);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorId) {
      toast.error("You must be a registered tutor to upload.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createMutation.mutateAsync({
        tutorial: {
          title,
          description,
          tutor_id: tutorId,
          format,
          level,
          cover_image: coverImage || undefined,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          is_published: false, // Default to draft/pending
          is_approved: false
        },
        modules: modules.filter(m => m.title.trim() !== '')
      });

      toast.success("Tutorial submitted for approval!");
      navigate('/tutorials');
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload tutorial.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <p className="text-slate-500">Please sign in to upload tutorials.</p>
        <Button asChild><Link to="/auth">Sign In</Link></Button>
      </div>
    );
  }

  if (tutors && !tutorId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center px-4">
        <h2 className="text-2xl font-serif font-bold text-ui-blue">Become a Tutor</h2>
        <p className="text-slate-500 max-w-md">You need to be a verified tutor to upload content. Please submit an application.</p>
        <Button asChild><Link to="/tutorials/become-tutor">Apply Now</Link></Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <SEO
        title="Upload Tutorial | UISU SPACE"
        description="Share your knowledge with the Union. Upload tutorials and help fellow students learn and grow."
        image="/og/pages-screenshot/tutorials_upload.png"
        url="/tutorials/upload"
      />
      <div className="flex items-center justify-between">
        <Link to="/tutorials" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-ui-blue transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </Link>
        <div className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          Verified Tutor
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white border border-slate-200 shadow-sm p-8">
          <h2 className="text-xl font-serif font-bold text-ui-blue mb-6 border-b pb-4">Basic Information</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs uppercase tracking-widest font-bold text-slate-500">Tutorial Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Introduction to Macroeconomics"
                required
                className="rounded-none bg-slate-50 border-slate-200 focus:border-nobel-gold h-12"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="format" className="text-xs uppercase tracking-widest font-bold text-slate-500">Format</Label>
                <Select value={format} onValueChange={(v: 'Video' | 'Audio' | 'Text' | 'Essay') => setFormat(v)}>
                  <SelectTrigger className="rounded-none bg-slate-50 border-slate-200 h-12">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="Video">Video</SelectItem>
                    <SelectItem value="Audio">Audio</SelectItem>
                    <SelectItem value="Text">Text / Article</SelectItem>
                    <SelectItem value="Essay">Essay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level" className="text-xs uppercase tracking-widest font-bold text-slate-500">Difficulty Level</Label>
                <Select value={level} onValueChange={(v: 'Beginner' | 'Intermediate' | 'Advanced') => setLevel(v)}>
                  <SelectTrigger className="rounded-none bg-slate-50 border-slate-200 h-12">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs uppercase tracking-widest font-bold text-slate-500">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will students learn?"
                rows={4}
                required
                className="rounded-none bg-slate-50 border-slate-200 focus:border-nobel-gold resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <Label htmlFor="cover" className="text-xs uppercase tracking-widest font-bold text-slate-500">Cover Image URL</Label>
                 <Input
                    id="cover"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://..."
                    className="rounded-none bg-slate-50 border-slate-200 focus:border-nobel-gold h-12"
                 />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="tags" className="text-xs uppercase tracking-widest font-bold text-slate-500">Tags (comma separated)</Label>
                 <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. GST, Math, Science"
                    className="rounded-none bg-slate-50 border-slate-200 focus:border-nobel-gold h-12"
                 />
              </div>
            </div>
          </div>
        </div>

        {/* Modules */}
        <div className="bg-white border border-slate-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <h2 className="text-xl font-serif font-bold text-ui-blue">Course Content</h2>
            <Button type="button" onClick={handleAddModule} variant="outline" size="sm" className="rounded-none text-xs uppercase tracking-widest font-bold">
              <Plus size={14} className="mr-2" /> Add Module
            </Button>
          </div>

          <div className="space-y-6">
            {modules.map((module, index) => (
              <Card key={index} className="rounded-none border-slate-200 bg-slate-50/50">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="cursor-move text-slate-300 hover:text-slate-500"><GripVertical size={20} /></div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Module {index + 1}</h3>
                    <div className="ml-auto">
                      {modules.length > 1 && (
                        <button type="button" onClick={() => handleRemoveModule(index)} className="text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Input
                        placeholder="Module Title"
                        value={module.title}
                        onChange={(e) => handleModuleChange(index, 'title', e.target.value)}
                        className="bg-white border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Select value={module.type} onValueChange={(v: 'Video' | 'Audio' | 'Text' | 'Essay') => handleModuleChange(index, 'type', v)}>
                        <SelectTrigger className="bg-white border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Video">Video</SelectItem>
                          <SelectItem value="Audio">Audio</SelectItem>
                          <SelectItem value="Text">Text</SelectItem>
                          <SelectItem value="Essay">Essay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Input
                      placeholder={module.type === 'Text' || module.type === 'Essay' ? "Content (Text)" : "Content URL (Video/Audio Source)"}
                      value={module.content}
                      onChange={(e) => handleModuleChange(index, 'content', e.target.value)}
                      className="bg-white border-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      placeholder="Duration (e.g. 10 mins)"
                      value={module.duration}
                      onChange={(e) => handleModuleChange(index, 'duration', e.target.value)}
                      className="bg-white border-slate-200 w-full md:w-1/2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full bg-ui-blue hover:bg-ui-dark rounded-none h-14 uppercase tracking-widest text-xs font-bold" disabled={isSubmitting}>
            {isSubmitting ? 'Uploading...' : 'Submit Tutorial for Review'} <Upload size={16} className="ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UploadTutorialPage;
