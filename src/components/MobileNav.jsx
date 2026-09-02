import { useEffect, useState } from 'react';
import NavPill from './NavPill.jsx';
import './MobileNav.css';

// ============================================================================
// MobileNav -- the ONE mobile hamburger + slide-down menu for the entire
// portfolio, mounted once at the App root (see App.jsx) rather than once
// per section. Previously the hamburger only existed inside Header, and
// Header itself was only rendered on Home (persistent), About, and
// Contact -- Work and Creative Lab used ContextualNav instead, which
// deliberately has no mobile UI of its own (`display: none` under
// 900px). That left the hamburger unreachable while scrolled through
// Work/Creative Lab, and would have repeated the same gap for Playground.
//
// This component owns none of that per-section logic -- it just needs
// to know the current theme (for styling) and the current active
// section (for NavPill's active state), both driven from the same
// useActiveSection() hook every other nav surface uses (see App.jsx),
// so it can never disagree with Header or any ContextualNav instance
// about which section is active.
//
// Fixed-position, its own container-type: inline-size root (matching
// .hero-stage's own full-width container -- see the comment on cqw
// usage in Header.css) so the existing mobile hamburger/menu sizing
// carries over pixel-for-pixel without needing an ancestor container,
// since this now renders completely outside any section's own DOM tree.
// ============================================================================

export default function MobileNav({ dark, activePage, onNavigate, onNavigateToWork, hidden = false }) {
  const [open, setOpen] = useState(false);

  // If the BARU-OG overlay opens while the hamburger menu happens to be
  // open, close the menu too -- otherwise it would silently reopen
  // already-expanded (and briefly flash) the instant `hidden` clears.
  useEffect(() => {
    if (hidden) setOpen(false);
  }, [hidden]);

  // hidden: true while the Contact page's BARU-OG overlay is open (see
  // App.jsx / ContactPage.jsx). Same visibility + aria-hidden + inert
  // treatment as PrimaryNav (see its comment) -- genuinely removed from
  // hit-testing and the accessibility tree, not just painted under the
  // overlay by z-index.
  return (
    <div
      className={`mobile-nav-root${hidden ? ' is-overlay-hidden' : ''}`}
      data-theme={dark ? 'dark' : 'light'}
      aria-hidden={hidden || undefined}
      inert={hidden || undefined}
    >
      <div className="mobile-nav-bar">
        <button
          type="button"
          className="hamburger-btn"
          aria-expanded={open}
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`hamburger-icon${open ? ' is-open' : ''}`} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      <div className={`mobile-nav-menu${open ? ' is-open' : ''}`}>
        <NavPill
          activePage={activePage}
          onNavigate={(page) => {
            setOpen(false);
            onNavigate?.(page);
          }}
          onNavigateToWork={(section) => {
            setOpen(false);
            onNavigateToWork?.(section);
          }}
          ariaLabel="Mobile navigation"
        />
      </div>

      {open && <button type="button" className="mobile-nav-scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    </div>
  );
}
