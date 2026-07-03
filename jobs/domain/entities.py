"""Domain entities and type aliases.

Provides lightweight data containers shared across layers.
"""

from dataclasses import dataclass


Period = int
"""Alias representing a fiscal period (year)."""


@dataclass(frozen=True)
class RawFileRecord:
    """Record identifying a raw downloaded file.

    Attributes
    ----------
    source_id : str
        Unique identifier of the data source (e.g. ``"tcers"``).
    period : int
        Fiscal year the file belongs to.
    path : str
        Relative or absolute path to the file on disk.
    """

    source_id: str
    period: int
    path: str
