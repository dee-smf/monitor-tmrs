import { DataOperation } from '../../domain/DataOperation.js';
import { TimeSeries } from '../../domain/TimeSeries.js';

export class FilterByYearOperation extends DataOperation {
  constructor(year) {
    super();
    this.year = year;
  }

  execute(dto) {
    if (this.year === null) return dto;
    const rows = dto.rows.filter(row =>
      new Date(row.period).getFullYear() === this.year
    );
    return new TimeSeries(rows);
  }
}
