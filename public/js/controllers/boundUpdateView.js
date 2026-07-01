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
