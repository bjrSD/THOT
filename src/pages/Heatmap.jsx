import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Flame, Calendar, Loader2, TrendingUp } from "lucide-react";
import { format, subDays, startOfYear, eachDayOfInterval, getDay, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";

const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
const DAYS = ["L", "M", "M", "J", "V", "S", "D"];

function getIntensity(kp) {
  if (kp === 0) return 0;
  if (kp < 10) return 1;
  if (kp < 30) return 2;
  if (kp < 60) return 3;
  return 4;
}

const INTENSITY_CLASSES = [
  "bg-secondary/40",
  "bg-accent/20",
  "bg-accent/45",
  "bg-accent/70",
  "bg-accent",
];

export default function Heatmap() {
  const [user, setUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities-heatmap"],
    queryFn: () => base44.entities.Activity.list("-created_date", 500),
  });

  const today = new Date();
  const yearStart = startOfYear(today);
  const days = eachDayOfInterval({ start: yearStart, end: today });

  // Build day map from activities
  const dayMap = {};
  activities.forEach(a => {
    if (!a.created_date) return;
    const key = format(new Date(a.created_date), "yyyy-MM-dd");
    dayMap[key] = (dayMap[key] || 0) + (a.kp_earned || 5);
  });

  const totalActiveDays = Object.keys(dayMap).length;
  const totalKP = Object.values(dayMap).reduce((a, b) => a + b, 0);

  // Group by week
  const weeks = [];
  const startPad = getDay(yearStart) === 0 ? 6 : getDay(yearStart) - 1;
  let currentWeek = Array(startPad).fill(null);
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

  if (isLoading) return (
    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/20 via-accent/10 to-primary/20 border border-green-500/20 p-6">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3 }}
          className="absolute right-5 top-4 text-4xl">🔥</motion.div>
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-7 h-7 text-green-500" />
          <h1 className="font-heading text-2xl font-bold">Heatmap annuelle</h1>
        </div>
        <p className="text-muted-foreground text-sm">Chaque case colorée = un jour d'apprentissage actif</p>
        <div className="mt-3 flex gap-4 text-sm">
          <span className="flex items-center gap-1.5 font-medium">
            <Flame className="w-4 h-4 text-orange-500" /> {user?.current_streak || 0} jours de streak
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <TrendingUp className="w-4 h-4" /> {totalActiveDays} jours actifs cette année
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Jours actifs", value: totalActiveDays, icon: "📅" },
          { label: "Streak actuel", value: `${user?.current_streak || 0}j`, icon: "🔥" },
          { label: "KP gagnés", value: totalKP.toLocaleString(), icon: "⭐" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <p className="text-xl font-black">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="bg-card border border-border rounded-2xl p-5 overflow-x-auto">
        <div className="flex gap-1 mb-2">
          {MONTHS.map((m, i) => (
            <div key={m} className="text-xs text-muted-foreground" style={{ minWidth: `${weeks.filter((_, wi) => {
              const d = weeks[wi]?.find(Boolean);
              return d && new Date(d).getMonth() === i;
            }).length * 14}px` }}>{m}</div>
          ))}
        </div>
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-1">
            {DAYS.map((d, i) => (
              <div key={i} className={`w-3 h-3 flex items-center justify-center text-xs text-muted-foreground ${i % 2 === 0 ? "opacity-0" : ""}`}>{d}</div>
            ))}
          </div>
          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => {
                if (!day) return <div key={di} className="w-3 h-3" />;
                const key = format(day, "yyyy-MM-dd");
                const kp = dayMap[key] || 0;
                const intensity = getIntensity(kp);
                const isToday = isSameDay(day, today);
                return (
                  <motion.div
                    key={di}
                    title={`${format(day, "d MMM", { locale: fr })} — ${kp} KP`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: wi * 0.01 }}
                    className={`w-3 h-3 rounded-sm ${INTENSITY_CLASSES[intensity]} transition-all hover:scale-125 cursor-pointer ${isToday ? "ring-1 ring-accent ring-offset-1" : ""}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 justify-end">
          <span className="text-xs text-muted-foreground">Moins</span>
          {INTENSITY_CLASSES.map((cls, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${cls}`} />
          ))}
          <span className="text-xs text-muted-foreground">Plus</span>
        </div>
      </div>

      {/* Streaks leaderboard */}
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
                <span className="text-sm font-bold text-muted-foreground">#{i+1}</span>
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