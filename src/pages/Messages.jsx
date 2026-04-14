import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Search, BookOpen, ListMusic, Quote, Trophy, Smile,
  Loader2, MessageCircle, Plus, ArrowLeft, Paperclip
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserAvatar from "@/components/shared/UserAvatar";

const MOCK_CONTACTS = [
  { email: "marie@ex.com", full_name: "Marie Dupont", level: "Polymathe 🧠", avatar_url: null },
  { email: "karim@ex.com", full_name: "Karim Benzali", level: "Érudit 🎓", avatar_url: null },
  { email: "sophie@ex.com", full_name: "Sophie Laurent", level: "Érudit 🎓", avatar_url: null },
  { email: "lucas@ex.com", full_name: "Lucas Martin", level: "Penseur 💭", avatar_url: null },
  { email: "amina@ex.com", full_name: "Amina Traoré", level: "Penseur 💭", avatar_url: null },
];

const SHORTCUTS = [
  { icon: ListMusic, label: "Playlist", type: "playlist", placeholder: "🎵 J'ai une playlist pour toi !" },
  { icon: BookOpen, label: "Livre", type: "content", placeholder: "📚 Tu devrais lire ce livre !" },
  { icon: Quote, label: "Citation", type: "quote", placeholder: "💡 Citation inspirante du jour :" },
  { icon: Trophy, label: "Défi", type: "challenge", placeholder: "⚔️ Je te lance un défi !" },
  { icon: Smile, label: "Humeur", type: "none", placeholder: "😊 " },
];

