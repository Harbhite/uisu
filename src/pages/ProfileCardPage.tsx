import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import ProfileCard from "@/components/ProfileCard";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const ProfileCardPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
     // Auth check similar to Index page
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SEO
        title="Profile Card | UISU"
        description="Digital Profile Card Showcase for the University of Ibadan Students' Union."
        image="/screenshots/index.png"
      />

      <Navbar
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        user={user}
        handleLogout={handleLogout}
      />

      <main className="flex-grow flex flex-col items-center justify-center py-32 px-4 relative overflow-hidden bg-ui-dark">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20 pointer-events-none noise-overlay mix-blend-overlay"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-ui-blue/20 to-ui-dark pointer-events-none"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
                    Digital <span className="text-nobel-gold italic">Identity</span>
                </h1>
                <p className="text-slate-400 max-w-md mx-auto font-light">
                    The Aluta Protocol digital identification system for Student Leaders and Union Members.
                </p>
            </div>

            <ProfileCard
                name="Aweda Bolaji"
                handle="uisu_president"
                title="Union President"
                status="Active"
                contactText="View Profile"
                onContactClick={() => console.log("Contact clicked")}
                avatarUrl="/screenshots/index.png" // Using a placeholder for now
                miniAvatarUrl="/uisu-logo.png"
                innerGradient="linear-gradient(135deg, #002244 0%, #705CD7 100%)"
                behindGlowColor="#C5A059"
            />

            <div className="mt-12 p-4 border border-white/10 rounded bg-white/5 backdrop-blur-sm max-w-lg text-center">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">System Status</p>
                <div className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-sm text-slate-300 font-mono">Identity Verification: ACTIVE</span>
                </div>
            </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfileCardPage;
