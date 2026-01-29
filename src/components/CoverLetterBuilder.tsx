import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Download, Eye, Check, ChevronLeft, ChevronRight,
  Building2, User, Mail, Phone, MapPin, Calendar, Sparkles, FileDown
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

interface SampleTemplate {
  id: string;
  title: string;
  industry: string;
  description: string;
  content: {
    opening: string;
    body: string;
    closing: string;
  };
}

const sampleTemplates: SampleTemplate[] = [
  {
    id: 'internship-general',
    title: 'General Internship Application',
    industry: 'General',
    description: 'Perfect for students applying to their first internship',
    content: {
      opening: 'I am writing to express my strong interest in the internship position at your esteemed organization. As a dedicated student at the University of Ibadan, I am eager to apply my academic knowledge in a practical setting and contribute meaningfully to your team.',
      body: `Throughout my academic journey, I have developed strong analytical and problem-solving skills that I believe will be valuable in this role. My coursework has equipped me with a solid foundation in [relevant subjects], and I have actively sought opportunities to apply these skills through [relevant activities or projects].

I am particularly drawn to your organization because of its commitment to [company value or mission]. I am confident that an internship with your team would provide me with invaluable experience and help me develop the professional skills necessary for my career.

I am a quick learner, highly motivated, and committed to delivering quality work. I work well both independently and as part of a team, and I am always eager to take on new challenges.`,
      closing: 'I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to your organization. Thank you for considering my application.'
    }
  },
  {
    id: 'tech-internship',
    title: 'Technology/IT Internship',
    industry: 'Technology',
    description: 'For software development, IT, and tech roles',
    content: {
      opening: 'I am excited to apply for the Technology Internship position at your company. As a computer science student passionate about building innovative solutions, I am eager to contribute to your technical team and learn from industry professionals.',
      body: `My technical skills include proficiency in programming languages such as Python, JavaScript, and Java. I have completed several projects that demonstrate my ability to develop functional applications, including [project examples]. Additionally, I am familiar with version control systems, agile methodologies, and collaborative development practices.

I am particularly interested in your company\'s work on [specific technology or product], and I believe my background in [relevant coursework or experience] would allow me to make meaningful contributions while growing as a developer.

Beyond technical skills, I bring strong problem-solving abilities, attention to detail, and a passion for continuous learning. I stay current with emerging technologies and industry trends through online courses and personal projects.`,
      closing: 'I am confident that this internship would be mutually beneficial. Thank you for considering my application, and I look forward to the opportunity to discuss how I can contribute to your team.'
    }
  },
  {
    id: 'finance-internship',
    title: 'Finance & Banking Internship',
    industry: 'Finance',
    description: 'For banking, finance, and accounting positions',
    content: {
      opening: 'I am writing to apply for the Finance Internship position at your distinguished institution. As an Accounting/Finance student at the University of Ibadan with a strong academic record and keen interest in financial markets, I am eager to gain practical experience in your esteemed organization.',
      body: `My academic background has provided me with a solid understanding of financial principles, including financial analysis, accounting standards, and investment theory. I have maintained excellent grades in core courses such as Financial Management, Corporate Finance, and Managerial Accounting.

I am proficient in Microsoft Excel and have experience with financial modeling and data analysis. I have also developed strong analytical skills through my coursework and involvement in [relevant activities or competitions].

What attracts me to your institution is your reputation for excellence and commitment to developing young talent. I am particularly interested in [specific department or area of finance], and I believe this internship would provide invaluable exposure to real-world financial operations.`,
      closing: 'I am confident that my strong work ethic, analytical abilities, and passion for finance make me a strong candidate. Thank you for considering my application.'
    }
  },
  {
    id: 'marketing-internship',
    title: 'Marketing & Communications',
    industry: 'Marketing',
    description: 'For marketing, PR, and communications roles',
    content: {
      opening: 'I am thrilled to apply for the Marketing Internship at your innovative company. As a creative and results-driven Mass Communication student, I am passionate about developing compelling marketing strategies and building meaningful brand connections.',
      body: `My academic and practical experiences have equipped me with skills in social media marketing, content creation, and market research. I have successfully managed social media accounts for [organization or personal projects], growing engagement and building authentic community connections.

I am proficient in digital marketing tools and platforms, including social media analytics, content management systems, and basic graphic design with Canva and Adobe Creative Suite. I stay current with marketing trends and have a keen eye for what captures audience attention.

Your company\'s recent campaign for [specific campaign or initiative] particularly impressed me, demonstrating the kind of creative and impactful work I aspire to be part of. I am eager to contribute fresh ideas while learning from your experienced marketing team.`,
      closing: 'I am excited about the possibility of contributing to your marketing efforts. Thank you for considering my application, and I look forward to discussing how I can add value to your team.'
    }
  },
  {
    id: 'law-internship',
    title: 'Legal Internship',
    industry: 'Legal',
    description: 'For law chambers and legal department positions',
    content: {
      opening: 'I write to respectfully apply for the Legal Internship position at your esteemed chambers/firm. As a penultimate year Law student at the University of Ibadan with a strong academic record and genuine passion for legal practice, I am eager to gain practical legal experience under your mentorship.',
      body: `My legal education has provided me with a solid foundation in Nigerian law, including constitutional law, contract law, and criminal law. I have consistently demonstrated academic excellence and have participated in moot court competitions, which have sharpened my legal research, writing, and advocacy skills.

I am particularly interested in [area of law e.g., commercial law, litigation, human rights], and I have undertaken independent research in this area. I am proficient in legal research using both traditional and digital resources, and I possess strong attention to detail—a quality essential for legal work.

I am aware of the demanding nature of legal practice and am fully prepared to dedicate the time and effort required. I am eager to learn from experienced practitioners and to contribute meaningfully to your ongoing cases and legal research projects.`,
      closing: 'I would be honoured to have the opportunity to discuss my application further. Thank you for your time and consideration.'
    }
  },
  {
    id: 'engineering-internship',
    title: 'Engineering Internship',
    industry: 'Engineering',
    description: 'For engineering and technical positions',
    content: {
      opening: 'I am writing to express my interest in the Engineering Internship at your company. As an Engineering student at the University of Ibadan with hands-on project experience and strong technical skills, I am excited about the opportunity to contribute to your engineering team.',
      body: `My coursework has provided me with a comprehensive understanding of engineering principles, including [specific engineering subjects relevant to the role]. I have applied this knowledge in practical projects such as [project examples], which have developed my problem-solving abilities and technical expertise.

I am proficient in engineering software including AutoCAD, MATLAB, and [other relevant software], and I have experience working on team projects that require collaboration and effective communication. My final year project on [project topic] particularly enhanced my research and analytical capabilities.

I am drawn to your company because of your innovative work in [specific area or project], and I am eager to learn from your experienced engineers while contributing fresh perspectives and strong work ethic to your projects.`,
      closing: 'I believe this internship would be an excellent opportunity for mutual growth. Thank you for considering my application, and I look forward to hearing from you.'
    }
  }
];

