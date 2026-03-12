import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Swords, Crown, Brain, Flame, Users, MessageCircle, ArrowRight, Zap } from "lucide-react";

const SOCIAL_FEATURES = [
  { icon: Swords, label: "Duels de savoir", desc: "Défie tes amis sur 7 jours", color: "text-red-500", bg: "bg-red-500/10", page: "Duels" },
  { icon: Crown, label: "Classement mondial", desc: "Top penseurs de la semaine", color: "text-yellow-500", bg: "bg-yellow-500/10", page: "Leaderboard" },
  { icon: Brain, label: "Carte du cerveau", desc: "Visualise ton savoir", color: "text-purple-500", bg: "bg-purple-500/10", page: "BrainMap" },
  { icon: Flame, label: "Heatmap annuelle", desc: "Chaque jour compte", color: "text-orange-500", bg: "bg-orange-500/10", page: "Heatmap" },
  { icon: Users, label: "Clubs de savoir", desc: "Apprends en communauté", color: "text-blue-500", bg: "bg-blue-500/10", page: "Clubs" },
  { icon: MessageCircle, label: "Feed social", desc: "Activités de tes amis", color: "text-green-500", bg: "bg-green-500/10", page: "Feed" },
];

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

export default function SocialFeaturesSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Zap className="w-4 h-4" /> Nouvelles fonctionnalités v2.0
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Apprenez, compétez, progressez</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">THOT est devenu une vraie plateforme sociale de la connaissance.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SOCIAL_FEATURES.map((feat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Link to={createPageUrl(feat.page)}>
                <div className="group bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full hover:border-accent/30">
                  <div className={`w-14 h-14 rounded-2xl ${feat.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feat.icon className={`w-7 h-7 ${feat.color}`} />
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-1">{feat.label}</h3>
                  <p className="text-sm text-muted-foreground">{feat.desc}</p>
                  <div className={`mt-4 flex items-center gap-1 text-sm font-medium ${feat.color}`}>
                    Découvrir <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}