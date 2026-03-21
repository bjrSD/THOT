import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Users, Clock, Zap, Loader2, CheckCircle2, X, MessageCircle, Send, TrendingUp, ChevronDown, ChevronUp, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

function ChallengeDetailPanel({ uc, challenge, onClose, currentUser }) {
  const qc = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [progressInput, setProgressInput] = useState(uc.progress || 0);
  const [expanded, setExpanded] = useState(true);

  const { data: comments = [] } = useQuery({
    queryKey: ["challenge-comments", challenge.id],
    queryFn: () => base44.entities.ChallengeComment.filter({ challenge_id: challenge.id }, "-created_date", 20),
  });

  const updateProgress = useMutation({
    mutationFn: (val) => base44.entities.UserChallenge.update(uc.id, {
      progress: val,
      is_completed: val >= challenge.goal_value,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-challenges"] });
      qc.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  const leaveChallenge = useMutation({
    mutationFn: () => base44.entities.UserChallenge.delete(uc.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-challenges"] });
      onClose();
    },
  });

  const addComment = useMutation({
    mutationFn: () => base44.entities.ChallengeComment.create({
      challenge_id: challenge.id,
      user_challenge_id: uc.id,
      text: newComment,
    }),
    onSuccess: () => {
      setNewComment("");
      qc.invalidateQueries({ queryKey: ["challenge-comments", challenge.id] });
    },
  });

  const percent = Math.min(100, Math.round((uc.progress / challenge.goal_value) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-card border border-accent/30 rounded-2xl overflow-hidden shadow-xl"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-accent/10 to-primary/10 p-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{challenge.icon || "🏆"}</span>
          <div>
            <h3 className="font-heading font-bold text-lg">{challenge.title}</h3>
            <p className="text-sm text-muted-foreground">{challenge.description}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progression</span>
            <span className="text-sm font-bold text-accent">{percent}%</span>
          </div>
          <Progress value={percent} className="h-3 mb-3" />
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={challenge.goal_value}
              value={progressInput}
              onChange={(e) => setProgressInput(Number(e.target.value))}
              className="w-28"
            />
            <span className="text-sm text-muted-foreground">/ {challenge.goal_value} {challenge.goal_unit}</span>
            <Button size="sm" onClick={() => updateProgress.mutate(progressInput)} disabled={updateProgress.isPending}>
              {updateProgress.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
              Mettre à jour
            </Button>
          </div>
          {uc.is_completed && (
            <div className="flex items-center gap-2 mt-2 text-green-600 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" /> Défi complété ! +{challenge.kp_reward} KP gagnés
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Clock, label: "Durée", value: `${challenge.duration_days}j` },
            { icon: Zap, label: "Récompense", value: `+${challenge.kp_reward} KP` },
            { icon: Users, label: "Participants", value: challenge.participants_count || 0 },
          ].map((s, i) => (
            <div key={i} className="bg-secondary/50 rounded-xl p-3 text-center">
              <s.icon className="w-4 h-4 text-accent mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="font-bold text-sm">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Comments */}
        <div>
          <button className="flex items-center gap-2 font-medium text-sm mb-3 hover:text-accent transition-colors" onClick={() => setExpanded(!expanded)}>
            <MessageCircle className="w-4 h-4" /> Commentaires ({comments.length})
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-3">
                {comments.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">Soyez le premier à commenter !</p>}
                {comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xs font-bold shrink-0">
                      {(c.created_by || "?")[0]?.toUpperCase()}
                    </div>
                    <div className="bg-secondary/50 rounded-xl px-3 py-2 flex-1">
                      <p className="text-xs font-medium text-accent">{c.created_by?.split("@")[0]}</p>
                      <p className="text-sm">{c.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.created_date && format(new Date(c.created_date), "d MMM à HH:mm", { locale: fr })}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input placeholder="Ajouter un commentaire..." value={newComment} onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && newComment.trim() && addComment.mutate()} className="text-sm" />
                  <Button size="icon" onClick={() => addComment.mutate()} disabled={!newComment.trim() || addComment.isPending}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Leave */}
        <Button variant="outline" size="sm" className="w-full text-red-500 border-red-500/30 hover:bg-red-500/10"
          onClick={() => leaveChallenge.mutate()} disabled={leaveChallenge.isPending}>
          <LogOut className="w-4 h-4 mr-2" />
          Quitter ce défi
        </Button>
      </div>
    </motion.div>
  );
}

export default function Challenges() {
  const queryClient = useQueryClient();
  const [selectedUc, setSelectedUc] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ["challenges"],
    queryFn: () => base44.entities.Challenge.list("-created_date", 50),
  });

  const { data: userChallenges = [] } = useQuery({
    queryKey: ["user-challenges"],
    queryFn: () => base44.entities.UserChallenge.list("-created_date", 50),
  });

  const joinMutation = useMutation({
    mutationFn: (challengeId) => base44.entities.UserChallenge.create({
      challenge_id: challengeId,
      start_date: new Date().toISOString().split("T")[0],
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-challenges"] }),
  });

  const joinedIds = userChallenges.map(uc => uc.challenge_id);

  const activeChallenges = userChallenges.filter(uc => !uc.is_completed);
  const completedChallenges = userChallenges.filter(uc => uc.is_completed);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }

  const selectedChallenge = selectedUc ? challenges.find(c => c.id === selectedUc.challenge_id) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Challenges</h1>
        <p className="text-muted-foreground mt-1">Relevez des défis et gagnez des Knowledge Points</p>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedUc && selectedChallenge && (
          <ChallengeDetailPanel
            uc={selectedUc}
            challenge={selectedChallenge}
            onClose={() => setSelectedUc(null)}
            currentUser={user}
          />
        )}
      </AnimatePresence>

      {/* Active challenges */}
      {activeChallenges.length > 0 && (
        <div>
          <h2 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" /> Mes défis en cours
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {activeChallenges.map((uc) => {
              const challenge = challenges.find(c => c.id === uc.challenge_id);
              if (!challenge) return null;
              const percent = Math.min(100, Math.round((uc.progress / challenge.goal_value) * 100));
              return (
                <motion.div key={uc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card
                    className="border-accent/20 bg-accent/5 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    onClick={() => setSelectedUc(selectedUc?.id === uc.id ? null : uc)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-2xl mb-1">{challenge.icon || "🏆"}</p>
                          <h3 className="font-heading font-bold">{challenge.title}</h3>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full font-medium">En cours</span>
                          <span className="text-xs text-muted-foreground">Cliquer pour gérer</span>
                        </div>
                      </div>
                      <Progress value={percent} className="h-2 mb-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{uc.progress} / {challenge.goal_value} {challenge.goal_unit}</span>
                        <span className="font-bold text-accent">{percent}%</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed */}
      {completedChallenges.length > 0 && (
        <div>
          <h2 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" /> Défis complétés
          </h2>
          <div className="grid md:grid-cols-3 gap-3">
            {completedChallenges.map((uc) => {
              const challenge = challenges.find(c => c.id === uc.challenge_id);
              if (!challenge) return null;
              return (
                <div key={uc.id} className="bg-green-500/5 border border-green-500/20 rounded-xl p-3 flex items-center gap-3">
                  <span className="text-2xl">{challenge.icon || "🏆"}</span>
                  <div>
                    <p className="font-medium text-sm">{challenge.title}</p>
                    <p className="text-xs text-green-600">+{challenge.kp_reward} KP gagnés ✅</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available challenges */}
      <div>
        <h2 className="font-heading font-semibold text-lg mb-4">Défis disponibles</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map((challenge, i) => {
            const isJoined = joinedIds.includes(challenge.id);
            const uc = userChallenges.find(u => u.challenge_id === challenge.id);
            return (
              <motion.div key={challenge.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-3xl">{challenge.icon || "🏆"}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3.5 h-3.5" />{challenge.participants_count || 0}
                      </div>
                    </div>
                    <h3 className="font-heading font-bold mb-1">{challenge.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-1">{challenge.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {challenge.duration_days} jours</span>
                      <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-accent" /> +{challenge.kp_reward} KP</span>
                    </div>
                    {isJoined ? (
                      <Button variant="secondary" size="sm" className="w-full" onClick={() => uc && setSelectedUc(uc)}>
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Gérer mon défi
                      </Button>
                    ) : (
                      <Button size="sm" className="w-full" disabled={joinMutation.isPending} onClick={() => joinMutation.mutate(challenge.id)}>
                        Rejoindre
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {challenges.length === 0 && (
        <div className="text-center py-16">
          <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun challenge disponible pour le moment.</p>
        </div>
      )}
    </div>
  );
}