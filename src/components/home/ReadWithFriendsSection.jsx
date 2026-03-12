import React from "react";
import { motion } from "framer-motion";
import { Users, MessageCircle, BookOpen, Zap } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const REACTIONS = [
  { name: "Marie", page: 87, comment: "💡 Ce chapitre sur les habitudes est fascinant !", locked: false },
  { name: "Karim", page: 142, comment: "🔥 La méthode des 1% change vraiment tout", locked: false },
  { name: "Sophie", page: 203, comment: "🔒 Débloqué à la page 203", locked: true },
];

export default function ReadWithFriendsSection() {
  return (
    <section className="py-20 md:py-28 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Users className="w-4 h-4" /> Social
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">Read with Friends</h2>
            <div className="space-y-5">
              {[
                { icon: MessageCircle, color: "bg-accent/10 text-accent", title: "Réactions en direct", desc: "Ajoutez des réactions à des passages spécifiques sans spoiler. Les commentaires sont débloqués quand les autres participants atteignent ce passage." },
                { icon: BookOpen, color: "bg-primary/10 text-primary", title: "Clubs de lecture", desc: "Votez pour les prochains livres, organisez des réunions et animez des discussions riches.", soon: true },
                { icon: Zap, color: "bg-green-500/10 text-green-500", title: "Suggestions IA", desc: "Pas de partenaires de lecture ? Notre IA suggère des compagnons compatibles avec vos goûts." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc} {item.soon && <span className="text-accent font-medium">Bientôt disponible.</span>}</p>
                  </div>
                </div>
              ))}
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
              {REACTIONS.map((r, i) => (
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
  );
}