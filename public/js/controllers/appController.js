export function handleDataLoaded(data, { processData, formatMonthYear, setupYearSelector, updateView, state }) {
    state.rawData = data;
    const result = processData(state.rawData, formatMonthYear);
    state.processedData = result.processedData;
    state.availableYears = result.availableYears;
    
    setupYearSelector(state.availableYears);
    updateView();
};
