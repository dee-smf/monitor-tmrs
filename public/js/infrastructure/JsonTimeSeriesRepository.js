import { TimeSeriesRepository } from '../domain/TimeSeriesRepository.js';
import { TimeSeries } from '../domain/TimeSeries.js';

export class JsonTimeSeriesRepository extends TimeSeriesRepository {
  async load() {
    const response = await fetch(this.path);
    const raw = await response.json();
    return new TimeSeries(raw);
  }
}
