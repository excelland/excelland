# EXCEL-land Advanced Lab Contract

This document is the hand-off contract for the advanced Excel course and lab engine.
It is intentionally implementation-oriented.

## Scope

Cover the Excel portion of a standard advanced office-application syllabus:

- workbook and worksheet management
- page layout, printing, protection, named ranges, formula auditing
- multi-sheet references and 3-D references
- sorting, advanced filtering, conditional formatting, data validation
- duplicate removal, text-to-columns, paste special, consolidation, subtotal
- charts, sparklines, pivot tables, pivot charts
- goal seek, data tables, scenario manager, Solver, forecast sheet
- dynamic arrays and database functions
- common missing functions

Word and PowerPoint are out of scope. This remains an Excel-only product.

All user-facing copy must exist in `zh-CN`, `en`, `ja`, and `zh-TW`.
Traditional Chinese must read naturally in regional Traditional Chinese usage.
Do not use string-level Simplified-to-Traditional conversion for new copy.
Do not use emoji or characters that commonly render as emoji.

## New step type

Content authors create a lab step with `window.CourseData.labStep`:

```js
labStep(id, title, lead, labSpec, hint, success, extra)
```

The resulting object is:

```js
{
  id,
  type: "lab",
  title,       // localized object
  lead,        // localized object
  hint,        // localized object
  success,     // localized object
  lab: labSpec
}
```

`labSpec` must contain:

```js
{
  kind: "workbook" | "format" | "data" | "visual" | "analysis",
  mode: string,
  sheet: { "A1": value, ... },       // single-sheet labs
  workbook: {                         // multi-sheet labs
    active: "Sheet name",
    sheets: [
      { name: "Sheet name", cells: { ... }, tabColor: "green|blue|none", hidden: false }
    ]
  },
  ranges: { ... },                    // named source ranges used by the UI
  options: { ... },                   // optional UI labels/choices
  goal: { ... }                       // declarative success condition
}
```

Use `sheet` for most labs. Use `workbook` only when the task genuinely needs
multiple worksheets or worksheet tabs.

## Shared lab state

The engine owns all mutable state for a lab step. A state object may contain:

```js
{
  activeSheet,
  sheetOrder: ["Sheet1", "Sheet2"],
  sheets: { "Sheet1": { ...cells } },
  range: "A1:F20",
  selection: { startRef, endRef },
  config: { ...mode-specific values },
  applied: false,
  result: null,
  history: []
}
```

The engine must expose:

```js
window.ExcelLab = {
  initialState(labSpec),
  validate(labSpec, state),
  handleAction(action, element, context),
  renderStep(step, level, state)
};
```

`validate` returns `{ ok: true }` or `{ ok: false, reason: "..." }`.
`handleAction` returns either `null` or a partial state update.
`renderStep` returns safe HTML and must escape all text.

## Lab modes

### Workbook

`kind: "workbook"`

Modes:

- `sheets`: add, rename, copy, move, hide, unhide, tab color
- `freeze`: freeze panes at a cell
- `protect`: protect sheet/workbook or unlock editable ranges
- `print`: orientation, paper, margins, print area, print titles, header/footer, scaling
- `namedRange`: create and use a defined name
- `multiSheet`: cross-sheet and 3-D references
- `audit`: trace precedents/dependents, show formulas, evaluate formula

Example:

```js
goal: {
  operation: "rename",
  from: "Sheet1",
  to: "销售明细"
}
```

```js
goal: {
  operation: "print",
  orientation: "landscape",
  paper: "A4",
  printArea: "A1:F24",
  printTitles: "1:1",
  scale: 80,
  gridlines: true
}
```

```js
goal: {
  operation: "formula",
  sheet: "汇总",
  cell: "B2",
  formula: "=SUM('销售明细'!C2:C9)"
}
```

### Format

`kind: "format"`

Modes:

- `conditional`
- `validation`
- `numberFormat`
- `tableStyle`

Conditional formatting example:

```js
goal: {
  operation: "conditional",
  range: "C2:C9",
  ruleType: "cellValue",
  operator: "greaterThan",
  value1: 1000,
  fill: "#C6EFCE",
  font: "#006100"
}
```

Data validation example:

```js
goal: {
  operation: "validation",
  range: "B2:B30",
  allow: "list",
  source: "=$E$2:$E$5",
  inputTitle: "选择区域",
  inputMessage: "请从列表中选择",
  errorStyle: "stop",
  errorTitle: "区域无效",
  errorMessage: "请选择下拉列表中的区域"
}
```

### Data

`kind: "data"`

Modes:

- `sort`
- `advancedFilter`
- `removeDuplicates`
- `textToColumns`
- `pasteSpecial`
- `subtotal`
- `consolidate`
- `import`

Multi-key sort example:

