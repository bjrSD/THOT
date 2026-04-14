import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const TYPE_ICONS = {
  badge_earned: "🏅",
  new_message: "💬",
  new_follower: "👤",
  duel_invite: "⚔️",
  challenge_completed: "🏆",
  friend_activity: "📚",
};

export default function NotificationBell({ fixed = false }) {
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const ref = useRef(null);
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => setUserEmail(u?.email));
  }, []);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", userEmail],
    queryFn: () => base44.entities.Notification.filter({ recipient_email: userEmail }, "-created_date", 20),
    enabled: !!userEmail,
    refetchInterval: 30000,
  });

  const unread = notifications.filter(n => !n.is_read);

  const markRead = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", userEmail] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", userEmail] }),
  });

  if (!userEmail) return null;

  const wrapperClass = fixed
    ? "fixed bottom-6 right-24 z-50"
    : "relative";

  return (
    <div className={wrapperClass} ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={fixed
          ? "w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center"
          : "relative p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        }
      >
        <Bell className="w-5 h-5" />
        {unread.length > 0 && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
          >
            {unread.length > 9 ? "9+" : unread.length}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className={`absolute w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden ${fixed ? "bottom-16 right-0" : "right-0 top-12"}`}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unread.length > 0 && (
                <button onClick={() => markAllRead.mutate()} className="text-xs text-accent hover:underline">
                  Tout marquer lu
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Aucune notification
                </div>
              )}
              {notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => { if (!n.is_read) markRead.mutate(n.id); setOpen(false); }}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors cursor-pointer border-b border-border/50 last:border-0 ${!n.is_read ? "bg-accent/5" : ""}`}
                >
                  <span className="text-xl mt-0.5 shrink-0">{TYPE_ICONS[n.type] || "🔔"}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.is_read ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                    {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {new Date(n.created_date).toLocaleDateString("fr", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {!n.is_read && <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />}
                </div>
              ))}
            </div>

            <div className="px-4 py-2.5 border-t border-border">
              <Link to="/Messages" onClick={() => setOpen(false)} className="text-xs text-accent hover:underline block text-center">
                Voir tous les messages →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}