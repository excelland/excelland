(function () {
  "use strict";

  function L(zh, en, ja, zhTW) {
    const localize = (value, language) => {
      if (window.I18N && window.I18N.localizeText) return window.I18N.localizeText(value, language);
      if (language === "zh-TW" && window.I18N) return window.I18N.convertTraditional(value);
      return value;
    };
    const source = {
      en: en == null ? zh : en,
      ja: ja == null ? zh : ja,
      "zh-TW": zhTW == null ? zh : zhTW,
    };
    if (window.I18N && window.I18N.lazyLocalized) {
      return window.I18N.lazyLocalized((language) => localize(source[language], language), {
        "zh-CN": zh,
      });
    }
    return {
      "zh-CN": zh,
      en: localize(source.en, "en"),
      ja: localize(source.ja, "ja"),
      "zh-TW": localize(source["zh-TW"], "zh-TW"),
    };
  }

  const salesSheet = {
    A1: L("商品", "Product", "商品"),
    B1: L("一月", "Jan", "1月"),
    C1: L("二月", "Feb", "2月"),
    D1: L("三月", "Mar", "3月"),
    E1: L("合计", "Total", "合計"),
    F1: L("专项", "Special", "特別"),
    A2: L("笔记本", "Laptop", "ノートPC"),
    B2: 1200,
    C2: 980,
    D2: 860,
    A3: L("机械键盘", "Keyboard", "キーボード"),
    B3: 760,
    C3: 1120,
    D3: 640,
    A4: L("显示器", "Monitor", "モニター"),
    B4: 1580,
    C4: 1340,
    D4: 1220,
    A5: L("耳机", "Headset", "ヘッドセット"),
    B5: 420,
    C5: 360,
    D5: 510,
    A6: L("月度合计", "Monthly total", "月合計"),
  };

  const gradeSheet = {
    A1: L("姓名", "Name", "名前"),
    B1: L("成绩", "Score", "点数"),
    C1: L("结果", "Result", "判定"),
    A2: L("林晓", "Olivia Bennett", "佐藤美咲", "林雅婷"),
    B2: 58,
    A3: L("陈凯", "Ethan Cole", "鈴木健太", "陳冠宇"),
    B3: 76,
    A4: L("周宁", "Maya Reed", "高橋結衣", "周怡君"),
    B4: 92,
  };

  const lookupSheet = {
    A1: L("编号", "ID", "ID"),
    B1: L("商品", "Product", "商品"),
    C1: L("单价", "Price", "単価"),
    D1: L("库存", "Stock", "在庫"),
    A2: "P01",
    B2: L("钢笔", "Pen", "ペン"),
    C2: 12,
    D2: 80,
    A3: "P02",
    B3: L("笔记本", "Notebook", "ノート"),
    C3: 28,
    D3: 45,
    A4: "P03",
    B4: L("背包", "Backpack", "バックパック"),
    C4: 95,
    D4: 18,
  };

  const textSheet = {
    A1: L("编码", "Code", "コード"),
    B1: L("前缀", "Prefix", "接頭辞"),
    C1: L("年份", "Year", "年"),
    D1: L("序号", "Sequence", "連番"),
    A2: "EXAM-2026-001",
    A3: "EXAM-2026-002",
    A4: "EXAM-2026-003",
  };

  const capstoneSheet = {
    A1: L("类别", "Category", "分類"),
    B1: L("商品", "Item", "商品"),
    C1: L("一月", "Jan", "1月"),
    D1: L("二月", "Feb", "2月"),
    E1: L("三月", "Mar", "3月"),
    F1: L("合计", "Total", "合計"),
    A2: L("笔记本", "Laptop", "ノートPC"),
    B2: L("轻便本", "Ultralight", "軽量モデル"),
    C2: 1200,
    D2: 980,
    E2: 860,
    A3: L("笔记本", "Laptop", "ノートPC"),
    B3: L("性能本", "Performance", "高性能モデル"),
    C3: 760,
    D3: 1120,
    E3: 640,
    A4: L("显示器", "Monitor", "モニター"),
    B4: L("27英寸", "27-inch", "27インチ"),
    C4: 1580,
    D4: 1340,
    E4: 1220,
    A5: L("配件", "Accessory", "アクセサリー"),
    B5: L("耳机", "Headset", "ヘッドセット"),
    C5: 420,
    D5: 360,
    E5: 510,
    A6: L("月度合计", "Monthly total", "月合計"),
  };

  const referenceSheet = {
    A1: L("项目", "Item", "項目"),
    B1: L("数量", "Qty", "数量"),
    A2: L("早餐", "Breakfast", "朝食"),
    B2: 35,
    A3: L("午餐", "Lunch", "昼食"),
    B3: 42,
    A4: L("咖啡", "Coffee", "コーヒー"),
    B4: 18,
    A5: L("水果", "Fruit", "果物"),
    B5: 33,
    A6: L("合计", "Total", "合計"),
  };

  const financeSheet = {
    A1: L("项目", "Project", "プロジェクト"),
    B1: L("年利率", "Annual rate", "年利率"),
    C1: L("期数", "Periods", "期間"),
    D1: L("金额", "Amount", "金額"),
    E1: L("每期付款", "Payment", "毎回支払額"),
    A2: L("购车贷款", "Car loan", "自動車ローン"),
    B2: 0.05,
    C2: 36,
    D2: 120000,
    A3: L("设备租赁", "Equipment lease", "機器リース"),
    B3: 0.06,
    C3: 24,
    D3: 80000,
    A4: L("教育储蓄", "Education fund", "教育資金"),
    B4: 0.04,
    C4: 120,
    D4: 5000,
    A5: L("创业资金", "Startup loan", "起業資金"),
    B5: 0.055,
    C5: 60,
    D5: 200000,
  };

  const dateSheet = {
    A1: L("日期", "Date", "日付"),
    B1: L("年", "Year", "年"),
    C1: L("月", "Month", "月"),
    D1: L("日", "Day", "日"),
    A2: "2026-01-15",
    A3: "2026-06-08",
    A4: "2027-03-21",
    A5: "2025-12-31",
  };

  const formulaFunctions = [
    { name: "SUM", symbol: "Σ", unlockAtLevel: "formula-syntax", label: L("求和", "Sum", "合計"), description: L("把区域或多个数字一次加起来", "Add a range or several numbers", "範囲や複数の数値を合計します"), signature: "SUM(number1, [number2], …)" },
    { name: "AVERAGE", symbol: "μ", unlockAtLevel: "core-functions", label: L("平均值", "Average", "平均"), description: L("计算一组数字的算术平均数", "Calculate the arithmetic mean", "数値の平均を求めます"), signature: "AVERAGE(number1, [number2], …)" },
    { name: "COUNT", symbol: "#", unlockAtLevel: "core-functions", label: L("计数", "Count numbers", "数値の個数"), description: L("统计区域中数字单元格的个数", "Count numeric cells in a range", "範囲内の数値セルの個数"), signature: "COUNT(value1, [value2], …)" },
    { name: "COUNTA", symbol: "A#", unlockAtLevel: "core-functions", label: L("非空计数", "Count non-empty", "空白以外の個数"), description: L("统计区域中非空单元格的个数", "Count non-empty cells", "空白以外のセルの個数"), signature: "COUNTA(value1, [value2], …)" },
    { name: "MAX", symbol: "↑", unlockAtLevel: "core-functions", label: L("最大值", "Maximum", "最大値"), description: L("返回区域中的最大数字", "Return the largest number", "範囲内の最大値を返します"), signature: "MAX(number1, [number2], …)" },
    { name: "MIN", symbol: "↓", unlockAtLevel: "core-functions", label: L("最小值", "Minimum", "最小値"), description: L("返回区域中的最小数字", "Return the smallest number", "範囲内の最小値を返します"), signature: "MIN(number1, [number2], …)" },
    { name: "ROUND", symbol: "≈", unlockAtLevel: "core-functions", label: L("四舍五入", "Round", "四捨五入"), description: L("按指定小数位数四舍五入", "Round to a specified number of digits", "指定した桁数で四捨五入します"), signature: "ROUND(number, num_digits)" },
    { name: "INT", symbol: "⌊", unlockAtLevel: "core-functions", label: L("向下取整", "Integer", "整数化"), description: L("向下舍入到最接近的整数", "Round down to the nearest integer", "小さい方の整数に丸めます"), signature: "INT(number)" },
    { name: "ABS", symbol: "||", unlockAtLevel: "core-functions", label: L("绝对值", "Absolute", "絶対値"), description: L("返回数字的绝对值", "Return the absolute value", "数値の絶対値を返します"), signature: "ABS(number)" },
    { name: "MOD", symbol: "%", unlockAtLevel: "core-functions", label: L("求余数", "Remainder", "余り"), description: L("返回两个数相除的余数", "Return the remainder after division", "除算の余りを返します"), signature: "MOD(number, divisor)" },
    { name: "IF", symbol: "IF", unlockAtLevel: "logic", label: L("条件判断", "Conditional", "条件判定"), description: L("条件成立时返回一个值，否则返回另一个值", "Return one value when a condition is true and another when false", "条件が真なら一方、偽ならもう一方を返します"), signature: "IF(logical_test, value_if_true, [value_if_false])" },
    { name: "AND", symbol: "∧", unlockAtLevel: "logic", label: L("同时成立", "All true", "すべて真"), description: L("所有条件都成立时返回 TRUE", "Return TRUE only when all conditions are true", "すべての条件が真のとき TRUE"), signature: "AND(logical1, [logical2], …)" },
    { name: "OR", symbol: "∨", unlockAtLevel: "logic", label: L("任一成立", "Any true", "いずれか真"), description: L("任一条件成立时返回 TRUE", "Return TRUE when any condition is true", "いずれかの条件が真なら TRUE"), signature: "OR(logical1, [logical2], …)" },
    { name: "COUNTIF", symbol: "C?", unlockAtLevel: "lookup-aggregation", label: L("条件计数", "Count if", "条件付き個数"), description: L("统计满足一个条件的单元格数量", "Count cells that meet one condition", "1つの条件を満たすセルを数えます"), signature: "COUNTIF(range, criteria)" },
    { name: "SUMIF", symbol: "Σ?", unlockAtLevel: "lookup-aggregation", label: L("条件求和", "Sum if", "条件付き合計"), description: L("只对满足条件的对应数值求和", "Sum corresponding values that meet a condition", "条件を満たす対応値を合計します"), signature: "SUMIF(range, criteria, [sum_range])" },
    { name: "SUMPRODUCT", symbol: "×Σ", unlockAtLevel: "lookup-aggregation", label: L("数组乘积和", "Product sum", "配列積和"), description: L("把多个数组对应项相乘后再求和", "Multiply corresponding array items and sum the products", "配列の対応要素を掛けて合計します"), signature: "SUMPRODUCT(array1, [array2], …)" },
    { name: "VLOOKUP", symbol: "⌕", unlockAtLevel: "lookup-aggregation", label: L("纵向查找", "Vertical lookup", "縦検索"), description: L("在表格首列查找并返回指定列的数据", "Search the first column and return a value from another column", "先頭列を検索し指定列の値を返します"), signature: "VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])" },
    { name: "RANK", symbol: "№", unlockAtLevel: "lookup-aggregation", label: L("排名", "Rank", "順位"), description: L("返回数字在一组数字中的排名", "Return the rank of a number in a list", "数値の順位を返します"), signature: "RANK(number, ref, [order])" },
    { name: "LEFT", symbol: "L<", unlockAtLevel: "text-functions", label: L("左取文本", "Left text", "左側の文字"), description: L("从文本左侧截取指定数量的字符", "Take characters from the left of text", "文字列の左から指定数を取り出します"), signature: "LEFT(text, [num_chars])" },
    { name: "RIGHT", symbol: "R>", unlockAtLevel: "text-functions", label: L("右取文本", "Right text", "右側の文字"), description: L("从文本右侧截取指定数量的字符", "Take characters from the right of text", "文字列の右から指定数を取り出します"), signature: "RIGHT(text, [num_chars])" },
    { name: "MID", symbol: "<>", unlockAtLevel: "text-functions", label: L("中间截取", "Middle text", "中間の文字"), description: L("从指定位置开始截取一段文本", "Extract text from a starting position", "指定位置から文字列を取り出します"), signature: "MID(text, start_num, num_chars)" },
    { name: "LEN", symbol: "L#", unlockAtLevel: "text-functions", label: L("文本长度", "Length", "文字数"), description: L("返回文本包含的字符数量", "Return the number of characters", "文字数を返します"), signature: "LEN(text)" },
    { name: "CONCATENATE", symbol: "&", unlockAtLevel: "text-functions", label: L("连接文本", "Concatenate", "文字列連結"), description: L("把多个文本值连接成一个文本", "Join multiple text values", "複数の文字列を連結します"), signature: "CONCATENATE(text1, [text2], …)" },
    { name: "TRIM", symbol: "⌫", unlockAtLevel: "text-functions", label: L("清理空格", "Trim spaces", "空白整理"), description: L("删除首尾空格并把中间连续空格压成一个", "Remove edge spaces and collapse repeated inner spaces", "前後の空白を削除し中の連続空白を1つにします"), signature: "TRIM(text)" },
    { name: "UPPER", symbol: "AA", unlockAtLevel: "text-functions", label: L("大写", "Uppercase", "大文字"), description: L("把文本全部转换为大写", "Convert text to uppercase", "文字列を大文字にします"), signature: "UPPER(text)" },
    { name: "LOWER", symbol: "aa", unlockAtLevel: "text-functions", label: L("小写", "Lowercase", "小文字"), description: L("把文本全部转换为小写", "Convert text to lowercase", "文字列を小文字にします"), signature: "LOWER(text)" },
    { name: "FIND", symbol: "⌕A", unlockAtLevel: "text-functions", label: L("区分大小写查找", "Case-sensitive find", "大文字小文字を区別"), description: L("查找文本并区分大小写", "Find text with case sensitivity", "大文字小文字を区別して文字を探します"), signature: "FIND(find_text, within_text, [start_num])" },
    { name: "SEARCH", symbol: "⌕a", unlockAtLevel: "text-functions", label: L("不区分大小写查找", "Case-insensitive find", "大文字小文字を無視"), description: L("查找文本且不区分大小写，可使用通配符", "Find text without case sensitivity", "大文字小文字を区別せず文字を探します"), signature: "SEARCH(find_text, within_text, [start_num])" },
    { name: "IFERROR", symbol: "!", unlockAtLevel: "logic", label: L("错误处理", "Error handler", "エラー処理"), description: L("公式出错时返回指定结果，否则返回原结果", "Return a fallback when a formula errors", "エラー時に代替値を返します"), signature: "IFERROR(value, value_if_error)" },
    { name: "COUNTIFS", symbol: "C??", unlockAtLevel: "lookup-aggregation", label: L("多条件计数", "Count with conditions", "複数条件の個数"), description: L("统计同时满足多个条件的行数", "Count rows that meet several conditions", "複数条件を満たす行を数えます"), signature: "COUNTIFS(criteria_range1, criteria1, …)" },
    { name: "SUMIFS", symbol: "Σ??", unlockAtLevel: "lookup-aggregation", label: L("多条件求和", "Sum with conditions", "複数条件の合計"), description: L("对同时满足多个条件的数值求和", "Sum values that meet several conditions", "複数条件を満たす値を合計します"), signature: "SUMIFS(sum_range, criteria_range1, criteria1, …)" },
    { name: "AVERAGEIF", symbol: "μ?", unlockAtLevel: "lookup-aggregation", label: L("条件平均", "Average if", "条件付き平均"), description: L("计算满足条件的数据平均值", "Average values that meet a condition", "条件を満たす値の平均を求めます"), signature: "AVERAGEIF(range, criteria, [average_range])" },
    { name: "AVERAGEIFS", symbol: "μ??", unlockAtLevel: "lookup-aggregation", label: L("多条件平均", "Average with conditions", "複数条件の平均"), description: L("计算同时满足多个条件的数据平均值", "Average values that meet several conditions", "複数条件を満たす値の平均を求めます"), signature: "AVERAGEIFS(average_range, criteria_range1, criteria1, …)" },
    { name: "INDEX", symbol: "▦", unlockAtLevel: "lookup-aggregation", label: L("按位置取值", "Value by position", "位置で値を取得"), description: L("按行号、列号从区域中返回单元格", "Return a cell by row and column position", "行番号と列番号でセルの値を返します"), signature: "INDEX(array, row_num, [column_num])" },
    { name: "MATCH", symbol: "⇔", unlockAtLevel: "lookup-aggregation", label: L("查找位置", "Find position", "位置を検索"), description: L("返回查找值在区域中的相对位置", "Return the relative position of a value", "検索値の相対位置を返します"), signature: "MATCH(lookup_value, lookup_array, [match_type])" },
    { name: "HLOOKUP", symbol: "H<>", unlockAtLevel: "lookup-aggregation", label: L("横向查找", "Horizontal lookup", "横検索"), description: L("在首行查找并返回指定行的数据", "Search the first row and return a row value", "先頭行を検索し指定行の値を返します"), signature: "HLOOKUP(lookup_value, table_array, row_index_num, [range_lookup])" },
    { name: "TEXT", symbol: "Aa", unlockAtLevel: "text-functions", label: L("设置文本格式", "Format as text", "文字列の書式設定"), description: L("把数字或日期按指定格式转成文本", "Convert a number or date to formatted text", "数値や日付を指定書式の文字列にします"), signature: "TEXT(value, format_text)" },
    { name: "TODAY", symbol: "T", unlockAtLevel: "text-functions", label: L("今天日期", "Today", "今日"), description: L("返回今天的日期", "Return today's date", "今日の日付を返します"), signature: "TODAY()" },
    { name: "NOW", symbol: "T!", unlockAtLevel: "text-functions", label: L("当前日期时间", "Now", "現在日時"), description: L("返回当前日期和时间", "Return the current date and time", "現在の日時を返します"), signature: "NOW()" },
    { name: "YEAR", symbol: "Y", unlockAtLevel: "text-functions", label: L("提取年份", "Year", "年を抽出"), description: L("从日期中提取年份", "Extract the year from a date", "日付から年を取り出します"), signature: "YEAR(serial_number)" },
    { name: "MONTH", symbol: "M", unlockAtLevel: "text-functions", label: L("提取月份", "Month", "月を抽出"), description: L("从日期中提取月份", "Extract the month from a date", "日付から月を取り出します"), signature: "MONTH(serial_number)" },
    { name: "DAY", symbol: "D", unlockAtLevel: "text-functions", label: L("提取日", "Day", "日を抽出"), description: L("从日期中提取日", "Extract the day from a date", "日付から日を取り出します"), signature: "DAY(serial_number)" },
    { name: "DATE", symbol: "D", unlockAtLevel: "text-functions", label: L("生成日期", "Build date", "日付を作成"), description: L("用年、月、日生成日期序列值", "Build a date from year, month, and day", "年、月、日から日付を作成します"), signature: "DATE(year, month, day)" },
    { name: "PMT", symbol: "¥", unlockAtLevel: "text-functions", label: L("每期付款", "Payment", "毎回支払額"), description: L("计算固定利率贷款的每期付款额", "Calculate the payment for a fixed-rate loan", "固定金利ローンの毎回支払額を計算します"), signature: "PMT(rate, nper, pv, [fv], [type])" },
    { name: "FV", symbol: "F¥", unlockAtLevel: "text-functions", label: L("未来值", "Future value", "将来価値"), description: L("计算投资或储蓄的未来值", "Calculate the future value of an investment", "投資や貯蓄の将来価値を計算します"), signature: "FV(rate, nper, pmt, [pv], [type])" },
    { name: "PV", symbol: "P¥", unlockAtLevel: "text-functions", label: L("现值", "Present value", "現在価値"), description: L("计算一系列未来付款的现值", "Calculate the present value of future payments", "将来の支払いの現在価値を計算します"), signature: "PV(rate, nper, pmt, [fv], [type])" },
    { name: "ROUNDUP", symbol: "⇧", unlockAtLevel: "core-functions", label: L("向上舍入", "Round up", "切り上げ"), description: L("按指定小数位向上舍入", "Round away from zero", "指定桁数で切り上げます"), signature: "ROUNDUP(number, num_digits)" },
    { name: "ROUNDDOWN", symbol: "⇩", unlockAtLevel: "core-functions", label: L("向下舍入", "Round down", "切り捨て"), description: L("按指定小数位向下舍入", "Round toward zero", "指定桁数で切り捨てます"), signature: "ROUNDDOWN(number, num_digits)" },
    { name: "TRUNC", symbol: "T", unlockAtLevel: "core-functions", label: L("截断小数", "Truncate", "小数を切り捨て"), description: L("直接截去指定小数位，不进行四舍五入", "Remove decimal digits without rounding", "四捨五入せず小数を切り捨てます"), signature: "TRUNC(number, [num_digits])" },
    { name: "SUBTOTAL", symbol: "ST", unlockAtLevel: "data-tools", label: L("分类汇总函数", "Subtotal", "集計関数"), description: L("按函数编号对筛选后的数据分类汇总", "Aggregate visible data by function number", "関数番号で表示中のデータを集計します"), signature: "SUBTOTAL(function_num, ref1, …)" },
    { name: "POWER", symbol: "x^y", unlockAtLevel: "advanced-logic-text", label: L("乘幂", "Power", "べき乗", "乘冪"), description: L("返回一个数的指定次方", "Raise a number to a power", "数値を指定した累乗にします", "傳回數字的指定次方"), signature: "POWER(number, power)" },
    { name: "SQRT", symbol: "√", unlockAtLevel: "advanced-logic-text", label: L("平方根", "Square root", "平方根", "平方根"), description: L("返回一个非负数的平方根", "Return the square root of a non-negative number", "0以上の数値の平方根を返します", "傳回非負數的平方根"), signature: "SQRT(number)" },
    { name: "NOT", symbol: "!", unlockAtLevel: "advanced-logic-text", label: L("逻辑取反", "Logical not", "論理否定", "邏輯反轉"), description: L("把 TRUE 变 FALSE，把 FALSE 变 TRUE", "Reverse TRUE to FALSE and FALSE to TRUE", "TRUE を FALSE、FALSE を TRUE に反転します", "將 TRUE 變為 FALSE，將 FALSE 變為 TRUE"), signature: "NOT(logical)" },
    { name: "IFS", symbol: "IFS", unlockAtLevel: "advanced-logic-text", label: L("多条件判断", "Multiple conditions", "複数条件", "多條件判斷"), description: L("按顺序检查多个条件并返回第一个成立的结果", "Test several conditions in order and return the first match", "複数の条件を順に確認し、最初に成立した結果を返します", "依序檢查多個條件並傳回第一個成立的結果"), signature: "IFS(logical_test1, value_if_true1, [logical_test2, value_if_true2], …)" },
    { name: "SWITCH", symbol: "⇄", unlockAtLevel: "advanced-logic-text", label: L("值匹配", "Value mapping", "値の対応", "值對應"), description: L("按匹配值返回对应结果，并可提供默认值", "Map a value to a result with an optional fallback", "一致する値に対応する結果を返し、既定値も指定できます", "依符合值傳回對應結果，並可提供預設值"), signature: "SWITCH(expression, value1, result1, [value2, result2], …, [default])" },
    { name: "SUBSTITUTE", symbol: "S", unlockAtLevel: "advanced-logic-text", label: L("替换文本", "Substitute text", "文字置換", "取代文字"), description: L("用新文本替换指定文本的全部或第 N 次出现", "Replace specified text, optionally at one occurrence", "指定した文字を置換し、必要なら指定回目だけに適用します", "以新文字取代指定文字，或只取代第 N 次出現"), signature: "SUBSTITUTE(text, old_text, new_text, [instance_num])" },
    { name: "REPLACE", symbol: "R<>", unlockAtLevel: "advanced-logic-text", label: L("按位置替换", "Replace by position", "位置指定置換", "依位置取代"), description: L("从指定位置开始按字符数替换文本", "Replace characters starting at a given position", "指定位置から文字数分を別の文字列に置換します", "從指定位置開始依字元數取代文字"), signature: "REPLACE(old_text, start_num, num_chars, new_text)" },
    { name: "VALUE", symbol: "#", unlockAtLevel: "advanced-logic-text", label: L("文本转数值", "Convert to number", "数値変換", "文字轉數值"), description: L("把表示数字的文本转换成数值", "Convert numeric text into a number", "数値を表す文字列を数値に変換します", "把表示數字的文字轉成數值"), signature: "VALUE(text)" },
    { name: "PROPER", symbol: "Aa", unlockAtLevel: "advanced-logic-text", label: L("单词首字母大写", "Proper case", "先頭文字を大文字", "字首大寫"), description: L("把每个单词的首字母改为大写", "Capitalize the first letter of each word", "各単語の先頭文字を大文字にします", "將每個單字的首字母改為大寫"), signature: "PROPER(text)" },
    { name: "CONCAT", symbol: "&", unlockAtLevel: "advanced-logic-text", label: L("连接文本", "Concatenate", "文字列連結", "連接文字"), description: L("把多个文本或区域直接连接起来", "Join text values or ranges into one string", "複数の文字列や範囲を1つの文字列に連結します", "將多個文字或範圍直接連接起來"), signature: "CONCAT(text1, [text2], …)" },
    { name: "TEXTJOIN", symbol: "TJ", unlockAtLevel: "advanced-logic-text", label: L("带分隔符连接", "Join with delimiter", "区切り文字付き連結", "以分隔符連接"), description: L("用分隔符连接区域，并可忽略空白", "Join text with a delimiter and optionally ignore blanks", "区切り文字で連結し、空白を無視できます", "以分隔符號連接範圍，並可忽略空白"), signature: "TEXTJOIN(delimiter, ignore_empty, text1, [text2], …)" },
    { name: "REPT", symbol: "…", unlockAtLevel: "advanced-logic-text", label: L("重复文本", "Repeat text", "文字列の繰り返し", "重複文字"), description: L("按指定次数重复文本", "Repeat text a specified number of times", "文字列を指定回数繰り返します", "依指定次數重複文字"), signature: "REPT(text, number_times)" },
    { name: "COUNTBLANK", symbol: "□#", unlockAtLevel: "advanced-reference-date", label: L("统计空白", "Count blanks", "空白セル数", "計算空白"), description: L("统计区域中空白单元格的数量", "Count blank cells in a range", "範囲内の空白セルの数を数えます", "統計範圍中空白儲存格的數量"), signature: "COUNTBLANK(range)" },
    { name: "MEDIAN", symbol: "M", unlockAtLevel: "advanced-reference-date", label: L("中位数", "Median", "中央値", "中位數"), description: L("返回一组数值的中位数", "Return the median of a set of numbers", "数値セットの中央値を返します", "傳回一組數值的中位數"), signature: "MEDIAN(number1, [number2], …)" },
    { name: "LARGE", symbol: "k↑", unlockAtLevel: "advanced-reference-date", label: L("第 k 大值", "Kth largest", "k番目に大きい値", "第 k 大值"), description: L("返回数组或区域中第 k 大的值", "Return the kth largest value in an array", "配列または範囲のk番目に大きい値を返します", "傳回陣列或範圍中第 k 大的值"), signature: "LARGE(array, k)" },
    { name: "SMALL", symbol: "k↓", unlockAtLevel: "advanced-reference-date", label: L("第 k 小值", "Kth smallest", "k番目に小さい値", "第 k 小值"), description: L("返回数组或区域中第 k 小的值", "Return the kth smallest value in an array", "配列または範囲のk番目に小さい値を返します", "傳回陣列或範圍中第 k 小的值"), signature: "SMALL(array, k)" },
    { name: "RANK.EQ", symbol: "R=", unlockAtLevel: "advanced-reference-date", label: L("相同排名", "Equal rank", "同順位", "相同排名"), description: L("返回数值在列表中的排名，相同值共享名次", "Rank a number in a list, with ties sharing a rank", "一覧内の順位を返し、同値は同順位になります", "傳回數值在清單中的排名，相同值共用名次"), signature: "RANK.EQ(number, ref, [order])" },
    { name: "CEILING", symbol: "⌃", unlockAtLevel: "advanced-reference-date", label: L("向上取整到倍数", "Ceiling multiple", "倍数に切り上げ", "向上取至倍數"), description: L("把数值向上取到指定倍数", "Round a number up to a multiple", "数値を指定倍数へ切り上げます", "把數值向上取至指定倍數"), signature: "CEILING(number, significance)" },
    { name: "FLOOR", symbol: "⌄", unlockAtLevel: "advanced-reference-date", label: L("向下取整到倍数", "Floor multiple", "倍数に切り捨て", "向下取至倍數"), description: L("把数值向下取到指定倍数", "Round a number down to a multiple", "数値を指定倍数へ切り捨てます", "把數值向下取至指定倍數"), signature: "FLOOR(number, significance)" },
    { name: "RAND", symbol: "?", unlockAtLevel: "advanced-reference-date", label: L("随机小数", "Random decimal", "乱数", "隨機小數"), description: L("返回 0 到 1 之间的随机小数", "Return a random decimal from 0 up to 1", "0以上1未満の乱数を返します", "傳回 0 到 1 之間的隨機小數"), signature: "RAND()" },
    { name: "RANDBETWEEN", symbol: "R?", unlockAtLevel: "advanced-reference-date", label: L("随机整数", "Random integer", "範囲内の乱数整数", "隨機整數"), description: L("返回指定上下限之间的随机整数", "Return a random integer between two bounds", "指定した下限と上限の間の整数を返します", "傳回指定上下限之間的隨機整數"), signature: "RANDBETWEEN(bottom, top)" },
    { name: "CHOOSE", symbol: "1/2", unlockAtLevel: "advanced-reference-date", label: L("按索引选择", "Choose by index", "インデックスで選択", "依索引選擇"), description: L("按索引号返回对应位置的值", "Return a value at the given index", "指定した番号の位置にある値を返します", "依索引號傳回對應位置的值"), signature: "CHOOSE(index_num, value1, [value2], …)" },
    { name: "OFFSET", symbol: "OF", unlockAtLevel: "advanced-reference-date", label: L("偏移引用", "Offset reference", "範囲のオフセット", "位移參照"), description: L("从起点按行列偏移返回引用区域", "Return a range offset by rows and columns", "基準から行・列をずらした参照を返します", "從起點依列欄位移傳回參照範圍"), signature: "OFFSET(reference, rows, cols, [height], [width])" },
    { name: "INDIRECT", symbol: "→", unlockAtLevel: "advanced-reference-date", label: L("间接引用", "Indirect reference", "間接参照", "間接參照"), description: L("把文本地址转换成单元格引用", "Turn a text address into a cell reference", "文字のアドレスをセル参照に変換します", "把文字位址轉換成儲存格參照"), signature: "INDIRECT(ref_text, [a1])" },
    { name: "ROW", symbol: "#R", unlockAtLevel: "advanced-reference-date", label: L("行号", "Row number", "行番号", "列號"), description: L("返回引用的行号", "Return the row number of a reference", "参照の行番号を返します", "傳回參照的列號"), signature: "ROW([reference])" },
    { name: "COLUMN", symbol: "#C", unlockAtLevel: "advanced-reference-date", label: L("列号", "Column number", "列番号", "欄號"), description: L("返回引用的列号", "Return the column number of a reference", "参照の列番号を返します", "傳回參照的欄號"), signature: "COLUMN([reference])" },
    { name: "ROWS", symbol: "R#", unlockAtLevel: "advanced-reference-date", label: L("行数", "Row count", "行数", "列數"), description: L("返回引用或数组的行数", "Return the number of rows in a range", "範囲または配列の行数を返します", "傳回參照或陣列的列數"), signature: "ROWS(array)" },
    { name: "COLUMNS", symbol: "C#", unlockAtLevel: "advanced-reference-date", label: L("列数", "Column count", "列数", "欄數"), description: L("返回引用或数组的列数", "Return the number of columns in a range", "範囲または配列の列数を返します", "傳回參照或陣列的欄數"), signature: "COLUMNS(array)" },
    { name: "WEEKDAY", symbol: "W", unlockAtLevel: "advanced-reference-date", label: L("星期编号", "Weekday", "曜日番号", "星期編號"), description: L("返回日期对应的星期编号", "Return the weekday number of a date", "日付の曜日番号を返します", "傳回日期對應的星期編號"), signature: "WEEKDAY(serial_number, [return_type])" },
    { name: "WEEKNUM", symbol: "W#", unlockAtLevel: "advanced-reference-date", label: L("周编号", "Week number", "週番号", "週編號"), description: L("返回日期所在的一年中的周编号", "Return the week number of a date within the year", "日付の年間週番号を返します", "傳回日期在年度中的週編號"), signature: "WEEKNUM(serial_number, [return_type])" },
    { name: "EDATE", symbol: "M+", unlockAtLevel: "advanced-reference-date", label: L("加减月份", "Add months", "月の加減", "加減月份"), description: L("按指定月数返回同一天的日期", "Return a date shifted by a number of months", "指定月数だけずらした同じ日の日付を返します", "依指定月數傳回同一天的日期"), signature: "EDATE(start_date, months)" },
    { name: "EOMONTH", symbol: "M□", unlockAtLevel: "advanced-reference-date", label: L("月末日期", "Month end", "月末日", "月底日期"), description: L("返回指定月份最后一天的日期", "Return the last day of a month", "指定した月の最終日の日付を返します", "傳回指定月份最後一天的日期"), signature: "EOMONTH(start_date, months)" },
    { name: "WORKDAY", symbol: "WD", unlockAtLevel: "advanced-reference-date", label: L("工作日日期", "Workday", "営業日", "工作天"), description: L("从起始日期前进指定工作日数", "Advance a date by a number of workdays", "開始日から指定営業日だけ進めた日付を返します", "從起始日期前進指定工作天數"), signature: "WORKDAY(start_date, days, [holidays])" },
    { name: "NETWORKDAYS", symbol: "WD#", unlockAtLevel: "advanced-reference-date", label: L("工作日数", "Workdays", "営業日数", "工作天數"), description: L("统计两个日期之间的工作日数", "Count workdays between two dates", "2つの日付の間の営業日数を数えます", "統計兩個日期之間的工作天數"), signature: "NETWORKDAYS(start_date, end_date, [holidays])" },
    { name: "DATEDIF", symbol: "ΔD", unlockAtLevel: "advanced-reference-date", label: L("日期差异", "Date difference", "日付の差", "日期差異"), description: L("按年、月或日计算两个日期的差异", "Calculate the difference between two dates in years, months, or days", "年・月・日単位で2つの日付の差を計算します", "依年、月或日計算兩個日期的差異"), signature: "DATEDIF(start_date, end_date, unit)" },
    { name: "NPV", symbol: "NPV", unlockAtLevel: "advanced-finance-db", label: L("净现值", "Net present value", "正味現在価値", "淨現值"), description: L("按折现率计算未来现金流的净现值", "Discount future cash flows at a given rate", "割引率で将来キャッシュフローの現在価値を計算します", "依折現率計算未來現金流的淨現值"), signature: "NPV(rate, value1, [value2], …)" },
    { name: "IRR", symbol: "IRR", unlockAtLevel: "advanced-finance-db", label: L("内部收益率", "Internal rate of return", "内部収益率", "內部報酬率"), description: L("返回使净现值为零的折现率", "Return the rate where net present value is zero", "正味現在価値が0になる割引率を返します", "傳回使淨現值為零的折現率"), signature: "IRR(values, [guess])" },
    { name: "DSUM", symbol: "DΣ", unlockAtLevel: "advanced-finance-db", label: L("数据库求和", "Database sum", "データベース合計", "資料庫加總"), description: L("对满足条件区域的数据库记录求和", "Sum database records matching a criteria range", "条件範囲に一致するデータベースの値を合計します", "對符合條件區域的資料庫紀錄求和"), signature: "DSUM(database, field, criteria)" },
    { name: "DCOUNT", symbol: "D#", unlockAtLevel: "advanced-finance-db", label: L("数据库计数", "Database count", "データベース件数", "資料庫計數"), description: L("统计满足条件的数据库中数值记录数", "Count numeric database records matching criteria", "条件に一致するデータベースの数値レコードを数えます", "統計符合條件的資料庫數值紀錄數"), signature: "DCOUNT(database, field, criteria)" },
    { name: "DGET", symbol: "D1", unlockAtLevel: "advanced-finance-db", label: L("数据库提取", "Database get", "データベース抽出", "資料庫擷取"), description: L("返回唯一满足条件的数据库记录", "Return the single database record that matches criteria", "条件に一致する1件だけのデータベース値を返します", "傳回唯一符合條件的資料庫紀錄"), signature: "DGET(database, field, criteria)" },
    { name: "XLOOKUP", symbol: "X?", unlockAtLevel: "advanced-dynamic-office", label: L("双向查找", "Flexible lookup", "柔軟な検索", "雙向查找"), description: L("按查找数组搜索并返回对应数组中的值", "Search a lookup array and return the corresponding value from another array", "検索配列を探し、対応する戻り配列の値を返します", "依查找陣列搜尋並傳回對應陣列中的值"), signature: "XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])" },
    { name: "FILTER", symbol: "F|", unlockAtLevel: "advanced-dynamic-office", label: L("筛选数组", "Filter array", "配列の抽出", "篩選陣列"), description: L("按条件返回动态筛选结果", "Return a dynamic array of rows that meet a condition", "条件に合う行を動的配列として返します", "依條件傳回動態篩選結果"), signature: "FILTER(array, include, [if_empty])" },
    { name: "SORT", symbol: "SO", unlockAtLevel: "advanced-dynamic-office", label: L("排序数组", "Sort array", "配列の並べ替え", "排序陣列"), description: L("返回按指定列和方向排序的动态数组", "Return a sorted dynamic array by a chosen index and direction", "指定列と方向で並べ替えた動的配列を返します", "傳回依指定欄和方向排序的動態陣列"), signature: "SORT(array, [sort_index], [sort_order], [by_col])" },
    { name: "UNIQUE", symbol: "U1", unlockAtLevel: "advanced-dynamic-office", label: L("唯一值", "Unique values", "一意の値", "唯一值"), description: L("返回去重后的动态数组", "Return a dynamic array with duplicates removed", "重複を除いた動的配列を返します", "傳回去重後的動態陣列"), signature: "UNIQUE(array, [by_col], [exactly_once])" },
    { name: "GETPIVOTDATA", symbol: "P?", unlockAtLevel: "advanced-dynamic-office", label: L("读取透视数据", "Get PivotTable data", "ピボットデータの取得", "讀取樞紐資料"), description: L("按字段和项目从数据透视表中读取汇总值", "Retrieve a summarized value from a PivotTable by field and item", "フィールドと項目を指定してピボットテーブルの集計値を取得します", "依欄位和項目從樞紐分析表讀取彙總值"), signature: "GETPIVOTDATA(data_field, pivot_table, [field1, item1], …)" },
    { name: "SEQUENCE", symbol: "S#", unlockAtLevel: "advanced-dynamic-office", label: L("生成序列", "Generate sequence", "連番の生成", "產生序列"), description: L("返回指定行数、列数和步长的动态数字序列", "Return a dynamic number sequence by rows, columns, and step", "行数・列数・間隔を指定した動的な数値連番を返します", "傳回指定列數、欄數和間距的動態數字序列"), signature: "SEQUENCE(rows, [columns], [start], [step])" },
  ];

  const functionUnlocks = {
    SUM: "reference-math",
    AVERAGE: "aggregate-average",
    COUNT: "aggregate-average",
    COUNTA: "aggregate-average",
    MAX: "aggregate-extremes",
    MIN: "aggregate-extremes",
    ROUND: "aggregate-extremes",
    INT: "aggregate-extremes",
    ABS: "aggregate-extremes",
    MOD: "aggregate-extremes",
    ROUNDUP: "aggregate-extremes",
    ROUNDDOWN: "aggregate-extremes",
    TRUNC: "aggregate-extremes",
    IF: "logic-if",
    AND: "logic-if",
    OR: "logic-if",
    IFERROR: "logic-guard",
    COUNTIF: "conditional-single",
    SUMIF: "conditional-single",
    AVERAGEIF: "conditional-single",
    COUNTIFS: "conditional-multi",
    SUMIFS: "conditional-multi",
    AVERAGEIFS: "conditional-multi",
    VLOOKUP: "lookup-basic",
    HLOOKUP: "lookup-flex",
    INDEX: "lookup-flex",
    MATCH: "lookup-flex",
    LEFT: "text-extract",
    RIGHT: "text-extract",
    MID: "text-extract",
    LEN: "text-extract",
    TRIM: "text-clean",
    CONCATENATE: "text-clean",
    FIND: "text-clean",
    SEARCH: "text-clean",
    UPPER: "text-clean",
    LOWER: "text-clean",
    TEXT: "date-parts",
    TODAY: "date-parts",
    NOW: "date-parts",
    YEAR: "date-parts",
    MONTH: "date-parts",
    DAY: "date-parts",
    DATE: "date-parts",
    PMT: "finance-payment",
    FV: "finance-growth",
    PV: "finance-growth",
    RANK: "data-rank",
    SUBTOTAL: "data-subtotal",
    SUMPRODUCT: "data-sumproduct",
  };

  formulaFunctions.forEach((item) => {
    if (functionUnlocks[item.name]) item.unlockAtLevel = functionUnlocks[item.name];
  });

  const course = {
    id: "excel-formula-quest",
    expectedTotalLevels: 36,
    title: L("Excel 公式完整闯关", "EXCEL-land course", "エクセルランドの Excel コース"),
    subtitle: L("从基础操作到综合挑战，循序渐进。", "From Excel basics to a final challenge, step by step.", "Excel の基本から総合チャレンジまで段階的に学びます。"),
    chapters: [],
    formulaFunctions,
    sheets: {
      salesSheet,
      gradeSheet,
      lookupSheet,
      textSheet,
      capstoneSheet,
      referenceSheet,
      financeSheet,
      dateSheet,
    },
  };

  function registerChapter(chapter) {
    course.chapters.push(chapter);
  }

  function learnStep(id, title, lead, points, tip, example, extra) {
    return Object.assign({ id, type: "learn", title, lead, points, tip, example }, extra || {});
  }

  function choiceStep(id, title, lead, options, hint, extra) {
    return Object.assign({ id, type: "choice", title, lead, options, hint }, extra || {});
  }

  function challengeStep(id, title, lead, options, hint, extra) {
    return Object.assign({ id, type: "challenge", title, lead, options, hint }, extra || {});
  }

  function builderStep(id, title, lead, tokens, correctSequence, exampleFormula, successNote, hint, expected, extra) {
    return Object.assign({
      id,
      type: "builder",
      title,
      lead,
      tokens,
      correctSequence,
      exampleFormula,
      successNote,
      hint,
      expected,
    }, extra || {});
  }

  function sheetStep(id, title, lead, sheet, tasks, hint, extra) {
    return Object.assign({ id, type: "sheet", title, lead, sheet, tasks, hint }, extra || {});
  }

  function labStep(id, title, lead, lab, hint, success, extra) {
    return Object.assign({ id, type: "lab", title, lead, lab, hint, success }, extra || {});
  }

  function expandRange(start, end) {
    const matchStart = /^([A-Z]+)(\d+)$/.exec(String(start || ""));
    const matchEnd = /^([A-Z]+)(\d+)$/.exec(String(end || ""));
    if (!matchStart || !matchEnd) return [];
    function columnNumber(label) {
      return Array.from(label).reduce((total, character) => total * 26 + character.charCodeAt(0) - 64, 0);
    }
    function columnLabel(number) {
      let value = number;
      let label = "";
      while (value > 0) {
        const remainder = (value - 1) % 26;
        label = String.fromCharCode(65 + remainder) + label;
        value = Math.floor((value - 1) / 26);
      }
      return label;
    }
    const firstCol = columnNumber(matchStart[1]);
    const lastCol = columnNumber(matchEnd[1]);
    const firstRow = Number(matchStart[2]);
    const lastRow = Number(matchEnd[2]);
    const refs = [];
    for (let row = Math.min(firstRow, lastRow); row <= Math.max(firstRow, lastRow); row += 1) {
      for (let col = Math.min(firstCol, lastCol); col <= Math.max(firstCol, lastCol); col += 1) {
        refs.push(columnLabel(col) + row);
      }
    }
    return refs;
  }

  let normalizeTaskTargetImpl = null;

  function indexCourse() {
    if (course.__indexed) return course;
    function guideValue(source, language) {
      if (!source) return "";
      if (typeof source !== "object") return String(source);
      const value = source[language] == null ? source["zh-CN"] : source[language];
      return String(value == null ? "" : value);
    }

    function lazyGuide(resolve) {
      if (window.I18N && window.I18N.lazyLocalized) return window.I18N.lazyLocalized(resolve);
      return Object.fromEntries((window.I18N ? Object.keys(window.I18N.LANGUAGES) : ["zh-CN"])
        .map((language) => [language, resolve(language)]));
    }

    function columnIndex(letters) {
      return Array.from(String(letters || "").toUpperCase())
        .reduce((total, character) => total * 26 + character.charCodeAt(0) - 64, 0);
    }

    function columnLetters(index) {
      let value = index;
      let letters = "";
      while (value > 0) {
        const remainder = (value - 1) % 26;
        letters = String.fromCharCode(65 + remainder) + letters;
        value = Math.floor((value - 1) / 26);
      }
      return letters;
    }

    function parseCellRef(ref) {
      const match = /^\$?([A-Z]{1,3})\$?(\d{1,7})$/.exec(String(ref || "").toUpperCase());
      return match ? { col: columnIndex(match[1]), row: Number(match[2]) } : null;
    }

    function rangesInclude(ranges, cell) {
      return ranges.some((range) => cell.col >= range.firstCol && cell.col <= range.lastCol &&
        cell.row >= range.firstRow && cell.row <= range.lastRow);
    }

    function lookupRows(source, sheet) {
      const formula = guideValue(source, "zh-CN");
      const rows = new Set();
      const patterns = [
        /VLOOKUP\s*\(\s*"((?:[^"]|"")*)"\s*,\s*(\$?[A-Z]{1,3}\$?\d{1,7})\s*:\s*(\$?[A-Z]{1,3}\$?\d{1,7})/gi,
        /MATCH\s*\(\s*"((?:[^"]|"")*)"\s*,\s*(\$?[A-Z]{1,3}\$?\d{1,7})\s*:\s*(\$?[A-Z]{1,3}\$?\d{1,7})/gi,
      ];

      patterns.forEach((pattern, patternIndex) => {
        let match;
        while ((match = pattern.exec(formula))) {
          const wanted = match[1].replace(/""/g, '"').trim().toLowerCase();
          const first = parseCellRef(match[2]);
          const last = parseCellRef(match[3]);
          if (!first || !last) continue;
          const firstCol = Math.min(first.col, last.col);
          const lastCol = Math.max(first.col, last.col);
          const firstRow = Math.min(first.row, last.row);
          const lastRow = Math.max(first.row, last.row);
          if (patternIndex === 1 && firstCol !== lastCol) continue;
          for (let row = firstRow; row <= lastRow; row += 1) {
            const value = guideValue(sheet[columnLetters(firstCol) + row], "zh-CN").trim().toLowerCase();
            if (value === wanted) rows.add(row);
          }
        }
      });

      return Array.from(rows);
    }

    function formulaLayout(source, sheet) {
      const formula = guideValue(source, "zh-CN").replace(/"(?:[^"]|"")*"/g, '""');
      const refs = formula.match(/\$?[A-Z]{1,3}\$?\d{1,7}(?::\$?[A-Z]{1,3}\$?\d{1,7})?/g) || [];
      const relativeRows = new Set();
      const ranges = [];
      let maxCol = 0;

      Object.keys(sheet || {}).forEach((ref) => {
        const cell = parseCellRef(ref);
        if (cell) maxCol = Math.max(maxCol, cell.col);
      });

      refs.forEach((token) => {
        const rawParts = token.split(":");
        const parts = token.replace(/\$/g, "").split(":");
        const first = parseCellRef(parts[0]);
        const last = parseCellRef(parts[parts.length - 1]);
        if (!first || !last) return;
        const firstCol = Math.min(first.col, last.col);
        const lastCol = Math.max(first.col, last.col);
        const firstRow = Math.min(first.row, last.row);
        const lastRow = Math.max(first.row, last.row);
        maxCol = Math.max(maxCol, lastCol);
        if (parts.length === 1) {
          if (first.row > 1 && !/\$\d{1,7}$/.test(rawParts[0])) relativeRows.add(first.row);
        } else {
          ranges.push({ firstCol, lastCol, firstRow, lastRow });
          if (firstRow === lastRow && firstRow > 1 && rawParts.every((part) => !/\$\d{1,7}$/.test(part))) {
            relativeRows.add(firstRow);
          }
        }
      });

      return {
        detailRows: Array.from(relativeRows),
        lookupRows: lookupRows(source, sheet),
        ranges,
        maxCol,
      };
    }

    function targetIsAvailable(col, row, sheet, layout) {
      const candidateRef = columnLetters(col) + row;
      return !Object.prototype.hasOwnProperty.call(sheet, candidateRef) &&
        !rangesInclude(layout.ranges, { col, row });
    }

    function nextAvailableTarget(col, row, sheet, layout) {
      let candidateCol = Math.max(1, col);
      for (let index = 0; index < 30; index += 1) {
        if (targetIsAvailable(candidateCol, row, sheet, layout)) {
          return columnLetters(candidateCol) + row;
        }
        candidateCol += 1;
      }
      return columnLetters(layout.maxCol + 1) + row;
    }

    function retargetLocalized(source, oldTarget, newTarget) {
      if (!source || oldTarget === newTarget) return source;
      const escaped = oldTarget.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp("(^|[^A-Z0-9])" + escaped + "(?!\\d)", "gi");
      return lazyGuide((language) => guideValue(source, language).replace(pattern, (match, prefix) => prefix + newTarget));
    }

    function normalizeTaskTarget(item, stepSheet) {
      if (!item || item.targetNormalized) return;
      if (item.operationOnly) {
        item.target = "";
        item.targetNormalized = true;
        item.answerLayout = "operation";
        return;
      }
      const sheet = item.sheet || stepSheet || {};
      const oldTarget = String(item.target || "").toUpperCase();
      item.originalTarget = oldTarget;
      const targetCell = parseCellRef(oldTarget);

      if (item.targetRange) {
        const rangeParts = String(item.targetRange).toUpperCase().replace(/\s+/g, "").split(":");
        const rangeStart = parseCellRef(rangeParts[0]);
        if (rangeStart) {
          const rangeTarget = columnLetters(rangeStart.col) + rangeStart.row;
          item.targetRange = rangeParts.length > 1 ? rangeParts[0] + ":" + rangeParts[rangeParts.length - 1] : rangeTarget;
          item.target = rangeTarget;
          item.answerLayout = "fillRange";
          item.lead = retargetLocalized(item.lead, oldTarget, rangeTarget);
          item.hint = retargetLocalized(item.hint, oldTarget, rangeTarget);
          item.success = retargetLocalized(item.success, oldTarget, rangeTarget);
          item.title = retargetLocalized(item.title, oldTarget, rangeTarget);
          item.answerHeader = L("本题答案", "Answer", "今回の答え", "本題答案");
          item.targetNormalized = true;
          return;
        }
      }

      const layout = formulaLayout(item.formulaExample, sheet);
      const detailRows = Array.from(new Set(layout.detailRows.concat(layout.lookupRows)));
      let nextTarget = oldTarget || "A2";

      if (detailRows.length === 1) {
        const row = detailRows[0];
        const wantedCol = targetCell ? targetCell.col : layout.maxCol + 1;
        nextTarget = nextAvailableTarget(wantedCol, row, sheet, layout);
        item.answerLayout = targetCell && nextTarget === columnLetters(targetCell.col) + row
          ? "detail"
          : "detailResult";
      } else if (targetCell && targetIsAvailable(targetCell.col, targetCell.row, sheet, layout)) {
        nextTarget = columnLetters(targetCell.col) + targetCell.row;
        item.answerLayout = "summary";
      } else {
        nextTarget = nextAvailableTarget(layout.maxCol + 1, 2, sheet, layout);
        item.answerLayout = "summary";
      }

      item.lead = retargetLocalized(item.lead, oldTarget, nextTarget);
      item.hint = retargetLocalized(item.hint, oldTarget, nextTarget);
      item.success = retargetLocalized(item.success, oldTarget, nextTarget);
      item.title = retargetLocalized(item.title, oldTarget, nextTarget);
      item.target = nextTarget;
      item.answerHeader = L("本题答案", "Answer", "今回の答え", "本題答案");
      item.targetNormalized = true;
    }

    normalizeTaskTargetImpl = normalizeTaskTarget;

    course.chapters.forEach((chapter, chapterIndex) => {
      chapter.id = chapter.id || "chapter-" + (chapterIndex + 1);
      chapter.index = chapterIndex;
      chapter.number = chapterIndex + 1;
      chapter.levels = Array.isArray(chapter.levels) ? chapter.levels : [];
    });

    const levelIds = new Set();
    const stepIds = new Set();
    const levels = [];
    course.chapters.forEach((chapter) => {
      chapter.levels.forEach((level, levelIndex) => {
        if (levelIds.has(level.id)) throw new Error("Duplicate level id: " + level.id);
        levelIds.add(level.id);
        level.chapterId = chapter.id;
        level.chapterIndex = chapter.index;
        level.chapterNumber = chapter.number;
        level.levelIndex = levelIndex;
        level.globalIndex = levels.length;
        level.number = levels.length + 1;
        level.kind = level.kind || "lesson";
        level.steps = Array.isArray(level.steps) ? level.steps : [];
        level.steps.forEach((step, stepIndex) => {
          if (stepIds.has(step.id)) throw new Error("Duplicate step id: " + step.id);
          stepIds.add(step.id);
          step.levelId = level.id;
          step.levelIndex = level.globalIndex;
          step.chapterIndex = chapter.index;
          step.stepIndex = stepIndex;
          step.globalOrder = stepIndex;
        });
        level.totalSteps = level.steps.length;
        levels.push(level);
      });
    });

    course.levels = levels;
    course.totalLevels = levels.length;
    course.totalSteps = levels.reduce((total, level) => total + level.totalSteps, 0);
    course.__indexed = true;
    return course;
  }

  function normalizeLevelTasks(level) {
    if (!level || level.tasksNormalized) return level;
    if (!normalizeTaskTargetImpl) indexCourse();
    (level.steps || []).forEach((step) => {
      if (step.type === "sheet" && Array.isArray(step.tasks)) {
        step.tasks.forEach((item) => normalizeTaskTargetImpl(item, step.sheet));
      }
    });
    level.tasksNormalized = true;
    return level;
  }

  function finalizeCourse() {
    indexCourse();
    course.levels.forEach((level) => normalizeLevelTasks(level));
    return course;
  }

  window.CourseData = {
    L,
    registerChapter,
    learnStep,
    choiceStep,
    challengeStep,
    builderStep,
    sheetStep,
    labStep,
    expandRange,
    indexCourse,
    normalizeLevelTasks,
    finalizeCourse,
    course,
  };
  window.COURSE = course;
})();
