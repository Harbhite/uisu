import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'pdf' | 'doc' | 'ppt' | 'xls';
  size?: string;
  date: string;
  owner: string;
  parentId: string | null;
}

// 13 Faculties of University of Ibadan
const UI_FACULTIES = [
  'Faculty of Agriculture',
  'Faculty of Arts',
  'Faculty of Clinical Sciences',
  'Faculty of Dentistry',
  'Faculty of Education',
  'Faculty of Law',
  'Faculty of Pharmacy',
  'Faculty of Public Health',
  'Faculty of Renewable Natural Resources',
  'Faculty of Science',
  'Faculty of Social Sciences',
  'Faculty of Technology',
  'Faculty of Veterinary Medicine'
];

// Generate seeded academic data
const generateMockData = (): FileItem[] => {
  const files: FileItem[] = [];
  
  // Root level - General Studies
  files.push({
    id: 'ges',
    name: 'General Studies (GES)',
    type: 'folder',
    date: '2024-01-10',
    owner: 'Admin',
    parentId: null
  });

  // 13 Faculty folders
  UI_FACULTIES.forEach((faculty, idx) => {
    files.push({
      id: `faculty-${idx + 1}`,
      name: faculty,
      type: 'folder',
      date: '2024-01-15',
      owner: 'Admin',
      parentId: null
    });
  });

  // Root level files
  files.push(
    { id: 'handbook', name: 'Student Handbook 2024.pdf', type: 'pdf', size: '2.4 MB', date: '2024-02-01', owner: 'Dean of Students', parentId: null },
    { id: 'calendar', name: 'Academic Calendar 2024.pdf', type: 'pdf', size: '1.1 MB', date: '2024-02-05', owner: 'Registrar', parentId: null }
  );

  // GES courses
  const gesCourses = ['GES 101 - Use of English', 'GES 102 - Philosophy', 'GES 107 - Reproductive Health', 'GES 103 - Nigerian History'];
  gesCourses.forEach((course, idx) => {
    files.push({
      id: `ges-${idx + 1}`,
      name: course,
      type: 'folder',
      date: '2023-11-10',
      owner: 'GES Unit',
      parentId: 'ges'
    });
  });

  // Add sample files to GES 101
  files.push(
    { id: 'ges101-1', name: 'Use of English Notes.pdf', type: 'pdf', size: '1.2 MB', date: '2024-01-20', owner: 'Prof. Adeyemi', parentId: 'ges-1' },
    { id: 'ges101-2', name: 'Past Questions 2023.pdf', type: 'pdf', size: '800 KB', date: '2024-01-22', owner: 'Library', parentId: 'ges-1' }
  );

  // Add departments to Faculty of Science
  const scienceDepts = ['Computer Science', 'Physics', 'Chemistry', 'Mathematics', 'Zoology', 'Botany'];
  scienceDepts.forEach((dept, idx) => {
    files.push({
      id: `sci-dept-${idx + 1}`,
      name: dept,
      type: 'folder',
      date: '2023-10-01',
      owner: 'HOD',
      parentId: 'faculty-10'
    });
  });

  // Add sample files to Computer Science
  files.push(
    { id: 'csc101-notes', name: 'CSC 101 - Introduction to Computing.pdf', type: 'pdf', size: '3.5 MB', date: '2024-01-15', owner: 'Dr. Okonkwo', parentId: 'sci-dept-1' },
    { id: 'csc201-notes', name: 'CSC 201 - Data Structures.pdf', type: 'pdf', size: '2.8 MB', date: '2024-01-18', owner: 'Dr. Ibrahim', parentId: 'sci-dept-1' },
    { id: 'csc-pq', name: 'Computer Science Past Questions.pdf', type: 'pdf', size: '5.2 MB', date: '2024-02-01', owner: 'NACOSS', parentId: 'sci-dept-1' }
  );

  // Add departments to Faculty of Arts
  const artsDepts = ['English', 'History', 'Philosophy', 'Linguistics', 'Religious Studies'];
  artsDepts.forEach((dept, idx) => {
    files.push({
      id: `arts-dept-${idx + 1}`,
      name: dept,
      type: 'folder',
      date: '2023-10-05',
      owner: 'HOD',
      parentId: 'faculty-2'
    });
  });

  // Add departments to Faculty of Social Sciences
  const socialDepts = ['Economics', 'Political Science', 'Sociology', 'Geography', 'Psychology'];
  socialDepts.forEach((dept, idx) => {
    files.push({
      id: `soc-dept-${idx + 1}`,
      name: dept,
      type: 'folder',
      date: '2023-10-08',
      owner: 'HOD',
      parentId: 'faculty-11'
    });
  });

  // Add sample files to Economics
  files.push(
    { id: 'eco101', name: 'ECO 101 - Principles of Economics.pdf', type: 'pdf', size: '2.1 MB', date: '2024-01-10', owner: 'Prof. Eze', parentId: 'soc-dept-1' },
    { id: 'eco-pq', name: 'Economics Past Questions 2020-2023.pdf', type: 'pdf', size: '4.5 MB', date: '2024-02-05', owner: 'Library', parentId: 'soc-dept-1' }
  );

  // Add departments to Faculty of Technology
  const techDepts = ['Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Petroleum Engineering'];
  techDepts.forEach((dept, idx) => {
    files.push({
      id: `tech-dept-${idx + 1}`,
      name: dept,
      type: 'folder',
      date: '2023-10-12',
      owner: 'HOD',
      parentId: 'faculty-12'
    });
  });

  return files;
};

