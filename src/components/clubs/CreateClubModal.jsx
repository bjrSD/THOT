import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Loader2, Share2, Twitter, Copy, Check, ChevronRight, Users, Image, BookOpen, Headphones, Play, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "philosophie", label: "Philosophie", emoji: "🧘" },
  { value: "science", label: "Science", emoji: "🔬" },
  { value: "business", label: "Business", emoji: "💼" },
  { value: "technologie", label: "Technologie", emoji: "💻" },
  { value: "histoire", label: "Histoire", emoji: "📜" },
  { value: "psychologie", label: "Psychologie", emoji: "🧠" },
  { value: "startup", label: "Startup", emoji: "🚀" },
  { value: "etudiants", label: "Étudiants", emoji: "🎓" },
  { value: "art", label: "Art & Culture", emoji: "🎨" },
  { value: "litterature", label: "Littérature", emoji: "📚" },
  { value: "finance", label: "Finance", emoji: "💰" },
  { value: "sante", label: "Santé", emoji: "🏥" },
  { value: "sport", label: "Sport & Perf.", emoji: "🏃" },
  { value: "langues", label: "Langues", emoji: "🌍" },
  { value: "developpement_personnel", label: "Dev. Personnel", emoji: "✨" },
  { value: "spiritualite", label: "Spiritualité", emoji: "🕊️" },
  { value: "politique", label: "Politique", emoji: "🏛️" },
  { value: "environnement", label: "Environnement", emoji: "🌱" },
  { value: "gastronomie", label: "Gastronomie", emoji: "🍽️" },
  { value: "autre", label: "Autre", emoji: "💡" },
];

const THEMES = [
  "Leadership", "Productivité", "Mindfulness", "Créativité", "Neurosciences",
  "Stoïcisme", "Épicurisme", "Existentialisme", "Intelligence émotionnelle",
  "Biohacking", "Deep Work", "Habits & Routines", "Investissement", "Marketing",
  "Design Thinking", "Agilité", "Management", "Communication", "Négociation",
  "Méditation", "Yoga", "Nutrition", "Sommeil", "Biologie", "Physique", "Mathématiques",
  "Informatique", "IA & Machine Learning", "Blockchain", "Web3", "Cryptomonnaies",
  "Géopolitique", "Économie", "Sociologie", "Anthropologie", "Archéologie",
  "Cinéma", "Musique", "Architecture", "Photographie", "Écriture", "Poésie",
];

