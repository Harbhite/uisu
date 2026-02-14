import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Star, FileText, AlertCircle } from "lucide-react";
import { SEO } from "@/components/SEO";

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

  useEffect(() => {
    fetchForm();
  }, [token]);

  const fetchForm = async () => {
    const { data: forms, error: formError } = await supabase
      .from("forms")
      .select("*")
      .eq("share_token", token!)
      .eq("status", "published")
      .limit(1);

    if (formError || !forms || forms.length === 0) {
      setError("This form is not available.");
      setLoading(false);
      return;
    }

    const form = forms[0];
    setForm(form);

    const { data: fieldsData } = await supabase
      .from("form_fields")
      .select("*")
      .eq("form_id", form.id)
      .order("sort_order");

    if (fieldsData) setFields(fieldsData);
    setLoading(false);
  };

  const updateResponse = (fieldId: string, value: any) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }));
  };

  const toggleCheckbox = (fieldId: string, option: string) => {
    const current = responses[fieldId] || [];
    const updated = current.includes(option)
      ? current.filter((o: string) => o !== option)
      : [...current, option];
    updateResponse(fieldId, updated);
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
      form_id: form.id,
      respondent_email: respondentEmail || null,
      respondent_name: respondentName || null,
      data: responses,
    });

    if (submitError) {
      toast({ title: "Submission failed", description: submitError.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  const answeredCount = fields.filter(f => {
    const v = responses[f.id];
    return v !== undefined && v !== null && v !== "" && (!Array.isArray(v) || v.length > 0);
  }).length;
  const progress = fields.length > 0 ? (answeredCount / fields.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center py-12">
          <CardContent>
            <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Form Not Available</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    const settings = form.settings || {};
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <SEO title={`${form.title} — Submitted`} description="Response submitted successfully." />
        <Card className="max-w-md w-full text-center py-12">
          <CardContent>
            <CheckCircle2 className="w-16 h-16 mx-auto text-primary mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Response Submitted!</h2>
            <p className="text-muted-foreground">{settings.confirmation_message || "Thank you for your response!"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const options = (field: any) => Array.isArray(field.options) ? field.options as string[] : [];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <SEO title={form.title} description={form.description} />

      <div className="max-w-2xl mx-auto">
        {/* Form Header */}
        <Card className="mb-6 overflow-hidden">
          <div className="h-2 bg-primary" />
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-foreground">{form.title}</CardTitle>
            {form.description && <p className="text-muted-foreground mt-1">{form.description}</p>}
          </CardHeader>
          {form.settings?.show_progress && (
            <CardContent className="pt-0">
              <div className="flex items-center gap-3">
                <Progress value={progress} className="flex-1" />
                <span className="text-sm text-muted-foreground">{answeredCount}/{fields.length}</span>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Contact Info */}
        <Card className="mb-4">
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label>Your Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input value={respondentName} onChange={e => setRespondentName(e.target.value)} placeholder="Enter your name" className="mt-1" />
            </div>
            <div>
              <Label>Your Email <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input type="email" value={respondentEmail} onChange={e => setRespondentEmail(e.target.value)} placeholder="Enter your email" className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Fields */}
        {fields.map((field) => (
          <Card key={field.id} className="mb-4">
            <CardContent className="pt-6">
              <Label className="text-base font-medium text-foreground">
                {field.label}
                {field.is_required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {field.description && <p className="text-sm text-muted-foreground mt-1 mb-3">{field.description}</p>}

              <div className="mt-3">
                {field.field_type === "short_text" && (
                  <Input
                    value={responses[field.id] || ""}
                    onChange={e => updateResponse(field.id, e.target.value)}
                    placeholder={field.placeholder || "Your answer"}
                  />
                )}
                {field.field_type === "long_text" && (
                  <Textarea
                    value={responses[field.id] || ""}
                    onChange={e => updateResponse(field.id, e.target.value)}
                    placeholder={field.placeholder || "Your answer"}
                  />
                )}
                {field.field_type === "email" && (
                  <Input
                    type="email"
                    value={responses[field.id] || ""}
                    onChange={e => updateResponse(field.id, e.target.value)}
                    placeholder={field.placeholder || "email@example.com"}
                  />
                )}
                {field.field_type === "phone" && (
                  <Input
                    type="tel"
                    value={responses[field.id] || ""}
                    onChange={e => updateResponse(field.id, e.target.value)}
                    placeholder={field.placeholder || "+234..."}
                  />
                )}
                {field.field_type === "number" && (
                  <Input
                    type="number"
                    value={responses[field.id] || ""}
                    onChange={e => updateResponse(field.id, e.target.value)}
                    placeholder={field.placeholder || "0"}
                  />
                )}
                {field.field_type === "url" && (
                  <Input
                    type="url"
                    value={responses[field.id] || ""}
                    onChange={e => updateResponse(field.id, e.target.value)}
                    placeholder={field.placeholder || "https://"}
                  />
                )}
                {field.field_type === "date" && (
                  <Input
                    type="date"
                    value={responses[field.id] || ""}
                    onChange={e => updateResponse(field.id, e.target.value)}
                  />
                )}
                {field.field_type === "multiple_choice" && (
                  <RadioGroup value={responses[field.id] || ""} onValueChange={v => updateResponse(field.id, v)}>
                    {options(field).map((opt: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <RadioGroupItem value={opt} id={`${field.id}-${i}`} />
                        <Label htmlFor={`${field.id}-${i}`} className="font-normal cursor-pointer">{opt}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                {field.field_type === "checkbox" && (
                  <div className="space-y-2">
                    {options(field).map((opt: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <Checkbox
                          id={`${field.id}-${i}`}
                          checked={(responses[field.id] || []).includes(opt)}
                          onCheckedChange={() => toggleCheckbox(field.id, opt)}
                        />
                        <Label htmlFor={`${field.id}-${i}`} className="font-normal cursor-pointer">{opt}</Label>
                      </div>
                    ))}
                  </div>
                )}
                {field.field_type === "dropdown" && (
                  <Select value={responses[field.id] || ""} onValueChange={v => updateResponse(field.id, v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {options(field).map((opt: string, i: number) => (
                        <SelectItem key={i} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {field.field_type === "rating" && (
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => updateResponse(field.id, s)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${(responses[field.id] || 0) >= s ? "text-accent fill-accent" : "text-muted-foreground"}`}
                        />
                      </button>
                    ))}
                  </div>
                )}
                {field.field_type === "yes_no" && (
                  <div className="flex gap-3">
                    {["Yes", "No"].map(v => (
                      <Button
                        key={v}
                        type="button"
                        variant={responses[field.id] === v ? "default" : "outline"}
                        onClick={() => updateResponse(field.id, v)}
                        className={responses[field.id] === v ? "bg-primary text-primary-foreground" : ""}
                      >
                        {v}
                      </Button>
                    ))}
                  </div>
                )}
                {field.field_type === "file_upload" && (
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <FileText className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">File upload coming soon</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-lg"
        >
          {submitting ? "Submitting..." : "Submit"}
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Powered by UISU Archive Forms
        </p>
      </div>
    </div>
  );
};

export default FormSubmitPage;
