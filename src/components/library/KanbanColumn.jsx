import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import ContentCard from "./ContentCard";
import { STATUS_LABELS } from "../shared/KPUtils";

export default function KanbanColumn({ status, contents, onCardClick }) {
  const statusColors = {
    to_consume: "bg-blue-500",
    in_progress: "bg-accent",
    paused: "bg-yellow-500",
    to_review: "bg-purple-500",
    completed: "bg-green-500",
  };

  return (
    <div className="flex-shrink-0 w-72 lg:w-auto lg:flex-1">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={`w-2.5 h-2.5 rounded-full ${statusColors[status]}`} />
        <h3 className="font-heading font-semibold text-sm">{STATUS_LABELS[status]}</h3>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
          {contents.length}
        </span>
      </div>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-3 min-h-[200px] p-2 rounded-xl transition-colors ${
              snapshot.isDraggingOver ? "bg-accent/5 border-2 border-dashed border-accent/30" : "bg-secondary/30"
            }`}
          >
            {contents.map((content, index) => (
              <Draggable key={content.id} draggableId={content.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={snapshot.isDragging ? "opacity-80 rotate-2" : ""}
                  >
                    <ContentCard content={content} onClick={() => onCardClick(content)} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}