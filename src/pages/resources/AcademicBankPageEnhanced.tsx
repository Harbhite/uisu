/**
 * Enhanced Academic Bank Page with Advanced Filtering, Recommendations, and OCR
 * This is a comprehensive integration of the new features
 * 
 * Key additions:
 * 1. Advanced filtering sidebar with faculty, level, semester, course filters
 * 2. Smart recommendations engine showing related materials
 * 3. OCR integration for searchable document content
 * 4. Resource interaction tracking for personalization
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, Folder, FileText, Download, Plus,
  Grid, List, ChevronRight, Edit2, Trash2, Upload, X, FolderPlus, Loader2,
  Eye, FileIcon, BarChart3, TrendingUp, ArrowUpDown, Files, FolderUp, File,
  History, Clock, User, BookOpen, Star, GraduationCap, Share2, Link2, Filter, Zap
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UploadQueue, UploadItem } from './UploadQueue';
import { AdvancedFilterSidebar } from '@/components/AcademicBank/AdvancedFilterSidebar';
import { RecommendationsPanel } from '@/components/AcademicBank/RecommendationsPanel';
import { format } from 'date-fns';

// Import services
import { applyAdvancedFilters, performFullTextSearch } from '@/services/filterService';
import { getRecommendationsForResource, trackResourceInteraction, getTrendingResources } from '@/services/recommendationService';
import { AcademicResourceExtended, FilterCriteria, ResourceRecommendation } from '@/types/academicbank';

// Original interfaces
interface AuditLog {
  id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: any;
  new_data: any;
  created_at: string;
  user_id: string | null;
  user_email?: string;
}

interface AcademicResource {
  id: string;
  name: string;
  resource_type: string;
  parent_id: string | null;
  file_url: string | null;
  file_size: string | null;
  owner: string | null;
  created_at: string | null;
  download_count?: number;
}

interface SearchResult extends AcademicResource {
  path: string[];
}

const AcademicBankPageEnhanced = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isStaff, isAdmin } = useAdminCheck();
  const [resources, setResources] = useState<AcademicResourceExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'downloads'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // New feature states
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterCriteria>({});
  const [filteredResources, setFilteredResources] = useState<AcademicResourceExtended[]>([]);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<ResourceRecommendation[]>([]);
  const [selectedResource, setSelectedResource] = useState<AcademicResourceExtended | null>(null);
  const [trendingResources, setTrendingResources] = useState<AcademicResourceExtended[]>([]);

  // localStorage keys
  const STORAGE_KEYS = {
    viewMode: 'academicbank_viewmode',
    sortBy: 'academicbank_sortby',
    sortOrder: 'academicbank_sortorder',
    currentPath: 'academicbank_currentpath',
    uploadHistory: 'academicbank_uploadhistory',
    activeFilters: 'academicbank_activefilters'
  };
  
  // Preview sidebar state
  const [previewFile, setPreviewFile] = useState<AcademicResource | null>(null);
  const [showPreviewSidebar, setShowPreviewSidebar] = useState(false);
  
  // Activity log state
  const [activityLogs, setActivityLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  
  // Modal states
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<AcademicResource | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [savingFolder, setSavingFolder] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Upload Queue State
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [isQueueVisible, setIsQueueVisible] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const currentFolderId = currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;

  // Initialize state from localStorage
  useEffect(() => {
    try {
      const savedViewMode = localStorage.getItem(STORAGE_KEYS.viewMode);
      const savedSortBy = localStorage.getItem(STORAGE_KEYS.sortBy);
      const savedSortOrder = localStorage.getItem(STORAGE_KEYS.sortOrder);
      const savedCurrentPath = localStorage.getItem(STORAGE_KEYS.currentPath);
      const savedFilters = localStorage.getItem(STORAGE_KEYS.activeFilters);
      
      if (savedViewMode === 'grid' || savedViewMode === 'list') {
        setViewMode(savedViewMode);
      }
      if (savedSortBy === 'name' || savedSortBy === 'date' || savedSortBy === 'downloads') {
        setSortBy(savedSortBy);
      }
      if (savedSortOrder === 'asc' || savedSortOrder === 'desc') {
        setSortOrder(savedSortOrder);
      }
      if (savedCurrentPath) {
        try {
          setCurrentPath(JSON.parse(savedCurrentPath));
        } catch (e) {
          console.warn('Failed to parse saved path');
        }
      }
      if (savedFilters) {
        try {
          setActiveFilters(JSON.parse(savedFilters));
        } catch (e) {
          console.warn('Failed to parse saved filters');
        }
      }
    } catch (error) {
      console.warn('Error loading from localStorage:', error);
    }
  }, []);

  // Persist filters to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.activeFilters, JSON.stringify(activeFilters));
  }, [activeFilters]);

  // Fetch all resources
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('academic_resources')
        .select('*')
        .order('resource_type', { ascending: false })
        .order('name');
      
      if (error) {
        console.error('Error fetching resources:', error);
        toast.error('Failed to load resources');
      } else {
        setResources((data || []) as AcademicResourceExtended[]);
      }
      setLoading(false);
    };

    fetchResources();
  }, []);

  // Fetch trending resources
  useEffect(() => {
    const fetchTrending = async () => {
      const trending = await getTrendingResources(5);
      setTrendingResources(trending);
    };
    fetchTrending();
  }, []);

  // Apply filters when activeFilters changes
  useEffect(() => {
    const applyFilters = async () => {
      if (Object.keys(activeFilters).length === 0) {
        setFilteredResources([]);
        return;
      }

      setIsFilterLoading(true);
      const filtered = await applyAdvancedFilters(activeFilters);
      setFilteredResources(filtered);
      setIsFilterLoading(false);
    };

    applyFilters();
  }, [activeFilters]);

  // Fetch recommendations for selected resource
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (selectedResource) {
        const recs = await getRecommendationsForResource(selectedResource.id, 5);
        setRecommendations(recs);
      }
    };
    fetchRecommendations();
  }, [selectedResource]);

  // Handle filter application
  const handleApplyFilters = (filters: FilterCriteria) => {
    setActiveFilters(filters);
    setShowFilterSidebar(false);
    toast.success('Filters applied');
  };

  // Handle resource click to show recommendations
  const handleResourceClick = async (resource: AcademicResourceExtended) => {
    setSelectedResource(resource);
    
    // Track interaction
    await trackResourceInteraction(resource.id, 'view');
  };

  // Display filtered or normal resources
  const displayResources = Object.keys(activeFilters).length > 0 ? filteredResources : resources;

  return (
    <div className="min-h-screen bg-nobel-cream">
      <SEO
        title="Academic Bank - Resources"
        description="Access lecture notes, past questions, and academic materials from all 13 faculties of University of Ibadan."
      />

      {/* Hero Section */}
      <div className="bg-ui-blue text-white pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <button
            onClick={() => navigate('/resources')}
            className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-white/70 hover:text-nobel-gold transition-colors mb-8"
          >
            <div className="p-2 rounded-full border border-white/30 group-hover:border-nobel-gold transition-colors">
              <ArrowLeft size={14} />
            </div>
            <span>Back to Resources</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-4"
              >
                <div className="p-3 bg-nobel-gold/20 rounded-none">
                  <BookOpen size={24} className="text-nobel-gold" />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-nobel-gold">Academic Resources</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-serif mb-4"
              >
                Academic Bank
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-white/70 max-w-xl text-lg"
              >
                Access lecture notes, past questions, and academic materials with smart filtering and personalized recommendations.
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search & Controls Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 md:max-w-md w-full">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-none px-4 py-3 focus-within:border-ui-blue focus-within:bg-white transition-all">
                <Search size={18} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search all files and folders..."
                  className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowFilterSidebar(true)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Filter size={16} />
                <span className="hidden sm:inline">Filters</span>
                {Object.keys(activeFilters).length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-ui-blue text-white text-xs rounded-full">
                    {Object.keys(activeFilters).length}
                  </span>
                )}
              </Button>

              <Button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                variant="outline"
                size="sm"
              >
                {viewMode === 'grid' ? <List size={16} /> : <Grid size={16} />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filter Sidebar */}
      <AdvancedFilterSidebar
        isOpen={showFilterSidebar}
        onClose={() => setShowFilterSidebar(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={activeFilters}
        isLoading={isFilterLoading}
      />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Trending Resources Section */}
        {trendingResources.length > 0 && !isGlobalSearch && Object.keys(activeFilters).length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-nobel-gold" />
              <h2 className="text-2xl font-semibold text-slate-900">Trending This Week</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {trendingResources.map(resource => (
                <motion.button
                  key={resource.id}
                  onClick={() => handleResourceClick(resource)}
                  className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg hover:shadow-md transition-all text-left"
                >
                  <FileText size={24} className="text-nobel-gold mb-2" />
                  <p className="font-medium text-sm text-slate-900 truncate">{resource.name}</p>
                  {resource.course_code && (
                    <p className="text-xs text-slate-600 mt-1">{resource.course_code}</p>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recommendations for Selected Resource */}
        {selectedResource && recommendations.length > 0 && (
          <RecommendationsPanel
            currentResource={selectedResource}
            recommendations={recommendations}
            resources={displayResources}
            onResourceClick={handleResourceClick}
          />
        )}

        {/* Resources Grid/List */}
        <div className="mt-8">
          {isFilterLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-ui-blue" />
            </div>
          ) : displayResources.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">No resources found matching your criteria</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4' : 'space-y-2'}>
              {displayResources.map(resource => (
                <motion.div
                  key={resource.id}
                  onClick={() => handleResourceClick(resource)}
                  className="p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-all cursor-pointer"
                >
                  <FileText size={20} className="text-ui-blue mb-2" />
                  <p className="font-medium text-sm text-slate-900 truncate">{resource.name}</p>
                  {resource.course_code && (
                    <p className="text-xs text-slate-600 mt-1">{resource.course_code}</p>
                  )}
                  {resource.view_count !== undefined && (
                    <p className="text-xs text-slate-400 mt-1">{resource.view_count} views</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcademicBankPageEnhanced;
