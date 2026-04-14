import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen, Compass, Brain, Flame, BarChart3, Trophy, Swords, Crown,
  Users, Bell, User, Zap, Settings, ChevronRight, MessageCircle,
  LayoutDashboard, Library, TrendingUp, Plus, Loader2, Mail, Play, Headphones
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getUserLevel, getNextLevel, getLevelProgress } from "@/components/shared/KPUtils";
import NotificationBell from "@/components/shared/NotificationBell";
import UserAvatar from "@/components/shared/UserAvatar";

// ── Nav sections ──────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    id: "principal",
    label: "Principal",
    emoji: "⚡",
    items: [
      { label: "Dashboard", page: "Dashboard", icon: LayoutDashboard, color: "text-primary", bg: "bg-primary/10" },
      { label: "Bibliothèque", page: "Library", icon: Library, color: "text-blue-500", bg: "bg-blue-500/10" },
      { label: "Découvrir", page: "Discover", icon: Compass, color: "text-accent", bg: "bg-accent/10" },
      { label: "Feed", page: "Feed", icon: MessageCircle, color: "text-green-500", bg: "bg-green-500/10" },
    ],
  },
  {
    id: "insights",
    label: "Insights",
    emoji: "🧠",
    items: [
      { label: "Carte du savoir", page: "BrainMap", icon: Brain, color: "text-purple-500", bg: "bg-purple-500/10" },
      { label: "Heatmap", page: "Heatmap", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
      { label: "Rapports", page: "Reports", icon: BarChart3, color: "text-blue-500", bg: "bg-blue-500/10" },
    ],
  },
  {
    id: "social",
    label: "Social",
    emoji: "🏆",
    items: [
      { label: "Défis", page: "Challenges", icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10" },
      { label: "Duels", page: "Duels", icon: Swords, color: "text-red-500", bg: "bg-red-500/10" },
      { label: "Classement", page: "Leaderboard", icon: Crown, color: "text-yellow-600", bg: "bg-yellow-600/10" },
      { label: "Clubs", page: "Clubs", icon: Users, color: "text-green-500", bg: "bg-green-500/10" },
      { label: "Messages", page: "Messages", icon: Mail, color: "text-accent", bg: "bg-accent/10" },
    ],
  },
  {
    id: "compte",
    label: "Compte",
    emoji: "👤",
    items: [
      { label: "Mon Profil", page: "Profile", icon: User, color: "text-primary", bg: "bg-primary/10" },
      { label: "Notifications", page: "Notifications", icon: Bell, color: "text-red-400", bg: "bg-red-400/10" },
      { label: "Intégrations", page: "Integrations", icon: Zap, color: "text-accent", bg: "bg-accent/10" },
      { label: "Paramètres", page: "Settings", icon: Settings, color: "text-muted-foreground", bg: "bg-secondary" },
    ],
  },
];

export default function MobileHome() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: contents = [] } = useQuery({
    queryKey: ["contents-home"],
    queryFn: () => base44.entities.Content.list("-updated_date", 50),
  });

  const inProgress = contents.filter(c => c.status === "in_progress");
  const kp = user?.total_kp || 0;
  const streak = user?.current_streak || 0;
  const level = user ? getUserLevel(kp) : null;
  const nextLevel = user ? getNextLevel(kp) : null;
  const progress = user ? getLevelProgress(kp) : 0;

  return (
    <div className="space-y-4">
      {/* ── Header compact ─────────────────────────────── */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <img
            src="https://media.base44.com/images/public/69b18ae2b6a2664c5c01b197/ab640a937_logo_THOT-removebg-preview.png"
            alt="THOT"
            className="h-6 w-auto object-contain dark:hidden"
          />
          <img
            src="https://media.base44.com/images/public/69b18ae2b6a2664c5c01b197/ab640a937_logo_THOT-removebg-preview.png"
            alt="THOT"
            className="h-6 w-auto object-contain hidden dark:block"
            style={{ filter: "brightness(0) invert(1) drop-shadow(0 0 5px rgba(100,180,255,0.9))" }}
          />
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell fixed={false} notifPageUrl="/Notifications" />
          {user && (
            <Link to={createPageUrl("Profile")}>
              <UserAvatar user={user} size="xs" />
            </Link>
          )}
        </div>
      </div>

      {/* ── Résumé personnel ────────────────────────────── */}
      {user ? (
        <div className="bg-card border border-border rounded-2xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-bold text-sm leading-tight">
                {(user.display_name || user.full_name || "apprenant").split(" ")[0]} 👋
              </p>
              {level && (
                <p className="text-[11px] text-muted-foreground">{level.icon} {level.name} · {kp.toLocaleString()} KP</p>
              )}
            </div>
            <div className="flex items-center gap-3 text-right">
              <div>
                <p className="text-base font-black text-orange-500 leading-none">{streak}🔥</p>
                <p className="text-[9px] text-muted-foreground">streak</p>
              </div>
              <div>
                <p className="text-base font-black text-blue-500 leading-none">{inProgress.length}</p>
                <p className="text-[9px] text-muted-foreground">en cours</p>
              </div>
            </div>
          </div>
          {nextLevel && (
            <div>
              <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
                <span>{level?.name}</span>
                <span>{progress}% → {nextLevel.icon} {nextLevel.name}</span>
              </div>
              <Progress value={progress} className="h-1" />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-3 flex items-center justify-center h-16">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* ── En cours (scroll horizontal compact) ───────── */}
      {inProgress.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">En cours</p>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollSnapType: "x mandatory" }}>
            {inProgress.slice(0, 6).map((c) => {
              const prog = c.total_pages
                ? Math.round(((c.current_page || 0) / c.total_pages) * 100)
                : c.total_duration
                ? Math.round(((c.current_duration || 0) / c.total_duration) * 100)
                : 0;
              const emoji = c.type === "book" ? "📖" : c.type === "podcast" ? "🎧" : c.type === "video" ? "🎬" : "📰";
              return (
                <Link
                  key={c.id}
                  to={createPageUrl("ContentDetail") + `?id=${c.id}`}
                  className="shrink-0 w-28 bg-card border border-border rounded-xl p-2.5 active:scale-95 transition-transform"
                  style={{ scrollSnapAlign: "start" }}
                >
                  {c.cover_url ? (
                    <img src={c.cover_url} alt={c.title} className="w-full h-16 object-cover rounded-lg mb-1.5" />
                  ) : (
                    <div className="w-full h-16 bg-accent/10 rounded-lg mb-1.5 flex items-center justify-center">
                      <span className="text-xl">{emoji}</span>
                    </div>
                  )}
                  <p className="text-[10px] font-semibold line-clamp-2 leading-tight">{c.title}</p>
                  {prog > 0 && <Progress value={prog} className="h-0.5 mt-1" />}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Actions rapides ─────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2">
        <Link to={createPageUrl("Library")}>
          <div className="bg-primary text-primary-foreground rounded-xl p-3 flex items-center gap-2.5 active:scale-95 transition-transform">
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="text-xs font-semibold">Ma Bibliothèque</span>
          </div>
        </Link>
        <Link to={createPageUrl("Discover")}>
          <div className="bg-accent text-white rounded-xl p-3 flex items-center gap-2.5 active:scale-95 transition-transform">
            <Compass className="w-4 h-4 shrink-0" />
            <span className="text-xs font-semibold">Découvrir</span>
          </div>
        </Link>
        <Link to={createPageUrl("Dashboard")}>
          <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-2.5 active:scale-95 transition-transform">
            <LayoutDashboard className="w-4 h-4 shrink-0 text-primary" />
            <span className="text-xs font-semibold">Dashboard</span>
          </div>
        </Link>
        <Link to={createPageUrl("Feed")}>
          <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-2.5 active:scale-95 transition-transform">
            <MessageCircle className="w-4 h-4 shrink-0 text-green-500" />
            <span className="text-xs font-semibold">Feed social</span>
          </div>
        </Link>
      </div>

      {/* ── Sections de navigation ──────────────────────── */}
      {NAV_SECTIONS.map((section) => (
        <div key={section.id}>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            {section.emoji} {section.label}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.page} to={createPageUrl(item.page)}>
                  <div className="flex items-center gap-2.5 p-2.5 bg-card border border-border rounded-xl hover:border-accent/30 active:scale-[0.97] transition-all">
                    <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                    </div>
                    <span className="text-xs font-medium leading-tight truncate">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      {/* ── Premium CTA ─────────────────────────────────── */}
      <Link to={createPageUrl("Premium")}>
        <div className="rounded-2xl p-3 bg-gradient-to-r from-yellow-500/15 via-amber-500/10 to-yellow-600/15 border border-yellow-500/25 flex items-center gap-3 active:scale-[0.98] transition-transform">
          <div className="w-8 h-8 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
            <Crown className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xs text-yellow-600 dark:text-yellow-400">Passer Premium</p>
            <p className="text-[10px] text-muted-foreground">Débloquer toutes les fonctionnalités</p>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-yellow-500/60 shrink-0" />
        </div>
      </Link>
    </div>
  );
}