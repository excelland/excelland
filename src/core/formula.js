(function (global) {
  "use strict";

  const ERR = {
    VALUE: "#VALUE!",
    DIV0: "#DIV/0!",
    NAME: "#NAME?",
    REF: "#REF!",
    NUM: "#NUM!",
    NA: "#N/A",
    CIRC: "#CIRC!",
  };

  class FormulaError extends Error {
    constructor(code) {
      super(code);
      this.name = "FormulaError";
      this.code = code;
    }
  }

  class RangeValue {
    constructor(cells, rows, cols, hiddenRows) {
      this.cells = cells;
      this.rows = rows;
      this.cols = cols;
      this.hiddenRows = hiddenRows || new Set();
    }

    values() {
      return this.cells.map((cell) => cell.value);
    }

    visibleValues() {
      return this.cells
        .filter((cell) => {
          const parsed = parseCellRef(cell.ref);
          return !parsed || !this.hiddenRows.has(parsed.row);
        })
        .map((cell) => cell.value);
    }

    cellAt(row, col) {
      const cell = this.cells[row * this.cols + col];
      return cell ? cell.value : "";
    }

    topLeft() {
      return this.cells.length ? this.cells[0].value : "";
    }
  }

  function colToNumber(letters) {
    let total = 0;
    for (const char of letters.toUpperCase()) {
      total = total * 26 + (char.charCodeAt(0) - 64);
    }
    return total;
  }

  function numberToCol(number) {
    let value = number;
    let result = "";
    while (value > 0) {
      const remainder = (value - 1) % 26;
      result = String.fromCharCode(65 + remainder) + result;
      value = Math.floor((value - 1) / 26);
    }
    return result;
  }

  function parseCellRef(ref) {
    const match = /^\$?([A-Za-z]{1,3})\$?(\d{1,7})$/.exec(ref.trim());
    if (!match) {
      throw new FormulaError(ERR.REF);
    }
    return { col: colToNumber(match[1]), row: Number(match[2]) };
  }

  function normalizeCellRef(ref) {
    return ref.replace(/\$/g, "").toUpperCase();
  }

  function cellName(col, row) {
    return numberToCol(col) + row;
  }

  function parseFormula(source) {
    let text = String(source == null ? "" : source).trim();
    if (text.startsWith("=")) {
      text = text.slice(1);
    }
    if (!text) {
      throw new FormulaError(ERR.VALUE);
    }
    const parser = new Parser(tokenize(text));
    return parser.parse();
  }

  function tokenize(source) {
    const tokens = [];
    let index = 0;

    while (index < source.length) {
      const char = source[index];

      if (/\s/.test(char)) {
        index += 1;
        continue;
      }

      if (char === '"') {
        let value = "";
        index += 1;
        while (index < source.length) {
          if (source[index] === '"') {
            if (source[index + 1] === '"') {
              value += '"';
              index += 2;
              continue;
            }
            index += 1;
            break;
          }
          value += source[index];
          index += 1;
        }
        tokens.push({ type: "string", value });
        continue;
      }

      const rest = source.slice(index);
      const sheetRangeMatch = /^(?:'((?:[^']|'')+)'|([A-Za-z_][A-Za-z0-9_. :]*))!\$?([A-Za-z]{1,3})\$?\d{1,7}:\$?([A-Za-z]{1,3})\$?\d{1,7}/.exec(rest);
      if (sheetRangeMatch) {
        const sheet = (sheetRangeMatch[1] || sheetRangeMatch[2]).replace(/''/g, "'");
        tokens.push({ type: "range", value: sheetRangeMatch[0].slice(sheetRangeMatch[0].indexOf("!") + 1), sheet });
        index += sheetRangeMatch[0].length;
        continue;
      }

      const sheetRefMatch = /^(?:'((?:[^']|'')+)'|([A-Za-z_][A-Za-z0-9_. :]*))!\$?([A-Za-z]{1,3})\$?\d{1,7}/.exec(rest);
      if (sheetRefMatch) {
        const sheet = (sheetRefMatch[1] || sheetRefMatch[2]).replace(/''/g, "'");
        tokens.push({ type: "ref", value: sheetRefMatch[0].slice(sheetRefMatch[0].indexOf("!") + 1), sheet });
        index += sheetRefMatch[0].length;
        continue;
      }

      const rangeMatch = /^\$?[A-Za-z]{1,3}\$?\d{1,7}:\$?[A-Za-z]{1,3}\$?\d{1,7}/.exec(rest);
      if (rangeMatch) {
        tokens.push({ type: "range", value: rangeMatch[0] });
        index += rangeMatch[0].length;
        continue;
      }

      const refMatch = /^\$?[A-Za-z]{1,3}\$?\d{1,7}/.exec(rest);
      if (refMatch && !/^([A-Za-z_][A-Za-z0-9_]*)\s*\(/.test(rest)) {
        tokens.push({ type: "ref", value: refMatch[0] });
        index += refMatch[0].length;
        continue;
      }

      const numberMatch = /^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/.exec(rest);
      if (numberMatch) {
        tokens.push({ type: "number", value: Number(numberMatch[0]) });
        index += numberMatch[0].length;
        continue;
      }

      const identifierMatch = /^[A-Za-z_][A-Za-z0-9_.]*/.exec(rest);
      if (identifierMatch) {
        const value = identifierMatch[0].toUpperCase();
        index += identifierMatch[0].length;
        const afterSpaces = source.slice(index).replace(/^\s+/, "");
        if (value === "TRUE" || value === "FALSE") {
          tokens.push({ type: "boolean", value: value === "TRUE" });
        } else if (afterSpaces.startsWith("(")) {
          tokens.push({ type: "identifier", value });
        } else {
          tokens.push({ type: "identifier", value });
        }
        continue;
      }

      const two = source.slice(index, index + 2);
      if (two === "<=" || two === ">=" || two === "<>") {
        tokens.push({ type: "operator", value: two });
        index += 2;
        continue;
      }

      if ("+-*/^&=<>".includes(char)) {
        tokens.push({ type: "operator", value: char });
        index += 1;
        continue;
      }

      if (char === "(" || char === ")" || char === "," || char === "%") {
        tokens.push({ type: "symbol", value: char });
        index += 1;
        continue;
      }

      throw new FormulaError(ERR.NAME);
    }

    tokens.push({ type: "eof", value: "" });
    return tokens;
  }

  class Parser {
    constructor(tokens) {
      this.tokens = tokens;
      this.position = 0;
    }

    peek() {
      return this.tokens[this.position];
    }

    take() {
      const token = this.tokens[this.position];
      this.position += 1;
      return token;
    }

    expect(value) {
      if (this.peek().value !== value) {
        throw new FormulaError(ERR.VALUE);
      }
      return this.take();
    }

    parse() {
      const node = this.parseComparison();
      if (this.peek().type !== "eof") {
        throw new FormulaError(ERR.VALUE);
      }
      return node;
    }

    parseComparison() {
      let left = this.parseConcat();
      while (
        this.peek().type === "operator" &&
        ["=", "<>", "<", ">", "<=", ">="].includes(this.peek().value)
      ) {
        const operator = this.take().value;
        const right = this.parseConcat();
        left = { type: "binary", operator, left, right };
      }
      return left;
    }

    parseConcat() {
      let left = this.parseAdd();
      while (this.peek().type === "operator" && this.peek().value === "&") {
        const operator = this.take().value;
        const right = this.parseAdd();
        left = { type: "binary", operator, left, right };
      }
      return left;
    }

    parseAdd() {
      let left = this.parseMultiply();
      while (
        this.peek().type === "operator" &&
        ["+", "-"].includes(this.peek().value)
      ) {
        const operator = this.take().value;
        const right = this.parseMultiply();
        left = { type: "binary", operator, left, right };
      }
      return left;
    }

    parseMultiply() {
      let left = this.parsePower();
      while (
        this.peek().type === "operator" &&
        ["*", "/"].includes(this.peek().value)
      ) {
        const operator = this.take().value;
        const right = this.parsePower();
        left = { type: "binary", operator, left, right };
      }
      return left;
    }

    parsePower() {
      const left = this.parseUnary();
      if (this.peek().type === "operator" && this.peek().value === "^") {
        const operator = this.take().value;
        const right = this.parsePower();
        return { type: "binary", operator, left, right };
      }
      return left;
    }

    parseUnary() {
      if (
        this.peek().type === "operator" &&
        ["+", "-"].includes(this.peek().value)
      ) {
        const operator = this.take().value;
        return { type: "unary", operator, value: this.parseUnary() };
      }
      return this.parsePostfix();
    }

    parsePostfix() {
      let node = this.parsePrimary();
      while (this.peek().type === "symbol" && this.peek().value === "%") {
        this.take();
        node = { type: "postfix", value: node };
      }
      return node;
    }

    parsePrimary() {
      const token = this.peek();

      if (token.type === "number" || token.type === "string" || token.type === "boolean") {
        this.take();
        return { type: "literal", value: token.value };
      }

      if (token.type === "ref") {
        this.take();
        return { type: "ref", value: normalizeCellRef(token.value), sheet: token.sheet };
      }

      if (token.type === "range") {
        this.take();
        const [start, end] = token.value.split(":");
        return {
          type: "range",
          start: normalizeCellRef(start),
          end: normalizeCellRef(end),
          sheet: token.sheet,
        };
      }

      if (token.type === "identifier") {
        const name = this.take().value;
        if (this.peek().value !== "(") {
          return { type: "name", name };
        }
        this.expect("(");
        const args = [];
        if (this.peek().value !== ")") {
          while (true) {
            args.push(this.parseComparison());
            if (this.peek().value === ",") {
              this.take();
              continue;
            }
            break;
          }
        }
        this.expect(")");
        return { type: "call", name, args };
      }

      if (token.type === "symbol" && token.value === "(") {
        this.take();
        const node = this.parseComparison();
        this.expect(")");
        return node;
      }

      throw new FormulaError(ERR.VALUE);
    }
  }

  class FormulaContext {
    constructor(sheet, stack, options) {
      this.sheet = sheet || {};
      this.stack = stack || [];
      this.options = options || {};
      this.hiddenRows = new Set(this.options.hiddenRows || []);
      this.sheets = this.options.sheets || null;
      this.names = this.options.names || null;
      this.formulaCell = this.options.formulaCell || "";
    }

    externalContext(sheetName) {
      const name = String(sheetName || "").trim();
      if (!name) return this;
      const external = this.sheets && Object.prototype.hasOwnProperty.call(this.sheets, name)
        ? this.sheets[name]
        : null;
      if (!external) throw new FormulaError(ERR.REF);
      return new FormulaContext(external, [], this.options);
    }

    getCell(ref, sheetName) {
      if (sheetName && String(sheetName).includes(":")) {
        const names = this.sheetSequence(sheetName);
        const cells = names.map((name) => ({
          ref: normalizeCellRef(ref),
          value: this.externalContext(name).getCell(ref),
        }));
        return new RangeValue(cells, cells.length, 1);
      }
      if (sheetName) return this.externalContext(sheetName).getCell(ref);
      const key = normalizeCellRef(ref);

      if (this.stack.includes(key)) {
        throw new FormulaError(ERR.CIRC);
      }

      const raw = this.sheet[key];
      if (raw === undefined || raw === null || raw === "") {
        return "";
      }
      if (typeof raw === "number" || typeof raw === "boolean") {
        return raw;
      }
      if (typeof raw === "string") {
        if (raw.startsWith("=")) {
          const ast = parseFormula(raw);
          const next = new FormulaContext(this.sheet, this.stack.concat(key), this.options);
          const value = evaluateNode(ast, next);
          return value instanceof RangeValue ? value.topLeft() : value;
        }
        const trimmed = raw.trim();
        if (trimmed === "") {
          return "";
        }
        const numberValue = Number(trimmed.replace(/,/g, ""));
        return Number.isNaN(numberValue) ? raw : numberValue;
      }
      return raw;
    }

    getRange(start, end, sheetName) {
      if (sheetName && String(sheetName).includes(":")) {
        const names = this.sheetSequence(sheetName);
        let rows = 0;
        let cols = 0;
        const cells = [];
        names.forEach((name) => {
          const range = this.externalContext(name).getRange(start, end);
          rows += range.rows;
          cols = Math.max(cols, range.cols);
          cells.push(...range.cells);
        });
        return new RangeValue(cells, rows, cols);
      }
      if (sheetName) return this.externalContext(sheetName).getRange(start, end);
      const from = parseCellRef(start);
      const to = parseCellRef(end);
      const firstRow = Math.min(from.row, to.row);
      const lastRow = Math.max(from.row, to.row);
      const firstCol = Math.min(from.col, to.col);
      const lastCol = Math.max(from.col, to.col);
      const cells = [];

      for (let row = firstRow; row <= lastRow; row += 1) {
        for (let col = firstCol; col <= lastCol; col += 1) {
          const ref = cellName(col, row);
          cells.push({ ref, value: this.getCell(ref) });
        }
      }

      return new RangeValue(
        cells,
        lastRow - firstRow + 1,
        lastCol - firstCol + 1,
        this.hiddenRows,
      );
    }

    getNamedRange(name) {
      if (!this.names) throw new FormulaError(ERR.NAME);
      const key = Object.keys(this.names).find((candidate) => (
        candidate.toUpperCase() === String(name).toUpperCase()
      ));
      if (!key) throw new FormulaError(ERR.NAME);
      const entry = this.names[key];
      if (entry instanceof RangeValue) return entry;
      const target = typeof entry === "string"
        ? entry
        : entry && (entry.refersTo || entry.ref || entry.formula);
      if (!target) throw new FormulaError(ERR.NAME);
      const text = String(target).replace(/^=/, "").trim();
      const sheetMatch = /^(?:'((?:[^']|'')+)'|([^!]+))!(.+)$/.exec(text);
      const sheetName = sheetMatch ? (sheetMatch[1] || sheetMatch[2]).replace(/''/g, "'").trim() : "";
      const rangeText = sheetMatch ? sheetMatch[3] : text;
      const [start, end] = rangeText.replace(/\$/g, "").split(":");
      if (!start || !/^[A-Za-z]{1,3}\d{1,7}$/.test(start)) throw new FormulaError(ERR.NAME);
      return end
        ? this.getRange(start, end, sheetName)
        : this.getCell(start, sheetName);
    }

    sheetSequence(sheetName) {
      const parts = String(sheetName || "").split(":");
      if (parts.length !== 2 || !this.sheets) throw new FormulaError(ERR.REF);
      const names = Object.keys(this.sheets);
      const findIndex = (name) => names.findIndex((candidate) => (
        candidate.toLowerCase() === String(name).trim().toLowerCase()
      ));
      const start = findIndex(parts[0]);
      const end = findIndex(parts[1]);
      if (start < 0 || end < 0) throw new FormulaError(ERR.REF);
      return names.slice(Math.min(start, end), Math.max(start, end) + 1);
    }
  }

  function scalar(value) {
    return value instanceof RangeValue ? value.topLeft() : value;
  }

  function toNumber(value) {
    const plain = scalar(value);
    if (typeof plain === "number") {
      return plain;
    }
    if (typeof plain === "boolean") {
      return plain ? 1 : 0;
    }
    if (plain === "" || plain == null) {
      return 0;
    }
    if (typeof plain === "string") {
      const numberValue = Number(plain.trim().replace(/,/g, ""));
      if (!Number.isNaN(numberValue)) {
        return numberValue;
      }
      if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}(?:[ T].*)?$/.test(plain.trim())) {
        return toDateSerial(plain);
      }
    }
    throw new FormulaError(ERR.VALUE);
  }

  function toText(value) {
    const plain = scalar(value);
    if (plain == null) {
      return "";
    }
    if (typeof plain === "boolean") {
      return plain ? "TRUE" : "FALSE";
    }
    return String(plain);
  }

  function toBoolean(value) {
    const plain = scalar(value);
    if (typeof plain === "boolean") {
      return plain;
    }
    if (typeof plain === "number") {
      return plain !== 0;
    }
    if (typeof plain === "string") {
      if (plain.trim().toUpperCase() === "TRUE") return true;
      if (plain.trim().toUpperCase() === "FALSE") return false;
      if (plain.trim() === "") return false;
    }
    return Boolean(plain);
  }

  function flattenValues(args) {
    const result = [];
    for (const arg of args) {
      if (arg instanceof RangeValue) {
        result.push(...arg.values());
      } else if (Array.isArray(arg)) {
        result.push(...arg);
      } else {
        result.push(arg);
      }
    }
    return result;
  }

  function collectNumbers(args) {
    const numbers = [];
    for (const arg of args) {
      if (arg instanceof RangeValue) {
        for (const value of arg.values()) {
          if (typeof value === "number" && Number.isFinite(value)) {
            numbers.push(value);
          }
        }
      } else if (typeof arg === "number" && Number.isFinite(arg)) {
        numbers.push(arg);
      } else if (typeof arg === "boolean") {
        numbers.push(arg ? 1 : 0);
      } else if (typeof arg === "string" && arg.trim() !== "") {
        const numberValue = Number(arg.replace(/,/g, ""));
        if (!Number.isNaN(numberValue)) {
          numbers.push(numberValue);
        }
      }
    }
    return numbers;
  }

  function compareValues(leftValue, rightValue, operator) {
    let left = scalar(leftValue);
    let right = scalar(rightValue);

    if (typeof left === "string" && left.trim() !== "" && !Number.isNaN(Number(left))) {
      left = Number(left);
    }
    if (typeof right === "string" && right.trim() !== "" && !Number.isNaN(Number(right))) {
      right = Number(right);
    }

    const leftIsNumber = typeof left === "number";
    const rightIsNumber = typeof right === "number";
    let comparison = 0;

    if (leftIsNumber && rightIsNumber) {
      comparison = left - right;
    } else {
      const leftText = toText(left).toUpperCase();
      const rightText = toText(right).toUpperCase();
      comparison = leftText < rightText ? -1 : leftText > rightText ? 1 : 0;
    }

    switch (operator) {
      case "=":
        return comparison === 0;
      case "<>":
        return comparison !== 0;
      case "<":
        return comparison < 0;
      case ">":
        return comparison > 0;
      case "<=":
        return comparison <= 0;
      case ">=":
        return comparison >= 0;
      default:
        throw new FormulaError(ERR.NAME);
    }
  }

  function compareRanges(left, right, operator) {
    const leftRange = left instanceof RangeValue ? left : null;
    const rightRange = right instanceof RangeValue ? right : null;
    const template = leftRange || rightRange;
    if (leftRange && rightRange && leftRange.cells.length !== rightRange.cells.length) {
      throw new FormulaError(ERR.VALUE);
    }
    const cells = template.cells.map((cell, index) => {
      const leftValue = leftRange ? leftRange.cells[index].value : left;
      const rightValue = rightRange ? rightRange.cells[index].value : right;
      return { ref: cell.ref, value: compareValues(leftValue, rightValue, operator) };
    });
    return new RangeValue(cells, template.rows, template.cols, template.hiddenRows);
  }

  function evaluateNode(node, context) {
    if (node.type === "literal") {
      return node.value;
    }
    if (node.type === "ref") {
      return context.getCell(node.value, node.sheet);
    }
    if (node.type === "range") {
      return context.getRange(node.start, node.end, node.sheet);
    }
    if (node.type === "name") {
      return context.getNamedRange(node.name);
    }
    if (node.type === "unary") {
      const value = toNumber(evaluateNode(node.value, context));
      return node.operator === "-" ? -value : value;
    }
    if (node.type === "postfix") {
      return toNumber(evaluateNode(node.value, context)) / 100;
    }
    if (node.type === "binary") {
      const left = evaluateNode(node.left, context);
      const right = evaluateNode(node.right, context);

      if (node.operator === "&") {
        return toText(left) + toText(right);
      }
      if (["=", "<>", "<", ">", "<=", ">="].includes(node.operator)) {
        if (left instanceof RangeValue || right instanceof RangeValue) {
          return compareRanges(left, right, node.operator);
        }
        return compareValues(left, right, node.operator);
      }

      const leftNumber = toNumber(left);
      const rightNumber = toNumber(right);
      switch (node.operator) {
        case "+":
          return leftNumber + rightNumber;
        case "-":
          return leftNumber - rightNumber;
        case "*":
          return leftNumber * rightNumber;
        case "/":
          if (rightNumber === 0) throw new FormulaError(ERR.DIV0);
          return leftNumber / rightNumber;
        case "^":
          return Math.pow(leftNumber, rightNumber);
        default:
          throw new FormulaError(ERR.NAME);
      }
    }
    if (node.type === "call") {
      return callFunction(node, context);
    }
    throw new FormulaError(ERR.VALUE);
  }

  function callFunction(node, context) {
    const name = node.name;
    const config = FUNCTIONS[name];
    if (!config) {
      throw new FormulaError(ERR.NAME);
    }
    if (typeof config === "function") {
      return config(node.args.map((arg) => evaluateNode(arg, context)), context);
    }
    return config.lazy
      ? config.fn(node.args, context)
      : config.fn(node.args.map((arg) => evaluateNode(arg, context)), context);
  }

  function criteriaMatcher(criteria) {
    let operator = "=";
    let raw = criteria;
    if (typeof criteria === "string") {
      const match = /^(<=|>=|<>|=|<|>)([\s\S]*)$/.exec(criteria.trim());
      if (match) {
        operator = match[1];
        raw = match[2];
      }
    }
    const numeric = raw !== "" && raw !== null && !Number.isNaN(Number(raw));
    const wildcard = typeof raw === "string" && /[*?]/.test(raw);
    let pattern = null;
    if (wildcard) {
      const escaped = raw.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
      pattern = new RegExp("^" + escaped + "$", "i");
    }
    return {
      raw,
      operator,
      numberValue: numeric ? Number(raw) : null,
      pattern,
    };
  }

  function matchesCriteria(value, matcher) {
    if (value === "" || value == null) {
      return matcher.operator === "=" && matcher.raw === "";
    }
    const text = toText(value);
    const numericValue = Number(text.replace(/,/g, ""));
    const useNumber = matcher.numberValue !== null && text.trim() !== "" && !Number.isNaN(numericValue);

    if (matcher.operator === "=") {
      if (matcher.pattern) return matcher.pattern.test(text);
      return useNumber ? numericValue === matcher.numberValue : text.toUpperCase() === matcher.raw.toUpperCase();
    }
    if (matcher.operator === "<>") {
      if (matcher.pattern) return !matcher.pattern.test(text);
      return useNumber ? numericValue !== matcher.numberValue : text.toUpperCase() !== matcher.raw.toUpperCase();
    }

    if (!useNumber) return false;
    switch (matcher.operator) {
      case "<":
        return numericValue < matcher.numberValue;
      case ">":
        return numericValue > matcher.numberValue;
      case "<=":
        return numericValue <= matcher.numberValue;
      case ">=":
        return numericValue >= matcher.numberValue;
      default:
        return false;
    }
  }

  function sumNumbers(args) {
    return collectNumbers(args).reduce((total, value) => total + value, 0);
  }

  const EXCEL_EPOCH = Date.UTC(1899, 11, 30);
  const MS_PER_DAY = 86400000;

  function excelSerialFromUtc(year, month, day) {
    return Math.floor((Date.UTC(year, month - 1, day) - EXCEL_EPOCH) / MS_PER_DAY);
  }

  function serialToDate(value) {
    const serial = toNumber(value);
    return new Date(EXCEL_EPOCH + Math.floor(serial) * MS_PER_DAY);
  }

  function toDateSerial(value) {
    const plain = scalar(value);
    if (typeof plain === "number" && Number.isFinite(plain)) return plain;
    if (typeof plain === "string") {
      const text = plain.trim();
      const match = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(text);
      if (match) return excelSerialFromUtc(Number(match[1]), Number(match[2]), Number(match[3]));
      const numeric = Number(text.replace(/,/g, ""));
      if (!Number.isNaN(numeric)) return numeric;
    }
    throw new FormulaError(ERR.VALUE);
  }

  function roundTo(value, digits, mode) {
    const factor = Math.pow(10, digits);
    if (mode === "up") {
      return Math.sign(value) * Math.ceil(Math.abs(value) * factor) / factor;
    }
    if (mode === "down") {
      return Math.sign(value) * Math.floor(Math.abs(value) * factor) / factor;
    }
    const scaled = Math.abs(value) * factor;
    const corrected = scaled + Number.EPSILON * Math.max(1, scaled);
    return Math.sign(value) * Math.round(corrected) / factor;
  }

  function formatDateSerial(serial, pattern) {
    const date = serialToDate(serial);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    if (/y/i.test(pattern) || /d/i.test(pattern)) {
      const twoYear = String(year).slice(-2);
      return pattern
        .replace(/yyyy/gi, String(year))
        .replace(/yy/gi, twoYear)
        .replace(/mm/gi, String(month).padStart(2, "0"))
        .replace(/m/gi, String(month))
        .replace(/dd/gi, String(day).padStart(2, "0"))
        .replace(/d/gi, String(day));
    }
    const value = toNumber(serial);
    const percent = pattern.includes("%");
    const decimals = (pattern.split(".")[1] || "").replace(/[^0#]/g, "").length;
    let number = percent ? value * 100 : value;
    number = roundTo(number, decimals, "nearest");
    let text = decimals ? number.toFixed(decimals) : String(number);
    if (pattern.includes("#,##0")) {
      const parts = text.split(".");
      parts[0] = Number(parts[0]).toLocaleString("en-US");
      text = parts.join(".");
    }
    return percent ? text + "%" : text;
  }

  function rangeMatrix(range) {
    if (!(range instanceof RangeValue)) throw new FormulaError(ERR.VALUE);
    const matrix = [];
    for (let row = 0; row < range.rows; row += 1) {
      const values = [];
      for (let col = 0; col < range.cols; col += 1) {
        values.push(range.cellAt(row, col));
      }
      matrix.push(values);
    }
    return matrix;
  }

  function matrixRange(matrix, hiddenRows) {
    const rows = matrix.length;
    const cols = rows ? matrix[0].length : 0;
    const cells = [];
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        cells.push({ ref: cellName(col + 1, row + 1), value: matrix[row][col] });
      }
    }
    return new RangeValue(cells, rows, cols, hiddenRows);
  }

  function sortableValues(matrix) {
    return matrix.map((row) => row.map((value) => (
      typeof value === "number" ? value : toText(value).toUpperCase()
    )));
  }

  function compareSortable(left, right) {
    const leftNumber = typeof left === "number";
    const rightNumber = typeof right === "number";
    if (leftNumber !== rightNumber) return leftNumber ? -1 : 1;
    if (left === right) return 0;
    return left < right ? -1 : 1;
  }

  function dateValue(value) {
    return serialToDate(toDateSerial(value));
  }

  function daysInMonth(year, month) {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
  }

  function addMonths(value, months, endOfMonth) {
    const date = dateValue(value);
    const monthIndex = date.getUTCFullYear() * 12 + date.getUTCMonth() + Math.trunc(months);
    const year = Math.floor(monthIndex / 12);
    const month = ((monthIndex % 12) + 12) % 12 + 1;
    const day = endOfMonth
      ? daysInMonth(year, month)
      : Math.min(date.getUTCDate(), daysInMonth(year, month));
    return excelSerialFromUtc(year, month, day);
  }

  function weekdayNumber(value, returnType) {
    const date = dateValue(value);
    const day = date.getUTCDay();
    const type = returnType == null ? 1 : Math.trunc(toNumber(returnType));
    if (type === 1) return day + 1;
    if (type === 2 || type === 11) return ((day + 6) % 7) + 1;
    if (type === 3) return (day + 6) % 7;
    if (type >= 12 && type <= 17) {
      const firstDay = (type - 10) % 7;
      return ((day - firstDay + 7) % 7) + 1;
    }
    throw new FormulaError(ERR.NUM);
  }

  function weekNumber(value, returnType) {
    const date = dateValue(value);
    const type = returnType == null ? 1 : Math.trunc(toNumber(returnType));
    if (type === 21) {
      const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
      const day = target.getUTCDay() || 7;
      target.setUTCDate(target.getUTCDate() + 4 - day);
      const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
      return Math.ceil((((target - yearStart) / MS_PER_DAY) + 1) / 7);
    }
    const startDays = { 1: 0, 2: 1, 11: 1, 12: 2, 13: 3, 14: 4, 15: 5, 16: 6, 17: 0 };
    if (!Object.prototype.hasOwnProperty.call(startDays, type)) throw new FormulaError(ERR.NUM);
    const year = date.getUTCFullYear();
    const jan1 = new Date(Date.UTC(year, 0, 1));
    const offset = (jan1.getUTCDay() - startDays[type] + 7) % 7;
    const dayOfYear = Math.floor((Date.UTC(year, date.getUTCMonth(), date.getUTCDate()) -
      Date.UTC(year, 0, 1)) / MS_PER_DAY);
    return Math.floor((dayOfYear + offset) / 7) + 1;
  }

  function holidaySerials(value) {
    if (value == null || value === "") return new Set();
    const values = value instanceof RangeValue ? value.values() : [value];
    const holidays = new Set();
    values.forEach((item) => {
      if (item === "" || item == null) return;
      try {
        holidays.add(Math.floor(toDateSerial(item)));
      } catch (error) {
        if (!(error instanceof FormulaError)) throw error;
      }
    });
    return holidays;
  }

  function isWeekend(serial) {
    const day = serialToDate(serial).getUTCDay();
    return day === 0 || day === 6;
  }

  function workdayValue(start, days, holidays) {
    let current = Math.floor(toDateSerial(start));
    let remaining = Math.trunc(toNumber(days));
    const direction = remaining < 0 ? -1 : 1;
    remaining = Math.abs(remaining);
    while (remaining > 0) {
      current += direction;
      if (!isWeekend(current) && !holidays.has(current)) remaining -= 1;
    }
    return current;
  }

  function networkdaysValue(start, end, holidays) {
    let first = Math.floor(toDateSerial(start));
    let last = Math.floor(toDateSerial(end));
    if (first > last) [first, last] = [last, first];
    let total = 0;
    for (let serial = first; serial <= last; serial += 1) {
      if (!isWeekend(serial) && !holidays.has(serial)) total += 1;
    }
    return total;
  }

  function dateDifference(start, end, unit) {
    const first = dateValue(start);
    const last = dateValue(end);
    if (last < first) throw new FormulaError(ERR.NUM);
    const key = toText(unit).trim().toUpperCase();
    const dayDiff = Math.floor((last - first) / MS_PER_DAY);
    if (key === "D") return dayDiff;
    let months = (last.getUTCFullYear() - first.getUTCFullYear()) * 12 +
      last.getUTCMonth() - first.getUTCMonth();
    if (last.getUTCDate() < first.getUTCDate()) months -= 1;
    if (key === "M") return months;
    if (key === "Y") return Math.floor(months / 12);
    if (key === "YM") return ((months % 12) + 12) % 12;
    if (key === "MD") {
      let days = last.getUTCDate() - first.getUTCDate();
      if (days < 0) days += daysInMonth(last.getUTCFullYear(), last.getUTCMonth());
      return days;
    }
    if (key === "YD") {
      let anniversary = excelSerialFromUtc(first.getUTCFullYear(), last.getUTCMonth() + 1, last.getUTCDate());
      if (anniversary < Math.floor(toDateSerial(start))) {
        anniversary = excelSerialFromUtc(first.getUTCFullYear() + 1, last.getUTCMonth() + 1, last.getUTCDate());
      }
      return anniversary - Math.floor(toDateSerial(start));
    }
    throw new FormulaError(ERR.NUM);
  }

  function irrValue(values, rate) {
    if (rate <= -1) return NaN;
    let total = 0;
    values.forEach((value, index) => {
      total += value / Math.pow(1 + rate, index);
    });
    return total;
  }

  function calculateIrr(values, guess) {
    if (values.length < 2) throw new FormulaError(ERR.NUM);
    if (!values.some((value) => value > 0) || !values.some((value) => value < 0)) {
      throw new FormulaError(ERR.NUM);
    }
    const initial = arguments.length > 1 && Number.isFinite(guess) ? guess : 0.1;
    let rate = Math.max(-0.999999, initial);
    for (let iteration = 0; iteration < 100; iteration += 1) {
      const value = irrValue(values, rate);
      const delta = rate * 1e-7 || 1e-7;
      const derivative = (irrValue(values, rate + delta) - value) / delta;
      if (!Number.isFinite(derivative) || Math.abs(derivative) < 1e-14) break;
      const next = rate - value / derivative;
      if (!Number.isFinite(next) || next <= -1) break;
      if (Math.abs(next - rate) < 1e-10) return next;
      rate = next;
    }
    let low = -0.999999;
    let high = 1;
    let lowValue = irrValue(values, low);
    let highValue = irrValue(values, high);
    for (let attempt = 0; attempt < 20 && lowValue * highValue > 0; attempt += 1) {
      high = high * 2 + 1;
      highValue = irrValue(values, high);
    }
    if (lowValue * highValue > 0) throw new FormulaError(ERR.NUM);
    for (let iteration = 0; iteration < 200; iteration += 1) {
      const middle = (low + high) / 2;
      const middleValue = irrValue(values, middle);
      if (Math.abs(middleValue) < 1e-10) return middle;
      if (lowValue * middleValue <= 0) {
        high = middle;
        highValue = middleValue;
      } else {
        low = middle;
        lowValue = middleValue;
      }
    }
    return (low + high) / 2;
  }

  function databaseFieldIndex(database, field) {
    if (!(database instanceof RangeValue) || database.rows < 1 || database.cols < 1) {
      throw new FormulaError(ERR.VALUE);
    }
    if (typeof field === "number") {
      const index = Math.trunc(field);
      if (index < 1 || index > database.cols) throw new FormulaError(ERR.VALUE);
      return index - 1;
    }
    const name = toText(field).trim().toUpperCase();
    for (let col = 0; col < database.cols; col += 1) {
      if (toText(database.cellAt(0, col)).trim().toUpperCase() === name) return col;
    }
    throw new FormulaError(ERR.VALUE);
  }

  function databaseMatches(database, criteria) {
    if (!(database instanceof RangeValue)) throw new FormulaError(ERR.VALUE);
    if (!(criteria instanceof RangeValue) || criteria.rows === 0) {
      return Array.from({ length: Math.max(0, database.rows - 1) }, (_, index) => index + 1);
    }
    const conditions = [];
    for (let col = 0; col < criteria.cols; col += 1) {
      const header = toText(criteria.cellAt(0, col)).trim().toUpperCase();
      if (!header) continue;
      let databaseCol = -1;
      for (let candidate = 0; candidate < database.cols; candidate += 1) {
        if (toText(database.cellAt(0, candidate)).trim().toUpperCase() === header) {
          databaseCol = candidate;
          break;
        }
      }
      if (databaseCol < 0) throw new FormulaError(ERR.VALUE);
      const rows = [];
      for (let row = 1; row < criteria.rows; row += 1) {
        const raw = criteria.cellAt(row, col);
        rows.push(raw === "" ? null : criteriaMatcher(raw));
      }
      conditions.push({ databaseCol, rows });
    }
    if (!conditions.length) {
      return Array.from({ length: Math.max(0, database.rows - 1) }, (_, index) => index + 1);
    }
    const matches = [];
    for (let row = 1; row < database.rows; row += 1) {
      let rowMatches = false;
      for (let criteriaRow = 0; criteriaRow < criteria.rows - 1; criteriaRow += 1) {
        const active = conditions.filter((condition) => condition.rows[criteriaRow]);
        if (!active.length) continue;
        if (active.every((condition) => matchesCriteria(
          database.cellAt(row, condition.databaseCol),
          condition.rows[criteriaRow]
        ))) {
          rowMatches = true;
          break;
        }
      }
      if (rowMatches) matches.push(row);
    }
    return matches;
  }

  function referenceBounds(node, context) {
    if (!node) return null;
    if (node.type === "ref") {
      return { start: node.value, end: node.value, sheet: node.sheet };
    }
    if (node.type === "range") {
      return { start: node.start, end: node.end, sheet: node.sheet };
    }
    const value = evaluateNode(node, context);
    if (value instanceof RangeValue && value.cells.length) {
      return {
        start: value.cells[0].ref,
        end: value.cells[value.cells.length - 1].ref,
        sheet: "",
      };
    }
    return null;
  }

  function rangeTextValue(text, context) {
    let source = String(text == null ? "" : text).trim().replace(/^=/, "").replace(/\$/g, "");
    if (!source) throw new FormulaError(ERR.REF);
    let sheetName = "";
    const sheetMatch = /^(?:'((?:[^']|'')+)'|([^!]+))!(.+)$/.exec(source);
    if (sheetMatch) {
      sheetName = (sheetMatch[1] || sheetMatch[2]).replace(/''/g, "'").trim();
      source = sheetMatch[3].trim();
    }
    if (/^[A-Za-z_][A-Za-z0-9_.]*$/.test(source) && context.names) {
      return context.getNamedRange(source.toUpperCase());
    }
    const rangeMatch = /^([A-Za-z]{1,3}\d{1,7}):([A-Za-z]{1,3}\d{1,7})$/.exec(source);
    if (rangeMatch) return context.getRange(rangeMatch[1], rangeMatch[2], sheetName);
    if (/^[A-Za-z]{1,3}\d{1,7}$/.test(source)) return context.getCell(source, sheetName);
    throw new FormulaError(ERR.REF);
  }

  function currentRowColumn(context, node, returnRow) {
    let bounds = node ? referenceBounds(node, context) : null;
    if (!bounds && context.formulaCell) {
      bounds = { start: context.formulaCell, end: context.formulaCell };
    }
    if (!bounds) return 1;
    const parsed = parseCellRef(bounds.start);
    return returnRow ? parsed.row : parsed.col;
  }

  function xlookupValue(args, notFound) {
    const lookup = scalar(args[0]);
    const lookupArray = args[1];
    const returnArray = args[2];
    if (!(lookupArray instanceof RangeValue) || !(returnArray instanceof RangeValue)) {
      throw new FormulaError(ERR.VALUE);
    }
    const matchMode = args.length > 4 ? Math.trunc(toNumber(args[4])) : 0;
    const searchMode = args.length > 5 ? Math.trunc(toNumber(args[5])) : 1;
    const vertical = lookupArray.rows >= lookupArray.cols;
    const size = vertical ? lookupArray.rows : lookupArray.cols;
    const indexes = Array.from({ length: size }, (_, index) => index);
    if (searchMode === -1) indexes.reverse();
    const candidates = indexes.map((index) => vertical
      ? lookupArray.cellAt(index, 0)
      : lookupArray.cellAt(0, index));
    let found = -1;
    if (matchMode === 0 || matchMode === 2) {
      const matcher = matchMode === 2 ? criteriaMatcher(lookup) : null;
      found = indexes.find((index) => {
        const candidate = candidates[indexes.indexOf(index)];
        return matcher ? matchesCriteria(candidate, matcher) : compareValues(candidate, lookup, "=");
      });
      if (found == null) found = -1;
    } else {
      let best = -1;
      indexes.forEach((index) => {
        const candidate = candidates[indexes.indexOf(index)];
        const relation = matchMode === -1 ? "<=" : ">=";
        if (!compareValues(candidate, lookup, relation)) return;
        if (best < 0) {
          best = index;
          return;
        }
        const bestCandidate = candidates[indexes.indexOf(best)];
        const closer = matchMode === -1
          ? compareValues(candidate, bestCandidate, ">")
          : compareValues(candidate, bestCandidate, "<");
        if (closer) best = index;
      });
      found = best;
    }
    if (found < 0) return notFound;
    if (vertical) {
      if (returnArray.rows !== lookupArray.rows) throw new FormulaError(ERR.VALUE);
      if (returnArray.cols === 1) return returnArray.cellAt(found, 0);
      return new RangeValue(
        Array.from({ length: returnArray.cols }, (_, col) => ({
          ref: returnArray.cells[found * returnArray.cols + col].ref,
          value: returnArray.cellAt(found, col),
        })),
        1,
        returnArray.cols,
        returnArray.hiddenRows
      );
    }
    if (returnArray.cols !== lookupArray.cols) throw new FormulaError(ERR.VALUE);
    if (returnArray.rows === 1) return returnArray.cellAt(0, found);
    return new RangeValue(
      Array.from({ length: returnArray.rows }, (_, row) => ({
        ref: returnArray.cells[row * returnArray.cols + found].ref,
        value: returnArray.cellAt(row, found),
      })),
      returnArray.rows,
      1,
      returnArray.hiddenRows
    );
  }

  function pivotLookup(context, args) {
    const dataField = toText(args[0]);
    const pairs = [];
    for (let index = 2; index + 1 < args.length; index += 2) {
      pairs.push([toText(args[index]), scalar(args[index + 1])]);
    }
    const source = context.options && context.options.pivotData;
    if (typeof source === "function") {
      const result = source(dataField, pairs);
      if (result == null) throw new FormulaError(ERR.REF);
      return result;
    }
    if (Array.isArray(source)) {
      const matches = source.filter((entry) => pairs.every(([field, item]) => (
        compareValues(entry[field], item, "=")
      )));
      if (!matches.length) throw new FormulaError(ERR.REF);
      if (matches.length === 1 && Object.prototype.hasOwnProperty.call(matches[0], dataField)) {
        return matches[0][dataField];
      }
      return matches.reduce((total, entry) => (
        total + (Object.prototype.hasOwnProperty.call(entry, dataField)
          ? toNumber(entry[dataField])
          : toNumber(entry.value))
      ), 0);
    }
    if (source && typeof source === "object") {
      const key = pairs.map(([field, item]) => field + "=" + item).join("|");
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const value = source[key];
        return typeof value === "object" && value !== null ? value[dataField] : value;
      }
    }
    throw new FormulaError(ERR.REF);
  }

  const FUNCTIONS = {
    SUM: (args) => sumNumbers(args),
    AVERAGE: (args) => {
      const numbers = collectNumbers(args);
      if (!numbers.length) throw new FormulaError(ERR.DIV0);
      return numbers.reduce((total, value) => total + value, 0) / numbers.length;
    },
    MAX: (args) => {
      const numbers = collectNumbers(args);
      return numbers.length ? Math.max(...numbers) : 0;
    },
    MIN: (args) => {
      const numbers = collectNumbers(args);
      return numbers.length ? Math.min(...numbers) : 0;
    },
    COUNT: (args) => collectNumbers(args).length,
    COUNTA: (args) => flattenValues(args).filter((value) => value !== "" && value != null).length,
    ROUND: (args) => {
      const value = toNumber(args[0]);
      const digits = Math.trunc(toNumber(args[1] || 0));
      return roundTo(value, digits, "nearest");
    },
    INT: (args) => Math.floor(toNumber(args[0])),
    ABS: (args) => Math.abs(toNumber(args[0])),
    MOD: (args) => {
      const divisor = toNumber(args[1]);
      if (divisor === 0) throw new FormulaError(ERR.DIV0);
      const number = toNumber(args[0]);
      return number - divisor * Math.floor(number / divisor);
    },
    POWER: (args) => Math.pow(toNumber(args[0]), toNumber(args[1])),
    SQRT: (args) => {
      const value = toNumber(args[0]);
      if (value < 0) throw new FormulaError(ERR.NUM);
      return Math.sqrt(value);
    },
    IF: {
      lazy: true,
      fn: (argNodes, context) => {
        if (argNodes.length < 2) throw new FormulaError(ERR.VALUE);
        const condition = toBoolean(evaluateNode(argNodes[0], context));
        if (condition) {
          return argNodes[1] ? evaluateNode(argNodes[1], context) : true;
        }
        return argNodes[2] ? evaluateNode(argNodes[2], context) : false;
      },
    },
    AND: {
      lazy: true,
      fn: (argNodes, context) => {
        for (const arg of argNodes) {
          if (!toBoolean(evaluateNode(arg, context))) return false;
        }
        return true;
      },
    },
    OR: {
      lazy: true,
      fn: (argNodes, context) => {
        for (const arg of argNodes) {
          if (toBoolean(evaluateNode(arg, context))) return true;
        }
        return false;
      },
    },
    NOT: (args) => !toBoolean(args[0]),
    LEFT: (args) => toText(args[0]).slice(0, Math.trunc(toNumber(args[1] || 1))),
    RIGHT: (args) => {
      const text = toText(args[0]);
      const length = Math.trunc(toNumber(args[1] || 1));
      return length <= 0 ? "" : text.slice(-length);
    },
    MID: (args) => {
      const text = toText(args[0]);
      const start = Math.max(1, Math.trunc(toNumber(args[1])));
      const length = Math.trunc(toNumber(args[2]));
      return text.slice(start - 1, start - 1 + Math.max(0, length));
    },
    LEN: (args) => toText(args[0]).length,
    UPPER: (args) => toText(args[0]).toUpperCase(),
    LOWER: (args) => toText(args[0]).toLowerCase(),
    TRIM: (args) => toText(args[0]).trim().replace(/\s+/g, " "),
    CONCATENATE: (args) => args.map(toText).join(""),
    FIND: (args) => {
      const needle = toText(args[0]);
      const haystack = toText(args[1]);
      const start = Math.max(1, Math.trunc(toNumber(args[2] || 1)));
      const index = haystack.indexOf(needle, start - 1);
      if (index < 0) throw new FormulaError(ERR.VALUE);
      return index + 1;
    },
    SEARCH: (args) => {
      const needle = toText(args[0]).toLowerCase();
      const haystack = toText(args[1]).toLowerCase();
      const start = Math.max(1, Math.trunc(toNumber(args[2] || 1)));
      const index = haystack.indexOf(needle, start - 1);
      if (index < 0) throw new FormulaError(ERR.VALUE);
      return index + 1;
    },
    IFERROR: {
      lazy: true,
      fn: (argNodes, context) => {
        if (argNodes.length < 2) throw new FormulaError(ERR.VALUE);
        try {
          return evaluateNode(argNodes[0], context);
        } catch (error) {
          if (error instanceof FormulaError) return evaluateNode(argNodes[1], context);
          throw error;
        }
      },
    },
    ROUNDUP: (args) => roundTo(toNumber(args[0]), Math.trunc(toNumber(args[1] || 0)), "up"),
    ROUNDDOWN: (args) => roundTo(toNumber(args[0]), Math.trunc(toNumber(args[1] || 0)), "down"),
    TRUNC: (args) => roundTo(toNumber(args[0]), Math.trunc(toNumber(args[1] || 0)), "down"),
    TEXT: (args) => formatDateSerial(toDateSerial(args[0]), toText(args[1])),
    TODAY: () => {
      const now = new Date();
      return excelSerialFromUtc(now.getFullYear(), now.getMonth() + 1, now.getDate());
    },
    NOW: () => {
      const now = new Date();
      const days = excelSerialFromUtc(now.getFullYear(), now.getMonth() + 1, now.getDate());
      return days + (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400;
    },
    YEAR: (args) => serialToDate(toDateSerial(args[0])).getUTCFullYear(),
    MONTH: (args) => serialToDate(toDateSerial(args[0])).getUTCMonth() + 1,
    DAY: (args) => serialToDate(toDateSerial(args[0])).getUTCDate(),
    DATE: (args) => excelSerialFromUtc(
      Math.trunc(toNumber(args[0])),
      Math.trunc(toNumber(args[1])),
      Math.trunc(toNumber(args[2]))
    ),
    PMT: (args) => {
      const rate = toNumber(args[0]);
      const nper = toNumber(args[1]);
      const pv = toNumber(args[2]);
      const fv = args.length > 3 ? toNumber(args[3]) : 0;
      const type = args.length > 4 ? toNumber(args[4]) : 0;
      if (nper === 0) throw new FormulaError(ERR.NUM);
      if (rate === 0) return -(pv + fv) / nper;
      const growth = Math.pow(1 + rate, nper);
      return -(rate * (fv + pv * growth)) / ((1 + rate * type) * (growth - 1));
    },
    FV: (args) => {
      const rate = toNumber(args[0]);
      const nper = toNumber(args[1]);
      const pmt = toNumber(args[2]);
      const pv = args.length > 3 ? toNumber(args[3]) : 0;
      const type = args.length > 4 ? toNumber(args[4]) : 0;
      if (rate === 0) return -(pv + pmt * nper);
      const growth = Math.pow(1 + rate, nper);
      return -(pv * growth + pmt * (1 + rate * type) * (growth - 1) / rate);
    },
    PV: (args) => {
      const rate = toNumber(args[0]);
      const nper = toNumber(args[1]);
      const pmt = toNumber(args[2]);
      const fv = args.length > 3 ? toNumber(args[3]) : 0;
      const type = args.length > 4 ? toNumber(args[4]) : 0;
      if (rate === 0) return -(fv + pmt * nper);
      const growth = Math.pow(1 + rate, nper);
      return -(fv + pmt * (1 + rate * type) * (growth - 1) / rate) / growth;
    },
    INDEX: (args) => {
      const source = args[0];
      if (!(source instanceof RangeValue)) throw new FormulaError(ERR.VALUE);
      let row = Math.trunc(toNumber(args[1] || 1));
      let col = args.length > 2 ? Math.trunc(toNumber(args[2])) : 1;
      if (source.rows === 1 && args.length === 2) {
        col = row;
        row = 1;
      }
      if (row < 1 || col < 1 || row > source.rows || col > source.cols) {
        throw new FormulaError(ERR.REF);
      }
      return source.cellAt(row - 1, col - 1);
    },
    MATCH: (args) => {
      const lookup = scalar(args[0]);
      const source = args[1];
      const matchType = args.length > 2 ? Math.trunc(toNumber(args[2])) : 1;
      if (!(source instanceof RangeValue)) throw new FormulaError(ERR.VALUE);
      const values = source.values();
      if (matchType === 0) {
        const index = values.findIndex((value) => compareValues(value, lookup, "="));
        if (index < 0) throw new FormulaError(ERR.NA);
        return index + 1;
      }
      let found = -1;
      values.forEach((value, index) => {
        const relation = matchType > 0 ? "<=" : ">=";
        if (compareValues(value, lookup, relation)) found = index;
      });
      if (found < 0) throw new FormulaError(ERR.NA);
      return found + 1;
    },
    HLOOKUP: (args) => {
      const lookup = scalar(args[0]);
      const table = args[1];
      const rowIndex = Math.trunc(toNumber(args[2]));
      if (!(table instanceof RangeValue) || rowIndex < 1 || rowIndex > table.rows) {
        throw new FormulaError(ERR.REF);
      }
      const approximate = args.length > 3 ? toBoolean(args[3]) : true;
      let foundCol = -1;
      for (let col = 0; col < table.cols; col += 1) {
        const candidate = table.cellAt(0, col);
        if (approximate) {
          if (compareValues(candidate, lookup, "<=")) foundCol = col;
        } else if (compareValues(candidate, lookup, "=")) {
          foundCol = col;
          break;
        }
      }
      if (foundCol < 0) throw new FormulaError(ERR.NA);
      return table.cellAt(rowIndex - 1, foundCol);
    },
    COUNTIF: (args) => {
      if (!(args[0] instanceof RangeValue)) throw new FormulaError(ERR.VALUE);
      const matcher = criteriaMatcher(scalar(args[1]));
      return args[0].values().filter((value) => matchesCriteria(value, matcher)).length;
    },
    SUMIF: (args) => {
      if (!(args[0] instanceof RangeValue)) throw new FormulaError(ERR.VALUE);
      const matcher = criteriaMatcher(scalar(args[1]));
      const criteriaValues = args[0].values();
      const sumValues = args[2] instanceof RangeValue ? args[2].values() : criteriaValues;
      let total = 0;
      criteriaValues.forEach((value, index) => {
        if (matchesCriteria(value, matcher)) {
          const sumValue = sumValues[index];
          if (typeof sumValue === "number") total += sumValue;
        }
      });
      return total;
    },
    COUNTIFS: (args) => {
      if (args.length < 2 || args.length % 2 !== 0) throw new FormulaError(ERR.VALUE);
      const first = args[0];
      if (!(first instanceof RangeValue)) throw new FormulaError(ERR.VALUE);
      const length = first.values().length;
      const columns = [];
      for (let index = 0; index < args.length; index += 2) {
        const range = args[index];
        if (!(range instanceof RangeValue) || range.values().length !== length) {
          throw new FormulaError(ERR.VALUE);
        }
        columns.push([range.values(), criteriaMatcher(scalar(args[index + 1]))]);
      }
      let count = 0;
      for (let row = 0; row < length; row += 1) {
        if (columns.every(([values, matcher]) => matchesCriteria(values[row], matcher))) count += 1;
      }
      return count;
    },
    SUMIFS: (args) => {
      const sumRange = args[0];
      if (!(sumRange instanceof RangeValue) || args.length < 3 || (args.length - 1) % 2 !== 0) {
        throw new FormulaError(ERR.VALUE);
      }
      const values = sumRange.values();
      const columns = [];
      for (let index = 1; index < args.length; index += 2) {
        const range = args[index];
        if (!(range instanceof RangeValue) || range.values().length !== values.length) {
          throw new FormulaError(ERR.VALUE);
        }
        columns.push([range.values(), criteriaMatcher(scalar(args[index + 1]))]);
      }
      let total = 0;
      for (let row = 0; row < values.length; row += 1) {
        if (!columns.every(([rangeValues, matcher]) => matchesCriteria(rangeValues[row], matcher))) continue;
        if (typeof values[row] === "number") total += values[row];
      }
      return total;
    },
    AVERAGEIF: (args) => {
      const criteriaRange = args[0];
      if (!(criteriaRange instanceof RangeValue)) throw new FormulaError(ERR.VALUE);
      const matcher = criteriaMatcher(scalar(args[1]));
      const criteriaValues = criteriaRange.values();
      const averageValues = args[2] instanceof RangeValue ? args[2].values() : criteriaValues;
      const numbers = [];
      criteriaValues.forEach((value, index) => {
        if (matchesCriteria(value, matcher) && typeof averageValues[index] === "number") {
          numbers.push(averageValues[index]);
        }
      });
      if (!numbers.length) throw new FormulaError(ERR.DIV0);
      return numbers.reduce((total, value) => total + value, 0) / numbers.length;
    },
    AVERAGEIFS: (args) => {
      const averageRange = args[0];
      if (!(averageRange instanceof RangeValue) || args.length < 3 || (args.length - 1) % 2 !== 0) {
        throw new FormulaError(ERR.VALUE);
      }
      const averageValues = averageRange.values();
      const columns = [];
      for (let index = 1; index < args.length; index += 2) {
        const range = args[index];
        if (!(range instanceof RangeValue) || range.values().length !== averageValues.length) {
          throw new FormulaError(ERR.VALUE);
        }
        columns.push([range.values(), criteriaMatcher(scalar(args[index + 1]))]);
      }
      const numbers = [];
      for (let row = 0; row < averageValues.length; row += 1) {
        if (
          columns.every(([rangeValues, matcher]) => matchesCriteria(rangeValues[row], matcher)) &&
          typeof averageValues[row] === "number"
        ) {
          numbers.push(averageValues[row]);
        }
      }
      if (!numbers.length) throw new FormulaError(ERR.DIV0);
      return numbers.reduce((total, value) => total + value, 0) / numbers.length;
    },
    SUBTOTAL: (args) => {
      const functionNumber = Math.trunc(toNumber(args[0])) % 100;
      const ranges = args.slice(1).filter((arg) => arg instanceof RangeValue);
      if (!ranges.length) throw new FormulaError(ERR.VALUE);
      const values = ranges.flatMap((range) => range.visibleValues());
      if (functionNumber === 9) {
        return values.filter((value) => typeof value === "number").reduce((total, value) => total + value, 0);
      }
      if (functionNumber === 1) {
        const numbers = values.filter((value) => typeof value === "number");
        if (!numbers.length) throw new FormulaError(ERR.DIV0);
        return numbers.reduce((total, value) => total + value, 0) / numbers.length;
      }
      if (functionNumber === 2) return values.filter((value) => typeof value === "number").length;
      if (functionNumber === 3) return values.filter((value) => value !== "" && value != null).length;
      if (functionNumber === 4) {
        const numbers = values.filter((value) => typeof value === "number");
        return numbers.length ? Math.max(...numbers) : 0;
      }
      if (functionNumber === 5) {
        const numbers = values.filter((value) => typeof value === "number");
        return numbers.length ? Math.min(...numbers) : 0;
      }
      throw new FormulaError(ERR.VALUE);
    },
    SUMPRODUCT: (args) => {
      const arrays = args.filter((arg) => arg instanceof RangeValue);
      if (!arrays.length) throw new FormulaError(ERR.VALUE);
      const length = arrays[0].values().length;
      if (arrays.some((array) => array.values().length !== length)) {
        throw new FormulaError(ERR.VALUE);
      }
      let total = 0;
      for (let index = 0; index < length; index += 1) {
        let product = 1;
        for (const array of arrays) {
          product *= toNumber(array.values()[index]);
        }
        total += product;
      }
      return total;
    },
    VLOOKUP: (args) => {
      const lookup = scalar(args[0]);
      const table = args[1];
      const columnIndex = Math.trunc(toNumber(args[2]));
      if (!(table instanceof RangeValue) || columnIndex < 1 || columnIndex > table.cols) {
        throw new FormulaError(ERR.REF);
      }
      const approximate = args.length > 3 ? toBoolean(args[3]) : true;
      let foundRow = -1;
      for (let row = 0; row < table.rows; row += 1) {
        const candidate = table.cellAt(row, 0);
        if (approximate) {
          if (compareValues(candidate, lookup, "<=")) foundRow = row;
        } else if (compareValues(candidate, lookup, "=")) {
          foundRow = row;
          break;
        }
      }
      if (foundRow < 0) throw new FormulaError(ERR.NA);
      return table.cellAt(foundRow, columnIndex - 1);
    },
    RANK: (args) => {
      const number = toNumber(args[0]);
      const values = args[1] instanceof RangeValue ? args[1].values() : [];
      const ascending = args.length > 2 ? toBoolean(args[2]) : false;
      const numbers = values.filter((value) => typeof value === "number");
      const rank = ascending
        ? numbers.filter((value) => value < number).length + 1
        : numbers.filter((value) => value > number).length + 1;
      return rank;
    },
    "RANK.EQ": (args) => {
      const number = toNumber(args[0]);
      const values = args[1] instanceof RangeValue ? args[1].values() : [];
      const ascending = args.length > 2 ? toBoolean(args[2]) : false;
      const numbers = values.filter((value) => typeof value === "number");
      return ascending
        ? numbers.filter((value) => value < number).length + 1
        : numbers.filter((value) => value > number).length + 1;
    },
    IFS: {
      lazy: true,
      fn: (argNodes, context) => {
        if (!argNodes.length || argNodes.length % 2 !== 0) throw new FormulaError(ERR.VALUE);
        for (let index = 0; index < argNodes.length; index += 2) {
          if (toBoolean(evaluateNode(argNodes[index], context))) {
            return evaluateNode(argNodes[index + 1], context);
          }
        }
        throw new FormulaError(ERR.NA);
      },
    },
    SWITCH: {
      lazy: true,
      fn: (argNodes, context) => {
        if (argNodes.length < 3) throw new FormulaError(ERR.VALUE);
        const expression = evaluateNode(argNodes[0], context);
        const pairEnd = argNodes.length % 2 === 0 ? argNodes.length : argNodes.length - 1;
        for (let index = 1; index < pairEnd; index += 2) {
          if (compareValues(expression, evaluateNode(argNodes[index], context), "=")) {
            return evaluateNode(argNodes[index + 1], context);
          }
        }
        if (argNodes.length % 2 === 0) return evaluateNode(argNodes[argNodes.length - 1], context);
        throw new FormulaError(ERR.NA);
      },
    },
    CHOOSE: {
      lazy: true,
      fn: (argNodes, context) => {
        if (argNodes.length < 2) throw new FormulaError(ERR.VALUE);
        const index = Math.trunc(toNumber(evaluateNode(argNodes[0], context)));
        if (index < 1 || index >= argNodes.length) throw new FormulaError(ERR.VALUE);
        return evaluateNode(argNodes[index], context);
      },
    },
    SUBSTITUTE: (args) => {
      const text = toText(args[0]);
      const oldText = toText(args[1]);
      const newText = toText(args[2]);
      if (!oldText) return text;
      if (args.length < 4) return text.split(oldText).join(newText);
      const instance = Math.trunc(toNumber(args[3]));
      if (instance < 1) throw new FormulaError(ERR.VALUE);
      let seen = 0;
      let index = 0;
      while (index <= text.length) {
        const found = text.indexOf(oldText, index);
        if (found < 0) break;
        seen += 1;
        if (seen === instance) {
          return text.slice(0, found) + newText + text.slice(found + oldText.length);
        }
        index = found + oldText.length;
      }
      return text;
    },
    REPLACE: (args) => {
      const text = toText(args[0]);
      const start = Math.trunc(toNumber(args[1]));
      const count = Math.trunc(toNumber(args[2]));
      const replacement = toText(args[3]);
      if (start < 1 || count < 0) throw new FormulaError(ERR.VALUE);
      return text.slice(0, start - 1) + replacement + text.slice(start - 1 + count);
    },
    VALUE: (args) => {
      const raw = scalar(args[0]);
      if (typeof raw === "number") return raw;
      if (typeof raw === "boolean") return raw ? 1 : 0;
      const text = toText(raw).trim();
      if (!text) throw new FormulaError(ERR.VALUE);
      const parenthesized = /^\((.*)\)$/.exec(text);
      let source = parenthesized ? parenthesized[1].trim() : text;
      const percent = /%$/.test(source);
      if (percent) source = source.slice(0, -1).trim();
      if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}(?:[ T].*)?$/.test(source)) {
        return toDateSerial(source);
      }
      source = source.replace(/[,\s]/g, "").replace(/^[^\d+\-.]*/, "").replace(/[^\d.eE+\-]*$/, "");
      const value = Number(source);
      if (Number.isNaN(value)) throw new FormulaError(ERR.VALUE);
      return (parenthesized ? -value : value) * (percent ? 0.01 : 1);
    },
    PROPER: (args) => toText(args[0]).toLowerCase().replace(/(^|[^A-Za-z0-9])([A-Za-z])/g, (match, prefix, letter) => (
      prefix + letter.toUpperCase()
    )),
    CONCAT: (args) => flattenValues(args).map(toText).join(""),
    TEXTJOIN: (args) => {
      if (args.length < 3) throw new FormulaError(ERR.VALUE);
      const delimiter = toText(args[0]);
      const ignoreEmpty = toBoolean(args[1]);
      const values = flattenValues(args.slice(2))
        .filter((value) => !ignoreEmpty || (value !== "" && value != null))
        .map(toText);
      return values.join(delimiter);
    },
    REPT: (args) => {
      const text = toText(args[0]);
      const times = Math.trunc(toNumber(args[1]));
      if (times < 0) throw new FormulaError(ERR.VALUE);
      if (text.length * times > 32767) throw new FormulaError(ERR.VALUE);
      return text.repeat(times);
    },
    COUNTBLANK: (args) => flattenValues(args).filter((value) => value === "" || value == null).length,
    MEDIAN: (args) => {
      const numbers = collectNumbers(args).sort((left, right) => left - right);
      if (!numbers.length) throw new FormulaError(ERR.NUM);
      const middle = Math.floor(numbers.length / 2);
      return numbers.length % 2 ? numbers[middle] : (numbers[middle - 1] + numbers[middle]) / 2;
    },
    LARGE: (args) => {
      const numbers = collectNumbers([args[0]]).sort((left, right) => right - left);
      const k = Math.trunc(toNumber(args[1]));
      if (k < 1 || k > numbers.length) throw new FormulaError(ERR.NUM);
      return numbers[k - 1];
    },
    SMALL: (args) => {
      const numbers = collectNumbers([args[0]]).sort((left, right) => left - right);
      const k = Math.trunc(toNumber(args[1]));
      if (k < 1 || k > numbers.length) throw new FormulaError(ERR.NUM);
      return numbers[k - 1];
    },
    CEILING: (args) => {
      const number = toNumber(args[0]);
      const significance = args.length > 1 ? toNumber(args[1]) : 1;
      if (significance === 0) return 0;
      if (number !== 0 && significance !== 0 && Math.sign(number) !== Math.sign(significance)) {
        throw new FormulaError(ERR.NUM);
      }
      return Math.ceil(number / significance) * significance;
    },
    FLOOR: (args) => {
      const number = toNumber(args[0]);
      const significance = args.length > 1 ? toNumber(args[1]) : 1;
      if (significance === 0) return 0;
      if (number !== 0 && significance !== 0 && Math.sign(number) !== Math.sign(significance)) {
        throw new FormulaError(ERR.NUM);
      }
      return Math.floor(number / significance) * significance;
    },
    RAND: () => Math.random(),
    RANDBETWEEN: (args) => {
      const bottom = Math.ceil(toNumber(args[0]));
      const top = Math.floor(toNumber(args[1]));
      if (bottom > top) throw new FormulaError(ERR.NUM);
      return bottom + Math.floor(Math.random() * (top - bottom + 1));
    },
    OFFSET: {
      lazy: true,
      fn: (argNodes, context) => {
        if (argNodes.length < 3) throw new FormulaError(ERR.VALUE);
        const base = referenceBounds(argNodes[0], context);
        if (!base) throw new FormulaError(ERR.REF);
        const start = parseCellRef(base.start);
        const end = parseCellRef(base.end);
        const rowOffset = Math.trunc(toNumber(evaluateNode(argNodes[1], context)));
        const colOffset = Math.trunc(toNumber(evaluateNode(argNodes[2], context)));
        const height = argNodes.length > 3
          ? Math.trunc(toNumber(evaluateNode(argNodes[3], context)))
          : end.row - start.row + 1;
        const width = argNodes.length > 4
          ? Math.trunc(toNumber(evaluateNode(argNodes[4], context)))
          : end.col - start.col + 1;
        if (height < 1 || width < 1) throw new FormulaError(ERR.REF);
        const firstRow = start.row + rowOffset;
        const firstCol = start.col + colOffset;
        if (firstRow < 1 || firstCol < 1) throw new FormulaError(ERR.REF);
        return context.getRange(
          cellName(firstCol, firstRow),
          cellName(firstCol + width - 1, firstRow + height - 1),
          base.sheet
        );
      },
    },
    INDIRECT: {
      lazy: true,
      fn: (argNodes, context) => {
        if (!argNodes.length) throw new FormulaError(ERR.VALUE);
        const reference = toText(evaluateNode(argNodes[0], context));
        if (argNodes.length > 1 && !toBoolean(evaluateNode(argNodes[1], context))) {
          throw new FormulaError(ERR.REF);
        }
        return rangeTextValue(reference, context);
      },
    },
    ROW: {
      lazy: true,
      fn: (argNodes, context) => currentRowColumn(context, argNodes[0], true),
    },
    COLUMN: {
      lazy: true,
      fn: (argNodes, context) => currentRowColumn(context, argNodes[0], false),
    },
    ROWS: (args) => {
      const source = args[0];
      if (source instanceof RangeValue) return source.rows;
      if (Array.isArray(source)) return source.length;
      return 1;
    },
    COLUMNS: (args) => {
      const source = args[0];
      if (source instanceof RangeValue) return source.cols;
      if (Array.isArray(source)) return source.length && Array.isArray(source[0]) ? source[0].length : 1;
      return 1;
    },
    WEEKDAY: (args) => weekdayNumber(args[0], args[1]),
    WEEKNUM: (args) => weekNumber(args[0], args[1]),
    EDATE: (args) => addMonths(args[0], toNumber(args[1]), false),
    EOMONTH: (args) => addMonths(args[0], toNumber(args[1]), true),
    WORKDAY: (args) => workdayValue(args[0], args[1], holidaySerials(args[2])),
    NETWORKDAYS: (args) => networkdaysValue(args[0], args[1], holidaySerials(args[2])),
    DATEDIF: (args) => dateDifference(args[0], args[1], args[2]),
    NPV: (args) => {
      if (args.length < 2) throw new FormulaError(ERR.VALUE);
      const rate = toNumber(args[0]);
      const values = collectNumbers(args.slice(1));
      return values.reduce((total, value, index) => total + value / Math.pow(1 + rate, index + 1), 0);
    },
    IRR: (args) => {
      const values = collectNumbers([args[0]]);
      const guess = args.length > 1 ? toNumber(args[1]) : 0.1;
      return calculateIrr(values, guess);
    },
    DSUM: (args) => {
      const database = args[0];
      const field = databaseFieldIndex(database, args[1]);
      return databaseMatches(database, args[2]).reduce((total, row) => {
        const value = database.cellAt(row, field);
        return total + (typeof value === "number" ? value : 0);
      }, 0);
    },
    DCOUNT: (args) => {
      const database = args[0];
      const field = databaseFieldIndex(database, args[1]);
      return databaseMatches(database, args[2]).filter((row) => (
        typeof database.cellAt(row, field) === "number"
      )).length;
    },
    DGET: (args) => {
      const database = args[0];
      const field = databaseFieldIndex(database, args[1]);
      const matches = databaseMatches(database, args[2]);
      if (matches.length > 1) throw new FormulaError(ERR.VALUE);
      if (!matches.length) throw new FormulaError(ERR.NUM);
      return database.cellAt(matches[0], field);
    },
    GETPIVOTDATA: (args, context) => pivotLookup(context, args),
    XLOOKUP: (args) => {
      const notFound = args.length > 3 ? args[3] : ERR.NA;
      try {
        return xlookupValue(args, notFound);
      } catch (error) {
        if (error instanceof FormulaError && error.code === ERR.NA) return notFound;
        throw error;
      }
    },
    UNIQUE: (args) => {
      const matrix = rangeMatrix(args[0]);
      const byCol = args.length > 1 && toBoolean(args[1]);
      const exactlyOnce = args.length > 2 && toBoolean(args[2]);
      const work = byCol ? matrix[0].map((_, col) => matrix.map((row) => row[col])) : matrix;
      const counts = new Map();
      work.forEach((row) => {
        const key = JSON.stringify(row);
        counts.set(key, (counts.get(key) || 0) + 1);
      });
      const seen = new Set();
      const unique = work.filter((row) => {
        const key = JSON.stringify(row);
        if (seen.has(key)) return false;
        seen.add(key);
        return exactlyOnce ? counts.get(key) === 1 : true;
      });
      const result = byCol && unique.length
        ? unique[0].map((_, row) => unique.map((column) => column[row]))
        : unique;
      if (!result.length) throw new FormulaError(ERR.NA);
      return matrixRange(result);
    },
    SORT: (args) => {
      const matrix = rangeMatrix(args[0]);
      const sortIndex = args.length > 1 ? Math.trunc(toNumber(args[1])) : 1;
      const order = args.length > 2 ? Math.trunc(toNumber(args[2])) : 1;
      const byCol = args.length > 3 && toBoolean(args[3]);
      const work = byCol ? matrix[0].map((_, col) => matrix.map((row) => row[col])) : matrix.map((row) => row.slice());
      const index = sortIndex - 1;
      if (index < 0 || index >= (work[0] ? work[0].length : 0)) throw new FormulaError(ERR.VALUE);
      work.sort((left, right) => {
        const leftValue = sortableValues([left])[0][index];
        const rightValue = sortableValues([right])[0][index];
        const leftBlank = leftValue === "" || leftValue == null;
        const rightBlank = rightValue === "" || rightValue == null;
        if (leftBlank || rightBlank) {
          return leftBlank === rightBlank ? 0 : leftBlank ? 1 : -1;
        }
        return compareSortable(leftValue, rightValue) * (order < 0 ? -1 : 1);
      });
      const result = byCol ? work[0].map((_, row) => work.map((column) => column[row])) : work;
      if (!result.length) throw new FormulaError(ERR.NA);
      return matrixRange(result);
    },
    FILTER: (args) => {
      const matrix = rangeMatrix(args[0]);
      const include = args[1];
      if (!(include instanceof RangeValue)) throw new FormulaError(ERR.VALUE);
      const flags = rangeMatrix(include);
      const rows = matrix.length;
      const cols = rows ? matrix[0].length : 0;
      let filtered = [];
      if (flags.length === rows) {
        filtered = matrix.filter((_, row) => flags[row].every((value) => toBoolean(value)));
      } else if (flags.length && flags[0].length === cols) {
        const selectedColumns = [];
        for (let col = 0; col < cols; col += 1) {
          if (flags.every((flagRow) => toBoolean(flagRow[col]))) selectedColumns.push(col);
        }
        filtered = matrix.map((row) => selectedColumns.map((col) => row[col]));
      } else {
        throw new FormulaError(ERR.VALUE);
      }
      if (!filtered.length || !filtered[0].length) {
        if (args.length > 2) return scalar(args[2]);
        throw new FormulaError(ERR.NA);
      }
      return matrixRange(filtered);
    },
    SEQUENCE: (args) => {
      const rows = Math.trunc(toNumber(args[0]));
      const cols = args.length > 1 ? Math.trunc(toNumber(args[1])) : 1;
      const start = args.length > 2 ? toNumber(args[2]) : 1;
      const step = args.length > 3 ? toNumber(args[3]) : 1;
      if (rows < 1 || cols < 1 || rows * cols > 10000) throw new FormulaError(ERR.NUM);
      const matrix = [];
      let value = start;
      for (let row = 0; row < rows; row += 1) {
        const values = [];
        for (let col = 0; col < cols; col += 1) {
          values.push(value);
          value += step;
        }
        matrix.push(values);
      }
      return matrixRange(matrix);
    },
  };

  function formatValue(value) {
    if (value instanceof RangeValue) {
      return formatValue(value.topLeft());
    }
    if (value == null || value === "") {
      return "";
    }
    if (typeof value === "boolean") {
      return value ? "TRUE" : "FALSE";
    }
    if (typeof value === "number") {
      if (!Number.isFinite(value)) return ERR.NUM;
      const rounded = Math.round(value * 1e10) / 1e10;
      return String(rounded);
    }
    return String(value);
  }

  function evaluate(formula, sheet, options) {
    try {
      const ast = parseFormula(formula);
      const context = new FormulaContext(sheet, [], options);
      let value = evaluateNode(ast, context);
      if (value instanceof RangeValue) {
        value = value.topLeft();
      }
      return { ok: true, value, display: formatValue(value) };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof FormulaError ? error.code : ERR.VALUE,
      };
    }
  }

  function normalizeFormula(formula) {
    return String(formula == null ? "" : formula)
      .trim()
      .replace(/＝/g, "=")
      .replace(/（/g, "(")
      .replace(/）/g, ")")
      .replace(/，/g, ",")
      .replace(/\s+/g, "")
      .replace(/\$/g, "")
      .toUpperCase();
  }

  global.FormulaEngine = {
    ERR,
    evaluate,
    formatValue,
    normalizeFormula,
    evaluateCell(ref, sheet) {
      try {
        const value = new FormulaContext(sheet, []).getCell(ref);
        return { ok: true, value, display: formatValue(value) };
      } catch (error) {
        return { ok: false, error: error instanceof FormulaError ? error.code : ERR.VALUE };
      }
    },
  };
})(window);
