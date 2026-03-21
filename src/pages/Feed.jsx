import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Headphones, Play, FileText, Trophy, Flame, Heart, MessageCircle, Loader2, Plus, Send, X, Image, Quote, Star, TrendingUp, Zap } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const TYPE_ICON = { book: BookOpen, podcast: Headphones, video: Play, article: FileText };
const ACTION_LABEL = {
  started: "a commencé",
  progress: "progresse dans",
  completed: "a terminé ✅",
  badge_earned: "a gagné un badge 🏅",
  streak_milestone: "a atteint un streak 🔥",
  challenge_joined: "a rejoint un défi 🏆",
  post: "a publié",
};

const POST_TYPES = [
  { id: "update", emoji: "✍️", label: "Mise à jour" },
  { id: "quote", emoji: "💬", label: "Citation" },
  { id: "review", emoji: "⭐", label: "Avis" },
  { id: "question", emoji: "❓", label: "Question" },
  { id: "milestone", emoji: "🎯", label: "Milestone" },
];

function PostCard({ post, currentUser }) {
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const qc = useQueryClient();

  const addComment = () => {
    if (!comment.trim()) return;
    setComments(prev => [...prev, { id: Date.now(), text: comment, author: currentUser?.email || "Vous", created_date: new Date().toISOString() }]);
    setComment("");
  };

  const typeInfo = POST_TYPES.find(t => t.id === post.type) || POST_TYPES[0];

  return (
    <div className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 font-bold text-sm text-primary">
          {(post.created_by || "?")[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{post.created_by?.split("@")[0]}</span>
            <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{typeInfo.emoji} {typeInfo.label}</span>
            {post.content_ref_title && (
              <span className="text-xs text-accent">📖 {post.content_ref_title}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {post.created_date && format(new Date(post.created_date), "d MMM à HH:mm", { locale: fr })}
          </p>
        </div>
      </div>

      <p className="text-sm leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>

      {post.image_url && (
        <img src={post.image_url} alt="" className="rounded-xl mb-4 w-full max-h-60 object-cover" />
      )}

      <div className="flex items-center gap-4 pt-3 border-t border-border">
        <button onClick={() => setLiked(!liked)}
          className={`flex items-center gap-1.5 text-xs transition-colors ${liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}>
          <Heart className={`w-4 h-4 ${liked ? "fill-red-500" : ""}`} />
          {(post.likes_count || 0) + (liked ? 1 : 0)}
        </button>
        <button onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors">
          <MessageCircle className="w-4 h-4" />
          {comments.length + (post.comments_count || 0)} commentaire{comments.length > 1 ? "s" : ""}
        </button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="mt-3 pt-3 border-t border-border space-y-2">
            {comments.map(c => (
              <div key={c.id} className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xs font-bold shrink-0">
                  {c.author[0].toUpperCase()}
                </div>
                <div className="bg-secondary/50 rounded-xl px-3 py-1.5 flex-1">
                  <p className="text-xs font-medium text-accent">{c.author.split("@")[0]}</p>
                  <p className="text-xs">{c.text}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <input placeholder="Commenter..." value={comment} onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addComment()}
                className="flex-1 text-xs bg-secondary rounded-xl px-3 py-2 border border-border focus:outline-none focus:border-accent" />
              <Button size="sm" variant="ghost" onClick={addComment} disabled={!comment.trim()}>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActivityCard({ activity }) {
  const [liked, setLiked] = useState(false);
  const Icon = TYPE_ICON[activity.content_type] || BookOpen;
  return (
    <div className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 font-bold text-sm text-primary">
          {(activity.created_by || "?")[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="text-sm">
            <span className="font-medium">{activity.created_by?.split("@")[0]}</span>{" "}
            <span className="text-muted-foreground">{ACTION_LABEL[activity.action] || activity.action}</span>
            {activity.content_title && <span className="font-medium"> {activity.content_title}</span>}
          </p>
          {activity.details && <p className="text-xs text-muted-foreground mt-0.5">{activity.details}</p>}
          <p className="text-xs text-muted-foreground mt-1">
            {activity.created_date && format(new Date(activity.created_date), "d MMM à HH:mm", { locale: fr })}
          </p>
        </div>
        {activity.kp_earned > 0 && (
          <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full font-medium shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3" /> +{activity.kp_earned} KP
          </span>
        )}
      </div>
      {activity.content_type && (
        <div className="mt-2 ml-13 flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-1.5 w-fit">
          <Icon className="w-3.5 h-3.5" /> {activity.content_type}
        </div>
      )}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
        <button onClick={() => setLiked(!liked)}
          className={`flex items-center gap-1.5 text-xs transition-colors ${liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}>
          <Heart className={`w-4 h-4 ${liked ? "fill-red-500" : ""}`} /> J'aime
        </button>
        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors">
          <MessageCircle className="w-4 h-4" /> Commenter
        </button>
      </div>
    </div>
  );
}

export default function Feed() {
  const qc = useQueryClient();
  const [user, setUser] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postType, setPostType] = useState("update");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: activities = [], isLoading: loadingActivities } = useQuery({
    queryKey: ["activities-feed"],
    queryFn: () => base44.entities.Activity.filter({ is_public: true }, "-created_date", 30),
  });

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["posts"],
    queryFn: () => base44.entities.Post.filter({ is_public: true }, "-created_date", 30),
  });

  const createPost = useMutation({
    mutationFn: () => base44.entities.Post.create({
      content: postContent,
      type: postType,
      is_public: true,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      setPostContent("");
      setPostType("update");
      setShowCompose(false);
    },
  });

  const isLoading = loadingActivities || loadingPosts;

  // Merge and sort by date
  const feedItems = [
    ...posts.map(p => ({ ...p, _kind: "post" })),
    ...activities.map(a => ({ ...a, _kind: "activity" })),
  ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const myPosts = posts.filter(p => p.created_by === user?.email);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Feed</h1>
          <p className="text-muted-foreground mt-1">Activités de la communauté</p>
        </div>
        <Button onClick={() => setShowCompose(!showCompose)} className="gap-2">
          <Plus className="w-4 h-4" /> Publier
        </Button>
      </div>

      {/* Compose */}
      <AnimatePresence>
        {showCompose && (
          <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
            className="bg-card border border-accent/30 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm flex items-center gap-2"><Plus className="w-4 h-4 text-accent" /> Nouveau post</h3>
              <button onClick={() => setShowCompose(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            {/* Type selector */}
            <div className="flex gap-2 mb-3 flex-wrap">
              {POST_TYPES.map(t => (
                <button key={t.id} onClick={() => setPostType(t.id)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${postType === t.id ? "bg-accent text-accent-foreground" : "bg-secondary hover:bg-secondary/80"}`}>
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-sm shrink-0">
                {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "?"}
              </div>
              <Textarea
                placeholder={postType === "quote" ? "Partagez une citation inspirante..." : postType === "question" ? "Posez votre question à la communauté..." : "Quoi de neuf dans votre apprentissage ?"}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="min-h-[80px] text-sm resize-none"
              />
            </div>
            <div className="flex justify-end mt-3 gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowCompose(false)}>Annuler</Button>
              <Button size="sm" onClick={() => createPost.mutate()} disabled={!postContent.trim() || createPost.isPending} className="gap-2">
                {createPost.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Publier
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary p-1 rounded-xl">
        {[
          { id: "all", label: "Tout le feed" },
          { id: "posts", label: "Posts" },
          { id: "activity", label: "Activités" },
          { id: "mine", label: "Mes posts" },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 text-xs rounded-lg font-medium transition-all ${activeTab === t.id ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
      ) : (
        <div className="space-y-4">
          {activeTab === "all" && feedItems.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📡</div>
              <p className="text-muted-foreground">Aucune activité pour le moment.</p>
              <p className="text-sm text-muted-foreground mt-1">Soyez le premier à publier !</p>
            </div>
          )}

          {activeTab === "all" && feedItems.map((item, i) => (
            <motion.div key={`${item._kind}-${item.id}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              {item._kind === "post" ? <PostCard post={item} currentUser={user} /> : <ActivityCard activity={item} />}
            </motion.div>
          ))}

          {activeTab === "posts" && posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <PostCard post={post} currentUser={user} />
            </motion.div>
          ))}
          {activeTab === "posts" && posts.length === 0 && (
            <div className="text-center py-10"><div className="text-4xl mb-2">✍️</div><p className="text-muted-foreground text-sm">Aucun post encore. Soyez le premier !</p></div>
          )}

          {activeTab === "activity" && activities.map((activity, i) => (
            <motion.div key={activity.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <ActivityCard activity={activity} />
            </motion.div>
          ))}
          {activeTab === "activity" && activities.length === 0 && (
            <div className="text-center py-10"><div className="text-4xl mb-2">📡</div><p className="text-muted-foreground text-sm">Aucune activité pour le moment.</p></div>
          )}

          {activeTab === "mine" && myPosts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <PostCard post={post} currentUser={user} />
            </motion.div>
          ))}
          {activeTab === "mine" && myPosts.length === 0 && (
            <div className="text-center py-10">
              <div className="text-4xl mb-2">✍️</div>
              <p className="text-muted-foreground text-sm">Vous n'avez pas encore publié.</p>
              <Button size="sm" className="mt-3 gap-2" onClick={() => setShowCompose(true)}><Plus className="w-3.5 h-3.5" /> Créer mon premier post</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}