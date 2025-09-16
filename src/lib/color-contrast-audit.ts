// Comprehensive color contrast audit and enhancement system for WCAG 2.1 AA compliance
// Provides utilities for checking, fixing, and maintaining proper contrast ratios

import { calculateContrastRatio } from './accessibility'

// =============================================================================
// Color Palette Definitions with WCAG-Compliant Variants
// =============================================================================

export interface ColorVariant {
  original: string
  wcagAA: string
  wcagAAA: string
  ratio: {
    original: number
    AA: number
    AAA: number
  }
}

export interface ColorPalette {
  background: {
    primary: ColorVariant
    secondary: ColorVariant
    tertiary: ColorVariant
    card: ColorVariant
    muted: ColorVariant
  }
  foreground: {
    primary: ColorVariant
    secondary: ColorVariant
    muted: ColorVariant
    inverted: ColorVariant
  }
  accent: {
    blue: ColorVariant
    green: ColorVariant
    red: ColorVariant
    yellow: ColorVariant
    purple: ColorVariant
  }
  neutral: {
    50: ColorVariant
    100: ColorVariant
    200: ColorVariant
    300: ColorVariant
    400: ColorVariant
    500: ColorVariant
    600: ColorVariant
    700: ColorVariant
    800: ColorVariant
    900: ColorVariant
    950: ColorVariant
  }
}

// =============================================================================
// WCAG-Compliant Color Calculations
// =============================================================================

/**
 * Enhances a color to meet WCAG AA requirements (4.5:1)
 */
function enhanceForWCAG_AA(foreground: string, background: string): string {
  const result = calculateContrastRatio(foreground, background)
  
  if (result.isValid) {
    return foreground // Already compliant
  }
  
  // Calculate enhanced color that meets 4.5:1 ratio
  return adjustColorContrast(foreground, background, 4.5)
}

/**
 * Enhances a color to meet WCAG AAA requirements (7:1)
 */
function enhanceForWCAG_AAA(foreground: string, background: string): string {
  const result = calculateContrastRatio(foreground, background)
  
  if (result.ratio >= 7) {
    return foreground // Already AAA compliant
  }
  
  // Calculate enhanced color that meets 7:1 ratio
  return adjustColorContrast(foreground, background, 7)
}

/**
 * Adjusts color brightness to achieve target contrast ratio
 */
function adjustColorContrast(foreground: string, background: string, targetRatio: number): string {
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 0, g: 0, b: 0 }
  }
  
  const rgbToHex = (r: number, g: number, b: number) => {
    return '#${((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1)}'
  }
  
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }
  
  const fgRgb = hexToRgb(foreground)
  const bgRgb = hexToRgb(background)
  const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b)
  
  // Determine if we need to make the foreground lighter or darker
  const adjustedRgb = { ...fgRgb }
  let currentRatio = 0
  let step = 5
  const maxIterations = 50
  const iterations = 0
  
  // Binary search for optimal brightness
  while (Math.abs(currentRatio - targetRatio) > 0.1 && iterations < maxIterations) {
    const adjustedLuminance = getLuminance(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b)
    const lighter = Math.max(adjustedLuminance, bgLuminance)
    const darker = Math.min(adjustedLuminance, bgLuminance)
    currentRatio = (lighter + 0.05) / (darker + 0.05)
    
    if (currentRatio < targetRatio) {
      // Need more contrast - make lighter or darker depending on background
      if (bgLuminance > 0.5) {
        // Light background, darken foreground
        adjustedRgb.r = Math.max(0, adjustedRgb.r - step)
        adjustedRgb.g = Math.max(0, adjustedRgb.g - step)
        adjustedRgb.b = Math.max(0, adjustedRgb.b - step)
      } else {
        // Dark background, lighten foreground
        adjustedRgb.r = Math.min(255, adjustedRgb.r + step)
        adjustedRgb.g = Math.min(255, adjustedRgb.g + step)
        adjustedRgb.b = Math.min(255, adjustedRgb.b + step)
      }
    } else {
      // Too much contrast, reduce step size and reverse direction
      step = Math.max(1, step / 2)
    }
    
    iterations++
  }
  
  return rgbToHex(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b)
}

/**
 * Creates a color variant with WCAG-compliant alternatives
 */
function createColorVariant(color: string, background: string = '#000000'): ColorVariant {
  const originalRatio = calculateContrastRatio(color, background)
  const aaColor = enhanceForWCAG_AA(color, background)
  const aaaColor = enhanceForWCAG_AAA(color, background)
  
  return {
    original: color,
    wcagAA: aaColor,
    wcagAAA: aaaColor,
    ratio: {
      original: originalRatio.ratio,
      AA: calculateContrastRatio(aaColor, background).ratio,
      AAA: calculateContrastRatio(aaaColor, background).ratio,
    }
  }
}

// =============================================================================
// Enhanced Color Palette with WCAG Compliance
// =============================================================================

