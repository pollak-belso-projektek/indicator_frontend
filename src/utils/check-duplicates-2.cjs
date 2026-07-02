const fs = require('fs');
const nav = fs.readFileSync('src/components/Navigation.jsx', 'utf8');

const code = nav.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');

const matches = [];
const regex = /link:\s*"([^"]+)"/g;
let match;
while ((match = regex.exec(code)) !== null) {
  matches.push(match[1]);
}

const counts = {};
matches.forEach(m => {
  counts[m] = (counts[m] || 0) + 1;
});

let found = false;
console.log("=== Duplicates (no comments) ===");
Object.entries(counts).forEach(([link, count]) => {
  if (count > 1) {
    found = true;
    console.log(`Duplicate: ${link} (${count} times)`);
  }
});
if (!found) console.log("No duplicates found!");
