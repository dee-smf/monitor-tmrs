"""Application-layer controller.

Parses CLI input and coordinates the ETL pipeline by invoking the
orchestrator and output writer.
"""

from datetime import date
from pathlib import Path

from pandas import DataFrame

from application.orchestrator import Orchestrator
from domain.interfaces import OutputWriter


class EtlController:
    """Coordinate CLI input, pipeline execution, and output.

    Parameters
    ----------
    orchestrator : Orchestrator
        Pipeline coordinator that drives download, load, and transform.
    writer : OutputWriter
        Adapter that persists the merged entries data set.
    output_path : Path
        Destination file path for the merged entries output.
    status_writer : OutputWriter | None
        Adapter that persists the balance-status data set.
    status_output_path : Path | None
        Destination file path for the status output.
    """

    def __init__(
        self,
        orchestrator: Orchestrator,
        writer: OutputWriter,
        output_path: Path,
        status_writer: OutputWriter | None = None,
        status_output_path: Path | None = None,
    ) -> None:
        self._orchestrator: Orchestrator = orchestrator
        self._writer: OutputWriter = writer
        self._output_path: Path = output_path
        self._status_writer: OutputWriter | None = status_writer
        self._status_output_path: Path | None = status_output_path

    @staticmethod
    def parse(args: list[str]) -> list[int]:
        """Parse CLI arguments into a list of fiscal years.

        Parameters
        ----------
        args : list[str]
            Raw CLI arguments (e.g. ``sys.argv[1:]``).

        Returns
        -------
        list[int]
            Parsed years. Defaults to the current year when *args* is empty.
        """
        if not args:
            return [date.today().year]
        spec: str = args[0]
        if '-' in spec:
            start_s, end_s = spec.split('-', 1)
            return list(range(int(start_s), int(end_s) + 1))
        return [int(spec)]

    def execute(self, download_years: list[int]) -> None:
        """Run the full ETL pipeline and write the result.

        Parameters
        ----------
        download_years : list[int]
            Fiscal years to (re-)download before processing.
        """
        entries: DataFrame
        status: DataFrame
        entries, status = self._orchestrator.run(download_years)
        self._writer.write(entries, self._output_path)
        if self._status_writer is not None and self._status_output_path is not None:
            self._status_writer.write(status, self._status_output_path)
