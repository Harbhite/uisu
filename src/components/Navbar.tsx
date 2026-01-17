import { motion, AnimatePresence } from "framer-motion";
import { X, Menu, LogOut, ChevronDown, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import React from "react";
import { resourceCategories } from "@/lib/data";

interface NavbarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  user: User | null;
  handleLogout: () => void;
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

export const Navbar = ({ isMenuOpen, setIsMenuOpen, user, handleLogout }: NavbarProps) => {
  const navigate = useNavigate();

  return (
    <>
      {/* --- DESKTOP NAVBAR --- */}
      <nav className="hidden md:block fixed top-0 left-0 w-full z-50 bg-ui-dark/95 backdrop-blur-lg border-b border-white/10 shadow-lg transition-all duration-300 no-print">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">

          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/uisu-logo.png" alt="UISU Logo" className="h-10 w-auto object-contain brightness-0 invert group-hover:scale-110 transition-transform duration-300" />
            <div className="flex flex-col">
              <span className="font-serif font-bold text-xl tracking-tight text-white">UISU</span>
              <span className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-300 leading-none">Archive</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="flex items-center gap-6">
            <NavigationMenu>
              <NavigationMenuList>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-white/90 hover:text-nobel-gold hover:bg-white/10 focus:bg-white/10 focus:text-white">The Union</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-ui-blue/50 to-ui-blue p-6 no-underline outline-none focus:shadow-md"
                            href="/governance"
                          >
                            <div className="mb-2 mt-4 text-lg font-medium text-white">
                              Structure
                            </div>
                            <p className="text-sm leading-tight text-white/90">
                              Understanding the Executive, Legislative, and Judiciary arms.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <ListItem href="/governance" title="Governance">
                        The constitution and legal framework.
                      </ListItem>
                      <ListItem href="/past-leaders" title="Past Leaders">
                        Archive of former student leaders.
                      </ListItem>
                      <ListItem href="/documents" title="Documents">
                        Official records and publications.
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/current-leaders">
                      <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent text-white/90 hover:text-nobel-gold hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer")}>
                          Leadership
                      </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-white/90 hover:text-nobel-gold hover:bg-white/10 focus:bg-white/10 focus:text-white">Resources</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {resourceCategories.map((resource) => (
                        <ListItem key={resource.id} href={resource.path} title={resource.title}>
                          {resource.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-white/90 hover:text-nobel-gold hover:bg-white/10 focus:bg-white/10 focus:text-white">Community</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                      <ListItem href="/communities" title="Communities">
                        Student clubs, societies, and organizations.
                      </ListItem>
                      <ListItem href="/campus-map" title="Campus Map">
                        Navigate the halls and landmarks.
                      </ListItem>
                      <ListItem href="/halls" title="Halls of Residence">
                        The Republics within the University.
                      </ListItem>
                      <ListItem href="/events" title="Events">
                        Upcoming programs and activities.
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-white/90 hover:text-nobel-gold hover:bg-white/10 focus:bg-white/10 focus:text-white">Editorial</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                      <ListItem href="/inks-vault" title="Inks Vault">
                        Creative writing, essays, and reports.
                      </ListItem>
                      <ListItem href="/announcements" title="Announcements">
                        Official news and updates.
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

              </NavigationMenuList>
            </NavigationMenu>

            {/* Action Button */}
            <div className="flex items-center gap-4 pl-4 border-l border-white/20">
               {/* Search Button */}
               <button 
                 onClick={() => navigate('/search')}
                 className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                 aria-label="Search"
               >
                 <Search size={18} />
               </button>
               
               {user && (
                <Link to="/admin" className="text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors">
                  Admin
                </Link>
              )}
              {user ? (
                 <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-red-400 transition-colors">
                  <LogOut size={14} />
                </button>
              ) : (
                  <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/auth')}
                      className="bg-nobel-gold text-ui-blue px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-ui-blue transition-colors shadow-sm"
                  >
                      Enter
                  </motion.button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE NAVBAR (Floating Pill) --- */}
      <nav className="md:hidden fixed top-14 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-40 no-print">
        <div className="bg-ui-dark/95 backdrop-blur-lg text-white rounded-full px-5 py-3 flex justify-between items-center shadow-2xl border border-white/10">

          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/uisu-logo.png" alt="UISU Logo" className="h-8 w-auto object-contain brightness-0 invert" />
            <span className="font-serif font-bold text-lg tracking-tight text-white">UISU</span>
          </Link>

          {/* Right: Sign In & Menu Button */}
          <div className="flex items-center gap-2">
            {!user && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth')}
                className="bg-nobel-gold text-ui-blue px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-ui-blue transition-colors shadow-sm"
              >
                Sign In
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 border border-white/20 rounded-full px-3 py-2 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                      <X size={14} className="text-nobel-gold"/>
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                      <Menu size={14} className="text-nobel-gold"/>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

        </div>
      </nav>
    </>
  );
};
