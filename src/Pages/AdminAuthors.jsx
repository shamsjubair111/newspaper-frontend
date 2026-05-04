import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI, authorAPI } from "../services/api";

const AdminAuthors = () => {
  const navigate = useNavigate();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: "", profession: "" });
  const [editLoading, setEditLoading] = useState(false);

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
    fetchAuthors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      setAuthors(await authorAPI.getAuthors());
    } catch {
      setError("Failed to fetch authors.");
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete author "${name}"? This cannot be undone.`))
      return;
    setDeletingId(id);
    setError("");
    try {
      await authorAPI.deleteAuthor(id);
      setAuthors((prev) => prev.filter((a) => a._id !== id));
      showSuccess(`"${name}" deleted successfully.`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete author.");
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (a) => {
    setEditingId(a._id);
    setEditData({ name: a.name, profession: a.profession });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ name: "", profession: "" });
  };

  const handleEditSave = async (id) => {
    if (!editData.name.trim() || !editData.profession.trim()) {
      setError("Name and profession are required.");
      return;
    }
    setEditLoading(true);
    setError("");
    try {
      const updated = await authorAPI.updateAuthor(id, editData);
      setAuthors((prev) =>
        prev.map((a) => (a._id === id ? { ...a, ...updated } : a)),
      );
      showSuccess(`"${updated.name}" updated successfully.`);
      cancelEdit();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update author.");
    } finally {
      setEditLoading(false);
    }
  };

  const filtered = authors.filter(
    (a) =>
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.profession?.toLowerCase().includes(search.toLowerCase()),
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
          <h2 className="mb-0">Author Management</h2>
          <p className="text-muted mb-0">Total: {authors.length} authors</p>
        </div>
        <Link to="/create-author" className="btn btn-primary">
          + Add Author
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by name or profession..."
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
                <th>Photo</th>
                <th>Name</th>
                <th>Profession</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No authors found.
                  </td>
                </tr>
              ) : (
                filtered.map((author, index) => (
                  <tr key={author._id}>
                    <td className="text-muted small">{index + 1}</td>
                    <td>
                      {author.image ? (
                        <img
                          src={author.image}
                          alt={author.name}
                          style={{
                            width: 44,
                            height: 44,
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            background: "#e9ecef",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 18,
                            color: "#6c757d",
                          }}
                        >
                          {author.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>
                    {editingId === author._id ? (
                      <>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={editData.name}
                            onChange={(e) =>
                              setEditData({ ...editData, name: e.target.value })
                            }
                            disabled={editLoading}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={editData.profession}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                profession: e.target.value,
                              })
                            }
                            disabled={editLoading}
                          />
                        </td>
                        <td className="small text-muted text-nowrap">
                          {new Date(author.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleEditSave(author._id)}
                              disabled={editLoading}
                            >
                              {editLoading ? "..." : "Save"}
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={cancelEdit}
                              disabled={editLoading}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="fw-semibold">{author.name}</td>
                        <td className="text-muted small">
                          {author.profession}
                        </td>
                        <td className="small text-muted text-nowrap">
                          {new Date(author.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => startEdit(author)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleDelete(author._id, author.name)
                              }
                              disabled={deletingId === author._id}
                            >
                              {deletingId === author._id ? "..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-muted small mt-2">
        * Author profile images cannot be edited after creation.
      </p>
    </div>
  );
};

export default AdminAuthors;
