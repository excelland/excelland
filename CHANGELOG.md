# 更新日志 / Changelog

## v1.3.1

### 中文

- 重新整理项目目录：入口、应用层、核心引擎、实验室、课程内容、题库、样式、测试和文档分别归入独立目录。
- 源文件统一改名并加章节序号，课程脚本按 `01-core` 到 `11-advanced-functions` 排列，加载顺序更直观。
- 测试页移入 `tests/browser/`，Node 审计脚本移入 `tests/`，并改为从项目根目录解析路径。
- 移除 5 个已不再加载的旧课程文件和旧题库文件，减少无效文件与歧义。
- 入口 `index.html`、懒加载课程清单、样式路径和所有测试引用同步到新结构。
- 版本号更新为 `v1.3.1`，脚本与样式缓存标识统一更新；功能内容不变。
- 旧版本条目保留当时的文件名，当前结构以本节和 README 为准。

### English

- Reorganized the project into clear areas for the entry page, app layer, core engines, lab, course content, question banks, styles, tests, and documentation.
- Renamed source files and added ordered chapter prefixes; course scripts now run from `01-core` through `11-advanced-functions`.
- Moved browser checks into `tests/browser/` and Node audits into `tests/`, resolving paths from the project root.
- Removed five obsolete course and question-bank files that were no longer loaded.
- Updated `index.html`, the lazy course manifest, stylesheet paths, and every test reference to the new structure.
- Updated the release to `v1.3.1` and refreshed cache identifiers. No learning content or behavior changed.
- Historical entries keep the file names used at the time; this section and the README describe the current structure.

### Verification

- All JavaScript syntax checks pass.
- Course audit: 20 chapters, 63 levels, 251 steps, 0 errors.
- Content/language reachability: `5484` checks across 457 labs.
- Formula engine: `44 / 44`; extended functions: `40 / 40`.
- Lab audit: `88` browser checks.
- Course regression: `33 / 33`.
- App smoke test: all three modes and Settings load without runtime exceptions.

## v1.3.0

### 中文

- 新增第 13–20 章，共 8 章、27 关、107 步；课程扩展到 20 章、63 关、251 步。
- 新增 5 类、29 种交互实验室，覆盖工作簿与工作表管理、冻结与保护、命名区域、多表与三维引用、页面打印、公式审计。
- 新增条件格式与数据验证实验室：单元格规则、文本规则、数据条、色阶、图标集、公式规则，以及列表、范围、自定义公式验证。
- 新增数据整理实验室：多关键字与自定义排序、高级筛选、去重、分列、选择性粘贴、分类汇总、合并计算和分隔文本导入。
- 新增图表与迷你图实验室：柱形、条形、折线、饼图、散点、组合图、次坐标轴、图例、数据标签和趋势线。
- 新增数据透视表实验室：字段布局、聚合方式、筛选、百分比显示、日期分组、切片器、计算字段、刷新、透视图和取数。
- 新增模拟分析实验室：目标搜索、单双变量数据表、情景管理、规划求解、预测工作表和动态数组预览。
- fx 菜单扩展到 96 个函数，新增 IFS、SWITCH、SUBSTITUTE、REPLACE、TEXTJOIN、COUNTBLANK、LARGE、SMALL、RANK.EQ、OFFSET、INDIRECT、EDATE、EOMONTH、WORKDAY、NETWORKDAYS、NPV、IRR、DSUM、DCOUNT、DGET、XLOOKUP、FILTER、SORT、UNIQUE、SEQUENCE 等。
- 公式引擎支持跨表引用、三维引用、命名区域、动态数组结果和数据库条件。
- 综合训练重做为 50 组、每组 4–6 步；每日一题重做为 183 组、每组 3–4 步，两套题库不共用题目。
- 题库加入工作簿、图表、透视表、模拟分析和真实数据整理任务，并按由易到难排列。
- 实验室目标与界面文案完整支持简体中文、繁体中文、英文和日文；目标值、图表标题、筛选值和验证提示都会随语言切换。
- 修复多语言单元格参与公式计算时的对象显示、列标题显示和 lab 状态深拷贝问题。
- 新增章节插图、移动端上下布局、实验室回归页面和内容可达性审计。
- 版本号更新为 `v1.3.0`，脚本和样式缓存标识统一更新。

