import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Podcast Index API - free, no secret needed for basic search
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { query, type = 'episode', maxResults = 10 } = await req.json();
  if (!query) return Response.json({ error: 'Query required' }, { status: 400 });

  // Use Listen Notes free search as fallback (no key needed for basic)
  // Primary: iTunes Search API (free, no key)
  const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=podcast&entity=${type === 'episode' ? 'podcastEpisode' : 'podcast'}&limit=${maxResults}`;

  const res = await fetch(itunesUrl);
  const data = await res.json();

  if (!res.ok) return Response.json({ error: 'Podcast search error' }, { status: 502 });

  const results = data.results || [];
  const items = results.map(item => ({
    externalId: String(item.trackId || item.collectionId || item.feedUrl),
    externalUrl: item.trackViewUrl || item.collectionViewUrl || item.feedUrl,
    title: item.trackName || item.collectionName,
    description: item.description || item.longDescription || '',
    creator: item.artistName,
    sourceName: item.collectionName || item.artistName,
    imageUrl: item.artworkUrl600 || item.artworkUrl100,
    publishedAt: item.releaseDate,
    type: 'podcast',
    sourceProvider: 'itunes',
    language: item.country,
    duration: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 60000) : null,
    audioUrl: item.previewUrl || null,
    metadataJson: JSON.stringify(item),
  }));

  return Response.json({ items });
});