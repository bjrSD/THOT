import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Headphones, Play, FileText, Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TYPE_LABELS, CATEGORY_LABELS } from "@/components/shared/KPUtils";

const SUGGESTIONS = [
  { title: "Deep Work", author: "Cal Newport", type: "book", category: "business", reason: "Basé sur Atomic Habits" },
  { title: "The Tim Ferriss Show", author: "Tim Ferriss", type: "podcast", category: "business", reason: "Populaire cette semaine" },
  { title: "Thinking, Fast and Slow", author: "Kahneman", type: "book", category: "psychologie", reason: "Recommandé pour vous" },
  { title: "How to Take Smart Notes", author: "Sönke Ahrens", type: "book", category: "technologie", reason: "Dans votre domaine" },
];

const ICON_MAP = { book: BookOpen, podcast: Headphones, video: Play, article: FileText };

export default function Suggestions({ contents = [] }) {
  const categories = [...new Set(contents.map(c => c.category).filter(Boolean))];
  const topCategory = categories[0];

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold">Suggestions pour vous</h3>
        <div className="flex items-center gap-1 text-xs text-accent">
          <Zap className="w-3.5 h-3.5" /> IA
        </div>
      </div>
      <div className="space-y-3">
        {SUGGESTIONS.map((item, i) => {
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
    </div>
  );
}