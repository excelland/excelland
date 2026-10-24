import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const noop = () => {};
const element = () => ({
  style: {},
  dataset: {},
  classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  setAttribute: noop,
  addEventListener: noop,
  appendChild: noop,
  querySelector: () => null,
  querySelectorAll: () => [],
  focus: noop,
});

const context = {
  console,
  window: {},
  document: {
    createElement: element,
    documentElement: element(),
    body: element(),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: noop,
  },
};
vm.createContext(context);

for (const file of [
  "src/core/formula.js",
  "src/i18n/base.js",
  "src/lab/i18n.js",
  "src/content/course-data.js",
  "src/content/lesson-kit.js",
  "src/lab/engine.js",
]) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) {
    console.log(JSON.stringify({ error: "missing " + file }, null, 2));
    process.exit(1);
  }
  try {
    vm.runInContext(fs.readFileSync(absolute, "utf8"), context, { filename: file });
  } catch (error) {
    console.log(JSON.stringify({ error: "load " + file + ": " + error.message }, null, 2));
    process.exit(1);
  }
}

const Lab = context.window.ExcelLab;
if (!Lab) {
  console.log(JSON.stringify({ error: "window.ExcelLab missing" }, null, 2));
  process.exit(1);
}

const sheet = {
  A1: "Team",
  B1: "Region",
  C1: "Amount",
  D1: "Status",
  A2: "P01",
  B2: "East",
  C2: 1000,
  D2: "Open",
  A3: "P02",
  B3: "West",
  C3: 2000,
  D3: "Closed",
  A4: "P03",
  B4: "East",
  C4: 1500,
  D4: "Open",
  E1: "East",
  E2: "West",
  F1: "Region",
  F2: "East",
};

const specs = [
  { kind: "workbook", mode: "sheets", sheet, goal: { operation: "rename", from: "Sheet1", to: "Sales" } },
  { kind: "workbook", mode: "freeze", sheet, goal: { operation: "freeze", cell: "A2" } },
  { kind: "workbook", mode: "protect", sheet, goal: { operation: "protect", allowEdit: "B2:C4" } },
  { kind: "workbook", mode: "print", sheet, goal: { operation: "print", orientation: "landscape", printArea: "A1:D4" } },
  { kind: "workbook", mode: "namedRange", sheet, goal: { operation: "namedRange", name: "Amounts", refersTo: "C2:C4" } },
  { kind: "workbook", mode: "multiSheet", sheet, goal: { operation: "formula", sheet: "Summary", cell: "B2", formula: "=SUM(Sales!C2:C4)" } },
  { kind: "workbook", mode: "audit", sheet, goal: { operation: "audit", action: "tracePrecedents", cell: "C2" } },
  { kind: "format", mode: "conditional", sheet, goal: { operation: "conditional", range: "C2:C4", ruleType: "cellValue", operator: "greaterThan", value1: 1000 } },
  { kind: "format", mode: "validation", sheet, goal: { operation: "validation", range: "B2:B4", allow: "list", source: "=$E$1:$E$2" } },
  { kind: "format", mode: "numberFormat", sheet, goal: { operation: "numberFormat", range: "C2:C4", format: "currency" } },
  { kind: "format", mode: "tableStyle", sheet, goal: { operation: "tableStyle", range: "A1:D4", style: "green" } },
  { kind: "data", mode: "sort", sheet, goal: { operation: "sort", range: "A1:D4", levels: [{ column: "C", order: "desc" }] } },
  { kind: "data", mode: "advancedFilter", sheet, goal: { operation: "advancedFilter", listRange: "A1:D4", criteriaRange: "F1:F2", action: "copyTo", copyTo: "H1" } },
  { kind: "data", mode: "removeDuplicates", sheet, goal: { operation: "removeDuplicates", range: "A1:D4", columns: ["B"] } },
  { kind: "data", mode: "textToColumns", sheet, goal: { operation: "textToColumns", range: "A2:A4", delimiter: "-", destination: "H2" } },
  { kind: "data", mode: "pasteSpecial", sheet, goal: { operation: "pasteSpecial", sourceRange: "A1:D4", destination: "F8", transpose: true } },
  { kind: "data", mode: "subtotal", sheet, goal: { operation: "subtotal", range: "A1:D4", groupBy: "B", function: "SUM", columns: ["C"] } },
  { kind: "data", mode: "consolidate", sheet, goal: { operation: "consolidate", sources: ["A1:C4"], function: "SUM", destination: "H1" } },
  { kind: "data", mode: "import", sheet, goal: { operation: "import", delimiter: ",", hasHeaders: true, destination: "H1" } },
  { kind: "visual", mode: "chart", sheet, goal: { operation: "chart", chartType: "column", dataRange: "A1:C4", seriesBy: "columns" } },
  { kind: "visual", mode: "sparkline", sheet, goal: { operation: "sparkline", dataRange: "C2:C4", location: "E2", chartType: "line" } },
  { kind: "visual", mode: "pivot", sheet, goal: { operation: "pivot", sourceRange: "A1:D4", destination: "F8", rows: ["B"], values: [{ field: "C", aggregate: "SUM" }] } },
  { kind: "visual", mode: "pivotChart", sheet, goal: { operation: "pivotChart", sourceRange: "A1:D4", destination: "F8", chartType: "column" } },
  { kind: "analysis", mode: "goalSeek", sheet, goal: { operation: "goalSeek", targetCell: "C4", targetValue: 3000, variableCell: "C2" } },
  { kind: "analysis", mode: "dataTable", sheet, goal: { operation: "dataTable", formulaCell: "C4", rowInput: "C2", tableRange: "F1:H4" } },
  { kind: "analysis", mode: "scenario", sheet, goal: { operation: "scenario", changingCells: ["C2"], scenarios: [{ name: "Base", values: [1000] }] } },
  { kind: "analysis", mode: "solver", sheet, goal: { operation: "solver", objectiveCell: "C4", goal: "max", variableCells: ["C2"] } },
  { kind: "analysis", mode: "forecast", sheet, goal: { operation: "forecast", range: "C2:C4", periods: 2 } },
  { kind: "analysis", mode: "array", sheet, goal: { operation: "array", formulaCell: "H2", formula: "=FILTER(A2:C4,C2:C4>1000)" } },
];

