"""Revenue data-source strategies for the Cidade360 source.

Provides a protocol and two concrete strategies that handle revenue data
for different year ranges:

- ``ApiStrategy``: years >= 2024 (JSON via Cidade360 open-data API)
- ``ScrapingStrategy``: years <= 2023 (XML inside ZIP via PRONIMTB scraping)
"""

from __future__ import annotations

import time
import zipfile
from html.parser import HTMLParser
from io import BytesIO
from pathlib import Path
from typing import Protocol, runtime_checkable

import pandas as pd
import requests

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

BASE_URL: str = (
    'https://webapp1-saojosedonorte.cidade360.cloud/pronimtb'
)

_USER_AGENT: str = (
    'Mozilla/5.0 (X11; Linux x86_64) '
    'AppleWebKit/537.36 '
    '(KHTML, like Gecko) '
    'Chrome/151.0 Safari/537.36'
)

REVENUE_CODE_API: str = '1.1.2.2.53'

# Revenue code prefixes for the XML (PRONIMTB) classification.
# 2023+ uses 1.1.2.2.01.0.{1|2|3|4}.*, 2022 uses 1.1.2.8.02.9.{1|2|3|4}.*.
# These groups are mutually exclusive, so a single startswith check is safe.
_REVENUE_CODE_PREFIXES: tuple[str, ...] = (
    '1.1.2.2.01.0.1.02',
    '1.1.2.2.01.0.2.02',
    '1.1.2.2.01.0.3.02',
    '1.1.2.2.01.0.4.02',
    '1.1.2.8.02.9.1.02',
    '1.1.2.8.02.9.2.02',
    '1.1.2.8.02.9.3.02',
    '1.1.2.8.02.9.4.02',
)
# 1.1.2.8.02.9.1.02

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _parse_brl_currency(value: str) -> float:
    """Parse a Brazilian Real currency string into a float.

    Examples
    --------
    >>> _parse_brl_currency('R$ 185.917,32')
    185917.32
    """
    cleaned: str = value.replace('R$ ', '').replace('.', '').replace(',', '.').strip()
    return float(cleaned) if cleaned else 0.0


# ---------------------------------------------------------------------------
# HTML parser (extracted from scraping-poc.py)
# ---------------------------------------------------------------------------


class _YearOptionParser(HTMLParser):
    """Parse ``<option>`` tags to find the value for a given year."""

    def __init__(self, year: int) -> None:
        super().__init__()
        self.year: str = str(year)
        self.found_value: str | None = None
        self._inside_target_option: bool = False

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        if tag != 'option':
            return

        attributes: dict[str, str | None] = dict(attrs)
        value: str | None = attributes.get('value')

        if value is None:
            return

        option_year: str = value.split('|', 1)[0]

        if option_year == self.year:
            self.found_value = value
            self._inside_target_option = True

    def handle_endtag(self, tag: str) -> None:
        if tag == 'option':
            self._inside_target_option = False


# ---------------------------------------------------------------------------
# XML parsing helpers (for ScrapingStrategy)
# ---------------------------------------------------------------------------


def _parse_xml_records(xml_bytes: bytes) -> list[dict[str, str]]:
    """Parse XML bytes into a list of flat record dicts.

    Expects the PRONIMTB ``<Arrecadacoes>`` structure where each
    ``<Arrecadacao>`` has a ``<NaturezaCategoria>/<Identificacao>``
    child and a ``<ValorArrecadadoLiquido>`` value.
    """
    import xml.etree.ElementTree as ET

    root = ET.fromstring(xml_bytes)
    records: list[dict[str, str]] = []

    for arrecadacao in root.findall('.//Arrecadacao'):
        exercicio_el = arrecadacao.find('Exercicio')
        mes_el = arrecadacao.find('Mes')
        data_el = arrecadacao.find('DataArrecadacao')
        valor_el = arrecadacao.find('ValorArrecadadoLiquido')
        nc_el = arrecadacao.find('NaturezaCategoria/Identificacao')

        if (
            exercicio_el is None
            or mes_el is None
            or data_el is None
            or valor_el is None
            or nc_el is None
        ):
            continue

        records.append({
            'Exercicio': exercicio_el.text or '',
            'Mes': mes_el.text or '',
            'DataArrecadacao': data_el.text or '',
            'ValorArrecadadoLiquido': valor_el.text or '',
            'NaturezaCategoria_Identificacao': nc_el.text or '',
        })

    return records


