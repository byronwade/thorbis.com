import { NextRequest, NextResponse } from 'next/server';
import { type UserInfo } from '@/types/charts';

// Mock user data - replace with actual authentication/database queries
const mockUsers: UserInfo[] = [
  {
    id: 'user_1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@elitehvac.com',
    role: 'owner',
    company: 'Elite HVAC Services',
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    id: 'user_2',
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@proplumbing.com',
    role: 'manager',
    company: 'ProPlumbing Solutions',
    lastLogin: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
  },
  {
    id: 'user_3',
    name: 'David Chen',
    email: 'david.chen@qualityelectric.com',
    role: 'supervisor',
    company: 'Quality Electric Co.',
    lastLogin: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 minutes ago
  }
];

async function getUserFromToken(token: string): Promise<UserInfo | null> {
  // In a real app, this would validate the JWT token and fetch user data
  // For demo purposes, return a random user
  await new Promise(resolve => setTimeout(resolve, 50));
  
  if (!token || token === 'null' || token === 'undefined') {
    return null;
  }
  
  // Return a random user for demo
  const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
  
  // Update last login
  return {
    ...randomUser,
    lastLogin: new Date().toISOString()
  };
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return new NextResponse(JSON.stringify({
        error: 'No authentication token provided'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const user = await getUserFromToken(token);
    
    if (!user) {
      return new NextResponse(JSON.stringify({
        error: 'Invalid or expired token'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Set cache headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'private, s-maxage=300' // 5 minutes cache for user data
    });
    
    return new NextResponse(JSON.stringify(user), {
      status: 200,
      headers
    });
    
  } catch (error) {
    console.error('User API error:', error);
    
    return new NextResponse(JSON.stringify({
      error: 'Failed to fetch user data'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}