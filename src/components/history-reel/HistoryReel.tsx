import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { CHAPTERS } from "./history.data";
import type { Chapter } from "./history.data";

/* ─── Style tokens ───────────────────────────────────────────────── */
const BG = "#0a0908";
const BONE = "#f6efe2";
const IVORY = "#f1e7d2";
const SERIF = '"Playfair Display", Georgia, serif';
const serif: CSSProperties = { fontFamily: SERIF };
const serifItalic: CSSProperties = { fontFamily: SERIF, fontStyle: "italic" };

/* ─── Layout (values in dvh; JS uses window.innerHeight, so never use vh) ─ */
const SLIDE_VH = 80;
const GAP_VH = 5;
const PITCH_VH = SLIDE_VH + GAP_VH;
const MASK_VH = 10;
const TOP_PAD_VH = (100 - SLIDE_VH) / 2;

/* ─── Input + motion ─────────────────────────────────────────────── */
const WHEEL_PER_EVENT_CAP = 200;
const WHEEL_PAUSE_MS = 100;
const DRAG_THRESHOLD_VH = 14;
const EASE = 0.11;
const FADE_THRESHOLD = 0.55;
const PARALLAX_FACTOR = 0.42;
const ENTRY_OFFSET_PX = 64;
const IMG_HEIGHT_RATIO = 1.2;

/* ─── Loop ───────────────────────────────────────────────────────── */
const N = CHAPTERS.length;
const LOOP_COPIES = 7;
const TOTAL_RENDERED = N * LOOP_COPIES;
const INITIAL_IDX = Math.floor(LOOP_COPIES / 2) * N;
const AUTO_START_IDX = INITIAL_IDX + 1;
const AUTO_END_IDX = INITIAL_IDX + 3 * N;
const AUTO_SCROLL_S = 3;
const AUTO_FADE_S = 1;

const CURSOR_SIZE = 104;
const IMG_BUCKET_PX = 50;

type Zone = "top" | "bottom" | null;
interface ImgDims {
  w: number;
  h: number;
}

const modN = (i: number): number => ((i % N) + N) % N;

function computeImgDims(): ImgDims {
  const w = Math.max(600, Math.round(window.innerWidth / IMG_BUCKET_PX) * IMG_BUCKET_PX);
  const h = Math.max(
    500,
    Math.round((window.innerHeight * IMG_HEIGHT_RATIO) / IMG_BUCKET_PX) * IMG_BUCKET_PX,
  );
  return { w, h };
}

