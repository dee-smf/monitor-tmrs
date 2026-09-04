"""Data source for Cidade360 revenue records.

Routes year ranges to the appropriate acquisition strategy:

- Years >= 2024: JSON via the Cidade360 open-data API
- Years <= 2023: XML inside ZIP via PRONIMTB web scraping
"""

from __future__ import annotations

from pandas import DataFrame, concat

from sources.revenue_strategy import ApiStrategy, ScrapingStrategy, RevenueStrategy
from sources.source_base import BalanceEntriesDataSource


_strategies: list[RevenueStrategy] = [ScrapingStrategy(), ApiStrategy()]


class Cidade360RevenuesDataSource(BalanceEntriesDataSource):
    """Monthly net revenues from Cidade360.

    Dispatches to the correct :class:`RevenueStrategy` for each year
    based on a chain-of-responsibility pattern.  Each strategy is
    self-contained and handles its own download, load, and transform.
    """

    @property
    def source_id(self) -> str:
        return 'cidade360'

    def available_periods(self) -> list[int]:
        periods: set[int] = set()
        for strategy in _strategies:
            periods.update(strategy.available_periods())
        return sorted(periods)

    def download(self, years: list[int]) -> None:
        for year in years:
            strategy: RevenueStrategy = self._strategy_for(year)
            strategy.download(year)

    def load_raw(self, years: list[int]) -> DataFrame:
        frames: list[DataFrame] = []
        for year in years:
            strategy: RevenueStrategy = self._strategy_for(year)
            frame: DataFrame = strategy.load_raw(year)
            if not frame.empty:
                frames.append(frame)
        return concat(frames, ignore_index=True) if frames else DataFrame(columns=['period', 'revenues'])

    def transform(self, raw: DataFrame) -> DataFrame:
        return raw

    @staticmethod
    def _strategy_for(year: int) -> RevenueStrategy:
        """Return the first strategy that can handle the given year."""
        for strategy in _strategies:
            if strategy.can_parse(year):
                return strategy
        raise ValueError(
            f'No revenue strategy available for year {year}'
        )
