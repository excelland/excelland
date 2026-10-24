(function () {
  "use strict";

  const D = window.CourseData;
  const K = window.CurriculumKit;
  const L = D.L;
  const learn = D.learnStep;

  function addDefaults(options, values) {
    options.defaults = Object.assign({}, options.defaults || {}, values);
  }

  function addChoices(options, values) {
    options.choices = Object.assign({}, options.choices || {}, values);
  }

  function columnFromRef(ref) {
    const match = /^\$?([A-Z]+)\$?\d+$/i.exec(String(ref || "").trim());
    return match ? match[1].toUpperCase() : String(ref || "").replace(/[^A-Za-z]/g, "").toUpperCase();
  }

  function alignGoal(mode, goal, options) {
    if (mode === "conditional") {
      addChoices(options, { ruleType: ["cellValue", "textContains", "dataBar", "colorScale", "iconSet", "formula"] });
      if (goal.text) {
        goal.value1 = goal.text;
        delete goal.text;
      }
      if (goal.ruleType === "dataBar") {
        if (goal.color) goal.fill = goal.color;
        delete goal.color;
        delete goal.showValue;
      }
      if (goal.ruleType === "colorScale") {
        addDefaults(options, {
          minColor: goal.minColor,
          midColor: goal.midColor,
          maxColor: goal.maxColor,
        });
      }
      if (goal.ruleType === "iconSet") {
        addDefaults(options, {
          iconStyle: goal.iconStyle,
          reverse: goal.reverse,
        });
      }
      if (goal.ruleType === "formula") {
        addDefaults(options, { formula: goal.formula });
      }
    }
    if (mode === "validation") {
      const defaults = {};
      ["operator", "minimum", "maximum", "formula"].forEach((field) => {
        if (goal[field] !== undefined) defaults[field] = goal[field];
      });
      addDefaults(options, defaults);
    }
    if (mode === "sort") {
      const custom = (goal.levels || []).some((level) => level.order === "custom");
      if (custom) {
        goal.levels.forEach((level) => { delete level.customList; });
        addChoices(options, { "levels.0.order": ["asc", "desc", "custom"] });
      }
    }
    if (mode === "removeDuplicates") {
      goal.columnsToCheck = goal.columns;
      delete goal.columns;
    }
    if (mode === "textToColumns") {
      goal.dataType = "delimited";
      goal.targetColumn = columnFromRef(goal.destination);
      delete goal.destination;
    }
    if (mode === "pasteSpecial") {
      if (goal.paste) goal.pasteOperation = goal.paste;
      delete goal.paste;
    }
    if (mode === "subtotal") {
      goal.functionNumber = goal.function === "AVERAGE" ? 1 : goal.function === "COUNT" ? 2 : 9;
      goal.subtotalColumns = goal.columns;
      delete goal.function;
      delete goal.columns;
      delete goal.outline;
    }
    if (mode === "consolidate") {
      goal.ranges = (goal.sources || []).join("\n");
      goal.functionNumber = goal.function === "AVERAGE" ? 1 : goal.function === "COUNT" ? 2 : 9;
      goal.useTopRow = goal.topRow !== false;
      goal.useLeftColumn = goal.leftColumn !== false;
      delete goal.sources;
      delete goal.destination;
      delete goal.function;
      delete goal.topRow;
      delete goal.leftColumn;
    }
    return goal;
  }

  function lab(id, title, lead, spec, hint, success, extra) {
    spec.goal = alignGoal(spec.mode, spec.goal || {}, spec.options || (spec.options = {}));
    return D.labStep(id, title, lead, spec, hint, success, extra);
  }

  function level(id, kind, title, steps) {
    return { id, kind, title, steps };
  }

  const staffHeaders = [
    L("员工编号", "Staff ID", "社員番号", "員工編號"),
    L("员工", "Employee", "従業員", "員工"),
    L("部门", "Department", "部署", "部門"),
    L("加班小时", "Overtime hours", "残業時間", "加班時數"),
    L("培训得分", "Training score", "研修得点", "培訓得分"),
    L("状态", "Status", "状態", "狀態"),
  ];

  const staffRows = [
    ["E-1041", L("林晓", "Olivia Bennett", "佐藤美咲", "林雅婷"), L("运营", "Operations", "運営", "營運"), 8, 82, L("已复核", "Reviewed", "確認済み", "已複核")],
    ["E-1042", L("陈凯", "Ethan Cole", "鈴木健太", "陳冠宇"), L("市场", "Marketing", "マーケティング", "行銷"), 14, 68, L("待复核", "Needs review", "要確認", "待複核")],
    ["E-1043", L("周宁", "Maya Reed", "高橋結衣", "周怡君"), L("产品", "Product", "製品", "產品"), 6, 91, L("已复核", "Reviewed", "確認済み", "已複核")],
    ["E-1044", L("赵敏", "Noah Brooks", "田中翔", "趙柏翰"), L("客服", "Customer care", "カスタマーケア", "客戶服務"), 16, 74, L("待复核", "Needs review", "要確認", "待複核")],
    ["E-1045", L("王磊", "Ava Turner", "伊藤葵", "王品妍"), L("运营", "Operations", "運営", "營運"), 11, 88, L("已复核", "Reviewed", "確認済み", "已複核")],
    ["E-1046", L("孙悦", "Leo Martin", "渡辺大輔", "孫立群"), L("财务", "Finance", "経理", "財務"), 9, 79, L("待复核", "Needs review", "要確認", "待複核")],
    ["E-1047", L("李然", "Grace Kim", "山本彩", "李佳蓉"), L("产品", "Product", "製品", "產品"), 17, 63, L("待复核", "Needs review", "要確認", "待複核")],
    ["E-1048", L("郑文", "Daniel Hayes", "中村悠真", "鄭宇翔"), L("市场", "Marketing", "マーケティング", "行銷"), 5, 95, L("已复核", "Reviewed", "確認済み", "已複核")],
  ];

  const staffCells = K.makeSheet(staffHeaders, staffRows, {
    H1: L("部门清单", "Department list", "部署一覧", "部門清單"),
    H2: L("运营", "Operations", "運営", "營運"),
    H3: L("市场", "Marketing", "マーケティング", "行銷"),
    H4: L("产品", "Product", "製品", "產品"),
    H5: L("财务", "Finance", "経理", "財務"),
  });

  const validationCells = K.makeSheet([
    L("员工编号", "Staff ID", "社員番号", "員工編號"),
    L("员工", "Employee", "従業員", "員工"),
    L("部门", "Department", "部署", "部門"),
    L("班次", "Shift", "シフト", "班別"),
    L("餐补", "Meal allowance", "食事手当", "餐費補助"),
  ], [
    ["E-2041", L("何静", "Owen Foster", "加藤直樹", "何靜宜"), L("运营", "Operations", "運営", "營運"), L("早班", "Morning", "早番", "早班"), 420],
    ["E-2042", L("谢楠", "Lily Chen", "吉田真央", "謝明哲"), L("市场", "Marketing", "マーケティング", "行銷"), L("中班", "Mid", "中番", "中班"), 380],
    ["E-2043", L("沈航", "Marcus Reed", "山田拓海", "沈怡安"), L("产品", "Product", "製品", "產品"), L("晚班", "Late", "遅番", "晚班"), 460],
  ], {
    H1: L("可选部门", "Allowed departments", "選択可能な部署", "可選部門"),
    H2: L("运营", "Operations", "運営", "營運"),
    H3: L("市场", "Marketing", "マーケティング", "行銷"),
    H4: L("产品", "Product", "製品", "產品"),
    H5: L("财务", "Finance", "経理", "財務"),
    J1: L("餐补上限", "Meal cap", "食事手当上限", "餐費補助上限"),
    J2: 1200,
  });

  const sortHeaders = [
    L("物品", "Item", "品目", "品項"),
    L("团队", "Team", "チーム", "團隊"),
    L("数量", "Units", "数量", "數量"),
    L("金额", "Amount", "金額", "金額"),
    L("成本", "Cost", "原価", "成本"),
    L("状态", "Status", "状態", "狀態"),
    L("优先级", "Priority", "優先度", "優先順序"),
  ];

  const sortRows = [
    [L("打印纸", "Copy paper", "コピー用紙", "列印紙"), L("行政", "Admin", "総務", "行政"), 80, 1840, 1320, L("常规", "Routine", "通常", "例行"), "P3"],
    [L("显示器", "Monitor", "モニター", "螢幕"), L("设计", "Design", "デザイン", "設計"), 14, 19600, 15100, L("紧急", "Urgent", "緊急", "緊急"), "P1"],
    [L("键盘", "Keyboard", "キーボード", "鍵盤"), L("设计", "Design", "デザイン", "設計"), 32, 7360, 5100, L("关注", "Watch", "要注意", "關注"), "P2"],
    [L("显示器", "Monitor", "モニター", "螢幕"), L("设计", "Design", "デザイン", "設計"), 14, 19600, 15100, L("紧急", "Urgent", "緊急", "緊急"), "P1"],
    [L("耳机", "Headset", "ヘッドセット", "耳機"), L("客服", "Support", "サポート", "客服"), 45, 6750, 4800, L("关注", "Watch", "要注意", "關注"), "P2"],
    [L("办公椅", "Office chair", "オフィスチェア", "辦公椅"), L("行政", "Admin", "総務", "行政"), 12, 14400, 10200, L("常规", "Routine", "通常", "例行"), "P3"],
    [L("投影仪", "Projector", "プロジェクター", "投影機"), L("培训", "Training", "研修", "培訓"), 3, 11400, 8700, L("紧急", "Urgent", "緊急", "緊急"), "P1"],
    [L("文件夹", "Folders", "フォルダー", "文件夾"), L("行政", "Admin", "総務", "行政"), 120, 2400, 1680, L("常规", "Routine", "通常", "例行"), "P3"],
    [L("麦克风", "Microphone", "マイク", "麥克風"), L("培训", "Training", "研修", "培訓"), 6, 7200, 5400, L("关注", "Watch", "要注意", "關注"), "P2"],
    [L("签字笔", "Signature pens", "署名用ペン", "簽字筆"), L("行政", "Admin", "総務", "行政"), 150, 2250, 1500, L("常规", "Routine", "通常", "例行"), "P3"],
  ];

  const sortCells = K.makeSheet(sortHeaders, sortRows, {
    H1: L("团队", "Team", "チーム", "團隊"),
    H2: L("设计", "Design", "デザイン", "設計"),
    I1: L("状态", "Status", "状態", "狀態"),
    I2: L("紧急", "Urgent", "緊急", "緊急"),
    J1: L("筛选输出", "Filter output", "抽出結果", "篩選輸出"),
  });

  const splitCells = K.makeSheet(sortHeaders, sortRows, {
    H1: L("原始导入行", "Raw import line", "取込元の行", "原始匯入列"),
    H2: "North|A-1042|2026-10-08",
    H3: "South|B-2081|2026-10-09",
    H4: "East|C-3315|2026-10-10",
    H5: "North|D-4017|2026-10-11",
    J1: L("拆分结果", "Split result", "分割結果", "拆分結果"),
  });

  const ledgerHeaders = [
    L("订单", "Order", "注文", "訂單"),
    L("团队", "Team", "チーム", "團隊"),
    L("数量", "Units", "数量", "數量"),
    L("金额", "Amount", "金額", "金額"),
    L("日期", "Date", "日付", "日期"),
  ];

  const ledgerRows = [
    ["SO-3101", L("设计", "Design", "デザイン", "設計"), 6, 7800, "2026-10-01"],
    ["SO-3102", L("行政", "Admin", "総務", "行政"), 20, 2600, "2026-10-02"],
    ["SO-3103", L("客服", "Support", "サポート", "客服"), 12, 4200, "2026-10-03"],
    ["SO-3104", L("培训", "Training", "研修", "培訓"), 4, 9600, "2026-10-04"],
    ["SO-3105", L("设计", "Design", "デザイン", "設計"), 8, 10400, "2026-10-05"],
  ];

  const ledgerCells = K.makeSheet(ledgerHeaders, ledgerRows, {
    H1: L("快照起点", "Snapshot start", "スナップショット開始", "快照起點"),
  });

  D.registerChapter({
    id: "ch15-format-validation",
    icon: "15",
    title: L("第 15 章 · 条件格式与数据验证", "Chapter 15 · Conditional Formatting and Data Validation", "第15章 · 条件付き書式とデータの入力規則", "第 15 章 · 設定格式化的條件與資料驗證"),
    subtitle: L("用规则让异常自动显形，用验证把输入限制在可管理的范围内。", "Use rules to surface exceptions automatically and validation to keep input inside a controlled range.", "ルールで異常を自動的に目立たせ、入力規則で入力を管理可能な範囲に保ちます。", "用規則讓異常自動顯形，用驗證把輸入限制在可管理的範圍內。"),
    levels: [
      level(
        "data-conditional-basics",
        "lesson",
        L("立刻能看懂的条件格式", "Conditional formatting you can read at a glance", "ひと目で分かる条件付き書式", "立刻能看懂的設定格式化的條件"),
        [
          learn(
            "dt15-conditional-teach",
            L("格式不是装饰，是把注意力放在该看的地方", "Formatting is direction of attention, not decoration", "書式は飾りではなく、見るべき場所への案内", "格式不是裝飾，是把注意力放在該看的地方"),
            L("条件格式根据单元格值或规则自动改变填充、字体和数据条。它只改变显示，不改变单元格中的真实值，也不会替你筛选数据。", "Conditional formatting changes fill, font, and data bars based on values or rules. It changes display only, not the underlying values, and does not filter data for you.", "条件付き書式は値やルールに応じて塗りつぶし・フォント・データバーを変えます。表示だけを変え、実際の値や絞り込みは変更しません。", "設定格式化的條件會依儲存格值或規則自動改變填色、字型與資料橫條。它只改變顯示，不改變儲存格中的實際值，也不會替你篩選資料。"),
            [
              L("单元格值规则适合“大于、小于、介于、等于”这类清楚的数值条件。", "Cell-value rules suit clear numeric tests such as greater than, less than, between, or equal.", "セルの値ルールは、より大きい・より小さい・範囲内・等しいなど明確な数値条件に向きます。", "儲存格值規則適合「大於、小於、介於、等於」這類清楚的數值條件。"),
              L("文本规则适合固定状态词，例如“待复核”；注意是否区分大小写和精确匹配。", "Text rules suit fixed statuses such as “Needs review”; check case and exact matching.", "文字ルールは「要確認」などの固定状態に向きます。大文字小文字や完全一致の扱いを確認します。", "文字規則適合固定狀態詞，例如「待複核」；注意是否區分大小寫和完全相符。"),
              L("数据条适合快速比较同一列中的相对大小，不适合展示差异极小的数值。", "Data bars compare relative magnitudes within one column; they are poor at showing tiny differences.", "データバーは同じ列の相対的な大小比較に向き、ごく小さな差の表現には向きません。", "資料橫條適合快速比較同一欄的相對大小，不適合展示差異極小的數值。"),
              L("规则区域要包含整列数据但排除总计行，否则合计会被误标成异常。", "Apply the rule to the data rows but exclude totals, or the total will be flagged as an exception.", "ルール範囲はデータ行だけにし、合計行を除外します。合計が異常扱いになるのを防げます。", "規則範圍要包含整欄資料但排除合計列，否則合計會被誤標成異常。"),
            ],
            L("先问“我要突出什么”，再选规则类型；不要为了好看给每个单元格都上色。", "Ask what you want to highlight, then choose the rule type; do not color every cell for decoration.", "何を目立たせたいかを先に決め、その後にルール種類を選びます。装飾目的で全セルに色を付けません。", "先問「我要突出什麼」，再選規則類型；不要為了好看給每個儲存格都上色。"),
            L("开始 → 条件格式 → 突出显示单元格规则/数据条；规则管理器可查看和修改所有规则。", "Home, Conditional Formatting, Highlight Cells Rules or Data Bars; Manage Rules reviews every rule.", "ホーム→条件付き書式→セルの強調表示ルール／データバー、ルールの管理で全体を確認します。", "常用 → 設定格式化的條件 → 醒目提示儲存格規則／資料橫條；規則管理員可查看和修改所有規則。")
          ),
          lab(
            "dt15-cellvalue-rule-lab",
            L("引导实验：标出超过 12 小时的加班", "Guided lab: flag overtime above 12 hours", "ガイド付き実験：12時間超の残業を強調", "引導實驗：標出超過 12 小時的加班"),
            L("请为 D2:D8 建立单元格值规则：大于 12 时使用浅红色填充 #FFC7CE 和深红色字体 #9C0006。", "Create a cell-value rule for D2:D8: values greater than 12 use fill #FFC7CE and font #9C0006.", "D2:D8 にセルの値ルールを作成し、12 より大きい値に塗りつぶし #FFC7CE とフォント #9C0006 を適用します。", "請為 D2:D8 建立儲存格值規則：大於 12 時使用淺紅色填色 #FFC7CE 和深紅色字型 #9C0006。"),
            {
              kind: "format",
              mode: "conditional",
              sheet: staffCells,
              ranges: { overtime: "D2:D8", staffTable: "A1:F8" },
              options: { ruleTypes: ["cellValue", "text", "dataBar"], operators: ["greaterThan", "lessThan", "between"] },
              goal: { operation: "conditional", range: "D2:D8", ruleType: "cellValue", operator: "greaterThan", value1: 12, fill: "#FFC7CE", font: "#9C0006" },
            },
            L("选中 D2:D8，打开条件格式的“突出显示单元格规则”→“大于”，输入 12 后自定义格式。", "Select D2:D8, open Highlight Cells Rules, Greater Than, enter 12, then set a custom format.", "D2:D8 を選び、条件付き書式の「セルの強調表示ルール」→「次の値より大きい」で12を入力し、書式を設定します。", "選取 D2:D8，開啟設定格式化的條件「醒目提示儲存格規則」→「大於」，輸入 12 後自訂格式。"),
            L("超过 12 小时的记录已自动标红，未超过的记录保持原样。", "Overtime above 12 hours is highlighted; the other records remain unchanged.", "12時間を超える残業だけが強調され、それ以外は変わりません。", "超過 12 小時的紀錄已自動標紅，未超過的紀錄保持原樣。")
          ),
          lab(
            "dt15-text-rule-lab",
            L("引导实验：突出待复核记录", "Guided lab: highlight records needing review", "ガイド付き実験：要確認の記録を強調", "引導實驗：突出待複核紀錄"),
            L("请在 F2:F8 中突出包含“待复核”的文本，使用浅黄色填充 #FFEB9C 和棕色字体 #9C5700。", "Highlight cells in F2:F8 that contain “Needs review”, using fill #FFEB9C and font #9C5700.", "F2:F8 で「要確認」を含む文字を強調し、塗りつぶし #FFEB9C、フォント #9C5700 を使います。", "請在 F2:F8 中突出包含「待複核」的文字，使用淺黃色填色 #FFEB9C 和棕色字型 #9C5700。"),
            {
              kind: "format",
              mode: "conditional",
              sheet: staffCells,
              ranges: { statusColumn: "F2:F8", staffTable: "A1:F8" },
              options: { statusValues: [L("已复核", "Reviewed", "確認済み", "已複核"), L("待复核", "Needs review", "要確認", "待複核")] },
              goal: { operation: "conditional", range: "F2:F8", ruleType: "textContains", text: L("待复核", "Needs review", "要確認", "待複核"), fill: "#FFEB9C", font: "#9C5700" },
            },
            L("选中 F2:F8，使用“文本包含”，不要选择“等于”；状态词可能带有多余空格。", "Select F2:F8 and use Text Contains rather than Equal To because the status may contain extra spaces.", "F2:F8 を選び、「文字列を含む」を使います。状態名に余分な空白が含まれる場合があるため「等しい」は避けます。", "選取 F2:F8，使用「包含文字」而非「等於」；狀態詞可能帶有多餘空白。"),
            L("所有待复核状态已一致高亮，规则只作用于状态列。", "Every status that needs review is highlighted consistently, and the rule affects only that column.", "要確認の状態だけが一貫して強調され、ルールは状態列だけに適用されています。", "所有待複核狀態已一致醒目提示，規則只作用於狀態欄。")
          ),
          lab(
            "dt15-databar-lab",
            L("引导实验：用数据条比较培训得分", "Guided lab: compare training scores with data bars", "ガイド付き実験：データバーで研修得点を比較", "引導實驗：用資料橫條比較培訓得分"),
            L("请为 E2:E8 添加蓝色数据条，颜色为 #5B9BD5，保留数值显示，便于主管快速比较团队得分。", "Add blue data bars to E2:E8 with color #5B9BD5 and keep the values visible so managers can compare scores quickly.", "E2:E8 に色 #5B9BD5 の青いデータバーを追加し、値を表示したままにして比較しやすくします。", "請為 E2:E8 加入藍色資料橫條，顏色為 #5B9BD5，保留數值顯示，便於主管快速比較團隊得分。"),
            {
              kind: "format",
              mode: "conditional",
              sheet: staffCells,
              ranges: { training: "E2:E8", staffTable: "A1:F8" },
              options: { barColors: ["#5B9BD5", "#70AD47", "#ED7D31"], showValue: true },
              goal: { operation: "conditional", range: "E2:E8", ruleType: "dataBar", color: "#5B9BD5", showValue: true },
            },
            L("选中 E2:E8，打开“条件格式”→“数据条”→“实心填充”，再在规则管理中确认颜色。", "Select E2:E8, choose Conditional Formatting, Data Bars, Solid Fill, then verify the color in Manage Rules.", "E2:E8 を選び、条件付き書式→データバー→塗りつぶしで色を確認します。", "選取 E2:E8，開啟「設定格式化的條件」→「資料橫條」→「實心填滿」，再在規則管理員確認顏色。"),
            L("培训得分已按相对大小显示数据条，数值没有被替换。", "Training scores now show relative data bars without replacing the numbers.", "研修得点が相対的なデータバーで表示され、数値は保持されています。", "培訓得分已依相對大小顯示資料橫條，數值沒有被取代。")
          ),
        ]
      ),
      level(
        "data-conditional-advanced",
        "lesson",
        L("色阶、图标集与公式规则", "Color scales, icon sets, and formula rules", "カラースケール・アイコンセット・数式ルール", "色階、圖示集與公式規則"),
        [
          learn(
            "dt15-advancedrules-teach",
            L("规则越复杂，越要能解释它为什么触发", "The more complex the rule, the more clearly you must explain its trigger", "複雑なルールほど、なぜ発動するかを説明できるようにする", "規則越複雜，越要能解釋它為什麼觸發"),
            L("色阶和图标集适合表达整体分布，公式规则则能处理“整行”“重复值”“与其他单元格比较”等复杂条件。所有规则都写进规则管理器，便于后续维护。", "Color scales and icon sets show distributions, while formula rules handle complex conditions such as whole rows, duplicates, or comparisons with other cells. Keep every rule in Manage Rules for maintenance.", "カラースケールとアイコンセットは分布を示し、数式ルールは行全体・重複・他セルとの比較などを扱います。すべてのルールをルールの管理で保守します。", "色階和圖示集適合表達整體分布，公式規則則能處理「整列」「重複值」「與其他儲存格比較」等複雜條件。所有規則都寫進規則管理員，便於後續維護。"),
            [
              L("色阶用颜色深浅表现数值高低，必须保留图例或说明，否则读者不知道颜色含义。", "Color scales use intensity to show high and low values; keep a legend or explanation so the color meaning is clear.", "カラースケールは色の濃淡で高低を示すため、色の意味を説明する凡例などを添えます。", "色階用顏色深淺表現數值高低，必須保留圖例或說明，否則讀者不知道顏色含義。"),
              L("图标集要有明确阈值；交通灯、箭头和信号条的语义不能互相混用。", "Icon sets need clear thresholds; do not mix traffic-light, arrow, and signal meanings.", "アイコンセットには明確なしきい値が必要で、信号・矢印などの意味を混在させません。", "圖示集要有明確門檻；交通燈、箭頭和信號條的意義不能互相混用。"),
              L("公式规则中的相对引用以活动单元格为基准，整行着色常用 $ 固定列。", "In a formula rule, relative references are based on the active cell; lock the column with $ when coloring whole rows.", "数式ルールの相対参照は選択セルが基準です。行全体を色分けするときは $ で列を固定します。", "公式規則中的相對參照以作用中儲存格為基準，整列著色常用 $ 固定欄。"),
              L("多个规则冲突时，注意“停止若为真”和优先级；不是所有规则都会同时显示。", "When rules conflict, check Stop If True and priority; not every matching rule displays at once.", "ルールが競合する場合は「真の場合に停止」と優先順位を確認します。すべてが同時に表示されるわけではありません。", "多個規則衝突時，注意「若為真則停止」和優先順序；不是所有規則都會同時顯示。"),
            ],
            L("先在小范围测试规则，再应用到整列；规则太多时优先合并或删除。", "Test a rule on a small range before applying it to the whole column; merge or remove rules when they pile up.", "小さな範囲で試してから列全体に適用し、ルールが増えたら統合・削除します。", "先在小範圍測試規則，再套用到整欄；規則太多時優先合併或刪除。"),
            L("公式规则要返回 TRUE/FALSE；以当前左上角单元格为准写相对引用。", "A formula rule must return TRUE or FALSE, with relative references based on the top-left selected cell.", "数式ルールは TRUE/FALSE を返し、選択範囲の左上セルを基準に相対参照を書きます。", "公式規則要傳回 TRUE/FALSE；以目前左上角儲存格為準寫相對參照。")
          ),
          lab(
            "dt15-colorscale-lab",
            L("引导实验：给培训得分加分布色阶", "Guided lab: add a distribution color scale", "ガイド付き実験：研修得点にカラースケールを追加", "引導實驗：給培訓得分加分布色階"),
            L("请为 E2:E8 建立三色色阶：最低 #F8696B，中点 #FFEB84，最高 #63BE7B，用于周会快速看出得分分布。", "Create a three-color scale on E2:E8: minimum #F8696B, midpoint #FFEB84, maximum #63BE7B, so the weekly meeting can see the score spread.", "E2:E8 に3色のカラースケールを作成します。最小 #F8696B、中間 #FFEB84、最大 #63BE7B とし、週会で分布を見やすくします。", "請為 E2:E8 建立三色色階：最低 #F8696B，中點 #FFEB84，最高 #63BE7B，用於週會快速看出得分分布。"),
            {
              kind: "format",
              mode: "conditional",
              sheet: staffCells,
              ranges: { training: "E2:E8", staffTable: "A1:F8" },
              options: { scales: ["threeColor", "twoColor"] },
              goal: { operation: "conditional", range: "E2:E8", ruleType: "colorScale", minColor: "#F8696B", midColor: "#FFEB84", maxColor: "#63BE7B" },
            },
            L("选择 E2:E8，打开条件格式的“色阶”→“其他规则”，分别设置最小值、中位数和最大值颜色。", "Select E2:E8, choose Conditional Formatting, Color Scales, More Rules, then set minimum, midpoint, and maximum colors.", "E2:E8 を選び、条件付き書式→カラースケール→その他のルールで最小・中間・最大の色を設定します。", "選取 E2:E8，開啟設定格式化的條件「色階」→「其他規則」，分別設定最小值、中位數和最大值顏色。"),
            L("得分分布已用三色色阶显示，未修改任何分数。", "The score distribution is shown with a three-color scale and no score was changed.", "得点分布が3色のカラースケールで表示され、点数は変更されていません。", "得分分布已用三色色階顯示，未修改任何分數。")
          ),
          lab(
            "dt15-iconset-lab",
            L("引导实验：用交通灯标记得分等级", "Guided lab: use traffic lights for score bands", "ガイド付き実験：信号アイコンで得点帯を示す", "引導實驗：用交通燈標記得分等級"),
            L("请对 E2:E8 应用三色交通灯图标集，低分显示红灯、中段黄灯、高分绿灯，按默认百分位阈值即可。", "Apply the three-traffic-light icon set to E2:E8 so low scores show red, the middle band yellow, and high scores green, using the default percentile thresholds.", "E2:E8 に3色の信号アイコンセットを適用します。低得点は赤、中位は黄、高得点は緑とし、既定のパーセンタイルしきい値を使います。", "請對 E2:E8 套用三色交通燈圖示集，低分顯示紅燈、中段黃燈、高分綠燈，依預設百分位門檻即可。"),
            {
              kind: "format",
              mode: "conditional",
              sheet: staffCells,
              ranges: { training: "E2:E8", staffTable: "A1:F8" },
              options: { iconStyles: ["3TrafficLights", "3Arrows", "5Ratings"], reverse: false },
              goal: { operation: "conditional", range: "E2:E8", ruleType: "iconSet", iconStyle: "3TrafficLights", reverse: false },
            },
            L("选中 E2:E8，在“条件格式”→“图标集”中选择三色交通灯；如需反转顺序，在“管理规则”里调整。", "Select E2:E8, choose Conditional Formatting, Icon Sets, Three Traffic Lights; use Manage Rules to reverse the order if needed.", "E2:E8 を選び、条件付き書式→アイコンセット→3色信号を選択します。順序を反転する場合はルールの管理で調整します。", "選取 E2:E8，在「設定格式化的條件」→「圖示集」選擇三色交通燈；如需反轉順序，在「管理規則」調整。"),
            L("得分等级已由交通灯图标表达，阈值和方向符合团队约定。", "Score bands now use traffic-light icons with the agreed direction and thresholds.", "得点帯が信号アイコンで示され、向きとしきい値はチームの取り決めどおりです。", "得分等級已由交通燈圖示表達，門檻和方向符合團隊約定。")
          ),
          lab(
            "dt15-formula-rule-lab",
            L("迁移实验：整行标记高加班记录", "Transfer lab: color the whole row for high overtime", "転用実験：残業超過の行全体を色分け", "遷移實驗：整列標記高加班紀錄"),
            L("主管希望看到整行提示，而不仅是加班列。请为 A2:F8 建立公式规则：当 D 列大于 12 时，整行使用 #FFF2CC 填充和 #7F6000 字体。", "The manager wants the whole row, not just the overtime cell. Create a formula rule on A2:F8: when column D exceeds 12, fill the row #FFF2CC with font #7F6000.", "担当者は残業セルだけでなく行全体を見たいと考えています。A2:F8 に数式ルールを作成し、D列が12を超える行全体を塗りつぶし #FFF2CC、フォント #7F6000 にします。", "主管希望看到整列提示，而不只是加班欄。請為 A2:F8 建立公式規則：當 D 欄大於 12 時，整列使用 #FFF2CC 填色和 #7F6000 字型。"),
            {
              kind: "format",
              mode: "conditional",
              sheet: staffCells,
              ranges: { staffTable: "A2:F8", overtime: "D2:D8" },
              options: { formula: "=$D2>12", fill: "#FFF2CC", font: "#7F6000" },
              goal: { operation: "conditional", range: "A2:F8", ruleType: "formula", formula: "=$D2>12", fill: "#FFF2CC", font: "#7F6000" },
            },
            L("选中 A2:F8，新建“使用公式确定要设置格式的单元格”，公式以 A2 为活动单元格写 =$D2>12，锁定 D 列。", "Select A2:F8 and create a formula rule using =$D2>12, locking column D while letting the row move.", "A2:F8 を選び、数式ルールに =$D2>12 を入力します。D列を固定し、行は相対参照にします。", "選取 A2:F8，新增「使用公式來決定要格式化哪些儲存格」，公式以 A2 為作用中儲存格寫 =$D2>12，鎖定 D 欄。"),
            L("高加班记录现在整行突出，公式规则的相对行引用正确。", "High-overtime records are now highlighted across the full row with the correct relative row reference.", "残業超過の記録が行全体で強調され、相対行参照も正しいです。", "高加班紀錄現在整列突出，公式規則的相對列參照正確。")
          ),
        ]
      ),
      level(
        "data-validation-review",
        "review",
        L("复习：把输入关进正确的范围", "Review: keep input inside a valid range", "復習：入力を正しい範囲に保つ", "複習：把輸入限制在正確範圍"),
        [
          learn(
            "dt15-validation-teach",
            L("验证在输入时拦住错误，而不是事后解释", "Validation blocks errors at entry instead of explaining them later", "入力規則は後から説明せず、入力時に誤りを止める", "驗證在輸入時攔住錯誤，而不是事後解釋"),
            L("数据验证可以限制列表、数值范围和自定义公式，并设置输入提示与错误警告。提示帮助正确填写，警告负责阻止或提醒无效值。", "Data validation can restrict lists, numeric ranges, and custom formulas, with input prompts and error alerts. Prompts guide correct entry; alerts block or warn about invalid values.", "データの入力規則ではリスト・数値範囲・ユーザー設定の数式を制限し、入力メッセージとエラー警告を設定できます。入力メッセージは正しい入力を導き、警告は無効値を止めるか知らせます。", "資料驗證可以限制清單、數值範圍和自訂公式，並設定輸入提示與錯誤警告。提示幫助正確填寫，警告負責阻止或提醒無效值。"),
            [
              L("列表验证适合固定选项，来源可以是连续区域，也可以直接输入简短列表。", "List validation suits fixed options; the source can be a contiguous range or a short typed list.", "リストの入力規則は固定選択肢に向き、連続範囲または短い直接入力を使用できます。", "清單驗證適合固定選項，來源可以是連續範圍，也可以直接輸入簡短清單。"),
              L("范围验证要同时设置允许类型、比较方式和上下限，只设上限仍可能输入负数。", "Range validation needs allowed type, comparison, and both bounds; setting only a maximum still permits negatives.", "範囲の入力規則は種類・比較方法・上下限をすべて設定します。上限だけでは負数を防げません。", "範圍驗證要同時設定允許類型、比較方式和上下限，只設上限仍可能輸入負數。"),
              L("自定义公式必须返回 TRUE 才允许输入，例如用 COUNTIF 防止编号重复。", "A custom formula must return TRUE to allow entry, such as COUNTIF preventing duplicate IDs.", "ユーザー設定の数式は TRUE のときだけ入力を許可します。COUNTIF で番号の重複を防げます。", "自訂公式必須傳回 TRUE 才允許輸入，例如用 COUNTIF 防止編號重複。"),
              L("输入标题与提示要写清规则，错误信息要说明如何改正，不能只写“无效”。", "Input titles and prompts should state the rule, and error messages should explain how to correct it, not just say invalid.", "入力タイトルとメッセージにはルールを、エラーには修正方法を書きます。「無効」だけでは不十分です。", "輸入標題與提示要寫清規則，錯誤訊息要說明如何改正，不能只寫「無效」。"),
            ],
            L("输入提示用于指导，错误警告用于阻止；允许警告时可以保留例外，但必须有人复核。", "Prompts guide and alerts block; if warnings are allowed, exceptions remain but need review.", "入力メッセージは案内、エラー警告は停止に使います。警告のみの場合は例外を確認する運用が必要です。", "輸入提示用於指導，錯誤警告用於阻止；允許警告時可以保留例外，但必須有人複核。"),
            L("验证不能阻止粘贴或提前存在的旧数据，导入后仍需检查整列。", "Validation does not retroactively clean pasted or existing data; check the whole column after import.", "入力規則は貼り付けや既存データを遡って直しません。取込後に列全体を確認します。", "驗證不能阻止貼上或既有的舊資料，匯入後仍需檢查整欄。")
          ),
          lab(
            "dt15-list-validation-lab",
            L("引导实验：限制部门只能从清单选择", "Guided lab: restrict departments to a list", "ガイド付き実験：部署を一覧から選択させる", "引導實驗：限制部門只能從清單選擇"),
            L("请在 C2:C20 建立列表验证，来源为 $H$2:$H$5；输入标题写“选择部门”，提示“请从部门清单选择”，错误样式为 stop，错误标题“部门不在清单中”。", "Create list validation for C2:C20 using $H$2:$H$5. Input title: Select department; prompt: Choose from the department list. Use a Stop error with title Department not listed.", "C2:C20 にリストの入力規則を作成し、参照元を $H$2:$H$5 にします。入力タイトルは「部署を選択」、メッセージは「部署一覧から選択してください」、エラーは停止で「一覧にない部署」とします。", "請在 C2:C20 建立清單驗證，來源為 $H$2:$H$5；輸入標題寫「選擇部門」，提示「請從部門清單選擇」，錯誤樣式為 stop，錯誤標題「部門不在清單中」。"),
            {
              kind: "format",
              mode: "validation",
              sheet: validationCells,
              ranges: { departmentList: "H2:H5", entryArea: "C2:C20" },
              options: { inputTitle: "Select department", inputMessage: "Choose from the department list", errorStyle: "stop" },
              goal: {
                operation: "validation",
                range: "C2:C20",
                allow: "list",
                source: "=$H$2:$H$5",
                inputTitle: L("选择部门", "Select department", "部署を選択", "選擇部門"),
                inputMessage: L("请从部门清单选择", "Choose from the department list", "部署一覧から選択してください", "請從部門清單選擇"),
                errorStyle: "stop",
                errorTitle: L("部门不在清单中", "Department not listed", "一覧にない部署", "部門不在清單中"),
                errorMessage: L("请选择 H2:H5 中的部门，不要手工输入其他名称。", "Choose a department from H2:H5 instead of typing another name.", "H2:H5 にある部署を選び、別名を手入力しないでください。", "請選擇 H2:H5 中的部門，不要手動輸入其他名稱。"),
              },
            },
            L("选中 C2:C20，打开“数据验证”，允许“序列”，来源设为 =$H$2:$H$5，再设置输入和错误提示。", "Select C2:C20, open Data Validation, allow List, set Source to =$H$2:$H$5, then add prompts and error text.", "C2:C20 を選び、データの入力規則で「リスト」を選び、元の値に =$H$2:$H$5 を設定してメッセージを追加します。", "選取 C2:C20，開啟「資料驗證」，允許「序列」，來源設為 =$H$2:$H$5，再設定輸入和錯誤提示。"),
            L("部门列已只能从清单选择，输入提示与错误阻止都已配置。", "The department column now accepts list values only, with both prompt and block alert configured.", "部署列は一覧からのみ選択でき、入力メッセージと停止エラーが設定されています。", "部門欄已只能從清單選擇，輸入提示與錯誤阻止都已設定。")
          ),
          lab(
            "dt15-range-validation-lab",
            L("引导实验：限制餐补在 0 到 1200", "Guided lab: keep meal allowance between 0 and 1200", "ガイド付き実験：食事手当を0〜1200に制限", "引導實驗：限制餐費補助在 0 到 1200"),
            L("请在 E2:E20 限制整数输入，范围为 0 到 1200。提示“请输入 0 到 1200 的整数”，错误样式为 stop，错误信息说明超限处理。", "Restrict E2:E20 to whole numbers between 0 and 1200. Use the prompt Enter a whole number from 0 to 1200 and a Stop alert explaining the limit.", "E2:E20 を0〜1200の整数に制限します。入力メッセージは「0〜1200の整数を入力」、エラーは停止とし、上限超過の扱いを説明します。", "請在 E2:E20 限制整數輸入，範圍為 0 到 1200。提示「請輸入 0 到 1200 的整數」，錯誤樣式為 stop，錯誤訊息說明超限處理。"),
            {
              kind: "format",
              mode: "validation",
              sheet: validationCells,
              ranges: { allowance: "E2:E20", cap: "J1:J2" },
              options: { allow: "whole", operator: "between", minimum: 0, maximum: 1200, errorStyle: "stop" },
              goal: {
                operation: "validation",
                range: "E2:E20",
                allow: "whole",
                operator: "between",
                minimum: 0,
                maximum: 1200,
                inputTitle: L("填写餐补", "Enter meal allowance", "食事手当を入力", "填寫餐費補助"),
                inputMessage: L("请输入 0 到 1200 的整数", "Enter a whole number from 0 to 1200", "0〜1200の整数を入力してください", "請輸入 0 到 1200 的整數"),
                errorStyle: "stop",
                errorTitle: L("金额超出范围", "Amount out of range", "金額が範囲外", "金額超出範圍"),
                errorMessage: L("请改为 0 到 1200 之间的整数；超过上限需走特批。", "Enter a whole number from 0 to 1200. Amounts above the cap need special approval.", "0〜1200の整数にしてください。上限超過は特例承認が必要です。", "請改為 0 到 1200 之間的整數；超過上限需走特批。"),
              },
            },
            L("选中 E2:E20，允许“整数”，设置介于 0 和 1200，再填写输入提示和停止错误。", "Select E2:E20, allow Whole Number, set Between 0 and 1200, then add the prompt and Stop error.", "E2:E20 を選び、整数・指定範囲（0〜1200）を設定して入力メッセージと停止エラーを追加します。", "選取 E2:E20，允許「整數」，設定介於 0 和 1200，再填寫輸入提示和停止錯誤。"),
            L("餐补列现在只接受限定范围内的整数，越界输入会被明确拦下。", "The allowance column accepts only whole numbers in range, and out-of-range entries are blocked with a clear reason.", "食事手当列は範囲内の整数だけを受け付け、範囲外は明確な理由で止まります。", "餐費補助欄現在只接受限定範圍內的整數，越界輸入會被明確攔下。")
          ),
          lab(
            "dt15-custom-validation-lab",
            L("复习实验：防止员工编号重复", "Review lab: prevent duplicate staff IDs", "復習実験：社員番号の重複を防ぐ", "複習實驗：防止員工編號重複"),
            L("A2:A20 将用于登记员工编号。请建立自定义验证公式，使同一编号只能出现一次；提示写“输入唯一编号”，出错时说明已存在。", "A2:A20 will register staff IDs. Add custom validation so each ID can appear only once, with prompt Enter a unique ID and an error explaining the duplicate.", "A2:A20 は社員番号の登録に使います。同じ番号を1回だけ許可するユーザー設定の数式を追加し、入力メッセージを「一意の番号を入力」、エラーは重複を説明する内容にします。", "A2:A20 將用於登記員工編號。請建立自訂驗證公式，使同一編號只能出現一次；提示寫「輸入唯一編號」，出錯時說明已存在。"),
            {
              kind: "format",
              mode: "validation",
              sheet: validationCells,
              ranges: { staffIds: "A2:A20", entryArea: "A2:E20" },
              options: { allow: "custom", formula: "=COUNTIF($A$2:$A$20,A2)=1", errorStyle: "stop" },
              goal: {
                operation: "validation",
                range: "A2:A20",
                allow: "custom",
                formula: "=COUNTIF($A$2:$A$20,A2)=1",
                inputTitle: L("员工编号", "Staff ID", "社員番号", "員工編號"),
                inputMessage: L("输入唯一编号", "Enter a unique ID", "一意の番号を入力してください", "輸入唯一編號"),
                errorStyle: "stop",
                errorTitle: L("编号已存在", "ID already exists", "番号が重複しています", "編號已存在"),
                errorMessage: L("该员工编号已出现，请核对花名册后再输入。", "This staff ID already appears. Check the roster before entering it again.", "この社員番号は既にあります。名簿を確認してから再入力してください。", "該員工編號已出現，請核對名冊後再輸入。"),
              },
            },
            L("选中 A2:A20，数据验证允许“自定义”，公式写 =COUNTIF($A$2:$A$20,A2)=1，注意锁定整个列表范围。", "Select A2:A20, allow Custom, and use =COUNTIF($A$2:$A$20,A2)=1 with the full list range locked.", "A2:A20 を選び、ユーザー設定で =COUNTIF($A$2:$A$20,A2)=1 を入力します。一覧範囲を固定してください。", "選取 A2:A20，資料驗證允許「自訂」，公式寫 =COUNTIF($A$2:$A$20,A2)=1，注意鎖定整個清單範圍。"),
            L("员工编号列已能阻止重复输入，消息也说明了复核路径。", "The ID column now blocks duplicates and the message explains the review path.", "社員番号列は重複入力を止め、メッセージで確認手順も示しています。", "員工編號欄已能阻止重複輸入，訊息也說明了複核路徑。")
          ),
        ]
      ),
    ],
  });

  D.registerChapter({
    id: "ch16-data-tools",
    icon: "16",
    title: L("第 16 章 · 数据整理工具", "Chapter 16 · Data Preparation Tools", "第16章 · データ整理ツール", "第 16 章 · 資料整理工具"),
    subtitle: L("把杂乱列表整理成可排序、可筛选、可汇总、可导入导出的标准数据表。", "Turn messy lists into standard tables that can be sorted, filtered, summarized, imported, and exported.", "乱れた一覧を、並べ替え・絞り込み・集計・取込・出力できる標準表に整えます。", "把雜亂清單整理成可排序、可篩選、可彙總、可匯入匯出的標準資料表。"),
    levels: [
      level(
        "data-sort-filter-advanced",
        "lesson",
        L("排序与高级筛选", "Sorting and advanced filtering", "並べ替えとフィルターオプション", "排序與進階篩選"),
        [
          learn(
            "dt16-sort-teach",
            L("先决定顺序，再决定显示哪些行", "Choose the order first, then choose which rows show", "先に順序、その後に表示する行を決める", "先決定順序，再決定顯示哪些列"),
            L("多关键字排序让第一关键字相同的记录继续按第二关键字排列；自定义排序可以按优先级代码或指定清单排列。高级筛选则把条件区域和结果位置写在表外，适合可重复的筛选规则。", "Multi-level sort continues with a second key when the first key ties; custom sort can follow priority codes or a specified list. Advanced Filter places criteria and output outside the table, which suits repeatable rules.", "複数キーの並べ替えは第1キーが同じ場合に第2キーで順序を決めます。ユーザー設定の並べ替えは優先コードや指定リストに従えます。フィルターオプションでは条件範囲と出力先を表の外に置き、繰り返し使えるルールにできます。", "多層排序讓第一鍵相同時繼續依第二鍵排列；自訂排序可以依優先順序代碼或指定清單排列。進階篩選則把條件範圍和結果位置寫在表外，適合可重複使用的篩選規則。"),
            [
              L("排序范围必须包含完整记录，不能只选一列；否则不同列会错位。", "The sort range must cover whole records, never one column, or fields will become misaligned.", "並べ替え範囲は行全体を含め、1列だけを選ぶと列同士がずれます。", "排序範圍必須包含完整紀錄，不能只選一欄；否則不同欄會錯位。"),
              L("自定义排序要确认先后顺序；列表中没有的值通常会排在自定义项之后。", "Custom sort needs a confirmed order; values absent from the list usually fall after listed items.", "ユーザー設定の並べ替えでは順序を確認します。リストにない値は通常その後に並びます。", "自訂排序要確認先後順序；清單中沒有的值通常會排在自訂項目之後。"),
              L("高级筛选的条件区域第一行必须是表头，第二行才是条件值；同一行是“且”，不同行是“或”。", "In an Advanced Filter criteria range, the first row holds headers and the second row holds values; conditions on the same row are AND, separate rows are OR.", "フィルターオプションの条件範囲は1行目が表頭、2行目が条件値です。同じ行は AND、別の行は OR になります。", "進階篩選的條件範圍第一列必須是表頭，第二列才是條件值；同一列是「且」，不同列是「或」。"),
              L("复制到其他位置时，目标位置要有空间；结果只是副本，原表筛选并未改变。", "When copying to another location, reserve enough space; the result is a copy and the source filter is not changed.", "別の位置へコピーする場合は十分な空きを確保します。結果はコピーで、元表の絞り込みは変わりません。", "複製到其他位置時，目標位置要有空間；結果只是副本，原表篩選並未改變。"),
            ],
            L("排序改变顺序，筛选改变可见范围；高级筛选适合把固定规则和输出放在固定位置。", "Sort changes order, filtering changes visibility; Advanced Filter is best when rules and output live at fixed locations.", "並べ替えは順序、絞り込みは表示範囲を変えます。フィルターオプションは固定ルールと固定出力に向きます。", "排序改變順序，篩選改變可見範圍；進階篩選適合把固定規則和輸出放在固定位置。"),
            L("排序前备份原始顺序，或加一列原始行号；否则很难恢复。", "Back up the original order or add a source row-number column before sorting; otherwise it is hard to restore.", "並べ替え前に元の順序を保存するか、元の行番号列を追加します。後から戻すのが難しくなります。", "排序前備份原始順序，或加一欄原始列號；否則很難恢復。")
          ),
          lab(
            "dt16-multisort-lab",
            L("引导实验：先按金额降序，再按团队升序", "Guided lab: sort by amount descending, then team ascending", "ガイド付き実験：金額降順の後にチーム昇順", "引導實驗：先依金額遞減，再依團隊遞增"),
            L("请对 A1:G11 做多关键字排序：金额 D 列降序；金额相同时，团队 B 列升序。表头参与识别，不要排序进数据区。", "Sort A1:G11 by Amount, column D, descending; when amounts tie, sort Team, column B, ascending. Keep headers out of the data.", "A1:G11 を金額D列の降順、金額が同じ場合はチームB列の昇順で並べ替えます。表頭はデータとして扱いません。", "請對 A1:G11 做多層排序：金額 D 欄遞減；金額相同時，團隊 B 欄遞增。表頭參與識別，不要排序進資料區。"),
            {
              kind: "data",
              mode: "sort",
              sheet: sortCells,
              ranges: { supplyTable: "A1:G11" },
              options: { sortLevels: 2, hasHeaders: true },
              goal: {
                operation: "sort",
                range: "A1:G11",
                levels: [{ column: "D", order: "desc" }, { column: "B", order: "asc" }],
                hasHeaders: true,
              },
            },
            L("选中完整表 A1:G11，打开“数据”→“排序”，添加第二个条件；确认“数据包含标题”。", "Select A1:G11, open Data, Sort, add a second level, and confirm the range has headers.", "A1:G11 を選び、「データ」→「並べ替え」で第2レベルを追加し、表頭ありを確認します。", "選取完整表 A1:G11，開啟「資料」→「排序」，新增第二個條件；確認「資料包含標題」。"),
            L("金额和团队的双层顺序已经正确，记录没有被拆散。", "The two-level amount and team order is correct and records remain intact.", "金額とチームの2段階順序が正しく、行のまとまりも保たれています。", "金額和團隊的雙層順序已正確，紀錄沒有被拆散。")
          ),
          lab(
            "dt16-customsort-lab",
            L("引导实验：按 P1、P2、P3 自定义顺序", "Guided lab: sort by the P1, P2, P3 custom order", "ガイド付き実験：P1・P2・P3 のユーザー設定順", "引導實驗：依 P1、P2、P3 自訂順序"),
            L("运营希望先看最紧急的采购项。请对 A1:G11 按 G 列自定义顺序 P1、P2、P3 排序，表头保持第一行。", "Operations wants the most urgent purchases first. Sort A1:G11 by column G in the custom order P1, P2, P3, keeping the header in row 1.", "運営は緊急度の高い発注を先に見たいと考えています。A1:G11 をG列のユーザー設定順 P1、P2、P3 で並べ替え、表頭を1行目に保ちます。", "營運希望先看最緊急的採購項。請對 A1:G11 依 G 欄自訂順序 P1、P2、P3 排序，表頭保持第一列。"),
            {
              kind: "data",
              mode: "sort",
              sheet: sortCells,
              ranges: { supplyTable: "A1:G11", priority: "G2:G11" },
              options: { customList: ["P1", "P2", "P3"], hasHeaders: true },
              goal: {
                operation: "sort",
                range: "A1:G11",
                levels: [{ column: "G", order: "custom", customList: ["P1", "P2", "P3"] }],
                hasHeaders: true,
              },
            },
            L("打开“排序”→“次序”→“自定义序列”，输入 P1、P2、P3，各占一行，再应用到 G 列。", "Open Sort, Order, Custom List, enter P1, P2, and P3 on separate lines, then apply it to column G.", "並べ替え→順序→ユーザー設定リストで P1、P2、P3 を1行ずつ入力し、G列に適用します。", "開啟「排序」→「順序」→「自訂清單」，輸入 P1、P2、P3，各佔一列，再套用到 G 欄。"),
            L("采购项已按自定义优先级排列，P1 在最前，原表数据保持完整。", "Purchases now follow the custom priority order with P1 first and all source data intact.", "発注項目がユーザー設定の優先順に並び、P1が先頭で元データも保たれています。", "採購項已依自訂優先順序排列，P1 在最前面，原表資料保持完整。")
          ),
          lab(
            "dt16-advancedfilter-lab",
            L("迁移实验：把设计团队的紧急项复制到表外", "Transfer lab: copy urgent Design items outside the table", "転用実験：デザインの緊急項目を表外へ抽出", "遷移實驗：把設計團隊的緊急項目複製到表外"),
            L("请以 H1:I2 为条件区域，对 A1:G11 执行高级筛选，只保留团队“设计”且状态“紧急”的记录，并把结果复制到 J1。", "Use H1:I2 as the criteria range and run Advanced Filter on A1:G11 for Team = Design and Status = Urgent, copying the result to J1.", "H1:I2 を条件範囲として A1:G11 にフィルターオプションを実行し、チーム「デザイン」かつ状態「緊急」の行を J1 へコピーします。", "請以 H1:I2 為條件範圍，對 A1:G11 執行進階篩選，只保留團隊「設計」且狀態「緊急」的紀錄，並把結果複製到 J1。"),
            {
              kind: "data",
              mode: "advancedFilter",
              sheet: sortCells,
              ranges: { listRange: "A1:G11", criteria: "H1:I2", output: "J1" },
              options: { action: "copyTo", copyTo: "J1" },
              goal: { operation: "advancedFilter", listRange: "A1:G11", criteriaRange: "H1:I2", action: "copyTo", copyTo: "J1" },
            },
            L("条件区域第一行必须与列表表头一致；H1 是团队、I1 是状态，第二行填“设计”和“紧急”。", "The criteria headers must match the list headers: H1 Team and I1 Status, with Design and Urgent in row 2.", "条件範囲の1行目は表頭と一致させます。H1 チーム、I1 状態、2行目に「デザイン」「緊急」を入れます。", "條件範圍第一列必須與清單表頭一致；H1 是團隊、I1 是狀態，第二列填「設計」和「緊急」。"),
            L("符合条件的记录已复制到 J1 起的位置，原列表没有被删除。", "Matching records are copied starting at J1 and the original list was not deleted.", "条件に合う記録が J1 以降へコピーされ、元の一覧は削除されていません。", "符合條件的紀錄已複製到 J1 起始位置，原清單沒有被刪除。")
          ),
        ]
      ),
      level(
        "data-clean-transform",
        "lesson",
        L("去重、拆列与转置", "Remove duplicates, split columns, and transpose", "重複削除・列分割・行列変換", "去重、拆欄與轉置"),
        [
          learn(
            "dt16-clean-teach",
            L("清理数据要保留可追溯性", "Cleaning must preserve traceability", "整理後も追跡できる状態を残す", "整理資料要保留可追溯性"),
            L("删除重复项会永久删除行，文本分列会改变数据结构，选择性粘贴则可以只复制值或转置。任何会覆盖原数据的操作都应先备份或复制到新工作表。", "Remove Duplicates permanently deletes rows, Text to Columns changes structure, and Paste Special can copy values only or transpose. Back up or copy to a new sheet before overwriting source data.", "重複削除は行を完全に削除し、区切り位置は構造を変え、形式を選択して貼り付けでは値のみや行列変換ができます。元データを上書きする前にバックアップします。", "刪除重複項會永久刪除列，資料分欄會改變結構，選擇性貼上則可以只複製值或轉置。任何會覆寫原始資料的操作都應先備份或複製到新工作表。"),
            [
              L("删除重复项按选定列判断重复，保留第一次出现的记录，后续重复行被删除。", "Remove Duplicates judges duplicates by the selected columns, keeps the first occurrence, and deletes later matches.", "重複の削除は選択した列で判定し、最初の出現を残して後の重複行を削除します。", "刪除重複項依選定欄判斷重複，保留第一次出現的紀錄，後續重複列被刪除。"),
              L("文本分列适合固定分隔符或固定宽度，先预览目标列，避免覆盖已有数据。", "Text to Columns suits a fixed delimiter or width; preview destination columns to avoid overwriting existing data.", "区切り位置は固定の区切り文字や幅に向きます。出力先を確認し、既存データの上書きを避けます。", "資料分欄適合固定分隔符或固定寬度，先預覽目標欄，避免覆寫既有資料。"),
              L("选择性粘贴“值”可以去掉公式，转置则把行列方向互换；两者可以同时使用。", "Paste Special Values removes formulas, while Transpose swaps rows and columns; both can be used together.", "形式を選択して貼り付けの「値」は数式を外し、「行列を入れ替える」は行と列を交換します。同時にも使えます。", "選擇性貼上「值」可以移除公式，轉置則把列欄方向互換；兩者可以同時使用。"),
              L("清理后应检查行数、关键合计和重复键，确认没有误删有效记录。", "After cleaning, verify row counts, key totals, and duplicate keys to ensure no valid records were lost.", "整理後は行数・主要合計・重複キーを確認し、有効な記録を失っていないか点検します。", "清理後應檢查列數、關鍵合計和重複鍵，確認沒有誤刪有效紀錄。"),
            ],
            L("任何“删除”类操作前先复制工作表；任何“分列”操作前先确认目标列是空的。", "Copy the sheet before any delete operation; confirm destination columns are empty before splitting text.", "削除操作の前にシートをコピーし、区切り位置の前に出力先が空であることを確認します。", "任何「刪除」類操作前先複製工作表；任何「分欄」操作前先確認目標欄是空的。"),
            L("转置后列标题变成行标题，公式引用往往需要重新检查，不要直接沿用。", "After transposing, column headers become row headers and formula references often need review; do not assume they still work.", "行列変換後は列見出しが行見出しになり、数式参照の確認が必要です。そのまま使い回さないでください。", "轉置後欄標題會變成列標題，公式參照往往需要重新檢查，不要直接沿用。")
          ),
          lab(
            "dt16-remove-duplicates-lab",
            L("引导实验：按物品和团队删除重复采购项", "Guided lab: remove duplicate purchases by item and team", "ガイド付き実験：品目とチームで重複発注を削除", "引導實驗：依品項和團隊刪除重複採購項"),
            L("表中有同一物品在同一团队重复登记的情况。请对 A1:G11 使用 A 列和 B 列判断重复，保留第一次出现的记录，并保留表头。", "The table repeats the same item for the same team. Use columns A and B as the duplicate key in A1:G11, keep the first record, and retain the header.", "同じチームで同じ品目が重複しています。A1:G11 のA列とB列をキーに重複を削除し、最初の記録と表頭を残します。", "表中有同一品項在同一團隊重複登記的情況。請對 A1:G11 使用 A 欄和 B 欄判斷重複，保留第一次出現的紀錄，並保留表頭。"),
            {
              kind: "data",
              mode: "removeDuplicates",
              sheet: sortCells,
              ranges: { supplyTable: "A1:G11" },
              options: { columns: ["A", "B"], hasHeaders: true },
              goal: { operation: "removeDuplicates", range: "A1:G11", columns: ["A", "B"], hasHeaders: true },
            },
            L("选中 A1:G11，打开“数据”→“删除重复值”，只勾选“物品”和“团队”，确认表头已勾选。", "Select A1:G11, open Data, Remove Duplicates, tick only Item and Team, and ensure My data has headers is selected.", "A1:G11 を選び、「データ」→「重複の削除」で「品目」と「チーム」だけを選び、表頭ありを確認します。", "選取 A1:G11，開啟「資料」→「刪除重複項」，只勾選「品項」和「團隊」，確認標題已勾選。"),
            L("重复的显示器记录已合并为第一次出现的记录，其他物品与团队组合保持完整。", "The duplicate monitor record is reduced to its first occurrence while other item-team combinations remain.", "重複したモニター記録が最初の1件になり、他の品目とチームの組み合わせは保たれています。", "重複的螢幕紀錄已合併為第一次出現的紀錄，其他品項與團隊組合保持完整。")
          ),
          lab(
            "dt16-text-to-columns-lab",
            L("引导实验：按竖线拆开导入行", "Guided lab: split import lines on the pipe character", "ガイド付き実験：縦線で取込行を分割", "引導實驗：依直線符號拆開匯入列"),
            L("H2:H5 是系统导出的竖线分隔文本。请按分隔符 | 拆分到 J2 起的三列，原行保留作为来源记录。", "H2:H5 contains pipe-delimited export text. Split it into three columns starting at J2 while keeping the source rows for traceability.", "H2:H5 は縦線区切りの出力テキストです。区切り文字 | で J2 以降の3列へ分割し、元の行は追跡用に残します。", "H2:H5 是系統匯出的直線分隔文字。請依分隔符號 | 拆分到 J2 起的三欄，原列保留作為來源紀錄。"),
            {
              kind: "data",
              mode: "textToColumns",
              sheet: splitCells,
              ranges: { rawLines: "H2:H5", destination: "J2:L5" },
              options: { delimiter: "|", destination: "J2", originalPreserved: true },
              goal: { operation: "textToColumns", range: "H2:H5", delimiter: "|", destination: "J2" },
            },
            L("选中 H2:H5，使用“数据”→“分列”，选择“分隔符号”，勾选“其他”并输入 |，目标位置设为 J2。", "Select H2:H5, use Data, Text to Columns, choose Delimited, select Other, type |, and set the destination to J2.", "H2:H5 を選び、「データ」→「区切り位置」で「区切り記号」を選び、「その他」に | を入力し、出力先を J2 にします。", "選取 H2:H5，使用「資料」→「分欄」，選擇「分隔符號」，勾選「其他」並輸入 |，目標位置設為 J2。"),
            L("原始行已拆成团队、编号和日期三列，来源文本仍可追溯。", "Each source line is split into team, code, and date columns while the original text remains traceable.", "元の行がチーム・番号・日付の3列に分かれ、元テキストも追跡できます。", "原始列已拆成團隊、編號和日期三欄，來源文字仍可追溯。")
          ),
          lab(
            "dt16-pastespecial-lab",
            L("迁移实验：把明细转置成横向快照", "Transfer lab: transpose the ledger into a horizontal snapshot", "転用実験：明細を行列変換して横置きにする", "遷移實驗：把明細轉置成橫向快照"),
            L("请在 H2 起做一个值快照，把 A1:E6 的行列互换；只要值，不要带公式或原格式。", "Create a values-only snapshot at H2 with A1:E6 transposed; leave formulas and source formatting behind.", "H2 以降に値のみのスナップショットを作り、A1:E6 の行と列を入れ替えます。数式や元の書式は持ち込みません。", "請在 H2 起做一個純值快照，把 A1:E6 的列欄互換；只要值，不要帶公式或原格式。"),
            {
              kind: "data",
              mode: "pasteSpecial",
              sheet: ledgerCells,
              ranges: { sourceLedger: "A1:E6", destination: "H2" },
              options: { paste: "values", transpose: true, operation: "none" },
              goal: { operation: "pasteSpecial", sourceRange: "A1:E6", destination: "H2", paste: "values", transpose: true },
            },
            L("复制 A1:E6，在 H2 使用“选择性粘贴”，勾选“数值”和“转置”，不要直接 Ctrl+V。", "Copy A1:E6, use Paste Special at H2, select Values and Transpose rather than a plain paste.", "A1:E6 をコピーし、H2 で「形式を選択して貼り付け」を開き、「値」と「行列を入れ替える」を選びます。", "複製 A1:E6，在 H2 使用「選擇性貼上」，勾選「值」和「轉置」，不要直接 Ctrl+V。"),
            L("快照已按行列互换生成，数值与源表一致，公式和格式没有被带入。", "The snapshot is transposed with matching values and carries neither formulas nor source formatting.", "スナップショットは行列変換され、値は一致し、数式や元の書式は持ち込まれていません。", "快照已依列欄互換產生，數值與來源表一致，公式和格式沒有被帶入。")
          ),
        ]
      ),
      level(
        "data-totals-review",
        "review",
        L("复习：分类汇总、合并与导入", "Review: subtotals, consolidation, and import", "復習：小計・統合・取込", "複習：分類彙總、合併與匯入"),
        [
          learn(
            "dt16-totals-teach",
            L("汇总前先确定分组键和导入结构", "Fix the grouping key and import shape before summarizing", "集計前にグループ化キーと取込構造を決める", "彙總前先確定分組鍵和匯入結構"),
            L("分类汇总要求先按分组列排序，再插入汇总行；合并计算把多张结构相同的表汇总到主表；导入文本则要确认分隔符、标题行和目标位置。", "Subtotal requires sorting by the grouping column first, then inserting summary rows. Consolidate combines similarly structured sheets into a master sheet. Text import needs confirmed delimiter, header row, and destination.", "小計は先にグループ列で並べ替えてから集計行を挿入します。統合は同じ構成の複数シートをまとめ、テキスト取込では区切り文字・表頭・出力先を確認します。", "分類彙總要求先依分組欄排序，再插入彙總列；合併計算把多張結構相同的工作表彙總到主表；匯入文字則要確認分隔符號、標題列和目標位置。"),
            [
              L("小计会插入分级显示行，改变行数；后续再排序或筛选会打乱汇总结构。", "Subtotal inserts outline rows and changes row count; later sorting or filtering can disrupt the summary structure.", "小計はアウトライン行を挿入して行数を変えます。後から並べ替えや絞り込みをすると構造が崩れます。", "小計會插入分級顯示列，改變列數；後續再排序或篩選會打亂彙總結構。"),
              L("合并计算前，各来源表的行标签和列标签要一致，否则会生成大量孤立的行列。", "Before consolidation, align row and column labels across sources; otherwise many isolated rows and columns appear.", "統合前に各元シートの行・列ラベルをそろえます。そろわないと孤立した行や列が大量にできます。", "合併計算前，各來源表的列標籤和欄標籤要一致，否則會產生大量孤立的列欄。"),
              L("分类汇总通常只对一张连续表使用；按字段汇总多张表更适合数据透视表。", "Subtotal usually applies to one continuous table; for field-level summaries across many tables, a PivotTable is usually better.", "小計は通常1枚の連続表に使い、複数表の項目別集計にはピボットテーブルが適しています。", "分類彙總通常只用於一張連續表；依欄位彙總多張表更適合樞紐分析表。"),
              L("导入文本后要检查前导零、日期格式和小数点，系统导出的编号不能当数字丢失。", "After importing text, check leading zeros, date formats, and decimals; exported IDs must not lose leading zeros as numbers.", "テキスト取込後は先頭の0、日付形式、小数点を確認します。出力された番号を数値化して先頭0を失わないようにします。", "匯入文字後要檢查前導零、日期格式和小數點，系統匯出的編號不能當數字而遺失前導零。"),
            ],
            L("导入数据先进暂存表，验证字段和行数后再并入正式表。", "Import into a staging sheet, validate fields and row counts, then merge into the official table.", "取込データは一時シートに入れ、項目と行数を検証してから正式表へ統合します。", "匯入資料先進暫存表，驗證欄位和列數後再併入正式表。"),
            L("合并前保留一份来源清单，交付时要能说明每个数字来自哪张表。", "Keep a source inventory before consolidation; the handoff must show which sheet every number came from.", "統合前に参照元一覧を残し、各数値がどのシート由来か説明できるようにします。", "合併前保留一份來源清單，交付時要能說明每個數字來自哪張工作表。")
          ),
          lab(
            "dt16-subtotal-lab",
            L("引导实验：按团队小计金额和成本", "Guided lab: subtotal amount and cost by team", "ガイド付き実験：チーム別に金額と原価を小計", "引導實驗：依團隊小計金額和成本"),
            L("采购表已按团队排好。请对 A1:G11 使用分类汇总，按 B 列分组，对 D、E 列求和，并显示分级显示。", "The purchase table is sorted by team. Add a subtotal to A1:G11 grouped by column B, summing columns D and E, and show the outline.", "発注表はチーム別に並んでいます。A1:G11 に分類集計を設定し、B列でグループ化してD・E列を合計し、アウトラインを表示します。", "採購表已依團隊排好。請對 A1:G11 使用分類彙總，依 B 欄分組，對 D、E 欄求和，並顯示分級顯示。"),
            {
              kind: "data",
              mode: "subtotal",
              sheet: sortCells,
              ranges: { supplyTable: "A1:G11" },
              options: { groupBy: "B", function: "SUM", columns: ["D", "E"], replaceCurrent: false, summaryBelowData: true, outline: true },
              goal: { operation: "subtotal", range: "A1:G11", groupBy: "B", function: "SUM", columns: ["D", "E"], outline: true },
            },
            L("先确保团队列已排序，再打开“数据”→“分类汇总”，分组依据选团队，汇总方式选求和，勾选金额与成本。", "Ensure Team is sorted, then use Data, Subtotal, group by Team, function Sum, and tick Amount and Cost.", "チーム列が並んでいることを確認し、「データ」→「集計」でグループの基準をチーム、集計方法を合計、金額と原価を選択します。", "先確認團隊欄已排序，再開啟「資料」→「分類彙總」，分組依據選團隊，彙總方式選求和，勾選金額與成本。"),
            L("每个团队下都插入了金额与成本小计，分级显示可折叠明细。", "Each team has amount and cost subtotals, and the outline can collapse the detail rows.", "各チームの下に金額と原価の小計が入り、アウトラインで明細を折りたためます。", "每個團隊下都插入了金額與成本小計，分級顯示可摺疊明細。")
          ),
          lab(
            "dt16-consolidate-lab",
            L("迁移实验：合并三个区域的数量", "Transfer lab: consolidate quantities from three regions", "転用実験：3地域の数量を統合", "遷移實驗：合併三個區域的數量"),
            L("North、South、East 三张区域表结构一致。请在 Summary 页使用合并计算，汇总三张表的 B2:C5，使用求和并按行列标签匹配。", "North, South, and East share the same layout. On Summary, use Consolidate for B2:C5 from all three with Sum and matching labels.", "North・South・East は同じ構成です。Summary で統合を使い、3つの B2:C5 を合計し、行・列ラベルを照合します。", "North、South、East 三張區域表結構一致。請在 Summary 頁使用合併計算，彙總三張表的 B2:C5，使用求和並依列欄標籤對應。"),
            {
              kind: "data",
              mode: "consolidate",
              workbook: {
                active: "Summary",
                sheets: [
                  { name: "North", cells: K.makeSheet([L("物品", "Item", "品目", "品項"), L("一月", "Jan", "1月", "一月"), L("二月", "Feb", "2月", "二月")], [[L("显示器", "Monitor", "モニター", "螢幕"), 8, 6], [L("键盘", "Keyboard", "キーボード", "鍵盤"), 12, 15]]), tabColor: "blue", hidden: false },
                  { name: "South", cells: K.makeSheet([L("物品", "Item", "品目", "品項"), L("一月", "Jan", "1月", "一月"), L("二月", "Feb", "2月", "二月")], [[L("显示器", "Monitor", "モニター", "螢幕"), 10, 7], [L("键盘", "Keyboard", "キーボード", "鍵盤"), 9, 11]]), tabColor: "blue", hidden: false },
                  { name: "East", cells: K.makeSheet([L("物品", "Item", "品目", "品項"), L("一月", "Jan", "1月", "一月"), L("二月", "Feb", "2月", "二月")], [[L("显示器", "Monitor", "モニター", "螢幕"), 5, 9], [L("键盘", "Keyboard", "キーボード", "鍵盤"), 14, 10]]), tabColor: "blue", hidden: false },
                  { name: "Summary", cells: { A1: L("汇总起点", "Consolidation start", "統合開始位置", "彙總起點") }, tabColor: "green", hidden: false },
                ],
              },
              ranges: { north: "North!A1:C3", south: "South!A1:C3", east: "East!A1:C3", destination: "Summary!A2" },
              options: { sources: ["North!A1:C3", "South!A1:C3", "East!A1:C3"], function: "SUM", topRow: true, leftColumn: true },
              goal: {
                operation: "consolidate",
                sources: ["North!A1:C3", "South!A1:C3", "East!A1:C3"],
                destination: "A2",
                function: "SUM",
                topRow: true,
                leftColumn: true,
              },
            },
            L("在 Summary 打开“数据”→“合并计算”，逐个添加三张区域表，勾选首行和最左列，函数选求和。", "In Summary, use Data, Consolidate, add all three region ranges, tick Top Row and Left Column, and choose Sum.", "Summary で「データ」→「統合」を開き、3つの地域範囲を追加し、先頭行と左端列を使うにチェックして合計を選びます。", "在 Summary 開啟「資料」→「合併計算」，逐個加入三張區域表，勾選首列和最左欄，函數選求和。"),
            L("三个区域的显示器与键盘数量已按行列标签合并，汇总结构清晰。", "Monitor and keyboard quantities from all three regions are consolidated by labels.", "3地域のモニターとキーボード数量がラベル別に統合されました。", "三個區域的螢幕與鍵盤數量已依列欄標籤合併，彙總結構清楚。")
          ),
          lab(
            "dt16-import-lab",
            L("复习实验：导入逗号分隔的采购回执", "Review lab: import comma-delimited purchase receipts", "復習実験：カンマ区切りの発注明細を取り込む", "複習實驗：匯入逗號分隔的採購回執"),
            L("A2:A7 是系统回执及标题行。请把这段逗号分隔文本粘贴到导入文本区，使用 CSV、UTF-8 和首行标题。", "A2:A7 contains the system receipt and header row. Paste this comma-delimited text into the import text area with CSV, UTF-8, and a header row.", "A2:A7 は受領データと見出し行です。このカンマ区切りテキストを取込テキスト欄へ貼り付け、CSV・UTF-8・先頭行見出しを指定します。", "A2:A7 是系統回執及標題列。請把這段逗號分隔文字貼到匯入文字區，使用 CSV、UTF-8 和首列標題。"),
            {
              kind: "data",
              mode: "import",
              sheet: K.makeSheet([
                L("回执订单", "Receipt order", "受領注文", "回執訂單"),
                L("团队", "Team", "チーム", "團隊"),
                L("金额", "Amount", "金額", "金額"),
                L("状态", "Status", "状態", "狀態"),
              ], [], {
                A1: L("原始回执文本", "Raw receipt text", "受領テキスト", "原始回執文字"),
                A2: "Order,Group,Amount,Status",
                A3: "RC-5001,Design,4200,Approved",
                A4: "RC-5002,Admin,1800,Pending",
                A5: "RC-5003,Support,2600,Approved",
                A6: "RC-5004,Training,5100,Review",
                A7: "RC-5005,Design,3300,Approved",
              }),
              ranges: { rawText: "A2:A7" },
              options: { importSource: "csv", encoding: "UTF-8", hasHeaders: true },
              goal: {
                operation: "import",
                importSource: "csv",
                encoding: "UTF-8",
                importText: "Order,Group,Amount,Status\nRC-5001,Design,4200,Approved\nRC-5002,Admin,1800,Pending\nRC-5003,Support,2600,Approved\nRC-5004,Training,5100,Review\nRC-5005,Design,3300,Approved",
                hasHeaders: true,
              },
            },
            L("将可见逗号文本完整粘贴到导入框，选择 CSV、UTF-8，并勾选首行包含标题。", "Paste the full visible comma text into the import box, choose CSV and UTF-8, and confirm the first row contains headers.", "表示中のカンマ区切りテキストを取込欄へ貼り付け、CSV・UTF-8を選び、先頭行を表頭として扱います。", "將可見逗號文字完整貼到匯入框，選擇 CSV、UTF-8，並勾選首列包含標題。"),
            L("回执字段和标题已完整导入，可继续做后续汇总。", "The receipt fields and headers are fully imported and ready for later summary work.", "受領データの項目と見出しが取り込まれ、集計に進めます。", "回執欄位和標題已完整匯入，可繼續做後續彙總。")
          ),
        ]
      ),
    ],
  });
})();
