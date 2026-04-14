import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Headphones, Play, FileText, Heart, MessageCircle,
  Loader2, Plus, Send, X, Zap, Bookmark, BookmarkCheck, Share2, Users, Globe, Library, Image, Camera
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import UserProfileModal from "@/components/feed/UserProfileModal";
import ContentActionBar from "@/components/feed/ContentActionBar";

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

// Only public + friends (no "private only for you")
const VISIBILITY_OPTIONS = [
  { id: "public", icon: Globe, label: "Public" },
  { id: "friends", icon: Users, label: "Amis" },
];

// Mock friends for testing
const MOCK_FRIENDS = [
  { email: "sophie.martin@thot.app", full_name: "Sophie Martin", avatar_url: "https://images.unsplash.com/photo-1494790108755-2616b612b48d?w=80&q=80", level: "Érudit 🎓" },
  { email: "karim.benzali@thot.app", full_name: "Karim Benzali", avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80", level: "Polymathe 🧠" },
  { email: "alice.dubois@thot.app", full_name: "Alice Dubois", avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80", level: "Penseur 💭" },
  { email: "lucas.moreau@thot.app", full_name: "Lucas Moreau", avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80", level: "Lecteur 📖" },
  { email: "amina.traoré@thot.app", full_name: "Amina Traoré", avatar_url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&q=80", level: "Érudit 🎓" },
];

// Mock posts from friends
const MOCK_FRIEND_POSTS = [
  {
    id: "mock-1", _kind: "post", created_by: "sophie.martin@thot.app", created_date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    type: "review", content: "Je viens de terminer 'Sapiens' de Yuval Noah Harari. Une lecture absolument fascinante sur l'histoire de l'humanité ! ⭐⭐⭐⭐⭐", is_public: false, visibility: "friends",
    content_ref_title: "Sapiens", likes_count: 12, comments_count: 3, image_url: null,
  },
  {
    id: "mock-2", _kind: "post", created_by: "karim.benzali@thot.app", created_date: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    type: "quote", content: '"La connaissance parle, mais la sagesse écoute." — Jimi Hendrix\n\nCette citation me suit depuis que j\'ai commencé "The Art of Thinking Clearly" 🧠', is_public: false, visibility: "friends",
    likes_count: 8, comments_count: 1, image_url: null,
  },
  {
    id: "mock-3", _kind: "post", created_by: "alice.dubois@thot.app", created_date: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    type: "milestone", content: "🎯 100 pages lues aujourd'hui ! Nouveau record personnel sur 'Atomic Habits'. La discipline avant tout 💪", is_public: false, visibility: "friends",
    likes_count: 21, comments_count: 5, image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80",
  },
  {
    id: "mock-4", _kind: "post", created_by: "lucas.moreau@thot.app", created_date: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    type: "question", content: "Quelqu'un a des recommandations sur la psychologie cognitive ? Je cherche quelque chose d'accessible mais rigoureux 🤔", is_public: true, visibility: "public",
    likes_count: 4, comments_count: 7, image_url: null,
  },
];

function FriendAvatar({ email, avatarUrl, size = "md", onClick }) {
  const friend = MOCK_FRIENDS.find(f => f.email === email);
  const photo = friend?.avatar_url || avatarUrl;
  const initial = (friend?.full_name || email || "?")[0]?.toUpperCase();
  const sizeClass = size === "sm" ? "w-6 h-6 text-xs" : "w-10 h-10 text-sm";
  return (
    <button onClick={onClick} className={`${sizeClass} rounded-full shrink-0 overflow-hidden border-2 border-background hover:opacity-80 transition-opacity focus:outline-none bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-primary`} title={friend?.full_name || email}>
      {photo ? <img src={photo} alt={initial} className="w-full h-full object-cover" /> : initial}
    </button>
  );
}

function PostCard({ post, currentUser, onUserClick }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  const addComment = () => {
    if (!comment.trim()) return;
    setComments(prev => [...prev, { id: Date.now(), text: comment, author: currentUser?.email || "Vous", created_date: new Date().toISOString() }]);
    setComment("");
  };

  const typeInfo = POST_TYPES.find(t => t.id === post.type) || POST_TYPES[0];
  const friend = MOCK_FRIENDS.find(f => f.email === post.created_by);
  const username = friend?.full_name || post.created_by?.split("@")[0];
  const isMe = post.created_by === currentUser?.email;

  return (
    <div className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <FriendAvatar email={post.created_by} onClick={() => onUserClick({ email: post.created_by, full_name: friend?.full_name, avatar_url: friend?.avatar_url })} />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => onUserClick({ email: post.created_by, full_name: friend?.full_name, avatar_url: friend?.avatar_url })}
              className="font-semibold text-sm hover:text-accent transition-colors">{username}</button>
            <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{typeInfo.emoji} {typeInfo.label}</span>
            {post.visibility === "friends" && <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full flex items-center gap-1"><Users className="w-2.5 h-2.5" /> Amis</span>}
          </div>
          <p className="text-xs text-muted-foreground">
            {post.created_date && format(new Date(post.created_date), "d MMM à HH:mm", { locale: fr })}
          </p>
        </div>
      </div>

      <p className="text-sm leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>

      {post.image_url && (
        <img src={post.image_url} alt="" className="rounded-xl mb-3 w-full max-h-72 object-cover cursor-pointer hover:opacity-95 transition-opacity" />
      )}

      {post.content_ref_title && (
        <ContentActionBar contentTitle={post.content_ref_title} contentType={post.content_ref_type} contentRefId={post.content_ref_id} />
      )}

      <div className="flex items-center gap-3 pt-3 border-t border-border mt-3">
        <button onClick={() => setLiked(!liked)}
          className={`flex items-center gap-1.5 text-xs transition-colors ${liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}>
          <Heart className={`w-4 h-4 ${liked ? "fill-red-500" : ""}`} />
          {(post.likes_count || 0) + (liked ? 1 : 0)}
        </button>
        <button onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1.5 text-xs transition-colors ${showComments ? "text-accent" : "text-muted-foreground hover:text-accent"}`}>
          <MessageCircle className="w-4 h-4" />
          {comments.length + (post.comments_count || 0)}
        </button>
        <button onClick={() => setSaved(!saved)}
          className={`flex items-center gap-1.5 text-xs transition-colors ${saved ? "text-accent" : "text-muted-foreground hover:text-accent"}`}>
          {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
        <button onClick={() => navigator.clipboard.writeText(`${post.content} — partagé depuis THOT`)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors ml-auto">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="mt-3 pt-3 border-t border-border space-y-2">
            {comments.map(c => (
              <div key={c.id} className="flex items-start gap-2">
                <FriendAvatar email={c.author} size="sm" onClick={() => onUserClick({ email: c.author })} />
                <div className="bg-secondary/50 rounded-xl px-3 py-1.5 flex-1">
                  <p className="text-xs font-medium text-accent">{c.author.split("@")[0]}</p>
                  <p className="text-xs">{c.text}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <input placeholder="Commenter..." value={comment} onChange={e => setComment(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addComment()}
                className="flex-1 text-xs bg-secondary rounded-xl px-3 py-2 border border-border focus:outline-none focus:border-accent" />
              <Button size="sm" variant="ghost" onClick={addComment} disabled={!comment.trim()}><Send className="w-3.5 h-3.5" /></Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActivityCard({ activity, onUserClick }) {
  const [liked, setLiked] = useState(false);
  const Icon = TYPE_ICON[activity.content_type] || BookOpen;

  return (
    <div className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <FriendAvatar email={activity.created_by} onClick={() => onUserClick({ email: activity.created_by })} />
        <div className="flex-1">
          <p className="text-sm">
            <button onClick={() => onUserClick({ email: activity.created_by })} className="font-semibold hover:text-accent transition-colors">
              {activity.created_by?.split("@")[0]}
            </button>{" "}
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
      {activity.content_title && <ContentActionBar contentTitle={activity.content_title} contentType={activity.content_type} />}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
        <button onClick={() => setLiked(!liked)}
          className={`flex items-center gap-1.5 text-xs transition-colors ${liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}>
          <Heart className={`w-4 h-4 ${liked ? "fill-red-500" : ""}`} /> {liked ? 1 : 0}
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
  const [postVisibility, setPostVisibility] = useState("public");
  const [linkedContent, setLinkedContent] = useState(null);
  const [showContentPicker, setShowContentPicker] = useState(false);
  const [contentSearch, setContentSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [mineSubTab, setMineSubTab] = useState("public"); // "public" | "friends"
  const [profileModal, setProfileModal] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  // Optimistic local posts (appear immediately after publish)
  const [localPosts, setLocalPosts] = useState([]);
  const photoInputRef = useRef(null);

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: myContents = [] } = useQuery({
    queryKey: ["contents-feed-pick"],
    queryFn: () => base44.entities.Content.list("-updated_date", 100),
    enabled: showContentPicker,
  });

  const { data: activities = [], isLoading: loadingActivities } = useQuery({
    queryKey: ["activities-feed"],
    queryFn: () => base44.entities.Activity.filter({ is_public: true }, "-created_date", 30),
  });

  const { data: remotePosts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["posts"],
    queryFn: () => base44.entities.Post.filter({ is_public: true }, "-created_date", 50),
  });

  // Merge remote posts with local optimistic posts (avoid duplicates by id)
  const remoteIds = new Set(remotePosts.map(p => p.id));
  const posts = [...localPosts.filter(p => !remoteIds.has(p.id)), ...remotePosts];

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setPhotoUrl(file_url);
    setUploadingPhoto(false);
  };

  const createPost = useMutation({
    mutationFn: () => base44.entities.Post.create({
      content: postContent,
      type: postType,
      is_public: postVisibility === "public",
      visibility: postVisibility,
      content_ref_id: linkedContent?.id || null,
      content_ref_title: linkedContent?.title || null,
      content_ref_type: linkedContent?.type || null,
      image_url: photoUrl || null,
    }),
    onMutate: () => {
      // Optimistic: add post locally immediately
      const optimistic = {
        id: `optimistic-${Date.now()}`,
        _kind: "post",
        content: postContent,
        type: postType,
        is_public: postVisibility === "public",
        visibility: postVisibility,
        created_by: user?.email,
        created_date: new Date().toISOString(),
        content_ref_id: linkedContent?.id || null,
        content_ref_title: linkedContent?.title || null,
        content_ref_type: linkedContent?.type || null,
        image_url: photoUrl || null,
        likes_count: 0,
        comments_count: 0,
      };
      setLocalPosts(prev => [optimistic, ...prev]);
    },
    onSuccess: (newPost) => {
      // Replace optimistic with real post
      setLocalPosts(prev => prev.filter(p => !p.id.startsWith("optimistic-")));
      qc.invalidateQueries({ queryKey: ["posts"] });
      setPostContent("");
      setPostType("update");
      setPostVisibility("public");
      setLinkedContent(null);
      setPhotoUrl(null);
      setShowCompose(false);
      setShowContentPicker(false);
      // Switch to "Mes posts" tab so user sees their new post
      setActiveTab("mine");
    },
  });

  const isLoading = loadingActivities || loadingPosts;

  const allFeedItems = [
    ...posts.map(p => ({ ...p, _kind: "post" })),
    ...MOCK_FRIEND_POSTS,
    ...activities.map(a => ({ ...a, _kind: "activity" })),
  ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const friendFeedItems = [
    ...posts.filter(p => p.visibility === "friends").map(p => ({ ...p, _kind: "post" })),
    ...MOCK_FRIEND_POSTS,
  ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const myPosts = posts.filter(p => p.created_by === user?.email);
  const myPublicPosts = myPosts.filter(p => p.visibility === "public" || p.is_public);
  const myFriendsPosts = myPosts.filter(p => p.visibility === "friends");

  const resetCompose = () => {
    setShowCompose(false);
    setLinkedContent(null);
    setShowContentPicker(false);
    setPhotoUrl(null);
    setPostContent("");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Feed</h1>
          <p className="text-muted-foreground mt-1">Activités de la communauté</p>
        </div>
        <Button onClick={() => setShowCompose(!showCompose)} className="gap-2">
          <Plus className="w-4 h-4" /> Publier
        </Button>
      </div>

      {/* Compose box */}
      <AnimatePresence>
        {showCompose && (
          <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
            className="bg-card border border-accent/30 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm flex items-center gap-2"><Plus className="w-4 h-4 text-accent" /> Nouveau post</h3>
              <button onClick={resetCompose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
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

            {/* Photo preview */}
            {photoUrl && (
              <div className="mt-3 relative inline-block">
                <img src={photoUrl} alt="photo" className="rounded-xl max-h-48 object-cover" />
                <button onClick={() => setPhotoUrl(null)} className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 hover:bg-black/80">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Bottom toolbar */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {/* Photo upload */}
              <button onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors">
                {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                {uploadingPhoto ? "Envoi..." : "Photo"}
              </button>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

              {/* Link content */}
              {linkedContent ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/30 rounded-full text-xs">
                  <BookOpen className="w-3 h-3 text-accent shrink-0" />
                  <span className="truncate max-w-[120px] font-medium text-accent">{linkedContent.title}</span>
                  <button onClick={() => setLinkedContent(null)} className="text-muted-foreground hover:text-foreground shrink-0"><X className="w-3 h-3" /></button>
                </div>
              ) : (
                <button onClick={() => setShowContentPicker(p => !p)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors">
                  <Library className="w-3.5 h-3.5" /> Lier un contenu
                </button>
              )}

              {/* Visibility */}
              <div className="ml-auto flex items-center gap-1.5">
                {VISIBILITY_OPTIONS.map(v => {
                  const Icon = v.icon;
                  return (
                    <button key={v.id} onClick={() => setPostVisibility(v.id)}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-colors border ${
                        postVisibility === v.id
                          ? v.id === "public" ? "bg-green-500 text-white border-green-500" : "bg-blue-500 text-white border-blue-500"
                          : "bg-secondary border-border hover:border-accent/40"
                      }`}>
                      <Icon className="w-3 h-3" /> {v.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content picker */}
            <AnimatePresence>
              {showContentPicker && !linkedContent && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="mt-2 border border-border rounded-xl overflow-hidden bg-card">
                  <div className="p-2 border-b border-border">
                    <input value={contentSearch} onChange={e => setContentSearch(e.target.value)}
                      placeholder="Rechercher dans ma bibliothèque…"
                      className="w-full text-xs bg-secondary rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent" />
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {myContents.filter(c => c.title.toLowerCase().includes(contentSearch.toLowerCase())).slice(0, 10).map(c => (
                      <button key={c.id} onClick={() => { setLinkedContent(c); setShowContentPicker(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary text-left text-xs border-b border-border/50 last:border-0">
                        <span className="shrink-0">{c.type === "book" ? "📚" : c.type === "podcast" ? "🎙️" : c.type === "video" ? "🎬" : "📰"}</span>
                        <span className="truncate font-medium">{c.title}</span>
                        <span className="text-muted-foreground shrink-0 ml-auto capitalize">{c.status?.replace("_", " ")}</span>
                      </button>
                    ))}
                    {myContents.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Aucun contenu dans votre bibliothèque</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-muted-foreground">
                {postVisibility === "public" ? "🌍 Visible par tous" : "👥 Visible par vos amis uniquement"}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetCompose}>Annuler</Button>
                <Button size="sm" onClick={() => createPost.mutate()} disabled={!postContent.trim() || createPost.isPending} className="gap-2">
                  {createPost.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {postVisibility === "public" ? "Publier" : "Publier pour amis"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary p-1 rounded-xl">
        {[
          { id: "all", label: "Tout le feed" },
          { id: "friends", label: "👥 Amis" },
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
          {/* ALL */}
          {activeTab === "all" && (
            allFeedItems.length === 0
              ? <div className="text-center py-16"><div className="text-5xl mb-4">📡</div><p className="text-muted-foreground">Aucune activité. Soyez le premier à publier !</p></div>
              : allFeedItems.map((item, i) => (
                <motion.div key={`${item._kind}-${item.id}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  {item._kind === "post" ? <PostCard post={item} currentUser={user} onUserClick={setProfileModal} /> : <ActivityCard activity={item} onUserClick={setProfileModal} />}
                </motion.div>
              ))
          )}

          {/* FRIENDS */}
          {activeTab === "friends" && (
            friendFeedItems.length === 0
              ? <div className="text-center py-16"><div className="text-5xl mb-4">👥</div><p className="text-muted-foreground">Aucun post de vos amis pour l'instant.</p></div>
              : friendFeedItems.map((item, i) => (
                <motion.div key={`friends-${item.id}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <PostCard post={item} currentUser={user} onUserClick={setProfileModal} />
                </motion.div>
              ))
          )}

          {/* POSTS */}
          {activeTab === "posts" && (
            posts.length === 0
              ? <div className="text-center py-10"><div className="text-4xl mb-2">✍️</div><p className="text-muted-foreground text-sm">Aucun post encore.</p></div>
              : posts.map((post, i) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <PostCard post={post} currentUser={user} onUserClick={setProfileModal} />
                </motion.div>
              ))
          )}

          {/* ACTIVITY */}
          {activeTab === "activity" && (
            activities.length === 0
              ? <div className="text-center py-10"><div className="text-4xl mb-2">📡</div><p className="text-muted-foreground text-sm">Aucune activité.</p></div>
              : activities.map((activity, i) => (
                <motion.div key={activity.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <ActivityCard activity={activity} onUserClick={setProfileModal} />
                </motion.div>
              ))
          )}

          {/* MY POSTS */}
          {activeTab === "mine" && (
            <div className="space-y-4">
              {/* Sub-tabs */}
              <div className="flex gap-2">
                <button onClick={() => setMineSubTab("public")}
                  className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-full font-medium transition-colors border ${mineSubTab === "public" ? "bg-green-500 text-white border-green-500" : "bg-secondary border-border hover:border-green-400"}`}>
                  <Globe className="w-3 h-3" /> Posts publics ({myPublicPosts.length})
                </button>
                <button onClick={() => setMineSubTab("friends")}
                  className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-full font-medium transition-colors border ${mineSubTab === "friends" ? "bg-blue-500 text-white border-blue-500" : "bg-secondary border-border hover:border-blue-400"}`}>
                  <Users className="w-3 h-3" /> Pour mes amis ({myFriendsPosts.length})
                </button>
              </div>

              {mineSubTab === "public" && (
                myPublicPosts.length === 0
                  ? <div className="text-center py-10"><div className="text-4xl mb-2">🌍</div><p className="text-muted-foreground text-sm">Aucun post public.</p><Button size="sm" className="mt-3 gap-2" onClick={() => { setPostVisibility("public"); setShowCompose(true); }}><Plus className="w-3.5 h-3.5" /> Créer un post public</Button></div>
                  : myPublicPosts.map((post, i) => (
                    <motion.div key={post.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <PostCard post={post} currentUser={user} onUserClick={setProfileModal} />
                    </motion.div>
                  ))
              )}

              {mineSubTab === "friends" && (
                myFriendsPosts.length === 0
                  ? <div className="text-center py-10"><div className="text-4xl mb-2">👥</div><p className="text-muted-foreground text-sm">Aucun post pour vos amis.</p><Button size="sm" className="mt-3 gap-2" onClick={() => { setPostVisibility("friends"); setShowCompose(true); }}><Plus className="w-3.5 h-3.5" /> Créer un post pour amis</Button></div>
                  : myFriendsPosts.map((post, i) => (
                    <motion.div key={post.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <PostCard post={post} currentUser={user} onUserClick={setProfileModal} />
                    </motion.div>
                  ))
              )}
            </div>
          )}
        </div>
      )}

      {profileModal && (
        <UserProfileModal user={profileModal} currentUserEmail={user?.email} onClose={() => setProfileModal(null)} />
      )}
    </div>
  );
}