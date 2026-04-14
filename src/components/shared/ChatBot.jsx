import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

const QUICK_QUESTIONS = [
  "Comment gagner des KP ?",
  "Comment fonctionne le streak ?",
  "Quelles sont les intégrations ?",
  "Comment passer Premium ?",
];

const INITIAL_MSG = {
  role: "assistant",
  text: "Bonjour ! 👋 Je suis l'assistant THOT. Je peux vous aider avec toutes vos questions sur l'application. Comment puis-je vous aider ?",
};

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    const context = messages.map(m => `${m.role === "user" ? "Utilisateur" : "Assistant"}: ${m.text}`).join("\n");
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es l'assistant de support de THOT, une application de suivi d'apprentissage (livres, podcasts, vidéos, articles) avec gamification (Knowledge Points, niveaux, streaks, badges, challenges).

Contexte de la conversation précédente:
${context}

Question de l'utilisateur: ${userText}

Réponds en français, de manière concise et utile, en te concentrant sur les fonctionnalités de THOT. Si la question sort du cadre de l'application, redirige poliment vers support@thot.app.`,
    });

    setMessages(prev => [...prev, { role: "assistant", text: response }]);
    setLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(true)}
        className={`hidden lg:flex fixed bottom-24 right-6 z-50 w-12 h-12 rounded-full items-center justify-center transition-all hover:scale-110 ${open ? "!hidden" : ""}`}
        style={{
          background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)",
          boxShadow: "0 0 16px rgba(59,130,246,0.6), 0 0 32px rgba(59,130,246,0.25), 0 4px 12px rgba(0,0,0,0.3)"
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="w-5 h-5 text-white" />
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="hidden lg:block fixed bottom-6 right-6 z-50 w-80 md:w-96 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">Assistant THOT</p>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-xs text-white/70">En ligne</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-72 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-xl px-3 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick questions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button key={i} onClick={() => send(q)}
                    className="text-xs bg-accent/10 text-accent hover:bg-accent/20 px-2.5 py-1 rounded-full transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-border flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !loading && send()}
                placeholder="Posez votre question..."
                className="text-sm"
                disabled={loading}
              />
              <Button size="icon" onClick={() => send()} disabled={loading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}