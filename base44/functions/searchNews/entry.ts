import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { query, language = 'fr', pageSize = 10 } = await req.json();
  if (!query) return Response.json({ error: 'Query required' }, { status: 400 });

  const gnewsKey = Deno.env.get('GNEWS_API_KEY');
  const currentsKey = Deno.env.get('CURRENTS_API_KEY');

  const results = [];
  const seenUrls = new Set();

  // Source 1: GNews API
  if (gnewsKey) {
    const lang = language === 'fr' ? 'fr' : 'en';
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=${lang}&max=${pageSize}&apikey=${gnewsKey}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      for (const article of (data.articles || [])) {
        if (!seenUrls.has(article.url)) {
          seenUrls.add(article.url);
          results.push({
            externalId: article.url,
            externalUrl: article.url,
            title: article.title,
            description: article.description,
            creator: article.source?.name || null,
            sourceName: article.source?.name,
            imageUrl: article.image,
            publishedAt: article.publishedAt,
            type: 'article',
            sourceProvider: 'gnews',
            language: language,
            duration: null,
            metadataJson: JSON.stringify(article),
          });
        }
      }
    }
  }

  // Source 2: Currents API (complement)
  if (currentsKey && results.length < pageSize) {
    const lang = language === 'fr' ? 'fr' : 'en';
    const url = `https://api.currentsapi.services/v1/search?keywords=${encodeURIComponent(query)}&language=${lang}&apiKey=${currentsKey}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      for (const article of (data.news || [])) {
        if (!seenUrls.has(article.url)) {
          seenUrls.add(article.url);
          results.push({
            externalId: article.url,
            externalUrl: article.url,
            title: article.title,
            description: article.description,
            creator: article.author || null,
            sourceName: article.author,
            imageUrl: article.image,
            publishedAt: article.published,
            type: 'article',
            sourceProvider: 'currents',
            language: language,
            duration: null,
            metadataJson: JSON.stringify(article),
          });
        }
      }
    }
  }

  return Response.json({ items: results.slice(0, pageSize) });
});