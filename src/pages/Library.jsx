import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext } from "@hello-pangea/dnd";
import {
  Loader2, BookOpen, Headphones, Play, FileText,
  LayoutGrid, List, ListMusic, Columns, ChevronDown, Check, Plus, Music2
} from "lucide-react";
import GoogleBooksSearch from "@/components/shared/GoogleBooksSearch";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import KanbanColumn from "@/components/library/KanbanColumn";
import ContentCard, { ContentRow } from "@/components/library/ContentCard";
import PlaylistPanel from "@/components/library/PlaylistPanel";

const TYPES = [
  { value: "all", label: "Tous" },
  { value: "book", label: "Livres", icon: BookOpen },
  { value: "podcast", label: "Podcasts", icon: Headphones },
  { value: "video", label: "Vidéos", icon: Play },
  { value: "article", label: "Articles", icon: FileText },
];

const STATUSES_KANBAN = ["to_consume", "in_progress", "paused", "to_review", "completed"];

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Tous les statuts" },
  { value: "saved", label: "Sauvegardé" },
  { value: "want", label: "Envie de découvrir" },
  { value: "in_progress", label: "En cours" },
  { value: "completed", label: "Terminé" },
  { value: "abandoned", label: "Abandonné" },
  { value: "to_consume", label: "À découvrir" },
  { value: "paused", label: "En pause" },
  { value: "to_review", label: "À revoir" },
];

const VIEWS = [
  { id: "grid", icon: LayoutGrid, label: "Grille" },
  { id: "list", icon: List, label: "Liste" },
  { id: "playlists", icon: ListMusic, label: "Playlists" },
  { id: "kanban", icon: Columns, label: "Colonnes" },
];

