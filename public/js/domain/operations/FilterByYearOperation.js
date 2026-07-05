import { DataOperation } from '../DataOperation.js';
import { TimeSeriesDto } from '../TimeSeriesDto.js';

export class FilterByYearOperation extends DataOperation {
  constructor(year) {
    super();
    this.year = year;
  }

  execute(dto) {
    const rows = dto.rows.filter(row =>
      new Date(row.period).getFullYear() === this.year
    );
    return new TimeSeriesDto(rows);
  }
}
