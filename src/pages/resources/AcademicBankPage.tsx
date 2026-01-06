import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, Folder, FileText, Download,
  MoreVertical, Grid, List, ChevronRight, Clock, Star
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'pdf' | 'doc' | 'ppt' | 'xls';
  size?: string;
  date: string;
  owner: string;
}

const mockFiles: Record<string, FileItem[]> = {
  root: [
    { id: 'f1', name: 'General Studies (GES)', type: 'folder', date: '2024-01-10', owner: 'Admin' },
    { id: 'f2', name: 'Faculty of Science', type: 'folder', date: '2024-01-12', owner: 'Admin' },
    { id: 'f3', name: 'Faculty of Arts', type: 'folder', date: '2024-01-15', owner: 'Admin' },
    { id: 'f4', name: 'Faculty of Tech', type: 'folder', date: '2024-01-20', owner: 'Admin' },
    { id: 'd1', name: 'Student Handbook 2024.pdf', type: 'pdf', size: '2.4 MB', date: '2024-02-01', owner: 'Dean of Students' },
    { id: 'd2', name: 'Academic Calendar.pdf', type: 'pdf', size: '1.1 MB', date: '2024-02-05', owner: 'Registrar' }
  ],
  f1: [
    { id: 'f1-1', name: 'GES 101 - Use of English', type: 'folder', date: '2023-11-10', owner: 'GES Unit' },
    { id: 'f1-2', name: 'GES 107 - Reproductive Health', type: 'folder', date: '2023-11-12', owner: 'GES Unit' }
  ],
  f2: [
    { id: 'f2-1', name: 'Computer Science', type: 'folder', date: '2023-10-01', owner: 'HOD' },
    { id: 'f2-2', name: 'Physics', type: 'folder', date: '2023-10-05', owner: 'HOD' }
  ]
};

const AcademicBankPage = () => {
  const navigate = useNavigate();
  const [currentPath, setCurrentPath] = useState<string[]>(['root']);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const currentFolderId = currentPath[currentPath.length - 1];
  const items = mockFiles[currentFolderId] || [];

  const handleNavigate = (folderId: string) => {
    setCurrentPath([...currentPath, folderId]);
  };

  const handleNavigateUp = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  const getFolderName = (id: string) => {
    if (id === 'root') return 'Academic Bank';
    // Simplified lookup - in real app would search recursively or use a map
    for (const key in mockFiles) {
      const found = mockFiles[key].find(f => f.id === id);
      if (found) return found.name;
    }
    return id;
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <SEO
        title="Academic Bank - Resources"
        description="Access lecture notes, past questions, and academic materials."
      />

      <div className="container mx-auto px-6 h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/resources')}>
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-2xl font-serif text-slate-800">Academic Bank</h1>
          </div>

          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2 w-full max-w-md shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search in Drive..."
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

        {/* Main Content Area */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          {/* Toolbar / Breadcrumbs */}
          <div className="border-b border-slate-100 p-4 flex items-center text-sm text-slate-600 bg-slate-50/50">
            {currentPath.map((folderId, index) => (
              <React.Fragment key={folderId}>
                {index > 0 && <ChevronRight size={16} className="mx-1 text-slate-400" />}
                <button
                  onClick={() => handleNavigateUp(index)}
                  className={`hover:bg-slate-200 px-2 py-1 rounded transition-colors ${index === currentPath.length - 1 ? 'font-semibold text-slate-900' : ''}`}
                >
                  {getFolderName(folderId)}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* File Grid/List */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Folder size={64} className="mb-4 opacity-20" />
                <p>This folder is empty</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4' : 'space-y-2'}>
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => item.type === 'folder' ? handleNavigate(item.id) : null}
                    className={`
                      group cursor-pointer border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all
                      ${viewMode === 'grid' ? 'p-4 flex flex-col aspect-[4/3]' : 'p-3 flex items-center gap-4'}
                    `}
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

                    {item.type !== 'folder' && viewMode === 'list' && (
                      <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100">
                        <Download size={16} />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicBankPage;
