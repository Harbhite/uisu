import { Link } from 'react-router-dom';
import { Clock, Eye, User, ArrowUpRight } from 'lucide-react';
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
  variant?: 'default' | 'compact' | 'hero';
}

const categoryColors: Record<string, string> = {
  'News': 'bg-primary/10 text-primary border-primary/20',
  'Opinion': 'bg-accent/10 text-accent-foreground border-accent/30',
  'Sports': 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  'Campus Life': 'bg-pink-500/10 text-pink-700 border-pink-200',
  'Official Notice': 'bg-destructive/10 text-destructive border-destructive/20',
  'Resolution': 'bg-violet-500/10 text-violet-700 border-violet-200',
  'Minutes': 'bg-muted text-muted-foreground border-border',
};

export const GazetteArticleCard = ({ article, featured, variant = 'default' }: GazetteArticleCardProps) => {
  // Hero variant — large feature card
  if (variant === 'hero' || featured) {
    return (
      <Link
        to={`/gazette/article/${article.slug}`}
        className="group block relative overflow-hidden bg-primary"
      >
        <div className="grid md:grid-cols-2 min-h-[320px] md:min-h-[400px]">
          {/* Image side */}
          {article.cover_image ? (
            <div className="relative overflow-hidden">
              <img
                src={article.cover_image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-transparent md:hidden" />
            </div>
          ) : (
            <div className="bg-primary flex items-center justify-center">
              <span className="text-[120px] font-serif font-bold text-primary-foreground/5 select-none leading-none">
                {article.title.charAt(0)}
              </span>
            </div>
          )}

          {/* Text side */}
          <div className="p-8 md:p-12 flex flex-col justify-center gap-4 relative">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30 text-[10px] uppercase tracking-[0.15em]">
                {article.category}
              </Badge>
              {article.is_featured && (
                <Badge className="bg-accent text-accent-foreground text-[10px] uppercase tracking-[0.1em]">Featured</Badge>
              )}
            </div>

            <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary-foreground leading-tight group-hover:text-accent transition-colors duration-300">
              {article.title}
            </h2>

            {article.summary && (
              <p className="text-sm text-primary-foreground/60 line-clamp-2 leading-relaxed">{article.summary}</p>
            )}

            <div className="flex items-center gap-4 text-[11px] text-primary-foreground/40 mt-auto pt-4 border-t border-primary-foreground/10">
              <span className="flex items-center gap-1.5">
                <User size={12} />
                {article.author_name}
              </span>
              {article.published_at && (
                <span>{format(new Date(article.published_at), 'MMM d, yyyy')}</span>
              )}
              {article.reading_time && (
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {article.reading_time} min
                </span>
              )}
            </div>

            <ArrowUpRight size={20} className="absolute top-8 right-8 text-primary-foreground/20 group-hover:text-accent transition-colors" />
          </div>
        </div>
      </Link>
    );
  }

  // Compact variant — list row
  if (variant === 'compact') {
    return (
      <Link
        to={`/gazette/article/${article.slug}`}
        className="group flex items-center justify-between gap-4 py-4 border-b border-border hover:bg-muted/30 transition-colors px-2 -mx-2"
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-serif font-bold text-foreground group-hover:text-accent transition-colors truncate text-sm md:text-base">
            {article.title}
          </h3>
          {article.summary && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{article.summary}</p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Badge variant="outline" className={`${categoryColors[article.category] || 'bg-muted text-muted-foreground'} text-[9px] uppercase tracking-wider hidden sm:inline-flex`}>
            {article.category}
          </Badge>
          {article.published_at && (
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {format(new Date(article.published_at), 'MMM d, yyyy')}
            </span>
          )}
          <ArrowUpRight size={14} className="text-muted-foreground/30 group-hover:text-accent transition-colors" />
        </div>
      </Link>
    );
  }

  // Default card
  return (
    <Link
      to={`/gazette/article/${article.slug}`}
      className="group block border border-border bg-card hover:border-accent/30 transition-all duration-300 overflow-hidden"
    >
      {article.cover_image && (
        <div className="overflow-hidden aspect-[16/9]">
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={`${categoryColors[article.category] || 'bg-muted text-muted-foreground'} text-[9px] uppercase tracking-wider`}>
            {article.category}
          </Badge>
          {article.is_featured && (
            <Badge className="bg-accent text-accent-foreground text-[9px]">Featured</Badge>
          )}
        </div>

        <h3 className="font-serif font-bold text-foreground group-hover:text-accent transition-colors leading-tight text-lg">
          {article.title}
        </h3>

        {article.summary && (
          <p className="text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
        )}

        <div className="flex items-center gap-4 text-[11px] text-muted-foreground mt-auto pt-3 border-t border-border">
          <span className="flex items-center gap-1">
            <User size={11} />
            {article.author_name}
          </span>
          {article.reading_time && (
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {article.reading_time} min
            </span>
          )}
          {article.view_count != null && article.view_count > 0 && (
            <span className="flex items-center gap-1">
              <Eye size={11} />
              {article.view_count}
            </span>
          )}
          {article.published_at && (
            <span className="ml-auto">
              {format(new Date(article.published_at), 'MMM d')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default GazetteArticleCard;
