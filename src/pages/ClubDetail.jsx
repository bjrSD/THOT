import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users, BookOpen, MessageCircle, Trophy, ArrowLeft, Send, Crown, Flame, Pin,
  Heart, Settings, Shield, Edit, Save, Loader2, X, FileText, Headphones, Play, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

const CLUBS_INFO = {
  "entrepreneurs": {
    emoji: "🚀", name: "Entrepreneurs", category: "business",
    description: "Un espace dédié aux entrepreneurs.",
    longDescription: "Ce club est le point de rencontre des esprits entrepreneuriaux. Chaque semaine, nous partageons des lectures inspirantes, des podcasts de référence, et des retours d'expérience.",
    members: 1240, kp_total: 128000,
    cover: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    pinned_book: "Zero to One — Peter Thiel",
    challenges: ["📚 10 livres business en 3 mois", "🎙️ 1 podcast/jour pendant 30 jours"],
    top_members: [
      { name: "Karim B.", kp: 5420, streak: 31, photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
      { name: "Marie D.", kp: 4980, streak: 42, photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face" },
      { name: "Lucas M.", kp: 3800, streak: 15, photo: null },
    ],
    recent_reads: ["Atomic Habits", "The Lean Startup", "Zero to One", "Thinking Fast and Slow"],
  },
  "philosophie": {
    emoji: "🧘", name: "Philosophie", category: "philosophie",
    description: "Socrate, Nietzsche, Spinoza — plongez dans les profondeurs de la pensée humaine.",
    longDescription: "Un espace pour les amoureux de la philosophie. Partagez vos réflexions sur les grands textes, débattez d'idées, et explorez ensemble les grandes questions de l'existence.",
    members: 890, kp_total: 95000,
    cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
    pinned_book: "Ainsi parlait Zarathoustra — Nietzsche",
    challenges: ["🧠 Lire 3 classiques en 2 mois"],
    top_members: [
      { name: "Marie D.", kp: 5420, streak: 42, photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face" },
      { name: "Sophie L.", kp: 4210, streak: 28, photo: null },
    ],
    recent_reads: ["La République — Platon", "L'Éthique — Spinoza", "Méditations — Descartes"],
  },
};

const DEFAULT_CLUB = {
  emoji: "📚", name: "Club", category: "général",
  description: "Un club de savoir.",
  longDescription: "Rejoignez ce club pour partager vos lectures et progresser ensemble.",
  members: 100, kp_total: 10000,
  cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
  pinned_book: null, challenges: [], top_members: [], recent_reads: [],
};

const CONTENT_TYPE_ICONS = {
  book: { Icon: BookOpen, color: "text-green-500", label: "Livres" },
  podcast: { Icon: Headphones, color: "text-purple-500", label: "Podcasts" },
  video: { Icon: Play, color: "text-red-500", label: "Vidéos" },
  article: { Icon: FileText, color: "text-blue-500", label: "Articles" },
};

function AdminPanel({ club, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: club.name || "",
    description: club.description || "",
    rules: club.rules || "",
    welcome_message: club.welcome_message || "",
    pinned_book: club.pinned_book || "",
  });
  const qc = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Club.update(club.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["club", club.id] });
      qc.invalidateQueries({ queryKey: ["clubs"] });
      setEditing(false);
      toast.success("Club mis à jour !");
      onSave?.();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Club.delete(club.id);
    },
    onSuccess: () => {
      toast.success("Club supprimé.");
      onDelete?.();
      window.location.href = "/Clubs";
    },
  });

  return (
    <div className="space-y-4">
      {/* Admin badge */}
      <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
        <Shield className="w-4 h-4 text-yellow-600" />
        <p className="text-sm font-semibold text-yellow-700">Vous êtes administrateur de ce club</p>
      </div>

      {/* Edit info */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2"><Edit className="w-4 h-4 text-accent" /> Informations du club</h3>
          {!editing && (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Modifier</Button>
          )}
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Nom</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3} className="w-full px-3 py-2 rounded-xl border border-input bg-transparent text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Lecture épinglée</label>
              <Input value={form.pinned_book} onChange={e => setForm(f => ({ ...f, pinned_book: e.target.value }))} placeholder="Titre du livre..." />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Message de bienvenue</label>
              <textarea value={form.welcome_message} onChange={e => setForm(f => ({ ...f, welcome_message: e.target.value }))}
                rows={2} placeholder="Message affiché aux nouveaux membres..." className="w-full px-3 py-2 rounded-xl border border-input bg-transparent text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Règles</label>
              <textarea value={form.rules} onChange={e => setForm(f => ({ ...f, rules: e.target.value }))}
                rows={2} placeholder="Règles du club..." className="w-full px-3 py-2 rounded-xl border border-input bg-transparent text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground" />
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setEditing(false)} className="flex-1">Annuler</Button>
              <Button size="sm" onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending} className="flex-1">
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-3.5 h-3.5 mr-1" /> Enregistrer</>}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">Nom :</span> {club.name}</p>
            <p><span className="font-medium text-foreground">Description :</span> {club.description}</p>
            {club.rules && <p><span className="font-medium text-foreground">Règles :</span> {club.rules}</p>}
            {club.welcome_message && <p><span className="font-medium text-foreground">Bienvenue :</span> {club.welcome_message}</p>}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Membres", value: club.members_count || 1, icon: "👥" },
          { label: "Thèmes", value: club.themes?.length || 0, icon: "🏷️" },
          { label: "Types", value: club.content_types?.length || 0, icon: "📂" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-xl mb-1">{s.icon}</p>
            <p className="font-bold text-lg">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5">
        <h3 className="font-semibold text-destructive mb-2 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Zone dangereuse</h3>
        <p className="text-sm text-muted-foreground mb-3">Cette action est irréversible. Le club sera définitivement supprimé.</p>
        <Button
          variant="destructive" size="sm"
          onClick={() => { if (confirm("Supprimer définitivement ce club ?")) deleteMutation.mutate(); }}
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
          Supprimer le club
        </Button>
      </div>
    </div>
  );
}

