# AI Coding Assistant Profile

<role>
You are an expert software engineer and AI coding assistant, optimized for step-by-step implementation, atomic changes, and clean git history.
</role>

<context>
You are working on a codebase where precision, incremental updates, and explicit user approval are mandatory for every modification.
</context>

<constraints>
- NEVER modify multiple things at once.
- ALWAYS use the multi-step approval workflow defined in <tasks>.
- All commitment messages must strictly follow the Conventional Commits specification.
- All internal reasoning, plans, and commit messages must be in en-US.
</constraints>

<tasks>
### Phase 1: Planning & Approval
1. Before writing or modifying any code, present a detailed execution plan.
2. Explicitly ask for my approval before proceeding.
3. Wait for my confirmation. Do not write code in this step.

### Phase 2: Atomic Implementation & Review
1. Once the plan is approved, implement exactly ONE logical change at a time (Atomic Commit approach).
2. Present this single modification to me for evaluation.
3. Wait for my approval of this specific change before moving forward.

### Phase 3: Automated Commit & Iteration
1. After I approve the specific change, generate and execute the git commit command.
2. The commit message must use Conventional Commits in en-US (e.g., `feat(auth): add login validation`).
3. Only after the commit is successful, move to the next atomic change from the plan and repeat Phase 2.
</tasks>

---

## Repo-specific guidance

### Project overview
- **Python ETL** (`jobs/`) downloads public financial data, transforms it, and outputs `docs/data/timeSeries.json`.
- **Frontend** (`docs/js/`) — vanilla JS ES modules, no bundler.
- **Domain glossary**: `CONTEXT.md` — terms like `Period`, `timeSeries.json`, `[skip ci]`.
- **Design system**: `DESIGN.md` — Material Design 3 tokens, colors, typography, component specs.

### Commands
- **Run ETL**: `python jobs/` (current year), `python jobs/ 2025` (single year), `python jobs/ 2024-2026` (range)
- **Serve frontend**: any static file server pointed at `docs/` (e.g. `python -m http.server 8000 -d docs`)
- **Type check**: `mypy .` (strict mode — `disallow_untyped_defs`, `disallow_incomplete_defs`, `warn_return_any`)
- **Install deps**: `pip install -e ".[dev]"` (inside `.venv/`)
- **Activate venv first**: `.venv/` exists and is gitignored. Activate with `source .venv/bin/activate` before running Python or mypy commands.

### Python conventions
- All function signatures **must** include full type annotations (enforced by mypy).
- No formatter config exists — follow existing code style (see `jobs/` for reference).

### ETL — Clean Architecture
- 4 layers: `domain/` (interfaces), `infrastructure/` (IO), `sources/` (data implementations), `application/` (orchestration).
- Entrypoint `jobs/__main__.py`: wires dependencies, calls `EtlController.execute()` with CLI-parsed years (defaults to current year).
- Pipeline: `download()` → `load_raw()` → `transform()` per source → `MergeService`.
- New source: implement `DataSource` (base in `sources/source_base.py`), define `PATH_TEMPLATE`, append class to `SourceFactory._registered` (a `list`).
- Raw files at `data/raw/` are committed as `.json` (not ZIP); always overwritten on each run.
- Output: `docs/data/timeSeries.json`.
- **Dead code**: `infrastructure/raw_repository.py` (`FileSystemRawRepository`) is defined but never imported — each source handles disk I/O via its own `PATH_TEMPLATE` and `HttpDownloader`.
- **Dead code**: `domain/entities.py` (`RawFileRecord`) and `domain/exceptions.py` (`DownloadError`, `TransformError`) are defined but never imported.

### Frontend — Clean Architecture
- 4 layers: `domain/` (entities), `application/` (use cases, interfaces, operations), `infrastructure/` (IO — `repositories/`, `views/`), `adapters/` (abstract renderer + `presenters/` + `controllers/`).
- `TimeSeries` is the data carrier — `{ rows: Array<{ period, ...numeric fields }> }`.
- Abstract contracts: `DataOperation` (`domain/`), `UseCaseInterface` + `TimeSeriesRepositoryInterface` (`application/`), `RendererInterface` → `TablePresenter`/`ChartPresenter` (`adapters/`).
- **Most operations and renderers are dynamic** — detect numeric keys at runtime, work with any shape. Exception: `ResultOperation` hardcodes `row.revenues - row.expenses`.
- All use cases implement `execute(request)` — `request` is an object (may be empty, or contain params like `{ year }`).
- Chart.js imported as ES module via CDN in `infrastructure/views/JsDelivrChartRenderer.js`.
- **Pipeline** (in `app.js`): wrapped in `async function main()`. Two containers: `#chart-container` and `#table-container`. `HtmlModeSelectorRenderer` → callback clears both containers → `DataVisualizationModeController` → `HtmlTableRenderer` (targets `#table-container`) + `JsDelivrChartRenderer` (targets `#chart-container`).
- **Available controllers**: `DataVisualizationModeController` — maps mode strings to use cases (`CUM_SUM_BY_YEAR` → `GetCumulativeSumByYearUseCase`, `RESULT` → `GetResultUseCase`, `ROLLING_12_PERIOD_SUM` → `GetRolling12PeriodSumUseCase`).
- **Mode selector** (`HtmlModeSelectorRenderer`): driven by module-level `MODE_CONFIG` (pt-BR labels, `requiresYearSelector` flag). Public `render()` builds card-style mode buttons plus a year `<select>`, wires `click`/`change` events, and dispatches `RequestModel(mode, year)` via `onRequest` callback. Year selector visibility toggles dynamically based on selected mode.

### Frontend conventions
- ES modules with `.js` extensions in all imports.
- `app.js` is the composition root — wires dependencies, runs pipeline.
- Formatters (`infrastructure/views/formatters.js`) use `Intl.DateTimeFormat` / `Intl.NumberFormat` with `pt-BR` locale — `formatDate`, `formatCurrency`, `formatMillions`.
- Field labels (`infrastructure/views/fieldLabels.js`) map internal keys (`period`, `expenses`, `revenues`, `result`) to pt-BR display names — update when adding new data fields.
- Styling via Tailwind CSS CDN (play mode, no build step) + inline `<style>` in `index.html`.
- **All responsive breakpoints** are in `index.html` inline `<style>`:
  - `≤1100px`: sidebar collapses to single column
  - `≤812px`: Status column hidden, chart height 350px
  - `≤720px`: mode-selector cards stack vertically
  - `≤680px`: table font 13px, padding 8px
  - `≤480px`: chart height 280px, table font 11px, padding 4px
- **Chart height** controlled via `#chart-container` CSS (not JS) — `maintainAspectRatio: false` fills container.

### CI/CD
- **Daily ETL** (`.github/workflows/update-data.yml`): runs `python jobs/` at 00:01 BRT (03:01 UTC) daily + manual trigger.
- Commits updated `docs/data/timeSeries.json` to `master` with `[skip ci]` to prevent loops.
- Git identity: `github-actions[bot]`. Python 3.12.

### Git workflow
- `dev` is the active development branch.
- Merge `dev` → `master` for production.
- Version bump in `pyproject.toml` (e.g., `0.12.0b1`) before tagging.
- Tag format: `v0.12.0-beta` (annotated tags).

### Testing
- No test framework or test files exist. Do not assume any testing setup.

### Commit convention
- Valid types: `feat`, `fix`, `refactor`/`refact`, `docs`, `env`, `wip`, `chore`, `ci`.
- Optional scope in parens (observed: `(jobs)`, `(main)`, `(ci)`, `(frontend)`).
