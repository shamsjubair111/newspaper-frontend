import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { useT } from "../context/translations";
import { authAPI } from "../services/api";

const MyBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { lang } = useLang();
  const t = useT(lang);

  useEffect(() => {
    const user = authAPI.getCurrentUser();
    if (!user) {
      navigate("/login");
      return;
    }
    fetchBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/bookmarks/my`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch bookmarks");
      const data = await res.json();
      setBookmarks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (articleId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(
        `${process.env.REACT_APP_API_URL}/api/bookmarks/${articleId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setBookmarks(bookmarks.filter((b) => b.article?._id !== articleId));
    } catch (err) {
      setError("Failed to remove bookmark");
    }
  };

  if (loading)
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );

  return (
    <div className="container py-4">
      <h2 className="mb-1">{t("bookmarksTitle")}</h2>
      <p className="text-muted mb-4">{t("bookmarksSaved", bookmarks.length)}</p>

      {error && <div className="alert alert-danger">{error}</div>}

      {bookmarks.length === 0 ? (
        <div className="text-center py-5">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ccc"
            strokeWidth="1.5"
            className="mb-3"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
          </svg>
          <p className="text-muted">{t("noBookmarks")}</p>
          <Link to="/" className="btn btn-primary mt-2">
            {t("browseArticles")}
          </Link>
        </div>
      ) : (
        <div className="row g-3">
          {bookmarks.map((b) => (
            <div className="col-md-6 col-lg-4" key={b._id}>
              <div className="card h-100 shadow-sm border-0">
                {b.article?.thumbnail && (
                  <img
                    src={b.article.thumbnail}
                    alt={b.article.title}
                    className="card-img-top"
                    style={{ height: "160px", objectFit: "cover" }}
                  />
                )}
                <div className="card-body d-flex flex-column">
                  <h6 className="card-title">{b.article?.title}</h6>
                  {b.article?.authorName && (
                    <p className="text-muted small mb-1">
                      {t("authorLabel")}
                      {b.article.authorName}
                    </p>
                  )}
                  {b.article?.category?.name && (
                    <span
                      className="badge bg-primary mb-2"
                      style={{ width: "fit-content" }}
                    >
                      {b.article.category.name}
                    </span>
                  )}
                  <p className="text-muted small mt-auto mb-2">
                    {t("savedLabel")}
                    {new Date(b.createdAt).toLocaleDateString()}
                  </p>
                  <div className="d-flex gap-2">
                    <Link
                      to={`/article/${b.article?._id}`}
                      className="btn btn-sm btn-primary flex-grow-1"
                    >
                      Read
                    </Link>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleRemove(b.article?._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookmarks;
