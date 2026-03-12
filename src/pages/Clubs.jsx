import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Loader2, Crown, TrendingUp, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  const categories = ["all", "business", "science", "philosophie", "technologie", "psychologie", "etudiants"];

  const filtered = filter === "all" ? DEFAULT_CLUBS : DEFAULT_CLUBS.filter(c => c.category === filter);

  const handleJoin = (clubId) => {
    setJoined(prev => ({ ...prev, [clubId]: !prev[clubId] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>🌍 6 clubs actifs</span>
          <span>·</span>
          <span>👥 6,180 membres</span>
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
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{club.emoji}</div>
                {joined[club.id] && (
                  <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">Membre ✓</span>
                )}
              </div>
              <h3 className="font-heading font-bold text-lg mb-1">{club.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{club.description}</p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {club.members.toLocaleString()} membres</span>
                <span className="flex items-center gap-1"><Crown className="w-3.5 h-3.5 text-yellow-500" /> {club.top}</span>
              </div>

              {/* Top members */}
              <div className="flex -space-x-2 mb-4">
                {["A","B","C","D","E"].map((l, j) => (
                  <div key={j} className="w-7 h-7 rounded-full border-2 border-background bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xs font-bold">
                    {l}
                  </div>
                ))}
                <div className="w-7 h-7 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs text-muted-foreground">
                  +{(club.members - 5).toLocaleString()}
                </div>
              </div>

              <Button
                onClick={() => handleJoin(club.id)}
                variant={joined[club.id] ? "outline" : "default"}
                className="w-full"
                size="sm"
              >
                {joined[club.id] ? "Quitter le club" : "Rejoindre"}
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Create club CTA */}
      <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-accent/50 transition-colors">
        <div className="text-4xl mb-3">✨</div>
        <h3 className="font-semibold mb-1">Créer votre propre club</h3>
        <p className="text-sm text-muted-foreground mb-4">Rassemblez des apprenants autour de votre passion.</p>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" /> Créer un club — bientôt disponible
        </Button>
      </div>
    </div>
  );
}