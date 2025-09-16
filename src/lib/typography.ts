import { cva } from "class-variance-authority"

/**
 * Typography variants for consistent text styling across the application
 */
export const typographyVariants = cva("", {
  variants: {
    variant: {
      // Display text for hero sections
      "display-large": "text-6xl font-bold tracking-tight leading-tight",
      "display-medium": "text-5xl font-bold tracking-tight leading-tight",
      "display-small": "text-4xl font-bold tracking-tight leading-tight",
      
      // Headings for section titles
      "heading-large": "text-3xl font-bold tracking-tight leading-tight",
      "heading-medium": "text-2xl font-bold tracking-tight leading-tight", 
      "heading-small": "text-xl font-semibold tracking-tight leading-tight",
      
      // Body text variants
      "body-large": "text-lg leading-relaxed",
      "body-medium": "text-base leading-relaxed",
      "body-small": "text-sm leading-relaxed",
      
      // UI text for labels, captions, etc.
      "label-large": "text-sm font-medium leading-none",
      "label-medium": "text-xs font-medium leading-none tracking-wide",
      "label-small": "text-xs font-medium leading-none tracking-wider uppercase",
      
      // Muted text for secondary information
      "muted-large": "text-lg text-muted-foreground leading-relaxed",
      "muted-medium": "text-base text-muted-foreground leading-relaxed",
      "muted-small": "text-sm text-muted-foreground leading-relaxed",
      
      // Code and monospace text
      "code": "font-mono text-sm bg-muted px-1.5 py-0.5 rounded",
      "code-block": "font-mono text-sm leading-relaxed",
    },
  },
  defaultVariants: {
    variant: "body-medium",
  },
})

/**
 * Spacing variants for consistent margins and padding
 */
export const spacingVariants = cva("", {
  variants: {
    spacing: {
      "section": "space-y-16", // Between major sections
      "subsection": "space-y-12", // Between subsections 
      "component": "space-y-8", // Between components
      "content": "space-y-6", // Between content blocks
      "compact": "space-y-4", // Between related items
      "tight": "space-y-3", // Between closely related items
      "minimal": "space-y-2", // Between inline items
    },
  },
})

/**
 * Container variants for consistent layout widths
 */
export const containerVariants = cva("mx-auto w-full", {
  variants: {
    size: {
      "full": "max-w-none",
      "screen": "max-w-screen-2xl px-6 lg:px-8 xl:px-12 2xl:px-16",
      "wide": "max-w-7xl px-6 lg:px-8",
      "content": "max-w-4xl px-6",
      "narrow": "max-w-2xl px-6",
      "text": "max-w-prose px-6",
    },
  },
  defaultVariants: {
    size: "content",
  },
})

/**
 * Transition variants for consistent animations
 */
export const transitionVariants = cva("transition-all", {
  variants: {
    duration: {
      "fast": "duration-150 ease-out",
      "normal": "duration-200 ease-out", 
      "slow": "duration-300 ease-out",
      "slower": "duration-500 ease-out",
    },
  },
  defaultVariants: {
    duration: "normal",
  },
})