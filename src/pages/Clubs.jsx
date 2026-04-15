import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Plus, Loader2, Crown, ChevronRight, Settings, BookOpen,
  Headphones, Play, FileText, Shield, Sparkles, Search, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CreateClubModal from "@/components/clubs/CreateClubModal";

const DEFAULT_CLUBS = [
  { id: "entrepreneurs", name: "Entrepreneurs", emoji: "🚀", category: "business", description: "Livres, podcasts et vidéos pour entrepreneurs & startuppers", members: 1240, top: "Karim B.", content_types: ["book", "podcast"] },
  { id: "philosophie", name: "Philosophie", emoji: "🧘", category: "philosophie", description: "Socrate, Nietzsche, Spinoza — pensez en profondeur", members: 890, top: "Marie D.", content_types: ["book", "article"] },
  { id: "science", name: "Science & Nature", emoji: "🔬", category: "science", description: "Biologie, physique, cosmos — explorez l'univers", members: 720, top: "Lucas M.", content_types: ["book", "video"] },
  { id: "startup", name: "Startup Nation", emoji: "💡", category: "technologie", description: "Growth hacking, product management, VC", members: 650, top: "Noah P.", content_types: ["podcast", "article"] },
  { id: "etudiants", name: "Étudiants", emoji: "🎓", category: "etudiants", description: "Partagez vos ressources et progressez ensemble", members: 2100, top: "Emma W.", content_types: ["book", "video", "article"] },
  { id: "psychologie", name: "Psychologie", emoji: "🧠", category: "psychologie", description: "Comportement, neurosciences, développement personnel", members: 580, top: "Sophie L.", content_types: ["book", "podcast"] },
];

const CATEGORIES = [
  "all", "business", "science", "philosophie", "technologie",
  "psychologie", "etudiants", "litterature", "finance", "sante",
  "art", "developpement_personnel", "histoire", "autre"
];

const CONTENT_TYPE_ICONS = {
  book: { Icon: BookOpen, color: "text-green-500", label: "Livres" },
  podcast: { Icon: Headphones, color: "text-purple-500", label: "Podcasts" },
  video: { Icon: Play, color: "text-red-500", label: "Vidéos" },
  article: { Icon: FileText, color: "text-blue-500", label: "Articles" },
};

