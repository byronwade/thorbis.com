import type { Config } from 'tailwindcss'

// Thorbis Design System Tokens - Dark-first VIP minimalism
const thorbisDarkColors = {
  // Brand - Thorbis Electric Blue (used sparingly)
  blue: {
    50: '#EBF3FF',
    100: '#D6E9FF', 
    200: '#ADD3FF',
    300: '#7FB8FF',
    400: '#4FA2FF',
    500: '#1C8BFF', // PRIMARY - for focus, CTA, highlights only
    600: '#0B84FF',
    700: '#0A6BDB',
    800: '#0A57B1',
    900: '#0A478F',
  },
  
  // Neutrals - Odixe dark-friendly scale
  gray: {
    0: '#000000',        // black
    25: '#0A0B0D',       // base background (dark)
    50: '#0D0F13',       // surface background
    100: '#111318',      // elevated surface
    200: '#171A21',      // elevated background
    300: '#1D212B',
    400: '#2A2F3A',      // subtle borders
    500: '#3A4150',      // strong borders
    600: '#545D6E',      // muted text
    700: '#7A8598',      // secondary text
    800: '#A9B2C1',
    900: '#E6EAF0',      // primary text (on dark)
    white: '#FFFFFF',    // white
  },
  
  // Status colors (high contrast for accessibility)
  green: { DEFAULT: '#18B26B' },    // success
  yellow: { DEFAULT: '#E5A400' },   // warning  
  red: { DEFAULT: '#E5484D' },      // danger
  info: { DEFAULT: '#4FA2FF' },     // info
}

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}', 
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Dark-first color system
      colors: {
        // CSS variables for shadcn/ui components
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Sidebar component colors (shadcn/ui sidebar)
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

        // Direct Thorbis color usage
        ...thorbisDarkColors,
        
        // Industry-specific colors for different apps
        'service-priority': {
          low: thorbisDarkColors.blue[200],
          medium: thorbisDarkColors.yellow.DEFAULT,
          high: thorbisDarkColors.red.DEFAULT,
          emergency: '#DC2626',
        },
        'order-status': {
          pending: thorbisDarkColors.yellow.DEFAULT,
          preparing: thorbisDarkColors.blue[500],
          ready: thorbisDarkColors.green.DEFAULT,
          delivered: thorbisDarkColors.gray[600],
        },
        'repair-status': {
          inspection: thorbisDarkColors.info.DEFAULT,
          diagnosed: thorbisDarkColors.yellow.DEFAULT,
          'in-progress': thorbisDarkColors.blue[500],
          completed: thorbisDarkColors.green.DEFAULT,
        },
        'inventory-status': {
          'in-stock': thorbisDarkColors.green.DEFAULT,
          'low-stock': thorbisDarkColors.yellow.DEFAULT,
          'out-of-stock': thorbisDarkColors.red.DEFAULT,
        },
        'account-type': {
          asset: thorbisDarkColors.green.DEFAULT,
          liability: thorbisDarkColors.red.DEFAULT,
          equity: thorbisDarkColors.blue[500],
          revenue: thorbisDarkColors.info.DEFAULT,
          expense: thorbisDarkColors.yellow.DEFAULT,
        },
      },
      
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      
      // Extend spacing system (keep Tailwind defaults + add custom values)
      spacing: {
        // Keep all default Tailwind spacing values and add these custom ones
        '18': '4.5rem',   // 72px
        '72': '18rem',    // 288px
        '84': '21rem',    // 336px  
        '96': '24rem',    // 384px
      },
      
      // Typography - Inter font stack
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'SF Mono', 'Monaco', 'Cascadia Code', 'monospace'],
        ui: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      
      fontSize: {
        xs: ['0.75rem', '1.125rem'],      // 12px/18px
        sm: ['0.875rem', '1.25rem'],      // 14px/20px - Body text
        base: ['0.875rem', '1.25rem'],    // 14px/20px - Default
        lg: ['1.125rem', '1.625rem'],     // 18px/26px - H3
        xl: ['1.25rem', '1.75rem'],       // 20px/28px - H2
        '2xl': ['1.5rem', '1.875rem'],    // 24px/30px - H1
        'display': ['2rem', '2.375rem'],  // 32px/38px - Hero only
      },
      
      fontWeight: {
        normal: '400',     // Body text
        medium: '500',     // Emphasized text, labels
        semibold: '600',   // Headings, buttons
      },
      
      // Minimal shadows (Vercel-inspired)
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', 
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      
      // Performance-optimized animations
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-from-top": {
          from: { transform: "translateY(-10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-from-bottom": {
          from: { transform: "translateY(10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out", 
        "fade-in": "fade-in 150ms ease-out",
        "slide-in-from-top": "slide-in-from-top 150ms ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 150ms ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
