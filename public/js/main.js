/**
 * @module main
 * Application entrypoint — zero module-level side effects.
 * All instantiation, dependency injection, and event wiring happens
 * inside main(), invoked once the DOM is fully loaded.
 */
import { formatCurrency, formatMonthYear } from './utils/formatters.js';
import { AppState } from './model/AppState.js';
import { DataService } from './services/dataService.js';
import { DataProcessor } from './services/dataProcessor.js';
import { ChartRenderer } from './ui/chartRenderer.js';
import { TableRenderer } from './ui/tableRenderer.js';
import { YearSelector } from './ui/yearSelector.js';
import { ViewCoordinator } from './ui/viewManager.js';
import { AppController } from './controllers/appController.js';
import { createUpdateViewHandler } from './controllers/updateViewHandler.js';
import { DOM_IDS, DATA_PATH } from './utils/config.js';

document.addEventListener('DOMContentLoaded', main);

function main() {
    const state = new AppState();

    const dataService = new DataService();
    const dataProcessor = new DataProcessor();

    const chartRenderer = new ChartRenderer();
    const tableRenderer = new TableRenderer();
    const yearSelector = new YearSelector();
    const viewCoordinator = new ViewCoordinator({ formatCurrency, chartRenderer, tableRenderer });

    const appController = new AppController({ dataService, dataProcessor, yearSelector, state });

    const updateViewHandler = createUpdateViewHandler({ state, viewCoordinator, formatCurrency });

    document.getElementById(DOM_IDS.VIEW_MODE).addEventListener('change', updateViewHandler);
    document.getElementById(DOM_IDS.YEAR_SELECTOR).addEventListener('change', updateViewHandler);

    appController.init(DATA_PATH, formatMonthYear)
        .then(updateViewHandler)
        .catch(console.error);
}
