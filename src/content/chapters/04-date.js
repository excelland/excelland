(function () {
  "use strict";

  const D = window.CourseData;
  const K = window.CurriculumKit;
  const L = K.L;
  const task = K.task;
  const datePlan = K.sheets.datePlan;

  function learn(id, title, lead, points, tip, example, extra) {
    return D.learnStep(id, title, lead, points, tip, example, extra);
  }

  function practice(spec) {
    return K.sheetStep(spec);
  }

  function level(id, kind, title, steps, extra) {
    return Object.assign({ id, kind, title, steps }, extra || {});
  }

  datePlan.G1 = L("分析结果", "Analysis result", "分析結果");
  datePlan.H1 = L("工期/结果", "Duration / result", "期間・結果");
  datePlan.I1 = L("复核结论", "Review result", "確認結果");

  const labels = {
    parts: L("日期拆分", "Date parts", "日付の分解"),
    duration: L("工期计算", "Duration", "期間計算"),
    review: L("日期复核", "Date review", "日付の確認"),
  };

  function buildTasks(prefix, specs) {
    return specs.map((spec) => task({
      id: prefix + "-" + spec.key,
      sheet: spec.sheet || datePlan,
      target: spec.target,
      taskLabel: spec.taskLabel || labels.parts,
      title: spec.title,
      lead: spec.lead,
      hint: spec.hint,
      success: spec.success,
      formula: spec.formula,
      requiredFunctions: spec.functions,
    }));
  }

  function partsTasks(prefix) {
    return buildTasks(prefix, [
      {
        key: "year-start", target: "G2", formula: "=YEAR(B2)", functions: ["YEAR"],
        title: L("从开始日期取出年份", "Get the year from a start date", "開始日から年を取り出す"),
        lead: L("在 G2 用 YEAR 读取 B2 的年份。日期可以拆成单独的年、月、日。", "In G2, use YEAR on B2. A date can be split into separate year, month, and day parts.", "G2 で B2 を YEAR で読み取ります。日付は年・月・日に分解できます。"),
        success: L("YEAR 返回数字 2026，不是文本。", "YEAR returns the number 2026, not text.", "YEAR は文字列ではなく数値 2026 を返します。"),
      },
      {
        key: "month-design", target: "G3", formula: "=MONTH(B3)", functions: ["MONTH"],
        title: L("取方案设计的开始月份", "Get the design start month", "設計開始の月を取り出す"),
        lead: L("在 G3 用 MONTH 读取 B3 的月份。1 月返回数字 1。", "In G3, use MONTH on B3. January returns the number 1.", "G3 で B3 の月を MONTH で求めます。1月は数値1になります。"),
      },
      {
        key: "day-dev-due", target: "G4", formula: "=DAY(C4)", functions: ["DAY"],
        title: L("取开发截止日中的“日”", "Get the day from the development due date", "開発期限の日を取り出す"),
        lead: L("在 G4 用 DAY 读取 C4 的日序号。它只取一个月中的第几天。", "In G4, use DAY on C4. It returns the day within the month.", "G4 で C4 を DAY で読みます。月内の日だけを返します。"),
      },
      {
        key: "year-review", target: "G5", formula: "=YEAR(C5)", functions: ["YEAR"],
        title: L("取上线培训截止年份", "Get the launch-training due year", "研修期限の年を取り出す"),
        lead: L("在 G5 读取 C5 的年份。先看日期，再选 YEAR。", "In G5, read the year from C5. Inspect the date first, then choose YEAR.", "G5 で C5 の年を読み取ります。"),
      },
      {
        key: "month-accept", target: "G6", formula: "=MONTH(C6)", functions: ["MONTH"],
        title: L("取验收复盘的月份", "Get the acceptance-review month", "受入レビューの月を取り出す"),
        lead: L("在 G6 用 MONTH 读取 C6 的月份，为后续判断季度做准备。", "In G6, use MONTH on C6 to prepare for a quarter decision later.", "G6 で C6 の月を MONTH で求めます。"),
      },
      {
        key: "day-accept-start", target: "G7", formula: "=DAY(B7)", functions: ["DAY"],
        title: L("取验收复盘开始日", "Get the acceptance-review start day", "受入レビュー開始日を取り出す"),
        lead: L("在 G7 读取 B7 的日序号。", "In G7, read the day number from B7.", "G7 で B7 の日を読み取ります。"),
      },
      {
        key: "text-iso", target: "G8", formula: '=TEXT(B2,"yyyy-mm-dd")', functions: ["TEXT"],
        title: L("把开始日期排成统一格式", "Format the start date consistently", "開始日を統一形式で表示"),
        lead: L("在 G8 用 TEXT 把 B2 排成 yyyy-mm-dd，适合放进文件名或邮件。", "In G8, use TEXT to format B2 as yyyy-mm-dd for filenames or email.", "G8 で TEXT を使い B2 を yyyy-mm-dd 形式にします。"),
        hint: L('参考：=TEXT(B2,"yyyy-mm-dd")', 'Reference: =TEXT(B2,"yyyy-mm-dd")', '参考：=TEXT(B2,"yyyy-mm-dd")'),
      },
      {
        key: "text-length", target: "G9", formula: '=LEN(TEXT(C2,"yyyy-mm-dd"))', functions: ["LEN", "TEXT"],
        title: L("检查统一格式的字符数", "Check the normalized date length", "統一形式の文字数を確認"),
        lead: L("在 G9 先格式化 C2，再用 LEN 数长度。复习文本函数与日期格式的组合。", "In G9, format C2, then measure it with LEN. Combine text functions with date formatting.", "G9 で C2 を整形してから LEN で長さを数えます。"),
      },
    ]);
  }

  function durationTasks(prefix) {
    return buildTasks(prefix, [
      {
        key: "req-days", target: "H2", formula: "=C2-B2", taskLabel: labels.duration,
        title: L("需求确认用了几天", "Days for requirement sign-off", "要件確認の日数"),
        lead: L("在 H2 用截止日期 C2 减开始日期 B2。日期相减得到相隔天数。", "In H2, subtract B2 from C2. Date subtraction returns elapsed days.", "H2 で期限 C2 から開始 B2 を引きます。日付の差が日数になります。"),
        success: L("两个日期相减，Excel 得到的是天数。", "Dates subtract to a day count.", "日付の差は日数になります。"),
      },
      {
        key: "design-days", target: "H3", formula: "=C3-B3", taskLabel: labels.duration,
        title: L("方案设计工期", "Design duration", "設計期間"),
        lead: L("在 H3 计算方案设计从开始到截止的间隔天数。", "In H3, calculate elapsed days from design start to due.", "H3 で設計開始から期限までの日数を計算します。"),
      },
      {
        key: "dev-days", target: "H4", formula: "=C4-B4", taskLabel: labels.duration,
        title: L("开发实施的实际跨度", "Elapsed span of development", "開発実施の経過日数"),
        lead: L("在 H4 用 C4-B4 计算开发跨度。跨月份仍会给出正确天数。", "In H4, use C4-B4. The day count remains correct across months.", "H4 で C4-B4 を計算します。月をまたいでも正しい日数です。"),
      },
      {
        key: "test-days", target: "H5", formula: "=C5-B5", taskLabel: labels.duration,
        title: L("联调测试工期", "Integration-test duration", "結合テスト期間"),
        lead: L("在 H5 计算联调测试的跨度天数。", "In H5, calculate the integration-test duration.", "H5 で結合テストの期間を計算します。"),
      },
      {
        key: "training-days", target: "H6", formula: "=C6-B6", taskLabel: labels.duration,
        title: L("上线培训工期", "Launch-training duration", "研修期間"),
        lead: L("在 H6 用截止日减开始日，核对培训安排。", "In H6, subtract start from due to check training.", "H6 で期限から開始日を引き、研修日程を確認します。"),
      },
      {
        key: "review-days", target: "H7", formula: "=C7-B7", taskLabel: labels.duration,
        title: L("验收复盘工期", "Acceptance-review duration", "受入レビュー期間"),
        lead: L("在 H7 计算验收复盘的间隔天数。", "In H7, calculate the acceptance-review duration.", "H7 で受入レビューの期間を計算します。"),
      },
      {
        key: "quarter-days", target: "H8", formula: "=DATE(2026,4,1)-DATE(2026,1,1)", functions: ["DATE"],
        taskLabel: labels.duration,
        title: L("构造两个日期并算第一季度天数", "Build two dates and count first-quarter days", "2つの日付から第1四半期の日数を求める"),
        lead: L("在 H8 用 DATE 构造 2026 年 4 月 1 日和 1 月 1 日，再相减。", "In H8, build April 1 and January 1, 2026 with DATE, then subtract.", "H8 で DATE を使い2026年4月1日と1月1日を作り、引きます。"),
        hint: L("参考：=DATE(2026,4,1)-DATE(2026,1,1)", "Reference: =DATE(2026,4,1)-DATE(2026,1,1)", "参考：=DATE(2026,4,1)-DATE(2026,1,1)"),
      },
      {
        key: "date-code", target: "H9", formula: "=YEAR(DATE(2026,4,1))*100+MONTH(DATE(2026,4,1))", functions: ["YEAR", "MONTH", "DATE"],
        taskLabel: labels.duration,
        title: L("把 2026 年 4 月编成年月码", "Create a year-month code for April 2026", "2026年4月を年月コードにする"),
        lead: L("在 H9 用 DATE、YEAR、MONTH 生成 202604，作为报表分组码。", "In H9, use DATE, YEAR, and MONTH to produce 202604 for report grouping.", "H9 で DATE、YEAR、MONTH を使い 202604 を作ります。"),
      },
    ]);
  }

  function mixedTasks(prefix) {
    return buildTasks(prefix, [
      {
        key: "weekly-req", target: "I2", formula: "=ROUND((C2-B2)/7,0)", functions: ["ROUND"], taskLabel: labels.review,
        title: L("需求阶段折合几周", "Convert requirement days to weeks", "要件期間を週に換算"),
        lead: L("在 I2 先算 C2-B2，再除 7 并取整，汇报为周数。", "In I2, calculate C2-B2, divide by 7, and round to weeks.", "I2 で C2-B2 を求め、7で割って丸め、週数にします。"),
      },
      {
        key: "design-check", target: "I3", formula: '=IF(C3-B3>14,"REVIEW","OK")', functions: ["IF"], taskLabel: labels.review,
        title: L("设计工期超过两周就复核", "Review design work over two weeks", "設計期間が2週間超なら確認"),
        lead: L("在 I3 用日期差判断是否大于 14 天，返回 REVIEW 或 OK。", "In I3, test whether the date difference exceeds 14 days and return REVIEW or OK.", "I3 で日付差が14日超かを判定し、REVIEW か OK を返します。"),
      },
      {
        key: "quarter-check", target: "I4", formula: '=IF(MONTH(B4)<=3,"Q1","LATER")', functions: ["IF", "MONTH"], taskLabel: labels.review,
        title: L("开发是否在三月前启动", "Did development start by March?", "開発開始は3月以前か"),
        lead: L("在 I4 用 MONTH 判断 B4 的月份是否不晚于 3 月。", "In I4, test whether B4's month is no later than March.", "I4 で B4 の月が3月以前かを判定します。"),
      },
      {
        key: "sum-durations", target: "I5", formula: "=SUM(C2-B2,C3-B3)", functions: ["SUM"], taskLabel: labels.review,
        title: L("前两个阶段的总工期", "Total duration of the first two phases", "最初の2段階の合計期間"),
        lead: L("在 I5 把两段日期差分别算出来，再交给 SUM 汇总。", "In I5, calculate two date differences, then SUM them.", "I5 で2つの日付差を求め、SUM で合計します。"),
      },
      {
        key: "average-duration", target: "I6", formula: "=ROUND(AVERAGE(C2-B2,C3-B3),0)", functions: ["ROUND", "AVERAGE"], taskLabel: labels.review,
        title: L("前两阶段平均工期", "Average duration of the first two phases", "最初の2段階の平均期間"),
        lead: L("在 I6 求两段日期差的平均并取整，复习 AVERAGE 与 ROUND。", "In I6, average two date differences and round, reusing AVERAGE and ROUND.", "I6 で2つの日付差の平均を求め、丸めます。"),
      },
      {
        key: "dev-weeks", target: "I7", formula: "=ROUND((C4-B4)/7,0)", functions: ["ROUND"], taskLabel: labels.review,
        title: L("开发跨度折合整周", "Round the development span to weeks", "開発期間を週単位に丸める"),
        lead: L("在 I7 计算开发跨度并除以 7，保留整数周。", "In I7, calculate development span and divide by 7 to whole weeks.", "I7 で開発期間を7で割り、整数週にします。"),
      },
      {
        key: "and-year-month", target: "I8", formula: "=IF(AND(YEAR(B5)=2026,MONTH(B5)=3),1,0)", functions: ["IF", "AND", "YEAR", "MONTH"], taskLabel: labels.review,
        title: L("确认联调是否在 2026 年 3 月开始", "Check for a March 2026 test start", "2026年3月開始かを確認"),
        lead: L("在 I8 用 AND 同时验证年份和月份，成立返回 1。", "In I8, use AND for year and month and return 1 when both hold.", "I8 で AND を使い年と月を同時に確認し、成立時に1を返します。"),
      },
      {
        key: "accept-day-diff", target: "I9", formula: "=DAY(C6)-DAY(B6)", functions: ["DAY"], taskLabel: labels.review,
        title: L("只看开始与截止的日序号差", "Compare start and due day numbers only", "開始日と期限日の日番号だけを比較"),
        lead: L("在 I9 用 DAY 分别取出 C6、B6 的日序号再相减。体会它和完整日期差的不同。", "In I9, subtract DAY(B6) from DAY(C6) and notice how it differs from a full date difference.", "I9 で C6 と B6 の日番号を DAY で取り、差を求めます。"),
      },
    ]);
  }

  D.registerChapter({
    id: "ch07-dates",
    icon: "07",
    title: L("第 7 章 · 日期不是普通文字", "Chapter 7 · Dates Are More Than Text", "第7章 · 日付は普通の文字ではない"),
    subtitle: L("从年、月、日三个零件开始，到计算工期、生成年月码，再把日期接入 IF、SUM 与取整。每一步都围绕项目排期表完成。", "Start with year, month, and day, then calculate durations and build year-month codes. Connect dates to IF, SUM, and rounding around a real project schedule.", "年・月・日から始め、期間計算、年月コード、IF・SUM・丸めまで段階的に学びます。プロジェクト日程表を題材にします。"),
    levels: [
      level("date-parts", "lesson", L("拆开日期：YEAR、MONTH、DAY、TEXT", "Unpack Dates with YEAR, MONTH, DAY, and TEXT", "日付を分解：YEAR・MONTH・DAY・TEXT"), [
        learn(
          "brief-date-parts",
          L("项目经理要知道每个阶段落在几月", "The project manager needs each phase's month", "プロジェクト責任者が各段階の月を知りたい"),
          L("排期表里已经有开始和截止日期。今天先只做一个动作：从日期里取出年份、月份或日序号。先认识“零件”，后面才能算工期。", "The schedule already has start and due dates. Today, extract only the year, month, or day number. Understand the parts before calculating durations.", "日程表には開始日と期限があります。まず年・月・日を個別に取り出します。部品を理解してから期間計算へ進みます。"),
          [
            L("YEAR 取年份，MONTH 取月份，DAY 取日序号", "YEAR returns the year, MONTH the month, and DAY the day number", "YEAR は年、MONTH は月、DAY は日を返します"),
            L("结果都是数字，可以直接比较和计算", "The results are numbers and can be compared or calculated", "結果は数値なので比較や計算に使えます"),
            L("TEXT 把日期变成指定格式的文本", "TEXT turns a date into text in a specified format", "TEXT は日付を指定書式の文字列に変えます"),
            L("格式文本适合文件名和邮件，不适合继续做日期减法", "Formatted text suits filenames and email, not further date subtraction", "書式付き文字列はファイル名向きで、日付の減算には向きません"),
          ],
          L("先确认单元格里是真正的日期，而不是手动输入的普通文字。预览结果会帮你发现格式问题。", "Confirm the cell contains a real date, not typed plain text. The preview reveals format problems.", "セルが本物の日付か、単なる文字列かを確認します。プレビューで形式の問題が分かります。"),
          "=YEAR(B2)"
        ),
        practice({
          id: "date-parts-guided",
          title: L("从排期日期中取出年月日", "Extract year, month, and day from schedule dates", "日程から年・月・日を取り出す"),
          lead: L("随机题会在 YEAR、MONTH、DAY 和 TEXT 之间切换。先看日期所在列，再看题目要哪个零件。", "Random tasks switch among YEAR, MONTH, DAY, and TEXT. Check the date column and the requested part.", "YEAR、MONTH、DAY、TEXT がランダムに出ます。日付の列と必要な部品を確認します。"),
          sheet: datePlan,
          tasks: partsTasks("date-parts-guided"),
          hint: L("YEAR(B2) 只返回年份，不会把整串日期带出来。", "YEAR(B2) returns only the year, not the whole date.", "YEAR(B2) は年だけを返します。"),
        }),
        practice({
          id: "date-parts-transfer",
          title: L("日期零件接入旧公式", "Feed date parts into earlier formulas", "日付の部品を既習数式に入れる"),
          lead: L("这一组把 MONTH、YEAR 与 IF、AND、算术组合，开始做真正的排期判断。", "This set combines MONTH and YEAR with IF, AND, and arithmetic for real schedule decisions.", "MONTH・YEAR を IF・AND・四則演算と組み合わせ、実務的な日程判定に進みます。"),
          sheet: datePlan,
          tasks: [
            task({ id: "date-transfer-1", sheet: datePlan, target: "I2", taskLabel: labels.review, title: L("需求是否在一月上启动", "Did requirements start in January?", "要件は1月開始か"), lead: L("在 I2 用 MONTH 判断 B2 是否等于 1，返回 YES 或 NO。", "In I2, test whether B2's month is 1 and return YES or NO.", "I2 で B2 の月が1かを判定し、YES か NO を返します。"), hint: L('参考：=IF(MONTH(B2)=1,"YES","NO")', 'Reference: =IF(MONTH(B2)=1,"YES","NO")', '参考：=IF(MONTH(B2)=1,"YES","NO")'), formula: '=IF(MONTH(B2)=1,"YES","NO")', requiredFunctions: ["IF", "MONTH"] }),
            task({ id: "date-transfer-2", sheet: datePlan, target: "I3", taskLabel: labels.review, title: L("截止年份乘 100 加月份", "Year times 100 plus month", "年に100を掛けて月を足す"), lead: L("在 I3 用 YEAR 和 MONTH 为 C3 生成年月码。", "In I3, build a year-month code for C3 with YEAR and MONTH.", "I3 で YEAR と MONTH を使い C3 の年月コードを作ります。"), hint: L("参考：=YEAR(C3)*100+MONTH(C3)", "Reference: =YEAR(C3)*100+MONTH(C3)", "参考：=YEAR(C3)*100+MONTH(C3)"), formula: "=YEAR(C3)*100+MONTH(C3)", requiredFunctions: ["YEAR", "MONTH"] }),
            task({ id: "date-transfer-3", sheet: datePlan, target: "I4", taskLabel: labels.review, title: L("开始月份是否在上半年", "Is the start month in the first half?", "開始月は上半期か"), lead: L("在 I4 用 MONTH 判断 B4 是否小于等于 6。", "In I4, test whether B4's month is at most 6.", "I4 で B4 の月が6以下かを判定します。"), hint: L('参考：=IF(MONTH(B4)<=6,"H1","H2")', 'Reference: =IF(MONTH(B4)<=6,"H1","H2")', '参考：=IF(MONTH(B4)<=6,"H1","H2")'), formula: '=IF(MONTH(B4)<=6,"H1","H2")', requiredFunctions: ["IF", "MONTH"] }),
            task({ id: "date-transfer-4", sheet: datePlan, target: "I5", taskLabel: labels.review, title: L("用日序号判断月底附近", "Use the day number to flag month-end", "日番号で月末付近を判定"), lead: L("在 I5 用 DAY 判断 B5 的日序号是否大于 20。", "In I5, test whether B5's day number exceeds 20.", "I5 で B5 の日が20超かを判定します。"), hint: L('参考：=IF(DAY(B5)>20,"LATE MONTH","EARLY")', 'Reference: =IF(DAY(B5)>20,"LATE MONTH","EARLY")', '参考：=IF(DAY(B5)>20,"LATE MONTH","EARLY")'), formula: '=IF(DAY(B5)>20,"LATE MONTH","EARLY")', requiredFunctions: ["IF", "DAY"] }),
            task({ id: "date-transfer-5", sheet: datePlan, target: "I6", taskLabel: labels.review, title: L("年月日和文本拼接", "Join year, month, and day as text", "年・月・日を文字で結合"), lead: L("在 I6 用 CONCATENATE、YEAR、MONTH、DAY 拼出 2026-1-5 形式。", "In I6, use CONCATENATE, YEAR, MONTH, and DAY to build 2026-1-5.", "I6 で CONCATENATE、YEAR、MONTH、DAY を使い 2026-1-5 形式を作ります。"), hint: L('参考：=CONCATENATE(YEAR(B2),"-",MONTH(B2),"-",DAY(B2))', 'Reference: =CONCATENATE(YEAR(B2),"-",MONTH(B2),"-",DAY(B2))', '参考：=CONCATENATE(YEAR(B2),"-",MONTH(B2),"-",DAY(B2))'), formula: '=CONCATENATE(YEAR(B2),"-",MONTH(B2),"-",DAY(B2))', requiredFunctions: ["CONCATENATE", "YEAR", "MONTH", "DAY"] }),
          ],
          hint: L("日期零件先变成数字，再进入判断或拼接。TEXT 只在需要固定显示格式时使用。", "Convert date parts to numbers before decisions or joins. Use TEXT only for a fixed display format.", "日付の部品を数値にしてから判定や結合に使います。TEXT は表示形式を固定したいときだけ使います。"),
        }),
        practice({
          id: "date-parts-check",
          title: L("日期零件收尾抽题", "Date-parts checkpoint", "日付部品の仕上げ"),
          lead: L("随机复习 YEAR、MONTH、DAY、TEXT 与旧的条件判断。", "Randomly review YEAR, MONTH, DAY, TEXT, and prior decisions.", "YEAR、MONTH、DAY、TEXT、既習の条件判定をランダムに復習します。"),
          sheet: datePlan,
          tasks: partsTasks("date-parts-check"),
          hint: L("如果返回整串日期，说明用了错误函数；如果返回文本，后续就不能直接做日期减法。", "Returning the whole date means the wrong function; returning text prevents further date subtraction.", "日付全体が返るなら関数違い、文字列が返ると日付減算には使えません。"),
        }),
      ], { xp: 35 }),

      level("date-duration", "lesson", L("日期相减：工期、周数与日期构造", "Date Math: Durations, Weeks, and DATE", "日付計算：期間・週数・DATE"), [
        learn(
          "brief-date-duration",
          L("主管问每个阶段要花几天", "The manager asks how many days each phase takes", "上司が各段階の日数を尋ねる"),
          L("开始和截止日期都在表里。今天只学一件事：截止减开始得到天数。再把天数换算成周数，或用 DATE 构造一个新日期。", "Start and due dates are already in the sheet. Learn one core move: due minus start yields days. Then convert days to weeks or build dates with DATE.", "開始日と期限は表にあります。まず期限−開始で日数を求め、週数換算や DATE による日付作成へ進みます。"),
          [
            L("截止日期减开始日期，得到相隔天数", "Due date minus start date returns elapsed days", "期限日から開始日を引くと経過日数になります"),
            L("DATE(年,月,日) 可以按三个数字构造日期", "DATE(year, month, day) constructs a date", "DATE(年,月,日) で日付を作れます"),
            L("除以 7 可以换算周数，再用 ROUND 取整", "Divide by 7 for weeks, then ROUND", "7で割って週数にし、ROUND で丸めます"),
            L("日期差仍然是数字，可以放进 SUM、AVERAGE 和 IF", "A duration is still a number and can feed SUM, AVERAGE, or IF", "期間は数値なので SUM・AVERAGE・IF に使えます"),
          ],
          L("不要用“看起来是几号”心算。直接让两个日期相减，跨月时会自动按真实天数计算。", "Do not estimate from the displayed day number. Subtract the dates so month boundaries are handled correctly.", "表示された日から暗算せず、日付同士を引き算します。月をまたいでも正しい日数になります。"),
          "=C2-B2"
        ),
        practice({
          id: "date-duration-guided",
          title: L("每个阶段的实际天数", "Actual days for each phase", "各段階の実日数"),
          lead: L("随机抽一个阶段，计算它的开始到截止间隔。", "A random phase is chosen; calculate its start-to-due duration.", "ランダムな段階の開始から期限までの日数を計算します。"),
          sheet: datePlan,
          tasks: durationTasks("date-duration-guided"),
          hint: L("日期相减的顺序是“后减前”：截止日期在前，开始日期在后。", "Subtract in chronological order: due date minus start date.", "時系列順に「後−前」で引きます。期限−開始です。"),
        }),
        practice({
          id: "date-duration-transfer",
          title: L("把工期变成周数、平均值和判断", "Turn durations into weeks, averages, and decisions", "期間を週数・平均・判定に変える"),
          lead: L("这一组会继续使用旧知识：除法、ROUND、AVERAGE、IF、AND。", "This set reuses division, ROUND, AVERAGE, IF, and AND.", "除算、ROUND、AVERAGE、IF、AND を復習しながら進めます。"),
          sheet: datePlan,
          tasks: mixedTasks("date-duration-transfer"),
          hint: L("先算完整工期，再在外面除 7、取整或判断。", "Calculate the full duration first, then divide, round, or test outside it.", "まず期間を求め、その外側で割り算・丸め・判定を行います。"),
        }),
        practice({
          id: "date-duration-check",
          title: L("工期计算收尾抽题", "Duration checkpoint", "期間計算の仕上げ"),
          lead: L("随机练习日期差、DATE 构造和年月码，后面会继续进入综合排期。", "Randomly practice date differences, DATE construction, and year-month codes.", "日付差、DATE、年月コードをランダムに復習します。"),
          sheet: datePlan,
          tasks: durationTasks("date-duration-check"),
          hint: L("日期差是数字，不要在公式里加引号。", "A date difference is numeric; do not wrap it in quotes.", "日付差は数値なので引用符で囲みません。"),
        }),
      ], { xp: 40 }),

      level("date-review", "review", L("项目排期综合复盘", "Project Schedule Review", "プロジェクト日程の総合復習"), [
        learn(
          "brief-date-review",
          L("周会上需要解释每个阶段的进度", "The weekly meeting needs a phase-by-phase status", "週次会議で各段階の進捗を説明する"),
          L("主管不只问“几号开始”，还会问“用了几天”“折合几周”“是否超出两周”“能不能按月分组”。你要把日期函数和之前的 IF、SUM、ROUND、TEXT 连起来。", "The manager asks not only when each phase starts, but how many days or weeks it takes, whether it exceeded two weeks, and how to group by month. Combine date functions with IF, SUM, ROUND, and TEXT.", "上司は開始日だけでなく、日数、週数、2週間超過、月別のまとめも尋ねます。日付関数を IF・SUM・ROUND・TEXT と組み合わせます。"),
          [
            L("先确认结果要“日期”还是“天数/周数”", "Decide whether the result is a date or a duration", "結果が日付か期間かを先に決めます"),
            L("日期差可继续汇总、求平均或套 IF", "Durations can feed SUM, AVERAGE, or IF", "期間は SUM・AVERAGE・IF に使えます"),
            L("TEXT 适合交付格式，计算仍用原始日期", "Use TEXT for presentation; keep dates for calculations", "TEXT は表示用、計算には元の日付を使います"),
            L("所有公式先在预览中验算，再写入汇报", "Verify in preview before putting numbers into a report", "プレビューで確認してから報告に使います"),
          ],
          L("场景里的主要风险通常不是函数名，而是把日期格式文本当天数、把日序号当完整日期。", "The main risk is treating formatted text as a duration or a day number as a full date.", "主な注意点は、書式付き文字列を期間と混同したり、日番号を完全な日付と混同することです。"),
          "=ROUND((C4-B4)/7,0)"
        ),
        practice({
          id: "date-review-main",
          title: L("排期复盘：阶段工期与超期提醒", "Schedule review: durations and overrun alerts", "日程レビュー：期間と超過通知"),
          lead: L("随机题会把日期差、周数、条件判断和平均值混合。先读业务问题，再决定公式层级。", "Random tasks mix date differences, weeks, decisions, and averages. Read the business question first, then choose formula layers.", "日付差、週数、条件判定、平均を混ぜて出題します。業務の問いを読んでから数式の階層を決めます。"),
          sheet: datePlan,
          tasks: mixedTasks("date-review-main"),
          hint: L("“用了几天”是日期差；“第几周”才是除 7 后取整。", "Days used means a date difference; weeks means dividing by 7 and rounding.", "「何日」は日付差、「何週」は7で割って丸めた値です。"),
        }),
        practice({
          id: "date-review-scenario",
          title: L("项目周报：同一张排期表的多项汇报", "Project weekly report: several numbers from one schedule", "プロジェクト週報：同じ日程表から複数報告"),
          lead: L("同一张排期表上，随机抽一个汇报任务。每次只替换目标单元格和业务条件。", "One reporting task is drawn from the same schedule at a time, changing the target and business condition.", "同じ日程表から1つの報告課題をランダムに出題します。"),
          sheet: datePlan,
          tasks: [
            task({ id: "date-scenario-1", sheet: datePlan, target: "G2", taskLabel: labels.review, title: L("全部阶段的总天数", "Total days across all phases", "全段階の合計日数"), lead: L("在 G2 计算 C2-B2、C3-B3、C4-B4 三段工期并相加。", "In G2, calculate three phase durations and add them.", "G2 で3段階の期間を計算して合計します。"), hint: L("参考：=SUM(C2-B2,C3-B3,C4-B4)", "Reference: =SUM(C2-B2,C3-B3,C4-B4)", "参考：=SUM(C2-B2,C3-B3,C4-B4)"), formula: "=SUM(C2-B2,C3-B3,C4-B4)", requiredFunctions: ["SUM"] }),
            task({ id: "date-scenario-2", sheet: datePlan, target: "G3", taskLabel: labels.review, title: L("开发阶段是否超过六周", "Did development exceed six weeks?", "開発は6週間を超えたか"), lead: L("在 G3 用 C4-B4 除以 7，再判断是否大于 6，返回 OVER 或 OK。", "In G3, divide C4-B4 by 7, then test whether it exceeds 6 and return OVER or OK.", "G3 で C4-B4 を7で割り、6超かを判定して OVER か OK を返します。"), hint: L('参考：=IF((C4-B4)/7>6,"OVER","OK")', 'Reference: =IF((C4-B4)/7>6,"OVER","OK")', '参考：=IF((C4-B4)/7>6,"OVER","OK")'), formula: '=IF((C4-B4)/7>6,"OVER","OK")', requiredFunctions: ["IF"] }),
            task({ id: "date-scenario-3", sheet: datePlan, target: "G4", taskLabel: labels.review, title: L("平均每阶段天数", "Average days per phase", "1段階あたりの平均日数"), lead: L("在 G4 求前三段工期的平均值并取整。", "In G4, average the first three durations and round.", "G4 で最初の3段階の平均日数を求め、丸めます。"), hint: L("参考：=ROUND(AVERAGE(C2-B2,C3-B3,C4-B4),0)", "Reference: =ROUND(AVERAGE(C2-B2,C3-B3,C4-B4),0)", "参考：=ROUND(AVERAGE(C2-B2,C3-B3,C4-B4),0)"), formula: "=ROUND(AVERAGE(C2-B2,C3-B3,C4-B4),0)", requiredFunctions: ["ROUND", "AVERAGE"] }),
            task({ id: "date-scenario-4", sheet: datePlan, target: "G5", taskLabel: labels.review, title: L("用统一 ISO 格式生成复盘标签", "Build a review label in ISO format", "ISO 形式のレビューラベルを作る"), lead: L("在 G5 先用 YEAR、MONTH、DAY 拼年月日，再用 TEXT 保证月日两位数。这里改为直接 TEXT(C6,\"yyyy-mm-dd\")。", "In G5, format C6 directly as yyyy-mm-dd with TEXT for a consistent review label.", "G5 で C6 を TEXT で yyyy-mm-dd にし、統一ラベルを作ります。"), hint: L('参考：=TEXT(C6,"yyyy-mm-dd")', 'Reference: =TEXT(C6,"yyyy-mm-dd")', '参考：=TEXT(C6,"yyyy-mm-dd")'), formula: '=TEXT(C6,"yyyy-mm-dd")', requiredFunctions: ["TEXT"] }),
            task({ id: "date-scenario-5", sheet: datePlan, target: "G6", taskLabel: labels.review, title: L("所有截止日期是否都在 2026 年", "Are all due dates in 2026?", "期限はすべて2026年か"), lead: L("在 G6 先构造 2026 年 1 月 1 日和 2027 年 1 月 1 日，再比较 C7 是否落在其中。用 AND 连接两个比较。", "In G6, build January 1, 2026 and 2027, then test whether C7 is within the interval with AND.", "G6 で2026年1月1日と2027年1月1日を作り、C7がその範囲かを AND で判定します。"), hint: L('参考：=IF(AND(C7>=DATE(2026,1,1),C7<DATE(2027,1,1)),"YES","NO")', 'Reference: =IF(AND(C7>=DATE(2026,1,1),C7<DATE(2027,1,1)),"YES","NO")', '参考：=IF(AND(C7>=DATE(2026,1,1),C7<DATE(2027,1,1)),"YES","NO")'), formula: '=IF(AND(C7>=DATE(2026,1,1),C7<DATE(2027,1,1)),"YES","NO")', requiredFunctions: ["IF", "AND", "DATE"] }),
            task({ id: "date-scenario-6", sheet: datePlan, target: "G7", taskLabel: labels.review, title: L("第 6 行开始日的年月码", "Year-month code for row 6's start date", "6行目開始日の年月コード"), lead: L("在 G7 用 YEAR 和 MONTH 为 B6 生成 202604 形式的年月码。", "In G7, build a 202604-style year-month code for B6 with YEAR and MONTH.", "G7 で YEAR と MONTH を使い B6 の年月コードを作ります。"), hint: L("参考：=YEAR(B6)*100+MONTH(B6)", "Reference: =YEAR(B6)*100+MONTH(B6)", "参考：=YEAR(B6)*100+MONTH(B6)"), formula: "=YEAR(B6)*100+MONTH(B6)", requiredFunctions: ["YEAR", "MONTH"] }),
          ],
          hint: L("同一工作簿的不同格子可以回答不同汇报问题，先确认目标地址，再选日期函数。", "Different cells answer different reporting questions. Confirm the target, then choose the date function.", "同じ表でもセルごとに別の報告を担当します。対象を確認して日付関数を選びます。"),
        }),
        practice({
          id: "date-review-final",
          title: L("日期章节最终抽题", "Date chapter final draw", "日付章の最終ランダム問題"),
          lead: L("最终随机混合日期拆分、工期、TEXT 与旧的条件逻辑。", "The final draw mixes date parts, durations, TEXT, and prior logic.", "日付の分解、期間、TEXT、既習の論理を混ぜて出題します。"),
          sheet: datePlan,
          tasks: partsTasks("date-review-final"),
          hint: L("结果类型先判断：是日期、天数、周数、年月码，还是一段文本？", "Identify the result type first: date, days, weeks, a year-month code, or text.", "結果の種類を先に判断します。日付、日数、週数、年月コード、文字列のどれかです。"),
        }),
      ], { xp: 45 }),
    ],
  });
})();


