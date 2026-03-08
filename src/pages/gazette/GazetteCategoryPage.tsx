import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { GazetteArticleCard } from '@/components/gazette/GazetteArticleCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { motion } from 'framer-motion';

const categoryMap: Record<string, string> = {
  'news': 'News',
  'opinion': 'Opinion',
  'sports': 'Sports',
  'campus-life': 'Campus Life',
  'official-notice': 'Official Notice',
  'resolution': 'Resolution',
  'minutes': 'Minutes',
  'all': 'All Articles',
};

const GazetteCategoryPage = () => {
  const { cat } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const categoryName = categoryMap[cat || ''] || cat || 'Unknown';

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      let query = supabase
        .from('gazette_articles')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (cat && cat !== 'all') {
        query = query.eq('category', categoryName);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%`);
      }

      const { data } = await query.limit(50);
      setArticles(data || []);
      setLoading(false);
    };
    fetchArticles();
  }, [cat, categoryName, searchQuery]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <p className="text-[10px] text-accent uppercase tracking-[0.4em] font-bold">Section</p>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">{categoryName}</h1>
        {searchQuery && <p className="text-sm text-muted-foreground">Showing results for "{searchQuery}"</p>}
      </div>

      {articles.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {articles.map((article) => (
            <GazetteArticleCard key={article.id} article={article} />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <p className="font-serif">No articles found in this section.</p>
        </div>
      )}
    </div>
  );
};

export default GazetteCategoryPage;
