import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Download, Eye, Check, ChevronLeft, ChevronRight,
  Building2, User, Mail, Phone, MapPin, Calendar, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface CoverLetterData {
  senderInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
  recipientInfo: {
    hiringManager: string;
    companyName: string;
    companyAddress: string;
    jobTitle: string;
  };
  letterContent: {
    date: string;
    opening: string;
    body: string;
    closing: string;
    signature: string;
  };
}

const defaultData: CoverLetterData = {
  senderInfo: {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  },
  recipientInfo: {
    hiringManager: '',
    companyName: '',
    companyAddress: '',
    jobTitle: ''
  },
  letterContent: {
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    opening: '',
    body: '',
    closing: 'Thank you for considering my application. I look forward to the opportunity to discuss how my skills and experiences align with your needs.',
    signature: 'Sincerely,'
  }
};

interface Template {
  id: string;
  name: string;
  preview: string;
  description: string;
  color: string;
}

const templates: Template[] = [
  { id: 'formal', name: 'Formal', preview: '📋', description: 'Traditional business letter format', color: '#1e3a5f' },
  { id: 'modern', name: 'Modern', preview: '✨', description: 'Clean contemporary design', color: '#6366f1' },
  { id: 'minimal', name: 'Minimal', preview: '◻️', description: 'Simple and elegant', color: '#374151' },
  { id: 'creative', name: 'Creative', preview: '🎨', description: 'Bold and expressive', color: '#dc2626' },
  { id: 'executive', name: 'Executive', preview: '👔', description: 'Premium professional style', color: '#7c3aed' },
  { id: 'elegant', name: 'Elegant', preview: '🌟', description: 'Sophisticated with serif fonts', color: '#0f766e' },
];

