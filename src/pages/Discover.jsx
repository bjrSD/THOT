import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BookOpen, Headphones, Play, FileText, Loader2, Search, X,
  ExternalLink, RefreshCw, LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchByType, searchAll, mapToContent } from "@/lib/contentSearchService";
import AddButton from "@/components/discover/AddButton";

// ─── Config ───────────────────────────────────────────────────────────────

const TABS = [
  { id: "all",     label: "Tous",     icon: LayoutGrid,  color: "text-muted-foreground" },
  { id: "book",    label: "Livres",   icon: BookOpen,    color: "text-green-500" },
  { id: "video",   label: "Vidéos",   icon: Play,        color: "text-red-500" },
  { id: "podcast", label: "Podcasts", icon: Headphones,  color: "text-purple-500" },
  { id: "article", label: "Articles", icon: FileText,    color: "text-blue-500" },
];

const PLACEHOLDERS = {
  all:     "Rechercher un contenu…",
  book:    "Rechercher un livre…",
  video:   "Rechercher une vidéo…",
  podcast: "Rechercher un podcast…",
  article: "Rechercher un article…",
};

const TYPE_LABEL = { book: "Livre", video: "Vidéo", podcast: "Podcast", article: "Article" };
const TYPE_COLOR = { book: "text-white bg-green-600", video: "text-white bg-red-600", podcast: "text-white bg-purple-600", article: "text-white bg-blue-600" };

// Discovery seed queries per type
const SEEDS = {
  book:    ["développement personnel", "intelligence artificielle", "philosophie stoïcisme", "biographie", "science économie", "histoire", "leadership", "psychologie"],
  video:   ["documentaire science", "conférence TED", "cours philosophie", "tutoriel programmation", "podcast vidéo", "histoire monde", "vulgarisation", "entrepreneuriat"],
  podcast: ["histoire monde", "science cerveau", "business startup", "psychologie", "culture générale", "développement personnel", "technologie", "économie"],
  article: ["intelligence artificielle", "technologie société", "science découverte", "économie monde", "philosophie éthique", "histoire récente", "santé recherche", "innovation"],
};

// ─── Components ───────────────────────────────────────────────────────────

