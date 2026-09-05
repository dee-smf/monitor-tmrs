"""HTTP-based downloader implementation.

Provides a concrete :class:`Downloader` that fetches remote resources via
the ``requests`` library.
"""

import logging
from io import BytesIO
from pathlib import Path

from requests import Session, Response
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from domain.exceptions import DownloadError
from domain.interfaces import Downloader

_LOGGER = logging.getLogger(__name__)

_USER_AGENT: str = (
    'Mozilla/5.0 (X11; Linux x86_64) '
    'AppleWebKit/537.36 '
    '(KHTML, like Gecko) '
    'Chrome/151.0 Safari/537.36'
)

_DEFAULT_TIMEOUT: int = 30
_MAX_RETRIES: int = 3
_BACKOFF_FACTOR: float = 1.5
_RETRY_STATUS_CODES: tuple[int, ...] = (429, 500, 502, 503, 504)


class HttpDownloader(Downloader):
    """Download remote files over HTTP."""

    def __init__(
        self,
        timeout: int = _DEFAULT_TIMEOUT,
        max_retries: int = _MAX_RETRIES,
    ) -> None:
        self._timeout: int = timeout
        self._session: Session = self._build_session(max_retries)

    @staticmethod
    def _build_session(max_retries: int) -> Session:
        session: Session = Session()
        session.headers.update({'User-Agent': _USER_AGENT})

        retry: Retry = Retry(
            total=max_retries,
            backoff_factor=_BACKOFF_FACTOR,
            status_forcelist=_RETRY_STATUS_CODES,
            allowed_methods=['GET'],
        )
        adapter: HTTPAdapter = HTTPAdapter(max_retries=retry)
        session.mount('https://', adapter)
        session.mount('http://', adapter)
        return session

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
            If the HTTP response status is not 200 or the request fails.
        """
        try:
            response: Response = self._session.get(url, timeout=self._timeout)
        except Exception as exc:
            raise DownloadError(f'Failed to download {url}: {exc}') from exc

        status: int = response.status_code
        if status != 200:
            raise DownloadError(
                f'HTTP {status} while downloading {url}'
            )

        dest.parent.mkdir(parents=True, exist_ok=True)
        blob: BytesIO = BytesIO(response.content)
        with open(dest, 'wb') as file:
            file.write(blob.getvalue())
