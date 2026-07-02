from abc import ABC, abstractmethod

from pandas import DataFrame


class DataSource(ABC):
    @property
    @abstractmethod
    def source_id(self) -> str: ...

    @abstractmethod
    def available_periods(self) -> list[int]: ...

    @abstractmethod
    def download(self, years: list[int]) -> None: ...

    @abstractmethod
    def load_raw(self, years: list[int]) -> DataFrame: ...

    @abstractmethod
    def transform(self, raw: DataFrame) -> DataFrame: ...
