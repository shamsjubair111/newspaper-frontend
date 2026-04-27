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
      whatsapp: `https://wa.me/?text=${title}%20${url}`,
    };
    if (links[platform]) window.open(links[platform], '_blank');
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

        <div className="ad-title-wrap">
          <h1 className="ad-title">{displayArticle?.title || article.title}</h1>
          <div className="ad-title-divider" />
        </div>

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
            <button className="ad-share-btn ad-share-whatsapp" onClick={() => handleShare('whatsapp')} title="WhatsApp">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
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
  );
};

export default ArticleDetail;