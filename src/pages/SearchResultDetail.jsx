import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Loader2, BookOpen, Play, Headphones, FileText } from "lucide-react";
import { mapToContent } from "@/lib/contentSearchService";
import { createPageUrl } from "@/utils";
import AddToPlaylistMenu from "@/components/library/AddToPlaylistMenu";

const TYPE_ICON = { book: BookOpen, video: Play, podcast: Headphones, article: FileText };

export default function SearchResultDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const itemData = urlParams.get("data");
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(null); // contentId after add
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (contentData) => base44.entities.Content.create(contentData),
    onSuccess: (created) => {
      setAdded(created.id);
      queryClient.invalidateQueries({ queryKey: ["contents"] });
    },
  });

  if (!itemData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aucun contenu trouvé</p>
        <Button onClick={() => window.history.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour
        </Button>
      </div>
    );
  }

  let item;
  try {
    item = JSON.parse(decodeURIComponent(itemData));
  } catch {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Erreur de chargement du contenu</p>
        <Button onClick={() => window.history.back()} className="mt-4">Retour</Button>
      </div>
    );
  }

  const Icon = TYPE_ICON[item.type] || FileText;
  const isVideo = item.type === "video";

  const handleAdd = async () => {
    setAdding(true);
    const contentData = mapToContent(item);
    createMutation.mutate(contentData);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Back button */}
      <button onClick={() => window.history.back()} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      {/* Hero section */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 rounded-2xl border border-border p-6 md:p-8">
        <div className="flex items-start gap-5">
          {/* Thumbnail */}
          <div className={`rounded-xl overflow-hidden bg-card border border-border shrink-0 shadow-md flex items-center justify-center ${isVideo ? "w-40 h-24" : "w-24 h-36"}`}>
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <Icon className="w-10 h-10 text-accent" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-semibold">
                {{ book: "Livre", podcast: "Podcast", video: "Vidéo", article: "Article" }[item.type] || item.type}
              </span>
              {item.sourceName && <span className="text-xs text-muted-foreground">{item.sourceName}</span>}
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold leading-tight">{item.title}</h1>
            {item.creator && (
              <p className="text-muted-foreground mt-2 font-medium">{item.creator}</p>
            )}
            {item.publishedAt && (
              <p className="text-xs text-muted-foreground mt-1">Publié le {new Date(item.publishedAt).toLocaleDateString("fr")}</p>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 mt-4 flex-wrap">
              {added ? (
                <Button variant="outline" disabled className="gap-1.5">
                  ✓ Ajouté à la bibliothèque
                </Button>
              ) : (
                <Button onClick={handleAdd} disabled={createMutation.isPending} className="gap-1.5">
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Ajouter à ma bibliothèque
                </Button>
              )}
              {added && (
                <AddToPlaylistMenu contentId={added} />
              )}
              {item.externalUrl && (
                <a href={item.externalUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-1.5">
                    Voir sur {item.sourceName || "la source"}
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {item.description && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-heading font-bold text-lg mb-3">Description</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          item.pageCount && { label: "Pages", value: item.pageCount },
          item.duration && { label: "Durée", value: `${item.duration} min` },
          item.language && { label: "Langue", value: item.language.toUpperCase() },
          item.publishedAt && { label: "Année", value: new Date(item.publishedAt).getFullYear() },
        ]
          .filter(Boolean)
          .map((s, i) => (
            <div key={i} className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className="font-semibold">{s.value}</p>
            </div>
          ))}
      </div>
    </motion.div>
  );
}