import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, getDay, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";

const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
const DAYS = ["L", "M", "M", "J", "V", "S", "D"];

const INTENSITY_CLASSES = [
  "bg-secondary/40",
  "bg-accent/20",
  "bg-accent/45",
  "bg-accent/70",
  "bg-accent",
];

function getIntensity(kp) {
  if (kp === 0) return 0;
  if (kp < 10) return 1;
  if (kp < 30) return 2;
  if (kp < 60) return 3;
  return 4;
}

const CONTENT_TYPE_LABELS = { book: "Livre", podcast: "Podcast", video: "Vidéo", article: "Article" };

function DayTooltip({ day, kp, contents, position }) {
  const dayContents = contents.filter(c => {
    if (!c.created_date) return false;
    return format(new Date(c.created_date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
  });

  const types = [...new Set(dayContents.map(c => c.content_type).filter(Boolean))];
  const categories = [...new Set(dayContents.map(c => c.details?.match(/catégorie: (\w+)/)?.[1]).filter(Boolean))];

  return (
    <div className={`absolute z-50 bg-card border border-border shadow-xl rounded-xl p-3 w-52 pointer-events-none
      ${position === "right" ? "left-5 top-0" : "right-5 top-0"}`}>
      <p className="font-semibold text-xs mb-2">{format(day, "EEEE d MMMM", { locale: fr })}</p>
      {kp === 0 ? (
        <p className="text-xs text-muted-foreground">Journée inactive</p>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">KP gagnés</span>
            <span className="text-xs font-bold text-accent">{kp} KP</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Activités</span>
            <span className="text-xs font-semibold">{dayContents.length}</span>
          </div>
          {types.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-1">
              {types.map(t => (
                <span key={t} className="text-xs bg-accent/15 text-accent px-1.5 py-0.5 rounded-full">{CONTENT_TYPE_LABELS[t] || t}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HeatmapGrid({ weeks, dayMap, activities, today, range }) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [hoverPos, setHoverPos] = useState({ wi: 0, di: 0 });

  // Month labels
  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const firstDay = week.find(Boolean);
    if (firstDay) {
      const m = new Date(firstDay).getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ wi, label: MONTHS[m] });
        lastMonth = m;
      }
    }
  });

  const totalWeeks = weeks.length;

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm">Activité d'apprentissage</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Intensité basée sur les KP gagnés chaque jour</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Moins</span>
          {INTENSITY_CLASSES.map((cls, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${cls}`} title={
              i === 0 ? "Aucune activité" :
              i === 1 ? "< 10 KP" :
              i === 2 ? "10–30 KP" :
              i === 3 ? "30–60 KP" : "> 60 KP"
            } />
          ))}
          <span>Plus</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        {/* Month labels */}
        <div className="flex gap-1 mb-1 min-w-max">
          <div className="w-4 shrink-0" />
          {weeks.map((_, wi) => {
            const label = monthLabels.find(m => m.wi === wi);
            return (
              <div key={wi} className="w-3 shrink-0 text-xs text-muted-foreground" style={{ fontSize: 9 }}>
                {label ? label.label : ""}
              </div>
            );
          })}
        </div>

        <div className="flex gap-1 min-w-max">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-1 shrink-0">
            {DAYS.map((d, i) => (
              <div key={i} className={`w-3 h-3 flex items-center justify-center text-muted-foreground ${i % 2 !== 0 ? "opacity-100" : "opacity-0"}`} style={{ fontSize: 9 }}>
                {d}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1 relative">
              {week.map((day, di) => {
                if (!day) return <div key={di} className="w-3 h-3" />;
                const key = format(day, "yyyy-MM-dd");
                const kp = dayMap[key] || 0;
                const intensity = getIntensity(kp);
                const isToday = isSameDay(day, today);
                const isHovered = hoveredDay && format(hoveredDay, "yyyy-MM-dd") === key;
                const tooltipSide = wi > totalWeeks * 0.7 ? "left" : "right";

                return (
                  <div key={di} className="relative">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: wi * 0.004 }}
                      onMouseEnter={() => { setHoveredDay(day); setHoverPos({ wi, di }); }}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-3 h-3 rounded-sm ${INTENSITY_CLASSES[intensity]} transition-all cursor-pointer
                        hover:scale-150 hover:z-10 relative
                        ${isToday ? "ring-1 ring-accent ring-offset-1 ring-offset-card" : ""}
                        ${isHovered ? "scale-150 z-10" : ""}`}
                    />
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.12 }}
                          className={`absolute z-50 ${tooltipSide === "left" ? "right-5" : "left-5"} top-0`}
                        >
                          <DayTooltip
                            day={day}
                            kp={kp}
                            contents={activities}
                            position={tooltipSide}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend detail */}
      <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-x-4 gap-y-1">
        {[
          { cls: INTENSITY_CLASSES[0], label: "Inactif" },
          { cls: INTENSITY_CLASSES[1], label: "< 10 KP" },
          { cls: INTENSITY_CLASSES[2], label: "10–30 KP" },
          { cls: INTENSITY_CLASSES[3], label: "30–60 KP" },
          { cls: INTENSITY_CLASSES[4], label: "> 60 KP" },
        ].map((l, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${l.cls}`} />
            <span className="text-xs text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}