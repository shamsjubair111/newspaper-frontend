import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, authorAPI } from "../services/api";

const AuthorForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    profession: "",
    image: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = authAPI.getCurrentUser();
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "admin") {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await authorAPI.createAuthor(formData);
      setSuccess(`Author "${formData.name}" created successfully!`);
      setFormData({ name: "", profession: "", image: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create author.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Add New Author</h4>
              <p className="mb-0 opacity-75">
                Create an author profile for articles
              </p>
            </div>
            <div className="card-body p-4">
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="form-label fw-bold">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., বদরুল আলম খান"
                    disabled={loading}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="profession" className="form-label fw-bold">
                    Profession <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="profession"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Senior Journalist, Political Analyst"
                    disabled={loading}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="image" className="form-label fw-bold">
                    Profile Image URL{" "}
                    <span className="text-muted">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/photo.jpg"
                    disabled={loading}
                  />
                  <div className="form-text">
                    Image cannot be changed after creation.
                  </div>
                  {formData.image && (
                    <div className="mt-2">
                      <img
                        src={formData.image}
                        alt="Preview"
                        style={{
                          width: 72,
                          height: 72,
                          objectFit: "cover",
                          borderRadius: "50%",
                          border: "2px solid #dee2e6",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/admin/authors")}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-grow-1"
                    disabled={
                      loading ||
                      !formData.name.trim() ||
                      !formData.profession.trim()
                    }
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Creating...
                      </>
                    ) : (
                      "Create Author"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorForm;
