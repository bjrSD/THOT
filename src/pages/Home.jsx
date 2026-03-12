import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, useAnimationFrame } from "framer-motion";
import { BookOpen, Headphones, Play, FileText, BarChart3, Trophy, Flame, Users, ArrowRight, Star, Zap, Target, Crown, Wifi, MessageCircle, Swords, Brain, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

function AnimatedOrb() {
  return (
    <div className="relative w-16 h-16 shrink-0">
      {/* Outer rotating ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
        className="absolute inset-0 rounded-full border-2 border-dashed border-accent/40"
      />
      {/* Inner rotating ring opposite */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
        className="absolute inset-2 rounded-full border border-primary/30"
      />
      {/* Pulsing core */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
        className="absolute inset-3 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg"
      >
        <span className="text-white font-black text-lg leading-none">T</span>
      </motion.div>
      {/* Orbiting dot */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        className="absolute inset-0"
        style={{ transformOrigin: "center" }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-0.5 w-2 h-2 bg-accent rounded-full shadow-lg" />
      </motion.div>
    </div>
  );
}

function ThotHero() {
  return (
    <span className="font-heading font-extrabold tracking-tight" style={{ fontSize: "inherit", lineHeight: "inherit" }}>
      <span className="text-foreground">TH</span>
      <span className="text-accent" style={{ fontStyle: "italic" }}>O</span>
      <span className="text-foreground">T</span>
    </span>
  );
}

const SOCIAL_FEATURES = [
  { icon: Swords, label: "Duels de savoir", desc: "Défie tes amis sur 7 jours", color: "text-red-500", bg: "bg-red-500/10", page: "Duels" },
  { icon: Crown, label: "Classement mondial", desc: "Top penseurs de la semaine", color: "text-yellow-500", bg: "bg-yellow-500/10", page: "Leaderboard" },
  { icon: Brain, label: "Carte du cerveau", desc: "Visualise ton savoir", color: "text-purple-500", bg: "bg-purple-500/10", page: "BrainMap" },
  { icon: Flame, label: "Heatmap annuelle", desc: "Chaque jour compte", color: "text-orange-500", bg: "bg-orange-500/10", page: "Heatmap" },
  { icon: Users, label: "Clubs de savoir", desc: "Apprends en communauté", color: "text-blue-500", bg: "bg-blue-500/10", page: "Clubs" },
  { icon: MessageCircle, label: "Feed social", desc: "Activités de tes amis", color: "text-green-500", bg: "bg-green-500/10", page: "Feed" },
];

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

export default function Home() {
  return (
    <div className="bg-background overflow-x-hidden">

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8" />
        {/* Animated blobs */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="absolute top-20 right-10 w-96 h-96 bg-accent/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-20 left-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
        />

        <div className="relative max-w-7xl mx-auto px-4 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.7 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6"
              >
                <Zap className="w-4 h-4" /> Le Strava du savoir
              </motion.div>

              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
                Devenez plus
                <br />
                <span className="text-accent">intelligent</span>
                <br />
                chaque jour
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
                {/* Main card */}
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
                  {/* Mini chart */}
                  <div className="flex items-end gap-1.5 h-14 mb-1">
                    {[40, 65, 30, 80, 55, 90, 70].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
                        className="flex-1 bg-accent/80 rounded-t-sm"
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {["L","M","M","J","V","S","D"].map(d => <span key={d}>{d}</span>)}
                  </div>
                </div>

                {/* Floating badge */}
                <motion.div
                  animate={{ y: [-4, 4, -4] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 rounded-xl px-3 py-2 shadow-lg text-xs font-bold"
                >
                  🏆 Badge gagné !
                </motion.div>

                {/* Floating streak */}
                <motion.div
                  animate={{ y: [4, -4, 4] }}
                  transition={{ repeat: Infinity, duration: 3.5, delay: 0.5 }}
                  className="absolute -bottom-4 -left-4 bg-orange-500 text-white rounded-xl px-3 py-2 shadow-lg text-xs font-bold"
                >
                  🔥 +25 KP !
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">Comment ça marche</h2>
            <p className="mt-4 text-muted-foreground text-lg">Trois étapes simples pour transformer votre apprentissage</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: "1. Ajouter", desc: "Ajoutez livres, podcasts, articles ou vidéos à votre bibliothèque en quelques secondes.", color: "bg-primary/10 text-primary", num: "01" },
              { icon: BarChart3, title: "2. Suivre", desc: "Visualisez votre progression avec des graphiques, heatmaps et statistiques avancées.", color: "bg-accent/10 text-accent", num: "02" },
              { icon: Trophy, title: "3. Progresser", desc: "Gagnez des badges, maintenez votre streak et dépassez vos amis dans les classements.", color: "bg-green-500/10 text-green-500", num: "03" },
            ].map((step, i) => (
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

      {/* ===== INTEGRATIONS ===== */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Wifi className="w-4 h-4" /> Suivi automatique
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Connectez vos applications
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Obtenez encore plus de statistiques. Jumelez vos apps préférées avec THOT pour un suivi automatique et en temps réel.
            </p>
          </motion.div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4 max-w-3xl mx-auto mb-8">
            {INTEGRATIONS.map((app, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.1, y: -4 }}
                className="flex flex-col items-center gap-2"
              >
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

      {/* ===== READ WITH FRIENDS ===== */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <Users className="w-4 h-4" /> Social
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
                Read with Friends
              </h2>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Réactions en direct</h3>
                    <p className="text-sm text-muted-foreground">Ajoutez des réactions à des passages spécifiques sans spoiler. Les commentaires sont débloqués uniquement quand les autres participants atteignent ce passage.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Clubs de lecture</h3>
                    <p className="text-sm text-muted-foreground">Votez pour les prochains livres, organisez des réunions et animez des discussions riches. <span className="text-accent font-medium">Bientôt disponible.</span></p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Suggestions IA</h3>
                    <p className="text-sm text-muted-foreground">Pas de partenaires de lecture ? Notre IA suggère des compagnons de lecture compatibles avec vos goûts.</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4 shadow-xl">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-lg">📚</div>
                  <div>
                    <p className="font-medium">Atomic Habits</p>
                    <p className="text-xs text-muted-foreground">3 amis lisent ce livre</p>
                  </div>
                </div>
                {[
                  { name: "Marie", page: 87, comment: "💡 Ce chapitre sur les habitudes est fascinant !", locked: false },
                  { name: "Karim", page: 142, comment: "🔥 La méthode des 1% change vraiment tout", locked: false },
                  { name: "Sophie", page: 203, comment: "🔒 Débloqué à la page 203", locked: true },
                ].map((r, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${r.locked ? "opacity-40 bg-secondary/30" : "bg-secondary/50"}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-sm shrink-0">
                      {r.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-medium">{r.name} · p.{r.page}</p>
                      <p className="text-sm mt-0.5">{r.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "50K+", label: "Apprenants actifs", icon: Users },
              { value: "2M+", label: "Contenus trackés", icon: BookOpen },
              { value: "4.8⭐", label: "Note moyenne", icon: Star },
              { value: "180+", label: "Pays représentés", icon: Flame },
            ].map((stat, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}>
                <div className="text-center p-6 rounded-2xl bg-card border border-border hover:border-accent/30 transition-all hover:shadow-md">
                  <stat.icon className="w-6 h-6 text-accent mx-auto mb-3" />
                  <p className="text-3xl md:text-4xl font-black text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">Ce qu'en disent nos apprenants</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Marie D.", role: "Consultante", text: "THOT a transformé ma façon de lire. Le système de streak me motive à lire chaque jour. Je suis passée de 5 à 18 livres par an !", kp: "3,200 KP", level: "Érudit 🎓" },
              { name: "Karim B.", role: "Entrepreneur", text: "Enfin une app qui rend l'apprentissage aussi addictif que les réseaux sociaux ! Les défis avec mes amis me poussent à aller plus loin.", kp: "5,100 KP", level: "Polymathe 🧠" },
              { name: "Sophie L.", role: "Médecin", text: "Le dashboard est magnifique. Je peux voir tout ce que j'ai appris en un coup d'œil. L'intégration Spotify pour les podcasts est parfaite.", kp: "2,800 KP", level: "Penseur 💭" },
            ].map((t, i) => (
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

      {/* ===== PREMIUM CTA ===== */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-accent p-8 md:p-14 text-white text-center">
              <div className="absolute inset-0 opacity-10">
                {[...Array(15)].map((_, i) => (
                  <div key={i} className="absolute w-2 h-2 bg-white rounded-full"
                    style={{ left: `${(i * 7) % 100}%`, top: `${(i * 13) % 100}%` }} />
                ))}
              </div>
              <div className="relative">
                <Crown className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
                <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
                  Prêt à devenir un <span className="text-yellow-300">Polymathe</span> ?
                </h2>
                <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                  Rejoignez 50 000 apprenants qui transforment leur quotidien avec THOT Premium.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="h-12 px-8 text-base bg-white text-primary hover:bg-white/90 group" onClick={() => window.location.href = createPageUrl("Dashboard")}>
                    Commencer gratuitement
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Link to={createPageUrl("Premium")}>
                    <Button variant="outline" size="lg" className="h-12 px-8 text-base border-white/30 text-white hover:bg-white/10 w-full">
                      Voir Premium · dès 2,99€/mois
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}