const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/indicators/3_oktato_per_diak/EgyOktatoraJutoTanulo.jsx',
  'src/pages/indicators/4_szakkepzesi_munkaszerződes_arany/SzakképzésiMunkaszerződésArány.jsx',
  'src/pages/indicators/5_felnottkepzes/Felnottkepzes.jsx',
  'src/pages/indicators/6_kompetencia/Kompetencia.jsx',
  'src/pages/indicators/7_nszfh_meresek/NszfhMeresek.jsx',
  'src/pages/indicators/9_elhelyezkedesi_mutato/ElhelyezkedesimMutato.jsx',
  'src/pages/indicators/10_vegzettek_elegedettsege/VegzettekElegedettsege.jsx',
  'src/pages/indicators/11_vizsgaeredmenyek/Vizsgaeredmenyek.jsx',
  'src/pages/indicators/12_szakmai_vizsga/SzakmaiVizsga.jsx',
  'src/pages/indicators/14_szakmai_bemutatok_konferenciak/SzakmaiBemutatokKonferenciak.jsx',
  'src/pages/indicators/15_lemorzsolodas/Lemorzsolodas.jsx',
  'src/pages/indicators/16_elegedettseg_meres_eredmenyei/ElegedettsegMeresEredmenyei.jsx',
  'src/pages/indicators/17_intezmenyi_nevelesi_mutatok/IntezményiNevelesiMutatok.jsx',
  'src/pages/indicators/18_hatranyos_helyezu_tanulok_aranya/HatanyosHelyzetuTanulokAranya.jsx',
  'src/pages/indicators/19_sajatos_nevelesi_igenyu_tanulok_aranya/SajatosNevelesiIgenyuTanulokAranya.jsx',
  'src/pages/indicators/20_dobbanto_program_aranya/DobbantoProgramAranya.jsx',
  'src/pages/indicators/21_muhelyiskolai_reszszakmat/MuhelyiskolaiReszszakmat.jsx',
  'src/pages/indicators/23_oktato_egyeb_tev/Oktatok_egyeb_tev.jsx',
  'src/pages/indicators/26_hianyzas/Hianyzas.jsx',
  'src/pages/indicators/27_egy_oktatora_juto_ossz_diak/EgyOktatoraJutoOsszDiak.jsx'
];

let updatedCount = 0;

files.forEach(file => {
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) {
    console.log('File not found:', file);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if it already has the generic export or the specific export
  if (content.includes('ExportDOMTableToExcel')) {
    console.log('Already has export:', file);
    return;
  }

  // 1. Add import statement
  if (!content.includes('import ExportDOMTableToExcel')) {
    const lastImportIndex = content.lastIndexOf('import ');
    const endOfLastImport = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, endOfLastImport) + '\nimport ExportDOMTableToExcel from "../../../components/ExportDOMTableToExcel";' + content.slice(endOfLastImport);
  }

  // 2. Inject component before LockedTableWrapper
  content = content.replace(
    /(<LockedTableWrapper[^>]*>)/,
    '<ExportDOMTableToExcel tableId=".MuiTable-root" fileName="export_adatok" />\n                  $1'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated:', file);
  updatedCount++;
});

console.log('Total files updated:', updatedCount);
