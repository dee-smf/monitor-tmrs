"""Data source for TCE-RS report submission status.

Scrapes the TCE-RS portal to determine which accounting periods have
been submitted.  The resulting time-series is used by the frontend to
derive the ABERTO / FECHADO status of each period.
"""

import re
from io import StringIO
from pathlib import Path

from pandas import DataFrame, NaT, Timestamp, concat, isna, read_html, to_datetime

from infrastructure.downloader import HttpDownloader
from sources.source_base import BalanceStatusDataSource


_downloader = HttpDownloader()

_TABLE_PATTERN: re.Pattern[str] = re.compile(
    r'<table[^>]*>.*?</table>', re.DOTALL
)
_PERIOD_PATTERN: re.Pattern[str] = re.compile(
    r'(\d+)[ºo]\s*m[eê]s/(\d{4})'
)


class TceReportStatusDataSource(BalanceStatusDataSource):
    """Scrape TCE-RS portal for the last submitted accounting report.

    Produces a time-series with ``period`` (millisecond timestamp) and
    ``date`` (ISO-8601 datetime) columns, one row per submitted report.

    Attributes
    ----------
    URL_TEMPLATE : str
        TCE-RS PCDI URL with ``%s`` placeholder for the year.
    RAW_PATH_TEMPLATE : str
        Local file path for saved HTML with ``%s`` placeholder for year.
    """

    URL_TEMPLATE: str = (
        'https://portal.tce.rs.gov.br/pcdi2/relatorios-recibos-envio.action'
        '?&cdOrgao=58500&ano=%s'
    )
    RAW_PATH_TEMPLATE: str = 'data/raw/tce/status_%s.html'

    @property
    def source_id(self) -> str:
        return 'tce_report_status'

    def download(self, years: list[int]) -> None:
        for year in years:
            url: str = self.URL_TEMPLATE % year
            dest: Path = Path(self.RAW_PATH_TEMPLATE % year)
            _downloader.download(url, dest)

    def load(self, years: list[int]) -> DataFrame:
        frames: list[DataFrame] = []
        for year in years:
            path: Path = Path(self.RAW_PATH_TEMPLATE % year)
            if not path.exists():
                continue
            html: str = path.read_text(encoding='utf-8')
            table_html: str | None = self._extract_first_table(html)
            if table_html is None:
                continue
            df_list: list[DataFrame] = read_html(StringIO(table_html))
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

        period_col: str = raw.columns[0]
        date_col: str = raw.columns[2]

        periods: list[int] = []
        dates: list[str] = []
        for _, row in raw.iterrows():
            period_text: str = str(row[period_col])
            date_text: str = str(row[date_col])

            match: re.Match[str] | None = _PERIOD_PATTERN.search(period_text)
            if match is None:
                continue
            month: str = match.group(1).zfill(2)
            year: str = match.group(2)
            ts: Timestamp = Timestamp(f'{year}-{month}-01')
            periods.append(int(ts.timestamp() * 1000))

            parsed_date = to_datetime(date_text, format='%d/%m/%Y %H:%M', errors='coerce')
            if not isna(parsed_date):
                dates.append(parsed_date.isoformat())
            else:
                dates.append(date_text)

        result: DataFrame = DataFrame({'period': periods, 'date': dates})
        return result.sort_values('period', ascending=False).reset_index(drop=True)

    @staticmethod
    def _extract_first_table(html: str) -> str | None:
        match: re.Match[str] | None = _TABLE_PATTERN.search(html)
        return match.group(0) if match else None
