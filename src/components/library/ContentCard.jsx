import React from "react";
import { BookOpen, Headphones, Play, FileText, ExternalLink } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { TYPE_LABELS, CATEGORY_LABELS } from "../shared/KPUtils";
import AddToPlaylistMenu from "./AddToPlaylistMenu";
import { createPageUrl } from "@/utils";

const TYPE_ICON_MAP = { book: BookOpen, podcast: Headphones, video: Play, article: FileText };

const STATUS_COLORS = {
  saved: "bg-slate-500/15 text-slate-600",
  want: "bg-blue-500/15 text-blue-600",
  in_progress: "bg-accent/15 text-accent",
  completed: "bg-green-500/15 text-green-600",
  abandoned: "bg-red-500/15 text-red-500",
  to_consume: "bg-blue-500/15 text-blue-600",
  paused: "bg-yellow-500/15 text-yellow-600",
  to_review: "bg-purple-500/15 text-purple-600",
};

const STATUS_LABELS_EXT = {
  saved: "Sauvegardé",
  want: "À découvrir",
  in_progress: "En cours",
  completed: "Terminé",
  abandoned: "Abandonné",
  to_consume: "À découvrir",
  paused: "En pause",
  to_review: "À revoir",
};

/** Carte compacte mode liste */
export function ContentRow({ content, onClick }) {
  const Icon = TYPE_ICON_MAP[content.type] || BookOpen;
  const progress = content.type === "book"
    ? (content.total_pages ? Math.round(((content.current_page || 0) / content.total_pages) * 100) : 0)
    : (content.total_duration ? Math.round(((content.current_duration || 0) / content.total_duration) * 100) : 0);

  return (
    <div className="flex items-center gap-2.5 p-2.5 bg-card rounded-xl border border-border hover:shadow-sm transition-all hover:border-accent/30 cursor-pointer group active:scale-[0.99]"
      onClick={onClick}>
      {content.cover_url ? (
        <img src={content.cover_url} alt={content.title} className="w-9 h-12 object-cover rounded-lg shrink-0" />
      ) : (
        <div className="w-9 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-accent" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate leading-tight">{content.title}</p>
        {content.author && <p className="text-xs text-muted-foreground truncate">{content.author}</p>}
        {progress > 0 && (
          <div className="mt-1 flex items-center gap-1.5">
            <Progress value={progress} className="h-1 flex-1" />
            <span className="text-[10px] text-muted-foreground shrink-0">{progress}%</span>
          </div>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[content.status] || "bg-secondary text-muted-foreground"}`}>
          {STATUS_LABELS_EXT[content.status] || content.status}
        </span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <AddToPlaylistMenu contentId={content.id} />
        </div>
      </div>
    </div>
  );
}

/** Carte mode grille — cover petite à gauche, infos à droite */
export default function ContentCard({ content, onClick }) {
  const Icon = TYPE_ICON_MAP[content.type] || BookOpen;
  const progress = content.type === "book"
    ? (content.total_pages ? Math.round(((content.current_page || 0) / content.total_pages) * 100) : 0)
    : (content.total_duration ? Math.round(((content.current_duration || 0) / content.total_duration) * 100) : 0);

  return (
    <div
      onClick={onClick}
      className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:border-accent/40 transition-all cursor-pointer group flex flex-col p-3 gap-2"
    >
      {/* Ligne 1 : cover + infos principales côte à côte */}
      <div className="flex items-start gap-3">
        {/* Cover */}
        <div className="w-14 h-20 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center overflow-hidden shrink-0 border border-border">
          {content.cover_url ? (
            <img src={content.cover_url} alt={content.title} className="w-full h-full object-cover" />
          ) : (
            <Icon className="w-6 h-6 text-accent/40" />
          )}
        </div>

        {/* Infos : titre, auteur, pages, date — à droite de l'image */}
        <div className="flex flex-col min-w-0 flex-1">
          <p className="font-semibold text-sm line-clamp-2 leading-tight">{content.title}</p>
          {content.author && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{content.author}</p>}
          {content.total_pages && (
            <p className="text-xs text-muted-foreground mt-0.5">{content.total_pages} pages</p>
          )}
          {content.total_duration && !content.total_pages && (
            <p className="text-xs text-muted-foreground mt-0.5">{content.total_duration} min</p>
          )}
          {content.published_year && (
            <p className="text-xs text-muted-foreground mt-0.5">📅 {content.published_year}</p>
          )}
        </div>
      </div>

      {/* Ligne 2 : Type + Statut sur toute la largeur */}
      <div className="flex items-center justify-between gap-1.5">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${{
          book: "text-green-700 bg-green-500/25 dark:text-green-300 dark:bg-green-500/30",
          podcast: "text-purple-700 bg-purple-500/25 dark:text-purple-300 dark:bg-purple-500/30",
          video: "text-red-700 bg-red-500/25 dark:text-red-300 dark:bg-red-500/30",
          article: "text-blue-700 bg-blue-500/25 dark:text-blue-300 dark:bg-blue-500/30",
        }[content.type] || "bg-secondary text-muted-foreground"}`}>{TYPE_LABELS[content.type]}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[content.status] || "bg-secondary text-muted-foreground"}`}>
          {STATUS_LABELS_EXT[content.status] || ""}
        </span>
      </div>

      {/* Ligne 3 : Progression */}
      {progress > 0 && (
        <div className="flex items-center gap-1.5">
          <Progress value={progress} className="h-1 flex-1" />
          <span className="text-[10px] text-muted-foreground shrink-0">{progress}%</span>
        </div>
      )}

      {/* Ligne 4 : Résumé */}
      {content.summary && (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{content.summary}</p>
      )}

      {/* Ligne 5 : Voir le détail + Playlist menu */}
      <div className="flex items-center justify-between mt-auto pt-0.5">
        <button
          onClick={onClick}
          className="flex items-center gap-1 text-xs text-accent hover:underline font-medium"
        >
          <ExternalLink className="w-3 h-3" /> Voir le détail
        </button>
        <div onClick={e => e.stopPropagation()}>
          <AddToPlaylistMenu contentId={content.id} />
        </div>
      </div>
    </div>
  );
}