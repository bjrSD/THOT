import React, { useState } from "react";
import { Trophy, Plus, Users, User, Target, Loader2, X, Bell, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const CHALLENGE_ICONS = ["📚", "🎯", "🎧", "🎬", "📰", "🧠", "🔥", "⚡", "🌟", "💡", "🏆", "🚀"];

export default function ClubChallenges({ club, clubChallenges = [], canCreate, isMember }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", type: "collaborative", goal_value: "", goal_unit: "books",
    duration_days: 30, kp_reward: 50, icon: "📚",
  });
  const qc = useQueryClient();

  // My participations
  const { data: myUserChallenges = [] } = useQuery({
    queryKey: ["my-user-challenges"],
    queryFn: () => base44.entities.UserChallenge.list("-created_date", 100),
  });

  const joinedChallengeIds = new Set(myUserChallenges.map(uc => uc.challenge_id));

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const challenge = await base44.entities.Challenge.create({
        title: data.title,
        description: `[Club: ${club.name}] ${data.description}`,
        type: data.type === "collaborative" ? "mixed" : "reading",
        goal_value: Number(data.goal_value) || 1,
        goal_unit: data.goal_unit,
        duration_days: Number(data.duration_days),
        kp_reward: Number(data.kp_reward),
        icon: data.icon,
        is_active: true,
        participants_count: 0,
      });
      // Create notification for club members
      await base44.entities.Notification.create({
        recipient_email: "all",
        type: "challenge_completed",
        title: `Nouveau défi dans ${club.name} ${club.emoji || ""}`,
        body: `${data.icon} "${data.title}" — Rejoignez le défi du club !`,
        action_url: `/ClubDetail?id=${club.id}&tab=defis`,
        meta: JSON.stringify({ club_id: club.id, challenge_id: challenge.id }),
      });
      return challenge;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["club-challenges", club.id] });
      qc.invalidateQueries({ queryKey: ["challenges"] });
      setShowForm(false);
      setForm({ title: "", description: "", type: "collaborative", goal_value: "", goal_unit: "books", duration_days: 30, kp_reward: 50, icon: "📚" });
      toast.success("Défi créé et membres notifiés ! 🎯");
    },
  });

  const participateMutation = useMutation({
    mutationFn: async (challenge) => {
      // Join the challenge
      await base44.entities.UserChallenge.create({
        challenge_id: challenge.id,
        progress: 0,
        start_date: new Date().toISOString().split("T")[0],
        is_completed: false,
      });
      // Increment participants
      await base44.entities.Challenge.update(challenge.id, {
        participants_count: (challenge.participants_count || 0) + 1,
      });
      // Schedule reminder notification
      await base44.entities.Notification.create({
        recipient_email: "self",
        type: "challenge_completed",
        title: `Rappel : Défi "${challenge.title}"`,
        body: `N'oublie pas ton défi dans le club ${club.name} ${club.emoji || ""} ! Objectif : ${challenge.goal_value} ${challenge.goal_unit}`,
        action_url: `/Challenges`,
        meta: JSON.stringify({ club_id: club.id, challenge_id: challenge.id }),
      });
    },
    onSuccess: (_, challenge) => {
      qc.invalidateQueries({ queryKey: ["my-user-challenges"] });
      qc.invalidateQueries({ queryKey: ["club-challenges", club.id] });
      qc.invalidateQueries({ queryKey: ["challenges"] });
      toast.success(`Tu participes au défi ! 🏆 Il apparaît maintenant dans tes Défis.`);
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Trophy className="w-4 h-4 text-accent" /> Défis du club
          <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{clubChallenges.length}</span>
        </h3>
        <div className="flex items-center gap-2">
          <Link to="/Challenges">
            <Button size="sm" variant="ghost" className="gap-1 text-xs text-muted-foreground">
              Voir tous mes défis <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
          {canCreate && !showForm && (
            <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> Créer un défi
            </Button>
          )}
        </div>
      </div>

      {/* Club badge info */}
      <div className="flex items-center gap-2 p-3 bg-accent/5 border border-accent/20 rounded-xl text-xs text-accent">
        <Bell className="w-3.5 h-3.5 shrink-0" />
        <span>Les défis que vous rejoignez ici s'ajoutent à votre page <strong>Défis</strong> avec un rappel automatique.</span>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">Nouveau défi pour {club.name}</p>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Icône</label>
            <div className="flex flex-wrap gap-2">
              {CHALLENGE_ICONS.map(ic => (
                <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${form.icon === ic ? "bg-accent/20 ring-2 ring-accent" : "bg-secondary hover:bg-secondary/80"}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Titre *</label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Lire 5 livres en 30 jours" />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2} placeholder="Décrivez le défi..."
              className="w-full px-3 py-2 rounded-xl border border-input bg-transparent text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground" />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Type de défi</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "collaborative", label: "Collaboratif", Icon: Users, desc: "L'équipe atteint l'objectif ensemble" },
                { value: "solo", label: "Chacun pour soi", Icon: User, desc: "Chaque membre atteint son propre objectif" },
              ].map(t => (
                <button key={t.value} onClick={() => setForm(f => ({ ...f, type: t.value }))}
                  className={`flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition-all ${form.type === t.value ? "border-accent bg-accent/10" : "border-border hover:border-accent/40"}`}>
                  <div className="flex items-center gap-1.5">
                    <t.Icon className={`w-4 h-4 ${form.type === t.value ? "text-accent" : "text-muted-foreground"}`} />
                    <span className="text-sm font-semibold">{t.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Objectif</label>
              <Input type="number" value={form.goal_value} onChange={e => setForm(f => ({ ...f, goal_value: e.target.value }))} placeholder="Ex: 5" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Unité</label>
              <select value={form.goal_unit} onChange={e => setForm(f => ({ ...f, goal_unit: e.target.value }))}
                className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="books">Livres</option>
                <option value="episodes">Épisodes</option>
                <option value="hours">Heures</option>
                <option value="pages">Pages</option>
                <option value="contents">Contenus</option>
                <option value="days">Jours</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Durée (jours)</label>
              <Input type="number" value={form.duration_days} onChange={e => setForm(f => ({ ...f, duration_days: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Récompense KP</label>
              <Input type="number" value={form.kp_reward} onChange={e => setForm(f => ({ ...f, kp_reward: e.target.value }))} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)} className="flex-1">Annuler</Button>
            <Button size="sm" onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending || !form.title.trim() || !form.goal_value}
              className="flex-1">
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer le défi 🎯"}
            </Button>
          </div>
        </div>
      )}

      {/* Challenges list */}
      {clubChallenges.length === 0 && !showForm ? (
        <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-sm text-muted-foreground">Aucun défi actif pour ce club.</p>
          {canCreate && <p className="text-xs text-muted-foreground mt-1">Créez le premier défi pour motiver les membres !</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {clubChallenges.map((c, i) => {
            const isJoined = joinedChallengeIds.has(c.id);
            return (
              <div key={c.id || i} className={`bg-card border rounded-xl p-4 hover:shadow-sm transition-shadow ${isJoined ? "border-accent/40 bg-accent/[0.02]" : "border-border"}`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{c.icon || "🏆"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-sm">{c.title}</p>
                      {/* Club badge */}
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-500/10 text-purple-600 flex items-center gap-1">
                        {club.emoji} {club.name}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.type === "mixed" ? "bg-blue-500/10 text-blue-600" : "bg-orange-500/10 text-orange-600"}`}>
                        {c.type === "mixed" ? "👥 Collaboratif" : "🏃 Solo"}
                      </span>
                      {isJoined && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-green-500/10 text-green-600">✓ Vous participez</span>}
                    </div>
                    {c.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {c.description.replace(/\[Club:[^\]]+\]\s*/g, "")}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {c.goal_value} {c.goal_unit}</span>
                      <span>⏱️ {c.duration_days}j</span>
                      <span className="text-accent font-semibold">+{c.kp_reward} KP</span>
                      {c.participants_count > 0 && <span>👥 {c.participants_count} participants</span>}
                    </div>
                  </div>
                  {isMember && !isJoined && (
                    <Button size="sm" onClick={() => participateMutation.mutate(c)}
                      disabled={participateMutation.isPending}
                      className="shrink-0 text-xs">
                      {participateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Participer"}
                    </Button>
                  )}
                  {isJoined && (
                    <Link to="/Challenges">
                      <Button size="sm" variant="outline" className="shrink-0 text-xs gap-1">
                        <Check className="w-3 h-3 text-green-500" /> Voir ma progression
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}