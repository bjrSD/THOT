import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Normalize text: strip accents, lowercase, collapse whitespace
function normalize(str) {
  return (str || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[''`]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function searchYouTube(query, apiKey, maxResults = 15, regionCode = null) {
  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults: String(maxResults),
    key: apiKey,
    order: 'relevance',
  });
  if (regionCode) params.set('regionCode', regionCode);

  const url = `https://www.googleapis.com/youtube/v3/search?${params}`;
  console.log('[searchYoutube] request:', url.replace(apiKey, 'KEY'));
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    console.error('[searchYoutube] error:', JSON.stringify(data.error));
    return { items: [], error: data.error?.message };
  }
  console.log('[searchYoutube] raw results count:', data.items?.length ?? 0);
  return { items: data.items || [], error: null };
}

function decodeHtml(str) {
  return (str || '').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

function mapItem(item) {
  const s = item.snippet;
  const videoId = item.id?.videoId;
  if (!videoId) return null;
  return {
    externalId: videoId,
    externalUrl: `https://www.youtube.com/watch?v=${videoId}`,
    title: decodeHtml(s.title),
    description: s.description,
    creator: s.channelTitle,
    sourceName: s.channelTitle,
    imageUrl: s.thumbnails?.high?.url || s.thumbnails?.medium?.url || s.thumbnails?.default?.url,
    publishedAt: s.publishedAt,
    type: 'video',
    sourceProvider: 'youtube',
    language: null,
    duration: null,
    metadataJson: JSON.stringify({ videoId, channelTitle: s.channelTitle, publishedAt: s.publishedAt }),
  };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { query, maxResults = 15 } = await req.json();
  if (!query) return Response.json({ error: 'Query required' }, { status: 400 });

  const apiKey = Deno.env.get('YOUTUBE_API_KEY');
  if (!apiKey) return Response.json({ error: 'YouTube API key not configured' }, { status: 500 });

  const normQ = normalize(query);
  console.log('[searchYoutube] normalized query:', normQ, '| original:', query);

  const seenIds = new Set();
  const allItems = [];

  const addResults = (rawItems) => {
    for (const item of rawItems) {
      const mapped = mapItem(item);
      if (mapped && !seenIds.has(mapped.externalId)) {
        seenIds.add(mapped.externalId);
        allItems.push(mapped);
      }
    }
  };

  // Pass 1: exact original query, no region restriction
  const pass1 = await searchYouTube(query, apiKey, maxResults);
  addResults(pass1.items);

  // Pass 2: if < 5 results, try normalized query (stripped accents/apostrophes)
  if (allItems.length < 5 && normQ !== query.toLowerCase()) {
    console.log('[searchYoutube] pass 2 with normalized query:', normQ);
    const pass2 = await searchYouTube(normQ, apiKey, maxResults);
    addResults(pass2.items);
  }

  // Pass 3: if still < 5, try keywords only (drop short words)
  if (allItems.length < 5) {
    const keywords = normQ.split(' ').filter(w => w.length > 3).join(' ');
    if (keywords && keywords !== normQ) {
      console.log('[searchYoutube] pass 3 with keywords:', keywords);
      const pass3 = await searchYouTube(keywords, apiKey, maxResults);
      addResults(pass3.items);
    }
  }

  console.log('[searchYoutube] total deduplicated results:', allItems.length);
  return Response.json({ items: allItems.slice(0, maxResults) });
});