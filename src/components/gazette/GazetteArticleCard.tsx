import { Link } from 'react-router-dom';
import { Clock, Eye, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface GazetteArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    summary?: string | null;
    cover_image?: string | null;
    category: string;
    author_name: string;
    reading_time?: number | null;
    view_count?: number | null;
    published_at?: string | null;
    is_featured?: boolean | null;
  };
  featured?: boolean;
}

const categoryColors: Record<string, string> = {
  'News': 'bg-blue-500/10 text-blue-600 border-blue-200',
  'Opinion': 'bg-orange-500/10 text-orange-600 border-orange-200',
  'Sports': 'bg-green-500/10 text-green-600 border-green-200',
  'Campus Life': 'bg-pink-500/10 text-pink-600 border-pink-200',
  'Official Notice': 'bg-red-500/10 text-red-600 border-red-200',
  'Resolution': 'bg-purple-500/10 text-purple-600 border-purple-200',
  'Minutes': 'bg-slate-500/10 text-slate-600 border-slate-200',
};

export const GazetteArticleCard = ({ article, featured }: GazetteArticleCardProps) => {
  return (
    <Link
      to={`/gazette/article/${article.slug}`}
      className={`group block border border-border bg-card hover:shadow-lg transition-all duration-300 overflow-hidden ${featured ? 'md:flex' : ''}`}
    >
      {article.cover_image && (
        <div className={`overflow-hidden ${featured ? 'md:w-1/2' : 'aspect-[16/9]'}`}>
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className={`p-5 flex flex-col gap-3 ${featured ? 'md:w-1/2 md:p-8 md:justify-center' : ''}`}>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={categoryColors[article.category] || 'bg-muted text-muted-foreground'}>
            {article.category}
          </Badge>
          {article.is_featured && (
            <Badge className="bg-accent text-accent-foreground text-[10px]">Featured</Badge>
          )}
        </div>

        <h3 className={`font-serif font-bold text-foreground group-hover:text-accent transition-colors leading-tight ${featured ? 'text-2xl md:text-3xl' : 'text-lg'}`}>
          {article.title}
        </h3>

        {article.summary && (
          <p className="text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-2 border-t border-border">
          <span className="flex items-center gap-1">
            <User size={12} />
            {article.author_name}
          </span>
          {article.reading_time && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {article.reading_time} min
            </span>
          )}
          {article.view_count != null && article.view_count > 0 && (
            <span className="flex items-center gap-1">
              <Eye size={12} />
              {article.view_count}
            </span>
          )}
          {article.published_at && (
            <span className="ml-auto">
              {format(new Date(article.published_at), 'MMM d, yyyy')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default GazetteArticleCard;
