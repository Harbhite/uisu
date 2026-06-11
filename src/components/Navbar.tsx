import { motion, AnimatePresence } from "framer-motion";
import { X, Menu, LogOut, ChevronDown, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { useAdminCheck } from "@/hooks/useAdminCheck";
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
  const { isStaff } = useAdminCheck();

  return (
    <>
      {/* --- DESKTOP NAVBAR --- */}
      <nav className="hidden md:flex fixed top-3 left-1/2 -translate-x-1/2 w-[96%] max-w-7xl z-50 justify-center transition-all duration-300 no-print">
        <div className="w-full bg-gradient-to-r from-ui-dark/85 via-ui-dark/90 to-ui-dark/85 backdrop-blur-xl border border-white/15 shadow-xl rounded-2xl px-5 h-14 grid grid-cols-[1fr_auto_1fr] items-center gap-4">

          {/* Left Navigation */}
          <div className="flex items-center justify-start">
            <NavigationMenu>
                <NavigationMenuList className="space-x-0.5">

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent text-white/85 hover:text-nobel-gold hover:bg-white/10 focus:bg-white/10 focus:text-white px-2.5 py-1.5 text-xs lg:text-sm font-semibold tracking-wide rounded-lg transition-all duration-200">The Union</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                        <li className="row-span-3">
                          <NavigationMenuLink asChild>
                            <a
                              className="flex h-full w-full select-none flex-col justify-end rounded-lg bg-gradient-to-b from-ui-blue/50 to-ui-blue p-6 no-underline outline-none focus:shadow-md"
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
                        <ListItem href="/constitution" title="Constitution">
                          The supreme law of the Union.
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
                        <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent text-white/85 hover:text-nobel-gold hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer px-2.5 py-1.5 text-xs lg:text-sm font-semibold tracking-wide rounded-lg transition-all duration-200")}>
                            Leadership
                        </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent text-white/85 hover:text-nobel-gold hover:bg-white/10 focus:bg-white/10 focus:text-white px-2.5 py-1.5 text-xs lg:text-sm font-semibold tracking-wide rounded-lg transition-all duration-200">Resources</NavigationMenuTrigger>
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

                </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Center Logo */}
          <Link to="/" className="flex items-center gap-1.5 group justify-center flex-shrink-0">
            <img src="/uisu-logo.png" alt="UISU Logo" className="h-7 lg:h-8 w-auto object-contain brightness-0 invert group-hover:scale-110 transition-transform duration-300" />
            <div className="flex flex-col hidden sm:flex">
              <span className="text-[0.55rem] lg:text-[0.6rem] font-bold uppercase tracking-widest text-white leading-tight">UI</span>
              <span className="text-[0.55rem] lg:text-[0.6rem] font-bold uppercase tracking-widest text-nobel-gold leading-tight">SU</span>
            </div>
          </Link>

          {/* Right Navigation & Actions */}
          <div className="flex items-center justify-end gap-1.5 lg:gap-3">
              <NavigationMenu>
                  <NavigationMenuList className="space-x-0.5">
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="bg-transparent text-white/85 hover:text-nobel-gold hover:bg-white/10 focus:bg-white/10 focus:text-white px-2.5 py-1.5 text-xs lg:text-sm font-semibold tracking-wide rounded-lg transition-all duration-200">Community</NavigationMenuTrigger>
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
                      <NavigationMenuTrigger className="bg-transparent text-white/85 hover:text-nobel-gold hover:bg-white/10 focus:bg-white/10 focus:text-white px-2.5 py-1.5 text-xs lg:text-sm font-semibold tracking-wide rounded-lg transition-all duration-200">Editorial</NavigationMenuTrigger>
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

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pl-2 lg:pl-3 border-l border-white/20">
                 {/* Search Button */}
                 <button
                   onClick={() => navigate('/search')}
                   className="p-1.5 text-slate-300 hover:text-nobel-gold hover:bg-white/10 rounded-lg transition-all duration-200"
                   aria-label="Search"
                 >
                   <Search size={16} className="lg:w-[17px] lg:h-[17px]" />
                 </button>

                 {user && isStaff && (
                  <Link to="/admin" className="text-[9px] lg:text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-nobel-gold transition-colors hidden xl:block px-2 py-1.5 rounded-lg hover:bg-white/10">
                    Admin
                  </Link>
                )}
                {user ? (
                   <button onClick={handleLogout} className="flex items-center gap-1.5 text-slate-300 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/10" title="Logout">
                    <LogOut size={16} />
                  </button>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/auth')}
                        className="bg-nobel-gold text-ui-blue px-3 lg:px-5 py-1.5 rounded-lg text-[9px] lg:text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-ui-blue transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        Enter
                    </motion.button>
                )}
              </div>
          </div>

        </div>
      </nav>

      {/* --- MOBILE NAVBAR (Floating Pill) --- */}
      <nav className="md:hidden fixed top-3 left-1/2 -translate-x-1/2 w-[92%] max-w-sm z-50 no-print">
        <div className="bg-ui-dark/90 backdrop-blur-xl text-white rounded-xl px-4 py-2.5 flex justify-between items-center shadow-lg border border-white/15">

          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-1.5">
            <img src="/uisu-logo.png" alt="UISU Logo" className="h-7 w-auto object-contain brightness-0 invert" />
            <span className="font-serif font-bold text-base tracking-tight text-white">UISU</span>
          </Link>

          {/* Right: Search, Sign In & Menu Button */}
          <div className="flex items-center gap-1.5">
            {/* Mobile Search Button */}
            <button
              onClick={() => navigate('/search')}
              className="p-1.5 text-slate-300 hover:text-nobel-gold hover:bg-white/10 rounded-lg transition-all duration-200"
              aria-label="Search"
            >
              <Search size={16} />
            </button>

            {!user && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth')}
                className="bg-nobel-gold text-ui-blue px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-white hover:text-ui-blue transition-all duration-200 shadow-md"
              >
                Sign In
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 border border-white/20 rounded-lg px-2.5 py-1.5 bg-white/5 hover:bg-white/10 transition-all duration-200"
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                      <X size={16} className="text-nobel-gold"/>
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                      <Menu size={16} className="text-nobel-gold"/>
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
