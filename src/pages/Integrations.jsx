import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Check, ExternalLink, Crown, RefreshCw, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const INTEGRATIONS = [
  {
    category: "📚 Lecture",
    apps: [
      { name: "Kindle", desc: "Synchronisez automatiquement vos livres et pages lues depuis votre liseuse Amazon.", color: "#FF9900", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", premium: true, status: "available" },
      { name: "Bookmate", desc: "Importez vos bibliothèques et progressions.", color: "#FF5252", logo: "https://upload.wikimedia.org/wikipedia/commons/8/82/Bookmate_logo.png", premium: true, status: "coming" },
      { name: "Readwise", desc: "Synchronisez vos highlights et notes de lecture.", color: "#6C5CE7", logo: "https://readwise.io/favicon.ico", premium: true, status: "coming" },
    ]
  },
  {
    category: "🎵 Audio & Podcast",
    apps: [
      { name: "Spotify", desc: "Suivez automatiquement les podcasts écoutés et leur durée.", color: "#1DB954", logo: "https://upload.wikimedia.org/wikipedia/commons/7/74/Spotify_App_Logo.svg", premium: true, status: "available" },
      { name: "Apple Podcasts", desc: "Importez vos abonnements et historique d'écoute.", color: "#A855F7", logo: "https://upload.wikimedia.org/wikipedia/commons/3/35/Apple_Podcasts_Icon.svg", premium: true, status: "available" },
      { name: "Pocket Casts", desc: "Synchronisez vos podcasts favoris et progrès.", color: "#F43F5E", logo: "https://www.pocketcasts.com/favicon.ico", premium: true, status: "coming" },
    ]
  },
  {
    category: "📺 Vidéo",
    apps: [
      { name: "YouTube", desc: "Enregistrez automatiquement les vidéos éducatives que vous regardez.", color: "#FF0000", logo: "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg", premium: true, status: "available" },
      { name: "Netflix", desc: "Suivez les documentaires et contenus éducatifs visionnés.", color: "#E50914", logo: "https://upload.wikimedia.org/wikipedia/commons/6/69/Netflix_logo.svg", premium: true, status: "coming" },
      { name: "MasterClass", desc: "Synchronisez vos cours et progressions.", color: "#2D2D2D", logo: "https://www.masterclass.com/favicon.ico", premium: true, status: "coming" },
    ]
  },
  {
    category: "📰 Presse & Articles",
    apps: [
      { name: "Les Échos", desc: "Articles lus et temps de lecture synchronisés automatiquement.", color: "#005BAA", logo: "https://upload.wikimedia.org/wikipedia/fr/6/65/Les_%C3%89chos_logo.svg", premium: true, status: "available" },
      { name: "Le Monde", desc: "Suivez vos lectures quotidiennes et créez des notes.", color: "#1A1A1A", logo: "https://upload.wikimedia.org/wikipedia/fr/0/08/Logo_Le_Monde.svg", premium: true, status: "available" },
      { name: "Pocket", desc: "Importez et synchronisez vos articles sauvegardés.", color: "#EF4056", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Pocket_%28application%29_logo.svg", premium: true, status: "available" },
      { name: "Instapaper", desc: "Synchronisez votre liste de lecture et annotations.", color: "#333333", logo: "https://www.instapaper.com/favicon.ico", premium: true, status: "coming" },
    ]
  },
  {
    category: "🔗 Productivité",
    apps: [
      { name: "Notion", desc: "Exportez vos notes et résumés directement dans Notion.", color: "#000000", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg", premium: true, status: "coming" },
      { name: "Obsidian", desc: "Créez des notes liées à vos contenus dans Obsidian.", color: "#7C3AED", logo: "https://obsidian.md/favicon.ico", premium: true, status: "coming" },
    ]
  },
];

export default function Integrations() {
  const [connected, setConnected] = useState(new Set());

  const toggle = (name) => {
    setConnected(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="space-y-8 relative">
      {/* Filigrane */}
      <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center overflow-hidden">
        <p className="text-8xl font-black text-orange-500/10 rotate-[-35deg] select-none whitespace-nowrap">EN DÉVELOPPEMENT</p>
      </div>

      {/* Bannière top */}
      <div className="flex items-center gap-3 bg-orange-500/10 border-2 border-orange-500/40 rounded-2xl p-4 sticky top-0 z-30 backdrop-blur-sm">
        <span className="text-2xl">🚧</span>
        <div className="flex-1">
          <p className="font-bold text-orange-600 text-sm">Page en cours de développement</p>
          <p className="text-xs text-orange-500/80">Les intégrations ne sont pas encore disponibles. Revenez bientôt !</p>
        </div>
        <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full animate-pulse">BIENTÔT</span>
      </div>
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 border border-border">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <Zap className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold">Intégrations</h1>
            <p className="text-muted-foreground mt-1 max-w-xl">
              Connectez vos applications préférées pour un suivi automatique de votre apprentissage. Obtenez encore plus de statistiques en jumelant vos apps avec THOT.
            </p>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-card rounded-full px-4 py-2 border border-border text-sm">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            {connected.size} connectée{connected.size > 1 ? "s" : ""}
          </div>
          <div className="flex items-center gap-2 bg-card rounded-full px-4 py-2 border border-border text-sm">
            <RefreshCw className="w-3.5 h-3.5 text-accent" />
            Sync automatique
          </div>
          <div className="flex items-center gap-2 bg-card rounded-full px-4 py-2 border border-border text-sm">
            <Wifi className="w-3.5 h-3.5 text-accent" />
            Temps réel
          </div>
        </div>
      </div>

      {/* Categories */}
      {INTEGRATIONS.map((cat, ci) => (
        <motion.div key={ci} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: ci * 0.05 }}>
          <h2 className="font-heading font-semibold text-lg mb-4">{cat.category}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cat.apps.map((app, ai) => {
              const isConnected = connected.has(app.name);
              const isComingSoon = app.status === "coming";
              return (
                <motion.div key={ai} whileHover={{ scale: 1.01 }}>
                  <div className={`bg-card rounded-xl border p-5 transition-all ${isConnected ? "border-green-500/40 bg-green-500/5" : "border-border hover:border-accent/30 hover:shadow-md"}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                        style={{ backgroundColor: app.color + "20" }}>
                        <img src={app.logo} alt={app.name} className="w-full h-full object-contain p-1.5" onError={(e) => { e.target.style.display = 'none'; }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{app.name}</h3>
                          {app.premium && (
                            <Crown className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                          )}
                          {isComingSoon && (
                            <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground shrink-0">Bientôt</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{app.desc}</p>
                      </div>
                    </div>
                    {isConnected && (
                      <div className="flex items-center gap-1.5 text-xs text-green-600 mb-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Connecté · Sync active
                      </div>
                    )}
                    {app.premium ? (
                      <Link to={createPageUrl("Premium")}>
                        <Button variant="outline" size="sm" className="w-full border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/10">
                          <Crown className="w-3.5 h-3.5 mr-1.5" /> Premium requis
                        </Button>
                      </Link>
                    ) : isComingSoon ? (
                      <Button variant="outline" size="sm" className="w-full" disabled>
                        Disponible bientôt
                      </Button>
                    ) : (
                      <Button
                        variant={isConnected ? "outline" : "default"}
                        size="sm"
                        className={`w-full ${isConnected ? "border-green-500/40 text-green-600 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30" : ""}`}
                        onClick={() => toggle(app.name)}
                      >
                        {isConnected ? (
                          <><Check className="w-3.5 h-3.5 mr-1.5" /> Connecté</>
                        ) : (
                          "Connecter"
                        )}
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}

      {/* Promo Premium */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-accent/20 p-6 flex flex-col md:flex-row items-center gap-4">
        <Crown className="w-10 h-10 text-yellow-500 shrink-0" />
        <div className="flex-1 text-center md:text-left">
          <h3 className="font-heading font-bold">Débloquez toutes les intégrations avec Premium</h3>
          <p className="text-sm text-muted-foreground mt-1">Connectez Netflix, MasterClass, Notion, Obsidian et bien plus encore.</p>
        </div>
        <Link to={createPageUrl("Premium")}>
          <Button className="shrink-0">
            <Zap className="w-4 h-4 mr-2" /> Passer Premium
          </Button>
        </Link>
      </div>
    </div>
  );
}