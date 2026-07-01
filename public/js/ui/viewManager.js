/**
 * @module ui/viewManager
 * Orchestrates a complete view update: resolves the active strategy,
 * computes the selection (data + metadata), updates DOM titles,
 * hides/shows the year filter, and delegates rendering to ChartRenderer
 * and TableRenderer.
 */
import { ViewStrategyFactory } from '../model/ViewStrategy.js';
import { DOM_IDS } from '../utils/config.js';

export class ViewCoordinator {
    /**
     * @param {import('../types.js').ViewCoordinatorOptions} [options]
     */
    constructor({ strategyFactory, formatCurrency, chartRenderer, tableRenderer } = {}) {
        this._strategyFactory = strategyFactory || ViewStrategyFactory;
        this._formatCurrency = formatCurrency;
        this._chartRenderer = chartRenderer;
        this._tableRenderer = tableRenderer;
    }

    /**
     * Perform a full view update: resolve strategy, select data,
     * update DOM, and delegate to both renderers.
     * @param {import('../types.js').ViewCoordinatorUpdateOptions} options
     * @returns {Chart} New Chart.js instance.
     */
    update({ processedData, chartInstance, formatCurrency }) {
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

        const newChartInstance = this._chartRenderer.render(selection.displayData, selection.chartType, { chartInstance, formatCurrency });
        this._tableRenderer.render(selection.displayData, { formatCurrency });
        return newChartInstance;
    }
}
