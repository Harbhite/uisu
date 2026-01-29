import React from 'react';
import ResourcePageLayout from './ResourcePageLayout';
import { Activity, Phone, MapPin } from 'lucide-react';

const CampusHealthPage = () => {
  return (
    <ResourcePageLayout
      title="Campus Health"
      description="Clinic schedules, emergency contacts, and physical health resources."
    >
      <div className="space-y-8">
        <div className="bg-red-50 p-8 rounded-2xl border border-red-100 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <h2 className="text-2xl font-serif text-red-900 mb-2">Jaja Clinic</h2>
            <p className="text-red-800 mb-4">University Health Service</p>
            <div className="flex items-center gap-2 text-red-700 mb-2">
              <MapPin size={18} />
              <span>Lennox Road, University of Ibadan</span>
            </div>
            <div className="flex items-center gap-2 text-red-700">
              <Phone size={18} />
              <span>Emergency: 0800-JAJA-HELP</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm w-full md:w-auto min-w-[250px]">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Activity size={18} className="text-red-500" /> Clinic Hours
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex justify-between"><span>Mon - Fri</span> <span className="font-medium">8 AM - 4 PM</span></li>
              <li className="flex justify-between"><span>Emergency</span> <span className="font-medium text-red-600">24/7</span></li>
            </ul>
          </div>
        </div>
      </div>
    </ResourcePageLayout>
  );
};

export default CampusHealthPage;
