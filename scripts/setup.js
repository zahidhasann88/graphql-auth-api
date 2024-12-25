const fs = require("fs");
const path = require("path");

// Define the files to create
const filesToCreate = [
  {
    filename: ".env.local",
    content: `# Environment Variables
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/mydb
`,
  },
  {
    filename: ".gitignore",
    content: `# Logs
logs
*.log

# Node modules
node_modules

# Environment files
.env*
`,
  },
];

// Create files if they don't already exist
filesToCreate.forEach((file) => {
  const filePath = path.resolve(process.cwd(), file.filename);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, file.content, "utf8");
    console.log(`${file.filename} created successfully.`);
  } else {
    console.log(`${file.filename} already exists. Skipping creation.`);
  }
});
