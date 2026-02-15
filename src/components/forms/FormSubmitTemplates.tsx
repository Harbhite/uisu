import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TemplateProps {
  form: any;
  fields: any[];
  respondentName: string;
  respondentEmail: string;
  setRespondentName: (v: string) => void;
  setRespondentEmail: (v: string) => void;
  progress: number;
  answeredCount: number;
  submitting: boolean;
  onSubmit: () => void;
  renderField: (field: any) => ReactNode;
}

interface StatusProps {
  form: any;
  type: "success" | "error";
  message?: string;
}

// ─── Template: Classic (current default) ────────────────────────────
export const ClassicTemplate = ({ form, fields, respondentName, respondentEmail, setRespondentName, setRespondentEmail, progress, answeredCount, submitting, onSubmit, renderField }: TemplateProps) => (
  <div className="min-h-screen bg-background py-8 px-4">
    <div className="max-w-2xl mx-auto">
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

      {fields.map(field => (
        <Card key={field.id} className="mb-4">
          <CardContent className="pt-6">
            <Label className="text-base font-medium text-foreground">
              {field.label}
              {field.is_required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {field.description && <p className="text-sm text-muted-foreground mt-1 mb-3">{field.description}</p>}
            <div className="mt-3">{renderField(field)}</div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={onSubmit} disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-lg">
        {submitting ? "Submitting..." : "Submit"}
      </Button>
      <p className="text-center text-xs text-muted-foreground mt-4">Powered by UISU Archive Forms</p>
    </div>
  </div>
);

// ─── Template: Newsletter (resembles newsletter page) ───────────────
export const NewsletterTemplate = ({ form, fields, respondentName, respondentEmail, setRespondentName, setRespondentEmail, progress, answeredCount, submitting, onSubmit, renderField }: TemplateProps) => (
  <div className="min-h-screen bg-[hsl(var(--nobel-cream,45_30%_96%))] flex flex-col">
    {/* Header */}
    <header className="px-6 md:px-12 pt-8">
      <div className="flex items-center gap-2 text-primary">
        <img src="/newsletter-logo.png" alt="UISU" className="h-4 w-auto object-contain" />
        <span className="text-xs font-bold uppercase tracking-widest">Forms</span>
      </div>
    </header>

    <main className="flex-1 px-6 md:px-12 lg:px-20 py-12 lg:py-16">
      <div className="max-w-xl mx-auto lg:mx-0">
        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl leading-[1.1] text-primary mb-4">
          {form.title}
        </h1>
        {form.description && (
          <p className="text-primary/70 text-base md:text-lg mb-8 max-w-xl">{form.description}</p>
        )}

        {form.settings?.show_progress && (
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-1.5 bg-primary/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-sm text-primary/50 font-medium">{answeredCount}/{fields.length}</span>
          </div>
        )}

        {/* Contact Fields */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-primary/60 mb-1 block">Your Name <span className="normal-case font-normal">(optional)</span></label>
            <Input value={respondentName} onChange={e => setRespondentName(e.target.value)} placeholder="Enter your name"
              className="rounded-full bg-primary/5 border-primary/20 text-primary placeholder:text-primary/40 h-14 px-6 focus-visible:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-primary/60 mb-1 block">Your Email <span className="normal-case font-normal">(optional)</span></label>
            <Input type="email" value={respondentEmail} onChange={e => setRespondentEmail(e.target.value)} placeholder="Enter your email"
              className="rounded-full bg-primary/5 border-primary/20 text-primary placeholder:text-primary/40 h-14 px-6 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-6 mb-10">
          {fields.map(field => (
            <div key={field.id} className="bg-white/60 backdrop-blur-sm border border-primary/10 rounded-2xl p-6">
              <label className="text-xs font-bold uppercase tracking-wider text-primary/70 mb-1 block">
                {field.label}
                {field.is_required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.description && <p className="text-sm text-primary/50 mb-3">{field.description}</p>}
              <div className="mt-2">{renderField(field)}</div>
            </div>
          ))}
        </div>

        <Button onClick={onSubmit} disabled={submitting}
          className="rounded-full h-14 px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wide text-base w-full sm:w-auto"
        >
          {submitting ? "Submitting..." : "Submit"}
        </Button>
        <p className="text-xs text-primary/40 mt-6">No spam, ever. Powered by UISU Archive.</p>
      </div>
    </main>

    <footer className="px-6 md:px-12 py-6 border-t border-primary/10">
      <span className="text-xs text-primary/40">© {new Date().getFullYear()} University of Ibadan Students' Union</span>
    </footer>
  </div>
);

// ─── Template: Admin / Dashboard (resembles admin dashboard) ────────
export const AdminTemplate = ({ form, fields, respondentName, respondentEmail, setRespondentName, setRespondentEmail, progress, answeredCount, submitting, onSubmit, renderField }: TemplateProps) => (
  <div className="min-h-screen bg-muted/30">
    {/* Dark header banner */}
    <div className="bg-primary text-primary-foreground px-6 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{form.title}</h1>
        {form.description && <p className="text-primary-foreground/70 mt-2 text-sm md:text-base">{form.description}</p>}
        {form.settings?.show_progress && (
          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 h-1 bg-primary-foreground/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary-foreground/80 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-primary-foreground/60">{answeredCount}/{fields.length}</span>
          </div>
        )}
      </div>
    </div>

    <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-4 pb-16">
      {/* Contact info card */}
      <div className="bg-card border border-border rounded-lg shadow-sm p-5 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name <span className="normal-case font-normal">(optional)</span></Label>
            <Input value={respondentName} onChange={e => setRespondentName(e.target.value)} placeholder="Your name" className="mt-1.5 bg-muted/50" />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email <span className="normal-case font-normal">(optional)</span></Label>
            <Input type="email" value={respondentEmail} onChange={e => setRespondentEmail(e.target.value)} placeholder="your@email.com" className="mt-1.5 bg-muted/50" />
          </div>
        </div>
      </div>

      {/* Fields in single card */}
      <div className="bg-card border border-border rounded-lg shadow-sm divide-y divide-border">
        {fields.map(field => (
          <div key={field.id} className="p-5">
            <div className="flex items-start justify-between gap-2 mb-2">
              <Label className="text-sm font-semibold text-foreground">
                {field.label}
                {field.is_required && <span className="text-destructive ml-1">*</span>}
              </Label>
            </div>
            {field.description && <p className="text-xs text-muted-foreground mb-3">{field.description}</p>}
            {renderField(field)}
          </div>
        ))}
      </div>

      <Button onClick={onSubmit} disabled={submitting} className="w-full mt-6 h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
        {submitting ? "Submitting..." : "Submit Response"}
      </Button>
      <p className="text-center text-xs text-muted-foreground mt-3">Powered by UISU Archive Forms</p>
    </div>
  </div>
);

// ─── Template: Minimal ──────────────────────────────────────────────
export const MinimalTemplate = ({ form, fields, respondentName, respondentEmail, setRespondentName, setRespondentEmail, progress, answeredCount, submitting, onSubmit, renderField }: TemplateProps) => (
  <div className="min-h-screen bg-background">
    <div className="max-w-lg mx-auto px-6 py-16 md:py-24">
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground leading-tight">{form.title}</h1>
        {form.description && <p className="text-muted-foreground mt-3 text-base leading-relaxed">{form.description}</p>}
        {form.settings?.show_progress && (
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-0.5 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-foreground rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">{answeredCount}/{fields.length}</span>
          </div>
        )}
      </div>

      {/* Inline contact fields */}
      <div className="space-y-6 mb-10 pb-10 border-b border-border">
        <div>
          <label className="text-sm text-muted-foreground block mb-2">Your name <span className="text-xs">(optional)</span></label>
          <input value={respondentName} onChange={e => setRespondentName(e.target.value)} placeholder="Name"
            className="w-full bg-transparent border-b border-border pb-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors text-base" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground block mb-2">Your email <span className="text-xs">(optional)</span></label>
          <input type="email" value={respondentEmail} onChange={e => setRespondentEmail(e.target.value)} placeholder="Email"
            className="w-full bg-transparent border-b border-border pb-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors text-base" />
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-10">
        {fields.map(field => (
          <div key={field.id}>
            <label className="text-sm font-medium text-foreground block mb-1">
              {field.label}
              {field.is_required && <span className="text-destructive ml-1">*</span>}
            </label>
            {field.description && <p className="text-xs text-muted-foreground mb-3">{field.description}</p>}
            {renderField(field)}
          </div>
        ))}
      </div>

      <Button onClick={onSubmit} disabled={submitting}
        className="mt-12 h-12 px-8 bg-foreground text-background hover:bg-foreground/90 font-medium rounded-none w-full"
      >
        {submitting ? "Submitting..." : "Submit"} <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
      <p className="text-center text-xs text-muted-foreground mt-6">UISU Archive Forms</p>
    </div>
  </div>
);

// ─── Template: Elegant ──────────────────────────────────────────────
export const ElegantTemplate = ({ form, fields, respondentName, respondentEmail, setRespondentName, setRespondentEmail, progress, answeredCount, submitting, onSubmit, renderField }: TemplateProps) => (
  <div className="min-h-screen bg-gradient-to-b from-card to-background">
    <div className="max-w-2xl mx-auto px-6 py-12 md:py-20">
      {/* Centered header */}
      <div className="text-center mb-12">
        <div className="inline-block w-12 h-0.5 bg-accent mb-6" />
        <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-3">{form.title}</h1>
        {form.description && <p className="text-muted-foreground max-w-md mx-auto">{form.description}</p>}
        {form.settings?.show_progress && (
          <div className="flex items-center gap-3 max-w-xs mx-auto mt-6">
            <Progress value={progress} className="flex-1" />
            <span className="text-xs text-muted-foreground">{answeredCount}/{fields.length}</span>
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 p-6 bg-muted/30 rounded-xl border border-border/50">
        <div>
          <Label className="text-xs text-muted-foreground">Your Name <span className="text-xs">(optional)</span></Label>
          <Input value={respondentName} onChange={e => setRespondentName(e.target.value)} placeholder="Name" className="mt-1 bg-background" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Your Email <span className="text-xs">(optional)</span></Label>
          <Input type="email" value={respondentEmail} onChange={e => setRespondentEmail(e.target.value)} placeholder="Email" className="mt-1 bg-background" />
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-6">
        {fields.map((field, i) => (
          <div key={field.id} className="p-6 bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <span className="text-xs font-bold text-accent mt-1 w-5 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
              <div className="flex-1">
                <Label className="text-base font-medium text-foreground">
                  {field.label}
                  {field.is_required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {field.description && <p className="text-sm text-muted-foreground mt-1 mb-3">{field.description}</p>}
                <div className="mt-3">{renderField(field)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-10">
        <Button onClick={onSubmit} disabled={submitting}
          className="h-12 px-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-semibold text-base"
        >
          {submitting ? "Submitting..." : "Submit Response"}
        </Button>
        <p className="text-xs text-muted-foreground mt-4">Powered by UISU Archive Forms</p>
      </div>
    </div>
  </div>
);

// ─── Status screens ─────────────────────────────────────────────────
export const SuccessScreen = ({ form, template }: { form: any; template: string }) => {
  const msg = form.settings?.confirmation_message || "Thank you for your response!";
  
  if (template === "newsletter") {
    return (
      <div className="min-h-screen bg-[hsl(var(--nobel-cream,45_30%_96%))] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-green-600 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif text-primary mb-3">You're in!</h2>
          <p className="text-primary/60">{msg}</p>
        </div>
      </div>
    );
  }

  if (template === "admin") {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="bg-primary text-primary-foreground px-6 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-primary-foreground/80" />
            <h2 className="text-xl font-bold">Response Submitted</h2>
            <p className="text-primary-foreground/60 mt-2">{msg}</p>
          </div>
        </div>
      </div>
    );
  }

  if (template === "minimal") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <CheckCircle2 className="w-10 h-10 mx-auto text-foreground mb-4" />
          <h2 className="text-xl font-serif font-bold text-foreground mb-2">Done.</h2>
          <p className="text-muted-foreground text-sm">{msg}</p>
        </div>
      </div>
    );
  }

  if (template === "elegant") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-card to-background flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="inline-block w-12 h-0.5 bg-accent mb-6" />
          <CheckCircle2 className="w-14 h-14 mx-auto text-primary mb-4" />
          <h2 className="text-2xl font-serif text-foreground mb-2">Response Submitted!</h2>
          <p className="text-muted-foreground">{msg}</p>
        </div>
      </div>
    );
  }

  // Classic
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center py-12">
        <CardContent>
          <CheckCircle2 className="w-16 h-16 mx-auto text-primary mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Response Submitted!</h2>
          <p className="text-muted-foreground">{msg}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export const ErrorScreen = () => (
  <div className="min-h-screen bg-background flex items-center justify-center px-4">
    <Card className="max-w-md w-full text-center py-12">
      <CardContent>
        <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Form Not Available</h2>
        <p className="text-muted-foreground">This form is not available.</p>
      </CardContent>
    </Card>
  </div>
);

export const FORM_TEMPLATES_INFO = [
  { value: "classic", label: "Classic", description: "Card-based layout with a top accent bar" },
  { value: "newsletter", label: "Newsletter", description: "Cream background, serif fonts, rounded inputs" },
  { value: "admin", label: "Dashboard", description: "Dark header with clean form below" },
  { value: "minimal", label: "Minimal", description: "Clean, borderless, modern typography" },
  { value: "elegant", label: "Elegant", description: "Numbered fields, centered header, subtle cards" },
];
