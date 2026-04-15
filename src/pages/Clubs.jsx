import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Loader2, Crown, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CreateClubModal from "@/components/clubs/CreateClubModal";

const DEFAULT_CLUBS = [
  { id: "entrepreneurs", name: "Entrepreneurs", emoji: "🚀", category: "business", description: "Livres, podcasts et vidéos pour entrepreneurs & startuppers", members: 1240, top: "Karim B." },
  { id: "philosophie", name: "Philosophie", emoji: "🧘", category: "philosophie", description: "Socrate, Nietzsche, Spinoza — pensez en profondeur", members: 890, top: "Marie D." },
  { id: "science", name: "Science & Nature", emoji: "🔬", category: "science", description: "Biologie, physique, cosmos — explorez l'univers", members: 720, top: "Lucas M." },
  { id: "startup", name: "Startup Nation", emoji: "💡", category: "technologie", description: "Growth hacking, product management, VC", members: 650, top: "Noah P." },
  { id: "etudiants", name: "Étudiants", emoji: "🎓", category: "etudiants", description: "Partagez vos ressources et progressez ensemble", members: 2100, top: "Emma W." },
  { id: "psychologie", name: "Psychologie", emoji: "🧠", category: "psychologie", description: "Comportement, neurosciences, développement personnel", members: 580, top: "Sophie L." },
];

export default function Clubs() {
  const [joined, setJoined] = useState({});
  const [filter, setFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const qc = useQueryClient();

  const categories = ["all", "business", "science", "philosophie", "technologie", "psychologie", "etudiants", "autre"];

  // Fetch user-created clubs from DB
  const { data: userClubs = [] } = useQuery({
    queryKey: ["clubs"],
    queryFn: () => base44.entities.Club.list("-created_date", 50),
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

  const filtered = filter === "all" ? allClubs : allClubs.filter(c => c.category === filter);

  const handleJoin = (clubId) => {
    setJoined(prev => ({ ...prev, [clubId]: !prev[clubId] }));
  };

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
        <div className="mt-3 flex items-center gap-3">
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

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === cat ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}>
            {cat === "all" ? "Tous" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Clubs grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((club, i) => (
            <motion.div
              key={club.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.07 }}
              className={`bg-card border rounded-2xl p-5 hover:shadow-lg transition-all ${
                joined[club.id] ? "border-accent/40 bg-accent/5" : "border-border"
              }`}
            >
              {/* Cover photo if user-created club */}
              {club.isUserCreated && club.cover_url && (
                <div className="-mx-5 -mt-5 mb-3 h-20 overflow-hidden rounded-t-2xl">
                  <img src={club.cover_url} alt={club.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{club.emoji}</div>
                <div className="flex items-center gap-1.5">
                  {club.isUserCreated && (
                    <span className="text-[10px] bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 px-2 py-0.5 rounded-full font-semibold">✦ Custom</span>
                  )}
                  {joined[club.id] && (
                    <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">Membre ✓</span>
                  )}
                </div>
              </div>
              <h3 className="font-heading font-bold text-lg mb-1">{club.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{club.description}</p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {(club.members || club.members_count || 0).toLocaleString()} membres</span>
                <span className="flex items-center gap-1"><Crown className="w-3.5 h-3.5 text-yellow-500" /> {club.top || "—"}</span>
              </div>

              {/* Top members */}
              <div className="flex -space-x-2 mb-4">
                {["A","B","C","D","E"].map((l, j) => (
                  <div key={j} className="w-7 h-7 rounded-full border-2 border-background bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xs font-bold">
                    {l}
                  </div>
                ))}
                <div className="w-7 h-7 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs text-muted-foreground">
                  +{Math.max(0, (club.members || club.members_count || 5) - 5).toLocaleString()}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleJoin(club.id)}
                  variant={joined[club.id] ? "outline" : "default"}
                  className="flex-1"
                  size="sm"
                >
                  {joined[club.id] ? "Quitter" : "Rejoindre"}
                </Button>
                <Link to={`/ClubDetail?id=${club.id}`}>
                  <Button variant="outline" size="sm" className="gap-1">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
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
            onCreated={() => qc.invalidateQueries({ queryKey: ["clubs"] })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}