function ClubCard({ club, isMember, isAdmin, onJoin, onLeave }) {
  const memberCount = club.members || club.members_count || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`bg-card border rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col ${
        isMember ? "border-accent/40 bg-accent/[0.02]" : "border-border"
      }`}
    >
      {/* Cover */}
      {club.cover_url ? (
        <div className="h-24 overflow-hidden">
          <img src={club.cover_url} alt={club.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-16 bg-gradient-to-br from-primary/10 via-accent/10 to-purple-500/10 flex items-center justify-center text-3xl">
          {club.emoji}
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-2">
          {!club.cover_url && <div />}
          {club.cover_url && <span className="text-3xl">{club.emoji}</span>}
          <div className="flex items-center gap-1.5 ml-auto">
            {isAdmin && (
              <span className="text-[10px] bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" /> Admin
              </span>
            )}
            {!isAdmin && club.isUserCreated && (
              <span className="text-[10px] bg-purple-500/10 text-purple-600 border border-purple-500/20 px-2 py-0.5 rounded-full font-semibold">✦ Créé</span>
            )}
            {isMember && (
              <span className="text-[10px] bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-full font-medium">✓ Membre</span>
            )}
          </div>
        </div>

        <h3 className="font-heading font-bold text-base mb-1 leading-tight">{club.name}</h3>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-2 flex-1">{club.description}</p>

        {/* Content types */}
        {club.content_types?.length > 0 && (
          <div className="flex gap-1 mb-3">
            {club.content_types.slice(0, 4).map(ct => {
              const info = CONTENT_TYPE_ICONS[ct];
              if (!info) return null;
              const Icon = info.Icon;
              return <Icon key={ct} className={`w-3.5 h-3.5 ${info.color}`} title={info.label} />;
            })}
          </div>
        )}

        {/* Themes */}
        {club.themes?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {club.themes.slice(0, 2).map(t => (
              <span key={t} className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{t}</span>
            ))}
            {club.themes.length > 2 && (
              <span className="text-[10px] text-muted-foreground">+{club.themes.length - 2}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {memberCount.toLocaleString()} membres</span>
          {club.top && <span className="flex items-center gap-1"><Crown className="w-3 h-3 text-yellow-500" /> {club.top}</span>}
        </div>

        {/* Avatars */}
        <div className="flex -space-x-2 mb-4">
          {["A","B","C","D","E"].map((l, j) => (
            <div key={j} className="w-6 h-6 rounded-full border-2 border-background bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-[10px] font-bold">
              {l}
            </div>
          ))}
          {memberCount > 5 && (
            <div className="w-6 h-6 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] text-muted-foreground">
              +{Math.max(0, memberCount - 5).toLocaleString()}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-auto">
          {isAdmin ? (
            <Link to={`/ClubDetail?id=${club.id}`} className="flex-1">
              <Button variant="default" size="sm" className="w-full gap-1">
                <Settings className="w-3.5 h-3.5" /> Gérer
              </Button>
            </Link>
          ) : (
            <Button
              onClick={() => isMember ? onLeave(club.id) : onJoin(club.id)}
              variant={isMember ? "outline" : "default"}
              className="flex-1"
              size="sm"
            >
              {isMember ? "Quitter" : "Rejoindre"}
            </Button>
          )}
          <Link to={`/ClubDetail?id=${club.id}`}>
            <Button variant="outline" size="sm" className="gap-1 px-2.5">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function Clubs() {
  const [localMemberships, setLocalMemberships] = useState({});
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const qc = useQueryClient();

  // Fetch user-created clubs from DB
  const { data: userClubs = [] } = useQuery({
    queryKey: ["clubs"],
    queryFn: () => base44.entities.Club.list("-created_date", 50),
  });

  // Fetch memberships of current user
  const { data: myMemberships = [] } = useQuery({
    queryKey: ["my-memberships"],
    queryFn: () => base44.entities.ClubMember.list("-created_date", 100),
  });

  const joinMutation = useMutation({
    mutationFn: (club) => base44.entities.ClubMember.create({
      club_id: club.id || club,
      club_name: typeof club === "object" ? club.name : club,
      role: "member",
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-memberships"] }),
  });

  const leaveMutation = useMutation({
    mutationFn: async (clubId) => {
      const membership = myMemberships.find(m => m.club_id === clubId);
      if (membership) await base44.entities.ClubMember.delete(membership.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-memberships"] }),
  });

  const allClubs = [
    ...DEFAULT_CLUBS,
    ...userClubs.map(c => ({
      ...c,
      isUserCreated: true,
      members: c.members_count || 1,
      top: c.created_by || "Vous",
    })),
  ];

  // Determine membership/admin status
  const membershipMap = {};
  myMemberships.forEach(m => { membershipMap[m.club_id] = m.role; });

  const isMember = (id) => !!(membershipMap[id] || localMemberships[id]);
  const isAdmin = (id) => membershipMap[id] === "admin";

  const handleJoin = (clubId) => {
    const club = allClubs.find(c => String(c.id) === String(clubId));
    if (club?.isUserCreated) {
      joinMutation.mutate(club);
    } else {
      setLocalMemberships(prev => ({ ...prev, [clubId]: "member" }));
    }
  };

  const handleLeave = (clubId) => {
    if (membershipMap[clubId]) {
      leaveMutation.mutate(clubId);
    } else {
      setLocalMemberships(prev => { const n = { ...prev }; delete n[clubId]; return n; });
    }
  };

  // My clubs = where I'm a member or admin
  const myClubs = allClubs.filter(c => isMember(String(c.id)) || isAdmin(String(c.id)));

  const filtered = (filter === "all" ? allClubs : allClubs.filter(c => c.category === filter))
    .filter(c => !myClubs.find(mc => String(mc.id) === String(c.id)))
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 via-accent/10 to-purple-500/20 border border-blue-500/20 p-6">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 5 }}
          className="absolute right-5 top-4 text-5xl"
        >🤝</motion.div>
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-7 h-7 text-blue-500" />
          <h1 className="font-heading text-2xl font-bold">Clubs de savoir</h1>
        </div>
        <p className="text-muted-foreground text-sm">Rejoignez des communautés d'apprenants partageant vos intérêts</p>
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>🌍 {allClubs.length} clubs actifs</span>
            <span>·</span>
            <span>👥 6,180+ membres</span>
          </div>
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="gap-1.5 h-7 text-xs ml-auto">
            <Plus className="w-3.5 h-3.5" /> Créer un club
          </Button>
        </div>
      </div>

      {/* ── MES CLUBS ── */}
      {myClubs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-accent" />
            <h2 className="font-heading font-bold text-lg">Mes clubs</h2>
            <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">{myClubs.length}</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myClubs.map((club, i) => (
              <ClubCard
                key={club.id}
                club={club}
                isMember={isMember(String(club.id))}
                isAdmin={isAdmin(String(club.id))}
                onJoin={handleJoin}
                onLeave={handleLeave}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── DÉCOUVRIR ── */}
      <div>
        {myClubs.length > 0 && (
          <h2 className="font-heading font-bold text-lg mb-3">Découvrir d'autres clubs</h2>
        )}

        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un club par nom..."
            className="pl-10 pr-10 h-10"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === cat ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}>
              {cat === "all" ? "Tous" : cat === "developpement_personnel" ? "Dev. Personnel" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((club, i) => (
              <ClubCard
                key={club.id}
                club={club}
                isMember={false}
                isAdmin={false}
                onJoin={handleJoin}
                onLeave={handleLeave}
              />
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">Aucun club dans cette catégorie pour l'instant.</p>
        )}
      </div>

      {/* Create club CTA */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="w-full border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-accent/50 hover:bg-accent/5 transition-all group"
      >
        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">✨</div>
        <h3 className="font-semibold mb-1">Créer votre propre club</h3>
        <p className="text-sm text-muted-foreground mb-4">Rassemblez des apprenants autour de votre passion.</p>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium">
          <Plus className="w-4 h-4" /> Créer un club
        </span>
      </button>

      <AnimatePresence>
        {showCreateModal && (
          <CreateClubModal
            onClose={() => setShowCreateModal(false)}
            onCreated={() => {
              qc.invalidateQueries({ queryKey: ["clubs"] });
              qc.invalidateQueries({ queryKey: ["my-memberships"] });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}