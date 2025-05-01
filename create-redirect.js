const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'dist', 'key-sell-ui');
const redirectFile = path.join(outputDir, '_redirects');
const redirectContent = '/*    /index.html   200\n';

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  console.error(`❌ Output directory ${outputDir} does not exist. Did the build run successfully?`);
  process.exit(1);
}

fs.writeFileSync(redirectFile, redirectContent);
console.log(`✅ "_redirects" file created in ${outputDir}`);
