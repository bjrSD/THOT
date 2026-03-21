import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Brain, Zap, TrendingUp, TrendingDown } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const VOCAB_STATS = [
  { label: "Total de mots assimilés", value: "2 700", trend: +12, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Taille du vocabulaire", value: "1 695", trend: +8, icon: Brain, color: "text-purple-500", bg: "bg-purple-500/10" },
  { label: "Nouveaux mots", value: "97", trend: +23, icon: Zap, color: "text-green-500", bg: "bg-green-500/10" },
];

// Generate deterministic data (no Math.random so it's stable on re-renders)
const CAPITAL_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  kp: Math.round(1200 + i * 45 + Math.sin(i * 0.7) * 110),
}));

export default function VocabStatsRow({ contents = [] }) {
  // Derive real word count from completed books
  const completedBooks = contents.filter(c => c.type === "book" && c.status === "completed").length;
  const latestKP = CAPITAL_DATA[29].kp + completedBooks * 80;

  return (
    <div className="space-y-5">
      {/* 3 stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {VOCAB_STATS.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <div className="flex items-end gap-3">
              <p className="text-3xl font-black">{stat.value}</p>
              <div className={`flex items-center gap-1 text-sm font-semibold mb-0.5 ${stat.trend > 0 ? "text-green-500" : "text-red-500"}`}>
                {stat.trend > 0
                  ? <TrendingUp className="w-4 h-4" />
                  : <TrendingDown className="w-4 h-4" />}
                +{stat.trend}%
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">vs. mois précédent</p>
          </motion.div>
        ))}
      </div>

      {/* Capital Savoir Area Chart */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl border border-border p-5 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-base">Évolution du Capital Savoir</h3>
            <p className="text-xs text-muted-foreground">30 derniers jours</p>
          </div>
          <span className="text-2xl font-black text-fuchsia-500">{latestKP.toLocaleString()} KP</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={CAPITAL_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="kpDashGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d946ef" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              formatter={(v) => [`${v} KP`, "Capital Savoir"]}
              labelFormatter={(l) => `Jour ${l}`}
            />
            <Area type="monotone" dataKey="kp" stroke="#d946ef" strokeWidth={2.5} fill="url(#kpDashGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}