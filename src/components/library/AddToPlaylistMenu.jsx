import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ListMusic, Plus, Check, Loader2, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AddToPlaylistMenu({ contentId }) {
  const [open, setOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [creating, setCreating] = useState(false);
  const menuRef = useRef(null);
  const queryClient = useQueryClient();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists"],
    queryFn: () => base44.entities.Playlist.list("-updated_date", 100),
    enabled: open,
  });

  const updatePlaylistMutation = useMutation({
    mutationFn: (playlistId) => {
      const playlist = playlists.find(p => p.id === playlistId);
      const ids = playlist.content_ids || [];
      if (!ids.includes(contentId)) ids.push(contentId);
      return base44.entities.Playlist.update(playlistId, { content_ids: ids });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      setOpen(false);
    },
  });

  const createPlaylistMutation = useMutation({
    mutationFn: () =>
      base44.entities.Playlist.create({
        name: newPlaylistName,
        content_ids: [contentId],
        visibility: "private",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      setNewPlaylistName("");
      setCreating(false);
      setOpen(false);
    },
  });

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    setCreating(true);
    createPlaylistMutation.mutate();
  };

  const isInPlaylist = (playlistId) => {
    const playlist = playlists.find(p => p.id === playlistId);
    return playlist?.content_ids?.includes(contentId);
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(!open)}
        className="h-7 w-7">
        <ListMusic className="w-3.5 h-3.5" />
      </Button>

      {open && (
        <div className="absolute top-full mt-1 right-0 w-56 bg-card border border-border rounded-xl shadow-xl z-50 p-3 space-y-2">
          {/* Create new */}
          <div className="flex gap-1">
            <Input
              placeholder="Nouvelle playlist"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
              className="h-8 text-xs"
            />
            <Button
              size="sm"
              onClick={handleCreatePlaylist}
              disabled={!newPlaylistName.trim() || createPlaylistMutation.isPending}
              className="h-8 px-2">
              {createPlaylistMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            </Button>
          </div>

          {/* Existing playlists */}
          {playlists.length === 0 && !newPlaylistName ? (
            <p className="text-xs text-muted-foreground text-center py-2">Aucune playlist</p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {playlists.map(p => (
                <button
                  key={p.id}
                  onClick={() => updatePlaylistMutation.mutate(p.id)}
                  disabled={updatePlaylistMutation.isPending}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg border transition-all ${
                    isInPlaylist(p.id)
                      ? "bg-accent/10 border-accent text-accent"
                      : "border-border hover:border-accent/40 hover:bg-secondary/50"
                  }`}>
                  {p.emoji && <span>{p.emoji}</span>}
                  <span className="flex-1 truncate">{p.name}</span>
                  {isInPlaylist(p.id) && <Check className="w-3 h-3 shrink-0" />}
                  {updatePlaylistMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}