import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const warnings = [];
const stats = {};

const noop = () => {};
const elementStub = () => ({
  style: {},
  dataset: {},
  classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  setAttribute: noop,
  removeAttribute: noop,
  addEventListener: noop,
  removeEventListener: noop,
  appendChild: noop,
  querySelector: () => null,
  querySelectorAll: () => [],
  focus: noop,
  scrollIntoView: noop,
  getBoundingClientRect: () => ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }),
});

const context = {
  console,
  window: {},
  document: {
    readyState: "complete",
    body: elementStub(),
    documentElement: elementStub(),
    createElement: elementStub,
    createTextNode: elementStub,
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    addEventListener: noop,
  },
  localStorage: {
    getItem: () => null,
    setItem: noop,
    removeItem: noop,
  },
  navigator: { language: "zh-CN" },
  setTimeout: (callback) => callback(),
  clearTimeout: noop,
  requestAnimationFrame: (callback) => callback(),
  requestIdleCallback: (callback) => callback(),
};
vm.createContext(context);

function load(file) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) {
    errors.push("Missing file: " + file);
    return false;
  }
  try {
    vm.runInContext(fs.readFileSync(absolute, "utf8"), context, { filename: file });
    return true;
  } catch (error) {
    errors.push("Load failed: " + file + " :: " + error.message);
    return false;
  }
}

const baseFiles = [
  "src/core/formula.js",
  "src/i18n/base.js",
  "src/lab/i18n.js",
  "src/app/sound.js",
  "src/content/course-data.js",
  "src/content/lesson-kit.js",
  "src/core/answer.js",
  "src/core/selection.js",
  "src/core/sheet-ops.js",
  "src/lab/engine.js",
  "src/app/render.js",
  "src/content/art/base.js",
  "src/content/art/advanced.js",
];

for (const file of baseFiles) load(file);

const curriculumFiles = [
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
];

for (const file of curriculumFiles) load(file);
load("src/content/banks/practice.js");
load("src/content/chapters/fixes.js");

const W = context.window;
const D = W.CourseData;
const C = W.COURSE;
const I18N = W.I18N;
const Engine = W.FormulaEngine;
const Lab = W.ExcelLab;

if (D) D.finalizeCourse();

const languages = ["zh-CN", "en", "ja", "zh-TW"];
const validStepTypes = new Set(["learn", "concept", "choice", "challenge", "builder", "sheet", "lab"]);
const validLabKinds = new Set(["workbook", "format", "data", "visual", "analysis"]);
const validLabModes = new Set([
  "sheets", "freeze", "protect", "print", "namedRange", "multiSheet", "audit",
  "conditional", "validation", "numberFormat", "tableStyle",
  "sort", "advancedFilter", "removeDuplicates", "textToColumns", "pasteSpecial",
  "subtotal", "consolidate", "import",
  "chart", "sparkline", "pivot", "pivotChart",
  "goalSeek", "dataTable", "scenario", "solver", "forecast", "array",
]);

function localizedObject(value) {
  return value && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, "zh-CN");
}

function localizedText(value, language) {
  if (!localizedObject(value)) return String(value == null ? "" : value);
  return String(value[language] == null ? value["zh-CN"] : value[language]);
}

function walk(value, visitor, seen = new Set()) {
  if (value == null || typeof value !== "object" || seen.has(value)) return;
  seen.add(value);
  visitor(value);
  if (Array.isArray(value)) value.forEach((item) => walk(item, visitor, seen));
  else Object.values(value).forEach((item) => walk(item, visitor, seen));
}

function checkLocalization(owner, label) {
  walk(owner, (value) => {
    if (!localizedObject(value)) return;
    for (const language of languages) {
      if (value[language] == null) {
        errors.push(label + " missing " + language);
        return;
      }
      if (typeof value[language] === "string" && !value[language].trim()) {
        errors.push(label + " has empty " + language);
        return;
      }
    }
  });
}

function checkNoForbidden(source, file) {
  const forbidden = [
    new RegExp("\\b" + String.fromCharCode(78, 67, 69, 69) + "\\b", "i"),
    new RegExp("\\b" + String.fromCharCode(78, 67, 82, 69) + "\\b", "i"),
    new RegExp("\\b" + String.fromCharCode(84, 97, 105, 119, 97, 110) + "\\b", "i"),
    new RegExp("\\b" + ["Hong", "Kong"].join("\\s*") + "\\b", "i"),
    new RegExp(String.fromCharCode(21488, 28286)),
    new RegExp(String.fromCharCode(39321, 28207)),
  ];
  forbidden.forEach((pattern) => {
    if (pattern.test(source)) errors.push(file + " contains forbidden branding/place wording: " + pattern);
  });
}

function checkNoEmoji(source, file) {
  let emoji;
  try {
    emoji = /\p{Extended_Pictographic}/u;
  } catch {
    return;
  }
  if (emoji.test(source)) errors.push(file + " contains a character that may render as emoji");
}

for (const file of [
  "src/content/chapters/08-workbook.js",
  "src/content/chapters/09-data-tools.js",
  "src/content/chapters/10-visuals.js",
  "src/content/chapters/11-advanced-functions.js",
  "src/content/banks/practice.js",
  "src/lab/engine.js",
  "src/lab/i18n.js",
]) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) continue;
  const source = fs.readFileSync(absolute, "utf8");
  checkNoForbidden(source, file);
  checkNoEmoji(source, file);
}

