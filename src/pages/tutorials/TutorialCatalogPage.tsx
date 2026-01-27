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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-ui-blue mb-2">Browse Catalog</h1>
        <p className="text-slate-500">Find the perfect tutorial for your needs.</p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input
            placeholder="Search tutorials..."
            className="pl-10 border-slate-200 bg-slate-50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
           <div className="flex items-center gap-2 text-sm text-slate-500 mr-2">
             <Filter size={16} />
             <span>Filters:</span>
           </div>
           {['Video', 'Audio', 'Text', 'Essay'].map(fmt => (
             <Badge
               key={fmt}
               variant={selectedFormat === fmt ? "default" : "outline"}
               className="cursor-pointer"
               onClick={() => setSelectedFormat(selectedFormat === fmt ? null : fmt)}
             >
               {fmt}
             </Badge>
           ))}
        </div>
      </div>

      {/* Results */}
      {filteredTutorials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutorials.map((tut) => (
            <TutorialCard key={tut.id} tutorial={tut} tutor={tutors.find(t => t.id === tut.tutorId)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-xl border-dashed">
          <div className="text-slate-300 mb-4 flex justify-center"><Search size={48} /></div>
          <p className="text-slate-500">No tutorials found matching your criteria.</p>
          <Button variant="link" onClick={() => { setSearchQuery(''); setSelectedFormat(null); setSelectedCategory(null); }}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default TutorialCatalogPage;
