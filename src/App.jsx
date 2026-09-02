import { useCallback, useEffect, useState } from 'react';
import SceneTransition from './components/SceneTransition.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import MobileNav from './components/MobileNav.jsx';
import PrimaryNav from './components/PrimaryNav.jsx';
import useActiveSection, { SECTION_LABELS } from './components/useActiveSection.js';
import './App.css';

import background from './assets/hero/background.png';
import backgroundDark from './assets/hero/background-dark.png';
import person from './assets/hero/person.png';
import teaBooks from './assets/hero/tea-books.png';
import teaBooksDark from './assets/hero/tea-books-dark.png';
import paperPlane from './assets/hero/paper-plane.png';
import noteUserFlow from './assets/hero/note-userflow-combined.png';
import noteIdeas from './assets/hero/note-ideas.png';
import noteUiComponents from './assets/hero/note-uicomponents.png';
import notePrototype from './assets/hero/note-prototype.png';
import noteDesignSystem from './assets/hero/note-designsystem.png';
import plant from './assets/hero/plant.png';
import moonMobile from './assets/hero/moon-mobile.png';

// Preload every image the hero actually paints, so the loading screen
// never hands off to a half-rendered page. Dark-mode assets are included
// too, so the first Dark Mode toggle is instant with no fetch delay
// hiding inside the cinematic transition. Failures still resolve
// (rather than reject) so one bad asset can't hang the intro forever.
const HERO_ASSETS = [
  background,
  backgroundDark,
  person,
  teaBooks,
  teaBooksDark,
  paperPlane,
  noteUserFlow,
  noteIdeas,
  noteUiComponents,
  notePrototype,
  noteDesignSystem,
  plant,
  moonMobile,
];

// Intentionally paced so the intro reads as "something is being
// crafted" rather than a bare technical delay — roughly 3.8s of
// visible loading composition plus the fade-out, landing the whole
// sequence in the ~3.5–4.5s target window.
const MIN_LOADING_MS = 3800;
const MAX_LOADING_MS = 4500;
const FADE_MS = 600;

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve;
    img.src = src;
  });
}

