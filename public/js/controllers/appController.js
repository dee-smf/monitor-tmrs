export class AppController {
    constructor({ dataService, dataProcessor, yearSelector, state }) {
        this._dataService = dataService;
        this._dataProcessor = dataProcessor;
        this._yearSelector = yearSelector;
        this._state = state;
    }

    async init(dataPath, formatMonthYear) {
        const data = await this._dataService.load(dataPath);
        this._state.rawData = data;
        const result = this._dataProcessor.process(data, formatMonthYear);
        this._state.processedData = result.processedData;
        this._state.availableYears = result.availableYears;
        this._yearSelector.setup(this._state.availableYears);
    }
}
