// Every permission/lock table name used by the UI must exist in table_list. A typo
// silently hides a menu item, blocks a page for everyone but developers, or makes
// table locking ineffective (exact-name lookups).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const src = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = rel => readFileSync(path.join(src, rel), 'utf8');

// Production table_list.name (keep in sync with indicator_backend/tests/endpointAccess.test.js).
const LIVE_TABLES = new Set([
  'alapadatok', 'alkalmazottak_munkaugy', 'auth', 'digitalis_kompetencia', 'dobbanto', 'dualis_kepzohelyek',
  'egy_oktatora_juto_ossz_diak', 'egy_oktatora_juto_tanulo', 'egyuttmukudesek_szama', 'elegedettseg',
  'elegedettseg_meres', 'elhelyezkedes', 'felnottkepzes', 'felvettek_szama', 'hh_es_hhh', 'hianyzas',
  'innovacios_tevekenysegek', 'intezmenyi_elismeresek', 'intezmenyi_neveltseg', 'intezmenyi_neveltsegi_mutatok',
  'kompetencia', 'lemorzsolodas', 'log', 'muhelyiskola', 'nszfh', 'nyelvvizsgak_szama', 'oktato-egyeb-tev',
  'oktato_adatszolgaltatas', 'palyaorientacio', 'palyazatok', 'projektek', 'sajatos_nevelesu_tanulok',
  'szakkepzes_zolditese', 'szakmai_rendezvenyek', 'szakmai_tovabbkepzesek', 'szakmai_vizsga_eredmenyek',
  'szervezetfejlesztes', 'szmsz', 'tablelist', 'tanugyi_adatok', 'tanulmanyi_eredmeny', 'tanulo_adatszolgaltatas',
  'tanulo_letszam', 'user', 'versenyek', 'vizsgaeredmenyek',
]);
// Pseudo names handled specially by TableProtectedRoute.
const SPECIAL = new Set(['adat-import', 'data-import', 'table-management', 'logs']);

const withoutComments = text => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const names = (text, re) => [...withoutComments(text).matchAll(re)].map(m => m[1]);
const assertKnown = (where, list) => {
  assert.ok(list.length > 0, `no table names found in ${where}`);
  const unknown = [...new Set(list)].filter(n => !LIVE_TABLES.has(n) && !SPECIAL.has(n));
  assert.deepEqual(unknown, [], `${where} uses table names that do not exist`);
};

test('navigation menu table names exist', () => {
  assertKnown('components/Navigation.jsx', names(read('components/Navigation.jsx'), /tableName:\s*"([^"]+)"/g));
});
test('protected route table names exist', () => {
  assertKnown('router/router.jsx', names(read('router/router.jsx'), /tableName="([^"]+)"/g));
});
test('route -> table map entries exist', () => {
  assertKnown('utils/tableValues.js', names(read('utils/tableValues.js'), /"\/[^"]+":\s*"([^"]+)"/g));
});
test('table lock components use existing table names', () => {
  const walk = dir => readdirSync(dir).flatMap(f => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.jsx') ? [p] : [];
  });
  const found = walk(path.join(src, 'pages')).flatMap(f =>
    names(readFileSync(f, 'utf8'), /<(?:LockStatusIndicator|LockedTableWrapper)\b[^>]*?tableName="([^"]+)"/g));
  assertKnown('LockStatusIndicator / LockedTableWrapper', found);
});
