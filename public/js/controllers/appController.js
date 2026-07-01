/**
 * Entry point called once raw data is loaded. Seeds the application state,
 * sets up the year selector, and triggers the first view render.
 * @param {Object[]} data - The raw time-series data from the JSON file.
 * @param {Object} services
 * @param {(rawData: Object[], formatMonthYear: (date: Date) => string) => { processedData: Object, availableYears: number[] }} services.processData
 * @param {(date: Date) => string} services.formatMonthYear
 * @param {(years: number[]) => void} services.setupYearSelector
 * @param {() => void} services.updateView
 * @param {Object} services.state - Mutable application state object.
 * @returns {void}
 */
export function handleDataLoaded(data, { processData, formatMonthYear, setupYearSelector, updateView, state }) {
    state.rawData = data;
    const result = processData(state.rawData, formatMonthYear);
    state.processedData = result.processedData;
    state.availableYears = result.availableYears;
    
    setupYearSelector(state.availableYears);
    updateView();
};
