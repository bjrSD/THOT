import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, BookOpen, MessageCircle, Trophy, ArrowLeft, Send, Crown, Flame, Pin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const CLUBS_INFO = {
  "entrepreneurs": {
    emoji: "🚀", name: "Entrepreneurs", category: "business",
    description: "Un espace dédié aux entrepreneurs, startuppers et business builders. Partagez vos lectures, vos découvertes et vos réflexions sur l'entrepreneuriat.",
    longDescription: "Ce club est le point de rencontre des esprits entrepreneuriaux. Chaque semaine, nous partageons des lectures inspirantes, des podcasts de référence, et des retours d'expérience. Des défis collectifs sont organisés régulièrement pour vous pousser à aller plus loin.",
    members: 1240, kp_total: 128000,
    cover: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    pinned_book: "Zero to One — Peter Thiel",
    challenges: ["📚 10 livres business en 3 mois", "🎙️ 1 podcast/jour pendant 30 jours"],
    top_members: [
      { name: "Karim B.", kp: 5420, streak: 31, photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
      { name: "Marie D.", kp: 4980, streak: 42, photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face" },
      { name: "Lucas M.", kp: 3800, streak: 15, photo: null },
    ],
    recent_reads: ["Atomic Habits", "The Lean Startup", "Zero to One", "Thinking Fast and Slow"],
  },
  "philosophie": {
    emoji: "🧘", name: "Philosophie", category: "philosophie",
    description: "Socrate, Nietzsche, Spinoza — plongez dans les profondeurs de la pensée humaine.",
    longDescription: "Un espace pour les amoureux de la philosophie. Partagez vos réflexions sur les grands textes, débattez d'idées, et explorez ensemble les grandes questions de l'existence. Des lectures guidées sont proposées chaque mois.",
    members: 890, kp_total: 95000,
    cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
    pinned_book: "Ainsi parlait Zarathoustra — Nietzsche",
    challenges: ["🧠 Lire 3 classiques en 2 mois"],
    top_members: [
      { name: "Marie D.", kp: 5420, streak: 42, photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face" },
      { name: "Sophie L.", kp: 4210, streak: 28, photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face" },
    ],
    recent_reads: ["La République — Platon", "L'Éthique — Spinoza", "Méditations — Descartes"],
  },
};

const DEFAULT_CLUB = {
  emoji: "📚", name: "Club", category: "général",
  description: "Un club de savoir.",
  longDescription: "Rejoignez ce club pour partager vos lectures et progresser ensemble.",
  members: 100, kp_total: 10000,
  cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
  pinned_book: null, challenges: [], top_members: [], recent_reads: [],
};

export default function ClubDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const clubId = urlParams.get("id") || "entrepreneurs";
  const club = CLUBS_INFO[clubId] || { ...DEFAULT_CLUB, name: clubId };

  const [joined, setJoined] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, author: "Marie D.", text: "Je viens de terminer Zero to One ! Absolument incroyable. Qui l'a lu ?", time: "il y a 2h", likes: 5 },
    { id: 2, author: "Karim B.", text: "Je le lis en ce moment ! La partie sur les monopoles est fascinante.", time: "il y a 1h", likes: 3 },
    { id: 3, author: "Sophie L.", text: "Prochaine lecture du club : The Lean Startup. On commence lundi ?", time: "il y a 30min", likes: 8 },
  ]);
  const [activeTab, setActiveTab] = useState("accueil");

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), author: "Vous", text: newMessage, time: "à l'instant", likes: 0 }]);
    setNewMessage("");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Back */}
      <Link to={createPageUrl("Clubs")}>
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Tous les clubs
        </Button>
      </Link>

      {/* Cover */}
      <div className="relative rounded-2xl overflow-hidden h-48">
        <img src={club.cover} alt={club.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{club.emoji}</span>
            <div>
              <h1 className="font-heading text-2xl font-bold text-white">{club.name}</h1>
              <p className="text-white/70 text-sm">{club.members.toLocaleString()} membres · {club.kp_total.toLocaleString()} KP collectifs</p>
            </div>
          </div>
          <Button
            size="sm"
            className={joined ? "bg-white/20 text-white border border-white/30 hover:bg-white/30" : "bg-accent hover:bg-accent/90"}
            onClick={() => setJoined(!joined)}
          >
            {joined ? "✓ Membre" : "+ Rejoindre"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary p-1 rounded-xl">
        {[
          { id: "accueil", label: "Accueil" },
          { id: "chat", label: "Discussion" },
          { id: "membres", label: "Membres" },
          { id: "defis", label: "Défis" },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all ${activeTab === t.id ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Accueil Tab */}
      {activeTab === "accueil" && (
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold mb-2">À propos</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{club.longDescription}</p>
          </div>

          {club.pinned_book && (
            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center"><Pin className="w-5 h-5 text-accent" /></div>
              <div>
                <p className="text-xs text-accent font-medium uppercase tracking-wide">Lecture du moment</p>
                <p className="font-semibold text-sm">{club.pinned_book}</p>
              </div>
            </div>
          )}

          {club.recent_reads.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4 text-accent" /> Lectures récentes du club</h3>
              <div className="space-y-2">
                {club.recent_reads.map((book, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5 border-b border-border last:border-0">
                    <span className="text-lg">📖</span>
                    <p className="text-sm font-medium">{book}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-3 border-b border-border flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-accent" />
            <span className="font-semibold text-sm">Discussion du club</span>
          </div>
          <div className="h-80 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-2 ${msg.author === "Vous" ? "flex-row-reverse" : ""}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xs font-bold shrink-0">
                  {msg.author[0]}
                </div>
                <div className={`max-w-[75%] ${msg.author === "Vous" ? "items-end" : ""} flex flex-col`}>
                  {msg.author !== "Vous" && <p className="text-xs text-accent font-medium mb-0.5">{msg.author}</p>}
                  <div className={`rounded-2xl px-3 py-2 text-sm ${msg.author === "Vous" ? "bg-accent text-accent-foreground" : "bg-secondary"}`}>
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">{msg.time}</p>
                    <button className="text-xs text-muted-foreground hover:text-red-500 flex items-center gap-0.5">
                      <Heart className="w-3 h-3" /> {msg.likes}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {joined ? (
            <div className="p-3 border-t border-border flex gap-2">
              <Input placeholder="Écrire un message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()} className="text-sm" />
              <Button size="icon" onClick={handleSend} disabled={!newMessage.trim()}><Send className="w-4 h-4" /></Button>
            </div>
          ) : (
            <div className="p-4 text-center border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Rejoignez le club pour participer à la discussion</p>
              <Button size="sm" onClick={() => setJoined(true)}>Rejoindre le club</Button>
            </div>
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === "membres" && (
        <div className="space-y-3">
          {club.top_members.map((member, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition-all hover:border-accent/30">
              {member.photo ? (
                <img src={member.photo} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-lg">{member.name[0]}</div>
              )}
              <div className="flex-1">
                <p className="font-semibold">{member.name}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span><Flame className="w-3 h-3 text-orange-500 inline" /> {member.streak}j streak</span>
                  <span className="text-accent font-medium">{member.kp.toLocaleString()} KP</span>
                </div>
              </div>
              {i === 0 && <Crown className="w-5 h-5 text-yellow-500" />}
            </div>
          ))}
        </div>
      )}

      {/* Défis Tab */}
      {activeTab === "defis" && (
        <div className="space-y-4">
          {club.challenges.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucun défi actif pour ce club.</p>
          ) : club.challenges.map((c, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
              <div className="text-3xl">{c.split(" ")[0]}</div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{c.slice(c.indexOf(" ") + 1)}</p>
                <p className="text-xs text-muted-foreground">Défi collectif du club</p>
              </div>
              <Button size="sm">Participer</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}