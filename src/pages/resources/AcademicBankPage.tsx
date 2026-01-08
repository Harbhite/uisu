import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, Folder, FileText, Download, Plus,
  Grid, List, ChevronRight, Edit2, Trash2, Upload, X, FolderPlus, Loader2,
  Eye, FileIcon, BarChart3, TrendingUp, ArrowUpDown, Files
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

const AcademicBankPage = () => {
  const navigate = useNavigate();
  const { isStaff } = useAdminCheck();
  const [resources, setResources] = useState<AcademicResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'downloads'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Preview state
  const [previewFile, setPreviewFile] = useState<AcademicResource | null>(null);
  
  // Modal states
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<AcademicResource | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [savingFolder, setSavingFolder] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const currentFolderId = currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;

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
        setResources(data || []);
      }
      setLoading(false);
    };

    fetchResources();
  }, []);

  // Build path for a resource
  const buildPath = (resourceId: string, allResources: AcademicResource[]): string[] => {
    const path: string[] = [];
    let currentResource = allResources.find(r => r.id === resourceId);
    
    while (currentResource) {
      path.unshift(currentResource.name);
      if (currentResource.parent_id) {
        currentResource = allResources.find(r => r.id === currentResource!.parent_id);
      } else {
        break;
      }
    }
    
    return path;
  };

  // Global search across all resources
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setIsGlobalSearch(true);
      const query = searchQuery.toLowerCase();
      const results: SearchResult[] = resources
        .filter(r => r.name.toLowerCase().includes(query))
        .map(r => ({
          ...r,
          path: buildPath(r.id, resources)
        }));
      setSearchResults(results);
    } else {
      setIsGlobalSearch(false);
      setSearchResults([]);
    }
  }, [searchQuery, resources]);

  // Sort items
  const sortItems = (items: AcademicResource[]) => {
    return [...items].sort((a, b) => {
      // Folders always first
      if (a.resource_type === 'folder' && b.resource_type !== 'folder') return -1;
      if (a.resource_type !== 'folder' && b.resource_type === 'folder') return 1;

      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
          break;
        case 'downloads':
          comparison = (a.download_count || 0) - (b.download_count || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const items = sortItems(resources.filter(item => item.parent_id === currentFolderId));

  // Get top downloaded files for stats
  const topDownloaded = [...resources]
    .filter(r => r.resource_type !== 'folder' && (r.download_count || 0) > 0)
    .sort((a, b) => (b.download_count || 0) - (a.download_count || 0))
    .slice(0, 10);

  const handleNavigate = (folderId: string) => {
    setCurrentPath([...currentPath, folderId]);
    setSearchQuery('');
  };

  const handleNavigateUp = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  const getFolderName = (id: string | null) => {
    if (id === null) return 'Academic Bank';
    const found = resources.find(f => f.id === id);
    return found ? found.name : id;
  };

  const navigateToResource = (resource: SearchResult) => {
    if (resource.resource_type === 'folder') {
      const pathIds: string[] = [];
      let current = resources.find(r => r.id === resource.id);
      while (current && current.parent_id) {
        pathIds.unshift(current.parent_id);
        current = resources.find(r => r.id === current!.parent_id);
      }
      pathIds.push(resource.id);
      setCurrentPath(pathIds);
    } else {
      const pathIds: string[] = [];
      let current = resources.find(r => r.id === resource.parent_id);
      while (current) {
        pathIds.unshift(current.id);
        if (current.parent_id) {
          current = resources.find(r => r.id === current!.parent_id);
        } else {
          break;
        }
      }
      setCurrentPath(pathIds);
      setPreviewFile(resource);
    }
    setSearchQuery('');
  };

  // Admin functions
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    setSavingFolder(true);
    try {
      const { data, error } = await supabase
        .from('academic_resources')
        .insert({
          name: newFolderName.trim(),
          resource_type: 'folder',
          parent_id: currentFolderId,
          owner: 'Admin'
        })
        .select()
        .single();

      if (error) throw error;

      setResources([...resources, data]);
      setNewFolderName('');
      setShowFolderModal(false);
      toast.success('Folder created successfully');
    } catch (error) {
      console.error('Create folder error:', error);
      toast.error('Failed to create folder');
    } finally {
      setSavingFolder(false);
    }
  };

  const handleEditFolder = async () => {
    if (!editingFolder || !newFolderName.trim()) return;
    
    setSavingFolder(true);
    try {
      const { error } = await supabase
        .from('academic_resources')
        .update({ name: newFolderName.trim() })
        .eq('id', editingFolder.id);

      if (error) throw error;

      setResources(resources.map(r => 
        r.id === editingFolder.id ? { ...r, name: newFolderName.trim() } : r
      ));
      setEditingFolder(null);
      setNewFolderName('');
      setShowFolderModal(false);
      toast.success('Folder updated successfully');
    } catch (error) {
      console.error('Update folder error:', error);
      toast.error('Failed to update folder');
    } finally {
      setSavingFolder(false);
    }
  };

  const handleDeleteResource = async (resource: AcademicResource) => {
    if (!confirm(`Are you sure you want to delete "${resource.name}"?`)) return;
    
    try {
      if (resource.resource_type !== 'folder' && resource.file_url) {
        const path = resource.file_url.split('/').pop();
        if (path) {
          await supabase.storage.from('resources').remove([`academic-bank/${path}`]);
        }
      }

      const { error } = await supabase
        .from('academic_resources')
        .delete()
        .eq('id', resource.id);

      if (error) throw error;

      const removeWithChildren = (id: string): string[] => {
        const children = resources.filter(r => r.parent_id === id);
        return [id, ...children.flatMap(c => removeWithChildren(c.id))];
      };
      const idsToRemove = removeWithChildren(resource.id);
      setResources(resources.filter(r => !idsToRemove.includes(r.id)));
      
      toast.success('Deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resources')
        .upload(`academic-bank/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('resources')
        .getPublicUrl(`academic-bank/${fileName}`);

      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      let resourceType = 'pdf';
      if (['doc', 'docx'].includes(ext)) resourceType = 'doc';
      else if (['ppt', 'pptx'].includes(ext)) resourceType = 'ppt';
      else if (['xls', 'xlsx'].includes(ext)) resourceType = 'xls';

      const { data, error } = await supabase
        .from('academic_resources')
        .insert({
          name: file.name,
          resource_type: resourceType,
          parent_id: currentFolderId,
          file_url: urlData.publicUrl,
          file_size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          owner: 'Staff'
        })
        .select()
        .single();

      if (error) throw error;

      setResources([...resources, data]);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Multi-file upload handler (up to 25 files)
  const handleMultiFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files).slice(0, 25); // Max 25 files
    if (files.length > 25) {
      toast.warning(`Only first 25 files will be uploaded (${files.length} selected)`);
    }

    setUploading(true);
    const newResources: AcademicResource[] = [];
    let uploadedCount = 0;
    let failedCount = 0;

    try {
      for (const file of fileList) {
        setUploadProgress(`Uploading ${uploadedCount + 1}/${fileList.length}...`);
        
        const fileName = `${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('resources')
          .upload(`academic-bank/${fileName}`, file);

        if (uploadError) {
          console.error('Upload error for file:', file.name, uploadError);
          failedCount++;
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('resources')
          .getPublicUrl(`academic-bank/${fileName}`);

        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        let resourceType = 'pdf';
        if (['doc', 'docx'].includes(ext)) resourceType = 'doc';
        else if (['ppt', 'pptx'].includes(ext)) resourceType = 'ppt';
        else if (['xls', 'xlsx'].includes(ext)) resourceType = 'xls';

        const { data, error } = await supabase
          .from('academic_resources')
          .insert({
            name: file.name,
            resource_type: resourceType,
            parent_id: currentFolderId,
            file_url: urlData.publicUrl,
            file_size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
            owner: 'Staff'
          })
          .select()
          .single();

        if (!error && data) {
          newResources.push(data);
          uploadedCount++;
        } else {
          failedCount++;
        }
      }

      setResources([...resources, ...newResources]);
      
      if (failedCount > 0) {
        toast.warning(`Uploaded ${uploadedCount} files, ${failedCount} failed`);
      } else {
        toast.success(`Uploaded ${uploadedCount} files successfully`);
      }
    } catch (error) {
      console.error('Multi-file upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
      setUploadProgress('');
      if (multiFileInputRef.current) multiFileInputRef.current.value = '';
    }
  };

  // Folder upload handler
  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newResources: AcademicResource[] = [];
    const folderMap = new Map<string, string>(); // path -> id

    try {
      // Group files by their folder structure
      const fileList = Array.from(files);
      const totalFiles = fileList.length;
      let uploadedCount = 0;

      for (const file of fileList) {
        const pathParts = file.webkitRelativePath.split('/');
        const fileName = pathParts.pop()!;
        
        // Create folder hierarchy
        let parentId = currentFolderId;
        let currentPathStr = '';
        
        for (const folderName of pathParts) {
          currentPathStr += '/' + folderName;
          
          if (!folderMap.has(currentPathStr)) {
            // Check if folder exists in resources
            let existingFolder = resources.find(r => 
              r.name === folderName && r.parent_id === parentId && r.resource_type === 'folder'
            ) || newResources.find(r => 
              r.name === folderName && r.parent_id === parentId && r.resource_type === 'folder'
            );

            if (!existingFolder) {
              const { data, error } = await supabase
                .from('academic_resources')
                .insert({
                  name: folderName,
                  resource_type: 'folder',
                  parent_id: parentId,
                  owner: 'Staff'
                })
                .select()
                .single();

              if (error) throw error;
              existingFolder = data;
              newResources.push(data);
            }
            
            folderMap.set(currentPathStr, existingFolder.id);
          }
          
          parentId = folderMap.get(currentPathStr)!;
        }

        // Upload the file
        const storageName = `${Date.now()}-${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('resources')
          .upload(`academic-bank/${storageName}`, file);

        if (uploadError) {
          console.error('Upload error for file:', fileName, uploadError);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('resources')
          .getPublicUrl(`academic-bank/${storageName}`);

        const ext = fileName.split('.').pop()?.toLowerCase() || '';
        let resourceType = 'pdf';
        if (['doc', 'docx'].includes(ext)) resourceType = 'doc';
        else if (['ppt', 'pptx'].includes(ext)) resourceType = 'ppt';
        else if (['xls', 'xlsx'].includes(ext)) resourceType = 'xls';

        const { data, error } = await supabase
          .from('academic_resources')
          .insert({
            name: fileName,
            resource_type: resourceType,
            parent_id: parentId,
            file_url: urlData.publicUrl,
            file_size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
            owner: 'Staff'
          })
          .select()
          .single();

        if (!error && data) {
          newResources.push(data);
        }

        uploadedCount++;
        setUploadProgress(`Uploading ${uploadedCount}/${totalFiles} files...`);
      }

      setResources([...resources, ...newResources]);
      toast.success(`Uploaded ${uploadedCount} files successfully`);
    } catch (error) {
      console.error('Folder upload error:', error);
      toast.error('Failed to upload some files');
    } finally {
      setUploading(false);
      setUploadProgress('');
      if (folderInputRef.current) folderInputRef.current.value = '';
    }
  };

  const handleDownload = async (resource: AcademicResource) => {
    if (resource.file_url) {
      // Track download
      await supabase
        .from('academic_resources')
        .update({ download_count: (resource.download_count || 0) + 1 })
        .eq('id', resource.id);

      // Update local state
      setResources(resources.map(r => 
        r.id === resource.id ? { ...r, download_count: (r.download_count || 0) + 1 } : r
      ));

      window.open(resource.file_url, '_blank');
    }
  };

  const handlePreview = (resource: AcademicResource) => {
    if (resource.file_url) {
      setPreviewFile(resource);
    }
  };

  const canPreview = (resource: AcademicResource) => {
    return ['pdf', 'doc', 'ppt', 'xls'].includes(resource.resource_type) && resource.file_url;
  };

  const getPreviewUrl = (resource: AcademicResource) => {
    if (!resource.file_url) return '';
    
    if (resource.resource_type === 'pdf') {
      return `${resource.file_url}#toolbar=0`;
    }
    
    // Use Google Docs Viewer for Office documents
    return `https://docs.google.com/gview?url=${encodeURIComponent(resource.file_url)}&embedded=true`;
  };

  const breadcrumbPath = [{ id: null, name: 'Academic Bank' }, ...currentPath.map(id => ({ id, name: getFolderName(id) }))];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <SEO
        title="Academic Bank - Resources"
        description="Access lecture notes, past questions, and academic materials from all 13 faculties of University of Ibadan."
      />

      <div className="container mx-auto px-6 h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/resources')}>
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-2xl font-serif text-slate-800">Academic Bank</h1>
            {isStaff && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowStats(!showStats)}
              >
                <BarChart3 size={16} />
                Stats
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-96">
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
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

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {isGlobalSearch && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto"
                  >
                    <div className="p-2">
                      <div className="text-xs text-slate-400 px-3 py-2 border-b border-slate-100">
                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                      </div>
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => navigateToResource(result)}
                          className="w-full flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors text-left"
                        >
                          {result.resource_type === 'folder' ? (
                            <Folder className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                          ) : (
                            <FileText className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-slate-700 truncate">
                              {result.name}
                            </div>
                            <div className="text-xs text-slate-400 truncate">
                              {result.path.join(' / ')}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
                {isGlobalSearch && searchResults.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-6 text-center"
                  >
                    <FileIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No files or folders found</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort Controls */}
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(v: 'name' | 'date' | 'downloads') => setSortBy(v)}>
                  <SelectTrigger className="w-[130px] h-9 bg-white">
                    <ArrowUpDown size={14} className="mr-1.5" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="downloads">Downloads</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-2"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={16} />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={20} className="text-green-500" />
                  <h3 className="font-semibold text-slate-800">Most Downloaded Files</h3>
                </div>
                {topDownloaded.length === 0 ? (
                  <p className="text-sm text-slate-400">No download data yet</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {topDownloaded.map((file, index) => (
                      <div key={file.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <span className="text-lg font-bold text-slate-300">#{index + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                          <p className="text-xs text-slate-400">{file.download_count} downloads</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          {/* Toolbar / Breadcrumbs */}
          <div className="border-b border-slate-100 p-4 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center text-sm text-slate-600 overflow-x-auto">
              {breadcrumbPath.map((crumb, index) => (
                <React.Fragment key={crumb.id ?? 'root'}>
                  {index > 0 && <ChevronRight size={16} className="mx-1 text-slate-400 shrink-0" />}
                  <button
                    onClick={() => index === 0 ? setCurrentPath([]) : handleNavigateUp(index - 1)}
                    className={`hover:bg-slate-200 px-2 py-1 rounded transition-colors whitespace-nowrap ${index === breadcrumbPath.length - 1 ? 'font-semibold text-slate-900' : ''}`}
                  >
                    {crumb.name}
                  </button>
                </React.Fragment>
              ))}
            </div>

            {isStaff && (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    setEditingFolder(null);
                    setNewFolderName('');
                    setShowFolderModal(true);
                  }}
                >
                  <FolderPlus size={16} />
                  <span className="hidden sm:inline">New Folder</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => folderInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Folder size={16} />
                  <span className="hidden sm:inline">Upload Folder</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => multiFileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Files size={16} />
                  <span className="hidden sm:inline">Multiple Files</span>
                </Button>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  <span className="hidden sm:inline">{uploadProgress || 'Upload'}</span>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                />
                <input
                  ref={multiFileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleMultiFileUpload}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                  multiple
                />
                <input
                  ref={folderInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFolderUpload}
                  {...{ webkitdirectory: '', directory: '' } as any}
                  multiple
                />
              </div>
            )}
          </div>

          {/* File Grid/List */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Folder size={64} className="mb-4 opacity-20" />
                <p>This folder is empty</p>
                {isStaff && (
                  <Button
                    variant="outline"
                    className="mt-4 gap-2"
                    onClick={() => {
                      setEditingFolder(null);
                      setNewFolderName('');
                      setShowFolderModal(true);
                    }}
                  >
                    <FolderPlus size={16} />
                    Create a folder
                  </Button>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4' : 'space-y-2'}>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`
                      group cursor-pointer border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all relative
                      ${viewMode === 'grid' ? 'p-4 flex flex-col aspect-[4/3]' : 'p-3 flex items-center gap-4'}
                    `}
                  >
                    <div 
                      className="flex-1 min-w-0"
                      onClick={() => {
                        if (item.resource_type === 'folder') {
                          handleNavigate(item.id);
                        } else if (canPreview(item)) {
                          handlePreview(item);
                        } else {
                          handleDownload(item);
                        }
                      }}
                    >
                      <div className={`${viewMode === 'grid' ? 'mb-3' : ''} text-slate-500`}>
                        {item.resource_type === 'folder' ? (
                          <Folder className={`${viewMode === 'grid' ? 'w-10 h-10' : 'w-6 h-6'} text-slate-400 fill-blue-50`} />
                        ) : (
                          <FileText className={`${viewMode === 'grid' ? 'w-10 h-10' : 'w-6 h-6'} text-red-400`} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-slate-700 truncate group-hover:text-blue-700">
                          {item.name}
                        </h4>
                        {viewMode === 'list' && (
                          <div className="flex items-center gap-6 text-xs text-slate-400 mt-1">
                            <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</span>
                            <span>{item.owner}</span>
                            {item.file_size && <span>{item.file_size}</span>}
                            {item.download_count !== undefined && item.download_count > 0 && (
                              <span className="flex items-center gap-1">
                                <Download size={10} /> {item.download_count}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={`flex items-center gap-1 ${viewMode === 'grid' ? 'absolute top-2 right-2' : ''} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      {item.resource_type !== 'folder' && canPreview(item) && (
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handlePreview(item)}>
                          <Eye size={14} />
                        </Button>
                      )}
                      {item.resource_type !== 'folder' && (
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDownload(item)}>
                          <Download size={14} />
                        </Button>
                      )}
                      {isStaff && item.resource_type === 'folder' && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingFolder(item);
                            setNewFolderName(item.name);
                            setShowFolderModal(true);
                          }}
                        >
                          <Edit2 size={14} />
                        </Button>
                      )}
                      {isStaff && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7 text-red-500 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteResource(item);
                          }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Folder Modal */}
      <Dialog open={showFolderModal} onOpenChange={setShowFolderModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFolder ? 'Edit Folder' : 'New Folder'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (editingFolder ? handleEditFolder() : handleCreateFolder())}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFolderModal(false)}>Cancel</Button>
            <Button 
              onClick={editingFolder ? handleEditFolder : handleCreateFolder}
              disabled={savingFolder || !newFolderName.trim()}
            >
              {savingFolder && <Loader2 size={14} className="animate-spin mr-2" />}
              {editingFolder ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Modal */}
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-medium truncate pr-4">
                {previewFile?.name}
              </DialogTitle>
              <div className="flex items-center gap-2 shrink-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => previewFile && handleDownload(previewFile)}
                >
                  <Download size={14} />
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPreviewFile(null)}
                >
                  <X size={18} />
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 bg-slate-100 h-full">
            {previewFile?.file_url && (
              <iframe
                src={getPreviewUrl(previewFile)}
                className="w-full h-[calc(90vh-80px)]"
                title={previewFile.name}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AcademicBankPage;
