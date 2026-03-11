import React from "react";
import { motion } from "framer-motion";
import { Brain, Target, Users, Globe, Mail, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const TEAM = [
  { name: "Alexandre M.", role: "CEO & Co-fondateur", emoji: "🧠", bio: "Passionné d'apprentissage continu et de productivité. Ex-consultant strategy." },
  { name: "Camille R.", role: "CTO & Co-fondatrice", emoji: "💻", bio: "Ingénieure IA, ancienne de Google. Croit que la tech peut rendre tout le monde plus intelligent." },
  { name: "Julien B.", role: "Head of Product", emoji: "🎯", bio: "Designer product ex-Duolingo. Obsédé par l'UX qui crée des habitudes positives." },
];

const VALUES = [
  { icon: Brain, title: "L'apprentissage est un sport", desc: "Nous croyons que progresser intellectuellement mérite la même rigueur et la même passion que l'entraînement physique." },
  { icon: Target, title: "La progression visible motive", desc: "Ce qu'on mesure s'améliore. Rendre la progression tangible et visible est au cœur de THOT." },
  { icon: Users, title: "Ensemble, on va plus loin", desc: "L'apprentissage social, les défis entre amis, et la communauté amplifient l'envie d'apprendre." },
  { icon: Globe, title: "Le savoir pour tous", desc: "Nous construisons THOT pour que chacun, peu importe son background, puisse cultiver ses connaissances." },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              🏛️ À propos de THOT
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6">
              Le Strava du savoir
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              THOT est né d'une conviction simple : <strong>apprendre mérite d'être suivi, célébré et partagé</strong>, tout comme on suit ses performances sportives.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-20">

        {/* Story */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl font-bold mb-6">Notre histoire</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Tout a commencé avec une question simple : <em>"Pourquoi est-ce que j'enregistre chaque kilomètre couru, mais pas un seul livre lu ?"</em>
                </p>
                <p>
                  En 2024, l'équipe fondatrice de THOT a réalisé qu'il existait des dizaines d'applications pour tracker ses pas, ses calories et ses performances sportives, mais aucune pour mesurer ce qui compte le plus : <strong>la croissance intellectuelle</strong>.
                </p>
                <p>
                  THOT (du nom du dieu égyptien de la sagesse et des connaissances) est né de cette idée : créer le Strava du savoir. Un outil qui transforme l'apprentissage en pratique quotidienne, sociale et gamifiée.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "50K+", label: "Utilisateurs actifs" },
                { value: "2M+", label: "Contenus trackés" },
                { value: "4.8⭐", label: "Note moyenne" },
                { value: "180+", label: "Pays représentés" },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <div className="bg-card rounded-2xl border border-border p-6 text-center">
                    <p className="text-3xl font-bold text-accent">{s.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Values */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-heading text-3xl font-bold text-center mb-12">Nos valeurs</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {VALUES.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="bg-card rounded-2xl border border-border p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <v.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-2">{v.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Team */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-heading text-3xl font-bold text-center mb-12">L'équipe</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TEAM.map((member, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="bg-card rounded-2xl border border-border p-6 text-center hover:shadow-md transition-shadow">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-4xl mx-auto mb-4">
                    {member.emoji}
                  </div>
                  <h3 className="font-heading font-bold">{member.name}</h3>
                  <p className="text-sm text-accent font-medium mt-0.5">{member.role}</p>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Contact */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-border p-8 text-center">
            <h2 className="font-heading text-2xl font-bold mb-3">Vous voulez nous contacter ?</h2>
            <p className="text-muted-foreground mb-6">Presse, partenariats, ou juste dire bonjour — on est là.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="mailto:hello@thot.app">
                <Button variant="outline" className="gap-2">
                  <Mail className="w-4 h-4" /> hello@thot.app
                </Button>
              </a>
              <a href="https://twitter.com/thotapp" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2">
                  <Twitter className="w-4 h-4" /> @thotapp
                </Button>
              </a>
              <Link to={createPageUrl("Support")}>
                <Button variant="outline" className="gap-2">
                  <Users className="w-4 h-4" /> Support client
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}