import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTutorials, useTutors } from '@/hooks/useTutorials';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Users, Star, Loader2, ArrowLeft, Edit2, Eye } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Badge } from '@/components/ui/badge';

const TutorDashboardPage = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [tutorId, setTutorId] = useState<string | null>(null);

  const { data: tutors, isLoading: tutorsLoading } = useTutors();

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

  // Fetch my tutorials
  const { data: myTutorials, isLoading: tutorialsLoading } = useTutorials(
    tutorId ? { tutorId } : undefined
  );

  if (tutorsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin text-purple-600" />
      </div>
    );
  }

  if (userId && tutors && !tutorId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center px-4">
        <h2 className="text-2xl font-serif font-bold text-ui-blue">Not a Tutor Yet?</h2>
        <p className="text-slate-500 max-w-md">Apply to become a verified tutor to access the dashboard and upload content.</p>
        <Button asChild><Link to="/tutorials/become-tutor">Apply Now</Link></Button>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <p className="text-slate-500">Please sign in to access your dashboard.</p>
        <Button asChild><Link to="/auth">Sign In</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <SEO
        title="Tutor Dashboard | UISU SPACE"
        description="Manage your tutorials and view performance statistics."
        url="/tutorials/dashboard"
      />

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-ui-blue">Tutor Dashboard</h1>
        <Button asChild className="bg-ui-blue hover:bg-nobel-gold hover:text-foreground transition-colors rounded-none font-bold uppercase tracking-widest text-xs">
          <Link to="/tutorials/upload">
            <Plus size={16} className="mr-2" /> Upload Tutorial
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-none border-purple-100 bg-purple-50/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-none"><BookOpen size={24} /></div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Total Tutorials</p>
              <p className="text-2xl font-serif font-bold text-ui-blue">{myTutorials?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-purple-100 bg-purple-50/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-none"><Users size={24} /></div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Total Students</p>
              <p className="text-2xl font-serif font-bold text-ui-blue">
                {myTutorials?.reduce((acc, curr) => acc + (curr.students_count || 0), 0) || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-purple-100 bg-purple-50/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-none"><Star size={24} /></div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Avg Rating</p>
              <p className="text-2xl font-serif font-bold text-ui-blue">
                {(myTutorials?.reduce((acc, curr) => acc + (curr.rating || 0), 0) / (myTutorials?.length || 1)).toFixed(1)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tutorials List */}
      <div>
        <h2 className="text-xl font-serif font-bold text-ui-blue mb-4">My Tutorials</h2>
        {tutorialsLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-400" /></div>
        ) : myTutorials?.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200">
            <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 mb-4">You haven't uploaded any tutorials yet.</p>
            <Button asChild variant="outline" className="rounded-none"><Link to="/tutorials/upload">Create Your First Tutorial</Link></Button>
          </div>
        ) : (
          <div className="space-y-4">
            {myTutorials?.map((tut) => (
              <Card key={tut.id} className="rounded-none border-slate-200 hover:border-purple-200 transition-colors">
                <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="w-full md:w-32 h-20 bg-slate-100 shrink-0">
                    <img src={tut.cover_image || '/placeholder.svg'} alt={tut.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline" className="rounded-none text-[10px] uppercase">{tut.level}</Badge>
                        <Badge variant="secondary" className="rounded-none text-[10px] uppercase bg-purple-100 text-purple-700">{tut.format}</Badge>
                        <Badge className={`rounded-none text-[10px] uppercase ${tut.is_published && tut.is_approved ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'}`}>
                            {tut.is_published && tut.is_approved ? 'Published' : 'Pending / Draft'}
                        </Badge>
                    </div>
                    <h3 className="font-serif font-bold text-lg text-ui-blue mb-1">
                        <Link to={`/tutorials/${tut.id}`} className="hover:text-purple-600 transition-colors">
                            {tut.title}
                        </Link>
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Users size={12} /> {tut.students_count} Students</span>
                        <span className="flex items-center gap-1"><Star size={12} /> {tut.rating.toFixed(1)} Rating</span>
                        <span>{new Date(tut.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="ghost" size="sm" className="rounded-none text-slate-500">
                        <Link to={`/tutorials/${tut.id}`}><Eye size={16} /></Link>
                    </Button>
                    {/* Future: Edit Link */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorDashboardPage;
