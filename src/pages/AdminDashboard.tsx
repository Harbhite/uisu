/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { TableSkeleton } from '@/components/skeletons/GenericSkeletons';
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, Star, Plus, Trash2, Edit2, Calendar, FileText, 
  Megaphone, X, Upload, Loader2, Check, Users, Award, ShieldAlert,
  ArrowUpDown, History, Search, Download, Filter, Eye, Mail, BookOpen, Inbox, Send, FlaskConical, MessageSquareWarning,
  BarChart3, MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { z } from "zod";
import AuditLogDetailsModal from "@/components/AuditLogDetailsModal";
import InviteStaffModal from "@/components/InviteStaffModal";
import PendingSubmissions from "@/components/PendingSubmissions";
import { inksPieces } from "@/lib/data";
import { SEO } from "@/components/SEO";
import { SubscriberImport } from "@/components/admin/SubscriberImport";
import { ABTestingSection } from "@/components/admin/ABTestingSection";
import { NewsletterRichEditor } from "@/components/admin/NewsletterRichEditor";
import { NewsletterTemplatesManager, type NewsletterTemplateRow } from "@/components/admin/NewsletterTemplatesManager";
import { NewsletterAudiencesManager, type NewsletterAudienceRow } from "@/components/admin/NewsletterAudiencesManager";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminFeedback } from "@/components/admin/AdminFeedback";

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

