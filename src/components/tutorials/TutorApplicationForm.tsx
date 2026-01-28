import { useState, useEffect } from 'react';
import { useSubmitTutorApplication, useTutorApplicationStatus } from '@/hooks/useTutorials';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, GraduationCap, CheckCircle2, Clock, XCircle, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const TutorApplicationForm = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [expertise, setExpertise] = useState<string[]>([]);
  const [expertiseInput, setExpertiseInput] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
  }, []);
  
  const { data: existingApplication, isLoading: loadingStatus } = useTutorApplicationStatus(userId || undefined);
  const submitMutation = useSubmitTutorApplication();
  
  const addExpertise = () => {
    if (expertiseInput.trim() && !expertise.includes(expertiseInput.trim())) {
      setExpertise([...expertise, expertiseInput.trim()]);
      setExpertiseInput('');
    }
  };
  
  const removeExpertise = (item: string) => {
    setExpertise(expertise.filter(e => e !== item));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || expertise.length === 0) return;
    
    try {
      await submitMutation.mutateAsync({
        userId,
        name,
        bio,
        expertise,
        portfolioUrl: portfolioUrl.trim() || undefined,
      });
      toast.success('Application submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit application');
    }
  };
  
  if (!userId) {
    return (
      <Card className="border-slate-200 rounded-none">
        <CardContent className="py-8 text-center">
          <GraduationCap size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 mb-4">Sign in to apply as a tutor</p>
          <Button asChild className="rounded-none">
            <Link to="/auth">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (loadingStatus) {
    return (
      <Card className="border-slate-200 rounded-none">
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="animate-spin text-slate-400" />
        </CardContent>
      </Card>
    );
  }
  
  if (existingApplication) {
    return (
      <Card className="border-slate-200 rounded-none">
        <CardHeader>
          <CardTitle className="font-serif">Application Status</CardTitle>
          <CardDescription>Your tutor application is being reviewed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            {existingApplication.status === 'pending' && (
              <>
                <Clock className="text-yellow-500" size={24} />
                <div>
                  <Badge variant="outline" className="rounded-none border-yellow-500 text-yellow-600 bg-yellow-50">
                    Pending Review
                  </Badge>
                  <p className="text-sm text-slate-500 mt-1">
                    Your application is being reviewed by our team.
                  </p>
                </div>
              </>
            )}
            {existingApplication.status === 'approved' && (
              <>
                <CheckCircle2 className="text-green-500" size={24} />
                <div>
                  <Badge variant="outline" className="rounded-none border-green-500 text-green-600 bg-green-50">
                    Approved
                  </Badge>
                  <p className="text-sm text-slate-500 mt-1">
                    Congratulations! You can now create tutorials.
                  </p>
                </div>
              </>
            )}
            {existingApplication.status === 'rejected' && (
              <>
                <XCircle className="text-red-500" size={24} />
                <div>
                  <Badge variant="outline" className="rounded-none border-red-500 text-red-600 bg-red-50">
                    Not Approved
                  </Badge>
                  <p className="text-sm text-slate-500 mt-1">
                    Unfortunately, your application was not approved at this time.
                  </p>
                </div>
              </>
            )}
          </div>
          
          <div className="bg-slate-50 p-4 space-y-2">
            <p className="text-sm"><strong>Name:</strong> {existingApplication.name}</p>
            <p className="text-sm"><strong>Bio:</strong> {existingApplication.bio}</p>
            <p className="text-sm">
              <strong>Expertise:</strong> {(existingApplication.expertise as string[]).join(', ')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-slate-200 rounded-none">
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <GraduationCap size={24} />
          Become a Tutor
        </CardTitle>
        <CardDescription>
          Share your knowledge with the student community. Apply to become a verified tutor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs uppercase tracking-widest font-bold text-slate-500">
              Display Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="How students will see you"
              required
              className="rounded-none bg-slate-50 border-slate-200 h-12"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-xs uppercase tracking-widest font-bold text-slate-500">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself and your teaching experience..."
              required
              rows={4}
              className="rounded-none bg-slate-50 border-slate-200"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest font-bold text-slate-500">
              Areas of Expertise
            </Label>
            <div className="flex gap-2">
              <Input
                value={expertiseInput}
                onChange={(e) => setExpertiseInput(e.target.value)}
                placeholder="e.g., Mathematics, Python, Economics"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                className="rounded-none bg-slate-50 border-slate-200 h-12"
              />
              <Button type="button" onClick={addExpertise} variant="outline" className="rounded-none h-12 px-4">
                <Plus size={16} />
              </Button>
            </div>
            {expertise.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {expertise.map((item) => (
                  <Badge key={item} variant="secondary" className="rounded-none flex items-center gap-1">
                    {item}
                    <button type="button" onClick={() => removeExpertise(item)} className="hover:text-red-500">
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {expertise.length === 0 && (
              <p className="text-xs text-red-500">Add at least one area of expertise</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="portfolio" className="text-xs uppercase tracking-widest font-bold text-slate-500">
              Portfolio URL (Optional)
            </Label>
            <Input
              id="portfolio"
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://your-portfolio.com"
              className="rounded-none bg-slate-50 border-slate-200 h-12"
            />
          </div>
          
          <Button
            type="submit"
            disabled={!name || !bio || expertise.length === 0 || submitMutation.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-none h-14 uppercase tracking-widest text-xs font-bold"
          >
            {submitMutation.isPending ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : null}
            Submit Application
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TutorApplicationForm;
