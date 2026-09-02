import { useRef } from 'react';

import paperPlane from '../assets/hero/paper-plane.png';
import './AboutPage.css';

import statExperience from '../assets/about/stats/experience.png';
import statProjects from '../assets/about/stats/projects.png';
import statIdeas from '../assets/about/stats/ideas.png';
import statDedication from '../assets/about/stats/dedication.png';

import skillUiux from '../assets/about/skills/uiux.png';
import skillFigma from '../assets/about/skills/figma.png';
import skillUserResearch from '../assets/about/skills/userresearch.png';
import skillInteractionDesign from '../assets/about/skills/interactiondesign.png';
import skillWireframing from '../assets/about/skills/wireframing.png';
import skillPrototyping from '../assets/about/skills/prototyping.png';
import skillVisualDesign from '../assets/about/skills/visualdesign.png';
import skillDesignSystems from '../assets/about/skills/designsystems.png';
import skillHtmlCss from '../assets/about/skills/htmlcss.png';
import skillJavascript from '../assets/about/skills/javascript.png';

import flagIndia from '../assets/about/skills/flag-india.png';
import flagUk from '../assets/about/skills/flag-uk.png';

const STATS = [
  [statExperience, '4+', 'Years of', 'Experience'],
  [statProjects, '20+', 'Projects', 'Completed'],
  [statIdeas, '∞', 'Ideas', 'Brewing'],
  [statDedication, '100%', 'Dedication', ''],
];

const SKILLS = [
  ['UI/UX Design', skillUiux],
  ['Figma', skillFigma],
  ['User Research', skillUserResearch],
  ['Interaction Design', skillInteractionDesign],
  ['Wireframing', skillWireframing],
  ['Prototyping', skillPrototyping],
  ['Visual Design', skillVisualDesign],
  ['Design Systems', skillDesignSystems],
  ['HTML / CSS', skillHtmlCss],
  ['JavaScript', skillJavascript],
];

const LANGUAGES = [
  [flagIndia, 'Bengali', 'Native'],
  [flagUk, 'English', 'Fluent'],
  [flagIndia, 'Hindi', 'Conversational'],
];

function SectionTitle({ icon, children }) {
  return <h2 className="about-section-title"><span>{icon}</span>{children}<i /></h2>;
}

function Timeline({ children }) {
  return <div className="about-timeline">{children}</div>;
}

// About is now a section inside the same continuous scroll as every
// other part of the portfolio (see SceneTransition.jsx), not a
// separately-routed page -- its own <Header> + basic hide-on-scroll
// was removed in favor of ContextualNav, the same minimal six-button
// nav Work/Creative Lab already use (see ContextualNav.jsx), so there's
// one navigation implementation instead of a second one duplicated
// here. Everything else -- visual design, dark/light theming, all the
// entrance/hover animations below -- is untouched.
export default function AboutPage({ dark, id, onNavigate, onNavigateToWork }) {
  const stageRef = useRef(null);

  return (
    <section className="about-page" data-theme={dark ? 'dark' : 'light'} ref={stageRef} id={id} aria-label="About">
      <div className="about-bg about-bg-day" aria-hidden="true" />
      <div className="about-bg about-bg-night" aria-hidden="true" />

      {/* Same glow element/keyframes as Hero (see .theme-glow / themeGlowPulse
          in Hero.css) -- reused as-is, not recreated, exactly like the
          --reveal-radius mask above it. Only its container-specific
          positioning is set locally, in AboutPage.css. */}
      <div className="theme-glow" aria-hidden="true" />

      <section className="about-hero" aria-labelledby="about-title">
        <div className="about-copy">
          <p className="about-kicker"><span /> About me</p>
          <h1 id="about-title">Designer by passion.<br /><strong>Problem solver by mindset.</strong></h1>
          <p className="about-lede">I&rsquo;m Gourab Dhara, a UI/UX and Product Designer who blends creativity with logic to craft meaningful digital experiences. With a Computer Science background, I bridge the gap between technology and design to build solutions that are both beautiful and impactful.</p>
        </div>

        <div className="about-visual" aria-hidden="true">
          <span className="visual-sun" />
          <span className="visual-dots dots-top">· · ·<br />· · ·</span>
          <img src={paperPlane} className="about-plane" alt="" />
          <span className="flight-path path-one" />
          <span className="flight-path path-two" />
          <div className="about-note note-peach">I design<br />things that<br />make sense<br />and feel<br />right.</div>
          <div className="about-note note-blue">Design<br />is thinking<br />made<br />visual.</div>
          <div className="about-note note-green">User<br />focused</div>
          <span className="tiny-spark spark-one">✦</span>
          <span className="tiny-spark spark-two">✦</span>
        </div>
      </section>

      <section className="about-stats" aria-label="Career highlights">
        {STATS.map(([icon, value, lineOne, lineTwo]) => <article className="about-stat" key={value}>
          <span className="stat-icon"><img src={icon} alt="" loading="lazy" /></span><div><strong>{value}</strong><p>{lineOne}<br />{lineTwo}</p></div>
        </article>)}
      </section>

      <section className="about-details" aria-label="Education and experience">
        <article className="about-panel education-panel reveal-panel">
          <SectionTitle icon="⌂">Education</SectionTitle>
          <Timeline>
            <div><time>2022 – 2026</time><h3>B.Tech in Computer Science &amp; Engineering</h3><p>College of Engineering &amp; Management, Kolaghat<br />MAKAUT, WB</p></div>
            <div><time>2020 – 2022</time><h3>Higher Secondary (12th)</h3><p>WBCHSE</p></div>
            <div><time>2018 – 2020</time><h3>Secondary (10th)</h3><p>WBBSE</p></div>
          </Timeline>
          <div className="education-sketch" aria-hidden="true">⌂<br /><span>════</span></div>
        </article>

        <article className="about-panel experience-panel reveal-panel">
          <SectionTitle icon="▣">Experience</SectionTitle>
          <Timeline>
            <div><time>Aug 2023 – Aug 2024</time><h3>UI/UX Designer &amp; Graphic Designer</h3><p>WEFIK</p><ul><li>Designed intuitive interfaces for web and mobile apps</li><li>Created visual assets including logos, banners and marketing materials</li><li>Worked closely with development teams to ensure design consistency</li></ul></div>
            <div><time>2021 – Present</time><h3>Freelance Designer</h3><p>Fiverr &amp; Freelancer</p><ul><li>Completed numerous graphic design and video editing projects</li><li>Maintained stellar reputation with consistently positive feedback</li><li>Adapted to diverse project requirements across multiple industries</li></ul></div>
          </Timeline>
        </article>
      </section>

      <section className="about-bottom">
        <article className="about-panel skills-panel reveal-panel"><SectionTitle icon="&lt;/&gt;">Skills</SectionTitle><div className="skill-grid">{SKILLS.map(([skill, icon]) => <div key={skill}><b><img src={icon} alt="" loading="lazy" /></b><span>{skill}</span></div>)}</div></article>
        <article className="about-panel language-panel reveal-panel"><SectionTitle icon="◎">Languages</SectionTitle><div className="languages">{LANGUAGES.map(([flag, name, level]) => <p key={name}><span><img className="flag-icon" src={flag} alt="" loading="lazy" />{name}</span><b>{level}</b></p>)}</div><div className="map-line" aria-hidden="true">• ───── ✦ ───── •</div></article>
      </section>

      <footer className="about-quote"><span>“</span><p>I code <em>the logic</em>.<br />I design <em>the feeling</em>.</p><span>”</span></footer>
    </section>
  );
}
