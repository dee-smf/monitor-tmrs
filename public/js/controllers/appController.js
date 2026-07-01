/**
 * @module controllers/appController
 * Orchestrates the application bootstrap sequence:
 * data loading → processing → year-selector setup → state persistence.
 * All side-effectful orchestration is centralized here rather than in main.js.
 */
export class AppController {
    /**
     * @param {import('../types.js').AppControllerDeps} deps
     */
    constructor({ dataService, dataProcessor, yearSelector, state }) {
        this._dataService = dataService;
        this._dataProcessor = dataProcessor;
        this._yearSelector = yearSelector;
        this._state = state;
    }

    /**
     * Bootstrap the application: load data, process it, populate the
     * year selector, and store everything in AppState.
     * @param {string} dataPath - Path to timeSeries.json.
     * @param {import('../types.js').FormatMonthYearFn} formatMonthYear - Date formatter.
     * @returns {Promise<void>}
     */
    async init(dataPath, formatMonthYear) {
        const data = await this._dataService.load(dataPath);
        this._state.rawData = data;
        const result = this._dataProcessor.process(data, formatMonthYear);
        this._state.processedData = result.processedData;
        this._state.availableYears = result.availableYears;
        this._yearSelector.setup(this._state.availableYears);
    }
}
