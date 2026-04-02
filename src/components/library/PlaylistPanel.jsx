import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Lock, Users, Globe, Trash2, Copy, Pencil, X, ChevronRight, Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Headphones, Play, FileText } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const TYPE_ICON = { book: BookOpen, podcast: Headphones, video: Play, article: FileText };

const VISIBILITY_OPTIONS = [
  { id: "private", icon: Lock, label: "Privée" },
  { id: "friends", icon: Users, label: "Amis" },
  { id: "public", icon: Globe, label: "Publique" },
];

function PlaylistForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [emoji, setEmoji] = useState(initial?.emoji || "📚");
  const [visibility, setVisibility] = useState(initial?.visibility || "private");

  return (
    <div className="bg-card border border-accent/30 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <input
          value={emoji}
          onChange={e => setEmoji(e.target.value)}
          className="w-10 text-center text-xl bg-secondary rounded-lg border border-border focus:outline-none"
        />
        <Input
          placeholder="Nom de la playlist"
          value={name}
          onChange={e => setName(e.target.value)}
          className="flex-1 text-sm"
        />
      </div>
      <Input
        placeholder="Description (optionnelle)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        className="text-sm"
      />
      <div className="flex gap-1.5 flex-wrap">
        {VISIBILITY_OPTIONS.map(v => {
          const Icon = v.icon;
          return (
            <button key={v.id} onClick={() => setVisibility(v.id)}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${visibility === v.id ? "bg-accent text-accent-foreground" : "bg-secondary hover:bg-secondary/80"}`}>
              <Icon className="w-3 h-3" /> {v.label}
            </button>
          );
        })}
      </div>
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button size="sm" onClick={() => onSave({ name, description, emoji, visibility })} disabled={!name.trim()}>
          Sauvegarder
        </Button>
      </div>
    </div>
  );
}

export default function PlaylistPanel({ contents = [] }) {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const { data: playlists = [], isLoading } = useQuery({
    queryKey: ["playlists"],
    queryFn: () => base44.entities.Playlist.list("-created_date", 50),
  });

  const createPlaylist = useMutation({
    mutationFn: (data) => base44.entities.Playlist.create({ ...data, content_ids: [] }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["playlists"] }); setShowCreate(false); },
  });

  const updatePlaylist = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Playlist.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["playlists"] }); setEditingId(null); },
  });

  const deletePlaylist = useMutation({
    mutationFn: (id) => base44.entities.Playlist.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
  });

  const duplicatePlaylist = useMutation({
    mutationFn: (pl) => base44.entities.Playlist.create({
      name: `${pl.name} (copie)`,
      description: pl.description,
      emoji: pl.emoji,
      visibility: "private",
      content_ids: pl.content_ids || [],
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
  });

  const removeFromPlaylist = (playlist, contentId) => {
    const newIds = (playlist.content_ids || []).filter(id => id !== contentId);
    updatePlaylist.mutate({ id: playlist.id, data: { content_ids: newIds } });
  };

  const handleCopyLink = (pl) => {
    navigator.clipboard.writeText(`${window.location.origin}/Library?playlist=${pl.id}`);
  };

  const visibilityIcon = (v) => {
    if (v === "public") return <Globe className="w-3 h-3 text-green-500" />;
    if (v === "friends") return <Users className="w-3 h-3 text-blue-500" />;
    return <Lock className="w-3 h-3 text-muted-foreground" />;
  };

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{playlists.length} playlist{playlists.length !== 1 ? "s" : ""}</p>
        <Button size="sm" className="gap-1.5" onClick={() => setShowCreate(true)}>
          <Plus className="w-3.5 h-3.5" /> Nouvelle playlist
        </Button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <PlaylistForm onSave={(d) => createPlaylist.mutate(d)} onCancel={() => setShowCreate(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {playlists.length === 0 && !showCreate && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
          <div className="text-4xl mb-3">🗂️</div>
          <p className="font-medium text-sm">Aucune playlist</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Organisez vos contenus en playlists thématiques</p>
          <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Créer une playlist
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {playlists.map(pl => {
          const plContents = (pl.content_ids || [])
            .map(id => contents.find(c => c.id === id))
            .filter(Boolean);

          return (
            <div key={pl.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              {editingId === pl.id ? (
                <div className="p-4">
                  <PlaylistForm
                    initial={pl}
                    onSave={(d) => updatePlaylist.mutate({ id: pl.id, data: d })}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <>
                  {/* Playlist header */}
                  <div className="flex items-center gap-3 p-4">
                    <button onClick={() => setExpandedId(expandedId === pl.id ? null : pl.id)} className="flex items-center gap-3 flex-1 text-left min-w-0">
                      <span className="text-2xl shrink-0">{pl.emoji || "📚"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-sm truncate">{pl.name}</p>
                          {visibilityIcon(pl.visibility)}
                        </div>
                        {pl.description && <p className="text-xs text-muted-foreground truncate">{pl.description}</p>}
                        <p className="text-xs text-muted-foreground">{plContents.length} contenu{plContents.length !== 1 ? "s" : ""}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${expandedId === pl.id ? "rotate-90" : ""}`} />
                    </button>

                    {/* Actions */}
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => setEditingId(pl.id)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => duplicatePlaylist.mutate(pl)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Dupliquer">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {pl.visibility === "public" && (
                        <button onClick={() => handleCopyLink(pl)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Partager">
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => deletePlaylist.mutate(pl.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded contents */}
                  <AnimatePresence>
                    {expandedId === pl.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border">
                        {plContents.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-6">Aucun contenu dans cette playlist</p>
                        ) : (
                          <div className="divide-y divide-border">
                            {plContents.map(c => {
                              const Icon = TYPE_ICON[c.type] || BookOpen;
                              return (
                                <div key={c.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/30 transition-colors">
                                  <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{c.title}</p>
                                    {c.author && <p className="text-xs text-muted-foreground truncate">{c.author}</p>}
                                  </div>
                                  <button onClick={() => removeFromPlaylist(pl, c.id)} className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors shrink-0">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}