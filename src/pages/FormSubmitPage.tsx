import { useState, useEffect, ReactNode, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, FileText, Clock, AlertTriangle, Upload, X, Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import {
  ClassicTemplate, NewsletterTemplate, AdminTemplate, MinimalTemplate, ElegantTemplate,
  SuccessScreen, ErrorScreen,
} from "@/components/forms/FormSubmitTemplates";

const FileUploadField = ({ fieldId, value, onChange }: { fieldId: string; value: string | null; onChange: (url: string | null) => void }) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert("File must be under 10MB"); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${fieldId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("form-uploads").upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("form-uploads").getPublicUrl(path);
      onChange(publicUrl);
      setFileName(file.name);
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => { onChange(null); setFileName(null); };

  if (value) {
    return (
      <div className="flex items-center gap-2 p-3 bg-muted/50 border border-border rounded-sm">
        <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <span className="text-sm text-foreground truncate flex-1">{fileName || "Uploaded file"}</span>
        <button type="button" onClick={handleRemove} className="p-1 hover:bg-destructive/10 rounded-sm"><X className="w-4 h-4 text-destructive" /></button>
      </div>
    );
  }

  return (
    <label className="border-2 border-dashed border-border rounded-sm p-6 text-center cursor-pointer hover:border-primary/40 transition-colors block">
      {uploading ? (
        <Loader2 className="w-8 h-8 mx-auto text-muted-foreground mb-2 animate-spin" />
      ) : (
        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
      )}
      <p className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Click to upload a file (max 10MB)"}</p>
      <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
    </label>
  );
};

const FormSubmitPage = () => {
  const { token } = useParams();
  const { toast } = useToast();
  const [form, setForm] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [respondentEmail, setRespondentEmail] = useState("");
  const [respondentName, setRespondentName] = useState("");

  useEffect(() => { fetchForm(); }, [token]);

  const fetchForm = async () => {
    const { data: forms, error: formError } = await supabase
      .from("forms").select("*").eq("share_token", token!).eq("status", "published").limit(1);
    if (formError || !forms || forms.length === 0) { setError("This form is not available."); setLoading(false); return; }
    const form = forms[0];

    // Check scheduled availability
    const now = new Date();
    if ((form as any).opens_at && new Date((form as any).opens_at) > now) {
      setError("This form is not yet open for submissions.");
      setLoading(false);
      return;
    }
    if ((form as any).closes_at && new Date((form as any).closes_at) < now) {
      setError("This form is closed.");
      setLoading(false);
      return;
    }
    // Check max responses
    if ((form as any).max_responses && (form.response_count || 0) >= (form as any).max_responses) {
      setError("This form has reached the maximum number of responses.");
      setLoading(false);
      return;
    }

    setForm(form);
    const { data: fieldsData } = await supabase.from("form_fields").select("*").eq("form_id", form.id).order("sort_order");
    if (fieldsData) setFields(fieldsData);
    setLoading(false);
  };

  const updateResponse = (fieldId: string, value: any) => setResponses(prev => ({ ...prev, [fieldId]: value }));

  const toggleCheckbox = (fieldId: string, option: string) => {
    const current = responses[fieldId] || [];
    updateResponse(fieldId, current.includes(option) ? current.filter((o: string) => o !== option) : [...current, option]);
  };

  // Conditional logic: determine which fields are visible
  const visibleFields = useMemo(() => {
    return fields.filter(field => {
      const conditions = (field as any).conditions;
      if (!conditions || !conditions.field_id) return true;
      const sourceValue = responses[conditions.field_id];
      switch (conditions.operator) {
        case "equals":
          return String(sourceValue) === String(conditions.value);
        case "not_equals":
          return String(sourceValue) !== String(conditions.value);
        case "contains":
          if (Array.isArray(sourceValue)) return sourceValue.includes(conditions.value);
          return String(sourceValue || "").includes(String(conditions.value));
        case "is_answered":
          return sourceValue !== undefined && sourceValue !== null && sourceValue !== "" && (!Array.isArray(sourceValue) || sourceValue.length > 0);
        default:
          return true;
      }
    });
  }, [fields, responses]);

  const validate = (): boolean => {
    for (const field of visibleFields) {
      if (field.is_required) {
        const val = responses[field.id];
        if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
          toast({ title: `"${field.label}" is required`, variant: "destructive" });
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const { error: submitError } = await supabase.from("form_responses").insert({
      form_id: form.id, respondent_email: respondentEmail || null, respondent_name: respondentName || null, data: responses,
    });
    if (submitError) { toast({ title: "Submission failed", description: submitError.message, variant: "destructive" }); setSubmitting(false); return; }

    // Send staff notification if enabled
    if ((form as any).notify_on_submit && ((form as any).notify_emails || []).length > 0) {
      try {
        await supabase.functions.invoke("notify-form-submission", {
          body: {
            formTitle: form.title,
            formId: form.id,
            respondentName: respondentName || null,
            respondentEmail: respondentEmail || null,
            notifyEmails: (form as any).notify_emails,
          },
        });
      } catch (e) { /* notification failure shouldn't block submission */ }
    }

    // Send confirmation email to respondent
    if (respondentEmail) {
      try {
        await supabase.functions.invoke("send-form-confirmation", {
          body: {
            formTitle: form.title,
            respondentName: respondentName || null,
            respondentEmail,
            confirmationMessage: form.settings?.confirmation_message || "Thank you for your response!",
          },
        });
      } catch (e) { /* confirmation failure shouldn't block submission */ }
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  const answeredCount = visibleFields.filter(f => {
    const v = responses[f.id];
    return v !== undefined && v !== null && v !== "" && (!Array.isArray(v) || v.length > 0);
  }).length;
  const progress = visibleFields.length > 0 ? (answeredCount / visibleFields.length) * 100 : 0;
  const options = (field: any) => Array.isArray(field.options) ? field.options as string[] : [];

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (error) return (
    <>
      <SEO title="Form Unavailable" description={error} />
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center py-12">
          <CardContent>
            {error.includes("not yet open") ? (
              <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            ) : error.includes("maximum") ? (
              <AlertTriangle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            ) : (
              <AlertTriangle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            )}
            <h2 className="text-xl font-semibold text-foreground mb-2">Form Unavailable</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const template: string = form?.settings?.template || "classic";

  if (submitted) return (
    <>
      <SEO title={`${form.title} — Submitted`} description="Response submitted successfully." />
      <SuccessScreen form={form} template={template} />
    </>
  );

  // Shared field renderer
  const renderField = (field: any): ReactNode => {
    switch (field.field_type) {
      case "short_text":
        return <Input value={responses[field.id] || ""} onChange={e => updateResponse(field.id, e.target.value)} placeholder={field.placeholder || "Your answer"} />;
      case "long_text":
        return <Textarea value={responses[field.id] || ""} onChange={e => updateResponse(field.id, e.target.value)} placeholder={field.placeholder || "Your answer"} />;
      case "email":
        return <Input type="email" value={responses[field.id] || ""} onChange={e => updateResponse(field.id, e.target.value)} placeholder={field.placeholder || "email@example.com"} />;
      case "phone":
        return <Input type="tel" value={responses[field.id] || ""} onChange={e => updateResponse(field.id, e.target.value)} placeholder={field.placeholder || "+234..."} />;
      case "number":
        return <Input type="number" value={responses[field.id] || ""} onChange={e => updateResponse(field.id, e.target.value)} placeholder={field.placeholder || "0"} />;
      case "url":
        return <Input type="url" value={responses[field.id] || ""} onChange={e => updateResponse(field.id, e.target.value)} placeholder={field.placeholder || "https://"} />;
      case "date":
        return <Input type="date" value={responses[field.id] || ""} onChange={e => updateResponse(field.id, e.target.value)} />;
      case "multiple_choice":
        return (
          <RadioGroup value={responses[field.id] || ""} onValueChange={v => updateResponse(field.id, v)}>
            {options(field).map((opt: string, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <RadioGroupItem value={opt} id={`${field.id}-${i}`} />
                <Label htmlFor={`${field.id}-${i}`} className="font-normal cursor-pointer">{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case "checkbox":
        return (
          <div className="space-y-2">
            {options(field).map((opt: string, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <Checkbox id={`${field.id}-${i}`} checked={(responses[field.id] || []).includes(opt)} onCheckedChange={() => toggleCheckbox(field.id, opt)} />
                <Label htmlFor={`${field.id}-${i}`} className="font-normal cursor-pointer">{opt}</Label>
              </div>
            ))}
          </div>
        );
      case "dropdown":
        return (
          <Select value={responses[field.id] || ""} onValueChange={v => updateResponse(field.id, v)}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              {options(field).map((opt: string, i: number) => (
                <SelectItem key={i} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "rating":
        return (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} type="button" onClick={() => updateResponse(field.id, s)} className="p-1 transition-transform hover:scale-110">
                <Star className={`w-8 h-8 ${(responses[field.id] || 0) >= s ? "text-accent fill-accent" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
        );
      case "yes_no":
        return (
          <div className="flex gap-3">
            {["Yes", "No"].map(v => (
              <Button key={v} type="button" variant={responses[field.id] === v ? "default" : "outline"} onClick={() => updateResponse(field.id, v)}
                className={responses[field.id] === v ? "bg-primary text-primary-foreground" : ""}
              >{v}</Button>
            ))}
          </div>
        );
      case "file_upload":
        return <FileUploadField fieldId={field.id} value={responses[field.id]} onChange={(url) => updateResponse(field.id, url)} />;
      default:
        return null;
    }
  };

  const templateProps = {
    form, fields: visibleFields, respondentName, respondentEmail, setRespondentName, setRespondentEmail,
    progress, answeredCount, submitting, onSubmit: handleSubmit, renderField,
  };

  return (
    <>
      <SEO title={form.title} description={form.description} />
      {template === "newsletter" && <NewsletterTemplate {...templateProps} />}
      {template === "admin" && <AdminTemplate {...templateProps} />}
      {template === "minimal" && <MinimalTemplate {...templateProps} />}
      {template === "elegant" && <ElegantTemplate {...templateProps} />}
      {(template === "classic" || !["newsletter", "admin", "minimal", "elegant"].includes(template)) && <ClassicTemplate {...templateProps} />}
    </>
  );
};

export default FormSubmitPage;
