import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Users, History, Shield, Loader2 } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Hall {
  id: string;
  slug: string;
  name: string;
  alias: string | null;
  motto: string | null;
  description: string | null;
  history: string | null;
  lore: string | null;
  color: string | null;
  established_year: number | null;
  capacity: number | null;
  hall_type: string | null;
  image_url: string | null;
  gallery_images: string[] | null;
}

const HallDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hall, setHall] = useState<Hall | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHall = async () => {
      if (!id) {
        navigate('/governance');
        return;
      }

      const { data, error } = await supabase
        .from('halls')
        .select('*')
        .eq('slug', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching hall:', error);
      }
      
      setHall(data);
      setLoading(false);
    };

    fetchHall();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hall) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Hall Not Found</h2>
          <Button onClick={() => navigate('/governance')}>Return to Governance</Button>
        </div>
      </div>
    );
  }

  const hallColor = hall.color || '#6d28d9';

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${hall.name} - UISU Archive`}
        description={hall.description || `Learn about ${hall.name}`}
      />

      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: hall.image_url ? `url(${hall.image_url})` : 'none',
            backgroundColor: hallColor 
          }}
        />

        <div className="absolute inset-0 z-20 flex flex-col justify-end pb-12 md:pb-20 px-4 md:px-6 container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest border border-white/30">
                {hall.alias || 'Hall'}
              </span>
              <div className="h-px w-10 bg-white/50" />
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-serif text-white mb-4 md:mb-6 leading-tight">
              {hall.name}
            </h1>
            {hall.motto && (
              <p className="text-lg md:text-2xl text-white/80 font-serif italic max-w-2xl">
                "{hall.motto}"
              </p>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 -mt-16 md:-mt-20 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8 md:space-y-12">
            {hall.history && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card p-6 md:p-10 shadow-xl border-t-4"
                style={{ borderTopColor: hallColor }}
              >
                <div className="flex items-center gap-3 mb-6 text-muted-foreground font-bold uppercase text-xs tracking-widest">
                  <History size={16} /> History & Origins
                </div>
                <p className="text-base md:text-lg text-foreground leading-relaxed font-light">
                  {hall.history}
                </p>
              </motion.div>
            )}

            {hall.lore && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-primary text-primary-foreground p-6 md:p-10 shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-10 opacity-5">
                  <Shield size={200} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6 text-primary-foreground/70 font-bold uppercase text-xs tracking-widest">
                    <Shield size={16} /> Hall Lore & Traditions
                  </div>
                  <p className="text-base md:text-lg leading-relaxed font-light">
                    {hall.lore}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Gallery */}
            {hall.gallery_images && hall.gallery_images.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {hall.gallery_images.map((img, i) => (
                  <div key={i} className="aspect-video bg-muted rounded-lg overflow-hidden relative group">
                    <img src={img} alt={`${hall.name} gallery ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6 md:space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card p-6 md:p-8 shadow-lg border border-border"
            >
              <h3 className="font-serif text-xl md:text-2xl text-foreground mb-6 border-b border-border pb-4">
                Hall Leadership
              </h3>
              <p className="text-sm text-muted-foreground italic">Leadership information coming soon.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-muted border border-border p-6 md:p-8"
            >
              <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-6">
                Quick Facts
              </h3>
              <ul className="space-y-4 text-sm text-foreground">
                {hall.established_year && (
                  <li className="flex justify-between items-center border-b border-border pb-2">
                    <span>Established</span>
                    <span className="font-bold">{hall.established_year}</span>
                  </li>
                )}
                {hall.capacity && (
                  <li className="flex justify-between items-center border-b border-border pb-2">
                    <span>Capacity</span>
                    <span className="font-bold">~{hall.capacity} Students</span>
                  </li>
                )}
                {hall.hall_type && (
                  <li className="flex justify-between items-center pt-2">
                    <span>Type</span>
                    <span className="font-bold capitalize">{hall.hall_type}</span>
                  </li>
                )}
              </ul>
            </motion.div>

            <Button onClick={() => navigate('/governance')} variant="outline" className="w-full gap-2">
              <ArrowLeft size={14} /> Back to Governance
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallDetailPage;