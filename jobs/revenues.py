from typing import Any

from pandas import DataFrame

from sources.cidade360_revenues import Cidade360RevenuesDataSource


_source = Cidade360RevenuesDataSource()


def download_raw_revenues(
        years: list[int],
        url_template: Any = None,
        path_template: Any = None,
        download_callback: Any = None,
    ) -> None:
    _source.download(years)


def get_raw_revenues(
        years: list[int],
        path_template: Any = None,
        df_getter_callback: Any = None,
    ) -> DataFrame:
    return _source.load_raw(years)


def transform_net_revenues(
        raw_df: DataFrame,
        revenue_code: Any = None,
    ) -> DataFrame:
    return _source.transform(raw_df)
