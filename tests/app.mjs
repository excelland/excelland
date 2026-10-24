import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
if (!fs.existsSync(chromePath)) {
  console.log(JSON.stringify({ skipped: "Chrome not found" }, null, 2));
  process.exit(0);
}

const port = 9334 + Math.floor(Math.random() * 200);
const profile = path.join(os.tmpdir(), "excel-land-smoke-" + Date.now());
const pageUrl = pathToFileURL(path.join(root, "index.html")).href;
const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--allow-file-access-from-files",
  "--remote-debugging-port=" + port,
  "--user-data-dir=" + profile,
  pageUrl,
], { stdio: "ignore", windowsHide: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getTarget() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch("http://127.0.0.1:" + port + "/json/list");
      const targets = await response.json();
      const page = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
      if (page) return page;
    } catch (error) {
      // Chrome is still starting.
    }
    await sleep(100);
  }
  throw new Error("Chrome DevTools target did not start");
}

const target = await getTarget();
const socket = new WebSocket(target.webSocketDebuggerUrl);
let messageId = 0;
const pending = new Map();
const exceptions = [];

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.method === "Runtime.exceptionThrown") {
    exceptions.push(message.params.exceptionDetails && message.params.exceptionDetails.text || "runtime exception");
  }
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});

await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

function send(method, params) {
  const id = ++messageId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params: params || {} }));
  });
}

async function evaluate(expression) {
  const response = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true,
  });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.text || "Runtime.evaluate failed");
  }
  return response.result && response.result.value;
}

async function waitFor(expression, label, attempts = 120) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await evaluate(expression)) return;
    await sleep(100);
  }
  throw new Error("Timed out waiting for " + label);
}

let exitCode = 1;
try {
  await send("Runtime.enable");
  await send("Page.enable");
  await waitFor("Boolean(document.body.dataset.ready)", "app ready");
  await waitFor("document.querySelectorAll('.mode-card').length >= 3", "mode cards");

  const modeCards = await evaluate("document.querySelectorAll('.mode-card').length");
  await evaluate("document.querySelector('[data-action=\"select-mode\"][data-mode=\"course\"]').click()");
  await waitFor("document.body.dataset.mode === 'course' && window.COURSE && window.COURSE.levels.length >= 60", "course content");
  await waitFor("document.querySelectorAll('.lesson-card').length > 0", "course lesson");

  const courseStats = await evaluate(`({
    chapters: window.COURSE.chapters.length,
    levels: window.COURSE.levels.length,
    steps: window.COURSE.totalSteps,
    functions: window.COURSE.formulaFunctions.length,
    title: document.querySelector('.lesson-card h1')?.textContent || ''
  })`);

  const labIndex = await evaluate("window.COURSE.levels.findIndex(level => level.id === 'wb-sheet-lifecycle')");
  await evaluate("window.__FORMULA_ISLAND__.settings.unlockAll = true");
  await evaluate("window.__FORMULA_ISLAND__.actions.enterLevel(" + labIndex + ", 1)");
  await waitFor("Boolean(document.querySelector('.lab-card'))", "lab card");
  const labZh = await evaluate(`({
    kind: document.querySelector('.lab-card')?.dataset.labKind || '',
    mode: document.querySelector('.lab-card')?.dataset.labMode || '',
    hasObjectText: (document.querySelector('.lab-card')?.textContent || '').includes('[object Object]')
  })`);

  await evaluate("window.__FORMULA_ISLAND__.actions.changeLanguage('en')");
  await waitFor("document.documentElement.lang === 'en'", "English language");
  const labEn = await evaluate(`({
    lang: document.documentElement.lang,
    hasObjectText: (document.querySelector('.lab-card')?.textContent || '').includes('[object Object]'),
    hasEnglishTitle: /workbook|worksheet/i.test(document.querySelector('.lab-card')?.textContent || '')
  })`);

  await evaluate("window.__FORMULA_ISLAND__.actions.enterMode('comprehensive')");
  await waitFor("document.body.dataset.mode === 'comprehensive' && document.querySelectorAll('.lesson-card').length > 0", "comprehensive mode");
  const trainingStats = await evaluate(`({
    mode: document.body.dataset.mode,
    total: window.PracticeContent.comprehensive.total,
    practiceNodes: document.querySelectorAll('.practice-node').length,
    hasObjectText: (document.querySelector('.lesson-card')?.textContent || '').includes('[object Object]')
  })`);

  await evaluate("window.__FORMULA_ISLAND__.actions.enterMode('daily')");
  await waitFor("document.body.dataset.mode === 'daily' && document.querySelectorAll('.lesson-card').length > 0", "daily mode");
  const dailyStats = await evaluate(`({
    mode: document.body.dataset.mode,
    total: window.PracticeContent.daily.total,
    hasObjectText: (document.querySelector('.lesson-card')?.textContent || '').includes('[object Object]')
  })`);

  await evaluate("window.__FORMULA_ISLAND__.actions.openSettings()");
  await waitFor("Boolean(document.querySelector('.settings-card'))", "settings");
  const version = await evaluate("document.querySelector('.settings-version')?.textContent || ''");

  const checks = {
    modeCards: modeCards >= 3,
    courseStats: courseStats.chapters >= 20 && courseStats.levels >= 60 && courseStats.functions >= 90,
    labZh: labZh.kind === "workbook" && !labZh.hasObjectText,
    labEn: labEn.lang === "en" && !labEn.hasObjectText && labEn.hasEnglishTitle,
    trainingStats: trainingStats.total === 50 && trainingStats.practiceNodes >= 50 && !trainingStats.hasObjectText,
    dailyStats: dailyStats.total === 183 && !dailyStats.hasObjectText,
    version: /1\.3\.1/.test(version),
    noExceptions: exceptions.length === 0,
  };

  console.log(JSON.stringify({ checks, courseStats, labZh, labEn, trainingStats, dailyStats, version, exceptions }, null, 2));
  exitCode = Object.values(checks).every(Boolean) ? 0 : 1;
} finally {
  try {
    socket.close();
  } catch (error) {
    // Ignore socket close errors.
  }
  chrome.kill();
}
process.exit(exitCode);
