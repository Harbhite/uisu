import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

const roleLabels: Record<string, string> = {
  editor_in_chief: 'Editor-in-Chief',
  editor: 'Editor',
  contributor: 'Contributor',
  columnist: 'Columnist',
};

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
        setMembers(data || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-3 py-8">
        <Users size={28} className="mx-auto text-accent" />
        <h1 className="text-3xl font-serif font-bold text-foreground">Editorial Board</h1>
        <p className="text-muted-foreground max-w-md mx-auto">Meet the team behind the UISU Gazette.</p>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No editorial board members yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div key={member.id} className="border border-border bg-card p-6 text-center space-y-3">
              {member.avatar_url ? (
                <img src={member.avatar_url} alt={member.display_name} className="w-20 h-20 rounded-full mx-auto object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full mx-auto bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
                  {member.display_name?.charAt(0)}
                </div>
              )}
              <h3 className="font-serif font-bold text-foreground">{member.display_name}</h3>
              <Badge variant="outline">{roleLabels[member.role] || member.role}</Badge>
              {member.bio && <p className="text-sm text-muted-foreground">{member.bio}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GazetteEditorialBoardPage;
