from file_handler import *

RAW_COMMITTED_EXPENDITURE_URL: str = 'https://dados.tce.rs.gov.br/dados/municipal/empenhos/2026/58500.csv.zip'
RAW_COMMITTED_EXPENDITURE_PATH: Path = Path('data/raw/expenses/commited_expenditure.zip')
download_file(RAW_COMMITTED_EXPENDITURE_URL, RAW_COMMITTED_EXPENDITURE_PATH)
PROJECTS: list[int] = [2222, 2224]
raw_df: DataFrame = get_df(RAW_COMMITTED_EXPENDITURE_PATH)
filtered_df: DataFrame = transform_df(raw_df, PROJECTS)
print(filtered_df)