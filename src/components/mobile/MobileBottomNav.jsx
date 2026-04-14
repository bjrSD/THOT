import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Home, Library, LayoutDashboard, MessageCircle, Plus,
  BookOpen, Headphones, Play, FileText, Link as LinkIcon, Search, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import QuickAddModal from "@/components/shared/QuickAddModal";

const ADD_OPTIONS = [
  { label: "Livre", icon: BookOpen, type: "book", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { label: "Podcast", icon: Headphones, type: "podcast", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  { label: "Article", icon: FileText, type: "article", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  { label: "Vidéo", icon: Play, type: "video", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { label: "Rechercher", icon: Search, type: "search", color: "bg-accent/10 text-accent border-accent/20" },
];

const NAV = [
  { label: "Accueil", page: "Dashboard", icon: Home },
  { label: "Biblio", page: "Library", icon: Library },
  null, // center button placeholder
  { label: "Feed", page: "Feed", icon: MessageCircle },
  { label: "Messages", page: "Messages", icon: MessageCircle },
];

export default function MobileBottomNav({ currentPageName }) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [addType, setAddType] = useState(null);

  const handleAddOption = (opt) => {
    setShowAddMenu(false);
    if (opt.type === "search") {
      window.location.href = createPageUrl("Discover");
      return;
    }
    setAddType(opt.type);
    setShowQuickAdd(true);
  };

  return (
    <>
      {/* Overlay for add menu */}
      <AnimatePresence>
        {showAddMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              onClick={() => setShowAddMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-[76px] left-3 right-3 z-[70] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Ajouter un contenu</p>
                <div className="grid grid-cols-3 gap-2">
                  {ADD_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.type}
                        onClick={() => handleAddOption(opt)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${opt.color} transition-all active:scale-95`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Nav Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="flex items-end justify-around px-2 pt-2 pb-2">
          {NAV.map((item, i) => {
            if (!item) {
              // Center + button
              return (
                <div key="add" className="flex flex-col items-center relative" style={{ marginTop: "-16px" }}>
                  <button
                    onClick={() => setShowAddMenu(!showAddMenu)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                      showAddMenu
                        ? "bg-destructive rotate-45"
                        : ""
                    }`}
                    style={{
                      background: showAddMenu
                        ? undefined
                        : "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)",
                      boxShadow: "0 0 20px rgba(59,130,246,0.5), 0 4px 16px rgba(0,0,0,0.3)",
                    }}
                  >
                    {showAddMenu
                      ? <X className="w-6 h-6 text-white" />
                      : <Plus className="w-6 h-6 text-white" />
                    }
                  </button>
                  <span className="text-[10px] text-muted-foreground mt-1">Ajouter</span>
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = currentPageName === item.page;

            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-[44px] transition-all active:scale-95"
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-primary/10" : ""}`}>
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {showQuickAdd && (
        <QuickAddModal onClose={() => { setShowQuickAdd(false); setAddType(null); }} defaultType={addType} />
      )}
    </>
  );
}