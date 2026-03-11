import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import StatsRow from "@/components/dashboard/StatsRow";
import WeeklyChart from "@/components/dashboard/WeeklyChart";
import ContentPieChart from "@/components/dashboard/ContentPieChart";
import RadarDomains from "@/components/dashboard/RadarDomains";
import ActivityFeed from "@/components/dashboard/ActivityFeed";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: contents = [], isLoading: loadingContents } = useQuery({
    queryKey: ["contents"],
    queryFn: () => base44.entities.Content.list("-updated_date", 100),
  });

  const { data: activities = [], isLoading: loadingActivities } = useQuery({
    queryKey: ["activities"],
    queryFn: () => base44.entities.Activity.list("-created_date", 20),
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">
          Bonjour, {user.full_name?.split(" ")[0] || "apprenant"} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Votre progression d'apprentissage</p>
      </div>

      <StatsRow user={user} />

      <div className="grid lg:grid-cols-2 gap-6">
        <WeeklyChart activities={activities} />
        <ContentPieChart contents={contents} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <RadarDomains user={user} />
        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
}