(function () {
  "use strict";

  const D = window.CourseData;
  const K = window.CurriculumKit;
  const L = K.L;
  const task = K.task;
  const priceList = K.sheets.priceList;
  const discountTable = K.sheets.discountTable;

  function learn(id, title, lead, points, tip, example, extra) {
    return D.learnStep(id, title, lead, points, tip, example, extra);
  }

  function practice(spec) {
    return K.sheetStep(spec);
  }

  function level(id, kind, title, steps, extra) {
    return Object.assign({ id, kind, title, steps }, extra || {});
  }

  priceList.F1 = L("查询编号", "Lookup ID", "検索番号");
  priceList.G1 = L("查询结果", "Lookup result", "検索結果");
  priceList.H1 = L("数量", "Qty", "数量");
  priceList.F2 = "P04";
  priceList.F3 = "P02";
  priceList.F4 = "P05";
  priceList.F5 = "P06";
  priceList.H2 = 3;
  priceList.H3 = 5;
  priceList.H4 = 2;
  priceList.H5 = 4;

  const labels = {
    exact: L("精确查找", "Exact lookup", "完全一致検索"),
    flexible: L("灵活查找", "Flexible lookup", "柔軟な検索"),
    review: L("查找综合复核", "Lookup review", "検索の総合確認"),
  };

  function buildTasks(prefix, specs) {
    return specs.map((spec) => task({
      id: prefix + "-" + spec.key,
      sheet: spec.sheet || priceList,
      target: spec.target,
      taskLabel: spec.taskLabel || labels.exact,
      title: spec.title,
      lead: spec.lead,
      hint: spec.hint,
      success: spec.success,
      formula: spec.formula,
      targetRange: spec.targetRange,
      requiredFunctions: spec.functions,
      requiredText: spec.requiredText,
      requiredRange: spec.requiredRange,
      sourceRefs: spec.sourceRefs,
      strictRefs: spec.strictRefs,
      mode: spec.mode,
    }));
  }

  function exactTasks(prefix) {
    return buildTasks(prefix, [
      {
        key: "price-p03", target: "G2", formula: '=VLOOKUP("P03",$A$2:$E$7,3,FALSE)', functions: ["VLOOKUP"],
        title: L("查 P03 的单价", "Find the price for P03", "P03 の単価を検索"),
        lead: L("在 G2 用 VLOOKUP 查 P03。查找值在首列，返回值在表格第 3 列；最后一个参数 FALSE 表示必须精确匹配。", "In G2, VLOOKUP P03. The lookup value is in the first column and the result in column 3. FALSE requires an exact match.", "G2 で P03 を VLOOKUP します。検索値は先頭列、返す値は3列目、最後の FALSE は完全一致を意味します。"),
        hint: L('参考：=VLOOKUP("P03",$A$2:$E$7,3,FALSE)', 'Reference: =VLOOKUP("P03",$A$2:$E$7,3,FALSE)', '参考：=VLOOKUP("P03",$A$2:$E$7,3,FALSE)'),
        success: L("VLOOKUP 的第 3 个参数是从查找表左端数起的列号。", "The third VLOOKUP argument is the column position counted from the table's left edge.", "VLOOKUP の3番目の引数は検索表の左端からの列位置です。"),
      },
      {
        key: "stock-p02", target: "G3", formula: '=VLOOKUP("P02",$A$2:$E$7,4,FALSE)', functions: ["VLOOKUP"],
        title: L("查 P02 的库存", "Find the stock for P02", "P02 の在庫を検索"),
        lead: L("在 G3 用同一个查找表，把返回列改成第 4 列，取出 P02 的库存。", "In G3, use the same table with return column 4 to get P02 stock.", "G3 で同じ表を使い、返す列を4列目にして P02 の在庫を取ります。"),
      },
      {
        key: "price-ref", target: "G4", formula: "=VLOOKUP(F2,$A$2:$E$7,3,FALSE)", functions: ["VLOOKUP"],
        title: L("按 F2 的编号查单价", "Look up the price from the ID in F2", "F2 の番号から単価を検索"),
        lead: L("F2 已经有一个编号。在 G4 把 F2 作为查找值，不要手写编号，这样换一个编号公式仍能用。", "F2 already contains an ID. In G4, use F2 as the lookup value instead of typing the ID, so the formula stays reusable.", "F2 に番号が入っています。G4 では番号を手入力せず F2 を検索値にします。"),
      },
      {
        key: "stock-ref", target: "G5", formula: "=VLOOKUP(F3,$A$2:$E$7,4,FALSE)", functions: ["VLOOKUP"],
        title: L("按 F3 的编号查库存", "Look up the stock from the ID in F3", "F3 の番号から在庫を検索"),
        lead: L("在 G5 用 F3 查第 4 列库存。查找值和返回值可以在同一张表的不同列。", "In G5, use F3 and return column 4. The lookup and returned value can sit in different columns of one table.", "G5 で F3 を使い4列目の在庫を返します。検索値と戻り値は同じ表の別列でも構いません。"),
      },
      {
        key: "double-price", target: "G6", formula: '=VLOOKUP("P05",$A$2:$E$7,3,FALSE)*2', functions: ["VLOOKUP"],
        title: L("两件背包的单价合计", "Price for two backpacks", "バックパック2個分の単価合計"),
        lead: L("在 G6 先查 P05 单价，再乘以 2。查找函数可以参与后面的算术。", "In G6, look up P05's price, then multiply by 2. Lookup functions can feed arithmetic.", "G6 で P05 の単価を検索し、2を掛けます。検索関数は四則演算に使えます。"),
      },
      {
        key: "reorder-p06", target: "G7", formula: '=IF(VLOOKUP("P06",$A$2:$E$7,4,FALSE)<20,"REORDER","OK")', functions: ["IF", "VLOOKUP"],
        title: L("库存低于 20 就提醒补货", "Flag reorder when stock is below 20", "在庫が20未満なら補充を表示"),
        lead: L("在 G7 用 VLOOKUP 取 P06 库存，再用 IF 判断是否小于 20。", "In G7, VLOOKUP P06 stock, then use IF for less than 20.", "G7 で P06 の在庫を VLOOKUP し、IF で20未満かを判定します。"),
      },
      {
        key: "iferror-missing", target: "G8", formula: '=IFERROR(VLOOKUP("P99",$A$2:$E$7,3,FALSE),0)', functions: ["IFERROR", "VLOOKUP"],
        title: L("查不到编号时返回 0", "Return 0 when an ID is missing", "番号がない場合は0を返す"),
        lead: L("P99 不在表里。在 G8 用 IFERROR 包住 VLOOKUP，找不到时返回 0，而不是把错误值交给后续报表。", "P99 is absent. In G8, wrap VLOOKUP with IFERROR and return 0 instead of passing an error into a report.", "P99 は表にありません。G8 で VLOOKUP を IFERROR で包み、見つからない場合は0を返します。"),
      },
      {
        key: "absolute-table", target: "G9", formula: '=VLOOKUP("P01",$A$2:$E$7,3,FALSE)', functions: ["VLOOKUP"], requiredText: ["$A$2:$E$7"],
        title: L("锁定查找表后查钢笔单价", "Lock the lookup table and find the pen price", "検索表を固定してペンの単価を検索"),
        lead: L("在 G9 查 P01 单价。保留参考公式中的 $A$2:$E$7，继续使用绝对引用锁定整张查找表。", "In G9, look up P01 price. Keep $A$2:$E$7 from the reference to lock the table with absolute references.", "G9 で P01 の単価を検索します。検索表を固定するため、参考数式の $A$2:$E$7 を残します。"),
        hint: L('参考：=VLOOKUP("P01",$A$2:$E$7,3,FALSE)。表格范围两侧都要有美元符号。', 'Reference: =VLOOKUP("P01",$A$2:$E$7,3,FALSE). Keep the dollar signs on both ends.', '参考：=VLOOKUP("P01",$A$2:$E$7,3,FALSE)。範囲の両端にドル記号を付けます。'),
      },
    ]);
  }

  discountTable.A5 = L("当前等级", "Current tier", "現在の等級");
  discountTable.B5 = "B";
  discountTable.A6 = L("当前折扣", "Current discount", "現在の割引率");

  function flexibleTasks(prefix) {
    return buildTasks(prefix, [
      {
        key: "hlookup-b", target: "G2", sheet: discountTable, taskLabel: labels.flexible,
        formula: '=HLOOKUP("B",$B$1:$D$2,2,FALSE)', functions: ["HLOOKUP"],
        title: L("横向查 B 级折扣率", "Find tier B discount across the row", "B 等級の割引率を横方向に検索"),
        lead: L("折扣表把等级放在第一行，把折扣率放在第二行。在 G2 用 HLOOKUP 查 B，返回第 2 行。", "The discount table stores tiers across the first row and rates on the second. In G2, HLOOKUP B and return row 2.", "割引表は等級が1行目、割引率が2行目です。G2 で B を HLOOKUP し、2行目を返します。"),
        hint: L('参考：=HLOOKUP("B",$B$1:$D$2,2,FALSE)', 'Reference: =HLOOKUP("B",$B$1:$D$2,2,FALSE)', '参考：=HLOOKUP("B",$B$1:$D$2,2,FALSE)'),
        success: L("VLOOKUP 纵向找，HLOOKUP 横向找。", "VLOOKUP searches vertically; HLOOKUP searches horizontally.", "VLOOKUP は縦方向、HLOOKUP は横方向に検索します。"),
      },
      {
        key: "hlookup-a", target: "G3", sheet: discountTable, taskLabel: labels.flexible,
        formula: '=HLOOKUP("A",$B$1:$D$2,2,FALSE)', functions: ["HLOOKUP"],
        title: L("横向查 A 级折扣率", "Find tier A discount across the row", "A 等級の割引率を横方向に検索"),
        lead: L("在 G3 把查找值换成 A，其他参数先保持不变。", "In G3, change the lookup value to A and keep the other arguments unchanged.", "G3 で検索値だけを A に変え、他の引数はそのままにします。"),
      },
      {
        key: "hlookup-threshold", target: "G4", sheet: discountTable, taskLabel: labels.flexible,
        formula: '=HLOOKUP("B",$B$1:$D$3,3,FALSE)', functions: ["HLOOKUP"],
        title: L("查 B 级的月采购额门槛", "Find tier B's monthly threshold", "B 等級の月間基準額を検索"),
        lead: L("在 G4 保持查找值为 B，但把返回行改成第 3 行，找出对应的月采购额门槛。", "In G4, keep B as the lookup value but return row 3 to find its monthly threshold.", "G4 では検索値を B のまま、返す行を3行目にして月間基準額を求めます。"),
      },
      {
        key: "hlookup-cell", target: "G5", sheet: discountTable, taskLabel: labels.flexible,
        formula: "=HLOOKUP(B5,$B$1:$D$2,2,FALSE)", functions: ["HLOOKUP"],
        title: L("按当前等级单元格查折扣", "Look up the discount from the current-tier cell", "現在の等級セルから割引率を検索"),
        lead: L("在 G5 用 B5 作为查找值。不要把 B 手写进公式，让报表改等级时自动更新。", "In G5, use B5 as the lookup value. Do not hard-code B, so changing the tier updates the result.", "G5 で B5 を検索値にします。B を固定せず、等級を変えると結果も更新されるようにします。"),
      },
      {
        key: "index-price", target: "G6", taskLabel: labels.flexible,
        formula: '=INDEX($C$2:$C$7,MATCH("P04",$A$2:$A$7,0))', functions: ["INDEX", "MATCH"],
        title: L("用 INDEX+MATCH 查 P04 单价", "Find P04 price with INDEX+MATCH", "INDEX+MATCH で P04 の単価を検索"),
        lead: L("在 G6 先用 MATCH 找到 P04 在 A2:A7 中的第几行，再让 INDEX 从 C2:C7 返回同行的单价。", "In G6, use MATCH to find P04's position in A2:A7, then INDEX to return the same row from C2:C7.", "G6 で A2:A7 内の P04 の行位置を MATCH で求め、INDEX で C2:C7 の同じ行を返します。"),
        hint: L('参考：=INDEX($C$2:$C$7,MATCH("P04",$A$2:$A$7,0))', 'Reference: =INDEX($C$2:$C$7,MATCH("P04",$A$2:$A$7,0))', '参考：=INDEX($C$2:$C$7,MATCH("P04",$A$2:$A$7,0))'),
      },
      {
        key: "index-stock", target: "G7", taskLabel: labels.flexible,
        formula: '=INDEX($D$2:$D$7,MATCH("P06",$A$2:$A$7,0))', functions: ["INDEX", "MATCH"],
        title: L("用 INDEX+MATCH 查 P06 库存", "Find P06 stock with INDEX+MATCH", "INDEX+MATCH で P06 の在庫を検索"),
        lead: L("在 G7 保持 MATCH 找 P06 的位置，把 INDEX 的返回区域换成 D2:D7。", "In G7, keep MATCH on P06 and switch INDEX to D2:D7.", "G7 では P06 の MATCH をそのまま使い、INDEX の範囲を D2:D7 に変えます。"),
      },
      {
        key: "index-dynamic", target: "G8", taskLabel: labels.flexible,
        formula: "=INDEX($C$2:$C$7,MATCH(F2,$A$2:$A$7,0))", functions: ["INDEX", "MATCH"],
        title: L("让 INDEX+MATCH 跟着 F2 编号变化", "Make INDEX+MATCH follow the ID in F2", "F2 の番号に合わせて INDEX+MATCH を動かす"),
        lead: L("在 G8 把 MATCH 的查找值改成 F2。F2 换编号时，单价会自动跟着换。", "In G8, use F2 as MATCH's lookup value. When F2 changes, the price follows automatically.", "G8 で MATCH の検索値を F2 にします。F2 の番号を変えると単価も自動で変わります。"),
      },
      {
        key: "two-way", target: "G9", taskLabel: labels.flexible,
        formula: '=INDEX($B$2:$D$7,MATCH("P03",$A$2:$A$7,0),MATCH("库存",$B$1:$D$1,0))', functions: ["INDEX", "MATCH"],
        title: L("二维查找：同时定位商品和字段", "Two-way lookup: locate both product and field", "2方向検索：商品と項目を同時に特定"),
        lead: L("在 G9 用两个 MATCH：一个找 P03 的行，一个找“库存”所在的列，再交给 INDEX 返回交叉点。", "In G9, use two MATCH calls: one for P03's row, one for the Stock column, then INDEX returns the intersection.", "G9 で2つの MATCH を使います。1つは P03 の行、もう1つは「在庫」の列を探し、INDEX で交点を返します。"),
        hint: L('参考：=INDEX($B$2:$D$7,MATCH("P03",$A$2:$A$7,0),MATCH("库存",$B$1:$D$1,0))', 'Reference: =INDEX($B$2:$D$7,MATCH("P03",$A$2:$A$7,0),MATCH("Stock",$B$1:$D$1,0))', '参考：=INDEX($B$2:$D$7,MATCH("P03",$A$2:$A$7,0),MATCH("在庫",$B$1:$D$1,0))'),
        success: L("行号和列号都由 MATCH 算出来，表格增删列时更稳。", "Both row and column are found by MATCH, which is more robust when columns change.", "行と列の両方を MATCH で求めるため、列の増減に強い数式です。"),
      },
    ]);
  }

  function reviewTasks(prefix) {
    return buildTasks(prefix, [
      {
        key: "price-qty", target: "G2", taskLabel: labels.review,
        formula: "=VLOOKUP(F2,$A$2:$E$7,3,FALSE)*H2", functions: ["VLOOKUP"],
        title: L("查 P04 单价后乘数量", "Look up P04 price and multiply by quantity", "P04 の単価に数量を掛ける"),
        lead: L("在 G2 用 F2 查单价，再乘以 H2 的数量，得到这一行的商品金额。", "In G2, look up the price with F2, then multiply by the quantity in H2.", "G2 で F2 から単価を検索し、H2 の数量を掛けて金額を求めます。"),
      },
      {
        key: "stock-qty", target: "G3", taskLabel: labels.review,
        formula: "=VLOOKUP(F3,$A$2:$E$7,4,FALSE)-H3", functions: ["VLOOKUP"],
        title: L("查 P02 库存后扣除占用量", "Look up P02 stock and subtract held quantity", "P02 の在庫から引当数を引く"),
        lead: L("在 G3 查 P02 库存，再减去 H3 中已经占用的 5 件，得到可用库存。", "In G3, look up P02 stock and subtract the 5 held in H3 to get available stock.", "G3 で P02 の在庫を検索し、H3 の引当数5を引いて利用可能在庫を求めます。"),
      },
      {
        key: "review-threshold", target: "G4", taskLabel: labels.review,
        formula: '=IF(VLOOKUP(F2,$A$2:$E$7,3,FALSE)>1000,"REVIEW","OK")', functions: ["IF", "VLOOKUP"],
        title: L("高价商品进入复核", "Send high-price items to review", "高額商品を確認対象にする"),
        lead: L("在 G4 查 F2 的单价，超过 1000 返回 REVIEW，否则返回 OK。", "In G4, look up F2's price. Return REVIEW above 1000; otherwise OK.", "G4 で F2 の単価を検索し、1000超なら REVIEW、それ以外は OK を返します。"),
      },
      {
        key: "round-lookup", target: "G5", taskLabel: labels.review,
        formula: '=ROUND(INDEX($C$2:$C$7,MATCH("P05",$A$2:$A$7,0))*1.1,0)', functions: ["ROUND", "INDEX", "MATCH"],
        title: L("背包报价上浮 10% 后取整", "Round a backpack quote after a 10% uplift", "バックパック見積を10%加算して丸める"),
        lead: L("在 G5 用 INDEX+MATCH 查 P05 单价，乘 1.1，再用 ROUND 取整。", "In G5, use INDEX+MATCH for P05 price, multiply by 1.1, then ROUND.", "G5 で INDEX+MATCH から P05 の単価を求め、1.1を掛けて ROUND します。"),
      },
      {
        key: "missing-safe", target: "G6", taskLabel: labels.review,
        formula: '=IFERROR(INDEX($C$2:$C$7,MATCH("P99",$A$2:$A$7,0)),"NOT FOUND")', functions: ["IFERROR", "INDEX", "MATCH"],
        title: L("INDEX+MATCH 找不到时给出提示", "Give a readable result when INDEX+MATCH fails", "INDEX+MATCH の未検出時に表示する"),
        lead: L("在 G6 查不存在的 P99，并用 IFERROR 返回 NOT FOUND。", "In G6, look up missing P99 and use IFERROR to return NOT FOUND.", "G6 で存在しない P99 を検索し、IFERROR で NOT FOUND を返します。"),
      },
      {
        key: "tier-savings", target: "G7", sheet: discountTable, taskLabel: labels.review,
        formula: "=HLOOKUP(B5,$B$1:$D$2,2,FALSE)*10000", functions: ["HLOOKUP"],
        title: L("按当前等级计算万元采购节省", "Calculate savings on a 10,000 purchase", "現在の等級で1万購入の削減額を計算"),
        lead: L("在 G7 先按 B5 查当前折扣率，再乘 10000 得到采购节省额。", "In G7, look up the current tier's discount from B5, then multiply by 10000 for the saving.", "G7 で B5 の等級から現在の割引率を求め、10000を掛けて削減額を出します。"),
      },
      {
        key: "two-way-price", target: "G8", taskLabel: labels.review,
        formula: '=INDEX($B$2:$D$7,MATCH("P04",$A$2:$A$7,0),MATCH("单价",$B$1:$D$1,0))', functions: ["INDEX", "MATCH"],
        title: L("二维查找 P04 单价", "Two-way lookup for P04 price", "2方向検索で P04 の単価を求める"),
        lead: L("在 G8 用 MATCH 分别定位 P04 所在行和“单价”所在列，再返回交叉点。", "In G8, MATCH P04's row and the Price column, then return their intersection.", "G8 で P04 の行と「単価」の列を MATCH で求め、交点を返します。"),
        hint: L('参考：=INDEX($B$2:$D$7,MATCH("P04",$A$2:$A$7,0),MATCH("单价",$B$1:$D$1,0))', 'Reference: =INDEX($B$2:$D$7,MATCH("P04",$A$2:$A$7,0),MATCH("Price",$B$1:$D$1,0))', '参考：=INDEX($B$2:$D$7,MATCH("P04",$A$2:$A$7,0),MATCH("単価",$B$1:$D$1,0))'),
      },
      {
        key: "stock-check", target: "G9", taskLabel: labels.review,
        formula: '=IF(VLOOKUP(F3,$A$2:$E$7,4,FALSE)>H3,"ENOUGH","SHORT")', functions: ["IF", "VLOOKUP"],
        title: L("库存是否足够五个打印纸", "Is stock enough for five paper packs?", "用紙5個分の在庫があるか"),
        lead: L("在 G9 查 P02 库存，与 H3 的 5 件比较，返回 ENOUGH 或 SHORT。", "In G9, compare P02 stock with the five units in H3 and return ENOUGH or SHORT.", "G9 で P02 の在庫と H3 の5を比較し、ENOUGH か SHORT を返します。"),
      },
      {
        key: "lookup-fill-column", target: "G2", targetRange: "G2:G5", functions: ["VLOOKUP"],
        formula: "=VLOOKUP(F2,$A$2:$E$7,3,FALSE)",
        title: L("把四个编号的单价一次查回来", "Look up all four IDs in one fill", "4つの番号の単価をまとめて検索", "一次查回四個編號的單價"),
        lead: L("F2:F5 已经是四条查询条件。先在 G2 用 VLOOKUP 返回第 3 列单价，再拖绿色填充柄到 G5；查找编号会随每一行更新，查找表则保持固定。", "F2:F5 already holds four IDs. In G2, return the price from column 3 with VLOOKUP, then drag the green fill handle to G5. Each row follows its own ID while the lookup table stays fixed.", "F2:F5 に4つの検索値があります。G2 で VLOOKUP の3列目を返し、緑のハンドルを G5 までドラッグします。検索番号は行ごとに変わり、検索表は固定されます。", "F2:F5 已經有四條查詢條件。先在 G2 用 VLOOKUP 傳回第 3 欄單價，再拖綠色填充控點到 G5；查詢編號會隨每一列更新，查詢表則保持固定。"),
        hint: L('参考：=VLOOKUP(F2,$A$2:$E$7,3,FALSE)。查找表要锁住，F2 不要锁。', 'Reference: =VLOOKUP(F2,$A$2:$E$7,3,FALSE). Lock the lookup table, but leave F2 relative.', "参考：=VLOOKUP(F2,$A$2:$E$7,3,FALSE)。検索表は固定し、F2 は相対参照にします。", "參考：=VLOOKUP(F2,$A$2:$E$7,3,FALSE)。查詢表要鎖住，F2 不要鎖。"),
        success: L("一条 VLOOKUP 沿结果列复制后，每一行都在查自己的编号。这就是实际报表里最常见的批量取数方式。", "One VLOOKUP copied down the result column gives each row its own ID. This is the everyday report workflow.", "VLOOKUP を結果列にコピーすると、各行が自分の番号を検索します。実務で最もよく使う一括取得の形です。", "一條 VLOOKUP 沿結果欄複製後，每一列都在查自己的編號。這就是實際報表最常見的批次取數方式。"),
        requiredRange: "$A$2:$E$7",
      },
    ]);
  }

  D.registerChapter({
    id: "ch06-lookup",
    icon: "06",
    title: L("第 6 章 · 从另一张表找到答案", "Chapter 6 · Find Answers in Another Table", "第6章 · 別の表から答えを探す"),
    subtitle: L("先学最常用的 VLOOKUP，再认识横向查找和 INDEX+MATCH。每一关都从真实商品表出发，并且继续使用数量、库存和 IF 判断。", "Start with VLOOKUP, then learn horizontal lookup and INDEX+MATCH. Every level uses a real product table and continues to combine quantity, stock, and IF decisions.", "まず VLOOKUP、次に横方向検索と INDEX+MATCH を学びます。各レベルは実在の商品表を使い、数量・在庫・IF 判定も組み合わせます。"),
    levels: [
      level("lookup-basic", "lesson", L("VLOOKUP：按编号取回商品数据", "VLOOKUP: Retrieve Data by ID", "VLOOKUP：番号から商品データを取得"), [
        learn(
          "brief-lookup-basic",
          L("库存员只记得商品编号", "The stock clerk only remembers item IDs", "在庫担当者は商品番号だけを覚えている"),
          L("仓库同事在 F 列写下了几个编号，需要你从完整价目表里取回单价和库存。不要手工搜索再复制，用一条公式让编号自动变成数据。", "A warehouse colleague has listed several IDs in column F. Retrieve prices and stock from the master price table with formulas instead of searching by hand.", "倉庫の担当者がF列にいくつかの番号を書きました。完全な価格表から単価と在庫を数式で取得し、手作業の検索・コピーを避けます。"),
          [
            L("VLOOKUP 默认在查找区域的第一列寻找编号", "VLOOKUP searches the first column of the lookup range", "VLOOKUP は検索範囲の先頭列で番号を探します"),
            L("第 3 个参数是返回值在查找区域中的列号", "The third argument is the return column position inside the lookup range", "3番目の引数は検索範囲内の戻り列番号です"),
            L("最后一个参数写 FALSE，避免把相似编号当成匹配", "Use FALSE so similar IDs are not treated as matches", "最後の引数に FALSE を指定し、似た番号の誤一致を防ぎます"),
            L("用 $ 锁定查找表，公式复制到其他行时仍指向同一张表", "Use $ to lock the table so copied formulas still point to the same range", "$ で検索表を固定し、他の行へコピーしても同じ範囲を参照させます"),
          ],
          L("先把表格区域想成“身份证号在左，其他资料在右”。VLOOKUP 只能向右侧取资料。", "Think of the table as IDs on the left and details on the right. VLOOKUP only retrieves data to the right.", "ID が左、詳細が右にある表と考えます。VLOOKUP は右側のデータだけ取得できます。"),
          '=VLOOKUP("P03",$A$2:$E$7,3,FALSE)'
        ),
        practice({
          id: "lookup-basic-guided",
          title: L("价目表取数：单价、库存与缺货提醒", "Retrieve price and stock from the price table", "価格表から単価・在庫・補充通知を取得"),
          lead: L("每次随机抽一个编号或返回列。写公式前，先想清楚查找表是哪一块、返回第几列。", "Each task changes the ID or return column. Before writing, identify the table and return-column index.", "課題ごとに番号や戻り列が変わります。検索表と戻り列番号を先に確認します。"),
          sheet: priceList,
          tasks: exactTasks("lookup-basic-guided"),
          hint: L("参数顺序：查找值、查找表、返回列号、FALSE。", "Argument order: lookup value, table, return column, FALSE.", "引数の順序：検索値、検索表、戻り列、FALSE。"),
        }),
        practice({
          id: "lookup-basic-transfer",
          title: L("查到数据后，继续算金额和库存", "After lookup, calculate amount and stock", "検索した値で金額と在庫を計算"),
          lead: L("查找不是终点。随机任务会把查到的单价乘数量、把库存与阈值比较，或给缺失编号兜底。", "Lookup is not the finish line. Random tasks multiply prices by quantity, compare stock with thresholds, or handle missing IDs.", "検索はゴールではありません。単価×数量、在庫と基準の比較、未検出時の処理を組み合わせます。"),
          sheet: priceList,
          tasks: [
            task({ id: "lookup-transfer-1", sheet: priceList, target: "G2", taskLabel: labels.exact, title: L("三支钢笔的金额", "Amount for three pens", "ペン3本の金額"), lead: L("在 G2 查 P05 的单价后乘 3。", "In G2, look up P05's price and multiply by 3.", "G2 で P05 の単価を検索し、3を掛けます。"), hint: L('参考：=VLOOKUP("P05",$A$2:$E$7,3,FALSE)*3', 'Reference: =VLOOKUP("P05",$A$2:$E$7,3,FALSE)*3', '参考：=VLOOKUP("P05",$A$2:$E$7,3,FALSE)*3'), formula: '=VLOOKUP("P05",$A$2:$E$7,3,FALSE)*3', requiredFunctions: ["VLOOKUP"] }),
            task({ id: "lookup-transfer-2", sheet: priceList, target: "G3", taskLabel: labels.exact, title: L("按 F4 查背包库存", "Look up backpack stock from F4", "F4 からバックパックの在庫を検索"), lead: L("在 G3 用 F4 作为查找值，返回第 4 列库存。", "In G3, use F4 and return stock from column 4.", "G3 で F4 を検索値にし、4列目の在庫を返します。"), hint: L("参考：=VLOOKUP(F4,$A$2:$E$7,4,FALSE)", "Reference: =VLOOKUP(F4,$A$2:$E$7,4,FALSE)", "参考：=VLOOKUP(F4,$A$2:$E$7,4,FALSE)"), formula: "=VLOOKUP(F4,$A$2:$E$7,4,FALSE)", requiredFunctions: ["VLOOKUP"] }),
            task({ id: "lookup-transfer-3", sheet: priceList, target: "G4", taskLabel: labels.exact, title: L("笔记本报价加上 8% 服务费", "Laptop quote plus 8% service fee", "ノートPC見積に8%の手数料を加算"), lead: L("在 G4 查 P04 单价，乘 1.08，再用 ROUND 取整。", "In G4, look up P04's price, multiply by 1.08, then ROUND.", "G4 で P04 の単価を検索し、1.08を掛けて ROUND します。"), hint: L("参考：=ROUND(VLOOKUP(\"P04\",$A$2:$E$7,3,FALSE)*1.08,0)", "Reference: =ROUND(VLOOKUP(\"P04\",$A$2:$E$7,3,FALSE)*1.08,0)", "参考：=ROUND(VLOOKUP(\"P04\",$A$2:$E$7,3,FALSE)*1.08,0)"), formula: '=ROUND(VLOOKUP("P04",$A$2:$E$7,3,FALSE)*1.08,0)', requiredFunctions: ["ROUND", "VLOOKUP"] }),
            task({ id: "lookup-transfer-4", sheet: priceList, target: "G5", taskLabel: labels.exact, title: L("P06 库存不足就标记 LOW", "Flag LOW when P06 stock is short", "P06 の在庫不足を LOW で表示"), lead: L("在 G5 查 P06 库存，低于 20 返回 LOW，否则 OK。", "In G5, look up P06 stock. Return LOW below 20; otherwise OK.", "G5 で P06 の在庫を検索し、20未満なら LOW、それ以外は OK を返します。"), hint: L('参考：=IF(VLOOKUP("P06",$A$2:$E$7,4,FALSE)<20,"LOW","OK")', 'Reference: =IF(VLOOKUP("P06",$A$2:$E$7,4,FALSE)<20,"LOW","OK")', '参考：=IF(VLOOKUP("P06",$A$2:$E$7,4,FALSE)<20,"LOW","OK")'), formula: '=IF(VLOOKUP("P06",$A$2:$E$7,4,FALSE)<20,"LOW","OK")', requiredFunctions: ["IF", "VLOOKUP"] }),
            task({ id: "lookup-transfer-5", sheet: priceList, target: "G6", taskLabel: labels.exact, title: L("缺失编号统一返回 0", "Return 0 for a missing ID", "存在しない番号は0を返す"), lead: L("在 G6 用 IFERROR 包住 VLOOKUP(P88)，查找失败时返回 0。", "In G6, wrap VLOOKUP for P88 with IFERROR and return 0 on failure.", "G6 で P88 の VLOOKUP を IFERROR で包み、失敗時は0を返します。"), hint: L('参考：=IFERROR(VLOOKUP("P88",$A$2:$E$7,3,FALSE),0)', 'Reference: =IFERROR(VLOOKUP("P88",$A$2:$E$7,3,FALSE),0)', '参考：=IFERROR(VLOOKUP("P88",$A$2:$E$7,3,FALSE),0)'), formula: '=IFERROR(VLOOKUP("P88",$A$2:$E$7,3,FALSE),0)', requiredFunctions: ["IFERROR", "VLOOKUP"] }),
            task({ id: "lookup-transfer-6", sheet: priceList, target: "G7", taskLabel: labels.exact, title: L("钢笔和打印纸各一件的合计", "Total for one pen and one paper pack", "ペン1本と用紙1個の合計"), lead: L("在 G7 查 P01 与 P02 的单价并相加。", "In G7, look up P01 and P02 prices and add them.", "G7 で P01 と P02 の単価を検索し、合計します。"), hint: L('参考：=VLOOKUP("P01",$A$2:$E$7,3,FALSE)+VLOOKUP("P02",$A$2:$E$7,3,FALSE)', 'Reference: =VLOOKUP("P01",$A$2:$E$7,3,FALSE)+VLOOKUP("P02",$A$2:$E$7,3,FALSE)', '参考：=VLOOKUP("P01",$A$2:$E$7,3,FALSE)+VLOOKUP("P02",$A$2:$E$7,3,FALSE)'), formula: '=VLOOKUP("P01",$A$2:$E$7,3,FALSE)+VLOOKUP("P02",$A$2:$E$7,3,FALSE)', requiredFunctions: ["VLOOKUP"] }),
          ],
          hint: L("把 VLOOKUP 当成整条公式里的一个数，外面还能继续加减乘除或套 IF。", "Treat VLOOKUP as one number in a larger formula; you can add arithmetic or IF around it.", "VLOOKUP を数式内の1つの数値として扱い、外側で演算や IF を組み合わせます。"),
        }),
        practice({
          id: "lookup-basic-check",
          title: L("价目表取数收尾", "Price-table lookup checkpoint", "価格表検索の仕上げ"),
          lead: L("最后一组在单价、库存、错误兜底之间随机切换。重点是参数顺序不能乱。", "The final mix randomly switches among price, stock, and error handling. The key is keeping the argument order correct.", "最後は単価、在庫、エラー処理がランダムに切り替わります。引数の順序を守ることが重要です。"),
          sheet: priceList,
          tasks: exactTasks("lookup-basic-check"),
          hint: L("FALSE 写在最后，不是写在返回列号的位置。", "FALSE belongs last, not where the return-column number goes.", "FALSE は最後に書き、戻り列番号の位置には置きません。"),
        }),
      ], { xp: 40 }),

      level("lookup-flex", "lesson", L("横向查找与 INDEX+MATCH", "Horizontal Lookup and INDEX+MATCH", "横方向検索と INDEX+MATCH"), [
        learn(
          "brief-lookup-flex",
          L("折扣表横着排，商品表竖着排", "The discount table runs across; the product table runs down", "割引表は横、商品表は縦に並ぶ"),
          L("同一份工作常有两张方向不同的表。等级横向排列时用 HLOOKUP；想由行号和列号取交叉点时用 INDEX+MATCH。先各做一小步，再混在一起。", "Real work often has tables in different orientations. Use HLOOKUP when tiers run horizontally; use INDEX+MATCH to retrieve a row-column intersection. Practice each, then mix them.", "実務では向きの異なる表がよくあります。等級が横なら HLOOKUP、行と列の交点を取るなら INDEX+MATCH を使います。個別に練習してから組み合わせます。"),
          [
            L("HLOOKUP 在首行找值，按行号返回下方数据", "HLOOKUP searches the first row and returns a row below", "HLOOKUP は先頭行で検索し、下の行を返します"),
            L("MATCH 返回查找值在区域中的第几个位置", "MATCH returns the position of a value in a range", "MATCH は範囲内での位置を返します"),
            L("INDEX 用行号和列号从区域中取交叉点", "INDEX retrieves a cell by row and column position", "INDEX は行番号と列番号で交点を取得します"),
            L("MATCH 的最后一个参数 0 表示精确匹配", "Use 0 as MATCH's last argument for an exact match", "MATCH の最後の引数 0 は完全一致です"),
          ],
          L("INDEX+MATCH 比单纯 VLOOKUP 多一步思考，但不受“只能向右取”的限制。", "INDEX+MATCH needs one extra thought than VLOOKUP, but it is not limited to returning columns on the right.", "INDEX+MATCH は VLOOKUP より一手間かかりますが、右側の列だけに限定されません。"),
          '=HLOOKUP("B",$B$1:$D$2,2,FALSE)'
        ),
        practice({
          id: "lookup-flex-guided",
          title: L("横向折扣表与二维查找", "Horizontal discount table and two-way lookup", "横方向の割引表と2方向検索"),
          lead: L("随机题会切换 HLOOKUP、INDEX+MATCH 和二维查找。先判断表的方向，再决定用哪个函数。", "Random tasks switch among HLOOKUP, INDEX+MATCH, and two-way lookup. Identify the table orientation before choosing a function.", "HLOOKUP、INDEX+MATCH、2方向検索がランダムに出ます。表の向きを確認して関数を選びます。"),
          sheet: priceList,
          tasks: flexibleTasks("lookup-flex-guided"),
          hint: L("横向用 HLOOKUP；已知行、列位置时用 INDEX；只知道要找什么时先 MATCH 出位置。", "Use HLOOKUP horizontally, INDEX when row and column positions are known, and MATCH first when you only know the value to find.", "横方向は HLOOKUP、行・列位置が分かる場合は INDEX、検索値だけ分かる場合は先に MATCH を使います。"),
        }),
        practice({
          id: "lookup-flex-transfer",
          title: L("查找方向切换：横向、纵向与交叉点", "Switch lookup directions: across, down, and intersection", "検索方向の切り替え：横・縦・交点"),
          lead: L("这一组仍然在学习新函数，但会带上 ROUND、IFERROR 和旧的条件判断。", "This set still practices the new functions while bringing back ROUND, IFERROR, and prior decisions.", "新しい関数に加え、ROUND、IFERROR、既習の条件判定も使います。"),
          sheet: priceList,
          tasks: [
            task({ id: "lookup-flex-1", sheet: discountTable, target: "G2", taskLabel: labels.flexible, title: L("C 级折扣率乘以 1000", "Tier C discount times 1000", "C 等級の割引率に1000を掛ける"), lead: L("在 G2 用 HLOOKUP 查 C 级第 2 行折扣率，再乘 1000。", "In G2, HLOOKUP tier C's row-2 discount, then multiply by 1000.", "G2 で C 等級の2行目割引率を HLOOKUP し、1000を掛けます。"), hint: L('参考：=HLOOKUP("C",$B$1:$D$2,2,FALSE)*1000', 'Reference: =HLOOKUP("C",$B$1:$D$2,2,FALSE)*1000', '参考：=HLOOKUP("C",$B$1:$D$2,2,FALSE)*1000'), formula: '=HLOOKUP("C",$B$1:$D$2,2,FALSE)*1000', requiredFunctions: ["HLOOKUP"] }),
            task({ id: "lookup-flex-2", sheet: discountTable, target: "G3", taskLabel: labels.flexible, title: L("按 B5 查当前门槛", "Look up the current threshold from B5", "B5 から現在の基準額を検索"), lead: L("在 G3 把 B5 作为 HLOOKUP 的查找值，返回第 3 行门槛。", "In G3, use B5 as HLOOKUP's value and return row 3.", "G3 で B5 を HLOOKUP の検索値にし、3行目を返します。"), hint: L("参考：=HLOOKUP(B5,$B$1:$D$3,3,FALSE)", "Reference: =HLOOKUP(B5,$B$1:$D$3,3,FALSE)", "参考：=HLOOKUP(B5,$B$1:$D$3,3,FALSE)"), formula: "=HLOOKUP(B5,$B$1:$D$3,3,FALSE)", requiredFunctions: ["HLOOKUP"] }),
            task({ id: "lookup-flex-3", sheet: priceList, target: "G4", taskLabel: labels.flexible, title: L("按 F3 查打印纸单价", "Look up paper price from F3", "F3 から用紙の単価を検索"), lead: L("在 G4 用 INDEX+MATCH：MATCH 找 F3 的行，INDEX 从 C2:C7 返回单价。", "In G4, use INDEX+MATCH: MATCH F3's row and INDEX return from C2:C7.", "G4 で INDEX+MATCH を使います。MATCH で F3 の行、INDEX で C2:C7 の単価を返します。"), hint: L("参考：=INDEX($C$2:$C$7,MATCH(F3,$A$2:$A$7,0))", "Reference: =INDEX($C$2:$C$7,MATCH(F3,$A$2:$A$7,0))", "参考：=INDEX($C$2:$C$7,MATCH(F3,$A$2:$A$7,0))"), formula: "=INDEX($C$2:$C$7,MATCH(F3,$A$2:$A$7,0))", requiredFunctions: ["INDEX", "MATCH"] }),
            task({ id: "lookup-flex-4", sheet: priceList, target: "G5", taskLabel: labels.flexible, title: L("用 F4 查库存", "Look up stock from F4", "F4 から在庫を検索"), lead: L("在 G5 用 F4 作为 MATCH 的查找值，INDEX 返回 D2:D7。", "In G5, MATCH F4 and return D2:D7 with INDEX.", "G5 で F4 を MATCH し、INDEX で D2:D7 を返します。"), hint: L("参考：=INDEX($D$2:$D$7,MATCH(F4,$A$2:$A$7,0))", "Reference: =INDEX($D$2:$D$7,MATCH(F4,$A$2:$A$7,0))", "参考：=INDEX($D$2:$D$7,MATCH(F4,$A$2:$A$7,0))"), formula: "=INDEX($D$2:$D$7,MATCH(F4,$A$2:$A$7,0))", requiredFunctions: ["INDEX", "MATCH"] }),
            task({ id: "lookup-flex-5", sheet: priceList, target: "G6", taskLabel: labels.flexible, title: L("二维查找 P02 单价", "Two-way lookup P02 price", "2方向検索で P02 単価を取得"), lead: L("在 G6 用两个 MATCH 分别定位 P02 行和“单价”列。", "In G6, use two MATCH calls for P02's row and the Price column.", "G6 で2つの MATCH を使い、P02 の行と「単価」列を求めます。", "在 G6 用兩個 MATCH 分別定位 P02 所在橫列和「單價」欄。"), hint: L("参考：=INDEX($B$2:$D$7,MATCH(\"P02\",$A$2:$A$7,0),MATCH(\"单价\",$B$1:$D$1,0))", "Reference: =INDEX($B$2:$D$7,MATCH(\"P02\",$A$2:$A$7,0),MATCH(\"Price\",$B$1:$D$1,0))", "参考：=INDEX($B$2:$D$7,MATCH(\"P02\",$A$2:$A$7,0),MATCH(\"単価\",$B$1:$D$1,0))"), formula: '=INDEX($B$2:$D$7,MATCH("P02",$A$2:$A$7,0),MATCH("单价",$B$1:$D$1,0))', requiredFunctions: ["INDEX", "MATCH"] }),
            task({ id: "lookup-flex-6", sheet: priceList, target: "G7", taskLabel: labels.flexible, title: L("INDEX+MATCH 缺失兜底", "INDEX+MATCH fallback", "INDEX+MATCH の未検出処理"), lead: L("在 G7 查找 P77，用 IFERROR 返回 0。", "In G7, look up P77 and return 0 through IFERROR.", "G7 で P77 を検索し、IFERROR で0を返します。"), hint: L("参考：=IFERROR(INDEX($C$2:$C$7,MATCH(\"P77\",$A$2:$A$7,0)),0)", "Reference: =IFERROR(INDEX($C$2:$C$7,MATCH(\"P77\",$A$2:$A$7,0)),0)", "参考：=IFERROR(INDEX($C$2:$C$7,MATCH(\"P77\",$A$2:$A$7,0)),0)"), formula: '=IFERROR(INDEX($C$2:$C$7,MATCH("P77",$A$2:$A$7,0)),0)', requiredFunctions: ["IFERROR", "INDEX", "MATCH"] }),
          ],
          hint: L("INDEX+MATCH 是“先定位，再取值”；MATCH 返回位置数字，不要直接把它当结果。", "INDEX+MATCH locates then retrieves. MATCH returns a position, not the final value.", "INDEX+MATCH は位置を求めてから値を取得します。MATCH の戻りは位置であり最終値ではありません。"),
        }),
        practice({
          id: "lookup-flex-check",
          title: L("横向与二维查找收尾", "Horizontal and two-way lookup checkpoint", "横方向・2方向検索の仕上げ"),
          lead: L("随机抽取 HLOOKUP、INDEX+MATCH 或二维查找，保持参数顺序。", "Randomly receive HLOOKUP, INDEX+MATCH, or two-way lookup while keeping argument order.", "HLOOKUP、INDEX+MATCH、2方向検索からランダムに出題します。引数順を守ります。"),
          sheet: priceList,
          tasks: flexibleTasks("lookup-flex-check"),
          hint: L("先找“第一行”还是“第一列”，再决定 HLOOKUP 与 VLOOKUP/INDEX 的差别。", "Decide whether the lookup runs across the first row or down the first column before choosing.", "先頭行か先頭列かを確認してから関数を選びます。"),
        }),
      ], { xp: 45 }),

      level("lookup-review", "review", L("采购单手边取数：查找综合复核", "Lookup Review at the Purchase Desk", "購買デスクの検索総合復習"), [
        learn(
          "brief-lookup-review",
          L("采购员要一张能直接报价的清单", "A buyer needs a list ready to quote", "購買担当が見積可能な一覧を必要としている"),
          L("清单里只有编号、数量和几个业务条件。你要先查到单价或库存，再算金额、判断是否需要复核。查找会和前面学过的统计、取整、错误处理一起出现。", "The list contains IDs, quantities, and business rules. Look up price or stock, calculate amounts, then decide whether review is needed. Lookup will combine with statistics, rounding, and error handling.", "一覧には番号、数量、業務条件だけがあります。単価や在庫を検索し、金額を計算して確認要否を判定します。検索は既習の集計・丸め・エラー処理と組み合わさります。"),
          [
            L("查找结果通常不会单独使用，而是进入金额或判断公式", "Lookup results usually feed an amount or decision formula", "検索結果は通常、金額や判定の数式に使います"),
            L("IFERROR 能区分“没有这个编号”和“计算结果为零”", "IFERROR distinguishes a missing ID from a valid zero", "IFERROR は番号なしと有効な0を区別できます"),
            L("VLOOKUP 与 INDEX+MATCH 都能完成精确查找，按表结构选择", "VLOOKUP and INDEX+MATCH both do exact lookups; choose by table structure", "VLOOKUP と INDEX+MATCH はどちらも完全一致検索です。表構造で選びます"),
            L("先在预览中确认查找值，再排查外层算术", "Check the lookup preview first, then inspect outer arithmetic", "まず検索結果のプレビューを確認し、その後で外側の演算を調べます"),
          ],
          L("复查时从内到外：查找有没有命中？金额单位对不对？判断阈值是否写错？", "Review from the inside out: did the lookup hit, are units correct, and is the threshold right?", "内側から確認します。検索が当たったか、単位は正しいか、基準値は正しいか。"),
          "=VLOOKUP(F2,$A$2:$E$7,3,FALSE)*H2"
        ),
        practice({
          id: "lookup-review-main",
          title: L("采购清单：查找后直接做业务判断", "Purchase list: look up and decide", "購買一覧：検索して業務判定"),
          lead: L("题目会在金额、可用库存、阈值提醒和二维查找之间随机切换。", "Tasks randomly switch among amounts, available stock, threshold alerts, and two-way lookup.", "金額、利用可能在庫、基準アラート、2方向検索からランダムに出題します。"),
          sheet: priceList,
          tasks: reviewTasks("lookup-review-main"),
          hint: L("如果公式很长，先拆成内层查找，再逐层接上算术和 IF。", "For a long formula, isolate the inner lookup first, then add arithmetic and IF layer by layer.", "長い数式は内側の検索を分けて確認し、演算と IF を1層ずつ加えます。"),
        }),
        practice({
          id: "lookup-review-quote",
          title: L("采购单上的多个连续任务", "Several related tasks on one purchase sheet", "1枚の購買シートで複数作業"),
          lead: L("这组任务都发生在同一张价目表上，但每次随机抽一个业务问题。继续把旧知识和查找组合。", "All tasks use the same price table, but one business question is drawn at a time. Keep combining prior skills with lookup.", "すべて同じ価格表の問題です。1回につき1つの業務課題をランダムに出題し、既習内容と検索を組み合わせます。"),
          sheet: priceList,
          tasks: [
            task({ id: "lookup-quote-1", sheet: priceList, target: "G2", taskLabel: labels.review, title: L("P04 金额与 P02 金额相加", "Add the P04 and P02 line amounts", "P04 と P02 の金額を合計"), lead: L("在 G2 分别查单价乘数量 H2、H3，再把两行金额相加。", "In G2, look up both prices, multiply by H2 and H3, then add the line amounts.", "G2 で2つの単価を検索し、H2 と H3 を掛けて各行金額を合計します。"), hint: L("参考：=VLOOKUP(F2,$A$2:$E$7,3,FALSE)*H2+VLOOKUP(F3,$A$2:$E$7,3,FALSE)*H3", "Reference: =VLOOKUP(F2,$A$2:$E$7,3,FALSE)*H2+VLOOKUP(F3,$A$2:$E$7,3,FALSE)*H3", "参考：=VLOOKUP(F2,$A$2:$E$7,3,FALSE)*H2+VLOOKUP(F3,$A$2:$E$7,3,FALSE)*H3"), formula: "=VLOOKUP(F2,$A$2:$E$7,3,FALSE)*H2+VLOOKUP(F3,$A$2:$E$7,3,FALSE)*H3", requiredFunctions: ["VLOOKUP"] }),
            task({ id: "lookup-quote-2", sheet: priceList, target: "G3", taskLabel: labels.review, title: L("F4 商品库存不足时提示", "Alert when F4 item stock is short", "F4 商品の在庫不足を通知"), lead: L("在 G3 用 F4 查库存，与 H4 的占用数量比较，不足返回 SHORT。", "In G3, look up F4 stock, compare with H4's held quantity, and return SHORT when insufficient.", "G3 で F4 の在庫を検索し、H4 の引当数と比較して不足なら SHORT を返します。"), hint: L('参考：=IF(INDEX($D$2:$D$7,MATCH(F4,$A$2:$A$7,0))<H4,"SHORT","OK")', 'Reference: =IF(INDEX($D$2:$D$7,MATCH(F4,$A$2:$A$7,0))<H4,"SHORT","OK")', '参考：=IF(INDEX($D$2:$D$7,MATCH(F4,$A$2:$A$7,0))<H4,"SHORT","OK")'), formula: '=IF(INDEX($D$2:$D$7,MATCH(F4,$A$2:$A$7,0))<H4,"SHORT","OK")', requiredFunctions: ["IF", "INDEX", "MATCH"] }),
            task({ id: "lookup-quote-3", sheet: discountTable, target: "G4", taskLabel: labels.review, title: L("按折扣和采购数量估算节省额", "Estimate savings from tier and purchase quantity", "等級と購入数量から削減額を概算"), lead: L("在 G4 用 HLOOKUP 查 B5 等级折扣，乘 10000 采购额。", "In G4, HLOOKUP B5's discount and multiply by 10000.", "G4 で B5 の等級から割引率を HLOOKUP し、10000を掛けます。"), hint: L("参考：=HLOOKUP(B5,$B$1:$D$2,2,FALSE)*10000", "Reference: =HLOOKUP(B5,$B$1:$D$2,2,FALSE)*10000", "参考：=HLOOKUP(B5,$B$1:$D$2,2,FALSE)*10000"), formula: "=HLOOKUP(B5,$B$1:$D$2,2,FALSE)*10000", requiredFunctions: ["HLOOKUP"] }),
            task({ id: "lookup-quote-4", sheet: priceList, target: "G5", taskLabel: labels.review, title: L("P05 报价四舍五入到十元", "Round the P05 quote to tens", "P05 見積を十円単位に丸める"), lead: L("在 G5 查 P05 单价，乘数量 H4，再除 10 后四舍五入并乘回 10。", "In G5, look up P05 price, multiply by H4, divide by 10, round, then multiply back.", "G5 で P05 単価に H4 を掛け、10で割って丸め、再び10を掛けます。"), hint: L("参考：=ROUND(VLOOKUP(F4,$A$2:$E$7,3,FALSE)*H4/10,0)*10", "Reference: =ROUND(VLOOKUP(F4,$A$2:$E$7,3,FALSE)*H4/10,0)*10", "参考：=ROUND(VLOOKUP(F4,$A$2:$E$7,3,FALSE)*H4/10,0)*10"), formula: "=ROUND(VLOOKUP(F4,$A$2:$E$7,3,FALSE)*H4/10,0)*10", requiredFunctions: ["ROUND", "VLOOKUP"] }),
            task({ id: "lookup-quote-5", sheet: priceList, target: "G6", taskLabel: labels.review, title: L("缺失商品直接进入待补资料", "Send a missing item to follow-up", "存在しない商品を要確認にする"), lead: L("在 G6 用 IFERROR 查 P88，找不到返回 FOLLOWUP，找到则返回 FOUND。", "In G6, IFERROR lookup P88: return FOLLOWUP when missing, FOUND otherwise.", "G6 で P88 を IFERROR 検索し、見つからない場合は FOLLOWUP、見つかった場合は FOUND を返します。"), hint: L('参考：=IFERROR(IF(VLOOKUP("P88",$A$2:$E$7,3,FALSE)>0,"FOUND"),"FOLLOWUP")', 'Reference: =IFERROR(IF(VLOOKUP("P88",$A$2:$E$7,3,FALSE)>0,"FOUND"),"FOLLOWUP")', '参考：=IFERROR(IF(VLOOKUP("P88",$A$2:$E$7,3,FALSE)>0,"FOUND"),"FOLLOWUP")'), formula: '=IFERROR(IF(VLOOKUP("P88",$A$2:$E$7,3,FALSE)>0,"FOUND"),"FOLLOWUP")', requiredFunctions: ["IFERROR", "IF", "VLOOKUP"] }),
            task({ id: "lookup-quote-6", sheet: priceList, target: "G7", taskLabel: labels.review, title: L("统计库存高于 20 的商品数", "Count products with stock above 20", "在庫20超の商品数を数える"), lead: L("在 G7 用 COUNTIF 统计 D2:D7 中大于 20 的库存。复习条件计数。", "In G7, COUNTIF D2:D7 for stock above 20, reusing conditional counts.", "G7 で COUNTIF を使い、D2:D7 の20超を数えます。"), hint: L('参考：=COUNTIF(D2:D7,">20")', 'Reference: =COUNTIF(D2:D7,">20")', '参考：=COUNTIF(D2:D7,">20")'), formula: '=COUNTIF(D2:D7,">20")', requiredFunctions: ["COUNTIF"] }),
          ],
          hint: L("查找只是中间步骤，最后的结果要对应业务问题：金额、库存状态或统计值。", "Lookup is an intermediate step; the final result must answer the business question: amount, stock status, or count.", "検索は中間段階です。最終結果は金額、在庫状態、件数など業務の問いに合わせます。"),
        }),
        practice({
          id: "lookup-review-final",
          title: L("查找章节最终抽题", "Lookup chapter final draw", "検索章の最終ランダム問題"),
          lead: L("最终抽题会混合 VLOOKUP、HLOOKUP、INDEX+MATCH、IFERROR 与旧的条件统计。", "The final draw mixes VLOOKUP, HLOOKUP, INDEX+MATCH, IFERROR, and prior conditional counts.", "VLOOKUP、HLOOKUP、INDEX+MATCH、IFERROR、既習の条件集計を混ぜて出題します。"),
          sheet: priceList,
          tasks: reviewTasks("lookup-review-final"),
          hint: L("先确认查找方向和返回位置，再处理外层业务逻辑。", "Confirm lookup direction and return position first, then handle the outer business logic.", "検索方向と戻り位置を確認してから外側の業務ロジックを組み立てます。"),
        }),
      ], { xp: 50 }),
    ],
  });
})();


