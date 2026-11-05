import test from "node:test";
import assert from "node:assert/strict";
import {
  validateOsztalyAdatszolgaltatasFile,
  validateFileHeaders,
} from "./fileValidation.js";

test("validateOsztalyAdatszolgaltatasFile validates Excel headers matching OSAP format", () => {
  const osapHeaders = [
    "Osztály neve",
    "Intézmény OM azonosító",
    "Intézmény név",
    "Intézmény székhely település név",
    "Munkarend",
    "Évfolyam",
    "Osztály létszám kategória",
  ];

  const result = validateOsztalyAdatszolgaltatasFile(osapHeaders);
  assert.equal(result.isValid, true);
  assert.equal(result.fileType, "osztaly_adatszolgaltatas");
  assert.ok(result.matchedColumns >= 4);
});

test("validateOsztalyAdatszolgaltatasFile rejects unrelated headers", () => {
  const badHeaders = ["Random Header", "Something Else", "Foo"];
  const result = validateOsztalyAdatszolgaltatasFile(badHeaders);
  assert.equal(result.isValid, false);
});

test("validateFileHeaders auto-detects Osztály adatszolgáltatás correctly", () => {
  const osapHeaders = [
    "Osztály neve",
    "Intézmény OM azonosító",
    "Munkarend",
    "Évfolyam",
  ];
  const result = validateFileHeaders(osapHeaders);
  assert.equal(result.isValid, true);
  assert.equal(result.fileType, "osztaly_adatszolgaltatas");
});
