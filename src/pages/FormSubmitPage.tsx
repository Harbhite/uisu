import { useState, useEffect, ReactNode } from "react";
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
import { Star, FileText } from "lucide-react";
import { SEO } from "@/components/SEO";
import {
  ClassicTemplate, NewsletterTemplate, AdminTemplate, MinimalTemplate, ElegantTemplate,
  SuccessScreen, ErrorScreen,
} from "@/components/forms/FormSubmitTemplates";

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

  const validate = (): boolean => {
    for (const field of fields) {
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
    setSubmitted(true);
    setSubmitting(false);
  };

  const answeredCount = fields.filter(f => {
    const v = responses[f.id];
    return v !== undefined && v !== null && v !== "" && (!Array.isArray(v) || v.length > 0);
  }).length;
  const progress = fields.length > 0 ? (answeredCount / fields.length) * 100 : 0;
  const options = (field: any) => Array.isArray(field.options) ? field.options as string[] : [];

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (error) return <ErrorScreen />;

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
        return (
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <FileText className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">File upload coming soon</p>
          </div>
        );
      default:
        return null;
    }
  };

  const templateProps = {
    form, fields, respondentName, respondentEmail, setRespondentName, setRespondentEmail,
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