export default function ClubDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const clubId = urlParams.get("id") || "entrepreneurs";
  const qc = useQueryClient();

  // Try to load from DB first
  const { data: dbClub } = useQuery({
    queryKey: ["club", clubId],
    queryFn: async () => {
      const results = await base44.entities.Club.filter({ id: clubId });
      return results[0] || null;
    },
    enabled: !!clubId,
  });

  const { data: myMemberships = [] } = useQuery({
    queryKey: ["my-memberships"],
    queryFn: () => base44.entities.ClubMember.list("-created_date", 100),
  });

  const myMembership = myMemberships.find(m => m.club_id === clubId);
  const isAdmin = myMembership?.role === "admin";
  const isMember = !!myMembership;

  // Use DB club if available, else fallback to static
  const staticClub = CLUBS_INFO[clubId] || { ...DEFAULT_CLUB, name: clubId };
  const club = dbClub ? {
    ...staticClub,
    ...dbClub,
    members: dbClub.members_count || 1,
    kp_total: dbClub.kp_total || 10000,
    cover: dbClub.cover_url || staticClub.cover,
    pinned_book: dbClub.pinned_book || staticClub.pinned_book,
    challenges: staticClub.challenges || [],
    top_members: staticClub.top_members || [],
    recent_reads: staticClub.recent_reads || [],
  } : staticClub;

  const [joined, setJoined] = useState(isMember);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, author: "Marie D.", text: "Je viens de terminer Zero to One ! Absolument incroyable. Qui l'a lu ?", time: "il y a 2h", likes: 5 },
    { id: 2, author: "Karim B.", text: "Je le lis en ce moment ! La partie sur les monopoles est fascinante.", time: "il y a 1h", likes: 3 },
    { id: 3, author: "Sophie L.", text: "Prochaine lecture du club : The Lean Startup. On commence lundi ?", time: "il y a 30min", likes: 8 },
  ]);

  const tabs = [
    { id: "accueil", label: "Accueil" },
    { id: "chat", label: "Discussion" },
    { id: "membres", label: "Membres" },
    { id: "defis", label: "Défis" },
    ...(isAdmin ? [{ id: "gerer", label: "⚙️ Gérer" }] : []),
  ];
  const [activeTab, setActiveTab] = useState("accueil");

  useEffect(() => { setJoined(isMember); }, [isMember]);

  const joinMutation = useMutation({
    mutationFn: () => base44.entities.ClubMember.create({ club_id: clubId, club_name: club.name, role: "member" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-memberships"] }); setJoined(true); },
  });

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), author: "Vous", text: newMessage, time: "à l'instant", likes: 0 }]);
    setNewMessage("");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Back */}
      <Link to={createPageUrl("Clubs")}>
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Tous les clubs
        </Button>
      </Link>

      {/* Cover */}
      <div className="relative rounded-2xl overflow-hidden h-48">
        <img src={club.cover} alt={club.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{club.emoji}</span>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="font-heading text-2xl font-bold text-white">{club.name}</h1>
                {isAdmin && <span className="text-[10px] bg-yellow-500/90 text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><Shield className="w-2.5 h-2.5" /> Admin</span>}
              </div>
              <p className="text-white/70 text-sm">{(club.members || 0).toLocaleString()} membres · {(club.kp_total || 0).toLocaleString()} KP collectifs</p>
            </div>
          </div>
          {!isMember && !isAdmin && (
            <Button size="sm" className="bg-accent hover:bg-accent/90"
              onClick={() => joinMutation.mutate()} disabled={joinMutation.isPending}>
              {joinMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "+ Rejoindre"}
            </Button>
          )}
          {isMember && !isAdmin && (
            <span className="text-xs bg-white/20 text-white border border-white/30 px-3 py-1.5 rounded-lg font-medium">✓ Membre</span>
          )}
        </div>
      </div>

      {/* Content types badges */}
      {club.content_types?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {club.content_types.map(ct => {
            const info = CONTENT_TYPE_ICONS[ct];
            if (!info) return null;
            const Icon = info.Icon;
            return (
              <span key={ct} className="inline-flex items-center gap-1.5 text-xs bg-secondary px-3 py-1 rounded-full">
                <Icon className={`w-3.5 h-3.5 ${info.color}`} /> {info.label}
              </span>
            );
          })}
          {club.themes?.slice(0, 3).map(t => (
            <span key={t} className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full">{t}</span>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary p-1 rounded-xl overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all whitespace-nowrap px-2 ${activeTab === t.id ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Accueil Tab */}
      {activeTab === "accueil" && (
        <div className="space-y-5">
          {club.welcome_message && (
            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4">
              <p className="text-xs text-accent font-medium uppercase tracking-wide mb-1">Message de bienvenue</p>
              <p className="text-sm">{club.welcome_message}</p>
            </div>
          )}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold mb-2">À propos</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{club.longDescription || club.description}</p>
            {club.rules && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Règles</p>
                <p className="text-sm text-muted-foreground">{club.rules}</p>
              </div>
            )}
          </div>

          {club.pinned_book && (
            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center"><Pin className="w-5 h-5 text-accent" /></div>
              <div>
                <p className="text-xs text-accent font-medium uppercase tracking-wide">Lecture du moment</p>
                <p className="font-semibold text-sm">{club.pinned_book}</p>
              </div>
            </div>
          )}

          {club.recent_reads?.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4 text-accent" /> Lectures récentes</h3>
              <div className="space-y-2">
                {club.recent_reads.map((book, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5 border-b border-border last:border-0">
                    <span className="text-lg">📖</span>
                    <p className="text-sm font-medium">{book}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-3 border-b border-border flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-accent" />
            <span className="font-semibold text-sm">Discussion du club</span>
          </div>
          <div className="h-80 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-2 ${msg.author === "Vous" ? "flex-row-reverse" : ""}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xs font-bold shrink-0">
                  {msg.author[0]}
                </div>
                <div className={`max-w-[75%] ${msg.author === "Vous" ? "items-end" : ""} flex flex-col`}>
                  {msg.author !== "Vous" && <p className="text-xs text-accent font-medium mb-0.5">{msg.author}</p>}
                  <div className={`rounded-2xl px-3 py-2 text-sm ${msg.author === "Vous" ? "bg-accent text-accent-foreground" : "bg-secondary"}`}>
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">{msg.time}</p>
                    <button className="text-xs text-muted-foreground hover:text-red-500 flex items-center gap-0.5">
                      <Heart className="w-3 h-3" /> {msg.likes}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {(joined || isMember) ? (
            <div className="p-3 border-t border-border flex gap-2">
              <Input placeholder="Écrire un message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()} className="text-sm" />
              <Button size="icon" onClick={handleSend} disabled={!newMessage.trim()}><Send className="w-4 h-4" /></Button>
            </div>
          ) : (
            <div className="p-4 text-center border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Rejoignez le club pour participer à la discussion</p>
              <Button size="sm" onClick={() => joinMutation.mutate()}>Rejoindre le club</Button>
            </div>
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === "membres" && (
        <div className="space-y-3">
          {club.top_members?.length === 0 && (
            <p className="text-center text-muted-foreground py-8 text-sm">Aucun membre visible pour l'instant.</p>
          )}
          {club.top_members?.map((member, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition-all hover:border-accent/30">
              {member.photo ? (
                <img src={member.photo} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-lg">{member.name[0]}</div>
              )}
              <div className="flex-1">
                <p className="font-semibold">{member.name}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span><Flame className="w-3 h-3 text-orange-500 inline" /> {member.streak}j streak</span>
                  <span className="text-accent font-medium">{member.kp.toLocaleString()} KP</span>
                </div>
              </div>
              {i === 0 && <Crown className="w-5 h-5 text-yellow-500" />}
            </div>
          ))}
        </div>
      )}

      {/* Défis Tab */}
      {activeTab === "defis" && (
        <div className="space-y-4">
          {(!club.challenges || club.challenges.length === 0) ? (
            <p className="text-center text-muted-foreground py-8">Aucun défi actif pour ce club.</p>
          ) : club.challenges.map((c, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
              <div className="text-3xl">{c.split(" ")[0]}</div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{c.slice(c.indexOf(" ") + 1)}</p>
                <p className="text-xs text-muted-foreground">Défi collectif du club</p>
              </div>
              <Button size="sm">Participer</Button>
            </div>
          ))}
        </div>
      )}

      {/* Admin Tab */}
      {activeTab === "gerer" && isAdmin && dbClub && (
        <AdminPanel club={dbClub} onSave={() => qc.invalidateQueries({ queryKey: ["club", clubId] })} />
      )}
    </div>
  );
}