import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Loader2, Twitter, Linkedin, Instagram, User, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';

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
      <div className="min-h-screen bg-background pt-32 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!leader) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-serif text-primary mb-4">Leader Not Found</h2>
          <Button onClick={() => navigate('/current-leaders')} variant="outline">
            Return to Leaders
          </Button>
        </div>
      </div>
    );
  }

  const showImage = leader.image && leader.image !== '/placeholder.svg';

  return (
    <div className="min-h-screen bg-background pt-32 pb-16">
      <SEO
        title={leader.name}
        description={`${leader.role} - ${leader.bio ? leader.bio.substring(0, 150) + "..." : "UISU Leader"}`}
        image={leader.image !== '/placeholder.svg' ? leader.image : '/og/pages-screenshot/current-leader-detail.png'}
      />
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('/current-leaders')}
          className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-accent transition-colors mb-12"
        >
          <div className="p-2 border border-border group-hover:border-accent transition-colors">
            <ArrowLeft size={14} />
          </div>
          <span>Back to Leaders</span>
        </button>

        {/* Main Content - Sharp corners, editorial style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border"
        >
          <div className="grid grid-cols-1 lg:grid-cols-5">
            {/* Photo Section */}
            <div className="lg:col-span-2 bg-muted flex items-center justify-center p-8 lg:p-12">
              <div className="w-full aspect-[3/4] overflow-hidden">
                {showImage ? (
                  <img
                    src={leader.image}
                    alt={leader.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <User size={120} className="text-muted-foreground/30" strokeWidth={1} />
                  </div>
                )}
              </div>
            </div>

            {/* Info Section */}
            <div className="lg:col-span-3 p-8 lg:p-12">
              {/* Category Badge */}
              <div className="mb-6">
                <span className="px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.2em]">
                  {getCategoryLabel(leader.category)}
                </span>
              </div>

              {/* Name & Role */}
              <h1 className="text-4xl lg:text-5xl font-serif text-foreground mb-3 leading-tight">
                {leader.name}
              </h1>
              
              <p className="text-xl text-accent font-medium mb-8">
                {leader.role}
              </p>

              {/* Constituency & Level */}
              {(leader.constituency || leader.level) && (
                <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b border-border">
                  {leader.constituency && (
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">
                        Constituency
                      </span>
                      <span className="text-foreground font-medium">{leader.constituency}</span>
                    </div>
                  )}
                  {leader.level && (
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">
                        Level
                      </span>
                      <span className="text-foreground font-medium">{leader.level}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Bio */}
              {leader.bio && (
                <div className="mb-8">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                    About
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-lg font-serif">
                    {leader.bio}
                  </p>
                </div>
              )}

              {/* Contact & Socials */}
              <div className="pt-6 border-t border-border">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                  Connect
                </h3>
                <div className="flex flex-wrap gap-3">
                  {leader.email && (
                    <a
                      href={`mailto:${leader.email}`}
                      className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      <Mail size={16} />
                      <span>Email</span>
                    </a>
                  )}
                  {leader.socials.twitter && (
                    <a
                      href={leader.socials.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 border border-border hover:border-accent hover:text-accent transition-colors text-sm font-medium"
                    >
                      <Twitter size={16} />
                      <span>Twitter</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                  {leader.socials.linkedin && (
                    <a
                      href={leader.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 border border-border hover:border-accent hover:text-accent transition-colors text-sm font-medium"
                    >
                      <Linkedin size={16} />
                      <span>LinkedIn</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                  {leader.socials.instagram && (
                    <a
                      href={leader.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 border border-border hover:border-accent hover:text-accent transition-colors text-sm font-medium"
                    >
                      <Instagram size={16} />
                      <span>Instagram</span>
                      <ExternalLink size={12} />
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