const downloadSampleTemplate = (template: SampleTemplate) => {
  const content = `
COVER LETTER TEMPLATE: ${template.title}
Industry: ${template.industry}

=============================================

[Your Name]
[Your Address]
[City, State ZIP Code]
[Your Email]
[Your Phone]

[Date]

[Hiring Manager's Name]
[Company Name]
[Company Address]

Dear [Hiring Manager's Name],

${template.content.opening}

${template.content.body}

${template.content.closing}

Sincerely,
[Your Name]

=============================================

INSTRUCTIONS:
1. Replace all bracketed text with your personal information
2. Customize the opening paragraph to mention the specific position and company
3. Tailor the body paragraphs to highlight your relevant experiences and skills
4. Keep the letter to one page
5. Proofread carefully before sending

This template was generated by UISU Career Hub
  `.trim();

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${template.title.toLowerCase().replace(/\s+/g, '-')}-template.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success('Template downloaded!');
};

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

                {/* Sample Templates Section */}
                <div className="mt-8 pt-6 border-t">
                  <div className="flex items-center gap-2 mb-4">
                    <FileDown size={20} className="text-emerald-600" />
                    <h4 className="font-serif text-lg">Sample Cover Letter Templates</h4>
                  </div>
                  <p className="text-slate-500 text-sm mb-4">Download pre-written templates for different industries and customize them for your needs</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {sampleTemplates.map(template => (
                      <div 
                        key={template.id}
                        className="border border-slate-200 p-4 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all rounded-none"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600 rounded-none">
                              {template.industry}
                            </span>
                            <h5 className="font-semibold text-slate-800 mt-2 text-sm">{template.title}</h5>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{template.description}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => downloadSampleTemplate(template)}
                            className="shrink-0 h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-none"
                          >
                            <Download size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
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
