from typing import Any

from pandas import DataFrame

from sources.tcers_expenses import TcersExpensesDataSource


_source = TcersExpensesDataSource()


def download_raw_expenses(
        years: list[int],
        path_template: Any = None,
        url_template: Any = None,
        download_callback: Any = None,
    ) -> None:
    _source.download(years)


def get_raw_expenses(
        years: list[int],
        path_template: Any = None,
        df_getter_callback: Any = None,
    ) -> DataFrame:
    return _source.load_raw(years)


def transform_commited_expenditures(
        df: DataFrame,
        projects: Any = None,
    ) -> DataFrame:
    return _source.transform(df)
