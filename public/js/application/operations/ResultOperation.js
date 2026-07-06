import { DataOperation } from '../../domain/DataOperation.js';
import { TimeSeriesDto } from '../../domain/TimeSeriesDto.js';

export class ResultOperation extends DataOperation {
  execute(dto) {
    const rows = dto.rows.map(row => ({
      ...row,
      result: row.revenues - row.expenses,
    }));
    return new TimeSeriesDto(rows);
  }
}
