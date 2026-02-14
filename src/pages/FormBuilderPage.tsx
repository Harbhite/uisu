import { useState, useEffect, useCallback } from "react";
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
  ArrowLeft, Plus, Trash2, GripVertical, Eye, Save, Globe, Copy, Settings,
  Type, AlignLeft, ListChecks, CircleDot, ChevronDown, Calendar, Star, Upload, Hash, Mail, Phone, Link as LinkIcon, ToggleLeft
} from "lucide-react";
import { SEO } from "@/components/SEO";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";

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
  const [shareToken, setShareToken] = useState("");
  const [settings, setSettings] = useState<any>({
    require_login: false,
    one_response_per_user: false,
    show_progress: true,
    confirmation_message: "Thank you for your response!",
  });
  const [fields, setFields] = useState<FormField[]>([]);
  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (id) fetchForm();
  }, [id]);

  const fetchForm = async () => {
    const { data: form, error } = await supabase
      .from("forms")
      .select("*")
      .eq("id", id!)
      .single();

    if (error || !form) {
      toast({ title: "Form not found", variant: "destructive" });
      navigate("/forms");
      return;
    }

    setTitle(form.title);
    setDescription(form.description || "");
    setStatus(form.status);
    setShareToken(form.share_token || "");
    if (form.settings) setSettings(form.settings as any);

    const { data: fieldsData } = await supabase
      .from("form_fields")
      .select("*")
      .eq("form_id", id!)
      .order("sort_order");

    if (fieldsData) {
      setFields(fieldsData.map(f => ({
        ...f,
        options: Array.isArray(f.options) ? f.options as string[] : [],
        validation: (f.validation || {}) as Record<string, any>,
      })));
    }
  };

  const addField = (type: string) => {
    const newField: FormField = {
      field_type: type,
      label: FIELD_TYPES.find(t => t.value === type)?.label || "New Field",
      is_required: false,
      sort_order: fields.length,
      options: ["multiple_choice", "checkbox", "dropdown"].includes(type) ? ["Option 1", "Option 2"] : [],
      validation: {},
      _isNew: true,
      _tempId: crypto.randomUUID(),
    };
    setFields([...fields, newField]);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    setFields(prev => prev.map((f, i) => i === index ? { ...f, ...updates } : f));
  };

  const removeField = (index: number) => {
    setFields(prev => prev.filter((_, i) => i !== index));
  };

  const addOption = (fieldIndex: number) => {
    const field = fields[fieldIndex];
    updateField(fieldIndex, { options: [...field.options, `Option ${field.options.length + 1}`] });
  };

  const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const field = fields[fieldIndex];
    const newOptions = [...field.options];
    newOptions[optionIndex] = value;
    updateField(fieldIndex, { options: newOptions });
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const field = fields[fieldIndex];
    updateField(fieldIndex, { options: field.options.filter((_, i) => i !== optionIndex) });
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newFields = [...fields];
    const [dragged] = newFields.splice(draggedIndex, 1);
    newFields.splice(index, 0, dragged);
    setFields(newFields.map((f, i) => ({ ...f, sort_order: i })));
    setDraggedIndex(index);
  };
  const handleDragEnd = () => setDraggedIndex(null);

  const saveForm = async () => {
    setSaving(true);
    try {
      // Update form metadata
      const { error: formError } = await supabase
        .from("forms")
        .update({ title, description, settings, status })
        .eq("id", id!);

      if (formError) throw formError;

      // Delete removed fields
      const existingIds = fields.filter(f => f.id).map(f => f.id!);
      if (existingIds.length > 0) {
        await supabase.from("form_fields").delete().eq("form_id", id!).not("id", "in", `(${existingIds.join(",")})`);
      } else {
        await supabase.from("form_fields").delete().eq("form_id", id!);
      }

      // Upsert fields
      for (const [i, field] of fields.entries()) {
        const fieldData = {
          form_id: id!,
          field_type: field.field_type,
          label: field.label,
          description: field.description || null,
          placeholder: field.placeholder || null,
          is_required: field.is_required,
          sort_order: i,
          options: field.options,
          validation: field.validation,
        };

        if (field.id) {
          await supabase.from("form_fields").update(fieldData).eq("id", field.id);
        } else {
          const { data } = await supabase.from("form_fields").insert(fieldData).select().single();
          if (data) fields[i].id = data.id;
        }
      }

      toast({ title: "Form saved successfully" });
    } catch (err: any) {
      toast({ title: "Error saving form", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const togglePublish = async () => {
    const newStatus = status === "published" ? "draft" : "published";
    const { error } = await supabase.from("forms").update({ status: newStatus }).eq("id", id!);
    if (!error) {
      setStatus(newStatus);
      toast({ title: newStatus === "published" ? "Form published!" : "Form unpublished" });
    }
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/forms/s/${shareToken}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Share link copied!" });
  };

  const fieldIcon = (type: string) => {
    const ft = FIELD_TYPES.find(t => t.value === type);
    return ft ? <ft.icon className="w-4 h-4" /> : <Type className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${title} — Form Builder`} description="Build and customize your form." />

      {/* Top Bar */}
      <div className="fixed top-0 inset-x-0 z-50 bg-card border-b border-border h-16 flex items-center px-4 gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/forms")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex-1 min-w-0">
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border-none bg-transparent font-semibold text-lg h-auto p-0 focus-visible:ring-0"
            placeholder="Form title..."
          />
        </div>
        <Badge variant={status === "published" ? "default" : "secondary"} className={status === "published" ? "bg-green-100 text-green-800" : ""}>
          {status}
        </Badge>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm"><Settings className="w-4 h-4 mr-1" /> Settings</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader><SheetTitle>Form Settings</SheetTitle></SheetHeader>
            <div className="space-y-6 mt-6">
              <div>
                <Label>Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Form description..." className="mt-1" />
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
                <Textarea
                  value={settings.confirmation_message}
                  onChange={e => setSettings({ ...settings, confirmation_message: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>
        {status === "published" && (
          <Button variant="outline" size="sm" onClick={copyShareLink}>
            <Copy className="w-4 h-4 mr-1" /> Copy Link
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={togglePublish}>
          <Globe className="w-4 h-4 mr-1" /> {status === "published" ? "Unpublish" : "Publish"}
        </Button>
        <Button size="sm" onClick={saveForm} disabled={saving} className="bg-primary text-primary-foreground">
          <Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Builder Content */}
      <div className="pt-24 pb-16 max-w-3xl mx-auto px-4">
        {/* Fields */}
        <div className="space-y-4 mb-6">
          {fields.map((field, index) => (
            <Card
              key={field.id || field._tempId}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={e => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`border-border transition-all ${draggedIndex === index ? "opacity-50 scale-95" : ""}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab flex-shrink-0" />
                  <span className="text-muted-foreground flex-shrink-0">{fieldIcon(field.field_type)}</span>
                  <Input
                    value={field.label}
                    onChange={e => updateField(index, { label: e.target.value })}
                    className="border-none bg-transparent font-medium h-auto p-0 focus-visible:ring-0 flex-1"
                    placeholder="Question..."
                  />
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Label className="text-xs text-muted-foreground">Required</Label>
                    <Switch
                      checked={field.is_required}
                      onCheckedChange={v => updateField(index, { is_required: v })}
                    />
                    <Button variant="ghost" size="sm" onClick={() => removeField(index)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={field.description || ""}
                  onChange={e => updateField(index, { description: e.target.value })}
                  placeholder="Description (optional)"
                  className="text-sm text-muted-foreground"
                />
                {["short_text", "long_text", "email", "phone", "number", "url"].includes(field.field_type) && (
                  <Input
                    value={field.placeholder || ""}
                    onChange={e => updateField(index, { placeholder: e.target.value })}
                    placeholder="Placeholder text..."
                    className="text-sm"
                  />
                )}
                {["multiple_choice", "checkbox", "dropdown"].includes(field.field_type) && (
                  <div className="space-y-2 pl-4">
                    {field.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        {field.field_type === "multiple_choice" ? (
                          <CircleDot className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        ) : field.field_type === "checkbox" ? (
                          <ListChecks className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <span className="text-xs text-muted-foreground w-4 text-center flex-shrink-0">{oi + 1}</span>
                        )}
                        <Input
                          value={opt}
                          onChange={e => updateOption(index, oi, e.target.value)}
                          className="flex-1"
                        />
                        {field.options.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => removeOption(index, oi)}>
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" onClick={() => addOption(index)} className="text-primary">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add option
                    </Button>
                  </div>
                )}
                {field.field_type === "rating" && (
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className="w-6 h-6 text-accent" />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">1–5 star rating</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Field */}
        <Card className="border-dashed border-2 border-border">
          <CardContent className="py-6">
            <p className="text-sm font-medium text-muted-foreground mb-3 text-center">Add a field</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {FIELD_TYPES.map(ft => (
                <Button
                  key={ft.value}
                  variant="outline"
                  size="sm"
                  className="flex flex-col h-auto py-3 gap-1 text-xs"
                  onClick={() => addField(ft.value)}
                >
                  <ft.icon className="w-4 h-4" />
                  {ft.label}
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
