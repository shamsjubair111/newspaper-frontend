import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const CategoryPage = () => {
  const { categoryName, subcategoryName } = useParams();
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [categoryName, subcategoryName]);

  // decode URL encoding e.g. %E0%A6%B0%E0%A6%BE → রা
  const decode = (str) => decodeURIComponent(str || '');

  const fetchData = async () => {
    try {
      setLoading(true);
      const API = process.env.REACT_APP_API_URL;
      const decodedCat = decode(categoryName);
      const decodedSub = decode(subcategoryName);

      // Fetch all categories, match by name
      const catRes = await fetch(`${API}/api/categories`);
      const allCats = await catRes.json();
      const matchedCat = allCats.find(c => c.name === decodedCat);
      if (!matchedCat) throw new Error(`"${decodedCat}" নামে কোনো বিভাগ নেই`);
      setCategory(matchedCat);

      // Match subcategory by name if present
      let matchedSub = null;
      if (subcategoryName) {
        const subRes = await fetch(`${API}/api/subcategories`);
        const allSubs = await subRes.json();
        matchedSub = allSubs.find(s =>
          s.name === decodedSub &&
          (s.category?._id === matchedCat._id || s.category === matchedCat._id)
        );
        setSubcategory(matchedSub || null);
      } else {
        setSubcategory(null);
      }

      // Fetch and filter articles
      const artRes = await fetch(`${API}/api/articles`);
      const allArts = await artRes.json();

      const filtered = allArts.filter(a => {
        const catMatch =
          a.category?._id === matchedCat._id ||
          a.category === matchedCat._id;
        if (matchedSub) {
          const subMatch =
            a.subcategory?._id === matchedSub._id ||
            a.subcategory === matchedSub._id;
          return catMatch && subMatch;
        }
        return catMatch;
      });

      setArticles(filtered);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  if (loading) return (
    <div className="container py-5 text-center">
      <div className="spinner-border text-primary" role="status" />
    </div>
  );

  if (error) return (
    <div className="container py-5 text-center">
      <h2 className="text-danger mb-3">{error}</h2>
      <Link to="/" className="btn btn-primary">হোমে ফিরুন</Link>
    </div>
  );

  const pageTitle = subcategory ? subcategory.name : category?.name;

  return (
    <div className="container py-4">

      {/* Breadcrumb + Header */}
      <div className="border-bottom pb-3 mb-4">
        <nav className="mb-2" style={{ fontSize: '13px' }}>
          <Link to="/" style={{ color: '#1a56a0', textDecoration: 'none' }}>সমাচার প্রবাহ</Link>
          {category && (
            <>
              <span className="text-muted mx-2">/</span>
              <Link
                to={`/${encodeURIComponent(category.name)}`}
                style={{ color: '#1a56a0', textDecoration: 'none' }}
              >
                {category.name}
              </Link>
            </>
          )}
          {subcategory && (
            <>
              <span className="text-muted mx-2">/</span>
              <span className="text-muted">{subcategory.name}</span>
            </>
          )}
        </nav>
        <h2 className="mb-0 fw-bold" style={{ fontFamily: 'SolaimanLipi, Noto Sans Bengali, Arial, sans-serif' }}>
          {pageTitle}
        </h2>
        <p className="text-muted mt-1 mb-0">{articles.length} টি নিবন্ধ</p>
      </div>

      {/* Articles */}
      {articles.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted fs-5">এই বিভাগে কোনো নিবন্ধ নেই।</p>
          <Link to="/" className="btn btn-primary mt-2">হোমে ফিরুন</Link>
        </div>
      ) : (
        <div className="row g-4">
          {articles.map((article, index) => (
            index === 0 ? (
              <div className="col-12" key={article._id}>
                <Link to={`/article/${article._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '8px' }}>
                    <div className="row g-0">
                      {article.thumbnail && (
                        <div className="col-md-6">
                          <img
                            src={article.thumbnail}
                            alt={article.title}
                            style={{ width: '100%', height: '280px', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      <div className={`col-md-${article.thumbnail ? '6' : '12'} d-flex align-items-center`}>
                        <div className="card-body p-4">
                          <span className="badge bg-primary mb-2">{pageTitle}</span>
                          <h3 className="card-title fw-bold mb-2"
                            style={{ fontFamily: 'SolaimanLipi, Noto Sans Bengali, Arial, sans-serif' }}>
                            {article.title}
                          </h3>
                          {article.authorName && (
                            <p className="text-muted small mb-2">লেখক: {article.authorName}</p>
                          )}
                          <p className="text-muted small">{formatDate(article.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="col-md-4 col-sm-6" key={article._id}>
                <Link to={`/article/${article._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                    {article.thumbnail && (
                      <img
                        src={article.thumbnail}
                        alt={article.title}
                        className="card-img-top"
                        style={{ height: '180px', objectFit: 'cover' }}
                      />
                    )}
                    <div className="card-body">
                      <h6 className="card-title fw-bold"
                        style={{ fontFamily: 'SolaimanLipi, Noto Sans Bengali, Arial, sans-serif' }}>
                        {article.title}
                      </h6>
                      {article.authorName && (
                        <p className="text-muted small mb-1">লেখক: {article.authorName}</p>
                      )}
                      <p className="text-muted small mb-0">{formatDate(article.createdAt)}</p>
                    </div>
                  </div>
                </Link>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;