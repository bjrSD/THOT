import React from "react";
import { motion } from "framer-motion";
import { Users, BookOpen, Star, Flame } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const STATS = [
  { value: "50K+", label: "Apprenants actifs", icon: Users },
  { value: "2M+", label: "Contenus trackés", icon: BookOpen },
  { value: "4.8⭐", label: "Note moyenne", icon: Star },
  { value: "180+", label: "Pays représentés", icon: Flame },
];

export default function StatsSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
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
  );
}