import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, FileText, Play, Headphones, Clock, CheckCircle } from "lucide-react";

const TABS = [
  { id: "book", label: "Livres", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "article", label: "Articles", icon: FileText, color: "text-green-500", bg: "bg-green-500/10" },
  { id: "video", label: "Vidéos", icon: Play, color: "text-red-500", bg: "bg-red-500/10" },
  { id: "podcast", label: "Podcasts", icon: Headphones, color: "text-purple-500", bg: "bg-purple-500/10" },
];

function estimateReadTime(pages) {
  // ~250 words/page, ~250 words/minute for average reader
  const minutes = pages * 2; // ~2 min/page average
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

export default function ContentStatsTab({ contents = [] }) {
  const [activeTab, setActiveTab] = useState("book");

  const tab = TABS.find(t => t.id === activeTab);
  const Icon = tab.icon;

  const filtered = contents.filter(c => c.type === activeTab);
  const completed = filtered.filter(c => c.status === "completed");
  const inProgress = filtered.filter(c => c.status === "in_progress");
  const total = filtered.length;

  // Books & Articles
  const totalPages = completed.reduce((acc, c) => acc + (c.total_pages || 0), 0);
  const currentPages = filtered.reduce((acc, c) => acc + (c.current_page || 0), 0);
  const readTime = estimateReadTime(totalPages + currentPages);

  // Videos & Podcasts
  const totalMinutes = completed.reduce((acc, c) => acc + (c.total_duration || 0), 0);
  const currentMinutes = filtered.reduce((acc, c) => acc + (c.current_duration || 0), 0);
  const totalTime = totalMinutes + currentMinutes;
  const timeDisplay = totalTime < 60 ? `${totalTime} min` : `${Math.floor(totalTime / 60)}h ${totalTime % 60}min`;

  const isPageBased = activeTab === "book" || activeTab === "article";

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <h3 className="font-heading font-semibold mb-4">Statistiques détaillées</h3>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/60 p-1 rounded-xl mb-5">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === t.id ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <t.icon className={`w-3.5 h-3.5 ${activeTab === t.id ? t.color : ""}`} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard
            icon={CheckCircle}
            iconColor="text-green-500"
            iconBg="bg-green-500/10"
            label={`${tab.label} terminé${activeTab !== "article" ? "s" : "s"}`}
            value={completed.length}
          />
          <StatCard
            icon={Icon}
            iconColor={tab.color}
            iconBg={tab.bg}
            label="En cours"
            value={inProgress.length}
          />
          <StatCard
            icon={Icon}
            iconColor="text-muted-foreground"
            iconBg="bg-secondary"
            label="Total bibliothèque"
            value={total}
          />
          {isPageBased ? (
            <>
              <StatCard
                icon={BookOpen}
                iconColor="text-blue-500"
                iconBg="bg-blue-500/10"
                label="Pages lues (terminés)"
                value={totalPages.toLocaleString()}
                sub="pages"
              />
              <StatCard
                icon={BookOpen}
                iconColor="text-blue-400"
                iconBg="bg-blue-400/10"
                label="Pages totales (dont en cours)"
                value={(totalPages + currentPages).toLocaleString()}
                sub="pages"
              />
              <StatCard
                icon={Clock}
                iconColor="text-orange-500"
                iconBg="bg-orange-500/10"
                label="Temps de lecture estimé"
                value={readTime}
              />
            </>
          ) : (
            <>
              <StatCard
                icon={Clock}
                iconColor="text-purple-500"
                iconBg="bg-purple-500/10"
                label="Temps total terminés"
                value={totalMinutes < 60 ? `${totalMinutes} min` : `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}min`}
              />
              <StatCard
                icon={Clock}
                iconColor="text-purple-400"
                iconBg="bg-purple-400/10"
                label="Temps total (dont en cours)"
                value={timeDisplay}
              />
              <div className="col-span-1" />
            </>
          )}
        </div>

        {completed.length === 0 && (
          <p className="text-center text-sm text-muted-foreground mt-4 py-2">
            Aucun {tab.label.toLowerCase().slice(0, -1)} terminé pour l'instant.
          </p>
        )}
      </motion.div>
    </div>
  );
}

function StatCard({ icon: Icon, iconColor, iconBg, label, value, sub }) {
  return (
    <div className="bg-secondary/40 rounded-xl p-3 flex flex-col gap-1">
      <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center mb-1`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <p className="text-xs text-muted-foreground leading-tight">{label}</p>
      <p className="text-xl font-black leading-tight">{value} {sub && <span className="text-xs font-normal text-muted-foreground">{sub}</span>}</p>
    </div>
  );
}