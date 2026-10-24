(function registerSheetOperations(global) {
  "use strict";

  const BLANK_FILTER_VALUE = "__EXCEL_BLANK__";
  const EXCEL_MAX_COL = 16384;
  const EXCEL_MAX_ROW = 1048576;

  function parseCellRef(ref) {
    const match = /^\$?([A-Za-z]{1,3})\$?(\d{1,7})$/.exec(String(ref || "").trim());
    if (!match) return null;
    let col = 0;
    for (const character of match[1].toUpperCase()) {
      col = col * 26 + character.charCodeAt(0) - 64;
    }
    const row = Number(match[2]);
    if (col < 1 || col > EXCEL_MAX_COL || row < 1 || row > EXCEL_MAX_ROW) return null;
    return { col, row };
  }

  function parseRange(range) {
    const parts = String(range || "").toUpperCase().replace(/\s+/g, "").split(":");
    if (parts.length > 2) return null;
    const start = parseCellRef(parts[0]);
    const end = parseCellRef(parts[1] || parts[0]);
    if (!start || !end) return null;
    return {
      top: Math.min(start.row, end.row),
      bottom: Math.max(start.row, end.row),
      left: Math.min(start.col, end.col),
      right: Math.max(start.col, end.col),
    };
  }

  function cellName(col, row) {
    let value = Number(col);
    let label = "";
    while (value > 0) {
      const remainder = (value - 1) % 26;
      label = String.fromCharCode(65 + remainder) + label;
      value = Math.floor((value - 1) / 26);
    }
    return label + row;
  }

  function normalizeText(value) {
    const localized = localizedValue(value);
    return String(localized == null ? "" : localized);
  }

  function localizedValue(value) {
    return value && typeof value === "object" && global.I18N
      ? global.I18N.text(value)
      : value;
  }

  function foldWidth(value) {
    return String(value == null ? "" : value)
      .replace(/[\uFF01-\uFF5E]/g, (character) =>
        String.fromCharCode(character.charCodeAt(0) - 0xFEE0))
      .replace(/\u3000/g, " ");
  }

  function filterKey(value) {
    if (value === BLANK_FILTER_VALUE) return BLANK_FILTER_VALUE;
    const text = normalizeText(value);
    if (!text) return BLANK_FILTER_VALUE;
    return text.toLocaleLowerCase();
  }

  function isBlankFilterValue(value) {
    return value === BLANK_FILTER_VALUE;
  }

  function displayFilterValue(value) {
    return value === BLANK_FILTER_VALUE ? "" : value;
  }

  function uniqueValues(sheet, spec) {
    const range = parseRange(spec.range);
    const column = parseCellRef(spec.column + "1");
    if (!range || !column) return [];
    if (column.col < range.left || column.col > range.right) return [];
    const values = [];
    const seen = new Set();
    for (let row = Math.max(2, range.top); row <= range.bottom; row += 1) {
      const value = normalizeText(sheet[cellName(column.col, row)]);
      const key = filterKey(value);
      if (seen.has(key)) continue;
      seen.add(key);
      values.push(value ? value : BLANK_FILTER_VALUE);
    }
    return values.sort((a, b) => {
      if (a === BLANK_FILTER_VALUE) return 1;
      if (b === BLANK_FILTER_VALUE) return -1;
      return a.localeCompare(b);
    });
  }

  function hiddenRowsForFilter(sheet, spec, selectedValue) {
    const range = parseRange(spec.range);
    const column = parseCellRef(spec.column + "1");
    const selected = Array.isArray(selectedValue)
      ? selectedValue
      : selectedValue ? [selectedValue] : [];
    if (!range || !column || column.col < range.left || column.col > range.right || !selected.length) return [];
    const selectedKeys = new Set(selected.map((value) => filterKey(value)));
    const hidden = [];
    for (let row = Math.max(2, range.top); row <= range.bottom; row += 1) {
      const value = normalizeText(sheet[cellName(column.col, row)]);
      if (!selectedKeys.has(filterKey(value))) hidden.push(row);
    }
    return hidden;
  }

  function findMatches(sheet, spec, query, options) {
    const range = parseRange(spec.range);
    if (!range) return [];
    const needle = normalizeText(query);
    if (!needle) return [];
    const config = typeof options === "object" && options !== null
      ? options
      : { matchCase: Boolean(options) };
    const queryText = config.distinguishWidth ? needle : foldWidth(needle);
    const pattern = wildcardPattern(queryText, Boolean(config.matchCase));
    const expression = config.matchEntireCell
      ? new RegExp("^(?:" + pattern.source + ")$", pattern.flags)
      : pattern;
    let formulaMode = config.lookIn === "formulas";
    if (formulaMode) {
      let hasFormula = false;
      for (let row = range.top; row <= range.bottom && !hasFormula; row += 1) {
        for (let col = range.left; col <= range.right; col += 1) {
          const raw = sheet[cellName(col, row)];
          if (typeof raw === "string" && raw.trim().startsWith("=")) {
            hasFormula = true;
            break;
          }
        }
      }
      if (!hasFormula) formulaMode = false;
    }
    const matches = [];
    const rows = [];
    const columns = [];
    for (let row = range.top; row <= range.bottom; row += 1) rows.push(row);
    for (let col = range.left; col <= range.right; col += 1) columns.push(col);
    const visit = (row, col) => {
        const ref = cellName(col, row);
        const raw = sheet[ref];
        const isFormula = typeof raw === "string" && raw.trim().startsWith("=");
        if (formulaMode && !isFormula) return;
        let source;
        if (!formulaMode && isFormula && global.FormulaEngine) {
          const evaluated = global.FormulaEngine.evaluate(raw, sheet);
          source = evaluated.ok ? evaluated.display : evaluated.error;
        } else {
          source = formulaMode ? raw : localizedValue(raw);
        }
        const value = normalizeText(source);
        const candidate = config.distinguishWidth ? value : foldWidth(value);
        if (expression.test(candidate)) matches.push(ref);
    };
    if (config.searchBy === "column") columns.forEach((col) => rows.forEach((row) => visit(row, col)));
    else rows.forEach((row) => columns.forEach((col) => visit(row, col)));
    return matches;
  }

  function wildcardPattern(query, matchCase) {
    let source = "";
    const text = String(query == null ? "" : query);
    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];
      if (character === "~" && index + 1 < text.length) {
        index += 1;
        source += text[index].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      } else if (character === "*") {
        source += "[\\s\\S]*";
      } else if (character === "?") {
        source += "[\\s\\S]";
      } else {
        source += character.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
    }
    return new RegExp(source, (matchCase ? "" : "i") + "u");
  }

  function replaceInRange(sheet, spec, query, replacement, options) {
    const range = parseRange(spec.range);
    const needle = normalizeText(query);
    if (!range || !needle) return 0;
    const config = typeof options === "object" && options !== null
      ? options
      : { matchCase: Boolean(options) };
    const queryText = config.distinguishWidth ? needle : foldWidth(needle);
    const basePattern = wildcardPattern(queryText, Boolean(config.matchCase));
    const source = config.matchEntireCell
      ? "^(?:" + basePattern.source + ")$"
      : basePattern.source;
    const flags = (config.matchCase ? "" : "i") + "gu";
    const replacementText = String(replacement == null ? "" : replacement);
    const replaceText = (text) => {
      const matcher = new RegExp(source, flags);
      const matches = String(text).match(matcher);
      if (!matches) return { text, count: 0 };
      return {
        text: String(text).replace(matcher, () => replacementText),
        count: matches.length,
      };
    };
    let count = 0;
    for (let row = range.top; row <= range.bottom; row += 1) {
      for (let col = range.left; col <= range.right; col += 1) {
        const ref = cellName(col, row);
        const value = sheet[ref];
        if (typeof value === "string" || typeof value === "number") {
          const result = replaceText(value);
          if (result.count) {
            sheet[ref] = result.text;
            count += result.count;
          }
          continue;
        }
        if (value && typeof value === "object" && !isBlankFilterValue(value)) {
          let cellCount = 0;
          Object.keys(value).forEach((key) => {
            const localized = value[key];
            if (typeof localized !== "string" && typeof localized !== "number") return;
            const result = replaceText(localized);
            if (!result.count) return;
            value[key] = result.text;
            cellCount = Math.max(cellCount, result.count);
          });
          count += cellCount;
        }
      }
    }
    return count;
  }

  function expectedRefs(task) {
    const operation = task && task.operation;
    if (!operation) return [];
    const normalize = (ref) => {
      const parsed = parseCellRef(ref);
      return parsed ? cellName(parsed.col, parsed.row) : String(ref || "").trim().toUpperCase();
    };
    if (Array.isArray(operation.expectedRefs)) return operation.expectedRefs.map(normalize);
    if (typeof operation.expectedRefs === "string") return [normalize(operation.expectedRefs)];
    return operation.expectedRef ? [normalize(operation.expectedRef)] : [];
  }

  function validate(task, operationState, sheet) {
    const operation = task && task.operation;
    if (!operation) return { ok: true };
    if (operation.type === "filter") {
      const selected = operationState
        ? (Array.isArray(operationState.selectedValues)
          ? operationState.selectedValues
          : operationState.selectedValue ? [operationState.selectedValue] : [])
        : [];
      if (!selected.length) {
        return { ok: false, reason: "filter-missing" };
      }
      const expected = hiddenRowsForFilter(sheet, operation, selected);
      const actual = Array.isArray(operationState.hiddenRows) ? operationState.hiddenRows : [];
      if (
        operation.selectedValue != null && operation.selectedValue !== "" &&
        (selected.length !== 1 ||
          filterKey(selected[0]) !== filterKey(localizedValue(operation.selectedValue)))
      ) {
        return { ok: false, reason: "filter-value" };
      }
      if (expected.length !== actual.length || expected.some((row) => !actual.includes(row))) {
        return { ok: false, reason: "filter-rows" };
      }
      return { ok: true };
    }
    if (operation.type === "find") {
      if (!operationState || !operationState.findQuery || !operationState.findPerformed) {
        return { ok: false, reason: "find-missing" };
      }
      const matches = findMatches(sheet, operation, operationState.findQuery, {
        matchCase: operationState.matchCase === undefined
          ? Boolean(operation.matchCase)
          : Boolean(operationState.matchCase),
        matchEntireCell: Boolean(operationState.matchEntireCell),
        searchBy: operationState.searchBy || "row",
        lookIn: operationState.lookIn || "values",
        distinguishWidth: Boolean(operationState.distinguishWidth),
      });
      const wanted = expectedRefs(task);
      const expectedQuery = normalizeText(localizedValue(operation.query));
      if (
        expectedQuery &&
        (operation.matchCase === true
          ? normalizeText(operationState.findQuery) !== expectedQuery
          : normalizeText(operationState.findQuery).toLocaleLowerCase() !== expectedQuery.toLocaleLowerCase())
      ) {
        return { ok: false, reason: "find-query" };
      }
      if (!matches.length) return { ok: false, reason: "find-no-match" };
      if (wanted.length && !wanted.every((ref) => matches.includes(ref))) {
        return { ok: false, reason: "find-query" };
      }
      const active = String(operationState.activeFindRef || "").toUpperCase();
      if (!active || !matches.includes(active) || (wanted.length && !wanted.includes(active))) {
        return { ok: false, reason: "find-active" };
      }
      return { ok: true };
    }
    return { ok: false, reason: "operation-unsupported" };
  }

  global.SheetOperations = Object.freeze({
    BLANK_FILTER_VALUE,
    parseCellRef,
    parseRange,
    cellName,
    foldWidth,
    filterKey,
    isBlankFilterValue,
    displayFilterValue,
    uniqueValues,
    hiddenRowsForFilter,
    findMatches,
    wildcardPattern,
    replaceInRange,
    expectedRefs,
    validate,
  });
})(window);
