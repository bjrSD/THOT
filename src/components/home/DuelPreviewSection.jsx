import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Swords } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

export default function DuelPreviewSection() {
  return (
    <section className="py-20 md:py-28 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Swords className="w-4 h-4" /> Duels de savoir
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Défie tes amis.<br /><span className="text-accent">Le plus actif gagne.</span>
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Lance un duel sur 7 jours. Chaque livre lu, chaque podcast terminé rapporte des KP. Résultat le dimanche soir — gagnant décroche un badge et des bonus KP.
            </p>
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
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-black text-xl mx-auto mb-2">K</div>
                  <p className="font-semibold text-sm">Karim</p>
                  <p className="text-2xl font-black text-accent">340</p>
                  <p className="text-xs text-muted-foreground">KP 🏆</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">⚔️</span>
                  <span className="text-xs font-bold text-muted-foreground">VS</span>
                </div>
                <div className="flex-1 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-muted flex items-center justify-center font-black text-xl mx-auto mb-2">M</div>
                  <p className="font-semibold text-sm">Marie</p>
                  <p className="text-2xl font-black">280</p>
                  <p className="text-xs text-muted-foreground">KP</p>
                </div>
              </div>
              <div className="h-3 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "55%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-accent to-primary"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                <span>🏆 Karim mène (+60 KP)</span>
                <span>3j restants</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}