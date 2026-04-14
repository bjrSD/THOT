import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Flame, Star, ChevronRight, BookOpen, Brain, Headphones, Play, FileText, Zap, Globe } from "lucide-react";
import UserAvatar from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import UserProfileModal from "@/components/leaderboard/UserProfileModal";

const MOCK_USERS = [
  { full_name: "Marie Dupont",   email: "marie@ex.com",  total_kp: 5420, current_streak: 42, level: "Polymathe 🧠",  books: 28, podcasts: 14, categories: { philosophie: 320, science: 210, business: 180 } },
  { full_name: "Karim Benzali",  email: "karim@ex.com",  total_kp: 4980, current_streak: 31, level: "Érudit 🎓",      books: 22, podcasts: 9,  categories: { business: 410, technologie: 290, psychologie: 150 } },
  { full_name: "Sophie Laurent", email: "sophie@ex.com", total_kp: 4210, current_streak: 28, level: "Érudit 🎓",      books: 19, podcasts: 18, categories: { psychologie: 380, art: 270, histoire: 200 } },
  { full_name: "Lucas Martin",   email: "lucas@ex.com",  total_kp: 3890, current_streak: 15, level: "Penseur 💭",     books: 17, podcasts: 6,  categories: { science: 350, technologie: 320, philosophie: 130 } },
  { full_name: "Amina Traoré",   email: "amina@ex.com",  total_kp: 3650, current_streak: 22, level: "Penseur 💭",     books: 15, podcasts: 22, categories: { histoire: 290, philosophie: 260, art: 190 } },
  { full_name: "Jules Bernard",  email: "jules@ex.com",  total_kp: 3200, current_streak: 9,  level: "Lecteur 📖",     books: 13, podcasts: 5,  categories: { business: 280, technologie: 210, science: 140 } },
  { full_name: "Emma Wilson",    email: "emma@ex.com",   total_kp: 2890, current_streak: 18, level: "Lecteur 📖",     books: 11, podcasts: 11, categories: { psychologie: 230, sante: 200, art: 170 } },
  { full_name: "Noah Petit",     email: "noah@ex.com",   total_kp: 2340, current_streak: 5,  level: "Curieux 🔍",     books: 9,  podcasts: 3,  categories: { science: 180, technologie: 150, histoire: 110 } },
];

const RANK_STYLES = [
  { bg: "bg-yellow-500/10", border: "border-yellow-500/30", badge: "🥇", text: "text-yellow-600" },
  { bg: "bg-slate-400/10",  border: "border-slate-400/30",  badge: "🥈", text: "text-slate-500"  },
  { bg: "bg-orange-400/10", border: "border-orange-400/30", badge: "🥉", text: "text-orange-500" },
];

const TIME_TABS = [
  { id: "week",  label: "Cette semaine" },
  { id: "month", label: "Ce mois" },
  { id: "all",   label: "Tout temps" },
];

const RANKING_TYPES = [
  { id: "global",      label: "🏆 Global",       desc: "Tous KP confondus" },
  { id: "books",       label: "📚 Livres",        desc: "Livres lus" },
  { id: "podcasts",    label: "🎙️ Podcasts",      desc: "Épisodes écoutés" },
  { id: "streak",      label: "🔥 Régularité",    desc: "Streak actuel" },
  { id: "philosophie", label: "🧘 Philosophie",   desc: "KP par catégorie" },
  { id: "science",     label: "🔬 Science",       desc: "KP par catégorie" },
  { id: "business",    label: "💰 Business",      desc: "KP par catégorie" },
  { id: "technologie", label: "💻 Tech",          desc: "KP par catégorie" },
  { id: "psychologie", label: "🧐 Psychologie",   desc: "KP par catégorie" },
  { id: "histoire",    label: "🌎 Histoire",      desc: "KP par catégorie" },
  { id: "art",         label: "🎨 Art",           desc: "KP par catégorie" },
];

function getScore(user, rankingType) {
  switch (rankingType) {
    case "books":    return user.books;
    case "podcasts": return user.podcasts;
    case "streak":   return user.current_streak;
    case "global":   return user.total_kp;
    default:         return user.categories?.[rankingType] || 0;
  }
}

function getScoreLabel(rankingType) {
  switch (rankingType) {
    case "books":   return "livres";
    case "podcasts":return "épisodes";
    case "streak":  return "jours";
    case "global":  return "KP";
    default:        return "KP";
  }
}

