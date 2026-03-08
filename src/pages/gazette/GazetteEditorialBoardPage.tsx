import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';

const roleLabels: Record<string, string> = {
  editor_in_chief: 'Editor-in-Chief',
  editor: 'Editor',
  contributor: 'Contributor',
  columnist: 'Columnist',
};

const roleOrder = ['editor_in_chief', 'editor', 'columnist', 'contributor'];

const GazetteEditorialBoardPage = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('editorial_board')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        const sorted = (data || []).sort((a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role));
        setMembers(sorted);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="bg-primary -mx-4 md:-mx-8 -mt-8 md:-mt-12 px-8 py-16 md:py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
          <span className="text-[200px] font-serif font-bold text-primary-foreground leading-none select-none">✦</span>
        </div>
        <div className="relative z-10 space-y-4">
          <Users size={24} className="mx-auto text-accent" />
          <p className="text-[10px] text-accent uppercase tracking-[0.5em] font-bold">The Team</p>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary-foreground">
            Editorial Board
          </h1>
          <p className="text-sm text-primary-foreground/50 max-w-md mx-auto">
            Meet the people behind the UISU Gazette.
          </p>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="font-serif">No editorial board members yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="border border-border bg-card p-6 space-y-4 group hover:border-accent/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt={member.display_name} className="w-14 h-14 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-lg font-serif font-bold text-primary-foreground shrink-0">
                    {member.display_name?.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-serif font-bold text-foreground text-lg leading-tight">{member.display_name}</h3>
                  <Badge variant="outline" className="mt-1 text-[9px] uppercase tracking-wider">
                    {roleLabels[member.role] || member.role}
                  </Badge>
                </div>
              </div>
              {member.bio && <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GazetteEditorialBoardPage;