if (!D || !C) {
  errors.push("CourseData or COURSE did not initialize");
} else {
  const chapters = C.chapters || [];
  const levels = C.levels || [];
  const steps = levels.flatMap((level) => level.steps || []);
  stats.chapters = chapters.length;
  stats.levels = levels.length;
  stats.steps = steps.length;
  stats.tasks = steps.reduce((total, step) => total + (Array.isArray(step.tasks) ? step.tasks.length : 0), 0);

  if (chapters.length < 20) errors.push("Expected at least 20 chapters, found " + chapters.length);
  if (levels.length < 60) errors.push("Expected at least 60 levels, found " + levels.length);
  if (steps.length < 200) errors.push("Expected at least 200 steps, found " + steps.length);

  const chapterIds = new Set();
  const levelIds = new Set();
  const stepIds = new Set();
  chapters.forEach((chapter) => {
    if (!chapter.id || chapterIds.has(chapter.id)) errors.push("Duplicate or missing chapter id: " + chapter.id);
    chapterIds.add(chapter.id);
    if (!Array.isArray(chapter.levels) || !chapter.levels.length) errors.push("Chapter has no levels: " + chapter.id);
    (chapter.levels || []).forEach((level) => {
      if (!level.id || levelIds.has(level.id)) errors.push("Duplicate or missing level id: " + level.id);
      levelIds.add(level.id);
      if (!Array.isArray(level.steps) || !level.steps.length) errors.push("Level has no steps: " + level.id);
      (level.steps || []).forEach((step) => {
        if (!step.id || stepIds.has(step.id)) errors.push("Duplicate or missing step id: " + step.id);
        stepIds.add(step.id);
      });
    });
  });

  let labCount = 0;
  let formulaTaskCount = 0;
  steps.forEach((step) => {
    if (!validStepTypes.has(step.type)) errors.push("Unknown step type " + step.type + " in " + step.id);
    checkLocalization(step, "Step " + step.id);
    if (step.type === "lab") {
      labCount += 1;
      const lab = step.lab;
      if (!lab || typeof lab !== "object") {
        errors.push("Lab step has no lab spec: " + step.id);
        return;
      }
      if (!validLabKinds.has(lab.kind)) errors.push("Lab step has unknown kind: " + step.id + " / " + lab.kind);
      if (!validLabModes.has(lab.mode)) errors.push("Lab step has unknown mode: " + step.id + " / " + lab.mode);
      if (!lab.goal || typeof lab.goal !== "object") errors.push("Lab step has no goal: " + step.id);
      if (!lab.sheet && !lab.workbook) errors.push("Lab step has no sheet/workbook data: " + step.id);
      if (Lab) {
        try {
          const state = Lab.initialState(lab);
          if (!state || typeof state !== "object") errors.push("Lab initialState failed: " + step.id);
          const result = Lab.validate(lab, state);
          if (!result || typeof result.ok !== "boolean") errors.push("Lab validate has invalid result: " + step.id);
          if (lab.kind !== "workbook" && state.config) {
            const configKeys = new Set(Object.keys(state.config));
            const specialGoalKeys = new Set(["operation", "action", "kind", "mode"]);
            Object.keys(lab.goal || {}).forEach((key) => {
              if (!specialGoalKeys.has(key) && !configKeys.has(key)) {
                errors.push("Lab goal field is not an engine config key: " + step.id + " / " + key);
              }
            });
          }
        } catch (error) {
          errors.push("Lab engine threw on " + step.id + ": " + error.message);
        }
      }
    }
    if (step.type === "learn" || step.type === "concept") {
      if (!Array.isArray(step.points) || !step.points.length) errors.push("Teach step has no points: " + step.id);
      if (!step.example) errors.push("Teach step has no example: " + step.id);
    }
    if (step.type === "choice" || step.type === "challenge") {
      if (!Array.isArray(step.options) || !step.options.length) errors.push("Choice step has no options: " + step.id);
      (step.options || []).forEach((option) => {
        const correct = step.type === "challenge" ? option.correct === true : option.correct === true;
        if (typeof correct !== "boolean") errors.push("Option missing correct flag: " + step.id + " / " + option.id);
      });
    }
    if (step.type === "builder") {
      if (!Array.isArray(step.tokens) || !step.tokens.length) errors.push("Builder step has no tokens: " + step.id);
      if (!Array.isArray(step.correctSequence) || !step.correctSequence.length) errors.push("Builder step has no answer: " + step.id);
      if (!Array.isArray(step.fillBlanks) || !step.fillBlanks.length) errors.push("Builder step has no blanks: " + step.id);
    }
    if (step.type === "sheet") {
      if (!Array.isArray(step.tasks) || !step.tasks.length) errors.push("Sheet step has no tasks: " + step.id);
      (step.tasks || []).forEach((task) => {
        checkLocalization(task, "Task " + task.id);
        if (!task.id) errors.push("Task missing id in " + step.id);
        if (task.operationOnly) {
          if (!task.operation) errors.push("Operation task missing operation: " + task.id);
          return;
        }
        formulaTaskCount += 1;
        if (!task.formulaExample) errors.push("Formula task missing formulaExample: " + task.id);
        if (task.targetRange && !/^[A-Z]+\d+:[A-Z]+\d+$/.test(String(task.targetRange).replace(/\$/g, ""))) {
          errors.push("Task has invalid targetRange: " + task.id + " / " + task.targetRange);
        }
        if (!task.targetRange && !/^[A-Z]+\d+$/.test(String(task.target || "").replace(/\$/g, ""))) {
          errors.push("Task has invalid target: " + task.id + " / " + task.target);
        }
        for (const language of languages) {
          try {
            void task.expectedByLanguage[language];
          } catch (error) {
            errors.push("Task does not evaluate in " + language + ": " + task.id + " :: " + error.message);
          }
        }
      });
    }
  });
  stats.labSteps = labCount;
  stats.formulaTasks = formulaTaskCount;

  const newChapterIds = chapters.filter((chapter) => !/^ch(?:0[1-9]|1[0-2])-/.test(chapter.id));
  stats.newChapters = newChapterIds.length;
  stats.newLevels = newChapterIds.reduce((total, chapter) => total + chapter.levels.length, 0);
  stats.newSteps = newChapterIds.reduce(
    (total, chapter) => total + chapter.levels.reduce((sum, level) => sum + level.steps.length, 0),
    0,
  );
  if (stats.newChapters < 8) errors.push("Expected at least 8 new chapters, found " + stats.newChapters);
  if (stats.newLevels < 24) errors.push("Expected at least 24 new levels, found " + stats.newLevels);
  if (stats.newSteps < 60) errors.push("Expected at least 60 new steps, found " + stats.newSteps);

  if (W.ChapterArt) {
    try {
      const oldArt = W.ChapterArt.svg(12);
      const newArt = W.ChapterArt.svg(13);
      if (!newArt || newArt === oldArt) errors.push("Advanced chapter art did not replace the chapter-12 fallback");
    } catch (error) {
      errors.push("Chapter art failed: " + error.message);
    }
  }

  const requiredFunctions = [
    "IFS", "SWITCH", "SUBSTITUTE", "REPLACE", "VALUE", "PROPER", "CONCAT",
    "TEXTJOIN", "REPT", "COUNTBLANK", "MEDIAN", "LARGE", "SMALL", "RANK.EQ",
    "CEILING", "FLOOR", "RAND", "RANDBETWEEN", "CHOOSE", "OFFSET", "INDIRECT",
    "ROW", "COLUMN", "ROWS", "COLUMNS", "WEEKDAY", "WEEKNUM", "EDATE",
    "EOMONTH", "WORKDAY", "NETWORKDAYS", "DATEDIF", "NPV", "IRR", "DSUM",
    "DCOUNT", "DGET", "GETPIVOTDATA", "XLOOKUP", "UNIQUE", "SORT", "FILTER",
    "SEQUENCE", "POWER", "SQRT", "NOT",
  ];
  const metadataNames = new Set((C.formulaFunctions || []).map((item) => item.name));
  const missingMetadata = requiredFunctions.filter((name) => !metadataNames.has(name));
  if (missingMetadata.length) errors.push("Formula metadata missing: " + missingMetadata.join(", "));
  if ((C.formulaFunctions || []).length < 80) {
    errors.push("Expected at least 80 fx-menu functions, found " + (C.formulaFunctions || []).length);
  }
}

