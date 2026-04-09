import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { useT } from "../context/translations";
import { authAPI } from "../services/api";

const MyComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const currentUser = authAPI.getCurrentUser();
  const { lang } = useLang();
  const t = useT(lang);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    fetchMyComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMyComments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/comments/my`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      setComments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/comments/single/${commentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Failed to delete");
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err) {
      setError(err.message);
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
      <div className="mb-4">
        <h2 className="mb-1">{t("commentsPageTitle")}</h2>
        <p className="text-muted mb-0">
          {currentUser?.name} — {currentUser?.email} —{" "}
          {t("totalComments", comments.length)}
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {comments.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted fs-5">{t("noCommentsYet")}</p>
          <Link to="/" className="btn btn-primary mt-2">
            {t("readArticles")}
          </Link>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: "40px" }}>#</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Article</th>
                  <th>Comment</th>
                  <th style={{ width: "100px" }}>Date</th>
                  <th style={{ width: "80px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {comments.map((comment, index) => (
                  <tr key={comment._id}>
                    <td className="text-muted small">{index + 1}</td>
                    <td>
                      <strong>{currentUser?.name}</strong>
                    </td>
                    <td className="text-muted small">{currentUser?.email}</td>
                    <td>
                      {comment.article ? (
                        <Link
                          to={`/article/${comment.article._id}`}
                          style={{
                            color: "#1a56a0",
                            textDecoration: "none",
                            fontWeight: "500",
                          }}
                        >
                          {comment.article.title}
                        </Link>
                      ) : (
                        <span className="text-muted small">
                          {t("articleDeleted")}
                        </span>
                      )}
                    </td>
                    <td className="small">{comment.content}</td>
                    <td className="text-muted small">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(comment._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyComments;
