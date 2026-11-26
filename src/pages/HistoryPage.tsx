import { useEffect } from "react";
import { SEO } from "@/components/SEO";
import { HistoryHero } from "@/components/history-reel/HistoryHero";
import { HistoryReel } from "@/components/history-reel/HistoryReel";
import { HistoryFooter } from "@/components/history-reel/HistoryFooter";

const FONT_ID = "history-reel-fonts";
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..700;1,400..700&display=swap";

/**
 * History page: hero, the six-chapter cinema reel, and an end section.
 * The reel owns the mouse wheel, so this page deliberately does NOT run Lenis.
 */
const HistoryPage = () => {
  useEffect(() => {
    if (document.getElementById(FONT_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_ID;
    link.rel = "stylesheet";
    link.href = FONT_HREF;
    document.head.appendChild(link);
  }, []);

  return (
    <div className="relative w-full bg-[#0a0908]">
      <SEO
        title="History - University of Ibadan Students' Union"
        description="From University College Ibadan in 1948 to the Students' Union today: the history of the University of Ibadan in six chapters."
        image="/og/pages-screenshot/history.png"
      />
      <HistoryHero />
      <HistoryReel />
      <HistoryFooter />
    </div>
  );
};

export default HistoryPage;
