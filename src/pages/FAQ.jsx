import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const FAQS = [
  {
    category: "🚀 Démarrage",
    items: [
      { q: "Comment créer un compte THOT ?", a: "Cliquez sur 'S'inscrire' en haut à droite de la page d'accueil. Vous pouvez vous inscrire avec votre email. La création de compte est gratuite et ne prend que 30 secondes." },
      { q: "THOT est-il vraiment gratuit ?", a: "Oui ! La version gratuite vous donne accès à toutes les fonctionnalités essentielles : bibliothèque jusqu'à 50 contenus, streak, Knowledge Points, challenges et tableau de bord. La version Premium débloque les fonctionnalités avancées." },
      { q: "Sur quels appareils puis-je utiliser THOT ?", a: "THOT est disponible sur web (tous navigateurs), iOS et Android. Vos données sont synchronisées en temps réel sur tous vos appareils." },
    ]
  },
  {
    category: "📚 Fonctionnalités",
    items: [
      { q: "Quels types de contenus puis-je suivre ?", a: "Vous pouvez suivre des livres, podcasts, vidéos et articles. Pour chaque contenu, vous pouvez enregistrer votre progression (pages lues, minutes écoutées), ajouter des notes personnelles, et attribuer une note de 1 à 5 étoiles." },
      { q: "Comment fonctionnent les Knowledge Points (KP) ?", a: "Les KP sont gagnés en consommant du contenu : 100 KP pour un livre terminé, 30 KP pour un podcast, 15 KP pour une vidéo, 5-10 KP pour un article. Les KP vous font monter de niveau : Curieux, Lecteur, Penseur, Érudit, Polymathe, Sage et Architecte du savoir." },
      { q: "Comment fonctionne le système de streak ?", a: "Votre streak augmente chaque jour où vous enregistrez une activité d'apprentissage. Si vous passez un jour sans activité, votre streak repart à zéro. Les streaks sont visibles sur votre profil et vous gagnez des badges pour les jalons importants (7, 30, 100 jours)." },
      { q: "Puis-je importer mes livres depuis Goodreads ?", a: "L'import depuis Goodreads est disponible en version Premium. Vous pouvez exporter votre bibliothèque Goodreads en CSV et l'importer dans THOT en quelques clics." },
    ]
  },
  {
    category: "🔗 Intégrations",
    items: [
      { q: "Quelles applications puis-je connecter à THOT ?", a: "THOT s'intègre avec Kindle, Spotify, YouTube, Les Échos, Le Monde, Pocket et bien d'autres. Les intégrations Premium incluent Netflix, MasterClass, Notion et Obsidian. Consultez la page Intégrations pour la liste complète." },
      { q: "Comment fonctionne la synchronisation automatique ?", a: "Une fois une intégration activée, THOT importe automatiquement vos activités (livres lus, podcasts écoutés, vidéos regardées) depuis l'application connectée. La synchronisation se fait en temps réel ou toutes les heures selon l'intégration." },
    ]
  },
  {
    category: "💎 Premium",
    items: [
      { q: "Quelle est la différence entre gratuit et Premium ?", a: "La version gratuite couvre les besoins essentiels. Premium ajoute : bibliothèque illimitée, toutes les intégrations, statistiques avancées, groupes privés, recommandations IA, Read with Friends, Book Clubs et support prioritaire." },
      { q: "Puis-je annuler mon abonnement ?", a: "Oui, à tout moment depuis Paramètres > Abonnement. Vous conservez l'accès Premium jusqu'à la fin de la période payée. Aucun remboursement au prorata, mais aucune facturation supplémentaire." },
      { q: "Existe-t-il une garantie satisfait ou remboursé ?", a: "Absolument. Si vous n'êtes pas satisfait dans les 30 premiers jours suivant votre premier abonnement Premium, nous vous remboursons intégralement. Contactez support@thot.app." },
    ]
  },
  {
    category: "🔒 Confidentialité & Sécurité",
    items: [
      { q: "Mes données sont-elles sécurisées ?", a: "Oui. Toutes vos données sont chiffrées (AES-256 au repos, TLS 1.3 en transit) et hébergées sur des serveurs européens conformes au RGPD. Nous ne vendons jamais vos données à des tiers." },
      { q: "Comment supprimer mon compte ?", a: "Rendez-vous dans Paramètres > Compte > Supprimer mon compte. Toutes vos données sont supprimées définitivement sous 30 jours conformément au RGPD. Vous pouvez exporter vos données avant la suppression." },
      { q: "THOT est-il conforme au RGPD ?", a: "Oui, THOT est entièrement conforme au Règlement Général sur la Protection des Données (RGPD). Vous pouvez exercer vos droits (accès, rectification, suppression, portabilité) en contactant privacy@thot.app." },
    ]
  },
];

export default function FAQ() {
  const [search, setSearch] = useState("");
  const [openItems, setOpenItems] = useState(new Set());

  const toggle = (key) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filtered = FAQS.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      !search || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Foire aux questions</h1>
            <p className="text-muted-foreground text-lg mb-8">Trouvez rapidement la réponse à votre question.</p>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une question..."
                className="pl-12 h-12 text-base"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        {filtered.map((cat, ci) => (
          <motion.div key={ci} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.05 }}>
            <h2 className="font-heading font-bold text-xl mb-4">{cat.category}</h2>
            <div className="space-y-2">
              {cat.items.map((item, ii) => {
                const key = `${ci}-${ii}`;
                const isOpen = openItems.has(key);
                return (
                  <div key={ii} className={`bg-card rounded-xl border transition-all ${isOpen ? "border-accent/30 shadow-sm" : "border-border"}`}>
                    <button
                      onClick={() => toggle(key)}
                      className="w-full flex items-center justify-between p-5 text-left gap-4"
                    >
                      <span className="font-medium text-sm">{item.q}</span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}

        {/* CTA to support */}
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <MessageCircle className="w-10 h-10 text-accent mx-auto mb-3" />
          <h3 className="font-heading font-bold text-lg mb-2">Vous n'avez pas trouvé votre réponse ?</h3>
          <p className="text-muted-foreground text-sm mb-5">Notre équipe support est disponible 7j/7 pour vous aider.</p>
          <Link to={createPageUrl("Support")}>
            <Button>Contacter le support</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}