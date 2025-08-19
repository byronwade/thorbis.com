# Dynamic Country Routing System

## Overview

The platform now supports dynamic country routing instead of hardcoded "us" references. This enables international scalability and proper localization for different countries.

## URL Structure

### Old Structure (Hardcoded)
```
/us/state/city/business-name
/us/state/city
```

### New Structure (Dynamic)
```
/[country]/[state]/[city]/[business-name]
/[country]/[state]/[city]
```

Where `[country]` is a valid ISO 3166-1 alpha-2 country code (e.g., `us`, `ca`, `uk`, `de`, `fr`).

## Implementation Details

### 1. Dynamic Routing

The new routing structure uses Next.js dynamic segments:

- `src/app/[country]/[state]/[city]/[business]/page.js` - Business and category pages
- `src/app/[country]/[state]/[city]/page.js` - City hub pages

### 2. URL Building Utilities

Updated utilities in `src/utils/index.js`:

```javascript
// New functions (require all parameters)
buildBusinessUrl({ country, state, city, name, shortId })
buildCityUrl({ country, state, city })
buildCityCategoryUrl({ country, state, city, category })

// Backward compatibility functions (with fallbacks)
buildBusinessUrlWithFallback({ country, state, city, name, shortId })
buildCityUrlWithFallback({ country, state, city })
buildCityCategoryUrlWithFallback({ country, state, city, category })
```

### 3. Country Validation

```javascript
validateCountry(country) // Returns boolean
getDefaultCountry() // Returns configured default (env var or 'us')
normalizeCountry(country) // Normalizes and validates country code
```

### 4. Environment Configuration

Set the default country via environment variable:

```bash
NEXT_PUBLIC_DEFAULT_COUNTRY=us
```

## Migration Guide

### For Developers

1. **Update URL Building Calls**
   ```javascript
   // Old (hardcoded)
   buildBusinessUrl({ state, city, name, shortId })
   
   // New (explicit country)
   buildBusinessUrl({ country: 'us', state, city, name, shortId })
   
   // Or use fallback function
   buildBusinessUrlWithFallback({ country: business.country, state, city, name, shortId })
   ```

2. **Update Page Components**
   ```javascript
   // Old
   const { state, city, business: slug } = await params;
   
   // New
   const { country, state, city, business: slug } = await params;
   ```

3. **Update Metadata Generation**
   ```javascript
   // Old
   const canonical = `https://thorbis.com/us/${state}/${city}/${slug}`;
   
   // New
   const canonical = `https://thorbis.com/${country}/${state}/${city}/${slug}`;
   ```

### For Database

Ensure all business records have a valid `country` field:

```sql
-- Update existing records if needed
UPDATE businesses SET country = 'US' WHERE country IS NULL OR country = '';

