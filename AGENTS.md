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
- **Python ETL** (`jobs/`) downloads public financial data, transforms it, and outputs `public/data/timeSeries.json`.
- **Frontend** (`public/js/`) — vanilla JS ES modules, no bundler.

### Commands
- **Run ETL**: `python jobs/` (executes `jobs/__main__.py`)
- **Serve frontend**: any static file server pointed at `public/` (e.g. `python -m http.server 8000 -d public`)
- **Type check**: `mypy .` (strict mode — `disallow_untyped_defs`, `disallow_incomplete_defs`, `warn_return_any`)
- **Install deps**: `pip install -e ".[dev]"` (inside `.venv/`)
- **Activate venv first**: `.venv/` exists and is gitignored. Activate with `source .venv/bin/activate` before running Python or mypy commands.

### Python conventions
- All function signatures **must** include full type annotations (enforced by mypy).
- No formatter config exists — follow existing code style (see `jobs/` for reference).

### ETL — Clean Architecture
- 4 layers: `domain/` (interfaces), `infrastructure/` (IO), `sources/` (data implementations), `application/` (orchestration).
- Entrypoint `jobs/__main__.py`: hardcoded `PERIOD = list(range(2024, 2027))`, wires dependencies, calls `Orchestrator.run()`.
- Pipeline: `download()` → `load_raw()` → `transform()` per source → `MergeService`.
- New source: implement `DataSource`, define `PATH_TEMPLATE`, register in `SourceFactory._registered`.
- Raw files at `data/raw/` are committed; not re-downloaded if they exist.
- Output: `public/data/timeSeries.json`.

### Frontend — Clean Architecture
- 5 layers: `domain/` (entities), `application/` (use cases, interfaces, operations), `infrastructure/` (IO — `repositories/`, `views/`), `adapters/` (abstract renderer + `presenters/`).
- `TimeSeries` is the data carrier — `{ rows: Array<{ period, ...numeric fields }> }`.
- Abstract contracts: `DataOperation` (`domain/`), `UseCaseInterface` + `TimeSeriesRepositoryInterface` (`application/`), `RendererInterface` → `TablePresenter`/`ChartPresenter` (`adapters/`).
- **All operations and renderers are dynamic** — detect numeric keys at runtime, work with any shape.
- Chart.js imported as ES module via CDN (in `infrastructure/views/JsDelivrChartRenderer.js`):
  ```js
  import { Chart, registerables } from 'https://cdn.jsdelivr.net/npm/chart.js/+esm';
  Chart.register(...registerables);
  ```
- **Pipeline** (in `app.js`): `JsonTimeSeriesRepository` → `GetRolling12PeriodSumUseCase` (chains `Rolling12PeriodSumOperation` → `ResultOperation`) → `HtmlTableRenderer` + `JsDelivrChartRenderer`.
- 2 alternative use cases available (swap in `app.js`): `GetResultUseCase`, `GetCumulativeSumByYearUseCase`.

### Frontend conventions
- ES modules with `.js` extensions in all imports.
- `app.js` is the composition root — wires dependencies, runs pipeline.
- Formatters (`infrastructure/views/formatters.js`) use `Intl.DateTimeFormat` / `Intl.NumberFormat` with `pt-BR` locale.
- No CSS framework — pure HTML tables and Chart.js canvas.

### Testing
- No test framework or test files exist. Do not assume any testing setup.

### Commit convention
- Valid types: `feat`, `fix`, `refactor`/`refact`, `docs`, `env`.
- Optional scope in parens (observed: `(jobs)`, `(main)`).
