from pathlib import Path

from pandas import DataFrame, read_csv

from domain.interfaces import RawRepository


class FileSystemRawRepository(RawRepository):
    def __init__(self, base_path: str = 'data/raw') -> None:
        self._base: Path = Path(base_path)

    def raw_path(self, source_id: str, period: int) -> Path:
        return self._base / source_id / f'{period}.zip'

    def exists(self, source_id: str, period: int) -> bool:
        return self.raw_path(source_id, period).exists()

    def save_raw(self, source_id: str, period: int, content: bytes) -> None:
        path: Path = self.raw_path(source_id, period)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)

    def load_dataframe(self, source_id: str, period: int) -> DataFrame:
        return read_csv(self.raw_path(source_id, period), compression='zip', sep=',', decimal='.')

    def read_csv(self, path: Path) -> DataFrame:
        return read_csv(path, compression='zip', sep=',', decimal='.')
