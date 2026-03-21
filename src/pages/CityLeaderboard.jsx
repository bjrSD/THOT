import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MapPin, Search, Trophy, Flame, ArrowLeft, Crown, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const CITIES_DATA = [
  { city: "Paris", country: "🇫🇷", count: 1240, top: "Marie D.", kp: 5420 },
  { city: "Lyon", country: "🇫🇷", count: 430, top: "Karim B.", kp: 4980 },
  { city: "Marseille", country: "🇫🇷", count: 310, top: "Sophie L.", kp: 4210 },
  { city: "Bordeaux", country: "🇫🇷", count: 280, top: "Lucas M.", kp: 3890 },
  { city: "Toulouse", country: "🇫🇷", count: 220, top: "Amina T.", kp: 3650 },
  { city: "Nantes", country: "🇫🇷", count: 195, top: "Jules B.", kp: 3200 },
  { city: "Montréal", country: "🇨🇦", count: 380, top: "Emma W.", kp: 4100 },
  { city: "Bruxelles", country: "🇧🇪", count: 290, top: "Noah P.", kp: 3700 },
  { city: "Genève", country: "🇨🇭", count: 180, top: "Clara S.", kp: 3100 },
  { city: "Casablanca", country: "🇲🇦", count: 350, top: "Youssef A.", kp: 3900 },
  { city: "Dakar", country: "🇸🇳", count: 210, top: "Fatou D.", kp: 2800 },
  { city: "Tunis", country: "🇹🇳", count: 160, top: "Ahmed B.", kp: 2600 },
];

