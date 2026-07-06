import { TimeSeriesRepository } from '../domain/TimeSeriesRepository.js';
import { TimeSeriesDto } from '../domain/TimeSeriesDto.js';

export class JsonTimeSeriesRepository extends TimeSeriesRepository {
  async load() {
    const response = await fetch(this.path);
    const raw = await response.json();
    return new TimeSeriesDto(raw);
  }
}
