"""Data source for TCERS (Court of Auditors) expense records.

Downloads committed expenditure data from the Rio Grande do Sul State
Court of Auditors open-data portal, filters for the relevant projects,
and aggregates monthly totals.
"""

from pathlib import Path

from pandas import DataFrame, concat, read_csv, to_datetime

from infrastructure.downloader import HttpDownloader
from sources.source_base import DataSource


_downloader = HttpDownloader()


class TcersExpensesDataSource(DataSource):
    """Monthly committed expenses from TCERS.

    Filters raw commitment records for project codes listed in
    :attr:`PROJECTS` and resamples them to month-end totals.

    Attributes
    ----------
    PATH_TEMPLATE : str
        Local file path pattern (``%s`` substituted with year).
    URL_TEMPLATE : str
        TCERS download URL pattern.
    PROJECTS : list[int]
        Project codes to include in the output.
    """

    PATH_TEMPLATE: str = 'data/raw/tcers/expenses_%s.zip'
    URL_TEMPLATE: str = 'https://dados.tce.rs.gov.br/dados/municipal/empenhos/%s/58500.csv.zip'
    PROJECTS: list[int] = [2222, 2224]

    @property
    def source_id(self) -> str:
        return 'tcers'

    def available_periods(self) -> list[int]:
        return list(range(2024, 2027))

    def download(self, years: list[int]) -> None:
        for year in years:
            url: str = self.URL_TEMPLATE % year
            dest: Path = Path(self.PATH_TEMPLATE % year)
            if dest.exists():
                continue
            _downloader.download(url, dest)

    def load_raw(self, years: list[int]) -> DataFrame:
        return concat([
            read_csv(Path(self.PATH_TEMPLATE % year), compression='zip', sep=',', decimal='.')
            for year in years
        ])

    def transform(self, raw: DataFrame) -> DataFrame:
        filtered: DataFrame = raw.loc[
            raw.cd_projeto.isin(self.PROJECTS), ['dt_operacao', 'vl_liquidacao']
        ]
        filtered['dt_operacao'] = to_datetime(filtered['dt_operacao'])
        grouped: DataFrame = filtered.set_index('dt_operacao').resample('ME').sum()
        return grouped.reset_index().rename(columns={
            'dt_operacao': 'period', 'vl_liquidacao': 'expenses',
        })
