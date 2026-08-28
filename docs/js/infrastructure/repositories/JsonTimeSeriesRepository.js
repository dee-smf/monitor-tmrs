import { TimeSeriesRepositoryInterface } from '../../application/TimeSeriesRepositoryInterface.js';
import { TimeSeries } from '../../domain/TimeSeries.js';

export class JsonTimeSeriesRepository extends TimeSeriesRepositoryInterface {
  constructor(path) {
    super(path);
    this._cache = null;
  }

  async load() {
    if (this._cache) return this._cache;
    const response = await fetch(this.path);
    const raw = await response.json();
    const rows = raw.map(row => ({
      ...row,
      expenses: (row.collection ?? 0) + (row.landfill ?? 0),
    }));
    this._cache = new TimeSeries(rows);
    return this._cache;
  }
}
