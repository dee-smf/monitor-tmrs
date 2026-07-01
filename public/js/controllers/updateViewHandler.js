/**
 * @module controllers/updateViewHandler
 * Factory that creates a closure-bound event handler for view changes.
 * Dependencies are injected at creation time; the returned handler
 * reads current state, delegates to ViewCoordinator, and persists the
 * updated chart instance back to AppState.
 */

/**
 * Create an event handler that triggers a full view update.
 * @param {import('../types.js').UpdateViewHandlerDeps} deps
 * @returns {() => void} Handler suitable for change/input event listeners.
 */
export function createUpdateViewHandler({ state, viewCoordinator, formatCurrency }) {
    return function updateViewHandler() {
        state.chartInstance = viewCoordinator.update({
            processedData: state.processedData,
            chartInstance: state.chartInstance,
            formatCurrency
        });
    };
}
