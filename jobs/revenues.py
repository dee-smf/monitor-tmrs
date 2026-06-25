from pathlib import Path

from pandas import concat, DataFrame, read_json
from requests import get, Response

from file_handler import DataFrameGetterCallback, download_file, DownloaderCallback, get_df


RAW_REVENUES_URL_TEMPLATE: str = 'https://webapp1-saojosedonorte.cidade360.cloud/dadosabertos/receitas/baixarDadosReceitas/%s/PREF MUNIC. DE SÃO JOSÉ DO NORTE'
RAW_REVENUES_PATH_TEMPLATE: str = 'data/raw/cidade360/revenues_%s.json'


def download_raw_revenues (
        years: list[int],
        url_template: str = RAW_REVENUES_URL_TEMPLATE,
        path_template: str = RAW_REVENUES_PATH_TEMPLATE,
        download_callback: DownloaderCallback = download_file
    ) -> None:
    for year in years:
        current_url: str = url_template %year
        current_path: Path = Path(path_template %year)
        download_callback(current_url, current_path)



def get_raw_revenues(
        years: list[int],
        path_template: str = RAW_REVENUES_PATH_TEMPLATE,
        df_getter_callback: DataFrameGetterCallback = get_df
    ) -> DataFrame:
    raw_df: DataFrame = concat([
        read_json(path_template %year)
        for year in years
    ])
    return raw_df
