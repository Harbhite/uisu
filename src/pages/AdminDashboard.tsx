import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { 
  ArrowLeft, Star, Plus, Trash2, Edit2, Calendar, FileText, 
  Megaphone, X, Upload, Loader2, Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Validation schemas
const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  event_date: z.string().min(1, "Date is required"),
  event_time: z.string().optional(),
  location: z.string().max(200).optional(),
  event_type: z.enum(["upcoming", "anniversary", "election", "meeting"]),
});

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required").max(2000),
  priority: z.enum(["low", "normal", "high", "urgent"]),
});

const documentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  year: z.number().min(1900).max(2100),
  doc_type: z.enum(["Constitution", "Bill", "Manifesto", "Speech", "Report", "Memo"]),
});

type TabType = "events" | "announcements" | "documents";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  event_type: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

interface Document {
  id: string;
  title: string;
  description: string | null;
  year: number;
  doc_type: string;
  file_url: string | null;
  file_size: string | null;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("events");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data states
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Form states
  const [formData, setFormData] = useState<any>({});
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "events") {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("event_date", { ascending: true });
        if (error) throw error;
        setEvents(data || []);
      } else if (activeTab === "announcements") {
        const { data, error } = await supabase
          .from("announcements")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setAnnouncements(data || []);
      } else if (activeTab === "documents") {
        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .order("year", { ascending: false });
        if (error) throw error;
        setDocuments(data || []);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData(getDefaultFormData());
    setSelectedFile(null);
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setSelectedFile(null);
    setShowModal(true);
  };

  const getDefaultFormData = () => {
    if (activeTab === "events") {
      return {
        title: "",
        description: "",
        event_date: "",
        event_time: "",
        location: "",
        event_type: "upcoming",
      };
    } else if (activeTab === "announcements") {
      return {
        title: "",
        content: "",
        priority: "normal",
        is_active: true,
      };
    } else {
      return {
        title: "",
        description: "",
        year: new Date().getFullYear(),
        doc_type: "Report",
      };
    }
  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    setUploadingFile(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("documents")
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let validatedData: any;
      
      if (activeTab === "events") {
        validatedData = eventSchema.parse(formData);
        validatedData.created_by = user?.id;
        
        if (editingItem) {
          const { error } = await supabase
            .from("events")
            .update(validatedData)
            .eq("id", editingItem.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("events")
            .insert(validatedData);
          if (error) throw error;
        }
      } else if (activeTab === "announcements") {
        validatedData = announcementSchema.parse(formData);
        validatedData.created_by = user?.id;
        validatedData.is_active = formData.is_active ?? true;
        
        if (editingItem) {
          const { error } = await supabase
            .from("announcements")
            .update(validatedData)
            .eq("id", editingItem.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("announcements")
            .insert(validatedData);
          if (error) throw error;
        }
      } else if (activeTab === "documents") {
        validatedData = documentSchema.parse({
          ...formData,
          year: parseInt(formData.year),
        });
        validatedData.uploaded_by = user?.id;
        
        // Handle file upload
        if (selectedFile) {
          const fileUrl = await handleFileUpload(selectedFile);
          if (fileUrl) {
            validatedData.file_url = fileUrl;
            validatedData.file_size = formatFileSize(selectedFile.size);
          }
        }
        
        if (editingItem) {
          const { error } = await supabase
            .from("documents")
            .update(validatedData)
            .eq("id", editingItem.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("documents")
            .insert(validatedData);
          if (error) throw error;
        }
      }
      
      toast({
        title: "Success",
        description: `${activeTab.slice(0, -1)} ${editingItem ? "updated" : "created"} successfully.`,
      });
      
      setShowModal(false);
      fetchData();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
      const { error } = await supabase
        .from(activeTab)
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Deleted",
        description: `${activeTab.slice(0, -1)} deleted successfully.`,
      });
      
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const tabs = [
    { id: "events" as TabType, label: "Events", icon: Calendar },
    { id: "announcements" as TabType, label: "Announcements", icon: Megaphone },
    { id: "documents" as TabType, label: "Documents", icon: FileText },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-nobel-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-16">
      <div className="container mx-auto px-6">
        {/* Back Navigation */}
        <button 
          onClick={() => navigate("/")}
          className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors mb-12"
        >
          <div className="p-2 rounded-full border border-border group-hover:border-nobel-gold transition-colors">
            <ArrowLeft size={14} />
          </div>
          <span>Back to Home</span>
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Star className="text-nobel-gold w-6 h-6" fill="currentColor" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">Management</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif text-ui-blue leading-[0.9]">
              Admin <br/> <span className="italic text-muted-foreground">Dashboard</span>
            </h1>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-3 bg-ui-blue text-white rounded-full shadow-lg hover:bg-nobel-gold hover:text-foreground transition-all text-xs font-bold uppercase tracking-widest"
          >
            <Plus size={14} /> Add {activeTab.slice(0, -1)}
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-full transition-all relative ${
                activeTab === tab.id 
                  ? "text-white" 
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {activeTab === tab.id && (
                <motion.span 
                  layoutId="activeAdminTab"
                  className="absolute inset-0 bg-ui-blue rounded-full -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-nobel-gold" />
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === "events" && events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border p-6 flex justify-between items-center hover:border-nobel-gold transition-colors"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-ui-blue/10 text-ui-blue rounded-full">
                      {event.event_type}
                    </span>
                    <span className="text-xs text-muted-foreground">{event.event_date}</span>
                  </div>
                  <h3 className="font-serif text-xl text-foreground">{event.title}</h3>
                  {event.location && (
                    <p className="text-sm text-muted-foreground mt-1">{event.location}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(event)}
                    className="p-2 text-muted-foreground hover:text-nobel-gold transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}

            {activeTab === "announcements" && announcements.map((announcement) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border p-6 flex justify-between items-start hover:border-nobel-gold transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                      announcement.priority === 'urgent' ? 'bg-destructive/10 text-destructive' :
                      announcement.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {announcement.priority}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${announcement.is_active ? 'bg-green-500' : 'bg-muted'}`} />
                  </div>
                  <h3 className="font-serif text-xl text-foreground mb-2">{announcement.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{announcement.content}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => openEditModal(announcement)}
                    className="p-2 text-muted-foreground hover:text-nobel-gold transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}

            {activeTab === "documents" && documents.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border p-6 flex justify-between items-center hover:border-nobel-gold transition-colors"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {doc.doc_type}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-nobel-gold">
                      {doc.year}
                    </span>
                    {doc.file_url && (
                      <Check size={14} className="text-green-500" />
                    )}
                  </div>
                  <h3 className="font-serif text-xl text-foreground">{doc.title}</h3>
                  {doc.file_size && (
                    <p className="text-xs text-muted-foreground mt-1">{doc.file_size}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(doc)}
                    className="p-2 text-muted-foreground hover:text-nobel-gold transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}

            {((activeTab === "events" && events.length === 0) ||
              (activeTab === "announcements" && announcements.length === 0) ||
              (activeTab === "documents" && documents.length === 0)) && (
              <div className="text-center py-20 text-muted-foreground">
                <p className="font-serif text-xl italic">No {activeTab} found.</p>
                <button
                  onClick={openAddModal}
                  className="mt-4 text-nobel-gold hover:underline"
                >
                  Create your first {activeTab.slice(0, -1)}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h2 className="font-serif text-2xl text-foreground">
                  {editingItem ? "Edit" : "Add"} {activeTab.slice(0, -1)}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {activeTab === "events" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Title</label>
                      <input
                        type="text"
                        value={formData.title || ""}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Description</label>
                      <textarea
                        value={formData.description || ""}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Date</label>
                        <input
                          type="date"
                          value={formData.event_date || ""}
                          onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                          className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Time</label>
                        <input
                          type="text"
                          value={formData.event_time || ""}
                          onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                          placeholder="e.g. 10:00 AM"
                          className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Location</label>
                      <input
                        type="text"
                        value={formData.location || ""}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Type</label>
                      <select
                        value={formData.event_type || "upcoming"}
                        onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="anniversary">Anniversary</option>
                        <option value="election">Election</option>
                        <option value="meeting">Meeting</option>
                      </select>
                    </div>
                  </>
                )}

                {activeTab === "announcements" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Title</label>
                      <input
                        type="text"
                        value={formData.title || ""}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Content</label>
                      <textarea
                        value={formData.content || ""}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={5}
                        className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Priority</label>
                        <select
                          value={formData.priority || "normal"}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                          className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none"
                        >
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.is_active ?? true}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-5 h-5"
                          />
                          <span className="text-sm text-foreground">Active</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "documents" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Title</label>
                      <input
                        type="text"
                        value={formData.title || ""}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Description</label>
                      <textarea
                        value={formData.description || ""}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Year</label>
                        <input
                          type="number"
                          value={formData.year || new Date().getFullYear()}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Type</label>
                        <select
                          value={formData.doc_type || "Report"}
                          onChange={(e) => setFormData({ ...formData, doc_type: e.target.value })}
                          className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none"
                        >
                          <option value="Constitution">Constitution</option>
                          <option value="Bill">Bill</option>
                          <option value="Manifesto">Manifesto</option>
                          <option value="Speech">Speech</option>
                          <option value="Report">Report</option>
                          <option value="Memo">Memo</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">File</label>
                      <div className="border-2 border-dashed border-border hover:border-nobel-gold transition-colors p-6 text-center cursor-pointer relative">
                        <input
                          type="file"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept=".pdf,.doc,.docx,.txt"
                        />
                        {selectedFile ? (
                          <div className="flex items-center justify-center gap-2 text-nobel-gold">
                            <Check size={18} />
                            <span>{selectedFile.name}</span>
                          </div>
                        ) : formData.file_url ? (
                          <p className="text-sm text-muted-foreground">File already uploaded. Select new file to replace.</p>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Upload size={24} />
                            <p className="text-sm">Click to upload document</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="p-6 border-t border-border flex gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-border text-foreground text-xs font-bold uppercase tracking-widest hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || uploadingFile}
                  className="flex-1 py-3 bg-ui-blue text-white text-xs font-bold uppercase tracking-widest hover:bg-nobel-gold hover:text-foreground transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {(saving || uploadingFile) && <Loader2 size={14} className="animate-spin" />}
                  {editingItem ? "Update" : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;