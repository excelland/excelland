(function applyAuditFixes() {
  "use strict";

  const D = window.CourseData;
  const L = D.L;

  function eachStep(callback) {
    D.course.chapters.forEach((chapter) => {
      (chapter.levels || []).forEach((level) => {
        (level.steps || []).forEach((step) => callback(step, level, chapter));
      });
    });
  }

  function findStep(id) {
    let found = null;
    eachStep((step) => {
      if (step.id === id) found = step;
    });
    return found;
  }

  function findTask(id) {
    let found = null;
    eachStep((step) => {
      (step.tasks || []).forEach((task) => {
        if (task.id === id) found = task;
      });
    });
    return found;
  }

  const logicTask = findTask("logic-check-a4");
  if (logicTask) {
    logicTask.target = "I6";
    logicTask.formulaExample = L(
      "=IFERROR(G6/E6,0)>3000",
      "=IFERROR(G6/E6,0)>3000",
      "=IFERROR(G6/E6,0)>3000",
      "=IFERROR(G6/E6,0)>3000",
    );
    logicTask.title = L(
      "王磊的工资是否需要复核",
      "Does Wang need a pay review?",
      "王さんの給与は確認対象？",
      "王磊的薪資是否需要複核",
    );
    logicTask.lead = L(
      "在 I6 中用 IFERROR 包住 G6/E6，出错时返回 0，再判断结果是否大于 3000。",
      "In I6, wrap G6/E6 in IFERROR with 0, then test whether the result exceeds 3000.",
      "I6 で G6/E6 を IFERROR で包み、エラー時は 0 を返してから 3000 を超えるか判定します。",
      "在 I6 中用 IFERROR 包住 G6/E6，出錯時傳回 0，再判斷結果是否大於 3000。",
    );
    logicTask.hint = L(
      "参考：=IFERROR(G6/E6,0)>3000",
      "Reference: =IFERROR(G6/E6,0)>3000",
      "参考：=IFERROR(G6/E6,0)>3000",
      "參考：=IFERROR(G6/E6,0)>3000",
    );
    logicTask.success = L(
      "王磊的工资为 9472，高于 3000，应进入复核。",
      "Wang's pay is 9472, above 3000, so it needs review.",
      "王さんの給与は9472で3000を超えるため、確認対象です。",
      "王磊的薪資為 9472，高於 3000，應進入複核。",
    );
    logicTask.requiredFunction = "IFERROR";
    logicTask.requiredFunctions = ["IFERROR"];
    logicTask.sourceRefs = ["G6", "E6"];
    logicTask.strictRefs = true;
    logicTask.expectedByLanguage = Object.fromEntries(
      Object.keys(window.I18N.LANGUAGES).map((language) => [language, true]),
    );
  }

  const quoteBuilder = findStep("build-quote-amount");
  if (quoteBuilder) {
    quoteBuilder.allowEquivalentFill = true;
  }

  eachStep((step) => {
    (step.tasks || []).forEach((task) => {
      const functions = Array.isArray(task.requiredFunctions) ? task.requiredFunctions : [];
      if (functions.includes("SUBTOTAL")) {
        task.auditNote = L(
          "本题练习 SUBTOTAL 的函数编号与引用写法；当前页面不模拟 Excel 的筛选状态。",
          "This task practices SUBTOTAL's function number and references. The page does not simulate an Excel filter state.",
          "この問題では SUBTOTAL の機能番号と参照の書き方を練習します。Excel の絞り込み状態は再現しません。",
          "本題練習 SUBTOTAL 的函數編號與參照寫法；目前頁面不模擬 Excel 的篩選狀態。",
        );
      }
    });
  });
})();
