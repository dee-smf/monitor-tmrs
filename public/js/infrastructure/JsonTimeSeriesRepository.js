import { TimeSeriesRepository } from '../domain/TimeSeriesRepository.js';
import { TimeSeriesDto } from '../domain/TimeSeriesDto.js';

export class JsonTimeSeriesRepository extends TimeSeriesRepository {
  async load(jsonPath) {
    const response = await fetch(jsonPath);
    const raw = await response.json();
    return new TimeSeriesDto(raw);
  }
}
