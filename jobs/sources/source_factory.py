from sources.source_base import DataSource
from sources.tcers_expenses import TcersExpensesDataSource
from sources.cidade360_revenues import Cidade360RevenuesDataSource


class SourceFactory:
    _registered: list[type[DataSource]] = [
        TcersExpensesDataSource,
        Cidade360RevenuesDataSource,
    ]

    @classmethod
    def all(cls) -> list[DataSource]:
        return [source_cls() for source_cls in cls._registered]
