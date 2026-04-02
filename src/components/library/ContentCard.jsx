import React, { useState } from "react";
import { BookOpen, Headphones, Play, FileText, MoreHorizontal } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { TYPE_LABELS, CATEGORY_LABELS } from "../shared/KPUtils";
import AddToPlaylistMenu from "./AddToPlaylistMenu";

const TYPE_ICON_MAP = { book: BookOpen, podcast: Headphones, video: Play, article: FileText };

const STATUS_COLORS = {
  saved: "bg-slate-500/15 text-slate-600",
  want: "bg-blue-500/15 text-blue-600",
  in_progress: "bg-accent/15 text-accent",
  completed: "bg-green-500/15 text-green-600",
  abandoned: "bg-red-500/15 text-red-500",
  // legacy statuses
  to_consume: "bg-blue-500/15 text-blue-600",
  paused: "bg-yellow-500/15 text-yellow-600",
  to_review: "bg-purple-500/15 text-purple-600",
};

const STATUS_LABELS_EXT = {
  saved: "Sauvegardé",
  want: "Envie de découvrir",
  in_progress: "En cours",
  completed: "Terminé",
  abandoned: "Abandonné",
  to_consume: "À découvrir",
  paused: "En pause",
  to_review: "À revoir",
};

/** Carte compacte mode liste */
export function ContentRow({ content, onClick, onStatusChange }) {
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

/** Carte mode grille (existante enrichie) */
export default function ContentCard({ content, onClick }) {
  const [flipped, setFlipped] = useState(false);
  const Icon = TYPE_ICON_MAP[content.type] || BookOpen;

  const progress = content.type === "book"
    ? (content.total_pages ? Math.round(((content.current_page || 0) / content.total_pages) * 100) : 0)
    : (content.total_duration ? Math.round(((content.current_duration || 0) / content.total_duration) * 100) : 0);

  return (
    <div className="perspective cursor-pointer group" onMouseEnter={() => setFlipped(true)} onMouseLeave={() => setFlipped(false)}>
      <div className={`relative preserve-3d transition-transform duration-500 ${flipped ? "rotate-y-180" : ""}`}>
        {/* Front */}
        <div className="backface-hidden bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow" onClick={onClick}>
          {content.cover_url ? (
            <img src={content.cover_url} alt={content.title} className="w-full h-28 object-cover rounded-lg mb-3" />
          ) : (
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{content.title}</p>
                {content.author && <p className="text-xs text-muted-foreground truncate">{content.author}</p>}
              </div>
            </div>
          )}
          {content.cover_url && (
            <div>
              <p className="font-medium text-sm truncate">{content.title}</p>
              {content.author && <p className="text-xs text-muted-foreground truncate">{content.author}</p>}
            </div>
          )}
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{TYPE_LABELS[content.type]}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[content.status] || "bg-secondary text-muted-foreground"}`}>
              {STATUS_LABELS_EXT[content.status] || ""}
            </span>
          </div>
          {progress > 0 && (
            <div className="mt-2">
              <Progress value={progress} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-1 text-right">{progress}%</p>
            </div>
          )}
          {/* Playlist menu on hover */}
          <div className="mt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
            <AddToPlaylistMenu contentId={content.id} />
          </div>
        </div>

        {/* Back */}
        <div className="backface-hidden rotate-y-180 absolute inset-0 bg-card rounded-xl border border-accent/30 p-4 shadow-md cursor-pointer" onClick={onClick}>
          <p className="text-xs font-semibold text-accent mb-2">{CATEGORY_LABELS[content.category] || "Autre"}</p>
          <p className="text-xs text-muted-foreground line-clamp-4">{content.summary || "Aucun résumé disponible"}</p>
          {content.personal_note && (
            <p className="text-xs mt-2 italic text-foreground/70 line-clamp-2">📝 {content.personal_note}</p>
          )}
          <p className="text-xs text-accent font-medium mt-3">Voir les détails →</p>
        </div>
      </div>
    </div>
  );
}