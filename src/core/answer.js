(function () {
  "use strict";

  const Data = window.CourseData;

  function usedFunctions(normalized) {
    const names = [];
    const pattern = /([A-Z][A-Z0-9.]*)\s*\(/g;
    let match;
    while ((match = pattern.exec(String(normalized || "")))) {
      if (!names.includes(match[1])) names.push(match[1]);
    }
    return names;
  }

  function taskFunctions(task) {
    if (Array.isArray(task.requiredFunctions) && task.requiredFunctions.length) return task.requiredFunctions;
    return task.requiredFunction ? [task.requiredFunction] : [];
  }

  function parseReferenceSet(normalizedFormula) {
    const stripped = String(normalizedFormula || "").replace(/"[^"]*"/g, "");
    const matches = stripped.match(/\$?[A-Za-z]{1,3}\$?\d{1,7}(?::\$?[A-Za-z]{1,3}\$?\d{1,7})?/g) || [];
    const refs = [];
    matches.forEach((token) => {
      const plain = token.replace(/\$/g, "").toUpperCase();
      if (plain.includes(":")) {
        const parts = plain.split(":");
        refs.push(...Data.expandRange(parts[0], parts[1]));
      } else {
        refs.push(plain);
      }
    });
    return refs;
  }

  function valuesEqual(actual, expected) {
    if (typeof actual === "number" && typeof expected === "number") {
      return Math.abs(actual - expected) < 1e-7;
    }
    if (typeof actual === "boolean" || typeof expected === "boolean") {
      return actual === expected;
    }
    return String(actual) === String(expected);
  }

  function columnNumber(letters) {
    return Array.from(String(letters || "").toUpperCase())
      .reduce((total, character) => total * 26 + character.charCodeAt(0) - 64, 0);
  }

  function columnLetters(number) {
    let value = Math.max(1, Number(number) || 1);
    let letters = "";
    while (value > 0) {
      const remainder = (value - 1) % 26;
      letters = String.fromCharCode(65 + remainder) + letters;
      value = Math.floor((value - 1) / 26);
    }
    return letters;
  }

  function translateFormula(formula, deltaRow, deltaCol) {
    const source = String(formula || "");
    if (!deltaRow && !deltaCol) return source;
    return source.replace(
      /"(?:[^"]|"")*"|(?<![A-Za-z0-9_])(\$?)([A-Za-z]{1,3})(\$?)(\d{1,7})(?![A-Za-z0-9_])/g,
      (token, colLock, col, rowLock, row) => {
        if (!col || !row) return token;
        const nextColumnNumber = columnNumber(col) + (colLock ? 0 : deltaCol);
        const nextRowNumber = Number(row) + (rowLock ? 0 : deltaRow);
        if (nextColumnNumber < 1 || nextRowNumber < 1) return "#REF!";
        const nextCol = columnLetters(nextColumnNumber);
        const nextRow = String(nextRowNumber);
        return colLock + nextCol + rowLock + nextRow;
      }
    );
  }

  function missingSourceRefs(normalizedFormula, referenceFormula) {
    const expected = Array.from(new Set(parseReferenceSet(referenceFormula)));
    if (!expected.length) return [];
    const actual = new Set(parseReferenceSet(normalizedFormula));
    return expected.filter((ref) => !actual.has(ref));
  }

  window.AnswerEngine = {
    usedFunctions,
    taskFunctions,
    parseReferenceSet,
    valuesEqual,
    columnNumber,
    columnLetters,
    translateFormula,
    missingSourceRefs,
  };
})();
