import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Search Google Books, enrich missing pageCount via Open Library
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { query, maxResults = 10 } = await req.json();
  if (!query) return Response.json({ error: 'Query required' }, { status: 400 });

  const googleUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&printType=books`;
  const res = await fetch(googleUrl);
  const data = await res.json();

  const items = await Promise.all((data.items || []).map(async (item) => {
    const info = item.volumeInfo;
    let pageCount = info.pageCount || null;
    const isbn = info.industryIdentifiers?.find(i => i.type === 'ISBN_13')?.identifier
      || info.industryIdentifiers?.find(i => i.type === 'ISBN_10')?.identifier;

    // Enrich with Open Library if no pageCount
    if (!pageCount) {
      if (isbn) {
        const olRes = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
        if (olRes.ok) {
          const olData = await olRes.json();
          const book = olData[`ISBN:${isbn}`];
          if (book?.number_of_pages) pageCount = book.number_of_pages;
        }
      }
      if (!pageCount) {
        const q = encodeURIComponent(`${info.title} ${info.authors?.[0] || ''}`);
        const olRes2 = await fetch(`https://openlibrary.org/search.json?q=${q}&limit=1`);
        if (olRes2.ok) {
          const olData2 = await olRes2.json();
          const doc = olData2.docs?.[0];
          if (doc?.number_of_pages_median) pageCount = doc.number_of_pages_median;
        }
      }
    }

    return {
      externalId: item.id,
      externalUrl: info.infoLink || '',
      title: info.title,
      description: info.description || '',
      creator: info.authors?.[0] || '',
      authors: info.authors || [],
      sourceName: info.publisher || '',
      imageUrl: info.imageLinks?.thumbnail?.replace('http://', 'https://') || null,
      publishedAt: info.publishedDate || null,
      type: 'book',
      sourceProvider: 'googlebooks',
      pageCount,
      isbn,
      categories: info.categories || [],
      language: info.language,
      previewLink: info.previewLink || null,
      metadataJson: JSON.stringify(item),
    };
  }));

  return Response.json({ items });
});