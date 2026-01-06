import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';

interface ResourcePageLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const ResourcePageLayout: React.FC<ResourcePageLayoutProps> = ({ title, description, children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-16">
      <SEO title={`${title} - Resources`} description={description} />

      <div className="container mx-auto px-6">
        <button
            onClick={() => navigate('/resources')}
            className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors mb-8"
        >
            <div className="p-2 rounded-full border border-slate-300 group-hover:border-nobel-gold transition-colors">
                <ArrowLeft size={14} />
            </div>
            <span>Back to Resources</span>
        </button>

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-ui-blue mb-4">{title}</h1>
          <p className="text-lg text-slate-600 max-w-2xl">{description}</p>
        </div>

        {children}
      </div>
    </div>
  );
};

export default ResourcePageLayout;
