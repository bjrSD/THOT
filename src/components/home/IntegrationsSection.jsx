import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Wifi, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const INTEGRATIONS = [
  { name: "Kindle", color: "#FF9900", emoji: "📱" },
  { name: "Spotify", color: "#1DB954", emoji: "🎵" },
  { name: "YouTube", color: "#FF0000", emoji: "▶️" },
  { name: "Netflix", color: "#E50914", emoji: "🎬" },
  { name: "Les Échos", color: "#005BAA", emoji: "📰" },
  { name: "Le Monde", color: "#1A1A1A", emoji: "🗞️" },
  { name: "Pocket", color: "#EF4056", emoji: "📌" },
  { name: "Apple Podcasts", color: "#A855F7", emoji: "🎙️" },
];

export default function IntegrationsSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Wifi className="w-4 h-4" /> Suivi automatique
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Connectez vos applications</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Jumelez vos apps préférées avec THOT pour un suivi automatique et en temps réel.
          </p>
        </motion.div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4 max-w-3xl mx-auto mb-8">
          {INTEGRATIONS.map((app, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.1, y: -4 }}
              className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md border border-border bg-card"
                style={{ backgroundColor: app.color + "15" }}>
                {app.emoji}
              </div>
              <span className="text-xs text-muted-foreground text-center">{app.name}</span>
            </motion.div>
          ))}
        </div>
        <div className="text-center">
          <Link to={createPageUrl("Integrations")}>
            <Button variant="outline" className="gap-2">
              Voir toutes les intégrations <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}