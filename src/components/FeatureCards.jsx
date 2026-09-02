import './FeatureCards.css';
import mobileCard1 from '../assets/hero/mobile-card-1.png';
import mobileCard2 from '../assets/hero/mobile-card-2.png';
import mobileCard3 from '../assets/hero/mobile-card-3.png';

const CARDS = [
  {
    id: 'user-first',
    title: ['USER FIRST', 'THINKING'],
    body: 'I research, observe and understand real problems before jumping to solutions.',
    mobileImg: mobileCard1,
    mobileAlt: 'User First Thinking — I research, observe and understand real problems before jumping to solutions.',
    icon: (
      <svg viewBox="0 0 40 40" width="22" height="22" fill="none" aria-hidden="true">
        <circle cx="15" cy="12" r="5" stroke="#17140f" strokeWidth="2" />
        <path d="M6 30c0-5.5 4-9 9-9" stroke="#17140f" strokeWidth="2" strokeLinecap="round" />
        <circle cx="26" cy="26" r="6" stroke="#17140f" strokeWidth="2" />
        <line x1="30.3" y1="30.3" x2="35" y2="35" stroke="#17140f" strokeWidth="2" strokeLinecap="round" />
        <g stroke="#17140f" strokeWidth="1.6" strokeLinecap="round">
          <line x1="24" y1="3" x2="24" y2="6" />
          <line x1="30" y1="6" x2="28" y2="8" />
          <line x1="33" y1="11" x2="30" y2="11" />
        </g>
      </svg>
    ),
  },
  {
    id: 'design-code',
    title: ['DESIGN & CODE', 'AWARE'],
    body: 'I design with developer mindset for smooth, feasible and scalable experiences.',
    mobileImg: mobileCard2,
    mobileAlt: 'Design & Code Aware — I design with developer mindset for smooth, feasible and scalable experiences.',
    icon: (
      <svg viewBox="0 0 40 40" width="22" height="22" fill="none" aria-hidden="true">
        <path
          d="M14 12 6 20l8 8M26 12l8 8-8 8"
          stroke="#17140f"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'idea-impact',
    title: ['FROM IDEA TO', 'IMPACT'],
    body: 'I prototype, test and iterate to ship digital products that create real impact.',
    mobileImg: mobileCard3,
    mobileAlt: 'From Idea to Impact — I prototype, test and iterate to ship digital products that create real impact.',
    icon: (
      <svg viewBox="0 0 40 40" width="22" height="22" fill="none" aria-hidden="true">
        <path d="M20 8c-6 2-10 6-12 12" stroke="#17140f" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 8c6 2 10 6 12 12" stroke="#17140f" strokeWidth="2" strokeLinecap="round" />
        <circle cx="20" cy="8" r="2.2" fill="#17140f" />
        <circle cx="8" cy="20" r="2.2" fill="#17140f" />
        <circle cx="32" cy="20" r="2.2" fill="#17140f" />
        <path d="M20 8v14" stroke="#17140f" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 22h8l-4 10-4-10z" stroke="#17140f" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function FeatureCards() {
  return (
    <div className="feature-cards" role="list">
      {CARDS.map((card, i) => (
        <a
          href="#work"
          className="feature-card"
          role="listitem"
          key={card.id}
          style={{ '--stagger': i }}
        >
          {/* Mobile + Light Mode only: the actual uploaded card artwork,
              shown in place of the CSS-drawn content below. Mobile +
              Dark Mode keeps the CSS-drawn card (it's already dark-mode
              aware and matches the dark reference exactly), since no
              dark variant of this baked artwork exists. */}
          <img className="feature-card-mobile-img" src={card.mobileImg} alt={card.mobileAlt} />
          <span className="feature-icon">{card.icon}</span>
          <h3 className="feature-title">
            <span className="title-line">{card.title[0]}</span>{' '}
            <span className="title-line">{card.title[1]}</span>
          </h3>
          <p className="feature-body">{card.body}</p>
          <span className="feature-divider" />
          <span className="feature-arrow" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 18 18 6M18 6H9M18 6v9"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </a>
      ))}
    </div>
  );
}
