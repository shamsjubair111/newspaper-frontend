import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { useT, translations } from "../context/translations";
import { translateBatch, translateText } from "../context/translate";

const CategoryPage = () => {
  const { categoryName, subcategoryName } = useParams();
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { lang } = useLang();
  const t = useT(lang);
  const [translatedTitles, setTranslatedTitles] = useState({});
  const [translatedPageTitle, setTranslatedPageTitle] = useState("");
  const [translatedCatName, setTranslatedCatName] = useState("");

  useEffect(() => {
    fetchData();
  }, [categoryName, subcategoryName]);

  const decode = (str) => decodeURIComponent(str || "");

  const fetchData = async () => {
    try {
      setLoading(true);
      const API = process.env.REACT_APP_API_URL;
      const decodedCat = decode(categoryName);
      const decodedSub = decode(subcategoryName);

      const catRes = await fetch(`${API}/api/categories`);
      const allCats = await catRes.json();
      const matchedCat = allCats.find((c) => c.name === decodedCat);
      if (!matchedCat) throw new Error(`Category "${decodedCat}" not found`);
      setCategory(matchedCat);

      let matchedSub = null;
      if (subcategoryName) {
        const subRes = await fetch(`${API}/api/subcategories`);
        const allSubs = await subRes.json();
        matchedSub = allSubs.find(
          (s) =>
            s.name === decodedSub &&
            (s.category?._id === matchedCat._id ||
              s.category === matchedCat._id),
        );
        setSubcategory(matchedSub || null);
      } else {
        setSubcategory(null);
      }

      const artRes = await fetch(`${API}/api/articles`);
      const allArts = await artRes.json();
      const filtered = allArts.filter((a) => {
        const catMatch =
          a.category?._id === matchedCat._id || a.category === matchedCat._id;
        if (matchedSub) {
          const subMatch =
            a.subcategory?._id === matchedSub._id ||
            a.subcategory === matchedSub._id;
          return catMatch && subMatch;
        }
        return catMatch;
      });
      // Sort newest first
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setArticles(filtered);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Translate names
  useEffect(() => {
    if (lang === "bn") {
      setTranslatedPageTitle("");
      setTranslatedCatName("");
      return;
    }
    if (category?.name) translateText(category.name).then(setTranslatedCatName);
    const pageName = subcategory ? subcategory.name : category?.name;
    if (pageName) translateText(pageName).then(setTranslatedPageTitle);
  }, [lang, category, subcategory]);

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

  const getTitle = (article) => translatedTitles[article._id] || article.title;

  const getExcerpt = (article, length = 120) => {
    const text = (article.content || "").replace(/<[^>]+>/g, "").trim();
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

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

  if (loading)
    return (
      <div className="cp-page">
        <div className="cp-loading">
          <div className="spinner-border" role="status" />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="cp-page">
        <div className="cp-error">
          <p>{error}</p>
          <Link to="/" className="cp-back-btn">
            {t("backHome")}
          </Link>
        </div>
      </div>
    );

  const pageTitle =
    lang === "en" && translatedPageTitle
      ? translatedPageTitle
      : subcategory
        ? subcategory.name
        : category?.name;

  const displayCatName = (lang === "en" && translatedCatName) || category?.name;

  const hero = articles[0];
  const grid = articles.slice(1);

  return (
    <div className="cp-page">
      {/* ── Header ── */}
      <div className="cp-header">
        <div className="cp-header-inner">
          {/* Breadcrumb */}
          <nav className="cp-breadcrumb">
            <Link to="/" className="cp-breadcrumb-link">
              {t("breadcrumbHome")}
            </Link>
            {category && (
              <>
                <span className="cp-breadcrumb-sep">/</span>
                <Link
                  to={`/${encodeURIComponent(category.name)}`}
                  className="cp-breadcrumb-link"
                >
                  {displayCatName}
                </Link>
              </>
            )}
            {subcategory && (
              <>
                <span className="cp-breadcrumb-sep">/</span>
                <span className="cp-breadcrumb-current">{pageTitle}</span>
              </>
            )}
          </nav>

          {/* Title */}
          <h1 className="cp-title">{pageTitle}</h1>
          <p className="cp-count">{t("articlesCount", articles.length)}</p>
        </div>
      </div>

      {/* ── No articles ── */}
      {articles.length === 0 && (
        <div className="cp-empty">
          <p>{t("noArticles")}</p>
          <Link to="/" className="cp-back-btn">
            {t("backHome")}
          </Link>
        </div>
      )}

      {/* ── Hero article ── */}
      {hero && (
        <div className="cp-hero">
          <Link to={`/article/${hero._id}`} className="cp-hero-link">
            {hero.thumbnail && (
              <div className="cp-hero-img">
                <img src={hero.thumbnail} alt={getTitle(hero)} />
                <div className="cp-hero-overlay" />
              </div>
            )}
            <div className="cp-hero-body">
              <span className="cp-label">{pageTitle}</span>
              <h2 className="cp-hero-title">{getTitle(hero)}</h2>
              <p className="cp-hero-excerpt">{getExcerpt(hero, 200)}</p>
              <div className="cp-hero-meta">
                {hero.authorName && (
                  <span className="cp-hero-author">{hero.authorName}</span>
                )}
                <span className="cp-hero-date">
                  {formatDate(hero.createdAt)}
                </span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* ── Article grid ── */}
      {grid.length > 0 && (
        <div className="cp-container">
          <div className="cp-grid">
            {grid.map((article) => (
              <Link
                key={article._id}
                to={`/article/${article._id}`}
                className="cp-card"
              >
                {article.thumbnail && (
                  <div className="cp-card-img">
                    <img src={article.thumbnail} alt={getTitle(article)} />
                  </div>
                )}
                <div className="cp-card-body">
                  <span className="cp-label">{pageTitle}</span>
                  <h3 className="cp-card-title">{getTitle(article)}</h3>
                  <p className="cp-card-excerpt">{getExcerpt(article, 100)}</p>
                  <div className="cp-card-meta">
                    {article.authorName && (
                      <span className="cp-card-author">
                        {article.authorName}
                      </span>
                    )}
                    <span className="cp-card-date">
                      {formatDate(article.createdAt)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
