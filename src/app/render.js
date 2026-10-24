(function () {
  "use strict";

  const Engine = window.FormulaEngine;
  const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (character) => ESCAPES[character]);
  }

  function lt(value) {
    return window.I18N ? window.I18N.text(value) : String(value == null ? "" : value);
  }

  function tr(key, params) {
    return window.I18N ? window.I18N.t(key, params) : key;
  }

  const UI_ICON_PATHS = {
    settings: '<path d="M3 5h14M3 10h14M3 15h14"></path><circle cx="7" cy="5" r="1.6"></circle><circle cx="13" cy="10" r="1.6"></circle><circle cx="9" cy="15" r="1.6"></circle>',
    hint: '<path d="M10 2.2a5 5 0 00-3.4 8.7c.6.6.9 1.1.9 1.9h5c0-.8.3-1.3.9-1.9A5 5 0 0010 2.2z"></path><path d="M8 15.5h4M9 18h2"></path>',
    sound: '<path d="M3 8h3l4-3v10l-4-3H3z"></path><path d="M13 7a4 4 0 010 6"></path>',
    language: '<circle cx="10" cy="10" r="7"></circle><path d="M3 10h14M10 3c3 2.4 3 11.6 0 14M10 3c-3 2.4-3 11.6 0 14"></path>',
    backup: '<path d="M10 2v9M7 8l3 3 3-3"></path><path d="M3 13v3h14v-3"></path>',
    unlock: '<rect x="4" y="9" width="12" height="8" rx="2"></rect><path d="M7 9V6a3 3 0 016 0"></path>',
    reset: '<path d="M4 10a6 6 0 101.8-4.2"></path><path d="M4 3v4h4"></path>',
    accuracy: '<circle cx="10" cy="10" r="7"></circle><circle cx="10" cy="10" r="3.5"></circle><circle cx="10" cy="10" r="0.8"></circle>',
    flag: '<path d="M5 18V3m0 0c4-2 6 2 10 0v8c-4 2-6-2-10 0"></path>',
  };

  function uiIcon(name) {
    const path = UI_ICON_PATHS[name] || "";
    return '<svg class="ui-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">' + path + "</svg>";
  }

  function expectedFor(item) {
    if (!item) return undefined;
    const language = window.I18N ? window.I18N.getLanguage() : "zh-CN";
    if (item.expectedByLanguage) {
      return item.expectedByLanguage[language] == null
        ? item.expectedByLanguage["zh-CN"]
        : item.expectedByLanguage[language];
    }
    return item.expected;
  }

  function formatSheetValue(value) {
    if (value === undefined || value === null || value === "") return "";
    if (typeof value === "number") {
      if (!Number.isFinite(value)) return "#NUM!";
      return String(Math.round(value * 100) / 100);
    }
    return String(value);
  }

  function colToNumber(letters) {
    return Array.from(letters.toUpperCase()).reduce((total, character) => total * 26 + character.charCodeAt(0) - 64, 0);
  }

  function numberToCol(value) {
    let number = value;
    let result = "";
    while (number > 0) {
      const remainder = (number - 1) % 26;
      result = String.fromCharCode(65 + remainder) + result;
      number = Math.floor((number - 1) / 26);
    }
    return result;
  }

  function parseRef(ref) {
    const match = /^([A-Za-z]+)(\d+)$/.exec(String(ref || "").replace(/\$/g, ""));
    if (!match) return null;
    return { col: colToNumber(match[1]), row: Number(match[2]) };
  }

  function inRange(ref, start, end) {
    if (!start || !end) return false;
    const cell = parseRef(ref);
    const first = parseRef(start);
    const last = parseRef(end);
    if (!cell || !first || !last) return false;
    return cell.row >= Math.min(first.row, last.row) && cell.row <= Math.max(first.row, last.row) &&
      cell.col >= Math.min(first.col, last.col) && cell.col <= Math.max(first.col, last.col);
  }

  function rangeReference(start, end) {
    const first = parseRef(start);
    const last = parseRef(end);
    if (!first || !last) return start;
    const firstRow = Math.min(first.row, last.row);
    const lastRow = Math.max(first.row, last.row);
    const firstCol = Math.min(first.col, last.col);
    const lastCol = Math.max(first.col, last.col);
    if (firstRow === lastRow && firstCol === lastCol) return numberToCol(firstCol) + firstRow;
    return numberToCol(firstCol) + firstRow + ":" + numberToCol(lastCol) + lastRow;
  }

  function resolveSheet(sheetOrKey) {
    const raw = typeof sheetOrKey === "string"
      ? (window.COURSE && window.COURSE.sheets ? window.COURSE.sheets[sheetOrKey] : null)
      : sheetOrKey;
    if (!raw) return {};
    return Object.fromEntries(Object.entries(raw).map(([ref, value]) => [ref, lt(value)]));
  }

  function referencesInFormula(formula) {
    const source = String(formula || "").replace(/"(?:[^"]|"")*"/g, '""');
    const matches = source.match(/\$?[A-Z]{1,3}\$?\d{1,7}(?::\$?[A-Z]{1,3}\$?\d{1,7})?/g) || [];
    const cells = new Set();
    const columns = new Set();
    const rows = new Set();
    matches.forEach((token) => {
      const parts = token.replace(/\$/g, "").split(":");
      const first = parseRef(parts[0]);
      const last = parseRef(parts[parts.length - 1]);
      if (!first || !last) return;
      for (let row = Math.min(first.row, last.row); row <= Math.max(first.row, last.row); row += 1) {
        rows.add(row);
        for (let col = Math.min(first.col, last.col); col <= Math.max(first.col, last.col); col += 1) {
          columns.add(col);
          cells.add(numberToCol(col) + row);
        }
      }
    });
    return { cells, columns, rows };
  }

  function sheetBounds(sheet, refs) {
    const parsed = Object.keys(sheet).map(parseRef).filter(Boolean);
    (refs || []).forEach((ref) => {
      const parsedRef = parseRef(ref);
      if (parsedRef) parsed.push(parsedRef);
    });
    return {
      maxRow: Math.max(1, ...parsed.map((item) => item.row)),
      maxCol: Math.max(1, ...parsed.map((item) => item.col)),
    };
  }

  function answerRangeForTask(task) {
    const raw = task && (task.targetRange || task.target);
    const parts = String(raw || "").toUpperCase().replace(/\s+/g, "").split(":");
    const first = parseRef(parts[0]);
    const last = parseRef(parts[parts.length - 1]);
    if (!first || !last) return null;
    const left = Math.min(first.col, last.col);
    const right = Math.max(first.col, last.col);
    const top = Math.min(first.row, last.row);
    const bottom = Math.max(first.row, last.row);
    const cells = [];
    for (let row = top; row <= bottom; row += 1) {
      for (let col = left; col <= right; col += 1) cells.push(numberToCol(col) + row);
    }
    return {
      cells,
      startRef: numberToCol(left) + top,
      endRef: numberToCol(right) + bottom,
      top,
      left,
      bottom,
      right,
      isMulti: cells.length > 1,
    };
  }

  function chapterArtSvg(number) {
    return window.ChapterArt ? window.ChapterArt.svg(number) : "";
  }

  function islandMarkSvg() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" focusable="false" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#EAF8DF" />
      <path d="M5 44c9-5 18-4 27 0s18 5 27 0v10c-9 5-18 4-27 0S14 49 5 54z" fill="#B7E98C" />
      <path d="M13 43c9-8 29-8 38 0-9 9-29 9-38 0z" fill="#58CC02" />
      <path d="M32 39c1-8 4-14 8-18" fill="none" stroke="#1F6B2A" stroke-width="3.4" stroke-linecap="round" />
      <path d="M40 20c-7-4-12-2-14 2 5 1 10 1 14-2zm0 0c1-7 6-10 11-10-1 6-4 9-11 10zm0 0c5 1 8 4 10 8-5-1-8-3-10-8z" fill="#2E9E34" />
      <rect x="10" y="14" width="16" height="13" rx="3" fill="#FFFFFF" />
      <path d="M15 14v13m5-13v13m-10-6.5h16" fill="none" stroke="#2E9E34" stroke-width="1.25" />
      <path d="M11 49c3 2 7 2 10 0" fill="none" stroke="#F4FFE9" stroke-width="2" stroke-linecap="round" />
    </svg>`;
  }

  function modeIconSvg(mode) {
    if (mode === "comprehensive") {
      return '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><rect x="7" y="8" width="34" height="32" rx="8" fill="none" stroke="currentColor" stroke-width="3"/><path d="M7 18h34M18 18v22M30 18v22" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M11 13h3m5 0h3m5 0h3" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>';
    }
    if (mode === "daily") {
      return '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><rect x="7" y="9" width="34" height="32" rx="8" fill="none" stroke="currentColor" stroke-width="3"/><path d="M7 19h34M16 6v7M32 6v7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M16 29h5v5h-5zM24 29h5v5h-5zM32 29h2v5h-2z" fill="currentColor"/></svg>';
    }
    return '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M8 36c7-8 11-5 16-12s9-12 16-10" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/><circle cx="9" cy="36" r="4" fill="currentColor"/><circle cx="24" cy="24" r="4" fill="currentColor"/><circle cx="40" cy="14" r="4" fill="currentColor"/><path d="M34 8l7 2-2 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function renderModeSelector(summary) {
    const data = summary || {};
    const course = data.course || {};
    const comprehensive = data.comprehensive || {};
    const daily = data.daily || {};
    const cards = [
      {
        mode: "course",
        title: tr("mode.courseTitle"),
        copy: tr("mode.courseCopy"),
        meta: tr("mode.progress", { done: course.done || 0, total: course.total || 0 }),
        footer: course.done > 0 ? tr("mode.resume") : tr("mode.start"),
        state: course.done > 0 ? "is-started" : "",
      },
      {
        mode: "comprehensive",
        title: tr("mode.comprehensiveTitle"),
        copy: tr("mode.comprehensiveCopy"),
        meta: tr("mode.progress", { done: comprehensive.done || 0, total: comprehensive.total || 50 }),
        footer: comprehensive.done > 0 ? tr("mode.resume") : tr("mode.start"),
        badge: tr("mode.allFunctions"),
        state: comprehensive.done > 0 ? "is-started" : "",
      },
      {
        mode: "daily",
        title: tr("mode.dailyTitle"),
        copy: tr("mode.dailyCopy"),
        meta: daily.streak > 0 ? tr("mode.dailyStreak", { count: daily.streak }) : tr("mode.noDailyStreak"),
        footer: daily.todayDone ? tr("daily.done") : daily.resumed ? tr("mode.resume") : tr("mode.start"),
        badge: "",
        state: daily.todayDone ? "is-started is-done" : daily.resumed ? "is-started" : "",
      },
    ];
    return `<div class="mode-screen-inner">
      <header class="mode-select-header">
        <div class="mode-select-brand">
          <span class="mode-select-mark">${islandMarkSvg()}</span>
          <span class="mode-select-brand-copy"><strong>${escapeHtml(tr("app.brand"))}</strong><small>${escapeHtml(tr("app.tagline"))}</small></span>
        </div>
        <button class="icon-button settings-button" type="button" data-action="open-settings" aria-label="${escapeHtml(tr("nav.settings"))}"><span class="settings-gear" aria-hidden="true">${uiIcon("settings")}</span></button>
      </header>
      <main class="mode-select-main">
        <div class="mode-select-intro">
          <div class="mode-select-kicker">${escapeHtml(tr("mode.selectKicker"))}</div>
          <h1>${escapeHtml(tr("mode.selectTitle"))}</h1>
          <p>${escapeHtml(tr("mode.selectLead"))}</p>
        </div>
        <div class="mode-card-grid">
          ${cards.map((card) => `<button class="mode-card mode-card-${card.mode} ${card.state}" type="button" data-action="select-mode" data-mode="${card.mode}" aria-label="${escapeHtml(tr("mode.selectAria", { mode: card.title }))}">
            <span class="mode-card-top"><span class="mode-card-icon">${modeIconSvg(card.mode)}</span>${card.badge ? `<span class="mode-card-badge">${escapeHtml(card.badge)}</span>` : ""}</span>
            <strong class="mode-card-title">${escapeHtml(card.title)}</strong>
            <span class="mode-card-copy">${escapeHtml(card.copy)}</span>
            <span class="mode-card-foot"><span>${escapeHtml(card.meta)}</span><span class="mode-card-cta">${escapeHtml(card.footer)} <span aria-hidden="true">→</span></span></span>
          </button>`).join("")}
        </div>
        <p class="mode-select-note">${escapeHtml(tr("mode.selectNote"))}</p>
      </main>
    </div>`;
  }

  function renderMiniSheet(sheetOrKey, start, end, options) {
    const settings = Object.assign({ highlightRange: true, compact: false }, options || {});
    const sheet = resolveSheet(sheetOrKey);
    const bounds = sheetBounds(sheet, [start, end]);
    const rows = [];
    rows.push('<table class="mini-sheet' + (settings.compact ? " is-compact" : "") + '" role="table" aria-label="' + escapeHtml(tr('label.data')) + '"><thead><tr><th class="corner"></th>');
    for (let col = 1; col <= bounds.maxCol; col += 1) rows.push("<th>" + numberToCol(col) + "</th>");
    rows.push("</tr></thead><tbody>");
    for (let row = 1; row <= bounds.maxRow; row += 1) {
      rows.push('<tr><th class="row-number">' + row + "</th>");
      for (let col = 1; col <= bounds.maxCol; col += 1) {
        const ref = numberToCol(col) + row;
        const highlighted = settings.highlightRange && inRange(ref, start, end);
        rows.push('<td class="' + (highlighted ? "is-highlighted " : "") + (row === 1 ? "is-header-row " : "") + (col === 1 ? "is-label-col" : "") + '">' + escapeHtml(formatSheetValue(sheet[ref])) + "</td>");
      }
      rows.push("</tr>");
    }
    rows.push("</tbody></table>");
    return rows.join("");
  }

  function typeLabel(step) {
    return tr("type." + (step.type || "learn"));
  }

  function kindLabel(level) {
    return tr("kind." + ((level && level.kind) || "lesson"));
  }

  function fillKindLabel(kind) {
    return tr("fill.kind." + (kind || "value"));
  }

  function taskFunctionNames(task) {
    if (Array.isArray(task.requiredFunctions) && task.requiredFunctions.length) return task.requiredFunctions;
    if (task.requiredFunction) return [task.requiredFunction];
    return [];
  }

  function renderMissionBrief(step, task) {
    const functions = taskFunctionNames(task);
    const operationOnly = Boolean(task.operationOnly);
    const filterOperation = task.operation && task.operation.type === "filter";
    const functionText = operationOnly
      ? tr(filterOperation ? "task.filterShortcut" : "task.findShortcut")
      : functions.length ? functions.join(" · ") : tr("task.arithmetic");
    const functionLabel = operationOnly ? tr("task.operationMethod") : tr("task.functions");
    const positionLabel = operationOnly
      ? tr("task.operationPosition")
      : tr(task.targetRange && task.targetRange.indexOf(":") >= 0 ? "task.positionRange" : "task.position");
    const positionText = operationOnly
      ? (filterOperation
        ? tr("task.filterPosition", { column: task.operation.column })
        : tr("task.findPosition"))
      : (task.targetRange || task.target || "");
    const method = operationOnly
      ? tr(filterOperation ? "task.filterMethod" : "task.findMethod")
      : functions.length
        ? tr("task.methodFunctions", { functions: functionText })
        : tr("task.methodArithmetic");
    const rangeTask = Boolean(task.targetRange && task.targetRange.indexOf(":") >= 0);
    return `<section class="mission-brief" aria-label="${escapeHtml(tr("task.briefTitle"))}">
      <div class="mission-brief-head">
        <span class="mission-kicker">${escapeHtml(tr("task.briefTitle"))}</span>
        <span class="task-kind-pill">${escapeHtml(lt(task.taskLabel) || typeLabel(step))}</span>
      </div>
      <div class="mission-facts">
        <div><small>${escapeHtml(positionLabel)}</small><strong><code>${escapeHtml(positionText)}</code></strong></div>
        <div><small>${escapeHtml(functionLabel)}</small><strong>${escapeHtml(functionText)}</strong></div>
      </div>
      <p class="mission-method">${escapeHtml(method)}</p>
      ${rangeTask ? '<p class="mission-fill-tip">' + escapeHtml(tr("task.fillRangeTip")) + "</p>" : ""}
    </section>`;
  }

  function renderHeading(step, level, task) {
    const kindClass = level && level.kind === "exam" ? "boss" : level && level.kind === "review" ? "mint" : "";
    return `
      <div class="lesson-heading">
        <div class="eyebrow">
          ${escapeHtml(typeLabel(step))}
          <span class="difficulty-pill ${kindClass}">${escapeHtml(kindLabel(level))}</span>
          ${level && !level.hideNumber && level.number ? '<span class="level-number-pill">' + escapeHtml(tr("label.level")) + " " + level.number + "</span>" : ""}
        </div>
        <h1>${escapeHtml(lt((task && task.title) || step.title))}</h1>
        <p class="lead">${escapeHtml(lt((task && task.lead) || step.lead))}</p>
      </div>
    `;
  }

  function renderHint(step, state, task) {
    if (!state.hintVisible) return "";
    const hint = lt((task && task.hint) || step.hint || "");
    if (!hint) return "";
    return '<div class="hint-box"><span class="hint-bulb">' + uiIcon("hint") + '</span><div><strong>' +
      escapeHtml(tr("label.hint")) + "</strong><p>" + escapeHtml(hint) + "</p></div></div>";
  }

  function renderFeedback(step, state) {
    if (!state.feedback) return "";
    const correct = state.feedback.type === "correct";
    const button = correct
      ? '<button class="btn btn-primary btn-compact" type="button" data-action="next">' +
        escapeHtml(state.isLastStep ? tr("label.finishLevel") : tr("label.continue")) +
        ' <span aria-hidden="true">→</span></button>'
      : '<button class="btn btn-ghost btn-compact" type="button" data-action="dismiss-feedback">' +
        escapeHtml(tr("label.retry") || tr("label.continue")) + "</button>";
    return '<div class="feedback ' + (correct ? "is-correct" : "is-wrong") +
      '" role="status"><div class="feedback-badge">' + (correct ? "√" : "!") +
      '</div><div class="feedback-copy"><strong>' + escapeHtml(state.feedback.title) +
      "</strong><p>" + escapeHtml(state.feedback.body) + "</p></div>" + button + "</div>";
  }

  function renderActionBar(step, state) {
    if (state.feedback && state.feedback.type === "correct") return "";
    let action = "check-choice";
    let disabled = false;
    let label = tr("label.checkAnswer");
    if (step.type === "builder") {
      action = "check-builder";
      disabled = !(Array.isArray(state.fillValues) && state.fillValues.some((value) => String(value || "").trim()));
      label = tr("label.checkBuilder");
    } else if (step.type === "sheet") {
      action = "check-sheet";
      if (state.activeTask && state.activeTask.operationOnly) {
        label = tr("label.checkOperation");
      } else {
        disabled = !state.formulaInput.trim().startsWith("=");
        label = tr("label.checkAnswer");
      }
    } else if (step.type === "challenge") {
      action = "check-multi";
      disabled = state.multiSelected.size === 0;
      label = tr("label.checkSelection");
    } else if (step.type === "choice") {
      disabled = !state.selectedOption;
      label = tr("label.checkSelection");
    }
    return '<div class="action-bar"><button class="hint-button" type="button" data-action="show-hint"><span aria-hidden="true">' + uiIcon("hint") + "</span> " +
      escapeHtml(state.hintVisible ? tr("label.hideHint") : tr("label.hint")) +
      '</button><button class="btn btn-primary" type="button" data-action="' + action + '"' +
      (disabled ? " disabled" : "") + ">" + escapeHtml(label) +
      ' <span aria-hidden="true">→</span></button></div>';
  }

  function renderLearn(step, level, state) {
    const demo = step.demo || null;
    const demoPlayed = Boolean(demo && state.demoPlayed);
    const demoSheet = demo ? resolveSheet(demo.sheet) : null;
    const points = (step.points || [])
      .map((point, index) => '<div class="point-card"><span>' + String(index + 1).padStart(2, "0") + "</span><p>" + escapeHtml(lt(point)) + "</p></div>")
      .join("");
    const actions = demo
      ? '<button class="btn btn-primary btn-wide" type="button" data-action="' +
        (demoPlayed ? "advance-learn" : "play-demo") + '">' +
        escapeHtml(demoPlayed ? tr("label.ready") : tr("label.showExample")) +
        ' <span aria-hidden="true">' + (demoPlayed ? ">" : "\u00b7") + "</span></button>"
      : '<button class="btn btn-primary btn-wide" type="button" data-action="advance-learn">' +
        escapeHtml(tr("label.ready")) + ' <span aria-hidden="true">→</span></button>';
    return `
      <article class="lesson-card concept-card">
        ${renderHeading(step, level)}
        <div class="concept-grid">
          <div class="concept-copy">
            <div class="syntax-card is-example"><span class="syntax-label">${escapeHtml(tr("label.example"))}</span><code>${escapeHtml(lt(step.example) || "=SUM(A1:A5)")}</code></div>
            <div class="intel-label"><span class="key-dot" aria-hidden="true"></span>${escapeHtml(tr("label.keyPoints"))}</div>
            <div class="point-grid">${points}</div>
            ${step.tip ? '<div class="tip-row"><span class="tip-dot" aria-hidden="true"></span><p>' + escapeHtml(lt(step.tip)) + "</p></div>" : ""}
            <div class="concept-actions">${actions}</div>
          </div>
          <div class="concept-visual">
            ${demo ? `
              <div class="receipt-card ${demoPlayed ? "is-summed" : ""}">
                <div class="receipt-head"><span>${escapeHtml(demo.label ? lt(demo.label) : tr("label.data"))}</span><span class="receipt-tag">Excel</span></div>
                ${renderMiniSheet(demoSheet, demo.rangeStart, demo.rangeEnd, { highlightRange: demoPlayed, compact: true })}
                <div class="sum-display ${demoPlayed ? "is-on" : ""}"><span class="sum-symbol">Σ</span><div><small>${escapeHtml(tr("label.example"))}</small><strong>${demoPlayed ? escapeHtml(String(demo.expected)) : "?"}</strong></div></div>
                <div class="addition-line">${escapeHtml(demoPlayed ? lt(step.success || demo.label) : tr("label.demoHint"))}</div>
              </div>
            ` : ""}
            <div class="chapter-story">
              <div class="chapter-story-art">${chapterArtSvg(level && level.chapterNumber)}</div>
              <div class="speech">${escapeHtml(demo
                ? (demoPlayed ? lt(step.success || demo.label) : tr("label.demoHint"))
                : tr("label.lessonNudge"))}</div>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function orderedOptions(step, state) {
    const map = new Map((step.options || []).map((option) => [option.id, option]));
    const order = state.optionOrder && state.optionOrder.length
      ? state.optionOrder
      : (step.options || []).map((option) => option.id);
    return order.map((id) => map.get(id)).filter(Boolean);
  }

  function renderChoice(step, level, state) {
    const correct = state.feedback && state.feedback.type === "correct";
    const options = orderedOptions(step, state).map((option, index) => {
      const selected = state.selectedOption === option.id;
      let classes = "option-card";
      if (selected) classes += " is-selected";
      if (state.feedback && selected) classes += state.feedback.type === "correct" ? " is-correct" : " is-wrong";
      if (state.feedback && correct && option.correct) classes += " is-correct";
      return '<button class="' + classes + '" type="button" data-action="select-option" data-id="' +
        option.id + '"' + (correct ? " disabled" : "") + '><span class="option-index">' +
        numberToCol(index + 1) + '</span><code>' + escapeHtml(lt(option.text)) + "</code></button>";
    }).join("");
    return `<article class="lesson-card">
      ${renderHeading(step, level)}
      <div class="choice-stage"><div class="question-panel question-panel-wide"><div class="option-grid">${options}</div>${renderHint(step, state)}</div></div>
      ${renderFeedback(step, state)}${renderActionBar(step, state)}
    </article>`;
  }

  function renderBuilder(step, level, state) {
    const correct = state.feedback && state.feedback.type === "correct";
    const blanks = step.fillBlanks || [];
    const blankByToken = new Map(blanks.map((blank, index) => [blank.tokenIndex, { blank, index }]));
    const values = Array.isArray(state.fillValues) ? state.fillValues : [];
    const checks = Array.isArray(state.fillChecks) ? state.fillChecks : [];
    const liveFormula = (step.tokens || []).map((token, tokenIndex) => {
      const slot = blankByToken.get(tokenIndex);
      if (!slot) return lt(token.textByLanguage || token.text);
      return String(values[slot.index] || "").trim() || "___";
    }).join("") || "=";
    const parts = (step.tokens || []).map((token, tokenIndex) => {
      const slot = blankByToken.get(tokenIndex);
      const text = lt(token.textByLanguage || token.text);
      if (!slot) {
        return '<span class="fill-fixed ' + (token.tone || "punct") + '">' + escapeHtml(text) + "</span>";
      }
      const value = values[slot.index] || "";
      const kindLabel = fillKindLabel(slot.blank.kind);
      const stateClass = state.feedback
        ? (checks[slot.index] ? " is-correct" : " is-wrong")
        : "";
      const width = slot.blank.kind === "function" ? 9 : slot.blank.kind === "range" ? 11 : slot.blank.kind === "criteria" ? 10 : 7;
      return '<input class="fill-blank' + stateClass + '" type="text" spellcheck="false" autocomplete="off" autocapitalize="off" data-fill-index="' +
        slot.index + '" style="--fill-size:' + width + '" placeholder="' + escapeHtml(kindLabel) + '" value="' +
        escapeHtml(value) + '" aria-label="' + escapeHtml(tr("fill.blankAria", { index: slot.index + 1, kind: kindLabel })) +
        '" title="' + escapeHtml(kindLabel) + '"' + (correct ? " readonly" : "") + ">";
    }).join("");
    const functions = Array.isArray(step.requiredFunctions) && step.requiredFunctions.length
      ? step.requiredFunctions
      : [tr("task.arithmetic")];
    const functionChips = functions.map((name) => '<span class="fill-function-chip">' + escapeHtml(name) + "</span>").join("");
    const filled = values.filter((value) => String(value || "").trim()).length;
    return `<article class="lesson-card">
      ${renderHeading(step, level)}
      <div class="exercise-grid builder-grid">
        <div class="data-panel builder-brief">
          <div class="panel-label">${escapeHtml(tr("label.builderBrief"))}</div>
          <div class="fill-target-result"><span>${escapeHtml(tr("label.builderExpected"))}</span><strong>${escapeHtml(String(expectedFor(step)))}</strong></div>
          <div class="fill-live-preview" id="fillLivePreview" aria-live="polite">
            <div class="fill-live-head"><span>${escapeHtml(tr("builder.liveTitle"))}</span><strong class="fill-live-result" id="fillLiveResult">${escapeHtml(tr("builder.liveWaiting"))}</strong></div>
            <code class="fill-live-formula" id="fillLiveFormula">${escapeHtml(liveFormula)}</code>
            <small class="fill-live-references" id="fillLiveReferences">${escapeHtml(tr("builder.liveNoReferences"))}</small>
          </div>
          <div class="fill-function-row"><span>${escapeHtml(tr("task.functions"))}</span><div class="fill-function-chips">${functionChips}</div></div>
          <div class="builder-sheet-panel">
            <div class="panel-label">${escapeHtml(tr("builder.sheetTitle"))}</div>
            ${renderBuilderSheet(step, state)}
          </div>
          <div class="fill-guide-box"><strong>${escapeHtml(tr("label.fillGuideTitle"))}</strong><p>${escapeHtml(tr("label.fillGuide"))}</p></div>
        </div>
        <div class="question-panel">
          <div class="formula-tray ${state.feedback && state.feedback.type === "wrong" ? "is-wrong" : ""}">
            <div class="tray-head"><span>${escapeHtml(tr("label.formulaFill"))}</span><span class="fill-progress" id="fillProgress">${escapeHtml(tr("label.fillProgress", { done: filled, total: blanks.length }))}</span><button class="text-button" type="button" data-action="clear-builder" ${correct ? "disabled" : ""}>${escapeHtml(tr("label.clear"))}</button></div>
            <div class="fill-formula" role="group" aria-label="${escapeHtml(tr("label.formulaFill"))}">${parts}</div>
            <p class="fill-keyboard">${escapeHtml(tr("label.fillKeyboard"))}</p>
          </div>
          ${renderHint(step, state)}
        </div>
      </div>
      ${renderFeedback(step, state)}${renderActionBar(step, state)}
    </article>`;
  }

  function renderBuilderSheet(step, state) {
    const sheet = resolveSheet(step.sheet);
    if (!Object.keys(sheet).length) return "";
    const formula = lt(step.formulaExample || "");
    const refs = referencesInFormula(formula);
    const bounds = sheetBounds(sheet, []);
    const visibleCols = new Set([1]);
    const visibleRows = new Set([1]);
    refs.columns.forEach((col) => visibleCols.add(col));
    refs.rows.forEach((row) => visibleRows.add(row));

    if (!refs.columns.size) {
      for (let col = 1; col <= Math.min(bounds.maxCol, 5); col += 1) visibleCols.add(col);
    }
    if (!refs.rows.size) {
      for (let row = 1; row <= Math.min(bounds.maxRow, 7); row += 1) visibleRows.add(row);
    } else {
      const firstRefRow = Math.min(...refs.rows);
      if (firstRefRow > 2) visibleRows.add(firstRefRow - 1);
    }

    const maxVisibleCol = Math.max(bounds.maxCol, ...visibleCols);
    const maxVisibleRow = Math.max(bounds.maxRow, ...visibleRows);
    const cols = Array.from(visibleCols).filter((col) => col <= maxVisibleCol).sort((a, b) => a - b);
    const rows = Array.from(visibleRows).filter((row) => row <= maxVisibleRow).sort((a, b) => a - b);
    if (!cols.length || !rows.length) return "";
    const correct = state.feedback && state.feedback.type === "correct";
    const markup = ['<div class="builder-sheet-scroll"><table class="mini-sheet is-compact builder-sheet-table" role="table" aria-label="' +
      escapeHtml(tr("builder.sheetTitle")) + '"><thead><tr><th class="corner"></th>'];
    cols.forEach((col) => {
      markup.push('<th class="' + (refs.columns.has(col) ? "is-formula-col" : "") + '">' + numberToCol(col) + "</th>");
    });
    markup.push("</tr></thead><tbody>");
    rows.forEach((row) => {
      markup.push('<tr><th class="row-number">' + row + "</th>");
      cols.forEach((col) => {
        const ref = numberToCol(col) + row;
        const isSource = correct && refs.cells.has(ref);
        markup.push('<td class="' + (row === 1 ? "is-header-row " : "") + (col === 1 ? "is-label-col " : "") +
          (isSource ? "is-formula-source" : "") + '" data-builder-cell="' + ref + '" title="' + escapeHtml(ref) + '"><span class="cell-text">' +
          escapeHtml(formatSheetValue(sheet[ref])) + "</span></td>");
      });
      markup.push("</tr>");
    });
    markup.push("</tbody></table></div>");
    markup.push('<p class="builder-sheet-caption">' + escapeHtml(tr("builder.sheetHint")) + "</p>");
    return markup.join("");
  }

  function renderChallenge(step, level, state) {
    const correct = state.feedback && state.feedback.type === "correct";
    const options = orderedOptions(step, state).map((option) => {
      const selected = state.multiSelected.has(option.id);
      let classes = "multi-option";
      if (selected) classes += " is-selected";
      if (state.feedback && selected) classes += option.correct ? " is-correct" : " is-wrong";
      if (state.feedback && correct && option.correct) classes += " is-correct";
      return '<button class="' + classes + '" type="button" data-action="toggle-multi" data-id="' +
        option.id + '"' + (correct ? " disabled" : "") + '><span class="check-box">' +
        (selected ? "√" : "") + "</span><code>" + escapeHtml(lt(option.text)) + "</code></button>";
    }).join("");
    return `<article class="lesson-card">
      ${renderHeading(step, level)}
      <div class="choice-stage"><div class="question-panel question-panel-wide"><div class="multi-grid">${options}</div>${renderHint(step, state)}</div></div>
      ${renderFeedback(step, state)}${renderActionBar(step, state)}
    </article>`;
  }

  function renderFormulaMenu(step, state, task, readOnly) {
    const functions = (state.formulaFunctions || []).slice().sort((left, right) => {
      if (left.recommended === right.recommended) return 0;
      return left.recommended ? -1 : 1;
    });
    const recommended = task.requiredFunction || (task.requiredFunctions && task.requiredFunctions[0]) || "";
    const items = !state.formulaMenuOpen ? "" : functions.map((fn) => {
      const classes = ["formula-menu-item"];
      if (fn.recommended) classes.push("is-recommended");
      if (!fn.unlocked) classes.push("is-locked");
      return '<button class="' + classes.join(" ") + '" type="button" data-action="insert-function" data-name="' +
        escapeHtml(fn.name) + '"' + (!fn.unlocked || readOnly ? " disabled" : "") + '><span class="formula-menu-symbol">' +
        escapeHtml(fn.symbol || "ƒ") + '</span><span class="formula-menu-copy"><span class="formula-menu-title"><strong>' +
        escapeHtml(fn.name) + "</strong><em>" + escapeHtml(lt(fn.label)) + "</em></span><small>" +
        escapeHtml(lt(fn.description)) + "</small><code>" + escapeHtml(fn.signature) + '</code></span><span class="formula-menu-state">' +
        escapeHtml(fn.unlocked ? (fn.recommended ? tr("sheet.recommended") : tr("sheet.available")) : tr("sheet.laterUnlock")) +
        "</span></button>";
    }).join("");
    const unlockedCount = !state.formulaMenuOpen ? 0 : functions.filter((fn) => fn.unlocked).length;
    const menuMarkup = state.formulaMenuOpen
      ? '<div class="formula-menu" id="formulaMenu" role="listbox">' +
        '<div class="formula-menu-head"><strong>' + escapeHtml(tr("sheet.insertFunction")) + "</strong><small>" +
        escapeHtml(tr("sheet.unlockedCount", { unlocked: unlockedCount, total: functions.length })) + "</small></div>" +
        '<div class="formula-menu-list">' + items + '</div><div class="formula-menu-foot"><span>fx</span> ' +
        escapeHtml(recommended ? tr("sheet.menuFoot", { name: recommended }) : tr("sheet.menuFootGeneric")) +
        "</div></div>"
      : '<div class="formula-menu" id="formulaMenu" role="listbox" hidden></div>';
    return '<div class="fx-menu-wrap"><button class="fx-button" type="button" data-action="toggle-formula-menu" aria-haspopup="listbox" aria-expanded="' +
      (state.formulaMenuOpen ? "true" : "false") + '" aria-label="' + escapeHtml(tr("sheet.insertFunction")) + '"' +
      (readOnly ? " disabled" : "") + '><span class="fx-mark">fx</span><span class="fx-caret">⌄</span></button>' +
      menuMarkup + "</div>";
  }

  function renderSheetTable(step, task, state, sheet, preview) {
    const answerRange = answerRangeForTask(task);
    const bounds = sheetBounds(sheet, [answerRange ? answerRange.startRef : task.target, answerRange ? answerRange.endRef : task.target]);
    const answerHeaderRef = answerRange ? parseRef(answerRange.startRef) : parseRef(task.target);
    const correct = Boolean(state.feedback && state.feedback.type === "correct");
    const answerFormulas = state.sheetAnswerFormulas || {};
    const hiddenRows = Array.isArray(state.operation?.hiddenRows) ? state.operation.hiddenRows : [];
    const findMatches = Array.isArray(state.operation?.findMatches) ? state.operation.findMatches : [];
    const activeFindRef = state.operation?.activeFindRef || "";
    const filterOperation = task.operation && task.operation.type === "filter" ? task.operation : null;
    const filterMode = Boolean(filterOperation && state.operation?.filterMode);
    const filterColumns = filterMode
      ? (Array.isArray(state.operation?.filterColumns) && state.operation.filterColumns.length
        ? state.operation.filterColumns
        : [filterOperation.column]).map((column) => String(column).toUpperCase())
      : [];
    const filterColumnSet = new Set(filterColumns);
    const rows = [];
    rows.push('<div class="sheet-scroll"><table class="sheet-table" role="table" aria-label="' + escapeHtml(tr("label.data")) + '"><thead><tr><th class="corner" aria-hidden="true"></th>');
    for (let col = 1; col <= bounds.maxCol; col += 1) {
      const column = numberToCol(col);
      rows.push('<th class="sheet-col-header" data-select-col="' + col + '" tabindex="0" title="' +
        escapeHtml(tr("sheet.selectColumn", { column })) + '" aria-label="' +
        escapeHtml(tr("sheet.selectColumn", { column })) + '">' + column + "</th>");
    }
    rows.push("</tr></thead><tbody>");
    for (let row = 1; row <= bounds.maxRow; row += 1) {
      const rowHidden = row > 1 && hiddenRows.includes(row);
      rows.push('<tr' + (rowHidden ? ' class="is-filtered-out" hidden' : "") + '><th class="row-number sheet-row-header" data-select-row="' + row + '" tabindex="0" title="' +
        escapeHtml(tr("sheet.selectRow", { row })) + '" aria-label="' +
        escapeHtml(tr("sheet.selectRow", { row })) + '">' + row + "</th>");
      for (let col = 1; col <= bounds.maxCol; col += 1) {
        const ref = numberToCol(col) + row;
        const isTarget = Boolean(answerRange && inRange(ref, answerRange.startRef, answerRange.endRef));
        const isAnchor = ref === task.target;
        const isAnswerHeader = row === 1 && answerHeaderRef && col === answerHeaderRef.col && !sheet[ref];
        let display = isTarget ? "" : (isAnswerHeader ? lt(task.answerHeader || tr("task.answerHeader")) : formatSheetValue(sheet[ref]));
        let extraClass = "";
        if (isAnswerHeader) extraClass += " is-answer-header";
        if (isTarget) {
          const formula = isAnchor
            ? String(state.formulaInput || "").trim()
            : String(answerFormulas[ref] || "").trim();
          if (!formula) {
            extraClass += isAnchor ? " is-empty" : " is-pending-fill";
            display = isAnchor ? "" : "·";
          } else if (!formula.startsWith("=")) {
            display = "#VALUE!";
            extraClass += " has-error";
          } else {
            const cellPreview = Engine.evaluate(formula, sheet, {
              hiddenRows: Array.isArray(state.operation?.hiddenRows) ? state.operation.hiddenRows : [],
            });
            if (cellPreview.ok) {
              display = cellPreview.display;
              extraClass += " has-preview";
            } else {
              display = cellPreview.error;
              extraClass += " has-error";
            }
          }
          if (isAnchor) extraClass += " is-answer-anchor";
          if (answerRange && answerRange.isMulti) extraClass += " is-range-target";
          if (correct) extraClass += " is-correct";
        }
        const isHinted = state.hintVisible && Array.isArray(task.sourceRefs) && task.sourceRefs.includes(ref);
        const isFindMatch = findMatches.includes(ref);
        const isActiveFind = ref === activeFindRef;
        const columnName = numberToCol(col);
        const isFilterHeader = row === 1 && filterColumnSet.has(columnName);
        const filterActive = Boolean(isFilterHeader && state.operation?.filters?.[columnName]?.length);
        const filterOpen = Boolean(isFilterHeader && filterMode && state.operation?.filterOpen &&
          String(state.operation.filterOpenColumn || "").toUpperCase() === columnName);
        const cellTitle = isTarget ? tr("label.targetCell", { target: ref }) : tr("sheet.clickCell", { cell: ref });
        const handle = isTarget && isAnchor && answerRange && answerRange.isMulti && !correct
          ? '<span class="auto-fill-handle" role="button" tabindex="0" data-auto-fill-handle="true" title="' +
            escapeHtml(tr("sheet.fillHandleTitle")) + '" aria-label="' + escapeHtml(tr("sheet.fillHandleTitle")) + '"></span>'
          : "";
        const filterButton = isFilterHeader
          ? '<button class="excel-filter-button' + (filterActive ? " is-active" : "") +
            '" type="button" data-action="open-excel-filter" data-column="' + escapeHtml(columnName) +
            '" aria-expanded="' + (filterOpen ? "true" : "false") +
            '" aria-label="' + escapeHtml(tr("operation.filterButton", { column: columnName })) + '" title="' +
            escapeHtml(tr("operation.filterButton", { column: columnName })) + '">' +
            '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M1.8 2.5h12.4L9.4 8.3v3.5L6.6 13V8.3z"></path></svg></button>'
          : "";
        rows.push('<td class="' + (row === 1 ? "is-header-row " : "") + (col === 1 ? "is-label-col " : "") +
          (isTarget ? "is-target " : "") + (isHinted ? "is-hinted " : "") +
          (isFindMatch ? "is-find-match " : "") + (isActiveFind ? "is-find-active " : "") +
          (isFilterHeader ? "has-excel-filter " : "") + extraClass + '"' +
          (isTarget ? ' data-sheet-cell="' + ref + '"' : ' data-cell="' + ref + '"') +
          ' title="' + escapeHtml(cellTitle) + '"><span class="cell-text">' + escapeHtml(display) + "</span>" + filterButton + handle + "</td>");
      }
      rows.push("</tr>");
    }
    rows.push("</tbody></table></div>");
    return rows.join("");
  }

  function renderOperationTools(task, state, sheet) {
    const operation = task.operation;
    if (!window.SheetOperations) return "";
    if (!operation) {
      const findMenuOpen = Boolean(state.operation && state.operation.toolMenu === "find");
      return `<div class="sheet-data-tools">
        <div class="data-tool-group">
          <button class="data-tool-button${findMenuOpen ? " is-open" : ""}" type="button" data-action="toggle-data-tool-menu" data-menu="find" aria-expanded="${findMenuOpen ? "true" : "false"}">
            <span class="data-tool-icon find-tool-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="6.2"></circle><path d="M14.4 14.4 21 21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg></span>
            <span class="data-tool-label">${escapeHtml(tr("operation.findSelectTool"))}</span>
            <span class="data-tool-caret" aria-hidden="true">\u2304</span>
          </button>
          ${findMenuOpen ? `<div class="data-tool-menu find-select-menu" role="menu">
            <button type="button" role="menuitem" data-action="open-excel-find"><span class="menu-glyph">\u2315</span>${escapeHtml(tr("operation.findEllipsis"))}</button>
            <button type="button" role="menuitem" data-action="open-excel-replace"><span class="menu-glyph">ab</span>${escapeHtml(tr("operation.replaceEllipsis"))}</button>
            <button type="button" role="menuitem" data-action="open-go-to"><span class="menu-glyph">\u2192</span>${escapeHtml(tr("operation.goToEllipsis"))}</button>
            <button type="button" role="menuitem" data-action="open-go-to-special"><span class="menu-glyph">\u2316</span>${escapeHtml(tr("operation.goToSpecial"))}</button>
          </div>` : ""}
        </div>
      </div>`;
    }
    const filterEnabled = operation.type === "filter";
    const findEnabled = true;
    const filterActive = Boolean(state.operation && state.operation.filterMode);
    const filterApplied = Boolean(state.operation && state.operation.filters &&
      Object.keys(state.operation.filters).length);
    const sortOpen = state.operation && state.operation.toolMenu === "sort";
    const findMenuOpen = state.operation && state.operation.toolMenu === "find";
    return `<div class="sheet-data-tools">
      <div class="data-tool-group">
        <button class="data-tool-button${sortOpen ? " is-open" : ""}${filterActive ? " is-active" : ""}" type="button" data-action="toggle-data-tool-menu" data-menu="sort" aria-expanded="${sortOpen ? "true" : "false"}">
          <span class="data-tool-icon sort-filter-icon" aria-hidden="true"><span class="sort-az"><b>A</b><b>Z</b></span><svg viewBox="0 0 16 16"><path d="M1.8 2.5h12.4L9.4 8.3v3.5L6.6 13V8.3z"></path></svg></span>
          <span class="data-tool-label">${escapeHtml(tr("operation.sortFilterTool"))}</span>
          <span class="data-tool-caret" aria-hidden="true">\u2304</span>
        </button>
        ${sortOpen ? `<div class="data-tool-menu" role="menu">
          <button type="button" role="menuitem" data-action="sort-ascending"><span class="menu-glyph">A\u2193</span>${escapeHtml(tr("operation.sortAscending"))}</button>
          <button type="button" role="menuitem" data-action="sort-descending"><span class="menu-glyph">Z\u2193</span>${escapeHtml(tr("operation.sortDescending"))}</button>
          <button type="button" role="menuitem" data-action="open-sort-dialog"><span class="menu-glyph">\u2195</span>${escapeHtml(tr("operation.customSort"))}</button>
          <div class="tool-menu-separator"></div>
          <button type="button" role="menuitem" data-action="toggle-filter-mode"${filterEnabled ? "" : " disabled"}><span class="menu-glyph funnel">\u25be</span>${escapeHtml(tr("operation.filterMenu"))}</button>
          <button type="button" role="menuitem" data-action="clear-operation-filter"${filterApplied ? "" : " disabled"}><span class="menu-glyph">\u2298</span>${escapeHtml(tr("operation.clearFilter"))}</button>
          <button type="button" role="menuitem" data-action="reapply-operation-filter"${filterApplied ? "" : " disabled"}><span class="menu-glyph">\u21bb</span>${escapeHtml(tr("operation.reapplyFilter"))}</button>
          ${state.operation.sortDialogOpen ? (() => {
            const range = window.SheetOperations.parseRange(operation.range);
            if (!range) return "";
            const options = [];
            for (let col = range.left; col <= range.right; col += 1) {
              const header = sheet[numberToCol(col) + "1"];
              options.push(`<option value="${col}"${String(col) === String(state.operation.sortColumn) ? " selected" : ""}>${escapeHtml(lt(header) || numberToCol(col))}</option>`);
            }
            return `<div class="inline-sort-panel">
              <label><span>${escapeHtml(tr("find.sortBy"))}</span><select data-sort-column>${options.join("")}</select></label>
              <label><span>${escapeHtml(tr("find.sortOrder"))}</span><select data-sort-direction><option value="asc">${escapeHtml(tr("operation.sortAscending"))}</option><option value="desc">${escapeHtml(tr("operation.sortDescending"))}</option></select></label>
              <div class="inline-sort-actions">
                <button type="button" data-action="close-sort-dialog">${escapeHtml(tr("operation.cancel"))}</button>
                <button type="button" data-action="apply-custom-sort">${escapeHtml(tr("find.applySort"))}</button>
              </div>
            </div>`;
          })() : ""}
        </div>` : ""}
      </div>
      <div class="data-tool-group">
        <button class="data-tool-button${findMenuOpen ? " is-open" : ""}" type="button" data-action="toggle-data-tool-menu" data-menu="find" aria-expanded="${findMenuOpen ? "true" : "false"}">
          <span class="data-tool-icon find-tool-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="6.2"></circle><path d="M14.4 14.4 21 21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg></span>
          <span class="data-tool-label">${escapeHtml(tr("operation.findSelectTool"))}</span>
          <span class="data-tool-caret" aria-hidden="true">\u2304</span>
        </button>
        ${findMenuOpen ? `<div class="data-tool-menu find-select-menu" role="menu">
          <button type="button" role="menuitem" data-action="open-excel-find"${findEnabled ? "" : " disabled"}><span class="menu-glyph">\u2315</span>${escapeHtml(tr("operation.findEllipsis"))}</button>
          <button type="button" role="menuitem" data-action="open-excel-replace"${findEnabled ? "" : " disabled"}><span class="menu-glyph">ab</span>${escapeHtml(tr("operation.replaceEllipsis"))}</button>
          <button type="button" role="menuitem" data-action="open-go-to"><span class="menu-glyph">\u2192</span>${escapeHtml(tr("operation.goToEllipsis"))}</button>
          <button type="button" role="menuitem" data-action="open-go-to-special"><span class="menu-glyph">\u2316</span>${escapeHtml(tr("operation.goToSpecial"))}</button>
          <div class="tool-menu-separator"></div>
          <button type="button" role="menuitem" disabled><span class="menu-glyph">fx</span>${escapeHtml(tr("operation.formulaCells"))}</button>
          <button type="button" role="menuitem" disabled><span class="menu-glyph">\u25a1</span>${escapeHtml(tr("operation.comments"))}</button>
          <button type="button" role="menuitem" disabled><span class="menu-glyph">\u25a6</span>${escapeHtml(tr("operation.conditionalFormatting"))}</button>
          <button type="button" role="menuitem" disabled><span class="menu-glyph">#</span>${escapeHtml(tr("operation.constants"))}</button>
          <button type="button" role="menuitem" disabled><span class="menu-glyph">OK</span>${escapeHtml(tr("operation.dataValidation"))}</button>
          <div class="tool-menu-separator"></div>
          <button type="button" role="menuitem" disabled><span class="menu-glyph">\u2196</span>${escapeHtml(tr("operation.selectObjects"))}</button>
          <button type="button" role="menuitem" disabled><span class="menu-glyph">\u25a3</span>${escapeHtml(tr("operation.selectionPane"))}</button>
        </div>` : ""}
      </div>
    </div>`;
  }

  function findRangeForTask(task, sheet) {
    if (task.operation && task.operation.range) return task.operation.range;
    const bounds = sheetBounds(sheet || task.sheetData || {}, []);
    return "A1:" + numberToCol(Math.max(1, bounds.maxCol || 1)) + Math.max(1, bounds.maxRow || 1);
  }

  function renderExcelFindPopover(task, state, sheet) {
    if (!state.operation || !state.operation.findOpen) return "";
    const query = state.operation?.findQuery || "";
    const matches = Array.isArray(state.operation?.findMatches) ? state.operation.findMatches : [];
    const active = state.operation?.activeFindRef || "";
    const replaceMode = state.operation?.findMode === "replace";
    const optionsOpen = state.operation?.findOptionsOpen !== false;
    const range = findRangeForTask(task, sheet);
    return `<div class="excel-find-popover classic-find" id="excelFindPopover" role="dialog" aria-modal="false" aria-label="${escapeHtml(tr("find.dialogTitle"))}">
      <div class="classic-titlebar">
        <span>${escapeHtml(tr("find.dialogTitle"))}</span>
        <button class="classic-close-button" type="button" data-action="close-excel-find" aria-label="${escapeHtml(tr("find.close"))}">\u00d7</button>
      </div>
      <div class="classic-tabs" role="tablist">
        <button class="${replaceMode ? "" : "is-active"}" type="button" role="tab" aria-selected="${replaceMode ? "false" : "true"}" data-action="set-find-mode" data-mode="find">${escapeHtml(tr("find.tabFind"))}</button>
        <button class="${replaceMode ? "is-active" : ""}" type="button" role="tab" aria-selected="${replaceMode ? "true" : "false"}" data-action="set-find-mode" data-mode="replace">${escapeHtml(tr("find.tabReplace"))}</button>
      </div>
      <div class="classic-find-body">
        <div class="classic-form-row">
          <label class="classic-field-label" for="excelFindWhat">${escapeHtml(tr("find.findWhat"))}</label>
          <div class="classic-combo"><input id="excelFindWhat" data-operation-find-input type="text" value="${escapeHtml(query)}" autocomplete="off" /><span class="classic-combo-arrow" aria-hidden="true"></span></div>
          <button class="classic-flat-button" type="button" disabled>${escapeHtml(tr("find.noFormat"))}</button>
          <button class="classic-flat-button has-caret" type="button" disabled>${escapeHtml(tr("find.format"))}<span class="classic-mini-caret" aria-hidden="true"></span></button>
        </div>
        ${replaceMode ? `<div class="classic-form-row">
          <label class="classic-field-label" for="excelReplaceWith">${escapeHtml(tr("find.replaceWith"))}</label>
          <div class="classic-combo"><input id="excelReplaceWith" data-find-replacement type="text" value="${escapeHtml(state.operation.findReplacement || "")}" autocomplete="off" /><span class="classic-combo-arrow" aria-hidden="true"></span></div>
          <button class="classic-flat-button" type="button" disabled>${escapeHtml(tr("find.noFormat"))}</button>
          <button class="classic-flat-button has-caret" type="button" disabled>${escapeHtml(tr("find.format"))}<span class="classic-mini-caret" aria-hidden="true"></span></button>
        </div>` : ""}
        <div class="classic-options ${optionsOpen ? "" : "is-collapsed"}">
          <div class="classic-options-left">
            <label class="classic-option-row"><span>${escapeHtml(tr("find.scope"))}</span><select data-find-scope><option>${escapeHtml(tr("find.scopeSheet"))}</option></select></label>
            <label class="classic-option-row"><span>${escapeHtml(tr("find.searchBy"))}</span><select data-find-search-by><option value="row"${state.operation.findSearchBy === "column" ? "" : " selected"}>${escapeHtml(tr("find.searchRows"))}</option><option value="column"${state.operation.findSearchBy === "column" ? " selected" : ""}>${escapeHtml(tr("find.searchColumns"))}</option></select></label>
            <label class="classic-option-row"><span>${escapeHtml(tr("find.lookIn"))}</span><select data-find-look-in><option value="values"${state.operation.findLookIn === "formulas" ? "" : " selected"}>${escapeHtml(tr("find.lookValues"))}</option><option value="formulas"${state.operation.findLookIn === "formulas" ? " selected" : ""}>${escapeHtml(tr("find.lookFormulas"))}</option></select></label>
          </div>
          <div class="classic-checkboxes">
            <label><input type="checkbox" data-find-match-case${state.operation.findMatchCase ? " checked" : ""} />${escapeHtml(tr("find.matchCaseOption"))}</label>
            <label><input type="checkbox" data-find-match-cell${state.operation.findEntireCell ? " checked" : ""} />${escapeHtml(tr("find.matchCellOption"))}</label>
            <label><input type="checkbox" data-find-width${state.operation.findDistinguishWidth ? " checked" : ""} />${escapeHtml(tr("find.widthOption"))}</label>
          </div>
        </div>
        <div class="classic-options-toggle">
          <button type="button" data-action="toggle-find-options">${escapeHtml(tr(optionsOpen ? "find.options" : "find.optionsClosed"))}</button>
        </div>
        <div class="classic-find-feedback">
          <span>${escapeHtml(active ? tr("operation.findPosition", { active, total: matches.length }) : tr("operation.findCount", { n: matches.length }))}</span>
          <small>${escapeHtml(tr("find.range", { range }))} \u00b7 ${escapeHtml(tr("find.wildcardHint"))}</small>
        </div>
      </div>
      <div class="classic-footer">
        ${replaceMode ? `<button type="button" data-action="replace-all">${escapeHtml(tr("find.replaceAllButton"))}</button>
          <button type="button" data-action="replace-current">${escapeHtml(tr("find.replaceButton"))}</button>` : ""}
        <button type="button" data-action="find-all">${escapeHtml(tr("find.findAllButton"))}</button>
        <button class="is-default" type="button" data-action="find-next">${escapeHtml(tr("find.nextButton"))}</button>
        <button type="button" data-action="close-excel-find">${escapeHtml(tr("find.closeButton"))}</button>
      </div>
    </div>`;
  }

  function renderGoToPopover(state) {
    if (!state.operation?.gotoDialogOpen) return "";
    return `<div class="excel-utility-popover" id="excelGoToPopover" role="dialog" aria-modal="false">
      <div class="excel-find-head"><strong>${escapeHtml(tr("find.goToTitle"))}</strong><button class="excel-filter-close" type="button" data-action="close-go-to" aria-label="${escapeHtml(tr("find.close"))}">\u00d7</button></div>
      <div class="excel-find-body">
        <label class="excel-find-field"><span>${escapeHtml(tr("find.reference"))}</span><input data-goto-ref type="text" placeholder="A1" autocomplete="off" /></label>
        <div class="excel-find-actions">
          <button class="btn btn-ghost btn-compact" type="button" data-action="close-go-to">${escapeHtml(tr("operation.cancel"))}</button>
          <button class="btn btn-primary btn-compact" type="button" data-action="apply-go-to">${escapeHtml(tr("find.go"))}</button>
        </div>
      </div>
    </div>`;
  }

  function renderExcelFilterPopover(task, state, sheet) {
    const operation = task.operation;
    if (!operation || operation.type !== "filter" || !state.operation?.filterMode ||
        !state.operation?.filterOpen || !window.SheetOperations) return "";
    const column = String(state.operation.filterOpenColumn || operation.column).toUpperCase();
    const spec = Object.assign({}, operation, { column });
    const values = window.SheetOperations.uniqueValues(sheet, spec);
    const applied = state.operation.filters && state.operation.filters[column];
    const selected = Array.isArray(applied) && applied.length
      ? applied
      : Array.isArray(state.operation.selectedValues) && state.operation.selectedValues.length
        ? state.operation.selectedValues
        : values;
    const selectedSet = new Set(selected);
    const allSelected = values.length > 0 && values.every((value) => selectedSet.has(value));
    return `<div class="excel-filter-popover" id="excelFilterPopover" role="dialog" aria-modal="false" aria-label="${escapeHtml(tr("operation.filterTitle", { column }))}">
      <div class="excel-filter-head">
        <strong>${escapeHtml(tr("operation.filterTitle", { column }))}</strong>
        <button class="excel-filter-close" type="button" data-action="cancel-excel-filter" aria-label="${escapeHtml(tr("operation.cancel"))}">\u00d7</button>
      </div>
      <label class="excel-filter-search">
        <span aria-hidden="true">\u2315</span>
        <input type="search" data-excel-filter-search autocomplete="off" placeholder="${escapeHtml(tr("operation.searchValues"))}" aria-label="${escapeHtml(tr("operation.searchValues"))}" />
      </label>
      <label class="excel-filter-all">
        <input type="checkbox" data-excel-filter-all${allSelected ? " checked" : ""} />
        <span>${escapeHtml(tr("operation.allValues"))}</span>
      </label>
      <div class="excel-filter-values">
        ${values.map((value) => {
          const blank = window.SheetOperations.isBlankFilterValue(value);
          const label = blank ? tr("operation.blankValue") : value;
          const optionValue = blank ? "__excel_blank__" : value;
          return `<label class="excel-filter-option" data-excel-filter-option-row data-value="${escapeHtml(label)}">
            <input type="checkbox" data-excel-filter-option value="${escapeHtml(optionValue)}" data-filter-blank="${blank ? "true" : "false"}"${selectedSet.has(value) ? " checked" : ""} />
            <span>${escapeHtml(label)}</span>
          </label>`;
        }).join("")}
      </div>
      <div class="excel-filter-footer">
        <button class="text-button" type="button" data-action="clear-excel-filter" data-column="${escapeHtml(column)}">${escapeHtml(tr("operation.clearFilter"))}</button>
        <div>
          <button class="btn btn-ghost btn-compact" type="button" data-action="cancel-excel-filter">${escapeHtml(tr("operation.cancel"))}</button>
          <button class="btn btn-primary btn-compact" type="button" data-action="apply-excel-filter">${escapeHtml(tr("operation.applyFilter"))}</button>
        </div>
      </div>
    </div>`;
  }

  function renderFilterStatus(state) {
    const hidden = Array.isArray(state.operation?.hiddenRows) ? state.operation.hiddenRows.length : 0;
    if (!hidden) return "";
    return `<div class="excel-filter-status"><span class="result-dot"></span>${escapeHtml(tr("operation.hiddenRows", { n: hidden }))}</div>`;
  }

  function renderSheet(step, level, state) {
    const task = state.activeTask || {};
    const sheet = task.sheetData || resolveSheet(task.sheet || step.sheet);
    const operationOnly = Boolean(task.operationOnly);
    const target = task.target || "A1";
    const targetLabel = task.targetRange || target;
    const answerRange = answerRangeForTask(task);
    const example = task.formulaExample || "=SUM(A1:A5)";
    const exampleText = lt(example);
    const pickedValue = state.pickedValue == null ? "" : String(state.pickedValue);
    const trimmed = pickedValue ? pickedValue : state.formulaInput.trim();
    const isFormula = trimmed.startsWith("=");
    const operationOptions = { hiddenRows: state.operation?.hiddenRows || [] };
    const preview = trimmed && isFormula ? Engine.evaluate(trimmed, sheet, operationOptions) : null;
    const resultClass = pickedValue ? "" : !trimmed ? "" : !isFormula ? "is-error" : preview.ok ? "is-ok" : "is-error";
    const resultText = pickedValue ? tr("sheet.cellPicked", { cell: state.pickedCellRef || "" }) : !trimmed ? tr("sheet.waiting") : !isFormula ? tr("sheet.needEquals") :
      preview.ok ? tr("sheet.liveResult", { value: preview.display }) : tr("sheet.formulaError", { error: preview.error });
    const correct = state.feedback && state.feedback.type === "correct";
    const discontinuous = Array.isArray(task.sourceRefs) && task.mode === "points";
    const footnoteKey = answerRange && answerRange.isMulti
      ? "sheet.footnoteFill"
      : discontinuous ? "sheet.footnoteDiscontinuous" : "sheet.footnoteContinuous";
    const fillRangeButton = answerRange && answerRange.isMulti && !correct
      ? `<button class="btn btn-ghost btn-compact fill-range-button" type="button" data-action="fill-answer-range">${escapeHtml(tr("sheet.fillRangeButton"))}</button>`
      : "";
    return `<article class="lesson-card sheet-card">
      ${renderHeading(step, level, task)}
      ${renderMissionBrief(step, task)}
      <div class="sheet-frame">
        <div class="sheet-toolbar">
          <div class="cell-name${!operationOnly && targetLabel.length > 6 ? " is-range" : ""}">${escapeHtml(operationOnly ? tr("operation.cellName") : targetLabel)}</div>
          <div class="selection-chip" id="selectionChip" hidden></div>
          ${operationOnly ? "" : `<div class="fx-bar">${renderFormulaMenu(step, state, task, correct)}
            <input id="formulaInput" class="formula-input" type="text" spellcheck="false" autocomplete="off" autocapitalize="off" placeholder="${escapeHtml(exampleText)}" value="${escapeHtml(pickedValue ? pickedValue : state.formulaInput)}"${correct ? " readonly" : ""} aria-label="${escapeHtml(tr("label.targetCell", { target }))}" />
          </div>`}
          ${operationOnly ? `<div class="formula-result operation-preview"><span class="result-dot"></span><span>${escapeHtml(tr("operation.ready"))}</span></div>` : `<div class="formula-result ${resultClass}" id="sheetPreview"><span class="result-dot"></span><span id="sheetPreviewText">${escapeHtml(resultText)}</span></div>`}
          ${fillRangeButton}
        </div>
        ${renderOperationTools(task, state, sheet)}
        ${renderSheetTable(step, task, state, sheet, preview)}
        ${renderExcelFilterPopover(task, state, sheet)}
        ${renderExcelFindPopover(task, state, sheet)}
        ${renderGoToPopover(state)}
        ${renderFilterStatus(state)}
        <div class="sheet-footnote"><span class="footnote-dot" aria-hidden="true"></span> ${escapeHtml(tr(footnoteKey))}</div>
      </div>
      ${task.auditNote ? `<p class="sheet-audit-note">${escapeHtml(lt(task.auditNote))}</p>` : ""}
      ${renderHint(step, state, task)}${renderFeedback(step, state)}${renderActionBar(step, state)}
    </article>`;
  }

  function renderStep(step, level, state) {
    if (step.type === "learn" || step.type === "concept") return renderLearn(step, level, state);
    if (step.type === "choice") return renderChoice(step, level, state);
    if (step.type === "challenge") return renderChallenge(step, level, state);
    if (step.type === "builder") return renderBuilder(step, level, state);
    if (step.type === "sheet") return renderSheet(step, level, state);
    if (step.type === "lab" && window.ExcelLab) return window.ExcelLab.renderStep(step, level, state);
    return "";
  }

  function renderSettings(settings, options) {
    const config = Object.assign({ showUnlock: true, showReset: true, resetLabel: "", version: "" }, options || {});
    const languageOptions = Object.entries(window.I18N.LANGUAGES).map(([code, name]) =>
      '<button class="language-option ' + (settings.language === code ? "is-selected" : "") +
      '" type="button" data-action="set-language" data-language="' + code + '" aria-pressed="' +
      (settings.language === code ? "true" : "false") + '"><span>' + escapeHtml(name) + '</span><span class="language-check">' +
      (settings.language === code ? "√" : "") + "</span></button>"
    ).join("");
    return `<div class="settings-card" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">
      <div class="settings-head"><div><div class="eyebrow">${escapeHtml(tr("app.tagline"))}</div><h2 id="settingsTitle">${escapeHtml(tr("settings.title"))}</h2><p>${escapeHtml(tr("settings.subtitle"))}</p>${config.version ? '<small class="settings-version">EXCEL-land · v' + escapeHtml(config.version) + "</small>" : ""}</div><button class="icon-button settings-close" type="button" data-action="close-settings" aria-label="${escapeHtml(tr("settings.close"))}">×</button></div>
      <div class="settings-body">
        <section class="settings-section">
          <div class="settings-section-copy"><span class="settings-icon">${uiIcon("sound")}</span><div><h3>${escapeHtml(tr("settings.soundTitle"))}</h3><p>${escapeHtml(tr("settings.soundCopy"))}</p></div></div>
          <button class="settings-switch ${settings.soundEnabled ? "is-on" : ""}" type="button" role="switch" aria-checked="${settings.soundEnabled ? "true" : "false"}" data-action="toggle-sound"><span class="switch-knob"></span><span class="switch-label">${escapeHtml(settings.soundEnabled ? tr("settings.soundOn") : tr("settings.soundOff"))}</span></button>
        </section>
        <section class="settings-section settings-section-stack">
          <div class="settings-section-copy"><span class="settings-icon">${uiIcon("language")}</span><div><h3>${escapeHtml(tr("settings.languageTitle"))}</h3><p>${escapeHtml(tr("settings.languageCopy"))}</p></div></div>
          <div class="language-grid">${languageOptions}</div>
        </section>
        <section class="settings-section settings-section-backup">
          <div class="settings-section-copy"><span class="settings-icon">${uiIcon("backup")}</span><div><h3>${escapeHtml(tr("settings.backupTitle"))}</h3><p>${escapeHtml(tr("settings.backupCopy"))}</p></div></div>
          <div class="settings-backup-actions">
            <button class="btn btn-primary btn-compact" type="button" data-action="export-progress">${escapeHtml(tr("settings.exportButton"))}</button>
            <button class="btn btn-ghost btn-compact" type="button" data-action="import-progress">${escapeHtml(tr("settings.importButton"))}</button>
          </div>
          <input id="progressImportInput" type="file" accept=".json,application/json" hidden />
        </section>
        ${config.showUnlock ? `<section class="settings-section">
          <div class="settings-section-copy"><span class="settings-icon">${uiIcon("unlock")}</span><div><h3>${escapeHtml(tr("settings.unlockTitle"))}</h3><p>${escapeHtml(tr("settings.unlockCopy"))}</p></div></div>
          <button class="settings-switch ${settings.unlockAll ? "is-on" : ""}" type="button" role="switch" aria-checked="${settings.unlockAll ? "true" : "false"}" data-action="toggle-unlock-all"><span class="switch-knob"></span><span class="switch-label">${escapeHtml(settings.unlockAll ? tr("settings.unlockOn") : tr("settings.unlockOff"))}</span></button>
        </section>` : ""}
        ${config.showReset ? `<section class="settings-section settings-section-danger">
          <div class="settings-section-copy"><span class="settings-icon">${uiIcon("reset")}</span><div><h3>${escapeHtml(tr("settings.resetTitle"))}</h3><p>${escapeHtml(tr("settings.resetCopy"))}</p></div></div>
          <button class="btn btn-ghost btn-compact settings-reset" type="button" data-action="reset-progress">${escapeHtml(config.resetLabel || tr("settings.resetButton"))}</button>
        </section>` : ""}
      </div>
    </div>`;
  }

  function renderCompletion(options) {
    const data = options || {};
    const courseComplete = Boolean(data.courseComplete);
    const level = data.level || {};
    const isPractice = level.kind === "practice";
    const practiceMode = data.mode || (String(level.id || "").indexOf("daily-") === 0 ? "daily" : "comprehensive");
    const next = data.nextLevel;
    const eyebrow = isPractice
      ? tr(practiceMode === "daily" ? "completion.dailyEyebrow" : "completion.trainingEyebrow")
      : courseComplete ? tr("completion.courseEyebrow") : tr("completion.levelEyebrow");
    const title = isPractice
      ? tr(practiceMode === "daily" ? "completion.dailyTitle" : "completion.trainingTitle")
      : courseComplete ? tr("completion.courseTitle") : tr("completion.levelTitle");
    const lead = isPractice
      ? tr(practiceMode === "daily" ? "completion.dailyLead" : "completion.trainingLead")
      : courseComplete
        ? tr("completion.courseLead", { levels: data.totalLevels })
        : tr("completion.levelLead");
    const nextMarkup = next && !courseComplete
      ? '<button class="completion-next" type="button" data-action="next-level"><span><small>' + escapeHtml(tr("label.nextLevel")) + "</small><strong>" +
        escapeHtml(lt(next.title)) + '</strong></span><span class="completion-next-arrow">→</span></button>'
      : "";
    return `<div class="completion-card${isPractice ? " is-practice" : ""}">
      ${isPractice ? "" : `<div class="completion-art">${chapterArtSvg(level.chapterNumber)}</div>`}
      <div class="eyebrow">${escapeHtml(eyebrow)}</div>
      <h2>${escapeHtml(title)}</h2>
      <p class="completion-lead">${escapeHtml(lead)}</p>
      <div class="completion-rewards">
        <div class="reward-item"><span>${uiIcon("accuracy")}</span><strong>${escapeHtml(String(data.accuracy == null ? 100 : data.accuracy))}%</strong><small>${escapeHtml(tr("label.accuracy"))}</small></div>
        <div class="reward-item"><span>${uiIcon("flag")}</span><strong>${escapeHtml(String(data.completedLevels || 0))}/${escapeHtml(String(data.totalLevels || 0))}</strong><small>${escapeHtml(tr(isPractice ? "completion.groups" : "completion.levels"))}</small></div>
      </div>
      ${nextMarkup}
      <div class="completion-actions">
        <button class="btn btn-ghost" type="button" data-action="close-completion">${escapeHtml(tr("label.backToMap"))}</button>
        ${courseComplete && !isPractice ? '<button class="btn btn-primary" type="button" data-action="replay-course">' + escapeHtml(tr("completion.restart")) + "</button>" : ""}
      </div>
    </div>`;
  }

  window.Views = {
    escapeHtml,
    formatSheetValue,
    inRange,
    rangeReference,
    resolveSheet,
    sheetBounds,
    chapterArtSvg,
    renderMiniSheet,
    renderStep,
    answerRangeForTask,
    renderSettings,
    renderCompletion,
    renderModeSelector,
  };
})();
