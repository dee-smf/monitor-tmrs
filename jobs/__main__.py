from pandas import DataFrame

from expenses import download_raw_expenses, get_raw_expenses, transform_commited_expenditures
from revenues import download_raw_revenues


PERIOD: list[int] = list(range(2024, 2027))
#download_raw_expenses(PERIOD)
#download_raw_revenues(PERIOD)



raw_expenses: DataFrame = get_raw_expenses(PERIOD)
transformed_expenses: DataFrame = transform_commited_expenditures(raw_expenses)
print(transformed_expenses)