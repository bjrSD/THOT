import React, { useState, useRef, useEffect } from "react";
import { Plus, Check, Loader2, ListMusic, X, BookOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mapToContent } from "@/lib/contentSearchService";
import { toast } from "sonner";

export default function AddButton({ item, isAdded, adding, onAdd, onRemove, removing }) {
  const [open, setOpen] = useState(false);
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);
  const [newName, setNewName] = useState("");
  const ref = useRef(null);
  const qc = useQueryClient();

  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists"],
    queryFn: () => base44.entities.Playlist.list("-updated_date", 50),
    enabled: open,
  });

  const { data: existingContents = [] } = useQuery({
    queryKey: ["contents"],
    queryFn: () => base44.entities.Content.list("-updated_date", 200),
  });

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const addToLibraryMutation = useMutation({
    mutationFn: () => base44.entities.Content.create(mapToContent(item)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contents"] });
      toast.success("Ajouté à la bibliothèque !");
      setOpen(false);
    },
  });

  const addToPlaylistMutation = useMutation({
    mutationFn: async (playlistId) => {
      // Ensure content exists in library
      let contentId;
      const found = existingContents.find(c => c.title === item.title && c.type === item.type);
      if (found) {
        contentId = found.id;
      } else {
        const created = await base44.entities.Content.create(mapToContent(item));
        contentId = created.id;
        await qc.invalidateQueries({ queryKey: ["contents"] });
      }
      const playlist = playlists.find(p => p.id === playlistId);
      const ids = playlist?.content_ids || [];
      if (!ids.includes(contentId)) {
        await base44.entities.Playlist.update(playlistId, { content_ids: [...ids, contentId] });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["playlists"] });
      qc.invalidateQueries({ queryKey: ["contents"] });
      toast.success("Ajouté à la playlist !");
      setOpen(false);
    },
  });

  const createPlaylistMutation = useMutation({
    mutationFn: async () => {
      if (!newName.trim()) return;
      const playlist = await base44.entities.Playlist.create({ name: newName.trim(), visibility: "private" });
      // Add content to new playlist
      let contentId;
      const found = existingContents.find(c => c.title === item.title && c.type === item.type);
      if (found) {
        contentId = found.id;
      } else {
        const created = await base44.entities.Content.create(mapToContent(item));
        contentId = created.id;
      }
      await base44.entities.Playlist.update(playlist.id, { content_ids: [contentId] });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["playlists"] });
      qc.invalidateQueries({ queryKey: ["contents"] });
      toast.success("Playlist créée et contenu ajouté !");
      setNewName("");
      setShowNewPlaylist(false);
      setOpen(false);
    },
  });

  const isBusy = adding || removing || addToLibraryMutation.isPending || addToPlaylistMutation.isPending || createPlaylistMutation.isPending;

  // Compact icon-only button
  if (isAdded) {
    return (
      <button
        onClick={onRemove}
        disabled={removing}
        className="flex items-center justify-center w-8 h-8 rounded-full transition-all shrink-0"
        style={{
          background: "linear-gradient(135deg, #10b981, #059669)",
          boxShadow: "0 0 8px rgba(16,185,129,0.5), 0 2px 6px rgba(0,0,0,0.2)"
        }}
        title="Ajouté — cliquer pour retirer"
      >
        {removing ? (
          <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
        ) : (
          <Check className="w-3.5 h-3.5 text-white" />
        )}
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={isBusy}
        className="flex items-center justify-center w-8 h-8 rounded-full transition-all shrink-0 hover:scale-110 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)",
          boxShadow: "0 0 12px rgba(59,130,246,0.6), 0 0 24px rgba(59,130,246,0.2), 0 2px 8px rgba(0,0,0,0.3)"
        }}
        title="Ajouter"
      >
        {isBusy ? (
          <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
        ) : (
          <Plus className="w-3.5 h-3.5 text-white" />
        )}
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-56 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="p-2 space-y-0.5">
            {/* Add to library */}
            <button
              onClick={() => { onAdd(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors text-left text-sm font-medium"
            >
              <BookOpen className="w-4 h-4 text-accent shrink-0" />
              <span>Ajouter à ma bibliothèque</span>
            </button>

            {/* Divider */}
            {playlists.length > 0 && (
              <>
                <div className="px-3 pt-1 pb-0.5">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Ajouter à une playlist</p>
                </div>
                {playlists.slice(0, 5).map(p => (
                  <button key={p.id}
                    onClick={() => addToPlaylistMutation.mutate(p.id)}
                    disabled={addToPlaylistMutation.isPending}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-secondary transition-colors text-left text-sm"
                  >
                    <ListMusic className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span className="truncate">{p.emoji || "🎵"} {p.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground shrink-0">{p.content_ids?.length || 0}</span>
                  </button>
                ))}
              </>
            )}

            {/* Create new playlist */}
            <div className="px-2 pt-1">
              {!showNewPlaylist ? (
                <button
                  onClick={() => setShowNewPlaylist(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-border hover:border-accent/50 hover:bg-accent/5 transition-colors text-xs text-muted-foreground font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> Nouvelle playlist
                </button>
              ) : (
                <div className="flex gap-1.5">
                  <input
                    autoFocus
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") createPlaylistMutation.mutate(); if (e.key === "Escape") setShowNewPlaylist(false); }}
                    placeholder="Nom de la playlist…"
                    className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-input bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <button onClick={() => createPlaylistMutation.mutate()} disabled={!newName.trim() || createPlaylistMutation.isPending}
                    className="px-2 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/90 disabled:opacity-50">
                    {createPlaylistMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "OK"}
                  </button>
                  <button onClick={() => setShowNewPlaylist(false)} className="px-2 py-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}