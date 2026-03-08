import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { GazetteArticleCard } from '@/components/gazette/GazetteArticleCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const GazetteIssuePage = () => {
  const { id } = useParams();
  const [issue, setIssue] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from('gazette_issues').select('*').eq('id', id).maybeSingle(),
      supabase.from('gazette_articles').select('*').eq('issue_id', id).eq('is_published', true).order('created_at', { ascending: true }),
    ]).then(([issueRes, articlesRes]) => {
      setIssue(issueRes.data);
      setArticles(articlesRes.data || []);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;
  if (!issue) return <div className="text-center py-20 text-muted-foreground">Issue not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link to="/gazette/issues" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground uppercase tracking-widest font-bold">
        <ArrowLeft size={14} /> All Issues
      </Link>

      <header className="space-y-3">
        <Badge variant="outline">Vol. {issue.volume_number}, No. {issue.issue_number}</Badge>
        <h1 className="text-3xl font-serif font-bold text-foreground">{issue.title}</h1>
        {issue.description && <p className="text-muted-foreground">{issue.description}</p>}
        {issue.published_at && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar size={12} /> {format(new Date(issue.published_at), 'MMMM d, yyyy')}
          </span>
        )}
      </header>

      <section>
        <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-muted-foreground mb-6">
          Articles in this Issue ({articles.length})
        </h2>
        {articles.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <GazetteArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No articles in this issue yet.</p>
        )}
      </section>
    </div>
  );
};

export default GazetteIssuePage;
