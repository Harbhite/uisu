import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Archive, Calendar } from 'lucide-react';
import { format } from 'date-fns';

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
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Issues Archive</h1>
        <p className="text-muted-foreground">Browse all published editions of the UISU Gazette.</p>
      </div>

      {issues.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Archive size={48} className="mx-auto mb-4 opacity-30" />
          <p>No issues published yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {issues.map((issue) => (
            <Link
              key={issue.id}
              to={`/gazette/issues/${issue.id}`}
              className="group border border-border bg-card hover:shadow-lg transition-all p-6 space-y-3"
            >
              {issue.cover_image && (
                <img src={issue.cover_image} alt={issue.title} className="w-full aspect-[3/2] object-cover mb-3" />
              )}
              <div className="flex items-center gap-2">
                <Badge variant="outline">Vol. {issue.volume_number}, No. {issue.issue_number}</Badge>
              </div>
              <h3 className="text-xl font-serif font-bold text-foreground group-hover:text-accent transition-colors">
                {issue.title}
              </h3>
              {issue.description && <p className="text-sm text-muted-foreground line-clamp-2">{issue.description}</p>}
              {issue.published_at && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar size={12} /> {format(new Date(issue.published_at), 'MMMM d, yyyy')}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default GazetteIssuesPage;
