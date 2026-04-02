import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Zap, Moon, Sun, Coffee } from "lucide-react";

const DAY_NAMES = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const DAY_NAMES_FR = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

function generateInsights(dayMap, stats) {
  const insights = [];
  const today = new Date();

  // Count activity per weekday (0=Mon...6=Sun using fr convention)
  const weekdayActivity = Array(7).fill(0);
  const weekdayCount = Array(7).fill(0);

  Object.entries(dayMap).forEach(([dateStr, kp]) => {
    if (kp === 0) return;
    const d = new Date(dateStr);
    let dow = d.getDay(); // 0=Sun,1=Mon,...
    // convert to Mon=0...Sun=6
    const frDow = dow === 0 ? 6 : dow - 1;
    weekdayActivity[frDow] += kp;
    weekdayCount[frDow]++;
  });

  // Best and worst weekday
  const bestDowIdx = weekdayActivity.indexOf(Math.max(...weekdayActivity));
  const worstActiveDows = weekdayActivity.map((v, i) => ({ v, i })).filter(x => x.v > 0).sort((a, b) => a.v - b.v);
  const worstDowIdx = worstActiveDows.length > 0 ? worstActiveDows[0].i : -1;

  if (Math.max(...weekdayActivity) > 0) {
    const isWeekend = bestDowIdx >= 5;
    insights.push({
      icon: isWeekend ? Moon : Sun,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      text: `Vous êtes particulièrement actif le ${DAY_NAMES_FR[bestDowIdx]}. ${isWeekend ? "Vos week-ends sont très productifs — c'est votre meilleur territoire d'apprentissage." : "Votre dynamique est plus forte en semaine — signe d'une discipline établie."}`,
    });
  }

  if (worstDowIdx !== -1 && worstDowIdx !== bestDowIdx) {
    insights.push({
      icon: Coffee,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      text: `Le ${DAY_NAMES_FR[worstDowIdx]} est votre journée la moins active. C'est souvent une bonne occasion de créer un rendez-vous régulier avec un podcast ou un chapitre.`,
    });
  }

  // Compare last 30 days vs previous 30 days
  const now30 = new Date(today); now30.setDate(today.getDate() - 30);
  const prev30 = new Date(today); prev30.setDate(today.getDate() - 60);

  const recentDays = Object.entries(dayMap).filter(([d, kp]) => {
    const dt = new Date(d);
    return dt >= now30 && kp > 0;
  }).length;

  const prevDays = Object.entries(dayMap).filter(([d, kp]) => {
    const dt = new Date(d);
    return dt >= prev30 && dt < now30 && kp > 0;
  }).length;

  if (prevDays > 0) {
    const diff = recentDays - prevDays;
    if (diff > 3) {
      insights.push({
        icon: TrendingUp,
        color: "text-green-400",
        bg: "bg-green-500/10",
        text: `Vous avez été actif ${recentDays} jours ce mois-ci contre ${prevDays} le mois précédent. Belle progression — vous gagnez en régularité.`,
      });
    } else if (diff < -3) {
      insights.push({
        icon: TrendingDown,
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        text: `Votre activité ce mois-ci (${recentDays} jours) est en retrait par rapport au mois précédent (${prevDays} jours). Une légère reprise suffirait à renverser la tendance.`,
      });
    } else {
      insights.push({
        icon: Minus,
        color: "text-accent",
        bg: "bg-accent/10",
        text: `Votre rythme est stable : ${recentDays} jours actifs ce mois-ci, contre ${prevDays} le mois précédent. La constance est une force sous-estimée.`,
      });
    }
  }

  // Regularity coaching
  const reg = stats.regularity30;
  if (reg >= 70) {
    insights.push({
      icon: Zap,
      color: "text-accent",
      bg: "bg-accent/10",
      text: `${reg}% de régularité sur les 30 derniers jours — vous maintenez une discipline intellectuelle sérieuse. Continuez à ce rythme.`,
    });
  } else if (reg >= 40) {
    insights.push({
      icon: TrendingUp,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      text: `${reg}% de régularité sur 30 jours — votre dynamique s'installe progressivement. Vous êtes sur la bonne trajectoire.`,
    });
  } else if (reg > 0) {
    insights.push({
      icon: Minus,
      color: "text-muted-foreground",
      bg: "bg-secondary",
      text: `Votre régularité est encore en construction (${reg}% sur 30 jours). Même 10 minutes par jour peuvent transformer ce graphique en quelques semaines.`,
    });
  }

  // Streak insight
  if (stats.currentStreak >= 7) {
    insights.push({
      icon: Zap,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      text: `🔥 Streak de ${stats.currentStreak} jours en cours — c'est une excellente cadence. Votre régularité actuelle fait partie des meilleures que vous ayez maintenues.`,
    });
  } else if (stats.bestStreak > stats.currentStreak + 5) {
    insights.push({
      icon: TrendingUp,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      text: `Votre record est de ${stats.bestStreak} jours consécutifs. Vous en êtes à ${stats.currentStreak} — rien ne vous empêche de le dépasser.`,
    });
  }

  return insights.slice(0, 4);
}

export default function HeatmapInsights({ dayMap, stats }) {
  const insights = generateInsights(dayMap, stats);

  if (insights.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-accent" />
        <h3 className="font-semibold">Lecture de vos habitudes</h3>
      </div>
      <div className="space-y-3">
        {insights.map((ins, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40"
          >
            <div className={`w-7 h-7 rounded-lg ${ins.bg} flex items-center justify-center shrink-0 mt-0.5`}>
              <ins.icon className={`w-3.5 h-3.5 ${ins.color}`} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{ins.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}