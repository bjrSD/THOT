import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { BookOpen, Headphones, Play, FileText, BarChart3, Trophy, Flame, Users, ArrowRight, Star, Zap, Target, Crown, Wifi, MessageCircle, Swords, Brain, LogIn, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart, Pie, Cell, Legend } from "recharts";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const BOOKS = [
{ title: "Atomic Habits", author: "James Clear", cover: "https://books.google.com/books/content?id=XfFvDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api", progress: 100 },
{ title: "Sapiens", author: "Y.N. Harari", cover: "https://books.google.com/books/content?id=1EiJAwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api", progress: 68 },
{ title: "Thinking, Fast and Slow", author: "D. Kahneman", cover: "https://books.google.com/books/content?id=ZuKTvERuPG8C&printsec=frontcover&img=1&zoom=1&source=gbs_api", progress: 34 },
{ title: "La Femme de ménage", author: "Freida McFadden", cover: "https://media.base44.com/images/public/69b18ae2b6a2664c5c01b197/b50d90655_image.png", progress: 100 },
{ title: "L'Alchimiste", author: "Paulo Coelho", cover: "https://media.base44.com/images/public/69b18ae2b6a2664c5c01b197/c493bd705_image.png", progress: 0, scale: 1.2 },
{ title: "Les Misérables", author: "Victor Hugo", cover: "https://books.google.com/books/content?id=P1YXAAAAYAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api", progress: 100 },
{ title: "Chanson Douce", author: "Leïla Slimani", cover: "https://media.base44.com/images/public/69b18ae2b6a2664c5c01b197/1ac8fa3cc_image.png", progress: 0 },
{ title: "The Lean Startup", author: "Eric Ries", cover: "https://books.google.com/books/content?id=r9x-OXdzpPcC&printsec=frontcover&img=1&zoom=1&source=gbs_api", progress: 52 },
];


const SOCIAL_FEATURES = [
{ icon: Swords, label: "Duels de savoir", desc: "Défie tes amis sur 7 jours", color: "text-red-400", bg: "bg-red-500/20", page: "Duels" },
{ icon: Crown, label: "Classement mondial", desc: "Top penseurs de la semaine", color: "text-yellow-400", bg: "bg-yellow-500/20", page: "Leaderboard" },
{ icon: Brain, label: "Carte du cerveau", desc: "Visualise ton savoir", color: "text-purple-400", bg: "bg-purple-500/20", page: "BrainMap" },
{ icon: Flame, label: "Heatmap annuelle", desc: "Chaque jour compte", color: "text-orange-400", bg: "bg-orange-500/20", page: "Heatmap" },
{ icon: Users, label: "Clubs de savoir", desc: "Apprends en communauté", color: "text-blue-400", bg: "bg-blue-500/20", page: "Clubs" },
{ icon: MessageCircle, label: "Feed social", desc: "Activités de tes amis", color: "text-green-400", bg: "bg-green-500/20", page: "Feed" }];


const INTEGRATIONS = [
{ name: "Kindle", color: "#FF9900", emoji: "📱" },
{ name: "Spotify", color: "#1DB954", emoji: "🎵" },
{ name: "YouTube", color: "#FF0000", emoji: "▶️" },
{ name: "Netflix", color: "#E50914", emoji: "🎬" },
{ name: "Les Échos", color: "#005BAA", emoji: "📰" },
{ name: "Le Monde", color: "#555", emoji: "🗞️" },
{ name: "Pocket", color: "#EF4056", emoji: "📌" },
{ name: "Podcasts", color: "#A855F7", emoji: "🎙️" }];


