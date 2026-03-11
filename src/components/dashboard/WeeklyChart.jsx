import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function WeeklyChart({ activities }) {
  // Generate mock weekly data based on activities count
  const data = DAYS.map((day, i) => ({
    day,
    kp: Math.floor(Math.random() * 40) + (activities.length > 0 ? 10 : 0),
  }));

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-heading font-semibold mb-4">Progression hebdomadaire</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 13 }}
              formatter={(value) => [`${value} KP`, "Points"]}
            />
            <Bar dataKey="kp" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}