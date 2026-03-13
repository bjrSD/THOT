import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import StatsRow from "@/components/dashboard/StatsRow";
import WeeklyChart from "@/components/dashboard/WeeklyChart";
import ContentPieChart from "@/components/dashboard/ContentPieChart";
import RadarDomains from "@/components/dashboard/RadarDomains";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import StreakAlert from "@/components/dashboard/StreakAlert";
import DailyChallenge from "@/components/dashboard/DailyChallenge";
import Suggestions from "@/components/dashboard/Suggestions";
import KnowledgeStats from "@/components/dashboard/KnowledgeStats";

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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">
          Bonjour, {user.full_name?.split(" ")[0] || "apprenant"} 👋
        </h1>
        <p className="text-muted-foreground mt-0.5">Votre progression d'apprentissage</p>
      </div>

      {/* Streak alert — show if streak > 0 (simulating "expires today") */}
      <AnimatePresence>
        {streak > 0 && <StreakAlert streak={streak} />}
      </AnimatePresence>

      {/* Daily challenge */}
      <DailyChallenge />

      {/* Stats row */}
      <StatsRow user={user} />

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        <WeeklyChart activities={activities} />
        <ContentPieChart contents={contents} />
      </div>

      {/* Bottom section */}
      <div className="grid lg:grid-cols-2 gap-5">
        <RadarDomains user={user} />
        <ActivityFeed activities={activities} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Suggestions contents={contents} />
      </div>
    </div>
  );
}