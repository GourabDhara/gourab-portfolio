import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  ArrowUpRight,
  Dice5,
  MousePointer2,
  Sparkles,
  Code2,
  RotateCw,
} from "lucide-react";

import "./playground-tailwind.css";

/* =========================================================================
   TOKENS
   ========================================================================= */

// bg/dark bg intentionally match the global --page-bg-light /
// --page-bg-dark tokens defined in index.css (see the consistency pass
// comment there) so Playground's base page background is identical to
// every other section's -- Work, Creative Lab, About, and Contact all
// resolve to the same two values, just via CSS custom properties
// instead of this JS token object (Playground is the one section built
// with inline styles rather than a themed CSS root, so it keeps its
// own copies of the same two hex values here instead).
const COLORS = {
  light: {
    bg: "#FBF1E2",
    bgSoft: "#F5EEE4",
    surface: "#FFFFFF",
    text: "#17130F",
    textMuted: "#726A61",
    textFaint: "#AFA69A",
    border: "rgba(23,19,15,0.09)",
    borderStrong: "rgba(23,19,15,0.18)",
    orange: "#FF5A1F",
    orangeSoft: "rgba(255,90,31,0.12)",
    purple: "#7A3DFF",
    purpleSoft: "rgba(122,61,255,0.12)",
    shadow: "0 16px 40px -20px rgba(23,19,15,0.25)",
    shadowStrong: "0 14px 30px -10px rgba(23,19,15,0.35)",
    glow: 0.14,
  },
  dark: {
    bg: "#0A0A0C",
    bgSoft: "#111113",
    surface: "#151417",
    text: "#F5EFE6",
    textMuted: "#9C948A",
    textFaint: "#544E48",
    border: "rgba(255,255,255,0.08)",
    borderStrong: "rgba(255,255,255,0.18)",
    orange: "#FF7A3D",
    orangeSoft: "rgba(255,122,61,0.18)",
    purple: "#A47CFF",
    purpleSoft: "rgba(164,124,255,0.2)",
    shadow: "0 16px 40px -18px rgba(0,0,0,0.7)",
    shadowStrong: "0 14px 32px -8px rgba(0,0,0,0.8)",
    glow: 0.3,
  },
};

const FONT_DISPLAY = "'Sora', ui-sans-serif, system-ui, sans-serif";
const FONT_BODY = "'Inter', ui-sans-serif, system-ui, sans-serif";
const FONT_MONO = "'DM Mono', ui-monospace, SFMono-Regular, monospace";

function sessionMood(n) {
  if (n === 0) return "CALM";
  if (n < 3) return "CURIOUS";
  if (n < 6) return "PLAYFUL";
  if (n < 9) return "INSPIRED";
  return "RESTLESS";
}

const CODE_LINE_SETS = [
  ["mode = ", "creative", "rules = ", "break"],
  ["cursor = ", "curious", "loop = ", "infinite"],
  ["input = ", "curiosity", "noise = ", "welcome"],
];

// Master "Surprise Me" outcomes.
const SURPRISES = [
  { type: "challenge", label: "Creative Challenge", text: "Redesign something you used today." },
  { type: "principle", label: "Design Principle", text: "Make the important thing impossible to ignore." },
  { type: "principle", label: "Design Principle", text: "Delete before you decorate." },
  { type: "fact", label: "Strange Fact", text: "The first computer mouse was carved from wood in 1964." },
  { type: "fact", label: "Strange Fact", text: "The word ‘pixel’ is a blend of ‘picture’ and ‘element’." },
  { type: "palette", label: "Color Experiment" },
  { type: "type", label: "Type Experiment" },
  { type: "shape", label: "Shape Experiment" },
  { type: "chaos", label: "Chaos Mode", text: "For a moment, the rules bend." },
];

/* =========================================================================
   UTIL
   ========================================================================= */

function seeded(seed, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
    out.push(x - Math.floor(x));
  }
  return out;
}

function playBlip(freq = 520, dur = 0.2) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.02);
    osc.onended = () => ctx.close();
  } catch (e) {
    /* audio unavailable */
  }
}

/* =========================================================================
   HOOKS
   ========================================================================= */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const h = (e) => setReduced(e.matches);
    mq.addEventListener ? mq.addEventListener("change", h) : mq.addListener(h);
    return () => (mq.removeEventListener ? mq.removeEventListener("change", h) : mq.removeListener(h));
  }, []);
  return reduced;
}

function useIsTouch() {
  const [touch, setTouch] = useState(false);
  useEffect(() => setTouch(window.matchMedia("(pointer: coarse)").matches), []);
  return touch;
}

/* =========================================================================
   WHOLE-SITE BARREL ROLL EASTER EGG
   Triggered from the existing "Surprise Me" button (see triggerSurprise
   wiring near the bottom of the main component). Rotates the ENTIRE
   rendered page -- not just Playground -- by toggling a class directly
   on #root (see the injected keyframes in the main component's <style>
   block: br-rolling / br-flipped), so every section, the sticky Hero,
   and the fixed PrimaryNav/MobileNav all rotate together as one visual
   surface with a single transform, rather than each section (or worse,
   six separate sections) animating independently.

   Why #root and not <body>: #root is body's only child and already the
   shared ancestor of every fixed-position element (PrimaryNav,
   MobileNav, Hero, LoadingScreen) as well as every section, so rotating
   it reads identically to rotating body. But <html>/<body> themselves
   are never touched, which means the real document scroll is never
   frozen or reset by this effect -- the page stays a live, scrollable
   document underneath the rotation the whole time, including during
   the 5s upside-down hold.

   State machine (exactly the shape asked for):
     idle -> barrelRoll -> firstPopup -> secondSurprise -> upsideDown -> returning -> idle
   A ref-tracked stage (not just React state) gates every entry point so
   a rapid double-click can't start a second animation, stack a second
   rotation on top of the first, or leave two timers racing each other. */
function useBarrelRollEasterEgg(reduced) {
  const [stage, setStage] = useState("idle");
  const [showFirstPopup, setShowFirstPopup] = useState(false);
  const stageRef = useRef("idle");
  const timers = useRef([]);

  const clearAllTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };
  const after = (ms, fn) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  };

  const rootEl = () => document.getElementById("root");

  // Sets transform-origin to the center of the user's CURRENT viewport,
  // expressed as an absolute pixel offset inside #root, rather than the
  // default 50% 50% (the center of the ENTIRE document). #root is as
  // tall as the whole scrollable page -- easily 10,000+px -- so "50%
  // 50%" pivots every rotation around the vertical midpoint of the
  // full document, not around whatever the user is actually looking
  // at. Two visible symptoms came from that single bug: (1) on the
  // 360deg barrel roll, mid-spin the rotation swings the user's actual
  // scroll position far outside the viewport (the further from the
  // document's true center they'd scrolled, the further it swings),
  // reading as a blank/empty flash rather than a visible rotation --
  // worst on mobile where the document is tallest relative to the
  // screen; (2) on the 180deg upside-down hold, rotating around the
  // wrong point shifts the visible content by up to 2x the distance
  // between the viewport's center and the document's center, so it
  // reads as a different, reflowed page rather than the same page
  // simply flipped. Recalculated fresh on every trigger (not cached)
  // so it's always correct for wherever the user currently is.
  const setViewportOrigin = (el) => {
    if (!el) return;
    const originY = window.scrollY + window.innerHeight / 2;
    el.style.transformOrigin = `50% ${originY}px`;
  };

  useEffect(
    () => () => {
      // Unmount safety net: never leave the page transformed if
      // Playground itself is ever removed mid-sequence.
      clearAllTimers();
      const el = rootEl();
      el && el.classList.remove("br-rolling", "br-flipped", "br-reduced", "br-reduced-flip", "br-flipping-down", "br-flipping-up");
      el && (el.style.transformOrigin = "");
    },
    []
  );

  const setStageBoth = (next) => {
    stageRef.current = next;
    setStage(next);
  };

  const triggerBarrelRoll = useCallback(() => {
    if (stageRef.current !== "idle") return; // already mid-sequence -- ignore repeated clicks
    clearAllTimers();
    setStageBoth("barrelRoll");
    setShowFirstPopup(false);
    const el = rootEl();

    if (reduced) {
      // Reduced motion: skip the spinning visual entirely, but still
      // run the real sequence (a fast fade stands in for the roll) so
      // the Easter egg remains functional rather than just disabled.
      el && el.classList.add("br-reduced");
      after(50, () => {
        el && el.classList.remove("br-reduced");
        setStageBoth("firstPopup");
        setShowFirstPopup(true);
      });
      return;
    }

    el && el.classList.add("br-rolling");
    setViewportOrigin(el);
    // Matches the 2.4s animation-duration set on .br-rolling below, plus
    // a hair of margin so the class never gets removed mid-frame. Slowed
    // from the original 1s so the full rotation is easy to follow.
    after(2500, () => {
      el && el.classList.remove("br-rolling");
      setStageBoth("firstPopup");
      setShowFirstPopup(true);
    });
  }, [reduced]);

  const triggerUpsideDown = useCallback(() => {
    // Only valid from the state the first popup leaves us in -- guards
    // against the popup's button firing twice (e.g. a fast double-tap)
    // from ever starting two overlapping flips.
    if (stageRef.current !== "firstPopup") return;
    clearAllTimers();
    setShowFirstPopup(false);
    setStageBoth("secondSurprise");
    const el = rootEl();

    if (reduced) {
      el && el.classList.add("br-reduced-flip");
      after(5000, () => {
        el && el.classList.remove("br-reduced-flip");
        setStageBoth("idle");
      });
      return;
    }

    el && el.classList.add("br-flipping-down");
    setViewportOrigin(el);
    // Matches .br-flipping-down's 0.9s rotate-to-180 duration.
    after(900, () => {
      el && el.classList.remove("br-flipping-down");
      el && el.classList.add("br-flipped");
      setStageBoth("upsideDown");
      // Exactly 5s held upside down, per spec -- separate from (not
      // combined with) either rotation's own duration. Scroll and
      // interaction remain fully live for the whole 5s: nothing here
      // locks overflow or freezes the document.
      after(5000, () => {
        el && el.classList.remove("br-flipped");
        el && el.classList.add("br-flipping-up");
        setStageBoth("returning");
        // Matches .br-flipping-up's 0.9s rotate-back-to-0 duration.
        after(900, () => {
          el && el.classList.remove("br-flipping-up");
          setStageBoth("idle");
        });
      });
    });
  }, [reduced]);

  const dismissFirstPopup = useCallback(() => {
    setShowFirstPopup(false);
    setStageBoth("idle");
  }, []);

  return { stage, showFirstPopup, triggerBarrelRoll, triggerUpsideDown, dismissFirstPopup };
}

