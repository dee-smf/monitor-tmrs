"""Factory for creating data-source instances.

Central registry where new data sources are added so the pipeline can
discover them automatically.
"""

from sources.source_base import DataSource
from sources.tcers_expenses import TcersExpensesDataSource
from sources.cidade360_revenues import Cidade360RevenuesDataSource


class SourceFactory:
    """Creates and returns all registered data-source instances.

    To add a new source, import its class and append it to
    :attr:`_registered`. No other code changes are required.
    """

    _registered: list[type[DataSource]] = [
        TcersExpensesDataSource,
        Cidade360RevenuesDataSource,
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
