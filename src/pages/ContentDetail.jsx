import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BookOpen, Headphones, Play, FileText, ExternalLink, Loader2, Star, Save } from "lucide-react";
import { TYPE_LABELS, CATEGORY_LABELS, STATUS_LABELS, calculateKP } from "@/components/shared/KPUtils";

const TYPE_ICON_MAP = { book: BookOpen, podcast: Headphones, video: Play, article: FileText };

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

  useEffect(() => {
    if (content) setForm({
      current_page: content.current_page || 0,
      current_duration: content.current_duration || 0,
      personal_note: content.personal_note || "",
      rating: content.rating || 0,
      status: content.status,
    });
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => window.history.back()} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-20 h-28 rounded-xl bg-card/80 backdrop-blur flex items-center justify-center border border-border">
              <Icon className="w-8 h-8 text-accent" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-medium">{TYPE_LABELS[content.type]}</span>
                <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{CATEGORY_LABELS[content.category] || "Autre"}</span>
              </div>
              <h1 className="font-heading text-2xl font-bold">{content.title}</h1>
              {content.author && <p className="text-muted-foreground mt-1">{content.author}</p>}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs px-2.5 py-1 rounded-full bg-card border border-border font-medium">
                  {STATUS_LABELS[content.status]}
                </span>
                {content.kp_earned > 0 && (
                  <span className="text-xs text-accent font-medium">+{content.kp_earned} KP</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="p-6 md:p-8 space-y-6">
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
                  : `${content.current_duration || 0} / ${content.total_duration} min`
                }
              </p>
            </div>
          )}

          {/* Summary */}
          {content.summary && (
            <div>
              <h3 className="font-heading font-semibold mb-2">Résumé</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{content.summary}</p>
            </div>
          )}

          {/* Rating */}
          <div>
            <h3 className="font-heading font-semibold mb-2">Note</h3>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => { setForm({...form, rating: s}); setEditing(true); }}>
                  <Star className={`w-6 h-6 ${(form.rating || content.rating || 0) >= s ? "fill-yellow-400 text-yellow-400" : "text-border"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Tracking */}
          <div className="bg-secondary/50 rounded-xl p-4 space-y-4">
            <h3 className="font-heading font-semibold">Suivi de progression</h3>
            {content.type === "book" && (
              <div className="space-y-2">
                <Label>Page actuelle</Label>
                <Input
                  type="number"
                  value={form.current_page}
                  onChange={(e) => { setForm({...form, current_page: e.target.value}); setEditing(true); }}
                  max={content.total_pages}
                />
              </div>
            )}
            {(content.type === "podcast" || content.type === "video") && (
              <div className="space-y-2">
                <Label>Minutes écoutées/regardées</Label>
                <Input
                  type="number"
                  value={form.current_duration}
                  onChange={(e) => { setForm({...form, current_duration: e.target.value}); setEditing(true); }}
                  max={content.total_duration}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Note personnelle</Label>
              <Textarea
                value={form.personal_note}
                onChange={(e) => { setForm({...form, personal_note: e.target.value}); setEditing(true); }}
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

          {/* Buy links */}
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
    </div>
  );
}