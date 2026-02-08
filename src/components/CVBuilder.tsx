import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Download, Eye, Check, ChevronLeft, ChevronRight,
  Briefcase, GraduationCap, Award, Phone, Mail, MapPin, Globe,
  Linkedin, Github, User, Plus, Trash2, Sparkles, Loader2,
  Printer, Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    linkedin?: string;
    github?: string;
    summary: string;
  };
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    startYear: string;
    endYear: string;
    gpa?: string;
  }>;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  skills: string[];
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    year: string;
  }>;
}

const defaultCVData: CVData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    summary: ''
  },
  education: [],
  experience: [],
  skills: [],
  certifications: []
};

interface Template {
  id: string;
  name: string;
  preview: string;
  description: string;
  color: string;
}

const templates: Template[] = [
  { id: 'classic', name: 'Classic', preview: '📄', description: 'Traditional layout with clean sections', color: '#1e3a5f' },
  { id: 'modern', name: 'Modern', preview: '✨', description: 'Contemporary design with accent colors', color: '#6366f1' },
  { id: 'minimal', name: 'Minimal', preview: '◻️', description: 'Clean and simple with lots of whitespace', color: '#374151' },
  { id: 'professional', name: 'Professional', preview: '💼', description: 'Corporate style with structured layout', color: '#0f766e' },
  { id: 'creative', name: 'Creative', preview: '🎨', description: 'Bold design for creative fields', color: '#dc2626' },
  { id: 'executive', name: 'Executive', preview: '👔', description: 'Premium layout for senior positions', color: '#7c3aed' },
  { id: 'tech', name: 'Tech', preview: '💻', description: 'Modern monospaced look for developers', color: '#10b981' },
  { id: 'scholar', name: 'Scholar', preview: '🎓', description: 'Academic focus with serif typography', color: '#8b5cf6' },
  { id: 'compact', name: 'Compact', preview: '📱', description: 'Single page optimized layout', color: '#f59e0b' },
  { id: 'bold', name: 'Bold', preview: '🦁', description: 'Strong headers and high contrast', color: '#111827' },
  { id: 'grid', name: 'Grid', preview: '📰', description: 'Organized two-column structure', color: '#0ea5e9' },
  { id: 'noir', name: 'Noir', preview: '🌙', description: 'Dark elegant theme with gold accents', color: '#1a1a2e' },
  { id: 'magazine', name: 'Magazine', preview: '📰', description: 'Editorial spread with typographic flair', color: '#b91c1c' },
  { id: 'timeline', name: 'Timeline', preview: '⏳', description: 'Visual chronological journey layout', color: '#0d9488' },
  { id: 'swiss', name: 'Swiss', preview: '🇨🇭', description: 'International modernist grid design', color: '#e11d48' },
];

const accentPresets = [
  '#1e3a5f', '#6366f1', '#374151', '#0f766e', '#dc2626', '#7c3aed', 
  '#10b981', '#f59e0b', '#0ea5e9', '#e11d48', '#1a1a2e', '#b91c1c',
  '#0d9488', '#8b5cf6', '#d97706', '#111827', '#be185d', '#059669',
];

