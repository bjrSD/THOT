import React from "react";
import { Star } from "lucide-react";

export default function CommunityReviews({ liveReviews, communityAvg }) {
  const withText = liveReviews.filter(c => c.community_review);

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-400" /> Notes & Avis THOT
      </h2>
      <div className="space-y-4">
        {/* Score moyen + distribution */}
        <div className="flex gap-4 items-stretch">
          <div className="flex flex-col items-center justify-center bg-secondary/50 rounded-xl px-5 py-4 shrink-0">
            <p className="text-4xl font-bold">{communityAvg ? communityAvg.toFixed(1) : "—"}</p>
            <div className="flex gap-0.5 mt-1">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-3.5 h-3.5 ${communityAvg && communityAvg >= s ? "fill-yellow-400 text-yellow-400" : "text-border"}`} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{liveReviews.length} avis</p>
          </div>
          <div className="flex-1 space-y-1.5 justify-center flex flex-col">
            {[5,4,3,2,1].map(star => {
              const count = liveReviews.filter(c => Math.round(c.rating) === star).length;
              const pct = liveReviews.length > 0 ? Math.round((count / liveReviews.length) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-right text-muted-foreground shrink-0">{star}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 shrink-0" />
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-4 text-right text-muted-foreground shrink-0">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Avis textuels */}
        {withText.length > 0 ? (
          <div className="space-y-3 pt-2 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {withText.length} avis rédigé{withText.length > 1 ? "s" : ""}
            </p>
            {withText.map((c, i) => (
              <div key={i} className="bg-secondary/40 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-xs font-bold shrink-0">
                    {(c.created_by?.split("@")[0] || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{c.created_by?.split("@")[0]}</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-3 h-3 ${c.rating >= s ? "fill-yellow-400 text-yellow-400" : "text-border"}`} />
                      ))}
                    </div>
                  </div>
                  {c.updated_date && (
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(c.updated_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">"{c.community_review}"</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-3 border-t border-border pt-4">
            💬 Soyez le premier à laisser un avis — allez dans "Mon Suivi" !
          </p>
        )}
      </div>
    </div>
  );
}