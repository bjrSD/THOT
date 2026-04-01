import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BookOpen, Headphones, Play, FileText, ExternalLink, Loader2, Star, Save, Users } from "lucide-react";
import { TYPE_LABELS, CATEGORY_LABELS, STATUS_LABELS } from "@/components/shared/KPUtils";

const TYPE_ICON_MAP = { book: BookOpen, podcast: Headphones, video: Play, article: FileText };

async function fetchGoogleBooksData(title, author) {
  const q = encodeURIComponent(`${title} ${author || ""}`);
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`);
  const data = await res.json();
  const item = data.items?.[0];
  if (!item) return null;
  return {
    googleRating: item.volumeInfo?.averageRating || null,
    googleRatingsCount: item.volumeInfo?.ratingsCount || 0,
    description: item.volumeInfo?.description || "",
    pageCount: item.volumeInfo?.pageCount || null,
    categories: item.volumeInfo?.categories || [],
    thumbnail: item.volumeInfo?.imageLinks?.thumbnail || null,
    authors: item.volumeInfo?.authors || [],
    publisher: item.volumeInfo?.publisher || "",
    publishedDate: item.volumeInfo?.publishedDate || "",
  };
}

async function fetchSimilarBooks(title, author, category) {
  const q = encodeURIComponent(`subject:${category || title}`);
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=4&orderBy=relevance`);
  const data = await res.json();
  return (data.items || []).filter(item => item.volumeInfo?.title !== title).slice(0, 4).map(item => ({
    id: item.id,
    title: item.volumeInfo.title,
    author: item.volumeInfo.authors?.[0] || "",
    cover: item.volumeInfo.imageLinks?.thumbnail || null,
    rating: item.volumeInfo.averageRating || null,
    pages: item.volumeInfo.pageCount || null,
  }));
}

function StarRating({ rating, count, label, color = "text-yellow-400" }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map(s => (
          <Star key={s} className={`w-4 h-4 ${rating >= s ? `fill-current ${color}` : "text-border"}`} />
        ))}
      </div>
      <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
      {count > 0 && <span className="text-xs text-muted-foreground">({count.toLocaleString()} avis)</span>}
      <span className="text-xs text-muted-foreground">— {label}</span>
    </div>
  );
}

