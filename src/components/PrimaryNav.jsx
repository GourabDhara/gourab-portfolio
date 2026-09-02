import NavPill from './NavPill.jsx';
import './PrimaryNav.css';

// ============================================================================
// PrimaryNav -- the ONE persistent desktop navigation bar for the entire
// portfolio, mounted once at the App root (see App.jsx) instead of once
// per section.
//
// Previously Home had its own nav pill inside <Header> and every other
// section (Work, Creative Lab, About, Playground, Contact) mounted a
// *separate* <ContextualNav> instance, each fading/sliding in and out on
// its own as the user scrolled between sections. Even though every
// instance rendered pixel-identical markup, handing off between two
// different DOM elements is exactly what read as "a new navbar entering
// from above" -- one instance's exit animation and the next instance's
// entrance animation overlapping, rather than a single element's active
// indicator sliding to a new position.
//
// PrimaryNav fixes that at the root: it is the only nav-pill DOM node on
// desktop, it never mounts/unmounts and never fades or slides itself, and
// its `activePage` prop is fed straight from the same useActiveSection()
// source of truth every other nav surface already shares (see App.jsx).
// Only NavPill's internal sliding indicator (see NavPill.jsx) moves.
//
// Desktop only -- mobile keeps its own separate, already-persistent
// hamburger nav (see MobileNav.jsx), untouched by this change.
// ============================================================================

export default function PrimaryNav({ dark, activePage, onNavigate, onNavigateToWork, hidden = false }) {
  // hidden: true while the Contact page's BARU-OG overlay is open (see
  // App.jsx / ContactPage.jsx). Uses visibility (not display: none) so
  // layout/measurement is undisturbed, plus aria-hidden + inert so the
  // nav is genuinely removed from focus/tab order and screen-reader
  // exposure while covered, not just visually painted-over.
  return (
    <div
      className={`primary-nav${hidden ? ' is-overlay-hidden' : ''}`}
      data-theme={dark ? 'dark' : 'light'}
      aria-hidden={hidden || undefined}
      inert={hidden || undefined}
    >
      <NavPill
        activePage={activePage}
        onNavigate={onNavigate}
        onNavigateToWork={onNavigateToWork}
        ariaLabel="Primary"
      />
    </div>
  );
}
