import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, BookOpen, Headphones, Play, FileText, Trophy, Flame, Star,
  Edit2, Save, LogOut, MapPin, Calendar, User, Shield, ChevronRight, Check, X,
  Camera, Settings, Share2, Megaphone, TrendingUp, Globe, Twitter, Link as LinkIcon
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { LEVELS, getUserLevel, getNextLevel, getLevelProgress } from "@/components/shared/KPUtils";
import UserAvatar from "@/components/shared/UserAvatar";

const TABS = ["Profil", "Statistiques", "Badges", "Activité"];

// Real badge definitions connected to actual content data
function getRealBadges(user, contents) {
  const completed = contents.filter(c => c.status === "completed");
  const books = completed.filter(c => c.type === "book").length;
  const podcasts = completed.filter(c => c.type === "podcast").length;
  const videos = completed.filter(c => c.type === "video").length;
  const articles = completed.filter(c => c.type === "article").length;
  const totalPages = completed.filter(c => c.type === "book").reduce((acc, c) => acc + (c.total_pages || 0), 0);
  const totalContents = completed.length;
  const streak = user?.current_streak || 0;
  const longestStreak = user?.longest_streak || 0;
  const kp = user?.total_kp || 0;

  return [
    { id: "first_book",    icon: "📚", name: "Premier livre",      desc: "Terminer votre 1er livre",          earned: books >= 1,    category: "lecture" },
    { id: "books_5",       icon: "📖", name: "Lecteur assidu",     desc: "Terminer 5 livres",                 earned: books >= 5,    category: "lecture" },
    { id: "books_10",      icon: "🎓", name: "Grand lecteur",      desc: "Terminer 10 livres",                earned: books >= 10,   category: "lecture" },
    { id: "books_25",      icon: "👑", name: "Bibliophile",        desc: "Terminer 25 livres",                earned: books >= 25,   category: "lecture" },
    { id: "first_podcast", icon: "🎙️", name: "Auditeur",           desc: "Terminer votre 1er podcast",       earned: podcasts >= 1, category: "audio" },
    { id: "podcasts_10",   icon: "🎧", name: "Podcasteur",         desc: "Écouter 10 podcasts",               earned: podcasts >= 10,category: "audio" },
    { id: "first_video",   icon: "🎬", name: "Cinéphile du savoir",desc: "Regarder votre 1ère vidéo",        earned: videos >= 1,   category: "video" },
    { id: "articles_5",    icon: "📰", name: "Curieux du monde",   desc: "Lire 5 articles",                   earned: articles >= 5, category: "lecture" },
    { id: "pages_500",     icon: "📄", name: "500 pages",          desc: "Lire 500 pages au total",           earned: totalPages >= 500,  category: "stats" },
    { id: "pages_2000",    icon: "🏅", name: "2000 pages",         desc: "Lire 2000 pages au total",          earned: totalPages >= 2000, category: "stats" },
    { id: "contents_10",   icon: "⭐", name: "Explorateur",        desc: "Compléter 10 contenus",             earned: totalContents >= 10, category: "stats" },
    { id: "contents_50",   icon: "💎", name: "Polymathe",          desc: "Compléter 50 contenus",             earned: totalContents >= 50, category: "stats" },
    { id: "streak_7",      icon: "🔥", name: "Semaine parfaite",   desc: "7 jours de streak",                 earned: longestStreak >= 7,  category: "streak" },
    { id: "streak_30",     icon: "⚡", name: "Mois de feu",        desc: "30 jours de streak",                earned: longestStreak >= 30, category: "streak" },
    { id: "streak_100",    icon: "🌟", name: "Légendaire",         desc: "100 jours de streak",               earned: longestStreak >= 100,category: "streak" },
    { id: "kp_1000",       icon: "🧠", name: "1000 KP",            desc: "Atteindre 1000 KP",                 earned: kp >= 1000,  category: "kp" },
    { id: "kp_5000",       icon: "🏆", name: "5000 KP",            desc: "Atteindre 5000 KP",                 earned: kp >= 5000,  category: "kp" },
    { id: "mixed_master",  icon: "🌈", name: "Tout-terrain",       desc: "1 de chaque type complété",         earned: books >= 1 && podcasts >= 1 && videos >= 1 && articles >= 1, category: "special" },
  ];
}

