import { DataOperation } from '../DataOperation.js';
import { TimeSeriesDto } from '../TimeSeriesDto.js';

export class ResultOperation extends DataOperation {
  execute(dto) {
    const rows = dto.rows.map(row => ({
      ...row,
      result: row.revenues - row.expenses,
    }));
    return new TimeSeriesDto(rows);
  }
}
