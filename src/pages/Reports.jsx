import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Download, Mail, Clock, Crown, Check, Loader2,
  BookOpen, Headphones, Play, Flame, Trophy, BarChart3, Zap,
  ChevronDown, ChevronUp, Settings, Send, RefreshCw, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getUserLevel, TYPE_LABELS, CATEGORY_LABELS } from "@/components/shared/KPUtils";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildReportData(user, contents, activities, period) {
  const now = new Date();
  let start, end, label;
  if (period === "monthly") {
    start = startOfMonth(subMonths(now, 0));
    end = now;
    label = format(now, "MMMM yyyy", { locale: fr });
  } else if (period === "annual") {
    start = new Date(now.getFullYear(), 0, 1);
    end = now;
    label = String(now.getFullYear());
  } else {
    // custom previous month
    const d = subMonths(now, period);
    start = startOfMonth(d);
    end = endOfMonth(d);
    label = format(d, "MMMM yyyy", { locale: fr });
  }

  const inPeriod = (dateStr) => dateStr && isWithinInterval(new Date(dateStr), { start, end });

  const completedInPeriod = contents.filter(c => c.status === "completed" && inPeriod(c.completed_date));
  const actInPeriod = activities.filter(a => inPeriod(a.created_date));

  const kpEarned = actInPeriod.reduce((sum, a) => sum + (a.kp_earned || 0), 0);

  const byType = {
    book: completedInPeriod.filter(c => c.type === "book").length,
    podcast: completedInPeriod.filter(c => c.type === "podcast").length,
    video: completedInPeriod.filter(c => c.type === "video").length,
    article: completedInPeriod.filter(c => c.type === "article").length,
  };

  const byCategory = {};
  completedInPeriod.forEach(c => {
    if (c.category) byCategory[c.category] = (byCategory[c.category] || 0) + 1;
  });

  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  const totalCompleted = completedInPeriod.length;
  const streak = user?.current_streak || 0;
  const level = getUserLevel(user?.total_kp || 0);

  return { label, start, end, completedInPeriod, kpEarned, byType, byCategory, topCategory, totalCompleted, streak, level, actInPeriod };
}

// ─── Components ─────────────────────────────────────────────────────────────

function PremiumGate({ children, isPremium, feature }) {
  if (isPremium) return children;
  return (
    <div className="relative">
      <div className="pointer-events-none opacity-40 blur-sm select-none">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/80 rounded-xl backdrop-blur-sm">
        <Lock className="w-5 h-5 text-yellow-500 mb-1.5" />
        <p className="text-xs font-semibold text-center px-4">{feature} — Premium</p>
        <a href="/Premium" className="mt-2 text-xs text-accent underline">Passer Premium →</a>
      </div>
    </div>
  );
}

