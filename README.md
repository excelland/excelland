# EXCEL-land

> 浏览器里的 Excel 闯关练习：公式、表格操作、图表、透视表、模拟分析。  
> A browser-based Excel trainer with guided lessons, hands-on labs, and daily practice.

打开 `index.html` 即可使用。无需安装、后端或网络连接，进度保存在浏览器 `localStorage`。

当前版本：`v1.3.1`。

## 三种模式

| 模式 | 内容 |
| --- | --- |
| 闯关课程 | 20 章、63 关、251 步。从公式基础走到工作簿、打印、条件格式、数据工具、图表、透视表、模拟分析和综合办公。 |
| 综合训练 | 50 组题组，每组 4–6 步，混合公式、筛选、图表、透视表与真实操作。 |
| 每日一题 | 每天 1 组、3–4 步，按本地日期出题；183 天内不重复。 |

三个模式分别保存进度，可从首屏选择，也可从顶栏切换。

## 主要能力

- 96 个 fx 函数，覆盖统计、逻辑、文本、查找、日期、财务、数据库、引用与动态数组。
- 29 种交互实验室：工作表管理、冻结、保护、页面打印、公式审计、条件格式、数据验证、排序、高级筛选、去重、分列、选择性粘贴、分类汇总、合并计算、导入、图表、迷你图、透视表、透视图、目标搜索、数据表、情景管理、规划求解、预测和数组预览。
- 真实表格操作：行列选择、连续/不连续选区、拖拽填充、冻结表头、公式栏与 fx 菜单、筛选、查找和替换。
- 四语言完整本地化：简体中文、繁體中文、English、日本語。人名、组织、地点和情境按语言本地化。
- 设置支持音效、语言、全部解锁、当前模式重置，以及三个模式的 JSON 进度备份与恢复。
- 桌面与手机布局均可用；操作实验室会随屏幕宽度切换为上下布局。

## 范围说明

- 本版本聚焦 Excel 部分；Word 与 PowerPoint 不在本项目范围内。
- 图表、透视表和动态数组使用教学模拟与实时预览，不追求逐像素复刻桌面 Excel。
- 动态数组预览以左上角结果为主，完整溢出区域由题目说明和公式判断覆盖。

## 开始使用

1. 用现代浏览器打开 `index.html`。
2. 选择闯关课程、综合训练或每日一题。
3. 想自由练习时，在设置中打开“解锁全部关卡”。
4. 换设备前可在设置中导出进度文件。

## 项目结构

| 路径 | 用途 |
| --- | --- |
| `index.html`, `src/styles/base.css` | 页面入口与响应式基础样式 |
| `src/app/main.js`, `src/app/render.js` | 状态、交互与界面渲染 |
| `src/core/formula.js` | Excel 公式求值 |
| `src/lab/engine.js`, `src/lab/styles.css` | 高级操作实验室与实时预览 |
| `src/core/answer.js`, `src/core/selection.js`, `src/core/sheet-ops.js` | 答案校验、引用插入、筛选与查找 |
| `src/content/chapters/` | 闯关课程内容，按章节序号加载 |
| `src/content/banks/practice.js` | 综合训练与每日题题库 |
| `src/i18n/base.js`, `src/lab/i18n.js`, `src/app/sound.js` | 四语言文案与音效 |
| `tests/` | 内容、引擎、实验室与入口回归测试 |
| `docs/lab-contract.md` | 实验室数据结构与维护约定 |

版本记录见 `CHANGELOG.md`。

## English

EXCEL-land is a browser-only Excel trainer with three independent modes:

- **Guided Course**: 20 chapters, 63 levels, and 251 steps, from formulas to workbooks, printing, conditional formatting, data tools, charts, PivotTables, what-if analysis, and office capstones.
- **Mixed Practice**: 50 sets of 4–6 steps mixing formulas, filtering, charts, PivotTables, and hands-on spreadsheet tasks.
- **Daily Challenge**: one set of 3–4 steps per local calendar date, with no repeat across 183 days.

The fx menu exposes 96 functions. The new lab workspace covers 29 modes, including worksheet management, freeze panes, protection, print setup, formula auditing, conditional formatting, data validation, sorting, advanced filtering, duplicate removal, text-to-columns, paste special, subtotal, consolidation, import, charts, sparklines, PivotTables, PivotCharts, goal seek, data tables, scenarios, Solver, forecasting, and array previews.

The spreadsheet supports row/column selection, continuous and non-continuous ranges, fill handles, frozen headers, a formula bar, filtering, Find, and Replace. The interface and content are available in Simplified Chinese, Traditional Chinese, English, and Japanese.

Open `index.html` in a modern browser. No install, build step, server, or network connection is required. Progress is stored in `localStorage`; Settings can export and import a JSON backup for all three modes and preferences.

## Verification

- Formula engine: `44 / 44`.
- Extended formula functions: `40 / 40`.
- Course audit: 20 chapters, 63 levels, 251 steps, 0 errors.
- Lab engine audit: `88` browser checks; `5484` content/language reachability checks across 457 labs.
- Course regression: `33 / 33`.
- App smoke test: course, new lab, English switch, Mixed Practice, Daily Challenge, and Settings all load without runtime exceptions.

This is an independent learning project and is not affiliated with Microsoft.
