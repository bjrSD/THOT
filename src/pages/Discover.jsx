import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, Headphones, Play, FileText, Plus, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TYPE_LABELS, CATEGORY_LABELS } from "@/components/shared/KPUtils";
import GoogleBooksSearch from "@/components/shared/GoogleBooksSearch";

const TYPE_ICON_MAP = { book: BookOpen, podcast: Headphones, video: Play, article: FileText };

const CURATED = [
  { title: "Sapiens", author: "Yuval Noah Harari", type: "book", category: "histoire", summary: "Une brève histoire de l'humanité.", total_pages: 443 },
  { title: "Atomic Habits", author: "James Clear", type: "book", category: "psychologie", summary: "Comment construire de bonnes habitudes.", total_pages: 320 },
  { title: "Lex Fridman Podcast", author: "Lex Fridman", type: "podcast", category: "technologie", summary: "Conversations profondes sur la science, l'IA et la société.", total_duration: 180 },
  { title: "Thinking Fast and Slow", author: "Daniel Kahneman", type: "book", category: "psychologie", summary: "Les deux systèmes de pensée.", total_pages: 499 },
  { title: "The Art of War", author: "Sun Tzu", type: "book", category: "philosophie", summary: "Traité stratégique millénaire.", total_pages: 112 },
  { title: "Huberman Lab", author: "Andrew Huberman", type: "podcast", category: "sante", summary: "Neurosciences et optimisation des performances.", total_duration: 120 },
  { title: "The Great Courses", author: "Various", type: "video", category: "science", summary: "Cours universitaires de haute qualité.", total_duration: 240 },
  { title: "The Lean Startup", author: "Eric Ries", type: "book", category: "business", summary: "Méthode pour créer des entreprises agiles.", total_pages: 336 },
  { title: "Wait But Why", author: "Tim Urban", type: "article", category: "science", summary: "Articles longs et illustrés sur des sujets complexes." },
  { title: "Meditations", author: "Marcus Aurelius", type: "book", category: "philosophie", summary: "Pensées personnelles d'un empereur stoïcien.", total_pages: 256 },
  { title: "Hardcore History", author: "Dan Carlin", type: "podcast", category: "histoire", summary: "Histoire racontée de manière épique.", total_duration: 300 },
  { title: "Zero to One", author: "Peter Thiel", type: "book", category: "business", summary: "Notes sur les startups ou comment construire le futur.", total_pages: 224 },
];

const FILTER_TYPES = [
  { value: "all", label: "Tous" },
  { value: "book", label: "Livres", icon: BookOpen },
  { value: "podcast", label: "Podcasts", icon: Headphones },
  { value: "video", label: "Vidéos", icon: Play },
  { value: "article", label: "Articles", icon: FileText },
];

export default function Discover() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchResults, setSearchResults] = useState([]);
  const [addedIds, setAddedIds] = useState(new Set());
  const queryClient = useQueryClient();

  const { data: existingContents = [] } = useQuery({
    queryKey: ["contents"],
    queryFn: () => base44.entities.Content.list("-updated_date", 200),
  });

  const addMutation = useMutation({
    mutationFn: (item) => base44.entities.Content.create({ ...item, status: "to_consume" }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      setAddedIds(prev => new Set([...prev, variables.title]));
    },
  });

  const existingTitles = new Set(existingContents.map(c => c.title));

  const handleSelectBook = (book) => {
    setSearchResults(prev => {
      const exists = prev.some(b => b.googleId === book.googleId);
      return exists ? prev : [book, ...prev];
    });
  };

  const filtered = (searchResults.length > 0 ? searchResults : CURATED).filter(item => {
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesType;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Découvrir</h1>
        <p className="text-muted-foreground mt-1">Explorez des contenus recommandés par la communauté</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <GoogleBooksSearch onSelect={handleSelectBook} />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {FILTER_TYPES.map(t => (
            <Button key={t.value} variant={typeFilter === t.value ? "default" : "outline"} size="sm" onClick={() => setTypeFilter(t.value)} className="shrink-0">
              {t.icon && <t.icon className="w-3.5 h-3.5 mr-1.5" />}
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, i) => {
          const Icon = TYPE_ICON_MAP[item.type] || BookOpen;
          const isAdded = existingTitles.has(item.title) || addedIds.has(item.title);
          return (
            <motion.div key={item.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-14 rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm leading-tight">{item.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.author}</p>
                      <div className="flex gap-1.5 mt-1.5">
                        <span className="text-xs bg-secondary px-1.5 py-0.5 rounded">{TYPE_LABELS[item.type]}</span>
                        <span className="text-xs bg-secondary px-1.5 py-0.5 rounded">{CATEGORY_LABELS[item.category]}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground flex-1 mb-4 leading-relaxed">{item.summary}</p>
                  <Button
                    size="sm"
                    variant={isAdded ? "secondary" : "default"}
                    className="w-full"
                    disabled={isAdded || addMutation.isPending}
                    onClick={() => addMutation.mutate(item)}
                  >
                    {isAdded ? (
                      <><Check className="w-3.5 h-3.5 mr-1.5" /> Ajouté</>
                    ) : addMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <><Plus className="w-3.5 h-3.5 mr-1.5" /> Ajouter à ma liste</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}