import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

export default function ContentPieChart({ contents }) {
  const typeCount = { book: 0, podcast: 0, video: 0, article: 0 };
  contents.forEach(c => { if (typeCount[c.type] !== undefined) typeCount[c.type]++; });

  const data = [
    { name: "Livres", value: typeCount.book },
    { name: "Podcasts", value: typeCount.podcast },
    { name: "Vidéos", value: typeCount.video },
    { name: "Articles", value: typeCount.article },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    data.push({ name: "Aucun contenu", value: 1 });
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-heading font-semibold mb-4">Répartition contenus</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 13 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}