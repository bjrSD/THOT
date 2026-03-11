import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Clock, CheckCircle2, Send, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function Support() {
  const [form, setForm] = useState({ subject: "", category: "", message: "", email: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: "support@thot.app",
      subject: `[Support THOT] ${form.category} - ${form.subject}`,
      body: `Email: ${form.email}\nCatégorie: ${form.category}\n\nMessage:\n${form.message}`,
    });
    setSending(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-heading text-4xl font-bold mb-3">Service client</h1>
            <p className="text-muted-foreground text-lg">Notre équipe est là pour vous aider. Temps de réponse moyen : 4h.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {[
            { icon: MessageCircle, title: "Chat en direct", desc: "Disponible 9h-18h (lun-ven)", badge: "Rapide", color: "text-accent" },
            { icon: Mail, title: "Email", desc: "support@thot.app", badge: "< 4h", color: "text-blue-500" },
            { icon: Clock, title: "FAQ", desc: "Réponses instantanées", badge: "24/7", color: "text-green-500" },
          ].map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="bg-card rounded-2xl border border-border p-5 text-center hover:shadow-md transition-shadow">
                <c.icon className={`w-8 h-8 ${c.color} mx-auto mb-3`} />
                <h3 className="font-medium mb-1">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
                <span className="inline-block mt-2 text-xs bg-secondary px-2 py-0.5 rounded-full">{c.badge}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-heading font-bold text-xl mb-6">Envoyer un message</h2>
            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="font-heading font-bold text-lg mb-2">Message envoyé !</h3>
                <p className="text-muted-foreground text-sm">Nous vous répondrons dans les plus brefs délais à l'adresse fournie.</p>
                <Button variant="outline" className="mt-4" onClick={() => setSent(false)}>Nouveau message</Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Votre email *</Label>
                  <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" placeholder="vous@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label>Catégorie *</Label>
                  <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">🐛 Bug / Problème technique</SelectItem>
                      <SelectItem value="billing">💳 Facturation / Abonnement</SelectItem>
                      <SelectItem value="feature">💡 Suggestion de fonctionnalité</SelectItem>
                      <SelectItem value="account">👤 Mon compte</SelectItem>
                      <SelectItem value="integration">🔗 Intégrations</SelectItem>
                      <SelectItem value="other">📬 Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sujet *</Label>
                  <Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Décrivez brièvement votre problème" required />
                </div>
                <div className="space-y-2">
                  <Label>Message *</Label>
                  <Textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={5} placeholder="Décrivez en détail votre demande..." required />
                </div>
                <Button type="submit" className="w-full" disabled={sending || !form.email || !form.category || !form.subject || !form.message}>
                  {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Envoyer
                </Button>
              </form>
            )}
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="font-heading font-bold text-lg mb-4">Liens rapides</h2>
              <div className="space-y-2">
                {[
                  { label: "Foire aux questions", page: "FAQ" },
                  { label: "Politique de confidentialité", page: "Privacy" },
                  { label: "Conditions générales", page: "Terms" },
                  { label: "Nos offres Premium", page: "Premium" },
                  { label: "Intégrations", page: "Integrations" },
                ].map((link, i) => (
                  <Link key={i} to={createPageUrl(link.page)}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                      <span className="text-sm">{link.label}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="bg-accent/5 rounded-2xl border border-accent/20 p-5">
              <h3 className="font-medium mb-2">⚡ Utilisateurs Premium</h3>
              <p className="text-sm text-muted-foreground">Bénéficiez d'un accès prioritaire au support avec un temps de réponse garanti en moins de 1 heure.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}