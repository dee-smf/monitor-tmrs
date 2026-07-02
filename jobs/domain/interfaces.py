from abc import ABC, abstractmethod
from pathlib import Path

from pandas import DataFrame


class Downloader(ABC):
    @abstractmethod
    def download(self, url: str, dest: Path) -> None: ...


class RawRepository(ABC):
    @abstractmethod
    def exists(self, source_id: str, period: int) -> bool: ...

    @abstractmethod
    def save_raw(self, source_id: str, period: int, content: bytes) -> None: ...

    @abstractmethod
    def load_dataframe(self, source_id: str, period: int) -> DataFrame: ...

    @abstractmethod
    def raw_path(self, source_id: str, period: int) -> Path: ...


class OutputWriter(ABC):
    @abstractmethod
    def write(self, df: DataFrame, path: Path) -> None: ...
