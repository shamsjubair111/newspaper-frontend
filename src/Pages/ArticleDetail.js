import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useLang } from '../context/LanguageContext';
import { useT, translations } from '../context/translations';
import { translateText, translateHtml } from '../context/translate';
import './ArticleDetail.css';

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fontSize, setFontSize] = useState(18);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [bookmarkMsg, setBookmarkMsg] = useState('');
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [commentSuccess, setCommentSuccess] = useState('');
  const currentUser = authAPI.getCurrentUser();
  const { lang } = useLang();
  const t = useT(lang);
  const [translatedArticle, setTranslatedArticle] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', authorName: '', content: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

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
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!currentUser) return;
    const checkBookmark = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/bookmarks/check/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setIsBookmarked(data.isBookmarked);
      } catch (err) {}
    };
    checkBookmark();
  }, [id, currentUser]);

  // Translate article when language switches to English
  useEffect(() => {
    if (lang === 'bn' || !article) {
      setTranslatedArticle(null);
      return;
    }
    const doTranslate = async () => {
      setTranslating(true);
      try {
        const [title, authorName, content] = await Promise.all([
          translateText(article.title),
          article.authorName ? translateText(article.authorName) : Promise.resolve(''),
          translateHtml(article.content),
        ]);
        setTranslatedArticle({ ...article, title, authorName, content });
      } catch {
        setTranslatedArticle(null);
      } finally {
        setTranslating(false);
      }
    };
    doTranslate();
  }, [lang, article]);

  // Use translated version if available
  const displayArticle = (lang === 'en' && translatedArticle) ? translatedArticle : article;

  const fetchComments = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/comments/${id}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {}
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) { navigate('/login'); return; }
    if (!commentText.trim()) return;
    setCommentLoading(true);
    setCommentError('');
    setCommentSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/comments/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: commentText })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to post comment');
      setCommentText('');
      setCommentSuccess(t('commentSuccess'));
      setTimeout(() => setCommentSuccess(''), 3000);
      fetchComments();
    } catch (err) {
      setCommentError(err.message);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!currentUser) { navigate('/login'); return; }
    setBookmarkLoading(true);
    setBookmarkMsg('');
    try {
      const token = localStorage.getItem('token');
      console.log("testing");
      if (isBookmarked) {
        await fetch(`${process.env.REACT_APP_API_URL}/api/bookmarks/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsBookmarked(false);
        setBookmarkMsg('Bookmark removed');
      } else {
        await fetch(`${process.env.REACT_APP_API_URL}/api/bookmarks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ articleId: id })
        });
        setIsBookmarked(true);
        setBookmarkMsg('Bookmarked!');
      }
      setTimeout(() => setBookmarkMsg(''), 2000);
    } catch (err) {
      setBookmarkMsg('Something went wrong');
    } finally {
      setBookmarkLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const tr = translations[lang];
    const month = tr.months[date.getMonth()];
    if (lang === 'en') {
      const h = date.getHours().toString().padStart(2,'0');
      const m = date.getMinutes().toString().padStart(2,'0');
      return `${t('datePrefix')}${date.getDate()} ${month} ${date.getFullYear()}, ${h}:${m}`;
    }
    const toBn = (n) => n.toString().split('').map(d => tr.numerals[parseInt(d)]).join('');
    return `${t('datePrefix')}${toBn(date.getDate())} ${month} ${toBn(date.getFullYear())}, ${toBn(date.getHours()).padStart(2,'০')}:${toBn(date.getMinutes()).padStart(2,'০')}`;
  };

  const formatCommentDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = ['#1a56a0','#c0392b','#16a085','#8e44ad','#d35400','#2c3e50','#27ae60'];
    if (!name) return colors[0];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const handleShare = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(article?.title || '');
    const links = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      instagram: `https://www.instagram.com/`,
      threads: `https://www.threads.net/intent/post?text=${title}%20${url}`,
    };
    if (links[platform]) window.open(links[platform], '_blank');
  };

  const openEditModal = () => {
    setEditForm({
      title: article.title || '',
      authorName: article.authorName || '',
      content: article.content || '',
    });
    setEditError('');
    setEditSuccess('');
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You are not logged in. Please log in again.');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editForm.title,
          authorName: editForm.authorName,
          content: editForm.content,
        }),
      });
      const data = await res.json();
      if (res.status === 401) throw new Error('Session expired. Please log in again.');
      if (res.status === 403) throw new Error('You do not have permission to edit this article.');
      if (!res.ok) throw new Error(data.message || 'Failed to update article');
      setArticle(prev => ({ ...prev, title: editForm.title, authorName: editForm.authorName, content: editForm.content }));
      setTranslatedArticle(null);
      setEditSuccess('Article updated successfully!');
      setTimeout(() => { setEditModalOpen(false); setEditSuccess(''); }, 1500);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handlePrint = () => window.print();

  // Extract YouTube ID from URL
  const extractYouTubeId = (url) => {
    if (!url) return '';
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : '';
  };

  // Determine if article has a valid video
  const hasVideo = article?.videoUrl && article.videoUrl.trim() !== '';
  const isYouTube = hasVideo && (article.videoUrl.includes('youtube') || article.videoUrl.includes('youtu.be'));
  const youTubeId = isYouTube ? extractYouTubeId(article?.videoUrl) : '';

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
    <>
    <div className="ad-article-wrapper">
      <div className="ad-container">

        {/* Breadcrumb */}
        <div className="ad-breadcrumb">
          <Link to="/" className="ad-breadcrumb-link">{t('breadcrumbHome')}</Link>
          {article.category?.name && (
            <>
              <span className="ad-breadcrumb-sep"> / </span>
              <Link to={`/${encodeURIComponent(article.category.name)}`} className="ad-breadcrumb-link">
                {article.category.name}
              </Link>
            </>
          )}
        </div>

        {displayArticle?.authorName && <div className="ad-author-top">{displayArticle.authorName}</div>}

        <h1 className="ad-title">{displayArticle?.title || article.title}</h1>
        <div className="ad-title-divider" />

        {bookmarkMsg && (
          <div className={`ad-bookmark-toast ${isBookmarked ? 'ad-bookmark-toast-success' : 'ad-bookmark-toast-removed'}`}>
            {bookmarkMsg}
          </div>
        )}

        <div className="ad-meta-row">
          <div className="ad-meta-left">
            {displayArticle?.authorName && <span className="ad-meta-author">{displayArticle.authorName}</span>}
            <span className="ad-meta-date">{formatDateTime(article.updatedAt || article.createdAt)}</span>
          </div>
          <div className="ad-share-icons">
            <button className="ad-share-btn ad-share-facebook" onClick={() => handleShare('facebook')} title="Facebook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
            </button>
            <button className="ad-share-btn ad-share-twitter" onClick={() => handleShare('twitter')} title="X">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </button>
            <button className="ad-share-btn ad-share-instagram" onClick={() => handleShare('instagram')} title="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none"/>
              </svg>
            </button>
            <button className="ad-share-btn ad-share-threads" onClick={() => handleShare('threads')} title="Threads">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.068v-.072c.024-7.347 4.965-11.997 10.672-11.997 2.557 0 4.819.868 6.545 2.51 1.702 1.62 2.757 3.887 3.054 6.572l-2.497.263c-.497-4.553-3.338-6.85-7.105-6.85-4.271 0-8.16 3.236-8.18 9.497v.064c0 3.02.69 5.395 1.997 6.88 1.264 1.434 3.147 2.163 5.597 2.18h.006c2.174 0 3.816-.54 4.882-1.607.968-.966 1.446-2.317 1.455-4.118-.614.252-1.33.396-2.129.396-1.093 0-2.034-.303-2.717-.878-.752-.63-1.152-1.546-1.152-2.647 0-2.274 1.738-3.761 4.437-3.761.476 0 .94.044 1.383.13-.055-.84-.27-1.527-.64-2.035-.453-.617-1.147-.944-2.06-.972h-.073c-.966 0-1.86.416-2.516 1.17l-1.895-1.57C9.91 4.97 11.104 4.375 12.496 4.375h.096c1.504.044 2.745.603 3.589 1.617.772.93 1.175 2.2 1.19 3.766.49.351.901.773 1.22 1.257.597.898.908 2.01.908 3.218 0 2.39-.75 4.278-2.17 5.459-1.291 1.07-3.1 1.308-4.143 1.308z"/>
              </svg>
            </button>
            <button className="ad-share-btn ad-share-font" onClick={() => setFontSize(f => Math.min(f + 2, 28))} title="Zoom in">
              <span style={{fontWeight:'bold', fontSize:'13px'}}>অ+</span>
            </button>
            <button className="ad-share-btn ad-share-font" onClick={() => setFontSize(f => Math.max(f - 2, 12))} title="Zoom out">
              <span style={{fontWeight:'bold', fontSize:'11px'}}>অ-</span>
            </button>
            <button className="ad-share-btn ad-share-print" onClick={handlePrint} title="Print">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
            </button>
            {currentUser && (currentUser.role === 'admin' || currentUser.role === 'author') && (
              <button className="ad-share-btn ad-share-edit" onClick={openEditModal} title="Edit Article">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            )}
            <button
              className={`ad-share-btn ${isBookmarked ? 'ad-share-bookmarked' : 'ad-share-save'}`}
              onClick={handleBookmark}
              disabled={bookmarkLoading}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isBookmarked ? 'white' : 'none'} stroke="white" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Video takes priority over thumbnail */}
        {hasVideo ? (
          <div className="ad-video-wrapper">
            {isYouTube && youTubeId ? (
              <iframe
                className="ad-video-iframe"
                src={`https://www.youtube.com/embed/${youTubeId}?rel=0&modestbranding=1`}
                title={displayArticle?.title || article.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                className="ad-video-player"
                src={article.videoUrl}
                controls
                poster={article.thumbnail || ''}
              />
            )}
          </div>
        ) : article.thumbnail ? (
          <div className="ad-thumbnail-wrapper">
            <img src={article.thumbnail} alt={displayArticle?.title || article.title} className="ad-thumbnail" />
          </div>
        ) : null}

        {lang === 'en' && translating && (
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm text-secondary me-2" role="status" />
            <span className="text-muted small">Translating content...</span>
          </div>
        )}
        <div
          className="ad-body"
          style={{ fontSize: `${fontSize}px`, opacity: (lang === 'en' && translating) ? 0.3 : 1, transition: 'opacity 0.3s' }}
          dangerouslySetInnerHTML={{ __html: displayArticle?.content || article.content }}
        />

        <div className="ad-tags">
          {article.category?.name && (
            <Link to={`/${encodeURIComponent(article.category.name)}`} className="ad-tag">{article.category.name}</Link>
          )}
          {article.subcategory?.name && (
            <Link to={`/${encodeURIComponent(article.category.name)}/${encodeURIComponent(article.subcategory.name)}`} className="ad-tag">{article.subcategory.name}</Link>
          )}
        </div>

        {/* ── COMMENT SECTION ── */}
        <div className="cmt-section">

          {/* Header */}
          <div className="cmt-header">
            <div className="cmt-header-left">
              <span className="cmt-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              </span>
              <h3 className="cmt-title">{t('commentsTitle')}</h3>
              <span className="cmt-count">{comments.length}</span>
            </div>
          </div>

          {/* Comment form */}
          <div className="cmt-form-wrapper">
            {currentUser ? (
              <div className="cmt-form-inner">
                <div className="cmt-avatar" style={{ background: getAvatarColor(currentUser.name) }}>
                  {getInitials(currentUser.name)}
                </div>
                <form className="cmt-form" onSubmit={handleCommentSubmit}>
                  <div className="cmt-form-name">{currentUser.name}</div>
                  {commentError && <div className="cmt-alert cmt-alert-error">{commentError}</div>}
                  {commentSuccess && <div className="cmt-alert cmt-alert-success">{commentSuccess}</div>}
                  <textarea
                    className="cmt-textarea"
                    rows="3"
                    placeholder={t('commentPlaceholder')}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={commentLoading}
                  />
                  <div className="cmt-form-footer">
                    <span className="cmt-char-count">{t('charCount', commentText.length)}</span>
                    <button
                      type="submit"
                      className="cmt-submit-btn"
                      disabled={commentLoading || !commentText.trim()}
                    >
                      {commentLoading ? (
                        <><span className="cmt-spinner" /> {t('commentPosting')}</>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                          </svg>
                          {t('commentPost')}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="cmt-login-prompt">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                <p>{t('commentLoginPrompt')} <Link to="/login" className="cmt-login-link">{t('commentLoginLink')}</Link></p>
              </div>
            )}
          </div>

          {/* Comments list */}
          <div className="cmt-list">
            {comments.length === 0 ? (
              <div className="cmt-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                <p>{t('commentEmpty')}</p>
              </div>
            ) : (
              comments.map((comment, index) => (
                <div className="cmt-item" key={comment._id}>
                  <div className="cmt-avatar cmt-avatar-sm" style={{ background: getAvatarColor(comment.user?.name) }}>
                    {getInitials(comment.user?.name)}
                  </div>
                  <div className="cmt-item-body">
                    <div className="cmt-item-header">
                      <span className="cmt-item-name">{comment.user?.name || 'Anonymous'}</span>
                      <span className="cmt-item-dot">·</span>
                      <span className="cmt-item-date">{formatCommentDate(comment.createdAt)}</span>
                    </div>
                    <p className="cmt-item-text">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </div>

    {/* ── EDIT MODAL ── */}
    {editModalOpen && (
      <div className="ad-edit-overlay" onClick={(e) => e.target === e.currentTarget && setEditModalOpen(false)}>
        <div className="ad-edit-modal">
          <div className="ad-edit-header">
            <div className="ad-edit-header-left">
              <div className="ad-edit-header-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <div>
                <div className="ad-edit-title">Edit Article</div>
                <div className="ad-edit-subtitle">Changes will reflect immediately on the article page</div>
              </div>
            </div>
            <button className="ad-edit-close" onClick={() => setEditModalOpen(false)}>✕</button>
          </div>
          <form onSubmit={handleEditSubmit} className="ad-edit-form">
            {editError && <div className="ad-edit-alert ad-edit-alert-error">{editError}</div>}
            {editSuccess && <div className="ad-edit-alert ad-edit-alert-success">{editSuccess}</div>}
            <div className="ad-edit-field">
              <label className="ad-edit-label">Title <span className="ad-edit-label-required">*</span></label>
              <input
                className="ad-edit-input"
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Article title..."
                required
                disabled={editLoading}
              />
            </div>
            <div className="ad-edit-field">
              <label className="ad-edit-label">Author Name</label>
              <input
                className="ad-edit-input"
                type="text"
                value={editForm.authorName}
                onChange={(e) => setEditForm(f => ({ ...f, authorName: e.target.value }))}
                placeholder="Author name..."
                disabled={editLoading}
              />
            </div>
            <div className="ad-edit-divider" />
            <div className="ad-edit-field">
              <label className="ad-edit-label">Content <span className="ad-edit-label-required">*</span></label>
              <textarea
                className="ad-edit-textarea"
                rows="12"
                value={editForm.content}
                onChange={(e) => setEditForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Article content (HTML supported)..."
                required
                disabled={editLoading}
              />
            </div>
            <div className="ad-edit-actions">
              <button type="button" className="ad-edit-btn-cancel" onClick={() => setEditModalOpen(false)} disabled={editLoading}>
                Cancel
              </button>
              <button type="submit" className="ad-edit-btn-save" disabled={editLoading}>
                {editLoading ? (
                  <><span className="cmt-spinner" style={{borderTopColor:'white'}} /> Saving...</>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>
  );
};

export default ArticleDetail;