import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

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

  // Domain scores
  const domainScores = Object.keys(DOMAIN_META).reduce((acc, domain) => {
    const items = contents.filter(c => c.category === domain);
    const completed = items.filter(c => c.status === "completed").length;
    const inProgress = items.filter(c => c.status === "in_progress").length;
    acc[domain] = completed * 10 + inProgress * 3;
    return acc;
  }, {});

  const radarData = Object.entries(DOMAIN_META).map(([key, meta]) => ({
    subject: meta.label,
    value: domainScores[key] || 0,
    fullMark: Math.max(...Object.values(domainScores), 10),
  }));

  const totalScore = Object.values(domainScores).reduce((a, b) => a + b, 0);
  const activeDomains = Object.values(domainScores).filter(v => v > 0).length;
  const dominantDomain = Object.entries(domainScores).sort((a, b) => b[1] - a[1])[0]?.[0];

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-accent" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* 1. Header */}
      <BrainMapHeader
        totalScore={totalScore}
        activeDomains={activeDomains}
        dominantDomain={dominantDomain}
        totalContents={contents.filter(c => c.status === "completed").length}
        DOMAIN_META={DOMAIN_META}
      />

      {totalScore === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
          <div className="text-5xl mb-3">🌱</div>
          <p className="font-semibold">Votre carte est encore vierge</p>
          <p className="text-sm text-muted-foreground mt-1">
            Terminez des contenus pour voir votre profil intellectuel prendre forme.
          </p>
        </div>
      ) : (
        <>
          {/* 2. Radar */}
          <BrainRadar radarData={radarData} />

          {/* 3. Narrative summary */}
          <NarrativeSummary domainScores={domainScores} DOMAIN_META={DOMAIN_META} />

          {/* 4. Domain grid (primary + secondary) */}
          <DomainGrid domainScores={domainScores} DOMAIN_META={DOMAIN_META} />

          {/* 5. Evolution over time */}
          <BrainEvolution contents={contents} DOMAIN_META={DOMAIN_META} />

          {/* 6. Insights */}
          <BrainInsights domainScores={domainScores} contents={contents} DOMAIN_META={DOMAIN_META} />

          {/* 7. Recommendations */}
          <BrainRecommendations domainScores={domainScores} DOMAIN_META={DOMAIN_META} />

          {/* 8. Contents by domain */}
          <ContentsByDomain contents={contents} domainScores={domainScores} DOMAIN_META={DOMAIN_META} />
        </>
      )}
    </div>
  );
}