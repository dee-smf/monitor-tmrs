import { formatCurrency, formatMonthYear } from './utils/formatters.js';
import { loadData } from './services/dataService.js';
import { processData } from './services/dataProcessor.js';
import { setupYearSelector } from './ui/yearSelector.js';
import { renderChart } from './ui/chartRenderer.js';
import { renderTable } from './ui/tableRenderer.js';
import { handleDataLoaded } from './controllers/appController.js';
import { updateView } from './ui/viewManager.js';

        // --- 1. Dados e Configurações Iniciais ---
        
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

        // --- 4. Event Listeners ---
        document.addEventListener('DOMContentLoaded', () => {
            const boundUpdateView = () => {
                state.chartInstance = updateView({
                    processedData: state.processedData,
                    chartInstance: state.chartInstance,
                    formatCurrency,
                    renderChart,
                    renderTable,
                    DOM
                });
            };

            document.getElementById(DOM.viewModeId).addEventListener('change', boundUpdateView);
            document.getElementById(DOM.yearSelectorId).addEventListener('change', boundUpdateView);
            
            // Inicia o app
            const TIME_SERIES = 'data/timeSeries.json';
            loadData(TIME_SERIES, (data) => handleDataLoaded(data, {
                processData,
                formatMonthYear,
                setupYearSelector,
                updateView: boundUpdateView,
                state
            }));
        });