def _filter_and_resample_xml(records: list[dict[str, str]]) -> pd.DataFrame:
    """Filter XML records by revenue code and resample to month-end totals."""
    if not records:
        return pd.DataFrame(columns=['period', 'revenues'])

    df = pd.DataFrame(records)

    # Keep only rows matching the revenue code prefixes
    mask = df['NaturezaCategoria_Identificacao'].str.startswith(_REVENUE_CODE_PREFIXES)
    df = df.loc[mask, ['DataArrecadacao', 'ValorArrecadadoLiquido']].copy()

    if df.empty:
        return pd.DataFrame(columns=['period', 'revenues'])

    df['DataArrecadacao'] = pd.to_datetime(
        df['DataArrecadacao'], format='%d/%m/%Y'
    )
    df['ValorArrecadadoLiquido'] = df['ValorArrecadadoLiquido'].apply(
        _parse_brl_currency
    )

    resampled = (
        df.set_index('DataArrecadacao')
        .resample('ME')['ValorArrecadadoLiquido']
        .sum()
    )
    result = resampled.reset_index().rename(columns={
        'DataArrecadacao': 'period',
        'ValorArrecadadoLiquido': 'revenues',
    })

    # Exception: for 2022, only include data from November onward
    mask = ~(
        (result['period'].dt.year == 2022)
        & (result['period'].dt.month < 11)
    )
    filtered: pd.DataFrame = result.loc[mask]
    return filtered.reset_index(drop=True)


# ---------------------------------------------------------------------------
# Protocol
# ---------------------------------------------------------------------------


@runtime_checkable
class RevenueStrategy(Protocol):
    """Interface for a revenue-data strategy.

    Each strategy handles one data acquisition method (API or scraping)
    and is self-contained: it decides whether it can serve a given year,
    downloads the raw data, loads it, and transforms it into a standard
    ``DataFrame`` with ``period`` and ``revenues`` columns.
    """

    def can_parse(self, year: int) -> bool:
        """Return True if this strategy handles the given year."""
        ...

    def available_periods(self) -> list[int]:
        """Return fiscal years available on disk for this strategy."""
        ...

    def download(self, year: int) -> None:
        """Download raw data for a single year."""
        ...

    def load_raw(self, year: int) -> pd.DataFrame:
        """Load and transform previously-downloaded data for a single year."""
        ...


# ---------------------------------------------------------------------------
# API strategy (years >= 2024)
# ---------------------------------------------------------------------------


class ApiStrategy:
    """Strategy for revenue data via the Cidade360 open-data JSON API.

    Handles years >= 2024 where the API provides sufficient detail.
    """

    _PATH_TEMPLATE: str = 'data/raw/cidade360/revenues_%s.json'
    _URL_TEMPLATE: str = (
        'https://webapp1-saojosedonorte.cidade360.cloud/dadosabertos/receitas'
        '/baixarDadosReceitas/%s/PREF MUNIC. DE SÃO JOSÉ DO NORTE'
    )

    def can_parse(self, year: int) -> bool:
        return year >= 2024

    def available_periods(self) -> list[int]:
        pattern: str = self._PATH_TEMPLATE % '*'
        return sorted(
            int(p.stem.rsplit('_', 1)[-1])
            for p in Path('.').glob(pattern)
        )

    def download(self, year: int) -> None:
        url: str = self._URL_TEMPLATE % year
        dest: Path = Path(self._PATH_TEMPLATE % year)

        response: requests.Response = requests.get(url, timeout=60)
        if response.status_code == 200:
            dest.parent.mkdir(parents=True, exist_ok=True)
            with open(dest, 'wb') as file:
                file.write(response.content)

    def load_raw(self, year: int) -> pd.DataFrame:
        raw = pd.read_json(self._PATH_TEMPLATE % year)
        return self._transform_api(raw)

    @staticmethod
    def _transform_api(raw: pd.DataFrame) -> pd.DataFrame:
        if raw.empty:
            return pd.DataFrame(columns=['period', 'revenues'])

        filtered: pd.DataFrame = raw.loc[
            raw['Alinea'].str.startswith(REVENUE_CODE_API),
            ['DataArrecadacao', 'ValorArrecadadoLiquido'],
        ]
        filtered['DataArrecadacao'] = pd.to_datetime(filtered['DataArrecadacao'])
        resampled: pd.DataFrame = (
            filtered.set_index('DataArrecadacao').resample('ME').sum()
        )
        return resampled.reset_index().rename(columns={
            'DataArrecadacao': 'period',
            'ValorArrecadadoLiquido': 'revenues',
        })


# ---------------------------------------------------------------------------
# Scraping strategy (years <= 2023)
# ---------------------------------------------------------------------------


