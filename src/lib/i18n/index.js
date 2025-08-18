import { authTranslations } from './modules/auth.js';
import { landingPagesTranslations } from './modules/landingPages.js';
import { businessTranslations } from './modules/business.js';
import { dashboardTranslations } from './modules/dashboard.js';
import { commonTranslations } from './modules/common.js';
import { pagesTranslations } from './modules/pages.js';

// Deep merge function to combine translation objects
function deepMerge(target, source) {
	const result = { ...target };
	for (const key in source) {
		if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
			result[key] = deepMerge(result[key] || {}, source[key]);
		} else {
			result[key] = source[key];
		}
	}
	return result;
}

// Combine all translation modules
const combinedTranslations = {
	en: deepMerge(
		deepMerge(
			deepMerge(
				deepMerge(
					deepMerge(
						commonTranslations.en,
						authTranslations.en
					),
					landingPagesTranslations.en
				),
				businessTranslations.en
			),
			dashboardTranslations.en
		),
		pagesTranslations.en
	),
	es: deepMerge(
		deepMerge(
			deepMerge(
				deepMerge(
					deepMerge(
						commonTranslations.es,
						authTranslations.es
					),
					landingPagesTranslations.es
				),
				businessTranslations.es
			),
			dashboardTranslations.es
		),
		pagesTranslations.es
	),
	fr: deepMerge(
		deepMerge(
			deepMerge(
				deepMerge(
					deepMerge(
						commonTranslations.fr,
						authTranslations.fr
					),
					landingPagesTranslations.fr
				),
				businessTranslations.fr
			),
			dashboardTranslations.fr
		),
		pagesTranslations.fr
	),
	de: deepMerge(
		deepMerge(
			deepMerge(
				deepMerge(
					deepMerge(
						commonTranslations.de,
						authTranslations.de
					),
					landingPagesTranslations.de
				),
				businessTranslations.de
			),
			dashboardTranslations.de
		),
		pagesTranslations.de
	)
};

