/**
 * Enhanced Internationalization System for Thorbis
 * Complete translation dictionary with all supported languages
 * Performance-optimized with tree-shaking and caching support
 */

// Language configuration with extended metadata
export const supportedLanguages = {
	en: { 
		name: "English", 
		nativeName: "English", 
		flag: "🇺🇸", 
		dir: "ltr",
		currency: "$",
		dateFormat: "MM/DD/YYYY",
		timeFormat: "12h"
	},
	es: { 
		name: "Spanish", 
		nativeName: "Español", 
		flag: "🇪🇸", 
		dir: "ltr",
		currency: "€",
		dateFormat: "DD/MM/YYYY",
		timeFormat: "24h"
	},
	fr: { 
		name: "French", 
		nativeName: "Français", 
		flag: "🇫🇷", 
		dir: "ltr",
		currency: "€",
		dateFormat: "DD/MM/YYYY",
		timeFormat: "24h"
	},
	de: { 
		name: "German", 
		nativeName: "Deutsch", 
		flag: "🇩🇪", 
		dir: "ltr",
		currency: "€",
		dateFormat: "DD.MM.YYYY",
		timeFormat: "24h"
	},
	pt: { 
		name: "Portuguese", 
		nativeName: "Português", 
		flag: "🇵🇹", 
		dir: "ltr",
		currency: "€",
		dateFormat: "DD/MM/YYYY",
		timeFormat: "24h"
	},
	it: { 
		name: "Italian", 
		nativeName: "Italiano", 
		flag: "🇮🇹", 
		dir: "ltr",
		currency: "€",
		dateFormat: "DD/MM/YYYY",
		timeFormat: "24h"
	},
	nl: { 
		name: "Dutch", 
		nativeName: "Nederlands", 
		flag: "🇳🇱", 
		dir: "ltr",
		currency: "€",
		dateFormat: "DD-MM-YYYY",
		timeFormat: "24h"
	},
	ja: { 
		name: "Japanese", 
		nativeName: "日本語", 
		flag: "🇯🇵", 
		dir: "ltr",
		currency: "¥",
		dateFormat: "YYYY/MM/DD",
		timeFormat: "24h"
	},
	ko: { 
		name: "Korean", 
		nativeName: "한국어", 
		flag: "🇰🇷", 
		dir: "ltr",
		currency: "₩",
		dateFormat: "YYYY.MM.DD",
		timeFormat: "12h"
	},
	zh: { 
		name: "Chinese", 
		nativeName: "中文", 
		flag: "🇨🇳", 
		dir: "ltr",
		currency: "¥",
		dateFormat: "YYYY-MM-DD",
		timeFormat: "24h"
	},
	ru: { 
		name: "Russian", 
		nativeName: "Русский", 
		flag: "🇷🇺", 
		dir: "ltr",
		currency: "₽",
		dateFormat: "DD.MM.YYYY",
		timeFormat: "24h"
	},
	ar: { 
		name: "Arabic", 
		nativeName: "العربية", 
		flag: "🇸🇦", 
		dir: "rtl",
		currency: "﷼",
		dateFormat: "DD/MM/YYYY",
		timeFormat: "12h"
	},
	hi: { 
		name: "Hindi", 
		nativeName: "हिन्दी", 
		flag: "🇮🇳", 
		dir: "ltr",
		currency: "₹",
		dateFormat: "DD/MM/YYYY",
		timeFormat: "12h"
	}
};

