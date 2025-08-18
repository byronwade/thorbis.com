# Thorbis Internationalization (i18n) System

A comprehensive, modular internationalization system for the Thorbis platform supporting multiple languages and enterprise-level features.

## 🌍 Supported Languages

- **English (en)** - Primary language
- **Spanish (es)** - Español
- **French (fr)** - Français  
- **German (de)** - Deutsch
- **Portuguese (pt)** - Português
- **Italian (it)** - Italiano
- **Dutch (nl)** - Nederlands
- **Japanese (ja)** - 日本語
- **Korean (ko)** - 한국어
- **Chinese (zh)** - 中文
- **Russian (ru)** - Русский
- **Arabic (ar)** - العربية
- **Hindi (hi)** - हिन्दी

## 📁 Project Structure

```
src/lib/i18n/
├── index.js                 # Main entry point, combines all modules
├── dictionaries.js          # Backward compatibility wrapper
├── useTranslation.js        # Translation hooks and utilities
├── README.md               # This documentation
└── modules/                # Modular translation files
    ├── auth.js             # Authentication pages
    ├── landingPages.js     # Landing pages & marketing
    ├── business.js         # Business listings & profiles
    ├── dashboard.js        # Dashboard interfaces
    ├── common.js           # Shared elements (navigation, forms, etc.)
    └── pages.js            # Help, legal, company pages
```

## 🚀 Quick Start

### 1. Basic Usage with Hooks

```jsx
import { useTranslation } from '@lib/i18n/useTranslation';

function MyComponent() {
  const { t, locale, setLocale } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.navigation.home')}</h1>
      <p>Current language: {locale}</p>
    </div>
  );
}
```

### 2. Specialized Hooks for Different Sections

```jsx
// For authentication pages
import { useAuthTranslation } from '@lib/i18n/useTranslation';

function LoginForm() {
  const { tLogin, tCommon } = useAuthTranslation();
  
  return (
    <form>
      <h1>{tLogin('title')}</h1>
      <input placeholder={tLogin('email')} />
      <button>{tCommon('actions.submit')}</button>
    </form>
  );
}

// For business pages
import { useBusinessTranslation } from '@lib/i18n/useTranslation';

function BusinessProfile() {
  const { tProfile, tReviews } = useBusinessTranslation();
  
  return (
    <div>
      <h1>{tProfile('title')}</h1>
      <section>
        <h2>{tReviews('title')}</h2>
      </section>
    </div>
  );
}
```

### 3. Server-Side Translation

```jsx
// For Next.js pages and metadata
import { getDictionary, getTranslation } from '@lib/i18n';

export async function generateMetadata({ params }) {
  const locale = params.locale || 'en';
  const title = await getTranslation(locale, 'auth.login.title');
  
  return {
    title: `${title} - Thorbis`,
    description: await getTranslation(locale, 'auth.login.description')
  };
}
```

## 🎯 Advanced Features

### Translation with Interpolation

```jsx
const { t } = useTranslation();

// With variable interpolation
const message = t('common.validation.min_length', {
  interpolation: { min: 8 }
}); // "Must be at least 8 characters"

// With fallback
const text = t('some.missing.key', {
  fallback: 'Default text'
});
```

### Language Detection and Management

```jsx
import { 
  detectLanguage, 
  saveLanguagePreference 
} from '@lib/i18n/useTranslation';

// Auto-detect browser language
const browserLang = detectLanguage();

// Save user preference
saveLanguagePreference('es');
```

### Translation Provider

Wrap your app with the translation provider:

```jsx
import { TranslationProvider } from '@lib/i18n/useTranslation';

function App({ children }) {
  return (
    <TranslationProvider initialLocale="en">
      {children}
    </TranslationProvider>
  );
}
```

## 🧩 UI Components

### Language Switcher

```jsx
import { 
  LanguageSwitcher, 
  CompactLanguageSwitcher,
  MinimalLanguageSwitcher,
  LanguageGrid 
} from '@components/ui/language-switcher';

// Full featured switcher
<LanguageSwitcher showFlag={true} showName={true} />

// Compact version for headers
<CompactLanguageSwitcher />

// Minimal version for footers
<MinimalLanguageSwitcher />

// Grid layout for settings pages
<LanguageGrid 
  currentLocale="en" 
  onLanguageChange={handleChange} 
/>
```

## 📝 Adding New Translations

### 1. Update Translation Files

Add your new keys to the appropriate module files:

```javascript
// src/lib/i18n/modules/auth.js
export const authTranslations = {
  en: {
    auth: {
      newFeature: {
        title: "New Feature",
        description: "This is a new feature"
      }
    }
  },
  es: {
    auth: {
      newFeature: {
        title: "Nueva Característica", 
        description: "Esta es una nueva característica"
      }
    }
  }
  // ... other languages
};
```

