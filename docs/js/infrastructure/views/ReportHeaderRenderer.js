import { REPORT_DESCRIPTIONS } from './reportDescriptions.js';

export class ReportHeaderRenderer {
    constructor(containerSelector) {
        this._container = document.querySelector(containerSelector);
    }

    render(request) {
        const config = REPORT_DESCRIPTIONS[request.mode];
        if (!config) return;

        const title = config.title(request.year);
        const desc = config.desc(request.detailExpenses);

        this._container.innerHTML = `
            <h2 class="font-headline-md text-headline-md">${title}</h2>
            <p class="font-body-md text-body-md text-on-surface-variant">${desc}</p>
        `;
    }
}