### English

- Added Chapters 13–20: 8 new chapters, 27 levels, and 107 steps. The course now has 20 chapters, 63 levels, and 251 steps.
- Added five families and 29 modes of hands-on labs: workbook and worksheet management, freeze panes, protection, named ranges, multi-sheet and 3-D references, print setup, and formula auditing.
- Added conditional-formatting and data-validation labs: cell and text rules, data bars, color scales, icon sets, formula rules, list/range/custom validation, prompts, and error alerts.
- Added data-tool labs: multi-key and custom sort, advanced filter, remove duplicates, text-to-columns, paste special, subtotal, consolidation, and delimited import.
- Added chart and sparkline labs: column, bar, line, pie, scatter, combo, secondary axis, legend, data labels, and trendlines.
- Added PivotTable labs: field layout, aggregation, filters, show-as percentages, date grouping, slicers, calculated fields, refresh, PivotCharts, and lookup-style output.
- Added what-if labs: Goal Seek, one- and two-variable data tables, Scenario Manager, Solver, Forecast Sheet, and dynamic-array preview.
- Expanded the fx menu to 96 functions, including IFS, SWITCH, SUBSTITUTE, REPLACE, TEXTJOIN, COUNTBLANK, LARGE, SMALL, RANK.EQ, OFFSET, INDIRECT, EDATE, EOMONTH, WORKDAY, NETWORKDAYS, NPV, IRR, DSUM, DCOUNT, DGET, XLOOKUP, FILTER, SORT, UNIQUE, and SEQUENCE.
- The formula engine now supports cross-sheet references, 3-D references, named ranges, dynamic-array results, and database criteria.
- Rebuilt Mixed Practice as 50 sets of 4–6 steps and Daily Challenge as 183 sets of 3–4 steps, with independent banks.
- Added workbook, chart, PivotTable, what-if, and data-preparation tasks to both practice modes, ordered from easier to harder.
- Lab goals and UI copy are fully localized in Simplified Chinese, Traditional Chinese, English, and Japanese. Goal values, chart titles, filter values, and validation messages follow the selected language.
- Fixed object text when localized cells participate in formulas, localized column headers, and lab-state deep cloning.
- Added chapter art, mobile stacked layouts, a lab audit page, and content reachability checks.
- Updated the release to `v1.3.0` and refreshed script and stylesheet cache identifiers.

### Verification

- Formula engine: `44 / 44`.
- Extended formula functions: `40 / 40`.
- Course audit: 20 chapters, 63 levels, 251 steps, 0 errors.
- Lab engine audit: `88` browser checks.
- Content/language reachability: `5484` checks across 457 labs.
- Course regression: `33 / 33`.
- App smoke test: all three modes, new lab, English switch, and Settings load without runtime exceptions.

## v1.2.0

### 中文

