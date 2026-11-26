import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Staggered blur-in for every [data-reveal] descendant, fired once when the
 * container scrolls into view. Same motion language as the reel's landing slide.
 */
export function useReveal<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = el.querySelectorAll<HTMLElement>("[data-reveal]");
    gsap.set(items, { autoAlpha: 0, y: 32, filter: "blur(10px)" });

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        gsap.to(items, {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.0,
          ease: "power4.out",
          stagger: 0.07,
        });
        io.disconnect();
      },
      { threshold },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      gsap.killTweensOf(items);
    };
  }, [threshold]);

  return ref;
}
