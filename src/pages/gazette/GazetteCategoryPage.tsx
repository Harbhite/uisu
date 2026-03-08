import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { GazetteArticleCard } from '@/components/gazette/GazetteArticleCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Tag } from 'lucide-react';

const categoryMap: Record<string, string> = {
  'news': 'News',
  'opinion': 'Opinion',
  'sports': 'Sports',
  'campus-life': 'Campus Life',
  'official-notice': 'Official Notice',
  'resolution': 'Resolution',
  'minutes': 'Minutes',
  'all': 'All Categories',
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Tag size={20} className="text-accent" />
        <h1 className="text-3xl font-serif font-bold text-foreground">{categoryName}</h1>
      </div>
      {searchQuery && <p className="text-muted-foreground">Showing results for "{searchQuery}"</p>}

      {articles.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <GazetteArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <p>No articles found in this category.</p>
        </div>
      )}
    </div>
  );
};

export default GazetteCategoryPage;
