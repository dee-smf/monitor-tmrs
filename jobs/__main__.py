"""ETL pipeline entry point.

Composition root that wires all dependencies, parses CLI input,
and delegates to the application controller.

Usage
-----
.. code-block:: bash

    python jobs/          # downloads current year, transforms all available data
    python jobs/ 2025     # downloads 2025, transforms all available data
    python jobs/ 2024-2026  # downloads 2024-2026, transforms all available data
"""

import sys
from pathlib import Path

from application.controller import EtlController
from application.merge_service import MergeService
from application.orchestrator import Orchestrator
from infrastructure.output_writer import JsonOutputWriter
from sources.source_factory import SourceFactory


sources = SourceFactory.all()
orchestrator: Orchestrator = Orchestrator(sources, MergeService())
writer = JsonOutputWriter()

controller = EtlController(orchestrator, writer, Path('docs/data/timeSeries.json'))

download_years: list[int] = EtlController.parse(sys.argv[1:])
controller.execute(download_years)
