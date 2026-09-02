import { useEffect, useState } from 'react';
import Hero from './Hero.jsx';
import Intro from './Intro.jsx';
import WorkSection from './WorkSection.jsx';
import CreativeLabSection from './CreativeLabSection.jsx';
import AboutPage from './AboutPage.jsx';
import PlaygroundSection from './PlaygroundSection.jsx';
import ContactPage from './ContactPage.jsx';

import cloudDesktopLight from '../assets/transition/cloud-desktop-light.png';
import cloudDesktopDark from '../assets/transition/cloud-desktop-dark.png';
import cloudMobileLight from '../assets/transition/cloud-mobile-light.png';
import cloudMobileDark from '../assets/transition/cloud-mobile-dark.png';

// ============================================================================
// Hero -> cloud -> Intro transition.
//
// Page 1 (Hero) is `position: sticky; top: 0;` (see Hero.css), so it
// stays pinned to the top of the viewport as the page scrolls instead
// of scrolling away with the document. Page 2 (Intro) follows it
// immediately in normal document flow -- no gap, no dedicated cloud
// section, no added scroll distance -- and simply paints on top of it
// (later DOM sibling at the same auto stacking level). The result:
// scroll = 0 shows Hero filling the viewport exactly as before, and
// the moment the user scrolls down at all, Page 2's top edge climbs
// up from below and visibly rises over the still-pinned Hero, rather
// than the two just handing off edge-to-edge. No JS/scroll-linked
// animation needed -- it's ordinary document scroll doing the work.
//
// The cloud PNG is that top edge. It's rendered by Intro itself (see
// Intro.jsx/.css), absolutely positioned at the very top of Intro's
// own box, in front of Intro's background but behind its real
// content. Intro's own background is deliberately NOT a flat fill:
// it's transparent for the cloud's height and only ramps up to the
// real, theme-correct surface color across that same distance (see
// --cloud-h / the background gradient in Intro.css). So the PNG's
// actual alpha channel is what's on screen at the seam -- opaque
// cloud pixels paint the art, transparent pixels reveal Hero (Page 1)
// pinned behind it, exactly as the artwork intends. Past the cloud's
// height, Intro is fully opaque and Page 1 is completely covered.
// ============================================================================

export default function SceneTransition({ dark, onToggleTheme, onNavigate, onNavigateToWork, onBaruogOverlayChange }) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener ? mq.addEventListener('change', update) : mq.addListener(update);
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', update) : mq.removeListener(update);
    };
  }, []);

  // Resolved here (not inside Intro) so only the one correct asset for
  // the current device + theme is ever mounted -- never more than one
  // <img> in the DOM at a time.
  const cloudSrc = isMobile
    ? (dark ? cloudMobileDark : cloudMobileLight)
    : (dark ? cloudDesktopDark : cloudDesktopLight);

  return (
    <>
      {/* Just a sticky "track" for Hero to pin within -- see the
          comment on .hero-sticky-track in Hero.css for why this
          exists (bounding how long Hero stays pinned) and the
          matching negative margin on .intro-content in Intro.css
          (cancelling the extra space back out so Intro still starts
          exactly where it always did, right after Hero). */}
      <div className="hero-sticky-track" id="home">
        <Hero dark={dark} onToggleTheme={onToggleTheme} onNavigate={onNavigate} onNavigateToWork={onNavigateToWork} />
      </div>
      <Intro dark={dark} id="about-preview" cloudSrc={cloudSrc} />
      {/* Work lives directly below the full Home section (Hero + Intro),
          in the exact same scroll flow -- not a separate page, no header
          or theme toggle of its own. This is what the existing "Explore
          my work" CTA (Hero.jsx) and feature-card links (FeatureCards.jsx)
          already point at via href="#work". Work, Creative Lab, and every
          section below share the one persistent PrimaryNav mounted once
          at the App root (see PrimaryNav.jsx / App.jsx) instead of each
          section mounting its own separate nav instance. */}
      <WorkSection dark={dark} id="work" onNavigate={onNavigate} onNavigateToWork={onNavigateToWork} />
      {/* Creative Lab sits directly below Work, in the same scroll flow --
          not beside it, not a separate app, no route/page of its own. */}
      <CreativeLabSection dark={dark} id="creative-lab" onNavigate={onNavigate} onNavigateToWork={onNavigateToWork} />
      {/* About, Playground, and Contact all used to be separately-routed
          pages, mounted one at a time via a View Transitions crossfade
          (see the old App.jsx). They're now permanent sections in this
          same continuous scroll, directly below Creative Lab, in the
          required Home -> Work -> Creative Lab -> About -> Playground ->
          Contact order -- navigation for all three is handled entirely
          by the shared PrimaryNav/MobileNav mounted at the App root,
          same as Work and Creative Lab. */}
      <AboutPage dark={dark} id="about" onNavigate={onNavigate} onNavigateToWork={onNavigateToWork} />
      <PlaygroundSection dark={dark} id="playground" onNavigate={onNavigate} onNavigateToWork={onNavigateToWork} />
      <ContactPage dark={dark} id="contact" onNavigate={onNavigate} onNavigateToWork={onNavigateToWork} onBaruogOverlayChange={onBaruogOverlayChange} />
    </>
  );
}
