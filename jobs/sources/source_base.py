"""Abstract base for all data sources.

Defines the generic :class:`DataSource` interface and two segregated
sub-interfaces following the Interface Segregation Principle:

- :class:`BalanceEntriesDataSource` — revenue / expense time-series.
- :class:`BalanceStatusDataSource` — external status signals (e.g. TCE-RS).
"""

from abc import ABC, abstractmethod

from pandas import DataFrame


class DataSource(ABC):
    """Generic interface every data source must satisfy.

    Only the minimal contract shared by *all* source types lives here.
    """

    @property
    @abstractmethod
    def source_id(self) -> str:
        """Unique identifier for this source (e.g. ``"tcers"``)."""
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


class BalanceEntriesDataSource(DataSource):
    """Interface for balance entry sources (revenues, expenses).

    Adds the load / transform lifecycle that the orchestrator needs to
    merge multiple entry sources into a single time-series.
    """

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


class BalanceStatusDataSource(DataSource):
    """Interface for balance status sources (TCE-RS report tracking).

    These sources produce an independent time-series that the frontend
    uses to derive the ABERTO / FECHADO status of each period.
    """

    @abstractmethod
    def load(self, years: list[int]) -> DataFrame:
        """Load previously-downloaded raw data into a :class:`DataFrame`.

        Parameters
        ----------
        years : list[int]
            Fiscal years to load.

        Returns
        -------
        DataFrame
            Parsed status records for the requested years.
        """
        ...

    @abstractmethod
    def transform(self, raw: DataFrame) -> DataFrame:
        """Transform raw status data into the canonical output schema.

        Parameters
        ----------
        raw : DataFrame
            Raw data as returned by :meth:`load`.

        Returns
        -------
        DataFrame
            Transformed data with ``period`` and ``date`` columns.
        """
        ...
