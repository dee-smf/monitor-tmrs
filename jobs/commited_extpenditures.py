from pathlib import Path
from file_handler import download_file, DownloaderCallback

def download_commited_expenditures (
        years: list[int],
        path_template: str = 'data/raw/expenses/commited_expenditure_%s.zip',
        url_template: str = 'https://dados.tce.rs.gov.br/dados/municipal/empenhos/%s/58500.csv.zip',
        download_callback: DownloaderCallback = download_file
    ) -> None:
    for year in years:
        current_url: str = url_template %year
        current_path: Path = Path(path_template %year)
        download_callback(current_url, current_path)