if (!W.PracticeContent) {
  errors.push("PracticeContent did not initialize");
} else {
  const practice = W.PracticeContent;
  stats.trainingTotal = practice.comprehensive.total;
  stats.dailyTotal = practice.daily.total;
  if (practice.comprehensive.total !== 50) errors.push("Comprehensive total must be 50");
  if (practice.daily.total !== 183) errors.push("Daily total must be 183");

  const trainingLevels = [];
  for (let index = 0; index < practice.comprehensive.total; index += 1) {
    try {
      trainingLevels.push(practice.comprehensive.levelAt(index));
    } catch (error) {
      errors.push("Comprehensive level " + index + " failed: " + error.message);
    }
  }
  const trainingIds = new Set(trainingLevels.map((level) => level.id));
  const trainingTaskIds = new Set();
  trainingLevels.forEach((level) => {
    if (level.steps.length < 4 || level.steps.length > 6) {
      errors.push("Comprehensive set " + level.id + " has " + level.steps.length + " steps, expected 4-6");
    }
    checkLocalization(level, "Training level " + level.id);
    level.steps.forEach((step) => {
      (step.tasks || []).forEach((task) => {
        if (trainingTaskIds.has(task.id)) errors.push("Duplicate training task id: " + task.id);
        trainingTaskIds.add(task.id);
      });
    });
  });

  const dailyLevels = [];
  const seenBankIndexes = new Set();
  for (let index = 0; index < 183; index += 1) {
    const key = practice.daily.shiftDateKey("2026-01-01", index);
    try {
      const level = practice.daily.levelForDate(key);
      dailyLevels.push(level);
      seenBankIndexes.add(level.dailyBankIndex);
      if (level.steps.length < 3 || level.steps.length > 4) {
        errors.push("Daily set " + level.id + " has " + level.steps.length + " steps, expected 3-4");
      }
      checkLocalization(level, "Daily level " + level.id);
    } catch (error) {
      errors.push("Daily date " + key + " failed: " + error.message);
    }
  }
  if (seenBankIndexes.size !== 183) errors.push("Daily bank repeat count is " + seenBankIndexes.size);
  const dailyTaskIds = new Set();
  dailyLevels.forEach((level) => {
    (level.steps || []).forEach((step) => {
      (step.tasks || []).forEach((task) => {
        if (dailyTaskIds.has(task.id)) errors.push("Duplicate daily task id: " + task.id);
        dailyTaskIds.add(task.id);
      });
    });
  });
  stats.trainingTasks = trainingTaskIds.size;
  stats.dailyTasks = dailyTaskIds.size;
  stats.dailyUniqueBank = seenBankIndexes.size;

  const overlap = Array.from(trainingIds).filter((id) => dailyLevels.some((level) => level.id === id));
  if (overlap.length) errors.push("Training and daily level IDs overlap: " + overlap.slice(0, 5).join(", "));
}

stats.errors = errors.length;
stats.warnings = warnings.length;
console.log(JSON.stringify({ stats, errors, warnings }, null, 2));
process.exit(errors.length ? 1 : 0);
