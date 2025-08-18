/**
 * Example: How to Migrate Existing Pages to Use i18n
 * Shows before/after for updating hardcoded content
 */

// ❌ BEFORE: src/components/shared/site-alert.js (HARDCODED)
function OldSiteAlert() {
  return (
    <div className="bg-amber-400 text-black">
      <div className="text-center">
        <span className="font-medium">Work in progress:</span> 
        This website is being built by one person and will take a few years to complete. 
        Looking for an investor — email me at {email}.
      </div>
    </div>
  );
}

// ✅ AFTER: Updated with translations
import { useTranslation } from '@lib/i18n/enhanced-client';

function NewSiteAlert() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  
  useEffect(() => {
    const userPart = "bcw" + "1995";
    const domainPart = "gmail" + ".com";
    setEmail(`${userPart}\u0040${domainPart}`);
  }, []);

  return (
    <div className="bg-amber-400 text-black">
      <div className="text-center">
        <span className="font-medium">{t('site.alert.status')}:</span> 
        {t('site.alert.message')} 
        {t('site.alert.investor')} — {t('site.alert.email')} 
        {email && (
          <a href={`mailto:${email}`} className="underline hover:no-underline font-medium">
            {email}
          </a>
        )}
        .
      </div>
    </div>
  );
}

// ❌ BEFORE: src/components/layout/home/hero-section.js (HARDCODED)  
function OldHeroSection() {
  return (
    <div>
      <input 
        placeholder="Ask me anything about local businesses..." 
        className="w-full"
      />
      <div>Did you mean: <button>suggested term</button></div>
      <div>smart suggestions available</div>
    </div>
  );
}

// ✅ AFTER: Updated with specialized hooks
import { useTranslation } from '@lib/i18n/enhanced-client';

function NewHeroSection() {
  const { t } = useTranslation();
  const [queryCorrection, setQueryCorrection] = useState(null);
  
  return (
    <div>
      <input 
        placeholder={t('search.ai_placeholder', {
          fallback: 'Ask me anything about local businesses...'
        })}
        className="w-full"
      />
      {queryCorrection && (
        <div>
          {t('search.did_you_mean')}:{' '}
          <button onClick={() => handleCorrection(queryCorrection.suggested)}>
            {queryCorrection.suggested}
          </button>
        </div>
      )}
      <div>{t('search.suggestions_count', { 
        interpolation: { count: searchSuggestions.length } 
      })}</div>
    </div>
  );
}

// ❌ BEFORE: Dashboard components (HARDCODED)
function OldDashboardHeader() {
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/dashboard/analytics">Analytics</Link>
      <Link href="/dashboard/settings">Settings</Link>
      <button>Sign Out</button>
    </nav>
  );
}

// ✅ AFTER: Using specialized dashboard translations
import { useDashboardTranslation, useNavigationTranslation } from '@lib/i18n/enhanced-client';

function NewDashboardHeader() {
  const { tNav } = useDashboardTranslation();
  const { tNav: tMainNav } = useNavigationTranslation();
  
  return (
    <nav>
      <Link href="/dashboard">{tNav('overview')}</Link>
      <Link href="/dashboard/analytics">{tNav('analytics')}</Link>
      <Link href="/dashboard/settings">{tNav('settings')}</Link>
      <button>{tMainNav('logout')}</button>
    </nav>
  );
}

// ❌ BEFORE: Business profile (HARDCODED)
function OldBusinessProfile({ business }) {
  return (
    <div>
      <h1>{business.name}</h1>
      <div>
        <h2>Overview</h2>
        <h2>Reviews</h2>
        <h2>Photos</h2>
        <h2>Contact</h2>
      </div>
      <button>Write a Review</button>
      <button>Get Directions</button>
      <button>Call</button>
      <div>Open now</div>
      <div>Closed</div>
    </div>
  );
}

// ✅ AFTER: Using specialized business translations
import { useBusinessTranslation } from '@lib/i18n/enhanced-client';

function NewBusinessProfile({ business }) {
  const { tProfile } = useBusinessTranslation();
  
  return (
    <div>
      <h1>{business.name}</h1>
      <div>
        <h2>{tProfile('overview')}</h2>
        <h2>{tProfile('reviews')}</h2>
        <h2>{tProfile('photos')}</h2>
        <h2>{tProfile('contact')}</h2>
      </div>
      <button>{tProfile('write_review')}</button>
      <button>{tProfile('directions')}</button>
      <button>{tProfile('call')}</button>
      <div>{business.isOpen ? tProfile('open_now') : tProfile('closed_now')}</div>
    </div>
  );
}

// ❌ BEFORE: Form validation (HARDCODED)
function OldContactForm() {
  const [errors, setErrors] = useState({});
  
  const validateForm = (data) => {
    const newErrors = {};
    if (!data.email) {
      newErrors.email = "This field is required";
    }
    if (!data.email.includes('@')) {
      newErrors.email = "Please enter a valid email address";
    }
    return newErrors;
  };

  return (
    <form>
      <label>Email</label>
      <input type="email" placeholder="Email" />
      {errors.email && <span>{errors.email}</span>}
      <button>Submit</button>
    </form>
  );
}

// ✅ AFTER: Using form translations with validation
import { useFormTranslation } from '@lib/i18n/enhanced-client';

function NewContactForm() {
  const { t, tValidation } = useFormTranslation();
  const [errors, setErrors] = useState({});
  
  const validateForm = (data) => {
    const newErrors = {};
    if (!data.email) {
      newErrors.email = tValidation('required');
    }
    if (!data.email.includes('@')) {
      newErrors.email = tValidation('invalid_email');
    }
    return newErrors;
  };

  return (
    <form>
      <label>{t('email')}</label>
      <input type="email" placeholder={t('email')} />
      {errors.email && <span>{errors.email}</span>}
      <button>{t('actions.submit')}</button>
    </form>
  );
}

// Key Translation Updates Needed:

// 1. Add missing keys to enhanced-translations.js:
const additionalTranslations = {
  en: {
    site: {
      alert: {
        status: "Work in progress",
        message: "This website is being built by one person and will take a few years to complete",
        investor: "Looking for an investor",
        email: "email me at"
      }
    },
    search: {
      ai_placeholder: "Ask me anything about local businesses...",
      did_you_mean: "Did you mean",
      suggestions_count: "{count} smart suggestions available",
      query_correction: "Did you mean: {suggestion}?"
    }
  }
  // Add Spanish, French, German, etc. translations...
};

export default {
  OldSiteAlert,
  NewSiteAlert,
  OldHeroSection,
  NewHeroSection,
  OldDashboardHeader,
  NewDashboardHeader,
  OldBusinessProfile,
  NewBusinessProfile,
  OldContactForm,
  NewContactForm
};
