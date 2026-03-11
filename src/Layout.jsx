import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { 
  Home, LayoutDashboard, Trophy, Library, Compass, User,
  Menu, X, Plus, LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import QuickAddModal from "@/components/shared/QuickAddModal";

const NAV_ITEMS = [
  { name: "Accueil", page: "Home", icon: Home },
  { name: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
  { name: "Challenges", page: "Challenges", icon: Trophy },
  { name: "Bibliothèque", page: "Library", icon: Library },
  { name: "Découvrir", page: "Discover", icon: Compass },
  { name: "Profil", page: "Profile", icon: User },
];

export default function Layout({ children, currentPageName }) {
  const [isAuth, setIsAuth] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth);
  }, []);

  const isLanding = currentPageName === "Home";

  if (isLanding) {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to={createPageUrl("Home")} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">T</span>
              </div>
              <span className="font-heading font-bold text-xl text-foreground">THOT</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {NAV_ITEMS.slice(1, 5).map(item => (
                <Link key={item.page} to={createPageUrl(item.page)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {isAuth ? (
                <Link to={createPageUrl("Dashboard")}>
                  <Button size="sm">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => base44.auth.redirectToLogin()}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Connexion
                  </Button>
                  <Button size="sm" onClick={() => base44.auth.redirectToLogin()}>
                    S'inscrire
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="pt-16">{children}</main>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex-col z-40">
        <div className="h-16 px-6 flex items-center border-b border-border">
          <Link to={createPageUrl("Home")} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">T</span>
            </div>
            <span className="font-heading font-bold text-xl">THOT</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(item => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border h-14 flex items-center px-4 justify-between">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="h-14 px-6 flex items-center border-b border-border">
              <span className="font-heading font-bold text-xl">THOT</span>
            </div>
            <nav className="p-4 space-y-1">
              {NAV_ITEMS.map(item => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
        <span className="font-heading font-bold text-lg">THOT</span>
        <div className="w-10" />
      </header>

      {/* Main content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Floating action button */}
      {isAuth && (
        <button
          onClick={() => setShowQuickAdd(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {showQuickAdd && (
        <QuickAddModal onClose={() => setShowQuickAdd(false)} />
      )}
    </div>
  );
}