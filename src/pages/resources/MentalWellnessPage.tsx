import React from 'react';
import ResourcePageLayout from './ResourcePageLayout';
import { Heart, Phone, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MentalWellnessPage = () => {
  return (
    <ResourcePageLayout
      title="Mental Wellness"
      description="Resources for mental health, counseling services, and self-care tools."
    >
      <div className="grid gap-8 md:grid-cols-2">
        <div className="bg-rose-50 p-8 rounded-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white rounded-full shadow-sm text-rose-500">
              <Phone size={24} />
            </div>
            <h3 className="text-2xl font-serif text-rose-900">Emergency Support</h3>
          </div>
          <p className="text-rose-800 mb-6">If you are in crisis, please reach out immediately. Confidential support is available 24/7.</p>
          <div className="space-y-3">
            <Button className="w-full bg-rose-600 hover:bg-rose-700">Call Helpline (0800-UI-CARE)</Button>
            <Button variant="outline" className="w-full border-rose-200 text-rose-700 hover:bg-rose-100">Book Counseling Session</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 text-lg">Self-Care Resources</h3>
          {[
            'Meditation Guide for Students',
            'Dealing with Exam Anxiety',
            'Sleep Hygiene Tips',
            'Building Resilience'
          ].map((topic, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
              <span className="text-slate-700 font-medium">{topic}</span>
              <BookOpen size={18} className="text-slate-400" />
            </div>
          ))}
        </div>
      </div>
    </ResourcePageLayout>
  );
};

export default MentalWellnessPage;
