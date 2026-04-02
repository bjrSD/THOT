import React from "react";
import { BookOpen, FileText, Play, Headphones } from "lucide-react";
import { motion } from "framer-motion";

const STAT_TYPES = [
  { icon: BookOpen, label: "Livres", key: "books", color: "text-blue-400", bg: "bg-blue-500/10" },
  { icon: FileText, label: "Articles", key: "articles", color: "text-green-400", bg: "bg-green-500/10" },
  { icon: Play, label: "Vidéos", key: "videos", color: "text-red-400", bg: "bg-red-500/10" },
  { icon: Headphones, label: "Podcasts", key: "podcasts", color: "text-purple-400", bg: "bg-purple-500/10" },
];

export default function DetailedStats({ contents }) {
  const stats = {
    books: contents.filter(c => c.type === "book"),
    articles: contents.filter(c => c.type === "article"),
    videos: contents.filter(c => c.type === "video"),
    podcasts: contents.filter(c => c.type === "podcast"),
  };

  const getStatData = (type) => {
    const items = stats[type];
    const completed = items.filter(c => c.status === "completed").length;
    const inProgress = items.filter(c => c.status === "in_progress").length;
    const totalPages = items.reduce((sum, c) => sum + (c.total_pages || 0), 0);
    const currentPages = items.reduce((sum, c) => sum + (c.current_page || 0), 0);
    const totalDuration = items.reduce((sum, c) => sum + (c.total_duration || 0), 0);
    const currentDuration = items.reduce((sum, c) => sum + (c.current_duration || 0), 0);

    return {
      total: items.length,
      completed,
      inProgress,
      pages: { current: currentPages, total: totalPages },
      duration: { current: currentDuration, total: totalDuration },
    };
  };

  const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}min`;
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm">Statistiques détaillées</h3>
      
      {/* Content type tabs */}
      <div className="flex gap-2 border-b border-border pb-3 overflow-x-auto">
        {STAT_TYPES.map((type) => {
          const Icon = type.icon;
          const count = stats[type.key].length;
          return (
            <button key={type.key} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${count > 0 ? `${type.bg} ${type.color}` : "bg-secondary text-muted-foreground"}`}>
              <Icon className="w-3.5 h-3.5" />
              {type.label}
            </button>
          );
        })}
      </div>

      {/* Grid of detailed stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {STAT_TYPES.map((type, i) => {
          const data = getStatData(type.key);
          const Icon = type.icon;
          return (
            <motion.div key={type.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`rounded-lg p-2.5 border border-border text-center text-xs ${data.total === 0 ? "bg-secondary/30" : type.bg}`}>
              <div className={`${type.color} mb-1`}>
                <Icon className="w-4 h-4 mx-auto" />
              </div>
              <p className="font-bold text-sm leading-tight">{data.total}</p>
              <p className="text-muted-foreground text-[10px]">Total</p>
              {data.total > 0 && (
                <>
                  <p className="text-green-500 font-semibold text-xs mt-1">{data.completed}</p>
                  <p className="text-[10px] text-muted-foreground">Terminés</p>
                </>
              )}
              {data.inProgress > 0 && (
                <p className="text-accent text-[10px] mt-0.5">{data.inProgress} en cours</p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Advanced metrics */}
      <div className="grid grid-cols-2 gap-2 bg-secondary/30 rounded-lg p-2.5">
        {/* Books pages */}
        {stats.books.length > 0 && (
          <div className="text-xs">
            <p className="text-muted-foreground">Pages lues</p>
            <p className="font-bold">{stats.books.reduce((sum, c) => sum + (c.current_page || 0), 0)}</p>
            <p className="text-[10px] text-muted-foreground">{stats.books.reduce((sum, c) => sum + (c.total_pages || 0), 0)} pages</p>
          </div>
        )}
        {/* Podcast/Video duration */}
        {(stats.podcasts.length > 0 || stats.videos.length > 0) && (
          <div className="text-xs">
            <p className="text-muted-foreground">Temps écouté/regardé</p>
            <p className="font-bold">{formatDuration(stats.podcasts.reduce((sum, c) => sum + (c.current_duration || 0), 0) + stats.videos.reduce((sum, c) => sum + (c.current_duration || 0), 0))}</p>
          </div>
        )}
        {/* Total library */}
        <div className="text-xs">
          <p className="text-muted-foreground">Bibliothèque totale</p>
          <p className="font-bold">{contents.length}</p>
          <p className="text-[10px] text-muted-foreground">contenus</p>
        </div>
        {/* Average consumption */}
        {contents.length > 0 && (
          <div className="text-xs">
            <p className="text-muted-foreground">Complétés</p>
            <p className="font-bold">{contents.filter(c => c.status === "completed").length}</p>
            <p className="text-[10px] text-muted-foreground">terminés</p>
          </div>
        )}
      </div>
    </div>
  );
}