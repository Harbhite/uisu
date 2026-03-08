import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTutorials, useTutors } from '@/hooks/useTutorials';
import TutorialCard from '@/components/tutorials/TutorialCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Loader2, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SortOption = 'newest' | 'rating' | 'students';

const TutorialCatalogPage = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest'); // Feature #16

  const { data: tutorials = [], isLoading } = useTutorials();
  const { data: tutors = [] } = useTutors();

  // Feature #15: Read query params from URL
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const filteredTutorials = useMemo(() => {
    let result = tutorials.filter(tut => {
      const matchesSearch = !searchQuery || 
        tut.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tut.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tut.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFormat = !selectedFormat || tut.format === selectedFormat;
      const matchesLevel = !selectedLevel || tut.level === selectedLevel;
      return matchesSearch && matchesFormat && matchesLevel;
    });

    // Feature #16: Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        case 'students': return (b.students_count || 0) - (a.students_count || 0);
        case 'newest':
        default: return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    });

    return result;
  }, [tutorials, searchQuery, selectedFormat, selectedLevel, sortBy]);

  const hasFilters = searchQuery || selectedFormat || selectedLevel;

  return (
    <div className="space-y-8 pb-12">
      <div className="border-b border-purple-200/60 pb-8 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl -z-10 pointer-events-none" />
        <h1 className="text-4xl font-serif font-bold text-[#2D1B4E] mb-3">Browse Catalog</h1>
        <p className="text-slate-500 font-light text-lg max-w-2xl">Find the perfect tutorial from our library of {tutorials.length} courses.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-6 bg-white/60 backdrop-blur-md p-6 border border-white/40 shadow-lg relative overflow-hidden rounded-none">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-50" />

        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96 group z-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={18} />
            <Input
              placeholder="Search tutorials, tags..."
              className="pl-12 border-slate-200/80 bg-white/50 rounded-none h-12 focus-visible:ring-1 focus-visible:ring-purple-500 focus-visible:border-purple-500 transition-all font-light placeholder:text-slate-400 text-slate-700 hover:bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 z-10">
            {/* Sort dropdown - Feature #16 */}
            <div className="flex items-center gap-2">
              <ArrowUpDown size={14} className="text-slate-400" />
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="rounded-none border-slate-200 bg-white/50 h-10 w-40 text-xs uppercase tracking-widest font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="students">Most Students</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 z-10">
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mr-2">
             <Filter size={14} />
             <span>Format</span>
           </div>
           {['Video', 'Audio', 'Text', 'Essay'].map(fmt => (
             <Badge
               key={fmt}
               variant={selectedFormat === fmt ? "default" : "outline"}
               className={`cursor-pointer rounded-none px-4 py-2 text-[10px] uppercase tracking-wider font-bold transition-all border ${
                 selectedFormat === fmt
                   ? 'bg-[#2D1B4E] text-white border-[#2D1B4E] shadow-md hover:bg-purple-900'
                   : 'bg-white/50 border-slate-200 hover:border-purple-400 hover:text-[#2D1B4E] hover:bg-white'
               }`}
               onClick={() => setSelectedFormat(selectedFormat === fmt ? null : fmt)}
             >
               {fmt}
             </Badge>
           ))}
        </div>

        {/* Level filter row */}
        <div className="flex flex-wrap gap-3 z-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mr-2">
            <span>Level</span>
          </div>
          {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
            <Badge
              key={lvl}
              variant={selectedLevel === lvl ? "default" : "outline"}
              className={`cursor-pointer rounded-none px-4 py-2 text-[10px] uppercase tracking-wider font-bold transition-all border ${
                selectedLevel === lvl
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md hover:bg-purple-700'
                  : 'bg-white/50 border-slate-200 hover:border-purple-400 hover:text-[#2D1B4E] hover:bg-white'
              }`}
              onClick={() => setSelectedLevel(selectedLevel === lvl ? null : lvl)}
            >
              {lvl}
            </Badge>
          ))}

          {hasFilters && (
            <Button
              variant="link"
              className="text-purple-500 uppercase tracking-widest font-bold text-[10px] ml-4"
              onClick={() => { setSearchQuery(''); setSelectedFormat(null); setSelectedLevel(null); }}
            >
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="animate-spin text-purple-400" size={32} />
        </div>
      ) : filteredTutorials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTutorials.map((tut) => (
            <TutorialCard key={tut.id} tutorial={tut} tutor={tutors.find(t => t.id === tut.tutor_id)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white/40 backdrop-blur-sm border border-purple-100/60 border-dashed">
          <div className="text-purple-200 mb-6 flex justify-center"><Search size={64} /></div>
          <p className="text-slate-500 text-lg mb-4 font-light">No tutorials found matching your criteria.</p>
          <Button variant="link" className="text-purple-500 uppercase tracking-widest font-bold text-xs" onClick={() => { setSearchQuery(''); setSelectedFormat(null); setSelectedLevel(null); }}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default TutorialCatalogPage;
