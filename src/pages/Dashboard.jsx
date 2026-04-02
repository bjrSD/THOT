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
import DetailedStats from "@/components/dashboard/DetailedStats";
import { getUserLevel, getNextLevel, getLevelProgress } from "@/components/shared/KPUtils";
import { Progress } from "@/components/ui/progress";

// ─── Mini stat card ────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, bg, progress, nextLevel, delay = 0, small = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-card border border-border rounded-lg p-2.5 flex flex-col gap-1 hover:shadow-md transition-shadow ${small ? "" : ""}`}
    >
      <div className="flex items-center justify-between gap-1.5">
        <p className={`font-medium text-muted-foreground uppercase tracking-wide ${small ? "text-[10px]" : "text-xs"}`}>{label}</p>
        <div className={`rounded-lg ${bg} flex items-center justify-center shrink-0 ${small ? "w-5 h-5" : "w-6 h-6"}`}>
          <Icon className={`${small ? "w-2.5 h-2.5" : "w-3 h-3"} ${color}`} />
        </div>
      </div>
      <p className={`font-black leading-none ${small ? "text-lg" : "text-2xl"}`}>{value}</p>
      {sub && <p className={`text-muted-foreground ${small ? "text-[10px]" : "text-xs"}`}>{sub}</p>}
      {progress !== undefined && nextLevel && !small && (
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

      {/* ── Row 1 : KPI stats compact + daily challenge ─────────────────────────── */}
      <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
        <StatCard icon={Flame}     label="Streak"     value={`${streak}j`}                  sub="jours"                       color="text-orange-500" bg="bg-orange-500/10" delay={0.0} small={true} />
        <StatCard icon={Star}      label="KP"         value={kp >= 1000 ? `${(kp/1000).toFixed(1)}k` : kp} sub="totaux"          color="text-accent"     bg="bg-accent/10"     delay={0.05} small={true} />
        <StatCard icon={TrendingUp} label="Niveau"    value={level.icon}                   sub={level.name.split(" ")[0]}   color="text-green-500"  bg="bg-green-500/10"  delay={0.1} small={true} />
        <StatCard icon={BookOpen}  label="Terminés"   value={totalCompleted}                 sub="contents"                    color="text-primary"    bg="bg-primary/10"    delay={0.15} small={true} />
        <div className="col-span-4 md:col-span-1">
          <DailyChallenge />
        </div>
      </div>

      {/* ── Row 2 : Detailed stats + Weekly chart + Pie ────────────────────────── */}
      <div className="grid lg:grid-cols-4 gap-3">
        <div className="lg:col-span-1 bg-card border border-border rounded-lg p-3">
          <DetailedStats contents={contents} />
        </div>
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

      {/* ── Row 5 : In-progress contents quick view (secondary) ─────────────────── */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">En cours de lecture</h3>
          <Link to={createPageUrl("Library")} className="text-xs text-accent hover:underline">Voir tout →</Link>
        </div>
        {inProgressCount === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Aucun contenu en cours</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {contents.filter(c => c.status === "in_progress").slice(0, 4).map(c => {
              const prog = c.total_pages
                ? Math.round(((c.current_page || 0) / c.total_pages) * 100)
                : c.total_duration
                ? Math.round(((c.current_duration || 0) / c.total_duration) * 100)
                : 0;
              return (
                <Link key={c.id} to={createPageUrl("ContentDetail") + `?id=${c.id}`} className="flex flex-col gap-2 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  {c.cover_url
                    ? <img src={c.cover_url} alt={c.title} className="w-full h-16 object-cover rounded shrink-0" />
                    : <div className="w-full h-16 rounded bg-accent/10 flex items-center justify-center shrink-0"><BookOpen className="w-3 h-3 text-accent" /></div>
                  }
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{c.title}</p>
                    <Progress value={prog} className="h-1 mt-1" />
                    <p className="text-[10px] text-muted-foreground mt-0.5">{prog}%</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Row 6 : VocabAI + Suggestions ─────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-4">
        <VocabAI contents={contents} />
        <Suggestions contents={contents} />
      </div>
    </div>
  );
}