- 第 9 章新增“筛选”“查找”“通配符查找”三关，并增加筛选、查找与可见汇总的综合复习关。
- 增加 Excel 功能区式“排序和筛选”“查找和选择”菜单：先选中区域或整列，再开启筛选；列头漏斗支持搜索、全选和多选。自定义排序收在菜单内部，不另开浮窗。
- 筛选箭头跟随选区：选中单列只显示该列，跨列选区则每一列各自显示，并可分别筛选、清除。
- “查找和选择”中的查找/替换还原为经典“查找和替换”对话框：双标签、范围/搜索/查找范围、匹配选项、查找全部/查找下一个/替换/全部替换/关闭。
- 支持 `Ctrl+F` 打开查找、`Ctrl+H` 打开替换，并保留 Excel 的选项折叠、按行/按列和单元格匹配行为。
- 支持 `?`、`*`、`~` 通配符查找，并补充通配符实战课程。
- 增加升序、降序、自定义排序、替换、转到等数据工具；未适用于当前练习的高级 Excel 选项按原位置显示为不可用。
- 查找题改为严格操作判定，必须实际执行查找并定位到正确高亮项，不能直接点单元格过关。
- 重写第 9 章课程与任务，补充仓库查找数据、条件查找、筛选选项说明和 12 个新任务；同时修正旧课程中的区域本地化、行号、比率与现值公式错误。
- `SUBTOTAL` 现在只汇总筛选后可见行，`SUM` 仍汇总全部行；筛选与公式题会同时检查两项操作。
- 综合训练重写为 50 组、200 小题，每组按“筛选/查找 → 可见汇总 → 业务判断”递进。
- 每日一题重写为 183 组、549 小题，使用独立题库与独立种子；同一天题组相同，183 天内不重复。
- 新题库覆盖销售、订单、库存、预算、客服、教学、营销、质检、餐饮、订阅、薪资、差旅等情境。
- 题目、数据操作引擎与界面保持分离，新增 `sheet-operations.js` 与 `practice-v12.js`。
- 修复筛选状态在重绘后丢失、筛选值未本地化、表格公式预览未忽略隐藏行等问题。
- 修复查找输入改动后仍按旧结果判题、展开选项时丢失查找/替换内容、查找窗口点击表格后自行关闭的问题。
- 修复清除筛选会同时关闭筛选模式、空白值无法筛选、全不选仍可应用筛选的问题。
- 普通表格关卡现在也可用全局查找/替换；切换语言时重置当前数据操作，避免旧筛选值误判。
- 查找/替换补充区分全半角、按公式/值查找、数字与本地化值替换、字面量替换和替换次数统计。
- 四个语言版本同步更新；修正英文机构名重复与繁体中文“隐藏列”应为“隐藏行”等文案。
- 将界面中的彩色 emoji 替换为统一线条 SVG 图标，避免不同手机系统渲染不一致。
- 版本号更新为 `v1.2.0`，所有脚本和样式的缓存标识统一更新。

### English

- Added Filter, Find, and Wildcard Find lessons to Chapter 9, plus a review that combines filtering, lookup, and visible-data totals.
- Added Excel-style **Sort & Filter** and **Find & Select** menus. Select a range or column before enabling Filter; header funnels then provide search, select-all, and multi-select. Custom sort stays inside the dropdown instead of opening another window.
- Filter arrows now follow the selected columns: a single-column selection exposes one arrow, while a multi-column selection exposes an independent filter for each selected column.
- Find/Replace now uses a classic **Find and Replace** dialog with Find/Replace tabs, scope, search direction, look-in, match options, and the full action row.
- Added `Ctrl+F` for Find and `Ctrl+H` for Replace, with collapsible options, row/column search, case matching, and whole-cell matching.
- Added `?`, `*`, and `~` wildcard support plus a dedicated wildcard practice lesson.
- Added ascending/descending sort, custom sort, Replace, and Go To tools. Advanced Excel options that do not apply to the current exercise remain visible but disabled.
- Find tasks now require a real Find action and the correct active match; directly clicking a cell cannot pass.
- Rewrote Chapter 9 lessons and tasks, added a warehouse lookup dataset and 12 new tasks, and corrected legacy localization, row-reference, ratio, and present-value errors.
- `SUBTOTAL` now respects filtered rows while `SUM` still includes hidden rows. Filter-and-formula tasks validate both steps.
- Rebuilt Mixed Practice as 50 sets and 200 subtasks, progressing from filter/find to visible totals and business decisions.
- Rebuilt Daily Challenge as 183 sets and 549 subtasks with an independent bank and seed. The same date returns the same set, with no repeats across 183 days.
- New scenarios cover sales, orders, inventory, budgets, support, education, marketing, quality, restaurants, subscriptions, payroll, and travel.
- Kept content, operations, and UI separated; added `sheet-operations.js` and `practice-v12.js`.
- Fixed filter state being lost on redraw, unlocalized filter values, and table previews that ignored hidden rows.
- Fixed stale Find grading after editing the query, Find/Replace text loss when expanding options, and the Find dialog closing on worksheet clicks.
- Fixed Clear Filter also disabling filter mode, missing blank-value filtering, and Apply remaining enabled when no values were checked.
- Find/Replace is now available on ordinary sheet tasks; changing language resets the active data operation instead of grading against stale labels.
- Find/Replace now supports width matching, formula/value lookup, numeric and localized replacement, literal replacement text, and occurrence counts.
- Updated all four languages, including repeated English organization names and the Traditional Chinese hidden-row label.
- Replaced colorful emoji with consistent line SVG icons to avoid inconsistent mobile emoji rendering.
- Updated the release to `v1.2.0` and refreshed all stylesheet and script cache identifiers.

