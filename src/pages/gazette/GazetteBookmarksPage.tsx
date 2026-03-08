import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GazetteArticleCard } from '@/components/gazette/GazetteArticleCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Bookmark } from 'lucide-react';

const GazetteBookmarksPage = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from('gazette_bookmarks')
      .select('*, gazette_articles(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setArticles((data || []).map((b: any) => b.gazette_articles).filter(Boolean));
        setLoading(false);
      });
  }, [user]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;

  if (!user) {
    return (
      <div className="text-center py-20 text-muted-foreground space-y-3">
        <Bookmark size={48} className="mx-auto opacity-20" />
        <p className="font-serif text-lg">Sign in to see your bookmarks.</p>
        <Link to="/auth" className="text-accent text-sm font-bold uppercase tracking-wider hover:underline">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <p className="text-[10px] text-accent uppercase tracking-[0.4em] font-bold">Your Library</p>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Saved Articles</h1>
        <p className="text-sm text-muted-foreground">Articles you've bookmarked for later reading.</p>
      </div>

      {articles.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <GazetteArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <Bookmark size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-serif">No bookmarked articles yet.</p>
          <p className="text-sm mt-1">Browse the Gazette and save articles you want to read later.</p>
        </div>
      )}
    </div>
  );
};

export default GazetteBookmarksPage;
