import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Photo schemas
const PhotoUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  file_size: z.number().min(1).max(50 * 1024 * 1024), // 50MB max
  file_type: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/tiff']),
  
  // Association
  entity_type: z.enum(['work_order', 'customer', 'technician', 'vehicle', 'inventory', 'invoice', 'estimate']),
  entity_id: z.string().uuid(),
  
  // Photo metadata
  title: z.string().max(255).optional(),
  description: z.string().optional(),
  category: z.enum([
    'before', 'after', 'progress', 'damage', 'repair', 'diagnostic',
    'parts', 'equipment', 'safety', 'completion', 'reference', 'other'
  ]).default('other'),
  
  // Technical metadata
  gps_coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracy: z.number().min(0).optional(),
  }).optional(),
  
  taken_at: z.string().datetime().optional(),
  camera_make: z.string().max(100).optional(),
  camera_model: z.string().max(100).optional(),
  
  // Organization and privacy
  is_public: z.boolean().default(false),
  requires_approval: z.boolean().default(false),
  
  // Additional metadata
  tags: z.array(z.string()).optional(),
  annotations: z.array(z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    width: z.number().min(0).max(1),
    height: z.number().min(0).max(1),
    label: z.string().max(255),
    description: z.string().optional(),
  })).optional(),
});

const PhotoQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  search: z.string().optional(),
  
  // Filters
  entity_type: z.enum(['work_order', 'customer', 'technician', 'vehicle', 'inventory', 'invoice', 'estimate']).optional(),
  entity_id: z.string().uuid().optional(),
  category: z.enum([
    'before', 'after', 'progress', 'damage', 'repair', 'diagnostic',
    'parts', 'equipment', 'safety', 'completion', 'reference', 'other'
  ]).optional(),
  
  // Date filters
  taken_from: z.string().datetime().optional(),
  taken_to: z.string().datetime().optional(),
  uploaded_from: z.string().datetime().optional(),
  uploaded_to: z.string().datetime().optional(),
  
  // Status filters
  is_public: z.boolean().optional(),
  approval_status: z.enum(['pending', 'approved', 'rejected']).optional(),
  has_gps: z.boolean().optional(),
  has_annotations: z.boolean().optional(),
  
  // Technical filters
  file_type: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/tiff']).optional(),
  min_file_size: z.number().min(0).optional(),
  max_file_size: z.number().min(0).optional(),
  
  // Sorting
  sort: z.enum(['taken_at', 'uploaded_at', 'filename', 'file_size', 'title']).default('uploaded_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  
  // Include related data
  include_thumbnails: z.boolean().default(true),
  include_metadata: z.boolean().default(false),
  include_entity_details: z.boolean().default(false),
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

// Helper function to validate entity access
async function validateEntityAccess(entityType: string, entityId: string, organizationId: string) {
  const tableMap = {
    'work_order': 'hs.work_orders',
    'customer': 'hs.customers',
    'technician': 'hs.technicians',
    'vehicle': 'hs.vehicles',
    'inventory': 'hs.inventory_items',
    'invoice': 'hs.invoices',
    'estimate': 'hs.estimates',
  };
  
  const table = tableMap[entityType as keyof typeof tableMap];
  if (!table) return false;
  
  const { data } = await supabase
    .from(table)
    .select('id')
    .eq('id', entityId)
    .eq('organization_id', organizationId)
    .single();
  
  return !!data;
}

// Helper function to generate storage path
function generateStoragePath(organizationId: string, entityType: string, filename: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const randomId = Math.random().toString(36).substring(2, 15);
  const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';
  
  return '${organizationId}/photos/${entityType}/${timestamp}/${randomId}.${extension}';
}

// Helper function to generate thumbnail sizes
function getThumbnailSizes() {
  return [
    { name: 'small', width: 150, height: 150 },
    { name: 'medium', width: 300, height: 300 },
    { name: 'large', width: 600, height: 600 },
  ];
}

// Helper function to log photo activity
async function logPhotoActivity(
  photoId: string,
  activityType: string,
  description: string, metadata: unknown,
  organizationId: string,
  userId?: string
) {
  await supabase
    .from('hs.photo_activity_log')
    .insert({
      photo_id: photoId,
      activity_type: activityType,
      activity_description: description,
      metadata,
      organization_id: organizationId,
      created_by: userId,
    });
}

// GET /api/v1/hs/photos - List photos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = PhotoQuerySchema.parse(Object.fromEntries(searchParams));

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
      .from('hs.photos`)
      .select('
        id,
        filename,
        title,
        description,
        category,
        entity_type,
        entity_id,
        file_type,
        file_size,
        storage_path,
        thumbnail_urls,
        gps_coordinates,
        taken_at,
        camera_make,
        camera_model,
        is_public,
        approval_status,
        tags,
        annotations,
        view_count,
        created_at,
        uploaded_by,
        ${query.include_entity_details ? '
          work_order:entity_id(work_order_number, description),
          customer:entity_id(first_name, last_name, company_name),
          technician:entity_id(first_name, last_name)
        ' : '}
      ', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (query.entity_type) {
      supabaseQuery = supabaseQuery.eq('entity_type', query.entity_type);
    }
    
    if (query.entity_id) {
      supabaseQuery = supabaseQuery.eq('entity_id', query.entity_id);
    }
    
    if (query.category) {
      supabaseQuery = supabaseQuery.eq('category', query.category);
    }
    
    if (query.file_type) {
      supabaseQuery = supabaseQuery.eq('file_type', query.file_type);
    }
    
    if (query.is_public !== undefined) {
      supabaseQuery = supabaseQuery.eq('is_public', query.is_public);
    }
    
    if (query.approval_status) {
      supabaseQuery = supabaseQuery.eq('approval_status', query.approval_status);
    }
    
    if (query.has_gps !== undefined) {
      if (query.has_gps) {
        supabaseQuery = supabaseQuery.not('gps_coordinates', 'is', null);
      } else {
        supabaseQuery = supabaseQuery.is('gps_coordinates', null);
      }
    }
    
    if (query.has_annotations !== undefined) {
      if (query.has_annotations) {
        supabaseQuery = supabaseQuery.not('annotations', 'is', null);
      } else {
        supabaseQuery = supabaseQuery.is('annotations', null);
      }
    }

    // Date filters
    if (query.taken_from) {
      supabaseQuery = supabaseQuery.gte('taken_at', query.taken_from);
    }
    
    if (query.taken_to) {
      supabaseQuery = supabaseQuery.lte('taken_at', query.taken_to);
    }
    
    if (query.uploaded_from) {
      supabaseQuery = supabaseQuery.gte('created_at', query.uploaded_from);
    }
    
    if (query.uploaded_to) {
      supabaseQuery = supabaseQuery.lte('created_at', query.uploaded_to);
    }

    // File size filters
    if (query.min_file_size) {
      supabaseQuery = supabaseQuery.gte('file_size', query.min_file_size);
    }
    
    if (query.max_file_size) {
      supabaseQuery = supabaseQuery.lte('file_size', query.max_file_size);
    }

    // Apply search
    if (query.search) {
      supabaseQuery = supabaseQuery.or(
        'title.ilike.%${query.search}%,description.ilike.%${query.search}%,filename.ilike.%${query.search}%'
      );
    }

    // Apply sorting and pagination
    const offset = (query.page - 1) * query.limit;
    supabaseQuery = supabaseQuery
      .order(query.sort, { ascending: query.order === 'asc' })
      .range(offset, offset + query.limit - 1);

    const { data: photos, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch photos' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / query.limit);

    // Get photo statistics
    const { data: allPhotos } = await supabase
      .from('hs.photos')
      .select('entity_type, category, file_type, approval_status, is_public, file_size')
      .eq('organization_id', organizationId);

    const summary = {
      total_photos: count || 0,
      approved_photos: allPhotos?.filter(p => p.approval_status === 'approved').length || 0,
      pending_approval: allPhotos?.filter(p => p.approval_status === 'pending').length || 0,
      public_photos: allPhotos?.filter(p => p.is_public).length || 0,
      
      total_storage_bytes: allPhotos?.reduce((sum, p) => sum + (p.file_size || 0), 0) || 0,
      
      by_entity_type: allPhotos?.reduce((acc, photo) => {
        acc[photo.entity_type] = (acc[photo.entity_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      
      by_category: allPhotos?.reduce((acc, photo) => {
        acc[photo.category] = (acc[photo.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      
      by_file_type: allPhotos?.reduce((acc, photo) => {
        acc[photo.file_type] = (acc[photo.file_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
    };

    return NextResponse.json({
      photos: photos || [],
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
    console.error('GET /api/v1/hs/photos error:', error);
    
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

// POST /api/v1/hs/photos - Upload new photo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const photoData = PhotoUploadSchema.parse(body);

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

    // Validate entity access
    const hasEntityAccess = await validateEntityAccess(
      photoData.entity_type,
      photoData.entity_id,
      organizationId
    );

    if (!hasEntityAccess) {
      return NextResponse.json(
        { error: 'Invalid entity or access denied` },
        { status: 403 }
      );
    }

    // Generate storage path
    const storagePath = generateStoragePath(organizationId, photoData.entity_type, photoData.filename);

    // Generate thumbnail URLs (these would be created by a background process)
    const thumbnailSizes = getThumbnailSizes();
    const thumbnailUrls = thumbnailSizes.reduce((acc, size) => {
      const thumbPath = storagePath.replace(/\.[^.]+$/, `_${size.name}.jpg');
      acc[size.name] = '/storage/${thumbPath}';
      return acc;
    }, {} as Record<string, string>);

    // Determine approval status
    const approvalStatus = photoData.requires_approval ? 'pending' : 'approved';

    // Create photo record
    const { data: photo, error } = await supabase
      .from('hs.photos')
      .insert({
        filename: photoData.filename,
        title: photoData.title,
        description: photoData.description,
        category: photoData.category,
        entity_type: photoData.entity_type,
        entity_id: photoData.entity_id,
        file_type: photoData.file_type,
        file_size: photoData.file_size,
        storage_path: storagePath,
        thumbnail_urls: thumbnailUrls,
        gps_coordinates: photoData.gps_coordinates,
        taken_at: photoData.taken_at || new Date().toISOString(),
        camera_make: photoData.camera_make,
        camera_model: photoData.camera_model,
        is_public: photoData.is_public,
        approval_status: approvalStatus,
        tags: photoData.tags,
        annotations: photoData.annotations,
        organization_id: organizationId,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create photo record' },
        { status: 500 }
      );
    }

    // Log photo upload
    await logPhotoActivity(
      photo.id,
      'photo_uploaded',
      'Photo uploaded: ${photoData.filename}',
      {
        filename: photoData.filename,
        file_size: photoData.file_size,
        entity_type: photoData.entity_type,
        category: photoData.category,
        has_gps: !!photoData.gps_coordinates,
        has_annotations: !!(photoData.annotations && photoData.annotations.length > 0),
      },
      organizationId,
      user.id
    );

    // Generate signed upload URL for file storage
    const { data: uploadUrl, error: urlError } = await supabase.storage
      .from('photos')
      .createSignedUploadUrl(storagePath);

    if (urlError) {
      console.error('Storage URL error:', urlError);
      // Clean up photo record if storage URL creation failed
      await supabase.from('hs.photos').delete().eq('id', photo.id);
      return NextResponse.json(
        { error: 'Failed to generate upload URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      photo: {
        ...photo,
        upload_url: uploadUrl.signedUrl,
        thumbnail_urls: thumbnailUrls,
      },
      message: 'Photo record created successfully',
      next_steps: [
        'Upload file to the provided signed URL',
        approvalStatus === 'pending' ? 'Photo will require approval before being visible' : 'Photo is approved and visible',
        'Thumbnails will be generated automatically',
      ],
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/v1/hs/photos error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid photo data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}