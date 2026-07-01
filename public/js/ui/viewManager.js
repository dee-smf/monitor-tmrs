export const updateView = ({ processedData, chartInstance, formatCurrency, renderChart, renderTable, DOM }) => {
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
