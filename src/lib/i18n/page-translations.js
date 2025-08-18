/**
 * Page-specific Translations
 * Complete translations for all main pages and landing pages
 */

export const pageTranslations = {
	en: {
		// Homepage
		home: {
			meta: {
				title: "Thorbis - Discover Local Businesses & Community",
				description: "Find the best local businesses, events, and community resources in your area. Connect with your neighborhood and discover what's happening nearby."
			},
			hero: {
				title: "Discover Local Businesses & Community",
				subtitle: "Find the best local businesses, events, and community resources in your area",
				search_placeholder: "What are you looking for?",
				location_placeholder: "Where?",
				cta: "Search Now"
			},
			sections: {
				featured: "Featured Businesses",
				trending: "Trending Now",
				nearby: "Near You",
				new: "New Listings",
				top_rated: "Top Rated",
				categories: "Browse Categories",
				recent_activity: "Recent Activity"
			},
			stats: {
				businesses: "Local Businesses",
				reviews: "Customer Reviews",
				cities: "Cities Covered",
				categories: "Categories"
			}
		},

		// Business pages
		business: {
			meta: {
				title: "{{businessName}} - {{category}} in {{location}}",
				description: "{{businessName}} is a {{category}} located in {{location}}. View reviews, photos, hours, and contact information."
			},
			profile: {
				overview: "Overview",
				reviews: "Reviews",
				photos: "Photos",
				hours: "Hours",
				contact: "Contact",
				location: "Location",
				about: "About",
				services: "Services",
				amenities: "Amenities",
				specialties: "Specialties",
				website: "Website",
				phone: "Phone",
				email: "Email",
				address: "Address",
				directions: "Get Directions",
				call: "Call",
				website_link: "Visit Website",
				write_review: "Write a Review",
				share: "Share",
				save: "Save",
				claim: "Claim this business",
				report: "Report this business",
				suggest_edit: "Suggest an edit",
				hours_today: "Hours today",
				open_now: "Open now",
				closed_now: "Closed",
				opens_at: "Opens at {{time}}",
				closes_at: "Closes at {{time}}",
				rating: "{{rating}} star rating",
				review_count: "{{count}} reviews",
				price_range: "Price range: {{range}}",
				established: "Established {{year}}",
				verified: "Verified Business",
				claimed: "Claimed by Owner"
			},
			actions: {
				book_appointment: "Book Appointment",
				order_online: "Order Online",
				view_menu: "View Menu",
				get_quote: "Get Quote",
				call_now: "Call Now",
				message: "Send Message",
				view_website: "View Website"
			}
		},

		// Search pages
		search: {
			meta: {
				title: "Search Results for '{{query}}'{{location}}",
				description: "Find {{query}} businesses{{location}}. Browse reviews, photos, and contact information for local businesses."
			},
			results: {
				title: "Search Results",
				found: "{{count}} results found",
				no_results: "No results found",
				try_different: "Try a different search term or location",
				filters: "Filters",
				sort_by: "Sort by",
				clear_filters: "Clear all filters",
				refine_search: "Refine your search"
			},
			filters: {
				location: "Location",
				category: "Category",
				rating: "Rating",
				price: "Price Range",
				hours: "Open Hours",
				features: "Features",
				distance: "Distance",
				verified_only: "Verified businesses only",
				open_now: "Open now"
			},
			sorting: {
				relevance: "Most Relevant",
				distance: "Distance",
				rating: "Highest Rated",
				reviews: "Most Reviews",
				newest: "Newest"
			}
		},

		// Category pages
		categories: {
			meta: {
				title: "{{category}} in {{location}} - Local Business Directory",
				description: "Find the best {{category}} businesses in {{location}}. Browse reviews, compare services, and connect with local {{category}} providers."
			},
			title: "{{category}} in {{location}}",
			subtitle: "Find and compare the best {{category}} businesses in your area",
			browse_all: "Browse All Categories",
			popular_categories: "Popular Categories",
			related_categories: "Related Categories",
			local_favorites: "Local Favorites"
		},

		// Help/Support pages
		help: {
			meta: {
				title: "Help Center - Thorbis Support",
				description: "Get help with Thorbis. Find answers to common questions, contact support, and access our comprehensive help resources."
			},
			title: "How can we help you?",
			subtitle: "Find answers to common questions and get the support you need",
			search_placeholder: "What can we help you with?",
			popular_topics: "Popular Topics",
			categories: {
				getting_started: "Getting Started",
				account_help: "Account Help",
				business_help: "Business Help",
				technical_support: "Technical Support",
				billing_support: "Billing Support",
				privacy_security: "Privacy & Security"
			},
			contact: {
				title: "Contact Support",
				subtitle: "Can't find what you're looking for? Get in touch with our support team",
				live_chat: "Live Chat",
				email_support: "Email Support",
				phone_support: "Phone Support",
				response_time: "We typically respond within {{time}}",
				business_hours: "Support Hours: {{hours}}"
			}
		},

		// About/Company pages
		company: {
			meta: {
				title: "About Thorbis - Our Mission & Story",
				description: "Learn about Thorbis, our mission to connect local communities with businesses, and meet the team behind the platform."
			},
			about: {
				title: "About Thorbis",
				subtitle: "Connecting communities with local businesses",
				mission: "Our Mission",
				vision: "Our Vision",
				values: "Our Values",
				story: "Our Story",
				team: "Meet the Team",
				careers: "Join Our Team",
				press: "Press & Media",
				investors: "Investor Relations"
			},
			careers: {
				title: "Careers at Thorbis",
				subtitle: "Join us in building the future of local business discovery",
				why_join: "Why Join Thorbis?",
				open_positions: "Open Positions",
				benefits: "Benefits & Perks",
				culture: "Our Culture",
				apply_now: "Apply Now"
			}
		},

		// Legal pages
		legal: {
			meta: {
				title: "Legal Information - Terms, Privacy & Policies",
				description: "Review Thorbis legal policies including Terms of Service, Privacy Policy, and other important legal information."
			},
			title: "Legal Information",
			subtitle: "Important policies and legal information for using Thorbis",
			terms: {
				title: "Terms of Service",
				last_updated: "Last updated: {{date}}",
				effective_date: "Effective date: {{date}}"
			},
			privacy: {
				title: "Privacy Policy",
				summary: "Privacy Summary",
				full_policy: "Full Privacy Policy"
			},
			cookies: {
				title: "Cookie Policy",
				essential: "Essential Cookies",
				analytics: "Analytics Cookies",
				preferences: "Cookie Preferences"
			}
		},

		// Pricing page
		pricing: {
			meta: {
				title: "Pricing Plans - Choose the Right Plan for Your Business",
				description: "Simple, transparent pricing for businesses of all sizes. Start free and scale as you grow with Thorbis."
			},
			title: "Simple, Transparent Pricing",
			subtitle: "Choose the plan that's right for your business",
			monthly: "Monthly",
			annually: "Annually",
			save: "Save {{percentage}}%",
			free_trial: "{{days}}-day free trial",
			no_credit_card: "No credit card required",
			features: "Features",
			choose_plan: "Choose Plan",
			current_plan: "Current Plan",
			upgrade: "Upgrade",
			contact_sales: "Contact Sales",
			faq: "Frequently Asked Questions"
		},

		// LocalHub pages
		localhub: {
			meta: {
				title: "LocalHub - Launch Your Local Business Directory",
				description: "Create a profitable local business directory in minutes. We take 25% of your revenue, otherwise it's completely free."
			},
			hero: {
				title: "Launch your local business directory",
				subtitle: "Build a profitable local directory in minutes. We take 25% of your revenue, otherwise it's completely free.",
				cta_primary: "Start building for free",
				cta_secondary: "See how it works",
				no_risk: "No upfront costs, no monthly fees"
			},
			features: {
				title: "Everything you need to succeed",
				subtitle: "Built-in tools to help you create, customize, and monetize your local directory",
				easy_setup: {
					title: "Easy Setup",
					description: "Launch your directory in minutes with our intuitive setup wizard"
				},
				custom_branding: {
					title: "Custom Branding",
					description: "Make it yours with custom logos, colors, and domain names"
				},
				monetization: {
					title: "Built-in Monetization",
					description: "Start earning from day one with featured listings and premium upgrades"
				}
			},
			testimonials: {
				title: "Trusted by directory owners nationwide",
				subtitle: "See how LocalHub is helping entrepreneurs build successful local directories"
			}
		}
	},

	// Spanish translations
	es: {
		home: {
			meta: {
				title: "Thorbis - Descubre Empresas Locales y Comunidad",
				description: "Encuentra las mejores empresas locales, eventos y recursos comunitarios en tu área. Conéctate con tu vecindario y descubre qué está pasando cerca."
			},
			hero: {
				title: "Descubre Empresas Locales y Comunidad",
				subtitle: "Encuentra las mejores empresas locales, eventos y recursos comunitarios en tu área",
				search_placeholder: "¿Qué estás buscando?",
				location_placeholder: "¿Dónde?",
				cta: "Buscar Ahora"
			},
			sections: {
				featured: "Empresas Destacadas",
				trending: "Tendencias Ahora",
				nearby: "Cerca de Ti",
				new: "Nuevos Listados",
				top_rated: "Mejor Calificados",
				categories: "Explorar Categorías",
				recent_activity: "Actividad Reciente"
			}
		},

		business: {
			meta: {
				title: "{{businessName}} - {{category}} en {{location}}",
				description: "{{businessName}} es un {{category}} ubicado en {{location}}. Ver reseñas, fotos, horarios e información de contacto."
			},
			profile: {
				overview: "Resumen",
				reviews: "Reseñas",
				photos: "Fotos",
				hours: "Horarios",
				contact: "Contacto",
				location: "Ubicación",
				about: "Acerca de",
				services: "Servicios",
				write_review: "Escribir Reseña",
				call: "Llamar",
				directions: "Obtener Direcciones",
				open_now: "Abierto ahora",
				closed_now: "Cerrado",
				hours_today: "Horarios hoy"
			}
		},

		search: {
			meta: {
				title: "Resultados de búsqueda para '{{query}}'{{location}}",
				description: "Encuentra empresas de {{query}}{{location}}. Navega reseñas, fotos e información de contacto para empresas locales."
			},
			results: {
				title: "Resultados de Búsqueda",
				found: "{{count}} resultados encontrados",
				no_results: "No se encontraron resultados",
				try_different: "Prueba con un término de búsqueda o ubicación diferente"
			}
		},

		help: {
			meta: {
				title: "Centro de Ayuda - Soporte de Thorbis",
				description: "Obtén ayuda con Thorbis. Encuentra respuestas a preguntas frecuentes, contacta soporte y accede a nuestros recursos de ayuda integral."
			},
			title: "¿Cómo podemos ayudarte?",
			subtitle: "Encuentra respuestas a preguntas frecuentes y obtén el soporte que necesitas"
		},

		localhub: {
			meta: {
				title: "LocalHub - Lanza tu Directorio Local de Empresas",
				description: "Crea un directorio local de empresas rentable en minutos. Tomamos el 25% de tus ingresos, de lo contrario es completamente gratis."
			},
			hero: {
				title: "Lanza tu directorio local de empresas",
				subtitle: "Construye un directorio local rentable en minutos. Tomamos el 25% de tus ingresos, de lo contrario es completamente gratis.",
				cta_primary: "Comenzar a construir gratis",
				cta_secondary: "Ver cómo funciona"
			}
		}
	},

	// French translations
	fr: {
		home: {
			meta: {
				title: "Thorbis - Découvrez les Entreprises Locales et la Communauté",
				description: "Trouvez les meilleures entreprises locales, événements et ressources communautaires de votre région. Connectez-vous avec votre quartier et découvrez ce qui se passe près de chez vous."
			},
			hero: {
				title: "Découvrez les Entreprises Locales et la Communauté",
				subtitle: "Trouvez les meilleures entreprises locales, événements et ressources communautaires de votre région",
				search_placeholder: "Que recherchez-vous ?",
				location_placeholder: "Où ?",
				cta: "Rechercher Maintenant"
			}
		},

		business: {
			profile: {
				overview: "Aperçu",
				reviews: "Avis",
				photos: "Photos",
				hours: "Heures",
				contact: "Contact",
				location: "Emplacement"
			}
		},

		localhub: {
			hero: {
				title: "Lancez votre annuaire d'entreprises local",
				subtitle: "Créez un annuaire local rentable en quelques minutes. Nous prenons 25% de vos revenus, sinon c'est entièrement gratuit.",
				cta_primary: "Commencer gratuitement"
			}
		}
	},

	// German translations
	de: {
		home: {
			meta: {
				title: "Thorbis - Entdecken Sie lokale Unternehmen und Gemeinschaft",
				description: "Finden Sie die besten lokalen Unternehmen, Veranstaltungen und Gemeinschaftsressourcen in Ihrer Nähe. Verbinden Sie sich mit Ihrer Nachbarschaft und entdecken Sie, was in der Nähe passiert."
			},
			hero: {
				title: "Entdecken Sie lokale Unternehmen und Gemeinschaft",
				subtitle: "Finden Sie die besten lokalen Unternehmen, Veranstaltungen und Gemeinschaftsressourcen in Ihrer Nähe",
				search_placeholder: "Wonach suchen Sie?",
				location_placeholder: "Wo?",
				cta: "Jetzt Suchen"
			}
		},

		business: {
			profile: {
				overview: "Übersicht",
				reviews: "Bewertungen",
				photos: "Fotos",
				hours: "Öffnungszeiten",
				contact: "Kontakt",
				location: "Standort"
			}
		},

		localhub: {
			hero: {
				title: "Starten Sie Ihr lokales Unternehmensverzeichnis",
				subtitle: "Erstellen Sie in wenigen Minuten ein profitables lokales Verzeichnis. Wir nehmen 25% Ihrer Einnahmen, ansonsten ist es völlig kostenlos.",
				cta_primary: "Kostenlos beginnen"
			}
		}
	}

	// Additional languages would be added here...
};

export default pageTranslations;
