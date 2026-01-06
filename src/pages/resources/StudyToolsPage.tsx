import React from 'react';
import ResourcePageLayout from './ResourcePageLayout';
import { Brain, ExternalLink } from 'lucide-react';

const tools = [
  { name: 'Pomodoro Timer', desc: 'Focus timer technique', url: '#' },
  { name: 'Notion Template', desc: 'Organize your semester', url: '#' },
  { name: 'Flashcard Maker', desc: 'Spaced repetition study', url: '#' },
  { name: 'GPA Calculator', desc: 'Track your academic standing', url: '#' },
];

const StudyToolsPage = () => {
  return (
    <ResourcePageLayout
      title="Study Tools"
      description="Productivity apps, study techniques, and time management tools."
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {tools.map((tool, i) => (
          <a key={i} href={tool.url} className="group block bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-purple-200 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Brain size={24} />
              </div>
              <ExternalLink size={16} className="text-slate-300 group-hover:text-purple-400" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">{tool.name}</h3>
            <p className="text-sm text-slate-500">{tool.desc}</p>
          </a>
        ))}
      </div>
    </ResourcePageLayout>
  );
};

export default StudyToolsPage;
