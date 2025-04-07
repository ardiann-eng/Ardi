#!/usr/bin/env node

// Script to handle Vercel build process
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to run commands and log output
function runCommand(command) {
  console.log(`Running: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error);
    process.exit(1);
  }
}

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Build client
console.log('Building client...');
runCommand('npm run build:client');

// Build server
console.log('Building server...');
runCommand('npm run build:server');

// Create a _redirects file for SPA routing in Vercel
const redirectsContent = '/* /index.html 200';
fs.writeFileSync(path.join('dist', 'public', '_redirects'), redirectsContent);

console.log('Build completed successfully!');