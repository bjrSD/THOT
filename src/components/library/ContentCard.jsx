import React, { useState } from "react";
import { BookOpen, Headphones, Play, FileText, MoreHorizontal, ExternalLink } from "lucide-react";
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

/** Carte mode grille — lisible et ergonomique */
export default function ContentCard({ content, onClick }) {
  const Icon = TYPE_ICON_MAP[content.type] || BookOpen;
  const progress = content.type === "book"
    ? (content.total_pages ? Math.round(((content.current_page || 0) / content.total_pages) * 100) : 0)
    : (content.total_duration ? Math.round(((content.current_duration || 0) / content.total_duration) * 100) : 0);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:border-accent/40 transition-all cursor-pointer group">
      {/* Image miniature */}
      <div className="relative w-full h-32 bg-secondary overflow-hidden flex items-center justify-center">
        {content.cover_url ? (
          <img src={content.cover_url} alt={content.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/20 to-accent/20">
            <Icon className="w-8 h-8 text-accent" />
          </div>
        )}
        {/* Overlay progress badge */}
        {progress > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded-full">
            <p className="text-xs font-bold text-white">{progress}%</p>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-3 space-y-2">
        {/* Titre et auteur */}
        <div>
          <h4 className="font-semibold text-sm line-clamp-2 leading-tight">{content.title}</h4>
          {content.author && <p className="text-xs text-muted-foreground line-clamp-1">{content.author}</p>}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1">
          <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{TYPE_LABELS[content.type]}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[content.status] || "bg-secondary text-muted-foreground"}`}>
            {STATUS_LABELS_EXT[content.status] || ""}
          </span>
        </div>

        {/* Résumé court */}
        {content.summary && (
          <p className="text-xs text-muted-foreground line-clamp-2">{content.summary}</p>
        )}

        {/* Lien URL pour podcasts/vidéos */}
        {(content.type === "podcast" || content.type === "video") && content.content_url && (
          <a href={content.content_url} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-accent hover:underline font-medium">
            <ExternalLink className="w-3 h-3" /> Ouvrir le lien
          </a>
        )}

        {/* CTA */}
        <button
          onClick={onClick}
          className="w-full mt-2 text-xs font-medium text-accent hover:text-accent hover:underline transition-colors text-center py-1.5 rounded-lg hover:bg-accent/5"
        >
          Voir les détails →
        </button>
      </div>

      {/* Playlist menu */}
      <div className="px-3 pb-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
        <AddToPlaylistMenu contentId={content.id} />
      </div>
    </div>
  );
}