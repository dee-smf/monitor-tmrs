import { formatCurrency, formatMonthYear } from './utils/formatters.js';
import { loadData } from './services/dataService.js';
import { processData } from './services/dataProcessor.js';
import { setupYearSelector } from './ui/yearSelector.js';
import { renderChart } from './ui/chartRenderer.js';
import { renderTable } from './ui/tableRenderer.js';
import { handleDataLoaded } from './controllers/appController.js';
import { updateView } from './ui/viewManager.js';
import { createUpdateViewHandler } from './controllers/updateViewHandler.js';

let state = {
    rawData: [],
    processedData: {
        simple: [],
        rolling12: [],
        ytd: []
    },
    availableYears: [],
    chartInstance: null
};

const DOM = {
    viewModeId: 'viewMode',
    yearSelectorContainerId: 'yearSelectorContainer',
    yearSelectorId: 'yearSelector',
    chartTitleId: 'chartTitle',
    tableTitleId: 'tableTitle'
};


document.addEventListener('DOMContentLoaded', () => {
    const updateViewHandler = createUpdateViewHandler({ state, updateView, formatCurrency, renderChart, renderTable, DOM });

    document.getElementById(DOM.viewModeId).addEventListener('change', updateViewHandler);
    document.getElementById(DOM.yearSelectorId).addEventListener('change', updateViewHandler);
    
    // Inicia o app
    const TIME_SERIES = 'data/timeSeries.json';
    loadData(TIME_SERIES, (data) => handleDataLoaded(data, {
        processData,
        formatMonthYear,
        setupYearSelector,
        updateView: updateViewHandler,
        state
    }));
});
