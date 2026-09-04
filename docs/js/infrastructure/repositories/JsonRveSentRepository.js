import { TimeSeriesRepositoryInterface } from '../../application/TimeSeriesRepositoryInterface.js';
import { TimeSeries } from '../../domain/TimeSeries.js';

export class JsonRveSentRepository extends TimeSeriesRepositoryInterface {
  constructor(path) {
    super(path);
    this._cache = null;
  }

  async load() {
    if (this._cache) return this._cache;
    const response = await fetch(this.path);
    const raw = await response.json();
    this._cache = new TimeSeries(raw);
    return this._cache;
  }

  async lastReportedPeriod() {
    const ts = await this.load();
    if (ts.rows.length === 0) return null;
    return ts.rows[0].period;
  }
}
