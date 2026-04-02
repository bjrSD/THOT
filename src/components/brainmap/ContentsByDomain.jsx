import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Headphones, Play, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const TYPE_ICON = { book: BookOpen, podcast: Headphones, video: Play, article: FileText };

export default function ContentsByDomain({ contents, domainScores, DOMAIN_META }) {
  const [expanded, setExpanded] = useState(null);

  const topDomains = Object.entries(domainScores)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k]) => k);

  if (topDomains.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="w-5 h-5 text-accent" />
        <h3 className="font-semibold">Contenus qui nourrissent votre carte</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Les contenus qui ont le plus contribué à chaque domaine de votre profil.
      </p>

      <div className="space-y-2">
        {topDomains.map((key) => {
          const meta = DOMAIN_META[key];
          const domainContents = contents
            .filter(c => c.category === key && c.status === "completed")
            .slice(0, 5);
          const isOpen = expanded === key;

          return (
            <div key={key} className="border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : key)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
              >
                <span className="text-xl">{meta.emoji}</span>
                <span className="font-medium text-sm flex-1">{meta.label}</span>
                <span className="text-xs text-muted-foreground mr-2">{domainContents.length} contenu{domainContents.length !== 1 ? "s" : ""}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-border"
                >
                  {domainContents.length === 0 ? (
                    <p className="px-4 py-3 text-xs text-muted-foreground">Aucun contenu terminé dans ce domaine.</p>
                  ) : (
                    <div className="divide-y divide-border">
                      {domainContents.map(c => {
                        const Icon = TYPE_ICON[c.type] || BookOpen;
                        return (
                          <Link
                            key={c.id}
                            to={createPageUrl("ContentDetail") + `?id=${c.id}`}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/30 transition-colors"
                          >
                            {c.cover_url ? (
                              <img src={c.cover_url} alt={c.title} className="w-7 h-9 object-cover rounded shrink-0" />
                            ) : (
                              <div className="w-7 h-9 rounded bg-secondary flex items-center justify-center shrink-0">
                                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate">{c.title}</p>
                              {c.author && <p className="text-xs text-muted-foreground truncate">{c.author}</p>}
                            </div>
                            <span className="ml-auto text-xs text-accent font-medium shrink-0">+{c.kp_earned || 0} KP</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}