const LEADERBOARD_MOCK = {
  week: [
  { name: "Marie Dupont", kp: 5420, streak: 42, level: "Polymathe 🧠", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face" },
  { name: "Karim Benzali", kp: 4980, streak: 31, level: "Érudit 🎓", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
  { name: "Sophie Laurent", kp: 4210, streak: 28, level: "Érudit 🎓", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face" },
  { name: "Lucas Martin", kp: 3890, streak: 15, level: "Penseur 💭", photo: null }],

  month: [
  { name: "Karim Benzali", kp: 18400, streak: 31, level: "Érudit 🎓", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
  { name: "Marie Dupont", kp: 17200, streak: 42, level: "Polymathe 🧠", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face" },
  { name: "Lucas Martin", kp: 14100, streak: 15, level: "Penseur 💭", photo: null },
  { name: "Sophie Laurent", kp: 13800, streak: 28, level: "Érudit 🎓", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face" }],

  all: [
  { name: "Sophie Laurent", kp: 54200, streak: 28, level: "Polymathe 🧠", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face" },
  { name: "Marie Dupont", kp: 49800, streak: 42, level: "Polymathe 🧠", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face" },
  { name: "Karim Benzali", kp: 42100, streak: 31, level: "Érudit 🎓", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
  { name: "Lucas Martin", kp: 38900, streak: 15, level: "Penseur 💭", photo: null }]

};

const RANK_STYLES = [
{ badge: "🥇", color: "text-yellow-400", border: "border-yellow-500/40", bg: "bg-yellow-500/10" },
{ badge: "🥈", color: "text-slate-300", border: "border-slate-400/40", bg: "bg-slate-500/10" },
{ badge: "🥉", color: "text-orange-400", border: "border-orange-500/40", bg: "bg-orange-500/10" }];


// Stats mock
const VOCAB_STATS = [
{ label: "Total de mots assimilés", value: "2 700", trend: +12, icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500/10" },
{ label: "Taille du vocabulaire", value: "1 695", trend: +8, icon: Brain, color: "text-purple-400", bg: "bg-purple-500/10" },
{ label: "Nouveaux mots", value: "97", trend: +23, icon: Zap, color: "text-green-400", bg: "bg-green-500/10" }];


// Capital Savoir 30 jours
const CAPITAL_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  kp: Math.round(1200 + i * 42 + Math.sin(i * 0.7) * 120 + Math.random() * 80)
}));

// Répartition consommation
const CONSOMMATION_DATA = [
{ name: "Romans Français", value: 40, color: "#a855f7" },
{ name: "Documentaires", value: 30, color: "#3b82f6" },
{ name: "Dév. Personnel", value: 20, color: "#10b981" },
{ name: "Cinéma", value: 10, color: "#f59e0b" }];


export default function Home() {
  const [lbTab, setLbTab] = React.useState("week");

  return (
    <div className="bg-background overflow-x-hidden">

      {/* ===== HERO — dark immersive ===== */}
      <section className="relative overflow-hidden flex items-center"
      style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 50%, #0f2547 100%)" }}>
        {/* Background photo */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&q=80"
            alt=""
            className="w-full h-full object-cover opacity-20" />
          
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628] via-[#0a1628]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 w-full py-10 md:py-16">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.7 }}>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 text-accent text-xs font-medium mb-4 border border-accent/30">
                <Zap className="w-3.5 h-3.5" /> Le Strava du savoir — v2.0
              </motion.div>

              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-4 text-white">
                Devenez plus<br /><span className="text-accent">intelligent</span><br />chaque jour
              </h1>
              <p className="text-base md:text-xl text-white/60 max-w-lg leading-relaxed mb-6">
                Suivez vos livres, podcasts et vidéos. Progressez, dépassez vos amis, gagnez des Knowledge Points.
              </p>

              {/* Content type icons */}
              <div className="flex gap-4 mb-6">
                {[{ icon: BookOpen, label: "Livres" }, { icon: Headphones, label: "Podcasts" }, { icon: FileText, label: "Articles" }, { icon: Play, label: "Vidéos" }].map(({ icon: Icon, label }) =>
                <div key={label} className="flex flex-col items-center gap-1">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                      <Icon className="w-4 h-4 text-white/80" />
                    </div>
                    <span className="text-[10px] text-white/50">{label}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="h-11 px-6 text-sm group bg-accent hover:bg-accent/90 text-white w-full sm:w-auto"
                onClick={() => base44.auth.redirectToLogin()}>
                  S'inscrire gratuitement
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="lg" className="bg-gray-500 text-gray-50 px-6 text-sm font-medium rounded-md inline-flex items-center justify-center whitespace-nowrap transition-colors h-11 gap-2 border-white/20 hover:bg-slate-300 w-full sm:w-auto"
                onClick={() => base44.auth.redirectToLogin()}>
                  <LogIn className="w-4 h-4 text-white" /> Se connecter
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/50">
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-2">
                    {["https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop",
                    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=40&h=40&fit=crop",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop"].map((src, i) =>
                    <img key={i} src={src} className="w-7 h-7 rounded-full border-2 border-[#0a1628] object-cover" />
                    )}
                  </div>
                  <span>+50K apprenants</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                  <span className="ml-1">4.8/5</span>
                </div>
              </div>
            </motion.div>

            {/* Right — Dashboard mockup (hidden on small mobile, visible from sm) */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="hidden sm:block">
              <div className="relative">
                <div className="bg-[#0d1f3c]/90 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-bold text-white text-sm">Tableau de bord — Cette semaine</p>
                    </div>
                    <span className="text-xs bg-orange-500/20 text-orange-400 px-2.5 py-1 rounded-full font-medium">🔥 12j Streak</span>
                  </div>

                  {/* Heatmap mini */}
                  <div className="mb-4">
                    <p className="text-xs text-white/40 mb-2">Streak</p>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 28 }).map((_, i) => {
                        const intensity = [0, 1, 2, 3][Math.floor(Math.random() * 4)];
                        const colors = ["bg-white/5", "bg-accent/20", "bg-accent/50", "bg-accent"];
                        return <div key={i} className={`h-4 rounded-sm ${colors[intensity]}`} />;
                      })}
                    </div>
                    <div className="flex justify-between text-xs text-white/30 mt-1">
                      {["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul"].map((m) => <span key={m}>{m}</span>)}
                    </div>
                  </div>

                  {/* KP chart */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-white/40">KP</p>
                      <p className="text-xs text-accent font-bold">▲ KP</p>
                    </div>
                    <div className="flex items-end gap-1 h-12">
                      {[30, 50, 25, 70, 45, 80, 60].map((h, i) =>
                      <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }}
                      transition={{ delay: 0.6 + i * 0.07, duration: 0.4 }}
                      className="flex-1 bg-accent/70 rounded-t-sm" />
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-white/30 mt-1">
                      {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <span key={i}>{d}</span>)}
                    </div>
                  </div>

                  {/* Library mini */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-white/40 font-medium">Bibliothèque</p>
                      <Link to={createPageUrl("Library")} className="text-xs text-accent">Voir tout →</Link>
                    </div>
                    <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
                      {BOOKS.map((b, i) => {
                        const colors = ["#4f46e5","#0891b2","#7c3aed","#059669","#dc2626","#d97706","#db2777","#2563eb"];
                        return (
                          <div key={i} className="shrink-0 w-[52px] group">
                            <div className="relative">
                              <div className="w-[52px] h-[74px] rounded-lg shadow-lg ring-1 ring-white/10 overflow-hidden group-hover:scale-105 transition-transform duration-200"
                                style={{ backgroundColor: colors[i % colors.length] }}>
                                <img
                                  src={b.cover}
                                  alt={b.title}
                                  className="w-full h-full object-cover"
                                  style={{ objectFit: "cover", objectPosition: b.objectPosition || "center", transform: b.scale ? `scale(${b.scale})` : undefined }}
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              </div>

                            </div>
                            <p className="text-[10px] text-white/40 mt-1.5 truncate leading-tight">{b.title}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <motion.div animate={{ y: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 rounded-xl px-3 py-1.5 shadow-lg text-xs font-bold">
                  🏆 Badge gagné !
                </motion.div>
                <motion.div animate={{ y: [4, -4, 4] }} transition={{ repeat: Infinity, duration: 3.5, delay: 0.5 }}
                className="absolute -bottom-3 -left-3 bg-orange-500 text-white rounded-xl px-3 py-1.5 shadow-lg text-xs font-bold">
                  🔥 +25 KP !
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-8">
            <h2 className="font-heading text-2xl md:text-4xl font-bold">Comment ça marche</h2>
            <p className="mt-2 text-muted-foreground text-base">Trois étapes simples</p>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
            { icon: BookOpen, title: "1. Ajouter", desc: "Livres, podcasts, articles ou vidéos en quelques secondes.", color: "bg-primary/10 text-primary", num: "01",
              img: "https://media.base44.com/images/public/69b18ae2b6a2664c5c01b197/1c1b836e9_generated_image.png" },
            { icon: BarChart3, title: "2. Suivre", desc: "Graphiques, heatmaps et statistiques avancées.", color: "bg-accent/10 text-accent", num: "02",
              img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80" },
            { icon: Trophy, title: "3. Progresser", desc: "Badges, streaks et classements parmi vos amis.", color: "bg-green-500/10 text-green-500", num: "03",
              img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80" }].
            map((step, i) =>
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.15 }}>
                <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full overflow-hidden">
                  <div className="relative h-40 overflow-hidden">
                    <img src={step.img} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                    <div className="absolute top-3 left-3 text-3xl font-black text-white/20">{step.num}</div>
                  </div>
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center mb-4`}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-heading text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ===== SOCIAL FEATURES ===== */}
      <section className="py-10 md:py-14 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Zap className="w-4 h-4" /> Nouvelles fonctionnalités v2.0
            </div>
            <h2 className="font-heading text-2xl md:text-4xl font-bold mb-3">Apprenez, complétez, progressez</h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">THOT est devenu une vraie plateforme sociale de la connaissance.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SOCIAL_FEATURES.map((feat, i) =>
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
            )}
          </div>
        </div>
      </section>

      {/* ===== LEADERBOARD PREVIEW with time tabs ===== */}
      <section className="py-10 md:py-14"
      style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)" }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <Trophy className="w-4 h-4" /> Classement des cerveaux
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-white">
                Qui est le plus<br /><span className="text-accent">grand penseur ?</span>
              </h2>
              <p className="text-white/60 mb-6 leading-relaxed">
                Le classement change chaque semaine. Chaque livre, podcast ou article terminé rapporte des KP. Montez dans le classement !
              </p>
              <Link to={createPageUrl("Leaderboard")}>
                <Button className="gap-2 bg-accent hover:bg-accent/90"><Trophy className="w-4 h-4" /> Voir le classement complet</Button>
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <div className="bg-[#0d1f3c] rounded-2xl border border-white/10 p-5 shadow-2xl">
                <h3 className="font-bold text-white mb-4 text-center">Classement des cerveaux</h3>
                <div className="flex gap-1 bg-white/5 p-1 rounded-xl mb-5">
                  {[{ id: "week", label: "Cette semaine" }, { id: "month", label: "Ce mois" }, { id: "all", label: "Tout temps" }].map((t) =>
                  <button key={t.id} onClick={() => setLbTab(t.id)}
                  className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-all ${lbTab === t.id ? "bg-accent text-white shadow" : "text-white/50 hover:text-white"}`}>
                      {t.label}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {(() => {
                    const data = LEADERBOARD_MOCK[lbTab] || [];
                    const podium = [data[1], data[0], data[2]].filter(Boolean);
                    return podium.map((user, i) => {
                      const realRank = i === 0 ? 1 : i === 1 ? 0 : 2;
                      const style = RANK_STYLES[realRank];
                      return (
                        <motion.div key={user.name} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className={`flex flex-col items-center p-2 rounded-xl border ${style.bg} ${style.border}`}>
                          <span className="text-lg">{style.badge}</span>
                          {user.photo ?
                          <img src={user.photo} alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-white/20 my-1" /> :
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center font-bold text-white text-lg my-1">{user.name[0]}</div>
                          }
                          <p className="text-xs font-semibold text-white text-center truncate w-full">{user.name.split(" ")[0]}</p>
                          <p className={`text-sm font-black ${style.color}`}>{user.kp.toLocaleString()}</p>
                          <p className="text-xs text-white/40">KP</p>
                        </motion.div>);
                    });
                  })()}
                </div>
                <div className="space-y-2">
                  {LEADERBOARD_MOCK[lbTab].slice(3).map((user, i) =>
                  <div key={user.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <span className="text-sm font-bold text-white/40 w-6">#{i + 4}</span>
                      {user.photo ?
                    <img src={user.photo} alt={user.name} className="w-8 h-8 rounded-full object-cover" /> :
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm">{user.name[0]}</div>
                    }
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-white/40">{user.level} · 🔥 {user.streak}j</p>
                      </div>
                      <span className="text-accent font-black text-sm">{user.kp.toLocaleString()} KP</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== STATS VOCABULARY ===== */}
      <section className="py-10 md:py-14 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-400 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Brain className="w-4 h-4" /> Capital Lexical
            </div>
            <h2 className="font-heading text-2xl md:text-4xl font-bold mb-3">Votre richesse en mots</h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">Chaque lecture enrichit votre vocabulaire actif et passif.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {VOCAB_STATS.map((stat, i) =>
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <div className="flex items-end gap-3">
                      <p className="text-4xl font-black">{stat.value}</p>
                      <div className={`flex items-center gap-1 text-sm font-semibold mb-1 ${stat.trend > 0 ? "text-green-500" : "text-red-500"}`}>
                        {stat.trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        +{stat.trend}%
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">vs. mois précédent</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-heading font-bold text-lg">Évolution du Capital Savoir</h3>
                    <p className="text-sm text-muted-foreground">30 derniers jours</p>
                  </div>
                  <span className="text-2xl font-black text-fuchsia-500">{CAPITAL_DATA?.[29]?.kp?.toLocaleString() || "0"} KP</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={CAPITAL_DATA && CAPITAL_DATA.length > 0 ? CAPITAL_DATA : [{ day: 1, kp: 0 }]} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="kpGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d946ef" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} label={{ value: "Jour", position: "insideBottom", offset: -2, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v} KP`, "Capital Savoir"]} labelFormatter={(l) => `Jour ${l}`} />
                    <Area type="monotone" dataKey="kp" stroke="#d946ef" strokeWidth={2.5} fill="url(#kpGradient)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ===== PROFIL APPRENANT ===== */}
      <section className="py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div className="inline-flex items-center gap-2 bg-fuchsia-500/10 text-fuchsia-500 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <BarChart3 className="w-4 h-4" /> Profil de l'apprenant
              </div>
              <h2 className="font-heading text-2xl md:text-4xl font-bold mb-3">Votre ADN de la connaissance</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">Découvrez la répartition de vos habitudes de consommation culturelle : lectures, documentaires, développement personnel...</p>
              <div className="space-y-3">
                {CONSOMMATION_DATA.map((item, i) =>
                <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground">{item.value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: `${item.value}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.15 }}
                      className="h-full rounded-full" style={{ backgroundColor: item.color }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <Card className="border-none shadow-xl">
                <CardContent className="p-6">
                  <h3 className="font-heading font-bold text-lg mb-4 text-center">Répartition de votre consommation</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={CONSOMMATION_DATA && CONSOMMATION_DATA.length > 0 ? CONSOMMATION_DATA : [{ name: "Aucune donnée", value: 100, color: "#ccc" }]} cx="50%" cy="45%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                        {(CONSOMMATION_DATA && CONSOMMATION_DATA.length > 0 ? CONSOMMATION_DATA : [{ name: "Aucune donnée", value: 100, color: "#ccc" }]).map((entry, index) =>
                        <Cell key={index} fill={entry.color} />
                        )}
                      </Pie>
                      <Tooltip formatter={(v) => [`${v}%`, ""]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Legend iconType="circle" iconSize={10} formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== DUEL PREVIEW — fond bleu marine ===== */}
      <section className="py-10 md:py-14"
      style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)" }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <Swords className="w-4 h-4" /> Duels de savoir
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-white">
                Défie tes amis.<br /><span className="text-accent">Le plus actif gagne.</span>
              </h2>
              <p className="text-white/60 mb-6 leading-relaxed">Lance un duel sur 7 jours. Chaque contenu terminé rapporte des KP. Le gagnant décroche un badge et des bonus.</p>
              <Link to={createPageUrl("Duels")}>
                <Button className="gap-2 bg-accent hover:bg-accent/90"><Swords className="w-4 h-4" /> Lancer un duel</Button>
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <div className="bg-[#0d1f3c] rounded-2xl border border-white/10 p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-5">
                  <Swords className="w-5 h-5 text-red-400" />
                  <span className="font-semibold text-white">Duel en cours — 3 jours restants</span>
                </div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex-1 text-center">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
                    className="w-14 h-14 rounded-2xl object-cover mx-auto mb-2 ring-2 ring-accent" />
                    <p className="font-semibold text-sm text-white">Karim</p>
                    <p className="text-2xl font-black text-accent">340</p>
                    <p className="text-xs text-white/40">KP 🏆</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">⚔️</span>
                    <span className="text-xs font-bold text-white/40">VS</span>
                  </div>
                  <div className="flex-1 text-center">
                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face"
                    className="w-14 h-14 rounded-2xl object-cover mx-auto mb-2 ring-2 ring-white/20" />
                    <p className="font-semibold text-sm text-white">Marie</p>
                    <p className="text-2xl font-black text-white">280</p>
                    <p className="text-xs text-white/40">KP</p>
                  </div>
                </div>
                <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: "55%" }} viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-accent to-primary" />
                </div>
                <div className="flex justify-between text-xs text-white/40 mt-1.5">
                  <span>🏆 Karim mène (+60 KP)</span><span>3j restants</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== INTEGRATIONS ===== */}
      <section className="py-10 md:py-14 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Wifi className="w-4 h-4" /> Suivi automatique
            </div>
            <h2 className="font-heading text-2xl md:text-4xl font-bold mb-3">Connectez vos applications</h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">Jumelez vos apps préférées pour un suivi automatique.</p>
          </motion.div>
          <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto md:max-w-3xl md:grid-cols-8 mb-8">
            {INTEGRATIONS.map((app, i) =>
            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.1, y: -4 }}
            className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md border border-border bg-card"
              style={{ backgroundColor: app.color + "15" }}>{app.emoji}</div>
                <span className="text-xs text-muted-foreground text-center">{app.name}</span>
              </motion.div>
            )}
          </div>
          <div className="text-center">
            <Link to={createPageUrl("Integrations")}>
              <Button variant="outline" className="gap-2">Voir toutes les intégrations <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-8">
            <h2 className="font-heading text-2xl md:text-4xl font-bold">Ce qu'en disent nos apprenants</h2>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
            { name: "Marie D.", role: "Consultante", text: "THOT a transformé ma façon de lire. Le système de streak me motive chaque jour. Je suis passée de 5 à 18 livres par an !", kp: "3,200 KP", level: "Érudit 🎓", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face" },
            { name: "Karim B.", role: "Entrepreneur", text: "Enfin une app aussi addictive que les réseaux sociaux ! Les défis avec mes amis me poussent à aller plus loin.", kp: "5,100 KP", level: "Polymathe 🧠", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
            { name: "Sophie L.", role: "Médecin", text: "Le dashboard est magnifique. Je peux voir tout ce que j'ai appris en un coup d'œil. L'intégration Spotify est parfaite.", kp: "2,800 KP", level: "Penseur 💭", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face" }].
            map((t, i) =>
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}>
                <Card className="border-none shadow-lg h-full hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}</div>
                    <p className="text-foreground leading-relaxed mb-5">"{t.text}"</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
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
            )}
          </div>
        </div>
      </section>

      {/* ===== PREMIUM CTA ===== */}
      <section className="py-10 md:py-14 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)" }}>
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&q=60" alt=""
          className="w-full h-full object-cover opacity-10" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="font-heading text-2xl md:text-5xl font-bold mb-4 text-white">
              Passer Premium — <span className="text-yellow-400">Apprenez sans limites</span>
            </h2>
            <p className="text-base text-white/60 mb-6 max-w-xl mx-auto">
              Bibliothèque illimitée, dashboard avancé, intégrations Kindle/Spotify/Netflix, 1k recommandations IA, clubs de lecture, badge Premium.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-12 px-8 text-base bg-accent hover:bg-accent/90 text-white group"
              onClick={() => window.location.href = createPageUrl("Dashboard")}>
                Commencer gratuitement
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Link to={createPageUrl("Premium")}>
                <Button variant="outline" size="lg" className="bg-[hsl(var(--ring))] text-white px-8 text-base font-medium opacity-100 rounded-md inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border shadow-sm hover:text-accent-foreground h-12 border-white/20 hover:bg-white/10 w-full gap-2">
                  <Crown className="w-4 h-4 text-yellow-400" /> Voir Premium · dès 2,99€/mois
                </Button>
              </Link>
            </div>
            <p className="text-white/40 text-sm mt-4">
              <Link to={createPageUrl("Integrations")} className="underline hover:text-white/60">Voir toutes les intégrations</Link>
            </p>
          </motion.div>
        </div>
      </section>
    </div>);

}