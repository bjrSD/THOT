import React from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CalendarDays, TrendingUp } from "lucide-react";

const DOMAIN_META_COLORS = {
  philosophie: "#8B5CF6",
  science: "#06B6D4",
  business: "#F59E0B",
  technologie: "#3B82F6",
  histoire: "#84CC16",
  psychologie: "#EC4899",
  art: "#F97316",
  sante: "#10B981",
};

export default function BrainEvolution({ contents, DOMAIN_META }) {
  const now = new Date();

  // Last 7 days vs previous 7 days activity per domain
  const recentCutoff = new Date(now); recentCutoff.setDate(now.getDate() - 7);
  const prevCutoff = new Date(now); prevCutoff.setDate(now.getDate() - 14);

  const completed = contents.filter(c => c.status === "completed" && c.completed_date);

  const recentByDomain = {};
  const prevByDomain = {};

  Object.keys(DOMAIN_META).forEach(k => {
    recentByDomain[k] = 0;
    prevByDomain[k] = 0;
  });

  completed.forEach(c => {
    if (!c.category) return;
    const d = new Date(c.completed_date);
    if (d >= recentCutoff) recentByDomain[c.category] = (recentByDomain[c.category] || 0) + 1;
    else if (d >= prevCutoff) prevByDomain[c.category] = (prevByDomain[c.category] || 0) + 1;
  });

  const evolutionData = Object.entries(DOMAIN_META)
    .map(([key, meta]) => ({
      name: meta.label,
      key,
      emoji: meta.emoji,
      recent: recentByDomain[key] || 0,
      prev: prevByDomain[key] || 0,
      diff: (recentByDomain[key] || 0) - (prevByDomain[key] || 0),
      color: DOMAIN_META_COLORS[key] || "#6366f1",
    }))
    .filter(d => d.recent > 0 || d.prev > 0)
    .sort((a, b) => b.recent - a.recent);

  // Last 30 days per week buckets
  const weeklyData = Array.from({ length: 4 }, (_, i) => {
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - (i + 1) * 7);
    const weekEnd = new Date(now); weekEnd.setDate(now.getDate() - i * 7);
    const count = completed.filter(c => {
      const d = new Date(c.completed_date);
      return d >= weekStart && d < weekEnd;
    }).length;
    return { name: `S-${i + 1}`, count };
  }).reverse();

  const rising = evolutionData.filter(d => d.diff > 0);
  const falling = evolutionData.filter(d => d.diff < 0);
  const newDomains = Object.keys(DOMAIN_META).filter(
    k => recentByDomain[k] > 0 && prevByDomain[k] === 0
  );

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-5 h-5 text-accent" />
        <h3 className="font-semibold">Évolution de votre carte</h3>
      </div>

      {/* Weekly trend bar chart */}
      <p className="text-xs text-muted-foreground mb-3">Contenus terminés par semaine (30 derniers jours)</p>
      {weeklyData.some(d => d.count > 0) ? (
        <div className="h-32 mb-5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                formatter={(v) => [`${v} contenu${v > 1 ? "s" : ""}`, ""]}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {weeklyData.map((_, i) => (
                  <Cell key={i} fill={i === weeklyData.length - 1 ? "hsl(var(--accent))" : "hsl(var(--accent) / 0.4)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-24 flex items-center justify-center text-muted-foreground text-xs mb-5">
          Aucun contenu terminé ces 30 derniers jours
        </div>
      )}

      {/* Domain shifts */}
      <div className="grid sm:grid-cols-3 gap-3">
        {rising.length > 0 && (
          <div className="bg-green-500/8 border border-green-500/20 rounded-xl p-3">
            <p className="text-xs font-semibold text-green-500 mb-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> En hausse
            </p>
            <div className="space-y-1">
              {rising.map(d => (
                <p key={d.key} className="text-xs text-muted-foreground">{d.emoji} {d.name} <span className="text-green-400">+{d.diff}</span></p>
              ))}
            </div>
          </div>
        )}
        {falling.length > 0 && (
          <div className="bg-secondary/60 border border-border rounded-xl p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2">En recul</p>
            <div className="space-y-1">
              {falling.map(d => (
                <p key={d.key} className="text-xs text-muted-foreground">{d.emoji} {d.name} <span className="text-orange-400">{d.diff}</span></p>
              ))}
            </div>
          </div>
        )}
        {newDomains.length > 0 && (
          <div className="bg-accent/8 border border-accent/20 rounded-xl p-3">
            <p className="text-xs font-semibold text-accent mb-2">🆕 Nouvelles zones</p>
            <div className="space-y-1">
              {newDomains.map(k => (
                <p key={k} className="text-xs text-muted-foreground">{DOMAIN_META[k]?.emoji} {DOMAIN_META[k]?.label}</p>
              ))}
            </div>
          </div>
        )}
        {rising.length === 0 && falling.length === 0 && newDomains.length === 0 && (
          <p className="text-xs text-muted-foreground col-span-3 text-center py-2">
            Pas assez de données récentes pour afficher l'évolution. Terminez des contenus pour voir votre carte bouger.
          </p>
        )}
      </div>
    </div>
  );
}