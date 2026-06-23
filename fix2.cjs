const fs = require('fs');
const path = require('path');

const dirs = [
  '1_tanulo_letszam',
  '2_felvettek_szama',
  '4_szakkepzesi_munkaszerződes_arany',
  '6_kompetencia',
  '7_nszfh_meresek',
  '8_szakmai_eredmenyek',
  '9_elhelyezkedesi_mutato',
  '10_vegzettek_elegedettsege',
  '11_vizsgaeredmenyek',
  '14_szakmai_bemutatok_konferenciak',
  '15_lemorzsolodas',
  '16_elegedettseg_meres_eredmenyei',
  '18_hatranyos_helyezu_tanulok_aranya',
  '19_sajatos_nevelesi_igenyu_tanulok_aranya',
  '20_dobbanto_program_aranya',
  '21_muhelyiskolai_reszszakmat',
  '23_oktato_egyeb_tev',
  '24_palyazatok'
];

const basePath = 'c:/Users/Gamer8/Downloads/indicator_frontend/src/pages/indicators';

dirs.forEach(dir => {
  const dirPath = path.join(basePath, dir);
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      if (file.endsWith('.jsx')) {
        const filePath = path.join(dirPath, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        // 1. Remove the Box wrapper inside LockedTableWrapper
        // It could be <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}> or similar.
        const boxRegex = /<LockedTableWrapper([^>]*)>\s*<Box[^>]*display:\s*['"]flex['"][^>]*>([\s\S]*?)<\/Box>\s*<\/LockedTableWrapper>/g;
        content = content.replace(boxRegex, '<LockedTableWrapper$1>\n$2</LockedTableWrapper>');

        // 2. Fix the Stack props
        // Match <Stack direction="..." spacing={2} ... sx={{ ... }}>
        const stackRegex = /<Stack\s+direction=\{?[^}]*\}?\s+spacing=\{2\}(?:\s+useFlexGap)?\s+sx=\{\{([^}]+)\}\}>/g;
        content = content.replace(stackRegex, (match, sxContent) => {
            // Remove flexWrap: 'wrap' or flexWrap: "wrap" from sxContent
            let cleanSx = sxContent.replace(/flexWrap:\s*['"]wrap['"]\s*,?/g, '').trim();
            // remove trailing comma if left alone
            cleanSx = cleanSx.replace(/,\s*$/, '');
            
            // Just use the exact Stack props from SzakmaiVizsga.jsx if the user wants it to be exactly the same.
            // Wait, sx={{ mb: 3, ml: 2 }} is what SzakmaiVizsga uses.
            // If the original had mt: 3, keep it.
            let hasMt = cleanSx.includes('mt:');
            let sxProp = hasMt ? `sx={{ mt: 3, ml: 2 }}` : `sx={{ mb: 3, ml: 2 }}`;
            
            // Special exception for SzakképzésiMunkaszerződésArány which has sticky positioning.
            if (cleanSx.includes('position: "sticky"')) {
                return `<Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ ${cleanSx} }}>`;
            }
            
            return `<Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3, ml: 2 }}>`;
        });

        // Some Stacks might not have been matched if they were multi-line or slightly different.
        // Let's just catch <Stack direction="row" spacing={2} ...> and replace them too.
        content = content.replace(/<Stack direction="row" spacing=\{2\} sx=\{\{[^}]+\}\}>/g, '<Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3, ml: 2 }}>');

        // 3. Ensure Export button is BEFORE LockedTableWrapper
        // We will look for a Stack block and rearrange it.
        const fullStackRegex = /(<Stack[^>]*>)([\s\S]*?)(<\/Stack>)/g;
        content = content.replace(fullStackRegex, (match, stackStart, stackInner, stackEnd) => {
            if (stackInner.includes('ExportDOMTableToExcel') || stackInner.includes('ExportToExcel')) {
                // If LockedTableWrapper is BEFORE Export, swap them.
                const exportRegex = /(<Export(?:DOMTable)?ToExcel[\s\S]*?\/>)/;
                const lockedRegex = /(<LockedTableWrapper[\s\S]*?<\/LockedTableWrapper>)/;
                
                const exportMatch = stackInner.match(exportRegex);
                const lockedMatch = stackInner.match(lockedRegex);
                
                if (exportMatch && lockedMatch) {
                    const exportIndex = stackInner.indexOf(exportMatch[0]);
                    const lockedIndex = stackInner.indexOf(lockedMatch[0]);
                    
                    if (lockedIndex < exportIndex) {
                        // Extract any other children like additional buttons (Excel feltöltés)
                        // Actually, it's safer to just move Export to the very top of the stackInner.
                        let newInner = stackInner.replace(exportMatch[0], '');
                        newInner = `\n              ${exportMatch[0].trim()}\n${newInner}`;
                        return `${stackStart}${newInner}${stackEnd}`;
                    }
                }
            }
            return match;
        });

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content);
            console.log(`Updated ${file}`);
        }
      }
    });
  }
});
