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
- **Python ETL** (`jobs/`) downloads public financial data, transforms it, and outputs `docs/data/timeSeries.json` + `docs/data/rveSentTimeSeries.json`.
- **Frontend** (`docs/js/`) — vanilla JS ES modules, no bundler.
- **Domain glossary**: `CONTEXT.md` — terms like `Period`, `timeSeries.json`, `[skip ci]`.
- **Design system**: `DESIGN.md` — Material Design 3 tokens, colors, typography, component specs.

### Commands
- **Run ETL**: `python jobs/` (current year), `python jobs/ 2025` (single year), `python jobs/ 2024-2026` (range)
- **Serve frontend**: any static file server pointed at `docs/` (e.g. `python -m http.server 8000 -d docs`)
- **Type check**: `mypy .` (strict mode — `disallow_untyped_defs`, `disallow_incomplete_defs`, `warn_return_any`)
- **Install deps**: `pip install -e ".[dev]"` (inside `.venv/`)
- **Activate venv first**: `.venv/` exists and is gitignored. Activate with `source .venv/bin/activate` before running Python or mypy commands.
- **Python**: requires `>=3.10`. Runtime deps: `requests`, `pandas`, `lxml`. Dev deps: `mypy`, `types-requests`, `pandas-stubs`.

### Python conventions
- All function signatures **must** include full type annotations (enforced by mypy).
- No formatter config exists — follow existing code style (see `jobs/` for reference).

### ETL — Clean Architecture
- 4 layers: `domain/` (interfaces), `infrastructure/` (IO), `sources/` (data implementations), `application/` (orchestration).
- Entrypoint `jobs/__main__.py`: wires dependencies, calls `EtlController.execute()` with CLI-parsed years (defaults to current year).
- Pipeline: `download()` → `load_raw()` → `transform()` per source → `MergeService`.
- **ISP-segregated source base** (`sources/source_base.py`): `BalanceEntriesDataSource` (revenue/expense time-series with `available_periods`, `load_raw`, `transform`) and `BalanceStatusDataSource` (external status signals with `load`, `transform`). Both extend `DataSource`.
- New source: implement the appropriate base class, define `PATH_TEMPLATE`, append class to `SourceFactory._registered` (a `list`).
- `Orchestrator.run()` returns `tuple[DataFrame, DataFrame]` — `(entries, status)`.
- `EtlController` accepts optional `status_writer` and `status_output_path` for writing the status output.
- Revenue has two strategies in `revenue_strategy.py`: `ApiStrategy` (years ≥ 2024, JSON API) and `ScrapingStrategy` (years ≤ 2023, XML-in-ZIP via web scraping with 5-step session flow).
- Both expense and revenue sources hardcode a 2022 exception: only data from November onward is included.
- Raw files at `data/raw/` are committed (`.json` for most; `.zip` for revenue ≤ 2023; `.html` for TCE status); always overwritten on each run.
- Outputs: `docs/data/timeSeries.json` (balance entries) + `docs/data/rveSentTimeSeries.json` (report status).
- **Dead code**: `infrastructure/raw_repository.py` (`FileSystemRawRepository`) is defined but never imported — each source handles disk I/O via its own `PATH_TEMPLATE` and `HttpDownloader`.
- **Dead code**: `domain/entities.py` (`RawFileRecord`) and `domain/exceptions.py` (`DownloadError`, `TransformError`) are defined but never imported.
- **`HttpDownloader` quirk**: docstring says it raises `DownloadError` on non-200 responses, but actually silently ignores failures — the file is simply not written.

### ETL — TCE-RS Report Status
- Source: `jobs/sources/tce_report_status.py` (`TceReportStatusDataSource`).
- Scrapes `https://portal.tce.rs.gov.br/pcdi2/relatorios-recibos-envio.action?&cdOrgao=58500&ano={year}` — `cdOrgao=58500` is always the same for this municipality.
- **`pd.read_html()` quirk**: must wrap the HTML string in `StringIO` before passing to `read_html()` when using the `lxml` parser. Passing a raw string fails.
- Raw HTML files saved to `data/raw/tce/status_{year}.html`.
- Transforms period text like `"7º mês/2026"` into a millisecond timestamp using `Timestamp(f'{year}-{month}-01')` (start-of-month UTC).
- Status logic: if last reported period = month X, months > X → "ABERTO", months ≤ X → "FECHADO".

