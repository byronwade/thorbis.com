-- Create system_updates table
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

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_system_updates_release_date ON system_updates(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_system_updates_type ON system_updates(type);
CREATE INDEX IF NOT EXISTS idx_system_updates_category ON system_updates(category);
CREATE INDEX IF NOT EXISTS idx_system_updates_target_audience ON system_updates USING GIN(target_audience);

-- Enable Row Level Security
ALTER TABLE system_updates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow all authenticated users to read system updates
CREATE POLICY "Allow authenticated users to read system updates" ON system_updates
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow only admins to create, update, delete system updates
CREATE POLICY "Allow admins to manage system updates" ON system_updates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Insert some sample data
INSERT INTO system_updates (type, title, description, release_date, version, badge_text, target_audience, category, impact_level) VALUES
('feature', 'Enhanced Job Application Tracking', 'New detailed tracking for job applications with status updates, email notifications, and progress indicators. Users can now track their application status in real-time with detailed feedback from employers.', '2024-01-25', 'v2.1.0', 'New', ARRAY['business', 'user'], 'Jobs', 'high'),
('improvement', 'Improved Review System', 'Enhanced review writing experience with better formatting options, rich text editor, and improved rating interface. Users can now add photos, use markdown formatting, and receive better guidance during the review process.', '2024-01-24', 'v2.0.8', 'Improved', ARRAY['business', 'user'], 'Reviews', 'medium'),
('fix', 'Profile Visibility Fixes', 'Fixed issues with profile visibility and contact information display. Resolved problems with profile photos not loading correctly and contact information being hidden in certain view modes.', '2024-01-23', 'v2.0.7', 'Fixed', ARRAY['business', 'user'], 'Profiles', 'low'),
('security', 'Enhanced Account Security', 'Improved authentication and data protection measures including two-factor authentication enhancements, session management improvements, and additional security validations.', '2024-01-22', 'v2.0.6', 'Security', ARRAY['business', 'user', 'admin'], 'Security', 'high'),
('feature', 'Advanced Analytics Dashboard', 'New comprehensive analytics dashboard with real-time metrics, customizable charts, and export capabilities. Business owners can now track performance, customer engagement, and revenue trends.', '2024-01-21', 'v2.0.5', 'New', ARRAY['business', 'admin'], 'Analytics', 'high'),
('improvement', 'Mobile App Performance', 'Significant performance improvements for mobile applications including faster loading times, reduced battery usage, and smoother navigation experience.', '2024-01-20', 'v2.0.4', 'Improved', ARRAY['business', 'user'], 'Performance', 'medium'),
('fix', 'Search Functionality Fixes', 'Fixed various issues with search functionality including incorrect results, slow performance, and missing filters. Search now works reliably across all categories.', '2024-01-19', 'v2.0.3', 'Fixed', ARRAY['business', 'user'], 'Search', 'medium'),
('feature', 'Business Certification System', 'New business certification system allowing businesses to verify their credentials, licenses, and professional qualifications. Customers can now easily identify verified businesses.', '2024-01-18', 'v2.0.2', 'New', ARRAY['business'], 'Business', 'high'),
('feature', 'Real-time Notifications', 'New real-time notification system with push notifications, email alerts, and in-app notifications. Users can customize their notification preferences.', '2024-01-17', 'v2.0.1', 'New', ARRAY['business', 'user'], 'Notifications', 'medium'),
('improvement', 'User Interface Enhancements', 'Improved user interface with better accessibility, responsive design improvements, and enhanced user experience across all devices.', '2024-01-16', 'v2.0.0', 'Improved', ARRAY['business', 'user'], 'UI/UX', 'medium');

-- Create trigger to update updated_at timestamp
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
