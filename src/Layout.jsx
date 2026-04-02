import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Home, LayoutDashboard, Library, Compass, User,
  Menu, Plus, LogIn, Zap, Settings, Crown, MessageCircle,
  Twitter, Instagram, Swords, Brain, Flame, Users, ArrowRight,
  FileBarChart, Trophy, ListMusic, ChevronDown, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import QuickAddModal from "@/components/shared/QuickAddModal";
import ChatBot from "@/components/shared/ChatBot";
import { useLanguage } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";

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
    ],
  },
  {
    label: "Compte",
    items: [
      { name: "Mon Profil", page: "Profile", icon: User },
      { name: "Intégrations", page: "Integrations", icon: Zap },
      { name: "Paramètres", page: "Settings", icon: Settings },
    ],
  },
];

// Flat list for mobile sheet (same items, no groups)
const NAV_ITEMS_FLAT = NAV_GROUPS.flatMap(g => g.items);

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
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => {
      setIsAuth(auth);
      if (auth) {
        base44.auth.me().then(u => {
          setIsPremium(u?.role === "admin" || u?.is_premium || false);
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
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 bg-card border-r border-border flex-col z-40">
        <div className="h-16 px-5 flex items-center border-b border-border">
          <Link to={createPageUrl("Home")} className="flex items-center">
            <ThotLogo size="lg" />
          </Link>
        </div>

        {/* Language selector desktop */}
        <div className="px-3 py-2 mb-3 flex gap-1">
          <button
            onClick={() => changeLanguage('en')}
            className={`flex-1 py-1.5 text-xs rounded font-medium transition-all ${
              language === 'en' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            ENG
          </button>
          <button
            onClick={() => changeLanguage('fr')}
            className={`flex-1 py-1.5 text-xs rounded font-medium transition-all ${
              language === 'fr' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            FRA
          </button>
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

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border h-14 flex items-center px-4 justify-between">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 flex flex-col">
            <div className="h-14 px-6 flex items-center border-b border-border shrink-0 justify-between">
              <ThotLogo size="lg" />
              {/* Language selector mobile sidebar */}
              <div className="flex gap-1 bg-secondary p-1 rounded-lg">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-all ${
                    language === 'en'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('lang.english', language)}
                </button>
                <button
                  onClick={() => changeLanguage('fr')}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-all ${
                    language === 'fr'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('lang.french', language)}
                </button>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
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
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
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
            <div className="p-3 border-t border-border shrink-0">
              {!isPremium ? (
                <Link to={createPageUrl("Premium")} onClick={() => setMobileOpen(false)}>
                  <div className="bg-gradient-to-r from-yellow-500/15 to-accent/15 border border-yellow-500/20 rounded-xl p-3 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <div>
                      <p className="text-xs font-semibold">Passer Premium</p>
                      <p className="text-xs text-muted-foreground">Débloquer toutes les fonctions</p>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <p className="text-xs font-semibold text-yellow-600">Compte Premium ✓</p>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        <ThotLogo size="lg" />

        <Button size="icon" variant="ghost" onClick={() => setShowQuickAdd(true)}>
          <Plus className="w-5 h-5" />
        </Button>
      </header>

      {/* Main content */}
      <main className="lg:ml-60 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Floating action button (desktop) */}
      {isAuth && (
        <button
          onClick={() => setShowQuickAdd(true)}
          className="hidden lg:flex fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 items-center justify-center"
          title="Ajouter à ma bibliothèque"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} />}
      <ChatBot />
    </div>
  );
}