type TabType = "events" | "announcements" | "documents" | "clubs" | "administrations" | "admins" | "audit" | "publications" | "submissions" | "newsletter" | "complaints" | "analytics" | "feedback";

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
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    try {
      const saved = localStorage.getItem('admin_active_tab');
      if (saved && ["events","announcements","documents","clubs","administrations","admins","audit","publications","submissions","newsletter","complaints","analytics","feedback"].includes(saved)) {
        return saved as TabType;
      }
    } catch {}
    return "events";
  });
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
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<any[]>([]);
  const [newsletterCampaigns, setNewsletterCampaigns] = useState<any[]>([]);
  const [adminComplaints, setAdminComplaints] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "moderator">("moderator");
  
  // Newsletter compose state
  const [composeSubject, setComposeSubject] = useState("");
  const [composeContent, setComposeContent] = useState("");
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("classic");
  const [customTemplates, setCustomTemplates] = useState<NewsletterTemplateRow[]>([]);
  const [showTemplatesManager, setShowTemplatesManager] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  
  // A/B Testing state
  const [abEnabled, setAbEnabled] = useState(false);
  const [abVariantA, setAbVariantA] = useState("classic");
  const [abVariantB, setAbVariantB] = useState("minimal");

  // Sender name + audience targeting
  const [senderName, setSenderName] = useState("UISU Archive");
  const [audienceMode, setAudienceMode] = useState<"all" | "saved" | "adhoc">("all");
  const [selectedAudienceId, setSelectedAudienceId] = useState<string>("");
  const [adhocEmailsText, setAdhocEmailsText] = useState("");
  const [audiences, setAudiences] = useState<NewsletterAudienceRow[]>([]);
  const [showAudiencesManager, setShowAudiencesManager] = useState(false);
  // Recipient-preview state
  const [recipientPreviewEmail, setRecipientPreviewEmail] = useState("");
  const [recipientPreviewOptions, setRecipientPreviewOptions] = useState<{ email: string; first_name: string | null; full_name: string | null }[]>([]);
  const [recipientPreviewHtml, setRecipientPreviewHtml] = useState<string>("");
  const [recipientPreviewMeta, setRecipientPreviewMeta] = useState<{ from?: string; first?: string; full?: string } | null>(null);
  const [recipientPreviewLoading, setRecipientPreviewLoading] = useState(false);
  const [showRecipientPreview, setShowRecipientPreview] = useState(false);
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
    if (authLoading) return;

    let isActive = true;

    const verifyAccess = async () => {
      if (!user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isActive) return;

        if (!session?.user) {
          navigate("/auth");
        }
        return;
      }

      if (!isStaff) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin dashboard.",
          variant: "destructive",
        });
        navigate("/");
      }
    };

    void verifyAccess();

    return () => {
      isActive = false;
    };
  }, [user?.id, isStaff, authLoading, navigate, toast]);

  useEffect(() => {
    localStorage.setItem('admin_active_tab', activeTab);
  }, [activeTab]);

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
             .from("ink_pieces")
             .select("*")
             .order("created_at", { ascending: false });

           if (error) {
             console.warn("Could not fetch publications from DB:", error.message);
             setPublications([]);
           } else {
             setPublications(data || []);
           }
         } catch (err) {
            console.error("Failed to fetch publications:", err);
            setPublications([]);
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
      } else if (activeTab === "newsletter") {
        const [subsResult, campaignsResult, templatesResult, audiencesResult] = await Promise.all([
          supabase
            .from("newsletter_subscribers")
            .select("*")
            .order("subscribed_at", { ascending: false }),
          supabase
            .from("newsletter_campaigns")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("newsletter_templates" as any)
            .select("*")
            .eq("is_active", true)
            .order("created_at", { ascending: false }),
          supabase
            .from("newsletter_audiences" as any)
            .select("id, name, description, type, member_count, created_at")
            .order("created_at", { ascending: false })
        ]);

        if (subsResult.error) throw subsResult.error;
        setNewsletterSubscribers(subsResult.data || []);
        setNewsletterCampaigns(campaignsResult.data || []);
        setCustomTemplates(((templatesResult.data || []) as unknown as NewsletterTemplateRow[]));
        setAudiences(((audiencesResult.data || []) as unknown as NewsletterAudienceRow[]));
      } else if (activeTab === "complaints") {
        const { data, error } = await supabase
          .from("complaints")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setAdminComplaints(data || []);
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
        scheduled_at: "",
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
        audit: "audit_logs",
        submissions: "job_listings",
        newsletter: "newsletter_subscribers",
        complaints: "complaints",
        analytics: "",
        feedback: "anonymous_feedback",
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
    { id: "submissions" as TabType, label: "Submissions", icon: Inbox },
    { id: "complaints" as TabType, label: "Complaints", icon: MessageSquareWarning },
    ...(isAdmin ? [
      { id: "analytics" as TabType, label: "Analytics", icon: BarChart3 },
      { id: "feedback" as TabType, label: "Feedback", icon: MessageSquare },
      { id: "newsletter" as TabType, label: "Newsletter", icon: Mail },
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

  // Send newsletter function
  // Resolve the active custom template shell (if selectedTemplate matches a custom row id)
  const getCustomShell = (): string | undefined =>
    customTemplates.find((t) => t.id === selectedTemplate)?.html_shell;

  // Build audience payload for edge function
  const getAudiencePayload = (): { audienceId?: string; audienceEmails?: string[] } => {
    if (audienceMode === "saved" && selectedAudienceId) {
      return { audienceId: selectedAudienceId };
    }
    if (audienceMode === "adhoc") {
      const emails = Array.from(
        new Set(
          adhocEmailsText
            .split(/[\s,;\n]+/)
            .map((e) => e.trim().toLowerCase())
            .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
        )
      );
      return { audienceEmails: emails };
    }
    return {};
  };

  const getRecipientCount = (): number => {
    if (audienceMode === "saved") {
      return audiences.find((a) => a.id === selectedAudienceId)?.member_count || 0;
    }
    if (audienceMode === "adhoc") {
      return getAudiencePayload().audienceEmails?.length || 0;
    }
    return newsletterSubscribers.filter((s) => s.is_active).length;
  };

  const sendNewsletter = async (scheduled = false) => {
    if (!composeSubject.trim() || !composeContent.trim()) {
      toast({
        title: "Missing fields",
        description: "Please enter a subject and content for the newsletter.",
        variant: "destructive",
      });
      return;
    }

    const previewCount = getRecipientCount();
    if (previewCount === 0 && !scheduled) {
      toast({
        title: "No recipients",
        description: audienceMode === "all"
          ? "There are no active subscribers to send to."
          : "The selected audience has no valid recipients.",
        variant: "destructive",
      });
      return;
    }

    // Handle scheduling
    if (scheduled && scheduleDate && scheduleTime) {
      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
      if (scheduledDateTime <= new Date()) {
        toast({
          title: "Invalid schedule",
          description: "Scheduled time must be in the future.",
          variant: "destructive",
        });
        return;
      }

      if (!confirm(`Schedule this newsletter for ${scheduledDateTime.toLocaleString()}?`)) return;

      setIsScheduling(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        const response = await supabase.functions.invoke('send-newsletter', {
          body: {
            subject: composeSubject.trim(),
            content: composeContent.trim(),
            template: abEnabled ? undefined : selectedTemplate,
            customTemplateHtml: abEnabled ? undefined : getCustomShell(),
            scheduledAt: scheduledDateTime.toISOString(),
            abEnabled,
            abVariantA: abEnabled ? abVariantA : undefined,
            abVariantB: abEnabled ? abVariantB : undefined,
            senderName: senderName.trim() || undefined,
            ...getAudiencePayload(),
          },
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (response.error) {
          throw new Error(response.error.message || 'Failed to schedule newsletter');
        }

        toast({
          title: "Newsletter scheduled!",
          description: `Will be sent on ${scheduledDateTime.toLocaleString()}`,
        });

        setComposeSubject("");
        setComposeContent("");
        setScheduleDate("");
        setScheduleTime("");
        fetchData();
      } catch (error: any) {
        console.error("Newsletter schedule error:", error);
        toast({
          title: "Error scheduling newsletter",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsScheduling(false);
      }
      return;
    }

    const recipientCount = getRecipientCount();
    if (!confirm(`Send this newsletter to ${recipientCount} recipient(s)?`)) return;

    setSendingNewsletter(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const response = await supabase.functions.invoke('send-newsletter', {
        body: {
          subject: composeSubject.trim(),
          content: composeContent.trim(),
          template: abEnabled ? undefined : selectedTemplate,
          customTemplateHtml: abEnabled ? undefined : getCustomShell(),
          abEnabled,
          abVariantA: abEnabled ? abVariantA : undefined,
          abVariantB: abEnabled ? abVariantB : undefined,
          senderName: senderName.trim() || undefined,
          ...getAudiencePayload(),
        },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to send newsletter');
      }

      const result = response.data;

      await logAuditAction('send_newsletter', 'newsletter_campaigns', null, null, {
        subject: composeSubject,
        template: selectedTemplate,
        recipients: result.stats?.total || recipientCount,
        successful: result.stats?.successful || 0,
        failed: result.stats?.failed || 0,
      });

      toast({
        title: "Newsletter sent!",
        description: result.message || `Sent to ${result.stats?.successful || recipientCount} recipient(s).`,
      });

      setComposeSubject("");
      setComposeContent("");
      fetchData();
    } catch (error: any) {
      console.error("Newsletter send error:", error);
      toast({
        title: "Error sending newsletter",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSendingNewsletter(false);
    }
  };

  const sendTestNewsletter = async () => {
    if (!composeSubject.trim() || !composeContent.trim()) {
      toast({
        title: "Missing fields",
        description: "Please enter a subject and content for the newsletter.",
        variant: "destructive",
      });
      return;
    }

    if (!testEmail.trim()) {
      toast({
        title: "Missing test email",
        description: "Please enter an email address for the test send.",
        variant: "destructive",
      });
      return;
    }

    setSendingTest(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const response = await supabase.functions.invoke('send-newsletter', {
        body: {
          subject: composeSubject.trim(),
          content: composeContent.trim(),
          template: selectedTemplate,
          customTemplateHtml: getCustomShell(),
          testEmail: testEmail.trim(),
          senderName: senderName.trim() || undefined,
        },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to send test email');
      }

      toast({
        title: "Test email sent!",
        description: `Preview sent to ${testEmail}`,
      });

      setTestEmail("");
    } catch (error: any) {
      console.error("Test send error:", error);
      toast({
        title: "Error sending test",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSendingTest(false);
    }
  };

  // Generate preview HTML for display based on template
  const generatePreviewHtml = () => {
    // Content is now rich HTML from the editor, use directly
    const htmlContent = composeContent || '';
    
    const subject = composeSubject || 'Newsletter Subject';
    const content = htmlContent || '<p>Your newsletter content will appear here...</p>';
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Custom user-created templates: substitute tokens in the stored html_shell
    const customShell = customTemplates.find((t) => t.id === selectedTemplate)?.html_shell;
    if (customShell) {
      return customShell
        .replace(/\{\{\s*content\s*\}\}/gi, content)
        .replace(/\{\{\s*subject\s*\}\}/gi, subject)
        .replace(/\{\{\s*email\s*\}\}/gi, 'preview@uisu.space')
        .replace(/\{\{\s*unsubscribe_url\s*\}\}/gi, '#preview-unsubscribe');
    }

    const goldLogo = `<svg width="48" height="48" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="none" stroke="#C5A059" stroke-width="3"/><circle cx="50" cy="50" r="35" fill="none" stroke="#C5A059" stroke-width="2"/><text x="50" y="58" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#C5A059" text-anchor="middle">UI</text><text x="50" y="75" font-family="Georgia, serif" font-size="10" fill="#C5A059" text-anchor="middle">SU</text></svg>`;
    
    if (selectedTemplate === 'minimal') {
      return `
        <div style="font-family: -apple-system, sans-serif; background-color: #FFFFFF; padding: 48px 24px;">
          <div style="max-width: 520px; margin: 0 auto; text-align: center;">
            <div style="border-bottom: 2px solid #C5A059; display: inline-block; padding-bottom: 8px; margin-bottom: 40px;">
              <span style="font-size: 11px; color: #C5A059; text-transform: uppercase; letter-spacing: 4px; font-weight: 600;">UISU Archive</span>
            </div>
            <h1 style="font-size: 28px; font-weight: 300; color: #0F172A; line-height: 1.4; font-family: Georgia, serif; margin: 0 0 32px 0;">${subject}</h1>
            <div style="font-size: 16px; line-height: 1.9; color: #475569; text-align: left;">${content}</div>
            <div style="margin-top: 40px;"><a href="#" style="color: #C5A059; font-size: 14px; border-bottom: 1px solid #C5A059;">Explore the Archive →</a></div>
            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #F1F5F9;">
              <p style="font-size: 18px; font-style: italic; color: #C5A059; margin: 0 0 4px 0;">Father of Intellectual Unionism</p>
              <p style="font-size: 11px; color: #94A3B8; margin: 0;">UISU Archive • University of Ibadan</p>
            </div>
          </div>
        </div>
      `;
    }
    
    if (selectedTemplate === 'announcement') {
      return `
        <div style="font-family: Georgia, serif; background-color: #0F172A; padding: 48px 20px;">
          <div style="max-width: 560px; margin: 0 auto; text-align: center;">
            <span style="display: inline-block; background-color: #C5A059; color: #0F172A; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; padding: 8px 16px; margin-bottom: 24px;">Official Announcement</span>
            <div style="margin-bottom: 24px;">${goldLogo}</div>
            <h1 style="font-size: 32px; font-weight: 700; color: #FFFFFF; line-height: 1.2; margin: 0 0 24px 0;">${subject}</h1>
            <div style="width: 60px; height: 3px; background-color: #C5A059; margin: 0 auto 24px;"></div>
            <div style="background-color: #1E293B; border-left: 4px solid #C5A059; padding: 24px; text-align: left;">
              <div style="font-size: 16px; line-height: 1.8; color: #E2E8F0;">${content}</div>
            </div>
            <div style="margin-top: 32px;"><a href="#" style="display: inline-block; background-color: #C5A059; color: #0F172A; padding: 16px 40px; font-weight: 700; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; text-decoration: none;">Read More</a></div>
            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #334155;">
              <p style="font-size: 18px; font-style: italic; color: #C5A059; margin: 0 0 8px 0;">Father of Intellectual Unionism</p>
              <p style="font-size: 12px; color: #64748B; margin: 0;">UISU Archive • University of Ibadan Students' Union</p>
            </div>
          </div>
        </div>
      `;
    }
    
    if (selectedTemplate === 'newspaper') {
      return `
        <div style="font-family: Georgia, serif; background-color: #FFFEF7; padding: 32px 20px;">
          <div style="max-width: 640px; margin: 0 auto; background-color: #FFFEF7; border: 1px solid #E5E2D9;">
            <div style="padding: 24px 32px; border-bottom: 3px double #0F172A; text-align: center;">
              <p style="font-size: 10px; color: #64748B; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 4px 0;">The Official Newsletter of</p>
              <h1 style="font-size: 36px; font-weight: 400; color: #0F172A; font-family: Georgia, serif; letter-spacing: -1px; margin: 0;">THE ARCHIVE</h1>
              <p style="font-size: 11px; color: #64748B; margin: 8px 0 0 0;">${today} • <span style="color: #C5A059;">University of Ibadan</span></p>
            </div>
            <div style="padding: 24px 32px 16px;">
              <h2 style="font-size: 24px; font-weight: 700; color: #0F172A; line-height: 1.3; text-align: center; border-bottom: 1px solid #0F172A; padding-bottom: 16px; margin: 0;">${subject}</h2>
            </div>
            <div style="padding: 16px 32px 32px;">
              <div style="font-size: 16px; line-height: 1.8; color: #1E293B; text-align: justify;">${content}</div>
            </div>
            <div style="padding: 20px 32px; background-color: #0F172A; text-align: center;">
              <a href="#" style="color: #C5A059; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; text-decoration: none;">Continue Reading on the Archive →</a>
            </div>
            <div style="padding: 24px 32px; text-align: center; border-top: 1px solid #E5E2D9;">
              ${goldLogo}
              <p style="font-size: 16px; font-style: italic; color: #C5A059; margin: 12px 0 4px 0;">Father of Intellectual Unionism</p>
              <p style="font-size: 11px; color: #94A3B8; margin: 0;">UISU Archive • Est. 1948</p>
            </div>
          </div>
        </div>
      `;
    }
    
    if (selectedTemplate === 'longform') {
      const readTime = Math.max(1, Math.ceil(composeContent.split(/\s+/).length / 200));
      return `
        <div style="font-family: Georgia, serif; background-color: #FAFAF8; padding: 48px 20px;">
          <div style="max-width: 680px; margin: 0 auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 24px; border-bottom: 1px solid #E2E8F0; margin-bottom: 40px;">
              <div>
                <p style="font-size: 18px; font-weight: 600; color: #0F172A; margin: 0;">UISU Archive</p>
                <p style="font-size: 12px; color: #94A3B8; margin: 4px 0 0 0;">The Longform Dispatch</p>
              </div>
              <span style="background-color: #FEF9E7; color: #C5A059; padding: 6px 12px; font-size: 11px; font-weight: 600; border-radius: 4px;">${readTime} min read</span>
            </div>
            <h1 style="font-size: 36px; font-weight: 700; color: #0F172A; line-height: 1.25; margin: 0 0 16px 0;">${subject}</h1>
            <p style="font-size: 12px; color: #94A3B8; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 40px 0;">Deep Dive Edition</p>
            <div style="font-size: 18px; line-height: 1.9; color: #334155; margin-bottom: 40px;">${content}</div>
            <div style="border-left: 4px solid #C5A059; padding-left: 24px; margin: 32px 0; font-size: 20px; font-style: italic; color: #64748B;">"Preserving our legacy, one story at a time."</div>
            <div style="text-align: center; padding-top: 32px; border-top: 1px solid #E2E8F0;">
              <p style="font-size: 18px; font-style: italic; color: #C5A059; margin: 0 0 8px 0;">Father of Intellectual Unionism</p>
              <p style="font-size: 11px; color: #94A3B8; margin: 0;">University of Ibadan Students' Union • Est. 1948</p>
            </div>
          </div>
        </div>
      `;
    }
    
    if (selectedTemplate === 'telegram') {
      const telegramDate = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
      return `
        <div style="font-family: 'Courier New', monospace; background-color: #F5F0E1; padding: 40px 20px;">
          <div style="max-width: 540px; margin: 0 auto; background-color: #FFFEF5; border: 2px solid #1A1A1A; box-shadow: 4px 4px 0 #1A1A1A;">
            <div style="background-color: #C5A059; padding: 12px; text-align: center;">
              <p style="margin: 0; font-size: 10px; color: #0F172A; text-transform: uppercase; letter-spacing: 4px; font-weight: 700;">★ OFFICIAL DISPATCH ★</p>
            </div>
            <div style="padding: 24px; border-bottom: 2px dashed #1A1A1A; text-align: center;">
              <p style="font-size: 10px; color: #64748B; margin: 0;">DATE: ${telegramDate}</p>
            </div>
            <div style="padding: 20px;">
              <p style="font-size: 10px; color: #64748B; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0;">RE:</p>
              <h1 style="font-size: 20px; font-weight: 700; color: #1A1A1A; text-transform: uppercase; letter-spacing: 1px; line-height: 1.4; margin: 0;">${subject}</h1>
            </div>
            <div style="padding: 0 20px 24px;">
              <div style="font-size: 13px; line-height: 1.8; color: #374151;">${content}</div>
            </div>
            <div style="background-color: #1A1A1A; padding: 16px; text-align: center;">
              <p style="font-size: 14px; font-style: italic; color: #C5A059; margin: 0 0 4px 0;">Father of Intellectual Unionism</p>
              <p style="font-size: 10px; color: #64748B; letter-spacing: 2px; margin: 0;">EST. 1948</p>
            </div>
          </div>
        </div>
      `;
    }
    
    if (selectedTemplate === 'artdeco') {
      return `
        <div style="font-family: Georgia, serif; background-color: #0A0A0A; padding: 48px 20px;">
          <div style="max-width: 580px; margin: 0 auto; background-color: #0F0F0F; border: 1px solid #C5A059;">
            <div style="padding: 32px; text-align: center; background: linear-gradient(180deg, #151515 0%, #0F0F0F 100%);">
              <p style="font-size: 10px; color: #C5A059; text-transform: uppercase; letter-spacing: 6px; margin: 0;">The Archive</p>
            </div>
            <div style="padding: 0 32px;">
              <div style="height: 1px; background: linear-gradient(to right, transparent 0%, #C5A059 20%, #C5A059 80%, transparent 100%);"></div>
            </div>
            <div style="padding: 32px; text-align: center;">
              <h1 style="font-size: 28px; font-weight: 400; color: #FFFFFF; line-height: 1.3; letter-spacing: 1px; margin: 0 0 16px 0;">${subject}</h1>
              <span style="font-size: 16px; color: #C5A059;">◆ ◇ ◆</span>
            </div>
            <div style="padding: 0 32px 32px;">
              <div style="font-size: 16px; line-height: 1.9; color: #D1D5DB;">${content}</div>
            </div>
            <div style="padding: 24px 32px; text-align: center; border-top: 1px solid #1F1F1F;">
              <p style="font-size: 18px; font-style: italic; color: #C5A059; margin: 0 0 8px 0;">Father of Intellectual Unionism</p>
              <p style="font-size: 10px; color: #64748B; letter-spacing: 3px; margin: 0;">UNIVERSITY OF IBADAN • EST. 1948</p>
            </div>
          </div>
        </div>
      `;
    }
    
    if (selectedTemplate === 'blueprint') {
      return `
        <div style="font-family: -apple-system, sans-serif; background-color: #EEF2F7; padding: 48px 20px;">
          <div style="max-width: 560px; margin: 0 auto; background: #FFFFFF;">
            <div style="background-color: #003366; padding: 40px; text-align: center;">
              <h1 style="font-size: 26px; font-weight: 800; color: #FFFFFF; margin: 0; font-family: Georgia, serif;">${subject}</h1>
            </div>
            <div style="padding: 32px;">
              <div style="font-size: 15px; line-height: 1.8; color: #374151;">${content}</div>
            </div>
            <div style="padding: 0 32px 32px; text-align: center;">
              <a href="#" style="display: inline-block; background-color: #C5A059; color: #FFFFFF; padding: 12px 36px; text-decoration: none; font-weight: 600; border-radius: 24px; font-size: 13px;">Visit UISU Archive</a>
            </div>
          </div>
        </div>
      `;
    }

    if (selectedTemplate === 'postbox') {
      return `
        <div style="font-family: -apple-system, sans-serif; background-color: #EEF2F7; padding: 48px 20px;">
          <div style="max-width: 560px; margin: 0 auto;">
            <div style="background-color: #003366; border-radius: 16px 16px 0 0; padding: 40px; text-align: center;">
              <h1 style="font-size: 28px; font-weight: 800; color: #FFFFFF; margin: 0 0 8px 0; font-family: Georgia, serif;">${subject}</h1>
              <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.75);">A dispatch from the Union Archive</p>
            </div>
            <div style="background-color: #FFFFFF; padding: 32px;">
              <div style="font-size: 15px; line-height: 1.85; color: #1F2937;">${content}</div>
            </div>
            <div style="background-color: #C5A059; padding: 16px; text-align: center;">
              <a href="#" style="color: #FFFFFF; text-decoration: none; font-weight: 700; font-size: 14px;">Explore the Archive →</a>
            </div>
            <div style="background: #FFFFFF; border-radius: 0 0 16px 16px; padding: 20px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="font-size: 12px; font-style: italic; color: #C5A059; margin: 0;">Father of Intellectual Unionism</p>
            </div>
          </div>
        </div>
      `;
    }

    if (selectedTemplate === 'friendly') {
      return `
        <div style="font-family: -apple-system, sans-serif; background-color: #F9FAFB; padding: 48px 20px;">
          <div style="max-width: 560px; margin: 0 auto;">
            <div style="background-color: #FFFFFF; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
              <h1 style="font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 20px 0; font-family: Georgia, serif;">${subject}</h1>
              <div style="font-size: 15px; line-height: 1.85; color: #4B5563;">${content}</div>
              <p style="margin: 24px 0 0 0; font-size: 13px; color: #6B7280; font-style: italic;">— The UISU Archive Team</p>
            </div>
            <div style="background-color: #003366; border-radius: 8px; margin-top: 12px; padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 11px; font-weight: 600; color: #FFFFFF;">University of Ibadan Students' Union • Est. 1948</p>
            </div>
          </div>
        </div>
      `;
    }

    if (selectedTemplate === 'corporate') {
      return `
        <div style="font-family: Georgia, serif; background-color: #FFFFFF; padding: 32px 20px;">
          <div style="max-width: 560px; margin: 0 auto;">
            <div style="padding: 16px 0 20px; border-bottom: 2px solid #003366;">
              <span style="font-size: 18px; font-weight: 700; color: #003366;">UISU SPACE</span>
            </div>
            <div style="padding: 28px 0 20px;">
              <h1 style="font-size: 26px; font-weight: 700; color: #111827; margin: 0 0 12px 0;">${subject}</h1>
              <div style="width: 48px; height: 3px; background-color: #C5A059;"></div>
            </div>
            <div style="padding: 0 0 28px;">
              <div style="font-size: 15px; line-height: 1.85; color: #374151;">${content}</div>
            </div>
            <div style="text-align: center; padding-bottom: 28px;">
              <a href="#" style="display: inline-block; background-color: #003366; color: #FFFFFF; padding: 12px 36px; text-decoration: none; font-weight: 600; font-size: 13px;">Visit the Archive</a>
            </div>
            <div style="border-top: 1px solid #E5E7EB; padding: 20px 0; text-align: center;">
              <p style="font-size: 12px; font-style: italic; color: #C5A059; margin: 0;">Father of Intellectual Unionism</p>
            </div>
          </div>
        </div>
      `;
    }
    
    // Classic template (default)
    return `
      <div style="font-family: Georgia, serif; background-color: #F8F6F1; padding: 48px 20px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="display: flex; align-items: center; margin-bottom: 32px;">
            <div style="width: 48px; height: 48px; border: 2px solid #C5A059; border-radius: 50%; display: flex; align-items: center; justify-content: center;">${goldLogo}</div>
            <div style="margin-left: 16px;">
              <p style="font-size: 11px; color: #C5A059; text-transform: uppercase; letter-spacing: 3px; font-weight: 600; margin: 0;">The Archive Newsletter</p>
              <p style="font-size: 12px; color: #64748B; margin: 4px 0 0 0;">University of Ibadan Students' Union</p>
            </div>
          </div>
          <div style="height: 1px; background: linear-gradient(to right, transparent, #C5A059, transparent); margin-bottom: 32px;"></div>
          <h1 style="font-size: 28px; font-weight: 700; color: #0F172A; line-height: 1.2; margin: 0 0 24px 0;">${subject}</h1>
          <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; box-shadow: 0 4px 24px rgba(0,0,0,0.06); padding: 32px; margin-bottom: 32px;">
            <div style="font-size: 17px; line-height: 1.8; color: #1E293B;">${content}</div>
          </div>
          <div style="text-align: center; margin-bottom: 40px;">
            <a href="#" style="display: inline-block; background-color: #C5A059; color: #FFFFFF; padding: 16px 40px; font-weight: 600; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; text-decoration: none;">Visit the Archive</a>
          </div>
          <div style="border-top: 1px solid #E2E8F0; padding-top: 24px; text-align: center;">
            <p style="font-size: 20px; font-style: italic; color: #C5A059; margin: 0 0 8px 0;">Father of Intellectual Unionism</p>
            <p style="font-size: 12px; color: #64748B; margin: 0;">UISU Archive • Est. 1948</p>
          </div>
        </div>
      </div>
    `;
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
        image="/og/pages-screenshot/admin-dashboard.png"
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
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse">
                  <div className="h-3 bg-slate-100 rounded-full w-1/2 mb-3" />
                  <div className="h-8 bg-slate-100 rounded w-2/3" />
                </div>
              ))}
            </div>
            <TableSkeleton rows={5} />
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === "submissions" && <PendingSubmissions />}

            {activeTab === "analytics" && <AdminAnalytics />}
            {activeTab === "feedback" && <AdminFeedback />}

            {activeTab === "complaints" && (
              <div className="space-y-3">
                {adminComplaints.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <MessageSquareWarning className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No complaints have been submitted yet.</p>
                  </div>
                ) : adminComplaints.map((c) => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border p-5 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            c.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            c.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            c.status === 'dismissed' ? 'bg-muted text-muted-foreground' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>{c.status?.replace('_', ' ')}</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-0.5 bg-muted rounded-full">{c.category}</span>
                          {c.priority === 'high' && <span className="text-[10px] font-bold uppercase text-destructive">⚑ High</span>}
                          {c.is_anonymous && <span className="text-[10px] text-muted-foreground italic">Anonymous</span>}
                        </div>
                        <h3 className="text-sm font-semibold text-foreground truncate">{c.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{c.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>{new Date(c.created_at).toLocaleDateString()}</span>
                          <span>↑ {c.upvotes || 0} upvotes</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <select
                          value={c.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            await supabase.from("complaints").update({ status: newStatus }).eq("id", c.id);
                            await logAuditAction('update', 'complaints', c.id, { status: c.status }, { status: newStatus });
                            fetchData();
                            toast({ title: `Complaint ${newStatus === 'resolved' ? 'resolved' : 'updated'}` });
                          }}
                          className="text-xs bg-background border border-border px-2 py-1.5 focus:outline-none focus:border-primary"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="dismissed">Dismissed</option>
                        </select>
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {c.resolution && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground"><strong>Resolution:</strong> {c.resolution}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
            
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

            {/* Newsletter Subscribers Tab */}
            {activeTab === "newsletter" && (
              <div className="space-y-6">
                {/* Compose Newsletter Section */}
                <div className="bg-card border border-border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Send className="w-5 h-5 text-ui-blue" />
                    <h3 className="font-serif text-lg text-foreground">Compose Newsletter</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Subject</label>
                      <input
                        type="text"
                        value={composeSubject}
                        onChange={(e) => setComposeSubject(e.target.value)}
                        placeholder="e.g. UISU Archive Update - January 2026"
                        className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none"
                      />
                    </div>

                    {/* From Name */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        From name <span className="text-muted-foreground/70 normal-case font-normal">(appears as the sender)</span>
                      </label>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="UISU Archive"
                        maxLength={80}
                        className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Will appear as <strong>{(senderName.trim() || "UISU Archive")} &lt;newsletter@uisu.space&gt;</strong>
                      </p>
                    </div>

                    {/* Audience targeting */}
                    <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Send to</label>
                        <button
                          type="button"
                          onClick={() => setShowAudiencesManager(true)}
                          className="text-xs font-bold uppercase tracking-widest text-nobel-gold hover:underline"
                        >
                          + Manage Audiences
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {([
                          { id: "all", label: "All active subscribers" },
                          { id: "saved", label: "Saved audience" },
                          { id: "adhoc", label: "Custom email list" },
                        ] as const).map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setAudienceMode(opt.id)}
                            className={`p-3 border text-left text-sm transition ${
                              audienceMode === opt.id
                                ? "border-nobel-gold bg-nobel-gold/10 text-foreground"
                                : "border-border hover:border-muted-foreground text-muted-foreground"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      {audienceMode === "saved" && (
                        <select
                          value={selectedAudienceId}
                          onChange={(e) => setSelectedAudienceId(e.target.value)}
                          className="w-full px-3 py-2.5 bg-background border border-border focus:border-nobel-gold focus:outline-none text-sm"
                        >
                          <option value="">Choose an audience…</option>
                          {audiences.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name} — {a.member_count} recipient(s)
                            </option>
                          ))}
                        </select>
                      )}
                      {audienceMode === "adhoc" && (
                        <textarea
                          value={adhocEmailsText}
                          onChange={(e) => setAdhocEmailsText(e.target.value)}
                          placeholder="Paste emails separated by commas, spaces or new lines…"
                          rows={3}
                          className="w-full px-3 py-2.5 bg-background border border-border focus:border-nobel-gold focus:outline-none text-sm font-mono"
                        />
                      )}
                      <p className="text-[11px] text-muted-foreground">
                        Will be sent to <strong>{getRecipientCount()}</strong> recipient(s).
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Content</label>
                      <NewsletterRichEditor
                        value={composeContent}
                        onChange={setComposeContent}
                      />
                    </div>

                    {/* Template Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">Template Style</label>
                        <button
                          type="button"
                          onClick={() => setShowTemplatesManager(true)}
                          className="text-xs font-bold uppercase tracking-widest text-nobel-gold hover:underline"
                        >
                          + Manage Custom Templates
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { id: 'classic', name: 'Classic', desc: 'Editorial with gold accents' },
                          { id: 'minimal', name: 'Minimal', desc: 'Clean and modern' },
                          { id: 'announcement', name: 'Announcement', desc: 'Bold dark theme' },
                          { id: 'newspaper', name: 'Newspaper', desc: 'Traditional masthead' },
                          { id: 'longform', name: 'Longform', desc: 'Magazine style for essays' },
                          { id: 'telegram', name: 'Telegram', desc: 'Vintage dispatch style' },
                          { id: 'artdeco', name: 'Art Deco', desc: 'Elegant dark luxury' },
                          { id: 'blueprint', name: 'Blueprint', desc: 'Navy header, clean body' },
                          { id: 'postbox', name: 'Postbox', desc: 'Navy with gold CTA band' },
                          { id: 'friendly', name: 'Friendly', desc: 'Card with navy footer' },
                          { id: 'corporate', name: 'Corporate', desc: 'Formal serif layout' },
                        ].map((tmpl) => (
                          <button
                            key={tmpl.id}
                            type="button"
                            onClick={() => setSelectedTemplate(tmpl.id)}
                            className={`p-3 border text-left transition-all ${
                              selectedTemplate === tmpl.id 
                                ? 'border-nobel-gold bg-nobel-gold/10' 
                                : 'border-border hover:border-muted-foreground'
                            }`}
                          >
                            <p className="text-sm font-medium text-foreground">{tmpl.name}</p>
                            <p className="text-xs text-muted-foreground">{tmpl.desc}</p>
                          </button>
                        ))}
                        {customTemplates.map((tmpl) => (
                          <button
                            key={tmpl.id}
                            type="button"
                            onClick={() => setSelectedTemplate(tmpl.id)}
                            className={`p-3 border text-left transition-all relative ${
                              selectedTemplate === tmpl.id 
                                ? 'border-nobel-gold bg-nobel-gold/10' 
                                : 'border-border hover:border-muted-foreground'
                            }`}
                          >
                            <span className="absolute top-1 right-1 text-[9px] uppercase tracking-widest text-nobel-gold font-bold">Custom</span>
                            <p className="text-sm font-medium text-foreground truncate pr-12">{tmpl.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{tmpl.description || 'Custom layout'}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <NewsletterTemplatesManager
                      open={showTemplatesManager}
                      onClose={() => setShowTemplatesManager(false)}
                      onChanged={(rows) => setCustomTemplates(rows.filter((r) => r.is_active))}
                    />

                    <NewsletterAudiencesManager
                      open={showAudiencesManager}
                      onClose={() => setShowAudiencesManager(false)}
                      onChanged={(rows) => setAudiences(rows)}
                    />



                    {/* A/B Testing Section */}
                    <ABTestingSection
                      enabled={abEnabled}
                      onToggle={setAbEnabled}
                      variantA={abVariantA}
                      variantB={abVariantB}
                      onVariantAChange={setAbVariantA}
                      onVariantBChange={setAbVariantB}
                    />

                    {/* Scheduling Section */}
                    <div className="border border-border rounded-lg p-4 bg-muted/30">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Schedule for Later</p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="date"
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="flex-1 px-4 py-2.5 bg-background border border-border focus:border-nobel-gold focus:outline-none text-sm"
                        />
                        <input
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          className="px-4 py-2.5 bg-background border border-border focus:border-nobel-gold focus:outline-none text-sm"
                        />
                        <button
                          onClick={() => sendNewsletter(true)}
                          disabled={isScheduling || !composeSubject.trim() || !composeContent.trim() || !scheduleDate || !scheduleTime}
                          className="flex items-center justify-center gap-2 px-5 py-2.5 border border-nobel-gold text-nobel-gold text-xs font-bold uppercase tracking-widest hover:bg-nobel-gold hover:text-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          {isScheduling ? <Loader2 className="w-3 h-3 animate-spin" /> : <Calendar size={12} />}
                          {isScheduling ? "Scheduling..." : "Schedule"}
                        </button>
                      </div>
                    </div>

                    {/* Preview & Test Send Section */}
                    <div className="border border-border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Preview & Test</p>
                        <button
                          onClick={() => setShowPreview(!showPreview)}
                          disabled={!composeSubject.trim() && !composeContent.trim()}
                          className="flex items-center gap-2 text-xs text-ui-blue hover:text-nobel-gold transition-colors disabled:opacity-50"
                        >
                          <Eye size={14} />
                          {showPreview ? "Hide Preview" : "Show Preview"}
                        </button>
                      </div>
                      
                      {/* Email Preview */}
                      <AnimatePresence>
                        {showPreview && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 overflow-hidden"
                          >
                            <div 
                              className="border border-border rounded-lg overflow-hidden max-h-[500px] overflow-y-auto"
                              dangerouslySetInnerHTML={{ __html: generatePreviewHtml() }}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Test Send */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="email"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                          placeholder="Enter email for test send..."
                          className="flex-1 px-4 py-2.5 bg-background border border-border focus:border-nobel-gold focus:outline-none text-sm"
                        />
                        <button
                          onClick={sendTestNewsletter}
                          disabled={sendingTest || !composeSubject.trim() || !composeContent.trim() || !testEmail.trim()}
                          className="flex items-center justify-center gap-2 px-5 py-2.5 border border-ui-blue text-ui-blue text-xs font-bold uppercase tracking-widest hover:bg-ui-blue hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          {sendingTest ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail size={12} />}
                          {sendingTest ? "Sending..." : "Send Test"}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        Will be sent to <strong>{getRecipientCount()}</strong> recipient(s) from <strong>{(senderName.trim() || "UISU Archive")} &lt;newsletter@uisu.space&gt;</strong>
                      </p>
                      <button
                        onClick={() => sendNewsletter(false)}
                        disabled={sendingNewsletter || !composeSubject.trim() || !composeContent.trim()}
                        className="flex items-center gap-2 px-6 py-3 bg-ui-blue text-white text-xs font-bold uppercase tracking-widest hover:bg-nobel-gold hover:text-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingNewsletter ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={14} />}
                        {sendingNewsletter ? "Sending..." : "Send Newsletter"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Campaigns */}
                {newsletterCampaigns.length > 0 && (
                  <div className="bg-card border border-border p-6">
                    <h3 className="font-serif text-lg text-foreground mb-4">Recent Campaigns</h3>
                    <div className="space-y-3">
                      {newsletterCampaigns.slice(0, 5).map((campaign) => (
                        <div key={campaign.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                          <div className="flex-1">
                            <p className="text-sm text-foreground font-medium">{campaign.subject}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span>
                                {campaign.sent_at ? new Date(campaign.sent_at).toLocaleDateString() : 'Draft'}
                              </span>
                              <span>•</span>
                              <span>{campaign.successful_count || 0} sent</span>
                              {campaign.status === 'sent' && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Eye size={12} />
                                    {campaign.unique_opens || 0} opens ({campaign.open_count || 0} total)
                                  </span>
                                  <span>•</span>
                                  <span className="text-primary">
                                    {campaign.unique_clicks || 0} clicks
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {campaign.status === 'sent' && campaign.successful_count > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {Math.round(((campaign.unique_opens || 0) / campaign.successful_count) * 100)}% open rate
                              </span>
                            )}
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                              campaign.status === 'sent' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : campaign.status === 'scheduled'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                  : 'bg-muted text-muted-foreground'
                            }`}>
                              {campaign.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subscriber Import */}
                <SubscriberImport onImportComplete={fetchData} />

                {/* Subscribers Header with Export */}
                <div className="bg-card border border-border p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-lg text-foreground">Subscribers</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {newsletterSubscribers.filter(s => s.is_active).length} active, {newsletterSubscribers.filter(s => !s.is_active).length} unsubscribed
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const csvContent = [
                          ["Email", "Status", "Subscribed At"].join(","),
                          ...newsletterSubscribers.map(s => [
                            s.email,
                            s.is_active ? "Active" : "Unsubscribed",
                            new Date(s.subscribed_at).toLocaleDateString()
                          ].join(","))
                        ].join("\n");
                        const blob = new Blob([csvContent], { type: "text/csv" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast({ title: "Exported", description: `Exported ${newsletterSubscribers.length} subscribers to CSV.` });
                      }}
                      disabled={newsletterSubscribers.length === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-ui-blue text-white text-xs font-bold uppercase tracking-widest hover:bg-nobel-gold hover:text-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download size={14} />
                      Export CSV
                    </button>
                  </div>
                </div>

                {/* Subscribers List */}
                {newsletterSubscribers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No newsletter subscribers yet.</p>
                  </div>
                ) : (
                  <div className="bg-card border border-border overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</th>
                          <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                          <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Subscribed</th>
                          <th className="text-right px-6 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {newsletterSubscribers.map((subscriber) => (
                          <tr key={subscriber.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4">
                              <span className="text-sm text-foreground">{subscriber.email}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                                subscriber.is_active 
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                                  : "bg-muted text-muted-foreground"
                              }`}>
                                {subscriber.is_active ? "Active" : "Unsubscribed"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs text-muted-foreground">
                                {new Date(subscriber.subscribed_at).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDelete(subscriber.id)}
                                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                title="Delete subscriber"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

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