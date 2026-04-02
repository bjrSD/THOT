import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ListMusic, Check, Plus, ChevronDown } from "lucide-react";

/**
 * Petit menu dropdown pour ajouter un contenu à une playlist.
 * Utilisable depuis la bibliothèque, le feed, ou n'importe où.
 */
export default function AddToPlaylistMenu({ contentId, className = "" }) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists"],
    queryFn: () => base44.entities.Playlist.list("-created_date", 50),
    enabled: open,
  });

  const updatePlaylist = useMutation({
    mutationFn: ({ id, content_ids }) => base44.entities.Playlist.update(id, { content_ids }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
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
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors px-2 py-1 rounded-lg hover:bg-secondary"
        title="Ajouter à une playlist"
      >
        <ListMusic className="w-3.5 h-3.5" />
        <ChevronDown className="w-3 h-3" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden py-1">
            <p className="text-xs font-medium text-muted-foreground px-3 py-2 border-b border-border">Ajouter à une playlist</p>
            {playlists.length === 0 ? (
              <p className="text-xs text-muted-foreground px-3 py-3 text-center">Aucune playlist</p>
            ) : (
              playlists.map(pl => (
                <button key={pl.id} onClick={() => toggle(pl)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-secondary transition-colors text-left">
                  <span>{pl.emoji || "📚"}</span>
                  <span className="flex-1 truncate">{pl.name}</span>
                  {isInPlaylist(pl) && <Check className="w-3.5 h-3.5 text-accent shrink-0" />}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}