const BADGE_CATEGORIES = [
  { id: "all", label: "Tous" },
  { id: "lecture", label: "📚 Lecture" },
  { id: "audio", label: "🎧 Audio" },
  { id: "video", label: "🎬 Vidéo" },
  { id: "streak", label: "🔥 Streak" },
  { id: "kp", label: "⭐ KP" },
  { id: "stats", label: "📊 Stats" },
  { id: "special", label: "✨ Spécial" },
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("Profil");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [badgeCat, setBadgeCat] = useState("all");
  const [publishingBadge, setPublishingBadge] = useState(null);
  const [publishedBadge, setPublishedBadge] = useState(null);
  const fileInputRef = useRef(null);
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setEditForm({
        full_name: u?.full_name || "",
        bio: u?.bio || "",
        city: u?.city || "",
        birthdate: u?.birthdate || "",
        website: u?.website || "",
        twitter: u?.twitter || "",
        occupation: u?.occupation || "",
      });
    });
  }, []);

  const { data: contents = [] } = useQuery({
    queryKey: ["contents"],
    queryFn: () => base44.entities.Content.list("-updated_date", 200),
  });

  const { data: recentActivity = [] } = useQuery({
    queryKey: ["activity-profile"],
    queryFn: () => base44.entities.Activity.list("-created_date", 20),
  });

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({
      bio: editForm.bio,
      city: editForm.city,
      birthdate: editForm.birthdate,
      website: editForm.website,
      twitter: editForm.twitter,
      occupation: editForm.occupation,
      display_name: editForm.full_name,
    });
    const updated = await base44.auth.me();
    setUser({ ...updated, ...editForm, display_name: editForm.full_name });
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    // Convert to base64 for upload
    const base64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
    const { file_url } = await base44.integrations.Core.UploadFile({ file: base64 });
    await base44.auth.updateMe({ avatar_url: file_url });
    setUser(u => ({ ...u, avatar_url: file_url }));
    setUploadingAvatar(false);
  };

  const publishBadgeMutation = useMutation({
    mutationFn: (badge) => base44.entities.Post.create({
      content: `🏅 Je viens de débloquer le badge **${badge.name}** ${badge.icon} sur THOT !\n\n"${badge.desc}"\n\nOn continue l'aventure ! 🚀`,
      type: "milestone",
      is_public: true,
    }),
    onSuccess: (_, badge) => {
      setPublishedBadge(badge.id);
      setPublishingBadge(null);
      qc.invalidateQueries({ queryKey: ["posts"] });
      setTimeout(() => setPublishedBadge(null), 3000);
    },
  });

  if (!user) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  const kp = user.total_kp || 0;
  const level = getUserLevel(kp);
  const nextLevel = getNextLevel(kp);
  const levelProgress = getLevelProgress(kp);

  const completed = contents.filter(c => c.status === "completed");
  const byType = {
    book: completed.filter(c => c.type === "book").length,
    podcast: completed.filter(c => c.type === "podcast").length,
    video: completed.filter(c => c.type === "video").length,
    article: completed.filter(c => c.type === "article").length,
  };
  const totalPages = completed.filter(c => c.type === "book").reduce((acc, c) => acc + (c.total_pages || 0), 0);

  const allBadges = getRealBadges(user, contents);
  const earnedBadges = allBadges.filter(b => b.earned);
  const filteredBadges = badgeCat === "all" ? allBadges : allBadges.filter(b => b.category === badgeCat);

  return (
    <div className="w-full space-y-5">
      {/* Cover + Avatar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary via-accent to-fuchsia-500 relative">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=40)", backgroundSize: "cover" }} />
          </div>
          <div className="px-6 pb-6">
            <div className="-mt-12 mb-3 flex items-end justify-between gap-4 flex-wrap">
              {/* Avatar with upload */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-2xl border-4 border-card shadow-lg overflow-hidden bg-card">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-4xl font-black">
                      {level.icon}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent text-white rounded-full flex items-center justify-center shadow hover:bg-accent/90 transition-colors"
                >
                  {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center shadow">
                  <span className="text-white text-xs font-bold">{earnedBadges.length}</span>
                </div>
              </div>

              <div className="flex gap-2 mb-1 flex-wrap">
                {editing ? (
                  <>
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1.5" /> Sauvegarder</>}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)}><X className="w-4 h-4" /></Button>
                  </>
                ) : (
                  <>
                    <Link to="/PublicProfile">
                      <Button variant="outline" size="sm" className="gap-1.5"><Globe className="w-4 h-4" /> Profil public</Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                      <Edit2 className="w-4 h-4 mr-1.5" /> Modifier
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => base44.auth.logout()}>
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            <h1 className="font-heading text-2xl font-bold">{user.full_name}</h1>
            <p className="text-muted-foreground text-sm">{user.email}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
              {user.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{user.city}</span>}
              {user.occupation && <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{user.occupation}</span>}
              {user.birthdate && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{user.birthdate}</span>}
              {user.website && (
                <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-accent hover:underline">
                  <Globe className="w-3.5 h-3.5" />{user.website.replace(/https?:\/\//, "")}
                </a>
              )}
              {user.twitter && (
                <a href={`https://twitter.com/${user.twitter.replace("@","")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-accent hover:underline">
                  <Twitter className="w-3.5 h-3.5" />{user.twitter}
                </a>
              )}
            </div>
            {user.bio && !editing && <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-2xl">{user.bio}</p>}

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="bg-accent/10 text-accent text-xs font-bold px-3 py-1 rounded-full">{level.icon} {level.name}</span>
              <span className="text-xs text-muted-foreground font-medium">{kp.toLocaleString()} KP</span>
              <span className="flex items-center gap-1 text-xs text-orange-500"><Flame className="w-3.5 h-3.5" />{user.current_streak || 0}j streak</span>
              <span className="text-xs text-muted-foreground">{earnedBadges.length}/{allBadges.length} badges</span>
            </div>

            {nextLevel && (
              <div className="mt-3 max-w-md">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{level.icon} {level.name}</span>
                  <span>{nextLevel.icon} {nextLevel.name} — {nextLevel.minKP - kp} KP restants</span>
                </div>
                <Progress value={levelProgress} className="h-2.5" />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick stats band */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Livres lus", value: byType.book, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Podcasts", value: byType.podcast, icon: Headphones, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Pages lues", value: totalPages.toLocaleString(), icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "KP gagnés", value: kp.toLocaleString(), icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-4 flex items-center gap-3 border border-border`}>
            <s.icon className={`w-7 h-7 ${s.color}`} />
            <div>
              <p className="text-xl font-black">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary p-1 rounded-xl">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all ${tab === t ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* TAB: Profil */}
      {tab === "Profil" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-heading font-semibold flex items-center gap-2"><User className="w-4 h-4 text-accent" /> Informations personnelles</h2>
          {editing ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nom complet</Label>
                <Input value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Ville</Label>
                <Input value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} placeholder="Paris, Lyon, Montréal..." />
              </div>
              <div className="space-y-1.5">
                <Label>Date de naissance</Label>
                <Input type="date" value={editForm.birthdate} onChange={e => setEditForm({ ...editForm, birthdate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Profession / Occupation</Label>
                <Input value={editForm.occupation} onChange={e => setEditForm({ ...editForm, occupation: e.target.value })} placeholder="Entrepreneur, Étudiant..." />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Bio</Label>
                <Textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Parlez-nous de vous, de vos passions, ce que vous apprenez en ce moment..." rows={4} />
              </div>
              <div className="space-y-1.5">
                <Label>Site web</Label>
                <Input value={editForm.website} onChange={e => setEditForm({ ...editForm, website: e.target.value })} placeholder="https://..." />
              </div>
              <div className="space-y-1.5">
                <Label>Twitter / X</Label>
                <Input value={editForm.twitter} onChange={e => setEditForm({ ...editForm, twitter: e.target.value })} placeholder="@username" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Email (non modifiable)</Label>
                <Input value={user.email} disabled className="opacity-60" />
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Nom", value: user.full_name, icon: User },
                { label: "Ville", value: user.city || "Non renseigné", icon: MapPin },
                { label: "Date de naissance", value: user.birthdate || "Non renseigné", icon: Calendar },
                { label: "Occupation", value: user.occupation || "Non renseigné", icon: User },
                { label: "Site web", value: user.website || "Non renseigné", icon: Globe },
                { label: "Twitter", value: user.twitter || "Non renseigné", icon: Twitter },
              ].map((f, i) => (
                <div key={i} className="p-3 rounded-xl bg-secondary/40">
                  <p className="text-xs text-muted-foreground mb-0.5">{f.label}</p>
                  <p className="font-medium text-sm">{f.value}</p>
                </div>
              ))}
              {user.bio && (
                <div className="sm:col-span-2 lg:col-span-3 p-4 rounded-xl bg-secondary/40">
                  <p className="text-xs text-muted-foreground mb-1">Bio</p>
                  <p className="text-sm leading-relaxed">{user.bio}</p>
                </div>
              )}
            </div>
          )}
          {saved && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <Check className="w-4 h-4" /> Profil sauvegardé !
            </div>
          )}
        </motion.div>
      )}

      {/* TAB: Statistiques */}
      {tab === "Statistiques" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-heading font-semibold mb-4">Contenus terminés</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Livres lus", value: byType.book, icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
                { label: "Podcasts", value: byType.podcast, icon: Headphones, color: "text-accent", bg: "bg-accent/10" },
                { label: "Vidéos", value: byType.video, icon: Play, color: "text-green-500", bg: "bg-green-500/10" },
                { label: "Articles", value: byType.article, icon: FileText, color: "text-orange-500", bg: "bg-orange-500/10" },
              ].map((s, i) => (
                <div key={i} className="text-center p-4 bg-secondary/40 rounded-xl">
                  <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <p className="text-3xl font-black">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl flex items-center gap-3">
                <Flame className="w-7 h-7 text-orange-500" />
                <div><p className="text-2xl font-black">{user.current_streak || 0}</p><p className="text-xs text-muted-foreground">Streak actuel</p></div>
              </div>
              <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl flex items-center gap-3">
                <Star className="w-7 h-7 text-yellow-500" />
                <div><p className="text-2xl font-black">{user.longest_streak || 0}</p><p className="text-xs text-muted-foreground">Meilleur streak</p></div>
              </div>
              <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl flex items-center gap-3">
                <FileText className="w-7 h-7 text-purple-500" />
                <div><p className="text-2xl font-black">{totalPages.toLocaleString()}</p><p className="text-xs text-muted-foreground">Pages lues</p></div>
              </div>
              <div className="p-4 bg-accent/5 border border-accent/10 rounded-xl flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-accent" />
                <div><p className="text-2xl font-black">{completed.length}</p><p className="text-xs text-muted-foreground">Contenus terminés</p></div>
              </div>
            </div>
          </div>

          {/* Level ladder */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold">Parcours de niveaux</h2>
              <span className="font-black text-accent">{kp.toLocaleString()} KP</span>
            </div>
            {nextLevel && (
              <div className="mb-5">
                <Progress value={levelProgress} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">{levelProgress}% vers {nextLevel.icon} {nextLevel.name} — encore {nextLevel.minKP - kp} KP</p>
              </div>
            )}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {LEVELS.map(l => (
                <div key={l.name} className={`text-center p-2.5 rounded-xl transition-all ${l.name === level.name ? "bg-accent/15 ring-2 ring-accent shadow-md" : kp >= l.minKP ? "bg-green-500/10 ring-1 ring-green-500/20" : "bg-secondary/50 opacity-50"}`}>
                  <p className="text-xl">{l.icon}</p>
                  <p className="text-xs font-medium truncate mt-0.5">{l.name}</p>
                  <p className="text-xs text-muted-foreground">{l.minKP} KP</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB: Badges */}
      {tab === "Badges" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" /> Badges
              </h2>
              <span className="text-sm text-muted-foreground font-medium">{earnedBadges.length}/{allBadges.length} obtenus</span>
            </div>

            {/* Category filter */}
            <div className="flex gap-1.5 flex-wrap mb-5">
              {BADGE_CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setBadgeCat(cat.id)}
                  className={`px-3 py-1 text-xs rounded-full border font-medium transition-colors ${badgeCat === cat.id ? "bg-accent text-white border-accent" : "border-border hover:border-accent/40"}`}>
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredBadges.map(badge => {
                const isPublished = publishedBadge === badge.id;
                return (
                  <div key={badge.id} className={`p-4 rounded-xl text-center transition-all relative group ${badge.earned ? "bg-yellow-500/10 ring-2 ring-yellow-500/30 shadow-sm" : "bg-secondary/40 opacity-40 grayscale"}`}>
                    <p className="text-3xl mb-1.5">{badge.icon}</p>
                    <p className="text-xs font-bold leading-tight">{badge.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{badge.desc}</p>
                    {badge.earned && (
                      <div className="mt-2">
                        {isPublished ? (
                          <span className="text-xs text-green-600 font-medium">✓ Publié !</span>
                        ) : (
                          <button
                            onClick={() => {
                              setPublishingBadge(badge.id);
                              publishBadgeMutation.mutate(badge);
                            }}
                            disabled={publishBadgeMutation.isPending && publishingBadge === badge.id}
                            className="text-xs text-accent hover:underline flex items-center gap-1 mx-auto"
                          >
                            {publishBadgeMutation.isPending && publishingBadge === badge.id
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : <Megaphone className="w-3 h-3" />
                            }
                            Partager
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB: Activité */}
      {tab === "Activité" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" /> Activité récente
          </h2>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aucune activité enregistrée.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((a, i) => (
                <div key={a.id || i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40">
                  <span className="text-xl shrink-0">
                    {a.action === "completed" ? "✅" : a.action === "started" ? "🚀" : a.action === "progress" ? "📈" : a.action === "badge_earned" ? "🏅" : "⚡"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{a.details || a.content_title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(a.created_date).toLocaleDateString("fr", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                      {a.kp_earned > 0 && <span className="ml-2 text-accent font-semibold">+{a.kp_earned} KP</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Security link */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Paramètres & Sécurité</h3>
              <p className="text-xs text-muted-foreground">Mot de passe, notifications, confidentialité</p>
            </div>
          </div>
          <Link to={createPageUrl("Settings")}>
            <Button variant="outline" size="sm"><ChevronRight className="w-4 h-4" /></Button>
          </Link>
        </div>
      </div>
    </div>
  );
}