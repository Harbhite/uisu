import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { SEO } from "@/components/SEO";
import { Home, Archive, Users, Calendar, HelpCircle, X, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

interface CardData {
  title: string;
  text: string;
  icon: React.ReactNode;
  link?: string;
}

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(3);
  const [descText, setDescText] = useState("");
  const [isTextVisible, setIsTextVisible] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const cardData: CardData[] = [
    {
      title: "The Archive",
      text: "Access official documents, past resolutions, and constitutional records from the Students' Union archives.",
      icon: <Archive className="w-12 h-12" />,
      link: "/documents"
    },
    {
      title: "Leadership",
      text: "Explore the current Student Union executives and representatives serving the University of Ibadan community.",
      icon: <Users className="w-12 h-12" />,
      link: "/current-leaders"
    },
    {
      title: "Events",
      text: "Stay updated with upcoming campus events, meetings, and activities organized by the Students' Union.",
      icon: <Calendar className="w-12 h-12" />,
      link: "/events"
    },
    {
      title: "The Void",
      text: "The page you're looking for has been moved, removed, or never existed. Navigate using the cards to find your way back.",
      icon: <X className="w-12 h-12" />,
    },
    {
      title: "Homepage",
      text: "Return to the main portal of the University of Ibadan Students' Union website.",
      icon: <Home className="w-12 h-12" />,
      link: "/"
    },
    {
      title: "Communities",
      text: "Discover student organizations, clubs, and societies within the University of Ibadan.",
      icon: <HelpCircle className="w-12 h-12" />,
      link: "/communities"
    }
  ];

  const phaseList = [
    "1. THE ARCHIVE",
    "2. LEADERSHIP",
    "3. EVENTS",
    "4. 404 / PAGE NOT FOUND",
    "5. HOMEPAGE",
    "6. COMMUNITIES"
  ];

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  useEffect(() => {
    setDescText(cardData[activeIndex].text);
  }, []);

  useEffect(() => {
    if (scrollerRef.current) {
      const cards = scrollerRef.current.querySelectorAll('.timeline-card');
      const activeCard = cards[3] as HTMLElement;
      if (activeCard) {
        setTimeout(() => {
          const scrollPos = activeCard.offsetLeft - (scrollerRef.current!.offsetWidth / 2) + (activeCard.offsetWidth / 2);
          scrollerRef.current?.scrollTo({ left: scrollPos, behavior: 'smooth' });
        }, 300);
      }
    }
  }, []);

  const selectPhase = (index: number) => {
    setActiveIndex(index);
    setIsTextVisible(false);
    
    setTimeout(() => {
      setDescText(cardData[index].text);
      setIsTextVisible(true);
    }, 300);

    if (scrollerRef.current) {
      const cards = scrollerRef.current.querySelectorAll('.timeline-card');
      const card = cards[index] as HTMLElement;
      if (card) {
        const scrollPos = card.offsetLeft - (scrollerRef.current.offsetWidth / 2) + (card.offsetWidth / 2);
        scrollerRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
      }
    }
  };

  const handleCardClick = (index: number) => {
    selectPhase(index);
    const link = cardData[index].link;
    if (link) {
      setTimeout(() => navigate(link), 400);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollerRef.current.offsetLeft);
    setScrollLeft(scrollerRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden relative">
      <SEO title="Page Not Found - UISU" description="The page you are looking for does not exist." />
      
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-[0.07]"
          style={{
            background: 'radial-gradient(ellipse at center, #C5A059 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, white 0%, transparent 40%), radial-gradient(ellipse at 20% 80%, #C5A059 0%, transparent 45%)',
          }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 60, repeat: Infinity, ease: "linear" },
            scale: { duration: 20, repeat: Infinity, ease: "easeInOut" },
          }}
        />
        <motion.div
          className="absolute top-0 left-0 w-full h-full opacity-[0.04]"
          style={{
            background: 'linear-gradient(135deg, transparent 0%, #C5A059 25%, transparent 50%, white 75%, transparent 100%)',
            backgroundSize: '400% 400%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="max-w-[1600px] mx-auto px-[4vw] py-8 w-full h-full flex flex-col justify-between flex-1 animate-fade-in relative z-10">
        {/* Header */}
        <header className="pt-4 relative">
          <Link to="/" className="block w-10 h-10 mb-8">
            <img src="/uisu-logo.png" alt="UISU Logo" className="w-full h-full object-contain" />
          </Link>
          
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-left font-normal mb-4 tracking-tight text-primary">
            Timeline Interruption
          </h1>
          
          <p className="text-left text-muted-foreground max-w-2xl mb-6 text-sm sm:text-base leading-relaxed">
            The page you're looking for has been moved, removed, or never existed in this timeline. 
            Use the navigation below to return to a stable section of the site.
          </p>
          
          <div className="hidden sm:flex justify-between border-t border-border pt-4 mb-8 text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            <span>Navigation Options</span>
            <span>Current Status: 404</span>
          </div>
        </header>

        {/* Timeline Scroller */}
        <section className="flex-grow flex items-center relative">
          <div 
            ref={scrollerRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar w-full cursor-grab"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {cardData.map((card, index) => (
              <motion.article
                key={index}
                onClick={() => handleCardClick(index)}
                whileHover={{ 
                  y: -8,
                  rotateX: 5,
                  rotateY: -5,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                className={`timeline-card min-w-[240px] sm:min-w-[280px] w-[20vw] max-w-[350px] aspect-square p-6 flex flex-col justify-between cursor-pointer transition-colors duration-300 snap-center border
                  ${activeIndex === index 
                    ? 'bg-primary/10 border-primary/20' 
                    : 'bg-muted border-transparent'
                  }`}
              >
                <span className="text-sm font-medium opacity-60">
                  {String(index + 1).padStart(2, '0')}
                </span>
                
                <motion.div 
                  className={`self-center transition-opacity duration-500 ${activeIndex === index ? 'opacity-100' : 'opacity-80'}`}
                  whileHover={{ scale: 1.1, rotate: 3 }}
                  transition={{ duration: 0.3 }}
                >
                  {card.icon}
                </motion.div>
                
                <div className="flex justify-between items-end">
                  <span className="text-lg font-medium text-foreground">
                    {card.title}
                  </span>
                  <span className="text-lg">
                    {card.link ? (
                      <span className="text-primary">↗</span>
                    ) : (
                      <span className="text-primary">→</span>
                    )}
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Bottom Details */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4 lg:gap-16 mt-auto pb-24">
          <ul className="hidden lg:block text-xs leading-loose text-muted-foreground font-medium tracking-wide uppercase">
            {phaseList.map((phase, index) => (
              <li 
                key={index}
                className={activeIndex === index ? 'text-foreground font-bold' : ''}
              >
                {phase}
              </li>
            ))}
          </ul>

          <div className="max-w-xl">
            <p 
              className={`text-sm sm:text-base leading-relaxed text-muted-foreground transition-all duration-400 ${
                isTextVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
            >
              {descText}
            </p>
          </div>
        </section>

        {/* Floating Action Bar */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-md py-2 pl-6 pr-2 rounded-full shadow-xl flex items-center gap-4 border border-border z-50">
          <span className="text-sm font-medium hidden sm:inline text-muted-foreground">Lost? Let's get you back.</span>
          <Link 
            to="/" 
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 hover:bg-primary/90 inline-flex items-center gap-2"
          >
            Return Home
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
