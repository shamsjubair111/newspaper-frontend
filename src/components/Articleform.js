import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

// Converts plain text with line breaks into HTML paragraphs.
// Each blank-line-separated block becomes a <p>. Single line breaks become <br>.
// If the content already contains HTML tags, it is returned as-is.
const plainTextToHtml = (text) => {
  if (!text) return '';
  // If it already has HTML tags, don't double-convert
  if (/<[a-z][\s\S]*>/i.test(text)) return text;
  return text
    .split(/\n\s*\n/)                          // split on blank lines → paragraphs
    .map(para => para.trim())
    .filter(para => para.length > 0)
    .map(para => `<p>${para.replace(/\n/g, '<br />')}</p>`) // single newlines → <br>
    .join('\n');
};

const ArticleForm = () => {
  const navigate = useNavigate();
  const user = authAPI.getCurrentUser();
  const [formData, setFormData] = useState({
    title: '',
    authorName: '',
    content: '',
    thumbnail: '',
    category: '',
    subcategory: '',
    slayout: 'default'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [isAuthorOrAdmin, setIsAuthorOrAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'author' && user.role !== 'admin') {
      setError('Only authors and admins can create articles');
      setIsAuthorOrAdmin(false);
    } else {
      setIsAuthorOrAdmin(true);
      fetchCategories();
      fetchSubcategories();
      fetchArticles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (formData.category) {
      const filtered = subcategories.filter(
        sub => sub.category === formData.category || sub.category?._id === formData.category
      );
      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
    }
  }, [formData.category, subcategories]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/subcategories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSubcategories(data);
      }
    } catch (err) {
      console.error('Error fetching subcategories:', err);
    }
  };

  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/articles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      ...(name === 'category' && { subcategory: '' })
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const payload = {
        title: formData.title,
        authorName: formData.authorName,
        content: plainTextToHtml(formData.content),
        thumbnail: formData.thumbnail,
        category: formData.category,
        slayout: formData.slayout,
      };

      if (formData.subcategory) {
        payload.subcategory = formData.subcategory;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create article');
      }

      setSuccess(`"${formData.title}" article created successfully!`);
      setFormData({
        title: '',
        authorName: '',
        content: '',
        thumbnail: '',
        category: '',
        subcategory: '',
        slayout: 'default'
      });

      fetchArticles();

    } catch (err) {
      setError(err.message || 'Failed to create article. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorOrAdmin) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card text-center">
              <div className="card-body">
                <h3 className="text-danger mb-3">Access Denied</h3>
                <p className="mb-4">Only authors and admins can create articles.</p>
                <button className="btn btn-primary" onClick={() => navigate('/')}>
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
        <div className="col-md-10">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">আর্টিকেল যুক্ত করুন / Create New Article</h4>
              <p className="mb-0 opacity-75">Write and publish your article</p>
            </div>

            <div className="card-body p-4">
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              {categories.length === 0 && (
                <div className="alert alert-warning">
                  <strong>⚠️ No categories found!</strong> Please create at least one category first.
                </div>
              )}

              <form onSubmit={handleSubmit}>

                {/* Title */}
                <div className="mb-4">
                  <label htmlFor="title" className="form-label fw-bold fs-5">
                    Article Title / শিরোনাম <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., বাংলাদেশের অর্থনীতিতে নতুন দিগন্ত"
                    disabled={loading}
                  />
                </div>

                {/* Author Name */}
                <div className="mb-4">
                  <label htmlFor="authorName" className="form-label fw-bold">
                    Author Name / লেখকের নাম <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="authorName"
                    name="authorName"
                    value={formData.authorName}
                    onChange={handleChange}
                    required
                    placeholder="e.g., বদরুল আলম খান"
                    disabled={loading}
                  />
                </div>

                {/* Content */}
                <div className="mb-4">
                  <label htmlFor="content" className="form-label fw-bold">
                    Article Content / কন্টেন্ট <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    rows="12"
                    placeholder="Write your article content here. Separate paragraphs with a blank line. Line breaks are preserved automatically."
                    disabled={loading}
                  />
                  <div className="form-text">Separate paragraphs with a blank line. Single line breaks become &lt;br&gt;. HTML tags also supported.</div>
                </div>

                {/* Thumbnail URL */}
                <div className="mb-4">
                  <label htmlFor="thumbnail" className="form-label fw-bold">
                    Thumbnail Image URL <span className="text-danger">*</span>
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    id="thumbnail"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleChange}
                    required
                    placeholder="https://example.com/image.jpg"
                    disabled={loading}
                  />
                  <div className="form-text">URL of the thumbnail image for this article</div>
                </div>

                {/* Category & Subcategory */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label htmlFor="category" className="form-label fw-bold">
                      Category / ক্যাটাগরি <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      disabled={loading || categories.length === 0}
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="subcategory" className="form-label fw-bold">
                      Subcategory / সাবক্যাটাগরি <span className="text-muted">(Optional)</span>
                    </label>
                    <select
                      className="form-select"
                      id="subcategory"
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleChange}
                      disabled={loading || !formData.category || filteredSubcategories.length === 0}
                    >
                      <option value="">-- Select Subcategory (Optional) --</option>
                      {filteredSubcategories.map(sub => (
                        <option key={sub._id} value={sub._id}>{sub.name}</option>
                      ))}
                    </select>
                    {formData.category && filteredSubcategories.length === 0 && (
                      <div className="form-text text-muted">No subcategories for this category</div>
                    )}
                  </div>
                </div>

                {/* Layout */}
                <div className="mb-4">
                  <label htmlFor="slayout" className="form-label fw-bold">Layout Style</label>
                  <select
                    className="form-select"
                    id="slayout"
                    name="slayout"
                    value={formData.slayout}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="default">Default</option>
                    <option value="featured">Featured</option>
                    <option value="minimal">Minimal</option>
                    <option value="full-width">Full Width</option>
                  </select>
                </div>

                {/* Buttons */}
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
                    disabled={
                      loading ||
                      !formData.title.trim() ||
                      !formData.authorName.trim() ||
                      !formData.content.trim() ||
                      !formData.thumbnail.trim() ||
                      !formData.category ||
                      categories.length === 0
                    }
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Publishing...
                      </>
                    ) : 'Publish Article'}
                  </button>
                </div>

              </form>
            </div>
          </div>

          {/* Recent Articles */}
          <div className="card shadow-sm border-0 mt-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">Recent Articles / সাম্প্রতিক আর্টিকেল</h5>
              <p className="mb-0 text-muted">Total: {articles.length} articles</p>
            </div>
            <div className="card-body">
              {articles.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">No articles yet. Create your first one above!</p>
                </div>
              ) : (
                <div className="row">
                  {articles.slice(0, 7).map(article => (
                    <div className="col-md-6 mb-3" key={article._id}>
                      <div className="card h-100 border">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="card-title mb-1">{article.title}</h6>
                            <span className="badge bg-light text-dark">
                              {new Date(article.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {article.authorName && (
                            <p className="card-text text-muted small mb-2">
                              By: {article.authorName}
                            </p>
                          )}
                          <div className="d-flex gap-2 flex-wrap">
                            <span className="badge bg-primary">{article.category?.name}</span>
                            {article.subcategory && (
                              <span className="badge bg-secondary">{article.subcategory?.name}</span>
                            )}
                            <span className="badge bg-info text-dark">{article.slayout}</span>
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

export default ArticleForm;