const failures = [];
const results = [];
for (const spec of specs) {
  const id = spec.kind + "." + spec.mode;
  try {
    const state = Lab.initialState(spec);
    if (!state || typeof state !== "object") {
      failures.push(id + ": initialState returned " + typeof state);
      continue;
    }
    const result = Lab.validate(spec, state);
    if (!result || typeof result.ok !== "boolean") {
      failures.push(id + ": validate returned " + JSON.stringify(result));
      continue;
    }
    if (typeof Lab.renderStep === "function") {
      const html = Lab.renderStep({
        id: "smoke-" + id,
        type: "lab",
        title: "Smoke",
        lead: "Smoke",
        hint: "Smoke",
        success: "Smoke",
        lab: spec,
      }, { number: 13, kind: "lesson", steps: [] }, { labState: state, feedback: null, hintVisible: false });
      if (typeof html !== "string" || !html.trim()) failures.push(id + ": renderStep returned empty");
    }
    results.push(id + ":" + (result.ok ? "ok" : "needs-work:" + result.reason));
  } catch (error) {
    failures.push(id + ": " + error.message);
  }
}

const localizedCell = { "zh-CN": "名称", en: "Name", ja: "名前", "zh-TW": "名稱" };
const localizedSpec = {
  kind: "format",
  mode: "conditional",
  sheet: { A1: localizedCell, B1: 10 },
  goal: { operation: "conditional", range: "A1:A1", ruleType: "cellValue", operator: "greaterThan", value1: 5 },
};
try {
  const initial = Lab.initialState(localizedSpec);
  const next = Lab.handleAction(
    { type: "set", field: "range", value: "A1:A1" },
    null,
    { lab: localizedSpec, state: initial },
  );
  const cell = next && next.sheets[next.activeSheet] && next.sheets[next.activeSheet].A1;
  if (!cell || cell.en !== "Name" || cell.ja !== "名前" || cell["zh-TW"] !== "名稱") {
    failures.push("localized cell was flattened by lab state cloning");
  }
} catch (error) {
  failures.push("localized cell clone test: " + error.message);
}

console.log(JSON.stringify({ tested: specs.length, failures, results }, null, 2));
process.exit(failures.length ? 1 : 0);
