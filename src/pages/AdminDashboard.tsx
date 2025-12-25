import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { 
  ArrowLeft, Star, Plus, Trash2, Edit2, Calendar, FileText, 
  Megaphone, X, Upload, Loader2, Check, Users, Award
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

const clubSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  acronym: z.string().max(20).optional(),
  category: z.string().min(1, "Category is required"),
  founded: z.string().max(10).optional(),
  motto: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  activities: z.array(z.string()).optional(),
  president: z.string().max(100).optional(),
  color: z.string().max(20).optional(),
  icon_name: z.string().max(50).optional(),
});

const administrationSchema = z.object({
  session: z.string().min(1, "Session is required").max(20),
  president: z.string().min(1, "President name is required").max(200),
  alias: z.string().max(100).optional(),
  motto: z.string().max(200).optional(),
  notable_events: z.string().max(2000).optional(),
  status: z.enum(["Active", "Completed", "Suspended", "Impeached"]),
  team: z.array(z.object({
    role: z.string(),
    name: z.string(),
    alias: z.string().optional()
  })).optional(),
});

type TabType = "events" | "announcements" | "documents" | "clubs" | "administrations";

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

interface Club {
  id: string;
  name: string;
  acronym: string | null;
  category: string;
  founded: string | null;
  motto: string | null;
  description: string | null;
  activities: string[] | null;
  president: string | null;
  color: string | null;
  icon_name: string | null;
}

