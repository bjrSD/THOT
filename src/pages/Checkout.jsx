import React, { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Lock, Check, ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const PLANS = [
  { id: "monthly", name: "Mensuel", price: "4,99 €", period: "/ mois", badge: null },
  { id: "annual", name: "Annuel", price: "2,99 €", period: "/ mois", badge: "Populaire", saving: "35,88 € / an — économisez 40%" },
  { id: "lifetime", name: "À vie", price: "79 €", period: "paiement unique", badge: "Meilleure valeur" },
];

function formatCardNumber(value) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

export default function Checkout() {
  const urlParams = new URLSearchParams(window.location.search);
  const defaultPlan = urlParams.get("plan") || "annual";

  const [selectedPlan, setSelectedPlan] = useState(defaultPlan);
  const [form, setForm] = useState({ name: "", card: "", expiry: "", cvc: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const plan = PLANS.find(p => p.id === selectedPlan) || PLANS[1];

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSuccess(true); }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-3xl border border-border p-10 text-center max-w-md w-full shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
          <h2 className="font-heading text-2xl font-bold mb-2">Bienvenue dans THOT Premium ! 🎉</h2>
          <p className="text-muted-foreground mb-6">Votre accès Premium est activé. Profitez de toutes les fonctionnalités sans limite.</p>
          <Link to={createPageUrl("Dashboard")}>
            <Button className="w-full bg-accent hover:bg-accent/90">Accéder au Dashboard</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <Link to={createPageUrl("Premium")} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour aux offres
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left — Plan selection */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-5 h-5 text-yellow-500" />
                <h1 className="font-heading text-2xl font-bold">Passer à Premium</h1>
              </div>
              <p className="text-muted-foreground text-sm">Choisissez votre formule et accédez à toutes les fonctionnalités.</p>
            </div>

            <div className="space-y-3">
              {PLANS.map(p => (
                <button key={p.id} onClick={() => setSelectedPlan(p.id)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${selectedPlan === p.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/40 bg-card"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{p.name}</span>
                        {p.badge && <span className="text-xs bg-accent text-white px-2 py-0.5 rounded-full">{p.badge}</span>}
                      </div>
                      {p.saving && <p className="text-xs text-accent mt-0.5">{p.saving}</p>}
                    </div>
                    <div className="text-right">
                      <span className="font-black text-lg">{p.price}</span>
                      <span className="text-muted-foreground text-xs ml-1">{p.period}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* What's included */}
            <div className="bg-secondary/50 rounded-2xl p-4">
              <p className="font-semibold text-sm mb-3">Inclus dans Premium :</p>
              <ul className="space-y-2">
                {["Bibliothèque illimitée", "Dashboard avancé & heatmaps", "Intégrations Kindle, Spotify, Netflix…", "Recommandations IA personnalisées", "Clubs & espaces privés", "Badge Premium exclusif 👑"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-accent shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right — Payment form */}
          <div>
            <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-5">
                <Lock className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">Paiement sécurisé SSL</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" placeholder="votre@email.com" value={form.email} required
                    onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Nom sur la carte</Label>
                  <Input placeholder="Jean Dupont" value={form.name} required
                    onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Numéro de carte</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="1234 5678 9012 3456" value={form.card} required
                      className="pl-9" maxLength={19}
                      onChange={e => setForm({ ...form, card: formatCardNumber(e.target.value) })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Date d'expiration</Label>
                    <Input placeholder="MM/AA" value={form.expiry} required maxLength={5}
                      onChange={e => setForm({ ...form, expiry: formatExpiry(e.target.value) })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>CVC</Label>
                    <Input placeholder="123" value={form.cvc} required maxLength={3}
                      onChange={e => setForm({ ...form, cvc: e.target.value.replace(/\D/g, "").slice(0, 3) })} />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-12 text-base bg-accent hover:bg-accent/90 mt-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Crown className="w-5 h-5 mr-2" />}
                  {loading ? "Traitement en cours…" : `Payer ${plan.price}`}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-4">
                🔒 Paiement sécurisé · Annulation à tout moment · Satisfait ou remboursé sous 30 jours
              </p>

              {/* Card logos */}
              <div className="flex items-center justify-center gap-3 mt-4">
                {["💳 Visa", "💳 Mastercard", "💳 Amex"].map(c => (
                  <span key={c} className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}