export const wcagColorPalette: ColorPalette = {
  background: {
    primary: createColorVariant('#000000', '#ffffff'),
    secondary: createColorVariant('#0a0a0a', '#ffffff'),
    tertiary: createColorVariant('#171717', '#ffffff'),
    card: createColorVariant('#1a1a1a', '#ffffff'),
    muted: createColorVariant('#262626', '#ffffff'),
  },
  foreground: {
    primary: createColorVariant('#ffffff', '#000000'),
    secondary: createColorVariant('#e5e5e5', '#000000'),
    muted: createColorVariant('#a3a3a3', '#000000'),
    inverted: createColorVariant('#000000', '#ffffff'),
  },
  accent: {
    blue: createColorVariant('#1C8BFF', '#000000'),
    green: createColorVariant('#10b981', '#000000'),
    red: createColorVariant('#ef4444', '#000000'),
    yellow: createColorVariant('#f59e0b', '#000000'),
    purple: createColorVariant('#8b5cf6', '#000000'),
  },
  neutral: {
    50: createColorVariant('#fafafa', '#000000'),
    100: createColorVariant('#f5f5f5', '#000000'),
    200: createColorVariant('#e5e5e5', '#000000'),
    300: createColorVariant('#d4d4d4', '#000000'),
    400: createColorVariant('#a3a3a3', '#000000'),
    500: createColorVariant('#737373', '#000000'),
    600: createColorVariant('#525252', '#000000'),
    700: createColorVariant('#404040', '#000000'),
    800: createColorVariant('#262626', '#000000'),
    900: createColorVariant('#171717', '#000000'),
    950: createColorVariant('#0a0a0a', '#000000'),
  }
}

// =============================================================================
// Color Contrast Audit Functions
// =============================================================================

export interface ContrastAuditResult {
  element: string
  selector: string
  foreground: string
  background: string
  ratio: number
  level: 'AA' | 'AAA' | 'fail'
  isValid: boolean
  suggestions: {
    foregroundAA: string
    foregroundAAA: string
    backgroundAA: string
    backgroundAAA: string
  }
}

/**
 * Audits all text elements on the page for color contrast compliance
 */
export function auditPageContrast(): ContrastAuditResult[] {
  const results: ContrastAuditResult[] = []
  
  // Common text elements to audit
  const textSelectors = [
    'h1, h2, h3, h4, h5, h6',
    'p',
    'span',
    'div',
    'a',
    'button',
    'input',
    'textarea',
    'select',
    'label',
    '[role="button"]',
    '[role="link"]'
  ]
  
  textSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector)
    
    elements.forEach((element, index) => {
      const styles = window.getComputedStyle(element)
      const foreground = styles.color
      const background = styles.backgroundColor
      
      // Skip if no text content or transparent background
      if (!element.textContent?.trim() || background === 'rgba(0, 0, 0, 0)') {
        return
      }
      
      const contrast = calculateContrastRatio(
        rgbToHex(foreground),
        rgbToHex(background)
      )
      
      if (!contrast.isValid) {
        results.push({
          element: element.tagName.toLowerCase(),
          selector: '${selector}:nth-child(${index + 1})',
          foreground: rgbToHex(foreground),
          background: rgbToHex(background),
          ratio: contrast.ratio,
          level: contrast.level,
          isValid: contrast.isValid,
          suggestions: {
            foregroundAA: enhanceForWCAG_AA(rgbToHex(foreground), rgbToHex(background)),
            foregroundAAA: enhanceForWCAG_AAA(rgbToHex(foreground), rgbToHex(background)),
            backgroundAA: enhanceForWCAG_AA(rgbToHex(background), rgbToHex(foreground)),
            backgroundAAA: enhanceForWCAG_AAA(rgbToHex(background), rgbToHex(foreground)),
          }
        })
      }
    })
  })
  
  return results
}

/**
 * Converts RGB color to hex
 */
function rgbToHex(rgb: string): string {
  // Handle hex colors that are already in the right format
  if (rgb.startsWith('#')) {
    return rgb
  }
  
  // Parse rgb() or rgba() format
  const rgbMatch = rgb.match(/rgba?\(([^)]+)\)/)
  if (!rgbMatch) {
    return '#000000' // Fallback
  }
  
  const values = rgbMatch[1].split(',').map(v => parseInt(v.trim()))
  const [r, g, b] = values
  
  return '#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}'
}

/**
 * Applies WCAG-compliant colors to CSS custom properties
 */
