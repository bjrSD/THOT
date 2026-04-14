import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Compass, Brain, Flame, BarChart3, Trophy, Swords, Crown,
  Users, Bell, User, Zap, Settings, ChevronRight, BookOpen,
  TrendingUp, Globe, Star
} from "lucide-react";

const SECTIONS = [
  {
    label: "Découverte & Insights",
    color: "from-blue-500/10 to-accent/5",
    items: [
      { label: "Découvrir", page: "Discover", icon: Compass, desc: "Explore livres, podcasts, vidéos", color: "text-accent", bg: "bg-accent/10" },
      { label: "Carte du savoir", page: "BrainMap", icon: Brain, desc: "Visualise tes domaines", color: "text-purple-500", bg: "bg-purple-500/10" },
      { label: "Heatmap", page: "Heatmap", icon: Flame, desc: "Activité jour par jour", color: "text-orange-500", bg: "bg-orange-500/10" },
      { label: "Rapports", page: "Reports", icon: BarChart3, desc: "Statistiques détaillées", color: "text-blue-500", bg: "bg-blue-500/10" },
    ],
  },
  {
    label: "Social & Gamification",
    color: "from-yellow-500/10 to-orange-500/5",
    items: [
      { label: "Défis", page: "Challenges", icon: Trophy, desc: "Challenges collectifs", color: "text-yellow-500", bg: "bg-yellow-500/10" },
      { label: "Duels", page: "Duels", icon: Swords, desc: "Affronte tes amis", color: "text-red-500", bg: "bg-red-500/10" },
      { label: "Classement", page: "Leaderboard", icon: Crown, desc: "Top apprenants", color: "text-yellow-600", bg: "bg-yellow-600/10" },
      { label: "Clubs", page: "Clubs", icon: Users, desc: "Rejoins des groupes", color: "text-green-500", bg: "bg-green-500/10" },
    ],
  },
  {
    label: "Compte",
    color: "from-slate-500/10 to-slate-500/5",
    items: [
      { label: "Mon Profil", page: "Profile", icon: User, desc: "Badges, stats, niveau", color: "text-primary", bg: "bg-primary/10" },
      { label: "Notifications", page: "Notifications", icon: Bell, desc: "Tes alertes", color: "text-red-400", bg: "bg-red-400/10" },
      { label: "Intégrations", page: "Integrations", icon: Zap, desc: "Connecte tes apps", color: "text-accent", bg: "bg-accent/10" },
      { label: "Paramètres", page: "Settings", icon: Settings, desc: "Préférences", color: "text-muted-foreground", bg: "bg-secondary" },
    ],
  },
];

export default function Explore() {
  return (
    <div className="space-y-5 pb-2">
      {/* Header */}
      <div className="pt-1">
        <h1 className="font-heading text-xl font-bold">Explorer</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Toutes les fonctionnalités THOT</p>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-0.5">
            {section.label}
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.page} to={createPageUrl(item.page)}>
                  <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-accent/30 hover:bg-accent/5 transition-all active:scale-[0.98]">
                    <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4.5 h-4.5 ${item.color}`} style={{ width: 18, height: 18 }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-tight">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-1">{item.desc}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      {/* Premium CTA */}
      <Link to={createPageUrl("Premium")}>
        <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-r from-yellow-500/15 via-amber-500/10 to-yellow-600/15 border border-yellow-500/25">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-yellow-600 dark:text-yellow-400">Passer Premium</p>
              <p className="text-xs text-muted-foreground">Débloquer toutes les fonctionnalités</p>
            </div>
            <ChevronRight className="w-4 h-4 text-yellow-500/60 shrink-0" />
          </div>
        </div>
      </Link>
    </div>
  );
}