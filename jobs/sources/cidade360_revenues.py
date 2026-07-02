from pathlib import Path

from pandas import DataFrame, concat, read_json, to_datetime

from infrastructure.downloader import HttpDownloader
from sources.source_base import DataSource


_downloader = HttpDownloader()


class Cidade360RevenuesDataSource(DataSource):
    PATH_TEMPLATE: str = 'data/raw/cidade360/revenues_%s.json'
    URL_TEMPLATE: str = 'https://webapp1-saojosedonorte.cidade360.cloud/dadosabertos/receitas/baixarDadosReceitas/%s/PREF MUNIC. DE SÃO JOSÉ DO NORTE'
    REVENUE_CODE: str = '1.1.2.2.53'

    @property
    def source_id(self) -> str:
        return 'cidade360'

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
            raw['Alinea'].str.startswith(self.REVENUE_CODE),
            ['DataArrecadacao', 'ValorArrecadadoLiquido']
        ]
        filtered_df['DataArrecadacao'] = to_datetime(filtered_df['DataArrecadacao'])
        resampled_df: DataFrame = filtered_df.set_index('DataArrecadacao').resample('ME').sum()
        return resampled_df.reset_index().rename(columns={
            'DataArrecadacao': 'period', 'ValorArrecadadoLiquido': 'revenues',
        })
