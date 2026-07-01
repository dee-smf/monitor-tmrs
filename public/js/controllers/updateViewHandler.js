import { boundUpdateView } from './boundUpdateView.js';

/**
 * Factory that returns a closure bound to the current dependencies.
 * Each time the returned handler is called (e.g. on view-mode or year change)
 * it re-renders the chart and table.
 * @param {Object} deps
 * @param {{ chartInstance: Object|null, processedData: Object, availableYears: number[] }} deps.state
 * @param {(opts: Object) => Object|null} deps.updateView
 * @param {(value: number) => string} deps.formatCurrency
 * @param {(data: Object[], type: string, opts: Object) => Object|null} deps.renderChart
 * @param {(data: Object[], opts: Object) => void} deps.renderTable
 * @param {{ viewModeId: string, yearSelectorContainerId: string, yearSelectorId: string, chartTitleId: string, tableTitleId: string }} deps.DOM
 * @returns {() => void}
 */
export function createUpdateViewHandler({ state, updateView, formatCurrency, renderChart, renderTable, DOM }) {
    return function updateViewHandler() {
        boundUpdateView({ state, updateView, formatCurrency, renderChart, renderTable, DOM });
    };
}
