import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const LEADERS = [
  { rank: "🥇", name: "Marie D.", kp: 5420, streak: 42, badge: "Polymathe 🧠" },
  { rank: "🥈", name: "Karim B.", kp: 4980, streak: 31, badge: "Érudit 🎓" },
  { rank: "🥉", name: "Sophie L.", kp: 4210, streak: 28, badge: "Érudit 🎓" },
  { rank: "#4", name: "Lucas M.", kp: 3890, streak: 15, badge: "Penseur 💭" },
];

export default function LeaderboardPreviewSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="order-2 md:order-1">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">Top cerveaux — cette semaine</span>
              </div>
              {LEADERS.map((u, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                  <span className="text-lg w-8 text-center">{u.rank}</span>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold">{u.name[0]}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.badge} · 🔥 {u.streak}j</p>
                  </div>
                  <span className="font-black text-accent text-sm">{u.kp.toLocaleString()} KP</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="order-1 md:order-2">
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-600 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Trophy className="w-4 h-4" /> Classement mondial
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Qui est le plus<br /><span className="text-accent">grand penseur ?</span>
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Le classement est calculé selon vos KP, la diversité de vos lectures, la régularité et la difficulté des contenus. Chaque semaine, un nouveau champion.
            </p>
            <Link to={createPageUrl("Leaderboard")}>
              <Button variant="outline" className="gap-2"><Trophy className="w-4 h-4" /> Voir le classement</Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}