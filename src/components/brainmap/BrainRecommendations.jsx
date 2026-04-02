import React from "react";
import { motion } from "framer-motion";
import { Compass, ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const DIVERSIFICATION_TIPS = {
  philosophie: "Explorez la philo pour mieux comprendre vos propres valeurs et affiner votre sens critique.",
  science: "Un peu de science éclaire le monde d'une façon que rien d'autre ne peut remplacer.",
  business: "Comprendre les mécanismes économiques vous donnera un avantage décisif dans votre vie professionnelle.",
  technologie: "La tech façonne le monde d'aujourd'hui — la connaître vous rend plus agile et plus pertinent.",
  histoire: "L'histoire est le meilleur laboratoire du futur : elle donne du recul et une profondeur rare.",
  psychologie: "Mieux comprendre les autres (et vous-même) est peut-être le levier le plus puissant qui soit.",
  art: "L'art développe une sensibilité et une créativité que les livres analytiques ne peuvent pas apporter seuls.",
  sante: "Investir dans votre compréhension de la santé, c'est investir dans le capital le plus précieux qui soit.",
};

export default function BrainRecommendations({ domainScores, DOMAIN_META }) {
  const sorted = Object.entries(domainScores).sort((a, b) => a[1] - b[1]);
  const weakest = sorted.slice(0, 3).map(([k]) => k);
  const strongest = Object.entries(domainScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 1)
    .map(([k]) => k)[0];

  const recs = weakest
    .filter(k => DOMAIN_META[k])
    .map(k => ({
      key: k,
      meta: DOMAIN_META[k],
      tip: DIVERSIFICATION_TIPS[k],
      score: domainScores[k] || 0,
    }));

  const complementary = getComplementary(strongest);

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <Compass className="w-5 h-5 text-accent" />
        <h3 className="font-semibold">Pistes d'évolution</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Pour enrichir et équilibrer votre carte, voici les zones qui méritent votre attention.
      </p>

      <div className="space-y-3">
        {recs.map((rec, i) => (
          <motion.div
            key={rec.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-3 p-3.5 rounded-xl border border-border hover:border-accent/30 hover:bg-accent/5 transition-all group"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
              style={{ backgroundColor: rec.meta.color + "18", border: `1px solid ${rec.meta.color}30` }}
            >
              {rec.meta.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="font-medium text-sm">{rec.meta.label}</p>
                <span className="text-xs text-muted-foreground">{rec.score === 0 ? "Non exploré" : `${rec.score} pts`}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{rec.tip}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {complementary && (
        <div className="mt-4 p-3 rounded-xl bg-accent/8 border border-accent/20">
          <p className="text-xs text-accent font-medium mb-1">💡 Conseil personnalisé</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{complementary}</p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border">
        <Link to={createPageUrl("Discover")} className="flex items-center justify-between text-sm text-accent font-medium hover:opacity-80 transition-opacity">
          Découvrir des contenus pour enrichir votre carte
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function getComplementary(dominant) {
  const pairs = {
    philosophie: "Votre ancrage philosophique se renforcerait avec un peu de psychologie — les deux disciplines se parlent naturellement.",
    science: "Un ancrage solide en science gagne en profondeur lorsqu'il est irrigué par la philosophie ou l'histoire des sciences.",
    business: "La psychologie comportementale est la compagne idéale du business — elle transforme la stratégie en compréhension humaine.",
    technologie: "Croiser la tech avec la philosophie ou l'éthique vous donnera un avantage rare : la capacité à questionner ce que vous construisez.",
    histoire: "L'histoire seule raconte le passé. Associée à la psychologie ou la philosophie, elle devient un outil de compréhension du présent.",
    psychologie: "La psychologie combinée à la philosophie ou à la neuroscience crée un profil d'une richesse rare.",
    art: "L'art prend une nouvelle dimension quand il est croisé avec l'histoire ou la philosophie. C'est là que naît le vrai sens critique.",
    sante: "La santé, associée à la psychologie, ouvre vers une vision holistique de l'être humain que peu de profils atteignent.",
  };
  return pairs[dominant] || null;
}