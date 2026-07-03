"""Filesystem-backed raw-data repository.

Stores and retrieves raw downloaded files as compressed CSV archives
under a configurable base directory.
"""

from pathlib import Path

from pandas import DataFrame, read_csv

from domain.interfaces import RawRepository


class FileSystemRawRepository(RawRepository):
    """Raw-data repository using the local filesystem.

    Parameters
    ----------
    base_path : str
        Root directory for raw data files (default ``"data/raw"``).
    """

    def __init__(self, base_path: str = 'data/raw') -> None:
        self._base: Path = Path(base_path)

    def raw_path(self, source_id: str, period: int) -> Path:
        """Resolve the path for a source's raw file.

        Pattern: ``{base}/{source_id}/{period}.zip``.

        Parameters
        ----------
        source_id : str
            Data-source identifier.
        period : int
            Fiscal year.

        Returns
        -------
        Path
            Resolved filesystem path.
        """
        return self._base / source_id / f'{period}.zip'

    def exists(self, source_id: str, period: int) -> bool:
        """Check whether a raw file is already present on disk.

        Parameters
        ----------
        source_id : str
            Data-source identifier.
        period : int
            Fiscal year.

        Returns
        -------
        bool
            ``True`` if the file exists.
        """
        return self.raw_path(source_id, period).exists()

    def save_raw(self, source_id: str, period: int, content: bytes) -> None:
        """Persist raw bytes to disk.

        Creates parent directories as needed.

        Parameters
        ----------
        source_id : str
            Data-source identifier.
        period : int
            Fiscal year.
        content : bytes
            File content to write.
        """
        path: Path = self.raw_path(source_id, period)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)

    def load_dataframe(self, source_id: str, period: int) -> DataFrame:
        """Load a raw compressed CSV as a :class:`DataFrame`.

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
        return read_csv(self.raw_path(source_id, period), compression='zip', sep=',', decimal='.')

    def read_csv(self, path: Path) -> DataFrame:
        """Read a compressed CSV file from an arbitrary path.

        Parameters
        ----------
        path : Path
            Path to a ``.zip``-compressed CSV file.

        Returns
        -------
        DataFrame
            Parsed data.
        """
        return read_csv(path, compression='zip', sep=',', decimal='.')
