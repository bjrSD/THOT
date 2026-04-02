export const translations = {
  en: {
    // Navigation
    nav: {
      dashboard: "Dashboard",
      feed: "Feed",
      library: "Library",
      discover: "Discover",
      brainMap: "Brain Map",
      heatmap: "Heatmap",
      reports: "Reports",
      challenges: "Challenges",
      duels: "Duels",
      leaderboard: "Leaderboard",
      clubs: "Clubs",
      profile: "My Profile",
      integrations: "Integrations",
      settings: "Settings",
    },
    // Layout
    layout: {
      logout: "Logout",
      premiumUpgrade: "Go Premium",
      unlockFeatures: "Unlock all features",
      accountPremium: "Premium Account ✓",
      myDashboard: "My dashboard",
      signin: "Sign in",
      signup: "Sign up for free",
    },
    // Home
    home: {
      hero: {
        title: "Become smarter",
        titleHighlight: "every day",
        subtitle: "Track your books, podcasts and videos. Progress, compete with friends, earn Knowledge Points.",
        contentTypes: { books: "Books", podcasts: "Podcasts", articles: "Articles", videos: "Videos" },
        signup: "Sign up for free",
        signin: "Sign in",
        users: "+50K learners",
      },
      howItWorks: "How it works",
      steps: {
        add: "1. Add",
        addDesc: "Books, podcasts, articles or videos in seconds.",
        track: "2. Track",
        trackDesc: "Charts, heatmaps and advanced statistics.",
        progress: "3. Progress",
        progressDesc: "Badges, streaks and rankings among your friends.",
      },
      features: "Learn, complete, progress",
      featuresSubtitle: "THOT has become a real social platform for knowledge.",
      duels: "Knowledge Duels",
      duelsDesc: "Challenge your friends over 7 days",
        leaderboard: "Global Ranking",
        leaderboardDesc: "Top thinkers of the week",
        brainMap: "Brain Map",
        brainMapDesc: "Visualize your knowledge",
        heatmap: "Annual Heatmap",
        heatmapDesc: "Every day counts",
        clubs: "Knowledge Clubs",
        clubsDesc: "Learn as a community",
        feed: "Social Feed",
        feedDesc: "Your friends' activities",
      discover: "Discover",
      integrations: "Integrations",
      premium: "Premium",
      about: "About",
    },
    // Premium
    premium: {
      title: "Learn without limits",
      subtitle: "Unlock all features to transform your learning into a superpower.",
      free: "Free",
      features: "Premium",
      monthly: "Monthly",
      annual: "Annual",
      popular: "Popular",
      save: "Save 40%",
      lifetime: "Lifetime",
      bestValue: "Best value",
      yearly: "per year",
      unique: "unique payment",
      checkout: "Go Premium",
      secured: "Secure payment · Cancel anytime · 30-day money-back guarantee",
    },
  },
  fr: {
    // Navigation
    nav: {
      dashboard: "Dashboard",
      feed: "Feed",
      library: "Bibliothèque",
      discover: "Découvrir",
      brainMap: "Carte du savoir",
      heatmap: "Heatmap",
      reports: "Rapports",
      challenges: "Défis",
      duels: "Duels",
      leaderboard: "Classement",
      clubs: "Clubs",
      profile: "Mon Profil",
      integrations: "Intégrations",
      settings: "Paramètres",
    },
    // Layout
    layout: {
      logout: "Déconnexion",
      premiumUpgrade: "Passer Premium",
      unlockFeatures: "Débloquer toutes les fonctions",
      accountPremium: "Compte Premium ✓",
      myDashboard: "Mon dashboard",
      signin: "Se connecter",
      signup: "S'inscrire gratuitement",
    },
    // Home
    home: {
      hero: {
        title: "Devenez plus",
        titleHighlight: "intelligent",
        subtitle: "Suivez vos livres, podcasts et vidéos. Progressez, dépassez vos amis, gagnez des Knowledge Points.",
        contentTypes: { books: "Livres", podcasts: "Podcasts", articles: "Articles", videos: "Vidéos" },
        signup: "S'inscrire gratuitement",
        signin: "Se connecter",
        users: "+50K apprenants",
      },
      howItWorks: "Comment ça marche",
      steps: {
        add: "1. Ajouter",
        addDesc: "Livres, podcasts, articles ou vidéos en quelques secondes.",
        track: "2. Suivre",
        trackDesc: "Graphiques, heatmaps et statistiques avancées.",
        progress: "3. Progresser",
        progressDesc: "Badges, streaks et classements parmi vos amis.",
      },
      features: "Apprenez, complétez, progressez",
      featuresSubtitle: "THOT est devenu une vraie plateforme sociale de la connaissance.",
      duels: "Duels de savoir",
      duelsDesc: "Défie tes amis sur 7 jours",
      leaderboard: "Classement mondial",
      leaderboardDesc: "Top penseurs de la semaine",
      brainMap: "Carte du cerveau",
      brainMapDesc: "Visualise ton savoir",
      heatmap: "Heatmap annuelle",
      heatmapDesc: "Chaque jour compte",
      clubs: "Clubs de savoir",
      clubsDesc: "Apprends en communauté",
      feed: "Feed social",
      feedDesc: "Activités de tes amis",
      discover: "Découvrir",
      integrations: "Intégrations",
      premium: "Premium",
      about: "À propos",
    },
    // Premium
    premium: {
      title: "Apprenez sans limites",
      subtitle: "Débloquez toutes les fonctionnalités pour transformer votre apprentissage en superpower.",
      free: "Gratuit",
      features: "Premium",
      monthly: "Mensuel",
      annual: "Annuel",
      popular: "Populaire",
      save: "Économisez 40%",
      lifetime: "À vie",
      bestValue: "Meilleure valeur",
      yearly: "par an",
      unique: "paiement unique",
      checkout: "Passer Premium",
      secured: "Paiement sécurisé · Annulation à tout moment · Garantie satisfait ou remboursé 30 jours",
    },
  },
};

export function detectLanguage() {
  // Check localStorage first
  const saved = localStorage.getItem('thot-language');
  if (saved) return saved;

  // Check browser language
  const browserLang = navigator.language.split('-')[0];
  if (browserLang === 'fr') return 'fr';
  if (browserLang === 'en') return 'en';

  // Default to English
  return 'en';
}

export function t(path, language = 'en') {
  const keys = path.split('.');
  let value = translations[language];
  
  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = value[key];
    } else {
      return path; // Return path if translation not found
    }
  }
  
  return value || path;
}