// Add footer translations from original dictionaries.js
const footerTranslations = {
	en: {
		footer: {
			trademark: "Thorbis® is a registered trademark by Wades, Inc. All rights reserved.",
			mission: "Our mission is to transform business discovery by providing the most transparent and trusted platform for reviews, listings, and customer engagement.",
			compareTitle: "Compare Thorbis Alternatives",
			compareDescription: "See how Thorbis stacks up against other popular business platforms and review sites.",
			trustTitle: "Trust & Security",
			copyright: "© 2024 Thorbis. All rights reserved.",
			madeWith: "Made with ❤️ for businesses",
			sections: {
				about: "About",
				support: "Support",
				business: "Business",
				legal: "Legal",
				resources: "Resources",
				partners: "Partners",
			},
			links: {
				aboutUs: "About Thorbis",
				careers: "Careers",
				press: "Press",
				investorRelations: "Investor Relations",
				legal: "Legal",
				transparency: "Transparency",
				mobile: "Thorbis Mobile",
				developers: "Developers",
				rss: "RSS",
				contactSupport: "Contact Support",
				helpCenter: "Help Center",
				faq: "FAQ",
				businessForBusiness: "Thorbis for Business",
				businessOwnerLogin: "Business Owner Login",
				claimBusiness: "Claim your Business",
				advertise: "Advertise on Thorbis",
				restaurantOwners: "For Restaurant Owners",
				tableManagement: "Table Management",
				terms: "Terms of Service",
				privacy: "Privacy Policy",
				contentGuidelines: "Content Guidelines",
				communityGuidelines: "Community Guidelines",
				adChoices: "Ad Choices",
				accessibility: "Accessibility",
				blog: "Blog",
				news: "News",
				events: "Events",
				caseStudies: "Case Studies",
				successStories: "Success Stories",
				learn: "Learn",
				partnerships: "Partnerships",
				affiliates: "Affiliates",
				certification: "Certification",
				api: "API",
				integrations: "Integrations",
				marketplace: "Marketplace",
				sitemap: "Sitemap",
				status: "Status",
				feedback: "Feedback",
			},
		},
	},
	es: {
		footer: {
			trademark: "Thorbis® es una marca registrada de Wades, Inc. Todos los derechos reservados.",
			mission: "Nuestra misión es transformar el descubrimiento de negocios proporcionando la plataforma más transparente y confiable para reseñas, listados y participación del cliente.",
			compareTitle: "Comparar Alternativas a Thorbis",
			compareDescription: "Ve cómo Thorbis se compara con otras plataformas populares de negocios y sitios de reseñas.",
			trustTitle: "Confianza y Seguridad",
			copyright: "© 2024 Thorbis. Todos los derechos reservados.",
			madeWith: "Hecho con ❤️ para negocios",
			sections: {
				about: "Acerca de",
				support: "Soporte",
				business: "Negocios",
				legal: "Legal",
				resources: "Recursos",
				partners: "Socios",
			},
			links: {
				aboutUs: "Acerca de Thorbis",
				careers: "Carreras",
				press: "Prensa",
				investorRelations: "Relaciones con Inversores",
				legal: "Legal",
				transparency: "Transparencia",
				mobile: "Thorbis Móvil",
				developers: "Desarrolladores",
				rss: "RSS",
				contactSupport: "Contactar Soporte",
				helpCenter: "Centro de Ayuda",
				faq: "Preguntas Frecuentes",
				businessForBusiness: "Thorbis para Negocios",
				businessOwnerLogin: "Iniciar Sesión de Propietario",
				claimBusiness: "Reclamar tu Negocio",
				advertise: "Anunciar en Thorbis",
				restaurantOwners: "Para Propietarios de Restaurantes",
				tableManagement: "Gestión de Mesas",
				terms: "Términos de Servicio",
				privacy: "Política de Privacidad",
				contentGuidelines: "Pautas de Contenido",
				communityGuidelines: "Pautas de la Comunidad",
				adChoices: "Opciones de Anuncios",
				accessibility: "Accesibilidad",
				blog: "Blog",
				news: "Noticias",
				events: "Eventos",
				caseStudies: "Casos de Estudio",
				successStories: "Historias de Éxito",
				learn: "Aprender",
				partnerships: "Asociaciones",
				affiliates: "Afiliados",
				certification: "Certificación",
				api: "API",
				integrations: "Integraciones",
				marketplace: "Mercado",
				sitemap: "Mapa del Sitio",
				status: "Estado",
				feedback: "Comentarios",
			},
		},
	},
	fr: {
		footer: {
			trademark: "Thorbis® est une marque déposée de Wades, Inc. Tous droits réservés.",
			mission: "Notre mission est de transformer la découverte d'entreprises en fournissant la plateforme la plus transparente et fiable pour les avis, les listes et l'engagement client.",
			compareTitle: "Comparer les Alternatives à Thorbis",
			compareDescription: "Découvrez comment Thorbis se compare aux autres plateformes d'entreprises populaires et sites d'avis.",
			trustTitle: "Confiance et Sécurité",
			copyright: "© 2024 Thorbis. Tous droits réservés.",
			madeWith: "Fait avec ❤️ pour les entreprises",
			sections: {
				about: "À propos",
				support: "Support",
				business: "Entreprise",
				legal: "Légal",
				resources: "Ressources",
				partners: "Partenaires",
			},
			links: {
				aboutUs: "À propos de Thorbis",
				careers: "Carrières",
				press: "Presse",
				investorRelations: "Relations Investisseurs",
				legal: "Mentions légales",
				transparency: "Transparence",
				mobile: "Thorbis Mobile",
				developers: "Développeurs",
				rss: "RSS",
				contactSupport: "Contacter le Support",
				helpCenter: "Centre d'Aide",
				faq: "FAQ",
				businessForBusiness: "Thorbis pour Entreprises",
				businessOwnerLogin: "Connexion Propriétaire",
				claimBusiness: "Réclamer votre Entreprise",
				advertise: "Annoncer sur Thorbis",
				restaurantOwners: "Pour les Propriétaires de Restaurants",
				tableManagement: "Gestion des Tables",
				terms: "Conditions de Service",
				privacy: "Politique de Confidentialité",
				contentGuidelines: "Directives de Contenu",
				communityGuidelines: "Directives de la Communauté",
				adChoices: "Choix Publicitaires",
				accessibility: "Accessibilité",
				blog: "Blog",
				news: "Actualités",
				events: "Événements",
				caseStudies: "Études de Cas",
				successStories: "Histoires de Réussite",
				learn: "Apprendre",
				partnerships: "Partenariats",
				affiliates: "Affiliés",
				certification: "Certification",
				api: "API",
				integrations: "Intégrations",
				marketplace: "Marketplace",
				sitemap: "Plan du Site",
				status: "Statut",
				feedback: "Retour",
			},
		},
	},
	de: {
		footer: {
			trademark: "Thorbis® ist eine eingetragene Marke von Wades, Inc. Alle Rechte vorbehalten.",
			mission: "Unsere Mission ist es, die Geschäftsentdeckung zu transformieren, indem wir die transparenteste und vertrauenswürdigste Plattform für Bewertungen, Auflistungen und Kundenengagement bereitstellen.",
			compareTitle: "Thorbis Alternativen Vergleichen",
			compareDescription: "Sehen Sie, wie Thorbis im Vergleich zu anderen beliebten Geschäftsplattformen und Bewertungsseiten abschneidet.",
			trustTitle: "Vertrauen und Sicherheit",
			copyright: "© 2024 Thorbis. Alle Rechte vorbehalten.",
			madeWith: "Gemacht mit ❤️ für Unternehmen",
			sections: {
				about: "Über uns",
				support: "Support",
				business: "Geschäft",
				legal: "Rechtliches",
				resources: "Ressourcen",
				partners: "Partner",
			},
			links: {
				aboutUs: "Über Thorbis",
				careers: "Karriere",
				press: "Presse",
				investorRelations: "Investorenbeziehungen",
				legal: "Rechtliches",
				transparency: "Transparenz",
				mobile: "Thorbis Mobile",
				developers: "Entwickler",
				rss: "RSS",
				contactSupport: "Support Kontaktieren",
				helpCenter: "Hilfecenter",
				faq: "FAQ",
				businessForBusiness: "Thorbis für Unternehmen",
				businessOwnerLogin: "Geschäftsinhaber Login",
				claimBusiness: "Ihr Geschäft Beanspruchen",
				advertise: "Auf Thorbis Werben",
				restaurantOwners: "Für Restaurantbesitzer",
				tableManagement: "Tischverwaltung",
				terms: "Nutzungsbedingungen",
				privacy: "Datenschutzrichtlinie",
				contentGuidelines: "Inhaltsrichtlinien",
				communityGuidelines: "Community-Richtlinien",
				adChoices: "Anzeigenauswahl",
				accessibility: "Barrierefreiheit",
				blog: "Blog",
				news: "Nachrichten",
				events: "Veranstaltungen",
				caseStudies: "Fallstudien",
				successStories: "Erfolgsgeschichten",
				learn: "Lernen",
				partnerships: "Partnerschaften",
				affiliates: "Partner",
				certification: "Zertifizierung",
				api: "API",
				integrations: "Integrationen",
				marketplace: "Marktplatz",
				sitemap: "Sitemap",
				status: "Status",
				feedback: "Feedback",
			},
		},
	}
};