const MOCK_CITY_USERS = {
  "Paris": [
    { name: "Marie Dupont", email: "marie@ex.com", kp: 5420, streak: 42, level: "Polymathe 🧠", books: 28, photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face" },
    { name: "Karim Benzali", email: "karim@ex.com", kp: 4980, streak: 31, level: "Érudit 🎓", books: 22, photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
    { name: "Sophie Laurent", email: "sophie@ex.com", kp: 4210, streak: 28, level: "Érudit 🎓", books: 19, photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face" },
    { name: "Lucas Martin", email: "lucas@ex.com", kp: 3890, streak: 15, level: "Penseur 💭", books: 17, photo: null },
    { name: "Amina Traoré", email: "amina@ex.com", kp: 3650, streak: 22, level: "Penseur 💭", books: 15, photo: null },
    { name: "Jules Bernard", email: "jules@ex.com", kp: 3200, streak: 9, level: "Lecteur 📖", books: 13, photo: null },
    { name: "Emma Wilson", email: "emma@ex.com", kp: 2890, streak: 18, level: "Lecteur 📖", books: 11, photo: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face" },
  ],
};

const RANK_STYLES = [
  { bg: "bg-yellow-500/10", border: "border-yellow-500/30", badge: "🥇", text: "text-yellow-600" },
  { bg: "bg-slate-400/10", border: "border-slate-400/30", badge: "🥈", text: "text-slate-500" },
  { bg: "bg-orange-400/10", border: "border-orange-400/30", badge: "🥉", text: "text-orange-500" },
];

function UserProfileModal({ user, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-5">
          {user.photo ? (
            <img src={user.photo} alt={user.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-3 ring-4 ring-accent/20" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-3xl font-bold mx-auto mb-3">
              {user.name[0]}
            </div>
          )}
          <h3 className="font-heading font-bold text-xl">{user.name}</h3>
          <p className="text-accent font-medium">{user.level}</p>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "KP totaux", value: user.kp.toLocaleString(), icon: "⚡" },
            { label: "Streak", value: `${user.streak}j`, icon: "🔥" },
            { label: "Livres", value: user.books, icon: "📚" },
          ].map((s, i) => (
            <div key={i} className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-lg">{s.icon}</p>
              <p className="font-black text-sm">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button className="flex-1 gap-2" size="sm">
            <Trophy className="w-4 h-4" /> Défier en duel
          </Button>
          <Button variant="outline" className="flex-1" size="sm" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CityLeaderboard() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialCity = urlParams.get("city");

  const [selectedCity, setSelectedCity] = useState(initialCity || null);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [myCity] = useState("Paris"); // Current user's city (mock)

  const cityUsers = selectedCity ? (MOCK_CITY_USERS[selectedCity] || MOCK_CITY_USERS["Paris"]) : [];
  const myRank = cityUsers.findIndex(u => u.name === "Marie Dupont") + 1; // mock

  const filteredCities = CITIES_DATA.filter(c =>
    !search || c.city.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = search && selectedCity
    ? cityUsers.filter(u => u.name.toLowerCase().includes(search.toLowerCase()))
    : cityUsers;

  if (selectedCity) {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        {selectedUser && <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />}

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => { setSelectedCity(null); setSearch(""); }}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
              <MapPin className="w-6 h-6 text-accent" /> {selectedCity}
            </h1>
            <p className="text-muted-foreground text-sm">{cityUsers.length} apprenants · classement local</p>
          </div>
        </div>

        {/* My position */}
        {myCity === selectedCity && (
          <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 flex items-center gap-3">
            <Star className="w-5 h-5 text-accent" />
            <p className="text-sm font-medium">Votre position dans cette ville : <span className="font-black text-accent">#{myRank}</span></p>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher un profil..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {/* Top 3 podium */}
        <div className="grid grid-cols-3 gap-3">
          {[cityUsers[1], cityUsers[0], cityUsers[2]].map((user, i) => {
            if (!user) return <div key={i} />;
            const realRank = i === 0 ? 2 : i === 1 ? 1 : 3;
            const style = RANK_STYLES[realRank - 1];
            return (
              <motion.div key={user.email} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`flex flex-col items-center p-3 rounded-2xl border cursor-pointer hover:shadow-md transition-all ${style.bg} ${style.border}`}
                onClick={() => setSelectedUser(user)}>
                <div className="text-2xl mb-1">{style.badge}</div>
                {user.photo ? (
                  <img src={user.photo} alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-background mb-1" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-bold text-lg mb-1">{user.name[0]}</div>
                )}
                <p className="text-xs font-semibold text-center truncate w-full">{user.name.split(" ")[0]}</p>
                <p className={`text-sm font-black ${style.text}`}>{user.kp.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">KP</p>
              </motion.div>
            );
          })}
        </div>

        {/* Full list */}
        <div className="space-y-2">
          {filteredUsers.map((user, i) => (
            <motion.div key={user.email} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <div
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer hover:shadow-md transition-all hover:border-accent/30 ${
                  i < 3 ? `${RANK_STYLES[i].bg} ${RANK_STYLES[i].border}` : "bg-card border-border"
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className={`w-8 text-center font-black text-sm ${i < 3 ? RANK_STYLES[i].text : "text-muted-foreground"}`}>
                  {i < 3 ? RANK_STYLES[i].badge : `#${i + 1}`}
                </div>
                {user.photo ? (
                  <img src={user.photo} alt={user.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold shrink-0">
                    {user.name[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Flame className="w-3 h-3 text-orange-500 inline" /> {user.streak}j · {user.level}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p className="font-black text-accent text-sm">{user.kp.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">KP</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold flex items-center gap-2">
          <MapPin className="w-7 h-7 text-accent" /> Cerveaux de votre ville
        </h1>
        <p className="text-muted-foreground mt-1">Classements locaux par ville dans le monde francophone</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Rechercher une ville..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Cities list */}
      <div className="space-y-3">
        {filteredCities.map((c, i) => (
          <motion.div key={c.city} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <div
              className={`flex items-center gap-4 p-4 rounded-xl border bg-card hover:border-accent/30 hover:shadow-md transition-all cursor-pointer group ${
                c.city === myCity ? "border-accent/40 bg-accent/5" : "border-border"
              }`}
              onClick={() => setSelectedCity(c.city)}
            >
              <div className="w-10 text-center">
                <span className="text-xl">{c.country}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{c.city}</p>
                  {c.city === myCity && <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">Ma ville</span>}
                </div>
                <p className="text-xs text-muted-foreground">{c.count.toLocaleString()} apprenants · Top: <span className="text-accent font-medium">{c.top}</span></p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-black text-sm">{c.kp.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">KP max</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}