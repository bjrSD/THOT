import React from "react";
import { Users, BookOpen, Trophy, Flame, Crown, TrendingUp, Pin, ListMusic, Headphones, Play, FileText } from "lucide-react";

const CONTENT_TYPE_ICONS = {
  book: { Icon: BookOpen, color: "text-green-500", label: "Livres" },
  podcast: { Icon: Headphones, color: "text-purple-500", label: "Podcasts" },
  video: { Icon: Play, color: "text-red-500", label: "Vidéos" },
  article: { Icon: FileText, color: "text-blue-500", label: "Articles" },
};

export default function ClubDashboard({ club, myMembership, dbMembers = [] }) {
  const memberCount = club.members || club.members_count || 1;
  const kpTotal = club.kp_total || 0;
  const role = myMembership?.role;

  const stats = [
    { icon: "👥", label: "Membres", value: memberCount.toLocaleString() },
    { icon: "⭐", label: "KP collectifs", value: kpTotal >= 1000 ? `${(kpTotal / 1000).toFixed(1)}k` : kpTotal.toLocaleString() },
    { icon: "🏆", label: "Défis actifs", value: club.challenges?.length || 0 },
    { icon: "📅", label: "Créé le", value: club.created_date ? new Date(club.created_date).toLocaleDateString("fr-FR", { month: "short", year: "numeric" }) : "—" },
  ];

  return (
    <div className="space-y-5">
      {/* Welcome message */}
      {club.welcome_message && (
        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4">
          <p className="text-xs text-accent font-semibold uppercase tracking-wide mb-1">💬 Message de bienvenue</p>
          <p className="text-sm leading-relaxed">{club.welcome_message}</p>
        </div>
      )}

      {/* My role badge */}
      {role && (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
          role === "admin" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-700" :
          role === "moderateur" ? "bg-blue-500/10 border-blue-500/20 text-blue-700" :
          "bg-green-500/10 border-green-500/20 text-green-700"
        }`}>
          {role === "admin" ? "🛡️ Vous êtes Admin" : role === "moderateur" ? "🔵 Vous êtes Modérateur" : "✓ Vous êtes Membre"}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center hover:shadow-sm transition-shadow">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="font-bold text-lg leading-none">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Description + Rules */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold mb-2 flex items-center gap-2">📖 À propos du club</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{club.longDescription || club.description}</p>
        {club.rules && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">📜 Règles</p>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{club.rules}</p>
          </div>
        )}
      </div>

      {/* Content types focus */}
      {club.content_types?.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-accent" /> Ce club se concentre sur</h3>
          <div className="grid grid-cols-2 gap-2">
            {club.content_types.map(ct => {
              const info = CONTENT_TYPE_ICONS[ct];
              if (!info) return null;
              const Icon = info.Icon;
              return (
                <div key={ct} className="flex items-center gap-2 p-3 bg-secondary/50 rounded-xl">
                  <Icon className={`w-5 h-5 ${info.color}`} />
                  <span className="text-sm font-medium">{info.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

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

      {/* Top members preview */}
      {club.top_members?.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Crown className="w-4 h-4 text-yellow-500" /> Top membres</h3>
          <div className="space-y-2">
            {club.top_members.slice(0, 3).map((m, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">{i + 1}</span>
                {m.photo
                  ? <img src={m.photo} alt={m.name} className="w-8 h-8 rounded-full object-cover" />
                  : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold">{m.name[0]}</div>
                }
                <div className="flex-1">
                  <p className="text-sm font-semibold">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.kp?.toLocaleString()} KP · {m.streak}j streak 🔥</p>
                </div>
                {i === 0 && <Crown className="w-4 h-4 text-yellow-500 shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent reads */}
      {club.recent_reads?.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4 text-accent" /> Lectures récentes du club</h3>
          <div className="space-y-2">
            {club.recent_reads.map((book, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 border-b border-border last:border-0">
                <span className="text-base">📖</span>
                <p className="text-sm font-medium">{book}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}