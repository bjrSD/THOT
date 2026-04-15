import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Headphones, ExternalLink, Clock, Calendar, User, Mic, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import CommunityReviews from "./CommunityReviews";

const CATEGORY_MAP = {
  philosophie: "Philosophie", science: "Science", business: "Business",
  technologie: "Technologie", histoire: "Histoire", psychologie: "Psychologie",
  art: "Art", sante: "Santé", autre: "Autre",
};

function detectCategory(content) {
  if (content.category && content.category !== "autre") return CATEGORY_MAP[content.category] || content.category;
  const text = (content.title + " " + (content.summary || "")).toLowerCase();
  if (text.match(/business|entreprise|startup|marketing|management/)) return "Business";
  if (text.match(/psychologie|mental|bien-être|émotions|comportement/)) return "Psychologie";
  if (text.match(/histoire|guerre|empire|révolution/)) return "Histoire";
  if (text.match(/science|physique|chimie|biologie|espace/)) return "Science";
  if (text.match(/ia|intelligence artificielle|tech|numérique/)) return "Technologie";
  if (text.match(/sport|entraînement|fitness|performance/)) return "Sport";
  if (text.match(/philosophie|éthique|sens|vie|existence/)) return "Philosophie";
  if (text.match(/développement|personnel|motivation|habitude|productivité/)) return "Développement personnel";
  return "Podcast";
}

export default function PodcastDescriptif({ content, liveReviews, communityAvg, progress, form }) {
  const [similarPodcasts, setSimilarPodcasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  const meta = (() => { try { return JSON.parse(content.personal_note || '{}'); } catch { return {}; } })();
  const podcastUrl = content.content_url || meta.externalUrl;
  const category = detectCategory(content);
  const summary = content.summary || meta.description || "";
  const publishDate = content.published_year || meta.publishedAt;
  const duration = content.total_duration;

  useEffect(() => {
    if (!content.title) return;
    setLoading(true);
    const query = content.author || content.title.split(" ").slice(0, 3).join(" ");
    base44.functions.invoke('searchPodcasts', { query, maxResults: 6 })
      .then(res => {
        setSimilarPodcasts((res.data?.items || []).filter(p => p.title !== content.title).slice(0, 4));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [content.id]);

  return (
    <div className="space-y-5">
      {/* Lien d'écoute */}
      {podcastUrl && (
        <a href={podcastUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-purple-400/40 bg-purple-500/5 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 transition-colors font-semibold text-sm">
          <Headphones className="w-4 h-4" /> Écouter le podcast →
        </a>
      )}

      {/* Info créateur */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
            {content.cover_url
              ? <img src={content.cover_url} alt={content.author} className="w-full h-full rounded-full object-cover" />
              : <Mic className="w-6 h-6 text-purple-500" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-base">{content.author || 'Créateur inconnu'}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{category}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {duration && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" /> {duration} min
                </span>
              )}
              {publishDate && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" /> {String(publishDate).slice(0, 10)}
                </span>
              )}
              {meta.listenCount && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Headphones className="w-3.5 h-3.5" /> {meta.listenCount} écoutes
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fiche technique */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
          <Headphones className="w-5 h-5 text-purple-500" /> Fiche technique
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Créateur", value: content.author },
            { label: "Thématique", value: category },
            { label: "Durée", value: duration ? `${duration} min` : null },
            { label: "Date", value: publishDate ? String(publishDate).slice(0, 10) : null },
            { label: "Progression", value: progress > 0 ? `${progress}%` : null },
            { label: "Plateforme", value: podcastUrl ? (podcastUrl.includes("spotify") ? "Spotify" : podcastUrl.includes("apple") ? "Apple Podcasts" : "En ligne") : null },
          ].filter(f => f.value).map(f => (
            <div key={f.label} className="bg-secondary/50 rounded-xl p-3">
              <p className="text-xs text-muted-foreground mb-1">{f.label}</p>
              <p className="text-sm font-semibold truncate">{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Résumé */}
      {summary && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-heading font-bold text-lg mb-3 flex items-center gap-2">
            <Headphones className="w-5 h-5 text-accent" /> Description
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

      {/* Podcasts similaires */}
      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground p-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Chargement des suggestions…
        </div>
      )}
      {similarPodcasts.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
            <Headphones className="w-5 h-5 text-accent" /> Podcasts similaires
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {similarPodcasts.map((p, i) => (
              <a key={i} href={p.externalUrl || "#"} target="_blank" rel="noopener noreferrer"
                className="group flex flex-col gap-1.5">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-secondary border border-border">
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center"><Headphones className="w-6 h-6 text-muted-foreground" /></div>
                  }
                </div>
                <p className="text-xs font-semibold line-clamp-2 leading-tight">{p.title}</p>
                {p.creator && <p className="text-xs text-muted-foreground truncate">{p.creator}</p>}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}