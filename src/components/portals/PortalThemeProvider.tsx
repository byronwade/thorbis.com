/**
 * Portal Theme Provider
 * Provides dynamic theming and branding for customer portals
 */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export interface PortalBranding {
  // Logo and Visual Identity
  show_logo?: boolean;
  logo_url?: string;
  logo_position?: 'left' | 'center' | 'right';
  favicon_url?: string;
  
  // Color Scheme
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  border_color?: string;
  
  // Typography
  font_family?: string;
  heading_font?: string;
  font_size_base?: string;
  
  // Brand Information
  company_name?: string;
  company_tagline?: string;
  welcome_message?: string;
  footer_text?: string;
  
  // Portal Customization
  show_powered_by?: boolean;
  custom_css?: string;
  portal_title?: string;
  page_title_template?: string;
  
  // Layout Options
  layout_style?: 'default' | 'compact' | 'spacious';
  header_style?: 'standard' | 'minimal' | 'branded';
  sidebar_style?: 'full' | 'icons' | 'hidden';
  
  // Industry-Specific Options
  industry_colors?: boolean;
  industry_icons?: boolean;
  custom_navigation?: {
    label: string;
    href: string;
    icon?: string;
  }[];
}

export interface PortalTheme {
  // Core Theme Properties
  id: string;
  name: string;
  portal_type: 'restaurant' | 'auto' | 'retail' | 'hs';
  branding: PortalBranding;
  
  // Computed Theme Variables
  css_variables: Record<string, string>;
  class_names: Record<string, string>;
  
  // Theme State
  is_dark_mode?: boolean;
  is_high_contrast?: boolean;
}

interface PortalThemeContextType {
  theme: PortalTheme | null;
  branding: PortalBranding;
  updateBranding: (updates: Partial<PortalBranding>) => void;
  applyTheme: (theme: PortalTheme) => void;
  resetTheme: () => void;
  toggleDarkMode: () => void;
  toggleHighContrast: () => void;
}

const PortalThemeContext = createContext<PortalThemeContextType | undefined>(undefined);

// Default branding configurations for each portal type
const defaultBrandings: Record<string, PortalBranding> = {
  restaurant: {
    primary_color: '#FF6B35',
    secondary_color: '#FFA500',
    accent_color: '#FFE135',
    company_name: 'Restaurant Portal',
    welcome_message: 'Welcome to your restaurant management portal',
    industry_colors: true,
    industry_icons: true,
    layout_style: 'default',
    header_style: 'standard',
  },
  auto: {
    primary_color: '#DC2626',
    secondary_color: '#991B1B',
    accent_color: '#FEE2E2',
    company_name: 'Auto Service Portal',
    welcome_message: 'Track your vehicle service and maintenance',
    industry_colors: true,
    industry_icons: true,
    layout_style: 'default',
    header_style: 'standard',
  },
  retail: {
    primary_color: '#059669',
    secondary_color: '#047857',
    accent_color: '#D1FAE5',
    company_name: 'Retail Portal',
    welcome_message: 'Your personalized shopping experience',
    industry_colors: true,
    industry_icons: true,
    layout_style: 'default',
    header_style: 'standard',
  },
  hs: {
    primary_color: '#2563EB',
    secondary_color: '#1D4ED8',
    accent_color: '#DBEAFE',
    company_name: 'Home Services Portal',
    welcome_message: 'Manage your home services and maintenance',
    industry_colors: true,
    industry_icons: true,
    layout_style: 'default',
    header_style: 'standard',
  },
};

interface PortalThemeProviderProps {
  children: React.ReactNode;
  portalType: 'restaurant' | 'auto' | 'retail' | 'hs';
  initialBranding?: PortalBranding;
  organizationId?: string;
}

