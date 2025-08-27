import * as readline from 'readline';
import { fileURLToPath } from 'url';
import * as fs from 'fs';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Handle Ctrl+C to exit with non-zero code
rl.on('SIGINT', () => {
  console.log('\nSetup cancelled.');
  rl.close();
  process.exit(1);
});

function promptForApiKey() {
  return new Promise((resolve) => {
    rl.question('Please enter your API key: ', (answer) => {
      resolve(answer.trim());
    });
  });
}

function checkExistingApiKey(envPath) {
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    return content.includes('VITE_API_KEY=') && content.match(/VITE_API_KEY=(.+)/)?.[1]?.trim();
  }
  return false;
}

async function main() {
  const envPath = path.join(path.dirname(__dirname), '.env.local');

  // Check if API key already exists
  if (checkExistingApiKey(envPath)) {
    rl.close();
    return;
  }

  console.log('Setting up environment configuration...\n');

  let apiKey = '';

  // Keep asking until a non-empty API key is provided
  while (!apiKey) {
    apiKey = await promptForApiKey();
    if (!apiKey) {
      console.log('API key cannot be empty. Please try again.\n');
    }
  }

  // Read existing content and add API key
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent && !envContent.endsWith('\n')) {
      envContent += '\n';
    }
  }

  envContent += `VITE_API_KEY=${apiKey}\n`;

  fs.writeFileSync(envPath, envContent);
  console.log(`\nAPI key saved to ${envPath}`);

  rl.close();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
