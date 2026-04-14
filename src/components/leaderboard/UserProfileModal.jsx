import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, UserCheck, Users, Flame, BookOpen, Headphones, Star, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UserProfileModal({ user, onClose }) {
  const [me, setMe] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => { base44.auth.me().then(setMe); }, []);

  const { data: follows = [] } = useQuery({
    queryKey: ["follows-me", me?.email],
    queryFn: () => base44.entities.Follow.filter({ follower_email: me.email }),
    enabled: !!me?.email,
  });

  const { data: reverseFollows = [] } = useQuery({
    queryKey: ["follows-reverse", me?.email, user?.email],
    queryFn: () => base44.entities.Follow.filter({ follower_email: user.email, following_email: me.email }),
    enabled: !!me?.email && !!user?.email,
  });

  const isFollowing = follows.some(f => f.following_email === user?.email);
  const isMutual = isFollowing && reverseFollows.length > 0;

  const followMutation = useMutation({
    mutationFn: () => base44.entities.Follow.create({ follower_email: me.email, following_email: user.email, is_friend: false }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["follows-me", me?.email] }),
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      const existing = follows.find(f => f.following_email === user.email);
      if (existing) await base44.entities.Follow.delete(existing.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["follows-me", me?.email] }),
  });

  if (!user) return null;

  const RANK_COLORS = ["text-yellow-500", "text-slate-400", "text-orange-400"];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative bg-card rounded-3xl border border-border shadow-2xl w-full max-w-sm overflow-hidden z-10">

          {/* Header gradient */}
          <div className="bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 p-6 pb-4">
            <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-3xl font-black border-2 border-background shadow">
                {user.full_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading font-bold text-lg">{user.full_name}</h2>
                  {user.rank <= 3 && <span>{["🥇","🥈","🥉"][user.rank - 1]}</span>}
                </div>
                <p className="text-sm text-muted-foreground">{user.level}</p>
                {isMutual && (
                  <span className="text-xs bg-green-500/15 text-green-600 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">
                    ✓ Amis
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 px-6 py-4">
            {[
              { icon: Star, value: (user.total_kp || 0).toLocaleString(), label: "KP", color: "text-yellow-500" },
              { icon: Flame, value: `${user.current_streak || 0}j`, label: "Streak", color: "text-orange-500" },
              { icon: BookOpen, value: user.books || 0, label: "Livres", color: "text-accent" },
            ].map((s, i) => (
              <div key={i} className="bg-secondary/60 rounded-xl p-3 text-center">
                <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1`} />
                <p className="font-black text-sm">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Rank badge */}
          <div className="px-6 pb-2">
            <div className="bg-secondary/40 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Rang #{user.rank} au classement</span>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 pt-3 flex flex-col gap-2">
            {me?.email !== user.email && (
              isFollowing ? (
                <Button variant="outline" onClick={() => unfollowMutation.mutate()}
                  disabled={unfollowMutation.isPending}
                  className="w-full gap-2 border-green-500/30 text-green-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300">
                  <UserCheck className="w-4 h-4" />
                  {isMutual ? "Amis — Se désabonner" : "Abonné — Se désabonner"}
                </Button>
              ) : (
                <Button onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                  className="w-full gap-2">
                  <UserPlus className="w-4 h-4" />
                  {reverseFollows.length > 0 ? "Accepter (suit déjà)" : "Suivre"}
                </Button>
              )
            )}
            <p className="text-xs text-center text-muted-foreground">
              {isMutual ? "Vous êtes amis · Ses activités apparaissent dans votre feed" :
               isFollowing ? "Vous le suivez · Ses activités apparaissent dans votre feed" :
               "Suivez cet utilisateur pour voir ses activités dans votre feed"}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}