class ScrapingStrategy:
    """Strategy for revenue data via PRONIMTB web scraping.

    Handles years <= 2023 where the Cidade360 API lacks sufficient
    revenue detail. Downloads XML inside a ZIP file from the PRONIMTB
    web interface using a multi-step HTTP session.
    """

    _PATH_TEMPLATE: str = 'data/raw/cidade360/revenues_%s.zip'

    def can_parse(self, year: int) -> bool:
        return year <= 2023

    def available_periods(self) -> list[int]:
        pattern: str = self._PATH_TEMPLATE % '*'
        return sorted(
            int(p.stem.rsplit('_', 1)[-1])
            for p in Path('.').glob(pattern)
        )

    def download(self, year: int) -> None:
        dest: Path = Path(self._PATH_TEMPLATE % year)

        if dest.exists():
            return

        date_initial: str = f'0101{year}'
        date_final: str = f'3112{year}'
        zip_data: bytes = self._fetch_zip(year, date_initial, date_final)

        dest.parent.mkdir(parents=True, exist_ok=True)
        with open(dest, 'wb') as file:
            file.write(zip_data)

    def load_raw(self, year: int) -> pd.DataFrame:
        path: str = self._PATH_TEMPLATE % year

        with zipfile.ZipFile(path) as archive:
            for name in archive.namelist():
                if name.lower().endswith('.xml'):
                    with archive.open(name) as xml_file:
                        xml_bytes = xml_file.read()
                    records = _parse_xml_records(xml_bytes)
                    return _filter_and_resample_xml(records)

        return pd.DataFrame(columns=['period', 'revenues'])

    # ------------------------------------------------------------------
    # Private scraping helpers
    # ------------------------------------------------------------------

    def _fetch_zip(
        self, year: int, date_initial: str, date_final: str
    ) -> bytes:
        """Execute the 5-step scraping flow to download the ZIP file."""
        session = requests.Session()
        session.headers.update({'User-Agent': _USER_AGENT})

        # Step 1: Access the form page
        form_params = {'acao': 10, 'item': 3}
        form_url: str = f'{BASE_URL}/index.asp'

        response = session.get(form_url, params=form_params, timeout=30)
        html: str = response.text

        # Step 2: Parse HTML to find the exercise option value
        parser = _YearOptionParser(year)
        parser.feed(html)

        if parser.found_value is None:
            raise RuntimeError(
                f'O exercicio {year} nao foi encontrado no formulario.'
            )

        option_value: str = parser.found_value

        try:
            selected_year, banco, *_ = option_value.split('|')
        except ValueError as exc:
            raise RuntimeError(
                f'Valor inesperado para o exercicio {year}: '
                f'{option_value!r}'
            ) from exc

        if selected_year != str(year) or not banco:
            raise RuntimeError(
                f'Valor invalido para o exercicio {year}: '
                f'{option_value!r}'
            )

        # Step 3: AJAX exercise selection
        ajax_params: dict[str, str | int] = {
            '_': int(time.time() * 1000),
            'acao': 'ConsultarUnidadeCP',
            'param1': option_value,
            'param2': 'undefined',
            'param3': 'undefined',
            'param4': 'undefined',
            'param5': 'undefined',
        }

        session.get(
            f'{BASE_URL}/acao.asp',
            params=ajax_params,
            headers={
                'Referer': form_url,
                'X-Requested-With': 'XMLHttpRequest',
            },
            timeout=30,
        )

        # Step 4: Trigger XML generation
        gen_params: dict[str, str | int] = {
            'item': 3,
            'banco': banco,
            'exercicio': year,
            'dataInicial': date_initial,
            'dataFinal': date_final,
            'unidadeGestora': -1,
            'nmFornecedor': '',
            'TipoDespesa': 'null',
            'TipoEsportacaoDados': 2,
        }

        session.get(
            f'{BASE_URL}/geraxml.asp',
            params=gen_params,
            headers={'Referer': form_url},
            timeout=300,
        )

        # Step 5: Poll for ZIP download
        return self._poll_zip(session, form_url)

    @staticmethod
    def _poll_zip(session: requests.Session, referer: str) -> bytes:
        """Poll for the generated ZIP file until it is ready."""
        download_url: str = f'{BASE_URL}/dll/Arrecadacao.zip'
        deadline: float = time.monotonic() + 300

        while time.monotonic() < deadline:
            time.sleep(1)

            cache_buster: int = int(time.time() * 1000)
            url: str = f'{download_url}?_{cache_buster}'

            try:
                response = session.get(
                    url,
                    headers={
                        'Referer': referer,
                        'Cache-Control': 'no-cache',
                    },
                    timeout=60,
                )
                content: bytes = response.content
            except requests.RequestException:
                continue

            if not content.startswith(b'PK'):
                continue

            try:
                with zipfile.ZipFile(BytesIO(content)) as archive:
                    if archive.testzip() is not None:
                        continue
            except zipfile.BadZipFile:
                continue

            return content

        raise TimeoutError(
            'O arquivo Arrecadacao.zip nao foi disponibilizado '
            'dentro de 5 minutos.'
        )