function PlaylistFilter({ value, onChange, playlists }) {
  const [open, setOpen] = useState(false);
  const current = value === "all" ? null : playlists.find(p => p.id === value);
  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border transition-colors font-medium h-8 ${
          value !== "all"
            ? "bg-accent text-accent-foreground border-accent"
            : "bg-card border-border hover:border-accent/40 text-foreground"
        }`}
      >
        <Music2 className="w-3.5 h-3.5 shrink-0" />
        <span>{current ? `${current.emoji || "🎵"} ${current.name}` : "Mes mix"}</span>
        <ChevronDown className={`w-3 h-3 text-current opacity-60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-52 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden py-1">
            <button
              onClick={() => { onChange("all"); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-secondary transition-colors text-left"
            >
              <span className="flex-1">Tous les contenus</span>
              {value === "all" && <Check className="w-3.5 h-3.5 text-accent" />}
            </button>
            <div className="h-px bg-border mx-2 my-1" />
            {playlists.map(p => (
              <button key={p.id} onClick={() => { onChange(p.id); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-secondary transition-colors text-left"
              >
                <span>{p.emoji || "🎵"}</span>
                <span className="flex-1 truncate">{p.name}</span>
                {value === p.id && <Check className="w-3.5 h-3.5 text-accent shrink-0" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatusFilter({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const current = STATUS_FILTER_OPTIONS.find(s => s.value === value) || STATUS_FILTER_OPTIONS[0];
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-border bg-card hover:border-accent/40 transition-colors font-medium">
        {current.label} <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 mt-1 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden py-1">
            {STATUS_FILTER_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-secondary transition-colors text-left">
                <span className="flex-1">{opt.label}</span>
                {value === opt.value && <Check className="w-3.5 h-3.5 text-accent" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Library() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [playlistFilter, setPlaylistFilter] = useState("all"); // "all" or playlistId
  // Mobile defaults to "list", desktop to "kanban"
  const [view, setView] = useState(() => (typeof window !== "undefined" && window.innerWidth < 768) ? "list" : "kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: contents = [], isLoading } = useQuery({
    queryKey: ["contents"],
    queryFn: () => base44.entities.Content.list("-updated_date", 200),
  });

  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists"],
    queryFn: () => base44.entities.Playlist.list("-updated_date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Content.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contents"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => id ? base44.entities.Content.update(id, data) : createMutation.mutateAsync(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contents"] }),
  });

  const handleSelectBook = (book) => {
    const data = {
      title: book.title,
      author: book.author,
      cover_url: book.cover_url || undefined,
      summary: book.summary || undefined,
      category: book.category || undefined,
      buy_link: book.buy_link || undefined,
      total_pages: book.total_pages ? Number(book.total_pages) : undefined,
      published_year: book.published_date ? book.published_date.slice(0, 4) : undefined,
      status: "to_consume",
      type: "book",
    };
    // remove undefined keys
    Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);
    updateMutation.mutate({ id: null, data }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contents"] }),
    });
  };

  const filtered = contents
    .filter(c => typeFilter === "all" || c.type === typeFilter)
    .filter(c => statusFilter === "all" || c.status === statusFilter)
    .filter(c => {
      if (playlistFilter === "all") return true;
      const playlist = playlists.find(p => p.id === playlistFilter);
      return playlist?.content_ids?.includes(c.id);
    })
    .filter(c => !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.author.toLowerCase().includes(searchQuery.toLowerCase()));

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    const content = contents.find(c => c.id === draggableId);
    if (!content || content.status === newStatus) return;
    const updateData = { status: newStatus };
    if (newStatus === "completed" && !content.completed_date) {
      updateData.completed_date = new Date().toISOString().split("T")[0];
    }
    updateMutation.mutate({ id: draggableId, data: updateData });
  };

  const handleCardClick = (content) => {
    window.location.href = createPageUrl("ContentDetail") + `?id=${content.id}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-5 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="font-heading text-base md:text-3xl font-bold leading-tight">Ma Bibliothèque</h1>
          <p className="text-muted-foreground text-[10px] md:text-sm">{contents.length} contenu{contents.length !== 1 ? "s" : ""}</p>
        </div>
        {/* View switcher */}
        <div className="flex gap-0.5 bg-secondary p-0.5 rounded-xl shrink-0">
          {VIEWS.map(v => {
            const Icon = v.icon;
            return (
              <button key={v.id} onClick={() => setView(v.id)} title={v.label}
                className={`flex items-center justify-center p-2 rounded-lg transition-all ${view === v.id ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters — hidden in playlists view */}
      {view !== "playlists" && (
        <div className="space-y-2">
          {/* Google Books search */}
          <GoogleBooksSearch onSelect={handleSelectBook} />
          
          {/* Type and status filters — horizontal scroll on mobile */}
          <div className="flex gap-1.5 items-center overflow-x-auto pb-1 pt-1" style={{ scrollbarWidth: "none" }}>
            {TYPES.map((t) => (
              <Button key={t.value} variant={typeFilter === t.value ? "default" : "outline"} size="sm"
                onClick={() => setTypeFilter(t.value)} className="shrink-0 text-[10px] h-6 px-2">
                {t.label}
              </Button>
            ))}
            {view !== "kanban" && (
              <div className="shrink-0">
                <StatusFilter value={statusFilter} onChange={setStatusFilter} />
              </div>
            )}
            {/* Playlist filter — pushed to the right */}
            {playlists.length > 0 && (
              <div className="ml-auto">
                <PlaylistFilter value={playlistFilter} onChange={setPlaylistFilter} playlists={playlists} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* GRID VIEW */}
      {view === "grid" && (
        <>
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filtered.map(c => (
                <ContentCard key={c.id} content={c} onClick={() => handleCardClick(c)} />
              ))}
            </div>
          )}
        </>
      )}

      {/* LIST VIEW */}
      {view === "list" && (
        <>
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2">
              {filtered.map(c => (
                <ContentRow key={c.id} content={c} onClick={() => handleCardClick(c)} />
              ))}
            </div>
          )}
        </>
      )}

      {/* PLAYLISTS VIEW */}
      {view === "playlists" && (
        <PlaylistPanel contents={contents} />
      )}

      {/* KANBAN VIEW — desktop only (hidden on mobile, use list instead) */}
      {view === "kanban" && (
        <>
          {/* Desktop kanban */}
          <div className="hidden md:block">
            <DragDropContext onDragEnd={onDragEnd}>
              <p className="text-xs text-muted-foreground mb-2">Glissez-déposez un contenu pour changer son statut</p>
              <div className="grid grid-cols-5 gap-3">
                {STATUSES_KANBAN.map(status => (
                  <KanbanColumn
                    key={status}
                    status={status}
                    contents={filtered.filter(c => c.status === status)}
                    onCardClick={handleCardClick}
                  />
                ))}
              </div>
            </DragDropContext>
          </div>
          {/* Mobile fallback: list */}
          <div className="md:hidden space-y-2">
            {filtered.length === 0 ? <EmptyState /> : filtered.map(c => (
              <ContentRow key={c.id} content={c} onClick={() => handleCardClick(c)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-8 md:py-12 border-2 border-dashed border-border rounded-2xl">
      <div className="text-3xl mb-2">📚</div>
      <p className="font-medium text-sm">Aucun contenu trouvé</p>
      <p className="text-xs text-muted-foreground mt-1">Appuie sur + pour ajouter un contenu</p>
    </div>
  );
}