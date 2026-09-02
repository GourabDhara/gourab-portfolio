import avatar from '../assets/hero/avatar.png';
import './Header.css';

// Header is Home's brand + availability pill + theme toggle only now.
// Its nav pill was hoisted out into PrimaryNav (see PrimaryNav.jsx),
// the one persistent desktop navigation bar shared by every section
// including Home, so there's exactly one nav-pill DOM instance for the
// whole site instead of Header owning a second one that had to fade out
// as soon as the user scrolled past Home. Its own mobile
// hamburger/collapsible menu was likewise removed earlier in favor of
// the single persistent MobileNav mounted at the App root (see
// MobileNav.jsx), which covers every section including Home, so there
// is exactly one mobile nav implementation instead of a second one
// duplicated here.
//
// Header is plain position: absolute against Hero's .hero-stage (see
// .site-header in Header.css) -- the same as every other Hero layer --
// so it belongs visually to Home and scrolls away with it naturally,
// rather than staying fixed to the viewport independently of Home.
export default function Header({ dark = false, onToggleTheme }) {
  return (
    <header className="site-header">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">GD</span>
        <span className="brand-text">
          <span className="brand-name">GOURAB DHARA</span>
          <span className="brand-role">UI/UX &amp; Product Designer</span>
        </span>
      </div>

      <div className="header-right">
        <div className="pill pill-available">
          <img className="pill-avatar" src={avatar} alt="Gourab Dhara" />
          <span>Available for work</span>
          <span className="status-dot" aria-hidden="true" />
        </div>

        <button
          type="button"
          className="pill pill-toggle"
          aria-pressed={dark}
          aria-label={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          onClick={onToggleTheme}
        >
          {dark ? (
            <svg className="moon-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z"
                fill="#F2941E"
              />
            </svg>
          ) : (
            <svg className="sun-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="4.5" fill="#F2941E" />
              <g stroke="#F2941E" strokeWidth="1.6" strokeLinecap="round">
                <line x1="12" y1="1.5" x2="12" y2="4" />
                <line x1="12" y1="20" x2="12" y2="22.5" />
                <line x1="1.5" y1="12" x2="4" y2="12" />
                <line x1="20" y1="12" x2="22.5" y2="12" />
                <line x1="4.4" y1="4.4" x2="6.1" y2="6.1" />
                <line x1="17.9" y1="17.9" x2="19.6" y2="19.6" />
                <line x1="4.4" y1="19.6" x2="6.1" y2="17.9" />
                <line x1="17.9" y1="6.1" x2="19.6" y2="4.4" />
              </g>
            </svg>
          )}
          <span>{dark ? 'Dark Mode' : 'Light Mode'}</span>
          <span className={`switch${dark ? ' is-on' : ''}`}>
            <span className="switch-knob" />
          </span>
        </button>
      </div>
    </header>
  );
}
