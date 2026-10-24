(function () {
  "use strict";

  const D = window.CourseData;
  const K = window.CurriculumKit;
  const baseL = K.L;
  const fill = K.fill;
  const task = K.task;
  const builder = K.builder;

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

  const quote = K.addSheet("quoteSheet", K.makeSheet([
    L("项目", "Item", "項目"),
    L("数量", "Qty", "数量"),
    L("单价", "Unit price", "単価"),
    L("金额", "Amount", "金額"),
    L("备注", "Note", "備考"),
    L("含税合计", "Tax-inclusive", "税込合計"),
    L("固定运费", "Fixed freight", "固定送料"),
    L("税率", "Tax rate", "税率"),
    L("客户", "Client", "顧客"),
  ], [
    [L("会议屏", "Meeting screen", "会議用スクリーン"), 2, 3200, undefined, L("含安装", "Installation included", "設置込み"), undefined, undefined, undefined, L("远山设计", "Yuanshan Design", "遠山デザイン")],
    [L("无线麦克风", "Wireless mic", "ワイヤレスマイク"), 4, 680, undefined, L("培训室", "Training room", "研修室"), undefined, undefined, undefined, L("星海教育", "Xinghai Education", "星海教育")],
    [L("商务笔记本", "Business laptop", "業務用ノートPC"), 6, 4500, undefined, L("三年保修", "3-year warranty", "3年保証"), undefined, undefined, undefined, L("新程科技", "Xincheng Tech", "新程テック")],
    [L("打印纸", "Printer paper", "印刷用紙"), 20, 35, undefined, L("A4", "A4", "A4"), undefined, undefined, undefined, L("晨光书店", "Chenguang Books", "晨光書店")],
    [L("饮水机", "Water dispenser", "ウォーターサーバー"), 2, 780, undefined, L("办公区", "Office area", "オフィス"), undefined, undefined, undefined, L("南岸物流", "Southbank Logistics", "南岸物流")],
    [L("投影仪", "Projector", "プロジェクター"), 1, 5600, undefined, L("会议室", "Meeting room", "会議室"), undefined, undefined, undefined, L("云谷医疗", "Yungu Medical", "雲谷医療")],
  ], {
    G2: 120,
    H2: 0.09,
  }));

  const sales = K.addSheet("officeSalesSheet", K.makeSheet([
    L("销售员", "Sales rep", "営業担当"),
    L("区域", "Region", "地域", "區域"),
    L("一月", "January", "1月"),
    L("二月", "February", "2月"),
    L("三月", "March", "3月"),
    L("目标", "Target", "目標"),
    L("完成率", "Attainment", "達成率"),
    L("合计", "Total", "合計"),
    L("提成", "Commission", "手数料"),
  ], [
    [L("林晓", "Lin", "林"), L("华东", "East", "東部"), 1200, 980, 1400, 4000, 0.895, undefined, undefined],
    [L("陈凯", "Chen", "陳"), L("华东", "East", "東部"), 760, 1120, 640, 3000, 0.84, undefined, undefined],
    [L("周宁", "Zhou", "周"), L("华北", "North", "北部"), 1580, 1340, 1220, 4500, 0.92, undefined, undefined],
    [L("赵敏", "Zhao", "趙"), L("华南", "South", "南部"), 420, 360, 510, 1800, 0.7167, undefined, undefined],
    [L("王磊", "Wang", "王"), L("华南", "South", "南部"), 980, 880, 760, 3000, 0.8733, undefined, undefined],
    [L("孙悦", "Sun", "孫"), L("西南", "Southwest", "南西部"), 1340, 1260, 1420, 4200, 0.9571, undefined, undefined],
    [L("李然", "Li", "李"), L("华北", "North", "北部"), 1100, 990, 1180, 3500, 0.9343, undefined, undefined],
    [L("郑文", "Zheng", "鄭"), L("西南", "Southwest", "南西部"), 640, 720, 880, 2500, 0.896, undefined, undefined],
  ], {
    J1: L("提成率", "Commission rate", "手数料率"),
    K1: 0.03,
    A10: L("月合计", "Month total", "月合計", "月合計"),
    C10: 8020,
    D10: 7650,
    E10: 8010,
    I2: 107.4,
    I3: 75.6,
    I4: 124.2,
    I5: 38.7,
    I6: 78.6,
    I7: 120.6,
    I8: 98.1,
    I9: 67.2,
  }));

  const payroll = K.addSheet("payrollSheet", K.makeSheet([
    L("姓名", "Name", "氏名"),
    L("部门", "Department", "部門"),
    L("出勤天数", "Days worked", "出勤日数"),
    L("日薪", "Daily rate", "日給"),
    L("迟到次数", "Late arrivals", "遅刻回数"),
    L("绩效系数", "Performance", "評価係数"),
    L("实发工资", "Net pay", "支給額"),
    L("复核标记", "Review flag", "確認フラグ"),
  ], [
    [L("林晓", "Lin", "林"), L("销售", "Sales", "営業"), 21, 300, 1, 1.10],
    [L("陈凯", "Chen", "陳"), L("销售", "Sales", "営業"), 20, 300, 0, 1.00],
    [L("周宁", "Zhou", "周"), L("技术", "Tech", "技術"), 22, 360, 2, 1.20],
    [L("赵敏", "Zhao", "趙"), L("人事", "HR", "人事"), 21, 280, 0, 1.05],
    [L("王磊", "Wang", "王"), L("技术", "Tech", "技術"), 23, 360, 1, 1.15],
    [L("孙悦", "Sun", "孫"), L("财务", "Finance", "財務"), 20, 320, 3, 1.00],
    [L("李然", "Li", "李"), L("销售", "Sales", "営業"), 19, 300, 0, 0.95],
    [L("郑文", "Zheng", "鄭"), L("技术", "Tech", "技術"), 21, 360, 1, 1.10],
  ]));

  const attendance = K.addSheet("attendanceSheet", K.makeSheet([
    L("姓名", "Name", "氏名"),
    L("部门", "Department", "部門"),
    L("出勤天数", "Days worked", "出勤日数"),
    L("基本工资", "Base salary", "基本給"),
    L("迟到次数", "Late arrivals", "遅刻回数"),
    L("绩效系数", "Performance", "評価係数"),
    L("应发工资", "Gross pay", "支給額"),
    L("复核标记", "Review flag", "確認フラグ"),
  ], [
    [L("林晓", "Lin", "林"), L("销售", "Sales", "営業"), 21, 6300, 1, 1.10, 6880],
    [L("陈凯", "Chen", "陳"), L("销售", "Sales", "営業"), 20, 6000, 0, 1.00, 6000],
    [L("周宁", "Zhou", "周"), L("技术", "Tech", "技術"), 22, 7920, 2, 1.20, 9404],
    [L("赵敏", "Zhao", "趙"), L("人事", "HR", "人事"), 21, 5880, 0, 1.05, 6174],
    [L("王磊", "Wang", "王"), L("技术", "Tech", "技術"), 23, 8280, 1, 1.15, 9472],
    [L("孙悦", "Sun", "孫"), L("财务", "Finance", "財務"), 20, 6400, 3, 1.00, 6250],
    [L("李然", "Li", "李"), L("销售", "Sales", "営業"), 19, 5700, 0, 0.95, 5415],
    [L("郑文", "Zheng", "鄭"), L("技术", "Tech", "技術"), 21, 7560, 1, 1.10, 8266],
  ]));

  const inventory = K.addSheet("inventorySheet", K.makeSheet([
    L("商品编号", "SKU", "商品番号"),
    L("商品", "Item", "商品"),
    L("分类", "Category", "分類"),
    L("当前库存", "On hand", "在庫数"),
    L("安全库存", "Safety stock", "安全在庫"),
    L("单价", "Unit cost", "単価"),
    L("补货建议", "Reorder", "補充数"),
    L("供应商", "Supplier", "仕入先"),
  ], [
    ["P01", L("钢笔", "Pen", "ペン"), L("办公", "Office", "オフィス"), 12, 30, 8, undefined, L("文具商", "Stationery Co.", "文具商会")],
    ["P02", L("打印纸", "Paper", "用紙"), L("办公", "Office", "オフィス"), 80, 50, 25, undefined, L("纸品社", "Paper House", "紙品社")],
    ["P03", L("显示器", "Monitor", "モニター"), L("电子", "Electronics", "電子"), 18, 10, 950, undefined, L("视野科技", "Vision Tech", "視野テック")],
    ["P04", L("笔记本", "Laptop", "ノートPC"), L("电子", "Electronics", "電子"), 6, 15, 4500, undefined, L("轻舟电脑", "Lightboat PC", "軽舟PC")],
    ["P05", L("背包", "Backpack", "バックパック"), L("礼品", "Gift", "ギフト"), 45, 20, 95, undefined, L("行者箱包", "Walker Bags", "ウォーカーバッグ")],
    ["P06", L("保温杯", "Thermal cup", "保温カップ"), L("礼品", "Gift", "ギフト"), 9, 25, 68, undefined, L("暖日生活", "Warmday", "暖日ライフ")],
    ["P07", L("键盘", "Keyboard", "キーボード"), L("电子", "Electronics", "電子"), 26, 12, 280, undefined, L("触感科技", "Tactile Tech", "触感テック")],
    ["P08", L("文件夹", "Folder", "フォルダー"), L("办公", "Office", "オフィス"), 70, 40, 15, undefined, L("文具商", "Stationery Co.", "文具商会")],
  ]));

  const orders = K.addSheet("ordersSheet", K.makeSheet([
    L("订单号", "Order", "注文番号"),
    L("下单日期", "Order date", "注文日"),
    L("客户", "Client", "顧客"),
    L("区域", "Region", "地域", "區域"),
    L("数量", "Qty", "数量"),
    L("单价", "Unit price", "単価"),
    L("折扣", "Discount", "割引"),
    L("金额", "Amount", "金額"),
  ], [
    ["SO260101", "2026-01-03", L("远山设计", "Yuanshan Design", "遠山デザイン"), L("华东", "East", "東部"), 4, 1200, 0.05, 4560],
    ["SO260102", "2026-01-08", L("星海教育", "Xinghai Education", "星海教育"), L("华北", "North", "北部"), 10, 450, 0.10, 4050],
    ["SO260103", "2026-01-15", L("新程科技", "Xincheng Tech", "新程テック"), L("华东", "East", "東部"), 2, 3200, 0, 6400],
    ["SO260104", "2026-01-21", L("南岸物流", "Southbank Logistics", "南岸物流"), L("华南", "South", "南部"), 6, 780, 0.08, 4305.6],
    ["SO260105", "2026-02-02", L("晨光书店", "Chenguang Books", "晨光書店"), L("华北", "North", "北部"), 12, 85, 0, 1020],
    ["SO260106", "2026-02-11", L("云谷医疗", "Yungu Medical", "雲谷医療"), L("西南", "Southwest", "南西部"), 3, 4500, 0.12, 11880],
    ["SO260107", "2026-02-19", L("远山设计", "Yuanshan Design", "遠山デザイン"), L("华东", "East", "東部"), 1, 5600, 0.05, 5320],
    ["SO260108", "2026-03-01", L("星海教育", "Xinghai Education", "星海教育"), L("华北", "North", "北部"), 5, 680, 0.10, 3060],
    ["SO260109", "2026-03-06", L("松林制造", "Pine Manufacturing", "松林製造"), L("华南", "South", "南部"), 8, 950, 0.15, 6460],
    ["SO260110", "2026-03-12", L("新程科技", "Xincheng Tech", "新程テック"), L("华东", "East", "東部"), 2, 2400, 0, 4800],
  ]));

  const priceList = K.addSheet("priceListSheet", K.makeSheet([
    L("编号", "ID", "番号"),
    L("商品", "Product", "商品"),
    L("单价", "Price", "単価"),
    L("库存", "Stock", "在庫"),
    L("分类", "Category", "分類"),
  ], [
    ["P01", L("钢笔", "Pen", "ペン"), 12, 80, L("办公", "Office", "オフィス")],
    ["P02", L("打印纸", "Paper", "用紙"), 25, 160, L("办公", "Office", "オフィス")],
    ["P03", L("显示器", "Monitor", "モニター"), 950, 18, L("电子", "Electronics", "電子")],
    ["P04", L("笔记本", "Laptop", "ノートPC"), 4500, 6, L("电子", "Electronics", "電子")],
    ["P05", L("背包", "Backpack", "バックパック"), 95, 45, L("礼品", "Gift", "ギフト")],
    ["P06", L("保温杯", "Thermal cup", "保温カップ"), 68, 9, L("礼品", "Gift", "ギフト")],
  ]));

  const discountTable = K.addSheet("discountTableSheet", {
    A1: L("等级", "Tier", "等級"), B1: "A", C1: "B", D1: "C",
    A2: L("折扣率", "Discount", "割引率"), B2: 0.15, C2: 0.10, D2: 0.05,
    A3: L("月采购额门槛", "Monthly threshold", "月間基準"), B3: 5000, C3: 3000, D3: 0,
  });

  const textData = K.addSheet("textDataSheet", K.makeSheet([
    L("订单编号", "Order code", "注文コード"),
    L("区域代码", "Region code", "地域コード"),
    L("年份", "Year", "年"),
    L("序号", "Sequence", "連番"),
    L("客户", "Client", "顧客"),
    L("发货日期", "Ship date", "出荷日"),
    L("提取结果", "Result", "抽出結果"),
  ], [
    ["EU-2026-001", "EU", 2026, "001", L("远山设计", "Yuanshan Design", "遠山デザイン"), "2026-01-15"],
    ["NA-2026-014", "NA", 2026, "014", L("新程科技", "Xincheng Tech", "新程テック"), "2026-01-22"],
    ["AP-2025-108", "AP", 2025, "108", L("南岸物流", "Southbank Logistics", "南岸物流"), "2025-12-12"],
    ["LA-2026-026", "LA", 2026, "026", L("云谷医疗", "Yungu Medical", "雲谷医療"), "2026-02-18"],
    ["EU-2025-099", "EU", 2025, "099", L("晨光书店", "Chenguang Books", "晨光書店"), "2025-11-30"],
    ["AP-2026-203", "AP", 2026, "203", L("松林制造", "Pine Manufacturing", "松林製造"), "2026-03-09"],
  ]));

  const datePlan = K.addSheet("datePlanSheet", K.makeSheet([
    L("里程碑", "Milestone", "マイルストーン"),
    L("开始日期", "Start date", "開始日"),
    L("截止日期", "Due date", "期限"),
    L("负责人", "Owner", "担当"),
    L("状态", "Status", "状態"),
    L("计算结果", "Result", "計算結果"),
  ], [
    [L("需求确认", "Requirement sign-off", "要件確認"), "2026-01-05", "2026-01-12", L("林晓", "Lin", "林"), L("已完成", "Done", "完了")],
    [L("方案设计", "Solution design", "設計"), "2026-01-13", "2026-01-28", L("陈凯", "Chen", "陳"), L("已完成", "Done", "完了")],
    [L("开发实施", "Development", "開発"), "2026-02-01", "2026-03-15", L("周宁", "Zhou", "周"), L("进行中", "In progress", "進行中")],
    [L("联调测试", "Integration test", "結合テスト"), "2026-03-16", "2026-03-31", L("赵敏", "Zhao", "趙"), L("未开始", "Not started", "未着手")],
    [L("上线培训", "Launch training", "研修"), "2026-04-01", "2026-04-10", L("王磊", "Wang", "王"), L("未开始", "Not started", "未着手")],
    [L("验收复盘", "Acceptance review", "受入レビュー"), "2026-04-11", "2026-04-25", L("孙悦", "Sun", "孫"), L("未开始", "Not started", "未着手")],
  ]));

  const finance = K.addSheet("financeSheet", K.makeSheet([
    L("项目", "Project", "プロジェクト"),
    L("年利率", "Annual rate", "年利率"),
    L("期数", "Periods", "期間"),
    L("本金", "Principal", "元金"),
    L("月供", "Monthly payment", "月額返済"),
    L("总还款", "Total paid", "総返済額"),
  ], [
    [L("店面装修", "Store renovation", "店舗改装"), 0.06, 36, 180000],
    [L("设备租赁", "Equipment lease", "機器リース"), 0.055, 24, 80000],
    [L("培训贷款", "Training loan", "研修ローン"), 0.04, 12, 30000],
    [L("仓储车辆", "Warehouse vehicle", "倉庫車両"), 0.05, 48, 220000],
  ]));

  const kpi = K.addSheet("kpiSheet", K.makeSheet([
    L("销售员", "Sales rep", "営業担当"),
    L("区域", "Region", "地域", "區域"),
    L("季度销售额", "Quarter sales", "四半期売上"),
    L("季度目标", "Quarter target", "四半期目標"),
    L("达成率", "Attainment", "達成率"),
    L("排名", "Rank", "順位"),
    L("奖金", "Bonus", "賞与"),
  ], [
    [L("林晓", "Lin", "林"), L("华东", "East", "東部"), 3580, 4000, 0.895],
    [L("陈凯", "Chen", "陳"), L("华东", "East", "東部"), 2520, 3000, 0.84],
    [L("周宁", "Zhou", "周"), L("华北", "North", "北部"), 4140, 4500, 0.92],
    [L("赵敏", "Zhao", "趙"), L("华南", "South", "南部"), 1290, 1800, 0.7167],
    [L("王磊", "Wang", "王"), L("华南", "South", "南部"), 2620, 3000, 0.8733],
    [L("孙悦", "Sun", "孫"), L("西南", "Southwest", "南西部"), 4020, 4200, 0.9571],
    [L("李然", "Li", "李"), L("华北", "North", "北部"), 3270, 3500, 0.9343],
    [L("郑文", "Zheng", "鄭"), L("西南", "Southwest", "南西部"), 2240, 2500, 0.896],
  ]));

  const findData = K.addSheet("findDataSheet", K.makeSheet([
    L("编号", "Code", "番号", "編號"),
    L("仓库", "Warehouse", "倉庫", "倉庫"),
    L("城市", "City", "都市", "城市"),
    L("状态", "Status", "状態", "狀態"),
    L("备注", "Note", "備考", "備註"),
    L("数量", "Qty", "数量", "數量"),
    L("金额", "Amount", "金額", "金額"),
  ], [
    ["CN-001A", L("华东一号仓", "East Warehouse 1", "東部第一倉庫", "華東一號倉"), L("上海", "Shanghai", "上海", "上海"), L("启用", "Active", "稼働中", "啟用"), L("新开", "New", "新規", "新開"), 4, 4800],
    ["CN-001", L("华东二号仓", "East Warehouse 2", "東部第二倉庫", "華東二號倉"), L("上海", "Shanghai", "上海", "上海"), L("停用", "Inactive", "停止中", "停用"), L("盘点中", "Stocktake", "棚卸中", "盤點中"), 10, 6400],
    ["cn-001", L("华南一号仓", "South Warehouse 1", "南部第一倉庫", "華南一號倉"), L("深圳", "Shenzhen", "深圳", "深圳"), L("启用", "Active", "稼働中", "啟用"), L("复核", "Review", "確認", "覆核"), 6, 4305],
    ["CN-002", L("华北一号仓", "North Warehouse 1", "北部第一倉庫", "華北一號倉"), L("北京", "Beijing", "北京", "北京"), L("启用", "Active", "稼働中", "啟用"), L("正常", "Normal", "通常", "正常"), 8, 6460],
    ["CN-010", L("西南一号仓", "Southwest Warehouse 1", "南西部第一倉庫", "西南一號倉"), L("成都", "Chengdu", "成都", "成都"), L("停用", "Inactive", "停止中", "停用"), L("待处理", "Pending", "対応待ち", "待處理"), 2, 4800],
  ]));
  findData.H1 = L("检查项", "Check item", "確認項目", "檢查項目");
  findData.I1 = L("结果", "Result", "結果", "結果");
  findData.H2 = L("发票", "Invoice", "請求書", "發票");
  findData.I2 = "OK";
  findData.H3 = "OK";
  findData.I3 = L("合同", "Contract", "契約", "合約");
  findData.J1 = L("条件结果", "Criteria result", "条件結果", "條件結果");

  const budget = K.addSheet("budgetSheet", K.makeSheet([
    L("项目", "Project", "項目"),
    L("预算", "Budget", "予算"),
    L("实际", "Actual", "実績"),
    L("差额", "Variance", "差異"),
    L("负责人", "Owner", "担当"),
    L("截止日期", "Due date", "期限"),
    L("状态", "Status", "状態"),
  ], [
    [L("场地租赁", "Venue rental", "会場費"), 50000, 48500, undefined, L("林晓", "Lin", "林"), "2026-05-10", undefined],
    [L("餐饮", "Catering", "飲食"), 30000, 32600, undefined, L("陈凯", "Chen", "陳"), "2026-05-12", undefined],
    [L("设备租赁", "Equipment rental", "機器レンタル"), 40000, 41500, undefined, L("周宁", "Zhou", "周"), "2026-05-12", undefined],
    [L("宣传物料", "Promotion", "販促物"), 18000, 16200, undefined, L("赵敏", "Zhao", "趙"), "2026-05-08", undefined],
    [L("嘉宾接待", "Guest reception", "来賓接待"), 25000, 23800, undefined, L("王磊", "Wang", "王"), "2026-05-14", undefined],
    [L("交通住宿", "Travel and lodging", "交通宿泊"), 35000, 37200, undefined, L("孙悦", "Sun", "孫"), "2026-05-15", undefined],
  ]));

  priceList.G1 = L("查询结果", "Lookup result", "検索結果");
  orders.J1 = L("复盘结果", "Review result", "レビュー結果");
  sales.C30 = L("观察区", "Observation area", "観察エリア");

  K.sheets.quote = quote;
  K.sheets.sales = sales;
  K.sheets.payroll = payroll;
  K.sheets.attendance = attendance;
  K.sheets.inventory = inventory;
  K.sheets.orders = orders;
  K.sheets.priceList = priceList;
  K.sheets.discountTable = discountTable;
  K.sheets.textData = textData;
  K.sheets.datePlan = datePlan;
  K.sheets.finance = finance;
  K.sheets.kpi = kpi;
  K.sheets.findData = findData;
  K.sheets.budget = budget;

  const quoteItems = [
    { row: 2, name: L("会议屏", "meeting screen", "会議用スクリーン"), qty: 2, price: 3200 },
    { row: 3, name: L("无线麦克风", "wireless mic", "ワイヤレスマイク"), qty: 4, price: 680 },
    { row: 4, name: L("商务笔记本", "business laptop", "業務用ノートPC"), qty: 6, price: 4500 },
    { row: 5, name: L("打印纸", "printer paper", "印刷用紙"), qty: 20, price: 35 },
    { row: 6, name: L("饮水机", "water dispenser", "ウォーターサーバー"), qty: 2, price: 780 },
    { row: 7, name: L("投影仪", "projector", "プロジェクター"), qty: 1, price: 5600 },
  ];

  const salesPeople = [
    { row: 2, name: L("林晓", "Lin", "林") },
    { row: 3, name: L("陈凯", "Chen", "陳") },
    { row: 4, name: L("周宁", "Zhou", "周") },
    { row: 5, name: L("赵敏", "Zhao", "趙") },
    { row: 6, name: L("王磊", "Wang", "王") },
    { row: 7, name: L("孙悦", "Sun", "孫") },
    { row: 8, name: L("李然", "Li", "李") },
    { row: 9, name: L("郑文", "Zheng", "鄭") },
  ];

  function quoteAmountTasks(prefix) {
    return quoteItems.slice(0, 5).map((item, index) => task({
      id: prefix + "-" + index,
      sheet: quote,
      target: "D" + item.row,
      taskLabel: L("金额计算", "Amount calculation", "金額計算"),
      title: fill(L("核对{name}的金额", "Check the amount for {name}", "{name}の金額を確認"), { name: item.name }),
      lead: fill(L("在 D{row} 输入“数量 × 单价”，不要直接把答案写死。", "In D{row}, enter quantity times unit price. Do not type a fixed number.", "D{row} に「数量 × 単価」を入力します。固定値は入力しません。"), { row: item.row }),
      hint: fill(L("参考：=B{row}*C{row}", "Reference: =B{row}*C{row}", "参考：=B{row}*C{row}"), { row: item.row }),
      success: fill(L("金额公式会跟着{name}的数量和单价一起更新。", "The amount formula updates with the quantity and price for {name}.", "{name}の数量や単価を変えると金額も更新されます。"), { name: item.name }),
      formula: "=B" + item.row + "*C" + item.row,
    }));
  }

  D.registerChapter({
    id: "ch01-foundation",
    icon: "01",
    title: L("第 1 章 · 从一张报价单开始", "Chapter 1 · Start with a Quote", "第1章 · 見積書から始める"),
    subtitle: L("先把公式、地址和区域用熟，再逐步加上求和与固定引用。每一步都只增加一个难点。", "Become comfortable with formulas, cell addresses, and ranges, then add SUM and fixed references one step at a time.", "数式、セル番地、範囲に慣れてから、SUM と固定参照を一つずつ加えます。"),
    levels: [
      level("reference-math", "lesson", L("金额会自己算", "Make Amounts Calculate Themselves", "金額を自動計算する"), [
        learn(
          "brief-reference-math",
          L("主管把报价单交给你", "The quote sheet lands on your desk", "見積書があなたのデスクに届きました"),
          L("这是一张真实的办公报价单。今天只做一件事：让“数量 × 单价”自动得到金额。先别背定义，直接在 D2 写出第一笔公式。", "This is a real office quote. Today you only need quantity times price to produce an amount. Skip definitions and write the first formula in D2.", "実際の見積書です。今日は「数量 × 単価」から金額を出すだけです。D2 に最初の数式を書きます。"),
          [
            L("公式从等号开始：=B2*C2", "A formula starts with =: =B2*C2", "数式は = から始まります：=B2*C2"),
            L("B2 是列字母 + 行号，改动源数据，公式会自动重算", "B2 combines a column letter and row number; formulas recalculate when data changes", "B2 は列文字と行番号です。元データを変えると数式も再計算されます"),
            L("乘法用 *，不要写成 × 或 x", "Use * for multiplication, not × or x", "掛け算は * を使います"),
            L("括号会改变计算顺序，后面算折扣时很关键", "Parentheses change the order of operations and matter later for discounts", "かっこは計算順序を変えます"),
          ],
          L("公式写错不要紧，回车后看预览结果，再回来修改。", "If the formula is wrong, press Enter, inspect the result, and come back to fix it.", "間違えたら Enter で結果を見てから直します。"),
          "=B2*C2"
        ),
        builder({
          id: "build-quote-amount",
          sheet: quote,
          formula: "=B2*C2",
          title: L("填出第一笔报价金额", "Fill in the first quote amount", "最初の見積金額を穴埋めする", "填入第一筆報價金額"),
          lead: L("先看表：B 列是数量，C 列是单价，同一行的两个数才能相乘。等号和乘号已经摆好，填对两个地址就行。", "Look at the sheet: B holds quantity and C holds unit price, and both must come from the same row. The operators are ready; fill in the two addresses.", "表を見ましょう。B列は数量、C列は単価で、同じ行の2つを掛けます。等号と掛け算記号は用意済みなので、2つのセル番地を入れるだけです。", "先看表：B 欄是數量，C 欄是單價，同一橫列的兩個數才能相乘。等號和乘號已經擺好，填對兩個位址就行。"),
          hint: L("从目标行向左看：数量在 B2，单价在 C2。单元格地址由列字母和行号组成，两个引用必须来自同一行。", "Look left from the target row: quantity is B2 and unit price is C2. A cell address combines a column letter and row number, and both references must come from the same row.", "対象行の左側を見ます。数量は B2、単価は C2 です。セル番地は列文字と行番号でできており、2つの参照は同じ行から選びます。", "從目標橫列往左看：數量在 B2，單價在 C2。儲存格位址由欄字母和列號組成，兩個參照必須來自同一橫列。"),
          success: L("等号、两个单元格地址和乘号组成了可重算的金额公式。以后改数量或单价，不需要再手算。", "The equals sign, two cell references, and multiply operator now form a reusable amount formula. Change quantity or price and Excel recalculates it for you.", "等号・2つのセル番地・掛け算記号で、再利用できる金額数式になりました。数量や単価を変えても手計算は不要です。", "等號、兩個儲存格位址和乘號組成了可重算的金額公式。之後改數量或單價，都不需要再手算。"),
          fillBlanks: [1, 3],
        }),
        practice({
          id: "drill-quote-amount",
          title: L("报价单轮换：连续核对五件商品", "Quote rotation: check five items", "見積書チェック：5品目"),
          lead: L("题目会随机抽取商品，目标行也会变化。看清楚名称框里的地址，再输入公式。", "A random item and target row appear. Read the Name Box address before entering the formula.", "ランダムな商品と対象行が出ます。名前ボックスで番地を確認してから入力します。"),
          sheet: quote,
          tasks: quoteAmountTasks("drill-quote"),
          hint: L("公式中的行号必须和目标行一致。", "The row number in the formula must match the target row.", "数式の行番号は対象行と一致させます。"),
        }),
        practice({
          id: "drill-quote-fill",
          title: L("一条公式，拖满整列", "One formula, a whole column", "数式1つで列全体へ", "一條公式，拖滿整欄"),
          lead: L("报价单有六件商品，不用一行行重写。先在 D2 写好左上角的金额公式，再拖住绿色填充柄铺到 D7；相对行号会自己往下走。", "The quote has six items, so there is no need to retype the formula. Write the top-left amount formula in D2, then drag the green fill handle to D7; relative row numbers shift automatically.", "見積には6品目あります。左上の D2 に金額数式を書き、緑のフィルハンドルを D7 までドラッグします。相対行番号は自動で移動します。", "報價單有六件商品，不必逐列重寫。先在 D2 寫好左上角的金額公式，再拖住綠色填充控點鋪到 D7；相對列號會自動往下移動。"),
          sheet: quote,
          tasks: [
            task({
              id: "quote-fill-amount",
              sheet: quote,
              target: "D2",
              targetRange: "D2:D7",
              taskLabel: L("整列填充", "Fill down", "下方向にフィル", "整欄填滿"),
              title: L("把六件商品的金额一次算完", "Calculate all six item amounts", "6品目分の金額を一度に計算", "一次算完六件商品的金額"),
              lead: L("在 D2 计算 B2×C2，再拖绿色填充柄到 D7。每一行都会变成自己的 B×C，而不是一直用第 2 行。", "In D2, calculate B2 times C2, then drag the green handle to D7. Each row becomes its own B times C instead of reusing row 2.", "D2 で B2×C2 を計算し、緑のハンドルを D7 までドラッグします。各行がその行の B×C に変わります。", "在 D2 計算 B2×C2，再拖綠色填充控點到 D7。每一列都會變成自己的 B×C，不會一直沿用第 2 列。"),
              hint: L("参考：=B2*C2。拖之前先确认 D2 的结果，拖完再看 D7 的引用有没有变成 B7*C7。", "Reference: =B2*C2. Check D2 first, then confirm D7 changes to B7*C7 after filling.", "参考：=B2*C2。D2 の結果を確認してから、D7 が B7*C7 に変わるか見ます。", "參考：=B2*C2。拖曳前先確認 D2 的結果，拖完再看 D7 的參照是否變成 B7*C7。"),
              success: L("一条相对引用公式铺完整列。以后改数量或单价，六行金额都会一起重算。", "One relative formula now fills the column. Change a quantity or price and all six amounts recalculate.", "相対参照の数式1つで列全体を埋めました。数量や単価を変えると6行すべて再計算されます。", "一條相對參照公式鋪滿整欄。之後改數量或單價，六列金額都會一起重算。"),
              formula: "=B2*C2",
            }),
            task({
              id: "quote-fill-rush",
              sheet: quote,
              target: "D2",
              targetRange: "D2:D7",
              taskLabel: L("整列填充", "Fill down", "下方向にフィル", "整欄填滿"),
              title: L("给六件商品统一加 10% 加急费", "Add a 10% rush fee to every item", "6品目すべてに10%の特急料金", "為六件商品統一加 10% 急件費"),
              lead: L("会议改期，整张报价单都要加急。在 D2 写金额并乘 1.1，再拖绿色填充柄铺到 D7，六件商品会套用同一条规则。", "The meeting moved up, so the whole quote needs a rush fee. In D2, multiply the amount by 1.1, then drag the green handle to D7 so every item follows the same rule.", "会議が早まり、見積全体を特急にします。D2 で金額に1.1を掛け、緑のハンドルを D7 までドラッグして全品目に同じルールを適用します。", "會議改期，整張報價單都要加急。在 D2 寫出金額並乘 1.1，再拖綠色填充控點鋪到 D7，六件商品會套用同一條規則。"),
              hint: L("参考：=B2*C2*1.1。这里没有共享参数，所以不要把 B2、C2 锁成 $B$2、$C$2。", "Reference: =B2*C2*1.1. There are no shared parameters here, so do not lock B2 or C2 with dollar signs.", "参考：=B2*C2*1.1。共通パラメータではないため、B2 と C2 に $ を付けません。", "參考：=B2*C2*1.1。這裡沒有共用參數，所以不要把 B2、C2 鎖成 $B$2、$C$2。"),
              success: L("整列填充后，每一行仍引用自己那一行的数量和单价，加急费也一次套用完成。", "Every filled row still points to its own quantity and price, and the rush fee is applied in one pass.", "各行は自分の数量と単価を参照したまま、特急料金も一括で適用されました。", "整欄填滿後，每一列仍參照自己那一列的數量和單價，急件費也一次套用完畢。"),
              formula: "=B2*C2*1.1",
            }),
          ],
          hint: L("绿色填充柄只负责“复制公式”；相对引用怎么变，由你写下的公式决定。", "The green handle copies the formula; the references you wrote decide how they shift.", "緑のハンドルは数式をコピーするだけです。相対参照の動きは、書いた数式で決まります。", "綠色填充控點只負責「複製公式」；相對參照怎麼變，由你寫下的公式決定。"),
        }),
        practice({
          id: "drill-quote-transfer",
          title: L("同一张报价单：加急、折扣与拆分", "Same quote: rush fee, discount, and split", "同じ見積書：特急料金、割引、分割"),
          lead: L("仍然只考查引用和算术，但每个任务换了一个工作情境。公式要引用单元格，而不是手算数字。", "The skill is still references and arithmetic, but each task changes the office situation. Reference cells instead of typing calculated numbers.", "参照と四則演算の練習です。計算済みの数字を打たず、セルを参照します。"),
          sheet: quote,
          tasks: [
            task({ id: "drill-transfer-1", sheet: quote, target: "F2", taskLabel: L("加急报价", "Rush quote", "特急見積"), title: L("会议屏总价上浮 10%", "Meeting screen total plus 10%", "会議用スクリーン総額に10%加算"), lead: L("在 F2 用金额公式计算 B2*C2，再乘以 1.1。", "In F2, calculate B2*C2 with a formula, then multiply by 1.1.", "F2 で B2*C2 を計算し、1.1 を掛けます。"), hint: L("参考：=B2*C2*1.1", "Reference: =B2*C2*1.1", "参考：=B2*C2*1.1"), success: L("加急费也被带进了同一条公式。", "The rush fee is included in the same formula.", "特急料金も同じ数式に含まれました。"), formula: "=B2*C2*1.1" }),
            task({ id: "drill-transfer-2", sheet: quote, target: "F3", taskLabel: L("套装优惠", "Bundle discount", "セット割引"), title: L("无线麦克风减 80 元", "Wireless mics less 80", "ワイヤレスマイクから80引き"), lead: L("在 F3 计算 4 支麦克风的报价，再减去 80 元优惠。", "In F3, calculate the quote for four mics and subtract an 80 discount.", "F3 で4本分を計算し、80の割引を引きます。"), hint: L("参考：=B3*C3-80", "Reference: =B3*C3-80", "参考：=B3*C3-80"), success: L("减价写在公式里，修改优惠金额也方便。", "The discount is part of the formula, so it is easy to change later.", "割引も数式内にあるので変更が簡単です。"), formula: "=B3*C3-80" }),
            task({ id: "drill-transfer-3", sheet: quote, target: "F4", taskLabel: L("预算拆分", "Budget split", "予算分割"), title: L("六台笔记本的预算均价", "Budget per laptop across six units", "6台分の1台あたり予算"), lead: L("在 F4 先算总额，再除以 6，得到一台的预算。", "In F4, calculate the total, then divide by six for the per-unit budget.", "F4 で総額を計算し、6で割って1台分を求めます。"), hint: L("参考：=B4*C4/6", "Reference: =B4*C4/6", "参考：=B4*C4/6"), success: L("先乘后除，公式能得到单台预算。", "Multiply first, then divide to get the unit budget.", "掛けてから割ることで1台分を求められます。"), formula: "=B4*C4/6" }),
            task({ id: "drill-transfer-4", sheet: quote, target: "F5", taskLabel: L("成本复核", "Cost check", "原価確認"), title: L("打印纸采购价加 15% 服务费", "Add 15% service to paper cost", "用紙代に15%の手数料を加算"), lead: L("在 F5 计算打印纸金额，再整体乘以 1.15。", "In F5, calculate the paper amount, then multiply by 1.15.", "F5 で用紙代を計算し、全体に1.15を掛けます。"), hint: L("参考：=B5*C5*1.15", "Reference: =B5*C5*1.15", "参考：=B5*C5*1.15"), success: L("服务费和基础金额共用了一条公式。", "The service fee and base amount share one formula.", "手数料と基本金額を1つの数式で扱えました。"), formula: "=B5*C5*1.15" }),
          ],
          hint: L("先确认目标格地址，再用 B/C 两列中同一行的数据。", "Confirm the target cell, then use B and C from the same row.", "対象セルを確認し、同じ行の B/C 列を使います。"),
        }),
      ], { xp: 25 }),

      level("sum-range", "lesson", L("一堆数字用 SUM 一次收好", "Collect a Stack of Numbers with SUM", "SUM でまとめて合計する"), [
        learn(
          "brief-sum-range",
          L("月末要做销售汇总", "Month-end sales totals", "月末の売上集計", "月底要做銷售彙總"),
          L("单笔金额已经会算了，现在主管要一行行、一列列加起来。手动点加法容易漏行，今天学会用冒号描述一整块区域。", "You can calculate single amounts. Now your manager wants row and column totals. Manual addition misses rows, so use a colon to describe a whole range.", "単価計算ができるようになりました。次は行合計と列合計です。コロンで範囲をまとめて指定します。", "單筆金額已經會算了，現在主管要把一整橫列、一整欄加起來。手動一個一個加很容易漏掉資料，今天學會用冒號描述一整塊儲存格範圍。"),
          [
            L("C2:E2 表示从 C2 到 E2 的一整段连续区域", "C2:E2 means the continuous range from C2 through E2", "C2:E2 は C2 から E2 までの連続範囲です"),
            L("SUM(C2:E2) 会把区域里的数字一次相加", "SUM(C2:E2) adds all numbers in the range at once", "SUM(C2:E2) は範囲内の数値をまとめて足します"),
            L("纵向汇总就把列固定、行写成 C2:C9", "For a column total, keep one column and span rows such as C2:C9", "縦合計なら列を固定し C2:C9 のように行をまたぎます"),
            L("先看目标格在合计区还是数据区，再决定公式放哪里", "Check whether the target sits in a total area or data area before writing the formula", "対象セルが集計欄かデータ欄かを確認してから数式を書きます"),
          ],
          L("冒号是“从这里到那里”，不是两个不相干单元格。", "The colon means from here through there, not two unrelated cells.", "コロンは「ここからそこまで」という意味です。"),
          "=SUM(C2:E2)"
        ),
        builder({
          id: "build-sum-row",
          sheet: sales,
          formula: "=SUM(C2:E2)",
          title: L("填出林晓的季度合计", "Fill in Olivia's quarterly total", "佐藤さんの四半期合計を穴埋めする", "填入林雅婷的季度合計"),
          lead: L("季度合计不是把三个数逐个相加，而是把一月到三月看成一个连续区域。先判断目标行，再用求和函数一次覆盖 C2 到 E2；这样区域边界清楚，也不会因为新增月份而漏算。", "A quarterly total is easier and safer when January through March are treated as one continuous range. Identify the target row, choose the sum function, then fill the range from C2 through E2 so no month is missed.", "四半期合計は3つの数値を個別に足すのではなく、1月から3月を1つの連続範囲として扱います。対象行を確認し、合計関数と C2 から E2 までの範囲を埋めます。月の取りこぼしを防げます。", "季度合計不是把三個數字逐一相加，而是把一月到三月視為一個連續範圍。先判斷目標橫列，再使用加總函數一次涵蓋 C2 到 E2；範圍邊界清楚，也不容易漏算月份。"),
          hint: L("括号里只放一个区域，START 与 END 用冒号连接：C2:E2。函数名不区分大小写，但要和求和用途匹配。", "Put one range inside the parentheses and join its start and end with a colon: C2:E2. Function names are case-insensitive, but the function must match the job.", "かっこの中には1つの範囲を入れ、開始と終了をコロンで結びます：C2:E2。関数名の大文字小文字は問いませんが、合計に合う関数を選びます。", "括號裡只放一個範圍，起點與終點用冒號連接：C2:E2。函數名稱不分大小寫，但必須符合加總用途。"),
          success: L("连续区域让三个月一次纳入计算。以后区域扩展或复制到下一行时，只要边界正确就能稳定复用。", "One continuous range now covers all three months. The same structure stays reliable when it is expanded or copied to another row, as long as the boundaries are correct.", "連続範囲で3か月を一度に計算できました。範囲を広げたり次の行へコピーしたりしても、境界が正しければ安定して再利用できます。", "連續範圍讓三個月一次納入計算。之後擴充範圍或複製到下一橫列時，只要邊界正確就能穩定重用。"),
          fillBlanks: [1, 3],
        }),
        practice({
          id: "drill-sum-row-column",
          title: L("行合计与列合计轮换", "Row and column totals", "行合計と列合計"),
          lead: L("随机任务可能是某位销售的一行，也可能是某个月的一列。先确认合计放在哪里，再框对区域。", "A random task may total one rep's row or one month's column. Confirm the total cell, then use the right range.", "担当者の行合計または月の列合計がランダムに出ます。集計セルと範囲を確認します。"),
          sheet: sales,
          tasks: [
            ...salesPeople.slice(0, 4).map((person, index) => task({
              id: "sum-row-" + index,
              sheet: sales,
              target: "H" + person.row,
              taskLabel: L("整行汇总", "Row total", "行合計"),
              title: fill(L("汇总{name}的三个月销售额", "Total three months for {name}", "{name}の3か月売上を合計"), { name: person.name }),
              lead: fill(L("在 H{row} 用 SUM 汇总 C{row}:E{row}。只选一行，不要跨到别人。", "In H{row}, use SUM over C{row}:E{row}. Stay within this one row.", "H{row} で SUM を使い C{row}:E{row} を合計します。"), { row: person.row }),
              hint: fill(L("参考：=SUM(C{row}:E{row})", "Reference: =SUM(C{row}:E{row})", "参考：=SUM(C{row}:E{row})"), { row: person.row }),
              success: fill(L("{name}的季度合计会自动更新。", "The quarterly total for {name} updates automatically.", "{name}の四半期合計が自動更新されます。"), { name: person.name }),
              formula: "=SUM(C" + person.row + ":E" + person.row + ")",
              requiredFunctions: ["SUM"],
              requiredRange: "C" + person.row + ":E" + person.row,
              sourceRefs: D.expandRange("C" + person.row, "E" + person.row),
              strictRefs: true,
              mode: "range",
            })),
            task({ id: "sum-col-jan", sheet: sales, target: "C11", taskLabel: L("整列汇总", "Column total", "列合計"), title: L("汇总一月所有销售", "Total all January sales", "1月の全売上を合計"), lead: L("在 C11 汇总 C2:C9，只选一月这一列。", "In C11, total C2:C9, staying in the January column.", "C11 で C2:C9 を合計します。"), hint: L("参考：=SUM(C2:C9)", "Reference: =SUM(C2:C9)", "参考：=SUM(C2:C9)"), success: L("一月总额是 8020。", "January totals 8020.", "1月の合計は8020です。"), formula: "=SUM(C2:C9)", requiredFunctions: ["SUM"], requiredRange: "C2:C9", sourceRefs: D.expandRange("C2", "C9"), strictRefs: true, mode: "range" }),
            task({ id: "sum-col-feb", sheet: sales, target: "D11", taskLabel: L("整列汇总", "Column total", "列合計"), title: L("汇总二月所有销售", "Total all February sales", "2月の全売上を合計"), lead: L("在 D11 汇总 D2:D9。", "In D11, total D2:D9.", "D11 で D2:D9 を合計します。"), hint: L("参考：=SUM(D2:D9)", "Reference: =SUM(D2:D9)", "参考：=SUM(D2:D9)"), success: L("二月总额也进入了同一张汇总表。", "February is now on the same summary sheet.", "2月の合計も同じ集計表に入りました。"), formula: "=SUM(D2:D9)", requiredFunctions: ["SUM"], requiredRange: "D2:D9", sourceRefs: D.expandRange("D2", "D9"), strictRefs: true, mode: "range" }),
            task({
              id: "sum-fill-month-row",
              sheet: sales,
              target: "C10",
              targetRange: "C10:E10",
              taskLabel: L("整行填充", "Fill across", "横方向にフィル", "整列填滿"),
              title: L("把三个月合计铺成一行", "Fill the three monthly totals across one row", "3か月の合計を横一列に並べる", "將三個月合計鋪成一列"),
              lead: L("月末汇总要从 C10 一直排到 E10。在 C10 汇总一月，再拖绿色填充柄向右；D10、E10 会自动改成二月、三月的列。", "The month-end summary runs from C10 to E10. Total January in C10, then drag the green handle to the right; D10 and E10 will follow February and March.", "月次集計を C10 から E10 まで並べます。C10 で1月を合計し、緑のハンドルを右へドラッグすると D10・E10 が2月・3月へ変わります。", "月底彙總要從 C10 一路排到 E10。在 C10 彙總一月，再拖綠色填充控點向右；D10、E10 會自動改成二月、三月的欄。"),
              hint: L("参考：=SUM(C2:C9)。拖到右边后，检查 D10 是否变成 =SUM(D2:D9)。", "Reference: =SUM(C2:C9). After filling right, check that D10 becomes =SUM(D2:D9).", "参考：=SUM(C2:C9)。右へフィルした後、D10 が =SUM(D2:D9) になるか確認します。", "參考：=SUM(C2:C9)。拖到右邊後，檢查 D10 是否變成 =SUM(D2:D9)。"),
              success: L("列字母会自动向右走，三个月合计用同一条公式完成。", "The column letters move right automatically, so one formula completes all three monthly totals.", "列文字が自動で右へ移動し、1つの数式で3か月分の合計が完成しました。", "欄字母會自動往右移動，三個月合計用同一條公式完成。"),
              formula: "=SUM(C2:C9)",
              requiredFunctions: ["SUM"],
            }),
          ],
          hint: L("整行跨 C:E；整列用同一个字母跨 2:9。", "A row spans C:E; a column uses one letter across rows 2:9.", "行は C:E、列は同じ文字で 2:9 をまたぎます。"),
        }),
        practice({
          id: "drill-sum-transfer",
          title: L("合计之后再做业务计算", "Use totals in business calculations", "合計を業務計算に使う"),
          lead: L("这里开始把新学的 SUM 和之前的算术放在一起：汇总后再取平均、算差额。", "Now combine SUM with earlier arithmetic: average after totaling, or calculate a difference.", "SUM と以前の四則演算を組み合わせます。合計してから平均や差を求めます。"),
          sheet: sales,
          tasks: [
            task({ id: "sum-transfer-1", sheet: sales, target: "C11", taskLabel: L("合计后取平均", "Average from a total", "合計から平均"), title: L("一月平均每人销售", "Average January sales per rep", "1人あたりの1月売上"), lead: L("在 C11 先用 SUM 汇总 C2:C9，再除以 8。", "In C11, total C2:C9 with SUM, then divide by eight.", "C11 で C2:C9 を SUM し、8で割ります。"), hint: L("参考：=SUM(C2:C9)/8", "Reference: =SUM(C2:C9)/8", "参考：=SUM(C2:C9)/8"), success: L("SUM 负责汇总，除法负责分摊。", "SUM totals and division spreads the total.", "SUM で合計し、割り算で均等に割ります。"), formula: "=SUM(C2:C9)/8", requiredFunctions: ["SUM"] }),
            task({ id: "sum-transfer-2", sheet: sales, target: "C12", taskLabel: L("目标差额", "Gap to target", "目標との差"), title: L("一月总额与目标总额差多少", "January total versus total target", "1月合計と目標合計の差"), lead: L("在 C12 用一月合计减去目标合计 F2:F9。", "In C12, subtract total target F2:F9 from the January total.", "C12 で1月合計から目標合計 F2:F9 を引きます。"), hint: L("参考：=SUM(C2:C9)-SUM(F2:F9)", "Reference: =SUM(C2:C9)-SUM(F2:F9)", "参考：=SUM(C2:C9)-SUM(F2:F9)"), success: L("两条 SUM 让差额一目了然。", "Two SUM calls make the gap clear.", "2つの SUM で差が明確になります。"), formula: "=SUM(C2:C9)-SUM(F2:F9)", requiredFunctions: ["SUM"] }),
            task({ id: "sum-transfer-3", sheet: sales, target: "C13", taskLabel: L("两段区域", "Two ranges", "2つの範囲"), title: L("只汇总华东前两位的一季度", "Total the first two East reps", "東部の最初の2名を合計"), lead: L("在 C13 分别汇总林晓和陈凯的 C2:E2、C3:E3，再用加号合并。", "In C13, total C2:E2 and C3:E3 separately, then add them.", "C13 で C2:E2 と C3:E3 をそれぞれ合計し、足します。"), hint: L("参考：=SUM(C2:E2)+SUM(C3:E3)", "Reference: =SUM(C2:E2)+SUM(C3:E3)", "参考：=SUM(C2:E2)+SUM(C3:E3)"), success: L("SUM 的参数可以是一条区域，也可以是两条区域相加。", "SUM can take one range or two SUM results added together.", "SUM は1つの範囲でも、2つの SUM の和でも使えます。"), formula: "=SUM(C2:E2)+SUM(C3:E3)", requiredFunctions: ["SUM"] }),
            task({ id: "sum-transfer-4", sheet: sales, target: "C14", taskLabel: L("月度完成率", "Monthly attainment", "月間達成率"), title: L("一月总额占季度目标的比例", "January share of quarterly target", "四半期目標に占める1月の割合"), lead: L("在 C14 用 SUM 算一月合计，再除以 SUM 算出的目标合计。", "In C14, divide the January SUM by the target SUM.", "C14 で1月の SUM を目標の SUM で割ります。"), hint: L("参考：=SUM(C2:C9)/SUM(F2:F9)", "Reference: =SUM(C2:C9)/SUM(F2:F9)", "参考：=SUM(C2:C9)/SUM(F2:F9)"), success: L("比率小数约 0.3026，后续会学格式化。", "The ratio is about 0.3026; formatting comes later.", "比率は約0.3026です。表示形式は後で学びます。"), formula: "=SUM(C2:C9)/SUM(F2:F9)", requiredFunctions: ["SUM"] }),
          ],
          hint: L("先分区：哪个区域是总额，哪个区域是目标。", "Separate the amount range from the target range.", "金額範囲と目標範囲を分けて考えます。"),
        }),
      ], { xp: 30 }),

      level("absolute-review", "review", L("固定引用：公式往下一拖也不跑偏", "Fixed References That Survive Copying", "コピーしてもずれない固定参照"), [
        learn(
          "brief-absolute",
          L("报价单的运费和税率只在一个地方", "Freight and tax live in one place", "送料と税率は1か所だけ"),
          L("每件商品都要加同样的运费和税率。如果公式里写死 120 和 9%，以后改价就会漏改。今天学会用 $ 锁住一个参数单元格。", "Every item needs the same freight and tax. Hard-coding 120 and 9% makes later changes easy to miss. Use $ to lock a parameter cell.", "すべての商品に同じ送料と税率が必要です。数値固定では変更漏れが起きます。$ でパラメータセルを固定します。"),
          [
            L("$G$2 锁列也锁行，复制到哪里都仍指向 G2", "$G$2 locks both column and row, so copies still point to G2", "$G$2 は列と行を固定し、どこへコピーしても G2 を指します"),
            L("只锁列写成 $G2，只锁行写成 G$2", "Lock a column with $G2, or a row with G$2", "列だけなら $G2、行だけなら G$2 です"),
            L("固定参数区通常放在表格上方或右侧，改一处全表更新", "Keep shared parameters above or beside the table so one edit updates everything", "共通パラメータは表の上か横に置くと一括更新できます"),
            L("金额先算再乘税率：=(B2*C2+$G$2)*(1+$H$2)", "Calculate the amount before tax: =(B2*C2+$G$2)*(1+$H$2)", "金額を出してから税を掛けます：=(B2*C2+$G$2)*(1+$H$2)"),
          ],
          L("任务会检查公式里是否保留了 $G$2 和 $H$2。", "Tasks check that $G$2 and $H$2 remain in the formula.", "数式内に $G$2 と $H$2 が残っているか確認します。"),
          "=(B2*C2+$G$2)*(1+$H$2)"
        ),
        builder({
          id: "build-absolute-quote",
          sheet: quote,
          formula: "=(B2*C2+$G$2)*(1+$H$2)",
          title: L("填出含运费与税率的报价", "Fill in a quote with freight and tax", "送料と税込の見積を穴埋めする", "填入含運費與稅率的報價"),
          lead: L("这张表的做法和上一题相似，但多了两个全表共用参数：运费在 G2、税率在 H2。金额先按 B2×C2 算，再加运费，最后乘上 1 加税率。两个参数必须用 $ 锁住，否则公式向下复制时会偏离参数格。", "This quote adds two shared parameters: freight in G2 and tax rate in H2. Calculate B2 times C2, add freight, then multiply by one plus the tax rate. Lock both parameter cells with $ so copied formulas keep pointing to G2 and H2.", "前の見積に、表全体で共有する2つのパラメータが加わります。送料は G2、税率は H2 です。B2×C2 に送料を足し、1＋税率を掛けます。コピーしても参照がずれないよう、2つのパラメータには $ を付けます。", "這張表比上一題多了兩個全表共用的參數：運費在 G2、稅率在 H2。先以 B2×C2 算出金額，加上運費，再乘上 1 加稅率。兩個參數都要用 $ 鎖定，否則公式往下複製時會偏離參數儲存格。"),
          hint: L("$G$2 同时锁列和锁行，$H$2 也一样。别把 $ 当成货币符号；在这里它是“复制时不漂移”的锁定标记。", "$G$2 locks both column and row, and $H$2 does the same. Here $ is not a currency symbol; it prevents the reference from drifting when the formula is copied.", "$G$2 は列と行の両方を固定し、$H$2 も同じです。$ は通貨記号ではなく、コピー時の参照ずれを防ぐ記号です。", "$G$2 同時鎖定欄與列，$H$2 也一樣。這裡的 $ 不是貨幣符號，而是「複製時不偏移」的鎖定標記。"),
          success: L("以后只改 G2 的运费或 H2 的税率，所有报价都会一起更新。这正是共享参数比写死数字更可靠的地方。", "Change the freight in G2 or the tax rate in H2 once and every quote updates. That is why shared parameters are safer than hard-coded numbers.", "G2 の送料や H2 の税率を1回変えるだけで、すべての見積が更新されます。数値を直接書くより安全な理由です。", "之後只要改 G2 的運費或 H2 的稅率，所有報價都會一起更新。這就是共用參數比直接寫死數字可靠的地方。"),
          fillBlanks: [2, 6, 12],
        }),
        practice({
          id: "drill-absolute-quote",
          title: L("给不同商品套用同一组参数", "Apply shared parameters to different items", "共通パラメータを各商品に適用"),
          lead: L("每道题都要求保留 $G$2 和 $H$2，结果也要匹配。", "Every task requires $G$2 and $H$2 and a matching result.", "各タスクで $G$2 と $H$2 を保持し、結果も一致させます。"),
          sheet: quote,
          tasks: quoteItems.slice(0, 4).map((item, index) => task({
            id: "absolute-" + index,
            sheet: quote,
            target: "F" + item.row,
            taskLabel: L("固定参数报价", "Fixed-parameter quote", "固定パラメータ見積"),
            title: fill(L("计算{name}的含税合计", "Tax-inclusive total for {name}", "{name}の税込合計"), { name: item.name }),
            lead: fill(L("在 F{row} 计算数量 × 单价，加固定运费 G2，再乘 1+税率 H2。", "In F{row}, multiply quantity by price, add fixed freight G2, then multiply by 1 plus tax H2.", "F{row} で数量×単価に固定送料 G2 を足し、1+税率 H2 を掛けます。"), { row: item.row }),
            hint: fill(L("参考：=(B{row}*C{row}+$G$2)*(1+$H$2)", "Reference: =(B{row}*C{row}+$G$2)*(1+$H$2)", "参考：=(B{row}*C{row}+$G$2)*(1+$H$2)"), { row: item.row }),
            success: fill(L("{name}已使用同一组运费和税率。", "{name} now uses the shared freight and tax values.", "{name}に共通の送料と税率を適用しました。"), { name: item.name }),
            formula: "=(B" + item.row + "*C" + item.row + "+$G$2)*(1+$H$2)",
            requiredText: ["$G$2", "$H$2"],
          })),
          hint: L("$ 是锁定符号，不是货币符号。", "$ is a lock, not a currency symbol.", "$ は固定記号で、通貨記号ではありません。"),
        }),
        practice({
          id: "drill-absolute-transfer",
          title: L("从报价单走到销售提成", "From quotes to sales commission", "見積から営業手数料へ", "從報價單走到銷售獎金"),
          lead: L("销售表右上角也有一个提成率 K1。这里把 SUM、算术和固定引用组合起来。", "The sales sheet has a commission rate in K1. Combine SUM, arithmetic, and fixed references.", "営業表の K1 に手数料率があります。SUM、四則演算、固定参照を組み合わせます。"),
          sheet: sales,
          tasks: [
            ...salesPeople.slice(0, 4).map((person, index) => task({
              id: "absolute-transfer-" + index,
              sheet: sales,
              target: "I" + person.row,
              taskLabel: L("固定提成率", "Shared commission rate", "共通手数料率"),
              title: fill(L("计算{name}的季度提成", "Quarterly commission for {name}", "{name}の四半期手数料"), { name: person.name }),
              lead: fill(L("在 I{row} 汇总 C{row}:E{row}，再乘固定提成率 $K$1。", "In I{row}, total C{row}:E{row}, then multiply by fixed rate $K$1.", "I{row} で C{row}:E{row} を合計し、固定率 $K$1 を掛けます。"), { row: person.row }),
              hint: fill(L("参考：=SUM(C{row}:E{row})*$K$1", "Reference: =SUM(C{row}:E{row})*$K$1", "参考：=SUM(C{row}:E{row})*$K$1"), { row: person.row }),
              success: fill(L("{name}的提成会使用同一个 K1 参数。", "The commission for {name} uses the shared K1 rate.", "{name}の手数料は共通の K1 を使います。"), { name: person.name }),
              formula: "=SUM(C" + person.row + ":E" + person.row + ")*$K$1",
              requiredFunctions: ["SUM"],
              requiredText: ["$K$1"],
            })),
            task({ id: "absolute-transfer-total", sheet: sales, target: "I10", taskLabel: L("总提成", "Total commission", "手数料合計"), title: L("汇总所有人的提成", "Total commission for everyone", "全員の手数料合計"), lead: L("在 I10 汇总 I2:I9。这里检验上一步的固定提成率是否能整列复用。", "In I10, total I2:I9. This checks whether the fixed rate can be reused down the column.", "I10 で I2:I9 を合計します。固定率を列全体に使えるか確認します。"), hint: L("参考：=SUM(I2:I9)", "Reference: =SUM(I2:I9)", "参考：=SUM(I2:I9)"), success: L("提成公式已经可以铺到整列。", "The commission formula is ready for the whole column.", "手数料数式を列全体に使えます。"), formula: "=SUM(I2:I9)", requiredFunctions: ["SUM"] }),
          ],
          hint: L("先 SUM 出季度合计，再乘同一个提成率。", "SUM the quarter first, then multiply by the same rate.", "まず四半期合計を SUM し、同じ率を掛けます。"),
        }),
      ], { xp: 35 }),

      level("foundation-check", "review", L("报价与销售小结算", "Quote and Sales Checkpoint", "見積と売上のチェックポイント"), [
        learn(
          "brief-foundation-check",
          L("周五下午的临时复核", "Friday afternoon spot check", "金曜午後のスポット確認", "週五下午的臨時複核"),
          L("没有新函数。主管把报价单和销售表一起发来，要求你把算术、SUM 和固定引用混着用。先读任务，再决定哪一种写法最省事。", "No new functions today. Your manager sends both the quote and sales sheets and asks you to combine arithmetic, SUM, and fixed references. Read the task before choosing the formula.", "新しい関数はありません。見積書と営業表で、四則演算、SUM、固定参照を組み合わせます。"),
          [
            L("金额类任务优先引用数量和单价", "For amount tasks, reference quantity and price", "金額タスクでは数量と単価を参照します"),
            L("区域汇总用冒号，不连续项目用逗号或加号", "Use a colon for ranges and commas or plus for gaps", "連続範囲はコロン、飛び飛びはカンマかプラスです"),
            L("共享参数要锁，单行数据不要锁", "Lock shared parameters, not row-level data", "共通パラメータは固定し、行データは固定しません"),
            L("先估个大概大小，再看预览，别让公式对了、区域却选错", "Estimate the rough size first, then use the preview to catch a wrong range", "まずおおよその大きさを予測し、プレビューで範囲ミスを確認します"),
          ],
          L("这一关不计新知识，只训练在真实任务中选对公式。", "This level adds no new knowledge; it trains choosing the right formula in a real task.", "新しい知識は増やさず、実務で正しい数式を選ぶ練習です。"),
          "=SUM(B2:B7)*$H$2"
        ),
        practice({
          id: "foundation-check-quote",
          title: L("报价单复核", "Quote review", "見積書の確認"),
          lead: L("随机抽取金额、含税合计和区间总额。看清楚是单件计算还是整表汇总。", "Random tasks cover amounts, tax-inclusive totals, and range totals. Decide whether it is one item or the whole table.", "金額、税込、範囲合計がランダムに出ます。単品か全体かを判断します。"),
          sheet: quote,
          tasks: [
            task({ id: "foundation-quote-1", sheet: quote, target: "D2", taskLabel: L("单件金额", "Item amount", "単品金額"), title: L("算会议屏金额", "Calculate the meeting screen", "会議用スクリーンの金額"), lead: L("在 D2 用数量和单价计算，不要输入 6400。", "In D2, use quantity and price; do not type 6400.", "D2 で数量と単価を使います。6400 は入力しません。"), hint: L("参考：=B2*C2", "Reference: =B2*C2", "参考：=B2*C2"), success: L("源数据一变，金额自动更新。", "Changing source data updates the amount.", "元データを変えると金額が更新されます。"), formula: "=B2*C2" }),
            task({ id: "foundation-quote-2", sheet: quote, target: "D10", taskLabel: L("区间汇总", "Range total", "範囲合計"), title: L("汇总所有商品数量", "Total all item quantities", "全商品の数量合計"), lead: L("在 D10 用 SUM 汇总 B2:B7。", "In D10, use SUM over B2:B7.", "D10 で SUM を使い B2:B7 を合計します。"), hint: L("参考：=SUM(B2:B7)", "Reference: =SUM(B2:B7)", "参考：=SUM(B2:B7)"), success: L("共 35 件商品。", "There are 35 units in total.", "合計35個です。"), formula: "=SUM(B2:B7)", requiredFunctions: ["SUM"] }),
            task({ id: "foundation-quote-3", sheet: quote, target: "F3", taskLabel: L("固定参数", "Shared parameters", "共通パラメータ"), title: L("麦克风的含运费含税报价", "Mic quote with freight and tax", "マイクの送料税込見積"), lead: L("在 F3 使用 $G$2 和 $H$2，保证公式可以向下复制。", "In F3, use $G$2 and $H$2 so the formula can be copied down.", "F3 で $G$2 と $H$2 を使い、下へコピーできるようにします。"), hint: L("参考：=(B3*C3+$G$2)*(1+$H$2)", "Reference: =(B3*C3+$G$2)*(1+$H$2)", "参考：=(B3*C3+$G$2)*(1+$H$2)"), success: L("固定参数没有跑偏。", "The shared parameters stayed locked.", "共通パラメータは固定されたままです。"), formula: "=(B3*C3+$G$2)*(1+$H$2)", requiredText: ["$G$2", "$H$2"] }),
            task({ id: "foundation-quote-4", sheet: quote, target: "F4", taskLabel: L("报价校验", "Quote check", "見積確認"), title: L("笔记本报价加急 8%", "Laptop quote plus 8% rush", "ノートPC見積に8%特急料金"), lead: L("在 F4 计算数量 × 单价，再加固定运费，最后整体乘以 1.08。", "In F4, calculate quantity times price, add fixed freight, then multiply everything by 1.08.", "F4 で数量×単価に固定送料を足し、全体に1.08を掛けます。"), hint: L("参考：=(B4*C4+$G$2)*1.08", "Reference: =(B4*C4+$G$2)*1.08", "参考：=(B4*C4+$G$2)*1.08"), success: L("加急费和基础报价放在同一条公式中。", "The rush fee and base quote share one formula.", "特急料金と基本見積を1つの数式で扱いました。"), formula: "=(B4*C4+$G$2)*1.08", requiredText: ["$G$2"] }),
          ],
          hint: L("题干的“整体上浮”通常意味着最后再乘系数。", "A whole-quote uplift usually means multiplying at the end.", "全体への加算は最後に係数を掛けます。"),
        }),
        practice({
          id: "foundation-check-sales",
          title: L("销售表混合复核", "Mixed sales review", "営業表の複合確認"),
          lead: L("这里把行、列和固定提成率混在一起。每次只做一小步，算完再看预览是否正确。", "Combine rows, columns, and a fixed commission rate. Take one small step at a time and check the preview.", "行・列・固定手数料率を組み合わせます。小さく計算してプレビューを確認します。"),
          sheet: sales,
          tasks: [
            task({ id: "foundation-sales-1", sheet: sales, target: "H10", taskLabel: L("季度总盘", "Quarter total", "四半期合計"), title: L("汇总全团队一季度销售额", "Total the whole team's quarter", "チーム全体の四半期売上"), lead: L("在 H10 汇总 C2:E9 的整块三个月数据。", "In H10, total the whole C2:E9 block of three months.", "H10 で C2:E9 の3か月分を合計します。"), hint: L("参考：=SUM(C2:E9)", "Reference: =SUM(C2:E9)", "参考：=SUM(C2:E9)"), success: L("整块区域只用一条 SUM。", "One SUM handles the whole block.", "1つの SUM で範囲全体を集計できます。"), formula: "=SUM(C2:E9)", requiredFunctions: ["SUM"] }),
            task({ id: "foundation-sales-2", sheet: sales, target: "I2", taskLabel: L("固定提成率", "Fixed commission rate", "固定手数料率"), title: L("林晓的季度提成", "Lin's quarterly commission", "林さんの四半期手数料"), lead: L("在 I2 汇总 C2:E2，再乘固定提成率 $K$1。", "In I2, total C2:E2 and multiply by fixed rate $K$1.", "I2 で C2:E2 を合計し、固定率 $K$1 を掛けます。"), hint: L("参考：=SUM(C2:E2)*$K$1", "Reference: =SUM(C2:E2)*$K$1", "参考：=SUM(C2:E2)*$K$1"), success: L("提成率固定，行号保持相对。", "The rate is fixed while the row stays relative.", "率は固定し、行は相対のままです。"), formula: "=SUM(C2:E2)*$K$1", requiredFunctions: ["SUM"], requiredText: ["$K$1"] }),
            task({ id: "foundation-sales-3", sheet: sales, target: "D11", taskLabel: L("列合计后分摊", "Column total and split", "列合計から按分"), title: L("二月平均每人销售", "February average per rep", "2月の1人あたり売上"), lead: L("在 D11 用 SUM 汇总 D2:D9，再除以 8。", "In D11, total D2:D9 and divide by eight.", "D11 で D2:D9 を合計し、8で割ります。"), hint: L("参考：=SUM(D2:D9)/8", "Reference: =SUM(D2:D9)/8", "参考：=SUM(D2:D9)/8"), success: L("合计和平均可以连着写。", "Totals and averages can be chained.", "合計と平均を続けて計算できます。"), formula: "=SUM(D2:D9)/8", requiredFunctions: ["SUM"] }),
            task({ id: "foundation-sales-4", sheet: sales, target: "H11", taskLabel: L("两行合并", "Two-row total", "2行合計"), title: L("华东前两位的季度合计", "Quarter total for the first two East reps", "東部の最初の2名の合計"), lead: L("在 H11 分别汇总 C2:E2 与 C3:E3，再把两个合计相加。", "In H11, total C2:E2 and C3:E3 separately, then add the totals.", "H11 で C2:E2 と C3:E3 をそれぞれ合計し、足します。"), hint: L("参考：=SUM(C2:E2)+SUM(C3:E3)", "Reference: =SUM(C2:E2)+SUM(C3:E3)", "参考：=SUM(C2:E2)+SUM(C3:E3)"), success: L("两段区域合并不会误选整张表。", "Two explicit ranges avoid selecting the whole table.", "2つの範囲指定で表全体を誤選択しません。"), formula: "=SUM(C2:E2)+SUM(C3:E3)", requiredFunctions: ["SUM"] }),
          ],
          hint: L("先判断是横着汇总还是竖着汇总。", "Decide whether the total runs across a row or down a column.", "横方向か縦方向かを判断します。"),
        }),
      ], { xp: 40 }),
    ],
  });

  D.registerChapter({
    id: "ch02-aggregates",
    icon: "02",
    title: L("第 2 章 · 一眼看懂一组数字", "Chapter 2 · Read a Set of Numbers", "第2章 · 数値のまとまりを読む"),
    subtitle: L("从平均值、计数到极值和取整，每次多一个观察角度，再把新招数用回真实报表。", "Move from averages and counts to extremes and rounding, adding one perspective at a time, then use each new move on a real report.", "平均、個数から最大最小、丸めへと一つずつ増やし、新しい考え方を実務表で使います。"),
    levels: [
      level("aggregate-average", "lesson", L("平均与计数：先看整体，再看有多少", "Average and Count: Read the Group", "平均と個数：まとまりを読む"), [
        learn(
          "brief-average",
          L("主管只问两个问题", "Your manager asks two questions", "上司からの2つの質問"),
          L("“大家一月平均卖了多少？”和“表里到底有多少条有效记录？”不用一个个数，AVERAGE、COUNT、COUNTA 会替你回答。", "How much did the team average in January, and how many valid records are there? AVERAGE, COUNT, and COUNTA answer both questions.", "1月の平均売上と有効レコード数は？ AVERAGE、COUNT、COUNTA が答えます。"),
          [
            L("AVERAGE 只看数字并求算术平均", "AVERAGE uses numeric cells only and returns the arithmetic mean", "AVERAGE は数値セルだけを使います"),
            L("COUNT 数数字的个数；COUNTA 数非空单元格", "COUNT counts numbers; COUNTA counts non-empty cells", "COUNT は数値、COUNTA は空白でないセルを数えます"),
            L("区域里的文字不会进入 AVERAGE 的分母", "Text in a range does not enter AVERAGE's denominator", "範囲内の文字は AVERAGE の分母に入りません"),
            L("先确认统计对象，再选 COUNT 还是 COUNTA", "Decide what you are counting before choosing COUNT or COUNTA", "何を数えるかを決めてから COUNT か COUNTA を選びます"),
          ],
          L("平均不是总和除以行数，而是除以真正有数字的单元格数。", "An average divides by the numeric cells that actually exist, not by the row count.", "平均は行数ではなく、実際に数値があるセル数で割ります。"),
          "=AVERAGE(C2:C9)"
        ),
        builder({
          id: "build-average-jan",
          sheet: sales,
          formula: "=AVERAGE(C2:C9)",
          title: L("填出一月平均销售额", "Fill in the January average", "1月平均売上を穴埋めする", "填入一月平均銷售額"),
          lead: L("主管问的是“平均每笔卖了多少”，不是总额。统计对象是一月 C2:C9 这一整列的有效数字；先填入正确的平均值函数，再用一个连续区域覆盖数据行，避免漏掉最后一名销售。", "Your manager asks for the average sale, not the total. The source is the January column C2:C9. Enter the averaging function, then cover the full data range so the last salesperson is not left out.", "上司が知りたいのは合計ではなく「1件あたりの平均」です。対象は1月列 C2:C9 の数値です。平均関数を入れ、最後の担当者を外さないようデータ範囲全体を指定します。", "主管問的是「平均每筆賣了多少」，不是總額。統計對象是一月 C2:C9 這整欄的有效數字；先填入正確的平均函數，再用一個連續範圍涵蓋所有資料橫列，避免漏掉最後一位業務員。"),
          hint: L("AVERAGE 只计算区域中的数字，文字和空单元格不会进入分母。区域顺序写成 C2:C9，起点在上、终点在下。", "AVERAGE uses numeric cells only; text and blanks do not enter the denominator. Write the range as C2:C9, starting at the top and ending at the bottom.", "AVERAGE は範囲内の数値だけを使い、文字や空白は分母に入りません。範囲は上から下へ C2:C9 と書きます。", "AVERAGE 只計算範圍中的數字，文字和空白儲存格不會列入分母。範圍順序寫成 C2:C9，起點在上、終點在下。"),
          success: L("结果约 1002.5，表示一月 8 条销售记录的平均值。若中间某格不是数字，它会自动从分母中排除。", "The result is about 1002.5, the mean of the eight January records. Any nonnumeric cell is automatically excluded from the denominator.", "結果は約1002.5で、1月の8件の平均です。数値でないセルは自動的に分母から除外されます。", "結果約 1002.5，是一月 8 筆銷售紀錄的平均值。若中間某個儲存格不是數字，會自動從分母排除。"),
          fillBlanks: [1, 3],
        }),
        practice({
          id: "drill-average-count",
          title: L("三个月的平均值与记录数", "Monthly averages and record counts", "月別平均と件数"),
          lead: L("任务会随机切换到不同月份，或要求你用 COUNT/COUNTA 回答“有多少”。", "Tasks switch among months or ask how many with COUNT or COUNTA.", "月の切り替えや COUNT/COUNTA の件数問題が出ます。"),
          sheet: sales,
          tasks: [
            task({ id: "avg-jan", sheet: sales, target: "C11", taskLabel: L("月平均", "Monthly average", "月平均"), title: L("一月平均销售额", "January average sales", "1月平均売上"), lead: L("在 C11 对 C2:C9 求平均。", "In C11, average C2:C9.", "C11 で C2:C9 の平均を求めます。"), hint: L("参考：=AVERAGE(C2:C9)", "Reference: =AVERAGE(C2:C9)", "参考：=AVERAGE(C2:C9)"), success: L("一月平均约 1002.5。", "The January average is 1002.5.", "1月平均は約1002.5です。"), formula: "=AVERAGE(C2:C9)", requiredFunctions: ["AVERAGE"] }),
            task({ id: "avg-feb", sheet: sales, target: "D11", taskLabel: L("月平均", "Monthly average", "月平均"), title: L("二月平均销售额", "February average sales", "2月平均売上"), lead: L("在 D11 对 D2:D9 求平均。", "In D11, average D2:D9.", "D11 で D2:D9 の平均を求めます。"), hint: L("参考：=AVERAGE(D2:D9)", "Reference: =AVERAGE(D2:D9)", "参考：=AVERAGE(D2:D9)"), success: L("二月平均约 956.25。", "The February average is 956.25.", "2月平均は約956.25です。"), formula: "=AVERAGE(D2:D9)", requiredFunctions: ["AVERAGE"] }),
            task({ id: "avg-mar", sheet: sales, target: "E11", taskLabel: L("月平均", "Monthly average", "月平均"), title: L("三月平均销售额", "March average sales", "3月平均売上"), lead: L("在 E11 对 E2:E9 求平均。", "In E11, average E2:E9.", "E11 で E2:E9 の平均を求めます。"), hint: L("参考：=AVERAGE(E2:E9)", "Reference: =AVERAGE(E2:E9)", "参考：=AVERAGE(E2:E9)"), success: L("三月平均约 1001.25。", "The March average is 1001.25.", "3月平均は約1001.25です。"), formula: "=AVERAGE(E2:E9)", requiredFunctions: ["AVERAGE"] }),
            task({ id: "count-jan", sheet: sales, target: "C12", taskLabel: L("数字个数", "Numeric count", "数値の個数"), title: L("一月有多少个数字", "How many January numeric cells?", "1月の数値セル数"), lead: L("在 C12 用 COUNT 统计 C2:C9。", "In C12, count numbers in C2:C9 with COUNT.", "C12 で COUNT を使い C2:C9 の数値を数えます。"), hint: L("参考：=COUNT(C2:C9)", "Reference: =COUNT(C2:C9)", "参考：=COUNT(C2:C9)"), success: L("共有 8 条数字记录。", "There are eight numeric records.", "8件の数値レコードがあります。"), formula: "=COUNT(C2:C9)", requiredFunctions: ["COUNT"] }),
            task({ id: "counta-people", sheet: sales, target: "A12", taskLabel: L("非空记录", "Non-empty count", "空白以外"), title: L("名单里有多少位销售员", "How many reps are listed?", "担当者は何人？"), lead: L("在 A12 用 COUNTA 统计 A2:A9。", "In A12, count non-empty cells in A2:A9 with COUNTA.", "A12 で COUNTA を使い A2:A9 の空白以外を数えます。"), hint: L("参考：=COUNTA(A2:A9)", "Reference: =COUNTA(A2:A9)", "参考：=COUNTA(A2:A9)"), success: L("名单共 8 人。", "The list contains eight people.", "名簿は8人です。"), formula: "=COUNTA(A2:A9)", requiredFunctions: ["COUNTA"] }),
          ],
          hint: L("平均用 AVERAGE；非空计数用 COUNTA。", "Use AVERAGE for averages and COUNTA for non-empty cells.", "平均は AVERAGE、空白以外は COUNTA です。"),
        }),
        practice({
          id: "drill-average-transfer",
          title: L("平均值和先前知识的组合", "Combine averages with earlier skills", "平均と既習内容の組み合わせ"),
          lead: L("这里会把 SUM、COUNT、AVERAGE 和除法组合起来。结果对了，还要看函数是否用对。", "Combine SUM, COUNT, AVERAGE, and division. Matching the result is not enough; use the required function.", "SUM、COUNT、AVERAGE、割り算を組み合わせます。結果だけでなく関数も確認します。"),
          sheet: sales,
          tasks: [
            task({ id: "avg-transfer-1", sheet: sales, target: "C13", taskLabel: L("手算平均", "Average from SUM/COUNT", "SUMとCOUNTで平均"), title: L("用 SUM 和 COUNT 重算一月平均", "Rebuild January average with SUM and COUNT", "SUM と COUNT で1月平均を再計算"), lead: L("在 C13 用 SUM 除以 COUNT，不用 AVERAGE。", "In C13, divide SUM by COUNT without using AVERAGE.", "C13 で AVERAGE を使わず、SUM を COUNT で割ります。"), hint: L("参考：=SUM(C2:C9)/COUNT(C2:C9)", "Reference: =SUM(C2:C9)/COUNT(C2:C9)", "参考：=SUM(C2:C9)/COUNT(C2:C9)"), success: L("结果与 AVERAGE 一致，说明平均值由总和与个数共同决定。", "The result matches AVERAGE: a mean is total divided by count.", "AVERAGE と同じ結果です。平均は合計÷個数です。"), formula: "=SUM(C2:C9)/COUNT(C2:C9)", requiredFunctions: ["SUM", "COUNT"] }),
            task({ id: "avg-transfer-2", sheet: sales, target: "C14", taskLabel: L("整块平均", "Block average", "範囲全体の平均"), title: L("三个月所有数字的平均", "Average every number across three months", "3か月全数値の平均"), lead: L("在 C14 对 C2:E9 这一整块求平均。", "In C14, average the whole C2:E9 block.", "C14 で C2:E9 全体の平均を求めます。"), hint: L("参考：=AVERAGE(C2:E9)", "Reference: =AVERAGE(C2:E9)", "参考：=AVERAGE(C2:E9)"), success: L("跨列区域同样可以用一个 AVERAGE。", "One AVERAGE can span multiple columns.", "複数列の範囲も1つの AVERAGE で扱えます。"), formula: "=AVERAGE(C2:E9)", requiredFunctions: ["AVERAGE"] }),
            task({ id: "avg-transfer-3", sheet: sales, target: "C15", taskLabel: L("整块计数", "Block count", "範囲の個数"), title: L("三个月共有多少个数字", "How many numbers across three months?", "3か月で数値はいくつ？"), lead: L("在 C15 用 COUNT 统计 C2:E9。", "In C15, use COUNT on C2:E9.", "C15 で COUNT を使い C2:E9 を数えます。"), hint: L("参考：=COUNT(C2:E9)", "Reference: =COUNT(C2:E9)", "参考：=COUNT(C2:E9)"), success: L("共有 24 个数字。", "There are 24 numbers.", "24個の数値があります。"), formula: "=COUNT(C2:E9)", requiredFunctions: ["COUNT"] }),
            task({ id: "avg-transfer-4", sheet: sales, target: "C16", taskLabel: L("团队规模", "Team size", "チーム人数"), title: L("团队人数用于人均计算", "Team size for per-person calculations", "1人あたり計算用の人数"), lead: L("在 C16 用 COUNTA 统计 A2:A9。", "In C16, use COUNTA on A2:A9.", "C16 で COUNTA を使い A2:A9 を数えます。"), hint: L("参考：=COUNTA(A2:A9)", "Reference: =COUNTA(A2:A9)", "参考：=COUNTA(A2:A9)"), success: L("人数为 8。", "The team size is eight.", "チーム人数は8人です。"), formula: "=COUNTA(A2:A9)", requiredFunctions: ["COUNTA"] }),
          ],
          hint: L("SUM/COUNT 和 AVERAGE 应得到同一结果，可以互相校验。", "SUM/COUNT and AVERAGE should agree and can validate each other.", "SUM/COUNT と AVERAGE は同じ結果になり、相互確認できます。"),
        }),
      ], { xp: 30 }),

      level("aggregate-extremes", "lesson", L("极值与取整：把报表说成人话", "Extremes and Rounding: Make Reports Readable", "最大最小と丸め：読みやすくする"), [
        learn(
          "brief-extremes",
          L("报表上不要一串小数", "Reports should not end in decimal noise", "レポートに小数を並べない"),
          L("主管想知道最高、最低、差距，还希望展示到一位小数。MAX、MIN 找极值，ROUND 系列负责把结果变得好读。", "Your manager wants the highest, lowest, and gap, shown to one decimal place. MAX and MIN find extremes; ROUND functions make them readable.", "上司は最高、最低、差を1桁小数で見たいと考えています。MAX/MIN で極値、ROUND 系で読みやすくします。"),
          [
            L("MAX 找最大值，MIN 找最小值", "MAX finds the maximum; MIN finds the minimum", "MAX は最大、MIN は最小です"),
            L("ROUND 四舍五入，ROUNDUP 向上，ROUNDDOWN 向下", "ROUND rounds to nearest, ROUNDUP goes up, ROUNDDOWN goes down", "ROUND は四捨五入、ROUNDUP は切り上げ、ROUNDDOWN は切り捨て"),
            L("第二个参数是保留几位小数", "The second argument is the number of decimal places", "2番目の引数は小数桁数です"),
            L("先算业务结果，再套 ROUND，不要先取整再计算", "Calculate the business value first, then round it", "業務値を計算してから丸めます"),
          ],
          L("取整只改变本次结果，不改动源数据。", "Rounding changes this result, not the source data.", "丸めは計算結果だけを変え、元データは変えません。"),
          "=ROUND(AVERAGE(C2:C9),1)"
        ),
        builder({
          id: "build-round-average",
          sheet: sales,
          formula: "=ROUND(AVERAGE(C2:C9),1)",
          title: L("填出保留一位小数的月平均", "Fill in a one-decimal monthly average", "小数1桁の月平均を穴埋めする", "填入保留一位小數的月平均"),
          lead: L("报表不想显示一长串小数，需要把平均结果整理到一位小数。这里不是先算完再手改，而是让 ROUND 包住 AVERAGE：内层负责求平均，外层负责控制显示精度。空位里要同时体现这层嵌套关系。", "The report needs one decimal place, but the value must still update automatically. Use ROUND around AVERAGE: the inner function calculates the mean and the outer function controls precision. The blanks show how that nesting is built.", "レポート用に小数1桁へ整えますが、値は自動更新のままにします。AVERAGE を ROUND で包み、内側で平均、外側で桁数を指定します。穴埋めで入れ子の関係を確認します。", "報表不想顯示一長串小數，需要把平均結果整理到一位小數。這裡不是算完再手改，而是讓 ROUND 包住 AVERAGE：內層負責求平均，外層負責控制顯示精度。空位要同時呈現這層巢狀關係。"),
          hint: L("函数可以嵌套：括号里的结果会成为外层函数的参数。写 1 表示保留一位小数，写 0 才是整数。", "Functions can nest: the inner result becomes the outer function's argument. Use 1 for one decimal place; 0 would keep whole numbers only.", "関数は入れ子にできます。内側の結果が外側の引数になります。1なら小数1桁、0なら整数です。", "函數可以巢狀：內層結果會成為外層函數的參數。寫 1 代表保留一位小數，寫 0 才是整數。"),
          success: L("平均值先被计算，再整理为一位小数，显示为 1002.5。源数据变化时，两层函数仍会一起重算。", "The mean is calculated first and then rounded to one decimal place, showing 1002.5. Both layers recalculate when the source data changes.", "平均値を計算してから小数1桁に整え、1002.5 と表示されます。元データが変われば2つの関数が一緒に再計算されます。", "平均值先被計算，再整理為一位小數，顯示為 1002.5。來源資料變動時，兩層函數仍會一起重算。"),
          fillBlanks: [1, 3, 5],
        }),
        practice({
          id: "drill-extremes",
          title: L("最高、最低和差距", "Highest, lowest, and spread", "最大・最小・差"),
          lead: L("随机任务可能只要一个极值，也可能要求两个结果相减。先看题目动词。", "Tasks may ask for one extreme or for the difference between two. Read the verb carefully.", "1つの極値か、2つの差かを問題文で判断します。"),
          sheet: sales,
          tasks: [
            task({ id: "extreme-max-jan", sheet: sales, target: "C11", taskLabel: L("最高值", "Maximum", "最大値"), title: L("一月最高销售额", "Highest January sales", "1月最高売上"), lead: L("在 C11 对 C2:C9 求最大值。", "In C11, find the maximum of C2:C9.", "C11 で C2:C9 の最大値を求めます。"), hint: L("参考：=MAX(C2:C9)", "Reference: =MAX(C2:C9)", "参考：=MAX(C2:C9)"), success: L("最高是一月 1580。", "The maximum is 1580.", "最大は1580です。"), formula: "=MAX(C2:C9)", requiredFunctions: ["MAX"] }),
            task({ id: "extreme-min-jan", sheet: sales, target: "C12", taskLabel: L("最低值", "Minimum", "最小値"), title: L("一月最低销售额", "Lowest January sales", "1月最低売上"), lead: L("在 C12 对 C2:C9 求最小值。", "In C12, find the minimum of C2:C9.", "C12 で C2:C9 の最小値を求めます。"), hint: L("参考：=MIN(C2:C9)", "Reference: =MIN(C2:C9)", "参考：=MIN(C2:C9)"), success: L("最低是一月 420。", "The minimum is 420.", "最小は420です。"), formula: "=MIN(C2:C9)", requiredFunctions: ["MIN"] }),
            task({ id: "extreme-gap", sheet: sales, target: "C13", taskLabel: L("极差", "Spread", "範囲"), title: L("一月最高与最低相差多少", "January max minus min", "1月の最大と最小の差"), lead: L("在 C13 用 MAX 减去 MIN。", "In C13, subtract MIN from MAX.", "C13 で MAX から MIN を引きます。"), hint: L("参考：=MAX(C2:C9)-MIN(C2:C9)", "Reference: =MAX(C2:C9)-MIN(C2:C9)", "参考：=MAX(C2:C9)-MIN(C2:C9)"), success: L("极差是 1160。", "The spread is 1160.", "差は1160です。"), formula: "=MAX(C2:C9)-MIN(C2:C9)", requiredFunctions: ["MAX", "MIN"] }),
            task({ id: "extreme-round", sheet: sales, target: "D11", taskLabel: L("四舍五入", "Round to nearest", "四捨五入"), title: L("二月平均保留整数", "February average rounded to an integer", "2月平均を整数に丸める"), lead: L("在 D11 先求 D2:D9 平均，再用 ROUND 保留 0 位。", "In D11, average D2:D9, then use ROUND with zero decimals.", "D11 で D2:D9 の平均を求め、ROUND で0桁にします。"), hint: L("参考：=ROUND(AVERAGE(D2:D9),0)", "Reference: =ROUND(AVERAGE(D2:D9),0)", "参考：=ROUND(AVERAGE(D2:D9),0)"), success: L("结果显示为 956。", "The result displays as 956.", "結果は956です。"), formula: "=ROUND(AVERAGE(D2:D9),0)", requiredFunctions: ["ROUND", "AVERAGE"] }),
            task({ id: "extreme-roundup", sheet: sales, target: "E11", taskLabel: L("向上取整", "Round up", "切り上げ"), title: L("三月平均向上取整", "March average rounded up", "3月平均を切り上げ"), lead: L("在 E11 对 E2:E9 平均后使用 ROUNDUP，保留 0 位。", "In E11, average E2:E9 and use ROUNDUP with zero decimals.", "E11 で E2:E9 の平均を求め、ROUNDUP で0桁にします。"), hint: L("参考：=ROUNDUP(AVERAGE(E2:E9),0)", "Reference: =ROUNDUP(AVERAGE(E2:E9),0)", "参考：=ROUNDUP(AVERAGE(E2:E9),0)"), success: L("向上取整得到 1002。", "Rounding up gives 1002.", "切り上げで1002になります。"), formula: "=ROUNDUP(AVERAGE(E2:E9),0)", requiredFunctions: ["ROUNDUP", "AVERAGE"] }),
          ],
          hint: L("ROUND 的第二参数写 0 代表整数。", "A second argument of zero means a whole number.", "ROUND の2番目が0なら整数です。"),
        }),
        practice({
          id: "drill-round-transfer",
          title: L("把极值和取整带回业务", "Bring extremes and rounding into business", "極値と丸めを業務に戻す"),
          lead: L("这里会把 SUM、COUNT、AVERAGE、MAX/MIN 和 ROUND 组合成能直接放进周报的公式。", "Combine SUM, COUNT, AVERAGE, MAX/MIN, and ROUND into formulas that can go straight into a weekly report.", "SUM、COUNT、AVERAGE、MAX/MIN、ROUND を週報向けに組み合わせます。"),
          sheet: sales,
          tasks: [
            task({ id: "round-transfer-1", sheet: sales, target: "C17", taskLabel: L("计算后取整", "Calculate then round", "計算後に丸める"), title: L("用 SUM/COUNT 计算平均并保留一位", "Average from SUM/COUNT to one decimal", "SUM/COUNT 平均を小数1桁に"), lead: L("在 C17 用 SUM 除以 COUNT，再套 ROUND 保留 1 位。", "In C17, divide SUM by COUNT and wrap it in ROUND with one decimal.", "C17 で SUM を COUNT で割り、ROUND で1桁にします。"), hint: L("参考：=ROUND(SUM(C2:C9)/COUNT(C2:C9),1)", "Reference: =ROUND(SUM(C2:C9)/COUNT(C2:C9),1)", "参考：=ROUND(SUM(C2:C9)/COUNT(C2:C9),1)"), success: L("结果与 AVERAGE 一致。", "The result agrees with AVERAGE.", "AVERAGE と一致します。"), formula: "=ROUND(SUM(C2:C9)/COUNT(C2:C9),1)", requiredFunctions: ["ROUND", "SUM", "COUNT"] }),
            task({ id: "round-transfer-2", sheet: sales, target: "C18", taskLabel: L("极差取整", "Rounded spread", "差を丸める"), title: L("二月极差保留整数", "February spread rounded to integer", "2月の差を整数に"), lead: L("在 C18 用 MAX(D2:D9)-MIN(D2:D9)，再用 ROUND 取整。", "In C18, use MAX(D2:D9)-MIN(D2:D9), then ROUND.", "C18 で MAX(D2:D9)-MIN(D2:D9) を計算し、ROUND します。"), hint: L("参考：=ROUND(MAX(D2:D9)-MIN(D2:D9),0)", "Reference: =ROUND(MAX(D2:D9)-MIN(D2:D9),0)", "参考：=ROUND(MAX(D2:D9)-MIN(D2:D9),0)"), success: L("极差被整理成整数。", "The spread is presented as a whole number.", "差が整数で表示されます。"), formula: "=ROUND(MAX(D2:D9)-MIN(D2:D9),0)", requiredFunctions: ["ROUND", "MAX", "MIN"] }),
            task({ id: "round-transfer-3", sheet: sales, target: "C19", taskLabel: L("预算档位", "Budget tier", "予算区分"), title: L("一月最高销售额向上取到千元", "Round January maximum up to thousands", "1月最大売上を千単位に切り上げ"), lead: L("在 C19 把 C2:C9 最大值除以 1000，向上保留 1 位，再乘以 1000。", "In C19, divide the max by 1000, round up one decimal, then multiply by 1000.", "C19 で最大値を1000で割り、1桁で切り上げ、1000を掛けます。"), hint: L("参考：=ROUNDUP(MAX(C2:C9)/1000,1)*1000", "Reference: =ROUNDUP(MAX(C2:C9)/1000,1)*1000", "参考：=ROUNDUP(MAX(C2:C9)/1000,1)*1000"), success: L("预算档位向上取到 1600。", "The budget tier rounds up to 1600.", "予算区分は1600に切り上がります。"), formula: "=ROUNDUP(MAX(C2:C9)/1000,1)*1000", requiredFunctions: ["ROUNDUP", "MAX"] }),
            task({ id: "round-transfer-4", sheet: sales, target: "C20", taskLabel: L("双月平均", "Two-month average", "2か月平均"), title: L("一二月平均再取整", "Average January and February, then round", "1・2月平均を丸める"), lead: L("在 C20 对一月和二月平均值再求平均，最后保留整数。", "In C20, average the January and February averages, then round.", "C20 で1月と2月の平均をさらに平均し、整数にします。"), hint: L("参考：=ROUND(AVERAGE(AVERAGE(C2:C9),AVERAGE(D2:D9)),0)", "Reference: =ROUND(AVERAGE(AVERAGE(C2:C9),AVERAGE(D2:D9)),0)", "参考：=ROUND(AVERAGE(AVERAGE(C2:C9),AVERAGE(D2:D9)),0)"), success: L("函数可以互相嵌套，但要从内向外读。", "Functions can nest, but read them from the inside out.", "関数は入れ子にできます。内側から読みます。"), formula: "=ROUND(AVERAGE(AVERAGE(C2:C9),AVERAGE(D2:D9)),0)", requiredFunctions: ["ROUND", "AVERAGE"] }),
          ],
          hint: L("从最里面的区域开始读公式。", "Read a nested formula from its innermost range.", "入れ子は内側の範囲から読みます。"),
        }),
      ], { xp: 35 }),

      level("aggregate-check", "review", L("月度简报：数字要能直接汇报", "Monthly Brief: Numbers Ready to Report", "月次報告：そのまま使える数字"), [
        learn(
          "brief-aggregate-check",
          L("把计算结果放进简报", "Put calculations into the brief", "計算結果を報告書へ"),
          L("这次没有新函数。你会收到临时需求，在销售表、报价单之间切换，选择 SUM、AVERAGE、COUNT、MAX、MIN 或 ROUND。", "No new functions. You will switch between sales and quotes, choosing SUM, AVERAGE, COUNT, MAX, MIN, or ROUND for each request.", "新しい関数はありません。営業表と見積書を行き来し、SUM、AVERAGE、COUNT、MAX、MIN、ROUND を選びます。"),
          [
            L("平均与合计是两种问题，先判断要“总量”还是“典型值”", "Totals and averages answer different questions; decide between total and typical value", "合計か平均かを最初に判断します"),
            L("极值用于找最好、最差和差距", "Extremes reveal best, worst, and spread", "極値で最高・最低・差を出します"),
            L("展示给主管的数字通常要取整", "Numbers shown to managers often need rounding", "上司に見せる数値は丸めます"),
            L("公式预览正确后再提交，避免只改格式不改数据", "Check the formula preview before submitting; formatting is not calculation", "数式プレビューを確認してから提出します"),
          ],
          L("从任务动词判断：汇总、平均、最高、差、取整。", "Use the task verb: total, average, maximum, difference, or round.", "問題文の動詞で判断します。"),
          "=ROUND(AVERAGE(C2:C9),1)"
        ),
        practice({
          id: "aggregate-check-sales",
          title: L("销售简报数字", "Sales brief numbers", "営業報告の数値"),
          lead: L("随机任务会要求月合计、平均值、极值和取整。每一步只填一个结论格。", "Random tasks ask for monthly totals, averages, extremes, and rounding. Fill one conclusion cell at a time.", "月合計、平均、極値、丸めがランダムに出ます。結論セルを1つずつ埋めます。"),
          sheet: sales,
          tasks: [
            task({ id: "agg-check-1", sheet: sales, target: "C21", taskLabel: L("季度合计", "Quarter total", "四半期合計"), title: L("一季度总销售额", "Total quarter sales", "四半期売上合計"), lead: L("在 C21 汇总 C2:E9。", "In C21, total C2:E9.", "C21 で C2:E9 を合計します。"), hint: L("参考：=SUM(C2:E9)", "Reference: =SUM(C2:E9)", "参考：=SUM(C2:E9)"), success: L("季度总额是 23680。", "The quarter total is 23680.", "四半期合計は23680です。"), formula: "=SUM(C2:E9)", requiredFunctions: ["SUM"] }),
            task({ id: "agg-check-2", sheet: sales, target: "C22", taskLabel: L("平均展示", "Average display", "平均表示"), title: L("三个月总体平均保留一位", "Overall three-month average to one decimal", "3か月全体平均を小数1桁に"), lead: L("在 C22 对 C2:E9 求平均，再保留 1 位。", "In C22, average C2:E9 and round to one decimal.", "C22 で C2:E9 の平均を求め、1桁にします。"), hint: L("参考：=ROUND(AVERAGE(C2:E9),1)", "Reference: =ROUND(AVERAGE(C2:E9),1)", "参考：=ROUND(AVERAGE(C2:E9),1)"), success: L("平均值已适合放进简报。", "The average is ready for the brief.", "平均が報告向けになりました。"), formula: "=ROUND(AVERAGE(C2:E9),1)", requiredFunctions: ["ROUND", "AVERAGE"] }),
            task({ id: "agg-check-3", sheet: sales, target: "C23", taskLabel: L("最强月份", "Top month", "最高月"), title: L("三个月的最高单月总量", "Highest monthly total", "月合計の最大値"), lead: L("在 C23 比较 C10:E10 三个月合计，用 MAX 找最高。", "In C23, compare the three totals in C10:E10 with MAX.", "C23 で C10:E10 の3か月合計から MAX を求めます。"), hint: L("参考：=MAX(C10:E10)", "Reference: =MAX(C10:E10)", "参考：=MAX(C10:E10)"), success: L("最高月份是三月。", "March is the strongest month.", "最高は3月です。"), formula: "=MAX(C10:E10)", requiredFunctions: ["MAX"] }),
            task({ id: "agg-check-4", sheet: sales, target: "C24", taskLabel: L("人数核对", "Headcount check", "人数確認"), title: L("名单人数和数字记录数", "People and numeric records", "人数と数値件数"), lead: L("在 C24 用 COUNTA 统计 A2:A9。", "In C24, use COUNTA on A2:A9.", "C24 で COUNTA を使い A2:A9 を数えます。"), hint: L("参考：=COUNTA(A2:A9)", "Reference: =COUNTA(A2:A9)", "参考：=COUNTA(A2:A9)"), success: L("人数为 8。", "There are eight people.", "8人です。"), formula: "=COUNTA(A2:A9)", requiredFunctions: ["COUNTA"] }),
          ],
          hint: L("工作量大的任务先拆成两个小公式，再合并。", "For larger tasks, write two small formulas first, then combine them.", "大きなタスクは小さな数式に分けてから統合します。"),
        }),
        practice({
          id: "aggregate-check-quote",
          title: L("报价单统计复核", "Quote statistics check", "見積統計の確認"),
          lead: L("报价单里既有数量也有单价。注意 AVERAGE 应该统计哪一列。", "The quote has both quantities and prices. Decide which column an average should use.", "見積には数量と単価があります。どちらを平均するか判断します。"),
          sheet: quote,
          tasks: [
            task({ id: "agg-quote-1", sheet: quote, target: "D10", taskLabel: L("数量合计", "Quantity total", "数量合計"), title: L("报价单总件数", "Total units in the quote", "見積の総数量"), lead: L("在 D10 用 SUM 汇总 B2:B7。", "In D10, use SUM over B2:B7.", "D10 で SUM を使い B2:B7 を合計します。"), hint: L("参考：=SUM(B2:B7)", "Reference: =SUM(B2:B7)", "参考：=SUM(B2:B7)"), success: L("共 35 件。", "There are 35 units.", "合計35個です。"), formula: "=SUM(B2:B7)", requiredFunctions: ["SUM"] }),
            task({ id: "agg-quote-2", sheet: quote, target: "D11", taskLabel: L("平均单价", "Average unit price", "平均単価"), title: L("商品平均单价保留一位", "Average unit price to one decimal", "平均単価を小数1桁に"), lead: L("在 D11 对 C2:C7 求平均并保留 1 位。", "In D11, average C2:C7 and round to one decimal.", "D11 で C2:C7 の平均を求め、1桁にします。"), hint: L("参考：=ROUND(AVERAGE(C2:C7),1)", "Reference: =ROUND(AVERAGE(C2:C7),1)", "参考：=ROUND(AVERAGE(C2:C7),1)"), success: L("平均单价约 2465.8。", "The average unit price is about 2465.8.", "平均単価は約2465.8です。"), formula: "=ROUND(AVERAGE(C2:C7),1)", requiredFunctions: ["ROUND", "AVERAGE"] }),
            task({ id: "agg-quote-3", sheet: quote, target: "D12", taskLabel: L("最高单价", "Highest price", "最高単価"), title: L("最贵的商品单价", "Most expensive unit price", "最も高い単価"), lead: L("在 D12 找 C2:C7 最大值。", "In D12, find the maximum of C2:C7.", "D12 で C2:C7 の最大値を求めます。"), hint: L("参考：=MAX(C2:C7)", "Reference: =MAX(C2:C7)", "参考：=MAX(C2:C7)"), success: L("最高单价是 5600。", "The highest price is 5600.", "最高単価は5600です。"), formula: "=MAX(C2:C7)", requiredFunctions: ["MAX"] }),
            task({ id: "agg-quote-4", sheet: quote, target: "D13", taskLabel: L("单价极差", "Price spread", "単価の差"), title: L("最高与最低单价相差多少", "Price range", "単価の最大最小差"), lead: L("在 D13 用 MAX 减 MIN。", "In D13, subtract MIN from MAX.", "D13 で MAX から MIN を引きます。"), hint: L("参考：=MAX(C2:C7)-MIN(C2:C7)", "Reference: =MAX(C2:C7)-MIN(C2:C7)", "参考：=MAX(C2:C7)-MIN(C2:C7)"), success: L("极差为 5565。", "The spread is 5565.", "差は5565です。"), formula: "=MAX(C2:C7)-MIN(C2:C7)", requiredFunctions: ["MAX", "MIN"] }),
          ],
          hint: L("求单价的平均不要误选数量列。", "Do not average the quantity column when the task asks for unit price.", "単価平均では数量列を選ばないようにします。"),
        }),
        practice({
          id: "aggregate-check-mixed",
          title: L("周报前的最后抽查", "Final spot check before the weekly report", "週報前の最終確認"),
          lead: L("这一组会把两个工作簿的统计方式混在一起。先读任务对象，再写公式。", "This set mixes statistics from both workbooks. Identify the object before writing the formula.", "2つの表の集計が混ざります。対象を確認してから数式を書きます。"),
          sheet: sales,
          tasks: [
            task({ id: "agg-mixed-1", sheet: sales, target: "C25", taskLabel: L("数字记录", "Numeric records", "数値件数"), title: L("销售表全部数字单元格数", "All numeric cells in the sales sheet", "営業表の全数値セル数"), lead: L("在 C25 用 COUNT 统计 C2:E9。", "In C25, use COUNT on C2:E9.", "C25 で COUNT を使い C2:E9 を数えます。"), hint: L("参考：=COUNT(C2:E9)", "Reference: =COUNT(C2:E9)", "参考：=COUNT(C2:E9)"), success: L("共 24 个数字。", "There are 24 numbers.", "24個の数値があります。"), formula: "=COUNT(C2:E9)", requiredFunctions: ["COUNT"] }),
            task({ id: "agg-mixed-2", sheet: sales, target: "C26", taskLabel: L("平均取整", "Rounded average", "平均丸め"), title: L("销售表总体平均保留整数", "Overall sales average to integer", "営業表全体平均を整数に"), lead: L("在 C26 对 C2:E9 求平均，再取整。", "In C26, average C2:E9 and round.", "C26 で C2:E9 の平均を求め、丸めます。"), hint: L("参考：=ROUND(AVERAGE(C2:E9),0)", "Reference: =ROUND(AVERAGE(C2:E9),0)", "参考：=ROUND(AVERAGE(C2:E9),0)"), success: L("平均值约 986.7，取整为 987。", "The average is about 986.7 and rounds to 987.", "平均約986.7、四捨五入で987です。"), formula: "=ROUND(AVERAGE(C2:E9),0)", requiredFunctions: ["ROUND", "AVERAGE"] }),
            task({ id: "agg-mixed-3", sheet: sales, target: "C27", taskLabel: L("最大合计", "Maximum total", "最大合計"), title: L("最高单月合计的取整", "Round the highest monthly total", "最高月合計を丸める"), lead: L("在 C27 用 MAX 找 C10:E10 最大值，再用 ROUND 取整。", "In C27, find the max of C10:E10 and round it.", "C27 で C10:E10 の最大値を求め、ROUND します。"), hint: L("参考：=ROUND(MAX(C10:E10),0)", "Reference: =ROUND(MAX(C10:E10),0)", "参考：=ROUND(MAX(C10:E10),0)"), success: L("最高月合计保持 8020。", "The top monthly total stays at 8020.", "最高月合計は8020です。"), formula: "=ROUND(MAX(C10:E10),0)", requiredFunctions: ["ROUND", "MAX"] }),
            task({ id: "agg-mixed-4", sheet: sales, target: "C28", taskLabel: L("最低与平均", "Minimum and average", "最小と平均"), title: L("一月平均值减最低值", "January average minus minimum", "1月平均から最小を引く"), lead: L("在 C28 用一月平均减去一月最低值。", "In C28, subtract the January minimum from the January average.", "C28 で1月平均から最小値を引きます。"), hint: L("参考：=AVERAGE(C2:C9)-MIN(C2:C9)", "Reference: =AVERAGE(C2:C9)-MIN(C2:C9)", "参考：=AVERAGE(C2:C9)-MIN(C2:C9)"), success: L("差距约 582.5。", "The gap is about 582.5.", "差は約582.5です。"), formula: "=AVERAGE(C2:C9)-MIN(C2:C9)", requiredFunctions: ["AVERAGE", "MIN"] }),
          ],
          hint: L("把“平均值减最小值”按字面顺序转成公式。", "Translate the sentence order directly into the formula.", "文の順序をそのまま数式にします。"),
        }),
      ], { xp: 45 }),
    ],
  });

  D.registerChapter({
    id: "ch03-logic",
    icon: "03",
    title: L("第 3 章 · 让公式替你判断", "Chapter 3 · Let Formulas Decide", "第3章 · 数式に判断させる"),
    subtitle: L("从单条件判断到多条件、嵌套和错误兜底，把“看不完的表”变成会自己标记的工作表。", "Move from one-condition tests to multiple conditions, nested logic, and error handling, turning long tables into self-marking sheets.", "単条件から複数条件、入れ子、エラー処理へ進み、長い表を自動判定する表に変えます。"),
    levels: [
      level("logic-if", "lesson", L("IF：给每条记录一个结论", "IF: Give Every Row a Conclusion", "IF：各行に結論を付ける"), [
        learn(
          "brief-if",
          L("下班前要标出达标名单", "Mark the attainment list before leaving", "退勤前に達成者へチェックを付ける"),
          L("主管不想再看一列小数，只想要“达标 / 跟进”。IF 会先判断条件，再返回两个结果中的一个。", "Your manager does not want decimals; they want Met or Follow up. IF tests a condition and returns one of two results.", "上司は小数ではなく「達成／フォロー」を見たいと考えています。IF は条件を判定し、2つの結果から返します。"),
          [
            L("IF 的顺序：条件、条件成立时的结果、不成立时的结果", "IF order: test, value when true, value when false", "IF の順序：条件、真の結果、偽の結果"),
            L("文字结果要放在英文双引号里", "Put text results inside double quotes", "文字結果は二重引用符で囲みます"),
            L("比较运算用 >=、<=、<>，等号要写在比较里", "Use >=, <=, and <> for comparisons", "比較には >=、<=、<> を使います"),
            L("条件先写清，再想两个分支的结果", "Write the test first, then the two outcomes", "先に条件、次に2つの結果を考えます"),
          ],
          L("看预览结果时，既检查 TRUE 分支，也想一想 FALSE 分支。", "When checking the preview, verify both the true and false branches.", "プレビューでは真と偽の両方の結果を確認します。"),
          '=IF(G2>=0.9,"达标","跟进")'
        ),
        builder({
          id: "build-if-attainment",
          sheet: sales,
          formula: L('=IF(G2>=0.9,"达标","跟进")', '=IF(G2>=0.9,"Met","Follow up")', '=IF(G2>=0.9,"達成","フォロー")'),
          title: L("填出达标判断", "Fill in the attainment test", "達成判定を穴埋めする", "填入達標判定"),
          lead: L("主管不想逐行看 0.895 这类小数，而要一眼看出“达标”或“跟进”。G2 是完成率，门槛是 0.9；IF 会检查条件，条件成立返回第一个文字，不成立返回第二个文字。先填函数和判断依据，文字结果已经保留在公式里。", "Your manager does not want to scan decimals such as 0.895; they need a clear Met or Follow up. G2 is the attainment rate and the threshold is 0.9. IF tests the condition and returns the first text when true, the second when false. Fill in the function and test value; the text outcomes are already shown.", "上司は 0.895 のような小数を追うのではなく、「達成」か「フォロー」を一目で見たいのです。G2 は達成率、基準は 0.9 です。IF が条件を判定し、真なら1つ目、偽なら2つ目の文字を返します。関数と判定値を埋め、文字結果は用意されたものを使います。", "主管不想逐列看 0.895 這類小數，而要一眼看出「達標」或「跟進」。G2 是達成率，門檻是 0.9；IF 會檢查條件，成立時傳回第一個文字，不成立時傳回第二個文字。先填函數和判斷依據，文字結果已保留在公式裡。"),
          hint: L("判断候选：G2 与 0.9 比较，符号是 >=。不要把它写成文本，也不要把两个返回结果互换；先确认哪个分支代表达标。", "The test compares G2 with 0.9 using >=. Do not put the comparison in quotes, and do not swap the two outcomes; first decide which branch means meeting target.", "判定は G2 と 0.9 を >= で比較します。比較を引用符に入れず、2つの結果も入れ替えません。どちらが達成かを先に確認します。", "判斷候選：G2 與 0.9 比較，符號是 >=。不要把它寫成文字，也不要把兩個傳回結果互換；先確認哪個分支代表達標。"),
          success: L("G2 为 0.895，低于 0.9，所以返回“跟进”。公式把难以扫读的小数转换成了业务结论。", "G2 is 0.895, below 0.9, so the result is Follow up. The formula turns a hard-to-scan decimal into a business conclusion.", "G2 は 0.895 で 0.9 未満のため「フォロー」になります。読みにくい小数を業務上の結論に変えられました。", "G2 為 0.895，低於 0.9，所以傳回「跟進」。公式把難以掃讀的小數轉換成業務結論。"),
          fillBlanks: [1, 3, 5],
        }),
        practice({
          id: "drill-if-basic",
          title: L("完成率、迟到和绩效轮换判断", "Attainment, lateness, and performance tests", "達成率・遅刻・評価の判定"),
          lead: L("题目会在销售表和工资表之间切换。先找条件列，再确定两个返回结果。", "Tasks switch between sales and payroll. Identify the condition column, then the two outcomes.", "営業表と給与表が切り替わります。条件列と2つの結果を確認します。"),
          sheet: sales,
          tasks: [
            task({ id: "if-sales-1", sheet: sales, target: "I2", taskLabel: L("达标判断", "Attainment test", "達成判定"), title: L("林晓是否达到 90%", "Is Lin at or above 90%?", "林さんは90%以上？"), lead: L("在 I2 用 IF 判断 G2 是否大于等于 0.9，返回“达标”或“跟进”。", "In I2, test whether G2 is at least 0.9 and return Met or Follow up.", "I2 で G2 が0.9以上かを判定し、「達成」か「フォロー」を返します。"), hint: L('参考：=IF(G2>=0.9,"达标","跟进")', 'Reference: =IF(G2>=0.9,"Met","Follow up")', '参考：=IF(G2>=0.9,"達成","フォロー")'), success: L("林晓返回“跟进”。", "Lin returns Follow up.", "林さんは「フォロー」です。"), formula: '=IF(G2>=0.9,"达标","跟进")', requiredFunctions: ["IF"] }),
            task({ id: "if-sales-2", sheet: sales, target: "I3", taskLabel: L("达标判断", "Attainment test", "達成判定"), title: L("陈凯是否达到目标", "Did Chen reach target?", "陳さんは目標達成？"), lead: L("在 I3 判断 G3 是否达到 0.9。", "In I3, test whether G3 reaches 0.9.", "I3 で G3 が0.9以上かを判定します。"), hint: L('参考：=IF(G3>=0.9,"达标","跟进")', 'Reference: =IF(G3>=0.9,"Met","Follow up")', '参考：=IF(G3>=0.9,"達成","フォロー")'), success: L("陈凯返回“跟进”。", "Chen returns Follow up.", "陳さんは「フォロー」です。"), formula: '=IF(G3>=0.9,"达标","跟进")', requiredFunctions: ["IF"] }),
            task({ id: "if-sales-3", sheet: sales, target: "I4", taskLabel: L("优秀判断", "Excellence test", "優秀判定"), title: L("周宁是否超过目标", "Did Zhou exceed target?", "周さんは目標超過？"), lead: L("在 I4 判断 G4 是否大于 1，返回“优秀”或“正常”。", "In I4, test whether G4 is above 1 and return Excellent or Normal.", "I4 で G4 が1を超えるか判定し、「優秀」か「通常」を返します。"), hint: L('参考：=IF(G4>1,"优秀","正常")', 'Reference: =IF(G4>1,"Excellent","Normal")', '参考：=IF(G4>1,"優秀","通常")'), success: L("周宁返回“正常”。", "Zhou returns Normal.", "周さんは「通常」です。"), formula: '=IF(G4>1,"优秀","正常")', requiredFunctions: ["IF"] }),
            task({ id: "if-payroll-1", sheet: payroll, target: "H2", taskLabel: L("迟到判断", "Lateness test", "遅刻判定"), title: L("林晓是否需要复核", "Does Lin need review?", "林さんは確認が必要？"), lead: L("在 H2 判断 E2 是否大于等于 2，返回“复核”或“正常”。", "In H2, test whether E2 is at least 2 and return Review or Normal.", "H2 で E2 が2以上かを判定し、「確認」か「通常」を返します。"), hint: L('参考：=IF(E2>=2,"复核","正常")', 'Reference: =IF(E2>=2,"Review","Normal")', '参考：=IF(E2>=2,"確認","通常")'), success: L("迟到 1 次，返回“正常”。", "One late arrival returns Normal.", "遅刻1回なので「通常」です。"), formula: '=IF(E2>=2,"复核","正常")', requiredFunctions: ["IF"] }),
            task({ id: "if-payroll-2", sheet: payroll, target: "H3", taskLabel: L("全勤判断", "Full attendance test", "皆勤判定"), title: L("陈凯是否全勤", "Is Chen fully present?", "陳さんは皆勤？"), lead: L("在 H3 判断 C3 是否大于等于 21，返回“全勤”或“注意”。", "In H3, test whether C3 is at least 21 and return Full attendance or Check.", "H3 で C3 が21以上かを判定し、「皆勤」か「注意」を返します。"), hint: L('参考：=IF(C3>=21,"全勤","注意")', 'Reference: =IF(C3>=21,"Full","Check")', '参考：=IF(C3>=21,"皆勤","注意")'), success: L("陈凯出勤 20 天，返回“注意”。", "Chen worked 20 days and returns Check.", "陳さんは20日で「注意」です。"), formula: '=IF(C3>=21,"全勤","注意")', requiredFunctions: ["IF"] }),
          ],
          hint: L("IF 里的文字结果必须加双引号。", "Text results inside IF need double quotes.", "IF 内の文字結果は二重引用符が必要です。"),
        }),
        practice({
          id: "drill-if-transfer",
          title: L("把 IF 接在 SUM 和比率后面", "Attach IF to SUM and ratios", "SUM と比率に IF を組み合わせる"), sheet: sales,
          lead: L("先算季度合计和完成率，再用 IF 给出结论。这里开始把第 1、2 章的计算带进判断。", "Calculate the quarter and attainment first, then use IF for the conclusion. This brings Chapter 1 and 2 calculations into the decision.", "まず四半期合計と達成率を求め、IF で結論を出します。第1・2章の計算を判断につなげます。"),
          tasks: [
            task({ id: "if-transfer-1", sheet: sales, target: "I5", taskLabel: L("合计后判断", "Decide after total", "合計後に判定"), title: L("赵敏的季度合计是否达 2000", "Is Zhao's quarter at least 2000?", "趙さんの四半期は2000以上？"), lead: L("在 I5 先用 SUM 汇总 C5:E5，再用 IF 判断是否大于等于 2000。", "In I5, SUM C5:E5, then test whether it is at least 2000.", "I5 で C5:E5 を SUM し、2000以上かを判定します。"), hint: L('参考：=IF(SUM(C5:E5)>=2000,"达标","跟进")', 'Reference: =IF(SUM(C5:E5)>=2000,"Met","Follow up")', '参考：=IF(SUM(C5:E5)>=2000,"達成","フォロー")'), success: L("赵敏合计 1290，返回“跟进”。", "Zhao totals 1290 and returns Follow up.", "趙さんは1290で「フォロー」です。"), formula: '=IF(SUM(C5:E5)>=2000,"达标","跟进")', requiredFunctions: ["IF", "SUM"] }),
            task({ id: "if-transfer-2", sheet: sales, target: "I6", taskLabel: L("比率判断", "Ratio test", "比率判定"), title: L("王磊完成率是否达到目标", "Did Wang reach the target rate?", "王さんの達成率は目標以上？"), lead: L("在 I6 判断 G6 是否达到 0.9。", "In I6, test whether G6 reaches 0.9.", "I6 で G6 が0.9以上かを判定します。"), hint: L('参考：=IF(G6>=0.9,"达标","跟进")', 'Reference: =IF(G6>=0.9,"Met","Follow up")', '参考：=IF(G6>=0.9,"達成","フォロー")'), success: L("王磊返回“跟进”。", "Wang returns Follow up.", "王さんは「フォロー」です。"), formula: '=IF(G6>=0.9,"达标","跟进")', requiredFunctions: ["IF"] }),
            task({ id: "if-transfer-3", sheet: sales, target: "I7", taskLabel: L("总额判断", "Total test", "合計判定"), title: L("孙悦是否超过 4000", "Is Sun above 4000?", "孫さんは4000超？"), lead: L("在 I7 用 SUM 计算 C7:E7，再判断是否大于 4000。", "In I7, SUM C7:E7 and test whether it is above 4000.", "I7 で C7:E7 を SUM し、4000超かを判定します。"), hint: L('参考：=IF(SUM(C7:E7)>4000,"达标","跟进")', 'Reference: =IF(SUM(C7:E7)>4000,"Met","Follow up")', '参考：=IF(SUM(C7:E7)>4000,"達成","フォロー")'), success: L("孙悦合计 4020，返回“达标”。", "Sun totals 4020 and returns Met.", "孫さんは4020で「達成」です。"), formula: '=IF(SUM(C7:E7)>4000,"达标","跟进")', requiredFunctions: ["IF", "SUM"] }),
            task({ id: "if-transfer-4", sheet: payroll, target: "H4", taskLabel: L("工资档位", "Pay tier", "給与区分"), title: L("周宁的实发工资是否高于 8000", "Is Zhou's net pay above 8000?", "周さんの支給額は8000超？"), lead: L("在 H4 先算 C4*D4*F4-E4*50，再用 IF 返回“高”或“一般”。", "In H4, calculate C4*D4*F4-E4*50, then return High or Regular.", "H4 で C4*D4*F4-E4*50 を計算し、「高」か「一般」を返します。"), hint: L('参考：=IF(C4*D4*F4-E4*50>8000,"高","一般")', 'Reference: =IF(C4*D4*F4-E4*50>8000,"High","Regular")', '参考：=IF(C4*D4*F4-E4*50>8000,"高","一般")'), success: L("周宁实发 9404，返回“高”。", "Zhou's pay is 9404 and returns High.", "周さんは9404で「高」です。"), formula: '=IF(C4*D4*F4-E4*50>8000,"高","一般")', requiredFunctions: ["IF"] }),
          ],
          hint: L("IF 里面可以先放一个完整的计算式。", "A complete calculation can sit inside IF.", "IF の中に完全な計算式を置けます。"),
        }),
      ], { xp: 35 }),

      level("logic-guard", "lesson", L("多条件与兜底：让判断更稳", "Multiple Conditions and Safe Fallbacks", "複数条件とエラー処理"), [
        learn(
          "brief-logic-guard",
          L("一张表里总会有例外", "Every table has exceptions", "表には必ず例外がある"),
          L("“全勤”需要出勤够且没有迟到；“优秀”可能分 A/B/C；除以零时又不能把表格弄坏。今天学会 AND、OR、嵌套 IF 和 IFERROR。", "Full attendance needs enough days and no lateness; excellence may have tiers; division by zero must not break the sheet. Learn AND, OR, nested IF, and IFERROR.", "皆勤は出勤日数と遅刻なしの両方、優秀は段階分け、ゼロ除算は表を壊さないようにします。AND、OR、入れ子 IF、IFERROR を学びます。"),
          [
            L("AND 要求所有条件都成立；OR 只要一个成立", "AND requires every test; OR needs only one", "AND はすべて成立、OR は1つ成立"),
            L("IF 的结果位置还可以再放一个 IF，形成分层判断", "A nested IF can sit inside either result branch", "IF の結果位置に別の IF を置けます"),
            L("IFERROR(计算, 出错时结果) 能兜住找不到、除以零等错误", "IFERROR(calculation, fallback) catches lookup and divide errors", "IFERROR(計算, 代替結果) でエラーを処理します"),
            L("条件太复杂时先拆成两列，再合并", "If tests get complex, calculate helper columns first", "複雑なら補助列に分けてから統合します"),
          ],
          L("IFERROR 不是掩盖错误，而是给业务一个可读的兜底。", "IFERROR is not hiding errors; it gives the business a readable fallback.", "IFERROR はエラー隠しではなく、業務向けの代替結果です。"),
          '=IF(AND(C2>=21,E2=0),"全勤","关注")'
        ),
        builder({
          id: "build-and-attendance",
          sheet: payroll,
          formula: L('=IF(AND(C2>=21,E2=0),"全勤","关注")', '=IF(AND(C2>=21,E2=0),"Full","Check")', '=IF(AND(C2>=21,E2=0),"皆勤","注意")'),
          title: L("填出全勤判断", "Fill in the full-attendance test", "皆勤判定を穴埋めする", "填入全勤判定"),
          lead: L("全勤不是只看天数，也不是只看迟到：出勤天数至少 21，而且迟到次数必须为 0。AND 把两个条件绑在一起，只有两边都成立，外层 IF 才会返回“全勤”。先填主函数和两个判断依据，注意引用 C2 与 E2。", "Full attendance requires two things at once: at least 21 days worked and exactly zero late arrivals. AND combines both tests, and the outer IF returns Full only when both pass. Fill in the main function and the two cell references, using C2 and E2.", "皆勤は勤務日数だけでも遅刻だけでも判断できません。21日以上かつ遅刻0回の両方が必要です。AND で2条件をまとめ、外側の IF が両方成立したときだけ「皆勤」を返します。主関数と2つの参照 C2・E2 を埋めます。", "全勤不能只看天數，也不能只看遲到：出勤天數至少 21，而且遲到次數必須為 0。AND 把兩個條件綁在一起，只有兩邊都成立，外層 IF 才會傳回「全勤」。先填主要函數和兩個判斷依據，注意參照 C2 與 E2。"),
          hint: L("结构是 IF(AND(条件一,条件二),真结果,假结果)。AND 已经给出，两个引用仍要填对；条件之间用逗号，不要用中文顿号。", "The structure is IF(AND(test1,test2),true result,false result). AND is already shown, but both references still need to be correct; separate tests with commas, not Chinese punctuation.", "構造は IF(AND(条件1,条件2),真の結果,偽の結果) です。AND は表示されていますが、2つの参照は正しく入れます。条件はカンマで区切ります。", "結構是 IF(AND(條件一,條件二),成立結果,不成立結果)。AND 已經顯示，兩個參照仍要填對；條件之間用逗號，不要用中文頓號。"),
          success: L("林晓出勤 21 天，但迟到 1 次，两个条件没有同时成立，因此返回“关注”。这类判断能直接用于考勤复核。", "Olivia worked 21 days but had one late arrival, so the combined test fails and the result is Check. This is ready for an attendance review.", "佐藤さんは21日勤務ですが遅刻1回のため、両条件は成立せず「注意」になります。勤怠確認にそのまま使える判定です。", "林雅婷出勤 21 天，但遲到 1 次，兩個條件沒有同時成立，因此傳回「關注」。這類判斷可直接用於出勤複核。"),
          fillBlanks: [1, 5, 9],
        }),
        practice({
          id: "drill-logic-multi",
          title: L("多条件判断轮换", "Multiple-condition tests", "複数条件の判定"),
          lead: L("任务会在工资表和销售表之间切换，注意 AND 与 OR 的区别。", "Tasks switch between payroll and sales; watch the difference between AND and OR.", "給与表と営業表を切り替えます。AND と OR の違いに注意します。"),
          sheet: payroll,
          tasks: [
            task({ id: "logic-and-1", sheet: payroll, target: "H2", taskLabel: L("全勤判断", "Full attendance", "皆勤判定"), title: L("林晓是否全勤", "Is Lin fully present?", "林さんは皆勤？"), lead: L("在 H2 判断 C2>=21 且 E2=0，返回“全勤”或“关注”。", "In H2, test C2>=21 and E2=0, then return Full or Check.", "H2 で C2>=21 と E2=0 を判定し、「皆勤」か「注意」を返します。"), hint: L('参考：=IF(AND(C2>=21,E2=0),"全勤","关注")', 'Reference: =IF(AND(C2>=21,E2=0),"Full","Check")', '参考：=IF(AND(C2>=21,E2=0),"皆勤","注意")'), success: L("林晓迟到 1 次，返回“关注”。", "Lin has one late arrival and returns Check.", "林さんは遅刻1回で「注意」です。"), formula: '=IF(AND(C2>=21,E2=0),"全勤","关注")', requiredFunctions: ["IF", "AND"] }),
            task({ id: "logic-or-1", sheet: payroll, target: "H5", taskLabel: L("异常判断", "Exception test", "異常判定"), title: L("赵敏是否需要复核", "Does Zhao need review?", "趙さんは確認が必要？"), lead: L("在 H5 判断出勤少于 20 或迟到大于等于 2，任一成立就返回“复核”。", "In H5, test fewer than 20 days OR at least two late arrivals; return Review if either holds.", "H5 で20日未満または遅刻2回以上を判定し、どちらかなら「確認」を返します。"), hint: L('参考：=IF(OR(C5<20,E5>=2),"复核","正常")', 'Reference: =IF(OR(C5<20,E5>=2),"Review","Normal")', '参考：=IF(OR(C5<20,E5>=2),"確認","通常")'), success: L("赵敏出勤 21 天、迟到 0 次，返回“正常”。", "Zhao has 21 days and no late arrivals, so Normal.", "趙さんは21日・遅刻0で「通常」です。"), formula: '=IF(OR(C5<20,E5>=2),"复核","正常")', requiredFunctions: ["IF", "OR"] }),
            task({ id: "logic-nested-1", sheet: payroll, target: "G2", taskLabel: L("绩效分档", "Performance tier", "評価区分"), title: L("林晓的绩效等级", "Lin's performance tier", "林さんの評価区分"), lead: L("在 G2 按 F2 分档：>=1.2 返回 A，>=1 返回 B，否则 C。", "In G2, tier F2: >=1.2 is A, >=1 is B, otherwise C.", "G2 で F2 を分類：1.2以上はA、1以上はB、それ以外はC。"), hint: L('参考：=IF(F2>=1.2,"A",IF(F2>=1,"B","C"))', 'Reference: =IF(F2>=1.2,"A",IF(F2>=1,"B","C"))', '参考：=IF(F2>=1.2,"A",IF(F2>=1,"B","C"))'), success: L("林晓为 B。", "Lin is B.", "林さんはBです。"), formula: '=IF(F2>=1.2,"A",IF(F2>=1,"B","C"))', requiredFunctions: ["IF"] }),
            task({ id: "logic-error-1", sheet: payroll, target: "H3", taskLabel: L("错误兜底", "Error fallback", "エラー処理"), title: L("迟到次数为零时的提醒", "Handle a zero-late case", "遅刻0回の表示"), lead: L("在 H3 计算 D3/E3，若出错返回“无需扣款”。陈凯的迟到次数为 0，正好会触发除零错误。", "In H3, calculate D3/E3 and return No deduction if it errors. Chen has zero late arrivals, so the division triggers the error path.", "H3 で D3/E3 を計算し、エラーなら「控除なし」を返します。陳さんは遅刻0回なので、ゼロ除算が発生します。"), hint: L('参考：=IFERROR(D3/E3,"无需扣款")', 'Reference: =IFERROR(D3/E3,"No deduction")', '参考：=IFERROR(D3/E3,"控除なし")'), success: L("陈凯迟到为 0，IFERROR 接住错误并返回“无需扣款”。", "Chen has zero late arrivals, and IFERROR catches the error and returns No deduction.", "陳さんは遅刻0で、IFERROR がエラーを処理し「控除なし」を返します。"), formula: '=IFERROR(D3/E3,"无需扣款")', requiredFunctions: ["IFERROR"] }),
          ],
          hint: L("AND/OR 放在 IF 的条件位置，里面仍用逗号分隔条件。", "AND/OR go in IF's test position and separate tests with commas.", "AND/OR は IF の条件位置で、条件をカンマ区切ります。"),
        }),
        practice({
          id: "drill-logic-guard-transfer",
          title: L("把判断接在汇总和平均之后", "Attach decisions to totals and averages", "合計・平均に判断を付ける"), sheet: sales,
          lead: L("先完成第 1、2 章的统计，再做第 3 章的判断；最后加上出错兜底。", "Finish the Chapter 1 and 2 calculation, add the Chapter 3 decision, and guard errors.", "第1・2章の集計、第3章の判断、エラー処理の順に組み合わせます。"),
          tasks: [
            task({ id: "logic-transfer-1", sheet: sales, target: "I8", taskLabel: L("合计与达标", "Total and attainment", "合計と達成"), title: L("李然的季度是否达标", "Did Li hit the quarter target?", "李さんの四半期は達成？"), lead: L("在 I8 用 SUM 汇总 C8:E8，再和 F8 比较，返回“达标”或“跟进”。", "In I8, SUM C8:E8, compare with F8, and return Met or Follow up.", "I8 で C8:E8 を SUM し、F8 と比較して「達成」か「フォロー」を返します。"), hint: L('参考：=IF(SUM(C8:E8)>=F8,"达标","跟进")', 'Reference: =IF(SUM(C8:E8)>=F8,"Met","Follow up")', '参考：=IF(SUM(C8:E8)>=F8,"達成","フォロー")'), success: L("李然合计 3270，低于目标。", "Li totals 3270, below target.", "李さんは3270で目標未達です。"), formula: '=IF(SUM(C8:E8)>=F8,"达标","跟进")', requiredFunctions: ["IF", "SUM"] }),
            task({ id: "logic-transfer-2", sheet: sales, target: "I9", taskLabel: L("比率兜底", "Ratio fallback", "比率のエラー処理"), title: L("郑文的完成率是否可计算", "Can Zheng's attainment be calculated?", "鄭さんの達成率は計算可能？"), lead: L("在 I9 用 IFERROR 包住 SUM(C9:E9)/F9，出错时返回“目标缺失”。", "In I9, wrap SUM(C9:E9)/F9 in IFERROR and return Missing target on error.", "I9 で SUM(C9:E9)/F9 を IFERROR で包み、エラー時に「目標なし」を返します。"), hint: L('参考：=IFERROR(SUM(C9:E9)/F9,"目标缺失")', 'Reference: =IFERROR(SUM(C9:E9)/F9,"Missing target")', '参考：=IFERROR(SUM(C9:E9)/F9,"目標なし")'), success: L("目标存在，返回约 0.896。", "The target exists and returns about 0.896.", "目標があり、約0.896です。"), formula: '=IFERROR(SUM(C9:E9)/F9,"目标缺失")', requiredFunctions: ["IFERROR", "SUM"] }),
            task({ id: "logic-transfer-3", sheet: sales, target: "I10", taskLabel: L("平均兜底", "Average fallback", "平均のエラー処理"), title: L("没有数字时不要报错", "Do not break when no numbers exist", "数値がない場合も壊さない"), lead: L("在 I10 用 IFERROR 包住 AVERAGE(C2:C9)，出错返回 0。", "In I10, wrap AVERAGE(C2:C9) in IFERROR and return zero on error.", "I10 で AVERAGE(C2:C9) を IFERROR で包み、エラー時に0を返します。"), hint: L("参考：=IFERROR(AVERAGE(C2:C9),0)", "Reference: =IFERROR(AVERAGE(C2:C9),0)", "参考：=IFERROR(AVERAGE(C2:C9),0)"), success: L("有数据时正常返回平均值。", "With data present, the average is returned normally.", "データがあれば平均を返します。"), formula: "=IFERROR(AVERAGE(C2:C9),0)", requiredFunctions: ["IFERROR", "AVERAGE"] }),
            task({ id: "logic-transfer-4", sheet: sales, target: "I11", taskLabel: L("零除保护", "Zero-division guard", "ゼロ除算対策"), title: L("最大与最小比值的兜底", "Guard the max-to-min ratio", "最大最小比のエラー処理"), lead: L("在 I11 用 IFERROR 包住 MAX(C2:C9)/MIN(C2:C9)，出错返回“异常”。", "In I11, wrap MAX(C2:C9)/MIN(C2:C9) in IFERROR and return Abnormal on error.", "I11 で MAX(C2:C9)/MIN(C2:C9) を IFERROR で包み、エラー時に「異常」を返します。"), hint: L('参考：=IFERROR(MAX(C2:C9)/MIN(C2:C9),"异常")', 'Reference: =IFERROR(MAX(C2:C9)/MIN(C2:C9),"Abnormal")', '参考：=IFERROR(MAX(C2:C9)/MIN(C2:C9),"異常")'), success: L("比值约 3.76，没有被错误打断。", "The ratio is about 3.76 and no error interrupts the report.", "比率は約3.76で、エラーに中断されません。"), formula: '=IFERROR(MAX(C2:C9)/MIN(C2:C9),"异常")', requiredFunctions: ["IFERROR", "MAX", "MIN"] }),
          ],
          hint: L("计算和判断可以层层嵌套，但先保证每一小步正确。", "Calculations and decisions can nest, but keep each small step correct.", "計算と判断は入れ子にできますが、各段階を正しくします。"),
        }),
      ], { xp: 40 }),

      level("logic-check", "review", L("考勤与销售异常复核", "Attendance and Sales Exception Review", "勤怠・営業例外の確認"), [
        learn(
          "brief-logic-check",
          L("把异常先圈出来", "Circle the exceptions first", "まず例外を見つける"),
          L("今天没有新语法，只有更接近真实工作的混合任务：先判断异常，再做统计，最后给出业务结论。", "No new syntax today: mixed office tasks ask you to flag exceptions, calculate statistics, and give a business conclusion.", "新しい構文はありません。例外の抽出、集計、業務判断を混ぜた実務タスクです。"),
          [
            L("先找硬条件，再用 IF 标记", "Find hard conditions first, then mark with IF", "まず明確な条件を探し、IF で印を付けます"),
            L("多条件用 AND/OR，并确认条件不会互相矛盾", "Use AND/OR and check the tests do not contradict", "AND/OR の条件が矛盾しないか確認します"),
            L("错误分支要写得像业务语言，而不是留空", "Make fallback text business-readable instead of blank", "代替結果は業務で読める表現にします"),
            L("判断列完成后，再汇总判断结果", "Total or count the judgment column after it is complete", "判定列を作ってから集計します"),
          ],
          L("遇到“先标记再汇总”，就把两个函数串起来。", "When a task says mark first and total later, chain the two functions.", "「印を付けて集計」は関数を組み合わせます。"),
          '=IF(AND(C2>=21,E2=0),"全勤","关注")'
        ),
        practice({
          id: "logic-check-attendance",
          title: L("工资表异常筛选", "Payroll exception screening", "給与表の例外確認"),
          lead: L("随机任务会要求全勤、迟到复核、绩效等级和工资判断。", "Random tasks ask for full attendance, late-arrival review, performance tiers, and pay decisions.", "皆勤、遅刻確認、評価区分、給与判定がランダムに出ます。"),
          sheet: attendance,
          tasks: [
            task({ id: "logic-check-a1", sheet: attendance, target: "I2", taskLabel: L("复核标记", "Review flag", "確認フラグ"), title: L("林晓是否需要工资复核", "Does Lin need payroll review?", "林さんの給与確認は必要？"), lead: L("在 I2 判断迟到次数 E2 是否大于等于 2，返回“复核”或“正常”。", "In I2, test whether E2 is at least 2 and return Review or Normal.", "I2 で E2 が2以上かを判定し、「確認」か「通常」を返します。"), hint: L('参考：=IF(E2>=2,"复核","正常")', 'Reference: =IF(E2>=2,"Review","Normal")', '参考：=IF(E2>=2,"確認","通常")'), success: L("林晓返回“正常”。", "Lin returns Normal.", "林さんは「通常」です。"), formula: '=IF(E2>=2,"复核","正常")', requiredFunctions: ["IF"] }),
            task({ id: "logic-check-a2", sheet: attendance, target: "I3", taskLabel: L("全勤与复核", "Full attendance and review", "皆勤と確認"), title: L("陈凯的异常标记", "Chen's exception flag", "陳さんの例外フラグ"), lead: L("在 I3 判断 E3>=2 或 C3<20，任一成立返回“复核”，否则“正常”。", "In I3, test E3>=2 OR C3<20; return Review if either holds, else Normal.", "I3 で E3>=2 または C3<20 を判定し、「確認」か「通常」を返します。"), hint: L('参考：=IF(OR(E3>=2,C3<20),"复核","正常")', 'Reference: =IF(OR(E3>=2,C3<20),"Review","Normal")', '参考：=IF(OR(E3>=2,C3<20),"確認","通常")'), success: L("陈凯出勤 20 天、迟到 0 次，返回“正常”。", "Chen worked 20 days with no late arrivals and returns Normal.", "陳さんは勤務20日・遅刻0回で「通常」です。"), formula: '=IF(OR(E3>=2,C3<20),"复核","正常")', requiredFunctions: ["IF", "OR"] }),
            task({ id: "logic-check-a3", sheet: attendance, target: "I4", taskLabel: L("绩效等级", "Performance tier", "評価区分"), title: L("周宁的绩效等级", "Zhou's performance tier", "周さんの評価区分"), lead: L("在 I4 按 F4 分档：>=1.2 为 A，>=1 为 B，其余为 C。", "In I4, tier F4: >=1.2 is A, >=1 is B, otherwise C.", "I4 で F4 を分類：1.2以上A、1以上B、それ以外C。"), hint: L('参考：=IF(F4>=1.2,"A",IF(F4>=1,"B","C"))', 'Reference: =IF(F4>=1.2,"A",IF(F4>=1,"B","C"))', '参考：=IF(F4>=1.2,"A",IF(F4>=1,"B","C"))'), success: L("周宁的绩效系数为 1.20，返回 A。", "Zhou's performance factor is 1.20 and returns A.", "周さんの評価係数は1.20でAです。"), formula: '=IF(F4>=1.2,"A",IF(F4>=1,"B","C"))', requiredFunctions: ["IF"] }),
            task({ id: "logic-check-a4", sheet: attendance, target: "I5", taskLabel: L("工资兜底", "Pay fallback", "給与のエラー処理"), title: L("王磊的实发工资校验", "Check Wang's net pay", "王さんの支給額確認"), lead: L("在 I6 用 IFERROR 包住 G6/E6，避免迟到次数为 0 时产生除零错误。", "In I6, wrap G6/E6 in IFERROR to avoid a divide-by-zero error when late arrivals are zero.", "I6 で G6/E6 を IFERROR で包み、遅刻0回でもゼロ除算にならないようにします。"), hint: L('参考：=IFERROR(G6/E6,0)', 'Reference: =IFERROR(G6/E6,0)', '参考：=IFERROR(G6/E6,0)'), success: L("王磊的实发工资是 9472。", "Wang's net pay is 9472.", "王さんの支給額は9472です。"), formula: "=IFERROR(G6/E6,0)", requiredFunctions: ["IFERROR"] }),
          ],
          hint: L("工资判断题先确认是把整条工资公式放进去，还是只判断已有结果。", "Decide whether to embed the full pay formula or judge an existing result.", "給与式全体を入れるか、既存結果を判定するかを決めます。"),
        }),
        practice({
          id: "logic-check-sales",
          title: L("销售异常与团队结论", "Sales exceptions and team conclusions", "営業例外とチーム結論"),
          lead: L("销售表任务会把达标、平均和错误兜底串起来，先看题目要结论还是数值。", "Sales tasks chain attainment, averages, and error handling. Check whether the task asks for a label or a number.", "営業表では達成、平均、エラー処理を組み合わせます。文字か数値かを確認します。"),
          sheet: sales,
          tasks: [
            task({ id: "logic-check-s1", sheet: sales, target: "I12", taskLabel: L("团队判断", "Team decision", "チーム判定"), title: L("团队平均完成率是否达到 90%", "Is the team average attainment at least 90%?", "チーム平均達成率は90%以上？"), lead: L("在 I12 用 IF 判断 AVERAGE(G2:G9) 是否大于等于 0.9，返回“达标”或“跟进”。", "In I12, test whether AVERAGE(G2:G9) is at least 0.9 and return Met or Follow up.", "I12 で AVERAGE(G2:G9) が0.9以上かを判定します。"), hint: L('参考：=IF(AVERAGE(G2:G9)>=0.9,"达标","跟进")', 'Reference: =IF(AVERAGE(G2:G9)>=0.9,"Met","Follow up")', '参考：=IF(AVERAGE(G2:G9)>=0.9,"達成","フォロー")'), success: L("平均约 0.88，返回“跟进”。", "The average is about 0.88 and returns Follow up.", "平均約0.88で「フォロー」です。"), formula: '=IF(AVERAGE(G2:G9)>=0.9,"达标","跟进")', requiredFunctions: ["IF", "AVERAGE"] }),
            task({ id: "logic-check-s2", sheet: sales, target: "I13", taskLabel: L("零除保护", "Zero guard", "ゼロ除算対策"), title: L("季度总额与目标的比值", "Quarter total over target", "四半期合計と目標の比"), lead: L("在 I13 用 IFERROR 包住 SUM(C2:E9)/SUM(F2:F9)，出错返回“无目标”。", "In I13, wrap SUM(C2:E9)/SUM(F2:F9) in IFERROR and return No target on error.", "I13 で SUM(C2:E9)/SUM(F2:F9) を IFERROR で包み、「目標なし」を返します。"), hint: L('参考：=IFERROR(SUM(C2:E9)/SUM(F2:F9),"无目标")', 'Reference: =IFERROR(SUM(C2:E9)/SUM(F2:F9),"No target")', '参考：=IFERROR(SUM(C2:E9)/SUM(F2:F9),"目標なし")'), success: L("返回值约 0.8936。", "It returns about 0.8936.", "約0.8936を返します。"), formula: '=IFERROR(SUM(C2:E9)/SUM(F2:F9),"无目标")', requiredFunctions: ["IFERROR", "SUM"] }),
            task({ id: "logic-check-s3", sheet: sales, target: "I14", taskLabel: L("双条件", "Two conditions", "2条件"), title: L("孙悦是否既达标又超过均值", "Is Sun both on target and above average?", "孫さんは達成かつ平均超？"), lead: L("在 I14 判断 G7>=0.9 且 SUM(C7:E7)>AVERAGE(C2:E9)，返回“重点”或“观察”。", "In I14, test G7>=0.9 AND SUM(C7:E7)>AVERAGE(C2:E9), returning Focus or Watch.", "I14 で G7>=0.9 かつ SUM(C7:E7)>AVERAGE(C2:E9) を判定します。"), hint: L('参考：=IF(AND(G7>=0.9,SUM(C7:E7)>AVERAGE(C2:E9)),"重点","观察")', 'Reference: =IF(AND(G7>=0.9,SUM(C7:E7)>AVERAGE(C2:E9)),"Focus","Watch")', '参考：=IF(AND(G7>=0.9,SUM(C7:E7)>AVERAGE(C2:E9)),"重点","観察")'), success: L("孙悦返回“重点”。", "Sun returns Focus.", "孫さんは「重点」です。"), formula: '=IF(AND(G7>=0.9,SUM(C7:E7)>AVERAGE(C2:E9)),"重点","观察")', requiredFunctions: ["IF", "AND", "SUM", "AVERAGE"] }),
            task({ id: "logic-check-s4", sheet: sales, target: "I15", taskLabel: L("错误提示", "Error message", "エラー表示"), title: L("最低值比值的兜底", "Guard the minimum ratio", "最小値比のエラー処理"), lead: L("在 I15 用 IFERROR 包住 MIN(C2:C9)/MAX(C2:C9)，出错返回“复核”。", "In I15, wrap MIN(C2:C9)/MAX(C2:C9) in IFERROR and return Review on error.", "I15 で MIN(C2:C9)/MAX(C2:C9) を IFERROR で包み、「確認」を返します。"), hint: L('参考：=IFERROR(MIN(C2:C9)/MAX(C2:C9),"复核")', 'Reference: =IFERROR(MIN(C2:C9)/MAX(C2:C9),"Review")', '参考：=IFERROR(MIN(C2:C9)/MAX(C2:C9),"確認")'), success: L("比值约 0.266。", "The ratio is about 0.266.", "比率は約0.266です。"), formula: '=IFERROR(MIN(C2:C9)/MAX(C2:C9),"复核")', requiredFunctions: ["IFERROR", "MIN", "MAX"] }),
          ],
          hint: L("文字结论不是计算结果，别忘了 English double quotes。", "Text conclusions still need double quotes.", "文字結論には二重引用符が必要です。"),
        }),
      ], { xp: 50 }),
    ],
  });

  D.registerChapter({
    id: "ch04-conditional",
    icon: "04",
    title: L("第 4 章 · 带着条件去汇总", "Chapter 4 · Total with Conditions", "第4章 · 条件付きで集計する"),
    subtitle: L("不再手动筛选。COUNTIF、SUMIF、AVERAGEIF 和它们的多条件版本，会一边判断一边计算。", "Stop filtering by hand. COUNTIF, SUMIF, AVERAGEIF, and their multi-condition versions calculate while they test.", "手作業の絞り込みをやめ、COUNTIF、SUMIF、AVERAGEIF と複数条件版で判定しながら計算します。"),
    levels: [
      level("conditional-single", "lesson", L("单条件统计：区域、金额与人数", "Single-condition Totals: Region and Amount", "単条件集計：地域と金額"), [
        learn(
          "brief-conditional-single",
          L("主管只关心华东", "Your manager only cares about East", "上司は東部だけを見たい"),
          L("表里有多个区域，不能先把别的区域删掉。用 COUNTIF 数人数，SUMIF 汇总金额，AVERAGEIF 看典型水平。", "The table has several regions; do not delete the others. Use COUNTIF for headcount, SUMIF for amounts, and AVERAGEIF for a typical value.", "複数地域の表を削除せず、COUNTIF で人数、SUMIF で金額、AVERAGEIF で典型値を求めます。"),
          [
            L("COUNTIF 的参数：条件区域、条件", "COUNTIF takes criteria range and criteria", "COUNTIF は条件範囲と条件です"),
            L("SUMIF 的参数：条件区域、条件、求和区域", "SUMIF takes criteria range, criteria, and sum range", "SUMIF は条件範囲、条件、合計範囲です"),
            L("条件区域和求和区域的行要一一对应", "The criteria and sum ranges must line up row by row", "条件範囲と合計範囲は行をそろえます"),
            L("文字条件直接写，区间条件要放英文双引号，如 >=1000", "Text criteria are plain; comparison criteria use double quotes such as >=1000", "文字条件はそのまま、比較条件は >=1000 のように二重引用符で囲みます"),
          ],
          L("SUMIF 不是把条件写进求和格，而是让函数在整列里逐行判断。", "SUMIF tests each row across the range rather than putting a condition in the total cell.", "SUMIF は合計セルに条件を書くのではなく、範囲の各行を判定します。"),
          '=SUMIF(B2:B9,"华东",C2:C9)'
        ),
        builder({
          id: "build-sumif-region",
          sheet: sales,
          formula: '=SUMIF(B2:B9,"华东",C2:C9)',
          title: L("填出华东一月销售额", "Fill in East January sales", "東部の1月売上を穴埋めする", "填入華東一月銷售額"),
          lead: L("现在要回答的不是“华东有几个人”，而是“华东这些人一共卖了多少”。SUMIF 需要三块信息：在哪个区域判断条件、判断什么条件、把哪个区域相加。条件文字“华东”已经给出，请补齐函数名和两个区域。", "The question is not how many East reps there are, but how much they sold in total. SUMIF needs three pieces: where to test, what to test for, and what to add. The East criterion is already shown; fill in the function name and both ranges.", "知りたいのは東部の人数ではなく、東部の合計売上です。SUMIF には、条件を判定する範囲、条件、合計する範囲の3つが必要です。条件「東部」は表示済みなので、関数名と2つの範囲を入れます。", "現在要回答的不是「華東有幾個人」，而是「華東這些人一共賣了多少」。SUMIF 需要三塊資訊：在哪個範圍判斷條件、判斷什麼條件、把哪個範圍相加。條件文字「華東」已提供，請補齊函數名稱和兩個範圍。"),
          hint: L("SUMIF 的顺序与多条件版本不同：条件区 B2:B9 在前，求和区 C2:C9 在后。两段区域都必须是 8 行，不能一多一少。", "SUMIF uses a different order from the multi-condition version: criteria range B2:B9 comes first and sum range C2:C9 last. Both ranges must cover the same eight rows.", "SUMIF は複数条件版と順序が異なります。条件範囲 B2:B9 が先、合計範囲 C2:C9 が後です。どちらも同じ8行にそろえます。", "SUMIF 的順序與多條件版本不同：條件範圍 B2:B9 在前，加總範圍 C2:C9 在後。兩段範圍都必須是 8 列，不能一多一少。"),
          success: L("华东一月合计为 1960。条件区域和求和区域逐行对齐，所以只把华东两行的金额加了起来。", "East January totals 1960. The criteria and sum ranges line up row by row, so only the two East amounts are included.", "東部の1月合計は1960です。条件範囲と合計範囲が行ごとにそろうため、東部2行の金額だけが加算されました。", "華東一月合計為 1960。條件範圍和加總範圍逐列對齊，所以只把華東兩列的金額加了起來。"),
          fillBlanks: [1, 3, 7],
        }),
        practice({
          id: "drill-single-condition",
          title: L("区域和金额条件轮换", "Region and amount criteria", "地域と金額の条件"),
          lead: L("随机任务会切换区域、月份或比较条件。先确定条件区域和求和区域。", "Random tasks switch region, month, or comparison. Identify the criteria range and sum range first.", "地域、月、比較条件がランダムに変わります。条件範囲と合計範囲を確認します。"),
          sheet: sales,
          tasks: [
            task({ id: "single-count-east", sheet: sales, target: "C11", taskLabel: L("条件计数", "Conditional count", "条件付き個数"), title: L("华东有几名销售", "How many East reps?", "東部の担当者数"), lead: L("在 C11 用 COUNTIF 统计 B2:B9 中“华东”的个数。", "In C11, COUNTIF B2:B9 for East.", "C11 で COUNTIF を使い B2:B9 の東部を数えます。"), hint: L('参考：=COUNTIF(B2:B9,"华东")', 'Reference: =COUNTIF(B2:B9,"East")', '参考：=COUNTIF(B2:B9,"東部")'), success: L("华东有 2 人。", "There are two East reps.", "東部は2人です。"), formula: '=COUNTIF(B2:B9,"华东")', requiredFunctions: ["COUNTIF"] }),
            task({ id: "single-sum-east-jan", sheet: sales, target: "C12", taskLabel: L("条件求和", "Conditional sum", "条件付き合計"), title: L("华东一月销售额", "East January sales", "東部の1月売上"), lead: L("在 C12 用 SUMIF 汇总一月 C2:C9，只计算区域为华东的行。", "In C12, use SUMIF on January C2:C9 for East rows only.", "C12 で東部の行だけを対象に、1月 C2:C9 を SUMIF します。"), hint: L('参考：=SUMIF(B2:B9,"华东",C2:C9)', 'Reference: =SUMIF(B2:B9,"East",C2:C9)', '参考：=SUMIF(B2:B9,"東部",C2:C9)'), success: L("华东一月合计 1960。", "East January totals 1960.", "東部の1月合計は1960です。"), formula: '=SUMIF(B2:B9,"华东",C2:C9)', requiredFunctions: ["SUMIF"] }),
            task({ id: "single-sum-high", sheet: sales, target: "C13", taskLabel: L("金额阈值", "Amount threshold", "金額基準"), title: L("一月销售额不低于 1000 的合计", "January sales of at least 1000", "1月売上1000以上の合計"), lead: L("在 C13 用 SUMIF 汇总 C2:C9 中大于等于 1000 的数值。", "In C13, SUMIF C2:C9 for values at least 1000.", "C13 で C2:C9 の1000以上を SUMIF します。"), hint: L('参考：=SUMIF(C2:C9,">=1000")', 'Reference: =SUMIF(C2:C9,">=1000")', '参考：=SUMIF(C2:C9,">=1000")'), success: L("1200、1580、1340、1100 满足条件。", "Four values meet the threshold.", "4つの値が条件を満たします。"), formula: '=SUMIF(C2:C9,">=1000")', requiredFunctions: ["SUMIF"] }),
            task({ id: "single-count-high", sheet: sales, target: "C14", taskLabel: L("金额计数", "Amount count", "金額件数"), title: L("一月有多少人达到 1000", "How many hit 1000 in January?", "1月に1000以上は何人？"), lead: L("在 C14 用 COUNTIF 统计 C2:C9 中大于等于 1000 的个数。", "In C14, COUNTIF C2:C9 for values at least 1000.", "C14 で COUNTIF を使い C2:C9 の1000以上を数えます。"), hint: L('参考：=COUNTIF(C2:C9,">=1000")', 'Reference: =COUNTIF(C2:C9,">=1000")', '参考：=COUNTIF(C2:C9,">=1000")'), success: L("共有 4 人。", "Four reps qualify.", "4人です。"), formula: '=COUNTIF(C2:C9,">=1000")', requiredFunctions: ["COUNTIF"] }),
            task({ id: "single-average-east", sheet: sales, target: "C15", taskLabel: L("条件平均", "Conditional average", "条件付き平均"), title: L("华东一月平均值", "East January average", "東部の1月平均"), lead: L("在 C15 用 AVERAGEIF 对华东的一月数据求平均。", "In C15, AVERAGEIF East's January values.", "C15 で東部の1月を AVERAGEIF します。"), hint: L('参考：=AVERAGEIF(B2:B9,"华东",C2:C9)', 'Reference: =AVERAGEIF(B2:B9,"East",C2:C9)', '参考：=AVERAGEIF(B2:B9,"東部",C2:C9)'), success: L("华东平均为 980。", "The East average is 980.", "東部の平均は980です。"), formula: '=AVERAGEIF(B2:B9,"华东",C2:C9)', requiredFunctions: ["AVERAGEIF"] }),
          ],
          hint: L("条件写错了结果会看起来“差不多”，一定确认文字与符号。", "A wrong criterion can still look plausible; check text and symbols carefully.", "条件ミスは結果が自然に見えることがあります。文字と記号を確認します。"),
        }),
        practice({
          id: "drill-single-transfer",
          title: L("条件统计与平均的二次加工", "Re-use condition totals and averages", "条件集計を二次利用する"),
          lead: L("这些任务把第 2、3 章的平均、取整和判断叠在条件统计上。", "These tasks stack Chapter 2 and 3 averages, rounding, and decisions onto conditional totals.", "第2・3章の平均、丸め、判断を条件集計に重ねます。"),
          sheet: sales,
          tasks: [
            task({ id: "single-transfer-1", sheet: sales, target: "C16", taskLabel: L("条件均值", "Conditional mean", "条件平均"), title: L("华东一月平均用手算校验", "Validate East average with SUMIF/COUNTIF", "SUMIF と COUNTIF で東部平均を検算"), lead: L("在 C16 用 SUMIF 除以 COUNTIF，不用 AVERAGEIF。", "In C16, divide SUMIF by COUNTIF without AVERAGEIF.", "C16 で AVERAGEIF を使わず、SUMIF を COUNTIF で割ります。"), hint: L('参考：=SUMIF(B2:B9,"华东",C2:C9)/COUNTIF(B2:B9,"华东")', 'Reference: =SUMIF(B2:B9,"East",C2:C9)/COUNTIF(B2:B9,"East")', '参考：=SUMIF(B2:B9,"東部",C2:C9)/COUNTIF(B2:B9,"東部")'), success: L("结果应与 AVERAGEIF 一样。", "The result should match AVERAGEIF.", "AVERAGEIF と同じ結果になります。"), formula: '=SUMIF(B2:B9,"华东",C2:C9)/COUNTIF(B2:B9,"华东")', requiredFunctions: ["SUMIF", "COUNTIF"] }),
            task({ id: "single-transfer-2", sheet: sales, target: "C17", taskLabel: L("条件平均取整", "Rounded conditional average", "条件平均の丸め"), title: L("华北二月平均保留整数", "North February average rounded", "北部2月平均を整数に"), lead: L("在 C17 用 AVERAGEIF 求华北二月平均，再 ROUND 取整。", "In C17, AVERAGEIF North February and ROUND.", "C17 で北部2月を AVERAGEIF し、ROUND します。"), hint: L('参考：=ROUND(AVERAGEIF(B2:B9,"华北",D2:D9),0)', 'Reference: =ROUND(AVERAGEIF(B2:B9,"North",D2:D9),0)', '参考：=ROUND(AVERAGEIF(B2:B9,"北部",D2:D9),0)'), success: L("华北二月平均被整理成整数。", "The North February average is rounded.", "北部2月平均が整数になります。"), formula: '=ROUND(AVERAGEIF(B2:B9,"华北",D2:D9),0)', requiredFunctions: ["ROUND", "AVERAGEIF"] }),
            task({ id: "single-transfer-3", sheet: sales, target: "C18", taskLabel: L("条件判断", "Conditional decision", "条件判定"), title: L("华南一月是否超过 1500", "Does South January exceed 1500?", "南部の1月は1500超？"), lead: L("在 C18 用 IF 判断华南一月 SUMIF 是否大于 1500。", "In C18, test whether the South January SUMIF exceeds 1500.", "C18 で南部1月の SUMIF が1500超かを IF で判定します。"), hint: L('参考：=IF(SUMIF(B2:B9,"华南",C2:C9)>1500,"完成","不足")', 'Reference: =IF(SUMIF(B2:B9,"South",C2:C9)>1500,"Done","Short")', '参考：=IF(SUMIF(B2:B9,"南部",C2:C9)>1500,"完了","不足")'), success: L("华南一月为 1400，返回“不足”。", "South January is 1400 and returns Short.", "南部1月は1400で「不足」です。"), formula: '=IF(SUMIF(B2:B9,"华南",C2:C9)>1500,"完成","不足")', requiredFunctions: ["IF", "SUMIF"] }),
            task({ id: "single-transfer-4", sheet: sales, target: "C19", taskLabel: L("多月份条件汇总", "Multi-month criteria", "複数月の条件集計"), title: L("华东一二月合计", "East January plus February", "東部の1月＋2月"), lead: L("在 C19 分别对华东的一月和二月 SUMIF，再相加。", "In C19, SUMIF East January and February, then add.", "C19 で東部の1月と2月を SUMIF し、足します。"), hint: L('参考：=SUMIF(B2:B9,"华东",C2:C9)+SUMIF(B2:B9,"华东",D2:D9)', 'Reference: =SUMIF(B2:B9,"East",C2:C9)+SUMIF(B2:B9,"East",D2:D9)', '参考：=SUMIF(B2:B9,"東部",C2:C9)+SUMIF(B2:B9,"東部",D2:D9)'), success: L("两段条件汇总得到华东双月总额。", "Two conditional sums give East's two-month total.", "2つの条件合計で東部の2か月分になります。"), formula: '=SUMIF(B2:B9,"华东",C2:C9)+SUMIF(B2:B9,"华东",D2:D9)', requiredFunctions: ["SUMIF"] }),
          ],
          hint: L("条件统计返回数字后，仍可以继续平均、判断或取整。", "A conditional total is still a number and can be averaged, tested, or rounded.", "条件集計の結果は数値なので、平均・判断・丸めに使えます。"),
        }),
      ], { xp: 40 }),

      level("conditional-multi", "lesson", L("多条件统计：把“华东且达标”一次算完", "Multi-condition Totals: East and Above Target", "複数条件：東部かつ達成"), [
        learn(
          "brief-conditional-multi",
          L("两个条件同时成立才算", "Both conditions must hold", "両方の条件が必要"),
          L("主管要“华东且一月不低于 1000”的人数与金额。COUNTIFS、SUMIFS、AVERAGEIFS 可以一次检查多列，不需要先做辅助列。", "Your manager wants the count and amount for East and January at least 1000. COUNTIFS, SUMIFS, and AVERAGEIFS test multiple columns without helper columns.", "東部かつ1月1000以上の人数と金額を求めます。COUNTIFS、SUMIFS、AVERAGEIFS で複数列をまとめて判定できます。"),
          [
            L("COUNTIFS 按“区域1, 条件1, 区域2, 条件2”成对书写", "COUNTIFS pairs range1, criterion1, range2, criterion2", "COUNTIFS は範囲1、条件1、範囲2、条件2 の組です"),
            L("SUMIFS 先写求和区，再写成对的条件区与条件", "SUMIFS starts with the sum range, then condition pairs", "SUMIFS は合計範囲を先に書き、その後に条件の組を続けます"),
            L("所有条件区域的行数必须一致", "All criteria ranges must have the same number of rows", "すべての条件範囲は同じ行数にします"),
            L("AVERAGEIFS 也只对满足所有条件的数字求平均", "AVERAGEIFS averages only values that pass every condition", "AVERAGEIFS は全条件を満たす数値だけを平均します"),
          ],
          L("SUMIFS 的顺序和多条件 COUNTIF 不同，先记“求和区在最前”。", "SUMIFS differs from COUNTIFS: its sum range comes first.", "SUMIFS は COUNTIFS と順序が異なり、合計範囲が最初です。"),
          '=SUMIFS(C2:C9,B2:B9,"华东",C2:C9,">=1000")'
        ),
        builder({
          id: "build-sumifs-east",
          sheet: sales,
          formula: '=SUMIFS(C2:C9,B2:B9,"华东",C2:C9,">=1000")',
          title: L("填出华东且达千元的一月金额", "Fill in East January sales of 1000+", "東部かつ1000以上の1月売上を穴埋めする", "填入華東且達千元的一月金額"),
          lead: L("这是同时满足两个条件的求和：区域必须是华东，一月金额至少 1000。SUMIFS 的第一个参数就是要相加的金额区，后面成对写“条件区域、条件”。公式已保留两个条件文字，请填主函数和三段关键区域，体会它与 SUMIF 的参数顺序差异。", "This total requires two conditions at once: the region must be East and January sales must be at least 1000. SUMIFS starts with the range to add, then takes range-and-criterion pairs. The two criteria are shown; fill in the function and three key ranges, and notice how the order differs from SUMIF.", "これは2条件を同時に満たす合計です。地域は東部、1月金額は1000以上です。SUMIFS は最初に合計範囲を置き、その後へ「条件範囲、条件」の組を続けます。2つの条件は表示済みなので、主関数と3つの重要範囲を入れ、SUMIF との引数順の違いを確認します。", "這是同時符合兩個條件的加總：區域必須是華東，一月金額至少 1000。SUMIFS 的第一個參數就是要相加的金額範圍，後面成對寫「條件範圍、條件」。公式已保留兩個條件文字，請填主要函數和三段關鍵範圍，體會它與 SUMIF 的參數順序差異。"),
          hint: L("SUMIFS 的求和区在最前，这是最常见的错误点。先确认 C2:C9 是金额区，再用 B2:B9 检查区域；两段条件区的行数必须完全一致。", "SUMIFS puts the sum range first, which is the most common mistake. Confirm that C2:C9 is the amount range, then test region with B2:B9; every criteria range must cover the same rows.", "SUMIFS は合計範囲が先頭で、ここが最も間違えやすい点です。C2:C9 が金額範囲かを確認し、B2:B9 で地域を判定します。すべての条件範囲は同じ行数にそろえます。", "SUMIFS 的加總範圍在最前，這是最常見的錯誤點。先確認 C2:C9 是金額範圍，再用 B2:B9 檢查區域；所有條件範圍的列數都必須完全一致。"),
          success: L("华东只有林晓的一月达到 1000，结果为 1200。两个条件都按同一业务行判断，没有把其他区域或低额订单带进来。", "Only Olivia's East January record reaches 1000, so the result is 1200. Both tests apply to the same business rows, with no other region or low-value order included.", "東部では佐藤さんの1月だけが1000以上で、結果は1200です。2条件を同じ業務行に適用し、他の地域や低額注文は含まれていません。", "華東只有林雅婷的一月達到 1000，結果為 1200。兩個條件都依同一業務橫列判斷，沒有把其他區域或低額訂單納入。"),
          fillBlanks: [1, 3, 9],
        }),
        practice({
          id: "drill-multi-condition",
          title: L("两个条件组合轮换", "Two-condition combinations", "2条件の組み合わせ"),
          lead: L("任务会变化区域、月份、金额门槛或目标条件。按 SUMIFS 的参数顺序检查。", "Tasks vary the region, month, amount threshold, or target. Check SUMIFS argument order.", "地域、月、金額、目標条件が変わります。SUMIFS の引数順を確認します。"),
          sheet: sales,
          tasks: [
            task({ id: "multi-countifs-east", sheet: sales, target: "C11", taskLabel: L("多条件计数", "Multi-condition count", "複数条件個数"), title: L("华东一月达到 1000 的人数", "East reps with January 1000+", "東部で1月1000以上の人数"), lead: L("在 C11 用 COUNTIFS 统计华东且 C2:C9>=1000。", "In C11, COUNTIFS East and C2:C9>=1000.", "C11 で東部かつ C2:C9>=1000 を COUNTIFS します。"), hint: L('参考：=COUNTIFS(B2:B9,"华东",C2:C9,">=1000")', 'Reference: =COUNTIFS(B2:B9,"East",C2:C9,">=1000")', '参考：=COUNTIFS(B2:B9,"東部",C2:C9,">=1000")'), success: L("只有林晓满足两个条件。", "Only Lin meets both conditions.", "林さんだけが両条件を満たします。"), formula: '=COUNTIFS(B2:B9,"华东",C2:C9,">=1000")', requiredFunctions: ["COUNTIFS"] }),
            task({ id: "multi-sumifs-east", sheet: sales, target: "C12", taskLabel: L("多条件求和", "Multi-condition sum", "複数条件合計"), title: L("华东一月达到 1000 的金额", "East January amount with 1000+", "東部で1月1000以上の金額"), lead: L("在 C12 用 SUMIFS 汇总满足两个条件的一月金额。", "In C12, SUMIFS January amounts that meet both tests.", "C12 で両条件を満たす1月金額を SUMIFS します。"), hint: L('参考：=SUMIFS(C2:C9,B2:B9,"华东",C2:C9,">=1000")', 'Reference: =SUMIFS(C2:C9,B2:B9,"East",C2:C9,">=1000")', '参考：=SUMIFS(C2:C9,B2:B9,"東部",C2:C9,">=1000")'), success: L("结果为 1200。", "The result is 1200.", "結果は1200です。"), formula: '=SUMIFS(C2:C9,B2:B9,"华东",C2:C9,">=1000")', requiredFunctions: ["SUMIFS"] }),
            task({ id: "multi-averageifs", sheet: sales, target: "C13", taskLabel: L("多条件平均", "Multi-condition average", "複数条件平均"), title: L("华北达标者的二月平均", "North qualifying February average", "北部の達成者2月平均"), lead: L("在 C13 用 AVERAGEIFS 对华北且完成率>=0.9的行求二月平均。", "In C13, AVERAGEIFS February for North rows with attainment >=0.9.", "C13 で北部かつ達成率0.9以上の2月平均を求めます。"), hint: L('参考：=AVERAGEIFS(D2:D9,B2:B9,"华北",G2:G9,">=0.9")', 'Reference: =AVERAGEIFS(D2:D9,B2:B9,"North",G2:G9,">=0.9")', '参考：=AVERAGEIFS(D2:D9,B2:B9,"北部",G2:G9,">=0.9")'), success: L("周宁和李然满足条件。", "Zhou and Li qualify.", "周さんと李さんが該当します。"), formula: '=AVERAGEIFS(D2:D9,B2:B9,"华北",G2:G9,">=0.9")', requiredFunctions: ["AVERAGEIFS"] }),
            task({ id: "multi-sumifs-c", sheet: sales, target: "C14", taskLabel: L("多月条件", "Multi-month criteria", "複数月条件"), title: L("华南三月低于 1000 的合计", "South March below 1000", "南部3月1000未満の合計"), lead: L("在 C14 用 SUMIFS 汇总华南区域且三月 E2:E9<1000。", "In C14, SUMIFS South and March E2:E9<1000.", "C14 で南部かつ3月 E2:E9<1000 を SUMIFS します。"), hint: L('参考：=SUMIFS(E2:E9,B2:B9,"华南",E2:E9,"<1000")', 'Reference: =SUMIFS(E2:E9,B2:B9,"South",E2:E9,"<1000")', '参考：=SUMIFS(E2:E9,B2:B9,"南部",E2:E9,"<1000")'), success: L("赵敏与王磊的三月都低于 1000。", "Zhao and Wang are both below 1000 in March.", "趙さんと王さんは3月1000未満です。"), formula: '=SUMIFS(E2:E9,B2:B9,"华南",E2:E9,"<1000")', requiredFunctions: ["SUMIFS"] }),
          ],
          hint: L("每多一个条件，就多加一组成对的“区域、条件”。", "Add one range-and-criterion pair for each extra condition.", "条件を増やすたびに範囲と条件の組を追加します。"),
        }),
        practice({
          id: "drill-multi-transfer",
          title: L("订单表上的多条件实战", "Multi-condition practice on orders", "注文表の複数条件実践"),
          lead: L("订单表比销售表更接近日常业务：金额、区域、折扣和日期都在同一行。", "The order table is closer to daily work: amount, region, discount, and date share a row.", "注文表は金額、地域、割引、日付が同じ行にあり、実務に近い表です。"),
          sheet: orders,
          tasks: [
            task({ id: "order-sumifs-east", sheet: orders, target: "J2", taskLabel: L("区域金额", "Regional amount", "地域金額"), title: L("华东订单总额", "Total East orders", "東部注文の合計"), lead: L("在 J2 用 SUMIFS 汇总区域为华东的 H2:H11。", "In J2, SUMIFS H2:H11 for East orders.", "J2 で地域が東部の H2:H11 を SUMIFS します。"), hint: L('参考：=SUMIFS(H2:H11,D2:D11,"华东")', 'Reference: =SUMIFS(H2:H11,D2:D11,"East")', '参考：=SUMIFS(H2:H11,D2:D11,"東部")'), success: L("华东订单总额为 21080。", "East orders total 21080.", "東部の合計は21080です。"), formula: '=SUMIFS(H2:H11,D2:D11,"华东")', requiredFunctions: ["SUMIFS"] }),
            task({ id: "order-countifs-north", sheet: orders, target: "J3", taskLabel: L("区域订单数", "Regional order count", "地域注文数"), title: L("华北订单数量", "Count North orders", "北部注文の件数"), lead: L("在 J3 用 COUNTIFS 统计 D2:D11 为华北的订单。", "In J3, COUNTIFS D2:D11 for North.", "J3 で D2:D11 の北部注文を数えます。"), hint: L('参考：=COUNTIFS(D2:D11,"华北")', 'Reference: =COUNTIFS(D2:D11,"North")', '参考：=COUNTIFS(D2:D11,"北部")'), success: L("华北共有 3 笔订单。", "There are three North orders.", "北部は3件です。"), formula: '=COUNTIFS(D2:D11,"华北")', requiredFunctions: ["COUNTIFS"] }),
            task({ id: "order-sumifs-high", sheet: orders, target: "J4", taskLabel: L("金额门槛", "Amount threshold", "金額基準"), title: L("金额超过 6000 的华东订单", "East orders above 6000", "東部の6000超注文"), lead: L("在 J4 用 SUMIFS 汇总华东且 H2:H11>6000 的金额。", "In J4, SUMIFS East and H2:H11>6000.", "J4 で東部かつ H2:H11>6000 を SUMIFS します。"), hint: L('参考：=SUMIFS(H2:H11,D2:D11,"华东",H2:H11,">6000")', 'Reference: =SUMIFS(H2:H11,D2:D11,"East",H2:H11,">6000")', '参考：=SUMIFS(H2:H11,D2:D11,"東部",H2:H11,">6000")'), success: L("新程科技的 6400 符合条件。", "Lumen Works' 6400 qualifies.", "ルーメンワークスの6400が該当します。", "新程數位的 6,400 符合條件。"), formula: '=SUMIFS(H2:H11,D2:D11,"华东",H2:H11,">6000")', requiredFunctions: ["SUMIFS"] }),
            task({ id: "order-countifs-discount", sheet: orders, target: "J5", taskLabel: L("折扣订单", "Discounted orders", "割引注文"), title: L("华东有折扣的订单数", "Discounted East order count", "東部の割引注文数"), lead: L("在 J5 用 COUNTIFS 统计华东且 G2:G11>0。", "In J5, COUNTIFS East and G2:G11>0.", "J5 で東部かつ G2:G11>0 を数えます。"), hint: L('参考：=COUNTIFS(D2:D11,"华东",G2:G11,">0")', 'Reference: =COUNTIFS(D2:D11,"East",G2:G11,">0")', '参考：=COUNTIFS(D2:D11,"東部",G2:G11,">0")'), success: L("华东有 2 笔折扣订单。", "East has two discounted orders.", "東部には2件の割引注文があります。"), formula: '=COUNTIFS(D2:D11,"华东",G2:G11,">0")', requiredFunctions: ["COUNTIFS"] }),
            task({ id: "order-averageifs", sheet: orders, target: "J6", taskLabel: L("区域平均金额", "Regional average", "地域平均金額"), title: L("西南订单平均金额", "Average Southwest order", "南西部の平均注文額"), lead: L("在 J6 对西南区域的订单金额求平均。", "In J6, average amounts for Southwest orders.", "J6 で南西部注文金額の平均を求めます。"), hint: L('参考：=AVERAGEIFS(H2:H11,D2:D11,"西南")', 'Reference: =AVERAGEIFS(H2:H11,D2:D11,"Southwest")', '参考：=AVERAGEIFS(H2:H11,D2:D11,"南西部")'), success: L("西南只有云谷医疗一笔，平均 11880。", "Southwest has one order; the average is 11880.", "南西部は1件で平均11880です。"), formula: '=AVERAGEIFS(H2:H11,D2:D11,"西南")', requiredFunctions: ["AVERAGEIFS"] }),
          ],
          hint: L("订单金额在 H 列，区域在 D 列。别把求和区和条件区写反。", "Amounts are in H and regions in D; do not swap sum and criteria ranges.", "金額はH列、地域はD列です。範囲を逆にしないでください。"),
        }),
      ], { xp: 45 }),

      level("conditional-check", "review", L("区域经营复盘：条件统计综合关", "Regional Review: Conditional Totals Checkpoint", "地域レビュー：条件集計の総合チェック", "區域營運檢討：條件統計綜合關卡"), [
        learn(
          "brief-conditional-check",
          L("把多个条件汇总串成复盘", "Turn condition totals into a review", "条件集計を振り返りに変える"),
          L("今天没有新函数，任务会同时用到单条件、多条件、平均、取整和 IF。遇到复合题先在纸上拆成“人数、金额、典型值、结论”。", "No new function. Tasks combine single and multi-condition totals, averages, rounding, and IF. Split a compound request into people, amount, typical value, and conclusion.", "新しい関数はありません。単条件、複数条件、平均、丸め、IF を組み合わせます。人数、金額、典型値、結論に分けます。"),
          [
            L("先问“要人数、金额还是平均”", "Ask whether the task wants a count, amount, or average", "何人、金額、平均のどれかを確認します"),
            L("多条件存在时优先用带 S 的版本", "When more than one condition exists, use the S versions", "複数条件なら S 付きの関数を使います"),
            L("平均或取整可以作为外层函数", "Average or rounding can be the outer function", "平均や丸めを外側の関数にできます"),
            L("把最终结论和中间数字分开检查", "Check the conclusion separately from the intermediate number", "最終結論と中間数値を分けて確認します"),
          ],
          L("不要为了一个结果在表里手动删数据，公式应保留完整表格。", "Do not delete rows to get one result; formulas should preserve the full table.", "結果のために行を削除せず、数式で完全な表を保ちます。"),
          '=SUMIFS(H2:H11,D2:D11,"华东",H2:H11,">6000")'
        ),
        practice({
          id: "conditional-check-sales",
          title: L("销售区域复盘", "Sales regional review", "営業地域レビュー"),
          lead: L("随机选择区域和指标，完成人数、金额、平均或结论。", "Randomly choose a region and metric; finish count, amount, average, or conclusion.", "地域と指標がランダムに選ばれます。人数、金額、平均、結論を完成させます。"),
          sheet: sales,
          tasks: [
            task({ id: "cond-review-1", sheet: sales, target: "C20", taskLabel: L("区域人数", "Regional headcount", "地域人数"), title: L("华北销售人数", "North headcount", "北部の人数"), lead: L("在 C20 用 COUNTIF 统计 B2:B9 的华北。", "In C20, COUNTIF B2:B9 for North.", "C20 で B2:B9 の北部を数えます。"), hint: L('参考：=COUNTIF(B2:B9,"华北")', 'Reference: =COUNTIF(B2:B9,"North")', '参考：=COUNTIF(B2:B9,"北部")'), success: L("华北有 2 人。", "North has two reps.", "北部は2人です。"), formula: '=COUNTIF(B2:B9,"华北")', requiredFunctions: ["COUNTIF"] }),
            task({ id: "cond-review-2", sheet: sales, target: "C21", taskLabel: L("区域金额", "Regional amount", "地域金額"), title: L("西南三月销售额", "Southwest March sales", "南西部3月売上"), lead: L("在 C21 用 SUMIF 汇总西南区域的 E2:E9。", "In C21, SUMIF Southwest over E2:E9.", "C21 で南西部の E2:E9 を SUMIF します。"), hint: L('参考：=SUMIF(B2:B9,"西南",E2:E9)', 'Reference: =SUMIF(B2:B9,"Southwest",E2:E9)', '参考：=SUMIF(B2:B9,"南西部",E2:E9)'), success: L("西南三月合计 2300。", "Southwest March totals 2300.", "南西部3月は2300です。"), formula: '=SUMIF(B2:B9,"西南",E2:E9)', requiredFunctions: ["SUMIF"] }),
            task({ id: "cond-review-3", sheet: sales, target: "C22", taskLabel: L("多条件金额", "Multi-condition amount", "複数条件金額"), title: L("华北完成率 90% 以上的一月金额", "North January with 90%+ attainment", "北部で達成率90%以上の1月金額"), lead: L("在 C22 用 SUMIFS 汇总一月，条件为华北且 G2:G9>=0.9。", "In C22, SUMIFS January for North and G2:G9>=0.9.", "C22 で北部かつ G2:G9>=0.9 の1月を SUMIFS します。"), hint: L('参考：=SUMIFS(C2:C9,B2:B9,"华北",G2:G9,">=0.9")', 'Reference: =SUMIFS(C2:C9,B2:B9,"North",G2:G9,">=0.9")', '参考：=SUMIFS(C2:C9,B2:B9,"北部",G2:G9,">=0.9")'), success: L("周宁和李然满足条件。", "Zhou and Li qualify.", "周さんと李さんが該当します。"), formula: '=SUMIFS(C2:C9,B2:B9,"华北",G2:G9,">=0.9")', requiredFunctions: ["SUMIFS"] }),
            task({ id: "cond-review-4", sheet: sales, target: "C23", taskLabel: L("条件均值取整", "Rounded conditional average", "条件平均の丸め"), title: L("华南三月平均保留整数", "South March average rounded", "南部3月平均を整数に"), lead: L("在 C23 用 AVERAGEIF 求华南三月平均，再取整。", "In C23, AVERAGEIF South March and round.", "C23 で南部3月の AVERAGEIF を求め、丸めます。"), hint: L('参考：=ROUND(AVERAGEIF(B2:B9,"华南",E2:E9),0)', 'Reference: =ROUND(AVERAGEIF(B2:B9,"South",E2:E9),0)', '参考：=ROUND(AVERAGEIF(B2:B9,"南部",E2:E9),0)'), success: L("平均 635，取整后 635。", "The average is 635.", "平均は635です。"), formula: '=ROUND(AVERAGEIF(B2:B9,"华南",E2:E9),0)', requiredFunctions: ["ROUND", "AVERAGEIF"] }),
          ],
          hint: L("多条件金额题先找求和区，再列条件对。", "For multi-condition amounts, locate the sum range, then list condition pairs.", "複数条件金額では合計範囲を先に探します。"),
        }),
        practice({
          id: "conditional-check-orders",
          title: L("订单复盘与业务判断", "Order review and business decisions", "注文レビューと業務判断"),
          lead: L("订单表的 H 列金额已计算好。这里不再手算金额，而是练条件汇总和判断。", "Order amounts are already in H. Practice condition totals and decisions instead of recalculating amounts.", "注文表のH列には金額があります。金額再計算ではなく条件集計と判断を練習します。"),
          sheet: orders,
          tasks: [
            task({ id: "cond-order-review-1", sheet: orders, target: "J7", taskLabel: L("区域毛利率", "Regional share", "地域シェア"), title: L("华东订单占全部金额的比例", "East share of all order amount", "東部の売上構成比"), lead: L("在 J7 用 SUMIFS 算华东金额，再除以 SUM 算总额。", "In J7, SUMIFS East and divide by the SUM total.", "J7 で東部を SUMIFS し、SUM の総額で割ります。"), hint: L('参考：=SUMIFS(H2:H11,D2:D11,"华东")/SUM(H2:H11)', 'Reference: =SUMIFS(H2:H11,D2:D11,"East")/SUM(H2:H11)', '参考：=SUMIFS(H2:H11,D2:D11,"東部")/SUM(H2:H11)'), success: L("华东占比约 0.4065。", "East is about 40.65%.", "東部は約40.65%です。"), formula: '=SUMIFS(H2:H11,D2:D11,"华东")/SUM(H2:H11)', requiredFunctions: ["SUMIFS", "SUM"] }),
            task({ id: "cond-order-review-2", sheet: orders, target: "J8", taskLabel: L("条件判断", "Conditional decision", "条件判定"), title: L("华东订单是否超过 2 万", "Do East orders exceed 20k?", "東部注文は2万超？"), lead: L("在 J8 用 IF 判断华东 SUMIFS 是否大于 20000。", "In J8, test whether the East SUMIFS exceeds 20000.", "J8 で東部の SUMIFS が20000超かを判定します。"), hint: L('参考：=IF(SUMIFS(H2:H11,D2:D11,"华东")>20000,"达成","未达")', 'Reference: =IF(SUMIFS(H2:H11,D2:D11,"East")>20000,"Met","Short")', '参考：=IF(SUMIFS(H2:H11,D2:D11,"東部")>20000,"達成","未達")'), success: L("华东总额 21080，返回“达成”。", "East totals 21080 and returns Met.", "東部は21080で「達成」です。"), formula: '=IF(SUMIFS(H2:H11,D2:D11,"华东")>20000,"达成","未达")', requiredFunctions: ["IF", "SUMIFS"] }),
            task({ id: "cond-order-review-3", sheet: orders, target: "J9", taskLabel: L("折扣平均", "Discount average", "割引平均"), title: L("华北订单平均金额", "Average North order", "北部の平均注文額"), lead: L("在 J9 对华北区域的 H2:H11 求平均。", "In J9, average H2:H11 for North.", "J9 で北部の H2:H11 平均を求めます。"), hint: L('参考：=AVERAGEIFS(H2:H11,D2:D11,"华北")', 'Reference: =AVERAGEIFS(H2:H11,D2:D11,"North")', '参考：=AVERAGEIFS(H2:H11,D2:D11,"北部")'), success: L("华北平均为 (4050+1020+3060)/3=2710。", "The North average is 2710.", "北部の平均は2710です。"), formula: '=AVERAGEIFS(H2:H11,D2:D11,"华北")', requiredFunctions: ["AVERAGEIFS"] }),
            task({ id: "cond-order-review-4", sheet: orders, target: "J10", taskLabel: L("计数与阈值", "Count and threshold", "件数と基準"), title: L("金额超过 5000 的订单数", "Orders above 5000", "5000超の注文数"), lead: L("在 J10 用 COUNTIF 统计 H2:H11>5000 的订单。", "In J10, COUNTIF H2:H11>5000.", "J10 で H2:H11>5000 を数えます。"), hint: L('参考：=COUNTIF(H2:H11,">5000")', 'Reference: =COUNTIF(H2:H11,">5000")', '参考：=COUNTIF(H2:H11,">5000")'), success: L("共有 5 笔。", "Five orders qualify.", "5件です。"), formula: '=COUNTIF(H2:H11,">5000")', requiredFunctions: ["COUNTIF"] }),
          ],
          hint: L("比例题通常用“某区域合计 ÷ 全表合计”。", "A share is usually a regional total divided by the grand total.", "構成比は地域合計÷全体合計です。"),
        }),
      ], { xp: 50 }),
    ],
  });

  // More chapters follow.
})();
