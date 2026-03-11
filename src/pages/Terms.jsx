import React from "react";
import { FileText } from "lucide-react";

export default function Terms() {
  const sections = [
    {
      title: "1. Objet",
      content: "Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation du service THOT, plateforme de suivi et de gamification de l'apprentissage personnel, accessible via l'application mobile et le site web thot.app, édités par THOT SAS."
    },
    {
      title: "2. Acceptation des CGU",
      content: "L'inscription et l'utilisation du service impliquent l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le service. THOT se réserve le droit de modifier ces CGU à tout moment, avec notification préalable de 30 jours."
    },
    {
      title: "3. Description du service",
      content: "THOT est une plateforme qui permet à ses utilisateurs de :\n• Suivre leur consommation de contenus éducatifs (livres, podcasts, vidéos, articles)\n• Visualiser leur progression via des statistiques et graphiques\n• Participer à des défis et challenges communautaires\n• Gagner des Knowledge Points et monter en niveau\n• Se connecter avec d'autres applications (intégrations)\n\nUne version gratuite et une version Premium sont proposées. Les fonctionnalités de chaque version sont décrites sur la page Premium."
    },
    {
      title: "4. Inscription et compte",
      content: "L'inscription est ouverte à toute personne physique âgée d'au moins 13 ans. L'utilisateur s'engage à fournir des informations exactes lors de l'inscription et à les maintenir à jour. L'utilisateur est responsable de la confidentialité de ses identifiants et de toutes les activités réalisées depuis son compte. En cas de suspicion d'utilisation frauduleuse, l'utilisateur doit contacter immédiatement support@thot.app."
    },
    {
      title: "5. Données de l'utilisateur",
      content: "L'utilisateur conserve la propriété de ses données personnelles et du contenu qu'il crée sur THOT (notes, résumés, etc.). Il accorde à THOT une licence limitée pour traiter ces données dans le but de fournir le service. THOT s'engage à ne pas exploiter ces données à des fins commerciales tierces. Pour plus d'informations, consulter notre Politique de Confidentialité."
    },
    {
      title: "6. Utilisation acceptable",
      content: "L'utilisateur s'engage à utiliser le service de manière légale et respectueuse. Sont interdits :\n• Le harcèlement, la diffamation ou les contenus haineux\n• Le contournement des mesures de sécurité\n• La création de faux comptes ou l'usurpation d'identité\n• Le spam ou la publicité non sollicitée\n• Tout comportement portant atteinte aux droits d'autrui\n\nTHOT se réserve le droit de suspendre ou supprimer tout compte en cas de violation."
    },
    {
      title: "7. Propriété intellectuelle",
      content: "L'ensemble des éléments constituant le service THOT (logo, design, code source, fonctionnalités) sont la propriété exclusive de THOT SAS et sont protégés par le droit de la propriété intellectuelle. Toute reproduction ou utilisation sans autorisation est strictement interdite. Les marques citées dans le service (Kindle, Spotify, etc.) appartiennent à leurs propriétaires respectifs."
    },
    {
      title: "8. Abonnement Premium",
      content: "L'abonnement Premium est proposé selon différentes formules (mensuelle, annuelle, à vie) dont les tarifs sont affichés sur la page Premium. Le paiement est traité par Stripe et est prélevé en début de période. L'abonnement se renouvelle automatiquement sauf résiliation. La résiliation prend effet à la fin de la période en cours. Garantie satisfait ou remboursé sous 30 jours pour le premier abonnement."
    },
    {
      title: "9. Limitation de responsabilité",
      content: "THOT fournit le service \"en l'état\" et ne garantit pas son fonctionnement sans interruption. THOT ne peut être tenu responsable des pertes de données, dommages indirects ou pertes d'opportunités liés à l'utilisation du service. La responsabilité de THOT est limitée au montant payé par l'utilisateur au cours des 12 derniers mois."
    },
    {
      title: "10. Droit applicable et juridiction",
      content: "Les présentes CGU sont soumises au droit français. En cas de litige, et après tentative de résolution amiable, les tribunaux compétents de Paris seront seuls compétents. Conformément à la réglementation européenne, vous pouvez également recourir à la plateforme de règlement en ligne des litiges : ec.europa.eu/consumers/odr."
    },
    {
      title: "11. Contact",
      content: "Pour toute question relative aux présentes CGU :\nTHOT SAS\n1 rue de la Connaissance, 75001 Paris\nEmail : legal@thot.app\nTéléphone : +33 1 XX XX XX XX (9h-18h, lun-ven)"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-accent" />
            <h1 className="font-heading text-3xl md:text-4xl font-bold">Conditions Générales d'Utilisation</h1>
          </div>
          <p className="text-muted-foreground">Version en vigueur depuis le 11 mars 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
        {sections.map((section, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-heading font-bold text-lg mb-3">{section.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}