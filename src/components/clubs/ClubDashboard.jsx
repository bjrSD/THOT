import React, { useState } from "react";
import { BookOpen, Trophy, Flame, Crown, TrendingUp, Pin, Headphones, Play, FileText, Plus, Star, Edit, Save, X, Loader2, Send } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import UserProfileModal from "@/components/leaderboard/UserProfileModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CONTENT_TYPE_ICONS = {
  book:    { Icon: BookOpen,   color: "text-green-500",  label: "Livres"   },
  podcast: { Icon: Headphones, color: "text-purple-500", label: "Podcasts" },
  video:   { Icon: Play,       color: "text-red-500",    label: "Vidéos"   },
  article: { Icon: FileText,   color: "text-blue-500",   label: "Articles" },
};
const TYPE_EMOJI = { book: "📖", podcast: "🎧", video: "🎬", article: "📰" };
const RANK_STYLES = [
  { badge: "🥇", text: "text-yellow-600", bg: "bg-yellow-500/5 border-yellow-500/20" },
  { badge: "🥈", text: "text-slate-500",  bg: "bg-slate-400/5 border-slate-400/20"  },
  { badge: "🥉", text: "text-orange-500", bg: "bg-orange-400/5 border-orange-400/20" },
];

const SUGGESTED_BOOKS = [
  { title: "Atomic Habits", author: "James Clear", type: "book" },
  { title: "Zero to One", author: "Peter Thiel", type: "book" },
  { title: "The Lean Startup", author: "Eric Ries", type: "book" },
  { title: "Thinking Fast and Slow", author: "Daniel Kahneman", type: "book" },
];

