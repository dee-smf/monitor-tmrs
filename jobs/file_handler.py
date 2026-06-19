from io import BytesIO
from requests import get, Response
from pathlib import Path
from pandas import DataFrame, read_csv, to_datetime


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

def transform_df(df: DataFrame) -> DataFrame:
    filtered: DataFrame = df.loc[df.cd_projeto == 2222, ['dt_operacao', 'vl_liquidacao']]
    filtered['dt_operacao'] = to_datetime(filtered['dt_operacao'])
    grouped: DataFrame = filtered.set_index('dt_operacao').resample('ME').sum()
    return grouped

RAW_COMMITTED_EXPENDITURE_URL: str = 'https://dados.tce.rs.gov.br/dados/municipal/empenhos/2026/58500.csv.zip'
RAW_COMMITTED_EXPENDITURE_PATH: Path = Path('data/raw/expenses/commited_expenditure.zip')
download_file(RAW_COMMITTED_EXPENDITURE_URL, RAW_COMMITTED_EXPENDITURE_PATH)
raw_df: DataFrame = get_df(RAW_COMMITTED_EXPENDITURE_PATH)
filtered_df: DataFrame = transform_df(raw_df)
print(filtered_df)


