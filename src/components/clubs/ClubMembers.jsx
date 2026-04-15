import React, { useState } from "react";
import { Crown, Flame, Shield, ChevronDown, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const ROLE_CONFIG = {
  admin: { label: "Admin", color: "text-yellow-600 bg-yellow-500/10 border-yellow-500/20", icon: "🛡️" },
  moderateur: { label: "Modérateur", color: "text-blue-600 bg-blue-500/10 border-blue-500/20", icon: "🔵" },
  member: { label: "Membre", color: "text-green-600 bg-green-500/10 border-green-500/20", icon: "✓" },
};

function MemberRow({ member, canPromote, currentUserRole }) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const promoteMutation = useMutation({
    mutationFn: (newRole) => base44.entities.ClubMember.update(member.id, { role: newRole }),
    onSuccess: (_, newRole) => {
      qc.invalidateQueries({ queryKey: ["club-members"] });
      qc.invalidateQueries({ queryKey: ["my-memberships"] });
      setOpen(false);
      toast.success(`Rôle mis à jour : ${ROLE_CONFIG[newRole]?.label}`);
    },
  });

  const roleInfo = ROLE_CONFIG[member.role] || ROLE_CONFIG.member;

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-sm shrink-0">
        {(member.created_by || member.club_name || "M")[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{member.created_by || "Membre"}</p>
        <p className="text-xs text-muted-foreground">{new Date(member.created_date).toLocaleDateString("fr-FR")}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleInfo.color}`}>
          {roleInfo.icon} {roleInfo.label}
        </span>
        {canPromote && member.role !== "admin" && (
          <div className="relative">
            <button onClick={() => setOpen(!open)}
              className="text-xs text-muted-foreground hover:text-foreground p-1 rounded hover:bg-secondary transition-colors">
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {open && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-xl z-20 py-1 w-40 text-xs">
                  {member.role !== "moderateur" && (
                    <button onClick={() => promoteMutation.mutate("moderateur")} disabled={promoteMutation.isPending}
                      className="w-full text-left px-3 py-2 hover:bg-secondary transition-colors flex items-center gap-2">
                      🔵 Promouvoir modérateur
                    </button>
                  )}
                  {member.role === "moderateur" && (
                    <button onClick={() => promoteMutation.mutate("member")} disabled={promoteMutation.isPending}
                      className="w-full text-left px-3 py-2 hover:bg-secondary transition-colors flex items-center gap-2">
                      ✓ Rétrograder membre
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClubMembers({ members, topMembers, isAdmin, isModerator }) {
  const canPromote = isAdmin || isModerator;

  // Show DB members if available, else show static top_members
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

      {/* Role legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
          <span key={key} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
            {cfg.icon} {cfg.label}
          </span>
        ))}
      </div>

      {hasDbMembers ? (
        <div className="bg-card border border-border rounded-2xl p-4">
          {members.map((m, i) => (
            <MemberRow key={m.id || i} member={m} canPromote={canPromote} />
          ))}
        </div>
      ) : topMembers?.length > 0 ? (
        <div className="space-y-2">
          {topMembers.map((member, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 hover:shadow-sm transition-all hover:border-accent/30">
              {member.photo
                ? <img src={member.photo} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
                : <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-lg">{member.name[0]}</div>
              }
              <div className="flex-1">
                <p className="font-semibold">{member.name}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span><Flame className="w-3 h-3 text-orange-500 inline" /> {member.streak}j streak</span>
                  <span className="text-accent font-medium">{member.kp?.toLocaleString()} KP</span>
                </div>
              </div>
              {i === 0 && <Crown className="w-5 h-5 text-yellow-500 shrink-0" />}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8 text-sm">Aucun membre visible.</p>
      )}
    </div>
  );
}