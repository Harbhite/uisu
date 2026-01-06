import React from 'react';
import ResourcePageLayout from './ResourcePageLayout';
import { Briefcase, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const jobs = [
  { id: 1, title: 'Graphic Design Intern', company: 'Campus Press', type: 'Internship', location: 'Remote' },
  { id: 2, title: 'Research Assistant', company: 'Dept of Economics', type: 'Part-time', location: 'On-Campus' },
  { id: 3, title: 'Frontend Developer', company: 'Tech Hub', type: 'Full-time', location: 'Ibadan' },
];

const CareerHubPage = () => {
  return (
    <ResourcePageLayout
      title="Career Hub"
      description="Find internships, jobs, and career advice to jumpstart your professional journey."
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map(job => (
          <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <Briefcase size={24} />
              </div>
              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">{job.type}</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-1">{job.title}</h3>
            <p className="text-slate-500 text-sm mb-4">{job.company}</p>

            <div className="flex items-center gap-4 text-xs text-slate-400 mb-6">
              <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
              <span className="flex items-center gap-1"><Clock size={12} /> 2 days ago</span>
            </div>

            <Button className="w-full" variant="outline">Apply Now</Button>
          </div>
        ))}
      </div>
    </ResourcePageLayout>
  );
};

export default CareerHubPage;
