const fs = require("fs");
const path = require("path");

const envFilePath = path.join(__dirname, "src/environments/environment.ts");
const apiUrl = process.env.API_URL || "https://api.key-sell.com"; // Default value

if (!fs.existsSync(envFilePath)) {
  console.error(`Error: File not found -> ${envFilePath}`);
  process.exit(1);
}

let envContent = fs.readFileSync(envFilePath, "utf8");

// Update API_URL in the environment file
envContent = envContent.replace(
  /API_URL:\s*['"].*?['"]/,
  `API_URL: '${apiUrl}'`
);

fs.writeFileSync(envFilePath, envContent, "utf8");

console.log(`Updated API_URL to: ${apiUrl}`);
