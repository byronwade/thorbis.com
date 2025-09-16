/**
 * Mock Authentication System for Local Development
 * This provides a working auth system while Supabase connection is being resolved
 */

// Mock user data
const MOCK_USERS = [
  {
    id: 'mock-user-1',
    email: 'bcw1995@gmail.com',
    password: 'Byronwade1995!', // In real system, this would be hashed
    first_name: 'Byron',
    last_name: 'Wade',
    role: 'admin',
    created_at: new Date().toISOString()
  }
];

// Mock session storage
let currentSession: unknown = null;

// Server-side session helper for middleware
export const getMockSessionFromCookie = (cookieValue: string): MockSession | null => {
  try {
    const session = JSON.parse(decodeURIComponent(cookieValue));
    
    // Check if session is still valid
    if (session.expires_at && session.expires_at > Date.now()) {
      return session;
    }
    
    return null;
  } catch (_error) {
    return null;
  }
};

export interface MockUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
}

export interface MockSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: MockUser;
}

// Mock authentication functions
export const mockAuth = {
  // Sign in with email and password
  signInWithPassword: async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
    
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return {
        data: null,
        error: { message: 'Invalid email or password' }
      };
    }

    const session: MockSession = {
      access_token: `mock-access-token-${Date.now()}',
      refresh_token: 'mock-refresh-token-${Date.now()}',
      expires_at: Date.now() + (60 * 60 * 1000), // 1 hour
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        created_at: user.created_at
      }
    };

    currentSession = session;
    
    // Store in localStorage and cookie for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('mock-session', JSON.stringify(session));
      
      // Set cookie for middleware detection
      document.cookie = 'mock-session=${JSON.stringify(session)}; path=/; max-age=${60 * 60 * 24}; samesite=lax';
    }

    return {
      data: { session, user: session.user },
      error: null
    };
  },

  // Sign up new user
  signUp: async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === email);
    if (existingUser) {
      return {
        data: null,
        error: { message: 'User with this email already exists' }
      };
    }

    // Create new user
    const newUser: MockUser = {
      id: 'mock-user-${Date.now()}',
      email,
      first_name: ',
      last_name: ',
      role: 'user',
      created_at: new Date().toISOString()
    };

    MOCK_USERS.push({ ...newUser, password });

    return {
      data: { user: newUser, session: null }, // Typically requires email confirmation
      error: null
    };
  },

  // Get current session
  getSession: async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Try to get session from localStorage first
    if (typeof window !== 'undefined' && !currentSession) {
      const stored = localStorage.getItem('mock-session');
      if (stored) {
        try {
          const session = JSON.parse(stored);
          // Check if session is still valid
          if (session.expires_at > Date.now()) {
            currentSession = session;
          } else {
            localStorage.removeItem('mock-session');
          }
        } catch (e) {
          localStorage.removeItem('mock-session');
        }
      }
    }

    return {
      data: { session: currentSession },
      error: null
    };
  },

  // Get current user
  getUser: async () => {
    const { data } = await mockAuth.getSession();
    return {
      data: { user: data.session?.user || null },
      error: null
    };
  },

  // Sign out
  signOut: async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    currentSession = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mock-session');
      
      // Clear cookie
      document.cookie = 'mock-session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    return {
      error: null
    };
  },

  // Auth state change listener (mock)
  onAuthStateChange: (callback: (event: string, session: unknown) => void) => {
    // In a real system, this would set up event listeners
    // For mock, we'll just return a simple unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            // Mock unsubscribe
          }
        }
      }
    };
  }
};

// Mock admin functions
export const mockAdminAuth = {
  createUser: async (userData: {
    email: string;
    password: string;
    email_confirm?: boolean;
    user_metadata?: any;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === userData.email);
    if (existingUser) {
      return {
        data: { user: existingUser },
        error: null // Return success if user already exists
      };
    }

    // Create new user
    const newUser = {
      id: 'mock-user-${Date.now()}',
      email: userData.email,
      password: userData.password,
      first_name: userData.user_metadata?.first_name || ',
      last_name: userData.user_metadata?.last_name || ',
      role: userData.user_metadata?.role || 'user',
      created_at: new Date().toISOString()
    };

    MOCK_USERS.push(newUser);

    return {
      data: { user: newUser },
      error: null
    };
  }
};

// Export mock client that matches Supabase interface
export const createMockSupabaseClient = () => ({
  auth: mockAuth,
  // Add other mock methods as needed
  from: (table: string) => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
  })
});