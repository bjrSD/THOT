import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight } from "lucide-react";

const DOMAIN_META = {
  philosophie: { emoji: "🧘", color: "#8B5CF6", label: "Philo" },
  science:     { emoji: "🔬", color: "#06B6D4", label: "Science" },
  business:    { emoji: "💼", color: "#F59E0B", label: "Business" },
  technologie: { emoji: "💻", color: "#3B82F6", label: "Techno" },
  histoire:    { emoji: "📜", color: "#84CC16", label: "Histoire" },
  psychologie: { emoji: "🧠", color: "#EC4899", label: "Psycho" },
  art:         { emoji: "🎨", color: "#F97316", label: "Art" },
  sante:       { emoji: "❤️", color: "#10B981", label: "Santé" },
};

export default function RadarDomains({ user, contents = [] }) {
  // Build scores from real contents
  const domainScores = Object.keys(DOMAIN_META).reduce((acc, domain) => {
    const items = contents.filter(c => c.category === domain);
    acc[domain] = items.filter(c => c.status === "completed").length * 10
                + items.filter(c => c.status === "in_progress").length * 3;
    return acc;
  }, {});

  const totalScore = Object.values(domainScores).reduce((a, b) => a + b, 0);

  const radarData = Object.entries(DOMAIN_META).map(([key, meta]) => ({
    domain: meta.label,
    value: domainScores[key] || 0,
    emoji: meta.emoji,
  }));

  const maxVal = Math.max(...radarData.map(d => d.value), 1);
  const normalized = radarData.map(d => ({ ...d, pct: Math.round((d.value / maxVal) * 100) || 3 }));

  const top = [...Object.entries(domainScores)].sort((a, b) => b[1] - a[1]).slice(0, 3).filter(([, v]) => v > 0);

  if (totalScore === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-heading font-semibold text-sm">Carte du savoir</h3>
          <Link to={createPageUrl("BrainMap")} className="text-xs text-accent hover:underline flex items-center gap-0.5">Voir tout <ArrowRight className="w-3 h-3" /></Link>
        </div>
        <div className="text-center py-6 text-muted-foreground">
          <div className="text-3xl mb-1">🌱</div>
          <p className="text-xs">Terminez des contenus pour voir votre carte du savoir se dessiner.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-heading font-semibold text-sm">Carte du savoir</h3>
          <p className="text-xs text-muted-foreground">{Object.values(domainScores).filter(v => v > 0).length} domaines actifs</p>
        </div>
        <Link to={createPageUrl("BrainMap")} className="text-xs text-accent hover:underline flex items-center gap-0.5">Voir tout <ArrowRight className="w-3 h-3" /></Link>
      </div>
      <div className="flex gap-4 items-center">
        <div className="h-44 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={normalized} cx="50%" cy="50%" outerRadius="65%">
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="domain" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                formatter={(v, name, props) => [`Score: ${props.payload.value}`, props.payload.emoji + " " + props.payload.domain]}
              />
              <Radar dataKey="pct" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.25} strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--accent))" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        {top.length > 0 && (
          <div className="space-y-2 shrink-0 w-28">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Top domaines</p>
            {top.map(([key, score]) => {
              const meta = DOMAIN_META[key];
              return (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="text-sm">{meta.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{meta.label}</p>
                    <div className="h-1 bg-border rounded-full mt-0.5">
                      <div className="h-1 rounded-full" style={{ width: `${Math.round((score / (top[0][1] || 1)) * 100)}%`, background: meta.color }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}