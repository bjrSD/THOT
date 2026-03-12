import React from "react";
import { motion } from "framer-motion";
import { BookOpen, BarChart3, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const STEPS = [
  { icon: BookOpen, title: "1. Ajouter", desc: "Ajoutez livres, podcasts, articles ou vidéos à votre bibliothèque en quelques secondes.", color: "bg-primary/10 text-primary", num: "01" },
  { icon: BarChart3, title: "2. Suivre", desc: "Visualisez votre progression avec des graphiques, heatmaps et statistiques avancées.", color: "bg-accent/10 text-accent", num: "02" },
  { icon: Trophy, title: "3. Progresser", desc: "Gagnez des badges, maintenez votre streak et dépassez vos amis dans les classements.", color: "bg-green-500/10 text-green-500", num: "03" },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 md:py-28 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold">Comment ça marche</h2>
          <p className="mt-4 text-muted-foreground text-lg">Trois étapes simples pour transformer votre apprentissage</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.15 }}>
              <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                <CardContent className="p-8">
                  <div className="text-5xl font-black text-border mb-4">{step.num}</div>
                  <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-5`}>
                    <step.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}