import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, Headphones, Play, FileText, Plus, Loader2, Check, Search, X, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { TYPE_LABELS, CATEGORY_LABELS } from "@/components/shared/KPUtils";

const TYPE_ICON_MAP = { book: BookOpen, podcast: Headphones, video: Play, article: FileText };

const FILTER_TYPES = [
  { value: "all", label: "Tous" },
  { value: "book", label: "Livres", icon: BookOpen },
  { value: "podcast", label: "Podcasts", icon: Headphones },
  { value: "video", label: "Vidéos", icon: Play },
  { value: "article", label: "Articles", icon: FileText },
];

const CATEGORIES = [
  { value: "all", label: "Toutes catégories" },
  { value: "philosophie", label: "Philosophie" },
  { value: "science", label: "Science" },
  { value: "business", label: "Business" },
  { value: "technologie", label: "Technologie" },
  { value: "histoire", label: "Histoire" },
  { value: "psychologie", label: "Psychologie" },
  { value: "art", label: "Art" },
  { value: "sante", label: "Santé" },
];

// Map Google Books subject to our categories
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

async function searchGoogleBooks(query, maxResults = 24) {
  if (!query.trim()) return [];
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&langRestrict=fr&orderBy=relevance`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.items) return [];
  return data.items.map(item => {
    const info = item.volumeInfo;
    return {
      googleId: item.id,
      title: info.title || "Sans titre",
      author: info.authors?.[0] || "",
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

const SUGGESTED_QUERIES = ["philosophie", "intelligence artificielle", "développement personnel", "histoire de France", "science", "business startup"];

export default function Discover() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const queryClient = useQueryClient();

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(t);
  }, [query]);

  const { data: googleResults = [], isLoading: isSearching } = useQuery({
    queryKey: ["googleBooks", debouncedQuery],
    queryFn: () => searchGoogleBooks(debouncedQuery || "bestseller littérature"),
    staleTime: 1000 * 60 * 5,
  });

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

  // Map title → existing content record
  const existingByTitle = {};
  for (const c of existingContents) {
    existingByTitle[c.title] = c;
  }

  const filtered = googleResults.filter(item => {
    if (typeFilter !== "all" && item.type !== typeFilter) return false;
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Découvrir</h1>
        <p className="text-muted-foreground mt-1">Explorez des millions de livres via Google Books</p>
      </div>

      {/* Search bar */}
      <div className="relative">
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

      {/* Suggested queries */}
      {!query && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUERIES.map(q => (
            <button key={q} onClick={() => setQuery(q)}
              className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-accent/10 hover:text-accent transition-colors border border-border">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTER_TYPES.map(t => (
            <Button key={t.value} variant={typeFilter === t.value ? "default" : "outline"} size="sm"
              onClick={() => setTypeFilter(t.value)} className="shrink-0 h-8 text-xs">
              {t.icon && <t.icon className="w-3.5 h-3.5 mr-1" />}
              {t.label}
            </Button>
          ))}
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="text-xs h-8 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {isSearching && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-accent mr-2" />
          <span className="text-muted-foreground text-sm">Recherche en cours…</span>
        </div>
      )}

      {/* Results */}
      {!isSearching && filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun résultat. Essayez un autre mot-clé.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, i) => {
          const Icon = TYPE_ICON_MAP[item.type] || BookOpen;
          const existing = existingByTitle[item.title];
          const isAdded = !!existing;

          return (
            <motion.div key={item.googleId || item.title + i}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start gap-3 mb-3">
                    {/* Cover or icon */}
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
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground flex-1 mb-3 leading-relaxed line-clamp-3">{item.summary}</p>

                  {/* Link */}
                  {item.buy_link && (
                    <a href={item.buy_link} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-accent hover:underline mb-3">
                      <ExternalLink className="w-3 h-3" /> Voir le descriptif
                    </a>
                  )}

                  {/* Add / Remove button */}
                  <Button
                    size="sm"
                    variant={isAdded ? "secondary" : "default"}
                    className={`w-full ${isAdded ? "border border-green-500/30 text-green-700 hover:bg-red-50 hover:text-red-600 hover:border-red-300" : ""}`}
                    disabled={addMutation.isPending || removeMutation.isPending}
                    onClick={() => {
                      if (isAdded) {
                        removeMutation.mutate(existing.id);
                      } else {
                        addMutation.mutate(item);
                      }
                    }}
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

      {filtered.length > 0 && !isSearching && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">{filtered.length} résultat{filtered.length !== 1 ? "s" : ""} affiché{filtered.length !== 1 ? "s" : ""}</p>
        </div>
      )}
    </div>
  );
}