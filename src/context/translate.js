/**
 * translate.js
 * Translates Bengali text/HTML to English using Google Translate's free endpoint.
 * - Strips HTML before translating (avoids tag mangling)
 * - Splits long content into chunks (Google has ~4800 char limit per request)
 * - Caches results in localStorage by content hash
 */

const CACHE_PREFIX = 'tr_v2_';
const CHUNK_SIZE = 4500;

// --- Cache helpers ---
const hashStr = (str) => {
  let h = 0;
  for (let i = 0; i < Math.min(str.length, 500); i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36) + str.length.toString(36);
};

const getCache = (key) => {
  try { return localStorage.getItem(CACHE_PREFIX + key); }
  catch { return null; }
};

const setCache = (key, value) => {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
    if (keys.length > 400) keys.slice(0, 60).forEach(k => localStorage.removeItem(k));
    localStorage.setItem(CACHE_PREFIX + key, value);
  } catch { /* storage full */ }
};

// --- Core translate (plain text, max CHUNK_SIZE chars) ---
const translateChunk = async (text) => {
  if (!text || !text.trim()) return text;
  const cacheKey = hashStr(text);
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=bn&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Translate API error');
    const data = await res.json();
    const translated = data[0].map(chunk => chunk[0]).join('');
    setCache(cacheKey, translated);
    return translated;
  } catch {
    return text;
  }
};

// --- Split long text into chunks at paragraph boundaries ---
const splitIntoChunks = (text) => {
  if (text.length <= CHUNK_SIZE) return [text];
  const paragraphs = text.split(/\n+/);
  const chunks = [];
  let current = '';
  for (const para of paragraphs) {
    if ((current + '\n' + para).length > CHUNK_SIZE && current) {
      chunks.push(current.trim());
      current = para;
    } else {
      current = current ? current + '\n' + para : para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
};

/**
 * Translate a plain-text string (handles chunking for long text).
 */
export const translateText = async (text) => {
  if (!text || !text.trim()) return text;
  if (text.length <= CHUNK_SIZE) return translateChunk(text);
  const chunks = splitIntoChunks(text);
  const translated = await Promise.all(chunks.map(translateChunk));
  return translated.join(' ');
};

/**
 * Translate HTML content:
 * 1. Strip tags and extract plain text blocks
 * 2. Translate each block
 * 3. Reassemble as <p> tags
 */
export const translateHtml = async (html) => {
  if (!html) return html;

  const cacheKey = 'html_' + hashStr(html);
  const cached = getCache(cacheKey);
  if (cached) return cached;

  // No HTML tags — treat as plain text
  if (!/<[a-z][\s\S]*?>/i.test(html)) {
    const translated = await translateText(html);
    setCache(cacheKey, translated);
    return translated;
  }

  try {
    // Convert block-level tags to newlines, then strip all remaining tags
    const plainText = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"');

    // Split into non-empty paragraph blocks
    const blocks = plainText
      .split('\n')
      .map(b => b.trim())
      .filter(b => b.length > 0);

    if (blocks.length === 0) return html;

    // Translate all blocks in parallel
    const translatedBlocks = await Promise.all(
      blocks.map(block => translateText(block))
    );

    // Reassemble as HTML paragraphs
    const result = translatedBlocks.map(b => `<p>${b}</p>`).join('\n');
    setCache(cacheKey, result);
    return result;
  } catch {
    return html;
  }
};

/**
 * Translate an array of strings in parallel.
 */
export const translateBatch = async (texts) => {
  return Promise.all(texts.map(t => translateText(t)));
};