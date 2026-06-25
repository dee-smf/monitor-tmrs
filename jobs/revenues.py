from pathlib import Path

from pandas import DataFrame, read_json
from requests import get, Response

from file_handler import download_file, DownloaderCallback


RAW_REVENUES_URL_TEMPLATE: str = 'https://webapp1-saojosedonorte.cidade360.cloud/dadosabertos/receitas/baixarDadosReceitas/%s/PREF MUNIC. DE SÃO JOSÉ DO NORTE'
RAW_REVENUES_PATH_TEMPLATE: str = 'data/raw/cidade360/revenues_%s.json'


def download_raw_revenues (
        years: list[int],
        url_template: str = RAW_REVENUES_URL_TEMPLATE,
        path_template: str = RAW_REVENUES_PATH_TEMPLATE,
        download_callback: DownloaderCallback = download_file
    ) -> None:
    for year in years:
        current_url: str = url_template %year
        current_path: Path = Path(path_template %year)
        download_callback(current_url, current_path)


#res: Response = get(URL)
#df: DataFrame = DataFrame(res.json())
#filtered_df: DataFrame = df.loc[df['Alinea'].str.startswith('1.1.2.2.53'), ['Mes', 'ValorArrecadadoLiquido']].groupby('Mes').sum()

#print(filtered_df)