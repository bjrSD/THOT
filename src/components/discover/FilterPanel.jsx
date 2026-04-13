import React from "react";
import { X, SlidersHorizontal, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const SORT_OPTIONS = [
  { value: "relevance", label: "Pertinence" },
  { value: "rating_desc", label: "Moyenne des avis (meilleure)" },
  { value: "rating_asc", label: "Moyenne des avis (plus basse)" },
  { value: "pages_asc", label: "Nb de pages (croissant)" },
  { value: "pages_desc", label: "Nb de pages (décroissant)" },
  { value: "date_desc", label: "Les plus récents" },
  { value: "date_asc", label: "Les plus anciens" },
  { value: "newest", label: "Nouvelles parutions" },
];

const QUICK_CRITERIA = [
  { sort: "rating_desc", label: "⭐ Mieux notés", desc: "Les mieux évalués en premier" },
  { sort: "date_desc", label: "🆕 Plus récents", desc: "Parutions les plus récentes" },
  { sort: "newest", label: "🔥 Nouveautés", desc: "Tout juste sortis" },
  { sort: "pages_asc", label: "⚡ Lecture rapide", desc: "Moins de 200 pages" },
  { sort: "pages_desc", label: "📖 Lecture longue", desc: "500+ pages" },
  { sort: "date_asc", label: "🏛️ Classiques", desc: "Les œuvres intemporelles" },
  { sort: "rating_asc", label: "💎 Pépites cachées", desc: "Peu notés mais à découvrir" },
];

const LANGUAGES = [
  { value: "", label: "Toutes les langues" },
  { value: "fr", label: "Français 🇫🇷" },
  { value: "en", label: "Anglais 🇬🇧" },
  { value: "es", label: "Espagnol 🇪🇸" },
  { value: "de", label: "Allemand 🇩🇪" },
  { value: "it", label: "Italien 🇮🇹" },
  { value: "ar", label: "Arabe 🇸🇦" },
  { value: "zh", label: "Chinois 🇨🇳" },
  { value: "ja", label: "Japonais 🇯🇵" },
];

const RATINGS = [
  { value: 0, label: "Toutes les notes" },
  { value: 3, label: "3+ ⭐" },
  { value: 3.5, label: "3,5+ ⭐" },
  { value: 4, label: "4+ ⭐" },
  { value: 4.5, label: "4,5+ ⭐" },
];

const PAGE_RANGES = [
  { value: "", label: "Toutes longueurs" },
  { value: "0-100", label: "Court (< 100 pages)" },
  { value: "100-250", label: "Moyen (100–250 pages)" },
  { value: "250-400", label: "Long (250–400 pages)" },
  { value: "400-600", label: "Très long (400–600 pages)" },
  { value: "600+", label: "Épique (600+ pages)" },
];

const YEAR_RANGES = [
  { value: "", label: "Toutes les époques" },
  { value: "2020", label: "Depuis 2020" },
  { value: "2015", label: "Depuis 2015" },
  { value: "2010", label: "Depuis 2010" },
  { value: "2000", label: "Depuis 2000" },
  { value: "1990", label: "Depuis 1990" },
  { value: "classic", label: "Classiques (avant 1990)" },
];

const CONTENT_TYPES = [
  { value: "", label: "Tous les types" },
  { value: "book", label: "📚 Livres" },
  { value: "podcast", label: "🎙️ Podcasts" },
  { value: "video", label: "🎬 Vidéos" },
  { value: "article", label: "📰 Articles" },
];

const DEFAULT_FILTERS = {
  sort: "relevance",
  contentType: "",
  genres: [],
  language: "fr",
  minRating: 0,
  pageRange: "",
  yearFrom: "",
  authorQuery: "",
  hasRating: false,
  hasCover: false,
};

export { DEFAULT_FILTERS };

export default function FilterPanel({ filters, onChange, onClose, onReset }) {
  const toggleGenre = (genre) => {
    const exists = filters.genres.includes(genre);
    onChange({ ...filters, genres: exists ? filters.genres.filter(g => g !== genre) : [...filters.genres, genre] });
  };

  const activeCount = [
    filters.sort !== "relevance",
    filters.contentType !== "",
    filters.genres.length > 0,
    filters.language !== "fr",
    filters.minRating > 0,
    filters.pageRange !== "",
    filters.yearFrom !== "",
    filters.authorQuery !== "",
    filters.hasRating,
    filters.hasCover,
  ].filter(Boolean).length;

  return (
    <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-accent" />
          <span className="font-semibold text-sm">Filtres avancés</span>
          {activeCount > 0 && (
            <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full">{activeCount}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onReset} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            <RotateCcw className="w-3 h-3" /> Réinitialiser
          </button>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto">

        {/* Trier par */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Trier par</p>
          <div className="space-y-1">
            {SORT_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => onChange({ ...filters, sort: opt.value })}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${filters.sort === opt.value ? "bg-accent/10 text-accent font-medium" : "hover:bg-secondary"}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type de contenu */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Type de contenu</p>
          <div className="grid grid-cols-2 gap-1.5">
            {CONTENT_TYPES.map(t => (
              <button key={t.value} onClick={() => onChange({ ...filters, contentType: t.value })}
                className={`text-sm px-3 py-2 rounded-lg border transition-colors text-left ${filters.contentType === t.value ? "border-accent bg-accent/10 text-accent font-medium" : "border-border hover:border-accent/40"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Critères rapides */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Critères rapides</p>
          <div className="space-y-1">
            {QUICK_CRITERIA.map(c => (
              <button key={c.sort} onClick={() => onChange({ ...filters, sort: c.sort })}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors flex items-center justify-between group ${
                  filters.sort === c.sort ? "border-accent bg-accent/10" : "border-border hover:border-accent/40 hover:bg-secondary"
                }`}>
                <div>
                  <span className={`text-sm font-medium ${filters.sort === c.sort ? "text-accent" : ""}`}>{c.label}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
                </div>
                {filters.sort === c.sort && <span className="text-accent text-xs">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Langue */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Langue</p>
          <div className="grid grid-cols-2 gap-1.5">
            {LANGUAGES.map(l => (
              <button key={l.value} onClick={() => onChange({ ...filters, language: l.value })}
                className={`text-sm px-3 py-2 rounded-lg border transition-colors text-left ${filters.language === l.value ? "border-accent bg-accent/10 text-accent font-medium" : "border-border hover:border-accent/40"}`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Note minimale */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Note minimale</p>
          <div className="flex flex-wrap gap-1.5">
            {RATINGS.map(r => (
              <button key={r.value} onClick={() => onChange({ ...filters, minRating: r.value })}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filters.minRating === r.value ? "bg-accent text-white border-accent" : "border-border hover:border-accent/40"}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Longueur (pages) */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Longueur du livre</p>
          <div className="space-y-1">
            {PAGE_RANGES.map(r => (
              <button key={r.value} onClick={() => onChange({ ...filters, pageRange: r.value })}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${filters.pageRange === r.value ? "bg-accent/10 text-accent font-medium" : "hover:bg-secondary"}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Époque / Année */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Époque de publication</p>
          <div className="space-y-1">
            {YEAR_RANGES.map(y => (
              <button key={y.value} onClick={() => onChange({ ...filters, yearFrom: y.value })}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${filters.yearFrom === y.value ? "bg-accent/10 text-accent font-medium" : "hover:bg-secondary"}`}>
                {y.label}
              </button>
            ))}
          </div>
        </div>

        {/* Auteur */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Filtrer par auteur</p>
          <input
            type="text"
            placeholder="Nom de l'auteur…"
            value={filters.authorQuery}
            onChange={e => onChange({ ...filters, authorQuery: e.target.value })}
            className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Extras */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Options</p>
          <div className="space-y-2">
            {[
              { key: "hasRating", label: "Uniquement les livres notés" },
              { key: "hasCover", label: "Uniquement avec couverture" },
            ].map(opt => (
              <label key={opt.key} className="flex items-center gap-3 cursor-pointer group">
                <div onClick={() => onChange({ ...filters, [opt.key]: !filters[opt.key] })}
                  className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${filters[opt.key] ? "bg-accent" : "bg-border"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filters[opt.key] ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}