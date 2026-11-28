import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Moon, Sun } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { Button } from '@/components/ui/button';

// Map route to display name
const routeNames: Record<string, string> = {
  '/governance': 'Governance',
  '/constitution': 'Constitution',
  '/current-leaders': 'Current Leaders',
  '/past-leaders': 'Past Leaders',
  '/documents': 'Documents',
  '/inks-vault': 'Inks Vault',
  '/campus-map': 'Campus Map',
  '/communities': 'Communities',
  '/events': 'Events',
  '/announcements': 'Announcements',
  '/resources': 'Resources',
  '/halls': 'Halls of Residence',
  '/search': 'Search',
  '/history': 'History',
  '/polls': 'Polls',
  '/lost-found': 'Lost & Found',
  '/academic-calendar': 'Academic Calendar',
  '/complaints': 'Complaints',
  '/budget': 'Budget Tracker',
  '/tutorials': 'Tutorials',
  '/feedback': 'Feedback',
};

// Routes to exclude
const excludedRoutes = ['/', '/auth', '/admin'];

export const RecentlyVisited = () => {
  const recentRoutes = useAppStore((s) => s.getAppData<string[]>('recentRoutes')) || [];
  const appearance = useAppStore((s) => s.getAppData<'light' | 'dark'>('recentlyVisitedAppearance')) || 'light';
  const setAppData = useAppStore((s) => s.setAppData);
  const isLight = appearance === 'light';

  const displayRoutes = recentRoutes
    .filter(r => !excludedRoutes.includes(r) && routeNames[r])
    .slice(0, 5);

  if (displayRoutes.length === 0) return null;

  return (
    <div className={`flex w-full flex-wrap items-center gap-2 border-b px-1 py-3 transition-colors ${isLight ? 'border-border bg-background text-foreground' : 'border-foreground/10 bg-foreground text-background'}`}>
      <span className={`mr-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-muted-foreground' : 'text-background/70'}`}>
        <Clock size={12} /> Recent
      </span>
      {displayRoutes.map((route) => (
        <Link
          key={route}
          to={route}
          className={`group inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${isLight ? 'border-border bg-card text-muted-foreground hover:border-primary hover:text-primary' : 'border-background/20 bg-background/10 text-background hover:border-accent hover:text-accent'}`}
        >
          {routeNames[route]}
          <ArrowRight size={10} className="opacity-0 group-hover:opacity-100" />
        </Link>
      ))}
      <div className={`ml-auto inline-flex shrink-0 items-center gap-0.5 rounded-full border p-0.5 ${isLight ? 'border-border bg-card' : 'border-background/20 bg-background/10'}`} role="group" aria-label="Recently visited appearance">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-pressed={isLight}
          onClick={() => setAppData('recentlyVisitedAppearance', 'light')}
          className={`h-8 rounded-full px-2.5 text-[10px] shadow-none ${isLight ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground' : 'text-background hover:bg-background/10 hover:text-background'}`}
        >
          <Sun size={13} aria-hidden="true" /> Light
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-pressed={!isLight}
          onClick={() => setAppData('recentlyVisitedAppearance', 'dark')}
          className={`h-8 rounded-full px-2.5 text-[10px] shadow-none ${!isLight ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground' : 'text-muted-foreground'}`}
        >
          <Moon size={13} aria-hidden="true" /> Dark
        </Button>
      </div>
    </div>
  );
};
