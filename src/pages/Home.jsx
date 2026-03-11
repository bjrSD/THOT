import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { BookOpen, Headphones, Play, FileText, BarChart3, Trophy, Flame, Users, ArrowRight, Star, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const fadeIn = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

export default function Home() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-20 md:pt-32 md:pb-28">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Le Strava du savoir
            </div>
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight">
              Suivez vos connaissances comme vous suivriez{" "}
              <span className="text-accent">votre sport</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Suivez vos livres, podcasts et vidéos. Visualisez votre progression et relevez des défis avec la communauté.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-base h-12 px-8" onClick={() => window.location.href = createPageUrl("Dashboard")}>
                Commencer gratuitement
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Link to={createPageUrl("Dashboard")}>
                <Button variant="outline" size="lg" className="text-base h-12 px-8 w-full">
                  Voir le dashboard
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Floating cards mockup */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="mt-16 max-w-4xl mx-auto">
            <div className="relative bg-card rounded-2xl border border-border shadow-2xl p-6 md:p-8">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-primary/5 rounded-xl p-4 text-center">
                  <Flame className="w-8 h-8 text-orange-500 mx-auto" />
                  <p className="text-2xl font-bold mt-2">12</p>
                  <p className="text-xs text-muted-foreground">Jours de streak</p>
                </div>
                <div className="bg-accent/5 rounded-xl p-4 text-center">
                  <Star className="w-8 h-8 text-accent mx-auto" />
                  <p className="text-2xl font-bold mt-2">2,150</p>
                  <p className="text-xs text-muted-foreground">Knowledge Points</p>
                </div>
                <div className="bg-green-500/5 rounded-xl p-4 text-center">
                  <Target className="w-8 h-8 text-green-500 mx-auto" />
                  <p className="text-2xl font-bold mt-2">Penseur</p>
                  <p className="text-xs text-muted-foreground">Niveau actuel</p>
                </div>
              </div>
              <div className="flex gap-3">
                {["Atomic Habits", "Lex Fridman #405", "Sapiens"].map((title, i) => (
                  <div key={i} className="flex-1 bg-secondary rounded-lg p-3">
                    <div className="w-full h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-md mb-2" />
                    <p className="text-xs font-medium truncate">{title}</p>
                    <div className="mt-1 h-1.5 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${[75, 45, 30][i]}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">Comment ça marche</h2>
            <p className="mt-4 text-muted-foreground text-lg">Trois étapes simples pour transformer votre apprentissage</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: "Ajouter", desc: "Ajoutez livres, podcasts, articles ou vidéos à votre bibliothèque.", color: "bg-primary/10 text-primary" },
              { icon: BarChart3, title: "Suivre", desc: "Visualisez votre progression avec des graphiques et statistiques.", color: "bg-accent/10 text-accent" },
              { icon: Trophy, title: "Progresser", desc: "Gagnez des badges, maintenez votre streak et relevez des défis.", color: "bg-green-500/10 text-green-500" },
            ].map((step, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} transition={{ delay: i * 0.15 }}>
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow h-full">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-6`}>
                      <step.icon className="w-8 h-8" />
                    </div>
                    <div className="text-sm font-bold text-accent mb-2">Étape {i + 1}</div>
                    <h3 className="font-heading text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">Une communauté d'apprenants</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "12K+", label: "Livres suivis", icon: BookOpen },
              { value: "8K+", label: "Podcasts écoutés", icon: Headphones },
              { value: "5K+", label: "Vidéos regardées", icon: Play },
              { value: "45K+", label: "Heures d'apprentissage", icon: Users },
            ].map((stat, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} transition={{ delay: i * 0.1 }}>
                <div className="text-center p-6 rounded-2xl bg-card border border-border hover:border-accent/30 transition-colors">
                  <stat.icon className="w-6 h-6 text-accent mx-auto mb-3" />
                  <p className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">Ce qu'en disent nos utilisateurs</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Marie D.", text: "THOT a transformé ma façon de lire. Le système de streak me motive à lire chaque jour.", kp: "3,200 KP" },
              { name: "Karim B.", text: "Enfin une app qui rend l'apprentissage aussi addictif que les réseaux sociaux !", kp: "5,100 KP" },
              { name: "Sophie L.", text: "Le dashboard est magnifique. Je peux voir tout ce que j'ai appris en un coup d'œil.", kp: "2,800 KP" },
            ].map((t, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} transition={{ delay: i * 0.1 }}>
                <Card className="border-none shadow-lg h-full">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <p className="text-foreground leading-relaxed mb-4">"{t.text}"</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{t.name[0]}</span>
                        </div>
                        <span className="font-medium">{t.name}</span>
                      </div>
                      <span className="text-xs text-accent font-medium">{t.kp}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">
              Prêt à suivre votre <span className="text-accent">savoir</span> ?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">Rejoignez des milliers d'apprenants qui transforment leur quotidien.</p>
            <Button size="lg" className="text-base h-12 px-8" onClick={() => window.location.href = createPageUrl("Dashboard")}>
              Commencer gratuitement
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">T</span>
            </div>
            <span className="font-heading font-bold">THOT</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 THOT. Le Strava du savoir.</p>
        </div>
      </footer>
    </div>
  );
}