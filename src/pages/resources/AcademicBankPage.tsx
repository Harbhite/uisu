import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Folder, FileText, Download, Search, ChevronRight, ArrowLeft, 
  BookOpen, GraduationCap, Filter, Grid, List, Loader2, Upload, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_url: string | null;
  external_url: string | null;
  faculty: string | null;
  department: string | null;
  course_code: string | null;
  level: string | null;
  tags: string[] | null;
  is_folder: boolean;
  parent_id: string | null;
  view_count: number;
  download_count: number;
}

const faculties = [
  'All Faculties',
  'Arts',
  'Agriculture',
  'Basic Medical Sciences',
  'Clinical Sciences',
  'Dentistry',
  'Education',
  'Environmental Design & Management',
  'Law',
  'Pharmacy',
  'Public Health',
  'Renewable Natural Resources',
  'Science',
  'Social Sciences',
  'Technology',
  'Veterinary Medicine'
];

const levels = ['All Levels', '100', '200', '300', '400', '500', '600'];

const AcademicBankPage = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('All Faculties');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; title: string }[]>([
    { id: null, title: 'Academic Bank' }
  ]);

  useEffect(() => {
    fetchResources();
  }, [currentFolder, selectedFaculty, selectedLevel]);

  const fetchResources = async () => {
    setLoading(true);
    let query = supabase
      .from('resources')
      .select('*')
      .eq('category', 'academic-bank')
      .order('is_folder', { ascending: false })
      .order('title');

    if (currentFolder) {
      query = query.eq('parent_id', currentFolder);
    } else {
      query = query.is('parent_id', null);
    }

    if (selectedFaculty !== 'All Faculties') {
      query = query.eq('faculty', selectedFaculty);
    }

    if (selectedLevel !== 'All Levels') {
      query = query.eq('level', selectedLevel);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching resources:', error);
    } else {
      setResources(data || []);
    }
    setLoading(false);
  };

  const handleFolderClick = async (folder: Resource) => {
    setCurrentFolder(folder.id);
    setBreadcrumbs([...breadcrumbs, { id: folder.id, title: folder.title }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    const crumb = breadcrumbs[index];
    setCurrentFolder(crumb.id);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  const handleDownload = async (resource: Resource) => {
    if (resource.file_url) {
      // Increment download count
      await supabase
        .from('resources')
        .update({ download_count: (resource.download_count || 0) + 1 })
        .eq('id', resource.id);
      
      window.open(resource.file_url, '_blank');
    } else if (resource.external_url) {
      window.open(resource.external_url, '_blank');
    }
  };

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.course_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (resource: Resource) => {
    if (resource.is_folder) return <Folder className="text-amber-500" size={24} />;
    if (resource.file_url?.endsWith('.pdf')) return <FileText className="text-red-500" size={24} />;
    return <FileText className="text-blue-500" size={24} />;
  };

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <SEO
        title="Academic Bank - UISU Resources"
        description="Access course materials, lecture notes, past questions, and study resources for all faculties."
        image="/screenshots/documents.png"
      />

      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/resources')}>
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground flex items-center gap-3">
                <BookOpen className="text-accent" /> Academic Bank
              </h1>
              <p className="text-muted-foreground mt-1">
                Course materials, lecture notes, and study resources
              </p>
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm mb-6 flex-wrap">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight size={14} className="text-muted-foreground" />}
                <button
                  onClick={() => handleBreadcrumbClick(idx)}
                  className={`hover:text-accent transition-colors ${
                    idx === breadcrumbs.length - 1 ? 'text-foreground font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {crumb.title}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search files, courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Faculty" />
              </SelectTrigger>
              <SelectContent>
                {faculties.map(f => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map(l => (
                  <SelectItem key={l} value={l}>{l === 'All Levels' ? l : `${l} Level`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid size={18} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-accent" size={32} />
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-20">
            <Folder className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-lg font-medium text-foreground mb-2">No resources found</h3>
            <p className="text-muted-foreground">
              {currentFolder ? 'This folder is empty.' : 'No materials match your filters.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredResources.map(resource => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card
                  className={`cursor-pointer hover:border-accent transition-all group ${
                    resource.is_folder ? 'hover:bg-accent/5' : ''
                  }`}
                  onClick={() => resource.is_folder ? handleFolderClick(resource) : handleDownload(resource)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-muted rounded-lg group-hover:bg-accent/10 transition-colors">
                      {getFileIcon(resource)}
                    </div>
                    <h3 className="text-sm font-medium truncate">{resource.title}</h3>
                    {resource.course_code && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {resource.course_code}
                      </Badge>
                    )}
                    {!resource.is_folder && (
                      <div className="flex items-center justify-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye size={12} /> {resource.view_count}</span>
                        <span className="flex items-center gap-1"><Download size={12} /> {resource.download_count}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredResources.map(resource => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card
                  className="cursor-pointer hover:border-accent transition-all"
                  onClick={() => resource.is_folder ? handleFolderClick(resource) : handleDownload(resource)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-muted rounded">
                      {getFileIcon(resource)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{resource.title}</h3>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground truncate">{resource.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {resource.course_code && (
                        <Badge variant="secondary">{resource.course_code}</Badge>
                      )}
                      {resource.faculty && (
                        <span className="text-xs text-muted-foreground hidden md:block">{resource.faculty}</span>
                      )}
                      {!resource.is_folder && (
                        <Button variant="ghost" size="icon">
                          <Download size={18} />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicBankPage;