import React from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-2.5 shadow-lg text-sm">
      <p className="font-semibold mb-0.5">{label}</p>
      <p className="text-accent font-bold">{payload[0].value} pts</p>
    </div>
  );
};

export default function BrainRadar({ radarData }) {
  const maxVal = Math.max(...radarData.map(d => d.value), 10);

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="font-semibold text-base">Radar des connaissances</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Chaque axe représente un domaine intellectuel. La surface traduit votre amplitude.</p>
        </div>
        <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
          Max : {maxVal} pts
        </span>
      </div>
      <div className="h-80 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
            />
            <Radar
              name="Vous"
              dataKey="value"
              stroke="hsl(var(--accent))"
              fill="hsl(var(--accent))"
              fillOpacity={0.22}
              strokeWidth={2}
              dot={{ r: 3, fill: "hsl(var(--accent))", strokeWidth: 0 }}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-1">
        Survolez un axe pour voir votre score détaillé
      </p>
    </div>
  );
}