import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Device update schema
const DeviceUpdateSchema = z.object({
  device_name: z.string().min(1).max(255).optional(),
  device_type: z.enum([
    'tablet', 'smartphone', 'laptop', 'desktop', 'truck_computer', 
    'diagnostic_tool', 'sensor', 'camera', 'gps_tracker', 'router',
    'payment_terminal', 'barcode_scanner', 'printer', 'scale', 'other'
  ]).optional(),
  manufacturer: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  serial_number: z.string().max(100).optional(),
  
  // Assignment and location
  assigned_to: z.enum(['technician', 'vehicle', 'location', 'inventory']).optional(),
  assigned_id: z.string().uuid().optional(),
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
  device_status: z.enum(['active', 'inactive', 'maintenance', 'retired', 'lost', 'damaged']).optional(),
  health_status: z.enum(['excellent', 'good', 'fair', 'poor', 'critical']).optional(),
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
  encryption_enabled: z.boolean().optional(),
  passcode_enabled: z.boolean().optional(),
  mdm_enrolled: z.boolean().optional(),
  compliance_status: z.enum(['compliant', 'non_compliant', 'unknown']).optional(),
  
  // Financial information
  purchase_price: z.number().min(0).optional(),
  depreciation_method: z.enum(['straight_line', 'declining_balance', 'none']).optional(),
  asset_tag: z.string().max(50).optional(),
  
  // Additional metadata
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  custom_fields: z.record(z.any()).optional(),
});