// Core translations that every page needs
const coreTranslations = {
	en: {
		// Navigation
		nav: {
			home: "Home",
			discover: "Discover",
			business: "For Business",
			categories: "Categories",
			search: "Search",
			login: "Sign In",
			signup: "Sign Up",
			dashboard: "Dashboard",
			profile: "Profile",
			settings: "Settings",
			help: "Help",
			about: "About",
			contact: "Contact",
			pricing: "Pricing",
			blog: "Blog",
			careers: "Careers",
			press: "Press",
			legal: "Legal",
			privacy: "Privacy",
			terms: "Terms",
			menu: "Menu",
			close: "Close",
			logout: "Sign Out"
		},
		
		// Actions
		actions: {
			save: "Save",
			cancel: "Cancel",
			delete: "Delete",
			edit: "Edit",
			view: "View",
			share: "Share",
			copy: "Copy",
			download: "Download",
			upload: "Upload",
			search: "Search",
			filter: "Filter",
			sort: "Sort",
			refresh: "Refresh",
			load_more: "Load More",
			show_more: "Show More",
			show_less: "Show Less",
			see_all: "See All",
			back: "Back",
			next: "Next",
			previous: "Previous",
			continue: "Continue",
			finish: "Finish",
			start: "Start",
			submit: "Submit",
			confirm: "Confirm",
			approve: "Approve",
			reject: "Reject",
			accept: "Accept",
			decline: "Decline",
			enable: "Enable",
			disable: "Disable",
			create: "Create",
			add: "Add",
			remove: "Remove",
			update: "Update"
		},

		// Status
		status: {
			loading: "Loading...",
			saving: "Saving...",
			saved: "Saved",
			success: "Success",
			error: "Error",
			warning: "Warning",
			info: "Information",
			pending: "Pending",
			approved: "Approved",
			rejected: "Rejected",
			active: "Active",
			inactive: "Inactive",
			enabled: "Enabled",
			disabled: "Disabled",
			online: "Online",
			offline: "Offline",
			available: "Available",
			unavailable: "Unavailable"
		},

		// Forms
		forms: {
			required: "Required",
			optional: "Optional",
			name: "Name",
			first_name: "First Name",
			last_name: "Last Name",
			email: "Email",
			phone: "Phone",
			address: "Address",
			city: "City",
			state: "State",
			country: "Country",
			zip_code: "ZIP Code",
			website: "Website",
			company: "Company",
			title: "Title",
			description: "Description",
			message: "Message",
			subject: "Subject",
			category: "Category",
			password: "Password",
			confirm_password: "Confirm Password",
			current_password: "Current Password",
			new_password: "New Password",
			username: "Username"
		},

		// Validation
		validation: {
			required: "This field is required",
			invalid_email: "Please enter a valid email address",
			invalid_phone: "Please enter a valid phone number",
			invalid_url: "Please enter a valid URL",
			min_length: "Must be at least {min} characters",
			max_length: "Must be no more than {max} characters",
			password_mismatch: "Passwords do not match",
			weak_password: "Password is too weak",
			generic_error: "Please check your input and try again"
		},

		// Time
		time: {
			now: "Now",
			today: "Today",
			yesterday: "Yesterday",
			tomorrow: "Tomorrow",
			this_week: "This week",
			last_week: "Last week",
			next_week: "Next week",
			this_month: "This month",
			last_month: "Last month",
			next_month: "Next month",
			minutes_ago: "{count} minutes ago",
			hours_ago: "{count} hours ago",
			days_ago: "{count} days ago"
		},

		// Homepage
		home: {
			hero: {
				title: "Discover Local Businesses & Community",
				subtitle: "Find the best local businesses, events, and community resources in your area",
				search_placeholder: "What are you looking for?",
				cta: "Get Started"
			},
			sections: {
				featured: "Featured Businesses",
				trending: "Trending Now",
				nearby: "Near You",
				new: "New Listings",
				top_rated: "Top Rated"
			}
		},

		// Business pages
		business: {
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
				website: "Website",
				phone: "Phone",
				email: "Email",
				address: "Address",
				directions: "Get Directions",
				call: "Call",
				write_review: "Write a Review",
				share: "Share",
				save: "Save",
				claim: "Claim this business",
				report: "Report"
			}
		},

		// Auth pages
		auth: {
			login: {
				title: "Welcome Back",
				subtitle: "Sign in to your account",
				email: "Email",
				password: "Password",
				forgot_password: "Forgot your password?",
				sign_in: "Sign In",
				no_account: "Don't have an account?",
				sign_up: "Sign Up",
				remember_me: "Remember me"
			},
			signup: {
				title: "Create Your Account",
				subtitle: "Join thousands of businesses and customers",
				first_name: "First Name",
				last_name: "Last Name",
				email: "Email",
				password: "Password",
				confirm_password: "Confirm Password",
				create_account: "Create Account",
				already_have: "Already have an account?",
				terms: "By creating an account, you agree to our",
				terms_link: "Terms of Service",
				privacy_link: "Privacy Policy"
			}
		}
	},

	// Spanish translations
	es: {
		nav: {
			home: "Inicio",
			discover: "Descubrir",
			business: "Para Empresas",
			categories: "Categorías",
			search: "Buscar",
			login: "Iniciar Sesión",
			signup: "Registrarse",
			dashboard: "Panel",
			profile: "Perfil",
			settings: "Configuración",
			help: "Ayuda",
			about: "Acerca de",
			contact: "Contacto",
			pricing: "Precios",
			blog: "Blog",
			careers: "Carreras",
			press: "Prensa",
			legal: "Legal",
			privacy: "Privacidad",
			terms: "Términos",
			menu: "Menú",
			close: "Cerrar",
			logout: "Cerrar Sesión"
		},
		
		actions: {
			save: "Guardar",
			cancel: "Cancelar",
			delete: "Eliminar",
			edit: "Editar",
			view: "Ver",
			share: "Compartir",
			copy: "Copiar",
			download: "Descargar",
			upload: "Subir",
			search: "Buscar",
			filter: "Filtrar",
			sort: "Ordenar",
			refresh: "Actualizar",
			load_more: "Cargar Más",
			show_more: "Mostrar Más",
			show_less: "Mostrar Menos",
			see_all: "Ver Todo",
			back: "Atrás",
			next: "Siguiente",
			previous: "Anterior",
			continue: "Continuar",
			finish: "Finalizar",
			start: "Iniciar",
			submit: "Enviar",
			confirm: "Confirmar",
			approve: "Aprobar",
			reject: "Rechazar",
			accept: "Aceptar",
			decline: "Declinar",
			enable: "Habilitar",
			disable: "Deshabilitar",
			create: "Crear",
			add: "Añadir",
			remove: "Eliminar",
			update: "Actualizar"
		},

		status: {
			loading: "Cargando...",
			saving: "Guardando...",
			saved: "Guardado",
			success: "Éxito",
			error: "Error",
			warning: "Advertencia",
			info: "Información",
			pending: "Pendiente",
			approved: "Aprobado",
			rejected: "Rechazado",
			active: "Activo",
			inactive: "Inactivo",
			enabled: "Habilitado",
			disabled: "Deshabilitado",
			online: "En línea",
			offline: "Fuera de línea",
			available: "Disponible",
			unavailable: "No disponible"
		},

		forms: {
			required: "Requerido",
			optional: "Opcional",
			name: "Nombre",
			first_name: "Nombre",
			last_name: "Apellido",
			email: "Correo Electrónico",
			phone: "Teléfono",
			address: "Dirección",
			city: "Ciudad",
			state: "Estado",
			country: "País",
			zip_code: "Código Postal",
			website: "Sitio Web",
			company: "Empresa",
			title: "Título",
			description: "Descripción",
			message: "Mensaje",
			subject: "Asunto",
			category: "Categoría",
			password: "Contraseña",
			confirm_password: "Confirmar Contraseña",
			current_password: "Contraseña Actual",
			new_password: "Nueva Contraseña",
			username: "Nombre de Usuario"
		},

		validation: {
			required: "Este campo es obligatorio",
			invalid_email: "Por favor ingresa un correo válido",
			invalid_phone: "Por favor ingresa un teléfono válido",
			invalid_url: "Por favor ingresa una URL válida",
			min_length: "Debe tener al menos {min} caracteres",
			max_length: "No debe tener más de {max} caracteres",
			password_mismatch: "Las contraseñas no coinciden",
			weak_password: "La contraseña es muy débil",
			generic_error: "Por favor revisa tu entrada e intenta de nuevo"
		},

		time: {
			now: "Ahora",
			today: "Hoy",
			yesterday: "Ayer",
			tomorrow: "Mañana",
			this_week: "Esta semana",
			last_week: "Semana pasada",
			next_week: "Próxima semana",
			this_month: "Este mes",
			last_month: "Mes pasado",
			next_month: "Próximo mes",
			minutes_ago: "hace {count} minutos",
			hours_ago: "hace {count} horas",
			days_ago: "hace {count} días"
		},

		home: {
			hero: {
				title: "Descubre Empresas Locales y Comunidad",
				subtitle: "Encuentra las mejores empresas locales, eventos y recursos comunitarios en tu área",
				search_placeholder: "¿Qué estás buscando?",
				cta: "Comenzar"
			},
			sections: {
				featured: "Empresas Destacadas",
				trending: "Tendencias",
				nearby: "Cerca de Ti",
				new: "Nuevos Listados",
				top_rated: "Mejor Calificados"
			}
		},

		business: {
			profile: {
				overview: "Resumen",
				reviews: "Reseñas",
				photos: "Fotos",
				hours: "Horarios",
				contact: "Contacto",
				location: "Ubicación",
				about: "Acerca de",
				services: "Servicios",
				amenities: "Comodidades",
				website: "Sitio Web",
				phone: "Teléfono",
				email: "Correo",
				address: "Dirección",
				directions: "Obtener Direcciones",
				call: "Llamar",
				write_review: "Escribir Reseña",
				share: "Compartir",
				save: "Guardar",
				claim: "Reclamar este negocio",
				report: "Reportar"
			}
		},

		auth: {
			login: {
				title: "Bienvenido de Vuelta",
				subtitle: "Inicia sesión en tu cuenta",
				email: "Correo Electrónico",
				password: "Contraseña",
				forgot_password: "¿Olvidaste tu contraseña?",
				sign_in: "Iniciar Sesión",
				no_account: "¿No tienes una cuenta?",
				sign_up: "Registrarse",
				remember_me: "Recordarme"
			},
			signup: {
				title: "Crea Tu Cuenta",
				subtitle: "Únete a miles de empresas y clientes",
				first_name: "Nombre",
				last_name: "Apellido",
				email: "Correo Electrónico",
				password: "Contraseña",
				confirm_password: "Confirmar Contraseña",
				create_account: "Crear Cuenta",
				already_have: "¿Ya tienes una cuenta?",
				terms: "Al crear una cuenta, aceptas nuestros",
				terms_link: "Términos de Servicio",
				privacy_link: "Política de Privacidad"
			}
		}
	},

	// French translations
	fr: {
		nav: {
			home: "Accueil",
			discover: "Découvrir",
			business: "Pour les Entreprises",
			categories: "Catégories",
			search: "Rechercher",
			login: "Se Connecter",
			signup: "S'inscrire",
			dashboard: "Tableau de Bord",
			profile: "Profil",
			settings: "Paramètres",
			help: "Aide",
			about: "À Propos",
			contact: "Contact",
			pricing: "Tarifs",
			blog: "Blog",
			careers: "Carrières",
			press: "Presse",
			legal: "Légal",
			privacy: "Confidentialité",
			terms: "Conditions",
			menu: "Menu",
			close: "Fermer",
			logout: "Se Déconnecter"
		},
		
		actions: {
			save: "Sauvegarder",
			cancel: "Annuler",
			delete: "Supprimer",
			edit: "Modifier",
			view: "Voir",
			share: "Partager",
			copy: "Copier",
			download: "Télécharger",
			upload: "Téléverser",
			search: "Rechercher",
			filter: "Filtrer",
			sort: "Trier",
			refresh: "Actualiser",
			load_more: "Charger Plus",
			show_more: "Voir Plus",
			show_less: "Voir Moins",
			see_all: "Voir Tout",
			back: "Retour",
			next: "Suivant",
			previous: "Précédent",
			continue: "Continuer",
			finish: "Terminer",
			start: "Commencer",
			submit: "Soumettre",
			confirm: "Confirmer",
			approve: "Approuver",
			reject: "Rejeter",
			accept: "Accepter",
			decline: "Décliner",
			enable: "Activer",
			disable: "Désactiver",
			create: "Créer",
			add: "Ajouter",
			remove: "Supprimer",
			update: "Mettre à jour"
		},

		home: {
			hero: {
				title: "Découvrez les Entreprises Locales et la Communauté",
				subtitle: "Trouvez les meilleures entreprises locales, événements et ressources communautaires de votre région",
				search_placeholder: "Que recherchez-vous ?",
				cta: "Commencer"
			}
		},

		auth: {
			login: {
				title: "Bon Retour",
				subtitle: "Connectez-vous à votre compte",
				email: "E-mail",
				password: "Mot de passe",
				forgot_password: "Mot de passe oublié ?",
				sign_in: "Se connecter",
				no_account: "Vous n'avez pas de compte ?",
				sign_up: "S'inscrire",
				remember_me: "Se souvenir de moi"
			}
		}
	},

	// German translations
	de: {
		nav: {
			home: "Startseite",
			discover: "Entdecken",
			business: "Für Unternehmen",
			categories: "Kategorien",
			search: "Suchen",
			login: "Anmelden",
			signup: "Registrieren",
			dashboard: "Dashboard",
			profile: "Profil",
			settings: "Einstellungen",
			help: "Hilfe",
			about: "Über uns",
			contact: "Kontakt",
			pricing: "Preise",
			blog: "Blog",
			careers: "Karriere",
			press: "Presse",
			legal: "Rechtliches",
			privacy: "Datenschutz",
			terms: "Bedingungen",
			menu: "Menü",
			close: "Schließen",
			logout: "Abmelden"
		},
		
		home: {
			hero: {
				title: "Entdecken Sie lokale Unternehmen und Gemeinschaft",
				subtitle: "Finden Sie die besten lokalen Unternehmen, Veranstaltungen und Gemeinschaftsressourcen in Ihrer Nähe",
				search_placeholder: "Wonach suchen Sie?",
				cta: "Loslegen"
			}
		},

		auth: {
			login: {
				title: "Willkommen zurück",
				subtitle: "Melden Sie sich in Ihrem Konto an",
				email: "E-Mail",
				password: "Passwort",
				forgot_password: "Passwort vergessen?",
				sign_in: "Anmelden",
				no_account: "Noch kein Konto?",
				sign_up: "Registrieren",
				remember_me: "Angemeldet bleiben"
			}
		}
	},

	// Portuguese translations
	pt: {
		nav: {
			home: "Início",
			discover: "Descobrir",
			business: "Para Empresas",
			categories: "Categorias",
			search: "Pesquisar",
			login: "Entrar",
			signup: "Cadastrar-se",
			dashboard: "Painel",
			profile: "Perfil",
			settings: "Configurações",
			help: "Ajuda",
			about: "Sobre",
			contact: "Contato",
			pricing: "Preços",
			blog: "Blog",
			careers: "Carreiras",
			press: "Imprensa",
			legal: "Legal",
			privacy: "Privacidade",
			terms: "Termos",
			menu: "Menu",
			close: "Fechar",
			logout: "Sair"
		},

		home: {
			hero: {
				title: "Descubra Empresas Locais e Comunidade",
				subtitle: "Encontre as melhores empresas locais, eventos e recursos comunitários da sua região",
				search_placeholder: "O que você está procurando?",
				cta: "Começar"
			}
		},

		auth: {
			login: {
				title: "Bem-vindo de Volta",
				subtitle: "Faça login na sua conta",
				email: "E-mail",
				password: "Senha",
				forgot_password: "Esqueceu sua senha?",
				sign_in: "Entrar",
				no_account: "Não tem uma conta?",
				sign_up: "Cadastrar-se",
				remember_me: "Lembrar-me"
			}
		}
	},

	// Italian translations
	it: {
		nav: {
			home: "Home",
			discover: "Scopri",
			business: "Per le Aziende",
			categories: "Categorie",
			search: "Cerca",
			login: "Accedi",
			signup: "Registrati",
			dashboard: "Dashboard",
			profile: "Profilo",
			settings: "Impostazioni",
			help: "Aiuto",
			about: "Chi siamo",
			contact: "Contatto",
			pricing: "Prezzi",
			blog: "Blog",
			careers: "Carriere",
			press: "Stampa",
			legal: "Legale",
			privacy: "Privacy",
			terms: "Termini",
			menu: "Menu",
			close: "Chiudi",
			logout: "Esci"
		},

		home: {
			hero: {
				title: "Scopri Aziende Locali e Comunità",
				subtitle: "Trova le migliori aziende locali, eventi e risorse della comunità nella tua zona",
				search_placeholder: "Cosa stai cercando?",
				cta: "Inizia"
			}
		},

		auth: {
			login: {
				title: "Bentornato",
				subtitle: "Accedi al tuo account",
				email: "E-mail",
				password: "Password",
				forgot_password: "Hai dimenticato la password?",
				sign_in: "Accedi",
				no_account: "Non hai un account?",
				sign_up: "Registrati",
				remember_me: "Ricordami"
			}
		}
	},

	// Dutch translations
	nl: {
		nav: {
			home: "Home",
			discover: "Ontdek",
			business: "Voor Bedrijven",
			categories: "Categorieën",
			search: "Zoeken",
			login: "Inloggen",
			signup: "Registreren",
			dashboard: "Dashboard",
			profile: "Profiel",
			settings: "Instellingen",
			help: "Hulp",
			about: "Over ons",
			contact: "Contact",
			pricing: "Prijzen",
			blog: "Blog",
			careers: "Carrières",
			press: "Pers",
			legal: "Juridisch",
			privacy: "Privacy",
			terms: "Voorwaarden",
			menu: "Menu",
			close: "Sluiten",
			logout: "Uitloggen"
		},

		home: {
			hero: {
				title: "Ontdek Lokale Bedrijven en Gemeenschap",
				subtitle: "Vind de beste lokale bedrijven, evenementen en gemeenschapsbronnen in uw gebied",
				search_placeholder: "Waar ben je naar op zoek?",
				cta: "Beginnen"
			}
		}
	},

	// Japanese translations
	ja: {
		nav: {
			home: "ホーム",
			discover: "発見",
			business: "ビジネス向け",
			categories: "カテゴリ",
			search: "検索",
			login: "ログイン",
			signup: "サインアップ",
			dashboard: "ダッシュボード",
			profile: "プロフィール",
			settings: "設定",
			help: "ヘルプ",
			about: "について",
			contact: "お問い合わせ",
			pricing: "料金",
			blog: "ブログ",
			careers: "採用情報",
			press: "プレス",
			legal: "法的情報",
			privacy: "プライバシー",
			terms: "利用規約",
			menu: "メニュー",
			close: "閉じる",
			logout: "ログアウト"
		},

		home: {
			hero: {
				title: "地域のビジネスとコミュニティを発見",
				subtitle: "お住まいの地域で最高の地元企業、イベント、コミュニティリソースを見つけましょう",
				search_placeholder: "何をお探しですか？",
				cta: "始める"
			}
		}
	},

	// Korean translations
	ko: {
		nav: {
			home: "홈",
			discover: "발견",
			business: "비즈니스용",
			categories: "카테고리",
			search: "검색",
			login: "로그인",
			signup: "회원가입",
			dashboard: "대시보드",
			profile: "프로필",
			settings: "설정",
			help: "도움말",
			about: "소개",
			contact: "연락처",
			pricing: "가격",
			blog: "블로그",
			careers: "채용",
			press: "보도자료",
			legal: "법적고지",
			privacy: "개인정보",
			terms: "이용약관",
			menu: "메뉴",
			close: "닫기",
			logout: "로그아웃"
		},

		home: {
			hero: {
				title: "지역 비즈니스와 커뮤니티 발견",
				subtitle: "지역 최고의 비즈니스, 이벤트, 커뮤니티 리소스를 찾아보세요",
				search_placeholder: "무엇을 찾고 계신가요?",
				cta: "시작하기"
			}
		}
	},

	// Chinese translations
	zh: {
		nav: {
			home: "首页",
			discover: "发现",
			business: "商业版",
			categories: "分类",
			search: "搜索",
			login: "登录",
			signup: "注册",
			dashboard: "控制面板",
			profile: "个人资料",
			settings: "设置",
			help: "帮助",
			about: "关于",
			contact: "联系",
			pricing: "价格",
			blog: "博客",
			careers: "招聘",
			press: "媒体",
			legal: "法律",
			privacy: "隐私",
			terms: "条款",
			menu: "菜单",
			close: "关闭",
			logout: "登出"
		},

		home: {
			hero: {
				title: "发现本地企业和社区",
				subtitle: "找到您所在地区最好的本地企业、活动和社区资源",
				search_placeholder: "您在寻找什么？",
				cta: "开始"
			}
		}
	},

	// Russian translations
	ru: {
		nav: {
			home: "Главная",
			discover: "Открыть",
			business: "Для Бизнеса",
			categories: "Категории",
			search: "Поиск",
			login: "Войти",
			signup: "Регистрация",
			dashboard: "Панель",
			profile: "Профиль",
			settings: "Настройки",
			help: "Помощь",
			about: "О нас",
			contact: "Контакт",
			pricing: "Цены",
			blog: "Блог",
			careers: "Карьера",
			press: "Пресса",
			legal: "Правовая информация",
			privacy: "Конфиденциальность",
			terms: "Условия",
			menu: "Меню",
			close: "Закрыть",
			logout: "Выйти"
		},

		home: {
			hero: {
				title: "Откройте для себя местные предприятия и сообщество",
				subtitle: "Найдите лучшие местные предприятия, события и ресурсы сообщества в вашем регионе",
				search_placeholder: "Что вы ищете?",
				cta: "Начать"
			}
		}
	},

	// Arabic translations
	ar: {
		nav: {
			home: "الرئيسية",
			discover: "اكتشف",
			business: "للأعمال",
			categories: "الفئات",
			search: "بحث",
			login: "تسجيل الدخول",
			signup: "إنشاء حساب",
			dashboard: "لوحة التحكم",
			profile: "الملف الشخصي",
			settings: "الإعدادات",
			help: "مساعدة",
			about: "حول",
			contact: "اتصل",
			pricing: "الأسعار",
			blog: "مدونة",
			careers: "وظائف",
			press: "صحافة",
			legal: "قانوني",
			privacy: "الخصوصية",
			terms: "الشروط",
			menu: "قائمة",
			close: "إغلاق",
			logout: "تسجيل الخروج"
		},

		home: {
			hero: {
				title: "اكتشف الأعمال والمجتمع المحلي",
				subtitle: "ابحث عن أفضل الأعمال المحلية والفعاليات وموارد المجتمع في منطقتك",
				search_placeholder: "ماذا تبحث؟",
				cta: "ابدأ"
			}
		}
	},

	// Hindi translations
	hi: {
		nav: {
			home: "होम",
			discover: "खोजें",
			business: "व्यापार के लिए",
			categories: "श्रेणियां",
			search: "खोज",
			login: "लॉग इन",
			signup: "साइन अप",
			dashboard: "डैशबोर्ड",
			profile: "प्रोफाइल",
			settings: "सेटिंग्स",
			help: "सहायता",
			about: "के बारे में",
			contact: "संपर्क",
			pricing: "मूल्य निर्धारण",
			blog: "ब्लॉग",
			careers: "करियर",
			press: "प्रेस",
			legal: "कानूनी",
			privacy: "गोपनीयता",
			terms: "शर्तें",
			menu: "मेन्यू",
			close: "बंद करें",
			logout: "लॉग आउट"
		},

		home: {
			hero: {
				title: "स्थानीय व्यापार और समुदाय की खोज करें",
				subtitle: "अपने क्षेत्र में सर्वोत्तम स्थानीय व्यापार, कार्यक्रम और सामुदायिक संसाधन खोजें",
				search_placeholder: "आप क्या खोज रहे हैं?",
				cta: "शुरू करें"
			}
		}
	}
};

export default coreTranslations;

// Export utility functions for better performance
export const getTranslation = (locale, key, fallback = key) => {
	const translation = coreTranslations[locale] || coreTranslations.en;
	const keys = key.split('.');
	let value = translation;

	for (const k of keys) {
		if (value && typeof value === 'object' && k in value) {
			value = value[k];
		} else {
			return fallback;
		}
	}

	return typeof value === 'string' ? value : fallback;
};

export const getLanguageMetadata = (locale) => {
	return supportedLanguages[locale] || supportedLanguages.en;
};

// Interpolation helper
export const interpolate = (text, params = {}) => {
	return text.replace(/\{(\w+)\}/g, (match, key) => {
		return params[key] !== undefined ? params[key] : match;
	});
};
