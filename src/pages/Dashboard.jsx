import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Crown } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import StatsRow from "@/components/dashboard/StatsRow";
import WeeklyChart from "@/components/dashboard/WeeklyChart";
import ContentPieChart from "@/components/dashboard/ContentPieChart";
import RadarDomains from "@/components/dashboard/RadarDomains";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import StreakAlert from "@/components/dashboard/StreakAlert";
import DailyChallenge from "@/components/dashboard/DailyChallenge";
import Suggestions from "@/components/dashboard/Suggestions";
import VocabStatsRow from "@/components/dashboard/VocabStatsRow";
import ContentStatsTab from "@/components/dashboard/ContentStatsTab";
import VocabAI from "@/components/dashboard/VocabAI";
import ArchetypeCard from "@/components/dashboard/ArchetypeCard";
import { getUserLevel, getNextLevel, getLevelProgress } from "@/components/shared/KPUtils";
import { Progress } from "@/components/ui/progress";

// Quick links removed — already accessible via the sidebar nav

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: contents = [] } = useQuery({
    queryKey: ["contents"],
    queryFn: () => base44.entities.Content.list("-updated_date", 100),
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["activities"],
    queryFn: () => base44.entities.Activity.list("-created_date", 30),
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const streak = user.current_streak || 0;
  const kp = user.total_kp || 0;
  const level = getUserLevel(kp);
  const nextLevel = getNextLevel(kp);
  const progress = getLevelProgress(kp);
  const isPremium = user.role === "admin" || user.is_premium;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-heading text-2xl md:text-3xl font-bold">
              Bonjour, {user.full_name?.split(" ")[0] || "apprenant"} 👋
            </h1>
            {isPremium && (
              <span className="inline-flex items-center gap-1 text-xs bg-yellow-500/15 text-yellow-600 border border-yellow-500/20 px-2 py-0.5 rounded-full font-medium">
                <Crown className="w-3 h-3" /> Premium
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">{level.icon} {level.name}</span>
            <div className="w-32">
              <Progress value={progress} className="h-1.5" />
            </div>
            <span className="text-xs text-muted-foreground">
              {nextLevel ? `${progress}% → ${nextLevel.icon} ${nextLevel.name}` : "Niveau max 🏆"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{kp.toLocaleString()} KP au total</p>
        </div>
      </div>

      {/* Streak alert */}
      <AnimatePresence>
        {streak > 0 && <StreakAlert streak={streak} />}
      </AnimatePresence>

      {/* Daily challenge */}
      <DailyChallenge />

      {/* Stats row */}
      <StatsRow user={user} />

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <WeeklyChart activities={activities} />
        <ContentPieChart contents={contents} />
      </div>

      {/* Bottom section */}
      <div className="grid lg:grid-cols-2 gap-4">
        <RadarDomains user={user} />
        <ActivityFeed activities={activities} />
      </div>

      {/* Profil intellectuel */}
      <ArchetypeCard contents={contents} />

      {/* Detailed stats by content type */}
      <ContentStatsTab contents={contents} />

      {/* Vocab stats + Capital Savoir chart */}
      <VocabStatsRow contents={contents} />

      {/* Vocab AI + Suggestions */}
      <div className="grid lg:grid-cols-2 gap-4">
        <VocabAI contents={contents} />
        <Suggestions contents={contents} />
      </div>
    </div>
  );
}