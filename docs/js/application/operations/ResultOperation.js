import { DataOperation } from '../../domain/DataOperation.js';
import { TimeSeries } from '../../domain/TimeSeries.js';

export class ResultOperation extends DataOperation {
  execute(dto) {
    const rows = dto.rows.map(row => ({
      ...row,
      result: row.revenues - row.expenses,
    }));
    return new TimeSeries(rows);
  }
}
