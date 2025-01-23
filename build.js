const fs = require('fs');
const ejs = require('ejs');

// Read and compile EJS file
const ejsFilePath = '/Users/macbook/code/ga/labs/where-to-fish-project/views/index.ejs';
const htmlFilePath = './dist/index.html'; // Output folder

ejs.renderFile(ejsFilePath, {}, (err, html) => {
  if (err) {
    console.error('Error rendering EJS:', err);
    process.exit(1);
  }

  // Ensure the output directory exists
  fs.mkdirSync('./dist', { recursive: true });

  // Write the compiled HTML to file
  fs.writeFileSync(htmlFilePath, html);
  console.log('Compiled HTML written to', htmlFilePath);
});