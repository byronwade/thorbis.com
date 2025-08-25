import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createSystemUpdatesTable() {
  try {
    console.log('🚀 Creating system_updates table...');
    
    // First, let's check if the table already exists
    const { data: existingTable, error: checkError } = await supabase
      .from('system_updates')
      .select('id')
      .limit(1);
    
    if (existingTable !== null) {
      console.log('✅ system_updates table already exists!');
      
      // Check if it has data
      const { data: count, error: countError } = await supabase
        .from('system_updates')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('❌ Error checking table data:', countError);
      } else {
        console.log(`📊 Table has ${count} records`);
      }
      return;
    }
    
    console.log('📝 Table does not exist, creating it...');
    
    // Since we can't create tables directly via the client, let's try to insert data
    // and see if the table gets created automatically or if we get a specific error
    const sampleData = {
      type: 'feature',
      title: 'Enhanced Job Application Tracking',
      description: 'New detailed tracking for job applications with status updates, email notifications, and progress indicators.',
      release_date: '2024-01-25',
      version: 'v2.1.0',
      badge_text: 'New',
      target_audience: ['business', 'user'],
      category: 'Jobs',
      impact_level: 'high'
    };
    
    const { error: insertError } = await supabase
      .from('system_updates')
      .insert(sampleData);
    
    if (insertError) {
      console.error('❌ Error inserting data (table may not exist):', insertError);
      console.log('💡 You may need to create the table manually in the Supabase dashboard.');
      console.log('📋 Here is the SQL to run:');
      console.log(`
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
      `);
    } else {
      console.log('✅ Table created and sample data inserted successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the function
createSystemUpdatesTable();
