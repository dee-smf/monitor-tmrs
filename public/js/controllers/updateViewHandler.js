export function createUpdateViewHandler({ state, viewCoordinator, formatCurrency }) {
    return function updateViewHandler() {
        state.chartInstance = viewCoordinator.update({
            processedData: state.processedData,
            chartInstance: state.chartInstance,
            formatCurrency
        });
    };
}