export default function Leaderboard() {
  const [timeTab, setTimeTab]       = useState("all");
  const [rankType, setRankType]     = useState("global");
  const [selectedUser, setSelectedUser] = useState(null);

  const sorted = [...MOCK_USERS]
    .map((u, i) => ({ ...u, rank: i + 1 }))
    .sort((a, b) => getScore(b, rankType) - getScore(a, rankType))
    .map((u, i) => ({ ...u, rank: i + 1 }));

  const scoreLabel = getScoreLabel(rankType);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/20 via-orange-500/10 to-primary/20 border border-yellow-500/20 p-6">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="absolute right-6 top-4 text-5xl"
        >🏆</motion.div>
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" /> Classement des cerveaux
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Top penseurs — cliquez sur un profil pour suivre ou vous lier d'amitié</p>
      </div>

      {/* Ranking type selector */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Type de classement</p>
        <div className="flex gap-2 flex-wrap">
          {RANKING_TYPES.map(rt => (
            <button key={rt.id} onClick={() => setRankType(rt.id)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-all font-medium ${
                rankType === rt.id
                  ? "bg-accent text-white border-accent shadow"
                  : "border-border bg-card hover:border-accent/40 text-muted-foreground hover:text-foreground"
              }`}>
              {rt.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          {RANKING_TYPES.find(r => r.id === rankType)?.desc}
        </p>
      </div>

      {/* Time tabs */}
      <div className="flex gap-1 bg-secondary p-1 rounded-xl">
        {TIME_TABS.map(t => (
          <button key={t.id} onClick={() => setTimeTab(t.id)}
            className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all ${timeTab === t.id ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-3">
        {[sorted[1], sorted[0], sorted[2]].map((user, i) => {
          if (!user) return null;
          const realRank = i === 0 ? 2 : i === 1 ? 1 : 3;
          const style = RANK_STYLES[realRank - 1];
          const score = getScore(user, rankType);
          return (
            <motion.div key={user.email} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedUser(user)}
              className={`flex flex-col items-center p-3 rounded-2xl border cursor-pointer hover:shadow-md transition-all ${style.bg} ${style.border}`}>
              <div className="text-2xl mb-1">{style.badge}</div>
              <div className="mb-1 flex justify-center">
                <UserAvatar user={user} size="md" />
              </div>
              <p className="text-xs font-semibold text-center truncate w-full">{user.full_name.split(" ")[0]}</p>
              <p className={`text-sm font-black ${style.text}`}>{score.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{scoreLabel}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Full ranking */}
      <div className="space-y-2">
        {sorted.map((user, i) => {
          const score = getScore(user, rankType);
          return (
            <motion.div key={user.email} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <div
                onClick={() => setSelectedUser(user)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                  i < 3 ? `${RANK_STYLES[i].bg} ${RANK_STYLES[i].border}` : "bg-card border-border hover:border-accent/30"
                }`}>
                <div className={`w-8 text-center font-black text-sm shrink-0 ${i < 3 ? RANK_STYLES[i].text : "text-muted-foreground"}`}>
                  {i < 3 ? RANK_STYLES[i].badge : `#${i + 1}`}
                </div>
                <UserAvatar user={user} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{user.full_name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-orange-500" /> {user.current_streak}j</span>
                    <span>{user.level}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-accent">{score.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{scoreLabel}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* City leaderboard teaser */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <span className="text-xl">🏙️</span> Cerveaux de votre ville
        </h3>
        <p className="text-sm text-muted-foreground mb-4">Cliquez sur une ville pour voir le classement local.</p>
        <div className="space-y-2">
          {[
            { city: "Paris",     count: "1 240 apprenants", top: "Marie D." },
            { city: "Lyon",      count: "430 apprenants",   top: "Karim B." },
            { city: "Marseille", count: "310 apprenants",   top: "Sophie L." },
          ].map((c, i) => (
            <Link key={c.city} to={`/CityLeaderboard?city=${c.city}`}>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-muted-foreground">#{i+1}</span>
                  <span className="font-medium text-sm">🏙️ {c.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{c.count}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        <Link to="/CityLeaderboard">
          <Button variant="outline" className="w-full mt-3 gap-2" size="sm">Voir toutes les villes →</Button>
        </Link>
      </div>

      {/* Profile modal */}
      {selectedUser && (
        <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}