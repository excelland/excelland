(function () {
  "use strict";

  const D = window.CourseData;
  const L = D.L;
  const Engine = window.FormulaEngine;

  function columnName(number) {
    let value = number;
    let label = "";
    while (value > 0) {
      const remainder = (value - 1) % 26;
      label = String.fromCharCode(65 + remainder) + label;
      value = Math.floor((value - 1) / 26);
    }
    return label;
  }

  function isLocalized(value) {
    return value && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, "zh-CN");
  }

  function plainValue(value) {
    return isLocalized(value) ? value["zh-CN"] : value;
  }

  function plainSheet(sheet) {
    return Object.fromEntries(Object.entries(sheet || {}).map(([ref, value]) => [ref, plainValue(value)]));
  }

  function languageCodes() {
    return window.I18N ? Object.keys(window.I18N.LANGUAGES) : ["zh-CN"];
  }

  const localizedSheetCache = new WeakMap();
  const localizedLiteralsCache = new WeakMap();

  function localizedSheet(sheet, language) {
    if (!sheet || typeof sheet !== "object") return {};
    let byLanguage = localizedSheetCache.get(sheet);
    if (!byLanguage) {
      byLanguage = Object.create(null);
      localizedSheetCache.set(sheet, byLanguage);
    }
    if (byLanguage[language]) return byLanguage[language];
    const localized = Object.fromEntries(Object.entries(sheet).map(([ref, value]) => [
      ref,
      window.I18N ? window.I18N.text(value, language) : plainValue(value),
    ]));
    byLanguage[language] = localized;
    return localized;
  }

  function localizedLiterals(sheet) {
    if (!sheet || typeof sheet !== "object") return new Map();
    if (localizedLiteralsCache.has(sheet)) return localizedLiteralsCache.get(sheet);
    const map = new Map();
    Object.values(sheet || {}).forEach((value) => {
      if (!isLocalized(value)) return;
      const source = String(value["zh-CN"] == null ? "" : value["zh-CN"]);
      if (!source) return;
      const translations = {};
      languageCodes().forEach((language) => {
        if (language === "zh-CN") return;
        const target = window.I18N ? window.I18N.text(value, language) : value[language];
        if (target != null && String(target) !== source) translations[language] = String(target);
      });
      if (Object.keys(translations).length) map.set(source, translations);
    });
    localizedLiteralsCache.set(sheet, map);
    return map;
  }

  function localizeFormula(formula, sheet, language) {
    const text = String(formula == null ? "" : formula);
    if (language === "zh-CN") return text;
    const literals = localizedLiterals(sheet);
    const localized = text.replace(/"((?:[^"]|"")*)"/g, (match, inner) => {
      const source = inner.replace(/""/g, '"');
      const target = literals.get(source) && literals.get(source)[language];
      return target == null ? match : '"' + target.replace(/"/g, '""') + '"';
    });
    if (language !== "zh-TW" || !window.I18N) return localized;
    return localized.replace(/"((?:[^"]|"")*)"/g, (match, inner) => {
      return '"' + window.I18N.convertTraditional(inner.replace(/""/g, '"')).replace(/"/g, '""') + '"';
    });
  }

  function formulaForLanguage(formula, sheet, language) {
    const text = isLocalized(formula)
      ? (formula[language] == null ? formula["zh-CN"] : formula[language])
      : formula;
    return localizeFormula(text, sheet, language);
  }

  function formulaFromHint(hint, language) {
    if (!hint) return "";
    const text = isLocalized(hint) && window.I18N
      ? window.I18N.text(hint, language)
      : String(hint);
    const start = text.indexOf("=");
    return start < 0 ? "" : text.slice(start).trim();
  }

  function sameFormulaShape(candidate, baseline) {
    const candidateTokens = tokenize(candidate);
    const baselineTokens = tokenize(baseline);
    if (!candidateTokens.length || candidateTokens.length !== baselineTokens.length) return false;
    return candidateTokens.every((token, index) => {
      const candidateIsString = /^"(?:[^"]|"")*"$/.test(token);
      const baselineIsString = /^"(?:[^"]|"")*"$/.test(baselineTokens[index]);
      return candidateIsString === baselineIsString && (candidateIsString || token === baselineTokens[index]);
    });
  }

  function compatibleResult(baseline, candidate) {
    if (typeof baseline === "number") return typeof candidate === "number" && Math.abs(baseline - candidate) < 1e-7;
    if (typeof baseline === "boolean") return typeof candidate === "boolean" && baseline === candidate;
    if (typeof baseline === "string") return typeof candidate === "string";
    return candidate === baseline;
  }

  function evaluationPlan(formula, sheet, hint) {
    const resolved = Object.create(null);

    function resolveLanguage(language) {
      if (resolved[language]) return resolved[language];
      const baseline = language === "zh-CN" ? null : resolveLanguage("zh-CN");
      const chosenFormula = formulaForLanguage(formula, sheet, language);
      let chosen = chosenFormula;
      let result = Engine.evaluate(chosen, localizedSheet(sheet, language));
      if (!result.ok) {
        throw new Error("Formula cannot be evaluated in " + language + ": " + chosen + " (" + result.error + ")");
      }
      if (baseline) {
        const hintFormula = formulaFromHint(hint, language);
        if (hintFormula && sameFormulaShape(hintFormula, baseline.formula)) {
          const hintedResult = Engine.evaluate(hintFormula, localizedSheet(sheet, language));
          if (hintedResult.ok && compatibleResult(baseline.expected, hintedResult.value)) {
            chosen = hintFormula;
            result = hintedResult;
          }
        }
      }
      resolved[language] = { formula: chosen, expected: result.value };
      return resolved[language];
    }

    const formulas = window.I18N && window.I18N.lazyLocalized
      ? window.I18N.lazyLocalized((language) => resolveLanguage(language).formula)
      : Object.fromEntries(languageCodes().map((language) => [language, resolveLanguage(language).formula]));
    const expectedByLanguage = window.I18N && window.I18N.lazyLocalized
      ? window.I18N.lazyLocalized((language) => resolveLanguage(language).expected)
      : Object.fromEntries(languageCodes().map((language) => [language, resolveLanguage(language).expected]));
    return { formulas, expectedByLanguage };
  }

  function fill(template, params) {
    const values = params || {};
    const resolve = (language) => {
      const text = isLocalized(template)
        ? (template[language] == null ? template["zh-CN"] : template[language])
        : String(template);
      return String(text).replace(/\{(\w+)\}/g, (match, key) => {
        const value = values[key];
        if (isLocalized(value)) return value[language] == null ? value["zh-CN"] : value[language];
        return value == null ? "" : String(value);
      });
    };
    if (window.I18N && window.I18N.lazyLocalized) return window.I18N.lazyLocalized(resolve);
    return Object.fromEntries(languageCodes().map((language) => [language, resolve(language)]));
  }

  function makeSheet(headers, rows, extras) {
    const sheet = {};
    headers.forEach((header, index) => {
      sheet[columnName(index + 1) + "1"] = header;
    });
    rows.forEach((row, rowIndex) => {
      row.forEach((value, columnIndex) => {
        if (value !== undefined && value !== null) sheet[columnName(columnIndex + 1) + (rowIndex + 2)] = value;
      });
    });
    return Object.assign(sheet, extras || {});
  }

  function evaluate(formula, sheet) {
    const result = Engine.evaluate(formula, plainSheet(sheet));
    if (!result.ok) throw new Error("Formula cannot be evaluated while building course: " + formula + " (" + result.error + ")");
    return result.value;
  }

  function task(spec) {
    const required = Array.isArray(spec.requiredFunctions)
      ? spec.requiredFunctions
      : spec.requiredFunction ? [spec.requiredFunction] : [];
    const targetRange = spec.targetRange ? String(spec.targetRange).toUpperCase().replace(/\s+/g, "") : undefined;
    const rangeStart = targetRange ? targetRange.split(":")[0] : undefined;
    let plan;
    try {
      plan = evaluationPlan(spec.formula, spec.sheet, spec.hint);
    } catch (error) {
      throw new Error(error.message + " [task " + spec.id + "]");
    }
    const expectedByLanguage = spec.expectedByLanguage
      ? Object.fromEntries(languageCodes().map((language) => [
        language,
        spec.expectedByLanguage[language] == null
          ? spec.expectedByLanguage["zh-CN"]
          : spec.expectedByLanguage[language],
      ]))
      : spec.expected === undefined
        ? plan.expectedByLanguage
        : Object.fromEntries(languageCodes().map((language) => [language, spec.expected]));
    const result = {
      id: spec.id,
      sheet: spec.sheet,
      target: rangeStart || spec.target,
      targetRange,
      taskLabel: spec.taskLabel,
      title: spec.title,
      lead: spec.lead,
      hint: spec.hint,
      success: spec.success,
      formulaExample: plan.formulas,
      requiredFunction: required[0],
      requiredFunctions: required,
      mode: spec.mode || "fixed",
      requiredRange: spec.requiredRange,
      sourceRefs: spec.sourceRefs,
      strictRefs: Boolean(spec.strictRefs),
      requiredText: Array.isArray(spec.requiredText) ? spec.requiredText : [],
      operation: spec.operation,
      expectedByLanguage,
    };
    Object.defineProperty(result, "expected", {
      enumerable: true,
      get() { return result.expectedByLanguage["zh-CN"]; },
    });
    return result;
  }

  function operationTask(spec) {
    return {
      id: spec.id,
      operationOnly: true,
      sheet: spec.sheet,
      target: spec.target || "",
      taskLabel: spec.taskLabel,
      title: spec.title,
      lead: spec.lead,
      hint: spec.hint,
      success: spec.success,
      operation: spec.operation,
      auditNote: spec.auditNote,
    };
  }

  function tokenize(formula) {
    const pattern = /"(?:[^"]|"")*"|\$?[A-Z]{1,3}\$?\d{1,5}(?::\$?[A-Z]{1,3}\$?\d{1,5})?|[A-Z][A-Z0-9.]*(?=\()|TRUE|FALSE|>=|<=|<>|\d+(?:\.\d+)?%?|[=(),:+\-*\/&<>^%]/g;
    return String(formula).match(pattern) || [];
  }

  function toneFor(text) {
    if (/^(SUM|AVERAGE|COUNT|COUNTA|MAX|MIN|IF|AND|OR|IFERROR|ROUND|ROUNDUP|ROUNDDOWN|COUNTIF|SUMIF|AVERAGEIF|COUNTIFS|SUMIFS|AVERAGEIFS|LEFT|RIGHT|MID|LEN|TRIM|FIND|SEARCH|CONCATENATE|VLOOKUP|HLOOKUP|INDEX|MATCH|YEAR|MONTH|DAY|DATE|TEXT|PMT|FV|PV|RANK|SUMPRODUCT|SUBTOTAL)$/.test(text)) return "function";
    if (/^\$?[A-Z]{1,3}\$?\d+(?::\$?[A-Z]{1,3}\$?\d+)?$/.test(text)) return "ref";
    if (/^".*"$/.test(text)) return "string";
    if (/^\d/.test(text)) return "number";
    if (/^(TRUE|FALSE)$/.test(text)) return "boolean";
    return "punct";
  }

  function blankKind(text, texts, index) {
    if (/^[A-Z][A-Z0-9.]*$/.test(text) && texts[index + 1] === "(") return "function";
    if (/^\$?[A-Z]{1,3}\$?\d{1,5}:\$?[A-Z]{1,3}\$?\d{1,5}$/.test(text)) return "range";
    if (/^".*"$/.test(text)) return "criteria";
    if (/^\$?[A-Z]{1,3}\$?\d{1,5}$/.test(text)) return "cell";
    if (/^\d/.test(text)) return "number";
    return "value";
  }

  function defaultFillBlanks(texts) {
    const functionIndexes = [];
    const referenceIndexes = [];
    texts.forEach((text, index) => {
      if (toneFor(text) === "function") functionIndexes.push(index);
      if (toneFor(text) === "ref") referenceIndexes.push(index);
    });
    if (functionIndexes.length) {
      return [functionIndexes[0]].concat(referenceIndexes.slice(-2)).slice(0, 3);
    }
    return referenceIndexes.slice(0, 2);
  }

  function builder(spec) {
    const plan = evaluationPlan(spec.formula, spec.sheet, spec.hint);
    const texts = tokenize(plan.formulas["zh-CN"]);
    const compact = texts.join("").replace(/\s+/g, "");
    const expectedCompact = plan.formulas["zh-CN"].replace(/\s+/g, "");
    if (compact !== expectedCompact) {
      throw new Error("Builder tokenizer lost part of formula: " + spec.formula);
    }
    const tokenTextCache = Object.create(null);
    tokenTextCache["zh-CN"] = texts;
    const tokenTextsFor = (language) => {
      if (tokenTextCache[language]) return tokenTextCache[language];
      const localizedTexts = tokenize(plan.formulas[language]);
      if (localizedTexts.length !== texts.length) {
        throw new Error("Builder token count changed in " + language + " [builder " + spec.id + "]");
      }
      tokenTextCache[language] = localizedTexts;
      return localizedTexts;
    };
    const tokens = texts.map((text, index) => ({
      id: spec.id + "-t" + index,
      text,
      textByLanguage: window.I18N && window.I18N.lazyLocalized
        ? window.I18N.lazyLocalized((language) => tokenTextsFor(language)[index], { "zh-CN": text })
        : Object.fromEntries(languageCodes().map((language) => [language, tokenTextsFor(language)[index]])),
      tone: toneFor(text),
    }));
    const correctSequence = tokens.map((token) => token.id);
    (spec.distractors || []).forEach((text, index) => {
      tokens.push({ id: spec.id + "-d" + index, text, tone: "distractor" });
    });
    const step = D.builderStep(
      spec.id,
      spec.title,
      spec.lead,
      tokens,
      correctSequence,
      plan.formulas["zh-CN"],
      spec.success,
      spec.hint,
      spec.expected === undefined ? plan.expectedByLanguage["zh-CN"] : spec.expected
    );
    const fillIndexes = (Array.isArray(spec.fillBlanks) && spec.fillBlanks.length
      ? spec.fillBlanks
      : defaultFillBlanks(texts)).filter((index) => index >= 0 && index < texts.length);
    if (!fillIndexes.length) {
      throw new Error("Builder fill-in has no valid blanks: " + spec.id);
    }
    step.fillBlanks = fillIndexes.map((index) => ({
      tokenIndex: index,
      kind: blankKind(texts[index], texts, index),
      answerByLanguage: window.I18N && window.I18N.lazyLocalized
        ? window.I18N.lazyLocalized((language) => tokenTextsFor(language)[index], { "zh-CN": texts[index] })
        : Object.fromEntries(languageCodes().map((language) => [language, tokenTextsFor(language)[index]])),
    }));
    step.requiredFunctions = texts.filter((text, index) => blankKind(text, texts, index) === "function");
    step.formulaExample = plan.formulas;
    step.exampleFormula = plan.formulas;
    step.sheet = spec.sheet;
    step.expectedByLanguage = spec.expected === undefined
      ? plan.expectedByLanguage
      : Object.fromEntries(languageCodes().map((language) => [language, spec.expected]));
    return step;
  }

  function sheetStep(spec) {
    return D.sheetStep(spec.id, spec.title, spec.lead, spec.sheet, spec.tasks, spec.hint, spec.extra || {});
  }

  function addSheet(name, sheet) {
    window.COURSE.sheets[name] = sheet;
    return sheet;
  }

  window.CurriculumKit = {
    L,
    fill,
    makeSheet,
    evaluate,
    localizeFormula,
    formulaForLanguage,
    plainSheet,
    localizedSheet,
    task,
    operationTask,
    builder,
    sheetStep,
    addSheet,
    columnName,
    tokenize,
    sheets: {},
  };
})();
