import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const UploadTutorialPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [format, setFormat] = useState('');
  const [level, setLevel] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to upload a tutorial');
      return;
    }
    if (!title || !format || !level || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if user is a tutor
      const { data: tutor } = await supabase
        .from('tutors')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let tutorId = tutor?.id;

      // If not a tutor yet, create a basic tutor profile
      if (!tutorId) {
        const { data: newTutor, error: tutorErr } = await supabase
          .from('tutors')
          .insert({ user_id: user.id, name: user.user_metadata?.full_name || 'Anonymous Tutor', tier: 'Community' as const, bio: '' })
          .select('id')
          .single();
        if (tutorErr) throw tutorErr;
        tutorId = newTutor.id;
      }

      const formatValue = (format.charAt(0).toUpperCase() + format.slice(1)) as 'Video' | 'Audio' | 'Text' | 'Essay';
      const levelValue = (level.charAt(0).toUpperCase() + level.slice(1)) as 'Beginner' | 'Intermediate' | 'Advanced';

      const { error } = await supabase
        .from('tutorials')
        .insert({
          title,
          description,
          format: formatValue,
          level: levelValue,
          cover_image: coverImage || null,
          tutor_id: tutorId,
          is_published: false,
          is_approved: false,
        });

      if (error) throw error;
      toast.success('Tutorial submitted for review!');
      navigate('/tutorials');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit tutorial');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h2 className="text-2xl font-serif font-bold text-slate-800 mb-4">Sign in Required</h2>
        <p className="text-slate-500 mb-6">You need to sign in to upload a tutorial.</p>
        <Link to="/auth"><Button>Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Link to="/tutorials" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-ui-blue transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </Link>

      <div className="bg-white border border-slate-200 shadow-sm">
        <div className="p-8 border-b border-slate-200">
          <h1 className="text-3xl font-serif font-bold text-ui-blue mb-2">Upload a Tutorial</h1>
          <p className="text-slate-500 font-light">Share your knowledge with the Union. All submissions are reviewed.</p>
        </div>
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs uppercase tracking-widest font-bold text-slate-500">Tutorial Title</Label>
              <Input id="title" placeholder="e.g., Introduction to Macroeconomics" required value={title} onChange={e => setTitle(e.target.value)} className="rounded-none bg-slate-50 border-slate-200 focus:border-nobel-gold h-12" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="format" className="text-xs uppercase tracking-widest font-bold text-slate-500">Format</Label>
                <Select required value={format} onValueChange={setFormat}>
                  <SelectTrigger className="rounded-none bg-slate-50 border-slate-200 h-12">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="text">Text / Article</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level" className="text-xs uppercase tracking-widest font-bold text-slate-500">Difficulty Level</Label>
                <Select required value={level} onValueChange={setLevel}>
                  <SelectTrigger className="rounded-none bg-slate-50 border-slate-200 h-12">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs uppercase tracking-widest font-bold text-slate-500">Description</Label>
              <Textarea id="description" placeholder="What will students learn?" rows={6} required value={description} onChange={e => setDescription(e.target.value)} className="rounded-none bg-slate-50 border-slate-200 focus:border-nobel-gold" />
            </div>

            <div className="space-y-2">
               <Label htmlFor="cover" className="text-xs uppercase tracking-widest font-bold text-slate-500">Cover Image (URL)</Label>
               <Input id="cover" placeholder="https://..." value={coverImage} onChange={e => setCoverImage(e.target.value)} className="rounded-none bg-slate-50 border-slate-200 focus:border-nobel-gold h-12" />
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Leave blank for default.</p>
            </div>

            <div className="pt-6">
              <Button type="submit" className="w-full bg-ui-blue hover:bg-ui-dark rounded-none h-14 uppercase tracking-widest text-xs font-bold" disabled={isSubmitting}>
                {isSubmitting ? 'Uploading...' : 'Submit Tutorial'} <Upload size={16} className="ml-2" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadTutorialPage;
