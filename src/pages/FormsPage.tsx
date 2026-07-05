import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, FileText, Users, ExternalLink, Copy, Trash2, BarChart3, Search,
  ClipboardList, UserPlus, FlaskConical, GraduationCap, LayoutTemplate, CopyPlus,
  Sparkles, TrendingUp, CheckCircle2, LogIn
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
    name: "Event Registration", description: "Collect attendee info for an upcoming event", type: "registration",
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
    name: "Waitlist Signup", description: "Simple waitlist for a launch or program", type: "waitlist",
    fields: [
      { field_type: "short_text", label: "Full Name", is_required: true, options: [], placeholder: "Your name" },
      { field_type: "email", label: "Email", is_required: true, options: [], placeholder: "your@email.com" },
      { field_type: "short_text", label: "What are you most excited about?", is_required: false, options: [], placeholder: "Tell us..." },
    ],
  },
  {
    name: "Feedback Survey", description: "Get structured feedback with ratings and comments", type: "survey",
    fields: [
      { field_type: "rating", label: "Overall Experience", is_required: true, options: [] },
      { field_type: "multiple_choice", label: "How did you hear about us?", is_required: false, options: ["Social Media", "Friend", "Flyer", "Website", "Other"] },
      { field_type: "rating", label: "How likely are you to recommend us?", is_required: false, options: [], description: "1 = Not likely, 5 = Very likely" },
      { field_type: "long_text", label: "What could we improve?", is_required: false, options: [], placeholder: "Share your thoughts..." },
    ],
  },
  {
    name: "Quiz / Online Test", description: "Multiple choice quiz or assessment", type: "test",
    fields: [
      { field_type: "short_text", label: "Student Name", is_required: true, options: [], placeholder: "Your name" },
      { field_type: "short_text", label: "Matric Number", is_required: true, options: [], placeholder: "e.g. 2023/12345" },
      { field_type: "multiple_choice", label: "Q1: What is the capital of Nigeria?", is_required: true, options: ["Lagos", "Abuja", "Port Harcourt", "Ibadan"] },
    ],
  },
  {
    name: "Contact Form", description: "Simple contact/inquiry form", type: "form",
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
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    fetchForms();
  }, [authLoading, user]);

  const fetchForms = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) setForms(data);
    setLoading(false);
  };

  const createFormFromTemplate = async (template: FormTemplate) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("forms")
      .insert({ title: template.name, description: template.description, created_by: user.id, form_type: template.type })
      .select().single();
    if (error || !data) { toast({ title: "Error creating form", variant: "destructive" }); return; }
    const fieldsToInsert = template.fields.map((f, i) => ({
      form_id: data.id, field_type: f.field_type, label: f.label, is_required: f.is_required,
      sort_order: i, options: f.options, placeholder: f.placeholder || null,
      description: f.description || null, validation: {},
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
      .select().single();
    if (error || !data) { toast({ title: "Error creating form", variant: "destructive" }); return; }
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

  const duplicateForm = async (formId: string) => {
    if (!user) return;
    const original = forms.find(f => f.id === formId);
    if (!original) return;
    const { data: newForm, error } = await supabase
      .from("forms")
      .insert({
        title: `${original.title} (Copy)`, description: original.description,
        created_by: user.id, form_type: original.form_type || "form",
        settings: original.settings, accent_color: original.accent_color,
      }).select().single();
    if (error || !newForm) { toast({ title: "Error duplicating form", variant: "destructive" }); return; }
    const { data: originalFields } = await supabase.from("form_fields").select("*").eq("form_id", formId).order("sort_order");
    if (originalFields && originalFields.length > 0) {
      const newFields = originalFields.map(f => ({
        form_id: newForm.id, field_type: f.field_type, label: f.label, description: f.description,
        placeholder: f.placeholder, is_required: f.is_required, sort_order: f.sort_order,
        options: f.options, validation: f.validation, conditions: (f as any).conditions,
      }));
      await supabase.from("form_fields").insert(newFields as any);
    }
    toast({ title: "Form duplicated!" });
    fetchForms();
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

  const stats = useMemo(() => ({
    total: forms.length,
    published: forms.filter(f => f.status === "published").length,
    responses: forms.reduce((sum, f) => sum + (f.response_count || 0), 0),
  }), [forms]);

  // Signed-out gate
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} user={user} handleLogout={handleLogout} />
        <main className="container mx-auto px-4 pt-28 pb-16 text-center animate-fade-in">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6 animate-scale-in">
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Sign in to build forms</h1>
            <p className="text-muted-foreground mb-6">Create surveys, waitlists, quizzes and registrations — track every response in real time.</p>
            <Button onClick={() => navigate("/auth")} size="lg" className="bg-primary text-primary-foreground hover-scale">
              <LogIn className="w-4 h-4 mr-2" /> Sign in to continue
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Forms — UISU SPACE" description="Create and manage forms, surveys, waitlists and registrations. Track responses with analytics." />
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} user={user} handleLogout={handleLogout} />

      {/* Hero — optimized */}
      <section className="border-b border-border/60 bg-background">
        <div className="container mx-auto px-4 pt-20 pb-6">
          {/* Header with title and button */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in mb-5">
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 text-primary text-xs font-medium mb-2 animate-scale-in">
                <Sparkles className="w-3.5 h-3.5" /> Your forms workspace
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground tracking-tight">
                Build. Share. <span className="text-primary">Measure.</span>
              </h1>
            </div>
            <Button
              onClick={() => setShowTemplates(true)}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover-scale group w-full md:w-auto"
            >
              <Plus className="w-4 h-4 mr-2 transition-transform group-hover:rotate-90" /> New Form
            </Button>
          </div>

          {/* Description and stats in one row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-muted-foreground text-sm flex-1">
              Surveys, waitlists, registrations & quizzes — with live analytics.
            </p>
            
            {/* Stat cards — compact inline */}
            <div className="flex gap-2 md:gap-3">
              {[
                { label: "Total forms", value: stats.total, icon: FileText },
                { label: "Published", value: stats.published, icon: CheckCircle2 },
                { label: "Responses", value: stats.responses, icon: TrendingUp },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className="rounded-lg bg-muted/50 px-3 py-2 md:px-4 md:py-3 animate-fade-in hover:bg-muted/70 transition-colors flex flex-col items-center justify-center min-w-max"
                  style={{ animationDelay: `${i * 80}ms` }}
                  title={s.label}
                >
                  <s.icon className="w-3.5 h-3.5 text-muted-foreground mb-1" />
                  <div className="text-lg md:text-xl font-serif font-bold text-foreground tabular-nums">{s.value}</div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-10">
        {/* Type Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-5">
          <TabsList className="flex-wrap h-auto gap-1 bg-muted/50">
            <TabsTrigger value="all" className="transition-all data-[state=active]:shadow-sm">All</TabsTrigger>
            {FORM_TYPES.map(t => (
              <TabsTrigger key={t.value} value={t.value} className="gap-1 transition-all data-[state=active]:shadow-sm">
                <t.icon className="w-3.5 h-3.5" /> {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative mb-6 max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input placeholder="Search your forms..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
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
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4 animate-scale-in">
              <FileText className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {search || activeTab !== "all" ? "No forms match your filters" : "Your first form awaits"}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              {search ? "Try a different search term." : "Start from a template or a blank canvas — takes under a minute."}
            </p>
            {!search && (
              <Button onClick={() => setShowTemplates(true)} className="bg-primary text-primary-foreground hover-scale">
                <Plus className="w-4 h-4 mr-2" /> Create your first form
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((form, idx) => {
              const typeInfo = getTypeInfo(form.form_type || "form");
              const TypeIcon = typeInfo.icon;
              return (
                <Card
                  key={form.id}
                  className="group border-border/60 hover:border-primary/40 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-fade-in overflow-hidden"
                  style={{ animationDelay: `${Math.min(idx * 50, 400)}ms` }}
                >
                  <div className="h-0.5 w-full bg-primary/0 group-hover:bg-primary/60 transition-colors" />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`p-2 rounded-lg bg-muted transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                          <TypeIcon className={`w-4 h-4 ${typeInfo.color}`} />
                        </div>
                        <CardTitle className="text-lg font-semibold text-foreground line-clamp-1">
                          {form.title}
                        </CardTitle>
                      </div>
                      <Badge variant={form.status === "published" ? "default" : "secondary"} className="flex-shrink-0">
                        {form.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    {form.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{form.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium">
                        <Users className="w-3.5 h-3.5" /> {form.response_count || 0}
                      </span>
                      <Badge variant="outline" className="text-xs">{typeInfo.label}</Badge>
                      <span className="text-xs ml-auto">{format(new Date(form.created_at), "MMM d")}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" asChild className="hover-scale">
                      <Link to={`/forms/edit/${form.id}`}><FileText className="w-3.5 h-3.5 mr-1" /> Edit</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="hover-scale">
                      <Link to={`/forms/responses/${form.id}`}><BarChart3 className="w-3.5 h-3.5 mr-1" /> Metrics</Link>
                    </Button>
                    {form.status === "published" && form.share_token && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => copyShareLink(form.share_token)} className="hover-scale">
                          <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                        </Button>
                        <Button variant="outline" size="sm" asChild className="hover-scale">
                          <Link to={`/forms/s/${form.share_token}`} target="_blank">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm" onClick={() => duplicateForm(form.id)} title="Duplicate" className="hover-scale">
                      <CopyPlus className="w-3.5 h-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto">
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

          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Start blank</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FORM_TYPES.map((t, i) => (
                <Button
                  key={t.value}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 text-xs hover-scale hover:border-primary/40 animate-fade-in"
                  style={{ animationDelay: `${i * 40}ms` }}
                  onClick={() => createBlankForm(t.value)}
                >
                  <t.icon className={`w-5 h-5 ${t.color}`} />
                  Blank {t.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Templates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TEMPLATES.map((tpl, i) => {
                const typeInfo = getTypeInfo(tpl.type);
                const TypeIcon = typeInfo.icon;
                return (
                  <Card
                    key={i}
                    className="cursor-pointer hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300 border-border animate-fade-in"
                    style={{ animationDelay: `${i * 50}ms` }}
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
