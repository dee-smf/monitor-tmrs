"""Abstract interfaces for the infrastructure layer.

Defines contracts that concrete adapters (HTTP, filesystem, etc.) must
implement, enabling dependency inversion per Clean Architecture.
"""

from abc import ABC, abstractmethod
from pathlib import Path

from pandas import DataFrame


class Downloader(ABC):
    """Interface for downloading remote files."""

    @abstractmethod
    def download(self, url: str, dest: Path) -> None:
        """Download a remote resource to a local path.

        Parameters
        ----------
        url : str
            Source URL to fetch.
        dest : Path
            Destination path on the local filesystem.
        """
        ...


class RawRepository(ABC):
    """Interface for persisting and loading raw data files."""

    @abstractmethod
    def exists(self, source_id: str, period: int) -> bool:
        """Check whether a raw file exists on disk.

        Parameters
        ----------
        source_id : str
            Data-source identifier.
        period : int
            Fiscal year.

        Returns
        -------
        bool
            ``True`` if the raw file already exists.
        """
        ...

    @abstractmethod
    def save_raw(self, source_id: str, period: int, content: bytes) -> None:
        """Persist raw bytes to disk.

        Parameters
        ----------
        source_id : str
            Data-source identifier.
        period : int
            Fiscal year.
        content : bytes
            Raw file content to write.
        """
        ...

    @abstractmethod
    def load_dataframe(self, source_id: str, period: int) -> DataFrame:
        """Load a raw file as a :class:`DataFrame`.

        Parameters
        ----------
        source_id : str
            Data-source identifier.
        period : int
            Fiscal year.

        Returns
        -------
        DataFrame
            Parsed raw data.
        """
        ...

    @abstractmethod
    def raw_path(self, source_id: str, period: int) -> Path:
        """Resolve the filesystem path for a raw file.

        Parameters
        ----------
        source_id : str
            Data-source identifier.
        period : int
            Fiscal year.

        Returns
        -------
        Path
            Full path to the raw file.
        """
        ...


class OutputWriter(ABC):
    """Interface for writing the final merged data set."""

    @abstractmethod
    def write(self, df: DataFrame, path: Path) -> None:
        """Write a :class:`DataFrame` to a file.

        Parameters
        ----------
        df : DataFrame
            Data to persist.
        path : Path
            Destination file path.
        """
        ...
