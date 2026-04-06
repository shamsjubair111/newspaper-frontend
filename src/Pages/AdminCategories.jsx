import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // New category state
  const [newName, setNewName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

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
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/categories`,
      );
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return null;
    }
    return token;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const token = getToken();
    if (!token) return;
    setCreateLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/categories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: newName.trim() }),
        },
      );
      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create category");
      setCategories((prev) => [...prev, data]);
      setNewName("");
      showSuccess(`"${data.name}" created successfully.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const startEdit = (category) => {
    setEditingId(category._id);
    setEditName(category.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleUpdate = async (categoryId) => {
    if (!editName.trim()) return;
    const token = getToken();
    if (!token) return;
    setEditLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/categories/${categoryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: editName.trim() }),
        },
      );
      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update category");
      setCategories((prev) =>
        prev.map((c) => (c._id === categoryId ? data : c)),
      );
      cancelEdit();
      showSuccess(`Category updated to "${data.name}".`);
    } catch (err) {
      setError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (categoryId, name) => {
    if (
      !window.confirm(
        `Delete category "${name}"? Articles in this category will lose their category.`,
      )
    )
      return;
    const token = getToken();
    if (!token) return;
    setDeletingId(categoryId);
    setError("");
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/categories/${categoryId}`,
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
        throw new Error(data.message || "Failed to delete category");
      }
      setCategories((prev) => prev.filter((c) => c._id !== categoryId));
      showSuccess(`"${name}" deleted successfully.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-0">Category Management</h2>
          <p className="text-muted mb-0">
            Total: {categories.length} categories
          </p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* Create new category */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-primary text-white">
          <h6 className="mb-0">Add New Category</h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleCreate} className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Category name (Bengali or English)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={createLoading}
              required
            />
            <button
              type="submit"
              className="btn btn-primary text-nowrap"
              disabled={createLoading || !newName.trim()}
            >
              {createLoading ? (
                <span className="spinner-border spinner-border-sm" />
              ) : (
                "+ Add"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Categories table */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">
                    No categories yet.
                  </td>
                </tr>
              ) : (
                categories.map((cat, index) => (
                  <tr key={cat._id}>
                    <td className="text-muted small">{index + 1}</td>
                    <td>
                      {editingId === cat._id ? (
                        <div className="d-flex gap-2 align-items-center">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            disabled={editLoading}
                            autoFocus
                            style={{ maxWidth: "280px" }}
                          />
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleUpdate(cat._id)}
                            disabled={editLoading || !editName.trim()}
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
                      ) : (
                        <span
                          style={{
                            fontFamily:
                              "SolaimanLipi, Noto Sans Bengali, Arial, sans-serif",
                          }}
                        >
                          {cat.name}
                        </span>
                      )}
                    </td>
                    <td className="text-muted small text-nowrap">
                      {new Date(cat.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      {editingId !== cat._id && (
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => startEdit(cat)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(cat._id, cat.name)}
                            disabled={deletingId === cat._id}
                          >
                            {deletingId === cat._id ? "..." : "Delete"}
                          </button>
                        </div>
                      )}
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

export default AdminCategories;
