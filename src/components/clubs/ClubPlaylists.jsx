import React, { useState, useEffect } from "react";
import { ListMusic, Share2, Lock, Globe, Users, X, Loader2, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const VISIBILITY_ICONS = { public: Globe, friends: Users, private: Lock };

const TYPE_ICONS = { book: "📖", podcast: "🎧", video: "🎬", article: "📰" };

function PlaylistDetailModal({ post, myPlaylists, onClose }) {
  const [expanding, setExpanding] = useState(false);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState(new Set());
  const qc = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (item) => base44.entities.Content.create({
      title: item.title, type: item.type || "book",
      author: item.author || "", status: "to_consume",
      cover_url: item.cover_url || undefined,
    }),
    onSuccess: (_, item) => {
      setAddedIds(prev => new Set([...prev, item.title]));
      qc.invalidateQueries({ queryKey: ["contents"] });
      toast.success(`"${item.title}" ajouté à ta bibliothèque !`);
    },
  });

  // Try to fetch the actual playlist contents by name
  React.useEffect(() => {
    setLoading(true);
    base44.entities.Playlist.filter({ name: post.content_ref_title }).then(async playlists => {
      const playlist = playlists[0];
      if (playlist?.content_ids?.length) {
        const all = await base44.entities.Content.list("-updated_date", 200);
        const items = all.filter(c => playlist.content_ids.includes(c.id));
        setContents(items);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [post.content_ref_title]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎵</span>
            <div>
              <p className="font-bold">{post.content_ref_title || "Playlist"}</p>
              <p className="text-xs text-muted-foreground">Partagée par {post.created_by || "un membre"}</p>
            </div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-accent" /></div>
          ) : contents.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">Aucun contenu trouvé dans cette playlist.</p>
          ) : (
            contents.map((item, i) => (
              <div key={item.id || i} className="flex items-center gap-3 p-3 bg-secondary/40 rounded-xl">
                <span className="text-xl shrink-0">{TYPE_ICONS[item.type] || "📄"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.title}</p>
                  {item.author && <p className="text-xs text-muted-foreground truncate">{item.author}</p>}
                </div>
                <button
                  onClick={() => addMutation.mutate(item)}
                  disabled={addedIds.has(item.title) || addMutation.isPending}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors shrink-0 ${addedIds.has(item.title) ? "bg-green-500/10 border-green-500/20 text-green-600" : "border-border hover:border-accent/40 hover:text-accent"}`}>
                  {addedIds.has(item.title) ? "✓ Ajouté" : <><Plus className="w-3 h-3 inline mr-0.5" /> Ajouter</>}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClubPlaylists({ club, isMember }) {
  const [showShare, setShowShare] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const [expandedPost, setExpandedPost] = useState(null);
  const qc = useQueryClient();

  const { data: myPlaylists = [] } = useQuery({
    queryKey: ["playlists"],
    queryFn: () => base44.entities.Playlist.list("-updated_date", 50),
    enabled: isMember,
  });

  const { data: sharedPosts = [] } = useQuery({
    queryKey: ["club-playlists", club.id],
    queryFn: () => base44.entities.Post.filter({ content_ref_id: club.id, type: "milestone" }),
    enabled: !!club.id,
  });

  const shareMutation = useMutation({
    mutationFn: async () => {
      const playlist = myPlaylists.find(p => p.id === selectedPlaylistId);
      if (!playlist) return;
      await base44.entities.Post.create({
        content: `J'ai partagé ma playlist "${playlist.name}" ${playlist.emoji || "🎵"} dans le club ${club.emoji || ""} ${club.name} !`,
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

      {/* Shared playlists grid */}
      {sharedPosts.length === 0 && !showShare ? (
        <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl">
          <div className="text-4xl mb-2">🎵</div>
          <p className="text-sm text-muted-foreground">Aucune playlist partagée dans ce club.</p>
          {isMember && <p className="text-xs text-muted-foreground mt-1">Soyez le premier à partager une playlist !</p>}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {sharedPosts.map((post, i) => (
            <button key={post.id || i} onClick={() => setExpandedPost(post)}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-accent/30 transition-all text-left w-full">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-xl shrink-0">🎵</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{post.content_ref_title || "Playlist"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">par {post.created_by || "un membre"}</p>
                  {post.created_date && (
                    <p className="text-xs text-muted-foreground">{format(new Date(post.created_date), "d MMM yyyy", { locale: fr })}</p>
                  )}
                </div>
              </div>
              <p className="text-xs text-accent mt-2 font-medium">👆 Cliquer pour voir les contenus</p>
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {expandedPost && (
        <PlaylistDetailModal
          post={expandedPost}
          myPlaylists={myPlaylists}
          onClose={() => setExpandedPost(null)}
        />
      )}
    </div>
  );
}