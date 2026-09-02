import { useCallback, useEffect, useRef, useState } from 'react';

import avatar from '../assets/hero/avatar.png';
import magnifyingGlass from '../assets/contact/magnifying-glass.png';
import baruogLogo from '../assets/contact/baruog-logo.png';
import clickHereBtn from '../assets/contact/click-here-btn.png';
import classifiedFolder from '../assets/contact/classified-folder.png';
import topSecretNote from '../assets/contact/top-secret-note.png';
import dashedArrowAsset from '../assets/contact/dashed-arrow.png';
import sparkOrange from '../assets/contact/spark-large-orange.png';
import sparkPurple from '../assets/contact/spark-purple.png';
import sparkDot from '../assets/contact/spark-dot.png';
import sparkSmall1 from '../assets/contact/spark-small-1.png';
import sparkSmall2 from '../assets/contact/spark-small-2.png';
import './ContactPage.css';

// Sourced from the reference composition supplied for this page (no
// contact info previously existed anywhere in the codebase to reuse).
// Values are clean, human-readable labels — never raw URLs — per the
// "no visible raw URLs" requirement; the real destination lives only
// in href.
const CONTACT_CARDS = [
  {
    id: 'email',
    label: 'Email',
    value: 'dharagourab24@gmail.com',
    href: 'mailto:dharagourab24@gmail.com',
    badge: 'peach',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2.4" stroke="currentColor" strokeWidth="1.8" />
        <path d="m4 6.5 8 6.2 8-6.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    value: 'Connect with me',
    href: 'https://linkedin.com/in/gourab-dhara-3731a62b3',
    badge: 'lavender',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
        <rect x="2" y="9" width="4" height="12" rx="0.6" fill="currentColor" />
        <circle cx="4" cy="4.5" r="2.3" fill="currentColor" />
        <path
          d="M10 9h3.8v1.8h.05c.53-.98 1.83-2 3.77-2 4.03 0 4.78 2.53 4.78 5.83V21h-4v-5.6c0-1.34-.03-3.07-1.98-3.07-1.98 0-2.28 1.46-2.28 2.97V21h-4V9Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: 'github',
    label: 'GitHub',
    value: 'See my code',
    href: 'https://github.com/GourabDhara',
    badge: 'green',
    icon: (
      <svg viewBox="0 0 24 24" width="21" height="21" fill="none" aria-hidden="true">
        <path
          d="M12 2C6.48 2 2 6.58 2 12.2c0 4.5 2.87 8.32 6.84 9.67.5.1.68-.22.68-.5 0-.24-.01-1.03-.01-1.87-2.78.62-3.37-1.22-3.37-1.22-.46-1.19-1.11-1.51-1.11-1.51-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.95.68 1.92 0 1.39-.01 2.51-.01 2.85 0 .28.18.61.69.5A10.03 10.03 0 0 0 22 12.2C22 6.58 17.52 2 12 2Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: 'talk',
    label: "Let's Talk",
    value: 'Schedule a quick call',
    href: 'mailto:dharagourab24@gmail.com?subject=Let%27s%20talk',
    badge: 'amber',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
        <path
          d="M21 3 3 10.5l6.3 2.4L12 21l3.4-6.4L21 3Zm0 0-11.4 9.9"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

// Behance is presented separately as a compact pill rather than a
// fifth grid card, per "prefer a visually balanced solution rather
// than squeezing a fifth card into the row."
const BEHANCE = {
  label: 'Behance',
  href: 'https://www.behance.net/gourabdhara',
  icon: (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
      <path
        d="M0 7.5h7.3c3.6 0 5 1.4 5 3.6 0 1.5-.7 2.5-2 3 1.7.5 2.6 1.7 2.6 3.5 0 2.7-1.9 4.1-5.4 4.1H0V7.5Zm3.2 6.1h3.5c1.4 0 2.2-.6 2.2-1.8 0-1.1-.8-1.7-2.2-1.7H3.2v3.5Zm0 6.4h3.7c1.6 0 2.5-.7 2.5-2 0-1.2-.9-1.9-2.5-1.9H3.2v3.9ZM14.2 9.7h6.9v1.9h-6.9V9.7ZM24 16.6h-7.6c.1 1.7 1.1 2.6 2.6 2.6 1.1 0 1.9-.5 2.2-1.3h2.6c-.5 2.1-2.4 3.4-4.8 3.4-3.3 0-5.5-2.2-5.5-5.6 0-3.3 2.2-5.7 5.4-5.7 3.6 0 5.4 2.7 5.1 6.6Zm-7.5-1.8h4.7c-.1-1.5-1.1-2.3-2.3-2.3-1.3 0-2.2.8-2.4 2.3Z"
        fill="#fff"
      />
    </svg>
  ),
};

const ARROW_COLORS = { peach: '#f2941e', lavender: '#7c6ff0', green: '#4a9b4a', amber: '#f2941e' };

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 18 18 6M18 6H9M18 6v9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlaneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true">
      <path
        d="M21 3 3 10.5l6.3 2.4L12 21l3.4-6.4L21 3Zm0 0-11.4 9.9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 9.6h17M8 3v3.6M16 3v3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="8.4" cy="13.6" r="1.15" fill="currentColor" />
      <circle cx="12.4" cy="13.6" r="1.15" fill="currentColor" />
      <circle cx="8.4" cy="17" r="1.15" fill="currentColor" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <path
        d="M13.2 2.6 4.8 13.4h5.4l-1.4 8 9-11.3h-5.6l1-7.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.4V12l3.2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M12 2c.6 3.6 2 5.9 6 6.6-4 .7-5.4 3-6 6.6-.6-3.6-2-5.9-6-6.6 4-.7 5.4-3 6-6.6Z" />
      <path d="M19.4 14.2c.3 1.9 1 3 3 3.4-2 .3-2.7 1.5-3 3.4-.3-1.9-1-3-3-3.4 2-.3 2.7-1.5 3-3.4Z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M21 3 3 10.5l6.3 2.4L12 21l3.4-6.4L21 3Zm0 0-11.4 9.9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
      <path
        d="M4 12a8 8 0 0 1 13.9-5.4M20 12a8 8 0 0 1-13.9 5.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M17.5 3.5v3.6h-3.6M6.5 20.5v-3.6h3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ up }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true" style={{ transform: up ? 'rotate(180deg)' : 'none' }}>
      <path d="M6 9.5 12 15l6-5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const AVAILABILITY_ITEMS = [
  {
    id: 'available',
    badge: 'peach',
    icon: <CalendarIcon />,
    title: 'Currently Available',
    body: 'Open for freelance projects & exciting opportunities',
  },
  {
    id: 'response',
    badge: 'amber',
    icon: <BoltIcon />,
    title: 'Typical Response',
    body: 'Within 24 hours',
  },
  {
    id: 'timezone',
    badge: 'lavender',
    icon: <ClockIcon />,
    title: 'Time Zone',
    body: 'IST (UTC +5:30)',
  },
];

const WHY_ITEMS = [
  { icon: '🕶️', title: 'Not a gangstar.', body: 'I design, not crime scenes.' },
  { icon: '💭', title: 'Overthinker.', body: "That's my real superpower." },
  { icon: '☕', title: 'Professional procrastinator.', body: 'But only with style.' },
];

// ==========================================================================
// Gourab AI — a small, local, rule-based portfolio assistant. No backend
// or API key involved: it matches the visitor's message against a set of
// keyword-tagged intents drawn only from real portfolio content (see
// CONTACT_CARDS/AVAILABILITY_ITEMS above and the profile facts baked into
// the replies below), and falls back to pointing at email for anything
// it doesn't recognize. Nothing here is invented — no clients, awards or
// experience beyond what already appears on the site.
// ==========================================================================
const SUGGESTED_QUESTIONS = [
  'What services do you offer?',
  'Tell me about your process',
  'View selected projects',
  'Availability for new projects?',
];

const CHAT_INTENTS = [
  {
    id: 'availability',
    keywords: ['availab', 'free right now', 'hire', 'open for work', 'busy'],
    reply:
      "I'm currently available for freelance projects and new opportunities. I typically respond within 24 hours, and I'm based in India (IST, UTC +5:30).",
  },
  {
    id: 'services',
    keywords: ['service', 'offer', 'what do you do', 'what can you'],
    reply:
      "I focus on UI/UX design, product design, and graphic design — everything from user flows and wireframes to polished, high-fidelity interfaces in Figma and Adobe XD. I also build front ends (HTML, CSS, JavaScript, React) when a project needs the design brought to life in code.",
  },
  {
    id: 'process',
    keywords: ['process', 'how do you work', 'workflow', 'approach'],
    reply:
      "I usually start by understanding the problem and the user, move into wireframes and user flows, iterate on the UI in Figma, and refine with feedback before handing off clean, developer-ready files. For projects that need it, I can build the front end myself too.",
  },
  {
    id: 'projects',
    // Deliberately no bare "work" here — it's too broad and was
    // swallowing availability/process questions that happen to
    // mention "freelance work" or "how do you work". Project names
    // are included so asking about one by name routes here too.
    keywords: ['project', 'portfolio', 'case stud', 'showcase', 'bhojon', 'campusease', 'og-zone', 'flowai', 'nivara'],
    reply:
      "A few things I'm proud of: Bhojon Roshik, CampusEase, OG-Zone, and FlowAI/Nivara, alongside other graphic design and video work. You can browse it all on Behance, or ask me about a specific one.",
  },
  {
    id: 'contact',
    keywords: ['contact', 'email', 'reach you', 'get in touch'],
    reply: "Easiest way is email — dharagourab24@gmail.com — or just fill out the form on this page and I'll get back to you within a day.",
  },
  {
    id: 'behance',
    keywords: ['behance'],
    reply: 'You can see my full design portfolio on Behance: behance.net/gourabdhara',
  },
  {
    id: 'github',
    keywords: ['github', 'repo', 'source code'],
    reply: "My code and front-end experiments are on GitHub — you'll find the link in the contact cards above on this page.",
  },
  {
    id: 'experience',
    keywords: ['experience', 'skill', 'background', 'tool', 'year', 'qualif'],
    reply:
      "I'm a UI/UX and Graphic Designer with 4+ years of experience, including time at WEFIK India and freelance work since 2021 on Fiverr and Freelancer. My toolkit is Figma, Adobe XD, Photoshop, Illustrator, InDesign, After Effects and Premiere Pro, plus HTML, CSS, JavaScript and React.",
  },
  {
    id: 'schedule',
    keywords: ['call', 'schedule', 'meet up'],
    reply:
      'I\u2019d love to chat! Use the "Schedule a Call" option or the "Let\'s Talk" card above to reach out, and I\u2019ll find a time that works for you.',
  },
  {
    id: 'greeting',
    keywords: ['hi', 'hello', 'hey', 'yo', 'sup'],
    reply: 'Hey there! \ud83d\udc4b Ask me about my services, process, projects, or availability — or tap one of the quick questions below.',
  },
  {
    id: 'thanks',
    keywords: ['thank', 'thanks', 'appreciate', 'cheers'],
    reply: "You're welcome! Let me know if there's anything else you'd like to know.",
  },
];

const FALLBACK_REPLY =
  "I'm not totally sure about that one — but I'd love to help. Try asking about my services, process, projects, or availability, or reach Gourab directly at dharagourab24@gmail.com.";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Plain substring matching lets short keywords like "hi" false-fire
// inside unrelated words ("this", "shirt"). Requiring a non-letter
// (or start-of-string) right before the keyword keeps intentional
// prefix matches like "availab" (inside "availability"/"available")
// working, while stopping "hi" from matching inside "this".
function matchesKeyword(text, keyword) {
  return new RegExp(`(^|[^a-z0-9])${escapeRegExp(keyword)}`).test(text);
}

function getBotReply(input) {
  const text = input.toLowerCase();
  const hit = CHAT_INTENTS.find((intent) => intent.keywords.some((kw) => matchesKeyword(text, kw)));
  return hit ? hit.reply : FALLBACK_REPLY;
}

const CHAT_GREETING = "Hi there! \ud83d\udc4b\nI'm Gourab's AI assistant.\nHow can I help you today?";

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function ChatbotPanel() {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState(() => [{ id: 'greet', role: 'assistant', text: CHAT_GREETING }]);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const idRef = useRef(1);
  const bodyRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const node = bodyRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, isTyping, open]);

  useEffect(() => () => clearTimeout(typingTimeoutRef.current), []);

  const pushMessage = useCallback((role, text) => {
    idRef.current += 1;
    setMessages((msgs) => [...msgs, { id: `m${idRef.current}`, role, text }]);
  }, []);

  const sendMessage = useCallback(
    (text) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      pushMessage('user', trimmed);
      setDraft('');
      setIsTyping(true);

      const delay = prefersReducedMotion() ? 30 : 480 + Math.random() * 420;
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        pushMessage('assistant', getBotReply(trimmed));
      }, delay);
    },
    [pushMessage]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(draft);
  };

  const handleReset = () => {
    clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
    setMessages([{ id: 'greet', role: 'assistant', text: CHAT_GREETING }]);
    setDraft('');
  };

  return (
    <aside className={`chatbot-panel${open ? '' : ' is-collapsed'}`} aria-label="Gourab AI assistant">
      <header className="chatbot-header">
        <span className="chatbot-header-icon" aria-hidden="true">
          <SparkleIcon />
        </span>
        <span className="chatbot-header-title">Gourab AI</span>
        <div className="chatbot-header-actions">
          <button type="button" className="chatbot-icon-btn" onClick={handleReset} aria-label="Reset conversation" title="Reset conversation">
            <RefreshIcon />
          </button>
          <button
            type="button"
            className="chatbot-icon-btn"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Minimize chat' : 'Expand chat'}
            title={open ? 'Minimize chat' : 'Expand chat'}
          >
            <ChevronIcon up={open} />
          </button>
        </div>
      </header>

      {open && (
        <div className="chatbot-collapsible">
          <div className="chatbot-body" ref={bodyRef} role="log" aria-live="polite">
            {messages.map((m) => (
              <div key={m.id} className={`chatbot-msg chatbot-msg-${m.role}`}>
                {m.role === 'assistant' && <img className="chatbot-avatar" src={avatar} alt="" aria-hidden="true" />}
                <p>
                  {m.text.split('\n').map((line, i, arr) => (
                    <span key={i}>
                      {line}
                      {i < arr.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              </div>
            ))}
            {isTyping && (
              <div className="chatbot-msg chatbot-msg-assistant chatbot-msg-typing" aria-label="Gourab AI is typing">
                <img className="chatbot-avatar" src={avatar} alt="" aria-hidden="true" />
                <span className="chatbot-typing-dots">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            )}
          </div>

          <div className="chatbot-suggestions">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button type="button" key={q} className="chatbot-suggestion-chip" onClick={() => sendMessage(q)}>
                {q}
              </button>
            ))}
          </div>

          <form className="chatbot-input-row" onSubmit={handleSubmit}>
            <label className="visually-hidden" htmlFor="chatbot-input">
              Type your message
            </label>
            <input
              id="chatbot-input"
              type="text"
              autoComplete="off"
              placeholder="Type your message..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button type="submit" className="chatbot-send-btn" aria-label="Send message" disabled={!draft.trim()}>
              <SendIcon />
            </button>
          </form>
          <p className="chatbot-disclaimer">AI assistant can make mistakes.</p>
        </div>
      )}
    </aside>
  );
}

