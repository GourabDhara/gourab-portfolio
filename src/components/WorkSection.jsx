import { useEffect, useRef, useState } from 'react';
import './WorkSection.css';
import HoverMedia from './HoverMedia.jsx';

import campusEaseImg from '../assets/work/thumbs/campusease.png';
import campusEaseVideo from '../assets/work/videos/campusease.mp4';
import ogZoneImg from '../assets/work/thumbs/ogzone.png';
import ogZoneVideo from '../assets/work/videos/ogzone.mp4';
import bhojonRoshikImg from '../assets/work/thumbs/bhojonroshik.png';
import bhojonRoshikVideo from '../assets/work/videos/bhojonroshik.mp4';
import nivaraImg from '../assets/work/thumbs/nivara.png';
import nivaraVideo from '../assets/work/videos/nivara.mp4';

// ============================================================================
// Work section — lives directly below the full Home experience (Hero +
// Intro), in the same scroll flow. Not a standalone page: no header, no
// theme toggle, no routing of its own. It reuses the site's existing
// Header/theme system entirely and only supplies its own content + card
// styling, matching the visual identity of the source Work-page project
// (icon chip, arrow affordance, image-forward card, accent-tinted tags)
// while inheriting this portfolio's fonts, tokens, radii and motion
// language (see the --theme-duration/--theme-ease pattern already used by
// Hero.css / Intro.css / AboutPage.css).
//
// The four projects are presented as a scroll-driven stacked-card deck
// (see .work-stack-track / .work-stack-viewport in WorkSection.css) using
// the exact same sticky-track pattern already established by Hero's own
// Hero -> Intro handoff (see .hero-sticky-track in Hero.css / the comment
// in SceneTransition.jsx): a tall wrapper reserves N viewports' worth of
// scroll distance, a `position: sticky` viewport pins in place while the
// user scrolls through it, and plain scroll-position math (no animation
// library -- there isn't one in this project, see package.json) drives
// each card's transform continuously. This mirrors Hero's own approach
// exactly rather than introducing a new pattern or framework.
// ============================================================================