function scrollToId(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

/* ═══════════════════════════════════════════════════════════════════ */

interface HistoryReelProps {
  className?: string;
}

export function HistoryReel({ className = "" }: HistoryReelProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorScrollRef = useRef<HTMLDivElement>(null);
  const cursorDragRef = useRef<HTMLDivElement>(null);
  const cursorUpRef = useRef<HTMLDivElement>(null);
  const cursorDownRef = useRef<HTMLDivElement>(null);
  const cursorZoneRef = useRef<Zone>(null);
  const cursorOnUiRef = useRef(false);
  const isMouseRef = useRef(false);

  const idxRef = useRef(AUTO_START_IDX);
  const prevIdxRef = useRef(AUTO_START_IDX);
  const yRef = useRef(0);
  const targetYRef = useRef(0);
  const wheelLastTime = useRef(0);
  const autoScrollingRef = useRef(true);
  const openRef = useRef(false);

  const blurFilterRef = useRef<SVGFEGaussianBlurElement | null>(null);
  const scanlinesRef = useRef<HTMLDivElement | null>(null);
  const lastBlurPRef = useRef(0);
  const lastBlurTsRef = useRef(0);

  const dragRef = useRef({ active: false, startClientY: 0, startTrackY: 0, delta: 0, pointerId: 0 });
  const onSectionRef = useRef(false);
  const downRef = useRef(false);
  const cursorPos = useRef({ x: 0, y: 0 });
  const cursorRender = useRef({ x: 0, y: 0, scale: 1, opacity: 0 });
  const cursorInitRef = useRef(false);
  const navigateToModRef = useRef<(target: number) => void>(() => undefined);

  const [autoScrolling, setAutoScrolling] = useState(true);
  const [activeIdx, setActiveIdx] = useState(modN(AUTO_START_IDX));
  const [openSlot, setOpenSlot] = useState<number | null>(null);
  const [panelSlot, setPanelSlot] = useState(0); // keeps content mounted during the close transition
  const [imgDims, setImgDims] = useState<ImgDims>({ w: 2400, h: 1800 });

  const open = openSlot !== null;

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const handleExplore = useCallback((slot: number) => {
    setPanelSlot(slot);
    setOpenSlot(slot);
  }, []);
  const closePanel = useCallback(() => setOpenSlot(null), []);

  /* Escape closes the panel */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenSlot(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /* Image size bucketing + preload so the entrance never paints empty frames */
  useEffect(() => {
    const update = () => {
      const next = computeImgDims();
      setImgDims((prev) => (prev.w === next.w && prev.h === next.h ? prev : next));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    CHAPTERS.forEach((c) => {
      const img = new Image();
      img.src = c.image(imgDims.w);
    });
  }, [imgDims.w]);

  /* ─── Main engine ─────────────────────────────────────────────── */
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const slideEls = slideRefs.current;
    const wraps = slideEls.map((el) => el?.querySelector<HTMLElement>("[data-slide-image]") ?? null);
    const contents = slideEls.map((el) => el?.querySelector<HTMLElement>("[data-slide-content]") ?? null);

    let viewportH = 0;
    let pitch = 0;
    let slideH = 0;
    let dragThresh = 0;
    let topPad = 0;

    const recomputeSizes = () => {
      viewportH = window.innerHeight;
      pitch = (viewportH * PITCH_VH) / 100;
      slideH = (viewportH * SLIDE_VH) / 100;
      dragThresh = (viewportH * DRAG_THRESHOLD_VH) / 100;
      topPad = (viewportH * TOP_PAD_VH) / 100;
      if (!autoScrollingRef.current) {
        targetYRef.current = topPad - idxRef.current * pitch;
        yRef.current = targetYRef.current;
      }
    };
    recomputeSizes();
    yRef.current = ((TOP_PAD_VH - AUTO_START_IDX * PITCH_VH) * window.innerHeight) / 100;
    targetYRef.current = yRef.current;

    /* Loop wrap: silently shift idx + y together so the visible track never changes */
    const maybeWrap = () => {
      while (idxRef.current < N) {
        idxRef.current += N;
        prevIdxRef.current += N;
        const shift = N * pitch;
        yRef.current -= shift;
        targetYRef.current -= shift;
        if (dragRef.current.active) dragRef.current.startTrackY -= shift;
      }
      while (idxRef.current >= (LOOP_COPIES - 1) * N) {
        idxRef.current -= N;
        prevIdxRef.current -= N;
        const shift = N * pitch;
        yRef.current += shift;
        targetYRef.current += shift;
        if (dragRef.current.active) dragRef.current.startTrackY += shift;
      }
    };

    const setIndex = (next: number) => {
      if (next === idxRef.current) return;
      prevIdxRef.current = idxRef.current;
      idxRef.current = next;
      targetYRef.current = topPad - next * pitch;
      setActiveIdx(modN(next));
      maybeWrap();
    };

    navigateToModRef.current = (targetMod: number) => {
      if (autoScrollingRef.current || openRef.current) return;
      let diff = targetMod - modN(idxRef.current);
      if (diff > N / 2) diff -= N;
      else if (diff < -N / 2) diff += N;
      if (diff !== 0) setIndex(idxRef.current + diff);
    };

    const zoneAt = (clientY: number): Zone => {
      const band = (window.innerHeight * MASK_VH) / 100;
      if (clientY < band) return "top";
      if (clientY > window.innerHeight - band) return "bottom";
      return null;
    };

    /* ─── Entrance: old-reel fast-forward ─────────────────────────── */
    const tweenObj = { p: 0 };

    const onScrollUpdate = () => {
      const p = tweenObj.p;
      const vhToPx = window.innerHeight / 100;
      const idxF = AUTO_START_IDX + (AUTO_END_IDX - AUTO_START_IDX) * p;

      yRef.current = (TOP_PAD_VH - idxF * PITCH_VH) * vhToPx;
      targetYRef.current = yRef.current;

      const pitchPx = PITCH_VH * vhToPx;
      for (let i = 0; i < wraps.length; i++) {
        const wrap = wraps[i];
        if (wrap) wrap.style.transform = `translate3d(0, ${(-((i - idxF) * pitchPx) / IMG_HEIGHT_RATIO).toFixed(2)}px, 0)`;
      }

      // Velocity-driven vertical blur + scanlines (loud at peak, gone at the landing)
      const now = performance.now();
      let norm = 1;
      if (lastBlurTsRef.current > 0) {
        const dt = Math.max(now - lastBlurTsRef.current, 1);
        const idxRange = AUTO_END_IDX - AUTO_START_IDX;
        const idxSpeed = (Math.abs(p - lastBlurPRef.current) * idxRange) / dt;
        const peakSpeed = (idxRange * 3) / (AUTO_SCROLL_S * 1000);
        norm = Math.min(idxSpeed / peakSpeed, 1);
      }
      lastBlurPRef.current = p;
      lastBlurTsRef.current = now;
      blurFilterRef.current?.setAttribute("stdDeviation", `0 ${(norm * 18).toFixed(2)}`);
      if (scanlinesRef.current) scanlinesRef.current.style.opacity = norm.toFixed(3);
    };

    let completedOnce = false;
    const tl = gsap.timeline({
      paused: true,
      onUpdate: onScrollUpdate,
      onComplete: () => {
        if (completedOnce) return;
        completedOnce = true;
        blurFilterRef.current?.setAttribute("stdDeviation", "0 0");
        autoScrollingRef.current = false;
        setAutoScrolling(false);
        idxRef.current = AUTO_END_IDX;
        prevIdxRef.current = AUTO_END_IDX;
        targetYRef.current = topPad - AUTO_END_IDX * pitch;
        yRef.current = targetYRef.current;
        setActiveIdx(modN(AUTO_END_IDX));
        maybeWrap();

        const landing = slideRefs.current[idxRef.current];
        const reveals = landing?.querySelectorAll<HTMLElement>("[data-reveal]");
        if (reveals && reveals.length) {
          gsap.fromTo(
            reveals,
            { autoAlpha: 0, y: 32, filter: "blur(10px)" },
            { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.0, ease: "power4.out", stagger: 0.07 },
          );
        }
      },
    });
    tl.to(
      slideEls.filter((el): el is HTMLDivElement => el !== null),
      { autoAlpha: 1, duration: AUTO_FADE_S, ease: "power2.out" },
      0,
    );
    tl.to(tweenObj, { p: 1, duration: AUTO_SCROLL_S, ease: "power3.out" }, 0);

    // The reel sits below the hero, so the entrance waits until it is actually on screen.
    let io: IntersectionObserver | null = null;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      tl.progress(1);
    } else {
      io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          tl.play();
          io?.disconnect();
        },
        { threshold: 0.6 },
      );
      io.observe(section);
    }

    /* ─── Per-frame loop ───────────────────────────────────────────── */
    let raf = 0;
    const tick = () => {
      const now = performance.now();
      const dragging = dragRef.current.active;
      const wheelActive = now - wheelLastTime.current < WHEEL_PAUSE_MS;
      const auto = autoScrollingRef.current;

      if (!dragging && !wheelActive && !auto) {
        const dy = targetYRef.current - yRef.current;
        if (Math.abs(dy) < 0.5) yRef.current = targetYRef.current;
        else yRef.current += dy * EASE;
      }
      track.style.transform = `translate3d(0, ${yRef.current}px, 0)`;

      const y = yRef.current;
      const viewCenter = viewportH / 2;

      for (let i = 0; i < TOTAL_RENDERED; i++) {
        const ref = slideEls[i];
        const content = contents[i];
        if (!ref || !content) continue;

        const dy = i * pitch + y + slideH / 2 - viewCenter;
        const dn = Math.abs(dy) / slideH;

        if (dn > 2 || auto) {
          if (content.style.opacity !== "0") {
            content.style.opacity = "0";
            content.style.filter = "blur(16px)";
          }
          continue;
        }

        const wrap = wraps[i];
        if (wrap) wrap.style.transform = `translate3d(0, ${(-dy / IMG_HEIGHT_RATIO).toFixed(2)}px, 0)`;

        const isActive = i === idxRef.current;
        const isLeaving = i === prevIdxRef.current && prevIdxRef.current !== idxRef.current;
        let opacity = 0;
        let blur = 16;
        let cy = 0;

        if (isActive) {
          const t = Math.max(0, Math.min(1, 1 - dn / FADE_THRESHOLD));
          opacity = t * t * (3 - 2 * t); // smoothstep
          blur = (1 - opacity) * 14;
          cy = (1 - opacity) * ENTRY_OFFSET_PX * Math.sign(dy || 1);
        } else if (isLeaving) {
          const fade = Math.max(0, 1 - Math.max(0, dn - 0.6) / 0.6);
          opacity = fade;
          blur = (1 - fade) * 6;
          cy = -dy * PARALLAX_FACTOR; // outgoing content parallax-leads
        }

        content.style.transform = `translate3d(0, ${cy.toFixed(2)}px, 0)`;
        content.style.opacity = opacity.toFixed(3);
        content.style.filter = `blur(${blur.toFixed(2)}px)`;
      }

      /* Cursor */
      const cur = cursorRef.current;
      if (cur) {
        const { x: px, y: py } = cursorPos.current;
        const cr = cursorRender.current;
        if (!cursorInitRef.current && (px !== 0 || py !== 0)) {
          cr.x = px;
          cr.y = py;
          cursorInitRef.current = true;
        }
        cr.x += (px - cr.x) * 0.22;
        cr.y += (py - cr.y) * 0.22;
        const targetOpacity = onSectionRef.current && cursorInitRef.current && isMouseRef.current ? 1 : 0;
        cr.opacity += (targetOpacity - cr.opacity) * 0.18;
        cr.scale += ((downRef.current ? 1.18 : 1) - cr.scale) * 0.22;
        cur.style.transform = `translate3d(${cr.x}px, ${cr.y}px, 0) translate(-50%, -50%) scale(${cr.scale.toFixed(3)})`;
        cur.style.opacity = cr.opacity.toFixed(3);

        const zone = cursorZoneRef.current;
        const isDown = downRef.current;
        const onUi = cursorOnUiRef.current;
        if (cursorScrollRef.current) cursorScrollRef.current.style.opacity = zone === null && !isDown && !onUi ? "1" : "0";
        if (cursorDragRef.current) cursorDragRef.current.style.opacity = isDown && zone === null ? "1" : "0";
        if (cursorUpRef.current) cursorUpRef.current.style.opacity = zone === "top" || (isDown && zone === null) ? "1" : "0";
        if (cursorDownRef.current) cursorDownRef.current.style.opacity = zone === "bottom" || (isDown && zone === null) ? "1" : "0";
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    /* ─── Input ────────────────────────────────────────────────────── */
    const onWheel = (e: WheelEvent) => {
      if (!onSectionRef.current) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("aside")) return; // the details panel scrolls itself
      e.preventDefault();
      if (autoScrollingRef.current || openRef.current) return;

      const delta = Math.max(-WHEEL_PER_EVENT_CAP, Math.min(WHEEL_PER_EVENT_CAP, e.deltaY));
      yRef.current -= delta;
      wheelLastTime.current = performance.now();

      // Live-commit: advance the index the moment y crosses half a pitch
      const nearest = Math.round((topPad - yRef.current) / pitch);
      if (nearest !== idxRef.current) setIndex(nearest);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!onSectionRef.current && e.pointerType === "mouse") return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (autoScrollingRef.current) return;
      if ((e.target as HTMLElement | null)?.closest("[data-no-drag]")) return;
      cursorZoneRef.current = zoneAt(e.clientY);
      wheelLastTime.current = 0;
      dragRef.current = {
        active: true,
        startClientY: e.clientY,
        startTrackY: yRef.current,
        delta: 0,
        pointerId: e.pointerId,
      };
      downRef.current = true;
      try {
        section.setPointerCapture(e.pointerId);
      } catch {
        /* element detached */
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      isMouseRef.current = e.pointerType === "mouse";
      cursorPos.current.x = e.clientX;
      cursorPos.current.y = e.clientY;
      cursorZoneRef.current = zoneAt(e.clientY);
      cursorOnUiRef.current = !!(e.target as HTMLElement | null)?.closest("[data-no-drag]");

      if (!dragRef.current.active) return;
      const delta = e.clientY - dragRef.current.startClientY;
      dragRef.current.delta = delta;
      yRef.current = dragRef.current.startTrackY + delta;
    };

    const endDrag = (committed: boolean) => {
      const { delta } = dragRef.current;
      const zone = cursorZoneRef.current;
      dragRef.current.active = false;
      downRef.current = false;
      if (!committed) return;

      // Tap in the top/bottom band: navigate one slide and dismiss any open panel
      if (zone && Math.abs(delta) < 8) {
        const wasOpen = openRef.current;
        setOpenSlot(null);
        if (!wasOpen) setIndex(idxRef.current + (zone === "top" ? -1 : 1));
        else targetYRef.current = topPad - idxRef.current * pitch;
        return;
      }
      if (Math.abs(delta) > dragThresh && !openRef.current) {
        setIndex(idxRef.current + (delta < 0 ? 1 : -1));
      } else {
        targetYRef.current = topPad - idxRef.current * pitch; // spring back
      }
    };

    const onPointerUp = () => {
      if (!dragRef.current.active) return;
      try {
        section.releasePointerCapture(dragRef.current.pointerId);
      } catch {
        /* already released */
      }
      endDrag(true);
    };
    const onPointerCancel = () => {
      if (!dragRef.current.active) return;
      dragRef.current.delta = 0;
      yRef.current = dragRef.current.startTrackY;
      endDrag(false);
    };
    const onEnter = () => {
      onSectionRef.current = true;
    };
    const onLeave = () => {
      onSectionRef.current = false;
      if (dragRef.current.active) endDrag(true);
    };
    const onResize = () => recomputeSizes();
    const onKey = (e: KeyboardEvent) => {
      if (!onSectionRef.current || autoScrollingRef.current || openRef.current) return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        setIndex(idxRef.current + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        setIndex(idxRef.current - 1);
      }
    };

    section.addEventListener("wheel", onWheel, { passive: false });
    section.addEventListener("pointerdown", onPointerDown);
    section.addEventListener("pointermove", onPointerMove);
    section.addEventListener("pointerup", onPointerUp);
    section.addEventListener("pointercancel", onPointerCancel);
    section.addEventListener("pointerenter", onEnter);
    section.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      tl.kill();
      section.removeEventListener("wheel", onWheel);
      section.removeEventListener("pointerdown", onPointerDown);
      section.removeEventListener("pointermove", onPointerMove);
      section.removeEventListener("pointerup", onPointerUp);
      section.removeEventListener("pointercancel", onPointerCancel);
      section.removeEventListener("pointerenter", onEnter);
      section.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const panelChapter = CHAPTERS[modN(panelSlot)];

  return (
    <section
      id="history-reel"
      ref={sectionRef}
      className={`relative h-[100dvh] w-full select-none overflow-hidden [--cinema-pad-x:7.5dvh] max-sm:[--cinema-pad-x:2dvh] ${className}`}
      style={{ background: BG, cursor: "none" }}
      aria-roledescription="carousel"
      aria-label="History of the University of Ibadan in six chapters"
    >
      {/* Motion-blur filter (vertical only) */}
      <svg aria-hidden focusable={false} className="pointer-events-none absolute h-0 w-0">
        <defs>
          <filter id="history-motion-blur" x="-5%" y="-25%" width="110%" height="150%">
            <feGaussianBlur ref={blurFilterRef} in="SourceGraphic" stdDeviation="0 0" />
          </filter>
        </defs>
      </svg>

      {/* Track — touch-action none lives here only, so the panel keeps pan-y */}
      <div
        ref={trackRef}
        className="absolute inset-x-0 top-0 px-[var(--cinema-pad-x)] will-change-transform"
        style={{
          touchAction: "none",
          transform: `translate3d(0, ${TOP_PAD_VH - AUTO_START_IDX * PITCH_VH}dvh, 0)`,
          filter: autoScrolling ? "url(#history-motion-blur)" : undefined,
        }}
      >
        {Array.from({ length: TOTAL_RENDERED }).map((_, i) => (
          <SlideFrame
            key={i}
            chapter={CHAPTERS[i % N]}
            chapterIndex={i % N}
            isFirst={i === AUTO_END_IDX}
            imgDims={imgDims}
            autoScrolling={autoScrolling}
            isOpen={openSlot === i}
            onExplore={() => handleExplore(i)}
            assignRef={(el) => {
              slideRefs.current[i] = el;
            }}
          />
        ))}
      </div>

      {/* Edge masks */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-30"
        style={{ height: `${MASK_VH}dvh`, background: `linear-gradient(180deg, ${BG} 0%, rgba(10,9,8,0) 100%)` }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30"
        style={{ height: `${MASK_VH}dvh`, background: `linear-gradient(0deg, ${BG} 0%, rgba(10,9,8,0) 100%)` }}
      />

      {autoScrolling && (
        <div
          ref={scanlinesRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[25]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 3px)",
            mixBlendMode: "screen",
          }}
        />
      )}

      {/* The reel loops forever and captures the wheel, so give people a way out */}
      <button
        type="button"
        data-no-drag
        onClick={() => scrollToId("history-hero")}
        className={`absolute left-[var(--cinema-pad-x)] top-[3dvh] z-40 cursor-pointer text-[10px] font-medium uppercase tracking-[0.32em] text-white/55 transition-all duration-300 hover:text-white ${open ? "pointer-events-none opacity-0" : "opacity-100"}`}
      >
        ↑ Prologue
      </button>
      <button
        type="button"
        data-no-drag
        onClick={() => scrollToId("history-footer")}
        className={`absolute bottom-[3dvh] left-[var(--cinema-pad-x)] z-40 cursor-pointer text-[10px] font-medium uppercase tracking-[0.32em] text-white/55 transition-all duration-300 hover:text-white ${open ? "pointer-events-none opacity-0" : "opacity-100"}`}
      >
        Epilogue ↓
      </button>

      <ReelIndicator
        activeIdx={activeIdx}
        total={N}
        hidden={open}
        onPipClick={(i) => navigateToModRef.current(i)}
      />

      <DetailsPanel open={open} chapter={panelChapter} imgDims={imgDims} onClose={closePanel} />

      {/* Custom cursor */}
      <div
        ref={cursorRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-50"
        style={{ width: CURSOR_SIZE, height: CURSOR_SIZE, opacity: 0, willChange: "transform, opacity" }}
      >
        <div className="relative h-full w-full">
          <div className="absolute inset-0 rounded-full border border-white/45" />
          <div
            ref={cursorScrollRef}
            className="absolute inset-0 flex items-center justify-center"
            style={{ transition: "opacity 180ms ease" }}
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.32em] text-white">Scroll</span>
          </div>
          <div
            ref={cursorDragRef}
            className="absolute inset-0 flex items-center justify-center"
            style={{ opacity: 0, transition: "opacity 160ms ease" }}
          >
            <GrabHand />
          </div>
          <div
            ref={cursorUpRef}
            className="absolute"
            style={{ bottom: "calc(100% + 12px)", left: "50%", transform: "translateX(-50%)", opacity: 0, transition: "opacity 160ms ease" }}
          >
            <ChevronGlyph />
          </div>
          <div
            ref={cursorDownRef}
            className="absolute"
            style={{ top: "calc(100% + 12px)", left: "50%", transform: "translateX(-50%) rotate(180deg)", opacity: 0, transition: "opacity 160ms ease" }}
          >
            <ChevronGlyph />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══ Slide frame ═══════════════════════════════════════════════════ */

interface SlideFrameProps {
  chapter: Chapter;
  chapterIndex: number;
  isFirst: boolean;
  imgDims: ImgDims;
  autoScrolling: boolean;
  isOpen: boolean;
  onExplore: () => void;
  assignRef: (el: HTMLDivElement | null) => void;
}

function SlideFrame({ chapter, chapterIndex, isFirst, imgDims, autoScrolling, isOpen, onExplore, assignRef }: SlideFrameProps) {
  return (
    // Outer: layout box + perspective. Inner: rounded clip + door tilt (never share a transform).
    <div
      ref={assignRef}
      className="relative w-full"
      style={{
        height: `${SLIDE_VH}dvh`,
        marginBottom: `${GAP_VH}dvh`,
        perspective: "2000px",
        opacity: autoScrolling ? 0 : undefined,
      }}
    >
      <div
        className="relative h-full w-full overflow-hidden rounded-[48px] max-sm:rounded-[28px]"
        style={{
          transformOrigin: "0% 50%",
          transformStyle: "preserve-3d",
          transform: isOpen ? "rotateY(15deg)" : undefined,
          transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 700ms cubic-bezier(0.22, 1, 0.36, 1)",
          boxShadow: isOpen ? "0 30px 80px -20px rgba(0,0,0,0.55), 0 8px 30px -10px rgba(0,0,0,0.35)" : undefined,
        }}
      >
        {/* Image wrapper: 100vw × 120dvh, translated at (R-1)/R of slide speed */}
        <div
          data-slide-image
          className="absolute left-1/2 top-1/2 will-change-transform"
          style={{
            width: "100vw",
            height: `${IMG_HEIGHT_RATIO * 100}dvh`,
            marginTop: `${-IMG_HEIGHT_RATIO * 50}dvh`,
            marginLeft: "-50vw",
          }}
        >
          {/* Typographic fallback, visible until the photo exists / loads */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "radial-gradient(70% 60% at 50% 50%, #2a2118 0%, #12100e 100%)" }}
          >
            <span style={{ ...serifItalic, fontSize: "40dvh", color: "rgba(246,239,226,0.05)", lineHeight: 1 }}>
              {chapter.year}
            </span>
          </div>
          <img
            src={chapter.image(imgDims.w)}
            alt=""
            loading="eager"
            decoding="async"
            fetchPriority={isFirst ? "high" : "auto"}
            draggable={false}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            className="absolute inset-0 block h-full w-full object-cover"
            style={{ filter: "sepia(0.18) contrast(1.04) saturate(0.9)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.06) 22%, rgba(0,0,0,0.04) 70%, rgba(0,0,0,0.55) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(80% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.45) 100%)" }}
          />
        </div>

        <div
          data-slide-content
          className="absolute inset-0 will-change-[opacity,filter,transform]"
          style={{ opacity: 0, filter: "blur(16px)" }}
        >
          <SlideContent chapter={chapter} chapterIndex={chapterIndex} onExplore={onExplore} />
        </div>
      </div>
    </div>
  );
}

/* ═══ Slide content ═════════════════════════════════════════════════ */

interface SlideContentProps {
  chapter: Chapter;
  chapterIndex: number;
  onExplore: () => void;
}

function SlideContent({ chapter, chapterIndex, onExplore }: SlideContentProps) {
  return (
    <div className="relative h-full w-full text-white">
      {/* Top-left: year, chapter counter, eyebrow */}
      <div
        data-reveal
        className="absolute left-[6dvh] top-[5.5dvh] flex flex-col gap-3 max-sm:left-[3dvh] max-sm:top-[3dvh] max-sm:gap-2"
      >
        <div className="leading-none text-white/90" style={{ ...serifItalic, fontSize: "clamp(1.2rem, 2.2dvh, 2.4rem)" }}>
          {chapter.year}
        </div>
        <div className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/65 max-sm:text-[8.5px] max-sm:tracking-[0.24em]">
          {chapter.eyebrow.split(" ").map((word, i, arr) => (
            <span key={i}>
              {word}
              {i === Math.floor(arr.length / 2) - 1 ? <br /> : i < arr.length - 1 ? " " : ""}
            </span>
          ))}
        </div>
        <div className="mt-2 text-[10px] font-medium uppercase tracking-[0.4em] text-white/45 max-sm:hidden">
          Chapter {String(chapterIndex + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
        </div>
      </div>

      {/* Centre-left: category, title, figure */}
      <div
        data-reveal
        className="absolute left-[6dvh] flex flex-col gap-5 max-sm:left-[3dvh] max-sm:gap-3"
        style={{ bottom: "9dvh" }}
      >
        <div className="text-[10px] font-medium uppercase tracking-[0.4em] text-white/55 max-sm:text-[8.5px] max-sm:tracking-[0.28em]">
          {chapter.category}
        </div>
        <h2
          className="font-semibold uppercase text-[clamp(2.2rem,8.5dvh,9rem)] max-sm:text-[clamp(1.5rem,5.5dvh,2.4rem)]"
          style={{ ...serif, lineHeight: 0.92, letterSpacing: "-0.02em", color: BONE }}
        >
          {chapter.titleLines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h2>
        <div className="flex items-baseline gap-3 text-[10px] font-medium uppercase tracking-[0.32em] text-white/70 max-sm:gap-2 max-sm:text-[8.5px] max-sm:tracking-[0.22em]">
          <span className="text-white/45">{chapter.figure.label}</span>
          <span className="text-white/90">{chapter.figure.value}</span>
        </div>
      </div>

      {/* Right: milestone stack (desktop only) — outer centres, inner animates */}
      <div className="absolute right-[6dvh] top-1/2 flex flex-col max-sm:hidden" style={{ transform: "translateY(-50%)" }}>
        <div data-reveal className="flex flex-col gap-7">
          {chapter.marks.map((m) => (
            <div key={m.label} className="flex flex-col items-end gap-1.5 text-right">
              <div className="h-px w-8" style={{ background: IVORY, opacity: 0.7 }} />
              <div className="text-[9.5px] font-medium uppercase tracking-[0.32em] text-white/55">{m.label}</div>
              <div className="leading-tight text-white/95" style={{ ...serifItalic, fontSize: 16, maxWidth: "18ch" }}>
                &ldquo;{m.quote}&rdquo;
              </div>
            </div>
          ))}
        </div>
      </div>

      {chapter.credit && (
        <div
          data-reveal
          className="absolute bottom-[3dvh] left-[6dvh] max-w-[40%] text-[8.5px] uppercase tracking-[0.22em] text-white/35 max-sm:left-[3dvh] max-sm:max-w-[55%]"
        >
          {chapter.credit}
        </div>
      )}

      {/* Explore */}
      <button
        type="button"
        data-no-drag
        data-reveal
        onClick={(e) => {
          e.stopPropagation();
          onExplore();
        }}
        className="group absolute bottom-[5dvh] right-[6dvh] flex cursor-pointer items-center gap-4 overflow-hidden rounded-full border border-white/35 bg-white/[0.04] px-8 py-4 text-[12px] font-medium uppercase tracking-[0.32em] text-white/95 backdrop-blur-md transition-[background-color,border-color,transform,box-shadow] duration-300 ease-out hover:scale-[1.04] hover:border-white/85 hover:bg-white/[0.14] hover:shadow-[0_10px_30px_rgba(0,0,0,0.45)] max-sm:bottom-[3dvh] max-sm:right-[3dvh] max-sm:gap-3 max-sm:px-5 max-sm:py-3 max-sm:text-[10.5px] max-sm:tracking-[0.24em]"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full rounded-full bg-gradient-to-r from-white/[0.02] via-white/10 to-white/[0.02] transition-transform duration-500 ease-out group-hover:translate-x-0"
        />
        <span className="relative">Explore</span>
        <span aria-hidden className="relative text-[15px] leading-none transition-transform duration-300 ease-out group-hover:translate-x-1.5">
          →
        </span>
      </button>
    </div>
  );
}

/* ═══ Indicator ═════════════════════════════════════════════════════ */

interface ReelIndicatorProps {
  activeIdx: number;
  total: number;
  hidden: boolean;
  onPipClick: (i: number) => void;
}

function ReelIndicator({ activeIdx, total, hidden, onPipClick }: ReelIndicatorProps) {
  return (
    <div
      aria-hidden={hidden}
      className={`pointer-events-none absolute right-[3.5dvh] top-1/2 z-40 flex flex-col items-end gap-3 transition-opacity duration-[400ms] ease-out ${hidden ? "opacity-0" : "opacity-100"}`}
      style={{ transform: "translateY(-50%)" }}
    >
      <div className="text-[12px] text-white/55" style={serifItalic}>
        {String(activeIdx + 1).padStart(2, "0")}
      </div>
      <div data-no-drag className={`flex flex-col items-center ${hidden ? "pointer-events-none" : "pointer-events-auto"}`}>
        {Array.from({ length: total }).map((_, i) => {
          const active = i === activeIdx;
          return (
            <button
              key={i}
              type="button"
              aria-label={`Go to chapter ${i + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                onPipClick(i);
              }}
              className="flex h-5 w-5 cursor-pointer items-center justify-center"
            >
              <span
                className="rounded-full"
                style={{
                  width: active ? 6 : 4,
                  height: active ? 6 : 4,
                  background: active ? "rgba(241,231,210,0.95)" : "rgba(255,255,255,0.22)",
                  transition: "all 320ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            </button>
          );
        })}
      </div>
      <div className="text-[12px] text-white/35" style={serifItalic}>
        {String(total).padStart(2, "0")}
      </div>
    </div>
  );
}

/* ═══ Details panel ═════════════════════════════════════════════════ */

interface DetailsPanelProps {
  open: boolean;
  chapter: Chapter;
  imgDims: ImgDims;
  onClose: () => void;
}

function DetailsPanel({ open, chapter, imgDims, onClose }: DetailsPanelProps) {
  return (
    <>
      <div
        data-no-drag
        aria-hidden={!open}
        onClick={onClose}
        className={`absolute z-40 overflow-hidden rounded-[48px] max-sm:rounded-[28px] ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        style={{
          top: `${TOP_PAD_VH}dvh`,
          height: `${SLIDE_VH}dvh`,
          left: "var(--cinema-pad-x)",
          right: "var(--cinema-pad-x)",
          backgroundColor: open ? "rgba(10,9,8,0.35)" : "rgba(10,9,8,0)",
          backdropFilter: open ? "blur(14px) saturate(120%)" : "blur(0px)",
          WebkitBackdropFilter: open ? "blur(14px) saturate(120%)" : "blur(0px)",
          transition:
            "background-color 600ms cubic-bezier(0.22, 1, 0.36, 1), backdrop-filter 600ms cubic-bezier(0.22, 1, 0.36, 1), -webkit-backdrop-filter 600ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />

      <aside
        data-no-drag
        aria-hidden={!open}
        aria-label={`${chapter.titleLines.join(" ")} details`}
        className="absolute z-50 flex w-[min(640px,52%)] flex-col overflow-hidden rounded-[48px] text-white max-sm:w-[calc(100vw-2*var(--cinema-pad-x))] max-sm:rounded-[28px]"
        style={{
          top: `${TOP_PAD_VH}dvh`,
          height: `${SLIDE_VH}dvh`,
          right: "var(--cinema-pad-x)",
          transform: open ? "translateX(0)" : "translateX(calc(100% + var(--cinema-pad-x) + 2dvh))",
          transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
          background: "linear-gradient(180deg, rgba(18,16,14,0.85) 0%, rgba(10,9,8,0.92) 100%)",
          backdropFilter: "blur(20px) saturate(140%)",
          WebkitBackdropFilter: "blur(20px) saturate(140%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: open ? "-30px 0 80px -20px rgba(0,0,0,0.6)" : "none",
          willChange: "transform",
        }}
      >
        <div className="h-full w-full overflow-y-auto" style={{ overscrollBehavior: "contain", touchAction: "pan-y" }}>
          <div className="relative w-full shrink-0 overflow-hidden" style={{ height: "35dvh", background: "#1a1510" }}>
            <img
              src={chapter.image(Math.min(imgDims.w, 1600))}
              alt=""
              draggable={false}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ filter: "sepia(0.18) contrast(1.04) saturate(0.9)" }}
            />
            <div
              className="absolute inset-x-0 bottom-0 h-1/2"
              style={{ background: "linear-gradient(180deg, rgba(10,9,8,0) 0%, rgba(10,9,8,0.85) 80%, rgba(10,9,8,1) 100%)" }}
            />
          </div>

          <div className="px-[3.5dvh] pb-[4dvh] pt-[1dvh]">
            <div className="text-[10px] font-medium uppercase tracking-[0.36em] text-white/55">{chapter.eyebrow}</div>
            <h2
              className="mt-3 font-semibold uppercase"
              style={{ ...serif, fontSize: "clamp(2.2rem, 4.6dvh, 4rem)", lineHeight: 0.95, letterSpacing: "-0.015em", color: BONE }}
            >
              {chapter.titleLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h2>

            <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[10.5px] font-medium uppercase tracking-[0.32em] text-white/75">
              <span>
                <span className="text-white/45">{chapter.figure.label}</span> <span className="text-white/95">{chapter.figure.value}</span>
              </span>
              <span className="text-white/30">·</span>
              <span className="text-white/95">{chapter.year}</span>
              <span className="text-white/30">·</span>
              <span>{chapter.category}</span>
            </div>

            <div className="my-6 h-px w-full bg-white/10" />
            <p className="text-[15.5px] leading-[1.65] text-white/85" style={serifItalic}>
              {chapter.description}
            </p>
            <div className="my-6 h-px w-full bg-white/10" />

            <div className="grid grid-cols-3 gap-x-5 gap-y-5">
              {chapter.facts.map((f) => (
                <div key={f.label} className="flex flex-col gap-1">
                  <div className="text-[9.5px] font-medium uppercase tracking-[0.32em] text-white/45">{f.label}</div>
                  <div className="text-[17px] leading-tight text-white/95" style={serif}>
                    {f.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="my-6 h-px w-full bg-white/10" />
            <div className="flex flex-col gap-3">
              {chapter.marks.map((m) => (
                <div key={m.label} className="flex items-baseline gap-3">
                  <div className="w-5 shrink-0 self-center">
                    <div className="h-px w-full" style={{ background: IVORY, opacity: 0.7 }} />
                  </div>
                  <div className="shrink-0 text-[10px] font-medium uppercase tracking-[0.32em] text-white/55">{m.label}</div>
                  <div className="flex-1 text-[13px] leading-tight text-white/90" style={serifItalic}>
                    &ldquo;{m.quote}&rdquo;
                  </div>
                </div>
              ))}
            </div>

            {chapter.credit && (
              <div className="mt-6 text-[9px] uppercase tracking-[0.22em] text-white/30">Image · {chapter.credit}</div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          tabIndex={open ? 0 : -1}
          aria-label="Close details"
          className="absolute right-[3dvh] top-[3dvh] z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-black/40 text-white/85 backdrop-blur-md transition-colors hover:bg-black/60"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </aside>
    </>
  );
}

/* ═══ Cursor glyphs ═════════════════════════════════════════════════ */

function GrabHand() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 11V7.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M10 11V6.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M13 11V7a1.5 1.5 0 0 1 3 0v6" />
      <path d="M16 9.5a1.5 1.5 0 0 1 3 0V15c0 3-2.2 6-6 6-3.4 0-5.5-1.8-6.5-3.5l-2.7-4.7a1.4 1.4 0 0 1 2.4-1.4L8 13" />
    </svg>
  );
}

function ChevronGlyph() {
  return (
    <svg width="22" height="14" viewBox="0 0 22 14" fill="none" aria-hidden>
      <path d="M2 12 C 7 4, 15 4, 20 12" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
