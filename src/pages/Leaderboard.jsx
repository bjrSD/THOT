import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Trophy, Crown, Flame, Star, TrendingUp, Loader2, Medal } from "lucide-react";

const MOCK_USERS = [
  { full_name: "Marie Dupont", email: "marie@ex.com", total_kp: 5420, current_streak: 42, level: "Polymathe 🧠", books: 28 },
  { full_name: "Karim Benzali", email: "karim@ex.com", total_kp: 4980, current_streak: 31, level: "Érudit 🎓", books: 22 },
  { full_name: "Sophie Laurent", email: "sophie@ex.com", total_kp: 4210, current_streak: 28, level: "Érudit 🎓", books: 19 },
  { full_name: "Lucas Martin", email: "lucas@ex.com", total_kp: 3890, current_streak: 15, level: "Penseur 💭", books: 17 },
  { full_name: "Amina Traoré", email: "amina@ex.com", total_kp: 3650, current_streak: 22, level: "Penseur 💭", books: 15 },
  { full_name: "Jules Bernard", email: "jules@ex.com", total_kp: 3200, current_streak: 9, level: "Lecteur 📖", books: 13 },
  { full_name: "Emma Wilson", email: "emma@ex.com", total_kp: 2890, current_streak: 18, level: "Lecteur 📖", books: 11 },
  { full_name: "Noah Petit", email: "noah@ex.com", total_kp: 2340, current_streak: 5, level: "Curieux 🔍", books: 9 },
];

const RANK_STYLES = [
  { bg: "bg-yellow-500/10", border: "border-yellow-500/30", badge: "🥇", text: "text-yellow-600" },
  { bg: "bg-slate-400/10", border: "border-slate-400/30", badge: "🥈", text: "text-slate-500" },
  { bg: "bg-orange-400/10", border: "border-orange-400/30", badge: "🥉", text: "text-orange-500" },
];

export default function Leaderboard() {
  const [tab, setTab] = useState("week");

  const tabs = [
    { id: "week", label: "Cette semaine" },
    { id: "month", label: "Ce mois" },
    { id: "all", label: "Tout temps" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
        <p className="text-muted-foreground text-sm mt-1">Top penseurs basés sur KP, régularité et diversité</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary p-1 rounded-xl">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all ${tab === t.id ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-3">
        {[MOCK_USERS[1], MOCK_USERS[0], MOCK_USERS[2]].map((user, i) => {
          const realRank = i === 0 ? 2 : i === 1 ? 1 : 3;
          const podiumH = realRank === 1 ? "h-20" : realRank === 2 ? "h-14" : "h-10";
          const style = RANK_STYLES[realRank - 1];
          return (
            <motion.div key={user.email} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`flex flex-col items-center p-3 rounded-2xl border ${style.bg} ${style.border}`}>
              <div className="text-2xl mb-1">{style.badge}</div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-lg border-2 border-background mb-1">
                {user.full_name?.[0]}
              </div>
              <p className="text-xs font-semibold text-center truncate w-full text-center">{user.full_name.split(" ")[0]}</p>
              <p className={`text-sm font-black ${style.text}`}>{user.total_kp.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">KP</p>
            </motion.div>
          );
        })}
      </div>

      {/* Full ranking */}
      <div className="space-y-2">
        {MOCK_USERS.map((user, i) => (
          <motion.div key={user.email} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
            <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all hover:shadow-md ${
              i < 3 ? `${RANK_STYLES[i].bg} ${RANK_STYLES[i].border}` : "bg-card border-border hover:border-accent/30"
            }`}>
              <div className={`w-8 text-center font-black text-sm ${i < 3 ? RANK_STYLES[i].text : "text-muted-foreground"}`}>
                {i < 3 ? RANK_STYLES[i].badge : `#${i + 1}`}
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold shrink-0">
                {user.full_name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{user.full_name}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-orange-500" /> {user.current_streak}j</span>
                  <span>{user.level}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-black text-accent">{user.total_kp.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">KP</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* City leaderboard teaser */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <span className="text-xl">🏙️</span> Cerveaux de votre ville
        </h3>
        <p className="text-sm text-muted-foreground mb-4">Cliquez sur une ville pour voir le classement local.</p>
        <div className="space-y-2">
          {[
            { city: "Paris", count: "1,240 apprenants", top: "Marie D." },
            { city: "Lyon", count: "430 apprenants", top: "Karim B." },
            { city: "Marseille", count: "310 apprenants", top: "Sophie L." },
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
    </div>
  );
}