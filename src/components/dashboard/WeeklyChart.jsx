import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function WeeklyChart({ activities }) {
  // Build real weekly data from activities (last 7 days)
  const data = DAYS.map((day, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayStr = date.toISOString().split("T")[0];
    const dayActivities = activities.filter(a => a.created_date?.startsWith(dayStr));
    const kp = dayActivities.reduce((sum, a) => sum + (a.kp_earned || 0), 0);
    return { day, kp };
  });

  return (
    <div className="bg-card rounded-xl border border-border p-3 md:p-5 overflow-hidden">
      <h3 className="font-heading font-semibold text-sm md:text-base mb-3">Progression hebdomadaire</h3>
      <div className="h-40 md:h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={18} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={30} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
              formatter={(value) => [`${value} KP`, "Points"]}
            />
            <Bar dataKey="kp" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}