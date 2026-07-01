/**
 * @module model/ViewStrategy
 * Strategy Pattern hierarchy for view-mode data selection.
 *
 * Each strategy knows how to extract the correct data subset,
 * chart type, titles, and year-selector visibility for one view mode.
 * Adding a new view mode requires only a new strategy class
 * and a factory entry — no edits to existing strategy code.
 */

/**
 * DTO (Data Transfer Object) carrying the selected data and metadata
 * needed by the renderers and the ViewCoordinator.
 */
class ViewSelection {
  /**
   * @param {import('../types.js').ViewSelectionOptions} options
   */
  constructor({ displayData, chartType, showYearSelector, chartTitle, tableTitle }) {
    /** @type {import('../types.js').DataPoint[]} */
    this.displayData = displayData;
    /** @type {import('../types.js').ChartType} */
    this.chartType = chartType;
    /** @type {boolean} */
    this.showYearSelector = showYearSelector;
    /** @type {string} */
    this.chartTitle = chartTitle;
    /** @type {string} */
    this.tableTitle = tableTitle;
  }
}

/**
 * Abstract base strategy.
 * @abstract
 */
class ViewStrategy {
  /**
   * Select and configure data for the current view mode.
   * @abstract
   * @param {import('../types.js').ProcessedData} _processedData - All view-mode data sets.
   * @param {number} _selectedYear - Currently selected filter year (used by ytd).
   * @returns {ViewSelection} Configured selection for rendering.
   */
  selectData(_processedData, _selectedYear) {
    throw new Error('Abstract method — subclass must implement');
  }
}

/**
 * Strategy for the "simple" (monthly raw) view mode.
 * Renders a bar chart with all monthly data, no year filter.
 */
class SimpleViewStrategy extends ViewStrategy {
  /**
   * @param {import('../types.js').ProcessedData} processedData
   * @returns {ViewSelection}
   */
  selectData(processedData) {
    return new ViewSelection({
      displayData: processedData.simple,
      chartType: 'bar',
      showYearSelector: false,
      chartTitle: 'Arrecadação e Despesas Mensais',
      tableTitle: 'Extrato Mensal',
    });
  }
}

/**
 * Strategy for the "rolling12" (12-month rolling sum) view mode.
 * Renders a line chart, no year filter.
 */
class Rolling12ViewStrategy extends ViewStrategy {
  /**
   * @param {import('../types.js').ProcessedData} processedData
   * @returns {ViewSelection}
   */
  selectData(processedData) {
    return new ViewSelection({
      displayData: processedData.rolling12,
      chartType: 'line',
      showYearSelector: false,
      chartTitle: 'Acumulado (Últimos 12 Meses)',
      tableTitle: 'Extrato Acumulado (12m)',
    });
  }
}

/**
 * Strategy for the "ytd" (year-to-date cumulative) view mode.
 * Filters data by the selected year, renders a line chart,
 * and makes the year filter visible.
 */
class YtdViewStrategy extends ViewStrategy {
  /**
   * @param {import('../types.js').ProcessedData} processedData
   * @param {number} selectedYear - Year to filter by.
   * @returns {ViewSelection}
   */
  selectData(processedData, selectedYear) {
    const displayData = processedData.ytd.filter(d => d.year === selectedYear);
    return new ViewSelection({
      displayData,
      chartType: 'line',
      showYearSelector: true,
      chartTitle: `Acumulado no Exercício (${selectedYear})`,
      tableTitle: `Extrato do Exercício (${selectedYear})`,
    });
  }
}

/** Strategy registry (singleton instances, keyed by view mode). */
const STRATEGIES = {
  simple: new SimpleViewStrategy(),
  rolling12: new Rolling12ViewStrategy(),
  ytd: new YtdViewStrategy(),
};

/**
 * Static factory that resolves a view-mode string to its strategy instance.
 * New strategies are added here — no other code changes needed.
 */
export class ViewStrategyFactory {
  /**
   * Get the strategy for a given view mode.
   * @param {string} mode - View mode key (e.g., 'simple', 'rolling12', 'ytd').
   * @returns {ViewStrategy} The matching strategy instance.
   */
  static getStrategy(mode) {
    return STRATEGIES[mode];
  }
}
