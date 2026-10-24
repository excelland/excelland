(function () {
  "use strict";

  const D = window.CourseData;
  const K = window.CurriculumKit;
  const L = K.L;
  const task = K.task;
  const finance = K.sheets.finance;

  function learn(id, title, lead, points, tip, example, extra) {
    return D.learnStep(id, title, lead, points, tip, example, extra);
  }

  function practice(spec) {
    return K.sheetStep(spec);
  }

  function level(id, kind, title, steps, extra) {
    return Object.assign({ id, kind, title, steps }, extra || {});
  }

  finance.G1 = L("月供/测算结果", "Payment / result", "返済額・計算結果");
  finance.H1 = L("总还款/未来值", "Total / future value", "総返済・将来価値");
  finance.I1 = L("复核结论", "Review result", "確認結果");

  const labels = {
    payment: L("月供测算", "Payment calculation", "返済額計算"),
    growth: L("资金成长测算", "Growth calculation", "資金成長計算"),
    review: L("资金方案复核", "Funding review", "資金案の確認"),
  };

  function buildTasks(prefix, specs) {
    return specs.map((spec) => task({
      id: prefix + "-" + spec.key,
      sheet: finance,
      target: spec.target,
      taskLabel: spec.taskLabel || labels.payment,
      title: spec.title,
      lead: spec.lead,
      hint: spec.hint,
      success: spec.success,
      formula: spec.formula,
      requiredFunctions: spec.functions,
    }));
  }

  function paymentTasks(prefix) {
    return buildTasks(prefix, [
      {
        key: "store-payment", target: "G2", formula: "=-PMT(B2/12,C2,D2)", functions: ["PMT"],
        title: L("店面装修贷款的月供", "Monthly payment for the store loan", "店舗改装ローンの月額返済"),
        lead: L("在 G2 用 PMT 计算月供。年利率先除 12，期数用 C2，本金用 D2，最外面加负号让结果为正数。", "In G2, use PMT. Divide the annual rate by 12, use C2 periods and D2 principal, and negate the result for a positive payment.", "G2 で PMT を使います。年利率を12で割り、C2 を期間、D2 を元金にし、結果を正数にします。"),
        success: L("PMT 的三个核心参数是利率、期数、本金。", "PMT's core arguments are rate, periods, and present value.", "PMT の主要引数は利率、期間、現在価値です。"),
      },
      {
        key: "lease-payment", target: "G3", formula: "=-PMT(B3/12,C3,D3)", functions: ["PMT"],
        title: L("设备租赁每月要付多少", "Monthly equipment-lease payment", "機器リースの月額"),
        lead: L("在 G3 用同一结构计算设备租赁月供，只换目标行。", "In G3, use the same structure for the lease payment, changing only the row.", "G3 で同じ構造のまま行だけを変えてリース月額を求めます。"),
      },
      {
        key: "training-payment", target: "G4", formula: "=-PMT(B4/12,C4,D4)", functions: ["PMT"],
        title: L("培训贷款的月供", "Monthly training-loan payment", "研修ローンの月額返済"),
        lead: L("在 G4 计算培训贷款月供。注意期数 C4 是 12，不要套用其他行。", "In G4, calculate the training-loan payment. C4 is 12 periods; do not reuse another row's period.", "G4 で研修ローンの返済額を計算します。期間 C4 は12です。"),
      },
      {
        key: "vehicle-payment", target: "G5", formula: "=-PMT(B5/12,C5,D5)", functions: ["PMT"],
        title: L("仓储车辆的月供", "Monthly warehouse-vehicle payment", "倉庫車両の月額返済"),
        lead: L("在 G5 计算仓储车辆月供。", "In G5, calculate the warehouse-vehicle payment.", "G5 で倉庫車両の返済額を計算します。"),
      },
      {
        key: "rounded-payment", target: "G6", formula: "=ROUND(-PMT(B2/12,C2,D2),2)", functions: ["ROUND", "PMT"],
        title: L("店面月供保留两位小数", "Store payment rounded to cents", "店舗返済額を小数2桁に丸める"),
        lead: L("在 G6 先算店面月供，再用 ROUND 保留两位，模拟报价单上的金额。", "In G6, calculate the store payment and round to two decimals for a quote.", "G6 で店舗返済額を計算し、見積用に小数2桁へ丸めます。"),
      },
      {
        key: "total-repay", target: "G7", formula: "=-PMT(B2/12,C2,D2)*C2", functions: ["PMT"],
        title: L("店面贷款总共要还多少", "Total repayment for the store loan", "店舗ローンの総返済額"),
        lead: L("在 G7 用月供乘总期数，得到不考虑其他费用的总还款。", "In G7, multiply the monthly payment by the number of periods for total repayment.", "G7 で月額返済に期間を掛け、総返済額を求めます。"),
      },
      {
        key: "payment-diff", target: "G8", formula: "=-PMT(B2/12,C2,D2)+PMT(B3/12,C3,D3)", functions: ["PMT"],
        title: L("两项月供的差额", "Difference between two monthly payments", "2つの返済額の差"),
        lead: L("在 G8 计算店面月供与租赁月供的差额。注意 PMT 原始结果带负号，保持写法一致。", "In G8, compare the store and lease payments while keeping PMT signs consistent.", "G8 で店舗とリースの返済額の差を求めます。PMT の符号に注意します。"),
      },
      {
        key: "budget-check", target: "G9", formula: '=IF(-PMT(B5/12,C5,D5)>5000,"REVIEW","OK")', functions: ["IF", "PMT"],
        title: L("车辆月供超过 5000 就复核", "Review when vehicle payment exceeds 5000", "車両返済が5000超なら確認"),
        lead: L("在 G9 计算车辆月供，再判断是否大于 5000。", "In G9, calculate the vehicle payment and test for more than 5000.", "G9 で車両返済額を計算し、5000超かを判定します。"),
      },
    ]);
  }

  function growthTasks(prefix) {
    return buildTasks(prefix, [
      {
        key: "education-fv", target: "H2", formula: "=FV(B4/12,C4,0,-D4)", functions: ["FV"], taskLabel: labels.growth,
        title: L("教育储蓄十年后的未来值", "Future value of the education fund", "教育資金の10年後価値"),
        lead: L("在 H2 用 FV 计算教育储蓄未来值。月利率是 B4/12，期数 C4，本金以负值投入、未来值返回正值。", "In H2, use FV for the education fund. Monthly rate is B4/12, periods are C4, and principal is entered as a negative cash flow.", "H2 で FV を使い教育資金の将来価値を求めます。月利率 B4/12、期間 C4、元金はマイナスで投入します。"),
        success: L("FV 计算一笔本金在未来增长后的价值。", "FV calculates a principal's value after growth.", "FV は元金が成長した将来価値を計算します。"),
      },
      {
        key: "store-pv", target: "H3", formula: "=PV(B2/12,C2,-1000)", functions: ["PV"], taskLabel: labels.growth,
        title: L("每月能还 1000 时能借多少", "Loan amount supported by 1000 per month", "月1000返済で借りられる額"),
        lead: L("在 H3 用 PV 反推可借本金：月利率 B2/12，期数 C2，每期付款 -1000。", "In H3, use PV to derive principal from monthly rate B2/12, periods C2, and a -1000 payment.", "H3 で PV を使い、月利率 B2/12、期間 C2、毎月 -1000 から借入可能額を求めます。"),
      },
      {
        key: "rounded-fv", target: "H4", formula: "=ROUND(FV(B4/12,C4,0,-D4),0)", functions: ["ROUND", "FV"], taskLabel: labels.growth,
        title: L("教育储蓄未来值取整", "Round the education future value", "教育資金の将来価値を丸める"),
        lead: L("在 H4 计算教育储蓄未来值，再取整到元。", "In H4, calculate the education fund's future value and round to whole units.", "H4 で教育資金の将来価値を計算し、整数に丸めます。"),
      },
      {
        key: "lease-fv", target: "H5", formula: "=FV(B3/12,C3,-1000)", functions: ["FV"], taskLabel: labels.growth,
        title: L("设备基金每月存 1000 的未来值", "Future value of 1000 monthly into the equipment fund", "機器基金に毎月1000を積む将来価値"),
        lead: L("在 H5 用 FV 计算每月投入 1000 的设备基金，月利率 B3/12，期数 C3。", "In H5, use FV with 1000 monthly, monthly rate B3/12, and C3 periods.", "H5 で FV を使い、毎月1000、月利率 B3/12、期間 C3 の機器基金を計算します。"),
      },
      {
        key: "lease-pv", target: "H6", formula: "=PV(B3/12,C3,-2000)", functions: ["PV"], taskLabel: labels.growth,
        title: L("每月付 2000 的设备预算现值", "Present value of 2000 monthly for equipment", "毎月2000の機器予算の現在価値"),
        lead: L("在 H6 用 PV 计算设备方案每月付 2000 对应的现值。", "In H6, calculate the present value of a 2000 monthly equipment plan.", "H6 で毎月2000の機器案の現在価値を求めます。"),
      },
      {
        key: "total-interest", target: "H7", formula: "=-PMT(B2/12,C2,D2)*C2-D2", functions: ["PMT"], taskLabel: labels.review,
        title: L("店面贷款的总利息", "Total interest on the store loan", "店舗ローンの総利息"),
        lead: L("在 H7 先求总还款，再减去本金，得到总利息。", "In H7, calculate total repayment and subtract principal to find total interest.", "H7 で総返済額から元金を引き、総利息を求めます。"),
      },
      {
        key: "rounded-pv", target: "H8", formula: "=ROUND(PV(B4/12,C4,-500),0)", functions: ["ROUND", "PV"], taskLabel: labels.growth,
        title: L("每月 500 的储蓄目标现值", "Present value of 500 monthly savings", "毎月500貯蓄の現在価値"),
        lead: L("在 H8 用 PV 计算每月 500、利率 B4/12、期数 C4 的现值并取整。", "In H8, use PV for 500 monthly, rate B4/12, periods C4, then round.", "H8 で毎月500、利率 B4/12、期間 C4 の現在価値を求め、丸めます。"),
      },
      {
        key: "education-goal", target: "H9", formula: '=IF(FV(B4/12,C4,0,-D4)>7000,"GO","WAIT")', functions: ["IF", "FV"], taskLabel: labels.review,
        title: L("教育储蓄能否超过 7000", "Can the education fund exceed 7000?", "教育資金は7000を超えるか"),
        lead: L("在 H9 先算教育储蓄未来值，再判断是否大于 7000。", "In H9, calculate the education future value and test for more than 7000.", "H9 で教育資金の将来価値を計算し、7000超かを判定します。"),
      },
    ]);
  }

  function financeReviewTasks(prefix) {
    return buildTasks(prefix, [
      {
        key: "compare-payments", target: "G2", formula: "=ROUND(-PMT(B2/12,C2,D2)+PMT(B5/12,C5,D5),0)", functions: ["ROUND", "PMT"], taskLabel: labels.review,
        title: L("店面与车辆月供差多少", "Store versus vehicle monthly payment", "店舗と車両の月額差"),
        lead: L("在 G2 分别算两项月供，再相减并取整。", "In G2, calculate both payments, subtract, and round.", "G2 で2つの返済額を求め、差を取って丸めます。"),
      },
      {
        key: "interest-ratio", target: "G3", formula: "=ROUND((-PMT(B2/12,C2,D2)*C2-D2)/D2,2)", functions: ["ROUND", "PMT"], taskLabel: labels.review,
        title: L("店面总利息占本金比例", "Interest as a share of principal", "利息が元金に占める割合"),
        lead: L("在 G3 先算总利息，再除以本金，保留两位。", "In G3, calculate total interest, divide by principal, and round to two decimals.", "G3 で総利息を元金で割り、小数2桁に丸めます。"),
      },
      {
        key: "monthly-cap", target: "G4", formula: '=IF(-PMT(B4/12,C4,D4)<=3000,"PASS","REVIEW")', functions: ["IF", "PMT"], taskLabel: labels.review,
        title: L("培训月供是否控制在 3000 内", "Keep training payment within 3000", "研修返済を3000以内に収める"),
        lead: L("在 G4 计算培训月供，判断是否不超过 3000。", "In G4, calculate the training payment and test whether it is at most 3000.", "G4 で研修返済額を計算し、3000以下かを判定します。"),
      },
      {
        key: "combined-total", target: "G5", formula: "=SUM(-PMT(B2/12,C2,D2),-PMT(B3/12,C3,D3))", functions: ["SUM", "PMT"], taskLabel: labels.review,
        title: L("两项贷款的月供合计", "Combined monthly payments", "2件ローンの月額合計"),
        lead: L("在 G5 把店面与设备租赁的月供相加。用 SUM 汇总多个 PMT 结果。", "In G5, sum the store and lease payments with SUM.", "G5 で店舗とリースの返済額を SUM で合計します。"),
      },
      {
        key: "savings-target", target: "G6", formula: "=ROUND(PV(B4/12,C4,-1000),0)", functions: ["ROUND", "PV"], taskLabel: labels.growth,
        title: L("十年后每月拿 1000 的教育金现值", "Present value for 1000 monthly in ten years", "10年後に毎月1000を得るための現在価値"),
        lead: L("在 G6 用 PV 计算每月 1000、利率 B4/12、期数 C4 的现值并取整。", "In G6, use PV for 1000 monthly, rate B4/12, periods C4, then round.", "G6 で毎月1000、利率 B4/12、期間 C4 の現在価値を求め、丸めます。"),
      },
      {
        key: "future-gap", target: "G7", formula: "=ROUND(10000-FV(B4/12,C4,0,-D4),0)", functions: ["ROUND", "FV"], taskLabel: labels.review,
        title: L("教育目标还差多少钱", "How far is the education target?", "教育目標までの不足額"),
        lead: L("在 G7 用 10000 减去教育储蓄未来值，得到目标缺口。", "In G7, subtract the education future value from 10000.", "G7 で10000から教育資金の将来価値を引き、不足額を求めます。"),
      },
      {
        key: "payment-higher", target: "G8", formula: '=IF(-PMT(B2/12,C2,D2)>-PMT(B4/12,C4,D4),"STORE","TRAINING")', functions: ["IF", "PMT"], taskLabel: labels.review,
        title: L("哪项贷款的月供更高", "Which monthly payment is higher?", "どちらの返済額が高いか"),
        lead: L("在 G8 比较店面与培训月供，返回较高项目的英文标记。", "In G8, compare store and training payments and return the higher one's tag.", "G8 で店舗と研修の返済額を比べ、高い方のタグを返します。"),
      },
    ]);
  }

  D.registerChapter({
    id: "ch08-finance",
    icon: "08",
    title: L("第 8 章 · 用公式做资金方案", "Chapter 8 · Build Funding Plans with Formulas", "第8章 · 数式で資金計画を作る"),
    subtitle: L("先把月供算对，再理解未来值和现值，最后把利率、期数、预算判断和取整连起来。全程用同一张贷款测算表，不做脱离场景的记忆题。", "Calculate payments first, then understand future and present value, and finally combine rates, periods, budget checks, and rounding. Every task uses the same loan-planning sheet.", "まず返済額を正しく求め、将来価値と現在価値を学び、利率・期間・予算判定・丸めを組み合わせます。同じローン試算表を使います。"),
    levels: [
      level("finance-payment", "lesson", L("PMT：把贷款拆成每月付款", "PMT: Turn a Loan into Monthly Payments", "PMT：ローンを毎月の返済に分ける"), [
        learn(
          "brief-finance-payment",
          L("行政要比较四个资金方案", "Administration must compare four funding plans", "総務が4つの資金案を比較する"),
          L("资金方案表里有年利率、期数和本金。先用 PMT 算月供。不要背公式，记住三个输入：每期利率、总期数、本金。", "The funding table contains annual rates, periods, and principal. Use PMT for monthly payments. Remember three inputs: rate per period, total periods, and present value.", "資金表には年利率、期間、元金があります。PMT で月額返済を求めます。3つの入力、つまり期間利率、総期間、現在価値を覚えます。"),
          [
            L("年利率要先除以 12 才是月利率", "Divide the annual rate by 12 for a monthly rate", "年利率は12で割って月利率にします"),
            L("PMT 的原生结果通常带负号，因为付款是现金流出", "PMT is usually negative because payments are cash outflows", "PMT の結果は通常マイナスです"),
            L("最外层加负号可把月供显示为正数", "Add a leading minus sign to display a positive payment", "先頭に負号を付けると正の返済額になります"),
            L("期数、本金必须来自对应行，不能串行", "Periods and principal must come from the matching row", "期間と元金は同じ行から取得します"),
          ],
          L("先算一项，再到预览里看看数字像不像。月供突然大十倍，多半是年利率忘了除以 12。", "Calculate one row, then sanity-check it in the preview. A payment ten times too large usually means the annual rate was not divided by 12.", "まず1件を計算し、プレビューで数字の大きさを確認します。返済額が10倍なら年利率の12除算忘れが多いです。"),
          "=-PMT(B2/12,C2,D2)"
        ),
        practice({
          id: "finance-payment-guided",
          title: L("四个资金方案的月供", "Monthly payments for four funding plans", "4つの資金案の月額返済"),
          lead: L("随机抽一个项目，用该行的利率、期数和本金计算月供；也可能要求取整或与预算比较。", "A plan is chosen at random; use its rate, periods, and principal. Some tasks also round or compare with a budget.", "ランダムな案件の利率・期間・元金で返済額を計算し、丸めや予算比較も行います。"),
          sheet: finance,
          tasks: paymentTasks("finance-payment-guided"),
          hint: L("模板：=-PMT(年利率/12,期数,本金)。行号三项必须一致。", "Template: =-PMT(annual rate/12, periods, principal). Keep the row numbers aligned.", "型：=-PMT(年利率/12,期間,元金)。行番号を揃えます。"),
        }),
        practice({
          id: "finance-payment-transfer",
          title: L("月供与总还款、预算和差额", "Payments, total repayment, budget, and differences", "返済額・総返済・予算・差額"),
          lead: L("这一组把 PMT 结果继续用于乘法、减法、IF 判断，复习前几章的算术与条件逻辑。", "This set feeds PMT into multiplication, subtraction, and IF decisions, reusing earlier arithmetic and logic.", "PMT の結果を乗算・減算・IF 判定に使い、既習の演算と論理を復習します。"),
          sheet: finance,
          tasks: paymentTasks("finance-payment-transfer"),
          hint: L("如果题目问总还款，用月供乘期数；如果问差额，先分别算再相减。", "For total repayment, multiply the payment by periods. For a difference, calculate both first, then subtract.", "総返済は返済額×期間、差額はそれぞれ計算してから引きます。"),
        }),
        practice({
          id: "finance-payment-check",
          title: L("月供测算收尾", "Payment checkpoint", "返済額計算の仕上げ"),
          lead: L("随机复习 PMT 基本式、取整、总还款和预算复核。", "Randomly review the PMT pattern, rounding, total repayment, and budget checks.", "PMT の基本形、丸め、総返済、予算確認をランダムに復習します。"),
          sheet: finance,
          tasks: paymentTasks("finance-payment-check"),
          hint: L("先写内层 PMT，再在外面处理正负号、取整和判断。", "Write the inner PMT first, then handle sign, rounding, and decisions outside it.", "内側に PMT を書き、外側で符号・丸め・判定を処理します。"),
        }),
      ], { xp: 40 }),

      level("finance-growth", "lesson", L("FV 与 PV：资金在未来和现在之间换算", "FV and PV: Move Money Across Time", "FV と PV：未来と現在の資金を換算"), [
        learn(
          "brief-finance-growth",
          L("财务问：现在存的够不够，未来能拿多少", "Finance asks whether today's savings are enough", "財務が現在の貯蓄で足りるかを尋ねる"),
          L("PMT 用来算每期付款；FV 算一笔钱未来会长成多少；PV 反推未来付款在今天值多少。三者都用利率和期数，但回答的问题不同。", "PMT calculates payments, FV projects future value, and PV discounts future payments to today. All use rates and periods but answer different questions.", "PMT は毎回の支払い、FV は将来価値、PV は将来の支払いを現在価値に換算します。利率と期間を使いますが問いが異なります。"),
          [
            L("FV 回答“以后会有多少”", "FV answers what a cash flow will become", "FV は将来いくらになるかを答えます"),
            L("PV 回答“今天需要准备多少”", "PV answers how much is needed today", "PV は現在いくら必要かを答えます"),
            L("付款与收款的符号要相反，结果方向才合理", "Payments and receipts must have opposite signs", "支払いと受取りは符号を逆にします"),
            L("先算原始结果，再按报表需要取整", "Calculate first, then round for the report", "まず元の結果を計算し、必要に応じて丸めます"),
          ],
          L("FV、PV、PMT 都遵循同一套“现金流方向”规则。正负号不是装饰，它表示钱进入还是流出。", "FV, PV, and PMT share cash-flow direction rules. Signs show money entering or leaving.", "FV・PV・PMT は同じキャッシュフロー符号の規則を使います。符号は資金の出入りを表します。"),
          "=FV(B4/12,C4,0,-D4)"
        ),
        practice({
          id: "finance-growth-guided",
          title: L("教育基金与设备基金的未来值、现值", "Future and present value for education and equipment funds", "教育基金・機器基金の将来価値と現在価値"),
          lead: L("随机题会切换 FV 和 PV，也可能要求保留整数或接到 IF。", "Random tasks switch between FV and PV, with occasional rounding or IF.", "FV と PV がランダムに切り替わり、丸めや IF も加わります。"),
          sheet: finance,
          tasks: growthTasks("finance-growth-guided"),
          hint: L("先找出现金流方向：本金/付款是投入还是收回？再决定加不加负号。", "Identify cash-flow direction before deciding the sign.", "まず資金の出入りを確認してから符号を決めます。"),
        }),
        practice({
          id: "finance-growth-transfer",
          title: L("把未来值接回贷款与复核", "Connect future value back to loan and review tasks", "将来価値をローン・確認作業につなぐ"),
          lead: L("这组混合 PMT、FV、PV、SUM、IF，继续同一张资金表。", "This set mixes PMT, FV, PV, SUM, and IF on the same funding sheet.", "同じ資金表で PMT、FV、PV、SUM、IF を混ぜます。"),
          sheet: finance,
          tasks: financeReviewTasks("finance-growth-transfer"),
          hint: L("检查符号与期数，再检查取整。三项都对了，再考虑判断文本。", "Check signs, periods, and rounding before reviewing decision text.", "符号、期間、丸めを確認してから判定文字を見直します。"),
        }),
        practice({
          id: "finance-growth-check",
          title: L("FV 与 PV 收尾抽题", "FV and PV checkpoint", "FV・PV の仕上げ"),
          lead: L("随机复习未来值、现值、总利息和目标缺口。", "Randomly review future value, present value, total interest, and target gaps.", "将来価値、現在価値、総利息、目標不足額をランダムに復習します。"),
          sheet: finance,
          tasks: growthTasks("finance-growth-check"),
          hint: L("问“以后有多少”用 FV；问“今天准备多少”用 PV。", "Use FV for future amount and PV for what is needed today.", "将来額は FV、現在必要な額は PV です。"),
        }),
      ], { xp: 45 }),

      level("finance-review", "review", L("资金方案比较与复盘", "Funding Plan Comparison and Review", "資金案の比較と復習"), [
        learn(
          "brief-finance-review",
          L("主管要在四个方案中选一个", "The manager must choose among four plans", "上司が4案から1つを選ぶ"),
          L("现在把 PMT、FV、PV、ROUND、IF 放在同一张表里。每个任务只问一个业务问题，但公式内部可能需要两三层。先看目标格，再决定主线。", "Now combine PMT, FV, PV, ROUND, and IF in one sheet. Each task asks one business question while the formula may have several layers. Check the target, then choose the main line.", "PMT・FV・PV・ROUND・IF を1枚の表で使います。各課題は1つの業務質問ですが、数式は数階層になることがあります。対象を確認してから主線を決めます。"),
          [
            L("月供比较看 PMT，长期积累看 FV，今天准备额看 PV", "Compare payments with PMT, long-term growth with FV, and today's target with PV", "返済比較は PMT、長期積立は FV、現在必要額は PV です"),
            L("总利息 = 总还款 − 本金", "Total interest = total repayment minus principal", "総利息＝総返済−元金"),
            L("报表阈值用 IF 输出 PASS/REVIEW，便于筛选", "Use IF to output PASS/REVIEW for report filtering", "レポート基準は IF で PASS/REVIEW を返すと絞り込めます"),
            L("先看数字大小，再看小数位和文案", "Check the rough size first, then decimals and labels", "まず数字の大きさ、次に小数と表示文言を確認します"),
          ],
          L("资金题最重要的不是公式长，而是单位一致：年利率统一成月利率，期数统一成月数。", "The biggest risk is unit mismatch: convert annual rates to monthly and periods to months.", "最も注意すべきは単位です。年利率は月利率、期間は月数に揃えます。"),
          "=ROUND(-PMT(B2/12,C2,D2),2)"
        ),
        practice({
          id: "finance-review-main",
          title: L("四方案比较：月供、总利息与目标缺口", "Compare four plans: payments, interest, and gaps", "4案比較：返済額・利息・不足額"),
          lead: L("随机抽一个比较任务。公式可能两层，但每个中间结果都能在预览中逐步验算。", "A comparison task is chosen at random. Formulas may be nested, but each intermediate result can be checked in preview.", "比較課題をランダムに出題します。入れ子でも中間結果をプレビューで確認できます。"),
          sheet: finance,
          tasks: financeReviewTasks("finance-review-main"),
          hint: L("先算出 PMT、FV 或 PV 的基础值，再在外面做减法、除法或 IF。", "Calculate the base PMT, FV, or PV first, then subtract, divide, or apply IF outside.", "まず PMT・FV・PV の基礎値を計算し、外側で減算・除算・IF を行います。"),
        }),
        practice({
          id: "finance-review-scenario",
          title: L("资金评审会：同一工作簿的连续测算", "Funding review: several measures on one workbook", "資金審査：同じブックで複数試算"),
          lead: L("同一张资金表上随机抽一个评审问题，模拟主管临时追问。", "One review question is drawn from the same sheet, as if the manager follows up.", "同じ資金表から審査質問を1つランダムに出題します。"),
          sheet: finance,
          tasks: [
            task({ id: "finance-scenario-1", sheet: finance, target: "G2", taskLabel: labels.review, title: L("店面月供占总借款比例", "Store monthly payment as a share of principal", "店舗月額の元金比率"), lead: L("在 G2 用店面月供除以本金，保留两位。", "In G2, divide the store payment by principal and round to two decimals.", "G2 で店舗返済額を元金で割り、小数2桁にします。"), hint: L("参考：=ROUND(-PMT(B2/12,C2,D2)/D2,2)", "Reference: =ROUND(-PMT(B2/12,C2,D2)/D2,2)", "参考：=ROUND(-PMT(B2/12,C2,D2)/D2,2)"), formula: "=ROUND(-PMT(B2/12,C2,D2)/D2,2)", requiredFunctions: ["ROUND", "PMT"] }),
            task({ id: "finance-scenario-2", sheet: finance, target: "G3", taskLabel: labels.review, title: L("设备方案总还款", "Total repayment for the equipment plan", "機器案の総返済額"), lead: L("在 G3 用设备租赁月供乘期数。", "In G3, multiply the equipment payment by periods.", "G3 で機器リース返済額に期間を掛けます。"), hint: L("参考：=-PMT(B3/12,C3,D3)*C3", "Reference: =-PMT(B3/12,C3,D3)*C3", "参考：=-PMT(B3/12,C3,D3)*C3"), formula: "=-PMT(B3/12,C3,D3)*C3", requiredFunctions: ["PMT"] }),
            task({ id: "finance-scenario-3", sheet: finance, target: "G4", taskLabel: labels.review, title: L("两项总利息差", "Difference in total interest", "総利息の差"), lead: L("在 G4 分别算店面和车辆的“总还款−本金”，再相减。", "In G4, calculate each plan's total repayment minus principal, then subtract.", "G4 で店舗と車両の「総返済−元金」を求め、差を取ります。"), hint: L("参考：=(-PMT(B2/12,C2,D2)*C2-D2)-(-PMT(B5/12,C5,D5)*C5-D5)", "Reference: =(-PMT(B2/12,C2,D2)*C2-D2)-(-PMT(B5/12,C5,D5)*C5-D5)", "参考：=(-PMT(B2/12,C2,D2)*C2-D2)-(-PMT(B5/12,C5,D5)*C5-D5)"), formula: "=(-PMT(B2/12,C2,D2)*C2-D2)-(-PMT(B5/12,C5,D5)*C5-D5)", requiredFunctions: ["PMT"] }),
            task({ id: "finance-scenario-4", sheet: finance, target: "G5", taskLabel: labels.review, title: L("教育储蓄是否跑赢 8% 目标", "Does the education fund beat an 8% goal?", "教育資金が8%目標を超えるか"), lead: L("在 G5 用未来值除以本金，判断增长率是否超过 8%。", "In G5, divide future value by principal and test whether growth exceeds 8%.", "G5 で将来価値を元金で割り、8%超かを判定します。"), hint: L('参考：=IF(FV(B4/12,C4,0,-D4)/D4-1>0.08,"GO","WAIT")', 'Reference: =IF(FV(B4/12,C4,0,-D4)/D4-1>0.08,"GO","WAIT")', '参考：=IF(FV(B4/12,C4,0,-D4)/D4-1>0.08,"GO","WAIT")'), formula: '=IF(FV(B4/12,C4,0,-D4)/D4-1>0.08,"GO","WAIT")', requiredFunctions: ["IF", "FV"] }),
            task({ id: "finance-scenario-5", sheet: finance, target: "G6", taskLabel: labels.review, title: L("车辆方案每万元本金的月供", "Monthly payment per 10,000 principal", "元金1万円あたりの月額"), lead: L("在 G6 用车辆月供除本金再乘 10000，保留两位。", "In G6, divide the vehicle payment by principal, multiply by 10000, and round.", "G6 で車両返済額を元金で割り、10000を掛けて丸めます。"), hint: L("参考：=ROUND(-PMT(B5/12,C5,D5)/D5*10000,2)", "Reference: =ROUND(-PMT(B5/12,C5,D5)/D5*10000,2)", "参考：=ROUND(-PMT(B5/12,C5,D5)/D5*10000,2)"), formula: "=ROUND(-PMT(B5/12,C5,D5)/D5*10000,2)", requiredFunctions: ["ROUND", "PMT"] }),
            task({ id: "finance-scenario-6", sheet: finance, target: "G7", taskLabel: labels.review, title: L("培训方案月供是否低于设备方案", "Is training cheaper monthly than equipment?", "研修案は機器案より月額が低いか"), lead: L("在 G7 比较两项月供，返回 CHEAPER 或 HIGHER。", "In G7, compare both payments and return CHEAPER or HIGHER.", "G7 で2つの返済額を比較し、CHEAPER か HIGHER を返します。"), hint: L('参考：=IF(-PMT(B4/12,C4,D4)<-PMT(B3/12,C3,D3),"CHEAPER","HIGHER")', 'Reference: =IF(-PMT(B4/12,C4,D4)<-PMT(B3/12,C3,D3),"CHEAPER","HIGHER")', '参考：=IF(-PMT(B4/12,C4,D4)<-PMT(B3/12,C3,D3),"CHEAPER","HIGHER")'), formula: '=IF(-PMT(B4/12,C4,D4)<-PMT(B3/12,C3,D3),"CHEAPER","HIGHER")', requiredFunctions: ["IF", "PMT"] }),
          ],
          hint: L("报告里用百分比或万元单位时，先在公式中换算，再取整。", "For percentages or ten-thousand units, convert inside the formula before rounding.", "レポートで割合や万円を使う場合、数式内で換算してから丸めます。"),
        }),
        practice({
          id: "finance-review-final",
          title: L("资金章节最终抽题", "Finance chapter final draw", "資金章の最終ランダム問題"),
          lead: L("最终随机复习 PMT、FV、PV、ROUND 与 IF。重点是输入单位和现金流方向。", "The final draw reviews PMT, FV, PV, ROUND, and IF, focusing on units and cash-flow direction.", "PMT、FV、PV、ROUND、IF をランダムに復習します。単位とキャッシュフロー方向が要点です。"),
          sheet: finance,
          tasks: financeReviewTasks("finance-review-final"),
          hint: L("先确认年利率是否已除 12，再确认本金和期数是否来自同一行。", "Confirm the annual rate was divided by 12 and principal/periods come from the same row.", "年利率の12除算と、元金・期間が同じ行かどうかを確認します。"),
        }),
      ], { xp: 50 }),
    ],
  });
})();