interface Administration {
  id: string;
  session: string;
  president: string;
  alias: string | null;
  motto: string | null;
  notable_events: string | null;
  status: string | null;
  team: any;
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
  const [clubs, setClubs] = useState<Club[]>([]);
  const [administrations, setAdministrations] = useState<Administration[]>([]);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Form states
  const [formData, setFormData] = useState<any>({});
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [teamMembers, setTeamMembers] = useState<{role: string; name: string; alias?: string}[]>([]);
  const [activitiesInput, setActivitiesInput] = useState("");

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
      } else if (activeTab === "clubs") {
        const { data, error } = await supabase
          .from("clubs")
          .select("*")
          .order("name");
        if (error) throw error;
        setClubs(data || []);
      } else if (activeTab === "administrations") {
        const { data, error } = await supabase
          .from("administrations")
          .select("*")
          .order("session", { ascending: false });
        if (error) throw error;
        setAdministrations(data || []);
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
    setTeamMembers([]);
    setActivitiesInput("");
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setSelectedFile(null);
    if (activeTab === "administrations" && item.team) {
      setTeamMembers(item.team);
    } else {
      setTeamMembers([]);
    }
    if (activeTab === "clubs" && item.activities) {
      setActivitiesInput(item.activities.join(", "));
    } else {
      setActivitiesInput("");
    }
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
    } else if (activeTab === "documents") {
      return {
        title: "",
        description: "",
        year: new Date().getFullYear(),
        doc_type: "Report",
      };
    } else if (activeTab === "clubs") {
      return {
        name: "",
        acronym: "",
        category: "Sociocultural",
        founded: "",
        motto: "",
        description: "",
        activities: [],
        president: "",
        color: "#6d28d9",
        icon_name: "Star",
      };
    } else {
      return {
        session: "",
        president: "",
        alias: "",
        motto: "",
        notable_events: "",
        status: "Active",
        team: [],
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

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { role: "", name: "", alias: "" }]);
  };

  const updateTeamMember = (index: number, field: string, value: string) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
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
      } else if (activeTab === "clubs") {
        const activities = activitiesInput.split(",").map(a => a.trim()).filter(a => a);
        validatedData = clubSchema.parse({
          ...formData,
          activities,
        });
        
        if (editingItem) {
          const { error } = await supabase
            .from("clubs")
            .update(validatedData)
            .eq("id", editingItem.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("clubs")
            .insert(validatedData);
          if (error) throw error;
        }
      } else if (activeTab === "administrations") {
        validatedData = administrationSchema.parse({
          ...formData,
          team: teamMembers.filter(m => m.role && m.name),
        });
        
        if (editingItem) {
          const { error } = await supabase
            .from("administrations")
            .update(validatedData)
            .eq("id", editingItem.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("administrations")
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
    { id: "clubs" as TabType, label: "Clubs", icon: Users },
    { id: "administrations" as TabType, label: "Leaders", icon: Award },
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
            <Plus size={14} /> Add {activeTab === "administrations" ? "Leader" : activeTab.slice(0, -1)}
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border pb-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-full transition-all relative whitespace-nowrap ${
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

            {activeTab === "clubs" && clubs.map((club) => (
              <motion.div
                key={club.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border p-6 flex justify-between items-center hover:border-nobel-gold transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: club.color || '#6d28d9' }}
                  >
                    <Users size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-muted text-muted-foreground rounded-full">
                        {club.category}
                      </span>
                      {club.acronym && (
                        <span className="text-xs text-nobel-gold font-bold">{club.acronym}</span>
                      )}
                    </div>
                    <h3 className="font-serif text-xl text-foreground">{club.name}</h3>
                    {club.founded && (
                      <p className="text-xs text-muted-foreground">Est. {club.founded}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(club)}
                    className="p-2 text-muted-foreground hover:text-nobel-gold transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(club.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}

            {activeTab === "administrations" && administrations.map((admin) => (
              <motion.div
                key={admin.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border p-6 flex justify-between items-center hover:border-nobel-gold transition-colors"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-ui-blue">
                      {admin.session}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                      admin.status === 'Active' ? 'bg-green-50 text-green-700' :
                      admin.status === 'Suspended' ? 'bg-red-50 text-red-700' :
                      admin.status === 'Impeached' ? 'bg-orange-50 text-orange-700' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {admin.status}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl text-foreground">{admin.president}</h3>
                  {admin.alias && (
                    <p className="text-sm text-nobel-gold italic">"{admin.alias}"</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(admin)}
                    className="p-2 text-muted-foreground hover:text-nobel-gold transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(admin.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}

            {((activeTab === "events" && events.length === 0) ||
              (activeTab === "announcements" && announcements.length === 0) ||
              (activeTab === "documents" && documents.length === 0) ||
              (activeTab === "clubs" && clubs.length === 0) ||
              (activeTab === "administrations" && administrations.length === 0)) && (
              <div className="text-center py-20 text-muted-foreground">
                <p className="font-serif text-xl italic">No {activeTab} found.</p>
                <button
                  onClick={openAddModal}
                  className="mt-4 text-nobel-gold hover:underline"
                >
                  Create your first {activeTab === "administrations" ? "leader" : activeTab.slice(0, -1)}
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
                  {editingItem ? "Edit" : "Add"} {activeTab === "administrations" ? "Leader" : activeTab.slice(0, -1)}
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

                {activeTab === "clubs" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Club Name</label>
                      <input
                        type="text"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Acronym</label>
                        <input
                          type="text"
                          value={formData.acronym || ""}
                          onChange={(e) => setFormData({ ...formData, acronym: e.target.value })}
                          placeholder="e.g. GDSC"
                          className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Category</label>
                        <select
                          value={formData.category || "Sociocultural"}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none"
                        >
                          <option value="Sociocultural">Sociocultural</option>
                          <option value="Academic">Academic</option>
                          <option value="Religious">Religious</option>
                          <option value="Press">Press</option>
                          <option value="Tech">Tech</option>
                          <option value="Sports">Sports</option>
                          <option value="Politics">Politics</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Founded</label>
                        <input
                          type="text"
                          value={formData.founded || ""}
                          onChange={(e) => setFormData({ ...formData, founded: e.target.value })}
                          placeholder="e.g. 1950"
                          className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Color</label>
                        <input
                          type="color"
                          value={formData.color || "#6d28d9"}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="w-full h-12 bg-background border border-border focus:border-nobel-gold focus:outline-none cursor-pointer"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Motto</label>
                      <input
                        type="text"
                        value={formData.motto || ""}
                        onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
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
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Activities (comma-separated)</label>
                      <input
                        type="text"
                        value={activitiesInput}
                        onChange={(e) => setActivitiesInput(e.target.value)}
                        placeholder="e.g. Hackathons, Coding Bootcamps, Meetups"
                        className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Icon</label>
                      <select
                        value={formData.icon_name || "Star"}
                        onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none"
                      >
                        <option value="Star">Star</option>
                        <option value="Award">Award</option>
                        <option value="Globe">Globe</option>
                        <option value="Heart">Heart</option>
                        <option value="Cpu">Cpu</option>
                        <option value="Users">Users</option>
                        <option value="Gavel">Gavel</option>
                        <option value="Palette">Palette</option>
                      </select>
                    </div>
                  </>
                )}

                {activeTab === "administrations" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Session</label>
                        <input
                          type="text"
                          value={formData.session || ""}
                          onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                          placeholder="e.g. 2024/2025"
                          className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Status</label>
                        <select
                          value={formData.status || "Active"}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none"
                        >
                          <option value="Active">Active</option>
                          <option value="Completed">Completed</option>
                          <option value="Suspended">Suspended</option>
                          <option value="Impeached">Impeached</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">President Name</label>
                      <input
                        type="text"
                        value={formData.president || ""}
                        onChange={(e) => setFormData({ ...formData, president: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Alias/Nickname</label>
                      <input
                        type="text"
                        value={formData.alias || ""}
                        onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Motto</label>
                      <input
                        type="text"
                        value={formData.motto || ""}
                        onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Notable Events</label>
                      <textarea
                        value={formData.notable_events || ""}
                        onChange={(e) => setFormData({ ...formData, notable_events: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none resize-none"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Executive Team</label>
                        <button
                          type="button"
                          onClick={addTeamMember}
                          className="text-xs text-nobel-gold hover:underline flex items-center gap-1"
                        >
                          <Plus size={12} /> Add Member
                        </button>
                      </div>
                      <div className="space-y-3">
                        {teamMembers.map((member, idx) => (
                          <div key={idx} className="flex gap-2 items-start">
                            <input
                              type="text"
                              value={member.role}
                              onChange={(e) => updateTeamMember(idx, 'role', e.target.value)}
                              placeholder="Role"
                              className="flex-1 px-3 py-2 bg-background border border-border focus:border-nobel-gold focus:outline-none text-sm"
                            />
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) => updateTeamMember(idx, 'name', e.target.value)}
                              placeholder="Name"
                              className="flex-1 px-3 py-2 bg-background border border-border focus:border-nobel-gold focus:outline-none text-sm"
                            />
                            <input
                              type="text"
                              value={member.alias || ''}
                              onChange={(e) => updateTeamMember(idx, 'alias', e.target.value)}
                              placeholder="Alias"
                              className="w-24 px-3 py-2 bg-background border border-border focus:border-nobel-gold focus:outline-none text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => removeTeamMember(idx)}
                              className="p-2 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
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