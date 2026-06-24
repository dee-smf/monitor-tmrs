from collections.abc import Callable
from io import BytesIO
from pathlib import Path
from typing import TypeAlias

from pandas import DataFrame, read_csv, to_datetime
from requests import get, Response


DownloaderCallback: TypeAlias = Callable[[str, Path], None]
DataFrameGetterCallback: TypeAlias = Callable[[Path], DataFrame]


def download_file(url: str, path: Path) -> None:
    response: Response = get(url)
    status: int = response.status_code

    if status == 200:
        with open(path, 'wb') as file:
            blob: BytesIO = BytesIO(response.content)
            file.write(blob.getvalue())


def get_df(path: Path) -> DataFrame:
    raw_df: DataFrame = read_csv(path, compression='zip', sep=',', decimal='.')
    return raw_df
