import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function HeatmapWeeklyBar({ dayMap }) {
  const today = new Date();

  // Last 4 weeks grouped by weekday — show average KP per weekday
  const weekdayKP = Array(7).fill(0);
  const weekdayDays = Array(7).fill(0);

  for (let i = 0; i < 28; i++) {
    const d = subDays(today, i);
    const key = format(d, "yyyy-MM-dd");
    let dow = d.getDay(); // 0=Sun
    const frDow = dow === 0 ? 6 : dow - 1; // Mon=0..Sun=6
    weekdayDays[frDow]++;
    weekdayKP[frDow] += dayMap[key] || 0;
  }

  const data = DAY_LABELS.map((label, i) => ({
    label,
    avgKP: weekdayDays[i] > 0 ? Math.round(weekdayKP[i] / weekdayDays[i]) : 0,
    totalKP: weekdayKP[i],
  }));

  const maxKP = Math.max(...data.map(d => d.avgKP), 1);
  const bestIdx = data.map(d => d.avgKP).indexOf(Math.max(...data.map(d => d.avgKP)));

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="mb-1">
        <h3 className="font-semibold text-sm">Activité moyenne par jour de la semaine</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Basé sur vos 4 dernières semaines — KP moyens par journée</p>
      </div>
      <div className="h-36 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v) => [`${v} KP moy.`, ""]}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="avgKP" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === bestIdx ? "hsl(var(--accent))" : "hsl(var(--accent) / 0.3)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-1">
        {bestIdx !== -1 && data[bestIdx].avgKP > 0
          ? `📈 Votre meilleur jour : ${DAY_LABELS[bestIdx]} (${data[bestIdx].avgKP} KP en moyenne)`
          : "Pas encore assez de données"}
      </p>
    </div>
  );
}