import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { GazetteArticleCard } from '@/components/gazette/GazetteArticleCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Newspaper, Archive, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const CATEGORIES = ['News', 'Opinion', 'Sports', 'Campus Life', 'Official Notice', 'Resolution', 'Minutes'];

const GazetteLandingPage = () => {
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);
  const [latestArticles, setLatestArticles] = useState<any[]>([]);
  const [latestIssue, setLatestIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [featuredRes, latestRes, issueRes] = await Promise.all([
        supabase
          .from('gazette_articles')
          .select('*')
          .eq('is_published', true)
          .eq('is_featured', true)
          .order('published_at', { ascending: false })
          .limit(3),
        supabase
          .from('gazette_articles')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false })
          .limit(9),
        supabase
          .from('gazette_issues')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      setFeaturedArticles(featuredRes.data || []);
      setLatestArticles(latestRes.data || []);
      setLatestIssue(issueRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Hero */}
      <div className="text-center space-y-3 py-8">
        <div className="flex items-center justify-center gap-3 text-accent">
          <Newspaper size={28} />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
          The UISU Gazette
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Your campus newspaper — news, opinions, official notices, and everything in between.
        </p>
      </div>

      {/* Latest Issue Banner */}
      {latestIssue && (
        <Link
          to={`/gazette/issues/${latestIssue.id}`}
          className="block border border-accent/30 bg-accent/5 p-6 hover:bg-accent/10 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Archive size={20} className="text-accent" />
              <div>
                <span className="text-[10px] uppercase tracking-widest text-accent font-bold">Latest Issue</span>
                <h3 className="text-lg font-serif font-bold text-foreground">{latestIssue.title}</h3>
                <span className="text-xs text-muted-foreground">
                  Vol. {latestIssue.volume_number}, No. {latestIssue.issue_number}
                  {latestIssue.published_at && ` — ${format(new Date(latestIssue.published_at), 'MMMM d, yyyy')}`}
                </span>
              </div>
            </div>
            <ChevronRight size={20} className="text-muted-foreground group-hover:text-accent transition-colors" />
          </div>
        </Link>
      )}

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-muted-foreground mb-6">Featured</h2>
          <div className="space-y-4">
            {featuredArticles.map((article, i) => (
              <GazetteArticleCard key={article.id} article={article} featured={i === 0} />
            ))}
          </div>
        </section>
      )}

      {/* Category Grid */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-muted-foreground mb-4">Browse by Category</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Link key={cat} to={`/gazette/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}>
              <Badge variant="outline" className="px-4 py-2 hover:bg-accent/10 hover:border-accent transition-colors cursor-pointer text-sm">
                {cat}
              </Badge>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Articles */}
      {latestArticles.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-muted-foreground mb-6">Latest Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestArticles.map((article) => (
              <GazetteArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {latestArticles.length === 0 && featuredArticles.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Newspaper size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No articles published yet</p>
          <p className="text-sm">Check back soon for the latest from the UISU Gazette.</p>
        </div>
      )}
    </div>
  );
};

export default GazetteLandingPage;
