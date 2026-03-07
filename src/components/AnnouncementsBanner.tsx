import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ChevronRight, X, AlertTriangle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string | null;
  created_at: string | null;
  is_active?: boolean | null;
}

export const AnnouncementsBanner = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [newAnnouncementId, setNewAnnouncementId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) throw error;
        setAnnouncements(data || []);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();

    // Set up real-time subscription
    const channel = supabase
      .channel('announcements-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'announcements',
          filter: 'is_active=eq.true'
        },
        (payload) => {
          const newAnnouncement = payload.new as Announcement;
          setAnnouncements(prev => [newAnnouncement, ...prev.slice(0, 4)]);
          setCurrentIndex(0);
          setNewAnnouncementId(newAnnouncement.id);
          setDismissed(false);
          
          // Show toast notification
          toast({
            title: "New Announcement",
            description: newAnnouncement.title,
          });
          
          // Clear the "new" indicator after 5 seconds
          setTimeout(() => setNewAnnouncementId(null), 5000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'announcements'
        },
        (payload) => {
          const updatedAnnouncement = payload.new as Announcement;
          if (updatedAnnouncement.is_active === false) {
            // Remove deactivated announcements
            setAnnouncements(prev => prev.filter(a => a.id !== updatedAnnouncement.id));
          } else {
            // Update existing announcement
            setAnnouncements(prev => 
              prev.map(a => a.id === updatedAnnouncement.id ? updatedAnnouncement : a)
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'announcements'
        },
        (payload) => {
          const deletedId = payload.old.id;
          setAnnouncements(prev => prev.filter(a => a.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  useEffect(() => {
    if (announcements.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [announcements.length]);

  if (loading || announcements.length === 0 || dismissed) return null;

  const current = announcements[currentIndex];
  const isUrgent = current.priority === 'urgent';

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className={`fixed top-20 left-0 right-0 z-40 hidden md:block ${
        isUrgent ? 'bg-destructive' : 'bg-ui-blue'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {current.id === newAnnouncementId && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="shrink-0"
              >
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              </motion.div>
            )}
            {isUrgent ? (
              <AlertTriangle className="w-5 h-5 text-white shrink-0" />
            ) : (
              <Bell className="w-5 h-5 text-white shrink-0" />
            )}
            
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 min-w-0"
              >
                <p className="text-white text-sm font-medium truncate">
                  <span className="font-bold">{current.title}:</span>{" "}
                  {current.content.substring(0, 100)}
                  {current.content.length > 100 ? "..." : ""}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4 shrink-0 ml-4">
            {announcements.length > 1 && (
              <div className="hidden md:flex items-center gap-1">
                {announcements.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentIndex ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
            
            <Link
              to="/announcements"
              className="flex items-center gap-1 text-white text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
            >
              View All
              <ChevronRight size={14} />
            </Link>
            
            <button
              onClick={() => setDismissed(true)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
