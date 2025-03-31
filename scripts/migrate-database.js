#!/usr/bin/env node
/**
 * Database Migration Script for GoalStake
 * 
 * This script manages database migrations across different environments.
 * It reads SQL files from the supabase/migrations directory and applies them in order.
 * 
 * Usage:
 *   node scripts/migrate-database.js [environment]
 * 
 * Environment:
 *   - dev (default)
 *   - staging
 *   - prod
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const { program } = require('commander');

// Setup command line arguments
program
  .name('migrate-database')
  .description('GoalStake database migration tool')
  .version('1.0.0')
  .argument('[environment]', 'Environment to run migrations on', 'dev')
  .option('-d, --dry-run', 'Show migrations that would be applied without applying them')
  .option('-f, --force', 'Force apply all migrations even if already applied')
  .option('-v, --verbose', 'Show detailed logs during migration')
  .parse(process.argv);

const options = program.opts();
const environment = program.args[0] || 'dev';

// Load environment variables
const envFile = `.env.${environment}`;
if (!fs.existsSync(envFile)) {
  console.error(`Error: Environment file ${envFile} not found.`);
  process.exit(1);
}

dotenv.config({ path: envFile });

// Required environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: Required environment variables NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  process.exit(1);
}

// Initialize Supabase client with service role key (has migration privileges)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Path to migrations
const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

/**
 * Get list of migration files sorted by version
 */
function getMigrationFiles() {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort((a, b) => {
      // Sort by the numeric prefix
      const versionA = a.split('_')[0];
      const versionB = b.split('_')[0];
      return versionA.localeCompare(versionB);
    });
  
  return files;
}

/**
 * Get migrations that have already been applied
 */
async function getAppliedMigrations() {
  try {
    const { data, error } = await supabase
      .from('schema_versions')
      .select('version')
      .eq('success', true);
    
    if (error) throw error;
    
    return data.map(row => row.version);
  } catch (error) {
    // If the schema_versions table doesn't exist yet, return empty array
    if (error.message.includes('relation "schema_versions" does not exist')) {
      return [];
    }
    
    throw error;
  }
}

/**
 * Apply a single migration
 */
async function applyMigration(fileName, migrationSql) {
  const version = fileName.split('_')[0];
  const description = fileName.split('_').slice(1).join('_').replace('.sql', '');
  
  console.log(`Applying migration: ${fileName}`);
  
  if (options.dryRun) {
    console.log('  [DRY RUN] Would execute SQL file');
    return true;
  }
  
  try {
    // Execute the SQL migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSql });
    
    if (error) throw error;
    
    // Record the successful migration
    // Note: If this is the initial migration that creates schema_versions table,
    // this will fail but the migration itself succeeded, so we'll catch and ignore
    try {
      await supabase.rpc('record_migration', { 
        p_version: version,
        p_description: description,
        p_applied_by: 'migration_script',
        p_success: true
      });
    } catch (recordError) {
      // Ignore errors if this is the initial migration
      if (!version.endsWith('00000000000000')) {
        console.warn(`Warning: Could not record migration in schema_versions: ${recordError.message}`);
      }
    }
    
    console.log(`  ✅ Successfully applied migration: ${fileName}`);
    return true;
  } catch (error) {
    console.error(`  ❌ Failed to apply migration ${fileName}: ${error.message}`);
    
    // Try to record the failed migration
    try {
      await supabase.rpc('record_migration', {
        p_version: version,
        p_description: description,
        p_applied_by: 'migration_script',
        p_success: false
      });
    } catch (recordError) {
      // Ignore record errors for failed migrations
    }
    
    return false;
  }
}

/**
 * Main migration function
 */
async function runMigrations() {
  console.log(`\n🚀 Running migrations on ${environment} environment\n`);
  
  try {
    // Get existing migrations
    let appliedMigrations = [];
    if (!options.force) {
      appliedMigrations = await getAppliedMigrations();
      if (options.verbose) {
        console.log('Already applied migrations:', appliedMigrations);
      }
    }
    
    // Get all migration files
    const migrationFiles = getMigrationFiles();
    if (options.verbose) {
      console.log('Found migration files:', migrationFiles);
    }
    
    // Apply migrations that haven't been applied yet
    let success = true;
    for (const fileName of migrationFiles) {
      const version = fileName.split('_')[0];
      
      // Skip if already applied, unless force option is used
      if (!options.force && appliedMigrations.includes(version)) {
        if (options.verbose) {
          console.log(`Skipping already applied migration: ${fileName}`);
        }
        continue;
      }
      
      // Read migration file
      const filePath = path.join(MIGRATIONS_DIR, fileName);
      const migrationSql = fs.readFileSync(filePath, 'utf8');
      
      // Apply the migration
      const migrationSuccess = await applyMigration(fileName, migrationSql);
      if (!migrationSuccess) {
        success = false;
        break;
      }
    }
    
    if (success) {
      console.log('\n✅ Migrations completed successfully');
    } else {
      console.log('\n❌ Migrations failed');
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n❌ Migration error: ${error.message}`);
    process.exit(1);
  }
}

// Run migrations
runMigrations(); 