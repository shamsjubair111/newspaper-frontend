import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";

/**
 * InFocusCarousel
 * Auto-rotating, fully responsive video carousel for the "In Focus" section.
 *
 * Props:
 *  - videos:        array of article objects (each with videoUrl / thumbnail / etc.)
 *  - getTitle:      (article) => string
 *  - getCatName:    (category) => string
 *  - formatDate:    (dateString) => string
 *  - extractYouTubeId: (url) => string
 *  - autoPlayMs:    number (default 1000) — 0 disables autoplay
 */
const InFocusCarousel = ({
  videos = [],
  getTitle,
  getCatName,
  formatDate,
  extractYouTubeId,
  autoPlayMs = 3000,
}) => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [perView, setPerView] = useState(3);

  const trackRef = useRef(null);
  const timerRef = useRef(null);
  const touchStartX = useRef(null);
  const touchDeltaX = useRef(0);

  // Cap to a reasonable number of items
  const items = useMemo(() => videos.slice(0, 12), [videos]);

  // ── Responsive: how many cards visible at once ──────────────
  useEffect(() => {
    const computePerView = () => {
      const w = window.innerWidth;
      if (w <= 576) return 1;
      if (w <= 900) return 2;
      return 3;
    };
    const handleResize = () => setPerView(computePerView());
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Number of "pages" / valid start indices (so the last slide never leaves gaps)
  const maxIndex = Math.max(0, items.length - perView);

  // Keep current index valid when perView / items change
  useEffect(() => {
    setCurrent((c) => Math.min(c, maxIndex));
  }, [maxIndex]);

  const goTo = useCallback(
    (index) => {
      if (maxIndex === 0) {
        setCurrent(0);
        return;
      }
      // wrap-around
      let next = index;
      if (next < 0) next = maxIndex;
      if (next > maxIndex) next = 0;
      setCurrent(next);
    },
    [maxIndex],
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // ── Autoplay ────────────────────────────────────────────────
  useEffect(() => {
    if (!autoPlayMs || paused || items.length <= perView) return;
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c >= maxIndex ? 0 : c + 1));
    }, autoPlayMs);
    return () => clearInterval(timerRef.current);
  }, [autoPlayMs, paused, maxIndex, perView, items.length]);

  // ── Keyboard navigation ─────────────────────────────────────
  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  };

  // ── Touch / swipe ───────────────────────────────────────────
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    setPaused(true);
  };
  const onTouchMove = (e) => {
    if (touchStartX.current == null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const onTouchEnd = () => {
    const threshold = 50;
    if (touchDeltaX.current > threshold) prev();
    else if (touchDeltaX.current < -threshold) next();
    touchStartX.current = null;
    touchDeltaX.current = 0;
    setPaused(false);
  };

  if (items.length === 0) return null;

  // Width of each slide in %, plus translate offset
  const slideBasis = 100 / perView;
  const translatePct = current * slideBasis;

  const showControls = items.length > perView;
  const dotCount = maxIndex + 1;

  const thumbFor = (article) => {
    if (article.videoUrl && article.videoUrl.includes("youtube")) {
      const id = extractYouTubeId(article.videoUrl);
      if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
    return article.thumbnail || null;
  };

  return (
    <div
      className="ifc-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="In Focus videos"
    >
      <div
        className="ifc-viewport"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="ifc-track"
          ref={trackRef}
          style={{
            transform: `translateX(-${translatePct}%)`,
          }}
        >
          {items.map((article) => {
            const thumb = thumbFor(article);
            return (
              <div
                className="ifc-slide"
                key={article._id}
                style={{
                  flex: `0 0 ${slideBasis}%`,
                  maxWidth: `${slideBasis}%`,
                }}
              >
                <a
                  href={`/article/${article._id}`}
                  className="ifc-card"
                  aria-label={getTitle(article)}
                >
                  <div className="ifc-thumb">
                    {thumb ? (
                      <img src={thumb} alt={getTitle(article)} loading="lazy" />
                    ) : (
                      <div className="ifc-thumb-placeholder" />
                    )}
                    <div className="ifc-thumb-overlay" />
                    <div className="ifc-play-btn" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="30" height="30">
                        <circle
                          cx="12"
                          cy="12"
                          r="12"
                          fill="rgba(0,0,0,0.55)"
                        />
                        <polygon points="9.5,7 18,12 9.5,17" fill="#fff" />
                      </svg>
                    </div>
                  </div>
                  <div className="ifc-body">
                    {article.category?.name && (
                      <span className="ifc-label">
                        {getCatName(article.category) || article.category.name}
                      </span>
                    )}
                    <h3 className="ifc-title">{getTitle(article)}</h3>
                    <div className="ifc-meta">
                      {article.authorName && (
                        <span className="ifc-author">{article.authorName}</span>
                      )}
                      <span className="ifc-date">
                        {formatDate(article.createdAt)}
                      </span>
                    </div>
                  </div>
                </a>
              </div>
            );
          })}
        </div>

        {showControls && (
          <>
            <button
              type="button"
              className="ifc-nav ifc-nav--prev"
              onClick={prev}
              aria-label="Previous"
            >
              <svg viewBox="0 0 24 24" width="22" height="22">
                <polyline
                  points="15 18 9 12 15 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className="ifc-nav ifc-nav--next"
              onClick={next}
              aria-label="Next"
            >
              <svg viewBox="0 0 24 24" width="22" height="22">
                <polyline
                  points="9 18 15 12 9 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {showControls && dotCount > 1 && (
        <div className="ifc-dots" role="tablist">
          {Array.from({ length: dotCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`ifc-dot${i === current ? " is-active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-selected={i === current}
              role="tab"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InFocusCarousel;
