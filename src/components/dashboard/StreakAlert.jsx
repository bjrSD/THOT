import React from "react";
import { motion } from "framer-motion";
import { Flame, AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function StreakAlert({ streak }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || !streak) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative bg-gradient-to-r from-orange-500/15 to-red-500/10 border border-orange-500/30 rounded-2xl p-4 flex items-center gap-4"
    >
      <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
        <Flame className="w-5 h-5 text-orange-500" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">
          ⚠️ Votre streak de <span className="text-orange-500">{streak} jours</span> expire aujourd'hui !
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">Lisez quelques pages ou écoutez un podcast pour maintenir votre streak.</p>
      </div>
      <Link to={createPageUrl("Library")}>
        <Button size="sm" variant="outline" className="shrink-0 border-orange-500/30 text-orange-600 hover:bg-orange-500/10">
          Continuer
        </Button>
      </Link>
      <button onClick={() => setDismissed(true)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}