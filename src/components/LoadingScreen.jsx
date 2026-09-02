import { useEffect, useState } from 'react';
import './LoadingScreen.css';
import loadingGraphic from '../assets/loading/loading-graphic.png';

/**
 * Premium loading/intro screen shown before the home page.
 * Centerpiece is the supplied bezier-curve/pen-tool illustration
 * (loading_in_between.png), composited over a code-drawn construction
 * grid with CSS scale/fade-in — no name or personal branding anywhere,
 * the focus stays entirely on the craft/design metaphor.
 *
 * Controlled entirely by the `hidden` prop from App.jsx, which waits
 * for both a minimum display time AND the hero's critical images to
 * finish loading before flipping it — so there's never a blank flash
 * or half-loaded hero revealed underneath.
 */
const PHRASES = [
  'CRAFTING PIXELS INTO PURPOSE',
  'DESIGNING THOUGHTFUL EXPERIENCES',
  'TURNING IDEAS INTO IMPACT',
];
const PHRASE_INTERVAL_MS = 1250;

export default function LoadingScreen({ hidden }) {
  const dots = [0, 1, 2, 3, 4];
  const [activeDot, setActiveDot] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const dotId = setInterval(() => {
      setActiveDot((d) => (d + 1) % dots.length);
    }, 260);

    const phraseId = setInterval(() => {
      setPhraseIndex((i) => (i + 1 < PHRASES.length ? i + 1 : i));
    }, PHRASE_INTERVAL_MS);

    return () => {
      clearInterval(dotId);
      clearInterval(phraseId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`loading-screen${hidden ? ' is-hidden' : ''}`} aria-hidden={hidden}>
      <div className="loading-status">
        LOADING EXPERIENCE
        <span className="loading-status-dot" />
      </div>

      <div className="loading-vertical" aria-hidden="true">
        <span>DESIGNING THOUGHTFUL EXPERIENCES</span>
        <span className="dot" />
      </div>

      <div className="loading-center">
        <div className="loading-graphic">
          <svg className="loading-graphic-grid" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="92" stroke="#c9bfa8" strokeWidth="1" strokeDasharray="3 5" />
            <circle cx="100" cy="100" r="65" stroke="#c9bfa8" strokeWidth="1" />
            <line x1="60" y1="20" x2="60" y2="180" stroke="#c9bfa8" strokeWidth="0.6" />
            <line x1="140" y1="20" x2="140" y2="180" stroke="#c9bfa8" strokeWidth="0.6" />
            <line x1="20" y1="60" x2="180" y2="60" stroke="#c9bfa8" strokeWidth="0.6" />
            <line x1="20" y1="140" x2="180" y2="140" stroke="#c9bfa8" strokeWidth="0.6" />
          </svg>

          <div className="loading-graphic-glow" aria-hidden="true" />

          <img
            className="loading-graphic-img"
            src={loadingGraphic}
            alt=""
            role="presentation"
            draggable="false"
          />
        </div>

        <p
          className="loading-copy"
          key={phraseIndex}
          style={phraseIndex === 0 ? { animationDelay: '1s' } : undefined}
        >
          {PHRASES[phraseIndex]}
        </p>

        <div className="loading-dots" aria-hidden="true">
          {dots.map((d) => (
            <span key={d} className={d === activeDot ? 'is-active' : ''} />
          ))}
        </div>

        <p className="loading-caption">LOADING&hellip;</p>
      </div>

      <div className="loading-quote">
        <span className="mark">&ldquo;</span>
        DESIGN IS THINKING MADE VISUAL.
        <span className="mark">&rdquo;</span>
      </div>
    </div>
  );
}
