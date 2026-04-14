/**
 * Unified content search service — single source of truth for all content searches.
 * Handles: YouTube, iTunes Podcasts, Google Books, GNews/Currents articles.
 * 
 * Usage:
 *   searchByType('video', 'Squeezie imposteur')   → YouTube results only
 *   searchByType('book', 'Atomic Habits')          → Google Books results only
 *   searchByType('podcast', 'Huberman')            → iTunes results only
 *   searchByType('article', 'IA école France')     → GNews + Currents results
 *   searchAll('Squeezie')                          → all types merged, scored, deduped
 */

import { base44 } from '@/api/base44Client';

// ─── Text normalization for dedup/scoring ─────────────────────────────────
function normalize(str) {
  return (str || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[''`]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function dedupeByKey(items, keyFn) {
  const seen = new Set();
  return items.filter(item => {
    const k = keyFn(item);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// Score how relevant a result is to the query (0–1)
function scoreRelevance(item, query) {
  const nq = normalize(query);
  const nt = normalize(item.title || '');
  const nc = normalize(item.creator || item.sourceName || '');
  if (nt.includes(nq)) return 1.0;
  const words = nq.split(' ').filter(w => w.length > 2);
  const matchedWords = words.filter(w => nt.includes(w) || nc.includes(w));
  return words.length > 0 ? matchedWords.length / words.length : 0;
}

// ─── Book search via Google Books (client-side, no backend fn needed) ─────
async function searchBooks(query, maxResults = 12) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&langRestrict=fr&printType=books`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.items) return [];
  return data.items.map(item => {
    const info = item.volumeInfo;
    return {
      externalId: item.id,
      externalUrl: info.infoLink || `https://books.google.com/books?id=${item.id}`,
      title: info.title || 'Sans titre',
      creator: info.authors?.[0] || '',
      sourceName: 'Google Books',
      imageUrl: info.imageLinks?.thumbnail?.replace('http://', 'https://') || null,
      publishedAt: info.publishedDate || null,
      description: info.description?.slice(0, 300) || '',
      type: 'book',
      sourceProvider: 'googlebooks',
      pageCount: info.pageCount || null,
      language: info.language || null,
      duration: null,
    };
  });
}

// ─── Backend function callers ──────────────────────────────────────────────
async function searchVideos(query, maxResults = 15) {
  const res = await base44.functions.invoke('searchYoutube', { query, maxResults });
  return res.data?.items || [];
}

async function searchPodcasts(query, maxResults = 12) {
  const res = await base44.functions.invoke('searchPodcasts', { query, maxResults });
  return res.data?.items || [];
}

async function searchArticles(query, maxResults = 12) {
  const res = await base44.functions.invoke('searchNews', { query, pageSize: maxResults });
  return res.data?.items || [];
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Search by a specific type. Returns normalized items.
 */
export async function searchByType(type, query, maxResults = 15) {
  if (!query || query.trim().length < 2) return [];
  switch (type) {
    case 'video':   return searchVideos(query, maxResults);
    case 'podcast': return searchPodcasts(query, maxResults);
    case 'book':    return searchBooks(query, maxResults);
    case 'article': return searchArticles(query, maxResults);
    default:        return [];
  }
}

/**
 * Search all types in parallel, merge, score, dedup.
 */
export async function searchAll(query, maxResults = 20) {
  if (!query || query.trim().length < 2) return [];

  const [videos, podcasts, books, articles] = await Promise.allSettled([
    searchVideos(query, 8),
    searchPodcasts(query, 8),
    searchBooks(query, 8),
    searchArticles(query, 6),
  ]);

  const all = [
    ...(videos.status === 'fulfilled' ? videos.value : []),
    ...(podcasts.status === 'fulfilled' ? podcasts.value : []),
    ...(books.status === 'fulfilled' ? books.value : []),
    ...(articles.status === 'fulfilled' ? articles.value : []),
  ];

  // Score + sort
  const scored = all.map(item => ({ ...item, _score: scoreRelevance(item, query) }));
  scored.sort((a, b) => b._score - a._score);

  // Dedup by externalId then by normalized title
  const byId = dedupeByKey(scored, i => i.externalId || i.externalUrl);
  const byTitle = dedupeByKey(byId, i => normalize(i.title).slice(0, 60));

  return byTitle.slice(0, maxResults);
}

/**
 * Map a search result item to Content entity format for saving.
 */
export function mapToContent(item) {
  return {
    title: item.title || 'Sans titre',
    author: item.creator || item.sourceName || '',
    type: item.type || 'article',
    cover_url: item.imageUrl || '',
    summary: item.description || '',
    content_url: item.externalUrl || '',
    status: 'to_consume',
    is_public: true,
    published_year: item.publishedAt ? String(new Date(item.publishedAt).getFullYear()) : '',
    total_duration: item.duration || null,
    total_pages: item.pageCount || null,
    current_duration: 0,
    personal_note: JSON.stringify({
      sourceProvider: item.sourceProvider,
      externalId: item.externalId,
      sourceName: item.sourceName,
      publishedAt: item.publishedAt,
      language: item.language,
    }),
  };
}

/**
 * Find duplicate in user library by externalId.
 */
export async function findDuplicate(externalId, type) {
  if (!externalId) return null;
  const existing = await base44.entities.Content.list('-created_date', 200);
  return existing.find(c => {
    try {
      const meta = JSON.parse(c.personal_note || '{}');
      return meta.externalId === externalId && c.type === type;
    } catch { return false; }
  });
}

// Legacy compat export
export const searchContent = searchByType;
export const importFromUrl = async (url) => {
  const res = await base44.functions.invoke('importFromUrl', { url });
  return res.data?.item || null;
};