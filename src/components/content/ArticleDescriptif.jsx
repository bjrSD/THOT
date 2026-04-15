import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ExternalLink, FileText, Globe, Calendar, User, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import CommunityReviews from "./CommunityReviews";

const CATEGORY_MAP = {
  philosophie: "Philosophie", science: "Science", business: "Business",
  technologie: "Technologie", histoire: "Histoire", psychologie: "Psychologie",
  art: "Art", sante: "Santé", autre: "Autre",
};

function detectCategory(content) {
  if (content.category && content.category !== "autre") return CATEGORY_MAP[content.category] || content.category;
  const text = (content.title + " " + (content.summary || "")).toLowerCase();
  if (text.match(/sport|foot|basket|tennis|cyclisme|rugby|natation/)) return "Sport";
  if (text.match(/politique|élection|gouvernement|sénat|parlement/)) return "Politique";
  if (text.match(/économie|finance|bourse|marché|investissement/)) return "Économie";
  if (text.match(/ia|intelligence artificielle|machine learning|tech|numérique|startup/)) return "Technologie";
  if (text.match(/santé|médecine|virus|cancer|hôpital|vaccin/)) return "Santé";
  if (text.match(/science|physique|chimie|biologie|espace|nasa/)) return "Science";
  if (text.match(/histoire|guerre|empire|révolution|siècle/)) return "Histoire";
  if (text.match(/art|peinture|musique|cinéma|littérature|culture/)) return "Art & Culture";
  return "Actualité";
}

export default function ArticleDescriptif({ content, liveReviews, communityAvg, progress, form }) {
  const [similarArticles, setSimilarArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  const meta = (() => { try { return JSON.parse(content.personal_note || '{}'); } catch { return {}; } })();
  const articleUrl = content.content_url || content.buy_link || meta.externalUrl;
  const mediaName = content.author || meta.sourceName || "Source inconnue";
  const publishDate = content.published_year || meta.publishedAt;
  const category = detectCategory(content);
  const summary = content.summary || meta.description || "";

  useEffect(() => {
    if (!content.title) return;
    setLoading(true);
    const query = content.title.split(" ").slice(0, 4).join(" ");
    base44.functions.invoke('searchNews', { query, language: 'fr', maxResults: 6 })
      .then(res => {
        setSimilarArticles((res.data?.articles || []).filter(a => a.title !== content.title).slice(0, 4));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [content.id]);

  return (
    <div className="space-y-5">
      {/* Lien de lecture */}
      {articleUrl && (
        <a href={articleUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-blue-400/40 bg-blue-500/5 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition-colors font-semibold text-sm">
          <ExternalLink className="w-4 h-4" /> Lire l'article complet →
        </a>
      )}

      {/* Fiche technique */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" /> Fiche technique
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Média / Source", value: mediaName, icon: Globe },
            { label: "Auteur", value: meta.creator || content.author, icon: User },
            { label: "Thématique", value: category, icon: FileText },
            { label: "Date de parution", value: publishDate ? String(publishDate).slice(0, 10) : null, icon: Calendar },
            { label: "Progression", value: progress > 0 ? `${progress}%` : null, icon: null },
          ].filter(f => f.value).map(f => (
            <div key={f.label} className="bg-secondary/50 rounded-xl p-3">
              <p className="text-xs text-muted-foreground mb-1">{f.label}</p>
              <p className="text-sm font-semibold truncate">{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Résumé / Descriptif */}
      {summary && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-heading font-bold text-lg mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" /> Résumé
          </h2>
          <p className={`text-sm text-muted-foreground leading-relaxed ${!summaryExpanded ? "line-clamp-4" : ""}`}>
            {summary}
          </p>
          {summary.length > 200 && (
            <button onClick={() => setSummaryExpanded(v => !v)}
              className="flex items-center gap-1 text-xs text-accent hover:underline mt-2 font-medium">
              {summaryExpanded ? <><ChevronUp className="w-3.5 h-3.5" /> Voir moins</> : <><ChevronDown className="w-3.5 h-3.5" /> Voir plus</>}
            </button>
          )}
        </div>
      )}

      {/* Notes & avis */}
      <CommunityReviews liveReviews={liveReviews} communityAvg={communityAvg} />

      {/* Articles similaires */}
      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground p-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Chargement des suggestions…
        </div>
      )}
      {similarArticles.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" /> Articles similaires
          </h2>
          <div className="space-y-3">
            {similarArticles.map((a, i) => (
              <a key={i} href={a.externalUrl || a.url} target="_blank" rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-xl border border-border hover:border-accent/40 hover:bg-accent/5 transition-all group">
                {a.imageUrl && (
                  <img src={a.imageUrl} alt={a.title} className="w-16 h-12 object-cover rounded-lg shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold line-clamp-2 group-hover:text-accent transition-colors">{a.title}</p>
                  {a.sourceName && <p className="text-xs text-muted-foreground mt-0.5">{a.sourceName}</p>}
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}