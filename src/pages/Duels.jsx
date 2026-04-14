import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Trophy, Clock, Plus, Loader2, Flame, Crown, Search, ChevronRight, X, Check, BookOpen, Headphones, Play, Brain, Zap, TrendingUp, MessageCircle, Send } from "lucide-react";
import UserAvatar from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { format, differenceInDays, addDays } from "date-fns";
import { fr } from "date-fns/locale";

const DUEL_TYPES = [
  { id: "books", emoji: "📚", title: "Livres", desc: "Celui qui lit le plus de livres gagne", icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500/10" },
  { id: "podcasts", emoji: "🎧", title: "Podcasts", desc: "Le plus d'épisodes écoutés en X jours", icon: Headphones, color: "text-green-400", bg: "bg-green-500/10" },
  { id: "kp", emoji: "⚡", title: "Knowledge Points", desc: "Le plus de KP gagnés sur la période", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { id: "streak", emoji: "🔥", title: "Streak", desc: "Maintenir son streak le plus longtemps", icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10" },
  { id: "mixed", emoji: "🧠", title: "Polymathe", desc: "Combiner livres + podcasts + vidéos", icon: Brain, color: "text-purple-400", bg: "bg-purple-500/10" },
  { id: "videos", emoji: "🎬", title: "Vidéos éducatives", desc: "Le plus de vidéos regardées", icon: Play, color: "text-red-400", bg: "bg-red-500/10" },
];

const DUEL_IDEAS = [
  "📚 Lire 3 livres en 2 semaines",
  "🎧 50 épisodes de podcast en 1 mois",
  "⚡ 1000 KP en 7 jours",
  "🔥 Streak parfait sur 30 jours",
  "🧠 1 contenu de chaque type en 1 semaine",
  "📖 Terminer 2 biographies ce mois-ci",
];

const MOCK_PROFILES = [
  { name: "Marie Dupont", email: "marie@ex.com", level: "Polymathe 🧠", kp: 5420, streak: 42, photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face" },
  { name: "Karim Benzali", email: "karim@ex.com", level: "Érudit 🎓", kp: 4980, streak: 31, photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
  { name: "Sophie Laurent", email: "sophie@ex.com", level: "Érudit 🎓", kp: 4210, streak: 28, photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face" },
  { name: "Lucas Martin", email: "lucas@ex.com", level: "Penseur 💭", kp: 3890, streak: 15, photo: null },
  { name: "Amina Traoré", email: "amina@ex.com", level: "Penseur 💭", kp: 3650, streak: 22, photo: null },
  { name: "Jules Bernard", email: "jules@ex.com", level: "Lecteur 📖", kp: 3200, streak: 9, photo: null },
];

function DuelCard({ duel, currentEmail }) {
  const [expanded, setExpanded] = useState(false);
  const [showUpdateKP, setShowUpdateKP] = useState(false);
  const [kpInput, setKpInput] = useState("");
  const [taunt, setTaunt] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [taunts, setTaunts] = useState([]);
  const qc = useQueryClient();

  const isChallenger = duel.challenger_email === currentEmail;
  const myKP = isChallenger ? duel.challenger_kp : duel.opponent_kp;
  const theirKP = isChallenger ? duel.opponent_kp : duel.challenger_kp;
  const opponent = isChallenger ? duel.opponent_email : duel.challenger_email;
  const totalKP = myKP + theirKP || 1;
  const myPct = Math.round((myKP / totalKP) * 100);
  const daysLeft = duel.end_date ? Math.max(0, differenceInDays(new Date(duel.end_date), new Date())) : 0;
  const isWinning = myKP >= theirKP;
  const typeInfo = DUEL_TYPES.find(t => t.id === duel.duel_type) || DUEL_TYPES[2];

  const updateKP = useMutation({
    mutationFn: (newKP) => base44.entities.Duel.update(duel.id, isChallenger ? { challenger_kp: newKP } : { opponent_kp: newKP }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["duels"] }); setShowUpdateKP(false); setKpInput(""); },
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all">
      {/* Type badge */}
      <div className={`${typeInfo.bg} px-4 py-2 flex items-center gap-2 border-b border-border`}>
        <span className="text-lg">{typeInfo.emoji}</span>
        <span className="text-sm font-medium">{typeInfo.title}</span>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
          duel.status === "active" ? "bg-green-500/20 text-green-600" :
          duel.status === "pending" ? "bg-yellow-500/20 text-yellow-600" :
          "bg-secondary text-muted-foreground"
        }`}>
          {duel.status === "active" ? "⚔️ En cours" : duel.status === "pending" ? "⏳ En attente" : "🏁 Terminé"}
        </span>
      </div>

      <div className="p-5">
        {/* VS */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 text-center">
            <div className="mx-auto mb-1 flex justify-center">
              <UserAvatar name={currentEmail?.split("@")[0]} size="md" />
            </div>
            <p className="text-xs font-medium">Vous</p>
            <p className="text-2xl font-black text-accent">{myKP}</p>
            <p className="text-xs text-muted-foreground">KP</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Swords className="w-6 h-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-bold">VS</span>
          </div>
          <div className="flex-1 text-center">
            <div className="mx-auto mb-1 flex justify-center">
              <UserAvatar name={opponent?.split("@")[0]} size="md" />
            </div>
            <p className="text-xs font-medium truncate">{opponent?.split("@")[0]}</p>
            <p className="text-2xl font-black">{theirKP}</p>
            <p className="text-xs text-muted-foreground">KP</p>
          </div>
        </div>

        {/* Progress */}
        <Progress value={myPct} className="h-3 mb-2" />
        <div className="flex justify-between text-xs text-muted-foreground mb-4">
          <span>{isWinning ? "🏆 Vous menez" : "📉 En retard"}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {daysLeft}j restants</span>
        </div>

        {/* Actions row */}
        {duel.status === "active" && (
          <div className="flex gap-2 mb-3">
            <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs" onClick={() => setShowUpdateKP(!showUpdateKP)}>
              <TrendingUp className="w-3.5 h-3.5" /> Mettre à jour mes KP
            </Button>
            <Button size="sm" variant="ghost" className="gap-1 text-xs" onClick={() => setShowChat(!showChat)}>
              <MessageCircle className="w-3.5 h-3.5" /> Taquiner
            </Button>
          </div>
        )}

        {/* KP Update panel */}
        <AnimatePresence>
          {showUpdateKP && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="mb-3 p-3 bg-accent/5 rounded-xl border border-accent/20 space-y-2">
              <p className="text-xs font-medium text-accent">Mes KP actuels dans ce duel :</p>
              <div className="flex gap-2">
                <Input type="number" placeholder={`Actuel: ${myKP}`} value={kpInput} onChange={e => setKpInput(e.target.value)} className="text-sm" />
                <Button size="sm" onClick={() => updateKP.mutate(Number(kpInput))} disabled={!kpInput || updateKP.isPending}>
                  {updateKP.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "OK"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Taunt chat */}
        <AnimatePresence>
          {showChat && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="mb-3 p-3 bg-secondary/40 rounded-xl space-y-2">
              <p className="text-xs font-medium text-muted-foreground">💬 Envoyer un message à {opponent?.split("@")[0]}</p>
              {taunts.map((t, i) => (
                <div key={i} className="text-xs bg-card rounded-lg px-3 py-1.5 border border-border">
                  <span className="font-medium text-accent">Vous :</span> {t}
                </div>
              ))}
              <div className="flex gap-2">
                <Input placeholder="Bonne chance... 😏" value={taunt} onChange={e => setTaunt(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && taunt.trim()) { setTaunts(prev => [...prev, taunt]); setTaunt(""); } }}
                  className="text-xs" />
                <Button size="sm" variant="ghost" onClick={() => { if (taunt.trim()) { setTaunts(prev => [...prev, taunt]); setTaunt(""); } }}>
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand for details */}
        <button onClick={() => setExpanded(!expanded)} className="w-full text-xs text-accent hover:underline flex items-center justify-center gap-1">
          {expanded ? "Masquer les détails" : "Voir les détails"}
          <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Type de duel</span><span className="font-medium">{typeInfo.title}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Début</span><span>{duel.start_date && format(new Date(duel.start_date), "d MMM yyyy", { locale: fr })}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Fin</span><span>{duel.end_date && format(new Date(duel.end_date), "d MMM yyyy", { locale: fr })}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Durée</span><span>{duel.duration_days} jours</span></div>
              {duel.status === "completed" && duel.winner_email && (
                <div className="flex justify-between font-bold text-yellow-500">
                  <span>Gagnant</span>
                  <span>🏆 {duel.winner_email === currentEmail ? "Vous !" : duel.winner_email?.split("@")[0]}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function Duels() {
  const [user, setUser] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [step, setStep] = useState(1); // 1: type, 2: opponent, 3: config
  const [selectedType, setSelectedType] = useState(null);
  const [opponentSearch, setOpponentSearch] = useState("");
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [duration, setDuration] = useState(7);
  const qc = useQueryClient();

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: duels = [], isLoading } = useQuery({
    queryKey: ["duels"],
    queryFn: () => base44.entities.Duel.list("-created_date", 30),
  });

  const createDuel = useMutation({
    mutationFn: (data) => base44.entities.Duel.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["duels"] });
      setShowNew(false);
      setStep(1);
      setSelectedType(null);
      setSelectedOpponent(null);
      setOpponentSearch("");
    },
  });

  const filteredProfiles = MOCK_PROFILES.filter(p =>
    p.name.toLowerCase().includes(opponentSearch.toLowerCase()) ||
    p.email.toLowerCase().includes(opponentSearch.toLowerCase())
  );

  const handleCreate = () => {
    if (!selectedOpponent || !user || !selectedType) return;
    const start = new Date();
    createDuel.mutate({
      challenger_email: user.email,
      opponent_email: selectedOpponent.email,
      challenger_kp: 0,
      opponent_kp: 0,
      duration_days: duration,
      duel_type: selectedType.id,
      start_date: format(start, "yyyy-MM-dd"),
      end_date: format(addDays(start, duration), "yyyy-MM-dd"),
      status: "active",
    });
  };

  const myDuels = duels.filter(d => d.challenger_email === user?.email || d.opponent_email === user?.email);

  const stats = {
    active: myDuels.filter(d => d.status === "active").length,
    won: myDuels.filter(d => d.winner_email === user?.email).length,
    total: myDuels.length,
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-accent p-6 text-white">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute -right-8 -top-8 w-32 h-32 border-4 border-white/10 rounded-full" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Swords className="w-6 h-6" />
                <h1 className="font-heading text-2xl font-bold">Duels de savoir</h1>
              </div>
              <p className="text-white/80 text-sm">Défie tes amis. Le plus actif gagne.</p>
            </div>
            <Button onClick={() => setShowNew(!showNew)} className="bg-white text-primary hover:bg-white/90 gap-2">
              <Plus className="w-4 h-4" /> Défier
            </Button>
          </div>
          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "En cours", value: stats.active, icon: "⚔️" },
              { label: "Victoires", value: stats.won, icon: "🏆" },
              { label: "Total", value: stats.total, icon: "📊" },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-2.5 text-center">
                <p className="text-lg">{s.icon}</p>
                <p className="font-black text-lg">{s.value}</p>
                <p className="text-xs text-white/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New duel wizard */}
      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2"><Swords className="w-4 h-4 text-accent" /> Créer un duel — Étape {step}/3</h3>
              <button onClick={() => { setShowNew(false); setStep(1); }} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>

            {/* Step indicator */}
            <div className="flex border-b border-border">
              {["Type", "Adversaire", "Configurer"].map((s, i) => (
                <div key={i} className={`flex-1 py-2 text-center text-xs font-medium transition-colors ${step === i + 1 ? "bg-accent/10 text-accent border-b-2 border-accent" : step > i + 1 ? "text-green-500" : "text-muted-foreground"}`}>
                  {step > i + 1 ? "✓ " : ""}{s}
                </div>
              ))}
            </div>

            <div className="p-5">
              {/* Step 1: Choose type */}
              {step === 1 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">Choisissez le type de duel :</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {DUEL_TYPES.map(type => (
                      <button key={type.id} onClick={() => setSelectedType(type)}
                        className={`p-3 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                          selectedType?.id === type.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"
                        }`}>
                        <span className="text-2xl">{type.emoji}</span>
                        <p className="font-semibold text-sm mt-1">{type.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{type.desc}</p>
                      </button>
                    ))}
                  </div>
                  <Button className="w-full mt-4 gap-2" onClick={() => setStep(2)} disabled={!selectedType}>
                    Continuer <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Step 2: Choose opponent */}
              {step === 2 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Recherchez un profil ou entrez un email :</p>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Nom ou email..." value={opponentSearch} onChange={(e) => setOpponentSearch(e.target.value)} className="pl-9" />
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {filteredProfiles.map(p => (
                      <button key={p.email} onClick={() => setSelectedOpponent(p)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                          selectedOpponent?.email === p.email ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"
                        }`}>
                        <UserAvatar user={{ full_name: p.name, avatar_url: p.photo }} size="md" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.level} · {p.kp.toLocaleString()} KP · 🔥 {p.streak}j</p>
                        </div>
                        {selectedOpponent?.email === p.email && <Check className="w-4 h-4 text-accent shrink-0" />}
                      </button>
                    ))}
                    {/* Manual email entry */}
                    {opponentSearch.includes("@") && !filteredProfiles.some(p => p.email === opponentSearch) && (
                      <button onClick={() => setSelectedOpponent({ name: opponentSearch, email: opponentSearch, level: "?", kp: 0, streak: 0, photo: null })}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                          selectedOpponent?.email === opponentSearch ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"
                        }`}>
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold">@</div>
                        <div>
                          <p className="font-medium text-sm">{opponentSearch}</p>
                          <p className="text-xs text-muted-foreground">Inviter par email</p>
                        </div>
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" onClick={() => setStep(1)}>Retour</Button>
                    <Button className="flex-1 gap-2" onClick={() => setStep(3)} disabled={!selectedOpponent}>
                      Continuer <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Configure */}
              {step === 3 && selectedType && selectedOpponent && (
                <div className="space-y-4">
                  <div className="bg-secondary/50 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Type</span><span className="font-medium">{selectedType.emoji} {selectedType.title}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Adversaire</span><span className="font-medium">{selectedOpponent.name}</span></div>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">Durée du duel :</label>
                    <div className="flex gap-2 flex-wrap">
                      {[3, 7, 14, 30].map(d => (
                        <button key={d} onClick={() => setDuration(d)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${duration === d ? "bg-accent text-accent-foreground" : "bg-secondary hover:bg-secondary/80"}`}>
                          {d} jours
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Duel idea */}
                  <div className="bg-accent/5 border border-accent/20 rounded-xl p-3">
                    <p className="text-xs text-accent font-medium mb-1">💡 Idée de défi</p>
                    <p className="text-sm">{DUEL_IDEAS[Math.floor(Math.random() * DUEL_IDEAS.length)]}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(2)}>Retour</Button>
                    <Button className="flex-1 gap-2" onClick={handleCreate} disabled={createDuel.isPending}>
                      {createDuel.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}
                      Lancer le duel !
                    </Button>
                  </div>
                </div>
              )}
            </div>
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
        <>
          <div>
            <h2 className="font-semibold text-lg mb-3 flex items-center gap-2"><Swords className="w-5 h-5 text-accent" /> Mes duels actifs</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {myDuels.filter(d => d.status === "active").map(duel => <DuelCard key={duel.id} duel={duel} currentEmail={user?.email} />)}
              {myDuels.filter(d => d.status === "active").length === 0 && (
                <p className="text-sm text-muted-foreground col-span-2 text-center py-4">Aucun duel actif. Lance un nouveau duel !</p>
              )}
            </div>
          </div>
          {myDuels.filter(d => d.status !== "active").length > 0 && (
            <div>
              <h2 className="font-semibold text-lg mb-3 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Historique</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {myDuels.filter(d => d.status !== "active").map(duel => <DuelCard key={duel.id} duel={duel} currentEmail={user?.email} />)}
              </div>
            </div>
          )}
        </>
      )}

      {/* Rewards */}
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