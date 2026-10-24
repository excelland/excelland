(function () {
  "use strict";

  const K = window.CurriculumKit;
  const D = window.CourseData;
  const L = K.L;

  const TRAINING_TOTAL = 50;
  const DAILY_TOTAL = 183;
  const DAILY_EPOCH = Date.UTC(2026, 0, 1) / 86400000;
  const TRAINING_SCENARIOS = [
    {
      key: "studio",
      code: "ST",
      org: L("青禾设计工作室", "Fern & Field Studio", "青葉スタジオ", "青禾設計工作室"),
      theme: L("设计项目交付复盘", "design project delivery review", "デザイン案件の納品レビュー", "設計專案交付複盤"),
      context: L("{org} 的设计、内容与质检团队共用一张项目表。交付前要核对工时、金额和状态。", "The design, content, and QA teams at {org} share one project sheet. Hours, amounts, and statuses must be checked before delivery.", "{org} のデザイン・コンテンツ・品質チームが1つの案件表を共有しています。納品前に工数・金額・状態を確認します。", "{org} 的設計、內容與品管團隊共用一張專案表。交付前要核對工時、金額和狀態。"),
      groups: [L("设计", "Design", "デザイン", "設計"), L("内容", "Content", "コンテンツ", "內容"), L("质检", "Quality", "品質", "品管"), L("交付", "Delivery", "納品", "交付")],
      statuses: [L("进行中", "Active", "進行中", "進行中"), L("待复核", "Needs review", "要確認", "待複核"), L("已完成", "Complete", "完了", "已完成")],
      modes: ["sheets", "namedRange", "audit", "print", "chart"],
    },
    {
      key: "logistics",
      code: "LG",
      org: L("远山物流", "Northstar Logistics", "遠山物流", "遠山物流"),
      theme: L("区域配送异常复盘", "regional delivery exception review", "地域配送の例外レビュー", "區域配送異常複盤"),
      context: L("{org} 正在核对本周配送记录，区域、派送状态和金额要一起看，不能只看数量。", "{org} is reviewing this week's deliveries. Region, delivery status, and amount belong in the same check, not quantity alone.", "{org} は今週の配送記録を確認しています。地域・配送状態・金額を同時に見て、数量だけで判断しません。", "{org} 正在核對本週配送紀錄，區域、配送狀態和金額要一起看，不能只看數量。"),
      groups: [L("北区", "North", "北", "北區"), L("东区", "East", "東", "東區"), L("南区", "South", "南", "南區"), L("西区", "West", "西", "西區")],
      statuses: [L("已送达", "Delivered", "配達済み", "已送達"), L("待派送", "Pending", "配達待ち", "待派送"), L("异常", "Exception", "例外", "異常")],
      modes: ["sort", "advancedFilter", "removeDuplicates", "subtotal", "pivot"],
    },
    {
      key: "learning",
      code: "LN",
      org: L("星海学习中心", "Harbor Learning", "星海ラーニング", "星海學習中心"),
      theme: L("课程报名与出勤检查", "course enrolment and attendance check", "講座申込と出席の確認", "課程報名與出勤檢查"),
      context: L("{org} 的课程顾问要检查不同班型的报名、出勤和收费，状态异常需要立即跟进。", "{org} advisers need to check enrolment, attendance, and fees by course type, then follow up on exceptions.", "{org} の講座担当はコース種別ごとに申込・出席・料金を確認し、異常があればすぐ対応します。", "{org} 的課程顧問要檢查不同班型的報名、出勤和收費，狀態異常需要立即跟進。"),
      groups: [L("入门班", "Starter", "入門", "入門班"), L("进阶班", "Advanced", "上級", "進階班"), L("企业班", "Business", "企業", "企業班"), L("周末班", "Weekend", "週末", "週末班")],
      statuses: [L("已报名", "Enrolled", "申込済み", "已報名"), L("待确认", "Pending", "確認待ち", "待確認"), L("已取消", "Cancelled", "取消済み", "已取消")],
      modes: ["conditional", "validation", "pivot", "chart", "sheets"],
    },
    {
      key: "support",
      code: "SP",
      org: L("新程科技", "Trailhead Tech", "新程テック", "新程科技"),
      theme: L("服务台工单清理", "service desk ticket cleanup", "サービスデスクのチケット整理", "服務台工單清理"),
      context: L("{org} 的服务台要把已解决和升级工单分开，统计处理时长与费用，避免把旧问题混入本月。", "{org} service desk needs to separate resolved and escalated tickets, then review handling time and cost without mixing in old issues.", "{org} のサービスデスクでは、解決済みとエスカレーションを分け、処理時間と費用を確認して古い問題を混ぜないようにします。", "{org} 的服務台要把已解決和升級工單分開，統計處理時長與費用，避免把舊問題混入本月。"),
      groups: [L("桌面支持", "Desktop", "デスクトップ", "桌面支援"), L("网络", "Network", "ネットワーク", "網路"), L("应用", "Application", "アプリ", "應用"), L("安全", "Security", "セキュリティ", "安全")],
      statuses: [L("已解决", "Resolved", "解決済み", "已解決"), L("处理中", "In progress", "処理中", "處理中"), L("已升级", "Escalated", "エスカレーション", "已升級")],
      modes: ["textToColumns", "pasteSpecial", "import", "pivotChart", "validation"],
    },
    {
      key: "inventory",
      code: "IV",
      org: L("南岸物流", "Southbank Logistics", "南岸物流", "南岸物流"),
      theme: L("仓库盘点与补货复核", "warehouse count and reorder review", "倉庫棚卸と発注レビュー", "倉庫盤點與補貨複核"),
      context: L("{org} 仓管要核对库存记录，处理重复条目并生成本月补货汇总，金额与数量都要一致。", "{org} stock control needs clean inventory records, duplicate removal, and a monthly reorder summary with matching units and amounts.", "{org} の在庫担当は記録を整え、重複を除き、数量と金額が一致する月次発注集計を作ります。", "{org} 倉管要核對庫存紀錄，處理重複項目並產生本月補貨彙總，金額與數量都要一致。"),
      groups: [L("入库", "Inbound", "入庫", "入庫"), L("出库", "Outbound", "出庫", "出庫"), L("退货", "Returns", "返品", "退貨"), L("盘点", "Stock count", "棚卸", "盤點")],
      statuses: [L("正常", "Normal", "正常", "正常"), L("关注", "Watch", "要注意", "關注"), L("紧急", "Urgent", "緊急", "緊急")],
      modes: ["consolidate", "subtotal", "removeDuplicates", "sort", "sparkline"],
    },
    {
      key: "home",
      code: "HM",
      org: L("暖日生活", "Hearthside Living", "暖日ライフ", "暖日生活"),
      theme: L("门店品类销售复盘", "store category sales review", "店舗カテゴリ売上レビュー", "門市品類銷售複盤"),
      context: L("{org} 门店要比较不同品类的销量和收入，用图表和透视汇总给店长做陈列决定。", "{org} stores need to compare units and revenue by category, then use charts and a pivot summary for merchandising decisions.", "{org} の店舗はカテゴリ別の数量と収入を比較し、グラフとピボット集計で陳列判断を行います。", "{org} 門市要比較不同品類的銷量和收入，用圖表和樞紐彙總給店長做陳列決定。"),
      groups: [L("家居", "Home", "ホーム", "家居"), L("厨房", "Kitchen", "キッチン", "廚房"), L("文具", "Stationery", "文具", "文具"), L("礼品", "Gifts", "ギフト", "禮品")],
      statuses: [L("充足", "Healthy", "十分", "充足"), L("待补货", "Reorder", "発注必要", "待補貨"), L("紧急", "Critical", "緊急", "緊急")],
      modes: ["chart", "sparkline", "pivot", "pivotChart", "conditional"],
    },
    {
      key: "cafe",
      code: "CF",
      org: L("晨光咖啡", "Morning Light Café", "朝光カフェ", "晨光咖啡"),
      theme: L("菜单利润与来客预测", "menu margin and guest forecast", "メニュー利益と来客予測", "菜單利潤與來客預測"),
      context: L("{org} 店长要判断菜单价格和采购成本的变化对利润的影响，并为下一季度备货做预测。", "{org} managers need to test how menu prices and food costs affect profit, then forecast supplies for the next quarter.", "{org} の店長はメニュー価格と仕入原価が利益へ与える影響を試算し、翌四半期の仕入れを予測します。", "{org} 店長要判斷菜單價格和採購成本變化對利潤的影響，並為下一季度備貨做預測。"),
      groups: [L("主餐", "Mains", "メイン", "主餐"), L("饮品", "Drinks", "ドリンク", "飲品"), L("甜点", "Desserts", "デザート", "甜點"), L("小食", "Sides", "サイド", "小食")],
      statuses: [L("主推", "Star", "イチ押し", "主推"), L("稳定", "Stable", "安定", "穩定"), L("待调整", "Revise", "見直し", "待調整")],
      modes: ["goalSeek", "dataTable", "forecast", "chart", "validation"],
    },
    {
      key: "books",
      code: "BK",
      org: L("河畔书店", "Riverside Books", "川辺書店", "河畔書店"),
      theme: L("采购预算与库存方案", "purchase budget and stock scenarios", "仕入予算と在庫シナリオ", "採購預算與庫存方案"),
      context: L("{org} 采购会要在预算内选择订货组合，并比较悲观与乐观库存方案。", "{org} buyers need a purchase mix within budget and a comparison of conservative and optimistic stock scenarios.", "{org} の仕入会議では予算内の発注構成を選び、慎重案と楽観案の在庫シナリオを比較します。", "{org} 採購會要在預算內選擇訂貨組合，並比較悲觀與樂觀庫存方案。"),
      groups: [L("文学", "Literature", "文学", "文學"), L("商业", "Business", "ビジネス", "商業"), L("童书", "Children", "児童書", "童書"), L("杂志", "Periodicals", "雑誌", "雜誌")],
      statuses: [L("已入库", "Received", "入荷済み", "已入庫"), L("待上架", "Pending", "棚入れ待ち", "待上架"), L("缺货", "Out of stock", "在庫切れ", "缺貨")],
      modes: ["scenario", "solver", "array", "pivot", "namedRange"],
    },
    {
      key: "supplies",
      code: "OF",
      org: L("恒远办公用品", "Everline Office Supply", "恒遠オフィス", "恒遠辦公用具"),
      theme: L("跨部门领用与成本分摊", "cross-department issue and cost allocation", "部署間の払出と原価配分", "跨部門領用與成本分攤"),
      context: L("{org} 行政要汇总多个部门的办公用品领用，保护公式，并交给财务打印归档。", "{org} administration needs to combine office-supply issues across departments, protect the formulas, and hand a printable file to Finance.", "{org} 総務は複数部署の事務用品払出を集計し、数式を保護して、経理へ印刷用ファイルを渡します。", "{org} 行政要彙總多個部門的辦公用具領用，保護公式，並交給財務列印歸檔。"),
      groups: [L("纸张", "Paper", "用紙", "紙張"), L("书写", "Writing", "筆記具", "書寫"), L("设备", "Equipment", "機器", "設備"), L("耗材", "Supplies", "消耗品", "耗材")],
      statuses: [L("已批准", "Approved", "承認済み", "已核准"), L("待比价", "Pending quote", "見積待ち", "待比價"), L("已拒绝", "Rejected", "却下", "已拒絕")],
      modes: ["multiSheet", "protect", "freeze", "print", "audit"],
    },
    {
      key: "service",
      code: "CS",
      org: L("云帆客户服务", "CloudSail Support", "雲帆サポート", "雲帆客服"),
      theme: L("渠道服务与升级复核", "channel service and escalation review", "チャネル対応とエスカレーション", "通路服務與升級複核"),
      context: L("{org} 客服主管要按渠道检查结案率、升级量和成本，并把结果整理成可交付的汇总。", "{org} support leads need closure rates, escalations, and cost by channel, then a clean deliverable summary.", "{org} のサポート責任者はチャネル別に完了率・エスカレーション・原価を確認し、提出用集計に整えます。", "{org} 客服主管要依通路檢查結案率、升級量和成本，並把結果整理成可交付的彙總。"),
      groups: [L("电话", "Phone", "電話", "電話"), L("邮件", "Email", "メール", "郵件"), L("在线", "Chat", "チャット", "線上"), L("现场", "Onsite", "訪問", "現場")],
      statuses: [L("已结案", "Closed", "完了", "已結案"), L("待跟进", "Follow-up", "要フォロー", "待跟進"), L("已升级", "Escalated", "エスカレーション", "已升級")],
      modes: ["pivot", "pivotChart", "conditional", "audit", "array"],
    },
  ];

  const DAILY_SCENARIOS = [
    {
      key: "clinic",
      code: "CL",
      org: L("东湖诊所", "East Lake Clinic", "東湖クリニック", "東湖診所"),
      theme: L("预约与检验排班", "appointment and lab scheduling", "予約と検査の日程", "預約與檢驗排班"),
      context: L("{org} 前台要检查预约状态、检验排班和科室收入，确保当天名单可直接使用。", "{org} reception needs valid appointment statuses, lab scheduling, and department revenue for today's list.", "{org} 受付は予約状態・検査日程・診療科収入を確認し、当日使える名簿にします。", "{org} 櫃檯要檢查預約狀態、檢驗排班和科別收入，確保當天名單可直接使用。"),
      groups: [L("内科", "General", "内科", "內科"), L("儿科", "Pediatrics", "小児科", "兒科"), L("检验", "Lab", "検査", "檢驗"), L("药房", "Pharmacy", "薬局", "藥局")],
      statuses: [L("已预约", "Booked", "予約済み", "已預約"), L("待确认", "Pending", "確認待ち", "待確認"), L("已改期", "Rescheduled", "変更済み", "已改期")],
      modes: ["validation", "pivot", "chart", "sheets"],
    },
    {
      key: "bakery",
      code: "BA",
      org: L("海港烘焙", "Harbor Bakery", "海港ベーカリー", "海港烘焙"),
      theme: L("每日出炉与售价检查", "daily bake and price check", "日次焼成と価格確認", "每日出爐與售價檢查"),
      context: L("{org} 早班要按品类检查销售、成本和剩余量，避免把昨日数据带进今日排产。", "{org} morning shift checks sales, cost, and remaining stock by category without carrying yesterday's figures into today's bake plan.", "{org} の早番はカテゴリ別に売上・原価・残数を確認し、昨日の数字を今日の焼成計画へ持ち越しません。", "{org} 早班要依品類檢查銷售、成本和剩餘量，避免把昨日資料帶進今日排產。"),
      groups: [L("面包", "Bread", "パン", "麵包"), L("蛋糕", "Cakes", "ケーキ", "蛋糕"), L("饼干", "Cookies", "クッキー", "餅乾"), L("饮品", "Drinks", "ドリンク", "飲品")],
      statuses: [L("热销", "Best seller", "売れ筋", "熱銷"), L("正常", "Normal", "正常", "正常"), L("待下架", "Remove", "販売終了候補", "待下架")],
      modes: ["sort", "conditional", "goalSeek", "print"],
    },
    {
      key: "hotel",
      code: "HT",
      org: L("七星酒店", "Seven Star Hotel", "七星ホテル", "七星酒店"),
      theme: L("客房与会议收入检查", "rooms and events revenue check", "客室と宴会収入の確認", "客房與會議收入檢查"),
      context: L("{org} 值班经理要把客房、餐饮和会议收入放在一起看，并核对未付款与取消记录。", "{org} duty manager needs rooms, F&B, and events revenue in one view, with unpaid and cancelled records separated.", "{org} の当直マネージャーは客室・飲食・宴会収入をまとめ、未払いと取消を分けて確認します。", "{org} 值班經理要把客房、餐飲和會議收入放在一起看，並核對未付款與取消紀錄。"),
      groups: [L("客房", "Rooms", "客室", "客房"), L("餐饮", "F&B", "飲食", "餐飲"), L("会议", "Events", "宴会", "會議"), L("前台", "Front desk", "フロント", "櫃檯")],
      statuses: [L("已确认", "Confirmed", "確定", "已確認"), L("待付款", "Pending payment", "入金待ち", "待付款"), L("已取消", "Cancelled", "取消済み", "已取消")],
      modes: ["pivot", "pivotChart", "print", "validation"],
    },
    {
      key: "factory",
      code: "MF",
      org: L("松林制造", "Pinegrove Manufacturing", "松林製作所", "松林製造"),
      theme: L("生产线质量批次回顾", "production batch quality review", "生産ロット品質レビュー", "生產線品質批次回顧"),
      context: L("{org} 生产会关注各线产量、返工和停机，返工批次必须高亮并阻止无效状态。", "{org} production review follows output, rework, and downtime by line; rework batches must stand out and invalid statuses must be blocked.", "{org} の生産会議ではライン別の生産数・手直し・停止を確認し、手直しロットを強調して無効な状態を防ぎます。", "{org} 生產會關注各線產量、返工和停機，返工批次必須醒目提示並阻止無效狀態。"),
      groups: [L("A 线", "Line A", "Aライン", "A 線"), L("B 线", "Line B", "Bライン", "B 線"), L("C 线", "Line C", "Cライン", "C 線"), L("D 线", "Line D", "Dライン", "D 線")],
      statuses: [L("合格", "Pass", "合格", "合格"), L("待复检", "Recheck", "再検査", "待復檢"), L("返工", "Rework", "手直し", "返工")],
      modes: ["conditional", "validation", "sparkline", "sort"],
    },
    {
      key: "library",
      code: "LB",
      org: L("青石图书馆", "Bluestone Library", "青石図書館", "青石圖書館"),
      theme: L("借阅与活动清单整理", "loan and event list cleanup", "貸出とイベント一覧の整理", "借閱與活動清單整理"),
      context: L("{org} 馆员要把借阅、归还和活动记录拆成可用清单，逾期项目需要优先处理。", "{org} librarians need clean loan, return, and event lists, with overdue items handled first.", "{org} の司書は貸出・返却・イベント記録を使える一覧に整え、延滞を優先します。", "{org} 館員要把借閱、歸還和活動紀錄拆成可用清單，逾期項目需要優先處理。"),
      groups: [L("借阅", "Loan", "貸出", "借閱"), L("归还", "Return", "返却", "歸還"), L("预约", "Hold", "予約", "預約"), L("活动", "Event", "イベント", "活動")],
      statuses: [L("已处理", "Done", "処理済み", "已處理"), L("待处理", "Pending", "処理待ち", "待處理"), L("逾期", "Overdue", "延滞", "逾期")],
      modes: ["advancedFilter", "sort", "textToColumns", "import"],
    },
    {
      key: "training",
      code: "TR",
      org: L("明德培训", "Brightpath Training", "明徳研修", "明德培訓"),
      theme: L("培训班交接文件检查", "training class workbook handoff", "研修ブックの引き継ぎ確認", "培訓班交接文件檢查"),
      context: L("{org} 教务要整理一张可交接的工作簿，命名区域、公式和打印设置都要能让下一位同事直接使用。", "{org} coordinators need a handoff workbook with usable names, formulas, and print settings for the next colleague.", "{org} の研修担当は、次の担当者がそのまま使える名前付き範囲・数式・印刷設定のブックを整えます。", "{org} 教務要整理一張可交接的活頁簿，具名範圍、公式和列印設定都要能讓下一位同事直接使用。"),
      groups: [L("新员工", "New staff", "新入社員", "新員工"), L("管理", "Management", "管理職", "管理"), L("安全", "Safety", "安全", "安全"), L("客户", "Customer", "顧客", "客戶")],
      statuses: [L("已开班", "Running", "開講中", "已開班"), L("待开课", "Scheduled", "開講予定", "待開課"), L("已结束", "Finished", "終了", "已結束")],
      modes: ["sheets", "namedRange", "audit", "freeze", "protect"],
    },
    {
      key: "software",
      code: "SW",
      org: L("云杉软件", "Spruce Software", "雲杉ソフト", "雲杉軟體"),
      theme: L("版本缺陷与支持量复盘", "release defect and support load review", "リリース不具合とサポート量", "版本缺陷與支援量複盤"),
      context: L("{org} 产品团队要同时看缺陷分布、修复状态和未来支持量，动态数组用于快速预览关注项。", "{org} product team needs defect distribution, fix status, and a forward support view, with dynamic arrays for quick review.", "{org} の製品チームは不具合分布・修正状態・今後のサポート量を確認し、動的配列で注目項目を素早く見ます。", "{org} 產品團隊要同時看缺陷分布、修復狀態和未來支援量，動態陣列用於快速預覽關注項。"),
      groups: [L("桌面端", "Desktop", "デスクトップ", "桌面端"), L("移动端", "Mobile", "モバイル", "行動端"), L("接口", "API", "API", "介面"), L("数据", "Data", "データ", "資料")],
      statuses: [L("已修复", "Fixed", "修正済み", "已修復"), L("处理中", "In progress", "処理中", "處理中"), L("已升级", "Escalated", "エスカレーション", "已升級")],
      modes: ["pivot", "array", "forecast", "pivotChart"],
    },
    {
      key: "insurance",
      code: "IN",
      org: L("安和保险", "Anhe Insurance", "安和保険", "安和保險"),
      theme: L("保单核保与情景测算", "policy underwriting and scenario planning", "保険引受とシナリオ試算", "保單核保與情境測算"),
      context: L("{org} 核保组要比较不同保单组合的风险和收入，并用目标搜索回答最低保费问题。", "{org} underwriting needs risk and revenue comparisons across policy mixes and Goal Seek for a minimum premium question.", "{org} の引受チームは保険構成ごとのリスクと収入を比較し、最低保険料をゴールシークで求めます。", "{org} 核保組要比較不同保單組合的風險和收入，並用目標搜尋回答最低保費問題。"),
      groups: [L("车险", "Auto", "自動車", "車險"), L("家财", "Home", "家庭財産", "家財"), L("旅行", "Travel", "旅行", "旅行"), L("健康", "Health", "健康", "健康")],
      statuses: [L("已核保", "Approved", "引受済み", "已核保"), L("待补件", "Need documents", "書類待ち", "待補件"), L("已拒保", "Declined", "引受不可", "已拒保")],
      modes: ["dataTable", "scenario", "solver", "goalSeek"],
    },
    {
      key: "travel",
      code: "TV",
      org: L("和风旅行", "Breeze Travel", "和風旅行", "和風旅遊"),
      theme: L("团队行程与供应商合并", "group itinerary and supplier consolidation", "団体旅程と仕入先統合", "團體行程與供應商合併"),
      context: L("{org} 运营要在出发前合并供应商数量、拆分导入记录，并确认多张行程表的总量。", "{org} operations must consolidate supplier quantities, split imported records, and confirm totals across itinerary sheets before departure.", "{org} の運営は出発前に仕入先数量を統合し、取込記録を分割し、旅程シート間の合計を確認します。", "{org} 營運要在出發前合併供應商數量、拆分匯入紀錄，並確認多張行程表的總量。"),
      groups: [L("团队", "Group", "団体", "團體"), L("散客", "Individual", "個人", "散客"), L("商务", "Business", "ビジネス", "商務"), L("亲子", "Family", "ファミリー", "親子")],
      statuses: [L("已确认", "Confirmed", "確定", "已確認"), L("待确认", "Pending", "確認待ち", "待確認"), L("已取消", "Cancelled", "取消済み", "已取消")],
      modes: ["consolidate", "import", "multiSheet", "pasteSpecial"],
    },
    {
      key: "farm",
      code: "FM",
      org: L("绿叶农场", "Greenleaf Farm", "緑葉ファーム", "綠葉農場"),
      theme: L("采收批次与订单整理", "harvest batch and order cleanup", "収穫ロットと注文整理", "採收批次與訂單整理"),
      context: L("{org} 配送组要删除重复订单、按品类小计，并把配送地址拆成可用字段。", "{org} dispatch needs duplicate-order removal, category subtotals, and delivery addresses split into usable fields.", "{org} の配送担当は重複注文を削除し、カテゴリ別に小計し、配送先を利用できる項目へ分割します。", "{org} 配送組要刪除重複訂單、依品類小計，並把配送地址拆成可用欄位。"),
      groups: [L("蔬菜", "Vegetables", "野菜", "蔬菜"), L("水果", "Fruit", "果物", "水果"), L("谷物", "Grain", "穀物", "穀物"), L("礼盒", "Gift boxes", "ギフト箱", "禮盒")],
      statuses: [L("已采收", "Harvested", "収穫済み", "已採收"), L("待采收", "Pending", "収穫待ち", "待採收"), L("缺货", "Out of stock", "在庫切れ", "缺貨")],
      modes: ["removeDuplicates", "subtotal", "pasteSpecial", "textToColumns"],
    },
    {
      key: "events",
      code: "EV",
      org: L("星河活动", "Star River Events", "星河イベント", "星河活動"),
      theme: L("活动现场成本与排期", "event cost and scheduling", "イベント原価と日程", "活動現場成本與排期"),
      context: L("{org} 项目经理要冻结现场清单、比较布置成本，并推算下一场活动的用量。", "{org} project managers need a frozen site list, setup-cost comparison, and a forward estimate for the next event.", "{org} のプロジェクト責任者は現場一覧を固定し、設営原価を比較し、次のイベントの使用量を予測します。", "{org} 專案經理要凍結現場清單、比較布置成本，並推算下一場活動的用量。"),
      groups: [L("布置", "Setup", "設営", "佈置"), L("餐饮", "Catering", "ケータリング", "餐飲"), L("设备", "Equipment", "機材", "設備"), L("摄影", "Photo", "撮影", "攝影")],
      statuses: [L("已确认", "Confirmed", "確定", "已確認"), L("待排期", "Pending", "日程待ち", "待排期"), L("已变更", "Changed", "変更済み", "已變更")],
      modes: ["chart", "goalSeek", "freeze", "forecast"],
    },
    {
      key: "printshop",
      code: "PR",
      org: L("青松印刷", "Pine Print", "青松印刷", "青松印刷"),
      theme: L("印刷批次与交付文件", "print batch and delivery handoff", "印刷ロットと納品ファイル", "印刷批次與交付文件"),
      context: L("{org} 生产协调要设置打印范围、保护可填写数量，并整理交接标签。", "{org} production coordinators need a print area, protected editable quantities, and a clean handoff tab set.", "{org} の生産調整担当は印刷範囲を設定し、入力数量を保護し、引き継ぎタブを整えます。", "{org} 生產協調要設定列印範圍、保護可填寫數量，並整理交接索引標籤。"),
      groups: [L("数码", "Digital", "デジタル", "數位"), L("胶印", "Offset", "オフセット", "膠印"), L("装订", "Binding", "製本", "裝訂"), L("配送", "Delivery", "配送", "配送")],
      statuses: [L("已完成", "Complete", "完了", "已完成"), L("待排产", "Queued", "生産待ち", "待排產"), L("待复核", "Review", "要確認", "待複核")],
      modes: ["print", "protect", "sheets", "sort", "pivot"],
    },
  ];

  function hashSeed(value) {
    let hash = 2166136261;
    String(value).split("").forEach((character) => {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    });
    return hash >>> 0;
  }

  function rng(seed) {
    let value = hashSeed(seed);
    return function next() {
      value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function integer(random, min, max) {
    return min + Math.floor(random() * (max - min + 1));
  }

  function round(value, digits) {
    const factor = Math.pow(10, digits == null ? 0 : digits);
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
  }

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function shanghaiDateKey(date) {
    const value = date || new Date();
    return value.getFullYear() + "-" + pad2(value.getMonth() + 1) + "-" + pad2(value.getDate());
  }

  function parseDateKey(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
    return match ? { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) } : null;
  }

  function ordinal(value) {
    const parts = parseDateKey(value);
    return parts ? Date.UTC(parts.year, parts.month - 1, parts.day) / 86400000 : null;
  }

  function shiftDateKey(value, delta) {
    const parts = parseDateKey(value);
    if (!parts) return shanghaiDateKey();
    const next = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
    next.setUTCDate(next.getUTCDate() + delta);
    return next.getUTCFullYear() + "-" + pad2(next.getUTCMonth() + 1) + "-" + pad2(next.getUTCDate());
  }

  function permutation(size, key) {
    const values = Array.from({ length: size }, (_, index) => index);
    const random = rng(key);
    for (let index = values.length - 1; index > 0; index -= 1) {
      const target = Math.floor(random() * (index + 1));
      const temporary = values[index];
      values[index] = values[target];
      values[target] = temporary;
    }
    return values;
  }

  function fill(template, params) {
    return K.fill(template, params || {});
  }

  function buildModel(scenario, index, bank) {
    const random = rng(bank + "-v13:" + scenario.key + ":" + index);
    const rows = Array.from({ length: 10 }, (_, rowIndex) => {
      const units = integer(random, 8, 92);
      const unitPrice = integer(random, 24, 460);
      const amount = units * unitPrice;
      const cost = round(amount * (0.52 + random() * 0.29), 2);
      const group = scenario.groups[(rowIndex + index) % scenario.groups.length];
      const status = scenario.statuses[(rowIndex + Math.floor(index / 3)) % scenario.statuses.length];
      const code = scenario.code + "-" + String(3100 + index * 10 + rowIndex);
      const month = pad2((rowIndex % 12) + 1);
      const day = pad2(3 + ((rowIndex * 3 + index) % 23));
      return {
        code,
        group,
        units,
        unitPrice,
        amount,
        cost,
        status,
        priority: "P" + ((rowIndex % 3) + 1),
        date: "2026-" + month + "-" + day,
      };
    });
    const focusGroup = scenario.groups[index % scenario.groups.length];
    const focusStatus = scenario.statuses[(index + 1) % scenario.statuses.length];
    const groupRows = rows.filter((row) => row.group["zh-CN"] === focusGroup["zh-CN"]);
    const totalAmount = rows.reduce((total, row) => total + row.amount, 0);
    const totalCost = rows.reduce((total, row) => total + row.cost, 0);
    const maxAmount = Math.max.apply(null, rows.map((row) => row.amount));
    const averageAmount = round(totalAmount / rows.length, 2);
    const focusRow = rows[(index + 3) % rows.length];
    return {
      rows,
      focusGroup,
      focusStatus,
      groupRows,
      totalAmount,
      totalCost,
      maxAmount,
      averageAmount,
      focusRow,
      focusGroupTotal: groupRows.reduce((total, row) => total + row.amount, 0),
      focusGroupCost: groupRows.reduce((total, row) => total + row.cost, 0),
      focusStatusCount: rows.filter((row) => row.status["zh-CN"] === focusStatus["zh-CN"]).length,
      decisionThreshold: Math.round(averageAmount * 0.95),
      org: scenario.org,
      scenario,
      bank,
      index,
    };
  }

  const BASE_HEADERS = [
    L("记录编号", "Record", "記録番号", "紀錄編號"),
    L("分组", "Group", "グループ", "分組"),
    L("数量", "Units", "数量", "數量"),
    L("金额", "Amount", "金額", "金額"),
    L("成本", "Cost", "原価", "成本"),
    L("状态", "Status", "状態", "狀態"),
    L("优先级", "Priority", "優先度", "優先順序"),
    L("日期", "Date", "日付", "日期"),
  ];

  function baseSheet(model, extras) {
    const rows = model.rows.map((row) => [
      row.code,
      row.group,
      row.units,
      row.amount,
      row.cost,
      row.status,
      row.priority,
      row.date,
    ]);
    return K.makeSheet(BASE_HEADERS, rows, extras || {});
  }

  function formulaSheet(model, label) {
    return baseSheet(model, {
      I1: L("检查点", "Checkpoint", "チェック項目", "檢查點"),
      J1: L("结果", "Result", "結果", "結果"),
      I2: label,
    });
  }

  function trainingFrame() {
    return L("季度复盘时，{org} 的这张业务表需要逐项核对。", "During the quarter review, the {org} operating sheet needs a clean check.", "四半期レビューで、{org} の業務表を項目ごとに確認します。", "季度複盤時，{org} 的這張業務表需要逐項核對。");
  }

  function dailyFrame() {
    return L("今天的桌面小任务是核对 {org} 的一张业务表。", "Today's desk task is a quick check of an operating sheet at {org}.", "今日のデスク作業は、{org} の業務表を短時間で確認することです。", "今天的桌面小任務是核對 {org} 的一張業務表。");
  }

  const FORMULA_COPY = {
    total: {
      label: L("全部金额", "Total amount", "全体金額", "全部金額"),
      title: L("汇总全部记录金额", "Total every record amount", "全記録の金額を合計", "彙總全部紀錄金額"),
      instruction: L("在 J2 用 SUM 汇总 D2:D11 的全部金额，结果应覆盖所有记录。", "In J2, use SUM on D2:D11 to total every record amount.", "J2 で SUM を使い、D2:D11 の全金額を合計します。", "在 J2 用 SUM 彙總 D2:D11 的全部金額，結果應涵蓋所有紀錄。"),
      hint: L("参考：=SUM(D2:D11)", "Reference: =SUM(D2:D11)", "参考：=SUM(D2:D11)", "參考：=SUM(D2:D11)"),
      success: L("全部记录金额已汇总，结果与可见数据一致。", "All record amounts are totaled and match the visible data.", "全記録の金額が合計され、表示データと一致しています。", "全部紀錄金額已彙總，結果與可見資料一致。"),
    },
    groupTotal: {
      label: L("分组金额", "Group total", "グループ合計", "分組金額"),
      title: L("汇总指定分组金额", "Total the selected group", "指定グループの金額を合計", "彙總指定分組金額"),
      instruction: L("在 J2 用 SUMIF 对 B2:B11 中等于 {group} 的记录汇总 D 列金额。", "In J2, use SUMIF to total D2:D11 where B2:B11 equals {group}.", "J2 で SUMIF を使い、B2:B11 が {group} の行の D列を合計します。", "在 J2 用 SUMIF 對 B2:B11 中等於 {group} 的紀錄彙總 D 欄金額。"),
      hint: L("参考：=SUMIF(B2:B11,\"{group}\",D2:D11)", "Reference: =SUMIF(B2:B11,\"{group}\",D2:D11)", "参考：=SUMIF(B2:B11,\"{group}\",D2:D11)", "參考：=SUMIF(B2:B11,\"{group}\",D2:D11)"),
      success: L("分组条件与金额区间都正确，合计已对上。", "The group criterion and amount range are correct and the total reconciles.", "グループ条件と金額範囲が正しく、合計も一致しています。", "分組條件與金額範圍都正確，合計已對上。"),
    },
    countGroup: {
      label: L("分组记录数", "Group records", "グループ件数", "分組紀錄數"),
      title: L("统计指定分组记录数", "Count records in the selected group", "指定グループの件数を数える", "統計指定分組紀錄數"),
      instruction: L("在 J2 用 COUNTIF 统计 B2:B11 等于 {group} 的记录数。", "In J2, use COUNTIF to count rows in B2:B11 equal to {group}.", "J2 で COUNTIF を使い、B2:B11 の {group} を数えます。", "在 J2 用 COUNTIF 統計 B2:B11 等於 {group} 的紀錄數。"),
      hint: L("参考：=COUNTIF(B2:B11,\"{group}\")", "Reference: =COUNTIF(B2:B11,\"{group}\")", "参考：=COUNTIF(B2:B11,\"{group}\")", "參考：=COUNTIF(B2:B11,\"{group}\")"),
      success: L("记录数与分组可见行数一致。", "The count matches the visible rows for that group.", "件数はグループの表示行数と一致しています。", "紀錄數與分組可見列數一致。"),
    },
    statusCount: {
      label: L("状态数量", "Status count", "状態件数", "狀態數量"),
      title: L("统计指定状态记录", "Count the selected status", "指定状態の件数を数える", "統計指定狀態紀錄"),
      instruction: L("在 J2 用 COUNTIF 统计 F2:F11 等于 {status} 的记录数。", "In J2, use COUNTIF to count rows in F2:F11 equal to {status}.", "J2 で COUNTIF を使い、F2:F11 の {status} を数えます。", "在 J2 用 COUNTIF 統計 F2:F11 等於 {status} 的紀錄數。"),
      hint: L("参考：=COUNTIF(F2:F11,\"{status}\")", "Reference: =COUNTIF(F2:F11,\"{status}\")", "参考：=COUNTIF(F2:F11,\"{status}\")", "參考：=COUNTIF(F2:F11,\"{status}\")"),
      success: L("状态计数与筛选后的可见记录数一致。", "The status count matches the visible records after filtering.", "状態件数は絞り込み後の表示記録と一致します。", "狀態計數與篩選後的可見紀錄數一致。"),
    },
    average: {
      label: L("平均金额", "Average amount", "平均金額", "平均金額"),
      title: L("计算平均金额", "Calculate the average amount", "平均金額を計算", "計算平均金額"),
      instruction: L("在 J2 用 AVERAGE 计算 D2:D11，并用 ROUND 保留一位小数。", "In J2, use AVERAGE on D2:D11 and ROUND to one decimal.", "J2 で AVERAGE を使い、D2:D11 の平均を ROUND で小数1桁にします。", "在 J2 用 AVERAGE 計算 D2:D11，並用 ROUND 保留一位小數。"),
      hint: L("参考：=ROUND(AVERAGE(D2:D11),1)", "Reference: =ROUND(AVERAGE(D2:D11),1)", "参考：=ROUND(AVERAGE(D2:D11),1)", "參考：=ROUND(AVERAGE(D2:D11),1)"),
      success: L("平均金额已按要求保留一位小数。", "The average is rounded to one decimal as requested.", "平均金額は指定どおり小数1桁になっています。", "平均金額已依要求保留一位小數。"),
    },
    ratio: {
      label: L("成本占比", "Cost ratio", "原価比率", "成本占比"),
      title: L("计算整体成本占收入比", "Calculate the overall cost ratio", "全体の原価収入比を計算", "計算整體成本佔收入比"),
      instruction: L("在 J2 用 SUM 汇总 E 列后除以 D 列合计，并用 ROUND 保留两位小数。", "In J2, divide the SUM of E by the SUM of D and ROUND to two decimals.", "J2 で E列の合計をD列の合計で割り、ROUND で小数2桁にします。", "在 J2 用 SUM 彙總 E 欄後除以 D 欄合計，並用 ROUND 保留兩位小數。"),
      hint: L("参考：=ROUND(SUM(E2:E11)/SUM(D2:D11),2)", "Reference: =ROUND(SUM(E2:E11)/SUM(D2:D11),2)", "参考：=ROUND(SUM(E2:E11)/SUM(D2:D11),2)", "參考：=ROUND(SUM(E2:E11)/SUM(D2:D11),2)"),
      success: L("成本占比按整表口径计算，结果与数据一致。", "The ratio uses whole-table totals and matches the data.", "比率は全体合計で計算され、データと一致しています。", "成本占比依整表定義計算，結果與資料一致。"),
    },
    decision: {
      label: L("业务判断", "Business decision", "業務判断", "業務判斷"),
      title: L("判断分组金额是否达标", "Decide whether the group total is sufficient", "グループ金額が基準を満たすか判断", "判斷分組金額是否達標"),
      instruction: L("在 J2 判断 {group} 的金额合计是否达到 {threshold}，结果应为 TRUE 或 FALSE。", "In J2, decide whether the {group} total reaches {threshold}; return TRUE or FALSE.", "J2 で {group} の合計が {threshold} 以上かを TRUE/FALSE で返します。", "在 J2 判斷 {group} 的金額合計是否達到 {threshold}，結果應為 TRUE 或 FALSE。"),
      hint: L("参考：=SUMIF(B2:B11,\"{group}\",D2:D11)>={threshold}", "Reference: =SUMIF(B2:B11,\"{group}\",D2:D11)>={threshold}", "参考：=SUMIF(B2:B11,\"{group}\",D2:D11)>={threshold}", "參考：=SUMIF(B2:B11,\"{group}\",D2:D11)>={threshold}"),
      success: L("分组金额和业务判断都已核对。", "The group total and business decision both reconcile.", "グループ金額と業務判断の両方が照合できました。", "分組金額和業務判斷都已核對。"),
    },
    lookup: {
      label: L("编号取金额", "Amount by record", "番号から金額", "編號取金額"),
      title: L("按记录编号读取金额", "Read the amount for a record", "記録番号から金額を取得", "依紀錄編號讀取金額"),
      instruction: L("在 J2 用 VLOOKUP 按编号 {code} 在 A2:H11 中查找，并返回第 4 列金额。", "In J2, use VLOOKUP for {code} in A2:H11 and return column 4 amount.", "J2 で VLOOKUP を使い、A2:H11 の {code} から4列目金額を返します。", "在 J2 用 VLOOKUP 依編號 {code} 在 A2:H11 中查找，並傳回第 4 欄金額。"),
      hint: L("参考：=VLOOKUP(\"{code}\",A2:H11,4,FALSE)", "Reference: =VLOOKUP(\"{code}\",A2:H11,4,FALSE)", "参考：=VLOOKUP(\"{code}\",A2:H11,4,FALSE)", "參考：=VLOOKUP(\"{code}\",A2:H11,4,FALSE)"),
      success: L("编号与金额对应正确，精确匹配已启用。", "The record and amount match, with exact matching enabled.", "記録番号と金額が一致し、完全一致も有効です。", "編號與金額對應正確，完全相符已啟用。"),
    },
    maxCheck: {
      label: L("最高金额判断", "Maximum check", "最高額の判定", "最高金額判斷"),
      title: L("判断最高金额是否达到门槛", "Check whether the largest amount reaches the threshold", "最高額が基準に達するか確認", "判斷最高金額是否達到門檻"),
      instruction: L("在 J2 判断 D2:D11 的最大值是否至少为 {threshold}，结果应为 TRUE 或 FALSE。", "In J2, check whether the maximum of D2:D11 is at least {threshold}; return TRUE or FALSE.", "J2 で D2:D11 の最大値が {threshold} 以上かを TRUE/FALSE で返します。", "在 J2 判斷 D2:D11 的最大值是否至少為 {threshold}，結果應為 TRUE 或 FALSE。"),
      hint: L("参考：=MAX(D2:D11)>={threshold}", "Reference: =MAX(D2:D11)>={threshold}", "参考：=MAX(D2:D11)>={threshold}", "參考：=MAX(D2:D11)>={threshold}"),
      success: L("最大值与门槛比较完成，业务判断可直接使用。", "The maximum is compared with the threshold for an actionable decision.", "最大値と基準の比較が完了し、業務判断に使えます。", "最大值與門檻比較完成，業務判斷可直接使用。"),
    },
  };

  function formulaDetails(kind, model) {
    const group = model.focusGroup["zh-CN"];
    const status = model.focusStatus["zh-CN"];
    const threshold = model.decisionThreshold;
    if (kind === "total") {
      return { formula: "=SUM(D2:D11)", expected: model.totalAmount, requiredFunctions: ["SUM"] };
    }
    if (kind === "groupTotal") {
      return { formula: "=SUMIF(B2:B11,\"" + group + "\",D2:D11)", expected: model.focusGroupTotal, requiredFunctions: ["SUMIF"] };
    }
    if (kind === "countGroup") {
      return { formula: "=COUNTIF(B2:B11,\"" + group + "\")", expected: model.groupRows.length, requiredFunctions: ["COUNTIF"] };
    }
    if (kind === "statusCount") {
      return { formula: "=COUNTIF(F2:F11,\"" + status + "\")", expected: model.focusStatusCount, requiredFunctions: ["COUNTIF"] };
    }
    if (kind === "average") {
      return { formula: "=ROUND(AVERAGE(D2:D11),1)", expected: round(model.averageAmount, 1), requiredFunctions: ["ROUND", "AVERAGE"] };
    }
    if (kind === "ratio") {
      return { formula: "=ROUND(SUM(E2:E11)/SUM(D2:D11),2)", expected: round(model.totalCost / model.totalAmount, 2), requiredFunctions: ["ROUND", "SUM"] };
    }
    if (kind === "decision") {
      return {
        formula: "=SUMIF(B2:B11,\"" + group + "\",D2:D11)>=" + threshold,
        expected: model.focusGroupTotal >= threshold,
        requiredFunctions: ["SUMIF"],
      };
    }
    if (kind === "lookup") {
      return {
        formula: "=VLOOKUP(\"" + model.focusRow.code + "\",A2:H11,4,FALSE)",
        expected: model.focusRow.amount,
        requiredFunctions: ["VLOOKUP"],
        code: model.focusRow.code,
      };
    }
    return {
      formula: "=MAX(D2:D11)>=" + threshold,
      expected: model.maxAmount >= threshold,
      requiredFunctions: ["MAX"],
    };
  }

  function makeFormulaStep(kind, model, bank, levelId, stepNo) {
    const copy = FORMULA_COPY[kind];
    const details = formulaDetails(kind, model);
    const params = {
      group: model.focusGroup,
      status: model.focusStatus,
      threshold: model.decisionThreshold,
      code: details.code || model.focusRow.code,
      org: model.org,
    };
    const frame = fill(bank === "training" ? trainingFrame() : dailyFrame(), { org: model.org });
    const instruction = fill(copy.instruction, params);
    const titleText = fill(L("{org}：{title}", "{org}: {title}", "{org}：{title}", "{org}：{title}"), { org: model.org, title: copy.title });
    const lead = fill(L("{frame} {instruction}", "{frame} {instruction}", "{frame} {instruction}", "{frame} {instruction}"), {
      frame,
      instruction,
    });
    const sheet = formulaSheet(model, copy.label);
    const task = K.task({
      id: levelId + "-task-" + stepNo,
      sheet,
      target: "J2",
      taskLabel: copy.label,
      title: titleText,
      lead,
      hint: copy.hint,
      success: copy.success,
      formula: details.formula,
      requiredFunctions: details.requiredFunctions,
      mode: "fixed",
      expected: details.expected,
    });
    return K.sheetStep({
      id: levelId + "-step-" + stepNo,
      title: titleText,
      lead,
      sheet,
      tasks: [task],
      hint: copy.hint,
    });
  }

  function modeKind(mode) {
    if (["sheets", "freeze", "protect", "print", "namedRange", "multiSheet", "audit"].indexOf(mode) >= 0) return "workbook";
    if (["conditional", "validation"].indexOf(mode) >= 0) return "format";
    if (["sort", "advancedFilter", "removeDuplicates", "textToColumns", "pasteSpecial", "subtotal", "consolidate", "import"].indexOf(mode) >= 0) return "data";
    if (["chart", "sparkline", "pivot", "pivotChart"].indexOf(mode) >= 0) return "visual";
    return "analysis";
  }

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
    if (mode === "protect") {
      if (goal.allowEdit) goal.protectRange = goal.allowEdit;
      delete goal.allowEdit;
      delete goal.name;
    }
    if (mode === "audit") {
      const actions = {
        tracePrecedents: "precedents",
        traceDependents: "dependents",
        showFormulas: "showFormulas",
        evaluate: "evaluate",
      };
      goal.auditAction = actions[goal.action] || goal.action;
      if (goal.cell) goal.auditCell = goal.cell;
      delete goal.action;
      delete goal.cell;
      delete goal.sheet;
    }
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
        addDefaults(options, { iconStyle: goal.iconStyle, reverse: goal.reverse });
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
      goal.functionNumber = 9;
      goal.useTopRow = true;
      goal.useLeftColumn = true;
      delete goal.sources;
      delete goal.destination;
      delete goal.function;
      delete goal.topRow;
      delete goal.leftColumn;
    }
    if (mode === "sparkline") {
      goal.sparklineRange = goal.dataRange;
      goal.targetCell = goal.location;
      goal.sparklineType = goal.type || "line";
      delete goal.dataRange;
      delete goal.location;
      delete goal.type;
      delete goal.showHigh;
      delete goal.showLow;
    }
    if (mode === "chart") {
      addChoices(options, { chartType: ["column", "bar", "line", "pie", "area", "scatter", "combo"] });
    }
    if (mode === "pivot" || mode === "pivotChart") {
      if (goal.showAs === "percentOfTotal") goal.showAs = "percentOfGrandTotal";
      if (goal.groupDate === "months") goal.groupDate = "month";
    }
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
    return goal;
  }

  function makeLabStep(spec, model, bank, levelId, stepNo) {
    const frame = fill(bank === "training" ? trainingFrame() : dailyFrame(), { org: model.org });
    const action = fill(spec.action, {
      group: model.focusGroup,
      status: model.focusStatus,
      threshold: model.decisionThreshold,
      theme: model.scenario.theme,
      type: spec.chartType || "",
    });
    const lead = fill(L("{frame} {action}", "{frame} {action}", "{frame} {action}", "{frame} {action}"), {
      frame,
      action,
    });
    const title = fill(L("{org}：{title}", "{org}: {title}", "{org}：{title}", "{org}：{title}"), {
      org: model.org,
      title: spec.title,
    });
    const labSpec = Object.assign({
      kind: modeKind(spec.mode),
      mode: spec.mode,
    }, spec.lab);
    labSpec.goal = alignGoal(labSpec.mode, labSpec.goal || {}, labSpec.options || (labSpec.options = {}));
    return D.labStep(
      levelId + "-step-" + stepNo,
      title,
      lead,
      labSpec,
      spec.hint,
      spec.success
    );
  }

  function chartBlock(model) {
    const extras = {
      K1: L("期间", "Period", "期間", "期間"),
      L1: L("收入", "Revenue", "収入", "收入"),
      M1: L("成本", "Cost", "原価", "成本"),
      N1: L("毛利率", "Margin", "粗利益率", "毛利率"),
    };
    model.rows.slice(0, 6).forEach((row, index) => {
      extras["K" + (index + 2)] = "M" + (index + 1);
      extras["L" + (index + 2)] = row.amount;
      extras["M" + (index + 2)] = round(row.cost, 2);
      extras["N" + (index + 2)] = round((row.amount - row.cost) / row.amount, 3);
    });
    return extras;
  }

  function buildLabStep(mode, model, bank, levelId, stepNo) {
    const scenario = model.scenario;
    const seed = hashSeed(levelId + ":" + mode);
    const variant = seed % 7;
    const baseRanges = { dataTable: "A1:H11", summary: "I1:J2" };

    if (mode === "sheets") {
      const operations = [
        {
          op: "add",
          name: "Case_Summary",
          action: L("新增一张名为 Case_Summary 的工作表，用于交接汇总。", "Add a worksheet named Case_Summary for the handoff summary.", "Case_Summary という集計用シートを追加します。", "新增一張名為 Case_Summary 的工作表，用於交接彙總。"),
          hint: L("使用标签栏的新建工作表，再改为指定名称。", "Use the new-sheet control and rename the tab.", "新しいシートを作成し、タブ名を変更します。", "使用索引標籤列的新增工作表，再改為指定名稱。"),
          success: L("汇总标签已新增，原表未被改动。", "The summary tab was added and the source sheet is unchanged.", "集計タブが追加され、元シートは変わっていません。", "彙總索引標籤已新增，原工作表未被改動。"),
          title: L("新增交接汇总页", "Add a handoff summary tab", "引き継ぎ集計タブを追加", "新增交接彙總頁"),
        },
        {
          op: "rename",
          name: "Draft",
          to: "Case_Review",
          action: L("把 Draft 工作表重命名为 Case_Review。", "Rename the Draft worksheet to Case_Review.", "Draft シートを Case_Review に変更します。", "把 Draft 工作表重新命名為 Case_Review。"),
          hint: L("双击标签后输入完整名称。", "Double-click the tab and enter the full name.", "タブをダブルクリックして正式名を入力します。", "按兩下索引標籤後輸入完整名稱。"),
          success: L("工作表名称与交接约定一致。", "The sheet name now matches the handoff convention.", "シート名が引き継ぎルールと一致しました。", "工作表名稱與交接約定一致。"),
          title: L("重命名临时工作表", "Rename the temporary worksheet", "一時シートの名前を変更", "重新命名暫存工作表"),
        },
        {
          op: "copy",
          name: "Base",
          to: "Case_Copy",
          action: L("复制 Base 工作表，并命名为 Case_Copy，保留原表。", "Copy the Base worksheet as Case_Copy while keeping the original.", "Base シートを Case_Copy として複製し、元を残します。", "複製 Base 工作表並命名為 Case_Copy，保留原表。"),
          hint: L("使用“移动或复制”并勾选“建立副本”。", "Use Move or Copy and tick Create a copy.", "「移動またはコピー」で「コピーを作成する」を選びます。", "使用「移動或複製」並勾選「建立副本」。"),
          success: L("副本已生成，原表仍保留。", "The copy exists and the original remains.", "複製が作成され、元も残っています。", "副本已產生，原表仍保留。"),
          title: L("复制底稿为独立版本", "Copy the base as a separate version", "下書きを別版として複製", "複製底稿為獨立版本"),
        },
        {
          op: "move",
          name: "Notes",
          position: 2,
          action: L("把 Notes 工作表移到第二位，让 Base 排在前面。", "Move Notes to the second position so Base appears first.", "Notes を2番目へ移動し、Base を先頭にします。", "把 Notes 工作表移到第二位，讓 Base 排在前面。"),
          hint: L("拖动标签或使用移动菜单，目标是 Base 之后。", "Drag the tab or use the Move menu to place it after Base.", "タブをドラッグするか移動メニューで Base の後ろに置きます。", "拖曳索引標籤或使用移動功能表，目標是 Base 之後。"),
          success: L("标签顺序已符合阅读顺序。", "Tab order now matches the reading order.", "タブ順が読み順と一致しました。", "索引標籤順序已符合閱讀順序。"),
          title: L("调整标签阅读顺序", "Reorder the tabs", "タブの表示順を整える", "調整索引標籤閱讀順序"),
        },
        {
          op: "hide",
          name: "Archive",
          action: L("隐藏 Archive 工作表，但不要删除它。", "Hide the Archive worksheet without deleting it.", "Archive シートを削除せず非表示にします。", "隱藏 Archive 工作表，但不要刪除它。"),
          hint: L("右键标签选择“隐藏”。", "Right-click the tab and choose Hide.", "タブを右クリックして「非表示」を選びます。", "右鍵索引標籤選擇「隱藏」。"),
          success: L("归档表已隐藏，其他内容保持可见。", "The archive tab is hidden and the rest remains visible.", "アーカイブタブが非表示になり、他は表示されたままです。", "封存表已隱藏，其他內容保持可見。"),
          title: L("隐藏归档标签", "Hide the archive tab", "アーカイブタブを非表示", "隱藏封存索引標籤"),
        },
        {
          op: "unhide",
          name: "Archive",
          action: L("取消隐藏 Archive 工作表，便于复核旧记录。", "Unhide the Archive worksheet for reviewing older records.", "Archive シートを再表示し、旧記録を確認します。", "取消隱藏 Archive 工作表，便於複核舊紀錄。"),
          hint: L("右键可见标签，使用“取消隐藏”。", "Right-click a visible tab and use Unhide.", "表示中のタブを右クリックし「再表示」を使います。", "右鍵可見索引標籤，使用「取消隱藏」。"),
          success: L("归档表已恢复可见。", "The archive sheet is visible again.", "アーカイブシートが再表示されました。", "封存表已恢復可見。"),
          title: L("恢复归档标签", "Restore the archive tab", "アーカイブタブを再表示", "恢復封存索引標籤"),
        },
        {
          op: "tabColor",
          name: "Base",
          action: L("把 Base 标签颜色设为 green，作为汇总来源的标记。", "Set the Base tab to green to mark it as the summary source.", "Base タブを緑にし、集計元の印を付けます。", "把 Base 索引標籤色彩設為綠色，作為彙總來源標記。"),
          hint: L("右键标签，打开标签颜色。", "Right-click the tab and open Tab Color.", "タブを右クリックしてタブの色を開きます。", "右鍵索引標籤，開啟索引標籤色彩。"),
          success: L("Base 标签已按约定变为绿色。", "The Base tab now follows the green convention.", "Base タブが緑のルールに従いました。", "Base 索引標籤已依約定變為綠色。"),
          title: L("标记汇总来源标签", "Mark the summary source tab", "集計元タブを色で示す", "標記彙總來源索引標籤"),
        },
      ];
      const chosen = operations[variant];
      const sheets = [{ name: "Base", cells: baseSheet(model), tabColor: "blue", hidden: false }];
      if (chosen.op === "rename") sheets.push({ name: "Draft", cells: { A1: L("草稿", "Draft", "下書き", "草稿") }, tabColor: "none", hidden: false });
      if (chosen.op === "copy") sheets.push({ name: "Notes", cells: { A1: L("说明", "Note", "メモ", "說明") }, tabColor: "none", hidden: false });
      if (chosen.op === "move") sheets.unshift({ name: "Notes", cells: { A1: L("说明", "Note", "メモ", "說明") }, tabColor: "none", hidden: false });
      if (chosen.op === "hide") sheets.push({ name: "Archive", cells: { A1: L("归档", "Archive", "アーカイブ", "封存") }, tabColor: "none", hidden: false });
      if (chosen.op === "unhide") sheets.push({ name: "Archive", cells: { A1: L("归档", "Archive", "アーカイブ", "封存") }, tabColor: "none", hidden: true });
      const goal = chosen.op === "add"
        ? { operation: "add", name: chosen.name }
        : chosen.op === "rename"
          ? { operation: "rename", from: chosen.name, to: chosen.to }
          : chosen.op === "copy"
            ? { operation: "copy", from: chosen.name, to: chosen.to }
            : chosen.op === "move"
              ? { operation: "move", name: chosen.name, position: chosen.position }
              : chosen.op === "tabColor"
                ? { operation: "tabColor", name: chosen.name, color: "green" }
                : { operation: chosen.op, name: chosen.name };
      return {
        mode,
        title: chosen.title,
        action: chosen.action,
        hint: chosen.hint,
        success: chosen.success,
        lab: {
          workbook: { active: chosen.op === "move" ? "Notes" : "Base", sheets },
          ranges: { source: "Base!A1:H11" },
          options: { operation: chosen.op },
          goal,
        },
      };
    }

    if (mode === "freeze") {
      return {
        mode,
        title: L("冻结表头和首列", "Freeze the header and first column", "表頭と先頭列を固定", "凍結表頭和首欄"),
        action: L("在 Base 工作表选中 B2，并冻结到第 1 行和 A 列。", "On Base, select B2 and freeze through row 1 and column A.", "Base で B2 を選び、1行目とA列まで固定します。", "在 Base 工作表選取 B2，並凍結至第 1 列和 A 欄。"),
        hint: L("先选 B2，再使用视图中的冻结窗格。", "Select B2 first, then use Freeze Panes on the View tab.", "先に B2 を選び、表示タブのウィンドウ枠の固定を使います。", "先選 B2，再使用檢視中的凍結窗格。"),
        success: L("滚动时表头和首列保持可见。", "The header and first column stay visible while scrolling.", "スクロールしても表頭と先頭列が見えます。", "捲動時表頭和首欄保持可見。"),
        lab: {
          workbook: { active: "Base", sheets: [{ name: "Base", cells: baseSheet(model), tabColor: "blue", hidden: false }] },
          ranges: { dataTable: "Base!A1:H11" },
          options: { freezeAt: "B2" },
          goal: { operation: "freeze", cell: "B2" },
        },
      };
    }

    if (mode === "protect") {
      return {
        mode,
        title: L("保护公式并开放数量列", "Protect formulas and open the quantity column", "数式を保護し数量列を開く", "保護公式並開放數量欄"),
        action: L("保护 Base 工作表，只允许编辑 C2:C11 的数量。", "Protect Base and allow edits only in the quantity range C2:C11.", "Base を保護し、C2:C11 の数量だけ編集可能にします。", "保護 Base 工作表，只允許編輯 C2:C11 的數量。"),
        hint: L("先解锁输入区，再保护工作表。", "Unlock the input area before protecting the sheet.", "入力範囲をロック解除してからシートを保護します。", "先解除輸入區鎖定，再保護工作表。"),
        success: L("公式已锁定，数量列仍可填写。", "Formulas are locked while the quantity column remains editable.", "数式は保護され、数量列は入力可能です。", "公式已鎖定，數量欄仍可填寫。"),
        lab: {
          workbook: { active: "Base", sheets: [{ name: "Base", cells: baseSheet(model), tabColor: "blue", hidden: false }] },
          ranges: { allowEdit: "Base!C2:C11", dataTable: "Base!A1:H11" },
          options: { scope: "sheet", allowEdit: "C2:C11" },
          goal: { operation: "protect", scope: "sheet", name: "Base", allowEdit: "C2:C11" },
        },
      };
    }

    if (mode === "print") {
      return {
        mode,
        title: L("设置横向打印报告", "Set a landscape print report", "横向きの印刷レポートを設定", "設定橫向列印報告"),
        action: L("把 Base 设为 A4 横向、打印 A1:H11、重复第 1 行、缩放 85% 并打开网格线。", "Set Base to A4 landscape, print A1:H11, repeat row 1, scale 85%, and turn on gridlines.", "Base をA4横、印刷範囲 A1:H11、1行目を繰り返し、85%拡大、グリッド線ありにします。", "把 Base 設為 A4 橫向、列印 A1:H11、重複第 1 列、縮放 85% 並開啟格線。"),
        hint: L("页面设置中同时检查方向、范围、标题和缩放。", "Check orientation, range, titles, and scaling together in Page Setup.", "ページ設定で向き・範囲・タイトル・拡大縮小をまとめて確認します。", "版面設定中同時檢查方向、範圍、標題和縮放。"),
        success: L("打印设置完整，预览会重复表头。", "Print settings are complete and the preview repeats the header.", "印刷設定がそろい、プレビューで表頭が繰り返されます。", "列印設定完整，預覽會重複表頭。"),
        lab: {
          workbook: { active: "Base", sheets: [{ name: "Base", cells: baseSheet(model), tabColor: "blue", hidden: false }] },
          ranges: { printRange: "Base!A1:H11" },
          options: { orientation: "landscape", paper: "A4" },
          goal: { operation: "print", orientation: "landscape", paper: "A4", printArea: "A1:H11", printTitles: "1:1", scale: 85, gridlines: true },
        },
      };
    }

    if (mode === "namedRange") {
      return {
        mode,
        title: L("建立可复用的数据名称", "Create a reusable data name", "再利用できるデータ名を作成", "建立可重複使用的資料名稱"),
        action: L("新建名称 Case_Data，引用 Base!$C$2:$D$11，供汇总公式直接使用。", "Create Case_Data referring to Base!$C$2:$D$11 for summary formulas.", "Case_Data を作成し、Base!$C$2:$D$11 を参照させます。", "新增名稱 Case_Data，參照 Base!$C$2:$D$11，供彙總公式直接使用。"),
        hint: L("名称不能有空格，引用范围使用绝对列标。", "Use no spaces in the name and absolute column references.", "名前に空白を入れず、絶対列参照を使います。", "名稱不能有空格，參照範圍使用絕對欄參照。"),
        success: L("命名区域已指向数量和金额数据。", "The named range points to the quantity and amount data.", "名前付き範囲が数量と金額のデータを指しています。", "具名範圍已指向數量和金額資料。"),
        lab: {
          workbook: { active: "Base", sheets: [{ name: "Base", cells: baseSheet(model), tabColor: "blue", hidden: false }] },
          ranges: { namedSource: "Base!C2:D11" },
          options: { name: "Case_Data", refersTo: "Base!$C$2:$D$11" },
          goal: { operation: "namedRange", name: "Case_Data", refersTo: "Base!$C$2:$D$11" },
        },
      };
    }

    if (mode === "multiSheet") {
      const sheetFor = (shift) => {
        const rows = model.rows.map((row, index) => [L("批次", "Batch", "ロット", "批次") + " " + (index + 1), round(row.amount * (0.9 + shift * 0.05), 2)]);
        return K.makeSheet([L("项目", "Item", "項目", "項目"), L("收入", "Revenue", "収入", "收入")], rows);
      };
      return {
        mode,
        title: L("用 3-D 公式汇总三期数据", "Total three periods with a 3-D formula", "3D数式で3期間を集計", "用 3D 公式彙總三期資料"),
        action: L("在 Summary!B2 用 =SUM(P1:P3!D2:D11) 汇总三期金额。", "In Summary!B2, total the three periods with =SUM(P1:P3!D2:D11).", "Summary!B2 に =SUM(P1:P3!D2:D11) を入力し、3期間を合計します。", "在 Summary!B2 用 =SUM(P1:P3!D2:D11) 彙總三期金額。"),
        hint: L("首表:末表!区域，工作表顺序必须正确。", "Use first:last!range with the sheets in the right order.", "先頭:末尾!範囲 と書き、シート順を確認します。", "首表:末表!範圍，工作表順序必須正確。"),
        success: L("三期金额已由一条 3-D 公式汇总。", "One 3-D formula totals all three periods.", "1つの3D数式で3期間が集計されました。", "三期金額已由一條 3D 公式彙總。"),
        lab: {
          workbook: {
            active: "Summary",
            sheets: [
              { name: "P1", cells: sheetFor(0), tabColor: "blue", hidden: false },
              { name: "P2", cells: sheetFor(1), tabColor: "blue", hidden: false },
              { name: "P3", cells: sheetFor(2), tabColor: "blue", hidden: false },
              { name: "Summary", cells: { A1: L("汇总", "Summary", "集計", "彙總"), A2: L("三期合计", "Three-period total", "3期間合計", "三期合計") }, tabColor: "green", hidden: false },
            ],
          },
          ranges: { periods: "P1:P3!D2:D11", target: "Summary!B2" },
          options: { formula: "=SUM(P1:P3!D2:D11)" },
          goal: { operation: "formula", sheet: "Summary", cell: "B2", formula: "=SUM(P1:P3!D2:D11)" },
        },
      };
    }

    if (mode === "audit") {
      const actions = [
        { action: "tracePrecedents", cell: "J2", label: L("追踪引用单元格", "Trace precedents", "参照元の追跡", "追蹤前導儲存格") },
        { action: "traceDependents", cell: "D2", label: L("追踪从属单元格", "Trace dependents", "参照先の追跡", "追蹤從屬儲存格") },
        { action: "showFormulas", cell: "", label: L("显示公式", "Show formulas", "数式の表示", "顯示公式") },
        { action: "evaluate", cell: "J2", label: L("求值公式", "Evaluate formula", "数式の評価", "求值公式") },
      ];
      const chosen = actions[variant % actions.length];
      const cells = baseSheet(model, {
        I1: L("公式检查", "Formula check", "数式チェック", "公式檢查"),
        J1: L("合计", "Total", "合計", "合計"),
        J2: "=SUM(D2:D11)",
      });
      return {
        mode,
        title: chosen.label,
        action: L("在 Base 表使用指定审计工具检查合计公式的来源或依赖。", "Use the requested auditing tool on Base to inspect the total formula's sources or dependents.", "Base で指定の監査ツールを使い、合計式の参照元または参照先を確認します。", "在 Base 表使用指定稽核工具檢查合計公式的來源或依賴。"),
        hint: L("先选中相关单元格，再从公式选项卡选择审计命令。", "Select the relevant cell first, then choose the audit command on the Formulas tab.", "対象セルを選び、数式タブの監査コマンドを実行します。", "先選取相關儲存格，再從公式索引標籤選擇稽核命令。"),
        success: L("公式关系已显示，合计来源或下游影响可追踪。", "The formula relationship is visible and the total's sources or downstream impact can be traced.", "数式の関係が表示され、合計の参照元または下流影響を追跡できます。", "公式關係已顯示，合計來源或下游影響可追蹤。"),
        lab: {
          workbook: { active: "Base", sheets: [{ name: "Base", cells, tabColor: "blue", hidden: false }] },
          ranges: { dataTable: "Base!A1:H11", total: "Base!J2" },
          options: { action: chosen.action, cell: chosen.cell },
          goal: chosen.action === "showFormulas"
            ? { operation: "audit", action: chosen.action, sheet: "Base" }
            : { operation: "audit", action: chosen.action, cell: chosen.cell },
        },
      };
    }

    if (mode === "conditional") {
      const rules = [
        {
          goal: { operation: "conditional", range: "D2:D11", ruleType: "cellValue", operator: "greaterThan", value1: model.decisionThreshold, fill: "#FFC7CE", font: "#9C0006" },
          title: L("标出高于门槛的金额", "Highlight amounts above the threshold", "基準超の金額を強調", "標出高於門檻的金額"),
          action: L("对 D2:D11 建立单元格值规则，大于 {threshold} 时使用浅红填充和深红字体。", "Apply a cell-value rule to D2:D11: values above {threshold} use light-red fill and dark-red font.", "D2:D11 にセルの値ルールを作成し、{threshold} 超を淡赤の塗りと濃赤フォントにします。", "對 D2:D11 建立儲存格值規則，大於 {threshold} 時使用淺紅填色和深紅字型。"),
          hint: L("使用突出显示单元格规则中的“大于”。", "Use Highlight Cells Rules, Greater Than.", "セルの強調表示ルールの「次の値より大きい」を使います。", "使用醒目提示儲存格規則中的「大於」。"),
          success: L("高额记录已按门槛标出。", "High amounts are highlighted at the threshold.", "基準を超える金額が強調されました。", "高額紀錄已依門檻標出。"),
        },
        {
          goal: { operation: "conditional", range: "F2:F11", ruleType: "textContains", text: model.focusStatus, fill: "#FFEB9C", font: "#9C5700" },
          title: L("突出关注状态", "Highlight the watch status", "要注意状態を強調", "突出關注狀態"),
          action: L("对 F2:F11 建立文本包含规则，突出 {status}，使用浅黄填充和棕色字体。", "Apply a text-contains rule to F2:F11 for {status} with amber fill and brown font.", "F2:F11 に {status} を含む文字ルールを作成し、淡黄の塗りと茶色フォントにします。", "對 F2:F11 建立包含文字規則，突出 {status}，使用淺黃填色和棕色字型。"),
          hint: L("选择“文本包含”，不要用“等于”。", "Choose Text Contains rather than Equal To.", "「文字列を含む」を選び、「等しい」は使いません。", "選擇「包含文字」，不要用「等於」。"),
          success: L("关注状态已一致高亮。", "The watch status is highlighted consistently.", "要注意状態が一貫して強調されています。", "關注狀態已一致醒目提示。"),
        },
        {
          goal: { operation: "conditional", range: "D2:D11", ruleType: "dataBar", color: "#5B9BD5", showValue: true },
          title: L("用数据条比较金额", "Compare amounts with data bars", "データバーで金額を比較", "用資料橫條比較金額"),
          action: L("对 D2:D11 添加蓝色数据条并保留数值。", "Add blue data bars to D2:D11 while keeping the values visible.", "D2:D11 に青いデータバーを追加し、数値を表示したままにします。", "對 D2:D11 加入藍色資料橫條並保留數值。"),
          hint: L("数据条在条件格式菜单中。", "Data Bars are in the Conditional Formatting menu.", "データバーは条件付き書式メニューにあります。", "資料橫條在設定格式化的條件功能表中。"),
          success: L("金额大小已用数据条表现。", "Amount magnitudes are shown with data bars.", "金額の大小がデータバーで示されました。", "金額大小已用資料橫條表現。"),
        },
        {
          goal: { operation: "conditional", range: "D2:D11", ruleType: "colorScale", minColor: "#F8696B", midColor: "#FFEB84", maxColor: "#63BE7B" },
          title: L("用色阶显示金额分布", "Show amount distribution with a color scale", "カラースケールで金額分布を表示", "用色階顯示金額分布"),
          action: L("对 D2:D11 建立三色色阶。", "Create a three-color scale on D2:D11.", "D2:D11 に3色のカラースケールを作成します。", "對 D2:D11 建立三色色階。"),
          hint: L("使用红、黄、绿三色色阶。", "Use red, yellow, and green stops.", "赤・黄・緑の3色を使います。", "使用紅、黃、綠三色色階。"),
          success: L("金额分布已按色阶显示。", "Amount distribution is shown with the color scale.", "金額分布がカラースケールで表示されました。", "金額分布已依色階顯示。"),
        },
        {
          goal: { operation: "conditional", range: "D2:D11", ruleType: "iconSet", iconStyle: "3TrafficLights", reverse: false },
          title: L("用交通灯标记金额", "Use traffic lights for amounts", "信号アイコンで金額を示す", "用交通燈標記金額"),
          action: L("对 D2:D11 应用三色交通灯图标集。", "Apply the three-traffic-light icon set to D2:D11.", "D2:D11 に3色信号アイコンセットを適用します。", "對 D2:D11 套用三色交通燈圖示集。"),
          hint: L("图标集在条件格式中，不要选色阶。", "Choose Icon Sets, not Color Scales.", "アイコンセットを選び、カラースケールと間違えないようにします。", "圖示集在設定格式化的條件中，不要選色階。"),
          success: L("金额等级已用交通灯表达。", "Amount bands now use traffic lights.", "金額帯が信号アイコンで示されました。", "金額等級已用交通燈表達。"),
        },
        {
          goal: { operation: "conditional", range: "A2:F11", ruleType: "formula", formula: "=$D2>$K$2", fill: "#FFF2CC", font: "#7F6000" },
          title: L("整行标记高额记录", "Highlight high-amount rows", "高額行を全体で強調", "整列標記高額紀錄"),
          action: L("对 A2:F11 建立公式规则 =$D2>$K$2，整行使用浅黄填充。K2 是门槛。", "Apply the formula rule =$D2>$K$2 to A2:F11 to highlight whole rows, using K2 as the threshold.", "A2:F11 に =$D2>$K$2 の数式ルールを作り、K2 を基準に高額行を強調します。", "對 A2:F11 建立公式規則 =$D2>$K$2，整列使用淺黃填色。K2 是門檻。"),
          hint: L("锁定 D 列，公式以选区左上角 A2 为基准。", "Lock column D and write the formula relative to A2.", "D列を固定し、選択範囲左上の A2 を基準に式を書きます。", "鎖定 D 欄，公式以選取範圍左上角 A2 為基準。"),
          success: L("高额记录整行突出，门槛引用正确。", "High-amount rows are highlighted with the correct threshold reference.", "高額行が強調され、基準参照も正しいです。", "高額紀錄整列突出，門檻參照正確。"),
        },
      ];
      const chosen = rules[variant % rules.length];
      return {
        mode,
        title: chosen.title,
        action: fill(chosen.action, { threshold: model.decisionThreshold, status: model.focusStatus }),
        hint: chosen.hint,
        success: chosen.success,
        lab: {
          sheet: baseSheet(model, {
            K1: L("门槛", "Threshold", "基準値", "門檻"),
            K2: model.decisionThreshold,
          }),
          ranges: { dataTable: "A1:F11", threshold: "K1:K2" },
          options: { ruleType: chosen.goal.ruleType },
          goal: chosen.goal,
        },
      };
    }

    if (mode === "validation") {
      const sheet = baseSheet(model, {
        K1: L("可选分组", "Allowed groups", "選択可能なグループ", "可選分組"),
        K2: scenario.groups[0],
        K3: scenario.groups[1],
        K4: scenario.groups[2],
        K5: scenario.groups[3],
      });
      if (variant % 3 === 0) {
        return {
          mode,
          title: L("限制分组为清单选择", "Restrict groups to a list", "グループを一覧から選択", "限制分組為清單選擇"),
          action: L("在 B2:B20 建立列表验证，来源为 $K$2:$K$5，并设置输入提示与停止错误。", "Apply list validation to B2:B20 from $K$2:$K$5 with an input prompt and Stop error.", "B2:B20 に $K$2:$K$5 のリスト入力規則を作り、入力メッセージと停止エラーを設定します。", "在 B2:B20 建立清單驗證，來源為 $K$2:$K$5，並設定輸入提示與停止錯誤。"),
          hint: L("允许类型选序列，来源写绝对区域。", "Choose List and enter an absolute source range.", "リストを選び、絶対範囲を指定します。", "允許類型選序列，來源寫絕對範圍。"),
          success: L("分组列现在只能从清单选择。", "The group column now accepts list values only.", "グループ列は一覧からのみ選択できます。", "分組欄現在只能從清單選擇。"),
          lab: {
            sheet,
            ranges: { groupList: "K2:K5", validationRange: "B2:B20" },
            options: { allow: "list", source: "=$K$2:$K$5" },
            goal: {
              operation: "validation", range: "B2:B20", allow: "list", source: "=$K$2:$K$5",
              inputTitle: L("选择分组", "Select group", "グループを選択", "選擇分組"),
              inputMessage: L("请从清单中选择。", "Choose from the list.", "一覧から選択してください。", "請從清單中選擇。"),
              errorStyle: "stop",
              errorTitle: L("分组无效", "Invalid group", "無効なグループ", "分組無效"),
              errorMessage: L("请使用 K2:K5 中的分组。", "Use a group from K2:K5.", "K2:K5 のグループを使ってください。", "請使用 K2:K5 中的分組。"),
            },
          },
        };
      }
      if (variant % 3 === 1) {
        return {
          mode,
          title: L("限制数量范围", "Restrict the quantity range", "数量範囲を制限", "限制數量範圍"),
          action: L("在 C2:C20 限制整数 0 到 999，并设置说明范围的提示和错误。", "Restrict C2:C20 to whole numbers from 0 to 999 with clear prompt and error messages.", "C2:C20 を0〜999の整数に制限し、範囲を説明するメッセージを設定します。", "在 C2:C20 限制整數 0 到 999，並設定說明範圍的提示和錯誤。"),
          hint: L("允许整数，比较方式选介于。", "Allow Whole Number and use Between.", "整数を選び、「次の値の間」を使います。", "允許整數，比較方式選介於。"),
          success: L("数量列只接受 0 到 999 的整数。", "The quantity column accepts whole numbers from 0 to 999.", "数量列は0〜999の整数だけを受け付けます。", "數量欄只接受 0 到 999 的整數。"),
          lab: {
            sheet,
            ranges: { quantityRange: "C2:C20" },
            options: { allow: "whole", operator: "between", minimum: 0, maximum: 999 },
            goal: {
              operation: "validation", range: "C2:C20", allow: "whole", operator: "between", minimum: 0, maximum: 999,
              inputTitle: L("填写数量", "Enter quantity", "数量を入力", "填寫數量"),
              inputMessage: L("请输入 0 到 999 的整数。", "Enter a whole number from 0 to 999.", "0〜999の整数を入力してください。", "請輸入 0 到 999 的整數。"),
              errorStyle: "stop",
              errorTitle: L("数量超出范围", "Quantity out of range", "数量が範囲外", "數量超出範圍"),
              errorMessage: L("请改为规定范围内的整数。", "Enter a whole number within the allowed range.", "範囲内の整数にしてください。", "請改為規定範圍內的整數。"),
            },
          },
        };
      }
      return {
        mode,
        title: L("防止记录编号重复", "Prevent duplicate record IDs", "記録番号の重複を防ぐ", "防止紀錄編號重複"),
        action: L("在 A2:A20 建立自定义验证，用 COUNTIF 确保编号只出现一次。", "Use custom validation in A2:A20 with COUNTIF to keep each ID unique.", "A2:A20 に COUNTIF のユーザー設定入力規則を使い、番号を一意にします。", "在 A2:A20 建立自訂驗證，用 COUNTIF 確保編號只出現一次。"),
        hint: L("公式为 =COUNTIF($A$2:$A$20,A2)=1。", "Use =COUNTIF($A$2:$A$20,A2)=1.", "式は =COUNTIF($A$2:$A$20,A2)=1 です。", "公式為 =COUNTIF($A$2:$A$20,A2)=1。"),
        success: L("重复编号会被阻止。", "Duplicate IDs are blocked.", "重複番号が止められます。", "重複編號會被阻止。"),
        lab: {
          sheet,
          ranges: { idRange: "A2:A20" },
          options: { allow: "custom", formula: "=COUNTIF($A$2:$A$20,A2)=1" },
          goal: {
            operation: "validation", range: "A2:A20", allow: "custom", formula: "=COUNTIF($A$2:$A$20,A2)=1",
            inputTitle: L("记录编号", "Record ID", "記録番号", "紀錄編號"),
            inputMessage: L("请输入唯一编号。", "Enter a unique ID.", "一意の番号を入力してください。", "請輸入唯一編號。"),
            errorStyle: "stop",
            errorTitle: L("编号重复", "Duplicate ID", "番号が重複", "編號重複"),
            errorMessage: L("该编号已存在，请核对原表。", "This ID already exists; check the source table.", "この番号は既にあります。元表を確認してください。", "該編號已存在，請核對原表。"),
          },
        },
      };
    }

    if (mode === "sort") {
      const custom = variant % 2 === 1;
      return {
        mode,
        title: custom ? L("按优先级自定义排序", "Sort by custom priority order", "優先度のユーザー設定順", "依優先順序自訂排序") : L("按金额和分组多层排序", "Sort by amount and group", "金額とグループで多段階並べ替え", "依金額和分組多層排序"),
        action: custom
          ? L("对 A1:H11 按 G 列自定义顺序 P1、P2、P3 排序。", "Sort A1:H11 by column G in the custom order P1, P2, P3.", "A1:H11 をG列の P1、P2、P3 のユーザー設定順で並べ替えます。", "對 A1:H11 依 G 欄自訂順序 P1、P2、P3 排序。")
          : L("对 A1:H11 先按金额 D 列降序，再按分组 B 列升序排序。", "Sort A1:H11 by Amount D descending, then Group B ascending.", "A1:H11 を金額D列の降順、グループB列の昇順で並べ替えます。", "對 A1:H11 先依金額 D 欄遞減，再依分組 B 欄遞增排序。"),
        hint: L("排序范围必须包含完整记录，并确认表头。", "Sort whole records and confirm headers.", "行全体を並べ替え、表頭ありを確認します。", "排序範圍必須包含完整紀錄，並確認表頭。"),
        success: L("排序顺序和记录完整性都正确。", "The order and record integrity are correct.", "順序と行のまとまりが正しいです。", "排序順序和紀錄完整性都正確。"),
        lab: {
          sheet: baseSheet(model),
          ranges: { dataTable: "A1:H11" },
          options: { hasHeaders: true },
          goal: custom
            ? { operation: "sort", range: "A1:H11", levels: [{ column: "G", order: "custom", customList: ["P1", "P2", "P3"] }], hasHeaders: true }
            : { operation: "sort", range: "A1:H11", levels: [{ column: "D", order: "desc" }, { column: "B", order: "asc" }], hasHeaders: true },
        },
      };
    }

    if (mode === "advancedFilter") {
      return {
        mode,
        title: L("把指定分组和状态复制到表外", "Copy a group and status outside the table", "指定グループと状態を表外へ抽出", "把指定分組和狀態複製到表外"),
        action: L("以 K1:L2 为条件，筛选 A1:H11 中分组为 {group}、状态为 {status} 的记录，并复制到 N1。", "Use K1:L2 as criteria for {group} and {status} in A1:H11 and copy results to N1.", "K1:L2 を条件に A1:H11 から {group}・{status} を抽出し、N1 へコピーします。", "以 K1:L2 為條件，篩選 A1:H11 中分組為 {group}、狀態為 {status} 的紀錄，並複製到 N1。"),
        hint: L("条件区域表头必须与源表一致。", "Criteria headers must match the source headers.", "条件範囲の見出しは元表と一致させます。", "條件區域表頭必須與來源表一致。"),
        success: L("符合条件的记录已复制到表外。", "Matching records are copied outside the table.", "条件に合う記録が表外へコピーされました。", "符合條件的紀錄已複製到表外。"),
        lab: {
          sheet: baseSheet(model, {
            K1: L("分组", "Group", "グループ", "分組"),
            K2: model.focusGroup,
            L1: L("状态", "Status", "状態", "狀態"),
            L2: model.focusStatus,
            N1: L("筛选输出", "Filter output", "抽出結果", "篩選輸出"),
          }),
          ranges: { listRange: "A1:H11", criteriaRange: "K1:L2", copyTo: "N1" },
          options: { action: "copyTo" },
          goal: { operation: "advancedFilter", listRange: "A1:H11", criteriaRange: "K1:L2", action: "copyTo", copyTo: "N1" },
        },
      };
    }

    if (mode === "removeDuplicates") {
      return {
        mode,
        title: L("按分组和状态删除重复组合", "Remove duplicate group-status combinations", "グループと状態の重複を削除", "依分組和狀態刪除重複組合"),
        action: L("对 A1:H11 按 B 列和 F 列删除重复值，保留第一次出现并保留表头。", "Remove duplicates in A1:H11 using columns B and F, keeping the first occurrence and the header.", "A1:H11 のB列とF列で重複を削除し、最初の出現と表頭を残します。", "對 A1:H11 依 B 欄和 F 欄刪除重複項，保留第一次出現並保留表頭。"),
        hint: L("只勾选分组和状态两列作为重复键。", "Select only Group and Status as the duplicate key.", "重複キーはグループと状態だけを選びます。", "只勾選分組和狀態兩欄作為重複鍵。"),
        success: L("重复的分组与状态组合已保留首次出现。", "Duplicate group-status pairs keep their first occurrence.", "重複するグループと状態の組は最初の1件が残りました。", "重複的分組與狀態組合已保留第一次出現。"),
        lab: {
          sheet: baseSheet(model),
          ranges: { dataTable: "A1:H11" },
          options: { columns: ["B", "F"], hasHeaders: true },
          goal: { operation: "removeDuplicates", range: "A1:H11", columns: ["B", "F"], hasHeaders: true },
        },
      };
    }

    if (mode === "textToColumns") {
      return {
        mode,
        title: L("按竖线拆分导入文本", "Split imported text on the pipe character", "縦線で取込テキストを分割", "依直線符號拆分匯入文字"),
        action: L("将 K2:K5 的竖线分隔文本拆分到 M2 起的三列，原行保留。", "Split the pipe-delimited text in K2:K5 into three columns at M2, keeping the source rows.", "K2:K5 の縦線区切りテキストを M2 以降の3列へ分割し、元の行を残します。", "將 K2:K5 的直線分隔文字拆分到 M2 起的三欄，原始列保留。"),
        hint: L("分隔符号选“其他”，输入 |，目标 M2。", "Choose Delimited, Other, enter |, and set destination M2.", "区切り記号の「その他」に | を入力し、出力先を M2 にします。", "分隔符號選「其他」，輸入 |，目標 M2。"),
        success: L("导入文本已拆成三列，来源仍可追溯。", "The import text is split into three columns and the source remains traceable.", "取込テキストが3列に分かれ、元データも追跡できます。", "匯入文字已拆成三欄，來源仍可追溯。"),
        lab: {
          sheet: baseSheet(model, {
            K1: L("原始导入行", "Raw import line", "取込元の行", "原始匯入列"),
            K2: "North|R-1001|4200",
            K3: "East|R-1002|3800",
            K4: "South|R-1003|5100",
            K5: "West|R-1004|4600",
            M1: L("拆分结果", "Split result", "分割結果", "拆分結果"),
          }),
          ranges: { rawText: "K2:K5", destination: "M2:N5" },
          options: { delimiter: "|", destination: "M2" },
          goal: { operation: "textToColumns", range: "K2:K5", delimiter: "|", destination: "M2" },
        },
      };
    }

    if (mode === "pasteSpecial") {
      return {
        mode,
        title: L("转置为纯值快照", "Transpose to a values-only snapshot", "値のみで行列変換", "轉置為純值快照"),
        action: L("把 A1:E6 复制到 M2，只粘贴值并转置。", "Copy A1:E6 to M2 with Values and Transpose only.", "A1:E6 を M2 へ値のみ・行列変換で貼り付けます。", "把 A1:E6 複製到 M2，只貼上值並轉置。"),
        hint: L("使用选择性粘贴，不要普通粘贴。", "Use Paste Special, not a regular paste.", "通常の貼り付けではなく形式を選択して貼り付けを使います。", "使用選擇性貼上，不要一般貼上。"),
        success: L("快照已转置，公式和格式没有带入。", "The snapshot is transposed without formulas or formatting.", "スナップショットが行列変換され、数式や書式は入っていません。", "快照已轉置，公式和格式沒有帶入。"),
        lab: {
          sheet: baseSheet(model, { M1: L("快照起点", "Snapshot start", "スナップショット開始", "快照起點") }),
          ranges: { source: "A1:E6", destination: "M2" },
          options: { paste: "values", transpose: true },
          goal: { operation: "pasteSpecial", sourceRange: "A1:E6", destination: "M2", paste: "values", transpose: true },
        },
      };
    }

    if (mode === "subtotal") {
      return {
        mode,
        title: L("按分组小计金额和成本", "Subtotal amount and cost by group", "グループ別に金額と原価を小計", "依分組小計金額和成本"),
        action: L("对 A1:H11 按 B 列分组，对 D、E 列求和，并显示分级显示。", "Group A1:H11 by column B, sum columns D and E, and show the outline.", "A1:H11 をB列でグループ化し、D・E列を合計してアウトラインを表示します。", "對 A1:H11 依 B 欄分組，對 D、E 欄求和，並顯示分級顯示。"),
        hint: L("先按分组列排序，再用分类汇总。", "Sort by the group column before using Subtotal.", "グループ列で並べ替えてから小計を使います。", "先依分組欄排序，再用分類彙總。"),
        success: L("分组小计已插入，明细可折叠。", "Group subtotals are inserted and the detail can be collapsed.", "グループ小計が入り、明細を折りたためます。", "分組小計已插入，明細可摺疊。"),
        lab: {
          sheet: baseSheet(model),
          ranges: { dataTable: "A1:H11" },
          options: { groupBy: "B", function: "SUM", columns: ["D", "E"], outline: true },
          goal: { operation: "subtotal", range: "A1:H11", groupBy: "B", function: "SUM", columns: ["D", "E"], outline: true },
        },
      };
    }

    if (mode === "consolidate") {
      const branch = (shift) => K.makeSheet([
        L("分组", "Group", "グループ", "分組"),
        L("数量", "Units", "数量", "數量"),
        L("金额", "Amount", "金額", "金額"),
      ], scenario.groups.map((group, index) => [group, 20 + index * 3 + shift, round(model.totalAmount / (14 + index + shift), 2)]));
      return {
        mode,
        title: L("合并三个区域的数量与金额", "Consolidate three regional totals", "3地域の数量と金額を統合", "合併三個區域的數量與金額"),
        action: L("在 Summary 页合并 Branch_A、Branch_B、Branch_C 的 A1:C5，按首行和最左列匹配并求和。", "On Summary, consolidate A1:C5 from Branch_A, Branch_B, and Branch_C with row/column labels and Sum.", "Summary で Branch_A・Branch_B・Branch_C の A1:C5 を統合し、先頭行と左端列を使って合計します。", "在 Summary 頁合併 Branch_A、Branch_B、Branch_C 的 A1:C5，依首列和最左欄對應並求和。"),
        hint: L("添加三张区域表作为引用位置，勾选首行和最左列。", "Add all three regional ranges and tick Top Row and Left Column.", "3つの地域範囲を追加し、先頭行と左端列にチェックします。", "加入三張區域表作為參照位置，勾選首列和最左欄。"),
        success: L("区域数量与金额已按标签合并。", "Regional units and amounts are consolidated by label.", "地域別の数量と金額がラベルごとに統合されました。", "區域數量與金額已依標籤合併。"),
        lab: {
          workbook: {
            active: "Summary",
            sheets: [
              { name: "Branch_A", cells: branch(0), tabColor: "blue", hidden: false },
              { name: "Branch_B", cells: branch(1), tabColor: "blue", hidden: false },
              { name: "Branch_C", cells: branch(2), tabColor: "blue", hidden: false },
              { name: "Summary", cells: { A1: L("汇总起点", "Summary start", "集計開始", "彙總起點") }, tabColor: "green", hidden: false },
            ],
          },
          ranges: { sourceA: "Branch_A!A1:C5", sourceB: "Branch_B!A1:C5", sourceC: "Branch_C!A1:C5", destination: "Summary!A2" },
          options: { function: "SUM", topRow: true, leftColumn: true },
          goal: {
            operation: "consolidate",
            sources: ["Branch_A!A1:C5", "Branch_B!A1:C5", "Branch_C!A1:C5"],
            destination: "A2",
            function: "SUM",
            topRow: true,
            leftColumn: true,
          },
        },
      };
    }

    if (mode === "import") {
      return {
        mode,
        title: L("导入逗号分隔记录", "Import comma-delimited records", "カンマ区切り記録を取り込む", "匯入逗號分隔紀錄"),
        action: L("把 K2:K5 的逗号分隔文本完整粘贴到导入文本区，使用 CSV、UTF-8 和首行标题。", "Paste the full comma-delimited text from K2:K5 into the import text area with CSV, UTF-8, and headers.", "K2:K5 のカンマ区切りテキストを取込テキスト欄へ貼り付け、CSV・UTF-8・先頭行見出しを指定します。", "把 K2:K5 的逗號分隔文字完整貼到匯入文字區，使用 CSV、UTF-8 和首列標題。"),
        hint: L("导入源选 CSV，编码保持 UTF-8，勾选首行包含标题。", "Choose CSV, keep UTF-8, and enable the header row.", "CSVを選び、UTF-8のまま、先頭行を見出しとして有効にします。", "匯入來源選 CSV，編碼保持 UTF-8，勾選首列包含標題。"),
        success: L("记录字段与标题已完整导入。", "The record fields and headers are fully imported.", "記録の項目と見出しが取り込まれました。", "紀錄欄位與標題已完整匯入。"),
        lab: {
          sheet: baseSheet(model, {
            K1: L("导入队列", "Import queue", "取込キュー", "匯入佇列"),
            K2: "Order,Group,Amount,Status",
            K3: "R-1001,North,4200,Open",
            K4: "R-1002,East,3800,Closed",
            K5: "R-1003,South,5100,Open",
          }),
          ranges: { rawText: "K2:K5" },
          options: { importSource: "csv", encoding: "UTF-8", hasHeaders: true },
          goal: {
            operation: "import",
            importSource: "csv",
            encoding: "UTF-8",
            importText: "Order,Group,Amount,Status\nR-1001,North,4200,Open\nR-1002,East,3800,Closed\nR-1003,South,5100,Open",
            hasHeaders: true,
          },
        },
      };
    }

    if (mode === "chart") {
      const charts = ["column", "bar", "line", "pie", "scatter", "combo"];
      const chartType = charts[variant % charts.length];
      const ranges = chartType === "pie"
        ? "K1:L7"
        : chartType === "scatter"
          ? "L1:M7"
          : chartType === "combo"
            ? "M1:N7"
            : "K1:M7";
      return {
        mode,
        chartType,
        title: fill(L("制作{theme}图表", "Build a {theme} chart", "{theme}のグラフを作成", "製作{theme}圖表"), { theme: scenario.theme }),
        action: L("用 K:N 的期间数据建立 {type} 图，系列按列，标题为 {theme}，显示图例。", "Build a {type} chart from the K:N period block with series in columns, title {theme}, and a legend.", "K:N の期間データから {type} グラフを作成し、系列を列単位、タイトルを {theme}、凡例を表示します。", "用 K:N 的期間資料建立 {type} 圖，數列依欄取用，標題為 {theme}，顯示圖例。"),
        hint: L("先在插入图表中选类型，再确认数据源和系列方向。", "Choose the type at insertion, then confirm source and series direction.", "挿入時に種類を選び、データ源と系列方向を確認します。", "先在插入圖表中選類型，再確認資料來源和數列方向。"),
        success: L("图表类型、数据范围和标题都与任务一致。", "Chart type, source range, and title match the task.", "グラフ種類・データ範囲・タイトルが要件と一致しています。", "圖表類型、資料範圍和標題都與任務一致。"),
        lab: {
          sheet: baseSheet(model, chartBlock(model)),
          ranges: { chartSource: ranges, periodBlock: "K1:N7" },
          options: { chartType, seriesBy: "columns" },
          goal: {
            operation: "chart", chartType, dataRange: ranges, seriesBy: "columns",
            title: scenario.theme, showLegend: true, dataLabels: chartType === "pie" || chartType === "column",
            trendline: chartType === "line" || chartType === "scatter", secondaryAxis: chartType === "combo",
          },
        },
      };
    }

    if (mode === "sparkline") {
      return {
        mode,
        title: L("用迷你图显示三周走势", "Show a three-point trend with a sparkline", "3点の傾向をスパークラインで表示", "用迷你圖顯示三點趨勢"),
        action: L("以 L2:N2 为数据，在 O2 建立折线迷你图并显示高低点。", "Create a line sparkline in O2 from L2:N2 with high and low points shown.", "L2:N2 から O2 に折れ線スパークラインを作成し、高値と低値を表示します。", "以 L2:N2 為資料，在 O2 建立折線迷你圖並顯示高低點。"),
        hint: L("迷你图在插入选项卡，位置选 O2。", "Sparklines are on Insert; place it at O2.", "スパークラインは挿入タブにあり、位置を O2 にします。", "迷你圖在插入索引標籤，位置選 O2。"),
        success: L("迷你图已放入 O2，数据走势清楚。", "The sparkline is in O2 and the trend is clear.", "スパークラインが O2 に入り、傾向が分かります。", "迷你圖已放入 O2，資料趨勢清楚。"),
        lab: {
          sheet: baseSheet(model, chartBlock(model)),
          ranges: { values: "L2:N2", location: "O2" },
          options: { type: "line", showHigh: true, showLow: true },
          goal: { operation: "sparkline", dataRange: "L2:N2", location: "O2", type: "line", showHigh: true, showLow: true },
        },
      };
    }

    if (mode === "pivot" || mode === "pivotChart") {
      const pivotVariant = variant % 5;
      const pivotGoal = {
        operation: mode === "pivotChart" ? "pivotChart" : "pivot",
        sourceRange: "A1:H11",
        destination: "P2",
        rows: ["B"],
        columns: [],
        values: [{ field: "D", aggregate: "SUM" }],
        filters: [],
        showAs: "normal",
        groupDate: "none",
        slicer: false,
      };
      if (mode === "pivot") {
        if (pivotVariant === 1) {
          pivotGoal.filters = [{ field: "F", value: model.focusStatus }];
        } else if (pivotVariant === 2) {
          pivotGoal.showAs = "percentOfTotal";
        } else if (pivotVariant === 3) {
          pivotGoal.rows = ["H"];
          pivotGoal.groupDate = "months";
        } else if (pivotVariant === 4) {
          pivotGoal.slicer = true;
        }
      } else {
        pivotGoal.chartType = "column";
        pivotGoal.title = scenario.theme;
      }
      return {
        mode,
        title: mode === "pivotChart" ? L("创建团队收入透视图", "Build a team revenue PivotChart", "チーム収入のピボットグラフ", "建立團隊收入樞紐圖") : L("建立团队汇总透视表", "Build a team summary PivotTable", "チーム集計ピボットテーブル", "建立團隊彙總樞紐分析表"),
        action: mode === "pivotChart"
          ? L("以 A1:H11 为源，在 P2 建立按分组汇总金额、标题为 {theme} 的柱形透视图。", "Use A1:H11 to create a column PivotChart at P2 by group and amount, titled {theme}.", "A1:H11 を元に、P2 でグループ別金額、タイトル {theme} の縦棒ピボットグラフを作成します。", "以 A1:H11 為來源，在 P2 建立依分組彙總金額、標題為 {theme} 的柱形樞紐圖。")
          : L("以 A1:H11 为源，在 P2 建立透视表，按任务要求配置行、列、值或筛选。", "Use A1:H11 and build a PivotTable at P2 with the requested rows, columns, values, or filters.", "A1:H11 を元に P2 でピボットテーブルを作成し、指定の行・列・値・フィルターを設定します。", "以 A1:H11 為來源，在 P2 建立樞紐分析表，依任務要求設定列、欄、值或篩選。"),
        hint: L("源表要排除右侧结果区，目标 P2 下方留空。", "Exclude the right-side result area from the source and leave room below P2.", "元表に右側の結果領域を含めず、P2 の下に余白を残します。", "來源表要排除右側結果區，目標 P2 下方留空。"),
        success: L("透视结构与可见源数据一致，汇总可直接复核。", "The pivot structure matches the visible source and can be reconciled directly.", "ピボット構造が表示中の元データと一致し、直接照合できます。", "樞紐結構與可見來源資料一致，彙總可直接複核。"),
        lab: {
          sheet: baseSheet(model, { P1: L("透视结果", "Pivot result", "ピボット結果", "樞紐結果") }),
          ranges: { source: "A1:H11", destination: "P2" },
          options: { rows: pivotGoal.rows, values: pivotGoal.values },
          goal: pivotGoal,
        },
      };
    }

    if (mode === "goalSeek") {
      const price = 80 + (seed % 70);
      const cost = 25 + (seed % 35);
      const fixed = 30000 + (seed % 20000);
      const units = 1200 + (seed % 900);
      const analysis = {
        A1: L("利润试算", "Profit model", "利益モデル", "利潤試算"),
        A2: L("单价", "Unit price", "単価", "單價"), B2: price,
        A3: L("单位成本", "Unit cost", "単位原価", "單位成本"), B3: cost,
        A4: L("固定成本", "Fixed cost", "固定費", "固定成本"), B4: fixed,
        A5: L("销量", "Units", "数量", "銷量"), B5: units,
        A7: L("利润", "Profit", "利益", "利潤"), B7: "=(B2-B3)*B5-B4",
        A9: L("目标利润", "Target profit", "目標利益", "目標利潤"), B9: 50000,
      };
      return {
        mode,
        title: L("倒推五万元利润的销量", "Solve for the units needed at 50000 profit", "利益50000の販売数量を逆算", "倒推五萬元利潤的銷量"),
        action: L("用目标搜索把 B7 调整到 50000，可变单元格为 B5 销量。", "Use Goal Seek to set B7 to 50000 by changing B5, Units.", "ゴールシークで B7 を50000にし、B5 の数量を変化させます。", "用目標搜尋把 B7 調整到 50000，變數儲存格為 B5 銷量。"),
        hint: L("目标单元格 B7 必须含利润公式。", "Target cell B7 must contain the profit formula.", "目標セル B7 には利益式が必要です。", "目標儲存格 B7 必須含利潤公式。"),
        success: L("销量已迭代到目标利润对应值。", "Units iterate to the value that hits the target profit.", "目標利益に合う販売数量が求まりました。", "銷量已迭代到目標利潤對應值。"),
        lab: {
          sheet: analysis,
          ranges: { profit: "B7", units: "B5" },
          options: { targetValue: 50000 },
          goal: { operation: "goalSeek", targetCell: "B7", targetValue: 50000, variableCell: "B5" },
        },
      };
    }

    if (mode === "dataTable") {
      const twoVariable = variant % 2 === 1;
      const sheet = twoVariable ? {
        A1: L("单价", "Price", "単価", "單價"), B1: 120,
        A2: L("销量", "Units", "数量", "數量"), B2: 900,
        A3: L("收入公式", "Revenue formula", "収入式", "收入公式"), B3: "=B1*B2",
        D1: L("价格 \\ 数量", "Price \\ Units", "価格 \\ 数量", "價格 \\ 數量"),
        E1: 700, F1: 800, G1: 900, H1: 1000,
        D2: 90, D3: 100, D4: 110, D5: 120, D6: 130,
      } : {
        A1: L("单价", "Price", "単価", "單價"), B1: 120,
        A2: L("销量", "Units", "数量", "數量"), B2: 900,
        A3: L("收入公式", "Revenue formula", "収入式", "收入公式"), B3: "=B1*B2",
        D1: L("价格情景", "Price scenario", "価格シナリオ", "價格情境"),
        E1: L("收入结果", "Revenue result", "収入結果", "收入結果"),
        D2: 90, D3: 100, D4: 110, D5: 120, D6: 130,
      };
      return {
        mode,
        title: twoVariable ? L("测试价格和销量的组合收入", "Test revenue across price and units", "価格と数量の収入を試算", "測試價格和銷量的組合收入") : L("测试五个价格情景", "Test five price scenarios", "5つの価格シナリオを試算", "測試五個價格情境"),
        action: twoVariable
          ? L("设置双变量数据表：公式单元格 B3，公式 =B1*B2，行输入 B1，列输入 B2，结果单元格 E2。", "Set a two-variable Data Table with formula cell B3, formula =B1*B2, row input B1, column input B2, and result cell E2.", "2変数データテーブルを設定します。数式セル B3、数式 =B1*B2、行入力 B1、列入力 B2、結果セル E2です。", "設定雙變數資料表：公式儲存格 B3，公式 =B1*B2，列輸入 B1，欄輸入 B2，結果儲存格 E2。")
          : L("设置单变量数据表：公式单元格 B3，公式 =B1*B2，行输入 B1，列输入留空，结果单元格 E2。", "Set a one-variable Data Table with formula cell B3, formula =B1*B2, row input B1, a blank column input, and result cell E2.", "1変数データテーブルを設定します。数式セル B3、数式 =B1*B2、行入力 B1、列入力は空欄、結果セル E2です。", "設定單變數資料表：公式儲存格 B3，公式 =B1*B2，列輸入 B1，欄輸入留空，結果儲存格 E2。"),
        hint: L("五个字段都要填写；单变量表的列输入必须为空。", "Fill all five fields; the one-variable table's column input must be blank.", "5項目を入力し、1変数テーブルの列入力は空欄にします。", "五個欄位都要填寫；單變數表的欄輸入必須留空。"),
        success: L("数据表结果已按输入组合生成。", "Data Table results are generated for every input combination.", "入力の組み合わせごとに結果が生成されました。", "資料表結果已依輸入組合產生。"),
        lab: {
          sheet,
          ranges: { grid: twoVariable ? "D1:H6" : "D2:E6", formula: "B3" },
          options: { variables: twoVariable ? 2 : 1 },
          goal: {
            operation: "dataTable", formulaCell: "B3", rowInput: "B1",
            columnInput: twoVariable ? "B2" : null,
            dataTableRange: twoVariable ? "D1:H6" : "D2:E6",
            variables: twoVariable ? 2 : 1,
          },
        },
      };
    }

    if (mode === "scenario") {
      const sheet = {
        A1: L("情景假设", "Scenario assumptions", "シナリオ前提", "情境假設"),
        A2: L("单价", "Unit price", "単価", "單價"), B2: 120,
        A3: L("单位成本", "Unit cost", "単位原価", "單位成本"), B3: 68,
        A4: L("固定成本", "Fixed cost", "固定費", "固定成本"), B4: 50000,
        A5: L("销量", "Units", "数量", "數量"), B5: 1400,
        A7: L("年度利润", "Annual profit", "年間利益", "年度利潤"), B7: "=(B2-B3)*B5-B4",
        A9: L("方案", "Scenario", "シナリオ", "方案"), B9: L("当前", "Current", "現行", "目前"),
        C9: L("悲观", "Downside", "下振れ", "悲觀"), D9: L("乐观", "Upside", "上振れ", "樂觀"),
        B10: 22800, C10: -22400, D10: 62000,
      };
      return {
        mode,
        title: L("保存两组悲观情景", "Save two downside scenarios", "2つの下振れシナリオを保存", "保存兩組悲觀情境"),
        action: L("新增 Downside（B2=95）和 CostPressure（B3=72）两组情景。", "Add Downside with B2 = 95 and CostPressure with B3 = 72.", "Downside（B2=95）と CostPressure（B3=72）を追加します。", "新增 Downside（B2=95）和 CostPressure（B3=72）兩組情境。"),
        hint: L("情景管理器只保存输入值，不保存公式结果。", "Scenario Manager stores inputs, not formula results.", "シナリオマネージャーは数式結果ではなく入力値を保存します。", "情境管理員只保存輸入值，不保存公式結果。"),
        success: L("两组悲观情景已保存，可与当前方案比较。", "Both downside scenarios are saved for comparison with the current case.", "2つの下振れシナリオが保存され、現行案と比較できます。", "兩組悲觀情境已保存，可與目前方案比較。"),
        lab: {
          sheet,
          ranges: { changingCells: "B2:B5", scenarios: "B9:D10" },
          options: { scenarioNames: ["Downside", "CostPressure"] },
          goal: {
            operation: "scenario",
            scenarios: [
              { name: "Downside", changingCell: "B2", value: 95 },
              { name: "CostPressure", changingCell: "B3", value: 72 },
            ],
          },
        },
      };
    }

    if (mode === "solver") {
      const sheet = {
        A1: L("生产计划", "Production plan", "生産計画", "生產計畫"),
        A2: L("书桌", "Desk", "デスク", "書桌"), B2: 800,
        A3: L("椅子", "Chair", "チェア", "椅子"), B3: 600,
        A4: L("柜子", "Cabinet", "キャビネット", "櫃子"), B4: 300,
        A6: L("总工时", "Total hours", "総工数", "總工時"), B6: "=B2*2+B3*1.2+B4*2.5",
        A7: L("总利润", "Total profit", "総利益", "總利潤"), B7: "=B2*40+B3*25+B4*70",
        A9: L("工时上限", "Hour cap", "工数上限", "工時上限"), B9: 3000,
      };
      return {
        mode,
        title: L("在工时上限内最大化利润", "Maximize profit within the hour cap", "工数上限内で利益を最大化", "在工時上限內最大化利潤"),
        action: L("设置 B7 最大化，可变 B2:B4，总工时 B6 不超过 B9，产品数量均不小于 0。", "Maximize B7 by changing B2:B4, with B6 no greater than B9 and all quantities at least zero.", "B7 を最大化し、B2:B4 を変動、B6 を B9 以下、数量を0以上にします。", "設定 B7 最大化，變數 B2:B4，總工時 B6 不超過 B9，產品數量均不小於 0。"),
        hint: L("依次添加每个约束，不要漏掉非负条件。", "Add each constraint, including non-negative quantities.", "各制約を追加し、非負条件も忘れません。", "依次加入每個限制，不要漏掉非負條件。"),
        success: L("求解结果满足工时和数量约束。", "The solution satisfies the hour and quantity constraints.", "解は工数と数量の制約を満たしています。", "求解結果符合工時和數量限制。"),
        lab: {
          sheet,
          ranges: { decision: "B2:B4", profit: "B7", cap: "B9" },
          options: { objective: "max" },
          goal: {
            operation: "solver", setCell: "B7", to: "max", byChanging: "B2:B4",
            constraints: [
              { cell: "B6", operator: "<=", valueCell: "B9" },
              { cell: "B2", operator: ">=", value: 0 },
              { cell: "B3", operator: ">=", value: 0 },
              { cell: "B4", operator: ">=", value: 0 },
            ],
          },
        },
      };
    }

    if (mode === "forecast") {
      const forecastRows = Array.from({ length: 12 }, (_, index) => [
        "2026-" + pad2(index + 1) + "-01",
        260 + index * 17 + (index % 3) * 9,
      ]);
      return {
        mode,
        title: L("预测未来三个月用量", "Forecast the next three months", "今後3か月を予測", "預測未來三個月用量"),
        action: L("用 A1:B13 创建预测工作表，预测 3 个周期，自动检测季节性，输出从 D2 开始。", "Create a forecast from A1:B13 for three periods with automatic seasonality, starting at D2.", "A1:B13 から3期間の予測シートを作成し、季節性を自動検出して D2 から出力します。", "用 A1:B13 建立預測工作表，預測 3 個週期，自動偵測季節性，輸出從 D2 開始。"),
        hint: L("确认时间轴是日期、数值列是数量。", "Confirm the timeline is dates and the value column is quantity.", "時間軸が日付、数値列が数量であることを確認します。", "確認時間軸是日期、數值欄是數量。"),
        success: L("预测结果和区间已生成。", "Forecast values and intervals are generated.", "予測値と区間が生成されました。", "預測結果和區間已產生。"),
        lab: {
          sheet: K.makeSheet([
            L("日期", "Date", "日付", "日期"),
            L("数量", "Quantity", "数量", "數量"),
          ], forecastRows, { D1: L("预测起点", "Forecast start", "予測開始", "預測起點") }),
          ranges: { history: "A1:B13", output: "D2" },
          options: { periods: 3, seasonality: "automatic" },
          goal: { operation: "forecast", sourceRange: "A1:B13", periods: 3, seasonality: "automatic", destination: "D2" },
        },
      };
    }

    return {
      mode: "array",
      title: L("动态筛选高额记录", "Dynamically filter high-amount records", "高額記録を動的に抽出", "動態篩選高額紀錄"),
      action: L("在 O2 写入 =FILTER(A2:H11,D2:D11>{threshold})，预览金额超过门槛的全部记录。", "Enter =FILTER(A2:H11,D2:D11>{threshold}) in O2 to preview records above the threshold.", "O2 に =FILTER(A2:H11,D2:D11>{threshold}) を入力し、基準超の記録をプレビューします。", "在 O2 寫入 =FILTER(A2:H11,D2:D11>{threshold})，預覽金額超過門檻的全部紀錄。"),
      hint: L("O2 右侧和下方必须为空，按 Enter 后允许结果溢出。", "Keep the area below and right of O2 empty, then press Enter to spill.", "O2 の右と下を空け、Enter でスピルさせます。", "O2 右側和下方必須為空，按 Enter 後允許結果溢出。"),
      success: L("动态数组已溢出，门槛和源区域都正确。", "The dynamic array spills with the correct threshold and source.", "動的配列がスピルし、基準と元範囲も正しいです。", "動態陣列已溢出，門檻和來源區域都正確。"),
      lab: {
        sheet: baseSheet(model, { O1: L("筛选输出", "Filtered output", "抽出結果", "篩選輸出") }),
        ranges: { source: "A2:H11", condition: "D2:D11", output: "O2" },
        options: { threshold: model.decisionThreshold },
        goal: { operation: "array", formulaCell: "O2", formula: "=FILTER(A2:H11,D2:D11>" + model.decisionThreshold + ")" },
      },
    };
  }

  function uniqueModes(modes, seed) {
    const ordered = modes.slice();
    for (let index = ordered.length - 1; index > 0; index -= 1) {
      const target = (seed + index * 7) % (index + 1);
      const temporary = ordered[index];
      ordered[index] = ordered[target];
      ordered[target] = temporary;
    }
    const seen = new Set();
    return ordered.filter((mode) => {
      if (seen.has(mode)) return false;
      seen.add(mode);
      return true;
    });
  }

  const TRAINING_FORMULA_KINDS = {
    easy: ["total", "countGroup"],
    medium: ["groupTotal", "statusCount", "average", "ratio"],
    hard: ["decision", "lookup", "maxCheck"],
  };

  const DAILY_FORMULA_KINDS = {
    easy: ["countGroup", "total"],
    hard: ["decision", "ratio", "lookup", "maxCheck", "average", "groupTotal"],
  };

  function orderedModes(modes, seed) {
    if (!modes.length) return [];
    if (modes.length === 1) return modes.slice();
    const second = 1 + ((seed >>> 3) % (modes.length - 1));
    const remaining = modes.map((_, index) => index).filter((index) => index !== 0 && index !== second);
    const third = remaining.length ? remaining[(seed >>> 7) % remaining.length] : second;
    return [modes[0], modes[second], modes[third]];
  }

  function buildTrainingLevel(index) {
    const safeIndex = Math.max(0, Math.min(TRAINING_TOTAL - 1, Number(index) || 0));
    const scenario = TRAINING_SCENARIOS[safeIndex % TRAINING_SCENARIOS.length];
    const model = buildModel(scenario, safeIndex, "training");
    const levelId = "training-v13-" + pad2(safeIndex + 1);
    const seed = hashSeed("training-v13:" + safeIndex);
    const modes = orderedModes(uniqueModes(scenario.modes, seed), seed);
    const stepCount = 4 + (safeIndex % 3);
    const steps = [];
    const easyKinds = TRAINING_FORMULA_KINDS.easy;
    const mediumKinds = TRAINING_FORMULA_KINDS.medium;
    const hardKinds = TRAINING_FORMULA_KINDS.hard;
    steps.push(makeFormulaStep(easyKinds[seed % easyKinds.length], model, "training", levelId, steps.length + 1));
    steps.push(makeLabStep(buildLabStep(modes[0], model, "training", levelId, steps.length + 1), model, "training", levelId, steps.length + 1));
    steps.push(makeFormulaStep(mediumKinds[(seed >>> 3) % mediumKinds.length], model, "training", levelId, steps.length + 1));
    steps.push(makeLabStep(buildLabStep(modes[1 % modes.length], model, "training", levelId, steps.length + 1), model, "training", levelId, steps.length + 1));
    if (stepCount >= 5) {
      steps.push(makeFormulaStep(hardKinds[(seed >>> 6) % hardKinds.length], model, "training", levelId, steps.length + 1));
    }
    if (stepCount >= 6) {
    const mode = modes[2 % modes.length];
      steps.push(makeLabStep(buildLabStep(mode, model, "training", levelId, steps.length + 1), model, "training", levelId, steps.length + 1));
    }
    const cycle = Math.floor(safeIndex / TRAINING_SCENARIOS.length) + 1;
    const title = fill(
      L("{org} · {theme} · 综合训练 {n}", "{org} · {theme} · mixed practice {n}", "{org} · {theme} · 総合練習 {n}", "{org} · {theme} · 綜合訓練 {n}"),
      { org: model.org, theme: scenario.theme, n: pad2(safeIndex + 1) }
    );
    const subtitle = fill(scenario.context, { org: model.org });
    return {
      id: levelId,
      scenarioKey: scenario.key,
      kind: "practice",
      title,
      subtitle,
      steps,
      totalSteps: steps.length,
      trainingBankIndex: safeIndex,
      cycle,
    };
  }

  function buildDailyBankLevel(index) {
    const safeIndex = ((Number(index) || 0) % DAILY_TOTAL + DAILY_TOTAL) % DAILY_TOTAL;
    const scenario = DAILY_SCENARIOS[safeIndex % DAILY_SCENARIOS.length];
    const model = buildModel(scenario, safeIndex, "daily");
    const levelId = "daily-v13-" + pad2(safeIndex + 1);
    const seed = hashSeed("daily-v13:" + safeIndex);
    const modes = orderedModes(uniqueModes(scenario.modes, seed), seed);
    const stepCount = 3 + (safeIndex % 2);
    const steps = [];
    const easyKinds = DAILY_FORMULA_KINDS.easy;
    const hardKinds = DAILY_FORMULA_KINDS.hard;
    steps.push(makeFormulaStep(easyKinds[seed % easyKinds.length], model, "daily", levelId, steps.length + 1));
    steps.push(makeLabStep(buildLabStep(modes[0], model, "daily", levelId, steps.length + 1), model, "daily", levelId, steps.length + 1));
    steps.push(makeFormulaStep(hardKinds[(seed >>> 4) % hardKinds.length], model, "daily", levelId, steps.length + 1));
    if (stepCount >= 4) {
      steps.push(makeLabStep(buildLabStep(modes[1 % modes.length], model, "daily", levelId, steps.length + 1), model, "daily", levelId, steps.length + 1));
    }
    const cycle = Math.floor(safeIndex / DAILY_SCENARIOS.length) + 1;
    const title = fill(
      L("{org} · {theme} · 每日办公 {n}", "{org} · {theme} · daily desk {n}", "{org} · {theme} · 毎日の業務 {n}", "{org} · {theme} · 每日辦公 {n}"),
      { org: model.org, theme: scenario.theme, n: pad2(safeIndex + 1) }
    );
    const subtitle = fill(scenario.context, { org: model.org });
    return {
      id: levelId,
      scenarioKey: scenario.key,
      kind: "practice",
      title,
      subtitle,
      steps,
      totalSteps: steps.length,
      dailyBankIndex: safeIndex,
      cycle,
      dailyMode: true,
    };
  }

  function finalizeLevel(level, index) {
    level.levelIndex = index;
    level.globalIndex = index;
    level.number = index + 1;
    level.totalSteps = level.steps.length;
    level.steps.forEach((step, stepIndex) => {
      step.levelId = level.id;
      step.levelIndex = index;
      step.stepIndex = stepIndex;
      step.globalOrder = stepIndex;
    });
    return level;
  }

  let trainingCache = null;

  function trainingLevelAt(index) {
    const safeIndex = Math.max(0, Math.min(TRAINING_TOTAL - 1, Number(index) || 0));
    if (!trainingCache) trainingCache = new Array(TRAINING_TOTAL);
    if (!trainingCache[safeIndex]) {
      trainingCache[safeIndex] = finalizeLevel(buildTrainingLevel(safeIndex), safeIndex);
    }
    return trainingCache[safeIndex];
  }

  function comprehensiveLevels() {
    if (!trainingCache) trainingCache = new Array(TRAINING_TOTAL);
    return new Proxy(trainingCache, {
      get(target, property, receiver) {
        if (typeof property === "string" && /^(0|[1-9]\d*)$/.test(property)) {
          trainingLevelAt(Number(property));
        }
        return Reflect.get(target, property, receiver);
      },
    });
  }

  function trainingLevelId(index) {
    return "training-v13-" + pad2(Math.max(1, Math.min(TRAINING_TOTAL, (Number(index) || 0) + 1)));
  }

  const DAILY_ORDER = permutation(DAILY_TOTAL, "excel-land-daily-v13-183");
  const dailyCache = new Map();

  function dailyIndexFor(value) {
    const day = ordinal(value);
    if (day == null) return DAILY_ORDER[0];
    const slot = ((day - DAILY_EPOCH) % DAILY_TOTAL + DAILY_TOTAL) % DAILY_TOTAL;
    return DAILY_ORDER[slot];
  }

  function dailyBankLevel(index) {
    const safe = ((Number(index) || 0) % DAILY_TOTAL + DAILY_TOTAL) % DAILY_TOTAL;
    if (!dailyCache.has(safe)) dailyCache.set(safe, buildDailyBankLevel(safe));
    return dailyCache.get(safe);
  }

  function dailyLevelForDate(value) {
    const key = value || shanghaiDateKey();
    const bankIndex = dailyIndexFor(key);
    const source = dailyBankLevel(bankIndex);
    const baseId = "daily-v13-" + pad2(bankIndex + 1) + "-" + key;
    const steps = source.steps.map((step, stepIndex) => {
      const cloned = Object.assign({}, step, {
        id: baseId + "-step-" + (stepIndex + 1),
        levelId: baseId,
        levelIndex: 0,
        stepIndex,
      });
      if (Array.isArray(step.tasks)) {
        cloned.tasks = step.tasks.map((task, taskIndex) => Object.assign({}, task, {
          id: baseId + "-task-" + (stepIndex + 1) + "-" + (taskIndex + 1),
        }));
      }
      return cloned;
    });
    return Object.assign({}, source, {
      id: baseId,
      dateKey: key,
      dailyBankIndex: bankIndex,
      steps,
      totalSteps: steps.length,
    });
  }

  function recentLevels(count, todayKey) {
    const today = todayKey || shanghaiDateKey();
    const total = Math.max(1, Number(count) || 7);
    const levels = Array.from({ length: total }, (_, index) =>
      dailyLevelForDate(shiftDateKey(today, -index))
    );
    levels.forEach((level, index) => finalizeLevel(level, index));
    return levels;
  }

  window.PracticeContent = {
    comprehensive: {
      id: "comprehensive",
      total: TRAINING_TOTAL,
      title: L("综合训练", "Mixed practice", "総合トレーニング", "綜合訓練"),
      description: L("50 组办公任务，覆盖工作簿、打印审计、格式验证、数据工具、图表透视、模拟分析、动态数组和高级函数。每组 4 至 6 个小题，从核对基础合计逐步走向业务判断。", "Fifty office task sets cover workbooks, print and auditing, formatting and validation, data tools, charts and pivots, what-if analysis, dynamic arrays, and advanced functions. Each set has 4 to 6 tasks that move from basic reconciliation to business decisions.", "50組の業務タスクで、ブック・印刷監査・書式と入力規則・データツール・グラフとピボット・シナリオ分析・動的配列・高度な関数を扱います。各組4〜6問で、基本集計から業務判断へ進みます。", "50 組辦公任務，涵蓋活頁簿、列印稽核、格式驗證、資料工具、圖表樞紐、模擬分析、動態陣列和進階函數。每組 4 至 6 個小題，從核對基本合計逐步走向業務判斷。"),
      get levels() { return comprehensiveLevels(); },
      levelAt: trainingLevelAt,
      idAt: trainingLevelId,
    },
    daily: {
      id: "daily",
      total: DAILY_TOTAL,
      title: L("每日一题", "Daily challenge", "毎日の一問", "每日一題"),
      description: L("183 个独立办公情景，每天一组 3 至 4 个小题。题目按日期确定性安排，183 天内不重复；任务混合公式核对、数据整理、图表、透视和模拟分析。", "One hundred eighty-three separate office cases, with 3 or 4 tasks per day. Date mapping is deterministic and no case repeats within 183 days; tasks mix formula checks, data preparation, charts, pivots, and what-if analysis.", "183個の独立した業務ケースを日付に沿って出題し、1日3〜4問です。183日以内にケースは重複せず、数式確認・データ整理・グラフ・ピボット・シナリオ分析を組み合わせます。", "183 個獨立辦公情境，每天一組 3 至 4 個小題。題目依日期確定性安排，183 天內不重複；任務混合公式核對、資料整理、圖表、樞紐和模擬分析。"),
      currentDateKey: shanghaiDateKey,
      shiftDateKey,
      dailyIndexFor,
      levelForDate: dailyLevelForDate,
      recentLevels,
    },
  };
})();
