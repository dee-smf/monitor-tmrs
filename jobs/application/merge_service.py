"""Data-merging service for the ETL pipeline.

Combines multiple transformed data sets into a single :class:`DataFrame`
using inner joins on the ``period`` column.
"""

from pandas import DataFrame


class MergeService:
    """Merge multiple data sets on the ``period`` column."""

    def merge(self, datasets: list[DataFrame]) -> DataFrame:
        """Merge a list of data sets via inner join on ``period``.

        Parameters
        ----------
        datasets : list[DataFrame]
            One or more data frames to merge. Each must contain a
            ``period`` column.

        Returns
        -------
        DataFrame
            Merged data set. Returns an empty :class:`DataFrame` if the
            input list is empty.
        """
        if not datasets:
            return DataFrame()
        result: DataFrame = datasets[0]
        for df in datasets[1:]:
            result = result.merge(df, on='period', how='inner')
        return result
