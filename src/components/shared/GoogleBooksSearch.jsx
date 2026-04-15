import React, { useState, useRef } from "react";
import { Search, Loader2, X, BookOpen, Play, Headphones, FileText, Plus, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchAll, mapToContent } from "@/lib/contentSearchService";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";

const TYPE_ICON = { book: BookOpen, video: Play, podcast: Headphones, article: FileText };
const TYPE_COLOR = { book: "text-green-500", video: "text-red-500", podcast: "text-purple-500", article: "text-blue-500" };
const TYPE_LABEL = { book: "Livre", video: "Vidéo", podcast: "Podcast", article: "Article" };

export default function GoogleBooksSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState({}); // itemId → 'loading' | 'done'
  const timeoutRef = useRef(null);
  const queryClient = useQueryClient();

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

  // Quick add to library
  const handleAdd = async (e, item) => {
    e.stopPropagation();
    const key = item.externalId || item.title;
    setAdding(prev => ({ ...prev, [key]: 'loading' }));
    const contentData = mapToContent(item);
    const created = await base44.entities.Content.create(contentData);
    queryClient.invalidateQueries({ queryKey: ["contents"] });
    setAdding(prev => ({ ...prev, [key]: 'done' }));
    // Also call onSelect for backward compat (e.g. Library adds it to form)
    if (onSelect) onSelect({ ...item, _created: created });
  };

  // Click on item → redirect to SearchResultDetail
  const handleClick = (item) => {
    setOpen(false);
    const itemData = encodeURIComponent(JSON.stringify(item));
    window.location.href = createPageUrl("SearchResultDetail") + `?data=${itemData}`;
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Rechercher livres, vidéos, podcasts…"
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
            const key = item.externalId || item.title;
            const addState = adding[key];

            return (
              <div key={key || i}
                className="w-full flex items-center gap-3 p-3 hover:bg-secondary/60 transition-colors border-b border-border last:border-0 cursor-pointer"
                onClick={() => handleClick(item)}>
                {/* Thumbnail */}
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title}
                    className={`object-cover rounded shrink-0 ${isVideo ? "w-16 h-10" : "w-10 h-14"}`} />
                ) : (
                  <div className={`bg-secondary rounded flex items-center justify-center shrink-0 ${isVideo ? "w-16 h-10" : "w-10 h-14"}`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                )}

                {/* Info */}
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

                {/* Quick add button */}
                <button
                  onClick={(e) => handleAdd(e, item)}
                  disabled={!!addState}
                  title="Ajouter à ma bibliothèque"
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all border ${
                    addState === 'done'
                      ? 'bg-green-500 border-green-500 text-white'
                      : addState === 'loading'
                      ? 'bg-secondary border-border text-muted-foreground'
                      : 'bg-accent/10 border-accent/30 text-accent hover:bg-accent hover:text-white'
                  }`}>
                  {addState === 'loading' ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : addState === 'done' ? <Check className="w-3.5 h-3.5" />
                    : <Plus className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}