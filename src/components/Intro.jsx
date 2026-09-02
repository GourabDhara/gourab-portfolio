import './Intro.css';

// New section (previously did not exist in the project). Built to match
// the four supplied reference screenshots (desktop/mobile × light/dark).
// Pure presentational content — no scroll/transition logic lives here,
// so the exact same component can be reused as-is both for the real,
// scrollable Intro section AND as the "preview" painted inside the
// cloud transition (see SceneTransition.jsx), guaranteeing the two can
// never visually drift apart.

const CAPABILITIES = [
  {
    id: 'years',
    label: '4+ YEARS',
    body: 'Designing digital products & experiences',
    tone: 'amber',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
        <path
          d="M12 2.5c-3.6 0-6.4 2.8-6.4 6.3 0 2.4 1.3 4 2.5 5.2.6.6.9 1.3.9 2v.5h6v-.5c0-.7.3-1.4.9-2 1.2-1.2 2.5-2.8 2.5-5.2 0-3.5-2.8-6.3-6.4-6.3Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M9.5 19h5M10 21.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'dev',
    label: 'DEV MINDED',
    body: 'CSE background helps me bridge design & code',
    tone: 'blue',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
        <path
          d="M8.5 8 4 12l4.5 4M15.5 8l4.5 4-4.5 4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'e2e',
    label: 'END TO END',
    body: 'From research to prototype to launch',
    tone: 'green',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
        <path
          d="m19 3-1.4 4.6L3 12l14.6 4.4L19 21l1.4-4.6L21 12l-.6-4.4L19 3Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'user',
    label: 'USER FOCUSED',
    body: 'I design with empathy and real user needs',
    tone: 'terracotta',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.6" />
        <path d="M5 20c0-3.6 3.1-6.4 7-6.4s7 2.8 7 6.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
];

const TOOLS = ['Figma', 'Adobe Suite', 'After Effects', 'VS Code', 'HTML/CSS', 'JavaScript'];

// Hand-drawn-feeling wavy dashed flight path, matching the language of
// the underline-squiggle already used in the Hero headline. Kept as one
// long, gentle multi-hump curve so it reads as a single continuous
// path from the location pin to the paper plane.
function FlightPath() {
  return (
    <svg className="intro-flight-path" viewBox="0 0 1040 130" preserveAspectRatio="none" fill="none" aria-hidden="true">
      <path
        d="M14 18c58 62 110 88 170 66s96-84 168-70 92 96 176 84 110-96 182-92 100 74 168 46"
        stroke="var(--color-accent)"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeDasharray="2 15"
      />
      <circle cx="14" cy="18" r="6" fill="var(--color-accent)" />
    </svg>
  );
}

function PaperPlaneIcon() {
  return (
    <svg className="intro-plane" viewBox="0 0 64 64" width="52" height="52" aria-hidden="true">
      <path
        d="M60 6 6 27.5l19.5 6.5M60 6 36.5 58 25.5 34M60 6 25.5 34"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M60 6 25.5 34l7 4.5Z" fill="var(--color-accent-soft)" stroke="none" />
    </svg>
  );
}

export default function Intro({ dark = false, id, cloudSrc }) {
  return (
    <div className="intro-content" data-theme={dark ? 'dark' : 'light'} id={id}>
      {/* Decorative cloud transition. Absolutely positioned at the very
          top of this same themed box (not a separate section), so its
          transparent pixels can only ever reveal this element's own
          --intro-bg -- never a mismatched generic background. It sits
          in front of the background but behind .intro-inner (z-index
          below it, see Intro.css), and out of normal flow, so it adds
          zero extra height to the section. */}
      {cloudSrc && (
        <img
          className="intro-cloud"
          src={cloudSrc}
          alt=""
          role="presentation"
          aria-hidden="true"
          draggable="false"
        />
      )}
      <div className="intro-inner">
        <div className="intro-top">
          <p className="intro-location">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
              <path
                d="M12 21.5S5 14.6 5 9.8a7 7 0 1 1 14 0c0 4.8-7 11.7-7 11.7Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="9.6" r="2.4" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            Kolkata, India
          </p>

          <div className="intro-path-row">
            <FlightPath />
            <PaperPlaneIcon />
          </div>
        </div>

        <div className="intro-heading-block">
          <h2 className="intro-heading">
            I&rsquo;m Gourab, a <span className="intro-underline-wrap">UI/UX and Product Designer<svg className="intro-underline" viewBox="0 0 400 14" preserveAspectRatio="none" aria-hidden="true"><path d="M2 8c60-6 280-6 396 2" stroke="var(--color-accent)" strokeWidth="3" fill="none" strokeLinecap="round" /></svg></span>
            <br />
            who blends creativity with logic to craft meaningful digital experiences.
          </h2>
          <p className="intro-paragraph">
            With a Computer Science background, I bring a unique developer&rsquo;s mindset to
            design &mdash; understanding how things work behind the screen helps me design
            what works in the real world.
          </p>
        </div>

        <div className="intro-capabilities" role="list">
          {CAPABILITIES.map((cap) => (
            <div className="intro-cap" role="listitem" key={cap.id}>
              <span className={`intro-cap-icon tone-${cap.tone}`}>{cap.icon}</span>
              <div className="intro-cap-copy">
                <p className="intro-cap-label">{cap.label}</p>
                <p className="intro-cap-body">{cap.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="intro-tools">
          <span className="intro-tools-label">I work with</span>
          <div className="intro-tools-pills">
            {TOOLS.map((tool) => (
              <span className="intro-tool-pill" key={tool}>{tool}</span>
            ))}
          </div>
        </div>

        <div className="intro-quote">
          <span className="intro-quote-mark intro-quote-open" aria-hidden="true">&ldquo;</span>
          <p>Good design is not just how it looks, but how it works.</p>
          <span className="intro-quote-mark intro-quote-close" aria-hidden="true">&rdquo;</span>
        </div>
      </div>
    </div>
  );
}
