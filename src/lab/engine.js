(function (root) {
  "use strict";

  const Engine = root.FormulaEngine;
  const PALETTE = ["#58cc02", "#1cb0f6", "#ffc800", "#ff8b3d", "#8d6ce8", "#2d9c78"];
  const PAGE_SIZES = {
    A4: { width: 210, height: 297 },
    A3: { width: 297, height: 420 },
    Letter: { width: 216, height: 279 },
    Legal: { width: 216, height: 356 },
  };

  function tr(key, params) {
    return root.I18N ? root.I18N.t(key, params) : key;
  }

  function lt(value) {
    return root.I18N ? root.I18N.text(value) : String(value == null ? "" : value);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[character]));
  }

  const LANGUAGE_KEYS = ["zh-CN", "en", "ja", "zh-TW"];

  function isLocalizedValue(value) {
    return Boolean(value && typeof value === "object" && !Array.isArray(value) &&
      LANGUAGE_KEYS.some((language) => Object.prototype.hasOwnProperty.call(value, language)));
  }

  function localizedCellText(value) {
    if (value == null) return "";
    if (isLocalizedValue(value)) return lt(value);
    return String(value);
  }

  function localizeGoalValue(value) {
    if (Array.isArray(value)) return value.map((item) => localizeGoalValue(item));
    if (!value || typeof value !== "object") return value;
    if (isLocalizedValue(value)) {
      if (root.I18N && typeof root.I18N.text === "function") return root.I18N.text(value);
      return value["zh-CN"] != null ? value["zh-CN"] : value.en != null ? value.en : value.ja != null ? value.ja : value["zh-TW"];
    }
    const localized = {};
    Object.entries(value).forEach(([key, item]) => {
      localized[key] = localizeGoalValue(item);
    });
    return localized;
  }

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

  function optionText(value) {
    if (value == null || value === "") return tr("lab.none");
    if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
    const key = "lab.opt." + String(value);
    const translated = tr(key);
    return translated === key ? String(value) : translated;
  }

  function colToNumber(letters) {
    return String(letters || "").toUpperCase().split("").reduce((total, character) => (
      total * 26 + character.charCodeAt(0) - 64
    ), 0);
  }

  function numberToCol(value) {
    let number = Number(value);
    let result = "";
    while (number > 0) {
      const remainder = (number - 1) % 26;
      result = String.fromCharCode(65 + remainder) + result;
      number = Math.floor((number - 1) / 26);
    }
    return result || "A";
  }

  function normalizeRef(ref) {
    return String(ref == null ? "" : ref).trim().replace(/\$/g, "").toUpperCase();
  }

  function parseRange(range) {
    const normalized = normalizeRef(range);
    const match = /^([A-Z]{1,3})(\d{1,7})(?::([A-Z]{1,3})(\d{1,7}))?$/.exec(normalized);
    if (!match) return null;
    const firstCol = colToNumber(match[1]);
    const firstRow = Number(match[2]);
    const lastCol = match[3] ? colToNumber(match[3]) : firstCol;
    const lastRow = match[4] ? Number(match[4]) : firstRow;
    const left = Math.min(firstCol, lastCol);
    const right = Math.max(firstCol, lastCol);
    const top = Math.min(firstRow, lastRow);
    const bottom = Math.max(firstRow, lastRow);
    return {
      start: numberToCol(left) + top,
      end: numberToCol(right) + bottom,
      left,
      right,
      top,
      bottom,
      rows: bottom - top + 1,
      cols: right - left + 1,
    };
  }

  function rangeReference(range) {
    const parsed = parseRange(range);
    if (!parsed) return normalizeRef(range);
    return parsed.start === parsed.end ? parsed.start : parsed.start + ":" + parsed.end;
  }

  function inRange(ref, range) {
    const parsedRange = typeof range === "string" ? parseRange(range) : range;
    const parsedRef = parseRange(ref);
    if (!parsedRange || !parsedRef) return false;
    const cell = parsedRef;
    return cell.left >= parsedRange.left && cell.right <= parsedRange.right &&
      cell.top >= parsedRange.top && cell.bottom <= parsedRange.bottom;
  }

  function cloneSheet(cells) {
    const result = {};
    Object.entries(cells || {}).forEach(([ref, value]) => {
      const normalized = normalizeRef(ref);
      if (normalized) result[normalized] = value;
    });
    return result;
  }

  function firstSheetName(spec) {
    if (spec && spec.workbook) {
      const active = spec.workbook.active;
      if (active) return String(active);
      const first = Array.isArray(spec.workbook.sheets) ? spec.workbook.sheets[0] : null;
      if (first) return String(first.name || "Sheet1");
    }
    const configured = spec && (spec.sheetName || (spec.options && spec.options.sheetName));
    return configured ? lt(configured) : "Sheet1";
  }

  function baseConfig() {
    return {
      operation: "",
      range: "",
      selection: "",
      // Workbook and print
      newName: "",
      addSheetName: "",
      copyName: "",
      addPosition: "",
      tabColor: "none",
      freezeCell: "",
      protectScope: "sheet",
      protectRange: "",
      password: "",
      orientation: "portrait",
      paper: "A4",
      margins: "normal",
      printArea: "",
      printTitles: "",
      scale: 100,
      gridlines: false,
      header: "",
      footer: "",
      definedName: "",
      refersTo: "",
      formulaSheet: "",
      formulaCell: "",
      formula: "",
      auditAction: "precedents",
      auditCell: "",
      showFormulas: false,
      // Format
      ruleType: "cellValue",
      operator: "greaterThan",
      value1: "",
      value2: "",
      fill: "#C6EFCE",
      font: "#006100",
      minColor: "#F8696B",
      midColor: "#FFEB84",
      maxColor: "#63BE7B",
      iconStyle: "3TrafficLights",
      reverse: false,
      allow: "list",
      minimum: "",
      maximum: "",
      source: "",
      inputTitle: "",
      inputMessage: "",
      errorStyle: "stop",
      errorTitle: "",
      errorMessage: "",
      format: "General",
      decimals: 2,
      thousands: false,
      customFormat: "",
      style: "TableStyleMedium2",
      tableStyle: "TableStyleMedium2",
      numberFormat: "General",
      headerRow: true,
      totalRow: false,
      bandedRows: true,
      bandedColumns: false,
      firstColumn: false,
      lastColumn: false,
      // Data
      hasHeaders: true,
      levels: [{ column: "", order: "asc" }],
      listRange: "",
      criteriaRange: "",
      action: "filterInPlace",
      copyTo: "",
      columnsToCheck: [],
      keepFirst: true,
      delimiter: ",",
      dataType: "delimited",
      targetColumn: "",
      sourceRange: "",
      destination: "",
      pasteOperation: "all",
      skipBlanks: false,
      transpose: false,
      groupBy: "",
      functionNumber: 9,
      subtotalColumns: [],
      ranges: "",
      useTopRow: true,
      useLeftColumn: true,
      importText: "",
      importSource: "csv",
      encoding: "UTF-8",
      // Visual
      chartType: "column",
      dataRange: "",
      seriesBy: "columns",
      title: "",
      showLegend: true,
      dataLabels: false,
      trendline: false,
      secondaryAxis: false,
      sparklineType: "line",
      sparklineRange: "",
      rows: [],
      columns: [],
      values: [],
      filters: [],
      showAs: "normal",
      groupDate: "none",
      slicer: false,
      refresh: false,
      calculatedField: { name: "", formula: "" },
      pivotRowField: "",
      pivotColumnField: "",
      pivotValueField: "",
      pivotAggregate: "SUM",
      pivotFilterField: "",
      pivotFilterValue: "",
      // Analysis
      targetCell: "",
      targetValue: "",
      variableCell: "",
      rowInputCell: "",
      columnInputCell: "",
      resultCell: "",
      inputCell: "",
      objectiveCell: "",
      objective: "max",
      variableCells: "",
      constraints: "",
      periods: 6,
      seasonality: false,
      forecastRange: "",
      confidence: 95,
      scenarioName: "",
      changingCell: "",
      scenarioValue: "",
      scenarios: [],
      arrayFormula: "",
      selectedScenario: "",
    };
  }

  function initialState(labSpec) {
    const spec = labSpec && typeof labSpec === "object" ? labSpec : {};
    const config = baseConfig();
    if (spec.options && spec.options.defaults && typeof spec.options.defaults === "object") {
      Object.assign(config, clone(spec.options.defaults));
    }
    if (spec.options && spec.options.operation) config.operation = String(spec.options.operation);

    const sheets = {};
    const sheetMeta = {};
    let sheetOrder = [];
    let activeSheet = "";
    if (spec.workbook) {
      const sourceSheets = Array.isArray(spec.workbook.sheets) ? spec.workbook.sheets : [];
      sourceSheets.forEach((sheet, index) => {
        const name = String(sheet && sheet.name != null ? sheet.name : "Sheet" + (index + 1));
        if (Object.prototype.hasOwnProperty.call(sheets, name)) return;
        sheets[name] = cloneSheet(sheet.cells || {});
        sheetMeta[name] = {
          tabColor: sheet.tabColor || "none",
          hidden: Boolean(sheet.hidden),
        };
        sheetOrder.push(name);
      });
      if (!sheetOrder.length) {
        const name = firstSheetName(spec);
        sheets[name] = cloneSheet(spec.sheet || {});
        sheetMeta[name] = { tabColor: "none", hidden: false };
        sheetOrder = [name];
      }
      activeSheet = spec.workbook.active && sheets[spec.workbook.active]
        ? String(spec.workbook.active)
        : sheetOrder[0];
    } else {
      const name = firstSheetName(spec);
      sheets[name] = cloneSheet(spec.sheet || {});
      sheetMeta[name] = { tabColor: "none", hidden: false };
      sheetOrder = [name];
      activeSheet = name;
    }

    const names = {};
    const seededNames = spec.namedRanges || spec.names || {};
    Object.entries(seededNames).forEach(([name, entry]) => {
      names[name] = typeof entry === "string" ? entry : clone(entry);
    });

    const sourceRanges = spec.ranges && typeof spec.ranges === "object" ? Object.values(spec.ranges) : [];
    const initialRange = sourceRanges.find((value) => typeof value === "string" && parseRange(value));

    return {
      activeSheet,
      sheetOrder,
      sheets,
      sheetMeta,
      range: initialRange ? rangeReference(initialRange) : "",
      selection: null,
      config,
      applied: false,
      result: null,
      history: [],
      names,
      freeze: "",
      protection: { sheet: false, workbook: false, ranges: [] },
      print: {},
      audit: {},
    };
  }

  function getPath(object, path) {
    if (!object || !path) return undefined;
    return String(path).split(".").reduce((value, key) => (
      value == null ? undefined : value[key]
    ), object);
  }

  function setPath(object, path, value) {
    const keys = String(path || "").split(".").filter(Boolean);
    if (!keys.length) return;
    let target = object;
    keys.slice(0, -1).forEach((key) => {
      if (target[key] == null || typeof target[key] !== "object") target[key] = {};
      target = target[key];
    });
    target[keys[keys.length - 1]] = value;
  }

  function actionName(type) {
    return String(type || "").replace(/^lab-/, "").replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
  }

  function normalizeName(name) {
    return String(name == null ? "" : name).trim();
  }

  function sheetIndex(state, name) {
    const target = String(name || "").toLowerCase();
    return state.sheetOrder.findIndex((sheet) => sheet.toLowerCase() === target);
  }

  function actualSheetName(state, name) {
    const index = sheetIndex(state, name);
    return index >= 0 ? state.sheetOrder[index] : "";
  }

  function pushHistory(state, entry) {
    state.history = Array.isArray(state.history) ? state.history : [];
    state.history.push(Object.assign({ at: state.history.length + 1 }, entry));
    if (state.history.length > 40) state.history.shift();
  }

  function coerceValue(current, value, action) {
    if (action && action.valueType === "list") {
      if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
      return String(value == null ? "" : value).split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);
    }
    if (action && action.valueType === "number") {
      const number = Number(value);
      return Number.isFinite(number) ? number : "";
    }
    if (action && action.valueType === "boolean") {
      return value === true || value === "true" || value === "1";
    }
    if (typeof current === "boolean") {
      return value === true || value === "true" || value === "1" || value === "on";
    }
    if (typeof current === "number") {
      if (value === "" || value == null) return "";
      const number = Number(value);
      return Number.isFinite(number) ? number : current;
    }
    return value;
  }

  function ensureStateShape(state, spec) {
    const base = initialState(spec || {});
    const next = state && typeof state === "object" ? state : base;
    ["sheetOrder", "sheets", "sheetMeta", "config", "history", "names"].forEach((key) => {
      if (next[key] == null) next[key] = clone(base[key]);
    });
    next.config = Object.assign(baseConfig(), next.config || {});
    next.config.calculatedField = Object.assign(
      { name: "", formula: "" },
      next.config.calculatedField || {}
    );
    if (!next.activeSheet || !next.sheets[next.activeSheet]) {
      next.activeSheet = next.sheetOrder.find((name) => next.sheets[name]) || Object.keys(next.sheets)[0] || base.activeSheet;
    }
    if (!next.sheetOrder.length) next.sheetOrder = [next.activeSheet];
    next.protection = Object.assign({ sheet: false, workbook: false, ranges: [] }, next.protection || {});
    next.audit = next.audit || {};
    next.print = next.print || {};
    next.result = next.result == null ? null : next.result;
    next.history = Array.isArray(next.history) ? next.history : [];
    return next;
  }

  function clearResult(state) {
    state.applied = false;
    state.result = null;
  }

  function handleAction(action, element, context) {
    const sourceAction = typeof action === "string" ? { type: action } : (action || {});
    const type = actionName(sourceAction.type || sourceAction.action || (element && element.dataset.action) || "");
    if (!type) return null;
    const spec = (context && (context.lab || context.labSpec)) ||
      (context && context.step && context.step.lab) || {};
    const current = (context && (context.state || context.labState)) || null;
    if (!current) return null;
    const state = ensureStateShape(clone(current), spec);
    const data = Object.assign({}, element ? element.dataset : {}, sourceAction);
    const config = state.config;

    if (type === "set" || type === "setting") {
      const field = data.field || data.path || (element && element.dataset.labField);
      if (!field) return null;
      const path = String(field).replace(/^config\./, "");
      const currentValue = getPath(config, path);
      const value = coerceValue(currentValue, Object.prototype.hasOwnProperty.call(sourceAction, "value")
        ? sourceAction.value
        : data.value, data);
      setPath(config, path, value);
      if (path === "range" || path === "selectionRange") state.range = rangeReference(value);
      if (path === "formula" && !config.arrayFormula && spec.kind === "analysis") config.arrayFormula = value;
      if (path === "arrayFormula") config.formula = value;
      if (path === "style") config.tableStyle = value;
      if (path === "tableStyle") {
        config.style = value;
        config.tableStyle = value;
      }
      if (path === "format") config.numberFormat = value;
      if (path === "numberFormat") {
        config.format = value;
        config.numberFormat = value;
      }
      if (path === "sparklineRange") {
        config.dataRange = value;
        config.type = value && config.sparklineType;
      }
      if (path === "sparklineType") config.type = value;
      if (path === "forecastRange") config.dataRange = value;
      if (path === "pasteOperation") config.pasteType = value;
      if (path === "ranges") config.sourceRanges = value;
      if (path === "objective") config.maxMin = value;
      clearResult(state);
      pushHistory(state, { type: "set", field: path });
      return state;
    }

    if (type === "activateSheet") {
      const name = actualSheetName(state, data.sheet || data.name);
      if (!name) return null;
      state.activeSheet = name;
      clearResult(state);
      return state;
    }

    if (type === "renameSheet" || type === "rename") {
      const from = actualSheetName(state, data.from || state.activeSheet);
      const to = normalizeName(data.to || config.newName);
      if (!from || !to || from === to || actualSheetName(state, to)) return null;
      const index = state.sheetOrder.indexOf(from);
      state.sheetOrder[index] = to;
      state.sheets[to] = state.sheets[from];
      delete state.sheets[from];
      state.sheetMeta[to] = state.sheetMeta[from] || { tabColor: "none", hidden: false };
      delete state.sheetMeta[from];
      if (state.activeSheet === from) state.activeSheet = to;
      Object.keys(state.names).forEach((name) => {
        const entry = state.names[name];
        const text = typeof entry === "string" ? entry : entry && entry.refersTo;
        if (typeof text === "string" && text.toLowerCase().includes(from.toLowerCase() + "!")) {
          const replaced = text.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "!", "gi"), to + "!");
          state.names[name] = typeof entry === "string" ? replaced : Object.assign({}, entry, { refersTo: replaced });
        }
      });
      config.newName = "";
      pushHistory(state, { type: "rename", from, to });
      clearResult(state);
      return state;
    }

    if (type === "addSheet") {
      const name = normalizeName(data.name || config.addSheetName);
      if (!name || actualSheetName(state, name)) return null;
      state.sheets[name] = {};
      state.sheetMeta[name] = { tabColor: "none", hidden: false };
      const requested = Number(data.position || config.addPosition);
      const index = Number.isInteger(requested) && requested > 0
        ? Math.min(requested - 1, state.sheetOrder.length)
        : state.sheetOrder.length;
      state.sheetOrder.splice(index, 0, name);
      state.activeSheet = name;
      config.addSheetName = "";
      pushHistory(state, { type: "add", name, position: index + 1 });
      clearResult(state);
      return state;
    }

    if (type === "copySheet") {
      const from = actualSheetName(state, data.from || state.activeSheet);
      const name = normalizeName(data.name || config.copyName);
      if (!from || !name || actualSheetName(state, name)) return null;
      state.sheets[name] = clone(state.sheets[from]);
      state.sheetMeta[name] = clone(state.sheetMeta[from] || { tabColor: "none", hidden: false });
      const index = state.sheetOrder.indexOf(from);
      state.sheetOrder.splice(index + 1, 0, name);
      state.activeSheet = name;
      config.copyName = "";
      pushHistory(state, { type: "copy", from, name });
      clearResult(state);
      return state;
    }

    if (type === "moveSheet") {
      const sheet = actualSheetName(state, data.sheet || state.activeSheet);
      if (!sheet) return null;
      const fromIndex = state.sheetOrder.indexOf(sheet);
      let toIndex = Number(data.position);
      if (!Number.isFinite(toIndex) && data.offset != null) toIndex = fromIndex + Number(data.offset);
      if (!Number.isFinite(toIndex)) return null;
      if (data.position != null && Number(data.position) > 0) toIndex -= 1;
      toIndex = Math.max(0, Math.min(state.sheetOrder.length - 1, toIndex));
      state.sheetOrder.splice(fromIndex, 1);
      state.sheetOrder.splice(toIndex, 0, sheet);
      pushHistory(state, { type: "move", sheet, position: toIndex + 1 });
      clearResult(state);
      return state;
    }

    if (type === "hideSheet" || type === "unhideSheet") {
      const sheet = actualSheetName(state, data.sheet || state.activeSheet);
      if (!sheet) return null;
      state.sheetMeta[sheet] = Object.assign({ tabColor: "none", hidden: false }, state.sheetMeta[sheet]);
      state.sheetMeta[sheet].hidden = type === "hideSheet";
      pushHistory(state, { type, sheet });
      clearResult(state);
      return state;
    }

    if (type === "applyTabColor" || type === "setTabColor") {
      const sheet = actualSheetName(state, data.sheet || state.activeSheet);
      if (!sheet) return null;
      const color = String(data.color || config.tabColor || "none");
      state.sheetMeta[sheet] = Object.assign({ tabColor: "none", hidden: false }, state.sheetMeta[sheet]);
      state.sheetMeta[sheet].tabColor = color;
      pushHistory(state, { type: "tabColor", sheet, color });
      clearResult(state);
      return state;
    }

    if (type === "freeze") {
      const cell = normalizeRef(data.cell || config.freezeCell);
      if (!cell) return null;
      state.freeze = cell;
      config.freezeCell = cell;
      pushHistory(state, { type: "freeze", cell });
      clearResult(state);
      return state;
    }

    if (type === "unfreeze") {
      state.freeze = "";
      config.freezeCell = "";
      pushHistory(state, { type: "unfreeze" });
      clearResult(state);
      return state;
    }

    if (type === "protect" || type === "unprotect") {
      const scope = String(data.scope || config.protectScope || "sheet").toLowerCase() === "workbook"
        ? "workbook"
        : "sheet";
      const enabled = type === "protect";
      state.protection[scope] = enabled;
      if (scope === "sheet") {
        const range = rangeReference(data.range || config.protectRange);
        const ranges = Array.isArray(state.protection.ranges) ? state.protection.ranges : [];
        state.protection.ranges = enabled
          ? Array.from(new Set(ranges.concat(range && parseRange(range) ? [range] : [])))
          : [];
      }
      pushHistory(state, { type, scope, enabled });
      clearResult(state);
      return state;
    }

    if (type === "createName") {
      const name = normalizeName(data.name || config.definedName);
      const refersTo = rangeReference(data.refersTo || config.refersTo || state.range);
      if (!name || !refersTo || /\s/.test(name)) return null;
      state.names[name] = refersTo;
      config.definedName = "";
      config.refersTo = "";
      pushHistory(state, { type: "name", name, refersTo });
      clearResult(state);
      return state;
    }

    if (type === "deleteName") {
      const name = normalizeName(data.name || config.definedName);
      const existing = Object.keys(state.names).find((candidate) => (
        candidate.toLowerCase() === name.toLowerCase()
      ));
      if (!existing) return null;
      delete state.names[existing];
      pushHistory(state, { type: "deleteName", name: existing });
      clearResult(state);
      return state;
    }

    if (type === "applyFormula") {
      const formula = String(data.formula || config.formula || "").trim();
      if (!formula) return null;
      const sheet = actualSheetName(state, data.sheet || config.formulaSheet || state.activeSheet);
      const cell = normalizeRef(data.cell || config.formulaCell);
      if (!sheet || !cell || !parseRange(cell)) return null;
      config.formula = formula;
      config.arrayFormula = formula;
      config.formulaSheet = sheet;
      config.formulaCell = cell;
      state.sheets[sheet][cell] = formula.startsWith("=") ? formula : "=" + formula;
      pushHistory(state, { type: "formula", sheet, cell, formula });
      clearResult(state);
      return state;
    }

    if (type === "addSortLevel") {
      config.levels = Array.isArray(config.levels) ? config.levels : [];
      config.levels.push({ column: data.column || "", order: "asc" });
      clearResult(state);
      return state;
    }

    if (type === "removeSortLevel") {
      const index = Number(data.index);
      if (!Number.isInteger(index) || !Array.isArray(config.levels) || index < 0 || index >= config.levels.length) return null;
      config.levels.splice(index, 1);
      if (!config.levels.length) config.levels.push({ column: "", order: "asc" });
      clearResult(state);
      return state;
    }

    if (type === "toggleColumn") {
      const column = normalizeRef(data.column);
      if (!column) return null;
      const values = Array.isArray(config.columnsToCheck) ? config.columnsToCheck.slice() : [];
      const index = values.indexOf(column);
      if (index >= 0) values.splice(index, 1);
      else values.push(column);
      config.columnsToCheck = values;
      if (String(spec.mode || "").toLowerCase() === "removeduplicates") config.columns = values.slice();
      clearResult(state);
      return state;
    }

    if (type === "addPivotRow" || type === "addPivotColumn") {
      const field = normalizeRef(data.field || (type === "addPivotRow" ? config.pivotRowField : config.pivotColumnField));
      if (!field) return null;
      const key = type === "addPivotRow" ? "rows" : "columns";
      config[key] = Array.isArray(config[key]) ? config[key] : [];
      if (!config[key].includes(field)) config[key].push(field);
      if (type === "addPivotRow") config.pivotRowField = "";
      else config.pivotColumnField = "";
      clearResult(state);
      return state;
    }

    if (type === "removePivotRow" || type === "removePivotColumn") {
      const key = type === "removePivotRow" ? "rows" : "columns";
      const field = normalizeRef(data.field);
      config[key] = (Array.isArray(config[key]) ? config[key] : []).filter((item) => normalizeRef(item) !== field);
      clearResult(state);
      return state;
    }

    if (type === "addPivotValue") {
      const field = normalizeRef(data.field || config.pivotValueField);
      if (!field) return null;
      config.values = Array.isArray(config.values) ? config.values : [];
      const aggregate = String(data.aggregate || config.pivotAggregate || "SUM").toUpperCase();
      if (!config.values.some((value) => normalizeRef(value.field) === field && String(value.aggregate).toUpperCase() === aggregate)) {
        config.values.push({ field, aggregate });
      }
      config.pivotValueField = "";
      clearResult(state);
      return state;
    }

    if (type === "removePivotValue") {
      const index = Number(data.index);
      if (!Array.isArray(config.values) || !Number.isInteger(index) || index < 0 || index >= config.values.length) return null;
      config.values.splice(index, 1);
      clearResult(state);
      return state;
    }

    if (type === "addPivotFilter") {
      const field = normalizeRef(data.field || config.pivotFilterField);
      const value = String(data.value != null ? data.value : config.pivotFilterValue);
      if (!field) return null;
      config.filters = Array.isArray(config.filters) ? config.filters : [];
      config.filters.push({ field, value });
      config.pivotFilterField = "";
      config.pivotFilterValue = "";
      clearResult(state);
      return state;
    }

    if (type === "removePivotFilter") {
      const index = Number(data.index);
      if (!Array.isArray(config.filters) || !Number.isInteger(index) || index < 0 || index >= config.filters.length) return null;
      config.filters.splice(index, 1);
      clearResult(state);
      return state;
    }

    if (type === "addScenario") {
      const name = normalizeName(data.name || config.scenarioName);
      if (!name) return null;
      config.scenarios = Array.isArray(config.scenarios) ? config.scenarios : [];
      const rawValue = data.value != null ? data.value : config.scenarioValue;
      const numeric = rawValue === "" ? "" : Number(rawValue);
      const value = Number.isFinite(numeric) && rawValue !== "" ? numeric : rawValue;
      config.scenarios.push({
        name,
        changingCell: normalizeRef(data.cell || config.changingCell),
        value,
      });
      config.selectedScenario = name;
      config.scenarioName = "";
      config.changingCell = "";
      config.scenarioValue = "";
      clearResult(state);
      return state;
    }

    if (type === "removeScenario") {
      const name = normalizeName(data.name || config.selectedScenario);
      config.scenarios = (Array.isArray(config.scenarios) ? config.scenarios : []).filter((scenario) => scenario.name !== name);
      if (config.selectedScenario === name) config.selectedScenario = "";
      clearResult(state);
      return state;
    }

    if (type === "selectRange") {
      const range = rangeReference(data.range || data.value || config.range);
      if (!range || !parseRange(range)) return null;
      state.range = range;
      state.selection = { startRef: parseRange(range).start, endRef: parseRange(range).end };
      config.range = range;
      clearResult(state);
      return state;
    }

    return null;
  }

  function normalizeForField(field, value) {
    if (value == null) return "";
    if (typeof value === "number" || typeof value === "boolean") return value;
    if (Array.isArray(value)) return value.map((item) => normalizeForField(field, item));
    if (typeof value === "object") {
      const result = {};
      Object.keys(value).sort().forEach((key) => {
        result[key] = normalizeForField(key, value[key]);
      });
      return result;
    }
    const text = String(value).trim();
    if (["range", "targetRange", "listRange", "criteriaRange", "sourceRange", "dataRange",
      "printArea", "sparklineRange", "forecastRange", "variableCells"].includes(field)) {
      return rangeReference(text);
    }
    if (field === "formula" || field === "arrayFormula" || field === "refersTo") {
      if (Engine && Engine.normalizeFormula) return Engine.normalizeFormula(text);
      return text.replace(/\s+/g, "").replace(/^=/, "").toUpperCase();
    }
    if (["fill", "font", "tabColor"].includes(field)) return text.toUpperCase();
    if (["sheet", "formulaSheet", "from", "to", "name", "definedName"].includes(field)) {
      return text.toLowerCase();
    }
    if (["orientation", "paper", "margins", "ruleType", "operator", "allow", "errorStyle",
      "format", "style", "action", "order", "pasteOperation", "chartType", "seriesBy",
      "sparklineType", "showAs", "groupDate", "objective", "protectScope", "column",
      "field", "aggregate", "dataType", "rows", "columns", "subtotalColumns",
      "columnsToCheck"].includes(field)) {
      return text.toLowerCase();
    }
    if (/^-?\d+(?:\.\d+)?$/.test(text) && field !== "title") return Number(text);
    return text;
  }

  function valuesEqual(left, right) {
    if (Array.isArray(left) || Array.isArray(right)) {
      if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
      return left.every((value, index) => valuesEqual(value, right[index]));
    }
    if (left && right && typeof left === "object" && typeof right === "object") {
      const leftKeys = Object.keys(left).sort();
      const rightKeys = Object.keys(right).sort();
      if (leftKeys.length !== rightKeys.length || leftKeys.some((key, index) => key !== rightKeys[index])) return false;
      return leftKeys.every((key) => valuesEqual(left[key], right[key]));
    }
    return left === right;
  }

  function calculatedFieldColumnMap(spec, state) {
    const range = state.config.sourceRange ||
      (spec && spec.ranges && (spec.ranges.source || Object.values(spec.ranges)[0])) || "";
    const parsed = parseRange(range);
    if (!parsed) return {};
    const sheet = state.sheets[state.activeSheet] || {};
    const map = {};
    for (let index = 0; index < parsed.cols; index += 1) {
      const letter = numberToCol(parsed.left + index);
      const raw = sheet[letter + parsed.top];
      const localized = localizedCellText(raw).trim();
      if (/^[A-Za-z_][A-Za-z0-9_.]*$/.test(localized)) map[localized.toUpperCase()] = letter;
      if (isLocalizedValue(raw)) {
        LANGUAGE_KEYS.forEach((language) => {
          const translated = raw[language];
          if (typeof translated === "string" && /^[A-Za-z_][A-Za-z0-9_.]*$/.test(translated.trim())) {
            map[translated.trim().toUpperCase()] = letter;
          }
        });
      }
    }
    return map;
  }

  function calculatedFormulaKey(formula, columnMap) {
    let text = String(formula == null ? "" : formula).replace(/^=/, "").trim();
    Object.keys(columnMap)
      .sort((left, right) => right.length - left.length)
      .forEach((name) => {
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        text = text.replace(new RegExp("\\b" + escaped + "\\b", "gi"), columnMap[name]);
      });
    return Engine.normalizeFormula("=" + text);
  }

  function calculatedFieldMatches(expected, actual, spec, state) {
    const expectedValue = localizeGoalValue(expected) || {};
    const actualValue = actual || {};
    if (String(expectedValue.name || "").trim().toLowerCase() !== String(actualValue.name || "").trim().toLowerCase()) {
      return false;
    }
    if (expectedValue.formula === undefined) return true;
    const columnMap = calculatedFieldColumnMap(spec, state);
    return calculatedFormulaKey(expectedValue.formula, columnMap) === calculatedFormulaKey(actualValue.formula, columnMap);
  }

  function compareGoalFields(goal, state, spec, skipped) {
    const skip = new Set(["operation", "action", "kind", "mode"].concat(skipped || []));
    for (const field of Object.keys(goal)) {
      if (skip.has(field) || goal[field] === undefined) continue;
      if (field === "calculatedField") {
        const expectedCalc = localizeGoalValue(goal[field]);
        const actualCalc = state.config.calculatedField;
        if (!calculatedFieldMatches(expectedCalc, actualCalc, spec, state)) {
          return {
            ok: false,
            field,
            reason: tr("lab.mismatch", {
              field: fieldLabel(spec, field),
              expected: describeValue(field, expectedCalc),
              actual: describeValue(field, actualCalc),
            }),
            expected: expectedCalc,
            actual: actualCalc,
          };
        }
        continue;
      }
      const expected = normalizeForField(field, localizeGoalValue(goal[field]));
      const actualRaw = Object.prototype.hasOwnProperty.call(state.config, field)
        ? state.config[field]
        : state[field];
      const actual = normalizeForField(field, localizeGoalValue(actualRaw));
      if (!valuesEqual(expected, actual)) {
        return {
          ok: false,
          field,
          reason: tr("lab.mismatch", {
            field: fieldLabel(spec, field),
            expected: describeValue(field, expected),
            actual: describeValue(field, actual),
          }),
          expected,
          actual,
        };
      }
    }
    return null;
  }

  function fieldLabel(spec, field) {
    const custom = spec && spec.options && spec.options.labels && spec.options.labels[field];
    if (custom) return lt(custom);
    const key = "lab.field." + field;
    const translated = tr(key);
    if (translated !== key) return translated;
    return String(field || "").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase());
  }

  function describeValue(field, value) {
    if (value === "" || value == null) return tr("lab.none");
    if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
    if (Array.isArray(value)) {
      return value.length ? value.map((item) => describeValue(field, item)).join(", ") : tr("lab.none");
    }
    if (typeof value === "object") {
      if (value.field != null) {
        return String(value.field) + (value.aggregate ? " " + optionText(value.aggregate) : "") +
          (value.value != null ? " = " + value.value : "");
      }
      return Object.keys(value).map((key) => fieldLabel({}, key) + " " + describeValue(key, value[key])).join(", ");
    }
    if (typeof value === "string" && Object.prototype.hasOwnProperty.call(root.I18N ? root.I18N.messages["zh-CN"] : {}, "lab.opt." + value)) {
      return optionText(value);
    }
    return String(value);
  }

  function failed(reason, extra) {
    return Object.assign({ ok: false, reason }, extra || {});
  }

  function validateWorkbook(spec, state, goal, operation) {
    const aliases = {
      addsheet: "add",
      addworksheet: "add",
      copysheet: "copy",
      copyworksheet: "copy",
      movesheet: "move",
      moveworksheet: "move",
      hidesheet: "hide",
      unhidesheet: "unhide",
      freezepanes: "freeze",
      printsettings: "print",
      definedname: "name",
      namedrange: "name",
      formulas: "formula",
      formulasudit: "audit",
      protectsheet: "protect",
      protectworkbook: "protect",
    };
    const rawOperation = String(operation || "").toLowerCase();
    const op = aliases[rawOperation] || rawOperation;
    if (op === "rename") {
      const from = normalizeName(goal.from);
      const to = normalizeName(goal.to || goal.newName || goal.name);
      if (!to) return compareGoalFields(goal, state, spec, ["from", "newName", "name"]) ||
        failed(tr("lab.reason.operation"));
      const target = actualSheetName(state, to);
      if (!target) return failed(tr("lab.reason.rename", { to }));
      if (from && actualSheetName(state, from) && from.toLowerCase() !== to.toLowerCase()) {
        return failed(tr("lab.reason.oldSheet", { from }));
      }
      return { ok: true };
    }
    if (op === "add") {
      const name = normalizeName(goal.name || goal.to || goal.newName);
      const target = actualSheetName(state, name);
      if (!name || !target) return failed(tr("lab.reason.add", { name: name || "?" }));
      if (goal.position != null) {
        const position = Number(goal.position);
        if (Number.isFinite(position) && state.sheetOrder.indexOf(target) + 1 !== position) {
          return failed(tr("lab.reason.move", { sheet: name, position }));
        }
      }
      return { ok: true };
    }
    if (op === "copy") {
      const name = normalizeName(goal.to || goal.name || goal.copyName);
      const target = actualSheetName(state, name);
      if (!name || !target) return failed(tr("lab.reason.copy", { name: name || "?" }));
      const from = normalizeName(goal.from);
      if (from && state.sheets[from] && !valuesEqual(state.sheets[target], state.sheets[from])) {
        return failed(tr("lab.reason.copy", { name }));
      }
      return { ok: true };
    }
    if (op === "move") {
      const sheet = normalizeName(goal.sheet || goal.from || goal.name);
      if (!sheet || !actualSheetName(state, sheet)) {
        return failed(tr("lab.reason.move", { sheet: sheet || "?", position: goal.position || "?" }));
      }
      if (goal.position != null) {
        const position = Number(goal.position);
        if (Number.isFinite(position) && state.sheetOrder.indexOf(actualSheetName(state, sheet)) + 1 !== position) {
          return failed(tr("lab.reason.move", { sheet, position }));
        }
      }
      return { ok: true };
    }
    if (op === "hide" || op === "unhide") {
      const sheet = normalizeName(goal.sheet || goal.name || goal.from);
      const target = actualSheetName(state, sheet);
      if (!target) return failed(tr(op === "hide" ? "lab.reason.hide" : "lab.reason.unhide", { sheet: sheet || "?" }));
      const hidden = Boolean(state.sheetMeta[target] && state.sheetMeta[target].hidden);
      if (hidden !== (op === "hide")) {
        return failed(tr(op === "hide" ? "lab.reason.hide" : "lab.reason.unhide", { sheet: target }));
      }
      return { ok: true };
    }
    if (op === "tabcolor") {
      const sheet = normalizeName(goal.sheet || goal.name || goal.from || state.activeSheet);
      const target = actualSheetName(state, sheet);
      const color = String(goal.color || goal.tabColor || "").toLowerCase();
      const actual = String(target && state.sheetMeta[target] ? state.sheetMeta[target].tabColor : "").toLowerCase();
      if (!target || (color && actual !== color)) {
        return failed(tr("lab.reason.tabColor", { sheet: target || sheet || "?" }));
      }
      return { ok: true };
    }
    if (op === "freeze") {
      const cell = normalizeRef(goal.cell || goal.ref || goal.freezeCell || goal.freezeAt);
      if (cell && normalizeRef(state.freeze) !== cell) {
        return failed(tr("lab.reason.freeze", { cell }));
      }
      return compareGoalFields(goal, state, spec, ["cell", "ref", "freezeCell", "freezeAt", "operation"]) || { ok: true };
    }
    if (op === "protect") {
      let scope = String(goal.scope || "sheet").toLowerCase() === "workbook" ? "workbook" : "sheet";
      let expected = goal.protected !== false;
      if (typeof goal.sheet === "boolean") {
        scope = "sheet";
        expected = goal.sheet;
      } else if (typeof goal.workbook === "boolean") {
        scope = "workbook";
        expected = goal.workbook;
      }
      if (Boolean(state.protection[scope]) !== expected) {
        return failed(tr("lab.reason.protect"));
      }
      if (goal.protectRange) {
        const range = rangeReference(goal.protectRange);
        if (!state.protection.ranges.map(rangeReference).includes(range)) {
          return failed(tr("lab.reason.protect"));
        }
      }
      return { ok: true };
    }
    if (op === "print") {
      return compareGoalFields(goal, state, spec, ["operation"]) || { ok: true };
    }
    if (op === "name") {
      const name = normalizeName(goal.name || goal.definedName);
      const entryKey = Object.keys(state.names).find((candidate) => (
        candidate.toLowerCase() === name.toLowerCase()
      ));
      if (!entryKey) return failed(tr("lab.reason.named", { name: name || "?" }));
      const entry = state.names[entryKey];
      const actualRef = typeof entry === "string" ? entry : entry && entry.refersTo;
      const expectedRef = goal.refersTo || goal.ref;
      if (expectedRef && !valuesEqual(
        normalizeForField("refersTo", expectedRef),
        normalizeForField("refersTo", actualRef)
      )) {
        return failed(tr("lab.reason.named", { name }));
      }
      if (goal.formula && !valuesEqual(
        normalizeForField("formula", goal.formula),
        normalizeForField("formula", state.config.formula)
      )) {
        return failed(tr("lab.reason.formula", { cell: state.config.formulaCell || goal.formulaCell || "?" }));
      }
      const expectedCell = normalizeRef(goal.formulaCell || goal.cell);
      if (expectedCell && normalizeRef(state.config.formulaCell) !== expectedCell) {
        return failed(tr("lab.reason.formula", { cell: expectedCell }));
      }
      return { ok: true };
    }
    if (op === "formula" || op === "multisheet") {
      const expectedFormula = goal.formula;
      const cell = normalizeRef(goal.cell || state.config.formulaCell);
      const sheetName = actualSheetName(state, goal.sheet || state.config.formulaSheet || state.activeSheet);
      const sheetFormula = sheetName && cell ? state.sheets[sheetName] && state.sheets[sheetName][cell] : "";
      const actualFormula = sheetFormula || state.config.formula;
      if (expectedFormula && !valuesEqual(
        normalizeForField("formula", expectedFormula),
        normalizeForField("formula", actualFormula)
      )) {
        return failed(tr("lab.reason.formula", { cell: cell || "?" }));
      }
      if (goal.sheet && !sheetName) return failed(tr("lab.reason.formula", { cell: cell || "?" }));
      if (goal.cell && cell && normalizeRef(goal.cell) !== cell) {
        return failed(tr("lab.reason.formula", { cell: normalizeRef(goal.cell) }));
      }
      const fieldMismatch = compareGoalFields(goal, state, spec, [
        "operation", "formula", "cell", "sheet", "action",
      ]);
      return fieldMismatch || { ok: true };
    }
    return compareGoalFields(goal, state, spec) || { ok: true };
  }

  function validate(labSpec, state) {
    try {
      const spec = labSpec && typeof labSpec === "object" ? labSpec : null;
      if (!spec || !spec.kind) return failed(tr("lab.missingSpec"));
      const goalSource = spec.goal;
      if (!goalSource || typeof goalSource !== "object") return failed(tr("lab.missingGoal"));
      const goal = localizeGoalValue(goalSource);
      if (!state) return failed(tr("lab.stateMissing"));
      const safeState = ensureStateShape(clone(state), spec);
      const kind = String(spec.kind).toLowerCase();
      let operation = goal.operation || goal.action || spec.mode || "";
      if (String(operation).toLowerCase() === "sheets") operation = goal.action || goal.operation;
      if (kind === "workbook") {
        return validateWorkbook(spec, safeState, goal, operation);
      }
      if (kind !== "format" && kind !== "data" && kind !== "visual" && kind !== "analysis") {
        return failed(tr("lab.unsupported"));
      }
      return compareGoalFields(goal, safeState, spec) || { ok: true };
    } catch (error) {
      return failed(tr("lab.reason.operation"));
    }
  }

  function isLocked(state) {
    return Boolean(state && state.feedback && state.feedback.type === "correct");
  }

  function inputField(spec, state, key, options) {
    const settings = options || {};
    const value = getPath(state.config, key);
    const disabled = isLocked(state) || settings.disabled;
    return `<label class="lab-field${settings.wide ? " is-wide" : ""}">
      <span class="lab-field-label">${escapeHtml(fieldLabel(spec, settings.labelKey || key))}</span>
      <input type="${escapeHtml(settings.type || "text")}" data-lab-field="${escapeHtml(key)}"${
        settings.valueType ? ` data-lab-value-type="${escapeHtml(settings.valueType)}"` : ""
      } value="${escapeHtml(value == null ? "" : value)}"${
        settings.placeholder != null ? ` placeholder="${escapeHtml(settings.placeholder)}"` : ""
      }${settings.min != null ? ` min="${escapeHtml(settings.min)}"` : ""}${
        settings.max != null ? ` max="${escapeHtml(settings.max)}"` : ""
      }${settings.step != null ? ` step="${escapeHtml(settings.step)}"` : ""}${
        settings.mono ? ' class="lab-mono-input"' : ""
      }${disabled ? " disabled" : ""} />
      ${settings.help ? `<small class="lab-field-help">${escapeHtml(settings.help)}</small>` : ""}
    </label>`;
  }

  function textareaField(spec, state, key, options) {
    const settings = options || {};
    const value = getPath(state.config, key);
    const disabled = isLocked(state) || settings.disabled;
    return `<label class="lab-field is-wide">
      <span class="lab-field-label">${escapeHtml(fieldLabel(spec, settings.labelKey || key))}</span>
      <textarea rows="${settings.rows || 4}" data-lab-field="${escapeHtml(key)}"${
        settings.placeholder != null ? ` placeholder="${escapeHtml(settings.placeholder)}"` : ""
      }${disabled ? " disabled" : ""}>${escapeHtml(value == null ? "" : value)}</textarea>
      ${settings.help ? `<small class="lab-field-help">${escapeHtml(settings.help)}</small>` : ""}
    </label>`;
  }

  function selectField(spec, state, key, options, settings) {
    const config = settings || {};
    const value = String(getPath(state.config, key) == null ? "" : getPath(state.config, key));
    const disabled = isLocked(state) || config.disabled;
    let choices = options || [];
    const configuredChoices = spec && spec.options && spec.options.choices;
    const custom = configuredChoices && (
      configuredChoices[key] ||
      configuredChoices[config.labelKey || key] ||
      (Array.isArray(configuredChoices) ? configuredChoices : null)
    );
    if (custom) {
      if (Array.isArray(custom)) {
        choices = custom.map((option) => (
          option && typeof option === "object"
            ? {
              value: option.value,
              label: option.label != null ? lt(option.label) : optionText(option.value),
            }
            : { value: option, label: optionText(option) }
        ));
      } else if (typeof custom === "object") {
        choices = Object.entries(custom).map(([optionValue, label]) => ({
          value: optionValue,
          label: lt(label),
        }));
      }
      if (value && !choices.some((option) => String(option.value) === value)) {
        choices.unshift({ value, label: value });
      }
    }
    const markup = choices.map((option) => (
      `<option value="${escapeHtml(option.value)}"${String(option.value) === value ? " selected" : ""}>${escapeHtml(option.label)}</option>`
    )).join("");
    return `<label class="lab-field${config.wide ? " is-wide" : ""}">
      <span class="lab-field-label">${escapeHtml(fieldLabel(spec, config.labelKey || key))}</span>
      <select data-lab-field="${escapeHtml(key)}"${config.valueType ? ` data-lab-value-type="${escapeHtml(config.valueType)}"` : ""}${disabled ? " disabled" : ""}>${markup}</select>
    </label>`;
  }

  function checkField(spec, state, key, settings) {
    const config = settings || {};
    const checked = Boolean(getPath(state.config, key));
    const disabled = isLocked(state) || config.disabled;
    return `<label class="lab-check">
      <input type="checkbox" data-lab-field="${escapeHtml(key)}" data-lab-value-type="boolean"${checked ? " checked" : ""}${disabled ? " disabled" : ""} />
      <span>${escapeHtml(fieldLabel(spec, config.labelKey || key))}</span>
    </label>`;
  }

  function colorField(spec, state, key, settings) {
    const config = settings || {};
    const value = String(getPath(state.config, key) || "#ffffff");
    const disabled = isLocked(state) || config.disabled;
    return `<label class="lab-field lab-color-field">
      <span class="lab-field-label">${escapeHtml(fieldLabel(spec, config.labelKey || key))}</span>
      <span class="lab-color-control">
        <input type="color" data-lab-field="${escapeHtml(key)}" value="${escapeHtml(value)}"${disabled ? " disabled" : ""} />
        <code>${escapeHtml(value.toUpperCase())}</code>
      </span>
    </label>`;
  }

  function button(label, action, data, options) {
    const settings = options || {};
    const attributes = Object.entries(data || {}).map(([key, value]) => (
      value == null || value === "" ? "" : ` data-${key}="${escapeHtml(value)}"`
    )).join("");
    return `<button class="${escapeHtml(settings.className || "lab-button")}" type="button" data-action="${escapeHtml(action)}"${attributes}${
      settings.disabled ? " disabled" : ""
    }>${escapeHtml(label)}</button>`;
  }

  function chip(label, action, data, state) {
    return `<span class="lab-chip">${escapeHtml(label)}${
      button(tr("lab.removeItem"), action, data, { className: "lab-chip-remove", disabled: isLocked(state) })
    }</span>`;
  }

  function localizedOptions(values) {
    return values.map((value) => ({ value, label: optionText(value) }));
  }

  function iconStyleOptions(spec) {
    const values = spec && spec.options && Array.isArray(spec.options.iconStyles)
      ? spec.options.iconStyles
      : ["3TrafficLights", "3Arrows", "5Ratings"];
    const labels = {
      "3TrafficLights": "lab.opt.iconTraffic",
      "3Arrows": "lab.opt.iconArrows",
      "5Ratings": "lab.opt.iconRatings",
    };
    return values.map((value) => ({
      value,
      label: labels[value] ? tr(labels[value]) : String(value),
    }));
  }

  function sheetOptions(state, includeBlank) {
    const options = includeBlank ? [{ value: "", label: tr("lab.none") }] : [];
    state.sheetOrder.forEach((name) => {
      const hidden = state.sheetMeta[name] && state.sheetMeta[name].hidden;
      options.push({ value: name, label: name + (hidden ? " (" + tr("lab.hidden") + ")" : "") });
    });
    return options;
  }

  function columnOptions(state, includeBlank) {
    const sheet = state.sheets[state.activeSheet] || {};
    let maxCol = 8;
    Object.keys(sheet).forEach((ref) => {
      const parsed = parseRange(ref);
      if (parsed) maxCol = Math.max(maxCol, parsed.right);
    });
    maxCol = Math.min(14, maxCol);
    const options = includeBlank ? [{ value: "", label: tr("lab.none") }] : [];
    for (let col = 1; col <= maxCol; col += 1) {
      const letter = numberToCol(col);
      const header = sheet[letter + "1"];
      const headerText = localizedCellText(header);
      options.push({
        value: letter,
        label: letter + (headerText ? " - " + headerText : ""),
      });
    }
    return options;
  }

  function aggregateOptions() {
    return ["SUM", "COUNT", "AVERAGE", "MAX", "MIN"].map((value) => ({ value, label: value }));
  }

  function pivotValueOptions(spec, state) {
    const options = columnOptions(state, true);
    const calculatedName = state.config.calculatedField && state.config.calculatedField.name;
    if (calculatedName && !options.some((option) => option.value === calculatedName)) {
      options.push({ value: calculatedName, label: calculatedName });
    }
    return options;
  }

  function renderSheetManagementControls(spec, state) {
    const locked = isLocked(state);
    const sheet = state.sheetOrder[state.sheetOrder.indexOf(state.activeSheet)] || state.activeSheet;
    const hidden = state.sheetMeta[sheet] && state.sheetMeta[sheet].hidden;
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr("lab.mode.sheets"))}</div>
      <p class="lab-current-sheet"><span>${escapeHtml(tr("lab.currentSheet"))}</span><strong>${escapeHtml(sheet)}</strong></p>
      <div class="lab-inline-row">
        ${inputField(spec, state, "newName", { labelKey: "newSheetName", placeholder: sheet })}
        ${button(tr("lab.rename"), "lab-rename-sheet", {}, { disabled: locked })}
      </div>
      <div class="lab-inline-row">
        ${inputField(spec, state, "addSheetName", { labelKey: "addSheetName" })}
        ${button(tr("lab.addSheet"), "lab-add-sheet", {}, { disabled: locked })}
      </div>
      <div class="lab-inline-row">
        ${inputField(spec, state, "copyName", { labelKey: "copySheetName" })}
        ${button(tr("lab.copySheet"), "lab-copy-sheet", {}, { disabled: locked })}
      </div>
      <div class="lab-action-row">
        ${button(tr("lab.moveLeft"), "lab-move-sheet", { offset: -1 }, { disabled: locked })}
        ${button(tr("lab.moveRight"), "lab-move-sheet", { offset: 1 }, { disabled: locked })}
        ${button(hidden ? tr("lab.unhideSheet") : tr("lab.hideSheet"), hidden ? "lab-unhide-sheet" : "lab-hide-sheet", {}, { disabled: locked })}
      </div>
      <div class="lab-inline-row">
        ${selectField(spec, state, "tabColor", [
          { value: "none", label: tr("lab.none") },
          ...localizedOptions(["green", "blue", "red", "orange", "purple"]),
        ], { labelKey: "tabColor" })}
        ${button(tr("lab.applyTabColor"), "lab-apply-tab-color", {}, { disabled: locked })}
      </div>
    </section>`;
  }

  function renderFreezeControls(spec, state) {
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr("lab.mode.freeze"))}</div>
      <div class="lab-inline-row">
        ${inputField(spec, state, "freezeCell", { labelKey: "freezeCell", placeholder: "B2", mono: true })}
        ${button(tr("lab.setFreeze"), "lab-freeze", {}, { disabled: isLocked(state) })}
      </div>
      <div class="lab-action-row">${button(tr("lab.clearFreeze"), "lab-unfreeze", {}, { disabled: isLocked(state) })}</div>
    </section>`;
  }

  function renderProtectionControls(spec, state) {
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr("lab.mode.protect"))}</div>
      <div class="lab-control-grid">
        ${selectField(spec, state, "protectScope", [
          { value: "sheet", label: tr("lab.opt.sheet") },
          { value: "workbook", label: tr("lab.opt.workbook") },
        ], { labelKey: "protectScope" })}
        ${inputField(spec, state, "protectRange", { labelKey: "protectRange", placeholder: "A1:B6" })}
        ${inputField(spec, state, "password", { labelKey: "password", type: "password" })}
      </div>
      <div class="lab-action-row">
        ${button(tr("lab.protect"), "lab-protect", {}, { disabled: isLocked(state) })}
        ${button(tr("lab.unlockRange"), "lab-protect", {}, { disabled: isLocked(state) })}
        ${button(tr("lab.unprotect"), "lab-unprotect", {}, { disabled: isLocked(state) })}
      </div>
    </section>`;
  }

  function renderPrintControls(spec, state) {
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr("lab.mode.print"))}</div>
      <div class="lab-control-grid">
        ${selectField(spec, state, "orientation", localizedOptions(["portrait", "landscape"]), { labelKey: "orientation" })}
        ${selectField(spec, state, "paper", ["A4", "A3", "Letter", "Legal"].map((value) => ({ value, label: value })), { labelKey: "paper" })}
        ${selectField(spec, state, "margins", localizedOptions(["normal", "narrow", "wide"]), { labelKey: "margins" })}
        ${inputField(spec, state, "scale", { labelKey: "scale", type: "number", valueType: "number", min: 10, max: 400 })}
        ${inputField(spec, state, "printArea", { labelKey: "printArea", placeholder: "A1:F24" })}
        ${inputField(spec, state, "printTitles", { labelKey: "printTitles", placeholder: "1:1" })}
        ${inputField(spec, state, "header", { labelKey: "header" })}
        ${inputField(spec, state, "footer", { labelKey: "footer" })}
      </div>
      ${checkField(spec, state, "gridlines", { labelKey: "gridlines" })}
    </section>`;
  }

  function renderNamedRangeControls(spec, state) {
    const names = Object.entries(state.names).map(([name, entry]) => {
      const refersTo = typeof entry === "string" ? entry : entry && entry.refersTo;
      return `<li><span><strong>${escapeHtml(name)}</strong><code>${escapeHtml(refersTo || "")}</code></span>${
        button(tr("lab.deleteName"), "lab-delete-name", { name }, { className: "lab-text-button", disabled: isLocked(state) })
      }</li>`;
    }).join("");
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr("lab.mode.namedRange"))}</div>
      <div class="lab-control-grid">
        ${inputField(spec, state, "definedName", { labelKey: "name" })}
        ${inputField(spec, state, "refersTo", { labelKey: "refersTo", placeholder: "A2:C9" })}
      </div>
      <div class="lab-action-row">${button(tr("lab.createName"), "lab-create-name", {}, { disabled: isLocked(state) })}</div>
      <ul class="lab-name-list">${names || `<li class="is-empty">${escapeHtml(tr("lab.noNames"))}</li>`}</ul>
      <div class="lab-control-grid lab-inner-grid">
        ${selectField(spec, state, "formulaSheet", sheetOptions(state, true), { labelKey: "formulaSheet" })}
        ${inputField(spec, state, "formulaCell", { labelKey: "formulaCell", placeholder: "B2", mono: true })}
        ${inputField(spec, state, "formula", { labelKey: "formula", placeholder: "=SUM(SalesData)", mono: true, wide: true })}
      </div>
      <div class="lab-action-row">${button(tr("lab.applyFormula"), "lab-apply-formula", {}, { disabled: isLocked(state) })}</div>
    </section>`;
  }

  function renderMultiSheetControls(spec, state) {
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr("lab.mode.multiSheet"))}</div>
      <div class="lab-control-grid">
        ${selectField(spec, state, "formulaSheet", sheetOptions(state, true), { labelKey: "formulaSheet" })}
        ${inputField(spec, state, "formulaCell", { labelKey: "formulaCell", placeholder: "B2", mono: true })}
        ${inputField(spec, state, "formula", { labelKey: "formula", placeholder: "=SUM(Sheet1!B2:B9)", mono: true, wide: true })}
      </div>
      <div class="lab-action-row">${button(tr("lab.applyFormula"), "lab-apply-formula", {}, { disabled: isLocked(state) })}</div>
      <p class="lab-control-help">${escapeHtml(tr("lab.formulaTip"))}</p>
    </section>`;
  }

  function renderAuditControls(spec, state) {
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr("lab.mode.audit"))}</div>
      <div class="lab-control-grid">
        ${selectField(spec, state, "auditAction", [
          { value: "precedents", label: optionText("precedents") },
          { value: "dependents", label: optionText("dependents") },
          { value: "showFormulas", label: optionText("showFormulas") },
          { value: "evaluate", label: optionText("evaluate") },
        ], { labelKey: "action" })}
        ${inputField(spec, state, "auditCell", { labelKey: "cell", placeholder: "B2", mono: true })}
      </div>
      ${checkField(spec, state, "showFormulas", { labelKey: "showFormulas" })}
    </section>`;
  }

  function renderConditionalControls(spec, state) {
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr("lab.mode.conditional"))}</div>
      <div class="lab-control-grid">
        ${inputField(spec, state, "range", { labelKey: "range", placeholder: "C2:C9", wide: true })}
        ${selectField(spec, state, "ruleType", localizedOptions(["cellValue", "textContains", "top10", "colorScale", "dataBar", "iconSet", "formula"]), { labelKey: "ruleType" })}
        ${selectField(spec, state, "operator", localizedOptions(["greaterThan", "lessThan", "equal", "notEqual", "between", "notBetween"]), { labelKey: "operator" })}
        ${inputField(spec, state, "value1", { labelKey: "value1" })}
        ${inputField(spec, state, "value2", { labelKey: "value2" })}
        ${colorField(spec, state, "fill", { labelKey: "fill" })}
        ${colorField(spec, state, "font", { labelKey: "font" })}
        ${colorField(spec, state, "minColor", { labelKey: "minColor" })}
        ${colorField(spec, state, "midColor", { labelKey: "midColor" })}
        ${colorField(spec, state, "maxColor", { labelKey: "maxColor" })}
        ${selectField(spec, state, "iconStyle", iconStyleOptions(spec), { labelKey: "iconStyle" })}
        ${inputField(spec, state, "formula", { labelKey: "formula", placeholder: "=$D2>12", mono: true, wide: true })}
      </div>
      ${checkField(spec, state, "reverse", { labelKey: "reverse" })}
      <p class="lab-control-help">${escapeHtml(tr("lab.rangeTip"))}</p>
    </section>`;
  }

  function renderValidationControls(spec, state) {
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr("lab.mode.validation"))}</div>
      <div class="lab-control-grid">
        ${inputField(spec, state, "range", { labelKey: "range", placeholder: "B2:B30", wide: true })}
        ${selectField(spec, state, "allow", localizedOptions(["list", "whole", "decimal", "date", "textLength", "custom"]), { labelKey: "allow" })}
        ${selectField(spec, state, "operator", localizedOptions(["greaterThan", "lessThan", "equal", "notEqual", "between", "notBetween"]), { labelKey: "operator" })}
        ${inputField(spec, state, "minimum", { labelKey: "minimum", type: "number" })}
        ${inputField(spec, state, "maximum", { labelKey: "maximum", type: "number" })}
        ${inputField(spec, state, "source", { labelKey: "source", placeholder: "=$E$2:$E$5", mono: true })}
        ${inputField(spec, state, "formula", { labelKey: "formula", placeholder: "=COUNTIF($A$2:$A$20,A2)=1", mono: true, wide: true })}
        ${selectField(spec, state, "errorStyle", localizedOptions(["stop", "warning", "information"]), { labelKey: "errorStyle" })}
        ${inputField(spec, state, "inputTitle", { labelKey: "inputTitle" })}
        ${inputField(spec, state, "inputMessage", { labelKey: "inputMessage" })}
        ${inputField(spec, state, "errorTitle", { labelKey: "errorTitle" })}
        ${inputField(spec, state, "errorMessage", { labelKey: "errorMessage" })}
      </div>
    </section>`;
  }

  function renderNumberFormatControls(spec, state) {
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr("lab.mode.numberFormat"))}</div>
      <div class="lab-control-grid">
        ${inputField(spec, state, "range", { labelKey: "range", placeholder: "D2:D30", wide: true })}
        ${selectField(spec, state, "format", localizedOptions(["General", "number", "currency", "accounting", "percent", "date", "custom"]), { labelKey: "format" })}
        ${inputField(spec, state, "decimals", { labelKey: "decimals", type: "number", valueType: "number", min: 0, max: 6 })}
        ${inputField(spec, state, "customFormat", { labelKey: "customFormat", placeholder: "0.00" })}
      </div>
      ${checkField(spec, state, "thousands", { labelKey: "thousands" })}
    </section>`;
  }

  function renderTableStyleControls(spec, state) {
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr("lab.mode.tableStyle"))}</div>
      <div class="lab-control-grid">
        ${inputField(spec, state, "range", { labelKey: "range", placeholder: "A1:F20", wide: true })}
        ${selectField(spec, state, "style", [
          { value: "none", label: tr("lab.opt.tableNone") },
          { value: "TableStyleMedium2", label: tr("lab.opt.tableMedium") },
          { value: "TableStyleLight1", label: tr("lab.opt.tableLight") },
          { value: "TableStyleDark1", label: tr("lab.opt.tableDark") },
        ], { labelKey: "style" })}
      </div>
      <div class="lab-check-grid">
        ${checkField(spec, state, "headerRow", { labelKey: "headerRow" })}
        ${checkField(spec, state, "totalRow", { labelKey: "totalRow" })}
        ${checkField(spec, state, "bandedRows", { labelKey: "bandedRows" })}
        ${checkField(spec, state, "bandedColumns", { labelKey: "bandedColumns" })}
        ${checkField(spec, state, "firstColumn", { labelKey: "firstColumn" })}
        ${checkField(spec, state, "lastColumn", { labelKey: "lastColumn" })}
      </div>
    </section>`;
  }

  function renderSortControls(spec, state) {
    const levels = (Array.isArray(state.config.levels) ? state.config.levels : []).map((level, index) => (
      `<div class="lab-repeater-row">
        <span class="lab-repeater-index">${index + 1}</span>
        ${selectField(spec, state, `levels.${index}.column`, columnOptions(state, true), { labelKey: "column" })}
        ${selectField(spec, state, `levels.${index}.order`, localizedOptions(["asc", "desc", "custom"]), { labelKey: "order" })}
        ${button(tr("lab.removeItem"), "lab-remove-sort", { index }, { className: "lab-text-button", disabled: isLocked(state) })}
      </div>`
    )).join("");
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr("lab.mode.sort"))}</div>
      <div class="lab-control-grid">
        ${inputField(spec, state, "range", { labelKey: "range", placeholder: "A1:G11", wide: true })}
      </div>
      ${checkField(spec, state, "hasHeaders", { labelKey: "hasHeaders" })}
      <div class="lab-repeater">${levels || `<p class="lab-control-help">${escapeHtml(tr("lab.levelsEmpty"))}</p>`}</div>
      <div class="lab-action-row">${button(tr("lab.addLevel"), "lab-add-sort-level", {}, { disabled: isLocked(state) })}</div>
    </section>`;
  }

  function renderAdvancedFilterControls(spec, state) {
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr("lab.mode.advancedFilter"))}</div>
      <div class="lab-control-grid">
        ${inputField(spec, state, "listRange", { labelKey: "listRange", placeholder: "A1:F11" })}
        ${inputField(spec, state, "criteriaRange", { labelKey: "criteriaRange", placeholder: "H1:I2" })}
        ${selectField(spec, state, "action", localizedOptions(["filterInPlace", "copyTo"]), { labelKey: "action" })}
        ${inputField(spec, state, "copyTo", { labelKey: "copyTo", placeholder: "J1" })}
      </div>
    </section>`;
  }

  function renderRemoveDuplicatesControls(spec, state) {
    const columns = columnOptions(state, false).map((option) => {
      const checked = (state.config.columnsToCheck || []).includes(option.value);
      return `<label class="lab-check lab-check-compact">
        <input type="checkbox" data-lab-action="lab-toggle-column" data-column="${escapeHtml(option.value)}"${checked ? " checked" : ""}${isLocked(state) ? " disabled" : ""} />
        <span>${escapeHtml(option.label)}</span>
      </label>`;
    }).join("");
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr("lab.mode.removeDuplicates"))}</div>
      <div class="lab-control-grid">
        ${inputField(spec, state, "range", { labelKey: "range", placeholder: "A1:F11", wide: true })}
      </div>
      ${checkField(spec, state, "hasHeaders", { labelKey: "hasHeaders" })}
      ${checkField(spec, state, "keepFirst", { labelKey: "keepFirst" })}
      <div class="lab-field-label">${escapeHtml(tr("lab.field.columnsToCheck"))}</div>
      <div class="lab-check-grid">${columns}</div>
    </section>`;
  }

  function renderTextToColumnsControls(spec, state) {
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr("lab.mode.textToColumns"))}</div>
      <div class="lab-control-grid">
        ${inputField(spec, state, "range", { labelKey: "range", placeholder: "C2:C11", wide: true })}
        ${selectField(spec, state, "dataType", localizedOptions(["delimited", "fixed"]), { labelKey: "dataType" })}
        ${inputField(spec, state, "delimiter", { labelKey: "delimiter" })}
        ${inputField(spec, state, "targetColumn", { labelKey: "targetColumn", placeholder: "C" })}
      </div>
    </section>`;
  }

  function renderPasteSpecialControls(spec, state) {
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr("lab.mode.pasteSpecial"))}</div>
      <div class="lab-control-grid">
        ${inputField(spec, state, "sourceRange", { labelKey: "sourceRange", placeholder: "A1:D10" })}
        ${inputField(spec, state, "destination", { labelKey: "destination", placeholder: "H2" })}
        ${selectField(spec, state, "pasteOperation", localizedOptions(["all", "values", "formats", "formulas", "add", "subtract", "multiply", "divide"]), { labelKey: "pasteOperation" })}
      </div>
      <div class="lab-check-grid">
        ${checkField(spec, state, "skipBlanks", { labelKey: "skipBlanks" })}
        ${checkField(spec, state, "transpose", { labelKey: "transpose" })}
      </div>
    </section>`;
  }

  function renderSubtotalControls(spec, state) {
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr("lab.mode.subtotal"))}</div>
      <div class="lab-control-grid">
        ${inputField(spec, state, "range", { labelKey: "range", placeholder: "A1:F30", wide: true })}
        ${selectField(spec, state, "groupBy", columnOptions(state, true), { labelKey: "groupBy" })}
        ${selectField(spec, state, "functionNumber", [
          { value: "9", label: "SUM" },
          { value: "1", label: "AVERAGE" },
          { value: "2", label: "COUNT" },
          { value: "3", label: "COUNTA" },
          { value: "4", label: "MAX" },
          { value: "5", label: "MIN" },
        ], { labelKey: "functionNumber", valueType: "number" })}
        ${inputField(spec, state, "subtotalColumns", { labelKey: "subtotalColumns", valueType: "list", placeholder: "D,E" })}
      </div>
    </section>`;
  }

  function renderConsolidateControls(spec, state) {
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr("lab.mode.consolidate"))}</div>
      <div class="lab-control-grid">
        ${textareaField(spec, state, "ranges", { labelKey: "ranges", placeholder: "Sheet1!A1:C8, Sheet2!A1:C8", rows: 3 })}
        ${selectField(spec, state, "functionNumber", [
          { value: "9", label: "SUM" },
          { value: "1", label: "AVERAGE" },
          { value: "2", label: "COUNT" },
          { value: "4", label: "MAX" },
          { value: "5", label: "MIN" },
        ], { labelKey: "functionNumber", valueType: "number" })}
      </div>
      <div class="lab-check-grid">
        ${checkField(spec, state, "useTopRow", { labelKey: "useTopRow" })}
        ${checkField(spec, state, "useLeftColumn", { labelKey: "useLeftColumn" })}
      </div>
    </section>`;
  }

  function renderImportControls(spec, state) {
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr("lab.mode.import"))}</div>
      <div class="lab-control-grid">
        ${selectField(spec, state, "importSource", [
          { value: "csv", label: tr("lab.opt.csv") },
          { value: "tab", label: tr("lab.opt.tab") },
          { value: "semicolon", label: tr("lab.opt.semicolon") },
        ], { labelKey: "importSource" })}
        ${inputField(spec, state, "encoding", { labelKey: "encoding" })}
      </div>
      ${textareaField(spec, state, "importText", { labelKey: "importText", rows: 5, placeholder: "Region,Amount\nEast,1200" })}
      ${checkField(spec, state, "hasHeaders", { labelKey: "hasHeaders" })}
    </section>`;
  }

  function renderChartControls(spec, state, includeChartType) {
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr("lab.mode.chart"))}</div>
      <div class="lab-control-grid">
        ${inputField(spec, state, "dataRange", { labelKey: "dataRange", placeholder: "A1:D6" })}
        ${selectField(spec, state, "seriesBy", localizedOptions(["columns", "rows"]), { labelKey: "seriesBy" })}
        ${includeChartType ? selectField(spec, state, "chartType", localizedOptions(["column", "bar", "line", "pie", "area", "scatter", "combo"]), { labelKey: "chartType" }) : ""}
        ${inputField(spec, state, "title", { labelKey: "title" })}
      </div>
      <div class="lab-check-grid">
        ${checkField(spec, state, "showLegend", { labelKey: "showLegend" })}
        ${checkField(spec, state, "dataLabels", { labelKey: "dataLabels" })}
        ${checkField(spec, state, "trendline", { labelKey: "trendline" })}
        ${checkField(spec, state, "secondaryAxis", { labelKey: "secondaryAxis" })}
      </div>
    </section>`;
  }

  function renderSparklineControls(spec, state) {
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr("lab.mode.sparkline"))}</div>
      <div class="lab-control-grid">
        ${inputField(spec, state, "sparklineRange", { labelKey: "sparklineRange", placeholder: "B2:G2" })}
        ${inputField(spec, state, "targetCell", { labelKey: "targetCell", placeholder: "H2" })}
        ${selectField(spec, state, "sparklineType", localizedOptions(["line", "column", "winloss"]), { labelKey: "sparklineType" })}
      </div>
    </section>`;
  }

  function renderPivotControls(spec, state, withChart) {
    const rows = (state.config.rows || []).map((field) => chip(String(field), "lab-remove-pivot-row", { field }, state)).join("");
    const columns = (state.config.columns || []).map((field) => chip(String(field), "lab-remove-pivot-column", { field }, state)).join("");
    const values = (state.config.values || []).map((value, index) => chip(
      String(value.field || "") + " " + String(value.aggregate || "SUM"),
      "lab-remove-pivot-value",
      { index },
      state
    )).join("");
    const filters = (state.config.filters || []).map((filter, index) => chip(
      String(filter.field || "") + " = " + localizedCellText(filter.value),
      "lab-remove-pivot-filter",
      { index },
      state
    )).join("");
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr(withChart ? "lab.mode.pivotChart" : "lab.mode.pivot"))}</div>
      <div class="lab-control-grid">
        ${inputField(spec, state, "sourceRange", { labelKey: "sourceRange", placeholder: "A1:F31" })}
        ${inputField(spec, state, "destination", { labelKey: "destination", placeholder: "H3" })}
        ${inputField(spec, state, "calculatedField.name", { labelKey: "calculatedFieldName", placeholder: "GrossMargin" })}
        ${inputField(spec, state, "calculatedField.formula", { labelKey: "calculatedFieldFormula", placeholder: "=Revenue-Cost", mono: true })}
      </div>
      ${checkField(spec, state, "refresh", { labelKey: "refresh" })}
      <div class="lab-inline-row">
        ${selectField(spec, state, "pivotRowField", columnOptions(state, true), { labelKey: "rows" })}
        ${button(tr("lab.add"), "lab-add-pivot-row", {}, { disabled: isLocked(state) })}
      </div>
      <div class="lab-chip-row">${rows || `<span class="lab-control-help">${escapeHtml(tr("lab.none"))}</span>`}</div>
      <div class="lab-inline-row">
        ${selectField(spec, state, "pivotColumnField", columnOptions(state, true), { labelKey: "column" })}
        ${button(tr("lab.add"), "lab-add-pivot-column", {}, { disabled: isLocked(state) })}
      </div>
      <div class="lab-chip-row">${columns || `<span class="lab-control-help">${escapeHtml(tr("lab.none"))}</span>`}</div>
      <div class="lab-inline-row">
        ${selectField(spec, state, "pivotValueField", pivotValueOptions(spec, state), { labelKey: "values" })}
        ${selectField(spec, state, "pivotAggregate", aggregateOptions(), { labelKey: "aggregate" })}
        ${button(tr("lab.addValue"), "lab-add-pivot-value", {}, { disabled: isLocked(state) })}
      </div>
      <div class="lab-chip-row">${values || `<span class="lab-control-help">${escapeHtml(tr("lab.valuesEmpty"))}</span>`}</div>
      <div class="lab-inline-row">
        ${selectField(spec, state, "pivotFilterField", columnOptions(state, true), { labelKey: "filterField" })}
        ${inputField(spec, state, "pivotFilterValue", { labelKey: "filterValue" })}
        ${button(tr("lab.addFilter"), "lab-add-pivot-filter", {}, { disabled: isLocked(state) })}
      </div>
      <div class="lab-chip-row">${filters || `<span class="lab-control-help">${escapeHtml(tr("lab.filtersEmpty"))}</span>`}</div>
      <div class="lab-control-grid">
        ${selectField(spec, state, "showAs", localizedOptions(["normal", "percentOfGrandTotal", "percentOfRowTotal", "percentOfColumnTotal"]), { labelKey: "showAs" })}
        ${selectField(spec, state, "groupDate", localizedOptions(["none", "month", "quarter", "year"]), { labelKey: "groupDate" })}
      </div>
      ${checkField(spec, state, "slicer", { labelKey: "slicer" })}
      ${withChart ? `<div class="lab-control-grid">
        ${selectField(spec, state, "chartType", localizedOptions(["column", "bar", "line", "pie", "area", "scatter", "combo"]), { labelKey: "chartType" })}
        ${inputField(spec, state, "title", { labelKey: "title" })}
      </div>
      <div class="lab-check-grid">
        ${checkField(spec, state, "showLegend", { labelKey: "showLegend" })}
        ${checkField(spec, state, "dataLabels", { labelKey: "dataLabels" })}
      </div>` : ""}
    </section>`;
  }

  function renderGoalSeekControls(spec, state, solver) {
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr(solver ? "lab.mode.solver" : "lab.mode.goalSeek"))}</div>
      <div class="lab-control-grid">
        ${inputField(spec, state, solver ? "objectiveCell" : "targetCell", { labelKey: solver ? "objectiveCell" : "targetCell", placeholder: "B10", mono: true })}
        ${solver
          ? selectField(spec, state, "objective", localizedOptions(["max", "min", "value"]), { labelKey: "objective" })
          : inputField(spec, state, "targetValue", { labelKey: "targetValue", type: "number", valueType: "number" })}
        ${solver
          ? inputField(spec, state, "variableCells", { labelKey: "variableCells", valueType: "list", placeholder: "B2,B3" })
          : inputField(spec, state, "variableCell", { labelKey: "variableCell", placeholder: "B2", mono: true })}
        ${solver ? inputField(spec, state, "constraints", { labelKey: "constraints", placeholder: "B2 <= 100" }) : ""}
      </div>
    </section>`;
  }

  function renderDataTableControls(spec, state) {
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr("lab.mode.dataTable"))}</div>
      <div class="lab-control-grid">
        ${inputField(spec, state, "formulaCell", { labelKey: "formulaCell", placeholder: "B2", mono: true })}
        ${inputField(spec, state, "formula", { labelKey: "formula", placeholder: "=B2*C2", mono: true })}
        ${inputField(spec, state, "rowInputCell", { labelKey: "rowInputCell", placeholder: "B3", mono: true })}
        ${inputField(spec, state, "columnInputCell", { labelKey: "columnInputCell", placeholder: "B4", mono: true })}
        ${inputField(spec, state, "resultCell", { labelKey: "resultCell", placeholder: "D2", mono: true })}
      </div>
    </section>`;
  }

  function renderScenarioControls(spec, state) {
    const scenarios = (state.config.scenarios || []).map((scenario) => (
      `<li>
        <span><strong>${escapeHtml(scenario.name)}</strong><small>${escapeHtml(scenario.changingCell || "")} = ${escapeHtml(scenario.value)}</small></span>
        ${button(tr("lab.removeItem"), "lab-remove-scenario", { name: scenario.name }, { className: "lab-text-button", disabled: isLocked(state) })}
      </li>`
    )).join("");
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr("lab.mode.scenario"))}</div>
      <div class="lab-control-grid">
        ${inputField(spec, state, "scenarioName", { labelKey: "scenarioName" })}
        ${inputField(spec, state, "changingCell", { labelKey: "changingCell", placeholder: "B2", mono: true })}
        ${inputField(spec, state, "scenarioValue", { labelKey: "scenarioValue", type: "number" })}
      </div>
      <div class="lab-action-row">${button(tr("lab.addScenario"), "lab-add-scenario", {}, { disabled: isLocked(state) })}</div>
      <ul class="lab-name-list lab-scenario-list">${scenarios || `<li class="is-empty">${escapeHtml(tr("lab.noValues"))}</li>`}</ul>
    </section>`;
  }

  function renderForecastControls(spec, state) {
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr("lab.mode.forecast"))}</div>
      <div class="lab-control-grid">
        ${inputField(spec, state, "forecastRange", { labelKey: "forecastRange", placeholder: "A1:B13", wide: true })}
        ${inputField(spec, state, "periods", { labelKey: "periods", type: "number", valueType: "number", min: 1, max: 36 })}
        ${inputField(spec, state, "confidence", { labelKey: "confidence", type: "number", valueType: "number", min: 0, max: 100 })}
      </div>
      ${checkField(spec, state, "seasonality", { labelKey: "seasonality" })}
    </section>`;
  }

  function renderArrayControls(spec, state) {
    return `<section class="lab-control-section">
      <div class="lab-section-title">${escapeHtml(tr("lab.mode.array"))}</div>
      <div class="lab-control-grid">
        ${inputField(spec, state, "formulaCell", { labelKey: "formulaCell", placeholder: "E2", mono: true })}
        ${inputField(spec, state, "arrayFormula", { labelKey: "arrayFormula", labelKeyOverride: "arrayFormula", placeholder: "=FILTER(A2:C9,C2:C9>1000)", mono: true, wide: true })}
      </div>
      <p class="lab-control-help">${escapeHtml(tr("lab.formulaTip"))}</p>
      <p class="lab-control-note">${escapeHtml(tr("lab.arrayLimit"))}</p>
    </section>`;
  }

  function renderModeControls(spec, state) {
    const mode = String(spec.mode || "").toLowerCase();
    const kind = String(spec.kind || "").toLowerCase();
    if (kind === "workbook") {
      if (mode === "freeze") return renderFreezeControls(spec, state);
      if (mode === "protect") return renderProtectionControls(spec, state);
      if (mode === "print") return renderPrintControls(spec, state);
      if (mode === "namedrange") return renderNamedRangeControls(spec, state);
      if (mode === "multisheet") return renderMultiSheetControls(spec, state);
      if (mode === "audit") return renderAuditControls(spec, state);
      return renderSheetManagementControls(spec, state);
    }
    if (kind === "format") {
      if (mode === "validation") return renderValidationControls(spec, state);
      if (mode === "numberformat") return renderNumberFormatControls(spec, state);
      if (mode === "tablestyle") return renderTableStyleControls(spec, state);
      return renderConditionalControls(spec, state);
    }
    if (kind === "data") {
      if (mode === "advancedfilter") return renderAdvancedFilterControls(spec, state);
      if (mode === "removeduplicates") return renderRemoveDuplicatesControls(spec, state);
      if (mode === "texttocolumns") return renderTextToColumnsControls(spec, state);
      if (mode === "pastespecial") return renderPasteSpecialControls(spec, state);
      if (mode === "subtotal") return renderSubtotalControls(spec, state);
      if (mode === "consolidate") return renderConsolidateControls(spec, state);
      if (mode === "import") return renderImportControls(spec, state);
      return renderSortControls(spec, state);
    }
    if (kind === "visual") {
      if (mode === "sparkline") return renderSparklineControls(spec, state);
      if (mode === "pivot") return renderPivotControls(spec, state, false);
      if (mode === "pivotchart") return renderPivotControls(spec, state, true);
      return renderChartControls(spec, state, true);
    }
    if (kind === "analysis") {
      if (mode === "datatable") return renderDataTableControls(spec, state);
      if (mode === "scenario") return renderScenarioControls(spec, state);
      if (mode === "solver") return renderGoalSeekControls(spec, state, true);
      if (mode === "forecast") return renderForecastControls(spec, state);
      if (mode === "array") return renderArrayControls(spec, state);
      return renderGoalSeekControls(spec, state, false);
    }
    return `<section class="lab-control-section"><p>${escapeHtml(tr("lab.unsupported"))}</p></section>`;
  }

  function formulaOptions(state, sheetName, sheetOverride) {
    const sheets = {};
    Object.keys(state.sheets).forEach((name) => {
      const source = name === sheetName && sheetOverride ? sheetOverride : state.sheets[name];
      sheets[name] = localizedSheetMap(source);
    });
    return {
      sheets,
      names: state.names,
    };
  }

  function localizedSheetMap(sheet) {
    const result = {};
    Object.entries(sheet || {}).forEach(([ref, value]) => {
      result[ref] = isLocalizedValue(value) ? localizedCellText(value) : value;
    });
    return result;
  }

  function safeColor(value) {
    return /^#[0-9a-f]{6}$/i.test(String(value || "")) ? String(value) : "";
  }

  function formatNumberCell(value, config) {
    if (typeof value !== "number" || !Number.isFinite(value)) return String(value == null ? "" : value);
    const decimals = Math.max(0, Math.min(6, Number(config.decimals) || 0));
    if (config.format === "percent") return (value * 100).toFixed(decimals) + "%";
    if (config.format === "date") {
      const date = new Date(Date.UTC(1899, 11, 30) + Math.floor(value) * 86400000);
      return date.toISOString().slice(0, 10);
    }
    if (config.format === "currency" || config.format === "accounting") {
      try {
        return new Intl.NumberFormat(root.I18N ? root.I18N.getLanguage() : "en", {
          style: "currency",
          currency: "CNY",
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value);
      } catch (error) {
        return value.toFixed(decimals);
      }
    }
    if (config.format === "custom" && config.customFormat) {
      if (/0(?:\.0+)?%/.test(config.customFormat)) return (value * 100).toFixed(decimals) + "%";
      return value.toFixed(decimals);
    }
    if (config.format === "number" || config.thousands) {
      try {
        return new Intl.NumberFormat(root.I18N ? root.I18N.getLanguage() : "en", {
          useGrouping: Boolean(config.thousands),
          minimumFractionDigits: config.format === "number" ? decimals : 0,
          maximumFractionDigits: config.format === "number" ? decimals : 2,
        }).format(value);
      } catch (error) {
        return value.toFixed(decimals);
      }
    }
    return String(Math.round(value * 100) / 100);
  }

  function cellDisplay(state, sheetName, ref, raw, options) {
    const settings = options || {};
    if (settings.showFormulas && typeof raw === "string" && raw.startsWith("=")) return raw;
    if (typeof raw === "string" && raw.startsWith("=")) {
      const options = formulaOptions(state, sheetName);
      options.formulaCell = ref;
      const result = Engine.evaluate(raw, localizedSheetMap(state.sheets[sheetName] || {}), options);
      if (!result.ok) return { text: result.error, error: true, value: result.error };
      return {
        text: settings.numberFormat
          ? formatNumberCell(result.value, state.config)
          : (isLocalizedValue(result.value) ? localizedCellText(result.value) : result.display),
        error: false,
        value: result.value,
      };
    }
    if (settings.numberFormat && typeof raw === "number") {
      return { text: formatNumberCell(raw, state.config), error: false, value: raw };
    }
    return {
      text: raw == null || raw === "" ? "" : localizedCellText(raw),
      error: false,
      value: isLocalizedValue(raw) ? localizedCellText(raw) : raw,
    };
  }

  function renderFormulaBar(state) {
    const sheetName = state.activeSheet;
    const sheet = state.sheets[sheetName] || {};
    const auditCell = normalizeRef(state.config.auditCell);
    const formulaCell = auditCell || Object.keys(sheet).find((ref) => (
      typeof sheet[ref] === "string" && sheet[ref].startsWith("=")
    ));
    if (!formulaCell) {
      return `<div class="lab-formula-bar"><span class="lab-formula-tag">fx</span><code>${escapeHtml(tr("lab.formulaPreview"))}</code></div>`;
    }
    const raw = sheet[formulaCell];
    const result = cellDisplay(state, sheetName, formulaCell, raw, {
      showFormulas: Boolean(state.config.showFormulas) || state.config.auditAction === "showFormulas",
    });
    return `<div class="lab-formula-bar">
      <span class="lab-formula-tag">fx</span>
      <code>${escapeHtml(formulaCell)}</code>
      <span class="lab-formula-text">${escapeHtml(typeof raw === "string" ? raw : localizedCellText(raw))}</span>
      <span class="lab-formula-result${result.error ? " is-error" : ""}">${escapeHtml(result.text)}</span>
    </div>`;
  }

  function previewHighlights(spec, state) {
    const config = state.config;
    const ranges = [];
    const add = (value, type) => {
      const range = rangeReference(value);
      if (parseRange(range) && !ranges.some((item) => item.range === range)) {
        ranges.push({ range, type: type || "source" });
      }
    };
    add(state.range, "selection");
    add(config.range, "target");
    add(config.selection, "target");
    add(config.listRange, "source");
    add(config.criteriaRange, "criteria");
    add(config.sourceRange, "source");
    add(config.dataRange, "source");
    add(config.sparklineRange, "source");
    add(config.forecastRange, "source");
    add(config.printArea, "print");
    Object.values(state.names).forEach((entry) => {
      const refersTo = typeof entry === "string" ? entry : entry && entry.refersTo;
      if (refersTo) add(refersTo, "name");
    });
    return ranges;
  }

  function sheetBoundsForPreview(sheet, highlights, options) {
    const settings = options || {};
    let maxRow = 1;
    let maxCol = 1;
    Object.keys(sheet || {}).forEach((ref) => {
      const parsed = parseRange(ref);
      if (!parsed) return;
      maxRow = Math.max(maxRow, parsed.bottom);
      maxCol = Math.max(maxCol, parsed.right);
    });
    (highlights || []).forEach((item) => {
      const parsed = parseRange(item.range);
      if (!parsed) return;
      maxRow = Math.max(maxRow, parsed.bottom);
      maxCol = Math.max(maxCol, parsed.right);
    });
    return {
      maxRow: Math.min(settings.maxRows || 16, Math.max(settings.minRows || 4, maxRow)),
      maxCol: Math.min(settings.maxCols || 9, Math.max(settings.minCols || 4, maxCol)),
    };
  }

  function hexToRgb(color) {
    const value = safeColor(color);
    if (!value) return null;
    return [
      parseInt(value.slice(1, 3), 16),
      parseInt(value.slice(3, 5), 16),
      parseInt(value.slice(5, 7), 16),
    ];
  }

  function mixColor(from, to, ratio) {
    const left = hexToRgb(from);
    const right = hexToRgb(to);
    if (!left || !right) return "#ffffff";
    const amount = Math.max(0, Math.min(1, ratio));
    return "#" + left.map((channel, index) => (
      Math.round(channel + (right[index] - channel) * amount).toString(16).padStart(2, "0")
    )).join("");
  }

  function conditionalRangeNumbers(state) {
    const parsed = parseRange(state.config.range);
    if (!parsed) return [];
    const sheet = state.sheets[state.activeSheet] || {};
    const values = [];
    for (let row = parsed.top; row <= parsed.bottom; row += 1) {
      for (let col = parsed.left; col <= parsed.right; col += 1) {
        const value = cellNumericValue(state, state.activeSheet, numberToCol(col) + row);
        if (value != null) values.push(value);
      }
    }
    return values;
  }

  function translateConditionalFormula(formula, rowOffset, colOffset) {
    return String(formula || "").replace(/("(?:[^"]|"")*")|(\$?[A-Z]{1,3}\$?\d{1,7})/g, (match, literal, reference) => {
      if (literal) return literal;
      const parsed = /^(\$?)([A-Z]{1,3})(\$?)(\d{1,7})$/.exec(reference);
      if (!parsed) return match;
      const nextCol = parsed[1] ? colToNumber(parsed[2]) : colToNumber(parsed[2]) + colOffset;
      const nextRow = parsed[3] ? Number(parsed[4]) : Number(parsed[4]) + rowOffset;
      if (nextCol < 1 || nextRow < 1) return "#REF!";
      return (parsed[1] ? "$" : "") + numberToCol(nextCol) + (parsed[3] ? "$" : "") + nextRow;
    });
  }

  function conditionalFormulaMatches(state, ref, formula) {
    const target = parseRange(ref);
    const source = parseRange(state.config.range);
    if (!target || !source || !formula) return false;
    const translated = translateConditionalFormula(formula, target.top - source.top, target.left - source.left);
    const sheetName = state.activeSheet;
    const result = Engine.evaluate(translated, state.sheets[sheetName] || {}, formulaOptions(state, sheetName));
    return result.ok && Boolean(result.value);
  }

  function conditionalFormat(state, ref, value) {
    if (!state.config.range || !inRange(ref, state.config.range)) return { style: "", iconClass: "" };
    const config = state.config;
    const numberValue = typeof value === "number" ? value : Number(String(value == null ? "" : value).replace(/,/g, ""));
    const first = Number(config.value1);
    const second = Number(config.value2);
    let match = false;
    if (config.ruleType === "cellValue" && Number.isFinite(numberValue)) {
      if (config.operator === "greaterThan") match = numberValue > first;
      else if (config.operator === "lessThan") match = numberValue < first;
      else if (config.operator === "equal") match = numberValue === first;
      else if (config.operator === "notEqual") match = numberValue !== first;
      else if (config.operator === "between") match = numberValue >= Math.min(first, second) && numberValue <= Math.max(first, second);
      else if (config.operator === "notBetween") match = numberValue < Math.min(first, second) || numberValue > Math.max(first, second);
    } else if (config.ruleType === "textContains") {
      match = String(value == null ? "" : value).toLowerCase().includes(String(config.value1 || "").toLowerCase());
    } else if (config.ruleType === "top10" && Number.isFinite(numberValue)) {
      match = numberValue >= first;
    } else if (config.ruleType === "formula") {
      match = conditionalFormulaMatches(state, ref, config.formula);
    }
    const fill = safeColor(config.fill);
    const font = safeColor(config.font);
    if (config.ruleType === "colorScale" && Number.isFinite(numberValue)) {
      const values = conditionalRangeNumbers(state);
      const minimum = Math.min(...values);
      const maximum = Math.max(...values);
      const fraction = maximum === minimum ? 0.5 : (numberValue - minimum) / (maximum - minimum);
      const middleColor = safeColor(config.midColor);
      const color = middleColor
        ? fraction < 0.5
          ? mixColor(config.minColor, middleColor, fraction * 2)
          : mixColor(middleColor, config.maxColor, (fraction - 0.5) * 2)
        : mixColor(config.minColor, config.maxColor, fraction);
      return {
        style: "background:" + color + ";" + (font ? "color:" + font + ";" : ""),
        iconClass: "",
      };
    }
    if (config.ruleType === "dataBar" && Number.isFinite(numberValue)) {
      const values = conditionalRangeNumbers(state);
      const minimum = Math.min(0, ...values);
      const maximum = Math.max(0, ...values);
      const fraction = maximum === minimum ? 0 : (numberValue - minimum) / (maximum - minimum);
      const color = safeColor(config.fill) || "#5B9BD5";
      return {
        style: "background:linear-gradient(90deg," + color + " " + (fraction * 100) + "%,#ffffff " + (fraction * 100) + "%);",
        iconClass: "",
      };
    }
    if (config.ruleType === "iconSet" && Number.isFinite(numberValue)) {
      const values = conditionalRangeNumbers(state);
      const minimum = Math.min(...values);
      const maximum = Math.max(...values);
      let fraction = maximum === minimum ? 0.5 : (numberValue - minimum) / (maximum - minimum);
      if (config.reverse) fraction = 1 - fraction;
      const tier = fraction >= 0.67 ? "high" : fraction >= 0.34 ? "mid" : "low";
      return { style: "", iconClass: "is-icon-set is-icon-" + tier };
    }
    if (!match) return { style: "", iconClass: "" };
    return {
      style: (fill ? "background:" + fill + ";" : "") + (font ? "color:" + font + ";" : ""),
      iconClass: "",
    };
  }

  function renderTabs(state) {
    return `<div class="lab-sheet-tabs" role="tablist" aria-label="${escapeHtml(tr("lab.sheetTabs"))}">${
      state.sheetOrder.map((name) => {
        const meta = state.sheetMeta[name] || {};
        const active = name === state.activeSheet;
        return `<button class="lab-sheet-tab${active ? " is-active" : ""}${meta.hidden ? " is-hidden" : ""}" type="button"
          role="tab" aria-selected="${active ? "true" : "false"}" data-action="lab-activate-sheet" data-sheet="${escapeHtml(name)}"${
            isLocked(state) ? " disabled" : ""
          }><span class="lab-tab-color" data-color="${escapeHtml(meta.tabColor || "none")}" aria-hidden="true"></span><span>${escapeHtml(name)}</span>${
            meta.hidden ? `<small>${escapeHtml(tr("lab.hidden"))}</small>` : ""
          }</button>`;
      }).join("")
    }</div>`;
  }

  function renderSheetGrid(spec, state, options) {
    const settings = options || {};
    const sheetName = settings.sheetName || state.activeSheet;
    const sheet = state.sheets[sheetName] || {};
    const highlights = previewHighlights(spec, state);
    const bounds = sheetBoundsForPreview(sheet, highlights, settings);
    const showFormulas = Boolean(state.config.showFormulas) || state.config.auditAction === "showFormulas";
    const numberFormat = String(spec.mode || "").toLowerCase() === "numberformat";
    const protection = state.protection && state.protection.sheet;
    const freeze = parseRange(state.freeze);
    const tableClasses = [
      "lab-sheet-table",
      state.config.headerRow ? "has-header-row" : "",
      state.config.totalRow ? "has-total-row" : "",
      state.config.bandedRows ? "has-banded-rows" : "",
      state.config.bandedColumns ? "has-banded-columns" : "",
      state.config.firstColumn ? "has-first-column" : "",
      state.config.lastColumn ? "has-last-column" : "",
      protection ? "is-protected" : "",
    ].filter(Boolean).join(" ");
    const rows = [];
    rows.push('<div class="lab-sheet-scroll"><table class="' + tableClasses + '" role="table" aria-label="' +
      escapeHtml(tr("lab.sourceData")) + '"><thead><tr><th class="lab-corner" aria-hidden="true"></th>');
    for (let col = 1; col <= bounds.maxCol; col += 1) {
      rows.push(`<th scope="col">${numberToCol(col)}</th>`);
    }
    rows.push("</tr></thead><tbody>");
    for (let row = 1; row <= bounds.maxRow; row += 1) {
      rows.push(`<tr><th scope="row" class="lab-row-number">${row}</th>`);
      for (let col = 1; col <= bounds.maxCol; col += 1) {
        const ref = numberToCol(col) + row;
        const raw = sheet[ref];
        const formatCell = numberFormat && (!state.config.range || inRange(ref, state.config.range));
        const result = cellDisplay(state, sheetName, ref, raw, { showFormulas, numberFormat: formatCell });
        const classes = ["lab-sheet-cell"];
        if (row === 1) classes.push("is-header-row");
        if (col === 1) classes.push("is-first-column");
        if (state.config.lastColumn && col === bounds.maxCol) classes.push("is-last-column");
        const matchedHighlights = highlights.filter((item) => inRange(ref, item.range));
        matchedHighlights.forEach((item) => classes.push("is-highlighted", "is-" + item.type));
        if (protection && (state.protection.ranges || []).some((range) => inRange(ref, range))) classes.push("is-unlocked");
        if (freeze) {
          if (row <= freeze.bottom) classes.push("is-frozen-row");
          if (col <= freeze.right) classes.push("is-frozen-column");
        }
        if (result.error) classes.push("has-formula-error");
        const conditional = conditionalFormat(state, ref, result.value);
        if (conditional.iconClass) classes.push(conditional.iconClass);
        const style = conditional.style;
        rows.push(`<td class="${classes.join(" ")}" data-lab-ref="${ref}" title="${escapeHtml(ref)}"${
          style ? ` style="${escapeHtml(style)}"` : ""
        }>${escapeHtml(result.text)}</td>`);
      }
      rows.push("</tr>");
    }
    rows.push("</tbody></table></div>");
    const protectionText = protection
      ? tr("lab.protectedSheet") + (state.protection.ranges && state.protection.ranges.length
        ? " · " + tr("lab.editableRange", { range: state.protection.ranges.join(", ") })
        : "")
      : tr("lab.protectionOff");
    return `<div class="lab-sheet-preview">
      ${renderTabs(state)}
      ${renderFormulaBar(state)}
      ${rows.join("")}
      <div class="lab-preview-foot">
        <span>${escapeHtml(tr("lab.range"))}: <code>${escapeHtml(state.range || tr("lab.none"))}</code></span>
        <span class="${protection ? "is-protected" : ""}">${escapeHtml(protectionText)}</span>
        ${state.freeze ? `<span>${escapeHtml(tr("lab.freezeAt", { cell: state.freeze }))}</span>` : ""}
      </div>
    </div>`;
  }

  function cellNumericValue(state, sheetName, ref, sheetOverride) {
    const sheet = sheetOverride || state.sheets[sheetName] || {};
    const raw = sheet[ref];
    if (raw == null || raw === "") return null;
    if (typeof raw === "number") return raw;
    if (typeof raw === "string" && raw.startsWith("=")) {
      const result = Engine.evaluate(raw, localizedSheetMap(sheet), formulaOptions(state, sheetName, sheetOverride));
      return result.ok && typeof result.value === "number" ? result.value : null;
    }
    const number = Number(String(raw).replace(/,/g, ""));
    return Number.isFinite(number) ? number : null;
  }

  function sheetRangeMatrix(state, range, sheetName) {
    const parsed = parseRange(range);
    if (!parsed) return null;
    const sheet = state.sheets[sheetName || state.activeSheet] || {};
    const matrix = [];
    for (let row = parsed.top; row <= parsed.bottom; row += 1) {
      const values = [];
      for (let col = parsed.left; col <= parsed.right; col += 1) {
        const ref = numberToCol(col) + row;
        const raw = sheet[ref];
        const result = cellDisplay(state, sheetName || state.activeSheet, ref, raw, {});
        values.push(result.value == null ? "" : result.value);
      }
      matrix.push(values);
    }
    return { parsed, matrix, sheet };
  }

  function transposeMatrix(matrix) {
    return matrix.length ? matrix[0].map((_, col) => matrix.map((row) => row[col])) : [];
  }

  function renderMatrixTable(matrix, options) {
    const settings = options || {};
    if (!matrix || !matrix.length) {
      return `<div class="lab-empty-state">${escapeHtml(settings.empty || tr("lab.noData"))}</div>`;
    }
    const maxRows = settings.maxRows || 22;
    const maxCols = settings.maxCols || 10;
    const rows = matrix.slice(0, maxRows);
    const width = Math.min(maxCols, Math.max(...rows.map((row) => row.length)));
    const headerRows = settings.headerRows == null ? 1 : settings.headerRows;
    const body = rows.map((row, rowIndex) => {
      const cells = [];
      for (let col = 0; col < width; col += 1) {
        const tag = rowIndex < headerRows ? "th" : "td";
        const value = row[col] == null ? "" : row[col];
        cells.push(`<${tag}>${escapeHtml(value)}</${tag}>`);
      }
      return `<tr>${cells.join("")}</tr>`;
    }).join("");
    return `<div class="lab-table-scroll">
      <table class="lab-data-table${settings.headerRows === 0 ? " is-headerless" : ""}">
        ${settings.caption ? `<caption>${escapeHtml(settings.caption)}</caption>` : ""}
        <tbody>${body}</tbody>
      </table>
    </div>${settings.note ? `<p class="lab-preview-note">${escapeHtml(settings.note)}</p>` : ""}`;
  }

  function renderPreviewShell(state, content, title) {
    return `<div class="lab-preview-head">
      <div><span class="lab-preview-kicker">${escapeHtml(tr("lab.preview"))}</span><strong>${escapeHtml(title || "")}</strong></div>
      <span class="lab-status-dot${isLocked(state) ? " is-locked" : ""}" aria-hidden="true"></span>
    </div>
    ${content}`;
  }

  function compareTableValues(left, right) {
    const leftBlank = left === "" || left == null;
    const rightBlank = right === "" || right == null;
    if (leftBlank || rightBlank) return leftBlank === rightBlank ? 0 : leftBlank ? 1 : -1;
    const leftNumber = typeof left === "number" ? left : (Number.isNaN(Number(left)) ? null : Number(left));
    const rightNumber = typeof right === "number" ? right : (Number.isNaN(Number(right)) ? null : Number(right));
    if (leftNumber != null && rightNumber != null) return leftNumber - rightNumber;
    return String(left).localeCompare(String(right));
  }

  function columnIndexFromField(header, field, parsedRange) {
    const normalized = normalizeRef(field);
    if (!normalized) return -1;
    if (/^[A-Z]{1,3}$/.test(normalized)) {
      if (parsedRange) return colToNumber(normalized) - parsedRange.left;
      return colToNumber(normalized) - 1;
    }
    return header.findIndex((value) => String(value == null ? "" : value).trim().toLowerCase() === normalized.toLowerCase());
  }

  function renderSortPreview(spec, state) {
    const source = sheetRangeMatrix(state, state.config.range);
    if (!source) {
      return renderPreviewShell(state, `${renderSheetGrid(spec, state)}<p class="lab-preview-note">${escapeHtml(tr("lab.noData"))}</p>`,
        tr("lab.mode.sort"));
    }
    const matrix = source.matrix;
    const hasHeaders = Boolean(state.config.hasHeaders);
    const header = hasHeaders ? matrix[0].slice() : matrix[0].map((_, index) => numberToCol(source.parsed.left + index));
    let rows = (hasHeaders ? matrix.slice(1) : matrix.slice()).map((row, index) => ({ row, index }));
    const levels = (Array.isArray(state.config.levels) ? state.config.levels : []).filter((level) => level.column);
    levels.forEach((level) => {
      const column = columnIndexFromField(header, level.column, source.parsed);
      if (column < 0) return;
      const order = String(level.order).toLowerCase();
      const customList = (Array.isArray(level.customList) ? level.customList
        : spec.options && Array.isArray(spec.options.customList) ? spec.options.customList : [])
        .map((item) => localizedCellText(item).trim());
      const customIndex = (value) => customList.findIndex((item) => (
        item.toLowerCase() === localizedCellText(value).trim().toLowerCase()
      ));
      const direction = order === "desc" ? -1 : 1;
      rows.sort((left, right) => {
        if (order === "custom") {
          const leftIndex = customIndex(left.row[column]);
          const rightIndex = customIndex(right.row[column]);
          const leftRank = leftIndex < 0 ? customList.length : leftIndex;
          const rightRank = rightIndex < 0 ? customList.length : rightIndex;
          if (leftRank !== rightRank) return leftRank - rightRank;
          const compared = compareTableValues(left.row[column], right.row[column]);
          return compared === 0 ? left.index - right.index : compared;
        }
        const compared = compareTableValues(left.row[column], right.row[column]);
        return compared === 0 ? left.index - right.index : compared * direction;
      });
    });
    const output = [header].concat(rows.map((item) => item.row));
    const summary = levels.map((level) => tr("lab.sortSummary", {
      column: level.column,
      order: optionText(level.order),
    })).join(" · ");
    return renderPreviewShell(state, renderMatrixTable(output, {
      caption: summary || tr("lab.mode.sort"),
      note: tr("lab.sheetsCount", { count: state.sheetOrder.length }),
    }), tr("lab.mode.sort"));
  }

  function criteriaPattern(value) {
    const text = String(value == null ? "" : value);
    if (!/[*?]/.test(text)) return null;
    return new RegExp("^" + text.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$", "i");
  }

  function rowMatchesCriteria(row, header, criteriaRows) {
    return criteriaRows.some((criteriaRow) => {
      const active = [];
      criteriaRow.forEach((value, col) => {
        if (value !== "" && value != null) active.push([col, value]);
      });
      if (!active.length) return false;
      return active.every(([col, expected]) => {
        const actual = row[col];
        const pattern = criteriaPattern(expected);
        if (pattern) return pattern.test(String(actual == null ? "" : actual));
        const actualNumber = Number(actual);
        const expectedNumber = Number(String(expected).replace(/,/g, ""));
        if (Number.isFinite(actualNumber) && Number.isFinite(expectedNumber)) return actualNumber === expectedNumber;
        return String(actual == null ? "" : actual).toLowerCase() === String(expected).toLowerCase();
      });
    });
  }

  function renderAdvancedFilterPreview(spec, state) {
    const list = sheetRangeMatrix(state, state.config.listRange);
    const criteria = sheetRangeMatrix(state, state.config.criteriaRange);
    if (!list || !criteria || list.matrix.length < 1 || criteria.matrix.length < 1) {
      return renderPreviewShell(state, `${renderSheetGrid(spec, state)}<p class="lab-preview-note">${escapeHtml(tr("lab.noData"))}</p>`,
        tr("lab.mode.advancedFilter"));
    }
    const header = list.matrix[0];
    const mappedCriteria = criteria.matrix[0].map((field) => columnIndexFromField(header, field, list.parsed));
    const criteriaRows = criteria.matrix.slice(1).map((row) => {
      const mapped = new Array(header.length).fill("");
      row.forEach((value, index) => {
        const target = mappedCriteria[index];
        if (target >= 0) mapped[target] = value;
      });
      return mapped;
    });
    const matched = criteriaRows.length
      ? list.matrix.slice(1).filter((row) => rowMatchesCriteria(row, header, criteriaRows))
      : list.matrix.slice(1);
    const actionNote = state.config.action === "copyTo" && state.config.copyTo
      ? tr("lab.destinationLabel", { cell: state.config.copyTo })
      : tr("lab.opt.filterInPlace");
    return renderPreviewShell(state, renderMatrixTable([header].concat(matched), {
      caption: String(matched.length) + " / " + String(list.matrix.length - 1) + " · " + actionNote,
    }), tr("lab.mode.advancedFilter"));
  }

  function removeDuplicateRows(matrix, header, state) {
    const config = state.config;
    const checks = (config.columnsToCheck || []).map((field) => columnIndexFromField(header, field, null)).filter((index) => index >= 0);
    const indexes = checks.length ? checks : header.map((_, index) => index);
    const seen = new Set();
    const kept = [];
    let removed = 0;
    matrix.forEach((row) => {
      const key = JSON.stringify(indexes.map((index) => row[index]));
      if (seen.has(key)) {
        removed += 1;
        return;
      }
      seen.add(key);
      kept.push(row);
    });
    return { kept, removed };
  }

  function renderRemoveDuplicatesPreview(spec, state) {
    const source = sheetRangeMatrix(state, state.config.range);
    if (!source) {
      return renderPreviewShell(state, `${renderSheetGrid(spec, state)}<p class="lab-preview-note">${escapeHtml(tr("lab.noData"))}</p>`,
        tr("lab.mode.removeDuplicates"));
    }
    const header = source.matrix[0] || [];
    const rows = source.matrix.slice(1);
    const result = removeDuplicateRows(rows, header, state);
    return renderPreviewShell(state, renderMatrixTable([header].concat(result.kept), {
      caption: tr("lab.rowsRemoved", { count: result.removed }),
    }), tr("lab.mode.removeDuplicates"));
  }

  function splitDelimitedRow(line, delimiter) {
    const values = [];
    let value = "";
    let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
      const character = line[index];
      if (character === '"') {
        if (quoted && line[index + 1] === '"') {
          value += '"';
          index += 1;
        } else {
          quoted = !quoted;
        }
      } else if (character === delimiter && !quoted) {
        values.push(value);
        value = "";
      } else {
        value += character;
      }
    }
    values.push(value);
    return values;
  }

  function renderTextToColumnsPreview(spec, state) {
    const source = sheetRangeMatrix(state, state.config.range);
    if (!source) {
      return renderPreviewShell(state, `${renderSheetGrid(spec, state)}<p class="lab-preview-note">${escapeHtml(tr("lab.noData"))}</p>`,
        tr("lab.mode.textToColumns"));
    }
    const delimiter = state.config.delimiter || ",";
    const matrix = source.matrix.map((row) => {
      const sourceValue = row[0] == null ? "" : String(row[0]);
      if (state.config.dataType === "delimited") return splitDelimitedRow(sourceValue, delimiter);
      return [sourceValue.slice(0, Math.max(1, Math.ceil(sourceValue.length / 2))), sourceValue.slice(Math.ceil(sourceValue.length / 2))];
    });
    return renderPreviewShell(state, renderMatrixTable(matrix, {
      headerRows: 0,
      caption: tr("lab.mode.textToColumns"),
    }), tr("lab.mode.textToColumns"));
  }

  function renderPasteSpecialPreview(spec, state) {
    const source = sheetRangeMatrix(state, state.config.sourceRange || state.config.range);
    if (!source) {
      return renderPreviewShell(state, `${renderSheetGrid(spec, state)}<p class="lab-preview-note">${escapeHtml(tr("lab.noData"))}</p>`,
        tr("lab.mode.pasteSpecial"));
    }
    let matrix = state.config.transpose ? transposeMatrix(source.matrix) : source.matrix;
    if (["add", "subtract", "multiply", "divide"].includes(state.config.pasteOperation)) {
      const destination = parseRange(state.config.destination);
      if (destination) {
        matrix = matrix.map((row, rowIndex) => row.map((value, colIndex) => {
          const targetRef = numberToCol(destination.left + colIndex) + (destination.top + rowIndex);
          const target = cellNumericValue(state, state.activeSheet, targetRef);
          const left = Number(value);
          if (target == null || !Number.isFinite(left)) return value;
          if (state.config.pasteOperation === "add") return left + target;
          if (state.config.pasteOperation === "subtract") return left - target;
          if (state.config.pasteOperation === "multiply") return left * target;
          return target === 0 ? "#DIV/0!" : left / target;
        }));
      }
    }
    const note = state.config.destination
      ? tr("lab.destinationLabel", { cell: state.config.destination })
      : tr("lab.mode.pasteSpecial");
    return renderPreviewShell(state, renderMatrixTable(matrix, {
      headerRows: 0,
      caption: optionText(state.config.pasteOperation) + " · " + note,
    }), tr("lab.mode.pasteSpecial"));
  }

  function subtotalValue(values, functionNumber) {
    const numbers = values.filter((value) => typeof value === "number" && Number.isFinite(value));
    if (functionNumber === 9) return numbers.reduce((total, value) => total + value, 0);
    if (functionNumber === 1) return numbers.length ? numbers.reduce((total, value) => total + value, 0) / numbers.length : "";
    if (functionNumber === 2) return numbers.length;
    if (functionNumber === 3) return values.filter((value) => value !== "" && value != null).length;
    if (functionNumber === 4) return numbers.length ? Math.max(...numbers) : "";
    if (functionNumber === 5) return numbers.length ? Math.min(...numbers) : "";
    return "";
  }

  function renderSubtotalPreview(spec, state) {
    const source = sheetRangeMatrix(state, state.config.range);
    if (!source || source.matrix.length < 2) {
      return renderPreviewShell(state, `${renderSheetGrid(spec, state)}<p class="lab-preview-note">${escapeHtml(tr("lab.noData"))}</p>`,
        tr("lab.mode.subtotal"));
    }
    const header = source.matrix[0];
    const rows = source.matrix.slice(1);
    const groupIndex = columnIndexFromField(header, state.config.groupBy, source.parsed);
    if (groupIndex < 0) {
      return renderPreviewShell(state, renderMatrixTable(source.matrix, { caption: tr("lab.mode.subtotal") }), tr("lab.mode.subtotal"));
    }
    const selectedColumns = (state.config.subtotalColumns || []).map((field) => columnIndexFromField(header, field, source.parsed));
    const valueColumns = selectedColumns.length
      ? selectedColumns
      : header.map((_, index) => index).filter((index) => rows.some((row) => typeof row[index] === "number"));
    const groups = new Map();
    rows.forEach((row) => {
      const key = String(row[groupIndex] == null ? "" : row[groupIndex]);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    });
    const output = [header];
    groups.forEach((groupRows, key) => {
      output.push(...groupRows);
      const totalRow = new Array(header.length).fill("");
      totalRow[groupIndex] = key + " · " + tr("lab.result");
      valueColumns.forEach((column) => {
        totalRow[column] = subtotalValue(groupRows.map((row) => row[column]), Number(state.config.functionNumber));
      });
      output.push(totalRow);
    });
    return renderPreviewShell(state, renderMatrixTable(output, {
      caption: String(groups.size) + " · " + tr("lab.mode.subtotal"),
    }), tr("lab.mode.subtotal"));
  }

  function qualifiedRangeMatrix(state, text) {
    const source = String(text || "").trim();
    const match = /^(?:'([^']+)'|([^!]+))!(.+)$/.exec(source);
    const sheetName = match ? actualSheetName(state, (match[1] || match[2]).trim()) : state.activeSheet;
    const range = match ? match[3] : source;
    return sheetName ? sheetRangeMatrix(state, range, sheetName) : null;
  }

  function renderConsolidatePreview(spec, state) {
    const ranges = String(state.config.ranges || "").split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);
    const sources = ranges.map((range) => qualifiedRangeMatrix(state, range)).filter(Boolean);
    if (!sources.length) {
      return renderPreviewShell(state, `${renderSheetGrid(spec, state)}<p class="lab-preview-note">${escapeHtml(tr("lab.noData"))}</p>`,
        tr("lab.mode.consolidate"));
    }
    const maxRows = Math.max(...sources.map((source) => source.matrix.length));
    const maxCols = Math.max(...sources.map((source) => Math.max(...source.matrix.map((row) => row.length))));
    const matrix = [];
    for (let row = 0; row < maxRows; row += 1) {
      const values = [];
      for (let col = 0; col < maxCols; col += 1) {
        const candidates = sources.map((source) => source.matrix[row] && source.matrix[row][col]).filter((value) => value !== "" && value != null);
        values.push(subtotalValue(candidates, Number(state.config.functionNumber)));
      }
      matrix.push(values);
    }
    return renderPreviewShell(state, renderMatrixTable(matrix, {
      headerRows: state.config.useTopRow ? 1 : 0,
      caption: tr("lab.mode.consolidate") + " · " + String(sources.length),
    }), tr("lab.mode.consolidate"));
  }

  function parseImportText(text, delimiter) {
    return String(text || "").split(/\r?\n/).filter((line, index, lines) => (
      line !== "" || index < lines.length - 1
    )).map((line) => splitDelimitedRow(line, delimiter));
  }

  function importDelimiter(config) {
    if (config.importSource === "tab") return "\t";
    if (config.importSource === "semicolon") return ";";
    return stateDelimiter(config.delimiter);
  }

  function stateDelimiter(delimiter) {
    if (delimiter === "\\t" || delimiter === "tab") return "\t";
    return delimiter || ",";
  }

  function renderImportPreview(spec, state) {
    if (!String(state.config.importText || "").trim()) {
      return renderPreviewShell(state, `${renderSheetGrid(spec, state)}<p class="lab-preview-note">${escapeHtml(tr("lab.noData"))}</p>`,
        tr("lab.mode.import"));
    }
    const matrix = parseImportText(state.config.importText, importDelimiter(state.config));
    return renderPreviewShell(state, renderMatrixTable(matrix, {
      headerRows: state.config.hasHeaders ? 1 : 0,
      caption: tr("lab.mode.import") + " · " + String(matrix.length) + " × " + String(matrix[0] ? matrix[0].length : 0),
    }), tr("lab.mode.import"));
  }

  function chartSeriesFromState(state) {
    const source = sheetRangeMatrix(state, state.config.dataRange);
    if (!source || source.matrix.length < 2 || !source.matrix[0].length) return null;
    const matrix = source.matrix;
    if (state.config.seriesBy === "rows") {
      const categories = matrix[0].slice(1).map((value) => String(value == null ? "" : value));
      const series = matrix.slice(1).map((row) => ({
        name: String(row[0] == null ? "" : row[0]),
        values: row.slice(1).map((value) => Number(value)).map((value) => (Number.isFinite(value) ? value : null)),
      })).filter((item) => item.values.some((value) => value != null));
      return { categories, series, xName: "" };
    }
    const header = matrix[0];
    const categories = matrix.slice(1).map((row) => String(row[0] == null ? "" : row[0]));
    const series = [];
    for (let col = 1; col < header.length; col += 1) {
      const values = matrix.slice(1).map((row) => {
        const number = Number(row[col]);
        return Number.isFinite(number) ? number : null;
      });
      if (values.some((value) => value != null)) {
        series.push({ name: String(header[col] == null ? numberToCol(col) : header[col]), values });
      }
    }
    return {
      categories,
      series,
      xName: String(header[0] == null ? "" : header[0]),
    };
  }

  function renderChartSvg(state, model, options) {
    const settings = options || {};
    const width = 680;
    const height = 300;
    const left = 48;
    const right = 18;
    const top = 30;
    const bottom = 48;
    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;
    const chartType = String(state.config.chartType || "column").toLowerCase();
    const allValues = model.series.flatMap((series) => series.values.filter((value) => value != null));
    if (!allValues.length) return `<div class="lab-empty-state">${escapeHtml(tr("lab.noData"))}</div>`;
    const maxValue = Math.max(0, ...allValues);
    const minValue = Math.min(0, ...allValues);
    const span = maxValue - minValue || 1;
    const y = (value) => top + plotHeight - ((value - minValue) / span) * plotHeight;
    const zeroY = y(0);
    const categories = model.categories.length ? model.categories : model.series[0].values.map((_, index) => String(index + 1));
    const categoryWidth = plotWidth / Math.max(1, categories.length);
    const palette = PALETTE.slice();
    const parts = [];
    parts.push(`<svg class="lab-chart-svg is-${escapeHtml(chartType)}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(
      state.config.title || tr(settings.chartTitleKey || "lab.mode.chart")
    )}">`);
    if (settings.background !== false) {
      parts.push(`<rect x="0" y="0" width="${width}" height="${height}" rx="16" fill="#ffffff"></rect>`);
    }
    parts.push(`<line x1="${left}" y1="${zeroY}" x2="${width - right}" y2="${zeroY}" stroke="#cbd8c6" stroke-width="1"></line>`);
    for (let step = 0; step <= 4; step += 1) {
      const value = minValue + (span * step) / 4;
      const lineY = y(value);
      parts.push(`<line x1="${left}" y1="${lineY}" x2="${width - right}" y2="${lineY}" stroke="#edf2e9" stroke-width="1"></line>`);
      parts.push(`<text x="${left - 8}" y="${lineY + 4}" text-anchor="end" fill="#718074" font-size="10">${escapeHtml(
        String(Math.round(value * 100) / 100)
      )}</text>`);
    }
    if (chartType !== "scatter") categories.forEach((category, index) => {
      if (categories.length > 8 && index % 2) return;
      const center = left + categoryWidth * index + categoryWidth / 2;
      parts.push(`<text x="${center}" y="${height - 20}" text-anchor="middle" fill="#718074" font-size="10">${escapeHtml(
        String(category).slice(0, 12)
      )}</text>`);
    });
    if (chartType === "pie") {
      const values = model.series[0].values.map((value) => Math.abs(value || 0));
      const total = values.reduce((sum, value) => sum + value, 0);
      let angle = -Math.PI / 2;
      const centerX = width / 2;
      const centerY = height / 2 + 4;
      const radius = Math.min(plotWidth, plotHeight) / 2 - 6;
      values.forEach((value, index) => {
        const slice = total ? (value / total) * Math.PI * 2 : 0;
        const end = angle + slice;
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(end) * radius;
        const y2 = centerY + Math.sin(end) * radius;
        const largeArc = slice > Math.PI ? 1 : 0;
        parts.push(`<path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${palette[index % palette.length]}" stroke="#ffffff" stroke-width="2"></path>`);
        if (state.config.dataLabels && slice > 0.25) {
          const mid = angle + slice / 2;
          parts.push(`<text x="${centerX + Math.cos(mid) * radius * 0.62}" y="${centerY + Math.sin(mid) * radius * 0.62}" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="700">${Math.round((value / (total || 1)) * 100)}%</text>`);
        }
        angle = end;
      });
    } else if (chartType === "scatter") {
      const numericCategories = categories.map((category, index) => {
        const number = Number(String(category).replace(/,/g, ""));
        return Number.isFinite(number) ? number : index + 1;
      });
      const yValues = model.series[0] ? model.series[0].values : [];
      const points = numericCategories.map((xValue, index) => {
        const yValue = yValues[index];
        return yValue == null ? null : { xValue, yValue };
      }).filter(Boolean);
      const xMin = Math.min(...points.map((point) => point.xValue));
      const xMax = Math.max(...points.map((point) => point.xValue));
      const xSpan = xMax - xMin || 1;
      const x = (value) => left + ((value - xMin) / xSpan) * plotWidth;
      points.forEach((point) => {
        parts.push(`<circle class="lab-scatter-point" data-x="${escapeHtml(point.xValue)}" data-y="${escapeHtml(point.yValue)}" cx="${x(point.xValue)}" cy="${y(point.yValue)}" r="6" fill="${palette[0]}" fill-opacity="0.82" stroke="#ffffff" stroke-width="2"></circle>`);
        if (state.config.dataLabels) {
          parts.push(`<text x="${x(point.xValue) + 8}" y="${y(point.yValue) - 7}" fill="#475849" font-size="9">${escapeHtml(String(point.yValue))}</text>`);
        }
      });
      if (state.config.trendline && points.length > 1) {
        const avgX = points.reduce((sum, point) => sum + point.xValue, 0) / points.length;
        const avgY = points.reduce((sum, point) => sum + point.yValue, 0) / points.length;
        const numerator = points.reduce((sum, point) => sum + (point.xValue - avgX) * (point.yValue - avgY), 0);
        const denominator = points.reduce((sum, point) => sum + Math.pow(point.xValue - avgX, 2), 0);
        const slope = denominator ? numerator / denominator : 0;
        const intercept = avgY - slope * avgX;
        parts.push(`<line class="lab-scatter-trendline" x1="${x(xMin)}" y1="${y(slope * xMin + intercept)}" x2="${x(xMax)}" y2="${y(slope * xMax + intercept)}" stroke="#143d2b" stroke-width="2" stroke-dasharray="6 4"></line>`);
      }
      for (let step = 0; step <= 4; step += 1) {
        const value = xMin + (xSpan * step) / 4;
        parts.push(`<text x="${x(value)}" y="${height - 20}" text-anchor="middle" fill="#718074" font-size="9">${escapeHtml(String(Math.round(value * 100) / 100))}</text>`);
      }
      parts.push(`<text x="${width - right}" y="${top - 10}" text-anchor="end" fill="#718074" font-size="9">${escapeHtml(
        model.series[0] ? model.series[0].name : tr("lab.field.dataRange")
      )}</text>`);
      if (model.xName) {
        parts.push(`<text x="${width - right}" y="${height - 5}" text-anchor="end" fill="#718074" font-size="9">${escapeHtml(model.xName)}</text>`);
      }
    } else if (chartType === "bar") {
      const rowHeight = plotHeight / Math.max(1, model.series.length * categories.length);
      const x = (value) => left + ((value - minValue) / span) * plotWidth;
      model.series.forEach((series, seriesIndex) => {
        series.values.forEach((value, index) => {
          if (value == null) return;
          const rowIndex = seriesIndex * categories.length + index;
          const barY = top + rowIndex * rowHeight + rowHeight * 0.12;
          const barHeight = Math.max(2, rowHeight * 0.76);
          const startX = Math.min(x(value), x(0));
          const barWidth = Math.abs(x(value) - x(0));
          parts.push(`<rect x="${startX}" y="${barY}" width="${barWidth}" height="${barHeight}" rx="4" fill="${palette[seriesIndex % palette.length]}"></rect>`);
          if (state.config.dataLabels) {
            parts.push(`<text x="${startX + barWidth + 4}" y="${barY + barHeight / 2 + 4}" fill="#475849" font-size="9">${escapeHtml(String(value))}</text>`);
          }
        });
      });
    } else if (chartType === "combo") {
      const primary = model.series[0];
      if (primary) {
        const step = plotWidth / Math.max(1, primary.values.length);
        const eachWidth = plotWidth / Math.max(1, model.series.length * primary.values.length);
        const barWidth = Math.max(5, eachWidth * 0.68);
        primary.values.forEach((value, index) => {
          if (value == null) return;
          const barX = left + step * index + step / 2 - barWidth / 2;
          const barY = Math.min(y(value), zeroY);
          const barHeight = Math.max(1, Math.abs(zeroY - y(value)));
          parts.push(`<rect class="lab-combo-column" x="${barX}" y="${barY}" width="${barWidth}" height="${barHeight}" rx="3" fill="${palette[0]}"></rect>`);
        });
      }
      const secondarySeries = model.series.slice(1);
      const secondaryValues = secondarySeries.flatMap((series) => series.values.filter((value) => value != null));
      const secondaryMax = Math.max(0, ...secondaryValues);
      const secondaryMin = Math.min(0, ...secondaryValues);
      const secondarySpan = secondaryMax - secondaryMin || 1;
      const ySecondary = (value) => top + plotHeight - ((value - secondaryMin) / secondarySpan) * plotHeight;
      const step = plotWidth / Math.max(1, primary ? primary.values.length : 1);
      secondarySeries.forEach((series, seriesIndex) => {
        const points = series.values.map((value, index) => (
          value == null ? null : {
            x: left + step * index + step / 2,
            y: state.config.secondaryAxis ? ySecondary(value) : y(value),
            value,
          }
        )).filter(Boolean);
        if (!points.length) return;
        parts.push(`<path class="lab-combo-line" d="${points.map((point, index) => (
          (index ? "L" : "M") + " " + point.x + " " + point.y
        )).join(" ")}" fill="none" stroke="${palette[(seriesIndex + 1) % palette.length]}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>`);
        points.forEach((point) => {
          parts.push(`<circle cx="${point.x}" cy="${point.y}" r="4" fill="${palette[(seriesIndex + 1) % palette.length]}" stroke="#ffffff" stroke-width="1.5"></circle>`);
          if (state.config.dataLabels) {
            parts.push(`<text x="${point.x}" y="${point.y - 7}" text-anchor="middle" fill="#475849" font-size="9">${escapeHtml(String(point.value))}</text>`);
          }
        });
      });
      if (state.config.secondaryAxis && secondaryValues.length) {
        for (let tick = 0; tick <= 4; tick += 1) {
          const value = secondaryMin + (secondarySpan * tick) / 4;
          parts.push(`<text x="${width - right + 2}" y="${ySecondary(value) + 4}" fill="#718074" font-size="8">${escapeHtml(
            String(Math.round(value * 100) / 100)
          )}</text>`);
        }
      }
    } else {
      const valueCount = Math.max(1, model.series[0] ? model.series[0].values.length : 1);
      const stepWidth = plotWidth / Math.max(1, valueCount - 1);
      model.series.forEach((series, seriesIndex) => {
        const points = series.values.map((value, index) => {
          if (value == null) return null;
          return {
            x: chartType === "column" || chartType === "area"
              ? left + (plotWidth / Math.max(1, series.values.length)) * index + (plotWidth / Math.max(1, series.values.length)) / 2
              : left + stepWidth * index,
            y: y(value),
            value,
          };
        }).filter(Boolean);
        const color = palette[seriesIndex % palette.length];
        if (chartType === "line" || chartType === "area") {
          if (points.length) {
            const path = points.map((point, index) => (index ? "L" : "M") + " " + point.x + " " + point.y).join(" ");
            if (chartType === "area") {
              parts.push(`<path d="${path} L ${points[points.length - 1].x} ${zeroY} L ${points[0].x} ${zeroY} Z" fill="${color}" opacity="0.22"></path>`);
            }
            parts.push(`<path d="${path}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>`);
          }
        } else {
          points.forEach((point, index) => {
            const eachWidth = plotWidth / Math.max(1, model.series.length * series.values.length);
            const barWidth = Math.max(4, eachWidth * 0.68);
            const barX = left + (plotWidth / Math.max(1, series.values.length)) * index +
              (plotWidth / Math.max(1, series.values.length)) / 2 - (barWidth * model.series.length) / 2 + seriesIndex * barWidth;
            const barY = Math.min(point.y, zeroY);
            const barHeight = Math.max(1, Math.abs(zeroY - point.y));
            parts.push(`<rect x="${barX}" y="${barY}" width="${barWidth}" height="${barHeight}" rx="3" fill="${color}"></rect>`);
          });
        }
        if (state.config.dataLabels) {
          points.forEach((point) => {
            parts.push(`<text x="${point.x}" y="${point.y - 6}" text-anchor="middle" fill="#475849" font-size="9">${escapeHtml(String(point.value))}</text>`);
          });
        }
        if (state.config.trendline && points.length > 1) {
          const first = points[0];
          const last = points[points.length - 1];
          parts.push(`<line x1="${first.x}" y1="${first.y}" x2="${last.x}" y2="${last.y}" stroke="#143d2b" stroke-width="1.5" stroke-dasharray="5 4" opacity="0.6"></line>`);
        }
      });
    }
    parts.push("</svg>");
    return parts.join("");
  }

  function renderChartLegend(state, model) {
    if (!state.config.showLegend || !model || !model.series.length) return "";
    return `<div class="lab-chart-legend" aria-label="${escapeHtml(tr("lab.chartLegend"))}">${
      model.series.map((series, index) => (
        `<span><i style="background:${PALETTE[index % PALETTE.length]}"></i>${escapeHtml(series.name)}</span>`
      )).join("")
    }</div>`;
  }

  function renderChartPreview(spec, state) {
    const model = chartSeriesFromState(state);
    if (!model) {
      return renderPreviewShell(state, `${renderSheetGrid(spec, state)}<p class="lab-preview-note">${escapeHtml(tr("lab.noData"))}</p>`,
        tr("lab.mode.chart"));
    }
    const content = `<div class="lab-chart-card">
      <div class="lab-chart-title">${escapeHtml(state.config.title || tr("lab.mode.chart"))}</div>
      ${renderChartSvg(state, model)}
      ${renderChartLegend(state, model)}
      ${state.config.secondaryAxis ? `<span class="lab-axis-badge">${escapeHtml(tr("lab.field.secondaryAxis"))}</span>` : ""}
    </div>`;
    return renderPreviewShell(state, content, tr("lab.mode.chart"));
  }

  function renderSparklineSvg(values, type, width, height) {
    const numbers = values.map((value) => Number(value)).map((value) => (Number.isFinite(value) ? value : null));
    const present = numbers.filter((value) => value != null);
    if (!present.length) return "";
    const max = Math.max(...present);
    const min = Math.min(...present);
    const span = max - min || 1;
    const step = width / Math.max(1, numbers.length - 1);
    const points = numbers.map((value, index) => ({
      x: index * step,
      y: value == null ? height : height - ((value - min) / span) * (height - 4) - 2,
      value,
    }));
    if (type === "column") {
      const barWidth = Math.max(2, width / Math.max(1, numbers.length) * 0.7);
      return `<svg viewBox="0 0 ${width} ${height}" class="lab-spark-svg" aria-hidden="true">${points.map((point) => (
        point.value == null ? "" : `<rect x="${point.x - barWidth / 2}" y="${point.y}" width="${barWidth}" height="${Math.max(1, height - point.y)}" rx="1" fill="#58cc02"></rect>`
      )).join("")}</svg>`;
    }
    if (type === "winloss") {
      const barWidth = Math.max(2, width / Math.max(1, numbers.length) * 0.7);
      return `<svg viewBox="0 0 ${width} ${height}" class="lab-spark-svg" aria-hidden="true">${points.map((point) => (
        point.value == null ? "" : `<rect x="${point.x - barWidth / 2}" y="${point.value >= 0 ? 1 : height / 2}" width="${barWidth}" height="${height / 2 - 1}" fill="${point.value >= 0 ? "#58cc02" : "#ff4b4b"}"></rect>`
      )).join("")}</svg>`;
    }
    return `<svg viewBox="0 0 ${width} ${height}" class="lab-spark-svg" aria-hidden="true"><path d="${
      points.map((point, index) => (index ? "L" : "M") + point.x + " " + point.y).join(" ")
    }" fill="none" stroke="#58cc02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
  }

  function renderSparklinePreview(spec, state) {
    const source = sheetRangeMatrix(state, state.config.sparklineRange);
    if (!source) {
      return renderPreviewShell(state, `${renderSheetGrid(spec, state)}<p class="lab-preview-note">${escapeHtml(tr("lab.noData"))}</p>`,
        tr("lab.mode.sparkline"));
    }
    const values = source.matrix[0] || [];
    const spark = renderSparklineSvg(values, state.config.sparklineType, 220, 56);
    const content = `${renderSheetGrid(spec, state)}<div class="lab-spark-card">
      <span>${escapeHtml(tr("lab.mode.sparkline"))}</span>
      ${spark || `<span class="lab-control-help">${escapeHtml(tr("lab.noData"))}</span>`}
      <code>${escapeHtml(state.config.targetCell || "H2")}</code>
    </div>`;
    return renderPreviewShell(state, content, tr("lab.mode.sparkline"));
  }

  function pivotFieldIndex(header, field, parsedRange) {
    return columnIndexFromField(header, field, parsedRange);
  }

  function dateGroupKey(value, grouping) {
    if (!grouping || grouping === "none") return String(value == null ? "" : value);
    let date = null;
    if (typeof value === "number") date = new Date(Date.UTC(1899, 11, 30) + Math.floor(value) * 86400000);
    else {
      const parsed = Date.parse(String(value));
      if (!Number.isNaN(parsed)) date = new Date(parsed);
    }
    if (!date || Number.isNaN(date.getTime())) return String(value == null ? "" : value);
    if (grouping === "year") return String(date.getUTCFullYear());
    if (grouping === "quarter") return date.getUTCFullYear() + " Q" + (Math.floor(date.getUTCMonth() / 3) + 1);
    return date.getUTCFullYear() + "-" + String(date.getUTCMonth() + 1).padStart(2, "0");
  }

  function aggregateValues(values, aggregate) {
    const mode = String(aggregate || "SUM").toUpperCase();
    const numbers = values.filter((value) => typeof value === "number" && Number.isFinite(value));
    if (mode === "COUNT") return values.filter((value) => value !== "" && value != null).length;
    if (mode === "AVERAGE") return numbers.length ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length : 0;
    if (mode === "MAX") return numbers.length ? Math.max(...numbers) : 0;
    if (mode === "MIN") return numbers.length ? Math.min(...numbers) : 0;
    return numbers.reduce((sum, value) => sum + value, 0);
  }

  function calculatedPivotValue(row, config, header, parsedRange, state) {
    const calculated = config.calculatedField || {};
    const formula = String(calculated.formula || "").trim();
    if (!formula) return 0;
    const names = {};
    const rawSheet = state.sheets[state.activeSheet] || {};
    for (let index = 0; index < header.length; index += 1) {
      const value = typeof row[index] === "number" ? row[index] : Number(row[index]);
      if (!Number.isFinite(value)) continue;
      const letter = numberToCol(parsedRange.left + index);
      names[letter] = value;
      const displayName = localizedCellText(header[index]).trim();
      if (/^[A-Za-z_][A-Za-z0-9_.]*$/.test(displayName)) names[displayName] = value;
      const rawHeader = rawSheet[letter + parsedRange.top];
      if (isLocalizedValue(rawHeader)) {
        LANGUAGE_KEYS.forEach((language) => {
          const translated = rawHeader[language];
          if (typeof translated === "string" && /^[A-Za-z_][A-Za-z0-9_.]*$/.test(translated.trim())) {
            names[translated.trim()] = value;
          }
        });
      }
    }
    const result = Engine.evaluate(formula, {}, { names });
    return result.ok && typeof result.value === "number" ? result.value : 0;
  }

  function buildPivot(state) {
    const source = sheetRangeMatrix(state, state.config.sourceRange);
    if (!source || source.matrix.length < 2) return null;
    const matrix = source.matrix;
    const header = matrix[0];
    const rowFields = (state.config.rows || []).map((field) => pivotFieldIndex(header, field, source.parsed)).filter((index) => index >= 0);
    const columnFields = (state.config.columns || []).map((field) => pivotFieldIndex(header, field, source.parsed)).filter((index) => index >= 0);
    const calculatedName = String((state.config.calculatedField && state.config.calculatedField.name) || "").trim().toLowerCase();
    const valueFields = (state.config.values || []).map((value) => {
      const calculated = Boolean(calculatedName) && String(value.field || "").trim().toLowerCase() === calculatedName;
      return {
        index: calculated ? -1 : pivotFieldIndex(header, value.field, source.parsed),
        field: value.field,
        calculated,
        aggregate: String(value.aggregate || "SUM").toUpperCase(),
      };
    }).filter((value) => value.index >= 0 || value.calculated);
    const filterFields = (state.config.filters || []).map((filter) => ({
      index: pivotFieldIndex(header, filter.field, source.parsed),
      value: filter.value,
    })).filter((filter) => filter.index >= 0);
    const filteredRows = matrix.slice(1).filter((row) => filterFields.every((filter) => (
      localizedCellText(row[filter.index]).toLowerCase() === localizedCellText(filter.value).toLowerCase()
    )));
    if (!rowFields.length || !valueFields.length) {
      return { empty: true, header, rowFields, columnFields, valueFields, filteredRows };
    }
    const rowKeys = [];
    const columnKeys = [];
    const rowKeySet = new Set();
    const columnKeySet = new Set();
    const grouped = new Map();
    filteredRows.forEach((row) => {
      const rowKey = rowFields.map((index) => dateGroupKey(row[index], state.config.groupDate)).join(" | ");
      const columnKey = columnFields.length
        ? columnFields.map((index) => dateGroupKey(row[index], state.config.groupDate)).join(" | ")
        : "";
      if (!rowKeySet.has(rowKey)) {
        rowKeySet.add(rowKey);
        rowKeys.push(rowKey);
      }
      if (!columnKeySet.has(columnKey)) {
        columnKeySet.add(columnKey);
        columnKeys.push(columnKey);
      }
      const key = rowKey + "\u0001" + columnKey;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(row);
    });
    rowKeys.sort((left, right) => left.localeCompare(right));
    columnKeys.sort((left, right) => left.localeCompare(right));
    const values = valueFields.map((value) => {
      const cells = {};
      let total = 0;
      rowKeys.forEach((rowKey) => {
        cells[rowKey] = {};
        columnKeys.forEach((columnKey) => {
          const rows = grouped.get(rowKey + "\u0001" + columnKey) || [];
          const result = aggregateValues(rows.map((row) => (
            value.calculated
              ? calculatedPivotValue(row, state.config, header, source.parsed, state)
              : row[value.index]
          )), value.aggregate);
          cells[rowKey][columnKey] = result;
          total += typeof result === "number" ? result : 0;
        });
      });
      return Object.assign({}, value, { cells, total });
    });
    return {
      empty: false,
      header,
      rowFields,
      columnFields,
      valueFields: values,
      rowKeys,
      columnKeys,
      rowFieldNames: rowFields.map((index) => header[index]),
      columnFieldNames: columnFields.map((index) => header[index]),
      filteredRows,
    };
  }

  function pivotDisplayValue(model, value, rowKey, columnKey, state) {
    const raw = value.cells[rowKey] && value.cells[rowKey][columnKey];
    if (typeof raw !== "number") return raw == null ? "" : raw;
    if (state.config.showAs === "percentOfGrandTotal") return model.grandTotal ? raw / model.grandTotal : 0;
    if (state.config.showAs === "percentOfRowTotal") {
      const rowTotal = model.columnKeys.reduce((sum, key) => sum + Number(value.cells[rowKey][key] || 0), 0);
      return rowTotal ? raw / rowTotal : 0;
    }
    if (state.config.showAs === "percentOfColumnTotal") {
      const columnTotal = model.rowKeys.reduce((sum, key) => sum + Number(value.cells[key][columnKey] || 0), 0);
      return columnTotal ? raw / columnTotal : 0;
    }
    return raw;
  }

  function renderPivotTable(state, model) {
    if (!model || model.empty) return `<div class="lab-empty-state">${escapeHtml(tr("lab.noData"))}</div>`;
    const sections = [];
    model.valueFields.forEach((value) => {
      model.grandTotal = value.total;
      const columnHeaders = model.columnKeys.length ? model.columnKeys : [tr("lab.pivotTotal")];
      const table = [];
      table.push(`<table class="lab-pivot-table">
        <caption>${escapeHtml(String(value.field) + " · " + optionText(value.aggregate))}</caption>
        <thead><tr><th scope="col" colspan="${Math.max(1, model.rowFieldNames.length)}">${escapeHtml(model.rowFieldNames.join(" / "))}</th>${
          columnHeaders.map((key) => `<th scope="col">${escapeHtml(key || tr("lab.pivotTotal"))}</th>`).join("")
        }<th scope="col">${escapeHtml(tr("lab.pivotTotal"))}</th></tr></thead><tbody>`);
      model.rowKeys.forEach((rowKey) => {
        const rowTotal = columnHeaders.reduce((sum, columnKey) => (
          sum + Number(value.cells[rowKey][columnKey] || 0)
        ), 0);
        table.push(`<tr><th scope="row">${escapeHtml(rowKey)}</th>${
          columnHeaders.map((columnKey) => {
            const displayed = pivotDisplayValue(model, value, rowKey, columnKey, state);
            return `<td>${escapeHtml(state.config.showAs === "normal" ? String(Math.round(displayed * 100) / 100) : (Math.round(displayed * 1000) / 10) + "%")}</td>`;
          }).join("")
        }<td class="is-total">${escapeHtml(String(Math.round(rowTotal * 100) / 100))}</td></tr>`);
      });
      const totalLabel = model.rowFieldNames.join(" / ") || tr("lab.pivotTotal");
      table.push(`<tr class="is-grand-total"><th scope="row">${escapeHtml(totalLabel)} ${escapeHtml(tr("lab.pivotTotal"))}</th>${
        columnHeaders.map((columnKey) => {
          const total = model.rowKeys.reduce((sum, rowKey) => (
            sum + Number(value.cells[rowKey][columnKey] || 0)
          ), 0);
          return `<td>${escapeHtml(String(Math.round(total * 100) / 100))}</td>`;
        }).join("")
      }<td class="is-total">${escapeHtml(String(Math.round(value.total * 100) / 100))}</td></tr>`);
      table.push("</tbody></table>");
      sections.push(table.join(""));
    });
    const filters = (state.config.filters || []).map((filter) => (
      `<span>${escapeHtml(String(filter.field) + " = " + localizedCellText(filter.value))}</span>`
    )).join("");
    return `<div class="lab-pivot-wrap">
      ${filters ? `<div class="lab-pivot-filters">${filters}</div>` : ""}
      ${state.config.slicer ? `<div class="lab-slicer">${escapeHtml(tr("lab.field.slicer"))}</div>` : ""}
      <div class="lab-table-scroll">${sections.join("")}</div>
      <div class="lab-preview-foot">
        <span>${escapeHtml(tr("lab.pivotSource", { range: state.config.sourceRange || tr("lab.none") }))}</span>
        ${state.config.destination ? `<span>${escapeHtml(tr("lab.destinationLabel", { cell: state.config.destination }))}</span>` : ""}
      </div>
    </div>`;
  }

  function renderPivotPreview(spec, state, withChart) {
    const model = buildPivot(state);
    if (!model) {
      return renderPreviewShell(state, `${renderSheetGrid(spec, state)}<p class="lab-preview-note">${escapeHtml(tr("lab.noData"))}</p>`,
        tr(withChart ? "lab.mode.pivotChart" : "lab.mode.pivot"));
    }
    let chart = "";
    if (withChart && !model.empty && model.valueFields.length) {
      const value = model.valueFields[0];
      const chartMatrix = [[model.rowFieldNames.join(" / ") || tr("lab.pivotTotal")].concat(value.field)].concat(
        model.rowKeys.map((rowKey) => [
          rowKey,
          model.columnKeys.reduce((sum, columnKey) => sum + Number(value.cells[rowKey][columnKey] || 0), 0),
        ])
      );
      const chartModel = {
        categories: chartMatrix.slice(1).map((row) => row[0]),
        series: [{ name: String(value.field), values: chartMatrix.slice(1).map((row) => row[1]) }],
      };
      chart = `<div class="lab-chart-card is-compact"><div class="lab-chart-title">${escapeHtml(state.config.title || value.field)}</div>${
        renderChartSvg(state, chartModel, { chartTitleKey: "lab.mode.pivotChart" })
      }${renderChartLegend(state, chartModel)}</div>`;
    }
    const refreshBadge = state.config.refresh
      ? `<div class="lab-refresh-badge">${escapeHtml(tr("lab.pivotRefreshed"))}</div>`
      : "";
    const content = refreshBadge + chart + renderPivotTable(state, model);
    return renderPreviewShell(state, content, tr(withChart ? "lab.mode.pivotChart" : "lab.mode.pivot"));
  }

  function referencesInFormula(formula) {
    const text = String(formula || "").replace(/"(?:[^"]|"")*"/g, '""');
    return Array.from(new Set(text.match(/\$?[A-Z]{1,3}\$?\d{1,7}(?::\$?[A-Z]{1,3}\$?\d{1,7})?/g) || []));
  }

  function renderAuditPreview(spec, state) {
    const cell = normalizeRef(state.config.auditCell);
    const sheet = state.sheets[state.activeSheet] || {};
    const action = state.config.auditAction;
    let related = [];
    if (action === "dependents" && cell) {
      Object.entries(sheet).forEach(([ref, value]) => {
        if (typeof value === "string" && value.startsWith("=") && referencesInFormula(value).some((token) => (
          token.split(":").some((part) => normalizeRef(part) === cell) || inRange(cell, token)
        ))) {
          related.push(ref);
        }
      });
    } else if (cell && typeof sheet[cell] === "string" && sheet[cell].startsWith("=")) {
      related = referencesInFormula(sheet[cell]);
    } else {
      related = Object.keys(sheet).filter((ref) => typeof sheet[ref] === "string" && sheet[ref].startsWith("="));
    }
    const info = `${renderSheetGrid(spec, state)}<div class="lab-audit-card">
      <span>${escapeHtml(optionText(action))} · <code>${escapeHtml(cell || tr("lab.none"))}</code></span>
      <div class="lab-chip-row">${related.length
        ? related.map((ref) => `<span class="lab-chip is-static">${escapeHtml(ref)}</span>`).join("")
        : `<span class="lab-control-help">${escapeHtml(tr("lab.none"))}</span>`}
      </div>
    </div>`;
    return renderPreviewShell(state, info, tr("lab.mode.audit"));
  }

  function renderPrintPreview(spec, state) {
    const config = state.config;
    const paper = PAGE_SIZES[config.paper] || PAGE_SIZES.A4;
    const landscape = config.orientation === "landscape";
    const width = landscape ? paper.height : paper.width;
    const height = landscape ? paper.width : paper.height;
    const area = rangeReference(config.printArea) || state.range;
    const source = sheetRangeMatrix(state, area) || sheetRangeMatrix(state, state.range);
    const matrix = source ? source.matrix.slice(0, 18).map((row) => row.slice(0, 8)) : [];
    const marginClass = config.margins === "narrow" ? "is-narrow" : config.margins === "wide" ? "is-wide" : "";
    const table = renderMatrixTable(matrix, {
      headerRows: 1,
      maxRows: 18,
      maxCols: 8,
      empty: tr("lab.noData"),
    });
    return renderPreviewShell(state, `<div class="lab-print-stage">
      <div class="lab-print-page ${landscape ? "is-landscape" : "is-portrait"} ${marginClass}${config.gridlines ? " has-gridlines" : ""}" style="--page-ratio:${width} / ${height};--print-scale:${Math.max(20, Math.min(200, Number(config.scale) || 100)) / 100}">
        <div class="lab-print-header">${escapeHtml(config.header || config.title || tr("lab.printPreview"))}</div>
        <div class="lab-print-body">${table}</div>
        <div class="lab-print-footer">${escapeHtml(config.footer || tr("lab.printAreaLabel", { range: area || tr("lab.none") }))}</div>
      </div>
      <div class="lab-print-meta">
        <span>${escapeHtml(config.paper)}</span>
        <span>${escapeHtml(optionText(config.orientation))}</span>
        <span>${escapeHtml(config.scale + "%")}</span>
        ${config.printTitles ? `<span>${escapeHtml(config.printTitles)}</span>` : ""}
      </div>
    </div>`, tr("lab.mode.print"));
  }

  function goalSeekEstimate(state) {
    const target = parseRange(state.config.targetCell);
    const variable = parseRange(state.config.variableCell);
    const targetValue = Number(state.config.targetValue);
    if (!target || !variable || target.start !== target.end || variable.start !== variable.end ||
        !Number.isFinite(targetValue)) return null;
    const sheetName = state.activeSheet;
    const evaluate = (candidate) => {
      const sheet = localizedSheetMap(clone(state.sheets[sheetName] || {}));
      sheet[variable.start] = candidate;
      const sheets = {};
      Object.entries(state.sheets).forEach(([name, cells]) => {
        sheets[name] = localizedSheetMap(cells);
      });
      sheets[sheetName] = sheet;
      const result = Engine.evaluate("=" + target.start, sheet, {
        sheets,
        names: state.names,
        formulaCell: target.start,
      });
      return result.ok && typeof result.value === "number" ? result.value : null;
    };
    const current = evaluate(0);
    if (current == null) return { current: null, suggestion: null, targetValue };
    const low = -100000;
    const high = 100000;
    const steps = 160;
    let previous = { x: low, value: evaluate(low) };
    let bracket = null;
    for (let index = 1; index <= steps; index += 1) {
      const x = low + ((high - low) * index) / steps;
      const value = evaluate(x);
      if (value == null) continue;
      if (previous.value != null && (previous.value - targetValue) * (value - targetValue) <= 0) {
        bracket = { low: previous.x, high: x };
        break;
      }
      previous = { x, value };
    }
    let suggestion = null;
    if (bracket) {
      let left = bracket.low;
      let right = bracket.high;
      for (let index = 0; index < 70; index += 1) {
        const middle = (left + right) / 2;
        const middleValue = evaluate(middle);
        if (middleValue == null) break;
        if (Math.abs(middleValue - targetValue) < 1e-7) {
          suggestion = middle;
          break;
        }
        const leftValue = evaluate(left);
        if (leftValue == null) break;
        if ((leftValue - targetValue) * (middleValue - targetValue) <= 0) right = middle;
        else left = middle;
      }
      if (suggestion == null) suggestion = (left + right) / 2;
    }
    return {
      current,
      suggestion: suggestion == null ? null : Math.round(suggestion * 100) / 100,
      targetValue,
    };
  }

  function renderGoalSeekPreview(spec, state, solver) {
    const result = solver ? null : goalSeekEstimate(state);
    const currentText = result && result.current != null ? String(Math.round(result.current * 100) / 100) : tr("lab.none");
    const suggestion = result && result.suggestion != null
      ? tr("lab.goalSeekEstimate", { value: result.suggestion })
      : tr("lab.noData");
    const cards = `<div class="lab-analysis-cards">
      <div class="lab-analysis-card"><span>${escapeHtml(tr(solver ? "lab.field.objectiveCell" : "lab.field.targetCell"))}</span><strong><code>${escapeHtml(
        (solver ? state.config.objectiveCell : state.config.targetCell) || tr("lab.none")
      )}</code></strong></div>
      <div class="lab-analysis-card"><span>${escapeHtml(tr(solver ? "lab.field.objective" : "lab.result"))}</span><strong>${escapeHtml(
        solver ? optionText(state.config.objective) : currentText
      )}</strong></div>
      <div class="lab-analysis-card is-accent"><span>${escapeHtml(tr(solver ? "lab.field.variableCells" : "lab.field.variableCell"))}</span><strong><code>${escapeHtml(
        (solver ? state.config.variableCells : state.config.variableCell) || tr("lab.none")
      )}</code></strong>${solver ? "" : `<small>${escapeHtml(suggestion)}</small>`}</div>
    </div>`;
    return renderPreviewShell(state, `${renderSheetGrid(spec, state)}${cards}`,
      tr(solver ? "lab.mode.solver" : "lab.mode.goalSeek"));
  }

  function renderDataTablePreview(spec, state) {
    const labels = [
      ["formulaCell", "B2"],
      ["rowInputCell", "B3"],
      ["columnInputCell", "B4"],
      ["resultCell", "D2"],
    ];
    const matrix = [
      labels.map(([key]) => fieldLabel(spec, key)),
      labels.map(([key]) => state.config[key] || tr("lab.none")),
    ];
    return renderPreviewShell(state, `${renderSheetGrid(spec, state)}${renderMatrixTable(matrix, {
      headerRows: 1,
      caption: tr("lab.mode.dataTable"),
    })}`, tr("lab.mode.dataTable"));
  }

  function renderScenarioPreview(spec, state) {
    const scenarios = state.config.scenarios || [];
    const current = scenarios.find((scenario) => scenario.name === state.config.selectedScenario);
    const list = scenarios.length
      ? `${scenarios.map((scenario) => `<div class="lab-scenario-card${scenario === current ? " is-active" : ""}">
          <strong>${escapeHtml(scenario.name)}</strong>
          <span><code>${escapeHtml(scenario.changingCell || "?")}</code> = ${escapeHtml(scenario.value)}</span>
        </div>`).join("")}`
      : `<div class="lab-empty-state">${escapeHtml(tr("lab.noValues"))}</div>`;
    return renderPreviewShell(state, `${renderSheetGrid(spec, state)}<div class="lab-scenario-preview">${list}</div>`,
      tr("lab.mode.scenario"));
  }

  function forecastSeries(state) {
    const source = sheetRangeMatrix(state, state.config.forecastRange);
    if (!source) return null;
    const rows = source.matrix;
    const values = [];
    rows.forEach((row, index) => {
      const x = row.length > 1 ? Number(row[0]) : index + 1;
      const y = Number(row.length > 1 ? row[1] : row[0]);
      if (Number.isFinite(x) && Number.isFinite(y)) values.push({ x, y });
    });
    if (!values.length) return null;
    const count = values.length;
    const sumX = values.reduce((sum, point) => sum + point.x, 0);
    const sumY = values.reduce((sum, point) => sum + point.y, 0);
    const avgX = sumX / count;
    const avgY = sumY / count;
    const numerator = values.reduce((sum, point) => sum + (point.x - avgX) * (point.y - avgY), 0);
    const denominator = values.reduce((sum, point) => sum + Math.pow(point.x - avgX, 2), 0);
    const slope = denominator ? numerator / denominator : 0;
    const intercept = avgY - slope * avgX;
    return { values, slope, intercept, lastX: values[values.length - 1].x };
  }

  function renderForecastPreview(spec, state) {
    const series = forecastSeries(state);
    if (!series) {
      return renderPreviewShell(state, `${renderSheetGrid(spec, state)}<p class="lab-preview-note">${escapeHtml(tr("lab.noData"))}</p>`,
        tr("lab.mode.forecast"));
    }
    const periods = Math.max(1, Math.min(36, Math.trunc(Number(state.config.periods) || 6)));
    const categories = series.values.map((point) => String(point.x));
    const forecastX = [];
    const forecastValues = series.values.map(() => null);
    for (let index = 1; index <= periods; index += 1) {
      const x = series.lastX + index;
      forecastX.push(String(x));
      forecastValues.push(series.slope * x + series.intercept);
    }
    const historyValues = series.values.map((point) => point.y).concat(new Array(periods).fill(null));
    const allCategories = categories.concat(forecastX);
    const chartState = Object.assign({}, state, {
      config: Object.assign({}, state.config, { chartType: "line", title: state.config.title || tr("lab.forecastTrend") }),
    });
    const model = {
      categories: allCategories,
      series: [
        { name: tr("lab.sourceData"), values: historyValues },
        { name: tr("lab.forecastTrend"), values: new Array(series.values.length).fill(null).concat(forecastValues) },
      ],
    };
    return renderPreviewShell(state, `${renderSheetGrid(spec, state)}<div class="lab-chart-card">
      <div class="lab-chart-title">${escapeHtml(tr("lab.forecastTrend"))}</div>
      ${renderChartSvg(chartState, model)}
      ${renderChartLegend(chartState, model)}
    </div>`, tr("lab.mode.forecast"));
  }

  function renderArrayPreview(spec, state) {
    const formula = String(state.config.arrayFormula || state.config.formula || "").trim();
    let resultText = tr("lab.noData");
    let error = false;
    if (formula) {
      const sheet = localizedSheetMap(state.sheets[state.activeSheet] || {});
      const result = Engine.evaluate(formula, sheet, formulaOptions(state, state.activeSheet));
      resultText = result.ok
        ? (isLocalizedValue(result.value) ? localizedCellText(result.value) : result.display)
        : tr("lab.formulaError", { error: result.error });
      error = !result.ok;
    }
    return renderPreviewShell(state, `${renderSheetGrid(spec, state)}<div class="lab-analysis-cards">
      <div class="lab-analysis-card${error ? " is-error" : " is-accent"}">
        <span>${escapeHtml(tr("lab.formulaPreview"))}</span>
        <strong><code>${escapeHtml(formula || tr("lab.none"))}</code></strong>
        <small>${escapeHtml(resultText)}</small>
      </div>
    </div><p class="lab-preview-note">${escapeHtml(tr("lab.arrayLimit"))}</p>`, tr("lab.mode.array"));
  }

  function renderSheetsPreview(spec, state) {
    const badge = `<div class="lab-preview-badges">
      <span>${escapeHtml(tr("lab.sheetsCount", { count: state.sheetOrder.length }))}</span>
      ${state.sheetMeta[state.activeSheet] && state.sheetMeta[state.activeSheet].hidden
        ? `<span>${escapeHtml(tr("lab.hidden"))}</span>` : ""}
      ${state.protection.sheet ? `<span>${escapeHtml(tr("lab.protectedSheet"))}</span>` : ""}
    </div>`;
    return renderPreviewShell(state, `${badge}${renderSheetGrid(spec, state)}`, tr("lab.mode.sheets"));
  }

  function renderDefaultSheetPreview(spec, state) {
    return renderPreviewShell(state, renderSheetGrid(spec, state), tr("lab.mode." + (spec.mode || spec.kind)));
  }

  function renderPreview(labSpec, labState, step) {
    const spec = labSpec && typeof labSpec === "object" ? labSpec : {};
    if (!labState) return `<div class="lab-empty-state">${escapeHtml(tr("lab.stateMissing"))}</div>`;
    const state = labState;
    const mode = String(spec.mode || "").toLowerCase();
    const kind = String(spec.kind || "").toLowerCase();
    try {
      if (kind === "workbook") {
        if (mode === "print") return renderPrintPreview(spec, state);
        if (mode === "audit") return renderAuditPreview(spec, state);
        if (mode === "sheets") return renderSheetsPreview(spec, state);
        return renderDefaultSheetPreview(spec, state);
      }
      if (kind === "format") return renderDefaultSheetPreview(spec, state);
      if (kind === "data") {
        if (mode === "sort") return renderSortPreview(spec, state);
        if (mode === "advancedfilter") return renderAdvancedFilterPreview(spec, state);
        if (mode === "removeduplicates") return renderRemoveDuplicatesPreview(spec, state);
        if (mode === "texttocolumns") return renderTextToColumnsPreview(spec, state);
        if (mode === "pastespecial") return renderPasteSpecialPreview(spec, state);
        if (mode === "subtotal") return renderSubtotalPreview(spec, state);
        if (mode === "consolidate") return renderConsolidatePreview(spec, state);
        if (mode === "import") return renderImportPreview(spec, state);
        return renderDefaultSheetPreview(spec, state);
      }
      if (kind === "visual") {
        if (mode === "chart") return renderChartPreview(spec, state);
        if (mode === "sparkline") return renderSparklinePreview(spec, state);
        if (mode === "pivot") return renderPivotPreview(spec, state, false);
        if (mode === "pivotchart") return renderPivotPreview(spec, state, true);
        return renderDefaultSheetPreview(spec, state);
      }
      if (kind === "analysis") {
        if (mode === "datatable") return renderDataTablePreview(spec, state);
        if (mode === "scenario") return renderScenarioPreview(spec, state);
        if (mode === "solver") return renderGoalSeekPreview(spec, state, true);
        if (mode === "forecast") return renderForecastPreview(spec, state);
        if (mode === "array") return renderArrayPreview(spec, state);
        return renderGoalSeekPreview(spec, state, false);
      }
      return `<div class="lab-empty-state">${escapeHtml(tr("lab.unsupported"))}</div>`;
    } catch (error) {
      return `<div class="lab-empty-state">${escapeHtml(tr("lab.noData"))}</div>`;
    }
  }

  function renderHint(step, state) {
    if (!state.hintVisible) return "";
    const hint = lt(step.hint || "");
    if (!hint) return "";
    return `<div class="hint-box lab-hint"><span class="hint-bulb" aria-hidden="true">
      <svg class="ui-icon" viewBox="0 0 20 20" focusable="false"><path d="M10 2.2a5 5 0 00-3.4 8.7c.6.6.9 1.1.9 1.9h5c0-.8.3-1.3.9-1.9A5 5 0 0010 2.2z"></path><path d="M8 15.5h4M9 18h2"></path></svg>
    </span><div><strong>${escapeHtml(tr("lab.hint"))}</strong><p>${escapeHtml(hint)}</p></div></div>`;
  }

  function feedbackIcon(correct) {
    return `<svg class="lab-feedback-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">${
      correct
        ? '<path d="M4 10l4 4 8-8"></path>'
        : '<path d="M10 3v8"></path><circle cx="10" cy="15" r="1.2"></circle>'
    }</svg>`;
  }

  function renderFeedback(state) {
    if (!state.feedback) return "";
    const correct = state.feedback.type === "correct";
    const button = correct
      ? `<button class="btn btn-primary btn-compact" type="button" data-action="next">${escapeHtml(
        state.isLastStep ? tr("lab.finish") : tr("lab.continue")
      )}</button>`
      : `<button class="btn btn-ghost btn-compact" type="button" data-action="dismiss-feedback">${escapeHtml(tr("lab.retry"))}</button>`;
    return `<div class="feedback ${correct ? "is-correct" : "is-wrong"} lab-feedback" role="status">
      <div class="feedback-badge">${feedbackIcon(correct)}</div>
      <div class="feedback-copy">
        <strong>${escapeHtml(state.feedback.title || tr(correct ? "lab.correctTitle" : "lab.wrongTitle"))}</strong>
        <p>${escapeHtml(state.feedback.body || "")}</p>
      </div>
      ${button}
    </div>`;
  }

  function renderActionBar(state) {
    if (state.feedback && state.feedback.type === "correct") return "";
    return `<div class="action-bar lab-action-bar">
      <button class="hint-button" type="button" data-action="show-hint">
        <svg class="ui-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M10 2.2a5 5 0 00-3.4 8.7c.6.6.9 1.1.9 1.9h5c0-.8.3-1.3.9-1.9A5 5 0 0010 2.2z"></path><path d="M8 15.5h4M9 18h2"></path></svg>
        ${escapeHtml(state.hintVisible ? tr("lab.hideHint") : tr("lab.hint"))}
      </button>
      <button class="btn btn-primary" type="button" data-action="check-lab">${escapeHtml(tr("lab.check"))}</button>
    </div>`;
  }

  function renderHeading(step, level, spec) {
    const kind = level && level.kind ? String(level.kind) : "lesson";
    const difficultyClass = kind === "exam" ? "boss" : kind === "review" ? "mint" : "";
    const modeKey = "lab.mode." + (spec.mode || spec.kind || "");
    const modeLabel = tr(modeKey);
    return `<div class="lesson-heading lab-heading">
      <div class="eyebrow">
        <span>${escapeHtml(tr("type.lab"))}</span>
        <span class="difficulty-pill ${escapeHtml(difficultyClass)}">${escapeHtml(tr("kind." + kind))}</span>
        ${level && !level.hideNumber && level.number
          ? `<span class="level-number-pill">${escapeHtml(tr("label.level"))} ${escapeHtml(level.number)}</span>` : ""}
        <span class="task-kind-pill">${escapeHtml(modeLabel === modeKey ? String(spec.mode || spec.kind || "") : modeLabel)}</span>
      </div>
      <h1>${escapeHtml(lt(step.title))}</h1>
      <p class="lead">${escapeHtml(lt(step.lead))}</p>
    </div>`;
  }

  function renderStep(step, level, state) {
    const labSource = step && step.lab;
    const spec = labSource && typeof labSource === "object" ? labSource : null;
    if (!step || step.type !== "lab" || !spec) {
      return `<article class="lesson-card lab-card"><div class="lab-empty-state">${escapeHtml(tr("lab.missingSpec"))}</div></article>`;
    }
    const appState = state || {};
    const directLabState = appState.sheets && appState.config ? appState : null;
    const labState = directLabState || appState.labState || initialState(spec);
    const viewState = Object.assign({}, labState, {
      feedback: appState.feedback || null,
      hintVisible: Boolean(appState.hintVisible),
      isLastStep: Boolean(appState.isLastStep),
    });
    return `<article class="lesson-card lab-card" data-lab-kind="${escapeHtml(spec.kind || "")}" data-lab-mode="${escapeHtml(spec.mode || "")}">
      ${renderHeading(step, level, spec)}
      <div class="lab-workspace">
        <section class="lab-controls" aria-label="${escapeHtml(tr("lab.controls"))}">
          <div class="lab-panel-head">
            <div><span class="lab-panel-kicker">${escapeHtml(tr("lab.kicker"))}</span><h2>${escapeHtml(tr("lab.controls"))}</h2></div>
            <span class="lab-mode-badge">${escapeHtml(tr("lab.kind." + (spec.kind || "")) || "")}</span>
          </div>
          ${renderModeControls(spec, viewState)}
        </section>
        <section class="lab-preview-panel" aria-label="${escapeHtml(tr("lab.preview"))}">
          <div class="lab-preview" data-lab-preview aria-live="polite">${renderPreview(spec, viewState, step)}</div>
        </section>
      </div>
      ${renderHint(step, viewState)}
      ${renderFeedback(viewState)}
      ${renderActionBar(viewState)}
    </article>`;
  }

  root.ExcelLab = {
    initialState,
    validate,
    handleAction,
    renderStep,
    renderPreview,
  };
})(typeof window !== "undefined" ? window : globalThis);






