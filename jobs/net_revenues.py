from pandas import DataFrame, read_json
from requests import get, Response

URL: str = 'https://webapp1-saojosedonorte.cidade360.cloud/dadosabertos/receitas/baixarDadosReceitas/2026/PREF%20MUNIC.%20DE%20S%C3%83O%20JOS%C3%89%20DO%20NORTE'
res: Response = get(URL)
df: DataFrame = DataFrame(res.json())
filtered_df: DataFrame = df.loc[df['Alinea'].str.startswith('1.1.2.2.53'), ['Mes', 'ValorArrecadadoLiquido']].groupby('Mes').sum()

print(filtered_df)