# Clean Code / SOLID Refactoring Plan — Frontend (JS)

> **Goal:** Convert the current functional/closure-based JS codebase to OOP with Clean Code practices, applying the Strategy Pattern where appropriate.
>
> **Constraints:** Keep using vanilla JS (no TypeScript, no bundler, no framework). Each step leaves the app working. Python backend is out of scope.

---

## Analysis: if/else branches and Strategy Pattern suitability

| # | File:Line | Condition | Verdict |
|---|-----------|-----------|---------|
| 1 | `viewManager.js:22-42` | 3-way `mode === 'simple' / 'rolling12' / 'ytd'` | **Strategy Pattern** — each mode differs in data source, chart type, titles, and year-selector visibility. |
| 2 | `chartRenderer.js:57` | `type === 'bar' ? 'line' : 'line'` | **Dead code** — both branches return `'line'`. Eliminate. |
| 3 | `chartRenderer.js:54-55` | `type === 'line' ? ...` for borderWidth/pointRadius | Reactive style tied to chart type, not app behavior. Keep as-is or extract to config. |
| 4 | `tableRenderer.js:18` | `tableData.length === 0` | Standard empty-state guard. Keep as-is. |
| 5 | `dataService.js:9` | `!response.ok` | Standard error handling. Keep as-is. |
| 6 | `dataProcessor.js:59` | `current.year !== currentYear` | Internal YTD accumulator. Keep as-is. |

**Only #1 qualifies for Strategy Pattern.**

---

## Target class diagram

```
main.js  ──────────────────────────────────────────────────────
  │
  ├── utils/formatters.js          (unchanged — static utils)
  ├── utils/config.js              (NEW — constants, palette)
  ├── model/AppState.js            (NEW — encapsulated state )
  ├── model/ViewStrategy.js        (NEW — abstract + 3 impls + factory)
  ├── services/DataService.js      (rewritten as class)
  ├── services/DataProcessor.js    (rewritten as class)
  ├── ui/ChartRenderer.js          (rewritten as class)
  ├── ui/TableRenderer.js          (rewritten as class)
  ├── ui/YearSelector.js           (rewritten as class)
  ├── ui/ViewCoordinator.js        (replaces viewManager.js)
  └── controllers/AppController.js (rewritten — orchestrator)
```

### Strategy Pattern hierarchy

```
ViewStrategy (abstract)
  + selectData(processedData, selectedYear) → ViewSelection
  + chartType, showYearSelector, chartTitle, tableTitle  (properties)

  ├── SimpleViewStrategy       → processedData.simple,  chartType:'bar'
  ├── Rolling12ViewStrategy    → processedData.rolling12,  chartType:'line'
  └── YtdViewStrategy          → processedData.ytd filtered by year, chartType:'line'

ViewStrategyFactory
  + getStrategy(mode) → ViewStrategy
```

### Key design decisions

- **Backward-compatible wrappers** during migration: after rewriting a module as a class, the old function export is kept as a thin delegate so callers work unchanged until Step 6.
- **Constructor injection** for coordinator classes (`ViewCoordinator`, `AppController`).
- **No global state** — `AppState` instance is created in `main.js` and passed via constructors.
- **Config centralization** — all magic strings, DOM IDs, and brand colors live in `config.js`.

---

## Implementation steps

### Step 1 — Create plan document and infrastructure files

**Status:** `COMPLETED`

**Created files:**
- `docs/CLEAN_CODE_REFACTORING_PLAN.md` — this file
- `utils/config.js` — DOM IDs, brand color palette, view-mode metadata constants
- `model/AppState.js` — `class AppState { rawData, processedData, chartInstance, availableYears }`
- `model/ViewStrategy.js` — abstract base + `SimpleViewStrategy`, `Rolling12ViewStrategy`, `YtdViewStrategy` + `ViewStrategyFactory`

**Verification:** App loads without errors. No existing code imports the new files yet.

---

### Step 2 — Convert services to classes

**Status:** `PENDING`

**Changes:**
- `services/DataService.js`: wrap in `class DataService { async load(path) { ... } }`. Keep `export { loadData }` as delegating function.
- `services/DataProcessor.js`: wrap in `class DataProcessor { process(rawData, formatMonthYear) { ... } }`. Keep `export { processData }` as delegating function.

