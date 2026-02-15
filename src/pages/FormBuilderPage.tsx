import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, Plus, Trash2, GripVertical, Save, Globe, Copy, Settings,
  Type, AlignLeft, ListChecks, CircleDot, ChevronDown, Calendar, Star, Upload, Hash, Mail, Phone, Link as LinkIcon, ToggleLeft, Palette
} from "lucide-react";
import { SEO } from "@/components/SEO";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { FORM_TEMPLATES_INFO } from "@/components/forms/FormSubmitTemplates";

const FIELD_TYPES = [
  { value: "short_text", label: "Short Text", icon: Type },
  { value: "long_text", label: "Long Text", icon: AlignLeft },
  { value: "email", label: "Email", icon: Mail },
  { value: "phone", label: "Phone", icon: Phone },
  { value: "number", label: "Number", icon: Hash },
  { value: "url", label: "URL", icon: LinkIcon },
  { value: "multiple_choice", label: "Multiple Choice", icon: CircleDot },
  { value: "checkbox", label: "Checkboxes", icon: ListChecks },
  { value: "dropdown", label: "Dropdown", icon: ChevronDown },
  { value: "date", label: "Date", icon: Calendar },
  { value: "rating", label: "Rating", icon: Star },
  { value: "file_upload", label: "File Upload", icon: Upload },
  { value: "yes_no", label: "Yes / No", icon: ToggleLeft },
];

interface FormField {
  id?: string;
  field_type: string;
  label: string;
  description?: string;
  placeholder?: string;
  is_required: boolean;
  sort_order: number;
  options: string[];
  validation: Record<string, any>;
  _isNew?: boolean;
  _tempId?: string;
}

const FormBuilderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("Untitled Form");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("draft");
  const [formType, setFormType] = useState("form");
  const [shareToken, setShareToken] = useState("");
  const [settings, setSettings] = useState<any>({
    require_login: false,
    one_response_per_user: false,
    show_progress: true,
    confirmation_message: "Thank you for your response!",
    template: "classic",
  });
  const [fields, setFields] = useState<FormField[]>([]);
  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => { if (id) fetchForm(); }, [id]);

  const fetchForm = async () => {
    const { data: form, error } = await supabase.from("forms").select("*").eq("id", id!).single();
    if (error || !form) { toast({ title: "Form not found", variant: "destructive" }); navigate("/forms"); return; }
    setTitle(form.title);
    setDescription(form.description || "");
    setStatus(form.status);
    setFormType(form.form_type || "form");
    setShareToken(form.share_token || "");
    if (form.settings) setSettings({ template: "classic", ...(form.settings as any) });

    const { data: fieldsData } = await supabase.from("form_fields").select("*").eq("form_id", id!).order("sort_order");
    if (fieldsData) {
      setFields(fieldsData.map(f => ({
        ...f, options: Array.isArray(f.options) ? f.options as string[] : [],
        validation: (f.validation || {}) as Record<string, any>,
      })));
    }
  };

  const addField = (type: string) => {
    setFields([...fields, {
      field_type: type,
      label: FIELD_TYPES.find(t => t.value === type)?.label || "New Field",
      is_required: false, sort_order: fields.length,
      options: ["multiple_choice", "checkbox", "dropdown"].includes(type) ? ["Option 1", "Option 2"] : [],
      validation: {}, _isNew: true, _tempId: crypto.randomUUID(),
    }]);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    setFields(prev => prev.map((f, i) => i === index ? { ...f, ...updates } : f));
  };

  const removeField = (index: number) => setFields(prev => prev.filter((_, i) => i !== index));

  const addOption = (fi: number) => {
    const f = fields[fi];
    updateField(fi, { options: [...f.options, `Option ${f.options.length + 1}`] });
  };
  const updateOption = (fi: number, oi: number, value: string) => {
    const opts = [...fields[fi].options]; opts[oi] = value;
    updateField(fi, { options: opts });
  };
  const removeOption = (fi: number, oi: number) => updateField(fi, { options: fields[fi].options.filter((_, i) => i !== oi) });

  const handleDragStart = (i: number) => setDraggedIndex(i);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const nf = [...fields]; const [d] = nf.splice(draggedIndex, 1); nf.splice(index, 0, d);
    setFields(nf.map((f, i) => ({ ...f, sort_order: i }))); setDraggedIndex(index);
  };
  const handleDragEnd = () => setDraggedIndex(null);

  const saveForm = async () => {
    setSaving(true);
    try {
      const { error: formError } = await supabase.from("forms").update({ title, description, settings, status, form_type: formType }).eq("id", id!);
      if (formError) throw formError;

      const existingIds = fields.filter(f => f.id).map(f => f.id!);
      if (existingIds.length > 0) await supabase.from("form_fields").delete().eq("form_id", id!).not("id", "in", `(${existingIds.join(",")})`);
      else await supabase.from("form_fields").delete().eq("form_id", id!);

      for (const [i, field] of fields.entries()) {
        const fd = {
          form_id: id!, field_type: field.field_type, label: field.label,
          description: field.description || null, placeholder: field.placeholder || null,
          is_required: field.is_required, sort_order: i, options: field.options, validation: field.validation,
        };
        if (field.id) await supabase.from("form_fields").update(fd).eq("id", field.id);
        else { const { data } = await supabase.from("form_fields").insert(fd).select().single(); if (data) fields[i].id = data.id; }
      }
      toast({ title: "Form saved successfully" });
    } catch (err: any) { toast({ title: "Error saving form", description: err.message, variant: "destructive" }); }
    setSaving(false);
  };

  const togglePublish = async () => {
    const ns = status === "published" ? "draft" : "published";
    const { error } = await supabase.from("forms").update({ status: ns }).eq("id", id!);
    if (!error) { setStatus(ns); toast({ title: ns === "published" ? "Form published!" : "Form unpublished" }); }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/forms/s/${shareToken}`);
    toast({ title: "Share link copied!" });
  };

  const fieldIcon = (type: string) => { const ft = FIELD_TYPES.find(t => t.value === type); return ft ? <ft.icon className="w-4 h-4" /> : <Type className="w-4 h-4" />; };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${title} — Form Builder`} description="Build and customize your form." />

      {/* Top Bar — mobile responsive */}
      <div className="fixed top-0 inset-x-0 z-50 bg-card border-b border-border">
        {/* Row 1: back, title, status */}
        <div className="flex items-center px-3 sm:px-4 h-14 gap-2">
          <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8" onClick={() => navigate("/forms")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <Input
              value={title} onChange={e => setTitle(e.target.value)}
              className="border-none bg-transparent font-semibold text-base sm:text-lg h-auto p-0 focus-visible:ring-0 truncate"
              placeholder="Form title..."
            />
          </div>
          <Badge variant={status === "published" ? "default" : "secondary"} className={`flex-shrink-0 text-xs ${status === "published" ? "bg-green-100 text-green-800" : ""}`}>
            {status}
          </Badge>
        </div>
        {/* Row 2: actions — scrollable on mobile */}
        <div className="flex items-center gap-2 px-3 sm:px-4 pb-2 overflow-x-auto scrollbar-hide">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex-shrink-0 text-xs"><Settings className="w-3.5 h-3.5 mr-1" /> Settings</Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[90vw] sm:w-[400px]">
              <SheetHeader><SheetTitle>Form Settings</SheetTitle></SheetHeader>
              <div className="space-y-6 mt-6">
                <div>
                  <Label>Description</Label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Form description..." className="mt-1" />
                </div>
                <div>
                  <Label>Form Type</Label>
                  <Select value={formType} onValueChange={setFormType}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="form">Form</SelectItem>
                      <SelectItem value="waitlist">Waitlist</SelectItem>
                      <SelectItem value="survey">Survey</SelectItem>
                      <SelectItem value="registration">Registration</SelectItem>
                      <SelectItem value="test">Online Test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="flex items-center gap-2"><Palette className="w-4 h-4" /> Submission Template</Label>
                  <p className="text-xs text-muted-foreground mt-1 mb-2">Choose how the form looks for respondents</p>
                  <div className="grid grid-cols-1 gap-2">
                    {FORM_TEMPLATES_INFO.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setSettings({ ...settings, template: t.value })}
                        className={`text-left p-3 rounded-lg border transition-colors ${
                          settings.template === t.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <span className="text-sm font-medium text-foreground">{t.label}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Require login to submit</Label>
                  <Switch checked={settings.require_login} onCheckedChange={v => setSettings({ ...settings, require_login: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>One response per user</Label>
                  <Switch checked={settings.one_response_per_user} onCheckedChange={v => setSettings({ ...settings, one_response_per_user: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show progress bar</Label>
                  <Switch checked={settings.show_progress} onCheckedChange={v => setSettings({ ...settings, show_progress: v })} />
                </div>
                <div>
                  <Label>Confirmation message</Label>
                  <Textarea value={settings.confirmation_message} onChange={e => setSettings({ ...settings, confirmation_message: e.target.value })} className="mt-1" />
                </div>
              </div>
            </SheetContent>
          </Sheet>
          {status === "published" && (
            <Button variant="outline" size="sm" className="flex-shrink-0 text-xs" onClick={copyShareLink}>
              <Copy className="w-3.5 h-3.5 mr-1" /> Link
            </Button>
          )}
          <Button variant="outline" size="sm" className="flex-shrink-0 text-xs" onClick={togglePublish}>
            <Globe className="w-3.5 h-3.5 mr-1" /> {status === "published" ? "Unpublish" : "Publish"}
          </Button>
          <Button size="sm" onClick={saveForm} disabled={saving} className="flex-shrink-0 text-xs bg-primary text-primary-foreground">
            <Save className="w-3.5 h-3.5 mr-1" /> {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Builder Content */}
      <div className="pt-28 sm:pt-24 pb-16 max-w-3xl mx-auto px-3 sm:px-4">
        {/* Fields */}
        <div className="space-y-3 sm:space-y-4 mb-6">
          {fields.map((field, index) => (
            <Card
              key={field.id || field._tempId}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={e => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`border-border transition-all ${draggedIndex === index ? "opacity-50 scale-95" : ""}`}
            >
              <CardHeader className="pb-2 px-3 sm:px-6">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab flex-shrink-0 hidden sm:block" />
                  <span className="text-muted-foreground flex-shrink-0">{fieldIcon(field.field_type)}</span>
                  <Input
                    value={field.label} onChange={e => updateField(index, { label: e.target.value })}
                    className="border-none bg-transparent font-medium h-auto p-0 focus-visible:ring-0 flex-1 text-sm sm:text-base"
                    placeholder="Question..."
                  />
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <Label className="text-xs text-muted-foreground hidden sm:inline">Required</Label>
                    <Switch checked={field.is_required} onCheckedChange={v => updateField(index, { is_required: v })} />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeField(index)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 px-3 sm:px-6">
                <Input value={field.description || ""} onChange={e => updateField(index, { description: e.target.value })} placeholder="Description (optional)" className="text-sm text-muted-foreground" />
                {["short_text", "long_text", "email", "phone", "number", "url"].includes(field.field_type) && (
                  <Input value={field.placeholder || ""} onChange={e => updateField(index, { placeholder: e.target.value })} placeholder="Placeholder text..." className="text-sm" />
                )}
                {["multiple_choice", "checkbox", "dropdown"].includes(field.field_type) && (
                  <div className="space-y-2 pl-2 sm:pl-4">
                    {field.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        {field.field_type === "multiple_choice" ? <CircleDot className="w-4 h-4 text-muted-foreground flex-shrink-0" /> :
                         field.field_type === "checkbox" ? <ListChecks className="w-4 h-4 text-muted-foreground flex-shrink-0" /> :
                         <span className="text-xs text-muted-foreground w-4 text-center flex-shrink-0">{oi + 1}</span>}
                        <Input value={opt} onChange={e => updateOption(index, oi, e.target.value)} className="flex-1" />
                        {field.options.length > 1 && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeOption(index, oi)}>
                            <Trash2 className="w-3 h-3 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" onClick={() => addOption(index)} className="text-primary text-xs">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add option
                    </Button>
                  </div>
                )}
                {field.field_type === "rating" && (
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-6 h-6 text-accent" />)}
                    <span className="text-sm text-muted-foreground ml-2">1–5 star rating</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Field — responsive grid */}
        <Card className="border-dashed border-2 border-border">
          <CardContent className="py-4 sm:py-6">
            <p className="text-sm font-medium text-muted-foreground mb-3 text-center">Add a field</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 sm:gap-2">
              {FIELD_TYPES.map(ft => (
                <Button key={ft.value} variant="outline" size="sm"
                  className="flex flex-col h-auto py-2 sm:py-3 gap-0.5 sm:gap-1 text-[10px] sm:text-xs px-1 sm:px-2"
                  onClick={() => addField(ft.value)}
                >
                  <ft.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="leading-tight text-center">{ft.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormBuilderPage;
