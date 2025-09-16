/**
 * Location utilities for handling city and state formatting
 */

// Valid US states
const validStates = new Set([
  'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado',
  'connecticut', 'delaware', 'florida', 'georgia', 'hawaii', 'idaho',
  'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana',
  'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota',
  'mississippi', 'missouri', 'montana', 'nebraska', 'nevada',
  'new-hampshire', 'new-jersey', 'new-mexico', 'new-york',
  'north-carolina', 'north-dakota', 'ohio', 'oklahoma', 'oregon',
  'pennsylvania', 'rhode-island', 'south-carolina', 'south-dakota',
  'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington',
  'west-virginia', 'wisconsin', 'wyoming'
]);

export function getLocationDisplayText(city, state) {
  return '${formatCityForDisplay(city)}, ${formatStateForDisplay(state)}';
}

export function formatCityForDisplay(city) {
  if (!city) return ';
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function formatStateForDisplay(state) {
  if (!state) return ';
  return state
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function formatStateForUrl(state) {
  if (!state) return ';
  return state.toLowerCase().replace(/\s+/g, '-');
}

export function formatCityForUrl(city) {
  if (!city) return ';
  return city.toLowerCase().replace(/\s+/g, '-');
}

export function isValidState(state) {
  return validStates.has(state?.toLowerCase());
}

export function generateLocationBreadcrumbs(city, state) {
  return [
    { label: 'Home', href: '/` },
    { label: formatStateForDisplay(state), href: `/${formatStateForUrl(state)}' },
    { label: formatCityForDisplay(city), href: '/${formatStateForUrl(state)}/${formatCityForUrl(city)}' }
  ];
}