// Final merged dictionaries
const dictionaries = {
	en: deepMerge(combinedTranslations.en, footerTranslations.en),
	es: deepMerge(combinedTranslations.es, footerTranslations.es),
	fr: deepMerge(combinedTranslations.fr, footerTranslations.fr),
	de: deepMerge(combinedTranslations.de, footerTranslations.de)
};

export default dictionaries;

export const getDictionary = async (locale) => {
	return dictionaries[locale] || dictionaries.en;
};

export const languages = {
	en: { name: "English", flag: "🇺🇸", nativeName: "English" },
	es: { name: "Español", flag: "🇪🇸", nativeName: "Español" },
	fr: { name: "Français", flag: "🇫🇷", nativeName: "Français" },
	de: { name: "Deutsch", flag: "🇩🇪", nativeName: "Deutsch" },
	pt: { name: "Português", flag: "🇵🇹", nativeName: "Português" },
	it: { name: "Italiano", flag: "🇮🇹", nativeName: "Italiano" },
	nl: { name: "Nederlands", flag: "🇳🇱", nativeName: "Nederlands" },
	ja: { name: "日本語", flag: "🇯🇵", nativeName: "日本語" },
	ko: { name: "한국어", flag: "🇰🇷", nativeName: "한국어" },
	zh: { name: "中文", flag: "🇨🇳", nativeName: "中文" },
	ru: { name: "Русский", flag: "🇷🇺", nativeName: "Русский" },
	ar: { name: "العربية", flag: "🇸🇦", nativeName: "العربية" },
	hi: { name: "हिन्दी", flag: "🇮🇳", nativeName: "हिन्दी" },
};