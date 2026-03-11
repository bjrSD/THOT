import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { CATEGORY_LABELS } from "../shared/KPUtils";

export default function RadarDomains({ user }) {
  const domains = user?.domains || {};
  const data = [
    { domain: "Philosophie", value: domains.philosophie || 0 },
    { domain: "Science", value: domains.science || 0 },
    { domain: "Business", value: domains.business || 0 },
    { domain: "Techno", value: domains.technologie || 0 },
    { domain: "Histoire", value: domains.histoire || 0 },
    { domain: "Psycho", value: domains.psychologie || 0 },
  ];

  // Normalize values for display
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const normalized = data.map(d => ({ ...d, value: Math.round((d.value / maxVal) * 100) || 5 }));

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-heading font-semibold mb-4">Carte du savoir</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={normalized} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="domain" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <Radar dataKey="value" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.2} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}