import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Home, Mail, FileText, Users, Calendar, Search } from "lucide-react";
import { SEO } from "@/components/SEO";
import { motion, AnimatePresence } from "framer-motion";

interface TimelineCard {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  isVoid?: boolean;
}

const timelineData: TimelineCard[] = [
  {
    id: 1,
    title: "The Archive",
    description: "Explore the rich history and heritage of the University of Ibadan Students' Union through our comprehensive document library.",
    icon: <FileText className="w-12 h-12" strokeWidth={1.5} />,
    href: "/documents"
  },
  {
    id: 2,
    title: "Leadership",
    description: "Meet the dedicated executives and representatives who serve the student body with commitment and vision.",
    icon: <Users className="w-12 h-12" strokeWidth={1.5} />,
    href: "/current-leaders"
  },
  {
    id: 3,
    title: "Events",
    description: "Stay updated with upcoming events, meetings, and activities happening across the campus community.",
    icon: <Calendar className="w-12 h-12" strokeWidth={1.5} />,
    href: "/events"
  },
  {
    id: 4,
    title: "The Void",
    description: "We've encountered a timeline displacement. The page you seek has been moved, deleted, or never existed in this dimension. You are currently here.",
    icon: (
      <svg viewBox="0 0 24 24" className="w-12 h-12" strokeWidth={1.5} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
      </svg>
    ),
    isVoid: true
  },
  {
    id: 5,
    title: "Homepage",
    description: "The most viable path forward. Return to the homepage to re-establish your session with the current site.",
    icon: <Home className="w-12 h-12" strokeWidth={1.5} />,
    href: "/"
  },
  {
    id: 6,
    title: "Search",
    description: "Can't find what you're looking for? Use our search functionality to discover content across the entire archive.",
    icon: <Search className="w-12 h-12" strokeWidth={1.5} />,
    href: "/search"
  }
];

const NotFound = () => {
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(3); // Start at "The Void"
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Center the void card on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const scroller = scrollerRef.current;
      if (scroller) {
        const cards = scroller.querySelectorAll('[data-card]');
        const voidCard = cards[3] as HTMLElement;
        if (voidCard) {
          const scrollPos = voidCard.offsetLeft - (scroller.offsetWidth / 2) + (voidCard.offsetWidth / 2);
          scroller.scrollTo({ left: scrollPos, behavior: 'smooth' });
        }
      }
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleCardClick = (index: number, href?: string) => {
    setActiveIndex(index);
    
    // Scroll to center the card
    const scroller = scrollerRef.current;
    if (scroller) {
      const cards = scroller.querySelectorAll('[data-card]');
      const card = cards[index] as HTMLElement;
      if (card) {
        const scrollPos = card.offsetLeft - (scroller.offsetWidth / 2) + (card.offsetWidth / 2);
        scroller.scrollTo({ left: scrollPos, behavior: 'smooth' });
      }
    }
  };

  // Drag to scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollerRef.current?.offsetLeft || 0));
    setScrollLeft(scrollerRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (scrollerRef.current) {
      scrollerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const activeCard = timelineData[activeIndex];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <SEO title="Page Not Found | Lost in Timeline" description="The page you are looking for does not exist." />

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex flex-col max-w-[1600px] mx-auto w-full px-4 sm:px-8 py-8"
      >
        {/* Header */}
        <header className="mb-8">
          <Link to="/" className="inline-block mb-6">
            <img 
              src="/uisu-logo.png" 
              alt="UISU Logo" 
              className="w-10 h-10 object-contain"
            />
          </Link>
          
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-center font-normal mb-6 tracking-tight text-ui-blue">
            Timeline <span className="italic text-nobel-gold">Interruption</span>
          </h1>
          
          <div className="flex justify-between items-center border-t border-border pt-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            <span>Historical Versions</span>
            <span className="text-destructive">Current Status: 404</span>
          </div>
        </header>

        {/* Timeline Scroller */}
        <section className="flex-1 flex items-center relative py-4">
          <div 
            ref={scrollerRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 w-full no-scrollbar cursor-grab active:cursor-grabbing"
            style={{ scrollSnapType: 'x mandatory' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            {timelineData.map((card, index) => (
              <motion.article
                key={card.id}
                data-card
                onClick={() => handleCardClick(index, card.href)}
                className={`
                  min-w-[260px] sm:min-w-[280px] w-[20vw] max-w-[320px] aspect-square
                  p-5 flex flex-col justify-between relative cursor-pointer
                  transition-all duration-300 ease-out border
                  ${activeIndex === index 
                    ? 'bg-ui-blue/5 border-ui-blue/20 shadow-lg' 
                    : 'bg-muted/50 border-transparent hover:bg-muted hover:-translate-y-1 hover:shadow-md'
                  }
                `}
                style={{ scrollSnapAlign: 'center' }}
                whileHover={{ scale: activeIndex === index ? 1 : 1.02 }}
              >
                <span className="text-sm font-medium text-muted-foreground">
                  {String(card.id).padStart(2, '0')}
                </span>
                
                <div className={`
                  self-center transition-transform duration-500
                  ${activeIndex === index ? 'scale-110 text-nobel-gold' : 'text-ui-blue/70'}
                `}>
                  {card.icon}
                </div>
                
                <div className="flex justify-between items-end">
                  <span className={`
                    text-lg font-medium
                    ${activeIndex === index ? 'text-ui-blue' : 'text-foreground'}
                  `}>
                    {card.title}
                  </span>
                  <span className={`
                    text-lg transition-transform duration-300
                    ${card.href ? 'group-hover:rotate-0' : ''}
                  `}>
                    {card.href ? '↗' : '→'}
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Bottom Details */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 mt-auto pb-24 lg:pb-8">
          {/* Phase List - Hidden on mobile */}
          <ul className="hidden lg:block text-xs leading-relaxed text-muted-foreground font-medium tracking-wide uppercase space-y-1">
            {timelineData.map((card, index) => (
              <li 
                key={card.id}
                className={`transition-colors duration-300 ${
                  activeIndex === index ? 'text-ui-blue font-bold' : ''
                }`}
              >
                {card.id}. {card.title.toUpperCase()}
              </li>
            ))}
          </ul>

          {/* Description Block */}
          <div className="max-w-xl">
            <AnimatePresence mode="wait">
              <motion.p 
                key={activeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-base text-muted-foreground leading-relaxed"
              >
                {activeCard.description}
              </motion.p>
            </AnimatePresence>
          </div>
        </section>
      </motion.div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-lg px-4 sm:px-6 py-3 rounded-full shadow-xl border border-border flex items-center gap-4 z-50">
        <span className="text-sm font-medium hidden sm:block">Lost? Let's get you back.</span>
        <Link 
          to="/"
          className="bg-ui-blue text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-ui-dark transition-transform hover:scale-105 inline-flex items-center gap-2"
        >
          Return Home
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </Link>
      </div>

      {/* Footer text */}
      <div className="absolute bottom-20 lg:bottom-4 left-1/2 -translate-x-1/2 text-muted-foreground/40 text-xs font-mono uppercase tracking-[0.15em]">
        University of Ibadan Students' Union
      </div>
    </div>
  );
};

export default NotFound;
