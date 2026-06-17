const fs = require('fs');
const path = require('path');

function processFile(filePath, injectionTarget, isBefore) {
  const fullPath = path.resolve(filePath);
  let content = fs.readFileSync(fullPath, 'utf8');

  // 1. Add import statement if missing
  if (!content.includes('import ExportDOMTableToExcel')) {
    const lastImportIndex = content.lastIndexOf('import ');
    const endOfLastImport = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, endOfLastImport) + '\nimport ExportDOMTableToExcel from "../../../components/ExportDOMTableToExcel";' + content.slice(endOfLastImport);
  }

  // 2. Inject component
  const exportJsx = '<ExportDOMTableToExcel tableId=".MuiTable-root" fileName="' + path.basename(filePath, '.jsx').toLowerCase() + '" />';
  
  if (isBefore) {
    // We want to replace `<LockStatusIndicator ... />` with a Stack that contains both
    content = content.replace(
      /(<LockStatusIndicator[^>]*>)/,
      '<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>\n                $1\n                ' + exportJsx + '\n              </Stack>'
    );
  } else {
    // Just inject before
    content = content.replace(
      new RegExp('(' + injectionTarget.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + ')'),
      exportJsx + '\n                  $1'
    );
  }

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Updated:', filePath);
}

// 3 is already imported, but let's replace LockStatusIndicator with Stack
processFile('src/pages/indicators/3_oktato_per_diak/EgyOktatoraJutoTanulo.jsx', '<LockStatusIndicator', true);
// 5
processFile('src/pages/indicators/5_felnottkepzes/Felnottkepzes.jsx', '<LockStatusIndicator', true);
// 9
processFile('src/pages/indicators/9_elhelyezkedesi_mutato/ElhelyezkedesimMutato.jsx', '<LockStatusIndicator', true);

console.log('Done fixing 3, 5, 9');
