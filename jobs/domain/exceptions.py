"""Domain-specific exceptions for the ETL pipeline.

Each exception maps to a distinct failure mode in the data-processing flow.
"""


class DownloadError(Exception):
    """Raised when a remote resource cannot be fetched successfully."""


class TransformError(Exception):
    """Raised when a data transformation step fails."""
