(function () {
  "use strict";

  const Data = window.CourseData;
  const COURSE = window.COURSE;
  const Engine = window.FormulaEngine;
  const Views = window.Views;
  const I18N = window.I18N;
  const PracticeContent = window.PracticeContent;
  const AnswerEngine = window.AnswerEngine;
  const SheetSelection = window.SheetSelection;
  const SoundFX = window.SoundFX || { play() {}, setEnabled() {}, isEnabled() { return false; } };
  const PROGRESS_KEY = "formula-island-course-progress-v2-release";
  const PRACTICE_PROGRESS_KEY = "formula-island-practice-progress-v1";
  const LEGACY_PROGRESS_KEY = "formula-island-course-progress-v2";
  const SETTINGS_KEY = "formula-island-settings-v1";
  const BACKUP_FORMAT = "excel-land-progress";
  const BACKUP_VERSION = 1;
  const MAX_BACKUP_SIZE = 5 * 1024 * 1024;
  const APP_VERSION = "1.3.1";
  const ASSET_VERSION = "1.3.1-r1";
  const COURSE_SCRIPT_FILES = [
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
    "src/content/art/base.js",
    "src/content/art/advanced.js",
  ];

  function loadJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "{}") || {};
    } catch (error) {
      return {};
    }
  }

  function hasStoredValue(key) {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      return false;
    }
  }

  function loadFirstStored(keys) {
    for (const key of keys) {
      if (hasStoredValue(key)) return loadJson(key);
    }
    return {};
  }

  const savedSettings = loadFirstStored([SETTINGS_KEY, "formula-island-settings-sctest-v1"]);
  const settings = {
    soundEnabled: savedSettings.soundEnabled !== false,
    language: I18N.normalizeLanguage(savedSettings.language || "zh-CN"),
    unlockAll: savedSettings.unlockAll === true,
  };
  I18N.setLanguage(settings.language);
  SoundFX.setEnabled(settings.soundEnabled);

  let validCourseLevelIds = new Set();
  let validCourseStepIds = new Set();
  let dailyQueue = [];
  let dailyQueueAnchor = "";
  let courseContentReady = false;
  let courseContentPromise = null;

  function normalizeSavedRecord(raw) {
    const record = raw && typeof raw === "object" ? raw : {};
    const strings = (value) => Array.from(new Set((Array.isArray(value) ? value : []).filter((item) => typeof item === "string")));
    return {
      currentLevelId: typeof record.currentLevelId === "string" ? record.currentLevelId : null,
      currentDateKey: typeof record.currentDateKey === "string" ? record.currentDateKey : null,
      stepIndex: Number.isInteger(record.stepIndex) ? record.stepIndex : 0,
      completedLevels: strings(record.completedLevels),
      completedSteps: strings(record.completedSteps),
      completedDates: strings(record.completedDates),
      mistakesByStep: record.mistakesByStep && typeof record.mistakesByStep === "object" ? record.mistakesByStep : {},
    };
  }

  function readCourseProgressRecord() {
    return normalizeSavedRecord(loadFirstStored([
      PROGRESS_KEY,
      "formula-island-course-progress-v2-sctest",
      "formula-island-course-progress-v2-test",
      LEGACY_PROGRESS_KEY,
    ]));
  }

  function readPracticeStore() {
    return loadJson(PRACTICE_PROGRESS_KEY);
  }

  function readPracticeProgressRecord(mode) {
    return normalizeSavedRecord(readPracticeStore()[mode]);
  }

  const loadedCourseScripts = new Set();

  function loadCourseScript(file) {
    if (loadedCourseScripts.has(file)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = file + "?v=" + encodeURIComponent(ASSET_VERSION);
      script.async = false;
      script.dataset.courseScript = "true";
      script.onload = () => {
        loadedCourseScripts.add(file);
        resolve();
      };
      script.onerror = () => reject(new Error("course-script-failed:" + file));
      document.body.appendChild(script);
    });
  }

  function ensureCourseContent() {
    if (courseContentReady) return Promise.resolve();
    if (courseContentPromise) return courseContentPromise;
    courseContentPromise = (async () => {
      for (const file of COURSE_SCRIPT_FILES) {
        await loadCourseScript(file);
      }
      Data.indexCourse();
      validCourseLevelIds = new Set(COURSE.levels.map((level) => level.id));
      validCourseStepIds = new Set(COURSE.levels.flatMap((level) => level.steps.map((step) => step.id)));
      courseContentReady = true;
    })();
    courseContentPromise.catch(() => { courseContentPromise = null; });
    return courseContentPromise;
  }

  function warmCourseContent() {
    ensureCourseContent().catch(() => {});
  }

  function writePracticeProgressRecord(mode, record) {
    try {
      const store = readPracticeStore();
      store[mode] = record;
      localStorage.setItem(PRACTICE_PROGRESS_KEY, JSON.stringify(store));
    } catch (error) {
      // Practice remains usable when storage is unavailable.
    }
  }

  function ensureDailyQueue(force) {
    const today = PracticeContent.daily.currentDateKey();
    if (force || dailyQueueAnchor !== today || !dailyQueue.length) {
      dailyQueue = PracticeContent.daily.recentLevels(7, today);
      dailyQueueAnchor = today;
      if (!dailyQueue.some((level) => level.dateKey === state.dailySelectedDate)) {
        state.dailySelectedDate = today;
      }
    }
    return dailyQueue;
  }

  function currentLevels() {
    if (state.activeMode === "comprehensive") return PracticeContent.comprehensive.levels;
    if (state.activeMode === "daily") return ensureDailyQueue();
    return COURSE.levels;
  }

  function courseUnlockedLimit(completed) {
    if (settings.unlockAll) return COURSE.levels.length - 1;
    const completedSet = completed || state.completedLevels;
    let index = 0;
    while (index < COURSE.levels.length && completedSet.has(COURSE.levels[index].id)) index += 1;
    return Math.min(COURSE.levels.length - 1, index);
  }

  function maxUnlockedIndex() {
    if (state.activeMode !== "course") return currentLevels().length - 1;
    return courseUnlockedLimit(state.completedLevels);
  }

  function canAccessLevel(index) {
    if (state.activeMode !== "course") return index >= 0 && index < currentLevels().length;
    return settings.unlockAll || (index >= 0 && index <= courseUnlockedLimit(state.completedLevels));
  }

  const state = {
    activeMode: null,
    screen: "select",
    levelIndex: 0,
    stepIndex: 0,
    completedLevels: new Set(),
    completedSteps: new Set(),
    dailySelectedDate: PracticeContent.daily.currentDateKey(),
    dailyCompletedDates: new Set(),
    activeTaskStepId: null,
    activeTask: null,
    activeTaskId: null,
    selectedOption: null,
    optionOrder: [],
    optionOrderStepId: null,
    builderTokens: [],
    builderOrder: [],
    builderOrderStepId: null,
    labStepId: null,
    labState: null,
    fillValues: [],
    fillChecks: [],
    fillStepId: null,
    multiSelected: new Set(),
    sheetSelection: null,
    sheetAnswerFormulas: {},
    operation: null,
    formulaInput: "",
    formulaCaret: { start: 0, end: 0 },
    formulaEditingActive: false,
    formulaEditRevision: 0,
    lastReferenceInsertion: null,
    pickedValue: null,
    pickedCellRef: null,
    pickedRanges: [],
    cellClickEditing: false,
    formulaMenuOpen: false,
    formulaFunctions: [],
    feedback: null,
    hintVisible: false,
    demoPlayed: false,
    mistakesByStep: {},
    isLastStep: false,
    settingsVisible: false,
    completionVisible: false,
    completionData: null,
    courseLoading: false,
  };

  let toastTimer = null;
  let dragSelection = null;
  let touchSelection = null;
  let touchHandleDrag = null;
  let fillHandleDrag = null;
  let lastPointerType = "mouse";
  let suppressCellClickUntil = 0;
  let headerHadFormulaFocus = false;
  const RANGE_EDGE_CLASSES = ["is-range-top", "is-range-right", "is-range-bottom", "is-range-left"];

  function tr(key, params) {
    return I18N.t(key, params);
  }

  function lt(value) {
    return I18N.text(value);
  }

  function expectedFor(item) {
    if (!item) return undefined;
    const language = I18N.getLanguage();
    if (item.expectedByLanguage) {
      return item.expectedByLanguage[language] == null
        ? item.expectedByLanguage["zh-CN"]
        : item.expectedByLanguage[language];
    }
    return item.expected;
  }

  function courseInitialIndex(record, completed) {
    const levels = COURSE.levels;
    const unlockedLimit = courseUnlockedLimit(completed);
    const isAccessible = (index) => settings.unlockAll || (index >= 0 && index <= unlockedLimit);
    const params = new URLSearchParams(window.location.search);
    const requestedLevel = params.get("level");
    if (requestedLevel) {
      const requestedIndex = /^\d+$/.test(requestedLevel)
        ? Number(requestedLevel)
        : levels.findIndex((level) => level.id === requestedLevel);
      if (isAccessible(requestedIndex)) return requestedIndex;
    }
    if (record.currentLevelId) {
      const savedIndex = levels.findIndex((level) => level.id === record.currentLevelId);
      if (isAccessible(savedIndex)) return savedIndex;
    }
    const firstIncomplete = levels.findIndex((level) => !completed.has(level.id));
    if (firstIncomplete >= 0 && isAccessible(firstIncomplete)) return firstIncomplete;
    return Math.max(0, Math.min(levels.length - 1, unlockedLimit));
  }

  function hydrateCourseRuntime() {
    const record = readCourseProgressRecord();
    state.completedLevels = new Set(record.completedLevels.filter((id) => validCourseLevelIds.has(id)));
    state.completedSteps = new Set(record.completedSteps.filter((id) => validCourseStepIds.has(id)));
    state.mistakesByStep = Object.assign({}, record.mistakesByStep);
    state.levelIndex = courseInitialIndex(record, state.completedLevels);
    const level = COURSE.levels[state.levelIndex];
    if (!level) return;
    Data.normalizeLevelTasks(level);
    const requestedStep = Number(new URLSearchParams(window.location.search).get("step"));
    const matchingSavedLevel = record.currentLevelId === level.id;
    const preferredStep = Number.isInteger(requestedStep) && requestedStep >= 0
      ? requestedStep
      : matchingSavedLevel ? record.stepIndex : 0;
    state.stepIndex = Math.min(Math.max(0, preferredStep || 0), Math.max(0, level.steps.length - 1));
  }

  function hydratePracticeRuntime(mode) {
    const record = readPracticeProgressRecord(mode);
    state.completedLevels = new Set(record.completedLevels);
    state.completedSteps = new Set(record.completedSteps);
    state.mistakesByStep = Object.assign({}, record.mistakesByStep);
    state.dailyCompletedDates = new Set(record.completedDates);

    if (mode === "comprehensive") {
      const total = PracticeContent.comprehensive.total;
      let index = -1;
      for (let item = 0; item < total; item += 1) {
        if (PracticeContent.comprehensive.idAt(item) === record.currentLevelId) {
          index = item;
          break;
        }
      }
      if (index < 0) {
        for (let item = 0; item < total; item += 1) {
          if (!state.completedLevels.has(PracticeContent.comprehensive.idAt(item))) {
            index = item;
            break;
          }
        }
      }
      state.levelIndex = index >= 0 ? index : 0;
      const level = PracticeContent.comprehensive.levelAt(state.levelIndex);
      state.stepIndex = level && record.currentLevelId === level.id
        ? Math.min(Math.max(0, record.stepIndex || 0), Math.max(0, level.steps.length - 1))
        : 0;
      return;
    }

    ensureDailyQueue(true);
    const savedDate = record.currentDateKey || (String(record.currentLevelId || "").match(/^daily-(\d{4}-\d{2}-\d{2})-/ ) || [])[1];
    const index = dailyQueue.findIndex((level) => level.dateKey === savedDate);
    state.levelIndex = index >= 0 ? index : 0;
    const level = dailyQueue[state.levelIndex];
    state.dailySelectedDate = level ? level.dateKey : PracticeContent.daily.currentDateKey();
    state.stepIndex = index >= 0 && level
      ? Math.min(Math.max(0, record.stepIndex || 0), Math.max(0, level.steps.length - 1))
      : 0;
  }

  function hydrateModeRuntime(mode) {
    if (mode === "course") hydrateCourseRuntime();
    else hydratePracticeRuntime(mode);
  }

  function currentLevel() {
    return currentLevels()[state.levelIndex];
  }

  function currentStep() {
    const level = currentLevel();
    return level ? level.steps[state.stepIndex] : null;
  }

  function saveProgress() {
    if (!state.activeMode) return;
    try {
      const record = {
        currentLevelId: currentLevel() ? currentLevel().id : null,
        currentDateKey: state.activeMode === "daily" ? state.dailySelectedDate : null,
        stepIndex: state.stepIndex,
        completedLevels: Array.from(state.completedLevels),
        completedSteps: Array.from(state.completedSteps),
        completedDates: state.activeMode === "daily" ? Array.from(state.dailyCompletedDates) : [],
        mistakesByStep: state.mistakesByStep,
      };
      if (state.activeMode === "course") {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(record));
      } else {
        writePracticeProgressRecord(state.activeMode, record);
      }
    } catch (error) {
      // The app remains usable when file-origin storage is disabled.
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      // Settings remain active for the current session.
    }
  }

  function renderAccessBadge() {
    const badge = document.getElementById("buildBadge");
    if (!badge) return;
    const practiceMode = state.activeMode && state.activeMode !== "course";
    badge.textContent = practiceMode ? tr("mode.allFunctions") : tr(settings.unlockAll ? "mode.unlocked" : "mode.sequential");
    badge.classList.toggle("is-unlocked", practiceMode || settings.unlockAll);
  }

  function applyStaticText() {
    document.documentElement.lang = settings.language;
    document.title = tr("app.title");
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = tr(element.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
      element.setAttribute("aria-label", tr(element.dataset.i18nAria));
    });
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute("content", tr("app.description"));
    renderAccessBadge();
    document.body.dataset.unlockAll = settings.unlockAll ? "true" : "false";
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    window.requestAnimationFrame(() => toast.classList.add("is-visible"));
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
      window.setTimeout(() => { toast.hidden = true; }, 180);
    }, 2200);
  }

  function scrollTop() {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  function shuffle(values) {
    const result = values.slice();
    for (let index = result.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [result[index], result[target]] = [result[target], result[index]];
    }
    return result;
  }

  function ensureOptionOrder(step, force) {
    if (!Array.isArray(step.options) || !step.options.length) return;
    if (!force && state.optionOrderStepId === step.id && state.optionOrder.length === step.options.length) return;
    state.optionOrder = shuffle(step.options.map((option) => option.id));
    state.optionOrderStepId = step.id;
  }

  function ensureBuilderOrder(step, force) {
    if (!Array.isArray(step.tokens) || !step.tokens.length) return;
    if (!force && state.builderOrderStepId === step.id && state.builderOrder.length === step.tokens.length) return;
    state.builderOrder = shuffle(step.tokens.map((token) => token.id));
    state.builderOrderStepId = step.id;
  }

  function ensureFillValues(step, force) {
    if (!step || step.type !== "builder") return;
    const count = Array.isArray(step.fillBlanks) ? step.fillBlanks.length : 0;
    if (!force && state.fillStepId === step.id && state.fillValues.length === count) return;
    state.fillValues = Array.from({ length: count }, () => "");
    state.fillChecks = [];
    state.fillStepId = step.id;
  }

  function ensureLabState(step, force) {
    if (!step || step.type !== "lab" || !step.lab || !window.ExcelLab) {
      if (!step || step.type !== "lab") {
        state.labStepId = null;
        state.labState = null;
      }
      return;
    }
    if (!force && state.labStepId === step.id && state.labState) return;
    state.labStepId = step.id;
    state.labState = window.ExcelLab.initialState(step.lab);
  }

  function refreshTaskSheet() {
    if (!state.activeTask || state.activeTask.sheetMutated) return;
    state.activeTask.sheetData = resolvedTaskSheet(state.activeTask);
  }

  function initialOperationState(task) {
    if (!task) return null;
    const operation = task.operation || {};
    return {
      type: operation.type || "view",
      selectedValue: "",
      selectedValues: [],
      hiddenRows: [],
      filters: {},
      filterMode: false,
      filterOpen: false,
      filterColumns: [],
      filterOpenColumn: "",
      toolMenu: "",
      sortDialogOpen: false,
      sortColumn: "",
      gotoDialogOpen: false,
      findQuery: "",
      findMatches: [],
      activeFindRef: "",
      findPerformed: false,
      findOpen: false,
      findMode: "find",
      findReplacement: "",
      findOptionsOpen: false,
      findMatchCase: Boolean(operation.matchCase),
      findEntireCell: false,
      findDistinguishWidth: false,
      findSearchBy: "row",
      findLookIn: "formulas",
    };
  }

  function ensureOperationState(task) {
    if (!state.operation) state.operation = initialOperationState(task || state.activeTask);
    return state.operation;
  }

  function resolvedTaskSheet(task) {
    const sheetData = Views.resolveSheet(task.sheet || currentStep().sheet);
    const answerRange = Views.answerRangeForTask(task);
    if (answerRange) answerRange.cells.forEach((ref) => delete sheetData[ref]);
    return sheetData;
  }

  function ensureSheetTask(step, force) {
    if (step.type !== "sheet" || !Array.isArray(step.tasks) || !step.tasks.length) return;
    if (!force && state.activeTaskStepId === step.id && state.activeTask) {
      if (!state.sheetAnswerFormulas) state.sheetAnswerFormulas = {};
      refreshTaskSheet();
      ensureOperationState(state.activeTask);
      return;
    }
    let pool = step.tasks;
    if (pool.length > 1 && state.activeTaskId) {
      pool = pool.filter((task) => task.id !== state.activeTaskId);
    }
    if (!pool.length) pool = step.tasks;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    state.activeTaskStepId = step.id;
    state.activeTaskId = chosen.id;
    state.activeTask = Object.assign({}, chosen, {
      sheetData: resolvedTaskSheet(chosen),
    });
    state.sheetAnswerFormulas = {};
    state.sheetFillEnd = null;
    state.operation = initialOperationState(chosen);
  }

  function prepareFormulaFunctions() {
    const task = state.activeTask || {};
    const recommended = task.requiredFunctions || (task.requiredFunction ? [task.requiredFunction] : []);
    const practiceMode = state.activeMode && state.activeMode !== "course";
    state.formulaFunctions = COURSE.formulaFunctions.map((fn) => {
      const unlockIndex = practiceMode ? -1 : (COURSE.levels || []).findIndex((level) => level.id === fn.unlockAtLevel);
      const required = recommended.includes(fn.name);
      const unlockedByProgress = unlockIndex >= 0 && unlockIndex <= state.levelIndex;
      return Object.assign({}, fn, {
        unlocked: practiceMode || settings.unlockAll || unlockedByProgress || required,
        recommended: required,
      });
    });
  }

  function renderHeader() {
    if (state.screen !== "mode") return;
    const level = currentLevel();
    const step = currentStep();
    if (!level || !step) return;
    const levelTitle = document.getElementById("levelTitle");
    if (levelTitle) levelTitle.textContent = lt(level.title);
    const stepLabel = document.getElementById("stepLabel");
    if (stepLabel) stepLabel.textContent = tr("progress.step", { current: state.stepIndex + 1, total: level.steps.length });
    const stepProgress = document.getElementById("stepProgress");
    if (stepProgress) {
      stepProgress.innerHTML = level.steps.map((levelStep, index) => {
        const completed = state.completedSteps.has(levelStep.id);
        const current = index === state.stepIndex;
        const locked = state.activeMode === "course" && !settings.unlockAll && !completed && !current;
        const classes = ["step-dot", completed ? "is-complete" : "", current ? "is-current" : "", locked ? "is-locked" : ""]
          .filter(Boolean)
          .join(" ");
        const accessibleLabel = completed
          ? tr("progress.stepCompleted", { step: index + 1 })
          : locked
            ? tr("progress.stepLocked", { step: index + 1 })
            : tr("progress.goToStep", { step: index + 1 });
        return '<button class="' + classes + '" type="button" data-action="goto-step" data-step="' + index +
          '" aria-label="' + Views.escapeHtml(accessibleLabel) + '" title="' + Views.escapeHtml(accessibleLabel) + '"' +
          (current ? ' aria-current="step"' : "") + (locked ? " disabled" : "") + ">" +
          (completed && !current ? "√" : String(index + 1)) + "</button>";
      }).join("");
    }
    const levels = currentLevels();
    const isDaily = state.activeMode === "daily";
    const done = isDaily ? state.dailyCompletedDates.size : state.completedLevels.size;
    const total = isDaily ? PracticeContent.daily.total : levels.length;
    const overallText = document.getElementById("overallProgressText");
    if (overallText) overallText.textContent = state.activeMode === "course"
      ? tr("progress.overall", { done, total: COURSE.totalLevels })
      : tr("mode.progress", { done, total });
    const overallBar = document.getElementById("overallProgressBar");
    if (overallBar) overallBar.style.width = Math.round((done / Math.max(1, total)) * 100) + "%";
    const modeSwitchLabel = document.getElementById("modeSwitchLabel");
    if (modeSwitchLabel) modeSwitchLabel.textContent = tr("mode.switch");
    renderAccessBadge();
  }

  function setSidebarSummary(kicker, title, progressText, progressRatio) {
    const kickerElement = document.getElementById("mapKicker");
    const titleElement = document.getElementById("mapTitle");
    const overallText = document.getElementById("overallProgressText");
    const overallBar = document.getElementById("overallProgressBar");
    if (kickerElement) kickerElement.textContent = kicker;
    if (titleElement) titleElement.textContent = title;
    if (overallText) overallText.textContent = progressText;
    if (overallBar) overallBar.style.width = Math.round(Math.max(0, Math.min(1, progressRatio)) * 100) + "%";
  }

  function setSidebarGoal(title, copy, symbol) {
    const titleElement = document.getElementById("goalTitle");
    const copyElement = document.getElementById("goalCopy");
    const ring = document.querySelector(".goal-ring span");
    const note = document.querySelector(".tiny-note");
    if (titleElement) titleElement.textContent = title;
    if (copyElement) copyElement.textContent = copy;
    if (ring) ring.textContent = symbol;
    if (note) note.textContent = state.activeMode === "course" ? tr("goal.note") : tr("mode.allFunctions");
  }

  function renderCourseSidebar() {
    const map = document.getElementById("levelMap");
    if (!map) return;
    const unlockedLimit = maxUnlockedIndex();
    map.innerHTML = COURSE.chapters.map((chapter) => {
      const chapterDone = chapter.levels.filter((level) => state.completedLevels.has(level.id)).length;
      const isCurrentChapter = chapter.index === currentLevel().chapterIndex;
      const chapterUnlocked = settings.unlockAll || chapter.levels.some((level) =>
        state.completedLevels.has(level.id) || level.globalIndex <= unlockedLimit);
      const levels = chapter.levels.map((level) => {
        const index = level.globalIndex;
        const done = state.completedLevels.has(level.id);
        const active = index === state.levelIndex;
        const unlocked = settings.unlockAll || index <= unlockedLimit || done;
        const classes = ["map-node"];
        if (done) classes.push("is-done");
        if (active) classes.push("is-active");
        if (!unlocked) classes.push("is-locked");
        if (level.kind === "review") classes.push("is-review-node");
        if (level.kind === "exam") classes.push("is-exam-node");
        const status = done ? tr("status.completed") : active ? tr("status.active") : unlocked ? tr("status.available") : tr("status.locked");
        const icon = chapter.number + "-" + (level.levelIndex + 1);
        const levelTitle = lt(level.title);
        const accessibleLabel = icon + " · " + levelTitle + " · " + status + " · " + tr("kind." + level.kind);
        return '<button class="' + classes.join(" ") + '" type="button" data-action="goto-level" data-level="' +
          index + '"' + (unlocked ? "" : " disabled") + ' aria-current="' + (active ? "step" : "false") +
          '" aria-label="' + Views.escapeHtml(accessibleLabel) + '"><span class="node-dot">' + icon +
          '</span><span class="node-copy"><strong>' + Views.escapeHtml(levelTitle) + "</strong></span></button>";
      }).join("");
      const chapterTitle = lt(chapter.title).replace(/^(?:Chapter\s+\d+|第\s*\d+\s*章)\s*[·:：-]\s*/i, "");
      const chapterClasses = ["chapter-block"];
      if (isCurrentChapter) chapterClasses.push("is-current");
      if (!chapterUnlocked) chapterClasses.push("is-locked-chapter");
      return '<section class="' + chapterClasses.join(" ") + '"><div class="chapter-label"><span class="chapter-art-thumb" aria-hidden="true">' +
        Views.chapterArtSvg(chapter.number) + '<span class="chapter-art-number">' + String(chapter.number).padStart(2, "0") +
        '</span></span><span><strong>' + Views.escapeHtml(chapterTitle) + '</strong><small>' +
        Views.escapeHtml(tr("map.chapterProgress", { done: chapterDone, total: chapter.levels.length })) + "</small></span></div><div class=\"chapter-levels\">" +
        levels + "</div></section>";
    }).join("");
    const done = state.completedLevels.size;
    setSidebarSummary(tr("app.mapKicker"), tr("app.mapTitle"), tr("progress.overall", { done, total: COURSE.totalLevels }), done / COURSE.totalLevels);
    setSidebarGoal(tr("goal.title"), tr("goal.copy"), done ? "√" : "0");
  }

  function formatDailyDate(dateKey) {
    const cacheKey = settings.language + "|" + dateKey;
    if (formatDailyDate.cache.has(cacheKey)) return formatDailyDate.cache.get(cacheKey);
    const parts = String(dateKey || "").split("-").map(Number);
    if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return dateKey;
    try {
      if (!formatDailyDate.formatter || formatDailyDate.language !== settings.language) {
        formatDailyDate.language = settings.language;
        formatDailyDate.formatter = new Intl.DateTimeFormat(settings.language, { month: "short", day: "numeric" });
      }
      const formatted = formatDailyDate.formatter.format(
        new Date(parts[0], parts[1] - 1, parts[2])
      );
      formatDailyDate.cache.set(cacheKey, formatted);
      return formatted;
    } catch (error) {
      return parts[1] + "/" + parts[2];
    }
  }
  formatDailyDate.cache = new Map();

  function renderComprehensiveSidebar() {
    const map = document.getElementById("levelMap");
    if (!map) return;
    const total = PracticeContent.comprehensive.total;
    const done = Array.from(state.completedLevels).filter((id) => /^training-v13-\d+$/.test(id)).length;
    map.innerHTML = '<div class="practice-map"><div class="practice-map-head">' + Views.escapeHtml(tr("mode.allFunctions")) +
      '</div><div class="practice-node-grid">' + Array.from({ length: total }, (_, index) => {
        const levelId = PracticeContent.comprehensive.idAt(index);
        const complete = state.completedLevels.has(levelId);
        const active = index === state.levelIndex;
        const status = complete ? tr("status.completed") : active ? tr("status.active") : tr("status.available");
        const classes = ["practice-node", complete ? "is-done" : "", active ? "is-active" : ""].filter(Boolean).join(" ");
        const title = String(index + 1).padStart(2, "0") + " · " + tr("mode.comprehensiveTitle");
        return '<button class="' + classes + '" type="button" data-action="goto-level" data-level="' + index +
          '" title="' + Views.escapeHtml(title + " · " + status) + '" aria-label="' +
          Views.escapeHtml(title + " · " + status) + '"' + (active ? ' aria-current="step"' : "") + '>' +
          String(index + 1) + '</button>';
      }).join("") + "</div></div>";
    setSidebarSummary(tr("map.trainingKicker"), tr("map.trainingTitle"), tr("map.trainingProgress", { done, total }), done / total);
    setSidebarGoal(tr("mode.comprehensiveTitle"), tr("map.trainingProgress", { done, total }), done >= total ? "√" : String(done));
  }

  function renderDailySidebar() {
    const map = document.getElementById("levelMap");
    if (!map) return;
    const levels = ensureDailyQueue();
    const today = levels[0];
    const todayDone = today && state.dailyCompletedDates.has(today.dateKey);
    const recentDone = levels.filter((level) => state.dailyCompletedDates.has(level.dateKey)).length;
    const todayTitle = today ? lt(today.title) : "";
    const todayCard = today ? '<button class="daily-today-card ' + (todayDone ? "is-done " : "") +
      (today.dateKey === state.dailySelectedDate ? "is-active" : "") + '" type="button" data-action="goto-level" data-level="0" aria-current="' +
      (today.dateKey === state.dailySelectedDate ? "step" : "false") + '"><span class="daily-today-label">' + Views.escapeHtml(tr("daily.today")) +
      '</span><strong>' + Views.escapeHtml(todayTitle) + '</strong><span class="daily-today-meta">' + Views.escapeHtml(formatDailyDate(today.dateKey)) +
      ' · ' + Views.escapeHtml(todayDone ? tr("daily.done") : tr("daily.todo")) + '</span></button>' : "";
    const previous = levels.slice(1).map((level, offset) => {
      const complete = state.dailyCompletedDates.has(level.dateKey);
      const active = level.dateKey === state.dailySelectedDate;
      const status = complete ? tr("daily.done") : tr("daily.todo");
      const label = tr("daily.dateAria", { date: formatDailyDate(level.dateKey), status });
      return '<button class="daily-date-node ' + (complete ? "is-done " : "") + (active ? "is-active" : "") +
        '" type="button" data-action="goto-level" data-level="' + (offset + 1) + '" title="' + Views.escapeHtml(label) +
        '" aria-label="' + Views.escapeHtml(label) + '"><strong>' + Views.escapeHtml(formatDailyDate(level.dateKey)) +
        '</strong><small>' + (complete ? "√" : "·") + '</small></button>';
    }).join("");
    map.innerHTML = '<div class="daily-map">' + todayCard +
      '<div class="daily-recent-head"><span>' + Views.escapeHtml(tr("daily.recent")) + '</span><small>' +
      Views.escapeHtml(tr("map.dailyProgress", { done: recentDone })) + '</small></div><div class="daily-date-grid">' + previous + '</div></div>';
    const streak = dailyStreakFromDates(state.dailyCompletedDates);
    setSidebarSummary(tr("map.dailyKicker"), tr("map.dailyTitle"), streak > 0 ? tr("daily.streak", { count: streak }) : tr("mode.progress", { done: state.dailyCompletedDates.size, total: PracticeContent.daily.total }), recentDone / levels.length);
    setSidebarGoal(tr("daily.today"), todayDone ? tr("daily.done") : tr("daily.todo"), todayDone ? "√" : String(new Date().getDate()));
  }

  function renderSidebar() {
    if (state.screen !== "mode") return;
    if (state.activeMode === "course") renderCourseSidebar();
    else if (state.activeMode === "comprehensive") renderComprehensiveSidebar();
    else renderDailySidebar();
  }

  function dailyStreakFromDates(dateValues) {
    const dates = dateValues instanceof Set ? dateValues : new Set(dateValues || []);
    let cursor = PracticeContent.daily.currentDateKey();
    let count = 0;
    while (dates.has(cursor) && count < PracticeContent.daily.total) {
      count += 1;
      cursor = PracticeContent.daily.shiftDateKey(cursor, -1);
    }
    return count;
  }

  function modeSummary() {
    const courseRecord = readCourseProgressRecord();
    const courseDone = validCourseLevelIds.size
      ? new Set(courseRecord.completedLevels.filter((id) => validCourseLevelIds.has(id))).size
      : new Set(courseRecord.completedLevels).size;
    const trainingRecord = readPracticeProgressRecord("comprehensive");
    const trainingDone = new Set(trainingRecord.completedLevels.filter((id) => /^training-v13-\d+$/.test(id))).size;
    const dailyRecord = readPracticeProgressRecord("daily");
    const dailyDates = new Set(dailyRecord.completedDates.filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)));
    const today = PracticeContent.daily.currentDateKey();
    return {
      course: {
        done: courseDone,
        total: COURSE.totalLevels || COURSE.expectedTotalLevels || 32,
        resumed: Boolean(courseRecord.currentLevelId || courseRecord.stepIndex > 0 || courseDone > 0),
      },
      comprehensive: {
        done: trainingDone,
        total: PracticeContent.comprehensive.total || 50,
        resumed: Boolean(trainingRecord.currentLevelId || trainingRecord.stepIndex > 0 || trainingDone > 0),
      },
      daily: {
        done: dailyDates.size,
        total: PracticeContent.daily.total,
        todayDone: dailyDates.has(today),
        streak: dailyStreakFromDates(dailyDates),
        resumed: Boolean(dailyRecord.currentDateKey || dailyDates.size > 0),
      },
    };
  }

  function renderModeScreen() {
    const screen = document.getElementById("modeScreen");
    if (!screen) return;
    applyStaticText();
    screen.innerHTML = Views.renderModeSelector(modeSummary());
  }

  function showModeScreen() {
    if (state.screen === "mode") saveProgress();
    closeCompletion();
    closeFormulaMenu();
    closeMobileMap();
    state.screen = "select";
    const shell = document.getElementById("appShell");
    const screen = document.getElementById("modeScreen");
    if (shell) shell.hidden = true;
    if (screen) screen.hidden = false;
    document.body.dataset.screen = "select";
    renderModeScreen();
  }

  async function enterMode(mode) {
    if (!["course", "comprehensive", "daily"].includes(mode)) return;
    if (mode === "course" && !courseContentReady) {
      if (state.courseLoading) return;
      state.courseLoading = true;
      const card = document.querySelector(".mode-card-course");
      if (card) {
        card.classList.add("is-loading");
        card.setAttribute("aria-busy", "true");
      }
      const cta = document.querySelector(".mode-card-course .mode-card-cta");
      if (cta) cta.textContent = tr("mode.loadingCourse");
      try {
        await ensureCourseContent();
      } catch (error) {
        state.courseLoading = false;
        renderModeScreen();
        showToast(tr("mode.loadFailed"));
        return;
      }
      state.courseLoading = false;
    }
    if (state.screen === "mode" && state.activeMode) saveProgress();
    state.activeMode = mode;
    state.screen = "mode";
    hydrateModeRuntime(mode);
    resetTransient(true);
    closeCompletion();
    closeFormulaMenu();
    closeMobileMap();
    const shell = document.getElementById("appShell");
    const screen = document.getElementById("modeScreen");
    if (shell) shell.hidden = false;
    if (screen) screen.hidden = true;
    document.body.dataset.screen = "mode";
    document.body.dataset.mode = mode;
    renderAll({ animate: true });
    saveProgress();
    scrollTop();
  }

  function renderLesson(animate) {
    const container = document.getElementById("lessonView");
    if (!container) return;
    const level = currentLevel();
    const step = currentStep();
    container.classList.remove("is-entering");
    container.innerHTML = Views.renderStep(step, level, state);
    if (animate) {
      container.classList.add("is-entering");
      const card = container.querySelector(".lesson-card");
      if (card) {
        const clearEntering = (event) => {
          if (event.animationName !== "cardIn") return;
          container.classList.remove("is-entering");
          card.removeEventListener("animationend", clearEntering);
        };
        card.addEventListener("animationend", clearEntering);
      }
    }
    window.setTimeout(restoreSheetSelection, 0);
    if (step.type === "builder") window.setTimeout(updateBuilderPreview, 0);
    if (step.type === "sheet" && !(state.feedback && state.feedback.type === "correct")) {
      window.setTimeout(revealTargetCell, 120);
    }
    if (state.operation && state.operation.filterOpen) {
      window.setTimeout(positionExcelFilterPopover, 0);
    }
    if (state.operation && state.operation.findOpen) {
      window.setTimeout(positionExcelFindPopover, 0);
    }
    if (state.operation && state.operation.gotoDialogOpen) {
      window.setTimeout(() => positionSheetDialog("excelGoToPopover"), 0);
    }
  }

  function renderAll(options) {
    if (state.screen !== "mode" || !state.activeMode) return;
    const level = currentLevel();
    const step = currentStep();
    if (!level || !step) return;
    state.isLastStep = state.stepIndex === level.steps.length - 1;
    ensureOptionOrder(step, false);
    ensureBuilderOrder(step, false);
    ensureFillValues(step, false);
    ensureSheetTask(step, false);
    ensureLabState(step, false);
    prepareFormulaFunctions();
    state.formulaMenuOpen = false;
    applyStaticText();
    renderHeader();
    renderSidebar();
    renderLesson(Boolean(options && options.animate));
  }

  function resetActiveTask(force) {
    const step = currentStep();
    if (step.type !== "sheet") {
      state.operation = null;
      state.activeTask = null;
      state.activeTaskStepId = null;
      state.activeTaskId = null;
      return;
    }
    ensureSheetTask(step, force);
  }

  function resetTransient(forceTask) {
    cancelDragSelection();
    clearTouchSelection();
    fillHandleDrag = null;
    document.body.classList.remove("is-auto-filling");
    suppressCellClickUntil = 0;
    const step = currentStep();
    state.feedback = null;
    state.selectedOption = null;
    state.optionOrder = [];
    state.optionOrderStepId = null;
    state.builderTokens = [];
    state.builderOrder = [];
    state.builderOrderStepId = null;
    state.fillValues = [];
    state.fillChecks = [];
    state.fillStepId = null;
    state.multiSelected = new Set();
    state.sheetSelection = null;
    state.sheetAnswerFormulas = {};
    state.sheetFillEnd = null;
    if (!step || step.type !== "lab" || forceTask) {
      state.labStepId = null;
      state.labState = null;
    }
    state.formulaInput = "";
    state.formulaCaret = { start: 0, end: 0 };
    state.formulaEditingActive = false;
    state.formulaEditRevision = 0;
    state.lastReferenceInsertion = null;
    state.pickedValue = null;
    state.pickedCellRef = null;
    state.pickedRanges = [];
    state.cellClickEditing = false;
    state.hintVisible = false;
    state.formulaMenuOpen = false;
    state.demoPlayed = step ? state.completedSteps.has(step.id) : false;
    if (forceTask || !state.activeTask) {
      state.activeTask = null;
      state.activeTaskStepId = null;
      state.activeTaskId = null;
    }
    resetActiveTask(forceTask);
  }

  function enterStep(index, options) {
    const level = currentLevel();
    if (!level) return;
    state.stepIndex = Math.min(Math.max(0, index), level.steps.length - 1);
    resetTransient(options && options.newTask);
    renderAll({ animate: true });
    saveProgress();
  }

  function enterLevel(index, stepIndex) {
    const levels = currentLevels();
    if (index < 0 || index >= levels.length || !canAccessLevel(index)) return;
    state.levelIndex = index;
    if (state.activeMode === "course" && levels[index]) Data.normalizeLevelTasks(levels[index]);
    if (state.activeMode === "daily" && levels[index] && levels[index].dateKey) {
      state.dailySelectedDate = levels[index].dateKey;
    }
    state.stepIndex = Number.isInteger(stepIndex) ? stepIndex : 0;
    resetTransient(true);
    renderAll({ animate: true });
    saveProgress();
    closeMobileMap();
    closeCompletion();
    scrollTop();
  }

  function markStepComplete(step) {
    if (!state.completedSteps.has(step.id)) {
      state.completedSteps.add(step.id);
    }
    saveProgress();
  }

  function recordMistake(step) {
    state.mistakesByStep[step.id] = (Number(state.mistakesByStep[step.id]) || 0) + 1;
  }

  function setWrong(title, body, step) {
    recordMistake(step);
    SoundFX.play("wrong");
    state.feedback = { type: "wrong", title, body };
    renderAll();
  }

  function setCorrect(title, body, step) {
    markStepComplete(step);
    SoundFX.play("correct");
    state.feedback = { type: "correct", title, body };
    renderAll();
  }

  function advanceStep() {
    if (!state.feedback || state.feedback.type !== "correct") return;
    const level = currentLevel();
    if (state.stepIndex < level.steps.length - 1) {
      state.stepIndex += 1;
      resetTransient(false);
      renderAll({ animate: true });
      saveProgress();
      scrollTop();
      return;
    }
    completeLevel();
  }

  function levelMistakeCount(level) {
    return level.steps.filter((step) => Number(state.mistakesByStep[step.id]) > 0).length;
  }

  function completeLevel() {
    const level = currentLevel();
    const firstTime = !state.completedLevels.has(level.id);
    if (firstTime) {
      state.completedLevels.add(level.id);
    }
    if (state.activeMode === "daily" && level.dateKey) {
      state.dailyCompletedDates.add(level.dateKey);
    }
    const isPractice = state.activeMode !== "course";
    const levels = currentLevels();
    const courseComplete = state.activeMode === "course" && COURSE.levels.every((item) => state.completedLevels.has(item.id));
    const nextIndex = state.levelIndex + 1;
    const nextLevel = state.activeMode !== "daily" && nextIndex < levels.length && canAccessLevel(nextIndex) ? levels[nextIndex] : null;
    const mistakes = levelMistakeCount(level);
    const completedLevels = state.activeMode === "daily" ? state.dailyCompletedDates.size : state.completedLevels.size;
    const totalLevels = state.activeMode === "course"
      ? COURSE.totalLevels
      : state.activeMode === "daily" ? PracticeContent.daily.total : levels.length;
    state.completionData = {
      courseComplete,
      mode: state.activeMode,
      level,
      nextLevel,
      firstTime,
      accuracy: Math.max(0, Math.round(((level.steps.length - mistakes) / Math.max(1, level.steps.length)) * 100)),
      completedLevels,
      totalLevels,
    };
    saveProgress();
    renderHeader();
    renderSidebar();
    showCompletion();
    SoundFX.play("complete");
    showToast(courseComplete ? tr("toast.courseCompleted") : tr(isPractice ? "toast.practiceCompleted" : "toast.levelCompleted"));
  }

  function showCompletion() {
    const modal = document.getElementById("completionModal");
    const data = state.completionData;
    if (!modal || !data) return;
    state.completionVisible = true;
    modal.innerHTML = Views.renderCompletion(data);
    modal.hidden = false;
    document.body.classList.add("has-modal");
  }

  function closeCompletion() {
    const modal = document.getElementById("completionModal");
    state.completionVisible = false;
    document.body.classList.remove("has-modal");
    if (modal) {
      modal.hidden = true;
      modal.innerHTML = "";
    }
  }

  function goToNextLevel() {
    const data = state.completionData;
    if (!data || !data.nextLevel) {
      closeCompletion();
      return;
    }
    enterLevel(data.nextLevel.globalIndex, 0);
  }

  function checkChoice() {
    const step = currentStep();
    if (!state.selectedOption) return;
    const option = step.options.find((item) => item.id === state.selectedOption);
    if (!option) return;
    if (option.correct) {
      setCorrect(tr("feedback.choiceCorrect"), lt(option.note), step);
    } else {
      setWrong(tr("feedback.choiceWrong"), lt(option.note), step);
    }
  }

  function checkChallenge() {
    const step = currentStep();
    const correctIds = new Set(step.options.filter((option) => option.correct).map((option) => option.id));
    const selected = state.multiSelected;
    const missing = step.options.filter((option) => option.correct && !selected.has(option.id));
    const extra = step.options.filter((option) => !option.correct && selected.has(option.id));
    if (!missing.length && !extra.length && selected.size === correctIds.size) {
      setCorrect(tr("feedback.multiCorrect"), lt(step.successNote || step.tip || tr("feedback.multiCorrect")), step);
      return;
    }
    const reasons = [];
    if (missing.length) reasons.push(tr("feedback.multiMissing"));
    if (extra.length) reasons.push(tr("feedback.multiExtra"));
    setWrong(tr("feedback.multiWrong"), reasons.join(" ") || tr("feedback.multiWrong"), step);
  }

  function checkBuilder() {
    const step = currentStep();
    ensureFillValues(step, false);
    const blanks = step.fillBlanks || [];
    if (!blanks.length) return;
    const values = state.fillValues.map((value) => String(value || "").trim());
    if (values.some((value) => !value)) {
      showToast(tr("fill.incomplete"));
      const firstEmpty = values.findIndex((value) => !value);
      const input = document.querySelector('[data-fill-index="' + firstEmpty + '"]');
      if (input) input.focus({ preventScroll: true });
      return;
    }
    const checks = blanks.map((blank, index) => {
      const answer = I18N.text(blank.answerByLanguage || "");
      return normalizeFillValue(values[index]) === normalizeFillValue(answer);
    });
    state.fillChecks = checks;
    let equivalent = false;
    if (!checks.every(Boolean) && step.allowEquivalentFill) {
      const actualFormula = builderFormula(step);
      const expectedFormula = lt(step.exampleFormula);
      const sheet = Views.resolveSheet(step.sheet);
      const actualResult = Engine.evaluate(actualFormula, sheet);
      const expectedResult = Engine.evaluate(expectedFormula, sheet);
      const actualRefs = parseReferenceSet(Engine.normalizeFormula(actualFormula)).sort();
      const expectedRefs = parseReferenceSet(Engine.normalizeFormula(expectedFormula)).sort();
      equivalent = actualResult.ok
        && expectedResult.ok
        && valuesEqual(actualResult.value, expectedResult.value)
        && actualRefs.join(",") === expectedRefs.join(",");
    }
    if (checks.every(Boolean) || equivalent) {
      setCorrect(tr("feedback.builderCorrect"), lt(step.successNote || step.hint), step);
      return;
    }
    const wrongCount = checks.filter((correct) => !correct).length;
    setWrong(
      tr("feedback.builderWrong"),
      tr("feedback.builderWrongBody", { count: wrongCount }),
      step
    );
  }

  function labActionValue(element) {
    if (!element) return "";
    if (element.type === "checkbox") return element.checked;
    return element.value == null ? "" : element.value;
  }

  function refreshLabPreview() {
    const step = currentStep();
    const container = document.querySelector("[data-lab-preview]");
    if (!step || step.type !== "lab" || !container || !state.labState || !window.ExcelLab) return;
    container.innerHTML = window.ExcelLab.renderPreview(step.lab, state.labState, step);
  }

  function applyLabAction(action, element, options) {
    const step = currentStep();
    if (!step || step.type !== "lab") return null;
    ensureLabState(step, false);
    const actionName = String(action || "").replace(/^lab-/, "");
    const data = Object.assign({}, element ? element.dataset : {}, { type: actionName });
    if (element && /^(INPUT|SELECT|TEXTAREA)$/i.test(element.tagName)) {
      data.value = labActionValue(element);
    }
    const update = window.ExcelLab.handleAction(data, element, {
      step,
      lab: step.lab,
      state: state.labState,
    });
    if (!update) return null;
    state.labState = update;
    if (state.feedback && state.feedback.type === "wrong") state.feedback = null;
    if (options && options.rerender === false) {
      refreshLabPreview();
      const staleFeedback = document.querySelector(".lab-feedback.is-wrong");
      if (staleFeedback && !state.feedback) staleFeedback.remove();
    }
    else renderAll();
    return update;
  }

  function checkLab() {
    const step = currentStep();
    if (!step || step.type !== "lab" || !window.ExcelLab) return;
    ensureLabState(step, false);
    const result = window.ExcelLab.validate(step.lab, state.labState);
    state.labState.applied = Boolean(result.ok);
    state.labState.result = result;
    if (result.ok) {
      setCorrect(
        tr("lab.correctTitle"),
        lt(step.success) || tr("lab.successBody"),
        step
      );
      return;
    }
    setWrong(
      tr("lab.wrongTitle"),
      result.reason || tr("lab.reason.operation"),
      step
    );
  }

  function normalizeFillValue(value) {
    return String(value == null ? "" : value)
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/＝/g, "=")
      .replace(/（/g, "(")
      .replace(/）/g, ")")
      .replace(/，/g, ",")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, "")
      .trim()
      .toUpperCase();
  }

  const usedFunctions = AnswerEngine.usedFunctions;
  const taskFunctions = AnswerEngine.taskFunctions;
  const parseReferenceSet = AnswerEngine.parseReferenceSet;
  const valuesEqual = AnswerEngine.valuesEqual;
  const columnNumber = AnswerEngine.columnNumber;
  const columnLetters = AnswerEngine.columnLetters;
  const translateFormula = AnswerEngine.translateFormula;

  function syncShiftedAnswerFormulas(task) {
    if (!task) return;
    const formulas = state.sheetAnswerFormulas || {};
    state.sheetAnswerFormulas = formulas;
    const answerRange = Views.answerRangeForTask(task);
    const anchorCell = answerRange ? answerRange.startRef : task.target;
    const parsedAnchor = parseCell(anchorCell);
    const anchorFormula = String(state.formulaInput || "").trim();
    if (!answerRange || !parsedAnchor || !anchorFormula) {
      Object.keys(formulas).forEach((ref) => delete formulas[ref]);
      return;
    }
    Object.keys(formulas).forEach((ref) => {
      if (answerRange.cells.indexOf(ref) < 0) {
        delete formulas[ref];
        return;
      }
      if (ref === anchorCell) {
        formulas[ref] = anchorFormula;
        return;
      }
      const cell = parseCell(ref);
      if (!cell) {
        delete formulas[ref];
        return;
      }
      formulas[ref] = translateFormula(
        anchorFormula,
        cell.row - parsedAnchor.row,
        cell.col - parsedAnchor.col
      );
    });
    formulas[anchorCell] = anchorFormula;
  }

  function sheetEvaluationOptions() {
    return { hiddenRows: state.operation?.hiddenRows || [] };
  }

  function checkSheet() {
    const step = currentStep();
    const task = state.activeTask || {};
    const operationSheet = task.sheetData || currentStep().sheetData || {};
    if (task.operation) {
      let operationState = state.operation;
      if (task.operation.type === "find" && state.operation) {
        operationState = {
          ...state.operation,
          matchCase: state.operation.findMatchCase,
          matchEntireCell: state.operation.findEntireCell,
          searchBy: state.operation.findSearchBy,
          lookIn: state.operation.findLookIn,
          distinguishWidth: state.operation.findDistinguishWidth,
        };
      } else if (task.operation.type === "filter" && state.operation) {
        const column = String(task.operation.column || "").toUpperCase();
        const selected = state.operation.filters && state.operation.filters[column];
        operationState = {
          ...state.operation,
          selectedValue: Array.isArray(selected) && selected.length === 1 ? selected[0] : "",
          selectedValues: Array.isArray(selected) ? selected : [],
        };
      }
      const operationResult = window.SheetOperations.validate(task, operationState, operationSheet);
      if (!operationResult.ok) {
        setWrong(
          tr("operation.checkWrongTitle"),
          tr("operation.checkWrongBody", { reason: operationResult.reason }),
          step,
        );
        return;
      }
      if (task.operationOnly) {
        setCorrect(
          tr("feedback.operationCorrect"),
          lt(task.success) || tr("operation.success"),
          step,
        );
        return;
      }
    }
    const answerRange = Views.answerRangeForTask(task);
    const rangeLabel = task.targetRange || task.target;
    const expected = expectedFor(task);
    const formula = state.formulaInput.trim();
    const example = lt(task.formulaExample || "=SUM(A1:A5)");
    if (!formula) {
      setWrong(tr("sheet.emptyTitle"), tr("sheet.emptyBody", { target: task.target, example }), step);
      return;
    }
    if (!formula.startsWith("=")) {
      setWrong(tr("sheet.needEqualsTitle"), tr("sheet.needEqualsBody", { example }), step);
      return;
    }
    const normalized = Engine.normalizeFormula(formula);
    const required = taskFunctions(task);
    const used = usedFunctions(normalized);
    const missingFunctions = required.filter((name) => !used.includes(name));
    if (missingFunctions.length) {
      setWrong(
        tr("sheet.wrongFunctionTitle", { function: missingFunctions.join(" / ") }),
        tr("sheet.wrongFunctionBody", {
          function: missingFunctions.join(" / "),
          used: used.length ? used.join(", ") : tr("common.none"),
        }),
        step
      );
      return;
    }
    if (Array.isArray(task.requiredText) && task.requiredText.length) {
      const compactFormula = String(formula)
        .replace(/＝/g, "=")
        .replace(/（/g, "(")
        .replace(/）/g, ")")
        .replace(/，/g, ",")
        .replace(/\s+/g, "")
        .toUpperCase();
      const missingText = task.requiredText.filter((text) => !compactFormula.includes(String(text).toUpperCase()));
      if (missingText.length) {
        setWrong(
          tr("sheet.absoluteRequiredTitle"),
          tr("sheet.absoluteRequiredBody", { refs: missingText.join(", ") }),
          step
        );
        return;
      }
    }
    const exampleFormula = lt(task.formulaExample || "");
    const missingSources = exampleFormula
      ? AnswerEngine.missingSourceRefs(normalized, Engine.normalizeFormula(exampleFormula))
      : [];
    if (missingSources.length) {
      setWrong(tr("sheet.sourceRequiredTitle"), tr("sheet.sourceRequiredBody", {
        refs: missingSources.slice(0, 6).join(", "),
      }), step);
      return;
    }
    if (task.strictRefs && Array.isArray(task.sourceRefs) && task.sourceRefs.length) {
      const actualRefs = parseReferenceSet(normalized);
      const expectedRefs = task.sourceRefs.slice();
      const actualUnique = new Set(actualRefs);
      const expectedUnique = new Set(expectedRefs);
      const missingRefs = expectedRefs.filter((ref) => !actualUnique.has(ref));
      const extraRefs = actualRefs.filter((ref) => !expectedUnique.has(ref));
      const duplicateRefs = Array.from(new Set(actualRefs.filter((ref, index) => actualRefs.indexOf(ref) !== index)));
      if (duplicateRefs.length) {
        setWrong(tr("sheet.duplicateTitle"), tr("sheet.duplicateBody", { refs: duplicateRefs.join(", ") }), step);
        return;
      }
      if (missingRefs.length || extraRefs.length) {
        const rangeText = task.requiredRange || task.sourceRefs.join(", ");
        if (missingRefs.length && extraRefs.length) {
          setWrong(tr("sheet.rangeBothTitle"), tr("sheet.rangeBothBody", {
            range: rangeText,
            missing: missingRefs.join(", "),
            extra: extraRefs.join(", "),
          }), step);
        } else if (missingRefs.length) {
          setWrong(tr("sheet.rangeMissingTitle"), tr("sheet.rangeMissingBody", {
            range: rangeText,
            missing: missingRefs.join(", "),
          }), step);
        } else {
          setWrong(tr("sheet.rangeExtraTitle"), tr("sheet.rangeExtraBody", {
            range: rangeText,
            extra: extraRefs.join(", "),
          }), step);
        }
        return;
      }
    }
    syncShiftedAnswerFormulas(task);
    const formulas = state.sheetAnswerFormulas || {};
    const targetCells = answerRange ? answerRange.cells : [task.target];
    const missing = targetCells.filter((ref) => !String(formulas[ref] || "").trim());
    if (missing.length) {
      setWrong(tr("sheet.missingFillTitle"), tr("sheet.missingFillBody", {
        range: rangeLabel,
        count: missing.length,
        cells: missing.slice(0, 4).join(", "),
      }), step);
      return;
    }

    const sheet = task.sheetData || currentStep().sheetData || {};
    const anchor = targetCells[0];
    let checkedValue = expected;
    let checkedDisplay = Engine.formatValue(expected);
    for (const ref of targetCells) {
      const cellFormula = formulas[ref];
      const preview = Engine.evaluate(cellFormula, sheet, sheetEvaluationOptions());
      if (!preview.ok) {
        setWrong(tr("sheet.cellResultErrorTitle", { cell: ref }), tr("sheet.cellResultErrorBody", {
          cell: ref,
          error: preview.error,
        }), step);
        return;
      }
      const anchorMatch = /^([A-Z]+)(\d+)$/.exec(anchor);
      const cellMatch = /^([A-Z]+)(\d+)$/.exec(ref);
      const expectedFormula = anchorMatch && cellMatch
        ? translateFormula(example, Number(cellMatch[2]) - Number(anchorMatch[2]), columnNumber(cellMatch[1]) - columnNumber(anchorMatch[1]))
        : example;
      const expectedPreview = Engine.evaluate(expectedFormula, sheet, sheetEvaluationOptions());
      const cellExpected = ref === anchor ? expected : (expectedPreview.ok ? expectedPreview.value : undefined);
      if (!expectedPreview.ok && ref !== anchor) {
        setWrong(tr("sheet.resultErrorTitle"), tr("sheet.resultErrorBody", { error: expectedPreview.error }), step);
        return;
      }
      if (!valuesEqual(preview.value, cellExpected)) {
        if (targetCells.length > 1) {
          setWrong(tr("sheet.cellMismatchTitle", { cell: ref }), tr("sheet.cellMismatchBody", {
            cell: ref,
            actual: preview.display,
            expected: Engine.formatValue(cellExpected),
          }), step);
        } else {
          setWrong(tr("sheet.resultMismatchTitle"), tr("sheet.resultMismatchBody", {
            actual: preview.display,
            expected: Engine.formatValue(cellExpected),
          }), step);
        }
        return;
      }
      checkedValue = preview.value;
      checkedDisplay = preview.display;
    }
    let success = tr("sheet.successRange", { range: rangeLabel, count: targetCells.length });
    if (targetCells.length === 1) {
      const targetRow = (parseCell(task.target) || {}).row;
      const sourceRows = Array.from(new Set(
        parseReferenceSet(normalized)
          .map((ref) => (parseCell(ref) || {}).row)
          .filter((row) => row && row > 1),
      ));
      const sourceRow = sourceRows.length === 1 ? sourceRows[0] : null;
      const personName = sourceRow === targetRow ? lt(sheet["A" + sourceRow]) : "";
      success = personName
        ? tr("sheet.successDynamicPerson", {
          name: personName,
          target: task.target,
          value: Engine.formatValue(checkedValue),
        })
        : tr("sheet.successDynamic", {
          target: task.target,
          value: Engine.formatValue(checkedValue),
        });
    }
    setCorrect(tr("feedback.sheetCorrect"), success, step);
  }

  function focusFormulaInput() {
    if (window.innerWidth < 900) return;
    const input = document.getElementById("formulaInput");
    if (input && !input.readOnly) input.focus({ preventScroll: true });
  }

  function revealTargetCell() {
    if (window.innerWidth >= 900) return;
    const task = state.activeTask;
    const scroll = document.querySelector(".sheet-scroll");
    const target = task ? document.querySelector('[data-sheet-cell="' + task.target + '"]') : null;
    if (!scroll || !target) return;
    const scrollRect = scroll.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const relativeLeft = targetRect.left - scrollRect.left + scroll.scrollLeft;
    const nextLeft = Math.max(0, relativeLeft - (scroll.clientWidth - targetRect.width) / 2);
    scroll.scrollTo({ left: nextLeft, behavior: "auto" });
  }

  function updateSheetPreview() {
    const task = state.activeTask;
    if (!task) return;
    syncShiftedAnswerFormulas(task);
    const answerRange = Views.answerRangeForTask(task);
    const picked = state.pickedValue == null ? "" : String(state.pickedValue);
    const formula = picked ? picked : state.formulaInput.trim();
    const preview = picked ? null : formula.startsWith("=") ? Engine.evaluate(formula, task.sheetData, sheetEvaluationOptions()) : null;
    const result = document.getElementById("sheetPreview");
    const resultText = document.getElementById("sheetPreviewText");
    const formulas = state.sheetAnswerFormulas || {};
    if (result && resultText) {
      result.classList.remove("is-ok", "is-error");
      if (picked) resultText.textContent = tr("sheet.cellPicked", { cell: state.pickedCellRef || "" });
      else if (!formula) resultText.textContent = tr("sheet.waiting");
      else if (!formula.startsWith("=")) {
        result.classList.add("is-error");
        resultText.textContent = tr("sheet.needEquals");
      } else if (preview.ok) {
        result.classList.add("is-ok");
        const filled = answerRange ? answerRange.cells.filter((ref) => formulas[ref]).length : 1;
        resultText.textContent = answerRange && answerRange.isMulti
          ? tr("sheet.rangeLiveResult", { done: filled, total: answerRange.cells.length, value: preview.display })
          : tr("sheet.liveResult", { value: preview.display });
      } else {
        result.classList.add("is-error");
        resultText.textContent = tr("sheet.formulaError", { error: preview.error });
      }
    }
    const targetCells = answerRange ? answerRange.cells : [task.target];
    targetCells.forEach((ref) => {
      const target = document.querySelector('[data-sheet-cell="' + ref + '"]');
      if (!target) return;
      const span = target.querySelector(".cell-text");
      const cellFormula = String(formulas[ref] || "").trim();
      target.classList.remove("has-preview", "has-error", "is-empty", "is-pending-fill");
      if (!cellFormula) {
        target.classList.add(ref === task.target ? "is-empty" : "is-pending-fill");
        if (span) span.textContent = ref === task.target ? "" : "·";
      } else if (!cellFormula.startsWith("=")) {
        target.classList.add("has-error");
        if (span) span.textContent = "#VALUE!";
      } else {
        const cellPreview = Engine.evaluate(cellFormula, task.sheetData, sheetEvaluationOptions());
        if (cellPreview.ok) {
          target.classList.add("has-preview");
          if (span) span.textContent = cellPreview.display;
        } else {
          target.classList.add("has-error");
          if (span) span.textContent = cellPreview.error;
        }
      }
    });
  }

  function toggleFormulaMenu() {
    const step = currentStep();
    if (!step || step.type !== "sheet") return;
    if (state.operation) state.operation.toolMenu = "";
    state.formulaMenuOpen = !state.formulaMenuOpen;
    renderLesson(false);
  }

  function closeFormulaMenu() {
    state.formulaMenuOpen = false;
    const menu = document.getElementById("formulaMenu");
    const trigger = document.querySelector('[data-action="toggle-formula-menu"]');
    if (menu) menu.hidden = true;
    if (trigger) {
      trigger.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    }
  }

  function looksLikePlainReferences(value) {
    const normalized = Engine.normalizeFormula(value);
    return /^[A-Z]{1,3}\d+(?::[A-Z]{1,3}\d+)?(?:,[A-Z]{1,3}\d+(?::[A-Z]{1,3}\d+)?)*$/.test(normalized);
  }

  function insertFunctionFormula(name) {
    const input = document.getElementById("formulaInput");
    if (!input || input.readOnly) return;
    closeFormulaMenu();
    if (state.pickedValue != null) {
      clearPickedSelection();
      input.value = "";
      state.formulaInput = "";
    }
    const current = input.value;
    const trimmed = current.trim();
    let formula;
    let caret;
    if (!trimmed || trimmed === "=") {
      formula = "=" + name + "()";
      caret = formula.length - 1;
    } else if (looksLikePlainReferences(trimmed)) {
      formula = "=" + name + "(" + trimmed + ")";
      caret = formula.length - 1;
    } else {
      const callMatch = /^=\s*([A-Z][A-Z0-9.]*)\(([^()]*)\)$/i.exec(trimmed);
      const openCallMatch = /^=\s*([A-Z][A-Z0-9.]*)\(([^()]*)$/i.exec(trimmed);
      if (callMatch || openCallMatch) {
        const args = callMatch ? callMatch[2] : openCallMatch[2];
        formula = "=" + name + "(" + args + ")";
        caret = formula.length - 1;
      } else {
        const start = input.selectionStart == null ? current.length : input.selectionStart;
        const end = input.selectionEnd == null ? current.length : input.selectionEnd;
        formula = current.slice(0, start) + name + "()" + current.slice(end);
        if (!formula.trim().startsWith("=")) formula = "=" + formula;
        caret = start + name.length + 1;
      }
    }
    input.value = formula;
    state.formulaInput = formula;
    state.formulaEditingActive = true;
    state.formulaEditRevision += 1;
    state.lastReferenceInsertion = null;
    state.formulaCaret = { start: caret, end: caret };
    input.focus({ preventScroll: true });
    input.setSelectionRange(caret, caret);
    window.requestAnimationFrame(() => {
      if (document.getElementById("formulaInput") !== input || input.readOnly) return;
      input.setSelectionRange(caret, caret);
      state.formulaCaret = { start: caret, end: caret };
    });
    updateSheetPreview();
    showToast(tr("toast.functionInserted", { name }));
  }

  function shouldAutoCloseParen(selection) {
    const input = document.getElementById("formulaInput");
    if (!input) return false;
    const start = selection && Number.isInteger(selection.start)
      ? selection.start
      : input.selectionStart == null ? input.value.length : input.selectionStart;
    const end = selection && Number.isInteger(selection.end)
      ? selection.end
      : input.selectionEnd == null ? input.value.length : input.selectionEnd;
    const before = input.value.slice(0, start).replace(/"[^"]*"/g, "");
    const after = input.value.slice(end);
    const opens = (before.match(/\(/g) || []).length;
    const closes = (before.match(/\)/g) || []).length;
    return opens > closes && after.trim() === "";
  }

  function insertFormulaText(text, selection, options) {
    const input = document.getElementById("formulaInput");
    if (!input || input.readOnly) return null;
    const config = Object.assign({ focus: true, silent: false }, options || {});
    const insertion = text + (shouldAutoCloseParen(selection) ? ")" : "");
    const start = selection && Number.isInteger(selection.start)
      ? selection.start
      : state.formulaCaret && Number.isInteger(state.formulaCaret.start) ? state.formulaCaret.start
        : input.selectionStart == null ? input.value.length : input.selectionStart;
    const end = selection && Number.isInteger(selection.end)
      ? selection.end
      : state.formulaCaret && Number.isInteger(state.formulaCaret.end) ? state.formulaCaret.end
        : input.selectionEnd == null ? input.value.length : input.selectionEnd;
    input.value = input.value.slice(0, start) + insertion + input.value.slice(end);
    state.formulaInput = input.value;
    if (config.focus) input.focus({ preventScroll: true });
    const next = start + insertion.length;
    input.setSelectionRange(next, next);
    state.formulaCaret = { start: next, end: next };
    updateSheetPreview();
    if (!config.silent) showToast(tr("toast.inserted", { value: text }));
    return { start, end: start + insertion.length, tokenEnd: start + text.length };
  }

  function updateSheetActionState() {
    const button = document.querySelector('[data-action="check-sheet"]');
    if (button) button.disabled = !state.formulaInput.trim().startsWith("=");
  }

  function setFormulaValue(value, caret) {
    const input = document.getElementById("formulaInput");
    state.formulaInput = value;
    clearPickedSelection();
    if (input) {
      input.value = value;
      if (Number.isInteger(caret)) input.setSelectionRange(caret, caret);
    }
    updateSheetPreview();
    updateSheetActionState();
  }

  function currentRangeReference(start, end) {
    return Views.rangeReference(start, end);
  }

  function clearSelectionChip() {
    const chip = document.getElementById("selectionChip");
    if (chip) {
      chip.hidden = true;
      chip.textContent = "";
    }
  }

  function showSelectionChip(text) {
    const chip = document.getElementById("selectionChip");
    if (!chip) return;
    chip.textContent = text || "";
    chip.hidden = !text;
  }

  function removeTouchHandle() {
    document.querySelectorAll(".touch-fill-handle").forEach((handle) => handle.remove());
  }

  function clearTableHighlights() {
    document.querySelectorAll(".sheet-table td").forEach((cell) => {
      cell.classList.remove("is-drag-selected", "is-drag-anchor", "is-touch-selected", "is-fill-preview", ...RANGE_EDGE_CLASSES);
    });
    document.querySelectorAll(".sheet-table th.is-header-selected").forEach((header) => header.classList.remove("is-header-selected"));
    removeTouchHandle();
    document.body.classList.remove("is-dragging-range", "is-touch-dragging");
    document.querySelectorAll(".sheet-table.is-dragging").forEach((table) => table.classList.remove("is-dragging"));
  }

  function cancelDragSelection() {
    dragSelection = null;
    document.body.classList.remove("is-dragging-range");
    document.querySelectorAll(".sheet-table.is-dragging").forEach((table) => table.classList.remove("is-dragging"));
  }

  function clearTouchSelection() {
    touchHandleDrag = null;
    removeTouchHandle();
    document.body.classList.remove("is-touch-dragging");
  }

  function ensureTouchHandle(ref) {
    if (!ref || state.feedback && state.feedback.type === "correct") return;
    const touchLayout = lastPointerType === "touch" || window.innerWidth <= 900 || navigator.maxTouchPoints > 0;
    if (!touchLayout) return;
    const cell = document.querySelector('[data-cell="' + ref + '"]');
    if (!cell) return;
    removeTouchHandle();
    const handle = document.createElement("span");
    handle.className = "touch-fill-handle";
    handle.setAttribute("role", "button");
    handle.setAttribute("tabindex", "-1");
    handle.setAttribute("aria-label", tr("sheet.dragHandle"));
    handle.dataset.touchHandle = "true";
    cell.appendChild(handle);
  }

  function parseCell(value) {
    const match = /^([A-Z]+)(\d+)$/.exec(String(value || "").toUpperCase());
    return match ? { col: columnNumber(match[1]), row: Number(match[2]) } : null;
  }

  function formulaInputIsActive() {
    const input = document.getElementById("formulaInput");
    return Boolean(input && document.activeElement === input && !input.readOnly);
  }

  function captureFormulaCaret() {
    const input = document.getElementById("formulaInput");
    if (!input || input.readOnly) return false;
    if (document.activeElement === input) {
      const length = input.value.length;
      const next = {
        start: input.selectionStart == null ? length : input.selectionStart,
        end: input.selectionEnd == null ? length : input.selectionEnd,
      };
      state.formulaCaret = next;
    }
    return state.formulaEditingActive;
  }

  function markRangeVisual(startRef, endRef, touch, anchorRef) {
    const start = parseCell(startRef);
    const end = parseCell(endRef);
    if (!start || !end) return;
    const top = Math.min(start.row, end.row);
    const bottom = Math.max(start.row, end.row);
    const left = Math.min(start.col, end.col);
    const right = Math.max(start.col, end.col);
    for (let row = top; row <= bottom; row += 1) {
      for (let col = left; col <= right; col += 1) {
        const ref = columnLetters(col) + row;
        const cell = document.querySelector('.sheet-table td[data-cell="' + ref + '"]');
        if (!cell) continue;
        cell.classList.add(touch ? "is-touch-selected" : "is-drag-selected");
        if (row === top) cell.classList.add("is-range-top");
        if (row === bottom) cell.classList.add("is-range-bottom");
        if (col === left) cell.classList.add("is-range-left");
        if (col === right) cell.classList.add("is-range-right");
      }
    }
    if (anchorRef && !touch) {
      const anchor = document.querySelector('.sheet-table td[data-cell="' + anchorRef + '"]');
      if (anchor) anchor.classList.add("is-drag-anchor");
    }
  }

  function selectionRanges(selection) {
    if (!selection) return [];
    if (Array.isArray(selection.ranges) && selection.ranges.length) {
      return selection.ranges.map((range) => ({ startRef: range.startRef, endRef: range.endRef }));
    }
    if (selection.rangeStart && selection.rangeEnd) {
      return [{ startRef: selection.rangeStart, endRef: selection.rangeEnd }];
    }
    return [];
  }

  function selectionToken(ranges) {
    return ranges.map((range) => Views.rangeReference(range.startRef, range.endRef)).join(",");
  }

  function selectionRangesFromToken(token) {
    return String(token || "").split(",").map((part) => {
      const refs = part.replace(/\$/g, "").split(":");
      return { startRef: refs[0], endRef: refs[refs.length - 1] };
    }).filter((range) => parseCell(range.startRef) && parseCell(range.endRef));
  }

  function renderSelectionRanges(ranges, touch, showHandle, anchorRef) {
    clearTableHighlights();
    if (!Array.isArray(ranges) || !ranges.length) return;
    ranges.forEach((range) => markRangeVisual(range.startRef, range.endRef, touch, anchorRef));
    showSelectionChip(selectionToken(ranges));
    if (touch && showHandle) ensureTouchHandle(ranges[ranges.length - 1].endRef);
  }

  function displayRange(start, end, touch, showHandle) {
    if (!start || !end) return;
    renderSelectionRanges([{ startRef: start, endRef: end }], touch, showHandle, start);
  }

  function groupLinearCells(cells) {
    const groups = [];
    let current = [];
    const flush = () => {
      if (!current.length) return;
      groups.push({ cells: current.slice(), startRef: current[0], endRef: current[current.length - 1] });
      current = [];
    };
    cells.forEach((ref) => {
      const cell = parseCell(ref);
      if (!cell) return;
      if (current.length) {
        const previous = parseCell(current[current.length - 1]);
        const consecutive = previous && (
          (previous.row === cell.row && cell.col === previous.col + 1) ||
          (previous.col === cell.col && cell.row === previous.row + 1)
        );
        if (!consecutive) flush();
      }
      current.push(ref);
    });
    flush();
    return groups;
  }

  function headerSelectionRanges(kind, index, task, sheet) {
    const bounds = Views.sheetBounds(sheet, []);
    const answerRange = Views.answerRangeForTask(task);
    const cells = [];
    if (kind === "column") {
      const startRow = bounds.maxRow > 1 ? 2 : 1;
      for (let row = startRow; row <= bounds.maxRow; row += 1) cells.push(columnLetters(index) + row);
    } else {
      for (let col = 1; col <= bounds.maxCol; col += 1) cells.push(columnLetters(col) + index);
    }
    return groupLinearCells(cells.filter((ref) => !answerRange || !Views.inRange(ref, answerRange.startRef, answerRange.endRef)));
  }

  function highlightHeaderSelection(ranges, kind, index) {
    clearTableHighlights();
    ranges.forEach((range) => markRangeVisual(range.startRef, range.endRef, false, range.startRef));
    const header = document.querySelector('.sheet-table th[data-select-' + (kind === "column" ? "col" : "row") + '="' + index + '"]');
    if (header) header.classList.add("is-header-selected");
  }

  function selectSheetHeader(kind, index, options) {
    const task = state.activeTask;
    if (!task || state.feedback && state.feedback.type === "correct") return;
    const ranges = headerSelectionRanges(kind, index, task, task.sheetData || currentStep().sheetData || {});
    if (!ranges.length) {
      showToast(tr("toast.noHeaderCells"));
      return;
    }
    const token = ranges.map((range) => Views.rangeReference(range.startRef, range.endRef)).join(",");
    const shouldInsert = options && options.insert !== undefined ? Boolean(options.insert) : formulaInputIsActive();
    if (!shouldInsert) {
      state.pickedRanges = ranges.slice();
      state.pickedCellRef = ranges[0].startRef;
      state.pickedValue = cellDisplayValue(ranges[0].startRef);
      highlightHeaderSelection(ranges, kind, index);
      showSelectionChip(token);
      return;
    }
    const inserted = insertReferenceToken(token, { replaceRange: Boolean(state.sheetSelection), rememberRange: false });
    if (!inserted) return;
    highlightHeaderSelection(ranges, kind, index);
    showSelectionChip(token);
    showToast(tr("toast.rangeInserted", { range: token }));
  }

  function autoFillAnswerRange(endRef) {
    const task = state.activeTask;
    if (!task) return;
    const answerRange = Views.answerRangeForTask(task);
    const anchor = parseCell(task.target);
    const end = parseCell(endRef);
    if (!answerRange || !anchor || !end) return;
    const top = Math.max(answerRange.top, Math.min(anchor.row, end.row));
    const bottom = Math.min(answerRange.bottom, Math.max(anchor.row, end.row));
    const left = Math.max(answerRange.left, Math.min(anchor.col, end.col));
    const right = Math.min(answerRange.right, Math.max(anchor.col, end.col));
    const anchorFormula = state.formulaInput.trim();
    if (!anchorFormula) {
      showToast(tr("sheet.fillFirst"));
      return;
    }
    let count = 0;
    for (let row = top; row <= bottom; row += 1) {
      for (let col = left; col <= right; col += 1) {
        const ref = columnLetters(col) + row;
        state.sheetAnswerFormulas[ref] = translateFormula(anchorFormula, row - anchor.row, col - anchor.col);
        count += 1;
      }
    }
    state.sheetFillEnd = columnLetters(right) + bottom;
    clearTableHighlights();
    updateSheetPreview();
    updateSheetActionState();
    showToast(tr("toast.autoFilled", { count }));
  }

  function displayFillPreview(startRef, endRef, task) {
    clearTableHighlights();
    const answerRange = Views.answerRangeForTask(task);
    const start = parseCell(startRef);
    const end = parseCell(endRef);
    if (!answerRange || !start || !end) return;
    const top = Math.max(answerRange.top, Math.min(start.row, end.row));
    const bottom = Math.min(answerRange.bottom, Math.max(start.row, end.row));
    const left = Math.max(answerRange.left, Math.min(start.col, end.col));
    const right = Math.min(answerRange.right, Math.max(start.col, end.col));
    for (let row = top; row <= bottom; row += 1) {
      for (let col = left; col <= right; col += 1) {
        const cell = document.querySelector('.sheet-table td[data-sheet-cell="' + columnLetters(col) + row + '"]');
        if (cell) cell.classList.add("is-fill-preview");
      }
    }
    showSelectionChip(Views.rangeReference(columnLetters(left) + top, columnLetters(right) + bottom));
  }

  function referenceTokens(formula) {
    const stripped = String(formula || "").replace(/"[^"]*"/g, "");
    return stripped.match(/\$?[A-Za-z]{1,3}\$?\d{1,7}(?::\$?[A-Za-z]{1,3}\$?\d{1,7})?/g) || [];
  }

  function highlightFormulaSelection(touch) {
    const tokens = referenceTokens(state.formulaInput);
    const ranges = tokens.map((token) => {
      const parts = token.replace(/\$/g, "").split(":");
      return { startRef: parts[0], endRef: parts[parts.length - 1] };
    }).filter((range) => parseCell(range.startRef) && parseCell(range.endRef));
    if (!ranges.length) {
      clearTableHighlights();
      return;
    }
    clearTableHighlights();
    ranges.forEach((range) => markRangeVisual(range.startRef, range.endRef, touch, range.startRef));
    showSelectionChip(tokens.join(", "));
  }

  function restoreSheetSelection() {
    const step = currentStep();
    if (!step || step.type !== "sheet" || !state.activeTask) return;
    if (state.feedback && state.feedback.type === "correct") {
      clearSelectionChip();
      clearTableHighlights();
      return;
    }
    if (state.pickedRanges.length && state.pickedValue != null) {
      renderSelectionRanges(state.pickedRanges, false, false, state.pickedRanges[0].startRef);
      return;
    }
    if (state.sheetSelection && currentSheetMode() !== "points") {
      const ranges = selectionRanges(state.sheetSelection);
      if (ranges.length) {
        renderSelectionRanges(ranges, true, true, state.sheetSelection.anchorRef);
        return;
      }
    }
    if (state.formulaInput) highlightFormulaSelection(true);
  }

  function currentSheetMode() {
    return state.activeTask ? state.activeTask.mode : "range";
  }

  function findReferenceOccurrence(formula, ref) {
    return SheetSelection.findOccurrence(formula, ref);
  }

  function insertReferenceToken(token, options) {
    const input = document.getElementById("formulaInput");
    if (!input || input.readOnly) return null;
    clearPickedSelection();
    const config = Object.assign({ replaceRange: false, rememberRange: false }, options || {});
    const formula = input.value || "";
    let caret = state.formulaCaret && Number.isInteger(state.formulaCaret.start)
      ? { start: state.formulaCaret.start, end: Number.isInteger(state.formulaCaret.end) ? state.formulaCaret.end : state.formulaCaret.start }
      : { start: input.selectionStart == null ? formula.length : input.selectionStart, end: input.selectionEnd == null ? formula.length : input.selectionEnd };
    const lastInsertion = state.lastReferenceInsertion;
    let previous = config.replaceRange && lastInsertion &&
      lastInsertion.revision === state.formulaEditRevision &&
      formula === lastInsertion.formula &&
      formula.slice(lastInsertion.start, lastInsertion.end) === lastInsertion.token
      ? { start: lastInsertion.start, end: lastInsertion.end, token: lastInsertion.token }
      : config.replaceRange && state.sheetSelection &&
      Number.isInteger(state.sheetSelection.start) && Number.isInteger(state.sheetSelection.end) &&
      caret.start === state.sheetSelection.end
      ? { start: state.sheetSelection.start, end: state.sheetSelection.end, token: state.sheetSelection.token }
      : null;
    if (previous) caret = { start: previous.end, end: previous.end };
    const result = SheetSelection.insertFormulaToken(formula, Object.assign({}, caret, { previous }), token, { replaceToken: Boolean(previous) });

    input.value = result.formula;
    input.focus({ preventScroll: true });
    input.setSelectionRange(result.caret, result.caret);
    state.formulaInput = result.formula;
    state.formulaCaret = { start: result.caret, end: result.caret };
    state.lastReferenceInsertion = {
      start: result.tokenStart,
      end: result.tokenEnd,
      token,
      revision: state.formulaEditRevision,
      formula: result.formula,
    };
    if (config.rememberRange) {
      const nextRanges = selectionRangesFromToken(token);
      state.sheetSelection = {
        start: result.tokenStart,
        end: result.tokenEnd,
        token,
        rangeStart: nextRanges[0] ? nextRanges[0].startRef : token,
        rangeEnd: nextRanges.length ? nextRanges[nextRanges.length - 1].endRef : token,
        ranges: nextRanges,
        anchorRef: nextRanges[0] ? nextRanges[0].startRef : token,
      };
    } else {
      state.sheetSelection = null;
    }
    updateSheetPreview();
    updateSheetActionState();
    return { start: result.tokenStart, end: result.tokenEnd, token };
  }

  function removeReferenceToken(ref) {
    const input = document.getElementById("formulaInput");
    if (!input || input.readOnly) return false;
    const formula = input.value;
    const occurrence = findReferenceOccurrence(formula, ref);
    if (!occurrence) return false;
    let start = occurrence.start;
    let end = occurrence.end;
    const before = formula.slice(0, start);
    const after = formula.slice(end);
    if (/,\s*$/.test(before)) {
      start = before.lastIndexOf(",");
    } else {
      const followingComma = /^\s*,/.exec(after);
      if (followingComma) end += followingComma[0].length;
    }
    const next = formula.slice(0, start) + formula.slice(end);
    setFormulaValue(next, Math.max(0, start));
    state.sheetSelection = null;
    return true;
  }

  function cellDisplayValue(ref) {
    const task = state.activeTask;
    const sheet = task ? task.sheetData || {} : {};
    const value = sheet[ref];
    return value == null ? "" : String(value);
  }

  function clearPickedSelection() {
    state.pickedValue = null;
    state.pickedCellRef = null;
    state.pickedRanges = [];
  }

  function showPickedRanges(ranges, anchorRef, displayRef) {
    const list = Array.isArray(ranges) ? ranges.slice() : [];
    const anchor = anchorRef || (list[0] && list[0].startRef) || displayRef;
    const display = displayRef || (list[list.length - 1] && list[list.length - 1].startRef) || anchor;
    state.pickedRanges = list;
    state.pickedCellRef = display;
    state.pickedValue = cellDisplayValue(display);
    const input = document.getElementById("formulaInput");
    if (input && !input.readOnly) {
      input.value = state.pickedValue;
      input.setSelectionRange(state.pickedValue.length, state.pickedValue.length);
    }
    renderSelectionRanges(list, false, false, anchor);
    updateSheetPreview();
    const checkButton = document.querySelector('[data-action="check-sheet"]');
    if (checkButton) checkButton.disabled = true;
  }

  function selectMultipleSourceCells(ref, options) {
    const previousRanges = selectionRanges(state.sheetSelection);
    const shiftKey = Boolean(options && options.shiftKey);
    const additive = Boolean(options && (options.ctrlKey || options.metaKey));
    let ranges;
    let anchorRef = ref;
    if (shiftKey && previousRanges.length) {
      ranges = previousRanges.map((range) => Object.assign({}, range));
      const lastIndex = ranges.length - 1;
      const origin = ranges[lastIndex].startRef || ref;
      ranges[lastIndex] = { startRef: origin, endRef: ref };
      anchorRef = state.sheetSelection && state.sheetSelection.anchorRef || ranges[0].startRef;
    } else if (additive) {
      ranges = previousRanges.concat([{ startRef: ref, endRef: ref }]);
      anchorRef = state.sheetSelection && state.sheetSelection.anchorRef || ranges[0].startRef;
    } else {
      ranges = [{ startRef: ref, endRef: ref }];
    }
    const token = selectionToken(ranges);
    const inserted = insertReferenceToken(token, {
      replaceRange: Boolean(state.sheetSelection),
      rememberRange: false,
    });
    if (!inserted) return;
    state.sheetSelection = {
      start: inserted.start,
      end: inserted.end,
      token,
      rangeStart: ranges[0].startRef,
      rangeEnd: ranges[ranges.length - 1].endRef,
      ranges,
      anchorRef,
    };
    renderSelectionRanges(ranges, true, true, anchorRef);
    showToast(tr("toast.rangeInserted", { range: token }));
  }

  function selectSourceCell(ref, options) {
    if (!state.activeTask || state.feedback && state.feedback.type === "correct") return;
    const editing = options && options.editing !== undefined ? Boolean(options.editing) : state.cellClickEditing;
    if (!editing) {
      const additive = Boolean(options && (options.ctrlKey || options.metaKey));
      const shiftKey = Boolean(options && options.shiftKey);
      if (additive) {
        const ranges = state.pickedRanges.concat([{ startRef: ref, endRef: ref }]);
        showPickedRanges(ranges, state.pickedRanges[0] ? state.pickedRanges[0].startRef : ref, ref);
      } else if (shiftKey && state.pickedRanges.length) {
        const ranges = state.pickedRanges.slice();
        const lastIndex = ranges.length - 1;
        ranges[lastIndex] = { startRef: ranges[lastIndex].startRef || ref, endRef: ref };
        showPickedRanges(ranges, state.pickedRanges[0].startRef, ranges[lastIndex].startRef);
      } else {
        showPickedRanges([{ startRef: ref, endRef: ref }], ref, ref);
      }
      return;
    }
    clearPickedSelection();
    if (currentSheetMode() === "points") {
      if (findReferenceOccurrence(state.formulaInput, ref)) {
        removeReferenceToken(ref);
        showToast(tr("toast.refRemoved", { cell: ref }));
      } else {
        insertReferenceToken(ref, { rememberRange: false });
        showToast(tr("toast.refAdded", { cell: ref }));
      }
      highlightFormulaSelection(true);
      return;
    }

    if (options && (options.shiftKey || options.ctrlKey || options.metaKey)) {
      selectMultipleSourceCells(ref, options);
      return;
    }

    const hadSelection = Boolean(state.sheetSelection);
    const inserted = insertReferenceToken(ref, { replaceRange: true, rememberRange: true });
    if (!inserted) return;
    if (state.sheetSelection) {
      state.sheetSelection.rangeStart = ref;
      state.sheetSelection.rangeEnd = ref;
      state.sheetSelection.ranges = [{ startRef: ref, endRef: ref }];
      state.sheetSelection.anchorRef = ref;
    }
    displayRange(ref, ref, true, true);
    showToast(tr(hadSelection ? "toast.changed" : "toast.selected", { cell: ref }));
  }

  function finishRangeSelection(endRef, explicitStart, editing) {
    if (!state.activeTask) return;
    const shouldEdit = editing !== undefined ? Boolean(editing) : state.cellClickEditing;
    const hasSelection = state.sheetSelection;
    const startRef = explicitStart || (hasSelection ? hasSelection.rangeStart : endRef);
    if (!shouldEdit) {
      showPickedRanges([{ startRef, endRef }], startRef, startRef);
      return;
    }
    clearPickedSelection();
    const token = currentRangeReference(startRef, endRef);
    const inserted = insertReferenceToken(token, {
      replaceRange: Boolean(hasSelection),
      rememberRange: true,
    });
    if (!inserted) return;
    if (state.sheetSelection) {
      state.sheetSelection.rangeStart = startRef;
      state.sheetSelection.rangeEnd = endRef;
      state.sheetSelection.ranges = [{ startRef, endRef }];
      state.sheetSelection.anchorRef = startRef;
    }
    displayRange(startRef, endRef, true, true);
    showToast(tr("toast.rangeInserted", { range: token }));
  }

  function tableCellFromPoint(x, y) {
    const element = document.elementFromPoint(x, y);
    return element ? element.closest('.sheet-table td[data-cell]') : null;
  }

  function answerCellFromPoint(x, y) {
    const element = document.elementFromPoint(x, y);
    return element ? element.closest('.sheet-table td[data-sheet-cell]') : null;
  }

  function handlePointerMove(event) {
    if (fillHandleDrag) {
      const cell = answerCellFromPoint(event.clientX, event.clientY);
      if (cell && cell.dataset.sheetCell !== fillHandleDrag.current) {
        fillHandleDrag.current = cell.dataset.sheetCell;
        fillHandleDrag.moved = true;
        displayFillPreview(fillHandleDrag.anchor, fillHandleDrag.current, state.activeTask);
      }
      event.preventDefault();
      return;
    }
    if (touchHandleDrag) {
      const cell = tableCellFromPoint(event.clientX, event.clientY);
      if (cell && cell.dataset.cell !== touchHandleDrag.current) {
        touchHandleDrag.current = cell.dataset.cell;
        touchHandleDrag.moved = true;
        displayRange(touchHandleDrag.anchor, touchHandleDrag.current, true, false);
      }
      event.preventDefault();
      return;
    }
    if (!dragSelection) return;
    const distance = Math.abs(event.clientX - dragSelection.x) + Math.abs(event.clientY - dragSelection.y);
    if (distance < 5 && !dragSelection.moved) return;
    dragSelection.moved = true;
    event.preventDefault();
    document.body.classList.add("is-dragging-range");
    const table = document.querySelector(".sheet-table");
    if (table) table.classList.add("is-dragging");
    const cell = tableCellFromPoint(event.clientX, event.clientY);
    if (cell && cell.dataset.cell !== dragSelection.current) {
      dragSelection.current = cell.dataset.cell;
      if (dragSelection.editing) displayRange(dragSelection.anchor, dragSelection.current, false, false);
      else showPickedRanges([{ startRef: dragSelection.anchor, endRef: dragSelection.current }], dragSelection.anchor, dragSelection.anchor);
    }
  }

  function handlePointerUp(event) {
    if (fillHandleDrag) {
      const dragging = fillHandleDrag;
      const cell = answerCellFromPoint(event.clientX, event.clientY);
      if (cell) dragging.current = cell.dataset.sheetCell;
      fillHandleDrag = null;
      document.body.classList.remove("is-auto-filling");
      suppressCellClickUntil = Date.now() + 350;
      if (dragging.moved) autoFillAnswerRange(dragging.current);
      else {
        clearTableHighlights();
        updateSheetPreview();
      }
      return;
    }
    if (touchHandleDrag) {
      const dragging = touchHandleDrag;
      const cell = tableCellFromPoint(event.clientX, event.clientY);
      if (cell) dragging.current = cell.dataset.cell;
      touchHandleDrag = null;
      suppressCellClickUntil = Date.now() + 350;
      if (dragging.moved) finishRangeSelection(dragging.current, undefined, dragging.editing);
      else restoreSheetSelection();
      return;
    }
    if (!dragSelection) return;
    const dragging = dragSelection;
    dragSelection = null;
    document.body.classList.remove("is-dragging-range");
    const table = document.querySelector(".sheet-table");
    if (table) table.classList.remove("is-dragging");
    if (!dragging.moved) return;
    suppressCellClickUntil = Date.now() + 350;
    finishRangeSelection(dragging.current, dragging.anchor, dragging.editing);
  }

  function handlePointerDown(event) {
    headerHadFormulaFocus = false;
    const autoFillHandle = event.target.closest("[data-auto-fill-handle]");
    if (autoFillHandle) {
      event.preventDefault();
      event.stopPropagation();
      const task = state.activeTask;
      if (!task || !state.formulaInput.trim()) {
        showToast(tr("sheet.fillFirst"));
        focusFormulaInput();
        return;
      }
      fillHandleDrag = {
        anchor: task.target,
        current: task.target,
        moved: false,
      };
      document.body.classList.add("is-auto-filling");
      displayFillPreview(task.target, task.target, task);
      return;
    }
    const handle = event.target.closest(".touch-fill-handle");
    if (handle) {
      event.preventDefault();
      event.stopPropagation();
      state.cellClickEditing = captureFormulaCaret();
      const anchor = state.sheetSelection ? state.sheetSelection.rangeStart : null;
      const current = state.sheetSelection ? state.sheetSelection.rangeEnd : null;
      if (!anchor) return;
      touchHandleDrag = { anchor, current, moved: false, editing: state.cellClickEditing };
      document.body.classList.add("is-touch-dragging");
      return;
    }
    const header = event.target.closest(".sheet-table th[data-select-row], .sheet-table th[data-select-col]");
    if (header) {
      headerHadFormulaFocus = captureFormulaCaret();
      return;
    }
    const cell = event.target.closest('.sheet-table td[data-cell]');
    if (!cell) return;
    lastPointerType = event.pointerType || "mouse";
    state.cellClickEditing = captureFormulaCaret();
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    event.preventDefault();
    const selection = window.getSelection ? window.getSelection() : null;
    if (selection && selection.removeAllRanges) selection.removeAllRanges();
    dragSelection = {
      anchor: cell.dataset.cell,
      current: cell.dataset.cell,
      x: event.clientX,
      y: event.clientY,
      moved: false,
      editing: state.cellClickEditing,
    };
  }

  function backupProgressRecord(raw) {
    const record = normalizeSavedRecord(raw);
    const mistakesByStep = {};
    Object.entries(record.mistakesByStep).forEach(([id, count]) => {
      const value = Number(count);
      if (Number.isFinite(value) && value > 0) mistakesByStep[id] = value;
    });
    return {
      currentLevelId: record.currentLevelId,
      currentDateKey: record.currentDateKey,
      stepIndex: record.stepIndex,
      completedLevels: record.completedLevels,
      completedSteps: record.completedSteps,
      completedDates: record.completedDates,
      mistakesByStep,
    };
  }

  function buildProgressBackup() {
    if (state.screen === "mode" && state.activeMode) saveProgress();
    const practiceStore = readPracticeStore();
    return {
      app: "EXCEL-land",
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
    appVersion: APP_VERSION,
      settings: {
        soundEnabled: settings.soundEnabled !== false,
        language: I18N.normalizeLanguage(settings.language),
        unlockAll: settings.unlockAll === true,
      },
      modes: {
        course: backupProgressRecord(readCourseProgressRecord()),
        comprehensive: backupProgressRecord(practiceStore.comprehensive),
        daily: backupProgressRecord(practiceStore.daily),
      },
    };
  }

  function validateProgressBackup(payload) {
    if (!payload || typeof payload !== "object") throw new Error("invalid-backup");
    if (payload.format !== BACKUP_FORMAT || payload.version !== BACKUP_VERSION) throw new Error("invalid-backup");
    if (!payload.settings || typeof payload.settings !== "object") throw new Error("invalid-backup");
    if (!payload.modes || typeof payload.modes !== "object") throw new Error("invalid-backup");
    const validateRecord = (record, name) => {
      if (!record || typeof record !== "object") throw new Error("invalid-backup");
      ["completedLevels", "completedSteps", "completedDates"].forEach((key) => {
        if (record[key] != null && !Array.isArray(record[key])) throw new Error("invalid-backup");
      });
      if (record.stepIndex != null && !Number.isInteger(record.stepIndex)) throw new Error("invalid-backup");
      if (record.mistakesByStep != null && typeof record.mistakesByStep !== "object") throw new Error("invalid-backup");
      return backupProgressRecord(record);
    };
    return {
      settings: {
        soundEnabled: payload.settings.soundEnabled !== false,
        language: I18N.normalizeLanguage(payload.settings.language),
        unlockAll: payload.settings.unlockAll === true,
      },
      modes: {
        course: validateRecord(payload.modes.course, "course"),
        comprehensive: validateRecord(payload.modes.comprehensive, "comprehensive"),
        daily: validateRecord(payload.modes.daily, "daily"),
      },
    };
  }

  function applyProgressBackup(payload) {
    const backup = validateProgressBackup(payload);
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(backup.modes.course));
      localStorage.setItem(PRACTICE_PROGRESS_KEY, JSON.stringify({
        comprehensive: backup.modes.comprehensive,
        daily: backup.modes.daily,
      }));
      settings.soundEnabled = backup.settings.soundEnabled;
      settings.language = backup.settings.language;
      settings.unlockAll = backup.settings.unlockAll;
      I18N.setLanguage(settings.language);
      SoundFX.setEnabled(settings.soundEnabled);
      saveSettings();
    } catch (error) {
      throw new Error("backup-storage");
    }
    closeCompletion();
    closeSettings();
    state.screen = "select";
    state.activeMode = null;
    showModeScreen();
    showToast(tr("settings.importSuccess"));
    return true;
  }

  function downloadProgressBackup() {
    const payload = buildProgressBackup();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const now = new Date();
    const date = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
    link.href = url;
    link.download = "excel-land-progress-" + date + ".json";
    link.hidden = true;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(tr("settings.exported"));
  }

  function readFileText(file) {
    if (file && typeof file.text === "function") return file.text();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error || new Error("read-failed"));
      reader.readAsText(file);
    });
  }

  async function importProgressFile(file) {
    if (!file) return;
    const input = document.getElementById("progressImportInput");
    try {
      if (file.size > MAX_BACKUP_SIZE) throw new Error("invalid-backup");
      const payload = JSON.parse(await readFileText(file));
      validateProgressBackup(payload);
      if (!window.confirm(tr("settings.importConfirm"))) return;
      applyProgressBackup(payload);
    } catch (error) {
      showToast(tr(error && error.message === "backup-storage" ? "settings.importFailed" : "settings.importInvalid"));
    } finally {
      if (input) input.value = "";
    }
  }

  function renderSettingsContent() {
    const modal = document.getElementById("settingsModal");
    if (!modal) return;
    modal.innerHTML = Views.renderSettings(settings, {
      showUnlock: Boolean(state.activeMode === "course" || state.screen === "select"),
      showReset: Boolean(state.screen === "mode" && state.activeMode),
      version: APP_VERSION,
    });
  }

  function openSettings() {
    const backdrop = document.getElementById("settingsBackdrop");
    if (!backdrop) return;
    closeFormulaMenu();
    closeMobileMap();
    state.settingsVisible = true;
    renderSettingsContent();
    backdrop.hidden = false;
    document.body.classList.add("has-modal");
  }

  function closeSettings() {
    const backdrop = document.getElementById("settingsBackdrop");
    state.settingsVisible = false;
    if (backdrop) backdrop.hidden = true;
    document.body.classList.toggle("has-modal", state.completionVisible);
  }

  function toggleSound() {
    settings.soundEnabled = !settings.soundEnabled;
    SoundFX.setEnabled(settings.soundEnabled);
    saveSettings();
    renderSettingsContent();
    if (settings.soundEnabled) SoundFX.play("correct");
    showToast(tr(settings.soundEnabled ? "toast.soundEnabled" : "toast.soundDisabled"));
  }

  function toggleUnlockAll() {
    if (state.activeMode && state.activeMode !== "course") return;
    settings.unlockAll = !settings.unlockAll;
    saveSettings();
    if (state.screen === "mode" && !settings.unlockAll && state.levelIndex > maxUnlockedIndex()) {
      enterLevel(maxUnlockedIndex(), 0);
    } else if (state.screen === "mode") {
      renderAll();
    } else {
      renderModeScreen();
    }
    if (state.settingsVisible) renderSettingsContent();
    showToast(tr(settings.unlockAll ? "toast.unlockAllEnabled" : "toast.unlockAllDisabled"));
  }

  function changeLanguage(language) {
    settings.language = I18N.normalizeLanguage(language);
    I18N.setLanguage(settings.language);
    saveSettings();
    if (state.screen === "mode" && state.activeTask && currentStep() && currentStep().type === "sheet") {
      state.operation = initialOperationState(state.activeTask);
    }
    if (state.screen === "mode") renderAll();
    else renderModeScreen();
    if (state.settingsVisible) renderSettingsContent();
    if (state.completionVisible && state.completionData) {
      const modal = document.getElementById("completionModal");
      if (modal) modal.innerHTML = Views.renderCompletion(state.completionData);
    }
    showToast(tr("settings.languageChanged"));
  }

  function clearCourseProgress() {
    state.completedLevels.clear();
    state.completedSteps.clear();
    state.mistakesByStep = {};
    state.completionData = null;
    state.completionVisible = false;
    state.activeTask = null;
    state.activeTaskStepId = null;
    state.activeTaskId = null;
    state.sheetSelection = null;
  }

  function clearPracticeProgress(mode) {
    state.completedLevels = new Set();
    state.completedSteps = new Set();
    state.mistakesByStep = {};
    state.completionData = null;
    state.completionVisible = false;
    state.activeTask = null;
    state.activeTaskStepId = null;
    state.activeTaskId = null;
    state.sheetSelection = null;
    if (mode === "daily") {
      state.dailyCompletedDates = new Set();
      state.dailySelectedDate = PracticeContent.daily.currentDateKey();
      ensureDailyQueue(true);
    }
  }

  function resetCurrentModeWithConfirm() {
    if (!window.confirm(tr("settings.resetConfirm"))) return;
    const mode = state.activeMode;
    if (!mode) return;
    if (mode === "course") clearCourseProgress();
    else clearPracticeProgress(mode);
    closeCompletion();
    closeSettings();
    if (mode === "course") enterLevel(0, 0);
    else {
      state.levelIndex = 0;
      state.stepIndex = 0;
      resetTransient(true);
      renderAll();
      saveProgress();
    }
    showToast(tr("toast.progressReset"));
  }

  function replayCourse() {
    clearCourseProgress();
    closeCompletion();
    enterLevel(0, 0);
  }

  function dismissFeedback() {
    const step = currentStep();
    state.feedback = null;
    state.hintVisible = false;
    if (step.type === "sheet") {
      resetTransient(true);
      renderAll();
      saveProgress();
      return;
    }
    if (step.type === "lab") {
      if (state.labState) {
        state.labState.result = null;
        state.labState.applied = false;
      }
      renderAll();
      saveProgress();
      return;
    }
    if (step.type === "choice" || step.type === "challenge") {
      state.selectedOption = null;
      state.multiSelected = new Set();
      ensureOptionOrder(step, true);
      renderAll();
      return;
    }
    if (step.type === "builder") {
      state.fillChecks = [];
    }
    renderAll();
  }

  function toggleHint() {
    state.hintVisible = !state.hintVisible;
    renderAll();
  }

  function playDemo() {
    state.demoPlayed = true;
    SoundFX.play("correct");
    renderLesson();
  }

  function advanceLearn() {
    const step = currentStep();
    const level = currentLevel();
    markStepComplete(step);
    SoundFX.play("correct");
    if (state.stepIndex < level.steps.length - 1) {
      state.stepIndex += 1;
      resetTransient(false);
      renderAll({ animate: true });
      saveProgress();
      scrollTop();
      return;
    }
    completeLevel();
  }

  function toggleMultiOption(id) {
    if (state.feedback && state.feedback.type === "correct") return;
    if (state.feedback && state.feedback.type === "wrong") state.feedback = null;
    if (state.multiSelected.has(id)) state.multiSelected.delete(id);
    else state.multiSelected.add(id);
    renderAll();
  }

  function selectOption(id) {
    if (state.feedback && state.feedback.type === "correct") return;
    state.selectedOption = id;
    if (state.feedback && state.feedback.type === "wrong") state.feedback = null;
    renderAll();
  }

  function toggleBuilderToken(id) {
    if (state.feedback && state.feedback.type === "correct") return;
    if (state.feedback && state.feedback.type === "wrong") state.feedback = null;
    const index = state.builderTokens.indexOf(id);
    if (index >= 0) state.builderTokens.splice(index, 1);
    else state.builderTokens.push(id);
    renderAll();
  }

  function builderFormula(step) {
    const blankByToken = new Map((step.fillBlanks || []).map((blank, index) => [blank.tokenIndex, index]));
    const values = Array.isArray(state.fillValues) ? state.fillValues : [];
    return (step.tokens || []).map((token, tokenIndex) => {
      if (!blankByToken.has(tokenIndex)) return lt(token.textByLanguage || token.text);
      const blankIndex = blankByToken.get(tokenIndex);
      return String(values[blankIndex] || "").trim() || "___";
    }).join("");
  }

  function updateBuilderPreview() {
    const step = currentStep();
    const preview = document.getElementById("fillLivePreview");
    if (!step || step.type !== "builder" || !preview) return;
    const values = Array.isArray(state.fillValues) ? state.fillValues : [];
    const blanks = step.fillBlanks || [];
    const formula = builderFormula(step);
    const formulaElement = document.getElementById("fillLiveFormula");
    const referencesElement = document.getElementById("fillLiveReferences");
    const resultElement = document.getElementById("fillLiveResult");
    if (formulaElement) formulaElement.textContent = formula || "=";

    const tokens = referenceTokens(formula);
    const highlighted = new Set();
    tokens.forEach((token) => {
      const plain = token.replace(/\$/g, "").toUpperCase();
      const parts = plain.split(":");
      const refs = parts.length > 1 ? Data.expandRange(parts[0], parts[1]) : [plain];
      refs.forEach((ref) => highlighted.add(ref));
    });
    document.querySelectorAll(".builder-sheet-table td[data-builder-cell]").forEach((cell) => {
      cell.classList.toggle("is-live-source", highlighted.has(cell.dataset.builderCell));
    });
    if (referencesElement) {
      referencesElement.textContent = tokens.length
        ? tr("builder.liveReferences", { refs: tokens.join(", ") })
        : tr("builder.liveNoReferences");
    }

    const complete = blanks.length > 0 && blanks.every((blank, index) => String(values[index] || "").trim());
    let resultText = tr("builder.liveWaiting");
    let resultState = "";
    if (complete) {
      const result = Engine.evaluate(formula, Views.resolveSheet(step.sheet));
      if (result.ok) {
        resultText = tr("builder.liveResult", { value: result.display });
        resultState = "is-ok";
      } else {
        resultText = tr("builder.liveError", { error: result.error });
        resultState = "is-error";
      }
    }
    if (resultElement) {
      resultElement.textContent = resultText;
      resultElement.classList.toggle("is-ok", resultState === "is-ok");
      resultElement.classList.toggle("is-error", resultState === "is-error");
    }
    preview.classList.toggle("is-ok", resultState === "is-ok");
    preview.classList.toggle("is-error", resultState === "is-error");
  }

  function updateFillActionState() {
    const step = currentStep();
    if (!step || step.type !== "builder") return;
    const values = Array.isArray(state.fillValues) ? state.fillValues : [];
    const filled = values.filter((value) => String(value || "").trim()).length;
    const button = document.querySelector('[data-action="check-builder"]');
    if (button) button.disabled = filled === 0;
    const progress = document.getElementById("fillProgress");
    if (progress) {
      progress.textContent = tr("label.fillProgress", {
        done: filled,
        total: (step.fillBlanks || []).length,
      });
    }
    updateBuilderPreview();
  }

  function openMobileMap() {
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("mobileMapBackdrop");
    if (sidebar) sidebar.classList.add("is-open");
    if (backdrop) backdrop.hidden = false;
  }

  function closeMobileMap() {
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("mobileMapBackdrop");
    if (sidebar) sidebar.classList.remove("is-open");
    if (backdrop) backdrop.hidden = true;
  }

  function filterSpecForColumn(task, column) {
    return Object.assign({}, task.operation, {
      column: String(column || task.operation.column || "").toUpperCase(),
    });
  }

  function filterHiddenRows(task, filters) {
    const hidden = new Set();
    const sheet = task.sheetData || {};
    Object.entries(filters || {}).forEach(([column, values]) => {
      if (!Array.isArray(values) || !values.length) return;
      window.SheetOperations.hiddenRowsForFilter(
        sheet,
        filterSpecForColumn(task, column),
        values,
      ).forEach((row) => hidden.add(row));
    });
    return Array.from(hidden).sort((left, right) => left - right);
  }

  function openOperationFilterForColumn(column) {
    const task = state.activeTask;
    if (!task || !task.operation || task.operation.type !== "filter") return;
    const operation = ensureOperationState(task);
    const filters = operation.filters || {};
    const values = filters[column] || [];
    state.formulaMenuOpen = false;
    state.operation = {
      ...operation,
      type: "filter",
      filterMode: true,
      filterOpen: true,
      filterOpenColumn: column,
      selectedValue: values.length === 1 ? values[0] : "",
      selectedValues: values,
      findOpen: false,
      sortDialogOpen: false,
      gotoDialogOpen: false,
      toolMenu: "",
    };
    renderAll();
  }

  function applyOperationFilter() {
    const task = state.activeTask;
    if (!task || !task.operation || task.operation.type !== "filter") return;
    const column = state.operation?.filterOpenColumn || task.operation.column;
    const spec = filterSpecForColumn(task, column);
    const values = window.SheetOperations.uniqueValues(task.sheetData || {}, spec);
    const checked = Array.from(document.querySelectorAll("[data-excel-filter-option]"))
      .filter((input) => input.checked)
      .map((input) => input.dataset.filterBlank === "true"
        ? window.SheetOperations.BLANK_FILTER_VALUE
        : input.value);
    if (!checked.length) return;
    const allSelected = checked.length === values.length;
    const selected = allSelected ? [] : checked;
    const filters = Object.assign({}, state.operation?.filters || {});
    if (selected.length) filters[column] = selected;
    else delete filters[column];
    state.operation = {
      ...(state.operation || initialOperationState(task)),
      type: "filter",
      filters,
      selectedValue: selected.length === 1 ? selected[0] : "",
      selectedValues: selected,
      hiddenRows: filterHiddenRows(task, filters),
      filterOpen: false,
      filterOpenColumn: "",
      toolMenu: "",
    };
    state.feedback = null;
    renderAll();
  }

  function clearOperationFilter(column) {
    const task = state.activeTask;
    if (!task || !task.operation || task.operation.type !== "filter") return;
    const keepFilterMode = Boolean(state.operation && state.operation.filterMode);
    const filters = Object.assign({}, state.operation?.filters || {});
    if (column) delete filters[column];
    else Object.keys(filters).forEach((key) => delete filters[key]);
    state.operation = {
      ...(state.operation || initialOperationState(task)),
      selectedValue: "",
      selectedValues: [],
      hiddenRows: filterHiddenRows(task, filters),
      filters,
      filterMode: keepFilterMode,
      filterOpen: false,
      filterOpenColumn: "",
      toolMenu: "",
    };
    state.feedback = null;
    renderAll();
  }

  function reapplyOperationFilter() {
    const task = state.activeTask;
    if (!task || !task.operation || task.operation.type !== "filter") return;
    const filters = state.operation?.filters || {};
    state.operation = {
      ...(state.operation || initialOperationState(task)),
      filterMode: true,
      hiddenRows: filterHiddenRows(task, filters),
      toolMenu: "",
    };
    state.feedback = null;
    renderAll();
  }

  function selectionIntersectsOperationRange(task) {
    if (!task || !task.operation || !window.SheetOperations) return false;
    const operationRange = window.SheetOperations.parseRange(task.operation.range);
    if (!operationRange) return false;
    const ranges = state.pickedRanges && state.pickedRanges.length
      ? state.pickedRanges
      : selectionRanges(state.sheetSelection);
    return ranges.some((range) => {
      const selected = window.SheetOperations.parseRange(
        Views.rangeReference(range.startRef, range.endRef),
      );
      return selected &&
        selected.left <= operationRange.right &&
        selected.right >= operationRange.left &&
        selected.top <= operationRange.bottom &&
        selected.bottom >= operationRange.top;
    });
  }

  function currentSortColumn(task) {
    if (!task || !task.operation || !window.SheetOperations) return 1;
    const ranges = state.pickedRanges && state.pickedRanges.length
      ? state.pickedRanges
      : selectionRanges(state.sheetSelection);
    const selected = ranges.length
      ? window.SheetOperations.parseRange(Views.rangeReference(ranges[0].startRef, ranges[0].endRef))
      : null;
    if (selected) return selected.left;
    const fromOperation = window.SheetOperations.parseCellRef(task.operation.column + "1");
    if (fromOperation) return fromOperation.col;
    const range = window.SheetOperations.parseRange(task.operation.range);
    return range ? range.left : 1;
  }

  function currentFilterColumns(task) {
    const ranges = state.pickedRanges && state.pickedRanges.length
      ? state.pickedRanges
      : selectionRanges(state.sheetSelection);
    const allowed = window.SheetOperations.parseRange(task.operation.range);
    const columns = new Set();
    ranges.forEach((range) => {
      const selected = window.SheetOperations.parseRange(
        Views.rangeReference(range.startRef, range.endRef),
      );
      if (!selected) return;
      for (let col = selected.left; col <= selected.right; col += 1) {
        if (allowed && (col < allowed.left || col > allowed.right)) continue;
        columns.add(columnLetters(col));
      }
    });
    if (columns.size) return Array.from(columns);
    return [String(task.operation.column || "A").toUpperCase()];
  }

  function sortOperationSheet(direction, column) {
    const task = state.activeTask;
    if (!task || !task.operation || !window.SheetOperations) return;
    const range = window.SheetOperations.parseRange(task.operation.range);
    if (!range) return;
    const sheet = task.sheetData || {};
    const sortColumn = Math.max(range.left, Math.min(range.right, Number(column) || currentSortColumn(task)));
    const startRow = range.top + 1;
    const rows = [];
    for (let row = startRow; row <= range.bottom; row += 1) {
      const values = [];
      for (let col = range.left; col <= range.right; col += 1) {
        values.push(sheet[columnLetters(col) + row]);
      }
      rows.push({ values, sourceRow: row });
    }
    const language = I18N.getLanguage();
    rows.sort((left, right) => {
      const leftValue = left.values[sortColumn - range.left];
      const rightValue = right.values[sortColumn - range.left];
      const leftNumber = typeof leftValue === "number" ? leftValue : Number(leftValue);
      const rightNumber = typeof rightValue === "number" ? rightValue : Number(rightValue);
      const numeric = leftValue !== "" && rightValue !== "" &&
        Number.isFinite(leftNumber) && Number.isFinite(rightNumber);
      const order = numeric
        ? leftNumber - rightNumber
        : String(leftValue == null ? "" : leftValue).localeCompare(
          String(rightValue == null ? "" : rightValue),
          language,
          { numeric: true },
        );
      return direction === "desc" ? -order : order;
    });
    rows.forEach((item, index) => {
      const targetRow = startRow + index;
      item.values.forEach((value, offset) => {
        const ref = columnLetters(range.left + offset) + targetRow;
        if (value === undefined || value === null || value === "") delete sheet[ref];
        else sheet[ref] = value;
      });
    });
    task.sheetMutated = true;
    state.pickedRanges = [];
    state.pickedValue = null;
    state.pickedCellRef = null;
    if (task.operation.type === "filter" && state.operation?.filters) {
      state.operation.hiddenRows = filterHiddenRows(task, state.operation.filters);
    }
    if (task.operation.type === "find" && state.operation?.findQuery) {
      const matches = window.SheetOperations.findMatches(
        sheet,
        task.operation,
        state.operation.findQuery,
        findMatchOptions(),
      );
      state.operation.findMatches = matches;
      state.operation.activeFindRef = matches[0] || "";
      task.operation = {
        ...task.operation,
        expectedRef: matches[0] || task.operation.expectedRef,
        expectedRefs: matches.length ? matches : task.operation.expectedRefs,
      };
    }
    state.operation.sortDialogOpen = false;
    state.operation.toolMenu = "";
    state.feedback = null;
    renderAll();
    showToast(tr("sheet.sorted"));
  }

  function openSortDialog() {
    const task = state.activeTask;
    if (!task || !task.operation) return;
    state.operation = {
      ...(state.operation || initialOperationState(task)),
      toolMenu: "sort",
      sortDialogOpen: true,
      sortColumn: String(currentSortColumn(task)),
      filterOpen: false,
      findOpen: false,
      gotoDialogOpen: false,
    };
    renderAll();
  }

  function closeSortDialog() {
    if (!state.operation) return;
    state.operation.sortDialogOpen = false;
    state.operation.toolMenu = "sort";
    renderAll();
  }

  function openGoToDialog() {
    const task = state.activeTask;
    if (!task) return;
    state.operation = {
      ...(state.operation || initialOperationState(task) || { type: "view" }),
      toolMenu: "",
      gotoDialogOpen: true,
      filterOpen: false,
      findOpen: false,
      sortDialogOpen: false,
    };
    renderAll();
  }

  function closeGoToDialog() {
    if (!state.operation) return;
    state.operation.gotoDialogOpen = false;
    renderAll();
  }

  function applyGoTo() {
    const input = document.querySelector("[data-goto-ref]");
    const value = input ? input.value.trim().toUpperCase() : "";
    const parts = value.split(":");
    const first = parts[0];
    const last = parts[parts.length - 1];
    if (!parseCell(first) || !parseCell(last)) {
      showToast(tr("find.invalidReference"));
      return;
    }
    state.operation.gotoDialogOpen = false;
    const ranges = [{ startRef: first, endRef: last }];
    state.pickedRanges = ranges;
    state.pickedCellRef = first;
    state.pickedValue = cellDisplayValue(first);
    renderAll();
    window.setTimeout(() => {
      renderSelectionRanges(ranges, false, false, first);
      const cell = document.querySelector('[data-cell="' + first + '"]');
      if (cell) cell.scrollIntoView({ block: "center", inline: "center" });
    }, 0);
  }

  function toggleFilterMode() {
    const task = state.activeTask;
    if (!task || !task.operation || task.operation.type !== "filter") return;
    if (state.operation && state.operation.filterMode) {
      state.operation = {
        ...state.operation,
        selectedValue: "",
        selectedValues: [],
        hiddenRows: [],
        filters: {},
        filterMode: false,
        filterOpen: false,
        filterColumns: [],
        filterOpenColumn: "",
        toolMenu: "",
      };
      state.feedback = null;
      renderAll();
      return;
    }
    if (!selectionIntersectsOperationRange(task)) {
      showToast(tr("operation.selectBeforeFilter"));
      return;
    }
    state.operation = {
      ...(state.operation || initialOperationState(task)),
      filterMode: true,
      filterColumns: currentFilterColumns(task),
      filterOpen: false,
      filterOpenColumn: "",
      findOpen: false,
      sortDialogOpen: false,
      gotoDialogOpen: false,
      toolMenu: "",
    };
    state.formulaMenuOpen = false;
    state.feedback = null;
    renderAll();
  }

  function toggleOperationFilter() {
    const task = state.activeTask;
    if (!task || !task.operation || task.operation.type !== "filter" ||
        !state.operation || !state.operation.filterMode) return;
    state.operation = {
      ...(state.operation || initialOperationState(task)),
      filterOpen: !(state.operation && state.operation.filterOpen),
      findOpen: false,
      sortDialogOpen: false,
      gotoDialogOpen: false,
      toolMenu: "",
    };
    renderAll();
  }

  function cancelOperationFilter() {
    const task = state.activeTask;
    if (!task || !task.operation || task.operation.type !== "filter") return;
    state.operation = {
      ...(state.operation || initialOperationState(task)),
      filterOpen: false,
    };
    renderAll();
  }

  function syncFilterSelection() {
    const options = Array.from(document.querySelectorAll("[data-excel-filter-option]"));
    const all = document.querySelector("[data-excel-filter-all]");
    if (!all || !options.length) return;
    const checked = options.filter((input) => input.checked).length;
    all.checked = checked === options.length;
    all.indeterminate = checked > 0 && checked < options.length;
    const apply = document.querySelector('[data-action="apply-excel-filter"]');
    if (apply) apply.disabled = checked === 0;
  }

  function positionExcelFilterPopover() {
    const popover = document.getElementById("excelFilterPopover");
    const anchor = document.querySelector(".excel-filter-button");
    if (!popover || !anchor) return;
    const anchorRect = anchor.getBoundingClientRect();
    const width = popover.offsetWidth;
    const height = popover.offsetHeight;
    let left = Math.min(window.innerWidth - width - 12, Math.max(12, anchorRect.right - width));
    let top = anchorRect.bottom + 4;
    if (top + height > window.innerHeight - 12) {
      top = Math.max(12, anchorRect.top - height - 4);
    }
    popover.style.left = left + "px";
    popover.style.top = top + "px";
  }

  function positionExcelFindPopover() {
    positionSheetDialog("excelFindPopover");
  }

  function positionSheetDialog(id) {
    const popover = document.getElementById(id);
    const frame = document.querySelector(".sheet-frame");
    if (!popover || !frame) return;
    const frameRect = frame.getBoundingClientRect();
    const width = popover.offsetWidth;
    const height = popover.offsetHeight;
    const left = Math.min(
      window.innerWidth - width - 12,
      Math.max(12, frameRect.left + (frameRect.width - width) / 2),
    );
    const top = Math.min(
      window.innerHeight - height - 12,
      Math.max(12, frameRect.top + 70),
    );
    popover.style.left = left + "px";
    popover.style.top = top + "px";
  }

  function findSpecForTask(task) {
    if (task && task.operation && task.operation.range) return task.operation;
    const sheet = (task && task.sheetData) || (currentStep() && currentStep().sheetData) || {};
    const bounds = Views.sheetBounds(sheet, []);
    const maxRow = Math.max(1, bounds.maxRow || 1);
    const maxCol = Math.max(1, bounds.maxCol || 1);
    return { range: "A1:" + columnLetters(maxCol) + maxRow };
  }

  function readFindOptions() {
    const matchCase = document.querySelector("[data-find-match-case]");
    const matchCell = document.querySelector("[data-find-match-cell]");
    const searchBy = document.querySelector("[data-find-search-by]");
    const lookIn = document.querySelector("[data-find-look-in]");
    return {
      matchCase: matchCase ? matchCase.checked : Boolean(state.operation && state.operation.findMatchCase),
      matchEntireCell: matchCell ? matchCell.checked : Boolean(state.operation && state.operation.findEntireCell),
      distinguishWidth: Boolean(document.querySelector("[data-find-width]")
        ? document.querySelector("[data-find-width]").checked
        : state.operation && state.operation.findDistinguishWidth),
      searchBy: searchBy ? searchBy.value : (state.operation && state.operation.findSearchBy) || "row",
      lookIn: lookIn ? lookIn.value : (state.operation && state.operation.findLookIn) || "formulas",
    };
  }

  function findMatchOptions() {
    return {
      matchCase: Boolean(state.operation && state.operation.findMatchCase),
      matchEntireCell: Boolean(state.operation && state.operation.findEntireCell),
      distinguishWidth: Boolean(state.operation && state.operation.findDistinguishWidth),
      searchBy: (state.operation && state.operation.findSearchBy) || "row",
      lookIn: (state.operation && state.operation.findLookIn) || "formulas",
    };
  }

  function setFindMode(mode) {
    const task = state.activeTask;
    if (!task) return;
    const input = document.querySelector("[data-operation-find-input]");
    const replacementInput = document.querySelector("[data-find-replacement]");
    const options = readFindOptions();
    state.operation = {
      ...ensureOperationState(task),
      findMode: mode === "replace" ? "replace" : "find",
      findQuery: input ? input.value : state.operation?.findQuery || "",
      findReplacement: replacementInput ? replacementInput.value : state.operation?.findReplacement || "",
      findMatchCase: options.matchCase,
      findEntireCell: options.matchEntireCell,
      findDistinguishWidth: options.distinguishWidth,
      findSearchBy: options.searchBy,
      findLookIn: options.lookIn,
      findOpen: true,
      toolMenu: "",
    };
    renderAll();
  }

  function toggleFindOptions() {
    const task = state.activeTask;
    if (!task) return;
    const input = document.querySelector("[data-operation-find-input]");
    const replacementInput = document.querySelector("[data-find-replacement]");
    const options = readFindOptions();
    state.operation = {
      ...ensureOperationState(task),
      findQuery: input ? input.value : state.operation?.findQuery || "",
      findReplacement: replacementInput ? replacementInput.value : state.operation?.findReplacement || "",
      findOptionsOpen: !(state.operation && state.operation.findOptionsOpen),
      findMatchCase: options.matchCase,
      findEntireCell: options.matchEntireCell,
      findDistinguishWidth: options.distinguishWidth,
      findSearchBy: options.searchBy,
      findLookIn: options.lookIn,
    };
    renderAll();
  }

  function navigateOperationFind(direction) {
    const task = state.activeTask;
    if (!task) return;
    const input = document.querySelector("[data-operation-find-input]");
    const query = input ? input.value : state.operation?.findQuery || "";
    const options = readFindOptions();
    const matches = window.SheetOperations.findMatches(
      task.sheetData || {},
      findSpecForTask(task),
      query,
      options,
    );
    const previous = ensureOperationState(task);
    const existingIndex = matches.indexOf(String(previous.activeFindRef || "").toUpperCase());
    let nextIndex = existingIndex < 0
      ? (direction < 0 ? matches.length - 1 : 0)
      : existingIndex + direction;
    if (matches.length) nextIndex = (nextIndex + matches.length) % matches.length;
    state.operation = {
      ...previous,
      type: "find",
      findQuery: query,
      findMatches: matches,
      activeFindRef: matches.length ? matches[nextIndex] : "",
      findPerformed: Boolean(query && matches.length),
      findMatchCase: options.matchCase,
      findEntireCell: options.matchEntireCell,
      findDistinguishWidth: options.distinguishWidth,
      findSearchBy: options.searchBy,
      findLookIn: options.lookIn,
      toolMenu: "",
    };
    state.feedback = null;
    renderAll();
    const active = document.querySelector(".sheet-table td.is-find-active");
    if (active) active.scrollIntoView({ block: "center", inline: "center" });
  }

  function findAllOperation() {
    const task = state.activeTask;
    if (!task) return;
    const input = document.querySelector("[data-operation-find-input]");
    const query = input ? input.value : state.operation?.findQuery || "";
    const options = readFindOptions();
    const matches = window.SheetOperations.findMatches(
      task.sheetData || {},
      findSpecForTask(task),
      query,
      options,
    );
    const previous = ensureOperationState(task);
    const previousActive = String(previous.activeFindRef || "").toUpperCase();
    const active = matches.includes(previousActive) ? previousActive : matches[0] || "";
    state.operation = {
      ...previous,
      type: "find",
      findQuery: query,
      findMatches: matches,
      activeFindRef: active,
      findPerformed: Boolean(query && matches.length),
      findMatchCase: options.matchCase,
      findEntireCell: options.matchEntireCell,
      findDistinguishWidth: options.distinguishWidth,
      findSearchBy: options.searchBy,
      findLookIn: options.lookIn,
      findOpen: true,
      toolMenu: "",
    };
    state.feedback = null;
    renderAll();
  }

  function replaceAllOperation() {
    const task = state.activeTask;
    if (!task) return;
    const queryInput = document.querySelector("[data-operation-find-input]");
    const replacementInput = document.querySelector("[data-find-replacement]");
    const query = queryInput ? queryInput.value : state.operation?.findQuery || "";
    const replacement = replacementInput ? replacementInput.value : "";
    if (!query) return;
    const options = readFindOptions();
    const spec = findSpecForTask(task);
    const count = window.SheetOperations.replaceInRange(
      task.sheetData || {},
      spec,
      query,
      replacement,
      options,
    );
    task.sheetMutated = true;
    const matches = window.SheetOperations.findMatches(
      task.sheetData || {},
      spec,
      query,
      options,
    );
    state.operation = {
      ...(state.operation || initialOperationState(task)),
      type: "find",
      findQuery: query,
      findMatches: matches,
      activeFindRef: matches[0] || "",
      findPerformed: Boolean(query && matches.length),
      findMatchCase: options.matchCase,
      findEntireCell: options.matchEntireCell,
      findDistinguishWidth: options.distinguishWidth,
      findSearchBy: options.searchBy,
      findLookIn: options.lookIn,
      findOpen: true,
      findMode: "replace",
      findReplacement: replacement,
      toolMenu: "",
    };
    state.feedback = null;
    renderAll();
    showToast(tr("find.replaced", { n: count }));
  }

  function replaceCurrentOperation() {
    const task = state.activeTask;
    if (!task) return;
    const queryInput = document.querySelector("[data-operation-find-input]");
    const replacementInput = document.querySelector("[data-find-replacement]");
    const query = queryInput ? queryInput.value : state.operation?.findQuery || "";
    const replacement = replacementInput ? replacementInput.value : "";
    const active = state.operation?.activeFindRef || "";
    if (!query || !active) {
      navigateOperationFind(1);
      return;
    }
    const options = readFindOptions();
    const spec = findSpecForTask(task);
    const previousMatches = Array.isArray(state.operation?.findMatches)
      ? state.operation.findMatches.slice()
      : [];
    const count = window.SheetOperations.replaceInRange(
      task.sheetData || {},
      Object.assign({}, spec, { range: active }),
      query,
      replacement,
      options,
    );
    task.sheetMutated = task.sheetMutated || count > 0;
    const matches = window.SheetOperations.findMatches(task.sheetData || {}, spec, query, options);
    const activeIndex = previousMatches.indexOf(active);
    const nextIndex = activeIndex < 0 ? 0 : Math.min(activeIndex, matches.length ? matches.length - 1 : 0);
    state.operation = {
      ...(state.operation || initialOperationState(task)),
      type: "find",
      findQuery: query,
      findMatches: matches,
      activeFindRef: matches[nextIndex] || "",
      findPerformed: Boolean(query && matches.length),
      findMatchCase: options.matchCase,
      findEntireCell: options.matchEntireCell,
      findDistinguishWidth: options.distinguishWidth,
      findSearchBy: options.searchBy,
      findLookIn: options.lookIn,
      findOpen: true,
      findMode: "replace",
      findReplacement: replacement,
      toolMenu: "",
    };
    state.feedback = null;
    renderAll();
    showToast(tr("find.replaced", { n: count }));
  }

  function toggleOperationFind() {
    const task = state.activeTask;
    if (!task) return;
    state.operation = {
      ...ensureOperationState(task),
      findOpen: !(state.operation && state.operation.findOpen),
      toolMenu: "",
    };
    renderAll();
  }

  function closeOperationFind() {
    const task = state.activeTask;
    if (!task) return;
    state.operation = {
      ...ensureOperationState(task),
      findOpen: false,
      toolMenu: "",
    };
    renderAll();
  }

  function toggleDataToolMenu(menu) {
    const task = state.activeTask;
    if (!task) return;
    state.formulaMenuOpen = false;
    state.operation = {
      ...ensureOperationState(task),
      toolMenu: state.operation && state.operation.toolMenu === menu ? "" : menu,
      filterOpen: false,
      findOpen: false,
      sortDialogOpen: false,
      gotoDialogOpen: false,
    };
    renderAll();
  }

  function openOperationFindWindow(mode) {
    const task = state.activeTask;
    if (!task) return;
    state.operation = {
      ...ensureOperationState(task),
      findOpen: true,
      findMode: mode === "replace" ? "replace" : "find",
      filterOpen: false,
      sortDialogOpen: false,
      gotoDialogOpen: false,
      toolMenu: "",
    };
    state.formulaMenuOpen = false;
    renderAll();
    window.setTimeout(() => {
      const input = document.querySelector("[data-operation-find-input]");
      if (input) input.focus();
    }, 0);
  }

  function runAction(action, element) {
    if (action === "check-lab") {
      checkLab();
      return;
    }
    if (String(action || "").indexOf("lab-") === 0) {
      applyLabAction(action, element);
      return;
    }
    switch (action) {
      case "select-mode":
        enterMode(element.dataset.mode).catch(() => showToast(tr("mode.loadFailed")));
        break;
      case "switch-mode":
        showModeScreen();
        break;
      case "toggle-mobile-map":
        openMobileMap();
        break;
      case "open-settings":
        openSettings();
        break;
      case "close-settings":
        closeSettings();
        break;
      case "toggle-sound":
        toggleSound();
        break;
      case "toggle-unlock-all":
        toggleUnlockAll();
        break;
      case "set-language":
        changeLanguage(element.dataset.language);
        break;
      case "export-progress":
        downloadProgressBackup();
        break;
      case "import-progress": {
        const input = document.getElementById("progressImportInput");
        if (input) input.click();
        break;
      }
      case "reset-progress":
        resetCurrentModeWithConfirm();
        break;
      case "goto-level":
        enterLevel(Number(element.dataset.level), 0);
        break;
      case "goto-step":
        enterStep(Number(element.dataset.step));
        break;
      case "select-option":
        selectOption(element.dataset.id);
        break;
      case "toggle-multi":
        toggleMultiOption(element.dataset.id);
        break;
      case "toggle-token":
        toggleBuilderToken(element.dataset.id);
        break;
      case "clear-builder":
        state.builderTokens = [];
        state.fillValues = (state.fillValues || []).map(() => "");
        state.fillChecks = [];
        state.feedback = null;
        renderAll();
        break;
      case "show-hint":
        toggleHint();
        break;
      case "dismiss-feedback":
        dismissFeedback();
        break;
      case "check-choice":
        checkChoice();
        break;
      case "check-multi":
        checkChallenge();
        break;
      case "check-builder":
        checkBuilder();
        break;
      case "check-sheet":
        checkSheet();
        break;
      case "apply-operation-filter":
      case "apply-excel-filter":
        applyOperationFilter();
        break;
      case "clear-operation-filter":
        clearOperationFilter("");
        break;
      case "clear-excel-filter":
        clearOperationFilter(element.dataset.column || state.operation?.filterOpenColumn || "");
        break;
      case "toggle-excel-filter":
        toggleOperationFilter();
        break;
      case "open-excel-filter":
        openOperationFilterForColumn(element.dataset.column || state.activeTask.operation.column);
        break;
      case "cancel-excel-filter":
        cancelOperationFilter();
        break;
      case "toggle-filter-mode":
        toggleFilterMode();
        break;
      case "toggle-data-tool-menu":
        toggleDataToolMenu(element.dataset.menu || "");
        break;
      case "sort-ascending":
        sortOperationSheet("asc", currentSortColumn(state.activeTask));
        break;
      case "sort-descending":
        sortOperationSheet("desc", currentSortColumn(state.activeTask));
        break;
      case "open-sort-dialog":
        openSortDialog();
        break;
      case "close-sort-dialog":
        closeSortDialog();
        break;
      case "apply-custom-sort": {
        const column = Number(document.querySelector("[data-sort-column]")?.value) || 1;
        const direction = document.querySelector("[data-sort-direction]")?.value === "desc" ? "desc" : "asc";
        sortOperationSheet(direction, column);
        break;
      }
      case "reapply-operation-filter":
        reapplyOperationFilter();
        break;
      case "find-previous":
        navigateOperationFind(-1);
        break;
      case "find-next":
        navigateOperationFind(1);
        break;
      case "find-all":
        findAllOperation();
        break;
      case "toggle-excel-find":
        toggleOperationFind();
        break;
      case "open-excel-find":
        openOperationFindWindow("find");
        break;
      case "open-excel-replace":
        openOperationFindWindow("replace");
        break;
      case "set-find-mode":
        setFindMode(element.dataset.mode || "find");
        break;
      case "toggle-find-options":
        toggleFindOptions();
        break;
      case "open-go-to":
      case "open-go-to-special":
        openGoToDialog();
        break;
      case "close-go-to":
        closeGoToDialog();
        break;
      case "apply-go-to":
        applyGoTo();
        break;
      case "replace-all":
        replaceAllOperation();
        break;
      case "replace-current":
        replaceCurrentOperation();
        break;
      case "close-excel-find":
        closeOperationFind();
        break;
      case "fill-answer-range": {
        const task = state.activeTask;
        const answerRange = Views.answerRangeForTask(task);
        if (answerRange) autoFillAnswerRange(answerRange.endRef);
        break;
      }
      case "next":
        advanceStep();
        break;
      case "advance-learn":
        advanceLearn();
        break;
      case "play-demo":
        playDemo();
        break;
      case "toggle-formula-menu":
        toggleFormulaMenu();
        break;
      case "insert-function":
        insertFunctionFormula(element.dataset.name);
        break;
      case "close-completion":
        closeCompletion();
        break;
      case "next-level":
        goToNextLevel();
        break;
      case "replay-course":
        replayCourse();
        break;
      default:
        break;
    }
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const settingsBackdrop = event.target.closest("#settingsBackdrop");
      if (settingsBackdrop && event.target === settingsBackdrop) {
        closeSettings();
        return;
      }
      const completionBackdrop = event.target.closest("#completionModal");
      if (completionBackdrop && event.target === completionBackdrop) {
        closeCompletion();
        return;
      }
      if (event.target.closest("#mobileMapBackdrop")) {
        closeMobileMap();
        return;
      }

      const actionElement = event.target.closest("[data-action]");
      if (actionElement) {
        event.preventDefault();
        runAction(actionElement.dataset.action, actionElement);
        return;
      }

      if (state.operation && state.operation.filterOpen &&
          !event.target.closest("#excelFilterPopover") &&
          !event.target.closest(".excel-filter-button")) {
        state.operation.filterOpen = false;
        const popover = document.getElementById("excelFilterPopover");
        if (popover) popover.remove();
      }
      if (state.operation && state.operation.toolMenu &&
          !event.target.closest(".data-tool-group")) {
        state.operation.toolMenu = "";
        const menu = document.querySelector(".data-tool-menu");
        if (menu) menu.remove();
      }
      if (state.operation && state.operation.gotoDialogOpen &&
          !event.target.closest("#excelGoToPopover")) {
        state.operation.gotoDialogOpen = false;
        const dialog = document.getElementById("excelGoToPopover");
        if (dialog) dialog.remove();
      }

      const columnHeader = event.target.closest(".sheet-table th[data-select-col]");
      if (columnHeader) {
        if (Date.now() < suppressCellClickUntil) return;
        const insert = headerHadFormulaFocus;
        headerHadFormulaFocus = false;
        selectSheetHeader("column", Number(columnHeader.dataset.selectCol), { insert });
        return;
      }

      const rowHeader = event.target.closest(".sheet-table th[data-select-row]");
      if (rowHeader) {
        if (Date.now() < suppressCellClickUntil) return;
        const insert = headerHadFormulaFocus;
        headerHadFormulaFocus = false;
        selectSheetHeader("row", Number(rowHeader.dataset.selectRow), { insert });
        return;
      }

      const sourceCell = event.target.closest('.sheet-table td[data-cell]');
      if (sourceCell) {
        if (Date.now() < suppressCellClickUntil) return;
        selectSourceCell(sourceCell.dataset.cell, {
          shiftKey: event.shiftKey,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          editing: state.cellClickEditing,
        });
        return;
      }

      const answerCell = event.target.closest('.sheet-table td[data-sheet-cell]');
      if (answerCell) {
        if (!(state.feedback && state.feedback.type === "correct")) focusFormulaInput();
        return;
      }

      if (!event.target.closest(".fx-menu-wrap")) closeFormulaMenu();
    });

    document.addEventListener("input", (event) => {
      if (event.target.matches("[data-lab-field]") && !event.target.matches("[data-lab-action]")) {
        applyLabAction("set", event.target, { rerender: false });
        return;
      }
      if (event.target.matches("[data-operation-find-input]")) {
        const operation = ensureOperationState(state.activeTask);
        if (!operation) return;
        const query = event.target.value;
        if (operation.findQuery !== query) {
          operation.findQuery = query;
          operation.findMatches = [];
          operation.activeFindRef = "";
          operation.findPerformed = false;
        }
        return;
      }
      if (event.target.matches("[data-find-replacement]")) {
        const operation = ensureOperationState(state.activeTask);
        if (operation) operation.findReplacement = event.target.value;
        return;
      }
      if (event.target.matches("[data-excel-filter-search]")) {
        const query = event.target.value.trim().toLowerCase();
        document.querySelectorAll("[data-excel-filter-option-row]").forEach((row) => {
          const value = row.dataset.value === window.SheetOperations.BLANK_FILTER_VALUE
            ? tr("operation.blankValue")
            : row.dataset.value;
          row.hidden = query.length > 0 && !value.toLowerCase().includes(query);
        });
        return;
      }
      if (event.target.matches("[data-operation-find-input]")) {
        if (!state.operation) state.operation = initialOperationState(state.activeTask);
        state.operation.findQuery = event.target.value;
        state.operation.findPerformed = false;
        state.operation.findMatches = [];
        state.operation.activeFindRef = "";
        return;
      }
      if (event.target.matches("[data-find-replacement]")) {
        if (!state.operation) state.operation = initialOperationState(state.activeTask);
        state.operation.findReplacement = event.target.value;
        return;
      }
      if (event.target.matches("[data-fill-index]")) {
        const index = Number(event.target.dataset.fillIndex);
        if (Number.isInteger(index) && state.fillValues[index] !== undefined) {
          state.fillValues[index] = event.target.value;
          state.fillChecks = [];
          event.target.classList.remove("is-correct", "is-wrong");
          updateFillActionState();
        }
        return;
      }
      if (event.target.id !== "formulaInput") return;
      clearPickedSelection();
      state.formulaInput = event.target.value;
      state.formulaEditingActive = true;
      state.formulaEditRevision += 1;
      state.formulaCaret = { start: event.target.selectionStart || 0, end: event.target.selectionEnd || 0 };
      state.sheetSelection = null;
      updateSheetPreview();
      updateSheetActionState();
      if (state.formulaInput) highlightFormulaSelection(true);
      else restoreSheetSelection();
    });

    document.addEventListener("focus", (event) => {
      if (event.target.id !== "formulaInput") return;
      state.cellClickEditing = true;
      state.formulaEditingActive = true;
      if (state.pickedValue != null) {
        state.formulaInput = event.target.value;
        clearPickedSelection();
      }
      state.sheetSelection = null;
      state.formulaCaret = { start: event.target.selectionStart || event.target.value.length, end: event.target.selectionEnd || event.target.value.length };
    }, true);

    document.addEventListener("keyup", (event) => {
      if (event.target.id !== "formulaInput") return;
      const next = { start: event.target.selectionStart || 0, end: event.target.selectionEnd || 0 };
      if (next.start !== state.formulaCaret.start || next.end !== state.formulaCaret.end) {
        state.formulaCaret = next;
        state.formulaEditRevision += 1;
      }
    });
    document.addEventListener("mouseup", (event) => {
      if (event.target.id !== "formulaInput") return;
      const next = { start: event.target.selectionStart || 0, end: event.target.selectionEnd || 0 };
      if (next.start !== state.formulaCaret.start || next.end !== state.formulaCaret.end) {
        state.formulaCaret = next;
        state.formulaEditRevision += 1;
      }
    });

    document.addEventListener("change", (event) => {
      if (event.target.matches("[data-lab-action]")) {
        applyLabAction(event.target.dataset.labAction, event.target);
        return;
      }
      if (event.target.matches("[data-lab-field]")) {
        applyLabAction(event.target.dataset.labAction || "set", event.target);
        return;
      }
      if (event.target.matches("[data-find-match-case], [data-find-match-cell], [data-find-width], [data-find-search-by], [data-find-look-in]")) {
        const operation = ensureOperationState(state.activeTask);
        if (!operation) return;
        const options = readFindOptions();
        operation.findMatchCase = options.matchCase;
        operation.findEntireCell = options.matchEntireCell;
        operation.findDistinguishWidth = options.distinguishWidth;
        operation.findSearchBy = options.searchBy;
        operation.findLookIn = options.lookIn;
        operation.findMatches = [];
        operation.activeFindRef = "";
        operation.findPerformed = false;
        return;
      }
      if (event.target.matches("[data-excel-filter-all]")) {
        document.querySelectorAll("[data-excel-filter-option]").forEach((input) => {
          input.checked = event.target.checked;
        });
        event.target.indeterminate = false;
        syncFilterSelection();
        return;
      }
      if (event.target.matches("[data-excel-filter-option]")) {
        syncFilterSelection();
        return;
      }
      if (event.target.id !== "progressImportInput") return;
      const file = event.target.files && event.target.files[0];
      if (file) importProgressFile(file);
    });

    window.addEventListener("resize", () => {
      if (state.operation && state.operation.filterOpen) positionExcelFilterPopover();
      if (state.operation && state.operation.findOpen) positionExcelFindPopover();
      if (state.operation && state.operation.gotoDialogOpen) positionSheetDialog("excelGoToPopover");
    });
    document.addEventListener("scroll", () => {
      if (state.operation && state.operation.filterOpen) positionExcelFilterPopover();
      if (state.operation && state.operation.findOpen) positionExcelFindPopover();
      if (state.operation && state.operation.gotoDialogOpen) positionSheetDialog("excelGoToPopover");
    }, true);

    document.addEventListener("keydown", (event) => {
      if (currentStep() && currentStep().type === "lab" &&
          (event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        checkLab();
        return;
      }
      if (event.target.matches("[data-operation-find-input]") && event.key === "Enter") {
        event.preventDefault();
        navigateOperationFind(event.shiftKey ? -1 : 1);
        return;
      }
      if (event.key === "Escape") {
        if (state.formulaMenuOpen) closeFormulaMenu();
        else if (state.operation && state.operation.sortDialogOpen) {
          state.operation.sortDialogOpen = false;
          state.operation.toolMenu = "";
          renderAll();
        }
        else if (state.operation && state.operation.toolMenu) {
          state.operation.toolMenu = "";
          renderAll();
        }
        else if (state.operation && state.operation.gotoDialogOpen) closeGoToDialog();
        else if (state.operation && state.operation.findOpen) closeOperationFind();
        else if (state.operation && state.operation.filterOpen) cancelOperationFilter();
        else if (state.settingsVisible) closeSettings();
        else if (state.completionVisible) closeCompletion();
        else if (state.screen === "select" && state.activeMode) enterMode(state.activeMode);
        else closeMobileMap();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && !event.altKey && /^f$/i.test(event.key) &&
          state.activeTask && currentStep() && currentStep().type === "sheet") {
        event.preventDefault();
        state.operation = {
          ...ensureOperationState(state.activeTask),
          findOpen: true,
          findMode: "find",
          filterOpen: false,
          sortDialogOpen: false,
          gotoDialogOpen: false,
          toolMenu: "",
        };
        renderAll();
        window.setTimeout(() => {
          const input = document.querySelector("[data-operation-find-input]");
          if (input) input.focus();
        }, 0);
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && !event.altKey && /^l$/i.test(event.key) &&
          state.activeTask && state.activeTask.operation && state.activeTask.operation.type === "filter") {
        event.preventDefault();
        toggleFilterMode();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && !event.altKey && /^h$/i.test(event.key) &&
          state.activeTask && currentStep() && currentStep().type === "sheet") {
        event.preventDefault();
        openOperationFindWindow("replace");
        return;
      }
      if (event.target.closest("[data-auto-fill-handle]") && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        const task = state.activeTask;
        const answerRange = Views.answerRangeForTask(task);
        if (answerRange) autoFillAnswerRange(answerRange.endRef);
        return;
      }
      if (
        (event.ctrlKey || event.metaKey) &&
        !event.altKey &&
        /^[dr]$/i.test(event.key) &&
        state.activeTask
      ) {
        const answerRange = Views.answerRangeForTask(state.activeTask);
        if (answerRange && answerRange.isMulti) {
          event.preventDefault();
          autoFillAnswerRange(answerRange.endRef);
          return;
        }
      }
      const header = event.target.closest(".sheet-table th[data-select-row], .sheet-table th[data-select-col]");
      if (header && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        const column = header.dataset.selectCol;
        const row = header.dataset.selectRow;
        if (column) selectSheetHeader("column", Number(column));
        else if (row) selectSheetHeader("row", Number(row));
        return;
      }
      if (event.target.id === "formulaInput" && event.key === "Enter") {
        event.preventDefault();
        checkSheet();
      }
      if (event.target.matches("[data-fill-index]") && event.key === "Enter") {
        event.preventDefault();
        checkBuilder();
      }
    });

    document.addEventListener("selectstart", (event) => {
      if (event.target.closest && event.target.closest(".sheet-table")) event.preventDefault();
    });
    document.addEventListener("dragstart", (event) => {
      if (event.target.closest && event.target.closest(".sheet-table")) event.preventDefault();
    });

    document.addEventListener("mousedown", (event) => {
      const header = event.target.closest(".sheet-table th[data-select-row], .sheet-table th[data-select-col]");
      if (header && formulaInputIsActive()) event.preventDefault();
    });
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", () => {
      dragSelection = null;
      touchHandleDrag = null;
      fillHandleDrag = null;
      document.body.classList.remove("is-dragging-range", "is-touch-dragging", "is-auto-filling");
      restoreSheetSelection();
    });
  }

  function initialize() {
    bindEvents();
    showModeScreen();
    document.body.dataset.ready = "true";
    document.body.dataset.appVersion = APP_VERSION;
    window.setTimeout(() => {
      if ("requestIdleCallback" in window) window.requestIdleCallback(warmCourseContent, { timeout: 2500 });
      else warmCourseContent();
    }, 350);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

  window.__FORMULA_ISLAND__ = {
    state,
    version: APP_VERSION,
    course: COURSE,
    practiceContent: PracticeContent,
    progressKey: PROGRESS_KEY,
    practiceProgressKey: PRACTICE_PROGRESS_KEY,
    settings,
    actions: {
      enterMode,
      showModeScreen,
      renderModeScreen,
      enterLevel,
      enterStep,
      renderAll,
      runAction,
      selectSourceCell,
      updateBuilderPreview,
      selectSheetHeader,
      finishRangeSelection,
      autoFillAnswerRange,
      translateFormula,
      openSettings,
      closeSettings,
      changeLanguage,
      toggleSound,
      toggleUnlockAll,
      downloadProgressBackup,
      buildProgressBackup,
      validateProgressBackup,
      applyProgressBackup,
      importProgressFile,
      completeLevel,
      saveProgress,
    },
  };
})();
