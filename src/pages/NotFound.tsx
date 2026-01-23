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

  const cardColors = [
    { bg: 'bg-primary', text: 'text-primary-foreground', border: 'border-primary/30' },
    { bg: 'bg-[#C5A059]', text: 'text-white', border: 'border-[#C5A059]/30' },
    { bg: 'bg-[#1E293B]', text: 'text-white', border: 'border-[#1E293B]/30' },
    { bg: 'bg-[#F9F8F4]', text: 'text-[#1E293B]', border: 'border-[#1E293B]/20' },
    { bg: 'bg-primary', text: 'text-primary-foreground', border: 'border-primary/30' },
    { bg: 'bg-[#C5A059]', text: 'text-white', border: 'border-[#C5A059]/30' },
  ];

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

  // Generate floating particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
    color: i % 2 === 0 ? '#C5A059' : 'white',
  }));

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
        
        {/* Floating particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              backgroundColor: particle.color,
              opacity: 0.3,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  y: -8,
                  rotateX: 5,
                  rotateY: -5,
                  scale: 1.02,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                className={`timeline-card min-w-[240px] sm:min-w-[280px] w-[20vw] max-w-[350px] aspect-square p-6 flex flex-col justify-between cursor-pointer snap-center border rounded-lg shadow-lg
                  ${cardColors[index].bg} ${cardColors[index].text} ${cardColors[index].border}`}
              >
                <motion.span 
                  className="text-sm font-medium opacity-70"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  {String(index + 1).padStart(2, '0')}
                </motion.span>
                
                <motion.div 
                  className="self-center"
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, 2, -2, 0],
                  }}
                  transition={{ 
                    duration: 4 + index * 0.5, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: index * 0.2
                  }}
                >
                  {card.icon}
                </motion.div>
                
                <div className="flex justify-between items-end">
                  <span className="text-lg font-medium">
                    {card.title}
                  </span>
                  <motion.span 
                    className="text-lg"
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {card.link ? '↗' : '→'}
                  </motion.span>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Spacer for floating action bar */}
        <div className="pb-24" />

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
