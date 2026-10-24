(function () {
  "use strict";

  const D = window.CourseData;
  const K = window.CurriculumKit;
  const baseL = K.L;
  const task = K.task;
  const operationTask = K.operationTask;
  const kpi = K.sheets.kpi;
  const orders = K.sheets.orders;
  const findData = K.sheets.findData;

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

  kpi.G1 = L("奖金/结果", "Bonus / result", "賞与・結果");
  orders.K1 = L("交叉复核", "Cross-check", "クロス確認");

  const labels = {
    rank: L("排名分析", "Ranking", "順位分析"),
    subtotal: L("可见数据汇总", "Visible-data total", "表示データ集計"),
    sumproduct: L("乘积求和", "Product sum", "積和"),
    review: L("数据综合复盘", "Data review", "データ総合確認"),
  };

  function buildTasks(prefix, specs) {
    return specs.map((spec) => task({
      id: prefix + "-" + spec.key,
      sheet: spec.sheet || kpi,
      target: spec.target,
      taskLabel: spec.taskLabel || labels.rank,
      title: spec.title,
      lead: spec.lead,
      hint: spec.hint,
      success: spec.success,
      formula: spec.formula,
      expected: spec.expected,
      operation: spec.operation,
      requiredFunctions: spec.functions,
      requiredText: spec.requiredText,
      requiredRange: spec.requiredRange,
      sourceRefs: spec.sourceRefs,
      strictRefs: spec.strictRefs,
      mode: spec.mode,
    }));
  }

  function rankTasks(prefix) {
    const rows = [
      { row: 2, name: L("林晓", "Lin", "林"), target: "F2" },
      { row: 3, name: L("陈凯", "Chen", "陳"), target: "F3" },
      { row: 4, name: L("周宁", "Zhou", "周"), target: "F4" },
      { row: 5, name: L("赵敏", "Zhao", "趙"), target: "F5" },
      { row: 6, name: L("王磊", "Wang", "王"), target: "F6" },
      { row: 7, name: L("孙悦", "Sun", "孫"), target: "F7" },
      { row: 8, name: L("李然", "Li", "李"), target: "F8" },
      { row: 9, name: L("郑文", "Zheng", "鄭"), target: "F9" },
    ];
    return rows.map((item) => task({
      id: prefix + "-row-" + item.row,
      sheet: kpi,
      target: item.target,
      taskLabel: labels.rank,
      title: K.fill(L("给{name}的季度销售额排名", "Rank quarterly sales for {name}", "{name}の四半期売上の順位"), item),
      lead: K.fill(L("在 {target} 用 RANK 把 C{row} 与本组 C2:C9 比较，0 表示从大到小排名。", "In {target}, RANK C{row} against C2:C9 with 0 for descending order.", "{target} で C{row} を C2:C9 と RANK 比較し、0 で降順にします。"), item),
      hint: K.fill(L("参考：=RANK(C{row},$C$2:$C$9,0)", "Reference: =RANK(C{row},$C$2:$C$9,0)", "参考：=RANK(C{row},$C$2:$C$9,0)"), item),
      success: L("排名区域要用绝对引用，复制到其他行才不会偏移。", "Lock the ranking range so copied formulas do not drift.", "順位範囲は絶対参照にして、コピーしてもずれないようにします。"),
      formula: "=RANK(C" + item.row + ",$C$2:$C$9,0)",
      requiredFunctions: ["RANK"],
      requiredText: ["$C$2:$C$9"],
    }));
  }

  function subtotalTasks(prefix) {
    return buildTasks(prefix, [
      {
        key: "sum-sales", target: "G2", formula: "=SUBTOTAL(9,C2:C9)", functions: ["SUBTOTAL"], taskLabel: labels.subtotal,
        title: K.fill(L("筛出 {region} 后汇总季度销售额", "Total sales after filtering {region}", "{region} で絞り込んだ四半期売上合計", "篩出 {region} 後彙總季度銷售額"), { region: FILTER_REGIONS[0] }),
        lead: K.fill(L("先把区域筛选为 {region}，再在 G2 用 SUBTOTAL 的 9 号功能汇总 C2:C9。筛选和公式都要正确，检查才会通过。", "First filter Region to {region}, then use SUBTOTAL function 9 on C2:C9 in G2. Both the filter and the formula must be correct.", "まず地域を {region} に絞り、G2 で SUBTOTAL の機能番号9を使い C2:C9 を合計します。絞り込みと数式の両方が必要です。", "先把區域篩選為 {region}，再在 G2 用 SUBTOTAL 的 9 號功能彙總 C2:C9。篩選和公式都要正確，檢查才會通過。"), { region: FILTER_REGIONS[0] }),
        success: L("9 = SUM，1 = AVERAGE，2 = COUNT。", "9 = SUM, 1 = AVERAGE, 2 = COUNT.", "9 は SUM、1 は AVERAGE、2 は COUNT です。"),
        expected: 6100,
        operation: { type: "filter", range: "A1:G9", column: "B", selectedValue: FILTER_REGIONS[0] },
      },
      {
        key: "avg-sales", target: "G3", formula: "=SUBTOTAL(1,C2:C9)", functions: ["SUBTOTAL"], taskLabel: labels.subtotal,
        title: K.fill(L("筛出 {region} 后计算人均季度销售额", "Average sales after filtering {region}", "{region} の1人あたり四半期売上", "篩出 {region} 後計算人均季度銷售額"), { region: FILTER_REGIONS[1] }),
        lead: K.fill(L("筛选 {region}，然后在 G3 用 SUBTOTAL 的 1 号功能求平均。分母会跟着可见行变化。", "Filter {region}, then use SUBTOTAL function 1 in G3. The denominator follows the visible rows.", "{region} に絞り、G3 で SUBTOTAL の機能番号1を使います。分母も表示行に合わせて変わります。", "篩選 {region}，然後在 G3 用 SUBTOTAL 的 1 號功能求平均。分母會跟著可見列變化。"), { region: FILTER_REGIONS[1] }),
        expected: 3705,
        operation: { type: "filter", range: "A1:G9", column: "B", selectedValue: FILTER_REGIONS[1] },
      },
      {
        key: "count-sales", target: "G4", formula: "=SUBTOTAL(2,C2:C9)", functions: ["SUBTOTAL"], taskLabel: labels.subtotal,
        title: K.fill(L("筛出 {region} 后统计有销售额的人数", "Count sales values after filtering {region}", "{region} の売上件数を数える", "篩出 {region} 後統計有銷售額的人數"), { region: FILTER_REGIONS[2] }),
        lead: K.fill(L("筛选 {region}，在 G4 用 2 号功能统计 C2:C9 中的数字。空值不会被计数。", "Filter {region}, then use function 2 in G4 to count numbers in C2:C9. Empty cells are ignored.", "{region} に絞り、G4 で機能番号2を使い C2:C9 の数値を数えます。空欄は数えません。", "篩選 {region}，在 G4 用 2 號功能統計 C2:C9 中的數字。空值不會被計數。"), { region: FILTER_REGIONS[2] }),
        expected: 2,
        operation: { type: "filter", range: "A1:G9", column: "B", selectedValue: FILTER_REGIONS[2] },
      },
      {
        key: "max-sales", target: "G5", formula: "=SUBTOTAL(4,C2:C9)", functions: ["SUBTOTAL"], taskLabel: labels.subtotal,
        title: K.fill(L("筛出 {region} 后的最高销售额", "Highest sales after filtering {region}", "{region} の最高売上", "篩出 {region} 後的最高銷售額"), { region: FILTER_REGIONS[3] }),
        lead: K.fill(L("筛选 {region}，在 G5 用 4 号功能求最大值。被隐藏的行不参与比较。", "Filter {region}, then use function 4 in G5. Hidden rows are excluded.", "{region} に絞り、G5 で機能番号4を使います。非表示行は比較対象外です。", "篩選 {region}，在 G5 用 4 號功能求最大值。被隱藏的列不參與比較。"), { region: FILTER_REGIONS[3] }),
        expected: 4020,
        operation: { type: "filter", range: "A1:G9", column: "B", selectedValue: FILTER_REGIONS[3] },
      },
      {
        key: "min-sales", target: "G6", formula: "=SUBTOTAL(5,C2:C9)", functions: ["SUBTOTAL"], taskLabel: labels.subtotal,
        title: K.fill(L("筛出 {region} 后的最低销售额", "Lowest sales after filtering {region}", "{region} の最低売上", "篩出 {region} 後的最低銷售額"), { region: FILTER_REGIONS[1] }),
        lead: K.fill(L("筛选 {region}，在 G6 用 5 号功能求最小值。注意不要用 MIN，它会连隐藏行一起比较。", "Filter {region}, then use function 5 in G6. Do not use MIN, which would include hidden rows.", "{region} に絞り、G6 で機能番号5を使います。MIN は非表示行も含むため使いません。", "篩選 {region}，在 G6 用 5 號功能求最小值。注意不要用 MIN，它會連隱藏列一起比較。"), { region: FILTER_REGIONS[1] }),
        expected: 3270,
        operation: { type: "filter", range: "A1:G9", column: "B", selectedValue: FILTER_REGIONS[1] },
      },
      {
        key: "sum-target", target: "G7", formula: "=SUBTOTAL(9,D2:D9)", functions: ["SUBTOTAL"], taskLabel: labels.subtotal,
        title: K.fill(L("筛出 {region} 后的季度目标合计", "Target total after filtering {region}", "{region} の四半期目標合計", "篩出 {region} 後的季度目標合計"), { region: FILTER_REGIONS[2] }),
        lead: K.fill(L("筛选 {region}，在 G7 用 SUBTOTAL 9 汇总 D2:D9 的目标。别把销售额列 C 写进来。", "Filter {region}, then use SUBTOTAL 9 in G7 on the target column D2:D9, not sales column C.", "{region} に絞り、G7 で SUBTOTAL 9 を使い、売上列Cではなく目標列 D2:D9 を合計します。", "篩選 {region}，在 G7 用 SUBTOTAL 9 彙總 D2:D9 的目標。別把銷售額欄 C 寫進來。"), { region: FILTER_REGIONS[2] }),
        expected: 4800,
        operation: { type: "filter", range: "A1:G9", column: "B", selectedValue: FILTER_REGIONS[2] },
      },
      {
        key: "counta-names", target: "G8", formula: "=SUBTOTAL(3,A2:A9)", functions: ["SUBTOTAL"], taskLabel: labels.subtotal,
        title: K.fill(L("筛出 {region} 后统计在场销售员", "Count visible reps after filtering {region}", "{region} の表示担当者数", "篩出 {region} 後統計在場銷售員"), { region: FILTER_REGIONS[0] }),
        lead: K.fill(L("筛选 {region}，在 G8 用 3 号功能统计 A 列非空姓名。它和 2 号数字计数的区别要分清。", "Filter {region}, then use function 3 in G8 to count non-empty names in A. Distinguish it from numeric count 2.", "{region} に絞り、G8 で機能番号3を使い A 列の非空氏名を数えます。数値個数の2との違いに注意します。", "篩選 {region}，在 G8 用 3 號功能統計 A 欄非空姓名。它和 2 號數字計數的區別要分清。"), { region: FILTER_REGIONS[0] }),
        expected: 2,
        operation: { type: "filter", range: "A1:G9", column: "B", selectedValue: FILTER_REGIONS[0] },
      },
      {
        key: "attainment", target: "G9", formula: "=ROUND(SUBTOTAL(9,C2:C9)/SUBTOTAL(9,D2:D9),2)", functions: ["ROUND", "SUBTOTAL"], taskLabel: labels.review,
        title: K.fill(L("筛出 {region} 后的目标达成率", "Attainment after filtering {region}", "{region} の目標達成率", "篩出 {region} 後的目標達成率"), { region: FILTER_REGIONS[3] }),
        lead: K.fill(L("筛选 {region}，在 G9 分别用 SUBTOTAL 9 汇总销售额 C2:C9 和目标 D2:D9，再相除并四舍五入到两位。", "Filter {region}. In G9, use SUBTOTAL 9 separately on sales C2:C9 and targets D2:D9, divide, then round to two decimals.", "{region} に絞り、G9 で売上 C2:C9 と目標 D2:D9 をそれぞれ SUBTOTAL 9 で集計し、割って小数2桁に丸めます。", "篩選 {region}，在 G9 分別用 SUBTOTAL 9 彙總銷售額 C2:C9 和目標 D2:D9，再相除並四捨五入到兩位。"), { region: FILTER_REGIONS[3] }),
        expected: 0.93,
        operation: { type: "filter", range: "A1:G9", column: "B", selectedValue: FILTER_REGIONS[3] },
      },
    ]);
  }

  const FILTER_REGIONS = [
    L("华东", "East", "東部", "華東"),
    L("华北", "North", "北部", "華北"),
    L("华南", "South", "南部", "華南"),
    L("西南", "Southwest", "南西部", "西南"),
  ];

  function filterTasks(prefix) {
    const byRegion = FILTER_REGIONS.map((region, index) => operationTask({
      id: prefix + "-" + index,
      sheet: kpi,
      taskLabel: L("数据筛选", "Data filter", "データ絞り込み", "資料篩選"),
      title: K.fill(L("筛出 {region} 的销售记录", "Filter the {region} sales records", "{region} の営業記録を絞り込む", "篩出 {region} 的銷售記錄"), { region }),
      lead: K.fill(L("真实 Excel 里，先选中 A1:G9 中的任意单元格或整个数据区，再到“数据 > 筛选”开启筛选（也可按 Ctrl+Shift+L）。然后点 B1 的筛选箭头，只保留 {region}，按确定。本关也可以直接用表格上方的筛选按钮。", "In Excel, select any cell in A1:G9 or the whole range, then choose Data > Filter (or press Ctrl+Shift+L). Open the arrow in B1, keep only {region}, and confirm. The filter button above this practice sheet works the same way.", "Excel では A1:G9 内のセルまたは範囲を選び、「データ > フィルター」（Ctrl+Shift+L）で絞り込みを有効にします。B1 の矢印から {region} だけを残して確定します。この練習では表上部の絞り込みボタンも使えます。", "真實 Excel 裡，先選取 A1:G9 中的任一儲存格或整個資料範圍，再到「資料 > 篩選」開啟篩選（也可按 Ctrl+Shift+L）。然後點 B1 的篩選箭頭，只保留 {region}，按確定。本關也可以直接用表格上方的篩選按鈕。"), { region }),
      hint: L("筛选不是删除：它只是暂时藏起不匹配的行。表头箭头带漏斗、行号出现断层，才说明筛选正在生效；清除筛选后所有行会回来。", "Filtering is not deleting: it temporarily hides non-matching rows. A funnel in the header and gaps in row numbers show that it is active; clearing the filter brings every row back.", "絞り込みは削除ではありません。条件に合わない行を一時的に隠すだけです。見出しの漏斗と行番号の飛びで有効だと分かります。解除すれば全行が戻ります。", "篩選不是刪除：它只是暫時藏起不符合的列。欄首箭頭帶漏斗、列號出現斷層，才說明篩選正在生效；清除篩選後所有列會回來。"),
      success: K.fill(L("已筛出 {region} 的记录，其他区域行被隐藏。检查时也会核对隐藏行是否完全正确。", "The {region} records are visible and the other regions are hidden. The check also verifies that the hidden rows are exactly right.", "{region} の記録だけが表示され、ほかの地域は非表示になりました。非表示行が正確かどうかも確認されます。", "已篩出 {region} 的記錄，其他區域列被隱藏。檢查時也會核對隱藏列是否完全正確。"), { region }),
      operation: {
        type: "filter",
        range: "A1:G9",
        column: "B",
        selectedValue: region,
      },
    }));

    const warehouseFilters = [
      {
        key: "status-active",
        column: "D",
        value: L("启用", "Active", "稼働中", "啟用"),
        title: L("仓库台账：只看启用中的仓库", "Warehouse log: show active warehouses only", "倉庫台帳：稼働中だけを表示", "倉庫台帳：只看啟用中的倉庫"),
        lead: L("选中 A1:G6 并开启筛选，在 D1“状态”列只保留“启用”。应用后确认停用行被隐藏，再核对可见行数。", "Select A1:G6 and enable Filter. Keep only Active in the Status column D1. Confirm that inactive rows disappear and check the visible-row count.", "A1:G6 を選んで絞り込みを有効にし、D1「状態」で「稼働中」だけを残します。停止中の行が隠れたことと表示行数を確認します。", "選取 A1:G6 並開啟篩選，在 D1「狀態」欄只保留「啟用」。套用後確認停用列被隱藏，再核對可見列數。"),
      },
      {
        key: "status-inactive",
        column: "D",
        value: L("停用", "Inactive", "停止中", "停用"),
        title: L("仓库台账：找出停用中的仓库", "Warehouse log: isolate inactive warehouses", "倉庫台帳：停止中だけを抽出", "倉庫台帳：找出停用中的倉庫"),
        lead: L("筛选 D 列“状态”，只保留“停用”。停用仓库通常要进入盘点或复核清单，因此这一步会经常出现在月末工作中。", "Filter the Status column D and keep only Inactive. Inactive sites often go to a stocktake or review list, so this is a common month-end step.", "D列「状態」で「停止中」だけを残します。停止中の倉庫は棚卸しや確認リストに入ることが多く、月末作業でよく使います。", "篩選 D 欄「狀態」，只保留「停用」。停用倉庫通常要進入盤點或覆核清單，因此這一步會經常出現在月底工作中。"),
      },
      {
        key: "city-shanghai",
        column: "C",
        value: L("上海", "Shanghai", "上海", "上海"),
        title: L("按城市筛选：上海的两个仓库", "Filter by city: the two Shanghai warehouses", "都市で絞り込み：上海の2倉庫", "依城市篩選：上海的兩個倉庫"),
        lead: L("选中 A1:G6，开启筛选，在 C 列“城市”只保留“上海”。筛选条件不一定是区域，城市、部门、状态都可以成为业务切入口。", "Select A1:G6, enable Filter, and keep only Shanghai in the City column C. A filter is not limited to region; city, department, and status are equally common entry points.", "A1:G6 を選び、絞り込みを有効にして C列「都市」で「上海」だけを残します。絞り込みは地域に限らず、都市・部署・状態もよく使います。", "選取 A1:G6，開啟篩選，在 C 欄「城市」只保留「上海」。篩選條件不一定是區域，城市、部門、狀態都可以成為業務切入口。"),
      },
    ];
    return byRegion.concat(warehouseFilters.map((item) => operationTask({
      id: prefix + "-" + item.key,
      sheet: findData,
      taskLabel: L("业务筛选", "Business filter", "業務絞り込み", "業務篩選"),
      title: item.title,
      lead: item.lead,
      hint: L("先确认筛选范围包含表头 A1:G6，再在目标列开启筛选。勾选一个值后按确定，隐藏行数应与题目预期一致。", "Make sure the filtered range includes the header row A1:G6, then enable the filter on the target column. Select one value and confirm; the hidden-row count should match the task.", "絞り込み範囲に見出し行 A1:G6 が含まれることを確認し、対象列で絞り込みます。値を1つ選んで確定し、非表示行数が問題と一致するか確認します。", "先確認篩選範圍包含欄首 A1:G6，再在目標欄開啟篩選。勾選一個值後按確定，隱藏列數應與題目預期一致。"),
      success: K.fill(L("筛选已应用，{value} 的记录单独显示在台账中。", "The filter is applied and {value} records are isolated in the log.", "絞り込みが適用され、{value} の記録だけが表示されています。", "篩選已套用，{value} 的記錄單獨顯示在台帳中。"), { value: item.value }),
      operation: {
        type: "filter",
        range: "A1:G6",
        column: item.column,
        selectedValue: item.value,
      },
    })));
  }

  function findTasks(prefix) {
    return [2, 4, 6, 8].map((row, index) => {
      const name = kpi["A" + row];
      return operationTask({
        id: prefix + "-" + index,
        sheet: kpi,
        taskLabel: L("查找记录", "Find a record", "記録を検索", "尋找記錄"),
        title: K.fill(L("找出 {name} 所在的行", "Find the row for {name}", "{name} の行を検索", "找出 {name} 所在橫列"), { name }),
        lead: K.fill(L("按 Ctrl+F 打开“查找和替换”（也可走“开始 > 查找和选择 > 查找…”），输入 {name}，再按“查找下一个”。不要直接点单元格冒充查找，检查会核对是否真的执行了查找并定位到正确记录。", "Press Ctrl+F to open Find and Replace (or use Home > Find & Select > Find). Enter {name} and choose Find Next. Clicking a cell does not count as searching; the check verifies that Find was actually used and landed on the right record.", "Ctrl+F で「検索と置換」を開き（「ホーム > 検索と選択 > 検索」でも可）、{name} を入力して「次を検索」を押します。セルを直接クリックしただけでは検索とみなされません。", "按 Ctrl+F 開啟「尋找和取代」（也可走「常用 > 尋找和選取 > 尋找…」），輸入 {name}，再按「尋找下一個」。不要直接點儲存格冒充尋找，檢查會核對是否真的執行尋找並定位到正確記錄。"), { name }),
        hint: L("查找对话框的“选项”默认折叠；展开后可设置范围、搜索方向、查找范围、区分大小写和单元格匹配。本关先保持默认，只执行查找下一个。", "The Find dialog keeps Options collapsed by default. Expand it to set scope, search direction, look-in type, case matching, and whole-cell matching. For this task, keep the defaults and use Find Next.", "検索ダイアログの「オプション」は既定で折りたたまれています。展開すると範囲・検索方向・検索対象・大文字小文字・セル全体一致を設定できます。この課題では既定のまま「次を検索」を使います。", "尋找對話框的「選項」預設折疊；展開後可設定範圍、搜尋方向、尋找範圍、區分大小寫和儲存格相符。本關先保持預設，只執行尋找下一個。"),
        success: K.fill(L("已定位到 {name} 的记录。", "The record for {name} is selected.", "{name} の記録を選択しました。", "已定位到 {name} 的記錄。"), { name }),
        operation: {
          type: "find",
          range: "A1:G9",
          query: name,
          expectedRef: "A" + row,
        },
      });
    });
  }

  function wildcardFindTasks(prefix) {
    return [
      {
        query: "*0104",
        ref: "A5",
        title: L("用 * 找出编号以 0104 结尾的订单", "Use * to find the order ending in 0104", "*\u30670104\u3067\u7d42\u308f\u308b\u6ce8\u6587\u3092\u691c\u7d22", "\u7528 * \u627e\u51fa\u7de8\u865f\u4ee5 0104 \u7d50\u5c3e\u7684\u8a02\u55ae"),
        lead: L("在查找窗口输入 *0104。星号代表前面任意多个字符，能匹配完整订单号。", "Enter *0104 in Find. The asterisk stands for any number of leading characters.", "\u691c\u7d22\u306b *0104 \u3092\u5165\u529b\u3057\u307e\u3059\u3002*\u306f\u524d\u65b9\u306e\u4efb\u610f\u306e\u6587\u5b57\u3092\u8868\u3057\u307e\u3059\u3002", "\u5728\u5c0b\u627e\u8996\u7a97\u8f38\u5165 *0104\u3002\u661f\u865f\u4ee3\u8868\u524d\u9762\u4efb\u610f\u591a\u500b\u5b57\u5143\uff0c\u80fd\u5339\u914d\u5b8c\u6574\u8a02\u55ae\u865f\u3002"),
      },
      {
        query: "SO2601?5",
        ref: "A6",
        title: L("用 ? 匹配一个字符", "Use ? to match exactly one character", "?\u30671\u6587\u5b57\u3092\u30de\u30c3\u30c1", "\u7528 ? \u5339\u914d\u4e00\u500b\u5b57\u5143"),
        lead: L("输入 SO2601?5。问号只占一个字符，因此第 5 笔订单会被定位。", "Enter SO2601?5. The question mark consumes exactly one character.", "SO2601?5 \u3092\u5165\u529b\u3057\u307e\u3059\u3002?\u306f1\u6587\u5b57\u5206\u3060\u3051\u306b\u5bfe\u5fdc\u3057\u307e\u3059\u3002", "\u8f38\u5165 SO2601?5\u3002\u554f\u865f\u53ea\u4ee3\u8868\u4e00\u500b\u5b57\u5143\uff0c\u56e0\u6b64\u7b2c 5 \u7b46\u8a02\u55ae\u6703\u88ab\u5b9a\u4f4d\u3002"),
      },
      {
        query: "SO2601*9",
        ref: "A10",
        title: L("用 * 找同前缀且末尾为 9 的订单", "Use * for a shared prefix and final 9", "*\u3067\u540c\u3058\u63a5\u982d\u8f9e\u3068\u672b\u5c3e9\u3092\u691c\u7d22", "\u7528 * \u627e\u540c\u524d\u7db4\u4e14\u672b\u5c3e\u70ba 9 \u7684\u8a02\u55ae"),
        lead: L("输入 SO2601*9。星号可以跨越多个字符，适合找“同前缀、特定结尾”的记录。", "Enter SO2601*9. The asterisk can span many characters, which suits a fixed prefix and a fixed ending.", "SO2601*9 \u3092\u5165\u529b\u3057\u307e\u3059\u3002*\u306f\u8907\u6570\u6587\u5b57\u306b\u5bfe\u5fdc\u3059\u308b\u306e\u3067\u3001\u63a5\u982d\u8f9e\u3068\u672b\u5c3e\u304c\u6c7a\u307e\u3063\u3066\u3044\u308b\u691c\u7d22\u306b\u4fbf\u5229\u3067\u3059\u3002", "\u8f38\u5165 SO2601*9\u3002\u661f\u865f\u53ef\u4ee5\u8de8\u8d8a\u591a\u500b\u5b57\u5143\uff0c\u9069\u5408\u627e\u300c\u540c\u524d\u7db4\u3001\u7279\u5b9a\u7d50\u5c3e\u300d\u7684\u8a18\u9304\u3002"),
      },
      {
        query: "SO26011?",
        ref: "A11",
        title: L("末尾用 ? 限制字符数", "Limit the last character with ?", "\u672b\u5c3e\u3092 ? \u30671\u6587\u5b57\u306b\u5236\u9650", "\u672b\u5c3e\u7528 ? \u9650\u5236\u5b57\u5143\u6578"),
        lead: L("输入 SO26011?。末尾的问号只允许再出现一个字符，能缩小匹配范围。", "Enter SO26011?. The final question mark allows exactly one more character.", "SO26011? \u3092\u5165\u529b\u3057\u307e\u3059\u3002\u672b\u5c3e\u306e ? \u306f\u3055\u3089\u306b1\u6587\u5b57\u3060\u3051\u3092\u8a31\u53ef\u3057\u307e\u3059\u3002", "\u8f38\u5165 SO26011?\u3002\u672b\u5c3e\u7684\u554f\u865f\u53ea\u5141\u8a31\u518d\u51fa\u73fe\u4e00\u500b\u5b57\u5143\uff0c\u80fd\u7e2e\u5c0f\u5339\u914d\u7bc4\u570d\u3002"),
      },
    ].map((item, index) => operationTask({
      id: prefix + "-" + index,
      sheet: orders,
      taskLabel: L("通配符查找", "Wildcard Find", "\u30ef\u30a4\u30eb\u30c9\u30ab\u30fc\u30c9\u691c\u7d22", "\u901a\u914d\u7b26\u5c0b\u627e"),
      title: item.title,
      lead: item.lead,
      hint: L("查找窗口支持 ? 和 *；如果只想找真正的问号或星号，在它们前面加 ~。", "Find supports ? and *. Put ~ before a literal question mark or asterisk.", "\u691c\u7d22\u3067\u306f ? \u3068 * \u304c\u4f7f\u3048\u307e\u3059\u3002\u6587\u5b57\u3068\u3057\u3066\u4f7f\u3046\u5834\u5408\u306f ~ \u3092\u524d\u306b\u4ed8\u3051\u307e\u3059\u3002", "\u5c0b\u627e\u8996\u7a97\u652f\u63f4 ? \u548c *\uff1b\u5982\u679c\u53ea\u60f3\u627e\u771f\u6b63\u7684\u554f\u865f\u6216\u661f\u865f\uff0c\u5728\u5b83\u5011\u524d\u9762\u52a0 ~\u3002"),
      success: L("通配符已定位到目标记录。", "The wildcard located the target record.", "\u30ef\u30a4\u30eb\u30c9\u30ab\u30fc\u30c9\u3067\u5bfe\u8c61\u8a18\u9332\u3092\u7279\u5b9a\u3057\u307e\u3057\u305f\u3002", "\u901a\u914d\u7b26\u5df2\u5b9a\u4f4d\u5230\u76ee\u6a19\u8a18\u9304\u3002"),
      operation: {
        type: "find",
        range: "A1:H11",
        query: item.query,
        expectedRef: item.ref,
      },
    }));
  }

  function findOptionTasks(prefix) {
    return [
      operationTask({
        id: prefix + "-match-case",
        sheet: findData,
        taskLabel: L("查找选项", "Find options", "検索オプション", "尋找選項"),
        title: L("区分大小写：只定位小写的 cn-001", "Match case: locate only lowercase cn-001", "大文字小文字を区別して cn-001 を検索", "區分大小寫：只定位小寫的 cn-001"),
        lead: L("在查找内容输入 cn-001。打开“选项”，勾选“区分大小写”，再按“查找下一个”。如果不勾选，排在前面的 CN-001A 会先被找到。", "Enter cn-001 in Find. Open Options, select Match case, then choose Find Next. Without that option, the earlier CN-001A is matched first.", "検索内容に cn-001 を入力します。「オプション」で「大文字と小文字を区別」を選び、「次を検索」を押します。未選択だと前にある CN-001A が先に見つかります。", "在尋找內容輸入 cn-001。開啟「選項」，勾選「區分大小寫」，再按「尋找下一個」。如果不勾選，排在前面的 CN-001A 會先被找到。"),
        hint: L("查找和替换共用“选项”。区分大小写关闭时，CN-001、cn-001 会被当成同一种写法。", "Find and Replace share the same Options panel. With Match case off, CN-001 and cn-001 are treated as the same text.", "検索と置換は同じ「オプション」を使います。大文字小文字の区別を切ると CN-001 と cn-001 は同じ扱いになります。", "尋找和取代共用「選項」。區分大小寫關閉時，CN-001、cn-001 會被當成同一種寫法。"),
        success: L("定位到 A4 的小写编号。大小写选项确实改变了匹配顺序。", "The lowercase code in A4 is active. Match case changed the matching order.", "A4 の小文字番号に移動しました。大文字小文字の設定で一致順が変わりました。", "定位到 A4 的小寫編號。大小寫選項確實改變了符合順序。"),
        operation: {
          type: "find",
          range: "A1:A6",
          query: "cn-001",
          expectedRef: "A4",
        },
      }),
      operationTask({
        id: prefix + "-whole-cell",
        sheet: findData,
        taskLabel: L("查找选项", "Find options", "検索オプション", "尋找選項"),
        title: L("单元格匹配：排除 CN-001A", "Match entire cell: exclude CN-001A", "セル全体一致で CN-001A を除外", "儲存格相符：排除 CN-001A"),
        lead: L("输入 CN-001，打开“选项”并勾选“单元格匹配”，再查找。这样 CN-001A 不会被当成命中，目标会落在 A3 的完整编号。", "Enter CN-001, open Options, select Match entire cell contents, then find. CN-001A will no longer count as a hit; the target becomes the complete code in A3.", "CN-001 を入力し、「オプション」で「セル内容が完全に同一である場合のみ検索」を選びます。CN-001A は一致しなくなり、A3 の完全な番号に移動します。", "輸入 CN-001，開啟「選項」並勾選「儲存格內容須完全相符」，再尋找。這樣 CN-001A 不會被當成命中，目標會落在 A3 的完整編號。"),
        hint: L("“单元格匹配”只接受整格完全相等，不是“包含这段文字”。", "Match entire cell contents accepts only an exact whole-cell match, not a substring.", "「セル内容が完全に同一」はセル全体が一致する場合だけで、部分一致ではありません。", "「儲存格內容須完全相符」只接受整格完全相等，不是「包含這段文字」。"),
        success: L("A3 的 CN-001 被准确定位，前缀相同的 CN-001A 被排除。", "A3 is selected and the prefixed CN-001A is excluded.", "A3 が選択され、接頭辞付きの CN-001A は除外されました。", "A3 的 CN-001 被準確定位，前綴相同的 CN-001A 被排除。"),
        operation: {
          type: "find",
          range: "A1:A6",
          query: "CN-001",
          expectedRef: "A3",
        },
      }),
      operationTask({
        id: prefix + "-search-by-column",
        sheet: findData,
        taskLabel: L("查找选项", "Find options", "検索オプション", "尋找選項"),
        title: L("搜索顺序：按列先找到上方的 OK", "Search order: find the upper OK while searching by columns", "検索順序：列方向で上部の OK を先に検索", "搜尋順序：按欄先找到上方的 OK"),
        lead: L("在 H1:I3 范围查找 OK。打开“选项”，把“搜索”改成“按列”，再查找。默认按行会先碰到 I2；按列会先碰到 H3。", "Search for OK across H1:I3. In Options, set Search to By Columns, then find. The default row order reaches I2 first; column order reaches H3 first.", "H1:I3 で OK を検索します。「オプション」の検索方向を「列」にして実行します。既定の行方向では I2、列方向では H3 が先です。", "在 H1:I3 範圍尋找 OK。開啟「選項」，把「搜尋」改成「按欄」，再尋找。預設按列會先碰到 I2；按欄會先碰到 H3。"),
        hint: L("按行是从左到右扫过每一行；按列是从上到下扫过每一列。查找全部时，结果列表的顺序也会随之改变。", "By Rows scans left to right through each row; By Columns scans top to bottom through each column. Find All also follows that order.", "行方向は各行を左から右へ、列方向は各列を上から下へ走査します。「すべて検索」の結果順も変わります。", "按列是從左到右掃過每一列；按欄是從上到下掃過每一欄。「尋找全部」的結果順序也會隨之改變。"),
        success: L("搜索方向改成按列后，H3 成为第一个命中。", "With By Columns selected, H3 is the first hit.", "列方向にすると H3 が最初の一致になります。", "搜尋方向改成按欄後，H3 成為第一個命中。"),
        operation: {
          type: "find",
          range: "H1:I3",
          query: "OK",
          expectedRef: "H3",
        },
      }),
    ];
  }

  function conditionalLookupTasks(prefix) {
    return [
      task({
        id: prefix + "-count-active",
        sheet: findData,
        target: "J2",
        taskLabel: L("条件查找", "Conditional lookup", "条件検索", "條件查找"),
        title: L("库存台账中启用状态的仓库有几座", "How many warehouses are active?", "稼働中の倉庫はいくつあるか", "庫存台帳中啟用狀態的倉庫有幾座"),
        lead: L("在 J2 用 COUNTIF 统计 D2:D6 中等于“启用”的行数。这里查的是一组记录，不是单条定位。", "In J2, use COUNTIF to count rows in D2:D6 equal to Active. This queries a group, not one record.", "J2 で COUNTIF を使い、D2:D6 の「稼働中」を数えます。1件の位置ではなく、条件に合う行の集合を調べます。", "在 J2 用 COUNTIF 統計 D2:D6 中等於「啟用」的列數。這裡查的是一組記錄，不是單筆定位。"),
        hint: L('参考：=COUNTIF(D2:D6,"启用")。文字条件要放在双引号内。', 'Reference: =COUNTIF(D2:D6,"Active"). Text criteria go inside double quotes.', '参考：=COUNTIF(D2:D6,"稼働中")。文字条件は二重引用符で囲みます。', '參考：=COUNTIF(D2:D6,"啟用")。文字條件要放在雙引號內。'),
        formula: L('=COUNTIF(D2:D6,"启用")', '=COUNTIF(D2:D6,"Active")', '=COUNTIF(D2:D6,"稼働中")', '=COUNTIF(D2:D6,"啟用")'),
        requiredFunctions: ["COUNTIF"],
      }),
      task({
        id: prefix + "-sum-inactive",
        sheet: findData,
        target: "J3",
        taskLabel: L("条件查找", "Conditional lookup", "条件検索", "條件查找"),
        title: L("停用仓库的库存金额合计", "Total amount held by inactive warehouses", "停止中倉庫の在庫金額合計", "停用倉庫的庫存金額合計"),
        lead: L("在 J3 用 SUMIF 只加总状态为“停用”的金额。条件范围和求和范围都要对齐 D2:D6、G2:G6。", "In J3, use SUMIF to add only Inactive amounts. Align the criteria and sum ranges as D2:D6 and G2:G6.", "J3 で SUMIF を使い、状態が「停止中」の金額だけを合計します。条件範囲と合計範囲は D2:D6、G2:G6 にそろえます。", "在 J3 用 SUMIF 只加總狀態為「停用」的金額。條件範圍和加總範圍都要對齊 D2:D6、G2:G6。"),
        hint: L('参考：=SUMIF(D2:D6,"停用",G2:G6)。第三个参数才是金额列。', 'Reference: =SUMIF(D2:D6,"Inactive",G2:G6). The third argument is the amount column.', '参考：=SUMIF(D2:D6,"停止中",G2:G6)。3番目の引数が金額列です。', '參考：=SUMIF(D2:D6,"停用",G2:G6)。第三個參數才是金額欄。'),
        formula: L('=SUMIF(D2:D6,"停用",G2:G6)', '=SUMIF(D2:D6,"Inactive",G2:G6)', '=SUMIF(D2:D6,"停止中",G2:G6)', '=SUMIF(D2:D6,"停用",G2:G6)'),
        requiredFunctions: ["SUMIF"],
      }),
      task({
        id: prefix + "-count-quantity-at-least-eight",
        sheet: findData,
        target: "J4",
        taskLabel: L("条件查找", "Conditional lookup", "条件検索", "條件查找"),
        title: L("数量达到 8 的仓库有几座", "How many warehouses hold at least eight?", "数量8以上の倉庫はいくつあるか", "數量達到 8 的倉庫有幾座"),
        lead: L("在 J4 用 COUNTIF 和比较符统计 F2:F6 中大于等于 8 的记录。比较符必须包在引号里，和数字一起组成条件。", "In J4, use COUNTIF with a comparison operator to count F2:F6 at least 8. The operator stays inside the quoted criteria string.", "J4 で COUNTIF と比較演算子を使い、F2:F6 の8以上を数えます。比較演算子は引用符内の条件文字列に入れます。", "在 J4 用 COUNTIF 和比較符統計 F2:F6 中大於等於 8 的記錄。比較符必須包在引號裡，和數字一起組成條件。"),
        hint: L('参考：=COUNTIF(F2:F6,">=8")。不要把 >= 写在引号外面。', 'Reference: =COUNTIF(F2:F6,">=8"). Keep >= inside the quotes.', '参考：=COUNTIF(F2:F6,">=8")。>= は引用符の外に出しません。', '參考：=COUNTIF(F2:F6,">=8")。不要把 >= 寫在引號外面。'),
        formula: '=COUNTIF(F2:F6,">=8")',
        requiredFunctions: ["COUNTIF"],
      }),
      task({
        id: prefix + "-sum-active-large",
        sheet: findData,
        target: "J5",
        taskLabel: L("条件查找", "Conditional lookup", "条件検索", "條件查找"),
        title: L("启用且数量不少于 5 的金额合计", "Amount for active warehouses holding at least five", "稼働中かつ数量5以上の金額合計", "啟用且數量不少於 5 的金額合計"),
        lead: L("在 J5 用 SUMIFS 同时满足两个条件：状态为“启用”，数量大于等于 5。SUMIFS 的第一参数是先求和的金额列。", "In J5, use SUMIFS for two conditions: Active status and quantity at least five. Its first argument is the amount range to sum.", "J5 で SUMIFS を使い、状態が「稼働中」かつ数量が5以上という2条件を満たす金額を合計します。最初の引数が合計範囲です。", "在 J5 用 SUMIFS 同時滿足兩個條件：狀態為「啟用」，數量大於等於 5。SUMIFS 的第一個參數是先加總的金額欄。"),
        hint: L('参考：=SUMIFS(G2:G6,D2:D6,"启用",F2:F6,">=5")。SUMIFS 的金额范围在最前，SUMIF 的金额范围在最后。', 'Reference: =SUMIFS(G2:G6,D2:D6,"Active",F2:F6,">=5"). SUMIFS starts with the sum range; SUMIF puts it last.', '参考：=SUMIFS(G2:G6,D2:D6,"稼働中",F2:F6,">=5")。SUMIFS は合計範囲が先頭、SUMIF は最後です。', '參考：=SUMIFS(G2:G6,D2:D6,"啟用",F2:F6,">=5")。SUMIFS 的金額範圍在最前，SUMIF 的金額範圍在最後。'),
        formula: L('=SUMIFS(G2:G6,D2:D6,"启用",F2:F6,">=5")', '=SUMIFS(G2:G6,D2:D6,"Active",F2:F6,">=5")', '=SUMIFS(G2:G6,D2:D6,"稼働中",F2:F6,">=5")', '=SUMIFS(G2:G6,D2:D6,"啟用",F2:F6,">=5")'),
        requiredFunctions: ["SUMIFS"],
      }),
      task({
        id: prefix + "-logic-decision",
        sheet: findData,
        target: "J6",
        taskLabel: L("条件查找", "Conditional lookup", "条件検索", "條件查找"),
        title: L("启用仓库是否值得列入重点盘点", "Should active warehouses go on the priority review list?", "稼働中倉庫を重点棚卸しに入れるか", "啟用倉庫是否值得列入重點盤點"),
        lead: L("在 J6 组合 COUNTIF、SUMIF、AND 和 IF：启用仓库至少 3 座，且启用金额超过 10000，返回“重点”，否则返回“常规”。先分别算清楚两个条件，再交给 AND。", "In J6, combine COUNTIF, SUMIF, AND, and IF: at least three active warehouses and active amount above 10000 returns Priority; otherwise Routine. Work out both conditions before AND.", "J6 で COUNTIF・SUMIF・AND・IF を組み合わせます。稼働中が3件以上かつ金額が10000超なら「重点」、それ以外は「通常」です。2条件を先に求めます。", "在 J6 組合 COUNTIF、SUMIF、AND 和 IF：啟用倉庫至少 3 座，且啟用金額超過 10000，傳回「重點」，否則傳回「常規」。先分別算清楚兩個條件，再交給 AND。"),
        hint: L('参考：=IF(AND(COUNTIF(D2:D6,"启用")>=3,SUMIF(D2:D6,"启用",G2:G6)>10000),"重点","常规")。AND 里放两个完整的判断。', 'Reference: =IF(AND(COUNTIF(D2:D6,"Active")>=3,SUMIF(D2:D6,"Active",G2:G6)>10000),"Priority","Routine"). Put two complete tests inside AND.', '参考：=IF(AND(COUNTIF(D2:D6,"稼働中")>=3,SUMIF(D2:D6,"稼働中",G2:G6)>10000),"重点","通常")。AND には完全な判定を2つ入れます。', '參考：=IF(AND(COUNTIF(D2:D6,"啟用")>=3,SUMIF(D2:D6,"啟用",G2:G6)>10000),"重點","常規")。AND 裡放兩個完整的判斷。'),
        formula: L('=IF(AND(COUNTIF(D2:D6,"启用")>=3,SUMIF(D2:D6,"启用",G2:G6)>10000),"重点","常规")', '=IF(AND(COUNTIF(D2:D6,"Active")>=3,SUMIF(D2:D6,"Active",G2:G6)>10000),"Priority","Routine")', '=IF(AND(COUNTIF(D2:D6,"稼働中")>=3,SUMIF(D2:D6,"稼働中",G2:G6)>10000),"重点","通常")', '=IF(AND(COUNTIF(D2:D6,"啟用")>=3,SUMIF(D2:D6,"啟用",G2:G6)>10000),"重點","常規")'),
        requiredFunctions: ["IF", "AND", "COUNTIF", "SUMIF"],
      }),
      task({
        id: prefix + "-not-equal",
        sheet: findData,
        target: "J7",
        taskLabel: L("条件查找", "Conditional lookup", "条件検索", "條件查找"),
        title: L("不是启用状态的仓库有几座", "How many warehouses are not active?", "稼働中以外の倉庫はいくつあるか", "不是啟用狀態的倉庫有幾座"),
        lead: L("在 J7 用 COUNTIF 的“不等于”条件。Excel 条件里的不等号写作 <>，不是 !=。", "In J7, use COUNTIF with a not-equal criterion. Excel writes not-equal as <>, not !=.", "J7 で COUNTIF の「等しくない」条件を使います。Excel では <> と書き、!= ではありません。", "在 J7 用 COUNTIF 的「不等於」條件。Excel 條件裡的不等號寫作 <>，不是 !=。"),
        hint: L('参考：=COUNTIF(D2:D6,"<>启用")。', 'Reference: =COUNTIF(D2:D6,"<>Active").', '参考：=COUNTIF(D2:D6,"<>稼働中")。', '參考：=COUNTIF(D2:D6,"<>啟用")。'),
        formula: L('=COUNTIF(D2:D6,"<>启用")', '=COUNTIF(D2:D6,"<>Active")', '=COUNTIF(D2:D6,"<>稼働中")', '=COUNTIF(D2:D6,"<>啟用")'),
        requiredFunctions: ["COUNTIF"],
      }),
    ];
  }

  function filteredSubtotalTasks(prefix) {
    const rows = [
      { region: FILTER_REGIONS[0], target: "G12", expected: 6100 },
      { region: FILTER_REGIONS[1], target: "G13", expected: 7410 },
      { region: FILTER_REGIONS[2], target: "G14", expected: 3910 },
      { region: FILTER_REGIONS[3], target: "G15", expected: 6260 },
    ];
    return rows.map((item, index) => task({
      id: prefix + "-" + index,
      sheet: kpi,
      target: item.target,
      taskLabel: L("筛选后汇总", "Filtered total", "絞り込み後の集計", "篩選後彙總"),
      title: K.fill(L("筛选 {region} 后汇总销售额", "Total sales after filtering {region}", "{region} を絞り込んで売上を合計", "篩選 {region} 後彙總銷售額"), { region: item.region }),
      lead: K.fill(L("先选中 A1:G9 开启筛选，把区域收窄为 {region}；再在 {target} 使用 SUBTOTAL 9 汇总 C2:C9。检查会同时看筛选是否应用、隐藏行是否正确、公式是否只算可见行。", "Select A1:G9 and enable Filter, narrow Region to {region}, then use SUBTOTAL 9 on C2:C9 in {target}. The check verifies the filter, hidden rows, and visible-only formula.", "A1:G9 を選んで絞り込みを有効にし、地域を {region} に絞ります。次に {target} で SUBTOTAL 9 を使い C2:C9 を合計します。絞り込み・非表示行・表示行だけの数式をまとめて確認します。", "先選取 A1:G9 開啟篩選，把區域收窄為 {region}；再於 {target} 使用 SUBTOTAL 9 彙總 C2:C9。檢查會同時看篩選是否套用、隱藏列是否正確、公式是否只算可見列。"), item),
      hint: L("公式参考：=SUBTOTAL(9,C2:C9)。筛选也必须保持为题目要求的区域；只写公式不筛选不会通过。", "Reference: =SUBTOTAL(9,C2:C9). Keep the requested region filter applied; the formula alone is not enough.", "参考：=SUBTOTAL(9,C2:C9)。問題の地域に絞り込んだ状態も必要で、数式だけでは合格しません。", "公式參考：=SUBTOTAL(9,C2:C9)。篩選也必須保持為題目要求的區域；只寫公式不篩選不會通過。"),
      success: K.fill(L("已按 {region} 的筛选结果完成汇总。", "The total reflects the {region} filter.", "{region} の絞り込み結果で集計しました。", "已依 {region} 的篩選結果完成彙總。"), { region: item.region }),
      formula: "=SUBTOTAL(9,C2:C9)",
      expected: item.expected,
      requiredFunctions: ["SUBTOTAL"],
      operation: {
        type: "filter",
        range: "A1:G9",
        column: "B",
        selectedValue: item.region,
      },
    }));
  }

  function visibleDecisionTasks(prefix) {
    const rows = [
      {
        region: FILTER_REGIONS[0],
        target: "G12",
        formula: "=SUBTOTAL(9,C2:C9)>=6000",
        expected: true,
        title: L("华东可见销售额是否达到 6000", "Do visible East sales reach 6000?", "東部の表示売上は6000以上か", "東部可見銷售額是否達到 6000"),
        lead: L("筛选华东，再用 SUBTOTAL 汇总可见销售额，最后判断是否达到 6000。结果应为 TRUE 或 FALSE。", "Filter East, total visible sales with SUBTOTAL, then test whether it reaches 6000. The result should be TRUE or FALSE.", "東部に絞り、SUBTOTAL で表示売上を合計し、6000以上かを判定します。結果は TRUE か FALSE です。", "篩選東部，再用 SUBTOTAL 彙總可見銷售額，最後判斷是否達到 6000。結果應為 TRUE 或 FALSE。"),
      },
      {
        region: FILTER_REGIONS[1],
        target: "G13",
        formula: "=SUBTOTAL(3,A2:A9)>=2",
        expected: true,
        title: L("华北筛选后是否仍有至少两名销售", "Are at least two North reps still visible?", "北部の表示担当者は2名以上か", "北部篩選後是否仍有至少兩名銷售"),
        lead: L("筛选华北，用 SUBTOTAL 的 3 号功能统计可见姓名，再判断人数是否至少为 2。", "Filter North, count visible names with SUBTOTAL function 3, then test whether the count is at least 2.", "北部に絞り、SUBTOTAL の機能番号3で表示氏名を数え、2名以上かを判定します。", "篩選北部，用 SUBTOTAL 的 3 號功能統計可見姓名，再判斷人數是否至少為 2。"),
      },
      {
        region: FILTER_REGIONS[2],
        target: "G14",
        formula: "=SUBTOTAL(1,C2:C9)>=2500",
        expected: false,
        title: L("华南可见销售平均值是否达到 2500", "Does the visible South average reach 2500?", "南部の表示平均売上は2500以上か", "南部可見銷售平均值是否達到 2500"),
        lead: L("筛选华南，用 SUBTOTAL 的 1 号功能求可见平均值，再判断是否达到 2500。", "Filter South, use SUBTOTAL function 1 for the visible average, then test whether it reaches 2500.", "南部に絞り、SUBTOTAL の機能番号1で表示平均を求め、2500以上かを判定します。", "篩選南部，用 SUBTOTAL 的 1 號功能求可見平均值，再判斷是否達到 2500。"),
      },
      {
        region: FILTER_REGIONS[3],
        target: "G15",
        formula: "=SUBTOTAL(4,C2:C9)>=4000",
        expected: true,
        title: L("西南可见最高销售额是否达到 4000", "Does the highest visible Southwest sale reach 4000?", "南西部の表示最高売上は4000以上か", "西南部可見最高銷售額是否達到 4000"),
        lead: L("筛选西南，用 SUBTOTAL 的 4 号功能取可见最大值，再判断是否达到 4000。", "Filter Southwest, use SUBTOTAL function 4 for the visible maximum, then test whether it reaches 4000.", "南西部に絞り、SUBTOTAL の機能番号4で表示最大値を求め、4000以上かを判定します。", "篩選西南部，用 SUBTOTAL 的 4 號功能取可見最大值，再判斷是否達到 4000。"),
      },
    ];
    return rows.map((item, index) => task({
      id: prefix + "-" + index,
      sheet: kpi,
      target: item.target,
      taskLabel: L("筛选后判断", "Filtered decision", "絞り込み後の判断", "篩選後判斷"),
      title: item.title,
      lead: item.lead,
      hint: L("先应用题目要求的筛选，再用 SUBTOTAL；比较运算直接放在公式最后，不要漏掉 >=。", "Apply the required filter first, then use SUBTOTAL. Put the comparison at the end of the formula and keep >=.", "指定の絞り込みを適用してから SUBTOTAL を使います。比較演算子 >= を最後に残します。", "先套用題目要求的篩選，再用 SUBTOTAL；比較運算直接放在公式最後，不要漏掉 >=。"),
      success: L("筛选状态与可见数据判断都已核对。", "The filter and visible-data decision both check out.", "絞り込み状態と表示データの判断を確認しました。", "篩選狀態與可見資料判斷都已核對。"),
      formula: item.formula,
      expected: item.expected,
      requiredFunctions: ["SUBTOTAL"],
      operation: {
        type: "filter",
        range: "A1:G9",
        column: "B",
        selectedValue: item.region,
      },
    }));
  }

  function sumproductTasks(prefix) {
    return buildTasks(prefix, [
      {
        key: "list-total", target: "K2", sheet: orders, formula: "=SUMPRODUCT(E2:E11,F2:F11)", functions: ["SUMPRODUCT"], taskLabel: labels.sumproduct,
        title: L("按数量和单价算未折扣总额", "List-price total from quantity and unit price", "数量×単価の割引前合計"),
        lead: L("在 K2 用 SUMPRODUCT 把 E 列数量与 F 列单价逐行相乘后汇总。", "In K2, use SUMPRODUCT to multiply quantity E by price F row by row and total.", "K2 で SUMPRODUCT を使い、数量E列と単価F列を行ごとに掛けて合計します。"),
        success: L("SUMPRODUCT 不需要先建辅助金额列。", "SUMPRODUCT avoids a helper amount column.", "SUMPRODUCT は補助列なしで計算できます。"),
      },
      {
        key: "discount-total", target: "K3", sheet: orders, formula: "=SUMPRODUCT(E2:E11,F2:F11)-SUM(H2:H11)", functions: ["SUMPRODUCT", "SUM"], taskLabel: labels.sumproduct,
        title: L("全部订单的折扣优惠额", "Total discount across orders", "全注文の割引額"),
        lead: L("在 K3 用未折扣总额减去 H 列实收金额，得到所有折扣优惠。", "In K3, subtract received amount H from list total to get total discount.", "K3 で割引前合計から H 列の実収金額を引き、総割引額を求めます。"),
      },
      {
        key: "list-vs-real", target: "K4", sheet: orders, formula: "=ROUND(SUMPRODUCT(E2:E11,F2:F11)/SUM(H2:H11),2)", functions: ["ROUND", "SUMPRODUCT", "SUM"], taskLabel: labels.sumproduct,
        title: L("标价总额是实收的几倍", "List total as a multiple of received amount", "定価合計は実収の何倍か"),
        lead: L("在 K4 用未折扣总额除以实收总额，保留两位。", "In K4, divide list total by received total and round.", "K4 で割引前合計を実収合計で割り、丸めます。"),
      },
      {
        key: "sales-commission", target: "K5", sheet: orders, formula: "=ROUND(SUMPRODUCT(E2:E11,F2:F11)*0.03,0)", functions: ["ROUND", "SUMPRODUCT"], taskLabel: labels.sumproduct,
        title: L("按标价总额预提 3% 服务费", "Accrue 3% service fee on list total", "定価合計の3%をサービス費として計上"),
        lead: L("在 K5 用 SUMPRODUCT 的总额乘 3%，取整到元。", "In K5, multiply the SUMPRODUCT total by 3% and round.", "K5 で SUMPRODUCT の合計に3%を掛け、整数に丸めます。"),
      },
      {
        key: "avg-unit-price", target: "K6", sheet: orders, formula: "=ROUND(SUMPRODUCT(E2:E11,F2:F11)/SUM(E2:E11),2)", functions: ["ROUND", "SUMPRODUCT", "SUM"], taskLabel: labels.sumproduct,
        title: L("全部商品的加权平均单价", "Weighted average unit price", "全商品の加重平均単価"),
        lead: L("在 K6 用商品金额合计除以数量合计，得到加权平均单价。", "In K6, divide total list amount by total quantity for a weighted average price.", "K6 で合計金額を合計数量で割り、加重平均単価を求めます。"),
      },
      {
        key: "rounded-list", target: "K7", sheet: orders, formula: "=ROUND(SUMPRODUCT(E2:E11,F2:F11),-2)", functions: ["ROUND", "SUMPRODUCT"], taskLabel: labels.sumproduct,
        title: L("未折扣总额四舍五入到百元", "Round list total to hundreds", "割引前合計を百単位に丸める"),
        lead: L("在 K7 求未折扣总额，再用 ROUND 的第二参数 -2 取到百元。", "In K7, calculate list total and round to hundreds with -2.", "K7 で割引前合計を求め、ROUND の第2引数 -2 で百単位にします。"),
      },
      {
        key: "weighted-discount", target: "K8", sheet: orders, formula: "=ROUND(SUMPRODUCT(E2:E11,F2:F11,G2:G11)/SUMPRODUCT(E2:E11,F2:F11),3)", functions: ["ROUND", "SUMPRODUCT"], taskLabel: labels.review,
        title: L("按金额加权的平均折扣率", "Amount-weighted average discount", "金額加重の平均割引率"),
        lead: L("在 K8 用数量×单价×折扣的乘积和，除以数量×单价的乘积和，保留三位。", "In K8, divide the product sum of qty × price × discount by qty × price and round to three decimals.", "K8 で数量×単価×割引の積和を数量×単価の積和で割り、小数3桁にします。"),
      },
      {
        key: "high-orders", target: "K9", sheet: orders, formula: '=COUNTIF(H2:H11,">5000")', functions: ["COUNTIF"], taskLabel: labels.review,
        title: L("高额订单数量", "Number of high-value orders", "高額注文件数"),
        lead: L("在 K9 用 COUNTIF 统计 H2:H11 中大于 5000 的订单。复习条件计数。", "In K9, COUNTIF H2:H11 for amounts above 5000.", "K9 で COUNTIF を使い H2:H11 の5000超を数えます。"),
        hint: L('参考：=COUNTIF(H2:H11,">5000")', 'Reference: =COUNTIF(H2:H11,">5000")', '参考：=COUNTIF(H2:H11,">5000")'),
      },
    ]);
  }

  function rankScenarioTasks(prefix) {
    return [
      task({
        id: prefix + "-champion", sheet: kpi, target: "G2", taskLabel: labels.rank,
        title: L("标记季度销售冠军", "Flag the quarterly sales champion", "四半期売上の首位を表示"),
        lead: L("在 G2 判断 C2 是否等于 C2:C9 的最大值，返回 TOP 或 -。", "In G2, test whether C2 is the maximum of C2:C9 and return TOP or -.", "G2 で C2 が C2:C9 の最大値かを判定し、TOP か - を返します。"),
        hint: L('参考：=IF(C2=MAX($C$2:$C$9),"TOP","-")', 'Reference: =IF(C2=MAX($C$2:$C$9),"TOP","-")', '参考：=IF(C2=MAX($C$2:$C$9),"TOP","-")'),
        formula: '=IF(C2=MAX($C$2:$C$9),"TOP","-")', requiredFunctions: ["IF", "MAX"],
      }),
      task({
        id: prefix + "-top3", sheet: kpi, target: "G3", taskLabel: labels.rank,
        title: L("前三名进入重点名单", "Flag the top three for priority review", "上位3名を重点リストに"),
        lead: L("在 G3 用 RANK 判断陈凯是否在前三名，返回 TOP3 或 WATCH。", "In G3, use RANK to test whether Chen is in the top three and return TOP3 or WATCH.", "G3 で RANK を使い陳さんが上位3位かを判定し、TOP3 か WATCH を返します。"),
        hint: L('参考：=IF(RANK(C3,$C$2:$C$9,0)<=3,"TOP3","WATCH")', 'Reference: =IF(RANK(C3,$C$2:$C$9,0)<=3,"TOP3","WATCH")', '参考：=IF(RANK(C3,$C$2:$C$9,0)<=3,"TOP3","WATCH")'),
        formula: '=IF(RANK(C3,$C$2:$C$9,0)<=3,"TOP3","WATCH")', requiredFunctions: ["IF", "RANK"], requiredText: ["$C$2:$C$9"],
      }),
      task({
        id: prefix + "-priority", sheet: kpi, target: "G4", taskLabel: labels.review,
        title: L("达标且前三的优先跟进", "Priority follow-up for top-three reps above target", "達成かつ上位3位を優先"),
        lead: L("在 G4 同时判断 E4 是否达到 90%，以及 RANK 是否进入前三。两项都成立返回 PRIORITY，否则 WATCH。", "In G4, test whether E4 is at least 90% and RANK is in the top three. Return PRIORITY only when both hold.", "G4 で E4 が90%以上かつ RANK が上位3位かを判定します。両方成立なら PRIORITY、それ以外は WATCH です。"),
        hint: L('参考：=IF(AND(E4>=0.9,RANK(C4,$C$2:$C$9,0)<=3),"PRIORITY","WATCH")', 'Reference: =IF(AND(E4>=0.9,RANK(C4,$C$2:$C$9,0)<=3),"PRIORITY","WATCH")', '参考：=IF(AND(E4>=0.9,RANK(C4,$C$2:$C$9,0)<=3),"PRIORITY","WATCH")'),
        formula: '=IF(AND(E4>=0.9,RANK(C4,$C$2:$C$9,0)<=3),"PRIORITY","WATCH")', requiredFunctions: ["IF", "AND", "RANK"], requiredText: ["$C$2:$C$9"],
      }),
      task({
        id: prefix + "-last", sheet: kpi, target: "G5", taskLabel: labels.review,
        title: L("末位需要复盘", "Flag the bottom-ranked rep", "最下位は振り返り"),
        lead: L("在 G5 用 RANK 找出赵敏是否排第 8 名，返回 REVIEW 或 OK。", "In G5, use RANK to test whether Zhao ranks eighth and return REVIEW or OK.", "G5 で RANK を使い趙さんが8位かを判定し、REVIEW か OK を返します。"),
        hint: L('参考：=IF(RANK(C5,$C$2:$C$9,0)=8,"REVIEW","OK")', 'Reference: =IF(RANK(C5,$C$2:$C$9,0)=8,"REVIEW","OK")', '参考：=IF(RANK(C5,$C$2:$C$9,0)=8,"REVIEW","OK")'),
        formula: '=IF(RANK(C5,$C$2:$C$9,0)=8,"REVIEW","OK")', requiredFunctions: ["IF", "RANK"], requiredText: ["$C$2:$C$9"],
      }),
      task({
        id: prefix + "-bonus", sheet: kpi, target: "G6", taskLabel: labels.rank,
        title: L("前三名按销售额预提奖金", "Accrue bonus for the top three", "上位3名の売上に応じた賞与"),
        lead: L("在 G6 用 IF 判断王磊是否前三；进入前三就按 C6 的 5% 计提并取整，否则为 0。", "In G6, test whether Wang is in the top three. If so, accrue 5% of C6 and round; otherwise return 0.", "G6 で王さんが上位3位かを判定し、該当なら C6 の5%を丸めて計上、それ以外は0にします。"),
        hint: L('参考：=IF(RANK(C6,$C$2:$C$9,0)<=3,ROUND(C6*0.05,0),0)', 'Reference: =IF(RANK(C6,$C$2:$C$9,0)<=3,ROUND(C6*0.05,0),0)', '参考：=IF(RANK(C6,$C$2:$C$9,0)<=3,ROUND(C6*0.05,0),0)'),
        formula: '=IF(RANK(C6,$C$2:$C$9,0)<=3,ROUND(C6*0.05,0),0)', requiredFunctions: ["IF", "RANK", "ROUND"], requiredText: ["$C$2:$C$9"],
      }),
      task({
        id: prefix + "-countif-rank", sheet: kpi, target: "G7", taskLabel: labels.review,
        title: L("不直接用 RANK，也算出孙悦的名次", "Rebuild a rank with COUNTIF", "COUNTIF で順位を組み立てる"),
        lead: L("在 G7 用 COUNTIF 统计比 C7 大的销售额个数，再加 1。这是降序排名的另一种写法。", "In G7, count sales greater than C7 with COUNTIF and add 1. This is another descending-rank pattern.", "G7 で COUNTIF を使い C7 より大きい売上の件数を数え、1を足します。"),
        hint: L('参考：=COUNTIF($C$2:$C$9,">"&C7)+1', 'Reference: =COUNTIF($C$2:$C$9,">"&C7)+1', '参考：=COUNTIF($C$2:$C$9,">"&C7)+1'),
        formula: '=COUNTIF($C$2:$C$9,">"&C7)+1', requiredFunctions: ["COUNTIF"],
      }),
      task({
        id: prefix + "-gap", sheet: kpi, target: "G8", taskLabel: labels.review,
        title: L("李然与冠军差多少", "Li's gap to the champion", "李さんの首位との差"),
        lead: L("在 G8 用最大值减去 C8，复习极值与前章引用。", "In G8, subtract C8 from the maximum, reviewing extremes and references.", "G8 で最大値から C8 を引き、最大値と参照を復習します。"),
        hint: L("参考：=MAX($C$2:$C$9)-C8", "Reference: =MAX($C$2:$C$9)-C8", "参考：=MAX($C$2:$C$9)-C8"),
        formula: "=MAX($C$2:$C$9)-C8", requiredFunctions: ["MAX"],
      }),
      task({
        id: prefix + "-champ-attainment", sheet: kpi, target: "G9", taskLabel: labels.review,
        title: L("冠军的达成率是多少", "What is the champion's attainment?", "首位の達成率"),
        lead: L("在 G9 先找 C2:C9 的最大值，再用 MATCH 定位行号，最后用 INDEX 取对应 E 列达成率。复习查找组合。", "In G9, find the maximum in C2:C9, locate its row with MATCH, and retrieve the matching E-column attainment with INDEX.", "G9 で C2:C9 の最大値を探し、MATCH で行を特定し、INDEX で対応する E 列の達成率を取得します。"),
        hint: L("参考：=INDEX(E2:E9,MATCH(MAX($C$2:$C$9),$C$2:$C$9,0))", "Reference: =INDEX(E2:E9,MATCH(MAX($C$2:$C$9),$C$2:$C$9,0))", "参考：=INDEX(E2:E9,MATCH(MAX($C$2:$C$9),$C$2:$C$9,0))"),
        formula: "=INDEX(E2:E9,MATCH(MAX($C$2:$C$9),$C$2:$C$9,0))", requiredFunctions: ["INDEX", "MATCH", "MAX"],
      }),
    ];
  }

  function rankCheckTasks(prefix) {
    return [
      task({
        id: prefix + "-avg-ratio", sheet: kpi, target: "H2", taskLabel: labels.review,
        title: L("团队销售与目标比例", "Team sales to target ratio", "チーム売上の目標比率"),
        lead: L("在 H2 用 SUM 汇总销售额和目标，再相除并保留两位。", "In H2, total sales and target, divide, and round to two decimals.", "H2 で売上と目標を SUM して割り、小数2桁にします。"),
        hint: L("参考：=ROUND(SUM(C2:C9)/SUM(D2:D9),2)", "Reference: =ROUND(SUM(C2:C9)/SUM(D2:D9),2)", "参考：=ROUND(SUM(C2:C9)/SUM(D2:D9),2)"),
        formula: "=ROUND(SUM(C2:C9)/SUM(D2:D9),2)", requiredFunctions: ["ROUND", "SUM"],
      }),
      task({
        id: prefix + "-strong-team", sheet: kpi, target: "H3", taskLabel: labels.review,
        title: L("至少三人销售额超过 4000 吗", "Are at least three reps above 4000?", "4000超が3名以上か"),
        lead: L("在 H3 用 COUNTIF 统计 C2:C9 中大于等于 4000 的人数，再用 IF 返回 STRONG 或 WATCH。", "In H3, COUNTIF C2:C9 for values at least 4000, then return STRONG or WATCH with IF.", "H3 で C2:C9 の4000以上を COUNTIF し、IF で STRONG か WATCH を返します。"),
        hint: L('参考：=IF(COUNTIF(C2:C9,">=4000")>=3,"STRONG","WATCH")', 'Reference: =IF(COUNTIF(C2:C9,">=4000")>=3,"STRONG","WATCH")', '参考：=IF(COUNTIF(C2:C9,">=4000")>=3,"STRONG","WATCH")'),
        formula: '=IF(COUNTIF(C2:C9,">=4000")>=3,"STRONG","WATCH")', requiredFunctions: ["IF", "COUNTIF"],
      }),
      task({
        id: prefix + "-avg-round", sheet: kpi, target: "H4", taskLabel: labels.review,
        title: L("全班季度销售额平均", "Average quarterly sales across the team", "全員の四半期売上平均"),
        lead: L("在 H4 求 C2:C9 的平均并取整。用 AVERAGE 而不是把每个格子手打相加。", "In H4, average C2:C9 and round. Use AVERAGE instead of typing every cell by hand.", "H4 で C2:C9 の平均を求め、整数にします。"),
        hint: L("参考：=ROUND(AVERAGE(C2:C9),0)", "Reference: =ROUND(AVERAGE(C2:C9),0)", "参考：=ROUND(AVERAGE(C2:C9),0)"),
        formula: "=ROUND(AVERAGE(C2:C9),0)", requiredFunctions: ["ROUND", "AVERAGE"],
      }),
      task({
        id: prefix + "-spread", sheet: kpi, target: "H5", taskLabel: labels.review,
        title: L("最高与最低销售额的差距", "Spread between highest and lowest sales", "最高売上と最低売上の差"),
        lead: L("在 H5 用 MAX 减 MIN。", "In H5, subtract MIN from MAX.", "H5 で MAX から MIN を引きます。"),
        hint: L("参考：=MAX(C2:C9)-MIN(C2:C9)", "Reference: =MAX(C2:C9)-MIN(C2:C9)", "参考：=MAX(C2:C9)-MIN(C2:C9)"),
        formula: "=MAX(C2:C9)-MIN(C2:C9)", requiredFunctions: ["MAX", "MIN"],
      }),
      task({
        id: prefix + "-rank-combo", sheet: kpi, target: "H6", taskLabel: labels.review,
        title: L("名次与高销售额人数相加", "Combine a rank with the count above target", "順位と高売上人数を合計"),
        lead: L("在 H6 把王磊的季度排名加上销售额超过 4000 的人数。", "In H6, add the rank of Wang to the count of reps above 4000.", "H6 で王さんの順位と4000超の人数を足します。"),
        hint: L('参考：=RANK(C6,$C$2:$C$9,0)+COUNTIF(C2:C9,">4000")', 'Reference: =RANK(C6,$C$2:$C$9,0)+COUNTIF(C2:C9,">4000")', '参考：=RANK(C6,$C$2:$C$9,0)+COUNTIF(C2:C9,">4000")'),
        formula: '=RANK(C6,$C$2:$C$9,0)+COUNTIF(C2:C9,">4000")', requiredFunctions: ["RANK", "COUNTIF"],
      }),
      task({
        id: prefix + "-top-half", sheet: kpi, target: "H7", taskLabel: labels.review,
        title: L("上半区才给团队平均额", "Give the team average only to the upper half", "上位半分にチーム平均を表示"),
        lead: L("在 H7 判断孙悦的排名是否在 4 名以内。是则返回团队平均值（取整），否则返回 0。", "In H7, test whether Sun is within the top four. If yes, return the rounded team average; otherwise 0.", "H7 で孫さんが4位以内かを判定し、該当ならチーム平均の整数、それ以外は0を返します。"),
        hint: L("参考：=IF(RANK(C7,$C$2:$C$9,0)<=4,ROUND(AVERAGE(C2:C9),0),0)", "Reference: =IF(RANK(C7,$C$2:$C$9,0)<=4,ROUND(AVERAGE(C2:C9),0),0)", "参考：=IF(RANK(C7,$C$2:$C$9,0)<=4,ROUND(AVERAGE(C2:C9),0),0)"),
        formula: "=IF(RANK(C7,$C$2:$C$9,0)<=4,ROUND(AVERAGE(C2:C9),0),0)", requiredFunctions: ["IF", "RANK", "ROUND", "AVERAGE"], requiredText: ["$C$2:$C$9"],
      }),
      task({
        id: prefix + "-target-gap", sheet: kpi, target: "H8", taskLabel: labels.review,
        title: L("当前目标缺口总额", "Total gap to target", "目標不足額の合計"),
        lead: L("在 H8 用目标和总额减销售总额，得到团队还差多少。", "In H8, subtract total sales from total target to get the team's shortfall.", "H8 で目標合計から売上合計を引き、チームの不足額を求めます。"),
        hint: L("参考：=SUM(D2:D9)-SUM(C2:C9)", "Reference: =SUM(D2:D9)-SUM(C2:C9)", "参考：=SUM(D2:D9)-SUM(C2:C9)"),
        formula: "=SUM(D2:D9)-SUM(C2:C9)", requiredFunctions: ["SUM"],
      }),
      task({
        id: prefix + "-rounded-team", sheet: kpi, target: "H9", taskLabel: labels.review,
        title: L("团队总销售额按百元取整", "Round team sales to hundreds", "チーム売上を百単位に丸める"),
        lead: L("在 H9 汇总 C2:C9，再用 ROUND 的第二参数 -2 取到百元。", "In H9, total C2:C9, then round to hundreds with ROUND's -2 argument.", "H9 で C2:C9 を合計し、ROUND の第2引数 -2 で百単位にします。"),
        hint: L("参考：=ROUND(SUM(C2:C9),-2)", "Reference: =ROUND(SUM(C2:C9),-2)", "参考：=ROUND(SUM(C2:C9),-2)"),
        formula: "=ROUND(SUM(C2:C9),-2)", requiredFunctions: ["ROUND", "SUM"],
      }),
    ];
  }

  function subtotalReviewTasks(prefix) {
    return [
      task({
        id: prefix + "-met", sheet: kpi, target: "G2", taskLabel: labels.review,
        title: L("筛选后的销售是否达到 2 万", "Do visible sales reach 20,000?", "表示中の売上は2万以上か"),
        lead: K.fill(L("先把区域筛选为 {region}，再在 G2 用 SUBTOTAL 9 汇总 C2:C9，并用 IF 返回 MET 或 SHORT。", "Filter Region to {region}, then use SUBTOTAL 9 on C2:C9 in G2 and return MET or SHORT with IF.", "地域を {region} に絞り、G2 で C2:C9 を SUBTOTAL 9 し、IF で MET か SHORT を返します。", "先把區域篩選為 {region}，再於 G2 用 SUBTOTAL 9 彙總 C2:C9，並用 IF 傳回 MET 或 SHORT。"), { region: FILTER_REGIONS[0] }),
        hint: L('参考：=IF(SUBTOTAL(9,C2:C9)>=20000,"MET","SHORT")', 'Reference: =IF(SUBTOTAL(9,C2:C9)>=20000,"MET","SHORT")', '参考：=IF(SUBTOTAL(9,C2:C9)>=20000,"MET","SHORT")'),
        formula: '=IF(SUBTOTAL(9,C2:C9)>=20000,"MET","SHORT")', requiredFunctions: ["IF", "SUBTOTAL"],
        expected: "SHORT",
        operation: { type: "filter", range: "A1:G9", column: "B", selectedValue: FILTER_REGIONS[0] },
      }),
      task({
        id: prefix + "-avg-ticket", sheet: kpi, target: "G3", taskLabel: labels.review,
        title: L("可见销售额折算人均", "Visible sales per person", "表示売上を人数で割る"),
        lead: K.fill(L("筛选 {region}，在 G3 用 SUBTOTAL 9 汇总销售额，再除以 SUBTOTAL 3 统计的可见人数并取整。", "Filter {region}, then SUBTOTAL 9 sales in G3, divide by SUBTOTAL 3 headcount, and round.", "{region} に絞り、G3 で SUBTOTAL 9 の売上を SUBTOTAL 3 の人数で割って整数にします。", "篩選 {region}，在 G3 用 SUBTOTAL 9 彙總銷售額，再除以 SUBTOTAL 3 統計的可見人數並取整。"), { region: FILTER_REGIONS[0] }),
        hint: L("参考：=ROUND(SUBTOTAL(9,C2:C9)/SUBTOTAL(3,A2:A9),0)", "Reference: =ROUND(SUBTOTAL(9,C2:C9)/SUBTOTAL(3,A2:A9),0)", "参考：=ROUND(SUBTOTAL(9,C2:C9)/SUBTOTAL(3,A2:A9),0)"),
        formula: "=ROUND(SUBTOTAL(9,C2:C9)/SUBTOTAL(3,A2:A9),0)", requiredFunctions: ["ROUND", "SUBTOTAL"],
        expected: 3050,
        operation: { type: "filter", range: "A1:G9", column: "B", selectedValue: FILTER_REGIONS[0] },
      }),
      task({
        id: prefix + "-spread", sheet: kpi, target: "G4", taskLabel: labels.review,
        title: L("筛选后的销售极差", "Visible sales spread", "表示売上の範囲"),
        lead: K.fill(L("筛选 {region}，在 G4 用 SUBTOTAL 4 减 SUBTOTAL 5，得到当前可见销售额的极差。", "Filter {region}, then subtract SUBTOTAL 5 from SUBTOTAL 4 in G4 to get the visible sales spread.", "{region} に絞り、G4 で SUBTOTAL 4 から SUBTOTAL 5 を引き、表示売上の範囲を求めます。", "篩選 {region}，在 G4 用 SUBTOTAL 4 減 SUBTOTAL 5，得到目前可見銷售額的極差。"), { region: FILTER_REGIONS[1] }),
        hint: L("参考：=SUBTOTAL(4,C2:C9)-SUBTOTAL(5,C2:C9)", "Reference: =SUBTOTAL(4,C2:C9)-SUBTOTAL(5,C2:C9)", "参考：=SUBTOTAL(4,C2:C9)-SUBTOTAL(5,C2:C9)"),
        formula: "=SUBTOTAL(4,C2:C9)-SUBTOTAL(5,C2:C9)", requiredFunctions: ["SUBTOTAL"],
        expected: 870,
        operation: { type: "filter", range: "A1:G9", column: "B", selectedValue: FILTER_REGIONS[1] },
      }),
      task({
        id: prefix + "-complete", sheet: kpi, target: "G5", taskLabel: labels.review,
        title: L("姓名数与销售额个数是否一致", "Do names and numeric sales match?", "氏名数と数値売上数は一致するか"),
        lead: K.fill(L("筛选 {region}，在 G5 比较 SUBTOTAL 3 的姓名数和 SUBTOTAL 2 的数字个数，返回 COMPLETE 或 CHECK。", "Filter {region}, then compare SUBTOTAL 3 names with SUBTOTAL 2 numeric cells in G5 and return COMPLETE or CHECK.", "{region} に絞り、G5 で SUBTOTAL 3 の氏名数と SUBTOTAL 2 の数値数を比較し、COMPLETE か CHECK を返します。", "篩選 {region}，在 G5 比較 SUBTOTAL 3 的姓名數和 SUBTOTAL 2 的數字個數，傳回 COMPLETE 或 CHECK。"), { region: FILTER_REGIONS[2] }),
        hint: L('参考：=IF(SUBTOTAL(2,C2:C9)=SUBTOTAL(3,A2:A9),"COMPLETE","CHECK")', 'Reference: =IF(SUBTOTAL(2,C2:C9)=SUBTOTAL(3,A2:A9),"COMPLETE","CHECK")', '参考：=IF(SUBTOTAL(2,C2:C9)=SUBTOTAL(3,A2:A9),"COMPLETE","CHECK")'),
        formula: '=IF(SUBTOTAL(2,C2:C9)=SUBTOTAL(3,A2:A9),"COMPLETE","CHECK")', requiredFunctions: ["IF", "SUBTOTAL"],
        expected: "COMPLETE",
        operation: { type: "filter", range: "A1:G9", column: "B", selectedValue: FILTER_REGIONS[2] },
      }),
      task({
        id: prefix + "-gap", sheet: kpi, target: "G6", taskLabel: labels.review,
        title: L("可见销售与可见目标的差额", "Visible sales gap to target", "表示売上と目標の差"),
        lead: K.fill(L("筛选 {region}，在 G6 用 SUBTOTAL 9 分别汇总销售额和目标，再相减。", "Filter {region}, then use SUBTOTAL 9 on sales and target in G6 and subtract.", "{region} に絞り、G6 で売上と目標をそれぞれ SUBTOTAL 9 し、差を取ります。", "篩選 {region}，在 G6 用 SUBTOTAL 9 分別彙總銷售額和目標，再相減。"), { region: FILTER_REGIONS[3] }),
        hint: L("参考：=SUBTOTAL(9,C2:C9)-SUBTOTAL(9,D2:D9)", "Reference: =SUBTOTAL(9,C2:C9)-SUBTOTAL(9,D2:D9)", "参考：=SUBTOTAL(9,C2:C9)-SUBTOTAL(9,D2:D9)"),
        formula: "=SUBTOTAL(9,C2:C9)-SUBTOTAL(9,D2:D9)", requiredFunctions: ["SUBTOTAL"],
        expected: -440,
        operation: { type: "filter", range: "A1:G9", column: "B", selectedValue: FILTER_REGIONS[3] },
      }),
      task({
        id: prefix + "-above", sheet: kpi, target: "G7", taskLabel: labels.review,
        title: L("平均销售额是否高于平均目标", "Is average sales above average target?", "平均売上は平均目標を上回るか"),
        lead: K.fill(L("筛选 {region}，在 G7 比较两个可见平均值，返回 ABOVE 或 BELOW。", "Filter {region}, then compare the two visible averages in G7 and return ABOVE or BELOW.", "{region} に絞り、G7 で2つの表示平均を比較し、ABOVE か BELOW を返します。", "篩選 {region}，在 G7 比較兩個可見平均值，傳回 ABOVE 或 BELOW。"), { region: FILTER_REGIONS[1] }),
        hint: L('参考：=IF(SUBTOTAL(1,C2:C9)>SUBTOTAL(1,D2:D9),"ABOVE","BELOW")', 'Reference: =IF(SUBTOTAL(1,C2:C9)>SUBTOTAL(1,D2:D9),"ABOVE","BELOW")', '参考：=IF(SUBTOTAL(1,C2:C9)>SUBTOTAL(1,D2:D9),"ABOVE","BELOW")'),
        formula: '=IF(SUBTOTAL(1,C2:C9)>SUBTOTAL(1,D2:D9),"ABOVE","BELOW")', requiredFunctions: ["IF", "SUBTOTAL"],
        expected: "BELOW",
        operation: { type: "filter", range: "A1:G9", column: "B", selectedValue: FILTER_REGIONS[1] },
      }),
      task({
        id: prefix + "-fee", sheet: kpi, target: "G8", taskLabel: labels.review,
        title: L("按可见销售额预提 2% 服务费", "Accrue 2% service fee on visible sales", "表示売上の2%を計上"),
        lead: K.fill(L("筛选 {region}，在 G8 对 SUBTOTAL 9 的结果乘 2%，再取整，得到可见销售额对应的服务费。", "Filter {region}, then multiply the SUBTOTAL 9 result by 2% in G8 and round for the visible-sales service fee.", "{region} に絞り、G8 で SUBTOTAL 9 の結果に2%を掛けて整数にし、表示売上のサービス費を求めます。", "篩選 {region}，在 G8 對 SUBTOTAL 9 的結果乘 2%，再取整，得到可見銷售額對應的服務費。"), { region: FILTER_REGIONS[3] }),
        hint: L("参考：=ROUND(SUBTOTAL(9,C2:C9)*0.02,0)", "Reference: =ROUND(SUBTOTAL(9,C2:C9)*0.02,0)", "参考：=ROUND(SUBTOTAL(9,C2:C9)*0.02,0)"),
        formula: "=ROUND(SUBTOTAL(9,C2:C9)*0.02,0)", requiredFunctions: ["ROUND", "SUBTOTAL"],
        expected: 125,
        operation: { type: "filter", range: "A1:G9", column: "B", selectedValue: FILTER_REGIONS[3] },
      }),
      task({
        id: prefix + "-target-cut", sheet: kpi, target: "G9", taskLabel: labels.review,
        title: L("可见目标下调 10% 后的总额", "Visible target after a 10% cut", "表示目標を10%削減"),
        lead: K.fill(L("筛选 {region}，在 G9 先用 SUBTOTAL 9 汇总目标，再整体乘 0.9 并取整。", "Filter {region}, then SUBTOTAL 9 the targets in G9, multiply by 0.9, and round.", "{region} に絞り、G9 で目標を SUBTOTAL 9 し、0.9を掛けて丸めます。", "篩選 {region}，在 G9 先用 SUBTOTAL 9 彙總目標，再整體乘 0.9 並取整。"), { region: FILTER_REGIONS[2] }),
        hint: L("参考：=ROUND(SUBTOTAL(9,D2:D9)*0.9,0)", "Reference: =ROUND(SUBTOTAL(9,D2:D9)*0.9,0)", "参考：=ROUND(SUBTOTAL(9,D2:D9)*0.9,0)"),
        formula: "=ROUND(SUBTOTAL(9,D2:D9)*0.9,0)", requiredFunctions: ["ROUND", "SUBTOTAL"],
        expected: 4320,
        operation: { type: "filter", range: "A1:G9", column: "B", selectedValue: FILTER_REGIONS[2] },
      }),
    ];
  }

  function subtotalCheckTasks(prefix) {
    return [
      task({
        id: prefix + "-count-high", sheet: kpi, target: "H2", taskLabel: labels.review,
        title: L("高销售额人数", "Count high performers", "高売上の人数"),
        lead: L("在 H2 用 COUNTIF 统计 C2:C9 中大于 3500 的人数，复习条件计数。", "In H2, COUNTIF C2:C9 for values above 3500.", "H2 で C2:C9 の3500超を COUNTIF で数えます。"),
        hint: L('参考：=COUNTIF(C2:C9,">3500")', 'Reference: =COUNTIF(C2:C9,">3500")', '参考：=COUNTIF(C2:C9,">3500")'),
        formula: '=COUNTIF(C2:C9,">3500")', requiredFunctions: ["COUNTIF"],
      }),
      task({
        id: prefix + "-east", sheet: kpi, target: "H3", taskLabel: labels.review,
        title: L("华东季度销售额", "East quarterly sales", "東部の四半期売上"),
        lead: L("在 H3 用 SUMIF 汇总华东区域的 C 列销售额。", "In H3, SUMIF East from column C.", "H3 で東部の C 列売上を SUMIF します。"),
        hint: L('参考：=SUMIF(B2:B9,"华东",C2:C9)', 'Reference: =SUMIF(B2:B9,"East",C2:C9)', '参考：=SUMIF(B2:B9,"東部",C2:C9)'),
        formula: '=SUMIF(B2:B9,"华东",C2:C9)', requiredFunctions: ["SUMIF"],
      }),
      task({
        id: prefix + "-avg-visible", sheet: kpi, target: "H4", taskLabel: labels.review,
        title: L("未筛选时的平均销售额取整", "Rounded average with no filter", "未絞り込みの平均売上を丸める"),
        lead: L("当前没有筛选。在 H4 用 SUBTOTAL 1 求 C2:C9 的平均，再取整；没有筛选时它和 AVERAGE 的结果相同。", "No filter is applied. Use SUBTOTAL 1 on C2:C9 in H4 and round; with no filter it matches AVERAGE.", "現在は絞り込みがありません。H4 で SUBTOTAL 1 を C2:C9 に使い、整数にします。絞り込みがない場合は AVERAGE と同じ結果です。"),
        hint: L("参考：=ROUND(SUBTOTAL(1,C2:C9),0)", "Reference: =ROUND(SUBTOTAL(1,C2:C9),0)", "参考：=ROUND(SUBTOTAL(1,C2:C9),0)"),
        formula: "=ROUND(SUBTOTAL(1,C2:C9),0)", requiredFunctions: ["ROUND", "SUBTOTAL"],
      }),
      task({
        id: prefix + "-avg-per-person", sheet: kpi, target: "H5", taskLabel: labels.review,
        title: L("团队平均销售额", "Average sales per team member", "1人あたりの平均売上"),
        lead: L("在 H5 用销售总额除以非空姓名数，复习 SUM、COUNTA 与除法。", "In H5, divide total sales by non-empty names, reviewing SUM, COUNTA, and division.", "H5 で売上合計を非空氏名数で割り、SUM・COUNTA・除算を復習します。"),
        hint: L("参考：=ROUND(SUM(C2:C9)/COUNTA(A2:A9),0)", "Reference: =ROUND(SUM(C2:C9)/COUNTA(A2:A9),0)", "参考：=ROUND(SUM(C2:C9)/COUNTA(A2:A9),0)"),
        formula: "=ROUND(SUM(C2:C9)/COUNTA(A2:A9),0)", requiredFunctions: ["ROUND", "SUM", "COUNTA"],
      }),
      task({
        id: prefix + "-wide", sheet: kpi, target: "H6", taskLabel: labels.review,
        title: L("未筛选时的销售极差是否超过 2000", "Is the full-table sales spread above 2000?", "未絞り込みの売上差は2000超か"),
        lead: L("当前没有筛选。在 H6 用 SUBTOTAL 4 减 SUBTOTAL 5，判断全表极差是否大于 2000，返回 WIDE 或 NARROW。", "No filter is applied. In H6, subtract SUBTOTAL 5 from 4 and test whether the full-table spread exceeds 2000.", "現在は絞り込みがありません。H6 で SUBTOTAL 4 から5を引き、全表の差が2000超か判定します。"),
        hint: L('参考：=IF(SUBTOTAL(4,C2:C9)-SUBTOTAL(5,C2:C9)>2000,"WIDE","NARROW")', 'Reference: =IF(SUBTOTAL(4,C2:C9)-SUBTOTAL(5,C2:C9)>2000,"WIDE","NARROW")', '参考：=IF(SUBTOTAL(4,C2:C9)-SUBTOTAL(5,C2:C9)>2000,"WIDE","NARROW")'),
        formula: '=IF(SUBTOTAL(4,C2:C9)-SUBTOTAL(5,C2:C9)>2000,"WIDE","NARROW")', requiredFunctions: ["IF", "SUBTOTAL"],
      }),
      task({
        id: prefix + "-two-per", sheet: kpi, target: "H7", taskLabel: labels.review,
        title: L("未筛选时每人两项复核工作量", "Two review items per person with no filter", "未絞り込みの1人あたり2件確認"),
        lead: L("当前没有筛选。在 H7 用 SUBTOTAL 3 统计人数，再乘 2；筛选后同一公式会自动只算可见人数。", "No filter is applied. Use SUBTOTAL 3 in H7 and multiply by two; after filtering, the same formula counts only visible people.", "現在は絞り込みがありません。H7 で SUBTOTAL 3 の人数に2を掛けます。絞り込むと同じ数式が表示人数だけを数えます。"),
        hint: L("参考：=SUBTOTAL(3,A2:A9)*2", "Reference: =SUBTOTAL(3,A2:A9)*2", "参考：=SUBTOTAL(3,A2:A9)*2"),
        formula: "=SUBTOTAL(3,A2:A9)*2", requiredFunctions: ["SUBTOTAL"],
      }),
      task({
        id: prefix + "-two-thirds", sheet: kpi, target: "H8", taskLabel: labels.review,
        title: L("未筛选时的目标打九折合计", "Full-table target after a 10% reduction", "未絞り込みの目標10%削減後"),
        lead: L("当前没有筛选。在 H8 用 SUBTOTAL 9 汇总目标，再乘 0.9；若先筛选，同一公式只汇总可见目标。", "No filter is applied. SUBTOTAL 9 the targets in H8 and multiply by 0.9; if you filter first, the same formula totals only visible targets.", "現在は絞り込みがありません。H8 で目標を SUBTOTAL 9 し、0.9を掛けます。先に絞り込めば表示目標だけを集計します。"),
        hint: L("参考：=ROUND(SUBTOTAL(9,D2:D9)*0.9,0)", "Reference: =ROUND(SUBTOTAL(9,D2:D9)*0.9,0)", "参考：=ROUND(SUBTOTAL(9,D2:D9)*0.9,0)"),
        formula: "=ROUND(SUBTOTAL(9,D2:D9)*0.9,0)", requiredFunctions: ["ROUND", "SUBTOTAL"],
      }),
      task({
        id: prefix + "-max-name", sheet: kpi, target: "H9", taskLabel: labels.review,
        title: L("最高销售的销售员姓名", "Name of the top sales rep", "最高売上の担当者名"),
        lead: L("在 H9 用 INDEX 和 MATCH 找出 C 列最大销售额对应的 A 列姓名。", "In H9, use INDEX and MATCH to return the A-column name for the largest C-column sale.", "H9 で INDEX と MATCH を使い、C列最大売上に対応するA列氏名を返します。"),
        hint: L("参考：=INDEX(A2:A9,MATCH(MAX(C2:C9),C2:C9,0))", "Reference: =INDEX(A2:A9,MATCH(MAX(C2:C9),C2:C9,0))", "参考：=INDEX(A2:A9,MATCH(MAX(C2:C9),C2:C9,0))"),
        formula: "=INDEX(A2:A9,MATCH(MAX(C2:C9),C2:C9,0))", requiredFunctions: ["INDEX", "MATCH", "MAX"],
      }),
    ];
  }

  function sumproductReviewTasks(prefix) {
    return [
      task({
        id: prefix + "-size", sheet: orders, target: "K2", taskLabel: labels.review,
        title: L("判断标价总额是大单还是普通单", "Classify the list total as large or normal", "定価合計を大口か通常かに分類"),
        lead: L("在 K2 用 SUMPRODUCT 求数量×单价，判断是否大于 40000，返回 BIG 或 SMALL。", "In K2, SUMPRODUCT quantity times price and return BIG when above 40000, otherwise SMALL.", "K2 で数量×単価を SUMPRODUCT し、40000超なら BIG、それ以外は SMALL を返します。"),
        hint: L('参考：=IF(SUMPRODUCT(E2:E11,F2:F11)>40000,"BIG","SMALL")', 'Reference: =IF(SUMPRODUCT(E2:E11,F2:F11)>40000,"BIG","SMALL")', '参考：=IF(SUMPRODUCT(E2:E11,F2:F11)>40000,"BIG","SMALL")'),
        formula: '=IF(SUMPRODUCT(E2:E11,F2:F11)>40000,"BIG","SMALL")', requiredFunctions: ["IF", "SUMPRODUCT"],
      }),
      task({
        id: prefix + "-discount-value", sheet: orders, target: "K3", taskLabel: labels.review,
        title: L("按金额计算的折扣总额", "Total discount amount", "金額ベースの割引総額"),
        lead: L("在 K3 把数量、单价、折扣三列逐个相乘后汇总，得到总折扣金额，再取整。", "In K3, multiply quantity, price, and discount row by row, total, and round.", "K3 で数量・単価・割引を順に掛けて合計し、丸めます。"),
        hint: L("参考：=ROUND(SUMPRODUCT(E2:E11,F2:F11,G2:G11),0)", "Reference: =ROUND(SUMPRODUCT(E2:E11,F2:F11,G2:G11),0)", "参考：=ROUND(SUMPRODUCT(E2:E11,F2:F11,G2:G11),0)"),
        formula: "=ROUND(SUMPRODUCT(E2:E11,F2:F11,G2:G11),0)", requiredFunctions: ["ROUND", "SUMPRODUCT"],
      }),
      task({
        id: prefix + "-discount-rate", sheet: orders, target: "K4", taskLabel: labels.review,
        title: L("整体折扣率", "Overall discount rate", "全体の割引率"),
        lead: L("在 K4 用总折扣金额除以未折扣金额，保留三位。", "In K4, divide total discount amount by list total and round to three decimals.", "K4 で割引総額を割引前合計で割り、小数3桁にします。"),
        hint: L("参考：=ROUND(SUMPRODUCT(E2:E11,F2:F11,G2:G11)/SUMPRODUCT(E2:E11,F2:F11),3)", "Reference: =ROUND(SUMPRODUCT(E2:E11,F2:F11,G2:G11)/SUMPRODUCT(E2:E11,F2:F11),3)", "参考：=ROUND(SUMPRODUCT(E2:E11,F2:F11,G2:G11)/SUMPRODUCT(E2:E11,F2:F11),3)"),
        formula: "=ROUND(SUMPRODUCT(E2:E11,F2:F11,G2:G11)/SUMPRODUCT(E2:E11,F2:F11),3)", requiredFunctions: ["ROUND", "SUMPRODUCT"],
      }),
      task({
        id: prefix + "-avg-order", sheet: orders, target: "K5", taskLabel: labels.review,
        title: L("平均每张订单的标价金额", "Average list amount per order", "1注文あたりの平均定価額"),
        lead: L("在 K5 用未折扣总额除以订单数 COUNTA(A2:A11)，结果取整。", "In K5, divide list total by order count COUNTA(A2:A11) and round.", "K5 で割引前合計を注文件数 COUNTA(A2:A11) で割り、整数にします。"),
        hint: L("参考：=ROUND(SUMPRODUCT(E2:E11,F2:F11)/COUNTA(A2:A11),0)", "Reference: =ROUND(SUMPRODUCT(E2:E11,F2:F11)/COUNTA(A2:A11),0)", "参考：=ROUND(SUMPRODUCT(E2:E11,F2:F11)/COUNTA(A2:A11),0)"),
        formula: "=ROUND(SUMPRODUCT(E2:E11,F2:F11)/COUNTA(A2:A11),0)", requiredFunctions: ["ROUND", "SUMPRODUCT", "COUNTA"],
      }),
      task({
        id: prefix + "-extra-five", sheet: orders, target: "K6", taskLabel: labels.review,
        title: L("未折扣总额再让利 5%", "Apply another 5% concession", "割引前合計からさらに5%"),
        lead: L("在 K6 用 SUMPRODUCT 求总额，再乘 0.95，取整到元。", "In K6, SUMPRODUCT the total, multiply by 0.95, and round.", "K6 で SUMPRODUCT の合計に0.95を掛け、整数にします。"),
        hint: L("参考：=ROUND(SUMPRODUCT(E2:E11,F2:F11)*0.95,0)", "Reference: =ROUND(SUMPRODUCT(E2:E11,F2:F11)*0.95,0)", "参考：=ROUND(SUMPRODUCT(E2:E11,F2:F11)*0.95,0)"),
        formula: "=ROUND(SUMPRODUCT(E2:E11,F2:F11)*0.95,0)", requiredFunctions: ["ROUND", "SUMPRODUCT"],
      }),
      task({
        id: prefix + "-count-discount", sheet: orders, target: "K7", taskLabel: labels.review,
        title: L("折扣高于 5% 的订单数", "Orders discounted above 5%", "割引5%超の注文数"),
        lead: L("在 K7 用 COUNTIF 统计 G2:G11 中大于 0.05 的订单，复习条件计数。", "In K7, COUNTIF G2:G11 for discounts above 5%.", "K7 で G2:G11 の5%超を COUNTIF で数えます。"),
        hint: L('参考：=COUNTIF(G2:G11,">0.05")', 'Reference: =COUNTIF(G2:G11,">0.05")', '参考：=COUNTIF(G2:G11,">0.05")'),
        formula: '=COUNTIF(G2:G11,">0.05")', requiredFunctions: ["COUNTIF"],
      }),
      task({
        id: prefix + "-above-list", sheet: orders, target: "K8", taskLabel: labels.review,
        title: L("实收是否低于标价", "Is received amount below list total?", "実収は定価合計を下回るか"),
        lead: L("在 K8 比较 SUMPRODUCT 标价总额和 SUM(H2:H11) 实收总额，返回 ABOVE 或 BELOW。", "In K8, compare SUMPRODUCT list total with SUM(H2:H11) and return ABOVE or BELOW.", "K8 で SUMPRODUCT の定価合計と SUM(H2:H11) の実収を比較します。"),
        hint: L('参考：=IF(SUMPRODUCT(E2:E11,F2:F11)>SUM(H2:H11),"ABOVE","BELOW")', 'Reference: =IF(SUMPRODUCT(E2:E11,F2:F11)>SUM(H2:H11),"ABOVE","BELOW")', '参考：=IF(SUMPRODUCT(E2:E11,F2:F11)>SUM(H2:H11),"ABOVE","BELOW")'),
        formula: '=IF(SUMPRODUCT(E2:E11,F2:F11)>SUM(H2:H11),"ABOVE","BELOW")', requiredFunctions: ["IF", "SUMPRODUCT", "SUM"],
      }),
      task({
        id: prefix + "-avg-quantity", sheet: orders, target: "K9", taskLabel: labels.review,
        title: L("每单平均商品数量", "Average quantity per order", "1注文あたりの平均数量"),
        lead: L("在 K9 用 SUM 汇总数量，再除以订单数并保留一位小数。", "In K9, SUM quantities, divide by order count, and round to one decimal.", "K9 で数量を SUM し、注文件数で割って小数1桁にします。"),
        hint: L("参考：=ROUND(SUM(E2:E11)/COUNTA(A2:A11),1)", "Reference: =ROUND(SUM(E2:E11)/COUNTA(A2:A11),1)", "参考：=ROUND(SUM(E2:E11)/COUNTA(A2:A11),1)"),
        formula: "=ROUND(SUM(E2:E11)/COUNTA(A2:A11),1)", requiredFunctions: ["ROUND", "SUM", "COUNTA"],
      }),
    ];
  }

  function dataOrdersReviewTasks(prefix) {
    return [
      task({
        id: prefix + "-avg-order", sheet: orders, target: "K2", taskLabel: labels.review,
        title: L("平均每单金额", "Average order amount", "平均注文額"),
        lead: L("在 K2 用 H 列金额合计除以订单数，取整。", "In K2, divide total H-column amount by order count and round.", "K2 で H列金額の合計を注文件数で割り、整数にします。"),
        hint: L("参考：=ROUND(SUM(H2:H11)/COUNTA(A2:A11),0)", "Reference: =ROUND(SUM(H2:H11)/COUNTA(A2:A11),0)", "参考：=ROUND(SUM(H2:H11)/COUNTA(A2:A11),0)"),
        formula: "=ROUND(SUM(H2:H11)/COUNTA(A2:A11),0)", requiredFunctions: ["ROUND", "SUM", "COUNTA"],
      }),
      task({
        id: prefix + "-big-orders", sheet: orders, target: "K3", taskLabel: labels.review,
        title: L("高额订单是否至少五笔", "At least five high-value orders?", "高額注文は5件以上か"),
        lead: L("在 K3 用 COUNTIF 统计 H2:H11 中大于 5000 的订单，判断是否不少于 5。", "In K3, count H2:H11 above 5000 and test whether there are at least five.", "K3 で H2:H11 の5000超を数え、5件以上か判定します。"),
        hint: L('参考：=IF(COUNTIF(H2:H11,">5000")>=5,"BIG","NORMAL")', 'Reference: =IF(COUNTIF(H2:H11,">5000")>=5,"BIG","NORMAL")', '参考：=IF(COUNTIF(H2:H11,">5000")>=5,"BIG","NORMAL")'),
        formula: '=IF(COUNTIF(H2:H11,">5000")>=5,"BIG","NORMAL")', requiredFunctions: ["IF", "COUNTIF"],
      }),
      task({
        id: prefix + "-east-share", sheet: orders, target: "K4", taskLabel: labels.review,
        title: L("华东订单金额占比", "East share of order amount", "東部注文の金額シェア"),
        lead: L("在 K4 用 SUMIF 算华东金额，再除以 SUM(H2:H11)，保留三位。", "In K4, SUMIF East and divide by total H amount, rounding to three decimals.", "K4 で東部を SUMIF し、H列合計で割って小数3桁にします。"),
        hint: L('参考：=ROUND(SUMIF(D2:D11,"华东",H2:H11)/SUM(H2:H11),3)', 'Reference: =ROUND(SUMIF(D2:D11,"East",H2:H11)/SUM(H2:H11),3)', '参考：=ROUND(SUMIF(D2:D11,"東部",H2:H11)/SUM(H2:H11),3)'),
        formula: '=ROUND(SUMIF(D2:D11,"华东",H2:H11)/SUM(H2:H11),3)', requiredFunctions: ["ROUND", "SUMIF", "SUM"],
      }),
      task({
        id: prefix + "-rank-amount", sheet: orders, target: "K5", taskLabel: labels.review,
        title: L("云谷医疗订单金额排名", "Rank the Yungu order amount", "雲谷医療注文の金額順位"),
        lead: L("在 K5 用 RANK 把 H7 放到 H2:H11 中降序排名。范围用绝对引用。", "In K5, RANK H7 within H2:H11 in descending order and lock the range.", "K5 で H7 を H2:H11 内で降順に RANK し、範囲を絶対参照にします。"),
        hint: L("参考：=RANK(H7,$H$2:$H$11,0)", "Reference: =RANK(H7,$H$2:$H$11,0)", "参考：=RANK(H7,$H$2:$H$11,0)"),
        formula: "=RANK(H7,$H$2:$H$11,0)", requiredFunctions: ["RANK"], requiredText: ["$H$2:$H$11"],
      }),
      task({
        id: prefix + "-visible-total", sheet: orders, target: "K6", taskLabel: labels.review,
        title: L("筛选华东后可见订单金额", "East-region visible order amount", "東部の表示注文金額"),
        lead: L("筛选区域为华东，在 K6 用 SUBTOTAL 9 汇总 H2:H11，只算华东可见订单。", "Filter Region to East, then use SUBTOTAL 9 on H2:H11 in K6 so only visible East orders are totaled.", "地域を東部に絞り、K6 で H2:H11 を SUBTOTAL 9 し、表示中の東部注文だけを合計します。"),
        hint: L("参考：=SUBTOTAL(9,H2:H11)", "Reference: =SUBTOTAL(9,H2:H11)", "参考：=SUBTOTAL(9,H2:H11)"),
        formula: "=SUBTOTAL(9,H2:H11)", requiredFunctions: ["SUBTOTAL"],
        expected: 21080,
        operation: { type: "filter", range: "A1:H11", column: "D", selectedValue: FILTER_REGIONS[0] },
      }),
      task({
        id: prefix + "-list-vs-real", sheet: orders, target: "K10", taskLabel: labels.review,
        title: L("标价总额相当于实收的几倍", "List total as a multiple of received", "定価合計は実収の何倍か"),
        lead: L("在 K10 用 SUMPRODUCT 数量×单价，再除以 H 列实收总额，保留两位。", "In K10, divide SUMPRODUCT quantity × price by total H amount and round.", "K10 で数量×単価の SUMPRODUCT を H列の実収合計で割り、小数2桁にします。"),
        hint: L("参考：=ROUND(SUMPRODUCT(E2:E11,F2:F11)/SUM(H2:H11),2)", "Reference: =ROUND(SUMPRODUCT(E2:E11,F2:F11)/SUM(H2:H11),2)", "参考：=ROUND(SUMPRODUCT(E2:E11,F2:F11)/SUM(H2:H11),2)"),
        formula: "=ROUND(SUMPRODUCT(E2:E11,F2:F11)/SUM(H2:H11),2)", requiredFunctions: ["ROUND", "SUMPRODUCT", "SUM"],
      }),
      task({
        id: prefix + "-priority-order", sheet: orders, target: "K8", taskLabel: labels.review,
        title: L("高额且靠前才标记优先", "Priority flag for a high-ranked large order", "高額かつ上位の注文を優先"),
        lead: L("在 K8 同时判断高额订单是否至少五笔，以及 H7 的金额排名是否进入前三。返回 PRIORITY 或 NORMAL。", "In K8, require at least five high-value orders AND H7 ranked in the top three. Return PRIORITY or NORMAL.", "K8 で高額注文が5件以上かつ H7 の金額順位が上位3位かを判定します。"),
        hint: L('参考：=IF(AND(COUNTIF(H2:H11,">5000")>=5,RANK(H7,$H$2:$H$11,0)<=3),"PRIORITY","NORMAL")', 'Reference: =IF(AND(COUNTIF(H2:H11,">5000")>=5,RANK(H7,$H$2:$H$11,0)<=3),"PRIORITY","NORMAL")', '参考：=IF(AND(COUNTIF(H2:H11,">5000")>=5,RANK(H7,$H$2:$H$11,0)<=3),"PRIORITY","NORMAL")'),
        formula: '=IF(AND(COUNTIF(H2:H11,">5000")>=5,RANK(H7,$H$2:$H$11,0)<=3),"PRIORITY","NORMAL")', requiredFunctions: ["IF", "AND", "COUNTIF", "RANK"],
      }),
      task({
        id: prefix + "-north-discount", sheet: orders, target: "K9", taskLabel: labels.review,
        title: L("华北高折扣订单金额", "North orders with a high discount", "北部の高割引注文金額"),
        lead: L("在 K9 用 SUMIFS 汇总区域为华北且折扣>=0.1 的 H 列金额，取整。", "In K9, SUMIFS H for North and discount >=0.1, then round.", "K9 で北部かつ割引>=0.1 の H列金額を SUMIFS し、丸めます。"),
        hint: L('参考：=ROUND(SUMIFS(H2:H11,D2:D11,"华北",G2:G11,">=0.1"),0)', 'Reference: =ROUND(SUMIFS(H2:H11,D2:D11,"North",G2:G11,">=0.1"),0)', '参考：=ROUND(SUMIFS(H2:H11,D2:D11,"北部",G2:G11,">=0.1"),0)'),
        formula: '=ROUND(SUMIFS(H2:H11,D2:D11,"华北",G2:G11,">=0.1"),0)', requiredFunctions: ["ROUND", "SUMIFS"],
      }),
    ];
  }

  function dataKpiReviewTasks(prefix) {
    return [
      task({
        id: prefix + "-rank", sheet: kpi, target: "G2", taskLabel: labels.review,
        title: L("林晓是否进入前三", "Is Lin in the top three?", "林さんは上位3位か"),
        lead: L("在 G2 用 RANK 给 C2 在本组排序，再判断名次是否不大于 3，返回 TOP3 或 WATCH。", "In G2, RANK C2 within the group and test whether the rank is at most three.", "G2 で C2 をグループ内で RANK し、3位以内か判定します。"),
        hint: L('参考：=IF(RANK(C2,$C$2:$C$9,0)<=3,"TOP3","WATCH")', 'Reference: =IF(RANK(C2,$C$2:$C$9,0)<=3,"TOP3","WATCH")', '参考：=IF(RANK(C2,$C$2:$C$9,0)<=3,"TOP3","WATCH")'),
        formula: '=IF(RANK(C2,$C$2:$C$9,0)<=3,"TOP3","WATCH")', requiredFunctions: ["IF", "RANK"], requiredText: ["$C$2:$C$9"],
      }),
      task({
        id: prefix + "-avg", sheet: kpi, target: "G3", taskLabel: labels.review,
        title: L("未筛选时的团队平均销售额", "Team average with no filter applied", "未絞り込みのチーム平均売上"),
        lead: L("在 G3 用 SUBTOTAL 1 求平均后取整。当前没有筛选，所以它的结果与 AVERAGE 相同；一旦筛选，SUBTOTAL 才会只算可见行。", "In G3, use SUBTOTAL 1 and round. No filter is applied here, so the result matches AVERAGE; after filtering, SUBTOTAL would use only visible rows.", "G3 で SUBTOTAL 1 を求めて丸めます。ここでは絞り込みがないため AVERAGE と同じ結果です。絞り込むと表示行だけを集計します。"),
        hint: L("参考：=ROUND(SUBTOTAL(1,C2:C9),0)", "Reference: =ROUND(SUBTOTAL(1,C2:C9),0)", "参考：=ROUND(SUBTOTAL(1,C2:C9),0)"),
        formula: "=ROUND(SUBTOTAL(1,C2:C9),0)", requiredFunctions: ["ROUND", "SUBTOTAL"],
      }),
      task({
        id: prefix + "-below", sheet: kpi, target: "G4", taskLabel: labels.review,
        title: L("达成率低于 90% 的人数", "Reps below 90% attainment", "達成率90%未満の人数"),
        lead: L("在 G4 用 COUNTIF 统计 E2:E9 中小于 0.9 的人数。", "In G4, COUNTIF E2:E9 for values below 0.9.", "G4 で E2:E9 の0.9未満を COUNTIF で数えます。"),
        hint: L('参考：=COUNTIF(E2:E9,"<0.9")', 'Reference: =COUNTIF(E2:E9,"<0.9")', '参考：=COUNTIF(E2:E9,"<0.9")'),
        formula: '=COUNTIF(E2:E9,"<0.9")', requiredFunctions: ["COUNTIF"],
      }),
      task({
        id: prefix + "-north-target", sheet: kpi, target: "G5", taskLabel: labels.review,
        title: L("华北季度目标合计", "Total North quarterly target", "北部の四半期目標合計"),
        lead: L("在 G5 用 SUMIF 对区域列中的华北行汇总 D 列目标。", "In G5, SUMIF North and total column D targets.", "G5 で北部の行を SUMIF し、D列目標を合計します。"),
        hint: L('参考：=SUMIF(B2:B9,"华北",D2:D9)', 'Reference: =SUMIF(B2:B9,"North",D2:D9)', '参考：=SUMIF(B2:B9,"北部",D2:D9)'),
        formula: '=SUMIF(B2:B9,"华北",D2:D9)', requiredFunctions: ["SUMIF"],
      }),
      task({
        id: prefix + "-weighted", sheet: kpi, target: "G6", taskLabel: labels.review,
        title: L("按销售额加权的达成率", "Sales-weighted attainment", "売上加重の達成率"),
        lead: L("在 G6 用 SUMPRODUCT 把 C 列销售额和 E 列达成率逐行相乘，再除以销售额合计，保留三位。", "In G6, SUMPRODUCT sales C with attainment E, divide by total sales, and round.", "G6 で C列売上と E列達成率を SUMPRODUCT し、売上合計で割って丸めます。"),
        hint: L("参考：=ROUND(SUMPRODUCT(C2:C9,E2:E9)/SUM(C2:C9),3)", "Reference: =ROUND(SUMPRODUCT(C2:C9,E2:E9)/SUM(C2:C9),3)", "参考：=ROUND(SUMPRODUCT(C2:C9,E2:E9)/SUM(C2:C9),3)"),
        formula: "=ROUND(SUMPRODUCT(C2:C9,E2:E9)/SUM(C2:C9),3)", requiredFunctions: ["ROUND", "SUMPRODUCT", "SUM"],
      }),
      task({
        id: prefix + "-visible-met", sheet: kpi, target: "G7", taskLabel: labels.review,
        title: L("筛选华北后销售额是否达到 2.4 万", "Do North-region sales reach 24,000?", "北部の売上は2.4万以上か"),
        lead: K.fill(L("先把区域筛选为 {region}，再在 G7 用 SUBTOTAL 9 汇总销售额，并判断是否至少 24000。", "Filter Region to {region}, then use SUBTOTAL 9 in G7 and test whether sales reach 24000.", "地域を {region} に絞り、G7 で売上を SUBTOTAL 9 し、24000以上か判定します。", "先把區域篩選為 {region}，再於 G7 用 SUBTOTAL 9 彙總銷售額，並判斷是否至少 24000。"), { region: FILTER_REGIONS[1] }),
        hint: L('参考：=IF(SUBTOTAL(9,C2:C9)>=24000,"MET","SHORT")', 'Reference: =IF(SUBTOTAL(9,C2:C9)>=24000,"MET","SHORT")', '参考：=IF(SUBTOTAL(9,C2:C9)>=24000,"MET","SHORT")'),
        formula: '=IF(SUBTOTAL(9,C2:C9)>=24000,"MET","SHORT")', requiredFunctions: ["IF", "SUBTOTAL"],
        operation: { type: "filter", range: "A1:G9", column: "B", selectedValue: FILTER_REGIONS[1] },
      }),
      task({
        id: prefix + "-gap", sheet: kpi, target: "G8", taskLabel: labels.review,
        title: L("筛选华北后的销售额与目标差额", "North-region sales gap to target", "北部の売上と目標の差"),
        lead: K.fill(L("筛选 {region}，在 G8 分别用 SUBTOTAL 9 汇总销售额和目标，再相减。", "Filter {region}, then use SUBTOTAL 9 on sales and target in G8 and subtract.", "{region} に絞り、G8 で売上と目標をそれぞれ SUBTOTAL 9 し、差を取ります。", "篩選 {region}，在 G8 分別用 SUBTOTAL 9 彙總銷售額和目標，再相減。"), { region: FILTER_REGIONS[1] }),
        hint: L("参考：=SUBTOTAL(9,C2:C9)-SUBTOTAL(9,D2:D9)", "Reference: =SUBTOTAL(9,C2:C9)-SUBTOTAL(9,D2:D9)", "参考：=SUBTOTAL(9,C2:C9)-SUBTOTAL(9,D2:D9)"),
        formula: "=SUBTOTAL(9,C2:C9)-SUBTOTAL(9,D2:D9)", requiredFunctions: ["SUBTOTAL"],
        expected: -590,
        operation: { type: "filter", range: "A1:G9", column: "B", selectedValue: FILTER_REGIONS[1] },
      }),
      task({
        id: prefix + "-champion-name", sheet: kpi, target: "G9", taskLabel: labels.review,
        title: L("冠军姓名", "Champion name", "首位の氏名"),
        lead: L("在 G9 用 INDEX 与 MATCH 取 C 列最大值对应的 A 列姓名。", "In G9, use INDEX and MATCH to return the A-column name for the maximum C value.", "G9 で INDEX と MATCH を使い、C列最大値に対応するA列氏名を返します。"),
        hint: L("参考：=INDEX(A2:A9,MATCH(MAX(C2:C9),C2:C9,0))", "Reference: =INDEX(A2:A9,MATCH(MAX(C2:C9),C2:C9,0))", "参考：=INDEX(A2:A9,MATCH(MAX(C2:C9),C2:C9,0))"),
        formula: "=INDEX(A2:A9,MATCH(MAX(C2:C9),C2:C9,0))", requiredFunctions: ["INDEX", "MATCH", "MAX"],
      }),
    ];
  }

  D.registerChapter({
    id: "ch09-data-analysis",
    icon: "09",
    title: L("第 9 章 · 排名、筛选、查找与批量计算", "Chapter 9 · Rank, Filter, Find, and Bulk Calculation", "第9章 · 順位・絞り込み・検索・一括計算", "第 9 章 · 排名、篩選、尋找與批次計算"),
    subtitle: L("从“谁排第几”到“怎样先筛选再汇总”，再到“怎样从一条姓名或半截编号定位记录”和“数量与单价怎样一次算完”。每个新知识点都会接回前面学过的汇总、条件与查找。", "Move from ranking to filtered totals, then to locating a record from a name or partial ID, and finally to bulk calculations. Every new idea connects back to earlier totals, conditions, and lookups.", "順位から絞り込み集計、氏名や番号の一部からの検索、数量×単価の一括計算へ進みます。各知識を既習の集計・条件・検索につなげます。", "從「誰排第幾」到「怎樣先篩選再彙總」，再到「怎樣從一個姓名或半截編號定位記錄」和「數量與單價怎樣一次算完」。每個新知識點都會接回前面學過的彙總、條件與查找。"),
    levels: [
      level("data-rank", "lesson", L("RANK：先排名次，再做业务判断", "RANK: Rank First, Decide Next", "RANK：順位を付けてから判断する"), [
        learn(
          "brief-data-rank",
          L("奖金名单不能凭印象决定", "A bonus list cannot be based on impressions", "賞与リストは印象で決められない"),
          L("季度复盘会上，主管要说清楚谁在前三、谁需要辅导。先在 F 列算出每个人的降序排名，再把名次接到 IF、奖金和条件统计里。", "At the quarterly review, the manager must identify the top three and who needs coaching. Calculate a descending rank in column F, then connect it to IF, bonus, and conditional counts.", "四半期レビューでは上位3名と要支援者を明確にします。F列で降順順位を求め、IF・賞与・条件集計につなげます。"),
          [
            L("RANK 的三个输入：要排名的数字、比较区域、0 或省略表示降序", "RANK takes the number, comparison range, and 0 or omitted for descending order", "RANK は対象値、比較範囲、降順なら0または省略です"),
            L("比较区域要绝对引用，向下复制时不能跟着移动", "Lock the comparison range so copying down does not shift it", "比較範囲は絶対参照にしてコピーでずれないようにします"),
            L("排名是数字，不是文字；可以在 IF 中直接比较大小", "A rank is a number, so IF can compare it directly", "順位は数値なので IF でそのまま比較できます"),
            L("奖金判断仍要复用 SUM、AVERAGE、COUNTIF 等旧工具", "Bonus decisions still reuse SUM, AVERAGE, and COUNTIF", "賞与判定でも SUM・AVERAGE・COUNTIF を再利用します"),
          ],
          L("先选对比较区域，再决定升序还是降序。名次突然全变成 1，通常是区域引用在复制时跑偏。", "Choose the comparison range, then the direction. If every rank becomes 1, the range probably shifted when copied.", "比較範囲を先に選び、昇順か降順かを決めます。全員1位になる場合は範囲のずれを疑います。"),
          "=RANK(C2,$C$2:$C$9,0)"
        ),
        practice({
          id: "data-rank-guided",
          title: L("给每位销售算出季度名次", "Rank each sales rep for the quarter", "各営業担当の四半期順位"),
          lead: L("随机抽一位销售，在对应 F 列输入 RANK。比较区域必须是 $C$2:$C$9，名次才稳定。", "A rep is chosen at random. Enter RANK in the matching F cell with the locked range $C$2:$C$9.", "ランダムな担当者の F列に RANK を入力します。比較範囲は $C$2:$C$9 に固定します。"),
          sheet: kpi,
          tasks: rankTasks("data-rank-guided"),
          hint: L("模板：=RANK(当前行销售额,$C$2:$C$9,0)。三个部分分别解决“谁、和谁比、从大到小”。", "Template: =RANK(current-row sales,$C$2:$C$9,0). It answers who, compared with whom, and descending.", "型：=RANK(現在行の売上,$C$2:$C$9,0)。対象・比較範囲・降順を指定します。"),
        }),
        practice({
          id: "data-rank-transfer",
          title: L("把名次接到奖金、达标和复盘结论", "Feed ranks into bonus, target, and review decisions", "順位を賞与・達成・レビュー判断につなぐ"),
          lead: L("同一张 KPI 表，题目会在冠军标记、前三名单、末位复盘、奖金和查找之间随机切换。先算名次，再写业务结论。", "On the same KPI sheet, tasks switch among champion flags, top-three lists, bottom review, bonus, and lookups. Rank first, then write the business conclusion.", "同じ KPI 表で、首位・上位3名・最下位・賞与・検索が切り替わります。まず順位、次に業務判断です。"),
          sheet: kpi,
          tasks: rankScenarioTasks("data-rank-transfer"),
          hint: L("如果题目既问排名又问条件，先保证 RANK 区域锁定，再把 RANK 结果放进 IF/AND。", "When a task asks for both rank and a condition, lock the RANK range first, then place the result inside IF/AND.", "順位と条件の両方を問う場合、先に RANK 範囲を固定し、結果を IF・AND に入れます。"),
        }),
        practice({
          id: "data-rank-check",
          title: L("排名与旧知识混练", "Mix ranks with earlier skills", "順位と既習内容の混合練習"),
          lead: L("最后一组把 RANK、SUM、AVERAGE、COUNTIF、MAX、MIN 混合。切题时先看目标单元格，再选主线函数。", "The final set mixes RANK, SUM, AVERAGE, COUNTIF, MAX, and MIN. Check the target cell, then choose the main function.", "最後のセットは RANK・SUM・AVERAGE・COUNTIF・MAX・MIN の混合です。対象セルを見て主関数を選びます。"),
          sheet: kpi,
          tasks: rankCheckTasks("data-rank-check"),
          hint: L("先判断“要不要先算名次”。如果只是总额或均值，不要把 RANK 硬塞进去。", "Decide whether a rank is actually needed. Do not force RANK into a total or average task.", "順位が必要かを先に判断します。合計や平均だけなら RANK を入れません。"),
        }),
      ], { xp: 45 }),

      level("data-filter", "lesson", L("筛选：先收窄范围，再谈数字", "Filter: Narrow the List Before Doing the Math", "絞り込み：範囲を絞ってから数える", "篩選：先縮小範圍，再談數字"), [
        learn(
          "brief-data-filter",
          L("一整张表，不必每次都全部看完", "You do not need to read the whole sheet every time", "毎回すべての行を見る必要はありません", "一整張表，不必每次都全部看完"),
          L("销售经理只想看华东的销售记录。筛选会把不符合条件的行暂时藏起来，表格结构、原始数据和公式都还在；它和删除不同，清除筛选后所有记录会原样回来。真实 Excel 的入口是：选中含表头的数据区任意单元格，使用“数据 > 筛选”或 Ctrl+Shift+L，再点列头箭头选值。最后看可见行数，确认自己筛对了。", "The sales manager wants only the East records. A filter temporarily hides non-matching rows while keeping the table, source data, and formulas intact. Nothing is deleted: clearing the filter brings every row back. In Excel, select any cell in the range with headers, turn on Data > Filter or Ctrl+Shift+L, then use the header arrow to choose a value. Check the visible-row count at the end.", "営業責任者は東部の記録だけを見たいとします。絞り込みは条件に合わない行を一時的に隠すだけで、表の構造・元データ・数式は残ります。削除ではないため、解除すれば全行が戻ります。Excel では見出しを含む範囲内のセルを選び、「データ > フィルター」または Ctrl+Shift+L を有効にし、見出しの矢印から値を選びます。最後に表示行数を確認します。", "銷售經理只想看東區的銷售記錄。篩選會把不符合條件的列暫時藏起來，表格結構、原始資料和公式都還在；它和刪除不同，清除篩選後所有記錄會原樣回來。真實 Excel 的入口是：選取含欄首的資料範圍內任一儲存格，使用「資料 > 篩選」或 Ctrl+Shift+L，再點欄首箭頭選值。最後看可見列數，確認自己篩對了。"),
          [
            L("先选中包含表头的数据区，再开启筛选。筛选箭头通常出现在每一列的标题旁；如果只选了一个空白格，先补选数据范围。", "Select the data range including headers before enabling Filter. Arrows usually appear beside every column header; if you started from a blank cell and see nothing, select the intended range first.", "見出しを含むデータ範囲を選んでから絞り込みを有効にします。通常は各列見出しの横に矢印が出ます。空白セルだけを選んで何も出ない場合は、対象範囲を選び直します。", "先選取包含欄首的資料範圍，再開啟篩選。篩選箭頭通常出現在每一欄的標題旁；如果只選了一個空白格，先補選資料範圍。"),
            L("筛选条件通常落在分类列，例如区域、部门、渠道或状态。先确认这一列的含义，不要拿数量列去筛文字。", "Filters usually go on a category column such as region, department, channel, or status. Confirm what the column means before choosing a value.", "絞り込み条件は通常、地域・部署・チャネル・状態などの分類列に置きます。数量列で文字を探さないよう、列の意味を先に確認します。", "篩選條件通常落在分類欄，例如區域、部門、管道或狀態。先確認這一欄的含義，不要拿數量欄去篩文字。"),
            L("应用后看两件事：目标值是否只剩一种，隐藏行数是否符合预期。数字不对时，先清空条件重来，比反复猜更稳。", "After applying, check two things: the target column now has one value, and the hidden-row count looks right. If the numbers look wrong, clear and reapply instead of guessing.", "適用後は2点を確認します。対象列が1種類だけになったか、非表示行数が想定どおりか。数が合わなければ一度解除してやり直すのが確実です。", "套用後看兩件事：目標值是否只剩一種，隱藏列數是否符合預期。數字不對時，先清空條件重來，比反覆猜更穩。"),
            L("筛选只改变“现在看得到哪些行”，不会自动改变 SUM 的结果；需要汇总筛选结果时，下一节会用 SUBTOTAL。", "A filter only changes which rows are visible. It does not automatically change a SUM result; SUBTOTAL is the tool for filtered totals in the next lesson.", "絞り込みは「今どの行が見えるか」を変えるだけで、SUM の結果は自動では変わりません。表示行を集計するのは次の SUBTOTAL です。", "篩選只改變「現在看得到哪些列」，不會自動改變 SUM 的結果；需要彙總篩選結果時，下一節會用 SUBTOTAL。"),
            L("做业务汇总时，先筛选再核对总行数，可以避免把隐藏的区域也算进去。", "For a business summary, filter first and check the visible count so hidden regions do not slip into the total.", "業務集計では、先に絞り込んで表示件数を確認すると、隠れた地域を誤って含めずに済みます。", "做業務彙總時，先篩選再核對總列數，可以避免把隱藏的區域也算進去。"),
          ],
          L("每次应用筛选后，都扫一眼隐藏行数。这个数字是你和表格之间的“收据”。", "After applying a filter, glance at the hidden-row count. It is your receipt for what changed.", "適用後は非表示行数を必ず確認します。これが変更内容の「領収書」です。", "每次套用篩選後，都掃一眼隱藏列數。這個數字是你和表格之間的「收據」。"),
          "=SUBTOTAL(9,C2:C9)"
        ),
        practice({
          id: "data-filter-guided",
          title: L("把区域筛选成指定业务线", "Filter the sheet to one region", "地域を1つに絞り込む", "把區域篩選成指定業務線"),
          lead: L("题目会随机切换到销售区域、仓库状态或城市。按真实 Excel 的顺序操作：选中含表头的数据区，开启筛选，点目标列箭头选值，再应用。应用后检查行号断层和隐藏行数，别把筛选当成删除。", "Tasks switch among sales regions, warehouse status, and city. Follow the Excel order: select the range with headers, enable Filter, use the target column's arrow to choose a value, then apply. Check the row-number gaps and hidden count; do not treat filtering as deleting.", "営業地域・倉庫状態・都市がランダムに切り替わります。Excel の順序で、見出しを含む範囲を選び、絞り込みを有効にし、対象列の矢印から値を選んで適用します。行番号の飛びと非表示件数を確認し、削除と混同しないようにします。", "題目會隨機切換到銷售區域、倉庫狀態或城市。依真實 Excel 的順序操作：選取含欄首的資料範圍，開啟篩選，點目標欄箭頭選值，再套用。套用後檢查列號斷層和隱藏列數，別把篩選當成刪除。"),
          sheet: kpi,
          tasks: filterTasks("data-filter-guided"),
          hint: L("筛选箭头没出现，先重新选中 A1:G9 或 A1:G6 再开启筛选。选值时只保留目标值，才符合题目；任务随机切换表，先确认当前表头再操作。", "If the filter arrows do not appear, reselect A1:G9 or A1:G6 before enabling Filter. Keep only the requested value. The sheet changes between tasks, so read the current headers before acting.", "矢印が出ない場合は A1:G9 または A1:G6 を選び直してから絞り込みを有効にします。対象値だけを残します。課題ごとに表が変わるため、現在の見出しを確認してから操作します。", "篩選箭頭沒出現，先重新選取 A1:G9 或 A1:G6 再開啟篩選。選值時只保留目標值，才符合題目；任務隨機切換表，先確認目前欄首再操作。"),
        }),
      ], { xp: 40 }),

      level("data-find", "lesson", L("查找：从一列文字快速定位到整行", "Find: From a Name to the Whole Row", "検索：文字から行全体へ", "尋找：從一欄文字快速定位到整橫列"), [
        learn(
          "brief-data-find",
          L("“这个人在哪一行？”是办公里最常见的动作", "Where is this record? It is the most common office move", "「この記録はどの行？」は日常業務で最も多い操作です", "「這個人在哪一橫列？」是辦公裡最常見的動作"),
          L("查找和筛选解决不同问题：筛选留下一批符合条件的行，查找只带你去其中一条记录。真实 Excel 里按 Ctrl+F 打开“查找和替换”，也可以走“开始 > 查找和选择 > 查找…”；要替换文字则按 Ctrl+H。输入姓名或商品名后，用“查找下一个”逐条移动，并核对行号、姓名、区域和金额是否属于同一条记录。", "Find and Filter solve different problems: a filter keeps a group of matching rows, while Find jumps to one record at a time. In Excel, press Ctrl+F to open Find and Replace, or use Home > Find & Select > Find. Use Ctrl+H to replace text. Enter a name or product, step through matches with Find Next, and confirm that the row number, name, region, and amount belong together.", "検索と絞り込みは目的が違います。絞り込みは条件に合う行の集合を残し、検索は1件ずつ目的の記録へ移動します。Excel では Ctrl+F で「検索と置換」を開き、「ホーム > 検索と選択 > 検索」でも開けます。置換は Ctrl+H です。氏名や商品名を入力し、「次を検索」で移動しながら、行番号・名前・地域・金額が同じ記録かを確認します。", "尋找和篩選解決不同問題：篩選留下一批符合條件的列，尋找只帶你去其中一筆記錄。真實 Excel 裡按 Ctrl+F 開啟「尋找和取代」，也可以走「常用 > 尋找和選取 > 尋找…」；要取代文字則按 Ctrl+H。輸入姓名或商品名後，用「尋找下一個」逐條移動，並核對列號、姓名、區域和金額是否屬於同一筆記錄。"),
          [
            L("先在姓名列或商品列里找，不要一上来就在整张表里搜金额，数字很容易撞车。", "Search the name or product column first. Do not start with an amount: numbers collide easily.", "まず氏名列や商品列で探します。金額から始めると同じ数字が多く、誤認しやすいです。", "先在姓名欄或商品欄裡找，不要一上來就在整張表裡搜金額，數字很容易撞車。"),
            L("“选项”默认折叠。展开后，范围可选工作表或工作簿，搜索方向可选按行或按列，查找范围可选值或公式；还可以勾选区分大小写、单元格匹配和区分全/半角。先想清楚要找什么，再决定打开哪些选项。", "Options is collapsed by default. Expand it to choose Worksheet or Workbook scope, search By Rows or By Columns, and look in Values or Formulas; you can also match case, match entire cell contents, and distinguish full-width from half-width characters. Decide what you need before turning options on.", "「オプション」は既定で折りたたまれています。展開すると、範囲をワークシート／ブック、検索方向を行／列、検索対象を値／数式から選べます。大文字小文字、セル全体一致、全角半角の区別も設定できます。何を探すかを先に決めてからオプションを開きます。", "「選項」預設折疊。展開後，範圍可選工作表或活頁簿，搜尋方向可選按列或按欄，尋找範圍可選值或公式；還可以勾選區分大小寫、儲存格相符和區分全/半形。先想清楚要找什麼，再決定開啟哪些選項。"),
            L("找到后不要只看高亮格。向右读完整行，确认区域、数量和金额都属于同一个人或同一件商品。", "Do not stop at the highlighted cell. Read across the row and confirm the region, quantity, and amount all belong to that record.", "見つけても強調セルだけを見ません。右へ行全体を読み、地域・数量・金額が同じ記録のものか確認します。", "找到後不要只看高亮格。向右讀完整橫列，確認區域、數量和金額都屬於同一個人或同一件商品。"),
            L("有多个匹配时，“下一个”会循环移动。题目要求的位置通常能用姓名或编号唯一确定。", "When there are several matches, Next cycles through them. The requested location can usually be identified uniquely by a name or ID.", "複数一致する場合、「次へ」で順に移動します。氏名や番号で一意に特定できることがほとんどです。", "有多個符合時，「下一個」會循環移動。題目要求的位置通常能用姓名或編號唯一確定。"),
            L("查找只负责定位，不负责改数。真正要做汇总或判断时，仍要回到公式或筛选。", "Find only locates a record; it does not calculate anything. Return to formulas or filters for the actual summary.", "検索は位置を特定するだけで、計算はしません。集計や判断には数式や絞り込みを使います。", "尋找只負責定位，不負責改數。真正要做彙總或判斷時，仍要回到公式或篩選。"),
          ],
          L("如果当前位置不对，先看查询文字有没有多空格，再用“上一个/下一个”绕回目标。", "If the active match is wrong, check for extra spaces in the query, then use Previous or Next to cycle back.", "位置が違う場合は検索語の余分な空白を確認し、「前へ／次へ」で目的の位置へ戻します。", "如果目前位置不對，先看查詢文字有沒有多空格，再用「上一個／下一個」繞回目標。"),
          "=INDEX(A2:A9,MATCH(MAX(C2:C9),C2:C9,0))"
        ),
        practice({
          id: "data-find-guided",
          title: L("按姓名定位，并练习查找选项", "Locate by name and practise Find options", "氏名で検索し、検索オプションも練習", "依姓名定位，並練習尋找選項"),
          lead: L("题目会随机给出姓名、大小写匹配、整格匹配或搜索方向。用 Ctrl+F 打开查找，按题目要求设置“选项”，再执行查找。只点单元格不算完成；检查会核对是否真的查找并定位到正确记录。", "Tasks switch among names, case matching, whole-cell matching, and search direction. Press Ctrl+F, set Options as instructed, then find. Clicking a cell does not count; the check verifies the actual search and active record.", "氏名・大小文字・セル全体一致・検索方向がランダムに出ます。Ctrl+F で検索を開き、問題に従って「オプション」を設定して実行します。セルをクリックしただけでは完了しません。", "題目會隨機給出姓名、大小寫相符、整格相符或搜尋方向。用 Ctrl+F 開啟尋找，依題目要求設定「選項」，再執行尋找。只點儲存格不算完成；檢查會核對是否真的尋找並定位到正確記錄。"),
          sheet: kpi,
          tasks: findTasks("data-find-guided").concat(findOptionTasks("data-find-guided-options")),
          hint: L("高亮格应该落在目标记录上，而且同一行的区域和销售额要与表格一致。若勾了“单元格匹配”，CN-001A 不会再被当作 CN-001；若改成“按列”，多个匹配的先后顺序也会变化。", "The active cell should land on the requested record, with the matching region and amount in that row. With Match entire cell selected, CN-001A no longer counts as CN-001; changing to By Columns also changes the order of multiple hits.", "強調セルは目的の記録に置き、同じ行の地域と売上が一致することを確認します。「セル全体一致」では CN-001A は CN-001 に一致しません。「列」に変えると複数一致の順序も変わります。", "高亮格應該落在目標記錄上，而且同一列的區域和銷售額要與表格一致。若勾了「儲存格相符」，CN-001A 不會再被當作 CN-001；若改成「按欄」，多個符合的先後順序也會變化。"),
        }),
      ], { xp: 40 }),

      level("data-find-wildcards", "lesson", L("通配符与条件查找：先找文字，再找一组记录", "Wildcard and Criteria Lookup: Text First, Then a Group", "ワイルドカードと条件検索：文字から集合へ", "通配符與條件查找：先找文字，再找一組記錄"), [
        learn(
          "brief-data-find-wildcards",
          L("订单号记得一半，也能准确找到", "A partial order number is still enough", "注文番号の一部だけでも見つけられる", "訂單號記得一半，也能準確找到"),
          L("实际办公里很少把编号背全。查找支持通配符：? 代表一个字符，* 代表任意多个字符；把已知部分和未知部分写进查找内容，就能先圈出一类记录，再用“下一个”核对具体是哪一条。Ctrl+F 打开查找、Ctrl+H 打开替换，两者共用同一个对话框和选项。", "In real work, few people remember an entire ID. Find supports wildcards: ? stands for one character and * for any number of characters. Combine the known and unknown parts, then use Find Next to verify the exact record. Ctrl+F opens Find and Ctrl+H opens Replace; both share the same dialog and options.", "実務では番号を全部覚えていることは少なくありません。検索では ? が1文字、* が任意の複数文字を表します。分かっている部分と不明な部分を組み合わせ、一致候補から目的の記録を確認します。Ctrl+F は検索、Ctrl+H は置換を開き、同じダイアログとオプションを共有します。", "實務裡很少把編號背全。尋找支援通配符：? 代表一個字元，* 代表任意多個字元；把已知部分和未知部分寫進尋找內容，就能先圈出一類記錄，再用「下一個」核對具體是哪一筆。Ctrl+F 開啟尋找、Ctrl+H 開啟取代，兩者共用同一個對話框和選項。"),
          [
            L("? 只占一个字符。例如 SO2601?5 可以匹配 SO26015 或 SO2601A5，但不会多吞字符。", "? consumes exactly one character. For example, SO2601?5 can match SO26015 or SO2601A5, but never more than one extra character.", "? は1文字だけに対応します。たとえば SO2601?5 は SO26015 や SO2601A5 に一致しますが、2文字以上は飲み込みません。", "? 只占一個字元。例如 SO2601?5 可以符合 SO26015 或 SO2601A5，但不會多吞字元。"),
            L("* 可以代表零个、一个或多个字符。适合“固定开头、固定结尾、中间记不清”的情况。", "* can stand for zero, one, or many characters. It fits a fixed beginning and ending with an uncertain middle.", "* は0文字・1文字・複数文字のいずれにも対応します。先頭と末尾は分かるが中間が曖昧な場合に便利です。", "* 可以代表零個、一個或多個字元。適合「固定開頭、固定結尾、中間記不清」的情況。"),
            L("通配符用得越少，结果越集中。只记得结尾时不要硬加开头；只记得开头时也不要多加一个 *。", "Use as few wildcards as possible. Do not invent a prefix or suffix you do not actually know.", "ワイルドカードは少ないほど候補を絞れます。覚えていない先頭や末尾を勝手に足さないようにします。", "通配符用得越少，結果越集中。只記得結尾時不要硬加開頭；只記得開頭時也不要多加一個 *。"),
            L("查找框里输入 >、<、<> 并不是数值比较，也不支持 AND/OR 这种逻辑查询。要查“数量至少 8”或“启用且金额超过 10000”的一组记录，应使用筛选，或改用 COUNTIF、SUMIF、COUNTIFS、SUMIFS，再配 IF/AND 做业务结论。", "Typing >, <, or <> in the Find box does not perform a numeric comparison, and the dialog does not accept AND/OR queries. To find a group of records such as quantity at least 8 or active and amount above 10000, use AutoFilter or COUNTIF, SUMIF, COUNTIFS, and SUMIFS, then use IF/AND for the business decision.", "検索ボックスに >、<、<> を入力しても数値比較にはならず、AND/OR の論理検索もできません。「数量8以上」や「稼働中かつ金額10000超」の集合を調べるには、オートフィルターか COUNTIF・SUMIF・COUNTIFS・SUMIFS を使い、業務判断は IF/AND で行います。", "尋找框裡輸入 >、<、<> 並不是數值比較，也不支援 AND/OR 這種邏輯查詢。要查「數量至少 8」或「啟用且金額超過 10000」的一組記錄，應使用篩選，或改用 COUNTIF、SUMIF、COUNTIFS、SUMIFS，再配 IF/AND 做業務結論。"),
            L("替换会直接改单元格内容，执行“全部替换”前先确认范围和匹配选项。查找只是定位，替换才写入；这两件事不要混为一谈。", "Replace changes cell contents, so confirm the range and matching options before Replace All. Find only navigates; Replace writes. Keep those two outcomes distinct.", "置換はセルの内容を書き換えます。「すべて置換」の前に範囲と一致オプションを確認します。検索は移動だけ、置換は書き込みです。", "取代會直接改儲存格內容，執行「全部取代」前先確認範圍和相符選項。尋找只是定位，取代才寫入；這兩件事不要混為一談。"),
            L("如果确实要找问号或星号本身，在它前面加 ~，例如 ~* 表示文本中的星号。", "To search for a literal question mark or asterisk, put ~ before it. For example, ~* means a literal asterisk.", "問号や星号そのものを探す場合は前に ~ を付けます。たとえば ~* は文字としての * を意味します。", "如果確實要找問號或星號本身，在它前面加 ~，例如 ~* 表示文字中的星號。"),
          ],
          L("先想清楚“确定的片段”和“缺少的字符数”，再决定用 ? 还是 *。匹配太多就增加已知字符，匹配不到就减少限制。", "Identify the known fragment and how many characters are missing, then choose ? or *. Too many results means add known text; no results means loosen the pattern.", "分かっている部分と不足している文字数を先に考え、? か * を選びます。多すぎる場合は既知の文字を増やし、見つからない場合は制限を緩めます。", "先想清楚「確定的片段」和「缺少的字元數」，再決定用 ? 還是 *。符合太多就增加已知字元，符合不到就減少限制。"),
          "SO2601?5"
        ),
        practice({
          id: "data-find-wildcards-guided",
          title: L("通配符查找与条件查找交替练习", "Alternate wildcard and criteria lookups", "ワイルドカード検索と条件検索を交互に練習", "通配符尋找與條件查找交替練習"),
          lead: L("题目一半练 Ctrl+F 的通配符定位，一半练“找一组记录”的条件公式。看到订单号片段就回到查找对话框；看到“多少座、合计、至少、且”就判断应该用 COUNTIF、SUMIF 或 SUMIFS。", "Half the tasks practise Ctrl+F wildcard navigation; the other half query a group of records with criteria formulas. An ID fragment belongs in Find; words such as how many, total, at least, and and signal COUNTIF, SUMIF, or SUMIFS.", "半分は Ctrl+F のワイルドカード検索、残りは条件に合う集合を数式で求める課題です。番号の一部なら検索、件数・合計・以上・かつなら COUNTIF・SUMIF・SUMIFS を考えます。", "題目一半練 Ctrl+F 的通配符定位，一半練「找一組記錄」的條件公式。看到訂單號片段就回到尋找對話框；看到「幾座、合計、至少、且」就判斷應該用 COUNTIF、SUMIF 或 SUMIFS。"),
          sheet: orders,
          tasks: wildcardFindTasks("data-find-wildcards-guided").concat(conditionalLookupTasks("data-find-wildcards-guided-conditions")),
          hint: L("先输入题目给出的完整模式，不要自己补字符。? 和 * 的区别是匹配字符数不同；数值条件和 AND/OR 不要硬塞进查找框，改用带条件的公式。", "Enter the exact wildcard pattern shown; do not add characters yourself. ? and * consume different numbers of characters. Keep numeric conditions and AND/OR out of the Find box; use criteria formulas instead.", "問題のパターンをそのまま入力し、文字を足さないでください。? と * は対応する文字数が違います。数値条件や AND/OR は検索ボックスに入れず、条件付き数式を使います。", "先輸入題目給出的完整模式，不要自己補字元。? 和 * 的區別是符合字元數不同；數值條件和 AND/OR 不要硬塞進尋找框，改用帶條件的公式。"),
        }),
      ], { xp: 40 }),

      level("data-subtotal", "lesson", L("SUBTOTAL：筛选之后只算看得见的行", "SUBTOTAL: Total Only What You Can See", "SUBTOTAL：表示中の行だけを集計"), [
        learn(
          "brief-data-subtotal",
          L("筛选华东后，汇总值也必须跟着变", "Totals must follow the East filter", "東部で絞り込むと集計値も変える", "篩選華東後，彙總值也必須跟著變"),
          L("如果汇总格直接写 SUM(C2:C9)，筛选隐藏行后它仍会把隐藏数据算进去。SUBTOTAL 用功能号码决定汇总方式：1–11 会忽略筛选隐藏的行，9 是求和、1 是平均、2 是数字计数、3 是非空计数、4 是最大值、5 是最小值。做月度筛选报表时，先筛选，再让 SUBTOTAL 只统计看得见的行。", "If a summary uses SUM(C2:C9), hidden rows remain in the total after filtering. SUBTOTAL uses a function number to choose the summary: 1–11 ignores rows hidden by a filter; 9 sums, 1 averages, 2 counts numbers, 3 counts non-empty cells, 4 returns the maximum, and 5 the minimum. In a filtered month-end report, filter first and let SUBTOTAL summarize only visible rows.", "SUM(C2:C9) は絞り込みで隠した行も合計します。SUBTOTAL は機能番号で集計方法を選び、1〜11 は絞り込みで隠れた行を無視します。9 は合計、1 は平均、2 は数値個数、3 は空白以外、4 は最大値、5 は最小値です。絞り込み済みの月次レポートでは、先に絞り込み、SUBTOTAL で表示行だけを集計します。", "如果彙總格直接寫 SUM(C2:C9)，篩選隱藏列後它仍會把隱藏資料算進去。SUBTOTAL 用功能號碼決定彙總方式：1–11 會忽略篩選隱藏的列，9 是加總、1 是平均、2 是數字計數、3 是非空計數、4 是最大值、5 是最小值。做月度篩選報表時，先篩選，再讓 SUBTOTAL 只統計看得見的列。"),
          [
            L("先筛选，再检查 SUBTOTAL 的区域。筛选箭头和行号断层都要在，汇总格才会只反映当前业务范围。", "Filter first, then check the SUBTOTAL range. The header arrow and row-number gaps should both be visible so the summary reflects the current business scope.", "先に絞り込み、SUBTOTAL の範囲を確認します。見出しの矢印と行番号の飛びが見える状態で、現在の業務範囲だけを集計します。", "先篩選，再檢查 SUBTOTAL 的範圍。篩選箭頭和列號斷層都要在，彙總格才會只反映目前業務範圍。"),
            L("9 是求和，1 是平均，2 是数字计数，3 是非空计数；4 是最大值，5 是最小值", "9 is sum, 1 average, 2 numeric count, 3 non-empty count, 4 maximum, and 5 minimum", "9は合計、1は平均、2は数値個数、3は空白以外、4は最大値、5は最小値です", "9 是加總，1 是平均，2 是數字計數，3 是非空計數；4 是最大值，5 是最小值"),
            L("101–111 在桌面 Excel 里还会忽略手动隐藏的行；本练习只模拟筛选隐藏，先掌握 1–11 的筛选语义即可。", "The 101–111 variants also ignore manually hidden rows in desktop Excel. This practice simulates filter-hidden rows only, so master the filtered meaning of 1–11 first.", "101〜111 はデスクトップ Excel で手動非表示の行も無視します。この練習は絞り込みによる非表示だけを再現するため、まず 1〜11 の意味を押さえます。", "101–111 在桌面 Excel 裡還會忽略手動隱藏的列；本練習只模擬篩選隱藏，先掌握 1–11 的篩選語意即可。"),
            L("汇总格不要包含自己，否则可能形成循环引用", "Do not include the summary cell itself or you may create a circular reference", "集計セル自身を含めると循環参照になる可能性があります"),
            L("SUBTOTAL 只改变“可见数据”的汇总方式，不替代筛选本身", "SUBTOTAL changes how visible data is summarized, not the filter itself", "SUBTOTAL は集計方法を変えるだけで、絞り込み自体を行う関数ではありません"),
          ],
          L("看到“筛选之后”先想到 SUBTOTAL；看到“所有数据”仍可用 SUM。两者不是互相替代，而是用途不同。写 SUBTOTAL 时不要把汇总格自己放进区域，否则可能出现循环引用。", "When you see after filtering, think SUBTOTAL. For all data, SUM may be right. They serve different jobs. Do not include the summary cell itself in the SUBTOTAL range, or you may create a circular reference.", "「絞り込み後」なら SUBTOTAL、「全データ」なら SUM が候補です。用途が異なります。SUBTOTAL の範囲に集計セル自身を入れないようにします。", "看到「篩選之後」先想到 SUBTOTAL；看到「所有資料」仍可用 SUM。兩者不是互相替代，而是用途不同。寫 SUBTOTAL 時不要把彙總格自己放進範圍，否則可能出現循環參照。"),
          "=SUBTOTAL(9,C2:C9)"
        ),
        practice({
          id: "data-subtotal-guided",
          title: L("可见销售额的五种汇总", "Five visible-data summaries", "表示売上の5種類の集計"),
          lead: L("题目会随机指定区域和汇总方式。先按题目筛选，再用对应功能号码汇总 C2:C9 或 D2:D9；筛选和公式都正确才算完成。", "Tasks assign both a region and a summary type. Filter first, then use the matching function number on C2:C9 or D2:D9; both the filter and formula must be correct.", "地域と集計方法がランダムに指定されます。まず指定地域に絞り、対応する機能番号で C2:C9 または D2:D9 を集計します。絞り込みと数式の両方が必要です。", "題目會隨機指定區域和彙總方式。先依題目篩選，再用對應功能號碼彙總 C2:C9 或 D2:D9；篩選和公式都正確才算完成。"),
          sheet: kpi,
          tasks: subtotalTasks("data-subtotal-guided"),
          hint: L("记忆顺序：9 求和、1 平均、2 数字计数、3 非空计数、4 最大、5 最小。先让筛选箭头和隐藏行数正确，再写公式。", "Remember: 9 sum, 1 average, 2 numeric count, 3 non-empty, 4 max, 5 min. Get the filter arrow and hidden-row count right before writing the formula.", "9合計、1平均、2数値個数、3非空、4最大、5最小です。絞り込みの矢印と非表示件数を合わせてから数式を書きます。", "記憶順序：9 加總、1 平均、2 數字計數、3 非空計數、4 最大、5 最小。先讓篩選箭頭和隱藏列數正確，再寫公式。"),
        }),
        practice({
          id: "data-subtotal-review",
          title: L("把可见汇总接到指标判断", "Connect visible totals to KPI decisions", "表示集計を KPI 判断につなぐ"),
          lead: L("这组不只算一个总额，还要先按题目筛选，再把 SUBTOTAL 放进 ROUND、IF、差值和人均计算，复习前几章。题目会轮换区域，每道题都要重新确认筛选状态。", "This set first applies the requested region filter, then puts SUBTOTAL inside ROUND, IF, gap, and per-person calculations. Regions rotate, so confirm the filter on every task.", "まず指定地域に絞り、SUBTOTAL を ROUND・IF・差額・1人あたり計算に入れて復習します。地域は問題ごとに変わるため、毎回絞り込みを確認します。"),
          sheet: kpi,
          tasks: subtotalReviewTasks("data-subtotal-review"),
          hint: L("先让筛选区域和隐藏行数正确，再算可见总计或均值，最后处理取整和结论文字。不要把筛选操作漏掉，也不要把所有逻辑一次性塞进一个括号。", "Get the filter and hidden-row count right first, then calculate the visible total or average, and only then add rounding and decision text.", "まず絞り込みと非表示件数を正しくし、次に表示合計や平均を求め、最後に丸めと判断文字を加えます。"),
        }),
        practice({
          id: "data-subtotal-check",
          title: L("筛选汇总与条件统计混合抽题", "Mixed visible totals and conditional counts", "表示集計と条件集計の混合"),
          lead: L("随机复习 SUBTOTAL、COUNTIF、SUMIF、COUNTA、INDEX/MATCH，确认你能在不同业务问题中选对工具。", "Randomly review SUBTOTAL, COUNTIF, SUMIF, COUNTA, and INDEX/MATCH to choose the right tool for each question.", "SUBTOTAL・COUNTIF・SUMIF・COUNTA・INDEX/MATCH をランダムに復習します。"),
          sheet: kpi,
          tasks: subtotalCheckTasks("data-subtotal-check"),
          hint: L("问题里出现“按区域”时考虑 SUMIF；出现“可见行”时考虑 SUBTOTAL。", "Use SUMIF for by-region totals and SUBTOTAL for visible rows.", "「地域別」なら SUMIF、「表示行」なら SUBTOTAL を考えます。"),
        }),
      ], { xp: 45 }),

      level("data-visible-review", "review", L("真实复盘：筛选、查找与可见汇总", "Real Review: Filter, Find, and Visible Totals", "実務レビュー：絞り込み・検索・表示集計", "真實複盤：篩選、尋找與可見彙總"), [
        practice({
          id: "data-visible-review-guided",
          title: L("把区域筛选和可见汇总连起来", "Connect a region filter to a visible total", "地域の絞り込みと表示集計をつなぐ", "把區域篩選和可見彙總連起來"),
          lead: L("这次不是只筛一下就结束。按真实 Excel 的顺序选中含表头的数据区并开启筛选，把区域收窄成题目指定值；再在汇总格写 SUBTOTAL，只汇总当前可见行。检查时会同时核对筛选、隐藏行和公式，哪一步没做都会提示。", "The filter is only half the job. Select the range with headers and enable Filter as you would in Excel, narrow Region to the requested value, then write SUBTOTAL in the summary cell so only visible rows are totaled. The check verifies the filter, hidden rows, and formula.", "今回は絞り込みだけでは終わりません。Excel と同じく見出しを含む範囲を選んで絞り込みを有効にし、指定地域に絞ります。そのうえで集計セルに SUBTOTAL を書き、表示行だけを集計します。確認では絞り込み・非表示行・数式の両方を見ます。", "這次不是只篩一下就結束。依真實 Excel 的順序選取含欄首的資料範圍並開啟篩選，把區域收窄成題目指定值；再在彙總格寫 SUBTOTAL，只彙總目前可見列。檢查時會同時核對篩選、隱藏列和公式，哪一步沒做都會提示。"),
          sheet: kpi,
          tasks: filteredSubtotalTasks("data-visible-review-guided"),
          hint: L("公式用 =SUBTOTAL(9,C2:C9)，不要用 SUM。若结果仍包含其他区域，先检查筛选是否真的应用了。", "Use =SUBTOTAL(9,C2:C9), not SUM. If the result still includes other regions, check that the filter was actually applied.", "=SUBTOTAL(9,C2:C9) を使い、SUM は使いません。他の地域がまだ含まれる場合は、絞り込みが適用済みか確認します。", "公式用 =SUBTOTAL(9,C2:C9)，不要用 SUM。若結果仍包含其他區域，先檢查篩選是否真的套用了。"),
        }),
        practice({
          id: "data-visible-review-decisions",
          title: L("给筛选后的团队做一句业务判断", "Turn a filtered total into a business decision", "絞り込み後の集計を業務判断にする", "給篩選後的團隊做一句業務判斷"),
          lead: L("题目会要求比较筛选后的销售额与目标，或找出当前区域里表现最好的人。先筛选，再选 SUBTOTAL、IF 或 INDEX/MATCH，别把三种工具混在一题里。", "Tasks compare the filtered sales with target or identify the strongest performer in the filtered region. Filter first, then choose SUBTOTAL, IF, or INDEX/MATCH without mixing every tool into one formula.", "絞り込み後の売上と目標の比較、または地域内の最上位者を求めます。まず絞り込み、次に SUBTOTAL・IF・INDEX/MATCH のどれを使うか決めます。", "題目會要求比較篩選後的銷售額與目標，或找出目前區域裡表現最好的人。先篩選，再選 SUBTOTAL、IF 或 INDEX/MATCH，別把三種工具混在一題裡。"),
          sheet: kpi,
          tasks: visibleDecisionTasks("data-visible-review-decisions"),
          hint: L("筛选和公式是两道检查：先让隐藏行数正确，再让目标格的显示值与业务结论一致。", "The filter and formula are two checks: get the hidden-row count right, then make the result match the business decision.", "絞り込みと数式は2つのチェックです。非表示件数を合わせ、その後に結果を業務判断と一致させます。", "篩選和公式是兩道檢查：先讓隱藏列數正確，再讓目標格的顯示值與業務結論一致。"),
        }),
      ], { xp: 50 }),

      level("data-sumproduct", "lesson", L("SUMPRODUCT：数量、单价与折扣一次算完", "SUMPRODUCT: Quantity, Price, and Discount in One Pass", "SUMPRODUCT：数量・単価・割引を一括計算"), [
        learn(
          "brief-data-sumproduct",
          L("订单表不想再加一列临时金额", "The order sheet should not need a temporary amount column", "注文表に一時的な金額列を増やしたくない"),
          L("订单表的金额已经算好，但复盘时还要回答“原价总额是多少”“折扣让了多少”“加权平均单价多少”。SUMPRODUCT 会把两列或多列对应行先相乘，再把乘积相加。", "Order amounts are already calculated, but the review also needs list total, discount value, and weighted average price. SUMPRODUCT multiplies matching rows across two or more columns and then sums the products.", "注文表の金額は計算済みですが、定価合計・割引額・加重平均単価も必要です。SUMPRODUCT は複数列の同じ行を掛け、その積を合計します。"),
          [
            L("每个数组的区域长度必须相同，行数不能错位", "All array ranges must have the same length and align by row", "各配列の範囲は同じ長さで、行をそろえる必要があります"),
            L("它先做“对应行乘积”，最后才相加，不是先加再乘", "It multiplies corresponding rows first, then sums; it is not add-then-multiply", "対応する行を先に掛けてから合計します"),
            L("加权平均要用“金额合计 ÷ 数量合计”，不能直接平均单价", "A weighted average uses total amount divided by total quantity, not a plain price average", "加重平均は金額合計÷数量合計で求め、単価の単純平均ではありません"),
            L("折扣金额可以把数量、单价、折扣率三个数组一起相乘", "Discount value can multiply quantity, price, and discount-rate arrays together", "割引額は数量・単価・割引率の3配列を掛けて求められます"),
          ],
          L("先确认区域都是 E2:E11 这样的同长区域，再看是否需要先算折扣，最后决定用 ROUND 保留几位。", "Confirm all ranges have the same length, decide whether to apply the discount, then choose the rounding precision.", "範囲の長さをそろえ、割引を適用するかを決め、最後に丸め桁を選びます。"),
          "=SUMPRODUCT(E2:E11,F2:F11)"
        ),
        practice({
          id: "data-sumproduct-guided",
          title: L("订单原价、折扣、服务费和加权单价", "List total, discount, service fee, and weighted price", "定価合計・割引・サービス費・加重単価"),
          lead: L("随机抽订单复盘问题。先看数量、单价、折扣三列，再决定要乘几个数组。", "Random order-review tasks appear. Inspect quantity, price, and discount columns, then decide how many arrays to multiply.", "注文レビューの問題がランダムに出ます。数量・単価・割引を見て、掛ける配列数を決めます。"),
          sheet: orders,
          tasks: sumproductTasks("data-sumproduct-guided"),
          hint: L("原价总额乘数量和单价；折扣金额再乘折扣率；加权平均用原价总额除数量合计。", "List total uses quantity × price. Discount value also multiplies the rate. Weighted price divides list total by quantity.", "定価合計は数量×単価、割引額はさらに割引率、加重単価は定価合計÷数量合計です。"),
        }),
        practice({
          id: "data-sumproduct-review",
          title: L("把乘积和接到条件与业务结论", "Connect product sums to conditions and decisions", "積和を条件・業務判断につなぐ"),
          lead: L("这一组混合 IF、COUNTIF、SUM、COUNTA 和 SUMPRODUCT。题目可能要求分类、折扣率、平均订单额或额外让利。", "This set mixes IF, COUNTIF, SUM, COUNTA, and SUMPRODUCT. Tasks ask for classification, discount rate, average order amount, or an extra concession.", "IF・COUNTIF・SUM・COUNTA・SUMPRODUCT を混ぜます。分類・割引率・平均注文額・追加値引きを扱います。"),
          sheet: orders,
          tasks: sumproductReviewTasks("data-sumproduct-review"),
          hint: L("先写核心乘积和，再在外面套 ROUND 或 IF；不要一开始就同时处理三个业务问题。", "Write the core product sum first, then wrap it in ROUND or IF. Do not solve three business questions at once.", "まず積和を書き、外側に ROUND や IF を付けます。"),
        }),
        practice({
          id: "data-sumproduct-check",
          title: L("乘积和收尾随机抽题", "Product-sum checkpoint", "積和の仕上げランダム"),
          lead: L("再次随机练习 SUMPRODUCT 的基础、加权、折扣和取整场景。注意区域长度与小数位。", "Review SUMPRODUCT basics, weighted averages, discounts, and rounding again. Watch range lengths and decimals.", "SUMPRODUCT の基本・加重・割引・丸めを再練習します。範囲長と小数桁に注意します。"),
          sheet: orders,
          tasks: sumproductTasks("data-sumproduct-check"),
          hint: L("如果结果差了好几个零，先看看折扣是不是乘了两遍。", "If the result is off by several zeros, check whether the discount was applied twice.", "結果が何桁もずれている場合、割引を二重に適用していないか確認します。"),
        }),
      ], { xp: 45 }),

      level("data-review", "review", L("经营数据综合复盘", "Business Data Review", "経営データ総合レビュー"), [
        practice({
          id: "data-review-orders",
          title: L("订单复盘：金额、排名与条件汇总", "Order review: amounts, ranks, and conditional totals", "注文レビュー：金額・順位・条件集計"),
          lead: L("销售经理拿来订单表，要求算平均订单额、筛选总额、金额排名、区域占比和优先订单。随机抽一道，但每题都要复用到前章工具。", "The sales manager needs average order amount, visible total, amount rank, regional share, and a priority order. Each random task reuses earlier tools.", "営業責任者が平均注文額・表示合計・金額順位・地域シェア・優先注文を求めます。既習ツールを組み合わせます。"),
          sheet: orders,
          tasks: dataOrdersReviewTasks("data-review-orders"),
          hint: L("先读业务问题，再找最直接的主函数。排名题不要先手算名次，比例题也不要先手算总额。", "Read the business question, then choose the most direct main function. Do not hand-calculate ranks or totals first.", "業務質問を読み、最も直接的な主関数を選びます。順位や合計を手計算しないようにします。"),
        }),
        practice({
          id: "data-review-kpi",
          title: L("KPI 复盘：排名、可见汇总与加权达成率", "KPI review: rank, visible totals, and weighted attainment", "KPI レビュー：順位・表示集計・加重達成率"),
          lead: L("同一份季度数据要回答“谁进前三”“多少人未达标”“华北目标多少”“团队加权达成率多少”。每题只换业务目标，表格不换。", "The same quarterly data answers top-three, below-target headcount, North target, and weighted attainment. The business question changes; the table does not.", "同じ四半期データで上位3名・未達人数・北部目標・加重達成率を答えます。表は変わりません。"),
          sheet: kpi,
          tasks: dataKpiReviewTasks("data-review-kpi"),
          hint: L("加权达成率要乘销售额权重；简单的 AVERAGE 只适合每个样本权重相同的场景。", "Weighted attainment multiplies by sales weights; a plain AVERAGE is for equally weighted samples.", "加重達成率は売上ウェイトを掛けます。単純 AVERAGE は同じ重みの場面だけです。"),
        }),
        practice({
          id: "data-review-final",
          title: L("数据分析章终局抽题", "Data-analysis final draw", "データ分析章の最終抽選"),
          lead: L("最终随机在订单与 KPI 两张表之间切换，混合 RANK、SUBTOTAL、SUMPRODUCT、SUMIF(S)、COUNTIF、INDEX/MATCH 与 IF。", "The final draw switches between orders and KPI, mixing RANK, SUBTOTAL, SUMPRODUCT, SUMIF(S), COUNTIF, INDEX/MATCH, and IF.", "最後は注文表と KPI 表を切り替え、RANK・SUBTOTAL・SUMPRODUCT・SUMIF(S)・COUNTIF・INDEX/MATCH・IF を混ぜます。"),
          sheet: orders,
          tasks: dataOrdersReviewTasks("data-review-final").concat(dataKpiReviewTasks("data-review-final")),
          hint: L("先观察表格：订单表找 H 列金额，KPI 表找 C 列销售。函数名不是线索，业务问题才是。", "Inspect the table first: H is order amount, C is KPI sales. The business question, not the function name, is the clue.", "まず表を確認します。注文表はH列金額、KPI表はC列売上です。関数名ではなく業務質問が手がかりです。"),
        }),
      ], { xp: 50 }),
    ],
  });
})();


