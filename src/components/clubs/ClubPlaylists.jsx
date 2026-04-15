import React, { useState } from "react";
import { ListMusic, Plus, Share2, Lock, Globe, Users, X, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const VISIBILITY_ICONS = { public: Globe, friends: Users, private: Lock };

export default function ClubPlaylists({ club, isMember }) {
  const [showShare, setShowShare] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const qc = useQueryClient();

  // Fetch user's own playlists to share
  const { data: myPlaylists = [] } = useQuery({
    queryKey: ["playlists"],
    queryFn: () => base44.entities.Playlist.list("-updated_date", 50),
    enabled: isMember,
  });

  // Fetch posts that contain playlists shared in this club (using Post entity with tag)
  const { data: sharedPosts = [] } = useQuery({
    queryKey: ["club-playlists", club.id],
    queryFn: () => base44.entities.Post.filter({ content_ref_id: club.id, type: "milestone" }),
    enabled: !!club.id,
  });

  // We use Post entity to "share" a playlist to a club
  const shareMutation = useMutation({
    mutationFn: async () => {
      const playlist = myPlaylists.find(p => p.id === selectedPlaylistId);
      if (!playlist) return;
      await base44.entities.Post.create({
        content: `J'ai partagé ma playlist "${playlist.name}" ${playlist.emoji || "🎵"} dans le club ${club.emoji} ${club.name} !`,
        type: "milestone",
        content_ref_id: club.id,
        content_ref_title: playlist.name,
        is_public: true,
        image_url: playlist.cover_url || undefined,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["club-playlists", club.id] });
      setShowShare(false);
      setSelectedPlaylistId("");
      toast.success("Playlist partagée dans le club ! 🎵");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2"><ListMusic className="w-4 h-4 text-accent" /> Playlists partagées</h3>
        {isMember && !showShare && (
          <Button size="sm" onClick={() => setShowShare(true)} className="gap-1.5 text-xs" variant="outline">
            <Share2 className="w-3.5 h-3.5" /> Partager une playlist
          </Button>
        )}
      </div>

      {/* Share form */}
      {showShare && (
        <div className="bg-card border border-accent/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">Partager une de mes playlists</p>
            <button onClick={() => setShowShare(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          {myPlaylists.length === 0 ? (
            <p className="text-sm text-muted-foreground">Vous n'avez pas encore de playlist. Créez-en une depuis votre bibliothèque !</p>
          ) : (
            <>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {myPlaylists.map(p => {
                  const VisIcon = VISIBILITY_ICONS[p.visibility] || Globe;
                  return (
                    <button key={p.id} onClick={() => setSelectedPlaylistId(p.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selectedPlaylistId === p.id ? "border-accent bg-accent/10" : "border-border hover:border-accent/40"}`}>
                      <span className="text-xl">{p.emoji || "🎵"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.content_ids?.length || 0} contenus</p>
                      </div>
                      <VisIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      {selectedPlaylistId === p.id && <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center shrink-0"><span className="text-white text-[10px]">✓</span></div>}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowShare(false)} className="flex-1">Annuler</Button>
                <Button size="sm" onClick={() => shareMutation.mutate()} disabled={!selectedPlaylistId || shareMutation.isPending} className="flex-1">
                  {shareMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Partager 🎵"}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Shared playlists */}
      {sharedPosts.length === 0 && !showShare ? (
        <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl">
          <div className="text-4xl mb-2">🎵</div>
          <p className="text-sm text-muted-foreground">Aucune playlist partagée dans ce club.</p>
          {isMember && <p className="text-xs text-muted-foreground mt-1">Soyez le premier à partager une playlist !</p>}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {sharedPosts.map((post, i) => (
            <div key={post.id || i} className="bg-card border border-border rounded-xl p-4 hover:shadow-sm hover:border-accent/30 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-xl shrink-0">
                  🎵
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{post.content_ref_title || "Playlist"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Partagé par {post.created_by || "un membre"}</p>
                  {post.created_date && (
                    <p className="text-xs text-muted-foreground">{format(new Date(post.created_date), "d MMM yyyy", { locale: fr })}</p>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{post.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}