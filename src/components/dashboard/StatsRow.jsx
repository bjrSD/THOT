import React from "react";
import { Flame, Star, TrendingUp, BookOpen } from "lucide-react";
import { getUserLevel, getNextLevel, getLevelProgress } from "../shared/KPUtils";
import { Progress } from "@/components/ui/progress";

export default function StatsRow({ user }) {
  const kp = user?.total_kp || 0;
  const level = getUserLevel(kp);
  const nextLevel = getNextLevel(kp);
  const progress = getLevelProgress(kp);

  const stats = [
    {
      label: "Streak actuel",
      value: `${user?.current_streak || 0} jours`,
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "KP gagnés",
      value: `${(kp).toLocaleString()} KP`,
      icon: Star,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Niveau",
      value: `${level.icon} ${level.name}`,
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10",
      progress: progress,
      nextLevel: nextLevel,
    },
    {
      label: "Contenus terminés",
      value: (user?.books_completed || 0) + (user?.podcasts_completed || 0) + (user?.videos_completed || 0) + (user?.articles_completed || 0),
      icon: BookOpen,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s, i) => (
        <div key={i} className="bg-card rounded-xl border border-border p-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide leading-tight">{s.label}</p>
            <div className={`w-6 h-6 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={`w-3 h-3 ${s.color}`} />
            </div>
          </div>
          <p className="text-lg font-bold leading-none">{s.value}</p>
          {s.progress !== undefined && s.nextLevel && (
            <div className="mt-2">
              <Progress value={s.progress} className="h-1" />
              <p className="text-[10px] text-muted-foreground mt-0.5">
                → {s.nextLevel.icon} {s.nextLevel.name} ({s.progress}%)
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}