from collections.abc import Callable
from pathlib import Path
from typing import TypeAlias

from pandas import DataFrame

from infrastructure.downloader import HttpDownloader
from infrastructure.raw_repository import FileSystemRawRepository


DownloaderCallback: TypeAlias = Callable[[str, Path], None]
DataFrameGetterCallback: TypeAlias = Callable[[Path], DataFrame]

_downloader = HttpDownloader()
_repo = FileSystemRawRepository()


def download_file(url: str, path: Path) -> None:
    if path.exists():
        return
    _downloader.download(url, path)


def get_df(path: Path) -> DataFrame:
    return _repo.read_csv(path)
