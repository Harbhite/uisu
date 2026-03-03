import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';

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

  const displayRoutes = recentRoutes
    .filter(r => !excludedRoutes.includes(r) && routeNames[r])
    .slice(0, 5);

  if (displayRoutes.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
        <Clock size={12} /> Recent
      </span>
      {displayRoutes.map((route) => (
        <Link
          key={route}
          to={route}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:border-nobel-gold hover:text-ui-blue transition-colors rounded-full"
        >
          {routeNames[route]}
          <ArrowRight size={10} className="opacity-0 group-hover:opacity-100" />
        </Link>
      ))}
    </div>
  );
};
