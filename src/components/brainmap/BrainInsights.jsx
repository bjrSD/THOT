import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Lightbulb } from "lucide-react";

function generateInsights(domainScores, contents, DOMAIN_META) {
  const insights = [];
  const sorted = Object.entries(domainScores)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) return [];

  const total = sorted.reduce((s, [, v]) => s + v, 0);
  const topShare = sorted[0] ? Math.round((sorted[0][1] / total) * 100) : 0;
  const top1Label = DOMAIN_META[sorted[0]?.[0]]?.label || "";
  const top1Emoji = DOMAIN_META[sorted[0]?.[0]]?.emoji || "";

  if (topShare > 60) {
    insights.push({
      icon: TrendingUp,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      text: `Votre profil est fortement centré sur ${top1Label} (${topShare}% de votre score total). Une vraie signature intellectuelle.`,
    });
  } else if (topShare < 35 && sorted.length >= 3) {
    insights.push({
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-500/10",
      text: `Votre profil gagne en équilibre : votre curiosité se répartit sur ${sorted.length} domaines différents. Signe d'un esprit polymathe en construction.`,
    });
  }

  const recentContents = [...contents]
    .filter(c => c.status === "completed" && c.completed_date)
    .sort((a, b) => new Date(b.completed_date) - new Date(a.completed_date))
    .slice(0, 8);

  const recentDomainCount = {};
  recentContents.forEach(c => {
    if (c.category) recentDomainCount[c.category] = (recentDomainCount[c.category] || 0) + 1;
  });
  const recentTop = Object.entries(recentDomainCount).sort((a, b) => b[1] - a[1])[0];
  if (recentTop && DOMAIN_META[recentTop[0]]) {
    const label = DOMAIN_META[recentTop[0]].label;
    const emoji = DOMAIN_META[recentTop[0]].emoji;
    insights.push({
      icon: TrendingUp,
      color: "text-accent",
      bg: "bg-accent/10",
      text: `Votre dynamique récente renforce la ${label} ${emoji} — vous y avez terminé ${recentTop[1]} contenu${recentTop[1] > 1 ? "s" : ""} récemment.`,
    });
  }

  const zeroDomains = Object.entries(domainScores)
    .filter(([, v]) => v === 0)
    .slice(0, 1)
    .map(([k]) => ({ key: k, ...DOMAIN_META[k] }));

  if (zeroDomains.length > 0) {
    const d = zeroDomains[0];
    insights.push({
      icon: Minus,
      color: "text-muted-foreground",
      bg: "bg-secondary",
      text: `La ${d.label} ${d.emoji} est encore un territoire vierge sur votre carte. Ce pourrait être une prochaine exploration stimulante.`,
    });
  }

  if (sorted.length >= 2) {
    const ratio = sorted[0][1] / Math.max(sorted[1][1], 1);
    if (ratio > 3) {
      const sec = DOMAIN_META[sorted[1][0]];
      insights.push({
        icon: TrendingDown,
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        text: `Votre domaine secondaire ${sec?.label} ${sec?.emoji} est encore très en retrait par rapport à votre point fort. Un rééquilibrage progressif l'enrichirait.`,
      });
    }
  }

  const humanDomains = ["philosophie", "psychologie", "histoire", "art"];
  const sciDomains = ["science", "technologie"];
  const humanScore = humanDomains.reduce((s, k) => s + (domainScores[k] || 0), 0);
  const sciScore = sciDomains.reduce((s, k) => s + (domainScores[k] || 0), 0);

  if (humanScore > 0 && sciScore > 0) {
    const dominance = humanScore > sciScore ? "sciences humaines" : "sciences exactes et techniques";
    insights.push({
      icon: Lightbulb,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      text: `Votre orientation intellectuelle penche vers les ${dominance}. Cette inclinaison structure votre façon d'apprendre et de raisonner.`,
    });
  }

  return insights.slice(0, 4);
}

export default function BrainInsights({ domainScores, contents, DOMAIN_META }) {
  const insights = generateInsights(domainScores, contents, DOMAIN_META);

  if (insights.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-400" />
        <h3 className="font-semibold">Insights de votre trajectoire</h3>
      </div>
      <div className="space-y-3">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40"
          >
            <div className={`w-7 h-7 rounded-lg ${insight.bg} flex items-center justify-center shrink-0 mt-0.5`}>
              <insight.icon className={`w-3.5 h-3.5 ${insight.color}`} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{insight.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}