const CoverLetterBuilder: React.FC = () => {
  const [step, setStep] = useState<'template' | 'edit' | 'preview'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(templates[0]);
  const [data, setData] = useState<CoverLetterData>(defaultData);
  const [activeSection, setActiveSection] = useState<'sender' | 'recipient' | 'content'>('sender');
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!data.senderInfo.fullName || !data.recipientInfo.companyName) {
      toast.error('Please fill in at least your name and company name');
      return;
    }

    const printContent = printRef.current;
    if (!printContent) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${data.senderInfo.fullName} - Cover Letter</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Georgia', serif; font-size: 11pt; line-height: 1.6; color: #333; }
            @page { size: A4; margin: 0.75in; }
            @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    };

    if (iframe.contentWindow?.document.readyState === 'complete') {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }

    toast.success('Preparing document...');
  };

  const renderTemplate = () => {
    const { senderInfo, recipientInfo, letterContent } = data;
    const color = selectedTemplate.color;

    const templateStyles: Record<string, string> = {
      formal: `
        <div style="font-family: 'Times New Roman', serif; max-width: 700px; margin: 0 auto; padding: 40px;">
          <div style="text-align: right; margin-bottom: 30px;">
            <div style="font-weight: bold;">${senderInfo.fullName || 'Your Name'}</div>
            <div style="font-size: 11px; color: #666;">${senderInfo.address || 'Your Address'}</div>
            <div style="font-size: 11px; color: #666;">${senderInfo.city || 'City, State ZIP'}</div>
            <div style="font-size: 11px; color: #666;">${senderInfo.email || 'email@example.com'}</div>
            <div style="font-size: 11px; color: #666;">${senderInfo.phone || 'Phone Number'}</div>
          </div>
          
          <div style="margin-bottom: 20px; font-size: 12px; color: #666;">
            ${letterContent.date}
          </div>
          
          <div style="margin-bottom: 30px;">
            <div style="font-weight: bold;">${recipientInfo.hiringManager || 'Hiring Manager'}</div>
            <div style="font-size: 12px;">${recipientInfo.companyName || 'Company Name'}</div>
            <div style="font-size: 12px; color: #666;">${recipientInfo.companyAddress || 'Company Address'}</div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p style="margin-bottom: 15px;">Dear ${recipientInfo.hiringManager || 'Hiring Manager'},</p>
            <p style="margin-bottom: 15px; text-align: justify;">${letterContent.opening || 'I am writing to express my interest in the position...'}</p>
            <p style="margin-bottom: 15px; text-align: justify; white-space: pre-wrap;">${letterContent.body || 'Describe your qualifications and experiences here...'}</p>
            <p style="margin-bottom: 15px; text-align: justify;">${letterContent.closing}</p>
          </div>
          
          <div style="margin-top: 40px;">
            <p style="margin-bottom: 30px;">${letterContent.signature}</p>
            <p style="font-weight: bold;">${senderInfo.fullName || 'Your Name'}</p>
          </div>
        </div>
      `,
      modern: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 700px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, ${color}, ${color}dd); color: white; padding: 25px 35px;">
            <h1 style="font-size: 24px; margin-bottom: 5px;">${senderInfo.fullName || 'Your Name'}</h1>
            <div style="font-size: 11px; opacity: 0.9;">
              ${[senderInfo.email, senderInfo.phone, senderInfo.city].filter(Boolean).join(' | ') || 'Contact Info'}
            </div>
          </div>
          
          <div style="padding: 30px 35px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #eee;">
              <div>
                <div style="font-weight: 600; color: ${color};">${recipientInfo.companyName || 'Company Name'}</div>
                <div style="font-size: 12px; color: #666;">${recipientInfo.hiringManager || 'Hiring Manager'}</div>
              </div>
              <div style="font-size: 12px; color: #888;">${letterContent.date}</div>
            </div>
            
            <div style="font-size: 13px; line-height: 1.8;">
              <p style="margin-bottom: 15px;">Dear ${recipientInfo.hiringManager || 'Hiring Manager'},</p>
              <p style="margin-bottom: 15px;">${letterContent.opening || 'Opening paragraph...'}</p>
              <p style="margin-bottom: 15px; white-space: pre-wrap;">${letterContent.body || 'Body content...'}</p>
              <p style="margin-bottom: 15px;">${letterContent.closing}</p>
            </div>
            
            <div style="margin-top: 35px;">
              <p style="color: ${color}; margin-bottom: 20px;">${letterContent.signature}</p>
              <p style="font-weight: 600;">${senderInfo.fullName || 'Your Name'}</p>
            </div>
          </div>
        </div>
      `,
      minimal: `
        <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 650px; margin: 0 auto; padding: 50px;">
          <div style="margin-bottom: 40px;">
            <h1 style="font-size: 28px; font-weight: 300; color: #111; margin-bottom: 8px;">${senderInfo.fullName || 'Your Name'}</h1>
            <div style="font-size: 12px; color: #888;">
              ${[senderInfo.email, senderInfo.phone].filter(Boolean).join(' / ') || 'Contact'}
            </div>
          </div>
          
          <div style="font-size: 11px; color: #999; margin-bottom: 30px;">
            ${letterContent.date}
          </div>
          
          <div style="font-size: 13px; color: #555; line-height: 1.9;">
            <p style="margin-bottom: 20px;">Dear ${recipientInfo.hiringManager || 'Hiring Manager'},</p>
            <p style="margin-bottom: 20px;">${letterContent.opening || 'Opening...'}</p>
            <p style="margin-bottom: 20px; white-space: pre-wrap;">${letterContent.body || 'Body...'}</p>
            <p style="margin-bottom: 20px;">${letterContent.closing}</p>
          </div>
          
          <div style="margin-top: 50px;">
            <p style="color: #999; margin-bottom: 25px;">${letterContent.signature}</p>
            <p style="font-weight: 500; color: #111;">${senderInfo.fullName || 'Your Name'}</p>
          </div>
        </div>
      `,
      creative: `
        <div style="font-family: 'Arial', sans-serif; max-width: 700px; margin: 0 auto;">
          <div style="background: ${color}; padding: 30px; text-align: center;">
            <h1 style="font-size: 32px; color: white; margin: 0; text-transform: uppercase; letter-spacing: 3px;">${senderInfo.fullName || 'Your Name'}</h1>
          </div>
          
          <div style="padding: 30px;">
            <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 30px; font-size: 12px; color: #666;">
              ${senderInfo.email ? `<span>✉️ ${senderInfo.email}</span>` : ''}
              ${senderInfo.phone ? `<span>📱 ${senderInfo.phone}</span>` : ''}
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; margin-bottom: 25px; border-left: 4px solid ${color};">
              <div style="font-weight: bold; color: ${color};">${recipientInfo.companyName || 'Company'}</div>
              <div style="font-size: 12px; color: #666;">${recipientInfo.jobTitle || 'Position'}</div>
            </div>
            
            <div style="font-size: 13px; line-height: 1.8;">
              <p style="margin-bottom: 15px;">Dear ${recipientInfo.hiringManager || 'Team'},</p>
              <p style="margin-bottom: 15px;">${letterContent.opening || 'Opening...'}</p>
              <p style="margin-bottom: 15px; white-space: pre-wrap;">${letterContent.body || 'Body...'}</p>
              <p style="margin-bottom: 15px;">${letterContent.closing}</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 3px solid ${color};">
              <p style="color: ${color}; font-weight: bold; margin-bottom: 10px;">${letterContent.signature}</p>
              <p style="font-size: 18px; font-weight: bold;">${senderInfo.fullName || 'Your Name'}</p>
            </div>
          </div>
        </div>
      `,
      executive: `
        <div style="font-family: 'Garamond', serif; max-width: 700px; margin: 0 auto; border: 2px solid ${color};">
          <div style="padding: 30px; text-align: center; border-bottom: 1px solid #eee;">
            <h1 style="font-size: 28px; color: ${color}; margin: 0 0 8px; font-weight: normal; letter-spacing: 5px; text-transform: uppercase;">${senderInfo.fullName || 'Your Name'}</h1>
            <div style="font-size: 11px; color: #888; letter-spacing: 2px;">
              ${[senderInfo.email, senderInfo.phone].filter(Boolean).join(' • ') || 'Contact'}
            </div>
          </div>
          
          <div style="padding: 30px 40px;">
            <div style="text-align: right; font-size: 12px; color: #888; margin-bottom: 25px;">
              ${letterContent.date}
            </div>
            
            <div style="margin-bottom: 25px;">
              <div style="font-weight: bold; color: ${color};">${recipientInfo.hiringManager || 'Hiring Manager'}</div>
              <div style="font-size: 12px;">${recipientInfo.companyName || 'Company Name'}</div>
            </div>
            
            <div style="font-size: 13px; line-height: 1.8; text-align: justify;">
              <p style="margin-bottom: 18px;">Dear ${recipientInfo.hiringManager || 'Hiring Manager'},</p>
              <p style="margin-bottom: 18px;">${letterContent.opening || 'Opening...'}</p>
              <p style="margin-bottom: 18px; white-space: pre-wrap;">${letterContent.body || 'Body...'}</p>
              <p style="margin-bottom: 18px;">${letterContent.closing}</p>
            </div>
            
            <div style="margin-top: 40px;">
              <p style="font-style: italic; color: ${color}; margin-bottom: 25px;">${letterContent.signature}</p>
              <p style="font-size: 16px; font-weight: bold; color: ${color};">${senderInfo.fullName || 'Your Name'}</p>
            </div>
          </div>
        </div>
      `,
      elegant: `
        <div style="font-family: Georgia, serif; max-width: 700px; margin: 0 auto; padding: 40px;">
          <div style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid ${color};">
            <h1 style="font-size: 26px; color: ${color}; font-weight: normal; margin-bottom: 10px; font-style: italic;">${senderInfo.fullName || 'Your Name'}</h1>
            <div style="font-size: 11px; color: #777;">
              ${[senderInfo.email, senderInfo.phone, senderInfo.city].filter(Boolean).join(' • ') || 'Contact Details'}
            </div>
          </div>
          
          <div style="margin-bottom: 30px; font-size: 12px; color: #888; font-style: italic;">
            ${letterContent.date}
          </div>
          
          <div style="margin-bottom: 30px;">
            <div style="font-style: italic; color: ${color};">${recipientInfo.hiringManager || 'Hiring Manager'}</div>
            <div style="font-size: 13px;">${recipientInfo.companyName || 'Company Name'}</div>
          </div>
          
          <div style="font-size: 13px; line-height: 1.9;">
            <p style="margin-bottom: 18px;">Dear ${recipientInfo.hiringManager || 'Hiring Manager'},</p>
            <p style="margin-bottom: 18px;">${letterContent.opening || 'Opening paragraph...'}</p>
            <p style="margin-bottom: 18px; white-space: pre-wrap;">${letterContent.body || 'Body content...'}</p>
            <p style="margin-bottom: 18px;">${letterContent.closing}</p>
          </div>
          
          <div style="margin-top: 40px;">
            <p style="font-style: italic; color: ${color}; margin-bottom: 25px;">${letterContent.signature}</p>
            <p style="font-weight: bold;">${senderInfo.fullName || 'Your Name'}</p>
          </div>
        </div>
      `
    };

    return templateStyles[selectedTemplate.id] || templateStyles.formal;
  };

  return (
    <div className="w-full bg-white border rounded-none shadow-sm">
      <div className="flex flex-col min-h-[600px]">
        {/* Header */}
        <div className="px-4 md:px-6 py-3 md:py-4 border-b flex items-center justify-between bg-gradient-to-r from-emerald-600 to-emerald-500">
          <div className="flex items-center gap-2 md:gap-3 text-white">
            <FileText size={20} className="md:w-6 md:h-6" />
            <div>
              <h2 className="font-serif text-lg md:text-xl">Cover Letter Builder</h2>
              <p className="text-[10px] md:text-xs opacity-75 hidden md:block">Craft compelling cover letters</p>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            {step !== 'template' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(step === 'preview' ? 'edit' : 'template')}
                className="text-white hover:bg-white/20 h-8 px-2 md:h-9 md:px-4 rounded-none"
              >
                <ChevronLeft size={16} className="md:mr-1" /> <span className="hidden md:inline">Back</span>
              </Button>
            )}
            {step === 'edit' && (
              <Button size="sm" onClick={() => setStep('preview')} className="bg-white text-emerald-600 hover:bg-white/90 h-8 px-2 md:h-9 md:px-4 rounded-none">
                <Eye size={16} className="md:mr-1" /> <span className="hidden md:inline">Preview</span>
              </Button>
            )}
            {step === 'preview' && (
              <Button size="sm" onClick={handlePrint} className="bg-nobel-gold hover:bg-nobel-gold/90 text-white h-8 px-2 md:h-9 md:px-4 rounded-none">
                <Download size={16} className="md:mr-1" /> <span className="hidden md:inline">Download</span>
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {step === 'template' && (
              <motion.div
                key="template"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-4 md:p-6"
              >
                <h3 className="font-serif text-xl md:text-2xl mb-2">Choose a style</h3>
                <p className="text-slate-500 mb-6 text-sm md:text-base">Select a design that matches your professional tone</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {templates.map(template => (
                    <motion.div
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTemplate(template)}
                      className={`cursor-pointer border-2 p-4 md:p-6 transition-all rounded-none ${
                        selectedTemplate.id === template.id
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className="w-full h-24 md:h-32 mb-4 flex items-center justify-center text-4xl md:text-5xl rounded-none"
                        style={{ background: `${template.color}15` }}
                      >
                        {template.preview}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm md:text-base">{template.name}</h4>
                          <p className="text-[10px] md:text-xs text-slate-500">{template.description}</p>
                        </div>
                        {selectedTemplate.id === template.id && (
                          <div className="w-5 h-5 md:w-6 md:h-6 bg-emerald-600 flex items-center justify-center rounded-none">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <Button onClick={() => setStep('edit')} className="bg-emerald-600 hover:bg-emerald-700 rounded-none w-full md:w-auto">
                    Continue <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'edit' && (
              <motion.div
                key="edit"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col md:flex-row items-start"
              >
                {/* Sidebar */}
                <div className="w-full md:w-48 border-b md:border-b-0 md:border-r bg-slate-50 p-2 md:p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible shrink-0">
                  {[
                    { id: 'sender', label: 'Your Info', icon: User },
                    { id: 'recipient', label: 'Recipient', icon: Building2 },
                    { id: 'content', label: 'Letter Content', icon: FileText }
                  ].map(section => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id as typeof activeSection)}
                      className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 text-left text-xs md:text-sm transition-all whitespace-nowrap rounded-none ${
                        activeSection === section.id
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <section.icon size={14} className="md:w-4 md:h-4" />
                      <span>{section.label}</span>
                    </button>
                  ))}
                </div>

                {/* Form */}
                <div className="flex-1 p-4 md:p-6 overflow-y-auto max-h-[500px]">
                  {activeSection === 'sender' && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-800 mb-4">Your Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">Full Name *</Label>
                          <Input
                            value={data.senderInfo.fullName}
                            onChange={(e) => setData(prev => ({ ...prev, senderInfo: { ...prev.senderInfo, fullName: e.target.value } }))}
                            placeholder="John Doe"
                            className="rounded-none mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Email</Label>
                          <Input
                            type="email"
                            value={data.senderInfo.email}
                            onChange={(e) => setData(prev => ({ ...prev, senderInfo: { ...prev.senderInfo, email: e.target.value } }))}
                            placeholder="john@example.com"
                            className="rounded-none mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Phone</Label>
                          <Input
                            value={data.senderInfo.phone}
                            onChange={(e) => setData(prev => ({ ...prev, senderInfo: { ...prev.senderInfo, phone: e.target.value } }))}
                            placeholder="+234 800 000 0000"
                            className="rounded-none mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">City</Label>
                          <Input
                            value={data.senderInfo.city}
                            onChange={(e) => setData(prev => ({ ...prev, senderInfo: { ...prev.senderInfo, city: e.target.value } }))}
                            placeholder="Lagos, Nigeria"
                            className="rounded-none mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Address</Label>
                        <Input
                          value={data.senderInfo.address}
                          onChange={(e) => setData(prev => ({ ...prev, senderInfo: { ...prev.senderInfo, address: e.target.value } }))}
                          placeholder="123 Main Street"
                          className="rounded-none mt-1"
                        />
                      </div>
                    </div>
                  )}

                  {activeSection === 'recipient' && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-800 mb-4">Recipient Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">Hiring Manager Name</Label>
                          <Input
                            value={data.recipientInfo.hiringManager}
                            onChange={(e) => setData(prev => ({ ...prev, recipientInfo: { ...prev.recipientInfo, hiringManager: e.target.value } }))}
                            placeholder="Jane Smith"
                            className="rounded-none mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Job Title</Label>
                          <Input
                            value={data.recipientInfo.jobTitle}
                            onChange={(e) => setData(prev => ({ ...prev, recipientInfo: { ...prev.recipientInfo, jobTitle: e.target.value } }))}
                            placeholder="Software Engineer Intern"
                            className="rounded-none mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Company Name *</Label>
                        <Input
                          value={data.recipientInfo.companyName}
                          onChange={(e) => setData(prev => ({ ...prev, recipientInfo: { ...prev.recipientInfo, companyName: e.target.value } }))}
                          placeholder="Acme Corporation"
                          className="rounded-none mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Company Address</Label>
                        <Input
                          value={data.recipientInfo.companyAddress}
                          onChange={(e) => setData(prev => ({ ...prev, recipientInfo: { ...prev.recipientInfo, companyAddress: e.target.value } }))}
                          placeholder="456 Business Ave, Lagos"
                          className="rounded-none mt-1"
                        />
                      </div>
                    </div>
                  )}

                  {activeSection === 'content' && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-800 mb-4">Letter Content</h4>
                      <div>
                        <Label className="text-xs">Date</Label>
                        <Input
                          value={data.letterContent.date}
                          onChange={(e) => setData(prev => ({ ...prev, letterContent: { ...prev.letterContent, date: e.target.value } }))}
                          className="rounded-none mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Opening Paragraph</Label>
                        <Textarea
                          value={data.letterContent.opening}
                          onChange={(e) => setData(prev => ({ ...prev, letterContent: { ...prev.letterContent, opening: e.target.value } }))}
                          placeholder="I am writing to express my interest in the [Position] at [Company]. With my background in..."
                          rows={3}
                          className="rounded-none mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Body (Main Content)</Label>
                        <Textarea
                          value={data.letterContent.body}
                          onChange={(e) => setData(prev => ({ ...prev, letterContent: { ...prev.letterContent, body: e.target.value } }))}
                          placeholder="Describe your qualifications, experiences, and why you're a great fit for the role..."
                          rows={6}
                          className="rounded-none mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Closing Paragraph</Label>
                        <Textarea
                          value={data.letterContent.closing}
                          onChange={(e) => setData(prev => ({ ...prev, letterContent: { ...prev.letterContent, closing: e.target.value } }))}
                          rows={2}
                          className="rounded-none mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Signature Line</Label>
                        <Input
                          value={data.letterContent.signature}
                          onChange={(e) => setData(prev => ({ ...prev, letterContent: { ...prev.letterContent, signature: e.target.value } }))}
                          className="rounded-none mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 'preview' && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-4 md:p-6"
              >
                <div className="bg-white border shadow-lg max-w-3xl mx-auto">
                  <div
                    ref={printRef}
                    dangerouslySetInnerHTML={{ __html: renderTemplate() }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterBuilder;
