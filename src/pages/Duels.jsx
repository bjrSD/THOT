import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Trophy, Clock, Plus, Loader2, Flame, Crown, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, differenceInDays, addDays } from "date-fns";
import { fr } from "date-fns/locale";

function DuelCard({ duel, currentEmail }) {
  const isChallenger = duel.challenger_email === currentEmail;
  const myKP = isChallenger ? duel.challenger_kp : duel.opponent_kp;
  const theirKP = isChallenger ? duel.opponent_kp : duel.challenger_kp;
  const opponent = isChallenger ? duel.opponent_email : duel.challenger_email;
  const totalKP = myKP + theirKP || 1;
  const myPct = Math.round((myKP / totalKP) * 100);
  const daysLeft = duel.end_date ? differenceInDays(new Date(duel.end_date), new Date()) : 0;
  const isWinning = myKP >= theirKP;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-accent" />
          <span className="font-semibold text-sm">Duel en cours</span>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
          duel.status === "active" ? "bg-green-500/10 text-green-600" :
          duel.status === "pending" ? "bg-yellow-500/10 text-yellow-600" :
          "bg-secondary text-muted-foreground"
        }`}>
          {duel.status === "active" ? "En cours" : duel.status === "pending" ? "En attente" : "Terminé"}
        </span>
      </div>

      {/* Players */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg mx-auto mb-1">
            {currentEmail?.[0]?.toUpperCase()}
          </div>
          <p className="text-xs font-medium truncate">Vous</p>
          <p className="text-xl font-black text-accent">{myKP}</p>
          <p className="text-xs text-muted-foreground">KP</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Swords className="w-6 h-6 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-bold">VS</span>
        </div>
        <div className="flex-1 text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center font-bold text-lg mx-auto mb-1">
            {opponent?.[0]?.toUpperCase()}
          </div>
          <p className="text-xs font-medium truncate">{opponent?.split("@")[0]}</p>
          <p className="text-xl font-black">{theirKP}</p>
          <p className="text-xs text-muted-foreground">KP</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="h-3 rounded-full bg-secondary overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${myPct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${isWinning ? "bg-gradient-to-r from-accent to-primary" : "bg-gradient-to-r from-muted-foreground/50 to-muted-foreground"}`}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{isWinning ? "🏆 Vous menez" : "En retard"}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {Math.max(0, daysLeft)}j restants</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Duels() {
  const [user, setUser] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [opponentEmail, setOpponentEmail] = useState("");
  const [duration, setDuration] = useState(7);
  const qc = useQueryClient();

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: duels = [], isLoading } = useQuery({
    queryKey: ["duels"],
    queryFn: () => base44.entities.Duel.list("-created_date", 20),
  });

  const createDuel = useMutation({
    mutationFn: (data) => base44.entities.Duel.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["duels"] }); setShowNew(false); setOpponentEmail(""); },
  });

  const handleCreate = () => {
    if (!opponentEmail || !user) return;
    const start = new Date();
    createDuel.mutate({
      challenger_email: user.email,
      opponent_email: opponentEmail,
      challenger_kp: 0,
      opponent_kp: 0,
      duration_days: duration,
      start_date: format(start, "yyyy-MM-dd"),
      end_date: format(addDays(start, duration), "yyyy-MM-dd"),
      status: "active",
    });
  };

  const myDuels = duels.filter(d => d.challenger_email === user?.email || d.opponent_email === user?.email);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-accent p-6 text-white">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute -right-8 -top-8 w-32 h-32 border-4 border-white/10 rounded-full" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Swords className="w-6 h-6" />
              <h1 className="font-heading text-2xl font-bold">Duels de savoir</h1>
            </div>
            <p className="text-white/80 text-sm">Défie tes amis. Le plus actif gagne des KP.</p>
          </div>
          <Button onClick={() => setShowNew(!showNew)} className="bg-white text-primary hover:bg-white/90 gap-2">
            <Plus className="w-4 h-4" /> Défier
          </Button>
        </div>
      </div>

      {/* New duel form */}
      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><Swords className="w-4 h-4 text-accent" /> Nouveau duel</h3>
            <div>
              <label className="text-sm font-medium block mb-1.5">Email de l'adversaire</label>
              <Input placeholder="ami@email.com" value={opponentEmail} onChange={e => setOpponentEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Durée : {duration} jours</label>
              <div className="flex gap-2">
                {[3, 7, 14, 30].map(d => (
                  <button key={d} onClick={() => setDuration(d)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${duration === d ? "bg-accent text-accent-foreground" : "bg-secondary hover:bg-secondary/80"}`}>
                    {d}j
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleCreate} disabled={!opponentEmail || createDuel.isPending} className="w-full gap-2">
              {createDuel.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}
              Lancer le duel
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Duels list */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
      ) : myDuels.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">⚔️</div>
          <p className="font-semibold text-lg">Aucun duel en cours</p>
          <p className="text-muted-foreground text-sm mt-1 mb-4">Défie un ami pour vous motiver mutuellement !</p>
          <Button onClick={() => setShowNew(true)} className="gap-2"><Plus className="w-4 h-4" /> Créer mon premier duel</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {myDuels.map(duel => <DuelCard key={duel.id} duel={duel} currentEmail={user?.email} />)}
        </div>
      )}

      {/* Leaderboard teaser */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold">Récompenses des duels</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "🏆", label: "Badge Duelliste", desc: "1er duel gagné" },
            { icon: "🔥", label: "+50 KP", desc: "Par duel gagné" },
            { icon: "👑", label: "Badge Maître", desc: "5 victoires" },
          ].map((r, i) => (
            <div key={i} className="bg-card rounded-xl p-3 text-center border border-border">
              <div className="text-2xl mb-1">{r.icon}</div>
              <p className="text-xs font-semibold">{r.label}</p>
              <p className="text-xs text-muted-foreground">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}