**Verification:** `main.js` imports unchanged (`import { loadData, processData }`), app works.

---

### Step 3 — Convert UI modules to classes

**Status:** `PENDING`

**Changes:**
- `ui/ChartRenderer.js`: `class ChartRenderer { render(data, type, opts) { ... } }`. Keep `renderChart` wrapper. Use color constants from `config.js`.
- `ui/TableRenderer.js`: `class TableRenderer { render(data, opts) { ... } }`. Keep `renderTable` wrapper.
- `ui/YearSelector.js`: `class YearSelector { setup(years) { ... } }`. Keep `setupYearSelector` wrapper.

**Verification:** `main.js` imports unchanged, app works.

---

### Step 4 — Rewrite viewManager.js as ViewCoordinator using Strategy Pattern

**Status:** `PENDING`

**Changes:**
- Rename `ui/viewManager.js` to `ui/viewManager.js` (keep filename, rewrite content).
- `class ViewCoordinator { constructor({ strategyFactory, formatCurrency, chartRenderer, tableRenderer }) }`
- `update(opts)` method reads DOM, resolves strategy via factory, calls `selectData`, delegates to renderers.
- Keep `export { updateView }` as backward-compatible wrapper that instantiates `ViewCoordinator`.
- Fix dead code on line 57: `type: type === 'bar' ? 'line' : 'line'` → `type: 'line'`.

**Verification:** `main.js` imports unchanged, view modes render correctly.

---

### Step 5 — Rewrite controllers + main.js for full OOP wiring

**Status:** `PENDING`

**Changes:**
- `controllers/AppController.js`: rewrite as `class AppController { constructor({ dataService, dataProcessor, yearSelector, viewCoordinator, state }), init(path) }`.
- `controllers/updateViewHandler.js`: simplify (remove `boundUpdateView` dependency, read DOM and call `viewCoordinator.update` directly).
- `controllers/boundUpdateView.js`: **delete** — logic inlined into updateViewHandler.
- `main.js`: import all classes directly. Instantiate via constructor injection. Wire event listeners using class instances. Remove old function-style imports (`loadData`, `processData`, `renderChart`, etc.).

**New import structure for `main.js`:**
```js
import { formatCurrency, formatMonthYear } from './utils/formatters.js';
import { AppState } from './model/AppState.js';
import { DataService } from './services/DataService.js';
import { DataProcessor } from './services/DataProcessor.js';
import { ChartRenderer } from './ui/ChartRenderer.js';
import { TableRenderer } from './ui/TableRenderer.js';
import { YearSelector } from './ui/YearSelector.js';
import { ViewCoordinator } from './ui/ViewCoordinator.js';
import { ViewStrategyFactory } from './model/ViewStrategy.js';
import { AppController } from './controllers/AppController.js';
```

**Verification:** Full app bootstrap, all view modes work, year selector functional.

---

### Step 6 — Cleanup

**Status:** `PENDING`

**Changes:**
- Remove backward-compatible function wrappers from:
  - `services/DataService.js` (remove `export function loadData`)
  - `services/DataProcessor.js` (remove `export function processData`)
  - `ui/ChartRenderer.js` (remove `export function renderChart`)
  - `ui/TableRenderer.js` (remove `export function renderTable`)
  - `ui/YearSelector.js` (remove `export function setupYearSelector`)
  - `ui/viewManager.js` (remove `export function updateView`)
- Remove `controllers/boundUpdateView.js` if not already removed in Step 5.
- Verify no dangling imports or dead exports.

**Verification:** App loads without errors, no console warnings.

---

## Status tracker

| Step | Description | Status |
|------|-------------|--------|
| 1 | Plan doc + config, AppState, ViewStrategy files | `COMPLETED` |
| 2 | Convert services to classes | `IN PROGRESS` |
| 3 | Convert UI modules to classes | `PENDING` |
| 4 | ViewCoordinator with Strategy Pattern | `PENDING` |
| 5 | OOP controllers + main.js wiring | `PENDING` |
| 6 | Cleanup legacy wrappers | `PENDING` |
