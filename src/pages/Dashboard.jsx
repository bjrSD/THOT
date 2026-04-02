import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Crown, Flame, Star, BookOpen, TrendingUp, Zap, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import WeeklyChart from "@/components/dashboard/WeeklyChart";
import ContentPieChart from "@/components/dashboard/ContentPieChart";
import RadarDomains from "@/components/dashboard/RadarDomains";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import StreakAlert from "@/components/dashboard/StreakAlert";
import DailyChallenge from "@/components/dashboard/DailyChallenge";
import Suggestions from "@/components/dashboard/Suggestions";
import ArchetypeCard from "@/components/dashboard/ArchetypeCard";
import VocabAI from "@/components/dashboard/VocabAI";
import { getUserLevel, getNextLevel, getLevelProgress } from "@/components/shared/KPUtils";
import { Progress } from "@/components/ui/progress";

// ─── Mini stat card ────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, bg, progress, nextLevel, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-1.5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-3.5 h-3.5 ${color}`} />
        </div>
      </div>
      <p className="text-2xl font-black leading-none">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      {progress !== undefined && nextLevel && (
        <div className="mt-1">
          <Progress value={progress} className="h-1" />
          <p className="text-xs text-muted-foreground mt-1">→ {nextLevel.icon} {nextLevel.name} ({progress}%)</p>
        </div>
      )}
    </motion.div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: contents = [] } = useQuery({
    queryKey: ["contents"],
    queryFn: () => base44.entities.Content.list("-updated_date", 100),
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["activities"],
    queryFn: () => base44.entities.Activity.list("-created_date", 30),
  });

  if (!user) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-accent" />
    </div>
  );

  const streak = user.current_streak || 0;
  const kp = user.total_kp || 0;
  const level = getUserLevel(kp);
  const nextLevel = getNextLevel(kp);
  const progress = getLevelProgress(kp);
  const isPremium = user.role === "admin" || user.is_premium;
  const totalCompleted = (user.books_completed || 0) + (user.podcasts_completed || 0) + (user.videos_completed || 0) + (user.articles_completed || 0);
  const inProgressCount = contents.filter(c => c.status === "in_progress").length;

  return (
    <div className="space-y-4">

      {/* ── Row 0 : greeting ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="font-heading text-2xl md:text-3xl font-bold">
              Bonjour, {user.full_name?.split(" ")[0] || "apprenant"} 👋
            </h1>
            {isPremium && (
              <span className="inline-flex items-center gap-1 text-xs bg-yellow-500/15 text-yellow-600 border border-yellow-500/20 px-2 py-0.5 rounded-full font-medium">
                <Crown className="w-3 h-3" /> Premium
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{level.icon} {level.name} · {kp.toLocaleString()} KP</p>
        </div>
        <AnimatePresence>
          {streak > 0 && <StreakAlert streak={streak} />}
        </AnimatePresence>
      </div>

      {/* ── Row 1 : 4 KPI stats + daily challenge ─────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-5 gap-3">
        <StatCard icon={Flame}     label="Streak"     value={`${streak}j`}                  sub="jours consécutifs"           color="text-orange-500" bg="bg-orange-500/10" delay={0.0} />
        <StatCard icon={Star}      label="KP totaux"  value={kp.toLocaleString()}            sub="Knowledge Points"            color="text-accent"     bg="bg-accent/10"     delay={0.05} />
        <StatCard icon={TrendingUp} label="Niveau"    value={`${level.icon} ${level.name}`} sub={`${progress}% vers suivant`} color="text-green-500"  bg="bg-green-500/10"  delay={0.1} progress={progress} nextLevel={nextLevel} />
        <StatCard icon={BookOpen}  label="Terminés"   value={totalCompleted}                 sub="contenus complétés"          color="text-primary"    bg="bg-primary/10"    delay={0.15} />
        <div className="col-span-2 sm:col-span-4 xl:col-span-1 h-full">
          <DailyChallenge />
        </div>
      </div>

      {/* ── Row 2 : Weekly chart (wide) + Pie (narrow) ────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <WeeklyChart activities={activities} />
        </div>
        <ContentPieChart contents={contents} />
      </div>

      {/* ── Row 3 : Radar + Activity feed ─────────────────────────────────────── */}
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <RadarDomains user={user} />
        </div>
        <div className="lg:col-span-3">
          <ActivityFeed activities={activities} />
        </div>
      </div>

      {/* ── Row 4 : Archetype (full width) ────────────────────────────────────── */}
      <ArchetypeCard contents={contents} />

      {/* ── Row 5 : In-progress contents quick view + quick links ─────────────── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* In-progress books/podcasts */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">En cours de lecture</h3>
            <Link to={createPageUrl("Library")} className="text-xs text-accent hover:underline">Voir tout →</Link>
          </div>
          {inProgressCount === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Aucun contenu en cours. Commencez quelque chose !</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {contents.filter(c => c.status === "in_progress").slice(0, 4).map(c => {
                const prog = c.total_pages
                  ? Math.round(((c.current_page || 0) / c.total_pages) * 100)
                  : c.total_duration
                  ? Math.round(((c.current_duration || 0) / c.total_duration) * 100)
                  : 0;
                return (
                  <Link key={c.id} to={createPageUrl("ContentDetail") + `?id=${c.id}`} className="flex gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                    {c.cover_url
                      ? <img src={c.cover_url} alt={c.title} className="w-10 h-14 object-cover rounded-lg shrink-0" />
                      : <div className="w-10 h-14 rounded-lg bg-accent/10 flex items-center justify-center shrink-0"><BookOpen className="w-4 h-4 text-accent" /></div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.title}</p>
                      {c.author && <p className="text-xs text-muted-foreground truncate">{c.author}</p>}
                      <div className="mt-2">
                        <Progress value={prog} className="h-1.5" />
                        <p className="text-xs text-muted-foreground mt-0.5">{prog}%</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick navigation tiles */}
        <div className="grid grid-cols-2 gap-3 content-start">
          {[
            { label: "Carte du cerveau", emoji: "🧠", page: "BrainMap", color: "from-purple-500/15 to-accent/10 border-purple-500/20" },
            { label: "Heatmap", emoji: "🔥", page: "Heatmap", color: "from-orange-500/15 to-red-500/10 border-orange-500/20" },
            { label: "Rapports", emoji: "📊", page: "Reports", color: "from-green-500/15 to-accent/10 border-green-500/20" },
            { label: "Découvrir", emoji: "🔭", page: "Discover", color: "from-blue-500/15 to-accent/10 border-blue-500/20" },
          ].map(item => (
            <Link key={item.page} to={createPageUrl(item.page)}
              className={`bg-gradient-to-br ${item.color} border rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md transition-shadow`}>
              <span className="text-2xl">{item.emoji}</span>
              <p className="text-sm font-semibold leading-tight">{item.label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Row 6 : VocabAI + Suggestions ─────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-4">
        <VocabAI contents={contents} />
        <Suggestions contents={contents} />
      </div>
    </div>
  );
}