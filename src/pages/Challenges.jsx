import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Trophy, Users, Clock, Zap, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

export default function Challenges() {
  const queryClient = useQueryClient();

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ["challenges"],
    queryFn: () => base44.entities.Challenge.list("-created_date", 50),
  });

  const { data: userChallenges = [] } = useQuery({
    queryKey: ["user-challenges"],
    queryFn: () => base44.entities.UserChallenge.list("-created_date", 50),
  });

  const joinMutation = useMutation({
    mutationFn: (challengeId) => base44.entities.UserChallenge.create({
      challenge_id: challengeId,
      start_date: new Date().toISOString().split("T")[0],
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-challenges"] }),
  });

  const joinedIds = userChallenges.map(uc => uc.challenge_id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Challenges</h1>
        <p className="text-muted-foreground mt-1">Relevez des défis et gagnez des Knowledge Points</p>
      </div>

      {/* Active challenges */}
      {userChallenges.length > 0 && (
        <div>
          <h2 className="font-heading font-semibold text-lg mb-4">Mes défis en cours</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {userChallenges.filter(uc => !uc.is_completed).map((uc) => {
              const challenge = challenges.find(c => c.id === uc.challenge_id);
              if (!challenge) return null;
              const percent = Math.round((uc.progress / challenge.goal_value) * 100);
              return (
                <motion.div key={uc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="border-accent/20 bg-accent/5">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-2xl mb-1">{challenge.icon || "🏆"}</p>
                          <h3 className="font-heading font-bold">{challenge.title}</h3>
                        </div>
                        <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full font-medium">En cours</span>
                      </div>
                      <Progress value={percent} className="h-2 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {uc.progress} / {challenge.goal_value} {challenge.goal_unit}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available challenges */}
      <div>
        <h2 className="font-heading font-semibold text-lg mb-4">Défis disponibles</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map((challenge, i) => {
            const isJoined = joinedIds.includes(challenge.id);
            return (
              <motion.div key={challenge.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-3xl">{challenge.icon || "🏆"}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3.5 h-3.5" />
                        {challenge.participants_count || 0}
                      </div>
                    </div>
                    <h3 className="font-heading font-bold mb-1">{challenge.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-1">{challenge.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {challenge.duration_days} jours
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-accent" /> +{challenge.kp_reward} KP
                      </span>
                    </div>
                    <Button
                      variant={isJoined ? "secondary" : "default"}
                      size="sm"
                      className="w-full"
                      disabled={isJoined || joinMutation.isPending}
                      onClick={() => joinMutation.mutate(challenge.id)}
                    >
                      {isJoined ? (
                        <><CheckCircle2 className="w-4 h-4 mr-1.5" /> Rejoint</>
                      ) : (
                        "Rejoindre"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {challenges.length === 0 && (
        <div className="text-center py-16">
          <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun challenge disponible pour le moment.</p>
        </div>
      )}
    </div>
  );
}