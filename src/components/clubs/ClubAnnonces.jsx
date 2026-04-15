import React, { useState, useRef } from "react";
import { Send, Image, Heart, Edit2, Trash2, X, Loader2, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const EMOJI_REACTIONS = ["❤️", "🔥", "👏", "🤯", "😂", "💡", "👍", "🚀"];

export default function ClubAnnonces({ clubId, clubName, canPost, myEmail }) {
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [showReactions, setShowReactions] = useState(null);
  const [localLikes, setLocalLikes] = useState({});
  const [localReactions, setLocalReactions] = useState({});
  const fileInputRef = useRef();
  const qc = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["club-posts", clubId],
    queryFn: () => base44.entities.Post.filter({ content_ref_id: clubId, type: "update" }),
    enabled: !!clubId,
  });

  const createMutation = useMutation({
    mutationFn: () => base44.entities.Post.create({
      content: text.trim(),
      type: "update",
      content_ref_id: clubId,
      content_ref_title: clubName,
      is_public: true,
      image_url: imageUrl || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["club-posts", clubId] });
      setText(""); setImageUrl("");
      toast.success("Annonce publiée !");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, content }) => base44.entities.Post.update(id, { content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["club-posts", clubId] });
      setEditingId(null);
      toast.success("Annonce modifiée !");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Post.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["club-posts", clubId] });
      toast.success("Annonce supprimée.");
    },
  });

  const likeMutation = useMutation({
    mutationFn: ({ id, currentLikes }) => base44.entities.Post.update(id, { likes_count: currentLikes + 1 }),
    onSuccess: (_, { id }) => { qc.invalidateQueries({ queryKey: ["club-posts", clubId] }); },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setImageUrl(file_url);
    setUploadingImg(false);
  };

  const handleLike = (post) => {
    const key = post.id;
    if (localLikes[key]) return;
    setLocalLikes(prev => ({ ...prev, [key]: true }));
    likeMutation.mutate({ id: post.id, currentLikes: post.likes_count || 0 });
  };

  const handleReact = (postId, emoji) => {
    setLocalReactions(prev => {
      const cur = prev[postId] || {};
      return { ...prev, [postId]: { ...cur, [emoji]: (cur[emoji] || 0) + 1 } };
    });
    setShowReactions(null);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">📢 Annonces du club</h3>

      {canPost && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={3}
            placeholder="Partagez une annonce, info ou contenu avec les membres..."
            className="w-full px-3 py-2 rounded-xl border border-input bg-transparent text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
          />
          {imageUrl && (
            <div className="relative w-full h-40 rounded-xl overflow-hidden">
              <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
              <button onClick={() => setImageUrl("")} className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors border border-border rounded-lg px-3 py-1.5">
              {uploadingImg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Image className="w-3.5 h-3.5" />}
              Photo
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <Button size="sm" onClick={() => createMutation.mutate()} disabled={!text.trim() || createMutation.isPending} className="ml-auto gap-1.5">
              {createMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Publier
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-accent" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl">
          <div className="text-3xl mb-2">📢</div>
          <p className="text-sm text-muted-foreground">Aucune annonce pour l'instant.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const isOwn = post.created_by === myEmail;
            const hasLiked = localLikes[post.id];
            const reactions = localReactions[post.id] || {};

            return (
              <div key={post.id} className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-xs">
                      {(post.created_by || "A")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{post.created_by || "Admin"}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {post.created_date ? format(new Date(post.created_date), "d MMM yyyy 'à' HH:mm", { locale: fr }) : ""}
                      </p>
                    </div>
                  </div>
                  {(isOwn || canPost) && (
                    <div className="flex items-center gap-1">
                      {isOwn && (
                        <button onClick={() => { setEditingId(post.id); setEditText(post.content); }}
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                          <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      )}
                      <button onClick={() => { if (confirm("Supprimer cette annonce ?")) deleteMutation.mutate(post.id); }}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  )}
                </div>

                {editingId === post.id ? (
                  <div className="space-y-2">
                    <textarea value={editText} onChange={e => setEditText(e.target.value)}
                      rows={3} className="w-full px-3 py-2 rounded-xl border border-input bg-transparent text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingId(null)} className="flex-1">Annuler</Button>
                      <Button size="sm" onClick={() => updateMutation.mutate({ id: post.id, content: editText })}
                        disabled={updateMutation.isPending} className="flex-1">
                        {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Check className="w-3.5 h-3.5 mr-1" /> Sauvegarder</>}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-line">{post.content}</p>
                )}

                {post.image_url && (
                  <div className="mt-3 rounded-xl overflow-hidden max-h-64">
                    <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                {Object.keys(reactions).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {Object.entries(reactions).map(([emoji, count]) => (
                      <button key={emoji} onClick={() => handleReact(post.id, emoji)}
                        className="inline-flex items-center gap-1 text-xs bg-secondary border border-border rounded-full px-2 py-0.5 hover:border-accent/40 transition-colors">
                        {emoji} <span className="font-semibold">{count}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 mt-3 pt-2 border-t border-border">
                  <button onClick={() => handleLike(post)}
                    className={`flex items-center gap-1.5 text-xs transition-colors ${hasLiked ? "text-red-500" : "text-muted-foreground hover:text-red-400"}`}>
                    <Heart className={`w-3.5 h-3.5 ${hasLiked ? "fill-red-500" : ""}`} />
                    {(post.likes_count || 0) + (hasLiked ? 1 : 0)}
                  </button>
                  <div className="relative">
                    <button onClick={() => setShowReactions(showReactions === post.id ? null : post.id)}
                      className="text-xs text-muted-foreground hover:text-accent transition-colors">
                      😊 Réagir
                    </button>
                    {showReactions === post.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowReactions(null)} />
                        <div className="absolute bottom-full left-0 mb-2 bg-card border border-border rounded-xl shadow-xl z-20 p-2 flex gap-1">
                          {EMOJI_REACTIONS.map(e => (
                            <button key={e} onClick={() => handleReact(post.id, e)}
                              className="text-lg hover:scale-125 transition-transform">
                              {e}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}