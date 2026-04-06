import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Homepage.css";

const HomePage = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch articles
        const articlesResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/articles`,
        );
        const articlesData = await articlesResponse.json();

        // Fetch categories for grouping
        const categoriesResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/categories`,
        );
        const categoriesData = await categoriesResponse.json();

        setArticles(articlesData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get articles by category
  const getArticlesByCategory = (categoryId) => {
    return articles.filter(
      (article) =>
        article.category?._id === categoryId || article.category === categoryId,
    );
  };

  // Format date in Bengali
  const formatDateBengali = (dateString) => {
    const date = new Date(dateString);
    const months = [
      "জানুয়ারি",
      "ফেব্রুয়ারি",
      "মার্চ",
      "এপ্রিল",
      "মে",
      "জুন",
      "জুলাই",
      "আগস্ট",
      "সেপ্টেম্বর",
      "অক্টোবর",
      "নভেম্বর",
      "ডিসেম্বর",
    ];
    const bengaliNumerals = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

    const day = date
      .getDate()
      .toString()
      .split("")
      .map((d) => bengaliNumerals[parseInt(d)])
      .join("");
    const month = months[date.getMonth()];
    const year = date
      .getFullYear()
      .toString()
      .split("")
      .map((d) => bengaliNumerals[parseInt(d)])
      .join("");

    return `${day} ${month} ${year}`;
  };

  // Get excerpt from HTML content
  const getExcerpt = (htmlContent, length = 150) => {
    const text = htmlContent.replace(/<[^>]*>/g, "");
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
      <div className="container">
        <div className="row g-4 mt-3">
          {/* Main Content - Left Column */}
          <div className="col-lg-8">
            {/* Featured Articles Section */}
            <div className="featured-section mb-4">
              <div className="row g-3">
                {articles.slice(0, 4).map((article, index) => (
                  <div
                    key={article._id}
                    className={index === 0 ? "col-md-6" : "col-md-6"}
                  >
                    <Link
                      to={`/article/${article._id}`}
                      className="article-card featured-card"
                    >
                      {article.thumbnail && (
                        <div className="article-image">
                          <img src={article.thumbnail} alt={article.title} />
                        </div>
                      )}
                      <div className="article-content">
                        <h3 className="article-title">{article.title}</h3>
                        {article.summary && (
                          <p className="article-excerpt">{article.summary}</p>
                        )}
                        <div className="article-meta">
                          <span className="article-date">
                            {formatDateBengali(article.createdAt)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Sections */}
            {categories.map((category) => {
              const categoryArticles = getArticlesByCategory(category._id);
              if (categoryArticles.length === 0) return null;

              return (
                <div key={category._id} className="category-section mb-4">
                  <div className="category-header">
                    <h2 className="category-title">{category.name}</h2>
                  </div>

                  <div className="row g-3">
                    {/* First article with image */}
                    {categoryArticles[0] && (
                      <div className="col-md-6">
                        <Link
                          to={`/article/${categoryArticles[0]._id}`}
                          className="article-card medium-card"
                        >
                          {categoryArticles[0].thumbnail && (
                            <div className="article-image">
                              <img
                                src={categoryArticles[0].thumbnail}
                                alt={categoryArticles[0].title}
                              />
                            </div>
                          )}
                          <div className="article-content">
                            <h4 className="article-title">
                              {categoryArticles[0].title}
                            </h4>
                            <p className="article-excerpt">
                              {getExcerpt(categoryArticles[0].content, 120)}
                            </p>
                            <span className="article-date">
                              {formatDateBengali(categoryArticles[0].createdAt)}
                            </span>
                          </div>
                        </Link>
                      </div>
                    )}

                    {/* List of other articles */}
                    <div className="col-md-6">
                      <div className="article-list">
                        {categoryArticles.slice(1, 4).map((article) => (
                          <Link
                            key={article._id}
                            to={`/article/${article._id}`}
                            className="article-list-item"
                          >
                            <h5 className="list-article-title">
                              {article.title}
                            </h5>
                            <p className="list-article-excerpt">
                              {getExcerpt(article.content, 80)}
                            </p>
                            <span className="article-date">
                              {formatDateBengali(article.createdAt)}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar - Right Column */}
          <div className="col-lg-4">
            {/* Sidebar Articles */}
            <div className="sidebar-section">
              <div className="sidebar-header">
                <h3 className="sidebar-title">সাম্প্রতিক</h3>
              </div>

              <div className="sidebar-articles">
                {articles.slice(4, 10).map((article) => (
                  <Link
                    key={article._id}
                    to={`/article/${article._id}`}
                    className="sidebar-article"
                  >
                    {article.thumbnail && (
                      <div className="sidebar-image">
                        <img src={article.thumbnail} alt={article.title} />
                      </div>
                    )}
                    <div className="sidebar-content">
                      <h5 className="sidebar-article-title">{article.title}</h5>
                      <p className="sidebar-excerpt">
                        {getExcerpt(article.content, 60)}
                      </p>
                      <span className="article-date">
                        {formatDateBengali(article.createdAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Ad Placeholder */}
            <div className="ad-section mt-4">
              <div className="ad-placeholder">
                <p className="text-center text-muted">Advertisement</p>
              </div>
            </div>
          </div>
        </div>

        {/* More Articles Section */}
        <div className="row g-3 mt-4">
          <div className="col-12">
            <h2 className="section-title">আরও পড়ুন</h2>
          </div>
          {articles.slice(10, 16).map((article) => (
            <div key={article._id} className="col-md-4">
              <Link
                to={`/article/${article._id}`}
                className="article-card small-card"
              >
                {article.thumbnail && (
                  <div className="article-image">
                    <img src={article.thumbnail} alt={article.title} />
                  </div>
                )}
                <div className="article-content">
                  <h4 className="article-title">{article.title}</h4>
                  <span className="article-date">
                    {formatDateBengali(article.createdAt)}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
