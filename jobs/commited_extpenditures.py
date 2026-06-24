from pathlib import Path

from pandas import concat, DataFrame, to_datetime

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


def transform_commited_expenditures (df: DataFrame, projects: list[int]) -> DataFrame:
    filtered: DataFrame = df.loc[df.cd_projeto.isin(projects), ['dt_operacao', 'vl_liquidacao']]
    filtered['dt_operacao'] = to_datetime(filtered['dt_operacao'])
    grouped: DataFrame = filtered.set_index('dt_operacao').resample('ME').sum()
    return grouped
