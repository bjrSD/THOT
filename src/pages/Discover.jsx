import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Headphones, Play, FileText, Plus, Loader2, Check, Search, X, ExternalLink, SlidersHorizontal, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { TYPE_LABELS, CATEGORY_LABELS } from "@/components/shared/KPUtils";
import FilterPanel, { DEFAULT_FILTERS } from "@/components/discover/FilterPanel";

const TYPE_ICON_MAP = { book: BookOpen, podcast: Headphones, video: Play, article: FileText };

// Pool of varied queries for random discovery
const RANDOM_QUERIES = [
  "roman policier", "philosophie stoïcisme", "intelligence artificielle", "histoire médiévale",
  "développement personnel", "startup entrepreneuriat", "psychologie cognitive", "science fiction",
  "biographie personnalité", "roman historique français", "thriller psychologique", "économie comportementale",
  "leadership management", "spiritualité méditation", "voyage exploration", "romance contemporaine",
  "fantasy épique", "manga aventure", "cuisine gastronomie", "nature écologie",
  "politique société", "mathématiques vulgarisation", "art contemporain", "musique jazz",
  "astronomie cosmos", "neurosciences cerveau", "roman noir américain", "essai philosophique",
  "histoire révolution", "littérature classique", "crime investigation", "futurisme technologie",
];

function mapCategory(googleCategories = []) {
  const s = (googleCategories.join(" ") || "").toLowerCase();
  if (s.includes("business") || s.includes("management") || s.includes("economics")) return "business";
  if (s.includes("psychology") || s.includes("self-help") || s.includes("personal")) return "psychologie";
  if (s.includes("science") || s.includes("physics") || s.includes("biology") || s.includes("chemistry")) return "science";
  if (s.includes("history") || s.includes("histoire")) return "histoire";
  if (s.includes("philosoph")) return "philosophie";
  if (s.includes("technology") || s.includes("computer") || s.includes("programming")) return "technologie";
  if (s.includes("art") || s.includes("music") || s.includes("design")) return "art";
  if (s.includes("health") || s.includes("medical") || s.includes("fitness")) return "sante";
  return "autre";
}

async function fetchGoogleBooks(query, language = "fr", startIndex = 0) {
  const q = encodeURIComponent(query.trim() || "bestseller");
  const lang = language ? `&langRestrict=${language}` : "";
  const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=20&startIndex=${startIndex}${lang}&orderBy=relevance`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.items) return [];
  return data.items.map(item => {
    const info = item.volumeInfo;
    return {
      googleId: item.id,
      title: info.title || "Sans titre",
      author: info.authors?.[0] || "",
      authors: info.authors || [],
      type: "book",
      category: mapCategory(info.categories),
      summary: info.description?.slice(0, 300) || "",
      total_pages: info.pageCount || null,
      cover_url: info.imageLinks?.thumbnail?.replace("http://", "https://") || null,
      buy_link: info.infoLink || `https://books.google.com/books?id=${item.id}`,
      googleCategories: info.categories || [],
      publishedDate: info.publishedDate || "",
      rating: info.averageRating || null,
      ratingsCount: info.ratingsCount || 0,
    };
  });
}

function applyFilters(items, filters) {
  let result = [...items];
  if (filters.contentType) result = result.filter(i => i.type === filters.contentType);
  if (filters.authorQuery.trim()) {
    const a = filters.authorQuery.toLowerCase();
    result = result.filter(i => i.author.toLowerCase().includes(a) || (i.authors || []).some(au => au.toLowerCase().includes(a)));
  }
  if (filters.minRating > 0) result = result.filter(i => (i.rating || 0) >= filters.minRating);
  if (filters.hasRating) result = result.filter(i => !!i.rating);
  if (filters.hasCover) result = result.filter(i => !!i.cover_url);
  if (filters.pageRange) {
    result = result.filter(i => {
      const p = i.total_pages || 0;
      if (filters.pageRange === "0-100") return p > 0 && p < 100;
      if (filters.pageRange === "100-250") return p >= 100 && p < 250;
      if (filters.pageRange === "250-400") return p >= 250 && p < 400;
      if (filters.pageRange === "400-600") return p >= 400 && p < 600;
      if (filters.pageRange === "600+") return p >= 600;
      return true;
    });
  }
  if (filters.yearFrom) {
    result = result.filter(i => {
      const year = parseInt(i.publishedDate?.slice(0, 4) || "0");
      if (filters.yearFrom === "classic") return year < 1990;
      return year >= parseInt(filters.yearFrom);
    });
  }
  if (filters.genres.length > 0) {
    result = result.filter(i => {
      const haystack = [...(i.googleCategories || []), i.summary, i.title].join(" ").toLowerCase();
      return filters.genres.some(g => haystack.includes(g.toLowerCase()));
    });
  }
  if (filters.sort === "rating_desc") result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  else if (filters.sort === "rating_asc") result.sort((a, b) => (a.rating || 0) - (b.rating || 0));
  else if (filters.sort === "pages_asc") result.sort((a, b) => (a.total_pages || 0) - (b.total_pages || 0));
  else if (filters.sort === "pages_desc") result.sort((a, b) => (b.total_pages || 0) - (a.total_pages || 0));
  else if (filters.sort === "date_desc") result.sort((a, b) => (b.publishedDate || "").localeCompare(a.publishedDate || ""));
  else if (filters.sort === "date_asc") result.sort((a, b) => (a.publishedDate || "").localeCompare(b.publishedDate || ""));
  return result;
}

