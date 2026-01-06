import React from 'react';
import ResourcePageLayout from './ResourcePageLayout';
import { GraduationCap, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

const scholarships = [
  { id: 1, title: 'UI Endowment Fund', amount: 'N100,000', deadline: 'May 30, 2024' },
  { id: 2, title: 'Chevron Undergraduate Scholarship', amount: 'N200,000', deadline: 'June 15, 2024' },
  { id: 3, title: 'MTN Foundation', amount: 'N200,000', deadline: 'July 01, 2024' },
];

const ScholarshipPage = () => {
  return (
    <ResourcePageLayout
      title="Scholarship Finder"
      description="Database of local and international funding opportunities for students."
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {scholarships.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg w-fit mb-4">
              <GraduationCap size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h3>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <DollarSign size={16} className="text-slate-400" />
                <span>{item.amount} / year</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar size={16} className="text-slate-400" />
                <span>Deadline: {item.deadline}</span>
              </div>
            </div>

            <Button className="w-full">View Details</Button>
          </div>
        ))}
      </div>
    </ResourcePageLayout>
  );
};

export default ScholarshipPage;
