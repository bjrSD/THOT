import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Headphones, Play, FileText, Loader2 } from "lucide-react";
import { CATEGORY_LABELS } from "./KPUtils";

const TYPES = [
  { value: "book", label: "Livre", icon: BookOpen },
  { value: "podcast", label: "Podcast", icon: Headphones },
  { value: "video", label: "Vidéo", icon: Play },
  { value: "article", label: "Article", icon: FileText },
];

export default function QuickAddModal({ onClose }) {
  const [step, setStep] = useState("type");
  const [form, setForm] = useState({
    title: "", author: "", type: "", category: "autre",
    summary: "", total_pages: "", total_duration: "",
    status: "to_consume", buy_link: "",
  });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Content.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      onClose();
    },
  });

  const handleSubmit = () => {
    const data = { ...form };
    if (data.total_pages) data.total_pages = Number(data.total_pages);
    if (data.total_duration) data.total_duration = Number(data.total_duration);
    if (!data.total_pages) delete data.total_pages;
    if (!data.total_duration) delete data.total_duration;
    createMutation.mutate(data);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un contenu</DialogTitle>
        </DialogHeader>

        {step === "type" && (
          <div className="grid grid-cols-2 gap-3">
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => { setForm({ ...form, type: t.value }); setStep("details"); }}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border hover:border-accent hover:bg-accent/5 transition-all"
              >
                <t.icon className="w-8 h-8 text-accent" />
                <span className="font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        )}

        {step === "details" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titre *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre du contenu" />
            </div>
            <div className="space-y-2">
              <Label>Auteur</Label>
              <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Auteur ou créateur" />
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.type === "book" && (
              <div className="space-y-2">
                <Label>Nombre de pages</Label>
                <Input type="number" value={form.total_pages} onChange={(e) => setForm({ ...form, total_pages: e.target.value })} />
              </div>
            )}
            {(form.type === "podcast" || form.type === "video") && (
              <div className="space-y-2">
                <Label>Durée (minutes)</Label>
                <Input type="number" value={form.total_duration} onChange={(e) => setForm({ ...form, total_duration: e.target.value })} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Résumé</Label>
              <Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep("type")} className="flex-1">Retour</Button>
              <Button onClick={handleSubmit} disabled={!form.title || createMutation.isPending} className="flex-1">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ajouter"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}