export default function ContentDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const contentId = urlParams.get("id");
  const queryClient = useQueryClient();

  const { data: content, isLoading } = useQuery({
    queryKey: ["content", contentId],
    queryFn: async () => {
      const list = await base44.entities.Content.filter({ id: contentId });
      return list[0];
    },
    enabled: !!contentId,
  });

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [googleData, setGoogleData] = useState(null);
  const [similarBooks, setSimilarBooks] = useState([]);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  useEffect(() => {
    if (content) {
      setForm({
        current_page: content.current_page || 0,
        current_duration: content.current_duration || 0,
        personal_note: content.personal_note || "",
        rating: content.rating || 0,
        status: content.status,
      });
      if (content.type === "book") {
        setLoadingGoogle(true);
        Promise.all([
          fetchGoogleBooksData(content.title, content.author),
          fetchSimilarBooks(content.title, content.author, content.category),
        ]).then(([gData, similar]) => {
          setGoogleData(gData);
          setSimilarBooks(similar);
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
      setEditing(false);
    },
  });

  const handleSave = () => {
    const updateData = { ...form };
    if (form.current_page) updateData.current_page = Number(form.current_page);
    if (form.current_duration) updateData.current_duration = Number(form.current_duration);
    if (form.rating) updateData.rating = Number(form.rating);
    updateMutation.mutate(updateData);
  };

  const handleComplete = () => {
    const updateData = {
      status: "completed",
      completed_date: new Date().toISOString().split("T")[0],
    };
    if (content.type === "book" && content.total_pages) updateData.current_page = content.total_pages;
    if (content.total_duration) updateData.current_duration = content.total_duration;
    updateMutation.mutate(updateData);
  };

  if (isLoading || !content) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const Icon = TYPE_ICON_MAP[content.type] || BookOpen;
  const progress = content.type === "book"
    ? (content.total_pages ? Math.round(((content.current_page || 0) / content.total_pages) * 100) : 0)
    : (content.total_duration ? Math.round(((content.current_duration || 0) / content.total_duration) * 100) : 0);

  const coverUrl = googleData?.thumbnail || content.cover_url;
  const thotRating = form.rating || content.rating;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => window.history.back()} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-20 h-28 rounded-xl overflow-hidden bg-card/80 border border-border shrink-0 flex items-center justify-center">
              {coverUrl ? (
                <img src={coverUrl} alt={content.title} className="w-full h-full object-cover" />
              ) : (
                <Icon className="w-8 h-8 text-accent" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-medium">{TYPE_LABELS[content.type]}</span>
                <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{CATEGORY_LABELS[content.category] || "Autre"}</span>
                {googleData?.categories?.[0] && (
                  <span className="text-xs bg-secondary/60 px-2 py-0.5 rounded-full text-muted-foreground">{googleData.categories[0]}</span>
                )}
              </div>
              <h1 className="font-heading text-2xl font-bold">{content.title}</h1>
              {content.author && <p className="text-muted-foreground mt-0.5">{content.author}</p>}
              {googleData?.publishedDate && (
                <p className="text-xs text-muted-foreground mt-0.5">{googleData.publisher ? `${googleData.publisher} · ` : ""}{googleData.publishedDate.slice(0, 4)}</p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-xs px-2.5 py-1 rounded-full bg-card border border-border font-medium">
                  {STATUS_LABELS[content.status]}
                </span>
                {content.kp_earned > 0 && (
                  <span className="text-xs text-accent font-medium">+{content.kp_earned} KP</span>
                )}
                {googleData?.pageCount && !content.total_pages && (
                  <span className="text-xs text-muted-foreground">{googleData.pageCount} pages</span>
                )}
                {content.total_pages && (
                  <span className="text-xs text-muted-foreground">{content.total_pages} pages</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ratings */}
        {content.type === "book" && (
          <div className="px-6 md:px-8 pt-5 space-y-2">
            <h3 className="font-heading font-semibold mb-3">Notes</h3>
            {loadingGoogle ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Chargement des notes Google Books…
              </div>
            ) : (
              <div className="space-y-2">
                <StarRating rating={googleData?.googleRating} count={googleData?.googleRatingsCount} label="Google Books" color="text-yellow-400" />
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} onClick={() => { setForm({ ...form, rating: s }); setEditing(true); }}>
                        <Star className={`w-4 h-4 ${(thotRating || 0) >= s ? "fill-yellow-500 text-yellow-500" : "text-border hover:text-yellow-300"}`} />
                      </button>
                    ))}
                  </div>
                  <span className="text-sm font-semibold">{thotRating ? thotRating.toFixed(1) : "—"}</span>
                  <span className="text-xs text-muted-foreground">— Ma note THOT</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-6 md:p-8 space-y-6">
          {/* Progress */}
          {(content.total_pages || content.total_duration) && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progression</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2.5" />
              <p className="text-xs text-muted-foreground mt-1">
                {content.type === "book"
                  ? `${content.current_page || 0} / ${content.total_pages} pages`
                  : `${content.current_duration || 0} / ${content.total_duration} min`}
              </p>
            </div>
          )}

          {/* Summary — prefer Google Books description for books */}
          {(content.summary || googleData?.description) && (
            <div>
              <h3 className="font-heading font-semibold mb-2">Résumé</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {googleData?.description || content.summary}
              </p>
            </div>
          )}

          {/* Tracking */}
          <div className="bg-secondary/50 rounded-xl p-4 space-y-4">
            <h3 className="font-heading font-semibold">Suivi de progression</h3>
            {content.type === "book" && (
              <div className="space-y-2">
                <Label>Page actuelle</Label>
                <Input
                  type="number"
                  value={form.current_page}
                  onChange={(e) => { setForm({ ...form, current_page: e.target.value }); setEditing(true); }}
                  max={content.total_pages || googleData?.pageCount}
                />
              </div>
            )}
            {(content.type === "podcast" || content.type === "video") && (
              <div className="space-y-2">
                <Label>Minutes écoutées/regardées</Label>
                <Input
                  type="number"
                  value={form.current_duration}
                  onChange={(e) => { setForm({ ...form, current_duration: e.target.value }); setEditing(true); }}
                  max={content.total_duration}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Note personnelle</Label>
              <Textarea
                value={form.personal_note}
                onChange={(e) => { setForm({ ...form, personal_note: e.target.value }); setEditing(true); }}
                rows={3}
                placeholder="Vos réflexions..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {editing && (
              <Button onClick={handleSave} disabled={updateMutation.isPending} className="flex-1">
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Sauvegarder
              </Button>
            )}
            {content.status !== "completed" && (
              <Button variant="outline" onClick={handleComplete} disabled={updateMutation.isPending} className="flex-1 border-green-500/30 text-green-600 hover:bg-green-500/10">
                Marquer comme terminé
              </Button>
            )}
          </div>

          {/* Buy link */}
          {content.buy_link && (
            <div>
              <h3 className="font-heading font-semibold mb-2">Où trouver</h3>
              <a href={content.buy_link} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-accent hover:underline">
                <ExternalLink className="w-4 h-4" /> Voir le lien
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Similar books */}
      {similarBooks.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-heading font-semibold mb-4">📚 Suggestions similaires</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {similarBooks.map((book, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="w-full aspect-[2/3] rounded-xl overflow-hidden bg-secondary mb-2 border border-border">
                  {book.cover ? (
                    <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold leading-tight line-clamp-2">{book.title}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{book.author}</p>
                {book.rating && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-muted-foreground">{book.rating.toFixed(1)}</span>
                  </div>
                )}
                {book.pages && <p className="text-xs text-muted-foreground">{book.pages} pages</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}