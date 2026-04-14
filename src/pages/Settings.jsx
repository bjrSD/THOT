import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Sun, Moon, Monitor, Bell, Shield, Trash2, User, Crown, ChevronRight, Loader2, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const THEMES = [
  { value: "light", label: "Clair", icon: Sun },
  { value: "dark", label: "Sombre", icon: Moon },
  { value: "auto", label: "Automatique", icon: Monitor },
];

export default function Settings() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("thot-theme") || "auto");
  const [notifications, setNotifications] = useState({
    streak: true,
    badges: true,
    challenges: true,
    newsletter: false,
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // auto
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) root.classList.add("dark");
      else root.classList.remove("dark");
    }
    localStorage.setItem("thot-theme", theme);
  }, [theme]);

  const handleSaveProfile = async () => {
    setSaving(true);
    // full_name is read-only from auth provider — save as display_name
    await base44.auth.updateMe({ display_name: user.full_name });
    const updated = await base44.auth.me();
    setUser({ ...updated, full_name: user.full_name });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePasswordChange = async () => {
    if (pwForm.next !== pwForm.confirm) { setPwMsg({ type: "error", text: "Les mots de passe ne correspondent pas." }); return; }
    if (pwForm.next.length < 8) { setPwMsg({ type: "error", text: "Le mot de passe doit contenir au moins 8 caractères." }); return; }
    setPwMsg({ type: "success", text: "Pour changer votre mot de passe, veuillez vous déconnecter puis utiliser 'Mot de passe oublié' lors de la reconnexion." });
  };

  if (!user) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground mt-1">Gérez votre compte et vos préférences</p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-accent" />
            <h2 className="font-heading font-semibold">Profil</h2>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nom complet</Label>
              <Input value={user.full_name || ""} onChange={e => setUser({ ...user, full_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={user.email || ""} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié</p>
            </div>
          </div>
          <Button onClick={handleSaveProfile} disabled={saving} size="sm">
            {saved ? <><Check className="w-4 h-4 mr-1.5" /> Sauvegardé</> : saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sauvegarder"}
          </Button>
        </div>
      </motion.div>

      {/* Theme */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sun className="w-5 h-5 text-accent" />
            <h2 className="font-heading font-semibold">Apparence</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map(t => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  theme === t.value ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"
                }`}
              >
                <t.icon className={`w-5 h-5 ${theme === t.value ? "text-accent" : "text-muted-foreground"}`} />
                <span className="text-sm font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-accent" />
            <h2 className="font-heading font-semibold">Notifications</h2>
          </div>
          <div className="space-y-4">
            {[
              { key: "streak", label: "Rappels de streak", desc: "Alertes quand votre streak est en danger" },
              { key: "badges", label: "Nouveaux badges", desc: "Notifications lors de l'obtention d'un badge" },
              { key: "challenges", label: "Mises à jour challenges", desc: "Progression et nouvelles dans vos défis" },
              { key: "newsletter", label: "Newsletter THOT", desc: "Conseils d'apprentissage et nouveautés (1x/semaine)" },
            ].map(n => (
              <div key={n.key} className="flex items-center justify-between py-1">
                <div>
                  <p className="font-medium text-sm">{n.label}</p>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                </div>
                <Switch
                  checked={notifications[n.key]}
                  onCheckedChange={v => setNotifications({ ...notifications, [n.key]: v })}
                />
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Security */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-accent" />
            <h2 className="font-heading font-semibold">Sécurité</h2>
          </div>
          <div className="space-y-3 max-w-sm">
            <div className="space-y-1.5">
              <Label>Mot de passe actuel</Label>
              <input type="password" value={pwForm.current} onChange={e => setPwForm({ ...pwForm, current: e.target.value })} placeholder="••••••••" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label>Nouveau mot de passe</Label>
              <input type="password" value={pwForm.next} onChange={e => setPwForm({ ...pwForm, next: e.target.value })} placeholder="••••••••" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label>Confirmer le nouveau mot de passe</Label>
              <input type="password" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} placeholder="••••••••" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
            {pwMsg && (
              <div className={`text-sm p-3 rounded-xl ${pwMsg.type === "error" ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-600"}`}>
                {pwMsg.text}
              </div>
            )}
            <Button onClick={handlePasswordChange} disabled={!pwForm.current || !pwForm.next} size="sm">
              Changer le mot de passe
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Account */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-accent" />
            <h2 className="font-heading font-semibold">Compte</h2>
          </div>
          <div className="space-y-2">
            {[
              { label: "Mon profil complet", page: "Profile" },
              { label: "Politique de confidentialité", page: "Privacy" },
              { label: "Conditions générales d'utilisation", page: "Terms" },
              { label: "Gérer mon abonnement", page: "Premium" },
              { label: "Intégrations connectées", page: "Integrations" },
            ].map((link, i) => (
              <Link key={i} to={createPageUrl(link.page)}>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors">
                  <span className="text-sm">{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Danger zone */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="bg-card rounded-2xl border border-destructive/20 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 className="w-5 h-5 text-destructive" />
            <h2 className="font-heading font-semibold text-destructive">Zone dangereuse</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">La suppression de votre compte est définitive et irréversible. Toutes vos données seront effacées.</p>
          <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/5">
            Supprimer mon compte
          </Button>
        </div>
      </motion.div>
    </div>
  );
}