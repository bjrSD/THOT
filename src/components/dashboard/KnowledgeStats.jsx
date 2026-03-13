import React from "react";
import { TrendingUp, BookOpen, Brain } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const CAPITAL_DATA = [
  { day: "1 Fév", kp: 320 }, { day: "5 Fév", kp: 480 }, { day: "10 Fév", kp: 420 },
  { day: "15 Fév", kp: 720 }, { day: "20 Fév", kp: 650 }, { day: "25 Fév", kp: 890 },
  { day: "1 Mar", kp: 1050 }, { day: "5 Mar", kp: 980 }, { day: "10 Mar", kp: 1280 },
  { day: "12 Mar", kp: 1420 },
];

const PROFILE_DATA = [
  { name: "Romans Français", value: 40, color: "#e879f9" },
  { name: "Documentaires", value: 30, color: "#38bdf8" },
  { name: "Dev. Personnel", value: 20, color: "#4ade80" },
  { name: "Cinéma", value: 10, color: "#fbbf24" },
];

const WORD_STATS = [
  { label: "Total mots assimilés", value: "2 700", trend: "+12%", icon: Brain, color: "text-fuchsia-500", bg: "bg-fuchsia-500/10" },
  { label: "Taille du vocabulaire", value: "1 695", trend: "+8%", icon: BookOpen, color: "text-sky-500", bg: "bg-sky-500/10" },
  { label: "Nouveaux mots", value: "97", trend: "+23%", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
];

export default function KnowledgeStats() {
  return (
    <div className="space-y-5">
      {/* Word stats cards */}
      <div className="grid grid-cols-3 gap-4">
        {WORD_STATS.map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
            </div>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-500 font-medium">{s.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Capital Savoir AreaChart */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-sm">Capital Savoir — 30 derniers jours</h3>
            <p className="text-xs text-muted-foreground">Évolution de votre progression</p>
          </div>
          <span className="text-xs bg-fuchsia-500/10 text-fuchsia-500 px-2.5 py-1 rounded-full font-medium">▲ +23%</span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={CAPITAL_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="fuchsiaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e879f9" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#e879f9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Area type="monotone" dataKey="kp" stroke="#e879f9" strokeWidth={2.5} fill="url(#fuchsiaGrad)" dot={false} activeDot={{ r: 5, fill: "#e879f9" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Profil apprenant */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold text-sm mb-1">Profil de l'apprenant</h3>
        <p className="text-xs text-muted-foreground mb-4">Répartition de votre consommation</p>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={140} height={140}>
            <PieChart>
              <Pie data={PROFILE_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {PROFILE_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-2">
            {PROFILE_DATA.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-muted-foreground">{d.name}</span>
                </div>
                <span className="text-xs font-bold">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}