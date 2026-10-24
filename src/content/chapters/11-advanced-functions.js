(function () {
  "use strict";

  const D = window.CourseData;
  const K = window.CurriculumKit;
  const L = D.L;
  const learn = D.learnStep;
  const languages = ["zh-CN", "en", "ja", "zh-TW"];

  function alignGoal(mode, goal) {
    if (mode === "dataTable") {
      goal.formula = "=B1*B2";
      goal.rowInputCell = goal.rowInput;
      goal.columnInputCell = goal.columnInput || "";
      goal.resultCell = "E2";
      delete goal.rowInput;
      delete goal.columnInput;
      delete goal.dataTableRange;
      delete goal.variables;
    }
    if (mode === "solver") {
      goal.objectiveCell = goal.setCell;
      goal.objective = goal.to;
      goal.variableCells = String(goal.byChanging || "").split(/[,;\n]/).map((value) => value.trim()).filter(Boolean);
      goal.constraints = "B6 <= B9, B2 >= 0, B3 >= 0, B4 >= 0";
      delete goal.setCell;
      delete goal.to;
      delete goal.byChanging;
    }
    if (mode === "forecast") {
      goal.forecastRange = goal.sourceRange;
      goal.confidence = 95;
      goal.seasonality = true;
      delete goal.sourceRange;
      delete goal.destination;
    }
    if (mode === "array") {
      goal.arrayFormula = goal.formula;
      delete goal.formula;
    }
    if (mode === "pivot" || mode === "pivotChart") {
      if (goal.showAs === "percentOfTotal") goal.showAs = "percentOfGrandTotal";
      if (goal.groupDate === "months") goal.groupDate = "month";
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

  function manualTask(spec) {
    const required = Array.isArray(spec.requiredFunctions)
      ? spec.requiredFunctions
      : [spec.requiredFunction].filter(Boolean);
    const expectedByLanguage = Object.fromEntries(languages.map((language) => [language, spec.expected]));
    const result = {
      id: spec.id,
      sheet: spec.sheet,
      target: spec.target,
      taskLabel: spec.taskLabel,
      title: spec.title,
      lead: spec.lead,
      hint: spec.hint,
      success: spec.success,
      formulaExample: spec.formula,
      requiredFunction: required[0],
      requiredFunctions: required,
      mode: "fixed",
      expectedByLanguage,
    };
    Object.defineProperty(result, "expected", {
      enumerable: true,
      get() { return result.expectedByLanguage["zh-CN"]; },
    });
    return result;
  }

  function dataSheet(headers, rows, labels, extras) {
    const sheet = K.makeSheet(headers, rows, Object.assign({
      I1: L("检查点", "Checkpoint", "チェック項目", "檢查點"),
      J1: L("结果", "Result", "結果", "結果"),
    }, extras || {}));
    labels.forEach((label, index) => {
      sheet["I" + (index + 2)] = label;
    });
    return sheet;
  }

  const analysisSheet = {
    A1: L("目标利润模型", "Target profit model", "目標利益モデル", "目標利潤模型"),
    A2: L("单价", "Unit price", "単価", "單價"),
    B2: 120,
    A3: L("单位成本", "Unit cost", "単位原価", "單位成本"),
    B3: 68,
    A4: L("固定成本", "Fixed cost", "固定費", "固定成本"),
    B4: 50000,
    A5: L("销量", "Units sold", "販売数量", "銷量"),
    B5: 1400,
    A7: L("利润", "Profit", "利益", "利潤"),
    B7: "=(B2-B3)*B5-B4",
    A9: L("目标利润", "Target profit", "目標利益", "目標利潤"),
    B9: 50000,
  };

  const dataTableOneSheet = {
    A1: L("单价", "Price", "単価", "單價"),
    B1: 120,
    A2: L("销量", "Units", "数量", "數量"),
    B2: 900,
    A3: L("收入公式", "Revenue formula", "収入式", "收入公式"),
    B3: "=B1*B2",
    D1: L("价格情景", "Price scenario", "価格シナリオ", "價格情境"),
    E1: L("收入结果", "Revenue result", "収入結果", "收入結果"),
    D2: 90,
    D3: 100,
    D4: 110,
    D5: 120,
    D6: 130,
  };

  const dataTableTwoSheet = {
    A1: L("单价", "Price", "単価", "單價"),
    B1: 120,
    A2: L("销量", "Units", "数量", "數量"),
    B2: 900,
    A3: L("收入公式", "Revenue formula", "収入式", "收入公式"),
    B3: "=B1*B2",
    D1: L("价格 \\ 数量", "Price \\ Units", "価格 \\ 数量", "價格 \\ 數量"),
    E1: 700,
    F1: 800,
    G1: 900,
    H1: 1000,
    D2: 90,
    D3: 100,
    D4: 110,
    D5: 120,
    D6: 130,
  };

  const scenarioSheet = {
    A1: L("情景假设", "Scenario assumptions", "シナリオ前提", "情境假設"),
    A2: L("单价", "Unit price", "単価", "單價"),
    B2: 120,
    A3: L("单位成本", "Unit cost", "単位原価", "單位成本"),
    B3: 68,
    A4: L("固定成本", "Fixed cost", "固定費", "固定成本"),
    B4: 50000,
    A5: L("销量", "Units", "数量", "數量"),
    B5: 1400,
    A7: L("年度利润", "Annual profit", "年間利益", "年度利潤"),
    B7: "=(B2-B3)*B5-B4",
    A9: L("方案", "Scenario", "シナリオ", "方案"),
    B9: L("当前", "Current", "現行", "目前"),
    C9: L("悲观", "Downside", "下振れ", "悲觀"),
    D9: L("乐观", "Upside", "上振れ", "樂觀"),
    B10: 22800,
    C10: -22400,
    D10: 62000,
  };

  const solverSheet = {
    A1: L("生产计划", "Production plan", "生産計画", "生產計畫"),
    A2: L("书桌", "Desk", "デスク", "書桌"),
    B2: 800,
    A3: L("椅子", "Chair", "チェア", "椅子"),
    B3: 600,
    A4: L("柜子", "Cabinet", "キャビネット", "櫃子"),
    B4: 300,
    A6: L("总工时", "Total hours", "総工数", "總工時"),
    B6: "=B2*2+B3*1.2+B4*2.5",
    A7: L("总利润", "Total profit", "総利益", "總利潤"),
    B7: "=B2*40+B3*25+B4*70",
    A9: L("工时上限", "Hour cap", "工数上限", "工時上限"),
    B9: 3000,
  };

  const forecastSheet = K.makeSheet([
    L("日期", "Date", "日付", "日期"),
    L("订单数", "Orders", "注文数", "訂單數"),
  ], [
    ["2026-01-01", 310],
    ["2026-02-01", 328],
    ["2026-03-01", 342],
    ["2026-04-01", 365],
    ["2026-05-01", 379],
    ["2026-06-01", 401],
    ["2026-07-01", 418],
    ["2026-08-01", 430],
    ["2026-09-01", 455],
    ["2026-10-01", 472],
    ["2026-11-01", 489],
    ["2026-12-01", 508],
  ], {
    D1: L("预测起点", "Forecast start", "予測開始位置", "預測起點"),
  });

  const arrayHeaders = [
    L("员工", "Employee", "従業員", "員工"),
    L("团队", "Team", "チーム", "團隊"),
    L("收入", "Revenue", "収入", "收入"),
  ];

  const arrayRows = [
    [L("林晓", "Olivia Bennett", "佐藤美咲", "林雅婷"), L("设计", "Design", "デザイン", "設計"), 12800],
    [L("陈凯", "Ethan Cole", "鈴木健太", "陳冠宇"), L("行政", "Admin", "総務", "行政"), 8600],
    [L("周宁", "Maya Reed", "高橋結衣", "周怡君"), L("客服", "Support", "サポート", "客服"), 9300],
    [L("赵敏", "Noah Brooks", "田中翔", "趙柏翰"), L("设计", "Design", "デザイン", "設計"), 14600],
    [L("王磊", "Ava Turner", "伊藤葵", "王品妍"), L("培训", "Training", "研修", "培訓"), 7200],
    [L("孙悦", "Leo Martin", "渡辺大輔", "孫立群"), L("客服", "Support", "サポート", "客服"), 11800],
    [L("李然", "Grace Kim", "山本彩", "李佳蓉"), L("行政", "Admin", "総務", "行政"), 6800],
    [L("郑文", "Daniel Hayes", "中村悠真", "鄭宇翔"), L("培训", "Training", "研修", "培訓"), 13200],
  ];

  const arraySheet = K.makeSheet(arrayHeaders, arrayRows, {
    E1: L("收入超过 10000 的记录", "Records above 10000", "10000超の記録", "收入超過 10000 的紀錄"),
    F1: L("唯一团队", "Unique teams", "一意のチーム", "唯一團隊"),
    H1: L("排序后的团队", "Sorted teams", "並べ替えたチーム", "排序後的團隊"),
  });

  const logicHeaders = [
    L("员工", "Employee", "従業員", "員工"),
    L("区域", "Region", "地域", "區域"),
    L("季度", "Quarter", "四半期", "季度"),
    L("得分", "Score", "得点", "得分"),
  ];

  const logicSheet = dataSheet(logicHeaders, [
    [L("林晓", "Olivia Bennett", "佐藤美咲", "林雅婷"), "West", 1, 92],
    [L("陈凯", "Ethan Cole", "鈴木健太", "陳冠宇"), "East", 2, 84],
    [L("周宁", "Maya Reed", "高橋結衣", "周怡君"), "West", 3, 77],
    [L("赵敏", "Noah Brooks", "田中翔", "趙柏翰"), "South", 4, 58],
  ], [
    L("不是 East 区域", "Not East", "East 以外", "不是 East 區域"),
    L("得分等级", "Score band", "得点帯", "得分等級"),
    L("季度标签", "Quarter label", "四半期ラベル", "季度標籤"),
  ]);

  const textHeaders = [
    L("编码", "Code", "コード", "編碼"),
    L("数字文本", "Numeric text", "数値テキスト", "數字文字"),
    L("短语", "Phrase", "フレーズ", "短語"),
    L("词一", "Word 1", "語1", "詞一"),
    L("词二", "Word 2", "語2", "詞二"),
  ];

  const textSheet = dataSheet(textHeaders, [
    ["CN-EAST-041", "00125", "garden city", "north", "alpha"],
    ["US-WEST-118", "00087", "harbor view", "south", "beta"],
  ], [
    L("替换连字符", "Replace dashes", "ハイフン置換", "取代連字號"),
    L("替换前缀", "Replace prefix", "接頭辞置換", "取代前置碼"),
    L("文本转数值", "Text to number", "文字から数値へ", "文字轉數值"),
    L("首字母大写", "Proper case", "先頭を大文字に", "首字母大寫"),
    L("连接单词", "Join words", "単語を連結", "連接詞語"),
    L("文本连接", "Text join", "テキスト連結", "文字連接"),
    L("重复符号", "Repeat marker", "記号の繰り返し", "重複符號"),
  ]);

  const statsHeaders = [
    L("员工", "Employee", "従業員", "員工"),
    L("部门", "Department", "部署", "部門"),
    L("考试分", "Exam", "試験点", "考試分"),
    L("项目分", "Project", "課題点", "專案分"),
    L("计费小时", "Billable hours", "請求可能時間", "計費時數"),
    L("入职日期", "Start date", "入社日", "到職日期"),
    L("部门代码", "Dept code", "部署コード", "部門代碼"),
  ];

  const statsLabels = [
    L("空白单元格", "Blank cells", "空白セル", "空白儲存格"),
    L("考试中位数", "Median exam", "試験点の中央値", "考試中位數"),
    L("第二高分", "Second highest", "2番目に高い点", "第二高分"),
    L("第二低分", "Second lowest", "2番目に低い点", "第二低分"),
    L("林肯排名", "Olivia rank", "Olivia の順位", "林曉排名"),
    L("向上到 5", "Round up to 5", "5単位で切り上げ", "向上取至 5"),
    L("向下到 5", "Round down to 5", "5単位で切り捨て", "向下取至 5"),
    L("部门名称", "Department name", "部署名", "部門名稱"),
    L("偏移后的分数", "Offset score", "オフセット得点", "位移後分數"),
    L("间接引用", "Indirect reference", "間接参照", "間接參照"),
    L("公式所在行", "Formula row", "数式の行", "公式所在列"),
    L("公式所在列", "Formula column", "数式の列", "公式所在欄"),
    L("区域行数", "Range rows", "範囲の行数", "範圍列數"),
    L("区域列数", "Range columns", "範囲の列数", "範圍欄數"),
  ];

  const statsSheet = dataSheet(statsHeaders, [
    [L("林晓", "Olivia Bennett", "佐藤美咲", "林雅婷"), L("运营", "Operations", "運営", "營運"), 88, 92, 37, "2026-01-05", 1],
    [L("陈凯", "Ethan Cole", "鈴木健太", "陳冠宇"), L("技术", "Technology", "技術", "技術"), 95, null, 42, "2026-01-12", 2],
    [L("周宁", "Maya Reed", "高橋結衣", "周怡君"), L("运营", "Operations", "運営", "營運"), 78, 78, 35, "2026-01-19", 1],
    [L("赵敏", "Noah Brooks", "田中翔", "趙柏翰"), L("支持", "Support", "サポート", "支援"), 85, 85, 40, "2026-02-02", 3],
    [L("王磊", "Ava Turner", "伊藤葵", "王品妍"), L("财务", "Finance", "経理", "財務"), 91, null, 33, "2026-02-09", 4],
    [L("孙悦", "Leo Martin", "渡辺大輔", "孫立群"), L("技术", "Technology", "技術", "技術"), 90, 90, 38, "2026-02-16", 2],
    [L("李然", "Grace Kim", "山本彩", "李佳蓉"), L("运营", "Operations", "運営", "營運"), 72, null, null, "2026-03-02", 1],
    [L("郑文", "Daniel Hayes", "中村悠真", "鄭宇翔"), L("支持", "Support", "サポート", "支援"), 67, 67, 29, "2026-03-09", 3],
  ], statsLabels);

  const dateHeaders = [
    L("事项", "Item", "項目", "事項"),
    L("开始日期", "Start date", "開始日", "開始日期"),
    L("结束日期", "End date", "終了日", "結束日期"),
  ];

  const dateSheet = dataSheet(dateHeaders, [
    [L("春季复核", "Spring review", "春の確認", "春季複核"), "2026-01-05", "2026-04-15"],
    [L("文件归档", "Document archive", "文書保管", "文件歸檔"), "2026-02-02", "2026-05-29"],
  ], [
    L("星期编号", "Weekday", "曜日番号", "星期編號"),
    L("周编号", "Week number", "週番号", "週編號"),
    L("三个月后", "Three months later", "3か月後", "三個月後"),
    L("当月月末", "Month end", "月末", "當月月底"),
    L("十个工作日后", "Ten workdays later", "10営業日後", "十個工作天後"),
    L("工作日数", "Workdays", "営業日数", "工作天數"),
    L("整月数", "Full months", "満月数", "整月數"),
  ]);

  const financeSheet = K.makeSheet([
    L("年份", "Year", "年", "年份"),
    L("现金流", "Cash flow", "キャッシュフロー", "現金流"),
  ], [
    [0, -200000],
    [1, 45000],
    [2, 52000],
    [3, 58000],
    [4, 62000],
    [5, 70000],
  ], {
    H1: L("新建透视表", "New PivotTable", "新しいピボットテーブル", "新增樞紐分析表"),
    I1: L("检查点", "Checkpoint", "チェック項目", "檢查點"),
    J1: L("结果", "Result", "結果", "結果"),
    I2: L("净现值", "Net present value", "正味現在価値", "淨現值"),
    I3: L("内部收益率", "Internal rate of return", "内部収益率", "內部報酬率"),
  });

  const databaseSheet = K.makeSheet([
    L("部门", "Department", "部署", "部門"),
    L("团队", "Team", "チーム", "團隊"),
    L("金额", "Amount", "金額", "金額"),
    L("状态", "Status", "状態", "狀態"),
  ], [
    [L("销售", "Sales", "営業", "銷售"), L("东区", "East", "東", "東區"), 12000, L("已结案", "Closed", "完了", "已結案")],
    [L("销售", "Sales", "営業", "銷售"), L("西区", "West", "西", "西區"), 9000, L("处理中", "Open", "処理中", "處理中")],
    [L("运营", "Operations", "運営", "營運"), L("东区", "East", "東", "東區"), 15000, L("已结案", "Closed", "完了", "已結案")],
    [L("运营", "Operations", "運営", "營運"), L("西区", "West", "西", "西區"), 11000, L("已结案", "Closed", "完了", "已結案")],
    [L("销售", "Sales", "営業", "銷售"), L("东区", "East", "東", "東區"), 7000, L("处理中", "Open", "処理中", "處理中")],
    [L("财务", "Finance", "経理", "財務"), L("中央", "Central", "中央", "中央"), 18000, L("已结案", "Closed", "完了", "已結案")],
  ], {
    H1: L("部门", "Department", "部署", "部門"),
    H2: L("销售", "Sales", "営業", "銷售"),
    J1: L("团队", "Team", "チーム", "團隊"),
    K1: L("状态", "Status", "状態", "狀態"),
    J2: L("东区", "East", "東", "東區"),
    K2: L("处理中", "Open", "処理中", "處理中"),
    L2: L("销售金额", "Sales amount", "営業金額", "銷售金額"),
    L3: L("销售记录数", "Sales records", "営業件数", "銷售紀錄數"),
    L4: L("唯一记录金额", "Unique record amount", "一意の記録金額", "唯一紀錄金額"),
    L5: L("检查点", "Checkpoint", "チェック項目", "檢查點"),
    M5: L("结果", "Result", "結果", "結果"),
    M2: "",
    M3: "",
    M4: "",
  });

  const dynamicHeaders = [
    L("编号", "ID", "ID", "編號"),
    L("部门", "Department", "部署", "部門"),
    L("得分", "Score", "得点", "得分"),
    L("城市", "City", "都市", "城市"),
  ];

  const dynamicRows = [
    ["E-1001", L("运营", "Operations", "運営", "營運"), 88, L("苏州", "Suzhou", "蘇州", "蘇州")],
    ["E-1002", L("技术", "Technology", "技術", "技術"), 95, L("杭州", "Hangzhou", "杭州", "杭州")],
    ["E-1003", L("运营", "Operations", "運営", "營運"), 78, L("南京", "Nanjing", "南京", "南京")],
    ["E-1004", L("支持", "Support", "サポート", "支援"), 85, L("苏州", "Suzhou", "蘇州", "蘇州")],
    ["E-1005", L("财务", "Finance", "経理", "財務"), 91, L("上海", "Shanghai", "上海", "上海")],
    ["E-1006", L("技术", "Technology", "技術", "技術"), 90, L("杭州", "Hangzhou", "杭州", "杭州")],
    ["E-1007", L("运营", "Operations", "運営", "營運"), 72, L("南京", "Nanjing", "南京", "南京")],
    ["E-1008", L("支持", "Support", "サポート", "支援"), 67, L("上海", "Shanghai", "上海", "上海")],
  ];

  const dynamicSheet = dataSheet(dynamicHeaders, dynamicRows, [
    L("E-1004 得分", "E-1004 score", "E-1004 得点", "E-1004 得分"),
    L("唯一部门数", "Unique departments", "一意の部署数", "唯一部門數"),
    L("最低得分", "Lowest score", "最低得点", "最低得分"),
    L("高于 85 的行数", "Rows above 85", "85超の行数", "高於 85 的列數"),
  ]);

  const builderSheet = K.makeSheet([
    L("阶段", "Stage", "段階", "階段"),
    L("占位", "Placeholder", "プレースホルダー", "預留"),
    L("团队", "Team", "チーム", "團隊"),
    L("区域", "Region", "地域", "區域"),
  ], [
    [L("复核", "Review", "確認", "複核"), "", "Design", "North"],
  ]);

  const capstoneHeaders = [
    L("部门", "Department", "部署", "部門"),
    L("团队", "Team", "チーム", "團隊"),
    L("收入", "Revenue", "収入", "收入"),
    L("成本", "Cost", "原価", "成本"),
    L("状态", "Status", "状態", "狀態"),
    L("人数", "Headcount", "人数", "人數"),
  ];

  const capstoneSheet = K.makeSheet(capstoneHeaders, [
    [L("运营", "Operations", "運営", "營運"), L("北区", "North", "北", "北區"), 42000, 28000, L("已结案", "Closed", "完了", "已結案"), 12],
    [L("运营", "Operations", "運営", "營運"), L("南区", "South", "南", "南區"), 38000, 26500, L("待处理", "Pending", "処理待ち", "待處理"), 10],
    [L("市场", "Marketing", "マーケティング", "行銷"), L("北区", "North", "北", "北區"), 31000, 21000, L("已结案", "Closed", "完了", "已結案"), 8],
    [L("市场", "Marketing", "マーケティング", "行銷"), L("西区", "West", "西", "西區"), 29000, 20500, L("待处理", "Pending", "処理待ち", "待處理"), 7],
    [L("产品", "Product", "製品", "產品"), L("中央", "Central", "中央", "中央"), 52000, 34000, L("已结案", "Closed", "完了", "已結案"), 14],
    [L("产品", "Product", "製品", "產品"), L("东区", "East", "東", "東區"), 47000, 31500, L("待处理", "Pending", "処理待ち", "待處理"), 11],
    [L("支持", "Support", "サポート", "支援"), L("北区", "North", "北", "北區"), 26000, 19000, L("已结案", "Closed", "完了", "已結案"), 18],
    [L("支持", "Support", "サポート", "支援"), L("西区", "West", "西", "西區"), 24000, 18500, L("待处理", "Pending", "処理待ち", "待處理"), 16],
  ], {
    I1: L("检查点", "Checkpoint", "チェック項目", "檢查點"),
    J1: L("结果", "Result", "結果", "結果"),
    I2: L("运营收入", "Operations revenue", "運営収入", "營運收入"),
    I3: L("待处理数", "Pending count", "処理待ち件数", "待處理數"),
    I4: L("成本占收入比", "Cost-to-revenue ratio", "原価収入比", "成本佔收入比"),
  });

  const capstoneFormulaTasks = [
    K.task({
      id: "af20-capstone-sumifs",
      sheet: capstoneSheet,
      target: "J2",
      taskLabel: L("部门汇总", "Department total", "部署集計", "部門彙總"),
      title: L("汇总运营部门收入", "Total Operations revenue", "運営の収入を集計", "彙總營運部門收入"),
      lead: L("在 J2 用 SUMIFS 汇总 A 列为“运营”的 C 列收入。", "In J2, use SUMIFS to total column C where column A is Operations.", "J2 で SUMIFS を使い、A列が「運営」の行のC列を合計します。", "在 J2 用 SUMIFS 彙總 A 欄為「營運」的 C 欄收入。"),
      hint: L("参考：=SUMIFS(C2:C9,A2:A9,\"运营\")", "Reference: =SUMIFS(C2:C9,A2:A9,\"Operations\")", "参考：=SUMIFS(C2:C9,A2:A9,\"運営\")", "參考：=SUMIFS(C2:C9,A2:A9,\"營運\")"),
      success: L("运营收入合计为 80000，部门口径一致。", "Operations revenue totals 80000 on the same department definition.", "運営収入の合計は80000で、部署の基準も一致しています。", "營運收入合計為 80000，部門定義一致。"),
      formula: "=SUMIFS(C2:C9,A2:A9,\"运营\")",
      requiredFunctions: ["SUMIFS"],
      mode: "fixed",
      expected: 80000,
    }),
    K.task({
      id: "af20-capstone-countifs",
      sheet: capstoneSheet,
      target: "J3",
      taskLabel: L("待办统计", "Open count", "未処理件数", "待辦統計"),
      title: L("统计待处理记录数", "Count pending records", "処理待ち件数を数える", "統計待處理紀錄數"),
      lead: L("在 J3 用 COUNTIFS 统计 E 列为“待处理”的记录。", "In J3, use COUNTIFS to count records where column E is Pending.", "J3 で COUNTIFS を使い、E列が「処理待ち」の件数を数えます。", "在 J3 用 COUNTIFS 統計 E 欄為「待處理」的紀錄。"),
      hint: L("参考：=COUNTIFS(E2:E9,\"待处理\")", "Reference: =COUNTIFS(E2:E9,\"Pending\")", "参考：=COUNTIFS(E2:E9,\"処理待ち\")", "參考：=COUNTIFS(E2:E9,\"待處理\")"),
      success: L("待处理记录为 4 条，与状态列一致。", "There are four pending records, matching the status column.", "処理待ちは4件で、状態列と一致しています。", "待處理紀錄為 4 筆，與狀態欄一致。"),
      formula: "=COUNTIFS(E2:E9,\"待处理\")",
      requiredFunctions: ["COUNTIFS"],
      mode: "fixed",
      expected: 4,
    }),
    K.task({
      id: "af20-capstone-ratio",
      sheet: capstoneSheet,
      target: "J4",
      taskLabel: L("整体比率", "Overall ratio", "全体比率", "整體比例"),
      title: L("计算整体成本收入比", "Calculate overall cost-to-revenue ratio", "全体の原価収入比を計算", "計算整體成本收入比"),
      lead: L("在 J4 用 ROUND 保留两位小数，计算总成本除以总收入。", "In J4, use ROUND to two decimals for total cost divided by total revenue.", "J4 で ROUND を使い、総原価を総収入で割って小数2桁にします。", "在 J4 用 ROUND 保留兩位小數，計算總成本除以總收入。"),
      hint: L("参考：=ROUND(SUM(D2:D9)/SUM(C2:C9),2)", "Reference: =ROUND(SUM(D2:D9)/SUM(C2:C9),2)", "参考：=ROUND(SUM(D2:D9)/SUM(C2:C9),2)", "參考：=ROUND(SUM(D2:D9)/SUM(C2:C9),2)"),
      success: L("整体成本收入比为 0.69，可用于管理会议。", "The overall ratio is 0.69 and ready for the management meeting.", "全体の原価収入比は0.69で、管理会議に使えます。", "整體成本收入比為 0.69，可用於管理會議。"),
      formula: "=ROUND(SUM(D2:D9)/SUM(C2:C9),2)",
      requiredFunctions: ["ROUND", "SUM"],
      mode: "fixed",
      expected: 0.69,
    }),
  ];

  D.registerChapter({
    id: "ch19-what-if",
    icon: "19",
    title: L("第 19 章 · 模拟分析与动态数组", "Chapter 19 · What-If Analysis and Dynamic Arrays", "第19章 · シナリオ分析と動的配列", "第 19 章 · 模擬分析與動態陣列"),
    subtitle: L("从结果倒推输入，比较多组假设，并把会溢出的数组公式用于筛选和排序。", "Work backward from a result, compare multiple assumptions, and use spilling array formulas for filtering and sorting.", "結果から入力を逆算し、複数の前提を比較し、スピルする配列数式で絞り込みや並べ替えを行います。", "從結果倒推輸入，比較多組假設，並把會溢出的陣列公式用於篩選和排序。"),
    levels: [
      level(
        "analysis-whatif-core",
        "lesson",
        L("目标搜索与单双变量数据表", "Goal Seek and one/two-variable data tables", "ゴールシークと1変数・2変数データテーブル", "目標搜尋與單雙變數資料表"),
        [
          learn(
            "af19-whatif-teach",
            L("先确定哪个输入能动，哪个结果要追", "Decide which input can move and which result must be hit", "動かせる入力と到達したい結果を決める", "先確定哪個輸入能動，哪個結果要追"),
            L("目标搜索只调整一个输入，让一个公式结果等于目标值。数据表保留多组输入，并一次性计算每个情景的结果。单变量表测一个输入，双变量表同时测两个输入。", "Goal Seek changes one input until one formula result reaches a target. Data Tables keep several inputs and calculate every scenario at once: one-variable tests one input, two-variable tests two together.", "ゴールシークは1つの入力だけを動かして数式結果を目標値にします。データテーブルは複数の入力を保持し、各シナリオを一度に計算します。1変数は1つ、2変数は2つの入力を同時に試します。", "目標搜尋只調整一個輸入，讓一個公式結果等於目標值。資料表保留多組輸入，並一次計算每個情境的結果。單變數表測一個輸入，雙變數表同時測兩個輸入。"),
            [
              L("目标搜索的变量单元格必须直接或间接影响目标单元格，否则无法收敛。", "The variable cell must directly or indirectly affect the target cell, or Goal Seek cannot converge.", "ゴールシークの変数セルは目標セルに直接または間接に影響する必要があります。", "目標搜尋的變數儲存格必須直接或間接影響目標儲存格，否則無法收斂。"),
              L("目标单元格应该含公式，不要直接输入目标数字后让工具去改常量。", "The target cell should contain a formula, not a constant that the tool is asked to move.", "目標セルには数式を入れ、ツールで定数を動かそうとしないでください。", "目標儲存格應該含公式，不要直接輸入目標數字後讓工具去改常數。"),
              L("数据表的输入值和结果区域要分开，结果区由数据表命令填充。", "Keep input values and output area separate; the Data Table command fills the output cells.", "データテーブルでは入力値と結果領域を分け、結果領域はコマンドが埋めます。", "資料表的輸入值和結果區域要分開，結果區由資料表命令填入。"),
              L("双变量数据表的行输入和列输入不能指向同一个单元格。", "A two-variable Data Table cannot use the same cell for both row and column input.", "2変数データテーブルでは行入力と列入力に同じセルを使えません。", "雙變數資料表的列輸入和欄輸入不能指向同一個儲存格。"),
            ],
            L("先用目标搜索回答“需要多少”，再用数据表回答“如果变化会怎样”。", "Use Goal Seek for how much is needed, then Data Tables for what happens across a range.", "まずゴールシークで必要量を求め、その後にデータテーブルで変化の幅を見ます。", "先用目標搜尋回答「需要多少」，再用資料表回答「如果變化會怎樣」。"),
            L("数据表结果区不能单独修改，否则下次计算会覆盖；若要保留快照，复制为数值。", "Do not edit Data Table output cells; the next calculation overwrites them. Copy as values if a snapshot is needed.", "データテーブルの結果セルは直接編集せず、次回計算で上書きされるため、必要なら値としてコピーします。", "資料表結果區不能單獨修改，否則下次計算會覆蓋；若要保留快照，複製為值。")
          ),
          lab(
            "af19-goalseek-lab",
            L("引导实验：倒推达到五万元利润的销量", "Guided lab: solve the units needed for 50000 profit", "ガイド付き実験：利益50000に必要な販売数量を逆算", "引導實驗：倒推達到五萬元利潤的銷量"),
            L("请用目标搜索，把利润 B7 调整到 50000，允许变化的输入是销量 B5。", "Use Goal Seek to set profit B7 to 50000 by changing units sold B5.", "ゴールシークで利益 B7 を50000にし、変更するセルを販売数量 B5 にします。", "請用目標搜尋，把利潤 B7 調整到 50000，允許變化的輸入是銷量 B5。"),
            {
              kind: "analysis",
              mode: "goalSeek",
              sheet: analysisSheet,
              ranges: { profit: "B7", units: "B5" },
              options: { targetCell: "B7", targetValue: 50000, variableCell: "B5" },
              goal: { operation: "goalSeek", targetCell: "B7", targetValue: 50000, variableCell: "B5" },
            },
            L("打开“数据”→“模拟分析”→“目标搜索”，设置目标单元格 B7、目标值 50000、可变单元格 B5。", "Use Data, What-If Analysis, Goal Seek, with target B7, value 50000, and variable B5.", "「データ」→「What-If 分析」→「ゴールシーク」で、目標セル B7、目標値 50000、変化させるセル B5 を指定します。", "開啟「資料」→「模擬分析」→「目標搜尋」，設定目標儲存格 B7、目標值 50000、變數儲存格 B5。"),
            L("销量已迭代到约 1962，利润公式回到目标值附近，求解关系正确。", "Units iterate to about 1962 and the profit formula returns to the target, confirming the model.", "販売数量が約1962になり、利益式が目標値付近へ戻って関係が正しいと確認できます。", "銷量已迭代到約 1962，利潤公式回到目標值附近，求解關係正確。")
          ),
          lab(
            "af19-datatable-one-lab",
            L("引导实验：试算五个单价情景", "Guided lab: test five price scenarios", "ガイド付き実験：5つの単価シナリオを試算", "引導實驗：試算五個單價情境"),
            L("请设置单变量数据表：公式单元格 B3，公式 =B1*B2，行输入 B1，结果单元格 E2，列输入留空。", "Set a one-variable Data Table with formula cell B3, formula =B1*B2, row input B1, result cell E2, and a blank column input.", "1変数データテーブルを設定します。数式セル B3、数式 =B1*B2、行入力 B1、結果セル E2、列入力は空欄です。", "請設定單變數資料表：公式儲存格 B3，公式 =B1*B2，列輸入 B1，結果儲存格 E2，欄輸入留空。"),
            {
              kind: "analysis",
              mode: "dataTable",
              sheet: dataTableOneSheet,
              ranges: { inputs: "D2:D6", results: "E2:E6", formula: "B3" },
              options: { formulaCell: "B3", rowInput: "B1", columnInput: null },
              goal: {
                operation: "dataTable",
                formulaCell: "B3",
                rowInput: "B1",
                columnInput: null,
                dataTableRange: "D2:E6",
                variables: 1,
              },
            },
            L("逐项填写公式单元格、公式、行输入和结果单元格；列输入保持空白。", "Fill in the formula cell, formula, row input, and result cell; leave the column input blank.", "数式セル・数式・行入力・結果セルを入力し、列入力は空欄にします。", "逐項填寫公式儲存格、公式、列輸入和結果儲存格；欄輸入保持空白。"),
            L("五个价格情景的收入已一次计算完成，输入区和结果区保持分离。", "Revenue for all five price scenarios is calculated at once, with inputs and results separated.", "5つの価格シナリオの収入が一度に計算され、入力と結果も分かれています。", "五個價格情境的收入已一次計算完成，輸入區和結果區保持分離。")
          ),
          lab(
            "af19-datatable-two-lab",
            L("迁移实验：价格和销量同时变化", "Transfer lab: vary price and units together", "転用実験：価格と数量を同時に変化", "遷移實驗：價格和銷量同時變化"),
            L("请设置双变量数据表：公式单元格 B3，公式 =B1*B2，行输入 B1，列输入 B2，结果单元格 E2。", "Set a two-variable Data Table with formula cell B3, formula =B1*B2, row input B1, column input B2, and result cell E2.", "2変数データテーブルを設定します。数式セル B3、数式 =B1*B2、行入力 B1、列入力 B2、結果セル E2です。", "請設定雙變數資料表：公式儲存格 B3，公式 =B1*B2，列輸入 B1，欄輸入 B2，結果儲存格 E2。"),
            {
              kind: "analysis",
              mode: "dataTable",
              sheet: dataTableTwoSheet,
              ranges: { grid: "D1:H6", results: "E2:H6", formula: "B3" },
              options: { formulaCell: "B3", rowInput: "B1", columnInput: "B2" },
              goal: {
                operation: "dataTable",
                formulaCell: "B3",
                rowInput: "B1",
                columnInput: "B2",
                dataTableRange: "D1:H6",
                variables: 2,
              },
            },
            L("逐项填写五个字段，两个输入单元格必须不同。", "Fill all five fields and keep the two input cells different.", "5つの項目を入力し、2つの入力セルは別にします。", "逐項填寫五個欄位，兩個輸入儲存格必須不同。"),
            L("价格与销量的组合收入矩阵已生成，适合比较多种经营情景。", "The revenue matrix across price and unit combinations is ready for scenario comparison.", "価格と数量の組み合わせ別収入マトリクスが完成し、経営シナリオ比較に使えます。", "價格與銷量的組合收入矩陣已產生，適合比較多種經營情境。")
          ),
        ]
      ),
      level(
        "analysis-scenario-solver",
        "lesson",
        L("情景管理、规划求解与预测", "Scenario Manager, Solver, and forecasting", "シナリオマネージャー・ソルバー・予測", "情境管理、規劃求解與預測"),
        [
          learn(
            "af19-scenario-teach",
            L("保存假设，求解约束，再画预测", "Store assumptions, solve constraints, then forecast", "前提を保存し、制約を解き、予測する", "保存假設，求解限制，再畫預測"),
            L("情景管理器保存多组输入值，并可在会议中切换；规划求解在多个约束下寻找最优输入；预测工作表根据历史序列生成未来值，并给出置信区间。", "Scenario Manager stores input sets for switching in meetings; Solver searches for optimal inputs under constraints; Forecast Sheet projects future values from a historical series with a confidence interval.", "シナリオマネージャーは入力セットを保存して会議中に切り替えます。ソルバーは複数制約の下で最適入力を探し、予測シートは履歴系列から将来値を信頼区間付きで生成します。", "情境管理員保存多組輸入值，並可在會議中切換；規劃求解在多個限制下尋找最佳輸入；預測工作表依歷史數列產生未來值，並提供信賴區間。"),
            [
              L("情景只保存能变化的输入，不要把公式结果也作为可修改单元格。", "Scenarios store only changing inputs, not formula results as editable cells.", "シナリオには変化する入力だけを保存し、数式結果は変更セルにしません。", "情境只保存能變化的輸入，不要把手動修改的公式結果也作為變數。"),
              L("切换情景前先确认当前数据是否保存，避免覆盖尚未记录的手工调整。", "Before switching scenarios, confirm the current data is saved so unsaved manual changes are not lost.", "シナリオ切替前に現在のデータが保存済みか確認し、未記録の手調整を失わないようにします。", "切換情境前先確認目前資料是否已保存，避免覆蓋尚未記錄的手動調整。"),
              L("规划求解需要目标单元格、可变单元格和约束；没有约束的最优解常常不现实。", "Solver needs a target, variable cells, and constraints; an unconstrained optimum is often unrealistic.", "ソルバーには目的セル・変動セル・制約条件が必要です。制約のない最適解は現実的でないことが多いです。", "規劃求解需要目標儲存格、變數儲存格和限制；沒有最佳化限制的解通常不現實。"),
              L("预测建立在历史模式上，季节性和异常值会改变结果，必须检查预测区间。", "Forecasts assume historical patterns; seasonality and outliers change results, so inspect the forecast interval.", "予測は履歴パターンを前提とし、季節性や外れ値で結果が変わります。予測区間を確認します。", "預測建立在歷史模式上，季節性和異常值會改變結果，必須檢查預測區間。"),
            ],
            L("情景回答“如果这样会怎样”，求解回答“在约束下最好是多少”，预测回答“未来可能到哪”。", "Scenarios ask what if, Solver asks what is best under constraints, and Forecast asks where the future may go.", "シナリオは「こうなるとどうなる」、ソルバーは「制約下で最善は何か」、予測は「将来どこへ向かうか」を扱います。", "情境回答「如果這樣會怎樣」，求解回答「在限制下最好是多少」，預測回答「未來可能到哪」。"),
            L("所有模拟模型都要在交付时写清来源期、百分比口径和约束单位。", "Every model handoff must state the source period, percentage basis, and constraint units.", "モデルを引き継ぐときは、対象期間・比率の基準・制約の単位を明記します。", "所有模擬模型都要在交付時寫清來源期、百分比基準和限制單位。")
          ),
          lab(
            "af19-scenario-lab",
            L("引导实验：保存三组悲观情景", "Guided lab: save three downside scenarios", "ガイド付き実験：3つの下振れシナリオを保存", "引導實驗：保存三組悲觀情境"),
            L("请新增三组情景：Downside 修改 B2 为 95，CostPressure 修改 B3 为 72，LowVolume 修改 B5 为 1200。", "Add three scenarios: Downside changes B2 to 95, CostPressure changes B3 to 72, and LowVolume changes B5 to 1200.", "3つのシナリオを追加します。Downside は B2 を95、CostPressure は B3 を72、LowVolume は B5 を1200にします。", "請新增三組情境：Downside 修改 B2 為 95，CostPressure 修改 B3 為 72，LowVolume 修改 B5 為 1200。"),
            {
              kind: "analysis",
              mode: "scenario",
              sheet: scenarioSheet,
              ranges: { changingCells: "B2:B5", profit: "B7", existingScenarios: "B9:D10" },
              options: { scenarioNames: ["Downside", "CostPressure", "LowVolume"] },
              goal: {
                operation: "scenario",
                scenarios: [
                  { name: "Downside", changingCell: "B2", value: 95 },
                  { name: "CostPressure", changingCell: "B3", value: 72 },
                  { name: "LowVolume", changingCell: "B5", value: 1200 },
                ],
              },
            },
            L("逐组填写情景名称、变动单元格和值，再点击添加；顺序保持 Downside、CostPressure、LowVolume。", "Enter each scenario name, changing cell, and value, then add it; keep the order Downside, CostPressure, LowVolume.", "各シナリオ名・変更セル・値を入力して追加し、Downside、CostPressure、LowVolume の順にします。", "逐組填寫情境名稱、變動儲存格和值，再按新增；順序保持 Downside、CostPressure、LowVolume。"),
            L("三组悲观情景已保存，可与当前方案并列比较。", "All three downside scenarios are saved for comparison with the current case.", "3つの下振れシナリオが保存され、現行案と比較できます。", "三組悲觀情境已保存，可與目前方案並列比較。")
          ),
          lab(
            "af19-solver-lab",
            L("迁移实验：在工时上限内最大化利润", "Transfer lab: maximize profit within the hour cap", "転用実験：工数上限内で利益を最大化", "遷移實驗：在工時上限內最大化利潤"),
            L("请设置规划求解：目标 B7 最大化，可变单元格 B2:B4，约束为总工时 B6 不超过 B9，且三类产品数量都不小于 0。", "Set Solver to maximize B7 by changing B2:B4, subject to total hours B6 not exceeding B9 and all three product quantities at least zero.", "ソルバーで B7 を最大化し、変動セルを B2:B4 にします。総工数 B6 は B9 以下、3製品の数量は0以上という制約を付けます。", "請設定規劃求解：目標 B7 最大化，變數儲存格 B2:B4，限制為總工時 B6 不超過 B9，且三類產品數量都不小於 0。"),
            {
              kind: "analysis",
              mode: "solver",
              sheet: solverSheet,
              ranges: { decision: "B2:B4", hours: "B6", profit: "B7", cap: "B9" },
              options: { objective: "max", constraints: ["B6<=B9", "B2>=0", "B3>=0", "B4>=0"] },
              goal: {
                operation: "solver",
                setCell: "B7",
                to: "max",
                byChanging: "B2:B4",
                constraints: [
                  { cell: "B6", operator: "<=", valueCell: "B9" },
                  { cell: "B2", operator: ">=", value: 0 },
                  { cell: "B3", operator: ">=", value: 0 },
                  { cell: "B4", operator: ">=", value: 0 },
                ],
              },
            },
            L("在“规划求解”中设置目标 B7 最大，可变区域 B2:B4，逐条添加工时和数量约束，再选择求解方法。", "In Solver, set B7 to Max, variable range B2:B4, add the hour and non-negative constraints, then choose a solving method.", "ソルバーで目的セル B7 を最大、変動セル B2:B4 にし、工数と非負の制約を追加して解法を選びます。", "在「規劃求解」設定目標 B7 最大，變數區域 B2:B4，逐條加入工時和非負限制，再選擇求解方法。"),
            L("求解器已得到满足工时上限的最大利润组合，结果与约束一致。", "Solver found the maximum-profit mix within the hour cap, consistent with every constraint.", "ソルバーが工数上限内の最大利益構成を求め、すべての制約と一致しています。", "規劃求解已得到符合工時上限的最大利潤組合，結果與限制一致。")
          ),
          lab(
            "af19-forecast-lab",
            L("迁移实验：预测未来三个月订单", "Transfer lab: forecast orders for the next three months", "転用実験：今後3か月の注文を予測", "遷移實驗：預測未來三個月訂單"),
            L("请用 A1:B13 的历史订单创建预测工作表，预测 3 个周期，自动检查季节性，输出从 D2 开始。", "Create a Forecast Sheet from A1:B13 with three forecast periods, automatic seasonality detection, and output starting at D2.", "A1:B13 の履歴注文から予測シートを作成し、3期間を予測、季節性を自動検出し、D2 から出力します。", "請用 A1:B13 的歷史訂單建立預測工作表，預測 3 個週期，自動檢查季節性，輸出從 D2 開始。"),
            {
              kind: "analysis",
              mode: "forecast",
              sheet: forecastSheet,
              ranges: { history: "A1:B13", output: "D2" },
              options: { periods: 3, seasonality: "automatic", forecastStart: "D2" },
              goal: { operation: "forecast", sourceRange: "A1:B13", periods: 3, seasonality: "automatic", destination: "D2" },
            },
            L("打开“数据”→“预测工作表”，确认时间轴与数值列，预测期设为 3，输出位置 D2。", "Use Data, Forecast Sheet, confirm the timeline and values, set three forecast periods, and place output at D2.", "「データ」→「予測シート」で時間軸と数値列を確認し、予測期間を3、出力を D2 にします。", "開啟「資料」→「預測工作表」，確認時間軸與數值欄，預測期設為 3，輸出位置 D2。"),
            L("预测结果和区间已从 D2 开始输出，未来三个月订单方向可进入排产讨论。", "Forecast values and intervals begin at D2, giving the scheduling discussion a forward view of three months.", "予測値と区間が D2 から出力され、今後3か月の注文方向を生産計画で検討できます。", "預測結果和區間已從 D2 開始輸出，未來三個月訂單方向可進入排產討論。")
          ),
        ]
      ),
      level(
        "analysis-array-review",
        "review",
        L("复习：FILTER、UNIQUE 与数组溢出", "Review: FILTER, UNIQUE, and spilling arrays", "復習：FILTER・UNIQUE・スピル配列", "複習：FILTER、UNIQUE 與陣列溢出"),
        [
          learn(
            "af19-array-teach",
            L("一个公式可以返回一片区域", "One formula can return a whole range", "1つの数式が範囲を返す", "一個公式可以傳回一片區域"),
            L("动态数组公式会从目标单元格溢出到右侧和下方，青色边界表示结果区域。FILTER 按条件筛选行，UNIQUE 去重，SORT 排序；引用溢出区域时可使用 # 运算符。", "A dynamic array formula spills from its target into adjacent cells, with a blue border marking the result. FILTER selects rows by condition, UNIQUE removes duplicates, and SORT orders values; the # operator references an entire spill range.", "動的配列数式は対象セルから右・下へスピルし、青い枠が結果範囲を示します。FILTER は条件で行を抽出、UNIQUE は重複を除き、SORT は並べ替えます。スピル範囲は # 演算子で参照できます。", "動態陣列公式會從目標儲存格溢出到右側和下方，青色邊界表示結果區域。FILTER 依條件篩選列，UNIQUE 去重，SORT 排序；參照溢出區域時可使用 # 運算子。"),
            [
              L("目标单元格下方或右侧必须有空白，否则会出现 #SPILL!。", "Cells below or to the right of the target must be empty, or the formula returns #SPILL!.", "対象セルの下または右に空白が必要で、塞がっていると #SPILL! になります。", "目標儲存格下方或右側必須有空白，否則會出現 #SPILL!。"),
              L("数组公式不是先把结果复制到很多单元格；一个公式负责整片结果。", "An array formula is not copied into many cells; one formula owns the whole result block.", "配列数式は多数のセルへコピーするのではなく、1つの数式が結果全体を担当します。", "陣列公式不是先把結果複製到很多儲存格；一個公式負責整片結果。"),
              L("FILTER 的包含参数必须与数据行数一致，否则会返回错误。", "FILTER's include argument must match the data rows, or it returns an error.", "FILTER の包含引数はデータ行数と一致させる必要があります。", "FILTER 的包含參數必須與資料列數一致，否則會傳回錯誤。"),
              L("SORT 和 UNIQUE 可以嵌套；用 COUNTA 或 ROWS 统计动态结果时，必须引用正确的溢出区域。", "SORT and UNIQUE can nest; when counting dynamic results with COUNTA or ROWS, reference the correct spill range.", "SORT と UNIQUE は入れ子にでき、COUNTA や ROWS で動的結果を数えるときは正しいスピル範囲を参照します。", "SORT 和 UNIQUE 可以巢狀；用 COUNTA 或 ROWS 統計動態結果時，必須參照正確的溢出區域。"),
            ],
            L("数组公式先看结果区域是否为空，再看条件列与结果列是否同高。", "For array formulas, first confirm the output area is empty, then check that criteria and result ranges have equal height.", "配列数式では出力範囲が空か確認し、条件列と結果列の高さが同じかを見ます。", "陣列公式先看結果區域是否為空，再看條件欄與結果欄是否同高。"),
            L("需要把动态结果交给旧版 Excel 时，复制为值并说明这是快照，不保留自动更新。", "When dynamic results must go to older Excel, paste as values and label it a snapshot that will not update automatically.", "動的結果を旧版 Excel に渡す場合は値として貼り付け、自動更新されないスナップショットであると明記します。", "需要把動態結果交給舊版 Excel 時，複製為值並說明這是快照，不保留自動更新。")
          ),
          lab(
            "af19-filter-array-lab",
            L("复习实验：筛选收入超过一万元的项目", "Review lab: filter projects above 10000", "復習実験：10000超の案件を抽出", "複習實驗：篩選收入超過一萬元的專案"),
            L("请以 E2 为目标，写入 FILTER 公式筛选 A2:C9 中收入列大于 1000 的行。公式应为 =FILTER(A2:C9,C2:C9>1000)。", "At E2, enter a FILTER formula that returns rows from A2:C9 where the revenue column is above 1000: =FILTER(A2:C9,C2:C9>1000).", "E2 に FILTER を入力し、A2:C9 のうち収入列が1000を超える行を抽出します。式は =FILTER(A2:C9,C2:C9>1000) です。", "請以 E2 為目標，寫入 FILTER 公式篩選 A2:C9 中收入欄大於 1000 的列。公式應為 =FILTER(A2:C9,C2:C9>1000)。"),
            {
              kind: "analysis",
              mode: "array",
              sheet: arraySheet,
              ranges: { source: "A2:C9", condition: "C2:C9", output: "E2" },
              options: { formula: "=FILTER(A2:C9,C2:C9>1000)" },
              goal: { operation: "array", formulaCell: "E2", formula: "=FILTER(A2:C9,C2:C9>1000)" },
            },
            L("选中 E2，输入完整 FILTER 公式；结果下方和右侧必须为空，按 Enter 后会自动溢出。", "Select E2, enter the full FILTER formula with empty cells below and to the right, and press Enter to spill.", "E2 を選んで FILTER の式を入力し、下と右を空けて Enter を押すとスピルします。", "選取 E2，輸入完整 FILTER 公式；結果下方和右側必須為空，按 Enter 後會自動溢出。"),
            L("收入超过 10000 的记录已溢出到 E2 起，原数据仍完整保留。", "Revenue records above 10000 spill from E2 while the source data remains intact.", "10000超の収入記録が E2 からスピルし、元データはそのまま残っています。", "收入超過 10000 的紀錄已溢出到 E2 起，原始資料仍完整保留。")
          ),
          lab(
            "af19-unique-array-lab",
            L("复习实验：提取唯一团队列表", "Review lab: return the unique team list", "復習実験：一意のチーム一覧を返す", "複習實驗：提取唯一團隊清單"),
            L("请在 F2 写入 UNIQUE 公式，从 B2:B9 提取不重复的团队名称。", "Enter a UNIQUE formula at F2 to list distinct team names from B2:B9.", "F2 に UNIQUE の式を入力し、B2:B9 から重複しないチーム名を返します。", "請在 F2 寫入 UNIQUE 公式，從 B2:B9 提取不重複的團隊名稱。"),
            {
              kind: "analysis",
              mode: "array",
              sheet: arraySheet,
              ranges: { teams: "B2:B9", output: "F2" },
              options: { formula: "=UNIQUE(B2:B9)" },
              goal: { operation: "array", formulaCell: "F2", formula: "=UNIQUE(B2:B9)" },
            },
            L("在 F2 输入 =UNIQUE(B2:B9)，不要手工复制删除重复项。", "Enter =UNIQUE(B2:B9) at F2 instead of manually copying and deleting duplicates.", "F2 に =UNIQUE(B2:B9) を入力し、手作業で重複削除をしないでください。", "在 F2 輸入 =UNIQUE(B2:B9)，不要手動複製後刪除重複項。"),
            L("唯一团队列表已从 F2 溢出，源团队列没有变化。", "The unique team list spills from F2 and the source team column is unchanged.", "一意のチーム一覧が F2 からスピルし、元のチーム列は変わっていません。", "唯一團隊清單已從 F2 溢出，來源團隊欄沒有改變。")
          ),
          lab(
            "af19-sorted-array-lab",
            L("复习实验：嵌套 SORT 与 UNIQUE", "Review lab: nest SORT and UNIQUE", "復習実験：SORT と UNIQUE を入れ子にする", "複習實驗：巢狀 SORT 與 UNIQUE"),
            L("请在 H2 写入公式，把 B2:B9 的唯一团队按升序排列。要求使用 =SORT(UNIQUE(B2:B9)) 的形式。", "At H2, enter a formula that sorts the unique teams from B2:B9 in ascending order using =SORT(UNIQUE(B2:B9)).", "H2 に、B2:B9 の一意のチームを昇順に並べる式 =SORT(UNIQUE(B2:B9)) を入力します。", "請在 H2 寫入公式，把 B2:B9 的唯一團隊依遞增排序。要求使用 =SORT(UNIQUE(B2:B9)) 的形式。"),
            {
              kind: "analysis",
              mode: "array",
              sheet: arraySheet,
              ranges: { teams: "B2:B9", output: "H2" },
              options: { formula: "=SORT(UNIQUE(B2:B9))" },
              goal: { operation: "array", formulaCell: "H2", formula: "=SORT(UNIQUE(B2:B9))" },
            },
            L("输入 =SORT(UNIQUE(B2:B9)) 后确认没有占用溢出区域；SORT 默认升序。", "Enter =SORT(UNIQUE(B2:B9)) and keep the spill area empty; SORT is ascending by default.", "=SORT(UNIQUE(B2:B9)) を入力し、スピル領域を空けます。SORT は既定で昇順です。", "輸入 =SORT(UNIQUE(B2:B9)) 後確認沒有佔用溢出區域；SORT 預設遞增。"),
            L("唯一团队已按升序溢出，SORT 与 UNIQUE 的嵌套关系正确。", "Unique teams spill in ascending order, with SORT correctly nested around UNIQUE.", "一意のチームが昇順でスピルし、SORT と UNIQUE の入れ子も正しいです。", "唯一團隊已依遞增溢出，SORT 與 UNIQUE 的巢狀關係正確。")
          ),
        ]
      ),
    ],
  });

  D.registerChapter({
    id: "ch20-advanced-functions",
    icon: "20",
    title: L("第 20 章 · 高级函数与综合办公", "Chapter 20 · Advanced Functions and Integrated Office Work", "第20章 · 高度な関数と総合業務", "第 20 章 · 進階函數與綜合辦公"),
    subtitle: L("补齐逻辑、文本、统计、引用、日期、财务、数据库与动态数组函数，再用多部门办公情景做总复习。", "Complete logic, text, statistics, reference, date, finance, database, and dynamic-array functions, then integrate them in a multi-department office scenario.", "論理・文字・統計・参照・日付・財務・データベース・動的配列の関数を補い、複数部署の業務シナリオで総復習します。", "補齊邏輯、文字、統計、參照、日期、財務、資料庫與動態陣列函數，再用多部門辦公情境做總複習。"),
    levels: [
      level(
        "advanced-logic-text",
        "lesson",
        L("逻辑与文本函数工具箱", "Logic and text toolbox", "論理と文字の関数ツール", "邏輯與文字函數工具箱"),
        [
          learn(
            "af20-logic-text-teach",
            L("少写嵌套 IF，多做清晰判断", "Write fewer nested IFs and clearer decisions", "入れ子の IF を減らし、判断を明確にする", "少寫巢狀 IF，多做清楚判斷"),
            L("NOT 反转真假，IFS 按顺序检查多个条件，SWITCH 按匹配值返回结果。文本函数负责替换、定位、大小写、拼接和重复，让导入数据变成可读字段。", "NOT reverses a truth value, IFS checks conditions in order, and SWITCH returns a result for a matching value. Text functions replace, locate, change case, join, and repeat content to make imported data readable.", "NOT は真偽を反転し、IFS は条件を順に確認し、SWITCH は一致値に応じて結果を返します。文字関数は置換・位置・大文字小文字・連結・繰り返しで取込データを読みやすくします。", "NOT 反轉真假，IFS 依序檢查多個條件，SWITCH 依符合值傳回結果。文字函數負責取代、定位、大小寫、串接和重複，讓匯入資料變成可讀欄位。"),
            [
              L("IFS 从上到下检查，第一个 TRUE 后停止；最后的 TRUE 可作兜底。", "IFS checks top to bottom and stops at the first TRUE; a final TRUE can act as the fallback.", "IFS は上から順に確認し、最初の TRUE で止まります。最後の TRUE を既定値にできます。", "IFS 從上到下檢查，遇到第一個 TRUE 後停止；最後的 TRUE 可作預設值。"),
              L("SWITCH 适合离散匹配，例如季度代码；没有匹配时应提供默认值。", "SWITCH suits discrete matches such as quarter codes; provide a default when nothing matches.", "SWITCH は四半期コードなどの離散一致に向きます。一致しない場合の既定値も指定します。", "SWITCH 適合離散對應，例如季度代碼；沒有符合值時應提供預設值。"),
              L("SUBSTITUTE 替换指定文本，REPLACE 按位置替换；两者不要混用。", "SUBSTITUTE replaces specified text, while REPLACE works by position; do not mix them up.", "SUBSTITUTE は指定文字を、REPLACE は位置で置換します。混同しないようにします。", "SUBSTITUTE 取代指定文字，REPLACE 依位置取代；兩者不要混用。"),
              L("TEXTJOIN 用分隔符连接区域并忽略空白，CONCAT 直接连接多个值；REPT 适合生成固定长度占位符。", "TEXTJOIN joins a range with a delimiter and can ignore blanks; CONCAT joins values directly; REPT creates fixed-length placeholders.", "TEXTJOIN は区切り文字で範囲を連結して空白を無視でき、CONCAT は値を直接連結し、REPT は固定長のプレースホルダーを作ります。", "TEXTJOIN 用分隔符號連接範圍並忽略空白，CONCAT 直接連接多個值；REPT 適合產生固定長度佔位符。"),
            ],
            L("先判断是“离散映射、区间分级还是文本清理”，再选函数，别把所有问题都塞进 IF。", "Decide whether the task is discrete mapping, banding, or text cleaning before choosing a function instead of forcing everything into IF.", "離散マッピング・区分・文字整理のどれかを判断してから関数を選び、すべてを IF に入れないようにします。", "先判斷是「離散對應、區間分級還是文字清理」，再選函數，別把所有問題都塞進 IF。"),
            L("文本函数的结果可能仍是文本，需要参与计算时再套 VALUE；但编号前导零会丢失。", "Text-function results remain text; wrap with VALUE only when calculation is needed, because leading zeros in IDs will be lost.", "文字関数の結果は文字のままです。計算が必要なら VALUE を重ねますが、番号の先頭0は失われます。", "文字函數的結果可能仍是文字，需要參與計算時再套 VALUE；但編號前導零會遺失。")
          ),
          K.sheetStep({
            id: "af20-logic-practice",
            title: L("逻辑函数练习：反转、分级与代码映射", "Logic practice: negation, bands, and code mapping", "論理関数練習：反転・区分・コード対応", "邏輯函數練習：反轉、分級與代碼對應"),
            lead: L("在结果区完成三项判断：区域不为 East、按得分分级、按季度代码取标签。", "Complete three checks in the result area: region is not East, score band, and quarter label.", "結果領域で、East 以外の地域・得点帯・四半期ラベルの3つを完成します。", "在結果區完成三項判斷：區域不是 East、依得分分級、依季度代碼取標籤。"),
            sheet: logicSheet,
            tasks: [
              manualTask({
                id: "af20-not-task",
                sheet: logicSheet,
                target: "J2",
                taskLabel: L("NOT 反转", "NOT", "NOT 反転", "NOT 反轉"),
                title: L("判断首位员工不在 East", "Check that the first employee is not in East", "1人目が East 以外か確認", "判斷首位員工不在 East"),
                lead: L("在 J2 用 NOT 返回 B2 是否不等于 East。", "In J2, use NOT to return whether B2 is not East.", "J2 で NOT を使い、B2 が East 以外かを返します。", "在 J2 用 NOT 傳回 B2 是否不等於 East。"),
                hint: L("参考：=NOT(B2=\"East\")", "Reference: =NOT(B2=\"East\")", "参考：=NOT(B2=\"East\")", "參考：=NOT(B2=\"East\")"),
                success: L("结果为 TRUE，B2 是 West。", "The result is TRUE because B2 is West.", "B2 は West なので TRUE です。", "結果為 TRUE，B2 是 West。"),
                formula: "=NOT(B2=\"East\")",
                expected: true,
                requiredFunctions: ["NOT"],
              }),
              manualTask({
                id: "af20-ifs-task",
                sheet: logicSheet,
                target: "J3",
                taskLabel: L("IFS 分级", "IFS banding", "IFS 区分", "IFS 分級"),
                title: L("给首位员工分为 A、B、C 或 D", "Band the first employee as A, B, C, or D", "1人目を A・B・C・D に区分", "給首位員工分為 A、B、C 或 D"),
                lead: L("在 J3 用 IFS：D2 大于等于 90 为 A，大于等于 80 为 B，大于等于 70 为 C，其余为 D。", "In J3, use IFS: D2 at least 90 is A, at least 80 is B, at least 70 is C, otherwise D.", "J3 で IFS を使い、D2 が90以上なら A、80以上なら B、70以上なら C、それ以外は D にします。", "在 J3 用 IFS：D2 大於等於 90 為 A，大於等於 80 為 B，大於等於 70 為 C，其餘為 D。"),
                hint: L("参考：=IFS(D2>=90,\"A\",D2>=80,\"B\",D2>=70,\"C\",TRUE,\"D\")", "Reference: =IFS(D2>=90,\"A\",D2>=80,\"B\",D2>=70,\"C\",TRUE,\"D\")", "参考：=IFS(D2>=90,\"A\",D2>=80,\"B\",D2>=70,\"C\",TRUE,\"D\")", "參考：=IFS(D2>=90,\"A\",D2>=80,\"B\",D2>=70,\"C\",TRUE,\"D\")"),
                success: L("92 分返回 A，条件顺序正确。", "A score of 92 returns A with the conditions in the correct order.", "92点は A になり、条件順も正しいです。", "92 分傳回 A，條件順序正確。"),
                formula: "=IFS(D2>=90,\"A\",D2>=80,\"B\",D2>=70,\"C\",TRUE,\"D\")",
                expected: "A",
                requiredFunctions: ["IFS"],
              }),
              manualTask({
                id: "af20-switch-task",
                sheet: logicSheet,
                target: "J4",
                taskLabel: L("SWITCH 映射", "SWITCH mapping", "SWITCH 対応", "SWITCH 對應"),
                title: L("把季度代码 1 映射到 Q1", "Map quarter code 1 to Q1", "四半期コード1を Q1 に変換", "把季度代碼 1 對應到 Q1"),
                lead: L("在 J4 用 SWITCH 将 C2 的 1、2、3 映射为 Q1、Q2、Q3，其余为 Q4。", "In J4, use SWITCH to map C2 values 1, 2, and 3 to Q1, Q2, and Q3, otherwise Q4.", "J4 で SWITCH を使い、C2 の 1・2・3 を Q1・Q2・Q3、それ以外を Q4 にします。", "在 J4 用 SWITCH 將 C2 的 1、2、3 對應為 Q1、Q2、Q3，其餘為 Q4。"),
                hint: L("参考：=SWITCH(C2,1,\"Q1\",2,\"Q2\",3,\"Q3\",\"Q4\")", "Reference: =SWITCH(C2,1,\"Q1\",2,\"Q2\",3,\"Q3\",\"Q4\")", "参考：=SWITCH(C2,1,\"Q1\",2,\"Q2\",3,\"Q3\",\"Q4\")", "參考：=SWITCH(C2,1,\"Q1\",2,\"Q2\",3,\"Q3\",\"Q4\")"),
                success: L("代码 1 返回 Q1，默认值也已指定。", "Code 1 returns Q1 and a fallback is included.", "コード1は Q1 になり、既定値も指定されています。", "代碼 1 傳回 Q1，預設值也已指定。"),
                formula: "=SWITCH(C2,1,\"Q1\",2,\"Q2\",3,\"Q3\",\"Q4\")",
                expected: "Q1",
                requiredFunctions: ["SWITCH"],
              }),
            ],
            hint: L("三个公式都以 J2:J4 为目标，结果区标签已经写在 I 列。", "All three formulas target J2:J4 and the result labels are already in column I.", "3つの式は J2:J4 を対象にし、I列にラベルがあります。", "三個公式都以 J2:J4 為目標，結果區標籤已經寫在 I 欄。"),
          }),
          K.sheetStep({
            id: "af20-text-practice",
            title: L("文本函数练习：替换、转换与连接", "Text practice: replace, convert, and join", "文字関数練習：置換・変換・連結", "文字函數練習：取代、轉換與連接"),
            lead: L("逐项完成编码清理、数字转换、大小写、连接和重复符号。所有来源都已在 A:E 列可见。", "Complete code cleaning, numeric conversion, case, joining, and repetition; all sources are visible in columns A:E.", "コード整理・数値変換・大文字小文字・連結・記号の繰り返しを順に行います。元データは A:E 列にあります。", "逐項完成編碼清理、數字轉換、大小寫、連接和重複符號。所有來源都已在 A:E 欄可見。"),
            sheet: textSheet,
            tasks: [
              manualTask({
                id: "af20-substitute-task",
                sheet: textSheet,
                target: "J2",
                taskLabel: L("SUBSTITUTE", "SUBSTITUTE", "SUBSTITUTE", "SUBSTITUTE"),
                title: L("把编码中的连字符换成斜杠", "Replace dashes in the code with slashes", "コードのハイフンをスラッシュへ", "把編碼中的連字號換成斜線"),
                lead: L("在 J2 用 SUBSTITUTE 把 A2 中的 - 全部替换为 /。", "In J2, use SUBSTITUTE to replace every - in A2 with /.", "J2 で SUBSTITUTE を使い、A2 の - をすべて / に置換します。", "在 J2 用 SUBSTITUTE 把 A2 中的 - 全部取代為 /。"),
                hint: L("参考：=SUBSTITUTE(A2,\"-\",\"/\")", "Reference: =SUBSTITUTE(A2,\"-\",\"/\")", "参考：=SUBSTITUTE(A2,\"-\",\"/\")", "參考：=SUBSTITUTE(A2,\"-\",\"/\")"),
                success: L("返回 CN/EAST/041。", "The result is CN/EAST/041.", "結果は CN/EAST/041 です。", "傳回 CN/EAST/041。"),
                formula: "=SUBSTITUTE(A2,\"-\",\"/\")",
                expected: "CN/EAST/041",
                requiredFunctions: ["SUBSTITUTE"],
              }),
              manualTask({
                id: "af20-replace-task",
                sheet: textSheet,
                target: "J3",
                taskLabel: L("REPLACE", "REPLACE", "REPLACE", "REPLACE"),
                title: L("把第二行编码的前两个字符替换为 HQ", "Replace the first two characters on row 3 with HQ", "3行目の先頭2文字を HQ に置換", "把第二列編碼的前兩個字元取代為 HQ"),
                lead: L("在 J3 用 REPLACE 将 A3 从第 1 位开始的 2 个字符替换为 HQ。", "In J3, use REPLACE on A3 to replace two characters starting at position 1 with HQ.", "J3 で A3 の1文字目から2文字を HQ に置換します。", "在 J3 用 REPLACE 將 A3 從第 1 位開始的 2 個字元取代為 HQ。"),
                hint: L("参考：=REPLACE(A3,1,2,\"HQ\")", "Reference: =REPLACE(A3,1,2,\"HQ\")", "参考：=REPLACE(A3,1,2,\"HQ\")", "參考：=REPLACE(A3,1,2,\"HQ\")"),
                success: L("返回 HQ-WEST-118。", "The result is HQ-WEST-118.", "結果は HQ-WEST-118 です。", "傳回 HQ-WEST-118。"),
                formula: "=REPLACE(A3,1,2,\"HQ\")",
                expected: "HQ-WEST-118",
                requiredFunctions: ["REPLACE"],
              }),
              manualTask({
                id: "af20-value-task",
                sheet: textSheet,
                target: "J4",
                taskLabel: L("VALUE", "VALUE", "VALUE", "VALUE"),
                title: L("把带前导零的文本转成数字", "Convert numeric text with leading zeros", "先頭0付き文字を数値へ変換", "把帶前導零的文字轉成數字"),
                lead: L("在 J4 用 VALUE 将 B2 的文本 00125 转为数字。", "In J4, use VALUE on the text 00125 in B2.", "J4 で B2 の文字 00125 に VALUE を使い数値にします。", "在 J4 用 VALUE 將 B2 的文字 00125 轉為數字。"),
                hint: L("参考：=VALUE(B2)", "Reference: =VALUE(B2)", "参考：=VALUE(B2)", "參考：=VALUE(B2)"),
                success: L("返回数字 125；原始前导零文本仍保留在 B2。", "The result is 125 while the original zero-padded text remains in B2.", "結果は125で、先頭0付きの元テキストは B2 に残ります。", "傳回數字 125；原始前導零文字仍保留在 B2。"),
                formula: "=VALUE(B2)",
                expected: 125,
                requiredFunctions: ["VALUE"],
              }),
              manualTask({
                id: "af20-proper-task",
                sheet: textSheet,
                target: "J5",
                taskLabel: L("PROPER", "PROPER", "PROPER", "PROPER"),
                title: L("把短语设为每个单词首字母大写", "Capitalize each word in the phrase", "各単語の先頭を大文字にする", "把短語設為每個單字首字母大寫"),
                lead: L("在 J5 用 PROPER 处理 C2。", "In J5, apply PROPER to C2.", "J5 で C2 に PROPER を使います。", "在 J5 用 PROPER 處理 C2。"),
                hint: L("参考：=PROPER(C2)", "Reference: =PROPER(C2)", "参考：=PROPER(C2)", "參考：=PROPER(C2)"),
                success: L("返回 Garden City。", "The result is Garden City.", "結果は Garden City です。", "傳回 Garden City。"),
                formula: "=PROPER(C2)",
                expected: "Garden City",
                requiredFunctions: ["PROPER"],
              }),
              manualTask({
                id: "af20-concat-task",
                sheet: textSheet,
                target: "J6",
                taskLabel: L("CONCAT", "CONCAT", "CONCAT", "CONCAT"),
                title: L("直接连接两个单词", "Join two words directly", "2つの単語を直接連結", "直接連接兩個詞語"),
                lead: L("在 J6 用 CONCAT 连接 D2、\"-\" 和 E2。", "In J6, use CONCAT to join D2, \"-\", and E2.", "J6 で CONCAT を使い、D2・\"-\"・E2 を連結します。", "在 J6 用 CONCAT 連接 D2、\"-\" 和 E2。"),
                hint: L("参考：=CONCAT(D2,\"-\",E2)", "Reference: =CONCAT(D2,\"-\",E2)", "参考：=CONCAT(D2,\"-\",E2)", "參考：=CONCAT(D2,\"-\",E2)"),
                success: L("返回 north-alpha。", "The result is north-alpha.", "結果は north-alpha です。", "傳回 north-alpha。"),
                formula: "=CONCAT(D2,\"-\",E2)",
                expected: "north-alpha",
                requiredFunctions: ["CONCAT"],
              }),
              manualTask({
                id: "af20-textjoin-task",
                sheet: textSheet,
                target: "J7",
                taskLabel: L("TEXTJOIN", "TEXTJOIN", "TEXTJOIN", "TEXTJOIN"),
                title: L("用逗号连接区域并忽略空白", "Join a range with commas and ignore blanks", "範囲をカンマで連結し空白を無視", "用逗號連接範圍並忽略空白"),
                lead: L("在 J7 用 TEXTJOIN 连接 D2:E2，分隔符为逗号加空格，忽略空白。", "In J7, use TEXTJOIN on D2:E2 with a comma-space delimiter and ignore empty cells.", "J7 で TEXTJOIN を使い、D2:E2 をカンマと空白で連結し、空セルを無視します。", "在 J7 用 TEXTJOIN 連接 D2:E2，分隔符為逗號加空格，忽略空白。"),
                hint: L("参考：=TEXTJOIN(\", \",TRUE,D2:E2)", "Reference: =TEXTJOIN(\", \",TRUE,D2:E2)", "参考：=TEXTJOIN(\", \",TRUE,D2:E2)", "參考：=TEXTJOIN(\", \",TRUE,D2:E2)"),
                success: L("返回 north, alpha。", "The result is north, alpha.", "結果は north, alpha です。", "傳回 north, alpha。"),
                formula: "=TEXTJOIN(\", \",TRUE,D2:E2)",
                expected: "north, alpha",
                requiredFunctions: ["TEXTJOIN"],
              }),
              manualTask({
                id: "af20-rept-task",
                sheet: textSheet,
                target: "J8",
                taskLabel: L("REPT", "REPT", "REPT", "REPT"),
                title: L("重复星号三次", "Repeat an asterisk three times", "アスタリスクを3回繰り返す", "重複星號三次"),
                lead: L("在 J8 用 REPT 重复 * 三次。", "In J8, use REPT to repeat * three times.", "J8 で REPT を使い、* を3回繰り返します。", "在 J8 用 REPT 重複 * 三次。"),
                hint: L("参考：=REPT(\"*\",3)", "Reference: =REPT(\"*\",3)", "参考：=REPT(\"*\",3)", "參考：=REPT(\"*\",3)"),
                success: L("返回 ***。", "The result is ***.", "結果は *** です。", "傳回 ***。"),
                formula: "=REPT(\"*\",3)",
                expected: "***",
                requiredFunctions: ["REPT"],
              }),
            ],
            hint: L("识别函数后检查参数顺序；文本结果不要再被误当数字。", "Check argument order after choosing the function, and do not mistake text results for numbers.", "関数を選んだ後に引数順を確認し、文字結果を数値と誤解しないようにします。", "識別函數後檢查參數順序；文字結果不要再被誤當數字。"),
          }),
          K.builder({
            id: "af20-concatenate-builder",
            title: L("构建团队与区域的连接公式", "Build the team-region concatenation formula", "チームと地域を連結する式を組み立てる", "建構團隊與區域的連接公式"),
            lead: L("用 CONCATENATE 把 C2、\" / \" 和 D2 连成一个文本。", "Use CONCATENATE to join C2, \" / \", and D2 into one text value.", "CONCATENATE で C2、\" / \"、D2 を1つの文字列にします。", "用 CONCATENATE 把 C2、\" / \" 和 D2 連成一個文字值。"),
            formula: "=CONCATENATE(C2,\" / \",D2)",
            sheet: builderSheet,
            success: L("返回 Design / North，旧版连接函数依然能处理简单文本合并。", "The result is Design / North; the legacy join function still handles simple text merges.", "結果は Design / North で、従来の連結関数も単純な文字結合に使えます。", "傳回 Design / North，舊版連接函數依然能處理簡單文字合併。"),
            hint: L("注意文本参数要用双引号，单元格引用之间用逗号分隔。", "Put text arguments in double quotes and separate cell references with commas.", "文字引数は二重引用符で囲み、セル参照はカンマで区切ります。", "注意文字參數要用雙引號，儲存格參照之間用逗號分隔。"),
          }),
        ]
      ),
      level(
        "advanced-reference-date",
        "lesson",
        L("统计、引用与日期函数", "Statistical, reference, and date functions", "統計・参照・日付の関数", "統計、參照與日期函數"),
        [
          learn(
            "af20-reference-teach",
            L("从统计到日期，参数顺序就是业务口径", "From statistics to dates, argument order defines the business rule", "統計から日付まで、引数順が業務ルールを決める", "從統計到日期，參數順序就是業務定義"),
            L("COUNTBLANK 统计空白，MEDIAN 取中位，LARGE/SMALL 取第几大/小，RANK.EQ 排名。CEILING/FLOOR 按倍数取整，RAND/RANDBETWEEN 生成随机数。CHOOSE、OFFSET、INDIRECT、ROW、COLUMN、ROWS、COLUMNS 负责选择和描述区域。日期函数处理工作日、月末和期间差。", "COUNTBLANK counts blanks, MEDIAN finds the middle, LARGE and SMALL return the nth value, and RANK.EQ ranks. CEILING and FLOOR round by a multiple, while RAND and RANDBETWEEN generate random values. CHOOSE, OFFSET, INDIRECT, ROW, COLUMN, ROWS, and COLUMNS select or describe ranges. Date functions handle workdays, month ends, and durations.", "COUNTBLANK は空白、MEDIAN は中央値、LARGE/SMALL は n 番目、RANK.EQ は順位を返します。CEILING/FLOOR は倍数で丸め、RAND/RANDBETWEEN は乱数を生成します。CHOOSE・OFFSET・INDIRECT・ROW・COLUMN・ROWS・COLUMNS は範囲の選択や記述に使います。日付関数は営業日・月末・期間差を扱います。", "COUNTBLANK 統計空白，MEDIAN 取中位數，LARGE/SMALL 取第幾大／小，RANK.EQ 排名。CEILING/FLOOR 依倍數取整，RAND/RANDBETWEEN 產生隨機數。CHOOSE、OFFSET、INDIRECT、ROW、COLUMN、ROWS、COLUMNS 負責選擇和描述範圍。日期函數處理工作天、月底和期間差。"),
            [
              L("中位数对极端值不敏感；平均值会受一个超大值影响。", "The median resists extreme values, while the mean is pulled by a single outlier.", "中央値は外れ値に強く、平均値は1つの大きな値に引っ張られます。", "中位數對極端值不敏感；平均值會受一個超大值影響。"),
              L("CEILING 和 FLOOR 的倍数必须与业务单位一致，不能把 5 元取整写成 5 角。", "CEILING and FLOOR multiples must match the business unit; do not mix yuan and tenths.", "CEILING と FLOOR の倍数は業務単位と合わせ、元と角を混同しません。", "CEILING 和 FLOOR 的倍數必須與業務單位一致，不能把 5 元取整寫成 5 角。"),
              L("INDIRECT 用文本生成引用，工作表名变化时容易断；能直接引用就不要用它。", "INDIRECT builds references from text and breaks when names change; avoid it when direct references work.", "INDIRECT は文字から参照を作り、名前変更で壊れます。直接参照できる場合は使いません。", "INDIRECT 用文字產生參照，工作表名稱變更時容易中斷；能直接參照就不要用它。"),
              L("NETWORKDAYS 含首尾工作日，DATEDIF 的第三参数决定单位；月末和工作日结果要再用日期格式显示。", "NETWORKDAYS includes both start and end workdays, while DATEDIF's third argument sets the unit; format month-end and workday results as dates.", "NETWORKDAYS は開始日と終了日を含み、DATEDIF は第3引数で単位を決めます。月末や営業日の結果は日付表示にします。", "NETWORKDAYS 含首尾工作天，DATEDIF 的第三參數決定單位；月底和工作天結果要再用日期格式顯示。"),
            ],
            L("统计函数先确认是否要忽略空白；引用函数先确认区域是否能随复制正确移动。", "For statistics, confirm how blanks are treated; for reference functions, confirm the range moves correctly when copied.", "統計では空白の扱い、参照ではコピー時に範囲が正しく動くかを確認します。", "統計函數先確認是否要忽略空白；參照函數先確認範圍是否能隨複製正確移動。"),
            L("RAND 和 RANDBETWEEN 是易失函数，每次重算都会变；需要固定结果时复制为值。", "RAND and RANDBETWEEN are volatile and change on recalculation; paste as values when a fixed result is needed.", "RAND と RANDBETWEEN は再計算のたびに変わる揮発性関数です。固定が必要なら値として貼り付けます。", "RAND 和 RANDBETWEEN 是易失函數，每次重算都會變；需要固定結果時複製為值。")
          ),
          K.sheetStep({
            id: "af20-stats-practice",
            title: L("统计与取整练习", "Statistics and rounding practice", "統計と丸めの練習", "統計與取整練習"),
            lead: L("按结果区标签完成空白计数、中位数、第几大/小、排名以及 5 的倍数取整。", "Use the result labels for blank count, median, nth largest/smallest, rank, and rounding to multiples of 5.", "結果ラベルに従い、空白数・中央値・n番目・順位・5の倍数丸めを完成します。", "依結果區標籤完成空白計數、中位數、第幾大／小、排名以及 5 的倍數取整。"),
            sheet: statsSheet,
            tasks: [
              manualTask({
                id: "af20-countblank-task",
                sheet: statsSheet,
                target: "J2",
                taskLabel: L("COUNTBLANK", "COUNTBLANK", "COUNTBLANK", "COUNTBLANK"),
                title: L("统计项目分和计费小时的空白", "Count blanks in project and billable hours", "課題点と請求時間の空白を数える", "統計專案分和計費時數的空白"),
                lead: L("在 J2 用 COUNTBLANK 统计 D2:E9 的空白单元格数。", "In J2, use COUNTBLANK on D2:E9.", "J2 で COUNTBLANK を使い、D2:E9 の空白セルを数えます。", "在 J2 用 COUNTBLANK 統計 D2:E9 的空白儲存格數。"),
                hint: L("参考：=COUNTBLANK(D2:E9)", "Reference: =COUNTBLANK(D2:E9)", "参考：=COUNTBLANK(D2:E9)", "參考：=COUNTBLANK(D2:E9)"),
                success: L("共有 4 个空白单元格。", "There are four blank cells.", "空白セルは4つです。", "共有 4 個空白儲存格。"),
                formula: "=COUNTBLANK(D2:E9)",
                expected: 4,
                requiredFunctions: ["COUNTBLANK"],
              }),
              manualTask({
                id: "af20-median-task",
                sheet: statsSheet,
                target: "J3",
                taskLabel: L("MEDIAN", "MEDIAN", "MEDIAN", "MEDIAN"),
                title: L("计算考试分中位数", "Find the median exam score", "試験点の中央値を求める", "計算考試分中位數"),
                lead: L("在 J3 用 MEDIAN 计算 C2:C9。", "In J3, use MEDIAN on C2:C9.", "J3 で C2:C9 に MEDIAN を使います。", "在 J3 用 MEDIAN 計算 C2:C9。"),
                hint: L("参考：=MEDIAN(C2:C9)", "Reference: =MEDIAN(C2:C9)", "参考：=MEDIAN(C2:C9)", "參考：=MEDIAN(C2:C9)"),
                success: L("中位数为 86.5。", "The median is 86.5.", "中央値は86.5です。", "中位數為 86.5。"),
                formula: "=MEDIAN(C2:C9)",
                expected: 86.5,
                requiredFunctions: ["MEDIAN"],
              }),
              manualTask({
                id: "af20-large-task",
                sheet: statsSheet,
                target: "J4",
                taskLabel: L("LARGE", "LARGE", "LARGE", "LARGE"),
                title: L("取第二高的考试分", "Return the second-highest exam score", "2番目に高い試験点を返す", "取第二高的考試分"),
                lead: L("在 J4 用 LARGE 返回 C2:C9 的第 2 高值。", "In J4, use LARGE to return the second-highest value in C2:C9.", "J4 で LARGE を使い、C2:C9 の2番目に高い値を返します。", "在 J4 用 LARGE 傳回 C2:C9 的第 2 高值。"),
                hint: L("参考：=LARGE(C2:C9,2)", "Reference: =LARGE(C2:C9,2)", "参考：=LARGE(C2:C9,2)", "參考：=LARGE(C2:C9,2)"),
                success: L("第二高分是 91。", "The second-highest score is 91.", "2番目に高い点は91です。", "第二高分是 91。"),
                formula: "=LARGE(C2:C9,2)",
                expected: 91,
                requiredFunctions: ["LARGE"],
              }),
              manualTask({
                id: "af20-small-task",
                sheet: statsSheet,
                target: "J5",
                taskLabel: L("SMALL", "SMALL", "SMALL", "SMALL"),
                title: L("取第二低的考试分", "Return the second-lowest exam score", "2番目に低い試験点を返す", "取第二低的考試分"),
                lead: L("在 J5 用 SMALL 返回 C2:C9 的第 2 低值。", "In J5, use SMALL to return the second-lowest value in C2:C9.", "J5 で SMALL を使い、C2:C9 の2番目に低い値を返します。", "在 J5 用 SMALL 傳回 C2:C9 的第 2 低值。"),
                hint: L("参考：=SMALL(C2:C9,2)", "Reference: =SMALL(C2:C9,2)", "参考：=SMALL(C2:C9,2)", "參考：=SMALL(C2:C9,2)"),
                success: L("第二低分是 72。", "The second-lowest score is 72.", "2番目に低い点は72です。", "第二低分是 72。"),
                formula: "=SMALL(C2:C9,2)",
                expected: 72,
                requiredFunctions: ["SMALL"],
              }),
              manualTask({
                id: "af20-rank-eq-task",
                sheet: statsSheet,
                target: "J6",
                taskLabel: L("RANK.EQ", "RANK.EQ", "RANK.EQ", "RANK.EQ"),
                title: L("计算林肯的考试排名", "Rank Olivia's exam score", "Olivia の試験順位", "計算林曉的考試排名"),
                lead: L("在 J6 用 RANK.EQ 计算 C2 在 C2:C9 中的降序排名。", "In J6, use RANK.EQ for C2 within C2:C9 in descending order.", "J6 で RANK.EQ を使い、C2 の C2:C9 内での降順順位を求めます。", "在 J6 用 RANK.EQ 計算 C2 在 C2:C9 中的遞減排名。"),
                hint: L("参考：=RANK.EQ(C2,C2:C9,0)", "Reference: =RANK.EQ(C2,C2:C9,0)", "参考：=RANK.EQ(C2,C2:C9,0)", "參考：=RANK.EQ(C2,C2:C9,0)"),
                success: L("88 分排第 4。", "A score of 88 ranks fourth.", "88点は4位です。", "88 分排第 4。"),
                formula: "=RANK.EQ(C2,C2:C9,0)",
                expected: 4,
                requiredFunctions: ["RANK.EQ"],
              }),
              manualTask({
                id: "af20-ceiling-task",
                sheet: statsSheet,
                target: "J7",
                taskLabel: L("CEILING", "CEILING", "CEILING", "CEILING"),
                title: L("把 37 小时向上取到 5 的倍数", "Round 37 hours up to a multiple of 5", "37時間を5の倍数に切り上げ", "把 37 小時向上取至 5 的倍數"),
                lead: L("在 J7 用 CEILING 将 E2 向上取到 5 的倍数。", "In J7, use CEILING to round E2 up to a multiple of 5.", "J7 で CEILING を使い、E2 を5の倍数に切り上げます。", "在 J7 用 CEILING 將 E2 向上取至 5 的倍數。"),
                hint: L("参考：=CEILING(E2,5)", "Reference: =CEILING(E2,5)", "参考：=CEILING(E2,5)", "參考：=CEILING(E2,5)"),
                success: L("37 小时向上取为 40。", "37 hours rounds up to 40.", "37時間は40に切り上がります。", "37 小時向上取為 40。"),
                formula: "=CEILING(E2,5)",
                expected: 40,
                requiredFunctions: ["CEILING"],
              }),
              manualTask({
                id: "af20-floor-task",
                sheet: statsSheet,
                target: "J8",
                taskLabel: L("FLOOR", "FLOOR", "FLOOR", "FLOOR"),
                title: L("把 37 小时向下取到 5 的倍数", "Round 37 hours down to a multiple of 5", "37時間を5の倍数に切り下げ", "把 37 小時向下取至 5 的倍數"),
                lead: L("在 J8 用 FLOOR 将 E2 向下取到 5 的倍数。", "In J8, use FLOOR to round E2 down to a multiple of 5.", "J8 で FLOOR を使い、E2 を5の倍数に切り下げます。", "在 J8 用 FLOOR 將 E2 向下取至 5 的倍數。"),
                hint: L("参考：=FLOOR(E2,5)", "Reference: =FLOOR(E2,5)", "参考：=FLOOR(E2,5)", "參考：=FLOOR(E2,5)"),
                success: L("37 小时向下取为 35。", "37 hours rounds down to 35.", "37時間は35に切り下がります。", "37 小時向下取為 35。"),
                formula: "=FLOOR(E2,5)",
                expected: 35,
                requiredFunctions: ["FLOOR"],
              }),
            ],
            hint: L("中位数不是平均值，LARGE/SMALL 的第二参数是名次而不是分数。", "The median is not the mean, and LARGE/SMALL's second argument is the rank, not a score.", "中央値は平均値ではなく、LARGE/SMALL の第2引数は順位です。", "中位數不是平均值，LARGE/SMALL 的第二參數是名次而不是分數。"),
          }),
          K.sheetStep({
            id: "af20-reference-practice",
            title: L("引用函数练习：选择、偏移与区域描述", "Reference practice: choose, offset, and describe ranges", "参照関数練習：選択・オフセット・範囲記述", "參照函數練習：選擇、位移與範圍描述"),
            lead: L("按标签完成部门名称、偏移取值、间接引用和行列数量检查。", "Use the labels to return a department name, offset value, indirect reference, and row/column counts.", "ラベルに従い、部署名・オフセット値・間接参照・行数と列数を返します。", "依標籤完成部門名稱、位移取值、間接參照和列欄數量檢查。"),
            sheet: statsSheet,
            tasks: [
              manualTask({
                id: "af20-choose-task",
                sheet: statsSheet,
                target: "J9",
                taskLabel: L("CHOOSE", "CHOOSE", "CHOOSE", "CHOOSE"),
                title: L("把部门代码 1 映射为运营", "Map department code 1 to Operations", "部署コード1を運営に対応", "把部門代碼 1 對應為營運"),
                lead: L("在 J9 用 CHOOSE 按 G2 返回 Operations、Technology、Support 或 Finance。", "In J9, use CHOOSE on G2 to return Operations, Technology, Support, or Finance.", "J9 で CHOOSE を使い、G2 に応じて Operations・Technology・Support・Finance を返します。", "在 J9 用 CHOOSE 依 G2 傳回 Operations、Technology、Support 或 Finance。"),
                hint: L("参考：=CHOOSE(G2,\"Operations\",\"Technology\",\"Support\",\"Finance\")", "Reference: =CHOOSE(G2,\"Operations\",\"Technology\",\"Support\",\"Finance\")", "参考：=CHOOSE(G2,\"Operations\",\"Technology\",\"Support\",\"Finance\")", "參考：=CHOOSE(G2,\"Operations\",\"Technology\",\"Support\",\"Finance\")"),
                success: L("G2 为 1，返回 Operations。", "G2 is 1 and returns Operations.", "G2 は1なので Operations を返します。", "G2 為 1，傳回 Operations。"),
                formula: "=CHOOSE(G2,\"Operations\",\"Technology\",\"Support\",\"Finance\")",
                expected: "Operations",
                requiredFunctions: ["CHOOSE"],
              }),
              manualTask({
                id: "af20-offset-task",
                sheet: statsSheet,
                target: "J10",
                taskLabel: L("OFFSET", "OFFSET", "OFFSET", "OFFSET"),
                title: L("从 C2 向下偏移两行", "Offset two rows down from C2", "C2 から2行下へオフセット", "從 C2 向下位移兩列"),
                lead: L("在 J10 用 OFFSET 从 C2 向下移 2 行、0 列，返回其中的考试分。", "In J10, use OFFSET from C2 two rows down and zero columns to return that exam score.", "J10 で OFFSET を使い、C2 から2行下・0列の試験点を返します。", "在 J10 用 OFFSET 從 C2 向下移 2 列、0 欄，傳回其中的考試分。"),
                hint: L("参考：=OFFSET(C2,2,0)", "Reference: =OFFSET(C2,2,0)", "参考：=OFFSET(C2,2,0)", "參考：=OFFSET(C2,2,0)"),
                success: L("返回 C4 的 78。", "It returns 78 from C4.", "C4 の78を返します。", "傳回 C4 的 78。"),
                formula: "=OFFSET(C2,2,0)",
                expected: 78,
                requiredFunctions: ["OFFSET"],
              }),
              manualTask({
                id: "af20-indirect-task",
                sheet: statsSheet,
                target: "J11",
                taskLabel: L("INDIRECT", "INDIRECT", "INDIRECT", "INDIRECT"),
                title: L("按部门代码间接引用 C 列", "Indirectly reference a C-column row by code", "コードで C列を間接参照", "依部門代碼間接參照 C 欄"),
                lead: L("在 J11 用 INDIRECT 生成 \"C\" 与 G2+6 的连接引用，并返回该单元格。", "In J11, use INDIRECT to build a reference from \"C\" joined to G2+6 and return that cell.", "J11 で INDIRECT を使い、\"C\" と G2+6 を連結した参照を返します。", "在 J11 用 INDIRECT 產生 \"C\" 與 G2+6 的連接參照，並傳回該儲存格。"),
                hint: L("参考：=INDIRECT(\"C\"&(G2+6))", "Reference: =INDIRECT(\"C\"&(G2+6))", "参考：=INDIRECT(\"C\"&(G2+6))", "參考：=INDIRECT(\"C\"&(G2+6))"),
                success: L("G2 为 1，返回 C7 的 90。", "G2 is 1, so it returns 90 from C7.", "G2 が1なので C7 の90を返します。", "G2 為 1，傳回 C7 的 90。"),
                formula: "=INDIRECT(\"C\"&(G2+6))",
                expected: 90,
                requiredFunctions: ["INDIRECT"],
              }),
              manualTask({
                id: "af20-row-task",
                sheet: statsSheet,
                target: "J12",
                taskLabel: L("ROW", "ROW", "ROW", "ROW"),
                title: L("返回 C5 的行号", "Return the row number of C5", "C5 の行番号を返す", "傳回 C5 的列號"),
                lead: L("在 J12 用 ROW 返回 C5 的行号。", "In J12, use ROW to return the row number of C5.", "J12 で ROW を使い、C5 の行番号を返します。", "在 J12 用 ROW 傳回 C5 的列號。"),
                hint: L("参考：=ROW(C5)", "Reference: =ROW(C5)", "参考：=ROW(C5)", "參考：=ROW(C5)"),
                success: L("返回 5。", "It returns 5.", "5を返します。", "傳回 5。"),
                formula: "=ROW(C5)",
                expected: 5,
                requiredFunctions: ["ROW"],
              }),
              manualTask({
                id: "af20-column-task",
                sheet: statsSheet,
                target: "J13",
                taskLabel: L("COLUMN", "COLUMN", "COLUMN", "COLUMN"),
                title: L("返回 D1 的列号", "Return the column number of D1", "D1 の列番号を返す", "傳回 D1 的欄號"),
                lead: L("在 J13 用 COLUMN 返回 D1 的列号。", "In J13, use COLUMN to return the column number of D1.", "J13 で COLUMN を使い、D1 の列番号を返します。", "在 J13 用 COLUMN 傳回 D1 的欄號。"),
                hint: L("参考：=COLUMN(D1)", "Reference: =COLUMN(D1)", "参考：=COLUMN(D1)", "參考：=COLUMN(D1)"),
                success: L("返回 4。", "It returns 4.", "4を返します。", "傳回 4。"),
                formula: "=COLUMN(D1)",
                expected: 4,
                requiredFunctions: ["COLUMN"],
              }),
              manualTask({
                id: "af20-rows-task",
                sheet: statsSheet,
                target: "J14",
                taskLabel: L("ROWS", "ROWS", "ROWS", "ROWS"),
                title: L("统计 C2:C9 的行数", "Count the rows in C2:C9", "C2:C9 の行数を数える", "統計 C2:C9 的列數"),
                lead: L("在 J14 用 ROWS 返回 C2:C9 的行数。", "In J14, use ROWS to return the row count of C2:C9.", "J14 で ROWS を使い、C2:C9 の行数を返します。", "在 J14 用 ROWS 傳回 C2:C9 的列數。"),
                hint: L("参考：=ROWS(C2:C9)", "Reference: =ROWS(C2:C9)", "参考：=ROWS(C2:C9)", "參考：=ROWS(C2:C9)"),
                success: L("返回 8。", "It returns 8.", "8を返します。", "傳回 8。"),
                formula: "=ROWS(C2:C9)",
                expected: 8,
                requiredFunctions: ["ROWS"],
              }),
              manualTask({
                id: "af20-columns-task",
                sheet: statsSheet,
                target: "J15",
                taskLabel: L("COLUMNS", "COLUMNS", "COLUMNS", "COLUMNS"),
                title: L("统计 A1:G9 的列数", "Count the columns in A1:G9", "A1:G9 の列数を数える", "統計 A1:G9 的欄數"),
                lead: L("在 J15 用 COLUMNS 返回 A1:G9 的列数。", "In J15, use COLUMNS to return the column count of A1:G9.", "J15 で COLUMNS を使い、A1:G9 の列数を返します。", "在 J15 用 COLUMNS 傳回 A1:G9 的欄數。"),
                hint: L("参考：=COLUMNS(A1:G9)", "Reference: =COLUMNS(A1:G9)", "参考：=COLUMNS(A1:G9)", "參考：=COLUMNS(A1:G9)"),
                success: L("返回 7。", "It returns 7.", "7を返します。", "傳回 7。"),
                formula: "=COLUMNS(A1:G9)",
                expected: 7,
                requiredFunctions: ["COLUMNS"],
              }),
            ],
            hint: L("ROW/COLUMN 返回单个位置，ROWS/COLUMNS 返回区域尺寸；不要混淆。", "ROW/COLUMN return one position, while ROWS/COLUMNS return range sizes; do not mix them.", "ROW/COLUMN は位置、ROWS/COLUMNS は範囲の大きさを返します。混同しないでください。", "ROW/COLUMN 傳回單一位置，ROWS/COLUMNS 傳回範圍尺寸；不要混淆。"),
          }),
          K.sheetStep({
            id: "af20-date-practice",
            title: L("日期函数练习：工作日、月末与期间差", "Date practice: workdays, month ends, and durations", "日付関数練習：営業日・月末・期間差", "日期函數練習：工作天、月底與期間差"),
            lead: L("所有任务都以 2026-01-05 到 2026-04-15 的春季复核为对象，结果写在 J2:J8。", "All tasks use the 2026-01-05 to 2026-04-15 spring review, with answers in J2:J8.", "すべて 2026-01-05〜2026-04-15 の春の確認を対象にし、J2:J8 に結果を出します。", "所有任務都以 2026-01-05 到 2026-04-15 的春季複核為對象，結果寫在 J2:J8。"),
            sheet: dateSheet,
            tasks: [
              manualTask({
                id: "af20-weekday-task",
                sheet: dateSheet,
                target: "J2",
                taskLabel: L("WEEKDAY", "WEEKDAY", "WEEKDAY", "WEEKDAY"),
                title: L("返回开始日期的星期编号", "Return the weekday number of the start date", "開始日の曜日番号を返す", "傳回開始日期的星期編號"),
                lead: L("在 J2 用 WEEKDAY 返回 B2 的默认星期编号。", "In J2, use WEEKDAY to return B2's default weekday number.", "J2 で WEEKDAY を使い、B2 の既定の曜日番号を返します。", "在 J2 用 WEEKDAY 傳回 B2 的預設星期編號。"),
                hint: L("参考：=WEEKDAY(B2)", "Reference: =WEEKDAY(B2)", "参考：=WEEKDAY(B2)", "參考：=WEEKDAY(B2)"),
                success: L("2026-01-05 是星期一，默认编号为 2。", "2026-01-05 is Monday, so the default number is 2.", "2026-01-05 は月曜日なので既定値は2です。", "2026-01-05 是星期一，預設編號為 2。"),
                formula: "=WEEKDAY(B2)",
                expected: 2,
                requiredFunctions: ["WEEKDAY"],
              }),
              manualTask({
                id: "af20-weeknum-task",
                sheet: dateSheet,
                target: "J3",
                taskLabel: L("WEEKNUM", "WEEKNUM", "WEEKNUM", "WEEKNUM"),
                title: L("返回开始日期所在周编号", "Return the week number of the start date", "開始日の週番号を返す", "傳回開始日期所在週編號"),
                lead: L("在 J3 用 WEEKNUM 返回 B2 的周编号。", "In J3, use WEEKNUM to return the week number for B2.", "J3 で WEEKNUM を使い、B2 の週番号を返します。", "在 J3 用 WEEKNUM 傳回 B2 的週編號。"),
                hint: L("参考：=WEEKNUM(B2)", "Reference: =WEEKNUM(B2)", "参考：=WEEKNUM(B2)", "參考：=WEEKNUM(B2)"),
                success: L("2026-01-05 属于第 2 周。", "2026-01-05 falls in week 2.", "2026-01-05 は第2週です。", "2026-01-05 屬於第 2 週。"),
                formula: "=WEEKNUM(B2)",
                expected: 2,
                requiredFunctions: ["WEEKNUM"],
              }),
              manualTask({
                id: "af20-edate-task",
                sheet: dateSheet,
                target: "J4",
                taskLabel: L("EDATE", "EDATE", "EDATE", "EDATE"),
                title: L("计算三个月后的同一天", "Find the same day three months later", "3か月後の同じ日", "計算三個月後的同一天"),
                lead: L("在 J4 用 EDATE 加 3 个月，并用 TEXT 显示为 yyyy-mm-dd。", "In J4, add three months with EDATE and format with TEXT as yyyy-mm-dd.", "J4 で EDATE により3か月足し、TEXT で yyyy-mm-dd 表示にします。", "在 J4 用 EDATE 加 3 個月，並用 TEXT 顯示為 yyyy-mm-dd。"),
                hint: L("参考：=TEXT(EDATE(B2,3),\"yyyy-mm-dd\")", "Reference: =TEXT(EDATE(B2,3),\"yyyy-mm-dd\")", "参考：=TEXT(EDATE(B2,3),\"yyyy-mm-dd\")", "參考：=TEXT(EDATE(B2,3),\"yyyy-mm-dd\")"),
                success: L("结果为 2026-04-05。", "The result is 2026-04-05.", "結果は 2026-04-05 です。", "結果為 2026-04-05。"),
                formula: "=TEXT(EDATE(B2,3),\"yyyy-mm-dd\")",
                expected: "2026-04-05",
                requiredFunctions: ["EDATE", "TEXT"],
              }),
              manualTask({
                id: "af20-eomonth-task",
                sheet: dateSheet,
                target: "J5",
                taskLabel: L("EOMONTH", "EOMONTH", "EOMONTH", "EOMONTH"),
                title: L("返回当月月末", "Return the end of the month", "当月の月末を返す", "傳回當月月底"),
                lead: L("在 J5 用 EOMONTH 返回 B2 当月最后一天，并用 TEXT 格式化。", "In J5, use EOMONTH to return the end of B2's month and format with TEXT.", "J5 で EOMONTH を使い、B2 の月末日を TEXT で表示します。", "在 J5 用 EOMONTH 傳回 B2 當月最後一天，並用 TEXT 格式化。"),
                hint: L("参考：=TEXT(EOMONTH(B2,0),\"yyyy-mm-dd\")", "Reference: =TEXT(EOMONTH(B2,0),\"yyyy-mm-dd\")", "参考：=TEXT(EOMONTH(B2,0),\"yyyy-mm-dd\")", "參考：=TEXT(EOMONTH(B2,0),\"yyyy-mm-dd\")"),
                success: L("结果为 2026-01-31。", "The result is 2026-01-31.", "結果は 2026-01-31 です。", "結果為 2026-01-31。"),
                formula: "=TEXT(EOMONTH(B2,0),\"yyyy-mm-dd\")",
                expected: "2026-01-31",
                requiredFunctions: ["EOMONTH", "TEXT"],
              }),
              manualTask({
                id: "af20-workday-task",
                sheet: dateSheet,
                target: "J6",
                taskLabel: L("WORKDAY", "WORKDAY", "WORKDAY", "WORKDAY"),
                title: L("返回十个工作日后的日期", "Return the date ten workdays later", "10営業日後の日付", "傳回十個工作天後的日期"),
                lead: L("在 J6 用 WORKDAY 从 B2 前进 10 个工作日，并用 TEXT 格式化。", "In J6, use WORKDAY from B2 for ten workdays and format with TEXT.", "J6 で B2 から WORKDAY を10営業日進め、TEXT で表示します。", "在 J6 用 WORKDAY 從 B2 前進 10 個工作天，並用 TEXT 格式化。"),
                hint: L("参考：=TEXT(WORKDAY(B2,10),\"yyyy-mm-dd\")", "Reference: =TEXT(WORKDAY(B2,10),\"yyyy-mm-dd\")", "参考：=TEXT(WORKDAY(B2,10),\"yyyy-mm-dd\")", "參考：=TEXT(WORKDAY(B2,10),\"yyyy-mm-dd\")"),
                success: L("结果为 2026-01-19。", "The result is 2026-01-19.", "結果は 2026-01-19 です。", "結果為 2026-01-19。"),
                formula: "=TEXT(WORKDAY(B2,10),\"yyyy-mm-dd\")",
                expected: "2026-01-19",
                requiredFunctions: ["WORKDAY", "TEXT"],
              }),
              manualTask({
                id: "af20-networkdays-task",
                sheet: dateSheet,
                target: "J7",
                taskLabel: L("NETWORKDAYS", "NETWORKDAYS", "NETWORKDAYS", "NETWORKDAYS"),
                title: L("计算起止日之间的工作日", "Count workdays between start and end", "開始日から終了日までの営業日", "計算起訖日之間的工作天"),
                lead: L("在 J7 用 NETWORKDAYS 计算 B2 到 C2 的工作日数。", "In J7, use NETWORKDAYS from B2 through C2.", "J7 で NETWORKDAYS を使い、B2 から C2 までの営業日数を数えます。", "在 J7 用 NETWORKDAYS 計算 B2 到 C2 的工作天數。"),
                hint: L("参考：=NETWORKDAYS(B2,C2)", "Reference: =NETWORKDAYS(B2,C2)", "参考：=NETWORKDAYS(B2,C2)", "參考：=NETWORKDAYS(B2,C2)"),
                success: L("共有 73 个工作日。", "There are 73 workdays.", "営業日は73日です。", "共有 73 個工作天。"),
                formula: "=NETWORKDAYS(B2,C2)",
                expected: 73,
                requiredFunctions: ["NETWORKDAYS"],
              }),
              manualTask({
                id: "af20-datedif-task",
                sheet: dateSheet,
                target: "J8",
                taskLabel: L("DATEDIF", "DATEDIF", "DATEDIF", "DATEDIF"),
                title: L("计算完整月数", "Count full months between the dates", "満月数を数える", "計算完整月數"),
                lead: L("在 J8 用 DATEDIF 以 M 为单位计算 B2 到 C2。", "In J8, use DATEDIF with M for B2 to C2.", "J8 で DATEDIF の単位 M を使い、B2 から C2 を計算します。", "在 J8 用 DATEDIF 以 M 為單位計算 B2 到 C2。"),
                hint: L("参考：=DATEDIF(B2,C2,\"M\")", "Reference: =DATEDIF(B2,C2,\"M\")", "参考：=DATEDIF(B2,C2,\"M\")", "參考：=DATEDIF(B2,C2,\"M\")"),
                success: L("完整月数为 3。", "There are three full months.", "満月数は3です。", "完整月數為 3。"),
                formula: "=DATEDIF(B2,C2,\"M\")",
                expected: 3,
                requiredFunctions: ["DATEDIF"],
              }),
            ],
            hint: L("工作日函数默认排除周末，不自动排除节假日；真实项目要加节假日范围。", "Workday functions exclude weekends by default but not holidays; real projects should add a holiday range.", "営業日関数は既定で週末を除外しますが、祝日は除外しません。実務では祝日範囲も指定します。", "工作天函數預設排除週末，不自動排除假日；真實專案要加入假日範圍。"),
          }),
        ]
      ),
      level(
        "advanced-finance-db",
        "lesson",
        L("财务、数据库与动态取数", "Finance, database, and dynamic retrieval", "財務・データベース・動的取得", "財務、資料庫與動態取數"),
        [
          learn(
            "af20-finance-teach",
            L("现金流看时间，数据库看条件，动态数组看溢出", "Cash flow reads time, database functions read criteria, and dynamic arrays spill", "キャッシュフローは時間、データベース関数は条件、動的配列はスピルを見る", "現金流看時間，資料庫函數看條件，動態陣列看溢出"),
            L("NPV 把未来现金流折现，IRR 找使净现值为零的折现率。DSUM、DCOUNT、DGET 先读取独立条件区域，再对数据库式表格计算。XLOOKUP 支持从左向右或从右向左查找；FILTER、SORT、UNIQUE 会返回动态数组。", "NPV discounts future cash flows, and IRR finds the rate where net present value is zero. DSUM, DCOUNT, and DGET read a separate criteria range and calculate against a database-style table. XLOOKUP searches in either direction; FILTER, SORT, and UNIQUE return dynamic arrays.", "NPV は将来キャッシュフローを割り引き、IRR は正味現在価値が0になる割引率を求めます。DSUM・DCOUNT・DGET は独立した条件範囲を読み、データベース形式の表を計算します。XLOOKUP は左右どちらにも検索でき、FILTER・SORT・UNIQUE は動的配列を返します。", "NPV 把未來現金流折現，IRR 找使淨現值為零的折現率。DSUM、DCOUNT、DGET 先讀取獨立條件範圍，再對資料庫式表格計算。XLOOKUP 支援從左向右或從右向左查找；FILTER、SORT、UNIQUE 會傳回動態陣列。"),
            [
              L("NPV 默认第一期发生在期末；如果首笔现金流在期初，要单独加上。", "NPV assumes the first period is one period away; add a time-zero cash flow separately.", "NPV は最初の期間が1期後にあると仮定します。時点0のキャッシュフローは別に加えます。", "NPV 預設第一期發生在期末；如果首筆現金流在期初，要單獨加上。"),
              L("IRR 可能无解或有多个解，尤其现金流符号反复变化；结果要结合 NPV 检查。", "IRR may have no solution or multiple solutions when cash-flow signs alternate; check it against NPV.", "キャッシュフローの符号が何度も変わると、IRR は解なし・複数解になり得ます。NPV と併せて確認します。", "IRR 可能無解或有多個解，尤其現金流正負號反覆變化；結果要結合 NPV 檢查。"),
              L("数据库函数的条件区域第一行必须是字段名，且不能与源表重叠。", "A database function criteria range needs headers in its first row and must not overlap the source table.", "データベース関数の条件範囲は1行目がフィールド名で、元表と重ねません。", "資料庫函數的條件範圍第一列必須是欄位名稱，且不能與來源表重疊。"),
              L("XLOOKUP 的返回区域与查找区域要同高；找不到时可使用第四参数返回提示。", "XLOOKUP's return and lookup arrays must have the same height; use the fourth argument for a not-found message.", "XLOOKUP の戻り範囲と検索範囲は同じ高さにし、見つからない場合は第4引数で表示を返します。", "XLOOKUP 的傳回範圍與查找範圍要同高；找不到時可使用第四參數傳回提示。"),
            ],
            L("先确定现金流时点、条件区域和溢出空间，再写公式；财务模型的单位要统一。", "Confirm cash-flow timing, criteria area, and spill space before writing formulas; keep model units consistent.", "キャッシュフローの時点・条件範囲・スピル余白を確認してから式を書き、単位を統一します。", "先確定現金流時點、條件區域和溢出空間，再寫公式；財務模型的單位要統一。"),
            L("所有比率都写清年化还是期间值；不要让读者猜 0.12 是 12% 还是 0.12%。", "State whether rates are annual or periodic; do not make readers guess whether 0.12 means 12% or 0.12%.", "比率は年率か期間率かを明記し、0.12 が12%なのか0.12%なのか推測させません。", "所有比率都寫清年化還是期間值；不要讓讀者猜 0.12 是 12% 還是 0.12%。")
          ),
          K.sheetStep({
            id: "af20-finance-practice",
            title: L("财务函数练习：净现值与内部收益率", "Finance practice: NPV and IRR", "財務関数練習：NPV と IRR", "財務函數練習：淨現值與內部報酬率"),
            lead: L("项目现金流在 B2:B7，首笔 -200000 已按年 0 计入。请在 J2、J3 计算 10% 折现率下的净现值和内部收益率。", "Project cash flows are in B2:B7, with -200000 at year zero. Calculate NPV at 10% and IRR in J2 and J3.", "プロジェクトのキャッシュフローは B2:B7 にあり、-200000 は年0として入っています。J2・J3 で割引率10%の NPV と IRR を求めます。", "專案現金流在 B2:B7，首筆 -200000 已按年 0 計入。請在 J2、J3 計算 10% 折現率下的淨現值和內部報酬率。"),
            sheet: financeSheet,
            tasks: [
              manualTask({
                id: "af20-npv-task",
                sheet: financeSheet,
                target: "J2",
                taskLabel: L("NPV", "NPV", "NPV", "NPV"),
                title: L("按 10% 计算项目净现值", "Calculate project NPV at 10%", "割引率10%で NPV を計算", "依 10% 計算專案淨現值"),
                lead: L("在 J2 用 NPV 对 B3:B7 折现，再加上期初 B2，并用 ROUND 保留两位。", "In J2, discount B3:B7 with NPV, add the time-zero B2, and round to two decimals.", "J2 で B3:B7 を NPV で割り引き、時点0の B2 を加え、小数2桁に丸めます。", "在 J2 用 NPV 對 B3:B7 折現，再加上期初 B2，並用 ROUND 保留兩位。"),
                hint: L("参考：=ROUND(NPV(0.1,B3:B7)+B2,2)", "Reference: =ROUND(NPV(0.1,B3:B7)+B2,2)", "参考：=ROUND(NPV(0.1,B3:B7)+B2,2)", "參考：=ROUND(NPV(0.1,B3:B7)+B2,2)"),
                success: L("净现值为 13271.88，项目在 10% 折现率下为正。", "NPV is 13271.88, positive at a 10% discount rate.", "NPV は13271.88で、割引率10%では正です。", "淨現值為 13271.88，專案在 10% 折現率下為正。"),
                formula: "=ROUND(NPV(0.1,B3:B7)+B2,2)",
                expected: 13271.88,
                requiredFunctions: ["NPV", "ROUND"],
              }),
              manualTask({
                id: "af20-irr-task",
                sheet: financeSheet,
                target: "J3",
                taskLabel: L("IRR", "IRR", "IRR", "IRR"),
                title: L("计算项目内部收益率", "Calculate the project IRR", "プロジェクトの IRR を計算", "計算專案內部報酬率"),
                lead: L("在 J3 用 IRR 计算 B2:B7，并用 ROUND 保留四位小数。", "In J3, use IRR on B2:B7 and round to four decimals.", "J3 で B2:B7 に IRR を使い、小数4桁に丸めます。", "在 J3 用 IRR 計算 B2:B7，並用 ROUND 保留四位小數。"),
                hint: L("参考：=ROUND(IRR(B2:B7),4)", "Reference: =ROUND(IRR(B2:B7),4)", "参考：=ROUND(IRR(B2:B7),4)", "參考：=ROUND(IRR(B2:B7),4)"),
                success: L("内部收益率约为 0.1238，即 12.38%。", "IRR is about 0.1238, or 12.38%.", "IRR は約0.1238、つまり12.38%です。", "內部報酬率約為 0.1238，即 12.38%。"),
                formula: "=ROUND(IRR(B2:B7),4)",
                expected: 0.1238,
                requiredFunctions: ["IRR", "ROUND"],
              }),
            ],
            hint: L("NPV 的第二参数不包含期初现金流；若把 B2 放进函数，会重复计算。", "NPV's second argument excludes time-zero cash flow; including B2 would double count it.", "NPV の第2引数に時点0のキャッシュフローを含めると二重計上になります。", "NPV 的第二參數不含期初現金流；若把 B2 放進函數，會重複計算。"),
          }),
          K.sheetStep({
            id: "af20-database-practice",
            title: L("数据库函数练习：条件区域取数", "Database practice: criteria-range calculations", "データベース関数練習：条件範囲から集計", "資料庫函數練習：條件區域取數"),
            lead: L("H1:H2 是部门条件，J1:K2 是唯一记录条件。请在 M2:M4 完成销售金额、记录数和唯一记录金额。", "H1:H2 holds the department criteria and J1:K2 defines the unique record. Calculate sales amount, record count, and unique amount in M2:M4.", "H1:H2 は部署条件、J1:K2 は一意記録の条件です。M2:M4 で営業金額・件数・一意記録金額を求めます。", "H1:H2 是部門條件，J1:K2 是唯一紀錄條件。請在 M2:M4 完成銷售金額、紀錄數和唯一紀錄金額。"),
            sheet: databaseSheet,
            tasks: [
              manualTask({
                id: "af20-dsum-task",
                sheet: databaseSheet,
                target: "M2",
                taskLabel: L("DSUM", "DSUM", "DSUM", "DSUM"),
                title: L("汇总销售部门金额", "Total the Sales department amount", "営業部署の金額を集計", "彙總銷售部門金額"),
                lead: L("在 M2 用 DSUM 对 A1:D7 求和，字段引用标题 C1，条件区域 H1:H2。", "In M2, use DSUM on A1:D7 with the field heading C1 and criteria H1:H2.", "M2 で DSUM を使い、A1:D7 の見出し C1 をフィールドにして H1:H2 の条件で合計します。", "在 M2 用 DSUM 對 A1:D7 求和，欄位參照標題 C1，條件區域 H1:H2。"),
                hint: L("参考：=DSUM(A1:D7,$C$1,H1:H2)", "Reference: =DSUM(A1:D7,$C$1,H1:H2)", "参考：=DSUM(A1:D7,$C$1,H1:H2)", "參考：=DSUM(A1:D7,$C$1,H1:H2)"),
                success: L("销售金额为 28000。", "The Sales amount is 28000.", "営業金額は28000です。", "銷售金額為 28000。"),
                formula: "=DSUM(A1:D7,$C$1,H1:H2)",
                expected: 28000,
                requiredFunctions: ["DSUM"],
              }),
              manualTask({
                id: "af20-dcount-task",
                sheet: databaseSheet,
                target: "M3",
                taskLabel: L("DCOUNT", "DCOUNT", "DCOUNT", "DCOUNT"),
                title: L("统计销售部门金额记录数", "Count Sales amount records", "営業金額の記録数を数える", "統計銷售部門金額紀錄數"),
                lead: L("在 M3 用 DCOUNT 以标题 C1 为字段，对 H1:H2 条件计数。", "In M3, use DCOUNT with the C1 heading as the field and criteria H1:H2.", "M3 で DCOUNT を使い、見出し C1 をフィールドにして H1:H2 条件で数えます。", "在 M3 用 DCOUNT 以標題 C1 為欄位，對 H1:H2 條件計數。"),
                hint: L("参考：=DCOUNT(A1:D7,$C$1,H1:H2)", "Reference: =DCOUNT(A1:D7,$C$1,H1:H2)", "参考：=DCOUNT(A1:D7,$C$1,H1:H2)", "參考：=DCOUNT(A1:D7,$C$1,H1:H2)"),
                success: L("共有 3 条销售金额记录。", "There are three Sales amount records.", "営業金額の記録は3件です。", "共有 3 筆銷售金額紀錄。"),
                formula: "=DCOUNT(A1:D7,$C$1,H1:H2)",
                expected: 3,
                requiredFunctions: ["DCOUNT"],
              }),
              manualTask({
                id: "af20-dget-task",
                sheet: databaseSheet,
                target: "M4",
                taskLabel: L("DGET", "DGET", "DGET", "DGET"),
                title: L("读取唯一匹配记录金额", "Retrieve the unique matching amount", "一意に一致する金額を取得", "讀取唯一符合紀錄金額"),
                lead: L("在 M4 用 DGET 以标题 C1 为字段，对 J1:K2 条件取唯一值。", "In M4, use DGET with the C1 heading as the field and criteria J1:K2.", "M4 で DGET を使い、見出し C1 をフィールドにして J1:K2 条件から一意の値を取得します。", "在 M4 用 DGET 以標題 C1 為欄位，對 J1:K2 條件取唯一值。"),
                hint: L("参考：=DGET(A1:D7,$C$1,J1:K2)", "Reference: =DGET(A1:D7,$C$1,J1:K2)", "参考：=DGET(A1:D7,$C$1,J1:K2)", "參考：=DGET(A1:D7,$C$1,J1:K2)"),
                success: L("唯一匹配金额为 7000；若条件返回多行，DGET 会报错。", "The unique amount is 7000; if criteria match multiple rows, DGET errors.", "一意の金額は7000です。複数行が一致すると DGET はエラーになります。", "唯一符合金額為 7000；若條件傳回多列，DGET 會出錯。"),
                formula: "=DGET(A1:D7,$C$1,J1:K2)",
                expected: 7000,
                requiredFunctions: ["DGET"],
              }),
            ],
            hint: L("字段名必须与表头一致；DGET 只适合唯一匹配，不确定唯一性时用 DSUM 或 DCOUNT。", "Field names must match headers; use DGET only for unique matches, otherwise DSUM or DCOUNT.", "フィールド名は表頭と一致させ、DGET は一意一致のときだけ使います。", "欄位名稱必須與表頭一致；DGET 只適合唯一符合，不確定唯一性時用 DSUM 或 DCOUNT。"),
          }),
        ]
      ),
      level(
        "advanced-dynamic-office",
        "lesson",
        L("动态数组与交叉取数", "Dynamic arrays and cross-direction retrieval", "動的配列と双方向の取得", "動態陣列與交叉取數"),
        [
          learn(
            "af20-dynamic-teach",
            L("让结果自己决定大小", "Let the result decide its own size", "結果が自分の大きさを決める", "讓結果自己決定大小"),
            L("XLOOKUP 用一个查找值返回对应数组；FILTER 按条件返回多行；SORT 和 UNIQUE 可以嵌套。结果会溢出，公式只写在左上角。动态数组让报表随源数据变化，但也要求预留空白区域。", "XLOOKUP returns a value from a corresponding array; FILTER returns rows by condition; SORT and UNIQUE can nest. Results spill, so the formula is written only at the top-left. Dynamic arrays update with source data but need reserved empty space.", "XLOOKUP は1つの検索値から対応配列の値を返し、FILTER は条件で複数行を返し、SORT と UNIQUE は入れ子にできます。結果はスピルするため、式は左上だけに書きます。動的配列は元データに追従しますが、空白領域の確保が必要です。", "XLOOKUP 用一個查找值傳回對應陣列；FILTER 依條件傳回多列；SORT 和 UNIQUE 可以巢狀。結果會溢出，公式只寫在左上角。動態陣列讓報表隨來源資料變化，但也要求預留空白區域。"),
            [
              L("XLOOKUP 的 if_not_found 参数可把 #N/A 换成可读提示。", "XLOOKUP's if_not_found argument can replace #N/A with a readable message.", "XLOOKUP の if_not_found 引数で #N/A を読みやすい表示に替えられます。", "XLOOKUP 的 if_not_found 參數可把 #N/A 換成可讀提示。"),
              L("FILTER 的 include 条件可以引用其他列，返回区域可包含多列；不要只选一列。", "FILTER's include condition can reference other columns while returning multiple columns; do not return only one column by mistake.", "FILTER の include 条件は他の列を参照でき、複数列を返せます。1列だけ返さないよう注意します。", "FILTER 的 include 條件可以參照其他欄，傳回區域可包含多欄；不要只選一欄。"),
              L("SORT 的第二参数是排序索引，第三参数是方向；UNIQUE 可指定按行还是按列去重。", "SORT's second argument is the sort index and third is direction; UNIQUE can deduplicate by row or column.", "SORT の第2引数は並べ替え列、第3引数は方向、UNIQUE は行または列で重複を除けます。", "SORT 的第二參數是排序索引，第三參數是方向；UNIQUE 可指定依列還是依欄去重。"),
              L("动态数组结果不能与其他内容重叠；旧的 Ctrl+Shift+Enter 数组公式仍需按原方式维护。", "Dynamic-array results must not overlap other content; legacy Ctrl+Shift+Enter arrays still require their original maintenance.", "動的配列の結果は他の内容と重ねられません。従来の Ctrl+Shift+Enter 配列は元の方法で保守します。", "動態陣列結果不能與其他內容重疊；舊的 Ctrl+Shift+Enter 陣列公式仍需依原方式維護。"),
            ],
            L("把动态数组放在专用输出区，左边写清条件，右边留白；不要把它们塞进已有汇总表中间。", "Put dynamic arrays in a dedicated output area, with conditions on the left and empty space to the right; do not squeeze them into an existing summary table.", "動的配列は専用の出力領域に置き、条件を左、余白を右に確保します。既存の集計表の途中に入れません。", "把動態陣列放在專用輸出區，左邊寫清條件，右邊留白；不要把它們塞進既有彙總表中間。"),
            L("动态数组适合预览和分析，正式交付前要检查旧版兼容性和打印分页。", "Dynamic arrays suit previews and analysis; before formal delivery, check legacy compatibility and print pagination.", "動的配列はプレビューや分析に向きます。正式提出前に旧版互換性と印刷改ページを確認します。", "動態陣列適合預覽和分析，正式交付前要檢查舊版相容性和列印分頁。")
          ),
          K.sheetStep({
            id: "af20-dynamic-practice",
            title: L("动态取数练习：XLOOKUP、SORT 与 FILTER", "Dynamic practice: XLOOKUP, SORT, and FILTER", "動的取得練習：XLOOKUP・SORT・FILTER", "動態取數練習：XLOOKUP、SORT 與 FILTER"),
            lead: L("结果区 J2:J5 依次检查编号查找、唯一部门数、最低分和高于 85 的行数。", "The result area J2:J5 checks ID lookup, unique department count, lowest score, and rows above 85.", "結果領域 J2:J5 で、ID 検索・一意部署数・最低点・85超の行数を確認します。", "結果區 J2:J5 依次檢查編號查找、唯一部門數、最低分和高於 85 的列數。"),
            sheet: dynamicSheet,
            tasks: [
              manualTask({
                id: "af20-xlookup-task",
                sheet: dynamicSheet,
                target: "J2",
                taskLabel: L("XLOOKUP", "XLOOKUP", "XLOOKUP", "XLOOKUP"),
                title: L("查找 E-1004 的得分", "Look up the E-1004 score", "E-1004 の得点を検索", "查找 E-1004 的得分"),
                lead: L("在 J2 用 XLOOKUP 在 A2:A9 查找 E-1004，从 C2:C9 返回得分。", "In J2, use XLOOKUP on A2:A9 for E-1004 and return the score from C2:C9.", "J2 で XLOOKUP を使い、A2:A9 の E-1004 から C2:C9 の得点を返します。", "在 J2 用 XLOOKUP 在 A2:A9 查找 E-1004，從 C2:C9 傳回得分。"),
                hint: L("参考：=XLOOKUP(\"E-1004\",A2:A9,C2:C9)", "Reference: =XLOOKUP(\"E-1004\",A2:A9,C2:C9)", "参考：=XLOOKUP(\"E-1004\",A2:A9,C2:C9)", "參考：=XLOOKUP(\"E-1004\",A2:A9,C2:C9)"),
                success: L("E-1004 的得分为 85。", "E-1004 has a score of 85.", "E-1004 の得点は85です。", "E-1004 的得分為 85。"),
                formula: "=XLOOKUP(\"E-1004\",A2:A9,C2:C9)",
                expected: 85,
                requiredFunctions: ["XLOOKUP"],
              }),
              manualTask({
                id: "af20-unique-count-task",
                sheet: dynamicSheet,
                target: "J3",
                taskLabel: L("UNIQUE 计数", "UNIQUE count", "UNIQUE 件数", "UNIQUE 計數"),
                title: L("统计唯一部门数", "Count unique departments", "一意の部署数を数える", "統計唯一部門數"),
                lead: L("在 J3 用 COUNTA 包住 UNIQUE(B2:B9)，统计唯一部门数。", "In J3, wrap COUNTA around UNIQUE(B2:B9) to count departments.", "J3 で UNIQUE(B2:B9) を COUNTA で包み、部署数を数えます。", "在 J3 用 COUNTA 包住 UNIQUE(B2:B9)，統計唯一部門數。"),
                hint: L("参考：=COUNTA(UNIQUE(B2:B9))", "Reference: =COUNTA(UNIQUE(B2:B9))", "参考：=COUNTA(UNIQUE(B2:B9))", "參考：=COUNTA(UNIQUE(B2:B9))"),
                success: L("唯一部门为 4 个。", "There are four unique departments.", "一意の部署は4つです。", "唯一部門為 4 個。"),
                formula: "=COUNTA(UNIQUE(B2:B9))",
                expected: 4,
                requiredFunctions: ["COUNTA", "UNIQUE"],
              }),
              manualTask({
                id: "af20-sort-index-task",
                sheet: dynamicSheet,
                target: "J4",
                taskLabel: L("SORT 取首项", "SORT first value", "SORT の先頭値", "SORT 取首項"),
                title: L("用 SORT 取最低得分", "Use SORT to return the lowest score", "SORT で最低点を取る", "用 SORT 取最低得分"),
                lead: L("在 J4 用 SORT 对 C2:C9 升序，再通过 INDEX 取第 1 项。", "In J4, sort C2:C9 ascending and use INDEX to take the first value.", "J4 で C2:C9 を昇順に SORT し、INDEX で先頭を取ります。", "在 J4 用 SORT 對 C2:C9 遞增，再透過 INDEX 取第 1 項。"),
                hint: L("参考：=INDEX(SORT(C2:C9),1)", "Reference: =INDEX(SORT(C2:C9),1)", "参考：=INDEX(SORT(C2:C9),1)", "參考：=INDEX(SORT(C2:C9),1)"),
                success: L("最低分是 67。", "The lowest score is 67.", "最低点は67です。", "最低分是 67。"),
                formula: "=INDEX(SORT(C2:C9),1)",
                expected: 67,
                requiredFunctions: ["INDEX", "SORT"],
              }),
              manualTask({
                id: "af20-filter-rows-task",
                sheet: dynamicSheet,
                target: "J5",
                taskLabel: L("FILTER 计数", "FILTER count", "FILTER 件数", "FILTER 計數"),
                title: L("统计得分高于 85 的行数", "Count rows with scores above 85", "85超の得点行を数える", "統計得分高於 85 的列數"),
                lead: L("在 J5 用 ROWS(FILTER(...)) 统计 A2:A9 中 C 列大于 85 的行数。", "In J5, use ROWS(FILTER(...)) for A2:A9 where column C is above 85.", "J5 で ROWS(FILTER(...)) を使い、A2:A9 のうち C列が85超の行数を数えます。", "在 J5 用 ROWS(FILTER(...)) 統計 A2:A9 中 C 欄大於 85 的列數。"),
                hint: L("参考：=ROWS(FILTER(A2:A9,C2:C9>85))", "Reference: =ROWS(FILTER(A2:A9,C2:C9>85))", "参考：=ROWS(FILTER(A2:A9,C2:C9>85))", "參考：=ROWS(FILTER(A2:A9,C2:C9>85))"),
                success: L("共有 4 行高于 85。", "Four rows are above 85.", "85を超える行は4行です。", "共有 4 列高於 85。"),
                formula: "=ROWS(FILTER(A2:A9,C2:C9>85))",
                expected: 4,
                requiredFunctions: ["ROWS", "FILTER"],
              }),
            ],
            hint: L("动态结果的尺寸用 ROWS 或 COUNTA 统计；不要把 FILTER 结果全部写进同一单格。", "Measure dynamic results with ROWS or COUNTA; do not force a full FILTER result into one cell.", "動的結果の大きさは ROWS や COUNTA で測り、FILTER の全結果を1セルに押し込みません。", "動態結果的尺寸用 ROWS 或 COUNTA 統計；不要把 FILTER 結果全部寫進同一儲存格。"),
          }),
          lab(
            "af20-filter-lab",
            L("迁移实验：新公式预览收入大户", "Transfer lab: preview high-revenue accounts with a new formula", "転用実験：高収入案件を新式でプレビュー", "遷移實驗：用新公式預覽高收入客戶"),
            L("请在 E2 用动态数组预览 A2:C9 中收入超过 1000 的行，公式为 =FILTER(A2:C9,C2:C9>1000)。", "At E2, preview rows from A2:C9 with revenue above 1000 using =FILTER(A2:C9,C2:C9>1000).", "E2 で A2:C9 の収入が1000超の行を =FILTER(A2:C9,C2:C9>1000) でプレビューします。", "請在 E2 用動態陣列預覽 A2:C9 中收入超過 1000 的列，公式為 =FILTER(A2:C9,C2:C9>1000)。"),
            {
              kind: "analysis",
              mode: "array",
              sheet: arraySheet,
              ranges: { source: "A2:C9", output: "E2" },
              options: { formula: "=FILTER(A2:C9,C2:C9>1000)" },
              goal: { operation: "array", formulaCell: "E2", formula: "=FILTER(A2:C9,C2:C9>1000)" },
            },
            L("在 E2 输入完整公式，确认右侧和下方没有遮挡内容，再按 Enter 允许溢出。", "Enter the full formula at E2, make sure the spill area is clear, and press Enter.", "E2 に式を入力し、スピル領域が空いていることを確認して Enter を押します。", "在 E2 輸入完整公式，確認右側和下方沒有遮擋內容，再按 Enter 允許溢出。"),
            L("高收入记录已动态溢出，收入列仍保持原始数值。", "High-revenue records spill dynamically and the revenue values remain source values.", "高収入記録が動的にスピルし、収入列は元の値のままです。", "高收入紀錄已動態溢出，收入欄仍保持原始數值。")
          ),
          lab(
            "af20-unique-sort-lab",
            L("复习实验：唯一团队排序", "Review lab: sort unique teams", "復習実験：一意のチームを並べ替え", "複習實驗：唯一團隊排序"),
            L("请在 H2 用 SORT(UNIQUE(B2:B9)) 生成升序团队清单，并与 F2 的唯一列表区分。", "At H2, use SORT(UNIQUE(B2:B9)) to create an ascending team list, separate from the unique list at F2.", "H2 で SORT(UNIQUE(B2:B9)) を使い、昇順のチーム一覧を作り、F2 の一意一覧と分けます。", "請在 H2 用 SORT(UNIQUE(B2:B9)) 產生遞增團隊清單，並與 F2 的唯一清單區分。"),
            {
              kind: "analysis",
              mode: "array",
              sheet: arraySheet,
              ranges: { teams: "B2:B9", output: "H2" },
              options: { formula: "=SORT(UNIQUE(B2:B9))" },
              goal: { operation: "array", formulaCell: "H2", formula: "=SORT(UNIQUE(B2:B9))" },
            },
            L("输入 =SORT(UNIQUE(B2:B9))，不要手工排序唯一列表；源团队变化后结果会自动更新。", "Enter =SORT(UNIQUE(B2:B9)) instead of manually sorting the unique list; results update with the source teams.", "=SORT(UNIQUE(B2:B9)) を入力し、一意一覧を手作業で並べ替えません。元チームの変化に自動追従します。", "輸入 =SORT(UNIQUE(B2:B9))，不要手動排序唯一清單；來源團隊變更後結果會自動更新。"),
            L("唯一团队清单已按升序溢出，和未排序的唯一列表形成清楚对照。", "Unique teams spill in ascending order and contrast clearly with the unsorted unique list.", "一意チームが昇順でスピルし、未並べ替えの一意一覧と明確に比較できます。", "唯一團隊清單已依遞增溢出，和未排序的唯一清單形成清楚對照。")
          ),
        ]
      ),
      level(
        "advanced-office-capstone",
        "exam",
        L("综合办公：多部门季度复盘", "Integrated office: multi-department quarterly review", "総合業務：複数部署の四半期レビュー", "綜合辦公：多部門季度複盤"),
        [
          learn(
            "af20-capstone-teach",
            L("周一下午，三个部门共用一张季度表", "Monday afternoon, three departments share one quarterly sheet", "月曜午後、3部署が1つの四半期表を共有", "星期一下午，三個部門共用一張季度表"),
            L("运营、市场、产品和支持团队把收入、成本、状态和人数汇总到同一张表。财务要先确认部门口径，再从不同工作表做 3-D 汇总，最后用透视表和管理公式核对结论。", "Operations, Marketing, Product, and Support have combined revenue, cost, status, and headcount in one table. Finance must first confirm the department definitions, then build a 3-D summary from separate sheets, and finally verify conclusions with a PivotTable and management formulas.", "運営・マーケティング・製品・サポートが収入・原価・状態・人数を1つの表にまとめました。経理は部署の定義を確認し、別シートから3D集計を作り、最後にピボットテーブルと管理用数式で結論を照合します。", "營運、行銷、產品和支援團隊把收入、成本、狀態與人數彙總到同一張表。財務要先確認部門定義，再從不同工作表做 3D 彙總，最後用樞紐分析表和管理公式核對結論。"),
            [
              L("部门名称必须与源表一致；中文、英文、代码混用会让条件求和重复或漏项。", "Department names must match the source; mixing Chinese, English, and codes can double count or omit conditions.", "部署名は元表と一致させます。中国語・英語・コードを混在させると集計の重複や漏れが起きます。", "部門名稱必須與來源表一致；中文、英文、代碼混用會讓條件求和重複或漏項。"),
              L("3-D 引用汇总结构相同的部门页，透视表负责横向比较，二者应给出相同总量。", "A 3-D reference totals structurally identical department pages, while a PivotTable supports cross-comparison; both should agree on the grand total.", "3D参照は同じ構成の部署シートを集計し、ピボットテーブルは横比較を担います。総計が一致するはずです。", "3D 參照彙總結構相同的部門工作表，樞紐分析表負責橫向比較，兩者應給出相同總量。"),
              L("收入、成本、人数是不同单位，不要用 SUM 把人数和金额混在一起。", "Revenue, cost, and headcount use different units; do not SUM headcount together with money.", "収入・原価・人数は単位が違うため、人数と金額を一緒に SUM しません。", "收入、成本、人數是不同單位，不要用 SUM 把人数和金額混在一起。"),
              L("最终复盘要同时给出总量、结构和待办动作，不能只交一张漂亮的图。", "The final review needs totals, structure, and required actions, not just a polished chart.", "最終レビューには合計・構造・必要な対応を示し、きれいなグラフだけを提出しません。", "最終複盤要同時給出總量、結構和待辦動作，不能只交一張漂亮的圖。"),
            ],
            L("先核对同一部门在所有表里的名称，再做 3-D 汇总和透视；任一总量不一致都回到源表。", "Verify department names across every sheet before 3-D summaries and pivots; if totals disagree, return to the source.", "すべてのシートで部署名を確認してから3D集計とピボットを作り、合計が違えば元表へ戻ります。", "先核對同一部門在所有表裡的名稱，再做 3D 彙總和樞紐；任一總量不一致都回到來源表。"),
            L("多部门模型的交付说明要写清：数据截止日、部门口径、含税/未税、人数是否含外包。", "The handoff must state the data cutoff, department definitions, tax basis, and whether headcount includes contractors.", "引き継ぎには締め日・部署定義・税込/税抜・人数に外部スタッフを含むかを明記します。", "多部門模型的交付說明要寫清：資料截止日、部門定義、含稅／未稅、人數是否含外包。")
          ),
          lab(
            "af20-capstone-multisheet-lab",
            L("综合实验一：汇总三个部门的季度收入", "Integrated lab 1: total quarterly revenue across three departments", "総合実験1：3部署の四半期収入を集計", "綜合實驗一：彙總三個部門的季度收入"),
            L("Summary 的 B2 需要汇总 Operations、Marketing、Support 三张结构相同工作表的 C2:C9。请写入 3-D SUM 公式。", "Summary B2 must total C2:C9 across the identically structured Operations, Marketing, and Support sheets. Enter a 3-D SUM formula.", "Summary の B2 は、同じ構成の Operations・Marketing・Support の C2:C9 を合計します。3D SUM を入力してください。", "Summary 的 B2 需要彙總 Operations、Marketing、Support 三張結構相同工作表的 C2:C9。請寫入 3D SUM 公式。"),
            {
              kind: "workbook",
              mode: "multiSheet",
              workbook: {
                active: "Summary",
                sheets: [
                  { name: "Operations", cells: K.makeSheet([L("项目", "Item", "項目", "項目"), L("收入", "Revenue", "収入", "收入")], [[L("北区", "North", "北", "北區"), 42000], [L("南区", "South", "南", "南區"), 38000]]), tabColor: "blue", hidden: false },
                  { name: "Marketing", cells: K.makeSheet([L("项目", "Item", "項目", "項目"), L("收入", "Revenue", "収入", "收入")], [[L("北区", "North", "北", "北區"), 31000], [L("西区", "West", "西", "西區"), 29000]]), tabColor: "blue", hidden: false },
                  { name: "Support", cells: K.makeSheet([L("项目", "Item", "項目", "項目"), L("收入", "Revenue", "収入", "收入")], [[L("北区", "North", "北", "北區"), 26000], [L("西区", "West", "西", "西區"), 24000]]), tabColor: "blue", hidden: false },
                  { name: "Summary", cells: { A1: L("汇总项目", "Summary item", "集計項目", "彙總項目"), B1: L("三部门收入", "Three-department revenue", "3部署収入", "三部門收入"), A2: L("季度合计", "Quarter total", "四半期合計", "季度合計") }, tabColor: "green", hidden: false },
                ],
              },
              ranges: { departments: "Operations:Support!C2:C9", target: "Summary!B2" },
              options: { formula: "=SUM(Operations:Support!C2:C9)" },
              goal: { operation: "formula", sheet: "Summary", cell: "B2", formula: "=SUM(Operations:Support!C2:C9)" },
            },
            L("使用首表:末表!区域的形式：=SUM(Operations:Support!C2:C9)；确保中间三张部门表顺序正确。", "Use first:last!range: =SUM(Operations:Support!C2:C9), with the three department sheets in the correct order.", "先頭:末尾!範囲 の形で =SUM(Operations:Support!C2:C9) とします。3つの部署シート順を確認します。", "使用首表:末表!範圍的形式：=SUM(Operations:Support!C2:C9)；確保中間三張部門表順序正確。"),
            L("三部门收入已汇总为 190000，和部门页合计一致。", "The three-department total is 190000 and matches the department pages.", "3部署の合計は190000で、各部署シートの合計と一致します。", "三部門收入已彙總為 190000，和部門頁合計一致。")
          ),
          lab(
            "af20-capstone-pivot-lab",
            L("综合实验二：透视部门与状态", "Integrated lab 2: pivot departments by status", "総合実験2：部署と状態でピボット", "綜合實驗二：樞紐部門與狀態"),
            L("请以同一部门表 A1:F9 为源，在 H2 建立透视表：行放部门，列放状态，值用收入求和，便于核对已结案与待处理。", "Use the same A1:F9 department table as the source and create a PivotTable at H2 with Department in rows, Status in columns, and Sum of Revenue in values for checking closed versus pending work.", "同じ A1:F9 の部署表を元に H2 にピボットテーブルを作成し、行に部署、列に状態、値に収入の合計を置いて、完了と処理待ちを確認します。", "請以同一部門表 A1:F9 為來源，在 H2 建立樞紐分析表：列放部門，欄放狀態，值用收入求和，便於核對已結案與待處理。"),
            {
              kind: "visual",
              mode: "pivot",
              sheet: capstoneSheet,
              ranges: { source: "A1:F9", destination: "H2" },
              options: { rows: ["A"], columns: ["E"], values: [{ field: "C", aggregate: "SUM" }] },
              goal: {
                operation: "pivot",
                sourceRange: "A1:F9",
                destination: "H2",
                rows: ["A"],
                columns: ["E"],
                values: [{ field: "C", aggregate: "SUM" }],
                filters: [],
                showAs: "normal",
                groupDate: "none",
                slicer: false,
              },
            },
            L("源表要选 A1:F9，不要把 I/J 结果区一起选进去；透视表放在 H2 时下方要留空。", "Select A1:F9 as the source without the I/J result area, and leave space below H2 for the PivotTable.", "元表は A1:F9 を選び、I/J の結果領域を含めません。H2 の下に余白を残します。", "來源表要選 A1:F9，不要把 I/J 結果區一起選進去；樞紐表放在 H2 時下方要留空。"),
            L("部门与状态的收入矩阵已生成，可与 3-D 总收入和公式结果相互核对。", "The department-by-status revenue matrix is ready to reconcile with the 3-D total and formula results.", "部署と状態の収入マトリクスができ、3D合計や数式結果と照合できます。", "部門與狀態的收入矩陣已產生，可與 3D 總收入和公式結果相互核對。")
          ),
          K.sheetStep({
            id: "af20-capstone-formulas",
            title: L("综合实验三：管理公式复核", "Integrated lab 3: management formula review", "総合実験3：管理用数式の確認", "綜合實驗三：管理公式複核"),
            lead: L("在同一张多部门表上完成运营收入、待处理记录和整体成本收入比，三项结果写入 J2:J4。", "On the same multi-department table, calculate Operations revenue, pending records, and the overall cost-to-revenue ratio in J2:J4.", "同じ複数部署表で、運営収入・処理待ち件数・全体の原価収入比を計算し、J2:J4 に入れます。", "在同一張多部門表上完成營運收入、待處理紀錄和整體成本收入比，三項結果寫入 J2:J4。"),
            sheet: capstoneSheet,
            tasks: capstoneFormulaTasks,
            hint: L("SUMIFS 的参数顺序是求和区域在前；COUNTIFS 和 ROUND 按结果区标签逐一核对。", "SUMIFS puts the sum range first; check COUNTIFS and ROUND against each result label.", "SUMIFS は合計範囲が先頭です。COUNTIFS と ROUND は結果ラベルごとに確認します。", "SUMIFS 的參數順序是求和區域在前；COUNTIFS 和 ROUND 依結果區標籤逐一核對。"),
          }),
        ]
      ),
    ],
  });
})();