function MessageBubble({ msg, isMe, meUser }) {
  let attachment = null;
  if (msg.attachment_type && msg.attachment_type !== "none" && msg.attachment_data) {
    try { attachment = JSON.parse(msg.attachment_data); } catch {}
  }

  return (
    <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      {!isMe && (
        <UserAvatar
          name={msg.sender_email?.split("@")[0]}
          size="xs"
          className="mb-1"
        />
      )}
      <div className={`max-w-[72%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
        {attachment && (
          <div className={`text-xs px-3 py-2 rounded-xl border ${isMe ? "bg-accent/10 border-accent/30 text-accent" : "bg-secondary border-border text-foreground"}`}>
            {attachment.label || "Pièce jointe"}
          </div>
        )}
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isMe
            ? "bg-accent text-white rounded-br-sm"
            : "bg-card border border-border text-foreground rounded-bl-sm"
        }`}>
          {msg.text}
        </div>
        <span className="text-[10px] text-muted-foreground px-1">
          {new Date(msg.created_date).toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

export default function Messages() {
  const [me, setMe] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [search, setSearch] = useState("");
  const bottomRef = useRef(null);
  const qc = useQueryClient();

  useEffect(() => { base44.auth.me().then(setMe); }, []);

  const { data: allMessages = [], isLoading } = useQuery({
    queryKey: ["messages", me?.email],
    queryFn: () => base44.entities.Message.filter({ recipient_email: me.email }, "-created_date", 100),
    enabled: !!me?.email,
    refetchInterval: 5000,
  });

  const { data: sentMessages = [] } = useQuery({
    queryKey: ["messages-sent", me?.email],
    queryFn: () => base44.entities.Message.filter({ sender_email: me.email }, "-created_date", 100),
    enabled: !!me?.email,
    refetchInterval: 5000,
  });

  // All messages in conversation
  const conversation = selectedContact
    ? [...allMessages, ...sentMessages]
        .filter(m =>
          (m.sender_email === me?.email && m.recipient_email === selectedContact.email) ||
          (m.sender_email === selectedContact.email && m.recipient_email === me?.email)
        )
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    : [];

  // Unique conversations
  const conversationEmails = [...new Set([
    ...allMessages.map(m => m.sender_email),
    ...sentMessages.map(m => m.recipient_email),
  ])].filter(e => e !== me?.email);

  const contacts = MOCK_CONTACTS.filter(c =>
    c.email !== me?.email &&
    (c.full_name.toLowerCase().includes(search.toLowerCase()) || conversationEmails.includes(c.email))
  );

  const unreadCount = (contactEmail) =>
    allMessages.filter(m => m.sender_email === contactEmail && !m.is_read).length;

  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages", me?.email] });
      qc.invalidateQueries({ queryKey: ["messages-sent", me?.email] });
      setText("");
      setAttachment(null);
      setShowShortcuts(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    },
  });

  const handleSend = () => {
    if (!text.trim() || !selectedContact || !me) return;
    sendMutation.mutate({
      sender_email: me.email,
      recipient_email: selectedContact.email,
      text: text.trim(),
      attachment_type: attachment?.type || "none",
      attachment_data: attachment ? JSON.stringify({ label: attachment.label }) : null,
    });
  };

  const handleShortcut = (sc) => {
    setText(sc.placeholder);
    setAttachment({ type: sc.type, label: `${sc.icon.name} ${sc.label}` });
    setShowShortcuts(false);
  };

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [conversation.length]);

  return (
    <div className="w-full h-[calc(100vh-6rem)] flex gap-0 bg-card border border-border rounded-2xl overflow-hidden">

      {/* Sidebar contacts */}
      <div className={`${selectedContact ? "hidden md:flex" : "flex"} flex-col w-full md:w-72 border-r border-border shrink-0`}>
        <div className="p-4 border-b border-border">
          <h1 className="font-heading font-bold text-lg flex items-center gap-2 mb-3">
            <MessageCircle className="w-5 h-5 text-accent" /> Messages
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher…" className="pl-9 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contacts.map(c => {
            const unread = unreadCount(c.email);
            const isActive = selectedContact?.email === c.email;
            return (
              <button key={c.email} onClick={() => setSelectedContact(c)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left border-b border-border/50 ${isActive ? "bg-accent/5" : ""}`}>
                <UserAvatar user={c} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{c.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.level}</p>
                </div>
                {unread > 0 && (
                  <span className="bg-accent text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                    {unread}
                  </span>
                )}
              </button>
            );
          })}
          {contacts.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm px-4">
              <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
              Suivez des utilisateurs pour leur envoyer des messages
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-card/80 backdrop-blur shrink-0">
            <button onClick={() => setSelectedContact(null)} className="md:hidden text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <UserAvatar user={selectedContact} size="sm" />
            <div>
              <p className="font-semibold text-sm">{selectedContact.full_name}</p>
              <p className="text-xs text-muted-foreground">{selectedContact.level}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading && <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-accent" /></div>}
            {conversation.length === 0 && !isLoading && (
              <div className="text-center py-12 text-muted-foreground">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Commencez la conversation avec {selectedContact.full_name} !</p>
              </div>
            )}
            {conversation.map(msg => (
              <MessageBubble key={msg.id} msg={msg} isMe={msg.sender_email === me?.email} meUser={me} />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="p-3 border-t border-border bg-card/80 backdrop-blur">
            {/* Attachment preview */}
            {attachment && (
              <div className="flex items-center gap-2 mb-2 px-2">
                <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full border border-accent/20">
                  📎 {attachment.label}
                </span>
                <button onClick={() => setAttachment(null)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
              </div>
            )}

            {/* Shortcuts panel */}
            <AnimatePresence>
              {showShortcuts && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className="flex gap-2 mb-2 flex-wrap">
                  {SHORTCUTS.map(sc => (
                    <button key={sc.type + sc.label} onClick={() => handleShortcut(sc)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-accent/10 hover:text-accent border border-border rounded-full text-xs font-medium transition-colors">
                      <sc.icon className="w-3.5 h-3.5" /> {sc.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2 items-center">
              <button
                onClick={() => setShowShortcuts(s => !s)}
                className={`p-2 rounded-xl transition-colors shrink-0 ${showShortcuts ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
              >
                <Plus className="w-5 h-5" />
              </button>
              <Input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder={`Message à ${selectedContact.full_name}…`}
                className="flex-1 text-sm"
              />
              <Button size="icon" onClick={handleSend} disabled={!text.trim() || sendMutation.isPending} className="shrink-0">
                {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground flex-col gap-3">
          <MessageCircle className="w-16 h-16 opacity-10" />
          <p className="text-sm">Sélectionnez une conversation</p>
        </div>
      )}
    </div>
  );
}