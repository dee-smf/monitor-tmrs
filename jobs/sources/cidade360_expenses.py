"""Data source for Cidade360 expense records.

Downloads expense data from the Cidade360 open-data portal, filters for
specific expense activities, and aggregates monthly totals.
"""

from pathlib import Path

from pandas import DataFrame, concat, read_json, to_datetime

from infrastructure.downloader import HttpDownloader
from sources.source_base import BalanceEntriesDataSource


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


class Cidade360ExpensesDataSource(BalanceEntriesDataSource):
    """Monthly expenses from Cidade360.

    Filters raw records whose ``descricao`` column is in
    :attr:`COLLECTION_ACTIVITIES` or :attr:`LANDFILL_ACTIVITIES`
    and aggregates monthly totals per subcategory.

    Attributes
    ----------
    PATH_TEMPLATE : str
        Local file path pattern (``%s`` substituted with year).
    URL_TEMPLATE : str
        Cidade360 download URL pattern.
    COLLECTION_ACTIVITIES : list[str]
        Activity descriptions for waste collection.
    LANDFILL_ACTIVITIES : list[str]
        Activity descriptions for sanitary landfill.
    """

    PATH_TEMPLATE: str = 'data/raw/cidade360/expenses_%s.json'
    URL_TEMPLATE: str = 'https://webapp1-saojosedonorte.cidade360.cloud/dadosabertos/despesas/baixarDadosDespesas/%s/PREF MUNIC. DE SÃO JOSÉ DO NORTE'
    COLLECTION_ACTIVITIES: list[str] = [
        'Manutenção dos Serviços de Coleta de Resíduos',
        'Manutenção e Aperfeiçoamento dos Serviços de Coleta de Resíduos Sólidos',
    ]
    LANDFILL_ACTIVITIES: list[str] = [
        'Serviços de Aterro Sanitário',
    ]

    @property
    def source_id(self) -> str:
        return 'cidade360_expenses'

    def available_periods(self) -> list[int]:
        pattern: str = self.PATH_TEMPLATE % '*'
        return sorted(
            int(p.stem.rsplit('_', 1)[-1])
            for p in Path('.').glob(pattern)
        )

    def download(self, years: list[int]) -> None:
        for year in years:
            url: str = self.URL_TEMPLATE % year
            dest: Path = Path(self.PATH_TEMPLATE % year)
            _downloader.download(url, dest)

    def load_raw(self, years: list[int]) -> DataFrame:
        return concat([
            read_json(self.PATH_TEMPLATE % year)
            for year in years
        ])

    def _build_category(self, raw: DataFrame, activities: list[str], column_name: str) -> DataFrame:
        filtered_df: DataFrame = raw.loc[
            raw['descricao'].isin(activities),
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
        result = resampled.reset_index().rename(columns={'valorLiquidado': column_name})

        # Exception: for 2022, only include data from November onward
        mask = ~(
            (result['period'].dt.year == 2022)
            & (result['period'].dt.month < 11)
        )
        filtered: DataFrame = result.loc[mask]
        return filtered.reset_index(drop=True)

    def transform(self, raw: DataFrame) -> DataFrame:
        collection: DataFrame = self._build_category(raw, self.COLLECTION_ACTIVITIES, 'collection')
        landfill: DataFrame = self._build_category(raw, self.LANDFILL_ACTIVITIES, 'landfill')
        return collection.merge(landfill, on='period', how='outer').fillna(0)
