"""Application-layer orchestrator.

Coordinates the ETL pipeline by executing each data source and merging
their results.
"""

from pandas import DataFrame

from application.merge_service import MergeService
from sources.source_base import BalanceEntriesDataSource, BalanceStatusDataSource, DataSource


class Orchestrator:
    """Execute the full ETL pipeline across multiple data sources.

    Parameters
    ----------
    sources : list[DataSource]
        Data sources to process.
    merge_service : MergeService
        Service that merges individual source results.
    """

    def __init__(self, sources: list[DataSource], merge_service: MergeService) -> None:
        self._sources: list[DataSource] = sources
        self._merge_service: MergeService = merge_service

    def run(self, download_years: list[int]) -> tuple[DataFrame, DataFrame]:
        """Run the pipeline for the given periods.

        Returns a tuple of ``(entries, status)`` where *entries* is the
        merged balance-entries time-series and *status* is the balance-status
        time-series (may be empty).

        Parameters
        ----------
        download_years : list[int]
            Fiscal years to (re-)download.

        Returns
        -------
        tuple[DataFrame, DataFrame]
            Merged entries and status DataFrames.
        """
        entries: list[BalanceEntriesDataSource] = [
            s for s in self._sources if isinstance(s, BalanceEntriesDataSource)
        ]
        status: list[BalanceStatusDataSource] = [
            s for s in self._sources if isinstance(s, BalanceStatusDataSource)
        ]

        entries_df: DataFrame = self._run_entries(entries, download_years)
        status_df: DataFrame = self._run_status(status, download_years)
        return entries_df, status_df

    def _run_entries(
        self,
        sources: list[BalanceEntriesDataSource],
        download_years: list[int],
    ) -> DataFrame:
        all_years: list[int] = sorted({
            year
            for source in sources
            for year in source.available_periods()
        })
        transformed: list[DataFrame] = []
        for source in sources:
            source.download(download_years)
            raw: DataFrame = source.load_raw(all_years)
            result: DataFrame = source.transform(raw)
            transformed.append(result)
        return self._merge_service.merge(transformed)

    def _run_status(
        self,
        sources: list[BalanceStatusDataSource],
        download_years: list[int],
    ) -> DataFrame:
        if not sources:
            return DataFrame()
        frames: list[DataFrame] = []
        for source in sources:
            source.download(download_years)
            raw: DataFrame = source.load(download_years)
            result: DataFrame = source.transform(raw)
            frames.append(result)
        if not frames:
            return DataFrame()
        return frames[0] if len(frames) == 1 else self._merge_service.merge(frames)
