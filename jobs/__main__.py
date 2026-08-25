"""ETL pipeline entry point.

Composition root that wires all dependencies, runs the pipeline for a
predefined period, and writes the merged result to ``docs/data/timeSeries.json``.

Usage
-----
.. code-block:: bash

    python jobs/
"""

from pathlib import Path

from pandas import DataFrame

from application.merge_service import MergeService
from application.orchestrator import Orchestrator
from infrastructure.output_writer import JsonOutputWriter
from sources.source_factory import SourceFactory


PERIOD: list[int] = list(range(2024, 2027))

orchestrator: Orchestrator = Orchestrator(SourceFactory.all(), MergeService())
result: DataFrame = orchestrator.run(PERIOD)

writer: JsonOutputWriter = JsonOutputWriter()
writer.write(result, Path('docs/data/timeSeries.json'))
