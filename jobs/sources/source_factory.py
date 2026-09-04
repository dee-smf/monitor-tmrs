"""Factory for creating data-source instances.

Central registry where new data sources are added so the pipeline can
discover them automatically.
"""

from sources.source_base import DataSource
from sources.cidade360_expenses import Cidade360ExpensesDataSource
from sources.cidade360_revenues import Cidade360RevenuesDataSource
from sources.tce_report_status import TceReportStatusDataSource


class SourceFactory:
    """Creates and returns all registered data-source instances.

    To add a new source, import its class and append it to
    :attr:`_registered`. No other code changes are required.
    """

    _registered: list[type[DataSource]] = [
        Cidade360ExpensesDataSource,
        Cidade360RevenuesDataSource,
        TceReportStatusDataSource,
    ]

    @classmethod
    def all(cls) -> list[DataSource]:
        """Instantiate and return every registered data source.

        Returns
        -------
        list[DataSource]
            One instance per entry in :attr:`_registered`.
        """
        return [source_cls() for source_cls in cls._registered]
