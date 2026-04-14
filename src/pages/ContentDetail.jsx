import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, BookOpen, Headphones, Play, FileText, ExternalLink, Loader2,
  Star, Save, Globe, TrendingUp, BookMarked, BarChart3, CheckCircle2,
  Quote, Heart, Tag, Calendar, Clock, Flame, MessageSquare, Award, Share2, ShoppingCart, Youtube
} from "lucide-react";
import { TYPE_LABELS, CATEGORY_LABELS, STATUS_LABELS } from "@/components/shared/KPUtils";
import VideoDescriptif from "@/components/content/VideoDescriptif";

const TYPE_ICON_MAP = { book: BookOpen, podcast: Headphones, video: Play, article: FileText };

const MOODS = ["😍 Adoré", "😊 Apprécié", "😐 Mitigé", "😕 Déçu", "😴 Ennuyeux", "🤯 Époustouflant", "💡 Inspirant", "😢 Émouvant"];
const STATUS_OPTIONS = [
  { value: "to_consume", label: "À découvrir" },
  { value: "in_progress", label: "En cours" },
  { value: "paused", label: "En pause" },
  { value: "to_review", label: "À revoir" },
  { value: "completed", label: "Terminé" },
];

async function fetchGoogleBooksData(title, author) {
  const q = encodeURIComponent(`${title} ${author || ""}`);
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`);
  const data = await res.json();
  const item = data.items?.[0];
  if (!item) return null;
  const info = item.volumeInfo;
  return {
    googleRating: info.averageRating || null,
    googleRatingsCount: info.ratingsCount || 0,
    description: info.description || "",
    pageCount: info.pageCount || null,
    categories: info.categories || [],
    thumbnail: info.imageLinks?.thumbnail?.replace("http://", "https://") || null,
    authors: info.authors || [],
    publisher: info.publisher || "",
    publishedDate: info.publishedDate || "",
    language: info.language || "",
    maturityRating: info.maturityRating || "",
    previewLink: info.previewLink || "",
    infoLink: info.infoLink || "",
  };
}

async function fetchSimilarBooks(title, author, category) {
  const [bySubject, byAuthor] = await Promise.all([
    fetch(`https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(category || title)}&maxResults=5&orderBy=relevance`).then(r => r.json()),
    author ? fetch(`https://www.googleapis.com/books/v1/volumes?q=inauthor:${encodeURIComponent(author)}&maxResults=4`).then(r => r.json()) : Promise.resolve({ items: [] }),
  ]);
  const mapBooks = (data) => (data.items || []).filter(i => i.volumeInfo?.title !== title).slice(0, 5).map(item => ({
    id: item.id,
    title: item.volumeInfo.title,
    author: item.volumeInfo.authors?.[0] || "",
    cover: item.volumeInfo.imageLinks?.thumbnail?.replace("http://", "https://") || null,
    rating: item.volumeInfo.averageRating || null,
    pages: item.volumeInfo.pageCount || null,
    link: item.volumeInfo.infoLink || "",
  }));
  return { bySubject: mapBooks(bySubject), byAuthor: mapBooks(byAuthor) };
}

function StarRow({ value, onChange, size = "w-5 h-5" }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button" onClick={() => onChange(s)}>
          <Star className={`${size} transition-colors ${(value || 0) >= s ? "fill-yellow-400 text-yellow-400" : "text-border hover:text-yellow-300"}`} />
        </button>
      ))}
    </div>
  );
}

function BookMiniCard({ book }) {
  return (
    <a href={book.link || `https://www.google.com/search?q=${encodeURIComponent(book.title)}`} target="_blank" rel="noopener noreferrer"
      className="group flex flex-col">
      <div className="w-full aspect-[2/3] rounded-lg overflow-hidden bg-secondary mb-2 border border-border">
        {book.cover
          ? <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-6 h-6 text-muted-foreground" /></div>
        }
      </div>
      <p className="text-xs font-semibold leading-tight line-clamp-2">{book.title}</p>
      <p className="text-xs text-muted-foreground truncate mt-0.5">{book.author}</p>
      {book.rating && (
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-semibold">{book.rating.toFixed(1)}</span>
        </div>
      )}
    </a>
  );
}

