from pandas import DataFrame

from expenses import download_raw_expenses, get_raw_expenses, transform_commited_expenditures


PERIOD: list[int] = list(range(2022, 2027))
download_raw_expenses(PERIOD)


PROJECTS: list[int] = [2222, 2224]
raw_df: DataFrame = get_raw_expenses(PERIOD)
filtered_df: DataFrame = transform_commited_expenditures(raw_df, PROJECTS)
print(filtered_df)