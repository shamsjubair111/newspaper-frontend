import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
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
    setCurrentUser(user);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    setSuccessMsg("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        },
      );
      if (!res.ok) throw new Error("Failed to update role");
      setUsers(
        users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)),
      );
      setSuccessMsg("Role updated successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setDeletingId(userId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Failed to delete user");
      setUsers(users.filter((u) => u._id !== userId));
      setSuccessMsg("User deleted successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "danger";
      case "author":
        return "warning";
      default:
        return "secondary";
    }
  };

  // Show spinner while loading OR while currentUser hasn't been set yet
  if (loading || !currentUser) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">User Management</h2>
          <p className="text-muted mb-0">Total: {users.length} users</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Google</th>
                <th>Avatar</th>
                <th>Joined</th>
                <th>Change Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user._id}>
                  <td className="text-muted small">{index + 1}</td>
                  <td>
                    <strong>{user.name}</strong>
                    {user._id === currentUser._id && (
                      <span className="badge bg-info ms-2 small">You</span>
                    )}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className={`badge bg-${getRoleBadgeColor(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {user.googleId ? (
                      <span className="badge bg-success">✓ Linked</span>
                    ) : (
                      <span className="text-muted small">—</span>
                    )}
                  </td>
                  <td>
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        width="32"
                        height="32"
                        className="rounded-circle"
                      />
                    ) : (
                      <span className="text-muted small">—</span>
                    )}
                  </td>
                  <td className="small text-muted">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    {user._id !== currentUser._id ? (
                      <select
                        className="form-select form-select-sm"
                        style={{ width: "110px" }}
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user._id, e.target.value)
                        }
                        disabled={updatingId === user._id}
                      >
                        <option value="user">user</option>
                        <option value="author">author</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : (
                      <span className="text-muted small">—</span>
                    )}
                  </td>
                  <td>
                    {user._id !== currentUser._id ? (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(user._id)}
                        disabled={deletingId === user._id}
                      >
                        {deletingId === user._id ? "..." : "Delete"}
                      </button>
                    ) : (
                      <span className="text-muted small">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
