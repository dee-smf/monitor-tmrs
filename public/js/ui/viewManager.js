/**
 * Reads the active view mode and selected year from the DOM, picks the
 * appropriate data slice, updates the chart and table titles, then
 * delegates to renderChart and renderTable.
 * @param {Object} opts
 * @param {{ simple: Object[], rolling12: Object[], ytd: Object[] }} opts.processedData
 * @param {Object|null} opts.chartInstance
 * @param {(value: number) => string} opts.formatCurrency
 * @param {(data: Object[], type: string, opts: Object) => Object|null} opts.renderChart
 * @param {(data: Object[], opts: Object) => void} opts.renderTable
 * @param {{ viewModeId: string, yearSelectorContainerId: string, yearSelectorId: string, chartTitleId: string, tableTitleId: string }} opts.DOM
 * @returns {Object|null} The new chart instance.
 */
export function updateView({ processedData, chartInstance, formatCurrency, renderChart, renderTable, DOM }) {
    const mode = document.getElementById(DOM.viewModeId).value;
    const yearSelectorContainer = document.getElementById(DOM.yearSelectorContainerId);
    const selectedYear = parseInt(document.getElementById(DOM.yearSelectorId).value, 10);
    
    let displayData = [];
    let chartType = 'bar';
    
    if (mode === 'simple') {
        yearSelectorContainer.classList.add('hidden');
        displayData = processedData.simple;
        chartType = 'bar';
        document.getElementById(DOM.chartTitleId).innerText = 'Arrecadação e Despesas Mensais';
        document.getElementById(DOM.tableTitleId).innerText = 'Extrato Mensal';
    } 
    else if (mode === 'rolling12') {
        yearSelectorContainer.classList.add('hidden');
        displayData = processedData.rolling12;
        chartType = 'line';
        document.getElementById(DOM.chartTitleId).innerText = 'Acumulado (Últimos 12 Meses)';
        document.getElementById(DOM.tableTitleId).innerText = 'Extrato Acumulado (12m)';
    } 
    else if (mode === 'ytd') {
        yearSelectorContainer.classList.remove('hidden');
        displayData = processedData.ytd.filter(d => d.year === selectedYear);
        chartType = 'line';
        document.getElementById(DOM.chartTitleId).innerText = `Acumulado no Exercício (${selectedYear})`;
        document.getElementById('tableTitle').innerText = `Extrato do Exercício (${selectedYear})`;
    }

    const newChartInstance = renderChart(displayData, chartType, { chartInstance, formatCurrency });
    renderTable(displayData, { formatCurrency });
    return newChartInstance;
};