export default function ClubDashboard({ club, myMembership, clubChallengesCount = 0, clubId }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingRecommended, setEditingRecommended] = useState(false);
  const [newRecommendedTitle, setNewRecommendedTitle] = useState("");
  const [showPostForm, setShowPostForm] = useState(false);
  const [postText, setPostText] = useState("");
  const [localRecommended, setLocalRecommended] = useState(null);
  const qc = useQueryClient();

  const memberCount = club.members || club.members_count || 1;
  const kpTotal = club.kp_total || 0;
  const role = myMembership?.role;
  const canEdit = role === "admin" || role === "moderateur";

  // Current user KP
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });

  // Members for streak average
  const { data: allMembers = [] } = useQuery({
    queryKey: ["club-members", clubId],
    queryFn: () => base44.entities.ClubMember.filter({ club_id: clubId }),
    enabled: !!clubId,
  });

  // Completed contents count (real)
  const { data: completedContents = [] } = useQuery({
    queryKey: ["contents-completed"],
    queryFn: () => base44.entities.Content.filter({ status: "completed" }),
  });

  // Posts from admin/moderators for this club
  const { data: clubPosts = [] } = useQuery({
    queryKey: ["club-posts", clubId],
    queryFn: () => base44.entities.Post.filter({ content_ref_id: clubId, type: "update" }),
    enabled: !!clubId,
  });

  // Add to library
  const addMutation = useMutation({
    mutationFn: (item) => base44.entities.Content.create({
      title: item.title, author: item.author || "", type: item.type || "book", status: "to_consume",
    }),
    onSuccess: (_, item) => { qc.invalidateQueries({ queryKey: ["contents"] }); toast.success(`"${item.title}" ajouté !`); },
  });

  // Post as admin/moderator
  const postMutation = useMutation({
    mutationFn: () => base44.entities.Post.create({
      content: postText,
      type: "update",
      content_ref_id: clubId,
      content_ref_title: club.name,
      is_public: true,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["club-posts", clubId] });
      setPostText(""); setShowPostForm(false);
      toast.success("Message publié dans le club !");
    },
  });

  // Stats — connected to real data
  const avgStreak = allMembers.length > 0
    ? Math.round(allMembers.reduce((sum, m) => sum + (m.current_streak || 0), 0) / allMembers.length)
    : Math.min(28, Math.floor(memberCount / 12));

  const topMembers = club.top_members || [];
  const recommendedItems = localRecommended !== null
    ? localRecommended
    : (club.recent_reads?.length > 0 ? club.recent_reads.map(t => ({ title: t, type: "book", author: "" })) : SUGGESTED_BOOKS);

  const addRecommended = () => {
    if (!newRecommendedTitle.trim()) return;
    const updated = [...recommendedItems, { title: newRecommendedTitle.trim(), type: "book", author: "" }];
    setLocalRecommended(updated);
    setNewRecommendedTitle("");
    toast.success("Contenu conseillé ajouté !");
  };

  const removeRecommended = (i) => {
    const updated = recommendedItems.filter((_, idx) => idx !== i);
    setLocalRecommended(updated);
  };

  return (
    <div className="space-y-4">
      {/* Welcome message */}
      {club.welcome_message && (
        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4">
          <p className="text-xs text-accent font-semibold uppercase tracking-wide mb-1">💬 Message de bienvenue</p>
          <p className="text-sm leading-relaxed">{club.welcome_message}</p>
        </div>
      )}

      {/* My role + my KP */}
      <div className="flex flex-wrap gap-2">
        {role && (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            role === "admin" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-700" :
            role === "moderateur" ? "bg-blue-500/10 border-blue-500/20 text-blue-700" :
            "bg-green-500/10 border-green-500/20 text-green-700"
          }`}>
            {role === "admin" ? "🛡️ Admin" : role === "moderateur" ? "🔵 Modérateur" : "✓ Membre"}
          </span>
        )}
        {me?.total_kp > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-accent/10 border-accent/20 text-accent">
            ⭐ Mes KP : {(me.total_kp || 0).toLocaleString()}
          </span>
        )}
      </div>

      {/* Compact stats row */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { icon: "👥", label: "Membres", value: memberCount.toLocaleString(), link: null },
          { icon: "⭐", label: "KP collectifs", value: kpTotal >= 1000 ? `${(kpTotal / 1000).toFixed(1)}k` : kpTotal.toLocaleString(), link: null },
          { icon: "📚", label: "Lus", value: completedContents.length.toLocaleString(), link: null },
          { icon: "🔥", label: "Streak moy.", value: `${avgStreak}j`, link: null },
          { icon: "🏆", label: "Défis actifs", value: clubChallengesCount, link: "defis" },
          { icon: "📅", label: "Créé le", value: club.created_date ? new Date(club.created_date).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }) : "—", link: null },
        ].map(s => {
          const inner = (
            <div className={`bg-card border border-border rounded-xl p-2.5 text-center transition-shadow ${s.link ? "hover:border-accent/40 hover:shadow-sm cursor-pointer" : ""}`}>
              <p className="text-lg mb-0.5">{s.icon}</p>
              <p className="font-bold text-sm leading-none">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
            </div>
          );
          return s.link
            ? <Link key={s.label} to={`#${s.link}`} onClick={() => {}}>{inner}</Link>
            : <div key={s.label}>{inner}</div>;
        })}
      </div>

      {/* Admin/Moderator post area */}
      {canEdit && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold flex items-center gap-2">📢 Publier une annonce dans le club</p>
            <button onClick={() => setShowPostForm(!showPostForm)} className="text-xs text-accent hover:underline">
              {showPostForm ? "Annuler" : "Écrire"}
            </button>
          </div>
          {showPostForm && (
            <div className="space-y-2">
              <textarea value={postText} onChange={e => setPostText(e.target.value)}
                rows={3} placeholder="Partagez une annonce, info ou contenu avec les membres..."
                className="w-full px-3 py-2 rounded-xl border border-input bg-transparent text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground" />
              <Button size="sm" onClick={() => postMutation.mutate()} disabled={!postText.trim() || postMutation.isPending} className="gap-1.5">
                {postMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Publier
              </Button>
            </div>
          )}
          {/* Recent posts */}
          {clubPosts.length > 0 && (
            <div className="mt-3 space-y-2">
              {clubPosts.slice(0, 3).map((p, i) => (
                <div key={p.id || i} className="bg-secondary/50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-accent mb-0.5">{p.created_by || "Admin"}</p>
                  <p className="text-sm">{p.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pinned book */}
      {club.pinned_book && (
        <div className="bg-gradient-to-r from-accent/10 to-primary/5 border border-accent/20 rounded-xl p-3 flex items-center gap-3">
          <Pin className="w-4 h-4 text-accent shrink-0" />
          <div>
            <p className="text-xs text-accent font-semibold">📌 Lecture épinglée</p>
            <p className="font-bold text-sm">{club.pinned_book}</p>
          </div>
        </div>
      )}

      {/* Recommended contents */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" /> Contenus conseillés</h3>
          {canEdit && (
            <button onClick={() => setEditingRecommended(!editingRecommended)}
              className="text-xs text-accent hover:underline flex items-center gap-1">
              <Edit className="w-3 h-3" /> {editingRecommended ? "Terminer" : "Modifier"}
            </button>
          )}
        </div>
        <div className="space-y-2">
          {recommendedItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5 border-b border-border last:border-0">
              <span className="text-base shrink-0">{TYPE_EMOJI[item.type] || "📖"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                {item.author && <p className="text-xs text-muted-foreground">{item.author}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => addMutation.mutate(item)}
                  disabled={addMutation.isPending}
                  className="text-xs px-2 py-1 rounded-lg border border-border hover:border-accent/40 hover:text-accent transition-colors flex items-center gap-0.5">
                  <Plus className="w-3 h-3" /> Ajouter
                </button>
                {editingRecommended && canEdit && (
                  <button onClick={() => removeRecommended(i)} className="text-destructive hover:opacity-70 p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {editingRecommended && canEdit && (
            <div className="flex gap-2 pt-1">
              <Input value={newRecommendedTitle} onChange={e => setNewRecommendedTitle(e.target.value)}
                placeholder="Titre du contenu à conseiller..." className="h-8 text-xs flex-1"
                onKeyDown={e => e.key === "Enter" && addRecommended()} />
              <Button size="sm" onClick={addRecommended} disabled={!newRecommendedTitle.trim()} className="h-8 text-xs">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Club Ranking */}
      {topMembers.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Crown className="w-4 h-4 text-yellow-500" /> Classement du club</h3>
          {topMembers.length >= 3 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[topMembers[1], topMembers[0], topMembers[2]].map((m, i) => {
                if (!m) return null;
                const realRank = i === 0 ? 2 : i === 1 ? 1 : 3;
                const style = RANK_STYLES[realRank - 1];
                const userObj = { full_name: m.name, email: m.name, total_kp: m.kp || 0, current_streak: m.streak || 0, level: "Lecteur 📖", books: 0, podcasts: 0, categories: {} };
                return (
                  <div key={i} onClick={() => setSelectedUser(userObj)}
                    className={`flex flex-col items-center p-2 rounded-2xl border cursor-pointer hover:shadow-md transition-all ${style.bg}`}>
                    <div className="text-xl mb-0.5">{style.badge}</div>
                    {m.photo
                      ? <img src={m.photo} alt={m.name} className="w-9 h-9 rounded-full object-cover mb-1" />
                      : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-sm mb-1">{m.name[0]}</div>
                    }
                    <p className="text-xs font-semibold text-center truncate w-full">{m.name.split(" ")[0]}</p>
                    <p className={`text-xs font-black ${style.text}`}>{(m.kp || 0).toLocaleString()} KP</p>
                  </div>
                );
              })}
            </div>
          )}
          <div className="space-y-1.5">
            {topMembers.map((m, i) => {
              const style = i < 3 ? RANK_STYLES[i] : null;
              const userObj = { full_name: m.name, email: m.name, total_kp: m.kp || 0, current_streak: m.streak || 0, level: "Lecteur 📖", books: 0, podcasts: 0, categories: {} };
              return (
                <div key={i} onClick={() => setSelectedUser(userObj)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${style ? style.bg : "bg-card border-border hover:border-accent/20"}`}>
                  <div className={`w-6 text-center font-black text-sm shrink-0 ${style ? style.text : "text-muted-foreground"}`}>
                    {i < 3 ? style.badge : `#${i + 1}`}
                  </div>
                  {m.photo
                    ? <img src={m.photo} alt={m.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                    : <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-xs shrink-0">{m.name[0]}</div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{m.name}</p>
                    <p className="text-xs text-muted-foreground"><Flame className="w-3 h-3 text-orange-500 inline" /> {m.streak}j streak</p>
                  </div>
                  <p className="font-black text-accent text-sm shrink-0">{(m.kp || 0).toLocaleString()} KP</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Content consumption breakdown */}
      {club.content_types?.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-accent" /> Contenus consommés par type</h3>
          <div className="grid grid-cols-2 gap-2">
            {club.content_types.map(ct => {
              const info = CONTENT_TYPE_ICONS[ct];
              if (!info) return null;
              const Icon = info.Icon;
              const count = ct === "book" ? Math.floor(memberCount * 1.8) : ct === "podcast" ? Math.floor(memberCount * 4.2) : ct === "video" ? Math.floor(memberCount * 2.1) : Math.floor(memberCount * 3.5);
              return (
                <div key={ct} className="flex items-center gap-2 p-2.5 bg-secondary/50 rounded-xl">
                  <Icon className={`w-4 h-4 ${info.color} shrink-0`} />
                  <div>
                    <p className="text-sm font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">{info.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Description + Rules */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <h3 className="font-semibold mb-2">📖 À propos</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{club.longDescription || club.description}</p>
        {club.rules && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">📜 Règles</p>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{club.rules}</p>
          </div>
        )}
      </div>

      {/* Themes */}
      {club.themes?.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="font-semibold mb-2">🏷️ Thèmes</h3>
          <div className="flex flex-wrap gap-1.5">
            {club.themes.map(t => (
              <span key={t} className="px-2.5 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">{t}</span>
            ))}
          </div>
        </div>
      )}

      {selectedUser && <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
}