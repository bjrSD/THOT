import { base44 } from '@/api/base44Client';

// Search by type using backend functions
export async function searchContent(type, query) {
  if (!query.trim()) return [];
  
  const fnMap = {
    video: 'searchYoutube',
    article: 'searchNews',
    podcast: 'searchPodcasts',
  };
  
  const fn = fnMap[type];
  if (!fn) return [];
  
  const res = await base44.functions.invoke(fn, { query, maxResults: 12 });
  return res.data?.items || [];
}

// Import from URL
export async function importFromUrl(url) {
  const res = await base44.functions.invoke('importFromUrl', { url });
  return res.data?.item || null;
}

// Map external item to Content entity format
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
    current_duration: 0,
    // Store provider metadata in personal_note as JSON ref
    personal_note: JSON.stringify({
      sourceProvider: item.sourceProvider,
      externalId: item.externalId,
      sourceName: item.sourceName,
      publishedAt: item.publishedAt,
      language: item.language,
      doi: item.doi || null,
    }),
  };
}

// Check for duplicate by externalId stored in personal_note
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