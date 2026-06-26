from pathlib import Path

from pandas import concat, DataFrame, to_datetime

from file_handler import DataFrameGetterCallback, download_file, DownloaderCallback, get_df


RAW_EXPENSES_PATH_TEMPLATE: str = 'data/raw/tcers/expenses_%s.zip'
RAW_EXPENSES_URL_TEMPLATE: str = 'https://dados.tce.rs.gov.br/dados/municipal/empenhos/%s/58500.csv.zip'
PROJECTS: list[int] = [2222, 2224]


def download_raw_expenses (
        years: list[int],
        path_template: str = RAW_EXPENSES_PATH_TEMPLATE,
        url_template: str = RAW_EXPENSES_URL_TEMPLATE,
        download_callback: DownloaderCallback = download_file
    ) -> None:
    for year in years:
        current_url: str = url_template %year
        current_path: Path = Path(path_template %year)
        download_callback(current_url, current_path)


def get_raw_expenses (
        years: list[int], 
        path_template: str = RAW_EXPENSES_PATH_TEMPLATE,
        df_getter_callback: DataFrameGetterCallback = get_df
    ) -> DataFrame:
    raw_df: DataFrame = concat([
        df_getter_callback(Path(path_template %year))
        for year in years
    ])

    return raw_df


def transform_commited_expenditures (df: DataFrame, projects: list[int] = PROJECTS) -> DataFrame:
    filtered: DataFrame = df.loc[df.cd_projeto.isin(projects), ['dt_operacao', 'vl_liquidacao']]
    filtered['dt_operacao'] = to_datetime(filtered['dt_operacao'])
    grouped: DataFrame = filtered.set_index('dt_operacao').resample('ME').sum()
    formatted: DataFrame = grouped.reset_index().rename(columns={'dt_operacao': 'period', 'vl_liquidacao': 'expenses'})
    return formatted
