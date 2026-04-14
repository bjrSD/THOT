import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, Library, Compass, User,
  Plus, LogIn, Zap, Settings, Crown, MessageCircle,
  Twitter, Instagram, Swords, Brain, Flame, Users,
  FileBarChart, Trophy, Globe, Bell } from "lucide-react";
import NotificationBell from "@/components/shared/NotificationBell";
import UserAvatar from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import QuickAddModal from "@/components/shared/QuickAddModal";
import ChatBot from "@/components/shared/ChatBot";
import { useLanguage } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";
import MobileHeader from "@/components/mobile/MobileHeader";

// ─── Navigation structure ────────────────────────────────────────────────────
// Grouped for visual clarity in sidebar

const NAV_GROUPS = [
  {
    label: "Principal",
    items: [
      { name: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
      { name: "Feed", page: "Feed", icon: MessageCircle },
      { name: "Bibliothèque", page: "Library", icon: Library },
      { name: "Découvrir", page: "Discover", icon: Compass },
    ],
  },
  {
    label: "Insights",
    items: [
      { name: "Carte du savoir", page: "BrainMap", icon: Brain },
      { name: "Heatmap", page: "Heatmap", icon: Flame },
      { name: "Rapports", page: "Reports", icon: FileBarChart },
    ],
  },
  {
  label: "Social",
  items: [
    { name: "Défis", page: "Challenges", icon: Trophy },
    { name: "Duels", page: "Duels", icon: Swords },
    { name: "Classement", page: "Leaderboard", icon: Crown },
    { name: "Clubs", page: "Clubs", icon: Users },
    { name: "Messages", page: "Messages", icon: MessageCircle },
  ],
  },
  {
    label: "Compte",
    items: [
      { name: "Mon Profil", page: "Profile", icon: User },
      { name: "Notifications", page: "Notifications", icon: Bell },
      { name: "Intégrations", page: "Integrations", icon: Zap },
      { name: "Paramètres", page: "Settings", icon: Settings },
    ],
  },
];



function ThotLogo({ dark = false, size = "md" }) {
  const imgH = size === "lg" ? "h-10" : "h-8";
  // "dark" prop forces the glowing white version (used on dark hero backgrounds)
  // Otherwise: in dark mode → glowing, in light mode → colored natural logo
  return (
    <div className="flex items-center">
      {dark ? (
        // Forced glow version (hero landing header always dark)
        <img
          src="https://media.base44.com/images/public/69b18ae2b6a2664c5c01b197/ab640a937_logo_THOT-removebg-preview.png"
          alt="THOT"
          className={`${imgH} w-auto object-contain`}
          style={{ filter: "brightness(0) invert(1) drop-shadow(0 0 8px rgba(100,180,255,0.9))" }}
        />
      ) : (
        <>
          {/* Light mode: natural colored logo */}
          <img
            src="https://media.base44.com/images/public/69b18ae2b6a2664c5c01b197/ab640a937_logo_THOT-removebg-preview.png"
            alt="THOT"
            className={`${imgH} w-auto object-contain dark:hidden`}
          />
          {/* Dark mode: glowing white logo */}
          <img
            src="https://media.base44.com/images/public/69b18ae2b6a2664c5c01b197/ab640a937_logo_THOT-removebg-preview.png"
            alt="THOT"
            className={`${imgH} w-auto object-contain hidden dark:block`}
            style={{ filter: "brightness(0) invert(1) drop-shadow(0 0 8px rgba(100,180,255,0.9))" }}
          />
        </>
      )}
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  const { language, changeLanguage } = useLanguage();
  const [isAuth, setIsAuth] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => {
      setIsAuth(auth);
      if (auth) {
        base44.auth.me().then(u => {
          setIsPremium(u?.role === "admin" || u?.is_premium || false);
          setCurrentUser(u);
        });
      }
    });

    // Apply saved theme
    const saved = localStorage.getItem("thot-theme") || "auto";
    const root = document.documentElement;
    if (saved === "dark") root.classList.add("dark");
    else if (saved === "light") root.classList.remove("dark");
    else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) root.classList.add("dark");
    }
  }, []);

  const isLanding = currentPageName === "Home";

  // ─── Landing layout ────────────────────────────────────────────────────────
  if (isLanding) {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b bg-white/95 border-border dark:bg-[#0a1628]/90 dark:border-white/10 transition-colors">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to={createPageUrl("Home")}>
              <ThotLogo size="lg" />
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {[
                { name: "Découvrir", page: "Discover" },
                { name: "Intégrations", page: "Integrations" },
                { name: "Premium", page: "Premium" },
                { name: "À propos", page: "About" },
              ].map((item) => (
                <Link key={item.page} to={createPageUrl(item.page)}
                  className="text-sm text-foreground/70 hover:text-foreground dark:text-white/70 dark:hover:text-white transition-colors">
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {/* Language selector */}
              <div className="flex gap-1 bg-white/10 p-1 rounded-lg backdrop-blur-sm border border-white/20">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded transition-all ${
                    language === 'en'
                      ? 'bg-white/20 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {t('lang.english', language)}
                </button>
                <button
                  onClick={() => changeLanguage('fr')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded transition-all ${
                    language === 'fr'
                      ? 'bg-white/20 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {t('lang.french', language)}
                </button>
              </div>
              {isAuth ? (
                <>
                  <Link to={createPageUrl("Dashboard")}>
                    <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs dark:border-white/20 dark:text-white dark:bg-white/10 dark:hover:bg-white/20">
                      <LayoutDashboard className="w-3.5 h-3.5" /> {t('layout.myDashboard', language)}
                    </Button>
                  </Link>
                  <Button size="sm" className="bg-accent hover:bg-accent/90 text-white gap-1.5"
                    onClick={() => base44.auth.logout()}>
                    {t('layout.logout', language)}
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" className="gap-1.5 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/20"
                    onClick={() => base44.auth.redirectToLogin()}>
                    <LogIn className="w-4 h-4" /> {t('layout.signin', language)}
                  </Button>
                  <Button size="sm" className="bg-accent hover:bg-accent/90 text-white"
                    onClick={() => base44.auth.redirectToLogin()}>
                    {t('layout.signup', language)}
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="pt-16">{children}</main>

        {/* Landing Footer */}
        <footer className="bg-card border-t border-border">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <ThotLogo size="lg" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">Le Strava du savoir. Suivez, progressez, brillez.</p>
                <div className="flex gap-3">
                  <a href="https://twitter.com/thotapp" target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-accent/20 transition-colors">
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a href="https://instagram.com/thotapp" target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-accent/20 transition-colors">
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a href="https://tiktok.com/@thotapp" target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-accent/20 transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z" /></svg>
                  </a>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3">Produit</h4>
                <ul className="space-y-2">
                  {[{ n: "Fonctionnalités", p: "Dashboard" }, { n: "Intégrations", p: "Integrations" }, { n: "Premium", p: "Premium" }, { n: "Défis", p: "Challenges" }].map((l) => (
                    <li key={l.p}><Link to={createPageUrl(l.p)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.n}</Link></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3">Entreprise</h4>
                <ul className="space-y-2">
                  {[{ n: "À propos", p: "About" }, { n: "FAQ", p: "FAQ" }, { n: "Support", p: "Support" }].map((l, idx) => (
                    <li key={idx}><Link to={createPageUrl(l.p)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.n}</Link></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3">Légal</h4>
                <ul className="space-y-2">
                  {[{ n: "Confidentialité", p: "Privacy" }, { n: "CGU", p: "Terms" }].map((l) => (
                    <li key={l.p}><Link to={createPageUrl(l.p)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.n}</Link></li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="border-t border-border pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">© 2026 THOT SAS. Tous droits réservés.</p>
              <div className="flex items-center gap-4">
                <a href="#" className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-xl hover:opacity-80 transition-opacity">
                  <span className="text-lg">🍎</span>
                  <div className="text-left">
                    <p className="text-xs opacity-70">Télécharger sur</p>
                    <p className="text-sm font-semibold">App Store</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-xl hover:opacity-80 transition-opacity">
                  <span className="text-lg">▶</span>
                  <div className="text-left">
                    <p className="text-xs opacity-70">Disponible sur</p>
                    <p className="text-sm font-semibold">Google Play</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </footer>
        <ChatBot />
      </>
    );
  }

  // ─── App layout (authenticated) ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header — replaces the old mobile header */}
      <MobileHeader user={currentUser} currentPageName={currentPageName} />

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 bg-card border-r border-border flex-col z-40">
        <div className="h-16 px-5 flex items-center border-b border-border">
          <Link to={createPageUrl("Home")} className="flex items-center">
            <ThotLogo size="lg" />
          </Link>
        </div>

        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider px-2 mb-1">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = currentPageName === item.page;
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="p-3 border-t border-border space-y-2">
          {/* Avatar row only */}
          {currentUser && (
            <div className="flex items-center gap-2 px-2 pb-1">
              <Link to={createPageUrl("Profile")} className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity">
                <UserAvatar user={currentUser} size="sm" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{currentUser.display_name || currentUser.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                </div>
              </Link>
            </div>
          )}
          {!isPremium ? (
            <Link to={createPageUrl("Premium")}>
              <div className="bg-gradient-to-r from-yellow-500/15 to-accent/15 border border-yellow-500/20 rounded-xl p-3 flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Crown className="w-4 h-4 text-yellow-500 shrink-0" />
                <div>
                  <p className="text-xs font-semibold">Passer Premium</p>
                  <p className="text-xs text-muted-foreground">Débloquer toutes les fonctions</p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <Crown className="w-4 h-4 text-yellow-500 shrink-0" />
              <p className="text-xs font-semibold text-yellow-600">Compte Premium ✓</p>
            </div>
          )}
          <button
            onClick={() => base44.auth.logout()}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5 text-center"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Desktop top-right notification bell */}
      {isAuth && (
        <div className="hidden lg:block fixed top-3 right-6 z-50">
          <NotificationBell fixed={false} notifPageUrl="/Notifications" />
        </div>
      )}

      {/* Mobile bottom navigation */}
      {isAuth && (
        <MobileBottomNav currentPageName={currentPageName} />
      )}

      {/* Main content */}
      <main className="lg:ml-60 pt-12 lg:pt-0 min-h-screen">
        <div className="p-3 md:p-6 lg:p-8 max-w-7xl mx-auto pb-[88px] lg:pb-8">
          {children}
        </div>
      </main>

      {/* Floating + button (desktop only) */}
      {isAuth && (
        <button
          onClick={() => setShowQuickAdd(true)}
          className="hidden lg:flex fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full items-center justify-center transition-all hover:scale-110"
          style={{
            background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)",
            boxShadow: "0 0 16px rgba(59,130,246,0.6), 0 0 32px rgba(59,130,246,0.25), 0 4px 12px rgba(0,0,0,0.3)"
          }}
          title="Ajouter à ma bibliothèque"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      )}

      {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} />}
      <ChatBot />
    </div>
  );
}