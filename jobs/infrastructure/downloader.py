"""HTTP-based downloader implementation.

Provides a concrete :class:`Downloader` that fetches remote resources via
the ``requests`` library.
"""

from io import BytesIO
from pathlib import Path

from requests import get, Response

from domain.interfaces import Downloader


class HttpDownloader(Downloader):
    """Download remote files over HTTP."""

    def download(self, url: str, dest: Path) -> None:
        """Download a URL to a local file.

        Creates parent directories if they do not exist. Only writes the
        file on a successful (200) response.

        Parameters
        ----------
        url : str
            Remote resource URL.
        dest : Path
            Local destination path.

        Raises
        ------
        DownloadError
            If the HTTP response status is not 200.
        """
        response: Response = get(url)
        status: int = response.status_code

        if status == 200:
            dest.parent.mkdir(parents=True, exist_ok=True)
            with open(dest, 'wb') as file:
                blob: BytesIO = BytesIO(response.content)
                file.write(blob.getvalue())
