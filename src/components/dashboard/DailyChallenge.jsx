import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, CheckCircle2, Clock, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const DAILY_CHALLENGES = [
  { text: "Lisez 20 pages aujourd'hui", kp: 15, icon: "📖", type: "reading", goal_value: 20, goal_unit: "pages" },
  { text: "Écoutez 30 minutes de podcast", kp: 20, icon: "🎧", type: "podcast", goal_value: 30, goal_unit: "hours" },
  { text: "Regardez une vidéo éducative", kp: 15, icon: "🎬", type: "video", goal_value: 1, goal_unit: "contents" },
  { text: "Lisez un article complet", kp: 10, icon: "📰", type: "mixed", goal_value: 1, goal_unit: "contents" },
  { text: "Progressez sur un contenu en cours", kp: 12, icon: "🚀", type: "mixed", goal_value: 1, goal_unit: "contents" },
  { text: "Ajoutez un nouveau contenu à votre liste", kp: 8, icon: "➕", type: "mixed", goal_value: 1, goal_unit: "contents" },
  { text: "Complétez un contenu de moins de 30 min", kp: 25, icon: "⚡", type: "mixed", goal_value: 1, goal_unit: "contents" },
];

const STORAGE_KEY = "thot-daily-challenge-done";

export default function DailyChallenge() {
  const todayKey = new Date().toISOString().split("T")[0];
  const [done, setDone] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === todayKey; } catch { return false; }
  });
  const [accepting, setAccepting] = useState(false);
  const qc = useQueryClient();

  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const challenge = DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      // Create a real UserChallenge record
      await base44.entities.UserChallenge.create({
        challenge_id: `daily-${todayKey}`,
        progress: 0,
        start_date: todayKey,
        is_completed: false,
      });
      // Log activity
      await base44.entities.Activity.create({
        action: "challenge_joined",
        details: `Défi du jour accepté : ${challenge.text}`,
        kp_earned: 0,
        is_public: true,
      });
    },
    onSuccess: () => {
      localStorage.setItem(STORAGE_KEY, todayKey);
      setDone(true);
      qc.invalidateQueries({ queryKey: ["activities"] });
      toast.success(`Défi accepté ! Bonne chance 🎯`);
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border px-4 py-2.5 flex items-center gap-3 ${done ? "border-green-500/30 bg-green-500/5" : "border-accent/20 bg-gradient-to-r from-accent/5 to-primary/5"}`}
    >
      <span className="text-xl shrink-0">{challenge.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[10px] font-bold text-accent uppercase tracking-wide">Défi du jour</span>
          <span className="text-[10px] text-muted-foreground">· {24 - new Date().getHours()}h restantes</span>
        </div>
        <p className="font-medium text-xs leading-snug truncate">{challenge.text}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Zap className="w-3 h-3 text-accent" />
        <span className="text-xs text-accent font-bold">+{challenge.kp} KP</span>
      </div>
      {done ? (
        <div className="flex items-center gap-1 text-green-600 text-xs font-semibold shrink-0">
          <CheckCircle2 className="w-4 h-4" /> Accepté
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={() => acceptMutation.mutate()} disabled={acceptMutation.isPending}
          className="shrink-0 border-accent/30 text-accent hover:bg-accent/10 h-7 text-xs px-2.5">
          Accepter
        </Button>
      )}
    </motion.div>
  );
}