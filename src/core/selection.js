(function () {
  "use strict";

  function clampCaret(formula, start, end) {
    const length = String(formula || "").length;
    const first = Math.max(0, Math.min(length, Number.isInteger(start) ? start : length));
    const last = Math.max(first, Math.min(length, Number.isInteger(end) ? end : first));
    return { start: first, end: last };
  }

  function insertFormulaToken(formula, selection, token, options) {
    const config = Object.assign({}, options || {});
    let text = String(formula || "");
    let caret = clampCaret(text, selection.start, selection.end);
    const insertion = String(token || "");

    if (config.replaceToken && selection.previous && caret.start === selection.previous.end &&
        text.slice(selection.previous.start, selection.previous.end) === selection.previous.token) {
      text = text.slice(0, selection.previous.start) + insertion + text.slice(selection.previous.end);
      const tokenStart = selection.previous.start;
      const tokenEnd = tokenStart + insertion.length;
      return { formula: text, tokenStart, tokenEnd, caret: tokenEnd, insertedComma: false, insertedClose: false };
    }

    if (!text.trim().startsWith("=")) {
      text = "=" + text;
      caret = { start: caret.start + 1, end: caret.end + 1 };
    }
    const before = text.slice(0, caret.start);
    const after = text.slice(caret.end);
    const next = before + insertion + after;
    const tokenStart = caret.start;
    const tokenEnd = tokenStart + insertion.length;
    return { formula: next, tokenStart, tokenEnd, caret: tokenEnd, insertedComma: false, insertedClose: false };
  }

  function findOccurrence(formula, ref) {
    const target = String(ref || "").toUpperCase();
    const pattern = /\$?([A-Za-z]{1,3})\$?(\d{1,7})/g;
    let match;
    while ((match = pattern.exec(String(formula || "")))) {
      const plain = match[1].toUpperCase() + match[2];
      if (plain !== target) continue;
      const before = formula.charAt(match.index - 1);
      const after = formula.charAt(match.index + match[0].length);
      if (before === ":" || after === ":") continue;
      return { start: match.index, end: match.index + match[0].length, token: match[0] };
    }
    return null;
  }

  window.SheetSelection = {
    clampCaret,
    insertFormulaToken,
    findOccurrence,
  };
})();
