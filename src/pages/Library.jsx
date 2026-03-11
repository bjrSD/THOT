import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext } from "@hello-pangea/dnd";
import { Loader2, BookOpen, Headphones, Play, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import KanbanColumn from "@/components/library/KanbanColumn";

const STATUSES = ["to_consume", "in_progress", "paused", "to_review", "completed"];
const TYPES = [
  { value: "all", label: "Tous" },
  { value: "book", label: "Livres", icon: BookOpen },
  { value: "podcast", label: "Podcasts", icon: Headphones },
  { value: "video", label: "Vidéos", icon: Play },
  { value: "article", label: "Articles", icon: FileText },
];

export default function Library() {
  const [typeFilter, setTypeFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: contents = [], isLoading } = useQuery({
    queryKey: ["contents"],
    queryFn: () => base44.entities.Content.list("-updated_date", 200),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Content.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contents"] }),
  });

  const filtered = typeFilter === "all" ? contents : contents.filter(c => c.type === typeFilter);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    
    const content = contents.find(c => c.id === draggableId);
    if (!content || content.status === newStatus) return;

    const updateData = { status: newStatus };
    if (newStatus === "completed" && !content.completed_date) {
      updateData.completed_date = new Date().toISOString().split("T")[0];
    }
    updateMutation.mutate({ id: draggableId, data: updateData });
  };

  const handleCardClick = (content) => {
    window.location.href = createPageUrl("ContentDetail") + `?id=${content.id}`;
  };

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
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Ma Bibliothèque</h1>
        <p className="text-muted-foreground mt-1">Glissez-déposez pour organiser vos contenus</p>
      </div>

      {/* Type filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TYPES.map((t) => (
          <Button
            key={t.value}
            variant={typeFilter === t.value ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter(t.value)}
            className="shrink-0"
          >
            {t.icon && <t.icon className="w-4 h-4 mr-1.5" />}
            {t.label}
          </Button>
        ))}
      </div>

      {/* Kanban board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 lg:overflow-visible">
          {STATUSES.map(status => (
            <KanbanColumn
              key={status}
              status={status}
              contents={filtered.filter(c => c.status === status)}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}