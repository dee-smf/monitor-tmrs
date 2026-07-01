import { ViewStrategyFactory } from '../model/ViewStrategy.js';
import { DOM_IDS } from '../utils/config.js';

export class ViewCoordinator {
    constructor({ strategyFactory, formatCurrency, chartRenderer, tableRenderer } = {}) {
        this._strategyFactory = strategyFactory || ViewStrategyFactory;
        this._formatCurrency = formatCurrency;
        this._chartRenderer = chartRenderer;
        this._tableRenderer = tableRenderer;
    }

    update({ processedData, chartInstance, formatCurrency, renderChart, renderTable, DOM }) {
        const mode = document.getElementById(DOM_IDS.VIEW_MODE).value;
        const yearSelectorContainer = document.getElementById(DOM_IDS.YEAR_SELECTOR_CONTAINER);
        const selectedYear = parseInt(document.getElementById(DOM_IDS.YEAR_SELECTOR).value, 10);

        const strategy = this._strategyFactory.getStrategy(mode);
        const selection = strategy.selectData(processedData, selectedYear);

        if (selection.showYearSelector) {
            yearSelectorContainer.classList.remove('hidden');
        } else {
            yearSelectorContainer.classList.add('hidden');
        }

        document.getElementById(DOM_IDS.CHART_TITLE).innerText = selection.chartTitle;
        document.getElementById(DOM_IDS.TABLE_TITLE).innerText = selection.tableTitle;

        const effectiveRenderChart = renderChart || (this._chartRenderer && this._chartRenderer.render.bind(this._chartRenderer));
        const effectiveRenderTable = renderTable || (this._tableRenderer && this._tableRenderer.render.bind(this._tableRenderer));

        const newChartInstance = effectiveRenderChart(selection.displayData, selection.chartType, { chartInstance, formatCurrency });
        effectiveRenderTable(selection.displayData, { formatCurrency });
        return newChartInstance;
    }
}

const _viewCoordinator = new ViewCoordinator();

export function updateView(opts) {
    return _viewCoordinator.update(opts);
}
