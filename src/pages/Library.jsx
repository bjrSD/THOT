import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext } from "@hello-pangea/dnd";
import {
  Loader2, BookOpen, Headphones, Play, FileText,
  LayoutGrid, List, ListMusic, Columns, ChevronDown, Check, Plus
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
  const [view, setView] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: contents = [], isLoading } = useQuery({
    queryKey: ["contents"],
    queryFn: () => base44.entities.Content.list("-updated_date", 200),
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
    const data = { ...book, status: "to_consume", type: "book" };
    if (data.total_pages) data.total_pages = Number(data.total_pages);
    if (!data.total_pages) delete data.total_pages;
    if (!data.buy_link) delete data.buy_link;
    updateMutation.mutate({ id: null, data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["contents"] });
      },
    });
  };

  const filtered = contents
    .filter(c => typeFilter === "all" || c.type === typeFilter)
    .filter(c => statusFilter === "all" || c.status === statusFilter)
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Ma Bibliothèque</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{contents.length} contenu{contents.length !== 1 ? "s" : ""} sauvegardé{contents.length !== 1 ? "s" : ""}</p>
        </div>
        {/* View switcher */}
        <div className="flex gap-1 bg-secondary p-1 rounded-xl self-start">
          {VIEWS.map(v => {
            const Icon = v.icon;
            return (
              <button key={v.id} onClick={() => setView(v.id)} title={v.label}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === v.id ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters — hidden in playlists view */}
      {view !== "playlists" && (
        <div className="space-y-3">
          {/* Google Books search */}
          <div>
            <GoogleBooksSearch onSelect={handleSelectBook} />
          </div>
          
          {/* Type and status filters */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Type filter */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {TYPES.map((t) => (
                <Button key={t.value} variant={typeFilter === t.value ? "default" : "outline"} size="sm"
                  onClick={() => setTypeFilter(t.value)} className="shrink-0 text-xs h-8">
                  {t.icon && <t.icon className="w-3.5 h-3.5 mr-1" />}
                  {t.label}
                </Button>
              ))}
            </div>
            {/* Status filter (not shown in kanban since kanban groups by status) */}
            {view !== "kanban" && (
              <StatusFilter value={statusFilter} onChange={setStatusFilter} />
            )}
            {filtered.length !== contents.length && (
              <span className="text-xs text-muted-foreground">{filtered.length} résultat{filtered.length !== 1 ? "s" : ""}</span>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
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

      {/* KANBAN VIEW */}
      {view === "kanban" && (
        <DragDropContext onDragEnd={onDragEnd}>
          <p className="text-xs text-muted-foreground mb-2">Glissez-déposez un contenu pour changer son statut</p>
          <div className="flex gap-4 overflow-x-auto pb-4 lg:overflow-visible">
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
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
      <div className="text-4xl mb-3">📚</div>
      <p className="font-medium text-sm">Aucun contenu trouvé</p>
      <p className="text-xs text-muted-foreground mt-1">Utilisez le bouton + pour ajouter un livre, podcast ou vidéo</p>
    </div>
  );
}