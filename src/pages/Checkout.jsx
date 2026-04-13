import React, { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Lock, Check, ArrowLeft, CreditCard, Loader2, Tag, X, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const PLANS = [
  { id: "monthly", name: "Mensuel", price: "4,99 €", priceNum: 4.99, period: "/ mois", badge: null },
  { id: "annual", name: "Annuel", price: "2,99 €", priceNum: 2.99, period: "/ mois", badge: "Populaire", saving: "35,88 € / an — économisez 40%" },
  { id: "lifetime", name: "À vie", price: "79 €", priceNum: 79, period: "paiement unique", badge: "Meilleure valeur" },
];

// Codes promo valides : code → { discount: 0-100 (%), label, type: 'referral'|'promo' }
const PROMO_CODES = {
  "THOT20": { discount: 20, label: "Code promo bienvenue", type: "promo" },
  "THOT50": { discount: 50, label: "Code partenaire", type: "promo" },
  "AMI10": { discount: 10, label: "Parrainage ami", type: "referral" },
  "INVITE30": { discount: 30, label: "Code de parrainage", type: "referral" },
  "LAUNCH": { discount: 100, label: "Accès offert 🎁", type: "promo" },
  "THOTPREMIUMFREE2026": { discount: 100, label: "Premium offert 🎁", type: "promo" },
};

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
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");

  const plan = PLANS.find(p => p.id === selectedPlan) || PLANS[1];
  const discount = appliedPromo ? appliedPromo.discount : 0;
  const finalPrice = discount === 100 ? 0 : parseFloat((plan.priceNum * (1 - discount / 100)).toFixed(2));
  const finalPriceStr = discount === 100 ? "Gratuit" : `${finalPrice.toFixed(2).replace(".", ",")} €`;

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setAppliedPromo({ code, ...PROMO_CODES[code] });
      setPromoError("");
    } else {
      setPromoError("Code invalide ou expiré.");
      setAppliedPromo(null);
    }
  };

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

                {/* Promo / Parrainage */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Code promo ou parrainage</Label>
                  {appliedPromo ? (
                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
                      <Gift className="w-4 h-4 text-green-500 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-600">{appliedPromo.code} — -{appliedPromo.discount}%</p>
                        <p className="text-xs text-green-600/70">{appliedPromo.label}</p>
                      </div>
                      <button onClick={() => { setAppliedPromo(null); setPromoInput(""); }} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input placeholder="Ex: AMI10, THOT20…" value={promoInput}
                        onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleApplyPromo())} />
                      <Button type="button" variant="outline" onClick={handleApplyPromo} className="shrink-0">Appliquer</Button>
                    </div>
                  )}
                  {promoError && <p className="text-xs text-destructive">{promoError}</p>}
                </div>

                {/* Price summary */}
                <div className="bg-secondary/50 rounded-xl px-4 py-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Formule {plan.name}</span>
                    <span>{plan.price} {plan.period}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Réduction ({appliedPromo.discount}%)</span>
                      <span>-{(plan.priceNum * appliedPromo.discount / 100).toFixed(2).replace(".", ",")} €</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t border-border pt-1 mt-1">
                    <span>Total</span>
                    <span className={discount === 100 ? "text-green-600" : ""}>{finalPriceStr}</span>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-12 text-base bg-accent hover:bg-accent/90 mt-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Crown className="w-5 h-5 mr-2" />}
                  {loading ? "Traitement en cours…" : `Payer ${finalPriceStr}`}
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