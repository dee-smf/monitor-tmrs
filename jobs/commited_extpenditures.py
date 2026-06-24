from pathlib import Path

from pandas import concat, DataFrame

from file_handler import DataFrameGetterCallback, download_file, DownloaderCallback, get_df


RAW_COMMITED_EXPENDITURES_PATH: str = 'data/raw/expenses/commited_expenditure_%s.zip'


def download_commited_expenditures (
        years: list[int],
        path_template: str = RAW_COMMITED_EXPENDITURES_PATH,
        url_template: str = 'https://dados.tce.rs.gov.br/dados/municipal/empenhos/%s/58500.csv.zip',
        download_callback: DownloaderCallback = download_file
    ) -> None:
    for year in years:
        current_url: str = url_template %year
        current_path: Path = Path(path_template %year)
        download_callback(current_url, current_path)


def get_raw_commited_expenditures (
        years: list[int], 
        path_template: str = RAW_COMMITED_EXPENDITURES_PATH,
        df_getter_callback: DataFrameGetterCallback = get_df
    ) -> DataFrame:
    raw_df: DataFrame = concat([
        df_getter_callback(Path(path_template %year))
        for year in years
    ])

    return raw_df