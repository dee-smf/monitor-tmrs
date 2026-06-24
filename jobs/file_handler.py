from collections.abc import Callable
from io import BytesIO
from pathlib import Path
from typing import TypeAlias

from pandas import DataFrame, read_csv, to_datetime
from requests import get, Response


DownloaderCallback: TypeAlias = Callable[[str, Path], None]


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


def transform_df(df: DataFrame, projects: list[int]) -> DataFrame:
    filtered: DataFrame = df.loc[df.cd_projeto.isin(projects), ['dt_operacao', 'vl_liquidacao']]
    filtered['dt_operacao'] = to_datetime(filtered['dt_operacao'])
    grouped: DataFrame = filtered.set_index('dt_operacao').resample('ME').sum()
    return grouped
