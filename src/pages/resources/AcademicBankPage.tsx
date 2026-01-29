import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, Folder, FileText, Download, Plus,
  Grid, List, ChevronRight, Edit2, Trash2, Upload, X, FolderPlus, Loader2,
  Eye, FileIcon, BarChart3, TrendingUp, ArrowUpDown, Files, FolderUp, File,
  History, Clock, User, BookOpen, Star, GraduationCap, Share2, Link2
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
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: Record<string, unknown>;
  new_data: Record<string, unknown>;
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

const AcademicBankPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isStaff, isAdmin } = useAdminCheck();
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

  // Handle shared folder link from URL
  useEffect(() => {
    const folderId = searchParams.get('folder');
    if (folderId && resources.length > 0) {
      // Build the path to the folder
      const buildPathToFolder = (targetId: string): string[] => {
        const path: string[] = [];
        let currentId: string | null = targetId;
        
        while (currentId) {
          const resource = resources.find(r => r.id === currentId);
          if (resource) {
            path.unshift(resource.id);
            currentId = resource.parent_id;
          } else {
            break;
          }
        }
        return path;
      };
      
      const folder = resources.find(r => r.id === folderId && r.resource_type === 'folder');
      if (folder) {
        const pathToFolder = buildPathToFolder(folderId);
        setCurrentPath(pathToFolder);
      }
    }
  }, [searchParams, resources]);

  // Fetch activity logs (admin only)
  const fetchActivityLogs = useCallback(async () => {
    if (!isAdmin) return;
    
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('table_name', 'academic_resources')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch user emails for the logs
      const userIds = [...new Set((data || []).map(log => log.user_id).filter(Boolean))];
      const userEmailMap: Record<string, string> = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds);
        
        if (profiles) {
          profiles.forEach(p => {
            userEmailMap[p.id] = p.email || p.full_name || 'Unknown';
          });
        }
      }

      const logsWithEmails = (data || []).map(log => ({
        ...log,
        user_email: log.user_id ? (userEmailMap[log.user_id] || 'Unknown') : 'System'
      }));

      setActivityLogs(logsWithEmails);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast.error('Failed to load activity logs');
    } finally {
      setLoadingLogs(false);
    }
  }, [isAdmin]);

  // Fetch logs when activity log panel opens
  useEffect(() => {
    if (showActivityLog && isAdmin) {
      fetchActivityLogs();
    }
  }, [showActivityLog, isAdmin, fetchActivityLogs]);

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

  const getResourceTypeFromName = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (['doc', 'docx'].includes(ext)) return 'doc';
    if (['ppt', 'pptx'].includes(ext)) return 'ppt';
    if (['xls', 'xlsx'].includes(ext)) return 'xls';
    return 'pdf';
  };

  const makeStoragePath = (opts: { fileName: string; relativePath?: string | null; parentId?: string | null }) => {
    // Keep uploads unique and (when applicable) preserve folder structure.
    const uniquePrefix = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const safeRelative = (opts.relativePath || '')
      .replace(/^\/+/, '')
      .replace(/\.\./g, '')
      .replace(/\\/g, '/');

    // Sanitize filename
    const sanitizedFileName = opts.fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

    // Use passed parentId if available (checking for undefined), otherwise fallback to currentFolderId
    const targetFolderId = opts.parentId !== undefined ? opts.parentId : currentFolderId;
    const baseDir = targetFolderId ? `academic-bank/${targetFolderId}` : 'academic-bank/root';

    // If a relativePath is provided (folder upload), store under a unique session folder.
    if (safeRelative) {
      return `${baseDir}/folder-upload/${uniquePrefix}/${safeRelative}`;
    }

    return `${baseDir}/${uniquePrefix}-${sanitizedFileName}`;
  };

  const uploadOneFile = useCallback(async (item: UploadItem) => {
    // Update status to uploading
    setUploadQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'uploading', progress: 0 } : i));

    try {
      // Simulation of progress since Supabase doesn't support it directly in this client version
      const progressInterval = setInterval(() => {
        setUploadQueue(prev => prev.map(i => {
          if (i.id === item.id && i.status === 'uploading') {
            return { ...i, progress: Math.min(i.progress + 10, 90) };
          }
          return i;
        }));
      }, 300);

      const storagePath = makeStoragePath({
        fileName: item.displayName,
        relativePath: item.relativePath,
        parentId: item.parentId
      });

      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(storagePath, item.file, { upsert: true });

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('resources').getPublicUrl(storagePath);

      const { data, error } = await supabase
        .from('academic_resources')
        .insert({
          name: item.displayName,
          resource_type: getResourceTypeFromName(item.displayName),
          parent_id: item.parentId,
          file_url: urlData.publicUrl,
          file_size: `${(item.file.size / 1024 / 1024).toFixed(1)} MB`,
          owner: 'Staff'
        })
        .select()
        .single();

      if (error) throw error;

      // Update success
      setUploadQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'success', progress: 100 } : i));
      setResources(prev => [...prev, data as AcademicResource]);

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error', progress: 0, error: error.message || 'Failed' } : i));
    }
  }, [currentFolderId]);

  // Queue Processor Effect
  useEffect(() => {
    const processQueue = async () => {
      // Find one pending item
      const pendingItem = uploadQueue.find(item => item.status === 'pending');
      const uploadingCount = uploadQueue.filter(item => item.status === 'uploading').length;

      // Limit concurrency to 3
      if (pendingItem && uploadingCount < 3) {
        await uploadOneFile(pendingItem);
      }
    };

    processQueue();
  }, [uploadQueue, uploadOneFile]); // Depend on queue changes to trigger next processing

  const addToQueue = (files: File[], parentId: string | null, relativePaths: Record<string, string> = {}) => {
    const newItems: UploadItem[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      parentId,
      status: 'pending',
      progress: 0,
      displayName: file.name,
      relativePath: relativePaths[file.name] || null
    }));

    setUploadQueue(prev => [...prev, ...newItems]);
    setIsQueueVisible(true);
  };

  const handleRetry = (id: string) => {
    setUploadQueue(prev => prev.map(i => i.id === id ? { ...i, status: 'pending', progress: 0, error: undefined } : i));
  };

  const handleClearCompleted = () => {
    setUploadQueue(prev => prev.filter(i => i.status === 'uploading' || i.status === 'pending'));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    addToQueue([file], currentFolderId);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleMultiFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    addToQueue(Array.from(files), currentFolderId);
    if (multiFileInputRef.current) multiFileInputRef.current.value = '';
  };

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // We need to pre-process folders to create structure first,
    // BUT since queue is async, we should probably create folders first then add files to queue
    // OR we can make the queue processor smarter.
    // For simplicity, we'll create folders synchronously (blocking) then queue files.
    // This maintains the user expectation that "upload started"

    const fileList = Array.from(files);
    const folderMap = new Map<string, string>(); // path -> id
    const createdResources: AcademicResource[] = [];
    const relativePaths: Record<string, string> = {};
    const filesToUpload: { file: File, parentId: string | null }[] = [];

    // Show a toast that we are preparing folder structure
    toast.info('Preparing folder structure...');

    try {
      for (const file of fileList) {
        const fullRelativePath = (file.webkitRelativePath || file.name).replace(/\\/g, '/');
        const pathParts = fullRelativePath.split('/');
        const fileName = pathParts.pop() || file.name;
        relativePaths[file.name] = fullRelativePath;

        let parentId = currentFolderId;
        let currentPathStr = '';

        // Create folder hierarchy in DB
        for (const folderName of pathParts) {
          if (!folderName) continue;
          currentPathStr += '/' + folderName;

          if (!folderMap.has(currentPathStr)) {
             // Check if folder exists in DB or locally created
             const existingFolder =
               resources.find(r => r.name === folderName && r.parent_id === parentId && r.resource_type === 'folder') ||
               createdResources.find(r => r.name === folderName && r.parent_id === parentId && r.resource_type === 'folder');

             if (existingFolder) {
               folderMap.set(currentPathStr, existingFolder.id);
             } else {
               // Create it
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
               createdResources.push(data as AcademicResource);
               folderMap.set(currentPathStr, (data as AcademicResource).id);
             }
          }
          parentId = folderMap.get(currentPathStr)!;
        }

        filesToUpload.push({ file, parentId });
      }

      setResources(prev => [...prev, ...createdResources]);

      // Add to queue
      const newItems: UploadItem[] = filesToUpload.map(item => ({
        id: crypto.randomUUID(),
        file: item.file,
        parentId: item.parentId,
        status: 'pending',
        progress: 0,
        displayName: item.file.name,
        relativePath: relativePaths[item.file.name]
      }));

      setUploadQueue(prev => [...prev, ...newItems]);
      setIsQueueVisible(true);
      toast.success('Folder structure created. Starting uploads...');

    } catch (error) {
      console.error('Folder prep error', error);
      toast.error('Failed to prepare folder structure');
    } finally {
      if (folderInputRef.current) folderInputRef.current.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isStaff) {
      setIsDragging(true);
    }
  }, [isStaff]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!isStaff) return;

    const dataTransferItems = e.dataTransfer.items;
    const files: File[] = [];

    // Collect all files from the drop
    for (let i = 0; i < dataTransferItems.length; i++) {
      const item = dataTransferItems[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }

    if (files.length === 0) return;

    // Add files to upload queue
    addToQueue(files, currentFolderId);
    toast.success(`${files.length} file(s) added to upload queue`);
  }, [isStaff, currentFolderId]);

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
      setShowPreviewSidebar(true);
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'INSERT': return 'Uploaded';
      case 'UPDATE': return 'Updated';
      case 'DELETE': return 'Deleted';
      default: return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT': return 'text-green-600 bg-green-50';
      case 'UPDATE': return 'text-blue-600 bg-blue-50';
      case 'DELETE': return 'text-red-600 bg-red-50';
      default: return 'text-slate-600 bg-slate-50';
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

  // Stats for the hero section
  const totalFiles = resources.filter(r => r.resource_type !== 'folder').length;
  const totalFolders = resources.filter(r => r.resource_type === 'folder').length;
  const totalDownloads = resources.reduce((acc, r) => acc + (r.download_count || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Loading Hero */}
        <div className="bg-ui-blue text-white pt-32 pb-20">
          <div className="container mx-auto px-6">
            <div className="animate-pulse">
              <div className="h-4 w-32 bg-white/20 rounded mb-8"></div>
              <div className="h-12 w-96 bg-white/20 rounded mb-4"></div>
              <div className="h-6 w-64 bg-white/20 rounded"></div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 py-12 flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm font-medium">Loading academic resources...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nobel-cream">
      <SEO
        title="Academic Bank - Resources"
        description="Access lecture notes, past questions, and academic materials from all 13 faculties of University of Ibadan."
      />

      {/* Hero Section */}
      <div className="bg-ui-blue text-white pt-32 pb-16 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          {/* Back Button */}
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
                Access lecture notes, past questions, and academic materials from all 13 faculties of University of Ibadan.
              </motion.p>
            </div>

          </div>
        </div>
      </div>

      {/* Search & Controls Bar */}
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

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {isGlobalSearch && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-none shadow-xl z-50 max-h-80 overflow-y-auto"
                  >
                    <div className="p-2">
                      <div className="text-xs text-slate-400 px-3 py-2 border-b border-slate-100 uppercase tracking-wider">
                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                      </div>
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => navigateToResource(result)}
                          className="w-full flex items-start gap-3 p-3 hover:bg-slate-50 transition-colors text-left"
                        >
                          {result.resource_type === 'folder' ? (
                            <Folder className="w-5 h-5 text-ui-blue shrink-0 mt-0.5" />
                          ) : (
                            <FileText className="w-5 h-5 text-nobel-gold shrink-0 mt-0.5" />
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
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-none shadow-xl z-50 p-6 text-center"
                  >
                    <FileIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No files or folders found</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Admin Controls */}
              {isStaff && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-none border-slate-300"
                  onClick={() => setShowStats(!showStats)}
                >
                  <BarChart3 size={16} />
                  <span className="hidden sm:inline">Stats</span>
                </Button>
              )}
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-none border-slate-300"
                  onClick={() => setShowActivityLog(true)}
                >
                  <History size={16} />
                  <span className="hidden sm:inline">Activity</span>
                </Button>
              )}

              {/* Sort Controls */}
              <Select value={sortBy} onValueChange={(v: 'name' | 'date' | 'downloads') => setSortBy(v)}>
                <SelectTrigger className="w-[130px] h-9 bg-white rounded-none border-slate-300">
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
                className="h-9 px-2 rounded-none border-slate-300"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-0 border border-slate-300">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  className={`h-9 w-9 rounded-none ${viewMode === 'grid' ? 'bg-ui-blue hover:bg-ui-dark' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={16} />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  className={`h-9 w-9 rounded-none ${viewMode === 'list' ? 'bg-ui-blue hover:bg-ui-dark' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Panel */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-white border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp size={20} className="text-nobel-gold" />
                  <h3 className="font-serif text-xl text-ui-blue">Most Downloaded Files</h3>
                </div>
                {topDownloaded.length === 0 ? (
                  <p className="text-sm text-slate-400">No download data yet</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {topDownloaded.map((file, index) => (
                      <div key={file.id} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 hover:border-nobel-gold/30 transition-colors">
                        <span className="text-2xl font-serif text-nobel-gold">#{index + 1}</span>
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

        {/* File Browser */}
        <div className="bg-white border border-slate-200 overflow-hidden">
          {/* Breadcrumbs & Actions */}
          <div className="border-b border-slate-100 p-4 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center text-sm text-slate-600 overflow-x-auto">
              {breadcrumbPath.map((crumb, index) => (
                <React.Fragment key={crumb.id ?? 'root'}>
                  {index > 0 && <ChevronRight size={16} className="mx-1 text-slate-400 shrink-0" />}
                  <button
                    onClick={() => index === 0 ? setCurrentPath([]) : handleNavigateUp(index - 1)}
                    className={`hover:text-ui-blue px-2 py-1 transition-colors whitespace-nowrap ${index === breadcrumbPath.length - 1 ? 'font-semibold text-ui-blue' : ''}`}
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
                  className="gap-2 rounded-none border-slate-300"
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
                  className="gap-2 rounded-none bg-ui-blue hover:bg-ui-dark"
                  onClick={() => setShowUploadModal(true)}
                >
                  <Upload size={16} />
                  <span className="hidden sm:inline">Upload</span>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    handleFileUpload(e);
                    setShowUploadModal(false);
                  }}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                />
                <input
                  ref={multiFileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    handleMultiFileUpload(e);
                    setShowUploadModal(false);
                  }}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                  multiple
                />
                <input
                  ref={folderInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    handleFolderUpload(e);
                    setShowUploadModal(false);
                  }}
                  {...{ webkitdirectory: '', directory: '' } as any}
                  multiple
                />
              </div>
            )}
          </div>

          {/* File Grid/List with Drag and Drop */}
          <div 
            ref={dropZoneRef}
            className={`min-h-[500px] p-6 relative transition-colors ${isDragging ? 'bg-ui-blue/5' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Drag Overlay */}
            {isDragging && (
              <div className="absolute inset-0 bg-ui-blue/10 border-2 border-dashed border-ui-blue flex items-center justify-center z-10 pointer-events-none">
                <div className="text-center">
                  <Upload size={48} className="mx-auto text-ui-blue mb-3" />
                  <p className="text-ui-blue font-serif text-xl">Drop files here to upload</p>
                  <p className="text-ui-blue/60 text-sm mt-1">Up to 25 files at once</p>
                </div>
              </div>
            )}
            
            {items.length === 0 ? (
              <div className="h-[400px] flex flex-col items-center justify-center text-slate-400">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <Folder size={40} className="text-slate-300" />
                </div>
                <p className="font-serif text-xl text-slate-500 mb-2">This folder is empty</p>
                <p className="text-sm text-slate-400 mb-6">Upload files or create folders to get started</p>
                {isStaff && (
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="gap-2 rounded-none border-slate-300"
                      onClick={() => {
                        setEditingFolder(null);
                        setNewFolderName('');
                        setShowFolderModal(true);
                      }}
                    >
                      <FolderPlus size={16} />
                      Create Folder
                    </Button>
                    <Button
                      className="gap-2 rounded-none bg-ui-blue hover:bg-ui-dark"
                      onClick={() => setShowUploadModal(true)}
                    >
                      <Upload size={16} />
                      Upload Files
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4' : 'space-y-2'}>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`
                      group cursor-pointer border transition-all relative
                      ${viewMode === 'grid' 
                        ? 'p-4 flex flex-col bg-white border-slate-100 hover:border-ui-blue hover:shadow-md' 
                        : 'p-4 flex items-center gap-4 bg-white border-slate-100 hover:border-ui-blue hover:bg-slate-50'}
                    `}
                  >
                    <div 
                      className={`flex-1 min-w-0 ${viewMode === 'grid' ? '' : 'flex items-center gap-4'}`}
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
                      <div className={`${viewMode === 'grid' ? 'mb-4 flex justify-center' : ''}`}>
                        {item.resource_type === 'folder' ? (
                          <div className={`${viewMode === 'grid' ? 'w-16 h-16' : 'w-10 h-10'} bg-ui-blue/10 flex items-center justify-center`}>
                            <Folder className={`${viewMode === 'grid' ? 'w-8 h-8' : 'w-5 h-5'} text-ui-blue`} />
                          </div>
                        ) : (
                          <div className={`${viewMode === 'grid' ? 'w-16 h-16' : 'w-10 h-10'} bg-nobel-gold/10 flex items-center justify-center`}>
                            <FileText className={`${viewMode === 'grid' ? 'w-8 h-8' : 'w-5 h-5'} text-nobel-gold`} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium text-slate-700 truncate group-hover:text-ui-blue ${viewMode === 'grid' ? 'text-sm text-center' : 'text-sm'}`}>
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
                        {viewMode === 'grid' && item.resource_type !== 'folder' && (
                          <p className="text-xs text-slate-400 text-center mt-1">{item.file_size || ''}</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={`flex items-center gap-1 ${viewMode === 'grid' ? 'absolute top-2 right-2' : ''} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      {item.resource_type !== 'folder' && canPreview(item) && (
                        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-none" onClick={() => handlePreview(item)}>
                          <Eye size={14} />
                        </Button>
                      )}
                      {item.resource_type !== 'folder' && (
                        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-none" onClick={() => handleDownload(item)}>
                          <Download size={14} />
                        </Button>
                      )}
                      {item.resource_type === 'folder' && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7 rounded-none text-ui-blue hover:text-ui-dark"
                          onClick={(e) => {
                            e.stopPropagation();
                            const shareUrl = `${window.location.origin}/resources/academic-bank?folder=${item.id}`;
                            navigator.clipboard.writeText(shareUrl);
                            toast.success('Folder link copied to clipboard!');
                          }}
                          title="Share folder link"
                        >
                          <Link2 size={14} />
                        </Button>
                      )}
                      {isStaff && item.resource_type === 'folder' && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7 rounded-none"
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
                          className="h-7 w-7 rounded-none text-red-500 hover:text-red-600"
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
        <DialogContent className="sm:max-w-md rounded-none">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-ui-blue">{editingFolder ? 'Edit Folder' : 'Create New Folder'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">Folder Name</label>
            <Input
              placeholder="Enter folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (editingFolder ? handleEditFolder() : handleCreateFolder())}
              className="rounded-none border-slate-300 focus:border-ui-blue"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowFolderModal(false)} className="rounded-none border-slate-300">Cancel</Button>
            <Button 
              onClick={editingFolder ? handleEditFolder : handleCreateFolder}
              disabled={savingFolder || !newFolderName.trim()}
              className="rounded-none bg-ui-blue hover:bg-ui-dark"
            >
              {savingFolder && <Loader2 size={14} className="animate-spin mr-2" />}
              {editingFolder ? 'Update Folder' : 'Create Folder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Sidebar */}
      <Sheet open={showPreviewSidebar} onOpenChange={setShowPreviewSidebar}>
        <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col rounded-none">
          <SheetHeader className="p-6 border-b border-slate-200 shrink-0 bg-ui-blue text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-nobel-gold" />
                  <span className="text-xs uppercase tracking-wider text-white/60">Document Preview</span>
                </div>
                <SheetTitle className="text-lg font-serif text-white truncate">
                  {previewFile?.name}
                </SheetTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 rounded-none border-white/30 text-white hover:bg-white/10 hover:text-white shrink-0"
                onClick={() => previewFile && handleDownload(previewFile)}
              >
                <Download size={14} />
                Download
              </Button>
            </div>
            {previewFile && (
              <div className="flex items-center gap-4 text-xs text-white/60 mt-3">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {previewFile.created_at ? format(new Date(previewFile.created_at), 'MMM d, yyyy') : 'Unknown'}
                </span>
                {previewFile.file_size && <span>{previewFile.file_size}</span>}
                {previewFile.download_count !== undefined && previewFile.download_count > 0 && (
                  <span className="flex items-center gap-1">
                    <Download size={12} /> {previewFile.download_count} downloads
                  </span>
                )}
              </div>
            )}
          </SheetHeader>
          <div className="flex-1 bg-slate-100 overflow-hidden">
            {previewFile?.file_url && (
              <iframe
                src={getPreviewUrl(previewFile)}
                className="w-full h-full border-0"
                title={previewFile.name}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Activity Log Sidebar */}
      <Sheet open={showActivityLog} onOpenChange={setShowActivityLog}>
        <SheetContent className="w-full sm:max-w-lg p-0 rounded-none">
          <SheetHeader className="p-6 border-b border-slate-200 bg-ui-blue text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-nobel-gold/20 rounded-none">
                <History size={20} className="text-nobel-gold" />
              </div>
              <div>
                <SheetTitle className="font-serif text-xl text-white">Activity Log</SheetTitle>
                <p className="text-xs text-white/60 mt-1">Recent changes to Academic Bank</p>
              </div>
            </div>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-120px)]">
            {loadingLogs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-ui-blue" />
              </div>
            ) : activityLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <History size={32} className="text-slate-300" />
                </div>
                <p className="font-medium text-slate-500">No activity yet</p>
                <p className="text-sm text-slate-400 mt-1">Changes will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activityLogs.map((log) => {
                  const resourceName = log.action === 'DELETE' 
                    ? (log.old_data?.name || 'Unknown file')
                    : (log.new_data?.name || 'Unknown file');
                  const resourceType = log.action === 'DELETE'
                    ? (log.old_data?.resource_type || 'file')
                    : (log.new_data?.resource_type || 'file');
                  
                  return (
                    <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`shrink-0 w-10 h-10 flex items-center justify-center ${getActionColor(log.action)}`}>
                          {resourceType === 'folder' ? (
                            <Folder size={16} />
                          ) : (
                            <FileText size={16} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 ${getActionColor(log.action)}`}>
                              {getActionLabel(log.action)}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-700 truncate mt-1">
                            {resourceName}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <User size={10} />
                              {log.user_email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Upload Options Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-md rounded-none">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-ui-blue/10 rounded-none">
                <Upload size={20} className="text-ui-blue" />
              </div>
              <DialogTitle className="font-serif text-xl text-ui-blue">Upload Files</DialogTitle>
            </div>
            <p className="text-sm text-slate-500">
              Choose how you'd like to upload your files to the Academic Bank.
            </p>
          </DialogHeader>
          <div className="py-4 space-y-3">
            {/* Single File Upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-4 p-4 bg-slate-50 hover:bg-ui-blue/5 border border-slate-200 hover:border-ui-blue transition-all group"
            >
              <div className="w-12 h-12 bg-ui-blue/10 flex items-center justify-center group-hover:bg-ui-blue/20 transition-colors">
                <File size={24} className="text-ui-blue" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-medium text-slate-800">Single File</h4>
                <p className="text-sm text-slate-500">Upload one file at a time</p>
              </div>
              <ChevronRight size={20} className="text-slate-400 group-hover:text-ui-blue" />
            </button>

            {/* Multiple Files Upload */}
            <button
              onClick={() => multiFileInputRef.current?.click()}
              className="w-full flex items-center gap-4 p-4 bg-slate-50 hover:bg-nobel-gold/5 border border-slate-200 hover:border-nobel-gold transition-all group"
            >
              <div className="w-12 h-12 bg-nobel-gold/10 flex items-center justify-center group-hover:bg-nobel-gold/20 transition-colors">
                <Files size={24} className="text-nobel-gold" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-medium text-slate-800">Bulk Upload</h4>
                <p className="text-sm text-slate-500">Upload up to 25 files at once</p>
              </div>
              <ChevronRight size={20} className="text-slate-400 group-hover:text-nobel-gold" />
            </button>

            {/* Folder Upload */}
            <button
              onClick={() => folderInputRef.current?.click()}
              className="w-full flex items-center gap-4 p-4 bg-slate-50 hover:bg-ui-dark/5 border border-slate-200 hover:border-ui-dark transition-all group"
            >
              <div className="w-12 h-12 bg-ui-dark/10 flex items-center justify-center group-hover:bg-ui-dark/20 transition-colors">
                <FolderUp size={24} className="text-ui-dark" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-medium text-slate-800">Folder Upload</h4>
                <p className="text-sm text-slate-500">Upload an entire folder with its structure</p>
              </div>
              <ChevronRight size={20} className="text-slate-400 group-hover:text-ui-dark" />
            </button>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center">
              You can also drag and drop files directly onto the file area
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Footer */}
      <div className="bg-ui-blue text-white py-12">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16"
          >
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-serif text-nobel-gold">{totalFiles}</div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/60 mt-2">Files</div>
            </div>
            <div className="hidden md:block w-px h-16 bg-white/20"></div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-serif text-nobel-gold">{totalFolders}</div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/60 mt-2">Folders</div>
            </div>
            <div className="hidden md:block w-px h-16 bg-white/20"></div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-serif text-nobel-gold">{totalDownloads}</div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/60 mt-2">Downloads</div>
            </div>
          </motion.div>
          <p className="text-center text-xs text-white/40 mt-8 uppercase tracking-[0.3em]">
            Academic Bank • University of Ibadan Students' Union
          </p>
        </div>
      </div>

      {/* Upload Queue */}
      {isQueueVisible && (
        <UploadQueue
          items={uploadQueue}
          onRetry={handleRetry}
          onClear={handleClearCompleted}
          onClose={() => setIsQueueVisible(false)}
        />
      )}
    </div>
  );
};

export default AcademicBankPage;
