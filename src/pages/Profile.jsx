import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Loader2, BookOpen, Headphones, Play, FileText, Trophy, Flame, Star,
  Edit2, Save, LogOut, MapPin, Calendar, User, Shield, ChevronRight, Check, X, Camera, Settings
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { LEVELS, BADGES, getUserLevel, getNextLevel, getLevelProgress } from "@/components/shared/KPUtils";

const TABS = ["Profil", "Statistiques", "Badges"];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("Profil");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editForm, setEditForm] = useState({});

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

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe(editForm);
    setUser({ ...user, ...editForm });
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };



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
  const earnedBadges = BADGES.filter(b => b.condition(user));

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Cover + Avatar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-primary via-accent to-fuchsia-500 relative">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=40)", backgroundSize: "cover" }} />
          </div>
          <div className="px-6 pb-6">
            <div className="-mt-12 mb-3 flex items-end justify-between">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-card border-4 border-card shadow-lg flex items-center justify-center text-3xl">
                  {level.icon}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{earnedBadges.length}</span>
                </div>
              </div>
              <div className="flex gap-2 mb-1">
                {editing ? (
                  <>
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1.5" /> Sauvegarder</>}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)}><X className="w-4 h-4" /></Button>
                  </>
                ) : (
                  <>
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
            </div>
            {user.bio && !editing && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{user.bio}</p>}

            {/* Inline Level badge */}
            <div className="mt-3 flex items-center gap-3">
              <span className="bg-accent/10 text-accent text-xs font-bold px-3 py-1 rounded-full">{level.icon} {level.name}</span>
              <span className="text-xs text-muted-foreground">{kp.toLocaleString()} KP</span>
              <span className="flex items-center gap-1 text-xs text-orange-500"><Flame className="w-3.5 h-3.5" />{user.current_streak || 0}j streak</span>
            </div>

            {/* Level progress */}
            {nextLevel && (
              <div className="mt-3">
                <Progress value={levelProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{levelProgress}% vers {nextLevel.icon} {nextLevel.name} ({nextLevel.minKP - kp} KP restants)</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

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
                <Textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Parlez-nous de vous, de vos passions..." rows={3} />
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
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "Nom", value: user.full_name, icon: User },
                { label: "Ville", value: user.city || "Non renseigné", icon: MapPin },
                { label: "Date de naissance", value: user.birthdate || "Non renseigné", icon: Calendar },
                { label: "Occupation", value: user.occupation || "Non renseigné", icon: User },
                { label: "Site web", value: user.website || "Non renseigné", icon: ChevronRight },
                { label: "Twitter", value: user.twitter || "Non renseigné", icon: ChevronRight },
              ].map((f, i) => (
                <div key={i} className="p-3 rounded-xl bg-secondary/40">
                  <p className="text-xs text-muted-foreground mb-0.5">{f.label}</p>
                  <p className="font-medium text-sm">{f.value}</p>
                </div>
              ))}
              {user.bio && (
                <div className="sm:col-span-2 p-3 rounded-xl bg-secondary/40">
                  <p className="text-xs text-muted-foreground mb-0.5">Bio</p>
                  <p className="text-sm">{user.bio}</p>
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
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl flex items-center gap-3">
                <Flame className="w-7 h-7 text-orange-500" />
                <div>
                  <p className="text-2xl font-black">{user.current_streak || 0}</p>
                  <p className="text-xs text-muted-foreground">Streak actuel</p>
                </div>
              </div>
              <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl flex items-center gap-3">
                <Star className="w-7 h-7 text-yellow-500" />
                <div>
                  <p className="text-2xl font-black">{user.longest_streak || 0}</p>
                  <p className="text-xs text-muted-foreground">Meilleur streak</p>
                </div>
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
              <div className="mb-4">
                <Progress value={levelProgress} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">{levelProgress}% vers {nextLevel.icon} {nextLevel.name}</p>
              </div>
            )}
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              {LEVELS.map(l => (
                <div key={l.name} className={`text-center p-2.5 rounded-xl transition-all ${l.name === level.name ? "bg-accent/15 ring-2 ring-accent shadow-md" : kp >= l.minKP ? "bg-green-500/10 ring-1 ring-green-500/20" : "bg-secondary/50 opacity-50"}`}>
                  <p className="text-xl">{l.icon}</p>
                  <p className="text-xs font-medium truncate mt-0.5">{l.name}</p>
                  <p className="text-xs text-muted-foreground">{l.minKP}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB: Badges */}
      {tab === "Badges" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Badges</h2>
            <span className="text-sm text-muted-foreground">{earnedBadges.length}/{BADGES.length} obtenus</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BADGES.map(badge => {
              const earned = badge.condition(user);
              return (
                <div key={badge.id} className={`p-4 rounded-xl text-center transition-all ${earned ? "bg-yellow-500/10 ring-2 ring-yellow-500/30 shadow-sm" : "bg-secondary/40 opacity-50 grayscale"}`}>
                  <p className="text-3xl mb-1.5">{badge.icon}</p>
                  <p className="text-xs font-bold">{badge.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{badge.description}</p>
                  {earned && <p className="text-xs text-yellow-500 font-medium mt-1">✓ Obtenu</p>}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Quick link to Security Settings */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Settings className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Gérer la sécurité</h3>
              <p className="text-xs text-muted-foreground">Changer votre mot de passe, paramètres de sécurité</p>
            </div>
          </div>
          <Link to={createPageUrl("Settings")}>
            <Button variant="outline" size="sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}