function useBurst() {
  const [bursts, setBursts] = useState([]);
  const fire = useCallback((colorA, colorB, count = 10) => {
    const id = Date.now() + Math.random();
    const particles = new Array(count).fill(0).map((_, i) => {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const dist = 30 + Math.random() * 46;
      return {
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist,
        color: i % 2 === 0 ? colorA : colorB,
        size: 3 + Math.random() * 3.5,
        delay: Math.random() * 0.04,
      };
    });
    setBursts((b) => [...b, { id, particles }]);
    setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 750);
  }, []);
  return [bursts, fire];
}

function BurstLayer({ bursts }) {
  return (
    <>
      {bursts.map((b) => (
        <div key={b.id} className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
          {b.particles.map((p, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                background: p.color,
                animation: `burstOut 0.65s ease-out ${p.delay}s both`,
                "--tx": `${p.tx}px`,
                "--ty": `${p.ty}px`,
              }}
            />
          ))}
        </div>
      ))}
    </>
  );
}

/* =========================================================================
   CUSTOM CURSOR (desktop only, with a very light trail)
   ========================================================================= */

// Playground now lives permanently in the DOM as one section of the
// continuous page scroll (see SceneTransition.jsx), rather than
// mounting only when the standalone app routed to it -- so its custom,
// native-cursor-replacing cursor needs an explicit "is this section
// actually the one on screen" gate, or the window-level mousemove
// listener below would follow the pointer everywhere on the whole
// portfolio, not just while looking at Playground. `inView` uses the
// same plain getBoundingClientRect() polling approach as
// ContextualNav/useActiveSection (see the comments there) rather than
// an IntersectionObserver, for the same reasons.
function useSectionInView(sectionRef) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const evaluate = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setInView(rect.top < window.innerHeight && rect.bottom > 0);
    };
    evaluate();
    window.addEventListener("scroll", evaluate, { passive: true });
    window.addEventListener("resize", evaluate);
    return () => {
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("resize", evaluate);
    };
  }, [sectionRef]);
  return inView;
}

function CustomCursor({ c, isTouch, reduced, active }) {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const trailRef = useRef(null);
  const [label, setLabel] = useState(null);
  const raf = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const trail = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isTouch || !active) return;
    const move = (e) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    };
    window.addEventListener("mousemove", move);

    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.22;
      pos.current.y += (target.current.y - pos.current.y) * 0.22;
      trail.current.x += (target.current.x - trail.current.x) * 0.1;
      trail.current.y += (target.current.y - trail.current.y) * 0.1;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
      if (trailRef.current && !reduced) trailRef.current.style.transform = `translate3d(${trail.current.x}px, ${trail.current.y}px, 0) translate(-50%, -50%)`;
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    const onEnter = (e) => {
      const el = e.target.closest("[data-cursor]");
      if (el) setLabel(el.getAttribute("data-cursor"));
    };
    const onLeave = (e) => {
      const el = e.target.closest("[data-cursor]");
      if (el) setLabel(null);
    };
    document.addEventListener("mouseover", onEnter);
    document.addEventListener("mouseout", onLeave);

    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout", onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, [isTouch, reduced, active]);

  if (isTouch || !active) return null;

  return (
    <>
      {!reduced && (
        <div ref={trailRef} style={{ position: "fixed", top: 0, left: 0, width: 4, height: 4, borderRadius: "50%", background: c.orange, opacity: 0.35, pointerEvents: "none", zIndex: 9997 }} />
      )}
      <div ref={dotRef} style={{ position: "fixed", top: 0, left: 0, width: 6, height: 6, borderRadius: "50%", background: c.text, pointerEvents: "none", zIndex: 9999, mixBlendMode: "difference" }} />
      <div
        ref={ringRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: label ? 62 : 30,
          height: label ? 62 : 30,
          borderRadius: "50%",
          border: `1px solid ${c.text}`,
          pointerEvents: "none",
          zIndex: 9998,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: reduced ? "none" : "width 0.2s ease, height 0.2s ease, background 0.2s ease",
          background: label ? c.text : "transparent",
          mixBlendMode: "difference",
        }}
      >
        {label && <span style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: "0.08em", color: c.bg, fontWeight: 500 }}>{label}</span>}
      </div>
    </>
  );
}

/* =========================================================================
   BOOT SEQUENCE (short)
   ========================================================================= */

function BootOverlay({ c, reduced, onDone }) {
  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);
  const lines = ["INITIALIZING…", "PLAYGROUND / ACTIVE"];

  useEffect(() => {
    const d = reduced ? [60, 140] : [280, 460];
    const t1 = setTimeout(() => setPhase(1), d[0]);
    const t2 = setTimeout(() => setExiting(true), d[1]);
    const t3 = setTimeout(onDone, d[1] + (reduced ? 60 : 260));
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [reduced, onDone]);

  return (
    <div className="absolute inset-0 z-[999] flex items-center justify-center" style={{ background: c.bg, opacity: exiting ? 0 : 1, transition: "opacity 0.25s ease", pointerEvents: exiting ? "none" : "auto" }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 13, letterSpacing: "0.08em", color: phase === 1 ? c.orange : c.textMuted }}>
        {lines[phase]}
        <span style={{ animation: reduced ? "none" : "blinkCursor 0.8s steps(1) infinite" }}>_</span>
      </div>
    </div>
  );
}

/* =========================================================================
   PARTICLE FIELD (ambient drift + optional pointer repulsion)
   ========================================================================= */

function ParticleCanvas({ c, count = 20, reduced, seed = 0, speed = 1, pointerRef }) {
  const ref = useRef(null);
  const rafRef = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, dpr, particles = [];
    const rnd = seeded(seed + 1, count * 4);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = new Array(count).fill(0).map((_, i) => ({
        x: rnd[i * 4] * w,
        y: rnd[i * 4 + 1] * h,
        r: 1 + rnd[i * 4 + 2] * 2,
        baseVx: (rnd[i * 4 + 3] - 0.5) * 0.16 * speed,
        baseVy: (rnd[(i * 4 + 1) % rnd.length] - 0.5) * 0.16 * speed,
        ix: 0,
        iy: 0,
        hue: i % 2 === 0 ? c.orange : c.purple,
        a: 0.35 + rnd[i * 4 + 2] * 0.45,
      }));
    };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        if (!reduced) {
          if (pointerRef && pointerRef.current.active) {
            const dx = p.x - pointerRef.current.x;
            const dy = p.y - pointerRef.current.y;
            const d = Math.hypot(dx, dy) || 1;
            if (d < 42) {
              const f = ((42 - d) / 42) * 0.9;
              p.ix += (dx / d) * f;
              p.iy += (dy / d) * f;
            }
          }
          p.ix *= 0.9;
          p.iy *= 0.9;
          p.x += p.baseVx + p.ix;
          p.y += p.baseVy + p.iy;
          if (p.x < 0 || p.x > w) p.baseVx *= -1;
          if (p.y < 0 || p.y > h) p.baseVy *= -1;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.globalAlpha = p.a;
        ctx.fillStyle = p.hue;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (!reduced) rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [c.orange, c.purple, count, reduced, seed, speed, pointerRef]);
  return <canvas ref={ref} style={{ width: "100%", height: "100%", display: "block" }} />;
}

/* =========================================================================
   STATUS STRIP
   ========================================================================= */

function StatusStrip({ c, played, discoveries, total, justUnlocked }) {
  return (
    <div className="flex items-center gap-4 flex-wrap" style={{ fontFamily: FONT_MONO, fontSize: 10.5 }}>
      <span className="flex items-center gap-1.5">
        <span className="rounded-full" style={{ width: 6, height: 6, background: "#22C55E", animation: "pulseDot 2s ease-in-out infinite" }} />
        <span style={{ color: c.textMuted, letterSpacing: "0.06em" }}>ACTIVE</span>
      </span>
      <span style={{ color: c.textFaint }}>
        PLAYED <span style={{ color: c.text }}>{String(played).padStart(2, "0")}</span>
      </span>
      <span style={{ color: c.textFaint }}>
        FOUND <span style={{ color: c.text }}>{discoveries}/{total}</span>
      </span>
      <span style={{ color: c.textFaint }}>
        SESSION <span style={{ color: c.orange }}>{sessionMood(played)}</span>
      </span>
      {justUnlocked && <span style={{ color: c.orange, animation: "fadeIn 0.3s ease both" }}>EXPERIMENT UNLOCKED</span>}
    </div>
  );
}

/* =========================================================================
   SURPRISE PANEL
   ========================================================================= */

