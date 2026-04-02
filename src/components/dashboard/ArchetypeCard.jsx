import React from "react";
import { detectArchetype } from "@/components/shared/ArchetypeUtils";

/**
 * Affiche le profil intellectuel principal (et secondaire) de l'utilisateur,
 * déduit depuis sa bibliothèque de contenus.
 * Conçu pour s'intégrer sans modifier le design actuel.
 */
export default function ArchetypeCard({ contents = [] }) {
  const { primary, secondary } = detectArchetype(contents);

  return (
    <div className={`rounded-xl border p-4 ${primary.bg} ${primary.border}`}>
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Profil intellectuel</p>

      {/* Profil principal */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{primary.icon}</span>
        <div>
          <p className={`font-heading text-lg font-bold ${primary.color}`}>{primary.name}</p>
          <p className="text-xs text-muted-foreground italic">{primary.shortDesc}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{primary.fullDesc}</p>

      {/* Tendance secondaire */}
      {secondary && (
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          <span className="text-sm">{secondary.icon}</span>
          <div>
            <p className="text-xs font-medium">Tendance secondaire : <span className={secondary.color}>{secondary.name}</span></p>
            <p className="text-xs text-muted-foreground">{secondary.secondaryTrait}</p>
          </div>
        </div>
      )}

      {/* Conseil */}
      <div className="mt-3 bg-card/60 rounded-lg px-3 py-2 border border-border/40">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">💡 Conseil :</span> {primary.tip}
        </p>
      </div>
    </div>
  );
}