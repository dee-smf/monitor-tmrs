import { GetCumulativeSumByYearUseCase } from '../../application/usecases/GetCumulativeSumByYearUseCase.js';
import { GetResultUseCase } from '../../application/usecases/GetResultUseCase.js';
import { GetRolling12PeriodSumUseCase } from '../../application/usecases/GetRolling12PeriodSumUseCase.js';
import { REPORT_DESCRIPTIONS } from '../../infrastructure/views/reportDescriptions.js';

export const dataVisualizationModeMap = {
    CUM_SUM_BY_YEAR: GetCumulativeSumByYearUseCase,
    RESULT: GetResultUseCase,
    ROLLING_12_PERIOD_SUM: GetRolling12PeriodSumUseCase
};

export class DataVisualizationModeController {
    constructor(repository, tableRenderer, chartRenderer, rveSentRepository = null, pdfExporter = null, lastDataCheckRepository = null, map = dataVisualizationModeMap) {
        this._repository = repository;
        this._tableRenderer = tableRenderer;
        this._chartRenderer = chartRenderer;
        this._rveSentRepository = rveSentRepository;
        this._pdfExporter = pdfExporter;
        this._lastDataCheckRepository = lastDataCheckRepository;
        this._map = map;
        this._exportButtonContainer = document.querySelector('#export-button');
    }

    async handle(request) {
        const fullDataset = await this._repository.load();
        let maxPeriod;
        if (this._rveSentRepository) {
            maxPeriod = await this._rveSentRepository.lastReportedPeriod();
        }
        if (maxPeriod === null || maxPeriod === undefined) {
            maxPeriod = Math.max(...fullDataset.rows.map(row => row.period));
        }
        const usecase = new this._map[request.mode](this._repository);
        const result = await usecase.execute(request);
        this._tableRenderer.render(result, request.detailExpenses, maxPeriod);
        this._chartRenderer.render(result, request.detailExpenses);

        if (this._pdfExporter) {
            const lastCheckMs = this._lastDataCheckRepository
                ? await this._lastDataCheckRepository.getLastRunDate()
                : null;
            this._renderExportButton(request, lastCheckMs);
        }
    }

    _renderExportButton(request, lastCheckMs) {
        if (!this._exportButtonContainer) return;
        this._exportButtonContainer.innerHTML = '';

        const config = REPORT_DESCRIPTIONS[request.mode];
        if (!config) return;

        this._pdfExporter.renderButton(() => {
            const canvas = document.querySelector('#chart-container canvas');
            const chartDataUrl = canvas ? canvas.toDataURL('image/png') : null;
            const tableHtml = document.querySelector('#table-container').innerHTML;

            this._pdfExporter.render({
                title: config.title(request.year),
                description: config.desc(request.detailExpenses),
                chartDataUrl,
                tableHtml,
                lastCheckMs,
            });
        });
    }
}