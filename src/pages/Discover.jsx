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
  // 📚 Business & Entrepreneurship
  { title: "The Lean Startup", author: "Eric Ries", type: "book", category: "business", summary: "Méthode pour créer des entreprises agiles et innovantes.", total_pages: 336 },
  { title: "Zero to One", author: "Peter Thiel", type: "book", category: "business", summary: "Notes sur les startups ou comment construire le futur.", total_pages: 224 },
  { title: "Good to Great", author: "Jim Collins", type: "book", category: "business", summary: "Comment les entreprises se transforment en leaders durables.", total_pages: 300 },
  { title: "The E-Myth Revisited", author: "Michael Gerber", type: "book", category: "business", summary: "Pourquoi la plupart des petites entreprises échouent.", total_pages: 400 },
  { title: "Crushing It!", author: "Gary Vaynerchuk", type: "book", category: "business", summary: "Construire votre marque personnelle à l'ère numérique.", total_pages: 256 },
  { title: "The Hard Thing About Hard Things", author: "Ben Horowitz", type: "book", category: "business", summary: "Construire une entreprise quand tout va mal.", total_pages: 400 },
  { title: "Platform Revolution", author: "Geoffrey Parker", type: "book", category: "business", summary: "Comment les plateformes transforment le business.", total_pages: 320 },
  { title: "The $100 Startup", author: "Chris Guillebeau", type: "book", category: "business", summary: "Lancer un projet avec des ressources minimales.", total_pages: 320 },
  { title: "Shark Tank Podcast", author: "Mark Cuban", type: "podcast", category: "business", summary: "Interviews avec les plus grands entrepreneurs.", total_duration: 60 },
  { title: "Masters of Scale", author: "Reid Hoffman", type: "podcast", category: "business", summary: "Comment les startups deviennent des géants.", total_duration: 90 },
  { title: "How I Built This", author: "Guy Raz", type: "podcast", category: "business", summary: "Histoires de création des plus grandes marques.", total_duration: 60 },
  { title: "The Tim Ferriss Show", author: "Tim Ferriss", type: "podcast", category: "business", summary: "Interviews avec les investisseurs et entrepreneurs.", total_duration: 120 },
  
  // 🧠 Psychologie & Développement Personnel
  { title: "Atomic Habits", author: "James Clear", type: "book", category: "psychologie", summary: "Comment construire de bonnes habitudes et les conserver.", total_pages: 320 },
  { title: "Thinking Fast and Slow", author: "Daniel Kahneman", type: "book", category: "psychologie", summary: "Les deux systèmes de pensée et nos biais cognitifs.", total_pages: 499 },
  { title: "Deep Work", author: "Cal Newport", type: "book", category: "psychologie", summary: "Comment se concentrer dans un monde distrait.", total_pages: 296 },
  { title: "Mindset", author: "Carol Dweck", type: "book", category: "psychologie", summary: "Transformer votre potentiel par votre mentalité.", total_pages: 276 },
  { title: "The Power of Now", author: "Eckhart Tolle", type: "book", category: "psychologie", summary: "Libérez-vous du passé et futur pour vivre le présent.", total_pages: 280 },
  { title: "Emotional Intelligence", author: "Daniel Goleman", type: "book", category: "psychologie", summary: "Pourquoi l'intelligence émotionnelle surpasse le QI.", total_pages: 352 },
  { title: "Man's Search for Meaning", author: "Viktor Frankl", type: "book", category: "psychologie", summary: "Trouver du sens même dans les pires circonstances.", total_pages: 184 },
  { title: "The 7 Habits of Highly Effective People", author: "Stephen Covey", type: "book", category: "psychologie", summary: "Les habitudes qui transforment la vie personnelle et professionnelle.", total_pages: 432 },
  { title: "Huberman Lab Podcast", author: "Andrew Huberman", type: "podcast", category: "psychologie", summary: "Neurosciences et optimisation des performances humaines.", total_duration: 120 },
  { title: "The Podcast with James O'Brien", author: "James O'Brien", type: "podcast", category: "psychologie", summary: "Discussions profondes sur la psychologie et la vie.", total_duration: 90 },
  { title: "Ten Percent Happier", author: "Dan Harris", type: "podcast", category: "psychologie", summary: "Méditation et bien-être mental.", total_duration: 45 },
  { title: "The Happiness Lab", author: "Laurie Santos", type: "podcast", category: "psychologie", summary: "Science du bonheur et bien-être.", total_duration: 45 },

  // 📖 Histoire & Philosophie
  { title: "Sapiens", author: "Yuval Noah Harari", type: "book", category: "histoire", summary: "Une brève histoire de l'humanité et son avenir.", total_pages: 443 },
  { title: "The Art of War", author: "Sun Tzu", type: "book", category: "philosophie", summary: "Traité stratégique millénaire toujours pertinent.", total_pages: 112 },
  { title: "Meditations", author: "Marcus Aurelius", type: "book", category: "philosophie", summary: "Pensées personnelles d'un empereur stoïcien.", total_pages: 256 },
  { title: "Homo Deus", author: "Yuval Noah Harari", type: "book", category: "histoire", summary: "L'avenir de l'humanité au XXIe siècle.", total_pages: 528 },
  { title: "Guns, Germs, and Steel", author: "Jared Diamond", type: "book", category: "histoire", summary: "Comment la géographie a façonné les civilisations.", total_pages: 544 },
  { title: "A Brief History of Time", author: "Stephen Hawking", type: "book", category: "science", summary: "L'univers expliqué par un des plus grands physiciens.", total_pages: 256 },
  { title: "The Republic", author: "Plato", type: "book", category: "philosophie", summary: "Un dialogue fondateur sur la justice et l'État idéal.", total_pages: 400 },
  { title: "Critique of Pure Reason", author: "Immanuel Kant", type: "book", category: "philosophie", summary: "La nature de la connaissance et de la réalité.", total_pages: 680 },
  { title: "Hardcore History", author: "Dan Carlin", type: "podcast", category: "histoire", summary: "Histoire racontée de manière épique et captivante.", total_duration: 300 },
  { title: "Our Fake History", author: "Sebastian Major", type: "podcast", category: "histoire", summary: "Démêler les mythes et la vérité historique.", total_duration: 120 },
  { title: "History Hit", author: "Various", type: "podcast", category: "histoire", summary: "Histoires intrigantes du passé.", total_duration: 60 },
  { title: "Philosophy Bites", author: "Nigel Warburton", type: "podcast", category: "philosophie", summary: "Grandes idées philosophiques en 15 minutes.", total_duration: 15 },

  // 🔬 Science & Technologie
  { title: "The Innovators", author: "Walter Isaacson", type: "book", category: "technologie", summary: "L'histoire des créateurs de l'ère informatique.", total_pages: 544 },
  { title: "A Brief History of Time", author: "Stephen Hawking", type: "book", category: "science", summary: "L'univers expliqué simplement par un génie.", total_pages: 256 },
  { title: "The Selfish Gene", author: "Richard Dawkins", type: "book", category: "science", summary: "Comment les gènes façonnent l'évolution et la vie.", total_pages: 256 },
  { title: "Astrophysics for People in a Hurry", author: "Neil deGrasse Tyson", type: "book", category: "science", summary: "L'univers expliqué en 200 pages par un astrophysicien.", total_pages: 240 },
  { title: "The Code Breaker", author: "Walter Isaacson", type: "book", category: "science", summary: "La vie de Jennifer Doudna et la révolution CRISPR.", total_pages: 560 },
  { title: "Lex Fridman Podcast", author: "Lex Fridman", type: "podcast", category: "technologie", summary: "Conversations profondes sur l'IA, la science et la vie.", total_duration: 180 },
  { title: "StarTalk", author: "Neil deGrasse Tyson", type: "podcast", category: "science", summary: "Astrophysique et science expliquées au grand public.", total_duration: 60 },
  { title: "The Adam Savage Project", author: "Adam Savage", type: "podcast", category: "technologie", summary: "Technologie, innovation et curiosité scientifique.", total_duration: 90 },
  { title: "Stuff You Should Know", author: "Josh Clark & Chuck Bryan", type: "podcast", category: "science", summary: "Explications des phénomènes du monde.", total_duration: 90 },
  { title: "TED Talks", author: "Various", type: "video", category: "science", summary: "Les meilleures idées du monde en 18 minutes.", total_duration: 18 },
  { title: "Veritasium", author: "Derek Muller", type: "video", category: "science", summary: "Vidéos scientifiques fascinantes et bien expliquées.", total_duration: 20 },
  { title: "Kurzgesagt", author: "Kurzgesagt Team", type: "video", category: "science", summary: "Expliquer des concepts complexes avec animation.", total_duration: 12 },

  // 💪 Santé & Bien-être
  { title: "Why We Sleep", author: "Matthew Walker", type: "book", category: "sante", summary: "Le sommeil et son importance cruciale pour la santé.", total_pages: 496 },
  { title: "Sapiens", author: "Yuval Noah Harari", type: "book", category: "sante", summary: "Comprendre la santé au travers de notre évolution.", total_pages: 443 },
  { title: "The Obesity Code", author: "Jason Fung", type: "book", category: "sante", summary: "Comprendre et résoudre l'obésité avec la science.", total_pages: 384 },
  { title: "Breath", author: "James Nestor", type: "book", category: "sante", summary: "Le pouvoir transformateur de la respiration.", total_pages: 480 },
  { title: "The Body Keeps the Score", author: "Bessel van der Kolk", type: "book", category: "sante", summary: "Trauma, mémoire corporelle et guérison.", total_pages: 464 },
  { title: "Huberman Lab", author: "Andrew Huberman", type: "podcast", category: "sante", summary: "Optimiser le corps et l'esprit par la neuroscience.", total_duration: 120 },
  { title: "Rich Roll Podcast", author: "Rich Roll", type: "podcast", category: "sante", summary: "Santé, nutrition et bien-être holistique.", total_duration: 120 },
  { title: "The Model Health Show", author: "Shawn Stevenson", type: "podcast", category: "sante", summary: "Sommeil, nutrition et optimisation de la santé.", total_duration: 60 },
  { title: "Wait But Why", author: "Tim Urban", type: "article", category: "science", summary: "Articles longs et illustrés sur des sujets complexes.", cover_url: "" },
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

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun contenu trouvé pour ce filtre.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, i) => {
          const Icon = TYPE_ICON_MAP[item.type] || BookOpen;
          const isAdded = existingTitles.has(item.title) || addedIds.has(item.title);
          return (
            <motion.div key={item.title + i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-14 rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm leading-tight">{item.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.author}</p>
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        <span className="text-xs bg-secondary px-1.5 py-0.5 rounded">{TYPE_LABELS[item.type]}</span>
                        <span className="text-xs bg-secondary px-1.5 py-0.5 rounded">{CATEGORY_LABELS[item.category]}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground flex-1 mb-4 leading-relaxed line-clamp-2">{item.summary}</p>
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
                      <><Plus className="w-3.5 h-3.5 mr-1.5" /> Ajouter</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filtered.length > 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">Affichage de {filtered.length} contenu{filtered.length !== 1 ? "s" : ""}</p>
        </div>
      )}
    </div>
  );
}