import { useEffect, useState } from 'react';

// ============================================================================
// useActiveSection -- single source of truth for "which of the six
// portfolio sections is the user currently looking at", shared by every
// nav surface (Header's persistent pill on Home, every ContextualNav
// instance, and the persistent MobileNav). Previously this was
// duplicated -- Hero.jsx tracked Work/Creative Lab itself for Header's
// active state, and each ContextualNav re-derived its own "am I near"
// answer independently. Now there is exactly one measurement, computed
// once per scroll tick and reused everywhere, so every nav surface
// always agrees on the active section instead of subtly drifting apart.
//
// Same plain-position-math approach already proven out on
// ContextualNav's own show/hide logic (see the comment there): no
// IntersectionObserver, since it only reports enter/exit crossings and
// left a nav stuck in a stale state once scroll clamped at a short
// trailing section. Recomputing straight from getBoundingClientRect()
// on every tick has nothing to get stuck.
// ============================================================================

const SECTION_IDS = ['home', 'work', 'creative-lab', 'about', 'playground', 'contact'];

export default function useActiveSection() {
  const [active, setActive] = useState('home');

  useEffect(() => {
    const evaluate = () => {
      const vh = window.innerHeight;
      // The section whose top has crossed furthest up past the same
      // "roughly 70% down the viewport" line used by ContextualNav's own
      // near-section check, and hasn't yet scrolled its bottom past the
      // top -- i.e. whichever section is most clearly the one currently
      // occupying the viewport. Sections are checked in document order
      // and the last one to qualify wins, so when two are both
      // technically still in that band (a short section, a fast scroll)
      // the one further down -- the one the user has scrolled further
      // into -- takes priority, matching how a reader would describe
      // "which section am I on" themselves.
      let current = 'home';
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const qualifies = rect.top < vh * 0.7 && rect.bottom > 0;
        if (qualifies) current = id;
      }
      setActive((prev) => (prev === current ? prev : current));
    };

    evaluate();
    window.addEventListener('scroll', evaluate, { passive: true });
    window.addEventListener('resize', evaluate);
    return () => {
      window.removeEventListener('scroll', evaluate);
      window.removeEventListener('resize', evaluate);
    };
  }, []);

  return active;
}

// Maps a section id to the exact label string the nav components expect
// for their activePage prop (see NAV_ITEMS in Header.jsx/ContextualNav.jsx).
export const SECTION_LABELS = {
  home: 'Home',
  work: 'Work',
  'creative-lab': 'Creative Lab',
  about: 'About',
  playground: 'Playground',
  contact: 'Contact',
};
