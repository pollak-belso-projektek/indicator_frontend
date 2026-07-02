const fs = require('fs');
const nav = fs.readFileSync('src/components/Navigation.jsx', 'utf8');
const code = nav.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
const matches = [];
const regex = /link:\s*"([^"]+)"/g;
let match;
while ((match = regex.exec(code)) !== null) {
  matches.push(match[1]);
}

matches.forEach(l => {
  if (l.match(/[^a-zA-Z0-9\-\/_]/)) {
    console.log(l);
  }
});
