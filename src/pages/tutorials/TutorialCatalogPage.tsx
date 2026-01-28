import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { tutorials as staticTutorials, tutors as staticTutors, categories } from '@/lib/tutorials-data';
import TutorialCard from '@/components/tutorials/TutorialCard';
import TutorialFilters from '@/components/tutorials/TutorialFilters';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const TutorialCatalogPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  // Fetch tutorials from database
  const { data: dbTutorials, isLoading } = useQuery({
    queryKey: ['tutorials-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tutorials')
        .select(`
          *,
          tutors (*),
          tutorial_modules (id, title, type, duration, sort_order)
        `)
        .eq('is_published', true)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Convert DB tutorials to display format
  const dbTutorialsFormatted = (dbTutorials || []).map((t: any) => ({
    id: t.id,
    title: t.title,
    description: t.description || '',
    tutorId: t.tutor_id,
    format: t.format as 'Video' | 'Audio' | 'Text' | 'Essay',
    level: t.level as 'Beginner' | 'Intermediate' | 'Advanced',
    coverImage: t.cover_image || '/placeholder.svg',
    tags: t.tags || [],
    rating: Number(t.rating) || 0,
    studentsCount: t.students_count || 0,
    createdAt: t.created_at || '',
    modules: (t.tutorial_modules || []).map((m: any) => ({
      id: m.id,
      title: m.title,
      type: m.type,
      content: '',
      duration: m.duration || '',
    })).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)),
    tutor: t.tutors ? {
      id: t.tutors.id,
      name: t.tutors.name,
      tier: t.tutors.tier,
      bio: t.tutors.bio || '',
      avatar: t.tutors.avatar || '/placeholder.svg',
      metrics: {
        courses: t.tutors.courses_count || 0,
        students: t.tutors.students_count || 0,
        rating: Number(t.tutors.rating) || 0,
      },
    } : null,
  }));

  // Combine with static tutorials (for backwards compatibility)
  const allTutorials = [
    ...dbTutorialsFormatted,
    ...staticTutorials.map(t => ({
      ...t,
      tutor: staticTutors.find(tu => tu.id === t.tutorId) || null,
    })),
  ];

  // Filter tutorials
  const filteredTutorials = allTutorials.filter(tut => {
    const matchesSearch = tut.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tut.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFormat = selectedFormat ? tut.format === selectedFormat : true;
    const matchesLevel = selectedLevel ? tut.level === selectedLevel : true;

    return matchesSearch && matchesFormat && matchesLevel;
  });

  const handleFilterChange = (filters: { format?: string; level?: string; search?: string }) => {
    if (filters.format !== undefined) setSelectedFormat(filters.format || null);
    if (filters.level !== undefined) setSelectedLevel(filters.level || null);
    if (filters.search !== undefined) setSearchQuery(filters.search || '');
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="border-b border-purple-200/60 pb-8 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl -z-10 pointer-events-none" />
        <h1 className="text-4xl font-serif font-bold text-[#2D1B4E] mb-3">Browse Catalog</h1>
        <p className="text-slate-500 font-light text-lg max-w-2xl">Find the perfect tutorial for your needs from our extensive library of academic and practical resources.</p>
      </div>

      {/* Filters & Search */}
      <TutorialFilters 
        onFilterChange={handleFilterChange}
      />

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : filteredTutorials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTutorials.map((tut) => (
            <TutorialCard key={tut.id} tutorial={tut} tutor={tut.tutor || undefined} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white/40 backdrop-blur-sm border border-purple-100/60 border-dashed">
          <div className="text-purple-200 mb-6 flex justify-center"><Search size={64} /></div>
          <p className="text-slate-500 text-lg mb-4 font-light">No tutorials found matching your criteria.</p>
          <Button 
            variant="link" 
            className="text-purple-500 uppercase tracking-widest font-bold text-xs" 
            onClick={() => { 
              setSearchQuery(''); 
              setSelectedFormat(null); 
              setSelectedLevel(null); 
            }}
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default TutorialCatalogPage;
