import React from 'react';
import ResourcePageLayout from './ResourcePageLayout';
import { Users, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AlumniNetworkPage = () => {
  return (
    <ResourcePageLayout
      title="Alumni Network"
      description="Connect with past students, find mentors, and explore alumni stories."
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 hover:border-cyan-200 transition-colors text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Users size={32} className="text-slate-400" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Alumni Name</h3>
            <p className="text-sm text-slate-500 mb-4">Class of 2015 • Software Engineer at Google</p>
            <Button variant="outline" className="w-full gap-2 border-cyan-200 text-cyan-700 hover:bg-cyan-50">
              <Linkedin size={16} /> Connect
            </Button>
          </div>
        ))}
      </div>
    </ResourcePageLayout>
  );
};

export default AlumniNetworkPage;
