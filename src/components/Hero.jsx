import { useEffect, useState, useCallback, useRef } from 'react';
import Header from './Header.jsx';
import FeatureCards from './FeatureCards.jsx';
import HoverWord from './HoverWord.jsx';
import './Hero.css';

import background from '../assets/hero/background.png';
import backgroundDark from '../assets/hero/background-dark.png';
import backgroundMobile from '../assets/hero/mobile-bg-light.png';
import backgroundMobileDark from '../assets/hero/mobile-bg-dark.png';
import person from '../assets/hero/person.png';
import paperPlane from '../assets/hero/paper-plane.png';
import noteUserFlow from '../assets/hero/note-userflow-combined.png';
import noteIdeas from '../assets/hero/note-ideas.png';
import noteUiComponents from '../assets/hero/note-uicomponents.png';
import notePrototype from '../assets/hero/note-prototype.png';
import noteDesignSystem from '../assets/hero/note-designsystem.png';
import teaBooks from '../assets/hero/tea-books.png';
import teaBooksDark from '../assets/hero/tea-books-dark.png';
import plant from '../assets/hero/plant.png';
import moonMobile from '../assets/hero/moon-mobile.png';
import penCursorImg from '../assets/hero/pen-cursor.png';

// Default clip-path origin (top-right, near the theme toggle) used until
// the very first toggle click measures the control's real position.
const DEFAULT_ORIGIN = { x: '92%', y: '8%' };

const KEYWORDS = ['SHAPES', 'BUILDS', 'PLANS', 'CREATES', 'CRAFTS', 'SOLVES', 'IMPACTS'];
const KEYWORD_INTERVAL = 2600;

// Loosely-scattered flock of tiny distant birds. Each one is a soft,
// curved gull-mark (two shallow bezier humps) rather than a straight-line
// chevron, and every bird gets its own hand-tuned position/scale/rotation
// so the group reads as an organic flock instead of one shape repeated
// identically — no two birds in a flock share the same silhouette.
const BIRD_LAYOUTS = [
  [
    { x: 6, y: 14, s: 1, r: -6 },
    { x: 30, y: 4, s: 0.8, r: 4 },
    { x: 52, y: 20, s: 0.62, r: -8 },
    { x: 76, y: 9, s: 0.9, r: 6 },
    { x: 100, y: 24, s: 0.5, r: -3 },
  ],
  [
    { x: 4, y: 6, s: 0.72, r: 5 },
    { x: 24, y: 22, s: 0.95, r: -5 },
    { x: 48, y: 10, s: 0.58, r: 8 },
    { x: 68, y: 26, s: 0.8, r: -4 },
  ],
  [
    { x: 8, y: 18, s: 0.6, r: -7 },
    { x: 26, y: 6, s: 0.85, r: 3 },
    { x: 46, y: 24, s: 0.5, r: -5 },
  ],
];

