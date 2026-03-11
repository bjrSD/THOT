import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Crown, Star, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const FREE_FEATURES = [
  "Bibliothèque jusqu'à 50 contenus",
  "Tableau de bord basique",
  "Suivi progression (pages / minutes)",
  "3 challenges actifs",
  "Streak & Knowledge Points",
  "Accès à la communauté",
];

const PREMIUM_FEATURES = [
  "Bibliothèque illimitée",
  "Dashboard avancé (heatmaps, radars)",
  "Intégrations Kindle, Spotify, Netflix…",
  "Challenges illimités + exclusifs",
  "Statistiques détaillées & exports",
  "Mode sombre automatique",
  "Groupes & espaces privés (famille, amis)",
  "Recommandations IA personnalisées",
  "Read with Friends & Book Clubs",
  "Support prioritaire",
  "Badge Premium exclusif 👑",
];

const PLANS = [
  {
    id: "monthly",
    name: "Mensuel",
    price: "4,99 €",
    period: "/ mois",
    badge: null,
    saving: null,
  },
  {
    id: "annual",
    name: "Annuel",
    price: "2,99 €",
    period: "/ mois",
    badge: "Populaire",
    saving: "Économisez 40%",
    total: "soit 35,88 € / an",
  },
  {
    id: "lifetime",
    name: "À vie",
    price: "79 €",
    period: "paiement unique",
    badge: "Meilleure valeur",
    saving: null,
  },
];

export default function Premium() {
  const [selected, setSelected] = useState("annual");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent text-white py-20 px-4">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute w-2 h-2 rounded-full bg-white"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, opacity: Math.random() }} />
          ))}
        </div>
        <div className="max-w-3xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Crown className="w-4 h-4 text-yellow-300" />
              THOT Premium
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Apprenez sans limites
            </h1>
            <p className="text-lg text-white/80 max-w-xl mx-auto">
              Débloquez toutes les fonctionnalités pour transformer votre apprentissage en superpower.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-16">

        {/* Free vs Premium comparison */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="bg-card rounded-2xl border border-border p-6 h-full">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-heading text-xl font-bold">Gratuit</h2>
                <span className="ml-auto text-2xl font-bold">0 €</span>
              </div>
              <ul className="space-y-3">
                {FREE_FEATURES.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
                {PREMIUM_FEATURES.slice(3).map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground/50">
                    <X className="w-4 h-4 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to={createPageUrl("Dashboard")}>
                <Button variant="outline" className="w-full mt-8">Commencer gratuitement</Button>
              </Link>
            </div>
          </motion.div>

          {/* Premium */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border-2 border-accent/30 p-6 h-full relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">PREMIUM</span>
              </div>
              <div className="flex items-center gap-2 mb-6">
                <Crown className="w-5 h-5 text-yellow-500" />
                <h2 className="font-heading text-xl font-bold">Premium</h2>
              </div>
              <ul className="space-y-3">
                {PREMIUM_FEATURES.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-accent shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Pricing cards */}
        <div>
          <h2 className="font-heading text-2xl font-bold text-center mb-8">Choisissez votre formule</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <motion.div key={plan.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <div
                  onClick={() => setSelected(plan.id)}
                  className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all ${
                    selected === plan.id
                      ? "border-accent bg-accent/5 shadow-lg shadow-accent/10"
                      : "border-border bg-card hover:border-accent/40"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  <h3 className="font-heading font-bold text-lg mb-3">{plan.name}</h3>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm pb-1">{plan.period}</span>
                  </div>
                  {plan.saving && <p className="text-xs text-accent font-medium">{plan.saving}</p>}
                  {plan.total && <p className="text-xs text-muted-foreground">{plan.total}</p>}
                  <div className={`mt-4 w-5 h-5 rounded-full border-2 mx-auto flex items-center justify-center ${
                    selected === plan.id ? "border-accent bg-accent" : "border-border"
                  }`}>
                    {selected === plan.id && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button size="lg" className="h-12 px-10 text-base bg-accent hover:bg-accent/90">
              <Crown className="w-5 h-5 mr-2" />
              Passer à Premium
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              Paiement sécurisé · Annulation à tout moment · Satisfait ou remboursé sous 30 jours
            </p>
          </div>
        </div>

        {/* FAQ quick */}
        <div className="bg-card rounded-2xl border border-border p-8">
          <h2 className="font-heading text-xl font-bold mb-6">Questions fréquentes</h2>
          <div className="space-y-4">
            {[
              ["Puis-je annuler à tout moment ?", "Oui, vous pouvez annuler votre abonnement à tout moment depuis vos paramètres. Vous conservez l'accès Premium jusqu'à la fin de la période payée."],
              ["Mes données sont-elles sécurisées ?", "Oui, toutes vos données sont chiffrées et hébergées en Europe conformément au RGPD."],
              ["Existe-t-il une version gratuite pour toujours ?", "Absolument ! La version gratuite reste disponible indéfiniment avec les fonctionnalités de base."],
              ["Comment fonctionne la garantie 30 jours ?", "Si vous n'êtes pas satisfait dans les 30 premiers jours, nous vous remboursons intégralement, sans question."],
            ].map(([q, a], i) => (
              <div key={i} className="border-b border-border pb-4 last:border-0 last:pb-0">
                <p className="font-medium mb-1">{q}</p>
                <p className="text-sm text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}