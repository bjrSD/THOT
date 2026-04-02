import React, { useState } from "react";
import { BookOpen, Headphones, Play, FileText, Plus, Bookmark, BookmarkCheck, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";

const TYPE_ICON = { book: BookOpen, podcast: Headphones, video: Play, article: FileText };

/**
 * Barre d'actions pour un contenu mentionné dans un post ou une activité.
 * Permet d'ouvrir la fiche, d'ajouter à la bibliothèque, ou de sauvegarder.
 */
export default function ContentActionBar({ contentTitle, contentType, contentRefId }) {
  const [added, setAdded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  if (!contentTitle) return null;

  const Icon = TYPE_ICON[contentType] || BookOpen;

  const handleAdd = async () => {
    if (added || loading) return;
    setLoading(true);
    await base44.entities.Content.create({
      title: contentTitle,
      type: contentType || "book",
      status: "to_consume",
    });
    qc.invalidateQueries({ queryKey: ["contents"] });
    setAdded(true);
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-3 py-2 mt-2">
      <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <span className="text-xs font-medium flex-1 truncate">{contentTitle}</span>
      <div className="flex gap-1 shrink-0">
        {/* Sauvegarder */}
        <button
          onClick={() => setSaved(!saved)}
          className={`p-1 rounded-lg transition-colors text-xs ${saved ? "text-accent" : "text-muted-foreground hover:text-accent"}`}
          title="Sauvegarder"
        >
          {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
        </button>
        {/* Ajouter à la bibliothèque */}
        <button
          onClick={handleAdd}
          disabled={added || loading}
          className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg font-medium transition-colors ${
            added
              ? "bg-green-500/15 text-green-600"
              : "bg-accent/10 text-accent hover:bg-accent/20"
          }`}
          title="Ajouter à ma bibliothèque"
        >
          {added ? "✓ Ajouté" : <><Plus className="w-3 h-3" /> Ajouter</>}
        </button>
      </div>
    </div>
  );
}