export default function Discover() {

  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const queryClient = useQueryClient();

  // Infinite scroll state
  const [allBooks, setAllBooks] = useState([]);
  const [page, setPage] = useState(0); // startIndex = page * 20
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentQueryPool, setCurrentQueryPool] = useState(() => {
    // Shuffle random queries on mount
    return [...RANDOM_QUERIES].sort(() => Math.random() - 0.5);
  });
  const [queryPoolIndex, setQueryPoolIndex] = useState(0);
  const loaderRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(t);
  }, [query]);

  // Reset when search/language changes
  useEffect(() => {
    setAllBooks([]);
    setPage(0);
    setHasMore(true);
    setQueryPoolIndex(0);
  }, [debouncedQuery, filters.language]);

  // Initial + paginated fetch
  const loadBooks = useCallback(async (pageNum, poolIdx) => {
    setIsFetchingMore(true);
    try {
      let q;
      if (debouncedQuery.trim()) {
        // Search mode: paginate same query with startIndex
        q = debouncedQuery.trim();
        const startIndex = pageNum * 20;
        const results = await fetchGoogleBooks(q, filters.language, startIndex);
        if (results.length === 0) { setHasMore(false); return; }
        setAllBooks(prev => {
          const ids = new Set(prev.map(b => b.googleId));
          return [...prev, ...results.filter(b => !ids.has(b.googleId))];
        });
        setPage(pageNum + 1);
      } else {
        // Discovery mode: rotate through random query pool, vary startIndex
        const currentQ = currentQueryPool[poolIdx % currentQueryPool.length];
        const startIndex = Math.floor(Math.random() * 5) * 10; // 0,10,20,30,40
        const results = await fetchGoogleBooks(currentQ, filters.language, startIndex);
        setAllBooks(prev => {
          const ids = new Set(prev.map(b => b.googleId));
          return [...prev, ...results.filter(b => !ids.has(b.googleId))];
        });
        setQueryPoolIndex(poolIdx + 1);
      }
    } finally {
      setIsFetchingMore(false);
    }
  }, [debouncedQuery, filters.language, currentQueryPool]);

  // Load first batch on mount / query change
  useEffect(() => {
    loadBooks(0, 0);
  }, [debouncedQuery, filters.language]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingMore && hasMore) {
          if (debouncedQuery.trim()) {
            loadBooks(page, queryPoolIndex);
          } else {
            loadBooks(page, queryPoolIndex);
          }
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [isFetchingMore, hasMore, page, queryPoolIndex, loadBooks]);

  const { data: existingContents = [] } = useQuery({
    queryKey: ["contents"],
    queryFn: () => base44.entities.Content.list("-updated_date", 200),
  });

  const addMutation = useMutation({
    mutationFn: (item) => {
      const data = { title: item.title, author: item.author, type: item.type, category: item.category, summary: item.summary, status: "to_consume" };
      if (item.total_pages) data.total_pages = item.total_pages;
      if (item.cover_url) data.cover_url = item.cover_url;
      if (item.buy_link) data.buy_link = item.buy_link;
      return base44.entities.Content.create(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contents"] }),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => base44.entities.Content.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contents"] }),
  });

  const existingByTitle = {};
  for (const c of existingContents) existingByTitle[c.title] = c;

  const filtered = applyFilters(allBooks, filters);

  const activeFiltersCount = [
    filters.sort !== "relevance",
    filters.contentType !== "",
    filters.genres.length > 0,
    filters.language !== "fr",
    filters.minRating > 0,
    filters.pageRange !== "",
    filters.yearFrom !== "",
    filters.authorQuery !== "",
    filters.hasRating,
    filters.hasCover,
  ].filter(Boolean).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Découvrir</h1>
        <p className="text-muted-foreground mt-1">
          {filtered.length > 0 ? `${filtered.length} livres chargés — scroll pour en découvrir plus` : "Explorez des millions de livres via Google Books"}
        </p>
      </div>

      {/* Search + Filter button */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher un livre, auteur, sujet…"
            className="pl-10 pr-10 h-11 text-base"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        <Button
          variant={showFilters || activeFiltersCount > 0 ? "default" : "outline"}
          className="h-11 gap-2 shrink-0"
          onClick={() => setShowFilters(v => !v)}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtres
          {activeFiltersCount > 0 && (
            <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{activeFiltersCount}</span>
          )}
        </Button>
      </div>

      {/* Content type quick filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { value: "", label: "Tous" },
          { value: "book", label: "📚 Livres" },
          { value: "podcast", label: "🎙️ Podcasts" },
          { value: "video", label: "🎬 Vidéos" },
          { value: "article", label: "📰 Articles" },
        ].map(t => (
          <Button key={t.value} variant={filters.contentType === t.value ? "default" : "outline"} size="sm"
            onClick={() => setFilters(f => ({ ...f, contentType: t.value }))} className="shrink-0 h-8 text-xs">
            {t.label}
          </Button>
        ))}
      </div>

      {/* Quick criteria */}
      <div className="flex flex-wrap gap-2">
        {[
          { sort: "rating_desc", label: "⭐ Mieux notés" },
          { sort: "date_desc", label: "🆕 Plus récents" },
          { sort: "pages_asc", label: "⚡ Lecture rapide" },
          { sort: "pages_desc", label: "📖 Lecture longue" },
          { sort: "date_asc", label: "🏛️ Classiques" },
          { sort: "rating_asc", label: "💎 Pépites cachées" },
        ].map(c => (
          <button key={c.sort} onClick={() => setFilters(f => ({ ...f, sort: c.sort }))}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filters.sort === c.sort
                ? "bg-accent text-white border-accent"
                : "bg-secondary hover:bg-accent/10 hover:text-accent border-border"
            }`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              onClose={() => setShowFilters(false)}
              onReset={() => setFilters(DEFAULT_FILTERS)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Initial loading */}
      {allBooks.length === 0 && isFetchingMore && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-accent mr-2" />
          <span className="text-muted-foreground text-sm">Chargement des livres…</span>
        </div>
      )}

      {filtered.length === 0 && !isFetchingMore && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun résultat. Essayez un autre mot-clé ou ajustez les filtres.</p>
        </div>
      )}

      {/* Cards grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, i) => {
          const Icon = TYPE_ICON_MAP[item.type] || BookOpen;
          const existing = existingByTitle[item.title];
          const isAdded = !!existing;

          return (
            <motion.div key={item.googleId || item.title + i}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.4) }}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center border border-border">
                      {item.cover_url ? (
                        <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <Icon className="w-5 h-5 text-accent" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm leading-tight line-clamp-2">{item.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.author}</p>
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        <span className="text-xs bg-secondary px-1.5 py-0.5 rounded">{TYPE_LABELS[item.type] || item.type}</span>
                        {item.category && item.category !== "autre" && (
                          <span className="text-xs bg-secondary px-1.5 py-0.5 rounded">{CATEGORY_LABELS[item.category] || item.category}</span>
                        )}
                        {item.rating && (
                          <span className="text-xs text-yellow-500 font-medium">⭐ {item.rating.toFixed(1)}</span>
                        )}
                        {item.total_pages && (
                          <span className="text-xs text-muted-foreground">{item.total_pages}p</span>
                        )}
                        {item.publishedDate && (
                          <span className="text-xs text-muted-foreground">{item.publishedDate.slice(0, 4)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground flex-1 mb-3 leading-relaxed line-clamp-3">{item.summary}</p>

                  <button
                    onClick={async () => {
                      if (isAdded) {
                        navigate(`/ContentDetail?id=${existing.id}`);
                      } else {
                        const newContent = await addMutation.mutateAsync(item);
                        queryClient.invalidateQueries({ queryKey: ["contents"] });
                        navigate(`/ContentDetail?id=${newContent.id}`);
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs text-accent hover:underline mb-3 font-medium"
                  >
                    <ExternalLink className="w-3 h-3" /> Voir les détails
                  </button>

                  <Button
                    size="sm"
                    variant={isAdded ? "secondary" : "default"}
                    className={`w-full ${isAdded ? "border border-green-500/30 text-green-700 hover:bg-red-50 hover:text-red-600 hover:border-red-300" : ""}`}
                    disabled={addMutation.isPending || removeMutation.isPending}
                    onClick={() => isAdded ? removeMutation.mutate(existing.id) : addMutation.mutate(item)}
                  >
                    {addMutation.isPending || removeMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isAdded ? (
                      <><Check className="w-3.5 h-3.5 mr-1.5" /> Ajouté — Retirer</>
                    ) : (
                      <><Plus className="w-3.5 h-3.5 mr-1.5" /> Ajouter à ma bibliothèque</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Infinite scroll loader */}
      <div ref={loaderRef} className="flex flex-col items-center py-8 gap-3">
        {isFetchingMore && (
          <>
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">Chargement de nouveaux livres…</p>
          </>
        )}
        {!isFetchingMore && filtered.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => loadBooks(page, queryPoolIndex)} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Charger plus
          </Button>
        )}
      </div>
    </div>
  );
}