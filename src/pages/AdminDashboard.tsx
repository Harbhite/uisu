/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, Star, Plus, Trash2, Edit2, Calendar, FileText, 
  Megaphone, X, Upload, Loader2, Check, Users, Award, ShieldAlert,
  ArrowUpDown, History, Search, Download, Filter, Eye, Mail, BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { z } from "zod";
import AuditLogDetailsModal from "@/components/AuditLogDetailsModal";
import InviteStaffModal from "@/components/InviteStaffModal";
import { inksPieces } from "@/lib/data";
import { SEO } from "@/components/SEO";

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
  image_url: z.string().optional().nullable(),
  header_image_url: z.string().optional().nullable(),
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

type TabType = "events" | "announcements" | "documents" | "clubs" | "administrations" | "admins" | "audit" | "publications";

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: any;
  new_data: any;
  created_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
  };
}

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
  image_url: string | null;
  header_image_url: string | null;
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

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
  };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, isStaff, role: userRole, loading: authLoading } = useAdminCheck();
  const [activeTab, setActiveTab] = useState<TabType>("events");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data states
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [administrations, setAdministrations] = useState<Administration[]>([]);
  const [publications, setPublications] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "moderator">("moderator");
  
  // Audit log filters
  const [auditSearchQuery, setAuditSearchQuery] = useState("");
  const [auditActionFilter, setAuditActionFilter] = useState<string>("all");
  const [auditStartDate, setAuditStartDate] = useState<string>("");
  const [auditEndDate, setAuditEndDate] = useState<string>("");
  const [auditTableFilter, setAuditTableFilter] = useState<string>("all");
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null);
  const [showAuditDetailModal, setShowAuditDetailModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState<any>({});
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [selectedHeaderFile, setSelectedHeaderFile] = useState<File | null>(null);
  const [teamMembers, setTeamMembers] = useState<{role: string; name: string; alias?: string}[]>([]);
  const [activitiesInput, setActivitiesInput] = useState("");

  // Redirect non-staff
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
      } else if (!isStaff) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin dashboard.",
          variant: "destructive",
        });
        navigate("/");
      }
    }
  }, [user, isStaff, authLoading, navigate, toast]);

  useEffect(() => {
    if (user && isStaff) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isStaff, activeTab]);

  // Audit logging helper
  const logAuditAction = async (action: string, tableName: string, recordId: string | null, oldData: any, newData: any) => {
    try {
      await supabase.from("audit_logs" as any).insert({
        user_id: user?.id,
        action,
        table_name: tableName,
        record_id: recordId,
        old_data: oldData,
        new_data: newData,
      });
    } catch (error) {
      console.error("Failed to log audit action:", error);
    }
  };

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
      } else if (activeTab === "publications") {
         try {
           const { data, error } = await supabase
             .from("inks_pieces" as any)
             .select("*")
             .order("date", { ascending: false });

           if (error) {
             console.warn("Could not fetch publications from DB (table might be missing), using fallback data.");
             // Sort fallback data by date desc
             const sorted = [...inksPieces].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
             setPublications(sorted);
           } else {
             setPublications(data || []);
           }
         } catch (err) {
            setPublications(inksPieces);
         }
      } else if (activeTab === "admins") {
        const { data, error } = await supabase
          .from("user_roles")
          .select(`
            id,
            user_id,
            role,
            created_at
          `)
          .in("role", ["admin", "moderator"])
          .order("created_at", { ascending: false });
        if (error) throw error;
        
        // Fetch profile names and emails for each admin/moderator
        const adminUsersWithProfiles = await Promise.all(
          (data || []).map(async (adminRole) => {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("full_name, email")
              .eq("id", adminRole.user_id)
              .maybeSingle();
            return {
              ...adminRole,
              profile: profileData || { full_name: null, email: null }
            };
          })
        );
        setAdminUsers(adminUsersWithProfiles);
      } else if (activeTab === "audit") {
        const { data, error } = await supabase
          .from("audit_logs" as any)
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);
        if (error) throw error;
        
        // Fetch profile names for each log entry
        const logsWithProfiles = await Promise.all(
          (data || []).map(async (log: any) => {
            if (log.user_id) {
              const { data: profileData } = await supabase
                .from("profiles")
                .select("full_name, email")
                .eq("id", log.user_id)
                .maybeSingle();
              return { ...log, profile: profileData || { full_name: null, email: null } };
            }
            return { ...log, profile: { full_name: null, email: null } };
          })
        );
        setAuditLogs(logsWithProfiles);
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
    if (activeTab === "publications") {
      navigate("/admin/inks-vault/new");
      return;
    }
    setEditingItem(null);
    setFormData(getDefaultFormData());
    setSelectedFile(null);
    setSelectedLogoFile(null);
    setSelectedHeaderFile(null);
    setTeamMembers([]);
    setActivitiesInput("");
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    if (activeTab === "publications") {
      navigate(`/admin/inks-vault/edit/${item.id}`);
      return;
    }
    setEditingItem(item);
    setFormData(item);
    setSelectedFile(null);
    setSelectedLogoFile(null);
    setSelectedHeaderFile(null);
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
        image_url: "",
        header_image_url: "",
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

  const handleClubImageUpload = async (file: File, type: 'logo' | 'header'): Promise<string | null> => {
    if (!user) return null;
    
    setUploadingFile(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      
      const { error: uploadError } = await supabase.storage
        .from("club-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("club-images")
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
      let tableName = "";
      let recordId: string | null = null;
      
      if (activeTab === "events") {
        tableName = "events";
        validatedData = eventSchema.parse(formData);
        validatedData.created_by = user?.id;
        
        if (editingItem) {
          recordId = editingItem.id;
          const { error } = await supabase
            .from("events")
            .update(validatedData)
            .eq("id", editingItem.id);
          if (error) throw error;
          await logAuditAction('update', tableName, recordId, editingItem, validatedData);
        } else {
          const { data, error } = await supabase
            .from("events")
            .insert(validatedData)
            .select('id')
            .single();
          if (error) throw error;
          await logAuditAction('create', tableName, data?.id, null, validatedData);
        }
      } else if (activeTab === "announcements") {
        tableName = "announcements";
        validatedData = announcementSchema.parse(formData);
        validatedData.created_by = user?.id;
        validatedData.is_active = formData.is_active ?? true;
        
        if (editingItem) {
          recordId = editingItem.id;
          const { error } = await supabase
            .from("announcements")
            .update(validatedData)
            .eq("id", editingItem.id);
          if (error) throw error;
          await logAuditAction('update', tableName, recordId, editingItem, validatedData);
        } else {
          const { data, error } = await supabase
            .from("announcements")
            .insert(validatedData)
            .select('id')
            .single();
          if (error) throw error;
          await logAuditAction('create', tableName, data?.id, null, validatedData);
        }
      } else if (activeTab === "documents") {
        tableName = "documents";
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
          recordId = editingItem.id;
          const { error } = await supabase
            .from("documents")
            .update(validatedData)
            .eq("id", editingItem.id);
          if (error) throw error;
          await logAuditAction('update', tableName, recordId, editingItem, validatedData);
        } else {
          const { data, error } = await supabase
            .from("documents")
            .insert(validatedData)
            .select('id')
            .single();
          if (error) throw error;
          await logAuditAction('create', tableName, data?.id, null, validatedData);
        }
      } else if (activeTab === "clubs") {
        tableName = "clubs";
        const activities = activitiesInput.split(",").map(a => a.trim()).filter(a => a);
        
        // Handle logo image upload
        let logoUrl = formData.image_url;
        if (selectedLogoFile) {
          const uploadedUrl = await handleClubImageUpload(selectedLogoFile, 'logo');
          if (uploadedUrl) {
            logoUrl = uploadedUrl;
          }
        }
        
        // Handle header image upload
        let headerUrl = formData.header_image_url;
        if (selectedHeaderFile) {
          const uploadedUrl = await handleClubImageUpload(selectedHeaderFile, 'header');
          if (uploadedUrl) {
            headerUrl = uploadedUrl;
          }
        }
        
        validatedData = clubSchema.parse({
          ...formData,
          activities,
          image_url: logoUrl || null,
          header_image_url: headerUrl || null,
        });
        
        if (editingItem) {
          recordId = editingItem.id;
          const { error } = await supabase
            .from("clubs")
            .update(validatedData)
            .eq("id", editingItem.id);
          if (error) throw error;
          await logAuditAction('update', tableName, recordId, editingItem, validatedData);
        } else {
          const { data, error } = await supabase
            .from("clubs")
            .insert(validatedData)
            .select('id')
            .single();
          if (error) throw error;
          await logAuditAction('create', tableName, data?.id, null, validatedData);
        }
      } else if (activeTab === "administrations") {
        tableName = "administrations";
        validatedData = administrationSchema.parse({
          ...formData,
          team: teamMembers.filter(m => m.role && m.name),
        });
        
        if (editingItem) {
          recordId = editingItem.id;
          const { error } = await supabase
            .from("administrations")
            .update(validatedData)
            .eq("id", editingItem.id);
          if (error) throw error;
          await logAuditAction('update', tableName, recordId, editingItem, validatedData);
        } else {
          const { data, error } = await supabase
            .from("administrations")
            .insert(validatedData)
            .select('id')
            .single();
          if (error) throw error;
          await logAuditAction('create', tableName, data?.id, null, validatedData);
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
      // Map tab to actual table name
      const tableMap: Record<TabType, string> = {
        events: "events",
        announcements: "announcements", 
        documents: "documents",
        clubs: "clubs",
        administrations: "administrations",
        publications: "inks_pieces",
        admins: "user_roles",
        audit: "audit_logs"
      };
      
      const tableName = tableMap[activeTab];
      
      // Log deletion action
      await logAuditAction('delete', tableName, id, null, null);
      
      const { error } = await supabase
        .from(tableName as any)
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Deleted",
        description: `${activeTab === "admins" ? "Admin" : activeTab.slice(0, -1)} deleted successfully.`,
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

  // Only show tabs the user has access to (admins see all, moderators don't see admin management)
  const tabs = [
    { id: "events" as TabType, label: "Events", icon: Calendar },
    { id: "announcements" as TabType, label: "Announcements", icon: Megaphone },
    { id: "publications" as TabType, label: "Publications", icon: BookOpen },
    { id: "documents" as TabType, label: "Documents", icon: FileText },
    { id: "clubs" as TabType, label: "Clubs", icon: Users },
    { id: "administrations" as TabType, label: "Leaders", icon: Award },
    ...(isAdmin ? [
      { id: "admins" as TabType, label: "Staff", icon: ShieldAlert },
      { id: "audit" as TabType, label: "Audit Log", icon: History },
    ] : []),
  ];

  // Promote/demote staff member
  const changeStaffRole = async (roleId: string, userId: string, currentRole: string, userName: string, userEmail?: string) => {
    const newRole = currentRole === 'admin' ? 'moderator' : 'admin';
    
    // Check if demoting last admin
    if (currentRole === 'admin') {
      const adminCount = adminUsers.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) {
        toast({
          title: "Cannot demote",
          description: "There must be at least one admin.",
          variant: "destructive",
        });
        return;
      }
    }

    if (!confirm(`${currentRole === 'admin' ? 'Demote' : 'Promote'} ${userName || "this user"} to ${newRole}?`)) return;

    setSaving(true);
    try {
      // Delete existing role
      await supabase.from("user_roles").delete().eq("id", roleId);
      
      // Insert new role
      const { error } = await supabase.from("user_roles").insert({ 
        user_id: userId, 
        role: newRole 
      });

      if (error) throw error;

      // Log the action
      await logAuditAction('role_change', 'user_roles', roleId, { role: currentRole }, { role: newRole });

      // Send email notification about role change
      if (userEmail) {
        try {
          await supabase.functions.invoke('send-staff-notification', {
            body: {
              type: 'role_change',
              email: userEmail,
              recipientName: userName,
              role: newRole,
              previousRole: currentRole,
            }
          });
        } catch (emailError) {
          console.error("Failed to send role change notification:", emailError);
        }
      }

      toast({
        title: "Role updated",
        description: `${userName || "User"} is now a ${newRole}.`,
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Filtered audit logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesSearch = auditSearchQuery === "" || 
      log.profile?.full_name?.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
      log.profile?.email?.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
      log.table_name.toLowerCase().includes(auditSearchQuery.toLowerCase());
    
    const matchesAction = auditActionFilter === "all" || log.action === auditActionFilter;
    const matchesTable = auditTableFilter === "all" || log.table_name === auditTableFilter;
    
    // Date range filtering
    const logDate = new Date(log.created_at);
    const matchesStartDate = !auditStartDate || logDate >= new Date(auditStartDate);
    const matchesEndDate = !auditEndDate || logDate <= new Date(auditEndDate + 'T23:59:59');
    
    return matchesSearch && matchesAction && matchesTable && matchesStartDate && matchesEndDate;
  });

  // Get unique actions and tables for filter dropdowns
  const uniqueActions = [...new Set(auditLogs.map(log => log.action))];
  const uniqueTables = [...new Set(auditLogs.map(log => log.table_name))];

  // Export audit logs to CSV
  const exportAuditLogs = () => {
    const headers = ["Timestamp", "User", "Email", "Action", "Table", "Record ID", "Old Data", "New Data"];
    const rows = filteredAuditLogs.map(log => [
      new Date(log.created_at).toISOString(),
      log.profile?.full_name || "Unknown",
      log.profile?.email || "",
      log.action,
      log.table_name,
      log.record_id || "",
      log.old_data ? JSON.stringify(log.old_data) : "",
      log.new_data ? JSON.stringify(log.new_data) : ""
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export complete",
      description: `Exported ${filteredAuditLogs.length} audit log entries.`,
    });
  };

  const addStaffMember = async () => {
    if (!newAdminEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAdminEmail.trim())) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Look up user by email in profiles
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("email", newAdminEmail.trim().toLowerCase())
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) {
        toast({
          title: "User not found",
          description: "No user found with that email. Make sure they have signed up and logged in at least once.",
          variant: "destructive",
        });
        return;
      }

      // Check if already has this role
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id, role")
        .eq("user_id", profileData.id)
        .in("role", ["admin", "moderator"])
        .maybeSingle();

      if (existingRole) {
        toast({
          title: "Already has role",
          description: `${profileData.full_name || "This user"} is already a ${existingRole.role}.`,
          variant: "destructive",
        });
        return;
      }

      // Add role
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: profileData.id, role: newUserRole });

      if (error) throw error;

      // Log the action
      await logAuditAction('add_staff', 'user_roles', null, null, { 
        email: profileData.email, 
        role: newUserRole,
        full_name: profileData.full_name 
      });

      toast({
        title: "Staff member added",
        description: `${profileData.full_name || "User"} has been granted ${newUserRole} access.`,
      });

      setNewAdminEmail("");
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const removeStaffMember = async (roleId: string, userName: string, role: string) => {
    // Check if this is the last admin
    const adminCount = adminUsers.filter(u => u.role === 'admin').length;
    if (role === 'admin' && adminCount <= 1) {
      toast({
        title: "Cannot remove",
        description: "There must be at least one admin.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Remove ${role} access from ${userName || "this user"}?`)) return;

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;

      // Log the action
      await logAuditAction('remove_staff', 'user_roles', roleId, { 
        name: userName, 
        role 
      }, null);

      toast({
        title: "Staff member removed",
        description: `${userName || "User"} no longer has ${role} access.`,
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

  if (authLoading || !user || !isStaff) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-nobel-gold" />
        <p className="text-muted-foreground text-sm">Verifying access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-16">
      <SEO
        title="Admin Dashboard"
        description="Manage events, announcements, documents, clubs, and more."
        image="/screenshots/admin-dashboard.png"
      />
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
          
          {activeTab !== "admins" && activeTab !== "audit" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openAddModal}
              className="flex items-center gap-2 px-6 py-3 bg-ui-blue text-white rounded-full shadow-lg hover:bg-nobel-gold hover:text-foreground transition-all text-xs font-bold uppercase tracking-widest"
            >
              <Plus size={14} /> Add {activeTab === "administrations" ? "Leader" : activeTab.slice(0, -1)}
            </motion.button>
          )}
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
            {activeTab === "publications" && publications.map((pub) => (
              <motion.div
                key={pub.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border p-6 flex justify-between items-center hover:border-nobel-gold transition-colors"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-ui-blue/10 text-ui-blue rounded-full">
                      {pub.type}
                    </span>
                    <span className="text-xs text-muted-foreground">{new Date(pub.date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-serif text-xl text-foreground">{pub.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">by {pub.author}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(pub)}
                    className="p-2 text-muted-foreground hover:text-nobel-gold transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(pub.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}

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

            {/* Admin Users Tab */}
            {activeTab === "admins" && (
              <div className="space-y-6">
                {/* Add Staff Form */}
                <div className="bg-card border border-border p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <h3 className="font-serif text-lg text-foreground">Add Staff Member</h3>
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="px-4 py-2 border border-border text-foreground text-xs font-bold uppercase tracking-widest hover:border-nobel-gold hover:text-nobel-gold transition-all flex items-center gap-2"
                    >
                      <Mail size={14} />
                      Invite via Link
                    </button>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    <input
                      type="email"
                      placeholder="Enter user's email address"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="flex-1 px-4 py-3 bg-background border border-border text-foreground focus:border-nobel-gold focus:outline-none transition-colors text-sm"
                    />
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as "admin" | "moderator")}
                      className="px-4 py-3 bg-background border border-border text-foreground focus:border-nobel-gold focus:outline-none transition-colors text-sm"
                    >
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={addStaffMember}
                      disabled={saving || !newAdminEmail.trim()}
                      className="px-6 py-3 bg-ui-blue text-white text-xs font-bold uppercase tracking-widest hover:bg-nobel-gold hover:text-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus size={14} />}
                      Add Staff
                    </button>
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-muted-foreground">
                      <strong>Admin:</strong> Full access to all features including staff management.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Moderator:</strong> Can manage content (events, announcements, documents) but cannot manage staff.
                    </p>
                  </div>
                </div>

                {/* Staff List */}
                {adminUsers.map((adminUser) => (
                  <motion.div
                    key={adminUser.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border p-6 flex justify-between items-center hover:border-nobel-gold transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <ShieldAlert className="w-4 h-4 text-ui-blue" />
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                          adminUser.role === 'admin' 
                            ? 'bg-ui-blue/10 text-ui-blue' 
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {adminUser.role}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl text-foreground">
                        {adminUser.profile?.full_name || "Unknown User"}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {adminUser.profile?.email || adminUser.user_id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Added: {new Date(adminUser.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => changeStaffRole(adminUser.id, adminUser.user_id, adminUser.role, adminUser.profile?.full_name || "this user", adminUser.profile?.email || undefined)}
                        className="p-2 text-muted-foreground hover:text-nobel-gold transition-colors"
                        title={adminUser.role === 'admin' ? 'Demote to Moderator' : 'Promote to Admin'}
                      >
                        <ArrowUpDown size={18} />
                      </button>
                      <button
                        onClick={() => removeStaffMember(adminUser.id, adminUser.profile?.full_name || "this user", adminUser.role)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        title={`Remove ${adminUser.role} access`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}

                {adminUsers.length === 0 && (
                  <div className="text-center py-20 text-muted-foreground">
                    <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-serif text-xl italic">No staff members found.</p>
                  </div>
                )}
              </div>
            )}

            {/* Audit Logs Tab */}
            {activeTab === "audit" && (
              <div className="space-y-4">
                {/* Filters and Export */}
                <div className="bg-card border border-border p-4 space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 flex-wrap">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search by user, action, or table..."
                        value={auditSearchQuery}
                        onChange={(e) => setAuditSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-background border border-border text-foreground focus:border-nobel-gold focus:outline-none transition-colors text-sm"
                      />
                    </div>
                    
                    {/* Action Filter */}
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-muted-foreground" />
                      <select
                        value={auditActionFilter}
                        onChange={(e) => setAuditActionFilter(e.target.value)}
                        className="px-3 py-2 bg-background border border-border text-foreground focus:border-nobel-gold focus:outline-none transition-colors text-sm"
                      >
                        <option value="all">All Actions</option>
                        {uniqueActions.map(action => (
                          <option key={action} value={action}>{action}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Table Filter */}
                    <select
                      value={auditTableFilter}
                      onChange={(e) => setAuditTableFilter(e.target.value)}
                      className="px-3 py-2 bg-background border border-border text-foreground focus:border-nobel-gold focus:outline-none transition-colors text-sm"
                    >
                      <option value="all">All Tables</option>
                      {uniqueTables.map(table => (
                        <option key={table} value={table}>{table}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Date Range Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Date Range:</span>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <input
                        type="date"
                        value={auditStartDate}
                        onChange={(e) => setAuditStartDate(e.target.value)}
                        className="px-3 py-2 bg-background border border-border text-foreground focus:border-nobel-gold focus:outline-none transition-colors text-sm"
                      />
                      <span className="text-xs text-muted-foreground">to</span>
                      <input
                        type="date"
                        value={auditEndDate}
                        onChange={(e) => setAuditEndDate(e.target.value)}
                        className="px-3 py-2 bg-background border border-border text-foreground focus:border-nobel-gold focus:outline-none transition-colors text-sm"
                      />
                      {(auditStartDate || auditEndDate) && (
                        <button
                          onClick={() => { setAuditStartDate(""); setAuditEndDate(""); }}
                          className="text-xs text-destructive hover:underline"
                        >
                          Clear dates
                        </button>
                      )}
                    </div>
                    
                    {/* Export Button */}
                    <button
                      onClick={exportAuditLogs}
                      disabled={filteredAuditLogs.length === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-ui-blue text-white text-xs font-bold uppercase tracking-widest hover:bg-nobel-gold hover:text-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ml-auto"
                    >
                      <Download size={14} />
                      Export CSV
                    </button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Showing {filteredAuditLogs.length} of {auditLogs.length} logs. Audit logs help track who made changes to content and when.
                  </p>
                </div>
                
                {filteredAuditLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border p-6 hover:border-nobel-gold transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <History className="w-4 h-4 text-muted-foreground" />
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                            log.action === 'delete' 
                              ? 'bg-destructive/10 text-destructive' 
                              : log.action === 'role_change'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                              : log.action === 'create'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : log.action === 'update'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {log.action}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-ui-blue">
                            {log.table_name}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">
                          <span className="font-medium">{log.profile?.full_name || log.profile?.email || 'Unknown User'}</span>
                          {' '}performed <span className="text-nobel-gold">{log.action}</span> on <span className="text-ui-blue">{log.table_name}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {(log.old_data || log.new_data) && (
                          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded max-w-xs overflow-hidden hidden md:block">
                            {log.old_data && (
                              <div className="mb-1">
                                <span className="font-bold">Old:</span> {JSON.stringify(log.old_data).slice(0, 50)}...
                              </div>
                            )}
                            {log.new_data && (
                              <div>
                                <span className="font-bold">New:</span> {JSON.stringify(log.new_data).slice(0, 50)}...
                              </div>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setSelectedAuditLog(log);
                            setShowAuditDetailModal(true);
                          }}
                          className="p-2 text-muted-foreground hover:text-nobel-gold transition-colors shrink-0"
                          title="View full details"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {filteredAuditLogs.length === 0 && auditLogs.length > 0 && (
                  <div className="text-center py-20 text-muted-foreground">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-serif text-xl italic">No matching logs found.</p>
                    <p className="text-sm mt-2">Try adjusting your search or filters.</p>
                  </div>
                )}

                {auditLogs.length === 0 && (
                  <div className="text-center py-20 text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-serif text-xl italic">No audit logs yet.</p>
                    <p className="text-sm mt-2">Actions will be logged as staff make changes.</p>
                  </div>
                )}
              </div>
            )}

            {((activeTab === "events" && events.length === 0) ||
              (activeTab === "announcements" && announcements.length === 0) ||
              (activeTab === "documents" && documents.length === 0) ||
              (activeTab === "clubs" && clubs.length === 0) ||
              (activeTab === "administrations" && administrations.length === 0) ||
              (activeTab === "publications" && publications.length === 0)) && (
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
                        <option value="Book">Book</option>
                        <option value="Music">Music</option>
                        <option value="Trophy">Trophy</option>
                        <option value="Flag">Flag</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Current President</label>
                      <input
                        type="text"
                        value={formData.president || ""}
                        onChange={(e) => setFormData({ ...formData, president: e.target.value })}
                        placeholder="Name of current president"
                        className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none"
                      />
                    </div>
                    
                    {/* Club Logo Upload */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Club Logo</label>
                      <div className="border-2 border-dashed border-border hover:border-nobel-gold transition-colors p-4 relative cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setSelectedLogoFile(e.target.files?.[0] || null)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        {selectedLogoFile ? (
                          <div className="flex items-center justify-center gap-2 text-nobel-gold">
                            <Check size={18} />
                            <span className="text-sm truncate">{selectedLogoFile.name}</span>
                          </div>
                        ) : formData.image_url ? (
                          <div className="flex items-center gap-4">
                            <img src={formData.image_url} alt="Current logo" className="w-16 h-16 object-cover rounded" />
                            <p className="text-sm text-muted-foreground">Logo uploaded. Select new to replace.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground py-2">
                            <Upload size={24} />
                            <p className="text-sm">Click to upload logo image</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Club Header Image Upload */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Header/Banner Image</label>
                      <div className="border-2 border-dashed border-border hover:border-nobel-gold transition-colors p-4 relative cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setSelectedHeaderFile(e.target.files?.[0] || null)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        {selectedHeaderFile ? (
                          <div className="flex items-center justify-center gap-2 text-nobel-gold">
                            <Check size={18} />
                            <span className="text-sm truncate">{selectedHeaderFile.name}</span>
                          </div>
                        ) : formData.header_image_url ? (
                          <div className="flex items-center gap-4">
                            <img src={formData.header_image_url} alt="Current header" className="w-24 h-12 object-cover rounded" />
                            <p className="text-sm text-muted-foreground">Header uploaded. Select new to replace.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground py-2">
                            <Upload size={24} />
                            <p className="text-sm">Click to upload header/banner image</p>
                          </div>
                        )}
                      </div>
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

      {/* Audit Log Details Modal */}
      <AuditLogDetailsModal
        isOpen={showAuditDetailModal}
        onClose={() => {
          setShowAuditDetailModal(false);
          setSelectedAuditLog(null);
        }}
        log={selectedAuditLog}
      />

      {/* Invite Staff Modal */}
      <InviteStaffModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        currentUserId={user?.id}
      />
    </div>
  );
};

export default AdminDashboard;