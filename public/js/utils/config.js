/**
 * @module config
 * Centralized application constants.
 */

/**
 * @typedef {Object} DomIds
 * @property {string} VIEW_MODE - Select element for view mode switching.
 * @property {string} YEAR_SELECTOR_CONTAINER - Container hiding/showing the year filter.
 * @property {string} YEAR_SELECTOR - Select element for year filtering.
 * @property {string} CHART_TITLE - Element displaying the chart title.
 * @property {string} TABLE_TITLE - Element displaying the table title.
 * @property {string} MAIN_CHART - Canvas element for Chart.js.
 * @property {string} TABLE_BODY - Tbody element for data rows.
 */

/**
 * @typedef {Object} BrandColors
 * @property {string} REVENUE - Revenue series fill color.
 * @property {string} REVENUE_BORDER - Revenue series border color.
 * @property {string} EXPENSE - Expense series fill color.
 * @property {string} EXPENSE_BORDER - Expense series border color.
 * @property {string} RESULT - Result series fill color.
 * @property {string} RESULT_BORDER - Result series border color.
 */

/**
 * @typedef {Object} ViewModes
 * @property {string} SIMPLE - Key for the simple (monthly) view.
 * @property {string} ROLLING12 - Key for the 12-month rolling view.
 * @property {string} YTD - Key for the year-to-date view.
 */

/**
 * DOM element ID constants.
 * @type {DomIds}
 */
export const DOM_IDS = {
  VIEW_MODE: 'viewMode',
  YEAR_SELECTOR_CONTAINER: 'yearSelectorContainer',
  YEAR_SELECTOR: 'yearSelector',
  CHART_TITLE: 'chartTitle',
  TABLE_TITLE: 'tableTitle',
  MAIN_CHART: 'mainChart',
  TABLE_BODY: 'tableBody',
};

/**
 * Brand color palette for chart datasets.
 * @type {BrandColors}
 */
export const BRAND_COLORS = {
  REVENUE: 'rgba(34, 197, 94, 0.8)',
  REVENUE_BORDER: 'rgb(21, 128, 61)',
  EXPENSE: 'rgba(239, 68, 68, 0.8)',
  EXPENSE_BORDER: 'rgb(185, 28, 28)',
  RESULT: 'rgba(59, 130, 246, 0.8)',
  RESULT_BORDER: 'rgb(29, 78, 216)',
};

/**
 * View mode keys used by the ViewStrategyFactory.
 * @type {ViewModes}
 */
export const VIEW_MODES = {
  SIMPLE: 'simple',
  ROLLING12: 'rolling12',
  YTD: 'ytd',
};

/**
 * Relative path to the time-series JSON file produced by the ETL pipeline.
 * @type {string}
 */
export const DATA_PATH = 'data/timeSeries.json';
