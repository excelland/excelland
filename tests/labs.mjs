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

const files = [
  "src/core/formula.js",
  "src/i18n/base.js",
  "src/lab/i18n.js",
  "src/content/course-data.js",
  "src/content/lesson-kit.js",
  "src/core/answer.js",
  "src/core/selection.js",
  "src/core/sheet-ops.js",
  "src/lab/engine.js",
  "src/app/render.js",
  "src/content/art/base.js",
  "src/content/art/advanced.js",
  "src/content/chapters/01-core.js",
  "src/content/chapters/02-text.js",
  "src/content/chapters/03-lookup.js",
  "src/content/chapters/04-date.js",
  "src/content/chapters/05-finance.js",
  "src/content/chapters/06-data-analysis.js",
  "src/content/chapters/07-capstones.js",
  "src/content/chapters/08-workbook.js",
  "src/content/chapters/09-data-tools.js",
  "src/content/chapters/10-visuals.js",
  "src/content/chapters/11-advanced-functions.js",
  "src/content/chapters/fixes.js",
  "src/content/banks/practice.js",
];

for (const file of files) {
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

const W = context.window;
const D = W.CourseData;
const Lab = W.ExcelLab;
const I18N = W.I18N;
D.finalizeCourse();

function clone(value) {
  if (value == null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(clone);
  if (Object.prototype.hasOwnProperty.call(value, "zh-CN")) return value;
  const result = {};
  Object.keys(value).forEach((key) => {
    result[key] = clone(value[key]);
  });
  return result;
}

function localize(value, language) {
  if (Array.isArray(value)) return value.map((item) => localize(item, language));
  if (value && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, "zh-CN")) {
    return I18N.text(value, language);
  }
  if (value && typeof value === "object") {
    const result = {};
    Object.keys(value).forEach((key) => {
      result[key] = localize(value[key], language);
    });
    return result;
  }
  return value;
}

function renameSheet(state, from, to) {
  const oldName = state.sheetOrder.find((name) => name.toLowerCase() === String(from).toLowerCase());
  if (!oldName) return;
  state.sheetOrder[state.sheetOrder.indexOf(oldName)] = to;
  state.sheets[to] = state.sheets[oldName];
  delete state.sheets[oldName];
  state.sheetMeta[to] = state.sheetMeta[oldName] || { tabColor: "none", hidden: false };
  delete state.sheetMeta[oldName];
  if (state.activeSheet === oldName) state.activeSheet = to;
}

function solveWorkbook(state, lab, language) {
  const goal = localize(lab.goal, language);
  const operation = String(goal.operation || goal.action || "").toLowerCase();
  if (operation === "add") {
    const name = goal.name || goal.to || goal.newName;
    state.sheets[name] = {};
    state.sheetMeta[name] = { tabColor: "none", hidden: false };
    state.sheetOrder.push(name);
    if (goal.position != null) {
      state.sheetOrder = state.sheetOrder.filter((item) => item !== name);
      state.sheetOrder.splice(Math.max(0, Number(goal.position) - 1), 0, name);
    }
  } else if (operation === "rename") {
    renameSheet(state, goal.from || goal.name, goal.to || goal.newName || goal.name);
  } else if (operation === "copy") {
    const from = state.sheetOrder.find((name) => name.toLowerCase() === String(goal.from || "").toLowerCase());
    const to = goal.to || goal.name || goal.copyName;
    if (from && to) {
      state.sheets[to] = clone(state.sheets[from]);
      state.sheetMeta[to] = clone(state.sheetMeta[from]);
      state.sheetOrder.push(to);
    }
  } else if (operation === "move") {
    const name = goal.sheet || goal.name || goal.from;
    const index = state.sheetOrder.findIndex((item) => item.toLowerCase() === String(name).toLowerCase());
    if (index >= 0 && goal.position != null) {
      const [sheet] = state.sheetOrder.splice(index, 1);
      state.sheetOrder.splice(Math.max(0, Number(goal.position) - 1), 0, sheet);
    }
  } else if (operation === "hide" || operation === "unhide") {
    const name = goal.sheet || goal.name || goal.from;
    const actual = state.sheetOrder.find((item) => item.toLowerCase() === String(name).toLowerCase());
    if (actual) state.sheetMeta[actual].hidden = operation === "hide";
  } else if (operation === "tabcolor") {
    const name = goal.sheet || goal.name || goal.from || state.activeSheet;
    const actual = state.sheetOrder.find((item) => item.toLowerCase() === String(name).toLowerCase());
    if (actual) state.sheetMeta[actual].tabColor = goal.color || goal.tabColor;
  } else if (operation === "freeze") {
    state.freeze = goal.cell || goal.ref || goal.freezeCell || goal.freezeAt;
  } else if (operation === "protect") {
    const scope = String(goal.scope || (goal.workbook === true ? "workbook" : "sheet")).toLowerCase();
    state.protection[scope === "workbook" ? "workbook" : "sheet"] = goal.protected !== false;
    if (goal.protectRange) state.protection.ranges.push(localize(goal.protectRange, language));
  } else if (operation === "print") {
    Object.entries(goal).forEach(([key, value]) => {
      if (key !== "operation") state.config[key] = value;
    });
  } else if (operation === "name" || operation === "namedrange" || operation === "definedname") {
    const name = goal.name || goal.definedName;
    if (name) state.names[name] = { refersTo: goal.refersTo || goal.ref };
    if (goal.formula) state.config.formula = goal.formula;
    if (goal.formulaCell || goal.cell) state.config.formulaCell = goal.formulaCell || goal.cell;
  } else if (operation === "formula" || operation === "multisheet") {
    const sheet = goal.sheet || state.activeSheet;
    const cell = goal.cell || goal.formulaCell;
    if (goal.formula) {
      state.sheets[sheet] = state.sheets[sheet] || {};
      if (cell) state.sheets[sheet][cell] = goal.formula;
      state.config.formula = goal.formula;
      state.config.formulaCell = cell || "";
      state.config.formulaSheet = sheet;
    }
  } else if (operation === "audit") {
    state.config.auditAction = goal.auditAction || goal.action || "precedents";
    state.config.auditCell = goal.auditCell || goal.cell || "";
    if (goal.showFormulas != null) state.config.showFormulas = goal.showFormulas;
  }
  return state;
}

function solvedState(lab, language) {
  const state = Lab.initialState(lab);
  if (lab.kind === "workbook") return solveWorkbook(state, lab, language);
  Object.entries(lab.goal || {}).forEach(([key, value]) => {
    if (key === "operation" || key === "action") return;
    state.config[key] = localize(value, language);
    if (key === "range") state.range = localize(value, language);
  });
  return state;
}

function collectLabs() {
  const labs = [];
  W.COURSE.levels.forEach((level) => {
    level.steps.forEach((step) => {
      if (step.type === "lab") labs.push({ step, level, source: "course" });
    });
  });
  const practice = W.PracticeContent;
  for (let index = 0; index < practice.comprehensive.total; index += 1) {
    const level = practice.comprehensive.levelAt(index);
    level.steps.forEach((step) => {
      if (step.type === "lab") labs.push({ step, level, source: "training" });
    });
  }
  for (let index = 0; index < practice.daily.total; index += 1) {
    const key = practice.daily.shiftDateKey("2026-01-01", index);
    const level = practice.daily.levelForDate(key);
    level.steps.forEach((step) => {
      if (step.type === "lab") labs.push({ step, level, source: "daily" });
    });
  }
  return labs;
}

const labs = collectLabs();
const failures = [];
const languages = ["zh-CN", "en", "ja", "zh-TW"];
let checks = 0;

for (const item of labs) {
  const { step, level, source } = item;
  for (const language of languages) {
    I18N.setLanguage(language);
    try {
      const initial = Lab.initialState(step.lab);
      const initialResult = Lab.validate(step.lab, initial);
      checks += 1;
      if (initialResult.ok) {
        failures.push(source + "/" + step.id + "/" + language + ": starts solved");
      }
      const solved = solvedState(step.lab, language);
      const solvedResult = Lab.validate(step.lab, solved);
      checks += 1;
      if (!solvedResult.ok) {
        failures.push(source + "/" + step.id + "/" + language + ": goal not reachable: " + solvedResult.reason);
      }
      const html = Lab.renderStep(step, level, {
        labState: solved,
        feedback: null,
        hintVisible: false,
        isLastStep: false,
      });
      checks += 1;
      if (typeof html !== "string" || !html.trim()) {
        failures.push(source + "/" + step.id + "/" + language + ": empty render");
      } else if (html.includes("[object Object]") || html.includes("undefined")) {
        failures.push(source + "/" + step.id + "/" + language + ": render contains object/undefined text");
      }
    } catch (error) {
      failures.push(source + "/" + step.id + "/" + language + ": " + error.message);
    }
  }
}

I18N.setLanguage("zh-CN");
console.log(JSON.stringify({
  labs: labs.length,
  checks,
  failures: failures.length,
  failureDetails: failures.slice(0, 80),
}, null, 2));
process.exit(failures.length ? 1 : 0);
