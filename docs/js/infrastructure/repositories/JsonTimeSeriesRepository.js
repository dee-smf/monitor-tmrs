import { TimeSeriesRepositoryInterface } from '../../application/TimeSeriesRepositoryInterface.js';
import { TimeSeries } from '../../domain/TimeSeries.js';

export class JsonTimeSeriesRepository extends TimeSeriesRepositoryInterface {
  async load() {
    const response = await fetch(this.path);
    const raw = await response.json();
    const rows = raw.map(row => ({
      ...row,
      expenses: (row.collection ?? 0) + (row.landfill ?? 0),
    }));
    return new TimeSeries(rows);
  }
}
