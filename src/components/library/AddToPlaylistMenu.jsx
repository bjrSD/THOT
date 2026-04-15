import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ListMusic, Plus, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AddToPlaylistMenu({ contentId }) {
  const [open, setOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const queryClient = useQueryClient();

  // Position the dropdown based on button position
  const handleToggle = (e) => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 224, // 224 = w-56
      });
    }
    setOpen(prev => !prev);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) &&
          btnRef.current && !btnRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists"],
    queryFn: () => base44.entities.Playlist.list("-updated_date", 100),
    enabled: open,
  });

  const updatePlaylistMutation = useMutation({
    mutationFn: (playlistId) => {
      const playlist = playlists.find(p => p.id === playlistId);
      const ids = [...(playlist.content_ids || [])];
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
      setOpen(false);
    },
  });

  const handleCreatePlaylist = (e) => {
    e.stopPropagation();
    if (!newPlaylistName.trim()) return;
    createPlaylistMutation.mutate();
  };

  const isInPlaylist = (playlistId) => {
    const playlist = playlists.find(p => p.id === playlistId);
    return playlist?.content_ids?.includes(contentId);
  };

  const dropdown = open ? createPortal(
    <div
      ref={menuRef}
      style={{ position: "absolute", top: menuPos.top, left: menuPos.left, zIndex: 9999 }}
      className="w-56 bg-card border border-border rounded-xl shadow-xl p-3 space-y-2"
      onClick={e => e.stopPropagation()}
    >
      {/* Create new */}
      <div className="flex gap-1">
        <Input
          placeholder="Nouvelle playlist"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist(e)}
          className="h-8 text-xs"
          autoFocus
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
      {playlists.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">Aucune playlist</p>
      ) : (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {playlists.map(p => (
            <button
              key={p.id}
              onClick={(e) => { e.stopPropagation(); updatePlaylistMutation.mutate(p.id); }}
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
    </div>,
    document.body
  ) : null;

  return (
    <>
      <Button
        ref={btnRef}
        variant="outline"
        size="icon"
        onClick={handleToggle}
        className="h-7 w-7">
        <ListMusic className="w-3.5 h-3.5" />
      </Button>
      {dropdown}
    </>
  );
}