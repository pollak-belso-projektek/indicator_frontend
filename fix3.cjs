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

        // Target exactly the Stack wrappers around LockedTableWrapper
        // and fix them completely.
        
        // 1. Remove ANY <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}> inside LockedTableWrapper
        content = content.replace(/<LockedTableWrapper([^>]*)>\s*<Box[^>]*>\s*([\s\S]*?)\s*<\/Box>\s*<\/LockedTableWrapper>/g, '<LockedTableWrapper$1>\n$2\n</LockedTableWrapper>');

        // 2. Replace any <Stack ...> before <LockedTableWrapper> (which now contains Export button)
        // We know it's a Stack that wraps ExportDOMTableToExcel or LockedTableWrapper
        content = content.replace(/<Stack[^>]*direction=\{?[^>]*\bspacing=\{2\}[^>]*>/g, match => {
            // Check if it's the specific Action Buttons Stack by looking for mb: 3 or mt: 3
            if (match.includes('mb: 3') || match.includes('mt: 3') || match.includes('mb: 2') || match.includes('mt: 2')) {
                // If it's the sticky one in szakkepzesi:
                if (match.includes('position: "sticky"')) {
                    return `<Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3, mb: 2, position: "sticky", top: 2, backgroundColor: "white", zIndex: 10, p: 2, borderRadius: 2, boxShadow: 1 }}>`;
                }
                
                let hasMt = match.includes('mt: 3');
                return hasMt 
                    ? `<Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3, ml: 2 }}>`
                    : `<Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3, ml: 2 }}>`;
            }
            return match;
        });

        fs.writeFileSync(filePath, content);
      }
    });
  }
});
