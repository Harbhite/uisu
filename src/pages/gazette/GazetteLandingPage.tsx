import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { GazetteArticleCard } from '@/components/gazette/GazetteArticleCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Newspaper, Archive, ChevronRight, ArrowRight, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

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
          .limit(12),
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

  const heroArticle = featuredArticles[0];
  const secondaryFeatured = featuredArticles.slice(1, 3);
  const restArticles = latestArticles.filter(a => !featuredArticles.some(f => f.id === a.id));

  return (
    <div className="space-y-16">
      {/* Hero Section — Bold oversized typography */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {heroArticle ? (
          <GazetteArticleCard article={heroArticle} variant="hero" />
        ) : (
          <div className="bg-primary py-20 px-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
              <span className="text-[200px] md:text-[300px] font-serif font-bold text-primary-foreground leading-none select-none">G</span>
            </div>
            <div className="relative z-10 space-y-4">
              <p className="text-[10px] text-accent uppercase tracking-[0.5em] font-bold">UISU Student Union</p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-primary-foreground leading-[0.95]">
                The<br />Gazette<span className="text-accent">.</span>
              </h1>
              <p className="text-primary-foreground/50 max-w-md mx-auto text-sm leading-relaxed">
                Campus news, official notices, opinions, and everything in between.
              </p>
            </div>
          </div>
        )}
      </motion.section>

      {/* Bento Grid — Secondary Featured + Latest Issue + Categories */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Secondary Featured Cards */}
        {secondaryFeatured.map((article) => (
          <GazetteArticleCard key={article.id} article={article} />
        ))}

        {/* Latest Issue Card */}
        {latestIssue ? (
          <Link
            to={`/gazette/issues/${latestIssue.id}`}
            className="border border-accent/20 bg-accent/5 p-6 flex flex-col justify-between gap-4 hover:bg-accent/10 transition-colors group"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Archive size={14} className="text-accent" />
                <span className="text-[9px] text-accent uppercase tracking-[0.4em] font-bold">Latest Issue</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-foreground group-hover:text-accent transition-colors">
                {latestIssue.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                Vol. {latestIssue.volume_number}, No. {latestIssue.issue_number}
                {latestIssue.published_at && ` — ${format(new Date(latestIssue.published_at), 'MMM yyyy')}`}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-accent">
              Read Issue <ArrowRight size={12} />
            </div>
          </Link>
        ) : (
          /* Category Grid Card when no issue */
          <div className="border border-border bg-card p-6">
            <span className="text-[9px] text-muted-foreground uppercase tracking-[0.4em] font-bold block mb-4">Sections</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.slice(0, 5).map((cat) => (
                <Link key={cat} to={`/gazette/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}>
                  <Badge variant="outline" className="hover:bg-accent/10 hover:border-accent/30 transition-colors cursor-pointer text-[10px]">
                    {cat}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Category Strip */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[9px] text-muted-foreground uppercase tracking-[0.4em] font-bold">Browse by Section</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => (
            <Link key={cat} to={`/gazette/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}>
              <Badge
                variant="outline"
                className="px-5 py-2.5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all cursor-pointer text-xs font-bold uppercase tracking-wider"
              >
                {cat}
              </Badge>
            </Link>
          ))}
        </div>
      </section>

      {/* The Latest — List style (inspired by reference) */}
      {restArticles.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              The Latest
            </h2>
            <Link
              to="/gazette/category/all"
              className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
            >
              See More <ChevronRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {restArticles.slice(0, 6).map((article) => (
              <GazetteArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>

          {restArticles.length > 6 && (
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              {restArticles.slice(6).map((article) => (
                <GazetteArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="grid md:grid-cols-2 gap-0">
        <div className="bg-primary p-8 md:p-12 flex flex-col justify-center gap-3">
          <Mail size={20} className="text-accent" />
          <h3 className="text-xl md:text-2xl font-serif font-bold text-primary-foreground">
            Stay in the loop<span className="text-accent">.</span>
          </h3>
          <p className="text-xs text-primary-foreground/50 leading-relaxed">
            Get the latest articles and official notices delivered to your inbox weekly.
          </p>
        </div>
        <Link
          to="/newsletter"
          className="bg-accent p-8 md:p-12 flex items-center justify-between group hover:bg-accent/90 transition-colors"
        >
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-accent-foreground">
            Subscribe
          </span>
          <ArrowRight size={20} className="text-accent-foreground group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>

      {/* Empty State */}
      {latestArticles.length === 0 && featuredArticles.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Newspaper size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-serif font-bold">No articles published yet</p>
          <p className="text-sm mt-1">Check back soon for the latest from the UISU Gazette.</p>
        </div>
      )}
    </div>
  );
};

export default GazetteLandingPage;
