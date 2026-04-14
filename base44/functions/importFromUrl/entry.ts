import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function detectUrlType(url) {
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (/doi\.org|dx\.doi\.org/.test(url)) return 'doi';
  if (/podcast|podcasts|feed\.xml|rss/.test(url)) return 'podcast';
  return 'article';
}

function extractYoutubeId(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

async function fetchYoutubeMeta(videoId, apiKey) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  const item = data.items?.[0];
  if (!item) return null;
  const s = item.snippet;
  const dur = item.contentDetails?.duration;
  let durationMin = null;
  if (dur) {
    const m = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (m) durationMin = (parseInt(m[1]||0)*60) + parseInt(m[2]||0) + Math.round(parseInt(m[3]||0)/60);
  }
  return {
    externalId: videoId,
    externalUrl: `https://www.youtube.com/watch?v=${videoId}`,
    title: s.title,
    description: s.description?.slice(0, 500),
    creator: s.channelTitle,
    sourceName: s.channelTitle,
    imageUrl: s.thumbnails?.high?.url || s.thumbnails?.medium?.url,
    publishedAt: s.publishedAt,
    type: 'video',
    sourceProvider: 'youtube',
    duration: durationMin,
    metadataJson: JSON.stringify(item),
  };
}

async function fetchDOIMeta(doi) {
  const clean = doi.replace(/.*doi\.org\//, '');
  const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(clean)}`);
  if (!res.ok) return null;
  const data = await res.json();
  const w = data.message;
  return {
    externalId: w.DOI,
    externalUrl: w.URL,
    title: w.title?.[0] || 'Unknown',
    description: w.abstract?.replace(/<[^>]+>/g, '') || '',
    creator: w.author?.map(a => `${a.given} ${a.family}`).join(', '),
    sourceName: w['container-title']?.[0] || w.publisher,
    imageUrl: null,
    publishedAt: w.created?.['date-time'] || null,
    type: 'article',
    sourceProvider: 'crossref',
    doi: w.DOI,
    metadataJson: JSON.stringify(w),
  };
}

async function fetchGenericMeta(url) {
  // Try Open Graph via allorigins
  const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
  if (!res.ok) return { externalId: url, externalUrl: url, title: url, type: 'article', sourceProvider: 'manual' };
  const data = await res.json();
  const html = data.contents || '';
  const getOG = (prop) => {
    const m = html.match(new RegExp(`<meta[^>]+property=["']og:${prop}["'][^>]+content=["']([^"']+)["']`, 'i'))
      || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${prop}["']`, 'i'));
    return m ? m[1] : null;
  };
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return {
    externalId: url,
    externalUrl: url,
    title: getOG('title') || titleMatch?.[1]?.trim() || url,
    description: getOG('description') || '',
    creator: null,
    sourceName: new URL(url).hostname.replace('www.', ''),
    imageUrl: getOG('image') || null,
    publishedAt: null,
    type: 'article',
    sourceProvider: 'manual',
    metadataJson: JSON.stringify({ url }),
  };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { url } = await req.json();
  if (!url) return Response.json({ error: 'URL required' }, { status: 400 });

  const urlType = detectUrlType(url);
  let result = null;

  if (urlType === 'youtube') {
    const videoId = extractYoutubeId(url);
    if (videoId) {
      const apiKey = Deno.env.get('YOUTUBE_API_KEY');
      result = await fetchYoutubeMeta(videoId, apiKey);
    }
  } else if (urlType === 'doi') {
    result = await fetchDOIMeta(url);
  }

  if (!result) {
    result = await fetchGenericMeta(url);
  }

  return Response.json({ item: result });
});