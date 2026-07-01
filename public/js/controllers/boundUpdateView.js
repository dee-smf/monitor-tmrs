/**
 * Reads current state and delegates to updateView, persisting the returned
 * chart instance back onto state so it can be destroyed on re-render.
 * @param {Object} opts
 * @param {{ chartInstance: Object|null, processedData: Object, availableYears: number[] }} opts.state
 * @param {(opts: Object) => Object|null} opts.updateView
 * @param {(value: number) => string} opts.formatCurrency
 * @param {(data: Object[], type: string, opts: Object) => Object|null} opts.renderChart
 * @param {(data: Object[], opts: Object) => void} opts.renderTable
 * @param {{ viewModeId: string, yearSelectorContainerId: string, yearSelectorId: string, chartTitleId: string, tableTitleId: string }} opts.DOM
 * @returns {void}
 */
export function boundUpdateView({ state, updateView, formatCurrency, renderChart, renderTable, DOM }) {
    state.chartInstance = updateView({
        processedData: state.processedData,
        chartInstance: state.chartInstance,
        formatCurrency,
        renderChart,
        renderTable,
        DOM
    });
}
