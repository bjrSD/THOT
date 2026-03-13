import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { BookOpen, Headphones, Play, FileText, BarChart3, Trophy, Flame, Users, ArrowRight, Star, Zap, Target, Crown, Wifi, MessageCircle, Swords, Brain, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const BOOKS = [
  { title: "L'Anomalie", author: "Hervé Le Tellier", cover: "https://images-na.ssl-images-amazon.com/images/I/71hB1DYIexL.jpg" },
  { title: "Le Mage du Kremlin", author: "G. da Empoli", cover: "https://images-na.ssl-images-amazon.com/images/I/71sN2s+EVUL.jpg" },
  { title: "Veiller sur elle", author: "J.-B. Andrea", cover: "https://images-na.ssl-images-amazon.com/images/I/71-5ywHjYRL.jpg" },
  { title: "L'Étranger", author: "Albert Camus", cover: "https://images-na.ssl-images-amazon.com/images/I/51v3VFkOILL.jpg" },
  { title: "Petit Pays", author: "Gaël Faye", cover: "https://images-na.ssl-images-amazon.com/images/I/61gFbg6yXjL.jpg" },
  { title: "Atomic Habits", author: "James Clear", cover: "https://images-na.ssl-images-amazon.com/images/I/91bYsX41DVL.jpg" },
  { title: "Sapiens", author: "Y.N. Harari", cover: "https://images-na.ssl-images-amazon.com/images/I/713jIoMO3UL.jpg" },
];

const FILMS = [
  { title: "Human / Home", director: "Y. Arthus-Bertrand", emoji: "🌍", color: "#1a6b3c" },
  { title: "Apocalypse WWII", director: "Série documentaire", emoji: "🎖️", color: "#7a2020" },
  { title: "Un Prophète", director: "Jacques Audiard", emoji: "🎬", color: "#1a2a6c" },
  { title: "Le Grand Bleu", director: "Luc Besson", emoji: "🌊", color: "#0d4e8a" },
];

const SOCIAL_FEATURES = [
  { icon: Swords, label: "Duels de savoir", desc: "Défie tes amis sur 7 jours", color: "text-red-400", bg: "bg-red-500/20", page: "Duels" },
  { icon: Crown, label: "Classement mondial", desc: "Top penseurs de la semaine", color: "text-yellow-400", bg: "bg-yellow-500/20", page: "Leaderboard" },
  { icon: Brain, label: "Carte du cerveau", desc: "Visualise ton savoir", color: "text-purple-400", bg: "bg-purple-500/20", page: "BrainMap" },
  { icon: Flame, label: "Heatmap annuelle", desc: "Chaque jour compte", color: "text-orange-400", bg: "bg-orange-500/20", page: "Heatmap" },
  { icon: Users, label: "Clubs de savoir", desc: "Apprends en communauté", color: "text-blue-400", bg: "bg-blue-500/20", page: "Clubs" },
  { icon: MessageCircle, label: "Feed social", desc: "Activités de tes amis", color: "text-green-400", bg: "bg-green-500/20", page: "Feed" },
];

const INTEGRATIONS = [
  { name: "Kindle", color: "#FF9900", emoji: "📱" },
  { name: "Spotify", color: "#1DB954", emoji: "🎵" },
  { name: "YouTube", color: "#FF0000", emoji: "▶️" },
  { name: "Netflix", color: "#E50914", emoji: "🎬" },
  { name: "Les Échos", color: "#005BAA", emoji: "📰" },
  { name: "Le Monde", color: "#555", emoji: "🗞️" },
  { name: "Pocket", color: "#EF4056", emoji: "📌" },
  { name: "Podcasts", color: "#A855F7", emoji: "🎙️" },
];

const LEADERBOARD_MOCK = {
  week: [
    { name: "Marie Dupont", kp: 5420, streak: 42, level: "Polymathe 🧠", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face" },
    { name: "Karim Benzali", kp: 4980, streak: 31, level: "Érudit 🎓", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
    { name: "Sophie Laurent", kp: 4210, streak: 28, level: "Érudit 🎓", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face" },
    { name: "Lucas Martin", kp: 3890, streak: 15, level: "Penseur 💭", photo: null },
  ],
  month: [
    { name: "Karim Benzali", kp: 18400, streak: 31, level: "Érudit 🎓", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
    { name: "Marie Dupont", kp: 17200, streak: 42, level: "Polymathe 🧠", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face" },
    { name: "Lucas Martin", kp: 14100, streak: 15, level: "Penseur 💭", photo: null },
    { name: "Sophie Laurent", kp: 13800, streak: 28, level: "Érudit 🎓", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face" },
  ],
  all: [
    { name: "Sophie Laurent", kp: 54200, streak: 28, level: "Polymathe 🧠", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face" },
    { name: "Marie Dupont", kp: 49800, streak: 42, level: "Polymathe 🧠", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face" },
    { name: "Karim Benzali", kp: 42100, streak: 31, level: "Érudit 🎓", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
    { name: "Lucas Martin", kp: 38900, streak: 15, level: "Penseur 💭", photo: null },
  ],
};

const RANK_STYLES = [
  { badge: "🥇", color: "text-yellow-400", border: "border-yellow-500/40", bg: "bg-yellow-500/10" },
  { badge: "🥈", color: "text-slate-300", border: "border-slate-400/40", bg: "bg-slate-500/10" },
  { badge: "🥉", color: "text-orange-400", border: "border-orange-500/40", bg: "bg-orange-500/10" },
];

function BookCarousel() {
  const [index, setIndex] = useState(0);
  const visible = 4;
  const max = BOOKS.length - visible;

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <motion.div
          className="flex gap-4"
          animate={{ x: -index * (120 + 16) }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {BOOKS.map((b, i) => (
            <motion.div
              key={i}
              className="shrink-0 w-28 cursor-pointer"
              whileHover={{ scale: 1.06, y: -6 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="relative rounded-xl overflow-hidden shadow-xl" style={{ perspective: "600px" }}>
                <img
                  src={b.cover}
                  alt={b.title}
                  className="w-28 h-40 object-cover"
                  onError={(e) => { e.target.src = `https://via.placeholder.com/112x160/1a2a4a/ffffff?text=${encodeURIComponent(b.title.slice(0,8))}`; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              </div>
              <p className="text-xs text-white/70 mt-1.5 truncate font-medium">{b.title}</p>
              <p className="text-xs text-white/40 truncate">{b.author}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center disabled:opacity-30 transition-all">
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
        <button onClick={() => setIndex(Math.min(max, index + 1))} disabled={index >= max}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center disabled:opacity-30 transition-all">
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [lbTab, setLbTab] = React.useState("week");

  return (
    <div className="bg-background overflow-x-hidden">

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden min-h-screen flex items-center"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 50%, #0f2547 100%)" }}>
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&q=80"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628] via-[#0a1628]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.7 }}>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium mb-5 border border-accent/30">
                <Zap className="w-4 h-4" /> Le Strava du savoir — v2.0
              </motion.div>

              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-5 text-white">
                Devenez plus<br /><span className="text-accent">intelligent</span><br />chaque jour
              </h1>
              <p className="text-lg md:text-xl text-white/60 max-w-lg leading-relaxed mb-6">
                Suivez vos livres, podcasts et vidéos. Progressez, dépassez vos amis, gagnez des Knowledge Points.
              </p>

              <div className="flex gap-5 mb-6">
                {[{icon: BookOpen, label:"Livres"},{icon: Headphones, label:"Podcasts"},{icon: FileText, label:"Articles"},{icon: Play, label:"Vidéos"}].map(({icon: Icon, label}) => (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                      <Icon className="w-5 h-5 text-white/80" />
                    </div>
                    <span className="text-xs text-white/50">{label}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Button size="lg" className="h-12 px-8 text-base group bg-accent hover:bg-accent/90 text-white"
                  onClick={() => base44.auth.redirectToLogin()}>
                  Commencer gratuitement
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Link to={createPageUrl("Premium")}>
                  <Button variant="outline" size="lg" className="h-12 px-8 text-base gap-2 w-full border-white/30 text-white hover:bg-white/10">
                    <Crown className="w-4 h-4 text-yellow-400" /> S'abonner Premium
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-white/50">
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-2">
                    {["https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop",
                      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop",
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop"].map((src, i) => (
                      <img key={i} src={src} className="w-7 h-7 rounded-full border-2 border-[#0a1628] object-cover" />
                    ))}
                  </div>
                  <span>+100M esprits actifs</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                  <span className="ml-1">4.8/5</span>
                </div>
              </div>
            </motion.div>

            {/* Right — Auth block Strava-style */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.8 }}>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=700&q=80"
                  alt="Lecture passionnée"
                  className="w-full h-full object-cover absolute inset-0"
                  style={{ minHeight: "480px" }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628]/80 via-[#0d1f3c]/70 to-[#0a1628]/60 backdrop-blur-[1px]" />
                <div className="relative p-8 min-h-[480px] flex flex-col justify-center">
                  <div className="text-center mb-6">
                    <p className="text-white/60 text-sm mb-1">Rejoignez la communauté</p>
                    <h2 className="text-white font-heading text-2xl font-bold">Créer un compte gratuit</h2>
                  </div>

                  {/* Social login buttons */}
                  <div className="space-y-3 mb-5">
                    <button
                      onClick={() => base44.auth.redirectToLogin()}
                      className="w-full flex items-center gap-3 bg-white text-gray-800 rounded-xl px-5 py-3.5 font-semibold text-sm hover:bg-gray-100 transition-all shadow-md"
                    >
                      {/* Apple logo */}
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                      <span className="flex-1 text-center">Continuer avec Apple</span>
                    </button>

                    <button
                      onClick={() => base44.auth.redirectToLogin()}
                      className="w-full flex items-center gap-3 bg-white text-gray-800 rounded-xl px-5 py-3.5 font-semibold text-sm hover:bg-gray-100 transition-all shadow-md"
                    >
                      {/* Google logo */}
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span className="flex-1 text-center">Continuer avec Google</span>
                    </button>

                    <button
                      onClick={() => base44.auth.redirectToLogin()}
                      className="w-full flex items-center gap-3 bg-accent text-white rounded-xl px-5 py-3.5 font-semibold text-sm hover:bg-accent/90 transition-all shadow-md"
                    >
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      <span className="flex-1 text-center">Continuer avec Email</span>
                    </button>
                  </div>

                  <p className="text-center text-white/40 text-xs">
                    Déjà un compte ?{" "}
                    <button onClick={() => base44.auth.redirectToLogin()} className="text-accent underline">Se connecter</button>
                  </p>

                  <p className="text-center text-white/25 text-xs mt-3">
                    En vous inscrivant, vous acceptez nos{" "}
                    <Link to={createPageUrl("Terms")} className="underline hover:text-white/40">CGU</Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== SOCIAL FEATURES ===== */}
      <section className="py-14 md:py-20 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-3">
              <Zap className="w-4 h-4" /> Nouvelles fonctionnalités v2.0
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">Apprenez, compétez, progressez</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">THOT est devenu une vraie plateforme sociale de la connaissance.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SOCIAL_FEATURES.map((feat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to={createPageUrl(feat.page)}>
                  <div className="group bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full hover:border-accent/30">
                    <div className={`w-14 h-14 rounded-2xl ${feat.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <feat.icon className={`w-7 h-7 ${feat.color}`} />
                    </div>
                    <h3 className="font-heading font-bold text-lg mb-1">{feat.label}</h3>
                    <p className="text-sm text-muted-foreground">{feat.desc}</p>
                    <div className={`mt-3 flex items-center gap-1 text-sm font-medium ${feat.color}`}>
                      Découvrir <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATALOGUE — Books + Films ===== */}
      <section className="py-14 md:py-20 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)" }}>
        {/* background ambiance */}
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1400&q=60" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-8">
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-3">
              <BookOpen className="w-4 h-4" /> Catalogue THOT
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2">Les incontournables</h2>
            <p className="text-white/50">Livres primés, documentaires et films cultes</p>
          </motion.div>

          {/* Books Carousel */}
          <div className="mb-10">
            <p className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-4">📚 Livres</p>
            <BookCarousel />
          </div>

          {/* Films grid */}
          <div>
            <p className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-4">🎬 Films & Documentaires</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {FILMS.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.04, y: -4 }}>
                  <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl cursor-pointer"
                    style={{ background: `linear-gradient(135deg, ${f.color}cc, ${f.color}44)` }}>
                    <div className="p-6 text-center">
                      <span className="text-5xl block mb-3">{f.emoji}</span>
                      <p className="font-bold text-white text-sm leading-tight">{f.title}</p>
                      <p className="text-white/50 text-xs mt-1">{f.director}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== LEADERBOARD PREVIEW ===== */}
      <section className="py-14 md:py-20"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)" }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-4 py-1.5 rounded-full text-sm font-medium mb-5">
                <Trophy className="w-4 h-4" /> Classement des cerveaux
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-white">
                Qui est le plus<br /><span className="text-accent">grand penseur ?</span>
              </h2>
              <p className="text-white/60 mb-5 leading-relaxed">
                Le classement change chaque semaine. Chaque livre, podcast ou article terminé rapporte des KP. Montez dans le classement !
              </p>

              {/* Community quote */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
                <p className="text-white/80 text-sm italic leading-relaxed">
                  "Motivation garantie par la communauté. Suivez vos progrès et encouragez-vous les uns les autres. Rejoignez gratuitement plus de 100 millions d'esprits actifs sur THOT."
                </p>
              </div>

              {/* Real people photos */}
              <div className="flex gap-3 mb-5">
                {[
                  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&h=120&fit=crop&crop=face",
                  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&crop=face",
                  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=120&h=120&fit=crop&crop=face",
                ].map((src, i) => (
                  <img key={i} src={src} className="w-16 h-16 rounded-xl object-cover border-2 border-accent/30" />
                ))}
                <div className="w-16 h-16 rounded-xl bg-accent/20 border-2 border-accent/30 flex items-center justify-center">
                  <span className="text-accent text-xs font-bold">+99M</span>
                </div>
              </div>

              <Link to={createPageUrl("Leaderboard")}>
                <Button className="gap-2 bg-accent hover:bg-accent/90 text-white"><Trophy className="w-4 h-4" /> Voir le classement complet</Button>
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <div className="bg-[#0d1f3c] rounded-2xl border border-white/10 p-5 shadow-2xl">
                <h3 className="font-bold text-white mb-4 text-center">Classement des cerveaux</h3>
                <div className="flex gap-1 bg-white/5 p-1 rounded-xl mb-5">
                  {[{id:"week",label:"Cette semaine"},{id:"month",label:"Ce mois"},{id:"all",label:"Tout temps"}].map(t => (
                    <button key={t.id} onClick={() => setLbTab(t.id)}
                      className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-all ${lbTab===t.id ? "bg-accent text-white shadow" : "text-white/50 hover:text-white"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[LEADERBOARD_MOCK[lbTab][1], LEADERBOARD_MOCK[lbTab][0], LEADERBOARD_MOCK[lbTab][2]].map((user, i) => {
                    const realRank = i === 0 ? 1 : i === 1 ? 0 : 2;
                    const style = RANK_STYLES[realRank];
                    return (
                      <motion.div key={user.name} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className={`flex flex-col items-center p-2 rounded-xl border ${style.bg} ${style.border}`}>
                        <span className="text-lg">{style.badge}</span>
                        {user.photo ? (
                          <img src={user.photo} alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-white/20 my-1" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center font-bold text-white text-lg my-1">{user.name[0]}</div>
                        )}
                        <p className="text-xs font-semibold text-white text-center truncate w-full">{user.name.split(" ")[0]}</p>
                        <p className={`text-sm font-black ${style.color}`}>{user.kp.toLocaleString()}</p>
                        <p className="text-xs text-white/40">KP</p>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="space-y-2">
                  {LEADERBOARD_MOCK[lbTab].slice(3).map((user, i) => (
                    <div key={user.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <span className="text-sm font-bold text-white/40 w-6">#{i+4}</span>
                      {user.photo ? (
                        <img src={user.photo} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm">{user.name[0]}</div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-white/40">{user.level} · 🔥 {user.streak}j</p>
                      </div>
                      <span className="text-accent font-black text-sm">{user.kp.toLocaleString()} KP</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== DUEL PREVIEW ===== */}
      <section className="py-14 md:py-20 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-1.5 rounded-full text-sm font-medium mb-5">
                <Swords className="w-4 h-4" /> Duels de savoir
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">
                Défie tes amis.<br /><span className="text-accent">Le plus actif gagne.</span>
              </h2>
              <p className="text-muted-foreground mb-5 leading-relaxed">Lance un duel sur 7 jours. Chaque contenu terminé rapporte des KP. Le gagnant décroche un badge et des bonus.</p>
              <Link to={createPageUrl("Duels")}>
                <Button className="gap-2"><Swords className="w-4 h-4" /> Lancer un duel</Button>
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <div className="bg-card rounded-2xl border border-border p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-5">
                  <Swords className="w-5 h-5 text-red-500" />
                  <span className="font-semibold">Duel en cours — 3 jours restants</span>
                </div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex-1 text-center">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
                      className="w-14 h-14 rounded-2xl object-cover mx-auto mb-2 ring-2 ring-accent" />
                    <p className="font-semibold text-sm">Karim</p>
                    <p className="text-2xl font-black text-accent">340</p>
                    <p className="text-xs text-muted-foreground">KP 🏆</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">⚔️</span>
                    <span className="text-xs font-bold text-muted-foreground">VS</span>
                  </div>
                  <div className="flex-1 text-center">
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face"
                      className="w-14 h-14 rounded-2xl object-cover mx-auto mb-2 ring-2 ring-border" />
                    <p className="font-semibold text-sm">Marie</p>
                    <p className="text-2xl font-black">280</p>
                    <p className="text-xs text-muted-foreground">KP</p>
                  </div>
                </div>
                <div className="h-3 rounded-full bg-secondary overflow-hidden">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: "55%" }} viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-accent to-primary" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                  <span>🏆 Karim mène (+60 KP)</span><span>3j restants</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-10">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">Comment ça marche</h2>
            <p className="mt-3 text-muted-foreground text-lg">Trois étapes simples</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: "1. Ajouter", desc: "Livres, podcasts, articles ou vidéos en quelques secondes.", color: "bg-primary/10 text-primary", num: "01",
                img: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80" },
              { icon: BarChart3, title: "2. Suivre", desc: "Graphiques, heatmaps et statistiques avancées pour visualiser ta progression.", color: "bg-accent/10 text-accent", num: "02",
                img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80" },
              { icon: Trophy, title: "3. Progresser", desc: "Badges, streaks et classements parmi vos amis.", color: "bg-green-500/10 text-green-500", num: "03",
                img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80" },
            ].map((step, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.15 }}>
                <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full overflow-hidden">
                  <div className="relative h-44 overflow-hidden">
                    <img src={step.img} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                    <div className="absolute top-3 left-3 text-3xl font-black text-white/30">{step.num}</div>
                  </div>
                  <CardContent className="p-5">
                    <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center mb-3`}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-heading text-xl font-bold mb-1">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== INTEGRATIONS ===== */}
      <section className="py-14 md:py-20 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-3">
              <Wifi className="w-4 h-4" /> Suivi automatique
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">Connectez vos applications</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Jumelez vos apps préférées pour un suivi automatique.</p>
          </motion.div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4 max-w-3xl mx-auto mb-7">
            {INTEGRATIONS.map((app, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.1, y: -4 }}
                className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md border border-border bg-card"
                  style={{ backgroundColor: app.color + "15" }}>{app.emoji}</div>
                <span className="text-xs text-muted-foreground text-center">{app.name}</span>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Link to={createPageUrl("Integrations")}>
              <Button variant="outline" className="gap-2">Voir toutes les intégrations <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-10">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">Ce qu'en disent nos apprenants</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: "Marie D.", role: "Consultante", text: "THOT a transformé ma façon de lire. Le système de streak me motive chaque jour. Je suis passée de 5 à 18 livres par an !", kp: "3,200 KP", level: "Érudit 🎓", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face" },
              { name: "Karim B.", role: "Entrepreneur", text: "Enfin une app aussi addictive que les réseaux sociaux ! Les défis avec mes amis me poussent à aller plus loin.", kp: "5,100 KP", level: "Polymathe 🧠", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
              { name: "Sophie L.", role: "Médecin", text: "Le dashboard est magnifique. Je peux voir tout ce que j'ai appris en un coup d'œil. L'intégration Spotify est parfaite.", kp: "2,800 KP", level: "Penseur 💭", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face" },
            ].map((t, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}>
                <Card className="border-none shadow-lg h-full hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-3">{[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}</div>
                    <p className="text-foreground leading-relaxed mb-4">"{t.text}"</p>
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
            ))}
          </div>
        </div>
      </section>

      {/* ===== PREMIUM CTA ===== */}
      <section className="py-14 md:py-20 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)" }}>
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&q=60" alt=""
            className="w-full h-full object-cover opacity-10" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4 text-white">
              Passer Premium — <span className="text-yellow-400">Apprenez sans limites</span>
            </h2>
            <p className="text-lg text-white/60 mb-7 max-w-xl mx-auto">
              Bibliothèque illimitée, dashboard avancé, intégrations Kindle/Spotify/Netflix, 1k recommandations IA, clubs de lecture, badge Premium.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-12 px-8 text-base bg-accent hover:bg-accent/90 text-white group"
                onClick={() => base44.auth.redirectToLogin()}>
                Commencer gratuitement
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Link to={createPageUrl("Premium")}>
                <Button variant="outline" size="lg" className="h-12 px-8 text-base border-white/30 text-white hover:bg-white/10 w-full gap-2">
                  <Crown className="w-4 h-4 text-yellow-400" /> Voir Premium · dès 2,99€/mois
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}