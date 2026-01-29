import { useState } from 'react';
import { tutorials, tutors, categories } from '@/lib/tutorials-data';
import TutorialCard from '@/components/tutorials/TutorialCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const TutorialCatalogPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  const filteredTutorials = tutorials.filter(tut => {
    const matchesSearch = tut.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tut.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? tut.tags.some(tag => tag.toLowerCase() === selectedCategory.toLowerCase()) : true; // Mock category match via tags for now
    const matchesFormat = selectedFormat ? tut.format === selectedFormat : true;

    return matchesSearch && matchesCategory && matchesFormat;
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="border-b border-purple-200/60 pb-8 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl -z-10 pointer-events-none" />
        <h1 className="text-4xl font-serif font-bold text-[#2D1B4E] mb-3">Browse Catalog</h1>
        <p className="text-slate-500 font-light text-lg max-w-2xl">Find the perfect tutorial for your needs from our extensive library of academic and practical resources.</p>
      </div>

      {/* Filters & Search - Glassmorphic Container */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-white/60 backdrop-blur-md p-6 border border-white/40 shadow-lg relative overflow-hidden rounded-none">
        {/* Subtle decorative gradient line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-50" />

        <div className="relative w-full md:w-96 group z-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={18} />
          <Input
            placeholder="Search tutorials..."
            className="pl-12 border-slate-200/80 bg-white/50 rounded-none h-12 focus-visible:ring-1 focus-visible:ring-purple-500 focus-visible:border-purple-500 transition-all font-light placeholder:text-slate-400 text-slate-700 hover:bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3 z-10">
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mr-2">
             <Filter size={14} />
             <span>Filters</span>
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
      </div>

      {/* Results */}
      {filteredTutorials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTutorials.map((tut) => (
            <TutorialCard key={tut.id} tutorial={tut} tutor={tutors.find(t => t.id === tut.tutorId)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white/40 backdrop-blur-sm border border-purple-100/60 border-dashed">
          <div className="text-purple-200 mb-6 flex justify-center"><Search size={64} /></div>
          <p className="text-slate-500 text-lg mb-4 font-light">No tutorials found matching your criteria.</p>
          <Button variant="link" className="text-purple-500 uppercase tracking-widest font-bold text-xs" onClick={() => { setSearchQuery(''); setSelectedFormat(null); setSelectedCategory(null); }}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default TutorialCatalogPage;