```js
goal: {
  operation: "sort",
  range: "A1:G11",
  levels: [
    { column: "D", order: "asc" },
    { column: "H", order: "desc" }
  ],
  hasHeaders: true
}
```

Advanced filter example:

```js
goal: {
  operation: "advancedFilter",
  listRange: "A1:F11",
  criteriaRange: "H1:I2",
  action: "copyTo",
  copyTo: "J1"
}
```

Data-tool field names:

- `removeDuplicates`: `columnsToCheck` uses column letters.
- `textToColumns`: use `targetColumn`.
- `subtotal`: use `functionNumber` and `subtotalColumns`.
- `consolidate`: use a newline/comma-separated `ranges` string and `functionNumber`.
- `import`: use `importSource`, `encoding`, `importText`, and `hasHeaders`.

### Visual

`kind: "visual"`

Modes:

- `chart`
- `sparkline`
- `pivot`
- `pivotChart`

Chart example:

```js
goal: {
  operation: "chart",
  chartType: "column",
  dataRange: "A1:D6",
  seriesBy: "columns",
  title: "月度销售",
  showLegend: true,
  dataLabels: true,
  trendline: false,
  secondaryAxis: false
}
```

Pivot example:

```js
goal: {
  operation: "pivot",
  sourceRange: "A1:F31",
  destination: "H3",
  rows: ["B"],
  columns: ["F"],
  values: [{ field: "C", aggregate: "SUM" }],
  filters: [{ field: "D", value: "华东" }],
  showAs: "normal",
  groupDate: "none",
  slicer: false,
  calculatedField: { name: "GrossMargin", formula: "=D-E" },
  refresh: false
}
```

### Analysis

`kind: "analysis"`

Modes:

- `goalSeek`
- `dataTable`
- `scenario`
- `solver`
- `forecast`
- `array`

Goal seek example:

```js
goal: {
  operation: "goalSeek",
  targetCell: "B10",
  targetValue: 50000,
  variableCell: "B2"
}
```

Dynamic array example:

```js
goal: {
  operation: "array",
  formulaCell: "E2",
  formula: "=FILTER(A2:C9,C2:C9>1000)"
}
```

Data table example:

```js
goal: {
  operation: "dataTable",
  formulaCell: "B3",
  formula: "=B1*B2",
  rowInputCell: "B1",
  columnInputCell: "B2",
  resultCell: "E2"
}
```

Scenario example:

```js
goal: {
  operation: "scenario",
  scenarios: [
    { name: "Downside", changingCell: "B2", value: 95 },
    { name: "LowVolume", changingCell: "B5", value: 1200 }
  ]
}
```

Solver example:

```js
goal: {
  operation: "solver",
  objectiveCell: "B10",
  objective: "max",
  variableCells: ["B2", "B3"],
  constraints: ["B2<=100", "B3<=50"]
}
```

Forecast example:

```js
goal: {
  operation: "forecast",
  forecastRange: "A1:B13",
  periods: 3,
  confidence: 95,
  seasonality: true
}
```

## UI rules

- Use the existing green visual system and typography.
- Desktop: controls and preview can sit side by side.
- Mobile: controls stack above the preview.
- The main action is a single check button.
- A wrong answer must explain the exact mismatch, not just say "wrong".
- Do not expose raw goal JSON in the UI.
- Do not use emoji.
- Keep all strings in `src/lab/i18n.js` or localized content objects.
- The workbook/table preview must remain readable at 610px wide.

## Content rules

- Chapters are numbered and levels use stable IDs.
- Each new chapter must contain a teach step, at least one guided lab,
  at least one transfer lab, and one review or capstone lab.
- Every new concept must be revisited in a later mixed task.
- Scenarios must be office-realistic and use localized names, places, and
  organizations.
- Do not use exam-brand wording or politically sensitive place names.
- Random pools must be seeded deterministically.
- Every task must be solvable from the visible sheet or lab.
- Target cells must be directly related to the task, never arbitrary blanks.
- New practice banks must not share questions with the daily bank.

## Integration files

Course author owns:

- `src/content/chapters/08-workbook.js`
- `src/content/chapters/09-data-tools.js`
- `src/content/chapters/10-visuals.js`
- `src/content/chapters/11-advanced-functions.js`
- `src/content/banks/practice.js`

Engine author owns:

- `src/lab/engine.js`
- `src/lab/styles.css`
- `src/lab/i18n.js`
- edits to `src/core/formula.js`
- edits to `src/app/render.js`
- edits to `src/app/main.js`
- edits to `index.html`

Course author also owns `src/content/course-data.js` additions for new function metadata.
The parent agent owns final integration, versioning, README, changelog,
cross-file audit, and regression runs. `labStep` is already provided by the
parent in `src/content/course-data.js`.