-- Add constraint for new records
ALTER TABLE businesses ADD CONSTRAINT valid_country 
CHECK (country IS NOT NULL AND country != '');
```

## Migration Complete

### 1. Old Directory Structure Removed

The old hardcoded `/us/` directory structure has been completely removed:

- ❌ `src/app/us/[state]/[city]/[business]/page.js` (removed)
- ❌ `src/app/us/[state]/[city]/page.js` (removed)
- ✅ `src/app/[country]/[state]/[city]/[business]/page.js` (new)
- ✅ `src/app/[country]/[state]/[city]/page.js` (new)

### 2. Fallback Functions

Use fallback functions for gradual migration of existing code:

```javascript
// These functions provide backward compatibility
buildBusinessUrlWithFallback({ country, state, city, name, shortId })
buildCityUrlWithFallback({ country, state, city })
buildCityCategoryUrlWithFallback({ country, state, city, category })
```

### 3. Default Country

If no country is specified, the system defaults to the configured default country (usually 'us').

## Supported Countries

The system supports ISO 3166-1 alpha-2 country codes including:

- **North America**: `us`, `ca`, `mx`
- **Europe**: `uk`, `de`, `fr`, `es`, `it`, `nl`, `be`, `ch`, `at`, `se`, `no`, `dk`, `fi`
- **Asia Pacific**: `au`, `nz`, `jp`, `kr`, `cn`, `in`
- **South America**: `br`, `ar`, `cl`, `co`, `pe`, `ve`, `uy`, `py`, `bo`, `ec`

## SEO Considerations

### 1. Canonical URLs

All pages now include country-specific canonical URLs:

```javascript
const canonical = `https://thorbis.com/${country}/${state}/${city}/${business}`;
```

### 2. Sitemap Generation

The sitemap now includes country-specific URLs for all businesses with valid location data.

### 3. Structured Data

Update structured data to include country information:

```javascript
addressCountry: business.country || "US"
```

## Performance Impact

### 1. URL Generation

- **Before**: Hardcoded country lookup
- **After**: Dynamic country validation and normalization
- **Impact**: Minimal performance impact with proper caching

### 2. Database Queries

- **Before**: No country filtering
- **After**: Optional country-based filtering for better performance
- **Impact**: Improved query performance with country-specific indexes

## Testing

### 1. URL Validation

Test URL generation with various country codes:

```javascript
// Valid countries
buildBusinessUrl({ country: 'us', state: 'CA', city: 'Los Angeles', name: 'Restaurant' })
buildBusinessUrl({ country: 'ca', state: 'ON', city: 'Toronto', name: 'Restaurant' })

// Invalid countries (should fallback to default)
buildBusinessUrlWithFallback({ country: 'invalid', state: 'CA', city: 'Los Angeles', name: 'Restaurant' })
```

### 2. Routing Tests

Test dynamic routing with different country codes:

- `/us/california/los-angeles/restaurant` ✅
- `/ca/ontario/toronto/restaurant` ✅
- `/uk/england/london/restaurant` ✅

### 3. New Routing Structure

Test dynamic country routing:

- `/us/california/los-angeles/restaurant` ✅
- `/ca/ontario/toronto/restaurant` ✅
- `/uk/england/london/restaurant` ✅

## Future Enhancements

### 1. Country-Specific Features

- Country-specific business categories
- Localized pricing and currencies
- Country-specific business hours and holidays

### 2. Multi-Country Support

- Cross-country business listings
- International business search
- Multi-language support per country

### 3. Advanced Localization

- Country-specific address formats
- Local business regulations and compliance
- Regional business practices

## Troubleshooting

### Common Issues

1. **Missing Country Parameter**
   ```javascript
   // Error: buildBusinessUrl: Missing required parameters
   // Solution: Ensure all required parameters are provided
   buildBusinessUrl({ country: 'us', state: 'CA', city: 'Los Angeles', name: 'Restaurant' })
   ```

2. **Invalid Country Code**
   ```javascript
   // Error: Invalid country code
   // Solution: Use validateCountry() to check before building URLs
   if (validateCountry(country)) {
     buildBusinessUrl({ country, state, city, name })
   }
   ```

3. **Dynamic Route Conflicts**
   ```javascript
   // Error: You cannot use different slug names for the same dynamic path
   // Solution: Ensure no conflicting dynamic routes at the same level
   // Example: [businessFormId] and [country] cannot coexist at root level
   ```

4. **Server Startup Issues**
   ```javascript
   // Issue: Next.js server fails to start with routing errors
   // Solution: Check for conflicting dynamic routes and remove unused ones
   // Run: find src/app -type d -name "*\[*\]*" to identify conflicts
   ```

### Debug Mode

Enable debug logging for URL generation:

```javascript
// Add to environment variables
NEXT_PUBLIC_DEBUG_URLS=true
```

This will log all URL generation attempts and validation results.

## Conclusion

The dynamic country routing system provides:

- ✅ **International Scalability**: Support for multiple countries
- ✅ **SEO Optimization**: Country-specific URLs and metadata
- ✅ **Backward Compatibility**: Seamless migration from hardcoded system
- ✅ **Performance**: Optimized routing and caching
- ✅ **Maintainability**: Clean, organized code structure

This system positions the platform for global expansion while maintaining existing functionality and SEO value.
