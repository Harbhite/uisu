import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

// VAPID public key - In production, generate your own keys
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

export const NotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Check if notifications are supported and if user already subscribed
    const checkNotificationStatus = async () => {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        return;
      }

      const permission = Notification.permission;
      
      if (permission === 'granted') {
        // Check if we have an active subscription
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        } catch (error) {
          console.error('Error checking subscription:', error);
        }
      } else if (permission === 'default') {
        // Show prompt after a delay for logged-in users
        const hasDeclined = localStorage.getItem('notification-prompt-declined');
        if (!hasDeclined) {
          setTimeout(() => setShowPrompt(true), 3000);
        }
      }
    };

    checkNotificationStatus();
  }, [user]);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToNotifications = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to enable notifications.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast({
          title: "Notifications blocked",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
        setShowPrompt(false);
        localStorage.setItem('notification-prompt-declined', 'true');
        return;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const subscriptionJSON = subscription.toJSON();
      
      // Save subscription to database
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscriptionJSON.endpoint!,
          p256dh: subscriptionJSON.keys!.p256dh,
          auth: subscriptionJSON.keys!.auth,
        }, {
          onConflict: 'endpoint'
        });

      if (error) throw error;

      setIsSubscribed(true);
      setShowPrompt(false);
      
      toast({
        title: "Notifications enabled!",
        description: "You'll receive alerts for new announcements.",
      });
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      toast({
        title: "Error",
        description: "Failed to enable notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('notification-prompt-declined', 'true');
  };

  if (!user || isSubscribed) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-6">
            <button
              onClick={dismissPrompt}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </button>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-ui-blue/10 flex items-center justify-center shrink-0">
                <Bell className="w-6 h-6 text-ui-blue" />
              </div>
              
              <div>
                <h3 className="font-serif text-lg text-ui-blue mb-1">
                  Stay Updated
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get instant notifications for important announcements on your phone.
                </p>
                
                <div className="flex gap-2">
                  <button
                    onClick={subscribeToNotifications}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-ui-blue text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-nobel-gold hover:text-foreground transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Bell size={14} />
                    )}
                    Enable
                  </button>
                  
                  <button
                    onClick={dismissPrompt}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Not now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