function SurprisePanel({ surprise, c, isTouch, onAgain, onClose }) {
  if (!surprise) return null;
  const palette = surprise.type === "palette" ? [c.orange, c.purple, surprise.seed > 0.5 ? "#1AA37A" : "#FFC93C"] : null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4" style={{ animation: "fadeIn 0.25s ease both" }}>
      <div className="absolute inset-0" onClick={onClose} style={{ background: c.bg, opacity: 0.72, backdropFilter: "blur(6px)" }} />
      <div
        className="relative w-full max-w-xs sm:max-w-sm rounded-3xl p-6 text-center"
        style={{ background: c.surface, border: `1px solid ${c.borderStrong}`, boxShadow: c.shadow, animation: "surprisePop 0.4s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-4" style={{ fontFamily: FONT_MONO, fontSize: 10.5, letterSpacing: "0.07em", color: c.orange, background: c.orangeSoft }}>
          <Sparkles size={11} />
          {surprise.label.toUpperCase()}
        </span>

        {["principle", "fact", "challenge", "chaos", "quote"].includes(surprise.type) && (
          <p className="text-lg sm:text-xl leading-snug" style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, color: c.text }}>
            {surprise.text}
          </p>
        )}

        {surprise.type === "type" && (
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 52, lineHeight: 1, backgroundImage: `linear-gradient(120deg, ${c.orange}, ${c.purple})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", display: "inline-block", animation: "letterPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}>
              Aa
            </div>
            <p className="mt-2 text-sm" style={{ fontFamily: FONT_BODY, color: c.textMuted }}>Type never sits still in here.</p>
          </div>
        )}

        {surprise.type === "palette" && (
          <div>
            <div className="flex items-center justify-center gap-3 mb-2.5">
              {palette.map((col) => (
                <div key={col} className="flex flex-col items-center gap-1.5">
                  <div className="rounded-xl" style={{ width: 44, height: 44, background: col, border: `1px solid ${c.border}` }} />
                  <span style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: c.textMuted }}>{col}</span>
                </div>
              ))}
            </div>
            <p className="text-sm" style={{ fontFamily: FONT_BODY, color: c.textMuted }}>A random combination, ready to steal.</p>
          </div>
        )}

        {surprise.type === "shape" && <GeneratedShape c={c} />}

        <AnotherOneButton c={c} isTouch={isTouch} onClick={onAgain} />
      </div>
    </div>
  );
}

/* =========================================================================
   BARREL ROLL POPUP -- the small "How was it?" card shown after the
   first (360deg) surprise, offering the second (180deg upside-down)
   one. `position: fixed` and centered on the viewport (not scoped to
   Playground's own box like SurprisePanel above) so it always appears
   centered on screen regardless of scroll position, matching "small,
   unobtrusive... does not cover the entire website" from spec. Reuses
   the exact same visual language as SurprisePanel/AnotherOneButton --
   c.surface/c.borderStrong/c.shadow, the same surprisePop entrance
   keyframe, the same pill-button treatment -- so it reads as part of
   this design system rather than a bolted-on alert.
   ========================================================================= */
function BarrelRollPopup({ show, c, isTouch, onNext, onClose }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" style={{ animation: "fadeIn 0.25s ease both" }}>
      <div className="absolute inset-0" onClick={onClose} style={{ background: c.bg, opacity: 0.6, backdropFilter: "blur(4px)" }} />
      <div
        className="relative w-full max-w-[300px] rounded-3xl p-6 text-center"
        style={{ background: c.surface, border: `1px solid ${c.borderStrong}`, boxShadow: c.shadow, animation: "surprisePop 0.4s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <p className="text-lg" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: c.text, marginBottom: 4 }}>
          How was it? 😏
        </p>
        <p className="text-sm" style={{ fontFamily: FONT_BODY, color: c.textMuted, marginBottom: 18 }}>
          There's one more trick up this site's sleeve.
        </p>
        <AnotherOneButton c={c} isTouch={isTouch} onClick={onNext} label="Something new" icon={<RotateCw size={16} />} />
      </div>
    </div>
  );
}

/* =========================================================================
   ANOTHER ONE \u2014 primary pill button for the Surprise Me panel.
   Deliberately sized like a real primary action (not a tiny utility button),
   with a hover lift + icon spin on desktop and a firm tap response on touch.
   ========================================================================= */

function AnotherOneButton({ c, isTouch, onClick, label = "Another one", icon = null }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      data-cursor="CLICK"
      onClick={onClick}
      onMouseEnter={() => !isTouch && setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      className="mt-6 inline-flex items-center justify-center gap-2.5 rounded-full mx-auto"
      style={{
        fontFamily: FONT_BODY,
        fontWeight: 600,
        fontSize: 15,
        padding: "13px 26px",
        minHeight: 50,
        background: c.text,
        color: c.bg,
        touchAction: "manipulation",
        border: "none",
        cursor: "pointer",
        transform: pressed ? "translateY(0) scale(0.96)" : hovered ? "translateY(-2px) scale(1.02)" : "translateY(0) scale(1)",
        boxShadow: pressed ? "none" : hovered ? c.shadowStrong : c.shadow,
        transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease",
      }}
    >
      <span>{label}</span>
      {icon || (
        <Dice5
          size={16}
          style={{
            display: "inline-block",
            transform: hovered ? "rotate(28deg) scale(1.12)" : pressed ? "rotate(-10deg) scale(0.92)" : "rotate(0deg) scale(1)",
            transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        />
      )}
    </button>
  );
}

function GeneratedShape({ c }) {
  const seed = useMemo(() => Math.random() * 1000, []);
  const pts = useMemo(() => {
    const r = seeded(seed, 10);
    const n = 5 + Math.floor(r[0] * 3);
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n;
      const rad = 28 + r[(i + 1) % r.length] * 18;
      out.push(`${50 + Math.cos(a) * rad},${50 + Math.sin(a) * rad}`);
    }
    return out.join(" ");
  }, [seed]);
  return (
    <div>
      <svg viewBox="0 0 100 100" style={{ width: 88, height: 88, margin: "0 auto" }}>
        <polygon points={pts} fill="none" stroke={c.orange} strokeWidth="2" strokeLinejoin="round" style={{ animation: "spinGentle 6s linear infinite", transformOrigin: "50px 50px" }} />
        <polygon points={pts} fill={c.purple} opacity="0.15" />
      </svg>
      <p className="mt-1.5 text-sm" style={{ fontFamily: FONT_BODY, color: c.textMuted }}>A shape that only exists this once.</p>
    </div>
  );
}

/* =========================================================================
   GAME 01 — MAGNET DOT
   Desktop: hover/move → dot flees. Mobile: touch + drag → dot flees.
   Catching always works via pointerdown, on either device, no hover required.
   ========================================================================= */

function MagnetGame({ c, isTouch, reduced, onInteract }) {
  const boxRef = useRef(null);
  const [pos, setPos] = useState({ x: 60, y: 40 });
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [bursts, fire] = useBurst();
  const exploredRef = useRef(false);

  const randomPos = (rect) => ({ x: 18 + Math.random() * Math.max(1, rect.width - 36), y: 18 + Math.random() * Math.max(1, rect.height - 36) });

  useEffect(() => {
    if (!isTouch || !boxRef.current) return;
    const id = setInterval(() => {
      if (boxRef.current) setPos(randomPos(boxRef.current.getBoundingClientRect()));
    }, 1200);
    return () => clearInterval(id);
  }, [isTouch]);

  const onMove = (e) => {
    if (reduced || !boxRef.current) return;
    if (!exploredRef.current) {
      exploredRef.current = true;
      onInteract("magnet");
    }
    const rect = boxRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const dx = pos.x - mx;
    const dy = pos.y - my;
    const dist = Math.hypot(dx, dy) || 1;
    const radius = isTouch ? 72 : 55;
    if (dist < radius) {
      setPos({
        x: Math.max(14, Math.min(rect.width - 14, pos.x + (dx / dist) * 24)),
        y: Math.max(14, Math.min(rect.height - 14, pos.y + (dy / dist) * 24)),
      });
    }
  };

  const catchAt = (px, py, rect) => {
    const catchRadius = isTouch ? 32 : 24;
    if (Math.hypot(pos.x - px, pos.y - py) <= catchRadius) {
      setScore((s) => {
        const ns = s + 1;
        setBest((b) => Math.max(b, ns));
        return ns;
      });
      fire(c.orange, c.purple, 8);
      onInteract("magnet");
      setPos(randomPos(rect));
    }
  };

  const onDown = (e) => {
    if (!boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    catchAt(e.clientX - rect.left, e.clientY - rect.top, rect);
  };

  const onKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === " ") && boxRef.current) {
      e.preventDefault();
      const rect = boxRef.current.getBoundingClientRect();
      catchAt(pos.x, pos.y, rect);
    }
  };

  return (
    <div
      ref={boxRef}
      onPointerMove={onMove}
      onPointerDown={onDown}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="button"
      aria-label="Catch the dot"
      data-cursor="PLAY"
      className="absolute inset-0"
      style={{ touchAction: "none", outline: "none" }}
    >
      <div className="absolute rounded-full" style={{ width: 22, height: 22, left: pos.x - 11, top: pos.y - 11, background: c.orange, boxShadow: `0 0 14px 2px ${c.orangeSoft}`, transition: "left 0.16s ease-out, top 0.16s ease-out" }} />
      <BurstLayer bursts={bursts} />
      <span className="absolute bottom-1.5 right-2" style={{ fontFamily: FONT_MONO, fontSize: 8.5, color: c.textFaint }}>
        CATCHES {String(score).padStart(2, "0")} · BEST {String(best).padStart(2, "0")}
      </span>
    </div>
  );
}

/* =========================================================================
   GAME 02 — PARTICLE LAB
   Desktop: hover/move stirs particles. Mobile: touch + drag stirs them.
   GENERATE always works as a plain button either way.
   ========================================================================= */

function ParticleLabGame({ c, reduced, onInteract }) {
  const [seed, setSeed] = useState(1);
  const [gen, setGen] = useState(1);
  const expId = useRef(20 + Math.floor(Math.random() * 70));
  const pointerRef = useRef({ x: -999, y: -999, active: false });
  const exploredRef = useRef(false);

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
    if (!exploredRef.current) {
      exploredRef.current = true;
      onInteract("particles");
    }
  };
  const clearPointer = () => {
    pointerRef.current.active = false;
  };

  return (
    <div className="absolute inset-0" onPointerMove={onMove} onPointerLeave={clearPointer} onPointerUp={clearPointer} onPointerCancel={clearPointer} style={{ touchAction: "none" }}>
      <ParticleCanvas c={c} count={18} reduced={reduced} seed={seed} speed={1 + (seed % 4) * 0.3} pointerRef={pointerRef} />
      <span className="absolute top-1.5 left-2" style={{ fontFamily: FONT_MONO, fontSize: 8.5, color: c.textFaint }}>
        EXP #{expId.current} · GEN {String(gen).padStart(2, "0")}
      </span>
      <button
        type="button"
        data-cursor="CLICK"
        onClick={() => {
          setSeed((s) => s + 7);
          setGen((g) => g + 1);
          onInteract("particles");
        }}
        className="absolute bottom-1.5 right-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 active:scale-95 transition-transform"
        style={{ fontFamily: FONT_MONO, fontSize: 9, color: c.text, background: c.surface, border: `1px solid ${c.border}`, touchAction: "manipulation" }}
      >
        GENERATE <RotateCw size={9} />
      </button>
    </div>
  );
}

/* =========================================================================
   GAME 03 — STONE • PAPER • SCISSORS
   A real, timed mini-game: a 3-second countdown runs while the player can
   tap a move at any time. Locking a move (or letting the clock hit zero)
   stops the timer, rolls a genuinely random computer move, and reveals the
   outcome in three quick beats: player move → computer move → result.
   Score and round persist for the page session only.
   ========================================================================= */

const SPS_ROUND_TIME = 3;
const SPS_MOVES = [
  { id: "stone", label: "STONE", glyph: "\u{1FAA8}" },
  { id: "paper", label: "PAPER", glyph: "\u{1F4C4}" },
  { id: "scissors", label: "SCISSORS", glyph: "\u2702\uFE0F" },
];
const SPS_BEATS = { stone: "scissors", paper: "stone", scissors: "paper" };

function StonePaperScissorsGame({ c, isTouch, reduced, onInteract }) {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState({ you: 0, cpu: 0, draw: 0 });
  const [timeLeft, setTimeLeft] = useState(SPS_ROUND_TIME);
  // "idle" is the freshly-opened, not-yet-played state -- a "Click to
  // Play" action is shown instead of the move-choosing UI, and the
  // countdown ticker (below) is inert until the player starts. Once
  // started, this game behaves exactly as before: "countdown" (choose a
  // move before the clock runs out) -> "reveal" (result + RETRY).
  const [phase, setPhase] = useState("idle"); // "idle" | "countdown" | "reveal"
  const [playerChoice, setPlayerChoice] = useState(null); // null = no move (timeout)
  const [computerChoice, setComputerChoice] = useState(null);
  const [outcome, setOutcome] = useState(null); // "win" | "lose" | "draw" | "timeout"
  const [revealStep, setRevealStep] = useState(0);
  const [isTimeout, setIsTimeout] = useState(false);
  const resolvedRef = useRef(false);
  const revealTimers = useRef([]);

  const clearRevealTimers = () => {
    revealTimers.current.forEach((t) => clearTimeout(t));
    revealTimers.current = [];
  };

  // Countdown ticker
  useEffect(() => {
    if (phase !== "countdown") return undefined;
    if (timeLeft <= 0) {
      finalizeRound(null);
      return undefined;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft]);

  useEffect(() => () => clearRevealTimers(), []);

  function finalizeRound(moveId) {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    const timedOut = moveId === null;
    const cpuMove = SPS_MOVES[Math.floor(Math.random() * SPS_MOVES.length)].id;
    let result;
    if (timedOut) result = "timeout";
    else if (moveId === cpuMove) result = "draw";
    else if (SPS_BEATS[moveId] === cpuMove) result = "win";
    else result = "lose";

    setIsTimeout(timedOut);
    setPlayerChoice(moveId);
    setComputerChoice(cpuMove);
    setOutcome(result);
    setPhase("reveal");
    setRevealStep(0);
    onInteract("sps");

    const stepDelay = reduced ? 90 : timedOut ? 550 : 480;
    clearRevealTimers();
    revealTimers.current.push(setTimeout(() => setRevealStep(1), stepDelay));
    revealTimers.current.push(setTimeout(() => setRevealStep(2), stepDelay * 2));
    revealTimers.current.push(
      setTimeout(() => {
        setScore((s) => {
          if (result === "win") return { ...s, you: s.you + 1 };
          if (result === "draw") return { ...s, draw: s.draw + 1 };
          return { ...s, cpu: s.cpu + 1 };
        });
      }, stepDelay * 2)
    );
  }

  const choose = (moveId) => {
    if (phase !== "countdown") return;
    finalizeRound(moveId);
  };

  const startGame = () => {
    if (phase !== "idle") return;
    setPhase("countdown");
  };

  const retry = () => {
    clearRevealTimers();
    resolvedRef.current = false;
    setRound((r) => r + 1);
    setTimeLeft(SPS_ROUND_TIME);
    setPlayerChoice(null);
    setComputerChoice(null);
    setOutcome(null);
    setIsTimeout(false);
    setRevealStep(0);
    setPhase("countdown");
  };

  const outcomeLabel =
    outcome === "win" ? "YOU WIN!" : outcome === "lose" ? (isTimeout ? "COMPUTER WINS" : "YOU LOSE") : outcome === "draw" ? "DRAW!" : "";
  const outcomeColor = outcome === "win" ? c.orange : outcome === "draw" ? c.purple : c.textMuted;

  const playerMoveMeta = playerChoice ? SPS_MOVES.find((m) => m.id === playerChoice) : null;
  const cpuMoveMeta = computerChoice ? SPS_MOVES.find((m) => m.id === computerChoice) : null;

  return (
    <div className="absolute inset-0 p-2.5 flex flex-col" style={{ touchAction: "manipulation" }}>
      {/* Round + score strip */}
      <div className="flex items-center justify-between mb-1" style={{ fontFamily: FONT_MONO, fontSize: 8, color: c.textFaint, letterSpacing: "0.04em" }}>
        <span>ROUND {String(round).padStart(2, "0")}</span>
        <span>
          Y {String(score.you).padStart(2, "0")} · C {String(score.cpu).padStart(2, "0")} · D {String(score.draw).padStart(2, "0")}
        </span>
      </div>

      {phase === "idle" ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <span style={{ fontSize: 22, lineHeight: 1 }} aria-hidden="true">
            {SPS_MOVES[0].glyph}
            {SPS_MOVES[1].glyph}
            {SPS_MOVES[2].glyph}
          </span>
          <span style={{ fontFamily: FONT_BODY, fontSize: 10, color: c.textMuted }}>Beat the clock, best of luck</span>
          <button
            type="button"
            onClick={startGame}
            data-cursor="CLICK"
            className="inline-flex items-center gap-1 rounded-full"
            style={{
              fontFamily: FONT_BODY,
              fontWeight: 600,
              fontSize: 10,
              padding: "5px 12px",
              background: c.text,
              color: c.bg,
              border: "none",
              cursor: "pointer",
              touchAction: "manipulation",
              transition: "transform 0.18s cubic-bezier(0.34,1.56,0.64,1)",
            }}
            onMouseEnter={(e) => !isTouch && (e.currentTarget.style.transform = "translateY(-1px) scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0) scale(1)")}
            onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.94)")}
          >
            Click to Play
            <MousePointer2 size={11} />
          </button>
        </div>
      ) : phase === "countdown" ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-2">
            <div
              key={timeLeft}
              className="flex items-center justify-center rounded-full"
              style={{
                width: 26,
                height: 26,
                border: `2px solid ${c.orange}`,
                fontFamily: FONT_MONO,
                fontWeight: 700,
                fontSize: 12,
                color: c.orange,
                animation: reduced ? "none" : "letterPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
              }}
            >
              {timeLeft}
            </div>
            <span style={{ fontFamily: FONT_BODY, fontSize: 10, color: c.textMuted }}>Choose your move</span>
          </div>
          <div className="flex items-stretch gap-1.5 w-full px-0.5">
            {SPS_MOVES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => choose(m.id)}
                data-cursor="CHOOSE"
                className="flex-1 flex flex-col items-center justify-center gap-0.5 rounded-lg"
                style={{
                  minHeight: 56,
                  padding: "8px 4px",
                  background: c.surface,
                  border: `1px solid ${c.border}`,
                  cursor: "pointer",
                  touchAction: "manipulation",
                  transition: "transform 0.16s cubic-bezier(0.34,1.56,0.64,1), border-color 0.16s ease, box-shadow 0.16s ease",
                }}
                onMouseEnter={(e) => {
                  if (isTouch || reduced) return;
                  e.currentTarget.style.transform = "translateY(-3px) scale(1.04)";
                  e.currentTarget.style.borderColor = c.orange;
                  e.currentTarget.style.boxShadow = c.shadow;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.borderColor = c.border;
                  e.currentTarget.style.boxShadow = "none";
                }}
                onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.94)")}
                onPointerUp={(e) => (e.currentTarget.style.transform = isTouch ? "scale(1)" : "translateY(-3px) scale(1.04)")}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }} aria-hidden="true">
                  {m.glyph}
                </span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 6.5, letterSpacing: "0.03em", color: c.textMuted }}>{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-1.5">
          {isTimeout && revealStep === 0 ? (
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 13, color: c.orange, animation: reduced ? "none" : "letterPop 0.3s ease both" }}>
              TIME'S UP!
            </span>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <div className="flex flex-col items-center gap-0.5">
                <span style={{ fontFamily: FONT_MONO, fontSize: 7, color: c.textFaint, letterSpacing: "0.05em" }}>YOU</span>
                {playerMoveMeta ? (
                  <span style={{ fontSize: 22, lineHeight: 1, animation: reduced ? "none" : "letterPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }} aria-hidden="true">
                    {playerMoveMeta.glyph}
                  </span>
                ) : (
                  <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: c.textFaint }}>NO MOVE</span>
                )}
              </div>
              <span style={{ fontFamily: FONT_MONO, fontSize: 8, color: c.textFaint }}>VS</span>
              <div className="flex flex-col items-center gap-0.5">
                <span style={{ fontFamily: FONT_MONO, fontSize: 7, color: c.textFaint, letterSpacing: "0.05em" }}>CPU</span>
                {revealStep >= 1 && cpuMoveMeta ? (
                  <span style={{ fontSize: 22, lineHeight: 1, animation: reduced ? "none" : "letterPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }} aria-hidden="true">
                    {cpuMoveMeta.glyph}
                  </span>
                ) : (
                  <span
                    className="flex items-center justify-center rounded-full"
                    style={{ width: 24, height: 24, border: `1px dashed ${c.border}`, fontFamily: FONT_MONO, fontSize: 11, color: c.textFaint }}
                  >
                    ?
                  </span>
                )}
              </div>
            </div>
          )}

          {revealStep >= 2 && (
            <span
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: 12.5,
                color: outcomeColor,
                letterSpacing: "0.02em",
                animation: reduced ? "none" : "letterPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
              }}
            >
              {outcomeLabel}
            </span>
          )}

          {revealStep >= 2 && (
            <button
              type="button"
              onClick={retry}
              data-cursor="CLICK"
              className="inline-flex items-center gap-1 rounded-full"
              style={{
                fontFamily: FONT_BODY,
                fontWeight: 600,
                fontSize: 10,
                padding: "5px 12px",
                background: c.text,
                color: c.bg,
                border: "none",
                cursor: "pointer",
                touchAction: "manipulation",
                transition: "transform 0.18s cubic-bezier(0.34,1.56,0.64,1)",
              }}
              onMouseEnter={(e) => !isTouch && (e.currentTarget.style.transform = "translateY(-1px) scale(1.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0) scale(1)")}
              onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.94)")}
            >
              RETRY
              <RotateCw size={11} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   GAME 04 — REACTION
   ========================================================================= */

function ReactionGame({ c, onInteract }) {
  const [state, setState] = useState("idle");
  const [time, setTime] = useState(null);
  const [best, setBest] = useState(null);
  const startRef = useRef(0);
  const timeoutRef = useRef(null);

  const start = () => {
    setState("waiting");
    timeoutRef.current = setTimeout(() => {
      startRef.current = performance.now();
      setState("ready");
    }, 700 + Math.random() * 1700);
  };

  const onTap = () => {
    if (state === "idle" || state === "early" || state === "result") {
      start();
      return;
    }
    if (state === "waiting") {
      clearTimeout(timeoutRef.current);
      setState("early");
      return;
    }
    if (state === "ready") {
      const t = (performance.now() - startRef.current) / 1000;
      setTime(t);
      setBest((b) => (b === null || t < b ? t : b));
      setState("result");
      onInteract("reaction");
    }
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const label =
    state === "idle" ? "TAP TO START" : state === "waiting" ? "WAIT…" : state === "ready" ? "CLICK!" : state === "early" ? "TOO SOON — RETRY" : `${time.toFixed(3)}s — RETRY`;

  return (
    <button
      type="button"
      onClick={onTap}
      data-cursor="CLICK"
      className="absolute inset-0 flex flex-col items-center justify-center gap-1"
      style={{ background: state === "ready" ? c.orangeSoft : "transparent", border: "none", padding: 0, cursor: "pointer", transition: "background 0.12s", touchAction: "manipulation" }}
    >
      <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 13.5, color: state === "ready" ? c.orange : c.text, textAlign: "center", padding: "0 8px" }}>{label}</span>
      {best !== null && <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: c.textFaint }}>BEST {best.toFixed(3)}s</span>}
    </button>
  );
}

/* =========================================================================
   GAME 05 — CONNECT
   Tap-to-connect on every device — the most reliable gesture across
   mouse, trackpad and touch, so desktop and mobile share one mechanic.
   ========================================================================= */

function genPoints() {
  const r = seeded(Math.random() * 1000, 12);
  return new Array(4).fill(0).map((_, i) => ({ x: 18 + r[i * 2] * 164, y: 14 + r[i * 2 + 1] * 72 }));
}

function ConnectGame({ c, onInteract }) {
  const [points, setPoints] = useState(genPoints);
  const [next, setNext] = useState(0);
  const [complete, setComplete] = useState(false);

  const tapPoint = (i) => {
    if (complete || i !== next) return;
    const isLast = next === points.length - 1;
    setNext((n) => n + 1);
    if (isLast) {
      setComplete(true);
      onInteract("connect");
      setTimeout(() => {
        setPoints(genPoints());
        setNext(0);
        setComplete(false);
      }, 850);
    }
  };

  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 200 100" className="w-full h-full">
        {next > 1 &&
          points.slice(0, next).map((p, i) => {
            if (i === 0) return null;
            const prev = points[i - 1];
            return <line key={i} x1={prev.x} y1={prev.y} x2={p.x} y2={p.y} stroke={c.orange} strokeWidth="2" strokeLinecap="round" />;
          })}
        {points.map((p, i) => (
          <g
            key={i}
            tabIndex={0}
            role="button"
            aria-label={`Point ${i + 1}`}
            onPointerDown={() => tapPoint(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                tapPoint(i);
              }
            }}
            data-cursor="CLICK"
            style={{ cursor: "pointer", outline: "none", touchAction: "manipulation" }}
          >
            <circle cx={p.x} cy={p.y} r="12" fill="transparent" />
            <circle cx={p.x} cy={p.y} r={i < next ? 5 : 6} fill={i < next ? c.orange : c.surface} stroke={i === next ? c.purple : c.border} strokeWidth={i === next ? 2 : 1} />
            <text x={p.x} y={p.y - 10} textAnchor="middle" style={{ fontFamily: FONT_MONO, fontSize: 7, fill: c.textFaint }}>
              {i + 1}
            </text>
          </g>
        ))}
      </svg>
      <span className="absolute bottom-1.5 right-2" style={{ fontFamily: FONT_MONO, fontSize: 9, color: complete ? c.orange : c.textFaint }}>
        {complete ? "PATTERN COMPLETE" : `CONNECT ${next + 1}/${points.length}`}
      </span>
    </div>
  );
}

/* =========================================================================
   GAME 06 — FIREWORKS
   In-card trigger for the full-viewport fireworks overlay. Desktop click
   or mobile tap both fire the exact same sequence via onLaunch (lifted to
   the page root so the show can cover the whole screen, not just the card).
   ========================================================================= */

function FireworksGame({ c, reduced, isTouch, onInteract, onLaunch }) {
  const [pressed, setPressed] = useState(false);
  const [fired, setFired] = useState(false);
  const [hoverPreview, setHoverPreview] = useState(null);

  const trigger = (e) => {
    setPressed(true);
    setTimeout(() => setPressed(false), 180);
    setFired(true);
    onInteract("fireworks");
    if (onLaunch) {
      const rect = e.currentTarget.getBoundingClientRect();
      onLaunch({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }
  };

  const onHoverMove = (e) => {
    if (reduced || isTouch) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPreview({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <button
      type="button"
      onClick={trigger}
      onPointerMove={onHoverMove}
      onPointerLeave={() => setHoverPreview(null)}
      data-cursor="LAUNCH"
      className="absolute inset-0 flex flex-col items-center justify-center gap-1.5"
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        touchAction: "manipulation",
        transform: pressed ? "scale(0.96)" : "scale(1)",
        transition: "transform 0.18s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      {hoverPreview && !reduced && !isTouch && (
        <span
          className="absolute rounded-full pointer-events-none"
          style={{
            left: hoverPreview.x,
            top: hoverPreview.y,
            width: 10,
            height: 10,
            marginLeft: -5,
            marginTop: -5,
            background: c.orange,
            boxShadow: `0 0 16px 4px ${c.orangeSoft}`,
            opacity: 0.7,
            transition: "opacity 0.15s ease",
          }}
        />
      )}
      <span
        style={{
          fontSize: 22,
          color: c.orange,
          display: "inline-block",
          transform: pressed ? "scale(1.3) rotate(-8deg)" : "scale(1)",
          transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        }}
        aria-hidden="true"
      >
        ✨
      </span>
      <span style={{ fontFamily: FONT_MONO, fontSize: 9.5, letterSpacing: "0.05em", color: c.textFaint, textAlign: "center", padding: "0 8px" }}>
        {isTouch ? "TAP TO SEE FIREWORKS" : "CLICK TO SEE FIREWORKS"}
      </span>
      {fired && (
        <span style={{ fontFamily: FONT_MONO, fontSize: 8.5, color: c.orange, letterSpacing: "0.05em" }}>
          {isTouch ? "TAP FOR MORE →" : "CLICK FOR MORE →"}
        </span>
      )}
    </button>
  );
}

/* =========================================================================
   FIREWORKS OVERLAY — full-viewport canvas, mounted once at the page root.
   Sequence: rocket trail launches → explodes into particles → sparks fade.
   Every activation randomizes count/position/size/spread/timing so no two
   shows feel identical. Runs ~1.6–2.6s total, then cleans itself up fully.
   ========================================================================= */

function FireworksOverlay({ active, reduced, theme, onDone }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef({ rockets: [], particles: [], startedAt: 0 });
  const [glow, setGlow] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!active) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let vw = window.innerWidth;
    let vh = window.innerHeight;

    const resize = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = vw * dpr;
      canvas.height = vh * dpr;
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const palette =
      theme === "dark"
        ? ["#FF7A3D", "#A47CFF", "#FFD166", "#4FD1C5", "#FF6B9D", "#F5EFE6"]
        : ["#FF5A1F", "#7A3DFF", "#F2A31A", "#1FA88A", "#E24A7A", "#17130F"];

    const isMobile = vw < 640;
    const simplified = reduced;
    const fireworkCount = simplified ? 2 : isMobile ? 3 + Math.floor(Math.random() * 2) : 4 + Math.floor(Math.random() * 3);

    const rockets = [];
    for (let i = 0; i < fireworkCount; i++) {
      const launchX = vw * (0.12 + Math.random() * 0.76);
      const launchDelay = simplified ? i * 90 : Math.random() * 900;
      const targetX = Math.max(vw * 0.1, Math.min(vw * 0.9, launchX + (Math.random() - 0.5) * vw * 0.3));
      const targetY = vh * (0.14 + Math.random() * 0.4);
      const colorA = palette[Math.floor(Math.random() * palette.length)];
      let colorB = palette[Math.floor(Math.random() * palette.length)];
      if (colorB === colorA) colorB = palette[(palette.indexOf(colorA) + 1) % palette.length];
      rockets.push({
        x: launchX,
        y: vh + 10,
        startY: vh + 10,
        targetX,
        targetY,
        delay: launchDelay,
        launched: false,
        exploded: false,
        speed: 0.011 + Math.random() * 0.006,
        progress: 0,
        trail: [],
        colorA,
        colorB,
        big: !simplified && i === fireworkCount - 1,
      });
    }

    stateRef.current = { rockets, particles: [], startedAt: performance.now() };
    setGlow(true);

    const spawnBurst = (fw) => {
      const baseCount = simplified ? 16 : fw.big ? 70 : 34 + Math.floor(Math.random() * 22);
      const spread = fw.big ? 1 : 0.55 + Math.random() * 0.5;
      const speedBase = fw.big ? 3.4 : 2.1 + Math.random() * 1.1;
      const ring = Math.random() > 0.5 || fw.big;
      for (let i = 0; i < baseCount; i++) {
        const angle = ring ? (Math.PI * 2 * i) / baseCount + Math.random() * 0.15 : Math.random() * Math.PI * 2;
        const speed = (ring ? speedBase : speedBase * (0.3 + Math.random() * 0.9)) * spread;
        stateRef.current.particles.push({
          x: fw.targetX,
          y: fw.targetY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: i % 2 === 0 ? fw.colorA : fw.colorB,
          size: 1.4 + Math.random() * (fw.big ? 2.4 : 1.8),
          life: 1,
          decay: simplified ? 0.028 : 0.012 + Math.random() * 0.012,
          gravity: 0.028,
          spark: Math.random() > 0.72,
        });
      }
    };

    const tick = (now) => {
      const elapsed = now - stateRef.current.startedAt;
      ctx.clearRect(0, 0, vw, vh);

      let anyAlive = false;

      stateRef.current.rockets.forEach((fw) => {
        if (fw.exploded) return;
        anyAlive = true;
        if (elapsed < fw.delay) return;
        fw.launched = true;
        fw.progress = Math.min(1, (elapsed - fw.delay) * fw.speed);
        fw.x = fw.x + (fw.targetX - fw.x) * 0.02;
        fw.y = fw.startY + (fw.targetY - fw.startY) * easeOutCubic(fw.progress);

        fw.trail.push({ x: fw.x, y: fw.y, a: 1 });
        if (fw.trail.length > 10) fw.trail.shift();
        fw.trail.forEach((t, i) => {
          const a = (i / fw.trail.length) * 0.5;
          ctx.beginPath();
          ctx.arc(t.x, t.y, fw.big ? 2 : 1.4, 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(fw.colorA, a);
          ctx.fill();
        });

        if (fw.progress >= 1) {
          fw.exploded = true;
          spawnBurst(fw);
        }
      });

      stateRef.current.particles.forEach((p) => {
        if (p.life <= 0) return;
        anyAlive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.988;
        p.vy *= 0.994;
        p.life -= p.decay;

        const alpha = Math.max(0, p.life);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.spark ? p.size * 0.6 : p.size, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(p.color, alpha);
        if (p.spark) {
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      stateRef.current.particles = stateRef.current.particles.filter((p) => p.life > 0);

      const maxDuration = simplified ? 1400 : 2600;
      if ((anyAlive || stateRef.current.particles.length > 0) && elapsed < maxDuration) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, vw, vh);
        setGlow(false);
        if (onDoneRef.current) onDoneRef.current();
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      const c2 = canvasRef.current;
      if (c2) {
        const cctx = c2.getContext("2d");
        cctx && cctx.clearRect(0, 0, c2.width, c2.height);
      }
      setGlow(false);
    };
  }, [active, reduced, theme]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9990 }} aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background: theme === "dark" ? "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.06), transparent 70%)" : "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.35), transparent 70%)",
          opacity: glow ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0" style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  const bigint = parseInt(h.length === 3 ? h.split("").map((x) => x + x).join("") : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* =========================================================================
   GAME CARD SHELL
   Desktop hover previews (lift, glow). Tap/click always performs.
   Once a tile has been engaged, it shows a persistent ACTIVE state.
   ========================================================================= */

const GAMES = [
  { id: "01", tag: "MAGNET DOT", title: "Catch it", kind: "magnet", preHint: "Tap or hover to play →", activeHint: "Catch the dot →" },
  { id: "02", tag: "PARTICLE LAB", title: "Generate", kind: "particles", preHint: "Touch to stir, or generate →", activeHint: "Particles reacting →" },
  { id: "03", tag: "BEAT THE CLOCK", title: "Stone • Paper • Scissors", kind: "sps", preHint: "Choose your move before time runs out →", activeHint: "Round in progress →" },
  { id: "04", tag: "REACTION", title: "React", kind: "reaction", preHint: "Tap when ready →", activeHint: "Beat your best time →" },
  { id: "05", tag: "CONNECT", title: "Trace", kind: "connect", preHint: "Tap the points in order →", activeHint: "Keep tracing →" },
  { id: "06", tag: "FIREWORKS", title: "Ignite", kind: "fireworks", preHint: "Click to see fireworks →", activeHint: "Click for another show →" },
];

function GameCard({ meta, c, reduced, isTouch, onInteract, onLaunchFireworks }) {
  const [engaged, setEngaged] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleInteract = (gameId) => {
    setEngaged(true);
    onInteract(gameId);
  };

  return (
    <div
      className="relative rounded-2xl p-3.5 flex flex-col h-full"
      style={{
        background: c.surface,
        border: `1px solid ${engaged ? c.borderStrong : c.border}`,
        transform: hovered && !reduced ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? c.shadow : "none",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: c.orange, letterSpacing: "0.04em" }}>{meta.id}</span>
        {engaged ? (
          <span className="flex items-center gap-1" style={{ fontFamily: FONT_MONO, fontSize: 8.5, color: c.orange, letterSpacing: "0.05em" }}>
            <span className="rounded-full" style={{ width: 5, height: 5, background: "#22C55E", animation: reduced ? "none" : "pulseDot 2s ease-in-out infinite" }} />
            ACTIVE
          </span>
        ) : (
          <span style={{ fontFamily: FONT_MONO, fontSize: 8.5, color: c.textFaint, letterSpacing: "0.06em" }}>{meta.tag}</span>
        )}
      </div>
      <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 14, color: c.text, marginBottom: 2 }}>{meta.title}</h3>
      <p style={{ fontFamily: FONT_BODY, fontSize: 10.5, color: c.textMuted, marginBottom: 8, lineHeight: 1.3 }}>
        {meta.kind === "fireworks"
          ? engaged
            ? isTouch
              ? "Tap for another show →"
              : "Click for another show →"
            : isTouch
            ? "Tap to see fireworks →"
            : "Click to see fireworks →"
          : engaged
          ? meta.activeHint
          : meta.preHint}
      </p>
      <div className="relative rounded-xl overflow-hidden flex-1" style={{ minHeight: meta.kind === "sps" ? 190 : 108, background: c.bgSoft, border: `1px solid ${c.border}` }}>
        {meta.kind === "magnet" && <MagnetGame c={c} isTouch={isTouch} reduced={reduced} onInteract={handleInteract} />}
        {meta.kind === "particles" && <ParticleLabGame c={c} reduced={reduced} onInteract={handleInteract} />}
        {meta.kind === "sps" && <StonePaperScissorsGame c={c} isTouch={isTouch} reduced={reduced} onInteract={handleInteract} />}
        {meta.kind === "reaction" && <ReactionGame c={c} onInteract={handleInteract} />}
        {meta.kind === "connect" && <ConnectGame c={c} onInteract={handleInteract} />}
        {meta.kind === "fireworks" && <FireworksGame c={c} reduced={reduced} isTouch={isTouch} onInteract={handleInteract} onLaunch={onLaunchFireworks} />}
      </div>
    </div>
  );
}

/* =========================================================================
   MAIN COMPONENT
   ========================================================================= */

/* =========================================================================
   MAIN COMPONENT

   Playground is now a section inside the same continuous scroll as
   every other part of the portfolio (see SceneTransition.jsx), not a
   standalone page -- its own header/nav/mobile-menu/theme-toggle (the
   original NAVBAR block) was removed entirely in favor of the shared
   ContextualNav (the same minimal six-button nav Work/Creative
   Lab/About already use). `theme` is no longer local state the page
   flips itself; it's driven by the `dark` prop from the same shared
   theme source of truth as everywhere else in the app, so Playground
   always agrees with the rest of the site instead of maintaining an
   independent light/dark switch of its own. Every game, the surprise
   engine, the hidden easter egg, and all their animations are
   otherwise untouched from the original standalone project.
   ========================================================================= */

export default function PlaygroundSection({ dark = false, id, onNavigate, onNavigateToWork }) {
  const theme = dark ? "dark" : "light";
  const [booted, setBooted] = useState(false);
  const [surprise, setSurprise] = useState(null);
  const [surpriseStage, setSurpriseStage] = useState("idle");
  const [pressed, setPressed] = useState(false);
  const [played, setPlayed] = useState(0);
  const [discovered, setDiscovered] = useState([]);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [chaos, setChaos] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [codeSetIdx, setCodeSetIdx] = useState(0);
  const [ripples, setRipples] = useState([]);
  const [logoClicks, setLogoClicks] = useState(0);
  const [secretToast, setSecretToast] = useState(false);
  const [fireworksActive, setFireworksActive] = useState(false);
  const [fireworksGlow, setFireworksGlow] = useState(false);
  const fireworksTimeoutRef = useRef(null);

  const lastIndex = useRef(-1);
  const reduced = usePrefersReducedMotion();
  const isTouch = useIsTouch();
  const c = COLORS[theme];

  // Whole-site barrel roll / upside-down Easter egg -- see
  // useBarrelRollEasterEgg above. Entirely separate from the existing
  // triggerSurprise/SurprisePanel system below (the round "Click" dial
  // and its random challenge/fact/palette reveal); this only wires into
  // the "Surprise Me" pill button (see its onClick further down).
  const barrelRoll = useBarrelRollEasterEgg(reduced);

  const stageRef = useRef(null);
  const sectionInView = useSectionInView(stageRef);
  const heroRef = useRef(null);
  const posLabelRef = useRef(null);
  const [bursts, fireBurst] = useBurst();

  const registerInteraction = useCallback((gameId) => {
    setPlayed((n) => {
      if (n === 0) {
        setJustUnlocked(true);
        setTimeout(() => setJustUnlocked(false), 2200);
      }
      return n + 1;
    });
    if (gameId) setDiscovered((d) => (d.includes(gameId) ? d : [...d, gameId]));
  }, []);

  const onHeroMove = useCallback(
    (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      if (!reduced && !isTouch) {
        const mx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const my = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        heroRef.current.style.setProperty("--mx", mx.toFixed(3));
        heroRef.current.style.setProperty("--my", my.toFixed(3));
      }
      if (posLabelRef.current) {
        posLabelRef.current.textContent = `x:${String(Math.max(0, Math.round(e.clientX - rect.left))).padStart(3, "0")} y:${String(Math.max(0, Math.round(e.clientY - rect.top))).padStart(3, "0")}`;
      }
    },
    [reduced, isTouch]
  );

  const onHeroClick = useCallback(
    (e) => {
      if (!heroRef.current || reduced) return;
      const rect = heroRef.current.getBoundingClientRect();
      const id = Date.now() + Math.random();
      setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
      setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 550);
    },
    [reduced]
  );

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let t;
    const schedule = () => {
      const delay = 9000 + Math.random() * 8000;
      t = setTimeout(() => {
        if (!cancelled && document.visibilityState === "visible") setCodeSetIdx((i) => (i + 1) % CODE_LINE_SETS.length);
        if (!cancelled) schedule();
      }, delay);
    };
    schedule();
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [reduced]);

  const triggerSurprise = useCallback(() => {
    let idx = Math.floor(Math.random() * SURPRISES.length);
    if (idx === lastIndex.current) idx = (idx + 1) % SURPRISES.length;
    lastIndex.current = idx;
    const picked = SURPRISES[idx];

    setPressed(true);
    fireBurst(c.orange, c.purple, 14);
    setTimeout(() => setPressed(false), 200);
    registerInteraction();
    if (soundOn) playBlip(picked.type === "chaos" ? 300 : 520);

    setSurpriseStage("detecting");
    setTimeout(() => setSurpriseStage("analyzing"), 240);
    setTimeout(() => {
      setSurpriseStage("unlocked");
      setPulse(true);
      setTimeout(() => setPulse(false), 400);
    }, 480);
    setTimeout(() => {
      setSurpriseStage("idle");
      if (picked.type === "chaos") {
        setChaos(true);
        setTimeout(() => setChaos(false), 700);
      }
      setSurprise({ ...picked, seed: Math.random(), key: Date.now() });
    }, 720);
  }, [c, fireBurst, registerInteraction, soundOn]);

  const launchFireworks = useCallback(() => {
    clearTimeout(fireworksTimeoutRef.current);
    setFireworksGlow(true);
    // Re-trigger even if a show is already running: bump a fresh key by
    // toggling off then on so the effect inside FireworksOverlay restarts
    // with new randomized rockets rather than stacking indefinitely.
    setFireworksActive(false);
    requestAnimationFrame(() => setFireworksActive(true));
    if (soundOn) playBlip(660, 0.15);
    fireworksTimeoutRef.current = setTimeout(() => setFireworksGlow(false), reduced ? 900 : 1400);
  }, [soundOn, reduced]);

  useEffect(() => () => clearTimeout(fireworksTimeoutRef.current), []);

  const onLogoClick = () => {
    setLogoClicks((n) => {
      const next = n + 1;
      if (next === 5) {
        fireBurst(c.orange, c.purple, 20);
        if (soundOn) playBlip(700, 0.3);
        setSecretToast(true);
        setTimeout(() => setSecretToast(false), 2800);
        setTimeout(() => {
          setSurprise({ type: "quote", label: "Secret Found", text: "Experiment #000 — you weren’t supposed to find this. Nice.", key: Date.now() });
        }, 350);
      }
      return next;
    });
  };

  const anim = (name, delay = 0, dur = 0.45) => (reduced ? {} : { animation: booted ? `${name} ${dur}s cubic-bezier(0.16,1,0.3,1) ${delay}s both` : "none" });

  const codeLines = CODE_LINE_SETS[codeSetIdx];
  const surpriseCaption =
    surpriseStage === "detecting" ? "GAMEPLAY DATA DETECTED" : surpriseStage === "analyzing" ? "ANALYZING CURIOSITY…" : surpriseStage === "unlocked" ? "SURPRISE UNLOCKED" : "CLICK TO GET A SURPRISE";

  return (
    <section
      className="playground-section"
      id={id}
      data-theme={theme}
      aria-label="Playground"
      ref={stageRef}
      style={{ background: c.bg, color: c.text, fontFamily: FONT_BODY, minHeight: "100vh", transition: "background-color 0.4s ease, color 0.4s ease", cursor: isTouch ? "auto" : "none", overflowX: "hidden", position: "relative" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        .playground-section, .playground-section * { box-sizing: border-box; }
        .playground-section button:not(.nav-pill button) { font: inherit; }
        .playground-section [data-cursor], .playground-section button:not(.nav-pill button), .playground-section a { touch-action: manipulation; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes gradientPan { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
        @keyframes pulseDot { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
        @keyframes burstOut { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; } }
        @keyframes surprisePop { 0% { opacity: 0; transform: scale(0.9) translateY(6px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes letterPop { 0% { opacity: 0; transform: scale(0.7); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes spinGentle { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes blinkCursor { 50% { opacity: 0; } }
        @keyframes rippleExpand { from { transform: translate(-50%,-50%) scale(0); opacity: 0.5; } to { transform: translate(-50%,-50%) scale(1); opacity: 0; } }
        @keyframes chaosJitter {
          0% { transform: translate(0,0) rotate(0deg); }
          25% { transform: translate(2px,-2px) rotate(-0.6deg); }
          50% { transform: translate(-2px,1px) rotate(0.5deg); }
          75% { transform: translate(1px,2px) rotate(-0.3deg); }
          100% { transform: translate(0,0) rotate(0deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .playground-section, .playground-section *, .playground-section *::before, .playground-section *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
        }

        /* ---- Whole-site barrel roll / upside-down Easter egg ----
           Targets #root directly (see useBarrelRollEasterEgg above),
           not anything scoped to .playground-section, since the whole
           page needs to rotate as one surface. transform-origin stays
           centered on the viewport so the roll reads as the page
           spinning in place rather than swinging off-axis. Every
           keyframe below both starts AND ends its rotation at a clean
           multiple of 360deg (0deg visually) so repeated triggers never
           accumulate into an unexpected starting orientation. */
        #root.br-rolling {
          transform-origin: 50% 50%;
          /* 2.4s, up from the original 1s -- slow enough to clearly see
             the full spin, with a cinematic ease-in/ease-out curve
             rather than a linear, robotic spin. */
          animation: brBarrelRoll 2.4s cubic-bezier(0.45, 0, 0.15, 1) both;
        }
        /* Mobile visibility is fixed at the JS layer, not here: see
           setViewportOrigin above. The real cause of the barrel roll
           reading as a blank flash on phones wasn't the rotation itself
           but transform-origin defaulting to 50% 50% of the ENTIRE
           document (#root can be 10,000+px tall), which pivots the
           spin around the document's vertical midpoint instead of
           wherever the user is actually scrolled to -- on a tall mobile
           page that swings the visible viewport far off-screen mid-spin.
           Anchoring the origin to the current viewport's center before
           each trigger keeps the user's actual view point fixed at the
           spin's pivot, so the rotation stays visible and legible at
           every breakpoint without needing a separate mobile-only
           keyframe or scale hack. */
        #root.br-flipping-down {
          transform-origin: 50% 50%;
          animation: brFlipDown 0.9s cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }
        #root.br-flipped {
          transform-origin: 50% 50%;
          transform: rotate(180deg);
        }
        #root.br-flipping-up {
          transform-origin: 50% 50%;
          animation: brFlipUp 0.9s cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }
        @keyframes brBarrelRoll {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes brFlipDown {
          from { transform: rotate(0deg); }
          to { transform: rotate(180deg); }
        }
        @keyframes brFlipUp {
          from { transform: rotate(180deg); }
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          #root.br-rolling, #root.br-flipping-down, #root.br-flipping-up, #root.br-flipped {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {!booted && <BootOverlay c={c} reduced={reduced} onDone={() => setBooted(true)} />}

      <FireworksOverlay active={fireworksActive} reduced={reduced} theme={theme} onDone={() => setFireworksActive(false)} />

      {/* Dot-grid background texture, scoped to this section (absolute,
          not fixed) -- Playground is now a permanent section inside one
          continuous scroll (see SceneTransition.jsx) alongside every
          other section, all mounted at once, so a `fixed` layer here
          would cover the whole viewport for as long as the page is
          open, painting over every other section's content whenever
          this one is later in DOM order (see the identical fix in
          AboutPage.css/.about-bg and ContactPage.css/.contact-bg for
          the full explanation). `absolute` against this section's own
          `position: relative` root (see the root <section> below) keeps
          it exactly the height of Playground's own content instead. */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0, backgroundImage: `radial-gradient(${c.textFaint} 1px, transparent 1px)`, backgroundSize: "24px 24px", opacity: (theme === "dark" ? 0.055 : 0.065) * ((pulse || fireworksGlow) ? 1.8 : 1), transition: "opacity 0.35s ease" }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <CustomCursor c={c} isTouch={isTouch} reduced={reduced} active={sectionInView} />

        {/* ================= HERO (compact) ================= */}
        <section ref={heroRef} onMouseMove={onHeroMove} onClick={onHeroClick} className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-8 sm:pt-10 pb-4" style={{ "--mx": 0, "--my": 0 }}>
          {ripples.map((r) => (
            <span key={r.id} className="absolute rounded-full pointer-events-none" style={{ left: r.x, top: r.y, width: 120, height: 120, border: `1px solid ${c.orange}`, animation: "rippleExpand 0.55s ease-out both", zIndex: 5 }} />
          ))}

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            {/* left column */}
            <div className="relative z-10">
              {/* The eyebrow dot doubles as the relocated hidden easter
                  egg trigger (previously the GD logo in the removed
                  header -- see the NAVBAR comment above). Same
                  onLogoClick / logoClicks / secretToast state and
                  reward, just a different, still-unobtrusive home for
                  it: nothing about the click target announces itself as
                  interactive, matching "you'll know it when you find
                  it" from the original README. */}
              <div className="flex items-center gap-2 mb-4 relative" style={anim("fadeUp", 0)}>
                <button
                  onClick={onLogoClick}
                  data-cursor="CLICK"
                  className="rounded-full"
                  style={{ width: 6, height: 6, background: c.orange, border: "none", padding: 0, cursor: isTouch ? "pointer" : undefined }}
                  aria-label="Playground"
                />
                <span style={{ fontFamily: FONT_MONO, fontSize: 12.5, letterSpacing: "0.14em", color: c.orange }}>PLAYGROUND</span>
                {secretToast && (
                  <span className="absolute -bottom-6 left-0 whitespace-nowrap rounded-full px-2.5 py-1" style={{ fontFamily: FONT_MONO, fontSize: 9.5, letterSpacing: "0.04em", color: c.orange, background: c.orangeSoft, animation: "fadeUp 0.3s ease both" }}>
                    SECRET EXPERIMENT UNLOCKED
                  </span>
                )}
              </div>

              <h1 className="leading-[0.98] mb-4" style={{ fontFamily: FONT_DISPLAY }}>
                <span className="block" style={{ fontSize: "clamp(2.1rem, 5vw, 3.4rem)", fontWeight: 800, ...anim("fadeUp", 0.05) }}>
                  Thinking.
                </span>
                <span
                  className="block"
                  style={{
                    fontSize: "clamp(2.1rem, 5vw, 3.4rem)",
                    fontWeight: 800,
                    backgroundImage: `linear-gradient(90deg, ${c.orange}, ${c.purple}, ${c.orange})`,
                    backgroundSize: "200% auto",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    animationName: reduced ? undefined : booted ? "fadeUp, gradientPan" : "none",
                    animationDuration: reduced ? undefined : "0.45s, 5s",
                    animationTimingFunction: reduced ? undefined : "cubic-bezier(0.16,1,0.3,1), linear",
                    animationDelay: reduced ? undefined : "0.1s, 0.6s",
                    animationIterationCount: reduced ? undefined : "1, infinite",
                    animationFillMode: reduced ? undefined : "both, none",
                  }}
                >
                  Experimenting.
                </span>
                <span className="block" style={{ fontSize: "clamp(2.1rem, 5vw, 3.4rem)", fontWeight: 800, ...anim("fadeUp", 0.15) }}>
                  Creating without limits.
                </span>
              </h1>

              <p className="max-w-md mb-5 text-sm sm:text-base leading-relaxed" style={{ fontFamily: FONT_BODY, color: c.textMuted, ...anim("fadeUp", 0.22) }}>
                A tiny creative arcade hidden inside my portfolio. Nothing here is random — everything is an experiment.
              </p>

              <div style={anim("fadeUp", 0.28)}>
                <StatusStrip c={c} played={played} discoveries={discovered.length} total={GAMES.length} justUnlocked={justUnlocked} />
              </div>
            </div>

            {/* right column: compact interactive core */}
            <div className="relative h-[230px] sm:h-[260px]" style={anim("fadeIn", 0.3, 0.5)}>
              <div className="absolute top-0 left-0 flex items-center gap-1.5" style={{ fontFamily: FONT_MONO, fontSize: 11, lineHeight: 1.8, color: c.textFaint, transform: "translate(calc(var(--mx, 0) * -4px), calc(var(--my, 0) * -4px))" }}>
                <Code2 size={11} style={{ color: c.orange, opacity: 0.7 }} />
                <span>
                  {codeLines[0]}
                  <span style={{ color: c.orange }}>{codeLines[1]}</span> / {codeLines[2]}
                  <span style={{ color: c.purple }}>{codeLines[3]}</span>
                </span>
              </div>

              {!isTouch && (
                <div ref={posLabelRef} className="absolute top-0 right-0 hidden sm:block" style={{ fontFamily: FONT_MONO, fontSize: 10, color: c.textFaint }}>
                  x:000 y:000
                </div>
              )}

              <div className="absolute rounded-full" style={{ width: 160, height: 160, top: "14%", right: "14%", background: c.purple, opacity: c.glow * (pulse ? 1.6 : 1), filter: "blur(40px)", transform: "translate(calc(var(--mx, 0) * 10px), calc(var(--my, 0) * 10px))", transition: "opacity 0.35s ease" }} />
              <div className="absolute rounded-full" style={{ width: 130, height: 130, bottom: "10%", left: "4%", background: c.orange, opacity: (c.glow + 0.03) * (pulse ? 1.6 : 1), filter: "blur(36px)", transform: "translate(calc(var(--mx, 0) * -8px), calc(var(--my, 0) * -8px))", transition: "opacity 0.35s ease" }} />

              <svg viewBox="0 0 300 200" className="absolute top-2 right-0 w-[80%] h-[60%] hidden sm:block" style={{ transform: "translate(calc(var(--mx, 0) * 6px), calc(var(--my, 0) * 6px))" }}>
                <path d="M0,60 C80,10 110,110 180,50 C220,15 250,90 300,40" fill="none" stroke={c.border} strokeWidth="1.4" />
              </svg>

              <button
                data-cursor="CLICK"
                onClick={triggerSurprise}
                className="absolute rounded-full flex items-center justify-center"
                style={{
                  width: 118,
                  height: 118,
                  left: "50%",
                  top: "44%",
                  transform: `translate(-50%, -50%) scale(${pressed ? 0.9 : 1}) translate(calc(var(--mx, 0) * 5px), calc(var(--my, 0) * 5px))`,
                  background: c.text,
                  color: c.bg,
                  boxShadow: `0 0 0 1px ${c.border}, 0 0 44px ${chaos ? c.purpleSoft : c.orangeSoft}, 0 20px 44px -18px ${theme === "dark" ? "rgba(0,0,0,0.7)" : "rgba(23,19,15,0.32)"}`,
                  transition: "transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease",
                  animation: chaos && !reduced ? "chaosJitter 0.35s ease-in-out infinite" : "none",
                }}
                aria-label="Click to get a surprise"
              >
                <span className="absolute rounded-full" style={{ inset: -14, border: `1px dashed ${c.border}` }} />
                <span className="flex flex-col items-center gap-1">
                  <span style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: 13.5 }}>Click</span>
                  <MousePointer2 size={12} style={{ opacity: 0.6 }} />
                </span>
              </button>
              <p key={surpriseCaption} className="absolute text-center" style={{ left: "50%", top: "calc(44% + 76px)", transform: "translateX(-50%)", fontFamily: FONT_MONO, fontSize: 9.5, letterSpacing: "0.06em", color: surpriseStage === "unlocked" ? c.orange : c.textFaint, width: 170, animation: "fadeIn 0.2s ease both" }}>
                {surpriseCaption}
              </p>

              <BurstLayer bursts={bursts} />
              <SurprisePanel surprise={surprise} c={c} isTouch={isTouch} onAgain={triggerSurprise} onClose={() => setSurprise(null)} />

              {[
                { top: "4%", left: "40%", size: 5, color: c.purple },
                { top: "80%", left: "62%", size: 5, color: c.orange },
                { top: "58%", left: "6%", size: 4, color: c.textFaint },
              ].map((d, i) => (
                <span key={i} className="absolute rounded-full hidden sm:block" style={{ top: d.top, left: d.left, width: d.size, height: d.size, background: d.color, transform: "translate(calc(var(--mx, 0) * 8px), calc(var(--my, 0) * 8px))" }} />
              ))}
            </div>
          </div>
        </section>

        {/* ================= ARCADE GRID ================= */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-6 sm:py-8">
          <div className="flex items-center gap-2 mb-3">
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: "0.1em", color: c.textFaint }}>SIX TINY EXPERIMENTS</span>
            <span style={{ width: 20, height: 1, background: c.border }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {GAMES.map((g, i) => (
              <div key={g.id} style={anim("fadeUp", 0.03 * i, 0.35)}>
                <GameCard meta={g} c={c} reduced={reduced} isTouch={isTouch} onInteract={registerInteraction} onLaunchFireworks={launchFireworks} />
              </div>
            ))}
          </div>
        </section>

        {/* ================= SURPRISE STRIP ================= */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-10 sm:pb-14">
          <div className="relative rounded-2xl px-5 sm:px-8 py-5 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
            <p className="text-base sm:text-lg text-center sm:text-left" style={{ fontFamily: FONT_DISPLAY, fontWeight: 600 }}>
              Curious mind. Playful heart.{" "}
              <span style={{ backgroundImage: `linear-gradient(90deg, ${c.orange}, ${c.purple})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                Infinite possibilities.
              </span>
            </p>
            <button data-cursor="CLICK" onClick={barrelRoll.triggerBarrelRoll} className="relative inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium shrink-0 transition-transform active:scale-95" style={{ fontFamily: FONT_BODY, background: c.text, color: c.bg }}>
              Surprise Me
              <Dice5 size={15} />
            </button>
          </div>
        </section>

        {/* Whole-site barrel roll popup -- fixed/centered on the
            viewport (see BarrelRollPopup above), so it renders correctly
            no matter where in the page this section itself sits. */}
        <BarrelRollPopup
          show={barrelRoll.showFirstPopup}
          c={c}
          isTouch={isTouch}
          onNext={barrelRoll.triggerUpsideDown}
          onClose={barrelRoll.dismissFirstPopup}
        />
      </div>
    </section>
  );
}
