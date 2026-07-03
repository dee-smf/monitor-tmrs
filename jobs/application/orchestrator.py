"""Application-layer orchestrator.

Coordinates the ETL pipeline by executing each data source and merging
their results.
"""

from pandas import DataFrame

from application.merge_service import MergeService
from sources.source_base import DataSource


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

    def run(self, periods: list[int]) -> DataFrame:
        """Run the pipeline for the given periods.

        For each source:
            1. Download raw data (if not already cached).
            2. Load raw data into a :class:`DataFrame`.
            3. Transform the raw data.
        Finally, merge all transformed results.

        Parameters
        ----------
        periods : list[int]
            Fiscal years to process.

        Returns
        -------
        DataFrame
            Merged data set from all sources.
        """
        transformed: list[DataFrame] = []
        for source in self._sources:
            source.download(periods)
            raw: DataFrame = source.load_raw(periods)
            result: DataFrame = source.transform(raw)
            transformed.append(result)
        return self._merge_service.merge(transformed)
