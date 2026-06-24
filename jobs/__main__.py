from pandas import DataFrame
from commited_extpenditures import download_commited_expenditures, get_raw_commited_expenditures, transform_commited_expenditures


PERIOD: list[int] = list(range(2022, 2027))
download_commited_expenditures(PERIOD)


PROJECTS: list[int] = [2222, 2224]
raw_df: DataFrame = get_raw_commited_expenditures(PERIOD)
filtered_df: DataFrame = transform_commited_expenditures(raw_df, PROJECTS)
print(filtered_df)