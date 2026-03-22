import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Headphones, Play, FileText, Plus, Zap, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const ICON_MAP = { book: BookOpen, podcast: Headphones, video: Play, article: FileText };

const FALLBACK = [
  { title: "Deep Work", author: "Cal Newport", type: "book", category: "business", reason: "Productivité & focus" },
  { title: "The Tim Ferriss Show", author: "Tim Ferriss", type: "podcast", category: "business", reason: "Populaire cette semaine" },
  { title: "Thinking, Fast and Slow", author: "D. Kahneman", type: "book", category: "psychologie", reason: "Psychologie cognitive" },
  { title: "How to Take Smart Notes", author: "S. Ahrens", type: "book", category: "technologie", reason: "Méthodes d'apprentissage" },
];

export default function Suggestions({ contents = [] }) {
  const [suggestions, setSuggestions] = useState(FALLBACK);
  const [loading, setLoading] = useState(false);
  const [aiLoaded, setAiLoaded] = useState(false);

  const loadAISuggestions = async () => {
    if (contents.length === 0) return;
    setLoading(true);
    try {
      const completed = contents.filter(c => c.status === "completed").slice(0, 10);
      const categories = [...new Set(contents.map(c => c.category).filter(Boolean))];
      const titles = completed.map(c => `${c.title} (${c.type})`).join(", ");

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es un conseiller en développement intellectuel. Basé sur la bibliothèque de l'utilisateur, suggère 4 contenus à découvrir.

Bibliothèque: ${titles || "Vide"}
Catégories favorites: ${categories.join(", ") || "Non défini"}

Retourne exactement 4 suggestions variées (livres, podcasts, articles, vidéos).`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  author: { type: "string" },
                  type: { type: "string", enum: ["book", "podcast", "video", "article"] },
                  category: { type: "string" },
                  reason: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (result?.suggestions?.length > 0) {
        setSuggestions(result.suggestions);
        setAiLoaded(true);
      }
    } catch (e) {
      console.error("AI suggestions failed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contents.length > 0 && !aiLoaded) {
      loadAISuggestions();
    }
  }, [contents.length]);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold">Suggestions IA pour vous</h3>
        <div className="flex items-center gap-2">
          {aiLoaded && <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">✨ Personnalisé</span>}
          <button onClick={loadAISuggestions} disabled={loading} className="text-muted-foreground hover:text-accent transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {loading && suggestions === FALLBACK ? (
        <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Génération IA en cours...
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((item, i) => {
            const Icon = ICON_MAP[item.type] || BookOpen;
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.author} · <span className="text-accent">{item.reason}</span></p>
                  </div>
                  <Button size="icon" variant="ghost" className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}