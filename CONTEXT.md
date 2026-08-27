# Domain Glossary — monitor-tmrs

## Data Pipeline

- **ETL (Extract, Transform, Load)**: Python jobs that download public financial data, transform it, and output `docs/data/timeSeries.json`.
- **timeSeries.json**: The single output artifact of the ETL — a JSON array of period objects with `expenses` and `revenues` fields.
- **Period**: A time bucket in the time series, identified by a Unix timestamp (`period` field).

## Automation

- **Daily Update Workflow**: GitHub Actions workflow that runs the ETL at 00:01 BRT (03:01 UTC) daily and commits the result to `master`.
- **[skip ci]**: Marker in commit messages that prevents GitHub Actions from re-triggering workflows, breaking potential infinite loops.

## Branches

- **master**: Production branch; the daily workflow pushes data here.
- **dev**: Active development branch.
