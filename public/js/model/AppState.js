/**
 * @module model/AppState
 * Encapsulates all application state behind getters and setters.
 * No plain object exposed — every property access goes through accessors,
 * making it straightforward to add validation or derivation logic later.
 */
export class AppState {
  constructor() {
    /** @type {import('../types.js').RawDataItem[]} */
    this._rawData = [];
    /** @type {import('../types.js').ProcessedData} */
    this._processedData = { simple: [], rolling12: [], ytd: [] };
    /** @type {number[]} */
    this._availableYears = [];
    /** @type {Chart | null} */
    this._chartInstance = null;
  }

  /** Raw data as loaded from the JSON file. @type {import('../types.js').RawDataItem[]} */
  get rawData() { return this._rawData; }
  set rawData(value) { this._rawData = value; }

  /** Processed data organized by view mode. @type {import('../types.js').ProcessedData} */
  get processedData() { return this._processedData; }
  set processedData(value) { this._processedData = value; }

  /** Distinct years available for filtering (descending). @type {number[]} */
  get availableYears() { return this._availableYears; }
  set availableYears(value) { this._availableYears = value; }

  /** Current Chart.js instance. @type {Chart | null} */
  get chartInstance() { return this._chartInstance; }
  set chartInstance(value) { this._chartInstance = value; }
}
