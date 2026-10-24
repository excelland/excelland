(function () {
  "use strict";

  const D = window.CourseData;
  const K = window.CurriculumKit;
  const baseL = K.L;
  const fill = K.fill;
  const task = K.task;

  const REGION_TW = {
    "华东": "東區",
    "华北": "北區",
    "华南": "南區",
    "西南": "西部",
  };

  function L(zh, en, ja, zhTW) {
    let traditional = zhTW == null ? String(zh == null ? "" : zh) : String(zhTW);
    [["華東", "東區"], ["東部", "東區"], ["華北", "北區"], ["北部", "北區"], ["中區", "北區"], ["華南", "南區"], ["南部", "南區"], ["西南部", "西部"], ["西南區", "西部"]].forEach(([source, target]) => {
      traditional = traditional.split(source).join(target);
    });
    Object.keys(REGION_TW).forEach((source) => {
      if (!String(zh == null ? "" : zh).includes(source)) return;
      traditional = traditional.split(source).join(REGION_TW[source]);
    });
    return baseL(zh, en, ja, traditional);
  }

  function learn(id, title, lead, points, tip, example, extra) {
    return D.learnStep(id, title, lead, points, tip, example, extra);
  }

  function practice(spec) {
    return K.sheetStep(spec);
  }

  function level(id, kind, title, steps, extra) {
    return Object.assign({ id, kind, title, steps }, extra || {});
  }

  function writeBlock(sheet, startRow, headers, rows) {
    headers.forEach((value, index) => {
      sheet[K.columnName(index + 1) + startRow] = value;
    });
    rows.forEach((row, rowIndex) => {
      row.forEach((value, columnIndex) => {
        sheet[K.columnName(columnIndex + 1) + (startRow + rowIndex + 1)] = value;
      });
    });
  }

  const monthly = K.addSheet("monthlyReviewSheet", K.makeSheet([
    L("日期", "Date", "日付"),
    L("订单号", "Order", "注文番号"),
    L("客户", "Client", "顧客"),
    L("区域", "Region", "地域", "區域"),
    L("商品", "Product", "商品"),
    L("数量", "Qty", "数量"),
    L("单价", "Unit price", "単価"),
    L("折扣", "Discount", "割引"),
    L("金额", "Amount", "金額"),
    L("回款状态", "Payment status", "入金状況"),
    L("复盘结果", "Review result", "レビュー結果"),
  ], [
    ["2026-01-05", "SO260101", L("远山设计", "Yuanshan Design", "遠山デザイン"), L("华东", "East", "東部"), L("会议屏", "Meeting screen", "会議用スクリーン"), 2, 3200, 0.05, 6080, L("已回款", "Paid", "入金済み")],
    ["2026-01-12", "SO260102", L("星海教育", "Xinghai Education", "星海教育"), L("华北", "North", "北部"), L("打印纸", "Paper", "用紙"), 40, 25, 0, 1000, L("已回款", "Paid", "入金済み")],
    ["2026-01-20", "SO260103", L("新程科技", "Xincheng Tech", "新程テック"), L("华东", "East", "東部"), L("笔记本", "Laptop", "ノートPC"), 3, 4500, 0.10, 12150, L("待回款", "Pending", "入金待ち")],
    ["2026-02-03", "SO260104", L("南岸物流", "Southbank Logistics", "南岸物流"), L("华南", "South", "南部"), L("显示器", "Monitor", "モニター"), 4, 950, 0.08, 3496, L("已回款", "Paid", "入金済み")],
    ["2026-02-09", "SO260105", L("暖日生活", "Warmday", "暖日ライフ"), L("西南", "Southwest", "南西部"), L("保温杯", "Thermal cup", "保温カップ"), 20, 68, 0, 1360, L("待回款", "Pending", "入金待ち")],
    ["2026-02-17", "SO260106", L("行者箱包", "Walker Bags", "ウォーカーバッグ"), L("华北", "North", "北部"), L("背包", "Backpack", "バックパック"), 15, 95, 0.05, 1353.75, L("已回款", "Paid", "入金済み")],
    ["2026-02-24", "SO260107", L("视野科技", "Vision Tech", "視野テック"), L("华东", "East", "東部"), L("投影仪", "Projector", "プロジェクター"), 1, 5600, 0, 5600, L("已回款", "Paid", "入金済み")],
    ["2026-03-02", "SO260108", L("松林制造", "Pine Manufacturing", "松林製造"), L("华南", "South", "南部"), L("键盘", "Keyboard", "キーボード"), 12, 280, 0.15, 2856, L("已回款", "Paid", "入金済み")],
    ["2026-03-08", "SO260109", L("星海教育", "Xinghai Education", "星海教育"), L("华北", "North", "北部"), L("文件夹", "Folder", "フォルダー"), 60, 15, 0, 900, L("待回款", "Pending", "入金待ち")],
    ["2026-03-13", "SO260110", L("新程科技", "Xincheng Tech", "新程テック"), L("华东", "East", "東部"), L("笔记本", "Laptop", "ノートPC"), 2, 4500, 0.05, 8550, L("已回款", "Paid", "入金済み")],
    ["2026-03-19", "SO260111", L("南岸物流", "Southbank Logistics", "南岸物流"), L("华南", "South", "南部"), L("显示器", "Monitor", "モニター"), 6, 950, 0.12, 5016, L("已回款", "Paid", "入金済み")],
    ["2026-03-27", "SO260112", L("行者箱包", "Walker Bags", "ウォーカーバッグ"), L("华北", "North", "北部"), L("钢笔", "Pen", "ペン"), 100, 12, 0.10, 1080, L("待回款", "Pending", "入金待ち")],
  ], {
    K1: L("复盘结果", "Review result", "レビュー結果"),
  }));

  const customers = K.addSheet("customerMasterSheet", K.makeSheet([
    L("客户", "Client", "顧客"),
    L("区域", "Region", "地域", "區域"),
    L("客户经理", "Account manager", "担当マネージャー"),
    L("账期天数", "Payment terms", "支払条件日数"),
    L("客户等级", "Tier", "顧客等級"),
  ], [
    [L("远山设计", "Yuanshan Design", "遠山デザイン"), L("华东", "East", "東部"), L("林晓", "Lin", "林"), 30, "A"],
    [L("星海教育", "Xinghai Education", "星海教育"), L("华北", "North", "北部"), L("陈凯", "Chen", "陳"), 45, "A"],
    [L("新程科技", "Xincheng Tech", "新程テック"), L("华东", "East", "東部"), L("周宁", "Zhou", "周"), 60, "B"],
    [L("南岸物流", "Southbank Logistics", "南岸物流"), L("华南", "South", "南部"), L("赵敏", "Zhao", "趙"), 30, "B"],
    [L("暖日生活", "Warmday", "暖日ライフ"), L("西南", "Southwest", "南西部"), L("王磊", "Wang", "王"), 90, "C"],
    [L("行者箱包", "Walker Bags", "ウォーカーバッグ"), L("华北", "North", "北部"), L("孙悦", "Sun", "孫"), 45, "B"],
    [L("视野科技", "Vision Tech", "視野テック"), L("华东", "East", "東部"), L("李然", "Li", "李"), 60, "A"],
    [L("松林制造", "Pine Manufacturing", "松林製造"), L("华南", "South", "南部"), L("郑文", "Zheng", "鄭"), 90, "C"],
  ]));

  writeBlock(monthly, 16, [
    L("客户", "Client", "顧客"),
    L("区域", "Region", "地域", "區域"),
    L("客户经理", "Account manager", "担当マネージャー"),
    L("账期天数", "Payment terms", "支払条件日数"),
    L("客户等级", "Tier", "顧客等級"),
  ], []);
  for (let row = 2; row <= 9; row += 1) {
    ["A", "B", "C", "D", "E"].forEach((column) => {
      monthly[column + (row + 15)] = customers[column + row];
    });
  }

  const stock = K.addSheet("stockRoomSheet", K.makeSheet([
    L("商品编号", "SKU", "商品番号"),
    L("商品", "Item", "商品"),
    L("分类", "Category", "分類"),
    L("当前库存", "On hand", "在庫数"),
    L("安全库存", "Safety stock", "安全在庫"),
    L("采购单价", "Unit cost", "仕入単価"),
    L("供应商", "Supplier", "仕入先"),
    L("最近入库", "Last receipt", "最終入荷"),
    L("补货建议", "Reorder", "補充数"),
    L("风险状态", "Risk status", "リスク状態"),
    L("复盘结果", "Review result", "レビュー結果"),
  ], [
    ["P01", L("钢笔", "Pen", "ペン"), L("办公", "Office", "オフィス"), 12, 30, 8, L("文具商", "Stationery Co.", "文具商会"), "2025-11-20"],
    ["P02", L("打印纸", "Paper", "用紙"), L("办公", "Office", "オフィス"), 80, 50, 25, L("纸品社", "Paper House", "紙品社"), "2026-02-10"],
    ["P03", L("显示器", "Monitor", "モニター"), L("电子", "Electronics", "電子"), 18, 10, 950, L("视野科技", "Vision Tech", "視野テック"), "2026-03-01"],
    ["P04", L("笔记本", "Laptop", "ノートPC"), L("电子", "Electronics", "電子"), 6, 15, 4500, L("轻舟电脑", "Lightboat PC", "軽舟PC"), "2026-01-15"],
    ["P05", L("背包", "Backpack", "バックパック"), L("礼品", "Gift", "ギフト"), 45, 20, 95, L("行者箱包", "Walker Bags", "ウォーカーバッグ"), "2026-03-12"],
    ["P06", L("保温杯", "Thermal cup", "保温カップ"), L("礼品", "Gift", "ギフト"), 9, 25, 68, L("暖日生活", "Warmday", "暖日ライフ"), "2025-12-05"],
    ["P07", L("键盘", "Keyboard", "キーボード"), L("电子", "Electronics", "電子"), 26, 12, 280, L("触感科技", "Tactile Tech", "触感テック"), "2026-03-18"],
    ["P08", L("文件夹", "Folder", "フォルダー"), L("办公", "Office", "オフィス"), 70, 40, 15, L("文具商", "Stationery Co.", "文具商会"), "2026-01-28"],
    ["P09", L("无线鼠标", "Wireless mouse", "ワイヤレスマウス"), L("电子", "Electronics", "電子"), 4, 20, 160, L("触感科技", "Tactile Tech", "触感テック"), "2026-02-20"],
    ["P10", L("商务本", "Business laptop", "業務用PC"), L("电子", "Electronics", "電子"), 3, 8, 4500, L("轻舟电脑", "Lightboat PC", "軽舟PC"), "2026-03-22"],
  ], {
    K1: L("复盘结果", "Review result", "レビュー結果"),
  }));

  const suppliers = K.addSheet("supplierMasterSheet", K.makeSheet([
    L("供应商", "Supplier", "仕入先"),
    L("联系人", "Contact", "担当者"),
    L("到货天数", "Lead days", "納期日数"),
    L("结算方式", "Settlement", "決済方法"),
  ], [
    [L("文具商", "Stationery Co.", "文具商会"), L("吴敏", "Wu Min", "呉"), 3, L("月结", "Monthly", "月締め")],
    [L("纸品社", "Paper House", "紙品社"), L("何洁", "He Jie", "何"), 5, L("月结", "Monthly", "月締め")],
    [L("视野科技", "Vision Tech", "視野テック"), L("罗成", "Luo Cheng", "羅"), 7, L("货到付款", "On delivery", "代金引換")],
    [L("轻舟电脑", "Lightboat PC", "軽舟PC"), L("方宁", "Fang Ning", "方"), 10, L("预付", "Prepaid", "前払い")],
    [L("行者箱包", "Walker Bags", "ウォーカーバッグ"), L("蒋悦", "Jiang Yue", "蒋"), 4, L("月结", "Monthly", "月締め")],
    [L("暖日生活", "Warmday", "暖日ライフ"), L("顾晨", "Gu Chen", "顧"), 6, L("货到付款", "On delivery", "代金引換")],
    [L("触感科技", "Tactile Tech", "触感テック"), L("沈阳", "Shen Yang", "沈"), 8, L("预付", "Prepaid", "前払い")],
  ]));

  writeBlock(stock, 13, [
    L("供应商", "Supplier", "仕入先"),
    L("联系人", "Contact", "担当者"),
    L("到货天数", "Lead days", "納期日数"),
    L("结算方式", "Settlement", "決済方法"),
  ], []);
  for (let row = 2; row <= 8; row += 1) {
    ["A", "B", "C", "D"].forEach((column) => {
      stock[column + (row + 12)] = suppliers[column + row];
    });
  }

  const eventBudget = K.addSheet("eventBudgetSheet", K.makeSheet([
    L("费用类别", "Category", "費用区分"),
    L("项目", "Item", "項目"),
    L("预算", "Budget", "予算"),
    L("实际", "Actual", "実績"),
    L("差额", "Variance", "差異"),
    L("负责人", "Owner", "担当"),
    L("截止日期", "Due date", "期限"),
    L("状态", "Status", "状態"),
    L("复盘结果", "Review result", "レビュー結果"),
  ], [
    [L("场地", "Venue", "会場"), L("场地租赁", "Venue rental", "会場レンタル"), 50000, 48500, undefined, L("林晓", "Lin", "林"), "2026-05-10", L("已结算", "Settled", "精算済み")],
    [L("餐饮", "Catering", "飲食"), L("午餐与茶歇", "Lunch and tea break", "昼食・休憩"), 30000, 32600, undefined, L("陈凯", "Chen", "陳"), "2026-05-12", L("已结算", "Settled", "精算済み")],
    [L("设备", "Equipment", "設備"), L("音响与投影", "Audio and projector", "音響・投影"), 40000, 41500, undefined, L("周宁", "Zhou", "周"), "2026-05-12", L("待复核", "Review", "要確認")],
    [L("宣传", "Promotion", "広報"), L("海报与短视频", "Posters and video", "ポスター・動画"), 18000, 16200, undefined, L("赵敏", "Zhao", "趙"), "2026-05-08", L("已结算", "Settled", "精算済み")],
    [L("接待", "Reception", "接待"), L("嘉宾接待", "Guest reception", "来賓接待"), 25000, 23800, undefined, L("王磊", "Wang", "王"), "2026-05-14", L("待复核", "Review", "要確認")],
    [L("交通", "Travel", "交通"), L("交通住宿", "Travel and lodging", "交通・宿泊"), 35000, 37200, undefined, L("孙悦", "Sun", "孫"), "2026-05-15", L("待复核", "Review", "要確認")],
    [L("物料", "Materials", "資材"), L("胸牌与资料", "Badges and handouts", "名札・資料"), 12000, 11800, undefined, L("李然", "Li", "李"), "2026-05-09", L("已结算", "Settled", "精算済み")],
    [L("人员", "Staffing", "人員"), L("临时工作人员", "Temporary staff", "臨時スタッフ"), 45000, 43800, undefined, L("郑文", "Zheng", "鄭"), "2026-05-11", L("已结算", "Settled", "精算済み")],
    [L("保险", "Insurance", "保険"), L("活动保险", "Event insurance", "イベント保険"), 8000, 7600, undefined, L("林晓", "Lin", "林"), "2026-05-05", L("已结算", "Settled", "精算済み")],
    [L("备用金", "Contingency", "予備費"), L("应急预备金", "Contingency reserve", "予備費"), 15000, 0, undefined, L("陈凯", "Chen", "陳"), "2026-05-16", L("未使用", "Unused", "未使用")],
  ], {
    I1: L("复盘结果", "Review result", "レビュー結果"),
  }));

  [1500, -2600, -1500, 1800, 1200, -2200, 200, 1200, 400, 15000].forEach((value, index) => {
    eventBudget["E" + (index + 2)] = value;
  });

  const eventStaff = K.addSheet("eventStaffSheet", K.makeSheet([
    L("姓名", "Name", "氏名"),
    L("岗位", "Role", "役割"),
    L("工作天数", "Days", "勤務日数"),
    L("日薪", "Daily rate", "日給"),
    L("绩效系数", "Performance", "評価係数"),
    L("应发工资", "Gross pay", "支給額"),
    L("复核结果", "Review result", "確認結果"),
  ], [
    [L("林晓", "Lin", "林"), L("现场协调", "Site coordinator", "現場調整"), 3, 300, 1.20],
    [L("陈凯", "Chen", "陳"), L("嘉宾接待", "Guest reception", "来賓接待"), 2, 260, 1.00],
    [L("周宁", "Zhou", "周"), L("灯光音响", "Lighting and audio", "照明・音響"), 2, 350, 1.10],
    [L("赵敏", "Zhao", "趙"), L("签到引导", "Registration", "受付案内"), 2, 240, 1.00],
    [L("王磊", "Wang", "王"), L("机动支援", "Floor support", "フロア支援"), 3, 260, 1.10],
    [L("孙悦", "Sun", "孫"), L("财务结算", "Finance", "財務精算"), 2, 280, 1.05],
    [L("李然", "Li", "李"), L("摄影记录", "Photography", "撮影"), 1, 500, 1.20],
    [L("郑文", "Zheng", "鄭"), L("场务布置", "Venue setup", "会場設営"), 3, 260, 1.00],
  ]));

  const eventFunding = K.addSheet("eventFundingSheet", K.makeSheet([
    L("资金方案", "Funding plan", "資金案"),
    L("年利率", "Annual rate", "年利率"),
    L("期数", "Periods", "期間"),
    L("本金", "Principal", "元金"),
    L("月供", "Monthly payment", "月額返済"),
    L("总还款", "Total paid", "総返済額"),
    L("复核结果", "Review result", "確認結果"),
  ], [
    [L("场地扩建", "Venue expansion", "会場拡張"), 0.06, 36, 180000],
    [L("设备采购", "Equipment purchase", "設備購入"), 0.055, 24, 80000],
    [L("培训预算", "Training budget", "研修予算"), 0.04, 12, 30000],
    [L("车辆更新", "Vehicle renewal", "車両更新"), 0.05, 48, 220000],
  ], {
    G1: L("复核结果", "Review result", "確認結果"),
  }));

  const monthlyLabels = {
    amount: L("订单金额", "Order amount", "注文金額"),
    summary: L("经营汇总", "Business summary", "経営集計"),
    discount: L("折扣复盘", "Discount review", "割引レビュー"),
    rank: L("业绩排名", "Performance rank", "業績順位"),
    customer: L("客户资料", "Customer data", "顧客データ"),
    date: L("日期复盘", "Date review", "日付レビュー"),
    dashboard: L("经营看板", "Business dashboard", "経営ダッシュボード"),
    final: L("月结综合", "Month-end review", "月次総合", "月底綜合"),
  };

  const stockLabels = {
    alert: L("库存预警", "Stock alert", "在庫警告"),
    reorder: L("补货测算", "Reorder calculation", "補充計算"),
    summary: L("分类汇总", "Category summary", "分類集計"),
    supplier: L("供应商跟进", "Supplier follow-up", "仕入先フォロー"),
    value: L("库存价值", "Inventory value", "在庫価値"),
    final: L("盘点综合", "Stock-count review", "棚卸総合"),
  };

  const eventLabels = {
    budget: L("预算差异", "Budget variance", "予算差異"),
    analysis: L("费用分析", "Expense analysis", "費用分析"),
    date: L("节点提醒", "Deadline check", "期限確認"),
    payroll: L("工资核算", "Payroll", "給与計算"),
    payrollReview: L("工资复核", "Payroll review", "給与確認"),
    funding: L("资金方案", "Funding plan", "資金案"),
    mixed: L("活动综合", "Event review", "イベント総合"),
  };

  const monthlyRows = Array.from({ length: 12 }, (_, index) => ({
    row: index + 2,
    order: monthly["B" + (index + 2)],
    client: monthly["C" + (index + 2)],
    region: monthly["D" + (index + 2)],
    product: monthly["E" + (index + 2)],
  }));

  const stockRows = Array.from({ length: 10 }, (_, index) => ({
    row: index + 2,
    sku: stock["A" + (index + 2)],
    item: stock["B" + (index + 2)],
    supplier: stock["G" + (index + 2)],
  }));

  const budgetRows = Array.from({ length: 10 }, (_, index) => ({
    row: index + 2,
    category: eventBudget["A" + (index + 2)],
    item: eventBudget["B" + (index + 2)],
  }));

  const staffRows = Array.from({ length: 8 }, (_, index) => ({
    row: index + 2,
    name: eventStaff["A" + (index + 2)],
    role: eventStaff["B" + (index + 2)],
  }));

  function monthlyAmountTasks(prefix) {
    return monthlyRows.map((item) => task({
      id: prefix + "-order-" + item.order,
      sheet: monthly,
      target: "I" + item.row,
      taskLabel: monthlyLabels.amount,
      title: fill(L("核对{client}的订单金额", "Check the order for {client}", "{client}の注文確認"), { client: item.client }),
      lead: fill(L("在 I{row} 用数量×单价×(1-折扣)计算{product}。", "In I{row}, calculate {product} as qty × price × (1 - discount).", "I{row} で{product}を数量×単価×(1-割引)で計算します。"), { row: item.row, product: item.product }),
      hint: fill(L("参考：=F{row}*G{row}*(1-H{row})", "Reference: =F{row}*G{row}*(1-H{row})", "参考：=F{row}*G{row}*(1-H{row})"), { row: item.row }),
      success: L("金额会随输入自动更新。", "The amount updates automatically.", "金額は入力に合わせて更新されます。"),
      formula: "=F" + item.row + "*G" + item.row + "*(1-H" + item.row + ")",
    }));
  }

  const arithmetic = L("四则运算和单元格引用", "arithmetic and cell references", "四則演算とセル参照", "四則運算與儲存格參照");
  const genericLead = L(
    "「{title}」写到 {target}。可优先试 {functions}，再核对范围和条件。",
    "Put “{title}” in {target}. Start with {functions}, then double-check the ranges and criteria.",
    "「{title}」は {target} に入れます。まず {functions} を試し、範囲と条件を確認しましょう。",
    "「{title}」寫到 {target}。可先試 {functions}，再核對範圍和條件。"
  );
  const genericHint = L(
    "条件和数值各在哪一列？按参数顺序填。结果不对，先看范围有没有多带或少带一行。",
    "Find the criteria column and the value column, then follow the argument order. If the result looks odd, check whether the range grabbed one row too many or too few.",
    "条件の列と数値の列を先に見つけ、引数の順番どおりに入れます。結果が変なら、範囲が1行多い／少ないかを先に確認しましょう。",
    "先找條件和數值各在哪一欄，再依參數順序寫。結果怪怪的，先看範圍有沒有多帶或少帶一列。"
  );
  const genericSuccess = L(
    "「{title}」算对了。{target} 里的公式会跟着明细更新。",
    "“{title}” is correct. The formula in {target} will update with the line items.",
    "「{title}」は正解です。{target} の数式も明細の変更に合わせて更新されます。",
    "「{title}」算對了。{target} 裡的公式會跟著明細更新。"
  );

  function quick(spec) {
    const functionText = Array.isArray(spec.functions) && spec.functions.length
      ? spec.functions.join(" / ")
      : arithmetic;
    const params = { title: spec.title, target: spec.target, label: spec.label, functions: functionText };
    const lead = spec.lead || fill(genericLead, params);
    return task({
      id: spec.id,
      sheet: spec.sheet,
      target: spec.target,
      taskLabel: spec.label,
      title: spec.title,
      lead,
      hint: spec.hint || fill(genericHint, params),
      success: spec.success || fill(genericSuccess, params),
      formula: spec.formula,
      requiredFunctions: spec.functions,
      requiredText: spec.requiredText,
    });
  }

  function monthlySummaryTasks(prefix) {
    return [
      quick({ id: prefix + "-march", sheet: monthly, target: "K2", label: monthlyLabels.summary,
        title: L("三月销售额", "March sales", "3月の売上"),
        formula: '=SUMIF(A2:A13,"2026-03-*",I2:I13)', functions: ["SUMIF"] }),
      quick({ id: prefix + "-east", sheet: monthly, target: "K3", label: monthlyLabels.summary,
        title: L("华东销售额", "East sales", "東部の売上"),
        formula: L('=SUMIF(D2:D13,"华东",I2:I13)', '=SUMIF(D2:D13,"East",I2:I13)', '=SUMIF(D2:D13,"東部",I2:I13)'), functions: ["SUMIF"] }),
      quick({ id: prefix + "-pending", sheet: monthly, target: "K4", label: monthlyLabels.summary,
        title: L("待回款金额", "Pending amount", "入金待ち金額"),
        formula: L('=SUMIF(J2:J13,"待回款",I2:I13)', '=SUMIF(J2:J13,"Pending",I2:I13)', '=SUMIF(J2:J13,"入金待ち",I2:I13)'), functions: ["SUMIF"] }),
      quick({ id: prefix + "-north-paid", sheet: monthly, target: "K5", label: monthlyLabels.summary,
        title: L("华北已回款订单数", "Paid North orders", "北部の入金済み件数"),
        formula: L('=COUNTIFS(D2:D13,"华北",J2:J13,"已回款")', '=COUNTIFS(D2:D13,"North",J2:J13,"Paid")', '=COUNTIFS(D2:D13,"北部",J2:J13,"入金済み")'), functions: ["COUNTIFS"] }),
      quick({ id: prefix + "-feb", sheet: monthly, target: "K6", label: monthlyLabels.summary,
        title: L("二月销售额", "February sales", "2月の売上"),
        formula: '=SUMIFS(I2:I13,A2:A13,"2026-02-*")', functions: ["SUMIFS"] }),
      quick({ id: prefix + "-avg", sheet: monthly, target: "K7", label: monthlyLabels.summary,
        title: L("平均每单金额", "Average order amount", "平均注文額"),
        formula: "=ROUND(AVERAGE(I2:I13),0)", functions: ["ROUND", "AVERAGE"] }),
      quick({ id: prefix + "-large", sheet: monthly, target: "K8", label: monthlyLabels.summary,
        title: L("高额订单数", "Large orders", "高額注文数"),
        formula: '=COUNTIF(I2:I13,">5000")', functions: ["COUNTIF"] }),
      quick({ id: prefix + "-pending-share", sheet: monthly, target: "K9", label: monthlyLabels.summary,
        title: L("待回款占比", "Pending share", "入金待ちの構成比"),
        formula: L('=ROUND(SUMIF(J2:J13,"待回款",I2:I13)/SUM(I2:I13),3)', '=ROUND(SUMIF(J2:J13,"Pending",I2:I13)/SUM(I2:I13),3)', '=ROUND(SUMIF(J2:J13,"入金待ち",I2:I13)/SUM(I2:I13),3)'), functions: ["ROUND", "SUMIF", "SUM"] }),
    ];
  }

  function monthlyDiscountTasks(prefix) {
    return [
      quick({ id: prefix + "-list", sheet: monthly, target: "K2", label: monthlyLabels.discount,
        title: L("未折扣总额", "List-price total", "割引前合計"),
        formula: "=SUMPRODUCT(F2:F13,G2:G13)", functions: ["SUMPRODUCT"] }),
      quick({ id: prefix + "-discount", sheet: monthly, target: "K3", label: monthlyLabels.discount,
        title: L("折扣让利总额", "Total discount value", "割引総額"),
        formula: "=ROUND(SUMPRODUCT(F2:F13,G2:G13,H2:H13),0)", functions: ["ROUND", "SUMPRODUCT"] }),
      quick({ id: prefix + "-multiple", sheet: monthly, target: "K4", label: monthlyLabels.discount,
        title: L("标价总额相当于实收的几倍", "List total as a multiple of received", "定価合計は実収の何倍か"),
        formula: "=ROUND(SUMPRODUCT(F2:F13,G2:G13)/SUM(I2:I13),2)", functions: ["ROUND", "SUMPRODUCT", "SUM"] }),
      quick({ id: prefix + "-weighted", sheet: monthly, target: "K5", label: monthlyLabels.discount,
        title: L("加权平均单价", "Weighted average price", "加重平均単価"),
        formula: "=ROUND(SUMPRODUCT(F2:F13,G2:G13)/SUM(F2:F13),2)", functions: ["ROUND", "SUMPRODUCT", "SUM"] }),
      quick({ id: prefix + "-rate", sheet: monthly, target: "K6", label: monthlyLabels.discount,
        title: L("按金额加权的平均折扣率", "Amount-weighted discount rate", "金額加重の割引率"),
        formula: "=ROUND(SUMPRODUCT(F2:F13,G2:G13,H2:H13)/SUMPRODUCT(F2:F13,G2:G13),3)", functions: ["ROUND", "SUMPRODUCT"] }),
      quick({ id: prefix + "-size", sheet: monthly, target: "K7", label: monthlyLabels.discount,
        title: L("标价总额是否超过 5 万", "Is list total above 50,000?", "定価合計は5万超か"),
        formula: '=IF(SUMPRODUCT(F2:F13,G2:G13)>50000,"BIG","NORMAL")', functions: ["IF", "SUMPRODUCT"] }),
      quick({ id: prefix + "-fee", sheet: monthly, target: "K8", label: monthlyLabels.discount,
        title: L("按标价预提 3% 服务费", "Accrue a 3% service fee", "定価の3%を計上"),
        formula: "=ROUND(SUMPRODUCT(F2:F13,G2:G13)*0.03,0)", functions: ["ROUND", "SUMPRODUCT"] }),
      quick({ id: prefix + "-net", sheet: monthly, target: "K9", label: monthlyLabels.discount,
        title: L("实收总额", "Received total", "実収合計"),
        formula: "=ROUND(SUM(I2:I13),0)", functions: ["ROUND", "SUM"] }),
    ];
  }

  function monthlyRankTasks(prefix) {
    const rows = monthlyRows.slice(0, 8).map((item) => quick({
      id: prefix + "-rank-" + item.order, sheet: monthly, target: "K" + item.row, label: monthlyLabels.rank,
      title: fill(L("给{order}的金额排名", "Rank order {order}", "{order}の金額順位"), { order: item.order }),
      formula: "=RANK(I" + item.row + ",$I$2:$I$13,0)", functions: ["RANK"], requiredText: ["$I$2:$I$13"],
    }));
    return rows.concat([
      quick({ id: prefix + "-priority", sheet: monthly, target: "K2", label: monthlyLabels.rank,
        title: L("前三且已回款才优先", "Priority for a top-three paid order", "上位3位かつ入金済みを優先"),
        formula: L('=IF(AND(RANK(I2,$I$2:$I$13,0)<=3,J2="已回款"),"PRIORITY","NORMAL")', '=IF(AND(RANK(I2,$I$2:$I$13,0)<=3,J2="Paid"),"PRIORITY","NORMAL")', '=IF(AND(RANK(I2,$I$2:$I$13,0)<=3,J2="入金済み"),"PRIORITY","NORMAL")'), functions: ["IF", "AND", "RANK"], requiredText: ["$I$2:$I$13"] }),
      quick({ id: prefix + "-last", sheet: monthly, target: "K3", label: monthlyLabels.rank,
        title: L("末位订单复核", "Review the smallest order", "最下位注文の確認"),
        formula: '=IF(RANK(I12,$I$2:$I$13,0)=12,"REVIEW","OK")', functions: ["IF", "RANK"], requiredText: ["$I$2:$I$13"] }),
      quick({ id: prefix + "-champion", sheet: monthly, target: "K4", label: monthlyLabels.rank,
        title: L("最大金额订单的客户", "Client with the largest order", "最大注文の顧客"),
        formula: "=INDEX(C2:C13,MATCH(MAX(I2:I13),I2:I13,0))", functions: ["INDEX", "MATCH", "MAX"] }),
      quick({ id: prefix + "-count", sheet: monthly, target: "K5", label: monthlyLabels.rank,
        title: L("用 COUNTIF 重建订单名次", "Rebuild a rank with COUNTIF", "COUNTIF で順位を作る"),
        formula: '=COUNTIF($I$2:$I$13,">"&I6)+1', functions: ["COUNTIF"] }),
    ]);
  }

  function monthlyCustomerTasks(prefix) {
    const lookupRows = [2, 3, 4, 8, 9, 10].map((row, index) => quick({
      id: prefix + "-manager-" + row, sheet: monthly, target: "K" + (index + 2), label: monthlyLabels.customer,
      title: fill(L("查找{client}的客户经理", "Find the account manager for {client}", "{client}の担当者を検索"), { client: monthly["C" + row] }),
      formula: "=VLOOKUP(C" + row + ",$A$17:$E$24,3,FALSE)", functions: ["VLOOKUP"],
    }));
    return lookupRows.concat([
      quick({ id: prefix + "-terms", sheet: monthly, target: "K8", label: monthlyLabels.customer,
        title: L("远山设计的账期天数", "Payment terms for Northstar Studio", "ノーススター設計の支払条件", "光嶼設計的帳期天數"),
        formula: "=VLOOKUP(C2,$A$17:$E$24,4,FALSE)", functions: ["VLOOKUP"] }),
      quick({ id: prefix + "-long-terms", sheet: monthly, target: "K9", label: monthlyLabels.customer,
        title: L("账期超过 60 天就复核", "Review terms longer than 60 days", "60日超の支払条件を確認"),
        formula: '=IF(VLOOKUP(C3,$A$17:$E$24,4,FALSE)>60,"REVIEW","OK")', functions: ["IF", "VLOOKUP"] }),
      quick({ id: prefix + "-manager-index", sheet: monthly, target: "K10", label: monthlyLabels.customer,
        title: L("用 INDEX 和 MATCH 查找客户经理", "Find the manager with INDEX and MATCH", "INDEX・MATCH で担当者検索"),
        formula: "=INDEX($C$17:$C$24,MATCH(C8,$A$17:$A$24,0))", functions: ["INDEX", "MATCH"] }),
      quick({ id: prefix + "-month", sheet: monthly, target: "K11", label: monthlyLabels.date,
        title: L("订单发生的月份", "Month of the order", "注文の月"),
        formula: "=MONTH(A2)", functions: ["MONTH"] }),
      quick({ id: prefix + "-day", sheet: monthly, target: "K12", label: monthlyLabels.date,
        title: L("三月首单是几号", "Day of the first March order", "3月初注文の日"),
        formula: "=DAY(A9)", functions: ["DAY"] }),
      quick({ id: prefix + "-text", sheet: monthly, target: "K13", label: monthlyLabels.date,
        title: L("生成年月标签", "Build a year-month label", "年月ラベルを作る"),
        formula: '=TEXT(A4,"yyyy-mm")', functions: ["TEXT"] }),
    ]);
  }

  function monthlyDashboardTasks(prefix) {
    return [
      quick({ id: prefix + "-east-share", sheet: monthly, target: "K2", label: monthlyLabels.dashboard,
        title: L("华东在总销售额中的占比", "East share of sales", "東部の売上構成比"),
        formula: L('=ROUND(SUMIF(D2:D13,"华东",I2:I13)/SUM(I2:I13),3)', '=ROUND(SUMIF(D2:D13,"East",I2:I13)/SUM(I2:I13),3)', '=ROUND(SUMIF(D2:D13,"東部",I2:I13)/SUM(I2:I13),3)'), functions: ["ROUND", "SUMIF", "SUM"] }),
      quick({ id: prefix + "-paid-share", sheet: monthly, target: "K3", label: monthlyLabels.dashboard,
        title: L("已回款金额占比", "Paid share of sales", "入金済みの構成比"),
        formula: L('=ROUND(SUMIF(J2:J13,"已回款",I2:I13)/SUM(I2:I13),3)', '=ROUND(SUMIF(J2:J13,"Paid",I2:I13)/SUM(I2:I13),3)', '=ROUND(SUMIF(J2:J13,"入金済み",I2:I13)/SUM(I2:I13),3)'), functions: ["ROUND", "SUMIF", "SUM"] }),
      quick({ id: prefix + "-quarter", sheet: monthly, target: "K4", label: monthlyLabels.dashboard,
        title: L("季度总销售额是否达到 6 万", "Do quarterly sales reach 60,000?", "四半期売上は6万以上か"),
        formula: '=IF(SUM(I2:I13)>=60000,"MET","SHORT")', functions: ["IF", "SUM"] }),
      quick({ id: prefix + "-growth", sheet: monthly, target: "K5", label: monthlyLabels.dashboard,
        title: L("二月相对一月的销售倍数", "February versus January sales", "2月と1月の売上比"),
        formula: '=ROUND(SUMIF(A2:A13,"2026-02-*",I2:I13)/SUMIF(A2:A13,"2026-01-*",I2:I13),2)', functions: ["ROUND", "SUMIF"] }),
      quick({ id: prefix + "-top-name", sheet: monthly, target: "K6", label: monthlyLabels.dashboard,
        title: L("销售冠军客户", "Top-order client", "最高注文の顧客"),
        formula: "=INDEX(C2:C13,MATCH(MAX(I2:I13),I2:I13,0))", functions: ["INDEX", "MATCH", "MAX"] }),
      quick({ id: prefix + "-discount-value", sheet: monthly, target: "K7", label: monthlyLabels.dashboard,
        title: L("全季度让利金额", "Total discount value", "四半期の割引総額"),
        formula: "=ROUND(SUMPRODUCT(F2:F13,G2:G13,H2:H13),0)", functions: ["ROUND", "SUMPRODUCT"] }),
      quick({ id: prefix + "-avg-paid", sheet: monthly, target: "K8", label: monthlyLabels.dashboard,
        title: L("已回款订单平均金额", "Average paid order", "入金済み注文の平均額"),
        formula: L('=ROUND(AVERAGEIF(J2:J13,"已回款",I2:I13),0)', '=ROUND(AVERAGEIF(J2:J13,"Paid",I2:I13),0)', '=ROUND(AVERAGEIF(J2:J13,"入金済み",I2:I13),0)'), functions: ["ROUND", "AVERAGEIF"] }),
      quick({ id: prefix + "-north-total", sheet: monthly, target: "K9", label: monthlyLabels.dashboard,
        title: L("华北销售额", "North sales", "北部の売上"),
        formula: L('=SUMIF(D2:D13,"华北",I2:I13)', '=SUMIF(D2:D13,"North",I2:I13)', '=SUMIF(D2:D13,"北部",I2:I13)'), functions: ["SUMIF"] }),
    ];
  }

  D.registerChapter({
    id: "ch10-capstone-sales",
    icon: "10",
    title: L("第 10 章 · 大型情境：季度经营复盘", "Chapter 10 · Capstone: Quarterly Business Review", "第10章 · 大型ケース：四半期営業レビュー", "第 10 章 · 大型情境：季度營運檢討"),
    subtitle: L("同一份季度订单表要整理成经营例会材料。依次完成金额核对、区域与月份汇总、折扣说明、业绩排名、客户条件和管理层看板，每一步都沿用前面学过的工具。", "At a growing design studio, one quarterly order sheet must become a management review. Verify amounts, total by market and month, explain discounts, rank accounts, check client terms, and build a one-page dashboard with the same data.", "成長中のデザイン会社で、1枚の四半期受注表を経営会議資料に仕上げます。金額確認、月別・地域別集計、割引説明、順位、顧客条件、経営ダッシュボードを同じデータで順に作ります。", "在一家成長中的設計公司，季度訂單表要整理成營運會議資料。依序完成金額核對、區域與月份彙總、折扣說明、業績排名、客戶條件與管理層看板，每一步都沿用先前學過的工具。"),
    levels: [
      level("capstone-sales", "exam", L("季度经营例会：从订单明细到管理层看板", "Quarterly Review: From Order Lines to a Management Dashboard", "四半期レビュー：注文明細から経営ダッシュボードへ", "季度營運會議：從訂單明細到管理層看板"), [
        learn(
          "brief-capstone-sales",
          L("周一 9 点，经营例会只给你一份订单表", "Monday, 9 a.m.: the quarterly review starts with one order sheet", "月曜9時、四半期レビューは1枚の注文表から始まる", "週一上午九點，季度營運會議只給你一份訂單表"),
          L("销售、财务和主管都在等同一份结论。先把每单金额算准，再按月份和区域汇总，然后解释折扣、排名、客户账期和回款风险。后面每一关都基于同一份业务数据，不是互不相关的小题。", "Sales, finance, and leadership need one consistent story. Verify each order, total by market and month, explain discounts, rank accounts, check payment terms, and surface collection risk. Every later step stays inside the same quarterly review.", "営業・財務・経営陣が同じ結論を求めています。各注文の金額を確認し、月別・地域別に集計し、割引・順位・支払条件・入金リスクまで説明します。その後も同じ四半期データを使い続けます。", "業務、財務與主管都在等同一份結論。先核對每筆訂單，再按月與區域彙總，接著說明折扣、排名、客戶帳期與收款風險。後續每一步都延續同一份季度資料。"),
          [
            L("先保证明细正确，再做任何汇总", "Make the detail rows correct before summarizing", "集計前に明細行を正しくします"),
            L("月度和区域汇总优先用 SUMIF/SUMIFS", "Use SUMIF/SUMIFS for month and region totals", "月別・地域別は SUMIF/SUMIFS を使います"),
            L("排名题要锁定比较区域", "Lock ranking ranges", "順位範囲を固定します"),
            L("客户资料是查找表，金额和状态仍来自订单明细", "Customer data is a lookup table; amounts and status stay in the order detail", "顧客表は検索用で、金額と状態は注文明細にあります"),
          ],
          L("把这张表当作真正的月报工作底稿：每次只完成当前问题，下一步继续在同一业务情境中推进。", "Treat this as a real month-end workbook: finish the current business question, then continue in the same context.", "実際の月次作業ブックとして扱い、現在の課題を終えてから同じ文脈で次へ進みます。"),
          "=F2*G2*(1-H2)"
        ),
        practice({
          id: "cap-sales-detail",
          title: L("第一步：核对每张订单的金额", "Step 1: verify every order amount", "第1段階：各注文金額の確認"),
          lead: L("随机抽一张订单。数量、单价和折扣改变时，金额必须自动重算。", "A random order is selected. The amount must recalculate when quantity, price, or discount changes.", "ランダムな注文について、数量・単価・割引が変われば金額も再計算します。"),
          sheet: monthly,
          tasks: monthlyAmountTasks("cap-sales-detail"),
          hint: L("金额 = 数量 × 单价 × (1 - 折扣)。", "Amount = quantity × price × (1 - discount).", "金額＝数量×単価×(1−割引)です。"),
        }),
        practice({
          id: "cap-sales-summary",
          title: L("第二步：按月份、区域和回款状态汇总", "Step 2: summarize by month, region, and payment status", "第2段階：月・地域・入金状態で集計"),
          lead: L("主管一会儿要三月，一会儿要华东，还会问待回款和已回款。随机抽到哪种统计，就选对条件区域和求和区域。", "The manager may ask for March, East, pending, or paid results. Whichever measure comes up, pick the right criteria and sum ranges.", "3月・東部・入金待ち・入金済みの集計が次々に必要です。出た条件に合わせて、条件範囲と合計範囲を選びます。"),
          sheet: monthly,
          tasks: monthlySummaryTasks("cap-sales-summary"),
          hint: L("单条件用 SUMIF/COUNTIF，多条件用 SUMIFS/COUNTIFS。", "Use SUMIF/COUNTIF for one condition and SUMIFS/COUNTIFS for several.", "単条件は SUMIF/COUNTIF、複数条件は SUMIFS/COUNTIFS です。"),
        }),
        practice({
          id: "cap-sales-discount",
          title: L("第三步：解释折扣与标价", "Step 3: explain discounts and list prices", "第3段階：割引と定価を説明"),
          lead: L("财务追问“原价多少、让掉多少、加权平均单价多少”。题目会随机切换，但都围绕同一组数量、单价、折扣列。", "Finance asks for list total, discount value, and weighted price. Tasks switch, but all use the same quantity, price, and discount columns.", "財務から定価合計・割引額・加重平均単価を聞かれます。同じ数量・単価・割引列を使います。"),
          sheet: monthly,
          tasks: monthlyDiscountTasks("cap-sales-discount"),
          hint: L("SUMPRODUCT 先逐行相乘再汇总；区域长度必须一样。", "SUMPRODUCT multiplies row by row first, then totals. All ranges must match.", "SUMPRODUCT は行ごとに掛けてから合計します。範囲の長さをそろえます。"),
        }),
        practice({
          id: "cap-sales-rank",
          title: L("第四步：排名、冠军和优先跟进", "Step 4: rank orders and identify priority follow-up", "第4段階：順位・首位・優先フォロー"),
          lead: L("销售主管要挑大单、找冠军客户，也要把名次和回款状态合并成优先结论。随机题可能在明细排名和业务判断之间切换。", "The sales lead needs large orders, the champion client, and a priority decision that combines rank with payment status. Tasks switch between row ranks and business decisions.", "大口注文・首位顧客・順位と入金状態を組み合わせた優先判断が必要です。"),
          sheet: monthly,
          tasks: monthlyRankTasks("cap-sales-rank"),
          hint: L("RANK 的比较区域要用 $I$2:$I$13。", "Lock the RANK comparison range as $I$2:$I$13.", "RANK の比較範囲は $I$2:$I$13 に固定します。"),
        }),
        practice({
          id: "cap-sales-customer",
          title: L("第五步：客户经理、账期与日期标签", "Step 5: managers, payment terms, and date labels", "第5段階：担当者・支払条件・日付ラベル"),
          lead: L("订单里的客户只是名字，客户经理和账期在主数据表里。随机题会要求 VLOOKUP、INDEX/MATCH 或日期提取。", "The order only contains a client name; the manager and payment terms live in a master table. Tasks ask for VLOOKUP, INDEX/MATCH, or date extraction.", "注文には顧客名だけがあり、担当者と支払条件はマスタ表にあります。VLOOKUP・INDEX/MATCH・日付抽出を使います。"),
          sheet: monthly,
          tasks: monthlyCustomerTasks("cap-sales-customer"),
          hint: L("精确查找时 VLOOKUP 的第四个参数用 FALSE。", "Use FALSE for an exact VLOOKUP.", "完全一致の VLOOKUP は第4引数を FALSE にします。"),
        }),
        practice({
          id: "cap-sales-dashboard",
          title: L("第六步：给管理层一页看板", "Step 6: deliver a one-page management dashboard", "第6段階：経営陣向け1ページ"),
          lead: L("现在要输出占比、目标判断、增长倍数、冠军客户和折扣总额。随机抽一项，每题都要求把前几步的知识重新组合。", "Produce shares, goal decisions, growth multiple, top client, and discount value. Each random task recombines earlier skills.", "構成比・目標判定・成長倍率・首位顧客・割引総額を出します。既習知識を再結合します。"),
          sheet: monthly,
          tasks: monthlyDashboardTasks("cap-sales-dashboard"),
          hint: L("先确认分子和分母，再做取整或文字判断。", "Confirm numerator and denominator before rounding or adding a decision label.", "分子と分母を確認してから丸めや判定を加えます。"),
        }),
        practice({
          id: "cap-sales-final",
          title: L("月结终局：随机抽一道完整业务题", "Month-end finale: one complete business question", "月次最終：完全な業務問題を1問抽選", "月底終局：隨機抽一道完整業務題"),
          lead: L("这一轮把金额、汇总、折扣、排名、客户资料和看板题全混在一起。先判断题目要的是金额、占比还是排名，再选函数。", "This final draw mixes amounts, summaries, discounts, ranks, customer data, and dashboard tasks. Decide whether the question asks for an amount, share, or rank before choosing a function.", "金額・集計・割引・順位・顧客・ダッシュボードをまとめて出題します。金額・構成比・順位のどれを求めるかを判断してから関数を選びます。"),
          sheet: monthly,
          tasks: monthlyAmountTasks("cap-sales-final")
            .concat(monthlySummaryTasks("cap-sales-final"))
            .concat(monthlyDiscountTasks("cap-sales-final"))
            .concat(monthlyRankTasks("cap-sales-final"))
            .concat(monthlyCustomerTasks("cap-sales-final"))
            .concat(monthlyDashboardTasks("cap-sales-final")),
          hint: L("如果结果差了几个零，先确认题目要的是金额、占比还是排名。", "If the result is off by several zeros, check whether the task asks for an amount, share, or rank.", "結果が何桁もずれたら、金額・構成比・順位のどれを求めるか確認します。"),
        }),
      ], { xp: 90 }),
    ],
  });

  D.registerChapter({
    id: "ch12-capstone-event",
    icon: "12",
    title: L("第 12 章 · 大型情境：活动预算、工资与资金方案", "Chapter 12 · Capstone: Event Budget, Payroll, and Funding", "第12章 · 大型ケース：イベント予算・給与・資金案", "第 12 章 · 大型情境：活動預算、薪資與資金方案"),
    subtitle: L("从费用明细到人员工资，再到贷款月供，连续完成一场年度活动的筹备复盘。每一步都使用同一业务背景，并混合前面学过的汇总、条件、日期、查找与财务函数。", "Move from expense lines to payroll and loan payments in one annual-event review. Each step shares the same business context and mixes earlier totals, conditions, dates, lookups, and finance functions.", "費用明細から人件費、ローン返済まで、年次イベントの準備レビューを連続して行います。同じ業務の流れで既習の集計・条件・日付・検索・財務関数を混ぜます。", "從費用明細、臨時人員薪資到貸款月付，連續完成一場年度活動的籌備檢討。每一步都沿用同一組業務資料，並綜合先前學過的彙總、條件、日期、查詢與財務函數。"),
    levels: [
      level("capstone-event", "exam", L("年度活动筹备：预算、人员与资金闭环", "Annual Event: Budget, Staff, and Funding", "年次イベント：予算・人員・資金の一連の流れ", "年度活動籌備：預算、人力與資金串聯"), [
        learn(
          "brief-capstone-event",
          L("活动前一周，财务、行政和主管同时来要数字", "One week before the event, finance, admin, and the manager all need numbers", "イベント1週間前、財務・総務・上司が同時に数字を求めている", "活動前一週，財務、行政與主管同時來要數字"),
          L("预算表记录每项费用的预算和实际，人员表记录临时工作人员的工作天数和日薪，资金表用于比较贷款方案。先用 IF 找超支和节点，再汇总费用、计算工资、比较月供，最后做一份完整复盘。", "The budget sheet records planned and actual spend, the staff sheet records days and daily rates, and the funding sheet compares loan plans. Use IF for overruns and deadlines, then total expenses, calculate payroll, compare payments, and finish with a complete review.", "予算表は予算と実績、人員表は勤務日数と日給、資金表はローン案を記録します。IF で超過と期限を確認し、費用集計・給与計算・返済比較を行い、最終レビューを作ります。", "預算表記錄每項費用的預算與實際支出，人員表記錄臨時人員的班別天數與日薪，資金表用來比較貸款方案。先用 IF 找出超支與期限，再彙總費用、計算薪資、比較月付，最後完成一份完整的營運檢討。"),
          [
            L("预算差额用“预算 − 实际”，负数代表超支", "Variance is budget minus actual; a negative value means overspend", "予算差異は予算−実績で、マイナスは超過です", "預算差異以「預算 − 實際」計算，負數代表超支"),
            L("工资 = 工作天数 × 日薪 × 绩效系数", "Pay is days × daily rate × performance factor", "給与＝勤務日数×日給×評価係数です", "薪資 = 工作天數 × 日薪 × 績效係數"),
            L("贷款月供先算 PMT，再乘期数得到总还款", "Calculate PMT first, then multiply by periods for total repayment", "まず PMT を求め、期間を掛けて総返済額にします", "貸款先用 PMT 算出月付，再乘期數得到總還款"),
            L("同一条业务链可以分别用 SUMIF、COUNTIF、VLOOKUP、SUMPRODUCT、DATE 与 IF 完成", "One business chain can use SUMIF, COUNTIF, VLOOKUP, SUMPRODUCT, DATE, and IF at different stages", "同じ業務の流れで SUMIF・COUNTIF・VLOOKUP・SUMPRODUCT・DATE・IF を使い分けます", "同一條業務流程可依序運用 SUMIF、COUNTIF、VLOOKUP、SUMPRODUCT、DATE 與 IF"),
          ],
          L("先看问题属于“预算、人员还是资金”，再选函数。三类表各算各的金额，别混在一起。", "Decide whether the question is about budget, staffing, or funding, then choose a function. Each sheet measures its own amounts; keep them separate.", "予算・人員・資金のどの質問かを先に判断し、関数を選びます。金額の基準を混ぜません。", "先看問題屬於「預算、人力還是資金」，再選函數。三張表各算各的金額，別混在一起。"),
          "=C2-D2"
        ),
        practice({
          id: "cap-event-budget",
          title: L("第一步：逐项核对预算差额与超支", "Step 1: check variances and overspend item by item", "第1段階：項目別の予算差異と超過", "第一步：逐項核對預算差異與超支"),
          lead: L("随机抽一个费用项目，计算预算减实际；也可能要求判断是否超支并输出 OVER 或 OK。", "A budget line is selected. Calculate budget minus actual, or flag overspend as OVER or OK.", "ランダムな費用項目で予算−実績を計算し、超過なら OVER、それ以外は OK と判定します。", "隨機抽一項費用，計算預算減實際；也可能要判斷是否超支，並輸出 OVER 或 OK。"),
          sheet: eventBudget,
          tasks: eventBudgetRows("cap-event-budget"),
          hint: L("差额为负表示实际超过预算。", "A negative variance means actual spend exceeded budget.", "差異がマイナスなら実績が予算を超えています。", "差異為負數，代表實際支出超過預算。"),
        }),
        practice({
          id: "cap-event-analysis",
          title: L("第二步：费用结构、超支与结余", "Step 2: cost structure, overspend, and balance", "第2段階：費用構造・超過・残額", "第二步：費用結構、超支與結餘"),
          lead: L("财务要总预算、总实际、超支项目数、分类费用和超支总额。随机抽一项，先把预算列和实际列分清。", "Finance asks for total budget, actual spend, over-budget items, category costs, and overspend. Separate budget and actual columns first.", "財務から予算合計・実績合計・超過件数・分類費用・超過額を聞かれます。予算列と実績列を区別します。", "財務要總預算、實際總支出、超支項數、分類費用與超支總額。隨機抽一項，先分清預算欄與實際欄。"),
          sheet: eventBudget,
          tasks: eventAnalysisTasks("cap-event-analysis"),
          hint: L("E 列差额由预算减实际得到，负数项目才是超支。", "Column E is budget minus actual; only negative lines are overspent.", "E列は予算−実績で、マイナスの項目だけが超過です。", "E 欄的差異由預算減實際得出，只有負數項目才是超支。"),
        }),
        practice({
          id: "cap-event-dates",
          title: L("第三步：截止节点与活动倒计时", "Step 3: deadlines and the event countdown", "第3段階：期限とカウントダウン", "第三步：截止期限與活動倒數"),
          lead: L("行政要确认各项截止日、剩余天数、月份与临期提醒。随机题会要求 DATE、MONTH、DAY、TEXT 和 IF。", "Admin needs due dates, remaining days, month labels, and near-term reminders. Tasks use DATE, MONTH, DAY, TEXT, and IF.", "総務は期限・残り日数・月表示・直前通知を必要とします。DATE・MONTH・DAY・TEXT・IF を使います。", "行政要核對各項截止日、剩餘天數、月份與臨期提醒。隨機題會用到 DATE、MONTH、DAY、TEXT 和 IF。"),
          sheet: eventBudget,
          tasks: eventDateTasks("cap-event-dates"),
          hint: L("活动日固定为 2026-05-20，用 DATE(2026,5,20) 减截止日期。", "The event date is fixed at 2026-05-20. Subtract deadlines from DATE(2026,5,20).", "イベント日は2026-05-20です。期限を DATE(2026,5,20) から引きます。", "活動日固定為 2026-05-20，用 DATE(2026,5,20) 減截止日期。"),
        }),
        practice({
          id: "cap-event-payroll",
          title: L("第四步：临时人员工资逐人核算", "Step 4: calculate temporary staff pay", "第4段階：臨時スタッフの給与計算", "第四步：臨時人員薪資逐人核算"),
          lead: L("随机抽一名工作人员，用工作天数、日薪和绩效系数计算应发工资；部分题再判断是否达到复核线。", "A staff member is selected. Calculate pay from days, daily rate, and performance, with some tasks checking a review threshold.", "ランダムなスタッフについて勤務日数・日給・評価係数から支給額を計算します。", "隨機抽一名工作人員，依工作天數、日薪與績效係數計算應發薪資；部分題目再判斷是否達到覆核門檻。"),
          sheet: eventStaff,
          tasks: eventPayrollRows("cap-event-payroll"),
          hint: L("工资 = C列 × D列 × E列。", "Pay = column C × column D × column E.", "給与＝C列×D列×E列です。", "薪資 = C 欄 × D 欄 × E 欄。"),
        }),
        practice({
          id: "cap-event-payroll-review",
          title: L("第五步：工资总额与人员结构", "Step 5: payroll total and staffing mix", "第5段階：人件費合計と人員構成", "第五步：薪資總額與人員組成"),
          lead: L("行政要工资总额、人均工资、总工作天数和加薪后的预算。随机题在 SUMPRODUCT、COUNTA、SUM、COUNTIF 和 IF 之间切换。", "Admin needs total payroll, average pay, workdays, and a raise scenario. Tasks switch among SUMPRODUCT, COUNTA, SUM, COUNTIF, and IF.", "人件費合計・平均支給額・勤務日数・昇給後の予算を求めます。SUMPRODUCT・COUNTA・SUM・COUNTIF・IF を使います。", "行政需要薪資總額、人均薪資、總工作天數與調薪後的預算。隨機題會在 SUMPRODUCT、COUNTA、SUM、COUNTIF 和 IF 之間切換。"),
          sheet: eventStaff,
          tasks: eventPayrollReviewTasks("cap-event-payroll-review"),
          hint: L("工资总额要三个数组同时相乘，不能只汇总日薪。", "Total payroll multiplies three arrays; do not total daily rates alone.", "人件費合計は3つの配列を掛けます。日給だけを合計しません。", "薪資總額要讓三個陣列同時相乘，不能只加總日薪。"),
        }),
        practice({
          id: "cap-event-funding",
          title: L("第六步：贷款月供、总还款与资金比较", "Step 6: loan payments, total repayment, and comparison", "第6段階：返済額・総返済・比較", "第六步：貸款月付、總還款與資金比較"),
          lead: L("主管要在场地扩建、设备采购、培训与车辆四个资金方案中比较月供和总成本；随机题还可能问未来值和目标现值。", "The manager compares monthly payments and total cost across four funding plans. Some tasks also ask for future or present value.", "4つの資金案で月額返済と総コストを比較します。将来価値や目標現在価値も出ます。", "主管要在場地擴建、設備採購、培訓與車輛四個資金方案之間比較月付和總成本；隨機題也可能詢問未來值與目標現值。"),
          sheet: eventFunding,
          tasks: eventFundingTasks("cap-event-funding"),
          hint: L("PMT 的年利率先除 12；付款通常带负号，最外层再加负号显示正数。", "Divide the annual rate by 12. PMT is usually negative; negate it for a positive payment.", "年利率を12で割ります。PMT は通常マイナスなので、外側で符号を反転します。", "PMT 的年利率要先除以 12；付款通常為負值，最外層再加負號顯示正數。"),
        }),
        practice({
          id: "cap-event-final",
          title: L("年度活动终局：预算、人员、日期与资金综合抽题", "Annual-event finale: budget, staff, dates, and funding", "年次イベント最終：予算・人員・日付・資金", "年度活動終局：預算、人力、日期與資金綜合抽題"),
          lead: L("这一轮把三张表全部混在一起。题目不会告诉你用哪个函数，只给业务目标；先判断属于预算、人员还是资金，再动手。", "This final draw mixes all three sheets. The task gives a business goal, not a function name. Decide whether it is budget, staffing, or funding first.", "3つの表を混ぜます。関数名ではなく業務目標だけが示されます。予算・人員・資金のどれかを判断してから解きます。", "這一輪把三張表全部混在一起。題目不會告訴你要用哪個函數，只給業務目標；先判斷屬於預算、人力還是資金，再動手。"),
          sheet: eventBudget,
          tasks: eventBudgetRows("cap-event-final")
            .concat(eventAnalysisTasks("cap-event-final"))
            .concat(eventDateTasks("cap-event-final"))
            .concat(eventPayrollRows("cap-event-final"))
            .concat(eventPayrollReviewTasks("cap-event-final"))
            .concat(eventFundingTasks("cap-event-final")),
          hint: L("先看当前表格算的是什么金额，再决定主函数。", "Check what amount the current sheet tracks before choosing the main function.", "現在の表がどの金額を扱うか確認してから主関数を選びます。", "先確認目前表格算的是什麼金額，再決定主要函數。"),
        }),
      ], { xp: 100 }),
    ],
  });

  // CAPSTONES_CONTINUE

  function eventBudgetRows(prefix) {
    const variance = budgetRows.map((item) => quick({
      id: prefix + "-variance-" + item.row, sheet: eventBudget, target: "E" + item.row, label: eventLabels.budget,
      title: fill(L("计算{item}的预算差额", "Variance for {item}", "{item}の予算差異"), { item: item.item }),
      formula: "=C" + item.row + "-D" + item.row, functions: [],
    }));
    const status = budgetRows.map((item) => quick({
      id: prefix + "-status-" + item.row, sheet: eventBudget, target: "I" + item.row, label: eventLabels.budget,
      title: fill(L("判断{item}是否超支", "Is {item} over budget?", "{item}は予算超過か"), { item: item.item }),
      formula: '=IF(C' + item.row + '-D' + item.row + '<0,"OVER","OK")', functions: ["IF"],
    }));
    return variance.concat(status);
  }

  function eventAnalysisTasks(prefix) {
    return [
      quick({ id: prefix + "-budget", sheet: eventBudget, target: "K2", label: eventLabels.analysis,
        title: L("总预算", "Total budget", "予算合計"), formula: "=SUM(C2:C11)", functions: ["SUM"] }),
      quick({ id: prefix + "-actual", sheet: eventBudget, target: "K3", label: eventLabels.analysis,
        title: L("总实际支出", "Total actual spend", "実績合計"), formula: "=SUM(D2:D11)", functions: ["SUM"] }),
      quick({ id: prefix + "-variance", sheet: eventBudget, target: "K4", label: eventLabels.analysis,
        title: L("整体预算结余", "Overall budget balance", "全体の予算残"),
        formula: "=SUM(C2:C11)-SUM(D2:D11)", functions: ["SUM"] }),
      quick({ id: prefix + "-over-count", sheet: eventBudget, target: "K5", label: eventLabels.analysis,
        title: L("超支项目数", "Number of over-budget items", "予算超過の件数"),
        formula: '=COUNTIF(E2:E11,"<0")', functions: ["COUNTIF"] }),
      quick({ id: prefix + "-catering", sheet: eventBudget, target: "K6", label: eventLabels.analysis,
        title: L("餐饮实际支出", "Catering actual spend", "飲食の実績"),
        formula: L('=SUMIF(A2:A11,"餐饮",D2:D11)', '=SUMIF(A2:A11,"Catering",D2:D11)', '=SUMIF(A2:A11,"飲食",D2:D11)'), functions: ["SUMIF"] }),
      quick({ id: prefix + "-review-count", sheet: eventBudget, target: "K7", label: eventLabels.analysis,
        title: L("待复核项目数", "Items awaiting review", "要確認の件数"),
        formula: L('=COUNTIF(H2:H11,"待复核")', '=COUNTIF(H2:H11,"Review")', '=COUNTIF(H2:H11,"要確認")'), functions: ["COUNTIF"] }),
      quick({ id: prefix + "-avg-actual", sheet: eventBudget, target: "K8", label: eventLabels.analysis,
        title: L("平均每项实际支出", "Average actual spend per item", "1項目あたりの平均実績"),
        formula: "=ROUND(AVERAGE(D2:D11),0)", functions: ["ROUND", "AVERAGE"] }),
      quick({ id: prefix + "-overspend", sheet: eventBudget, target: "K9", label: eventLabels.analysis,
        title: L("超支总额", "Total overspend", "予算超過総額"),
        formula: '=-SUMIF(E2:E11,"<0")', functions: ["SUMIF"] }),
      quick({ id: prefix + "-largest", sheet: eventBudget, target: "K10", label: eventLabels.analysis,
        title: L("预算最大的项目", "Largest budget item", "最大予算の項目"),
        formula: "=INDEX(B2:B11,MATCH(MAX(C2:C11),C2:C11,0))", functions: ["INDEX", "MATCH", "MAX"] }),
      quick({ id: prefix + "-unused", sheet: eventBudget, target: "K11", label: eventLabels.analysis,
        title: L("未使用预备金", "Unused contingency", "未使用の予備費"),
        formula: L('=SUMIF(H2:H11,"未使用",C2:C11)', '=SUMIF(H2:H11,"Unused",C2:C11)', '=SUMIF(H2:H11,"未使用",C2:C11)'), functions: ["SUMIF"] }),
    ];
  }

  function eventDateTasks(prefix) {
    return [
      quick({ id: prefix + "-venue-days", sheet: eventBudget, target: "K2", label: eventLabels.date,
        title: L("场地租赁距活动还有几天", "Days from venue deadline to event", "会場期限からイベントまで"),
        formula: "=DATE(2026,5,20)-G2", functions: ["DATE"] }),
      quick({ id: prefix + "-catering-near", sheet: eventBudget, target: "K3", label: eventLabels.date,
        title: L("餐饮截止是否只剩 7 天以内", "Is catering due within seven days?", "飲食期限は7日以内か"),
        formula: '=IF(DATE(2026,5,20)-G3<=7,"NEAR","OK")', functions: ["IF", "DATE"] }),
      quick({ id: prefix + "-month", sheet: eventBudget, target: "K4", label: eventLabels.date,
        title: L("第一项截止月份", "Due month of the first item", "最初の期限月"),
        formula: "=MONTH(G2)", functions: ["MONTH"] }),
      quick({ id: prefix + "-day", sheet: eventBudget, target: "K5", label: eventLabels.date,
        title: L("保险截止日", "Insurance due day", "保険期限の日"),
        formula: "=DAY(G10)", functions: ["DAY"] }),
      quick({ id: prefix + "-text", sheet: eventBudget, target: "K6", label: eventLabels.date,
        title: L("生成截止年月日标签", "Build a due-date label", "期限の年月日ラベル"),
        formula: '=TEXT(G5,"yyyy-mm-dd")', functions: ["TEXT"] }),
      quick({ id: prefix + "-review-days", sheet: eventBudget, target: "K7", label: eventLabels.date,
        title: L("设备截止还有几天", "Days until the equipment deadline", "設備期限までの日数"),
        formula: "=DATE(2026,5,20)-G4", functions: ["DATE"] }),
      quick({ id: prefix + "-early", sheet: eventBudget, target: "K8", label: eventLabels.date,
        title: L("交通住宿是否提前 10 天以上截止", "Travel due at least ten days early?", "交通宿泊は10日以上前か"),
        formula: '=IF(DATE(2026,5,20)-G7>10,"EARLY","LATE")', functions: ["IF", "DATE"] }),
      quick({ id: prefix + "-after", sheet: eventBudget, target: "K9", label: eventLabels.date,
        title: L("场地截止是否早于活动日", "Is the venue deadline before the event?", "会場期限はイベント前か"),
        formula: '=IF(G2<DATE(2026,5,20),"BEFORE","AFTER")', functions: ["IF", "DATE"] }),
    ];
  }

  function eventPayrollRows(prefix) {
    const pay = staffRows.map((item) => quick({
      id: prefix + "-pay-" + item.row, sheet: eventStaff, target: "F" + item.row, label: eventLabels.payroll,
      title: fill(L("计算{name}的应发工资", "Calculate pay for {name}", "{name}の支給額を計算"), { name: item.name }),
      formula: "=C" + item.row + "*D" + item.row + "*E" + item.row, functions: [],
    }));
    const flag = staffRows.map((item) => quick({
      id: prefix + "-flag-" + item.row, sheet: eventStaff, target: "G" + item.row, label: eventLabels.payroll,
      title: fill(L("{name}是否达到 1000 元", "Does {name} reach 1000?", "{name}は1000元以上か"), { name: item.name }),
      formula: '=IF(C' + item.row + '*D' + item.row + '*E' + item.row + '>=1000,"REVIEW","OK")', functions: ["IF"],
    }));
    return pay.concat(flag);
  }

  function eventPayrollReviewTasks(prefix) {
    return [
      quick({ id: prefix + "-total", sheet: eventStaff, target: "G2", label: eventLabels.payrollReview,
        title: L("活动人员工资总额", "Total event payroll", "イベント人件費合計"),
        formula: "=ROUND(SUMPRODUCT(C2:C9,D2:D9,E2:E9),0)", functions: ["ROUND", "SUMPRODUCT"] }),
      quick({ id: prefix + "-avg", sheet: eventStaff, target: "G3", label: eventLabels.payrollReview,
        title: L("人均应发工资", "Average pay per person", "1人あたり支給額"),
        formula: "=ROUND(SUMPRODUCT(C2:C9,D2:D9,E2:E9)/COUNTA(A2:A9),0)", functions: ["ROUND", "SUMPRODUCT", "COUNTA"] }),
      quick({ id: prefix + "-days", sheet: eventStaff, target: "G4", label: eventLabels.payrollReview,
        title: L("累计工作天数", "Total workdays", "勤務日数合計"), formula: "=SUM(C2:C9)", functions: ["SUM"] }),
      quick({ id: prefix + "-three-days", sheet: eventStaff, target: "G5", label: eventLabels.payrollReview,
        title: L("工作三天的人数", "Staff working three days", "3日勤務の人数"),
        formula: "=COUNTIF(C2:C9,3)", functions: ["COUNTIF"] }),
      quick({ id: prefix + "-raise", sheet: eventStaff, target: "G6", label: eventLabels.payrollReview,
        title: L("全员上调 10% 后的工资", "Payroll after a 10% increase", "全体10%増の給与"),
        formula: "=ROUND(SUMPRODUCT(C2:C9,D2:D9,E2:E9)*1.1,0)", functions: ["ROUND", "SUMPRODUCT"] }),
      quick({ id: prefix + "-lin", sheet: eventStaff, target: "G7", label: eventLabels.payrollReview,
        title: L("林晓的应发工资", "Pay for Olivia Bennett", "佐藤美咲の支給額", "林雅婷的應發薪資"),
        formula: "=ROUND(C2*D2*E2,0)", functions: ["ROUND"] }),
      quick({ id: prefix + "-compare", sheet: eventStaff, target: "G8", label: eventLabels.payrollReview,
        title: L("林晓是否高于郑文", "Is Olivia Bennett paid more than Daniel Kim?", "佐藤美咲は中村葵より高いか", "林雅婷是否高於鄭思妤"),
        formula: L(
          '=IF(C2*D2*E2>C9*D9*E9,"林晓","郑文")',
          '=IF(C2*D2*E2>C9*D9*E9,"Olivia Bennett","Daniel Kim")',
          '=IF(C2*D2*E2>C9*D9*E9,"佐藤美咲","中村葵")',
          '=IF(C2*D2*E2>C9*D9*E9,"林雅婷","鄭思妤")'
        ), functions: ["IF"] }),
      quick({ id: prefix + "-highest-rate", sheet: eventStaff, target: "G9", label: eventLabels.payrollReview,
        title: L("日薪最高的岗位", "Role with the highest daily rate", "最高日給の役割"),
        formula: "=INDEX(B2:B9,MATCH(MAX(D2:D9),D2:D9,0))", functions: ["INDEX", "MATCH", "MAX"] }),
    ];
  }

  function eventFundingTasks(prefix) {
    const payments = [2, 3, 4, 5].map((row) => quick({
      id: prefix + "-pmt-" + row, sheet: eventFunding, target: "E" + row, label: eventLabels.funding,
      title: fill(L("计算{plan}的月供", "Monthly payment for {plan}", "{plan}の月額返済"), { plan: eventFunding["A" + row] }),
      formula: "=-PMT(B" + row + "/12,C" + row + ",D" + row + ")", functions: ["PMT"],
    }));
    const totals = [2, 3, 4, 5].map((row) => quick({
      id: prefix + "-total-" + row, sheet: eventFunding, target: "F" + row, label: eventLabels.funding,
      title: fill(L("{plan}的总还款", "Total repayment for {plan}", "{plan}の総返済額"), { plan: eventFunding["A" + row] }),
      formula: "=-PMT(B" + row + "/12,C" + row + ",D" + row + ")*C" + row, functions: ["PMT"],
    }));
    return payments.concat(totals, [
      quick({ id: prefix + "-round", sheet: eventFunding, target: "G2", label: eventLabels.funding,
        title: L("场地扩建月供保留两位", "Round the venue payment", "会場拡張の月額を小数2桁に"),
        formula: "=ROUND(-PMT(B2/12,C2,D2),2)", functions: ["ROUND", "PMT"] }),
      quick({ id: prefix + "-safe", sheet: eventFunding, target: "G3", label: eventLabels.funding,
        title: L("场地月供是否低于 6000", "Is the venue payment below 6000?", "会場返済は6000未満か"),
        formula: '=IF(-PMT(B2/12,C2,D2)<6000,"SAFE","HIGH")', functions: ["IF", "PMT"] }),
      quick({ id: prefix + "-interest", sheet: eventFunding, target: "G4", label: eventLabels.funding,
        title: L("场地贷款总利息占本金比例", "Interest as a share of principal", "総利息の元金比率"),
        formula: "=ROUND((-PMT(B2/12,C2,D2)*C2-D2)/D2,3)", functions: ["ROUND", "PMT"] }),
      quick({ id: prefix + "-cheap", sheet: eventFunding, target: "G5", label: eventLabels.funding,
        title: L("哪个方案月供更低", "Which plan has the lower payment?", "月額が低いのはどちらか"),
        formula: '=IF(-PMT(B5/12,C5,D5)<-PMT(B2/12,C2,D2),"VEHICLE","VENUE")', functions: ["IF", "PMT"] }),
      quick({ id: prefix + "-growth", sheet: eventFunding, target: "G6", label: eventLabels.funding,
        title: L("场地资金五年后的未来值", "Future value of the venue principal", "会場元金の5年後価値"),
        formula: "=ROUND(FV(B2/12,C2,0,-D2),0)", functions: ["ROUND", "FV"] }),
      quick({ id: prefix + "-target", sheet: eventFunding, target: "G7", label: eventLabels.funding,
        title: L("今天需准备多少才能五年达到 25 万", "Present value needed for 250k in five years", "5年後25万に必要な現在価値"),
        formula: "=ROUND(-PV(B2/12,C2,0,250000),0)", functions: ["ROUND", "PV"] }),
    ]);
  }

  D.registerChapter({
    id: "ch11-capstone-inventory",
    icon: "11",
    title: L("第 11 章 · 大型情境：采购与库存盘点", "Chapter 11 · Capstone: Procurement and Stock Count", "第11章 · 大型ケース：購買と棚卸", "第 11 章 · 大型情境：採購與庫存盤點"),
    subtitle: L("月底只给一张库存表和一张供应商主数据。依次做预警、补货预算、分类统计、交期判断和库存价值，最后写出一份能直接用于采购会的结论。", "Use one stock sheet and one supplier master at month-end. Work through alerts, reorder budgets, category totals, lead-time checks, and inventory value, then deliver a procurement-ready conclusion.", "月末に在庫表と仕入先マスタが1枚ずつあります。警告・補充予算・分類集計・納期確認・在庫価値を順に行い、購買会議で使える結論を作ります。", "月底只有一份庫存表與一份供應商主檔。依序完成缺貨預警、補貨預算、分類統計、交期判斷與庫存價值，最後整理出可直接帶進採購會議的結論。"),
    levels: [
      level("capstone-inventory", "exam", L("月底盘点：从缺货预警到采购预算", "Stock Count: From Shortage Alerts to Purchase Budget", "棚卸：欠品警告から購買予算へ", "月底盤點：從缺貨預警到採購預算"), [
        learn(
          "brief-capstone-inventory",
          L("采购会前半小时，仓库主管发来库存表", "The warehouse lead sends the stock sheet before the purchasing meeting", "購買会議の30分前、倉庫責任者から在庫表が届く", "採購會議前半小時，倉庫主管傳來庫存表"),
          L("仓库有办公、电子、礼品三类商品，部分低于安全库存。采购主管要知道哪些需要补、补多少、花多少钱、哪家供应商交期长，以及库存资金压在哪里。所有步骤都围绕同一份月底库存数据。", "The warehouse has office, electronics, and gift SKUs, some below safety stock. Purchasing needs to know what to reorder, how much, the cost, which suppliers are slow, and where inventory capital is tied up. Every step uses the same month-end stock data.", "倉庫にはオフィス・電子・ギフトの商品があり、一部が安全在庫を下回っています。何をどれだけ補充し、いくらかかり、どの仕入先が遅く、資金がどこに滞留しているかを判断します。同じ月末データを使います。", "倉庫有辦公、電子、禮品三類商品，部分低於安全庫存。採購主管要知道哪些要補、補多少、要花多少錢、哪家供應商交期較長，以及資金壓在哪些庫存上。所有步驟都圍繞同一份月底庫存資料。"),
          [
            L("IF 处理单行预警，MAX 计算补到安全库存的差额", "Use IF for row alerts and MAX for the gap to safety stock", "行ごとの警告は IF、安全在庫までの差は MAX です", "IF 處理單一橫列預警，MAX 計算補到安全庫存的差額"),
            L("分类数量用 SUMIF/COUNTIF，价值用 SUMPRODUCT", "Use SUMIF/COUNTIF for category amounts and SUMPRODUCT for value", "分類数量は SUMIF/COUNTIF、価値は SUMPRODUCT です", "分類數量用 SUMIF/COUNTIF，價值用 SUMPRODUCT"),
            L("供应商信息来自主数据表，适合精确查找", "Supplier details come from a master table and need exact lookup", "仕入先情報はマスタ表から完全一致で検索します", "供應商資訊來自主檔，適合以完全相符方式查閱"),
            L("补货建议要基于当前库存和安全库存，不是拍脑袋定数量", "Reorder suggestions must use on-hand and safety stock, not guesswork", "補充数は現在庫と安全在庫から決めます", "補貨建議要依目前庫存與安全庫存計算，不能憑感覺決定數量"),
          ],
          L("先处理会缺货的商品，再计算预算和分类结构。库存表是明细，供应商表是查找来源，两类数据不要混用。", "Handle likely shortages first, then budget and category structure. The stock sheet is detail; the supplier sheet is a lookup source.", "まず欠品リスク、次に予算と分類構造を確認します。在庫表は明細、仕入先表は検索元です。", "先處理可能缺貨的商品，再計算預算與分類結構。庫存表是明細，供應商表是查閱來源，兩類資料不要混用。"),
          '=IF(D2<E2,"LOW","OK")'
        ),
        practice({
          id: "cap-stock-alert",
          title: L("第一步：逐行标记库存风险", "Step 1: flag stock risk row by row", "第1段階：行ごとの在庫リスク", "第一步：逐列標記庫存風險"),
          lead: L("随机抽一个商品，比较当前库存与安全库存。低于安全库存返回 LOW，否则 OK。", "A SKU is selected. Compare on-hand with safety stock. Return LOW when below safety stock; otherwise OK.", "ランダムな商品で現在庫と安全在庫を比較します。下回れば LOW、それ以外は OK です。", "隨機抽一項商品，比較目前庫存與安全庫存。低於安全庫存時傳回 LOW，否則傳回 OK。"),
          sheet: stock,
          tasks: stockAlertTasks("cap-stock-alert"),
          hint: L("当前库存位于 D 列，安全库存位于 E 列。", "On-hand is in D; safety stock is in E.", "現在庫はD列、安全在庫はE列です。", "目前庫存在 D 欄，安全庫存在 E 欄。"),
        }),
        practice({
          id: "cap-stock-reorder",
          title: L("第二步：补多少、花多少钱", "Step 2: how much to reorder and what it costs", "第2段階：補充数と予算", "第二步：補多少、花多少錢"),
          lead: L("先求补到安全库存所需数量，部分题再乘采购单价得到预算。库存已经高于安全线时应补 0。", "First find the units needed to reach safety stock; some tasks multiply by unit cost for budget. Return 0 when already above safety stock.", "安全在庫まで必要な数を求め、一部は単価を掛けて予算にします。安全在庫以上なら0です。", "先求出補到安全庫存所需的數量，部分題目再乘上採購單價計算預算。庫存已高於安全線時應補 0。"),
          sheet: stock,
          tasks: stockReorderTasks("cap-stock-reorder"),
          hint: L("用 MAX(0, 安全库存 - 当前库存) 避免负补货量。", "Use MAX(0, safety stock - on-hand) to avoid negative reorder quantities.", "MAX(0, 安全在庫−現在庫) で負の補充数を防ぎます。", "用 MAX(0, 安全庫存 - 目前庫存) 避免算出負的補貨量。"),
        }),
        practice({
          id: "cap-stock-summary",
          title: L("第三步：分类盘点与成本概况", "Step 3: category counts and cost overview", "第3段階：分類別棚卸と原価概要", "第三步：分類盤點與成本概況"),
          lead: L("采购主管要按分类看品目数、库存件数、单价和极值。随机题在 SUMIF、COUNTIF、SUM、AVERAGE、MIN 之间切换。", "The purchasing lead needs category counts, units, prices, and extremes. Tasks switch among SUMIF, COUNTIF, SUM, AVERAGE, and MIN.", "分類別の品目数・在庫数・単価・最大最小を確認します。SUMIF・COUNTIF・SUM・AVERAGE・MIN が切り替わります。", "採購主管要依分類查看品項數、庫存件數、單價與極值。隨機題會在 SUMIF、COUNTIF、SUM、AVERAGE、MIN 之間切換。"),
          sheet: stock,
          tasks: stockSummaryTasks("cap-stock-summary"),
          hint: L("分类名在 C 列，数量在 D 列，单价在 F 列。", "Category is C, units are D, and unit cost is F.", "分類はC列、数量はD列、単価はF列です。", "分類名稱在 C 欄，數量在 D 欄，單價在 F 欄。"),
        }),
        practice({
          id: "cap-stock-supplier",
          title: L("第四步：供应商交期与入库天数", "Step 4: supplier lead times and stock age", "第4段階：仕入先納期と入荷経過日数", "第四步：供應商交期與入庫天數"),
          lead: L("仓库和采购要确认交期、联系人和结算方式，还要找出长期未入库的商品。随机题会组合 VLOOKUP、DATE 和 IF。", "Warehouse and purchasing need lead times, contacts, settlement, and stale-stock checks. Tasks combine VLOOKUP, DATE, and IF.", "納期・担当者・決済方法を確認し、長期間入荷のない商品も探します。VLOOKUP・DATE・IF を組み合わせます。", "倉庫與採購要確認交期、聯絡人與結算方式，還要找出長期未入庫的商品。隨機題會結合 VLOOKUP、DATE 和 IF。"),
          sheet: stock,
          tasks: stockSupplierTasks("cap-stock-supplier"),
          hint: L("供应商主数据在另一个工作表，查找列是 G 列的供应商名。", "Supplier master data is on another sheet and matches the supplier name in column G.", "仕入先マスタは別シートで、G列の仕入先名で検索します。", "供應商主檔在另一個工作表，以 G 欄的供應商名稱查閱。"),
        }),
        practice({
          id: "cap-stock-value",
          title: L("第五步：库存资金压在哪些商品上", "Step 5: where inventory capital is tied up", "第5段階：在庫資金の偏り", "第五步：庫存資金壓在哪些商品上"),
          lead: L("财务要看库存总价值、加权平均成本、最贵商品和价值占比。随机题要求你选择 SUMPRODUCT 还是普通汇总。", "Finance asks for total value, weighted cost, the most expensive SKU, and scale checks. Choose between SUMPRODUCT and plain totals.", "財務は在庫総額・加重平均原価・最高単価商品を確認します。SUMPRODUCT と通常集計を使い分けます。", "財務要看庫存總價值、加權平均成本、最貴商品與價值占比。隨機題要求你判斷該用 SUMPRODUCT 還是一般彙總。"),
          sheet: stock,
          tasks: stockValueTasks("cap-stock-value"),
          hint: L("库存价值 = 当前库存 × 采购单价，逐行相乘后汇总。", "Inventory value is on-hand × unit cost, multiplied row by row and totaled.", "在庫価値＝現在庫×仕入単価を各行で掛けて合計します。", "庫存價值 = 目前庫存 × 採購單價，逐列相乘後加總。"),
        }),
        practice({
          id: "cap-stock-final",
          title: L("采购会终局：随机抽一道完整盘点题", "Procurement finale: one complete stock question", "購買会議最終：棚卸問題を1問抽選", "採購會議終局：隨機抽一道完整盤點題"),
          lead: L("预警、补货、分类、供应商、交期和库存价值全部混练。先看目标格和业务问题，再决定用 IF、SUMIF、VLOOKUP 还是 SUMPRODUCT。", "Alerts, reorder, categories, suppliers, lead times, and inventory value are mixed. Inspect the target and business question before choosing IF, SUMIF, VLOOKUP, or SUMPRODUCT.", "警告・補充・分類・仕入先・納期・在庫価値を混ぜます。対象セルと業務上の問いを確認してから関数を選びます。", "預警、補貨、分類、供應商、交期與庫存價值全部混合練習。先看目標儲存格與業務問題，再決定用 IF、SUMIF、VLOOKUP 還是 SUMPRODUCT。"),
          sheet: stock,
          tasks: stockAlertTasks("cap-stock-final")
            .concat(stockReorderTasks("cap-stock-final"))
            .concat(stockSummaryTasks("cap-stock-final"))
            .concat(stockSupplierTasks("cap-stock-final"))
            .concat(stockValueTasks("cap-stock-final")),
          hint: L("如果题干问供应商，先看是否已有供应商主数据；问价值，再考虑数量乘单价。", "If the task asks about a supplier, use the master data. If it asks for value, multiply units by cost.", "仕入先の質問ならマスタ、価値の質問なら数量×単価を考えます。", "如果題目問供應商，先確認是否已有供應商主檔；若問價值，再考慮數量乘單價。"),
        }),
      ], { xp: 90 }),
    ],
  });

  // CAPSTONES_CONTINUE

  function stockAlertTasks(prefix) {
    return stockRows.map((item) => quick({
      id: prefix + "-alert-" + item.sku, sheet: stock, target: "J" + item.row, label: stockLabels.alert,
      title: fill(L("{item}是否需要补货", "Does {item} need reordering?", "{item}は補充が必要か"), { item: item.item }),
      formula: '=IF(D' + item.row + '<E' + item.row + ',"LOW","OK")', functions: ["IF"],
    }));
  }

  function stockReorderTasks(prefix) {
    return stockRows.map((item) => quick({
      id: prefix + "-qty-" + item.sku, sheet: stock, target: "I" + item.row, label: stockLabels.reorder,
      title: fill(L("给{item}补到安全库存", "Restock {item} to safety level", "{item}を安全在庫まで補充"), { item: item.item }),
      formula: "=MAX(0,E" + item.row + "-D" + item.row + ")", functions: ["MAX"],
    })).concat(stockRows.slice(0, 5).map((item) => quick({
      id: prefix + "-cost-" + item.sku, sheet: stock, target: "K" + item.row, label: stockLabels.reorder,
      title: fill(L("{item}的补货预算", "Reorder budget for {item}", "{item}の補充予算"), { item: item.item }),
      formula: "=MAX(0,E" + item.row + "-D" + item.row + ")*F" + item.row, functions: ["MAX"],
    })));
  }

  function stockSummaryTasks(prefix) {
    return [
      quick({ id: prefix + "-electronics", sheet: stock, target: "K2", label: stockLabels.summary,
        title: L("电子类商品种类数", "Count electronics SKUs", "電子カテゴリの品目数"),
        formula: L('=COUNTIF(C2:C11,"电子")', '=COUNTIF(C2:C11,"Electronics")', '=COUNTIF(C2:C11,"電子")'), functions: ["COUNTIF"] }),
      quick({ id: prefix + "-office-units", sheet: stock, target: "K3", label: stockLabels.summary,
        title: L("办公类当前库存合计", "Office stock units", "オフィス分類の在庫数"),
        formula: L('=SUMIF(C2:C11,"办公",D2:D11)', '=SUMIF(C2:C11,"Office",D2:D11)', '=SUMIF(C2:C11,"オフィス",D2:D11)'), functions: ["SUMIF"] }),
      quick({ id: prefix + "-gift-count", sheet: stock, target: "K4", label: stockLabels.summary,
        title: L("礼品类商品数", "Count gift SKUs", "ギフト品目数"),
        formula: L('=COUNTIF(C2:C11,"礼品")', '=COUNTIF(C2:C11,"Gift")', '=COUNTIF(C2:C11,"ギフト")'), functions: ["COUNTIF"] }),
      quick({ id: prefix + "-units", sheet: stock, target: "K5", label: stockLabels.summary,
        title: L("当前库存总件数", "Total units on hand", "現在庫の総数"),
        formula: "=SUM(D2:D11)", functions: ["SUM"] }),
      quick({ id: prefix + "-avg-cost", sheet: stock, target: "K6", label: stockLabels.summary,
        title: L("采购单价平均值", "Average unit cost", "平均仕入単価"),
        formula: "=ROUND(AVERAGE(F2:F11),2)", functions: ["ROUND", "AVERAGE"] }),
      quick({ id: prefix + "-min-stock", sheet: stock, target: "K7", label: stockLabels.summary,
        title: L("最低当前库存", "Lowest stock level", "最低在庫数"),
        formula: "=MIN(D2:D11)", functions: ["MIN"] }),
      quick({ id: prefix + "-electronics-units", sheet: stock, target: "K8", label: stockLabels.summary,
        title: L("电子类当前库存件数", "Electronics units on hand", "電子カテゴリの在庫数"),
        formula: L('=SUMIF(C2:C11,"电子",D2:D11)', '=SUMIF(C2:C11,"Electronics",D2:D11)', '=SUMIF(C2:C11,"電子",D2:D11)'), functions: ["SUMIF"] }),
      quick({ id: prefix + "-high-cost", sheet: stock, target: "K9", label: stockLabels.summary,
        title: L("单价超过 1000 的商品数", "SKUs above 1000 unit cost", "単価1000超の品目数"),
        formula: '=COUNTIF(F2:F11,">1000")', functions: ["COUNTIF"] }),
    ];
  }

  function stockSupplierTasks(prefix) {
    const lookups = [2, 4, 7, 9].map((row, index) => quick({
      id: prefix + "-days-" + row, sheet: stock, target: "K" + (index + 2), label: stockLabels.supplier,
      title: fill(L("查找{supplier}的到货天数", "Find lead days for {supplier}", "{supplier}の納期日数"), { supplier: stock["G" + row] }),
      formula: "=VLOOKUP(G" + row + ",$A$14:$D$20,3,FALSE)", functions: ["VLOOKUP"],
    }));
    return lookups.concat([
      quick({ id: prefix + "-contact", sheet: stock, target: "K6", label: stockLabels.supplier,
        title: L("视野科技的供应商联系人", "Contact for Vision Tech", "視野テックの担当者"),
        formula: "=VLOOKUP(G4,$A$14:$D$20,2,FALSE)", functions: ["VLOOKUP"] }),
      quick({ id: prefix + "-terms", sheet: stock, target: "K7", label: stockLabels.supplier,
        title: L("纸品社的结算方式", "Settlement for Paper House", "紙品社の決済方法"),
        formula: "=VLOOKUP(G3,$A$14:$D$20,4,FALSE)", functions: ["VLOOKUP"] }),
      quick({ id: prefix + "-age", sheet: stock, target: "K8", label: stockLabels.supplier,
        title: L("钢笔距上次入库多少天", "Days since the pen's last receipt", "ペンの最終入荷からの日数"),
        formula: "=DATE(2026,3,31)-H2", functions: ["DATE"] }),
      quick({ id: prefix + "-stale", sheet: stock, target: "K9", label: stockLabels.supplier,
        title: L("笔记本超过 90 天未入库吗", "Laptop stock older than 90 days?", "ノートPCは90日超未入荷か"),
        formula: '=IF(DATE(2026,3,31)-H5>90,"CHECK","OK")', functions: ["IF", "DATE"] }),
      quick({ id: prefix + "-lead-check", sheet: stock, target: "K10", label: stockLabels.supplier,
        title: L("轻舟电脑到货是否超过 7 天", "Does Lightboat take over 7 days?", "軽舟PCの納期は7日超か"),
        formula: '=IF(VLOOKUP(G5,$A$14:$D$20,3,FALSE)>7,"SLOW","FAST")', functions: ["IF", "VLOOKUP"] }),
    ]);
  }

  function stockValueTasks(prefix) {
    return [
      quick({ id: prefix + "-value", sheet: stock, target: "K2", label: stockLabels.value,
        title: L("库存总价值", "Total inventory value", "在庫総額"),
        formula: "=ROUND(SUMPRODUCT(D2:D11,F2:F11),0)", functions: ["ROUND", "SUMPRODUCT"] }),
      quick({ id: prefix + "-weighted-cost", sheet: stock, target: "K3", label: stockLabels.value,
        title: L("库存加权平均成本", "Weighted average inventory cost", "在庫の加重平均原価"),
        formula: "=ROUND(SUMPRODUCT(D2:D11,F2:F11)/SUM(D2:D11),2)", functions: ["ROUND", "SUMPRODUCT", "SUM"] }),
      quick({ id: prefix + "-premium", sheet: stock, target: "K4", label: stockLabels.value,
        title: L("最贵商品", "Most expensive SKU", "最高単価の商品"),
        formula: "=INDEX(B2:B11,MATCH(MAX(F2:F11),F2:F11,0))", functions: ["INDEX", "MATCH", "MAX"] }),
      quick({ id: prefix + "-risk-value", sheet: stock, target: "K5", label: stockLabels.value,
        title: L("库存价值是否超过 15 万", "Is stock value above 150,000?", "在庫価値は15万超か"),
        formula: '=IF(SUMPRODUCT(D2:D11,F2:F11)>150000,"HIGH","NORMAL")', functions: ["IF", "SUMPRODUCT"] }),
      quick({ id: prefix + "-avg-units", sheet: stock, target: "K6", label: stockLabels.value,
        title: L("平均每类商品库存", "Average units per SKU", "1品目あたりの平均在庫"),
        formula: "=ROUND(AVERAGE(D2:D11),1)", functions: ["ROUND", "AVERAGE"] }),
      quick({ id: prefix + "-office-value", sheet: stock, target: "K7", label: stockLabels.value,
        title: L("办公类库存件数", "Office inventory units", "オフィス分類の在庫数"),
        formula: L('=SUMIF(C2:C11,"办公",D2:D11)', '=SUMIF(C2:C11,"Office",D2:D11)', '=SUMIF(C2:C11,"オフィス",D2:D11)'), functions: ["SUMIF"] }),
      quick({ id: prefix + "-spread", sheet: stock, target: "K8", label: stockLabels.value,
        title: L("最高与最低单价的差", "Gap between highest and lowest cost", "最高単価と最低単価の差"),
        formula: "=MAX(F2:F11)-MIN(F2:F11)", functions: ["MAX", "MIN"] }),
      quick({ id: prefix + "-round", sheet: stock, target: "K9", label: stockLabels.value,
        title: L("库存总价值取到百元", "Round stock value to hundreds", "在庫価値を百単位に丸める"),
        formula: "=ROUND(SUMPRODUCT(D2:D11,F2:F11),-2)", functions: ["ROUND", "SUMPRODUCT"] }),
    ];
  }

  D.course.chapters.sort((left, right) => Number(left.icon || 0) - Number(right.icon || 0));
})();
