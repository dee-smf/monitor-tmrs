"""Data source for PMSJN report submission status.

Scrapes the São José do Norte transparency portal to determine which
accounting periods have been submitted.  The resulting time-series is
used by the frontend to derive the ABERTO / FECHADO status of each
period.
"""

import logging
import re
from io import StringIO
from pathlib import Path

from pandas import DataFrame, NaT, Timestamp, concat, isna, read_html, to_datetime

from domain.exceptions import DownloadError
from infrastructure.downloader import HttpDownloader
from sources.source_base import BalanceStatusDataSource

_LOGGER = logging.getLogger(__name__)

_downloader = HttpDownloader()

_TABLE_PATTERN: re.Pattern[str] = re.compile(
    r'<table[^>]*id="export-pdf-table"[^>]*>.*?</table>', re.DOTALL
)
_HTML_COMMENT_PATTERN: re.Pattern[str] = re.compile(
    r'<!--.*?-->', re.DOTALL
)
_BIMESTER_PATTERN: re.Pattern[str] = re.compile(
    r'(\d+)[º°]\s*[Bb]imestre'
)
_BIMESTER_TO_MONTH: dict[int, int] = {
    1: 2,   # Feb
    2: 4,   # Apr
    3: 6,   # Jun
    4: 8,   # Aug
    5: 10,  # Oct
    6: 12,  # Dec
}


class PmsjnReportStatusDataSource(BalanceStatusDataSource):
    """Scrape PMSJN transparency portal for the last submitted accounting report.

    Produces a time-series with ``period`` (millisecond timestamp) and
    ``date`` (ISO-8601 datetime) columns, one row per submitted report.

    Attributes
    ----------
    URL_TEMPLATE : str
        PMSJN transparency portal URL with ``%s`` placeholder for the year.
    RAW_PATH_TEMPLATE : str
        Local file path for saved HTML with ``%s`` placeholder for year.
    """

    URL_TEMPLATE: str = (
        'https://www.saojosedonorte.rs.gov.br'
        '/portal-da-transparencia/demonstrativos-financeiros'
        '?ano=%s&texto=RREO&page=1'
    )
    RAW_PATH_TEMPLATE: str = 'data/raw/pmsjn/status_%s.html'

    @property
    def source_id(self) -> str:
        return 'pmsjn_report_status'

    def download(self, years: list[int]) -> None:
        for year in years:
            url: str = self.URL_TEMPLATE % year
            dest: Path = Path(self.RAW_PATH_TEMPLATE % year)
            try:
                _downloader.download(url, dest)
            except DownloadError as exc:
                _LOGGER.warning(
                    'PMSJN download failed for %s: %s. Skipping.',
                    year,
                    exc,
                )

    def load(self, years: list[int]) -> DataFrame:
        frames: list[DataFrame] = []
        for year in years:
            path: Path = Path(self.RAW_PATH_TEMPLATE % year)
            if not path.exists():
                continue
            html: str = path.read_text(encoding='utf-8')
            table_html: str | None = self._extract_table(html)
            if table_html is None:
                continue
            cleaned: str = _HTML_COMMENT_PATTERN.sub('', table_html)
            df_list: list[DataFrame] = read_html(StringIO(cleaned))
            if df_list:
                frames.append(df_list[0])
        if not frames:
            return DataFrame(columns=['period', 'date'])
        combined: DataFrame = DataFrame()
        for frame in frames:
            combined = concat([combined, frame], ignore_index=True) if not combined.empty else frame
        return combined

    def transform(self, raw: DataFrame) -> DataFrame:
        if raw.empty:
            return DataFrame(columns=['period', 'date'])

        title_col: str = raw.columns[0]
        date_col: str = raw.columns[1]

        seen: set[int] = set()
        periods: list[int] = []
        dates: list[str] = []
        for _, row in raw.iterrows():
            title_text: str = str(row[title_col])
            date_text: str = str(row[date_col])

            match: re.Match[str] | None = _BIMESTER_PATTERN.search(title_text)
            if match is None:
                continue
            bimester: int = int(match.group(1))
            month: int = _BIMESTER_TO_MONTH[bimester]

            year: int = self._resolve_year(title_text, date_text)

            ts: Timestamp = Timestamp(f'{year}-{month:02d}-01')
            period_ms: int = int(ts.timestamp() * 1000)
            if period_ms in seen:
                continue
            seen.add(period_ms)
            periods.append(period_ms)

            parsed_date = to_datetime(date_text, format='%d/%m/%Y', errors='coerce')
            if not isna(parsed_date):
                dates.append(parsed_date.isoformat())
            else:
                dates.append(date_text)

        result: DataFrame = DataFrame({'period': periods, 'date': dates})
        return result.sort_values('period', ascending=False).reset_index(drop=True)

    @staticmethod
    def _resolve_year(title: str, date: str) -> int:
        year_match: re.Match[str] | None = re.search(r'\b(20\d{2})\b', title)
        if year_match is not None:
            return int(year_match.group(1))
        date_match: re.Match[str] | None = re.search(r'/(\d{4})', date)
        if date_match is not None:
            return int(date_match.group(1))
        return Timestamp.now().year

    @staticmethod
    def _extract_table(html: str) -> str | None:
        match: re.Match[str] | None = _TABLE_PATTERN.search(html)
        return match.group(0) if match else None
