(function () {
  "use strict";

  const D = window.CourseData;
  const K = window.CurriculumKit;
  const L = K.L;
  const fill = K.fill;
  const task = K.task;
  const textData = K.sheets.textData;

  function learn(id, title, lead, points, tip, example, extra) {
    return D.learnStep(id, title, lead, points, tip, example, extra);
  }

  function practice(spec) {
    return K.sheetStep(spec);
  }

  function level(id, kind, title, steps, extra) {
    return Object.assign({ id, kind, title, steps }, extra || {});
  }

  const common = {
    extract: L("从编号里提取文字", "Extract text from a code", "コードから文字を取り出す"),
    clean: L("清理不规范的文本", "Clean inconsistent text", "表記ゆれを整える"),
    audit: L("文本与旧知识综合复核", "Mixed text and prior-skills review", "文字処理と既習内容の総合確認"),
  };

  const textClean = K.addSheet("textCleanSheet", K.makeSheet([
    L("原始姓名", "Raw name", "入力氏名"),
    L("原始部门", "Raw department", "入力部署"),
    L("清洗后姓名", "Clean name", "整形後氏名"),
    L("连字符位置", "Hyphen position", "ハイフン位置"),
    L("查找结果", "Search result", "検索結果"),
    L("工号", "Staff code", "社員コード"),
  ], [
    [L("  林晓  ", "  Olivia Bennett  ", "  佐藤美咲  ", "  林雅婷  "), L("  销售  ", "  Sales  ", "  営業  ", "  業務  "), undefined, undefined, undefined, "eu-001"],
    [L(" 陈凯 ", " Ethan Cole ", " 鈴木健太 ", " 陳冠宇 "), L("  技术 ", "  Tech ", "  技術 ", "  技術 "), undefined, undefined, undefined, "na-014"],
    [L("  周宁", "  Maya Reed", "  高橋結衣", "  周怡君"), L(" 财务  ", " Finance  ", " 財務 ", " 財務 "), undefined, undefined, undefined, "ap-108"],
    [L("赵敏  ", "Noah Clarke  ", "田中翔  ", "趙家豪  "), L("  人事 ", "  HR ", " 人事 ", " 人資 "), undefined, undefined, undefined, "la-026"],
    [L("  王磊  ", "  Lucas Hayes  ", "  伊藤大和  ", "  王柏翰  "), L(" 技术  ", "  Tech  ", "  技術  ", "  技術  "), undefined, undefined, undefined, "ap-203"],
  ]));

  function buildTasks(prefix, specs) {
    return specs.map((spec) => {
      const params = Object.assign({ target: spec.target }, spec.params || {});
      const target = String(spec.target || "").replace(/\{(\w+)\}/g, (match, key) => {
        const value = params[key];
        return value == null ? "" : String(value);
      });
      params.target = target;
      const title = fill(spec.title, params);
      const lead = fill(spec.lead, params);
      const hint = fill(spec.hint || L("参考公式：{formula}", "Reference formula: {formula}", "参考数式：{formula}"), Object.assign({ formula: spec.formula }, spec.params || {}));
      const success = fill(spec.success || L("结果已算好，可在右侧预览中核对。", "The result is ready. Check the preview on the right.", "結果は右側のプレビューで確認できます。"), spec.params || {});
      return task({
        id: prefix + "-" + spec.key,
        sheet: spec.sheet || textData,
        target,
        taskLabel: spec.taskLabel || common.extract,
        title,
        lead,
        hint,
        success,
        formula: spec.formula,
        requiredFunctions: spec.functions,
        requiredText: spec.requiredText,
        strictRefs: spec.strictRefs,
        sourceRefs: spec.sourceRefs,
        mode: spec.mode,
      });
    });
  }

  function extractTasks(prefix) {
    const specs = [
      {
        key: "left-bj", target: "G2", formula: "=LEFT(A2,2)",
        params: { row: 2, code: "EU-2026-001", count: 2 },
        title: L("第 {row} 行：取出区域代码", "Row {row}: extract the region code", "{row} 行目：地域コードを取り出す", "第 {row} 橫列：取出區域代碼"),
        lead: L("订单编号 {code} 的前两位代表区域。在 {target} 用 LEFT 取左边 2 个字符。", "The first two characters of {code} identify the region. In {target}, use LEFT for two characters.", "{code} の先頭2文字が地域です。{target} で LEFT を使って2文字取り出します。"),
        success: L("编号左端就是区域代码。", "The left edge of the code is the region.", "コードの左端が地域コードです。"),
      },
      {
        key: "left-sh", target: "G3", formula: "=LEFT(A3,2)",
        params: { row: 3, code: "NA-2026-014" },
        title: L("第 {row} 行：核对北美区编号", "Row {row}: check the North America code", "{row} 行目：北米地域コードを確認", "第 {row} 橫列：核對北美區編號"),
        lead: L("用 {target} 从 A3 的编号中取出前两位，结果应与区域代码列一致。", "Use {target} to extract the first two characters from A3 and compare it with the region code.", "{target} で A3 の先頭2文字を取り出し、地域コード列と照合します。"),
        success: L("LEFT 的第二个参数控制取几个字符。", "The second LEFT argument controls how many characters are returned.", "LEFT の2番目の引数で文字数を指定します。"),
      },
      {
        key: "right-seq", target: "G4", formula: "=RIGHT(A4,3)",
        params: { row: 4, code: "AP-2025-108" },
        title: L("第 {row} 行：取出三位流水号", "Row {row}: extract the three-digit sequence", "{row} 行目：3桁の連番を取り出す", "第 {row} 橫列：取出三位流水號"),
        lead: L("编号末尾总是三位流水号。在 {target} 用 RIGHT 从 A4 取右边 3 位。", "Every code ends with a three-digit sequence. In {target}, use RIGHT on A4 for three characters.", "コードの末尾は常に3桁の連番です。{target} で A4 の右3文字を RIGHT で取ります。"),
      },
      {
        key: "right-cd", target: "G5", formula: "=RIGHT(A5,3)",
        params: { row: 5, code: "LA-2026-026" },
        title: L("第 {row} 行：核对流水号", "Row {row}: check the sequence", "{row} 行目：連番を確認", "第 {row} 橫列：核對流水號"),
        lead: L("在 {target} 再取一次末尾三位，体会 RIGHT 只影响取字符的位置，不改变编号。", "In {target}, extract the last three characters again and notice that RIGHT only changes what is returned.", "{target} でもう一度末尾3文字を取り出し、RIGHT が元の文字列を変えないことを確認します。"),
      },
      {
        key: "mid-year-sh", target: "G6", formula: "=MID(A3,4,4)",
        params: { row: 3, code: "NA-2026-014" },
        title: L("第 {row} 行：从中间取年份", "Row {row}: pull the year from the middle", "{row} 行目：中央から年を取り出す", "第 {row} 橫列：從中間取年份"),
        lead: L("编号的第 4 位开始是四位年份。在 {target} 用 MID，从第 4 位开始取 4 个字符。", "The four-digit year starts at character 4. In {target}, use MID starting at 4 for four characters.", "4文字目から4桁の年が始まります。{target} で MID の開始位置を4、文字数を4にします。"),
        success: L("MID 的三个参数是：文本、起点、长度。", "MID takes text, start position, and length.", "MID の引数は文字列、開始位置、文字数です。"),
      },
      {
        key: "mid-year-bj", target: "G7", formula: "=MID(A6,4,4)",
        params: { row: 6, code: "EU-2025-099" },
        title: L("第 {row} 行：核对另一年的编号", "Row {row}: check another year", "{row} 行目：別の年を確認", "第 {row} 橫列：核對另一年的編號"),
        lead: L("同一结构换了一行。在 {target} 从 A6 的中间取出年份，不要手填 2025。", "The same structure moved to another row. In {target}, extract the year from A6 instead of typing 2025.", "同じ構成の別行です。{target} で A6 から年を取り出し、2025 を直接入力しません。"),
      },
      {
        key: "len-diff", target: "G8", formula: "=LEN(A4)", params: { row: 4 },
        title: L("第 {row} 行：检查编号长度", "Row {row}: measure the code length", "{row} 行目：コードの文字数を確認", "第 {row} 橫列：檢查編號長度"),
        lead: L("在 {target} 用 LEN 数一数 A4 的字符数。它能帮助发现缺失或多出的编号。", "In {target}, use LEN to count A4. Length checks reveal missing or extra characters.", "{target} で LEN を使い A4 の文字数を数えます。欠落や余分な文字の発見に役立ちます。"),
      },
      {
        key: "len-date", target: "G9", formula: "=LEN(F2)", params: { row: 2 },
        title: L("第 {row} 行：再量一个值", "Row {row}: measure another value", "{row} 行目：別の値を数える", "第 {row} 橫列：再量一個值"),
        lead: L("LEN 也能数日期文本。在 {target} 统计 F2 中日期字符串的长度。", "LEN also counts date text. In {target}, measure the date string in F2.", "LEN は日付文字列にも使えます。{target} で F2 の長さを数えます。"),
      },
    ];
    return buildTasks(prefix, specs);
  }

  function cleanTasks(prefix) {
    const label = common.clean;
    return buildTasks(prefix, [
      {
        key: "trim-lin", target: "C2", sheet: textClean, taskLabel: label, formula: "=TRIM(A2)",
        params: { cell: "A2" },
        title: L("去掉姓名前后的多余空格", "Remove extra spaces around a name", "氏名の前後の余分な空白を削除"),
        lead: L("A2 的姓名两边都有空格。在 C2 用 TRIM 清理，保留中间正常的单个空格。", "A2 has spaces on both sides. In C2, use TRIM and keep a normal single space in the middle.", "A2 の氏名には前後に空白があります。C2 で TRIM を使い、途中の1つの空白だけ残します。"),
      },
      {
        key: "trim-chen", target: "C3", sheet: textClean, taskLabel: label, formula: "=TRIM(A3)",
        params: { cell: "A3" },
        title: L("清理另一条人员记录", "Clean another staff record", "別の担当者レコードを整える"),
        lead: L("换到 C3 清理 A3。TRIM 会把连续空格压成一个，并去掉首尾空格。", "Move to C3 and clean A3. TRIM collapses repeated spaces and removes leading or trailing ones.", "C3 で A3 を整えます。TRIM は連続空白を1つにまとめ、前後の空白を削除します。"),
      },
      {
        key: "trim-concat", target: "C4", sheet: textClean, taskLabel: label, formula: '=CONCATENATE(TRIM(A4),"/",TRIM(B4))',
        params: { row: 4 },
        title: L("把姓名和部门拼成一条工牌文字", "Join name and department for a badge", "氏名と部署を名札用に結合"),
        lead: L("在 C4 先清理 A4 和 B4，再用 CONCATENATE 以斜杠连接，形成“姓名/部门”。", "In C4, clean A4 and B4, then join them with a slash using CONCATENATE.", "C4 で A4 と B4 を整え、CONCATENATE でスラッシュを挟んで結合します。"),
      },
      {
        key: "find-hyphen", target: "D2", sheet: textClean, taskLabel: label, formula: '=FIND("-",F2)',
        params: { code: "eu-001" },
        title: L("找出工号里连字符的位置", "Locate the hyphen in a staff code", "社員コードのハイフン位置を探す"),
        lead: L("在 D2 用 FIND 定位 F2 中连字符“-”的位置。结果是从左边数起的第几个字符。", "In D2, use FIND to locate the hyphen in F2. The result is its one-based position from the left.", "D2 で FIND を使い F2 のハイフン位置を求めます。左から数えた文字位置です。"),
      },
      {
        key: "search-sh", target: "D3", sheet: textClean, taskLabel: label, formula: '=SEARCH("NA",F3)',
        params: { code: "na-014" },
        title: L("不区分大小写地查找区域代码", "Find a region code without case sensitivity", "大文字小文字を区別せず地域コードを検索"),
        lead: L("F3 是小写 na。在 D3 用 SEARCH 找“NA”，SEARCH 不区分大小写，所以仍能返回位置 1。", "F3 contains lowercase na. In D3, use SEARCH for NA; SEARCH ignores case and still returns position 1.", "F3 は小文字の na です。D3 で SEARCH を使って NA を探します。SEARCH は大文字小文字を区別しません。"),
      },
      {
        key: "iferror-hyphen", target: "E2", sheet: textClean, taskLabel: label, formula: '=IFERROR(FIND("/",F2),"MISSING")',
        params: { code: "eu-001" },
        title: L("查找不到时不要显示错误", "Avoid an error when text is absent", "見つからないときにエラーを表示しない"),
        lead: L("F2 没有斜杠。在 E2 用 IFERROR 包住 FIND，查不到时返回 MISSING。", "F2 has no slash. In E2, wrap FIND with IFERROR and return MISSING when absent.", "F2 にスラッシュはありません。E2 で FIND を IFERROR で包み、見つからない場合は MISSING を返します。"),
      },
      {
        key: "iferror-ok", target: "E3", sheet: textClean, taskLabel: label, formula: '=IFERROR(FIND("-",F3),"MISSING")',
        params: { code: "na-014" },
        title: L("同一个兜底写法，这次能查到", "Reuse the fallback when the text exists", "見つかる場合にも同じエラー処理を使う"),
        lead: L("在 E3 用同样的 IFERROR 写法查找 F3 的连字符。公式结构不变，只是数据变了。", "In E3, use the same IFERROR pattern on F3. The formula stays the same while the data changes.", "E3 でも同じ IFERROR の形で F3 のハイフンを探します。数式は同じでデータだけが変わります。"),
      },
      {
        key: "concat-code", target: "E4", sheet: textClean, taskLabel: label, formula: '=CONCATENATE(LEFT(F2,2),RIGHT(F2,3))',
        params: { row: 2 },
        title: L("提取工号的两端拼成短码", "Join both ends of a staff code", "社員コードの両端を結合する"),
        lead: L("在 E4 取出 F2 的前两位和末三位，再用 CONCATENATE 连成短码。", "In E4, take the first two and last three characters from F2, then join them with CONCATENATE.", "E4 で F2 の先頭2文字と末尾3文字を取り出し、CONCATENATE でつなぎます。"),
      },
    ]);
  }

  function cleanTransferTasks(prefix) {
    return buildTasks(prefix, [
      {
        key: "if-length", target: "G2", sheet: textClean, formula: '=IF(LEN(TRIM(A2))>=2,"OK","CHECK")',
        params: { target: "G2" },
        title: L("自动判断姓名是否已清理", "Flag whether a cleaned name is usable", "整えた氏名が使えるか自動判定"),
        lead: L("在 G2 先清理 A2，再判断清理后是否至少有两个字符。IF 返回 OK 或 CHECK，方便批量筛查。", "In G2, clean A2 and test whether it has at least two characters. IF returns OK or CHECK for quick screening.", "G2 で A2 を整え、2文字以上かどうかを判定します。IF で OK か CHECK を返します。"),
        hint: L("参考：{formula}。先清理再数长度，不要直接数原始文本。", "Reference: {formula}. Clean first, then count; do not count the raw text.", "参考：{formula}。先に整えてから数えます。"),
      },
      {
        key: "find-valid", target: "G3", sheet: textClean, formula: '=IF(FIND("-",F3)>1,F3,"BAD")',
        params: { target: "G3" },
        title: L("工号有连字符才保留", "Keep a staff code only when it has a hyphen", "ハイフンがある社員コードだけ残す"),
        lead: L("在 G3 查找 F3 的连字符；位置大于 1 时返回原工号，否则返回 BAD。", "In G3, find the hyphen in F3. Return the code when the position is greater than 1; otherwise return BAD.", "G3 で F3 のハイフンを探し、位置が1より大きければ元のコード、そうでなければ BAD を返します。"),
      },
      {
        key: "concat-parts", target: "G4", sheet: textClean, formula: '=CONCATENATE(LEFT(F4,2),"-",RIGHT(F4,3))',
        params: { target: "G4" },
        title: L("把工号重新整理为标准短码", "Normalize a staff code into a short form", "社員コードを短い標準形式に整える"),
        lead: L("在 G4 用 LEFT、RIGHT 和字面量连字符，重新拼出前两位-后三位的形式。", "In G4, use LEFT, RIGHT, and a literal hyphen to rebuild the first-two-last-three form.", "G4 で LEFT、RIGHT、文字列のハイフンを使い、先頭2文字-末尾3文字の形に組み直します。"),
      },
      {
        key: "missing-branch", target: "G5", sheet: textClean, formula: '=IFERROR(SEARCH("EU",F3),"MISSING")',
        params: { target: "G5" },
        title: L("查找区域码并兼容找不到的情况", "Search a region code with a fallback", "地域コードを検索し、未検出にも対応"),
        lead: L("在 G5 用 SEARCH 在 F3 中找 EU；F3 里没有 EU 码，IFERROR 会返回 MISSING。", "In G5, SEARCH F3 for EU. That code is absent, so IFERROR returns MISSING.", "G5 で F3 の EU を SEARCH します。EU はないため、IFERROR が MISSING を返します。"),
      },
      {
        key: "sum-lengths", target: "G6", sheet: textClean, formula: "=LEN(TRIM(A2))+LEN(TRIM(A3))",
        params: { target: "G6" },
        title: L("两条姓名清理后的总字符数", "Total character count after cleaning two names", "2つの氏名を整えた後の合計文字数"),
        lead: L("在 G6 分别清理 A2、A3 并取长度，再用加法汇总。复习 LEN 与算术运算的组合。", "In G6, clean and measure A2 and A3 separately, then add the lengths. This combines LEN with arithmetic.", "G6 で A2 と A3 を整えて長さを求め、足し合わせます。LEN と四則演算の復習です。"),
      },
      {
        key: "absolute-checklist", target: "G7", sheet: textClean, formula: '=IF(AND(LEN(TRIM(A2))>=2,FIND("-",F2)=3),"PASS","REVIEW")',
        params: { target: "G7" },
        title: L("同时检查姓名长度和工号格式", "Check name length and code format together", "氏名の長さと社員コード形式を同時確認"),
        lead: L("在 G7 用 AND 同时验证“清理后的姓名至少两个字符”和“工号连字符在位置 3”，都成立才返回 PASS。", "In G7, use AND to verify both a usable cleaned name and the hyphen position. Return PASS only when both hold.", "G7 で AND を使い、整形後の氏名が使えることとハイフン位置の両方を確認します。両方成立した場合だけ PASS です。"),
      },
    ]);
  }

  function textAuditTasks(prefix) {
    const specs = [
      {
        key: "bj-count", target: "H2", formula: '=COUNTIF(B2:B7,"EU")', functions: ["COUNTIF"],
        params: { label: "EU" },
        title: L("统计 EU 区域的订单", "Count EU orders", "EU 地域の注文数を数える"),
        lead: L("在 H2 用 COUNTIF 统计 B2:B7 中等于 EU 的记录数。文本条件要加双引号。", "In H2, COUNTIF B2:B7 for EU. Text criteria need double quotes.", "H2 で COUNTIF を使い、B2:B7 の EU を数えます。文字列条件は二重引用符で囲みます。"),
        success: L("条件计数沿用上一章写法，只把数字条件换成了文本条件。", "This reuses conditional counting, now with text instead of numbers.", "条件付き個数の復習です。数値条件が文字列条件に変わりました。"),
      },
      {
        key: "year-2026", target: "H3", formula: "=COUNTIF(C2:C7,2026)", functions: ["COUNTIF"],
        params: { year: 2026 },
        title: L("统计 2026 年的编号", "Count codes from {year}", "{year} 年のコードを数える"),
        lead: L("在 H3 统计 C 列中年份等于 2026 的记录数。数字条件不需要引号。", "In H3, count rows in column C whose year equals 2026. Numeric criteria do not need quotes.", "H3 で C 列の年が 2026 の件数を数えます。数値条件に引用符は不要です。"),
      },
      {
        key: "bj-2026", target: "H4", formula: '=COUNTIFS(B2:B7,"EU",C2:C7,2026)', functions: ["COUNTIFS"],
        params: { region: "EU", year: 2026 },
        title: L("找出同时属于 EU 和 2026 的订单", "Find orders that are both EU and 2026", "EU かつ 2026 の注文を探す"),
        lead: L("在 H4 用 COUNTIFS 同时限制区域和年份，两个条件都满足才计数。", "In H4, COUNTIFS with both region and year. Count only rows that meet both.", "H4 で COUNTIFS を使い、地域と年の両条件を指定します。"),
      },
      {
        key: "mid-sum", target: "H5", formula: "=SUM(MID(A2,4,4)*1,MID(A3,4,4)*1)", functions: ["SUM", "MID"],
        params: { rows: "2、3" },
        title: L("把两行编号里的年份取出来再相加", "Extract two years and add them", "2行の年を取り出して合計"),
        lead: L("在 H5 用 MID 从 A2、A3 各取四位年份，分别转成数字后交给 SUM。文本提取也能参与计算。", "In H5, use MID on A2 and A3, convert each year to a number, then SUM them. Extracted text can feed calculations.", "H5 で A2 と A3 から MID で年を取り出し、数値に変換して SUM します。"),
      },
      {
        key: "length-flag", target: "H6", formula: "=IF(LEN(A4)=11,1,0)", functions: ["IF", "LEN"],
        params: { row: 4 },
        title: L("检查第 4 行编号长度并打标记", "Flag row 4 when the code length is 11", "4行目コードの長さを確認して印を付ける"),
        lead: L("在 H6 用 LEN 检查 A4 是否为 11 个字符；正确返回 1，否则返回 0。", "In H6, use LEN to test whether A4 has 11 characters. Return 1 when true, otherwise 0.", "H6 で LEN を使い A4 が11文字かを判定します。真なら1、偽なら0です。"),
      },
      {
        key: "short-code", target: "H7", formula: '=CONCATENATE(LEFT(A5,2),"-",RIGHT(A5,3))', functions: ["CONCATENATE", "LEFT", "RIGHT"],
        params: { row: 5 },
        title: L("为第 5 行生成区域-流水号短码", "Build a region-sequence short code for row 5", "5行目の地域-連番コードを作る"),
        lead: L("在 H7 将 A5 的前两位区域和末尾三位流水号连接起来，中间加一个连字符。", "In H7, join the first two characters and last three characters of A5 with a hyphen.", "H7 で A5 の先頭2文字と末尾3文字をハイフンでつなぎます。"),
      },
      {
        key: "average-year", target: "H8", formula: "=ROUND(AVERAGE(C2:C7),0)", functions: ["ROUND", "AVERAGE"],
        params: { label: "年份均值" },
        title: L("年份均值的报表读数", "Round the average year for a report", "レポート用に年平均を丸める"),
        lead: L("在 H8 求 C2:C7 的平均年份，再四舍五入到整数。复习平均值与 ROUND 的组合。", "In H8, average C2:C7 and round to a whole number. This reuses AVERAGE and ROUND together.", "H8 で C2:C7 の平均年を求め、整数に丸めます。AVERAGE と ROUND の復習です。"),
      },
      {
        key: "other-regions", target: "H9", formula: '=COUNTIF(B2:B7,"NA")+COUNTIF(B2:B7,"AP")', functions: ["COUNTIF"],
        params: { regions: "NA、AP" },
        title: L("两次条件计数合并 NA 与 AP", "Add counts for NA and AP", "NA と AP の件数を合算"),
        lead: L("在 H9 分别统计 NA 和 AP，再用加号汇总。两次单条件计数也可以组合成多群体统计。", "In H9, count NA and AP separately, then add them. Two single-condition counts can form a combined group total.", "H9 で NA と AP を別々に数え、足します。単条件カウントを組み合わせた集計です。"),
      },
    ];
    return buildTasks(prefix, specs);
  }

  D.registerChapter({
    id: "ch05-text",
    icon: "05",
    title: L("第 5 章 · 让文字变成可用的信息", "Chapter 5 · Turn Text into Useful Data", "第5章 · 文字を使える情報にする"),
    subtitle: L("把长编号拆成区域、年份和流水号，再清理空格与格式。每学一个文本函数，都会和前面学过的计数、判断或汇总一起使用。", "Split long codes into regions, years, and sequences, then clean spacing and formats. Every new text function is combined with counting, decisions, or totals from earlier chapters.", "長いコードを地域、年、連番に分解し、空白や表記を整えます。新しい文字関数は、既習の集計・判定と組み合わせて練習します。"),
    levels: [
      level("text-extract", "lesson", L("编号拆分：LEFT、RIGHT、MID、LEN", "Split Codes with LEFT, RIGHT, MID, and LEN", "コード分解：LEFT・RIGHT・MID・LEN"), [
        learn(
          "brief-text-extract",
          L("客服要按区域快速筛选订单", "Support needs to filter orders by region", "サポートが地域別に注文を絞り込む", "客服要依區域快速篩選訂單"),
          L("你收到一列“区域-年份-流水号”组成的订单编号。今天不背函数定义，只把它拆成三个能筛选、能计数的字段。先观察编号结构，再到表格里动手。", "You receive order codes made of region, year, and sequence. Instead of memorizing definitions, split each code into three useful fields. Inspect the pattern, then work directly in the sheet.", "地域-年-連番で構成された注文コードを受け取ります。定義を暗記せず、選別や集計に使える3つの項目へ分解します。"),
          [
            L("LEFT 从左边开始取字符", "LEFT takes characters from the left", "LEFT は左端から文字を取ります"),
            L("RIGHT 从右边开始取字符", "RIGHT takes characters from the right", "RIGHT は右端から文字を取ります"),
            L("MID 指定起点和长度，适合取中间的年份", "MID specifies a start and length, ideal for a year in the middle", "MID は開始位置と文字数を指定します"),
            L("先用一个格子试对，再把这招套到其他行", "Get one cell right, then apply the same move to other rows", "まず1セルで正解を確認し、同じやり方を他の行へ広げます"),
          ],
          L("文本函数只读取原值，不会改掉 A 列。公式结果可以放在旁边的空白列。", "Text functions read the source value and leave column A unchanged. Put results in a blank column beside it.", "文字関数は元の値を変更しません。結果は隣の空白列に置きます。"),
          "=LEFT(A2,2)"
        ),
        practice({
          id: "text-extract-guided",
          title: L("从订单编号中取出区域、年份和流水号", "Extract region, year, and sequence from order codes", "注文コードから地域・年・連番を取り出す"),
          lead: L("每次随机给出一条编号和一种提取任务。先在名称框确认目标格，再写函数，不要手抄结果。", "Each attempt gives you a different code and extraction task. Confirm the target cell, then write the function instead of typing the result.", "毎回異なるコードと抽出課題が出ます。対象セルを確認し、結果を手入力せず関数で求めます。"),
          sheet: textData,
          tasks: extractTasks("text-guided"),
          hint: L("左端用 LEFT，右端用 RIGHT，中间用 MID，字符数量用 LEN。", "Use LEFT for the start, RIGHT for the end, MID for the middle, and LEN for character count.", "左端は LEFT、右端は RIGHT、中央は MID、文字数は LEN です。"),
        }),
        practice({
          id: "text-extract-transfer",
          title: L("同一批编号换任务：提取后再判断", "Same codes, new jobs: extract and then decide", "同じコードで別の作業：抽出して判定"),
          lead: L("这次不只是截取文字，还要把长度检查、数字转换和 IF 判断接在后面。旧知识会一起出现。", "This time, follow extraction with length checks, number conversion, and IF decisions. Earlier skills return alongside the new ones.", "今回は抽出だけでなく、長さ確認、数値変換、IF 判定も続けます。既習内容も一緒に使います。"),
          sheet: textData,
          tasks: [
            task({ id: "text-transfer-1", sheet: textData, target: "J2", taskLabel: common.audit, title: L("编号长度是否正好 11 位", "Is the code exactly 11 characters?", "コードはちょうど11文字？"), lead: L("在 J2 用 LEN 检查 A2，再用 IF 返回 1 或 0。", "In J2, check A2 with LEN, then return 1 or 0 with IF.", "J2 で A2 を LEN で調べ、IF で1か0を返します。"), hint: L("参考：=IF(LEN(A2)=11,1,0)", "Reference: =IF(LEN(A2)=11,1,0)", "参考：=IF(LEN(A2)=11,1,0)"), success: L("长度检查被转换成可以直接统计的 1/0。", "The length check becomes a 1 or 0 that can be counted.", "長さ確認を集計できる1/0に変えました。"), formula: "=IF(LEN(A2)=11,1,0)", requiredFunctions: ["IF", "LEN"] }),
            task({ id: "text-transfer-2", sheet: textData, target: "J3", taskLabel: common.audit, title: L("流水号转成真正数字", "Turn a sequence code into a real number", "連番コードを数値に変換"), lead: L("在 J3 取出 A4 的末三位，再乘 1 转成数字。", "In J3, take the last three characters of A4 and multiply by 1 to make a number.", "J3 で A4 の末尾3文字を取り出し、1を掛けて数値にします。"), hint: L("参考：=RIGHT(A4,3)*1", "Reference: =RIGHT(A4,3)*1", "参考：=RIGHT(A4,3)*1"), success: L("文本数字参与运算前，先转成数值。", "Text digits must become numbers before arithmetic.", "文字の数字は計算前に数値へ変換します。"), formula: "=RIGHT(A4,3)*1", requiredFunctions: ["RIGHT"] }),
            task({ id: "text-transfer-3", sheet: textData, target: "J4", taskLabel: common.audit, title: L("流水号大于 100 才标为优先", "Flag sequences above 100 as priority", "連番が100超なら優先にする"), lead: L("在 J4 把 A6 的末三位转数字，再用 IF 判断是否大于 100。", "In J4, convert A6's last three characters to a number, then use IF to test whether it is above 100.", "J4 で A6 の末尾3文字を数値にし、100超かを IF で判定します。"), hint: L("参考：=IF(RIGHT(A6,3)*1>100,1,0)", "Reference: =IF(RIGHT(A6,3)*1>100,1,0)", "参考：=IF(RIGHT(A6,3)*1>100,1,0)"), success: L("文本提取和逻辑判断可以写在同一条公式里。", "Text extraction and logic can live in one formula.", "文字抽出と論理判定を1つの数式にできました。"), formula: "=IF(RIGHT(A6,3)*1>100,1,0)", requiredFunctions: ["IF", "RIGHT"] }),
            task({ id: "text-transfer-4", sheet: textData, target: "J5", taskLabel: common.audit, title: L("两段编号的长度合计", "Add the lengths of two codes", "2つのコード長を合計"), lead: L("在 J5 分别对 A2、A3 取长度，再相加。", "In J5, measure A2 and A3 separately, then add the lengths.", "J5 で A2 と A3 の長さを求め、足します。"), hint: L("参考：=LEN(A2)+LEN(A3)", "Reference: =LEN(A2)+LEN(A3)", "参考：=LEN(A2)+LEN(A3)"), success: L("LEN 返回数字，所以能直接求和。", "LEN returns numbers, so its results can be added.", "LEN は数値を返すため、そのまま合計できます。"), formula: "=LEN(A2)+LEN(A3)", requiredFunctions: ["LEN"] }),
            task({ id: "text-transfer-5", sheet: textData, target: "J6", taskLabel: common.audit, title: L("从中间年份减去 2000", "Subtract 2000 from a year in the middle", "中央の年から2000を引く"), lead: L("在 J6 用 MID 取出 A7 的年份，再减 2000。", "In J6, use MID to extract A7's year, then subtract 2000.", "J6 で MID を使い A7 の年を取り出し、2000を引きます。"), hint: L("参考：=MID(A7,4,4)-2000", "Reference: =MID(A7,4,4)-2000", "参考：=MID(A7,4,4)-2000"), success: L("截出来的四位年份可以直接参与减法。", "The extracted four-digit year can feed subtraction directly.", "抽出した4桁の年をそのまま減算に使えます。"), formula: "=MID(A7,4,4)-2000", requiredFunctions: ["MID"] }),
          ],
          hint: L("先用一种提取函数取到正确文本，再考虑要不要转数字或接 IF。", "Get the text right first, then decide whether to convert it to a number or wrap it in IF.", "まず文字列を正しく取り出し、その後で数値変換や IF を考えます。"),
        }),
        practice({
          id: "text-extract-check",
          title: L("订单编号小型复核", "A short order-code audit", "注文コードの小さな確認作業"),
          lead: L("这是本章第一关的收尾。题目会混合取字符、求长度、条件计数和算术，随机抽取一题。", "This closes the first level with a random mix of extraction, length, conditional counts, and arithmetic.", "最初のレベルの締めです。抽出、長さ、条件付き個数、四則演算を混ぜて出題します。"),
          sheet: textData,
          tasks: [
            task({ id: "text-check-1", sheet: textData, target: "K2", taskLabel: common.audit, title: L("抽查 A3 的区域代码", "Spot-check the region code in A3", "A3 の地域コードを抜き取り確認"), lead: L("在 K2 用 LEFT 取出 A3 的前两位。", "In K2, use LEFT on A3 for the first two characters.", "K2 で LEFT を使い A3 の先頭2文字を取ります。"), hint: L("参考：=LEFT(A3,2)", "Reference: =LEFT(A3,2)", "参考：=LEFT(A3,2)"), formula: "=LEFT(A3,2)", requiredFunctions: ["LEFT"] }),
            task({ id: "text-check-2", sheet: textData, target: "K3", taskLabel: common.audit, title: L("抽查 A6 的流水号", "Spot-check the sequence in A6", "A6 の連番を抜き取り確認"), lead: L("在 K3 用 RIGHT 取出 A6 的末三位。", "In K3, use RIGHT on A6 for the last three characters.", "K3 で RIGHT を使い A6 の末尾3文字を取ります。"), hint: L("参考：=RIGHT(A6,3)", "Reference: =RIGHT(A6,3)", "参考：=RIGHT(A6,3)"), formula: "=RIGHT(A6,3)", requiredFunctions: ["RIGHT"] }),
            task({ id: "text-check-3", sheet: textData, target: "K4", taskLabel: common.audit, title: L("统计有完整 11 位编号的行数", "Count rows with complete 11-character codes", "11文字の完全なコードがある行を数える"), lead: L("这里先用 COUNT 了解数字单元格数量，再观察编号文本与数字计数的区别。在 K4 统计 C2:C7 的数字个数。", "First observe how COUNT differs from counting text. In K4, count numeric cells in C2:C7.", "数値と文字列の数え方の違いを確認します。K4 で C2:C7 の数値セルを数えます。"), hint: L("参考：=COUNT(C2:C7)", "Reference: =COUNT(C2:C7)", "参考：=COUNT(C2:C7)"), formula: "=COUNT(C2:C7)", requiredFunctions: ["COUNT"] }),
          task({ id: "text-check-4", sheet: textData, target: "K5", taskLabel: common.audit, title: L("统计 EU 区域的编号数", "Count EU codes", "EU 地域のコード数を数える"), lead: L("在 K5 用 COUNTIF 统计 B2:B7 中 EU 的条数。", "In K5, use COUNTIF to count EU in B2:B7.", "K5 で COUNTIF を使い B2:B7 の EU を数えます。"), hint: L('参考：=COUNTIF(B2:B7,"EU")', 'Reference: =COUNTIF(B2:B7,"EU")', '参考：=COUNTIF(B2:B7,"EU")'), formula: '=COUNTIF(B2:B7,"EU")', requiredFunctions: ["COUNTIF"] }),
            task({ id: "text-check-5", sheet: textData, target: "K6", taskLabel: common.audit, title: L("核对第 2 行编号是否为 11 位", "Check whether row 2 has an 11-character code", "2行目コードが11文字か確認"), lead: L("在 K6 用 LEN 返回 A2 的长度。", "In K6, return the length of A2 with LEN.", "K6 で LEN を使い A2 の長さを返します。"), hint: L("参考：=LEN(A2)", "Reference: =LEN(A2)", "参考：=LEN(A2)"), formula: "=LEN(A2)", requiredFunctions: ["LEN"] }),
          ],
          hint: L("先看题目问的是取文字、数个数还是做判断，再选择最小的一组函数。", "Decide whether the job asks for text, a count, or a decision, then use the smallest suitable function.", "文字の抽出、件数、判定のどれかを確認し、最小限の関数を選びます。"),
        }),
      ], { xp: 35 }),

      level("text-clean", "lesson", L("清理空格：TRIM、CONCATENATE、FIND、SEARCH", "Clean Spacing with TRIM, CONCATENATE, FIND, and SEARCH", "空白整理：TRIM・CONCATENATE・FIND・SEARCH"), [
        learn(
          "brief-text-clean",
          L("人事导出的名单带着双空格和大小写混乱", "The HR export has extra spaces and inconsistent case", "人事の書き出しに余分な空白と表記ゆれがある"),
          L("名单里有人名前后带空格，工号大小写也不一致。今天先清理文本，再查找固定符号。每个动作都要能批量套用，而不是手工改几十行。", "Names have leading and trailing spaces, and staff codes vary in case. Clean the text and locate fixed symbols. Every step should work across many rows.", "氏名の前後に空白があり、社員コードの大文字小文字も揃っていません。文字を整え、決まった記号を探します。多数の行に使える方法を身につけます。"),
          [
            L("TRIM 去掉首尾空格，并把中间连续空格压成一个", "TRIM removes outer spaces and collapses inner runs", "TRIM は前後の空白を削除し、連続空白を1つにします"),
            L("CONCATENATE 把多段文字按顺序连接", "CONCATENATE joins text in order", "CONCATENATE は文字列を順番につなぎます"),
            L("FIND 区分大小写，SEARCH 不区分大小写", "FIND is case-sensitive; SEARCH is not", "FIND は大文字小文字を区別し、SEARCH は区別しません"),
            L("IFERROR 把“找不到”变成可读提示", "IFERROR turns a missing value into a readable result", "IFERROR は未検出を読みやすい結果に変えます"),
          ],
          L("先清理再拼接。否则隐藏空格会进入最终编号，打印后很难发现。", "Clean before joining. Otherwise hidden spaces enter the final code and are hard to spot in print.", "結合する前に整えます。空白が混ざると印刷後に見つけにくくなります。"),
          '=CONCATENATE(TRIM(A2),"/",TRIM(B2))'
        ),
        practice({
          id: "text-clean-guided",
          title: L("清理名单：空格、连接与查找位置", "Clean the roster: spacing, joining, and positions", "名簿整理：空白・結合・位置検索"),
          lead: L("随机抽到的任务会换单元格和函数。注意目标格已经在表格中给出，照着名称框操作。", "Each random task changes the cell and function. The target is marked in the sheet; work from the Name Box address.", "ランダムな課題ごとに対象セルと関数が変わります。シート上の対象セルを確認して操作します。"),
          sheet: textClean,
          tasks: cleanTasks("text-clean-guided"),
          hint: L("先看题目要“清理”“连接”还是“查找”，再决定公式重点。", "Decide whether the job is to clean, join, or locate before writing the formula.", "整理・結合・検索のどれかを確認してから数式を選びます。"),
        }),
        practice({
          id: "text-clean-transfer",
          title: L("名单质检：文本结果接上旧逻辑", "Roster QA: connect cleaned text to earlier logic", "名簿チェック：整えた文字列を既習の論理とつなぐ"),
          lead: L("这一组把 TRIM 与 LEN、IF、AND、SEARCH 串起来，模拟导入系统前的质检步骤。", "This set chains TRIM with LEN, IF, AND, and SEARCH to mimic checks before a system import.", "TRIM を LEN、IF、AND、SEARCH とつなぎ、システム取り込み前の確認を再現します。"),
          sheet: textClean,
          tasks: cleanTransferTasks("text-clean-transfer"),
          hint: L("复合公式从里往外读：先清理，再查找或数长度，最后判断。", "Read nested formulas from the inside out: clean, then locate or measure, then decide.", "入れ子の数式は内側から読みます。整理、検索または長さ確認、最後に判定です。"),
        }),
        practice({
          id: "text-clean-check",
          title: L("名单清理收尾实战", "Roster-cleaning checkpoint", "名簿整理の仕上げ実践"),
          lead: L("最后一组混合清理、文本连接、条件计数和查找。每次只随机出一题。", "This final mix combines cleaning, joining, conditional counts, and searches. Each attempt presents one random task.", "最後は整理、文字結合、条件付き個数、検索を混ぜます。1回につき1問をランダムに出題します。"),
          sheet: textClean,
          tasks: [
            task({ id: "clean-check-1", sheet: textClean, target: "C5", taskLabel: common.clean, title: L("清理一条人员记录", "Clean one staff record", "1件の担当者レコードを整える"), lead: L("在 C5 用 TRIM 清理 A5。", "In C5, clean A5 with TRIM.", "C5 で TRIM を使い A5 を整えます。"), hint: L("参考：=TRIM(A5)", "Reference: =TRIM(A5)", "参考：=TRIM(A5)"), formula: "=TRIM(A5)", requiredFunctions: ["TRIM"] }),
            task({ id: "clean-check-2", sheet: textClean, target: "C6", taskLabel: common.clean, title: L("连接清理后的姓名和部门", "Join a cleaned name and department", "整形後の氏名と部署を結合"), lead: L("在 C6 清理 A3 和 B3，再用 CONCATENATE 以斜杠连接。", "In C6, clean A3 and B3, then join them with a slash using CONCATENATE.", "C6 で A3 と B3 を整え、CONCATENATE でスラッシュを挟んで結合します。"), hint: L('参考：=CONCATENATE(TRIM(A3),"/",TRIM(B3))', 'Reference: =CONCATENATE(TRIM(A3),"/",TRIM(B3))', '参考：=CONCATENATE(TRIM(A3),"/",TRIM(B3))'), formula: '=CONCATENATE(TRIM(A3),"/",TRIM(B3))', requiredFunctions: ["CONCATENATE", "TRIM"] }),
            task({ id: "clean-check-3", sheet: textClean, target: "D4", taskLabel: common.clean, title: L("找出 AP 工号的连字符位置", "Find the hyphen in an AP staff code", "AP 社員コードのハイフン位置"), lead: L("在 D4 用 FIND 查找 F4 中的连字符。", "In D4, use FIND to locate the hyphen in F4.", "D4 で FIND を使い F4 のハイフンを探します。"), hint: L('参考：=FIND("-",F4)', 'Reference: =FIND("-",F4)', '参考：=FIND("-",F4)'), formula: '=FIND("-",F4)', requiredFunctions: ["FIND"] }),
            task({ id: "clean-check-4", sheet: textClean, target: "D5", taskLabel: common.clean, title: L("不区分大小写地找区域码", "Find a region code regardless of case", "大文字小文字を区別せず地域コードを検索"), lead: L("在 D5 用 SEARCH 查找 F5 中的 LA，F5 里的实际大小写不影响结果。", "In D5, SEARCH F5 for LA. The actual case in F5 does not matter.", "D5 で F5 の LA を SEARCH します。F5 の実際の大文字小文字は影響しません。"), hint: L('参考：=SEARCH("LA",F5)', 'Reference: =SEARCH("LA",F5)', '参考：=SEARCH("LA",F5)'), formula: '=SEARCH("LA",F5)', requiredFunctions: ["SEARCH"] }),
            task({ id: "clean-check-5", sheet: textClean, target: "F5", taskLabel: common.clean, title: L("统计清理后非空的工号", "Count non-empty staff codes", "整形後に空でない社員コードを数える"), lead: L("在 F5 用 COUNTA 统计 F2:F4 的非空数量。它统计非空，不只是数字。", "In F5, use COUNTA on F2:F4. It counts non-empty cells, not only numbers.", "F5 で COUNTA を使い F2:F4 の空白以外を数えます。"), hint: L("参考：=COUNTA(F2:F4)", "Reference: =COUNTA(F2:F4)", "参考：=COUNTA(F2:F4)"), formula: "=COUNTA(F2:F4)", requiredFunctions: ["COUNTA"] }),
            task({ id: "clean-check-6", sheet: textClean, target: "F6", taskLabel: common.clean, title: L("清理后的姓名可用性校验", "Validate the cleaned name", "整形後の氏名が使えるか検証"), lead: L("在 F6 清理 A4 并判断是否至少两个字符；可用返回 PASS，否则 REVIEW。", "In F6, clean A4 and test for at least two characters. Return PASS when usable; otherwise REVIEW.", "F6 で A4 を整え、2文字以上かを判定します。使える場合は PASS、それ以外は REVIEW です。"), hint: L('参考：=IF(LEN(TRIM(A4))>=2,"PASS","REVIEW")', 'Reference: =IF(LEN(TRIM(A4))>=2,"PASS","REVIEW")', '参考：=IF(LEN(TRIM(A4))>=2,"PASS","REVIEW")'), formula: '=IF(LEN(TRIM(A4))>=2,"PASS","REVIEW")', requiredFunctions: ["IF", "LEN", "TRIM"] }),
          ],
          hint: L("清理步骤写在最内层，外层再接查找、计数或判断。", "Put cleaning innermost, then wrap it with a search, count, or decision.", "整理は最も内側に置き、外側で検索・件数・判定を行います。"),
        }),
      ], { xp: 35 }),

      level("text-audit", "review", L("文本与表格综合复盘", "Text and Spreadsheet Review", "文字処理と表の総合復習"), [
        learn(
          "brief-text-audit",
          L("运营要把编号检查结果发给主管", "Operations must send the code audit to a manager", "運用担当がコード検査結果を上司へ送る"),
          L("主管不想看原始编号，只想知道区域分布、年份数量和格式是否异常。你要用公式把文本变成可汇报的数字，同时复习计数、平均值和条件判断。", "The manager wants region distribution, year counts, and format exceptions rather than raw codes. Turn text into reportable numbers while reusing counts, averages, and decisions.", "上司は生のコードではなく、地域分布、年の件数、形式の例外を知りたいと考えています。数式で文字を報告可能な数値へ変え、既習の集計・判定も復習します。"),
          [
            L("文本条件计数继续使用 COUNTIF 与 COUNTIFS", "Use COUNTIF and COUNTIFS for text criteria", "文字条件の集計には COUNTIF と COUNTIFS を使います"),
            L("提取函数可以嵌在算术或统计函数里", "Extraction functions can sit inside arithmetic or statistics", "抽出関数は四則演算や集計関数の中に入れられます"),
            L("报表优先输出可计算的结果", "Reports prefer computable results", "レポートでは計算可能な結果を優先します"),
            L("每次只改变一个条件，便于定位错误", "Change one condition at a time to isolate mistakes", "条件は1つずつ変えると誤りを見つけやすくなります"),
          ],
          L("真实工作里，提取与统计常常写在同一条公式中。先分开想清楚，再合起来写。", "In real work, extraction and aggregation often share one formula. Think through the parts, then combine them.", "実務では抽出と集計を1つの数式にまとめることがよくあります。部分ごとに考えてから組み合わせます。"),
          '=COUNTIF(B2:B7,"EU")'
        ),
        practice({
          id: "text-audit-main",
          title: L("订单编号审计：区域、年份与格式", "Order-code audit: region, year, and format", "注文コード監査：地域・年・形式"),
          lead: L("题目会从多个审计任务中随机抽一个。每一题都同时涉及文本和之前学过的统计或判断。", "One audit task is chosen at random. Every task combines text with a prior counting or decision skill.", "複数の監査課題から1問をランダムに出題します。どの問題も文字処理と既習の集計・判定を組み合わせます。"),
          sheet: textData,
          tasks: textAuditTasks("text-audit-main"),
          hint: L("先拆公式：条件区域是什么？文本从哪里取？最后要计数、求和还是判断？", "Break it down: criteria range, text source, and whether the result is a count, total, or decision.", "条件範囲、抽出元、最終結果が件数・合計・判定のどれかを順に考えます。"),
        }),
        practice({
          id: "text-audit-import",
          title: L("导入前质检：一次处理一个异常", "Pre-import QA: one exception at a time", "取り込み前チェック：例外を1つずつ処理"),
          lead: L("系统导入前，名单必须先通过空格、格式和工号检查。随机题目会切换检查项，保持“先清理、再判断”的节奏。", "Before import, the roster must pass spacing, format, and staff-code checks. Random tasks switch checks while keeping the clean-then-decide rhythm.", "取り込み前に空白、形式、社員コードを確認します。課題が変わっても「整えてから判定」の流れを保ちます。"),
          sheet: textClean,
          tasks: [
            task({ id: "text-import-1", sheet: textClean, target: "G3", taskLabel: common.audit, title: L("姓名清理后是否为空", "Is the cleaned name empty?", "整形後の氏名が空か確認"), lead: L("在 G3 清理 A3，再用 IF 判断是否为空字符串。", "In G3, clean A3, then use IF to test for an empty string.", "G3 で A3 を整え、IF で空文字かどうかを判定します。"), hint: L('参考：=IF(TRIM(A3)="","空白","有值")', 'Reference: =IF(TRIM(A3)="","Blank","Value")', '参考：=IF(TRIM(A3)="","空白","値あり")'), formula: '=IF(TRIM(A3)="","空白","有值")', requiredFunctions: ["IF", "TRIM"] }),
            task({ id: "text-import-2", sheet: textClean, target: "G4", taskLabel: common.audit, title: L("工号是否包含连字符", "Does the staff code contain a hyphen?", "社員コードにハイフンがあるか"), lead: L("在 G4 用 FIND 与 IFERROR：找到连字符返回其位置，找不到返回 0。", "In G4, use FIND with IFERROR: return the position when found, otherwise 0.", "G4 で FIND と IFERROR を使い、見つかれば位置、見つからなければ0を返します。"), hint: L('参考：=IFERROR(FIND("-",F4),0)', 'Reference: =IFERROR(FIND("-",F4),0)', '参考：=IFERROR(FIND("-",F4),0)'), formula: '=IFERROR(FIND("-",F4),0)', requiredFunctions: ["IFERROR", "FIND"] }),
            task({ id: "text-import-3", sheet: textClean, target: "G5", taskLabel: common.audit, title: L("拼接前先清理两边", "Clean both sides before joining", "結合前に両側を整える"), lead: L("在 G5 用 CONCATENATE 拼接 A2、B3，两边都先 TRIM。", "In G5, join A2 and B3 with CONCATENATE, applying TRIM to both.", "G5 で A2 と B3 を CONCATENATE で結合します。両方に TRIM を適用します。"), hint: L('参考：=CONCATENATE(TRIM(A2),"-",TRIM(B3))', 'Reference: =CONCATENATE(TRIM(A2),"-",TRIM(B3))', '参考：=CONCATENATE(TRIM(A2),"-",TRIM(B3))'), formula: '=CONCATENATE(TRIM(A2),"-",TRIM(B3))', requiredFunctions: ["CONCATENATE", "TRIM"] }),
            task({ id: "text-import-4", sheet: textClean, target: "G6", taskLabel: common.audit, title: L("大小写无关的区域查找", "Case-insensitive region search", "大文字小文字を区別しない地域検索"), lead: L("在 G6 用 SEARCH 在 F3 中找 NA。", "In G6, use SEARCH to find NA in F3.", "G6 で SEARCH を使い F3 の NA を探します。"), hint: L('参考：=SEARCH("NA",F3)', 'Reference: =SEARCH("NA",F3)', '参考：=SEARCH("NA",F3)'), formula: '=SEARCH("NA",F3)', requiredFunctions: ["SEARCH"] }),
            task({ id: "text-import-5", sheet: textClean, target: "G7", taskLabel: common.audit, title: L("清理后姓名的长度", "Length of a cleaned name", "整形後の氏名の長さ"), lead: L("在 G7 清理 A5 后取长度，结果应是数字。", "In G7, clean A5 then measure its length. The result should be numeric.", "G7 で A5 を整えてから長さを数えます。"), hint: L("参考：=LEN(TRIM(A5))", "Reference: =LEN(TRIM(A5))", "参考：=LEN(TRIM(A5))"), formula: "=LEN(TRIM(A5))", requiredFunctions: ["LEN", "TRIM"] }),
            task({ id: "text-import-6", sheet: textClean, target: "G8", taskLabel: common.audit, title: L("部门名是否可直接交付", "Can the department name be delivered as-is?", "部署名をそのまま納品できるか"), lead: L("在 G8 清理 B4 并判断是否至少两个字符，返回 PASS 或 REVIEW。", "In G8, clean B4 and test whether it has at least two characters. Return PASS or REVIEW.", "G8 で B4 を整え、2文字以上か判定します。PASS か REVIEW を返します。"), hint: L('参考：=IF(LEN(TRIM(B4))>=2,"PASS","REVIEW")', 'Reference: =IF(LEN(TRIM(B4))>=2,"PASS","REVIEW")', '参考：=IF(LEN(TRIM(B4))>=2,"PASS","REVIEW")'), formula: '=IF(LEN(TRIM(B4))>=2,"PASS","REVIEW")', requiredFunctions: ["IF", "LEN", "TRIM"] }),
          ],
          hint: L("清理后先看预览结果，再决定外层是输出数字、PASS/REVIEW，还是长度。", "Check the cleaned preview, then decide whether the outer layer returns a number, PASS/REVIEW, or a length.", "整えた結果を確認し、外側で数値、PASS/REVIEW、長さのどれを返すか決めます。"),
        }),
        practice({
          id: "text-audit-final",
          title: L("文本章节最终抽题", "Text chapter final draw", "文字処理章の最終ランダム問題"),
          lead: L("你会随机遇到编号提取、格式清理或混合统计。保持“先取文本、再计算、最后判断”的顺序。", "You will randomly receive extraction, cleanup, or mixed statistics. Keep the order: get text, calculate, then decide.", "抽出、整形、混合集計のいずれかがランダムに出ます。文字を取る、計算する、判定する順序を守ります。"),
          sheet: textData,
          tasks: textAuditTasks("text-audit-final"),
          hint: L("如果结果不是预期，先单独检查最内层文本函数是否正确。", "If the result is off, inspect the innermost text function first.", "結果が違う場合は、最も内側の文字関数を先に確認します。"),
        }),
      ], { xp: 45 }),
    ],
  });
})();

