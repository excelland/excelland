(function () {
  "use strict";

  const D = window.CourseData;
  const K = window.CurriculumKit;
  const L = D.L;
  const learn = D.learnStep;
  const choice = D.choiceStep;

  function alignGoal(mode, goal) {
    if (mode === "print" && goal.margins && typeof goal.margins === "object") {
      goal.margins = "normal";
    }
    if (mode === "protect") {
      if (goal.allowEdit) goal.protectRange = goal.allowEdit;
      delete goal.allowEdit;
      delete goal.name;
    }
    if (mode === "audit") {
      const actions = {
        tracePrecedents: "precedents",
        precedents: "precedents",
        traceDependents: "dependents",
        dependents: "dependents",
        showFormulas: "showFormulas",
        evaluate: "evaluate",
      };
      goal.auditAction = actions[goal.action || goal.auditAction] || goal.action || goal.auditAction;
      if (goal.cell) goal.auditCell = goal.cell;
      delete goal.action;
      delete goal.cell;
      delete goal.sheet;
    }
    return goal;
  }

  function lab(id, title, lead, spec, hint, success, extra) {
    spec.goal = alignGoal(spec.mode, spec.goal || {});
    return D.labStep(id, title, lead, spec, hint, success, extra);
  }

  function level(id, kind, title, steps) {
    return { id, kind, title, steps };
  }

  function option(id, zh, en, ja, tw, correct, noteZh, noteEn, noteJa, noteTw) {
    return {
      id,
      text: L(zh, en, ja, tw),
      correct: Boolean(correct),
      note: L(noteZh, noteEn, noteJa, noteTw),
    };
  }

  function budgetTable() {
    return K.makeSheet([
      L("部门", "Department", "部署", "部門"),
      L("预算", "Budget", "予算", "預算"),
      L("实际", "Actual", "実績", "實際"),
      L("差异", "Variance", "差異", "差異"),
    ], [
      [L("市场", "Marketing", "マーケティング", "行銷"), 42000, 39800],
      [L("运营", "Operations", "運営", "營運"), 36500, 38120],
      [L("产品", "Product", "製品", "產品"), 51000, 49200],
      [L("客户服务", "Customer care", "カスタマーケア", "客戶服務"), 27800, 28450],
      [L("行政", "Administration", "総務", "行政"), 19600, 18900],
    ]);
  }

  const budgetCells = budgetTable();
  const summaryCells = {
    A1: L("项目", "Line item", "項目", "項目"),
    B1: L("金额", "Amount", "金額", "金額"),
    A2: L("差旅", "Travel", "旅費", "差旅"),
    A3: L("培训", "Training", "研修", "培訓"),
    A4: L("设备", "Equipment", "設備", "設備"),
    A5: L("合计", "Total", "合計", "合計"),
    B5: "=SUM(B2:B4)",
  };

  const printCells = K.makeSheet([
    L("月份", "Month", "月", "月份"),
    L("收入", "Revenue", "収入", "收入"),
    L("人员", "People", "人員", "人員"),
    L("场地", "Facilities", "施設", "場地"),
    L("运营", "Operations", "運営", "營運"),
    L("净额", "Net", "純額", "淨額"),
  ], [
    [L("七月", "July", "7月", "七月"), 186000, 72000, 48000, 31000],
    [L("八月", "August", "8月", "八月"), 174500, 70500, 46500, 29800],
    [L("九月", "September", "9月", "九月"), 201200, 73800, 47200, 30500],
    [L("十月", "October", "10月", "十月"), 193400, 72600, 46900, 30100],
    [L("十一月", "November", "11月", "十一月"), 208900, 74100, 47600, 30900],
  ], {
    F2: "=B2-C2-D2-E2",
    F3: "=B3-C3-D3-E3",
    F4: "=B4-C4-D4-E4",
    F5: "=B5-C5-D5-E5",
    F6: "=B6-C6-D6-E6",
    H1: L("审核员", "Reviewer", "確認者", "審核員"),
    H2: L("顾明", "Grace Kim", "加藤直樹", "顧明"),
    H3: L("阈值", "Threshold", "基準値", "門檻"),
    H4: 150000,
  });

  D.registerChapter({
    id: "ch13-workbook-operations",
    icon: "13",
    title: L("第 13 章 · 工作簿与工作表管理", "Chapter 13 · Workbook and Worksheet Management", "第13章 · ブックとワークシートの管理", "第 13 章 · 活頁簿與工作表管理"),
    subtitle: L("把多个工作表整理成可交接的工作簿，并掌握冻结、保护、命名区域与跨表引用。", "Organize a multi-sheet workbook for handoff, including freeze panes, protection, named ranges, and cross-sheet references.", "引き継ぎできるブックに整えるため、ウィンドウ枠の固定・保護・名前付き範囲・シート間参照を学びます。", "把多個工作表整理成可交接的活頁簿，並掌握凍結、保護、具名範圍與跨表參照。"),
    levels: [
      level(
        "wb-sheet-lifecycle",
        "lesson",
        L("建立、命名与整理工作表", "Create, Name, and Arrange Worksheets", "ワークシートの作成・名前変更・整理", "建立、命名與整理工作表"),
        [
          learn(
            "wb13-tabs-teach",
            L("工作表标签就是工作簿的目录", "Worksheet tabs are the workbook's table of contents", "ワークシートタブはブックの目次", "工作表索引標籤就是活頁簿的目錄"),
            L("一个季度的数据如果全挤在同一张表里，审计、交接和打印都会变得困难。标签页把不同目的的数据分开，也让人能按顺序找到内容。", "If a quarter's data all sits on one sheet, review, handoff, and printing become harder. Tabs separate data by purpose and give the workbook a readable order.", "四半期のデータを1枚に詰め込むと、確認・引き継ぎ・印刷が難しくなります。タブで目的ごとに分けると、内容を順番にたどれます。", "一季的資料如果全擠在同一張工作表裡，審閱、交接和列印都會變得困難。索引標籤把不同用途的資料分開，也讓人能依序找到內容。"),
            [
              L("新建工作表先命名，再放数据；名称要让别人一眼看懂用途。", "Name a new sheet before filling it; the name should state its purpose.", "新しいシートはデータを入れる前に名前を付け、用途が一目で分かるようにします。", "新增工作表先命名，再放資料；名稱要讓人一眼看懂用途。"),
              L("重命名不会移动数据；复制会保留一份副本，移动只改变标签顺序。", "Rename does not move data; Copy keeps a duplicate, while Move only changes tab order.", "名前の変更ではデータは動かず、コピーは複製を作り、移動はタブの順番だけを変えます。", "重新命名不會移動資料；複製會保留一份副本，移動只改變索引標籤順序。"),
              L("双击标签可重命名，右键菜单可复制、移动、隐藏和设置标签颜色。", "Double-click a tab to rename it; the context menu copies, moves, hides, and colors tabs.", "タブをダブルクリックすると名前を変更でき、右クリックメニューからコピー・移動・非表示・色の設定ができます。", "按兩下索引標籤可重新命名，右鍵功能表可複製、移動、隱藏和設定索引標籤色彩。"),
              L("颜色不是装饰，而是交接提示：例如蓝色表示正式数据、绿色表示汇总。", "Color is a handoff signal, not decoration: blue for source data, green for summaries, for example.", "色は飾りではなく引き継ぎの合図です。たとえば青は元データ、緑は集計を示します。", "色彩不是裝飾，而是交接提示：例如藍色表示正式資料、綠色表示彙總。"),
            ],
            L("先把标签按“原始数据—计算—汇总—说明”排序，再开始填数。", "Arrange tabs as source, calculation, summary, and notes before filling in data.", "元データ、計算、集計、メモの順に並べてから入力すると整理しやすくなります。", "先依「原始資料—計算—彙總—說明」排序，再開始輸入資料。"),
            L("添加工作表的快捷键是 Shift+F11；复制整张表时可在拖动标签时按住 Ctrl。", "Shift+F11 inserts a sheet; hold Ctrl while dragging a tab to copy it.", "Shift+F11 でシートを追加でき、Ctrl を押しながらタブをドラッグすると複製できます。", "新增工作表的快捷鍵是 Shift+F11；複製整張工作表時可在拖曳索引標籤時按住 Ctrl。")
          ),
          lab(
            "wb13-add-lab",
            L("引导实验：补上部门汇总页", "Guided lab: add a department summary tab", "ガイド付き実験：部門集計タブを追加", "引導實驗：補上部門彙總頁"),
            L("季度预算工作簿目前只有 Q3_Budget。请新增一张名为 Dept_Summary 的工作表，供部门负责人填写汇总。", "The quarterly budget workbook currently contains only Q3_Budget. Add a worksheet named Dept_Summary for department owners to complete.", "四半期予算ブックには現在 Q3_Budget だけがあります。部門担当者が集計を記入できるよう、Dept_Summary というシートを追加してください。", "季度預算活頁簿目前只有 Q3_Budget。請新增一張名為 Dept_Summary 的工作表，供部門負責人填寫彙總。"),
            {
              kind: "workbook",
              mode: "sheets",
              workbook: {
                active: "Q3_Budget",
                sheets: [{ name: "Q3_Budget", cells: budgetCells, tabColor: "blue", hidden: false }],
              },
              ranges: { budgetTable: "Q3_Budget!A1:D6" },
              options: { availableSheets: ["Q3_Budget"], newSheetName: "Dept_Summary" },
              goal: { operation: "add", name: "Dept_Summary" },
            },
            L("在底部标签栏使用“新建工作表”，随后马上把默认名称改为 Dept_Summary。", "Use the new-sheet control at the tab bar, then rename the default tab to Dept_Summary right away.", "タブバーの新しいシートを使い、既定の名前をすぐ Dept_Summary に変更します。", "在底部索引標籤列使用「新增工作表」，隨後來把預設名稱改為 Dept_Summary。"),
            L("新工作簿现在有了独立的汇总页，原始预算没有被改动。", "The workbook now has a separate summary tab and the source budget is unchanged.", "ブックに集計用タブが追加され、元の予算データは変わっていません。", "活頁簿現在有獨立的彙總頁，原始預算沒有被改動。")
          ),
          lab(
            "wb13-rename-lab",
            L("引导实验：给临时表一个明确名称", "Guided lab: give the temporary sheet a clear name", "ガイド付き実験：一時シートに明確な名前を付ける", "引導實驗：給暫存工作表明確名稱"),
            L("Sheet1 里放的是各区办公室地址。请把它重命名为 Regional_Map，方便后续做跨表查询。", "Sheet1 contains regional office addresses. Rename it to Regional_Map so later cross-sheet lookups have a clear source.", "Sheet1 には地域事務所の住所が入っています。後でシート間検索に使えるよう、Regional_Map に名前を変更してください。", "Sheet1 裡放的是各區辦公室地址。請將它重新命名為 Regional_Map，方便後續做跨表查詢。"),
            {
              kind: "workbook",
              mode: "sheets",
              workbook: {
                active: "Sheet1",
                sheets: [
                  { name: "Q3_Budget", cells: { A1: L("部门", "Department", "部署", "部門"), B1: L("预算", "Budget", "予算", "預算"), A2: L("运营", "Operations", "運営", "營運"), B2: 36500 }, tabColor: "blue", hidden: false },
                  { name: "Sheet1", cells: { A1: L("城市", "City", "都市", "城市"), B1: L("办公室", "Office", "オフィス", "辦公室"), A2: L("苏州", "Suzhou", "蘇州", "蘇州"), B2: L("园区中心", "Park Centre", "パークセンター", "園區中心") }, tabColor: "none", hidden: false },
                ],
              },
              ranges: { regionalMap: "Sheet1!A1:B2" },
              options: { targetSheet: "Sheet1", suggestedName: "Regional_Map" },
              goal: { operation: "rename", from: "Sheet1", to: "Regional_Map" },
            },
            L("双击 Sheet1 标签，输入完整名称后按 Enter。改名不会影响单元格内容。", "Double-click the Sheet1 tab, type the full name, and press Enter. Renaming does not change the cells.", "Sheet1 タブをダブルクリックし、正式な名前を入力して Enter を押します。セルの内容は変わりません。", "按兩下 Sheet1 索引標籤，輸入完整名稱後按 Enter。改名不會影響儲存格內容。")
          ),
          choice(
            "wb13-rename-copy-choice",
            L("要保留预算模板并另建一个十月版本，应使用哪项操作？", "You need to keep the budget template and create a separate October version. Which operation fits?", "予算テンプレートを残し、別に10月版を作るにはどれを使いますか。", "要保留預算範本並另建一個十月版本，應使用哪項操作？"),
            L("判断是要“同一份内容继续修改”，还是“从同一份内容出发另存一个版本”。", "Decide whether you are continuing with the same content or starting a separate version from it.", "同じ内容を編集し続けるのか、その内容から別バージョンを作るのかで選びます。", "判斷是要「同一份內容繼續修改」，還是「從同一份內容出發另存一個版本」。"),
            [
              option("copy", "复制工作表，再把副本改名", "Copy the worksheet, then rename the copy", "シートをコピーしてから複製側の名前を変える", "複製工作表，再把副本重新命名", true, "复制会保留原表和公式结构，适合派生新月份。", "Copy preserves the original and its formula structure, which suits a new month.", "コピーなら元シートと数式構成を残したまま新しい月を作れます。", "複製會保留原工作表和公式結構，適合衍生新月份。"),
              option("move", "移动工作表", "Move the worksheet", "シートを移動する", "移動工作表", false, "移动只改变位置，不会产生第二个版本。", "Move only changes position; it does not create a second version.", "移動は位置を変えるだけで、2つ目の版はできません。", "移動只改變位置，不會產生第二個版本。"),
              option("hide", "隐藏工作表", "Hide the worksheet", "シートを非表示にする", "隱藏工作表", false, "隐藏没有创建副本，取消隐藏后仍是同一张表。", "Hiding does not create a copy; unhiding returns the same sheet.", "非表示では複製は作られず、再表示しても同じシートです。", "隱藏不會建立副本，取消隱藏後仍是同一張工作表。"),
            ],
            L("保留原文并派生新版本用复制；调整现有标签顺序用移动。", "Use Copy to preserve the original and create a new version; use Move to change tab order.", "元を残して新版を作るならコピー、現在のタブ順を変えるなら移動です。", "保留原文並衍生新版本用複製；調整現有索引標籤順序用移動。")
          ),
        ]
      ),
      level(
        "wb-sheet-organize",
        "lesson",
        L("复制、移动与标签提示", "Copy, Move, and Label Tabs Clearly", "シートのコピー・移動とタブ表示", "複製、移動與索引標籤提示"),
        [
          learn(
            "wb13-organize-teach",
            L("版本、位置和颜色要一起管理", "Manage version, position, and color together", "版・位置・色をまとめて整える", "版本、位置和色彩要一起管理"),
            L("复制出来的工作表不会自动改名，必须检查副本名称和公式。移动则只改变标签顺序，不能替代版本管理。", "A copied sheet does not rename itself; check the copy's name and formulas. Moving changes tab order only and is not version control.", "コピーしたシートは自動で名前が変わりません。複製名と数式を確認してください。移動はタブ順を変えるだけで、版管理の代わりにはなりません。", "複製出的工作表不會自動改名，必須檢查副本名稱和公式。移動只改變索引標籤順序，不能取代版本管理。"),
            [
              L("复制整张表会同时复制单元格、公式和格式，引用可能仍指向原表或原外部文件。", "Copying a sheet carries cells, formulas, and formats; references may still point to the original sheet or external file.", "シート全体をコピーするとセル・数式・書式も複製され、参照先が元シートや外部ファイルのままの場合があります。", "複製整張工作表會同時複製儲存格、公式和格式，參照可能仍指向原工作表或原外部檔案。"),
              L("移动工作表可拖动标签，也可在右键菜单选择“移动或复制”。", "Move a sheet by dragging its tab or by using Move or Copy in the context menu.", "タブをドラッグするか、右クリックメニューの「移動またはコピー」で移動できます。", "移動工作表可拖曳索引標籤，也可在右鍵功能表選擇「移動或複製」。"),
              L("标签颜色应对应固定约定，并在交接说明中写清楚。", "Tab colors should follow a fixed convention and be documented in the handoff note.", "タブの色は決めたルールに従い、引き継ぎメモにも明記します。", "索引標籤色彩應依固定約定使用，並在交接說明中寫清楚。"),
            ],
            L("复制后先改名为版本名，再检查汇总公式引用的工作表是否正确。", "After copying, rename it as a version first, then confirm summary formulas point to the intended sheet.", "コピー後はまず版名に変更し、その後に集計式の参照先を確認します。", "複製後先改名為版本名稱，再檢查彙總公式參照的工作表是否正確。"),
            L("从会计年度预算派生下一季副本时，最稳妥的做法是复制后立即标记版本并检查跨表引用。", "When deriving next quarter from an annual budget, copy it, mark the version immediately, and recheck cross-sheet references.", "年度予算から翌四半期版を作る場合は、複製直後に版を明記し、シート間参照を確認します。", "從會計年度預算衍生下一季副本時，最穩妥的做法是複製後立即標記版本並檢查跨表參照。")
          ),
          lab(
            "wb13-copy-lab",
            L("引导实验：从三季度复制四季度底稿", "Guided lab: copy the Q3 base into Q4", "ガイド付き実験：第3四半期から第4四半期を作る", "引導實驗：從第三季複製第四季底稿"),
            L("Q3_Budget 的结构可以沿用。请复制这张工作表，并把副本命名为 Q4_Budget，原始 Q3_Budget 保留不动。", "Keep the Q3_Budget structure. Copy the sheet and name the copy Q4_Budget while leaving the original untouched.", "Q3_Budget の構成をそのまま使います。シートをコピーし、元を残して複製側を Q4_Budget にしてください。", "Q3_Budget 的結構可以沿用。請複製這張工作表，並把副本命名為 Q4_Budget，原始 Q3_Budget 保持不動。"),
            {
              kind: "workbook",
              mode: "sheets",
              workbook: {
                active: "Q3_Budget",
                sheets: [
                  { name: "Q3_Budget", cells: budgetCells, tabColor: "blue", hidden: false },
                  { name: "Notes", cells: { A1: L("说明", "Note", "メモ", "說明"), A2: L("预算以千元为单位", "Budget figures are in thousands", "予算は千円単位です", "預算以千元為單位") }, tabColor: "none", hidden: false },
                ],
              },
              ranges: { sourceTable: "Q3_Budget!A1:D6" },
              options: { copyFrom: "Q3_Budget", copyTo: "Q4_Budget" },
              goal: { operation: "copy", from: "Q3_Budget", to: "Q4_Budget" },
            },
            L("右键 Q3_Budget 标签选择“移动或复制”，勾选“建立副本”，再给新标签改名。", "Right-click Q3_Budget, choose Move or Copy, tick Create a copy, then rename the new tab.", "Q3_Budget を右クリックして「移動またはコピー」を選び、「コピーを作成する」にチェックして新しいタブの名前を変えます。", "右鍵 Q3_Budget 索引標籤選擇「移動或複製」，勾選「建立副本」，再給新索引標籤改名。"),
            L("Q4_Budget 已成为独立副本，原表仍然完整保留。", "Q4_Budget is now a separate copy and the original remains intact.", "Q4_Budget は独立した複製になり、元のシートもそのまま残っています。", "Q4_Budget 已成為獨立副本，原工作表仍完整保留。")
          ),
          lab(
            "wb13-move-lab",
            L("引导实验：把说明页放到预算之后", "Guided lab: move Notes after the budget", "ガイド付き実験：メモを予算の後ろへ移動", "引導實驗：把說明頁移到預算之後"),
            L("交接时读者应先看到 Q3_Budget，再看 Notes。当前 Notes 在前面，请把 Notes 移到第二位。", "A reviewer should see Q3_Budget first and Notes second. Notes currently comes first, so move Notes to the second position.", "引き継ぎでは Q3_Budget を先に、Notes を後に見せます。現在は Notes が先なので、Notes を2番目へ移動してください。", "交接時讀者應先看到 Q3_Budget，再看 Notes。目前 Notes 在前面，請把 Notes 移到第二位。"),
            {
              kind: "workbook",
              mode: "sheets",
              workbook: {
                active: "Notes",
                sheets: [
                  { name: "Notes", cells: { A1: L("说明", "Note", "メモ", "說明"), A2: L("九月三十日封账", "Books close on 30 September", "9月30日に締めます", "九月三十日關帳") }, tabColor: "none", hidden: false },
                  { name: "Q3_Budget", cells: budgetCells, tabColor: "blue", hidden: false },
                ],
              },
              ranges: { sourceTable: "Q3_Budget!A1:D6" },
              options: { movingSheet: "Notes", targetPosition: 2 },
              goal: { operation: "move", name: "Notes", position: 2 },
            },
            L("拖动 Notes 标签到 Q3_Budget 后面；若使用菜单，选择“移动或复制”并指定 Q3_Budget 之后。", "Drag the Notes tab after Q3_Budget, or use Move or Copy and place it after Q3_Budget.", "Notes タブを Q3_Budget の後ろへドラッグするか、「移動またはコピー」で Q3_Budget の後を指定します。", "拖曳 Notes 索引標籤到 Q3_Budget 後面；若使用功能表，選擇「移動或複製」並指定 Q3_Budget 之後。"),
            L("工作表顺序现在与阅读顺序一致，数据没有被改写。", "Tab order now matches the reading order and no data was rewritten.", "タブ順が読み順と一致し、データは書き換わっていません。", "工作表順序現在與閱讀順序一致，資料沒有被改寫。")
          ),
          lab(
            "wb13-tabcolor-lab",
            L("引导实验：用绿色标记汇总页", "Guided lab: mark the summary tab green", "ガイド付き実験：集計タブを緑で示す", "引導實驗：用綠色標記彙總頁"),
            L("团队约定绿色代表汇总页。请把 Dept_Summary 的标签颜色设为 green，方便周会时快速找到。", "The team convention uses green for summary sheets. Set Dept_Summary to the green tab color for quick access in the weekly meeting.", "チームでは集計シートを緑にすると決めています。週会で探しやすいよう、Dept_Summary のタブを緑にしてください。", "團隊約定綠色代表彙總頁。請把 Dept_Summary 的索引標籤色彩設為綠色，方便週會時快速找到。"),
            {
              kind: "workbook",
              mode: "sheets",
              workbook: {
                active: "Dept_Summary",
                sheets: [
                  { name: "Q3_Budget", cells: budgetCells, tabColor: "blue", hidden: false },
                  { name: "Dept_Summary", cells: summaryCells, tabColor: "none", hidden: false },
                ],
              },
              ranges: { summaryTable: "Dept_Summary!A1:B5" },
              options: { targetSheet: "Dept_Summary", colors: ["none", "blue", "green"] },
              goal: { operation: "tabColor", name: "Dept_Summary", color: "green" },
            },
            L("右键 Dept_Summary 标签，选择“标签颜色”，再选绿色。", "Right-click Dept_Summary, open Tab Color, and select green.", "Dept_Summary を右クリックし、「タブの色」から緑を選びます。", "右鍵 Dept_Summary 索引標籤，選擇「索引標籤色彩」，再選綠色。"),
            L("汇总页已经按团队颜色约定标记，其他标签保持不变。", "The summary tab follows the team color convention and the other tabs are unchanged.", "集計タブがチームの色ルールに従い、他のタブは変わっていません。", "彙總頁已依團隊色彩約定標記，其他索引標籤保持不變。")
          ),
        ]
      ),
      level(
        "wb-sheet-control",
        "lesson",
        L("冻结、保护与隐藏", "Freeze, Protect, and Hide", "ウィンドウ枠の固定・保護・非表示", "凍結、保護與隱藏"),
        [
          learn(
            "wb13-control-teach",
            L("让工作簿既好看又不容易被误改", "Keep the workbook readable and hard to damage by accident", "見やすく、誤って壊しにくいブックにする", "讓活頁簿既清楚又不容易被誤改"),
            L("冻结窗格固定表头或姓名列，滚动时仍然看得见。保护工作表限制编辑，但可先解锁允许填写的区域。隐藏标签用于暂存，不应替代备份。", "Freeze panes keep headers or names visible while scrolling. Sheet protection blocks edits, but you can unlock the cells people must fill. Hidden tabs are for temporary material, not backups.", "ウィンドウ枠の固定は表頭や氏名列をスクロール中も見せます。シート保護は編集を制限し、入力してよい範囲だけ先にロック解除できます。非表示タブは一時的な保管用で、バックアップの代わりではありません。", "凍結窗格固定表頭或姓名欄，捲動時仍然看得見。保護工作表會限制編輯，但可先解除允許填寫的區域。隱藏索引標籤只適合暫存，不應取代備份。"),
            [
              L("冻结 A1 没有效果；冻结 B2 会同时固定第 1 行和 A 列。", "Freezing at A1 has no effect; freezing at B2 keeps row 1 and column A visible.", "A1 での固定は効果がなく、B2 で固定すると1行目とA列が残ります。", "凍結 A1 沒有作用；凍結 B2 會同時固定第 1 列和 A 欄。"),
              L("冻结位置与当前选择有关，先选中目标单元格再执行“冻结窗格”。", "The freeze point follows the current selection, so select the cell before choosing Freeze Panes.", "固定位置は選択中のセルで決まるため、先に対象セルを選んでから固定します。", "凍結位置與目前選取範圍有關，先選取目標儲存格再執行「凍結窗格」。"),
              L("保护工作表前，先解除需要输入的单元格锁定；否则受保护后任何人都不能改。", "Before protecting a sheet, unlock the cells that must accept input; otherwise nobody can edit them after protection.", "シート保護の前に、入力が必要なセルのロックを解除します。そうしないと保護後に誰も編集できません。", "保護工作表前，先解除需要輸入的儲存格鎖定；否則受保護後任何人都不能修改。"),
              L("隐藏工作表不会删除内容，取消隐藏即可恢复；但持有工作簿的人仍可取消隐藏。", "Hiding a sheet does not delete it and it can be unhidden, so hiding is not security.", "シートの非表示は削除ではなく再表示できます。したがって非表示だけでは機密保護になりません。", "隱藏工作表不會刪除內容，取消隱藏即可恢復；但持有活頁簿的人仍可取消隱藏。"),
            ],
            L("只有需要填写的区域才解锁；公式和表头应保持锁定。", "Unlock only the input area; keep formulas and headers locked.", "入力範囲だけロックを解除し、数式と表頭はロックしたままにします。", "只有需要填寫的區域才解除鎖定；公式和表頭應保持鎖定。"),
            L("工作表保护密码不能找回，交接时必须存入受控的密码管理记录。", "A sheet-protection password cannot be recovered, so store it in a controlled password record for handoff.", "シート保護のパスワードは復元できないため、引き継ぎ用の管理記録に保管します。", "工作表保護密碼不能找回，交接時必須存入受控的密碼管理紀錄。")
          ),
          lab(
            "wb13-hide-lab",
            L("迁移实验：收起已归档的草稿", "Transfer lab: hide the archived draft", "転用実験：アーカイブ済み下書きを隠す", "遷移實驗：收起已封存的草稿"),
            L("Draft_2025 是去年已经归档的草稿，周会时不应出现在标签栏。请隐藏这张工作表，不要删除。", "Draft_2025 is an archived draft from last year and should not appear during the weekly meeting. Hide the sheet without deleting it.", "Draft_2025 は昨年アーカイブ済みの下書きで、週会では表示不要です。削除せず非表示にしてください。", "Draft_2025 是去年已經封存的草稿，週會時不應出現在索引標籤列。請隱藏這張工作表，不要刪除。"),
            {
              kind: "workbook",
              mode: "sheets",
              workbook: {
                active: "Draft_2025",
                sheets: [
                  { name: "Q3_Budget", cells: budgetCells, tabColor: "blue", hidden: false },
                  { name: "Dept_Summary", cells: summaryCells, tabColor: "green", hidden: false },
                  { name: "Draft_2025", cells: { A1: L("旧稿", "Old draft", "旧下書き", "舊稿"), A2: L("仅存档", "Archive only", "保存のみ", "僅封存") }, tabColor: "none", hidden: false },
                ],
              },
              ranges: { activeBudget: "Q3_Budget!A1:D6" },
              options: { targetSheet: "Draft_2025" },
              goal: { operation: "hide", name: "Draft_2025" },
            },
            L("右键 Draft_2025 标签，选择“隐藏”。隐藏后可通过“取消隐藏”恢复。", "Right-click Draft_2025 and choose Hide. Unhide restores it later.", "Draft_2025 を右クリックして「非表示」を選びます。後で「再表示」で戻せます。", "右鍵 Draft_2025 索引標籤，選擇「隱藏」。隱藏後可透過「取消隱藏」恢復。"),
            L("草稿标签已隐藏，预算和汇总页仍然可见。", "The draft tab is hidden while the budget and summary tabs remain visible.", "下書きタブが非表示になり、予算と集計タブは表示されたままです。", "草稿索引標籤已隱藏，預算和彙總頁仍然可見。")
          ),
          lab(
            "wb13-freeze-lab",
            L("迁移实验：滚动时固定表头和部门列", "Transfer lab: keep headers and departments visible", "転用実験：表頭と部門列を固定する", "遷移實驗：捲動時固定表頭和部門欄"),
            L("预算表较长，向下滚动后看不到表头。请在 B2 执行冻结窗格，让第 1 行和 A 列始终可见。", "The budget table is long and the header scrolls away. Freeze panes at B2 so row 1 and column A stay visible.", "予算表が長く、下へスクロールすると表頭が見えなくなります。B2 でウィンドウ枠を固定し、1行目とA列を残してください。", "預算表較長，向下捲動後看不到表頭。請在 B2 執行凍結窗格，讓第 1 列和 A 欄始終可見。"),
            {
              kind: "workbook",
              mode: "freeze",
              workbook: {
                active: "Q3_Budget",
                sheets: [{ name: "Q3_Budget", cells: Object.assign({}, budgetCells, {
                  A9: L("信息技术", "Information technology", "情報技術", "資訊科技"), B9: 33200, C9: 31800,
                  A10: L("法务", "Legal", "法務", "法務"), B10: 18400, C10: 17950,
                }), tabColor: "blue", hidden: false }],
              },
              ranges: { budgetTable: "Q3_Budget!A1:D10" },
              options: { freezeAt: "B2" },
              goal: { operation: "freeze", cell: "B2" },
            },
            L("先选中 B2，再到“视图”→“冻结窗格”→“冻结至第 1 行和 A 列”。", "Select B2, then choose View, Freeze Panes, and Freeze at row 1 and column A.", "B2 を選び、「表示」→「ウィンドウ枠の固定」で1行目とA列を固定します。", "先選取 B2，再到「檢視」→「凍結窗格」→「凍結至第 1 列和 A 欄」。"),
            L("滚动表头与部门名称保持可见，冻结位置正确。", "Headers and department names remain visible while scrolling.", "スクロールしても表頭と部門名が見えたままです。", "捲動時表頭與部門名稱保持可見，凍結位置正確。")
          ),
          lab(
            "wb13-protect-lab",
            L("迁移实验：保护公式，只开放输入区", "Transfer lab: protect formulas but leave inputs open", "転用実験：数式を守り入力欄だけ開ける", "遷移實驗：保護公式，只開放輸入區"),
            L("预算表中 C2:C9 是各部门实际支出，需要允许填写；其他区域应锁定。请保护 Q3_Budget，并把 C2:C9 设为可编辑范围。", "C2:C9 holds each department's actual spend and must remain editable; everything else should be locked. Protect Q3_Budget and allow edits in C2:C9.", "C2:C9 は各部署の実績支出なので入力を許可し、それ以外はロックします。Q3_Budget を保護し、C2:C9 のみ編集可能にしてください。", "預算表中 C2:C9 是各部門實際支出，需要允許填寫；其他區域應鎖定。請保護 Q3_Budget，並把 C2:C9 設為可編輯範圍。"),
            {
              kind: "workbook",
              mode: "protect",
              workbook: {
                active: "Q3_Budget",
                sheets: [{ name: "Q3_Budget", cells: budgetCells, tabColor: "blue", hidden: false }],
              },
              ranges: { editableInputs: "Q3_Budget!C2:C9", budgetTable: "Q3_Budget!A1:D6" },
              options: { protectSheet: "Q3_Budget", allowEdit: "C2:C9" },
              goal: { operation: "protect", scope: "sheet", name: "Q3_Budget", allowEdit: "C2:C9" },
            },
            L("先解除 C2:C9 的“锁定”，再执行“审阅”→“保护工作表”，确认允许选择未锁定单元格。", "Unlock C2:C9 first, then use Review, Protect Sheet, and allow selecting unlocked cells.", "まず C2:C9 のロックを解除し、「校閲」→「シートの保護」でロックされていないセルの選択を許可します。", "先解除 C2:C9 的「鎖定」，再執行「校閱」→「保護工作表」，確認允許選取未鎖定儲存格。"),
            L("公式已受保护，输入区仍可编辑，权限边界符合要求。", "Formulas are protected while the input area stays editable.", "数式は保護され、入力範囲は編集可能なままです。", "公式已受保護，輸入區仍可編輯，權限邊界符合要求。")
          ),
        ]
      ),
      level(
        "wb-links-review",
        "review",
        L("复习：命名区域与跨表汇总", "Review: names and cross-sheet totals", "復習：名前付き範囲とシート間集計", "複習：具名範圍與跨表彙總"),
        [
          learn(
            "wb13-links-teach",
            L("让公式读懂工作表名称", "Teach formulas to read worksheet names", "数式にシート名を読み込ませる", "讓公式讀懂工作表名稱"),
            L("工作簿变大后，写死单元格或工作表名会让公式难维护。命名区域给范围一个可读名称，跨表引用则把工作表名放在感叹号前。3-D 引用用冒号连接多张结构相同的工作表。", "As a workbook grows, hard-coded cells and sheet names become hard to maintain. A named range gives a readable name to a range; a cross-sheet reference puts the sheet name before an exclamation mark. A 3-D reference uses a colon between structurally identical sheets.", "ブックが大きくなると、セル番地やシート名を直接書いた数式は保守しにくくなります。名前付き範囲は範囲に読みやすい名前を付け、シート間参照はシート名の後に感嘆符を置きます。3D参照は同じ構成のシートをコロンでつなぎます。", "活頁簿變大後，寫死儲存格或工作表名稱會讓公式難維護。具名範圍給範圍一個可讀名稱，跨表參照則把工作表名稱放在驚嘆號前。3D 參照用冒號連接多張結構相同的工作表。"),
            [
              L("命名区域引用要明确工作表，例如 Q3_Budget!$B$2:$B$9。", "A defined name should include the sheet, such as Q3_Budget!$B$2:$B$9.", "名前付き範囲は Q3_Budget!$B$2:$B$9 のようにシート名を含めます。", "具名範圍參照要明確工作表，例如 Q3_Budget!$B$2:$B$9。"),
              L("单表引用写作 Q3_Budget!C2；工作表名含空格时要加单引号。", "A single-sheet reference looks like Q3_Budget!C2; quote sheet names that contain spaces.", "単一シート参照は Q3_Budget!C2 の形です。空白を含むシート名は引用符で囲みます。", "單表參照寫作 Q3_Budget!C2；工作表名稱含空格時要加單引號。"),
              L("3-D 引用例如 SUM(Q1:Q3!B2:B6)，要求这些工作表结构一致。", "A 3-D reference such as SUM(Q1:Q3!B2:B6) requires those sheets to share the same layout.", "SUM(Q1:Q3!B2:B6) のような3D参照では、対象シートの構成をそろえます。", "3D 參照例如 SUM(Q1:Q3!B2:B6)，要求這些工作表結構一致。"),
              L("先取消隐藏需要检查的工作表，再执行引用和审计；隐藏标签仍可被公式引用。", "Unhide sheets that need review before auditing them; formulas can still refer to hidden tabs.", "確認するシートは先に再表示します。非表示タブも数式から参照できます。", "先取消隱藏需要檢查的工作表，再執行參照和稽核；隱藏索引標籤仍可被公式參照。"),
            ],
            L("在名称管理器中检查引用范围，在公式栏中检查工作表名是否拼写正确。", "Check the range in Name Manager and the exact sheet spelling in the formula bar.", "名前の管理で範囲を、数式バーでシート名のつづりを確認します。", "在名稱管理員檢查參照範圍，在資料編輯列檢查工作表名稱是否拼寫正確。"),
            L("跨表引用最安全的检查方式，是把源表和汇总表并排放，逐项对照合计。", "The safest cross-sheet check is to place source and summary data side by side and compare each total.", "シート間参照は、元シートと集計シートを並べて各合計を照合すると安全です。", "跨表參照最安全的檢查方式，是把來源工作表與彙總表並排放，逐項對照合計。")
          ),
          lab(
            "wb13-unhide-lab",
            L("复习实验：恢复待复核的往年数据", "Review lab: restore prior-year data for checking", "復習実験：確認用に前年データを再表示", "複習實驗：恢復待複核的往年資料"),
            L("审计员需要对照 Prior_Year 的预算。请取消隐藏这张工作表，再完成后续命名区域。", "The auditor needs the Prior_Year budget for comparison. Unhide that worksheet before creating the named range.", "監査担当が Prior_Year の予算と照合します。シートを再表示してから名前付き範囲を作成してください。", "稽核員需要對照 Prior_Year 的預算。請取消隱藏這張工作表，再完成後續具名範圍。"),
            {
              kind: "workbook",
              mode: "sheets",
              workbook: {
                active: "Q3_Budget",
                sheets: [
                  { name: "Q3_Budget", cells: budgetCells, tabColor: "blue", hidden: false },
                  { name: "Prior_Year", cells: { A1: L("部门", "Department", "部署", "部門"), B1: L("去年预算", "Prior budget", "前年予算", "去年預算"), A2: L("市场", "Marketing", "マーケティング", "行銷"), B2: 39000 }, tabColor: "none", hidden: true },
                ],
              },
              ranges: { priorBudget: "Prior_Year!A1:B2" },
              options: { hiddenSheet: "Prior_Year" },
              goal: { operation: "unhide", name: "Prior_Year" },
            },
            L("右键任意可见标签，选择“取消隐藏”，再选中 Prior_Year。", "Right-click a visible tab, choose Unhide, and select Prior_Year.", "表示中のタブを右クリックして「再表示」を選び、Prior_Year を指定します。", "右鍵任一可見索引標籤，選擇「取消隱藏」，再選取 Prior_Year。"),
            L("往年数据已恢复为可见工作表，可以参与审计对照。", "Prior-year data is visible again and ready for comparison.", "前年データが再表示され、照合できる状態です。", "往年資料已恢復為可見工作表，可以參與稽核對照。")
          ),
          lab(
            "wb13-namedrange-lab",
            L("复习实验：为实际支出建立命名区域", "Review lab: define the actual-spend range", "復習実験：実績支出の名前付き範囲を作成", "複習實驗：為實際支出建立具名範圍"),
            L("汇总公式将反复使用 Q3_Budget 的 B2:B9。请新建名称 Budget_Actual，引用 Q3_Budget!$B$2:$B$9。", "Summary formulas will repeatedly use Q3_Budget B2:B9. Create a defined name called Budget_Actual that refers to Q3_Budget!$B$2:$B$9.", "集計式で Q3_Budget の B2:B9 を繰り返し使います。Budget_Actual という名前を作成し、Q3_Budget!$B$2:$B$9 を参照させてください。", "彙總公式將反覆使用 Q3_Budget 的 B2:B9。請新增名稱 Budget_Actual，參照 Q3_Budget!$B$2:$B$9。"),
            {
              kind: "workbook",
              mode: "namedRange",
              workbook: {
                active: "Q3_Budget",
                sheets: [
                  { name: "Q3_Budget", cells: budgetCells, tabColor: "blue", hidden: false },
                  { name: "Prior_Year", cells: { A1: L("部门", "Department", "部署", "部門"), B1: L("去年预算", "Prior budget", "前年予算", "去年預算"), A2: L("市场", "Marketing", "マーケティング", "行銷"), B2: 39000 }, tabColor: "none", hidden: false },
                ],
              },
              ranges: { actualSpend: "Q3_Budget!B2:B9" },
              options: { name: "Budget_Actual", refersTo: "Q3_Budget!$B$2:$B$9" },
              goal: { operation: "namedRange", name: "Budget_Actual", refersTo: "Q3_Budget!$B$2:$B$9" },
            },
            L("打开“公式”→“名称管理器”→“新建”，名称不加空格，引用位置保留绝对列标。", "Open Formulas, Name Manager, New; use no spaces in the name and keep absolute column references.", "「数式」→「名前の管理」→「新規作成」で、名前に空白を入れず、参照位置は絶対列参照にします。", "開啟「公式」→「名稱管理員」→「新增」，名稱不加空格，參照位置保留絕對欄參照。"),
            L("Budget_Actual 已指向正确的跨表范围，汇总公式可以直接引用。", "Budget_Actual points to the correct cross-sheet range and is ready for summary formulas.", "Budget_Actual が正しいシート間範囲を指し、集計式から直接使えます。", "Budget_Actual 已指向正確的跨表範圍，彙總公式可以直接參照。")
          ),
          lab(
            "wb13-multisheet-lab",
            L("复习实验：用 3-D 引用汇总三个季度", "Review lab: total three quarters with a 3-D reference", "復習実験：3D参照で3四半期を集計", "複習實驗：用 3D 參照彙總三個季度"),
            L("Summary 表 B2:B6 要用一个公式汇总 Q1、Q2、Q3 三张结构相同工作表的 B2:B6。请写入 3-D SUM 公式。", "Summary B2:B6 needs one formula that totals B2:B6 across the identically structured Q1, Q2, and Q3 sheets. Enter a 3-D SUM formula.", "Summary の B2:B6 は、同じ構成の Q1・Q2・Q3 の B2:B6 を1つの式で合計します。3D SUM を入力してください。", "Summary 表 B2:B6 要用一個公式彙總 Q1、Q2、Q3 三張結構相同工作表的 B2:B6。請寫入 3D SUM 公式。"),
            {
              kind: "workbook",
              mode: "multiSheet",
              workbook: {
                active: "Summary",
                sheets: [
                  { name: "Q1", cells: K.makeSheet([L("部门", "Department", "部署", "部門"), L("金额", "Amount", "金額", "金額")], [[L("运营", "Operations", "運営", "營運"), 12000], [L("市场", "Marketing", "マーケティング", "行銷"), 9000]]), tabColor: "blue", hidden: false },
                  { name: "Q2", cells: K.makeSheet([L("部门", "Department", "部署", "部門"), L("金额", "Amount", "金額", "金額")], [[L("运营", "Operations", "運営", "營運"), 13500], [L("市场", "Marketing", "マーケティング", "行銷"), 9800]]), tabColor: "blue", hidden: false },
                  { name: "Q3", cells: K.makeSheet([L("部门", "Department", "部署", "部門"), L("金额", "Amount", "金額", "金額")], [[L("运营", "Operations", "運営", "營運"), 14100], [L("市场", "Marketing", "マーケティング", "行銷"), 10300]]), tabColor: "blue", hidden: false },
                  { name: "Summary", cells: { A1: L("部门", "Department", "部署", "部門"), B1: L("三季合计", "Three-quarter total", "3四半期合計", "三季合計"), A2: L("运营", "Operations", "運営", "營運"), A3: L("市场", "Marketing", "マーケティング", "行銷") }, tabColor: "green", hidden: false },
                ],
              },
              ranges: { quarterRange: "Q1:Q3!B2:B6", summaryTarget: "Summary!B2:B6" },
              options: { targetSheet: "Summary", formula: "=SUM(Q1:Q3!B2:B6)" },
              goal: { operation: "formula", sheet: "Summary", cell: "B2", formula: "=SUM(Q1:Q3!B2:B6)" },
            },
            L("3-D 引用写法是首表:末表!区域，例如 =SUM(Q1:Q3!B2:B6)；工作表名之间用冒号。", "A 3-D reference uses first:last!range, for example =SUM(Q1:Q3!B2:B6); separate sheet names with a colon.", "3D参照は 先頭:末尾!範囲 の形です。例：=SUM(Q1:Q3!B2:B6)。シート名はコロンでつなぎます。", "3D 參照寫法是首表:末表!範圍，例如 =SUM(Q1:Q3!B2:B6)；工作表名稱之間用冒號。"),
            L("三个季度的数据已由一条 3-D 公式汇总，汇总表与源表结构一致。", "One 3-D formula now totals all three quarters, and the summary layout matches the source sheets.", "3四半期分が1つの3D数式で集計され、集計表の構成は元シートと一致しています。", "三個季度的資料已由一條 3D 公式彙總，彙總表與來源工作表結構一致。")
          ),
        ]
      ),
    ],
  });

  D.registerChapter({
    id: "ch14-print-audit",
    icon: "14",
    title: L("第 14 章 · 页面布局、打印与公式审计", "Chapter 14 · Page Layout, Printing, and Formula Auditing", "第14章 · ページ設定・印刷・数式監査", "第 14 章 · 版面設定、列印與公式稽核"),
    subtitle: L("把表格打印成可阅读的纸面报告，并用追踪、显示公式和求值工具找出公式问题。", "Turn a sheet into a readable printed report and use tracing, formula display, and evaluation tools to diagnose formulas.", "表を読みやすい印刷物に整え、参照元・参照先の追跡、数式の表示、数式の評価で問題を特定します。", "把表格列印成可閱讀的紙本報告，並用追蹤、顯示公式和求值工具找出公式問題。"),
    levels: [
      level(
        "wb-print-basics",
        "lesson",
        L("先确定纸张和打印范围", "Set paper and print area first", "用紙と印刷範囲を先に決める", "先確定紙張和列印範圍"),
        [
          learn(
            "wb14-print-teach",
            L("打印不是点一下按钮，而是排一页报告", "Printing is report layout, not just a button", "印刷はボタン操作ではなく紙面設計", "列印不是按一下按鈕，而是排一頁報告"),
            L("页面设置决定了纸张、方向、边距、打印区域和标题行。先确定哪些内容必须出现在纸上，再决定缩放和标题，避免打印出半张表。", "Page setup controls paper, orientation, margins, print area, and repeating titles. Decide what must appear on paper before settling scaling and titles.", "ページ設定では用紙・向き・余白・印刷範囲・繰り返す行を決めます。紙に必要な内容を先に決めてから、拡大縮小やタイトルを調整します。", "版面設定決定紙張、方向、邊界、列印範圍和重複標題。先確定哪些內容必須出現在紙上，再決定縮放和標題，避免印出半張表。"),
            [
              L("横向适合列数较多的表；纵向适合窄而长的清单。", "Landscape suits wide tables; portrait suits narrow lists.", "横長の表は横方向、細長い一覧は縦方向が向いています。", "橫向適合欄數較多的表；直向適合窄而長的清單。"),
              L("A4 常用于日常办公，正式合同或大表可能要 A3；不要假设默认纸张就是对的。", "A4 is common for office work, while larger tables may need A3; do not assume the default paper.", "日常業務はA4が多いですが、大きな表はA3が必要な場合があります。既定の用紙を前提にしないでください。", "A4 常用於日常辦公，正式合約或大表可能要 A3；不要假設預設紙張就是對的。"),
              L("打印区域只决定打印哪些单元格；标题行则决定每页顶部重复哪一行。", "The print area selects which cells print; print titles choose which rows repeat at the top of every page.", "印刷範囲は印刷するセルを選び、印刷タイトルは各ページ上部で繰り返す行を決めます。", "列印範圍只決定列印哪些儲存格；重複標題則決定每頁頂端重複哪一列。"),
              L("边距要给装订和页眉页脚留空间，不能把内容紧贴纸边。", "Margins must leave room for binding, headers, and footers; do not crowd the paper edge.", "余白は綴じ代やヘッダー・フッター用に確保し、紙端に詰め込みません。", "邊界要給裝訂和頁首頁尾留空間，不能把內容緊貼紙邊。"),
            ],
            L("打印预览是最后一道检查：看分页、标题重复、边距和缩放是否同时正确。", "Print Preview is the final check for pagination, repeated titles, margins, and scaling together.", "印刷プレビューで改ページ・タイトル繰り返し・余白・拡大縮小をまとめて確認します。", "列印預覽是最後一道檢查：看分頁、標題重複、邊界和縮放是否同時正確。"),
            L("页面布局 → 打印预览；页面设置 → 工作表可设置打印区域和顶端标题行。", "Page Layout, Print Preview; Page Setup, Sheet handles print area and rows to repeat at top.", "ページレイアウト→印刷プレビュー、ページ設定→シートで印刷範囲と先頭行の繰り返しを設定します。", "版面設定→列印預覽；版面設定→工作表可設定列印範圍和頂端重複列。")
          ),
          lab(
            "wb14-print-orientation-lab",
            L("引导实验：把季度表转成横向 A4", "Guided lab: switch the quarterly table to landscape A4", "ガイド付き実験：四半期表をA4横にする", "引導實驗：把季度表轉成橫向 A4"),
            L("这张表有六列，纵向打印会太窄。请把 Budget_Print 设置为 A4 横向，并使用普通边距。", "This six-column sheet is too narrow in portrait. Set Budget_Print to A4 landscape and use normal margins.", "6列あるため縦向きでは窮屈です。Budget_Print を A4 横にし、余白は標準にしてください。", "這張表有六欄，直向列印會太窄。請把 Budget_Print 設為 A4 橫向，並使用一般邊界。"),
            {
              kind: "workbook",
              mode: "print",
              workbook: {
                active: "Budget_Print",
                sheets: [{ name: "Budget_Print", cells: printCells, tabColor: "green", hidden: false }],
              },
              ranges: { report: "Budget_Print!A1:F6", notes: "Budget_Print!H1:H4" },
              options: { paper: ["A4", "Letter", "A3"], orientation: ["portrait", "landscape"] },
              goal: { operation: "print", orientation: "landscape", paper: "A4", margins: { top: 1.2, bottom: 1.2, left: 0.7, right: 0.7 }, gridlines: false },
            },
            L("打开“页面布局”→“页面设置”，选择横向、A4 和普通边距。", "Open Page Layout, Page Setup, and choose Landscape, A4, and Normal margins.", "「ページレイアウト」→「ページ設定」で横方向・A4・標準余白を選びます。", "開啟「版面設定」→「版面設定」，選擇橫向、A4 和一般邊界。"),
            L("纸张方向与边距都已设置，打印预览不再把表格挤在窄栏中。", "Orientation and margins are set; Print Preview no longer squeezes the table into a narrow strip.", "向きと余白が設定され、印刷プレビューで表が細い帯に潰れていません。", "紙張方向與邊界都已設定，列印預覽不再把表格擠在窄欄中。")
          ),
          lab(
            "wb14-print-area-lab",
            L("引导实验：只打印报告区并重复表头", "Guided lab: print only the report area with repeated headers", "ガイド付き実験：報告範囲だけを表頭付きで印刷", "引導實驗：只列印報告區並重複表頭"),
            L("H 列的审核备注仅供内部查看。请把打印区域设为 A1:F6，顶端标题行设为第 1 行，缩放为 90%。", "The H-column reviewer notes are internal only. Set the print area to A1:F6, repeat row 1 at the top, and use 90% scaling.", "H列の確認メモは社内専用です。印刷範囲を A1:F6、先頭行の繰り返しを1行目、拡大縮小を90%にしてください。", "H 欄的審核備註僅供內部查看。請把列印範圍設為 A1:F6，頂端重複列設為第 1 列，縮放為 90%。"),
            {
              kind: "workbook",
              mode: "print",
              workbook: {
                active: "Budget_Print",
                sheets: [{ name: "Budget_Print", cells: printCells, tabColor: "green", hidden: false }],
              },
              ranges: { report: "Budget_Print!A1:F6", internalNotes: "Budget_Print!H1:H4" },
              options: { printArea: "A1:F6", titles: "1:1", scale: 90 },
              goal: { operation: "print", printArea: "A1:F6", printTitles: "1:1", scale: 90 },
            },
            L("在“页面设置”→“工作表”中填写打印区域与顶端标题行；缩放放在“页面”选项卡。", "In Page Setup, Sheet, enter the print area and rows to repeat; scaling is on the Page tab.", "「ページ設定」→「シート」で印刷範囲と先頭行の繰り返しを入力し、拡大縮小は「ページ」タブで設定します。", "在「版面設定」→「工作表」填寫列印範圍與頂端重複列；縮放放在「頁面」索引標籤。"),
            L("内部备注不会打印，每页顶部都会出现表头，缩放比例正确。", "Internal notes will not print, every page repeats the header, and scaling is correct.", "社内メモは印刷されず、各ページに表頭が繰り返され、拡大率も正しいです。", "內部備註不會列印，每頁頂端都會出現表頭，縮放比例正確。")
          ),
          choice(
            "wb14-print-choice",
            L("打印区域与顶端标题行分别解决什么问题？", "What do print area and print titles each control?", "印刷範囲と印刷タイトルは、それぞれ何を決めますか。", "列印範圍與頂端重複列分別解決什麼問題？"),
            L("一个决定“打印哪些内容”，另一个决定“分页后每页重复什么”。", "One decides what prints; the other decides what repeats when pages break.", "1つは印刷する内容、もう1つは改ページ後に繰り返す内容を決めます。", "一個決定「列印哪些內容」，另一個決定「分頁後每頁重複什麼」。"),
            [
              option("correct", "打印区域选内容，标题行用于每页重复表头", "Print area selects content; titles repeat headers on each page", "印刷範囲は内容、タイトルは各ページの表頭", "列印範圍選內容，重複標題用於每頁重複表頭", true, "两者在“页面设置→工作表”中相邻，但职责不同。", "They sit together under Sheet in Page Setup but serve different purposes.", "「ページ設定→シート」で隣り合っていますが役割は別です。", "兩者在「版面設定→工作表」中相鄰，但職責不同。"),
              option("same", "两者都只是把字体放大", "Both simply enlarge the font", "どちらも文字を大きくするだけ", "兩者都只是把字型放大", false, "它们不控制字体大小，缩放另有设置。", "They do not control font size; scaling has its own setting.", "文字サイズは変えません。拡大縮小は別の設定です。", "它們不控制字型大小，縮放另有設定。"),
              option("filter", "都会筛选掉不符合条件的数据", "Both filter out rows that do not meet a condition", "条件に合わない行を除外する", "都會篩選掉不符合條件的資料", false, "打印设置不会改变数据或筛选条件。", "Print settings do not alter data or filter criteria.", "印刷設定はデータや絞り込み条件を変えません。", "列印設定不會改變資料或篩選條件。"),
            ],
            L("打印设置只影响输出，不改变工作表里的数据。", "Print settings affect output only; they do not change worksheet data.", "印刷設定は出力だけに影響し、シートのデータは変えません。", "列印設定只影響輸出，不改變工作表裡的資料。")
          ),
        ]
      ),
      level(
        "wb-print-audit",
        "lesson",
        L("页眉、缩放与追踪关系", "Headers, scaling, and tracing relationships", "ヘッダー・拡大縮小・参照関係", "頁首、縮放與追蹤關係"),
        [
          learn(
            "wb14-audit-teach",
            L("让每页有身份，也能追溯公式来源", "Give every page identity and trace where formulas come from", "各ページに見出しを付け、数式の出所をたどる", "讓每頁有身分，也能追溯公式來源"),
            L("页眉页脚提供文件名、日期和页码，缩放和网格线控制可读性。公式审计则从结果倒推输入，或从输入查找依赖它的公式。", "Headers and footers carry file name, date, and page numbers; scaling and gridlines affect readability. Formula auditing traces from a result back to its inputs or from an input to its dependent formulas.", "ヘッダーとフッターはファイル名・日付・ページ番号を示し、拡大縮小とグリッド線は読みやすさを左右します。数式監査は結果から入力へ、または入力から依存する数式へたどります。", "頁首頁尾提供檔案名稱、日期和頁碼，縮放和格線控制可讀性。公式稽核則從結果回溯輸入，或從輸入查找依賴它的公式。"),
            [
              L("追踪引用单元格回答“这个结果从哪里来”，追踪从属单元格回答“改动后会影响谁”。", "Trace Precedents answers where a result comes from; Trace Dependents answers who is affected by a change.", "参照元の追跡は「結果がどこから来たか」、参照先の追跡は「変更がどこへ影響するか」を調べます。", "追蹤前導儲存格回答「這個結果從哪裡來」，追蹤從屬儲存格回答「改動後會影響誰」。"),
              L("显示公式会把整张表切换成公式视图，便于检查硬编码和复制错误。", "Show Formulas switches the sheet to formula view to expose hard-coded values and copy errors.", "数式の表示に切り替えると、直接入力値やコピー誤りを見つけやすくなります。", "顯示公式會把整張表切換成公式檢視，便於檢查手動輸入值和複製錯誤。"),
              L("求值公式可以逐段计算公式，定位错误发生在哪一步。", "Evaluate Formula calculates a formula step by step so you can locate the failing part.", "数式の評価は数式を段階的に計算し、誤りの箇所を特定します。", "求值公式可以逐步計算公式，定位錯誤發生在哪一步。"),
              L("缩放优先尝试调整列宽和边距；过度缩成 60% 以下会影响阅读。", "Try adjusting column widths and margins before scaling; shrinking below 60% often hurts readability.", "拡大縮小の前に列幅と余白を調整します。60%未満まで縮めると読みにくくなります。", "縮放優先嘗試調整欄寬和邊界；過度縮成 60% 以下會影響閱讀。"),
            ],
            L("先追踪再改公式；只看到红色错误提示就改，容易把正确部分也破坏。", "Trace first, then edit. Changing immediately on seeing an error can break the correct parts.", "まず追跡してから数式を直します。エラー表示だけで直すと正しい部分まで壊すことがあります。", "先追蹤再改公式；只看到紅色錯誤提示就改，容易把正確部分也破壞。"),
            L("审阅 → 显示公式；公式 → 追踪引用单元格/追踪从属单元格/求值公式。", "Formulas, Show Formulas; Formulas, Trace Precedents, Trace Dependents, or Evaluate Formula.", "数式→数式の表示、数式→参照元の追跡・参照先の追跡・数式の評価を使います。", "校閱 → 顯示公式；公式 → 追蹤前導儲存格／追蹤從屬儲存格／求值公式。")
          ),
          lab(
            "wb14-trace-precedents-lab",
            L("引导实验：查清净额来自哪些单元格", "Guided lab: find the cells behind net amount", "ガイド付き実験：純額の参照元を確認", "引導實驗：查清淨額來自哪些儲存格"),
            L("F2 的净额公式引用收入、人员和场地等列。请对 F2 追踪引用单元格，确认公式输入来源。", "The net formula in F2 pulls from revenue, people, and facilities. Trace precedents from F2 to confirm its inputs.", "F2 の純額数式は収入・人員・施設などを参照します。F2 の参照元を追跡して入力を確認してください。", "F2 的淨額公式參照收入、人員和場地等欄。請對 F2 追蹤前導儲存格，確認公式輸入來源。"),
            {
              kind: "workbook",
              mode: "audit",
              workbook: {
                active: "Budget_Print",
                sheets: [{ name: "Budget_Print", cells: printCells, tabColor: "green", hidden: false }],
              },
              ranges: { report: "Budget_Print!A1:F6", target: "Budget_Print!F2" },
              options: { targetCell: "F2" },
              goal: { operation: "audit", action: "tracePrecedents", cell: "F2" },
            },
            L("选中 F2，到“公式”→“追踪引用单元格”。蓝色箭头会从源单元格指向 F2。", "Select F2 and choose Formulas, Trace Precedents. Blue arrows point from the source cells to F2.", "F2 を選び、「数式」→「参照元の追跡」を実行します。青い矢印が参照元から F2 へ向きます。", "選取 F2，到「公式」→「追蹤前導儲存格」。藍色箭頭會從來源儲存格指向 F2。"),
            L("引用关系已显示：净额由收入减去人员、场地和运营成本得到。", "The relationships are visible: net equals revenue minus people, facilities, and operations cost.", "参照関係が表示され、純額は収入から人員・施設・運営費を引いたものだと分かります。", "參照關係已顯示：淨額由收入減去人員、場地和營運成本得到。")
          ),
          lab(
            "wb14-trace-dependents-lab",
            L("引导实验：改动收入会影响谁", "Guided lab: see what depends on revenue", "ガイド付き実験：収入を変えるとどこへ影響するか", "引導實驗：改動收入會影響誰"),
            L("有人建议调整 B2 的收入值。请对 B2 追踪从属单元格，找出依赖它的净额公式。", "Someone proposes changing revenue in B2. Trace dependents from B2 to identify the net formula that relies on it.", "B2 の収入を変える案があります。B2 の参照先を追跡し、収入に依存する純額数式を確認してください。", "有人建議調整 B2 的收入值。請對 B2 追蹤從屬儲存格，找出依賴它的淨額公式。"),
            {
              kind: "workbook",
              mode: "audit",
              workbook: {
                active: "Budget_Print",
                sheets: [{ name: "Budget_Print", cells: printCells, tabColor: "green", hidden: false }],
              },
              ranges: { report: "Budget_Print!A1:F6", target: "Budget_Print!B2" },
              options: { targetCell: "B2" },
              goal: { operation: "audit", action: "traceDependents", cell: "B2" },
            },
            L("选中 B2，使用“追踪从属单元格”；箭头会指向受影响的 F2。", "Select B2 and use Trace Dependents; arrows point to the affected F2.", "B2 を選び「参照先の追跡」を使うと、影響を受ける F2 に矢印が向きます。", "選取 B2，使用「追蹤從屬儲存格」；箭頭會指向受影響的 F2。"),
            L("B2 的下游影响已定位，修改前能明确评估净额会变化。", "The downstream impact of B2 is identified, so the net change can be assessed before editing.", "B2 の下流影響が分かり、編集前に純額への影響を評価できます。", "B2 的下游影響已定位，修改前能明確評估淨額會變化。")
          ),
          lab(
            "wb14-print-polish-lab",
            L("迁移实验：加页眉页脚并控制打印密度", "Transfer lab: add header/footer and control density", "転用実験：ヘッダー・フッターと印刷密度を整える", "遷移實驗：加頁首頁尾並控制列印密度"),
            L("管理报告需要页眉“Q3 Budget | Finance”，页脚“第 &P 页，共 &N 页”，打开网格线并缩放到 80%。", "The management report needs header “Q3 Budget | Finance”, footer “Page &P of &N”, gridlines on, and 80% scaling.", "管理資料ではヘッダー「Q3 Budget | Finance」、フッター「&P / &N ページ」、グリッド線オン、拡大率80%にします。", "管理報告需要頁首「Q3 Budget | Finance」、頁尾「第 &P 頁，共 &N 頁」，開啟格線並縮放到 80%。"),
            {
              kind: "workbook",
              mode: "print",
              workbook: {
                active: "Budget_Print",
                sheets: [{ name: "Budget_Print", cells: printCells, tabColor: "green", hidden: false }],
              },
              ranges: { report: "Budget_Print!A1:F6" },
              options: { header: true, footer: true, gridlines: true, scale: 80 },
              goal: {
                operation: "print",
                header: L("Q3 Budget | Finance", "Q3 Budget | Finance", "Q3 Budget | Finance", "Q3 Budget | Finance"),
                footer: L("第 &P 页，共 &N 页", "Page &P of &N", "&P / &N ページ", "第 &P 頁，共 &N 頁"),
                scale: 80,
                gridlines: true,
              },
            },
            L("页眉页脚在“页面设置”→页眉/页脚；缩放和打印网格线在“工作表”选项卡。", "Header and footer are under Page Setup, Header/Footer; scaling and gridlines are on the Sheet tab.", "ヘッダーとフッターは「ページ設定」→ヘッダー/フッター、拡大縮小とグリッド線は「シート」タブです。", "頁首頁尾在「版面設定」→頁首／頁尾；縮放和列印格線在「工作表」索引標籤。"),
            L("每页都有统一页眉和页码，网格线与 80% 缩放让报告更易读。", "Every page has a consistent header and page number; gridlines and 80% scaling keep the report readable.", "各ページに統一ヘッダーとページ番号が入り、グリッド線と80%表示で読みやすくなりました。", "每頁都有統一頁首和頁碼，格線與 80% 縮放讓報告更易讀。")
          ),
        ]
      ),
      level(
        "wb-audit-review",
        "review",
        L("复习：求值、显示公式与成稿检查", "Review: evaluate, show formulas, and final print check", "復習：数式の評価・表示と最終印刷確認", "複習：求值、顯示公式與成稿檢查"),
        [
          learn(
            "wb14-review-teach",
            L("先诊断，再交付", "Diagnose before delivery", "診断してから提出する", "先診斷，再交付"),
            L("交接一份带公式的报表前，要能说明公式引用了谁、错误从哪里开始、最终打印是否完整。审计工具用于诊断，页面设置用于交付，两者都要过一遍。", "Before handing off a formula-driven report, explain what each formula references, where an error begins, and whether the final print is complete. Auditing diagnoses; page setup delivers.", "数式を含む報告書を引き継ぐ前に、参照元・エラーの発生箇所・印刷の完全性を説明できるようにします。監査は診断、ページ設定は提出用です。", "交接一份帶公式的報表前，要能說明公式參照了誰、錯誤從哪裡開始、最終列印是否完整。稽核工具用於診斷，版面設定用於交付，兩者都要檢查。"),
            [
              L("显示公式能看到所有公式的形状；检查完后必须切回正常视图，避免把公式当作最终报告。", "Show Formulas reveals formula shapes; switch back to normal view after checking so formulas are not delivered as the report.", "数式の表示で全体の形を確認し、確認後は通常表示に戻します。数式表示のまま提出しません。", "顯示公式能看到所有公式的形狀；檢查完後必須切回一般檢視，避免把公式當成最終報告。"),
              L("求值公式适合排查嵌套函数，一步一步看中间结果。", "Evaluate Formula is useful for nested functions; inspect intermediate results one step at a time.", "数式の評価は入れ子の関数に有効で、途中結果を1段ずつ確認できます。", "求值公式適合排查巢狀函數，一步一步看中間結果。"),
              L("追踪箭头在保存后通常不保留，截图或记录结论比依赖箭头更可靠。", "Tracing arrows usually are not kept in the saved file; capture the finding or a screenshot rather than relying on arrows.", "追跡矢印は通常保存されません。矢印に頼らず、結果を記録するか画面を保存します。", "追蹤箭頭通常在儲存後不會保留，截圖或記錄結論比依賴箭頭更可靠。"),
              L("成稿检查顺序：错误值、打印预览、公式视图、关键合计。", "Final check order: errors, Print Preview, formula view, and key totals.", "最終確認はエラー値、印刷プレビュー、数式表示、主要合計の順です。", "成稿檢查順序：錯誤值、列印預覽、公式檢視、關鍵合計。"),
            ],
            L("显示公式视图只用于检查，最终交付前一定切回普通视图。", "Show Formulas is for checking only; return to normal view before delivery.", "数式の表示は確認専用です。提出前に通常表示へ戻します。", "顯示公式檢視只用於檢查，最終交付前一定切回一般檢視。"),
            L("先处理错误，再看打印；不要把带 #DIV/0! 的报表直接发出去。", "Fix errors before checking print; do not send a report containing #DIV/0!.", "エラーを直してから印刷を確認します。#DIV/0! を含む報告書をそのまま送らないでください。", "先處理錯誤，再看列印；不要把帶 #DIV/0! 的報表直接送出。")
          ),
          lab(
            "wb14-show-formulas-lab",
            L("复习实验：切换公式视图检查硬编码", "Review lab: switch to formula view and check hard-coded values", "復習実験：数式表示で直接入力を確認", "複習實驗：切換公式檢視檢查手動輸入值"),
            L("请在 Budget_Print 打开“显示公式”，检查 F 列是否每一行都是公式，再准备最终审核。", "Turn on Show Formulas in Budget_Print, confirm every F-row cell is a formula, then prepare for final review.", "Budget_Print で「数式の表示」をオンにし、F列の各行が数式であることを確認して最終確認に進みます。", "請在 Budget_Print 開啟「顯示公式」，檢查 F 欄是否每一列都是公式，再準備最終審核。"),
            {
              kind: "workbook",
              mode: "audit",
              workbook: {
                active: "Budget_Print",
                sheets: [{ name: "Budget_Print", cells: printCells, tabColor: "green", hidden: false }],
              },
              ranges: { report: "Budget_Print!A1:F6", formulaColumn: "Budget_Print!F2:F6" },
              options: { view: "formula" },
              goal: { operation: "audit", action: "showFormulas", sheet: "Budget_Print" },
            },
            L("在“公式”选项卡点击“显示公式”；再点一次即可恢复普通视图。", "On the Formulas tab, click Show Formulas; click again to return to normal view.", "「数式」タブの「数式の表示」をクリックし、もう一度押すと通常表示に戻ります。", "在「公式」索引標籤按一下「顯示公式」；再按一次即可恢復一般檢視。"),
            L("公式视图已打开，F 列的公式结构可以直接核对。", "Formula view is on, so the F-column formula structure can be reviewed directly.", "数式表示がオンになり、F列の数式構成を直接確認できます。", "公式檢視已開啟，F 欄的公式結構可以直接核對。")
          ),
          lab(
            "wb14-evaluate-lab",
            L("复习实验：逐步求值净额公式", "Review lab: evaluate the net formula step by step", "復習実験：純額数式を段階的に評価", "複習實驗：逐步求值淨額公式"),
            L("F2 的公式较长，审核员想确认每一步减法。请对 F2 启动“求值公式”并检查中间结果。", "F2 contains a longer formula and the reviewer wants to confirm each subtraction. Start Evaluate Formula for F2 and inspect the intermediate results.", "F2 の数式が長いため、確認担当は各減算を確かめたいと考えています。F2 で「数式の評価」を開始し、途中結果を確認してください。", "F2 的公式較長，稽核員想確認每一步減法。請對 F2 啟動「求值公式」並檢查中間結果。"),
            {
              kind: "workbook",
              mode: "audit",
              workbook: {
                active: "Budget_Print",
                sheets: [{ name: "Budget_Print", cells: printCells, tabColor: "green", hidden: false }],
              },
              ranges: { report: "Budget_Print!A1:F6", target: "Budget_Print!F2" },
              options: { targetCell: "F2" },
              goal: { operation: "audit", action: "evaluate", cell: "F2" },
            },
            L("选中 F2，到“公式”→“求值公式”，连续点击“求值”查看每一步。", "Select F2, choose Formulas, Evaluate Formula, and click Evaluate to step through each part.", "F2 を選び、「数式」→「数式の評価」で「評価」を押しながら各段階を確認します。", "選取 F2，到「公式」→「求值公式」，連續按「求值」查看每一步。"),
            L("净额的计算顺序已逐步核对，减法链条没有隐藏错误。", "The net calculation sequence has been checked step by step and the subtraction chain has no hidden error.", "純額の計算順序を段階的に確認し、減算の連鎖に隠れた誤りはありません。", "淨額的計算順序已逐步核對，減法鏈沒有隱藏錯誤。")
          ),
          lab(
            "wb14-print-review-lab",
            L("复习实验：交付前的最终打印设置", "Review lab: final print setup before delivery", "復習実験：提出前の最終印刷設定", "複習實驗：交付前的最終列印設定"),
            L("最终报告要横向 A4，打印 A1:F6，第 1 行重复，缩放 85%，打开网格线，页脚写“第 &P 页，共 &N 页”。", "The final report needs landscape A4, print area A1:F6, row 1 repeated, 85% scaling, gridlines on, and footer “Page &P of &N”.", "最終報告はA4横、印刷範囲A1:F6、1行目を繰り返し、拡大率85%、グリッド線オン、フッターを「&P / &N ページ」にします。", "最終報告要橫向 A4，列印 A1:F6，第 1 列重複，縮放 85%，開啟格線，頁尾寫「第 &P 頁，共 &N 頁」。"),
            {
              kind: "workbook",
              mode: "print",
              workbook: {
                active: "Budget_Print",
                sheets: [{ name: "Budget_Print", cells: printCells, tabColor: "green", hidden: false }],
              },
              ranges: { report: "Budget_Print!A1:F6" },
              options: { orientation: "landscape", paper: "A4", printArea: "A1:F6", printTitles: "1:1", scale: 85, gridlines: true, footer: true },
              goal: {
                operation: "print",
                orientation: "landscape",
                paper: "A4",
                printArea: "A1:F6",
                printTitles: "1:1",
                scale: 85,
                gridlines: true,
                footer: L("第 &P 页，共 &N 页", "Page &P of &N", "&P / &N ページ", "第 &P 頁，共 &N 頁"),
              },
            },
            L("逐项核对页面设置，不要只改方向就打印；打印预览会同时暴露范围与分页问题。", "Check every page setting rather than only orientation; Print Preview reveals range and pagination problems together.", "向きだけでなく各設定を確認します。印刷プレビューで範囲と改ページをまとめて確認できます。", "逐項核對版面設定，不要只改方向就列印；列印預覽會同時顯示範圍與分頁問題。"),
            L("交付设置已完整：方向、纸张、范围、重复表头、缩放、网格线和页脚全部匹配。", "The delivery setup is complete: orientation, paper, range, repeated header, scaling, gridlines, and footer all match.", "提出設定がそろいました。向き・用紙・範囲・表頭の繰り返し・拡大率・グリッド線・フッターが一致しています。", "交付設定已完整：方向、紙張、範圍、重複表頭、縮放、格線和頁尾全部符合。")
          ),
        ]
      ),
    ],
  });
})();
