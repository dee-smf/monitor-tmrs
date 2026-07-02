from pathlib import Path

from pandas import DataFrame

from domain.interfaces import OutputWriter


class JsonOutputWriter(OutputWriter):
    def write(self, df: DataFrame, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        df.to_json(str(path), index=False, orient='records')
