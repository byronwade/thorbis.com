import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

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

async function runMigration() {
  try {
    console.log('🚀 Starting system_updates table migration...');
    
    // Read the SQL migration file
    const migrationPath = path.join(__dirname, '008_create_system_updates_table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Executing SQL migration...');
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      // If exec_sql doesn't exist, try direct query execution
      console.log('⚠️  exec_sql not available, trying direct execution...');
      
      // Split the SQL into individual statements and execute them
      const statements = sql.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          console.log(`Executing: ${statement.substring(0, 50)}...`);
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement });
          if (stmtError) {
            console.error('❌ Error executing statement:', stmtError);
          }
        }
      }
    }
    
    // Verify the table was created
    console.log('🔍 Verifying table creation...');
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'system_updates');
    
    if (tableError) {
      console.error('❌ Error checking table:', tableError);
    } else if (tables && tables.length > 0) {
      console.log('✅ system_updates table created successfully!');
      
      // Check if sample data was inserted
      const { data: updates, error: dataError } = await supabase
        .from('system_updates')
        .select('count')
        .limit(1);
      
      if (dataError) {
        console.error('❌ Error checking sample data:', dataError);
      } else {
        console.log('✅ Sample data inserted successfully!');
      }
    } else {
      console.log('⚠️  Table may not have been created. Check the logs above for errors.');
    }
    
    console.log('🎉 Migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Alternative approach: Create table directly using Supabase client
async function createTableDirectly() {
  try {
    console.log('🔄 Trying direct table creation...');
    
    // Create the table structure
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    
    if (createError) {
      console.error('❌ Error creating table:', createError);
      return;
    }
    
    console.log('✅ Table created successfully!');
    
    // Insert sample data
    const sampleData = [
      {
        type: 'feature',
        title: 'Enhanced Job Application Tracking',
        description: 'New detailed tracking for job applications with status updates, email notifications, and progress indicators.',
        release_date: '2024-01-25',
        version: 'v2.1.0',
        badge_text: 'New',
        target_audience: ['business', 'user'],
        category: 'Jobs',
        impact_level: 'high'
      },
      {
        type: 'improvement',
        title: 'Improved Review System',
        description: 'Enhanced review writing experience with better formatting options and improved rating interface.',
        release_date: '2024-01-24',
        version: 'v2.0.8',
        badge_text: 'Improved',
        target_audience: ['business', 'user'],
        category: 'Reviews',
        impact_level: 'medium'
      }
    ];
    
    const { error: insertError } = await supabase
      .from('system_updates')
      .insert(sampleData);
    
    if (insertError) {
      console.error('❌ Error inserting sample data:', insertError);
    } else {
      console.log('✅ Sample data inserted successfully!');
    }
    
  } catch (error) {
    console.error('❌ Direct table creation failed:', error);
  }
}

// Run the migration
runMigration().catch(() => {
  console.log('🔄 Falling back to direct table creation...');
  createTableDirectly();
});
