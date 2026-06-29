const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'pages', 'indicators');
const files = [];

function findFiles(directory) {
  const items = fs.readdirSync(directory);
  for (const item of items) {
    const fullPath = path.join(directory, item);
    if (fs.statSync(fullPath).isDirectory()) {
      findFiles(fullPath);
    } else if (fullPath.endsWith('.jsx') && !item.startsWith('info_') && !item.startsWith('title_')) {
      files.push(fullPath);
    }
  }
}

findFiles(dir);

let modifiedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Skip if already has HistoryDialog or has no save button
  if (content.includes('HistoryDialog') || !content.includes('Mentés')) {
    continue;
  }

  // 1. Determine table name
  let tableName = 'unknown';
  const updateMatch = content.match(/useUpdate([A-Za-z0-9]+)Mutation/);
  const addMatch = content.match(/useAdd([A-Za-z0-9]+)Mutation/);
  const getMatch = content.match(/useGet([A-Za-z0-9]+)Query/);

  if (updateMatch) {
    tableName = updateMatch[1].charAt(0).toLowerCase() + updateMatch[1].slice(1);
  } else if (addMatch) {
    tableName = addMatch[1].charAt(0).toLowerCase() + addMatch[1].slice(1);
  } else if (getMatch) {
    tableName = getMatch[1].charAt(0).toLowerCase() + getMatch[1].slice(1);
  } else {
    const base = path.basename(file, '.jsx');
    tableName = base.charAt(0).toLowerCase() + base.slice(1);
  }

  // Handle some specific edge cases for table mapping
  if (tableName === 'felvettekSzamaByAlapadatokIdAndYear') tableName = 'felvettekSzama';
  if (tableName === 'szakmaiRendezvenyekBySchoolAndYear') tableName = 'szakmairendezvenyek';
  if (tableName === 'lemorzsolodasBySchoolAndYear') tableName = 'lemorzsolodas';
  if (tableName === 'intezmenyiNeveltsegiMutatokByYear') tableName = 'intezmenyiNeveltsegiMutatok';
  if (tableName === 'munkavallalokElismeresekBySchool') tableName = 'intezmenyiElismerasok'; // Backend uses intezmenyi_elismeresek
  if (tableName === 'nSZFHBySchoolAndYear') tableName = 'nszfh';
  if (tableName === 'versenyek') tableName = 'versenyek';
  if (tableName === 'allElhelyezkedes') tableName = 'elhelyezkedes';

  // 2. Add Imports
  const importHistoryDialog = `import HistoryDialog from "../../../components/HistoryDialog";\nimport HistoryIcon from '@mui/icons-material/History';`;
  // Insert imports after the last import statement
  const lastImportIndex = content.lastIndexOf('import ');
  if (lastImportIndex !== -1) {
    const endOfLastImport = content.indexOf(';', lastImportIndex);
    if (endOfLastImport !== -1) {
      content = content.slice(0, endOfLastImport + 1) + '\n' + importHistoryDialog + content.slice(endOfLastImport + 1);
    }
  }

  // 3. Add State
  const stateInjection = `\n  const [historyOpen, setHistoryOpen] = useState(false);`;
  const exportMatch = content.match(/export default function \w+\(\) \{/);
  if (exportMatch) {
    const idx = exportMatch.index + exportMatch[0].length;
    content = content.slice(0, idx) + stateInjection + content.slice(idx);
    
    // Also ensure useState is imported if not
    if (!content.includes('useState')) {
      content = content.replace(/import React from ['"]react['"];/, `import React, { useState } from 'react';`);
    }
  }

  // 4. Add Button
  // We look for a Button that contains "Mentés" or {isSaving ? "Mentés..." : "Mentés"}
  // Using a regex to find the end of the Mentés button
  const buttonRegex = /(<Button[^>]*>[\s\S]*?(?:Mentés|Mentés\.\.\.)[\s\S]*?<\/Button>)/g;
  content = content.replace(buttonRegex, `$1\n            <Button\n              variant="outlined"\n              color="info"\n              startIcon={<HistoryIcon />}\n              onClick={() => setHistoryOpen(true)}\n              disabled={!selectedSchool}\n            >\n              Előzmények\n            </Button>`);

  // 5. Add HistoryDialog before </PageWrapper>
  const dialogInjection = `
        <HistoryDialog
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          alapadatokId={selectedSchool?.id}
          tableName="${tableName}"
          onRollbackSuccess={() => {
            setSnackbarMessage("Sikeres visszaállítás az előzményekből!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
          }}
        />
      </PageWrapper>`;
  
  content = content.replace(/\s*<\/PageWrapper>/, dialogInjection);

  fs.writeFileSync(file, content);
  console.log(`Updated ${file} with tableName: ${tableName}`);
  modifiedCount++;
}

console.log(`Successfully updated ${modifiedCount} files.`);
