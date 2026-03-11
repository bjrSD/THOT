import React, { useState } from "react";
import { BookOpen, Headphones, Play, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { TYPE_LABELS, CATEGORY_LABELS } from "../shared/KPUtils";

const TYPE_ICON_MAP = { book: BookOpen, podcast: Headphones, video: Play, article: FileText };

export default function ContentCard({ content, onClick }) {
  const [flipped, setFlipped] = useState(false);
  const Icon = TYPE_ICON_MAP[content.type] || BookOpen;

  const progress = content.type === "book"
    ? (content.total_pages ? Math.round(((content.current_page || 0) / content.total_pages) * 100) : 0)
    : (content.total_duration ? Math.round(((content.current_duration || 0) / content.total_duration) * 100) : 0);

  return (
    <div
      className="perspective cursor-pointer"
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={onClick}
    >
      <div className={`relative preserve-3d transition-transform duration-500 ${flipped ? "rotate-y-180" : ""}`}>
        {/* Front */}
        <div className="backface-hidden bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3">
            <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{content.title}</p>
              {content.author && <p className="text-xs text-muted-foreground truncate">{content.author}</p>}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{TYPE_LABELS[content.type]}</span>
              </div>
            </div>
          </div>
          {progress > 0 && (
            <div className="mt-3">
              <Progress value={progress} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-1 text-right">{progress}%</p>
            </div>
          )}
        </div>

        {/* Back */}
        <div className="backface-hidden rotate-y-180 absolute inset-0 bg-card rounded-xl border border-accent/30 p-4 shadow-md">
          <p className="text-xs font-medium text-accent mb-2">{CATEGORY_LABELS[content.category] || "Autre"}</p>
          <p className="text-xs text-muted-foreground line-clamp-3">{content.summary || "Pas de résumé"}</p>
          {content.personal_note && (
            <p className="text-xs mt-2 italic text-foreground/70 line-clamp-2">📝 {content.personal_note}</p>
          )}
          <p className="text-xs text-accent font-medium mt-auto pt-2">Cliquer pour détails →</p>
        </div>
      </div>
    </div>
  );
}