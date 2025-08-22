const fs = require('fs');
const path = require('path');
const setupPromise = require('./setup');

async function renderTemplate(templatePath) {
  // Wait for setup to complete first
  await setupPromise;

  // Load environment variables after setup (from project root)
  require('dotenv').config({ quiet: true, path: path.join(path.dirname(__dirname), '.env.local') });
  require('dotenv').config({ quiet: true, path: path.join(path.dirname(__dirname), '.env') });
  
  if (!templatePath) {
    console.error('Usage: node render-env.js <file.example>');
    process.exit(1);
  }

  if (!templatePath.endsWith('.example')) {
    console.error('Error: File must end with .example extension');
    process.exit(1);
  }

  // Resolve template path relative to current working directory
  const resolvedTemplatePath = path.resolve(process.cwd(), templatePath);
  
  if (!fs.existsSync(resolvedTemplatePath)) {
    console.error(`Error: File ${resolvedTemplatePath} does not exist`);
    process.exit(1);
  }

  const templateContent = fs.readFileSync(resolvedTemplatePath, 'utf8');

  // Replace environment variables in the format {{VAR_NAME}}
  const renderedContent = templateContent.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
    const value = process.env[varName];
    if (value === undefined) {
      console.warn(`Warning: Environment variable ${varName} is not defined`);
      return match; // Keep the placeholder if variable is not found
    }
    return value;
  });

  const outputPath = resolvedTemplatePath.replace(/\.example$/, '');
  fs.writeFileSync(outputPath, renderedContent);

  console.log(`Rendered ${resolvedTemplatePath} -> ${outputPath}`);
}

const inputFile = process.argv[2];
renderTemplate(inputFile).catch(e => {
  console.error(e);
  process.exit(1);
});
