export class AppState {
  constructor() {
    this._rawData = [];
    this._processedData = { simple: [], rolling12: [], ytd: [] };
    this._availableYears = [];
    this._chartInstance = null;
  }

  get rawData() { return this._rawData; }
  set rawData(value) { this._rawData = value; }

  get processedData() { return this._processedData; }
  set processedData(value) { this._processedData = value; }

  get availableYears() { return this._availableYears; }
  set availableYears(value) { this._availableYears = value; }

  get chartInstance() { return this._chartInstance; }
  set chartInstance(value) { this._chartInstance = value; }
}
