// Knowledge Points system
export const LEVELS = [
  { name: "Curieux", minKP: 0, icon: "🔍" },
  { name: "Lecteur", minKP: 200, icon: "📖" },
  { name: "Penseur", minKP: 500, icon: "💭" },
  { name: "Érudit", minKP: 1200, icon: "🎓" },
  { name: "Polymathe", minKP: 3000, icon: "🧠" },
  { name: "Sage", minKP: 6000, icon: "🦉" },
  { name: "Architecte du savoir", minKP: 12000, icon: "🏛️" },
];

export const BADGES = [
  { id: "first_book", name: "Premier livre", icon: "📚", description: "Terminer votre premier livre", condition: (u) => (u.books_completed || 0) >= 1 },
  { id: "podcast_10", name: "10 podcasts", icon: "🎧", description: "Écouter 10 podcasts", condition: (u) => (u.podcasts_completed || 0) >= 10 },
  { id: "pages_1000", name: "1000 pages", icon: "📄", description: "Lire 1000 pages", condition: (u) => (u.total_pages_read || 0) >= 1000 },
  { id: "streak_30", name: "30 jours streak", icon: "🔥", description: "Maintenir un streak de 30 jours", condition: (u) => (u.longest_streak || 0) >= 30 },
  { id: "contents_100", name: "100 contenus", icon: "💎", description: "Compléter 100 contenus", condition: (u) => ((u.books_completed || 0) + (u.podcasts_completed || 0) + (u.videos_completed || 0) + (u.articles_completed || 0)) >= 100 },
  { id: "streak_7", name: "Semaine parfaite", icon: "⭐", description: "7 jours de streak", condition: (u) => (u.longest_streak || 0) >= 7 },
  { id: "first_podcast", name: "Premier podcast", icon: "🎙️", description: "Terminer votre premier podcast", condition: (u) => (u.podcasts_completed || 0) >= 1 },
  { id: "first_video", name: "Première vidéo", icon: "🎬", description: "Regarder votre première vidéo", condition: (u) => (u.videos_completed || 0) >= 1 },
];

export function getUserLevel(kp) {
  let level = LEVELS[0];
  for (const l of LEVELS) {
    if (kp >= l.minKP) level = l;
  }
  return level;
}

export function getNextLevel(kp) {
  for (const l of LEVELS) {
    if (kp < l.minKP) return l;
  }
  return null;
}

export function getLevelProgress(kp) {
  const current = getUserLevel(kp);
  const next = getNextLevel(kp);
  if (!next) return 100;
  const range = next.minKP - current.minKP;
  const progress = kp - current.minKP;
  return Math.round((progress / range) * 100);
}

export function calculateKP(type, data) {
  let kp = 0;
  switch (type) {
    case "book":
      if (data.completed) kp = 100;
      else if (data.pages >= 50) kp = 25;
      else if (data.pages >= 10) kp = 5;
      break;
    case "podcast":
      if (data.duration > 60) kp = 30;
      else kp = 20;
      break;
    case "video":
      kp = 15;
      break;
    case "article":
      if (data.isLong) kp = 10;
      else kp = 5;
      break;
  }
  return kp;
}

export const TYPE_LABELS = {
  book: "Livre",
  podcast: "Podcast",
  video: "Vidéo",
  article: "Article",
};

export const TYPE_ICONS = {
  book: "BookOpen",
  podcast: "Headphones",
  video: "Play",
  article: "FileText",
};

export const STATUS_LABELS = {
  to_consume: "À découvrir",
  in_progress: "En cours",
  paused: "En pause",
  to_review: "À revoir",
  completed: "Terminé",
};

export const CATEGORY_LABELS = {
  philosophie: "Philosophie",
  science: "Science",
  business: "Business",
  technologie: "Technologie",
  histoire: "Histoire",
  psychologie: "Psychologie",
  art: "Art",
  sante: "Santé",
  autre: "Autre",
};