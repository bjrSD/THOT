import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Brain } from "lucide-react";
import { motion } from "framer-motion";

import BrainMapHeader from "@/components/brainmap/BrainMapHeader";
import BrainRadar from "@/components/brainmap/BrainRadar";
import NarrativeSummary from "@/components/brainmap/NarrativeSummary";
import DomainGrid from "@/components/brainmap/DomainGrid";
import BrainEvolution from "@/components/brainmap/BrainEvolution";
import BrainInsights from "@/components/brainmap/BrainInsights";
import BrainRecommendations from "@/components/brainmap/BrainRecommendations";
import ContentsByDomain from "@/components/brainmap/ContentsByDomain";

const DOMAIN_META = {
  philosophie: { emoji: "🧘", color: "#8B5CF6", label: "Philosophie" },
  science:     { emoji: "🔬", color: "#06B6D4", label: "Science" },
  business:    { emoji: "💼", color: "#F59E0B", label: "Business" },
  technologie: { emoji: "💻", color: "#3B82F6", label: "Technologie" },
  histoire:    { emoji: "📜", color: "#84CC16", label: "Histoire" },
  psychologie: { emoji: "🧠", color: "#EC4899", label: "Psychologie" },
  art:         { emoji: "🎨", color: "#F97316", label: "Art" },
  sante:       { emoji: "❤️", color: "#10B981", label: "Santé" },
};

export default function BrainMap() {
  const [user, setUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: contents = [], isLoading } = useQuery({
    queryKey: ["contents-brain"],
    queryFn: () => base44.entities.Content.list("-created_date", 200),
  });

  const domainScores = Object.keys(DOMAIN_META).reduce((acc, domain) => {
    const items = contents.filter(c => c.category === domain);
    acc[domain] = items.filter(c => c.status === "completed").length * 10
                + items.filter(c => c.status === "in_progress").length * 3;
    return acc;
  }, {});

  const radarData = Object.entries(DOMAIN_META).map(([key, meta]) => ({
    subject: meta.label,
    value: domainScores[key] || 0,
    fullMark: Math.max(...Object.values(domainScores), 10),
  }));

  const totalScore    = Object.values(domainScores).reduce((a, b) => a + b, 0);
  const activeDomains = Object.values(domainScores).filter(v => v > 0).length;
  const dominantDomain = Object.entries(domainScores).sort((a, b) => b[1] - a[1])[0]?.[0];

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-accent" />
    </div>
  );

  return (
    <div className="space-y-4">

      {/* ── Row 0 : Full-width header banner ──────────────────────────────────── */}
      <BrainMapHeader
        totalScore={totalScore}
        activeDomains={activeDomains}
        dominantDomain={dominantDomain}
        totalContents={contents.filter(c => c.status === "completed").length}
        DOMAIN_META={DOMAIN_META}
      />

      {totalScore === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
          <div className="text-5xl mb-3">🌱</div>
          <p className="font-semibold">Votre carte est encore vierge</p>
          <p className="text-sm text-muted-foreground mt-1">Terminez des contenus pour voir votre profil intellectuel prendre forme.</p>
        </div>
      ) : (
        <>
          {/* ── Row 1 : Radar (left, tall) + Narrative + Insights (right col) ── */}
          <div className="grid lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3">
              <BrainRadar radarData={radarData} />
            </div>
            <div className="lg:col-span-2 flex flex-col gap-4">
              <NarrativeSummary domainScores={domainScores} DOMAIN_META={DOMAIN_META} />
              <BrainInsights domainScores={domainScores} contents={contents} DOMAIN_META={DOMAIN_META} />
            </div>
          </div>

          {/* ── Row 2 : Domain grid (primary bars + secondary chips) ─────────── */}
          <DomainGrid domainScores={domainScores} DOMAIN_META={DOMAIN_META} />

          {/* ── Row 3 : Evolution chart (left) + Recommendations (right) ──────── */}
          <div className="grid lg:grid-cols-2 gap-4">
            <BrainEvolution contents={contents} DOMAIN_META={DOMAIN_META} />
            <BrainRecommendations domainScores={domainScores} DOMAIN_META={DOMAIN_META} />
          </div>

          {/* ── Row 4 : Contents by domain (expandable accordions) ───────────── */}
          <ContentsByDomain contents={contents} domainScores={domainScores} DOMAIN_META={DOMAIN_META} />
        </>
      )}
    </div>
  );
}