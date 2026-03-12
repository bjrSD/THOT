import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Home, LayoutDashboard, Trophy, Library, Compass, User,
  Menu, Plus, LogIn, Zap, Settings, Crown, MessageCircle,
  Twitter, Instagram, Swords, Brain, Flame, Users, Map } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import QuickAddModal from "@/components/shared/QuickAddModal";
import ChatBot from "@/components/shared/ChatBot";

const NAV_ITEMS = [
{ name: "Accueil", page: "Home", icon: Home },
{ name: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
{ name: "Bibliothèque", page: "Library", icon: Library },
{ name: "Défis", page: "Challenges", icon: Trophy },
{ name: "Duels", page: "Duels", icon: Swords },
{ name: "Classement", page: "Leaderboard", icon: Crown },
{ name: "Carte Cerveau", page: "BrainMap", icon: Brain },
{ name: "Heatmap", page: "Heatmap", icon: Flame },
{ name: "Clubs", page: "Clubs", icon: Users },
{ name: "Découvrir", page: "Discover", icon: Compass },
{ name: "Feed", page: "Feed", icon: MessageCircle },
{ name: "Mon Profil", page: "PublicProfile", icon: User },
{ name: "Intégrations", page: "Integrations", icon: Zap },
{ name: "Paramètres", page: "Settings", icon: Settings }];


function ThotLogo({ dark = false, size = "md" }) {
  const imgH = size === "lg" ? "h-10" : "h-8";
  return (
    <div className="flex items-center">
      <img
        src="https://media.base44.com/images/public/69b18ae2b6a2664c5c01b197/ab640a937_logo_THOT-removebg-preview.png"
        alt="THOT"
        className={`${imgH} w-auto object-contain`}
        style={dark ? { filter: "drop-shadow(0 0 8px rgba(100,180,255,0.9)) drop-shadow(0 0 2px rgba(255,255,255,0.6)) brightness(1.1)" } : {}}
      />
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  const [isAuth, setIsAuth] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth);

    // Apply saved theme
    const saved = localStorage.getItem("thot-theme") || "auto";
    const root = document.documentElement;
    if (saved === "dark") root.classList.add("dark");else
    if (saved === "light") root.classList.remove("dark");else
    {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) root.classList.add("dark");
    }
  }, []);

  const isLanding = currentPageName === "Home";

  const FOOTER_LEGAL_LINKS = [
  { name: "À propos", page: "About" },
  { name: "FAQ", page: "FAQ" },
  { name: "Support", page: "Support" },
  { name: "Confidentialité", page: "Privacy" },
  { name: "CGU", page: "Terms" },
  { name: "Premium", page: "Premium" }];


  if (isLanding) {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628]/90 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to={createPageUrl("Home")}>
              <ThotLogo dark size="lg" />
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {[
              { name: "Découvrir", page: "Discover" },
              { name: "Intégrations", page: "Integrations" },
              { name: "Premium", page: "Premium" },
              { name: "À propos", page: "About" }].
              map((item) =>
              <Link key={item.page} to={createPageUrl(item.page)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {item.name}
                </Link>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isAuth ?
              <>
                  <Link to={createPageUrl("Dashboard")}>
                    <Button size="sm" variant="outline">Dashboard</Button>
                  </Link>
                  <Link to={createPageUrl("Premium")}>
                    <Button size="sm" className="bg-accent hover:bg-accent/90">
                      <Crown className="w-4 h-4 mr-1.5" /> Premium
                    </Button>
                  </Link>
                </> :

              <>
                  <Button variant="ghost" size="sm" onClick={() => base44.auth.redirectToLogin()}>
                    <LogIn className="w-4 h-4 mr-1.5" />
                    Se connecter
                  </Button>
                  <Button size="sm" onClick={() => base44.auth.redirectToLogin()}>
                    S'inscrire
                  </Button>
                </>
              }
            </div>
          </div>
        </header>
        <main className="pt-16">{children}</main>

        {/* Landing Footer */}
        <footer className="bg-card border-t border-border">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <ThotLogo size="lg" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">Le Strava du savoir. Suivez, progressez, brillez.</p>
                <div className="flex gap-3">
                  <a href="https://twitter.com/thotapp" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-accent/20 transition-colors">
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a href="https://instagram.com/thotapp" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-accent/20 transition-colors">
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a href="https://tiktok.com/@thotapp" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-accent/20 transition-colors">
                    <span className="text-xs font-bold">TK</span>
                  </a>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3">Produit</h4>
                <ul className="space-y-2">
                  {[{ n: "Fonctionnalités", p: "Dashboard" }, { n: "Intégrations", p: "Integrations" }, { n: "Premium", p: "Premium" }, { n: "Défis", p: "Challenges" }].map((l) =>
                  <li key={l.p}><Link to={createPageUrl(l.p)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.n}</Link></li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3">Entreprise</h4>
                <ul className="space-y-2">
                  {[{ n: "À propos", p: "About" }, { n: "FAQ", p: "FAQ" }, { n: "Support", p: "Support" }, { n: "Blog", p: "About" }].map((l) =>
                  <li key={l.p}><Link to={createPageUrl(l.p)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.n}</Link></li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3">Légal</h4>
                <ul className="space-y-2">
                  {[{ n: "Confidentialité", p: "Privacy" }, { n: "CGU", p: "Terms" }].map((l) =>
                  <li key={l.p}><Link to={createPageUrl(l.p)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.n}</Link></li>
                  )}
                </ul>
              </div>
            </div>

            {/* App store badges */}
            <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
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
      </>);

  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex-col z-40">
        <div className="h-16 px-6 flex items-center border-b border-border">
          <Link to={createPageUrl("Home")} className="flex items-center">
            <ThotLogo size="lg" />
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`
                }>

                <item.icon className="w-4.5 h-4.5 shrink-0" />
                {item.name}
              </Link>);

          })}
        </nav>
        <div className="p-4 border-t border-border">
          <Link to={createPageUrl("Premium")}>
            <div className="bg-gradient-to-r from-accent/20 to-primary/20 rounded-xl p-3 flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Crown className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-xs font-semibold">Passer Premium</p>
                <p className="text-xs text-muted-foreground">Débloque tout</p>
              </div>
            </div>
          </Link>
          <button onClick={() => base44.auth.logout()} className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5">
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
          <SheetContent side="left" className="w-72 p-0">
            <div className="h-14 px-6 flex items-center border-b border-border">
              <ThotLogo size="lg" />
            </div>
            <nav className="p-4 space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`
                    }>

                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.name}
                  </Link>);

              })}
            </nav>
            <div className="p-4 border-t border-border">
              <Link to={createPageUrl("Premium")} onClick={() => setMobileOpen(false)}>
                <div className="bg-gradient-to-r from-accent/20 to-primary/20 rounded-xl p-3 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <div>
                    <p className="text-xs font-semibold">Passer Premium</p>
                    <p className="text-xs text-muted-foreground">Débloque tout</p>
                  </div>
                </div>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
        <ThotLogo size="lg" />
        <Button size="icon" variant="ghost" onClick={() => setShowQuickAdd(true)}>
          <Plus className="w-5 h-5" />
        </Button>
      </header>

      {/* Main content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Floating action button (desktop) */}
      {isAuth &&
      <button
        onClick={() => setShowQuickAdd(true)}
        className="hidden lg:flex fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 items-center justify-center">

          <Plus className="w-6 h-6" />
        </button>
      }

      {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} />}
      <ChatBot />
    </div>);

}