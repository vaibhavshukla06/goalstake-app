#!/usr/bin/env node
/**
 * Edge Function Deployment Script for GoalStake
 * 
 * This script deploys edge functions to your Supabase project.
 * 
 * Usage:
 *   node scripts/deploy-edge-functions.js [environment] [function-name]
 * 
 * Environment:
 *   - dev (default)
 *   - staging
 *   - prod
 * 
 * Function name:
 *   - Name of a specific function to deploy
 *   - If omitted, all functions will be deployed
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');
const { program } = require('commander');

// Setup command line arguments
program
  .name('deploy-edge-functions')
  .description('GoalStake edge function deployment tool')
  .version('1.0.0')
  .argument('[environment]', 'Environment to deploy functions to', 'dev')
  .argument('[function-name]', 'Name of a specific function to deploy')
  .option('-l, --list', 'List available functions without deploying')
  .option('-v, --verbose', 'Show detailed logs during deployment')
  .parse(process.argv);

const options = program.opts();
const environment = program.args[0] || 'dev';
const functionName = program.args[1];

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
const SUPABASE_PROJECT_ID = SUPABASE_URL ? SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1] : null;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SUPABASE_PROJECT_ID) {
  console.error('Error: Required environment variables are missing.');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file.');
  process.exit(1);
}

// Path to functions
const FUNCTIONS_DIR = path.join(__dirname, '..', 'supabase', 'functions');

/**
 * Get list of edge functions
 */
function getEdgeFunctions() {
  // Get all directories in the functions directory, excluding _shared and files
  const items = fs.readdirSync(FUNCTIONS_DIR, { withFileTypes: true });
  
  return items
    .filter(item => item.isDirectory() && item.name !== '_shared')
    .map(dir => dir.name);
}

/**
 * List available functions
 */
function listFunctions(functions) {
  console.log('\n📋 Available Edge Functions:');
  
  functions.forEach(fn => {
    // Check if function has an index.ts file
    const indexFile = path.join(FUNCTIONS_DIR, fn, 'index.ts');
    const exists = fs.existsSync(indexFile);
    
    console.log(`  ${exists ? '✅' : '❌'} ${fn}`);
  });
  
  console.log('\n');
}

/**
 * Deploy a single function
 */
async function deployFunction(fnName) {
  const fnPath = path.join(FUNCTIONS_DIR, fnName);
  const indexPath = path.join(fnPath, 'index.ts');
  
  // Check if function directory exists
  if (!fs.existsSync(fnPath)) {
    console.error(`❌ Function '${fnName}' not found in ${FUNCTIONS_DIR}`);
    return false;
  }
  
  // Check if index.ts exists
  if (!fs.existsSync(indexPath)) {
    console.error(`❌ Function '${fnName}' has no index.ts file`);
    return false;
  }
  
  console.log(`📦 Deploying function: ${fnName}`);
  
  try {
    // Create temporary Supabase config file
    const configDir = path.join(__dirname, '..', 'supabase');
    const configFile = path.join(configDir, 'config.json');
    
    const config = {
      project_id: SUPABASE_PROJECT_ID,
      api: {
        url: SUPABASE_URL,
        service_role_key: SUPABASE_SERVICE_KEY
      }
    };
    
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    
    // Execute Supabase deploy command
    const deployCommand = `npx supabase functions deploy ${fnName} --project-ref ${SUPABASE_PROJECT_ID}`;
    
    if (options.verbose) {
      console.log(`Executing: ${deployCommand}`);
    }
    
    execSync(deployCommand, { stdio: 'inherit' });
    
    // Clean up config file
    fs.unlinkSync(configFile);
    
    console.log(`✅ Successfully deployed function: ${fnName}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Failed to deploy function ${fnName}: ${error.message}`);
    return false;
  }
}

/**
 * Main deployment function
 */
async function deployFunctions() {
  const functions = getEdgeFunctions();
  
  if (options.list) {
    listFunctions(functions);
    return;
  }
  
  console.log(`\n🚀 Deploying edge functions to ${environment} environment\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  if (functionName) {
    // Deploy a specific function
    if (!functions.includes(functionName)) {
      console.error(`❌ Function '${functionName}' not found.`);
      console.log('Available functions:');
      listFunctions(functions);
      process.exit(1);
    }
    
    const success = await deployFunction(functionName);
    successCount += success ? 1 : 0;
    failCount += success ? 0 : 1;
    
  } else {
    // Deploy all functions
    for (const fn of functions) {
      const success = await deployFunction(fn);
      successCount += success ? 1 : 0;
      failCount += success ? 0 : 1;
    }
  }
  
  // Summary
  console.log('\n📊 Deployment Summary:');
  console.log(`  ✅ Successfully deployed: ${successCount}`);
  console.log(`  ❌ Failed to deploy: ${failCount}`);
  console.log('\n');
  
  if (failCount > 0) {
    process.exit(1);
  }
}

// Execute the deployment
deployFunctions(); 