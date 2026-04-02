import React from "react";
import { motion } from "framer-motion";
import { Flame, CalendarDays, TrendingUp, Target, BarChart2, Zap } from "lucide-react";

export default function HeatmapStats({ stats }) {
  const items = [
    { label: "Jours actifs", value: stats.activeDays, sub: "cette année", icon: CalendarDays, color: "text-accent" },
    { label: "Streak actuel", value: `${stats.currentStreak}j`, sub: stats.currentStreak > 0 ? "en cours 🔥" : "à relancer", icon: Flame, color: "text-orange-500" },
    { label: "Meilleur streak", value: `${stats.bestStreak}j`, sub: "record personnel", icon: Target, color: "text-yellow-500" },
    { label: "Moy. hebdo", value: `${stats.weeklyAvg}j`, sub: "jours actifs / sem.", icon: TrendingUp, color: "text-green-500" },
    { label: "Régularité 30j", value: `${stats.regularity30}%`, sub: stats.regularity30 >= 50 ? "bonne constance" : "à améliorer", icon: BarChart2, color: "text-purple-400" },
    { label: "KP ce mois", value: stats.kpThisMonth.toLocaleString(), sub: "Knowledge Points", icon: Zap, color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
            </div>
            <p className="text-2xl font-black leading-none">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </motion.div>
        );
      })}
    </div>
  );
}