### Frontend — Clean Architecture
- 4 layers: `domain/` (entities), `application/` (use cases, interfaces, operations), `infrastructure/` (IO — `repositories/`, `views/`), `adapters/` (abstract renderer + `presenters/` + `controllers/`).
- `TimeSeries` is the data carrier — `{ rows: Array<{ period, ...numeric fields }> }`.
- Abstract contracts: `DataOperation` (`domain/`), `UseCaseInterface` + `TimeSeriesRepositoryInterface` (`application/`), `RendererInterface` → `TablePresenter`/`ChartPresenter`/`ModeSelectorPresenter` (`adapters/`).
- **Most operations and renderers are dynamic** — detect numeric keys at runtime, work with any shape. Exception: `ResultOperation` hardcodes `row.revenues - row.expenses`.
- **`Rolling12PeriodSumOperation` quirk**: returns empty `TimeSeries([])` when input has fewer than 12 rows — no partial window.
- All use cases implement `execute(request)` — `request` is an object (may be empty, or contain params like `{ year, detailExpenses }`).
- Chart.js imported as ES module via CDN in `infrastructure/views/JsDelivrChartRenderer.js`.
- **Pipeline** (in `app.js`): wrapped in `async function main()`. `HtmlModeSelectorRenderer` → callback clears containers → `DataVisualizationModeController` → `HtmlTableRenderer` + `JsDelivrChartRenderer`.
- **Frontend computes `expenses`**: `JsonTimeSeriesRepository.load()` derives `expenses = (collection ?? 0) + (landfill ?? 0)` — the ETL outputs `collection` and `landfill` separately, not `expenses`.
- **Result column coloring**: `result` cell gets red when `<0` and blue when `>=0` (body only — headers neutral).
- **Detail Expenses toggle**: `RequestModel.detailExpenses` (boolean, default `false`). When unchecked, shows `Receitas`, `Despesas`, `Resultado`. When checked, shows `Receitas`, `Coleta`, `Aterro`, `Resultado`. `FilterFieldsByDetailOperation` runs after `ResultOperation` but before aggregation. Data cached in `JsonTimeSeriesRepository` for instant toggle.
- **Chart stacked bars**: When detail ON, `collection` and `landfill` stack together; `revenues` is standalone. When detail OFF, `revenues` and `expenses` are side-by-side bars.

### Frontend — ABERTO/FECHADO Status Badge
- `JsonRveSentRepository` (`infrastructure/repositories/JsonRveSentRepository.js`) reads `docs/data/rveSentTimeSeries.json`, returns the first row's `period` via `lastReportedPeriod()`.
- `DataVisualizationModeController` passes `maxPeriod` (from `lastReportedPeriod()`) to `HtmlTableRenderer.render()`.
- `HtmlTableRenderer` compares each row's period against `maxPeriod` using `getUTCFullYear() * 12 + getUTCMonth()`.
- **Timestamp convention gotcha**: `rveSentTimeSeries.json` uses **start-of-month** UTC timestamps (e.g., `1782864000000` = Jul 1, 2026 00:00 UTC). `timeSeries.json` uses **end-of-month** UTC timestamps (e.g., `1785456000000` = Jul 31, 2026 00:00 UTC). Raw numeric `>` comparison fails because end-of-month > start-of-month even for the same month. The comparison must use **UTC getters** (`getUTCFullYear`/`getUTCMonth`), not local-time getters (`getFullYear`/`getMonth`), because local-time getters shift start-of-month UTC midnight back into the previous month in BRT (UTC-3).
- **Result**: `Math.max(...)` on the full dataset yields the end-of-month period of the latest row. If no `rveSentTimeSeries.json` data is available, the controller falls back to this max period (all rows show FECHADO).

### Frontend conventions
- ES modules with `.js` extensions in all imports.
- `app.js` is the composition root — wires dependencies, runs pipeline.
- Formatters (`infrastructure/views/formatters.js`) use `Intl.DateTimeFormat` / `Intl.NumberFormat` with `pt-BR` locale — `formatDate`, `formatCurrency`, `formatMillions`.
- Field labels (`infrastructure/views/fieldLabels.js`) map internal keys to pt-BR display names — update when adding new data fields.
- Styling via Tailwind CSS CDN (play mode, no build step) + CSS in `docs/css/styles.css`.
- **CSS classes are decoupled from views**: All view renderers define a `const STYLES` object at the top of the file with named keys for every class string. No raw Tailwind strings appear inline in DOM manipulation.
- **Responsive breakpoints** are in `docs/css/styles.css` (not `index.html`). Chart height controlled via `#chart-container` CSS — `maintainAspectRatio: false` fills container.

### CI/CD
- **Daily ETL** (`.github/workflows/update-data.yml`): runs `python jobs/` at 00:01 BRT (03:01 UTC) daily + manual trigger.
- Commits updated `docs/data/timeSeries.json` to `master` with `[skip ci]` to prevent loops.
- Git identity: `github-actions[bot]`. Python 3.12.

### Git workflow
- `dev` is the active development branch.
- Merge `dev` → `master` for production.
- Version bump in `pyproject.toml` before tagging.
- Tag format: `v{version}-beta` (annotated tags).

### Testing
- No test framework or test files exist. Do not assume any testing setup.

### Commit convention
- Valid types: `feat`, `fix`, `refactor`/`refact`, `docs`, `env`, `wip`, `chore`, `ci`.
- Optional scope in parens (observed: `(jobs)`, `(main)`, `(ci)`, `(frontend)`).
