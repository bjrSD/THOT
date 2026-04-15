import React, { useState } from "react";
import { Trophy, Plus, Users, User, Target, Loader2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const CHALLENGE_ICONS = ["📚", "🎯", "🎧", "🎬", "📰", "🧠", "🔥", "⚡", "🌟", "💡", "🏆", "🚀"];

export default function ClubChallenges({ club, challenges, canCreate, isMember, onJoin }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", type: "collaborative", goal_value: "", goal_unit: "books",
    duration_days: 30, kp_reward: 50, icon: "📚",
  });
  const qc = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Challenge.create({
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
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["club-challenges", club.id] });
      setShowForm(false);
      setForm({ title: "", description: "", type: "collaborative", goal_value: "", goal_unit: "books", duration_days: 30, kp_reward: 50, icon: "📚" });
      toast.success("Défi créé ! 🎯");
    },
  });

  const allChallenges = challenges || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2"><Trophy className="w-4 h-4 text-accent" /> Défis du club</h3>
        {canCreate && !showForm && (
          <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" /> Créer un défi
          </Button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">Nouveau défi</p>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>

          {/* Icon picker */}
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

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Titre *</label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Lire 5 livres en 30 jours" />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2} placeholder="Décrivez le défi..."
              className="w-full px-3 py-2 rounded-xl border border-input bg-transparent text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground" />
          </div>

          {/* Type */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Type de défi</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "collaborative", label: "Collaboratif", icon: Users, desc: "L'équipe atteint l'objectif ensemble" },
                { value: "solo", label: "Chacun pour soi", icon: User, desc: "Chaque membre atteint son propre objectif" },
              ].map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.value} onClick={() => setForm(f => ({ ...f, type: t.value }))}
                    className={`flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition-all ${form.type === t.value ? "border-accent bg-accent/10" : "border-border hover:border-accent/40"}`}>
                    <div className="flex items-center gap-1.5">
                      <Icon className={`w-4 h-4 ${form.type === t.value ? "text-accent" : "text-muted-foreground"}`} />
                      <span className="text-sm font-semibold">{t.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Goal */}
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

          {/* Duration & KP */}
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
      {allChallenges.length === 0 && !showForm ? (
        <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-sm text-muted-foreground">Aucun défi actif pour ce club.</p>
          {canCreate && <p className="text-xs text-muted-foreground mt-1">Créez le premier défi pour motiver les membres !</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {allChallenges.map((c, i) => {
            const isCollab = c.description?.includes("[Club:");
            return (
              <div key={c.id || i} className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-3">
                  <span className="text-3xl shrink-0">{c.icon || "🏆"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-sm">{c.title}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        c.type === "mixed" ? "bg-blue-500/10 text-blue-600" : "bg-orange-500/10 text-orange-600"
                      }`}>
                        {c.type === "mixed" ? "👥 Collaboratif" : "🏃 Solo"}
                      </span>
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
                  {isMember && (
                    <Button size="sm" onClick={() => onJoin?.(c)} className="shrink-0 text-xs">
                      Participer
                    </Button>
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