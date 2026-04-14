import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { query, language = 'fr', pageSize = 10 } = await req.json();
  if (!query) return Response.json({ error: 'Query required' }, { status: 400 });

  const apiKey = Deno.env.get('NEWS_API_KEY');
  if (!apiKey) return Response.json({ error: 'News API key not configured' }, { status: 500 });

  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=${language}&pageSize=${pageSize}&sortBy=relevancy&apiKey=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok || data.status === 'error') {
    return Response.json({ error: data.message || 'News API error' }, { status: 502 });
  }

  const items = (data.articles || []).map(article => ({
    externalId: article.url,
    externalUrl: article.url,
    title: article.title,
    description: article.description,
    creator: article.author,
    sourceName: article.source?.name,
    imageUrl: article.urlToImage,
    publishedAt: article.publishedAt,
    type: 'article',
    sourceProvider: 'newsapi',
    language: language,
    duration: null,
    metadataJson: JSON.stringify(article),
  }));

  return Response.json({ items });
});