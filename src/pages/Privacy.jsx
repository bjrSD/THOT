import React from "react";
import { Shield, Lock, Eye, Trash2 } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-accent" />
            <h1 className="font-heading text-3xl md:text-4xl font-bold">Politique de confidentialité</h1>
          </div>
          <p className="text-muted-foreground">Dernière mise à jour : 11 mars 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Lock, label: "Chiffrement AES-256", color: "text-blue-500" },
            { icon: Eye, label: "Zéro revente de données", color: "text-green-500" },
            { icon: Shield, label: "Conformité RGPD", color: "text-accent" },
            { icon: Trash2, label: "Droit à l'oubli", color: "text-orange-500" },
          ].map((item, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4 text-center">
              <item.icon className={`w-6 h-6 ${item.color} mx-auto mb-2`} />
              <p className="text-xs font-medium">{item.label}</p>
            </div>
          ))}
        </div>

        {[
          {
            title: "1. Responsable du traitement",
            content: "THOT SAS, société par actions simplifiée au capital de 10 000 €, immatriculée au RCS de Paris sous le numéro 123 456 789, dont le siège social est situé au 1 rue de la Connaissance, 75001 Paris, France.\n\nContact DPO : privacy@thot.app"
          },
          {
            title: "2. Données collectées",
            content: "Nous collectons uniquement les données nécessaires au fonctionnement du service :\n\n• Données d'identification : nom, adresse email\n• Données d'utilisation : contenus trackés, progression, notes personnelles\n• Données de connexion : adresse IP, horodatage des connexions\n• Données de paiement : traitées exclusivement par Stripe (nous ne stockons aucune donnée bancaire)\n\nNous ne collectons jamais : données biométriques, données de localisation précise, données de santé."
          },
          {
            title: "3. Finalités du traitement",
            content: "Vos données sont utilisées pour :\n\n• Fournir et améliorer le service THOT\n• Personnaliser votre expérience (recommandations)\n• Vous envoyer des communications relatives au service (streak, badges)\n• Respecter nos obligations légales\n\nBase légale : exécution du contrat (CGU), intérêt légitime (amélioration du service), consentement (communications marketing)."
          },
          {
            title: "4. Conservation des données",
            content: "Vos données sont conservées pendant toute la durée de votre compte, puis 30 jours après votre demande de suppression (délai légal). Les données de facturation sont conservées 10 ans conformément aux obligations comptables."
          },
          {
            title: "5. Partage des données",
            content: "Nous ne vendons jamais vos données. Nous partageons uniquement avec :\n\n• Nos sous-traitants techniques (hébergement, paiement) liés par des contrats de traitement conformes au RGPD\n• Les autorités légales sur demande judiciaire\n\nTous nos sous-traitants sont situés dans l'Union Européenne ou couverts par des garanties appropriées."
          },
          {
            title: "6. Vos droits (RGPD)",
            content: "Conformément au RGPD, vous disposez des droits suivants :\n\n• Droit d'accès à vos données personnelles\n• Droit de rectification des données inexactes\n• Droit à l'effacement (\"droit à l'oubli\")\n• Droit à la portabilité de vos données\n• Droit d'opposition au traitement\n• Droit à la limitation du traitement\n\nPour exercer vos droits : privacy@thot.app\nVous pouvez également déposer une plainte auprès de la CNIL (cnil.fr)."
          },
          {
            title: "7. Sécurité",
            content: "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées :\n\n• Chiffrement des données au repos (AES-256) et en transit (TLS 1.3)\n• Hébergement sur des serveurs certifiés ISO 27001 en France\n• Audits de sécurité réguliers\n• Authentification à deux facteurs disponible\n• Logs d'accès conservés 90 jours"
          },
          {
            title: "8. Cookies",
            content: "Nous utilisons des cookies essentiels au fonctionnement du service (session, préférences). Aucun cookie publicitaire tiers n'est déposé. Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur."
          },
          {
            title: "9. Modifications",
            content: "Nous vous informerons de tout changement significatif par email et/ou notification in-app au moins 30 jours avant l'entrée en vigueur des modifications. L'utilisation continue du service après modification vaut acceptation."
          },
        ].map((section, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-heading font-bold text-lg mb-3">{section.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}