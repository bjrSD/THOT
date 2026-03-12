import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Brain, Loader2, Zap } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

const DOMAIN_META = {
  philosophie: { emoji: "🧘", color: "#8B5CF6", label: "Philosophie" },
  science: { emoji: "🔬", color: "#06B6D4", label: "Science" },
  business: { emoji: "💼", color: "#F59E0B", label: "Business" },
  technologie: { emoji: "💻", color: "#3B82F6", label: "Technologie" },
  histoire: { emoji: "📜", color: "#84CC16", label: "Histoire" },
  psychologie: { emoji: "🧠", color: "#EC4899", label: "Psychologie" },
  art: { emoji: "🎨", color: "#F97316", label: "Art" },
  sante: { emoji: "❤️", color: "#10B981", label: "Santé" },
};

export default function BrainMap() {
  const [user, setUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: contents = [], isLoading } = useQuery({
    queryKey: ["contents-brain"],
    queryFn: () => base44.entities.Content.list("-created_date", 200),
  });

  const domainScores = Object.keys(DOMAIN_META).reduce((acc, domain) => {
    const items = contents.filter(c => c.category === domain);
    const completed = items.filter(c => c.status === "completed").length;
    const inProgress = items.filter(c => c.status === "in_progress").length;
    acc[domain] = completed * 10 + inProgress * 3;
    return acc;
  }, {});

  const radarData = Object.entries(DOMAIN_META).map(([key, meta]) => ({
    subject: meta.label,
    value: domainScores[key] || 0,
    fullMark: 100,
  }));

  const totalScore = Object.values(domainScores).reduce((a, b) => a + b, 0);
  const topDomains = Object.entries(domainScores)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, v]) => v > 0)
    .slice(0, 4);

  if (isLoading) return (
    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 via-accent/10 to-primary/20 border border-purple-500/20 p-6">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="absolute right-4 top-4 text-5xl opacity-20"
        >🧠</motion.div>
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-7 h-7 text-purple-500" />
          <h1 className="font-heading text-2xl font-bold">Carte du Cerveau</h1>
        </div>
        <p className="text-muted-foreground text-sm">Votre univers de connaissance — visualisez vos domaines de maîtrise</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full font-medium">
            <Zap className="w-3 h-3 inline mr-1" /> Score total : {totalScore} pts
          </span>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-4 text-center">Radar des connaissances</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Radar name="Vous" dataKey="value" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.25} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                formatter={(v) => [`${v} pts`, "Score"]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Domain bubbles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(DOMAIN_META).map(([key, meta]) => {
          const score = domainScores[key] || 0;
          const maxScore = Math.max(...Object.values(domainScores), 1);
          const pct = Math.round((score / maxScore) * 100);
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-card border border-border rounded-2xl p-4 text-center hover:shadow-md transition-all"
              style={{ borderColor: score > 0 ? meta.color + "40" : undefined }}
            >
              <div className="text-3xl mb-2">{meta.emoji}</div>
              <p className="text-xs font-semibold mb-2">{meta.label}</p>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">{score} pts</p>
            </motion.div>
          );
        })}
      </div>

      {/* Top domains */}
      {topDomains.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold mb-3">Vos points forts</h3>
          <div className="space-y-3">
            {topDomains.map(([domain, score], i) => {
              const meta = DOMAIN_META[domain];
              return (
                <div key={domain} className="flex items-center gap-3">
                  <span className="text-xl">{meta.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{meta.label}</span>
                      <span className="text-muted-foreground">{score} pts</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, score)}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: meta.color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {totalScore === 0 && (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🌱</div>
          <p className="font-semibold">Votre carte est vide pour l'instant</p>
          <p className="text-sm text-muted-foreground mt-1">Terminez des contenus pour remplir votre cerveau !</p>
        </div>
      )}
    </div>
  );
}