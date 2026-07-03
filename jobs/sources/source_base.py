"""Abstract base for all data sources.

Defines the interface every data source must implement for the ETL
pipeline to discover, download, load, and transform its data.
"""

from abc import ABC, abstractmethod

from pandas import DataFrame


class DataSource(ABC):
    """A single data source in the ETL pipeline.

    Implementations must provide a unique ``source_id`` and handle the
    full extract-transform lifecycle.
    """

    @property
    @abstractmethod
    def source_id(self) -> str:
        """Unique identifier for this source (e.g. ``"tcers"``)."""
        ...

    @abstractmethod
    def available_periods(self) -> list[int]:
        """Return the fiscal years this source can provide data for.

        Returns
        -------
        list[int]
            List of available years.
        """
        ...

    @abstractmethod
    def download(self, years: list[int]) -> None:
        """Download raw data for the given years.

        Implementations should skip years where data already exists on
        disk (incremental fetch).

        Parameters
        ----------
        years : list[int]
            Fiscal years to download.
        """
        ...

    @abstractmethod
    def load_raw(self, years: list[int]) -> DataFrame:
        """Load previously-downloaded raw data into a :class:`DataFrame`.

        Parameters
        ----------
        years : list[int]
            Fiscal years to load.

        Returns
        -------
        DataFrame
            Combined raw data for the requested years.
        """
        ...

    @abstractmethod
    def transform(self, raw: DataFrame) -> DataFrame:
        """Transform raw data into the canonical output schema.

        Parameters
        ----------
        raw : DataFrame
            Raw data as returned by :meth:`load_raw`.

        Returns
        -------
        DataFrame
            Transformed data with at least a ``period`` column.
        """
        ...
