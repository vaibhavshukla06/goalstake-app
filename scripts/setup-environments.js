#!/usr/bin/env node

/**
 * This script helps set up and validate the Supabase environments.
 * It can be used to check if all environments are properly configured.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

// Define environment files
const envFiles = [
  '.env.development',
  '.env.staging',
  '.env.production'
];

// Required environment variables
const requiredVars = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_API_URL'
];

// Check if all environment files exist and have required variables
function validateEnvironmentFiles() {
  console.log('Validating environment files...');
  
  let allValid = true;
  
  envFiles.forEach(envFile => {
    const filePath = path.resolve(process.cwd(), envFile);
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ ${envFile} does not exist`);
      allValid = false;
      return;
    }
    
    const envVars = dotenv.parse(fs.readFileSync(filePath));
    
    // Check for required variables
    requiredVars.forEach(requiredVar => {
      if (!envVars[requiredVar]) {
        console.error(`❌ ${envFile} is missing ${requiredVar}`);
        allValid = false;
      }
    });
    
    if (envVars['EXPO_PUBLIC_SUPABASE_URL'] && !envVars['EXPO_PUBLIC_SUPABASE_URL'].includes('supabase.co')) {
      console.warn(`⚠️ ${envFile}: EXPO_PUBLIC_SUPABASE_URL doesn't seem to be a valid Supabase URL`);
    }
    
    console.log(`✅ ${envFile} validated`);
  });
  
  return allValid;
}

// Function to check Supabase connectivity
function checkSupabaseConnectivity() {
  console.log('Checking Supabase connectivity...');
  
  envFiles.forEach(envFile => {
    const env = envFile.replace('.env.', '');
    console.log(`\nTesting ${env} environment:`);
    
    try {
      // Load environment variables
      const envVars = dotenv.parse(fs.readFileSync(path.resolve(process.cwd(), envFile)));
      
      // Create a simple test script
      const testScript = `
        const { createClient } = require('@supabase/supabase-js');
        
        async function testConnection() {
          const supabase = createClient(
            '${envVars.EXPO_PUBLIC_SUPABASE_URL}',
            '${envVars.EXPO_PUBLIC_SUPABASE_ANON_KEY}'
          );
          
          try {
            const { data, error } = await supabase.from('_migrations').select('*').limit(1);
            
            if (error) {
              console.error('Connection error:', error.message);
              return false;
            }
            
            console.log('Connection successful!');
            return true;
          } catch (err) {
            console.error('Unexpected error:', err.message);
            return false;
          }
        }
        
        testConnection().then(result => {
          process.exit(result ? 0 : 1);
        });
      `;
      
      // Write test script to temporary file
      const tempFile = path.resolve(process.cwd(), 'temp-test.js');
      fs.writeFileSync(tempFile, testScript);
      
      // Execute test script
      execSync(`node ${tempFile}`, { stdio: 'inherit' });
      
      // Clean up
      fs.unlinkSync(tempFile);
      
      console.log(`✅ ${env} Supabase connection verified`);
    } catch (error) {
      console.error(`❌ ${env} Supabase connection failed`);
    }
  });
}

// Main function
function main() {
  console.log('GoalStake Environment Setup\n');
  
  const envValid = validateEnvironmentFiles();
  
  if (!envValid) {
    console.error('\n❌ Environment validation failed. Please fix the issues above.');
    process.exit(1);
  }
  
  console.log('\n✅ All environment files validated successfully.');
  
  // Ask user if they want to check connectivity
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('\nDo you want to test Supabase connectivity for all environments? (y/n) ', answer => {
    readline.close();
    
    if (answer.toLowerCase() === 'y') {
      checkSupabaseConnectivity();
    } else {
      console.log('Skipping connectivity test.');
    }
    
    console.log('\n✅ Environment setup complete.');
  });
}

// Run the main function
main(); 