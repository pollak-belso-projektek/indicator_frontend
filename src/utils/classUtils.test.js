import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeClassLabel,
  parseClassLabel,
  compareClasses,
  isNappaliClass,
  getRecordClassName,
  extractNappaliClasses,
} from "./classUtils.js";

test("normalizeClassLabel strips extra whitespace", () => {
  assert.equal(normalizeClassLabel("  9.A  "), "9.A");
  assert.equal(normalizeClassLabel("2/14.   T"), "2/14. T");
  assert.equal(normalizeClassLabel(null), "");
});

test("parseClassLabel parses regular, fraction and other classes", () => {
  assert.deepEqual(parseClassLabel("9.A"), {
    kind: "regular",
    year: 9,
    section: "A",
  });
  assert.deepEqual(parseClassLabel("10.B"), {
    kind: "regular",
    year: 10,
    section: "B",
  });
  assert.deepEqual(parseClassLabel("2/14. T"), {
    kind: "fraction",
    stage: 2,
    year: 14,
    section: "T",
  });
  assert.deepEqual(parseClassLabel("SpecialClass"), {
    kind: "other",
    raw: "SpecialClass",
  });
});

test("compareClasses orders classes naturally by year and section", () => {
  const list = ["13.B", "9.B", "2/14. T", "10.A", "9.A", "11.B", "12.A", "10.B"];
  const sorted = [...list].sort(compareClasses);
  assert.deepEqual(sorted, [
    "9.A",
    "9.B",
    "10.A",
    "10.B",
    "11.B",
    "12.A",
    "13.B",
    "2/14. T",
  ]);
});

test("isNappaliClass identifies daytime education", () => {
  assert.equal(
    isNappaliClass({ Munkarend: "Nappali rendszerű iskolai oktatás" }),
    true
  );
  assert.equal(
    isNappaliClass({ munkarend: "nappali" }),
    true
  );
  assert.equal(
    isNappaliClass({ Munkarend: "Felnőttképzési jogviszony munkarend nélkül" }),
    false
  );
  assert.equal(isNappaliClass({ Munkarend: "-" }), false);
  assert.equal(isNappaliClass(null), false);
});

test("extractNappaliClasses filters only nappali and returns sorted unique list", () => {
  const records = [
    { Osztaly_neve: "9.B", Munkarend: "Nappali rendszerű iskolai oktatás" },
    { Osztaly_neve: "9.A", Munkarend: "Nappali rendszerű iskolai oktatás" },
    { Osztaly_neve: "2/14. T", Munkarend: "Nappali rendszerű iskolai oktatás" },
    { Osztaly_neve: "2/14. FI", Munkarend: "Felnőttképzési jogviszony munkarend nélkül" },
    { Osztaly_neve: "1/13. FE", Munkarend: "Felnőttképzési jogviszony munkarend nélkül" },
    { Osztaly_neve: "1/13. FI", Munkarend: "-" },
    { Osztaly_neve: "10.A", Munkarend: "Nappali rendszerű iskolai oktatás" },
  ];

  const result = extractNappaliClasses(records);
  assert.deepEqual(result, ["9.A", "9.B", "10.A", "2/14. T"]);
});
