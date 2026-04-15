import React from "react";
import { BookOpen, Headphones, Play, FileText } from "lucide-react";

const TYPE_ICON = { book: BookOpen, podcast: Headphones, video: Play, article: FileText };
const TYPE_COLOR = { book: "text-blue-500", podcast: "text-purple-500", video: "text-red-500", article: "text-green-500" };

export default function TopAuthors({ contents = [] }) {
  // Aggregate by author
  const authorMap = {};
  contents.forEach(c => {
    const author = c.author?.trim();
    if (!author) return;
    if (!authorMap[author]) {
      authorMap[author] = { name: author, count: 0, types: new Set(), pages: 0, minutes: 0, cover: null };
    }
    authorMap[author].count++;
    authorMap[author].types.add(c.type);
    authorMap[author].pages += c.total_pages || 0;
    authorMap[author].minutes += c.total_duration || 0;
    if (!authorMap[author].cover && c.cover_url) authorMap[author].cover = c.cover_url;
  });

  const top = Object.values(authorMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  if (top.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-heading font-semibold mb-4 text-sm">Auteurs & créateurs favoris</h3>
      <div className="space-y-2">
        {top.map((author, i) => {
          const primaryType = [...author.types][0] || "book";
          const Icon = TYPE_ICON[primaryType] || BookOpen;
          const color = TYPE_COLOR[primaryType];
          return (
            <div key={author.name} className="flex items-center gap-3 py-1">
              <span className="text-xs text-muted-foreground font-bold w-4 shrink-0">{i + 1}</span>
              {author.cover ? (
                <img src={author.cover} alt={author.name} className="w-8 h-10 rounded object-cover shrink-0 border border-border" />
              ) : (
                <div className="w-8 h-10 rounded bg-secondary flex items-center justify-center shrink-0 border border-border">
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{author.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {author.count} contenu{author.count > 1 ? "s" : ""}
                  {author.pages > 0 && ` · ${author.pages.toLocaleString()} pages`}
                  {author.minutes > 0 && !author.pages && ` · ${author.minutes} min`}
                </p>
              </div>
              <div className="flex gap-0.5 shrink-0">
                {[...author.types].slice(0, 2).map(t => {
                  const TIcon = TYPE_ICON[t] || FileText;
                  return <TIcon key={t} className={`w-3 h-3 ${TYPE_COLOR[t]}`} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}