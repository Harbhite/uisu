import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2, Upload, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import { useAdminCheck } from '@/hooks/useAdminCheck';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().min(20, "Please provide a more detailed bio (min 20 chars)"),
  expertise: z.string().min(3, "Please list at least one area of expertise"),
  portfolio_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  agree_terms: z.boolean().refine(val => val === true, "You must agree to the terms"),
});

type FormValues = z.infer<typeof formSchema>;

const BecomeTutorPage = () => {
  const navigate = useNavigate();
  const { user } = useAdminCheck();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      bio: '',
      expertise: '',
      portfolio_url: '',
      agree_terms: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error("You must be logged in to apply.");
      return;
    }

    setIsSubmitting(true);
    try {
      let avatarUrl = null;

      // Upload avatar if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        avatarUrl = publicUrl;
      }

      // Check if tutor application already exists
      const { data: existing } = await supabase
        .from('tutors')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        toast.error("You have already applied or are already a tutor.");
        navigate('/tutorials/dashboard');
        return;
      }

      // Create tutor entry (status defaults to pending/draft if not verified)
      // Note: 'tier' defaults to 'Community', 'status' defaults to 'pending' in DB usually
      const { error } = await supabase
        .from('tutors')
        .insert({
          user_id: user.id,
          name: values.name,
          bio: values.bio,
          expertise: values.expertise.split(',').map(s => s.trim()).filter(Boolean),
          portfolio_url: values.portfolio_url || null,
          avatar: avatarUrl,
          tier: 'Community',
          status: 'pending',
          rating: 5.0, // Default start
          students_count: 0,
          courses_count: 0
        });

      if (error) throw error;

      toast.success("Application submitted successfully! We will review it shortly.");
      navigate('/tutorials');

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <GraduationCap size={48} className="text-slate-300 mb-2" />
        <h2 className="text-xl font-bold text-slate-700">Join our Teaching Community</h2>
        <p className="text-slate-500">Please sign in to apply as a tutor.</p>
        <Button asChild className="rounded-none bg-ui-blue"><Link to="/auth">Sign In</Link></Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <SEO
        title="Become a Tutor | UISU SPACE"
        description="Apply to become a tutor on the UISU SPACE platform and share your knowledge."
        url="/tutorials/become-tutor"
      />

      <div className="flex items-center justify-between">
        <Link to="/tutorials" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-ui-blue transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Tutorials
        </Link>
      </div>

      <div className="bg-white border border-slate-200 p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={32} className="text-ui-blue" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-ui-blue mb-2">Become a Tutor</h1>
          <p className="text-slate-500 max-w-md mx-auto">Share your expertise, help fellow students, and contribute to the academic excellence of the Union.</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs uppercase tracking-widest font-bold text-slate-500">Display Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              className="rounded-none bg-slate-50 border-slate-200 h-11"
              placeholder="e.g. Prof. John Doe or Jane Smith"
            />
            {form.formState.errors.name && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-xs uppercase tracking-widest font-bold text-slate-500">Bio</Label>
            <Textarea
              id="bio"
              {...form.register("bio")}
              rows={4}
              className="rounded-none bg-slate-50 border-slate-200 resize-none"
              placeholder="Tell us about your academic background and teaching style..."
            />
            {form.formState.errors.bio && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.bio.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expertise" className="text-xs uppercase tracking-widest font-bold text-slate-500">Areas of Expertise (Comma separated)</Label>
            <Input
              id="expertise"
              {...form.register("expertise")}
              className="rounded-none bg-slate-50 border-slate-200 h-11"
              placeholder="e.g. Mathematics, Economics, React.js"
            />
            {form.formState.errors.expertise && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.expertise.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolio" className="text-xs uppercase tracking-widest font-bold text-slate-500">Portfolio URL (Optional)</Label>
            <Input
              id="portfolio"
              {...form.register("portfolio_url")}
              className="rounded-none bg-slate-50 border-slate-200 h-11"
              placeholder="https://linkedin.com/in/..."
            />
            {form.formState.errors.portfolio_url && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.portfolio_url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest font-bold text-slate-500">Profile Picture (Optional)</Label>
            <div className="border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              />
              <Upload size={24} className="text-slate-400 mb-2" />
              <p className="text-sm text-slate-600 font-medium">
                {avatarFile ? avatarFile.name : "Click to upload an image"}
              </p>
              <p className="text-xs text-slate-400 mt-1">JPG, PNG, GIF up to 2MB</p>
            </div>
          </div>

          <div className="flex items-start gap-3 py-2">
             <Checkbox
                id="terms"
                checked={form.watch("agree_terms")}
                onCheckedChange={(checked) => form.setValue("agree_terms", checked as boolean)}
                className="mt-1"
             />
             <div className="grid gap-1.5 leading-none">
                <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  I agree to the Community Guidelines
                </Label>
                <p className="text-xs text-slate-500">
                  I agree to provide accurate information and uphold the academic integrity of the University of Ibadan.
                </p>
             </div>
          </div>
          {form.formState.errors.agree_terms && (
              <p className="text-red-500 text-xs">{form.formState.errors.agree_terms.message}</p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full bg-ui-blue hover:bg-ui-dark text-white rounded-none h-12 uppercase tracking-widest font-bold text-xs">
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
            Submit Application
          </Button>
        </form>
      </div>
    </div>
  );
};

export default BecomeTutorPage;
