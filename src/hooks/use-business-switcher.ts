import { useState, useEffect, useCallback } from 'react';

interface Business {
  id: string;
  name: string;
  industry: 'field_service' | 'restaurant' | 'retail' | 'general' | 'plumbing' | 'hvac' | 'electrical' | 'construction' | 'landscaping' | 'pest-control' | 'cleaning' | 'maintenance' | 'cafe' | 'bar' | 'food-truck' | 'catering' | 'bakery';
  location?: string;
  avatar?: string;
  isActive?: boolean;
  plan?: 'free' | 'pro' | 'enterprise';
}

export function useBusinessSwitcher() {
  // Mock data for demonstration - replace with actual API calls
  const mockBusinesses: Business[] = [
    {
      id: '1',
      name: 'Acme Field Services',
      industry: 'field_service',
      location: 'San Francisco, CA',
      avatar: '/placeholder-business.svg',
      isActive: true,
      plan: 'pro'
    },
    {
      id: '2',
      name: 'Bella Vista Restaurant',
      industry: 'restaurant',
      location: 'New York, NY',
      avatar: '/placeholder-restaurant.svg',
      isActive: false,
      plan: 'enterprise'
    },
    {
      id: '3',
      name: 'Tech Retail Store',
      industry: 'retail',
      location: 'Austin, TX',
      avatar: '/placeholder-retail.svg',
      isActive: false,
      plan: 'free'
    },
    {
      id: '4',
      name: 'Wade\'s Plumbing & Septic',
      industry: 'plumbing',
      location: 'Denver, CO',
      avatar: '/placeholder-business.svg',
      isActive: true,
      plan: 'pro'
    },
    {
      id: '5',
      name: 'Cool Breeze HVAC',
      industry: 'hvac',
      location: 'Phoenix, AZ',
      avatar: '/placeholder-business.svg',
      isActive: false,
      plan: 'enterprise'
    },
    {
      id: '6',
      name: 'Spark Electric Co',
      industry: 'electrical',
      location: 'Seattle, WA',
      avatar: '/placeholder-business.svg',
      isActive: true,
      plan: 'pro'
    },
    {
      id: '7',
      name: 'Pizza Palace',
      industry: 'restaurant',
      location: 'Chicago, IL',
      avatar: '/placeholder-restaurant.svg',
      isActive: true,
      plan: 'free'
    },
    {
      id: '8',
      name: 'Joe\'s Coffee Shop',
      industry: 'cafe',
      location: 'Portland, OR',
      avatar: '/placeholder-restaurant.svg',
      isActive: false,
      plan: 'pro'
    },
    {
      id: '9',
      name: 'Green Thumb Landscaping',
      industry: 'landscaping',
      location: 'Miami, FL',
      avatar: '/placeholder-business.svg',
      isActive: true,
      plan: 'enterprise'
    },
    {
      id: '10',
      name: 'Taco Truck Delights',
      industry: 'food-truck',
      location: 'Los Angeles, CA',
      avatar: '/placeholder-restaurant.svg',
      isActive: false,
      plan: 'free'
    }
  ];

  const [businesses, setBusinesses] = useState<Business[]>(mockBusinesses);
  
  // Initialize current business immediately
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(() => {
    if (typeof window !== 'undefined') {
      const currentBusinessId = localStorage.getItem('thorbis:currentBusiness') || '1';
      return mockBusinesses.find(b => b.id === currentBusinessId) || mockBusinesses[0];
    }
    return mockBusinesses[0];
  });

  // Update localStorage when current business changes
  useEffect(() => {
    if (currentBusiness && typeof window !== 'undefined') {
      localStorage.setItem('thorbis:currentBusiness', currentBusiness.id);
    }
  }, [currentBusiness]);

  // Switch to a different business
  const switchBusiness = useCallback((businessId: string) => {
    try {
      const business = businesses.find(b => b.id === businessId);
      if (!business) {
        throw new Error('Business not found');
      }

      // Update current business immediately
      setCurrentBusiness(business);
      
      // Persist to localStorage (handled by useEffect)
      
      // In a real app, you might want to:
      // 1. Update the URL
      // 2. Refresh user permissions
      // 3. Clear cached data
      // 4. Redirect to appropriate dashboard
      
    } catch (error) {
      console.error('Failed to switch business:', error);
    }
  }, [businesses]);

  // Add a new business
  const addBusiness = useCallback((business: Omit<Business, 'id'>) => {
    const newBusiness: Business = {
      ...business,
      id: Date.now().toString(), // In real app, this would come from API
    };
    
    setBusinesses(prev => [...prev, newBusiness]);
    return newBusiness;
  }, []);

  // Update business info
  const updateBusiness = useCallback((businessId: string, updates: Partial<Business>) => {
    setBusinesses(prev => 
      prev.map(business => 
        business.id === businessId 
          ? { ...business, ...updates }
          : business
      )
    );
    
    // Update current business if it's the one being updated
    if (currentBusiness?.id === businessId) {
      setCurrentBusiness(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [currentBusiness]);

  return {
    currentBusiness,
    businesses,
    switchBusiness,
    addBusiness,
    updateBusiness
  };
}
