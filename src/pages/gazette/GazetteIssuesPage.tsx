import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Archive, Calendar, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const GazetteIssuesPage = () => {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('gazette_issues')
      .select('*')
      .eq('status', 'published')
      .order('volume_number', { ascending: false })
      .then(({ data }) => {
        setIssues(data || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <p className="text-[10px] text-accent uppercase tracking-[0.4em] font-bold">Archive</p>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
          Issues & Editions
        </h1>
        <p className="text-sm text-muted-foreground">Browse all published editions of the UISU Gazette.</p>
      </div>

      {issues.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Archive size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-serif">No issues published yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {issues.map((issue, i) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/gazette/issues/${issue.id}`}
                className="group block border border-border bg-card hover:border-accent/30 transition-all p-6 space-y-4 relative overflow-hidden"
              >
                {issue.cover_image && (
                  <img src={issue.cover_image} alt={issue.title} className="w-full aspect-[3/2] object-cover mb-2" />
                )}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] uppercase tracking-wider">
                    Vol. {issue.volume_number}, No. {issue.issue_number}
                  </Badge>
                </div>
                <h3 className="text-xl font-serif font-bold text-foreground group-hover:text-accent transition-colors">
                  {issue.title}
                </h3>
                {issue.description && <p className="text-sm text-muted-foreground line-clamp-2">{issue.description}</p>}
                {issue.published_at && (
                  <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Calendar size={11} /> {format(new Date(issue.published_at), 'MMMM d, yyyy')}
                  </span>
                )}
                <ArrowUpRight size={16} className="absolute top-6 right-6 text-muted-foreground/20 group-hover:text-accent transition-colors" />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GazetteIssuesPage;