const PROJECTS = [
  {
    id: 'campusease',
    name: 'CampusEase',
    category: 'College Management Platform',
    description:
      'CampusEase is a unified campus management platform designed to simplify everyday student and campus services. It brings academics, attendance, assignments, notices, events, hostel, mess, complaints, and maintenance into one connected and easy-to-use experience.',
    tags: ['UX/UI Design', 'Web App'],
    url: 'https://www.behance.net/gallery/254337005/CampusEase-Campus-Life-Simplified-UIUX-Case-Study',
    image: campusEaseImg,
    video: campusEaseVideo,
    tone: 'blue',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
        <path
          d="M12 4 3 8.2l9 4.2 9-4.2L12 4Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M6.5 10.4v5.1c0 1.6 2.5 3 5.5 3s5.5-1.4 5.5-3v-5.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 9v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'ogzone',
    name: 'OG Zone',
    category: 'E-Commerce Platform',
    description:
      'OG Zone is an e-commerce experience designed to create a more engaging and intuitive shopping journey. The project focuses on improving product discovery, content hierarchy, navigation, and user engagement while maintaining a strong visual identity and responsive experience.',
    tags: ['UI/UX Design', 'E-Commerce'],
    url: 'https://www.behance.net/gallery/243264983/OG-Zone-E-Commerce-App-UX-Case-Study',
    image: ogZoneImg,
    video: ogZoneVideo,
    tone: 'terracotta',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
        <path d="M6.5 8 8 4.5h8L17.5 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.5 8h15l-1 12h-13L4.5 8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M9 11c0 1.7 1.3 3 3 3s3-1.3 3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'bhojonroshik',
    name: 'Bhojon Roshik',
    category: 'Food Discovery Platform',
    description:
      'Bhojon Roshik is a food delivery app designed to make food discovery and ordering simpler and more intuitive. The experience focuses on clear navigation, organized restaurant and food information, and a smooth journey from discovering meals to placing an order.',
    tags: ['UX/UI Design', 'Mobile App'],
    url: 'https://www.behance.net/gallery/241158677/Bhojon-Roshik-Food-Delivery-App-UXUI-Case-Study',
    image: bhojonRoshikImg,
    video: bhojonRoshikVideo,
    tone: 'amber',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
        <path d="M6 3v7a2.5 2.5 0 0 0 5 0V3M8.5 3v7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.5 10.5V21" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M17 3c-1.7 0-3 2-3 5.5S15.3 12 17 12v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'nivara',
    name: 'Nivara',
    category: 'Sustainable Living Brand',
    description:
      'Nivara is a personal finance management platform designed to make managing money simpler and more organized. It helps users track transactions, manage budgets, set financial goals, and understand spending through a clear and structured dashboard experience.',
    tags: ['UX/UI Design', 'Brand Website'],
    url: 'https://www.behance.net/gallery/254959707/Nivara-Personal-Finance-Dashboard-UIUX',
    image: nivaraImg,
    video: nivaraVideo,
    tone: 'green',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
        <path
          d="M12 21c-4-2.4-7-6-7-10.2C5 6.6 8.1 3.5 12 3.5s7 3.1 7 7.3c0 4.2-3 7.8-7 10.2Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M12 8.5c-2 .3-3.2 1.7-3.2 3.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

// How many viewport-heights of scroll distance the stack track reserves
// per project transition. One full viewport per step (1->2, 2->3, 3->4)
// -- each step is now a discrete, snapped project change (see the
// one-scroll-per-project wheel/touch handling below) rather than a
// continuously-interpolated scrub, so each step's anchor sits exactly
// VH_PER_TRANSITION down from the previous one and there is no longer a
// separate trailing "settle" viewport: index N-1 (the last project) IS
// the settle position, since there's nothing left to interpolate toward.
const VH_PER_TRANSITION = 1;
const TRACK_VH = (PROJECTS.length - 1) * VH_PER_TRANSITION + 1;

// Minimum wheel-event delta (px) treated as an intentional scroll tick,
// filtering out near-zero noise some trackpads emit.
const WHEEL_THRESHOLD = 4;
// Minimum vertical touch-drag distance (px) treated as an intentional
// swipe step on mobile.
const TOUCH_THRESHOLD = 36;
// How long (ms) a project-step transition animates -- input is locked
// for this long so a fast/large gesture can't queue multiple steps.
// Matches (with a small margin) the .work-stack-card transform
// transition duration in WorkSection.css, so the lock never releases
// before the previous step has visibly finished settling.
const STEP_LOCK_MS = 660;

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 17 17 7M17 7H9M17 7v8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Renders one card's content -- shared by both the animated stack (desktop
// + motion-ok) and the plain static fallback (reduced motion), so project
// images/titles/descriptions/tags/buttons are always the exact same markup
// regardless of which presentation mode is active.
function ProjectCardContent({ project }) {
  const { name, category, description, tags, image, video, icon, tone } = project;
  return (
    <>
      <HoverMedia
        containerClassName="work-card-media"
        thumbnail={image}
        video={video}
        alt={`${name} project banner`}
      />

      <div className="work-card-body">
        <div className="work-card-top">
          <span className={`work-card-icon tone-${tone}`}>{icon}</span>
          <span className="work-card-arrow" aria-hidden="true">
            <ArrowIcon />
          </span>
        </div>

        <h3 className="work-card-title">{name}</h3>
        <p className="work-card-category">{category}</p>
        <p className="work-card-description">{description}</p>

        <div className="work-card-tags">
          {tags.map((tag) => (
            <span className={`work-card-tag tone-${tone}`} key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

// One card within the animated stack. `delta` is this card's position
// relative to the current (possibly fractional) active index --
// 0 = fully active/front, 1 = one step back, -1 = one step ahead/already
// passed, etc. Transform/opacity/z-index are all pure functions of that
// single number, so the visual state is entirely determined by current
// scroll position with nothing queued or remembered between renders --
// scrolling fast, reversing mid-transition, or landing on any fractional
// value all just evaluate this same function correctly.
//
// `isDesktop` switches the waiting-card geometry between two distinct
// compositions (see WorkSection's own isDesktop media-query state):
//  - Desktop: cards fan out to alternating LEFT/RIGHT positions as they
//    go further back, using the empty side space around the active card
//    instead of just piling straight down behind it.
//  - Mobile: cards stay essentially vertical (a tight peek-through
//    stack), matching the compact card size -- there isn't enough side
//    space on a phone for a horizontal fan, and the brief calls for a
//    "next project peeking underneath" feel, not a side spread.
function StackedProjectCard({ project, delta, isDesktop }) {
  const clamped = Math.max(-1, Math.min(2.4, delta));
  // Direction alternation is based on the actual whole-step difference
  // (not the clamped/fractional `t` used for magnitude below), so which
  // side a card fans to stays stable even once `t` gets capped at 2.4
  // for the farthest card.
  const dir = Math.round(delta) % 2 === 0 ? 1 : -1;

  let style;
  if (clamped <= 0) {
    // Active or already fully departed off the top (delta 0..-1): fades
    // and lifts away as the next card takes over. A shorter lift on
    // mobile matches the smaller card -- it only needs to travel a
    // fraction of the distance to visually clear the active slot.
    const t = Math.min(1, -clamped);
    const lift = isDesktop ? 60 : 34;
    style = {
      transform: `translateY(${t * -lift}px) scale(${1 - t * 0.06})`,
      opacity: 1 - t,
      zIndex: 40,
    };
  } else if (isDesktop) {
    // Waiting in the stack behind the active card (delta 1, 2, 3...).
    // Every waiting card -- including the very first one directly behind
    // the active card -- gets an immediate left/right offset rather than
    // sitting hidden dead-center; each further step fans a little wider
    // and lower, using the (now much larger) horizontal room beside the
    // active card so the layered deck actually reads as a stack of
    // distinct cards instead of one card with a sliver peeking out.
    // transform-origin is pinned to the bottom edge (see .work-stack-card
    // below), so scaling shrinks each card in from the TOP only, leaving
    // a visible strip below. Opacity is floored (not allowed to fade
    // fully out) so even the farthest layered card stays "clearly
    // recognizable" per the composition brief, rather than dissolving
    // into the background.
    const t = Math.min(clamped, 3);
    const x = dir * t * 92;
    const y = t * 26 + 16;
    const rotate = dir * t * 3.2;
    style = {
      transform: `translate(${x}px, ${y}px) scale(${1 - t * 0.08}) rotate(${rotate}deg)`,
      opacity: Math.max(0.4, 1 - t * 0.19),
      zIndex: 40 - Math.round(t * 10),
    };
  } else {
    // Mobile: a compact, mostly-vertical peek-through stack. There isn't
    // side room for a wide fan on a phone, but each waiting card still
    // gets a small immediate offset (rather than 0 for the first one) so
    // the "there are more projects here" cue reads even one step back,
    // with the dominant motion staying vertical so upcoming projects
    // feel like they're waiting underneath.
    const t = Math.min(clamped, 3);
    const x = dir * Math.min(t * 7, 16);
    const y = t * 20 + 15;
    const rotate = dir * t * 1.4;
    style = {
      transform: `translate(${x}px, ${y}px) scale(${1 - t * 0.06}) rotate(${rotate}deg)`,
      opacity: Math.max(0.38, 1 - t * 0.2),
      zIndex: 40 - Math.round(t * 10),
    };
  }

  const isActive = delta > -0.02 && delta < 0.02;

  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="work-card work-stack-card"
      role="listitem"
      style={style}
      aria-hidden={!isActive}
      tabIndex={isActive ? 0 : -1}
      aria-label={`${project.name} — ${project.category}. Opens Behance case study in a new tab.`}
    >
      <ProjectCardContent project={project} />
    </a>
  );
}

// How much of a viewport-height's worth of approach distance the entry
// fade plays out over, and how close to the sticky engage point it
// finishes. Expressed as fractions of window.innerHeight so it scales
// with viewport size the same way the rest of the track's geometry does.
// Deliberately generous (most of a viewport) so the first project settles
// into place gradually across ordinary scrolling instead of the sticky
// viewport handing it to the user already fully formed.
const ENTRY_START_VH = 0.92;
const ENTRY_END_VH = 0.04;

export default function WorkSection({ dark = false, id, onNavigate, onNavigateToWork }) {
  const trackRef = useRef(null);
  const viewportRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // Mirrors activeIndex for the wheel/touch listeners below, which are
  // registered once (empty-ish dep array) rather than re-bound on every
  // index change -- reading this ref instead of the state closure means
  // they always see the current step even mid-gesture.
  const activeIndexRef = useRef(0);
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    if (mq.addEventListener) {
      mq.addEventListener('change', update);
    } else {
      mq.addListener(update);
    }
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', update);
      } else {
        mq.removeListener(update);
      }
    };
  }, []);

  // Tracks the same 1080px breakpoint already used throughout
  // WorkSection.css, so the desktop (left/right fan) vs. mobile (compact
  // vertical peek) stack geometry in StackedProjectCard always matches
  // whichever layout the CSS is actually rendering.
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1080px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1080px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    if (mq.addEventListener) {
      mq.addEventListener('change', update);
    } else {
      mq.addListener(update);
    }
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', update);
      } else {
        mq.removeListener(update);
      }
    };
  }, []);

  // ------------------------------------------------------------------
  // Discrete one-scroll-per-project stepping.
  //
  // Replaces the old continuous scroll-position -> fractional-index
  // mapping. The track's sticky viewport still reserves real scroll
  // distance (TRACK_VH viewports, one per step) exactly as before, and
  // each whole project index still has one true scroll-position anchor
  // within it -- but the user's raw scroll position is no longer read
  // directly to derive a fractional delta. Instead:
  //
  //   - Before the track is "engaged" (see isEngaged below), wheel and
  //     touch events are left completely alone -- no preventDefault, no
  //     programmatic scroll, nothing. The user's own natural scrolling is
  //     what carries them from Home through the Work heading and up to
  //     Project 1's resting position; the JS here does not touch the
  //     scroll position at all during that approach. (An earlier version
  //     of this effect pre-emptively snapped the page to Project 1's
  //     anchor via window.scrollTo the moment a gesture was detected
  //     approaching the track from a buffer zone outside it -- that
  //     "approach" snapping has been removed entirely, since it was
  //     exactly the forced, instant jump this section must not do. See
  //     the removed approachStep/nearZone/inNearZone below in git history
  //     if useful context, but they should not be reintroduced.)
  //   - Only once "engaged" (the sticky viewport has actually pinned --
  //     which, by construction, only happens after native scroll has
  //     already carried the user there on their own) is wheel/touch input
  //     intercepted with preventDefault and interpreted as discrete
  //     steps: one intentional gesture moves activeIndex by exactly +/-1.
  //   - Each step immediately sets document scroll to that index's
  //     anchor position (a plain jump; the *visible* motion comes from
  //     the CSS transition on each card's transform, see .work-stack-card
  //     in WorkSection.css) and locks further input for STEP_LOCK_MS so
  //     a fast/large wheel delta can only ever advance one step. This is
  //     invisible to the user: the viewport is pinned (position: sticky)
  //     for this entire range, so the screen doesn't visibly move either
  //     way -- only the card's own CSS-eased transform is seen animating.
  //   - At index 0, an upward gesture is NOT intercepted -- it's allowed
  //     to fall through to native scroll, which carries the user up out
  //     of Work as normal. At the last index, a downward gesture is
  //     likewise let through so the track releases naturally into
  //     Creative Lab. This is what makes the handoff at both ends feel
  //     like a natural continuation rather than a wall.
  //   - A plain "scroll" listener (passive) still keeps activeIndex in
  //     sync with whatever the real scroll position resolves to, so
  //     landing inside the track any other way (a direct nav link to
  //     #work, browser back/forward, a resize) still shows the correct
  //     project rather than only reacting to wheel/touch gestures. This
  //     listener only ever reads scroll position -- it never sets it.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (reducedMotion) return undefined;

    const lastIndex = PROJECTS.length - 1;
    let locked = false;
    let lockTimer = null;
    let touchStartY = null;

    const getAnchors = () => {
      const track = trackRef.current;
      if (!track) return null;
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight;
      const scrollableDistance = rect.height - vh;
      const docTop = window.scrollY + rect.top;
      return { scrollableDistance, docTop, vh };
    };

    // Scroll-position anchor for a given whole project index -- evenly
    // spaced, one VH_PER_TRANSITION step apart, matching TRACK_VH's
    // reservation of (PROJECTS.length - 1) steps plus one trailing
    // viewport so the last project's anchor sits before the track ends
    // (leaving room for it to actually release into Creative Lab).
    const anchorFor = (index) => {
      const anchors = getAnchors();
      if (!anchors) return null;
      const { vh, docTop } = anchors;
      // Anchors are simply index * one-viewport-of-scroll, matching
      // VH_PER_TRANSITION directly -- the track reserves exactly one
      // extra viewport of scroll distance per step (see TRACK_VH), so
      // project index N's anchor is always N viewports into the track.
      return docTop + vh * VH_PER_TRANSITION * index;
    };

    // True only for the exact span where the sticky viewport is actually
    // pinned -- from the moment it engages to the moment it's about to
    // release. This is the ONLY condition under which wheel/touch input
    // gets intercepted at all. Reaching this state always happens via
    // plain, unintercepted native scrolling (nothing before this point
    // ever calls scrollTo), so by the time this first becomes true the
    // user has already arrived here entirely under their own scrolling.
    const isEngaged = () => {
      const anchors = getAnchors();
      if (!anchors) return false;
      const { scrollableDistance, docTop } = anchors;
      if (scrollableDistance <= 0) return false;
      const y = window.scrollY;
      return y >= docTop - 1 && y <= docTop + scrollableDistance + 1;
    };

    const releaseLock = () => {
      locked = false;
      lockTimer = null;
    };

    // Entry fade: while the track is still approaching from above (i.e.
    // before the sticky viewport has engaged), gradually raises the
    // active-card layer's opacity/scale from a soft, slightly-lowered
    // starting state up to its normal fully-formed appearance as the
    // track's top edge travels from ENTRY_START_VH down to ENTRY_END_VH
    // of the viewport height. Written directly onto the DOM node (a CSS
    // custom property) rather than through React state, since this needs
    // to update every scroll tick without re-rendering the whole card
    // tree -- exactly the same reasoning as reading activeIndexRef
    // instead of state above. This is purely visual (opacity/scale) and
    // never touches scroll position -- it rides passively on whatever
    // native scrolling the user is already doing, which is what makes
    // Project 1's arrival read as gradual (SCROLL DISTANCE -> VISUAL
    // PROGRESS) instead of an instant reveal the moment the track pins.
    const updateEntryProgress = () => {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!viewport || !track) return;
      const top = track.getBoundingClientRect().top;
      const vh = window.innerHeight || 1;
      const start = vh * ENTRY_START_VH;
      const end = vh * ENTRY_END_VH;
      const raw = (start - top) / (start - end);
      const progress = Math.max(0, Math.min(1, raw));
      viewport.style.setProperty('--work-entry', progress.toFixed(3));
    };

    // Passive sync pass: keeps activeIndex correct whenever scroll
    // position and activeIndex could otherwise disagree -- most
    // importantly, the moment the track is (re-)entered from outside
    // (a direct #work link, browser back/forward, resize, or simply
    // scrolling up into Work from Creative Lab below / down into Work
    // from Home above). Without this, activeIndex stays at whatever it
    // last was (e.g. still 0 from initial mount) even though the user
    // has scrolled to the opposite end of the track, so the very first
    // step from there would jump from the wrong card. Only resyncs when
    // not mid-step (locked), so it never fights an in-flight animation.
    // Reads scroll position; never writes it.
    const onScrollSync = () => {
      updateEntryProgress();
      if (locked) return;
      const anchors = getAnchors();
      if (!anchors) return;
      const { scrollableDistance, docTop, vh } = anchors;
      if (scrollableDistance <= 0) {
        setActiveIndex((current) => (current === 0 ? current : 0));
        return;
      }
      const stepDistance = vh * VH_PER_TRANSITION;
      const y = window.scrollY;
      // Approaching/inside the track from above (not yet reached the
      // first anchor): show project 0, matching what's about to engage.
      if (y < docTop - stepDistance * 0.5) {
        setActiveIndex((current) => (current === 0 ? current : 0));
        return;
      }
      // Approaching/inside the track from below (already past the last
      // anchor, e.g. sitting in Creative Lab): show the last project,
      // matching what's about to engage when scrolling back up.
      if (y > docTop + scrollableDistance + stepDistance * 0.5) {
        setActiveIndex((current) => (current === lastIndex ? current : lastIndex));
        return;
      }
      const rawIndex = Math.round((y - docTop) / stepDistance);
      const clamped = Math.max(0, Math.min(lastIndex, rawIndex));
      setActiveIndex((current) => (Math.round(current) === clamped ? current : clamped));
    };

    // The only place this effect ever calls window.scrollTo. Only
    // reachable from inside isEngaged() (see onWheel/onTouchMove below),
    // i.e. only once native scrolling has already pinned the viewport --
    // never in anticipation of that happening. Because the viewport is
    // sticky/pinned for this entire range, this jump in the underlying
    // scrollY is not visible on screen; what the user sees is only the
    // card's own CSS-eased transform animating to its new position.
    const step = (direction) => {
      setActiveIndex((current) => {
        const currentWhole = Math.round(current);
        const next = Math.max(0, Math.min(lastIndex, currentWhole + direction));
        if (next === currentWhole) return current;
        locked = true;
        if (lockTimer) clearTimeout(lockTimer);
        lockTimer = setTimeout(releaseLock, STEP_LOCK_MS);
        const anchor = anchorFor(next);
        if (anchor != null) {
          window.scrollTo({ top: anchor, behavior: 'auto' });
        }
        return next;
      });
    };

    const onWheel = (e) => {
      if (Math.abs(e.deltaY) < WHEEL_THRESHOLD) return;
      if (!isEngaged()) return; // fully hands-off -- ordinary native scroll carries the user in
      const direction = e.deltaY > 0 ? 1 : -1;

      const currentWhole = Math.round(activeIndexRef.current);
      // Already sitting at the boundary matching this gesture's
      // direction: nothing left to step to inside the track, so let
      // this particular gesture fall through to plain native scroll --
      // that's what actually carries the user past the track's edge
      // and into Creative Lab (or back up towards Home), as one
      // smooth continuous motion rather than a hard jump.
      if (direction > 0 && currentWhole >= lastIndex) return;
      if (direction < 0 && currentWhole <= 0) return;

      e.preventDefault();
      if (locked) return;
      step(direction);
    };

    const onTouchStart = (e) => {
      if (!isEngaged()) {
        onScrollSync();
        touchStartY = null;
        return;
      }
      touchStartY = e.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (e) => {
      if (touchStartY == null || locked) return;
      const currentY = e.touches[0]?.clientY;
      if (currentY == null) return;
      const delta = touchStartY - currentY; // positive = finger moved up = scroll down intent
      if (Math.abs(delta) < TOUCH_THRESHOLD) return;

      if (!isEngaged()) return; // fully hands-off -- ordinary native touch scroll carries the user in

      const direction = delta > 0 ? 1 : -1;
      const currentWhole = Math.round(activeIndexRef.current);
      if (direction > 0 && currentWhole >= lastIndex) return;
      if (direction < 0 && currentWhole <= 0) return;

      e.preventDefault();
      touchStartY = currentY;
      step(direction);
    };

    const onTouchEnd = () => {
      touchStartY = null;
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('scroll', onScrollSync, { passive: true });
    window.addEventListener('resize', onScrollSync);
    onScrollSync();

    return () => {
      if (lockTimer) clearTimeout(lockTimer);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('scroll', onScrollSync);
      window.removeEventListener('resize', onScrollSync);
    };
  }, [reducedMotion]);

  return (
    <section className="work-section" data-theme={dark ? 'dark' : 'light'} id={id} aria-label="Selected work">
      <div className="work-inner">
        <div className="work-heading-block">
          <p className="work-eyebrow">
            <span className="work-eyebrow-dot" aria-hidden="true" />
            Selected Work
          </p>
          <h2 className="work-heading">
            Work that <span className="work-heading-accent">solves problems.</span>
          </h2>
          <p className="work-subtitle">
            Thoughtful design. Smart interactions. Real impact.
          </p>
        </div>

        {reducedMotion && (
          // Reduced-motion fallback: a plain static stack of all four
          // cards, no scroll-linked transforms -- every project stays
          // fully present and independently reachable/tabbable, just
          // without the motion.
          <div className="work-grid work-grid-static" role="list">
            {PROJECTS.map((project) => (
              <a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="work-card"
                role="listitem"
                aria-label={`${project.name} — ${project.category}. Opens Behance case study in a new tab.`}
              >
                <ProjectCardContent project={project} />
              </a>
            ))}
          </div>
        )}
      </div>

      {!reducedMotion && (
        // Rendered as its own full-width wrapper (a sibling of the
        // narrower .work-inner text column above) rather than nested
        // inside it, so the stack can use a much wider column on large
        // screens -- see .work-stack-outer in WorkSection.css -- without
        // also widening the heading copy, which stays centered at its
        // original reading width.
        <div className="work-stack-outer">
          <div
            className="work-stack-track"
            ref={trackRef}
            style={{ height: `${TRACK_VH * 100}vh` }}
          >
            <div className="work-stack-viewport" ref={viewportRef}>
              <div className="work-stack-deck" role="list">
                {PROJECTS.map((project, i) => (
                  <StackedProjectCard
                    key={project.id}
                    project={project}
                    delta={i - activeIndex}
                    isDesktop={isDesktop}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
