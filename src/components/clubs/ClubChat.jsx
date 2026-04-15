import React, { useState, useRef, useEffect } from "react";
import { Heart, Send, CornerUpLeft, SmilePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMOJI_REACTIONS = ["😂", "❤️", "🔥", "👏", "🤯", "😍", "👍", "🧠"];

function LikesPopover({ likers, onClose }) {
  return (
    <div className="absolute bottom-full left-0 mb-1 bg-card border border-border rounded-xl shadow-xl z-30 p-3 min-w-[140px]" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-muted-foreground">Aimé par</p>
        <button onClick={onClose}><X className="w-3 h-3 text-muted-foreground" /></button>
      </div>
      {likers.length === 0
        ? <p className="text-xs text-muted-foreground">Personne encore</p>
        : likers.map((l, i) => <p key={i} className="text-xs py-0.5">👤 {l}</p>)
      }
    </div>
  );
}

function MessageBubble({ msg, currentUser, onLike, onReact, onReply }) {
  const isMe = msg.author === "Vous";
  const [showLikers, setShowLikers] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const hasLiked = msg.likers?.includes(currentUser);

  return (
    <div className={`flex items-start gap-2 group ${isMe ? "flex-row-reverse" : ""}`}>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
        {msg.author[0]}
      </div>
      <div className={`max-w-[78%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
        {/* Reply preview */}
        {msg.replyTo && (
          <div className={`text-[10px] text-muted-foreground mb-1 px-2 py-1 rounded-lg bg-secondary/50 border-l-2 border-accent max-w-[90%] truncate`}>
            ↩ {msg.replyTo.author}: {msg.replyTo.text}
          </div>
        )}

        {!isMe && <p className="text-xs text-accent font-medium mb-0.5">{msg.author}</p>}

        <div className={`rounded-2xl px-3 py-2 text-sm ${isMe ? "bg-accent text-accent-foreground" : "bg-secondary"}`}>
          {msg.text}
        </div>

        {/* Reactions row */}
        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(msg.reactions).map(([emoji, count]) => (
              <button key={emoji} onClick={() => onReact(msg.id, emoji)}
                className="inline-flex items-center gap-0.5 text-xs bg-secondary hover:bg-secondary/80 border border-border rounded-full px-2 py-0.5 transition-colors">
                {emoji} <span className="font-semibold">{count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-1 relative">
          {/* Like */}
          <div className="relative">
            <button
              onClick={() => onLike(msg.id)}
              className={`flex items-center gap-0.5 text-xs transition-colors ${hasLiked ? "text-red-500" : "text-muted-foreground hover:text-red-400"}`}>
              <Heart className={`w-3 h-3 ${hasLiked ? "fill-red-500" : ""}`} />
              <span>{msg.likes || 0}</span>
            </button>
            {showLikers && <LikesPopover likers={msg.likers || []} onClose={() => setShowLikers(false)} />}
          </div>
          <button onClick={() => setShowLikers(!showLikers)} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            voir
          </button>

          {/* Reply */}
          <button onClick={() => onReply(msg)} className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-accent transition-colors opacity-0 group-hover:opacity-100">
            <CornerUpLeft className="w-3 h-3" /> Répondre
          </button>

          {/* Emoji reaction */}
          <div className="relative">
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-xs text-muted-foreground hover:text-accent transition-colors opacity-0 group-hover:opacity-100">
              <SmilePlus className="w-3.5 h-3.5" />
            </button>
            {showEmojiPicker && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowEmojiPicker(false)} />
                <div className={`absolute bottom-full ${isMe ? "right-0" : "left-0"} mb-1 bg-card border border-border rounded-xl shadow-xl z-20 p-2 flex gap-1`}>
                  {EMOJI_REACTIONS.map(e => (
                    <button key={e} onClick={() => { onReact(msg.id, e); setShowEmojiPicker(false); }}
                      className="text-lg hover:scale-125 transition-transform">
                      {e}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <p className="text-[10px] text-muted-foreground">{msg.time}</p>
        </div>
      </div>
    </div>
  );
}

export default function ClubChat({ isMember, onJoin, joining }) {
  const currentUser = "Vous";
  const [messages, setMessages] = useState([
    { id: 1, author: "Marie D.", text: "Je viens de terminer Zero to One ! Absolument incroyable. Qui l'a lu ?", time: "il y a 2h", likes: 5, likers: ["Karim B.", "Sophie L.", "Lucas M.", "Emma W.", "Noah P."], reactions: { "🔥": 2, "👏": 1 }, replyTo: null },
    { id: 2, author: "Karim B.", text: "Je le lis en ce moment ! La partie sur les monopoles est fascinante.", time: "il y a 1h", likes: 3, likers: ["Marie D.", "Sophie L.", "Lucas M."], reactions: { "🤯": 1 }, replyTo: null },
    { id: 3, author: "Sophie L.", text: "Prochaine lecture du club : The Lean Startup. On commence lundi ?", time: "il y a 30min", likes: 8, likers: ["Karim B.", "Marie D.", "Lucas M.", "Emma W.", "Noah P.", "Jules B.", "Amina T.", "Yann R."], reactions: { "👍": 3, "❤️": 2 }, replyTo: null },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(), author: "Vous", text: newMessage, time: "à l'instant",
      likes: 0, likers: [], reactions: {}, replyTo: replyingTo || null,
    }]);
    setNewMessage("");
    setReplyingTo(null);
  };

  const handleLike = (id) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== id) return m;
      const hasLiked = m.likers?.includes(currentUser);
      return {
        ...m,
        likes: hasLiked ? m.likes - 1 : m.likes + 1,
        likers: hasLiked ? m.likers.filter(l => l !== currentUser) : [...(m.likers || []), currentUser],
      };
    }));
  };

  const handleReact = (id, emoji) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== id) return m;
      const reactions = { ...m.reactions };
      reactions[emoji] = (reactions[emoji] || 0) + 1;
      return { ...m, reactions };
    }));
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-border flex items-center gap-2">
        <span className="text-lg">💬</span>
        <span className="font-semibold text-sm">Discussion du club</span>
      </div>

      <div className="h-[460px] overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <MessageBubble
            key={msg.id} msg={msg} currentUser={currentUser}
            onLike={handleLike} onReact={handleReact} onReply={setReplyingTo}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {isMember ? (
        <div className="border-t border-border">
          {replyingTo && (
            <div className="flex items-center gap-2 px-3 pt-2">
              <div className="flex-1 text-xs text-muted-foreground bg-secondary/50 rounded-lg px-2 py-1 border-l-2 border-accent truncate">
                ↩ Répondre à <span className="font-semibold text-accent">{replyingTo.author}</span>: {replyingTo.text}
              </div>
              <button onClick={() => setReplyingTo(null)}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
            </div>
          )}
          <div className="p-3 flex gap-2">
            <Input placeholder="Écrire un message..." value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              className="text-sm" />
            <Button size="icon" onClick={handleSend} disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center border-t border-border">
          <p className="text-sm text-muted-foreground mb-2">Rejoignez le club pour participer à la discussion</p>
          <Button size="sm" onClick={onJoin} disabled={joining}>Rejoindre le club</Button>
        </div>
      )}
    </div>
  );
}