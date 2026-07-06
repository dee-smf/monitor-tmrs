import { TimeSeriesRepositoryInterface } from '../application/TimeSeriesRepositoryInterface.js';
import { TimeSeries } from '../domain/TimeSeries.js';

export class JsonTimeSeriesRepository extends TimeSeriesRepositoryInterface {
  async load() {
    const response = await fetch(this.path);
    const raw = await response.json();
    return new TimeSeries(raw);
  }
}
