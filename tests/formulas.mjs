import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const context = { window: {}, console };
vm.createContext(context);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const formulaFile = path.join(root, "src/core/formula.js");
vm.runInContext(fs.readFileSync(formulaFile, "utf8"), context, { filename: "src/core/formula.js" });
const Engine = context.window.FormulaEngine;
const errors = [];
const warnings = [];
let passed = 0;

function value(formula, sheet = {}) {
  const result = Engine.evaluate(formula, sheet);
  if (!result.ok) throw new Error(formula + " => " + result.error);
  return result.value;
}

function equal(actual, expected, tolerance = 1e-7) {
  if (typeof actual === "number" && typeof expected === "number") {
    return Math.abs(actual - expected) <= tolerance;
  }
  return String(actual) === String(expected);
}

function test(name, formula, expected, sheet = {}, optional = false) {
  try {
    const actual = value(formula, sheet);
    if (!equal(actual, expected)) {
      const message = name + ": expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual);
      (optional ? warnings : errors).push(message);
      return;
    }
    passed += 1;
  } catch (error) {
    (optional ? warnings : errors).push(name + ": " + error.message);
  }
}

test("IFS", '=IFS(1>2,"no",2>1,"yes")', "yes");
test("SWITCH", '=SWITCH(2,1,"one",2,"two","other")', "two");
test("SUBSTITUTE instance", '=SUBSTITUTE("a-b-c","-","/",2)', "a-b/c");
test("REPLACE", '=REPLACE("2026-001",6,3,"042")', "2026-042");
test("VALUE", '=VALUE("1,200")', 1200);
test("PROPER", '=PROPER("hello world")', "Hello World");
test("CONCAT", '=CONCAT("A",1,"B")', "A1B");
test("TEXTJOIN", '=TEXTJOIN("-",TRUE,"A","","B")', "A-B");
test("REPT", '=REPT("ab",3)', "ababab");

const sheet = {
  A1: "ID",
  B1: "Qty",
  C1: "Flag",
  A2: "P01",
  B2: 4,
  C2: 1,
  A3: "P02",
  B3: 9,
  C3: 0,
  A4: "P03",
  B4: 6,
  C4: 1,
  D1: 10,
  D2: 20,
  D3: 30,
  E1: 2,
  E2: 5,
  E3: 3,
};

test("COUNTBLANK", "=COUNTBLANK(A1:A4)", 0, sheet);
test("MEDIAN", "=MEDIAN(D1:D3)", 20, sheet);
test("LARGE", "=LARGE(D1:D3,2)", 20, sheet);
test("SMALL", "=SMALL(D1:D3,2)", 20, sheet);
test("RANK.EQ", "=RANK.EQ(D1,D1:D3)", 3, sheet);
test("CEILING", "=CEILING(4.2,1)", 5);
test("FLOOR", "=FLOOR(4.8,1)", 4);
test("CHOOSE", '=CHOOSE(2,"A","B","C")', "B");
test("OFFSET", "=OFFSET(A1,1,1)", 4, sheet);
test("INDIRECT", '=INDIRECT("B3")', 9, sheet);
test("ROW", "=ROW(A3)", 3);
test("COLUMN", "=COLUMN(C1)", 3);
test("ROWS", "=ROWS(A1:B3)", 3);
test("COLUMNS", "=COLUMNS(A1:C1)", 3);
test("WEEKDAY", '=WEEKDAY("2026-01-01",2)', 4);
test("WEEKNUM", '=WEEKNUM("2026-01-01",2)', 1);
test("EDATE", '=DAY(EDATE("2026-01-31",1))', 28);
test("EOMONTH", '=DAY(EOMONTH("2026-02-10",0))', 28);
test("WORKDAY", '=MONTH(WORKDAY("2026-01-02",5))', 1);
test("NETWORKDAYS", '=NETWORKDAYS("2026-01-01","2026-01-10")', 7);
test("DATEDIF", '=DATEDIF("2026-01-01","2026-03-01","M")', 2);
test("NPV", "=NPV(0.1,100,200)", 256.198347107438);
test("IRR", "=IRR(A1:A3)", 0.1, { A1: -100, A2: 0, A3: 121 });

const dbSheet = {
  A1: "Team",
  B1: "Amount",
  A2: "East",
  B2: 100,
  A3: "West",
  B3: 200,
  A4: "East",
  B4: 300,
  D1: "Team",
  D2: "East",
};
test("DSUM", '=DSUM(A1:B4,"Amount",D1:D2)', 400, dbSheet);
test("DCOUNT", "=DCOUNT(A1:B4,2,D1:D2)", 2, dbSheet);
test("DGET", '=DGET(A1:B4,"Amount",D1:D2)', 100, { ...dbSheet, A4: "West", B4: 300 });
test("XLOOKUP", '=XLOOKUP("P02",A2:A4,B2:B4)', 9, sheet);

test("SEQUENCE via SUM", "=SUM(SEQUENCE(3))", 6, {}, true);
test("FILTER via SUM", "=SUM(FILTER(B2:B4,C2:C4>0))", 10, sheet, true);
test("SORT via SUM", "=SUM(SORT(B2:B4,1,-1))", 19, sheet, true);
test("UNIQUE via COUNT", "=COUNT(UNIQUE(C2:C4))", 2, sheet, true);

console.log(JSON.stringify({
  passed,
  failed: errors.length,
  warnings: warnings.length,
  errors,
  warningDetails: warnings,
}, null, 2));
process.exit(errors.length ? 1 : 0);