const CONTENT_TYPES = [
  { value: "book", label: "Livres", icon: BookOpen, color: "text-green-500", bg: "bg-green-500/10" },
  { value: "podcast", label: "Podcasts", icon: Headphones, color: "text-purple-500", bg: "bg-purple-500/10" },
  { value: "video", label: "Vidéos", icon: Play, color: "text-red-500", bg: "bg-red-500/10" },
  { value: "article", label: "Articles", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
];

const EMOJIS = ["🚀", "🧠", "📚", "🔬", "💡", "🎯", "🌍", "🎨", "🏆", "💼", "🎓", "🧘", "⚡", "🌱", "🔥", "💎", "🦁", "🐉", "🌊", "🎵", "🧬", "🛸", "🏛️", "💰", "🕊️", "🍽️", "🏃", "📜", "🎭", "🌸"];

const VISIBILITIES = [
  { value: "public", label: "Public", desc: "Visible par tous" },
  { value: "friends", label: "Amis", desc: "Visible par vos abonnés" },
  { value: "private", label: "Privé", desc: "Sur invitation uniquement" },
];

export default function CreateClubModal({ onClose, onCreated }) {
  const qc = useQueryClient();
  const [step, setStep] = useState(1); // 1=info, 2=themes+types, 3=visuel, 4=share
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "autre",
    themes: [],
    content_types: ["book"],
    emoji: "🚀",
    visibility: "public",
    cover_url: "",
    rules: "",
    welcome_message: "",
  });
  const [uploadingCover, setUploadingCover] = useState(false);
  const [copied, setCopied] = useState(false);
  const [createdClub, setCreatedClub] = useState(null);
  const [themeSearch, setThemeSearch] = useState("");

  const toggleTheme = (theme) => {
    setForm(f => ({
      ...f,
      themes: f.themes.includes(theme) ? f.themes.filter(t => t !== theme) : [...f.themes, theme].slice(0, 8),
    }));
  };

  const toggleContentType = (type) => {
    setForm(f => ({
      ...f,
      content_types: f.content_types.includes(type)
        ? f.content_types.filter(t => t !== type)
        : [...f.content_types, type],
    }));
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const club = await base44.entities.Club.create({
        name: data.name,
        description: data.description,
        category: data.category,
        themes: data.themes,
        content_types: data.content_types,
        emoji: data.emoji,
        cover_url: data.cover_url || undefined,
        is_public: data.visibility === "public",
        visibility: data.visibility,
        rules: data.rules || undefined,
        welcome_message: data.welcome_message || undefined,
        members_count: 1,
      });
      // Auto-join as admin
      await base44.entities.ClubMember.create({
        club_id: club.id,
        club_name: data.name,
        role: "admin",
      });
      // Post on feed
      await base44.entities.Post.create({
        content: `J'ai créé le club "${data.name}" ${data.emoji} — rejoignez-nous ! 🎉`,
        type: "milestone",
        is_public: data.visibility === "public",
      });
      return club;
    },
    onSuccess: (club) => {
      qc.invalidateQueries({ queryKey: ["clubs"] });
      qc.invalidateQueries({ queryKey: ["my-memberships"] });
      qc.invalidateQueries({ queryKey: ["posts"] });
      setCreatedClub(club);
      setStep(4);
      toast.success("Club créé avec succès ! 🎉");
      onCreated?.(club);
    },
  });

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, cover_url: file_url }));
    } catch {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleShare = (platform) => {
    const text = `Je viens de créer le club "${form.name}" ${form.emoji} sur THOT ! Rejoignez-nous pour apprendre ensemble 🚀`;
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://app.thot.io")}&summary=${encodeURIComponent(text)}`,
    };
    window.open(urls[platform], "_blank");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Rejoignez mon club "${form.name}" ${form.emoji} sur THOT ! https://app.thot.io`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canSubmit1 = form.name.trim().length >= 3 && form.description.trim().length >= 10;
  const canSubmit2 = form.content_types.length > 0;

  const filteredThemes = themeSearch
    ? THEMES.filter(t => t.toLowerCase().includes(themeSearch.toLowerCase()))
    : THEMES;

  const TOTAL_STEPS = 3;
  const stepLabel = ["Infos", "Thèmes & Contenus", "Visuel"][step - 1] || "Partager";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{form.emoji}</span>
            <div>
              <h2 className="font-heading font-bold">
                {step < 4 ? "Créer un club" : "Club créé ! 🎉"}
              </h2>
              {step < 4 && <p className="text-xs text-muted-foreground">Étape {step}/{TOTAL_STEPS} · {stepLabel}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        {step < 4 && (
          <div className="flex h-1 bg-secondary">
            <div className="bg-accent transition-all duration-300" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
          </div>
        )}

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* ── STEP 1: Infos de base ── */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              {/* Emoji picker */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Icône du club</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
                      className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all ${form.emoji === e ? "bg-accent/20 ring-2 ring-accent" : "bg-secondary hover:bg-secondary/80"}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Nom du club *</label>
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Les Lecteurs du Dimanche"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground mt-1">{form.name.length}/50</p>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Description *</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Décrivez l'esprit et l'objectif de votre club..."
                  rows={3}
                  maxLength={300}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-transparent text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">{form.description.length}/300</p>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Catégorie principale</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(c => (
                    <button key={c.value} onClick={() => setForm(f => ({ ...f, category: c.value }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${form.category === c.value ? "border-accent bg-accent/10 text-accent font-medium" : "border-border hover:border-accent/40"}`}>
                      <span>{c.emoji}</span> {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Thèmes & Types de contenus ── */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              {/* Content types */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Types de contenus *</label>
                <p className="text-xs text-muted-foreground mb-3">Sur quels types de contenus se base votre club ?</p>
                <div className="grid grid-cols-2 gap-3">
                  {CONTENT_TYPES.map(ct => {
                    const Icon = ct.icon;
                    const selected = form.content_types.includes(ct.value);
                    return (
                      <button key={ct.value} onClick={() => toggleContentType(ct.value)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${selected ? `border-accent ${ct.bg}` : "border-border hover:border-accent/40"}`}>
                        <Icon className={`w-5 h-5 ${selected ? ct.color : "text-muted-foreground"}`} />
                        <span>{ct.label}</span>
                        {selected && <Check className="w-4 h-4 text-accent ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Themes */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Thèmes spécifiques</label>
                <p className="text-xs text-muted-foreground mb-2">Sélectionnez jusqu'à 8 thèmes ({form.themes.length}/8)</p>
                <Input
                  value={themeSearch}
                  onChange={e => setThemeSearch(e.target.value)}
                  placeholder="Rechercher un thème..."
                  className="mb-3 h-8 text-xs"
                />
                {form.themes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {form.themes.map(t => (
                      <span key={t} onClick={() => toggleTheme(t)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/15 text-accent rounded-full text-xs font-medium cursor-pointer hover:bg-accent/25 transition-colors">
                        {t} <X className="w-3 h-3" />
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {filteredThemes.filter(t => !form.themes.includes(t)).map(t => (
                    <button key={t} onClick={() => toggleTheme(t)} disabled={form.themes.length >= 8}
                      className="px-2.5 py-1 bg-secondary rounded-full text-xs text-muted-foreground hover:bg-accent/10 hover:text-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      + {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rules */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Règles du club <span className="font-normal text-muted-foreground">(optionnel)</span></label>
                <textarea
                  value={form.rules}
                  onChange={e => setForm(f => ({ ...f, rules: e.target.value }))}
                  placeholder="Ex: Respectez les autres membres, restez dans le thème..."
                  rows={2}
                  maxLength={500}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-transparent text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                />
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Visuel & Visibilité ── */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              {/* Cover photo */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Photo de couverture</label>
                <div className="relative h-36 rounded-xl overflow-hidden border-2 border-dashed border-border hover:border-accent/50 transition-colors bg-secondary">
                  {form.cover_url ? (
                    <img src={form.cover_url} alt="cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                      <Image className="w-8 h-8" />
                      <p className="text-xs">Cliquez pour ajouter une photo</p>
                    </div>
                  )}
                  {uploadingCover && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleCoverUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                {form.cover_url && (
                  <button onClick={() => setForm(f => ({ ...f, cover_url: "" }))} className="text-xs text-destructive hover:underline mt-1">Supprimer</button>
                )}
              </div>

              {/* Visibility */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Visibilité</label>
                <div className="space-y-2">
                  {VISIBILITIES.map(v => (
                    <button key={v.value} onClick={() => setForm(f => ({ ...f, visibility: v.value }))}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${form.visibility === v.value ? "border-accent bg-accent/10" : "border-border hover:border-accent/40"}`}>
                      <div className="text-left">
                        <p className="font-medium">{v.label}</p>
                        <p className="text-xs text-muted-foreground">{v.desc}</p>
                      </div>
                      {form.visibility === v.value && <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" /></div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Welcome message */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Message de bienvenue <span className="font-normal text-muted-foreground">(optionnel)</span></label>
                <textarea
                  value={form.welcome_message}
                  onChange={e => setForm(f => ({ ...f, welcome_message: e.target.value }))}
                  placeholder="Message affiché aux nouveaux membres..."
                  rows={2}
                  maxLength={300}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-transparent text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                />
              </div>

              {/* Preview */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Aperçu</label>
                <div className="border border-border rounded-xl overflow-hidden">
                  {form.cover_url && <img src={form.cover_url} alt="cover" className="w-full h-24 object-cover" />}
                  <div className="p-3 bg-card">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{form.emoji}</span>
                      <div>
                        <p className="font-bold text-sm">{form.name || "Nom du club"}</p>
                        <p className="text-xs text-muted-foreground">{CATEGORIES.find(c => c.value === form.category)?.label}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{form.description || "Description du club"}</p>
                    {form.themes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {form.themes.slice(0, 3).map(t => (
                          <span key={t} className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">{t}</span>
                        ))}
                        {form.themes.length > 3 && <span className="text-[10px] text-muted-foreground">+{form.themes.length - 3}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: Share ── */}
          {step === 4 && createdClub && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 text-center">
              <div className="text-5xl mb-2">{form.emoji}</div>
              <div>
                <h3 className="font-heading font-bold text-xl mb-1">{form.name}</h3>
                <p className="text-sm text-muted-foreground">{form.description}</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                <p className="text-sm font-medium text-green-700">✅ Club créé et partagé sur votre Feed !</p>
                <p className="text-xs text-green-600 mt-0.5">Vous êtes admin de ce club et automatiquement membre</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Partager sur</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: "twitter", label: "Twitter/X", emoji: "𝕏" },
                    { key: "whatsapp", label: "WhatsApp", emoji: "💬" },
                    { key: "linkedin", label: "LinkedIn", emoji: "💼" },
                  ].map(s => (
                    <button key={s.key} onClick={() => handleShare(s.key)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border hover:border-accent/40 hover:bg-secondary transition-all">
                      <span className="text-xl">{s.emoji}</span>
                      <span className="text-xs font-medium">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:border-accent/40 text-sm font-medium transition-all">
                {copied ? <><Check className="w-4 h-4 text-green-500" /> Lien copié !</> : <><Copy className="w-4 h-4" /> Copier le lien</>}
              </button>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border flex gap-3">
          {step === 1 && (
            <>
              <Button variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
              <Button onClick={() => setStep(2)} disabled={!canSubmit1} className="flex-1 gap-1">
                Suivant <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Retour</Button>
              <Button onClick={() => setStep(3)} disabled={!canSubmit2} className="flex-1 gap-1">
                Suivant <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
          {step === 3 && (
            <>
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Retour</Button>
              <Button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending} className="flex-1">
                {createMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Création...</> : "Créer le club 🚀"}
              </Button>
            </>
          )}
          {step === 4 && (
            <Button onClick={onClose} className="flex-1">Voir mon club ✓</Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}