export function PortalThemeProvider({
  children,
  portalType,
  initialBranding,
  organizationId,
}: PortalThemeProviderProps) {
  const [branding, setBranding] = useState<PortalBranding>(() => ({
    ...defaultBrandings[portalType],
    ...initialBranding,
  }));

  const [theme, setTheme] = useState<PortalTheme | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);

  // Generate CSS variables from branding
  const generateCSSVariables = (brandingConfig: PortalBranding): Record<string, string> => {
    const variables: Record<string, string> = {};

    if (brandingConfig.primary_color) {
      variables['--portal-primary'] = brandingConfig.primary_color;
      variables['--portal-primary-rgb'] = hexToRgb(brandingConfig.primary_color);
    }

    if (brandingConfig.secondary_color) {
      variables['--portal-secondary'] = brandingConfig.secondary_color;
      variables['--portal-secondary-rgb'] = hexToRgb(brandingConfig.secondary_color);
    }

    if (brandingConfig.accent_color) {
      variables['--portal-accent'] = brandingConfig.accent_color;
      variables['--portal-accent-rgb'] = hexToRgb(brandingConfig.accent_color);
    }

    if (brandingConfig.background_color) {
      variables['--portal-background'] = brandingConfig.background_color;
    }

    if (brandingConfig.text_color) {
      variables['--portal-text'] = brandingConfig.text_color;
    }

    if (brandingConfig.border_color) {
      variables['--portal-border'] = brandingConfig.border_color;
    }

    if (brandingConfig.font_family) {
      variables['--portal-font-family'] = brandingConfig.font_family;
    }

    if (brandingConfig.heading_font) {
      variables['--portal-heading-font'] = brandingConfig.heading_font;
    }

    if (brandingConfig.font_size_base) {
      variables['--portal-font-size-base'] = brandingConfig.font_size_base;
    }

    return variables;
  };

  // Generate class names based on branding configuration
  const generateClassNames = (brandingConfig: PortalBranding): Record<string, string> => {
    return {
      layout: 'portal-layout-${brandingConfig.layout_style || 'default'}',
      header: 'portal-header-${brandingConfig.header_style || 'standard'}',
      sidebar: 'portal-sidebar-${brandingConfig.sidebar_style || 'full'}',
      theme: 'portal-theme-${portalType}',
      contrast: isHighContrast ? 'portal-high-contrast' : ',
      darkMode: isDarkMode ? 'portal-dark' : 'portal-light',
    };
  };

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0, 0, 0';
    
    return [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ].join(', ');
  };

  // Update theme when branding changes
  useEffect(() => {
    const cssVariables = generateCSSVariables(branding);
    const classNames = generateClassNames(branding);

    const newTheme: PortalTheme = {
      id: '${portalType}-${organizationId || 'default'}',
      name: branding.company_name || '${portalType} Portal',
      portal_type: portalType,
      branding,
      css_variables: cssVariables,
      class_names: classNames,
      is_dark_mode: isDarkMode,
      is_high_contrast: isHighContrast,
    };

    setTheme(newTheme);
  }, [branding, portalType, organizationId, isDarkMode, isHighContrast]);

  // Apply CSS variables to document root
  useEffect(() => {
    if (theme) {
      const root = document.documentElement;
      
      // Apply CSS variables
      Object.entries(theme.css_variables).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });

      // Apply theme classes to body
      document.body.className = Object.values(theme.class_names)
        .filter(Boolean)
        .join(' ');

      // Apply custom CSS if provided
      if (branding.custom_css) {
        let customStyleElement = document.getElementById('portal-custom-styles');
        if (!customStyleElement) {
          customStyleElement = document.createElement('style');
          customStyleElement.id = 'portal-custom-styles';
          document.head.appendChild(customStyleElement);
        }
        customStyleElement.textContent = branding.custom_css;
      }

      // Update page title if template provided
      if (branding.page_title_template) {
        document.title = branding.page_title_template.replace(
          '{company_name}',
          branding.company_name || 'Portal'
        );
      }

      // Update favicon if provided
      if (branding.favicon_url) {
        let faviconElement = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (!faviconElement) {
          faviconElement = document.createElement('link');
          faviconElement.rel = 'icon';
          document.head.appendChild(faviconElement);
        }
        faviconElement.href = branding.favicon_url;
      }
    }

    // Cleanup function
    return () => {
      if (theme) {
        const root = document.documentElement;
        Object.keys(theme.css_variables).forEach(property => {
          root.style.removeProperty(property);
        });
      }
    };
  }, [theme, branding.custom_css, branding.page_title_template, branding.company_name, branding.favicon_url]);

  const updateBranding = (updates: Partial<PortalBranding>) => {
    setBranding(prev => ({ ...prev, ...updates }));
  };

  const applyTheme = (newTheme: PortalTheme) => {
    setTheme(newTheme);
    setBranding(newTheme.branding);
    setIsDarkMode(newTheme.is_dark_mode || false);
    setIsHighContrast(newTheme.is_high_contrast || false);
  };

  const resetTheme = () => {
    setBranding(defaultBrandings[portalType]);
    setIsDarkMode(false);
    setIsHighContrast(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const toggleHighContrast = () => {
    setIsHighContrast(prev => !prev);
  };

  const contextValue: PortalThemeContextType = {
    theme,
    branding,
    updateBranding,
    applyTheme,
    resetTheme,
    toggleDarkMode,
    toggleHighContrast,
  };

  return (
    <PortalThemeContext.Provider value={contextValue}>
      {children}
    </PortalThemeContext.Provider>
  );
}

export function usePortalTheme() {
  const context = useContext(PortalThemeContext);
  if (context === undefined) {
    throw new Error('usePortalTheme must be used within a PortalThemeProvider');
  }
  return context;
}

// Hook for easy access to just the branding configuration
export function usePortalBranding() {
  const { branding } = usePortalTheme();
  return branding;
}

// Hook for easy access to just the theme
export function usePortalThemeConfig() {
  const { theme } = usePortalTheme();
  return theme;
}