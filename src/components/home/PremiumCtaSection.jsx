import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

export default function PremiumCtaSection() {
  return (
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
                <Button size="lg" className="h-12 px-8 text-base bg-white text-primary hover:bg-white/90 group"
                  onClick={() => window.location.href = createPageUrl("Dashboard")}>
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
  );
}