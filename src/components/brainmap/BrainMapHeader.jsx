import React from "react";
import { motion } from "framer-motion";
import { Brain, Zap, BookOpen, TrendingUp, Layers } from "lucide-react";

export default function BrainMapHeader({ totalScore, activeDomains, dominantDomain, totalContents, DOMAIN_META }) {
  const dominant = dominantDomain ? DOMAIN_META[dominantDomain] : null;

  const stats = [
    {
      icon: Layers,
      label: "Domaines actifs",
      value: activeDomains,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      icon: Zap,
      label: "Score total",
      value: `${totalScore} pts`,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      icon: Brain,
      label: "Domaine dominant",
      value: dominant ? `${dominant.emoji} ${dominant.label}` : "—",
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
    {
      icon: BookOpen,
      label: "Contenus analysés",
      value: totalContents,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 via-accent/10 to-primary/20 border border-purple-500/20 p-6">
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
        className="absolute right-4 top-4 text-6xl opacity-10 pointer-events-none"
      >🧠</motion.div>

      <div className="flex items-center gap-3 mb-1">
        <Brain className="w-7 h-7 text-purple-500 shrink-0" />
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Carte de votre cerveau</h1>
      </div>
      <p className="text-muted-foreground text-sm mb-5 max-w-xl">
        Ce profil est construit à partir de l'ensemble des livres, podcasts, vidéos et articles que vous suivez dans THOT. Il évolue à chaque contenu terminé.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-3 flex flex-col gap-1"
          >
            <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
            </div>
            <p className="text-xs text-muted-foreground leading-tight">{s.label}</p>
            <p className="text-sm font-bold leading-tight">{s.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}