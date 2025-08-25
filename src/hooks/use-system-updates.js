import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch system updates
 * 
 * @param {Object} options - Hook options
 * @param {number} options.limit - Number of updates to fetch
 * @param {string} options.type - Filter by update type
 * @param {string} options.category - Filter by category
 * @param {string} options.audience - Filter by target audience
 * @param {boolean} options.enabled - Whether to enable the hook
 * @returns {Object} Hook state and data
 */
export function useSystemUpdates({
  limit = 10,
  type = null,
  category = null,
  audience = 'all',
  enabled = true
} = {}) {
  const [updates, setUpdates] = useState([]);
  const [currentVersion, setCurrentVersion] = useState('v2.1.0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchUpdates = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build query parameters
        const params = new URLSearchParams({
          limit: limit.toString()
        });

        if (type && type !== 'all') {
          params.append('type', type);
        }

        if (category && category !== 'All Categories') {
          params.append('category', category);
        }

        if (audience && audience !== 'all') {
          params.append('audience', audience);
        }

        const response = await fetch(`/api/v2/system-updates?${params}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setUpdates(result.data.updates);
          setCurrentVersion(result.data.currentVersion);
        } else {
          throw new Error(result.error || 'Failed to fetch updates');
        }
      } catch (err) {
        console.error('Error fetching system updates:', err);
        setError(err.message);
        
        // Fallback to mock data if API fails
        setUpdates(getMockUpdates());
        setCurrentVersion('v2.1.0');
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
  }, [limit, type, category, audience, enabled]);

  const refetch = () => {
    setError(null);
    fetchUpdates();
  };

  return {
    updates,
    currentVersion,
    loading,
    error,
    refetch
  };
}

/**
 * Mock updates data for fallback
 */
function getMockUpdates() {
  return [
    {
      id: 1,
      type: 'feature',
      title: 'Enhanced Dashboard Experience',
      description: 'New features and improvements to enhance your dashboard experience',
      date: '2024-01-25',
      version: 'v2.1.0',
      badge: 'New',
      badgeColor: 'bg-primary/10 text-primary',
      category: 'Dashboard',
      impact: 'high'
    },
    {
      id: 2,
      type: 'improvement',
      title: 'Performance Improvements',
      description: 'Faster loading times and improved responsiveness across the platform',
      date: '2024-01-24',
      version: 'v2.0.8',
      badge: 'Improved',
      badgeColor: 'bg-success/10 text-success',
      category: 'Performance',
      impact: 'medium'
    },
    {
      id: 3,
      type: 'fix',
      title: 'Bug Fixes and Stability',
      description: 'Various bug fixes and stability improvements for better user experience',
      date: '2024-01-23',
      version: 'v2.0.7',
      badge: 'Fixed',
      badgeColor: 'bg-destructive/10 text-destructive',
      category: 'General',
      impact: 'low'
    },
    {
      id: 4,
      type: 'security',
      title: 'Security Enhancements',
      description: 'Enhanced security measures and authentication improvements',
      date: '2024-01-22',
      version: 'v2.0.6',
      badge: 'Security',
      badgeColor: 'bg-purple-100 text-purple-800',
      category: 'Security',
      impact: 'high'
    }
  ];
}
