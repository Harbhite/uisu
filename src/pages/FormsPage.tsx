import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, FileText, Users, ExternalLink, Copy, Trash2, BarChart3, Search,
  ClipboardList, UserPlus, FlaskConical, GraduationCap, LayoutTemplate, ShieldAlert
} from "lucide-react";
import { format } from "date-fns";
import { SEO } from "@/components/SEO";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

const FORM_TYPES = [
  { value: "form", label: "Form", icon: FileText, color: "text-primary", description: "General purpose form for collecting information" },
  { value: "waitlist", label: "Waitlist", icon: UserPlus, color: "text-green-600", description: "Collect signups for events, launches or programs" },
  { value: "survey", label: "Survey", icon: FlaskConical, color: "text-purple-600", description: "Gather feedback and opinions with analytics" },
  { value: "registration", label: "Registration", icon: ClipboardList, color: "text-blue-600", description: "Event or program registration with custom fields" },
  { value: "test", label: "Online Test", icon: GraduationCap, color: "text-orange-600", description: "Quizzes and assessments with multiple choice" },
];

interface FormTemplate {
  name: string;
  description: string;
  type: string;
  fields: { field_type: string; label: string; is_required: boolean; options: string[]; placeholder?: string; description?: string }[];
}

const TEMPLATES: FormTemplate[] = [
  {
    name: "Event Registration",
    description: "Collect attendee info for an upcoming event",
    type: "registration",
    fields: [
      { field_type: "short_text", label: "Full Name", is_required: true, options: [], placeholder: "Enter your full name" },
      { field_type: "email", label: "Email Address", is_required: true, options: [], placeholder: "you@example.com" },
      { field_type: "phone", label: "Phone Number", is_required: false, options: [], placeholder: "+234..." },
      { field_type: "dropdown", label: "Faculty", is_required: true, options: ["Arts", "Education", "Law", "Sciences", "Social Sciences", "Technology", "Health Sciences", "Management Sciences"] },
      { field_type: "dropdown", label: "Level", is_required: true, options: ["100", "200", "300", "400", "500", "Postgraduate"] },
      { field_type: "yes_no", label: "Have you attended before?", is_required: false, options: [] },
    ],
  },
  {
    name: "Waitlist Signup",
    description: "Simple waitlist for a launch or program",
    type: "waitlist",
    fields: [
      { field_type: "short_text", label: "Full Name", is_required: true, options: [], placeholder: "Your name" },
      { field_type: "email", label: "Email", is_required: true, options: [], placeholder: "your@email.com" },
      { field_type: "short_text", label: "What are you most excited about?", is_required: false, options: [], placeholder: "Tell us..." },
    ],
  },
  {
    name: "Feedback Survey",
    description: "Get structured feedback with ratings and comments",
    type: "survey",
    fields: [
      { field_type: "rating", label: "Overall Experience", is_required: true, options: [] },
      { field_type: "multiple_choice", label: "How did you hear about us?", is_required: false, options: ["Social Media", "Friend", "Flyer", "Website", "Other"] },
      { field_type: "rating", label: "How likely are you to recommend us?", is_required: false, options: [], description: "1 = Not likely, 5 = Very likely" },
      { field_type: "long_text", label: "What could we improve?", is_required: false, options: [], placeholder: "Share your thoughts..." },
      { field_type: "long_text", label: "Any other comments?", is_required: false, options: [], placeholder: "Optional feedback..." },
    ],
  },
  {
    name: "Quiz / Online Test",
    description: "Multiple choice quiz or assessment",
    type: "test",
    fields: [
      { field_type: "short_text", label: "Student Name", is_required: true, options: [], placeholder: "Your name" },
      { field_type: "short_text", label: "Matric Number", is_required: true, options: [], placeholder: "e.g. 2023/12345" },
      { field_type: "multiple_choice", label: "Question 1: What is the capital of Nigeria?", is_required: true, options: ["Lagos", "Abuja", "Port Harcourt", "Ibadan"] },
      { field_type: "multiple_choice", label: "Question 2: Which year was UNILAG founded?", is_required: true, options: ["1960", "1962", "1965", "1970"] },
    ],
  },
  {
    name: "Contact Form",
    description: "Simple contact/inquiry form",
    type: "form",
    fields: [
      { field_type: "short_text", label: "Name", is_required: true, options: [], placeholder: "Your name" },
      { field_type: "email", label: "Email", is_required: true, options: [], placeholder: "your@email.com" },
      { field_type: "dropdown", label: "Subject", is_required: true, options: ["General Inquiry", "Complaint", "Suggestion", "Partnership", "Other"] },
      { field_type: "long_text", label: "Message", is_required: true, options: [], placeholder: "Write your message..." },
    ],
  },
];

const getTypeInfo = (type: string) => FORM_TYPES.find(t => t.value === type) || FORM_TYPES[0];

