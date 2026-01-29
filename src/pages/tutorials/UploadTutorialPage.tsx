import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCreateTutorial, useTutors } from '@/hooks/useTutorials';
import { fileStorage } from '@/lib/local-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, ArrowLeft, Plus, Trash2, GripVertical, FileVideo, FileAudio, FileText, ChevronDown, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import { motion, AnimatePresence } from 'framer-motion';

interface ModuleData {
  id: string; // temp id for UI
  title: string;
  type: 'Video' | 'Audio' | 'Text' | 'Essay';
  content: string; // URL or File ID
  file?: File; // Temporary file holder
  duration: string;
}

interface SectionData {
  id: string;
  title: string;
  modules: ModuleData[];
}

const UploadTutorialPage = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [tutorId, setTutorId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState<'Video' | 'Audio' | 'Text' | 'Essay'>('Video');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState('');

  // Curriculum State
  const [sections, setSections] = useState<SectionData[]>([
    { id: 'sec-1', title: 'Introduction', modules: [] }
  ]);

  const { data: tutors } = useTutors();
  const createMutation = useCreateTutorial();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (userId && tutors) {
      const myTutorProfile = tutors.find(t => t.user_id === userId);
      if (myTutorProfile) {
        setTutorId(myTutorProfile.id);
      }
    }
  }, [userId, tutors]);

  // Section Management
  const addSection = () => {
    const newId = `sec-${Date.now()}`;
    setSections([...sections, { id: newId, title: 'New Section', modules: [] }]);
    setActiveSection(newId);
  };

  const updateSectionTitle = (id: string, newTitle: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, title: newTitle } : s));
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  // Module Management
  const addModuleToSection = (sectionId: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          modules: [...s.modules, {
            id: `mod-${Date.now()}`,
            title: '',
            type: format,
            content: '',
            duration: ''
          }]
        };
      }
      return s;
    }));
    setActiveSection(sectionId); // Ensure section is open
  };

  const updateModule = (sectionId: string, moduleId: string, field: keyof ModuleData, value: string | File | undefined) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          modules: s.modules.map(m => m.id === moduleId ? { ...m, [field]: value } : m)
        };
      }
      return s;
    }));
  };

  const removeModule = (sectionId: string, moduleId: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return { ...s, modules: s.modules.filter(m => m.id !== moduleId) };
      }
      return s;
    }));
  };

  // File Handling
  const handleFileSelect = async (sectionId: string, moduleId: string, file: File) => {
    // Just update state, actual upload happens on submit
    updateModule(sectionId, moduleId, 'file', file);
    updateModule(sectionId, moduleId, 'content', file.name); // Preview name

    // Auto-detect duration/size metadata could go here
    if (file.type.startsWith('video')) {
       // Mock duration
       updateModule(sectionId, moduleId, 'duration', 'Unknown');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorId) {
      toast.error("You must be a registered tutor to upload.");
      return;
    }

    // Validate
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (sections.length === 0 || sections.every(s => s.modules.length === 0)) {
        toast.error("Please add at least one module content.");
        return;
    }

    setIsSubmitting(true);
    toast.info("Uploading content...");

    try {
      // 1. Process files first (Save to IndexedDB)
      const processedModules = [];
      let globalSortOrder = 0;

      for (const section of sections) {
        for (const module of section.modules) {
          let contentUrl = module.content;

          if (module.file) {
            // Save file to IndexedDB
            try {
                const fileId = await fileStorage.saveFile(module.file);
                contentUrl = fileId; // Store the ID, player will resolve it
            } catch (err) {
                console.error("File save error", err);
                toast.error(`Failed to save file for ${module.title}`);
                setIsSubmitting(false);
                return;
            }
          }

          globalSortOrder++;
          processedModules.push({
            title: module.title,
            type: module.type,
            content: contentUrl,
            duration: module.duration || '5 mins',
            section_title: section.title,
            sort_order: globalSortOrder
          });
        }
      }

      // 2. Create Tutorial Record
      await createMutation.mutateAsync({
        tutorial: {
          title,
          description,
          tutor_id: tutorId,
          format,
          level,
          cover_image: coverImage || undefined,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          is_published: false,
          is_approved: false
        },
        modules: processedModules
      });

      toast.success("Tutorial created successfully!");
      navigate('/tutorials/dashboard');
    } catch (error) {
      console.error(error);
      toast.error("Failed to create tutorial.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <p className="text-slate-500">Please sign in to upload tutorials.</p>
        <Button asChild><Link to="/auth">Sign In</Link></Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24">
      <SEO
        title="Curriculum Builder | UISU SPACE"
        description="Build your course curriculum."
        url="/tutorials/upload"
      />
      <div className="flex items-center justify-between">
        <Link to="/tutorials/dashboard" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-ui-blue transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </Link>
        <div className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          Curriculum Builder
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Curriculum */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white border border-slate-200 shadow-sm p-6">
              <h2 className="text-xl font-serif font-bold text-ui-blue mb-2">Course Curriculum</h2>
              <p className="text-sm text-slate-500 mb-6">Organize your course into sections and lessons (modules).</p>

              <div className="space-y-4">
                {sections.map((section, sIdx) => (
                  <div key={section.id} className="border border-slate-200 bg-slate-50/50 rounded-lg overflow-hidden">
                    {/* Section Header */}
                    <div className="flex items-center gap-3 p-4 bg-slate-100/50 border-b border-slate-200">
                        <button onClick={() => setActiveSection(activeSection === section.id ? null : section.id)} className="text-slate-400 hover:text-ui-blue">
                            {activeSection === section.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                        <div className="flex-1">
                            <input
                                value={section.title}
                                onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                                className="bg-transparent border-none focus:outline-none font-bold text-slate-700 w-full placeholder:text-slate-400"
                                placeholder={`Section ${sIdx + 1} Title`}
                            />
                        </div>
                        <button onClick={() => removeSection(section.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>

                    {/* Modules List */}
                    <AnimatePresence>
                        {activeSection === section.id && (
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-4 space-y-3">
                                    {section.modules.map((module, mIdx) => (
                                        <div key={module.id} className="bg-white border border-slate-200 p-4 rounded flex flex-col gap-3 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <GripVertical size={16} className="text-slate-300 cursor-move" />
                                                <div className="p-2 bg-purple-50 rounded text-purple-600">
                                                    {module.type === 'Video' ? <FileVideo size={16} /> : module.type === 'Audio' ? <FileAudio size={16} /> : <FileText size={16} />}
                                                </div>
                                                <input
                                                    value={module.title}
                                                    onChange={(e) => updateModule(section.id, module.id, 'title', e.target.value)}
                                                    className="flex-1 bg-transparent border-b border-transparent focus:border-purple-200 focus:outline-none text-sm font-medium"
                                                    placeholder="Lesson Title"
                                                />
                                                <button onClick={() => removeModule(section.id, module.id)} className="text-slate-300 hover:text-red-400"><X size={16} /></button>
                                            </div>

                                            {/* File Upload Area */}
                                            {['Video', 'Audio', 'PDF'].includes(module.type === 'Text' ? 'PDF' : module.type) ? (
                                                <div className="ml-10">
                                                    {!module.file && !module.content ? (
                                                        <div className="border-2 border-dashed border-slate-200 rounded p-4 text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
                                                            <input
                                                                type="file"
                                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                                accept={module.type === 'Video' ? "video/*" : module.type === 'Audio' ? "audio/*" : ".pdf"}
                                                                onChange={(e) => e.target.files?.[0] && handleFileSelect(section.id, module.id, e.target.files[0])}
                                                            />
                                                            <p className="text-xs text-slate-500 font-medium">Click to upload {module.type} file</p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-700 px-3 py-2 rounded border border-emerald-100">
                                                            <span className="font-bold">Ready to upload:</span> {module.file?.name || module.content}
                                                            <button
                                                                onClick={() => {
                                                                    updateModule(section.id, module.id, 'file', undefined);
                                                                    updateModule(section.id, module.id, 'content', '');
                                                                }}
                                                                className="ml-auto text-emerald-500 hover:text-emerald-800"
                                                            >
                                                                Change
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="ml-10">
                                                    <Textarea
                                                        placeholder="Enter lesson content here..."
                                                        value={module.content}
                                                        onChange={(e) => updateModule(section.id, module.id, 'content', e.target.value)}
                                                        className="text-sm min-h-[100px]"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <Button
                                        onClick={() => addModuleToSection(section.id)}
                                        variant="outline"
                                        size="sm"
                                        className="w-full border-dashed border-slate-300 text-slate-500 hover:text-ui-blue hover:border-ui-blue"
                                    >
                                        <Plus size={14} className="mr-2" /> Add Lesson
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Button onClick={addSection} className="bg-slate-800 text-white rounded-none w-full py-6">
                    <Plus size={16} className="mr-2" /> Add New Section
                </Button>
              </div>
           </div>
        </div>

        {/* Sidebar - Meta Info */}
        <div className="space-y-6">
            <div className="bg-white border border-slate-200 shadow-sm p-6 sticky top-24">
                <h3 className="font-bold uppercase tracking-widest text-xs text-slate-500 mb-4">Course Details</h3>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <Label className="text-xs">Course Title</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-slate-50" />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="bg-slate-50 resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Format</Label>
                            <Select value={format} onValueChange={(v: 'Video' | 'Audio' | 'Text' | 'Essay') => setFormat(v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Video">Video</SelectItem>
                                    <SelectItem value="Audio">Audio</SelectItem>
                                    <SelectItem value="Text">Text</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Level</Label>
                            <Select value={level} onValueChange={(v: 'Beginner' | 'Intermediate' | 'Advanced') => setLevel(v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                    <SelectItem value="Intermediate">Intermed.</SelectItem>
                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Cover Image URL</Label>
                        <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className="bg-slate-50" placeholder="https://..." />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Tags (comma separated)</Label>
                        <Input value={tags} onChange={(e) => setTags(e.target.value)} className="bg-slate-50" />
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-ui-blue hover:bg-ui-dark text-white rounded-none py-6 uppercase tracking-widest font-bold text-xs">
                            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2" size={16} />}
                            Publish Course
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UploadTutorialPage;
