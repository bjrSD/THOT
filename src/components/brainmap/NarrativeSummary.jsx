import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

function buildNarrative(domainScores, DOMAIN_META) {
  const sorted = Object.entries(domainScores)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    return {
      title: "Votre carte est encore vierge",
      lines: [
        "Vous n'avez pas encore terminé de contenus pour alimenter votre carte.",
        "Commencez par marquer un livre, un podcast ou une vidéo comme terminé pour voir votre profil prendre forme.",
      ],
    };
  }

  const [top1, top2, top3] = sorted;
  const totalActive = sorted.length;
  const top1Label = DOMAIN_META[top1[0]]?.label || top1[0];
  const top2Label = top2 ? DOMAIN_META[top2[0]]?.label || top2[0] : null;
  const top3Label = top3 ? DOMAIN_META[top3[0]]?.label || top3[0] : null;

  const isBalanced = sorted.length >= 4 && top1[1] < sorted[1][1] * 3;
  const isSpecialized = sorted.length <= 2 || top1[1] > (sorted[1]?.[1] || 0) * 4;

  let title = `Un esprit ancré dans ${top1Label}`;
  if (isBalanced) title = "Un esprit curieux et équilibré";
  if (isSpecialized) title = `Un profil spécialisé : ${top1Label}`;

  const lines = [];

  lines.push(
    `Votre carte est actuellement dominée par la ${top1Label}${top2Label ? ` et la ${top2Label}` : ""}, qui représentent le cœur de vos explorations intellectuelles.`
  );

  if (top3Label) {
    lines.push(`La ${top3Label} constitue une dimension secondaire solide, enrichissant votre profil d'une perspective complémentaire.`);
  }

  if (isBalanced) {
    lines.push(
      `Votre curiosité est remarquablement transversale : vous construisez un profil rare, capable de relier des disciplines différentes. C'est la marque d'un esprit polymathique en devenir.`
    );
  } else if (isSpecialized) {
    lines.push(
      `Vous avez fait le choix — conscient ou non — de creuser profondément plutôt que de s'éparpiller. Cette spécialisation est une force : elle vous donne une maîtrise et un point de vue que peu possèdent.`
    );
  } else {
    lines.push(
      `Vous développez progressivement plusieurs axes, en maintenant un ancrage fort sur vos domaines de prédilection. Ce profil combine expertise ciblée et ouverture d'esprit.`
    );
  }

  const weakDomains = Object.entries(domainScores)
    .filter(([, v]) => v === 0)
    .slice(0, 2)
    .map(([k]) => DOMAIN_META[k]?.label)
    .filter(Boolean);

  if (weakDomains.length > 0) {
    lines.push(
      `Des territoires encore peu explorés — comme la ${weakDomains[0]}${weakDomains[1] ? ` ou la ${weakDomains[1]}` : ""} — représentent des potentiels de croissance à votre portée.`
    );
  }

  return { title, lines };
}

export default function NarrativeSummary({ domainScores, DOMAIN_META }) {
  const { title, lines } = buildNarrative(domainScores, DOMAIN_META);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-gradient-to-br from-purple-500/10 via-card to-accent/5 border border-purple-500/20 rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="font-semibold text-base">Lecture de votre profil</h3>
      </div>
      <p className="font-heading font-bold text-lg text-foreground mb-3">{title}</p>
      <div className="space-y-2">
        {lines.map((line, i) => (
          <p key={i} className="text-sm text-muted-foreground leading-relaxed">{line}</p>
        ))}
      </div>
    </motion.div>
  );
}