function BirdFlock({ className, layout }) {
  const birds = BIRD_LAYOUTS[layout % BIRD_LAYOUTS.length];
  return (
    <svg className={`layer birds ${className}`} viewBox="0 0 160 70" width="160" aria-hidden="true">
      <g fill="none" stroke="#2b2620" strokeLinecap="round">
        {birds.map((b, i) => (
          // Static hand-tuned position/scale/rotation stays on this outer
          // <g> (unchanged from before); the wing-flap animation below is
          // applied only to the inner path, on its own per-bird delay, so
          // each bird's flap phase is offset and the flock doesn't beat
          // its wings in unison.
          <g key={i} transform={`translate(${b.x} ${b.y}) rotate(${b.r}) scale(${b.s})`}>
            <path
              className="bird-wing"
              d="M0,6 C2,1 4,1 6,6 C8,1 10,1 12,6"
              strokeWidth={2.5 * b.s}
              opacity={0.55 + 0.35 * b.s}
              style={{ animationDelay: `${(i * 0.11).toFixed(2)}s` }}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

// Small cinematic meteor streak: a soft gradient trail with a bright head,
// used only in Dark Mode. Rendered by <ShootingStarField> below, which
// spawns/removes instances of this at randomized times with randomized
// position, trajectory, speed, size and brightness — so no two meteors on
// screen are ever identical copies of each other.
//
// The whole meteor — glow, bright head, and its long tapering trail — is
// drawn as one coherent shape inside ONE <svg>, transformed together by a
// single CSS animation (see @keyframes shootMeteor in Hero.css). Because
// there is only ever one element and one transform, the head and trail
// can never drift apart, rotate independently, or fall out of sync. The
// trail is a tapering triangle (wide and bright at the head, narrowing to
// a fine point at the far end) rather than a uniform-width line, so it
// reads as light stretched behind a fast-moving object.
//
// The <path>/<circle> below draw that tail at ONE fixed local angle
// (head -> tail tip). But individual meteors fly at many different
// angles — dx/dy are randomized per instance in ShootingStarField, so a
// shallow flight and a steep one both happen — so the artwork's fixed
// angle alone doesn't match most meteors' real trajectory. We correct
// for that by rotating the WHOLE shape, head and tail together, around
// the head as the pivot (see the .shooting-star transform-origin in
// Hero.css, set to the head's position). The rotation applied is simply
// "this meteor's own travel angle, reversed, minus the artwork's fixed
// angle" — computed fresh per instance from the exact same two points
// (METEOR_HEAD/METEOR_TAIL_TIP) used to draw the path below, so the two
// can never silently drift out of sync. That rotation is passed down as
// the --m-rot custom property and applied inside the SAME shared
// @keyframes as the translate (see shootMeteor in Hero.css) — never as
// a separate animation — so at every instant mid-flight the tail is
// guaranteed to point exactly opposite this meteor's own direction of
// travel, no matter how shallow or steep that particular flight is.
const METEOR_HEAD = { x: 18, y: 43 };
const METEOR_TAIL_TIP = { x: 120, y: 5 };
const TAIL_DESIGN_ANGLE = Math.atan2(
  METEOR_TAIL_TIP.y - METEOR_HEAD.y,
  METEOR_TAIL_TIP.x - METEOR_HEAD.x
);

function ShootingStar({ id, top, left, width, dx, dy, duration, peak }) {
  const gradId = `starTrail-${id}`;
  const glowId = `${gradId}-glow`;

  // This instance's real direction of travel, reversed (the tail always
  // points backward, opposite the velocity vector), minus the angle the
  // artwork is already drawn at — i.e. exactly how far to turn the
  // shape so the drawn tail lines up with this meteor's own trajectory.
  const travelAngle = Math.atan2(dy, dx);
  const rotationDeg =
    (((travelAngle + Math.PI - TAIL_DESIGN_ANGLE) * 180) / Math.PI).toFixed(2);

  return (
    <svg
      className="layer shooting-star"
      viewBox="0 0 130 50"
      width={width}
      aria-hidden="true"
      style={{
        top: `${top}%`,
        left: `${left}%`,
        '--m-dx': `${dx}cqw`,
        '--m-dy': `${dy}cqw`,
        '--m-rot': `${rotationDeg}deg`,
        '--m-peak': peak,
        animationDuration: `${duration}s`,
      }}
    >
      <defs>
        <linearGradient id={gradId} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#eaf1ff" stopOpacity="0" />
          <stop offset="45%" stopColor="#eaf1ff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
        </linearGradient>
        <filter id={glowId} x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="2.6" />
        </filter>
      </defs>
      <path d="M18.6,44.5 L17.4,41.5 L120,5 Z" fill={`url(#${gradId})`} />
      <circle cx="18" cy="43" r="4" fill="#eaf1ff" opacity="0.5" filter={`url(#${glowId})`} />
      <circle cx="18" cy="43" r="2" fill="#ffffff" />
    </svg>
  );
}

// Ranges a spawned meteor's random parameters are drawn from. Desktop
// stars start in the open upper-right sky and travel down-left; mobile
// reuses the one genuinely open strip identified for the old fixed
// layout (top ~13.8%–16.5%, left under ~40% — see the comment above the
// equivalent mobile CSS this replaces) so meteors never launch from
// behind the header or on top of the mobile moon crop. Both desktop and
// mobile ranges were checked against the actual moon position in
// background-dark.png / the moon-mobile crop respectively (closest
// approach comfortably clears the moon's radius across thousands of
// random samples) so "moon remains visible" holds regardless of which
// random values land.
const SPAWN_RANGES = {
  desktop: { leftMin: 45, leftMax: 75, topMin: 2, topMax: 18, widthMin: 46, widthMax: 88 },
  mobile: { leftMin: 3, leftMax: 36, topMin: 13.8, topMax: 16.5, widthMin: 24, widthMax: 44 },
};

// Drives a natural, non-mechanical meteor shower: a random number of
// stars (mostly 1, sometimes 2, occasionally 3) fired in loose clusters
// separated by randomized quiet gaps, each with its own randomized start
// position, trajectory, speed, size and brightness. Every individual
// meteor still travels in one consistent straight line for its whole
// flight (only the per-instance CSS custom properties differ — the
// shared keyframes themselves never change), and always down-left, per
// the fixed direction requirement.
function ShootingStarField({ active }) {
  const [meteors, setMeteors] = useState([]);
  const timeoutsRef = useRef([]);
  const idRef = useRef(0);
  const isMobileRef = useRef(typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const update = () => { isMobileRef.current = mq.matches; };
    update();
    mq.addEventListener ? mq.addEventListener('change', update) : mq.addListener(update);
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', update) : mq.removeListener(update);
    };
  }, []);

  useEffect(() => {
    const clearAll = () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };

    if (!active) {
      clearAll();
      setMeteors([]);
      return undefined;
    }

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return undefined;

    let cancelled = false;

    const addTimeout = (fn, ms) => {
      const timeoutId = setTimeout(() => {
        timeoutsRef.current = timeoutsRef.current.filter((t) => t !== timeoutId);
        if (!cancelled) fn();
      }, ms);
      timeoutsRef.current.push(timeoutId);
      return timeoutId;
    };

    const spawnOne = (extraDelay) => {
      addTimeout(() => {
        const r = isMobileRef.current ? SPAWN_RANGES.mobile : SPAWN_RANGES.desktop;
        const meteorId = idRef.current++;
        const top = r.topMin + Math.random() * (r.topMax - r.topMin);
        const left = r.leftMin + Math.random() * (r.leftMax - r.leftMin);
        const dx = -(14 + Math.random() * 13); // -14 to -27 cqw (leftward)
        const dy = 15 + Math.random() * 15; // 15 to 30 cqw (downward)
        const duration = 0.85 + Math.random() * 0.85; // 0.85s–1.7s, "keep it fast"
        const width = r.widthMin + Math.random() * (r.widthMax - r.widthMin);
        const peak = 0.78 + Math.random() * 0.22; // brightness variation

        const meteor = { id: meteorId, top, left, dx, dy, duration, width, peak };
        setMeteors((prev) => [...prev, meteor]);

        addTimeout(() => {
          setMeteors((prev) => prev.filter((m) => m.id !== meteorId));
        }, duration * 1000 + 150);
      }, extraDelay);
    };

    // A "burst" is 1–3 meteors (weighted toward 1) fired with a small
    // random stagger so a cluster never appears in perfect unison, then
    // schedules the next burst after a randomized quiet gap. Because the
    // gap itself is random (not a fixed interval), the sky sometimes
    // goes quiet for a while and sometimes fires two clusters in quick
    // succession — an organic rhythm rather than "one every N seconds".
    const burst = () => {
      const roll = Math.random();
      const count = roll < 0.55 ? 1 : roll < 0.85 ? 2 : 3;
      for (let i = 0; i < count; i++) {
        spawnOne(Math.random() * 320);
      }
      const gap = 1100 + Math.random() * 4600;
      addTimeout(burst, gap);
    };

    addTimeout(burst, 500 + Math.random() * 1500);

    return () => {
      cancelled = true;
      clearAll();
    };
  }, [active]);

  return meteors.map((m) => <ShootingStar key={m.id} {...m} />);
}

// `dark` now lives in App (see App.jsx) so the new cloud-transition and
// Intro section — which need to know the active theme too — share the
// exact same source of truth instead of each guessing independently.
// Hero stays the one place that OWNS the toggle interaction (measuring
// the control's on-screen origin for the circular reveal); it just
// reports flips upward via `onToggleTheme` instead of keeping its own
// boolean. Everything Hero already renders is unchanged.
export default function Hero({ dark, onToggleTheme, onNavigate, onNavigateToWork }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [penCursor, setPenCursor] = useState({ active: false, x: 0, y: 0 });
  const stageRef = useRef(null);

  const handlePenMove = useCallback((e) => {
    setPenCursor({ active: true, x: e.clientX, y: e.clientY });
  }, []);
  const handlePenLeave = useCallback(() => {
    setPenCursor((c) => ({ ...c, active: false }));
  }, []);

  // Measures where the toggle control sits (relative to the hero stage)
  // so the magical day/night reveal can expand outward from that exact
  // point, then flips the theme.
  const handleToggleTheme = useCallback((e) => {
    const stage = stageRef.current;
    const btn = e.currentTarget;
    if (stage && btn) {
      const stageRect = stage.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      const originX = ((btnRect.left + btnRect.width / 2 - stageRect.left) / stageRect.width) * 100;
      const originY = ((btnRect.top + btnRect.height / 2 - stageRect.top) / stageRect.height) * 100;
      stage.style.setProperty('--theme-origin-x', `${originX}%`);
      stage.style.setProperty('--theme-origin-y', `${originY}%`);
    }
    onToggleTheme();
  }, [onToggleTheme]);

  useEffect(() => {
    const id = setInterval(() => {
      setWordIndex((i) => (i + 1) % KEYWORDS.length);
    }, KEYWORD_INTERVAL);
    return () => clearInterval(id);
  }, []);

  const keyword = KEYWORDS[wordIndex];

  return (
    <section
      className="hero-stage"
      data-theme={dark ? 'dark' : 'light'}
      ref={stageRef}
      style={{ '--theme-origin-x': DEFAULT_ORIGIN.x, '--theme-origin-y': DEFAULT_ORIGIN.y }}
      aria-label="Introduction"
    >
      {/* Layer 0: background photo — day layer always present; night layer
          sits above it and is revealed via an expanding circular mask
          that originates at the toggle when Dark Mode is activated. */}
      <img className="layer bg-photo bg-photo-day" src={background} alt="" role="presentation" />
      <img className="layer bg-photo bg-photo-night" src={backgroundDark} alt="" role="presentation" />

      {/* Mobile-only background photos (dedicated portrait-oriented assets,
          composed specifically for the tall phone viewport — distinct from
          the desktop 16:9 photos above, which stay untouched on desktop).
          Hidden entirely on desktop via CSS; swapped in only at the mobile
          breakpoint so the desktop composition is never affected. */}
      <img className="layer bg-photo-mobile bg-photo-mobile-day" src={backgroundMobile} alt="" role="presentation" />
      <img className="layer bg-photo-mobile bg-photo-mobile-night" src={backgroundMobileDark} alt="" role="presentation" />
      {/* Mobile Dark Mode only: the reference composition's moon,
          cropped from the mobile night photo as its own soft-edged
          layer so it can sit in the one open patch of sky above the
          portrait (the full-bleed night photo's own moon otherwise
          lands directly behind the portrait/notes cluster at this
          layout's proportions and gets hidden). Desktop is untouched —
          this layer only renders/positions via the mobile media query. */}
      <img className="layer moon-mobile" src={moonMobile} alt="" role="presentation" />

      {/* Magical glow that sweeps outward from the toggle as night arrives */}
      <div className="theme-glow" aria-hidden="true" />

      {/* Layer 0.5: distant birds, flying across at staggered intervals.
          Light Mode only (see .birds rules in Hero.css) — hidden entirely
          in Dark Mode, where the shooting stars below take over instead. */}
      <BirdFlock className="birds-1" layout={0} />
      <BirdFlock className="birds-2" layout={1} />
      <BirdFlock className="birds-3" layout={2} />

      {/* Dark Mode only: a randomized meteor shower — a variable number
          of shooting stars (mostly one, sometimes a loose cluster of 2–3)
          fire at randomized moments with their own position, trajectory,
          speed, size and brightness, so it never falls into a
          predictable rhythm or exact repeat. See ShootingStarField. */}
      <ShootingStarField active={dark} />

      {/* Header (brand + availability pill + theme toggle) is plain
          position: absolute against .hero-stage (its positioned
          ancestor -- see .site-header in Header.css), the same as every
          other Hero layer. .hero-stage itself is position: sticky for
          the Hero -> Intro transition (see .hero-stage in Hero.css) and
          releases back into normal flow once that transition ends, so
          Header now simply travels with Hero: pinned for exactly as
          long as Hero is pinned, then scrolling away with it -- never
          fixed to the viewport independently of Home, so it can't keep
          following the user down through Work, Creative Lab, About,
          Playground, or Contact. The one persistent PrimaryNav/MobileNav
          (see App.jsx) already covers navigation for every section,
          Home included, on its own. */}
      <Header
        dark={dark}
        onToggleTheme={handleToggleTheme}
      />

      {/* ================================================================
          Mobile-only composition wrapper.
          On desktop this wrapper has no styling (position: static) so it
          is completely transparent to layout — every child below still
          positions absolutely against .hero-stage exactly as before.
          On mobile (<=900px) it becomes a positioned, fixed-aspect-ratio
          box so the whole hero composition scales together as one unit
          across phone widths without any element drifting or clipping.
      ================================================================= */}
      <div className="mobile-hero-visual">
        {/* Left decorative sketch note — single combined original asset
            (User Flow diagram + phone wireframe sketch on one torn page),
            rendered as one element so it is never split or cropped. */}
        <img
          className="layer note note-userflow-combined"
          src={noteUserFlow}
          alt="Hand-drawn UX notes sketching a user flow diagram and mobile wireframe"
        />

        {/* Headline block */}
        <div className="hero-copy">
          <p className="eyebrow">
            Hi, I&rsquo;m Gourab <span className="wave" aria-hidden="true">👋</span>
          </p>
          <h1
            className="headline"
            onMouseMove={handlePenMove}
            onMouseLeave={handlePenLeave}
          >
            <span className="line">
              <HoverWord text="DESIGNER" />
            </span>
            <span className="line">
              <HoverWord text="WHO" />
            </span>
            <span className="line accent">
              <span className="keyword-swap" key={keyword}>
                <HoverWord text={keyword} />
              </span>
            </span>
          </h1>
          <svg className="underline-squiggle" width="210" height="18" viewBox="0 0 210 18" fill="none" aria-hidden="true">
            <path
              d="M3 10c8-7 16-7 24 0s16 7 24 0 16-7 24 0 16 7 24 0 16-7 24 0 16 7 24 0 14-6 21-2"
              stroke="#F2941E"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <p className="sub-copy">
            I design digital experiences that are
            <br />
            meaningful, usable and impactful.
          </p>
          <a className="cta-button" href="#work">
            <span>Explore my work</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M7 17 17 7M17 7H9M17 7v8"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        {/* Paper plane + dashed flight path */}
        <img className="layer paper-plane" src={paperPlane} alt="" role="presentation" />

        {/* Portrait */}
        <img className="layer portrait" src={person} alt="Portrait of Gourab Dhara smiling, wearing a cream t-shirt" />

        {/* Sticky notes near portrait */}
        <img className="layer note note-ideas" src={noteIdeas} alt="Sticky note reading ideas, code, design, impact" />
        <img className="layer note note-ui" src={noteUiComponents} alt="Torn note sketching UI components" />
        <img className="layer note note-prototype" src={notePrototype} alt="Sticky note reading prototype with a wireframe sketch" />
        <img className="layer note note-designsystem" src={noteDesignSystem} alt="Pinned note reading design system" />

        {/* Foreground: books + mug — night asset reveals with the same
            circular mask as the background, staying visually locked to the
            existing composition/position of the day version. */}
        <div className="layer tea-books-wrap">
          <img
            className="tea-books-img tea-books-day"
            src={teaBooks}
            alt="Stack of UX books topped with a steaming mug that reads let's build something great"
          />
          <img
            className="tea-books-img tea-books-night"
            src={teaBooksDark}
            alt="Stack of UX books topped with a steaming mug, lit for night mode"
          />
        </div>
      </div>

      {/* Foreground: plant depth layers, both corners */}
      <img className="layer plant plant-left" src={plant} alt="" role="presentation" />
      <img className="layer plant plant-right" src={plant} alt="" role="presentation" />

      {/* Feature cards row */}
      <FeatureCards />

      {/* Custom pen-nib cursor — only rendered/visible while hovering the
          interactive headline above. Fixed-position so it tracks the raw
          mouse coordinate; pointer-events:none so it never blocks hover
          on the letters underneath it. */}
      <div
        className={`pen-cursor${penCursor.active ? ' is-active' : ''}`}
        style={{ transform: `translate3d(${penCursor.x - 31}px, ${penCursor.y - 33}px, 0)` }}
        aria-hidden="true"
      >
        <img className="pen-cursor-img" src={penCursorImg} alt="" draggable="false" />
      </div>
    </section>
  );
}