const FormsPage = () => {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showTemplates, setShowTemplates] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isStaff, loading: roleLoading } = useAdminCheck();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!roleLoading && isStaff) fetchForms();
    if (!roleLoading && !isStaff) setLoading(false);
  }, [roleLoading, isStaff]);

  const fetchForms = async () => {
    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setForms(data);
    setLoading(false);
  };

  const createFormFromTemplate = async (template: FormTemplate) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("forms")
      .insert({ title: template.name, description: template.description, created_by: user.id, form_type: template.type })
      .select()
      .single();
    if (error || !data) {
      toast({ title: "Error creating form", variant: "destructive" });
      return;
    }
    // Insert template fields
    const fieldsToInsert = template.fields.map((f, i) => ({
      form_id: data.id,
      field_type: f.field_type,
      label: f.label,
      is_required: f.is_required,
      sort_order: i,
      options: f.options,
      placeholder: f.placeholder || null,
      description: f.description || null,
      validation: {},
    }));
    await supabase.from("form_fields").insert(fieldsToInsert);
    setShowTemplates(false);
    navigate(`/forms/edit/${data.id}`);
  };

  const createBlankForm = async (type: string) => {
    if (!user) return;
    const typeInfo = getTypeInfo(type);
    const { data, error } = await supabase
      .from("forms")
      .insert({ title: `Untitled ${typeInfo.label}`, created_by: user.id, form_type: type })
      .select()
      .single();
    if (error || !data) {
      toast({ title: "Error creating form", variant: "destructive" });
      return;
    }
    setShowTemplates(false);
    navigate(`/forms/edit/${data.id}`);
  };

  const deleteForm = async (id: string) => {
    const { error } = await supabase.from("forms").delete().eq("id", id);
    if (!error) {
      setForms(forms.filter(f => f.id !== id));
      toast({ title: "Form deleted" });
    }
  };

  const copyShareLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/forms/s/${token}`);
    toast({ title: "Link copied to clipboard" });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const filtered = forms.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all" || (f.form_type || "form") === activeTab;
    return matchesSearch && matchesTab;
  });

  // Staff gate
  if (!roleLoading && !isStaff) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} user={user} handleLogout={handleLogout} />
        <main className="container mx-auto px-4 pt-28 pb-16 text-center">
          <ShieldAlert className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Staff Only</h1>
          <p className="text-muted-foreground mb-6">Only staff members can create and manage forms.</p>
          <Button onClick={() => navigate("/auth")} variant="outline">Sign In</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Forms — UISU Archive" description="Create and manage forms, surveys, waitlists and registrations." />
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} user={user} handleLogout={handleLogout} />

      <main className="container mx-auto px-4 pt-28 pb-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Forms</h1>
            <p className="text-muted-foreground mt-1">Create surveys, waitlists, registrations & more.</p>
          </div>
          <Button onClick={() => setShowTemplates(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> New Form
          </Button>
        </div>

        {/* Type Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="all">All</TabsTrigger>
            {FORM_TYPES.map(t => (
              <TabsTrigger key={t.value} value={t.value} className="gap-1">
                <t.icon className="w-3.5 h-3.5" /> {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search forms..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader><div className="h-5 bg-muted rounded w-3/4" /></CardHeader>
                <CardContent><div className="h-4 bg-muted rounded w-1/2" /></CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {search || activeTab !== "all" ? "No forms found" : "No forms yet"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {search ? "Try a different search term." : "Create your first form to start collecting responses."}
            </p>
            {!search && (
              <Button onClick={() => setShowTemplates(true)} className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" /> Create Form
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(form => {
              const typeInfo = getTypeInfo(form.form_type || "form");
              const TypeIcon = typeInfo.icon;
              return (
                <Card key={form.id} className="border-border hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <TypeIcon className={`w-4 h-4 flex-shrink-0 ${typeInfo.color}`} />
                        <CardTitle className="text-lg font-semibold text-foreground line-clamp-1">
                          {form.title}
                        </CardTitle>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <Badge variant="outline" className="text-xs">{typeInfo.label}</Badge>
                        <Badge variant={form.status === "published" ? "default" : "secondary"}>
                          {form.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    {form.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{form.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {form.response_count || 0} responses
                      </span>
                      <span>{format(new Date(form.created_at), "MMM d, yyyy")}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/forms/edit/${form.id}`}><FileText className="w-3.5 h-3.5 mr-1" /> Edit</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/forms/responses/${form.id}`}><BarChart3 className="w-3.5 h-3.5 mr-1" /> Responses</Link>
                    </Button>
                    {form.status === "published" && form.share_token && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => copyShareLink(form.share_token)}>
                          <Copy className="w-3.5 h-3.5 mr-1" /> Copy Link
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/forms/s/${form.share_token}`} target="_blank">
                            <ExternalLink className="w-3.5 h-3.5 mr-1" /> Preview
                          </Link>
                        </Button>
                      </>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete form?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this form and all its responses.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteForm(form.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><LayoutTemplate className="w-5 h-5" /> Create a New Form</DialogTitle>
            <DialogDescription>Start from a template or create a blank form.</DialogDescription>
          </DialogHeader>

          {/* Blank form options */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Start blank</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FORM_TYPES.map(t => (
                <Button
                  key={t.value}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 text-xs"
                  onClick={() => createBlankForm(t.value)}
                >
                  <t.icon className={`w-5 h-5 ${t.color}`} />
                  Blank {t.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Templates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TEMPLATES.map((tpl, i) => {
                const typeInfo = getTypeInfo(tpl.type);
                const TypeIcon = typeInfo.icon;
                return (
                  <Card
                    key={i}
                    className="cursor-pointer hover:shadow-md transition-shadow border-border"
                    onClick={() => createFormFromTemplate(tpl)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <TypeIcon className={`w-4 h-4 ${typeInfo.color}`} />
                        <CardTitle className="text-sm">{tpl.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-xs text-muted-foreground">{tpl.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{typeInfo.label}</Badge>
                        <span className="text-xs text-muted-foreground">{tpl.fields.length} fields</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default FormsPage;
