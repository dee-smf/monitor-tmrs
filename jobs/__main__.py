from pandas import DataFrame

from expenses import download_raw_expenses, get_raw_expenses, transform_commited_expenditures
from revenues import download_raw_revenues, get_raw_revenues, transform_net_revenues


PERIOD: list[int] = list(range(2024, 2027))
#download_raw_expenses(PERIOD)
#download_raw_revenues(PERIOD)


raw_expenses: DataFrame = get_raw_expenses(PERIOD)
raw_revenues: DataFrame = get_raw_revenues(PERIOD)

commited_expenses: DataFrame = transform_commited_expenditures(raw_expenses)
net_revenues: DataFrame = transform_net_revenues(raw_revenues)

merged_data: DataFrame = net_revenues.merge(commited_expenses)
merged_data.to_json('timeSeries.json', index=False, orient='records')