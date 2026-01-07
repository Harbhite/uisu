import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Search, Folder, FileText, Download, Plus,
  Grid, List, ChevronRight, Edit2, Trash2, Upload, X, FolderPlus, Loader2
} from 'lucide-react';
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
}

const AcademicBankPage = () => {
  const navigate = useNavigate();
  const { isStaff } = useAdminCheck();
  const [resources, setResources] = useState<AcademicResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<AcademicResource | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [savingFolder, setSavingFolder] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentFolderId = currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;

  // Fetch all resources
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('academic_resources')
        .select('*')
        .order('resource_type', { ascending: false }) // folders first
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

  const items = resources.filter(item => item.parent_id === currentFolderId);

  const handleNavigate = (folderId: string) => {
    setCurrentPath([...currentPath, folderId]);
  };

  const handleNavigateUp = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  const getFolderName = (id: string | null) => {
    if (id === null) return 'Academic Bank';
    const found = resources.find(f => f.id === id);
    return found ? found.name : id;
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      // For files, also delete from storage
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

      // Remove from local state (cascade will handle children in DB)
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
      // Upload to Supabase storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resources')
        .upload(`academic-bank/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('resources')
        .getPublicUrl(`academic-bank/${fileName}`);

      // Determine file type
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      let resourceType = 'pdf';
      if (['doc', 'docx'].includes(ext)) resourceType = 'doc';
      else if (['ppt', 'pptx'].includes(ext)) resourceType = 'ppt';
      else if (['xls', 'xlsx'].includes(ext)) resourceType = 'xls';

      // Insert into database
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

  const handleDownload = (resource: AcademicResource) => {
    if (resource.file_url) {
      window.open(resource.file_url, '_blank');
    }
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
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 md:w-80 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search files..."
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1">
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

            {/* Admin actions */}
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
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  <span className="hidden sm:inline">Upload</span>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                />
              </div>
            )}
          </div>

          {/* File Grid/List */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredItems.length === 0 ? (
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
                {filteredItems.map((item) => (
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
                      onClick={() => item.resource_type === 'folder' ? handleNavigate(item.id) : handleDownload(item)}
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
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={`flex items-center gap-1 ${viewMode === 'grid' ? 'absolute top-2 right-2' : ''} opacity-0 group-hover:opacity-100 transition-opacity`}>
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
    </div>
  );
};

export default AcademicBankPage;
