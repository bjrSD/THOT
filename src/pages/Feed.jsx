import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, Headphones, Play, FileText, Trophy, Flame, Heart, MessageCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const TYPE_ICON = { book: BookOpen, podcast: Headphones, video: Play, article: FileText };
const ACTION_LABEL = {
  started: "a commencé",
  progress: "progresse dans",
  completed: "a terminé ✅",
  badge_earned: "a gagné un badge 🏅",
  streak_milestone: "a atteint un streak 🔥",
  challenge_joined: "a rejoint un défi 🏆",
};

export default function Feed() {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities-feed"],
    queryFn: () => base44.entities.Activity.filter({ is_public: true }, "-created_date", 50),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Feed</h1>
        <p className="text-muted-foreground mt-1">Activités de la communauté</p>
      </div>

      {activities.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📡</div>
          <p className="text-muted-foreground">Aucune activité pour le moment.</p>
          <p className="text-sm text-muted-foreground mt-1">Commencez à apprendre pour apparaître ici !</p>
        </div>
      )}

      {activities.map((activity, i) => {
        const Icon = TYPE_ICON[activity.content_type] || BookOpen;
        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                  <span className="font-bold text-sm text-primary">
                    {(activity.created_by || "?")[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.created_by?.split("@")[0]}</span>
                    {" "}
                    <span className="text-muted-foreground">{ACTION_LABEL[activity.action] || activity.action}</span>
                    {activity.content_title && <span className="font-medium"> {activity.content_title}</span>}
                  </p>
                  {activity.details && <p className="text-xs text-muted-foreground mt-0.5">{activity.details}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.created_date && format(new Date(activity.created_date), "d MMM à HH:mm", { locale: fr })}
                  </p>
                </div>
                {activity.kp_earned > 0 && (
                  <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full font-medium shrink-0">
                    +{activity.kp_earned} KP
                  </span>
                )}
              </div>
              {activity.content_type && (
                <div className="ml-13 flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2 w-fit">
                  <Icon className="w-3.5 h-3.5" />
                  {activity.content_type}
                </div>
              )}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors">
                  <Heart className="w-4 h-4" /> J'aime
                </button>
                <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors">
                  <MessageCircle className="w-4 h-4" /> Commenter
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}