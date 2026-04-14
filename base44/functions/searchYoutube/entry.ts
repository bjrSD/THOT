import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { query, type = 'video', maxResults = 10 } = await req.json();
  if (!query) return Response.json({ error: 'Query required' }, { status: 400 });

  const apiKey = Deno.env.get('YOUTUBE_API_KEY');
  if (!apiKey) return Response.json({ error: 'YouTube API key not configured' }, { status: 500 });

  const searchType = type === 'playlist' ? 'playlist' : 'video';
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=${searchType}&maxResults=${maxResults}&key=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) return Response.json({ error: data.error?.message || 'YouTube API error' }, { status: 502 });

  const items = (data.items || []).map(item => {
    const s = item.snippet;
    const videoId = item.id?.videoId || item.id?.playlistId;
    return {
      externalId: videoId,
      externalUrl: `https://www.youtube.com/watch?v=${videoId}`,
      title: s.title,
      description: s.description,
      creator: s.channelTitle,
      sourceName: s.channelTitle,
      imageUrl: s.thumbnails?.high?.url || s.thumbnails?.medium?.url || s.thumbnails?.default?.url,
      publishedAt: s.publishedAt,
      type: 'video',
      sourceProvider: 'youtube',
      language: null,
      duration: null,
      metadataJson: JSON.stringify(item),
    };
  });

  return Response.json({ items });
});