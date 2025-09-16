import { NextRequest, NextResponse } from 'next/server';

interface HardwareStatus {
  printer: {
    connected: boolean;
    name?: string;
    status?: 'online' | 'offline' | 'error';
    lastActivity?: string;
  };
  scanner: {
    connected: boolean;
    name?: string;
    status?: 'online' | 'offline' | 'error';
    lastActivity?: string;
  };
  timestamp: string;
}

// Mock hardware status - in a real app this would check actual hardware
function generateMockHardwareStatus(): HardwareStatus {
  // Simulate realistic hardware connectivity patterns
  const printerConnected = Math.random() > 0.2; // 80% chance connected
  const scannerConnected = Math.random() > 0.3; // 70% chance connected
  
  return {
    printer: {
      connected: printerConnected,
      name: printerConnected ? 'HP LaserJet Pro M404n' : undefined,
      status: printerConnected ? 'online' : 'offline',
      lastActivity: printerConnected ? 
        new Date(Date.now() - Math.random() * 3600000).toISOString() : // Last hour
        undefined
    },
    scanner: {
      connected: scannerConnected,
      name: scannerConnected ? 'Epson WorkForce ES-400' : undefined,
      status: scannerConnected ? 'online' : 'offline',
      lastActivity: scannerConnected ? 
        new Date(Date.now() - Math.random() * 3600000).toISOString() : // Last hour
        undefined
    },
    timestamp: new Date().toISOString()
  };
}

export async function GET(request: NextRequest) {
  try {
    // Simulate hardware check delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const hardwareStatus = generateMockHardwareStatus();
    
    // Set cache headers - shorter cache for hardware status
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30' // 10s cache, 30s stale
    });
    
    return new NextResponse(JSON.stringify(hardwareStatus), {
      status: 200,
      headers
    });
    
  } catch (error) {
    console.error('Hardware status API error:', error);
    
    const errorResponse = {
      printer: {
        connected: false,
        status: 'error' as const
      },
      scanner: {
        connected: false,
        status: 'error' as const
      },
      timestamp: new Date().toISOString(),
      error: 'Failed to check hardware status'
    };
    
    return new NextResponse(JSON.stringify(errorResponse), {
      status: 200, // Return 200 but with error status in body
      headers: { 'Content-Type': 'application/json' }
    });
  }
}