import React, { useState, useRef } from "react";
import { Search, Loader2, X, BookOpen, Play, Headphones, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchAll } from "@/lib/contentSearchService";

const TYPE_ICON = { book: BookOpen, video: Play, podcast: Headphones, article: FileText };
const TYPE_COLOR = { book: "text-green-500", video: "text-red-500", podcast: "text-purple-500", article: "text-blue-500" };
const TYPE_LABEL = { book: "Livre", video: "Vidéo", podcast: "Podcast", article: "Article" };

export default function GoogleBooksSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleChange = (val) => {
    setQuery(val);
    clearTimeout(timeoutRef.current);
    if (!val.trim() || val.length < 2) { setResults([]); setOpen(false); return; }
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const items = await searchAll(val, 12);
        setResults(items);
        setOpen(true);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleSelect = (item) => {
    // Map to the format callers expect (backward compat with book fields)
    onSelect({
      title: item.title,
      author: item.creator || item.sourceName || "",
      cover_url: item.imageUrl || null,
      summary: item.description || "",
      total_pages: item.pageCount || null,
      buy_link: item.externalUrl || "",
      published_date: item.publishedAt || "",
      type: item.type,
      content_url: item.externalUrl || "",
      // raw item for full access
      _raw: item,
    });
    setQuery(item.title);
    setOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Rechercher un contenu (livres, vidéos, podcasts, articles)…"
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
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-card border border-border rounded-xl shadow-2xl max-h-80 overflow-y-auto">
          {results.map((item, i) => {
            const Icon = TYPE_ICON[item.type] || FileText;
            const color = TYPE_COLOR[item.type] || "text-muted-foreground";
            const label = TYPE_LABEL[item.type] || item.type;
            const isVideo = item.type === "video";
            return (
              <button key={item.externalId || i}
                onClick={() => handleSelect(item)}
                className="w-full flex items-center gap-3 p-3 hover:bg-secondary/60 transition-colors text-left border-b border-border last:border-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title}
                    className={`object-cover rounded shrink-0 ${isVideo ? "w-16 h-10" : "w-10 h-14"}`} />
                ) : (
                  <div className={`bg-secondary rounded flex items-center justify-center shrink-0 ${isVideo ? "w-16 h-10" : "w-10 h-14"}`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-[10px] font-semibold ${color}`}>{label}</span>
                  </div>
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.creator || item.sourceName}</p>
                  {item.publishedAt && (
                    <p className="text-xs text-muted-foreground">{new Date(item.publishedAt).getFullYear()}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}