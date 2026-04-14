import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Bell, User, Grid3X3, ChevronRight } from "lucide-react";
import NotificationBell from "@/components/shared/NotificationBell";
import UserAvatar from "@/components/shared/UserAvatar";

function ThotLogo() {
  return (
    <div className="flex items-center">
      <img
        src="https://media.base44.com/images/public/69b18ae2b6a2664c5c01b197/ab640a937_logo_THOT-removebg-preview.png"
        alt="THOT"
        className="h-7 w-auto object-contain dark:hidden"
      />
      <img
        src="https://media.base44.com/images/public/69b18ae2b6a2664c5c01b197/ab640a937_logo_THOT-removebg-preview.png"
        alt="THOT"
        className="h-7 w-auto object-contain hidden dark:block"
        style={{ filter: "brightness(0) invert(1) drop-shadow(0 0 6px rgba(100,180,255,0.9))" }}
      />
    </div>
  );
}

export default function MobileHeader({ user, currentPageName }) {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="h-12 flex items-center justify-between px-4">
        {/* Logo */}
        <Link to={createPageUrl("Dashboard")}>
          <ThotLogo />
        </Link>

        {/* Page title (subtle) */}
        <span className="text-xs font-semibold text-muted-foreground absolute left-1/2 -translate-x-1/2">
          {currentPageName === "Dashboard" ? "" :
           currentPageName === "Library" ? "Bibliothèque" :
           currentPageName === "Feed" ? "Feed" :
           currentPageName === "Messages" ? "Messages" :
           currentPageName === "Profile" ? "Profil" :
           currentPageName === "Explore" ? "Explorer" : ""}
        </span>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <NotificationBell fixed={false} notifPageUrl="/Notifications" />
          {user && (
            <Link to={createPageUrl("Profile")}>
              <UserAvatar user={user} size="xs" className="ml-1" />
            </Link>
          )}
          <Link to={createPageUrl("Explore")} className="ml-1 p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <Grid3X3 className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </header>
  );
}