const AcademicBankPage = () => {
  const navigate = useNavigate();
  const { isStaff } = useAdminCheck();
  const [allFiles, setAllFiles] = useState<FileItem[]>(generateMockData());
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FileItem | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentFolderId = currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;
  
  const items = allFiles.filter(item => item.parentId === currentFolderId);

  const handleNavigate = (folderId: string) => {
    setCurrentPath([...currentPath, folderId]);
  };

  const handleNavigateUp = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  const getFolderName = (id: string | null) => {
    if (id === null) return 'Academic Bank';
    const found = allFiles.find(f => f.id === id);
    return found ? found.name : id;
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Admin functions
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    
    const newFolder: FileItem = {
      id: `folder-${Date.now()}`,
      name: newFolderName.trim(),
      type: 'folder',
      date: new Date().toISOString().split('T')[0],
      owner: 'Admin',
      parentId: currentFolderId
    };
    
    setAllFiles([...allFiles, newFolder]);
    setNewFolderName('');
    setShowFolderModal(false);
    toast.success('Folder created successfully');
  };

  const handleEditFolder = () => {
    if (!editingFolder || !newFolderName.trim()) return;
    
    setAllFiles(allFiles.map(f => 
      f.id === editingFolder.id ? { ...f, name: newFolderName.trim() } : f
    ));
    setEditingFolder(null);
    setNewFolderName('');
    toast.success('Folder updated successfully');
  };

  const handleDeleteFolder = (folder: FileItem) => {
    if (!confirm(`Are you sure you want to delete "${folder.name}"?`)) return;
    
    // Delete folder and all its children recursively
    const getChildIds = (parentId: string): string[] => {
      const children = allFiles.filter(f => f.parentId === parentId);
      return [parentId, ...children.flatMap(c => c.type === 'folder' ? getChildIds(c.id) : [c.id])];
    };
    
    const idsToDelete = getChildIds(folder.id);
    setAllFiles(allFiles.filter(f => !idsToDelete.includes(f.id)));
    toast.success('Deleted successfully');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      // Upload to Supabase storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('resources')
        .upload(`academic-bank/${fileName}`, file);

      if (error) throw error;

      // Add to local state
      const newFile: FileItem = {
        id: `file-${Date.now()}`,
        name: file.name,
        type: file.name.endsWith('.pdf') ? 'pdf' : 
              file.name.endsWith('.doc') || file.name.endsWith('.docx') ? 'doc' :
              file.name.endsWith('.ppt') || file.name.endsWith('.pptx') ? 'ppt' :
              file.name.endsWith('.xls') || file.name.endsWith('.xlsx') ? 'xls' : 'pdf',
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        date: new Date().toISOString().split('T')[0],
        owner: 'Staff',
        parentId: currentFolderId
      };

      setAllFiles([...allFiles, newFile]);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      setShowUploadModal(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const breadcrumbPath = [{ id: null, name: 'Academic Bank' }, ...currentPath.map(id => ({ id, name: getFolderName(id) }))];

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
                  onClick={() => setShowFolderModal(true)}
                >
                  <FolderPlus size={16} />
                  <span className="hidden sm:inline">New Folder</span>
                </Button>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowUploadModal(true)}
                >
                  <Upload size={16} />
                  <span className="hidden sm:inline">Upload</span>
                </Button>
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
                    onClick={() => setShowFolderModal(true)}
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
                      onClick={() => item.type === 'folder' ? handleNavigate(item.id) : null}
                    >
                      <div className={`${viewMode === 'grid' ? 'mb-3' : ''} text-slate-500`}>
                        {item.type === 'folder' ? (
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
                            <span>{item.date}</span>
                            <span>{item.owner}</span>
                            {item.size && <span>{item.size}</span>}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={`flex items-center gap-1 ${viewMode === 'grid' ? 'absolute top-2 right-2' : ''} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      {item.type !== 'folder' && (
                        <Button size="icon" variant="ghost" className="h-7 w-7">
                          <Download size={14} />
                        </Button>
                      )}
                      {isStaff && item.type === 'folder' && (
                        <>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingFolder(item);
                              setNewFolderName(item.name);
                            }}
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7 text-red-500 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFolder(item);
                            }}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Folder Modal */}
      <Dialog open={showFolderModal} onOpenChange={setShowFolderModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFolderModal(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Modal */}
      <Dialog open={!!editingFolder} onOpenChange={() => setEditingFolder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEditFolder()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFolder(null)}>Cancel</Button>
            <Button onClick={handleEditFolder}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                onChange={handleFileUpload}
              />
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  <p className="text-sm text-slate-500">Uploading...</p>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                  <p className="text-sm text-slate-600 mb-2">
                    Click to select a file or drag and drop
                  </p>
                  <p className="text-xs text-slate-400">
                    PDF, DOC, PPT, XLS supported
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select File
                  </Button>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AcademicBankPage;
