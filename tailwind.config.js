/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';
import animate from 'tailwindcss-animate';
import forms from '@tailwindcss/forms';

export default {
	darkMode: ["class"],
	content: [
		"./src/**/*.{js,ts,jsx,tsx,mdx}",
		// Remove legacy paths to reduce scanning overhead
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: "1.5rem",
				sm: "1rem",
				md: "1.5rem",
				lg: "2rem",
				xl: "2rem",
				"2xl": "2rem",
			},
			screens: {
				sm: "640px",
				md: "768px",
				lg: "1024px",
				xl: "1280px",
				"2xl": "1400px",
			},
		},
		extend: {
			fontFamily: {
				sans: [
					"Inter",
					"ui-sans-serif",
					"system-ui",
					"Segoe UI",
					"Roboto",
					"Helvetica Neue",
					"Arial",
					"Noto Sans",
					"Apple Color Emoji",
					"Segoe UI Emoji",
					"Segoe UI Symbol",
				],
				mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New"],
			},
			fontSize: {
				xs: ["0.75rem", { lineHeight: "1rem" }],
				sm: ["0.875rem", { lineHeight: "1.25rem" }],
				base: ["1rem", { lineHeight: "1.5rem" }],
				lg: ["1.125rem", { lineHeight: "1.75rem" }],
				xl: ["1.25rem", { lineHeight: "1.75rem" }],
				"2xl": ["1.5rem", { lineHeight: "2rem" }],
				"3xl": ["1.875rem", { lineHeight: "2.25rem" }],
				"4xl": ["2.25rem", { lineHeight: "2.5rem" }],
				"5xl": ["3rem", { lineHeight: "1" }],
				"6xl": ["3.75rem", { lineHeight: "1" }],
				"7xl": ["4.5rem", { lineHeight: "1" }],
			},
			ringWidth: {
				0: "0px",
			},
			colors: {
				// Removed hard-coded gray colors - use CSS variables instead
				// All colors should use hsl(var(--color-name)) format
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				success: {
					DEFAULT: "hsl(var(--success))",
					foreground: "hsl(var(--success-foreground))",
				},
				warning: {
					DEFAULT: "hsl(var(--warning))",
					foreground: "hsl(var(--warning-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				sidebar: {
					DEFAULT: "hsl(var(--sidebar-background))",
					foreground: "hsl(var(--sidebar-foreground))",
					primary: "hsl(var(--sidebar-primary))",
					"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
					accent: "hsl(var(--sidebar-accent))",
					"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
					border: "hsl(var(--sidebar-border))",
					ring: "hsl(var(--sidebar-ring))",
				},
			},
			typography: (theme) => ({
				DEFAULT: {
					css: {
						color: theme("colors.foreground"),
						a: { color: theme("colors.primary.DEFAULT") },
						h1: { color: theme("colors.foreground") },
						h2: { color: theme("colors.foreground") },
						h3: { color: theme("colors.foreground") },
						strong: { color: theme("colors.foreground") },
						blockquote: { color: theme("colors.muted.foreground") },
					}
				},
			}),
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			keyframes: {
				"accordion-down": {
					from: {
						height: "0",
					},
					to: {
						height: "var(--radix-accordion-content-height)",
					},
				},
				"accordion-up": {
					from: {
						height: "var(--radix-accordion-content-height)",
					},
					to: {
						height: "0",
					},
				},
				breathe: {
					"0%, 100%": {
						transform: "scale(1)",
					},
					"50%": {
						transform: "scale(1.20)",
					},
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"spin-slow": "spin 1s linear infinite",
				breathe: "breathe 1s ease-in-out infinite",
			},
		},
	},

	variants: {
		extend: {
			ringWidth: ["focus-visible"],
			ringColor: ["focus-visible"],
			ringOffsetWidth: ["focus-visible"],
		},
	},
	plugins: [
		function ({ addUtilities }) {
			const newUtilities = {
				".scrollbar-hide": {
					/* Hide scrollbar for Chrome, Safari and Opera */
					"&::-webkit-scrollbar": {
						display: "none",
					},
					/* Hide scrollbar for IE, Edge and Firefox */
					"-ms-overflow-style": "none",
					"scrollbar-width": "none",
				},
			};

			addUtilities(newUtilities, ["responsive", "hover"]);
		},
		typography,
		animate,
		forms,
		function ({ addBase, config }) {
			addBase({
				"input:-webkit-autofill, textarea:-webkit-autofill, select:-webkit-autofill": {
					"-webkit-box-shadow": `0 0 0px 1000px hsl(var(--background)) inset`,
					boxShadow: `0 0 0px 1000px hsl(var(--background)) inset`,
					"-webkit-text-fill-color": `hsl(var(--foreground))`,
					transition: "background-color 5000s ease-in-out 0s",
				},
				"@media (prefers-color-scheme: dark)": {
					"input:-webkit-autofill, textarea:-webkit-autofill, select:-webkit-autofill": {
						"-webkit-box-shadow": `0 0 0px 1000px hsl(var(--background)) inset`,
						boxShadow: `0 0 0px 1000px hsl(var(--background)) inset`,
						"-webkit-text-fill-color": `hsl(var(--foreground))`,
					},
				},
			});
		},
	],
};
  
