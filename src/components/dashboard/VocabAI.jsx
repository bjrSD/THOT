import React, { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Loader2, RefreshCw, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function VocabAI({ contents = [] }) {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generate = async () => {
    const completed = contents.filter(c => c.status === "completed" && c.summary).slice(0, 5);
    if (completed.length === 0) return;

    setLoading(true);
    const summaries = completed.map(c => `"${c.title}" (${c.type}): ${c.summary?.slice(0, 200)}`).join("\n");

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es un expert en acquisition de vocabulaire. Analyse ces contenus et extrais 8 à 10 mots de vocabulaire avancés ou spécialisés que l'utilisateur a probablement rencontré en les lisant/écoutant.

Contenus récemment terminés:
${summaries}

Pour chaque mot, fournis une définition courte et un exemple d'usage en contexte.`,
      response_json_schema: {
        type: "object",
        properties: {
          words: {
            type: "array",
            items: {
              type: "object",
              properties: {
                word: { type: "string" },
                definition: { type: "string" },
                example: { type: "string" },
                level: { type: "string", enum: ["intermédiaire", "avancé", "expert"] }
              }
            }
          }
        }
      }
    });

    if (result?.words) {
      setWords(result.words);
      setGenerated(true);
    }
    setLoading(false);
  };

  const LEVEL_COLORS = {
    intermédiaire: "bg-green-500/10 text-green-600",
    avancé: "bg-blue-500/10 text-blue-600",
    expert: "bg-purple-500/10 text-purple-600",
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          <h3 className="font-heading font-semibold">Vocabulaire IA</h3>
          {generated && <span className="text-xs bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded-full">✨ Personnalisé</span>}
        </div>
        <Button size="sm" variant="outline" onClick={generate} disabled={loading || contents.filter(c => c.status === "completed").length === 0}
          className="gap-1.5 text-xs">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          {generated ? "Actualiser" : "Générer"}
        </Button>
      </div>

      {!generated && !loading && (
        <div className="text-center py-8">
          <Sparkles className="w-10 h-10 text-purple-400 mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground mb-3">
            L'IA analyse vos contenus terminés pour identifier les mots de vocabulaire clés.
          </p>
          <Button size="sm" onClick={generate} disabled={contents.filter(c => c.status === "completed").length === 0}
            className="gap-2 bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border border-purple-500/20">
            <Brain className="w-4 h-4" /> Analyser mes lectures
          </Button>
          {contents.filter(c => c.status === "completed").length === 0 && (
            <p className="text-xs text-muted-foreground mt-2">Terminez au moins un contenu pour activer cette fonctionnalité.</p>
          )}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
          Analyse en cours…
        </div>
      )}

      {generated && !loading && words.length > 0 && (
        <div className="space-y-2.5">
          {words.map((w, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="p-3 bg-secondary/40 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{w.word}</span>
                {w.level && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${LEVEL_COLORS[w.level] || "bg-secondary text-muted-foreground"}`}>
                    {w.level}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{w.definition}</p>
              {w.example && <p className="text-xs text-accent/80 mt-1 italic">"{w.example}"</p>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}