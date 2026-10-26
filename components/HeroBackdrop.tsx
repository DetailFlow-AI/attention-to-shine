// Background layer for the homepage hero.
//
// Today: an animated light reflection — soft light pools and a slow streak
// drifting across a near-black stage, like a studio light sliding along
// fresh paint. Pure CSS (see "Hero light reflection" in app/globals.css), so
// it costs no JavaScript and no downloads.
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │ FUTURE HERO VIDEO — this is the spot.                                   │
// │                                                                         │
// │ 1. Export a ~25s loop: MP4 (H.264), 1280×720 or 1920×1080, NO audio     │
// │    track, aim for under 4MB.                                            │
// │ 2. Grab one sharp still from it as a JPG (the fallback/poster).         │
// │ 3. Put both in /public/video/  e.g.  hero-loop.mp4 + hero-poster.jpg    │
// │ 4. Fill in HERO_VIDEO below. That's it — no other code changes.         │
// │                                                                         │
// │ The video plays muted, looped and inline (required for autoplay on      │
// │ iPhone). Visitors with "reduce motion" turned on get the still image    │
// │ instead. The light-reflection layer stays on top as a soft              │
// │ tint so the headline stays readable over any footage.                  │
// └─────────────────────────────────────────────────────────────────────────┘
const HERO_VIDEO = null as { src: string; poster: string } | null;
// const HERO_VIDEO = {
//   src: "/video/hero-loop.mp4",
//   poster: "/video/hero-poster.jpg",
// };

export default function HeroBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none hero-stage">
      {HERO_VIDEO && (
        <>
          {/* Still image: shown to reduced-motion users, and underneath the
              video while it loads. */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${HERO_VIDEO.poster})` }}
          />
          <video
            className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
            src={HERO_VIDEO.src}
            poster={HERO_VIDEO.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          {/* Darken footage so white text keeps its contrast. */}
          <div className="absolute inset-0 bg-navy-ink/70" />
        </>
      )}

      {/* Light reflection */}
      <div className="hero-streak" />
      <div className="hero-streak hero-streak--slow" />
      <div className="absolute left-1/2 bottom-[9%] h-px w-[min(900px,90vw)] -translate-x-1/2 hero-horizon" />

      {/* Fine grain so the gradients don't band on cheap screens. */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Fade into the section below. */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-navy-ink" />
    </div>
  );
}
