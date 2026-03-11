import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, BookOpen, Headphones, Play, FileText, Trophy, Flame, Star, Edit2, Save, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { LEVELS, BADGES, getUserLevel, getNextLevel, getLevelProgress } from "@/components/shared/KPUtils";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setEditForm({ bio: u?.bio || "" });
    });
  }, []);

  const { data: contents = [] } = useQuery({
    queryKey: ["contents"],
    queryFn: () => base44.entities.Content.list("-updated_date", 200),
  });

  const handleSave = async () => {
    await base44.auth.updateMe(editForm);
    setUser({ ...user, ...editForm });
    setEditing(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const kp = user.total_kp || 0;
  const level = getUserLevel(kp);
  const nextLevel = getNextLevel(kp);
  const levelProgress = getLevelProgress(kp);

  const completed = contents.filter(c => c.status === "completed");
  const byType = {
    book: completed.filter(c => c.type === "book").length,
    podcast: completed.filter(c => c.type === "podcast").length,
    video: completed.filter(c => c.type === "video").length,
    article: completed.filter(c => c.type === "article").length,
  };

  const earnedBadges = BADGES.filter(b => b.condition(user));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary to-accent opacity-80" />
          <div className="px-6 pb-6">
            <div className="-mt-10 mb-4 flex items-end justify-between">
              <div className="w-20 h-20 rounded-2xl bg-card border-4 border-card shadow-lg flex items-center justify-center">
                <span className="text-3xl">{level.icon}</span>
              </div>
              <div className="flex gap-2 mb-1">
                <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
                  <Edit2 className="w-4 h-4 mr-1.5" /> Modifier
                </Button>
                <Button variant="ghost" size="sm" onClick={() => base44.auth.logout()}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <h1 className="font-heading text-2xl font-bold">{user.full_name}</h1>
            <p className="text-muted-foreground text-sm">{user.email}</p>
            {editing ? (
              <div className="mt-3 space-y-2">
                <Label>Bio</Label>
                <Input value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Parlez-nous de vous..." />
                <Button size="sm" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-1.5" /> Sauvegarder
                </Button>
              </div>
            ) : (
              user.bio && <p className="text-sm text-muted-foreground mt-2">{user.bio}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Level & XP */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold">Niveau & Progression</h2>
            <span className="text-xl font-bold text-accent">{kp.toLocaleString()} KP</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{level.icon}</span>
            <div>
              <p className="font-bold">{level.name}</p>
              {nextLevel && <p className="text-xs text-muted-foreground">Prochain niveau : {nextLevel.icon} {nextLevel.name}</p>}
            </div>
          </div>
          {nextLevel && (
            <>
              <Progress value={levelProgress} className="h-2.5" />
              <p className="text-xs text-muted-foreground mt-1">{levelProgress}% vers {nextLevel.name}</p>
            </>
          )}
          {/* Level ladder */}
          <div className="mt-6 grid grid-cols-4 md:grid-cols-7 gap-2">
            {LEVELS.map(l => (
              <div key={l.name} className={`text-center p-2 rounded-xl ${l.name === level.name ? "bg-accent/15 ring-1 ring-accent" : "bg-secondary/50"}`}>
                <p className="text-lg">{l.icon}</p>
                <p className="text-xs font-medium truncate">{l.name}</p>
                <p className="text-xs text-muted-foreground">{l.minKP}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-heading font-semibold mb-4">Statistiques</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Livres lus", value: byType.book, icon: BookOpen, color: "text-primary" },
              { label: "Podcasts", value: byType.podcast, icon: Headphones, color: "text-accent" },
              { label: "Vidéos", value: byType.video, icon: Play, color: "text-green-500" },
              { label: "Articles", value: byType.article, icon: FileText, color: "text-orange-500" },
            ].map((s, i) => (
              <div key={i} className="text-center p-4 bg-secondary/40 rounded-xl">
                <s.icon className={`w-6 h-6 ${s.color} mx-auto mb-2`} />
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-4 bg-orange-500/5 rounded-xl flex items-center gap-3">
              <Flame className="w-6 h-6 text-orange-500" />
              <div>
                <p className="text-xl font-bold">{user.current_streak || 0}</p>
                <p className="text-xs text-muted-foreground">Streak actuel</p>
              </div>
            </div>
            <div className="p-4 bg-yellow-500/5 rounded-xl flex items-center gap-3">
              <Star className="w-6 h-6 text-yellow-500" />
              <div>
                <p className="text-xl font-bold">{user.longest_streak || 0}</p>
                <p className="text-xs text-muted-foreground">Meilleur streak</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Badges */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h2 className="font-heading font-semibold">Badges</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BADGES.map(badge => {
              const earned = badge.condition(user);
              return (
                <div key={badge.id} className={`p-3 rounded-xl text-center transition-all ${earned ? "bg-yellow-500/10 ring-1 ring-yellow-500/30" : "bg-secondary/40 opacity-50 grayscale"}`}>
                  <p className="text-2xl mb-1">{badge.icon}</p>
                  <p className="text-xs font-medium">{badge.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{badge.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}