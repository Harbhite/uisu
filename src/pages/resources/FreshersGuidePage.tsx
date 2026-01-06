import React from 'react';
import ResourcePageLayout from './ResourcePageLayout';
import { Compass, Map } from 'lucide-react';

const FreshersGuidePage = () => {
  return (
    <ResourcePageLayout
      title="Freshers' Compass"
      description="Orientation guides, campus maps, and survival tips for new students."
    >
      <div className="space-y-8">
        <div className="bg-indigo-50 p-8 rounded-2xl border border-indigo-100">
          <h2 className="text-2xl font-serif text-indigo-900 mb-4">Welcome to UI!</h2>
          <p className="text-indigo-800 leading-relaxed max-w-3xl">
            Starting your journey at the University of Ibadan is exciting but can be overwhelming.
            This guide is designed to help you navigate your first few weeks, from registration to finding your way around campus.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Map size={20} className="text-indigo-500" /> Campus Landmarks
            </h3>
            <ul className="space-y-3 text-slate-600">
              <li>• The Tower (Clock Tower)</li>
              <li>• Kenneth Dike Library</li>
              <li>• Trenchard Hall</li>
              <li>• Jaja Clinic</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Compass size={20} className="text-indigo-500" /> Quick Tips
            </h3>
            <ul className="space-y-3 text-slate-600">
              <li>• Complete your medical registration early.</li>
              <li>• Join a faculty or departmental association.</li>
              <li>• Explore the Botanical Gardens on weekends.</li>
            </ul>
          </div>
        </div>
      </div>
    </ResourcePageLayout>
  );
};

export default FreshersGuidePage;