function App() {
  const [assetsReady, setAssetsReady] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [loaderHidden, setLoaderHidden] = useState(false);
  const [loaderMounted, setLoaderMounted] = useState(true);

  // Lifted out of Hero so the cloud transition + Intro section (which
  // both need to know the active theme) share the exact same source of
  // truth instead of each guessing independently. Hero still owns the
  // toggle interaction itself (measuring the control's screen position
  // for its circular reveal) and just reports flips upward.
  const [dark, setDark] = useState(false);
  const toggleTheme = useCallback(() => setDark((v) => !v), []);

  // Whether the Contact page's BARU-OG overlay is currently open --
  // reported upward from ContactPage (see its onBaruogOverlayChange
  // prop) purely so PrimaryNav/MobileNav can hide themselves for real
  // (visibility + pointer-events + aria-hidden, not just incidental
  // z-index stacking) while it's open, then restore automatically the
  // moment it closes. ContactPage still owns the overlay's own open
  // state and all of its behavior; this is a read-only mirror of it.
  const [baruogOverlayOpen, setBaruogOverlayOpen] = useState(false);

  // Mirrors the theme onto <body> as data-theme, so any element that
  // isn't itself inside a themed section -- chiefly <body>'s own global
  // background fallback in index.css -- can still stay in sync with
  // the live theme. Fixes the whole-site barrel roll's rotation
  // briefly exposing body's background at the rotated corners: before
  // this, body had no theme awareness at all and was hardcoded to the
  // light background color, so a dark-mode rotation showed a white/
  // cream wedge at the edges. Every themed section already sets its
  // own data-theme locally (see AboutPage/ContactPage/etc.); this just
  // extends the same attribute one level up to body, purely additive.
  useEffect(() => {
    document.body.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);

  // Which section is currently on screen -- shared by every nav surface
  // (Header's persistent pill on Home, every ContextualNav instance, and
  // MobileNav) via the one hook in useActiveSection.js, so they can
  // never disagree about which section is active.
  const activeSectionId = useActiveSection();
  const activeLabel = SECTION_LABELS[activeSectionId] || 'Home';

  // The whole portfolio is now one continuous scroll (see
  // SceneTransition.jsx, which mounts Hero/Work/Creative
  // Lab/About/Playground/Contact as permanent siblings), so every nav
  // click -- Home, Work, Creative Lab, About, Playground, or Contact --
  // is just a smooth scroll to that section's id, the same mechanism
  // Work/Creative Lab already used before this pass. There is no more
  // separate page-routing/View-Transition crossfade: nothing ever
  // mounts or unmounts as a result of navigating, so there is nothing
  // that could flash, reset, or momentarily show a duplicate header.
  const scrollToSection = useCallback((sectionId) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target = document.getElementById(sectionId);
    target?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  }, []);

  // 'home' | 'about' | 'contact' | 'playground' -> the matching section
  // id. Kept as the same onNavigate(page) signature every section
  // already calls (see AboutPage/ContactPage/PlaygroundSection's
  // ContextualNav usage), so none of those call sites needed to change.
  const navigate = useCallback((page) => {
    scrollToSection(page === 'home' ? 'home' : page);
  }, [scrollToSection]);

  // Work and Creative Lab keep their own dedicated handler name
  // (matching every existing call site -- Hero's CTA, FeatureCards,
  // every ContextualNav's Work/Creative Lab buttons) but it now does
  // exactly the same thing navigate() does: scroll to a section id in
  // the one continuous page.
  const navigateToWork = useCallback((sectionId = 'work') => {
    scrollToSection(sectionId);
  }, [scrollToSection]);

  useEffect(() => {
    let cancelled = false;

    Promise.all(HERO_ASSETS.map(preloadImage)).then(() => {
      if (!cancelled) setAssetsReady(true);
    });

    const minTimer = setTimeout(() => {
      if (!cancelled) setMinTimeElapsed(true);
    }, MIN_LOADING_MS);

    // Safety net: never let a slow/failed asset block the intro forever.
    const maxTimer = setTimeout(() => {
      if (!cancelled) {
        setAssetsReady(true);
        setMinTimeElapsed(true);
      }
    }, MAX_LOADING_MS);

    return () => {
      cancelled = true;
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, []);

  useEffect(() => {
    if (assetsReady && minTimeElapsed) {
      setLoaderHidden(true);
      const unmountTimer = setTimeout(() => setLoaderMounted(false), FADE_MS);
      return () => clearTimeout(unmountTimer);
    }
  }, [assetsReady, minTimeElapsed]);

  return (
    <div className="app">
      {/* Hero only mounts once the intro is done, so its staggered
          entrance animation (headline, notes, portrait, cards) plays
          for real as the loader fades — rather than racing to
          completion invisibly behind it. Its images are already
          warmed in the browser cache by the preload above, so this
          mount paints instantly with no flash.

          SceneTransition now renders the ENTIRE portfolio -- Home
          through Contact -- as one continuous scroll (see the comment
          in SceneTransition.jsx). There is no more per-page mount/
          unmount, so nothing here needs to branch on which "page" is
          active. */}
      {assetsReady && minTimeElapsed && (
        <SceneTransition
          dark={dark}
          onToggleTheme={toggleTheme}
          onNavigate={navigate}
          onNavigateToWork={navigateToWork}
          onBaruogOverlayChange={setBaruogOverlayOpen}
        />
      )}
      {/* The ONE persistent desktop navigation bar for the whole site
          (see PrimaryNav.jsx) -- mounted here at the app root, once,
          instead of Home's Header and every other section each mounting
          their own separate nav instance. It never mounts/unmounts and
          never fades/slides as sections change; only its internal active
          indicator (see NavPill.jsx) moves. Renders nothing at/below
          900px (mobile uses MobileNav below instead).

          hidden={baruogOverlayOpen}: while the Contact page's BARU-OG
          overlay is open, this is force-hidden (visibility + aria, not
          unmounted) so it has zero visual or interactive presence above
          the overlay, then restored the instant the overlay closes. */}
      {assetsReady && minTimeElapsed && (
        <PrimaryNav dark={dark} activePage={activeLabel} onNavigate={navigate} onNavigateToWork={navigateToWork} hidden={baruogOverlayOpen} />
      )}
      {/* The one persistent mobile hamburger + menu for the whole site
          (see MobileNav.jsx) -- mounted here at the app root rather than
          per-section, so it's available no matter which section is
          currently scrolled into view. Renders nothing above 900px
          (desktop uses PrimaryNav above instead).

          hidden={baruogOverlayOpen}: same treatment as PrimaryNav above --
          forced invisible and non-interactive while the overlay is open. */}
      {assetsReady && minTimeElapsed && (
        <MobileNav dark={dark} activePage={activeLabel} onNavigate={navigate} onNavigateToWork={navigateToWork} hidden={baruogOverlayOpen} />
      )}
      {loaderMounted && <LoadingScreen hidden={loaderHidden} />}
    </div>
  );
}

export default App;
