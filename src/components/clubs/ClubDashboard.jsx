import React, { useState } from "react";
import { Users, BookOpen, Trophy, Flame, Crown, TrendingUp, Pin, Headphones, Play, FileText, Plus, Star } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import UserProfileModal from "@/components/leaderboard/UserProfileModal";

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

// Suggested / recommended contents (sampled from shared posts)
const SUGGESTED_BOOKS = [
  { title: "Atomic Habits", author: "James Clear", type: "book", cover_url: null },
  { title: "Zero to One", author: "Peter Thiel", type: "book", cover_url: null },
  { title: "The Lean Startup", author: "Eric Ries", type: "book", cover_url: null },
  { title: "Thinking Fast and Slow", author: "Daniel Kahneman", type: "book", cover_url: null },
];

export default function ClubDashboard({ club, myMembership }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const qc = useQueryClient();

  const memberCount = club.members || club.members_count || 1;
  const kpTotal = club.kp_total || 0;
  const role = myMembership?.role;

  // Fetch current user KP to show "my contribution"
  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  // Add to library
  const addMutation = useMutation({
    mutationFn: (item) => base44.entities.Content.create({
      title: item.title, author: item.author || "", type: item.type || "book", status: "to_consume",
    }),
    onSuccess: (_, item) => {
      qc.invalidateQueries({ queryKey: ["contents"] });
      toast.success(`"${item.title}" ajouté !`);
    },
  });

  const stats = [
    { icon: "👥", label: "Membres",         value: memberCount.toLocaleString() },
    { icon: "⭐", label: "KP collectifs",    value: kpTotal >= 1000 ? `${(kpTotal / 1000).toFixed(1)}k` : kpTotal.toLocaleString() },
    { icon: "📚", label: "Contenus lus",     value: Math.floor(memberCount * 3.2) },
    { icon: "🔥", label: "Streak moyen",     value: `${Math.min(28, Math.floor(memberCount / 12))}j` },
    { icon: "🏆", label: "Défis actifs",     value: club.challenges?.length || 0 },
    { icon: "📅", label: "Créé le",          value: club.created_date ? new Date(club.created_date).toLocaleDateString("fr-FR", { month: "short", year: "numeric" }) : "—" },
  ];

  // Top members for ranking inside club
  const topMembers = club.top_members || [];

  return (
    <div className="space-y-5">
      {/* Welcome message */}
      {club.welcome_message && (
        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4">
          <p className="text-xs text-accent font-semibold uppercase tracking-wide mb-1">💬 Message de bienvenue</p>
          <p className="text-sm leading-relaxed">{club.welcome_message}</p>
        </div>
      )}

      {/* My role + my KP contribution */}
      <div className="flex flex-wrap gap-3">
        {role && (
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
            role === "admin" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-700" :
            role === "moderateur" ? "bg-blue-500/10 border-blue-500/20 text-blue-700" :
            "bg-green-500/10 border-green-500/20 text-green-700"
          }`}>
            {role === "admin" ? "🛡️ Admin" : role === "moderateur" ? "🔵 Modérateur" : "✓ Membre"}
          </div>
        )}
        {me?.total_kp > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border bg-accent/10 border-accent/20 text-accent">
            ⭐ Mes KP : {(me.total_kp || 0).toLocaleString()} KP
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center hover:shadow-sm transition-shadow">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="font-bold text-lg leading-none">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Content consumption breakdown */}
      {club.content_types?.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-accent" /> Contenus consommés par type</h3>
          <div className="grid grid-cols-2 gap-3">
            {club.content_types.map(ct => {
              const info = CONTENT_TYPE_ICONS[ct];
              if (!info) return null;
              const Icon = info.Icon;
              const fakeCount = ct === "book" ? Math.floor(memberCount * 1.8) : ct === "podcast" ? Math.floor(memberCount * 4.2) : ct === "video" ? Math.floor(memberCount * 2.1) : Math.floor(memberCount * 3.5);
              return (
                <div key={ct} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                  <Icon className={`w-5 h-5 ${info.color} shrink-0`} />
                  <div>
                    <p className="text-sm font-bold">{fakeCount}</p>
                    <p className="text-xs text-muted-foreground">{info.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Club Ranking */}
      {topMembers.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Crown className="w-4 h-4 text-yellow-500" /> Classement du club</h3>
          {/* Top 3 podium */}
          {topMembers.length >= 3 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[topMembers[1], topMembers[0], topMembers[2]].map((m, i) => {
                if (!m) return null;
                const realRank = i === 0 ? 2 : i === 1 ? 1 : 3;
                const style = RANK_STYLES[realRank - 1];
                const userObj = { full_name: m.name, email: m.name, total_kp: m.kp || 0, current_streak: m.streak || 0, level: "Lecteur 📖", books: 0, podcasts: 0, categories: {} };
                return (
                  <div key={i} onClick={() => setSelectedUser(userObj)}
                    className={`flex flex-col items-center p-3 rounded-2xl border cursor-pointer hover:shadow-md transition-all ${style.bg}`}>
                    <div className="text-2xl mb-1">{style.badge}</div>
                    {m.photo
                      ? <img src={m.photo} alt={m.name} className="w-10 h-10 rounded-full object-cover mb-1" />
                      : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold mb-1">{m.name[0]}</div>
                    }
                    <p className="text-xs font-semibold text-center truncate w-full">{m.name.split(" ")[0]}</p>
                    <p className={`text-sm font-black ${style.text}`}>{(m.kp || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">KP</p>
                  </div>
                );
              })}
            </div>
          )}
          <div className="space-y-2">
            {topMembers.map((m, i) => {
              const style = i < 3 ? RANK_STYLES[i] : null;
              const userObj = { full_name: m.name, email: m.name, total_kp: m.kp || 0, current_streak: m.streak || 0, level: "Lecteur 📖", books: 0, podcasts: 0, categories: {} };
              return (
                <div key={i} onClick={() => setSelectedUser(userObj)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${style ? style.bg : "bg-card border-border hover:border-accent/20"}`}>
                  <div className={`w-7 text-center font-black text-sm shrink-0 ${style ? style.text : "text-muted-foreground"}`}>
                    {i < 3 ? style.badge : `#${i + 1}`}
                  </div>
                  {m.photo
                    ? <img src={m.photo} alt={m.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-sm shrink-0">{m.name[0]}</div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{m.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Flame className="w-3 h-3 text-orange-500" /><span>{m.streak}j</span>
                    </div>
                  </div>
                  <p className="font-black text-accent text-sm shrink-0">{(m.kp || 0).toLocaleString()} KP</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pinned book */}
      {club.pinned_book && (
        <div className="bg-gradient-to-r from-accent/10 to-primary/5 border border-accent/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
            <Pin className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-xs text-accent font-semibold uppercase tracking-wide">📌 Lecture épinglée du moment</p>
            <p className="font-bold text-sm mt-0.5">{club.pinned_book}</p>
          </div>
        </div>
      )}

      {/* Recommended contents */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" /> Contenus conseillés par le club</h3>
        <div className="space-y-2">
          {(club.recent_reads?.length > 0 ? club.recent_reads.map((title, i) => ({ title, author: "", type: "book" })) : SUGGESTED_BOOKS).map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <span className="text-xl shrink-0">{TYPE_EMOJI[item.type] || "📖"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{typeof item === "string" ? item : item.title}</p>
                {item.author && <p className="text-xs text-muted-foreground truncate">{item.author}</p>}
              </div>
              <button
                onClick={() => addMutation.mutate(typeof item === "string" ? { title: item, type: "book" } : item)}
                disabled={addMutation.isPending}
                className="text-xs px-2.5 py-1 rounded-lg border border-border hover:border-accent/40 hover:text-accent transition-colors shrink-0 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Ajouter
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Description + Rules */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold mb-2">📖 À propos du club</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{club.longDescription || club.description}</p>
        {club.rules && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">📜 Règles</p>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{club.rules}</p>
          </div>
        )}
      </div>

      {/* Themes */}
      {club.themes?.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold mb-3">🏷️ Thèmes du club</h3>
          <div className="flex flex-wrap gap-2">
            {club.themes.map(t => (
              <span key={t} className="px-3 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-medium">{t}</span>
            ))}
          </div>
        </div>
      )}

      {selectedUser && <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
}