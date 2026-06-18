import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FilterCriteria, FACULTIES, ACADEMIC_LEVELS, SEMESTERS } from '@/types/academicbank';

interface AdvancedFilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterCriteria) => void;
  currentFilters: FilterCriteria;
  isLoading?: boolean;
}

export const AdvancedFilterSidebar: React.FC<AdvancedFilterSidebarProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
  isLoading = false
}) => {
  const [filters, setFilters] = useState<FilterCriteria>(currentFilters);
  const [expandedSections, setExpandedSections] = useState({
    faculty: true,
    level: true,
    semester: true,
    course: false
  });

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFacultyChange = (faculty: string) => {
    setFilters(prev => ({
      ...prev,
      faculty: prev.faculty === faculty ? undefined : faculty
    }));
  };

  const handleLevelChange = (level: string) => {
    setFilters(prev => ({
      ...prev,
      level: prev.level === level ? undefined : (level as any)
    }));
  };

  const handleSemesterChange = (semester: string) => {
    setFilters(prev => ({
      ...prev,
      semester: prev.semester === semester ? undefined : (semester as any)
    }));
  };

  const handleCourseCodeChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      courseCode: value || undefined
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
  };

  const handleReset = () => {
    const emptyFilters: FilterCriteria = {
      sortBy: 'name',
      sortOrder: 'asc'
    };
    setFilters(emptyFilters);
    onApplyFilters(emptyFilters);
  };

  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'name' && v !== 'asc').length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto md:relative md:w-72 md:shadow-none md:translate-x-0"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter size={20} className="text-ui-blue" />
                  <h2 className="text-lg font-semibold">Filters</h2>
                  {activeFilterCount > 0 && (
                    <span className="ml-2 px-2 py-1 bg-ui-blue text-white text-xs rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <button onClick={onClose} className="md:hidden p-1 hover:bg-slate-100 rounded">
                  <X size={20} />
                </button>
              </div>

              {/* Faculty Filter */}
              <div className="space-y-3">
                <button
                  onClick={() => toggleSection('faculty')}
                  className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors"
                >
                  <span className="font-medium text-sm">Faculty</span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${expandedSections.faculty ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {expandedSections.faculty && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {FACULTIES.map(faculty => (
                        <label key={faculty} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded">
                          <Checkbox
                            checked={filters.faculty === faculty}
                            onCheckedChange={() => handleFacultyChange(faculty)}
                          />
                          <span className="text-sm text-slate-700">{faculty}</span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Level Filter */}
              <div className="space-y-3">
                <button
                  onClick={() => toggleSection('level')}
                  className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors"
                >
                  <span className="font-medium text-sm">Academic Level</span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${expandedSections.level ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {expandedSections.level && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {ACADEMIC_LEVELS.map(level => (
                        <label key={level} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded">
                          <Checkbox
                            checked={filters.level === level}
                            onCheckedChange={() => handleLevelChange(level)}
                          />
                          <span className="text-sm text-slate-700">{level}</span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Semester Filter */}
              <div className="space-y-3">
                <button
                  onClick={() => toggleSection('semester')}
                  className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors"
                >
                  <span className="font-medium text-sm">Semester</span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${expandedSections.semester ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {expandedSections.semester && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {SEMESTERS.map(semester => (
                        <label key={semester} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded">
                          <Checkbox
                            checked={filters.semester === semester}
                            onCheckedChange={() => handleSemesterChange(semester)}
                          />
                          <span className="text-sm text-slate-700">{semester} Semester</span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Course Code Filter */}
              <div className="space-y-3">
                <button
                  onClick={() => toggleSection('course')}
                  className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors"
                >
                  <span className="font-medium text-sm">Course Code</span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${expandedSections.course ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {expandedSections.course && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <Input
                        placeholder="e.g., MAT111, PHY101"
                        value={filters.courseCode || ''}
                        onChange={(e) => handleCourseCodeChange(e.target.value)}
                        className="text-sm"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-slate-200">
                <Button
                  onClick={handleApply}
                  className="flex-1 bg-ui-blue hover:bg-ui-blue/90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Applying...' : 'Apply Filters'}
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1"
                  disabled={isLoading}
                >
                  <RotateCcw size={16} className="mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
