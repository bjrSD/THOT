import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Flame, BookOpen, Headphones, Play, FileText, Share2, Trophy, Star, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const LEVEL_CONFIG = [
  { min: 0, name: "Curieux 🔍", color: "text-slate-500" },
  { min: 500, name: "Lecteur 📖", color: "text-blue-500" },
  { min: 1500, name: "Penseur 💭", color: "text-purple-500" },
  { min: 3000, name: "Érudit 🎓", color: "text-accent" },
  { min: 6000, name: "Polymathe 🧠", color: "text-yellow-500" },
];

function getLevel(kp) {
  return [...LEVEL_CONFIG].reverse().find(l => (kp || 0) >= l.min) || LEVEL_CONFIG[0];
}

export default function PublicProfile() {
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: contents = [], isLoading } = useQuery({
    queryKey: ["contents-pub"],
    queryFn: () => base44.entities.Content.filter({ status: "completed" }, "-updated_date", 100),
  });

  const level = getLevel(user?.total_kp);
  const books = contents.filter(c => c.type === "book").length;
  const podcasts = contents.filter(c => c.type === "podcast").length;
  const videos = contents.filter(c => c.type === "video").length;
  const articles = contents.filter(c => c.type === "article").length;

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const widgetText = `🧠 ${user?.full_name} sur THOT
🔥 ${user?.current_streak || 0} jours de streak
📚 ${books} livres lus
🎙️ ${podcasts} podcasts
⭐ ${user?.total_kp || 0} KP — ${level.name}
→ rejoins THOT !`;

  const copyWidget = () => {
    navigator.clipboard.writeText(widgetText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user || isLoading) return (
    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Public profile card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-accent text-white p-8"
      >
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <motion.div key={i}
              animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }}
              transition={{ repeat: Infinity, duration: 3 + i * 0.3, delay: i * 0.2 }}
              className="absolute w-1.5 h-1.5 bg-white rounded-full"
              style={{ left: `${(i * 5.3) % 100}%`, top: `${(i * 7.1) % 100}%` }}
            />
          ))}
        </div>
        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl font-bold border-2 border-white/30">
                {user.full_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold">{user.full_name}</h1>
                <p className={`text-sm font-medium opacity-90`}>{level.name}</p>
                {user.bio && <p className="text-sm text-white/70 mt-1 max-w-xs">{user.bio}</p>}
              </div>
            </div>
            <Button onClick={handleShare} variant="ghost" className="text-white hover:bg-white/20 gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {copied ? "Copié !" : "Partager"}
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: Flame, value: user.current_streak || 0, label: "Streak", color: "text-orange-300" },
              { icon: BookOpen, value: books, label: "Livres", color: "text-blue-300" },
              { icon: Headphones, value: podcasts, label: "Podcasts", color: "text-green-300" },
              { icon: Star, value: (user.total_kp || 0).toLocaleString(), label: "KP", color: "text-yellow-300" },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
                <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
                <p className="text-xl font-black">{stat.value}</p>
                <p className="text-xs opacity-70">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats breakdown */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: BookOpen, label: "Livres lus", value: books, color: "text-blue-500", bg: "bg-blue-500/10" },
          { icon: Headphones, label: "Podcasts", value: podcasts, color: "text-green-500", bg: "bg-green-500/10" },
          { icon: Play, label: "Vidéos", value: videos, color: "text-red-500", bg: "bg-red-500/10" },
          { icon: FileText, label: "Articles", value: articles, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
            className={`${s.bg} border border-border rounded-2xl p-4 flex items-center gap-3`}>
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div>
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Shareable widget */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-accent" /> Widget partageable
        </h3>
        <pre className="bg-secondary/50 rounded-xl p-4 text-sm whitespace-pre-wrap font-mono text-muted-foreground">{widgetText}</pre>
        <Button onClick={copyWidget} className="w-full mt-3 gap-2" variant="outline">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copié !" : "Copier le widget"}
        </Button>
      </div>
    </div>
  );
}