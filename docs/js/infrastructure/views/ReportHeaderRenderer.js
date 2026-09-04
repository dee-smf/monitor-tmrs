import { REPORT_DESCRIPTIONS } from './reportDescriptions.js';

const STYLES = {
    title: 'font-headline-md text-headline-md',
    description: 'font-body-md text-body-md text-on-surface-variant',
    smallText: 'text-xs text-on-surface-variant mt-2',
    bold: 'font-bold',
};

export class ReportHeaderRenderer {
    constructor(containerSelector, lastDataCheckRepository) {
        this._container = document.querySelector(containerSelector);
        this._lastDataCheckRepository = lastDataCheckRepository;
    }

    async render(request) {
        const config = REPORT_DESCRIPTIONS[request.mode];
        if (!config) return;

        const title = config.title(request.year);
        const desc = config.desc(request.detailExpenses);

        const lastRunMs = await this._lastDataCheckRepository.getLastRunDate();
        let lastCheckLine = '';
        if (lastRunMs !== null) {
            const dateStr = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(lastRunMs);
            const timeStr = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(lastRunMs);
            lastCheckLine = `<p class="${STYLES.smallText}">Última checagem de dados: <span class="${STYLES.bold}">${dateStr} às ${timeStr}</span></p>`;
        }

        this._container.innerHTML = `
            <h2 class="${STYLES.title}">${title}</h2>
            <p class="${STYLES.description}">${desc}</p>
            ${lastCheckLine}
        `;
    }
}
