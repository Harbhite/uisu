import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Download, Eye, Check, ChevronLeft, ChevronRight,
  Briefcase, GraduationCap, Award, Phone, Mail, MapPin, Globe,
  Linkedin, Github, User, Plus, Trash2, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface CVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
  };
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
}

const initialData: CVData = {
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
  { id: 'executive', name: 'Executive', preview: '👔', description: 'Premium layout for senior positions', color: '#7c3aed' }
];

const CVBuilder: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'template' | 'edit' | 'preview'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(templates[0]);
  const [cvData, setCVData] = useState<CVData>(defaultCVData);
  const [activeSection, setActiveSection] = useState<'personal' | 'education' | 'experience' | 'skills'>('personal');
  const [skillInput, setSkillInput] = useState('');
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

  const handlePrint = () => {
    if (!cvData.personalInfo.fullName) {
      toast.error('Please fill in at least your name');
      return;
    }

    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print CV');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${cvData.personalInfo.fullName} - CV</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Georgia', serif; font-size: 11pt; line-height: 1.5; color: #333; }
            @page { size: A4; margin: 0.5in; }
            @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
    toast.success('Opening print dialog...');
  };

  const renderTemplate = () => {
    const { personalInfo, education, experience, skills, certifications } = cvData;
    const color = selectedTemplate.color;

    const commonStyles = {
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
      `
    };

    return commonStyles[selectedTemplate.id as keyof typeof commonStyles] || commonStyles.classic;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0">
        <div className="flex flex-col h-[90vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-ui-blue to-ui-blue/90">
            <div className="flex items-center gap-3 text-white">
              <Sparkles size={24} />
              <div>
                <h2 className="font-serif text-xl">CV Builder</h2>
                <p className="text-xs opacity-75">Create your professional CV in minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {step !== 'template' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setStep(step === 'preview' ? 'edit' : 'template')}
                  className="text-white hover:bg-white/20"
                >
                  <ChevronLeft size={16} className="mr-1" /> Back
                </Button>
              )}
              {step === 'edit' && (
                <Button size="sm" onClick={() => setStep('preview')} className="bg-white text-ui-blue hover:bg-white/90">
                  <Eye size={16} className="mr-1" /> Preview
                </Button>
              )}
              {step === 'preview' && (
                <Button size="sm" onClick={handlePrint} className="bg-nobel-gold hover:bg-nobel-gold/90 text-white">
                  <Download size={16} className="mr-1" /> Download PDF
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {step === 'template' && (
                <motion.div
                  key="template"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full overflow-y-auto p-6"
                >
                  <h3 className="font-serif text-2xl mb-2">Choose a template</h3>
                  <p className="text-slate-500 mb-6">Select a design that matches your industry and style</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {templates.map(template => (
                      <motion.div
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedTemplate(template)}
                        className={`cursor-pointer border-2 rounded-lg p-6 transition-all ${
                          selectedTemplate.id === template.id 
                            ? 'border-ui-blue bg-ui-blue/5' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div 
                          className="w-full h-32 rounded mb-4 flex items-center justify-center text-5xl"
                          style={{ background: `${template.color}15` }}
                        >
                          {template.preview}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-slate-800">{template.name}</h4>
                            <p className="text-xs text-slate-500">{template.description}</p>
                          </div>
                          {selectedTemplate.id === template.id && (
                            <div className="w-6 h-6 rounded-full bg-ui-blue flex items-center justify-center">
                              <Check size={14} className="text-white" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button onClick={() => setStep('edit')} className="bg-ui-blue hover:bg-ui-blue/90">
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
                  className="h-full flex"
                >
                  {/* Sidebar */}
                  <div className="w-48 border-r bg-slate-50 p-4 flex flex-col gap-2">
                    {[
                      { id: 'personal', label: 'Personal Info', icon: User },
                      { id: 'education', label: 'Education', icon: GraduationCap },
                      { id: 'experience', label: 'Experience', icon: Briefcase },
                      { id: 'skills', label: 'Skills & Certs', icon: Award }
                    ].map(section => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id as typeof activeSection)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all ${
                          activeSection === section.id
                            ? 'bg-ui-blue text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <section.icon size={16} />
                        {section.label}
                      </button>
                    ))}
                  </div>

                  {/* Form */}
                  <div className="flex-1 overflow-y-auto p-6">
                    {activeSection === 'personal' && (
                      <div className="space-y-4 max-w-xl">
                        <h3 className="font-serif text-xl mb-4">Personal Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <Label>Full Name *</Label>
                            <Input
                              value={cvData.personalInfo.fullName}
                              onChange={e => setCVData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, fullName: e.target.value } }))}
                              placeholder="John Doe"
                            />
                          </div>
                          <div>
                            <Label>Email *</Label>
                            <Input
                              type="email"
                              value={cvData.personalInfo.email}
                              onChange={e => setCVData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, email: e.target.value } }))}
                              placeholder="john@email.com"
                            />
                          </div>
                          <div>
                            <Label>Phone</Label>
                            <Input
                              value={cvData.personalInfo.phone}
                              onChange={e => setCVData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, phone: e.target.value } }))}
                              placeholder="+234 xxx xxx xxxx"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Location</Label>
                            <Input
                              value={cvData.personalInfo.location}
                              onChange={e => setCVData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, location: e.target.value } }))}
                              placeholder="Lagos, Nigeria"
                            />
                          </div>
                          <div>
                            <Label>LinkedIn URL</Label>
                            <Input
                              value={cvData.personalInfo.linkedin}
                              onChange={e => setCVData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, linkedin: e.target.value } }))}
                              placeholder="linkedin.com/in/johndoe"
                            />
                          </div>
                          <div>
                            <Label>GitHub URL</Label>
                            <Input
                              value={cvData.personalInfo.github}
                              onChange={e => setCVData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, github: e.target.value } }))}
                              placeholder="github.com/johndoe"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Professional Summary</Label>
                            <Textarea
                              value={cvData.personalInfo.summary}
                              onChange={e => setCVData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, summary: e.target.value } }))}
                              placeholder="Brief overview of your professional background and career objectives..."
                              rows={4}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === 'education' && (
                      <div className="space-y-4 max-w-xl">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-serif text-xl">Education</h3>
                          <Button size="sm" variant="outline" onClick={addEducation}>
                            <Plus size={14} className="mr-1" /> Add
                          </Button>
                        </div>
                        {cvData.education.length === 0 && (
                          <p className="text-slate-400 text-sm py-8 text-center border border-dashed rounded-lg">
                            No education added yet. Click "Add" to get started.
                          </p>
                        )}
                        {cvData.education.map((edu, idx) => (
                          <div key={edu.id} className="border rounded-lg p-4 relative">
                            <button
                              onClick={() => removeEducation(edu.id)}
                              className="absolute top-2 right-2 text-slate-300 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="col-span-2">
                                <Label className="text-xs">Institution</Label>
                                <Input
                                  value={edu.institution}
                                  onChange={e => updateEducation(edu.id, 'institution', e.target.value)}
                                  placeholder="University of Ibadan"
                                  className="h-9"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Degree</Label>
                                <Input
                                  value={edu.degree}
                                  onChange={e => updateEducation(edu.id, 'degree', e.target.value)}
                                  placeholder="Bachelor's"
                                  className="h-9"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Field of Study</Label>
                                <Input
                                  value={edu.field}
                                  onChange={e => updateEducation(edu.id, 'field', e.target.value)}
                                  placeholder="Computer Science"
                                  className="h-9"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Start Year</Label>
                                <Input
                                  value={edu.startYear}
                                  onChange={e => updateEducation(edu.id, 'startYear', e.target.value)}
                                  placeholder="2020"
                                  className="h-9"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">End Year</Label>
                                <Input
                                  value={edu.endYear}
                                  onChange={e => updateEducation(edu.id, 'endYear', e.target.value)}
                                  placeholder="2024"
                                  className="h-9"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeSection === 'experience' && (
                      <div className="space-y-4 max-w-xl">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-serif text-xl">Work Experience</h3>
                          <Button size="sm" variant="outline" onClick={addExperience}>
                            <Plus size={14} className="mr-1" /> Add
                          </Button>
                        </div>
                        {cvData.experience.length === 0 && (
                          <p className="text-slate-400 text-sm py-8 text-center border border-dashed rounded-lg">
                            No experience added yet. Click "Add" to get started.
                          </p>
                        )}
                        {cvData.experience.map((exp) => (
                          <div key={exp.id} className="border rounded-lg p-4 relative">
                            <button
                              onClick={() => removeExperience(exp.id)}
                              className="absolute top-2 right-2 text-slate-300 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Position</Label>
                                <Input
                                  value={exp.position}
                                  onChange={e => updateExperience(exp.id, 'position', e.target.value)}
                                  placeholder="Software Engineer"
                                  className="h-9"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Company</Label>
                                <Input
                                  value={exp.company}
                                  onChange={e => updateExperience(exp.id, 'company', e.target.value)}
                                  placeholder="Tech Corp"
                                  className="h-9"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Start Date</Label>
                                <Input
                                  value={exp.startDate}
                                  onChange={e => updateExperience(exp.id, 'startDate', e.target.value)}
                                  placeholder="Jan 2022"
                                  className="h-9"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">End Date</Label>
                                <Input
                                  value={exp.endDate}
                                  onChange={e => updateExperience(exp.id, 'endDate', e.target.value)}
                                  placeholder="Present"
                                  disabled={exp.current}
                                  className="h-9"
                                />
                              </div>
                              <div className="col-span-2">
                                <Label className="text-xs">Description</Label>
                                <Textarea
                                  value={exp.description}
                                  onChange={e => updateExperience(exp.id, 'description', e.target.value)}
                                  placeholder="Key responsibilities and achievements..."
                                  rows={2}
                                />
                              </div>
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
                            <Input
                              value={skillInput}
                              onChange={e => setSkillInput(e.target.value)}
                              onKeyPress={e => e.key === 'Enter' && addSkill()}
                              placeholder="Add a skill..."
                              className="flex-1"
                            />
                            <Button onClick={addSkill} size="sm">Add</Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {cvData.skills.map(skill => (
                              <span
                                key={skill}
                                className="px-3 py-1.5 bg-ui-blue/10 text-ui-blue text-sm rounded-full flex items-center gap-2"
                              >
                                {skill}
                                <button onClick={() => removeSkill(skill)} className="hover:text-red-500">
                                  <Trash2 size={12} />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-serif text-xl">Certifications</h3>
                            <Button size="sm" variant="outline" onClick={addCertification}>
                              <Plus size={14} className="mr-1" /> Add
                            </Button>
                          </div>
                          {cvData.certifications.map(cert => (
                            <div key={cert.id} className="border rounded-lg p-4 relative mb-3">
                              <button
                                onClick={() => removeCertification(cert.id)}
                                className="absolute top-2 right-2 text-slate-300 hover:text-red-500"
                              >
                                <Trash2 size={16} />
                              </button>
                              <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                  <Label className="text-xs">Certification Name</Label>
                                  <Input
                                    value={cert.name}
                                    onChange={e => updateCertification(cert.id, 'name', e.target.value)}
                                    placeholder="AWS Certified"
                                    className="h-9"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Year</Label>
                                  <Input
                                    value={cert.year}
                                    onChange={e => updateCertification(cert.id, 'year', e.target.value)}
                                    placeholder="2023"
                                    className="h-9"
                                  />
                                </div>
                                <div className="col-span-3">
                                  <Label className="text-xs">Issuing Organization</Label>
                                  <Input
                                    value={cert.issuer}
                                    onChange={e => updateCertification(cert.id, 'issuer', e.target.value)}
                                    placeholder="Amazon Web Services"
                                    className="h-9"
                                  />
                                </div>
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
                  className="h-full overflow-y-auto p-6 bg-slate-100"
                >
                  <div className="max-w-4xl mx-auto">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm text-slate-500">
                        Preview your CV. Click "Download PDF" to save.
                      </p>
                      <span 
                        className="px-3 py-1 text-xs rounded-full"
                        style={{ background: `${selectedTemplate.color}20`, color: selectedTemplate.color }}
                      >
                        {selectedTemplate.name} Template
                      </span>
                    </div>
                    <div 
                      ref={printRef}
                      className="bg-white shadow-xl"
                      dangerouslySetInnerHTML={{ __html: renderTemplate() }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CVBuilder;
