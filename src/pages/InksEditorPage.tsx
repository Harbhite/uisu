/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Save, Image as ImageIcon, Tag, User,
  Calendar, FileText, ChevronDown, Eye, Loader2,
  Bold, Italic, List, ListOrdered, Quote, Heading, Link as LinkIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Button } from "@/components/ui/button";
import { inksPieces, InksPiece } from "@/lib/data"; // Import mock data for types/fallback

// Define the 8 types
const CONTENT_TYPES = [
  "Article", "Blog", "Report", "Essay",
  "Poetry", "Opinion", "Interview", "Fiction"
];

const InksEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isStaff, loading: authLoading } = useAdminCheck();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<InksPiece>>({
    title: "",
    type: "Article",
    author: "",
    role: "",
    date: new Date().toISOString().split('T')[0],
    summary: "",
    content: "",
    tags: [],
    coverImage: "",
  });

  const [tagInput, setTagInput] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  // Load data
  useEffect(() => {
    if (!authLoading && (!user || !isStaff)) {
        navigate("/");
        return;
    }

    const loadData = async () => {
        if (!id) {
            setLoading(false);
            // Set author name from profile if creating new
            if (user) {
                const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
                if (data?.full_name) {
                    setFormData(prev => ({ ...prev, author: data.full_name }));
                }
            }
            return;
        }

        try {
            // Try fetching from Supabase first
            const { data, error } = await supabase
                .from('inks_pieces' as any) // Cast as any since table might not exist in types yet
                .select('*')
                .eq('id', id)
                .maybeSingle();

            if (data) {
                setFormData(data);
            } else {
                // Fallback to local data if not found in DB (for demo purposes)
                const localPiece = inksPieces.find(p => p.id === id);
                if (localPiece) {
                    setFormData(localPiece);
                } else {
                    toast({
                        title: "Error",
                        description: "Piece not found",
                        variant: "destructive"
                    });
                    navigate("/admin");
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!authLoading) {
        loadData();
    }
  }, [id, authLoading, user, isStaff, navigate, toast]);

  const handleSave = async () => {
      if (!formData.title || !formData.content || !formData.author) {
          toast({
              title: "Missing Fields",
              description: "Please fill in at least Title, Author, and Content.",
              variant: "destructive"
          });
          return;
      }

      setSaving(true);
      try {
          const payload = {
              ...formData,
              updated_at: new Date().toISOString(),
              // Ensure date is set
              date: formData.date || new Date().toISOString().split('T')[0]
          };

          if (id) {
              // Update
              const { error } = await supabase
                  .from('inks_pieces' as any)
                  .update(payload)
                  .eq('id', id);

              if (error) throw error; // Will fail if table doesn't exist, caught below
          } else {
              // Create
              const { error } = await supabase
                  .from('inks_pieces' as any)
                  .insert([payload]);

              if (error) throw error;
          }

          toast({
              title: "Success",
              description: "Piece saved successfully.",
          });
          navigate("/admin");
      } catch (error: any) {
          console.error("Save error:", error);
          toast({
              title: "Save Failed",
              description: "Could not save to database. (Table 'inks_pieces' might be missing). Logging data to console.",
              variant: "destructive"
          });
          console.log("Form Data to Save:", formData);
      } finally {
          setSaving(false);
      }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `inks-covers/${fileName}`;

          const { error: uploadError } = await supabase.storage
              .from('public-images') // Assuming a public bucket exists
              .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
              .from('public-images')
              .getPublicUrl(filePath);

          setFormData({ ...formData, coverImage: data.publicUrl });
      } catch (error: any) {
          toast({
              title: "Upload Failed",
              description: error.message,
              variant: "destructive"
          });
      } finally {
          setUploading(false);
      }
  };

  const insertFormat = (tag: string, endTag?: string) => {
      const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const selection = text.substring(start, end);
      const after = text.substring(end);

      const replacement = endTag
          ? `${tag}${selection}${endTag}`
          : `${tag}${selection}`;

      const newText = before + replacement + after;
      setFormData({ ...formData, content: newText });

      // Restore focus/cursor (timeout needed for React re-render)
      setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + tag.length, end + tag.length);
      }, 0);
  };

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <Loader2 className="w-8 h-8 animate-spin text-nobel-gold" />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-nobel-gold/30">
        {/* Top Navigation Bar */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate("/admin")}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="h-6 w-px bg-slate-200"></div>
                <h1 className="text-lg font-serif font-bold text-slate-800">
                    {id ? "Edit Piece" : "New Piece"}
                </h1>
                <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded uppercase tracking-wider">
                    {formData.type}
                </span>
            </div>

            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="gap-2 text-slate-600"
                >
                    <Eye size={16} />
                    {previewMode ? "Edit" : "Preview"}
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-ui-blue hover:bg-nobel-gold text-white gap-2 transition-all min-w-[120px]"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Piece
                </Button>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="pt-24 pb-20 container mx-auto px-6 max-w-5xl">
            {previewMode ? (
                <div className="bg-white p-12 rounded-lg shadow-sm border border-slate-200 min-h-[80vh] prose prose-slate max-w-none prose-headings:font-serif">
                    <h1 className="text-4xl md:text-5xl font-serif text-slate-900 mb-4">{formData.title}</h1>
                    <div className="flex items-center gap-4 text-slate-500 text-sm mb-8 not-prose border-b border-slate-100 pb-8">
                        <span className="font-bold text-nobel-gold uppercase tracking-widest text-xs">{formData.type}</span>
                        <span>•</span>
                        <span>{formData.author}</span>
                        <span>•</span>
                        <span>{formData.date}</span>
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: formData.content || "" }} />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Editor */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title Input */}
                        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
                            <input
                                type="text"
                                placeholder="Enter Title Here..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full text-4xl md:text-5xl font-serif font-bold text-slate-900 placeholder:text-slate-300 border-none focus:ring-0 p-0 bg-transparent"
                            />
                            <div className="mt-6 flex items-center gap-4">
                                <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full text-sm">
                                    <User size={14} />
                                    <input
                                        type="text"
                                        placeholder="Author Name"
                                        value={formData.author}
                                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                        className="bg-transparent border-none focus:ring-0 p-0 text-slate-700 w-32 placeholder:text-slate-400"
                                    />
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full text-sm">
                                    <Tag size={14} />
                                    <input
                                        type="text"
                                        placeholder="Role (e.g. Editor)"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="bg-transparent border-none focus:ring-0 p-0 text-slate-700 w-32 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Content Editor */}
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col min-h-[600px]">
                            {/* Toolbar */}
                            <div className="border-b border-slate-200 p-2 flex items-center gap-1 bg-slate-50 rounded-t-lg sticky top-16 z-10">
                                <ToolbarButton onClick={() => insertFormat('<b>', '</b>')} icon={<Bold size={16}/>} label="Bold" />
                                <ToolbarButton onClick={() => insertFormat('<i>', '</i>')} icon={<Italic size={16}/>} label="Italic" />
                                <div className="w-px h-6 bg-slate-300 mx-2"></div>
                                <ToolbarButton onClick={() => insertFormat('<h2>', '</h2>')} icon={<Heading size={16}/>} label="Heading" />
                                <ToolbarButton onClick={() => insertFormat('<blockquote>', '</blockquote>')} icon={<Quote size={16}/>} label="Quote" />
                                <div className="w-px h-6 bg-slate-300 mx-2"></div>
                                <ToolbarButton onClick={() => insertFormat('<ul>\n  <li>', '</li>\n</ul>')} icon={<List size={16}/>} label="Bullet List" />
                                <ToolbarButton onClick={() => insertFormat('<ol>\n  <li>', '</li>\n</ol>')} icon={<ListOrdered size={16}/>} label="Numbered List" />
                                <div className="w-px h-6 bg-slate-300 mx-2"></div>
                                <ToolbarButton onClick={() => insertFormat('<a href="">', '</a>')} icon={<LinkIcon size={16}/>} label="Link" />
                            </div>

                            <textarea
                                id="content-editor"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Start writing your story..."
                                className="flex-grow p-8 w-full resize-none border-none focus:ring-0 font-serif text-lg leading-relaxed text-slate-800 placeholder:text-slate-300"
                            />
                        </div>
                    </div>

                    {/* Right Column: Metadata */}
                    <div className="space-y-6">
                        {/* Publishing Options */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <FileText size={14} /> Publishing Details
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Content Type</label>
                                    <div className="relative">
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value as InksPiece['type'] })}
                                            className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-nobel-gold focus:ring-1 focus:ring-nobel-gold"
                                        >
                                            {CONTENT_TYPES.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Publish Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-nobel-gold focus:ring-1 focus:ring-nobel-gold"
                                        />
                                        <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Summary / Excerpt</h3>
                            <textarea
                                value={formData.summary}
                                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                rows={4}
                                placeholder="Brief description of the piece..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-nobel-gold focus:ring-1 focus:ring-nobel-gold resize-none"
                            />
                        </div>

                        {/* Tags */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Tags</h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.tags?.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-ui-blue/10 text-ui-blue text-xs rounded-full flex items-center gap-1">
                                        {tag}
                                        <button
                                            onClick={() => setFormData({ ...formData, tags: formData.tags?.filter(t => t !== tag) })}
                                            className="hover:text-red-500"
                                        >
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && tagInput.trim()) {
                                        e.preventDefault();
                                        if (!formData.tags?.includes(tagInput.trim())) {
                                            setFormData({ ...formData, tags: [...(formData.tags || []), tagInput.trim()] });
                                        }
                                        setTagInput("");
                                    }
                                }}
                                placeholder="Add tag and press Enter"
                                className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-nobel-gold focus:ring-1 focus:ring-nobel-gold"
                            />
                        </div>

                         {/* Cover Image */}
                         <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <ImageIcon size={14} /> Cover Image
                            </h3>
                            <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-nobel-gold transition-colors relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                {uploading ? (
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-nobel-gold" />
                                ) : formData.coverImage ? (
                                    <div className="relative group">
                                        <img src={formData.coverImage} alt="Cover" className="w-full h-32 object-cover rounded" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition-opacity rounded">
                                            Click to replace
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-slate-400">
                                        <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-xs">Upload Cover</p>
                                    </div>
                                )}
                            </div>
                            {formData.coverImage && (
                                <button
                                    onClick={() => setFormData({...formData, coverImage: ""})}
                                    className="text-xs text-red-500 mt-2 hover:underline w-full text-center"
                                >
                                    Remove Image
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

const ToolbarButton = ({ onClick, icon, label }: { onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button
        onClick={onClick}
        title={label}
        className="p-2 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
    >
        {icon}
    </button>
);

export default InksEditorPage;
