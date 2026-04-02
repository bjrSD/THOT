import React from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

const LEVEL_THRESHOLDS = [
  { min: 0, label: "Inexploré", color: "text-muted-foreground" },
  { min: 1, label: "Débutant", color: "text-blue-400" },
  { min: 15, label: "Initié", color: "text-green-400" },
  { min: 40, label: "Avancé", color: "text-yellow-400" },
  { min: 80, label: "Expert", color: "text-orange-400" },
  { min: 150, label: "Maître", color: "text-purple-400" },
];

function getLevel(score) {
  let level = LEVEL_THRESHOLDS[0];
  for (const l of LEVEL_THRESHOLDS) {
    if (score >= l.min) level = l;
  }
  return level;
}

export default function DomainGrid({ domainScores, DOMAIN_META }) {
  const maxScore = Math.max(...Object.values(domainScores), 1);
  const sorted = Object.entries(DOMAIN_META).sort(
    ([a], [b]) => (domainScores[b] || 0) - (domainScores[a] || 0)
  );

  const primary = sorted.slice(0, 3);
  const secondary = sorted.slice(3);

  return (
    <div className="space-y-4">
      {/* Primary domains */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold mb-1">Domaines principaux</h3>
        <p className="text-xs text-muted-foreground mb-4">Les axes qui structurent votre intelligence actuelle</p>
        <div className="space-y-4">
          {primary.map(([key, meta], i) => {
            const score = domainScores[key] || 0;
            const pct = Math.round((score / maxScore) * 100);
            const level = getLevel(score);
            const items = { completed: 0, in_progress: 0 }; // computed by parent ideally
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ backgroundColor: meta.color + "18", border: `1px solid ${meta.color}40` }}
                >
                  {meta.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{meta.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${level.color}`}>{level.label}</span>
                      <span className="text-xs text-muted-foreground">{score} pts</span>
                    </div>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: meta.color }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Secondary domains */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold mb-1">Domaines secondaires</h3>
        <p className="text-xs text-muted-foreground mb-4">Territoires en développement ou encore peu explorés</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {secondary.map(([key, meta], i) => {
            const score = domainScores[key] || 0;
            const pct = Math.round((score / maxScore) * 100);
            const level = getLevel(score);
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                whileHover={{ scale: 1.04 }}
                className="bg-secondary/50 rounded-xl p-3 text-center hover:shadow-sm transition-all"
                style={{ borderLeft: `3px solid ${score > 0 ? meta.color : "transparent"}` }}
              >
                <div className="text-2xl mb-1">{meta.emoji}</div>
                <p className="text-xs font-semibold truncate">{meta.label}</p>
                <p className={`text-xs ${level.color} mt-0.5`}>{level.label}</p>
                <div className="h-1 bg-border rounded-full overflow-hidden mt-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.9, delay: 0.4 + i * 0.07 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{score} pts</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}