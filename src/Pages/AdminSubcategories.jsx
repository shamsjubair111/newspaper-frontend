import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const AdminSubcategories = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // New subcategory state
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Filter
  const [filterCat, setFilterCat] = useState("");

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
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [subRes, catRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/subcategories`),
        fetch(`${process.env.REACT_APP_API_URL}/api/categories`),
      ]);
      const subData = await subRes.json();
      const catData = await catRes.json();
      setSubcategories(subData);
      setCategories(catData);
    } catch (err) {
      setError("Failed to load data");
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
    if (!newName.trim() || !newCategory) return;
    const token = getToken();
    if (!token) return;
    setCreateLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/subcategories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: newName.trim(), category: newCategory }),
        },
      );
      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to create subcategory");
      // re-fetch to get populated category
      await fetchAll();
      setNewName("");
      setNewCategory("");
      showSuccess(`"${data.name}" created successfully.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const startEdit = (sub) => {
    setEditingId(sub._id);
    setEditName(sub.name);
    setEditCategory(sub.category?._id || sub.category || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditCategory("");
  };

  const handleUpdate = async (subId) => {
    if (!editName.trim() || !editCategory) return;
    const token = getToken();
    if (!token) return;
    setEditLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/subcategories/${subId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editName.trim(),
            category: editCategory,
          }),
        },
      );
      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to update subcategory");
      await fetchAll();
      cancelEdit();
      showSuccess(`Subcategory updated to "${data.name}".`);
    } catch (err) {
      setError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (subId, name) => {
    if (!window.confirm(`Delete subcategory "${name}"?`)) return;
    const token = getToken();
    if (!token) return;
    setDeletingId(subId);
    setError("");
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/subcategories/${subId}`,
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
        throw new Error(data.message || "Failed to delete subcategory");
      }
      setSubcategories((prev) => prev.filter((s) => s._id !== subId));
      showSuccess(`"${name}" deleted successfully.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = filterCat
    ? subcategories.filter((s) => (s.category?._id || s.category) === filterCat)
    : subcategories;

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
          <h2 className="mb-0">Subcategory Management</h2>
          <p className="text-muted mb-0">
            Total: {subcategories.length} subcategories
          </p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* Create new subcategory */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-primary text-white">
          <h6 className="mb-0">Add New Subcategory</h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleCreate} className="row g-2 align-items-end">
            <div className="col-md-5">
              <label className="form-label small fw-bold mb-1">
                Parent Category
              </label>
              <select
                className="form-select"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                disabled={createLoading}
                required
              >
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-5">
              <label className="form-label small fw-bold mb-1">
                Subcategory Name
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Subcategory name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={createLoading}
                required
              />
            </div>
            <div className="col-md-2">
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={createLoading || !newName.trim() || !newCategory}
              >
                {createLoading ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  "+ Add"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Filter by category */}
      <div className="mb-3">
        <select
          className="form-select"
          style={{ maxWidth: "260px" }}
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategories table */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Parent Category</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    No subcategories found.
                  </td>
                </tr>
              ) : (
                filtered.map((sub, index) => (
                  <tr key={sub._id}>
                    <td className="text-muted small">{index + 1}</td>
                    <td>
                      {editingId === sub._id ? (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          disabled={editLoading}
                          autoFocus
                          style={{ maxWidth: "200px" }}
                        />
                      ) : (
                        <span
                          style={{
                            fontFamily:
                              "SolaimanLipi, Noto Sans Bengali, Arial, sans-serif",
                          }}
                        >
                          {sub.name}
                        </span>
                      )}
                    </td>
                    <td>
                      {editingId === sub._id ? (
                        <select
                          className="form-select form-select-sm"
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          disabled={editLoading}
                          style={{ maxWidth: "200px" }}
                        >
                          <option value="">-- Select --</option>
                          {categories.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="badge bg-primary">
                          {sub.category?.name || "—"}
                        </span>
                      )}
                    </td>
                    <td className="text-muted small text-nowrap">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      {editingId === sub._id ? (
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleUpdate(sub._id)}
                            disabled={
                              editLoading || !editName.trim() || !editCategory
                            }
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
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => startEdit(sub)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(sub._id, sub.name)}
                            disabled={deletingId === sub._id}
                          >
                            {deletingId === sub._id ? "..." : "Delete"}
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

export default AdminSubcategories;
