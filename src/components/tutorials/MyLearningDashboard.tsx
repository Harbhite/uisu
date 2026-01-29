import { useState, useEffect } from 'react';
import { useUserEnrollments, useUserBookmarks, useProgress } from '@/hooks/useTutorials';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, BookOpen, Bookmark, GraduationCap, PlayCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Enrollment {
  id: string;
  completed_at: string | null;
  tutorial: {
    id: string;
    title: string;
    cover_image: string;
    format: string;
    tutor: {
      name: string;
    };
    modules: { id: string }[];
  };
}

interface Bookmark {
  id: string;
  tutorial: {
    id: string;
    title: string;
    cover_image: string;
    format: string;
  };
}

const MyLearningDashboard = () => {
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
  }, []);
  
  const { data: enrollmentsData, isLoading: loadingEnrollments } = useUserEnrollments(userId || undefined);
  const { data: bookmarksData, isLoading: loadingBookmarks } = useUserBookmarks(userId || undefined);

  const enrollments = (enrollmentsData || []) as unknown as Enrollment[];
  const bookmarks = (bookmarksData || []) as unknown as Bookmark[];
  
  if (!userId) {
    return (
      <Card className="border-slate-200 rounded-none">
        <CardContent className="py-12 text-center">
          <GraduationCap size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 mb-2">Sign in to see your learning dashboard</p>
          <Link to="/auth" className="text-purple-600 hover:underline font-medium">
            Sign In
          </Link>
        </CardContent>
      </Card>
    );
  }
  
  const isLoading = loadingEnrollments || loadingBookmarks;
  
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 rounded-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-none">
              <BookOpen size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{enrollments.length}</p>
              <p className="text-xs uppercase tracking-widest text-slate-500">Enrolled</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 rounded-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-none">
              <GraduationCap size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {enrollments.filter((e) => e.completed_at).length}
              </p>
              <p className="text-xs uppercase tracking-widest text-slate-500">Completed</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 rounded-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-none">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {enrollments.filter((e) => !e.completed_at).length}
              </p>
              <p className="text-xs uppercase tracking-widest text-slate-500">In Progress</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 rounded-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-none">
              <Bookmark size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{bookmarks.length}</p>
              <p className="text-xs uppercase tracking-widest text-slate-500">Bookmarked</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="enrolled" className="w-full">
        <TabsList className="w-full grid grid-cols-2 rounded-none bg-slate-100 h-12">
          <TabsTrigger value="enrolled" className="rounded-none data-[state=active]:bg-white">
            My Courses
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="rounded-none data-[state=active]:bg-white">
            Bookmarks
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="enrolled" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-slate-400" />
            </div>
          ) : enrollments.length === 0 ? (
            <Card className="border-slate-200 rounded-none">
              <CardContent className="py-12 text-center">
                <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500">You haven't enrolled in any tutorials yet</p>
                <Link to="/tutorials/catalog" className="text-purple-600 hover:underline text-sm mt-2 inline-block">
                  Browse Tutorials
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {enrollments.map((enrollment) => (
                <EnrollmentCard key={enrollment.id} enrollment={enrollment} userId={userId} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="bookmarks" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-slate-400" />
            </div>
          ) : bookmarks.length === 0 ? (
            <Card className="border-slate-200 rounded-none">
              <CardContent className="py-12 text-center">
                <Bookmark size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500">No bookmarked tutorials yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bookmarks.map((bookmark) => (
                <Link
                  key={bookmark.id}
                  to={`/tutorials/${bookmark.tutorial?.id}`}
                  className="flex items-center gap-3 p-4 border border-slate-200 bg-white hover:border-purple-300 transition-colors"
                >
                  <div className="w-16 h-16 bg-slate-100 shrink-0">
                    <img
                      src={bookmark.tutorial?.cover_image || '/placeholder.svg'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 truncate">{bookmark.tutorial?.title}</h4>
                    <Badge variant="outline" className="rounded-none text-[10px] mt-1">
                      {bookmark.tutorial?.format}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const EnrollmentCard = ({ enrollment, userId }: { enrollment: Enrollment; userId: string }) => {
  const tutorial = enrollment.tutorial;
  const { data: completedModules = [] } = useProgress(tutorial?.id, userId);
  const moduleCount = tutorial?.modules?.length || 1;
  const progressPercent = Math.round((completedModules.length / moduleCount) * 100);
  
  return (
    <Link
      to={`/tutorials/${tutorial?.id}`}
      className="flex items-center gap-4 p-4 border border-slate-200 bg-white hover:border-purple-300 transition-colors"
    >
      <div className="w-20 h-20 bg-slate-100 shrink-0 relative">
        <img
          src={tutorial?.cover_image || '/placeholder.svg'}
          alt=""
          className="w-full h-full object-cover"
        />
        {enrollment.completed_at && (
          <div className="absolute inset-0 bg-green-600/80 flex items-center justify-center">
            <GraduationCap size={24} className="text-white" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-slate-800 truncate">{tutorial?.title}</h4>
        <p className="text-sm text-slate-500 truncate">{tutorial?.tutor?.name}</p>
        
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{completedModules.length}/{moduleCount} modules</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-1.5" />
        </div>
      </div>
      
      <PlayCircle size={24} className="text-purple-500 shrink-0" />
    </Link>
  );
};

export default MyLearningDashboard;
