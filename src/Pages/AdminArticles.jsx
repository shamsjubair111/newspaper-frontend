import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI, authorAPI } from "../services/api";

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ articleAuthor: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = authAPI.getCurrentUser();
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchArticles();
    fetchAuthors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/articles`);
      if (!res.ok) throw new Error("Failed to fetch articles");
      const data = await res.json();
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setArticles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthors = async () => {
    try {
      setAuthors(await authorAPI.getAuthors());
    } catch (err) {
      console.error("Error fetching authors:", err);
    }
  };

  const startEdit = (article) => {
    setEditingId(article._id);
    setEditData({ articleAuthor: article.articleAuthor?._id || "" });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ articleAuthor: "" });
  };

  const handleEditSave = async (articleId, title) => {
    if (!editData.articleAuthor) {
      setError("Please select an author.");
      return;
    }
    setEditLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/articles/${articleId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ articleAuthor: editData.articleAuthor }),
        },
      );
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Update failed");
      }
      const fullAuthor = authors.find((a) => a._id === editData.articleAuthor);
      setArticles((prev) =>
        prev.map((a) =>
          a._id === articleId ? { ...a, articleAuthor: fullAuthor } : a,
        ),
      );
      setSuccessMsg(`"${title}" author updated.`);
      setTimeout(() => setSuccessMsg(""), 3000);
      cancelEdit();
    } catch (err) {
      setError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (articleId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(articleId);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/articles/${articleId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete article");
      }
      setArticles((prev) => prev.filter((a) => a._id !== articleId));
      setSuccessMsg(`"${title}" deleted successfully.`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = articles.filter(
    (a) =>
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.articleAuthor?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.category?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading)
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" />
      </div>
    );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-0">Article Management</h2>
          <p className="text-muted mb-0">Total: {articles.length} articles</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by title, author, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No articles found.
                  </td>
                </tr>
              ) : (
                filtered.map((article, index) => (
                  <tr key={article._id}>
                    <td className="text-muted small">{index + 1}</td>
                    <td style={{ maxWidth: "280px" }}>
                      <div className="d-flex align-items-center gap-2">
                        {article.thumbnail && (
                          <img
                            src={article.thumbnail}
                            alt=""
                            width="48"
                            height="36"
                            style={{
                              objectFit: "cover",
                              borderRadius: "4px",
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <div>
                          <div
                            className="fw-semibold small"
                            style={{
                              fontFamily:
                                "SolaimanLipi, Noto Sans Bengali, Arial, sans-serif",
                              lineHeight: "1.3",
                            }}
                          >
                            {article.title}
                          </div>
                          <span
                            className="badge bg-light text-dark"
                            style={{ fontSize: "10px" }}
                          >
                            {article.slayout}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="small">
                      {editingId === article._id ? (
                        <div
                          className="d-flex gap-1 align-items-center"
                          style={{ minWidth: 220 }}
                        >
                          <select
                            className="form-select form-select-sm"
                            value={editData.articleAuthor}
                            onChange={(e) =>
                              setEditData({ articleAuthor: e.target.value })
                            }
                            disabled={editLoading}
                          >
                            <option value="">-- Select Author --</option>
                            {authors.map((a) => (
                              <option key={a._id} value={a._id}>
                                {a.name} — {a.profession}
                              </option>
                            ))}
                          </select>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() =>
                              handleEditSave(article._id, article.title)
                            }
                            disabled={editLoading}
                          >
                            {editLoading ? "..." : "✓"}
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={cancelEdit}
                            disabled={editLoading}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span
                          role="button"
                          title="Click to change author"
                          onClick={() => startEdit(article)}
                          style={{
                            cursor: "pointer",
                            borderBottom: "1px dashed #adb5bd",
                          }}
                        >
                          {article.articleAuthor?.name ||
                            article.author?.name ||
                            "—"}
                        </span>
                      )}
                    </td>
                    <td>
                      {article.category?.name ? (
                        <span className="badge bg-primary">
                          {article.category.name}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      {article.subcategory?.name ? (
                        <span className="badge bg-secondary">
                          {article.subcategory.name}
                        </span>
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                    <td className="small text-muted text-nowrap">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Link
                          to={`/article/${article._id}`}
                          className="btn btn-sm btn-outline-primary"
                          target="_blank"
                          rel="noreferrer"
                        >
                          View
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() =>
                            handleDelete(article._id, article.title)
                          }
                          disabled={deletingId === article._id}
                        >
                          {deletingId === article._id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminArticles;
