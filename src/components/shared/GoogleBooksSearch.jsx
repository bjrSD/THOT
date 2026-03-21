import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, BookOpen, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function GoogleBooksSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!query.trim() || query.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8&langRestrict=fr&orderBy=relevance`
        );
        const json = await res.json();
        const books = (json.items || []).map((item) => {
          const info = item.volumeInfo || {};
          return {
            googleId: item.id,
            title: info.title || "Sans titre",
            author: (info.authors || []).join(", "),
            cover_url: info.imageLinks?.thumbnail?.replace("http:", "https:") || null,
            summary: info.description || "",
            total_pages: info.pageCount || null,
            category: mapCategory(info.categories),
            buy_link: info.infoLink || "",
            publisher: info.publisher || "",
            published_date: info.publishedDate || "",
          };
        });
        setResults(books);
        setOpen(true);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(timeoutRef.current);
  }, [query]);

  function mapCategory(cats) {
    if (!cats || cats.length === 0) return "autre";
    const c = cats[0].toLowerCase();
    if (c.includes("philosophy") || c.includes("philosophie")) return "philosophie";
    if (c.includes("science") || c.includes("biology") || c.includes("physics")) return "science";
    if (c.includes("business") || c.includes("economics") || c.includes("management")) return "business";
    if (c.includes("tech") || c.includes("computer") || c.includes("programming")) return "technologie";
    if (c.includes("history") || c.includes("histoire")) return "histoire";
    if (c.includes("psycho") || c.includes("self")) return "psychologie";
    if (c.includes("art") || c.includes("music") || c.includes("literature")) return "art";
    if (c.includes("health") || c.includes("medical") || c.includes("santé")) return "sante";
    return "autre";
  }

  const handleSelect = (book) => {
    onSelect(book);
    setQuery(book.title);
    setOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un livre (Google Books)..."
          className="pl-9 pr-9"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />}
        {query && !loading && (
          <button onClick={() => { setQuery(""); setOpen(false); setResults([]); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-card border border-border rounded-xl shadow-2xl max-h-72 overflow-y-auto">
          {results.map((book) => (
            <button
              key={book.googleId}
              onClick={() => handleSelect(book)}
              className="w-full flex items-center gap-3 p-3 hover:bg-secondary/60 transition-colors text-left border-b border-border last:border-0"
            >
              {book.cover_url ? (
                <img src={book.cover_url} alt={book.title} className="w-10 h-14 object-cover rounded shrink-0" />
              ) : (
                <div className="w-10 h-14 bg-secondary rounded flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{book.title}</p>
                <p className="text-xs text-muted-foreground truncate">{book.author}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {book.total_pages && <span className="text-xs text-accent">{book.total_pages} pages</span>}
                  {book.published_date && <span className="text-xs text-muted-foreground">{book.published_date.slice(0, 4)}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}