// ==========================================================================
// Palindrome animation — BARUOG -> GOURAB
// "BARUOG" reversed is exactly "GOURAB" (B-A-R-U-O-G -> G-O-U-R-A-B), so
// each letter has one fixed mirror partner at the mirrored index. Rather
// than crossfading two separate strings, every slot keeps its position
// and flips in place (a 3D horizontal-flip through the Y axis) from the
// BARUOG letter to its GOURAB counterpart, timed last-index-to-first so
// the reveal visibly runs backwards across the word — the animation IS
// the explanation, not decoration next to it. Slowed and staggered
// generously (vs. an earlier faster pass) so each letter's flip is
// individually readable rather than reading as a blur.
// ==========================================================================
const PALINDROME_SOURCE = 'BARUOG';
const PALINDROME_TARGET = 'GOURAB'; // PALINDROME_SOURCE.split('').reverse().join('')
const PALINDROME_HOLD_MS = 2000; // how long BARUOG stays fully visible before any letter starts flipping
const PALINDROME_LETTER_MS = 280; // stagger between each letter's flip start
const PALINDROME_FLIP_MS = 900; // duration of a single letter's flip

function PalindromeAnimation({ playKey, reduceMotion }) {
  const letters = PALINDROME_SOURCE.split('');
  const total = letters.length;

  if (reduceMotion) {
    // Static equivalent: both words shown at once with a mirror axis
    // between them, preserving the explanation without motion.
    return (
      <div className="palindrome-static" aria-hidden="true">
        <span className="palindrome-static-word">
          {PALINDROME_SOURCE.slice(0, 4)}
          <span className="mirror-right-og">{PALINDROME_SOURCE.slice(4)}</span>
        </span>
        <span className="palindrome-static-axis" />
        <span className="palindrome-static-word palindrome-static-word-target">{PALINDROME_TARGET}</span>
      </div>
    );
  }

  return (
    <div className="palindrome-stage" aria-hidden="true" key={playKey}>
      <div className="palindrome-word">
        <svg className="palindrome-sweep" width="100%" height="100%" viewBox="0 0 320 90" preserveAspectRatio="none" aria-hidden="true">
          <rect className="palindrome-sweep-bar" x="300" y="0" width="6" height="90" rx="3" />
        </svg>
        {letters.map((letter, i) => {
          // Last letter flips first: reverse the stagger order so the
          // reveal visibly travels from the end of the word toward the
          // start, matching how GOURAB reads as BARUOG run backwards.
          // PALINDROME_HOLD_MS is added to every delay so the full word
          // sits fully visible and readable before any letter moves.
          const order = total - 1 - i;
          const delay = PALINDROME_HOLD_MS + order * PALINDROME_LETTER_MS;
          const mirroredLetter = PALINDROME_TARGET[i];
          const isOg = i >= 4; // BARU|OG split, matches mirror-right-og accent on the starting word
          const slotStyle = { animationDelay: `${delay}ms`, '--flip-duration': `${PALINDROME_FLIP_MS}ms` };
          return (
            <span
              className="palindrome-letter-slot"
              key={i}
              style={slotStyle}
            >
              <span className={`palindrome-letter-face palindrome-letter-front${isOg ? ' is-og' : ''}`}>
                {letter}
              </span>
              <span className="palindrome-letter-face palindrome-letter-back">
                {mirroredLetter}
              </span>
            </span>
          );
        })}
      </div>
      <p className="palindrome-caption">Yep, that&rsquo;s me. Baruog &rarr; Gourab.</p>
    </div>
  );
}

