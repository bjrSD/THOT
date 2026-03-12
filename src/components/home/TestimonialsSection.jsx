import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const TESTIMONIALS = [
  { name: "Marie D.", role: "Consultante", text: "THOT a transformé ma façon de lire. Le système de streak me motive à lire chaque jour. Je suis passée de 5 à 18 livres par an !", kp: "3,200 KP", level: "Érudit 🎓" },
  { name: "Karim B.", role: "Entrepreneur", text: "Enfin une app qui rend l'apprentissage aussi addictif que les réseaux sociaux ! Les défis avec mes amis me poussent à aller plus loin.", kp: "5,100 KP", level: "Polymathe 🧠" },
  { name: "Sophie L.", role: "Médecin", text: "Le dashboard est magnifique. Je peux voir tout ce que j'ai appris en un coup d'œil. L'intégration Spotify pour les podcasts est parfaite.", kp: "2,800 KP", level: "Penseur 💭" },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold">Ce qu'en disent nos apprenants</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}>
              <Card className="border-none shadow-lg h-full hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-foreground leading-relaxed mb-5">"{t.text}"</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{t.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-accent font-medium">{t.kp}</p>
                      <p className="text-xs text-muted-foreground">{t.level}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}