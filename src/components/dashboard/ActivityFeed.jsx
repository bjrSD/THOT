import React from "react";
import { BookOpen, Headphones, Play, FileText, Trophy, Flame } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const ACTION_CONFIG = {
  started: { label: "a commencé", color: "text-accent" },
  progress: { label: "continue", color: "text-blue-400" },
  completed: { label: "a terminé", color: "text-green-500" },
  badge_earned: { label: "a gagné un badge", color: "text-yellow-500" },
  streak_milestone: { label: "a atteint un streak de", color: "text-orange-500" },
  challenge_joined: { label: "a rejoint un défi", color: "text-purple-500" },
};

const TYPE_ICON = {
  book: BookOpen,
  podcast: Headphones,
  video: Play,
  article: FileText,
};

export default function ActivityFeed({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold mb-4">Activité récente</h3>
        <p className="text-sm text-muted-foreground text-center py-8">Aucune activité encore. Commencez à apprendre !</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-heading font-semibold mb-4">Activité récente</h3>
      <div className="space-y-4">
        {activities.slice(0, 8).map((activity, i) => {
          const config = ACTION_CONFIG[activity.action] || ACTION_CONFIG.progress;
          const Icon = TYPE_ICON[activity.content_type] || BookOpen;
          return (
            <div key={activity.id || i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className={`font-medium ${config.color}`}>{config.label}</span>
                  {activity.content_title && <span className="font-medium"> {activity.content_title}</span>}
                  {activity.details && <span className="text-muted-foreground"> · {activity.details}</span>}
                </p>
                {activity.kp_earned > 0 && (
                  <span className="text-xs text-accent font-medium">+{activity.kp_earned} KP</span>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {format(new Date(activity.created_date), "d MMM · HH:mm", { locale: fr })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}