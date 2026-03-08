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
        <Bookmark size={48} className="mx-auto opacity-30" />
        <p>Sign in to see your bookmarked articles.</p>
        <Link to="/auth" className="text-accent underline">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">My Bookmarks</h1>
        <p className="text-muted-foreground">Your saved Gazette articles.</p>
      </div>

      {articles.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <GazetteArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <Bookmark size={48} className="mx-auto mb-4 opacity-30" />
          <p>No bookmarked articles yet. Browse the Gazette and save articles you want to read later.</p>
        </div>
      )}
    </div>
  );
};

export default GazetteBookmarksPage;
