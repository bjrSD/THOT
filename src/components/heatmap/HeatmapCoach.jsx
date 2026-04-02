import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

function buildCoachMessage(stats, dayMap) {
  const { currentStreak, regularity30, activeDays, bestStreak } = stats;
  const today = new Date();

  // Check if active today
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const activeToday = (dayMap[todayKey] || 0) > 0;

  // Check last 3 days
  const last3Active = [1, 2, 3].filter(i => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return (dayMap[k] || 0) > 0;
  }).length;

  if (currentStreak >= 14) {
    return {
      emoji: "🏆",
      title: "Discipline d'élite",
      message: `${currentStreak} jours consécutifs — vous faites partie des apprenants les plus réguliers. Ce niveau de constance se traduit directement en avantage intellectuel durable.`,
      accent: true,
    };
  }

  if (currentStreak >= 7) {
    return {
      emoji: "🔥",
      title: "Élan en cours",
      message: `${currentStreak} jours de suite — vous êtes dans une vraie dynamique. C'est précisément à ce moment qu'une habitude s'installe durablement. Gardez le cap.`,
      accent: true,
    };
  }

  if (!activeToday && last3Active >= 2) {
    return {
      emoji: "💡",
      title: "Votre série vous attend",
      message: `Vous avez été actif ${last3Active} des 3 derniers jours. Aujourd'hui pourrait être l'occasion de nourrir votre élan — même 15 minutes font la différence.`,
      accent: false,
    };
  }

  if (!activeToday && currentStreak === 0 && activeDays > 5) {
    return {
      emoji: "🌱",
      title: "Relancer le mouvement",
      message: `Pas d'activité récente, mais votre historique montre que vous en êtes capable. Une session aujourd'hui suffit à renouer avec votre rythme.`,
      accent: false,
    };
  }

  if (regularity30 >= 60) {
    return {
      emoji: "✨",
      title: "Régularité solide",
      message: `${regularity30}% de régularité ce mois — vous construisez quelque chose de durable. La constance est l'ingrédient que la plupart sous-estiment.`,
      accent: false,
    };
  }

  if (activeToday) {
    return {
      emoji: "⚡",
      title: "Journée active",
      message: `Vous avez déjà été actif aujourd'hui. C'est cela qui fait la différence sur la durée — pas l'intensité, mais la présence régulière.`,
      accent: false,
    };
  }

  return {
    emoji: "📖",
    title: "Un pas à la fois",
    message: `Chaque session, même courte, enrichit votre carte intellectuelle. Votre meilleur streak est de ${bestStreak} jours — rien ne vous empêche de vous en approcher à nouveau.`,
    accent: false,
  };
}

export default function HeatmapCoach({ stats, dayMap }) {
  const msg = buildCoachMessage(stats, dayMap);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-5 ${msg.accent
        ? "bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30"
        : "bg-card border-border"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${msg.accent ? "bg-accent/20" : "bg-secondary"}`}>
          {msg.emoji}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <Sparkles className={`w-3.5 h-3.5 ${msg.accent ? "text-accent" : "text-muted-foreground"}`} />
            <p className={`text-xs font-semibold uppercase tracking-wide ${msg.accent ? "text-accent" : "text-muted-foreground"}`}>
              {msg.title}
            </p>
          </div>
          <p className="text-sm text-foreground leading-relaxed mt-0.5">{msg.message}</p>
        </div>
      </div>
    </motion.div>
  );
}