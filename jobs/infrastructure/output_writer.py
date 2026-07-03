"""JSON output-writer implementation.

Serialises the final merged data set as a JSON file consumed by the
static frontend.
"""

from pathlib import Path

from pandas import DataFrame

from domain.interfaces import OutputWriter


class JsonOutputWriter(OutputWriter):
    """Write a :class:`DataFrame` as a JSON records array."""

    def write(self, df: DataFrame, path: Path) -> None:
        """Write data to a JSON file.

        Creates parent directories if they do not exist. Output uses the
        ``records`` orientation (list of objects).

        Parameters
        ----------
        df : DataFrame
            Data to serialize.
        path : Path
            Destination file path.
        """
        path.parent.mkdir(parents=True, exist_ok=True)
        df.to_json(str(path), index=False, orient='records')
