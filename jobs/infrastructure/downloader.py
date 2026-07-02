from io import BytesIO
from pathlib import Path

from requests import get, Response

from domain.interfaces import Downloader


class HttpDownloader(Downloader):
    def download(self, url: str, dest: Path) -> None:
        response: Response = get(url)
        status: int = response.status_code

        if status == 200:
            dest.parent.mkdir(parents=True, exist_ok=True)
            with open(dest, 'wb') as file:
                blob: BytesIO = BytesIO(response.content)
                file.write(blob.getvalue())
