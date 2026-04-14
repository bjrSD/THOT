import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ListMusic, Check, Plus, Loader2 } from "lucide-react";

export default function AddToPlaylistMenu({ contentId, className = "" }) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const btnRef = useRef(null);
  const qc = useQueryClient();

  // Detect if dropdown should open upward (near bottom of viewport)
  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setOpenUp(rect.bottom > window.innerHeight - 260);
    }
  }, [open]);

  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists"],
    queryFn: () => base44.entities.Playlist.list("-created_date", 50),
    enabled: open,
  });

  const updatePlaylist = useMutation({
    mutationFn: ({ id, content_ids }) => base44.entities.Playlist.update(id, { content_ids }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
  });

  const createPlaylist = useMutation({
    mutationFn: (name) => base44.entities.Playlist.create({ name, content_ids: [contentId] }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["playlists"] });
      setNewName("");
      setCreating(false);
    },
  });

  const isInPlaylist = (pl) => (pl.content_ids || []).includes(contentId);

  const toggle = (pl) => {
    const ids = pl.content_ids || [];
    const newIds = isInPlaylist(pl) ? ids.filter(i => i !== contentId) : [...ids, contentId];
    updatePlaylist.mutate({ id: pl.id, content_ids: newIds });
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={btnRef}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${
          open
            ? "bg-accent text-white"
            : "text-muted-foreground hover:text-accent hover:bg-secondary"
        }`}
        title="Ajouter à une playlist"
      >
        <ListMusic className="w-3.5 h-3.5" />
        <span className="hidden sm:inline text-[10px] font-medium">Playlist</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpen(false); setCreating(false); }} />
          <div
            className={`absolute right-0 w-56 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden py-1 ${
              openUp ? "bottom-full mb-1" : "top-full mt-1"
            }`}
          >
            <p className="text-xs font-semibold text-muted-foreground px-3 py-2 border-b border-border flex items-center gap-1.5">
              <ListMusic className="w-3 h-3" /> Mes playlists
            </p>

            {playlists.length === 0 && !creating && (
              <p className="text-xs text-muted-foreground px-3 py-3 text-center">Aucune playlist</p>
            )}

            <div className="max-h-40 overflow-y-auto">
              {playlists.map(pl => (
                <button
                  key={pl.id}
                  onClick={(e) => { e.stopPropagation(); toggle(pl); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors text-left ${
                    isInPlaylist(pl) ? "bg-accent/10 text-accent" : "hover:bg-secondary"
                  }`}
                >
                  <span>{pl.emoji || "📚"}</span>
                  <span className="flex-1 truncate font-medium">{pl.name}</span>
                  {isInPlaylist(pl)
                    ? <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                    : <Plus className="w-3 h-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100" />
                  }
                </button>
              ))}
            </div>

            {/* Créer nouvelle playlist */}
            <div className="border-t border-border px-2 pt-1 pb-2">
              {creating ? (
                <div className="flex gap-1 mt-1" onClick={e => e.stopPropagation()}>
                  <input
                    autoFocus
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && newName.trim()) createPlaylist.mutate(newName.trim()); }}
                    placeholder="Nom de la playlist…"
                    className="flex-1 text-xs px-2 py-1.5 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); if (newName.trim()) createPlaylist.mutate(newName.trim()); }}
                    disabled={!newName.trim() || createPlaylist.isPending}
                    className="px-2 py-1 bg-accent text-white rounded-md text-xs disabled:opacity-50 shrink-0"
                  >
                    {createPlaylist.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "OK"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); setCreating(true); }}
                  className="w-full flex items-center gap-1.5 text-xs text-accent hover:bg-accent/10 px-2 py-1.5 rounded-lg transition-colors mt-1 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> Nouvelle playlist
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}