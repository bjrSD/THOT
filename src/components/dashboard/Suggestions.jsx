import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Headphones, Play, FileText, Plus, Loader2, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const ICON_MAP = { book: BookOpen, podcast: Headphones, video: Play, article: FileText };

async function fetchRelatedFromGoogleBooks(titles, authors, categories) {
  const queries = [];
  // By author
  if (authors.length > 0) queries.push(`inauthor:${authors[0]}`);
  // By category
  if (categories.length > 0) queries.push(`subject:${categories[0]}`);
  // By title similarity
  if (titles.length > 0) queries.push(titles[0]);

  const results = [];
  const seen = new Set([...titles.map(t => t.toLowerCase())]);

  for (const q of queries.slice(0, 3)) {
    try {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=8&orderBy=relevance&langRestrict=fr`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.items) continue;
      for (const item of data.items) {
        const info = item.volumeInfo;
        const titleLower = (info.title || "").toLowerCase();
        if (seen.has(titleLower)) continue;
        seen.add(titleLower);
        results.push({
          title: info.title || "Sans titre",
          author: info.authors?.[0] || "",
          type: "book",
          cover_url: info.imageLinks?.thumbnail?.replace("http://", "https://") || null,
          rating: info.averageRating || null,
          total_pages: info.pageCount || null,
          publishedDate: info.publishedDate || "",
          reason: authors.includes(info.authors?.[0]) ? `Même auteur : ${info.authors?.[0]}` : `Similaire à votre bibliothèque`,
          buy_link: info.infoLink || `https://books.google.com/books?id=${item.id}`,
          googleId: item.id,
        });
        if (results.length >= 6) break;
      }
    } catch (e) {}
    if (results.length >= 6) break;
  }
  return results.slice(0, 4);
}

export default function Suggestions({ contents = [] }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiLoaded, setAiLoaded] = useState(false);
  const [addedIndex, setAddedIndex] = useState(null);
  const qc = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (item) => base44.entities.Content.create({
      title: item.title,
      author: item.author,
      type: item.type,
      status: "to_consume",
      cover_url: item.cover_url || undefined,
      buy_link: item.buy_link || undefined,
      total_pages: item.total_pages || undefined,
    }),
    onSuccess: (_, __, ctx) => {
      qc.invalidateQueries({ queryKey: ["contents"] });
    },
  });

  const handleAdd = (item, i) => {
    addMutation.mutate(item);
    setAddedIndex(i);
    setTimeout(() => setAddedIndex(null), 1800);
  };

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const completed = contents.filter(c => c.status === "completed" || c.status === "in_progress");
      const allTitles = completed.map(c => c.title).filter(Boolean);
      const allAuthors = [...new Set(completed.map(c => c.author).filter(Boolean))].slice(0, 3);
      const allCategories = [...new Set(completed.map(c => c.category).filter(Boolean))].slice(0, 3);

      if (allTitles.length === 0 && allCategories.length === 0) {
        // Fallback: popular books in French
        const url = `https://www.googleapis.com/books/v1/volumes?q=bestseller+roman&maxResults=8&orderBy=relevance&langRestrict=fr`;
        const res = await fetch(url);
        const data = await res.json();
        const fallback = (data.items || []).slice(0, 4).map(item => {
          const info = item.volumeInfo;
          return {
            title: info.title || "",
            author: info.authors?.[0] || "",
            type: "book",
            cover_url: info.imageLinks?.thumbnail?.replace("http://", "https://") || null,
            rating: info.averageRating || null,
            total_pages: info.pageCount || null,
            reason: "Populaire en ce moment",
            buy_link: info.infoLink || "",
            googleId: item.id,
          };
        });
        setSuggestions(fallback);
        setAiLoaded(true);
        return;
      }

      const books = await fetchRelatedFromGoogleBooks(allTitles, allAuthors, allCategories);
      if (books.length > 0) {
        setSuggestions(books);
        setAiLoaded(true);
      }
    } catch (e) {
      console.error("Suggestions failed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contents.length > 0 && !aiLoaded) {
      loadSuggestions();
    }
  }, [contents.length]);

  const existingTitles = new Set(contents.map(c => c.title.toLowerCase()));

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold">Suggestions pour vous</h3>
        <div className="flex items-center gap-2">
          {aiLoaded && <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">✨ Google Books</span>}
          <button onClick={loadSuggestions} disabled={loading} className="text-muted-foreground hover:text-accent transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {loading && suggestions.length === 0 ? (
        <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Recherche en cours...
        </div>
      ) : (
        <div className="space-y-2">
          {suggestions.map((item, i) => {
            const Icon = ICON_MAP[item.type] || BookOpen;
            const alreadyAdded = existingTitles.has(item.title.toLowerCase());
            const justAdded = addedIndex === i;
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                <div className={`flex items-center gap-3 p-2 rounded-lg transition-colors group ${justAdded ? "bg-green-500/10" : "hover:bg-secondary/50"}`}>
                  {/* Cover or icon */}
                  <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border border-border">
                    {item.cover_url
                      ? <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" />
                      : <Icon className="w-4 h-4 text-accent" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.author}</p>
                    <p className="text-xs text-accent mt-0.5">{item.reason}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.rating && <span className="text-xs text-yellow-500">⭐ {item.rating.toFixed(1)}</span>}
                      {item.total_pages && <span className="text-xs text-muted-foreground">{item.total_pages}p</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {justAdded ? (
                      <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center"
                      >
                        <span className="text-white text-xs font-bold">✓</span>
                      </motion.div>
                    ) : !alreadyAdded ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={addMutation.isPending}
                        onClick={() => handleAdd(item, i)}
                        title="Ajouter à ma bibliothèque"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 text-xs">✓</span>
                    )}
                    {item.buy_link && !justAdded && (
                      <a href={item.buy_link} target="_blank" rel="noopener noreferrer"
                        className="w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-accent"
                        onClick={e => e.stopPropagation()}
                        title="Voir sur Google Books"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          {suggestions.length === 0 && !loading && (
            <p className="text-xs text-muted-foreground text-center py-4">Ajoutez des contenus à votre bibliothèque pour recevoir des suggestions personnalisées.</p>
          )}
        </div>
      )}
    </div>
  );
}