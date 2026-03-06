import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const SubcategoryForm = () => {
  const navigate = useNavigate();
  const user = authAPI.getCurrentUser();
  const [formData, setFormData] = useState({
    name: '',
    category: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      setError('Only admin users can create subcategories');
      setIsAdmin(false);
    } else {
      setIsAdmin(true);
      fetchCategories();
      fetchSubcategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Fetch categories for dropdown
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

  // Fetch existing subcategories
  const fetchSubcategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/subcategories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubcategories(data);
      }
    } catch (err) {
      console.error('Error fetching subcategories:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/subcategories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create subcategory');
      }

      setSuccess(`"${formData.name}" subcategory created successfully!`);
      setFormData({ name: '', category: '' });
      
      // Refresh subcategories list
      fetchSubcategories();
      
    } catch (err) {
      setError(err.message || 'Failed to create subcategory. Please try again.');
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
                <p className="mb-4">Only admin users can create subcategories.</p>
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

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : 'Unknown';
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">সাবক্যাটাগরি যুক্ত করুন / Add New Subcategory</h4>
              <p className="mb-0 opacity-75">Create a subcategory under a category</p>
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

              {/* Warning if no categories exist */}
              {categories.length === 0 && (
                <div className="alert alert-warning" role="alert">
                  <strong>⚠️ No categories found!</strong> Please create at least one category first.
                </div>
              )}
              
              {/* Form */}
              <form onSubmit={handleSubmit}>
                {/* Category Selection */}
                <div className="mb-4">
                  <label htmlFor="category" className="form-label fw-bold fs-5">
                    Select Category / ক্যাটাগরি নির্বাচন করুন <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select form-select-lg"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    disabled={loading || categories.length === 0}
                  >
                    <option value="">-- Select a Category / ক্যাটাগরি নির্বাচন করুন --</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="form-text">
                    Choose the parent category for this subcategory
                  </div>
                </div>

                {/* Subcategory Name */}
                <div className="mb-4">
                  <label htmlFor="name" className="form-label fw-bold fs-5">
                    Subcategory Name / সাবক্যাটাগরির নাম <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., দেশ ও বিদেশ, Home & Abroad"
                    disabled={loading}
                  />
                  <div className="form-text">
                    বাংলা বা ইংরেজিতে সাবক্যাটাগরির নাম লিখুন।
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
                    disabled={loading || !formData.name.trim() || !formData.category || categories.length === 0}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating...
                      </>
                    ) : 'Add Subcategory'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Current Subcategories List */}
          <div className="card shadow-sm border-0 mt-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">Current Subcategories / বর্তমান সাবক্যাটাগরি</h5>
              <p className="mb-0 text-muted">Total: {subcategories.length} subcategories</p>
            </div>
            
            <div className="card-body">
              {subcategories.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">No subcategories yet. Create your first one above!</p>
                </div>
              ) : (
                <div className="row">
                  {subcategories.map(subcat => (
                    <div className="col-md-6 mb-3" key={subcat._id}>
                      <div className="card h-100 border">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="card-title mb-0">{subcat.name}</h6>
                            <span className="badge bg-light text-dark">
                              {new Date(subcat.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-primary">
                              {subcat.category?.name || getCategoryName(subcat.category)}
                            </span>
                            <small className="text-muted">
                              ID: {subcat._id.slice(-6)}
                            </small>
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

export default SubcategoryForm;