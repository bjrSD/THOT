import React, { useState } from "react";
import { Crown, Flame, ChevronDown, Loader2, Users, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import UserAvatar from "@/components/shared/UserAvatar";
import UserProfileModal from "@/components/leaderboard/UserProfileModal";

const ROLE_CONFIG = {
  admin:      { label: "Admin",       color: "text-yellow-600 bg-yellow-500/10 border-yellow-500/20", icon: "🛡️" },
  moderateur: { label: "Modérateur",  color: "text-blue-600 bg-blue-500/10 border-blue-500/20",       icon: "🔵" },
  member:     { label: "Membre",      color: "text-green-600 bg-green-500/10 border-green-500/20",     icon: "✓"  },
};

const RANK_STYLES = [
  { badge: "🥇", text: "text-yellow-600", bg: "bg-yellow-500/5 border-yellow-500/20" },
  { badge: "🥈", text: "text-slate-500",  bg: "bg-slate-400/5 border-slate-400/20"  },
  { badge: "🥉", text: "text-orange-500", bg: "bg-orange-400/5 border-orange-400/20" },
];

function MemberRow({ member, canPromote, rank, onSelect }) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const roleInfo = ROLE_CONFIG[member.role] || ROLE_CONFIG.member;
  const rankStyle = rank <= 3 ? RANK_STYLES[rank - 1] : null;

  const promoteMutation = useMutation({
    mutationFn: (newRole) => base44.entities.ClubMember.update(member.id, { role: newRole }),
    onSuccess: (_, newRole) => {
      qc.invalidateQueries({ queryKey: ["club-members"] });
      qc.invalidateQueries({ queryKey: ["my-memberships"] });
      setOpen(false);
      toast.success(`Rôle mis à jour : ${ROLE_CONFIG[newRole]?.label}`);
    },
  });

  // Build user-like object for UserProfileModal
  const userObj = {
    full_name: member.created_by || "Membre",
    email: member.created_by || "",
    total_kp: member.total_kp || 0,
    current_streak: member.current_streak || 0,
    level: member.level || "Curieux 🔍",
    books: member.books || 0,
    podcasts: member.podcasts || 0,
    categories: {},
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${rankStyle ? `${rankStyle.bg}` : "bg-card border-border hover:border-accent/20"}`}
      onClick={() => onSelect(userObj)}>
      {/* Rank */}
      <div className={`w-7 text-center font-black text-sm shrink-0 ${rankStyle ? rankStyle.text : "text-muted-foreground"}`}>
        {rank <= 3 ? rankStyle.badge : `#${rank}`}
      </div>

      {/* Avatar */}
      <UserAvatar user={userObj} size="sm" />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{member.created_by || "Membre"}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {member.current_streak > 0 && <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-orange-500" /> {member.current_streak}j</span>}
          {member.total_kp > 0 && <span className="text-accent font-semibold">{member.total_kp.toLocaleString()} KP</span>}
        </div>
      </div>

      {/* Role badge */}
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${roleInfo.color}`}>
        {roleInfo.icon} {roleInfo.label}
      </span>

      {/* Promote menu */}
      {canPromote && member.role !== "admin" && (
        <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
          <button onClick={() => setOpen(!open)}
            className="text-xs text-muted-foreground hover:text-foreground p-1 rounded hover:bg-secondary transition-colors">
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-xl z-20 py-1 w-44 text-xs">
                {member.role !== "moderateur" && (
                  <button onClick={() => promoteMutation.mutate("moderateur")} disabled={promoteMutation.isPending}
                    className="w-full text-left px-3 py-2 hover:bg-secondary transition-colors">
                    🔵 Promouvoir modérateur
                  </button>
                )}
                {member.role === "moderateur" && (
                  <button onClick={() => promoteMutation.mutate("member")} disabled={promoteMutation.isPending}
                    className="w-full text-left px-3 py-2 hover:bg-secondary transition-colors">
                    ✓ Rétrograder membre
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function ClubMembers({ members, topMembers, isAdmin, isModerator }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const canPromote = isAdmin || isModerator;
  const hasDbMembers = members && members.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-accent" />
        <h3 className="font-semibold">Membres</h3>
        <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
          {hasDbMembers ? members.length : topMembers?.length || 0}
        </span>
      </div>

      <p className="text-xs text-muted-foreground">Cliquez sur un membre pour voir son profil, le suivre ou l'ajouter.</p>

      {hasDbMembers ? (
        <div className="space-y-2">
          {members.map((m, i) => (
            <MemberRow key={m.id || i} member={m} canPromote={canPromote} rank={i + 1} onSelect={setSelectedUser} />
          ))}
        </div>
      ) : topMembers?.length > 0 ? (
        <div className="space-y-2">
          {topMembers.map((member, i) => {
            const userObj = { full_name: member.name, email: member.name, total_kp: member.kp || 0, current_streak: member.streak || 0, level: "Lecteur 📖", books: 0, podcasts: 0, categories: {} };
            const rankStyle = i < 3 ? RANK_STYLES[i] : null;
            return (
              <div key={i} onClick={() => setSelectedUser(userObj)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${rankStyle ? `${rankStyle.bg}` : "bg-card border-border hover:border-accent/20"}`}>
                <div className={`w-7 text-center font-black text-sm shrink-0 ${rankStyle ? rankStyle.text : "text-muted-foreground"}`}>
                  {i < 3 ? rankStyle.badge : `#${i + 1}`}
                </div>
                {member.photo
                  ? <img src={member.photo} alt={member.name} className="w-9 h-9 rounded-full object-cover" />
                  : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold">{member.name[0]}</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{member.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-orange-500" /> {member.streak}j</span>
                    <span className="text-accent font-semibold">{member.kp?.toLocaleString()} KP</span>
                  </div>
                </div>
                {i === 0 && <Crown className="w-5 h-5 text-yellow-500 shrink-0" />}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8 text-sm">Aucun membre visible.</p>
      )}

      {selectedUser && <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
}