### 2. Use in Components

```jsx
const { t } = useAuthTranslation();

return (
  <div>
    <h1>{t('newFeature.title')}</h1>
    <p>{t('newFeature.description')}</p>
  </div>
);
```

## 🔧 Translation Key Patterns

### Hierarchical Structure

```
section.subsection.key
├── auth.login.title
├── auth.login.email
├── business.profile.title
├── common.actions.save
└── dashboard.navigation.overview
```

### Naming Conventions

- Use lowercase with underscores: `sign_up`, `forgot_password`
- Group related keys: `login.title`, `login.subtitle`, `login.errors.invalid`
- Use descriptive names: `business_owner_login` not `bol`

## 🌐 Internationalized Pages

### Page Metadata

```jsx
export async function generateMetadata({ params }) {
  const locale = params.locale || 'en';
  const dict = await getDictionary(locale);
  
  return {
    title: `${dict.auth.login.title} - Thorbis`,
    description: dict.auth.login.description,
    alternates: {
      canonical: `https://thorbis.com/${locale}/login`,
      languages: {
        'en': 'https://thorbis.com/en/login',
        'es': 'https://thorbis.com/es/login',
        // ... other languages
      }
    }
  };
}
```

### JSON-LD Schema

```jsx
async function generateJsonLd(locale) {
  const dict = await getDictionary(locale);
  
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": dict.auth.login.title,
    "description": dict.auth.login.description,
    "inLanguage": locale
  };
}
```

## 📊 Available Translation Hooks

| Hook | Purpose | Example Usage |
|------|---------|---------------|
| `useTranslation()` | General purpose | `t('common.actions.save')` |
| `useAuthTranslation()` | Authentication | `tLogin('title')` |
| `useBusinessTranslation()` | Business features | `tProfile('overview')` |
| `useDashboardTranslation()` | Dashboard pages | `tNav('analytics')` |
| `useCommonTranslation()` | Shared elements | `tActions('submit')` |
| `usePagesTranslation()` | Static pages | `tHelp('contact_support')` |
| `useLandingPagesTranslation()` | Marketing pages | `tCommon('get_started')` |

## 🎨 UI Component Variants

### Language Switcher Variants

```jsx
// Default - Full featured
<LanguageSwitcher />

// Compact - For headers/navigation
<LanguageSwitcher variant="compact" />

// Minimal - For footers
<LanguageSwitcher variant="minimal" />

// Custom styling
<LanguageSwitcher 
  className="custom-styles"
  placement="bottom-start"
  showFlag={false}
/>
```

## 🔄 Migration Guide

### From Old System

1. Replace old imports:
   ```jsx
   // Old
   import { getDictionary } from '@lib/i18n/dictionaries';
   
   // New  
   import { useTranslation } from '@lib/i18n/useTranslation';
   ```

2. Update component usage:
   ```jsx
   // Old
   const dict = await getDictionary(locale);
   const title = dict.footer.sections.about;
   
   // New
   const { t } = useTranslation();
   const title = t('footer.sections.about');
   ```

3. Use specialized hooks:
   ```jsx
   // Old
   const loginTitle = dict.auth.login.title;
   
   // New
   const { tLogin } = useAuthTranslation();
   const loginTitle = tLogin('title');
   ```

## 🚨 Best Practices

### Performance
- Use specialized hooks (`useAuthTranslation`, etc.) for better organization
- Translations are cached automatically
- Minimal bundle impact with tree-shaking

### Accessibility
- Always provide fallback text
- Use semantic HTML with proper lang attributes
- Support RTL languages where applicable

### SEO
- Generate proper hreflang tags
- Use locale-specific URLs
- Include language alternates in metadata

### Development
- Keep translation keys descriptive
- Group related translations logically
- Use interpolation for dynamic content
- Always provide fallbacks

## 🧪 Testing

### Unit Tests
```jsx
import { render } from '@testing-library/react';
import { TranslationProvider } from '@lib/i18n/useTranslation';

const renderWithTranslations = (component, locale = 'en') => {
  return render(
    <TranslationProvider initialLocale={locale}>
      {component}
    </TranslationProvider>
  );
};
```

### Language Coverage
- Ensure all supported languages have complete translations
- Test fallback behavior for missing keys
- Validate interpolation works correctly

## 🔗 Integration Examples

See the example files:
- `src/features/auth/components/LoginForm/login-i18n-example.js`
- `src/app/(auth)/(forms)/login/page-i18n-example.js`

These demonstrate complete integration patterns for both client and server components.

## 📞 Support

For questions about the i18n system:
1. Check this documentation
2. Review example implementations
3. Search existing issues
4. Contact the development team

---

**Note**: This system is designed for scalability and maintainability. When adding new features, always consider internationalization from the start.
