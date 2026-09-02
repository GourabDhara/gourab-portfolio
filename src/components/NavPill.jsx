import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './NavPill.css';

const NAV_ITEMS = ['Home', 'Work', 'Creative Lab', 'About', 'Playground', 'Contact'];

// ============================================================================
// NavPill -- the six nav buttons plus a single sliding indicator that
// travels between them, shared by Header (Home's persistent full header)
// and ContextualNav (Work/Creative Lab/About/Playground/Contact's
// minimal nav) so there's exactly one implementation of "which button is
// active" instead of two that could drift apart.
//
// The indicator is one absolutely-positioned <span> measured against
// whichever button is currently active and moved with a CSS transform +
// width transition -- a translate/resize tween is what makes it read as
// the same pill traveling to the new position (a Smart-Animate-style
// interpolation) rather than one pill disappearing and a different one
// appearing elsewhere. Each button's own .is-active class is left in
// place underneath purely as a same-frame fallback (first paint before
// the indicator has measured anything, no-JS, prefers-reduced-motion) --
// see the CSS for how the two are layered without double-painting.
// ============================================================================

export default function NavPill({ activePage, onNavigate, onNavigateToWork, ariaLabel = 'Primary', collapsed = false }) {
  const navRef = useRef(null);
  const [indicator, setIndicator] = useState(null); // { x, width } or null until first measured

  const measure = () => {
    const nav = navRef.current;
    if (!nav) return;
    const activeBtn = nav.querySelector('.nav-item.is-active');
    if (!activeBtn) {
      setIndicator(null);
      return;
    }
    // Position relative to the nav's own padding box, so this keeps
    // working regardless of the pill's own responsive padding/gap
    // (both are clamp()-driven and differ between Header and
    // ContextualNav's contexts).
    const navRect = nav.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    setIndicator({ x: btnRect.left - navRect.left, width: btnRect.width });
  };

  // Layout effect (not a plain effect): measuring after the active class
  // has already painted but before the browser presents the frame, so
  // the very first render of a given activePage never flashes an
  // unpositioned indicator before snapping into place.
  useLayoutEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage]);

  useEffect(() => {
    // Re-measure on resize/font-load-driven reflow -- the pill's own
    // sizing is clamp()/cqw-based, so a viewport resize can shift every
    // button's width and position even though activePage hasn't changed.
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    // Fonts loading in after first paint (Sora/Inter/DM Mono, etc.) can
    // reflow text width slightly -- one more measure once they're ready
    // keeps the indicator from settling a few px off.
    document.fonts?.ready?.then(measure).catch(() => {});
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleNavigate = (item) => {
    if (item === 'About') onNavigate?.('about');
    if (item === 'Home') onNavigate?.('home');
    if (item === 'Contact') onNavigate?.('contact');
    if (item === 'Playground') onNavigate?.('playground');
    if (item === 'Work') onNavigateToWork?.('work');
    if (item === 'Creative Lab') onNavigateToWork?.('creative-lab');
  };

  return (
    <nav className={`nav-pill${collapsed ? ' is-collapsed' : ''}`} aria-label={ariaLabel} ref={navRef}>
      {indicator && (
        <span
          className="nav-pill-indicator"
          aria-hidden="true"
          style={{ transform: `translateX(${indicator.x}px)`, width: `${indicator.width}px` }}
        />
      )}
      {NAV_ITEMS.map((item) => (
        <button
          key={item}
          type="button"
          className={`nav-item${activePage === item ? ' is-active' : ''}`}
          onClick={() => handleNavigate(item)}
        >
          {/* A permanently-bold, invisible copy of the label stacked in
              the same grid cell as the real text (see .nav-item-sizer /
              .nav-item-text in NavPill.css), purely to reserve width. A
              button's own intrinsic width becomes the wider of the two
              stacked children -- i.e. always as if it were already
              bold -- so becoming the active item (font-weight 500 ->
              600) never changes that width. That per-button growth was
              what previously made the whole flex row (and therefore
              .nav-pill itself, which has no fixed width of its own)
              expand by a few px, most visibly for the longer labels
              (Creative Lab, Playground). */}
          <span className="nav-item-sizer" aria-hidden="true">{item}</span>
          <span className="nav-item-text">{item}</span>
        </button>
      ))}
    </nav>
  );
}
