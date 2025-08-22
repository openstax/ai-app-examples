#!/bin/bash

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Building all examples...${NC}\n"

# Create top-level dist folder
DIST_DIR="$(pwd)/dist"
if [ -d "$DIST_DIR" ]; then
    echo -e "${YELLOW}Removing existing dist directory...${NC}"
    rm -rf "$DIST_DIR"
fi
mkdir -p "$DIST_DIR"

# Check if examples directory exists
EXAMPLES_DIR="$(pwd)/examples"
if [ ! -d "$EXAMPLES_DIR" ]; then
    echo -e "${RED}Error: examples directory not found at $EXAMPLES_DIR${NC}"
    exit 1
fi

# Iterate through each example folder
for example_dir in "$EXAMPLES_DIR"/*; do
    if [ -d "$example_dir" ]; then
        example_name=$(basename "$example_dir")
        echo -e "${GREEN}Processing example: $example_name${NC}"
        
        # Check if package.json exists
        if [ ! -f "$example_dir/package.json" ]; then
            echo -e "${YELLOW}  No package.json found, skipping...${NC}"
            continue
        fi
        
        cd "$example_dir"
        
        # 1) Check if there's a build script and run it
        if npm run | grep -q "build"; then
            echo -e "${YELLOW}  Running npm run build...${NC}"
            npm run build
        else
            echo -e "${YELLOW}  No build script found, skipping build step...${NC}"
        fi
        
        # 2 & 3) Use Node.js to parse package.json and copy files with prefix handling
        node -e "
        const fs = require('fs');
        const path = require('path');
        
        function copyFiles() {
          try {
            const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const files = pkg.files || ['src', 'index.html', 'dist', 'build', 'public'];
            const distDir = '$DIST_DIR/$example_name';
            
            // Filter existing files
            const existingFiles = files.filter(file => fs.existsSync(file));
            
            if (existingFiles.length === 0) {
              console.log('  No distribution files found');
              return;
            }
            
            // Detect common prefix
            let commonPrefix = '';
            if (existingFiles.length > 1) {
              const dirs = existingFiles.map(f => f.includes('/') ? f.substring(0, f.lastIndexOf('/') + 1) : '');
              const firstDir = dirs[0];
              
              if (firstDir && dirs.every(dir => dir === firstDir)) {
                commonPrefix = firstDir;
                console.log(\`  Detected common prefix: \${commonPrefix}\`);
              }
            }
            
            console.log('  Copying distribution files...');
            
            existingFiles.forEach(file => {
              const stat = fs.statSync(file);
              let destPath;
              
              if (commonPrefix && file.startsWith(commonPrefix)) {
                // Strip common prefix
                const relativePath = file.substring(commonPrefix.length);
                destPath = path.join(distDir, relativePath);
              } else {
                destPath = path.join(distDir, path.basename(file));
              }
              
              console.log(\`    Copying \${file} -> \${path.relative(distDir, destPath)}\`);
              
              // Create destination directory
              fs.mkdirSync(path.dirname(destPath), { recursive: true });
              
              if (stat.isDirectory()) {
                fs.cpSync(file, destPath, { recursive: true });
              } else {
                fs.copyFileSync(file, destPath);
              }
            });
            
          } catch (error) {
            console.error('  Error processing files:', error.message);
            process.exit(1);
          }
        }
        
        copyFiles();
        "
        
        cd - > /dev/null
        echo -e "${GREEN}  ✓ $example_name processed${NC}\n"
    fi
done

echo -e "${GREEN}Build complete! Distribution files are in: $DIST_DIR${NC}"