const CVBuilder: React.FC = () => {
  const [step, setStep] = useState<'template' | 'edit' | 'preview'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(templates[0]);
  const [cvData, setCVData] = useState<CVData>(defaultCVData);
  const [activeSection, setActiveSection] = useState<'personal' | 'education' | 'experience' | 'skills'>('personal');
  const [skillInput, setSkillInput] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [customColor, setCustomColor] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addEducation = () => {
    setCVData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: generateId(),
        institution: '',
        degree: '',
        field: '',
        startYear: '',
        endYear: '',
        gpa: ''
      }]
    }));
  };

  const addExperience = () => {
    setCVData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: generateId(),
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      }]
    }));
  };

  const addCertification = () => {
    setCVData(prev => ({
      ...prev,
      certifications: [...prev.certifications, {
        id: generateId(),
        name: '',
        issuer: '',
        year: ''
      }]
    }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !cvData.skills.includes(skillInput.trim())) {
      setCVData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setCVData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      education: prev.education.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const updateExperience = (id: string, field: string, value: string | boolean) => {
    setCVData(prev => ({
      ...prev,
      experience: prev.experience.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const updateCertification = (id: string, field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      certifications: prev.certifications.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const removeEducation = (id: string) => {
    setCVData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
  };

  const removeExperience = (id: string) => {
    setCVData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }));
  };

  const removeCertification = (id: string) => {
    setCVData(prev => ({ ...prev, certifications: prev.certifications.filter(c => c.id !== id) }));
  };

  const handleSavePDF = () => {
    if (!cvData.personalInfo.fullName) {
      toast.error('Please fill in at least your name');
      return;
    }
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!cvData.personalInfo.fullName) {
      toast.error('Please fill in at least your name');
      return;
    }

    const element = printRef.current;
    if (!element) return;

    setIsDownloading(true);
    toast.info('Generating PDF...');

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `${cvData.personalInfo.fullName.replace(/\s+/g, '_')}_CV.pdf`;
      pdf.save(filename);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const renderTemplate = () => {
    const { personalInfo, education, experience, skills, certifications } = cvData;
    const color = customColor || selectedTemplate.color;

    const commonStyles: Record<string, string> = {
      classic: `
        <div style="font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 40px;">
          <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid ${color}; padding-bottom: 16px;">
            <h1 style="font-size: 28px; color: ${color}; margin-bottom: 8px;">${personalInfo.fullName || 'Your Name'}</h1>
            <div style="font-size: 12px; color: #666;">
              ${[personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join(' • ')}
            </div>
            ${personalInfo.linkedin || personalInfo.github ? `<div style="font-size: 11px; color: #888; margin-top: 4px;">${[personalInfo.linkedin, personalInfo.github].filter(Boolean).join(' | ')}</div>` : ''}
          </div>
          
          ${personalInfo.summary ? `
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 14px; color: ${color}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px;">Professional Summary</h2>
              <p style="font-size: 11px; color: #555; line-height: 1.6;">${personalInfo.summary}</p>
            </div>
          ` : ''}
          
          ${experience.length > 0 ? `
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 14px; color: ${color}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px;">Experience</h2>
              ${experience.map(exp => `
                <div style="margin-bottom: 12px;">
                  <div style="display: flex; justify-content: space-between;">
                    <strong style="color: #333;">${exp.position}</strong>
                    <span style="font-size: 10px; color: #666;">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <div style="color: #555; font-size: 11px;">${exp.company}${exp.location ? `, ${exp.location}` : ''}</div>
                  ${exp.description ? `<p style="font-size: 10px; color: #666; margin-top: 4px;">${exp.description}</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${education.length > 0 ? `
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 14px; color: ${color}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px;">Education</h2>
              ${education.map(edu => `
                <div style="margin-bottom: 10px;">
                  <div style="display: flex; justify-content: space-between;">
                    <strong style="color: #333;">${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</strong>
                    <span style="font-size: 10px; color: #666;">${edu.startYear} - ${edu.endYear}</span>
                  </div>
                  <div style="color: #555; font-size: 11px;">${edu.institution}${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${skills.length > 0 ? `
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 14px; color: ${color}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px;">Skills</h2>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${skills.map(skill => `<span style="padding: 4px 10px; background: #f3f4f6; font-size: 10px; border-radius: 4px;">${skill}</span>`).join('')}
              </div>
            </div>
          ` : ''}
          
          ${certifications.length > 0 ? `
            <div>
              <h2 style="font-size: 14px; color: ${color}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px;">Certifications</h2>
              ${certifications.map(cert => `
                <div style="margin-bottom: 6px;">
                  <strong style="font-size: 11px; color: #333;">${cert.name}</strong>
                  <span style="font-size: 10px; color: #666;"> - ${cert.issuer}, ${cert.year}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `,
      modern: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, ${color}, ${color}dd); color: white; padding: 30px 40px;">
            <h1 style="font-size: 32px; margin-bottom: 8px;">${personalInfo.fullName || 'Your Name'}</h1>
            <div style="font-size: 13px; opacity: 0.9;">
              ${[personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join(' | ')}
            </div>
          </div>
          <div style="padding: 30px 40px;">
            ${personalInfo.summary ? `
              <div style="margin-bottom: 24px;">
                <h2 style="font-size: 16px; color: ${color}; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                  <span style="width: 4px; height: 16px; background: ${color}; display: inline-block;"></span> About Me
                </h2>
                <p style="color: #555; line-height: 1.7;">${personalInfo.summary}</p>
              </div>
            ` : ''}
            ${experience.length > 0 ? `
              <div style="margin-bottom: 24px;">
                <h2 style="font-size: 16px; color: ${color}; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                  <span style="width: 4px; height: 16px; background: ${color}; display: inline-block;"></span> Experience
                </h2>
                ${experience.map(exp => `
                  <div style="margin-bottom: 16px; padding-left: 16px; border-left: 2px solid #eee;">
                    <div style="font-weight: 600; color: #333;">${exp.position}</div>
                    <div style="font-size: 12px; color: ${color};">${exp.company} | ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
                    ${exp.description ? `<p style="font-size: 12px; color: #666; margin-top: 6px;">${exp.description}</p>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
            ${education.length > 0 ? `
              <div style="margin-bottom: 24px;">
                <h2 style="font-size: 16px; color: ${color}; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                  <span style="width: 4px; height: 16px; background: ${color}; display: inline-block;"></span> Education
                </h2>
                ${education.map(edu => `
                  <div style="margin-bottom: 12px; padding-left: 16px; border-left: 2px solid #eee;">
                    <div style="font-weight: 600; color: #333;">${edu.degree}${edu.field ? ` - ${edu.field}` : ''}</div>
                    <div style="font-size: 12px; color: #666;">${edu.institution} | ${edu.startYear} - ${edu.endYear}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            ${skills.length > 0 ? `
              <div style="margin-bottom: 24px;">
                <h2 style="font-size: 16px; color: ${color}; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                  <span style="width: 4px; height: 16px; background: ${color}; display: inline-block;"></span> Skills
                </h2>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  ${skills.map(skill => `<span style="padding: 6px 14px; background: ${color}15; color: ${color}; font-size: 12px; border-radius: 20px;">${skill}</span>`).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      `,
      minimal: `
        <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 700px; margin: 0 auto; padding: 50px;">
          <h1 style="font-size: 36px; font-weight: 300; color: #111; margin-bottom: 8px;">${personalInfo.fullName || 'Your Name'}</h1>
          <div style="font-size: 13px; color: #888; margin-bottom: 40px;">
            ${[personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join(' / ')}
          </div>
          
          ${personalInfo.summary ? `<p style="font-size: 14px; color: #555; line-height: 1.8; margin-bottom: 40px;">${personalInfo.summary}</p>` : ''}
          
          ${experience.length > 0 ? `
            <div style="margin-bottom: 36px;">
              <h2 style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #999; margin-bottom: 16px;">Experience</h2>
              ${experience.map(exp => `
                <div style="margin-bottom: 20px;">
                  <div style="font-size: 15px; font-weight: 500; color: #111;">${exp.position}</div>
                  <div style="font-size: 12px; color: #666;">${exp.company} • ${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}</div>
                  ${exp.description ? `<p style="font-size: 12px; color: #777; margin-top: 8px; line-height: 1.6;">${exp.description}</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${education.length > 0 ? `
            <div style="margin-bottom: 36px;">
              <h2 style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #999; margin-bottom: 16px;">Education</h2>
              ${education.map(edu => `
                <div style="margin-bottom: 16px;">
                  <div style="font-size: 14px; font-weight: 500; color: #111;">${edu.degree}</div>
                  <div style="font-size: 12px; color: #666;">${edu.institution} • ${edu.endYear}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${skills.length > 0 ? `
            <div>
              <h2 style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #999; margin-bottom: 12px;">Skills</h2>
              <p style="font-size: 13px; color: #555;">${skills.join(', ')}</p>
            </div>
          ` : ''}
        </div>
      `,
      professional: `
        <div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto;">
          <div style="background: ${color}; padding: 24px 40px; display: flex; justify-content: space-between; align-items: center;">
            <h1 style="font-size: 28px; color: white; margin: 0;">${personalInfo.fullName || 'Your Name'}</h1>
          </div>
          <div style="padding: 8px 40px; background: #f8f9fa; font-size: 11px; color: #555; border-bottom: 1px solid #eee;">
            ${[personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join(' | ')}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 30px; padding: 30px 40px;">
            <div>
              ${skills.length > 0 ? `
                <div style="margin-bottom: 24px;">
                  <h3 style="font-size: 12px; color: ${color}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; border-bottom: 1px solid ${color}; padding-bottom: 4px;">Skills</h3>
                  ${skills.map(skill => `<div style="font-size: 11px; color: #555; padding: 4px 0;">• ${skill}</div>`).join('')}
                </div>
              ` : ''}
              ${certifications.length > 0 ? `
                <div>
                  <h3 style="font-size: 12px; color: ${color}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; border-bottom: 1px solid ${color}; padding-bottom: 4px;">Certifications</h3>
                  ${certifications.map(cert => `
                    <div style="margin-bottom: 8px;">
                      <div style="font-size: 11px; font-weight: 600; color: #333;">${cert.name}</div>
                      <div style="font-size: 10px; color: #666;">${cert.issuer}, ${cert.year}</div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
            <div>
              ${personalInfo.summary ? `
                <div style="margin-bottom: 24px;">
                  <h3 style="font-size: 12px; color: ${color}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Profile</h3>
                  <p style="font-size: 11px; color: #555; line-height: 1.6;">${personalInfo.summary}</p>
                </div>
              ` : ''}
              ${experience.length > 0 ? `
                <div style="margin-bottom: 24px;">
                  <h3 style="font-size: 12px; color: ${color}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Experience</h3>
                  ${experience.map(exp => `
                    <div style="margin-bottom: 14px;">
                      <div style="display: flex; justify-content: space-between;">
                        <strong style="font-size: 12px; color: #333;">${exp.position}</strong>
                        <span style="font-size: 10px; color: #888;">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</span>
                      </div>
                      <div style="font-size: 11px; color: ${color};">${exp.company}</div>
                      ${exp.description ? `<p style="font-size: 10px; color: #666; margin-top: 4px;">${exp.description}</p>` : ''}
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              ${education.length > 0 ? `
                <div>
                  <h3 style="font-size: 12px; color: ${color}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Education</h3>
                  ${education.map(edu => `
                    <div style="margin-bottom: 10px;">
                      <strong style="font-size: 11px; color: #333;">${edu.degree}${edu.field ? `, ${edu.field}` : ''}</strong>
                      <div style="font-size: 10px; color: #666;">${edu.institution} | ${edu.startYear} - ${edu.endYear}</div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `,
      creative: `
        <div style="font-family: 'Arial Black', sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="background: ${color}; padding: 40px; text-align: center;">
            <h1 style="font-size: 42px; color: white; margin: 0; text-transform: uppercase; letter-spacing: 4px;">${personalInfo.fullName || 'Your Name'}</h1>
          </div>
          <div style="padding: 30px 40px;">
            <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 30px; font-size: 12px; color: #666;">
              ${personalInfo.email ? `<span>✉️ ${personalInfo.email}</span>` : ''}
              ${personalInfo.phone ? `<span>📱 ${personalInfo.phone}</span>` : ''}
              ${personalInfo.location ? `<span>📍 ${personalInfo.location}</span>` : ''}
            </div>
            
            ${personalInfo.summary ? `
              <div style="background: #f8f9fa; padding: 20px; margin-bottom: 24px; border-left: 4px solid ${color};">
                <p style="font-family: Georgia, serif; font-size: 13px; color: #555; line-height: 1.7; margin: 0; font-style: italic;">"${personalInfo.summary}"</p>
              </div>
            ` : ''}
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
              <div>
                ${experience.length > 0 ? `
                  <h2 style="font-size: 14px; color: ${color}; text-transform: uppercase; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 3px solid ${color};">Experience</h2>
                  ${experience.map(exp => `
                    <div style="margin-bottom: 16px;">
                      <div style="font-size: 13px; font-weight: bold; color: #333;">${exp.position}</div>
                      <div style="font-size: 11px; color: ${color}; font-weight: bold;">${exp.company}</div>
                      <div style="font-size: 10px; color: #888;">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
                    </div>
                  `).join('')}
                ` : ''}
              </div>
              <div>
                ${education.length > 0 ? `
                  <h2 style="font-size: 14px; color: ${color}; text-transform: uppercase; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 3px solid ${color};">Education</h2>
                  ${education.map(edu => `
                    <div style="margin-bottom: 14px;">
                      <div style="font-size: 12px; font-weight: bold; color: #333;">${edu.degree}</div>
                      <div style="font-size: 11px; color: #666;">${edu.institution}</div>
                    </div>
                  `).join('')}
                ` : ''}
                ${skills.length > 0 ? `
                  <h2 style="font-size: 14px; color: ${color}; text-transform: uppercase; margin: 20px 0 16px; padding-bottom: 8px; border-bottom: 3px solid ${color};">Skills</h2>
                  <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                    ${skills.map(skill => `<span style="padding: 4px 12px; background: ${color}; color: white; font-size: 10px; text-transform: uppercase;">${skill}</span>`).join('')}
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `,
      executive: `
        <div style="font-family: 'Garamond', serif; max-width: 800px; margin: 0 auto; border: 2px solid ${color};">
          <div style="padding: 40px; text-align: center; border-bottom: 1px solid #eee;">
            <h1 style="font-size: 36px; color: ${color}; margin: 0 0 8px; font-weight: normal; letter-spacing: 8px; text-transform: uppercase;">${personalInfo.fullName || 'Your Name'}</h1>
            <div style="font-size: 12px; color: #888; letter-spacing: 2px;">
              ${[personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join(' • ')}
            </div>
          </div>
          <div style="padding: 30px 50px;">
            ${personalInfo.summary ? `
              <div style="margin-bottom: 30px; text-align: center;">
                <p style="font-size: 13px; color: #555; line-height: 1.8; font-style: italic; max-width: 600px; margin: 0 auto;">${personalInfo.summary}</p>
              </div>
            ` : ''}
            
            ${experience.length > 0 ? `
              <div style="margin-bottom: 28px;">
                <h2 style="font-size: 12px; color: ${color}; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 16px; text-align: center;">
                  ── Professional Experience ──
                </h2>
                ${experience.map(exp => `
                  <div style="margin-bottom: 18px; padding: 16px; background: #fafafa;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                      <strong style="font-size: 14px; color: ${color};">${exp.position}</strong>
                      <span style="font-size: 11px; color: #888;">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</span>
                    </div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 6px;">${exp.company}${exp.location ? ` | ${exp.location}` : ''}</div>
                    ${exp.description ? `<p style="font-size: 11px; color: #555; line-height: 1.6;">${exp.description}</p>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
              ${education.length > 0 ? `
                <div>
                  <h2 style="font-size: 12px; color: ${color}; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 14px; text-align: center;">── Education ──</h2>
                  ${education.map(edu => `
                    <div style="margin-bottom: 12px; text-align: center;">
                      <div style="font-size: 13px; color: #333;">${edu.degree}</div>
                      <div style="font-size: 11px; color: #666;">${edu.institution}, ${edu.endYear}</div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              ${skills.length > 0 ? `
                <div>
                  <h2 style="font-size: 12px; color: ${color}; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 14px; text-align: center;">── Expertise ──</h2>
                  <p style="font-size: 12px; color: #555; text-align: center; line-height: 1.8;">${skills.join(' • ')}</p>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `,
      tech: `
        <div style="font-family: 'Courier New', monospace; max-width: 800px; margin: 0 auto; color: #333; padding: 40px;">
          <div style="border-bottom: 2px solid ${color}; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="font-size: 32px; color: ${color}; margin-bottom: 10px;">&lt;${personalInfo.fullName || 'Dev_Name'} /&gt;</h1>
            <div style="font-size: 12px;">
              ${[personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.github].filter(Boolean).map(item => `[ "${item}" ]`).join(' ')}
            </div>
          </div>
          ${personalInfo.summary ? `
            <div style="margin-bottom: 30px;">
              <h3 style="font-size: 16px; color: ${color}; font-weight: bold; margin-bottom: 10px;">// ABOUT_ME</h3>
              <p style="font-size: 12px; line-height: 1.6;">${personalInfo.summary}</p>
            </div>
          ` : ''}
          ${skills.length > 0 ? `
            <div style="margin-bottom: 30px;">
              <h3 style="font-size: 16px; color: ${color}; font-weight: bold; margin-bottom: 10px;">// TECH_STACK</h3>
              <div style="font-size: 12px; line-height: 1.8;">const skills = [ ${skills.map(s => `"${s}"`).join(', ')} ];</div>
            </div>
          ` : ''}
          ${experience.length > 0 ? `
            <div style="margin-bottom: 30px;">
              <h3 style="font-size: 16px; color: ${color}; font-weight: bold; margin-bottom: 15px;">// EXPERIENCE_LOG</h3>
              ${experience.map(exp => `
                <div style="margin-bottom: 20px; padding-left: 15px; border-left: 2px solid #eee;">
                  <div style="font-weight: bold; font-size: 14px;">${exp.position} @ ${exp.company}</div>
                  <div style="font-size: 11px; color: #666; margin-bottom: 5px;">${exp.startDate} -> ${exp.current ? 'Present' : exp.endDate}</div>
                  ${exp.description ? `<div style="font-size: 12px; line-height: 1.5;">${exp.description}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${education.length > 0 ? `
            <div>
              <h3 style="font-size: 16px; color: ${color}; font-weight: bold; margin-bottom: 15px;">// EDUCATION_DATA</h3>
              ${education.map(edu => `
                <div style="margin-bottom: 10px;">
                  <div style="font-weight: bold; font-size: 13px;">${edu.degree}</div>
                  <div style="font-size: 11px;">${edu.institution} (${edu.startYear}-${edu.endYear})</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `,
      scholar: `
        <div style="font-family: Georgia, serif; max-width: 800px; margin: 0 auto; line-height: 1.6; padding: 40px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 30px; font-weight: normal; margin-bottom: 10px; color: ${color};">${personalInfo.fullName || 'Your Name'}</h1>
            <div style="font-size: 12px; font-style: italic; color: #555;">
              ${[personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join(' • ')}
            </div>
          </div>
          ${education.length > 0 ? `
            <div style="margin-bottom: 30px;">
              <h3 style="font-size: 14px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; color: ${color};">Education</h3>
              ${education.map(edu => `
                <div style="margin-bottom: 12px;">
                  <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 13px;">
                    <span>${edu.institution}</span><span>${edu.endYear}</span>
                  </div>
                  <div style="font-size: 13px; font-style: italic;">${edu.degree}${edu.field ? `, ${edu.field}` : ''}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${experience.length > 0 ? `
            <div style="margin-bottom: 30px;">
              <h3 style="font-size: 14px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; color: ${color};">Professional History</h3>
              ${experience.map(exp => `
                <div style="margin-bottom: 20px;">
                  <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 13px;">
                    <span>${exp.company}</span><span>${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <div style="font-size: 13px; font-style: italic; margin-bottom: 5px;">${exp.position}</div>
                  ${exp.description ? `<div style="font-size: 12px; text-align: justify;">${exp.description}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${certifications.length > 0 ? `
            <div style="margin-bottom: 30px;">
              <h3 style="font-size: 14px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; color: ${color};">Credentials</h3>
              ${certifications.map(cert => `<div style="font-size: 12px; margin-bottom: 5px;"><strong>${cert.name}</strong>, ${cert.issuer} (${cert.year})</div>`).join('')}
            </div>
          ` : ''}
          ${skills.length > 0 ? `
            <div>
              <h3 style="font-size: 14px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; color: ${color};">Competencies</h3>
              <div style="font-size: 12px;">${skills.join('; ')}</div>
            </div>
          ` : ''}
        </div>
      `,
      compact: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; display: grid; grid-template-columns: 200px 1fr; gap: 20px;">
          <div style="background: #f5f5f5; padding: 20px; font-size: 11px;">
            <h1 style="font-size: 20px; color: ${color}; margin-bottom: 20px; line-height: 1.2;">${personalInfo.fullName || 'Name'}</h1>
            <div style="margin-bottom: 20px;">
              <strong style="display: block; margin-bottom: 5px;">CONTACT</strong>
              <div style="margin-bottom: 3px;">${personalInfo.email}</div>
              <div style="margin-bottom: 3px;">${personalInfo.phone}</div>
              <div>${personalInfo.location}</div>
            </div>
            ${skills.length > 0 ? `
              <div style="margin-bottom: 20px;">
                <strong style="display: block; margin-bottom: 8px;">SKILLS</strong>
                ${skills.map(s => `<div style="margin-bottom: 4px;">• ${s}</div>`).join('')}
              </div>
            ` : ''}
            ${education.length > 0 ? `
              <div>
                <strong style="display: block; margin-bottom: 8px;">EDUCATION</strong>
                ${education.map(edu => `
                  <div style="margin-bottom: 10px;">
                    <div>${edu.degree}</div>
                    <div style="color: #666;">${edu.institution}</div>
                    <div style="color: #999;">${edu.endYear}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
          <div style="padding: 20px 0;">
            ${personalInfo.summary ? `
              <div style="margin-bottom: 25px; font-size: 12px; line-height: 1.5;">
                <strong style="font-size: 14px; color: ${color}; display: block; margin-bottom: 8px; border-bottom: 2px solid ${color}; padding-bottom: 3px;">PROFILE</strong>
                ${personalInfo.summary}
              </div>
            ` : ''}
            ${experience.length > 0 ? `
              <div>
                <strong style="font-size: 14px; color: ${color}; display: block; margin-bottom: 15px; border-bottom: 2px solid ${color}; padding-bottom: 3px;">EXPERIENCE</strong>
                ${experience.map(exp => `
                  <div style="margin-bottom: 20px;">
                    <div style="font-weight: bold; font-size: 13px;">${exp.position}</div>
                    <div style="font-size: 11px; color: ${color}; margin-bottom: 5px;">${exp.company} | ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
                    ${exp.description ? `<div style="font-size: 12px; line-height: 1.5;">${exp.description}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      `,
      bold: `
        <div style="font-family: 'Impact', sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="background: ${color}; color: white; padding: 40px; text-transform: uppercase;">
            <h1 style="font-size: 48px; margin: 0; letter-spacing: 2px; line-height: 1;">${personalInfo.fullName?.split(' ')[0] || 'FIRST'}</h1>
            <h1 style="font-size: 48px; margin: 0; opacity: 0.8; letter-spacing: 2px; line-height: 1;">${personalInfo.fullName?.split(' ').slice(1).join(' ') || 'LAST'}</h1>
          </div>
          <div style="padding: 30px 40px; font-family: 'Arial', sans-serif;">
            <div style="display: flex; gap: 30px; margin-bottom: 40px; font-size: 12px; font-weight: bold; border-bottom: 4px solid #000; padding-bottom: 20px;">
              ${[personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).map(item => `<span>${item}</span>`).join('')}
            </div>
            ${personalInfo.summary ? `<div style="margin-bottom: 40px;"><p style="font-size: 18px; font-weight: bold; line-height: 1.4;">${personalInfo.summary}</p></div>` : ''}
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
              <div>
                <h3 style="background: #000; color: white; display: inline-block; padding: 5px 10px; margin-bottom: 20px; font-size: 14px;">EXPERIENCE</h3>
                ${experience.map(exp => `
                  <div style="margin-bottom: 20px;">
                    <div style="font-weight: 900; font-size: 14px;">${exp.position}</div>
                    <div style="font-size: 12px; margin-bottom: 5px; opacity: 0.7;">${exp.company}</div>
                    ${exp.description ? `<div style="font-size: 12px; line-height: 1.4;">${exp.description}</div>` : ''}
                  </div>
                `).join('')}
              </div>
              <div>
                ${education.length > 0 ? `
                  <div style="margin-bottom: 30px;">
                    <h3 style="background: #000; color: white; display: inline-block; padding: 5px 10px; margin-bottom: 20px; font-size: 14px;">EDUCATION</h3>
                    ${education.map(edu => `
                      <div style="margin-bottom: 15px;">
                        <div style="font-weight: 900; font-size: 14px;">${edu.degree}</div>
                        <div style="font-size: 12px;">${edu.institution}</div>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
                ${skills.length > 0 ? `
                  <div>
                    <h3 style="background: #000; color: white; display: inline-block; padding: 5px 10px; margin-bottom: 20px; font-size: 14px;">SKILLS</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                      ${skills.map(s => `<span style="border: 2px solid #000; padding: 2px 6px; font-size: 11px; font-weight: bold;">${s}</span>`).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `,
      grid: `
        <div style="font-family: 'Verdana', sans-serif; max-width: 800px; margin: 0 auto; border-top: 10px solid ${color};">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 40px; padding: 40px;">
            <div>
              <h1 style="font-size: 36px; margin-bottom: 5px; color: #333;">${personalInfo.fullName || 'Name'}</h1>
              <p style="color: ${color}; font-size: 14px; margin-bottom: 30px;">${personalInfo.summary || 'Professional Title'}</p>
              ${experience.length > 0 ? `
                <div style="margin-bottom: 30px;">
                  <h3 style="color: ${color}; font-size: 12px; letter-spacing: 1px; margin-bottom: 15px; text-transform: uppercase;">Work Experience</h3>
                  ${experience.map(exp => `
                    <div style="margin-bottom: 20px;">
                      <div style="font-weight: bold; font-size: 13px; color: #000;">${exp.position}</div>
                      <div style="font-size: 11px; color: #666; margin-bottom: 6px;">${exp.company} | ${exp.startDate}-${exp.current ? 'Present' : exp.endDate}</div>
                      ${exp.description ? `<div style="font-size: 12px; color: #444; line-height: 1.6;">${exp.description}</div>` : ''}
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
            <div style="text-align: right;">
              <div style="margin-bottom: 30px;">
                <h3 style="color: ${color}; font-size: 12px; letter-spacing: 1px; margin-bottom: 15px; text-transform: uppercase;">Contact</h3>
                <div style="font-size: 11px; color: #444; line-height: 1.8;">
                  <div>${personalInfo.email}</div><div>${personalInfo.phone}</div><div>${personalInfo.location}</div>
                </div>
              </div>
              ${education.length > 0 ? `
                <div style="margin-bottom: 30px;">
                  <h3 style="color: ${color}; font-size: 12px; letter-spacing: 1px; margin-bottom: 15px; text-transform: uppercase;">Education</h3>
                  ${education.map(edu => `
                    <div style="margin-bottom: 15px;">
                      <div style="font-weight: bold; font-size: 12px;">${edu.degree}</div>
                      <div style="font-size: 11px; color: #666;">${edu.institution}</div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              ${skills.length > 0 ? `
                <div>
                  <h3 style="color: ${color}; font-size: 12px; letter-spacing: 1px; margin-bottom: 15px; text-transform: uppercase;">Skills</h3>
                  <div style="font-size: 11px; color: #444;">${skills.map(s => `<div style="margin-bottom: 4px;">${s}</div>`).join('')}</div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `,

      noir: `
        <div style="font-family: 'Georgia', serif; max-width: 800px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; min-height: 600px;">
          <div style="padding: 50px 40px 30px;">
            <div style="border-bottom: 1px solid #c9a84c; padding-bottom: 20px; margin-bottom: 30px;">
              <h1 style="font-size: 38px; color: #c9a84c; margin: 0 0 8px; font-weight: 400; letter-spacing: 6px; text-transform: uppercase;">${personalInfo.fullName || 'Your Name'}</h1>
              <div style="font-size: 12px; color: #888; letter-spacing: 2px;">
                ${[personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join('  ·  ')}
              </div>
            </div>

            ${personalInfo.summary ? `
              <div style="margin-bottom: 30px; padding: 20px; border-left: 3px solid #c9a84c; background: rgba(201,168,76,0.05);">
                <p style="font-size: 13px; color: #bbb; line-height: 1.8; margin: 0; font-style: italic;">${personalInfo.summary}</p>
              </div>
            ` : ''}

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
              <div>
                ${experience.length > 0 ? `
                  <h2 style="font-size: 11px; color: #c9a84c; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 20px;">Experience</h2>
                  ${experience.map(exp => `
                    <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #2a2a3e;">
                      <div style="font-size: 14px; color: #fff; font-weight: 600;">${exp.position}</div>
                      <div style="font-size: 11px; color: #c9a84c; margin: 4px 0;">${exp.company}</div>
                      <div style="font-size: 10px; color: #666;">${exp.startDate} — ${exp.current ? 'Present' : exp.endDate}</div>
                      ${exp.description ? `<p style="font-size: 11px; color: #999; margin-top: 8px; line-height: 1.6;">${exp.description}</p>` : ''}
                    </div>
                  `).join('')}
                ` : ''}
              </div>
              <div>
                ${education.length > 0 ? `
                  <h2 style="font-size: 11px; color: #c9a84c; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 20px;">Education</h2>
                  ${education.map(edu => `
                    <div style="margin-bottom: 16px;">
                      <div style="font-size: 13px; color: #fff;">${edu.degree}${edu.field ? ` — ${edu.field}` : ''}</div>
                      <div style="font-size: 11px; color: #888;">${edu.institution} · ${edu.endYear}</div>
                    </div>
                  `).join('')}
                ` : ''}
                ${skills.length > 0 ? `
                  <h2 style="font-size: 11px; color: #c9a84c; text-transform: uppercase; letter-spacing: 4px; margin: 30px 0 16px;">Skills</h2>
                  <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                    ${skills.map(skill => `<span style="padding: 5px 12px; border: 1px solid #c9a84c; color: #c9a84c; font-size: 10px; letter-spacing: 1px;">${skill}</span>`).join('')}
                  </div>
                ` : ''}
                ${certifications.length > 0 ? `
                  <h2 style="font-size: 11px; color: #c9a84c; text-transform: uppercase; letter-spacing: 4px; margin: 30px 0 16px;">Certifications</h2>
                  ${certifications.map(cert => `
                    <div style="margin-bottom: 8px; font-size: 11px; color: #bbb;">
                      <span style="color: #c9a84c;">▸</span> ${cert.name} — ${cert.issuer} (${cert.year})
                    </div>
                  `).join('')}
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `,

      magazine: `
        <div style="font-family: 'Georgia', serif; max-width: 800px; margin: 0 auto; position: relative;">
          <div style="background: ${color}; padding: 60px 40px 30px; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -30px; right: -20px; font-size: 200px; color: rgba(255,255,255,0.08); font-weight: 900; line-height: 1;">CV</div>
            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 6px; color: rgba(255,255,255,0.6); margin-bottom: 12px;">Curriculum Vitae</div>
            <h1 style="font-size: 52px; color: white; margin: 0; line-height: 1; font-weight: 900; font-style: italic;">${personalInfo.fullName || 'Your Name'}</h1>
            <div style="height: 3px; background: white; width: 60px; margin: 16px 0;"></div>
            <div style="font-size: 12px; color: rgba(255,255,255,0.8);">
              ${[personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join('  |  ')}
            </div>
          </div>
          <div style="padding: 35px 40px;">
            ${personalInfo.summary ? `
              <div style="margin-bottom: 30px; columns: 2; column-gap: 30px;">
                <p style="font-size: 13px; color: #444; line-height: 1.8; text-align: justify;">${personalInfo.summary}</p>
              </div>
            ` : ''}
            <div style="display: grid; grid-template-columns: 3fr 2fr; gap: 40px;">
              <div>
                ${experience.length > 0 ? `
                  <div style="margin-bottom: 30px;">
                    <h2 style="font-size: 18px; color: ${color}; margin-bottom: 5px; font-style: italic;">Experience</h2>
                    <div style="height: 2px; background: ${color}; width: 40px; margin-bottom: 20px;"></div>
                    ${experience.map(exp => `
                      <div style="margin-bottom: 20px;">
                        <div style="font-size: 15px; font-weight: bold; color: #222;">${exp.position}</div>
                        <div style="font-size: 12px; color: ${color}; font-weight: bold; margin: 2px 0;">${exp.company}</div>
                        <div style="font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px;">${exp.startDate} — ${exp.current ? 'Present' : exp.endDate}</div>
                        ${exp.description ? `<p style="font-size: 12px; color: #555; margin-top: 8px; line-height: 1.6; text-align: justify;">${exp.description}</p>` : ''}
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
              <div style="border-left: 1px solid #eee; padding-left: 30px;">
                ${education.length > 0 ? `
                  <div style="margin-bottom: 25px;">
                    <h2 style="font-size: 16px; color: ${color}; margin-bottom: 5px; font-style: italic;">Education</h2>
                    <div style="height: 2px; background: ${color}; width: 30px; margin-bottom: 16px;"></div>
                    ${education.map(edu => `
                      <div style="margin-bottom: 14px;">
                        <div style="font-size: 13px; font-weight: bold; color: #333;">${edu.degree}</div>
                        <div style="font-size: 11px; color: #666;">${edu.institution}</div>
                        <div style="font-size: 10px; color: #999;">${edu.startYear}–${edu.endYear}</div>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
                ${skills.length > 0 ? `
                  <div style="margin-bottom: 25px;">
                    <h2 style="font-size: 16px; color: ${color}; margin-bottom: 5px; font-style: italic;">Expertise</h2>
                    <div style="height: 2px; background: ${color}; width: 30px; margin-bottom: 16px;"></div>
                    ${skills.map(skill => `<div style="font-size: 12px; color: #444; padding: 6px 0; border-bottom: 1px dotted #ddd;">${skill}</div>`).join('')}
                  </div>
                ` : ''}
                ${certifications.length > 0 ? `
                  <div>
                    <h2 style="font-size: 16px; color: ${color}; margin-bottom: 5px; font-style: italic;">Awards</h2>
                    <div style="height: 2px; background: ${color}; width: 30px; margin-bottom: 16px;"></div>
                    ${certifications.map(cert => `<div style="font-size: 11px; color: #555; margin-bottom: 8px;"><strong>${cert.name}</strong><br/><span style="color: #888;">${cert.issuer}, ${cert.year}</span></div>`).join('')}
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `,

      timeline: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 34px; color: #222; margin: 0 0 6px; font-weight: 700;">${personalInfo.fullName || 'Your Name'}</h1>
            <div style="display: inline-flex; gap: 16px; font-size: 12px; color: #666; padding: 8px 20px; border: 1px solid #ddd; background: #fafafa;">
              ${[personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join(' · ')}
            </div>
          </div>

          ${personalInfo.summary ? `
            <div style="text-align: center; margin-bottom: 40px; max-width: 550px; margin-left: auto; margin-right: auto;">
              <p style="font-size: 14px; color: #555; line-height: 1.7;">${personalInfo.summary}</p>
            </div>
          ` : ''}

          <div style="position: relative; padding-left: 30px; border-left: 3px solid ${color};">
            ${experience.length > 0 ? `
              <div style="margin-bottom: 10px;">
                <div style="position: absolute; left: -8px; width: 13px; height: 13px; background: ${color}; border-radius: 50%;"></div>
                <h2 style="font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: ${color}; margin-bottom: 16px; margin-left: 10px;">Career Journey</h2>
              </div>
              ${experience.map(exp => `
                <div style="margin-bottom: 24px; margin-left: 10px; position: relative;">
                  <div style="position: absolute; left: -44px; top: 4px; width: 9px; height: 9px; background: white; border: 2px solid ${color}; border-radius: 50%;"></div>
                  <div style="font-size: 10px; color: white; background: ${color}; display: inline-block; padding: 2px 10px; margin-bottom: 6px;">${exp.startDate} — ${exp.current ? 'Present' : exp.endDate}</div>
                  <div style="font-size: 15px; font-weight: 700; color: #222;">${exp.position}</div>
                  <div style="font-size: 12px; color: ${color}; font-weight: 600;">${exp.company}${exp.location ? `, ${exp.location}` : ''}</div>
                  ${exp.description ? `<p style="font-size: 12px; color: #666; margin-top: 6px; line-height: 1.6;">${exp.description}</p>` : ''}
                </div>
              `).join('')}
            ` : ''}

            ${education.length > 0 ? `
              <div style="margin-bottom: 10px; margin-top: 20px;">
                <div style="position: absolute; left: -8px; width: 13px; height: 13px; background: ${color}; border-radius: 50%;"></div>
                <h2 style="font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: ${color}; margin-bottom: 16px; margin-left: 10px;">Education</h2>
              </div>
              ${education.map(edu => `
                <div style="margin-bottom: 18px; margin-left: 10px; position: relative;">
                  <div style="position: absolute; left: -44px; top: 4px; width: 9px; height: 9px; background: white; border: 2px solid ${color}; border-radius: 50%;"></div>
                  <div style="font-size: 10px; color: white; background: ${color}; display: inline-block; padding: 2px 10px; margin-bottom: 6px;">${edu.startYear} — ${edu.endYear}</div>
                  <div style="font-size: 14px; font-weight: 700; color: #222;">${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</div>
                  <div style="font-size: 12px; color: #666;">${edu.institution}</div>
                </div>
              `).join('')}
            ` : ''}
          </div>

          ${skills.length > 0 ? `
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <h2 style="font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: ${color}; margin-bottom: 14px;">Skills & Tools</h2>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${skills.map(skill => `<span style="padding: 6px 16px; background: ${color}10; color: ${color}; font-size: 11px; border-radius: 20px; border: 1px solid ${color}30;">${skill}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `,

      swiss: `
        <div style="font-family: 'Helvetica Neue', 'Arial', sans-serif; max-width: 800px; margin: 0 auto; padding: 0;">
          <div style="display: grid; grid-template-columns: 250px 1fr; min-height: 600px;">
            <div style="background: ${color}; color: white; padding: 40px 25px;">
              <div style="font-size: 72px; font-weight: 900; line-height: 0.9; margin-bottom: 30px; opacity: 0.2;">CV</div>
              <div style="margin-bottom: 30px;">
                <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 3px; opacity: 0.6; margin-bottom: 10px;">Contact</div>
                <div style="font-size: 11px; line-height: 2;">
                  ${personalInfo.email ? `<div>${personalInfo.email}</div>` : ''}
                  ${personalInfo.phone ? `<div>${personalInfo.phone}</div>` : ''}
                  ${personalInfo.location ? `<div>${personalInfo.location}</div>` : ''}
                  ${personalInfo.linkedin ? `<div>${personalInfo.linkedin}</div>` : ''}
                  ${personalInfo.github ? `<div>${personalInfo.github}</div>` : ''}
                </div>
              </div>
              ${skills.length > 0 ? `
                <div style="margin-bottom: 30px;">
                  <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 3px; opacity: 0.6; margin-bottom: 10px;">Skills</div>
                  ${skills.map(skill => `
                    <div style="font-size: 11px; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">${skill}</div>
                  `).join('')}
                </div>
              ` : ''}
              ${certifications.length > 0 ? `
                <div>
                  <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 3px; opacity: 0.6; margin-bottom: 10px;">Certifications</div>
                  ${certifications.map(cert => `
                    <div style="font-size: 11px; margin-bottom: 10px;">
                      <div style="font-weight: 600;">${cert.name}</div>
                      <div style="opacity: 0.7; font-size: 10px;">${cert.issuer} · ${cert.year}</div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
            <div style="padding: 40px 35px;">
              <h1 style="font-size: 40px; font-weight: 900; color: #111; margin: 0 0 4px; line-height: 1;">${personalInfo.fullName || 'Your Name'}</h1>
              <div style="height: 4px; background: ${color}; width: 50px; margin: 12px 0 20px;"></div>
              ${personalInfo.summary ? `<p style="font-size: 13px; color: #555; line-height: 1.7; margin-bottom: 30px;">${personalInfo.summary}</p>` : ''}

              ${experience.length > 0 ? `
                <div style="margin-bottom: 30px;">
                  <h2 style="font-size: 10px; text-transform: uppercase; letter-spacing: 4px; color: ${color}; margin-bottom: 18px; font-weight: 700;">Experience</h2>
                  ${experience.map(exp => `
                    <div style="display: grid; grid-template-columns: 100px 1fr; gap: 15px; margin-bottom: 20px;">
                      <div style="font-size: 10px; color: #999; padding-top: 2px; text-align: right; border-right: 2px solid #eee; padding-right: 12px;">
                        ${exp.startDate}<br/>${exp.current ? 'Present' : exp.endDate}
                      </div>
                      <div>
                        <div style="font-size: 14px; font-weight: 700; color: #111;">${exp.position}</div>
                        <div style="font-size: 12px; color: ${color}; font-weight: 600;">${exp.company}</div>
                        ${exp.description ? `<p style="font-size: 11px; color: #666; margin-top: 6px; line-height: 1.6;">${exp.description}</p>` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              ${education.length > 0 ? `
                <div>
                  <h2 style="font-size: 10px; text-transform: uppercase; letter-spacing: 4px; color: ${color}; margin-bottom: 18px; font-weight: 700;">Education</h2>
                  ${education.map(edu => `
                    <div style="display: grid; grid-template-columns: 100px 1fr; gap: 15px; margin-bottom: 16px;">
                      <div style="font-size: 10px; color: #999; padding-top: 2px; text-align: right; border-right: 2px solid #eee; padding-right: 12px;">
                        ${edu.startYear}<br/>${edu.endYear}
                      </div>
                      <div>
                        <div style="font-size: 13px; font-weight: 700; color: #111;">${edu.degree}${edu.field ? ` — ${edu.field}` : ''}</div>
                        <div style="font-size: 11px; color: #666;">${edu.institution}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `,
    };

    return commonStyles[selectedTemplate.id] || commonStyles.classic;
  };

  return (
    <div className="w-full bg-white border rounded-none shadow-sm">
      <div className="flex flex-col min-h-[600px]">
        {/* Header */}
        <div className="px-4 md:px-6 py-3 md:py-4 border-b flex items-center justify-between bg-gradient-to-r from-ui-blue to-ui-blue/90">
          <div className="flex items-center gap-2 md:gap-3 text-white">
            <Sparkles size={20} className="md:w-6 md:h-6" />
            <div>
              <h2 className="font-serif text-lg md:text-xl">CV Builder</h2>
              <p className="text-[10px] md:text-xs opacity-75 hidden md:block">Create your professional CV in minutes</p>
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
              <Button size="sm" onClick={() => setStep('preview')} className="bg-white text-ui-blue hover:bg-white/90 h-8 px-2 md:h-9 md:px-4 rounded-none">
                <Eye size={16} className="md:mr-1" /> <span className="hidden md:inline">Preview</span>
              </Button>
            )}
            {step === 'preview' && (
              <>
                <Button 
                  size="sm" 
                  onClick={handleSavePDF} 
                  variant="ghost"
                  className="text-white hover:bg-white/20 h-8 px-2 md:h-9 md:px-4 rounded-none"
                >
                  <Printer size={16} className="md:mr-1" /> <span className="hidden md:inline">Print / Save</span>
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleDownloadPDF} 
                  disabled={isDownloading}
                  className="bg-nobel-gold hover:bg-nobel-gold/90 text-white h-8 px-2 md:h-9 md:px-4 rounded-none"
                >
                  {isDownloading ? (
                    <><Loader2 size={16} className="md:mr-1 animate-spin" /> <span className="hidden md:inline">Generating...</span></>
                  ) : (
                    <><Download size={16} className="md:mr-1" /> <span className="hidden md:inline">Download PDF</span></>
                  )}
                </Button>
              </>
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
                <h3 className="font-serif text-xl md:text-2xl mb-2">Choose a template</h3>
                <p className="text-muted-foreground mb-6 text-sm md:text-base">Select a design that matches your industry and style</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-20 md:pb-0">
                  {templates.map(template => (
                    <motion.div
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTemplate(template)}
                      className={`cursor-pointer border-2 p-4 md:p-6 transition-all rounded-none ${
                        selectedTemplate.id === template.id
                          ? 'border-ui-blue bg-ui-blue/5'
                          : 'border-border hover:border-muted-foreground/30'
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
                          <h4 className="font-bold text-foreground text-sm md:text-base">{template.name}</h4>
                          <p className="text-[10px] md:text-xs text-muted-foreground">{template.description}</p>
                        </div>
                        {selectedTemplate.id === template.id && (
                          <div className="w-5 h-5 md:w-6 md:h-6 bg-ui-blue flex items-center justify-center rounded-none">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <Button onClick={() => setStep('edit')} className="bg-ui-blue hover:bg-ui-blue/90 rounded-none w-full md:w-auto">
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
                <div className="w-full md:w-48 border-b md:border-b-0 md:border-r bg-secondary/50 p-2 md:p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible shrink-0 md:sticky md:top-0">
                  {[
                    { id: 'personal', label: 'Personal Info', icon: User },
                    { id: 'education', label: 'Education', icon: GraduationCap },
                    { id: 'experience', label: 'Experience', icon: Briefcase },
                    { id: 'skills', label: 'Skills & Certs', icon: Award }
                  ].map(section => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id as typeof activeSection)}
                      className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 text-left text-xs md:text-sm transition-all whitespace-nowrap rounded-none ${
                        activeSection === section.id
                          ? 'bg-ui-blue text-white'
                          : 'text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      <section.icon size={14} className="md:w-4 md:h-4" />
                      <span className="md:hidden">{section.label.split(' ')[0]}</span>
                      <span className="hidden md:inline">{section.label}</span>
                    </button>
                  ))}
                </div>

                {/* Form */}
                <div className="flex-1 p-4 md:p-6 w-full">
                    {activeSection === 'personal' && (
                      <div className="space-y-4 max-w-xl">
                        <h3 className="font-serif text-xl mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <Label>Full Name *</Label>
                            <Input value={cvData.personalInfo.fullName} onChange={e => setCVData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, fullName: e.target.value } }))} placeholder="John Doe" className="rounded-none" />
                          </div>
                          <div>
                            <Label>Email *</Label>
                            <Input type="email" value={cvData.personalInfo.email} onChange={e => setCVData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, email: e.target.value } }))} placeholder="john@email.com" className="rounded-none" />
                          </div>
                          <div>
                            <Label>Phone</Label>
                            <Input value={cvData.personalInfo.phone} onChange={e => setCVData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, phone: e.target.value } }))} placeholder="+234 xxx xxx xxxx" className="rounded-none" />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Location</Label>
                            <Input value={cvData.personalInfo.location} onChange={e => setCVData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, location: e.target.value } }))} placeholder="Lagos, Nigeria" className="rounded-none" />
                          </div>
                          <div>
                            <Label>LinkedIn URL</Label>
                            <Input value={cvData.personalInfo.linkedin} onChange={e => setCVData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, linkedin: e.target.value } }))} placeholder="linkedin.com/in/johndoe" className="rounded-none" />
                          </div>
                          <div>
                            <Label>GitHub URL</Label>
                            <Input value={cvData.personalInfo.github} onChange={e => setCVData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, github: e.target.value } }))} placeholder="github.com/johndoe" className="rounded-none" />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Professional Summary</Label>
                            <Textarea value={cvData.personalInfo.summary} onChange={e => setCVData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, summary: e.target.value } }))} placeholder="Brief overview of your professional background and career objectives..." rows={4} className="rounded-none" />
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === 'education' && (
                      <div className="space-y-4 max-w-xl">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-serif text-xl">Education</h3>
                          <Button size="sm" variant="outline" onClick={addEducation} className="rounded-none"><Plus size={14} className="mr-1" /> Add</Button>
                        </div>
                        {cvData.education.length === 0 && (
                          <p className="text-muted-foreground text-sm py-8 text-center border border-dashed rounded-none">No education added yet. Click "Add" to get started.</p>
                        )}
                        {cvData.education.map((edu) => (
                          <div key={edu.id} className="border p-4 relative rounded-none">
                            <button onClick={() => removeEducation(edu.id)} className="absolute top-2 right-2 text-muted-foreground/40 hover:text-destructive"><Trash2 size={16} /></button>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="col-span-2"><Label className="text-xs">Institution</Label><Input value={edu.institution} onChange={e => updateEducation(edu.id, 'institution', e.target.value)} placeholder="University of Ibadan" className="h-9 rounded-none" /></div>
                              <div><Label className="text-xs">Degree</Label><Input value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} placeholder="Bachelor's" className="h-9 rounded-none" /></div>
                              <div><Label className="text-xs">Field of Study</Label><Input value={edu.field} onChange={e => updateEducation(edu.id, 'field', e.target.value)} placeholder="Computer Science" className="h-9 rounded-none" /></div>
                              <div><Label className="text-xs">Start Year</Label><Input value={edu.startYear} onChange={e => updateEducation(edu.id, 'startYear', e.target.value)} placeholder="2020" className="h-9 rounded-none" /></div>
                              <div><Label className="text-xs">End Year</Label><Input value={edu.endYear} onChange={e => updateEducation(edu.id, 'endYear', e.target.value)} placeholder="2024" className="h-9 rounded-none" /></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeSection === 'experience' && (
                      <div className="space-y-4 max-w-xl">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-serif text-xl">Work Experience</h3>
                          <Button size="sm" variant="outline" onClick={addExperience} className="rounded-none"><Plus size={14} className="mr-1" /> Add</Button>
                        </div>
                        {cvData.experience.length === 0 && (
                          <p className="text-muted-foreground text-sm py-8 text-center border border-dashed rounded-none">No experience added yet. Click "Add" to get started.</p>
                        )}
                        {cvData.experience.map((exp) => (
                          <div key={exp.id} className="border p-4 relative rounded-none">
                            <button onClick={() => removeExperience(exp.id)} className="absolute top-2 right-2 text-muted-foreground/40 hover:text-destructive"><Trash2 size={16} /></button>
                            <div className="grid grid-cols-2 gap-3">
                              <div><Label className="text-xs">Position</Label><Input value={exp.position} onChange={e => updateExperience(exp.id, 'position', e.target.value)} placeholder="Software Engineer" className="h-9 rounded-none" /></div>
                              <div><Label className="text-xs">Company</Label><Input value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} placeholder="Tech Corp" className="h-9 rounded-none" /></div>
                              <div><Label className="text-xs">Start Date</Label><Input value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} placeholder="Jan 2022" className="h-9 rounded-none" /></div>
                              <div><Label className="text-xs">End Date</Label><Input value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} placeholder="Present" disabled={exp.current} className="h-9 rounded-none" /></div>
                              <div className="col-span-2"><Label className="text-xs">Description</Label><Textarea value={exp.description} onChange={e => updateExperience(exp.id, 'description', e.target.value)} placeholder="Key responsibilities and achievements..." rows={2} className="rounded-none" /></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeSection === 'skills' && (
                      <div className="space-y-6 max-w-xl">
                        <div>
                          <h3 className="font-serif text-xl mb-4">Skills</h3>
                          <div className="flex gap-2 mb-3">
                            <Input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && addSkill()} placeholder="Add a skill..." className="flex-1 rounded-none" />
                            <Button onClick={addSkill} size="sm" className="rounded-none">Add</Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {cvData.skills.map(skill => (
                              <span key={skill} className="px-3 py-1.5 bg-ui-blue/10 text-ui-blue text-sm rounded-none flex items-center gap-2">
                                {skill}
                                <button onClick={() => removeSkill(skill)} className="hover:text-destructive"><Trash2 size={12} /></button>
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-serif text-xl">Certifications</h3>
                            <Button size="sm" variant="outline" onClick={addCertification} className="rounded-none"><Plus size={14} className="mr-1" /> Add</Button>
                          </div>
                          {cvData.certifications.map(cert => (
                            <div key={cert.id} className="border p-4 relative mb-3 rounded-none">
                              <button onClick={() => removeCertification(cert.id)} className="absolute top-2 right-2 text-muted-foreground/40 hover:text-destructive"><Trash2 size={16} /></button>
                              <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2"><Label className="text-xs">Certification Name</Label><Input value={cert.name} onChange={e => updateCertification(cert.id, 'name', e.target.value)} placeholder="AWS Certified" className="h-9 rounded-none" /></div>
                                <div><Label className="text-xs">Year</Label><Input value={cert.year} onChange={e => updateCertification(cert.id, 'year', e.target.value)} placeholder="2023" className="h-9 rounded-none" /></div>
                                <div className="col-span-3"><Label className="text-xs">Issuing Organization</Label><Input value={cert.issuer} onChange={e => updateCertification(cert.id, 'issuer', e.target.value)} placeholder="Amazon Web Services" className="h-9 rounded-none" /></div>
                              </div>
                            </div>
                          ))}
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
                  className="p-6 bg-secondary/50 min-h-screen"
                >
                  <div className="max-w-4xl mx-auto">
                    <div className="mb-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Preview your CV. Use "Print / Save" for browser PDF or "Download PDF" for direct file.
                        </p>
                        <span 
                          className="px-3 py-1 text-xs rounded-none shrink-0"
                          style={{ background: `${customColor || selectedTemplate.color}20`, color: customColor || selectedTemplate.color }}
                        >
                          {selectedTemplate.name} Template
                        </span>
                      </div>
                      {/* Color Picker */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Palette size={14} />
                          <span>Accent:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {accentPresets.map(c => (
                            <button
                              key={c}
                              onClick={() => setCustomColor(c === selectedTemplate.color ? null : c)}
                              className="w-6 h-6 border-2 transition-all hover:scale-110"
                              style={{ 
                                backgroundColor: c, 
                                borderColor: (customColor || selectedTemplate.color) === c ? '#111' : 'transparent',
                              }}
                              title={c}
                            />
                          ))}
                          <label className="w-6 h-6 border border-dashed border-muted-foreground/40 flex items-center justify-center cursor-pointer hover:scale-110 transition-all" title="Custom color">
                            <span className="text-[10px]">+</span>
                            <input 
                              type="color" 
                              className="sr-only" 
                              value={customColor || selectedTemplate.color}
                              onChange={e => setCustomColor(e.target.value)} 
                            />
                          </label>
                        </div>
                        {customColor && (
                          <button 
                            onClick={() => setCustomColor(null)} 
                            className="text-[10px] text-muted-foreground underline hover:text-foreground"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                    <div 
                      ref={printRef}
                      className="bg-white shadow-xl print:shadow-none"
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

export default CVBuilder;
