import { RendererInterface } from '../../adapters/RendererInterface.js';

const BUTTON_STYLE = 'flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-surface-container-lowest border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer';

export class PdfReportExporter extends RendererInterface {
    constructor(containerSelector, tagRepository) {
        super();
        this._container = document.querySelector(containerSelector);
        this._tagRepository = tagRepository;
        this._version = null;
        this._logoDataUrl = null;
    }

    async loadVersion() {
        const [version, logoDataUrl] = await Promise.all([
            this._tagRepository.getLatest(),
            this._fetchAsDataUrl('./img/logo-municipio.png'),
        ]);
        this._version = version;
        this._logoDataUrl = logoDataUrl;
    }

    async _fetchAsDataUrl(path) {
        try {
            const response = await fetch(path);
            const blob = await response.blob();
            return await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        } catch {
            return null;
        }
    }

    _buildHtml({ title, description, chartDataUrl, tableHtml, lastCheckMs }) {
        const now = new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
        }).format(new Date());

        const versionLine = this._version
            ? `${this._version} · TMRS Portal de Transparência · ${now}`
            : `TMRS Portal de Transparência · ${now}`;

        let lastCheckLine = '';
        if (lastCheckMs !== null) {
            const dateStr = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(lastCheckMs);
            const timeStr = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(lastCheckMs);
            lastCheckLine = `<p style="font-size: 12px; color: #43474e; margin-top: 8px;">Última checagem de dados: <strong>${dateStr} às ${timeStr}</strong></p>`;
        }

        return `<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  @page { size: A4 portrait; margin: 16mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #1a1c1e; font-size: 13px; line-height: 1.5; }

  .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #008de8; padding-bottom: 10px; margin-bottom: 16px; }
  .header-brand { font-size: 16px; font-weight: 700; color: #008de8; text-align: right; }
  .header-brand span { color: #43474e; font-weight: 400; }
  .title { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
  .desc { font-size: 13px; color: #43474e; margin-bottom: 16px; }
  .chart-img { width: 100%; max-height: 280px; object-fit: contain; margin-bottom: 16px; }

  #table-container > div { overflow-x: auto; border: 1px solid #c3c7cf; border-radius: 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; text-align: left; }
  thead { background: #f2f4f6; }
  th { padding: 10px 10px; border-bottom: 1px solid #c3c7cf; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
  th.text-right, th.num { text-align: right; }
  th.whitespace-nowrap, th.nowrap { white-space: nowrap; }
  td { padding: 10px 10px; border-bottom: 1px solid #c3c7cf; font-size: 12px; }
  td.text-right, td.num { text-align: right; }
  td.whitespace-nowrap, td.nowrap { white-space: nowrap; }
  td.font-medium { font-weight: 500; }
  tr { border-bottom: 1px solid #c3c7cf; }
  tr:last-child { border-bottom: none; }
  .text-secondary { color: #a00000; }
  .text-primary { color: #008de8; }
  .bg-green-100 { background-color: #d1fae5; }
  .text-green-800 { color: #065f46; }
  .bg-amber-100 { background-color: #fef3c7; }
  .text-amber-800 { color: #92400e; }
  .px-3 { padding-left: 12px; padding-right: 12px; }
  .py-1 { padding-top: 4px; padding-bottom: 4px; }
  .rounded-full { border-radius: 9999px; }
  .font-bold { font-weight: 700; }
  .uppercase { text-transform: uppercase; }
  .border-b { border-bottom: 1px solid #c3c7cf; }
  .border-outline-variant { border-color: #c3c7cf; }

  .footer { margin-top: 24px; border-top: 1px solid #c3c7cf; padding-top: 8px; font-size: 11px; color: #43474e; text-align: center; }
</style>
</head>
<body>
  <div class="header">
    <img src="${this._logoDataUrl || './img/logo-municipio.png'}" alt="Brazão Municipal" style="height: 48px; object-fit: contain;">
    <div class="header-brand">TMRS <span>| Portal de Transparência</span></div>
  </div>
  <h1 class="title">${title}</h1>
  <p class="desc">${description}</p>
  ${lastCheckLine}
  ${chartDataUrl ? `<img class="chart-img" src="${chartDataUrl}" alt="Gráfico">` : ''}
  ${tableHtml}
  <div class="footer">${versionLine}</div>
</body>
</html>`;
    }

    render({ title, description, chartDataUrl, tableHtml }) {
        const html = this._buildHtml({ title, description, chartDataUrl, tableHtml });
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
        };
    }

    renderButton(onClick) {
        const button = document.createElement('button');
        button.className = BUTTON_STYLE;
        button.innerHTML = `<span class="material-symbols-outlined" style="font-size: 18px;">picture_as_pdf</span> Exportar PDF`;
        button.addEventListener('click', onClick);
        this._container.appendChild(button);
    }
}
