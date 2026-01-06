import React from 'react';
import ResourcePageLayout from './ResourcePageLayout';
import { Rocket, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SkillUpPage = () => {
  return (
    <ResourcePageLayout
      title="Skill Up"
      description="Workshops, tutorials, and certification courses to boost your portfolio."
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {['Data Analysis with Excel', 'Introduction to UI/UX', 'Public Speaking Masterclass'].map((course, i) => (
          <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
            <div className="h-32 bg-orange-100 flex items-center justify-center">
              <Rocket size={40} className="text-orange-400" />
            </div>
            <div className="p-6">
              <h3 className="font-bold text-lg text-slate-900 mb-2">{course}</h3>
              <p className="text-sm text-slate-500 mb-4">Learn the fundamentals and gain practical experience.</p>
              <Button variant="secondary" className="w-full gap-2">
                <PlayCircle size={16} /> Start Learning
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ResourcePageLayout>
  );
};

export default SkillUpPage;
