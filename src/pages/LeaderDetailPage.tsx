import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Loader2, Twitter, Linkedin, Instagram } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface Leader {
  id: string;
  name: string;
  role: string;
  category: string;
  image: string;
  bio: string;
  email: string;
  socials: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  constituency?: string;
  level?: string;
}

const LeaderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [leader, setLeader] = useState<Leader | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeader = async () => {
      if (!id) {
        navigate('/current-leaders');
        return;
      }

      const { data, error } = await supabase
        .from('leaders')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        navigate('/current-leaders');
        return;
      }

      setLeader({
        id: data.id,
        name: data.name,
        role: data.role,
        category: data.category,
        image: data.image || '/placeholder.svg',
        bio: data.bio || '',
        email: data.email || '',
        socials: (data.socials as Leader['socials']) || {},
        constituency: data.constituency || '',
        level: data.level || ''
      });
      setLoading(false);
    };

    fetchLeader();
  }, [id, navigate]);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'executive': return 'Executive Council';
      case 'principal_officer': return 'Principal Officer (SRC)';
      case 'hall_leader': return 'Hall Majority Leader';
      case 'legislator': return 'Honourable Member';
      default: return cat;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-nobel-gold" />
      </div>
    );
  }

  if (!leader) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-serif text-ui-blue mb-4">Leader Not Found</h2>
          <Button onClick={() => navigate('/current-leaders')} variant="outline">
            Return to Leaders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-16">
      <div className="container mx-auto px-6 max-w-4xl">
        <button
          onClick={() => navigate('/current-leaders')}
          className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors mb-12"
        >
          <div className="p-2 rounded-full border border-slate-300 group-hover:border-nobel-gold transition-colors">
            <ArrowLeft size={14} />
          </div>
          <span>Back to Leaders</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Photo Section */}
            <div className="bg-slate-100 flex items-center justify-center p-8 md:p-12">
              <div className="w-48 h-48 md:w-full md:h-80 rounded-xl overflow-hidden shadow-xl">
                <img
                  src={leader.image}
                  alt={leader.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                />
              </div>
            </div>

            {/* Info Section */}
            <div className="md:col-span-2 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-ui-blue/10 text-ui-blue text-xs font-bold uppercase tracking-widest rounded-full">
                  {getCategoryLabel(leader.category)}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-serif text-ui-blue mb-2 leading-tight">
                {leader.name}
              </h1>
              
              <p className="text-xl text-nobel-gold font-medium mb-6">
                {leader.role}
              </p>

              {(leader.constituency || leader.level) && (
                <div className="flex gap-4 mb-6 text-sm text-slate-500">
                  {leader.constituency && (
                    <span className="flex items-center gap-1">
                      <span className="font-semibold">Constituency:</span> {leader.constituency}
                    </span>
                  )}
                  {leader.level && (
                    <span className="flex items-center gap-1">
                      <span className="font-semibold">Level:</span> {leader.level}
                    </span>
                  )}
                </div>
              )}

              {leader.bio && (
                <div className="mb-8">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">About</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">{leader.bio}</p>
                </div>
              )}

              {/* Contact & Socials */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Contact</h3>
                <div className="flex flex-wrap gap-3">
                  {leader.email && (
                    <a
                      href={`mailto:${leader.email}`}
                      className="flex items-center gap-2 px-4 py-2 bg-ui-blue text-white rounded-lg hover:bg-ui-dark transition-colors"
                    >
                      <Mail size={16} />
                      <span className="text-sm font-medium">Email</span>
                    </a>
                  )}
                  {leader.socials.twitter && (
                    <a
                      href={leader.socials.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                    >
                      <Twitter size={16} />
                      <span className="text-sm font-medium">Twitter</span>
                    </a>
                  )}
                  {leader.socials.linkedin && (
                    <a
                      href={leader.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                    >
                      <Linkedin size={16} />
                      <span className="text-sm font-medium">LinkedIn</span>
                    </a>
                  )}
                  {leader.socials.instagram && (
                    <a
                      href={leader.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                    >
                      <Instagram size={16} />
                      <span className="text-sm font-medium">Instagram</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LeaderDetailPage;
