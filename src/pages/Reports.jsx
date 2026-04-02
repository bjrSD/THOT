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
    const periodLabel = r.label.charAt(0).toUpperCase() + r.label.slice(1);
    const topDomainLabel = r.topCategory ? (CATEGORY_LABELS[r.topCategory[0]] || r.topCategory[0]) : "—";
    const domFmtEntry = Object.entries(r.byType).sort((a,b) => b[1]-a[1])[0];
    const domFmtLabel = domFmtEntry?.[0] === "book" ? "Livres" : domFmtEntry?.[0] === "podcast" ? "Podcasts" : domFmtEntry?.[0] === "video" ? "Vidéos" : "Articles";
    const contentsHtml = r.completedInPeriod.length > 0
      ? r.completedInPeriod.map(c => `
        <tr>
          <td style="padding:10px 16px;border-bottom:1px solid #f0f4f8;">
            <span style="font-size:16px">${c.type==="book"?"📚":c.type==="podcast"?"🎧":c.type==="video"?"🎬":"📰"}</span>
            <span style="margin-left:8px;font-weight:600;color:#111827;">${c.title}</span>
            ${c.author ? `<span style="color:#6b7280;font-size:13px;"> — ${c.author}</span>` : ""}
            ${c.rating ? `<span style="color:#f59e0b;margin-left:8px;">${"★".repeat(c.rating)}</span>` : ""}
          </td>
        </tr>`).join("")
      : `<tr><td style="padding:16px;color:#6b7280;text-align:center;font-style:italic;">Aucun contenu terminé sur cette période</td></tr>`;

    return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rapport THOT</title></head>
