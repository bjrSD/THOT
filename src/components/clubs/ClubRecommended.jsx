import React, { useState } from "react";
import { Star, Search, Plus, Edit, X, Loader2, BookOpen, Headphones, Play, FileText, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const TYPE_EMOJI = { book: "📖", podcast: "🎧", video: "🎬", article: "📰" };
const TYPE_ICONS = { book: BookOpen, podcast: Headphones, video: Play, article: FileText };

async function searchGoogleBooks(query) {
  if (!query.trim()) return [];
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=6&langRestrict=fr`);
  const data = await res.json();
  return (data.items || []).map(item => ({
    id: item.id,
    title: item.volumeInfo.title || "",
    author: item.volumeInfo.authors?.[0] || "",
    type: "book",
    cover_url: item.volumeInfo.imageLinks?.thumbnail?.replace("http://", "https://") || null,
    summary: item.volumeInfo.description || "",
    total_pages: item.volumeInfo.pageCount || null,
    buy_link: item.volumeInfo.infoLink || "",
    externalId: item.id,
  }));
}

function AddToPlaylistModal({ item, onClose }) {
  const [selectedId, setSelectedId] = useState("");
  const qc = useQueryClient();

  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists"],
    queryFn: () => base44.entities.Playlist.list("-updated_date", 50),
  });

  const { data: existing = [] } = useQuery({
    queryKey: ["contents"],
    queryFn: () => base44.entities.Content.list("-updated_date", 200),
  });

  const addToLibraryMutation = useMutation({
    mutationFn: () => base44.entities.Content.create({
      title: item.title, author: item.author || "", type: item.type || "book",
      status: "to_consume", cover_url: item.cover_url || undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contents"] }); toast.success("Ajouté à ta liste !"); onClose(); },
  });

  const addToPlaylistMutation = useMutation({
    mutationFn: async () => {
      let contentId;
      const found = existing.find(c => c.title === item.title);
      if (found) {
        contentId = found.id;
      } else {
        const created = await base44.entities.Content.create({
          title: item.title, author: item.author || "", type: item.type || "book",
          status: "to_consume", cover_url: item.cover_url || undefined,
        });
        contentId = created.id;
      }
      const playlist = playlists.find(p => p.id === selectedId);
      const currentIds = playlist?.content_ids || [];
      if (!currentIds.includes(contentId)) {
        await base44.entities.Playlist.update(selectedId, { content_ids: [...currentIds, contentId] });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["playlists"] });
      qc.invalidateQueries({ queryKey: ["contents"] });
      toast.success("Ajouté à la playlist !");
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-bold truncate pr-4">Ajouter "{item.title}"</p>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="space-y-2">
          <Button onClick={() => addToLibraryMutation.mutate()} disabled={addToLibraryMutation.isPending} variant="outline" className="w-full gap-2 justify-start">
            <Plus className="w-4 h-4 text-accent" />
            {addToLibraryMutation.isPending ? "Ajout..." : "Ajouter à ma To-Do (bibliothèque)"}
          </Button>
          {playlists.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ajouter à une playlist</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {playlists.map(p => (
                  <button key={p.id} onClick={() => setSelectedId(p.id)}
                    className={`w-full flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all text-sm ${selectedId === p.id ? "border-accent bg-accent/10" : "border-border hover:border-accent/40"}`}>
                    <ListMusic className="w-4 h-4 text-accent shrink-0" />
                    <span className="truncate">{p.emoji || "🎵"} {p.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{p.content_ids?.length || 0}</span>
                  </button>
                ))}
              </div>
              {selectedId && (
                <Button onClick={() => addToPlaylistMutation.mutate()} disabled={addToPlaylistMutation.isPending} className="w-full gap-2">
                  {addToPlaylistMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ListMusic className="w-4 h-4" />}
                  Ajouter à la playlist
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const SUGGESTED_BOOKS = [
  { title: "Atomic Habits", author: "James Clear", type: "book", cover_url: null },
  { title: "Zero to One", author: "Peter Thiel", type: "book", cover_url: null },
  { title: "The Lean Startup", author: "Eric Ries", type: "book", cover_url: null },
  { title: "Thinking Fast and Slow", author: "Daniel Kahneman", type: "book", cover_url: null },
];

export default function ClubRecommended({ club, canEdit }) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [recommended, setRecommended] = useState(
    club.recent_reads?.length > 0
      ? club.recent_reads.map(t => ({ title: t, type: "book", author: "" }))
      : SUGGESTED_BOOKS
  );
  const [addModal, setAddModal] = useState(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const results = await searchGoogleBooks(searchQuery);
    setSearchResults(results);
    setSearching(false);
  };

  const addToRecommended = (item) => {
    if (recommended.find(r => r.title === item.title)) return;
    setRecommended(prev => [...prev, item]);
    setSearchResults([]);
    setSearchQuery("");
    toast.success(`"${item.title}" ajouté aux conseils du club !`);
  };

  const removeFromRecommended = (i) => {
    setRecommended(prev => prev.filter((_, idx) => idx !== i));
  };

  const openDetail = (item) => {
    const data = encodeURIComponent(JSON.stringify({
      title: item.title,
      creator: item.author,
      type: item.type || "book",
      imageUrl: item.cover_url,
      description: item.summary || "",
      externalUrl: item.buy_link || "",
      externalId: item.externalId || item.title,
    }));
    navigate(`/SearchResultDetail?data=${data}`);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" /> Contenus conseillés</h3>
        {canEdit && (
          <button onClick={() => setEditing(!editing)} className="text-xs text-accent hover:underline flex items-center gap-1">
            <Edit className="w-3 h-3" /> {editing ? "Terminer" : "Modifier"}
          </button>
        )}
      </div>

      {editing && canEdit && (
        <div className="mb-3 space-y-2">
          <div className="flex gap-2">
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Rechercher un livre à conseiller..."
              className="h-8 text-xs flex-1" />
            <Button size="sm" onClick={handleSearch} disabled={searching} className="h-8 text-xs gap-1">
              {searching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
            </Button>
          </div>
          {searchResults.length > 0 && (
            <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
              {searchResults.map((r, i) => (
                <div key={i} className="flex items-center gap-2 p-2 hover:bg-secondary/50">
                  {r.cover_url
                    ? <img src={r.cover_url} alt="" className="w-8 h-10 object-cover rounded shrink-0" />
                    : <div className="w-8 h-10 bg-secondary rounded flex items-center justify-center shrink-0">📖</div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{r.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{r.author}</p>
                  </div>
                  <button onClick={() => addToRecommended(r)}
                    className="text-xs text-accent border border-accent/30 px-2 py-0.5 rounded-lg hover:bg-accent/10 shrink-0">
                    + Ajouter
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        {recommended.map((item, i) => (
          <div key={i} className="flex items-center gap-3 py-1.5 border-b border-border last:border-0">
            {item.cover_url
              ? <img src={item.cover_url} alt="" className="w-8 h-10 object-cover rounded shrink-0" />
              : <span className="text-lg shrink-0">{TYPE_EMOJI[item.type] || "📖"}</span>
            }
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openDetail(item)}>
              <p className="text-sm font-medium truncate hover:text-accent transition-colors">{item.title}</p>
              {item.author && <p className="text-xs text-muted-foreground truncate">{item.author}</p>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setAddModal(item)}
                className="text-xs px-2 py-1 rounded-lg border border-border hover:border-accent/40 hover:text-accent transition-colors flex items-center gap-0.5">
                <Plus className="w-3 h-3" /> Ajouter
              </button>
              {editing && canEdit && (
                <button onClick={() => removeFromRecommended(i)} className="text-destructive hover:opacity-70 p-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
        {recommended.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            {canEdit ? "Ajoutez des contenus via le mode modification." : "Aucun contenu conseillé."}
          </p>
        )}
      </div>

      {addModal && <AddToPlaylistModal item={addModal} onClose={() => setAddModal(null)} />}
    </div>
  );
}