function TypeBadge({ type }) {
  const Icon = { book: BookOpen, video: Play, podcast: Headphones, article: FileText }[type] || FileText;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${TYPE_COLOR[type] || 'bg-secondary text-muted-foreground'}`}>
      <Icon style={{ width: 10, height: 10 }} /> {TYPE_LABEL[type] || type}
    </span>
  );
}

function ContentCard({ item, isAdded, onAdd, onOpen, adding, removing, onRemove }) {
  const isVideo = item.type === 'video';
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border hover:shadow-md hover:border-accent/30 transition-all flex flex-col overflow-hidden">
      {/* Thumbnail / Cover */}
      <div className={`relative overflow-hidden bg-secondary shrink-0 ${isVideo ? 'aspect-video' : 'h-36'}`}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <TypeBadge type={item.type} />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <TypeBadge type={item.type} />
        </div>

      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <p className="font-semibold text-sm line-clamp-2 leading-tight mb-0.5">{item.title}</p>
        <p className="text-xs text-muted-foreground truncate mb-1">{item.creator || item.sourceName}</p>
        {item.publishedAt && (
          <p className="text-xs text-muted-foreground mb-2">{new Date(item.publishedAt).getFullYear()}</p>
        )}
        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 flex-1 leading-relaxed">{item.description}</p>
        )}

        <div className="flex items-center justify-between mt-2">
          <button onClick={onOpen}
            className="text-xs text-accent hover:underline flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> Voir la fiche descriptif
          </button>
          <AddButton item={item} isAdded={isAdded} adding={adding} removing={removing} onAdd={onAdd} onRemove={onRemove} />
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
      <div className="h-36 bg-secondary" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-secondary rounded w-3/4" />
        <div className="h-2.5 bg-secondary rounded w-1/2" />
        <div className="h-2.5 bg-secondary rounded w-full" />
        <div className="h-7 bg-secondary rounded mt-3" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────

export default function Discover() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState("book");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [seedIdx, setSeedIdx] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);
  const abortRef = useRef(null);

  // Debounce search query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(t);
  }, [query]);

  // Reset on tab or query change
  useEffect(() => {
    setItems([]);
    setPage(0);
    setSeedIdx(0);
    setHasMore(true);
  }, [activeTab, debouncedQuery]);

  const { data: existingContents = [] } = useQuery({
    queryKey: ["contents"],
    queryFn: () => base44.entities.Content.list("-updated_date", 200),
  });

  const addMutation = useMutation({
    mutationFn: (item) => base44.entities.Content.create(mapToContent(item)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contents"] }),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => base44.entities.Content.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contents"] }),
  });

  // Find existing content by externalId or title match
  const findExisting = (item) => {
    return existingContents.find(c => {
      try {
        const meta = JSON.parse(c.personal_note || '{}');
        if (meta.externalId && meta.externalId === item.externalId) return true;
      } catch {}
      return c.title === item.title && c.type === item.type;
    });
  };

  const loadItems = useCallback(async (isLoadMore = false) => {
    const token = {};
    abortRef.current = token;

    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      let results = [];
      const q = debouncedQuery.trim();

      if (q) {
        // Search mode
        if (activeTab === 'all') {
          results = await searchAll(q, 20);
        } else {
          const offset = isLoadMore ? (page + 1) * 15 : 0;
          results = await searchByType(activeTab, q, 15);
          if (results.length < 5) setHasMore(false);
        }
      } else {
        // Discovery mode — cycle through seeds
        const seeds = SEEDS[activeTab] || SEEDS.book;
        const idx = isLoadMore ? seedIdx : 0;
        const seed = seeds[idx % seeds.length];
        const nextSeed = seeds[(idx + 1) % seeds.length];
        // Fetch 2 seeds for richer discovery
        const [r1, r2] = await Promise.allSettled([
          searchByType(activeTab === 'all' ? 'book' : activeTab, seed, 12),
          searchByType(activeTab === 'all' ? 'video' : activeTab, nextSeed, 8),
        ]);
        const batch1 = r1.status === 'fulfilled' ? r1.value : [];
        const batch2 = r2.status === 'fulfilled' ? r2.value : [];
        results = [...batch1, ...batch2];
        if (isLoadMore) setSeedIdx(idx + 2);
      }

      if (abortRef.current !== token) return;

      setItems(prev => {
        if (!isLoadMore) return results;
        const existingIds = new Set(prev.map(i => i.externalId || i.title));
        const fresh = results.filter(i => !existingIds.has(i.externalId || i.title));
        return [...prev, ...fresh];
      });
      if (isLoadMore) setPage(p => p + 1);
    } catch (e) {
      console.error('[Discover] load error:', e);
    } finally {
      if (abortRef.current === token) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [activeTab, debouncedQuery, page, seedIdx]);

  // Initial load
  useEffect(() => {
    loadItems(false);
  }, [activeTab, debouncedQuery]);

  // Infinite scroll
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loading && !loadingMore && hasMore) {
        loadItems(true);
      }
    }, { threshold: 0.1 });
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loading, loadingMore, hasMore, loadItems]);

  const handleOpen = (item) => {
    const existing = findExisting(item);
    if (existing) {
      // Already in library → go to ContentDetail
      navigate(`/ContentDetail?id=${existing.id}`);
    } else {
      // Not in library → go to SearchResultDetail
      const itemData = encodeURIComponent(JSON.stringify(item));
      navigate(`/SearchResultDetail?data=${itemData}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Découvrir</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Explorez livres, vidéos, podcasts et articles</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setQuery(""); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all shrink-0 ${activeTab === t.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:border-accent/40 hover:text-foreground'}`}>
              <Icon className={activeTab === t.id ? '' : t.color} style={{ width: 14, height: 14 }} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={query} onChange={e => setQuery(e.target.value)}
          placeholder={PLACEHOLDERS[activeTab]}
          className="pl-10 pr-10 h-11 text-base" />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Results count */}
      {items.length > 0 && !loading && (
        <p className="text-xs text-muted-foreground">
          {debouncedQuery ? `${items.length} résultat${items.length > 1 ? 's' : ''} pour "${debouncedQuery}"` : `${items.length} contenus chargés`}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : items.length === 0 && !loading ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Aucun résultat. Essayez un autre mot-clé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item, i) => {
            const existing = findExisting(item);
            const itemId = item.externalId || (item.title + item.type);
            return (
              <ContentCard key={itemId + i}
                item={item}
                isAdded={!!existing}
                adding={addMutation.isPending && addMutation.variables?.title === item.title}
                removing={removeMutation.isPending && removeMutation.variables === existing?.id}
                onOpen={() => handleOpen(item)}
                onAdd={() => addMutation.mutate(item)}
                onRemove={() => existing && removeMutation.mutate(existing.id)}
              />
            );
          })}
        </div>
      )}

      {/* Infinite scroll loader */}
      <div ref={loaderRef} className="flex flex-col items-center py-6 gap-3">
        {loadingMore && (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
            <p className="text-xs text-muted-foreground">Chargement…</p>
          </>
        )}
        {!loadingMore && items.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => loadItems(true)} className="gap-2 text-xs">
            <RefreshCw className="w-3.5 h-3.5" /> Charger plus
          </Button>
        )}
      </div>
    </div>
  );
}