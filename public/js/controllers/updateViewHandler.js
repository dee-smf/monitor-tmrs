import { boundUpdateView } from './boundUpdateView.js';

export function createUpdateViewHandler({ state, updateView, formatCurrency, renderChart, renderTable, DOM }) {
    return function updateViewHandler() {
        boundUpdateView({ state, updateView, formatCurrency, renderChart, renderTable, DOM });
    };
}
