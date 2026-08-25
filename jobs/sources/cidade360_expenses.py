"""Data source for Cidade360 expense records.

Downloads expense data from the Cidade360 open-data portal, filters for
specific expense activities, and aggregates monthly totals.
"""

from pathlib import Path

from pandas import DataFrame, concat, read_json, to_datetime

from infrastructure.downloader import HttpDownloader
from sources.source_base import DataSource


_downloader = HttpDownloader()


_MONTH_MAP: dict[str, str] = {
    'JANEIRO': '01',
    'FEVEREIRO': '02',
    'MARÇO': '03',
    'ABRIL': '04',
    'MAIO': '05',
    'JUNHO': '06',
    'JULHO': '07',
    'AGOSTO': '08',
    'SETEMBRO': '09',
    'OUTUBRO': '10',
    'NOVEMBRO': '11',
    'DEZEMBRO': '12',
}


class Cidade360ExpensesDataSource(DataSource):
    """Monthly expenses from Cidade360.

    Filters raw records whose ``descricao`` column is in
    :attr:`EXPENSE_ACTIVITIES` and aggregates monthly totals.

    Attributes
    ----------
    PATH_TEMPLATE : str
        Local file path pattern (``%s`` substituted with year).
    URL_TEMPLATE : str
        Cidade360 download URL pattern.
    EXPENSE_ACTIVITIES : list[str]
        Activity descriptions to include in the output.
    """

    PATH_TEMPLATE: str = 'data/raw/cidade360/expenses_%s.json'
    URL_TEMPLATE: str = 'https://webapp1-saojosedonorte.cidade360.cloud/dadosabertos/despesas/baixarDadosDespesas/%s/PREF MUNIC. DE SÃO JOSÉ DO NORTE'
    EXPENSE_ACTIVITIES: list[str] = [
        'Manutenção dos Serviços de Coleta de Resíduos',
        'Manutenção e Aperfeiçoamento dos Serviços de Coleta de Resíduos Sólidos',
        'Serviços de Aterro Sanitário',
    ]

    @property
    def source_id(self) -> str:
        return 'cidade360_expenses'

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
            read_json(self.PATH_TEMPLATE % year)
            for year in years
        ])

    def transform(self, raw: DataFrame) -> DataFrame:
        filtered_df: DataFrame = raw.loc[
            raw['descricao'].isin(self.EXPENSE_ACTIVITIES),
            ['exercicio', 'mes', 'valorLiquidado'],
        ]
        filtered_df['period'] = to_datetime(
            filtered_df['exercicio'].astype(str)
            + '-'
            + filtered_df['mes'].map(_MONTH_MAP)
            + '-01'
        )
        resampled: DataFrame = (
            filtered_df[['period', 'valorLiquidado']]
            .set_index('period')
            .resample('ME')
            .sum()
        )
        return resampled.reset_index().rename(columns={'valorLiquidado': 'expenses'})
