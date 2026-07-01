/**
 * @module types
 * Shared type definitions for the entire application.
 * Used as the single source of truth for JSDoc @typedef entries,
 * simplifying future TypeScript conversion.
 */

/**
 * A raw data item as loaded from timeSeries.json.
 * @typedef {Object} RawDataItem
 * @property {number} period - Period represented as YYYYMM (e.g., 202401).
 * @property {number} revenues - Total revenue for the period in BRL.
 * @property {number} expenses - Total expenses for the period in BRL.
 */

/**
 * A processed (enriched) data point ready for rendering.
 * @typedef {Object} DataPoint
 * @property {Date} date - Parsed Date object derived from the period field.
 * @property {string} label - Human-readable month/year label (e.g., "Jan 2024", "Fev 2024").
 * @property {number} year - Four-digit year extracted from the date.
 * @property {number} revenues - Revenues value in BRL (raw, rolling12, or ytd).
 * @property {number} expenses - Expenses value in BRL (raw, rolling12, or ytd).
 * @property {number} result - Calculated as revenues - expenses in BRL.
 */

/**
 * Container for all three view-mode data sets.
 * @typedef {Object} ProcessedData
 * @property {DataPoint[]} simple - Monthly raw data for the "simple" view.
 * @property {DataPoint[]} rolling12 - 12-month rolling sum for the "rolling12" view.
 * @property {DataPoint[]} ytd - Year-to-date cumulative for the "ytd" view.
 */

/**
 * Result of the data processing step.
 * @typedef {Object} ProcessResult
 * @property {ProcessedData} processedData - The three view-mode data sets.
 * @property {number[]} availableYears - Sorted (descending) array of distinct years found in raw data.
 */

/**
 * Supported Chart.js chart types.
 * @typedef {'bar' | 'line'} ChartType
 */

/**
 * Currency formatting function signature.
 * @callback FormatCurrencyFn
 * @param {number} value - Numeric value in BRL.
 * @returns {string} Formatted BRL string (e.g., "R$ 1.234,56").
 */

/**
 * Date formatting function signature.
 * @callback FormatMonthYearFn
 * @param {Date} date - Date object to format.
 * @returns {string} Human-readable month/year label.
 */

/**
 * Render options passed to ChartRenderer.render().
 * @typedef {Object} ChartRendererOptions
 * @property {Chart | null} chartInstance - Existing Chart.js instance to destroy before re-render.
 * @property {FormatCurrencyFn} formatCurrency - Currency formatter for tooltip callbacks.
 * @property {string} [canvasId='mainChart'] - ID of the canvas element.
 */

/**
 * Render options passed to TableRenderer.render().
 * @typedef {Object} TableRendererOptions
 * @property {FormatCurrencyFn} formatCurrency - Currency formatter for cell values.
 * @property {string} [containerId='tableBody'] - ID of the tbody element.
 */

/**
 * Constructor options for ViewCoordinator.
 * @typedef {Object} ViewCoordinatorOptions
 * @property {typeof ViewStrategyFactory} [strategyFactory] - Strategy factory (defaults to ViewStrategyFactory).
 * @property {FormatCurrencyFn} [formatCurrency] - Currency formatter.
 * @property {ChartRenderer} [chartRenderer] - ChartRenderer instance.
 * @property {TableRenderer} [tableRenderer] - TableRenderer instance.
 */

/**
 * Options passed to ViewCoordinator.update().
 * @typedef {Object} ViewCoordinatorUpdateOptions
 * @property {ProcessedData} processedData - Processed data sets for all view modes.
 * @property {Chart | null} chartInstance - Current Chart.js instance (may be null on first render).
 * @property {FormatCurrencyFn} formatCurrency - Currency formatter.
 */

/**
 * Selected data + rendering configuration produced by a ViewStrategy.
 * @typedef {Object} ViewSelectionOptions
 * @property {DataPoint[]} displayData - The data subset to render.
 * @property {ChartType} chartType - Chart type for the current view mode.
 * @property {boolean} showYearSelector - Whether the year filter should be visible.
 * @property {string} chartTitle - Title displayed above the chart.
 * @property {string} tableTitle - Title displayed above the table.
 */

/**
 * Constructor dependencies for AppController.
 * @typedef {Object} AppControllerDeps
 * @property {DataService} dataService - DataService instance for fetching data.
 * @property {DataProcessor} dataProcessor - DataProcessor instance for transforming data.
 * @property {YearSelector} yearSelector - YearSelector instance for populating the year filter.
 * @property {AppState} state - Shared AppState instance.
 */

/**
 * Dependencies for the createUpdateViewHandler factory.
 * @typedef {Object} UpdateViewHandlerDeps
 * @property {AppState} state - Shared application state.
 * @property {ViewCoordinator} viewCoordinator - View orchestration instance.
 * @property {FormatCurrencyFn} formatCurrency - Currency formatter.
 */

export {};
