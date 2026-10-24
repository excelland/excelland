(function () {
  "use strict";

  const D = window.CourseData;
  const K = window.CurriculumKit;
  const L = D.L;
  const learn = D.learnStep;
  const choice = D.choiceStep;

  function addDefaults(options, values) {
    options.defaults = Object.assign({}, options.defaults || {}, values);
  }

  function addChoices(options, values) {
    options.choices = Object.assign({}, options.choices || {}, values);
  }

  function alignGoal(mode, goal, options) {
    if (mode === "chart") {
      addChoices(options, { chartType: ["column", "bar", "line", "pie", "area", "scatter", "combo"] });
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
    if (mode === "pivot" || mode === "pivotChart") {
      if (goal.showAs === "percentOfTotal") goal.showAs = "percentOfGrandTotal";
      if (goal.groupDate === "months") goal.groupDate = "month";
      if (goal.groupDate === "quarters") goal.groupDate = "quarter";
      if (goal.groupDate === "years") goal.groupDate = "year";
      if (goal.calculatedField) {
        addDefaults(options, { calculatedField: goal.calculatedField });
        addChoices(options, {
          pivotValueField: [{ value: goal.calculatedField.name, label: goal.calculatedField.name }],
        });
      }
      if (goal.refresh) addDefaults(options, { refresh: goal.refresh });
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

  function option(id, zh, en, ja, tw, correct, noteZh, noteEn, noteJa, noteTw) {
    return {
      id,
      text: L(zh, en, ja, tw),
      correct: Boolean(correct),
      note: L(noteZh, noteEn, noteJa, noteTw),
    };
  }

  const chartHeaders = [
    L("月份", "Month", "月", "月份"),
    L("门店收入", "Store revenue", "店舗売上", "門市收入"),
    L("线上收入", "Online revenue", "オンライン売上", "線上收入"),
  ];

  const chartRows = [
    [L("一月", "January", "1月", "一月"), 82000, 51000],
    [L("二月", "February", "2月", "二月"), 76000, 56000],
    [L("三月", "March", "3月", "三月"), 91000, 63000],
    [L("四月", "April", "4月", "四月"), 88000, 68000],
    [L("五月", "May", "5月", "五月"), 95000, 72000],
    [L("六月", "June", "6月", "六月"), 102000, 79000],
  ];

  const chartCells = K.makeSheet(chartHeaders, chartRows, {
    D1: L("目标", "Target", "目標", "目標"),
    D2: 100000,
  });

  const comboCells = K.makeSheet([
    L("月份", "Month", "月", "月份"),
    L("净销售额", "Net sales", "純売上", "淨銷售額"),
    L("毛利率", "Gross margin", "粗利益率", "毛利率"),
  ], [
    [L("一月", "January", "1月", "一月"), 138000, 0.31],
    [L("二月", "February", "2月", "二月"), 142000, 0.33],
    [L("三月", "March", "3月", "三月"), 150000, 0.35],
    [L("四月", "April", "4月", "四月"), 146000, 0.34],
    [L("五月", "May", "5月", "五月"), 158000, 0.37],
    [L("六月", "June", "6月", "六月"), 165000, 0.39],
  ]);

  const sparkCells = K.makeSheet([
    L("团队", "Team", "チーム", "團隊"),
    L("第 1 周", "Week 1", "第1週", "第 1 週"),
    L("第 2 周", "Week 2", "第 2週", "第 2 週"),
    L("第 3 周", "Week 3", "第3週", "第 3 週"),
    L("第 4 周", "Week 4", "第4週", "第 4 週"),
    L("第 5 周", "Week 5", "第5週", "第 5 週"),
    L("迷你趋势", "Trend sparkline", "傾向スパークライン", "迷你趨勢"),
  ], [
    [L("设计", "Design", "デザイン", "設計"), 18, 22, 21, 27, 31],
    [L("客服", "Support", "サポート", "客服"), 42, 40, 45, 41, 47],
    [L("培训", "Training", "研修", "培訓"), 9, 14, 12, 18, 20],
  ]);

  const scatterCells = K.makeSheet([
    L("月份", "Month", "月", "月份"),
    L("广告投入", "Ad spend", "広告費", "廣告投入"),
    L("订单数", "Orders", "注文数", "訂單數"),
  ], [
    [L("一月", "January", "1月", "一月"), 12000, 310],
    [L("二月", "February", "2月", "二月"), 14500, 352],
    [L("三月", "March", "3月", "三月"), 18000, 418],
    [L("四月", "April", "4月", "四月"), 21000, 465],
    [L("五月", "May", "5月", "五月"), 23500, 512],
    [L("六月", "June", "6月", "六月"), 26000, 548],
  ]);

  const pivotHeaders = [
    L("日期", "Date", "日付", "日期"),
    L("团队", "Team", "チーム", "團隊"),
    L("数量", "Units", "数量", "數量"),
    L("收入", "Revenue", "収入", "收入"),
    L("成本", "Cost", "原価", "成本"),
    L("状态", "Status", "状態", "狀態"),
  ];

  const pivotRows = [
    ["2026-01-05", L("设计", "Design", "デザイン", "設計"), 18, 32000, 22100, L("已结案", "Closed", "完了", "已結案")],
    ["2026-01-18", L("行政", "Admin", "総務", "行政"), 24, 18500, 12600, L("已结案", "Closed", "完了", "已結案")],
    ["2026-02-02", L("客服", "Support", "サポート", "客服"), 12, 21000, 14800, L("处理中", "Open", "処理中", "處理中")],
    ["2026-02-16", L("设计", "Design", "デザイン", "設計"), 22, 38600, 25900, L("已结案", "Closed", "完了", "已結案")],
    ["2026-03-03", L("培训", "Training", "研修", "培訓"), 8, 27800, 18100, L("处理中", "Open", "処理中", "處理中")],
    ["2026-03-19", L("行政", "Admin", "総務", "行政"), 20, 19600, 13800, L("已结案", "Closed", "完了", "已結案")],
    ["2026-04-07", L("客服", "Support", "サポート", "客服"), 15, 24500, 16900, L("处理中", "Open", "処理中", "處理中")],
    ["2026-04-21", L("设计", "Design", "デザイン", "設計"), 17, 31200, 21600, L("已结案", "Closed", "完了", "已結案")],
    ["2026-05-06", L("培训", "Training", "研修", "培訓"), 10, 30400, 19900, L("已结案", "Closed", "完了", "已結案")],
    ["2026-05-20", L("行政", "Admin", "総務", "行政"), 26, 20400, 14100, L("处理中", "Open", "処理中", "處理中")],
    ["2026-06-04", L("设计", "Design", "デザイン", "設計"), 25, 43800, 29500, L("已结案", "Closed", "完了", "已結案")],
    ["2026-06-18", L("客服", "Support", "サポート", "客服"), 14, 23200, 15600, L("已结案", "Closed", "完了", "已結案")],
  ];

  const pivotCells = K.makeSheet(pivotHeaders, pivotRows, {
    H1: L("新建透视表", "New PivotTable", "新しいピボットテーブル", "新增樞紐分析表"),
    L1: L("部门汇总样例", "Department summary sample", "部署集計サンプル", "部門彙總範例"),
    L2: L("团队", "Team", "チーム", "團隊"),
    M2: L("收入", "Revenue", "収入", "收入"),
    N2: L("成本", "Cost", "原価", "成本"),
    L3: L("设计", "Design", "デザイン", "設計"),
    M3: 145600,
    N3: 99100,
    L4: L("行政", "Admin", "総務", "行政"),
    M4: 58500,
    N4: 40500,
    L5: L("客服", "Support", "サポート", "客服"),
    M5: 68700,
    N5: 47300,
    L6: L("合计", "Total", "合計", "合計"),
    M6: 272800,
    N6: 186900,
  });

  D.registerChapter({
    id: "ch17-charts-sparklines",
    icon: "17",
    title: L("第 17 章 · 图表与迷你图", "Chapter 17 · Charts and Sparklines", "第17章 · グラフとスパークライン", "第 17 章 · 圖表與迷你圖"),
    subtitle: L("先明确要回答的问题，再选择图表类型、数据方向和必要元素。", "Start with the question, then choose the chart type, data direction, and necessary elements.", "答えたい問いを決めてから、グラフの種類・データの向き・必要な要素を選びます。", "先明確要回答的問題，再選擇圖表類型、資料方向和必要元素。"),
    levels: [
      level(
        "visual-chart-types",
        "lesson",
        L("选对图表，先说清比较关系", "Choose the chart that matches the comparison", "比較の種類に合うグラフを選ぶ", "選對圖表，先說清比較關係"),
        [
          learn(
            "viz17-charttypes-teach",
            L("图表类型由问题决定", "The question decides the chart type", "問いがグラフの種類を決める", "圖表類型由問題決定"),
            L("比较类别高低用柱形图，比较长短清单用条形图，观察时间趋势用折线图，展示单一整体构成用饼图，检查两个数值是否相关用散点图。", "Use columns to compare category magnitudes, bars for long category names, lines for time trends, pie for one whole, and scatter to examine whether two numeric measures are related.", "カテゴリの大小比較は縦棒、項目名が長い場合は横棒、時系列の傾向は折れ線、1つの全体構成は円、2つの数値の関係は散布図を使います。", "比較類別高低用柱形圖，比較長清單用條形圖，觀察時間趨勢用折線圖，展示單一整體構成用圓餅圖，檢查兩個數值是否相關用散點圖。"),
            [
              L("柱形图的类别轴在下方，适合月份、部门等短标签。", "A column chart puts categories on the horizontal axis, suitable for short labels such as months or departments.", "縦棒グラフはカテゴリ軸が下にあり、月や部署などの短いラベルに向きます。", "柱形圖的類別軸在下方，適合月份、部門等短標籤。"),
              L("条形图把类别旋转到纵向，长名称更容易阅读。", "A bar chart turns categories vertical, making long names easier to read.", "横棒グラフはカテゴリを縦に並べるため、長い名前を読みやすくします。", "條形圖把類別轉到縱向，長名稱更容易閱讀。"),
              L("折线图保留时间顺序；饼图只适合一个非负数据系列，切片不宜过多。", "Line charts preserve time order; pie charts suit one non-negative series and should not have too many slices.", "折れ線グラフは時間順を保ち、円グラフは1つの非負系列に向き、切片を増やしすぎません。", "折線圖保留時間順序；圓餅圖只適合一個非負資料數列，切片不宜過多。"),
              L("散点图的两个轴都是数值，点云形状比单个点更重要。", "Both scatter axes are numeric, and the shape of the point cloud matters more than any single point.", "散布図は2軸とも数値で、個々の点より点群の形を見ます。", "散點圖的兩個軸都是數值，點群形狀比單一點更重要。"),
            ],
            L("不要用饼图比较多个系列，也不要用折线图表示无顺序的类别。", "Do not compare multiple series with a pie chart or use a line for unordered categories.", "複数系列の比較に円グラフを使わず、順序のないカテゴリに折れ線を使いません。", "不要用圓餅圖比較多個數列，也不要用折線圖表示無順序的類別。"),
            L("先选中包含表头的完整数据区，再执行“插入”→“图表”，能减少手工改数据源。", "Select the full data range including headers before Insert, Chart to reduce manual source edits.", "表頭を含むデータ範囲を選んでから「挿入」→「グラフ」を実行すると、データ源の修正が減ります。", "先選取包含表頭的完整資料區，再執行「插入」→「圖表」，能減少手動改資料來源。")
          ),
          lab(
            "viz17-column-lab",
            L("引导实验：比较门店与线上月度收入", "Guided lab: compare store and online monthly revenue", "ガイド付き実験：店舗とオンラインの月次売上を比較", "引導實驗：比較門市與線上每月收入"),
            L("请用 A1:C7 建立柱形图，系列按列取，标题写“月度收入对比”，显示图例和数据标签。", "Create a column chart from A1:C7 with series in columns, title Monthly revenue comparison, and show the legend and data labels.", "A1:C7 から縦棒グラフを作成し、系列を列単位にし、タイトルを「月次売上比較」、凡例とデータラベルを表示します。", "請用 A1:C7 建立柱形圖，數列依欄取用，標題寫「每月收入比較」，顯示圖例和資料標籤。"),
            {
              kind: "visual",
              mode: "chart",
              sheet: chartCells,
              ranges: { source: "A1:C7", categories: "A2:A7", series: "B1:C1" },
              options: { chartType: "column", seriesBy: "columns", showLegend: true, dataLabels: true },
              goal: {
                operation: "chart",
                chartType: "column",
                dataRange: "A1:C7",
                seriesBy: "columns",
                title: L("月度收入对比", "Monthly revenue comparison", "月次売上比較", "每月收入比較"),
                showLegend: true,
                dataLabels: true,
                trendline: false,
                secondaryAxis: false,
              },
            },
            L("选中 A1:C7，插入柱形图；在“选择数据”中确认系列方向为列，再添加标题和数据标签。", "Select A1:C7, insert a column chart, confirm Series in Columns under Select Data, then add title and data labels.", "A1:C7 を選んで縦棒グラフを挿入し、「データの選択」で系列を列単位にし、タイトルとデータラベルを追加します。", "選取 A1:C7，插入柱形圖；在「選取資料」確認數列方向為欄，再加入標題和資料標籤。"),
            L("柱形图正确比较两条月度收入系列，图例和标签都能支持会议阅读。", "The column chart compares both monthly revenue series with a readable legend and labels.", "縦棒グラフが2つの月次売上系列を比較し、凡例とラベルも会議で読める状態です。", "柱形圖正確比較兩條每月收入數列，圖例和標籤都能支持會議閱讀。")
          ),
          lab(
            "viz17-bar-lab",
            L("引导实验：用条形成本清单展示长名称", "Guided lab: use a bar chart for the long-name cost list", "ガイド付き実験：長い項目名を横棒で表示", "引導實驗：用條形成本清單展示長名稱"),
            L("请用 B1:C2 建条形图，系列按行取，标题写“六个月收入对比”，显示图例，不显示数据标签。", "Create a bar chart from B1:C2 with series in rows, title Six-month revenue comparison, legend on, and data labels off.", "B1:C2 から横棒グラフを作成し、系列を行単位にし、タイトルを「6か月売上比較」、凡例あり、データラベルなしにします。", "請用 B1:C2 建立條形圖，數列依列取用，標題寫「六個月收入比較」，顯示圖例，不顯示資料標籤。"),
            {
              kind: "visual",
              mode: "chart",
              sheet: chartCells,
              ranges: { source: "B1:C2", stores: "B2", online: "C2" },
              options: { chartType: "bar", seriesBy: "rows", showLegend: true, dataLabels: false },
              goal: {
                operation: "chart",
                chartType: "bar",
                dataRange: "B1:C2",
                seriesBy: "rows",
                title: L("六个月收入对比", "Six-month revenue comparison", "6か月売上比較", "六個月收入比較"),
                showLegend: true,
                dataLabels: false,
                trendline: false,
                secondaryAxis: false,
              },
            },
            L("选中 B1:C2，插入条形图，在“选择数据”中切换为“行”，再设置标题和图例。", "Select B1:C2, insert a bar chart, switch Series to Rows under Select Data, then set the title and legend.", "B1:C2 を選んで横棒グラフを挿入し、「データの選択」で系列を行単位に切り替え、タイトルと凡例を設定します。", "選取 B1:C2，插入條形圖，在「選取資料」切換為「列」，再設定標題和圖例。"),
            L("条形图按行理解数据，长项目名称在纵轴上更清楚。", "The bar chart reads data by rows, making the long item names clearer on the vertical axis.", "横棒グラフが行単位でデータを読み、長い項目名が縦軸で読みやすくなっています。", "條形圖依列理解資料，長項目名稱在縱軸上更清楚。")
          ),
          choice(
            "viz17-chart-choice",
            L("想观察六个月的收入趋势，应优先选择哪种图？", "Which chart best shows a six-month revenue trend?", "6か月の売上傾向を見るのに最も適したグラフはどれですか。", "想觀察六個月的收入趨勢，應優先選擇哪種圖？"),
            L("问题里的关键词是“随时间变化”。", "The key phrase is “change over time.”", "手がかりは「時間に沿った変化」です。", "問題裡的關鍵詞是「隨時間變化」。"),
            [
              option("line", "折线图", "Line chart", "折れ線グラフ", "折線圖", true, "折线图保留时间顺序，最适合趋势。", "A line chart preserves time order and suits trends best.", "折れ線グラフは時間順を保ち、傾向に最適です。", "折線圖保留時間順序，最適合趨勢。"),
              option("pie", "饼图", "Pie chart", "円グラフ", "圓餅圖", false, "饼图强调单一整体的构成，不擅长月度趋势。", "A pie emphasizes one whole and is poor for monthly trends.", "円グラフは1つの全体構成向きで、月次傾向には向きません。", "圓餅圖強調單一整體構成，不擅長每月趨勢。"),
              option("scatter", "散点图", "Scatter chart", "散布図", "散點圖", false, "散点图适合两个数值的关系，不直接表达时间顺序。", "Scatter suits two numeric measures, not ordered time.", "散布図は2つの数値の関係向きで、時間順を直接示しません。", "散點圖適合兩個數值的關係，不直接表達時間順序。"),
            ],
            L("趋势看线，类别比较看柱，构成看饼，相关看散点。", "Line for trend, columns for category comparison, pie for composition, scatter for correlation.", "傾向は折れ線、カテゴリ比較は縦棒、構成は円、関係は散布図です。", "趨勢看折線，類別比較看柱形，構成看圓餅，相關看散點。")
          ),
        ]
      ),
      level(
        "visual-chart-elements",
        "lesson",
        L("用图表元素把结论讲完整", "Use chart elements to complete the story", "グラフ要素で結論まで伝える", "用圖表元素把結論說完整"),
        [
          learn(
            "viz17-elements-teach",
            L("标题、图例、标签和趋势线各有职责", "Titles, legends, labels, and trendlines each have a job", "タイトル・凡例・ラベル・近似曲線の役割", "標題、圖例、標籤和趨勢線各有職責"),
            L("标题说明图在回答什么问题，图例把颜色对应到系列，数据标签给出关键数值，趋势线总结方向。元素不是越多越好，而是要让读者不用猜。", "The title states the question, the legend maps colors to series, data labels provide key values, and a trendline summarizes direction. More elements are not automatically better; the reader should not have to guess.", "タイトルは問い、凡例は色と系列の対応、データラベルは主要な数値、近似曲線は方向を示します。要素は多いほどよいのではなく、読者が推測しなくて済むようにします。", "標題說明圖在回答什麼問題，圖例把顏色對應到數列，資料標籤給出關鍵數值，趨勢線總結方向。元素不是越多越好，而是讓讀者不用猜。"),
            [
              L("标题要写业务结论或比较对象，不要用“图表 1”。", "Use a business conclusion or comparison in the title, not “Chart 1”.", "タイトルには業務上の結論や比較対象を書き、「グラフ1」を使いません。", "標題要寫業務結論或比較對象，不要用「圖表 1」。"),
              L("图例只有在两个以上系列时才必要；单一系列可省略，图例名称应可读。", "A legend is needed only with two or more series; for one series it can be removed, and legend names should be readable.", "凡例は2系列以上のときに必要です。1系列なら省略でき、凡例名は読みやすくします。", "圖例只有在兩個以上數列時才必要；單一數列可省略，圖例名稱應可讀。"),
              L("数据标签只标关键系列，过多小标签会遮挡图形。", "Label only key series; too many small labels obscure the chart.", "データラベルは主要系列だけに付け、多すぎる小さなラベルは図を隠します。", "資料標籤只標關鍵數列，過多小標籤會遮擋圖形。"),
              L("趋势线是概括，不替代逐月数据；R 平方值低时不要过度解释。", "A trendline summarizes and does not replace monthly data; do not overinterpret a low R-squared.", "近似曲線は要約であり、月別データの代わりではありません。決定係数が低い場合は過度に解釈しません。", "趨勢線是概括，不替代逐月資料；R 平方值低時不要過度解釋。"),
            ],
            L("先去掉无关元素，再补上当前问题需要的元素；默认元素不一定适合每个场景。", "Remove irrelevant elements first, then add only what the question needs; defaults do not fit every scene.", "不要な要素を外し、問いに必要な要素だけを追加します。既定の要素が常に適切とは限りません。", "先移除無關元素，再補上目前問題需要的元素；預設元素不一定適合每個情境。"),
            L("双击图表元素可直接编辑文字；图表设计 → 添加图表元素提供完整菜单。", "Double-click a chart element to edit its text; Chart Design, Add Chart Element provides the full menu.", "グラフ要素をダブルクリックすると文字を編集でき、グラフのデザイン→グラフ要素を追加から選べます。", "按兩下圖表元素可直接編輯文字；圖表設計 → 新增圖表元素提供完整功能表。")
          ),
          lab(
            "viz17-line-lab",
            L("引导实验：用折线图看门店趋势，并加趋势线", "Guided lab: show store trend with a line and trendline", "ガイド付き実験：折れ線と近似曲線で店舗傾向を表示", "引導實驗：用折線圖看門市趨勢，並加趨勢線"),
            L("请用 A1:B7 建立折线图，按列取系列，标题“门店收入趋势”，显示数据标签和趋势线，不显示图例。", "Create a line chart from A1:B7 with series in columns, title Store revenue trend, show data labels and a trendline, and hide the legend.", "A1:B7 から折れ線グラフを作成し、系列を列単位、タイトルを「店舗売上傾向」、データラベルと近似曲線を表示し、凡例を非表示にします。", "請用 A1:B7 建立折線圖，依欄取用數列，標題「門市收入趨勢」，顯示資料標籤和趨勢線，不顯示圖例。"),
            {
              kind: "visual",
              mode: "chart",
              sheet: chartCells,
              ranges: { source: "A1:B7", categories: "A2:A7", series: "B1:B1" },
              options: { chartType: "line", trendline: true, dataLabels: true, showLegend: false },
              goal: {
                operation: "chart",
                chartType: "line",
                dataRange: "A1:B7",
                seriesBy: "columns",
                title: L("门店收入趋势", "Store revenue trend", "店舗売上傾向", "門市收入趨勢"),
                showLegend: false,
                dataLabels: true,
                trendline: true,
                secondaryAxis: false,
              },
            },
            L("插入折线图后，在“图表设计”→“添加图表元素”中依次加入数据标签和趋势线；单系列时删除图例。", "After inserting the line chart, use Chart Design, Add Chart Element to add Data Labels and Trendline; remove the legend for one series.", "折れ線グラフを挿入し、「グラフのデザイン」→「グラフ要素を追加」でデータラベルと近似曲線を追加します。1系列なら凡例を削除します。", "插入折線圖後，在「圖表設計」→「新增圖表元素」依次加入資料標籤和趨勢線；單一數列時刪除圖例。"),
            L("门店收入趋势和方向已经一眼可见，标签没有遮住数据点。", "The store trend and direction are clear at a glance, and labels do not cover the points.", "店舗売上の傾向と方向がひと目で分かり、ラベルも点を隠していません。", "門市收入趨勢和方向已經一眼可見，標籤沒有遮住資料點。")
          ),
          lab(
            "viz17-pie-lab",
            L("引导实验：只用一组收入做构成图", "Guided lab: use one revenue series for composition", "ガイド付き実験：1系列の収入で構成図を作成", "引導實驗：只用一組收入做構成圖"),
            L("请用 A1:B7 建立饼图，标题“门店收入构成”，显示图例和数据标签，不显示趋势线。", "Create a pie chart from A1:B7 with title Store revenue composition, showing the legend and data labels and no trendline.", "A1:B7 から円グラフを作成し、タイトルを「店舗売上構成」、凡例とデータラベルを表示し、近似曲線は表示しません。", "請用 A1:B7 建立圓餅圖，標題「門市收入構成」，顯示圖例和資料標籤，不顯示趨勢線。"),
            {
              kind: "visual",
              mode: "chart",
              sheet: chartCells,
              ranges: { source: "A1:B7", categories: "A2:A7", series: "B1:B1" },
              options: { chartType: "pie", showLegend: true, dataLabels: true },
              goal: {
                operation: "chart",
                chartType: "pie",
                dataRange: "A1:B7",
                seriesBy: "columns",
                title: L("门店收入构成", "Store revenue composition", "店舗売上構成", "門市收入構成"),
                showLegend: true,
                dataLabels: true,
                trendline: false,
                secondaryAxis: false,
              },
            },
            L("只选月份和门店收入两列，插入饼图；不要同时选线上收入，否则饼图会出现第二个无意义的环。", "Select only Month and Store revenue, then insert a pie; do not include Online revenue or the pie gains a meaningless second series.", "月と店舗売上の2列だけを選んで円グラフを挿入します。オンライン売上も選ぶと無意味な第2系列が加わります。", "只選月份和門市收入兩欄，插入圓餅圖；不要同時選線上收入，否則圓餅圖會出現第二個無意義的環。"),
            L("饼图只展示门店收入的月度构成，图例与标签对应清楚。", "The pie shows only the monthly composition of store revenue with clear legend and labels.", "円グラフは店舗売上の月別構成だけを示し、凡例とラベルが対応しています。", "圓餅圖只展示門市收入的每月構成，圖例與標籤對應清楚。")
          ),
          lab(
            "viz17-scatter-lab",
            L("迁移实验：检查广告投入与订单数的关系", "Transfer lab: examine ad spend versus orders", "転用実験：広告費と注文数の関係を見る", "遷移實驗：檢查廣告投入與訂單數的關係"),
            L("请用 B1:C7 建立散点图，标题“广告投入与订单数”，显示趋势线，不显示数据标签和图例。", "Create a scatter chart from B1:C7 with title Ad spend vs orders, show a trendline, and hide data labels and the legend.", "B1:C7 から散布図を作成し、タイトルを「広告費と注文数」、近似曲線を表示し、データラベルと凡例は非表示にします。", "請用 B1:C7 建立散點圖，標題「廣告投入與訂單數」，顯示趨勢線，不顯示資料標籤和圖例。"),
            {
              kind: "visual",
              mode: "chart",
              sheet: scatterCells,
              ranges: { source: "B1:C7", xValues: "B2:B7", yValues: "C2:C7" },
              options: { chartType: "scatter", trendline: true, dataLabels: false, showLegend: false },
              goal: {
                operation: "chart",
                chartType: "scatter",
                dataRange: "B1:C7",
                seriesBy: "columns",
                title: L("广告投入与订单数", "Ad spend vs orders", "広告費と注文数", "廣告投入與訂單數"),
                showLegend: false,
                dataLabels: false,
                trendline: true,
                secondaryAxis: false,
              },
            },
            L("散点图选两列数值，不要选月份列；横轴和纵轴都要是数字。", "Choose the two numeric columns, not the month column; both scatter axes must be numeric.", "散布図では月列ではなく2つの数値列を選び、両軸を数値にします。", "散點圖選兩欄數值，不要選月份欄；橫軸和縱軸都要是數字。"),
            L("点云向右上方倾斜，趋势线显示广告投入与订单数总体同向变化。", "The point cloud rises to the right, and the trendline shows a general positive association between ad spend and orders.", "点群は右上がりで、近似曲線から広告費と注文数が総じて同方向に動くことが分かります。", "點群向右上方傾斜，趨勢線顯示廣告投入與訂單數整體同向變化。")
          ),
        ]
      ),
      level(
        "visual-chart-review",
        "review",
        L("复习：组合图、迷你图与图表更新", "Review: combo charts, sparklines, and chart updates", "復習：複合グラフ・スパークライン・更新", "複習：組合圖、迷你圖與圖表更新"),
        [
          learn(
            "viz17-review-teach",
            L("一张图可以有两个尺度，但必须有解释", "One chart can have two scales, but it must explain them", "1つのグラフに2軸を使うなら説明を加える", "一張圖可以有兩個尺度，但必須有解釋"),
            L("净销售额和毛利率量级相差很大，组合图把销售额放主轴、毛利率放次轴，并常用折线表示比率。迷你图把一排趋势缩进单元格，适合仪表板。", "Net sales and gross margin differ greatly in scale, so a combo chart puts sales on the primary axis and margin on the secondary axis, often as a line. Sparklines compress a row of trends into a cell for dashboards.", "純売上と粗利益率は桁が大きく違うため、複合グラフでは売上を主軸、利益率を第2軸に置き、比率は折れ線で表すことが多いです。スパークラインは行の傾向をセル内に圧縮し、ダッシュボードに向きます。", "淨銷售額和毛利率量級相差很大，組合圖把銷售額放主軸、毛利率放次軸，並常用折線表示比率。迷你圖把一列趨勢縮進儲存格，適合儀表板。"),
            [
              L("次轴的刻度可以不同，但颜色和标签要清楚对应系列，否则读者会误读。", "Secondary axes may use different scales, but colors and labels must map clearly to series to avoid misreading.", "第2軸の目盛は違ってよいですが、色とラベルで系列を明確に対応させ、誤読を防ぎます。", "次軸的刻度可以不同，但顏色和標籤要清楚對應數列，否則讀者會誤讀。"),
              L("组合图至少包含一个次轴系列，否则只是普通组合显示。", "A combo chart needs at least one secondary-axis series; otherwise it is only a normal chart with mixed types.", "複合グラフには少なくとも1つの第2軸系列が必要です。なければ種類を混ぜただけの通常グラフです。", "組合圖至少包含一個次軸數列，否則只是普通混合顯示。"),
              L("迷你图放在单元格里，数据源变化后要重新确认引用范围。", "Sparklines live inside cells; recheck their source references when the data changes.", "スパークラインはセル内にあり、データ変更時は参照範囲を再確認します。", "迷你圖放在儲存格裡，資料來源變更後要重新確認參照範圍。"),
              L("新增月份后，图表不会必然自动扩展，要检查数据源是否包含新列。", "After adding a month, the chart does not always expand; check whether the source includes the new column.", "月を追加してもグラフが必ず自動拡張するわけではないため、データ源が新しい列を含むか確認します。", "新增月份後，圖表不會必然自動擴展，要檢查資料來源是否包含新欄。"),
            ],
            L("组合图优先用不同颜色和轴标题，不要只依赖左右位置解释。", "Use distinct colors and axis titles in combo charts; do not rely on left/right position alone.", "複合グラフでは色と軸タイトルを変え、左右の位置だけで説明しないようにします。", "組合圖優先使用不同顏色和軸標題，不要只依賴左右位置解釋。"),
            L("迷你图不是完整图表，不能代替坐标轴和明细；适合放在汇总行里提示趋势。", "Sparklines are not full charts and do not replace axes or detail; they hint at trends in summary rows.", "スパークラインは完全なグラフではなく、軸や明細の代わりにはなりません。集計行の傾向表示に使います。", "迷你圖不是完整圖表，不能代替座標軸和明細；適合放在彙總列提示趨勢。")
          ),
          lab(
            "viz17-combo-lab",
            L("迁移实验：销售额与毛利率同图呈现", "Transfer lab: show sales and margin together", "転用実験：売上と粗利益率を同じ図に表示", "遷移實驗：銷售額與毛利率同圖呈現"),
            L("请用 A1:C7 建立组合图，标题“净销售额与毛利率”，毛利率使用次坐标轴，显示图例，不显示数据标签。", "Create a combo chart from A1:C7 with title Net sales and gross margin, put gross margin on the secondary axis, show the legend, and hide data labels.", "A1:C7 から複合グラフを作成し、タイトルを「純売上と粗利益率」、粗利益率を第2軸に置き、凡例を表示し、データラベルは非表示にします。", "請用 A1:C7 建立組合圖，標題「淨銷售額與毛利率」，毛利率使用次座標軸，顯示圖例，不顯示資料標籤。"),
            {
              kind: "visual",
              mode: "chart",
              sheet: comboCells,
              ranges: { source: "A1:C7", primary: "B1:B1", secondary: "C1:C1" },
              options: { chartType: "combo", secondaryAxis: true, showLegend: true },
              goal: {
                operation: "chart",
                chartType: "combo",
                dataRange: "A1:C7",
                seriesBy: "columns",
                title: L("净销售额与毛利率", "Net sales and gross margin", "純売上と粗利益率", "淨銷售額與毛利率"),
                showLegend: true,
                dataLabels: false,
                trendline: false,
                secondaryAxis: true,
              },
            },
            L("插入图表后，在“更改图表类型”→“组合图”中把毛利率设为折线并勾选次坐标轴。", "Insert a chart, open Change Chart Type, Combo, set gross margin to Line and tick Secondary Axis.", "グラフを挿入し、「グラフの種類の変更」→「複合グラフ」で粗利益率を折れ線と第2軸にします。", "插入圖表後，在「變更圖表類型」→「組合圖」把毛利率設為折線並勾選次座標軸。"),
            L("销售额与毛利率各有合适尺度，图例清楚说明哪条线对应毛利率。", "Sales and margin each use a suitable scale, and the legend clearly identifies the margin line.", "売上と粗利益率がそれぞれ適切な尺度で表示され、凡例で利益率の線が分かります。", "銷售額與毛利率各有合適尺度，圖例清楚說明哪條線對應毛利率。")
          ),
          lab(
            "viz17-sparkline-lab",
            L("迁移实验：给设计团队加周趋势迷你图", "Transfer lab: add a weekly trend sparkline for Design", "転用実験：デザインの週次スパークラインを追加", "遷移實驗：給設計團隊加每週趨勢迷你圖"),
            L("请为设计团队 B2:F2 建立折线迷你图，放在 G2，显示最高点和最低点，用于周报的单元格内趋势。", "Create a line sparkline from B2:F2 for the Design team, place it in G2, and mark the high and low points for the weekly report.", "デザインの B2:F2 から折れ線スパークラインを作成し、G2 に置き、最高値と最低値を表示して週報に使います。", "請為設計團隊 B2:F2 建立折線迷你圖，放在 G2，顯示最高點和最低點，用於週報的儲存格內趨勢。"),
            {
              kind: "visual",
              mode: "sparkline",
              sheet: sparkCells,
              ranges: { data: "B2:F2", location: "G2" },
              options: { type: "line", showHigh: true, showLow: true },
              goal: { operation: "sparkline", dataRange: "B2:F2", location: "G2", type: "line", showHigh: true, showLow: true },
            },
            L("选中 G2，打开“插入”→“迷你图”→“折线”，数据范围选 B2:F2，再勾选高点与低点。", "Select G2, use Insert, Sparklines, Line, set the data range to B2:F2, and enable High Point and Low Point.", "G2 を選び、「挿入」→「スパークライン」→「折れ線」でデータ範囲を B2:F2 にし、高値と低値をオンにします。", "選取 G2，開啟「插入」→「迷你圖」→「折線」，資料範圍選 B2:F2，再勾選高點與低點。"),
            L("设计团队的五行周数据已压缩到 G2，最高与最低点清晰可见。", "The Design team's five weekly values are compressed into G2 with clear high and low points.", "デザインの5週分の値がG2に圧縮され、最高・最低点がはっきり見えます。", "設計團隊的五週資料已壓縮到 G2，最高與最低點清晰可見。")
          ),
          lab(
            "viz17-chart-review-lab",
            L("复习实验：按行组织系列并加关键标签", "Review lab: build series by rows with key labels", "復習実験：系列を行単位にして主要ラベルを追加", "複習實驗：依列組織數列並加關鍵標籤"),
            L("管理层希望把门店和线上两条收入放成按行比较的柱形图，标题“渠道收入检查”，显示数据标签，不显示图例。", "Management wants a column chart that treats the two revenue streams as rows, titled Channel revenue check, with data labels and no legend.", "経営層は店舗とオンラインの2収入を系列行として比較したいと考えています。タイトルを「チャネル収入確認」、データラベルあり、凡例なしにします。", "管理層希望把門市和線上兩條收入放成依列比較的柱形圖，標題「通路收入檢查」，顯示資料標籤，不顯示圖例。"),
            {
              kind: "visual",
              mode: "chart",
              sheet: chartCells,
              ranges: { source: "A1:C7", categories: "A2:A7", series: "B1:C1" },
              options: { chartType: "column", seriesBy: "rows", dataLabels: true, showLegend: false },
              goal: {
                operation: "chart",
                chartType: "column",
                dataRange: "A1:C7",
                seriesBy: "rows",
                title: L("渠道收入检查", "Channel revenue check", "チャネル収入確認", "通路收入檢查"),
                showLegend: false,
                dataLabels: true,
                trendline: false,
                secondaryAxis: false,
              },
            },
            L("插入柱形图后，在“选择数据”中切换系列方向为“行”，再删除图例但保留数据标签。", "After inserting the column chart, switch Series to Rows under Select Data, remove the legend, and keep data labels.", "縦棒グラフを挿入し、「データの選択」で系列を行単位に切り替えます。凡例を削除し、データラベルは残します。", "插入柱形圖後，在「選取資料」切換數列方向為「列」，再刪除圖例但保留資料標籤。"),
            L("图表按行组织两个收入系列，标签提供了管理层需要的关键数值。", "The chart organizes both revenue series by rows, and labels provide the key values management needs.", "グラフが2つの収入系列を行単位で整理し、ラベルが経営層に必要な数値を示しています。", "圖表依列組織兩個收入數列，標籤提供了管理層需要的關鍵數值。")
          ),
        ]
      ),
    ],
  });

  D.registerChapter({
    id: "ch18-pivot-tables",
    icon: "18",
    title: L("第 18 章 · 数据透视表与透视图", "Chapter 18 · PivotTables and PivotCharts", "第18章 · ピボットテーブルとピボットグラフ", "第 18 章 · 樞紐分析表與樞紐圖"),
    subtitle: L("把流水账快速折叠成部门、月份和状态的可交互汇总。", "Fold a transaction ledger into an interactive summary by department, month, and status.", "明細を部署・月・状態ごとの対話的な集計に折りたたみます。", "把流水帳快速摺疊成部門、月份和狀態的可互動彙總。"),
    levels: [
      level(
        "visual-pivot-layout",
        "lesson",
        L("字段放入正确区域，透视表才说人话", "Put fields in the right areas", "フィールドを正しい領域へ置く", "欄位放入正確區域，樞紐表才說得清"),
        [
          learn(
            "viz18-pivot-teach",
            L("透视表是四块拼图：行、列、值、筛选", "A PivotTable is four areas: rows, columns, values, and filters", "ピボットテーブルは行・列・値・フィルターの4領域", "樞紐分析表是四塊拼圖：列、欄、值、篩選"),
            L("行区域列出分组，列区域提供横向比较，值区域放计算，筛选区域限制数据范围。同一字段可以出现在不同区域，但含义会变。", "Rows list groups, Columns create a horizontal comparison, Values hold calculations, and Filters limit the data. The same field can appear in different areas, but its meaning changes.", "行はグループ、列は横比較、値は計算、フィルターは対象を限定します。同じフィールドでも領域が変われば意味が変わります。", "列區域列出分組，欄區域提供橫向比較，值區域放計算，篩選區域限制資料範圍。同一欄位可以出現在不同區域，但意義會改變。"),
            [
              L("行和列都放分组字段，值放需要汇总的数值字段；不要把金额拖进行区域当作标签。", "Put categorical fields in Rows or Columns and numeric measures in Values; do not drop amounts into Rows as labels.", "カテゴリは行または列、数値は値に置きます。金額を行領域へラベルとして入れません。", "列和欄都放分組欄位，值放需要彙總的數值欄位；不要把金額拖進列區域當標籤。"),
              L("值字段默认常为求和，也可能因源数据为空而显示计数；必须核对聚合方式。", "Value fields often default to Sum but may appear as Count when source data is blank; confirm the aggregation.", "値は通常合計ですが、元データが空だと件数になることがあります。集計方法を確認します。", "值欄位預設常為求和，也可能因來源資料為空而顯示計數；必須核對彙總方式。"),
              L("文本字段放进值区域时通常只能计数，不会求和。", "A text field in Values usually supports Count, not Sum.", "文字フィールドを値に置くと通常は件数のみで、合計はできません。", "文字欄位放進值區域時通常只能計數，不會求和。"),
              L("布局改变不会修改源数据；刷新只更新结果，不自动把新列加入数据源。", "Layout changes do not alter source data; Refresh updates results but does not automatically add new columns to the source.", "レイアウト変更は元データを変えません。更新は結果だけを更新し、新しい列を自動でデータ源に加えません。", "版面改變不會修改來源資料；重新整理只更新結果，不會自動把新欄加入資料來源。"),
            ],
            L("先确定“按什么分组、比较什么、算哪个数、限制什么”，再往四个区域拖字段。", "Decide the grouping, comparison, measure, and restriction before dragging fields into the four areas.", "何で分けるか、何を比較するか、何を計算するか、何を制限するかを決めてから4領域へ配置します。", "先確定「依什麼分組、比較什麼、算哪個數、限制什麼」，再往四個區域拖欄位。"),
            L("透视表目标位置要放在数据表外，至少留出多列空间，避免刷新后覆盖。", "Place the PivotTable outside the source table with room to grow, or refresh may overwrite nearby content.", "ピボットテーブルは元表の外に余白を取って配置し、更新時の上書きを避けます。", "樞紐分析表目標位置要放在資料表外，至少留出多欄空間，避免重新整理後覆蓋。")
          ),
          lab(
            "viz18-pivot-layout-lab",
            L("引导实验：按团队和状态汇总收入", "Guided lab: summarize revenue by team and status", "ガイド付き実験：チームと状態別に収入を集計", "引導實驗：依團隊和狀態彙總收入"),
            L("请以 A1:F13 为源，在 H2 建立透视表：行放团队，列放状态，值用收入求和，不使用筛选。", "Use A1:F13 as the source and create a PivotTable at H2 with Team in rows, Status in columns, and Sum of Revenue in values, with no filter.", "A1:F13 を元データとして H2 にピボットテーブルを作成し、行にチーム、列に状態、値に収入の合計を置きます。フィルターは使いません。", "請以 A1:F13 為來源，在 H2 建立樞紐分析表：列放團隊，欄放狀態，值用收入求和，不使用篩選。"),
            {
              kind: "visual",
              mode: "pivot",
              sheet: pivotCells,
              ranges: { source: "A1:F13", destination: "H2" },
              options: { rows: ["B"], columns: ["F"], values: [{ field: "D", aggregate: "SUM" }] },
              goal: {
                operation: "pivot",
                sourceRange: "A1:F13",
                destination: "H2",
                rows: ["B"],
                columns: ["F"],
                values: [{ field: "D", aggregate: "SUM" }],
                filters: [],
                showAs: "normal",
                groupDate: "none",
                slicer: false,
              },
            },
            L("选中源表任一单元格，插入透视表并放到 H2；把团队拖到行、状态拖到列、收入拖到值，确认值是求和。", "Select a source cell, insert a PivotTable at H2, drag Team to Rows, Status to Columns, and Revenue to Values, confirming Sum.", "元表のセルを選んで H2 にピボットテーブルを作成し、チームを行、状態を列、収入を値へドラッグし、合計を確認します。", "選取來源表任一儲存格，插入樞紐分析表並放到 H2；把團隊拖到列、狀態拖到欄、收入拖到值，確認值是求和。"),
            L("团队与状态的二维收入和已经生成，源表没有被改变。", "The two-dimensional revenue summary by team and status is built and the source table is unchanged.", "チームと状態の2次元集計が作成され、元表は変更されていません。", "團隊與狀態的二維收入彙總已產生，來源表沒有被改變。")
          ),
          lab(
            "viz18-pivot-average-lab",
            L("引导实验：比较团队平均收入", "Guided lab: compare average revenue by team", "ガイド付き実験：チーム別の平均収入を比較", "引導實驗：比較團隊平均收入"),
            L("请以 A1:F13 为源，在 H2 建立透视表：行放团队，值用收入平均值，不放列字段或筛选。", "Use A1:F13 and create a PivotTable at H2 with Team in rows and Average of Revenue in values, with no column fields or filters.", "A1:F13 を元に H2 にピボットテーブルを作成し、行にチーム、値に収入の平均を置きます。列フィールドとフィルターは使いません。", "請以 A1:F13 為來源，在 H2 建立樞紐分析表：列放團隊，值用收入平均值，不放欄欄位或篩選。"),
            {
              kind: "visual",
              mode: "pivot",
              sheet: pivotCells,
              ranges: { source: "A1:F13", destination: "H2" },
              options: { rows: ["B"], values: [{ field: "D", aggregate: "AVERAGE" }] },
              goal: {
                operation: "pivot",
                sourceRange: "A1:F13",
                destination: "H2",
                rows: ["B"],
                columns: [],
                values: [{ field: "D", aggregate: "AVERAGE" }],
                filters: [],
                showAs: "normal",
                groupDate: "none",
                slicer: false,
              },
            },
            L("把收入拖到值区域后，点击值字段设置，将计算类型从“求和”改为“平均值”。", "After dropping Revenue into Values, open Value Field Settings and change Sum to Average.", "収入を値へ置いた後、値フィールドの設定で合計を平均に変更します。", "把收入拖到值區域後，點選值欄位設定，將計算類型從「求和」改為「平均值」。"),
            L("透视表现在显示每个团队的平均收入，聚合方式与问题一致。", "The PivotTable now shows average revenue per team, matching the requested aggregation.", "ピボットテーブルがチーム別平均収入を表示し、集計方法も問いと一致しています。", "樞紐分析表現在顯示每個團隊的平均收入，彙總方式與問題一致。")
          ),
          lab(
            "viz18-pivot-filter-lab",
            L("引导实验：只用已结案记录汇总", "Guided lab: summarize closed records only", "ガイド付き実験：完了記録だけを集計", "引導實驗：只用已結案紀錄彙總"),
            L("请以 A1:F13 为源，在 H2 建立透视表：行放团队，值用收入求和，筛选状态为“已结案”。", "Use A1:F13 and create a PivotTable at H2 with Team in rows, Sum of Revenue in values, and a Status filter set to Closed.", "A1:F13 を元に H2 にピボットテーブルを作成し、行にチーム、値に収入の合計、状態フィルターを「完了」にします。", "請以 A1:F13 為來源，在 H2 建立樞紐分析表：列放團隊，值用收入求和，篩選狀態為「已結案」。"),
            {
              kind: "visual",
              mode: "pivot",
              sheet: pivotCells,
              ranges: { source: "A1:F13", destination: "H2", statusField: "F1" },
              options: { filters: [{ field: "F", value: L("已结案", "Closed", "完了", "已結案") }] },
              goal: {
                operation: "pivot",
                sourceRange: "A1:F13",
                destination: "H2",
                rows: ["B"],
                columns: [],
                values: [{ field: "D", aggregate: "SUM" }],
                filters: [{ field: "F", value: L("已结案", "Closed", "完了", "已結案") }],
                showAs: "normal",
                groupDate: "none",
                slicer: false,
              },
            },
            L("把状态拖到筛选区域，再从筛选下拉中只选“已结案”；不要用普通单元格筛选替代透视表筛选。", "Drag Status to Filters and select only Closed from the filter drop-down; do not use an ordinary cell filter.", "状態をフィルター領域へ置き、ドロップダウンで「完了」だけを選びます。通常のセルフィルターは使いません。", "把狀態拖到篩選區域，再從篩選下拉只選「已結案」；不要用一般儲存格篩選取代樞紐表篩選。"),
            L("汇总只保留已结案记录，未结案收入没有混入。", "The summary contains only closed records and excludes open revenue.", "集計には完了記録だけが残り、未完了の収入は混ざっていません。", "彙總只保留已結案紀錄，未結案收入沒有混入。")
          ),
        ]
      ),
      level(
        "visual-pivot-analysis",
        "lesson",
        L("百分比、日期分组与切片器", "Percentages, date groups, and slicers", "百分比・日付グループ・スライサー", "百分比、日期分組與交叉分析篩選器"),
        [
          learn(
            "viz18-analysis-teach",
            L("让透视表从“多少”走到“占比和期间”", "Move the PivotTable from amounts to shares and periods", "金額から比率・期間の分析へ進む", "讓樞紐表從「多少」走到「占比和期間」"),
            L("值显示方式可以把金额变成占总计、行或列的百分比。日期字段可以按月、季度、年分组。切片器提供按钮式筛选，适合仪表板和会议现场。", "Show Values As can turn amounts into percent of total, row, or column. Date fields can group by month, quarter, or year. Slicers provide button filters for dashboards and live meetings.", "「値の表示形式」で合計・行・列に対する比率を表示できます。日付は月・四半期・年でグループ化でき、スライサーはボタン式フィルターとして会議やダッシュボードに向きます。", "值的顯示方式可以把金額變成佔總計、列或欄的百分比。日期欄位可以依月份、季度或年份分組。交叉分析篩選器提供按鈕式篩選，適合儀表板和會議現場。"),
            [
              L("显示为百分比不改变底层金额；切换回普通值即可恢复。", "Showing percentages does not change underlying amounts; switch back to normal values to restore.", "比率表示は元の金額を変えません。通常の値に戻せば復元できます。", "顯示為百分比不改變底層金額；切換回一般值即可恢復。"),
              L("日期分组需要真实日期值；文本日期只能在源数据中先转换。", "Date grouping requires real date values; text dates must be converted in the source first.", "日付グループには実際の日付値が必要で、文字列の日付は元データで先に変換します。", "日期分組需要真實日期值；文字日期只能在來源資料中先轉換。"),
              L("切片器与透视表连接后才能筛选；多个透视表可共用一个切片器。", "A slicer must be connected to PivotTables to filter them; several PivotTables can share one slicer.", "スライサーはピボットテーブルへ接続して初めて絞り込めます。複数のピボットテーブルで共有もできます。", "交叉分析篩選器要與樞紐分析表連接後才能篩選；多個樞紐分析表可共用一個交叉分析篩選器。"),
              L("多个筛选条件之间是“且”的关系；清除全部筛选后再验证结果。", "Multiple filter conditions combine with AND; clear all filters before verifying a result.", "複数のフィルター条件は AND で組み合わさります。結果確認前に全フィルターを解除します。", "多個篩選條件之間是「且」的關係；清除全部篩選後再驗證結果。"),
            ],
            L("先确认分母是什么，再选百分比类型：总计、行、列或父级。", "Confirm the denominator before choosing a percentage type: total, row, column, or parent.", "分母が何かを確認してから、合計・行・列・親などの比率種類を選びます。", "先確認分母是什麼，再選百分比類型：總計、列、欄或父層。"),
            L("切片器放在透视表外侧，不要覆盖数据；交付时命名清楚“按团队查看”。", "Place slicers outside the PivotTable and name them clearly, such as View by team.", "スライサーはピボットテーブルの外に置き、「チーム別表示」など明確に名前を付けます。", "交叉分析篩選器放在樞紐分析表外側，不要覆蓋資料；交付時命名清楚「依團隊查看」。")
          ),
          lab(
            "viz18-pivot-percent-lab",
            L("引导实验：显示各团队收入占总计百分比", "Guided lab: show each team's share of total revenue", "ガイド付き実験：チーム別収入の合計比を表示", "引導實驗：顯示各團隊收入佔總計百分比"),
            L("请以 A1:F13 为源，在 H2 建立透视表：行放团队，值用收入求和，并显示为“占总计百分比”。", "Use A1:F13 and create a PivotTable at H2 with Team in rows and Sum of Revenue shown as Percent of Grand Total.", "A1:F13 を元に H2 にピボットテーブルを作成し、行にチーム、値に収入の合計を置き、「総計に対する比率」で表示します。", "請以 A1:F13 為來源，在 H2 建立樞紐分析表：列放團隊，值用收入求和，並顯示為「佔總計百分比」。"),
            {
              kind: "visual",
              mode: "pivot",
              sheet: pivotCells,
              ranges: { source: "A1:F13", destination: "H2" },
              options: { showAs: ["normal", "percentOfTotal", "percentOfRow"] },
              goal: {
                operation: "pivot",
                sourceRange: "A1:F13",
                destination: "H2",
                rows: ["B"],
                columns: [],
                values: [{ field: "D", aggregate: "SUM" }],
                filters: [],
                showAs: "percentOfTotal",
                groupDate: "none",
                slicer: false,
              },
            },
            L("在值字段设置中打开“值显示方式”，选择“占总计百分比”；不要手工把金额除以总计再粘贴。", "Open Value Field Settings, Show Values As, and choose Percent of Grand Total; do not manually divide and paste values.", "値フィールドの設定で「値の表示形式」を開き、「総計に対する比率」を選びます。手計算の比率を貼り付けません。", "在值欄位設定開啟「值的顯示方式」，選擇「佔總計百分比」；不要手動把金額除以總計再貼上。"),
            L("各团队收入占比已由透视表计算，合计为 100%。", "The PivotTable calculates each team's share and the total is 100%.", "チーム別の比率がピボットテーブルで計算され、合計は100%です。", "各團隊收入佔比已由樞紐分析表計算，合計為 100%。")
          ),
          lab(
            "viz18-pivot-group-lab",
            L("迁移实验：按月份查看收入", "Transfer lab: view revenue by month", "転用実験：月別に収入を見る", "遷移實驗：依月份查看收入"),
            L("请以 A1:F13 为源，在 H2 建立透视表：行放日期并分组到月，值用收入求和，不建列字段和筛选。", "Use A1:F13 and create a PivotTable at H2 with Date in rows grouped by Month and Sum of Revenue in values, with no columns or filters.", "A1:F13 を元に H2 にピボットテーブルを作成し、行に日付を置いて月でグループ化し、値に収入の合計を置きます。列とフィルターは使いません。", "請以 A1:F13 為來源，在 H2 建立樞紐分析表：列放日期並分組到月，值用收入求和，不建欄欄位和篩選。"),
            {
              kind: "visual",
              mode: "pivot",
              sheet: pivotCells,
              ranges: { source: "A1:F13", destination: "H2", dateField: "A1" },
              options: { groupDate: ["none", "months", "quarters"] },
              goal: {
                operation: "pivot",
                sourceRange: "A1:F13",
                destination: "H2",
                rows: ["A"],
                columns: [],
                values: [{ field: "D", aggregate: "SUM" }],
                filters: [],
                showAs: "normal",
                groupDate: "months",
                slicer: false,
              },
            },
            L("把日期拖到行区域，右键日期字段选择“组合”，按月分组；源日期必须是日期值。", "Drag Date to Rows, right-click the date field, choose Group, and group by Month; source values must be real dates.", "日付を行へドラッグし、右クリックの「グループ化」で月を選びます。元データが日付値である必要があります。", "把日期拖到列區域，右鍵日期欄位選擇「群組」，依月分組；來源日期必須是日期值。"),
            L("收入已按月合并，行标签显示月份而不是每条日期。", "Revenue is now rolled up by month and row labels show months rather than individual dates.", "収入が月単位にまとまり、行ラベルは個別日付ではなく月を表示しています。", "收入已依月合併，列標籤顯示月份而不是每一筆日期。")
          ),
          lab(
            "viz18-pivot-slicer-lab",
            L("迁移实验：加一个团队切片器", "Transfer lab: add a team slicer", "転用実験：チームのスライサーを追加", "遷移實驗：加入團隊交叉分析篩選器"),
            L("请以 A1:F13 为源，在 H2 建立按团队汇总收入的透视表，并添加团队切片器，便于会议现场切换。", "Use A1:F13 and create a revenue-by-team PivotTable at H2 with a Team slicer for switching during the meeting.", "A1:F13 を元に H2 にチーム別収入のピボットテーブルを作成し、会議中に切り替えられるチームのスライサーを追加します。", "請以 A1:F13 為來源，在 H2 建立依團隊彙總收入的樞紐分析表，並加入團隊交叉分析篩選器，便於會議現場切換。"),
            {
              kind: "visual",
              mode: "pivot",
              sheet: pivotCells,
              ranges: { source: "A1:F13", destination: "H2" },
              options: { slicerField: "B", slicer: true },
              goal: {
                operation: "pivot",
                sourceRange: "A1:F13",
                destination: "H2",
                rows: ["B"],
                columns: [],
                values: [{ field: "D", aggregate: "SUM" }],
                filters: [],
                showAs: "normal",
                groupDate: "none",
                slicer: true,
              },
            },
            L("先创建透视表，再选“插入”→“切片器”，勾选团队；把切片器拖到透视表旁边。", "Create the PivotTable, use Insert, Slicer, tick Team, and place the slicer beside the table.", "ピボットテーブルを作成し、「挿入」→「スライサー」でチームを選び、表の横に置きます。", "先建立樞紐分析表，再選「插入」→「交叉分析篩選器」，勾選團隊；把交叉分析篩選器拖到樞紐表旁邊。"),
            L("团队切片器已连接透视表，点击按钮即可现场切换汇总。", "The Team slicer is connected and can switch the summary live during the meeting.", "チームのスライサーが接続され、会議中にボタンで集計を切り替えられます。", "團隊交叉分析篩選器已連接樞紐表，點選按鈕即可現場切換彙總。")
          ),
        ]
      ),
      level(
        "visual-pivot-review",
        "review",
        L("复习：计算字段、透视图、刷新与取数", "Review: calculated fields, PivotCharts, refresh, and retrieval", "復習：計算フィールド・ピボットグラフ・更新・取得", "複習：計算欄位、樞紐圖、重新整理與取數"),
        [
          lab(
            "viz18-pivot-calculated-lab",
            L("复习实验：增加毛利计算字段", "Review lab: add a gross-margin calculated field", "復習実験：粗利益の計算フィールドを追加", "複習實驗：新增毛利計算欄位"),
            L("请以 A1:F13 为源，在 H2 建立按团队汇总的透视表，并添加计算字段 GrossMargin，公式为收入减成本，显示求和。", "Use A1:F13 and create a PivotTable by team at H2, then add a calculated field called GrossMargin with formula Revenue minus Cost, displayed as Sum.", "A1:F13 を元に H2 にチーム別ピボットテーブルを作成し、収入から原価を引く GrossMargin 計算フィールドを追加して合計表示します。", "請以 A1:F13 為來源，在 H2 建立依團隊彙總的樞紐分析表，並新增計算欄位 GrossMargin，公式為收入減成本，顯示求和。"),
            {
              kind: "visual",
              mode: "pivot",
              sheet: pivotCells,
              ranges: { source: "A1:F13", destination: "H2" },
              options: { calculatedFields: [{ name: "GrossMargin", formula: "=Revenue-Cost" }] },
              goal: {
                operation: "pivot",
                sourceRange: "A1:F13",
                destination: "H2",
                rows: ["B"],
                columns: [],
                values: [{ field: "GrossMargin", aggregate: "SUM" }],
                filters: [],
                showAs: "normal",
                groupDate: "none",
                slicer: false,
                calculatedField: { name: "GrossMargin", formula: "=D-E" },
              },
            },
            L("在透视表分析中选择“字段、项目和集”→“计算字段”，名称 GrossMargin，公式使用“收入”减“成本”字段。", "Use PivotTable Analyze, Fields, Items & Sets, Calculated Field, name it GrossMargin, and subtract the Cost field from Revenue.", "ピボットテーブル分析→「計算フィールド、アイテム、セット」で名前を GrossMargin とし、収入フィールドから原価を引きます。", "在樞紐分析表分析選擇「欄位、項目及集合」→「計算欄位」，名稱 GrossMargin，公式使用「收入」減「成本」欄位。"),
            L("计算字段已加入值区域，每个团队的毛利都按源字段计算，不需要在源表加列。", "The calculated field is in Values, and each team's gross margin derives from source fields without adding a source column.", "計算フィールドが値に入り、元表に列を追加せず各チームの粗利益が計算されています。", "計算欄位已加入值區域，每個團隊的毛利都依來源欄位計算，不需要在來源表加欄。")
          ),
          lab(
            "viz18-pivot-chart-lab",
            L("复习实验：把团队汇总做成透视图", "Review lab: turn the team summary into a PivotChart", "復習実験：チーム集計をピボットグラフにする", "複習實驗：把團隊彙總做成樞紐圖"),
            L("请以 A1:F13 为源，在 H2 建立团队收入透视表，并生成柱形透视图，标题为“团队收入”。", "Use A1:F13 to create a team revenue PivotTable at H2 and a column PivotChart titled Team revenue.", "A1:F13 を元に H2 にチーム別収入のピボットテーブルを作成し、タイトル「チーム収入」の縦棒ピボットグラフを生成します。", "請以 A1:F13 為來源，在 H2 建立團隊收入樞紐分析表，並產生柱形樞紐圖，標題為「團隊收入」。"),
            {
              kind: "visual",
              mode: "pivotChart",
              sheet: pivotCells,
              ranges: { source: "A1:F13", destination: "H2" },
              options: { chartType: "column" },
              goal: {
                operation: "pivotChart",
                sourceRange: "A1:F13",
                destination: "H2",
                rows: ["B"],
                columns: [],
                values: [{ field: "D", aggregate: "SUM" }],
                filters: [],
                showAs: "normal",
                groupDate: "none",
                slicer: false,
                chartType: "column",
                title: L("团队收入", "Team revenue", "チーム収入", "團隊收入"),
              },
            },
            L("选中透视表，执行“插入”→“透视图”，选择柱形图并修改标题；透视图应与透视表保持连接。", "Select the PivotTable, use Insert, PivotChart, choose Column, and edit the title; the chart should stay linked.", "ピボットテーブルを選び、「挿入」→「ピボットグラフ」で縦棒を選んでタイトルを変更します。", "選取樞紐分析表，執行「插入」→「樞紐圖」，選擇柱形圖並修改標題；樞紐圖應與樞紐表保持連接。"),
            L("团队收入透视图与透视表联动，标题和图形类型符合汇报要求。", "The team revenue PivotChart is linked to the table with the requested title and chart type.", "チーム収入のピボットグラフが表と連動し、タイトルと種類も要件どおりです。", "團隊收入樞紐圖與樞紐表連動，標題和圖形類型符合報告要求。")
          ),
          lab(
            "viz18-pivot-refresh-lab",
            L("复习实验：源数据更新后刷新透视表", "Review lab: refresh after the source changes", "復習実験：元データ変更後にピボットを更新", "複習實驗：來源資料更新後重新整理樞紐表"),
            L("六月的客服收入已从 23200 修正为 25200，但 H2 的汇总仍是旧值。请保留团队行与收入求和结构，并刷新透视表。", "The June Support revenue changed from 23200 to 25200, but the summary at H2 still shows the old value. Keep Team in rows and Sum of Revenue, then refresh the PivotTable.", "6月のサポート収入が23200から25200に修正されましたが、H2 の集計は旧値のままです。行のチームと収入合計を維持して更新してください。", "六月的客服收入已從 23200 修正為 25200，但 H2 的彙總仍是舊值。請保留團隊列與收入求和結構，並重新整理樞紐分析表。"),
            {
              kind: "visual",
              mode: "pivot",
              sheet: Object.assign({}, pivotCells, {
                D12: 25200,
                H6: L("合计", "Total", "合計", "合計"),
                I6: 274800,
                J6: 186900,
              }),
              ranges: { source: "A1:F13", destination: "H2" },
              options: { refresh: true, sourceChanged: "D12" },
              goal: {
                operation: "pivot",
                sourceRange: "A1:F13",
                destination: "H2",
                rows: ["B"],
                columns: [],
                values: [{ field: "D", aggregate: "SUM" }],
                filters: [],
                showAs: "normal",
                groupDate: "none",
                slicer: false,
                refresh: true,
              },
            },
            L("在透视表分析中点击“刷新”；若新记录在源范围之外，还要先修改数据源范围。", "Use PivotTable Analyze, Refresh; if new records fall outside the source range, first change the data source range.", "ピボットテーブル分析の「更新」を押します。新しい行が元範囲外なら、先にデータソース範囲を変更します。", "在樞紐分析表分析按「重新整理」；若新紀錄在來源範圍之外，還要先修改資料來源範圍。"),
            L("透视表已刷新，客服六月收入与合计同步到修正后的源数据。", "The PivotTable refreshed and the June Support revenue and total now match the corrected source.", "ピボットテーブルが更新され、6月サポート収入と合計が修正後の元データと一致しました。", "樞紐分析表已重新整理，客服六月收入與合計同步到修正後的來源資料。")
          ),
          choice(
            "viz18-getpivotdata-choice",
            L("复习练习：如何用 GETPIVOTDATA 读取收入合计？", "Review practice: which GETPIVOTDATA formula retrieves total revenue?", "復習練習：GETPIVOTDATA で収入合計を取得する式はどれですか。", "複習練習：如何用 GETPIVOTDATA 讀取收入合計？"),
            L("透视表样例左上角在 L2，收入标题在 D1。请选择正确的参数顺序。", "The PivotTable sample's top-left is L2 and the revenue heading is D1. Choose the correct argument order.", "ピボットテーブル見本の左上は L2、収入見出しは D1 です。正しい引数順を選んでください。", "樞紐分析表範例左上角在 L2，收入標題在 D1。請選擇正確的參數順序。"),
            [
              option("get-correct", "=GETPIVOTDATA($D$1,$L$2)", "=GETPIVOTDATA($D$1,$L$2)", "=GETPIVOTDATA($D$1,$L$2)", "=GETPIVOTDATA($D$1,$L$2)", true, "第一参数是字段名，第二参数是透视表左上角。", "The first argument is the field, the second is the PivotTable origin.", "第1引数がフィールド、第2引数がピボットの左上です。", "第一個參數是欄位，第二個參數是樞紐表左上角。"),
              option("get-reversed", "=GETPIVOTDATA($L$2,$D$1)", "=GETPIVOTDATA($L$2,$D$1)", "=GETPIVOTDATA($L$2,$D$1)", "=GETPIVOTDATA($L$2,$D$1)", false, "参数顺序反了，会把透视表起点当成字段名。", "The arguments are reversed, treating the PivotTable origin as a field.", "引数が逆で、ピボットの左上をフィールドとして扱っています。", "參數順序相反，會把樞紐表起點當成欄位。"),
              option("sum-range", "=SUM($L$2:$N$6)", "=SUM($L$2:$N$6)", "=SUM($L$2:$N$6)", "=SUM($L$2:$N$6)", false, "SUM 会把收入、成本或其他字段一起加总，不是按字段取数。", "SUM would add multiple fields, not retrieve one PivotTable field.", "SUM は複数フィールドを合計してしまい、1つのフィールドを取得できません。", "SUM 會把收入、成本或其他欄位一起加總，不是依欄位取數。"),
            ],
            L("公式骨架：GETPIVOTDATA(字段, 透视表左上角, 其他字段对...)。", "Shape: GETPIVOTDATA(field, pivot_origin, other field pairs...).", "形：GETPIVOTDATA(フィールド, ピボット左上, 追加のフィールド組...)。", "公式骨架：GETPIVOTDATA(欄位, 樞紐表左上角, 其他欄位對...)。")
          ),
        ]
      ),
    ],
  });
})();
