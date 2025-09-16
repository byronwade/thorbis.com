import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Device schemas
const DeviceSchema = z.object({
  device_name: z.string().min(1).max(255),
  device_type: z.enum([
    'tablet', 'smartphone', 'laptop', 'desktop', 'truck_computer', 
    'diagnostic_tool', 'sensor', 'camera', 'gps_tracker', 'router',
    'payment_terminal', 'barcode_scanner', 'printer', 'scale', 'other'
  ]),
  manufacturer: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  serial_number: z.string().max(100).optional(),
  
  // Assignment and location
  assigned_to: z.enum(['technician', 'vehicle', 'location', 'inventory']),
  assigned_id: z.string().uuid().optional(), // technician_id, vehicle_id, location_id
  location_description: z.string().max(255).optional(),
  
  // Network and connectivity
  mac_address: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/).optional(),
  ip_address: z.string().ip().optional(),
  network_name: z.string().max(100).optional(),
  connection_type: z.enum(['wifi', 'cellular', 'ethernet', 'bluetooth', 'offline']).optional(),
  
  // Device specifications
  operating_system: z.string().max(100).optional(),
  os_version: z.string().max(50).optional(),
  storage_capacity_gb: z.number().min(0).optional(),
  ram_gb: z.number().min(0).optional(),
  processor_info: z.string().max(200).optional(),
  screen_size: z.string().max(50).optional(),
  
  // Status and management
  device_status: z.enum(['active', 'inactive', 'maintenance', 'retired', 'lost', 'damaged']).default('active'),
  health_status: z.enum(['excellent', 'good', 'fair', 'poor', 'critical']).default('good'),
  battery_level: z.number().min(0).max(100).optional(),
  last_checkin: z.string().datetime().optional(),
  
  // Maintenance and warranty
  purchase_date: z.string().date().optional(),
  warranty_expiry: z.string().date().optional(),
  last_maintenance: z.string().date().optional(),
  next_maintenance: z.string().date().optional(),
  maintenance_notes: z.string().optional(),
  
  // Software and applications
  installed_apps: z.array(z.object({
    name: z.string(),
    version: z.string(),
    installed_date: z.string().date(),
    required: z.boolean().default(false),
  })).optional(),
  
  // Security and compliance
  encryption_enabled: z.boolean().default(false),
  passcode_enabled: z.boolean().default(false),
  mdm_enrolled: z.boolean().default(false), // Mobile Device Management
  compliance_status: z.enum(['compliant', 'non_compliant', 'unknown']).default('unknown'),
  
  // Financial information
  purchase_price: z.number().min(0).optional(),
  depreciation_method: z.enum(['straight_line', 'declining_balance', 'none']).default('straight_line'),
  asset_tag: z.string().max(50).optional(),
  
  // Additional metadata
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  custom_fields: z.record(z.any()).optional(),
});

const DeviceQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  search: z.string().optional(),
  
  // Filters
  device_type: z.string().optional(),
  device_status: z.enum(['active', 'inactive', 'maintenance', 'retired', 'lost', 'damaged']).optional(),
  health_status: z.enum(['excellent', 'good', 'fair', 'poor', 'critical']).optional(),
  assigned_to: z.enum(['technician', 'vehicle', 'location', 'inventory']).optional(),
  assigned_id: z.string().uuid().optional(),
  manufacturer: z.string().optional(),
  connection_type: z.enum(['wifi', 'cellular', 'ethernet', 'bluetooth', 'offline']).optional(),
  compliance_status: z.enum(['compliant', 'non_compliant', 'unknown']).optional(),
  
  // Date filters
  purchase_date_from: z.string().date().optional(),
  purchase_date_to: z.string().date().optional(),
  warranty_expiry_from: z.string().date().optional(),
  warranty_expiry_to: z.string().date().optional(),
  last_checkin_from: z.string().datetime().optional(),
  last_checkin_to: z.string().datetime().optional(),
  
  // Additional options
  include_offline: z.boolean().default(true),
  include_retired: z.boolean().default(false),
  show_detailed: z.boolean().default(false),
  
  // Sorting
  sort: z.enum(['device_name', 'device_type', 'device_status', 'health_status', 'last_checkin', 'purchase_date', 'created_at']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// Helper function to get user's organization
async function getUserOrganization(userId: string) {
  const { data: membership } = await supabase
    .from('user_mgmt.organization_memberships')
    .select('organization_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();
  
  return membership?.organization_id;
}

// Helper function to validate device assignment
async function validateDeviceAssignment(assignedTo: string, assignedId: string | undefined, organizationId: string) {
  if (!assignedId) return true; // Optional assignment
  
  switch (assignedTo) {
    case 'technician':
      const { data: technician } = await supabase
        .from('hs.technicians')
        .select('id')
        .eq('id', assignedId)
        .eq('organization_id', organizationId)
        .single();
      return !!technician;
      
    case 'vehicle':
      const { data: vehicle } = await supabase
        .from('hs.vehicles')
        .select('id')
        .eq('id', assignedId)
        .eq('organization_id', organizationId)
        .single();
      return !!vehicle;
      
    case 'location':
      const { data: location } = await supabase
        .from('hs.service_locations')
        .select('id')
        .eq('id', assignedId)
        .eq('organization_id', organizationId)
        .single();
      return !!location;
      
    default:
      return true;
  }
}

// Helper function to calculate device health score
function calculateDeviceHealth(device: unknown): { score: number; issues: string[] } {
  const score = 100;
  const issues: string[] = [];
  
  // Battery level check
  if (device.battery_level !== null) {
    if (device.battery_level < 20) {
      score -= 20;
      issues.push('Low battery level');
    } else if (device.battery_level < 50) {
      score -= 10;
      issues.push('Moderate battery level');
    }
  }
  
  // Last checkin check
  if (device.last_checkin) {
    const lastCheckin = new Date(device.last_checkin);
    const hoursSinceCheckin = (Date.now() - lastCheckin.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceCheckin > 24) {
      score -= 25;
      issues.push('Device offline for more than 24 hours');
    } else if (hoursSinceCheckin > 12) {
      score -= 15;
      issues.push('Device offline for more than 12 hours');
    }
  } else {
    score -= 30;
    issues.push('No checkin data available');
  }
  
  // Maintenance check
  if (device.next_maintenance) {
    const nextMaintenance = new Date(device.next_maintenance);
    const daysUntilMaintenance = (nextMaintenance.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    
    if (daysUntilMaintenance < 0) {
      score -= 20;
      issues.push('Maintenance overdue');
    } else if (daysUntilMaintenance < 7) {
      score -= 10;
      issues.push('Maintenance due soon');
    }
  }
  
  // Warranty check
  if (device.warranty_expiry) {
    const warrantyExpiry = new Date(device.warranty_expiry);
    const daysUntilExpiry = (warrantyExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    
    if (daysUntilExpiry < 0) {
      score -= 5;
      issues.push('Warranty expired');
    } else if (daysUntilExpiry < 30) {
      issues.push('Warranty expires soon');
    }
  }
  
  // Security compliance check
  if (!device.encryption_enabled) {
    score -= 15;
    issues.push('Encryption not enabled');
  }
  
  if (!device.passcode_enabled) {
    score -= 10;
    issues.push('Passcode not enabled');
  }
  
  if (!device.mdm_enrolled) {
    score -= 10;
    issues.push('Not enrolled in MDM');
  }
  
  return { score: Math.max(0, score), issues };
}

// Helper function to log device activity
async function logDeviceActivity(
  deviceId: string,
  activityType: string,
  description: string, metadata: unknown,
  organizationId: string,
  userId?: string
) {
  await supabase
    .from('hs.device_activity_log')
    .insert({
      device_id: deviceId,
      activity_type: activityType,
      activity_description: description,
      metadata,
      organization_id: organizationId,
      created_by: userId,
    });
}

// GET /api/v1/hs/devices - List devices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = DeviceQuerySchema.parse(Object.fromEntries(searchParams));

    // Get authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Get user's organization
    const organizationId = await getUserOrganization(user.id);
    if (!organizationId) {
      return NextResponse.json(
        { error: 'User not associated with any organization' },
        { status: 403 }
      );
    }

    // Build query
    let supabaseQuery = supabase
      .from('hs.devices')
      .select('
        *,
        assigned_technician:assigned_id(first_name, last_name),
        assigned_vehicle:assigned_id(vehicle_name, license_plate)
      ', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (query.device_type) {
      supabaseQuery = supabaseQuery.eq('device_type', query.device_type);
    }
    
    if (query.device_status) {
      supabaseQuery = supabaseQuery.eq('device_status', query.device_status);
    }
    
    if (query.health_status) {
      supabaseQuery = supabaseQuery.eq('health_status', query.health_status);
    }
    
    if (query.assigned_to) {
      supabaseQuery = supabaseQuery.eq('assigned_to', query.assigned_to);
    }
    
    if (query.assigned_id) {
      supabaseQuery = supabaseQuery.eq('assigned_id', query.assigned_id);
    }
    
    if (query.manufacturer) {
      supabaseQuery = supabaseQuery.ilike('manufacturer', '%${query.manufacturer}%');
    }
    
    if (query.connection_type) {
      supabaseQuery = supabaseQuery.eq('connection_type', query.connection_type);
    }
    
    if (query.compliance_status) {
      supabaseQuery = supabaseQuery.eq('compliance_status', query.compliance_status);
    }

    // Date filters
    if (query.purchase_date_from) {
      supabaseQuery = supabaseQuery.gte('purchase_date', query.purchase_date_from);
    }
    
    if (query.purchase_date_to) {
      supabaseQuery = supabaseQuery.lte('purchase_date', query.purchase_date_to);
    }
    
    if (query.warranty_expiry_from) {
      supabaseQuery = supabaseQuery.gte('warranty_expiry', query.warranty_expiry_from);
    }
    
    if (query.warranty_expiry_to) {
      supabaseQuery = supabaseQuery.lte('warranty_expiry', query.warranty_expiry_to);
    }
    
    if (query.last_checkin_from) {
      supabaseQuery = supabaseQuery.gte('last_checkin', query.last_checkin_from);
    }
    
    if (query.last_checkin_to) {
      supabaseQuery = supabaseQuery.lte('last_checkin', query.last_checkin_to);
    }

    // Exclude conditions
    if (!query.include_retired) {
      supabaseQuery = supabaseQuery.neq('device_status', 'retired');
    }

    // Apply search
    if (query.search) {
      supabaseQuery = supabaseQuery.or(
        'device_name.ilike.%${query.search}%,manufacturer.ilike.%${query.search}%,model.ilike.%${query.search}%,serial_number.ilike.%${query.search}%,asset_tag.ilike.%${query.search}%'
      );
    }

    // Apply sorting and pagination
    const offset = (query.page - 1) * query.limit;
    supabaseQuery = supabaseQuery
      .order(query.sort, { ascending: query.order === 'asc' })
      .range(offset, offset + query.limit - 1);

    const { data: devices, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch devices' },
        { status: 500 }
      );
    }

    // Calculate health scores if detailed view requested
    const devicesWithHealth = query.show_detailed ? 
      devices?.map(device => {
        const healthInfo = calculateDeviceHealth(device);
        return {
          ...device,
          calculated_health: healthInfo,
        };
      }) : devices;

    const totalPages = Math.ceil((count || 0) / query.limit);

    // Get device statistics
    const { data: allDevices } = await supabase
      .from('hs.devices')
      .select('device_type, device_status, health_status, connection_type, compliance_status, last_checkin')
      .eq('organization_id', organizationId);

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const summary = {
      total_devices: count || 0,
      active_devices: allDevices?.filter(d => d.device_status === 'active').length || 0,
      online_devices: allDevices?.filter(d => 
        d.last_checkin && new Date(d.last_checkin) > oneDayAgo
      ).length || 0,
      devices_needing_attention: allDevices?.filter(d => 
        d.health_status === 'poor' || d.health_status === 'critical'
      ).length || 0,
      
      by_type: allDevices?.reduce((acc, device) => {
        acc[device.device_type] = (acc[device.device_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      
      by_status: allDevices?.reduce((acc, device) => {
        acc[device.device_status] = (acc[device.device_status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      
      by_health: allDevices?.reduce((acc, device) => {
        acc[device.health_status] = (acc[device.health_status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      
      by_compliance: allDevices?.reduce((acc, device) => {
        acc[device.compliance_status] = (acc[device.compliance_status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
    };

    return NextResponse.json({
      devices: devicesWithHealth || [],
      summary,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count || 0,
        totalPages,
        hasMore: query.page < totalPages,
      },
    });

  } catch (error) {
    console.error('GET /api/v1/hs/devices error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/hs/devices - Create new device
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const deviceData = DeviceSchema.parse(body);

    // Get authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Get user's organization
    const organizationId = await getUserOrganization(user.id);
    if (!organizationId) {
      return NextResponse.json(
        { error: 'User not associated with any organization' },
        { status: 403 }
      );
    }

    // Validate device assignment
    if (deviceData.assigned_id) {
      const isValidAssignment = await validateDeviceAssignment(
        deviceData.assigned_to, 
        deviceData.assigned_id, 
        organizationId
      );
      
      if (!isValidAssignment) {
        return NextResponse.json(
          { error: 'Invalid assignment: ${deviceData.assigned_to} with ID ${deviceData.assigned_id} not found' },
          { status: 400 }
        );
      }
    }

    // Check for duplicate serial number or MAC address
    if (deviceData.serial_number) {
      const { data: existingDevice } = await supabase
        .from('hs.devices')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('serial_number', deviceData.serial_number)
        .single();

      if (existingDevice) {
        return NextResponse.json(
          { error: 'Device with this serial number already exists' },
          { status: 409 }
        );
      }
    }

    if (deviceData.mac_address) {
      const { data: existingDevice } = await supabase
        .from('hs.devices')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('mac_address', deviceData.mac_address)
        .single();

      if (existingDevice) {
        return NextResponse.json(
          { error: 'Device with this MAC address already exists' },
          { status: 409 }
        );
      }
    }

    // Create device
    const { data: device, error } = await supabase
      .from('hs.devices')
      .insert({
        ...deviceData,
        organization_id: organizationId,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create device' },
        { status: 500 }
      );
    }

    // Log device creation
    await logDeviceActivity(
      device.id,
      'device_created',
      'Device created: ${device.device_name}',
      {
        device_type: device.device_type,
        manufacturer: device.manufacturer,
        model: device.model,
        assigned_to: device.assigned_to,
      },
      organizationId,
      user.id
    );

    // Calculate initial health score
    const healthInfo = calculateDeviceHealth(device);

    return NextResponse.json(
      { 
        device: {
          ...device,
          calculated_health: healthInfo,
        },
        message: 'Device created successfully',
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/v1/hs/devices error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid device data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}