import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { ArrowRight, Crown, Flame, Star, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

function AnimatedOrb() {
  return (
    <div className="relative w-10 h-10 shrink-0">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
        className="absolute inset-0 rounded-full border-2 border-dashed border-accent/40" />
      <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
        className="absolute inset-1.5 rounded-full border border-primary/30" />
      <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }} transition={{ repeat: Infinity, duration: 2.5 }}
        className="absolute inset-2 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
        <span className="text-white font-black text-xs leading-none">T</span>
      </motion.div>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        className="absolute inset-0" style={{ transformOrigin: "center" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-0.5 w-1.5 h-1.5 bg-accent rounded-full shadow-lg" />
      </motion.div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8" />
      <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="absolute top-20 right-10 w-96 h-96 bg-accent/15 rounded-full blur-3xl" />
      <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-20 left-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 w-full py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.7 }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6 border border-accent/20">
              <AnimatedOrb />
              <span>Le Strava du savoir — v2.0</span>
            </motion.div>

            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
              Devenez plus<br /><span className="text-accent">intelligent</span><br />chaque jour
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed mb-8">
              Suivez vos livres, podcasts et vidéos. Progressez, dépassez vos amis, gagnez des Knowledge Points.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="h-12 px-8 text-base group" onClick={() => window.location.href = createPageUrl("Dashboard")}>
                Commencer gratuitement
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Link to={createPageUrl("Premium")}>
                <Button variant="outline" size="lg" className="h-12 px-8 text-base gap-2 w-full">
                  <Crown className="w-4 h-4 text-yellow-500" /> Voir Premium
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-2">
                  {["🧠","📚","🎯","🔥"].map((e,i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-background flex items-center justify-center text-xs">{e}</div>
                  ))}
                </div>
                <span>+50K apprenants</span>
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                <span className="ml-1">4.8/5</span>
              </div>
            </div>
          </motion.div>

          {/* Hero mockup */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.8 }}>
            <div className="relative">
              <div className="bg-card rounded-2xl border border-border shadow-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="font-heading font-bold">Tableau de bord</p>
                    <p className="text-xs text-muted-foreground">Cette semaine</p>
                  </div>
                  <span className="text-xs bg-accent/10 text-accent px-2.5 py-1 rounded-full font-medium">🔥 12 jours</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-primary/5 rounded-xl p-3 text-center">
                    <Flame className="w-5 h-5 text-orange-500 mx-auto" />
                    <p className="text-lg font-bold mt-1">12</p>
                    <p className="text-xs text-muted-foreground">Streak</p>
                  </div>
                  <div className="bg-accent/5 rounded-xl p-3 text-center">
                    <Star className="w-5 h-5 text-accent mx-auto" />
                    <p className="text-lg font-bold mt-1">2,150</p>
                    <p className="text-xs text-muted-foreground">KP</p>
                  </div>
                  <div className="bg-green-500/5 rounded-xl p-3 text-center">
                    <Target className="w-5 h-5 text-green-500 mx-auto" />
                    <p className="text-lg font-bold mt-1">Érudit</p>
                    <p className="text-xs text-muted-foreground">Niveau</p>
                  </div>
                </div>
                <div className="flex items-end gap-1.5 h-14 mb-1">
                  {[40, 65, 30, 80, 55, 90, 70].map((h, i) => (
                    <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }}
                      transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
                      className="flex-1 bg-accent/80 rounded-t-sm" />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  {["L","M","M","J","V","S","D"].map((d,i) => <span key={i}>{d}</span>)}
                </div>
              </div>
              <motion.div animate={{ y: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 rounded-xl px-3 py-2 shadow-lg text-xs font-bold">
                🏆 Badge gagné !
              </motion.div>
              <motion.div animate={{ y: [4, -4, 4] }} transition={{ repeat: Infinity, duration: 3.5, delay: 0.5 }}
                className="absolute -bottom-4 -left-4 bg-orange-500 text-white rounded-xl px-3 py-2 shadow-lg text-xs font-bold">
                🔥 +25 KP !
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}