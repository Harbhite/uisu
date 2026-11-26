import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useReveal } from "./useReveal";

const BG = "#0a0908";
const SERIF = '"Playfair Display", Georgia, serif';
const serif: CSSProperties = { fontFamily: SERIF };
const serifItalic: CSSProperties = { fontFamily: SERIF, fontStyle: "italic" };

interface FooterLink {
  label: string;
  href: string;
}

interface HistoryFooterProps {
  links?: FooterLink[];
  brand?: string;
}

const DEFAULT_LINKS: FooterLink[] = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Resources", href: "/resources" },
];

const SOURCES: FooterLink[] = [
  { label: "University of Ibadan — A Brief History", href: "https://ui.edu.ng/sites/default/files/History%20of%20UI.docx" },
  { label: "University of Ibadan — Foundation history", href: "https://ui.edu.ng/node/42" },
  { label: "Fry, Drew & Partners at Ibadan", href: "https://livinspaces.net/?p=18985" },
  { label: "Photographs: ASC Leiden via Wikimedia Commons", href: "https://commons.wikimedia.org/wiki/Category:University_of_Ibadan" },
];

export function HistoryFooter({ links = DEFAULT_LINKS, brand = "UISU" }: HistoryFooterProps) {
  const ref = useReveal<HTMLElement>(0.2);

  return (
    <footer
      id="history-footer"
      ref={ref}
      className="relative flex min-h-[85dvh] w-full flex-col justify-between overflow-hidden px-[7.5dvh] py-[6dvh] text-white max-sm:px-[3dvh]"
      style={{ background: BG }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 30% 60%, rgba(241,231,210,0.06) 0%, transparent 70%), radial-gradient(90% 80% at 50% 50%, transparent 50%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <div className="relative flex items-center justify-between">
        <div data-reveal className="text-[10px] font-medium uppercase tracking-[0.4em] text-white/45">
          End of reel
        </div>
        <button
          data-reveal
          type="button"
          onClick={() => document.getElementById("history-reel")?.scrollIntoView({ behavior: "smooth" })}
          className="cursor-pointer text-[10px] font-medium uppercase tracking-[0.32em] text-white/55 transition-colors hover:text-white"
        >
          ↑ Replay the reel
        </button>
      </div>

      <div className="relative flex flex-col gap-6">
        <p
          data-reveal
          className="max-w-[16ch] text-[clamp(2.4rem,10dvh,8rem)] leading-[0.95] max-sm:text-[clamp(2rem,8dvh,3.5rem)]"
          style={{ ...serifItalic, color: "#f6efe2", letterSpacing: "-0.02em" }}
        >
          To think straight is the fount of knowledge.
        </p>
        <div data-reveal className="text-[10px] font-medium uppercase tracking-[0.4em] text-white/55">
          Recte sapere fons · University of Ibadan, 1948
        </div>
      </div>

      <div className="relative grid grid-cols-[1fr_auto] gap-10 border-t border-white/10 pt-6 max-sm:grid-cols-1">
        <div data-reveal className="flex flex-col gap-2">
          <div className="text-[9.5px] font-medium uppercase tracking-[0.32em] text-white/45">Sources</div>
          <ul className="flex flex-col gap-1.5">
            {SOURCES.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-white/60 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white"
                  style={serif}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav data-reveal aria-label="Footer" className="flex flex-col items-start gap-2 sm:items-end">
          <div className="text-[9.5px] font-medium uppercase tracking-[0.32em] text-white/45">{brand}</div>
          {links.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className="text-[11px] font-medium uppercase tracking-[0.32em] text-white/70 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
