import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Home, BookOpen, LayoutDashboard, Mail, Plus,
  X, BookMarked, Headphones, Play, FileText, Search, Link as LinkIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import QuickAddModal from "@/components/shared/QuickAddModal";
import ContentImportModal from "@/components/shared/ContentImportModal";

const ADD_OPTIONS = [
  { label: "Livre", icon: BookMarked, type: "book", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { label: "Podcast", icon: Headphones, type: "podcast", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  { label: "Article", icon: FileText, type: "article", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  { label: "Vidéo", icon: Play, type: "video", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { label: "Lien / URL", icon: LinkIcon, type: "import", color: "bg-accent/10 text-accent border-accent/20" },
];

// 4 nav items + center placeholder
const NAV = [
  { label: "Accueil", page: "MobileHome", icon: Home },
  { label: "Biblio", page: "Library", icon: BookOpen },
  null, // center + button
  { label: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
  { label: "Messages", page: "Messages", icon: Mail },
];

export default function MobileBottomNav({ currentPageName }) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [addType, setAddType] = useState(null);

  const handleAddOption = (opt) => {
    setShowAddMenu(false);
    if (opt.type === "import") {
      setShowImport(true);
      return;
    }
    if (opt.type === "book") {
      setAddType("book");
      setShowQuickAdd(true);
      return;
    }
    // For video, podcast, article — open import modal with pre-selected type
    setShowImport(true);
  };

  return (
    <>
      {/* Backdrop */}
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
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed left-3 right-3 z-[70] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
              style={{ bottom: "calc(68px + env(safe-area-inset-bottom, 0px) + 8px)" }}
            >
              <div className="p-4">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Ajouter un contenu
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {ADD_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.type}
                        onClick={() => handleAddOption(opt)}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border ${opt.color} transition-all active:scale-95`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px] font-medium leading-tight text-center">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/98 backdrop-blur-xl border-t border-border"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around h-[52px] px-1">
          {NAV.map((item, i) => {
            if (!item) {
              return (
                <div key="add" className="flex flex-col items-center justify-center gap-0.5 flex-1">
                  <button
                    onClick={() => setShowAddMenu(!showAddMenu)}
                    className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90"
                    style={{
                      background: showAddMenu
                        ? "#ef4444"
                        : "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)",
                      boxShadow: showAddMenu
                        ? "0 4px 12px rgba(239,68,68,0.4)"
                        : "0 0 14px rgba(59,130,246,0.45), 0 3px 10px rgba(0,0,0,0.2)",
                      marginTop: -14,
                      transform: showAddMenu ? "rotate(45deg)" : "none",
                    }}
                  >
                    {showAddMenu
                      ? <X className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
                      : <Plus className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
                    }
                  </button>
                  <span className="text-[8px] text-muted-foreground leading-none mt-0.5">Ajouter</span>
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = currentPageName === item.page;

            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all active:scale-90"
              >
                <Icon
                  className={`transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
                  style={{ width: 20, height: 20 }}
                  strokeWidth={isActive ? 2.3 : 1.8}
                />
                <span className={`text-[8px] font-medium transition-colors leading-none ${isActive ? "text-primary" : "text-muted-foreground"}`}>
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
      {showImport && (
        <ContentImportModal onClose={() => setShowImport(false)} />
      )}
    </>
  );
}