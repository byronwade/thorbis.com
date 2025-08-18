# Internationalization Migration Guide

This guide will help you migrate from the old i18n system to the new enhanced internationalization system that supports all 13 languages with SSR optimization and performance improvements.

## 🚀 What's New

### Enhanced Features
- **13 Languages**: English, Spanish, French, German, Portuguese, Italian, Dutch, Japanese, Korean, Chinese, Russian, Arabic, Hindi
- **SSR Optimization**: Server-side translations with React cache() for performance
- **Automatic Language Detection**: Browser, cookie, and header-based detection
- **SEO-Friendly URLs**: Clean language routing with proper hreflang tags
- **Performance**: Tree-shaking, caching, and bundle optimization
- **Developer Tools**: Translation key extraction, validation, and missing key detection

### Breaking Changes
- New import paths for translation functions
- Updated hook signatures
- New component prop structure
- Server vs client translation separation

## 📦 Installation

No additional packages needed - everything is built-in to the existing system.

## 🔄 Migration Steps

### Step 1: Update Import Statements

**Old imports:**
```javascript
// ❌ Old way
import { useLanguage } from '@context/language-context';
import { getDictionary } from '@lib/i18n/dictionaries';
import { useTranslation } from '@lib/i18n/useTranslation';
```

**New imports:**
```javascript
// ✅ New way
// For client components
import { 
  useTranslation, 
  useAuthTranslation,
  useBusinessTranslation,
  TranslationProvider 
} from '@lib/i18n/enhanced-client';

// For server components
import { 
  getDictionary, 
  t as serverT,
  generateI18nMetadata 
} from '@lib/i18n/server';

// For UI components
import { LanguageSwitcher } from '@components/shared/enhanced-language-switcher';
```

### Step 2: Update Root Layout

**Old layout:**
```javascript
// ❌ Old way
import { LanguageProvider } from '@context/language-context';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <LanguageProvider initialLocale="en">
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
```

**New layout:**
```javascript
// ✅ New way
import { TranslationProvider } from '@lib/i18n/enhanced-client';
import { getDictionary } from '@lib/i18n/server';

export default async function RootLayout({ children, params }) {
  const locale = params?.locale || 'en';
  const dictionary = await getDictionary(locale);

  return (
    <html lang={locale}>
      <body>
        <TranslationProvider 
          initialLocale={locale} 
          serverDictionary={dictionary}
        >
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}
```

### Step 3: Update Client Components

**Old client component:**
```javascript
// ❌ Old way
import { useLanguage } from '@context/language-context';

function MyComponent() {
  const { t, locale, changeLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('common.navigation.home')}</h1>
      <button onClick={() => changeLanguage('es')}>
        Switch to Spanish
      </button>
    </div>
  );
}
```

**New client component:**
```javascript
// ✅ New way
import { useTranslation, useNavigationTranslation } from '@lib/i18n/enhanced-client';
import { LanguageSwitcher } from '@components/shared/enhanced-language-switcher';

function MyComponent() {
  const { t, locale, changeLanguage } = useTranslation();
  const { tNav } = useNavigationTranslation(); // Specialized hook
  
  return (
    <div>
      <h1>{tNav('home')}</h1> {/* Simplified key path */}
      <LanguageSwitcher /> {/* Enhanced component */}
    </div>
  );
}
```

### Step 4: Update Server Components

**New server component pattern:**
```javascript
// ✅ Server components now use serverT
import { serverT, generateI18nMetadata } from '@lib/i18n/server';

// Generate metadata with SEO optimization
export async function generateMetadata({ params }) {
  const locale = params?.locale || 'en';
  
  return await generateI18nMetadata(locale, 'home', {
    title: await serverT(locale, 'home.meta.title'),
    description: await serverT(locale, 'home.meta.description'),
  });
}

// Server component with translations
export default async function HomePage({ params }) {
  const locale = params?.locale || 'en';
  
  // Server-side translations
  const title = await serverT(locale, 'home.hero.title');
  const subtitle = await serverT(locale, 'home.hero.subtitle');
  
  return (
    <main>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      
      {/* Client components can still use hooks */}
      <InteractiveSection />
    </main>
  );
}
```

### Step 5: Update Language Switcher

**Old language switcher:**
```javascript
// ❌ Old way
import LanguageSelector from '@components/ui/language-selector';

<LanguageSelector />
```

**New language switcher:**
```javascript
// ✅ New way
import { LanguageSwitcher } from '@components/shared/enhanced-language-switcher';

// Multiple variants available
<LanguageSwitcher variant="default" showFlag={true} showName={true} />
<LanguageSwitcher variant="compact" /> // For headers
<LanguageSwitcher variant="minimal" /> // For footers
```

### Step 6: Update Form Validation

**Old validation:**
```javascript
// ❌ Old way
const { t } = useLanguage();
const errorMessage = t('common.validation.required');
```

**New validation:**
```javascript
// ✅ New way with specialized hooks
import { useFormTranslation } from '@lib/i18n/enhanced-client';

const { tValidation } = useFormTranslation();
const errorMessage = tValidation('required');

// With interpolation
const minLengthError = tValidation('min_length', {
  interpolation: { min: 8 }
});
```

### Step 7: Update Translation Keys

The new system uses more organized key structures:

**Key mapping:**
```javascript
// Old keys → New keys
'common.navigation.home' → 'nav.home'
'common.actions.save' → 'actions.save'
'common.validation.required' → 'validation.required'
'auth.login.title' → 'auth.login.title' // Same
'business.profile.title' → 'business.profile.title' // Same
```

## 🛠️ Migration Utilities

