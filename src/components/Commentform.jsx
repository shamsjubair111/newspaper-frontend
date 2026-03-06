import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authAPI } from "../services/api";

const CommentForm = () => {
  const navigate = useNavigate();
  const { articleId } = useParams(); // Get articleId from URL if provided
  const user = authAPI.getCurrentUser();

  const [formData, setFormData] = useState({
    content: "",
    article: articleId || "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    setIsAuthenticated(true);
    fetchArticles();

    // If articleId is provided, fetch that article's details
    if (articleId) {
      fetchArticleDetails(articleId);
      fetchComments(articleId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/articles`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      }
    } catch (err) {
      console.error("Error fetching articles:", err);
    }
  };

  const fetchArticleDetails = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/articles/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedArticle(data);
      }
    } catch (err) {
      console.error("Error fetching article:", err);
    }
  };

  const fetchComments = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/comments/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // If article is changed, fetch its details and comments
    if (name === "article" && value) {
      fetchArticleDetails(value);
      fetchComments(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/comments/${formData.article}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: formData.content,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to post comment");
      }

      setSuccess("Comment posted successfully!");
      setFormData({
        ...formData,
        content: "",
      });

      // Refresh comments list
      if (formData.article) {
        fetchComments(formData.article);
      }
    } catch (err) {
      setError(err.message || "Failed to post comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card text-center">
              <div className="card-body">
                <h3 className="text-danger mb-3">Access Denied</h3>
                <p className="mb-4">You must be logged in to post comments.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/login")}
                >
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          {/* Article Info Card (if article is selected) */}
          {selectedArticle && (
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <h5 className="card-title mb-2">{selectedArticle.title}</h5>
                {selectedArticle.summary && (
                  <p className="card-text text-muted mb-2">
                    {selectedArticle.summary}
                  </p>
                )}
                <div className="d-flex gap-2">
                  <span className="badge bg-primary">
                    {selectedArticle.category?.name}
                  </span>
                  {selectedArticle.subcategory && (
                    <span className="badge bg-secondary">
                      {selectedArticle.subcategory?.name}
                    </span>
                  )}
                  <span className="badge bg-light text-dark">
                    by {selectedArticle.author?.name}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Comment Form Card */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">মন্তব্য করুন / Post a Comment</h4>
              <p className="mb-0 opacity-75">
                Share your thoughts on this article
              </p>
            </div>

            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}

              {articles.length === 0 && (
                <div className="alert alert-warning" role="alert">
                  <strong>⚠️ No articles found!</strong> There are no articles
                  to comment on yet.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Article Selection (only show if not coming from article page) */}
                {!articleId && (
                  <div className="mb-4">
                    <label
                      htmlFor="article"
                      className="form-label fw-bold fs-5"
                    >
                      Select Article / আর্টিকেল নির্বাচন করুন{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select form-select-lg"
                      id="article"
                      name="article"
                      value={formData.article}
                      onChange={handleChange}
                      required
                      disabled={loading || articles.length === 0}
                    >
                      <option value="">-- Select an Article --</option>
                      {articles.map((article) => (
                        <option key={article._id} value={article._id}>
                          {article.title}
                        </option>
                      ))}
                    </select>
                    <div className="form-text">
                      Choose which article you want to comment on
                    </div>
                  </div>
                )}

                {/* Comment Content */}
                <div className="mb-4">
                  <label htmlFor="content" className="form-label fw-bold fs-5">
                    Your Comment / আপনার মন্তব্য{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control form-control-lg"
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    rows="5"
                    placeholder="Write your comment here..."
                    disabled={loading || (!articleId && !formData.article)}
                  />
                  <div className="form-text">
                    Share your thoughts, feedback, or questions about this
                    article
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/")}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-grow-1"
                    disabled={
                      loading ||
                      !formData.content.trim() ||
                      (!articleId && !formData.article) ||
                      articles.length === 0
                    }
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Posting...
                      </>
                    ) : (
                      "Post Comment"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Comments List (if article is selected) */}
          {formData.article && comments.length > 0 && (
            <div className="card shadow-sm border-0 mt-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">Comments / মন্তব্যসমূহ</h5>
                <p className="mb-0 text-muted">
                  Total: {comments.length} comments
                </p>
              </div>

              <div className="card-body">
                <div className="list-group list-group-flush">
                  {comments.map((comment) => (
                    <div className="list-group-item px-0" key={comment._id}>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="mb-1">
                            {comment.user?.name || "Anonymous"}
                          </h6>
                          <small className="text-muted">
                            {new Date(comment.createdAt).toLocaleString()}
                          </small>
                        </div>
                        {comment.isApproved ? (
                          <span className="badge bg-success">Approved</span>
                        ) : (
                          <span className="badge bg-warning">Pending</span>
                        )}
                      </div>
                      <p className="mb-0">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentForm;
