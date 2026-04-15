import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, BookOpen, MessageCircle, ArrowLeft, Send, Crown, Flame, Heart,
  Settings, Shield, Edit, Save, Loader2, X, FileText, Headphones, Play, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import ClubDashboard from "@/components/clubs/ClubDashboard";
import ClubChallenges from "@/components/clubs/ClubChallenges";
import ClubPlaylists from "@/components/clubs/ClubPlaylists";
import ClubMembers from "@/components/clubs/ClubMembers";
import ClubChat from "@/components/clubs/ClubChat";

const CLUBS_INFO = {
  "entrepreneurs": {
    emoji: "🚀", name: "Entrepreneurs", category: "business",
    description: "Un espace dédié aux entrepreneurs.",
    longDescription: "Ce club est le point de rencontre des esprits entrepreneuriaux. Chaque semaine, nous partageons des lectures inspirantes, des podcasts de référence, et des retours d'expérience.",
    members: 1240, kp_total: 128000,
    cover: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    pinned_book: "Zero to One — Peter Thiel",
    challenges: [], top_members: [
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
    challenges: [], top_members: [
      { name: "Marie D.", kp: 5420, streak: 42, photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face" },
      { name: "Sophie L.", kp: 4210, streak: 28, photo: null },
    ],
    recent_reads: ["La République — Platon", "L'Éthique — Spinoza", "Méditations — Descartes"],
  },
};

const DEFAULT_CLUB = {
  emoji: "📚", name: "Club", members: 100, kp_total: 10000,
  cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
  challenges: [], top_members: [], recent_reads: [],
};

const CONTENT_TYPE_ICONS = {
  book: { Icon: BookOpen, color: "text-green-500", label: "Livres" },
  podcast: { Icon: Headphones, color: "text-purple-500", label: "Podcasts" },
  video: { Icon: Play, color: "text-red-500", label: "Vidéos" },
  article: { Icon: FileText, color: "text-blue-500", label: "Articles" },
};

function AdminPanel({ club }) {
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
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Club.delete(club.id),
    onSuccess: () => { toast.success("Club supprimé."); window.location.href = "/Clubs"; },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
        <Shield className="w-4 h-4 text-yellow-600" />
        <p className="text-sm font-semibold text-yellow-700">Vous êtes administrateur de ce club</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2"><Edit className="w-4 h-4 text-accent" /> Informations</h3>
          {!editing && <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Modifier</Button>}
        </div>
        {editing ? (
          <div className="space-y-3">
            {[
              { key: "name", label: "Nom", type: "input" },
              { key: "description", label: "Description", type: "textarea" },
              { key: "pinned_book", label: "Lecture épinglée", type: "input", placeholder: "Titre du livre..." },
              { key: "welcome_message", label: "Message de bienvenue", type: "textarea", placeholder: "Message affiché aux nouveaux membres..." },
              { key: "rules", label: "Règles", type: "textarea", placeholder: "Règles du club..." },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">{f.label}</label>
                {f.type === "input"
                  ? <Input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
                  : <textarea value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      rows={2} placeholder={f.placeholder}
                      className="w-full px-3 py-2 rounded-xl border border-input bg-transparent text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground" />
                }
              </div>
            ))}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(false)} className="flex-1">Annuler</Button>
              <Button size="sm" onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending} className="flex-1">
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-3.5 h-3.5 mr-1" /> Enregistrer</>}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm text-muted-foreground">
            {["name", "description", "rules", "welcome_message"].map(k => club[k] ? (
              <p key={k}><span className="font-medium text-foreground capitalize">{k.replace("_", " ")} :</span> {club[k]}</p>
            ) : null)}
          </div>
        )}
      </div>

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

      <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5">
        <h3 className="font-semibold text-destructive mb-2 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Zone dangereuse</h3>
        <p className="text-sm text-muted-foreground mb-3">Cette action est irréversible.</p>
        <Button variant="destructive" size="sm"
          onClick={() => { if (confirm("Supprimer définitivement ce club ?")) deleteMutation.mutate(); }}
          disabled={deleteMutation.isPending}>
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

  const { data: dbClub } = useQuery({
    queryKey: ["club", clubId],
    queryFn: async () => {
      const results = await base44.entities.Club.filter({ id: clubId });
      return results[0] || null;
    },
  });

  const { data: myMemberships = [] } = useQuery({
    queryKey: ["my-memberships"],
    queryFn: () => base44.entities.ClubMember.list("-created_date", 100),
  });

  // All members of this club (for admin view)
  const { data: allClubMembers = [] } = useQuery({
    queryKey: ["club-members", clubId],
    queryFn: () => base44.entities.ClubMember.filter({ club_id: clubId }),
    enabled: !!dbClub,
  });

  // Club challenges
  const { data: clubChallenges = [] } = useQuery({
    queryKey: ["club-challenges", clubId],
    queryFn: () => base44.entities.Challenge.list("-created_date", 30),
    enabled: !!clubId,
  });

  const myMembership = myMemberships.find(m => m.club_id === clubId);
  const isAdmin = myMembership?.role === "admin";
  const isModerator = myMembership?.role === "moderateur";
  const isMember = !!myMembership;
  const canManageChallenges = isAdmin || isModerator;

  const staticClub = CLUBS_INFO[clubId] || { ...DEFAULT_CLUB, name: clubId };
  const club = dbClub ? {
    ...staticClub, ...dbClub,
    members: dbClub.members_count || 1,
    kp_total: dbClub.kp_total || 10000,
    cover: dbClub.cover_url || staticClub.cover,
    challenges: staticClub.challenges || [],
    top_members: staticClub.top_members || [],
    recent_reads: staticClub.recent_reads || [],
  } : staticClub;



  const tabs = [
    { id: "accueil", label: "🏠 Accueil" },
    { id: "chat", label: "💬 Discussion" },
    { id: "membres", label: "👥 Membres" },
    { id: "defis", label: "🏆 Défis" },
    { id: "playlists", label: "🎵 Playlists" },
    ...(isAdmin ? [{ id: "gerer", label: "⚙️ Gérer" }] : []),
  ];
  const [activeTab, setActiveTab] = useState("accueil");

  const joinMutation = useMutation({
    mutationFn: () => base44.entities.ClubMember.create({ club_id: clubId, club_name: club.name, role: "member" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-memberships"] }); toast.success("Vous avez rejoint le club !"); },
  });

  return (
    // ── Layout élargi (max-w-5xl) ──
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Back */}
      <Link to={createPageUrl("Clubs")}>
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Tous les clubs
        </Button>
      </Link>

      {/* Cover — taller */}
      <div className="relative rounded-2xl overflow-hidden h-56 md:h-64">
        <img src={club.cover} alt={club.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
          <div className="flex items-center gap-4">
            <span className="text-5xl drop-shadow-lg">{club.emoji}</span>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">{club.name}</h1>
                {isAdmin && <span className="text-[10px] bg-yellow-500/90 text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><Shield className="w-2.5 h-2.5" /> Admin</span>}
                {isModerator && <span className="text-[10px] bg-blue-500/90 text-white px-2 py-0.5 rounded-full font-bold">🔵 Modérateur</span>}
              </div>
              <p className="text-white/70 text-sm">{(club.members || 0).toLocaleString()} membres · {(club.kp_total || 0).toLocaleString()} KP collectifs</p>
            </div>
          </div>
          {!isMember ? (
            <Button size="sm" className="bg-accent hover:bg-accent/90"
              onClick={() => joinMutation.mutate()} disabled={joinMutation.isPending}>
              {joinMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "+ Rejoindre"}
            </Button>
          ) : (
            <span className="text-xs bg-white/20 text-white border border-white/30 px-3 py-1.5 rounded-lg font-medium">✓ Membre</span>
          )}
        </div>
      </div>

      {/* Content type + theme badges */}
      {(club.content_types?.length > 0 || club.themes?.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {club.content_types?.map(ct => {
            const info = CONTENT_TYPE_ICONS[ct];
            if (!info) return null;
            const Icon = info.Icon;
            return (
              <span key={ct} className="inline-flex items-center gap-1.5 text-xs bg-secondary px-3 py-1 rounded-full">
                <Icon className={`w-3.5 h-3.5 ${info.color}`} /> {info.label}
              </span>
            );
          })}
          {club.themes?.slice(0, 4).map(t => (
            <span key={t} className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full">{t}</span>
          ))}
          {club.themes?.length > 4 && <span className="text-xs text-muted-foreground py-1">+{club.themes.length - 4} thèmes</span>}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary p-1 rounded-xl overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 text-xs md:text-sm rounded-lg font-medium transition-all whitespace-nowrap px-2 min-w-fit ${activeTab === t.id ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Accueil (mini dashboard) ── */}
      {activeTab === "accueil" && (
        <ClubDashboard
          club={club}
          myMembership={myMembership}
          clubChallengesCount={clubChallenges.filter(c => c.description?.includes(`[Club: ${club.name}]`) || club.challenges?.includes(c.title)).length}
          clubId={clubId}
        />
      )}

      {/* ── Tab: Discussion ── */}
      {activeTab === "chat" && (
        <ClubChat isMember={isMember} onJoin={() => joinMutation.mutate()} joining={joinMutation.isPending} />
      )}

      {/* ── Tab: Membres ── */}
      {activeTab === "membres" && (
        <ClubMembers
          members={allClubMembers}
          topMembers={club.top_members}
          isAdmin={isAdmin}
          isModerator={isModerator}
        />
      )}

      {/* ── Tab: Défis ── */}
      {activeTab === "defis" && (
        <ClubChallenges
          club={dbClub || { id: clubId, name: club.name, emoji: club.emoji }}
          clubChallenges={clubChallenges.filter(c => c.description?.includes(`[Club: ${club.name}]`) || club.challenges?.includes(c.title))}
          canCreate={canManageChallenges}
          isMember={isMember}
        />
      )}

      {/* ── Tab: Playlists ── */}
      {activeTab === "playlists" && (
        <ClubPlaylists club={dbClub || { id: clubId, name: club.name, emoji: club.emoji }} isMember={isMember} />
      )}

      {/* ── Tab: Gérer (admin only) ── */}
      {activeTab === "gerer" && isAdmin && dbClub && (
        <AdminPanel club={dbClub} />
      )}
    </div>
  );
}