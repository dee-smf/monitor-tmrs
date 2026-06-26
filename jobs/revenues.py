from pathlib import Path

from pandas import concat, DataFrame, read_json, to_datetime
from requests import get

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


def transform_net_revenues(raw_df: DataFrame, revenue_code: str = '1.1.2.2.53') -> DataFrame:
    filtered_df: DataFrame = raw_df.loc[
        raw_df['Alinea'].str.startswith(revenue_code), 
        ['DataArrecadacao', 'ValorArrecadadoLiquido']
    ]
    filtered_df['DataArrecadacao'] = to_datetime(filtered_df['DataArrecadacao'])
    resampled_df: DataFrame = filtered_df.set_index('DataArrecadacao').resample('ME').sum()
    formatted: DataFrame = resampled_df.reset_index().rename(columns={'DataArrecadacao': 'period', 'ValorArrecadadoLiquido': 'revenues'})

    return formatted