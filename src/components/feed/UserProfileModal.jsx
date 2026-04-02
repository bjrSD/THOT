import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, UserCheck, BookOpen, Headphones, Play, FileText, Flame, Zap, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { detectArchetype } from "@/components/shared/ArchetypeUtils";

/**
 * Mini-profil social qui s'ouvre depuis le feed quand on clique
 * sur l'avatar ou le nom d'un utilisateur.
 */
export default function UserProfileModal({ user, currentUserEmail, onClose }) {
  const [relation, setRelation] = useState("none"); // none | pending | friend | following

  if (!user) return null;

  const username = user.email?.split("@")[0] || "?";
  const initial = username[0]?.toUpperCase();

  // Déduire un archétype si on a des contenus, sinon afficher un généraliste
  const { primary: archetype } = detectArchetype(user.contents || []);
  const isSelf = user.email === currentUserEmail;

  const handleFollow = () => {
    setRelation(prev => {
      if (prev === "none") return "following";
      if (prev === "following") return "none";
      return prev;
    });
  };

  const handleAddFriend = () => {
    setRelation(prev => {
      if (prev === "none" || prev === "following") return "pending";
      if (prev === "pending") return "none";
      return prev;
    });
  };

  const RelationButton = () => {
    if (isSelf) return null;
    if (relation === "friend") {
      return (
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setRelation("none")}>
          <UserCheck className="w-3.5 h-3.5 text-green-500" /> Amis
        </Button>
      );
    }
    if (relation === "pending") {
      return (
        <Button size="sm" variant="outline" className="gap-1.5 text-xs text-muted-foreground" onClick={handleAddFriend}>
          <UserCheck className="w-3.5 h-3.5" /> Demande envoyée
        </Button>
      );
    }
    return (
      <div className="flex gap-2">
        <Button size="sm" className="gap-1.5 text-xs" onClick={handleAddFriend}>
          <UserPlus className="w-3.5 h-3.5" /> Ajouter
        </Button>
        <Button size="sm" variant="outline" className={`gap-1.5 text-xs ${relation === "following" ? "border-accent text-accent" : ""}`} onClick={handleFollow}>
          {relation === "following" ? "✓ Suivi" : "Suivre"}
        </Button>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 12 }}
          transition={{ duration: 0.2 }}
          onClick={e => e.stopPropagation()}
          className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm p-5 space-y-4"
        >
          {/* Close */}
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={username} className="w-14 h-14 rounded-full object-cover border-2 border-border" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-xl text-primary shrink-0">
                {initial}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base truncate">{user.display_name || username}</p>
              <p className="text-xs text-muted-foreground">@{username}</p>
              {user.city && <p className="text-xs text-muted-foreground mt-0.5">📍 {user.city}</p>}
            </div>
          </div>

          {/* Bio */}
          {user.bio && <p className="text-sm text-muted-foreground leading-relaxed">{user.bio}</p>}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "KP", value: (user.total_kp || 0).toLocaleString(), icon: Zap, color: "text-accent" },
              { label: "Streak", value: `🔥 ${user.current_streak || 0}j`, icon: null, color: "" },
              { label: "Livres", value: user.books_read || 0, icon: BookOpen, color: "text-blue-500" },
            ].map((s, i) => (
              <div key={i} className="bg-secondary/60 rounded-xl p-2.5 text-center">
                <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Profil intellectuel */}
          <div className={`flex items-center gap-2 rounded-xl px-3 py-2 border ${archetype.bg} ${archetype.border}`}>
            <span className="text-xl">{archetype.icon}</span>
            <div>
              <p className={`text-xs font-semibold ${archetype.color}`}>{archetype.name}</p>
              <p className="text-xs text-muted-foreground">{archetype.shortDesc}</p>
            </div>
          </div>

          {/* Actions */}
          {!isSelf && (
            <div className="flex items-center justify-between pt-1">
              <RelationButton />
              <Button size="sm" variant="ghost" className="gap-1.5 text-xs text-muted-foreground">
                <MessageCircle className="w-3.5 h-3.5" /> Message
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}