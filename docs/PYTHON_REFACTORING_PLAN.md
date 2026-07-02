# Python ETL Refactoring Plan

## Target Architecture

```
jobs/
  domain/               # Enterprise business rules
    interfaces.py       # Abstract ports (DataSource, Repository, Downloader)
    entities.py         # Period, RawFileRecord, MergedDataset
    exceptions.py       # DownloadError, TransformError
  application/          # Use cases
    orchestrator.py     # Coordinates ETL flow per source
    merge_service.py    # Generic multi-source merge on 'period'
  infrastructure/       # External adapters
    downloader.py       # HTTP download with existence check
    raw_repository.py   # Filesystem repo: data/raw/{source_id}/{period}.ext
    output_writer.py    # Writes merged DataFrame to JSON
  sources/              # Data source implementations (pluggable)
    source_base.py      # Abstract DataSource
    source_factory.py   # Registry + factory
    tcers_expenses.py   # Existing expense source
    cidade360_revenues.py # Existing revenue source
```

## Principles

- **Incremental replacement**: Each commit builds a new layer AND patches the old pipeline to delegate to it, so `python jobs/` exercises new code immediately.
- **No broken intermediate states**: At every commit, `python jobs/` runs without error.
- **E2E validation**: After each commit, run `python jobs/` and verify `public/data/timeSeries.json` output is correct.

## Steps

- [ ] **0. Pre-implementation — commit this planning file**
      Create `docs/PYTHON_REFACTORING_PLAN.md`.

- [ ] **1. Replace I/O layer — add domain + infrastructure packages**
      - Create `domain/` (interfaces, entities, exceptions)
      - Create `infrastructure/` (downloader, raw_repository, output_writer)
      - Rewrite `file_handler.py` to delegate `download_file()` to `Downloader`
      - Adds existence check before HTTP download (incremental fetch)
      - **E2E**: `python jobs/` — output identical; re-run skips existing files

- [ ] **2. Replace source logic — add sources package**
      - Create `sources/` (base class, factory, two implementations)
      - Rewrite `expenses.py` functions to delegate to `TcersExpensesDataSource`
      - Rewrite `revenues.py` functions to delegate to `Cidade360RevenuesDataSource`
      - **E2E**: `python jobs/` — output identical, now driven by DataSource classes

- [ ] **3. Replace orchestration — add application layer + rewire __main__**
      - Create `application/` (orchestrator, merge_service)
      - Rewrite `__main__.py` as composition root using `Orchestrator.run()`
      - **E2E**: `python jobs/` — output identical via new orchestrator

- [ ] **4. Clean up — remove legacy modules**
      - Delete `file_handler.py`, `expenses.py`, `revenues.py`
      - Ensure `mypy .` passes with zero errors
      - **E2E**: `python jobs/` — output identical; `mypy .` clean

## Migrating a new source to this structure

1. Create `jobs/sources/your_source.py` implementing `DataSource`
2. Register it in `source_factory.py`
3. The orchestrator picks it up automatically — no other changes needed
