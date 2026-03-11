import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const DAILY_CHALLENGES = [
  { text: "Lisez 20 pages aujourd'hui", kp: 15, icon: "📖" },
  { text: "Écoutez 30 minutes de podcast", kp: 20, icon: "🎧" },
  { text: "Regardez une vidéo éducative", kp: 15, icon: "🎬" },
  { text: "Lisez un article complet", kp: 10, icon: "📰" },
  { text: "Progressez sur un contenu en cours", kp: 12, icon: "🚀" },
  { text: "Ajoutez un nouveau contenu à votre liste", kp: 8, icon: "➕" },
  { text: "Complétez un contenu de moins de 30 min", kp: 25, icon: "⚡" },
];

export default function DailyChallenge() {
  const [done, setDone] = useState(false);
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const challenge = DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card rounded-xl border p-4 flex items-center gap-4 ${done ? "border-green-500/30 bg-green-500/5" : "border-accent/20 bg-gradient-to-r from-accent/5 to-primary/5"}`}
    >
      <div className="text-3xl shrink-0">{challenge.icon}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-bold text-accent uppercase tracking-wide">Mini-défi du jour</span>
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Réinitialise dans {24 - new Date().getHours()}h</span>
        </div>
        <p className="font-medium text-sm">{challenge.text}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <Zap className="w-3 h-3 text-accent" />
          <span className="text-xs text-accent font-medium">+{challenge.kp} KP</span>
        </div>
      </div>
      {done ? (
        <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium shrink-0">
          <CheckCircle2 className="w-5 h-5" /> Fait !
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setDone(true)} className="shrink-0 border-accent/30 text-accent hover:bg-accent/10">
          Valider
        </Button>
      )}
    </motion.div>
  );
}