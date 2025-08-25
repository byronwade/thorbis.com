# System Updates Table Setup

This document provides instructions for setting up the `system_updates` table in your Supabase database.

## Overview

The system updates feature requires a `system_updates` table in your Supabase database to store update information. Currently, the API falls back to mock data if the table doesn't exist.

## Database Schema

The `system_updates` table should have the following structure:

```sql
CREATE TABLE IF NOT EXISTS system_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL CHECK (type IN ('feature', 'improvement', 'fix', 'security')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  release_date DATE NOT NULL DEFAULT CURRENT_DATE,
  version VARCHAR(50) NOT NULL,
  badge_text VARCHAR(50),
  target_audience TEXT[] NOT NULL DEFAULT ARRAY['all'],
  category VARCHAR(100) NOT NULL,
  impact_level VARCHAR(20) NOT NULL CHECK (impact_level IN ('high', 'medium', 'low')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Setup Instructions

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor**
3. Run the following SQL commands:

```sql
-- Create the system_updates table
CREATE TABLE IF NOT EXISTS system_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL CHECK (type IN ('feature', 'improvement', 'fix', 'security')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  release_date DATE NOT NULL DEFAULT CURRENT_DATE,
  version VARCHAR(50) NOT NULL,
  badge_text VARCHAR(50),
  target_audience TEXT[] NOT NULL DEFAULT ARRAY['all'],
  category VARCHAR(100) NOT NULL,
  impact_level VARCHAR(20) NOT NULL CHECK (impact_level IN ('high', 'medium', 'low')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_system_updates_release_date ON system_updates(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_system_updates_type ON system_updates(type);
CREATE INDEX IF NOT EXISTS idx_system_updates_category ON system_updates(category);
CREATE INDEX IF NOT EXISTS idx_system_updates_target_audience ON system_updates USING GIN(target_audience);

-- Enable Row Level Security
ALTER TABLE system_updates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to read system updates" ON system_updates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to manage system updates" ON system_updates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Insert sample data
INSERT INTO system_updates (type, title, description, release_date, version, badge_text, target_audience, category, impact_level) VALUES
('feature', 'Enhanced Job Application Tracking', 'New detailed tracking for job applications with status updates, email notifications, and progress indicators.', '2024-01-25', 'v2.1.0', 'New', ARRAY['business', 'user'], 'Jobs', 'high'),
('improvement', 'Improved Review System', 'Enhanced review writing experience with better formatting options and improved rating interface.', '2024-01-24', 'v2.0.8', 'Improved', ARRAY['business', 'user'], 'Reviews', 'medium'),
('fix', 'Profile Visibility Fixes', 'Fixed issues with profile visibility and contact information display.', '2024-01-23', 'v2.0.7', 'Fixed', ARRAY['business', 'user'], 'Profiles', 'low'),
('security', 'Enhanced Account Security', 'Improved authentication and data protection measures.', '2024-01-22', 'v2.0.6', 'Security', ARRAY['business', 'user', 'admin'], 'Security', 'high'),
('feature', 'Advanced Analytics Dashboard', 'New comprehensive analytics dashboard with real-time metrics.', '2024-01-21', 'v2.0.5', 'New', ARRAY['business', 'admin'], 'Analytics', 'high');

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_system_updates_updated_at 
    BEFORE UPDATE ON system_updates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### Option 2: Using Migration Script

If you have access to run SQL migrations programmatically, you can use the migration script:

```bash
cd scripts/database
node run-system-updates-migration.js
```

## Table Structure Details

### Columns

- **id**: Unique identifier (UUID)
- **type**: Update type - 'feature', 'improvement', 'fix', or 'security'
- **title**: Update title
- **description**: Detailed description of the update
- **release_date**: Date when the update was released
- **version**: Version number (e.g., 'v2.1.0')
- **badge_text**: Text to display on the badge (e.g., 'New', 'Fixed')
- **target_audience**: Array of target audiences ('business', 'user', 'admin', 'academy', 'all')
- **category**: Update category (e.g., 'Jobs', 'Security', 'UI/UX')
- **impact_level**: Impact level - 'high', 'medium', or 'low'
- **created_at**: Timestamp when the record was created
- **updated_at**: Timestamp when the record was last updated

### Target Audiences

- **business**: Business dashboard users
- **user**: User dashboard users
- **admin**: Admin dashboard users
- **academy**: Academy dashboard users
- **all**: All users

## API Endpoints

Once the table is set up, the following API endpoints will work:

- `GET /api/v2/system-updates` - Fetch system updates
- `POST /api/v2/system-updates` - Create new system update (admin only)

### Query Parameters

- `limit`: Number of updates to return (default: 10)
- `type`: Filter by update type
- `category`: Filter by category
- `audience`: Filter by target audience

## Current Status

The system is currently using mock data as a fallback when the table doesn't exist. Once you create the table, the API will automatically switch to using real data from the database.

## Troubleshooting

If you encounter issues:

1. Check that the table was created successfully in the Supabase dashboard
2. Verify that RLS policies are set up correctly
3. Ensure your environment variables are configured properly
4. Check the browser console for any error messages

## Next Steps

After setting up the table:

1. The updates dropdown in the dashboard sub-header will show real data
2. The updates pages will display actual system updates
3. Admins can create new updates via the API
4. Users can filter and search through updates
