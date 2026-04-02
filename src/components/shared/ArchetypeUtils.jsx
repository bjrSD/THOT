/**
 * THOT — Archétypes Intellectuels
 * Logique centralisée pour les profils utilisateurs.
 * À utiliser partout : dashboard, onboarding, recommandations, rapports.
 */

export const ARCHETYPES = [
  {
    id: "generaliste",
    name: "Le Généraliste",
    icon: "🌐",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    shortDesc: "Curieux de tout, maître en rien — et c'est une force.",
    fullDesc: "Vous absorbez des savoirs variés dans de nombreux domaines. Votre force : relier des idées que les spécialistes ne voient pas. Vous pensez en réseau.",
    dominantCategories: ["philosophie", "histoire", "psychologie", "science", "business", "technologie"],
    secondaryTrait: "Vous avez une capacité rare à établir des ponts entre les disciplines.",
    tip: "Pour aller plus loin, approfondissez un domaine qui vous passionne vraiment.",
  },
  {
    id: "philosophe",
    name: "Le Philosophe",
    icon: "🦉",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    shortDesc: "Questionnez les fondements. Pensez avant d'agir.",
    fullDesc: "Vous aimez aller au fond des choses, interroger les évidences et construire des raisonnements solides. La nuance est votre moteur.",
    dominantCategories: ["philosophie", "psychologie", "histoire"],
    secondaryTrait: "Vous avez un sens aigu de l'argumentation et de la nuance.",
    tip: "Confrontez vos idées à des courants de pensée opposés pour les affiner.",
  },
  {
    id: "scientifique",
    name: "Le Scientifique",
    icon: "🔬",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    shortDesc: "La preuve d'abord, les conclusions ensuite.",
    fullDesc: "Vous apprenez avec méthode, appréciez les faits et les données vérifiables. Votre rigueur est votre atout principal.",
    dominantCategories: ["science", "technologie"],
    secondaryTrait: "Vous aimez comprendre les mécanismes profonds avant de prendre position.",
    tip: "Lisez des ouvrages de vulgarisation dans des sciences que vous ne connaissez pas encore.",
  },
  {
    id: "expert",
    name: "L'Expert",
    icon: "🎯",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    shortDesc: "Maîtrise totale d'un domaine précis.",
    fullDesc: "Vous choisissez un sujet et vous allez très loin. Votre bibliothèque est dense, pointue et cohérente. Vous êtes une référence dans votre spécialité.",
    dominantCategories: [],
    secondaryTrait: "Votre profondeur de connaissance est un avantage compétitif rare.",
    tip: "Partagez votre expertise : enseigner consolide et enrichit le savoir.",
  },
  {
    id: "stratege",
    name: "Le Stratège",
    icon: "♟️",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    shortDesc: "Vous pensez à long terme et en systèmes.",
    fullDesc: "Vous apprenez pour décider mieux. Business, organisation, leadership — vous cherchez des leviers d'action concrets et des cadres de pensée efficaces.",
    dominantCategories: ["business", "technologie", "psychologie"],
    secondaryTrait: "Vous savez transformer le savoir en plan d'action.",
    tip: "Enrichissez votre vision stratégique avec des lectures en histoire et en philosophie.",
  },
  {
    id: "historien",
    name: "L'Historien",
    icon: "📜",
    color: "text-amber-600",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    shortDesc: "Le passé éclaire le présent.",
    fullDesc: "Vous aimez comprendre d'où viennent les idées, les sociétés et les hommes. L'histoire est votre boussole.",
    dominantCategories: ["histoire", "philosophie"],
    secondaryTrait: "Votre mémoire culturelle vous donne une perspective rare sur le monde actuel.",
    tip: "Croisez l'histoire avec la science et le business pour une vision encore plus riche.",
  },
  {
    id: "creatif",
    name: "Le Créatif",
    icon: "🎨",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    shortDesc: "Vous apprenez pour créer, inventer, exprimer.",
    fullDesc: "Vous cherchez des idées, des inspirations, des angles nouveaux. Art, design, narration, innovation — votre curiosité nourrit votre créativité.",
    dominantCategories: ["art", "philosophie", "psychologie"],
    secondaryTrait: "Vous transformez naturellement le savoir en création.",
    tip: "Structurez votre créativité avec des lectures plus analytiques.",
  },
  {
    id: "visionnaire",
    name: "Le Visionnaire",
    icon: "🚀",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    shortDesc: "Vous regardez vers demain.",
    fullDesc: "Technologie, futurisme, innovation de rupture — vous apprenez pour anticiper et construire le futur. Vous aimez les idées qui n'existent pas encore.",
    dominantCategories: ["technologie", "science", "business"],
    secondaryTrait: "Votre capacité à projeter et anticiper est un atout rare.",
    tip: "Ancrez votre vision dans l'histoire pour lui donner plus de profondeur.",
  },
  {
    id: "analyste",
    name: "L'Analyste",
    icon: "📊",
    color: "text-blue-600",
    bg: "bg-blue-600/10",
    border: "border-blue-600/20",
    shortDesc: "Vous décortiquez, mesurez, comprenez.",
    fullDesc: "Vous aimez les modèles, les données et les structures logiques. Économie, psychologie cognitive, analyse — vous cherchez le système derrière les faits.",
    dominantCategories: ["science", "business", "psychologie"],
    secondaryTrait: "Votre pensée structurée vous permet de prendre de meilleures décisions.",
    tip: "Développez votre sens du récit pour rendre vos analyses plus accessibles.",
  },
  {
    id: "humaniste",
    name: "L'Humaniste",
    icon: "❤️",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    shortDesc: "Comprendre l'humain, dans toute sa complexité.",
    fullDesc: "Psychologie, sociologie, développement personnel, empathie — vous apprenez pour mieux comprendre les gens et vous-même.",
    dominantCategories: ["psychologie", "philosophie", "sante"],
    secondaryTrait: "Votre intelligence émotionnelle et sociale est votre plus grande richesse.",
    tip: "Équilibrez avec des lectures plus analytiques pour structurer votre compréhension.",
  },
];

/**
 * Déduit le profil principal à partir des catégories dominantes dans la bibliothèque.
 * @param {Array} contents - liste des contenus de l'utilisateur
 * @returns {{ primary: Archetype, secondary: Archetype|null, scores: Object }}
 */
export function detectArchetype(contents = []) {
  // Comptage par catégorie (seulement les contenus terminés ou en cours)
  const scores = {};
  for (const c of contents) {
    if (c.category && (c.status === "completed" || c.status === "in_progress")) {
      scores[c.category] = (scores[c.category] || 0) + (c.status === "completed" ? 2 : 1);
    }
  }

  if (Object.keys(scores).length === 0) return { primary: ARCHETYPES[0], secondary: null, scores };

  // Score par archétype
  const archetypeScores = ARCHETYPES.map(a => {
    const score = a.dominantCategories.reduce((acc, cat) => acc + (scores[cat] || 0), 0);
    return { archetype: a, score };
  });

  archetypeScores.sort((a, b) => b.score - a.score);

  const primary = archetypeScores[0].archetype;
  // Secondary doit avoir un score > 0 et être différent du primary
  const secondaryEntry = archetypeScores.find((e, i) => i > 0 && e.score > 0);
  const secondary = secondaryEntry ? secondaryEntry.archetype : null;

  return { primary, secondary, scores };
}

/**
 * Retourne un archétype par son id.
 */
export function getArchetypeById(id) {
  return ARCHETYPES.find(a => a.id === id) || ARCHETYPES[0];
}