### Verification

- Formula engine: 44 / 44.
- Audit regression: 33 / 33.
- Mixed Practice: 50 sets × 4 subtasks.
- Daily Challenge: 183 sets × 3 subtasks; 183 unique bank entries per cycle.

## v1.1.0

### 中文

- 修复公式填充器对大小写单元格引用的平移：`b2*c2` 现在会正确铺成 `b3*c3`、`b4*c4` 等，同时保留字符串字面量和 `$` 锁定。
- 填充越过工作表边界时返回 `#REF!`，不再静默钳制到 A 列或第 1 行。
- 修复 `logic-check-a4`：统一到王磊第 6 行，题目、目标格、参考答案和布尔判题口径一致。
- 为三道依赖中间结果的汇总题补齐 `I2:I9` 和 `C10:E10` 数据，并重新计算测试答案。
- 移除单格题上不可拖拽的绿色伪填充柄；多格题保留真实填充柄，并新增“填满答案区域”按钮及 `Ctrl+D` / `Ctrl+R`。
- 工作表答对反馈改为读取当前计算结果与当前行姓名，不再使用手写旧数值或旧人物。
- 增加公式来源校验：题目要求引用源单元格时，直接填写结果常量会被拒绝。
- 乘法填空支持交换顺序的等价写法（如 `B2*C2` 与 `C2*B2`）。
- 修复文本关卡目标地址占位符丢失。
- 新增 `audit-regression.html`，覆盖引用平移、越界、逻辑题、中间数据、目标地址和等价填空。

### English

- Fixed case-insensitive reference translation in formula fill: `b2*c2` now becomes `b3*c3`, `b4*c4`, and so on while preserving string literals and `$` locks.
- Filled formulas that move beyond the sheet boundary now return `#REF!` instead of silently clamping to column A or row 1.
- Fixed `logic-check-a4`: Wang's row 6, target cell, reference answer, and boolean comparison now agree.
- Added the missing `I2:I9` and `C10:E10` intermediate data for three aggregate tasks and recomputed their expected values.
- Removed the non-interactive green pseudo-handle from single-cell tasks. Multi-cell tasks keep the real fill handle and now also provide **Fill answer range** plus `Ctrl+D` / `Ctrl+R`.
- Sheet success feedback now reads the current evaluation result and row name instead of hard-coded old values or names.
- Added source-reference validation, so a task that requires cell references rejects a constant result.
- Equivalent commutative multiplication fill (`B2*C2` and `C2*B2`) is accepted.
- Fixed missing target placeholders in text tasks.
- Added `audit-regression.html` for reference translation, boundary errors, logic, intermediate data, target addresses, and equivalent fills.

### Verification

- Formula engine: 44 / 44.
- Audit regression: 10 / 10.

## v1.0.2

### 中文