export default function ContentDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const contentId = urlParams.get("id");
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("descriptif");
  const [isDirty, setIsDirty] = useState(false);
  const [googleData, setGoogleData] = useState(null);
  const [similar, setSimilar] = useState({ bySubject: [], byAuthor: [] });
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [form, setForm] = useState({});
  const [quotes, setQuotes] = useState([]);
  const [newQuote, setNewQuote] = useState("");
  const [saved, setSaved] = useState(false);

  // Warn on browser/tab close if unsaved
  useEffect(() => {
    const handler = (e) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const { data: content, isLoading } = useQuery({
    queryKey: ["content", contentId],
    queryFn: async () => {
      const list = await base44.entities.Content.filter({ id: contentId });
      return list[0];
    },
    enabled: !!contentId,
  });

  useEffect(() => {
    if (content) {
      setForm({
        current_page: content.current_page || 0,
        current_duration: content.current_duration || 0,
        personal_note: content.personal_note || "",
        rating: content.rating || 0,
        status: content.status || "to_consume",
        mood: content.mood || "",
        community_review: content.community_review || "",
        tags: content.tags || "",
        reading_goal_pages: content.reading_goal_pages || "",
        is_favorite: content.is_favorite || false,
        is_public: content.is_public !== false,
      });
      setIsDirty(false);
      try { setQuotes(JSON.parse(content.quotes || "[]")); } catch { setQuotes([]); }

      if (content.type === "book") {
        setLoadingGoogle(true);
        Promise.all([
          fetchGoogleBooksData(content.title, content.author),
          fetchSimilarBooks(content.title, content.author, content.category),
        ]).then(([gData, sim]) => {
          setGoogleData(gData);
          setSimilar(sim);
          setLoadingGoogle(false);
        }).catch(() => setLoadingGoogle(false));
      }
    }
  }, [content]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Content.update(contentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content", contentId] });
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      setIsDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const updateForm = (updater) => { setForm(updater); setIsDirty(true); };

  const handleSave = () => {
    const data = { ...form };
    if (data.current_page) data.current_page = Number(data.current_page);
    if (data.current_duration) data.current_duration = Number(data.current_duration);
    if (data.rating) data.rating = Number(data.rating);
    if (data.reading_goal_pages) data.reading_goal_pages = Number(data.reading_goal_pages);
    data.quotes = JSON.stringify(quotes);
    updateMutation.mutate(data);
  };

  const handleComplete = () => {
    const data = { status: "completed", completed_date: new Date().toISOString().split("T")[0] };
    if (content.type === "book" && content.total_pages) data.current_page = content.total_pages;
    if (content.total_duration) data.current_duration = content.total_duration;
    updateMutation.mutate(data);
    setForm(f => ({ ...f, status: "completed" }));
  };

  const addQuote = () => {
    if (!newQuote.trim()) return;
    setQuotes(q => [...q, newQuote.trim()]);
    setNewQuote("");
  };

  if (isLoading || !content) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }

  const Icon = TYPE_ICON_MAP[content.type] || BookOpen;
  const progress = content.type === "book"
    ? (content.total_pages ? Math.round(((form.current_page || 0) / content.total_pages) * 100) : 0)
    : (content.total_duration ? Math.round(((form.current_duration || 0) / content.total_duration) * 100) : 0);
  const coverUrl = googleData?.thumbnail || content.cover_url;

  const TABS = [
    { id: "descriptif", label: "📖 Descriptif", icon: BookMarked },
    { id: "suivi", label: "📊 Mon Suivi", icon: BarChart3 },
  ];

  return (
    <div className="space-y-5">
      {/* Back */}
      <button onClick={() => window.history.back()} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 rounded-2xl border border-border p-6 md:p-8">
        <div className="flex items-start gap-5">
          <div className={`rounded-xl overflow-hidden bg-card border border-border shrink-0 shadow-md flex items-center justify-center ${content.type === 'video' ? 'w-40 h-24' : 'w-24 h-36'}`}>
            {coverUrl
              ? <img src={coverUrl} alt={content.title} className="w-full h-full object-cover" />
              : <Icon className="w-10 h-10 text-accent" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-medium">{TYPE_LABELS[content.type]}</span>
              <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{CATEGORY_LABELS[content.category] || "Autre"}</span>
              {form.is_favorite && <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">❤️ Favori</span>}
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold leading-tight">{content.title}</h1>
            {content.author && (
              <p className="text-muted-foreground mt-1 font-medium flex items-center gap-1.5">
                {content.type === 'video' && <Youtube className="w-4 h-4 text-red-500 shrink-0" />}
                {content.author}
              </p>
            )}
            {(googleData?.publisher || googleData?.publishedDate) && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {googleData.publisher}{googleData.publisher && googleData.publishedDate ? " · " : ""}{googleData.publishedDate?.slice(0, 4)}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs px-2.5 py-1 rounded-full bg-card border border-border font-medium">{STATUS_LABELS[form.status]}</span>
              {(content.total_pages || googleData?.pageCount) && (
                <span className="text-xs text-muted-foreground">{content.total_pages || googleData?.pageCount} pages</span>
              )}
              {googleData?.googleRating && (
                <span className="text-xs flex items-center gap-1 text-yellow-500 font-medium">
                  <Star className="w-3 h-3 fill-yellow-400" /> {googleData.googleRating.toFixed(1)} Google Books
                </span>
              )}
              {form.rating > 0 && (
                <span className="text-xs flex items-center gap-1 text-accent font-medium">
                  <Star className="w-3 h-3 fill-accent" /> {form.rating}/5 ma note
                </span>
              )}
              {progress > 0 && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-500" /> {progress}% lu
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Progress bar mini */}
        {(content.total_pages || content.total_duration) && progress > 0 && (
          <div className="mt-4">
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
      </div>

      {/* Tab buttons */}
      <div className="flex gap-3">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => {
            if (tab.id !== activeTab && activeTab === "suivi" && isDirty) {
              if (!window.confirm("Vous avez des modifications non sauvegardées. Voulez-vous les enregistrer avant de quitter ?")) {
                setIsDirty(false);
                setActiveTab(tab.id);
              }
            } else {
              setActiveTab(tab.id);
            }
          }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${
              activeTab === tab.id
                ? "border-accent bg-accent text-white shadow-md shadow-accent/20"
                : "border-border bg-card hover:border-accent/40 hover:bg-accent/5"
            }`}>
            {tab.label}{isDirty && activeTab === "suivi" && tab.id === "suivi" && <span className="w-2 h-2 rounded-full bg-orange-400 ml-1 inline-block" title="Modifications non sauvegardées" />}
          </button>
        ))}
      </div>

      {/* ─── TAB 1: DESCRIPTIF ─────────────────────────────────────── */}
      {activeTab === "descriptif" && (
        <div className="space-y-5">
          {/* VIDEO: use dedicated component */}
          {content.type === "video" ? (
            <VideoDescriptif content={content} />
          ) : (
            <>
              {/* Résumé complet */}
              {(googleData?.description || content.summary) && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="font-heading font-bold text-lg mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-accent" /> Résumé
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {googleData?.description || content.summary}
                  </p>
                </div>
              )}

              {/* Fiche technique */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-accent" /> Fiche technique
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Auteur", value: content.author || googleData?.authors?.join(", ") },
                    { label: "Éditeur", value: googleData?.publisher },
                    { label: "Année", value: googleData?.publishedDate?.slice(0, 4) },
                    { label: "Pages", value: content.total_pages || googleData?.pageCount },
                    { label: "Langue", value: googleData?.language?.toUpperCase() },
                    { label: "Catégorie", value: googleData?.categories?.[0] || CATEGORY_LABELS[content.category] },
                  ].filter(f => f.value).map(f => (
                    <div key={f.label} className="bg-secondary/50 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground mb-1">{f.label}</p>
                      <p className="text-sm font-semibold truncate">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes & Avis */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-accent" /> Notes & Avis
                </h2>
                <div className="space-y-4">
                  {googleData?.googleRating ? (
                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Google Books</p>
                        <div className="flex items-center gap-2">
                          <div className="flex">{[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-4 h-4 ${googleData.googleRating >= s ? "fill-yellow-400 text-yellow-400" : "text-border"}`} />
                          ))}</div>
                          <span className="font-bold">{googleData.googleRating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">({googleData.googleRatingsCount.toLocaleString()} avis)</span>
                        </div>
                      </div>
                      {googleData.infoLink && (
                        <a href={googleData.infoLink} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Voir les avis
                        </a>
                      )}
                    </div>
                  ) : loadingGoogle ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Chargement des notes Google Books…
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucune note Google Books disponible.</p>
                  )}
                  <a href={`https://www.goodreads.com/search?q=${encodeURIComponent(content.title + " " + content.author)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors p-3 bg-secondary/30 rounded-xl border border-border hover:border-accent/30">
                    <MessageSquare className="w-4 h-4" />
                    <span>Voir les avis sur <strong>Goodreads</strong></span>
                    <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                  </a>
                  <a href={`https://www.babelio.com/recherche.php?Recherche=${encodeURIComponent(content.title)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors p-3 bg-secondary/30 rounded-xl border border-border hover:border-accent/30">
                    <MessageSquare className="w-4 h-4" />
                    <span>Voir les avis sur <strong>Babelio</strong></span>
                    <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                  </a>
                </div>
              </div>

              {/* Où trouver (books only) */}
              {content.type === "book" && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-accent" /> Où trouver ce livre
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { name: "Amazon", url: `https://www.amazon.fr/s?k=${encodeURIComponent(content.title + " " + content.author)}`, emoji: "📦" },
                      { name: "Fnac", url: `https://www.fnac.com/SearchResult/ResultList.aspx?SCat=0!1&sft=1&sa=0&sf=1&Search=${encodeURIComponent(content.title)}`, emoji: "🏪" },
                      { name: "Google Books", url: googleData?.infoLink || `https://books.google.com/books?q=${encodeURIComponent(content.title)}`, emoji: "📚" },
                      { name: "Cultura", url: `https://www.cultura.com/recherche?text=${encodeURIComponent(content.title)}`, emoji: "🎨" },
                      content.buy_link && { name: "Lien direct", url: content.buy_link, emoji: "🔗" },
                    ].filter(Boolean).map(shop => (
                      <a key={shop.name} href={shop.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-accent/40 hover:bg-accent/5 transition-all text-sm font-medium">
                        <span className="text-lg">{shop.emoji}</span> {shop.name}
                        <ExternalLink className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Du même auteur */}
              {similar.byAuthor.length > 0 && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent" /> Du même auteur
                  </h2>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {similar.byAuthor.map((b, i) => <BookMiniCard key={i} book={b} />)}
                  </div>
                </div>
              )}

              {/* Dans le même genre */}
              {similar.bySubject.length > 0 && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                    <BookMarked className="w-5 h-5 text-accent" /> Dans le même genre
                  </h2>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                    {similar.bySubject.map((b, i) => <BookMiniCard key={i} book={b} />)}
                  </div>
                </div>
              )}

              {/* Preview Google Books */}
              {googleData?.previewLink && (
                <a href={googleData.previewLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-accent/30 text-accent hover:bg-accent/5 transition-colors font-medium text-sm">
                  <Globe className="w-4 h-4" /> Lire un extrait sur Google Books
                </a>
              )}
            </>
          )}
        </div>
      )}

      {/* ─── TAB 2: MON SUIVI ──────────────────────────────────────── */}
      {activeTab === "suivi" && (
        <div className="space-y-5">

          {/* Statut + Favoris */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" /> Statut & Actions
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Statut de lecture</Label>
                <Select value={form.status} onValueChange={v => updateForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                {form.status !== "completed" && (
                  <Button variant="outline" onClick={handleComplete} className="flex-1 border-green-500/30 text-green-600 hover:bg-green-500/10">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Marquer terminé
                  </Button>
                )}
                <Button
                  variant={form.is_favorite ? "default" : "outline"}
                  onClick={() => updateForm(f => ({ ...f, is_favorite: !f.is_favorite }))}
                  className={`flex-1 ${form.is_favorite ? "bg-red-500 hover:bg-red-600 border-red-500" : "border-red-300 text-red-500 hover:bg-red-50"}`}>
                  <Heart className={`w-4 h-4 mr-2 ${form.is_favorite ? "fill-white" : ""}`} /> {form.is_favorite ? "Favori ❤️" : "Ajouter aux favoris"}
                </Button>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => updateForm(f => ({ ...f, is_public: !f.is_public }))}
                  className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${form.is_public ? "bg-accent" : "bg-border"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_public ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
                <span className="text-sm">Visible par la communauté</span>
              </label>
            </div>
          </div>

          {/* Ma note */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-accent" /> Ma note personnelle
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Note (sur 5)</Label>
                <StarRow value={form.rating} onChange={v => updateForm(f => ({ ...f, rating: v }))} size="w-8 h-8" />
                {form.rating > 0 && <p className="text-sm text-muted-foreground mt-2">{["", "Pas aimé", "Passable", "Bien", "Très bien", "Chef-d'œuvre"][form.rating]}</p>}
              </div>
              <div className="space-y-2">
                <Label>Mon humeur de lecture</Label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map(m => (
                    <button key={m} onClick={() => updateForm(f => ({ ...f, mood: m }))}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.mood === m ? "bg-accent text-white border-accent" : "border-border hover:border-accent/40"}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Progression */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-accent" /> Progression
            </h2>
            <div className="space-y-4">
              {content.type === "book" && (
                <>
                  <div className="space-y-2">
                    <Label>Page actuelle / {content.total_pages || googleData?.pageCount || "?"}</Label>
                    <Input type="number" value={form.current_page} min={0} max={content.total_pages || 9999}
                      onChange={e => updateForm(f => ({ ...f, current_page: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Objectif de pages / jour</Label>
                    <Input type="number" value={form.reading_goal_pages} placeholder="Ex: 30 pages/jour"
                      onChange={e => updateForm(f => ({ ...f, reading_goal_pages: e.target.value }))} />
                    {form.reading_goal_pages && content.total_pages && form.current_page < content.total_pages && (
                      <p className="text-xs text-accent">
                        📅 Encore ~{Math.ceil((content.total_pages - form.current_page) / form.reading_goal_pages)} jours à ce rythme
                      </p>
                    )}
                  </div>
                </>
              )}
              {content.type === "podcast" && (
                <div className="space-y-2">
                  <Label>Minutes écoutées / {content.total_duration || "?"}</Label>
                  <Input type="number" value={form.current_duration} min={0} max={content.total_duration || 9999}
                    onChange={e => updateForm(f => ({ ...f, current_duration: e.target.value }))} />
                </div>
              )}
              {content.type === "video" && (
                <div className="space-y-2">
                  <Label>Minutes visionnées / {content.total_duration || "?"} min</Label>
                  <Input type="number" value={form.current_duration} min={0} max={content.total_duration || 9999}
                    onChange={e => updateForm(f => ({ ...f, current_duration: e.target.value }))} />
                  {content.content_url && (
                    <a href={content.content_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:underline font-medium mt-1">
                      <Youtube className="w-3.5 h-3.5" /> Reprendre sur YouTube
                    </a>
                  )}
                </div>
              )}
              {(content.total_pages || content.total_duration) && (
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progression</span><span className="font-bold text-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3 rounded-full" />
                </div>
              )}
            </div>
          </div>

          {/* Notes personnelles */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-accent" /> Mes notes & réflexions
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Note personnelle (privée)</Label>
                <Textarea value={form.personal_note} rows={4} placeholder="Mes réflexions, apprentissages, idées clés…"
                  onChange={e => updateForm(f => ({ ...f, personal_note: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Avis pour la communauté (public)</Label>
                <Textarea value={form.community_review} rows={3} placeholder="Recommanderiez-vous ce livre ? Pourquoi ?"
                  onChange={e => updateForm(f => ({ ...f, community_review: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Tags personnels</Label>
                <Input value={form.tags} placeholder="Ex: incontournable, à relire, offrir…"
                  onChange={e => updateForm(f => ({ ...f, tags: e.target.value }))} />
                <p className="text-xs text-muted-foreground">Séparez par des virgules</p>
              </div>
            </div>
          </div>

          {/* Citations / Extraits */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
              <Quote className="w-5 h-5 text-accent" /> Mes citations & extraits
            </h2>
            <div className="space-y-3 mb-4">
              {quotes.length === 0 && <p className="text-sm text-muted-foreground">Aucune citation enregistrée.</p>}
              {quotes.map((q, i) => (
                <div key={i} className="flex items-start gap-2 bg-secondary/50 rounded-xl p-3">
                  <Quote className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <p className="text-sm italic flex-1">"{q}"</p>
                  <button onClick={() => setQuotes(qs => qs.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive text-xs shrink-0">✕</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={newQuote} placeholder="Ajouter une citation ou extrait…"
                onChange={e => setNewQuote(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addQuote()} />
              <Button variant="outline" onClick={addQuote} className="shrink-0">Ajouter</Button>
            </div>
          </div>

          {/* Partager */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-accent" /> Partager
            </h2>
            <div className="flex flex-wrap gap-3">
              {[
                { name: "Twitter / X", url: `https://twitter.com/intent/tweet?text=Je%20lis%20"${encodeURIComponent(content.title)}"%20de%20${encodeURIComponent(content.author)}%20sur%20THOT%20!%20📚`, emoji: "🐦" },
                { name: "WhatsApp", url: `https://wa.me/?text=Je%20lis%20"${encodeURIComponent(content.title)}"%20de%20${encodeURIComponent(content.author)}`, emoji: "💬" },
              ].map(s => (
                <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:border-accent/40 hover:bg-accent/5 text-sm font-medium transition-all">
                  {s.emoji} {s.name}
                </a>
              ))}
            </div>
          </div>

          {/* Save button */}
          <Button onClick={handleSave} disabled={updateMutation.isPending} size="lg" className="w-full h-12 text-base">
            {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            {saved ? "✓ Sauvegardé !" : "Sauvegarder mon suivi"}
          </Button>
        </div>
      )}
    </div>
  );
}