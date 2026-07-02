const fs = require('fs');
const nav = fs.readFileSync('src/components/Navigation.jsx', 'utf8');

const matches = [];
const regex = /link:\s*"([^"]+)"/g;
let match;
while ((match = regex.exec(nav)) !== null) {
  matches.push(match[1]);
}

const counts = {};
matches.forEach(m => {
  counts[m] = (counts[m] || 0) + 1;
});

console.log("=== Duplicates ===");
Object.entries(counts).forEach(([link, count]) => {
  if (count > 1) {
    console.log(`Duplicate: ${link} (${count} times)`);
  }
});
