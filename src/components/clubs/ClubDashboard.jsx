import React, { useState } from "react";
import { BookOpen, Flame, Crown, TrendingUp, Headphones, Play, FileText, Pin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import UserProfileModal from "@/components/leaderboard/UserProfileModal";
import ClubAnnonces from "@/components/clubs/ClubAnnonces";
import ClubRecommended from "@/components/clubs/ClubRecommended";

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

export default function ClubDashboard({ club, myMembership, clubChallengesCount = 0, clubId, myEmail }) {
  const [selectedUser, setSelectedUser] = useState(null);

  const memberCount = club.members || club.members_count || 1;
  const kpTotal = club.kp_total || 0;
  const role = myMembership?.role;
  const canEdit = role === "admin" || role === "moderateur";

  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
  const { data: allMembers = [] } = useQuery({
    queryKey: ["club-members", clubId],
    queryFn: () => base44.entities.ClubMember.filter({ club_id: clubId }),
    enabled: !!clubId,
  });
  const { data: completedContents = [] } = useQuery({
    queryKey: ["contents-completed"],
    queryFn: () => base44.entities.Content.filter({ status: "completed" }),
  });

  const avgStreak = allMembers.length > 0
    ? Math.round(allMembers.reduce((sum, m) => sum + (m.current_streak || 0), 0) / allMembers.length)
    : Math.min(28, Math.floor(memberCount / 12));

  const topMembers = club.top_members || [];

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

      {/* Annonces (admin/mod can post, all members can see + react) */}
      <ClubAnnonces clubId={clubId} clubName={club.name} canPost={canEdit} myEmail={myEmail} />

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

      {/* Recommended contents — connected to DB + search */}
      <ClubRecommended club={club} canEdit={canEdit} />

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

      {selectedUser && <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
}