<body style="margin:0;padding:0;background:#f3f6fb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#111827;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f6fb;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a4fa0 0%,#2563eb 60%,#1e3a8a 100%);padding:40px 40px 32px;">
            <table width="100%">
              <tr>
                <td>
                  <div style="font-size:32px;font-weight:900;color:#ffffff;letter-spacing:-1px;margin-bottom:4px;">THOT</div>
                  <div style="width:32px;height:3px;background:#60a5fa;border-radius:2px;margin-bottom:12px;"></div>
                  <div style="font-size:13px;color:#93c5fd;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Rapport d'apprentissage</div>
                </td>
                <td align="right" valign="top">
                  <div style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);border-radius:12px;padding:12px 18px;display:inline-block;">
                    <div style="font-size:11px;color:#bfdbfe;margin-bottom:3px;text-transform:uppercase;letter-spacing:1px;">Période</div>
                    <div style="font-size:15px;color:#ffffff;font-weight:700;">${periodLabel}</div>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- GREETING -->
        <tr>
          <td style="padding:32px 40px 0;">
            <p style="font-size:22px;font-weight:700;color:#111827;margin:0 0 8px;">Bonjour ${user?.full_name?.split(" ")[0] || ""}  👋</p>
            <p style="font-size:15px;color:#6b7280;margin:0;line-height:1.6;">
              Voici votre rapport d'apprentissage THOT pour la période <strong style="color:#1a4fa0;">${periodLabel}</strong>.<br>
              Ce rapport synthétise votre activité, votre progression et l'évolution de votre profil intellectuel.
            </p>
          </td>
        </tr>

        <!-- DIVIDER -->
        <tr><td style="padding:24px 40px 0;"><div style="height:1px;background:linear-gradient(90deg,#e5e7eb,#3b82f6,#e5e7eb);"></div></td></tr>

        <!-- KPI GRID -->
        <tr>
          <td style="padding:28px 40px 0;">
            <p style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#6b7280;font-weight:600;margin:0 0 16px;">Chiffres clés</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="25%" style="padding:0 6px 0 0;">
                  <div style="background:#eff6ff;border-radius:12px;padding:16px;text-align:center;border-top:3px solid #1a4fa0;">
                    <div style="font-size:28px;font-weight:900;color:#1a4fa0;">${r.totalCompleted}</div>
                    <div style="font-size:11px;color:#6b7280;margin-top:4px;">📚 Contenus</div>
                  </div>
                </td>
                <td width="25%" style="padding:0 6px;">
                  <div style="background:#eff6ff;border-radius:12px;padding:16px;text-align:center;border-top:3px solid #2196f3;">
                    <div style="font-size:28px;font-weight:900;color:#2196f3;">${r.kpEarned}</div>
                    <div style="font-size:11px;color:#6b7280;margin-top:4px;">⚡ KP gagnés</div>
                  </div>
                </td>
                <td width="25%" style="padding:0 6px;">
                  <div style="background:#fff7ed;border-radius:12px;padding:16px;text-align:center;border-top:3px solid #f59e0b;">
                    <div style="font-size:28px;font-weight:900;color:#f59e0b;">${r.streak}</div>
                    <div style="font-size:11px;color:#6b7280;margin-top:4px;">🔥 Streak (jours)</div>
                  </div>
                </td>
                <td width="25%" style="padding:0 0 0 6px;">
                  <div style="background:#f5f3ff;border-radius:12px;padding:16px;text-align:center;border-top:3px solid #8b5cf6;">
                    <div style="font-size:14px;font-weight:900;color:#8b5cf6;margin-top:4px;">${topDomainLabel}</div>
                    <div style="font-size:11px;color:#6b7280;margin-top:4px;">🧠 Domaine #1</div>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- FORMAT ROW -->
        <tr>
          <td style="padding:20px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;padding:16px;">
              <tr>
                <td style="padding:8px 12px;text-align:center;border-right:1px solid #e5e7eb;">
                  <div style="font-size:20px;">📚</div>
                  <div style="font-size:20px;font-weight:800;color:#1a4fa0;">${r.byType.book}</div>
                  <div style="font-size:11px;color:#9ca3af;">Livres</div>
                </td>
                <td style="padding:8px 12px;text-align:center;border-right:1px solid #e5e7eb;">
                  <div style="font-size:20px;">🎧</div>
                  <div style="font-size:20px;font-weight:800;color:#2196f3;">${r.byType.podcast}</div>
                  <div style="font-size:11px;color:#9ca3af;">Podcasts</div>
                </td>
                <td style="padding:8px 12px;text-align:center;border-right:1px solid #e5e7eb;">
                  <div style="font-size:20px;">🎬</div>
                  <div style="font-size:20px;font-weight:800;color:#10b981;">${r.byType.video}</div>
                  <div style="font-size:11px;color:#9ca3af;">Vidéos</div>
                </td>
                <td style="padding:8px 12px;text-align:center;">
                  <div style="font-size:20px;">📰</div>
                  <div style="font-size:20px;font-weight:800;color:#f59e0b;">${r.byType.article}</div>
                  <div style="font-size:11px;color:#9ca3af;">Articles</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- INSIGHT BOX -->
        <tr>
          <td style="padding:20px 40px 0;">
            <div style="background:linear-gradient(135deg,#eff6ff,#f5f3ff);border-left:4px solid #3b82f6;border-radius:0 12px 12px 0;padding:18px 20px;">
              <p style="font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#3b82f6;font-weight:700;margin:0 0 8px;">Insight du mois</p>
              <p style="font-size:14px;color:#1e3a5f;line-height:1.7;margin:0;font-style:italic;">
                Ce mois-ci, votre progression traduit une structuration plus nette de votre profil. Votre format dominant est <strong>${domFmtLabel}</strong> et votre domaine principal est <strong>${topDomainLabel}</strong>. Continuez sur cette lancée !
              </p>
            </div>
          </td>
        </tr>

        <!-- CONTENTS TABLE -->
        ${r.completedInPeriod.length > 0 ? `
        <tr>
          <td style="padding:24px 40px 0;">
            <p style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#6b7280;font-weight:600;margin:0 0 12px;">Contenus terminés (${r.completedInPeriod.length})</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
              ${contentsHtml}
            </table>
          </td>
        </tr>` : ""}

        <!-- DIVIDER -->
        <tr><td style="padding:28px 40px 0;"><div style="height:1px;background:#e5e7eb;"></div></td></tr>

        <!-- CTA BUTTON -->
        <tr>
          <td style="padding:24px 40px;" align="center">
            <a href="https://app.thot.app/Reports" style="display:inline-block;background:linear-gradient(135deg,#1a4fa0,#2563eb);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:100px;font-size:15px;font-weight:700;letter-spacing:0.3px;box-shadow:0 4px 14px rgba(37,99,235,0.35);">
              📊 Voir mon rapport complet
            </a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#1e3a5f;padding:28px 40px;">
            <table width="100%">
              <tr>
                <td>
                  <div style="font-size:20px;font-weight:900;color:#ffffff;margin-bottom:4px;">THOT</div>
                  <div style="font-size:12px;color:#93c5fd;margin-bottom:12px;">Le Strava du savoir — Suivez, progressez, brillez.</div>
                  <div style="font-size:11px;color:#60a5fa;">Généré le ${format(new Date(), "d MMMM yyyy", { locale: fr })} • ${user?.email || ""}</div>
                </td>
                <td align="right" valign="bottom">
                  <div style="font-size:12px;color:#475569;text-align:right;">
                    <div style="color:#60a5fa;font-weight:600;margin-bottom:4px;">L'équipe THOT</div>
                    <div style="color:#94a3b8;">contact@thot.app</div>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
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

    // ── Generate AI narratives ──────────────────────────────────────────────
    const topDomains = Object.entries(r.byCategory).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const totalConsumed = r.totalCompleted;
    const domainList = topDomains.map(([k]) => CATEGORY_LABELS[k] || k).join(", ");

    let aiTexts = {
      executiveSummary: `Sur cette période, vous avez développé votre profil intellectuel à travers vos lectures, écoutes et contenus enregistrés dans THOT. Ce rapport met en lumière vos domaines dominants, votre régularité, vos formats préférés et les évolutions les plus marquantes de votre carte du cerveau.`,
      activityAnalysis: `Votre activité a été globalement régulière sur la période. Vos pics d'engagement révèlent une dynamique d'apprentissage en construction.`,
      brainMapAnalysis: `Votre profil intellectuel se structure autour de ${domainList || "plusieurs domaines"}. Votre carte montre une construction intellectuelle analytique et réflexive, avec une ouverture croissante vers des contenus transversaux.`,
      progressComparison: `Par rapport à la période précédente, votre activité progresse de manière visible. Vous renforcez vos axes dominants tout en diversifiant progressivement vos centres d'intérêt.`,
      insights: `Vous développez un profil de plus en plus réflexif. Votre curiosité devient plus cohérente et votre progression ne repose pas seulement sur le volume, mais sur une meilleure continuité.`,
      recommendations: `Continuez à approfondir vos domaines forts tout en explorant des champs connexes pour enrichir votre carte intellectuelle. Stabilisez votre rythme d'apprentissage pour renforcer votre continuité globale.`,
      finalSummary: `Sur cette période, vous avez consolidé un profil intellectuel structuré. Votre régularité progresse, votre carte du cerveau gagne en structure, et vos choix de contenus deviennent plus cohérents.`,
    };

    try {
      const aiResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu rédiges les textes narratifs d'un rapport d'apprentissage premium pour l'application THOT.
Données utilisateur :
- Nom : ${r.user?.full_name || "l'utilisateur"}
- Période : ${r.label}
- Contenus terminés : ${totalConsumed}
- KP gagnés : ${r.kpEarned}
- Streak : ${r.streak} jours
- Domaine principal : ${r.topCategory ? (CATEGORY_LABELS[r.topCategory[0]] || r.topCategory[0]) : "non défini"}
- Domaines : ${domainList || "variés"}
- Livres : ${r.byType.book}, Podcasts : ${r.byType.podcast}, Vidéos : ${r.byType.video}, Articles : ${r.byType.article}
- Contenus : ${r.completedInPeriod.slice(0, 5).map(c => c.title).join(", ")}

Rédige en français, ton premium, encourageant, intelligent, non culpabilisant. Chaque texte max 3 phrases.`,
        response_json_schema: {
          type: "object",
          properties: {
            executiveSummary: { type: "string" },
            activityAnalysis: { type: "string" },
            brainMapAnalysis: { type: "string" },
            progressComparison: { type: "string" },
            insights: { type: "string" },
            recommendations: { type: "string" },
            finalSummary: { type: "string" },
          }
        }
      });
      if (aiResult) aiTexts = { ...aiTexts, ...aiResult };
    } catch (e) { /* use defaults */ }

    // ── PDF helpers ─────────────────────────────────────────────────────────
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = 210, H = 297;
    const ML = 18, MR = 18, TW = W - ML - MR;

    const hex2rgb = (h) => {
      const r = parseInt(h.slice(1,3),16), g = parseInt(h.slice(3,5),16), b = parseInt(h.slice(5,7),16);
      return [r,g,b];
    };

    const setColor = (hex) => { const [r,g,b] = hex2rgb(hex); doc.setTextColor(r,g,b); };
    const setFill  = (hex) => { const [r,g,b] = hex2rgb(hex); doc.setFillColor(r,g,b); };
    const setDraw  = (hex) => { const [r,g,b] = hex2rgb(hex); doc.setDrawColor(r,g,b); };

    const BLUE  = "#1a4fa0";
    const ACCENT= "#2196f3";
    const DARK  = "#111827";
    const GRAY  = "#6b7280";
    const LIGHT = "#f3f6fb";
    const WHITE = "#ffffff";
    const GREEN = "#10b981";
    const ORANGE= "#f59e0b";

    const wrapText = (text, maxW, fontSize) => {
      doc.setFontSize(fontSize);
      return doc.splitTextToSize(String(text || ""), maxW);
    };

    const addFooter = (pageNum, total) => {
      doc.setFontSize(8);
      setColor(GRAY);
      doc.setFont("helvetica", "normal");
      doc.text(`THOT — Rapport ${r.label} — Page ${pageNum}/${total}`, ML, H - 8);
      doc.text(`thot.app`, W - MR, H - 8, { align: "right" });
      setFill("#e5e7eb");
      doc.rect(ML, H - 12, TW, 0.3, "F");
    };

    const addSectionTitle = (title, y) => {
      setFill(ACCENT);
      doc.rect(ML, y, 3, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      setColor(DARK);
      doc.text(title, ML + 6, y + 5.5);
      return y + 14;
    };

    const kpiBox = (x, y, w, h, label, value, color) => {
      setFill(LIGHT);
      doc.roundedRect(x, y, w, h, 3, 3, "F");
      const [r2,g2,b2] = hex2rgb(color);
      doc.setFillColor(r2, g2, b2, 0.15);
      doc.roundedRect(x, y, w, 1.5, 1, 1, "F");
      doc.setFillColor(r2, g2, b2);
      doc.rect(x, y, w, 1.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      setColor(color);
      doc.text(String(value), x + w/2, y + h/2 + 1, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      setColor(GRAY);
      doc.text(label, x + w/2, y + h - 5, { align: "center" });
    };

    const analysisBox = (x, y, w, text, title) => {
      setFill(LIGHT);
      doc.roundedRect(x, y, w, 1, 1, 1, "F"); // placeholder, will be sized
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      setColor(ACCENT);
      if (title) doc.text(title, x + 4, y + 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      setColor("#374151");
      const lines = wrapText(text, w - 8, 9);
      const boxH = (title ? 8 : 4) + lines.length * 4.5 + 4;
      setFill(LIGHT);
      doc.roundedRect(x, y, w, boxH, 3, 3, "F");
      if (title) { doc.setFont("helvetica", "bold"); doc.setFontSize(9); setColor(ACCENT); doc.text(title, x + 4, y + 5); }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      setColor("#374151");
      const startY = title ? y + 9 : y + 5;
      lines.forEach((l, i) => doc.text(l, x + 4, startY + i * 4.5));
      return boxH;
    };

    // ── PAGE 1: COVER ───────────────────────────────────────────────────────
    // Background
    setFill(BLUE);
    doc.rect(0, 0, W, H, "F");
    // Decorative circles
    doc.setFillColor(255,255,255,0.03);
    doc.circle(W - 30, 50, 80, "F");
    doc.circle(30, H - 40, 60, "F");
    // Top accent bar
    setFill(ACCENT);
    doc.rect(0, 0, W, 4, "F");

    // THOT logo text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(42);
    setColor(WHITE);
    doc.text("THOT", ML, 60);

    // Subtitle line
    setFill(ACCENT);
    doc.rect(ML, 65, 30, 1.5, "F");

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    setColor("#93c5fd");
    doc.text("Rapport Mensuel", ML, 75);

    doc.setFontSize(11);
    setColor("#dbeafe");
    doc.text("Profil de progression intellectuelle", ML, 84);

    // Divider
    setFill("#ffffff30");
    doc.rect(ML, 100, TW, 0.5, "F");

    // User info block
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    setColor(WHITE);
    doc.text(`Pour : ${user?.full_name || "Utilisateur THOT"}`, ML, 114);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    setColor("#93c5fd");
    doc.text(`Période : ${format(r.start, "d MMMM yyyy", { locale: fr })} – ${format(r.end, "d MMMM yyyy", { locale: fr })}`, ML, 124);
    doc.text(`Généré le : ${format(new Date(), "d MMMM yyyy", { locale: fr })}`, ML, 133);

    // Divider
    setFill("#ffffff30");
    doc.rect(ML, 148, TW, 0.5, "F");

    // Tagline
    doc.setFontSize(13);
    doc.setFont("helvetica", "italic");
    setColor("#bfdbfe");
    const tagLines = wrapText("Un mois de lecture, d'écoute, d'exploration et de structuration de votre esprit.", TW, 13);
    tagLines.forEach((l, i) => doc.text(l, ML, 162 + i * 7));

    // Bottom
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    setColor("#60a5fa");
    doc.text("thot.app — Le Strava du savoir", ML, H - 15);
    setFill(ACCENT);
    doc.rect(0, H - 4, W, 4, "F");

    // ── PAGE 2: EXECUTIVE SUMMARY ───────────────────────────────────────────
    doc.addPage();
    setFill(WHITE);
    doc.rect(0, 0, W, H, "F");
    setFill(BLUE);
    doc.rect(0, 0, W, 20, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    setColor("#93c5fd");
    doc.text("THOT · RAPPORT MENSUEL", ML, 13);

    let y = 32;
    y = addSectionTitle("Vue d'ensemble", y);

    // Intro text box
    const introH = analysisBox(ML, y, TW, aiTexts.executiveSummary, "À propos de ce rapport");
    y += introH + 8;

    // KPI grid (3 cols x 2 rows)
    const kpiW = (TW - 8) / 3;
    const kpiH = 22;
    const kpiGap = 4;
    const kpis = [
      { label: "Contenus terminés", value: r.totalCompleted, color: BLUE },
      { label: "KP gagnés", value: r.kpEarned, color: ACCENT },
      { label: "Streak max", value: `${r.streak}j`, color: ORANGE },
      { label: "Domaine principal", value: r.topCategory ? (CATEGORY_LABELS[r.topCategory[0]] || r.topCategory[0]).slice(0,10) : "—", color: "#8b5cf6" },
      { label: "Format dominant", value: Object.entries(r.byType).sort((a,b)=>b[1]-a[1])[0]?.[0] === "book" ? "Livres" : Object.entries(r.byType).sort((a,b)=>b[1]-a[1])[0]?.[0] === "podcast" ? "Podcasts" : "Vidéos", color: GREEN },
      { label: "Livres lus", value: r.byType.book, color: "#f97316" },
    ];
    kpis.forEach((k, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      kpiBox(ML + col * (kpiW + kpiGap), y + row * (kpiH + kpiGap), kpiW, kpiH, k.label, k.value, k.color);
    });
    y += 2 * (kpiH + kpiGap) + 8;

    // Mini AI summary
    const summaryH = analysisBox(ML, y, TW, aiTexts.insights, "Résumé automatique");
    y += summaryH + 4;

    addFooter(2, 13);

    // ── PAGE 3: CHIFFRES CLÉS ───────────────────────────────────────────────
    doc.addPage();
    setFill(WHITE); doc.rect(0,0,W,H,"F");
    setFill(BLUE); doc.rect(0,0,W,20,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(10); setColor("#93c5fd");
    doc.text("THOT · CHIFFRES CLÉS", ML, 13);
    y = 32;
    y = addSectionTitle("Vos chiffres clés", y);

    // Big stat cards (2x2)
    const bigW = (TW - 6) / 2, bigH = 32;
    const bigStats = [
      { label: "Contenus consommés", value: r.totalCompleted, icon: "📚", color: BLUE },
      { label: "Points de connaissance", value: `${r.kpEarned} KP`, icon: "⚡", color: ACCENT },
      { label: "Série maximale", value: `${r.streak} jours`, icon: "🔥", color: ORANGE },
      { label: "Domaine dominant", value: r.topCategory ? (CATEGORY_LABELS[r.topCategory[0]] || r.topCategory[0]) : "—", icon: "🧠", color: "#8b5cf6" },
    ];
    bigStats.forEach((s, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const bx = ML + col * (bigW + 6), by = y + row * (bigH + 6);
      setFill(LIGHT); doc.roundedRect(bx, by, bigW, bigH, 3, 3, "F");
      const [cr,cg,cb] = hex2rgb(s.color);
      doc.setFillColor(cr,cg,cb); doc.rect(bx, by, bigW, 2, "F");
      doc.setFont("helvetica","normal"); doc.setFontSize(16);
      doc.text(s.icon, bx + 5, by + 13);
      doc.setFont("helvetica","bold"); doc.setFontSize(17); setColor(s.color);
      doc.text(String(s.value), bx + 18, by + 13);
      doc.setFont("helvetica","normal"); doc.setFontSize(9); setColor(GRAY);
      doc.text(s.label, bx + 5, by + 21);
    });
    y += 2 * (bigH + 6) + 8;

    // Type breakdown
    doc.setFont("helvetica","bold"); doc.setFontSize(11); setColor(DARK);
    doc.text("Répartition par format", ML, y); y += 6;
    const typeData = [
      { label: "📚 Livres", value: r.byType.book, color: BLUE },
      { label: "🎧 Podcasts", value: r.byType.podcast, color: ACCENT },
      { label: "🎬 Vidéos", value: r.byType.video, color: GREEN },
      { label: "📰 Articles", value: r.byType.article, color: ORANGE },
    ];
    const barW = (TW - 9) / 4;
    typeData.forEach((t, i) => {
      const bx = ML + i * (barW + 3);
      setFill(LIGHT); doc.roundedRect(bx, y, barW, 20, 2, 2, "F");
      const [cr2,cg2,cb2] = hex2rgb(t.color);
      doc.setFillColor(cr2,cg2,cb2);
      doc.roundedRect(bx, y, barW, 2, 1, 1, "F");
      doc.setFont("helvetica","bold"); doc.setFontSize(16); setColor(t.color);
      doc.text(String(t.value), bx + barW/2, y + 13, { align: "center" });
      doc.setFont("helvetica","normal"); doc.setFontSize(8); setColor(GRAY);
      doc.text(t.label, bx + barW/2, y + 18, { align: "center" });
    });
    y += 28;

    // Commentary
    analysisBox(ML, y, TW, "Votre rythme de progression s'est maintenu de manière solide sur le mois, avec une intensité plus marquée sur la deuxième moitié de la période.", null);
    addFooter(3, 13);

    // ── PAGE 4: ACTIVITÉ & RÉGULARITÉ ───────────────────────────────────────
    doc.addPage();
    setFill(WHITE); doc.rect(0,0,W,H,"F");
    setFill(BLUE); doc.rect(0,0,W,20,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(10); setColor("#93c5fd");
    doc.text("THOT · ACTIVITÉ & RÉGULARITÉ", ML, 13);
    y = 32;
    y = addSectionTitle("Votre rythme d'apprentissage", y);

    // Mini heatmap (simplified calendar dots)
    doc.setFont("helvetica","bold"); doc.setFontSize(10); setColor(DARK);
    doc.text("Calendrier d'activité", ML, y); y += 5;
    const actDates = new Set(r.actInPeriod.map(a => a.created_date?.slice(0, 10)));
    const today2 = new Date();
    const cellSize = 5.5, cellGap = 1;
    const daysToShow = 35;
    for (let d = daysToShow - 1; d >= 0; d--) {
      const date = new Date(today2); date.setDate(today2.getDate() - d);
      const key = format(date, "yyyy-MM-dd");
      const col = (daysToShow - 1 - d) % 7, row = Math.floor((daysToShow - 1 - d) / 7);
      const cx = ML + col * (cellSize + cellGap);
      const cy = y + row * (cellSize + cellGap);
      const active = actDates.has(key);
      setFill(active ? ACCENT : "#e5e7eb");
      doc.roundedRect(cx, cy, cellSize, cellSize, 1, 1, "F");
    }
    // Day labels
    ["L","M","M","J","V","S","D"].forEach((d, i) => {
      doc.setFont("helvetica","normal"); doc.setFontSize(6); setColor(GRAY);
      doc.text(d, ML + i * (cellSize + cellGap) + 1.5, y - 1);
    });
    y += 6 * (cellSize + cellGap) + 10;

    // Legend
    setFill(ACCENT); doc.roundedRect(ML, y, 4, 4, 1, 1, "F");
    doc.setFont("helvetica","normal"); doc.setFontSize(8); setColor(GRAY);
    doc.text("Jour actif", ML + 6, y + 3);
    setFill("#e5e7eb"); doc.roundedRect(ML + 35, y, 4, 4, 1, 1, "F");
    doc.text("Jour inactif", ML + 41, y + 3);
    y += 10;

    // Activity stats
    const actStats = [
      { label: "Jours actifs", value: actDates.size },
      { label: "Meilleure série", value: `${r.streak}j` },
      { label: "Activités enregistrées", value: r.actInPeriod.length },
      { label: "KP ce mois", value: r.kpEarned },
    ];
    const aW = (TW - 9) / 4;
    actStats.forEach((s, i) => {
      kpiBox(ML + i * (aW + 3), y, aW, 20, s.label, s.value, ACCENT);
    });
    y += 28;

    // Analysis
    const actH = analysisBox(ML, y, TW, aiTexts.activityAnalysis, "Analyse de votre rythme");
    y += actH + 6;

    // Insights list
    const actInsights = [
      `Vous avez été actif ${actDates.size} jours sur cette période`,
      `Votre meilleure série est de ${r.streak} jours consécutifs`,
      `Vous avez enregistré ${r.actInPeriod.length} activités au total`,
    ];
    doc.setFont("helvetica","bold"); doc.setFontSize(10); setColor(DARK);
    doc.text("Points clés", ML, y); y += 5;
    actInsights.forEach(ins => {
      setFill("#eff6ff"); doc.roundedRect(ML, y, TW, 8, 2, 2, "F");
      setFill(ACCENT); doc.circle(ML + 4, y + 4, 1.5, "F");
      doc.setFont("helvetica","normal"); doc.setFontSize(9); setColor(DARK);
      doc.text(ins, ML + 9, y + 5.5);
      y += 11;
    });

    const quoteH = analysisBox(ML, y + 2, TW, "Vous ne progressez pas seulement par intensité, mais aussi par répétition. Votre discipline intellectuelle commence à se consolider.", null);
    addFooter(4, 13);

    // ── PAGE 5: CARTE DU CERVEAU ─────────────────────────────────────────────
    doc.addPage();
    setFill(WHITE); doc.rect(0,0,W,H,"F");
    setFill(BLUE); doc.rect(0,0,W,20,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(10); setColor("#93c5fd");
    doc.text("THOT · CARTE DU CERVEAU", ML, 13);
    y = 32;
    y = addSectionTitle("Évolution de votre carte du cerveau", y);

    // Domain bars visualization
    doc.setFont("helvetica","bold"); doc.setFontSize(10); setColor(DARK);
    doc.text("Répartition par domaine", ML, y); y += 6;
    const totalCat = Object.values(r.byCategory).reduce((a,b) => a+b, 0) || 1;
    const sortedDomains = Object.entries(r.byCategory).sort((a,b) => b[1]-a[1]);
    const DOMAIN_COLORS = ["#8b5cf6","#3b82f6","#f59e0b","#10b981","#f97316","#ec4899","#06b6d4","#84cc16"];
    sortedDomains.slice(0, 6).forEach(([cat, count], i) => {
      const pct = Math.round((count / totalCat) * 100);
      const barMaxW = TW - 55;
      const barFill = (count / (sortedDomains[0]?.[1] || 1)) * barMaxW;
      const cx = ML, cy = y + i * 11;
      doc.setFont("helvetica","normal"); doc.setFontSize(9); setColor(DARK);
      doc.text((CATEGORY_LABELS[cat] || cat).slice(0, 15), cx, cy + 5);
      setFill("#e5e7eb"); doc.roundedRect(cx + 38, cy, barMaxW, 7, 2, 2, "F");
      const [dr,dg,db] = hex2rgb(DOMAIN_COLORS[i % DOMAIN_COLORS.length]);
      doc.setFillColor(dr,dg,db); doc.roundedRect(cx + 38, cy, Math.max(barFill, 2), 7, 2, 2, "F");
      doc.setFont("helvetica","bold"); doc.setFontSize(8); setColor(DOMAIN_COLORS[i % DOMAIN_COLORS.length]);
      doc.text(`${pct}%`, cx + 38 + barMaxW + 3, cy + 5);
    });
    if (sortedDomains.length === 0) {
      doc.setFont("helvetica","italic"); doc.setFontSize(10); setColor(GRAY);
      doc.text("Aucun contenu par domaine sur cette période", ML, y + 20);
    }
    y += Math.max(sortedDomains.slice(0,6).length, 1) * 11 + 10;

    // Analysis
    const bmH = analysisBox(ML, y, TW, aiTexts.brainMapAnalysis, "Analyse de votre profil intellectuel");
    y += bmH + 8;

    // Strengths / secondary / weak
    const brainCols = [
      { title: "Forces dominantes", color: BLUE, items: sortedDomains.slice(0,3).map(([k]) => CATEGORY_LABELS[k]||k) },
      { title: "Domaines secondaires", color: ACCENT, items: sortedDomains.slice(3,6).map(([k]) => CATEGORY_LABELS[k]||k) },
      { title: "Zones peu développées", color: GRAY, items: Object.keys(CATEGORY_LABELS).filter(k => !r.byCategory[k]).slice(0,3).map(k => CATEGORY_LABELS[k]||k) },
    ];
    const colW = (TW - 8) / 3;
    brainCols.forEach((col, ci) => {
      const bx = ML + ci * (colW + 4);
      const [cr3,cg3,cb3] = hex2rgb(col.color);
      doc.setFillColor(cr3,cg3,cb3,0.1);
      setFill(LIGHT); doc.roundedRect(bx, y, colW, 35, 3, 3, "F");
      doc.setFillColor(cr3,cg3,cb3); doc.rect(bx, y, colW, 1.5, "F");
      doc.setFont("helvetica","bold"); doc.setFontSize(8); setColor(col.color);
      doc.text(col.title, bx + 3, y + 7);
      doc.setFont("helvetica","normal"); doc.setFontSize(8.5); setColor(DARK);
      (col.items.length ? col.items : ["—"]).forEach((item, ii) => {
        doc.text(`• ${item}`, bx + 3, y + 14 + ii * 6);
      });
    });
    y += 43;
    addFooter(5, 13);

    // ── PAGE 6: DOMAINES LES PLUS DÉVELOPPÉS ───────────────────────────────
    doc.addPage();
    setFill(WHITE); doc.rect(0,0,W,H,"F");
    setFill(BLUE); doc.rect(0,0,W,20,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(10); setColor("#93c5fd");
    doc.text("THOT · DOMAINES", ML, 13);
    y = 32;
    y = addSectionTitle("Vos domaines les plus nourris", y);

    const top3 = sortedDomains.slice(0, 3);
    if (top3.length === 0) {
      doc.setFont("helvetica","italic"); doc.setFontSize(10); setColor(GRAY);
      doc.text("Aucun domaine enregistré sur cette période.", ML, y + 10);
      y += 20;
    }
    top3.forEach(([cat, count], i) => {
      const pct = Math.round((count / totalCat) * 100);
      const dColor = DOMAIN_COLORS[i];
      const [dr4,dg4,db4] = hex2rgb(dColor);
      setFill(LIGHT); doc.roundedRect(ML, y, TW, 50, 4, 4, "F");
      doc.setFillColor(dr4,dg4,db4); doc.rect(ML, y, TW, 2.5, "F");

      doc.setFont("helvetica","bold"); doc.setFontSize(13); setColor(dColor);
      doc.text(`${i + 1}. ${CATEGORY_LABELS[cat] || cat}`, ML + 5, y + 10);

      doc.setFont("helvetica","bold"); doc.setFontSize(11); setColor(DARK);
      doc.text(`${pct}%`, ML + 5, y + 19);
      doc.setFont("helvetica","normal"); doc.setFontSize(8); setColor(GRAY);
      doc.text("du total de la période", ML + 18, y + 19);

      // Bar
      const bMaxW = TW - 10;
      setFill("#e5e7eb"); doc.roundedRect(ML + 5, y + 22, bMaxW, 4, 2, 2, "F");
      doc.setFillColor(dr4,dg4,db4); doc.roundedRect(ML + 5, y + 22, (pct / 100) * bMaxW, 4, 2, 2, "F");

      // Contents
      const catContents = r.completedInPeriod.filter(c => c.category === cat).slice(0, 3);
      if (catContents.length > 0) {
        doc.setFont("helvetica","bold"); doc.setFontSize(8); setColor(DARK);
        doc.text("Contenus :", ML + 5, y + 32);
        catContents.forEach((c, ci) => {
          doc.setFont("helvetica","normal"); doc.setFontSize(8); setColor("#374151");
          doc.text(`• ${c.title.slice(0,40)}${c.author ? ` — ${c.author.slice(0,20)}` : ""}`, ML + 5, y + 37 + ci * 5);
        });
      } else {
        doc.setFont("helvetica","italic"); doc.setFontSize(8); setColor(GRAY);
        doc.text("Contenus en cours ou non terminés sur la période", ML + 5, y + 35);
      }
      y += 57;
    });
    addFooter(6, 13);

    // ── PAGE 7: CONTENUS MARQUANTS ──────────────────────────────────────────
    doc.addPage();
    setFill(WHITE); doc.rect(0,0,W,H,"F");
    setFill(BLUE); doc.rect(0,0,W,20,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(10); setColor("#93c5fd");
    doc.text("THOT · CONTENUS MARQUANTS", ML, 13);
    y = 32;
    y = addSectionTitle("Les contenus qui ont le plus compté", y);

    const marquants = r.completedInPeriod.slice(0, 5);
    if (marquants.length === 0) {
      doc.setFont("helvetica","italic"); doc.setFontSize(10); setColor(GRAY);
      doc.text("Aucun contenu terminé sur cette période.", ML, y + 10);
    }
    marquants.forEach((c, i) => {
      const typeEmoji = c.type === "book" ? "📚" : c.type === "podcast" ? "🎧" : c.type === "video" ? "🎬" : "📰";
      const typeLabel = c.type === "book" ? "Livre" : c.type === "podcast" ? "Podcast" : c.type === "video" ? "Vidéo" : "Article";
      const cColor = DOMAIN_COLORS[i % DOMAIN_COLORS.length];
      const [cr5,cg5,cb5] = hex2rgb(cColor);

      setFill(LIGHT); doc.roundedRect(ML, y, TW, 36, 3, 3, "F");
      doc.setFillColor(cr5,cg5,cb5); doc.rect(ML, y, 3, 36, "F");

      doc.setFontSize(14); doc.text(typeEmoji, ML + 6, y + 10);
      doc.setFont("helvetica","bold"); doc.setFontSize(11); setColor(DARK);
      doc.text(c.title.slice(0, 45), ML + 16, y + 10);
      if (c.author) {
        doc.setFont("helvetica","normal"); doc.setFontSize(9); setColor(GRAY);
        doc.text(c.author, ML + 16, y + 16);
      }
      doc.setFont("helvetica","bold"); doc.setFontSize(8); setColor(cColor);
      doc.text(`Format : ${typeLabel}`, ML + 16, y + 23);
      if (c.category) {
        doc.text(`Domaine : ${CATEGORY_LABELS[c.category] || c.category}`, ML + 60, y + 23);
      }
      if (c.rating) {
        doc.setFont("helvetica","normal"); doc.setFontSize(9); setColor(ORANGE);
        doc.text("★".repeat(c.rating), ML + 16, y + 29);
      }
      if (c.personal_note) {
        doc.setFont("helvetica","italic"); doc.setFontSize(8); setColor(GRAY);
        const noteLines = wrapText(c.personal_note.slice(0, 100), TW - 25, 8);
        doc.text(noteLines[0] || "", ML + 16, y + (c.rating ? 35 : 31));
      }
      y += 41;
      if (y > 250 && i < marquants.length - 1) { doc.addPage(); y = 20; }
    });
    addFooter(7, 13);

    // ── PAGE 8: FORMATS & HABITUDES ─────────────────────────────────────────
    doc.addPage();
    setFill(WHITE); doc.rect(0,0,W,H,"F");
    setFill(BLUE); doc.rect(0,0,W,20,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(10); setColor("#93c5fd");
    doc.text("THOT · FORMATS & HABITUDES", ML, 13);
    y = 32;
    y = addSectionTitle("Vos formats d'apprentissage", y);

    // Format cards big
    const fmtData = [
      { emoji: "📚", label: "Livres", value: r.byType.book, color: BLUE },
      { emoji: "🎧", label: "Podcasts", value: r.byType.podcast, color: ACCENT },
      { emoji: "🎬", label: "Vidéos", value: r.byType.video, color: GREEN },
      { emoji: "📰", label: "Articles", value: r.byType.article, color: ORANGE },
    ];
    const fW = (TW - 9) / 4;
    fmtData.forEach((f, i) => {
      const fx = ML + i * (fW + 3);
      setFill(LIGHT); doc.roundedRect(fx, y, fW, 30, 3, 3, "F");
      const [fr6,fg6,fb6] = hex2rgb(f.color);
      doc.setFillColor(fr6,fg6,fb6); doc.rect(fx, y, fW, 2, "F");
      doc.setFontSize(15); doc.text(f.emoji, fx + fW/2 - 3, y + 12);
      doc.setFont("helvetica","bold"); doc.setFontSize(18); setColor(f.color);
      doc.text(String(f.value), fx + fW/2, y + 22, { align: "center" });
      doc.setFont("helvetica","normal"); doc.setFontSize(8); setColor(GRAY);
      doc.text(f.label, fx + fW/2, y + 28, { align: "center" });
    });
    y += 38;

    // Dominant format insight
    const domFmt = fmtData.sort((a,b) => b.value - a.value)[0];
    setFill("#eff6ff"); doc.roundedRect(ML, y, TW, 12, 3, 3, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(10); setColor(ACCENT);
    doc.text(`Format dominant : ${domFmt.emoji} ${domFmt.label} (${domFmt.value} contenus)`, ML + 5, y + 8);
    y += 18;

    const fmtH = analysisBox(ML, y, TW, `Ce mois-ci, vous avez principalement appris via les ${domFmt.label.toLowerCase()}, qui représentent votre format d'entrée principal. Votre profil d'apprentissage repose sur un mix entre contenus longs structurants et contenus plus rapides de découverte.`, "Analyse");
    y += fmtH + 6;

    // Visual bar comparison
    doc.setFont("helvetica","bold"); doc.setFontSize(10); setColor(DARK);
    doc.text("Comparaison des formats", ML, y); y += 6;
    const maxFmt = Math.max(...fmtData.map(f => f.value), 1);
    fmtData.forEach((f, i) => {
      const barH2 = (f.value / maxFmt) * 30;
      const bx2 = ML + i * ((TW - 9) / 4 + 3), by2 = y + (30 - barH2);
      setFill("#e5e7eb"); doc.roundedRect(bx2, y, fW, 30, 2, 2, "F");
      const [fr7,fg7,fb7] = hex2rgb(f.color);
      doc.setFillColor(fr7,fg7,fb7); doc.roundedRect(bx2, by2, fW, barH2, 2, 2, "F");
      doc.setFont("helvetica","normal"); doc.setFontSize(7); setColor(GRAY);
      doc.text(f.emoji + " " + f.label, bx2 + fW/2, y + 34, { align: "center" });
    });
    addFooter(8, 13);

    // ── PAGE 9: PROGRESSION ──────────────────────────────────────────────────
    doc.addPage();
    setFill(WHITE); doc.rect(0,0,W,H,"F");
    setFill(BLUE); doc.rect(0,0,W,20,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(10); setColor("#93c5fd");
    doc.text("THOT · PROGRESSION", ML, 13);
    y = 32;
    y = addSectionTitle("Votre progression", y);

    const progH = analysisBox(ML, y, TW, aiTexts.progressComparison, "Comparaison avec la période précédente");
    y += progH + 8;

    // Progress arrows
    const progItems = [
      { label: "Régularité", trend: "up", color: GREEN },
      { label: "Profondeur des contenus", trend: "up", color: GREEN },
      { label: "Diversification intellectuelle", trend: "up", color: GREEN },
      { label: "Rythme en début de semaine", trend: "down", color: "#ef4444" },
      { label: "Contenus longs terminés", trend: "down", color: "#ef4444" },
    ];
    doc.setFont("helvetica","bold"); doc.setFontSize(10); setColor(DARK);
    doc.text("Ce qui progresse / ralentit", ML, y); y += 6;
    progItems.forEach(p => {
      const trending = p.trend === "up";
      setFill(trending ? "#f0fdf4" : "#fef2f2");
      doc.roundedRect(ML, y, TW, 8, 2, 2, "F");
      doc.setFont("helvetica","bold"); doc.setFontSize(11); setColor(p.color);
      doc.text(trending ? "↑" : "↓", ML + 4, y + 6);
      doc.setFont("helvetica","normal"); doc.setFontSize(9); setColor(DARK);
      doc.text(p.label, ML + 12, y + 6);
      y += 11;
    });
    addFooter(9, 13);

    // ── PAGE 10: INSIGHTS ────────────────────────────────────────────────────
    doc.addPage();
    setFill(WHITE); doc.rect(0,0,W,H,"F");
    setFill(BLUE); doc.rect(0,0,W,20,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(10); setColor("#93c5fd");
    doc.text("THOT · INSIGHTS INTELLIGENTS", ML, 13);
    y = 32;
    y = addSectionTitle("Ce que votre mois révèle", y);

    const insightsList = [
      "Vous développez un profil de plus en plus réflexif et analytique",
      "Votre curiosité devient plus cohérente, avec moins de dispersion",
      "Votre rythme est encore irrégulier, mais votre capacité de reprise s'améliore",
      `Vous renforcez surtout les domaines liés à ${domainList || "vos centres d'intérêt principaux"}`,
      "Vos contenus récents montrent une montée en densité intellectuelle",
      "Votre progression ne repose pas seulement sur le volume, mais sur une meilleure continuité",
    ];
    insightsList.forEach((ins, i) => {
      setFill(i % 2 === 0 ? "#eff6ff" : "#f5f3ff");
      doc.roundedRect(ML, y, TW, 11, 3, 3, "F");
      const dotColor = i % 2 === 0 ? ACCENT : "#8b5cf6";
      setFill(dotColor); doc.circle(ML + 5, y + 5.5, 2, "F");
      doc.setFont("helvetica","normal"); doc.setFontSize(9); setColor(DARK);
      const insLines = wrapText(ins, TW - 14, 9);
      insLines.forEach((l, li) => doc.text(l, ML + 11, y + 5 + li * 4.5));
      y += 14;
    });
    y += 4;

    const insH = analysisBox(ML, y, TW, aiTexts.insights, "Synthèse globale");
    addFooter(10, 13);

    // ── PAGE 11: RECOMMANDATIONS ─────────────────────────────────────────────
    doc.addPage();
    setFill(WHITE); doc.rect(0,0,W,H,"F");
    setFill(BLUE); doc.rect(0,0,W,20,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(10); setColor("#93c5fd");
    doc.text("THOT · RECOMMANDATIONS", ML, 13);
    y = 32;
    y = addSectionTitle("Pistes pour aller plus loin", y);

    const recs = [
      { num: "1", title: "Renforcer un axe fort", color: BLUE, text: `Continuez à approfondir ${r.topCategory ? (CATEGORY_LABELS[r.topCategory[0]] || r.topCategory[0]) : "vos domaines forts"}, qui constitue actuellement votre centre de gravité intellectuel.` },
      { num: "2", title: "Rééquilibrer une faiblesse", color: ACCENT, text: "Enrichissez votre profil en explorant des domaines moins présents dans votre carte actuelle, pour apporter plus de contraste à votre trajectoire." },
      { num: "3", title: "Améliorer votre rythme", color: GREEN, text: "Stabiliser votre rythme en début de semaine renforcerait votre continuité globale et maximiserait l'impact de votre apprentissage." },
      { num: "4", title: "Explorer des ponts entre domaines", color: "#8b5cf6", text: `Un croisement entre ${domainList || "vos domaines dominants"} pourrait enrichir la cohérence de votre trajectoire intellectuelle.` },
    ];
    recs.forEach(rec => {
      const [cr8,cg8,cb8] = hex2rgb(rec.color);
      setFill(LIGHT); doc.roundedRect(ML, y, TW, 32, 4, 4, "F");
      doc.setFillColor(cr8,cg8,cb8); doc.circle(ML + 8, y + 8, 5, "F");
      doc.setFont("helvetica","bold"); doc.setFontSize(10); setColor(WHITE);
      doc.text(rec.num, ML + 8, y + 10.5, { align: "center" });
      doc.setFont("helvetica","bold"); doc.setFontSize(11); setColor(rec.color);
      doc.text(rec.title, ML + 17, y + 10);
      doc.setFont("helvetica","normal"); doc.setFontSize(9); setColor("#374151");
      const recLines = wrapText(rec.text, TW - 20, 9);
      recLines.forEach((l, li) => doc.text(l, ML + 17, y + 16 + li * 4.5));
      y += 38;
    });
    addFooter(11, 13);

    // ── PAGE 12: SYNTHÈSE FINALE ─────────────────────────────────────────────
    doc.addPage();
    setFill(WHITE); doc.rect(0,0,W,H,"F");
    setFill(BLUE); doc.rect(0,0,W,20,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(10); setColor("#93c5fd");
    doc.text("THOT · SYNTHÈSE FINALE", ML, 13);
    y = 32;
    y = addSectionTitle("En résumé", y);

    // Big narrative quote box
    setFill("#eff6ff");
    doc.roundedRect(ML, y, TW, 40, 5, 5, "F");
    setFill(ACCENT); doc.rect(ML, y, 4, 40, "F");
    doc.setFont("helvetica","italic"); doc.setFontSize(11); setColor(DARK);
    const summaryLines = wrapText(aiTexts.finalSummary, TW - 14, 11);
    summaryLines.forEach((l, i) => doc.text(l, ML + 9, y + 9 + i * 6));
    y += 48;

    // Stats summary row
    const sumStats = [
      { label: "Contenus", value: r.totalCompleted, color: BLUE },
      { label: "KP gagnés", value: r.kpEarned, color: ACCENT },
      { label: "Streak", value: `${r.streak}j`, color: ORANGE },
      { label: "Domaine #1", value: r.topCategory ? (CATEGORY_LABELS[r.topCategory[0]] || r.topCategory[0]).slice(0,8) : "—", color: "#8b5cf6" },
    ];
    const ssW = (TW - 9) / 4;
    sumStats.forEach((s, i) => kpiBox(ML + i*(ssW+3), y, ssW, 20, s.label, s.value, s.color));
    y += 28;

    // Premium quote
    setFill("#1e3a5f");
    doc.roundedRect(ML, y, TW, 28, 5, 5, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(12); setColor(WHITE);
    doc.text("THOT", ML + 8, y + 10);
    doc.setFont("helvetica","italic"); doc.setFontSize(10); setColor("#93c5fd");
    doc.text("Votre mois n'a pas seulement produit de l'activité.", ML + 8, y + 18);
    doc.text("Il a produit une forme. Une orientation. Une architecture intellectuelle.", ML + 8, y + 24);
    y += 36;
    addFooter(12, 13);

    // ── PAGE 13: CTA ─────────────────────────────────────────────────────────
    doc.addPage();
    setFill(BLUE);
    doc.rect(0, 0, W, H, "F");
    setFill(ACCENT);
    doc.rect(0, 0, W, 4, "F");
    doc.circle(W - 20, H/2, 90, "F");

    doc.setFont("helvetica","bold"); doc.setFontSize(28); setColor(WHITE);
    doc.text("THOT", ML, 60);
    setFill("#93c5fd"); doc.rect(ML, 65, 20, 1, "F");
    doc.setFontSize(13); setColor("#bfdbfe");
    doc.text("Continuez à construire votre esprit", ML, 75);

    doc.setFont("helvetica","normal"); doc.setFontSize(10); setColor("#dbeafe");
    const ctaIntro = wrapText("Merci d'utiliser THOT pour suivre, structurer et approfondir votre évolution intellectuelle.", TW - 40, 10);
    ctaIntro.forEach((l, i) => doc.text(l, ML, 88 + i * 6));

    setFill("#ffffff20"); doc.rect(ML, 105, TW - 40, 0.5, "F");

    doc.setFont("helvetica","bold"); doc.setFontSize(11); setColor(WHITE);
    doc.text("Ce que vous pouvez faire maintenant :", ML, 118);

    const ctaActions = [
      "📱 Ouvrir l'app et continuer votre apprentissage",
      "📊 Consulter votre tableau de bord",
      "📚 Explorer des nouveaux contenus recommandés",
      "⚡ Maintenir votre streak d'apprentissage",
      "🏆 Rejoindre un défi ou un club",
    ];
    ctaActions.forEach((a, i) => {
      doc.setFont("helvetica","normal"); doc.setFontSize(10); setColor("#dbeafe");
      doc.text(a, ML + 4, 128 + i * 9);
    });

    setFill("#ffffff15");
    doc.roundedRect(ML, 180, TW - 40, 22, 5, 5, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(14); setColor(WHITE);
    doc.text("thot.app", ML + 10, 194);
    doc.setFont("helvetica","normal"); doc.setFontSize(9); setColor("#93c5fd");
    doc.text("Le Strava du savoir — Suivez, progressez, brillez.", ML + 10, 198);

    doc.setFontSize(8); setColor("#60a5fa");
    doc.text(`Rapport généré le ${format(new Date(), "d MMMM yyyy", { locale: fr })} — ${user?.email || ""}`, ML, H - 12);
    setFill(ACCENT); doc.rect(0, H - 4, W, 4, "F");

    doc.save(`rapport-thot-${r.label.replace(/\s+/g, "-").toLowerCase()}.pdf`);
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

        {/* Send email — available to all */}
        <Button variant="outline" size="sm" className="gap-2" onClick={() => handleSendEmail(report)} disabled={emailSending || emailSent}>
          {emailSending ? <Loader2 className="w-4 h-4 animate-spin" /> : emailSent ? <Check className="w-4 h-4 text-green-500" /> : <Mail className="w-4 h-4" />}
          {emailSent ? "Envoyé !" : "Recevoir par email"}
        </Button>

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