### Automatic Key Extraction
```javascript
import { scanCodebaseForKeys } from '@lib/i18n/translation-utils';

// Find all translation keys in your codebase
const extractedKeys = await scanCodebaseForKeys('src');
console.log(extractedKeys);
```

### Missing Key Detection
```javascript
import { findMissingKeys } from '@lib/i18n/translation-utils';

// Find keys that need translation
const missingKeys = findMissingKeys(extractedKeys, translations);
console.log(missingKeys);
```

### Translation Report
```javascript
import { generateTranslationReport } from '@lib/i18n/translation-utils';

// Generate comprehensive report
const report = await generateTranslationReport('src', translations);
console.log(report);
```

## 📝 Page-by-Page Migration

### Homepage Migration

**Before:**
```javascript
// src/app/page.js
import { generateHomeMetadata } from '@utils/server-seo';

export const generateMetadata = generateHomeMetadata;

export default function HomePage() {
  return <HomePageContent />;
}
```

**After:**
```javascript
// src/app/page.js (English default)
import { serverT, generateI18nMetadata } from '@lib/i18n/server';

export async function generateMetadata() {
  return await generateI18nMetadata('en', 'home');
}

export default async function HomePage() {
  const title = await serverT('en', 'home.hero.title');
  
  return (
    <main>
      <h1>{title}</h1>
      {/* Rest of component */}
    </main>
  );
}
```

```javascript
// src/app/[locale]/page.js (Localized pages)
import { serverT, generateI18nMetadata } from '@lib/i18n/server';

export async function generateMetadata({ params }) {
  const locale = params?.locale || 'en';
  return await generateI18nMetadata(locale, 'home');
}

export default async function LocalizedHomePage({ params }) {
  const locale = params?.locale || 'en';
  const title = await serverT(locale, 'home.hero.title');
  
  return (
    <main>
      <h1>{title}</h1>
      {/* Rest of component */}
    </main>
  );
}
```

### Business Pages Migration

**Before:**
```javascript
function BusinessProfile({ business }) {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('business.profile.title')}</h1>
      <p>{t('business.profile.description')}</p>
    </div>
  );
}
```

**After:**
```javascript
function BusinessProfile({ business }) {
  const { tProfile } = useBusinessTranslation(); // Specialized hook
  
  return (
    <div>
      <h1>{tProfile('title')}</h1> {/* Shorter key */}
      <p>{tProfile('description')}</p>
    </div>
  );
}
```

### Dashboard Migration

**Before:**
```javascript
function Dashboard() {
  const { t } = useLanguage();
  
  return (
    <nav>
      <Link href="/dashboard">{t('dashboard.navigation.overview')}</Link>
      <Link href="/dashboard/analytics">{t('dashboard.navigation.analytics')}</Link>
    </nav>
  );
}
```

**After:**
```javascript
function Dashboard() {
  const { tNav } = useDashboardTranslation(); // Specialized hook
  
  return (
    <nav>
      <Link href="/dashboard">{tNav('overview')}</Link> {/* Shorter keys */}
      <Link href="/dashboard/analytics">{tNav('analytics')}</Link>
    </nav>
  );
}
```

## 🧪 Testing Your Migration

### 1. Check Imports
```bash
# Search for old import patterns
grep -r "useLanguage" src/
grep -r "@context/language-context" src/
grep -r "@lib/i18n/dictionaries" src/
```

### 2. Validate Keys
```javascript
// Run key validation
import { validateTranslations } from '@lib/i18n/translation-utils';

const validation = validateTranslations(coreTranslations);
console.log(validation);
```

### 3. Test All Languages
Visit your site with different locale URLs:
- `/` (English)
- `/es` (Spanish) 
- `/fr` (French)
- `/de` (German)
- etc.

## 🐛 Common Issues & Solutions

### Issue: "useTranslation used outside TranslationProvider"
**Solution:** Make sure your component is wrapped in `TranslationProvider`

### Issue: Translation keys not found
**Solution:** Update key paths according to the new structure

### Issue: Server components not showing translations
**Solution:** Use `serverT` instead of client hooks in server components

### Issue: Language switching not working
**Solution:** Update to the new `LanguageSwitcher` component

## 📈 Performance Optimizations

### Bundle Size Reduction
- Tree-shaking eliminates unused translations
- Specialized hooks reduce bundle size
- Lazy loading for non-critical languages

### Server-Side Rendering
- Translations are resolved on the server
- No client-side loading delays
- SEO-friendly from the first render

### Caching
- React cache() for per-request deduplication
- Browser caching for static translations
- CDN-friendly with proper headers

## 🔍 Monitoring & Maintenance

### Translation Coverage
```javascript
// Monitor translation completeness
import { generateTranslationReport } from '@lib/i18n/translation-utils';

const report = await generateTranslationReport();
console.log('Translation coverage:', report.summary.completeness);
```

### Performance Monitoring
- Core Web Vitals impact
- Bundle size tracking
- Translation loading times

## 📚 Additional Resources

- [Translation Key Reference](./translation-keys.md)
- [Component Examples](../src/examples/i18n-homepage-example.js)
- [Server Translation Guide](./server-translations.md)
- [SEO Best Practices](./i18n-seo.md)

## 🆘 Need Help?

1. Check the [FAQ](./i18n-faq.md)
2. Review [example implementations](../src/examples/)
3. Run the translation utilities for debugging
4. Contact the development team

---

**Migration Checklist:**

- [ ] Update imports across all files
- [ ] Replace LanguageProvider with TranslationProvider
- [ ] Update client components to use new hooks
- [ ] Add server translations to server components
- [ ] Update language switcher components
- [ ] Test all 13 supported languages
- [ ] Validate translation keys
- [ ] Check SEO metadata generation
- [ ] Verify performance impact
- [ ] Update documentation
