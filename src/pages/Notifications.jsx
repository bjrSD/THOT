import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, Trash2, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";

const TYPE_ICONS = {
  badge_earned: "🏅",
  new_message: "💬",
  new_follower: "👤",
  duel_invite: "⚔️",
  challenge_completed: "🏆",
  friend_activity: "📚",
};

const TYPE_LABELS = {
  badge_earned: "Badge",
  new_message: "Message",
  new_follower: "Abonné",
  duel_invite: "Duel",
  challenge_completed: "Défi",
  friend_activity: "Activité",
};

export default function Notifications() {
  const [userEmail, setUserEmail] = useState(null);
  const [filter, setFilter] = useState("all"); // "all" | "unread"
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => setUserEmail(u?.email));
  }, []);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications-page", userEmail],
    queryFn: () => base44.entities.Notification.filter({ recipient_email: userEmail }, "-created_date", 100),
    enabled: !!userEmail,
    refetchInterval: 15000,
  });

  const markRead = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications-page", userEmail] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications-page", userEmail] });
      qc.invalidateQueries({ queryKey: ["notifications", userEmail] });
    },
  });

  const deleteNotif = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications-page", userEmail] }),
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const filtered = filter === "unread" ? notifications.filter(n => !n.is_read) : notifications;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Bell className="w-7 h-7 text-accent" />
            Notifications
            {unreadCount > 0 && (
              <span className="text-sm bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">
                {unreadCount} nouvelles
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Historique de toutes vos notifications</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="gap-2" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
            <CheckCheck className="w-4 h-4" /> Tout marquer lu
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <button onClick={() => setFilter("all")}
          className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-full font-medium transition-colors border ${filter === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border hover:border-accent/40"}`}>
          Toutes ({notifications.length})
        </button>
        <button onClick={() => setFilter("unread")}
          className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-full font-medium transition-colors border ${filter === "unread" ? "bg-accent text-white border-accent" : "bg-secondary border-border hover:border-accent/40"}`}>
          Non lues ({unreadCount})
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">
            {filter === "unread" ? "Aucune notification non lue 🎉" : "Aucune notification pour l'instant"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.02 }}
                className={`group relative bg-card rounded-2xl border transition-all hover:shadow-sm ${
                  !n.is_read
                    ? "border-accent/30 bg-accent/5 shadow-sm ring-1 ring-accent/10"
                    : "border-border"
                }`}
              >
                {/* Unread indicator stripe */}
                {!n.is_read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-l-2xl" />
                )}

                <div className="flex items-start gap-4 p-4 pl-5">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg ${
                    !n.is_read ? "bg-accent/15" : "bg-secondary"
                  }`}>
                    {TYPE_ICONS[n.type] || "🔔"}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <p className={`text-sm leading-snug flex-1 ${!n.is_read ? "font-semibold" : "font-medium"}`}>
                        {n.title}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                        !n.is_read ? "bg-accent/15 text-accent" : "bg-secondary text-muted-foreground"
                      }`}>
                        {TYPE_LABELS[n.type] || "Notification"}
                      </span>
                    </div>
                    {n.body && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                    )}
                    <p className="text-xs text-muted-foreground/60 mt-1.5">
                      {n.created_date && format(new Date(n.created_date), "d MMM yyyy à HH:mm", { locale: fr })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {!n.is_read && (
                      <button onClick={() => markRead.mutate(n.id)}
                        className="p-1.5 rounded-lg hover:bg-accent/10 text-accent transition-colors" title="Marquer comme lu">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => deleteNotif.mutate(n.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Supprimer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Unread dot */}
                  {!n.is_read && (
                    <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1" />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}