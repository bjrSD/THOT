import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Flame, Calendar, Loader2, TrendingUp } from "lucide-react";
import {
  format, subDays, startOfYear, eachDayOfInterval,
  getDay, isSameDay, differenceInDays
} from "date-fns";
import { fr } from "date-fns/locale";

import HeatmapGrid from "@/components/heatmap/HeatmapGrid";
import HeatmapStats from "@/components/heatmap/HeatmapStats";
import HeatmapInsights from "@/components/heatmap/HeatmapInsights";
import HeatmapWeeklyBar from "@/components/heatmap/HeatmapWeeklyBar";
import HeatmapCoach from "@/components/heatmap/HeatmapCoach";

const RANGE_OPTIONS = [
  { label: "7 j", days: 7 },
  { label: "30 j", days: 30 },
  { label: "90 j", days: 90 },
  { label: "Année", days: null },
];

function buildWeeks(days) {
  const yearStart = days[0];
  const startPad = getDay(yearStart) === 0 ? 6 : getDay(yearStart) - 1;
  let currentWeek = Array(startPad).fill(null);
  const weeks = [];
  days.forEach(day => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }
  return weeks;
}

function computeStats(dayMap, currentStreak) {
  const today = new Date();
  const activeDays = Object.values(dayMap).filter(v => v > 0).length;

  // Best streak
  let bestStreak = 0;
  let streak = 0;
  const sorted = Object.keys(dayMap).sort();
  for (let i = 0; i < sorted.length; i++) {
    if (dayMap[sorted[i]] > 0) {
      if (i === 0) { streak = 1; }
      else {
        const prev = new Date(sorted[i - 1]);
        const curr = new Date(sorted[i]);
        if (differenceInDays(curr, prev) === 1) streak++;
        else streak = 1;
      }
      if (streak > bestStreak) bestStreak = streak;
    }
  }

  // Regularity 30 days
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = subDays(today, i);
    return format(d, "yyyy-MM-dd");
  });
  const activeLast30 = last30.filter(k => (dayMap[k] || 0) > 0).length;
  const regularity30 = Math.round((activeLast30 / 30) * 100);

  // Weekly average (active days per week over last 12 weeks)
  const activeLast84 = Array.from({ length: 84 }, (_, i) => {
    const d = subDays(today, i);
    return format(d, "yyyy-MM-dd");
  }).filter(k => (dayMap[k] || 0) > 0).length;
  const weeklyAvg = Math.round(activeLast84 / 12);

  // KP this month
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const kpThisMonth = Object.entries(dayMap)
    .filter(([k]) => new Date(k) >= monthStart)
    .reduce((s, [, v]) => s + v, 0);

  return { activeDays, bestStreak, regularity30, weeklyAvg, currentStreak: currentStreak || 0, kpThisMonth };
}

export default function Heatmap() {
  const [user, setUser] = useState(null);
  const [rangeIdx, setRangeIdx] = useState(3); // default: full year

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities-heatmap"],
    queryFn: () => base44.entities.Activity.list("-created_date", 500),
  });

  const today = new Date();

  const rangeOption = RANGE_OPTIONS[rangeIdx];
  const rangeStart = rangeOption.days ? subDays(today, rangeOption.days - 1) : startOfYear(today);
  const days = eachDayOfInterval({ start: rangeStart, end: today });

  // Build day map
  const dayMap = useMemo(() => {
    const map = {};
    activities.forEach(a => {
      if (!a.created_date) return;
      const key = format(new Date(a.created_date), "yyyy-MM-dd");
      map[key] = (map[key] || 0) + (a.kp_earned || 5);
    });
    return map;
  }, [activities]);

  const weeks = useMemo(() => buildWeeks(days), [days]);
  const stats = useMemo(() => computeStats(dayMap, user?.current_streak), [dayMap, user]);

  const totalKP = Object.values(dayMap).reduce((a, b) => a + b, 0);

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-accent" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/20 via-accent/10 to-primary/20 border border-green-500/20 p-6">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute right-5 top-4 text-4xl"
        >🔥</motion.div>
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-7 h-7 text-green-500" />
          <h1 className="font-heading text-2xl font-bold">Carte d'activité</h1>
        </div>
        <p className="text-muted-foreground text-sm">Visualisez vos rythmes, votre régularité et vos moments forts d'apprentissage</p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1.5 font-medium">
            <Flame className="w-4 h-4 text-orange-500" />
            {user?.current_streak || 0} jours de streak actuel
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            {stats.activeDays} jours actifs cette année
          </span>
        </div>
      </div>

      {/* Range selector */}
      <div className="flex gap-1.5 bg-secondary p-1 rounded-xl w-fit">
        {RANGE_OPTIONS.map((opt, i) => (
          <button
            key={opt.label}
            onClick={() => setRangeIdx(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              rangeIdx === i ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Coach message */}
      <HeatmapCoach stats={stats} dayMap={dayMap} />

      {/* Stats */}
      <HeatmapStats stats={stats} />

      {/* Heatmap grid */}
      <HeatmapGrid
        weeks={weeks}
        dayMap={dayMap}
        activities={activities}
        today={today}
        range={rangeOption}
      />

      {/* Weekly pattern bar chart */}
      <HeatmapWeeklyBar dayMap={dayMap} />

      {/* Insights */}
      <HeatmapInsights dayMap={dayMap} stats={stats} />

      {/* Public streaks */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" /> Streaks publics
        </h3>
        <div className="space-y-2">
          {[
            { name: "Marie D.", streak: 42 },
            { name: "Karim B.", streak: 31 },
            { name: "Sophie L.", streak: 28 },
            { name: "Vous", streak: user?.current_streak || 0, isMe: true },
          ].sort((a, b) => b.streak - a.streak).map((u, i) => (
            <div key={u.name} className={`flex items-center justify-between p-2.5 rounded-lg ${u.isMe ? "bg-accent/10 border border-accent/20" : "bg-secondary/50"}`}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-muted-foreground">#{i + 1}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${u.isMe ? "bg-accent text-accent-foreground" : "bg-secondary"}`}>
                  {u.name[0]}
                </div>
                <span className="font-medium text-sm">{u.name}</span>
              </div>
              <span className="flex items-center gap-1 text-orange-500 font-bold text-sm">
                🔥 {u.streak} jours
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}