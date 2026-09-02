import { useEffect, useRef, useState } from 'react';

// ============================================================================
// HoverMedia — shared project-media element used by both WorkSection and
// CreativeLabSection.
//
// Default state: shows the static `thumbnail`. On desktop hover (real
// mouse + hover-capable pointer only — never on touch), it lazily loads
// `video`, waits for it to actually be decodable, then crossfades to it;
// the video autoplays muted + looped. On hover-out it fades back to the
// thumbnail and resets the video to frame 0 so the next hover starts
// clean. If the video fails to load, the thumbnail simply stays put.
//
// Data-driven on purpose: pass thumbnail/video/alt and it works inside
// any existing media container (`.work-card-media`, `.lab-card-media`),
// inheriting that container's own aspect-ratio/sizing/rounded-corner CSS
// rather than defining its own layout.
// ============================================================================

export default function HoverMedia({ thumbnail, video, alt, containerClassName }) {
  const videoRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [wantsPlay, setWantsPlay] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const canHoverRef = useRef(false);
  useEffect(() => {
    canHoverRef.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }, []);

  const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const activate = () => {
    if (!canHoverRef.current || videoFailed || prefersReducedMotion()) return;
    if (!videoSrc) setVideoSrc(video); // lazy-load: only fetched on first hover
    setWantsPlay(true);
  };

  const deactivate = () => {
    setWantsPlay(false);
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    try {
      el.currentTime = 0;
    } catch {
      // Ignore — element may not have a readable duration yet.
    }
  };

  // Only actually .play() once the browser confirms the clip is
  // decodable, and only if the pointer is still hovering — this is what
  // keeps the thumbnail as the reliable fallback with no blank/flash.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (wantsPlay && videoReady) {
      const p = el.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }
  }, [wantsPlay, videoReady]);

  const isPlaying = wantsPlay && videoReady && !videoFailed;

  return (
    <div
      className={`${containerClassName}${isPlaying ? ' media-playing' : ''}`}
      onMouseEnter={activate}
      onMouseLeave={deactivate}
    >
      <img src={thumbnail} alt={alt} loading="lazy" />
      {!videoFailed && (
        <video
          ref={videoRef}
          src={videoSrc || undefined}
          className="media-video"
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          onLoadedData={() => setVideoReady(true)}
          onError={() => setVideoFailed(true)}
        />
      )}
    </div>
  );
}
