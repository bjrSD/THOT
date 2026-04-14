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
    <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:shadow-sm transition-all hover:border-accent/30 cursor-pointer group"
      onClick={onClick}>
      {content.cover_url ? (
        <img src={content.cover_url} alt={content.title} className="w-10 h-14 object-cover rounded-lg shrink-0" />
      ) : (
        <div className="w-10 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-accent" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{content.title}</p>
        {content.author && <p className="text-xs text-muted-foreground truncate">{content.author}</p>}
        {progress > 0 && (
          <div className="mt-1.5 flex items-center gap-2">
            <Progress value={progress} className="h-1 flex-1" />
            <span className="text-xs text-muted-foreground shrink-0">{progress}%</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
        <AddToPlaylistMenu contentId={content.id} />
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_COLORS[content.status] || "bg-secondary text-muted-foreground"}`}>
        {STATUS_LABELS_EXT[content.status] || content.status}
      </span>
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
      className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:border-accent/40 transition-all cursor-pointer group flex items-start gap-3 p-3"
    >
      {/* Cover — petit rectangle arrondi à gauche */}
      <div className="w-14 h-20 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center overflow-hidden shrink-0 border border-border">
        {content.cover_url ? (
          <img src={content.cover_url} alt={content.title} className="w-full h-full object-cover" />
        ) : (
          <Icon className="w-6 h-6 text-accent/40" />
        )}
      </div>

      {/* Infos à droite */}
      <div className="flex flex-col flex-1 min-w-0">
        <p className="font-semibold text-sm line-clamp-2 leading-tight mb-0.5">{content.title}</p>
        {content.author && <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{content.author}</p>}

        {/* Type + Statut + pages */}
        <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
          <span className="text-xs bg-secondary px-1.5 py-0.5 rounded-full shrink-0">{TYPE_LABELS[content.type]}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ${STATUS_COLORS[content.status] || "bg-secondary text-muted-foreground"}`}>
            {STATUS_LABELS_EXT[content.status] || ""}
          </span>
          {content.total_pages && (
            <span className="text-xs text-muted-foreground shrink-0">{content.total_pages}p</span>
          )}
        </div>

        {/* Progression */}
        {progress > 0 && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <Progress value={progress} className="h-1 flex-1" />
            <span className="text-[10px] text-muted-foreground shrink-0">{progress}%</span>
          </div>
        )}

        {/* Résumé */}
        {content.summary && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-1.5">{content.summary}</p>
        )}

        {/* Voir le détail + Playlist menu */}
        <div className="flex items-center justify-between mt-auto">
          <button
            onClick={onClick}
            className="flex items-center gap-1 text-xs text-accent hover:underline font-medium"
          >
            <ExternalLink className="w-3 h-3" /> Voir le détail
          </button>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
            <AddToPlaylistMenu contentId={content.id} />
          </div>
        </div>
      </div>
    </div>
  );
}