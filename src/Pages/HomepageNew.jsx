import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Homepage.css";
import { useLang } from "../context/LanguageContext";
import { useT, translations } from "../context/translations";
import { translateBatch } from "../context/translate";
import CalendarSidebar from "../components/CalendarSidebar";

const HomePage = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lang, filterDate, clearFilter } = useLang();
  const t = useT(lang);
  const [translatedTitles, setTranslatedTitles] = useState({});
  const [translatedExcerpts, setTranslatedExcerpts] = useState({});
  const [translatedCatNames, setTranslatedCatNames] = useState({});

  // Translate category names
  useEffect(() => {
    if (lang === "bn" || categories.length === 0) {
      setTranslatedCatNames({});
      return;
    }
    translateBatch(categories.map((c) => c.name)).then((names) => {
      const map = {};
      categories.forEach((c, i) => {
        map[c._id] = names[i];
      });
      setTranslatedCatNames(map);
    });
  }, [lang, categories]);

  const getCatName = (category) =>
    translatedCatNames[category._id] || category.name;

  // Translate titles
  useEffect(() => {
    if (lang === "bn" || articles.length === 0) {
      setTranslatedTitles({});
      return;
    }
    translateBatch(articles.map((a) => a.title)).then((titles) => {
      const map = {};
      articles.forEach((a, i) => {
        map[a._id] = titles[i];
      });
      setTranslatedTitles(map);
    });
  }, [lang, articles]);

  // Translate excerpts
  useEffect(() => {
    if (lang === "bn" || articles.length === 0) {
      setTranslatedExcerpts({});
      return;
    }
    const rawExcerpts = articles.map((a) => {
      const text = (a.content || "").replace(/<[^>]+>/g, "").trim();
      return text.substring(0, 300);
    });
    translateBatch(rawExcerpts).then((excerpts) => {
      const map = {};
      articles.forEach((a, i) => {
        map[a._id] = excerpts[i];
      });
      setTranslatedExcerpts(map);
    });
  }, [lang, articles]);

  const getTitle = (article) => translatedTitles[article._id] || article.title;

  const getExcerptStr = (article, length = 120) => {
    if (lang === "en") {
      if (translatedExcerpts[article._id]) {
        const ex = translatedExcerpts[article._id];
        return ex.length > length ? ex.substring(0, length) + "..." : ex;
      }
      return "...";
    }
    const text = (article.content || "").replace(/<[^>]+>/g, "").trim();
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [articlesRes, categoriesRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/api/articles`),
          fetch(`${process.env.REACT_APP_API_URL}/api/categories`),
        ]);
        const articlesData = await articlesRes.json();
        const categoriesData = await categoriesRes.json();
        setArticles(articlesData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter articles by selected date
  const filteredArticles = filterDate
    ? articles.filter((a) => {
        const d = new Date(a.createdAt || a.publishedAt);
        if (filterDate.day) {
          return (
            d.getFullYear() === filterDate.year &&
            d.getMonth() === filterDate.month &&
            d.getDate() === filterDate.day
          );
        }
        return (
          d.getFullYear() === filterDate.year &&
          d.getMonth() === filterDate.month
        );
      })
    : articles;

  const getArticlesByCategory = (categoryId) =>
    filteredArticles.filter(
      (a) => a.category?._id === categoryId || a.category === categoryId,
    );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const tr = translations[lang];
    const month = tr.months[date.getMonth()];
    if (lang === "en")
      return `${date.getDate()} ${month} ${date.getFullYear()}`;
    const toBn = (n) =>
      n
        .toString()
        .split("")
        .map((d) => tr.numerals[parseInt(d)])
        .join("");
    return `${toBn(date.getDate())} ${month} ${toBn(date.getFullYear())}`;
  };

  const extractYouTubeId = (url) => {
    if (!url) return "";
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return "";
  };

  const getCardThumb = (article) => {
    if (article.videoUrl && article.videoUrl.trim() !== "") {
      const ytId = extractYouTubeId(article.videoUrl);
      if (ytId)
        return {
          src: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
          isVideo: true,
        };
    }
    if (article.thumbnail) return { src: article.thumbnail, isVideo: false };
    return null;
  };

  if (loading) {
    return (
      <div className="hp-loading">
        <div className="spinner-border" role="status" />
      </div>
    );
  }

  const hero = filteredArticles[0];
  const featured = filteredArticles.slice(1, 3);
  const topGrid = filteredArticles.slice(3, 7);
  const moreGrid = filteredArticles.slice(7, 13);

  // Video section — articles that have a videoUrl
  const videoArticles = articles.filter(
    (a) => a.videoUrl && a.videoUrl.trim() !== "",
  );

  return (
    <div className="hp-page">
      {/* ── Date filter banner ── */}
      {filterDate && (
        <div className="hp-filter-banner">
          <span>
            {lang === "en" ? "Filtered: " : "ফিল্টার: "}
            <strong>
              {filterDate.day
                ? `${filterDate.day} ${translations[lang].months[filterDate.month]} ${filterDate.year}`
                : `${translations[lang].months[filterDate.month]} ${filterDate.year}`}
            </strong>
            {" — "}
            {filteredArticles.length}
            {lang === "en" ? " articles" : " টি নিবন্ধ"}
          </span>
          <button className="hp-filter-clear" onClick={clearFilter}>
            ✕
          </button>
        </div>
      )}

      {filterDate && filteredArticles.length === 0 && (
        <div className="hp-empty">
          <p>
            {lang === "en"
              ? "No articles for this date."
              : "এই তারিখে কোনো নিবন্ধ নেই।"}
          </p>
          <button
            className="btn btn-outline-secondary btn-sm mt-2"
            onClick={clearFilter}
          >
            {lang === "en" ? "Clear filter" : "ফিল্টার মুছুন"}
          </button>
        </div>
      )}

      {/* ── HERO ── */}
      {hero && (
        <div className="hp-hero">
          <Link to={`/article/${hero._id}`} className="hp-hero-link">
            {(() => {
              const media = getCardThumb(hero);
              return media ? (
                <div className="hp-hero-img">
                  <img src={media.src} alt={getTitle(hero)} />
                  <div className="hp-hero-overlay" />
                  {media.isVideo && (
                    <div className="hp-hero-play">
                      <svg viewBox="0 0 24 24" width="56" height="56">
                        <circle cx="12" cy="12" r="12" fill="rgba(0,0,0,0.5)" />
                        <polygon points="9.5,7 18,12 9.5,17" fill="white" />
                      </svg>
                    </div>
                  )}
                </div>
              ) : null;
            })()}
            <div className="hp-hero-body">
              {hero.category?.name && (
                <span className="hp-label">
                  {getCatName(hero.category) || hero.category.name}
                </span>
              )}
              <h1 className="hp-hero-title">{getTitle(hero)}</h1>
              <p className="hp-hero-excerpt">{getExcerptStr(hero, 160)}</p>
              <span className="hp-hero-date">{formatDate(hero.createdAt)}</span>
            </div>
          </Link>
        </div>
      )}

      <div className="hp-layout">
        <div className="hp-main">
          {/* ── FEATURED 2-col ── */}
          {featured.length > 0 && (
            <div className="hp-featured-row">
              {featured.map((article) => (
                <Link
                  key={article._id}
                  to={`/article/${article._id}`}
                  className="hp-featured-card"
                >
                  {(() => {
                    const m = getCardThumb(article);
                    return m ? (
                      <div
                        className="hp-card-img"
                        style={{ position: "relative" }}
                      >
                        <img src={m.src} alt={getTitle(article)} />
                        {m.isVideo && (
                          <div className="hp-card-play-icon">
                            <svg viewBox="0 0 24 24" width="36" height="36">
                              <circle
                                cx="12"
                                cy="12"
                                r="12"
                                fill="rgba(0,0,0,0.5)"
                              />
                              <polygon
                                points="9.5,7 18,12 9.5,17"
                                fill="white"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    ) : null;
                  })()}
                  <div className="hp-card-body">
                    {article.category?.name && (
                      <span className="hp-label">
                        {getCatName(article.category) || article.category.name}
                      </span>
                    )}
                    <h2 className="hp-card-title hp-card-title--lg">
                      {getTitle(article)}
                    </h2>
                    <p className="hp-card-excerpt">
                      {getExcerptStr(article, 100)}
                    </p>
                    <div className="hp-card-meta">
                      {article.authorName && (
                        <span className="hp-card-author">
                          {article.authorName}
                        </span>
                      )}
                      <span className="hp-card-date">
                        {formatDate(article.createdAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* ── TOP GRID 4-col ── */}
          {topGrid.length > 0 && (
            <div className="hp-grid-4">
              {topGrid.map((article) => (
                <Link
                  key={article._id}
                  to={`/article/${article._id}`}
                  className="hp-grid-card"
                >
                  {(() => {
                    const m = getCardThumb(article);
                    return m ? (
                      <div
                        className="hp-card-img"
                        style={{ position: "relative" }}
                      >
                        <img src={m.src} alt={getTitle(article)} />
                        {m.isVideo && (
                          <div className="hp-card-play-icon">
                            <svg viewBox="0 0 24 24" width="32" height="32">
                              <circle
                                cx="12"
                                cy="12"
                                r="12"
                                fill="rgba(0,0,0,0.5)"
                              />
                              <polygon
                                points="9.5,7 18,12 9.5,17"
                                fill="white"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    ) : null;
                  })()}
                  <div className="hp-card-body">
                    {article.category?.name && (
                      <span className="hp-label">
                        {getCatName(article.category) || article.category.name}
                      </span>
                    )}
                    <h3 className="hp-card-title">{getTitle(article)}</h3>
                    <p className="hp-card-excerpt">
                      {getExcerptStr(article, 80)}
                    </p>
                    <div className="hp-card-meta">
                      {article.authorName && (
                        <span className="hp-card-author">
                          {article.authorName}
                        </span>
                      )}
                      <span className="hp-card-date">
                        {formatDate(article.createdAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* ── CATEGORY SECTIONS ── */}
          {categories.map((category) => {
            // Skip Video category — it is shown in the In Focus section below
            if (category.name === "Video" || category.name === "ভিডিও")
              return null;
            const catArticles = getArticlesByCategory(category._id);
            if (catArticles.length === 0) return null;
            const [lead, ...rest] = catArticles;
            return (
              <div key={category._id} className="hp-cat-section">
                <div className="hp-cat-header">
                  <Link
                    to={`/${encodeURIComponent(category.name)}`}
                    className="hp-cat-name"
                  >
                    {getCatName(category)}
                  </Link>
                </div>
                <div className="hp-cat-grid">
                  <Link to={`/article/${lead._id}`} className="hp-cat-lead">
                    {(() => {
                      const m = getCardThumb(lead);
                      return m ? (
                        <div
                          className="hp-card-img hp-card-img--tall"
                          style={{ position: "relative" }}
                        >
                          <img src={m.src} alt={getTitle(lead)} />
                          {m.isVideo && (
                            <div className="hp-card-play-icon">
                              <svg viewBox="0 0 24 24" width="40" height="40">
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="12"
                                  fill="rgba(0,0,0,0.5)"
                                />
                                <polygon
                                  points="9.5,7 18,12 9.5,17"
                                  fill="white"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      ) : null;
                    })()}
                    <div className="hp-card-body">
                      <h3 className="hp-card-title hp-card-title--md">
                        {getTitle(lead)}
                      </h3>
                      <p className="hp-card-excerpt">
                        {getExcerptStr(lead, 110)}
                      </p>
                      <div className="hp-card-meta">
                        {lead.authorName && (
                          <span className="hp-card-author">
                            {lead.authorName}
                          </span>
                        )}
                        <span className="hp-card-date">
                          {formatDate(lead.createdAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="hp-cat-rest">
                    {rest.slice(0, 3).map((article) => (
                      <Link
                        key={article._id}
                        to={`/article/${article._id}`}
                        className="hp-cat-small"
                      >
                        {(() => {
                          const m = getCardThumb(article);
                          return m ? (
                            <div
                              className="hp-cat-small-img"
                              style={{ position: "relative" }}
                            >
                              <img src={m.src} alt={getTitle(article)} />
                              {m.isVideo && (
                                <div className="hp-card-play-icon hp-card-play-icon--sm">
                                  <svg
                                    viewBox="0 0 24 24"
                                    width="26"
                                    height="26"
                                  >
                                    <circle
                                      cx="12"
                                      cy="12"
                                      r="12"
                                      fill="rgba(0,0,0,0.5)"
                                    />
                                    <polygon
                                      points="9.5,7 18,12 9.5,17"
                                      fill="white"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                          ) : null;
                        })()}
                        <div className="hp-card-body">
                          <h4 className="hp-card-title hp-card-title--sm">
                            {getTitle(article)}
                          </h4>
                          <p className="hp-card-excerpt hp-card-excerpt--xs">
                            {getExcerptStr(article, 60)}
                          </p>
                          <div className="hp-card-meta">
                            {article.authorName && (
                              <span className="hp-card-author">
                                {article.authorName}
                              </span>
                            )}
                            <span className="hp-card-date">
                              {formatDate(article.createdAt)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* ── MORE ARTICLES 3-col ── */}
          {moreGrid.length > 0 && (
            <div className="hp-more-section">
              <div className="hp-section-header">
                <span className="hp-section-title">{t("readMore")}</span>
              </div>
              <div className="hp-grid-3">
                {moreGrid.map((article) => (
                  <Link
                    key={article._id}
                    to={`/article/${article._id}`}
                    className="hp-grid-card"
                  >
                    {(() => {
                      const m = getCardThumb(article);
                      return m ? (
                        <div
                          className="hp-card-img"
                          style={{ position: "relative" }}
                        >
                          <img src={m.src} alt={getTitle(article)} />
                          {m.isVideo && (
                            <div className="hp-card-play-icon">
                              <svg viewBox="0 0 24 24" width="32" height="32">
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="12"
                                  fill="rgba(0,0,0,0.5)"
                                />
                                <polygon
                                  points="9.5,7 18,12 9.5,17"
                                  fill="white"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      ) : null;
                    })()}
                    <div className="hp-card-body">
                      {article.category?.name && (
                        <span className="hp-label">
                          {getCatName(article.category) ||
                            article.category.name}
                        </span>
                      )}
                      <h3 className="hp-card-title">{getTitle(article)}</h3>
                      <p className="hp-card-excerpt">
                        {getExcerptStr(article, 80)}
                      </p>
                      <div className="hp-card-meta">
                        {article.authorName && (
                          <span className="hp-card-author">
                            {article.authorName}
                          </span>
                        )}
                        <span className="hp-card-date">
                          {formatDate(article.createdAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── IN FOCUS / VIDEO SECTION ── */}
          {videoArticles.length > 0 && (
            <div className="hp-video-section">
              <div className="hp-section-header">
                <span className="hp-section-title hp-section-title--video">
                  ▶ {t("inFocus")}
                </span>
              </div>
              <div className="hp-video-grid">
                {videoArticles.slice(0, 6).map((article) => (
                  <a
                    key={article._id}
                    href={`/article/${article._id}`}
                    className="hp-video-card"
                  >
                    <div className="hp-video-thumb">
                      {article.videoUrl &&
                      article.videoUrl.includes("youtube") ? (
                        <img
                          src={`https://img.youtube.com/vi/${extractYouTubeId(article.videoUrl)}/hqdefault.jpg`}
                          alt={getTitle(article)}
                        />
                      ) : article.thumbnail ? (
                        <img src={article.thumbnail} alt={getTitle(article)} />
                      ) : (
                        <div className="hp-video-thumb-placeholder" />
                      )}
                      <div className="hp-video-play-btn">
                        <svg
                          viewBox="0 0 24 24"
                          fill="white"
                          width="36"
                          height="36"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="12"
                            fill="rgba(0,0,0,0.55)"
                          />
                          <polygon points="9.5,7 18,12 9.5,17" fill="white" />
                        </svg>
                      </div>
                    </div>
                    <div className="hp-card-body">
                      {article.category?.name && (
                        <span className="hp-label hp-label--video">
                          {getCatName(article.category) ||
                            article.category.name}
                        </span>
                      )}
                      <h3 className="hp-card-title hp-card-title--sm">
                        {getTitle(article)}
                      </h3>
                      <div className="hp-card-meta">
                        {article.authorName && (
                          <span className="hp-card-author">
                            {article.authorName}
                          </span>
                        )}
                        <span className="hp-card-date">
                          {formatDate(article.createdAt)}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* end hp-main */}
        <CalendarSidebar />
      </div>
      {/* end hp-layout */}
    </div>
  );
};

export default HomePage;