export function applyWCAGColors(level: 'AA' | 'AAA' = 'AA'): void {
  const root = document.documentElement
  const palette = wcagColorPalette
  
  // Apply background colors
  root.style.setProperty('--background', palette.background.primary['wcag${level}'])
  root.style.setProperty('--background-secondary', palette.background.secondary['wcag${level}'])
  root.style.setProperty('--background-tertiary', palette.background.tertiary['wcag${level}'])
  root.style.setProperty('--card', palette.background.card['wcag${level}'])
  root.style.setProperty('--muted', palette.background.muted['wcag${level}'])
  
  // Apply foreground colors
  root.style.setProperty('--foreground', palette.foreground.primary['wcag${level}'])
  root.style.setProperty('--foreground-secondary', palette.foreground.secondary['wcag${level}'])
  root.style.setProperty('--muted-foreground', palette.foreground.muted['wcag${level}'])
  
  // Apply accent colors
  root.style.setProperty('--primary', palette.accent.blue['wcag${level}'])
  root.style.setProperty('--destructive', palette.accent.red['wcag${level}'])
  root.style.setProperty('--warning', palette.accent.yellow['wcag${level}'])
  root.style.setProperty('--success`, palette.accent.green[`wcag${level}`])
  
  // Apply neutral scale
  Object.entries(palette.neutral).forEach(([shade, variant]) => {
    root.style.setProperty(`--neutral-${shade}', variant['wcag${level}'])
  })
}

/**
 * Generates a comprehensive contrast audit report
 */
export function generateContrastReport(): {
  summary: {
    total: number
    failing: number
    passingAA: number
    passingAAA: number
    compliance: number
  }
  issues: ContrastAuditResult[]
  recommendations: string[]
} {
  const issues = auditPageContrast()
  const total = issues.length
  const failing = issues.filter(issue => !issue.isValid).length
  const passingAA = issues.filter(issue => issue.level === 'AA').length
  const passingAAA = issues.filter(issue => issue.level === 'AAA').length
  
  const recommendations = [
    'Use high-contrast color combinations for text and backgrounds',
    'Test color combinations with users who have visual impairments',
    'Provide alternative ways to convey information beyond color alone',
    'Use tools like color contrast analyzers during design phase',
    'Consider using the WCAG-enhanced color palette provided in this audit',
    'Regularly audit pages for contrast compliance during development'
  ]
  
  if (failing > total * 0.1) {
    recommendations.unshift('Consider implementing automatic WCAG color enhancement')
  }
  
  return {
    summary: {
      total,
      failing,
      passingAA,
      passingAAA,
      compliance: total > 0 ? ((total - failing) / total) * 100 : 100
    },
    issues: issues.filter(issue => !issue.isValid),
    recommendations
  }
}

/**
 * Hook for using WCAG-compliant colors in React components
 */
export function useWCAGColors(level: 'AA' | 'AAA' = 'AA') {
  return {
    palette: wcagColorPalette,
    getColor: (path: string) => {
      const keys = path.split('.')
      let current: unknown = wcagColorPalette
      
      for (const key of keys) {
        current = current[key]
        if (!current) return '#000000'
      }
      
      return current['wcag${level}'] || current.original || '#000000'
    },
    applyColors: () => applyWCAGColors(level),
    auditPage: auditPageContrast,
    generateReport: generateContrastReport,
  }
}

// =============================================================================
// CSS Custom Properties for WCAG Compliance
// =============================================================================

export const wcagCSSVariables = '
  /* WCAG AA Compliant Colors */
  :root {
    /* Background Colors */
    --background-wcag: ${wcagColorPalette.background.primary.wcagAA};
    --background-secondary-wcag: ${wcagColorPalette.background.secondary.wcagAA};
    --background-tertiary-wcag: ${wcagColorPalette.background.tertiary.wcagAA};
    --card-wcag: ${wcagColorPalette.background.card.wcagAA};
    --muted-wcag: ${wcagColorPalette.background.muted.wcagAA};
    
    /* Foreground Colors */
    --foreground-wcag: ${wcagColorPalette.foreground.primary.wcagAA};
    --foreground-secondary-wcag: ${wcagColorPalette.foreground.secondary.wcagAA};
    --muted-foreground-wcag: ${wcagColorPalette.foreground.muted.wcagAA};
    
    /* Accent Colors */
    --primary-wcag: ${wcagColorPalette.accent.blue.wcagAA};
    --destructive-wcag: ${wcagColorPalette.accent.red.wcagAA};
    --warning-wcag: ${wcagColorPalette.accent.yellow.wcagAA};
    --success-wcag: ${wcagColorPalette.accent.green.wcagAA};
    
    /* Neutral Scale */
    ${Object.entries(wcagColorPalette.neutral).map(([shade, variant]) => 
      '--neutral-${shade}-wcag: ${variant.wcagAA};'
    ).join('
    ')}
  }
  
  /* WCAG AAA Compliant Colors (Optional Enhanced Mode) */
  :root[data-contrast="enhanced"] {
    --background-wcag: ${wcagColorPalette.background.primary.wcagAAA};
    --foreground-wcag: ${wcagColorPalette.foreground.primary.wcagAAA};
    --primary-wcag: ${wcagColorPalette.accent.blue.wcagAAA};
    /* ... additional AAA variants */
  }
'

// Export utility functions
export {
  enhanceForWCAG_AA,
  enhanceForWCAG_AAA,
  adjustColorContrast,
  createColorVariant,
}