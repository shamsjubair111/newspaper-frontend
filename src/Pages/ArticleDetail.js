import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ArticleDetail.css';

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fontSize, setFontSize] = useState(18);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/articles/${id}`);
        if (!response.ok) throw new Error('Article not found');
        const data = await response.json();
        setArticle(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  const formatDateTimeBengali = (dateString) => {
    const date = new Date(dateString);
    const months = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
    const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    const toBn = (n) => n.toString().split('').map(d => bn[parseInt(d)]).join('');
    return `আপডেট: ${toBn(date.getDate())} ${months[date.getMonth()]} ${toBn(date.getFullYear())}, ${toBn(date.getHours()).padStart(2,'০')}: ${toBn(date.getMinutes()).padStart(2,'০')}`;
  };

  const handleShare = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(article?.title || '');
    const links = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      whatsapp: `https://wa.me/?text=${title}%20${url}`,
    };
    if (links[platform]) window.open(links[platform], '_blank');
  };

  const handlePrint = () => window.print();

  if (loading) return (
    <div className="container py-5 text-center">
      <div className="spinner-border text-primary" role="status" />
    </div>
  );

  if (error || !article) return (
    <div className="container py-5 text-center">
      <h2 className="text-danger mb-3">Article not found</h2>
      <Link to="/" className="btn btn-primary">Go to Home</Link>
    </div>
  );

  return (
    <div className="ad-article-wrapper">
      <div className="ad-container">

        {/* Breadcrumb */}
        <div className="ad-breadcrumb">
          <Link to="/" className="ad-breadcrumb-link">প্রতিচিন্তা</Link>
          {article.category?.name && (
            <>
              <span className="ad-breadcrumb-sep"> / </span>
              <Link to={`/category/${article.category._id}`} className="ad-breadcrumb-link">
                {article.category.name}
              </Link>
            </>
          )}
        </div>

        {/* Author above title */}
        {article.authorName && (
          <div className="ad-author-top">{article.authorName}</div>
        )}

        {/* Title */}
        <h1 className="ad-title">{article.title}</h1>

        {/* Divider */}
        <div className="ad-title-divider" />

        {/* Meta row */}
        <div className="ad-meta-row">
          <div className="ad-meta-left">
            {article.authorName && (
              <span className="ad-meta-author">{article.authorName}</span>
            )}
            <span className="ad-meta-date">
              {formatDateTimeBengali(article.updatedAt || article.createdAt)}
            </span>
          </div>
          <div className="ad-share-icons">
            <button className="ad-share-btn ad-share-facebook" onClick={() => handleShare('facebook')} title="Share on Facebook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
            </button>
            <button className="ad-share-btn ad-share-twitter" onClick={() => handleShare('twitter')} title="Share on X">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
            <button className="ad-share-btn ad-share-whatsapp" onClick={() => handleShare('whatsapp')} title="Share on WhatsApp">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
              </svg>
            </button>
            <button className="ad-share-btn ad-share-font" onClick={() => setFontSize(f => Math.min(f + 2, 26))} title="Increase font size">
              <span style={{fontWeight:'bold', fontSize:'13px'}}>অ+</span>
            </button>
            <button className="ad-share-btn ad-share-font" onClick={() => setFontSize(f => Math.max(f - 2, 14))} title="Decrease font size">
              <span style={{fontWeight:'bold', fontSize:'11px'}}>অ-</span>
            </button>
            <button className="ad-share-btn ad-share-print" onClick={handlePrint} title="Print">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
            </button>
            <button className="ad-share-btn ad-share-save" title="Save">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Thumbnail */}
        {article.thumbnail && (
          <div className="ad-thumbnail-wrapper">
            <img src={article.thumbnail} alt={article.title} className="ad-thumbnail" />
          </div>
        )}

        {/* Article body */}
        <div
          className="ad-body"
          style={{ fontSize: `${fontSize}px` }}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags */}
        <div className="ad-tags">
          {article.category?.name && (
            <Link to={`/category/${article.category._id}`} className="ad-tag">
              {article.category.name}
            </Link>
          )}
          {article.subcategory?.name && (
            <Link to={`/subcategory/${article.subcategory._id}`} className="ad-tag">
              {article.subcategory.name}
            </Link>
          )}
        </div>

      </div>
    </div>
  );
};

export default ArticleDetail;