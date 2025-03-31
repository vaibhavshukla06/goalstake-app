#!/usr/bin/env node

/**
 * Script to create a new Supabase project for an environment.
 * This is typically used to set up development, staging, and production environments.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// User input interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Environment options
const environments = ['development', 'staging', 'production'];

// Function to generate a random password
function generatePassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

// Function to ask a question and get user input
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to verify Supabase CLI is installed
function checkSupabaseCLI() {
  try {
    execSync('supabase --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.error('Error: Supabase CLI is not installed. Please install it first:');
    console.error('npm install -g supabase');
    return false;
  }
}

// Function to check if logged in to Supabase
function checkSupabaseLogin() {
  try {
    const result = execSync('supabase projects list', { encoding: 'utf-8' });
    return !result.includes('Error: You need to be logged in to use this command');
  } catch (error) {
    return false;
  }
}

// Main function
async function main() {
  console.log('GoalStake Supabase Project Creator\n');
  
  // Check prerequisites
  if (!checkSupabaseCLI()) {
    process.exit(1);
  }
  
  if (!checkSupabaseLogin()) {
    console.log('You are not logged in to Supabase CLI. Please log in first:');
    try {
      execSync('supabase login', { stdio: 'inherit' });
    } catch (error) {
      console.error('Failed to log in to Supabase CLI.');
      process.exit(1);
    }
  }
  
  // Select environment
  console.log('\nWhich environment do you want to create a project for?');
  environments.forEach((env, index) => {
    console.log(`${index + 1}) ${env}`);
  });
  
  const envChoice = await askQuestion('Enter the number (1-3): ');
  const selectedEnv = environments[parseInt(envChoice) - 1];
  
  if (!selectedEnv) {
    console.error('Invalid choice. Please try again.');
    process.exit(1);
  }
  
  console.log(`\nCreating Supabase project for ${selectedEnv} environment...`);
  
  // Get organization ID
  console.log('\nFetching your Supabase organizations...');
  const orgOutput = execSync('supabase orgs list --json', { encoding: 'utf-8' });
  const organizations = JSON.parse(orgOutput);
  
  if (organizations.length === 0) {
    console.error('No organizations found. Please create an organization first in the Supabase dashboard.');
    process.exit(1);
  }
  
  console.log('\nSelect an organization:');
  organizations.forEach((org, index) => {
    console.log(`${index + 1}) ${org.name} (${org.id})`);
  });
  
  const orgChoice = await askQuestion('Enter the number: ');
  const selectedOrg = organizations[parseInt(orgChoice) - 1];
  
  if (!selectedOrg) {
    console.error('Invalid choice. Please try again.');
    process.exit(1);
  }
  
  // Project name and region
  const projectName = await askQuestion(`\nEnter a project name (default: goalstake-${selectedEnv}): `) || `goalstake-${selectedEnv}`;
  
  console.log('\nAvailable regions:');
  const regions = [
    { name: 'North America (US East)', code: 'us-east-1' },
    { name: 'North America (US West)', code: 'us-west-1' },
    { name: 'Europe (London)', code: 'eu-west-2' },
    { name: 'Asia Pacific (Sydney)', code: 'ap-southeast-2' },
    { name: 'Asia Pacific (Singapore)', code: 'ap-southeast-1' }
  ];
  
  regions.forEach((region, index) => {
    console.log(`${index + 1}) ${region.name} (${region.code})`);
  });
  
  const regionChoice = await askQuestion('Enter the number: ');
  const selectedRegion = regions[parseInt(regionChoice) - 1];
  
  if (!selectedRegion) {
    console.error('Invalid choice. Please try again.');
    process.exit(1);
  }
  
  // Database password
  const dbPassword = await askQuestion('\nEnter a database password (leave empty to generate one): ') || generatePassword();
  
  // Create the project
  console.log('\nCreating Supabase project... (this may take a few minutes)');
  
  try {
    const createOutput = execSync(
      `supabase projects create "${projectName}" \
      --org-id "${selectedOrg.id}" \
      --region "${selectedRegion.code}" \
      --db-password "${dbPassword}"`, 
      { encoding: 'utf-8' }
    );
    
    console.log('\n✅ Project created successfully!');
    
    // Extract project ID
    const projectMatch = createOutput.match(/Project ref: ([a-zA-Z0-9]+)/);
    const projectId = projectMatch ? projectMatch[1] : null;
    
    if (!projectId) {
      console.error('Could not extract project ID from creation output.');
      process.exit(1);
    }
    
    // Get API keys
    console.log('\nFetching API keys...');
    const apiKeysOutput = execSync(`supabase projects api-keys --project-ref ${projectId}`, { encoding: 'utf-8' });
    
    // Extract anon key
    const anonKeyMatch = apiKeysOutput.match(/anon key: ([a-zA-Z0-9\.]+)/i);
    const anonKey = anonKeyMatch ? anonKeyMatch[1] : 'Could not extract anon key';
    
    // Update .env file
    const envFilePath = path.resolve(process.cwd(), `.env.${selectedEnv}`);
    
    if (fs.existsSync(envFilePath)) {
      let envContent = fs.readFileSync(envFilePath, 'utf-8');
      
      // Update URL
      envContent = envContent.replace(
        /EXPO_PUBLIC_SUPABASE_URL=.*/,
        `EXPO_PUBLIC_SUPABASE_URL=https://${projectId}.supabase.co`
      );
      
      // Update anon key
      envContent = envContent.replace(
        /EXPO_PUBLIC_SUPABASE_ANON_KEY=.*/,
        `EXPO_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`
      );
      
      // Update API URL
      envContent = envContent.replace(
        /EXPO_PUBLIC_API_URL=.*/,
        `EXPO_PUBLIC_API_URL=https://${projectId}.supabase.co`
      );
      
      fs.writeFileSync(envFilePath, envContent);
      console.log(`\n✅ Updated ${envFilePath} with new project details`);
    } else {
      console.warn(`\n⚠️ Warning: Could not find .env.${selectedEnv} file to update.`);
    }
    
    // Show project info
    console.log('\n=== Project Information ===');
    console.log(`Project Name: ${projectName}`);
    console.log(`Project ID: ${projectId}`);
    console.log(`URL: https://${projectId}.supabase.co`);
    console.log(`Region: ${selectedRegion.name}`);
    console.log(`Anon Key: ${anonKey}`);
    console.log(`Database Password: ${dbPassword}`);
    console.log('===========================');
    
    console.log('\n🔥 Next steps:');
    console.log(`1. Apply your database schema: APP_ENV=${selectedEnv} npm run db:push:${selectedEnv}`);
    console.log(`2. Generate TypeScript types: APP_ENV=${selectedEnv} npm run generate:types`);
    
  } catch (error) {
    console.error('Error creating Supabase project:', error.message);
    process.exit(1);
  }
  
  rl.close();
}

// Run the main function
main(); 