// Device checkin schema
const DeviceCheckinSchema = z.object({
  battery_level: z.number().min(0).max(100).optional(),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracy: z.number().min(0).optional(),
    timestamp: z.string().datetime(),
  }).optional(),
  network_info: z.object({
    ip_address: z.string().ip().optional(),
    network_name: z.string().max(100).optional(),
    signal_strength: z.number().min(-100).max(0).optional(),
    connection_type: z.enum(['wifi', 'cellular', 'ethernet', 'bluetooth']).optional(),
  }).optional(),
  system_info: z.object({
    os_version: z.string().max(50).optional(),
    storage_used_gb: z.number().min(0).optional(),
    memory_usage_percent: z.number().min(0).max(100).optional(),
    cpu_usage_percent: z.number().min(0).max(100).optional(),
    uptime_hours: z.number().min(0).optional(),
  }).optional(),
  app_status: z.array(z.object({
    name: z.string(),
    version: z.string(),
    status: z.enum(['running', 'stopped', 'crashed', 'not_installed']),
    last_updated: z.string().datetime(),
  })).optional(),
  errors: z.array(z.object({
    code: z.string(),
    message: z.string(),
    timestamp: z.string().datetime(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
  })).optional(),
  metadata: z.record(z.any()).optional(),
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

// Helper function to verify device access
async function verifyDeviceAccess(deviceId: string, organizationId: string) {
  const { data: device } = await supabase
    .from('hs.devices')
    .select('id')
    .eq('id', deviceId)
    .eq('organization_id', organizationId)
    .single();
  
  return !!device;
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

// Helper function to calculate device health
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
  
  // Security compliance
  if (!device.encryption_enabled) {
    score -= 15;
    issues.push('Encryption not enabled');
  }
  
  if (!device.passcode_enabled) {
    score -= 10;
    issues.push('Passcode not enabled');
  }
  
  return { score: Math.max(0, score), issues };
}

// GET /api/v1/hs/devices/[id] - Get specific device
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deviceId = params.id;
    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get('include_history') === 'true';
    const includeLocation = searchParams.get('include_location') === 'true';

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

    // Verify device access
    if (!(await verifyDeviceAccess(deviceId, organizationId))) {
      return NextResponse.json(
        { error: 'Device not found or access denied' },
        { status: 404 }
      );
    }

    // Get device details
    const { data: device, error } = await supabase
      .from('hs.devices')
      .select('
        *,
        assigned_technician:assigned_id(first_name, last_name, email),
        assigned_vehicle:assigned_id(vehicle_name, license_plate),
        created_by_user:created_by(first_name, last_name)
      ')
      .eq('id', deviceId)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch device' },
        { status: 500 }
      );
    }

    // Calculate device health
    const healthInfo = calculateDeviceHealth(device);

    // Get activity history if requested
    let activityHistory = null;
    if (includeHistory) {
      const { data: activities } = await supabase
        .from('hs.device_activity_log')
        .select('
          *,
          created_by_user:created_by(first_name, last_name)
        ')
        .eq('device_id', deviceId)
        .order('created_at', { ascending: false })
        .limit(50);

      activityHistory = activities || [];
    }

    // Get location history if requested
    let locationHistory = null;
    if (includeLocation) {
      const { data: locations } = await supabase
        .from('hs.device_locations')
        .select('*')
        .eq('device_id', deviceId)
        .order('recorded_at', { ascending: false })
        .limit(100);

      locationHistory = locations || [];
    }

    // Get recent checkin data
    const { data: recentCheckins } = await supabase
      .from('hs.device_checkins')
      .select('*')
      .eq('device_id', deviceId)
      .order('checkin_time', { ascending: false })
      .limit(10);

    const deviceDetails = {
      ...device,
      calculated_health: healthInfo,
      recent_checkins: recentCheckins || [],
      activity_history: activityHistory,
      location_history: locationHistory,
    };

    return NextResponse.json({
      device: deviceDetails,
    });

  } catch (error) {
    console.error('GET /api/v1/hs/devices/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/hs/devices/[id] - Update device
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deviceId = params.id;
    const body = await request.json();
    const updateData = DeviceUpdateSchema.parse(body);

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

    // Get current device
    const { data: currentDevice } = await supabase
      .from('hs.devices')
      .select('*')
      .eq('id', deviceId)
      .eq('organization_id', organizationId)
      .single();

    if (!currentDevice) {
      return NextResponse.json(
        { error: 'Device not found or access denied' },
        { status: 404 }
      );
    }

    // Validate assignment if changed
    if (updateData.assigned_id && updateData.assigned_to) {
      const isValidAssignment = await validateDeviceAssignment(
        updateData.assigned_to,
        updateData.assigned_id,
        organizationId
      );
      
      if (!isValidAssignment) {
        return NextResponse.json(
          { error: 'Invalid assignment: ${updateData.assigned_to} with ID ${updateData.assigned_id} not found' },
          { status: 400 }
        );
      }
    }

    // Check for duplicate serial number or MAC address
    if (updateData.serial_number && updateData.serial_number !== currentDevice.serial_number) {
      const { data: existingDevice } = await supabase
        .from('hs.devices')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('serial_number', updateData.serial_number)
        .neq('id', deviceId)
        .single();

      if (existingDevice) {
        return NextResponse.json(
          { error: 'Another device with this serial number already exists' },
          { status: 409 }
        );
      }
    }

    // Update device
    const { data: device, error } = await supabase
      .from('hs.devices')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', deviceId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update device' },
        { status: 500 }
      );
    }

    // Log changes
    const changes = [];
    for (const [key, value] of Object.entries(updateData)) {
      if (currentDevice[key] !== value) {
        changes.push({
          field: key,
          old_value: currentDevice[key],
          new_value: value,
        });
      }
    }

    if (changes.length > 0) {
      await logDeviceActivity(
        deviceId,
        'device_updated',
        'Device configuration updated',
        { changes },
        organizationId,
        user.id
      );
    }

    // Calculate updated health
    const healthInfo = calculateDeviceHealth(device);

    return NextResponse.json({
      device: {
        ...device,
        calculated_health: healthInfo,
      },
      message: 'Device updated successfully',
    });

  } catch (error) {
    console.error('PUT /api/v1/hs/devices/[id] error:', error);
    
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

// POST /api/v1/hs/devices/[id]/checkin - Device checkin endpoint
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deviceId = params.id;
    const body = await request.json();
    const checkinData = DeviceCheckinSchema.parse(body);

    // For device checkin, we may use device-specific authentication
    // For now, we'll require standard auth but this could be device token based
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

    // Verify device exists
    if (!(await verifyDeviceAccess(deviceId, organizationId))) {
      return NextResponse.json(
        { error: 'Device not found or access denied' },
        { status: 404 }
      );
    }

    // Record checkin
    const { data: checkin, error: checkinError } = await supabase
      .from('hs.device_checkins')
      .insert({
        device_id: deviceId,
        checkin_time: new Date().toISOString(),
        battery_level: checkinData.battery_level,
        location_data: checkinData.location,
        network_info: checkinData.network_info,
        system_info: checkinData.system_info,
        app_status: checkinData.app_status,
        errors: checkinData.errors,
        metadata: checkinData.metadata,
        organization_id: organizationId,
      })
      .select()
      .single();

    if (checkinError) {
      console.error('Checkin error:', checkinError);
      return NextResponse.json(
        { error: 'Failed to record checkin' },
        { status: 500 }
      );
    }

    // Update device last checkin and battery level
    const deviceUpdates: unknown = {
      last_checkin: new Date().toISOString(),
    };

    if (checkinData.battery_level !== undefined) {
      deviceUpdates.battery_level = checkinData.battery_level;
    }

    if (checkinData.network_info?.ip_address) {
      deviceUpdates.ip_address = checkinData.network_info.ip_address;
    }

    if (checkinData.network_info?.network_name) {
      deviceUpdates.network_name = checkinData.network_info.network_name;
    }

    if (checkinData.network_info?.connection_type) {
      deviceUpdates.connection_type = checkinData.network_info.connection_type;
    }

    if (checkinData.system_info?.os_version) {
      deviceUpdates.os_version = checkinData.system_info.os_version;
    }

    await supabase
      .from('hs.devices')
      .update(deviceUpdates)
      .eq('id', deviceId);

    // Store location data if provided
    if (checkinData.location) {
      await supabase
        .from('hs.device_locations')
        .insert({
          device_id: deviceId,
          latitude: checkinData.location.latitude,
          longitude: checkinData.location.longitude,
          accuracy: checkinData.location.accuracy,
          recorded_at: checkinData.location.timestamp,
          organization_id: organizationId,
        });
    }

    // Log checkin activity
    await logDeviceActivity(
      deviceId,
      'device_checkin',
      'Device checked in',
      {
        battery_level: checkinData.battery_level,
        has_location: !!checkinData.location,
        has_errors: !!(checkinData.errors && checkinData.errors.length > 0),
        error_count: checkinData.errors?.length || 0,
      },
      organizationId
    );

    return NextResponse.json({
      checkin_id: checkin.id,
      status: 'success',
      message: 'Device checkin recorded successfully',
      timestamp: checkin.checkin_time,
    });

  } catch (error) {
    console.error('POST /api/v1/hs/devices/[id]/checkin error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid checkin data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/hs/devices/[id] - Delete/retire device
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deviceId = params.id;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

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

    // Verify device access
    if (!(await verifyDeviceAccess(deviceId, organizationId))) {
      return NextResponse.json(
        { error: 'Device not found or access denied' },
        { status: 404 }
      );
    }

    if (permanent) {
      // Permanent deletion - remove all related records
      await supabase.from('hs.device_locations').delete().eq('device_id', deviceId);
      await supabase.from('hs.device_checkins').delete().eq('device_id', deviceId);
      await supabase.from('hs.device_activity_log').delete().eq('device_id', deviceId);
      
      const { error } = await supabase
        .from('hs.devices')
        .delete()
        .eq('id', deviceId)
        .eq('organization_id', organizationId);

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to delete device' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Device permanently deleted',
        device_id: deviceId,
      });

    } else {
      // Soft delete - mark as retired
      const { data: device, error } = await supabase
        .from('hs.devices')
        .update({
          device_status: 'retired',
          retired_at: new Date().toISOString(),
          retired_by: user.id,
        })
        .eq('id', deviceId)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to retire device' },
          { status: 500 }
        );
      }

      // Log retirement
      await logDeviceActivity(
        deviceId,
        'device_retired',
        'Device retired',
        { retired_by: user.id },
        organizationId,
        user.id
      );

      return NextResponse.json({
        message: 'Device retired successfully',
        device: device,
      });
    }

  } catch (error) {
    console.error('DELETE /api/v1/hs/devices/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}