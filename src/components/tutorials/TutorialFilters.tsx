import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorialFiltersProps {
  onFilterChange: (filters: { search?: string; format?: string; level?: string }) => void;
  className?: string;
}

const TutorialFilters = ({ onFilterChange, className }: TutorialFiltersProps) => {
  const [search, setSearch] = useState('');
  const [format, setFormat] = useState<string>('');
  const [level, setLevel] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  const handleSearch = (value: string) => {
    setSearch(value);
    onFilterChange({ search: value || undefined, format: format || undefined, level: level || undefined });
  };
  
  const handleFormatChange = (value: string) => {
    const newFormat = value === 'all' ? '' : value;
    setFormat(newFormat);
    onFilterChange({ search: search || undefined, format: newFormat || undefined, level: level || undefined });
  };
  
  const handleLevelChange = (value: string) => {
    const newLevel = value === 'all' ? '' : value;
    setLevel(newLevel);
    onFilterChange({ search: search || undefined, format: format || undefined, level: newLevel || undefined });
  };
  
  const clearFilters = () => {
    setSearch('');
    setFormat('');
    setLevel('');
    onFilterChange({});
  };
  
  const hasActiveFilters = search || format || level;
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Search bar */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search tutorials..."
          className="pl-11 h-12 rounded-none bg-white border-slate-200 focus:border-purple-500"
        />
        {search && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      {/* Filter toggle for mobile */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "rounded-none flex items-center gap-2 md:hidden",
            showFilters && "bg-purple-50 border-purple-300"
          )}
        >
          <SlidersHorizontal size={16} />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-purple-500" />
          )}
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs uppercase tracking-widest font-bold text-slate-500 hover:text-purple-600"
          >
            Clear All
          </Button>
        )}
      </div>
      
      {/* Filter dropdowns */}
      <div className={cn(
        "grid grid-cols-2 gap-3",
        !showFilters && "hidden md:grid"
      )}>
        <Select value={format || 'all'} onValueChange={handleFormatChange}>
          <SelectTrigger className="rounded-none h-11 bg-white border-slate-200">
            <SelectValue placeholder="Format" />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="all">All Formats</SelectItem>
            <SelectItem value="Video">Video</SelectItem>
            <SelectItem value="Audio">Audio</SelectItem>
            <SelectItem value="Text">Text</SelectItem>
            <SelectItem value="Essay">Essay</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={level || 'all'} onValueChange={handleLevelChange}>
          <SelectTrigger className="rounded-none h-11 bg-white border-slate-200">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TutorialFilters;
