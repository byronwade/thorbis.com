import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Photo update schema
const PhotoUpdateSchema = z.object({
  title: z.string().max(255).optional(),
  description: z.string().optional(),
  category: z.enum([
    'before', 'after', 'progress', 'damage', 'repair', 'diagnostic',
    'parts', 'equipment', 'safety', 'completion', 'reference', 'other'
  ]).optional(),
  
  is_public: z.boolean().optional(),
  approval_status: z.enum(['pending', 'approved', 'rejected']).optional(),
  approval_notes: z.string().optional(),
  
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

// Helper function to verify photo access
async function verifyPhotoAccess(photoId: string, organizationId: string) {
  const { data: photo } = await supabase
    .from('hs.photos')
    .select('id')
    .eq('id', photoId)
    .eq('organization_id', organizationId)
    .single();
  
  return !!photo;
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

// GET /api/v1/hs/photos/[id] - Get specific photo
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const photoId = params.id;
    const { searchParams } = new URL(request.url);
    const includeActivity = searchParams.get('include_activity') === 'true';
    const trackView = searchParams.get('track_view') !== 'false'; // Default to true

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

    // Verify photo access
    if (!(await verifyPhotoAccess(photoId, organizationId))) {
      return NextResponse.json(
        { error: 'Photo not found or access denied' },
        { status: 404 }
      );
    }

    // Get photo details
    const { data: photo, error } = await supabase
      .from('hs.photos')
      .select('
        *,
        uploaded_by_user:uploaded_by(first_name, last_name, email),
        approved_by_user:approved_by(first_name, last_name),
        entity_work_order:entity_id(work_order_number, description, status),
        entity_customer:entity_id(first_name, last_name, company_name),
        entity_technician:entity_id(first_name, last_name),
        entity_vehicle:entity_id(vehicle_name, license_plate)
      ')
      .eq('id', photoId)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch photo' },
        { status: 500 }
      );
    }

    // Track view if requested
    if (trackView) {
      await supabase
        .from('hs.photos')
        .update({ view_count: (photo.view_count || 0) + 1 })
        .eq('id', photoId);

      await logPhotoActivity(
        photoId,
        'photo_viewed',
        'Photo viewed',
        { viewed_by: user.id },
        organizationId,
        user.id
      );
    }

    // Get activity history if requested
    let activityHistory = null;
    if (includeActivity) {
      const { data: activities } = await supabase
        .from('hs.photo_activity_log')
        .select('
          *,
          created_by_user:created_by(first_name, last_name)
        ')
        .eq('photo_id', photoId)
        .order('created_at', { ascending: false })
        .limit(50);

      activityHistory = activities || [];
    }

    // Generate signed URL for photo access
    const { data: signedUrl } = await supabase.storage
      .from('photos')
      .createSignedUrl(photo.storage_path, 3600); // 1 hour expiry

    const photoDetails = {
      ...photo,
      signed_url: signedUrl?.signedUrl,
      activity_history: activityHistory,
      view_count: (photo.view_count || 0) + (trackView ? 1 : 0),
    };

    return NextResponse.json({
      photo: photoDetails,
    });

  } catch (error) {
    console.error('GET /api/v1/hs/photos/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/hs/photos/[id] - Update photo
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const photoId = params.id;
    const body = await request.json();
    const updateData = PhotoUpdateSchema.parse(body);

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

    // Get current photo
    const { data: currentPhoto } = await supabase
      .from('hs.photos')
      .select('*')
      .eq('id', photoId)
      .eq('organization_id', organizationId)
      .single();

    if (!currentPhoto) {
      return NextResponse.json(
        { error: 'Photo not found or access denied' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateFields: unknown = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    // Handle approval status changes
    if (updateData.approval_status && updateData.approval_status !== currentPhoto.approval_status) {
      updateFields.approved_by = user.id;
      updateFields.approved_at = new Date().toISOString();
    }

    // Update photo
    const { data: photo, error } = await supabase
      .from('hs.photos')
      .update(updateFields)
      .eq('id', photoId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update photo' },
        { status: 500 }
      );
    }

    // Log changes
    const changes = [];
    for (const [key, value] of Object.entries(updateData)) {
      if (currentPhoto[key] !== value) {
        changes.push({
          field: key,
          old_value: currentPhoto[key],
          new_value: value,
        });
      }
    }

    if (changes.length > 0) {
      await logPhotoActivity(
        photoId,
        'photo_updated',
        'Photo metadata updated',
        { changes },
        organizationId,
        user.id
      );
    }

    return NextResponse.json({
      photo: photo,
      message: 'Photo updated successfully',
    });

  } catch (error) {
    console.error('PUT /api/v1/hs/photos/[id] error:', error);
    
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

// DELETE /api/v1/hs/photos/[id] - Delete photo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const photoId = params.id;
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

    // Get current photo
    const { data: currentPhoto } = await supabase
      .from('hs.photos')
      .select('*')
      .eq('id', photoId)
      .eq('organization_id', organizationId)
      .single();

    if (!currentPhoto) {
      return NextResponse.json(
        { error: 'Photo not found or access denied' },
        { status: 404 }
      );
    }

    if (permanent) {
      // Permanent deletion - remove file and all related records
      
      // Delete file from storage
      if (currentPhoto.storage_path) {
        await supabase.storage
          .from('photos')
          .remove([currentPhoto.storage_path]);
          
        // Delete thumbnails
        if (currentPhoto.thumbnail_urls) {
          const thumbnailPaths = Object.values(currentPhoto.thumbnail_urls as Record<string, string>)
            .map(url => url.replace('/storage/', ''));
          if (thumbnailPaths.length > 0) {
            await supabase.storage
              .from('photos')
              .remove(thumbnailPaths);
          }
        }
      }

      // Delete activity logs
      await supabase
        .from('hs.photo_activity_log')
        .delete()
        .eq('photo_id', photoId);

      // Delete photo record
      const { error } = await supabase
        .from('hs.photos')
        .delete()
        .eq('id', photoId)
        .eq('organization_id', organizationId);

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to delete photo' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Photo permanently deleted',
        photo_id: photoId,
      });

    } else {
      // Soft delete - mark as deleted
      const { data: photo, error } = await supabase
        .from('hs.photos')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: user.id,
        })
        .eq('id', photoId)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to delete photo' },
          { status: 500 }
        );
      }

      // Log deletion
      await logPhotoActivity(
        photoId,
        'photo_deleted',
        'Photo deleted (soft delete)',
        { deleted_by: user.id },
        organizationId,
        user.id
      );

      return NextResponse.json({
        message: 'Photo deleted successfully',
        photo: photo,
      });
    }

  } catch (error) {
    console.error('DELETE /api/v1/hs/photos/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}