function BaruOgOverlay({ open, onClose, titleId }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [playKey, setPlayKey] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Replay the flip sequence fresh every time the overlay opens, rather
  // than leaving stale mid-animation state if it's opened more than once.
  useEffect(() => {
    if (open) setPlayKey((k) => k + 1);
  }, [open]);

  // Focus trap + Escape-to-close, mirroring standard accessible-dialog
  // behavior; scoped to this component since no shared modal primitive
  // exists yet in the project to reuse.
  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const node = dialogRef.current;
      if (!node) return;
      const focusable = node.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="baruog-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className="baruog-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
      >
        {/* Close button now lives outside .baruog-modal-scroll (the
            actual overflow-y: auto element -- see its CSS comment) so
            it's no longer a descendant of the scrolling box. Previously
            it was positioned absolute *inside* that scrolling content,
            so on mobile -- where the content is taller than the
            viewport -- it scrolled away with everything else and
            wasn't where the user tapped anymore. It's still visually
            the same circular ✕ in the same corner of the same modal;
            it just no longer scrolls with the content underneath it. */}
        <button type="button" className="baruog-close" onClick={onClose} aria-label="Close" ref={closeButtonRef}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6 18 18M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="baruog-modal-scroll">
          <p className="baruog-kicker">
            <span className="baruog-scribble scribble-left" aria-hidden="true" />
            WHY AM I CALLED
            <span className="baruog-scribble scribble-right" aria-hidden="true" />
          </p>
          <h2 id={titleId} className="baruog-title">
            <span className="baruog-word-baru">BARU</span><span className="baruog-word-dash">-</span><span className="baruog-word-og">OG</span> <span className="baruog-qmark">?</span>
          </h2>
          <p className="baruog-sub">It&rsquo;s actually written <span className="baruog-underline-word">backwards</span>.</p>

          <div className="baruog-mirror-box">
            <PalindromeAnimation playKey={playKey} reduceMotion={reduceMotion} />
          </div>

          <p className="baruog-warning-label">But fair warning:</p>
          <div className="baruog-why-grid">
            {WHY_ITEMS.map((item) => (
              <div className="baruog-why-item" key={item.title}>
                <span className="why-icon" aria-hidden="true">{item.icon}</span>
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </div>
            ))}
          </div>

          <div className="baruog-final">
            <span className="final-icon" aria-hidden="true">💡</span>
            <p>So yeah, not OG. Just Baru-OG.<br />Confusing? Good. Memorable? Better.</p>
            <span className="final-spark" aria-hidden="true">✦</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage({ dark, id, onNavigate, onNavigateToWork, onBaruogOverlayChange }) {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [formValues, setFormValues] = useState({ name: '', email: '', subject: '', message: '' });
  // 'idle' | 'submitting' | 'success' | 'error'
  const [formStatus, setFormStatus] = useState('idle');
  const stageRef = useRef(null);

  const openOverlay = useCallback(() => setOverlayOpen(true), []);
  const closeOverlay = useCallback(() => setOverlayOpen(false), []);

  // Mirror this page's own overlayOpen state up to the App root purely
  // so the shared PrimaryNav/MobileNav (mounted outside this component,
  // see App.jsx) can hide themselves while the overlay is open. The
  // overlay's own open/close state and behavior are untouched -- this
  // is a read-only report of it, not a new source of truth.
  useEffect(() => {
    onBaruogOverlayChange?.(overlayOpen);
    return () => onBaruogOverlayChange?.(false);
  }, [overlayOpen, onBaruogOverlayChange]);

  // Submits to Netlify Forms via fetch, matching the hidden static form
  // declared in index.html (name="contact", same field names). Netlify
  // intercepts POSTs to "/" whose body includes a matching form-name.
  const encodeFormData = (data) =>
    Object.keys(data)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
      .join('&');

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    if (formStatus === 'submitting') return;

    const form = event.target;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setFormStatus('submitting');

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encodeFormData({ 'form-name': 'contact', ...formValues }),
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Form submission failed with status ${response.status}`);
        setFormStatus('success');
        setFormValues({ name: '', email: '', subject: '', message: '' });
      })
      .catch(() => {
        setFormStatus('error');
      });
  }, [formValues, formStatus]);

  const updateField = (field) => (event) => {
    setFormValues((values) => ({ ...values, [field]: event.target.value }));
  };

  return (
    <section className="contact-page" data-theme={dark ? 'dark' : 'light'} ref={stageRef} id={id} aria-label="Contact">
      <div className="contact-bg contact-bg-day" aria-hidden="true" />
      <div className="contact-bg contact-bg-night" aria-hidden="true" />
      <div className="theme-glow" aria-hidden="true" />

      <section className="contact-hero" aria-labelledby="contact-title">
        <div className="contact-copy">
          <p className="contact-kicker"><span />LET&rsquo;S CONNECT</p>
          <h1 id="contact-title">
            Let&rsquo;s create<br />
            something<br />
            <span className="contact-headline-hand">extraordinary<span className="hand-dot">.</span></span>
          </h1>
          <p className="contact-lede">Have a project in mind, a question, or just want to say hi? I&rsquo;d love to hear from you.</p>

          <div className="contact-hero-deco" aria-hidden="true">
            <svg className="hero-flight-svg" viewBox="0 0 320 200" fill="none" preserveAspectRatio="xMinYMid meet">
              <path
                className="hero-flight-path"
                d="M4 168c72 30 152 18 190-32 24-32 38-76 100-100"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="1 14"
              />
              <g className="hero-flight-plane" transform="translate(210 0) rotate(24)">
                <path d="M0 38 84 0 50 22 30 46Z" className="plane-fill" />
                <path d="M50 22 84 0 30 46Z" className="plane-fold" />
                <path d="M0 38 84 0M50 22 30 46" strokeLinejoin="round" strokeLinecap="round" />
              </g>
              <path className="hero-flight-spark spark-star" d="M22 84l4.6 11 11 4.6-11 4.6-4.6 11-4.6-11-11-4.6 11-4.6z" />
              <circle className="hero-flight-spark spark-dot-a" cx="296" cy="88" r="4.4" />
              <circle className="hero-flight-spark spark-dot-b" cx="172" cy="24" r="3.2" />
            </svg>
          </div>
        </div>

        <div className="contact-cards-wrap">
          <div className="contact-cards" role="list">
            {CONTACT_CARDS.map((card) => (
              <a
                key={card.id}
                href={card.href}
                target={card.href.startsWith('http') ? '_blank' : undefined}
                rel={card.href.startsWith('http') ? 'noreferrer' : undefined}
                className="contact-card"
                role="listitem"
              >
                <span className={`contact-card-icon badge-${card.badge}`}>{card.icon}</span>
                <span className="contact-card-label">{card.label}</span>
                <span className="contact-card-value">{card.value}</span>
                <span className={`contact-card-arrow badge-${card.badge}`} style={{ color: ARROW_COLORS[card.badge] }}>
                  <ArrowIcon />
                </span>
              </a>
            ))}

            <div className="contact-deco-dots" aria-hidden="true">
              {Array.from({ length: 12 }).map((_, i) => <span key={i} />)}
            </div>
          </div>

          <a href={BEHANCE.href} target="_blank" rel="noreferrer" className="behance-pill">
            <span className="behance-pill-icon">{BEHANCE.icon}</span>
            See my work on <strong>{BEHANCE.label}</strong>
            <ArrowIcon />
          </a>

          <div className="availability-strip" role="list" aria-label="Availability information">
            {AVAILABILITY_ITEMS.map((item, i) => (
              <div className="availability-item" role="listitem" key={item.id}>
                {i > 0 && <span className="availability-divider" aria-hidden="true" />}
                <span className={`availability-icon badge-${item.badge}`}>{item.icon}</span>
                <span className="availability-copy">
                  <strong>{item.title}</strong>
                  <span>{item.body}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="contact-rhythm-connector" aria-hidden="true">
        <span className="connector-dot" />
        <span className="connector-dot" />
        <span className="connector-dot" />
      </div>

      <div className="contact-form-row">
        <section className="contact-form-section" aria-labelledby="send-message-title">
          <div className="form-copy">
            <h2 id="send-message-title">Send a Message<span className="form-underline" aria-hidden="true" /></h2>
            <p>Fill out the form and I&rsquo;ll get back to you as soon as possible.</p>
            <svg className="form-squiggle" width="70" height="18" viewBox="0 0 70 18" fill="none" aria-hidden="true">
              <path d="M2 9c4-8 8-8 12 0s8 8 12 0 8-8 12 0 8 8 12 0 8-8 12 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>

            <div className="quick-chat-card">
              <span className="quick-chat-icon" aria-hidden="true"><PlaneIcon /></span>
              <div className="quick-chat-copy">
                <strong>Prefer a quick chat?</strong>
                <p>Book a 15-min call and let&rsquo;s talk about your idea.</p>
                <a
                  href="mailto:dharagourab24@gmail.com?subject=Schedule%20a%2015-min%20call"
                  className="quick-chat-btn"
                >
                  Schedule a Call
                  <ArrowIcon />
                </a>
              </div>
            </div>
          </div>

          <form
            className="contact-form"
            name="contact"
            method="POST"
            data-netlify="true"
            data-netlify-honeypot="bot-field"
            onSubmit={handleSubmit}
          >
            <input type="hidden" name="form-name" value="contact" />
            <p className="visually-hidden">
              <label>
                Don&rsquo;t fill this out if you&rsquo;re human: <input name="bot-field" tabIndex="-1" autoComplete="off" />
              </label>
            </p>

            <div className="form-row">
              <label className="visually-hidden" htmlFor="contact-name">Your Name</label>
              <input id="contact-name" name="name" type="text" placeholder="Your Name" value={formValues.name} onChange={updateField('name')} required disabled={formStatus === 'submitting'} />

              <label className="visually-hidden" htmlFor="contact-email">Your Email</label>
              <input id="contact-email" name="email" type="email" placeholder="Your Email" value={formValues.email} onChange={updateField('email')} required disabled={formStatus === 'submitting'} />
            </div>

            <label className="visually-hidden" htmlFor="contact-subject">Subject</label>
            <input id="contact-subject" name="subject" type="text" placeholder="Subject" value={formValues.subject} onChange={updateField('subject')} disabled={formStatus === 'submitting'} />

            <label className="visually-hidden" htmlFor="contact-message">Your Message</label>
            <textarea id="contact-message" name="message" placeholder="Your Message" rows="5" value={formValues.message} onChange={updateField('message')} required disabled={formStatus === 'submitting'} />

            <button type="submit" className="send-message-btn" disabled={formStatus === 'submitting'} aria-busy={formStatus === 'submitting'}>
              {formStatus === 'submitting' ? 'Sending…' : 'Send Message'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 3 3 10.5l6.3 2.4L12 21l3.4-6.4L21 3Zm0 0-11.4 9.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {formStatus === 'success' && (
              <p className="form-status form-status-success" role="status">
                Thanks! Your message has been sent — I&rsquo;ll get back to you soon.
              </p>
            )}
            {formStatus === 'error' && (
              <p className="form-status form-status-error" role="alert">
                Something went wrong sending your message. Please try again.
              </p>
            )}
          </form>
        </section>

        <ChatbotPanel />
      </div>

      <section className="baruog-section" aria-label="Baru-OG">
        <div className="baruog-decor" aria-hidden="true">
          <img src={sparkOrange} className="baruog-deco deco-spark-orange" alt="" />
          <img src={sparkPurple} className="baruog-deco deco-spark-purple" alt="" />
          <img src={sparkDot} className="baruog-deco deco-spark-dot" alt="" />
          <img src={sparkSmall1} className="baruog-deco deco-spark-small-a" alt="" />
          <img src={sparkSmall2} className="baruog-deco deco-spark-small-b" alt="" />
        </div>

        <div className="baruog-glass-col">
          <img src={magnifyingGlass} className="baruog-glass-img" alt="" />
        </div>

        <div className="baruog-name-col">
          <p className="baruog-fact-kicker"><span />ONE FACT ABOUT ME</p>
          <p className="baruog-intro">Some people know me as</p>
          <img src={baruogLogo} className="baruog-wordmark" alt="BARU-OG" />
        </div>

        <img src={dashedArrowAsset} className="baruog-connector-arrow" alt="" aria-hidden="true" />

        <div className="baruog-story-col">
          <p className="baruog-story-text">
            It&rsquo;s not just a name.<br />There&rsquo;s a story behind it.
          </p>
          <p className="baruog-cta">Want to know why?</p>
          <button
            type="button"
            className="baruog-click-btn"
            onClick={openOverlay}
            aria-haspopup="dialog"
            aria-expanded={overlayOpen}
          >
            <img src={clickHereBtn} alt="" aria-hidden="true" />
            <span className="visually-hidden">Reveal why I&rsquo;m called Baru-OG</span>
          </button>
        </div>

        <div className="baruog-folder-col" aria-hidden="true">
          <img src={topSecretNote} className="baruog-topsecret-img" alt="" />
          <img src={classifiedFolder} className="baruog-folder-img" alt="" />
        </div>
      </section>

      <BaruOgOverlay open={overlayOpen} onClose={closeOverlay} titleId="baruog-title" />
    </section>
  );
}
