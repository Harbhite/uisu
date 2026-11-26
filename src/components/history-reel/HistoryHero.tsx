import type { CSSProperties } from "react";
import { useReveal } from "./useReveal";
import { FOUNDED_YEAR } from "./history.data";

const BG = "#0a0908";
const SERIF = '"Playfair Display", Georgia, serif';
const serif: CSSProperties = { fontFamily: SERIF };
const serifItalic: CSSProperties = { fontFamily: SERIF, fontStyle: "italic" };

const PERFORATION =
  "repeating-linear-gradient(180deg, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 14px, transparent 14px, transparent 30px)";

export function HistoryHero() {
  const ref = useReveal<HTMLElement>(0.2);
  const years = new Date().getFullYear() - FOUNDED_YEAR;

  return (
    <section
      id="history-hero"
      ref={ref}
      className="relative flex min-h-[100dvh] w-full flex-col justify-between overflow-hidden px-[7.5dvh] py-[6dvh] text-white max-sm:px-[3dvh]"
      style={{ background: BG }}
    >
      {/* Warm projector glow + film perforations */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 70% 40%, rgba(241,231,210,0.07) 0%, transparent 70%), radial-gradient(90% 80% at 50% 50%, transparent 50%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-[2.5dvh] w-[10px] max-sm:hidden" style={{ backgroundImage: PERFORATION }} />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-[2.5dvh] w-[10px] max-sm:hidden" style={{ backgroundImage: PERFORATION }} />

      {/* Ghost year */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[2dvh] top-1/2 -translate-y-1/2 leading-none"
        style={{ ...serifItalic, fontSize: "62dvh", color: "rgba(246,239,226,0.04)" }}
      >
        {FOUNDED_YEAR}
      </div>

      <div data-reveal className="relative text-[10px] font-medium uppercase tracking-[0.4em] text-white/55 max-sm:text-[8.5px] max-sm:tracking-[0.28em]">
        University of Ibadan · The Record
      </div>

      <div className="relative flex flex-col gap-8 max-sm:gap-5">
        <div data-reveal className="text-[10px] font-medium uppercase tracking-[0.4em] text-white/45 max-sm:text-[8.5px]">
          A history in six frames
        </div>
        <h1
          data-reveal
          className="font-semibold uppercase text-[clamp(2.6rem,13dvh,11rem)] max-sm:text-[clamp(2.2rem,9dvh,4rem)]"
          style={{ ...serif, lineHeight: 0.9, letterSpacing: "-0.025em", color: "#f6efe2" }}
        >
          <span className="block">To think</span>
          <span className="block">straight</span>
        </h1>
        <p data-reveal className="max-w-[46ch] text-[clamp(1rem,2.4dvh,1.5rem)] leading-[1.5] text-white/80" style={serifItalic}>
          Recte sapere fons. In {years} years, a college on a borrowed hospital site became the oldest
          degree-awarding university in Nigeria. These are its first chapters, and the Union that grew up inside them.
        </p>
        <button
          data-reveal
          type="button"
          onClick={() => document.getElementById("history-reel")?.scrollIntoView({ behavior: "smooth" })}
          className="group relative flex w-fit cursor-pointer items-center gap-4 overflow-hidden rounded-full border border-white/35 bg-white/[0.04] px-8 py-4 text-[12px] font-medium uppercase tracking-[0.32em] text-white/95 backdrop-blur-md transition-[background-color,border-color,transform] duration-300 ease-out hover:scale-[1.04] hover:border-white/85 hover:bg-white/[0.14] max-sm:px-5 max-sm:py-3 max-sm:text-[10.5px]"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full rounded-full bg-gradient-to-r from-white/[0.02] via-white/10 to-white/[0.02] transition-transform duration-500 ease-out group-hover:translate-x-0"
          />
          <span className="relative">Enter the reel</span>
          <span aria-hidden className="relative transition-transform duration-300 group-hover:translate-y-1">↓</span>
        </button>
      </div>

      <div data-reveal className="relative flex items-end justify-between gap-6 border-t border-white/10 pt-5">
        {[
          { v: String(FOUNDED_YEAR), l: "Founded" },
          { v: "1962", l: "Independent" },
          { v: "06", l: "Chapters" },
        ].map((s) => (
          <div key={s.l} className="flex flex-col gap-1">
            <div className="text-[clamp(1.4rem,3dvh,2.2rem)] leading-none text-white/95" style={serif}>
              {s.v}
            </div>
            <div className="text-[9.5px] font-medium uppercase tracking-[0.32em] text-white/45">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
