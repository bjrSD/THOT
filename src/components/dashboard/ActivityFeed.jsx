import React from "react";
import { BookOpen, Headphones, Play, FileText, Trophy, Flame, Plus, RefreshCw, ListMusic } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const ACTION_CONFIG = {
  started:           { label: "Commencé",           emoji: "🚀", color: "text-accent",       bg: "bg-accent/10" },
  progress:          { label: "Progression",         emoji: "📈", color: "text-blue-400",     bg: "bg-blue-400/10" },
  completed:         { label: "Terminé",             emoji: "✅", color: "text-green-500",    bg: "bg-green-500/10" },
  badge_earned:      { label: "Badge obtenu",        emoji: "🏅", color: "text-yellow-500",   bg: "bg-yellow-500/10" },
  streak_milestone:  { label: "Streak milestone",    emoji: "🔥", color: "text-orange-500",   bg: "bg-orange-500/10" },
  challenge_joined:  { label: "Défi accepté",        emoji: "🎯", color: "text-purple-500",   bg: "bg-purple-500/10" },
  added:             { label: "Ajouté",              emoji: "➕", color: "text-teal-500",     bg: "bg-teal-500/10" },
  status_changed:    { label: "Statut modifié",      emoji: "🔄", color: "text-slate-400",    bg: "bg-slate-400/10" },
  playlist_added:    { label: "Ajouté à playlist",   emoji: "🎵", color: "text-pink-500",     bg: "bg-pink-500/10" },
};

const TYPE_ICON = { book: BookOpen, podcast: Headphones, video: Play, article: FileText };

function timeAgo(dateStr) {
  try {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    return format(new Date(dateStr), "d MMM", { locale: fr });
  } catch { return ""; }
}

export default function ActivityFeed({ activities, contents = [] }) {
  const enriched = (activities || []).slice(0, 10).map(a => {
    const content = a.content_id ? contents.find(c => c.id === a.content_id) : null;
    return { ...a, _content: content };
  });

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold">Activité récente</h3>
        {enriched.length > 0 && (
          <Link to={createPageUrl("Library")} className="text-xs text-accent hover:underline">Voir tout →</Link>
        )}
      </div>

      {enriched.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">Aucune activité encore.</p>
          <p className="text-xs mt-1">Commencez à lire ou écouter pour voir votre historique ici.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {enriched.map((activity, i) => {
            const config = ACTION_CONFIG[activity.action] || ACTION_CONFIG.progress;
            const Icon = TYPE_ICON[activity.content_type] || BookOpen;
            const cover = activity._content?.cover_url;
            const contentId = activity._content?.id || activity.content_id;
            return (
              <div key={activity.id || i} className="flex items-center gap-3 py-1.5 border-b border-border/50 last:border-0">
                {/* Emoji action badge */}
                <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center shrink-0 text-base`}>
                  {config.emoji}
                </div>
                {/* Cover thumbnail if available */}
                {cover && (
                  <div className="w-7 h-10 rounded overflow-hidden shrink-0 border border-border">
                    <img src={cover} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-snug">
                    <span className={`font-semibold ${config.color}`}>{config.label}</span>
                    {activity.content_title && (
                      contentId
                        ? <Link to={createPageUrl("ContentDetail") + `?id=${contentId}`} className="text-foreground hover:text-accent"> « {activity.content_title} »</Link>
                        : <span className="text-foreground"> « {activity.content_title} »</span>
                    )}
                    {!activity.content_title && activity.details && (
                      <span className="text-muted-foreground"> {activity.details}</span>
                    )}
                  </p>
                  {activity.details && activity.content_title && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{activity.details}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  {activity.kp_earned > 0 && (
                    <span className="text-[10px] text-accent font-bold">+{activity.kp_earned} KP</span>
                  )}
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{timeAgo(activity.created_date)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}