- 通过 `fx` 插入函数后，光标现在稳定位于新函数括号内部，可直接输入参数。
- 同步更新应用内部光标状态，避免后续重绘把光标拉回括号外。
- 样式与脚本缓存标识升级至 `1.0.2-r1`。

### English

- After inserting a function from the `fx` menu, the caret now stays inside the new function's parentheses, ready for arguments.
- The internal caret state is synchronized as well, preventing later renders from moving it outside the parentheses.
- Updated style and script cache identifiers to `1.0.2-r1`.

## v1.0.1

### 中文

#### 修复

- 初始界面的“每日一题”卡片不再显示“0 / 183”。
- 修复编辑公式时点击单元格引用插入位置错误的问题；现在会锁定点击前的光标位置，并在光标处直接插入。
- 编辑状态下重复选取同一单元格或换选其他单元格，会更新上一条引用，不再重复追加。
- 编辑会话、光标位置和上一条引用改由应用独立记录，不再依赖浏览器失焦后可能被重置的 selection。
- 取消单元格引用插入时自动补逗号和右括号的行为，使操作更接近 Excel。
- 修复部分设备无法拖拽单元格的问题；鼠标和触控笔均可拖拽选区。
- 移除移动端选取角标的外扩动画，避免拖拽时角标跳动。
- 实战操作调整为更接近 Excel：
  - 未编辑状态点击单元格时，输入框显示该单元格内容。
  - 未编辑状态拖拽时，输入框显示选区左上角单元格内容。
  - 未编辑状态按住 Ctrl 添加单元格时，输入框显示最后添加的单元格内容。
  - 编辑状态点击单元格时，在光标处插入引用；光标未变化时会替换原引用。

#### 架构

- 新增 `answer-engine.js`，独立封装公式函数识别、引用解析和相对引用平移。
- 新增 `sheet-selection.js`，独立封装公式文本与单元格引用的插入、替换逻辑。
- 闯关课程继续按需加载，综合训练关卡按需生成，题目数据与界面交互保持分离。
- 样式、入口脚本和按需加载的课程脚本统一增加 v1.0.1 缓存标识，设置页显示当前版本，确保三个模式同步更新。

### English

#### Fixed

- Removed the `0 / 183` counter from the Daily Challenge card on the opening screen.
- Fixed cell references being inserted in the wrong place while editing a formula. The caret position is now captured before the cell is clicked and the reference is inserted there.
- Selecting the same or another cell without moving the caret now updates the previous reference instead of appending a duplicate.
- Formula editing state, caret position, and the previous reference are now tracked by the app instead of relying on a browser selection that may reset on blur.
- Removed automatic commas and closing parentheses when inserting cell references, matching Excel behavior more closely.
- Fixed cell dragging on devices where it previously did not work. Mouse and pen input are both supported.
- Removed the expanding animation on the mobile selection handle to prevent it from jumping during drag operations.
- Made sheet interaction more Excel-like:
  - Clicking a cell outside edit mode displays that cell's content in the formula input.
  - Dragging outside edit mode displays the top-left cell content of the selected range.
  - Ctrl-clicking outside edit mode displays the most recently added cell's content.
  - Clicking a cell in edit mode inserts a reference at the caret; if the caret has not moved, the existing reference is replaced.

#### Architecture

- Added `answer-engine.js` for shared function detection, reference parsing, and relative-reference translation.
- Added `sheet-selection.js` for pure formula-text and cell-reference insertion/replacement logic.
- Course modules remain lazy-loaded, mixed-practice levels remain generated on demand, and content stays separated from UI interaction.
- Added v1.0.1 cache identifiers to styles, entry scripts, and lazy-loaded course scripts. The current version is shown in Settings so all three modes update consistently.

## v1.0.0

### 中文

- 发布首个版本，包含闯关课程、综合训练、每日一题三种模式。

### English

- Initial release with Guided Course, Mixed Practice, and Daily Challenge modes.