function StatBadge({ icon: Icon, label, value, color }) {
  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-xl bg-card border border-border text-center`}>
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-2`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ReportView({ report, isPremium }) {
  if (!report) return null;
  const { label, completedInPeriod, kpEarned, byType, byCategory, topCategory, totalCompleted, streak, level } = report;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-accent/20 rounded-2xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-accent uppercase tracking-wider mb-1">Rapport THOT</p>
            <h2 className="font-heading text-xl font-bold capitalize">{label}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{level.icon} {level.name} · {streak}j de streak</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-accent">{kpEarned}</p>
            <p className="text-xs text-muted-foreground">KP gagnés</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBadge icon={BookOpen} label="Livres lus" value={byType.book} color="bg-primary/10 text-primary" />
        <StatBadge icon={Headphones} label="Podcasts" value={byType.podcast} color="bg-accent/10 text-accent" />
        <StatBadge icon={Play} label="Vidéos" value={byType.video} color="bg-green-500/10 text-green-500" />
        <StatBadge icon={FileText} label="Articles" value={byType.article} color="bg-orange-500/10 text-orange-500" />
      </div>

      {/* Summary */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
        <h3 className="font-heading font-semibold text-sm">Résumé de la période</h3>
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <div className="p-3 rounded-xl bg-secondary/40">
            <p className="text-xs text-muted-foreground mb-0.5">Contenus terminés</p>
            <p className="font-black text-lg">{totalCompleted}</p>
          </div>
          <div className="p-3 rounded-xl bg-secondary/40">
            <p className="text-xs text-muted-foreground mb-0.5">KP accumulés</p>
            <p className="font-black text-lg text-accent">{kpEarned}</p>
          </div>
          <div className="p-3 rounded-xl bg-secondary/40">
            <p className="text-xs text-muted-foreground mb-0.5">Domaine principal</p>
            <p className="font-black text-lg">{topCategory ? CATEGORY_LABELS[topCategory[0]] || topCategory[0] : "—"}</p>
          </div>
        </div>
      </div>

      {/* Completed list — premium blur */}
      <PremiumGate isPremium={isPremium} feature="Liste complète des contenus">
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="font-heading font-semibold text-sm mb-3">Contenus terminés ({completedInPeriod.length})</h3>
          {completedInPeriod.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aucun contenu terminé sur cette période</p>
          ) : (
            <div className="space-y-2">
              {completedInPeriod.slice(0, isPremium ? 100 : 3).map(c => (
                <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/30">
                  <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <span className="text-xs">{c.type === "book" ? "📚" : c.type === "podcast" ? "🎧" : c.type === "video" ? "🎬" : "📰"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.title}</p>
                    {c.author && <p className="text-xs text-muted-foreground truncate">{c.author}</p>}
                  </div>
                  {c.rating && <span className="text-xs text-yellow-500">{"★".repeat(c.rating)}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </PremiumGate>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

const PERIODS = [
  { id: "monthly", label: "Ce mois" },
  { id: "annual", label: "Cette année" },
  { id: 1, label: "Mois dernier" },
  { id: 2, label: "Il y a 2 mois" },
  { id: 3, label: "Il y a 3 mois" },
];

export default function Reports() {
  const [user, setUser] = useState(null);
  const [period, setPeriod] = useState("monthly");
  const [emailSent, setEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [prefs, setPrefs] = useState({ monthly: false, annual: false });
  const [prefSaved, setPrefSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyEmailSent, setHistoryEmailSent] = useState({});
  const reportRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setPrefs({
        monthly: u?.report_monthly_email || false,
        annual: u?.report_annual_email || false,
      });
    });
  }, []);

  const { data: contents = [] } = useQuery({
    queryKey: ["contents"],
    queryFn: () => base44.entities.Content.list("-updated_date", 500),
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["activities"],
    queryFn: () => base44.entities.Activity.list("-created_date", 200),
  });

  if (!user) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  const isPremium = user.role === "admin" || user.is_premium;
  const report = buildReportData(user, contents, activities, period);

  // Past reports (last 6 months)
  const historyReports = [1, 2, 3, 4, 5, 6].map(n => {
    const r = buildReportData(user, contents, activities, n);
    return { ...r, id: `month-${n}`, offset: n };
  });

  const buildEmailBody = (r) => {
    return `<h2 style="color:#1a4fa0">Rapport THOT — ${r.label}</h2>
<p>Bonjour ${user.full_name || ""},</p>
<p>Voici votre rapport d'apprentissage THOT pour la période : <strong>${r.label}</strong></p>
<ul>
  <li>📚 Livres lus : <strong>${r.byType.book}</strong></li>
  <li>🎧 Podcasts : <strong>${r.byType.podcast}</strong></li>
  <li>🎬 Vidéos : <strong>${r.byType.video}</strong></li>
  <li>📰 Articles : <strong>${r.byType.article}</strong></li>
  <li>⚡ KP gagnés : <strong>${r.kpEarned}</strong></li>
  <li>🔥 Streak : <strong>${r.streak} jours</strong></li>
  ${r.topCategory ? `<li>🎯 Domaine principal : <strong>${CATEGORY_LABELS[r.topCategory[0]] || r.topCategory[0]}</strong></li>` : ""}
</ul>
${r.completedInPeriod.length > 0 ? `
<h3>Contenus terminés :</h3>
<ul>${r.completedInPeriod.map(c => `<li>${c.type === "book" ? "📚" : c.type === "podcast" ? "🎧" : "🎬"} ${c.title}${c.author ? ` — ${c.author}` : ""}${c.rating ? ` (${"★".repeat(c.rating)})` : ""}</li>`).join("")}</ul>` : ""}
<p style="margin-top:20px;color:#666;font-size:12px">Continuez à apprendre sur <a href="https://thot.app">THOT</a> 🚀</p>`;
  };

  const handleSendEmail = async (r = report) => {
    setEmailSending(true);
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `📊 Rapport THOT — ${r.label}`,
      body: buildEmailBody(r),
    });
    setEmailSending(false);
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 4000);
  };

  const handleSendHistoryEmail = async (r) => {
    setHistoryEmailSent(prev => ({ ...prev, [r.id]: "loading" }));
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `📊 Rapport THOT — ${r.label}`,
      body: buildEmailBody(r),
    });
    setHistoryEmailSent(prev => ({ ...prev, [r.id]: "sent" }));
    setTimeout(() => setHistoryEmailSent(prev => ({ ...prev, [r.id]: null })), 3000);
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    const r = report;
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    doc.setFillColor(26, 79, 160);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("THOT — Rapport d'apprentissage", 15, 18);
    doc.setFontSize(13);
    doc.setFont("helvetica", "normal");
    doc.text(`Période : ${r.label}`, 15, 32);

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(12);
    let y = 55;
    doc.setFont("helvetica", "bold");
    doc.text("Résumé", 15, y); y += 8;
    doc.setFont("helvetica", "normal");
    doc.text(`Livres lus : ${r.byType.book}`, 20, y); y += 7;
    doc.text(`Podcasts écoutés : ${r.byType.podcast}`, 20, y); y += 7;
    doc.text(`Vidéos regardées : ${r.byType.video}`, 20, y); y += 7;
    doc.text(`Articles lus : ${r.byType.article}`, 20, y); y += 7;
    doc.text(`KP gagnés : ${r.kpEarned}`, 20, y); y += 7;
    doc.text(`Streak : ${r.streak} jours`, 20, y); y += 7;
    if (r.topCategory) { doc.text(`Domaine principal : ${CATEGORY_LABELS[r.topCategory[0]] || r.topCategory[0]}`, 20, y); y += 7; }

    if (r.completedInPeriod.length > 0) {
      y += 5;
      doc.setFont("helvetica", "bold");
      doc.text(`Contenus terminés (${r.completedInPeriod.length})`, 15, y); y += 8;
      doc.setFont("helvetica", "normal");
      r.completedInPeriod.forEach(c => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(`• ${c.title}${c.author ? ` — ${c.author}` : ""}`, 20, y); y += 6;
      });
    }

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Généré le ${format(new Date(), "dd/MM/yyyy 'à' HH:mm", { locale: fr })} — thot.app`, 15, 285);

    doc.save(`rapport-thot-${r.label.replace(/\s/g, "-")}.pdf`);
    setPdfLoading(false);
  };

  const handleSavePrefs = async () => {
    await base44.auth.updateMe({ report_monthly_email: prefs.monthly, report_annual_email: prefs.annual });
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Mes Rapports</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Suivez votre progression dans le temps</p>
        </div>
        {!isPremium && (
          <a href="/Premium">
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-2 hover:bg-yellow-500/15 transition-colors">
              <Crown className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-semibold text-yellow-600">Débloquer tout avec Premium</span>
            </div>
          </a>
        )}
      </div>

      {/* Period selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {PERIODS.map(p => (
          <button key={p.id} onClick={() => setPeriod(p.id)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${period === p.id ? "bg-accent text-accent-foreground border-accent" : "bg-card border-border hover:border-accent/40"}`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Report view */}
      <div ref={reportRef}>
        <ReportView report={report} isPremium={isPremium} />
      </div>

      {/* Action bar */}
      <div className="bg-card rounded-2xl border border-border p-4 flex flex-wrap gap-3">
        {/* Download PDF */}
        <PremiumGate isPremium={isPremium} feature="Téléchargement PDF">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleDownloadPDF} disabled={pdfLoading}>
            {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Télécharger PDF
          </Button>
        </PremiumGate>

        {/* Send email */}
        <PremiumGate isPremium={isPremium} feature="Envoi par email">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleSendEmail(report)} disabled={emailSending || emailSent}>
            {emailSending ? <Loader2 className="w-4 h-4 animate-spin" /> : emailSent ? <Check className="w-4 h-4 text-green-500" /> : <Mail className="w-4 h-4" />}
            {emailSent ? "Envoyé !" : "Recevoir par email"}
          </Button>
        </PremiumGate>

        {emailSent && (
          <p className="text-xs text-green-600 flex items-center gap-1 self-center">
            <Check className="w-3.5 h-3.5" /> Rapport envoyé à {user.email}
          </p>
        )}
      </div>

      {/* Email preferences */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4 text-accent" />
            <h2 className="font-heading font-semibold text-sm">Préférences d'envoi automatique</h2>
            {!isPremium && <span className="ml-auto text-xs bg-yellow-500/15 text-yellow-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><Lock className="w-3 h-3" /> Premium</span>}
          </div>

          <div className={`space-y-4 ${!isPremium ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="font-medium text-sm">Rapport mensuel automatique</p>
                <p className="text-xs text-muted-foreground">Reçu le 1er de chaque mois par email</p>
              </div>
              <Switch checked={prefs.monthly} onCheckedChange={v => setPrefs({ ...prefs, monthly: v })} />
            </div>
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="font-medium text-sm">Rapport annuel automatique</p>
                <p className="text-xs text-muted-foreground">Reçu le 1er janvier de chaque année</p>
              </div>
              <Switch checked={prefs.annual} onCheckedChange={v => setPrefs({ ...prefs, annual: v })} />
            </div>
            <div className="pt-1 flex items-center gap-3">
              <p className="text-xs text-muted-foreground flex-1">Email de réception : <span className="font-medium text-foreground">{user.email}</span></p>
              <Button size="sm" onClick={handleSavePrefs} disabled={!isPremium} className="gap-1.5">
                {prefSaved ? <><Check className="w-3.5 h-3.5" /> Sauvegardé</> : "Sauvegarder"}
              </Button>
            </div>
          </div>

          {!isPremium && (
            <a href="/Premium" className="mt-3 inline-flex items-center gap-1.5 text-xs text-accent underline">
              <Crown className="w-3.5 h-3.5 text-yellow-500" /> Passer Premium pour activer l'envoi automatique
            </a>
          )}
        </div>
      </motion.div>

      {/* History */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center gap-3 p-5 hover:bg-secondary/30 transition-colors"
          >
            <Clock className="w-4 h-4 text-accent" />
            <span className="font-heading font-semibold text-sm flex-1 text-left">Historique des rapports</span>
            {!isPremium && <span className="text-xs bg-yellow-500/15 text-yellow-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><Lock className="w-3 h-3" /> Premium</span>}
            {showHistory ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="border-t border-border">
                <div className={`divide-y divide-border ${!isPremium ? "relative" : ""}`}>
                  {!isPremium && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm rounded-b-2xl">
                      <Lock className="w-6 h-6 text-yellow-500 mb-2" />
                      <p className="text-sm font-semibold mb-1">Historique complet — Premium</p>
                      <a href="/Premium" className="text-xs text-accent underline">Passer Premium →</a>
                    </div>
                  )}
                  {historyReports.map((r) => (
                    <div key={r.id} className="flex items-center gap-4 p-4 hover:bg-secondary/20 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                        <BarChart3 className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm capitalize">{r.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.totalCompleted} contenus · {r.kpEarned} KP
                          {r.topCategory ? ` · ${CATEGORY_LABELS[r.topCategory[0]] || r.topCategory[0]}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setPeriod(r.offset)}
                          title="Voir ce rapport"
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-accent"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSendHistoryEmail(r)}
                          title="Renvoyer par email"
                          disabled={historyEmailSent[r.id] === "loading"}
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-accent"
                        >
                          {historyEmailSent[r.id] === "loading" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : historyEmailSent[r.id] === "sent" ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}