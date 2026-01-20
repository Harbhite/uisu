import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Briefcase, GraduationCap, Code,
  Wand2, Download, Eye, Edit2, Plus, Trash2,
  ChevronDown, ChevronUp, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

interface Education {
  id: string;
  degree: string;
  school: string;
  year: string;
}

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
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: ''
  },
  summary: '',
  experience: [],
  education: [],
  skills: []
};

// Mock AI Enhancement Service
const mockAIEnhance = async (text: string, type: 'summary' | 'experience'): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!text) resolve('');

      const enhancements = [
        "demonstrating strategic leadership and driving operational excellence",
        "leveraging data-driven insights to optimize performance",
        "fostering a collaborative environment to achieve key business objectives",
        "implementing innovative solutions to complex problems"
      ];

      const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)];

      if (type === 'summary') {
        resolve(`Highly motivated professional with a proven track record of ${randomEnhancement}. Dedicated to delivering high-quality results in fast-paced environments. ${text}`);
      } else {
        resolve(`${text}. Successfully executed projects by ${randomEnhancement}, resulting in measurable improvements in efficiency and productivity.`);
      }
    }, 1500);
  });
};

export const CVBuilder = () => {
  const [data, setData] = useState<CVData>(initialData);
  const [activeSection, setActiveSection] = useState<string>('personal');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState<string | null>(null);

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [name]: value }
    }));
  };

  const handleEnhance = async (text: string, fieldPath: string, type: 'summary' | 'experience') => {
    if (!text) {
      toast.error("Please enter some text first");
      return;
    }

    setIsEnhancing(fieldPath);
    try {
      const enhanced = await mockAIEnhance(text, type);

      if (fieldPath === 'summary') {
        setData(prev => ({ ...prev, summary: enhanced }));
      } else if (fieldPath.startsWith('exp-')) {
        const id = fieldPath.split('-')[1];
        setData(prev => ({
          ...prev,
          experience: prev.experience.map(exp =>
            exp.id === id ? { ...exp, description: enhanced } : exp
          )
        }));
      }
      toast.success("Text enhanced with AI!");
    } catch (error) {
      toast.error("Failed to enhance text");
    } finally {
      setIsEnhancing(null);
    }
  };

  const addExperience = () => {
    setData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { id: Math.random().toString(36).substr(2, 9), role: '', company: '', duration: '', description: '' }
      ]
    }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id: string) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    setData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { id: Math.random().toString(36).substr(2, 9), degree: '', school: '', year: '' }
      ]
    }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const Preview = () => (
    <div className="bg-white shadow-lg p-8 min-h-[800px] w-full max-w-[210mm] mx-auto text-slate-800" id="cv-preview">
      <div className="border-b-2 border-ui-blue pb-6 mb-6">
        <h1 className="text-4xl font-serif text-ui-blue uppercase tracking-wide mb-2">
          {data.personalInfo.fullName || 'Your Name'}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>• {data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>• {data.personalInfo.location}</span>}
          {data.personalInfo.linkedin && <span>• {data.personalInfo.linkedin}</span>}
        </div>
      </div>

      {data.summary && (
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-nobel-gold mb-3">Professional Summary</h3>
          <p className="text-sm leading-relaxed text-slate-700">{data.summary}</p>
        </div>
      )}

      {data.experience.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-nobel-gold mb-4">Experience</h3>
          <div className="space-y-6">
            {data.experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-bold text-ui-blue">{exp.role}</h4>
                  <span className="text-xs text-slate-500">{exp.duration}</span>
                </div>
                <div className="text-sm font-medium text-slate-600 mb-2">{exp.company}</div>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.education.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-nobel-gold mb-4">Education</h3>
          <div className="space-y-4">
            {data.education.map(edu => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-bold text-ui-blue">{edu.school}</h4>
                  <span className="text-xs text-slate-500">{edu.year}</span>
                </div>
                <div className="text-sm text-slate-600">{edu.degree}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.skills.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-nobel-gold mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, i) => (
              <span key={i} className="bg-slate-50 px-3 py-1 text-xs text-slate-600 border border-slate-100">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Editor Panel */}
      <div className={`w-full lg:w-1/2 space-y-6 ${isPreviewMode ? 'hidden lg:block' : 'block'}`}>
        <div className="bg-white border border-slate-200 p-6 rounded-none">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl text-ui-blue">CV <span className="italic text-slate-400">Editor</span></h2>
            <div className="flex gap-2 lg:hidden">
              <button
                onClick={() => setIsPreviewMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-ui-blue text-white text-[10px] font-bold uppercase tracking-widest"
              >
                <Eye size={14} /> Preview
              </button>
            </div>
          </div>

          <div className="space-y-2 mb-8">
            {['personal', 'summary', 'experience', 'education', 'skills'].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest flex justify-between items-center transition-all ${
                  activeSection === section
                    ? 'bg-slate-50 text-ui-blue border-l-4 border-nobel-gold'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                {section}
                {activeSection === section && <ChevronDown size={14} />}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeSection === 'personal' && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Full Name</label>
                    <input
                      name="fullName"
                      value={data.personalInfo.fullName}
                      onChange={handlePersonalInfoChange}
                      className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-nobel-gold outline-none font-serif"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Email</label>
                    <input
                      name="email"
                      value={data.personalInfo.email}
                      onChange={handlePersonalInfoChange}
                      className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-nobel-gold outline-none"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Phone</label>
                    <input
                      name="phone"
                      value={data.personalInfo.phone}
                      onChange={handlePersonalInfoChange}
                      className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-nobel-gold outline-none"
                      placeholder="+234..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Location</label>
                    <input
                      name="location"
                      value={data.personalInfo.location}
                      onChange={handlePersonalInfoChange}
                      className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-nobel-gold outline-none"
                      placeholder="Lagos, Nigeria"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">LinkedIn</label>
                    <input
                      name="linkedin"
                      value={data.personalInfo.linkedin}
                      onChange={handlePersonalInfoChange}
                      className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-nobel-gold outline-none"
                      placeholder="linkedin.com/in/john"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Professional Summary</label>
                    <button
                      onClick={() => handleEnhance(data.summary, 'summary', 'summary')}
                      disabled={isEnhancing === 'summary'}
                      className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-nobel-gold hover:text-ui-blue transition-colors disabled:opacity-50"
                    >
                      {isEnhancing === 'summary' ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                      AI Enhance
                    </button>
                  </div>
                  <textarea
                    value={data.summary}
                    onChange={(e) => setData({ ...data, summary: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-nobel-gold outline-none min-h-[150px] leading-relaxed"
                    placeholder="Briefly describe your professional background and goals..."
                  />
                </div>
              </motion.div>
            )}

            {activeSection === 'experience' && (
              <motion.div
                key="experience"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {data.experience.map((exp, index) => (
                  <div key={exp.id} className="p-4 bg-slate-50 border border-slate-200 relative group">
                    <button
                      onClick={() => removeExperience(exp.id)}
                      className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        placeholder="Job Title"
                        value={exp.role}
                        onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                        className="p-2 bg-white border border-slate-200 focus:border-nobel-gold outline-none font-bold text-ui-blue"
                      />
                      <input
                        placeholder="Company"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                        className="p-2 bg-white border border-slate-200 focus:border-nobel-gold outline-none"
                      />
                      <input
                        placeholder="Duration (e.g. 2020 - Present)"
                        value={exp.duration}
                        onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                        className="p-2 bg-white border border-slate-200 focus:border-nobel-gold outline-none col-span-2"
                      />
                    </div>
                    <div className="relative">
                      <div className="flex justify-end mb-1">
                        <button
                          onClick={() => handleEnhance(exp.description, `exp-${exp.id}`, 'experience')}
                          disabled={isEnhancing === `exp-${exp.id}`}
                          className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-nobel-gold hover:text-ui-blue transition-colors disabled:opacity-50"
                        >
                           {isEnhancing === `exp-${exp.id}` ? <Loader2 size={10} className="animate-spin" /> : <Wand2 size={10} />}
                           Enhance
                        </button>
                      </div>
                      <textarea
                        placeholder="Describe your responsibilities and achievements..."
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 focus:border-nobel-gold outline-none min-h-[100px]"
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={addExperience}
                  className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-400 hover:border-nobel-gold hover:text-nobel-gold transition-colors flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
                >
                  <Plus size={14} /> Add Position
                </button>
              </motion.div>
            )}

            {activeSection === 'education' && (
              <motion.div
                key="education"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {data.education.map((edu) => (
                  <div key={edu.id} className="p-4 bg-slate-50 border border-slate-200 relative group">
                    <button
                      onClick={() => removeEducation(edu.id)}
                      className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="grid grid-cols-1 gap-4">
                      <input
                        placeholder="School / University"
                        value={edu.school}
                        onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                        className="p-2 bg-white border border-slate-200 focus:border-nobel-gold outline-none font-bold text-ui-blue"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          placeholder="Degree / Certificate"
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          className="p-2 bg-white border border-slate-200 focus:border-nobel-gold outline-none"
                        />
                        <input
                          placeholder="Year"
                          value={edu.year}
                          onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                          className="p-2 bg-white border border-slate-200 focus:border-nobel-gold outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addEducation}
                  className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-400 hover:border-nobel-gold hover:text-nobel-gold transition-colors flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
                >
                  <Plus size={14} /> Add Education
                </button>
              </motion.div>
            )}

            {activeSection === 'skills' && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Skills (Comma separated)</label>
                  <textarea
                    value={data.skills.join(', ')}
                    onChange={(e) => setData({ ...data, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-nobel-gold outline-none min-h-[100px]"
                    placeholder="e.g. Project Management, React, Public Speaking"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-ui-blue text-white text-xs rounded-none">
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Preview Panel */}
      <div className={`w-full lg:w-1/2 ${isPreviewMode ? 'block' : 'hidden lg:block'}`}>
        <div className="sticky top-32">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="font-serif text-xl text-slate-400">Live <span className="italic text-slate-300">Preview</span></h2>
            <div className="flex gap-2">
              <button
                onClick={() => setIsPreviewMode(false)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest"
              >
                <Edit2 size={14} /> Edit
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-nobel-gold text-white text-[10px] font-bold uppercase tracking-widest hover:bg-nobel-gold/90 transition-colors shadow-md"
              >
                <Download size={14} /> Print / PDF
              </button>
            </div>
          </div>

          <Preview />
        </div>
      </div>
    </div>
  );
};
