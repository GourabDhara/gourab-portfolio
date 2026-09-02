import { useRef } from 'react';
import './CreativeLabSection.css';
import HoverMedia from './HoverMedia.jsx';

import visualStoriesCover from '../assets/creative-lab/thumbs/visual-stories.png';
import visualStoriesVideo from '../assets/creative-lab/videos/visual-stories.mp4';
import motionInFrameCover from '../assets/creative-lab/thumbs/motion-in-frame.png';
import motionInFrameVideo from '../assets/creative-lab/videos/motion-in-frame.mp4';
import logoBannerCover from '../assets/creative-lab/thumbs/logo-banner.png';
import logoBannerVideo from '../assets/creative-lab/videos/logo-banner.mp4';
import instagramEditsCover from '../assets/creative-lab/thumbs/instagram-edits.png';
import instagramEditsVideo from '../assets/creative-lab/videos/instagram-edits.mp4';

// ============================================================================
// Creative Lab — lives directly below Work in the same Home scroll flow
// (see SceneTransition.jsx), exactly like WorkSection. Not a standalone
// page: no header, no theme toggle, no routing of its own -- it reuses
// this portfolio's existing Header/ContextualNav and theme system.
//
// Ported from the supplied standalone Creative Lab project (plain
// HTML/CSS/JS) into this component. The four projects, their copy, tone
// colors and destination links are carried over as-is from that
// project's PROJECTS array; only the implementation changed (React
// instead of hand-rolled DOM creation), and the visual language was
// re-expressed with this portfolio's existing tokens/fonts/radii/motion
// curves (matching WorkSection's own approach) rather than the source
// project's separate design-token set, so the two sections read as one
// consistent system rather than two different sub-sites.
// ============================================================================

const PROJECTS = [
  {
    id: 'visual-stories',
    num: '01',
    title: 'Visual Stories',
    category: 'Social Media & Catalogue Design',
    url: 'https://www.behance.net/gallery/191856105/VISUAL-STORIES-SOCIAL-MEDIA-CATALOGUE-DESIGN',
    image: visualStoriesCover,
    video: visualStoriesVideo,
    tone: 'terracotta',
    coverLines: ['Visual', 'Stories'],
  },
  {
    id: 'motion-in-frame',
    num: '02',
    title: 'Motion in Frame',
    category: 'Motion Design',
    url: 'https://www.behance.net/gallery/191851203/MOTION-IN-FRAME-TRAILERS-AND-TEASERS',
    image: motionInFrameCover,
    video: motionInFrameVideo,
    tone: 'lavender',
    coverLines: ['Motion', 'in Frame'],
  },
  {
    id: 'logo-banner',
    num: '03',
    title: 'Logo & Banner Design',
    category: 'Visual Identity',
    url: 'https://www.behance.net/gallery/191830151/Logo-Banner-Design-Visual-Identity',
    image: logoBannerCover,
    video: logoBannerVideo,
    tone: 'amber',
    coverLines: null,
  },
  {
    id: 'instagram-edits',
    num: '04',
    title: 'Instagram Edits',
    category: '@baru_editz',
    url: 'https://www.instagram.com/baru_editz/',
    image: instagramEditsCover,
    video: instagramEditsVideo,
    tone: 'pink',
    coverLines: ['@baru_editz'],
  },
];

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 17 17 7M8 7h9v9"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CreativeCard({ project, index }) {
  const { title, category, url, image, video, num, tone, coverLines } = project;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="lab-card"
      role="listitem"
      style={{ '--stagger': index }}
      aria-label={`${title} — ${category}. Opens in a new tab.`}
    >
      <div className="lab-card-head">
        <div className="lab-card-meta">
          <span className="lab-card-num">{num}</span>
          <h3 className="lab-card-title">{title}</h3>
          <span className="lab-card-cat">{category}</span>
        </div>
        <span className="lab-card-arrow" aria-hidden="true">
          <ArrowIcon />
        </span>
      </div>

      {image ? (
        <HoverMedia
          containerClassName="lab-card-media"
          thumbnail={image}
          video={video}
          alt={`${title} project artwork`}
        />
      ) : (
        <div className="lab-card-media">
          <div className={`lab-card-cover tone-${tone}`}>
            <span>
              {coverLines.map((line, i) => (
                <span key={line}>
                  {line}
                  {i < coverLines.length - 1 && <br />}
                </span>
              ))}
            </span>
          </div>
        </div>
      )}
    </a>
  );
}

export default function CreativeLabSection({ dark = false, id, onNavigate, onNavigateToWork }) {
  const sectionRef = useRef(null);

  return (
    <section className="lab-section" data-theme={dark ? 'dark' : 'light'} id={id} aria-label="Creative Lab" ref={sectionRef}>
      <div className="lab-inner">
        <div className="lab-heading-block">
          <p className="lab-eyebrow">
            <span className="lab-eyebrow-dot" aria-hidden="true" />
            Creative Lab
          </p>
          <h2 className="lab-heading">
            Where ideas take <span className="lab-heading-accent">flight.</span>
          </h2>
          <p className="lab-subtitle">
            A space for visual storytelling, motion and everything I create for the love of it.
          </p>
        </div>

        <div className="lab-grid" role="list">
          {PROJECTS.map((project, i) => (
            <CreativeCard project={project} index={i} key={project.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
