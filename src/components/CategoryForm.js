import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const CategoryForm = () => {
  const navigate = useNavigate();
  const user = authAPI.getCurrentUser();
  const [formData, setFormData] = useState({
    name: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      setError('Only admin users can create categories');
      setIsAdmin(false);
    } else {
      setIsAdmin(true);
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Fetch existing categories
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      name: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Send only name (no slug!)
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create category');
      }

      setSuccess(`"${formData.name}" category created successfully!`);
      setFormData({ name: '' });
      
      // Refresh categories list
      fetchCategories();
      
    } catch (err) {
      setError(err.message || 'Failed to create category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If not admin, show access denied message
  if (!isAdmin) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card text-center">
              <div className="card-body">
                <h3 className="text-danger mb-3">Access Denied</h3>
                <p className="mb-4">Only admin users can create categories.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/')}
                >
                  Go to Home
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
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">ক্যাটাগরি যুক্ত করুন / Add New Category</h4>
              <p className="mb-0 opacity-75">Create a new topic for articles</p>
            </div>
            
            <div className="card-body p-4">
              {/* Success/Error Messages */}
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
              
              {/* Simple Form - Just name field */}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="form-label fw-bold fs-5">
                    Category Name / ক্যাটাগরির নাম <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., রাজনীতি, অর্থনীতি, বিশেষ স্বাক্ষাৎকার"
                    disabled={loading}
                  />
                  <div className="form-text">
                    বাংলা বা ইংরেজিতে ক্যাটাগরির নাম লিখুন।
                  </div>
                </div>
                
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/')}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-grow-1"
                    disabled={loading || !formData.name.trim()}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating...
                      </>
                    ) : 'Add Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Current Categories List */}
          <div className="card shadow-sm border-0 mt-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">Current Categories / বর্তমান ক্যাটাগরি</h5>
              <p className="mb-0 text-muted">Total: {categories.length} categories</p>
            </div>
            
            <div className="card-body">
              {categories.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">No categories yet. Create your first one above!</p>
                </div>
              ) : (
                <div className="row">
                  {categories.map(category => (
                    <div className="col-md-6 mb-3" key={category._id}>
                      <div className="card h-100 border">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="card-title mb-1">{category.name}</h6>
                              <small className="text-muted">
                                ID: {category._id}
                              </small>
                            </div>
                            <span className="badge bg-light text-dark">
                              {new Date(category.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryForm;